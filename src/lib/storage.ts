import type { Project, AppSettings, ActivityLogEntry } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

const DEFAULT_SETTINGS: AppSettings = {
  ai: {
    provider: '',
    apiKey: '',
    model: '',
    endpoint: '',
  },
  github: {
    username: '',
    token: '',
  },
  theme: {
    accentColor: 'blue',
    sidebarStyle: 'navy',
  },
};

export function sanitizeInstructionText(rawText: string): string {
  // Never store API keys, GitHub tokens, Bearer tokens, or raw HTML/source code payloads in activity logs
  return rawText
    .replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{16,}\b/g, '[TOKEN_GITHUB_OMESSO]')
    .replace(/\bgithub_pat_[A-Za-z0-9_]{16,}\b/g, '[TOKEN_GITHUB_OMESSO]')
    .replace(/\bAIza[0-9A-Za-z_-]{20,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/\bgsk_[A-Za-z0-9_-]{16,}\b/g, '[CHIAVE_API_OMESSA]')
    .replace(/<!DOCTYPE\s+html[\s\S]*/gi, '[CODICE_SORGENTE_OMESSO]')
    .replace(/<html[\s\S]*?<\/html>/gi, '[CODICE_SORGENTE_OMESSO]');
}

export function computeCodeVersionReference(project: Project): string {
  // Deterministic version identifier referencing the project state & generated code revision without exposing source code
  const revNumber = project.instructions.length + (project.status === 'generated' ? 1 : 0);
  const stateTag = project.status === 'generated' ? 'gen' : 'draft';
  const basis = `${project.id}:${project.status}:${project.instructions.length}:${
    project.previewHtml ? project.previewHtml.length : 0
  }:${project.updatedAt}`;

  let hash = 2166136261;
  for (let i = 0; i < basis.length; i++) {
    hash ^= basis.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const shortChecksum = (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7);
  return `v1.${revNumber}-${stateTag}.${shortChecksum}`;
}

export function isExportActivityEntry(entry: ActivityLogEntry): boolean {
  const rawType = (entry.type || '').toUpperCase();
  const rawActivityType = (entry.activityType || '').toUpperCase();
  return (
    rawType === 'EXPORT' ||
    rawType === 'EXPORT_PROJECT' ||
    rawActivityType === 'EXPORT' ||
    rawActivityType === 'EXPORT_PROJECT' ||
    entry.status === 'exported'
  );
}

export function getScopedStorageKey(baseKey: string, userId?: string): string {
  if (!userId || !userId.trim()) return baseKey;
  return `${baseKey}:${userId.trim()}`;
}

/**
 * Resolves synchronization conflicts between a local project and an incoming remote project.
 * Never overwrites a project belonging to a different owner, and preserves newer local edits
 * based on validated ISO timestamps and instruction revision count.
 */
export function resolveProjectSyncConflict(
  localProject: Project | undefined,
  remoteProject: Project,
  expectedOwnerId: string,
): Project | null {
  const remoteOwner = remoteProject.userId || 'admin-it';
  if (remoteOwner !== expectedOwnerId) {
    return null;
  }

  if (!localProject) {
    return {
      ...remoteProject,
      userId: expectedOwnerId,
      codeVersion: remoteProject.codeVersion || computeCodeVersionReference(remoteProject),
    };
  }

  const localOwner = localProject.userId || 'admin-it';
  if (localOwner !== expectedOwnerId) {
    return null;
  }

  const localTime = Date.parse(localProject.updatedAt || localProject.createdAt || '');
  const remoteTime = Date.parse(remoteProject.updatedAt || remoteProject.createdAt || '');

  const localValid = !Number.isNaN(localTime);
  const remoteValid = !Number.isNaN(remoteTime);

  if (localValid && remoteValid) {
    if (localTime > remoteTime) {
      return localProject;
    }
    if (remoteTime > localTime) {
      return {
        ...remoteProject,
        userId: expectedOwnerId,
        codeVersion: remoteProject.codeVersion || computeCodeVersionReference(remoteProject),
      };
    }
  }

  // Tie-breaker when timestamps are equal or unparseable: prefer the copy with more instructions or generated HTML
  const localRev =
    (localProject.instructions?.length || 0) + (localProject.previewHtml ? 1 : 0);
  const remoteRev =
    (remoteProject.instructions?.length || 0) + (remoteProject.previewHtml ? 1 : 0);

  if (localRev >= remoteRev) {
    return localProject;
  }

  return {
    ...remoteProject,
    userId: expectedOwnerId,
    codeVersion: remoteProject.codeVersion || computeCodeVersionReference(remoteProject),
  };
}

function normalizeProjectList(parsed: unknown, filterUserId?: string): Project[] {
  if (!Array.isArray(parsed)) return [];
  return (parsed as Project[])
    .filter((p) => {
      if (!p || typeof p.id !== 'string' || typeof p.name !== 'string') return false;
      if (filterUserId) {
        const owner = p.userId || 'admin-it';
        return owner === filterUserId;
      }
      return true;
    })
    .map((p) => {
      const normalized: Project = {
        ...p,
        userId: p.userId || filterUserId || 'admin-it',
        description: typeof p.description === 'string' ? p.description : '',
        type: p.type || 'webapp',
        status: p.status || 'draft',
        instructions: Array.isArray(p.instructions) ? p.instructions : [],
        previewHtml: typeof p.previewHtml === 'string' ? p.previewHtml : null,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
      };
      return {
        ...normalized,
        codeVersion: normalized.codeVersion || computeCodeVersionReference(normalized),
      };
    });
}

export function loadProjects(userId?: string): Project[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    if (userId) {
      const scopedKey = getScopedStorageKey(STORAGE_KEYS.PROJECTS, userId);
      const scopedRaw = window.localStorage.getItem(scopedKey);
      if (scopedRaw) {
        const scopedParsed = JSON.parse(scopedRaw);
        return normalizeProjectList(scopedParsed, userId);
      }
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeProjectList(parsed, userId);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[], userId?: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (userId) {
      const scopedProjects = projects.filter((p) => (p.userId || 'admin-it') === userId);
      const scopedKey = getScopedStorageKey(STORAGE_KEYS.PROJECTS, userId);
      window.localStorage.setItem(scopedKey, JSON.stringify(scopedProjects));

      // Non-destructively preserve other users' records in the legacy shared key while updating only this user's slice
      const existingSharedRaw = window.localStorage.getItem(STORAGE_KEYS.PROJECTS);
      let otherUsersProjects: Project[] = [];
      if (existingSharedRaw) {
        try {
          const parsedShared = JSON.parse(existingSharedRaw);
          if (Array.isArray(parsedShared)) {
            otherUsersProjects = (parsedShared as Project[]).filter(
              (p) => p && typeof p.id === 'string' && (p.userId || 'admin-it') !== userId,
            );
          }
        } catch {
          otherUsersProjects = [];
        }
      }
      window.localStorage.setItem(
        STORAGE_KEYS.PROJECTS,
        JSON.stringify([...scopedProjects, ...otherUsersProjects]),
      );
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Errore nel salvataggio dei progetti:', e);
  }
}

export function loadActivityLogs(userId?: string): {
  logs: ActivityLogEntry[];
  error: string | null;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { logs: [], error: null };
  }
  try {
    const filterValid = (parsed: unknown): ActivityLogEntry[] => {
      if (!Array.isArray(parsed)) return [];
      return (parsed as ActivityLogEntry[]).filter((item) => {
        if (
          !item ||
          typeof item.id !== 'string' ||
          typeof item.projectId !== 'string' ||
          typeof item.instructionText !== 'string' ||
          item.instructionText.trim().length === 0 ||
          typeof item.timestamp !== 'string'
        ) {
          return false;
        }
        if (userId) {
          return (item.userId || 'admin-it') === userId;
        }
        return true;
      });
    };

    if (userId) {
      const scopedKey = getScopedStorageKey(STORAGE_KEYS.ACTIVITY_LOGS, userId);
      const scopedRaw = window.localStorage.getItem(scopedKey);
      if (scopedRaw) {
        const scopedParsed = JSON.parse(scopedRaw);
        if (!Array.isArray(scopedParsed)) {
          return { logs: [], error: 'Formato della cronologia attività non valido.' };
        }
        return { logs: filterValid(scopedParsed), error: null };
      }
    }

    const raw = window.localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!raw) return { logs: [], error: null };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { logs: [], error: 'Formato della cronologia attività non valido.' };
    }
    return { logs: filterValid(parsed), error: null };
  } catch {
    return {
      logs: [],
      error: 'Impossibile leggere la cronologia attività locale dal browser.',
    };
  }
}

