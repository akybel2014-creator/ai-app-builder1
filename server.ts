import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  getPublicPath,
  type PublicPageKey,
} from './src/lib/i18n.ts';
import {
  TRUSTED_PLANS,
  PLAN_ORDER,
  resolveTrustedPlanSelection,
  type PlanId,
  type BillingPeriod,
} from './src/lib/plans.ts';
import { renderRouteHtml } from './src/entry-server.tsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Active admin sessions in memory (HttpOnly cookie verification)
const activeAdminSessions = new Set<string>();
const ADMIN_COOKIE_NAME = 'ai_app_builder_admin_session';
const USER_COOKIE_NAME = 'ai_app_builder_user_session';
const ACTIVITY_LOG_FILE = path.resolve(__dirname, '.data', 'activity-logs.json');
const USERS_FILE = path.resolve(__dirname, '.data', 'users.json');
const PROJECTS_FILE = path.resolve(__dirname, '.data', 'projects.json');

interface ServerProjectRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  status: 'draft' | 'generating' | 'generated' | 'error';
  instructions: Array<{
    id: string;
    text: string;
    timestamp: string;
    status?: string;
    projectId?: string;
    projectName?: string;
    userId?: string;
  }>;
  previewHtml: string | null;
  codeVersion?: string;
  createdAt: string;
  updatedAt: string;
}

function readServerProjects(): ServerProjectRecord[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) return [];
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ServerProjectRecord[]) : [];
  } catch {
    return [];
  }
}

function writeServerProjects(projects: ServerProjectRecord[]): void {
  try {
    const dir = path.dirname(PROJECTS_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist server projects:', e);
  }
}

interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: string;
  activeSubscription?: {
    planId: PlanId;
    billingPeriod: BillingPeriod;
    priceIdentifier: string;
    status: 'active';
    activatedAt: string;
  };
}

// Active user sessions in memory -> userId
const activeUserSessions = new Map<string, string>();

function readServerUsers(): ServerUserRecord[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ServerUserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeServerUsers(users: ServerUserRecord[]): void {
  try {
    const dir = path.dirname(USERS_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist server users:', e);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getAuthenticatedUser(req: Request): ServerUserRecord | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[USER_COOKIE_NAME];
  if (!token) return null;
  const userId = activeUserSessions.get(token);
  if (!userId) return null;
  const users = readServerUsers();
  return users.find((u) => u.id === userId) || null;
}

interface ServerActivityRecord {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  instructionText: string;
  timestamp: string;
  status: 'recorded' | 'generating' | 'generated' | 'exported' | 'error';
  type?: 'EXPORT' | 'EXPORT_PROJECT' | 'INSTRUCTION';
  activityType?: 'instruction' | 'INSTRUCTION' | 'export' | 'EXPORT' | 'EXPORT_PROJECT';
  codeVersion?: string;
}

function sanitizeServerText(rawText: string): string {
  return rawText
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g, '[TOKEN_GITHUB_OMESSO]')
    .replace(/\bgithub_pat_[A-Za-z0-9_]{16,}\b/g, '[TOKEN_GITHUB_OMESSO]')
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/\bgsk_[A-Za-z0-9_-]{16,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/<!DOCTYPE\s+html[\s\S]*/gi, '[CODICE_SORGENTE_OMESSO]')
    .replace(/<html[\s\S]*?<\/html>/gi, '[CODICE_SORGENTE_OMESSO]');
}

// Server-side rate limiting for AI generation requests (sliding window per authenticated principal/IP)
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AI_RATE_LIMIT_MAX_REQUESTS = 10;
const aiRateLimitBuckets = new Map<string, number[]>();

export function checkServerRateLimit(
  bucketKey: string,
  maxRequests: number = AI_RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = AI_RATE_LIMIT_WINDOW_MS,
  nowMs: number = Date.now(),
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const existing = aiRateLimitBuckets.get(bucketKey) || [];
  const activeTimestamps = existing.filter((t) => nowMs - t < windowMs);
  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0] || nowMs;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (nowMs - oldest)) / 1000));
    aiRateLimitBuckets.set(bucketKey, activeTimestamps);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }
  activeTimestamps.push(nowMs);
  aiRateLimitBuckets.set(bucketKey, activeTimestamps);
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, maxRequests - activeTimestamps.length),
  };
}

export function validateAiGenerationInput(body: unknown): {
  valid: boolean;
  errorCode?: string;
  error?: string;
  sanitizedProject?: {
    name: string;
    description: string;
    type: string;
    instructions: Array<{ text: string }>;
  };
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, errorCode: 'INVALID_PAYLOAD', error: 'Payload richiesta non valido.' };
  }
  const project = (body as { project?: unknown }).project;
  if (!project || typeof project !== 'object') {
    return { valid: false, errorCode: 'MISSING_PROJECT', error: 'Dati progetto mancanti.' };
  }

  const p = project as Record<string, unknown>;
  const name = typeof p.name === 'string' ? p.name.trim() : '';
  const description = typeof p.description === 'string' ? p.description.trim() : '';
  const type = typeof p.type === 'string' ? p.type.trim() : 'web-app';
  const rawInstructions = Array.isArray(p.instructions) ? p.instructions : [];

  if (name.length < 2 || name.length > 60) {
    return {
      valid: false,
      errorCode: 'INVALID_PROJECT_NAME_SIZE',
      error: 'Il nome del progetto deve essere compreso tra 2 e 60 caratteri.',
    };
  }
  if (description.length > 2000) {
    return {
      valid: false,
      errorCode: 'DESCRIPTION_TOO_LONG',
      error: 'La descrizione del progetto supera il limite massimo di 2.000 caratteri.',
    };
  }
  if (rawInstructions.length > 50) {
    return {
      valid: false,
      errorCode: 'TOO_MANY_INSTRUCTIONS',
      error: 'Il numero di istruzioni supera il limite massimo consentito (50).',
    };
  }

  const sanitizedInstructions: Array<{ text: string }> = [];
  let totalChars = name.length + description.length;

  for (const item of rawInstructions) {
    const text =
      item && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string'
        ? ((item as { text: string }).text || '').trim()
        : '';
    if (!text) continue;
    if (text.length > 1000) {
      return {
        valid: false,
        errorCode: 'INSTRUCTION_TOO_LONG',
        error: 'Una delle istruzioni supera il limite massimo di 1.000 caratteri.',
      };
    }
    totalChars += text.length;
    if (totalChars > 16000) {
      return {
        valid: false,
        errorCode: 'PROMPT_SIZE_LIMIT_EXCEEDED',
        error: 'La dimensione complessiva del prompt supera il limite massimo di sicurezza (16.000 caratteri).',
      };
    }
    sanitizedInstructions.push({ text });
  }

  return {
    valid: true,
    sanitizedProject: {
      name,
      description,
      type: type.slice(0, 32),
      instructions: sanitizedInstructions,
    },
  };
}

