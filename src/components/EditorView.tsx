import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Project, ActivityLogEntry, ActivityLogFilter, AppSettings } from '@/types';
import { PROJECT_TYPE_LABELS } from '@/lib/constants';
import { computeCodeVersionReference, isExportActivityEntry } from '@/lib/storage';
import { showToast } from '@/lib/toast';
import ActivityLog from '@/components/ActivityLog';
import ConnectorsPanel from '@/components/ConnectorsPanel';
import { sanitizeConnectors } from '@/lib/connectors';
import {
  ArrowLeft,
  Send,
  Download,
  Github,
  Eye,
  Code2,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Zap,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Keyboard,
  Filter,
  X,
  FileText,
  Lock,
  Plug,
} from 'lucide-react';

interface EditorViewProps {
  project: Project;
  settings?: AppSettings;
  activityLogs?: ActivityLogEntry[];
  activityLoading?: boolean;
  activityError?: string | null;
  aiConfigured: boolean;
  githubConfigured: boolean;
  onBack: () => void;
  onAddInstruction: (projectId: string, text: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onExport: (project: Project) => void;
  onExportLogEntry?: (
    projectOrId: Project | string,
    versionIdentifier: string,
  ) => ActivityLogEntry | null;
  onGoToSettings: () => void;
  onOpenShortcuts?: () => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type RightPanelTab = 'preview' | 'code' | 'connectors';

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anteprima</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color: #0f172a;
    }
    .container {
      text-align: center;
      padding: 3rem;
      max-width: 500px;
    }
    .icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: white;
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 0.75rem;
    }
    p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      font-size: 0.875rem;
      color: #0891b2;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">&#9889;</div>
    <h1>Il tuo progetto &egrave; pronto</h1>
    <p>Configura un modello IA per generare l'anteprima della tua applicazione. Nel frattempo, puoi aggiungere istruzioni per definire i dettagli.</p>
    <span class="badge">In attesa di generazione</span>
  </div>
