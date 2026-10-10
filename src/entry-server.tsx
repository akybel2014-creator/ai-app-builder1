import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import {
  resolvePublicRoute,
  DEFAULT_LOCALE,
  type PublicLocale,
  type PublicPageKey,
} from './lib/i18n';
import {
  buildPublicMetadata,
  buildAdminMetadata,
  type HeadMetadata,
} from './lib/seo';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHeadTags(meta: HeadMetadata): string {
  const lines: string[] = [];
  lines.push(`<title>${escapeHtml(meta.title)}</title>`);
  lines.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
  lines.push(`<meta name="robots" content="${escapeHtml(meta.robots)}" />`);
  lines.push(`<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`);

  for (const alt of meta.alternates) {
    lines.push(
      `<link rel="alternate" hreflang="${escapeHtml(alt.hreflang)}" href="${escapeHtml(alt.href)}" />`,
    );
  }

  lines.push(`<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`);
  lines.push(`<meta property="og:site_name" content="AI App Builder" />`);
  lines.push(`<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
  lines.push(`<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  lines.push(`<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`);
  lines.push(`<meta property="og:locale" content="${escapeHtml(meta.ogLocale)}" />`);

  for (const ogAlt of meta.ogAlternateLocales) {
    lines.push(`<meta property="og:locale:alternate" content="${escapeHtml(ogAlt)}" />`);
  }

  lines.push(`<meta property="og:image" content="https://bolt.new/static/og_default.png" />`);
  lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
  lines.push(`<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`);
  lines.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
  lines.push(`<meta name="twitter:image" content="https://bolt.new/static/og_default.png" />`);

  for (const schema of meta.jsonLd) {
    lines.push(
      `<script type="application/ld+json" data-seo-jsonld="true">${JSON.stringify(schema)}</script>`,
    );
  }

  return lines.join('\n    ');
}

export function renderRouteHtml(pathname: string, baseUrl: string): {
  statusCode: number;
  htmlLang: string;
  headHtml: string;
  appHtml: string;
  isAdmin: boolean;
} {
  const resolved = resolvePublicRoute(pathname);

  if (!resolved) {
    const fallbackLocale: PublicLocale = DEFAULT_LOCALE;
    const fallbackPage: PublicPageKey = 'home';
    const meta = buildPublicMetadata(baseUrl, fallbackLocale, fallbackPage);
    const appHtml = renderToString(
      <App initialPathname="/it/" baseUrl={baseUrl} />,
    );
    return {
      statusCode: 404,
      htmlLang: meta.htmlLang,
      headHtml: renderHeadTags(meta),
      appHtml,
      isAdmin: false,
    };
  }

  if (resolved.isAdmin || resolved.isWorkspace) {
    const meta = buildAdminMetadata(
      baseUrl,
      resolved.isWorkspace ? 'Area Cliente e Workspace' : undefined,
    );
    const appHtml = renderToString(
      <App initialPathname={pathname} baseUrl={baseUrl} />,
    );
    return {
      statusCode: 200,
      htmlLang: 'it',
      headHtml: renderHeadTags(meta),
      appHtml,
      isAdmin: true,
    };
  }

  const meta = buildPublicMetadata(baseUrl, resolved.locale, resolved.page);
  const appHtml = renderToString(
    <App initialPathname={pathname} baseUrl={baseUrl} />,
  );

  return {
    statusCode: 200,
    htmlLang: meta.htmlLang,
    headHtml: renderHeadTags(meta),
    appHtml,
    isAdmin: false,
  };
}
