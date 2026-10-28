import { useState, useEffect, useMemo } from 'react';
import type { Project, ProjectType } from '@/types';
import CreateProjectModal from '@/components/CreateProjectModal';
import ProjectCard from '@/components/ProjectCard';
import {
  Plus,
  ArrowRight,
  AlertCircle,
  Keyboard,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  aiConfigured: boolean;
  onCreateProject: (data: { name: string; description: string; type: Project['type'] }) => Project;
  onOpenProject: (project: Project) => void;
  onExportProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onGoToSettings: () => void;
  onOpenShortcuts?: () => void;
}

const QUICK_SUGGESTIONS = [
  {
    label: 'Landing Page Corso',
    text: 'Landing page per un corso professionale con programma moduli, recensioni e modulo di iscrizione responsive.',
    type: 'landing-page' as ProjectType,
  },
  {
    label: 'Dashboard Analitica',
    text: 'Dashboard aziendale con grafici di vendita, KPI del mese, tabella ordini e statistiche utente.',
    type: 'dashboard' as ProjectType,
  },
  {
    label: 'Web App Prenotazioni',
    text: 'Applicazione web per prenotare servizi o appuntamenti con selezione data, orario e conferma via email.',
    type: 'web-app' as ProjectType,
  },
  {
    label: 'E-commerce Veloce',
    text: 'Negozio online essenziale con catalogo prodotti, carrello interattivo e cassa con riepilogo ordine.',
    type: 'ecommerce' as ProjectType,
  },
];

export default function Dashboard({
  projects,
  aiConfigured,
  onCreateProject,
  onOpenProject,
  onExportProject,
  onDeleteProject,
  onGoToSettings,
  onOpenShortcuts,
}: DashboardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType>('web-app');
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Alt+N to open new project modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (isInput) return;

      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateFromModal = (data: {
    name: string;
    description: string;
    type: Project['type'];
  }) => {
    const project = onCreateProject(data);
    setModalOpen(false);
    onOpenProject(project);
  };

  const handleInstantCreate = () => {
    const text = promptText.trim();
    if (!text) {
      setModalOpen(true);
      return;
    }
    // Generate a natural concise project name from the prompt
    const words = text
      .replace(/[^\w\s\u00C0-\u017F]/gi, '')
      .split(/\s+/)
      .filter(Boolean);
    const firstWords = words.slice(0, 4).join(' ');
    const name = firstWords.length > 3
      ? firstWords.charAt(0).toUpperCase() + firstWords.slice(1)
      : 'Nuova Applicazione';

    const project = onCreateProject({
      name,
      description: text,
      type: selectedType,
    });
    setPromptText('');
    onOpenProject(project);
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleInstantCreate();
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-12 overflow-x-hidden">
      {/* AI not configured banner - discreet and helpful */}
      {!aiConfigured && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Configura il modello IA per iniziare</p>
              <p className="text-xs text-surface-300 mt-0.5">
                Aggiungi la tua chiave API (Google Gemini, OpenAI, Anthropic o Groq) per generare codice in tempo reale.
              </p>
            </div>
          </div>
          <button
            onClick={onGoToSettings}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-surface-950 hover:bg-amber-300 transition-colors"
          >
            Configura IA
          </button>
        </div>
      )}

      {/* Primary Action & Creation Hero (Emergent Usability Style) */}
      <div className="mb-10 p-6 sm:p-8 rounded-2xl glass-strong border border-surface-800/80 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-accent-300 mb-2">
            <Zap className="w-4 h-4 text-accent-400" />
            <span>Flusso Immediato con Anteprima Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Cosa vuoi costruire oggi?
          </h1>
          <p className="text-surface-400 text-sm sm:text-base mt-2 leading-relaxed">
            Descrivi l&apos;applicazione che hai in mente. L&apos;editor aprirà la chat con l&apos;anteprima live per creare e perfezionare il risultato passo dopo passo.
          </p>
        </div>

        {/* Conversational Prompt Box */}
        <div className="mt-6 space-y-3">
          <div className="relative rounded-xl bg-surface-900/90 border border-surface-700/70 focus-within:border-accent-500/60 focus-within:ring-2 focus-within:ring-accent-400/20 transition-all">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Es. Crea una landing page per un corso di cucina con programma delle lezioni, prezzi e form di iscrizione..."
              rows={3}
              className="w-full px-4 pt-3.5 pb-12 bg-transparent text-white text-sm placeholder:text-surface-500 focus:outline-none resize-none leading-relaxed scrollbar-thin"
              maxLength={1500}
            />

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2 border-t border-surface-800/80 pt-2.5">
              {/* Type selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[11px] text-surface-400 font-medium hidden sm:inline">Tipo:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ProjectType)}
                  className="bg-surface-800 text-surface-200 text-xs rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-accent-500 cursor-pointer"
                >
                  <option value="web-app">Web App</option>
                  <option value="landing-page">Landing Page</option>
                  <option value="website">Sito Web</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="portfolio">Portfolio</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                  title="Configura nome e opzioni in dettaglio"
                >
                  <span>Opzioni avanzate</span>
                </button>

                <button
                  type="button"
                  onClick={handleInstantCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-surface-950 font-semibold text-xs sm:text-sm hover:from-accent-400 hover:to-accent-500 transition-all glow-accent active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Avvia Progetto</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Prompt suggestion chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-surface-500 text-[11px] font-medium">Esempi rapidi:</span>
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setPromptText(item.text);
                  setSelectedType(item.type);
                }}
                className="px-2.5 py-1 rounded-lg bg-surface-800/80 hover:bg-surface-700/80 text-surface-300 hover:text-white border border-surface-700/60 transition-colors text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">I tuoi progetti</h2>
            {projects.length > 0 && (
              <span className="text-xs font-medium text-surface-400 px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700/60">
                {projects.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search filter if there are projects */}
            {projects.length > 2 && (
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca progetti..."
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-900/80 border border-surface-800 rounded-xl text-xs text-white placeholder:text-surface-500 focus:outline-none focus:border-accent-500/60 transition-colors"
                />
              </div>
            )}

            {/* Standard New Project Modal button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700/70 text-white text-xs font-semibold transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4 text-accent-400" />
              <span>Nuovo con opzioni</span>
            </button>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700/70 text-surface-400 hover:text-white transition-colors"
                title="Scorciatoie da tastiera (?)"
                aria-label="Scorciatoie da tastiera"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState onCreate={() => setModalOpen(true)} />
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center glass rounded-2xl border border-surface-800">
            <p className="text-sm text-surface-400">Nessun progetto trovato per &ldquo;{searchQuery}&rdquo;.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-accent-400 hover:underline"
            >
              Azzera ricerca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={onOpenProject}
                onExport={onExportProject}
                onDelete={onDeleteProject}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateFromModal}
      />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl glass border border-surface-800/80">
      <div className="w-16 h-16 rounded-2xl bg-surface-800/80 border border-surface-700/60 flex items-center justify-center mb-4 text-accent-400">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">Nessun progetto creato</h3>
      <p className="text-xs text-surface-400 max-w-sm mb-5 leading-relaxed">
        Usa la barra in alto per descrivere la tua applicazione oppure clicca per configurarla in dettaglio.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-surface-950 font-semibold text-xs hover:bg-accent-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Crea il primo progetto</span>
      </button>
    </div>
  );
}