</body>
</html>`;

export default function EditorView({
  project,
  settings,
  activityLogs,
  activityLoading = false,
  activityError = null,
  aiConfigured,
  onBack,
  onAddInstruction,
  onUpdateProject,
  onExport,
  onGoToSettings,
  onOpenShortcuts,
}: EditorViewProps) {
  const [instruction, setInstruction] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityLogFilter>('ALL');
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<{
    fileName: string;
    versionId: string;
    timestamp: string;
  } | null>(null);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [activeTab, setActiveTab] = useState<RightPanelTab>('preview');
  const [generating, setGenerating] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exportSuccessTimerRef.current) {
        clearTimeout(exportSuccessTimerRef.current);
      }
    };
  }, []);

  const previewHtml = project.previewHtml ?? PLACEHOLDER_HTML;
  const currentVersionId = project.codeVersion || computeCodeVersionReference(project);

  // Fallback to project.instructions if activityLogs prop not passed
  const effectiveEntries: ActivityLogEntry[] = useMemo(
    () =>
      activityLogs ??
      project.instructions.map((inst) => ({
        id: inst.id,
        projectId: project.id,
        projectName: project.name,
        userId: inst.userId || 'admin-it',
        instructionText: inst.text,
        timestamp: inst.timestamp,
        status:
          inst.status ||
          (project.status === 'generated'
            ? 'generated'
            : project.status === 'generating'
              ? 'generating'
              : project.status === 'error'
                ? 'error'
                : 'recorded'),
        type: 'INSTRUCTION',
        activityType: 'instruction',
      })),
    [activityLogs, project.instructions, project.id, project.name, project.status],
  );

  // Entries strictly authorized for the current project
  const projectAuthorizedEntries = useMemo(
    () =>
      effectiveEntries.filter(
        (e) =>
          e &&
          e.projectId === project.id &&
          typeof e.instructionText === 'string' &&
          e.instructionText.trim().length > 0,
      ),
    [effectiveEntries, project.id],
  );

  const filterCounts = useMemo(() => {
    let instructionCount = 0;
    let exportCount = 0;
    for (const entry of projectAuthorizedEntries) {
      if (isExportActivityEntry(entry)) {
        exportCount++;
      } else {
        instructionCount++;
      }
    }
    return {
      ALL: projectAuthorizedEntries.length,
      INSTRUCTION: instructionCount,
      EXPORT: exportCount,
    };
  }, [projectAuthorizedEntries]);

  const filteredEntries = useMemo(() => {
    if (activityFilter === 'ALL') return projectAuthorizedEntries;
    if (activityFilter === 'EXPORT') {
      return projectAuthorizedEntries.filter((entry) => isExportActivityEntry(entry));
    }
    return projectAuthorizedEntries.filter((entry) => !isExportActivityEntry(entry));
  }, [projectAuthorizedEntries, activityFilter]);

  const handleSendInstruction = () => {
    const text = instruction.trim();
    if (!text) return;
    onAddInstruction(project.id, text);
    setInstruction('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendInstruction();
    }
  };

  const handleGenerate = useCallback(async () => {
    if (generating) return;
    if (!aiConfigured) {
      onGoToSettings();
      return;
    }

    setGenerating(true);
    onUpdateProject(project.id, { status: 'generating' });

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            type: project.type,
            instructions: project.instructions,
            connectors: project.connectors ?? [],
          },
          aiSettings: settings?.ai,
        }),
      });

      const data = (await res.json()) as {
        html?: string;
        error?: string;
        mode?: string;
      };

      if (!res.ok || !data.html) {
        onUpdateProject(project.id, { status: 'error' });
        showToast('error', data.error || 'Errore durante la generazione IA.');
      } else {
        onUpdateProject(project.id, {
          status: 'generated',
          previewHtml: data.html,
        });
        showToast(
          'success',
          data.mode === 'managed-admin'
            ? 'Applicazione generata tramite Proxy Backend IA (Amministratore)!'
            : 'Applicazione generata con successo!',
        );
        setIframeKey((k) => k + 1);
        setActiveTab('preview');
      }
    } catch {
      onUpdateProject(project.id, { status: 'error' });
      showToast(
        'error',
        'Errore di connessione durante la chiamata al generatore IA. Nessun codice generato.',
      );
    } finally {
      setGenerating(false);
    }
  }, [generating, aiConfigured, onGoToSettings, onUpdateProject, project, settings?.ai]);

  const handleConfirmExport = useCallback(() => {
    const versionId = project.codeVersion || computeCodeVersionReference(project);
    const fileName = `${project.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    setExportConfirmOpen(false);
    // onExport (exportProjectCode) downloads the file, creates the single EXPORT log entry, and shows the single toast notification
    onExport(project);
    setExportSuccessInfo({
      fileName,
      versionId,
      timestamp: new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    });
    if (exportSuccessTimerRef.current) {
      clearTimeout(exportSuccessTimerRef.current);
    }
    exportSuccessTimerRef.current = setTimeout(() => {
      setExportSuccessInfo(null);
    }, 6000);
  }, [project, onExport]);

  const handleRequestExport = useCallback(() => {
    setExportConfirmOpen(true);
  }, []);

  // Editor keyboard shortcuts (Alt+G, Alt+P, Alt+D, Alt+R, Alt+E, Escape)
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && exportConfirmOpen) {
        e.preventDefault();
        setExportConfirmOpen(false);
        return;
      }
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'g') {
        e.preventDefault();
        handleGenerate();
      } else if (key === 'p') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'preview' ? 'code' : 'preview'));
      } else if (key === 'd') {
        e.preventDefault();
        setDevice((prev) =>
          prev === 'desktop' ? 'tablet' : prev === 'tablet' ? 'mobile' : 'desktop',
        );
      } else if (key === 'r') {
        e.preventDefault();
        setIframeKey((k) => k + 1);
      } else if (key === 'e') {
        e.preventDefault();
        handleRequestExport();
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [handleGenerate, handleRequestExport, exportConfirmOpen]);

  const deviceWidths: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const deviceIcons: Record<PreviewDevice, typeof Monitor> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const filterOptions: { id: ActivityLogFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'Tutte le attività', count: filterCounts.ALL },
    { id: 'INSTRUCTION', label: 'INSTRUCTION', count: filterCounts.INSTRUCTION },
    { id: 'EXPORT', label: 'EXPORT', count: filterCounts.EXPORT },
  ];

  return (
    <div className="h-screen flex flex-col lg:flex-row pb-16 lg:pb-0 overflow-hidden">
      {/* Left panel — Project View, Activity Log & Instruction Input */}
      <div className="w-full lg:w-[420px] lg:flex-shrink-0 glass-strong border-r border-surface-800/60 flex flex-col h-[50vh] lg:h-full">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-surface-800/60 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-surface-800/60 hover:bg-surface-700/60 text-surface-400 hover:text-surface-200 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-surface-800/60 text-surface-400 font-medium">
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
              <StatusBadge status={project.status} />
              <span
                className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-800/60 text-surface-400 border border-surface-700/60"
                title="Versione corrente del codice progetto"
              >
                {currentVersionId}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-surface-800/60">
          <p className="text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wide">
            Descrizione
          </p>
          <p className="text-sm text-surface-300 leading-relaxed">{project.description}</p>
        </div>

        {/* Activity Log Filter Control (All activity / INSTRUCTION / EXPORT) */}
        <div className="px-4 py-2.5 border-b border-surface-800/60 bg-surface-900/40">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              <Filter className="w-3 h-3 text-accent-400" />
              <span>Filtra cronologia</span>
            </span>
            {activityFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActivityFilter('ALL')}
                className="text-[11px] font-medium text-accent-400 hover:text-accent-300 transition-colors"
              >
                Mostra tutte
              </button>
            )}
          </div>
          <div
            role="group"
            aria-label="Filtra voci della cronologia attività"
            className="grid grid-cols-3 gap-1 bg-surface-950/70 p-1 rounded-xl border border-surface-800/80"
          >
            {filterOptions.map((opt) => {
              const isSelected = activityFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActivityFilter(opt.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-surface-800 text-white shadow-sm border border-accent-500/40'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900/60 border border-transparent'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-accent-500/20 text-accent-300'
                        : 'bg-surface-800/80 text-surface-500'
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cronologia attività (Activity Log — newest entries first, expandable) */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
          <ActivityLog
            projectId={project.id}
            projectName={project.name}
            entries={filteredEntries}
            activeFilter={activityFilter}
            totalProjectEntriesCount={projectAuthorizedEntries.length}
            onResetFilter={() => setActivityFilter('ALL')}
            loading={activityLoading}
            error={activityError}
          />
        </div>

        {/* Instruction input */}
        <div className="px-4 py-3 border-t border-surface-800/60">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un'istruzione per modificare il progetto..."
              rows={3}
              className="w-full px-3 py-2.5 pr-12 rounded-xl bg-surface-800/60 border border-surface-700/60 text-white text-sm placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors resize-none scrollbar-thin"
              maxLength={1000}
            />
            <button
              onClick={handleSendInstruction}
              disabled={!instruction.trim()}
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Invia istruzione"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-surface-600 mt-2">
            Premi Ctrl+Invio per inviare
          </p>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3 border-t border-surface-800/60 space-y-2">
          {exportSuccessInfo && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start justify-between gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 animate-fade-in"
            >
              <div className="flex items-start gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-emerald-200 truncate">
                    Esportazione completata ({exportSuccessInfo.fileName})
                  </p>
                  <p className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
                    Versione {exportSuccessInfo.versionId} · {exportSuccessInfo.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportSuccessInfo(null)}
                className="text-emerald-400/70 hover:text-emerald-200 transition-colors flex-shrink-0 p-0.5"
                aria-label="Chiudi conferma esportazione"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 hover:from-accent-400 hover:to-accent-500 transition-all disabled:opacity-60 glow-accent"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generazione in corso...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {aiConfigured ? 'Genera con IA' : 'Configura IA per generare'}
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleRequestExport}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                exportSuccessInfo
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-surface-800/60 border-surface-700/40 text-surface-300 hover:text-white hover:border-surface-600'
              }`}
            >
              {exportSuccessInfo ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Esportato</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Esporta</span>
                </>
              )}
            </button>
            <button
              onClick={() => setGithubModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-surface-800/60 border border-surface-700/40 text-surface-300 hover:text-white hover:border-surface-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub (OAuth in attesa)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — Preview & Code */}
      <div className="flex-1 flex flex-col h-[50vh] lg:h-full overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-surface-800/60 flex items-center justify-between gap-3 glass">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-surface-800/40 rounded-lg p-0.5">
            <TabButton
              active={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              icon={Eye}
              label="Anteprima"
            />
            <TabButton
              active={activeTab === 'code'}
              onClick={() => setActiveTab('code')}
              icon={Code2}
              label="Codice"
            />
            <TabButton
              active={activeTab === 'connectors'}
              onClick={() => setActiveTab('connectors')}
              icon={Plug}
              label={`Connettori${project.connectors?.length ? ` (${project.connectors.length})` : ''}`}
            />
          </div>

          {/* Device selector (preview only) */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-surface-800/40 rounded-lg p-0.5">
              {(Object.keys(deviceWidths) as PreviewDevice[]).map((d) => {
                const Icon = deviceIcons[d];
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`w-8 h-7 rounded-md flex items-center justify-center transition-colors ${
                      device === d
                        ? 'bg-surface-700 text-accent-300'
                        : 'text-surface-500 hover:text-surface-300'
                    }`}
                    aria-label={d}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Refresh & Keyboard Shortcuts */}
          <div className="flex items-center gap-1.5">
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="w-8 h-8 rounded-lg bg-surface-800/40 text-surface-400 hover:text-accent-300 flex items-center justify-center transition-colors"
                aria-label="Scorciatoie da tastiera"
                title="Scorciatoie da tastiera (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}
            {activeTab === 'preview' && (
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="w-8 h-8 rounded-lg bg-surface-800/40 text-surface-400 hover:text-surface-200 flex items-center justify-center transition-colors"
                aria-label="Aggiorna anteprima"
                title="Aggiorna anteprima (Alt+R)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden bg-surface-950 relative">
          {activeTab === 'preview' ? (
            <div className="h-full flex items-start justify-center overflow-y-auto scrollbar-thin p-0 lg:p-4">
              <div
                className="bg-white transition-all duration-300 h-full lg:h-auto lg:min-h-full w-full lg:rounded-xl overflow-hidden shadow-2xl"
                style={{
                  maxWidth: deviceWidths[device],
                  width: '100%',
                }}
              >
                <iframe
                  key={iframeKey}
                  srcDoc={previewHtml}
                  title="Anteprima del progetto"
                  className="w-full h-full min-h-[50vh] border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          ) : activeTab === 'connectors' ? (
            <ConnectorsPanel
              connectors={project.connectors ?? []}
              onChange={(next) =>
                onUpdateProject(project.id, { connectors: sanitizeConnectors(next) })
              }
            />
          ) : (
            <div className="h-full overflow-y-auto scrollbar-thin">
              <pre className="p-4 text-sm font-mono text-surface-300 leading-relaxed whitespace-pre-wrap break-words">
                <code>{previewHtml}</code>
              </pre>
            </div>
          )}

          {/* AI not configured overlay */}
          {!aiConfigured && project.status === 'draft' && activeTab === 'preview' && (
            <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Modello IA non configurato
                </h3>
                <p className="text-sm text-surface-400 mb-5 leading-relaxed">
                  Per generare l'anteprima della tua applicazione, configura un provider IA.
                  Puoi usare OpenAI, Anthropic, Groq o un endpoint personalizzato.
                </p>
                <button
                  onClick={onGoToSettings}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Vai alle impostazioni
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Project Confirmation Modal */}
      {exportConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setExportConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-confirm-title"
          aria-describedby="export-confirm-desc"
        >
          <div
            className="w-full max-w-md glass-strong border border-surface-700/70 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h3 id="export-confirm-title" className="text-base font-semibold text-white">
                    Conferma esportazione progetto
                  </h3>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Verifica i dettagli prima di scaricare il file
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExportConfirmOpen(false)}
                className="w-8 h-8 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 flex items-center justify-center transition-colors"
                aria-label="Chiudi finestra di conferma"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p id="export-confirm-desc" className="text-sm text-surface-300 leading-relaxed">
              Vuoi procedere con l&apos;esportazione del progetto{' '}
              <span className="font-semibold text-white">&ldquo;{project.name}&rdquo;</span>? Verrà
              scaricato il file di testo e verrà registrata una voce di tipo{' '}
              <span className="font-mono text-xs text-cyan-300">EXPORT</span> nella cronologia
              attività con il solo riferimento alla versione del codice.
            </p>

            <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-surface-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-surface-500" />
                  <span>File di destinazione:</span>
                </span>
                <span className="font-mono text-surface-200 truncate">
                  {project.name.replace(/\s+/g, '-').toLowerCase()}.txt
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-surface-400">Versione codice:</span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-surface-800 text-accent-300 border border-surface-700/70">
                  {currentVersionId}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setExportConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-800/70 hover:bg-surface-700/70 text-surface-300 hover:text-white border border-surface-700/60 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmExport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 hover:from-accent-400 hover:to-accent-500 transition-all glow-accent"
              >
                <Download className="w-4 h-4" />
                <span>Conferma ed esporta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct GitHub Repository Export Info Modal (Temporarily Disabled for Security) */}
      {githubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setGithubModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="github-export-title"
        >
          <div
            className="w-full max-w-md glass-strong border border-surface-700/70 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center flex-shrink-0">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 id="github-export-title" className="text-base font-semibold text-white">
                    Esportazione diretta su GitHub
                  </h3>
                  <p className="text-xs text-amber-400 mt-0.5">
                    Temporaneamente disabilitata (In attesa di OAuth per utente)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGithubModalOpen(false)}
                className="w-8 h-8 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/60 flex items-center justify-center transition-colors"
                aria-label="Chiudi finestra GitHub"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-200 leading-relaxed">
              <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Protezione credenziali GitHub attiva</span>
              </p>
              <p>
                Per evitare il salvataggio di Personal Access Token nel browser (<code className="font-mono">localStorage</code>) o l&apos;uso di token condivisi sul server, la pubblicazione automatica su repository GitHub è disabilitata finché non verrà configurato un flusso OAuth GitHub individuale lato server.
              </p>
              <p className="text-surface-300">
                Puoi esportare immediatamente il pacchetto completo del progetto (<code className="font-mono">{currentVersionId}</code>) usando il pulsante <strong>Esporta</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setGithubModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-800/70 hover:bg-surface-700/70 text-surface-300 hover:text-white border border-surface-700/60 transition-colors"
              >
                Chiudi
              </button>
              <button
                type="button"
                onClick={() => {
                  setGithubModalOpen(false);
                  handleRequestExport();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 hover:from-accent-400 hover:to-accent-500 transition-all glow-accent"
              >
                <Download className="w-4 h-4" />
                <span>Scarica file progetto (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const config: Record<Project['status'], { label: string; class: string; icon: typeof CheckCircle2 }> = {
    draft: { label: 'Bozza', class: 'text-surface-400 bg-surface-800/60', icon: CheckCircle2 },
    generating: { label: 'In generazione', class: 'text-amber-400 bg-amber-500/10', icon: Loader2 },
    generated: { label: 'Pronto', class: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
    error: { label: 'Errore', class: 'text-red-400 bg-red-500/10', icon: AlertCircle },
  };
  const cfg = config[status];
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${cfg.class}`}>
      <cfg.icon className={`w-3 h-3 ${status === 'generating' ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-surface-700 text-white' : 'text-surface-500 hover:text-surface-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
