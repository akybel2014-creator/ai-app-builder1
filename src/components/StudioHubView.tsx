import { useState } from 'react';
import {
  ChevronDown,
  Layers,
  Smartphone,
  Globe,
  Video,
  Lightbulb,
  Plus,
  Mic,
  MicOff,
  ArrowUp,
  Bot,
  MoreHorizontal,
  Code,
  Laptop,
  Upload,
  Github,
  GitFork,
} from 'lucide-react';
import ShowcaseSection from '@/components/ShowcaseSection';
import EmergentFooter from '@/components/EmergentFooter';
import WingmanMascot from '@/components/WingmanMascot';

interface StudioHubViewProps {
  onOpenProject: (projectId: string) => void;
  onCreateWithPrompt: (prompt: string, type: 'web' | 'mobile' | 'website' | 'video' | 'brainstorm') => void;
  onOpenConsultant?: () => void;
}

type TabType = 'web' | 'mobile' | 'website' | 'video' | 'brainstorm';
type ProjectFilter = 'tutti' | 'applicazioni' | 'pubblicate' | 'video';

export default function StudioHubView({
  onOpenProject,
  onCreateWithPrompt,
  onOpenConsultant,
}: StudioHubViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('web');
  const [promptValue, setPromptValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [engineModel, setEngineModel] = useState('E-1');
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [createAction, setCreateAction] = useState('Crea');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('tutti');
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [quickAssistantOpen, setQuickAssistantOpen] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  const handleSendPrompt = () => {
    let text = promptValue.trim() || 'Costruiscimi una landing page moderna per CasaLavoroPRO';
    if (attachedFileName) {
      text += ` (con risorsa allegata: ${attachedFileName})`;
    }
    onCreateWithPrompt(text, activeTab);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setPromptValue(suggestion);
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between">
      {/* 1. Sky Hero Backdrop */}
      <div className="relative sky-gradient-bg pt-14 pb-20 px-4 md:px-8 overflow-hidden select-none">
        {/* Soft Fluffy Clouds CSS shapes */}
        <div className="absolute top-4 left-10 w-96 h-36 rounded-full cloud-puff-1 pointer-events-none" />
        <div className="absolute top-12 right-12 w-80 h-44 rounded-full cloud-puff-2 pointer-events-none" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-48 rounded-full cloud-puff-1 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Project Selector Pill */}
          <div className="mb-6">
            <button
              onClick={() => alert("Progetto attivo: Aky's Project")}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-slate-800 text-xs font-semibold backdrop-blur-md border border-white/60 shadow-xs hover:shadow-sm transition-all"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-xs" />
              <span>Aky's Project</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center drop-shadow-xs mb-8">
            Cosa costruirai oggi?
          </h1>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-white/70 shadow-xs mb-4 max-w-full overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'web'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>App web</span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'mobile'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>App mobile</span>
            </button>

            <button
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'website'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sito web</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'video'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-rose-600" />
              <span>Video</span>
              <span className="bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                NUOVO
              </span>
            </button>

            <button
              onClick={() => setActiveTab('brainstorm')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'brainstorm'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Brainstorm</span>
            </button>
          </div>

          {/* Prompt Input Box */}
          <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl p-4 md:p-5 relative transition-all focus-within:border-slate-400 focus-within:shadow-2xl">
            <textarea
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              rows={3}
              placeholder="Costruiscimi un dashboard per..."
              className="w-full text-sm md:text-base text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-none scrollbar-thin"
            />

            {/* Inner Bottom Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
              {/* Left Group: +, E-1, Maxx */}
              <div className="flex items-center gap-2">
                {/* "+" Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    title="Menu opzioni e risorse (+)"
                    className={`p-1.5 rounded-lg transition-all ${
                      showPlusMenu
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
                    }`}
                  >
                    <Plus className={`w-4 h-4 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
                  </button>

                  {/* Contextual Menu */}
                  {showPlusMenu && (
                    <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-scale-in">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                        Risorse & Azioni
                      </div>

                      {/* 1. Carica file e risorse da PC */}
                      <label className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setAttachedFileName(f.name);
                              setShowPlusMenu(false);
                            }
                          }}
                        />
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            Carica file e risorse da PC
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Immagini, PDF, schemi database e codice
                          </div>
                        </div>
                      </label>

                      {/* 2. Collegamento a GitHub */}
                      <button
                        onClick={() => {
                          setShowPlusMenu(false);
                          alert('Apri la chat del progetto per gestire la sincronizzazione GitHub completa.');
                          onOpenProject('home-pro-landing');
                        }}
                        className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <Github className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">
                            Collegamento a GitHub
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                            Sincronizza repository, rami e commit automatici
                          </div>
                        </div>
                      </button>

                      {/* 3. Fork questa chat */}
                      <button
                        onClick={() => {
                          setShowPlusMenu(false);
                          onOpenProject('home-pro-landing');
                        }}
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

                {/* Engine Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowEngineMenu(!showEngineMenu)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Code className="w-3 h-3 text-slate-600" />
                    <span>{engineModel}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showEngineMenu && (
                    <div className="absolute left-0 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 text-xs">
                      {['E-1', 'E-2 Turbo', 'Auto Model'].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setEngineModel(m);
                            setShowEngineMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Maxx Pill */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xs">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Maxx</span>
                </div>
              </div>

              {/* Right Group: </> Crea, Mic, Send Arrow */}
              <div className="flex items-center gap-2">
                {/* Crea Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span>&lt;/&gt; {createAction}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showCreateMenu && (
                    <div className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 text-xs">
                      {['Crea', 'Pianifica', 'Prototipo'].map((act) => (
                        <button
                          key={act}
                          onClick={() => {
                            setCreateAction(act);
                            setShowCreateMenu(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Microphone Voice Input */}
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  title={isRecording ? 'Interrompi registrazione' : 'Ditta con la voce'}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-rose-50 text-rose-600 animate-pulse'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSendPrompt}
                  title="Invia e genera"
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-orange-600 hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-xs hover:shadow-md cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex items-center justify-center gap-2.5 mt-5 flex-wrap">
            <button
              onClick={() => handleQuickSuggestion('Avvia assistenza con Wingman per progettare la mia applicazione')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-medium border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>Wingman</span>
              <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                Beta
              </span>
            </button>

            <button
              onClick={() => handleQuickSuggestion('Crea un alter ego virtuale per interagire con i clienti sul mio portfolio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-medium border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Il Mio Alter Ego</span>
            </button>

            <button
              onClick={() => handleQuickSuggestion('Costruisci un generatore di conti e fatture per liberi professionisti')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-medium border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Generatore di Conti</span>
            </button>

            <button
              onClick={() => handleQuickSuggestion('Crea una web app per la Parola del Giorno con quiz e pronuncia audio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-medium border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Parola del Giorno</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. User Projects Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full pt-10 pb-6">
        {/* Project Filters Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setProjectFilter('tutti')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                projectFilter === 'tutti'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tutti (2)
            </button>
            <button
              onClick={() => setProjectFilter('applicazioni')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                projectFilter === 'applicazioni'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3 h-3 text-slate-500" />
              <span>Applicazioni</span>
            </button>
            <button
              onClick={() => setProjectFilter('pubblicate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                projectFilter === 'pubblicate'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Pubblicate</span>
            </button>
            <button
              onClick={() => setProjectFilter('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                projectFilter === 'video'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3 h-3 text-slate-500" />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Project Card: Home Pro Landing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            onClick={() => onOpenProject('home-pro-landing')}
            className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
          >
            {/* Card Thumbnail */}
            <div className="h-44 w-full bg-slate-950 p-3 relative flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-orange-400 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  CasaLavoroPRO
                </span>
                <span className="bg-orange-600/30 text-orange-300 px-1.5 py-0.5 rounded text-[9px]">
                  Pubblicato
                </span>
              </div>

              <div className="my-auto py-2">
                <div className="text-[10px] uppercase font-bold text-orange-500">IL MARKETPLACE DEI LAVORI</div>
                <h4 className="text-sm font-extrabold text-white">Trova l'artigiano giusto per casa tua</h4>
                <div className="mt-2 bg-slate-900 p-1.5 rounded border border-slate-800 flex items-center justify-between text-[8px] text-slate-400">
                  <span>Vicenza, IT</span>
                  <span className="text-orange-400">Ricerca Artigiani</span>
                </div>
              </div>

              <div className="text-[8px] text-slate-500 flex justify-between">
                <span>casalavoropro.com</span>
                <span className="text-emerald-400">Attivo</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  Home Pro Landing
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Aggiornato 1 ora fa</p>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProjectMenuOpen(!projectMenuOpen);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {projectMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectMenuOpen(false);
                        onOpenProject('home-pro-landing');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Apri Editor
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectMenuOpen(false);
                        alert('Progetto duplicato.');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      Duplica
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase Section (Vetrina from screenshot 2) */}
      <ShowcaseSection
        onSelectProjectTemplate={(title, prompt) => {
          setPromptValue(prompt);
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }}
      />

      {/* 4. Footer (from screenshot 3) */}
      <EmergentFooter />

      {/* Floating Wingman Mascot in bottom-left */}
      <WingmanMascot
        variant="business"
        onOpenAssistant={() => setQuickAssistantOpen(true)}
      />

      {/* Bottom-right Chat Bubble */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setQuickAssistantOpen(!quickAssistantOpen)}
          title="Assistente Chat Rapido"
          className="w-12 h-12 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all cursor-pointer"
        >
          {/* Smiley Chat Icon from screenshot */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.245-1.312C8.652 21.449 10.276 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-6 4a4.5 4.5 0 0 0 6 0h2a6.5 6.5 0 0 1-10 0h2z" />
          </svg>
        </button>
      </div>

      {/* Quick Assistant Drawer */}
      {quickAssistantOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 text-xs animate-slide-up">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Emergent Chat Support</span>
            </span>
            <button
              onClick={() => setQuickAssistantOpen(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <div className="py-3 text-slate-600 space-y-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Benvenuto su Emergent! Vuoi modificare la tua landing page o esplorare le integrazioni AI?
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                setQuickAssistantOpen(false);
                onOpenProject('home-pro-landing');
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-center"
            >
              Apri Editor e Chatta con l'Agente
            </button>
            {onOpenConsultant && (
              <button
                onClick={() => {
                  setQuickAssistantOpen(false);
                  onOpenConsultant();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-xl text-center"
              >
                Incontra un Consulente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