export function saveActivityLogs(logs: ActivityLogEntry[], userId?: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (userId) {
      const scopedLogs = logs.filter((l) => (l.userId || 'admin-it') === userId);
      const scopedKey = getScopedStorageKey(STORAGE_KEYS.ACTIVITY_LOGS, userId);
      window.localStorage.setItem(scopedKey, JSON.stringify(scopedLogs));

      const existingSharedRaw = window.localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      let otherUsersLogs: ActivityLogEntry[] = [];
      if (existingSharedRaw) {
        try {
          const parsedShared = JSON.parse(existingSharedRaw);
          if (Array.isArray(parsedShared)) {
            otherUsersLogs = (parsedShared as ActivityLogEntry[]).filter(
              (l) => l && typeof l.id === 'string' && (l.userId || 'admin-it') !== userId,
            );
          }
        } catch {
          otherUsersLogs = [];
        }
      }
      window.localStorage.setItem(
        STORAGE_KEYS.ACTIVITY_LOGS,
        JSON.stringify([...scopedLogs, ...otherUsersLogs]),
      );
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Errore nel salvataggio della cronologia attività:', e);
  }
}

export function serializeSettingsForStorage(settings: AppSettings): AppSettings {
  // Never persist GitHub Personal Access Tokens in localStorage
  return {
    ai: {
      provider: settings.ai?.provider || '',
      apiKey: settings.ai?.apiKey || '',
      model: settings.ai?.model || '',
      endpoint: settings.ai?.endpoint || '',
    },
    github: {
      username: settings.github?.username || '',
      token: '',
    },
    theme: {
      accentColor: settings.theme?.accentColor || 'blue',
      sidebarStyle: settings.theme?.sidebarStyle || 'navy',
    },
  };
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const loaded: AppSettings = {
      ai: { ...DEFAULT_SETTINGS.ai, ...parsed.ai },
      github: {
        username: typeof parsed.github?.username === 'string' ? parsed.github.username : '',
        // Always scrub any previously stored GitHub token from memory and storage
        token: '',
      },
      theme: {
        accentColor: parsed.theme?.accentColor || 'blue',
        sidebarStyle: parsed.theme?.sidebarStyle || 'navy',
      },
    };
    // If legacy storage contained a persisted GitHub token, overwrite it immediately with the scrubbed version
    if (parsed?.github?.token) {
      window.localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(serializeSettingsForStorage(loaded)),
      );
    }
    return loaded;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const safeSettings = serializeSettingsForStorage(settings);
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(safeSettings));
  } catch (e) {
    console.error('Errore nel salvataggio delle impostazioni:', e);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

