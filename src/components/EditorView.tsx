import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Project, ActivityLogEntry, ActivityLogFilter, AppSettings, AIProvider } from '@/types';
import { PROJECT_TYPE_LABELS, AI_PROVIDERS } from '@/lib/constants';
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
  X,
  Plug,
  Sliders,
  Copy,
  Check,
  Key,
  Bot,
  User,
  History,
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
  onUpdateAI?: (updates: Partial<AppSettings['ai']>) => void;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type PreviewTab = 'preview' | 'code';
type MobileEditorTab = 'chat' | 'preview';
type SecondaryDrawerTab = 'ai' | 'connectors' | 'export' | 'activity';

const QUICK_ITERATION_SUGGESTIONS = [
  'Migliora lo stile mobile e rendilo 100% fluido',
  'Aggiungi una barra di navigazione con menu compatto',
  'Inserisci una sezione FAQ con risposte a comparsa',
  'Aggiungi un modulo di contatto con campi validati',
  'Migliora i contrasti e aggiungi effetti hover moderni',
];

const DEFAULT_HTML_PREVIEW = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anteprima Applicazione</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090d16;
      color: #f1f5f9;
      padding: 1.5rem;
    }
    .card {
      text-align: center;
      max-width: 460px;
      padding: 2.5rem 2rem;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 1.25rem;
      background: linear-gradient(135deg, #06b6d4, #0284c7);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 0.925rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .hint {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 999px;
      font-size: 0.8rem;
      color: #38bdf8;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#9889;</div>
    <h1>In attesa di generazione</h1>
    <p>Usa la chat a sinistra per descrivere l&apos;applicazione o richiedere modifiche. Clicca &ldquo;Invia e genera&rdquo; per vedere il risultato live.</p>
    <div class="hint">Pronto per la prima iterazione</div>
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
  onUpdateAI,
}: EditorViewProps) {
  // Conversational state
  const [instruction, setInstruction] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Preview & responsive state
  const [activeTab, setActiveTab] = useState<PreviewTab>('preview');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [mobileTab, setMobileTab] = useState<MobileEditorTab>('chat');
  const [iframeKey, setIframeKey] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);

  // Secondary Options drawer
  const [secondaryDrawerOpen, setSecondaryDrawerOpen] = useState(false);
  const [secondaryTab, setSecondaryTab] = useState<SecondaryDrawerTab>('ai');

  // Export Confirmation & Status
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [exportSuccessInfo, setExportSuccessInfo] = useState<{
    fileName: string;
    versionId: string;
    timestamp: string;
  } | null>(null);

  // BYOK in-drawer local state
  const [aiProvider, setAiProvider] = useState<AIProvider>(settings?.ai.provider ?? 'gemini');
  const [aiApiKey, setAiApiKey] = useState(settings?.ai.apiKey ?? '');
  const [aiCustomModel, setAiCustomModel] = useState(settings?.ai.customModel ?? '');
  const [aiCustomEndpoint, setAiCustomEndpoint] = useState(settings?.ai.customEndpoint ?? '');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [aiSavedNotice, setAiSavedNotice] = useState(false);

  // Activity filter inside secondary drawer
  const [activityFilter, setActivityFilter] = useState<ActivityLogFilter>('ALL');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const exportSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exportSuccessTimerRef.current) {
        clearTimeout(exportSuccessTimerRef.current);
      }
    };
  }, []);

  // Sync settings when changed from outside
  useEffect(() => {
    if (settings?.ai) {
      setAiProvider(settings.ai.provider);
      setAiApiKey(settings.ai.apiKey);
      setAiCustomModel(settings.ai.customModel);
      setAiCustomEndpoint(settings.ai.customEndpoint);
    }
  }, [settings?.ai]);

  const previewHtml = project.previewHtml ?? DEFAULT_HTML_PREVIEW;
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

  const filteredEntries = useMemo(() => {
    if (activityFilter === 'ALL') return projectAuthorizedEntries;
    if (activityFilter === 'EXPORT') {
      return projectAuthorizedEntries.filter((entry) => isExportActivityEntry(entry));
    }
    return projectAuthorizedEntries.filter((entry) => !isExportActivityEntry(entry));
  }, [projectAuthorizedEntries, activityFilter]);

  // Scroll chat down when instructions change or generation happens
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project.instructions.length, generating, generationError]);

  // Generate Handler
  const handleGenerate = useCallback(
    async (optionalNextInstruction?: string) => {
      if (generating) return;

      const effectiveSettings = settings?.ai || {
        provider: aiProvider,
        apiKey: aiApiKey,
        model: 'gemini-3.8-flash',
        customModel: aiCustomModel,
        customEndpoint: aiCustomEndpoint,
      };

      const hasKey =
        effectiveSettings.provider === 'managed' ||
        Boolean(effectiveSettings.apiKey && effectiveSettings.apiKey.trim().length > 0);

      if (!hasKey) {
        setSecondaryTab('ai');
        setSecondaryDrawerOpen(true);
        showToast('error', 'Inserisci la tua chiave API nelle impostazioni IA per generare.');
        return;
      }

      setGenerating(true);
      setGenerationError(null);
      onUpdateProject(project.id, { status: 'generating' });

      // Build updated instruction list if a new instruction is passed inline
      const currentInstructions = [...project.instructions];
      if (optionalNextInstruction && optionalNextInstruction.trim()) {
        const newEntry = {
          id: `inst_${Date.now()}`,
          text: optionalNextInstruction.trim(),
          timestamp: new Date().toISOString(),
          status: 'generating' as const,
        };
        currentInstructions.push(newEntry);
      }

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
              instructions: currentInstructions,
              connectors: project.connectors ?? [],
            },
            aiSettings: effectiveSettings,
          }),
        });

        const data = (await res.json()) as {
          html?: string;
          error?: string;
          mode?: string;
        };

        if (!res.ok || !data.html) {
          const err = data.error || 'Errore durante la generazione del codice.';
          setGenerationError(err);
          onUpdateProject(project.id, { status: 'error' });
          showToast('error', err);
        } else {
          onUpdateProject(project.id, {
            status: 'generated',
            previewHtml: data.html,
          });
          setGenerationError(null);
          showToast('success', 'Applicazione generata con successo!');
          setIframeKey((k) => k + 1);
          // On mobile, show the updated preview directly so user sees the result immediately
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setMobileTab('preview');
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Errore di connessione durante la generazione.';
        setGenerationError(msg);
        onUpdateProject(project.id, { status: 'error' });
        showToast('error', msg);
      } finally {
        setGenerating(false);
      }
    },
    [
      generating,
      settings?.ai,
      aiProvider,
      aiApiKey,
      aiCustomModel,
      aiCustomEndpoint,
      onUpdateProject,
      project,
    ],
  );

  // Send Instruction + Instant Generate in one conversational action
  const handleSendAndGenerate = () => {
    const text = instruction.trim();
    if (!text && project.status === 'draft') {
      // If input is empty but project is ready, just trigger generation
      void handleGenerate();
      return;
    }
    if (!text) return;

    onAddInstruction(project.id, text);
    setInstruction('');
    void handleGenerate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAndGenerate();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(previewHtml);
      setCodeCopied(true);
      showToast('success', 'Codice HTML copiato negli appunti.');
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {
      showToast('error', 'Impossibile copiare il codice negli appunti.');
    }
  };

  // Confirm Export
  const handleConfirmExport = useCallback(() => {
    const versionId = project.codeVersion || computeCodeVersionReference(project);
    const fileName = `${project.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    setExportConfirmOpen(false);
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

  // Save AI Settings directly from within drawer
  const handleSaveAISettings = () => {
    if (onUpdateAI) {
      onUpdateAI({
        provider: aiProvider,
        apiKey: aiApiKey.trim(),
        customModel: aiCustomModel.trim(),
        customEndpoint: aiCustomEndpoint.trim(),
      });
      setAiSavedNotice(true);
      showToast('success', 'Impostazioni IA aggiornate.');
      setTimeout(() => setAiSavedNotice(false), 3000);
    }
  };

  // Keyboard Shortcuts (Alt+G, Alt+P, Alt+D, Alt+R, Alt+E, Alt+O, Escape)
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (exportConfirmOpen) {
          e.preventDefault();
          setExportConfirmOpen(false);
          return;
        }
        if (secondaryDrawerOpen) {
          e.preventDefault();
          setSecondaryDrawerOpen(false);
          return;
        }
      }
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === 'g') {
        e.preventDefault();
        void handleGenerate();
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
        setExportConfirmOpen(true);
      } else if (key === 'o' || key === 's') {
        e.preventDefault();
        setSecondaryDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [handleGenerate, exportConfirmOpen, secondaryDrawerOpen]);

  const deviceWidths: Record<PreviewDevice, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const currentProviderName = useMemo(() => {
    const p = AI_PROVIDERS.find((item) => item.id === (settings?.ai.provider ?? aiProvider));
    return p?.name || 'Google Gemini';
  }, [settings?.ai.provider, aiProvider]);

  return (
    <div className="h-screen flex flex-col bg-surface-950 text-white overflow-hidden">
      {/* 1. TOP HEADER - Streamlined, clean, without redundant pills */}
      <header className="h-14 flex-shrink-0 glass-strong border-b border-surface-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 z-30">
        {/* Left: Back button + Project Name + Status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700/80 text-surface-300 hover:text-white transition-colors text-xs font-medium flex-shrink-0"
            aria-label="Torna ai progetti"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Progetti</span>
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
              {project.name}
            </h1>
            <span className="text-xs text-surface-500 hidden md:inline">·</span>
            <span className="text-xs text-surface-400 font-medium hidden md:inline truncate">
              {PROJECT_TYPE_LABELS[project.type]}
            </span>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {generating ? (
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="hidden sm:inline">Generazione in corso...</span>
                </span>
              ) : project.status === 'generated' ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="hidden sm:inline">Pronto ({currentVersionId})</span>
                </span>
              ) : project.status === 'error' ? (
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="hidden sm:inline">Errore</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-surface-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-surface-500" />
                  <span className="hidden sm:inline">Bozza</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Mobile & Tablet View Mode Switcher */}
        <div className="lg:hidden flex items-center bg-surface-900/90 rounded-xl p-1 border border-surface-800">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'chat'
                ? 'bg-surface-800 text-white shadow-sm'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-accent-400" />
            <span>Chat ({project.instructions.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileTab === 'preview'
                ? 'bg-surface-800 text-accent-300 shadow-sm'
                : 'text-surface-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima</span>
          </button>
        </div>

        {/* Right: Secondary Options, Export, Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Secondary Options Button (AI BYOK, Connectors, Export) */}
          <button
            onClick={() => {
              setSecondaryTab('ai');
              setSecondaryDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700/80 text-surface-200 hover:text-white border border-surface-700/60 text-xs font-medium transition-colors"
            title="Configura IA, Connettori ed Esportazione"
          >
            <Sliders className="w-3.5 h-3.5 text-accent-400" />
            <span className="hidden sm:inline">Opzioni</span>
          </button>

          {/* Quick Export Button */}
          <button
            onClick={() => setExportConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800/80 hover:bg-surface-700/80 text-surface-200 hover:text-white border border-surface-700/60 text-xs font-medium transition-colors"
            title="Esporta il codice dell'applicazione"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Esporta</span>
          </button>

          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-surface-800/60 hover:bg-surface-700/60 text-surface-400 hover:text-white transition-colors"
              title="Scorciatoie da tastiera (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Side-by-Side on Desktop, Tabbed on Mobile/Tablet) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ==================================================================== */}
        {/* LEFT COLUMN: CONVERSATIONAL STREAM (CHAT & INSTRUCTIONS)            */}
        {/* ==================================================================== */}
        <section
          aria-label="Flusso conversazionale e istruzioni"
          className={`w-full lg:w-[420px] xl:w-[460px] lg:flex-shrink-0 flex flex-col bg-surface-950 border-r border-surface-800/70 h-full overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {/* Export Success Notification Banner */}
            {exportSuccessInfo && (
              <div
                role="status"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 animate-fade-in"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    Esportato: <strong>{exportSuccessInfo.fileName}</strong> ({exportSuccessInfo.versionId})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExportSuccessInfo(null)}
                  className="text-emerald-400/80 hover:text-white p-1 flex-shrink-0"
                  aria-label="Chiudi notifica esportazione"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message 1: Initial Bot greeting */}
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center flex-shrink-0 shadow-sm text-surface-950 font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 max-w-[85%] rounded-2xl bg-surface-900/90 border border-surface-800/80 p-3.5 text-xs text-surface-200 space-y-1.5 leading-relaxed">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">Assistente AI App Builder</span>
                  <span className="text-[10px] text-surface-500">Inizio progetto</span>
                </div>
                <p>
                  Ho preparato l&apos;ambiente per <strong className="text-white">{project.name}</strong>.
                  Di seguito trovi la tua richiesta iniziale:
                </p>
              </div>
            </div>

            {/* Message 2: Initial Prompt from user */}
            <div className="flex items-start justify-end gap-3 animate-fade-in">
              <div className="flex-1 max-w-[85%] rounded-2xl bg-accent-500/10 border border-accent-500/25 p-3.5 text-xs text-white space-y-1 leading-relaxed">
                <div className="flex items-center justify-between gap-2 text-accent-300">
                  <span className="font-semibold">Richiesta iniziale</span>
                  <span className="text-[10px] text-accent-400/70">
                    {new Date(project.createdAt).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-surface-100">{project.description}</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-surface-800 border border-surface-700/80 flex items-center justify-center flex-shrink-0 text-surface-300">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Message 3+: Subsequent User Instructions & Confirmations */}
            {project.instructions.map((inst, index) => (
              <div key={inst.id || index} className="space-y-3 animate-slide-up">
                {/* User instruction bubble */}
                <div className="flex items-start justify-end gap-3">
                  <div className="flex-1 max-w-[85%] rounded-2xl bg-surface-900 border border-surface-700/80 p-3.5 text-xs text-white space-y-1 leading-relaxed">
                    <div className="flex items-center justify-between gap-2 text-surface-400">
                      <span className="font-medium text-surface-300">Istruzione #{index + 1}</span>
                      <span className="text-[10px]">
                        {new Date(inst.timestamp).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-surface-100">{inst.text}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-surface-800 border border-surface-700/80 flex items-center justify-center flex-shrink-0 text-surface-300">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                {/* Assistant response confirmation */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center flex-shrink-0 text-accent-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 max-w-[85%] rounded-2xl bg-surface-900/60 border border-surface-800/80 p-3 text-xs text-surface-300 space-y-1 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Modifiche applicate al codice</span>
                    </div>
                    <p className="text-[11px] text-surface-400">
                      L&apos;anteprima riflette questa istruzione. Puoi continuare a richiedere modifiche o aggiungere componenti.
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Live Generation Card (In corso) */}
            {generating && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-accent-500/20 border border-accent-500/40 flex items-center justify-center flex-shrink-0 text-accent-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex-1 max-w-[85%] rounded-2xl bg-surface-900/90 border border-accent-500/30 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                      Generazione in corso...
                    </span>
                    <span className="text-[10px] text-accent-400 font-mono">
                      {currentProviderName}
                    </span>
                  </div>
                  <p className="text-xs text-surface-300 leading-relaxed">
                    L&apos;IA sta scrivendo e perfezionando il codice HTML, CSS e JavaScript per la tua applicazione.
                  </p>
                  <div className="w-full bg-surface-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent-500 via-sky-400 to-accent-600 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Card (Fallita) */}
            {generationError && !generating && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 max-w-[85%] rounded-2xl bg-red-500/10 border border-red-500/30 p-4 space-y-2 text-xs">
                  <span className="font-semibold text-red-200 block">Generazione non riuscita</span>
                  <p className="text-surface-300 leading-relaxed">{generationError}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => void handleGenerate()}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold text-xs hover:bg-red-400 transition-colors"
                    >
                      Riprova
                    </button>
                    <button
                      onClick={() => {
                        setSecondaryTab('ai');
                        setSecondaryDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface-800 text-surface-200 font-medium text-xs hover:text-white transition-colors"
                    >
                      Controlla chiave IA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick iteration suggestions when completed */}
            {project.status === 'generated' && !generating && (
              <div className="pt-2">
                <span className="text-[11px] font-medium text-surface-500 block mb-2">
                  Idee per il prossimo prompt:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ITERATION_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => {
                        setInstruction(sug);
                        if (textareaRef.current) {
                          textareaRef.current.focus();
                        }
                      }}
                      className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-surface-900/80 hover:bg-surface-800 border border-surface-800 hover:border-accent-500/40 text-surface-300 hover:text-white transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar (Ergonomic, fixed at bottom) */}
          <div className="p-3.5 border-t border-surface-800/80 bg-surface-950/95 space-y-2">
            {!aiConfigured && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span className="truncate">Nessuna chiave IA attiva.</span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setSecondaryTab('ai');
                      setSecondaryDrawerOpen(true);
                    }}
                    className="text-amber-300 font-semibold underline hover:text-white"
                  >
                    Configura qui
                  </button>
                  <button
                    onClick={onGoToSettings}
                    className="text-surface-400 hover:text-white text-[11px]"
                    title="Apri impostazioni globali"
                  >
                    Tutte
                  </button>
                </div>
              </div>
            )}

            <div className="relative rounded-2xl bg-surface-900 border border-surface-700/70 focus-within:border-accent-500/60 focus-within:ring-2 focus-within:ring-accent-400/20 transition-all p-2">
              <textarea
                ref={textareaRef}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chiedi una modifica o descrivi una nuova sezione..."
                rows={2}
                disabled={generating}
                className="w-full px-2 pt-1 pb-1 bg-transparent text-white text-base sm:text-sm placeholder:text-surface-500 focus:outline-none resize-none leading-relaxed scrollbar-thin disabled:opacity-50"
                maxLength={1000}
              />

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-800/60 mt-1">
                <span className="text-[11px] text-surface-500 hidden sm:inline">
                  Premi <kbd className="font-mono bg-surface-800 px-1 py-0.5 rounded text-[10px]">Invio</kbd> per inviare
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  {project.status === 'draft' && !instruction.trim() ? (
                    <button
                      onClick={() => void handleGenerate()}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 font-semibold text-xs hover:from-accent-400 hover:to-accent-500 transition-all glow-accent disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Genera prima versione</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSendAndGenerate}
                      disabled={generating || !instruction.trim()}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 font-semibold text-xs hover:from-accent-400 hover:to-accent-500 transition-all glow-accent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>In elaborazione</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Invia e genera</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: LIVE PREVIEW & CODE CANVAS                             */}
        {/* ==================================================================== */}
        <section
          aria-label="Anteprima dell'applicazione"
          className={`flex-1 flex flex-col bg-surface-950 h-full overflow-hidden ${
            mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Canvas Sub-Toolbar */}
          <div className="h-11 flex-shrink-0 px-4 glass border-b border-surface-800/80 flex items-center justify-between gap-3 z-10">
            {/* View switcher: Anteprima vs Codice */}
            <div className="flex items-center gap-1 bg-surface-900 rounded-lg p-0.5 border border-surface-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-surface-800 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-accent-400" />
                <span>Anteprima</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'code'
                    ? 'bg-surface-800 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Codice HTML</span>
              </button>
            </div>

            {/* Device Viewport switch (Desktop / Tablet / Smartphone) */}
            {activeTab === 'preview' && (
              <div className="hidden sm:flex items-center gap-1 bg-surface-900 rounded-lg p-0.5 border border-surface-800">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`w-7 h-6 rounded flex items-center justify-center transition-colors ${
                    device === 'desktop'
                      ? 'bg-surface-800 text-accent-300'
                      : 'text-surface-500 hover:text-surface-300'
                  }`}
                  title="Schermo Desktop (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`w-7 h-6 rounded flex items-center justify-center transition-colors ${
                    device === 'tablet'
                      ? 'bg-surface-800 text-accent-300'
                      : 'text-surface-500 hover:text-surface-300'
                  }`}
                  title="Schermo Tablet (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`w-7 h-6 rounded flex items-center justify-center transition-colors ${
                    device === 'mobile'
                      ? 'bg-surface-800 text-accent-300'
                      : 'text-surface-500 hover:text-surface-300'
                  }`}
                  title="Schermo Smartphone (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Refresh & Quick Actions */}
            <div className="flex items-center gap-2">
              {activeTab === 'code' ? (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium transition-colors"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiato</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-accent-400" />
                      <span>Copia codice</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-medium transition-colors"
                  title="Ricarica anteprima (Alt+R)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ricarica</span>
                </button>
              )}
            </div>
          </div>

          {/* Canvas Content Area */}
          <div className="flex-1 bg-surface-950 p-0 sm:p-4 overflow-hidden relative flex items-center justify-center">
            {activeTab === 'preview' ? (
              <div
                className="w-full h-full bg-white sm:rounded-xl overflow-hidden shadow-2xl transition-all duration-300 relative"
                style={{
                  maxWidth: deviceWidths[device],
                }}
              >
                {/* Non-blocking loading overlay during regeneration */}
                {generating && (
                  <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-white space-y-3 p-4">
                    <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
                    <p className="text-sm font-semibold">Aggiornamento anteprima in corso...</p>
                  </div>
                )}

                <iframe
                  key={iframeKey}
                  srcDoc={previewHtml}
                  title="Anteprima live del progetto"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-surface-900 sm:rounded-xl overflow-y-auto scrollbar-thin p-4 border border-surface-800">
                <pre className="text-xs font-mono text-surface-200 leading-relaxed whitespace-pre-wrap break-all">
                  <code>{previewHtml}</code>
                </pre>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ==================================================================== */}
      {/* 3. SECONDARY OPTIONS DRAWER / MODAL                                  */}
      {/* (Provider, Modello, API Key, Connettori, Esportazione, Cronologia)   */}
      {/* ==================================================================== */}
      {secondaryDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-surface-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSecondaryDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="secondary-drawer-title"
        >
          <div
            className="w-full sm:w-[500px] h-full bg-surface-900 border-l border-surface-800 flex flex-col shadow-2xl animate-slide-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="secondary-drawer-title" className="text-sm font-bold text-white">
                    Opzioni &amp; Connettori
                  </h2>
                  <p className="text-[11px] text-surface-400">
                    Configura IA, servizi esterni ed esportazione
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSecondaryDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-surface-800 text-surface-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Chiudi opzioni"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex items-center px-4 pt-3 border-b border-surface-800 gap-1 bg-surface-950/50">
              <button
                onClick={() => setSecondaryTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  secondaryTab === 'ai'
                    ? 'border-accent-400 text-accent-300'
                    : 'border-transparent text-surface-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Modello IA</span>
              </button>

              <button
                onClick={() => setSecondaryTab('connectors')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  secondaryTab === 'connectors'
                    ? 'border-accent-400 text-accent-300'
                    : 'border-transparent text-surface-400 hover:text-white'
                }`}
              >
                <Plug className="w-3.5 h-3.5" />
                <span>
                  Connettori
                  {project.connectors?.length ? ` (${project.connectors.length})` : ''}
                </span>
              </button>

              <button
                onClick={() => setSecondaryTab('export')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  secondaryTab === 'export'
                    ? 'border-accent-400 text-accent-300'
                    : 'border-transparent text-surface-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Esporta</span>
              </button>

              <button
                onClick={() => setSecondaryTab('activity')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
                  secondaryTab === 'activity'
                    ? 'border-accent-400 text-accent-300'
                    : 'border-transparent text-surface-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
              {/* TAB 1: AI MODEL & BYOK SETTINGS */}
              {secondaryTab === 'ai' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Provider &amp; Chiave API (BYOK)
                    </h3>
                    <p className="text-xs text-surface-400 leading-relaxed">
                      Seleziona il fornitore di intelligenza artificiale desiderato. La tua chiave API rimane salvata nel browser e non viene condivisa.
                    </p>
                  </div>

                  {/* Provider Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-surface-300">Provider IA</label>
                    <div className="grid grid-cols-2 gap-2">
                      {AI_PROVIDERS.map((prov) => {
                        const selected = aiProvider === prov.id;
                        return (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => setAiProvider(prov.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selected
                                ? 'bg-accent-500/10 border-accent-500/60 text-white'
                                : 'bg-surface-800/60 border-surface-700/60 text-surface-400 hover:text-white hover:bg-surface-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-white">{prov.name}</span>
                              {prov.id === 'gemini' && (
                                <span className="text-[10px] text-accent-300 font-mono">Consigliato</span>
                              )}
                            </div>
                            <span className="text-[11px] text-surface-400 block mt-0.5 truncate">
                              {prov.model}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-surface-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-accent-400" />
                        Chiave API {aiProvider !== 'custom' ? `(${aiProvider})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="text-[11px] text-accent-300 hover:underline"
                      >
                        {apiKeyVisible ? 'Nascondi' : 'Mostra'}
                      </button>
                    </label>
                    <input
                      type={apiKeyVisible ? 'text' : 'password'}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Incolla qui la tua chiave API..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-800 border border-surface-700 text-xs text-white font-mono placeholder:text-surface-600 focus:outline-none focus:border-accent-500"
                    />
                  </div>

                  {/* Custom Provider extra fields */}
                  {aiProvider === 'custom' && (
                    <div className="space-y-4 p-3.5 rounded-xl bg-surface-950/60 border border-surface-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-300">Endpoint personalizzato</label>
                        <input
                          type="text"
                          value={aiCustomEndpoint}
                          onChange={(e) => setAiCustomEndpoint(e.target.value)}
                          placeholder="https://api.tuoprovider.com/v1"
                          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-xs text-white placeholder:text-surface-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-300">Nome Modello</label>
                        <input
                          type="text"
                          value={aiCustomModel}
                          onChange={(e) => setAiCustomModel(e.target.value)}
                          placeholder="es. meta-llama/Llama-3-70b-chat"
                          className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-xs text-white placeholder:text-surface-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save Settings Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-medium">
                      {aiSavedNotice ? '✓ Impostazioni salvate!' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveAISettings}
                      className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-surface-950 font-semibold text-xs transition-colors"
                    >
                      Salva configurazione
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CONNECTORS */}
              {secondaryTab === 'connectors' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Connettori del Progetto
                    </h3>
                    <p className="text-xs text-surface-400 leading-relaxed">
                      Collega database, pagamenti o webhook al prompt di generazione.
                    </p>
                  </div>
                  <ConnectorsPanel
                    connectors={project.connectors ?? []}
                    onChange={(next) =>
                      onUpdateProject(project.id, { connectors: sanitizeConnectors(next) })
                    }
                  />
                </div>
              )}

              {/* TAB 3: EXPORT & CODE SHARING */}
              {secondaryTab === 'export' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Esportazione e Download
                    </h3>
                    <p className="text-xs text-surface-400 leading-relaxed">
                      Scarica il codice sorgente o sincronizza il progetto con repository esterni.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-800/80 border border-surface-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Download file codice (.txt)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-900 text-accent-300">
                        {currentVersionId}
                      </span>
                    </div>
                    <p className="text-xs text-surface-300 leading-relaxed">
                      Genera un file esportabile con tutte le istruzioni fornite e il codice sorgente completo dell&apos;anteprima.
                    </p>
                    <button
                      onClick={() => setExportConfirmOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-surface-950 font-semibold text-xs hover:bg-accent-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Esporta codice progetto</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-800/80 border border-surface-700/80 space-y-3">
                    <div className="flex items-center gap-2 text-white font-semibold text-xs">
                      <Github className="w-4 h-4 text-surface-300" />
                      <span>Integrazione GitHub</span>
                    </div>
                    <p className="text-xs text-surface-300 leading-relaxed">
                      L&apos;integrazione automatica con repository GitHub remoti sarà abilitata non appena l&apos;OAuth sarà verificato.
                    </p>
                    <button
                      onClick={() => setGithubModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-white text-xs font-medium transition-colors"
                    >
                      Dettagli GitHub OAuth
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: ACTIVITY LOG & AUDIT */}
              {secondaryTab === 'activity' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Cronologia Attività
                    </h3>
                    <div className="flex items-center gap-1 text-[11px]">
                      {(['ALL', 'INSTRUCTION', 'EXPORT'] as ActivityLogFilter[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setActivityFilter(f)}
                          className={`px-2 py-1 rounded-md font-medium transition-colors ${
                            activityFilter === f
                              ? 'bg-accent-500/20 text-accent-300'
                              : 'text-surface-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. EXPORT CONFIRMATION MODAL                                         */}
      {/* ==================================================================== */}
      {exportConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setExportConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <div
            className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center text-accent-400 flex-shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="export-modal-title" className="text-base font-bold text-white">
                    Esporta applicazione
                  </h3>
                  <p className="text-xs text-surface-400">Scarica il codice e le istruzioni</p>
                </div>
              </div>
              <button
                onClick={() => setExportConfirmOpen(false)}
                className="w-8 h-8 rounded-lg text-surface-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-surface-300 leading-relaxed">
              Vuoi scaricare il file completo per il progetto{' '}
              <strong className="text-white">&ldquo;{project.name}&rdquo;</strong>? Verrà generato un file di testo con il codice HTML dell&apos;anteprima e la cronologia delle istruzioni.
            </p>

            <div className="p-3.5 rounded-xl bg-surface-950 border border-surface-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-surface-400">File:</span>
                <span className="font-mono text-surface-200">
                  {project.name.replace(/\s+/g, '-').toLowerCase()}.txt
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-400">Versione:</span>
                <span className="font-mono text-accent-300">{currentVersionId}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setExportConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-surface-300 hover:text-white"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmExport}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-accent-500 text-surface-950 hover:bg-accent-400 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Scarica file</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Modal */}
      {githubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setGithubModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-surface-900 border border-surface-700 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <Github className="w-5 h-5 text-surface-300" />
                <span>Esportazione GitHub</span>
              </div>
              <button
                onClick={() => setGithubModalOpen(false)}
                className="w-8 h-8 rounded-lg text-surface-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-surface-300 leading-relaxed">
              L&apos;integrazione diretta con GitHub richiede l&apos;autenticazione OAuth 3P. Per esportare il codice nel frattempo, usa l&apos;esportazione in file .txt con download immediato.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setGithubModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-800 text-surface-200 text-xs font-semibold hover:text-white"
              >
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
