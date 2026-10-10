export type ProjectType =
  | 'website'
  | 'web-app'
  | 'landing-page'
  | 'ecommerce'
  | 'dashboard'
  | 'portfolio'
  | 'blog'
  | 'other';

export type ProjectStatus = 'draft' | 'generating' | 'generated' | 'error';

export type ActivityStatus = 'recorded' | 'generating' | 'generated' | 'exported' | 'error';

export type ActivityType = 'instruction' | 'INSTRUCTION' | 'export' | 'EXPORT' | 'EXPORT_PROJECT';

export type ActivityLogFilter = 'ALL' | 'INSTRUCTION' | 'EXPORT';

export interface Instruction {
  id: string;
  text: string;
  timestamp: string;
  status?: ActivityStatus;
  projectId?: string;
  projectName?: string;
  userId?: string;
}

export interface ActivityLogEntry {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  instructionText: string;
  timestamp: string;
  status: ActivityStatus;
  type?: 'EXPORT' | 'EXPORT_PROJECT' | 'INSTRUCTION';
  activityType?: ActivityType;
  codeVersion?: string;
}

export interface ProjectConnector {
  id: string;
  notes?: string;
}

export interface Project {
  id: string;
  userId?: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  instructions: Instruction[];
  connectors?: ProjectConnector[];
  previewHtml: string | null;
  codeVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export type AIProvider = 'managed' | 'gemini' | 'openai' | 'anthropic' | 'groq' | 'custom' | '';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint: string;
}

export interface GitHubSettings {
  username: string;
  token: string;
}

export type ThemeAccent = 'blue' | 'indigo' | 'violet' | 'emerald';

export interface ThemeSettings {
  accentColor: ThemeAccent;
  sidebarStyle: 'navy' | 'slate';
}

export interface AppSettings {
  ai: AISettings;
  github: GitHubSettings;
  theme?: ThemeSettings;
}

export type ViewType = 'dashboard' | 'editor' | 'settings';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'projects'
  | 'providers'
  | 'credits'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface AdminOverviewUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  planId: string | null;
  billingPeriod: string | null;
  projectCount: number;
}

export interface AdminOverviewPlan {
  id: string;
  name: string;
  tier: 'free' | 'paid';
  monthlyAmount: number | null;
  users: number;
}

export interface AdminOverview {
  stats: {
    usersTotal: number;
    usersVerified: number;
    subscriptionsActive: number;
    projectsTotal: number;
    projectsByStatus: Record<'draft' | 'generating' | 'generated' | 'error', number>;
    instructionsTotal: number;
  };
  users: AdminOverviewUser[];
  plans: AdminOverviewPlan[];
  projectsByType: Array<{ type: string; count: number }>;
  recentProjects: Array<{
    id: string;
    name: string;
    type: string;
    ownerName: string;
    status: string;
    updatedAt: string;
  }>;
}
