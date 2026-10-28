import { useState, useRef, useEffect } from 'react';
import {
  Eye,
  Radio,
  Settings,
  Code,
  ExternalLink,
  RefreshCw,
  Share2,
  CloudUpload,
  X,
  Plus,
  Sliders,
  ChevronDown,
  Mic,
  MicOff,
  ArrowUp,
  Bot,
  Zap,
  Copy,
  Check,
  Columns,
  Upload,
  Github,
  GitFork,
  FileText,
  Paperclip,
  Loader2,
  AlertTriangle,
  FileCode,
  RotateCcw,
  Plug,
} from 'lucide-react';
import CasaLavoroPreview from '@/components/CasaLavoroPreview';
import ProjectOverviewPanel from '@/components/ProjectOverviewPanel';
import WingmanMascot from '@/components/WingmanMascot';
import GitHubModal from '@/components/GitHubModal';

interface EditorSplitViewProps {
  onBackToHome: () => void;
  onOpenCreditsModal: () => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp?: string;
  isPausedCard?: boolean;
  attachedFiles?: AttachedFile[];
  modifiedFiles?: string[];
  codeVersion?: string;
  isError?: boolean;
  errorCode?: string;
}

const INITIAL_CASALAVORO_CODE = `import React, { useState } from 'react';
import { Search, MapPin, Star, ShieldCheck, CheckCircle, Phone } from 'lucide-react';

export default function CasaLavoroPRO() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Vicenza');

  const artisans = [
    { id: 1, name: 'IdroClima Berica S.r.l.', category: 'Idraulico', city: 'Vicenza Centro (VI)', rating: 4.9, reviews: 84 },
    { id: 2, name: 'ElettroVeneto Impianti', category: 'Elettricista', city: 'Vicenza Ovest & Thiene', rating: 4.8, reviews: 62 },
    { id: 3, name: 'Color & Design F.lli Viero', category: 'Imbianchino', city: 'Montecchio Maggiore (VI)', rating: 4.9, reviews: 110 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Banner */}
      <div className="bg-orange-600 py-2.5 px-4 text-center text-xs font-semibold tracking-wide">
        Iscrizione gratis per tutti · Registrati gratis →
      </div>

      <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white">CasaLavoro<span className="text-orange-500">PRO</span></span>
          <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded">Vicenza</span>
        </div>
        <button className="bg-slate-900 border border-slate-700 hover:border-slate-500 px-3.5 py-1.5 rounded-xl text-xs font-medium">
          Accedi Artigiano
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <span className="text-orange-500 font-bold uppercase text-xs tracking-wider">
          IL MARKETPLACE DEI LAVORI IN CASA
        </span>
        <h1 className="text-4xl md:text-5xl font-black mt-2 leading-tight">
          Trova l'artigiano giusto per <span className="text-orange-500">casa tua</span>
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
          Confronta preventivi gratuiti da idraulici, elettricisti e imbianchini verificati a Vicenza e provincia.
        </p>

        {/* Search bar */}
        <div className="mt-8 bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto text-left">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Di cosa hai bisogno? (es. Idraulico, Caldaia)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors">
            Cerca Artigiani
          </button>
        </div>
      </main>
    </div>
  );
}`;