function readServerActivityLogs(): ServerActivityRecord[] {
  try {
    if (!fs.existsSync(ACTIVITY_LOG_FILE)) return [];
    const raw = fs.readFileSync(ACTIVITY_LOG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ServerActivityRecord[]) : [];
  } catch {
    return [];
  }
}

function writeServerActivityLogs(records: ServerActivityRecord[]): void {
  try {
    const dir = path.dirname(ACTIVITY_LOG_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ACTIVITY_LOG_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist server activity logs:', e);
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = decodeURIComponent(pair.slice(idx + 1).trim());
      result[k] = v;
    }
  }
  return result;
}

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto =
    typeof protoHeader === 'string'
      ? protoHeader.split(',')[0].trim()
      : req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function generateSitemapXml(baseUrl: string): string {
  const pages: PublicPageKey[] = ['home', 'product', 'useCases', 'pricing', 'faq'];
  const lastmod = '2026-10-09';
  const urlBlocks: string[] = [];

  for (const page of pages) {
    for (const locale of SUPPORTED_LOCALES) {
      const locUrl = `${baseUrl}${getPublicPath(locale, page)}`;
      const xhtmlLinks = SUPPORTED_LOCALES.map((altLoc) => {
        const altHref = `${baseUrl}${getPublicPath(altLoc, page)}`;
        return `    <xhtml:link rel="alternate" hreflang="${LOCALE_LABELS[altLoc].hreflang}" href="${altHref}" />`;
      });
      const xDefaultHref = `${baseUrl}${getPublicPath(DEFAULT_LOCALE, page)}`;
      xhtmlLinks.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`,
      );

      const priority = page === 'pricing' ? '1.0' : '0.8';
      urlBlocks.push(
        [
          '  <url>',
          `    <loc>${locUrl}</loc>`,
          `    <lastmod>${lastmod}</lastmod>`,
          '    <changefreq>weekly</changefreq>',
          `    <priority>${priority}</priority>`,
          ...xhtmlLinks,
          '  </url>',
        ].join('\n'),
      );
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urlBlocks,
    '</urlset>',
  ].join('\n');
}

function generateRobotsTxt(baseUrl: string): string {
  return [
    '# AI App Builder — Search Engine & AI Crawler Policy',
    '# Public localized documentation pages (/it/, /en/, /de/, /fr/) are open to search and AI crawlers.',
    '# Private owner/admin (/admin), customer workspace (/workspace), and API routes (/api/) are non-indexable and auth-protected.',
    '',
    'User-agent: *',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    'Disallow: /api/',
    '',
    '# Explicit rules for major search & generative AI crawlers (GEO / AIO / LLMO transparency)',
    'User-agent: Googlebot',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    'User-agent: Google-Extended',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    'User-agent: GPTBot',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    'User-agent: ClaudeBot',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    'User-agent: PerplexityBot',
    'Allow: /it/',
    'Allow: /en/',
    'Allow: /de/',
    'Allow: /fr/',
    'Disallow: /admin',
    'Disallow: /workspace',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // 0. Public User Registration, Login, Session & Trusted Plan Checkout APIs
  app.get('/api/plans', (_req: Request, res: Response) => {
    const plans = PLAN_ORDER.map((id) => TRUSTED_PLANS[id]);
    res.json({
      plans,
      paymentProviderConfigured: false,
      missingPaymentConfig: [
        'STRIPE_SECRET_KEY / Payment provider server secret key',
        'STRIPE_WEBHOOK_SECRET / Signed webhook verification endpoint',
        'Commercial price IDs for Pro and Team plans in billing provider',
      ],
    });
  });

  app.post('/api/plans/validate', (req: Request, res: Response) => {
    // Strictly validate planId and period against trusted server configuration.
    // Any price, discount, or entitlement supplied by the browser is ignored.
    const { planId, billingPeriod } = req.body || {};
    const validation = resolveTrustedPlanSelection(planId, billingPeriod);
    if (!validation.valid || !validation.plan || !validation.selection) {
      res.status(400).json({
        valid: false,
        errorCode: validation.errorCode || 'INVALID_PLAN_ID',
        error: 'The selected plan ID is missing or not recognized by the server configuration.',
      });
      return;
    }

    const { plan, selection } = validation;
    res.json({
      valid: true,
      selection,
      verifiedPlan: {
        id: plan.id,
        tier: plan.tier,
        isConfigurablePlaceholder: plan.isConfigurablePlaceholder,
        currency: plan.currency,
        verifiedAmount: plan.pricing[selection.billingPeriod].amount,
        verifiedPriceIdentifier: selection.priceIdentifier,
        entitlements: plan.entitlements,
      },
      paymentProviderConfigured: false,
    });
  });

  app.get('/api/auth/session', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.json({ authenticated: false, user: null });
      return;
    }
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        activeSubscription: user.activeSubscription || null,
      },
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const planId = req.body?.planId;
    const billingPeriod = req.body?.billingPeriod;

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({
        errorCode: 'INVALID_NAME',
        error: 'Name must be between 2 and 80 characters.',
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        errorCode: 'INVALID_EMAIL',
        error: 'Please provide a valid email address.',
      });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({
        errorCode: 'WEAK_PASSWORD',
        error: 'Password must be at least 8 characters long.',
      });
      return;
    }

    const users = readServerUsers();
    if (users.some((u) => u.email === email)) {
      res.status(409).json({
        errorCode: 'EMAIL_EXISTS',
        error: 'An account with this email already exists. Please log in.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const newUser: ServerUserRecord = {
      id: `usr_${crypto.randomBytes(10).toString('hex')}`,
      name,
      email,
      passwordSalt: salt,
      passwordHash,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const validatedPlan = planId ? resolveTrustedPlanSelection(planId, billingPeriod) : null;
    let activeSubscription = newUser.activeSubscription || null;

    // If the visitor selected the Free plan ('free-byok'), activate it immediately upon registration
    if (validatedPlan?.valid && validatedPlan.plan?.tier === 'free' && validatedPlan.selection) {
      activeSubscription = {
        planId: validatedPlan.plan.id,
        billingPeriod: validatedPlan.selection.billingPeriod,
        priceIdentifier: validatedPlan.selection.priceIdentifier,
        status: 'active' as const,
        activatedAt: new Date().toISOString(),
      };
      newUser.activeSubscription = activeSubscription;
    }

    users.push(newUser);
    writeServerUsers(users);

    const sessionToken = crypto.randomBytes(24).toString('hex');
    activeUserSessions.set(sessionToken, newUser.id);
    res.setHeader(
      'Set-Cookie',
      `${USER_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    );

    res.status(201).json({
      authenticated: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        activeSubscription,
      },
      preservedPlan: validatedPlan?.valid ? validatedPlan.selection : null,
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const planId = req.body?.planId;
    const billingPeriod = req.body?.billingPeriod;

    if (!email || !password) {
      res.status(400).json({
        errorCode: 'MISSING_CREDENTIALS',
        error: 'Email and password are required.',
      });
      return;
    }

    const users = readServerUsers();
    const userIdx = users.findIndex((u) => u.email === email);
    const user = userIdx !== -1 ? users[userIdx] : null;
    if (!user) {
      res.status(401).json({
        errorCode: 'INVALID_CREDENTIALS',
        error: 'Invalid email or password.',
      });
      return;
    }

    const candidateHash = hashPassword(password, user.passwordSalt);
    if (candidateHash !== user.passwordHash) {
      res.status(401).json({
        errorCode: 'INVALID_CREDENTIALS',
        error: 'Invalid email or password.',
      });
      return;
    }

    const validatedPlan = planId ? resolveTrustedPlanSelection(planId, billingPeriod) : null;
    if (
      validatedPlan?.valid &&
      validatedPlan.plan?.tier === 'free' &&
      validatedPlan.selection &&
      !user.activeSubscription
    ) {
      user.activeSubscription = {
        planId: validatedPlan.plan.id,
        billingPeriod: validatedPlan.selection.billingPeriod,
        priceIdentifier: validatedPlan.selection.priceIdentifier,
        status: 'active' as const,
        activatedAt: new Date().toISOString(),
      };
      users[userIdx] = user;
      writeServerUsers(users);
    }

    const sessionToken = crypto.randomBytes(24).toString('hex');
    activeUserSessions.set(sessionToken, user.id);
    res.setHeader(
      'Set-Cookie',
      `${USER_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    );

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        activeSubscription: user.activeSubscription || null,
      },
      preservedPlan: validatedPlan?.valid ? validatedPlan.selection : null,
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[USER_COOKIE_NAME];
    if (token) {
      activeUserSessions.delete(token);
    }
    res.setHeader(
      'Set-Cookie',
      `${USER_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    res.json({ authenticated: false });
  });

  app.post('/api/checkout/session', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        errorCode: 'AUTH_REQUIRED',
        error: 'Authentication is required before proceeding to checkout.',
      });
      return;
    }

    // Never trust client-supplied prices, discounts, or entitlements.
    const { planId, billingPeriod } = req.body || {};
    const validation = resolveTrustedPlanSelection(planId, billingPeriod);
    if (!validation.valid || !validation.plan || !validation.selection) {
      res.status(400).json({
        errorCode: validation.errorCode || 'INVALID_PLAN_ID',
        error: 'Invalid or missing plan selection.',
      });
      return;
    }

    const { plan, selection } = validation;

    // Prevent duplicate subscription activation if already subscribed to the same active plan
    if (
      user.activeSubscription &&
      user.activeSubscription.status === 'active' &&
      user.activeSubscription.planId === plan.id &&
      user.activeSubscription.billingPeriod === selection.billingPeriod
    ) {
      res.status(409).json({
        errorCode: 'DUPLICATE_SUBSCRIPTION',
        error: 'This plan is already active on your account.',
        subscription: user.activeSubscription,
      });
      return;
    }

    // Paid plans require verified payment confirmation from a configured payment provider
    if (plan.tier === 'paid') {
      res.status(422).json({
        activated: false,
        paymentProviderConfigured: false,
        errorCode: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
        error:
          'Payment setup is required. No payment provider is configured on the server; paid subscriptions cannot be activated without verified payment confirmation.',
        missingConfiguration: [
          'Server-side payment provider integration (e.g. Stripe SDK & STRIPE_SECRET_KEY)',
          'Official server-side price identifiers for paid tiers',
          'Signed webhook endpoint (/api/webhooks/payment) to verify payment completion before activating entitlements',
        ],
      });
      return;
    }

    // Free plan ('free-byok') has verified price 0 EUR and can be activated for the authenticated user
    const users = readServerUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    const activeSubscription = {
      planId: plan.id,
      billingPeriod: selection.billingPeriod,
      priceIdentifier: selection.priceIdentifier,
      status: 'active' as const,
      activatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      users[idx].activeSubscription = activeSubscription;
      writeServerUsers(users);
    }

    res.json({
      activated: true,
      subscription: activeSubscription,
      entitlements: plan.entitlements,
    });
  });

  // 1. Admin Authentication & Session Endpoints (Protected, Non-Indexable)
  app.get('/api/admin/session', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];

    if (token && activeAdminSessions.has(token)) {
      res.json({
        authenticated: true,
        customPasswordConfigured: false,
        locale: 'it',
      });
      return;
    }

    res.json({
      authenticated: false,
      customPasswordConfigured: false,
      locale: 'it',
    });
  });

  app.post('/api/admin/login', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const submitted = typeof req.body?.passphrase === 'string' ? req.body.passphrase.trim() : '';
    const customExpected = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';

    // Se ADMIN_PASSWORD e' impostata, e' l'unica credenziale valida.
    // Il login demo ("admin" / vuoto) e' consentito solo fuori produzione e senza password configurata.
    const demoAllowed = !isProduction && customExpected.length === 0;
    const passwordMatches =
      customExpected.length > 0 &&
      submitted.length === customExpected.length &&
      crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(customExpected));
    const valid = passwordMatches || (demoAllowed && (submitted === 'admin' || submitted === ''));

    if (!valid) {
      res.status(401).json({
        authenticated: false,
        error: 'Credenziali non valide. Verifica la chiave di accesso amministratore.',
      });
      return;
    }

    const sessionToken = crypto.randomBytes(24).toString('hex');
    activeAdminSessions.add(sessionToken);

    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE_NAME}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isProduction ? '; Secure' : ''}`,
    );
    res.json({ authenticated: true, locale: 'it' });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (token) {
      activeAdminSessions.delete(token);
    }
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );
    res.json({ authenticated: false });
  });

  // 1b. Protected Activity Log Backend Endpoints (enforces authenticated admin session)
  app.get('/api/admin/activity-logs', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({
        error: 'Non autorizzato. Effettua l\'accesso amministratore per visualizzare la cronologia attività.',
      });
      return;
    }

    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId.trim() : '';
    const allLogs = readServerActivityLogs();
    const userLogs = allLogs.filter((entry) => entry.userId === 'admin-it');
    const filtered = projectId
      ? userLogs.filter((entry) => entry.projectId === projectId)
      : userLogs;

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ logs: filtered });
  });

  app.post('/api/admin/activity-logs', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({
        error: 'Non autorizzato. Sessione amministratore richiesta per registrare attività.',
      });
      return;
    }

    const {
      id,
      projectId,
      projectName,
      instructionText,
      timestamp,
      status,
      type,
      activityType,
      codeVersion,
    } = req.body || {};
    if (
      typeof id !== 'string' ||
      !id.trim() ||
      typeof projectId !== 'string' ||
      !projectId.trim() ||
      typeof instructionText !== 'string' ||
      !instructionText.trim()
    ) {
      res.status(400).json({ error: 'Parametri attività mancanti o istruzione vuota.' });
      return;
    }

    const isExportRecord =
      type === 'EXPORT' ||
      type === 'EXPORT_PROJECT' ||
      activityType === 'EXPORT' ||
      activityType === 'EXPORT_PROJECT' ||
      activityType === 'export' ||
      status === 'exported';
    const sanitizedText = sanitizeServerText(instructionText.trim());
    const allLogs = readServerActivityLogs();

    // Idempotency / duplicate prevention by ID
    const existingIdx = allLogs.findIndex((item) => item.id === id.trim());
    const record: ServerActivityRecord = {
      id: id.trim(),
      projectId: projectId.trim(),
      projectName: typeof projectName === 'string' && projectName.trim() ? projectName.trim() : 'Progetto',
      userId: 'admin-it',
      instructionText: sanitizedText,
      timestamp: typeof timestamp === 'string' && timestamp ? timestamp : new Date().toISOString(),
      status:
        status === 'generating' ||
        status === 'generated' ||
        status === 'exported' ||
        status === 'error'
          ? status
          : isExportRecord
            ? 'exported'
            : 'recorded',
      type:
        type === 'EXPORT_PROJECT'
          ? 'EXPORT_PROJECT'
          : isExportRecord
            ? 'EXPORT'
            : 'INSTRUCTION',
      activityType:
        activityType === 'EXPORT_PROJECT'
          ? 'EXPORT_PROJECT'
          : isExportRecord
            ? 'EXPORT'
            : 'instruction',
      ...(typeof codeVersion === 'string' && codeVersion.trim()
        ? { codeVersion: sanitizeServerText(codeVersion.trim()).slice(0, 64) }
        : {}),
    };

    if (existingIdx >= 0) {
      allLogs[existingIdx] = record;
    } else {
      allLogs.unshift(record);
    }

    writeServerActivityLogs(allLogs);
    res.status(201).json({ log: record });
  });

  app.patch('/api/admin/activity-logs/project/:projectId', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({ error: 'Non autorizzato.' });
      return;
    }

    const targetProjectId = req.params.projectId;
    const nextStatus = req.body?.status;
    if (
      nextStatus !== 'recorded' &&
      nextStatus !== 'generating' &&
      nextStatus !== 'generated' &&
      nextStatus !== 'exported' &&
      nextStatus !== 'error'
    ) {
      res.status(400).json({ error: 'Stato non valido.' });
      return;
    }

    const allLogs = readServerActivityLogs();
    let updatedCount = 0;
    const updatedLogs = allLogs.map((item) => {
      if (
        item.projectId === targetProjectId &&
        item.userId === 'admin-it' &&
        item.type !== 'EXPORT' &&
        item.type !== 'EXPORT_PROJECT' &&
        item.activityType !== 'EXPORT' &&
        item.activityType !== 'EXPORT_PROJECT' &&
        item.activityType !== 'export' &&
        item.status !== 'exported'
      ) {
        updatedCount++;
        return { ...item, status: nextStatus };
      }
      return item;
    });

    if (updatedCount > 0) {
      writeServerActivityLogs(updatedLogs);
    }
    res.json({ updated: updatedCount });
  });

  // 1c. Protected Customer Activity Log Endpoints (enforces authenticated customer session and strict user.id isolation)
  app.get('/api/user/activity-logs', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        error: 'Authentication required to access your activity log.',
      });
      return;
    }

    const projectId = typeof req.query.projectId === 'string' ? req.query.projectId.trim() : '';
    const allLogs = readServerActivityLogs();
    // Strictly filter by the authenticated customer's own user.id
    const userLogs = allLogs.filter((entry) => entry.userId === user.id);
    const filtered = projectId
      ? userLogs.filter((entry) => entry.projectId === projectId)
      : userLogs;

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json({ logs: filtered });
  });

  app.post('/api/user/activity-logs', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({
        error: 'Authentication required to record project activity.',
      });
      return;
    }

    const {
      id,
      projectId,
      projectName,
      instructionText,
      timestamp,
      status,
      type,
      activityType,
      codeVersion,
    } = req.body || {};
    if (
      typeof id !== 'string' ||
      !id.trim() ||
      typeof projectId !== 'string' ||
      !projectId.trim() ||
      typeof instructionText !== 'string' ||
      !instructionText.trim()
    ) {
      res.status(400).json({ error: 'Missing activity parameters or empty instruction.' });
      return;
    }

    const isExportRecord =
      type === 'EXPORT' ||
      type === 'EXPORT_PROJECT' ||
      activityType === 'EXPORT' ||
      activityType === 'EXPORT_PROJECT' ||
      activityType === 'export' ||
      status === 'exported';
    const sanitizedText = sanitizeServerText(instructionText.trim());
    const allLogs = readServerActivityLogs();

    const existingIdx = allLogs.findIndex(
      (item) => item.id === id.trim() && item.userId === user.id,
    );
    const record: ServerActivityRecord = {
      id: id.trim(),
      projectId: projectId.trim(),
      projectName:
        typeof projectName === 'string' && projectName.trim() ? projectName.trim() : 'Progetto',
      // Always enforce the server-verified user.id, ignoring any client-supplied userId
      userId: user.id,
      instructionText: sanitizedText,
      timestamp: typeof timestamp === 'string' && timestamp ? timestamp : new Date().toISOString(),
      status:
        status === 'generating' ||
        status === 'generated' ||
        status === 'exported' ||
        status === 'error'
          ? status
          : isExportRecord
            ? 'exported'
            : 'recorded',
      type:
        type === 'EXPORT_PROJECT'
          ? 'EXPORT_PROJECT'
          : isExportRecord
            ? 'EXPORT'
            : 'INSTRUCTION',
      activityType:
        activityType === 'EXPORT_PROJECT'
          ? 'EXPORT_PROJECT'
          : isExportRecord
            ? 'EXPORT'
            : 'instruction',
      ...(typeof codeVersion === 'string' && codeVersion.trim()
        ? { codeVersion: sanitizeServerText(codeVersion.trim()).slice(0, 64) }
        : {}),
    };

    if (existingIdx >= 0) {
      allLogs[existingIdx] = record;
    } else {
      allLogs.unshift(record);
    }

    writeServerActivityLogs(allLogs);
    res.status(201).json({ log: record });
  });

  app.patch('/api/user/activity-logs/project/:projectId', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const targetProjectId = req.params.projectId;
    const nextStatus = req.body?.status;
    if (
      nextStatus !== 'recorded' &&
      nextStatus !== 'generating' &&
      nextStatus !== 'generated' &&
      nextStatus !== 'exported' &&
      nextStatus !== 'error'
    ) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }

    const allLogs = readServerActivityLogs();
    let updatedCount = 0;
    const updatedLogs = allLogs.map((item) => {
      if (
        item.projectId === targetProjectId &&
        item.userId === user.id &&
        item.type !== 'EXPORT' &&
        item.type !== 'EXPORT_PROJECT' &&
        item.activityType !== 'EXPORT' &&
        item.activityType !== 'EXPORT_PROJECT' &&
        item.activityType !== 'export' &&
        item.status !== 'exported'
      ) {
        updatedCount++;
        return { ...item, status: nextStatus };
      }
      return item;
    });

    if (updatedCount > 0) {
      writeServerActivityLogs(updatedLogs);
    }
    res.json({ updated: updatedCount });
  });

  // 1d. Cloud & Server Project Sync Endpoints (/api/user/projects and /api/admin/projects)
  app.get('/api/user/projects', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const allProjects = readServerProjects();
    const userProjects = allProjects.filter((p) => p.userId === user.id);
    userProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json({ projects: userProjects });
  });

  app.post('/api/user/projects', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const proj = req.body;
    if (!proj || typeof proj.id !== 'string' || typeof proj.name !== 'string') {
      res.status(400).json({ error: 'Invalid project payload.' });
      return;
    }
    const allProjects = readServerProjects();
    const existingIdx = allProjects.findIndex((p) => p.id === proj.id && p.userId === user.id);
    const incomingTime = Date.parse(typeof proj.updatedAt === 'string' ? proj.updatedAt : '');
    if (existingIdx >= 0) {
      const existingTime = Date.parse(allProjects[existingIdx].updatedAt || '');
      if (!Number.isNaN(existingTime) && !Number.isNaN(incomingTime) && incomingTime < existingTime) {
        // Do not overwrite a newer server record with a stale payload
        res.status(200).json({ project: allProjects[existingIdx], keptNewerServerCopy: true });
        return;
      }
    }
    const record: ServerProjectRecord = {
      id: proj.id.trim().slice(0, 128),
      // Strictly enforce authenticated server user.id, never trusting client-supplied userId
      userId: user.id,
      name: proj.name.trim().slice(0, 60),
      description: typeof proj.description === 'string' ? proj.description.slice(0, 2000) : '',
      type: typeof proj.type === 'string' ? proj.type : 'website',
      status:
        proj.status === 'generating' || proj.status === 'generated' || proj.status === 'error'
          ? proj.status
          : 'draft',
      instructions: Array.isArray(proj.instructions) ? proj.instructions : [],
      previewHtml: typeof proj.previewHtml === 'string' ? proj.previewHtml.slice(0, 250000) : null,
      codeVersion: typeof proj.codeVersion === 'string' ? proj.codeVersion.slice(0, 64) : 'v1.0',
      createdAt: typeof proj.createdAt === 'string' ? proj.createdAt : new Date().toISOString(),
      updatedAt:
        !Number.isNaN(incomingTime) && typeof proj.updatedAt === 'string'
          ? proj.updatedAt
          : new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      allProjects[existingIdx] = record;
    } else {
      allProjects.unshift(record);
    }
    writeServerProjects(allProjects);
    res.status(201).json({ project: record });
  });

  app.delete('/api/user/projects/:projectId', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const projectId = req.params.projectId;
    const allProjects = readServerProjects();
    const filtered = allProjects.filter((p) => !(p.id === projectId && p.userId === user.id));
    writeServerProjects(filtered);

    // Consistently remove associated activity logs for this deleted project so they never reappear
    const allLogs = readServerActivityLogs();
    const filteredLogs = allLogs.filter(
      (entry) => !(entry.projectId === projectId && entry.userId === user.id),
    );
    if (filteredLogs.length !== allLogs.length) {
      writeServerActivityLogs(filteredLogs);
    }

    res.json({ deleted: true });
  });

  app.get('/api/admin/projects', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({ error: 'Non autorizzato.' });
      return;
    }
    const allProjects = readServerProjects();
    const adminProjects = allProjects.filter((p) => p.userId === 'admin-it');
    adminProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    res.json({ projects: adminProjects });
  });

  app.post('/api/admin/projects', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({ error: 'Non autorizzato.' });
      return;
    }
    const proj = req.body;
    if (!proj || typeof proj.id !== 'string' || typeof proj.name !== 'string') {
      res.status(400).json({ error: 'Parametri progetto non validi.' });
      return;
    }
    const allProjects = readServerProjects();
    const existingIdx = allProjects.findIndex((p) => p.id === proj.id && p.userId === 'admin-it');
    const incomingTime = Date.parse(typeof proj.updatedAt === 'string' ? proj.updatedAt : '');
    if (existingIdx >= 0) {
      const existingTime = Date.parse(allProjects[existingIdx].updatedAt || '');
      if (!Number.isNaN(existingTime) && !Number.isNaN(incomingTime) && incomingTime < existingTime) {
        res.status(200).json({ project: allProjects[existingIdx], keptNewerServerCopy: true });
        return;
      }
    }
    const record: ServerProjectRecord = {
      id: proj.id.trim().slice(0, 128),
      userId: 'admin-it',
      name: proj.name.trim().slice(0, 60),
      description: typeof proj.description === 'string' ? proj.description.slice(0, 2000) : '',
      type: typeof proj.type === 'string' ? proj.type : 'website',
      status:
        proj.status === 'generating' || proj.status === 'generated' || proj.status === 'error'
          ? proj.status
          : 'draft',
      instructions: Array.isArray(proj.instructions) ? proj.instructions : [],
      previewHtml: typeof proj.previewHtml === 'string' ? proj.previewHtml.slice(0, 250000) : null,
      codeVersion: typeof proj.codeVersion === 'string' ? proj.codeVersion.slice(0, 64) : 'v1.0',
      createdAt: typeof proj.createdAt === 'string' ? proj.createdAt : new Date().toISOString(),
      updatedAt:
        !Number.isNaN(incomingTime) && typeof proj.updatedAt === 'string'
          ? proj.updatedAt
          : new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      allProjects[existingIdx] = record;
    } else {
      allProjects.unshift(record);
    }
    writeServerProjects(allProjects);
    res.status(201).json({ project: record });
  });

  app.delete('/api/admin/projects/:projectId', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (!token || !activeAdminSessions.has(token)) {
      res.status(401).json({ error: 'Non autorizzato.' });
      return;
    }
    const projectId = req.params.projectId;
    const allProjects = readServerProjects();
    const filtered = allProjects.filter((p) => !(p.id === projectId && p.userId === 'admin-it'));
    writeServerProjects(filtered);

    // Consistently remove associated activity logs for this deleted admin project
    const allLogs = readServerActivityLogs();
    const filteredLogs = allLogs.filter(
      (entry) => !(entry.projectId === projectId && entry.userId === 'admin-it'),
    );
    if (filteredLogs.length !== allLogs.length) {
      writeServerActivityLogs(filteredLogs);
    }

    res.json({ deleted: true });
  });

  // 1e. Hardened AI Generation Endpoint (/api/ai/generate)
  // - Managed server-side GEMINI_API_KEY is strictly restricted to authenticated administrators.
  // - Ordinary customer accounts must use BYOK until server-enforced quotas and paid entitlements are configured.
  // - Never silently returns fallback HTML as a successful AI response.
  app.post('/api/ai/generate', async (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    const cookies = parseCookies(req.headers.cookie);
    const adminToken = cookies[ADMIN_COOKIE_NAME];
    const isAdminSession = Boolean(adminToken && activeAdminSessions.has(adminToken));

    if (!user && !isAdminSession) {
      res.status(401).json({
        errorCode: 'AUTH_REQUIRED',
        error: 'Autenticazione richiesta per utilizzare il generatore IA.',
      });
      return;
    }

    // Enforce sliding-window server-side rate limit per authenticated principal
    const principalKey = isAdminSession ? `admin:${adminToken}` : `user:${user?.id || req.ip}`;
    const rateStatus = checkServerRateLimit(principalKey);
    res.setHeader('X-RateLimit-Remaining', String(rateStatus.remaining));
    if (!rateStatus.allowed) {
      res.setHeader('Retry-After', String(rateStatus.retryAfterSeconds));
      res.status(429).json({
        errorCode: 'RATE_LIMIT_EXCEEDED',
        error: `Limite di richieste IA raggiunto. Riprova tra ${rateStatus.retryAfterSeconds} secondi.`,
        retryAfterSeconds: rateStatus.retryAfterSeconds,
      });
      return;
    }

    // Validate project payload and enforce strict input-size limits
    const inputValidation = validateAiGenerationInput(req.body);
    if (!inputValidation.valid || !inputValidation.sanitizedProject) {
      res.status(400).json({
        errorCode: inputValidation.errorCode || 'INVALID_INPUT',
        error: inputValidation.error || 'Dati di input non validi.',
      });
      return;
    }

    const { sanitizedProject } = inputValidation;
    const { aiSettings } = req.body || {};

    const customProvider = typeof aiSettings?.provider === 'string' ? aiSettings.provider.trim() : '';
    const customApiKey = typeof aiSettings?.apiKey === 'string' ? aiSettings.apiKey.trim() : '';
    const customModel = typeof aiSettings?.model === 'string' ? aiSettings.model.trim() : '';
    const customEndpoint = typeof aiSettings?.endpoint === 'string' ? aiSettings.endpoint.trim() : '';

    const isManagedRequest = customProvider === 'managed' || !customApiKey;

    // Security Gate: Managed AI generation using the server's GEMINI_API_KEY is disabled for ordinary customer accounts
    if (isManagedRequest && !isAdminSession) {
      res.status(403).json({
        errorCode: 'MANAGED_AI_RESTRICTED_TO_ADMIN',
        error:
          'La generazione IA tramite proxy gestito dal server non è abilitata per gli account cliente finché non saranno configurati i limiti di quota e la fatturazione. Configura una tua chiave API personale (BYOK) nelle Impostazioni.',
      });
      return;
    }

    const instructionsList = sanitizedProject.instructions
      .map((inst, i) => `${i + 1}. ${inst.text}`)
      .join('\n');

    const systemPrompt = [
      'Sei un Senior Frontend Architect e Designer UI/UX.',
      'Genera un file HTML5 singolo, completo, moderno, responsivo e interattivo (con CSS moderno o Tailwind CDN e JavaScript vanilla integrato) per l\'applicazione richiesta.',
      'Restituisci ESCLUSIVAMENTE il codice HTML completo che inizia con <!DOCTYPE html> e termina con </html>, senza blocchi markdown ```html.',
    ].join(' ');

    const userPrompt = [
      `Nome Progetto: ${sanitizedProject.name}`,
      `Categoria: ${sanitizedProject.type}`,
      `Descrizione: ${sanitizedProject.description}`,
      instructionsList ? `Istruzioni iterative:\n${instructionsList}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      // Case 1: Custom BYOK for OpenAI / Groq / Custom OpenAI-compatible
      if (customApiKey && (customProvider === 'openai' || customProvider === 'groq' || customProvider === 'custom')) {
        const targetUrl =
          customEndpoint ||
          (customProvider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : 'https://api.openai.com/v1/chat/completions');
        const modelName =
          customModel || (customProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customApiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.4,
          }),
        });

        if (!resp.ok) {
          const errText = sanitizeServerText(await resp.text());
          res.status(resp.status).json({
            errorCode: 'BYOK_PROVIDER_ERROR',
            error: `Errore dal provider ${customProvider.toUpperCase()}: ${errText.slice(0, 200)}`,
          });
          return;
        }

        const json = (await resp.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const rawHtml = json.choices?.[0]?.message?.content || '';
        const cleanedHtml = rawHtml
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        if (!cleanedHtml || !cleanedHtml.includes('<')) {
          res.status(502).json({
            errorCode: 'EMPTY_AI_RESPONSE',
            error: 'Il provider IA ha restituito una risposta vuota o non valida.',
          });
          return;
        }

        res.json({
          html: cleanedHtml,
          provider: customProvider,
          mode: 'byok',
        });
        return;
      }

      // Case 2: Custom BYOK for Anthropic
      if (customApiKey && customProvider === 'anthropic') {
        const targetUrl = customEndpoint || 'https://api.anthropic.com/v1/messages';
        const modelName = customModel || 'claude-3-5-sonnet-20241022';

        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': customApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (!resp.ok) {
          const errText = sanitizeServerText(await resp.text());
          res.status(resp.status).json({
            errorCode: 'BYOK_PROVIDER_ERROR',
            error: `Errore da Anthropic: ${errText.slice(0, 200)}`,
          });
          return;
        }

        const json = (await resp.json()) as {
          content?: Array<{ text?: string }>;
        };
        const rawHtml = json.content?.[0]?.text || '';
        const cleanedHtml = rawHtml
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        if (!cleanedHtml || !cleanedHtml.includes('<')) {
          res.status(502).json({
            errorCode: 'EMPTY_AI_RESPONSE',
            error: 'Il provider Anthropic ha restituito una risposta vuota o non valida.',
          });
          return;
        }

        res.json({
          html: cleanedHtml,
          provider: 'anthropic',
          mode: 'byok',
        });
        return;
      }

      // Case 3: Gemini BYOK (any authenticated user) or Admin Managed Backend Proxy (admin session only)
      const isGeminiByok = customProvider === 'gemini' && Boolean(customApiKey);
      const effectiveGeminiKey = isGeminiByok
        ? customApiKey
        : isAdminSession
          ? process.env.GEMINI_API_KEY || ''
          : '';

      if (!effectiveGeminiKey) {
        res.status(503).json({
          errorCode: 'AI_KEY_NOT_CONFIGURED',
          error: isAdminSession
            ? 'GEMINI_API_KEY non è configurata sull\'ambiente server. Configura la variabile d\'ambiente sul server oppure inserisci una chiave API BYOK nelle Impostazioni.'
            : 'Chiave API mancante. Configura la tua chiave API personale (BYOK) nelle Impostazioni.',
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey: effectiveGeminiKey });
      const modelToUse =
        (isGeminiByok || isAdminSession) && customModel ? customModel : 'gemini-2.5-flash';

      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });

      const rawHtml = response.text || '';
      const cleanedHtml = rawHtml
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      if (!cleanedHtml || !cleanedHtml.includes('<')) {
        res.status(502).json({
          errorCode: 'EMPTY_AI_RESPONSE',
          error: 'Il modello Gemini non ha restituito codice HTML valido.',
        });
        return;
      }

      res.json({
        html: cleanedHtml,
        provider: 'gemini',
        mode: isGeminiByok ? 'byok' : 'managed-admin',
      });
    } catch (err) {
      const safeMessage = sanitizeServerText(
        err instanceof Error ? err.message : 'Errore imprevisto durante la generazione IA.',
      );
      res.status(502).json({
        errorCode: 'AI_GENERATION_FAILED',
        error: `Generazione IA non riuscita: ${safeMessage.slice(0, 200)}`,
      });
    }
  });

  // 1f. Direct GitHub Repository Export Endpoint (/api/github/export)
  // Temporarily disabled until per-user GitHub OAuth flow is configured.
  // Never uses a shared server token or browser-persisted PAT to publish to arbitrary repositories.
  app.post('/api/github/export', (req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const user = getAuthenticatedUser(req);
    const cookies = parseCookies(req.headers.cookie);
    const adminToken = cookies[ADMIN_COOKIE_NAME];
    const isAdminSession = Boolean(adminToken && activeAdminSessions.has(adminToken));

    if (!user && !isAdminSession) {
      res.status(401).json({
        errorCode: 'AUTH_REQUIRED',
        error: 'Autenticazione richiesta.',
      });
      return;
    }

    res.status(503).json({
      success: false,
      errorCode: 'GITHUB_OAUTH_NOT_CONFIGURED',
      error:
        'L\'esportazione diretta su repository GitHub è temporaneamente disabilitata per motivi di sicurezza: l\'autenticazione OAuth GitHub individuale lato server non è ancora configurata. I token personali non vengono salvati nel browser né condivisi sul server. Puoi esportare e scaricare il pacchetto completo del progetto tramite il pulsante "Esporta".',
    });
  });

  // 2. SEO Sitemap XML & Robots.txt
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const xml = generateSitemapXml(baseUrl);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  });

  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const txt = generateRobotsTxt(baseUrl);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(txt);
  });

  // 3. Canonical redirects for bare locale paths (/it -> /it/)
  app.use((req: Request, res: Response, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const rawPath = req.originalUrl.split('?')[0];
    for (const loc of SUPPORTED_LOCALES) {
      if (rawPath === `/${loc}`) {
        res.redirect(301, `/${loc}/`);
        return;
      }
    }
    next();
  });

  let vite: Awaited<ReturnType<typeof import('vite')['createServer']>> | null = null;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        index: false,
      }),
    );
  }

  // 4. SSR Prerendering Handler for all Public and Admin routes
  app.use(async (req: Request, res: Response, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    try {
      const url = req.originalUrl.split('?')[0];
      const baseUrl = getBaseUrl(req);

      let template = '';
      if (!isProduction && vite) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const prodIndex = path.resolve(__dirname, 'dist', 'index.html');
        template = fs.readFileSync(
          fs.existsSync(prodIndex) ? prodIndex : path.resolve(__dirname, 'index.html'),
          'utf-8',
        );
      }

      const rendered = renderRouteHtml(url, baseUrl);

      if (rendered.isAdmin) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        res.setHeader('Cache-Control', 'no-store, private');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }

      const html = template
        .replace('<html lang="it">', `<html lang="${rendered.htmlLang}">`)
        .replace(
          /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/,
          `<!--seo-head-start-->\n    ${rendered.headHtml}\n    <!--seo-head-end-->`,
        )
        .replace('<!--app-html-->', rendered.appHtml);

      res.status(rendered.statusCode).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
    } catch (err) {
      if (!isProduction && vite && err instanceof Error) {
        vite.ssrFixStacktrace(err);
      }
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI App Builder server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