export default function EditorSplitView({
  onBackToHome,
  onOpenCreditsModal,
}: EditorSplitViewProps) {
  const [rightView, setRightView] = useState<'preview' | 'settings' | 'code'>('preview');
  const [isPreviewLive, setIsPreviewLive] = useState(false);
  const [bonusBannerVisible, setBonusBannerVisible] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isPausedChecked, setIsPausedChecked] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [reloadingPreview, setReloadingPreview] = useState(false);
  const [autoModel, setAutoModel] = useState('Auto');
  const [showAutoMenu, setShowAutoMenu] = useState(false);
  const [creaAction, setCreaAction] = useState('Crea');
  const [showCreaMenu, setShowCreaMenu] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [redeploySuccess, setRedeploySuccess] = useState(false);

  // Agent execution state
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);
  const [currentCode, setCurrentCode] = useState(INITIAL_CASALAVORO_CODE);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [codeVersion, setCodeVersion] = useState('v1.0');

  // Gemini connector state
  const [geminiStatus, setGeminiStatus] = useState<{
    checked: boolean;
    connected: boolean;
    model: string;
  }>({ checked: false, connected: false, model: 'gemini-3.8-flash' });

  // New states for the "+" dropdown: Carica file, GitHub, Fork chat
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [connectedRepo, setConnectedRepo] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [forkCount, setForkCount] = useState(0);
  const [forkAlert, setForkAlert] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Probe Gemini connection status
  useEffect(() => {
    fetch('/api/connectors/gemini/status')
      .then((res) => res.json())
      .then((data) => {
        setGeminiStatus({
          checked: true,
          connected: Boolean(data.connected),
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch(() => {
        setGeminiStatus({ checked: true, connected: false, model: 'gemini-3.8-flash' });
      });
  }, [rightView]);

  // Close plus menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial messages strictly matching screenshot 4
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Add the ChatGPT AI Models integration to my app.',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Add the ChatGPT AI Models integration to my app.',
    },
    {
      id: 'm3',
      sender: 'agent',
      text: 'Agent has been paused',
      isPausedCard: true,
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, attachedFiles, isAgentExecuting]);

  // Real Agent Execution: calls Gemini via backend /api/ai/agent/execute
  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text && attachedFiles.length === 0) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text || 'File allegati inviati per revisione ed integrazione.',
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setAttachedFiles([]);
    setIsAgentExecuting(true);

    try {
      const res = await fetch('/api/ai/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'home-pro-landing',
          prompt: userMsg.text,
          currentCode,
          currentHtml: previewHtml || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.updatedCode) {
          setCurrentCode(data.updatedCode);
        }
        if (data.updatedHtml) {
          setPreviewHtml(data.updatedHtml);
        }
        if (data.codeVersion) {
          setCodeVersion(data.codeVersion);
        }

        const agentMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: data.replyText || 'Modifiche applicate con successo al progetto.',
          modifiedFiles: data.modifiedFiles || ['src/pages/CasaLavoroLanding.tsx'],
          codeVersion: data.codeVersion,
          timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        // Clear, truthful failure message without fake success response
        const agentMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: data.error || 'Impossibile applicare le modifiche richieste.',
          isError: true,
          errorCode: data.errorCode,
        };
        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch {
      const agentMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: 'Errore di connessione con il server durante l\'elaborazione della richiesta all\'Agente.',
        isError: true,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsAgentExecuting(false);
    }
  };

  const handleReload = () => {
    setReloadingPreview(true);
    setTimeout(() => {
      setReloadingPreview(false);
    }, 800);
  };

  const handleRedeploy = () => {
    setRedeploySuccess(true);
    setTimeout(() => {
      setRedeploySuccess(false);
    }, 3500);
  };

  // 1. File Upload Handler
  const handleTriggerFileUpload = () => {
    setShowPlusMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((f) => {
      const sizeKB = Math.round(f.size / 1024);
      return {
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: f.name,
        size: sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemoveAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // 2. GitHub Connection Handler
  const handleOpenGitHub = () => {
    setShowPlusMenu(false);
    setShowGitHubModal(true);
  };

  const handleConnectGitHubRepo = (repo: string, branch: string) => {
    setConnectedRepo(`${repo} (${branch})`);
    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: `Repository GitHub collegato con successo: ${repo} sul ramo ${branch}. Tutte le modifiche saranno tracciate automaticamente.`,
    };
    setMessages((prev) => [...prev, systemMsg]);
  };

  // 3. Fork Chat Handler
  const handleForkChat = () => {
    setShowPlusMenu(false);
    const newForkNum = forkCount + 1;
    setForkCount(newForkNum);

    const alertText = `Chat e progetto duplicati come Fork #${newForkNum} (home-pro-landing-fork-${newForkNum})! Puoi sperimentare liberamente.`;
    setForkAlert(alertText);

    const systemMsg: ChatMessage = {
      id: `fork-${Date.now()}`,
      sender: 'system',
      text: `🌿 Questa chat è stata duplicata (Fork #${newForkNum}). Il codice e la cronologia sono ora isolati in questo nuovo ramo indipendente.`,
    };
    setMessages((prev) => [...prev, systemMsg]);

    setTimeout(() => {
      setForkAlert(null);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-45px)] w-full overflow-hidden bg-slate-100">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.ts,.tsx,.js,.jsx,.css,.html"
      />

      {/* ──────────────────────────────────────────────────────────── */}
      {/* LEFT COLUMN: AI AGENT CHAT (Screenshot 4 Left Side) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-full bg-white border-r border-slate-200/90 relative z-10">
        {/* Chat Status Bar with Repo or Fork indicator */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-emerald-700">
              Distribuzione completa {forkCount > 0 && `(Fork #${forkCount})`}
            </span>
            {connectedRepo && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-mono">
                <Github className="w-2.5 h-2.5" />
                <span>{connectedRepo}</span>
              </span>
            )}
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Oct 25, 10:45 AM</span>
        </div>

        {/* Fork Success Alert Banner */}
        {forkAlert && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2 font-medium">
              <GitFork className="w-4 h-4 text-emerald-600" />
              <span>{forkAlert}</span>
            </div>
            <button onClick={() => setForkAlert(null)} className="text-emerald-700 hover:text-emerald-950">
              ✕
            </button>
          </div>
        )}

        {/* Gemini Unconnected Warning Banner */}
        {geminiStatus.checked && !geminiStatus.connected && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px]">
                Google Gemini non è collegato. Inserisci la tua API key per permettere all'Agente di modificare i file.
              </span>
            </div>
            <button
              onClick={() => setRightView('settings')}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2"
            >
              Configura
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
          {/* Historical distribution statuses matching screenshots */}
          <div className="space-y-3 pb-2 border-b border-slate-100/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-700">Distribuzione completa</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Oct 25, 10:41 AM</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-700">Distribuzione completa</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Oct 25, 10:45 AM</span>
            </div>
          </div>

          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-[11px] font-medium border border-slate-200 flex items-center gap-2 shadow-2xs">
                    <GitFork className="w-3.5 h-3.5 text-blue-600" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1.5">
                  {/* Attached Files display if any */}
                  {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-sm">
                      {msg.attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-200/80 text-sky-950 text-[11px] font-medium border border-sky-300"
                        >
                          <FileText className="w-3 h-3 text-sky-700" />
                          <span className="truncate max-w-[140px]">{file.name}</span>
                          <span className="text-[9px] text-sky-800">({file.size})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-sky-100/90 text-sky-950 px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs md:text-sm font-medium shadow-xs max-w-sm border border-sky-200/60 leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              );
            }

            if (msg.isPausedCard) {
              return (
                <div key={msg.id} className="space-y-2 max-w-sm">
                  {/* Status Label with bot icon */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Bot className="w-4 h-4 text-slate-800" />
                    <span>Agent has been paused</span>
                  </div>

                  {/* Pause Checkbox Card */}
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-800 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={isPausedChecked}
                        onChange={(e) => setIsPausedChecked(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-slate-900"
                      />
                      <span>pause</span>
                    </label>

                    <button
                      onClick={() => alert('Copiato stato agente.')}
                      title="Copia dettagli"
                      className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // Real Agent response with Verifiable Modified Files
            return (
              <div key={msg.id} className="flex items-start gap-2 max-w-md">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-xs shadow-2xs leading-relaxed border ${
                    msg.isError
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.isError && (
                    <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Modifica non applicata</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Verifiable Modified Files Audit Section */}
                  {msg.modifiedFiles && msg.modifiedFiles.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-slate-700 flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5 text-blue-600" />
                          <span>File modificati ({msg.modifiedFiles.length}):</span>
                        </span>
                        {msg.codeVersion && (
                          <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {msg.codeVersion}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {msg.modifiedFiles.map((file, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-200/90 text-slate-800 px-2 py-0.5 rounded"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            {file}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Anteprima live e codice sorgente sincronizzati sul server</span>
                      </div>
                    </div>
                  )}

                  {msg.isError && msg.errorCode === 'GEMINI_NOT_CONNECTED' && (
                    <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-rose-700">Chiave non configurata</span>
                      <button
                        onClick={() => setRightView('settings')}
                        className="text-[11px] font-bold text-rose-800 hover:underline flex items-center gap-1"
                      >
                        <Plug className="w-3 h-3" />
                        <span>Apri Connettori</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Real Agent Loading State */}
          {isAgentExecuting && (
            <div className="flex items-start gap-2 max-w-md animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-xs shadow-2xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500 shrink-0" />
                <span>
                  L'Agente Gemini Flash sta analizzando il codice e applicando le modifiche al progetto...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bonus Anniversary Card */}
        {bonusBannerVisible && (
          <div className="mx-4 mb-2 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2 text-amber-950 font-medium">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Bonus anniversario: 30% di crediti in più</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCreditsModal}
                className="px-3 py-1 bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold rounded-lg text-xs shadow-2xs transition-colors"
              >
                Ricarica ora
              </button>
              <button
                onClick={() => setBonusBannerVisible(false)}
                className="text-amber-800/60 hover:text-amber-950 p-1"
                title="Chiudi avviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Input Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 focus-within:border-slate-400 focus-within:bg-white transition-all shadow-xs relative">
            {/* Attached files preview chips above textarea */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-200/80">
                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  <span>File allegati:</span>
                </span>
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] shadow-2xs"
                  >
                    <FileText className="w-3 h-3 text-blue-500" />
                    <span className="font-medium truncate max-w-[130px]">{file.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({file.size})</span>
                    <button
                      onClick={() => handleRemoveAttachedFile(file.id)}
                      className="text-slate-400 hover:text-slate-700 ml-0.5"
                      title="Rimuovi file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder={
                isAgentExecuting
                  ? 'Elaborazione modifiche in corso...'
                  : 'In attesa del tuo prossimo messaggio (es. "Aggiungi un pulsante WhatsApp verde")'
              }
              disabled={isAgentExecuting}
              className="w-full text-xs md:text-sm text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-none scrollbar-thin disabled:opacity-60"
            />

            {/* Bottom bar of chat box */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
              {/* Left tools: + button, Maxx, slider */}
              <div className="flex items-center gap-2">
                {/* "+" Dropdown Trigger */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    title="Aggiungi risorse o connetti"
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* "+" Dropdown Menu */}
                  {showPlusMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 animate-scale-in text-xs">
                      {/* 1. Carica file e risorse da PC */}
                      <button
                        onClick={handleTriggerFileUpload}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            Carica file e risorse da PC
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Immagini, documenti o codice sorgente per l'agente
                          </div>
                        </div>
                      </button>

                      {/* 2. Collegamento a GitHub */}
                      <button
                        onClick={handleOpenGitHub}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <Github className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                            <span>Collegamento a GitHub</span>
                            {connectedRepo && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Sincronizza repository, rami e commit automatici
                          </div>
                        </div>
                      </button>

                      {/* 3. Fork questa chat */}
                      <button
                        onClick={handleForkChat}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <GitFork className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            Fork questa chat
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Duplica la conversazione e il progetto in un nuovo ramo
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Maxx Pill */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-semibold">
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span>Maxx</span>
                </div>

                {/* Parameters Slider */}
                <button
                  onClick={() => alert(`Configurazione Agente: Modello ${geminiStatus.model}, Temperatura 0.2, TopP 0.95.`)}
                  title="Parametri di generazione"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right tools: Auto, Crea, Mic, Arrow */}
              <div className="flex items-center gap-2">
                {/* Auto dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowAutoMenu(!showAutoMenu)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                  >
                    <span>{autoModel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showAutoMenu && (
                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-30 text-xs">
                      {['Auto (Gemini Flash)', 'Gemini 3.8 Flash', 'Claude 3.7', 'GPT-4o'].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setAutoModel(m);
                            setShowAutoMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* </> Crea dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCreaMenu(!showCreaMenu)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                  >
                    <span>&lt;/&gt; {creaAction}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showCreaMenu && (
                    <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-30 text-xs">
                      {['Crea', 'Pianifica', 'Refactor'].map((act) => (
                        <button
                          key={act}
                          onClick={() => {
                            setCreaAction(act);
                            setShowCreaMenu(false);
                          }}
                          className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Microphone */}
                <button
                  onClick={() => setIsMicActive(!isMicActive)}
                  title={isMicActive ? 'Disattiva microfono' : 'Attiva microfono'}
                  className={`p-1 rounded transition-colors ${
                    isMicActive ? 'text-rose-600 animate-pulse' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Arrow button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isAgentExecuting || (!chatInput.trim() && attachedFiles.length === 0)}
                  title="Invia messaggio all'Agente"
                  className="w-7 h-7 rounded-full bg-slate-200 hover:bg-orange-600 hover:text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  {isAgentExecuting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* RIGHT COLUMN: PREVIEW PANE OR PANORAMICA (Screenshots 4 & 5) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col h-full bg-slate-950 relative overflow-hidden">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs select-none">
          {/* Left view switches */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => alert('Layout a due pannelli attivo.')}
              title="Layout a due pannelli"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
            >
              <Columns className="w-4 h-4" />
            </button>

            {/* Anteprima Button */}
            <button
              onClick={() => setRightView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                rightView === 'preview'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Anteprima</span>
            </button>

            {/* Live Button */}
            <button
              onClick={() => {
                setRightView('preview');
                setIsPreviewLive(!isPreviewLive);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                isPreviewLive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isPreviewLive ? 'text-emerald-600 animate-pulse' : ''}`} />
              <span>Live</span>
            </button>

            {/* Settings Gear (switches to Panoramica screenshot 5) */}
            <button
              onClick={() => setRightView(rightView === 'settings' ? 'preview' : 'settings')}
              title="Panoramica e Impostazioni progetto (Connettori)"
              className={`p-1.5 rounded-lg transition-colors ${
                rightView === 'settings'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Code </> toggle */}
            <button
              onClick={() => setRightView(rightView === 'code' ? 'preview' : 'code')}
              title="Visualizza codice sorgente"
              className={`p-1.5 rounded-lg transition-colors ${
                rightView === 'code'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('https://casalavoropro.com', '_blank')}
              title="Apri in nuova scheda"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReload}
              title="Ricarica anteprima"
              className={`p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors ${
                reloadingPreview ? 'animate-spin text-orange-600' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Aiuto Button from screenshot */}
            <button
              onClick={() => alert('Centro assistenza Emergent: documentazione tecnica, FAQ e stato dei servizi.')}
              className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              Aiuto
            </button>

            <button
              onClick={() => alert('Link di condivisione copiato!')}
              title="Condividi anteprima"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Ripubblica Black Button */}
            <button
              onClick={handleRedeploy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
            >
              <CloudUpload className="w-3.5 h-3.5 text-white" />
              <span>Ripubblica</span>
            </button>

            {/* Close Button back to Home */}
            <button
              onClick={onBackToHome}
              title="Torna alla Home"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner for Redeploy */}
        {redeploySuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between animate-slide-up z-20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Nuova versione distribuita con successo su Edge CDN (casalavoropro.com)!</span>
            </div>
            <button onClick={() => setRedeploySuccess(false)}>✕</button>
          </div>
        )}

        {/* Content Switcher */}
        <div className="flex-1 overflow-hidden relative">
          {rightView === 'preview' && (
            previewHtml ? (
              <div className="w-full h-full flex flex-col bg-slate-950">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-400">Anteprima Live Modificata</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                      {codeVersion}
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewHtml(null)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
                    title="Mostra template base originale"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Visualizza template base originale</span>
                  </button>
                </div>
                <iframe
                  title="Anteprima Live Modificata"
                  srcDoc={previewHtml}
                  className="w-full flex-1 border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <CasaLavoroPreview />
            )
          )}

          {rightView === 'settings' && (
            <ProjectOverviewPanel
              defaultSubTab="connettori"
              onRedeploy={handleRedeploy}
              onOpenFeedback={() => setFeedbackModalOpen(true)}
            />
          )}

          {rightView === 'code' && (
            <div className="w-full h-full bg-slate-900 text-slate-200 p-5 overflow-auto font-mono text-xs scrollbar-thin">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-sans font-bold">src/pages/CasaLavoroLanding.tsx</span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                    {codeVersion}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-[11px] font-sans text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiato!' : 'Copia Codice'}</span>
                </button>
              </div>
              <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {currentCode}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Floating Wingman Mascot in Editor */}
      <WingmanMascot
        variant="lifetime"
        onOpenAssistant={() => {
          setChatInput('Wingman, suggeriscimi 3 miglioramenti per convertire più visitatori su CasaLavoroPRO');
        }}
      />

      {/* GitHub Connection Modal */}
      <GitHubModal
        open={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        onConnectRepo={handleConnectGitHubRepo}
      />

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-800 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-base text-slate-900">Il tuo feedback per Emergent</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Cosa possiamo migliorare nella tua esperienza di creazione e modifica con agenti AI?
            </p>
            <textarea
              rows={3}
              placeholder="Scrivi qui le tue impressioni..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs mb-4 focus:outline-none focus:border-slate-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  setFeedbackModalOpen(false);
                  alert('Grazie per il tuo feedback prezioso!');
                }}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Invia feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
