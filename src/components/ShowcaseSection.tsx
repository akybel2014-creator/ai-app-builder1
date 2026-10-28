import { useState, useMemo } from 'react';
import {
  Bookmark,
  Layers,
  Sparkles,
  Layout,
  Briefcase,
  Sliders,
  Smartphone,
  ExternalLink,
  X,
  Copy,
  Check,
  Play,
  Heart,
} from 'lucide-react';

export type ShowcaseCategory =
  | 'Tutti'
  | 'Landing Pages'
  | 'Advanced Apps'
  | 'Business Tools'
  | 'Personal Tools'
  | 'Mobile Apps';

interface ShowcaseItem {
  id: string;
  title: string;
  category: ShowcaseCategory;
  description: string;
  author: string;
  likes: number;
  featuredColor: string;
  renderMockup: () => JSX.Element;
  promptExample: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'auramax',
    title: 'Auramax headphone website',
    category: 'Landing Pages',
    description: 'Sito web di presentazione per cuffie audio ad alta fedeltà con visualizzazione 3D, specifiche e pre-ordine.',
    author: 'Elena R.',
    likes: 342,
    featuredColor: 'from-zinc-900 to-black',
    promptExample: 'Crea una landing page luxury dark per cuffie wireless noise-cancelling Auramax con mockup audio e scheda tecnica.',
    renderMockup: () => (
      <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 flex flex-col justify-between text-white select-none">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span className="font-bold tracking-wider text-white">AURAMAX</span>
          <div className="flex gap-2">
            <span>Features</span>
            <span>Quiet</span>
            <span>Pricing</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] text-zinc-200">Pre-Order</span>
        </div>
        <div className="text-center my-auto py-2">
          {/* Stylized Headphones SVG */}
          <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]">
              {/* Headband */}
              <path
                d="M 20 55 A 32 32 0 0 1 80 55"
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Ear cups */}
              <ellipse cx="20" cy="58" rx="8" ry="14" fill="#fafafa" stroke="#d4d4d8" strokeWidth="2" />
              <ellipse cx="80" cy="58" rx="8" ry="14" fill="#fafafa" stroke="#d4d4d8" strokeWidth="2" />
              <ellipse cx="20" cy="58" rx="5" ry="9" fill="#27272a" />
              <ellipse cx="80" cy="58" rx="5" ry="9" fill="#27272a" />
            </svg>
          </div>
          <h4 className="text-xs font-bold tracking-widest text-zinc-100 uppercase mt-1">AURAMAX</h4>
          <p className="text-[9px] text-zinc-400">Industry-leading noise cancellation & spatial audio.</p>
        </div>
        <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1 border-t border-zinc-800">
          <span>Precision. Power. Purity.</span>
          <span className="text-orange-400 font-semibold">$349 · Available Now</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ops-manager',
    title: 'Ops manager',
    category: 'Advanced Apps',
    description: 'Piattaforma gestionale aziendale con raccomandazioni AI, carichi di lavoro, KPI e pianificazione delle risorse.',
    author: 'Marco V.',
    likes: 489,
    featuredColor: 'from-slate-50 to-slate-100',
    promptExample: 'Costruisci una dashboard operations con tabella compiti aperti, tasso FIE al 92% e suggerimenti AI intelligenti.',
    renderMockup: () => (
      <div className="w-full h-full bg-slate-50 p-3 flex flex-col justify-between text-slate-800 select-none border border-slate-200/80">
        <div className="flex items-center justify-between text-[9px] border-b border-slate-200 pb-1.5">
          <div className="flex items-center gap-1 font-semibold text-slate-900">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 text-white flex items-center justify-center text-[7px]">H</span>
            <span>Helm HR Ops</span>
          </div>
          <span className="text-slate-500">Search tasks...</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 my-2">
          <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
            <div className="text-[7px] text-slate-500">Open Tasks</div>
            <div className="text-[11px] font-bold text-slate-900">128</div>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
            <div className="text-[7px] text-slate-500">FIE Rate</div>
            <div className="text-[11px] font-bold text-emerald-600">92%</div>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
            <div className="text-[7px] text-slate-500">Utilization</div>
            <div className="text-[11px] font-bold text-blue-600">76%</div>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200 shadow-2xs">
            <div className="text-[7px] text-slate-500">Conflicts</div>
            <div className="text-[11px] font-bold text-amber-600">9</div>
          </div>
        </div>
        <div className="bg-white p-2 rounded border border-blue-100 bg-blue-50/30 flex items-center justify-between">
          <div>
            <div className="text-[8px] font-semibold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-blue-600" />
              <span>AI Recommendations</span>
            </div>
            <div className="text-[7px] text-slate-600 mt-0.5">Assign Avery Chen to Client Onboarding (+12%)</div>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[7px] font-medium">Apply</span>
        </div>
      </div>
    ),
  },
  {
    id: 'meditation-app',
    title: 'Meditation app',
    category: 'Mobile Apps',
    description: 'Applicazione mobile-first per meditazione guidata, tracciamento respirazione e suoni rilassanti.',
    author: 'Giulia C.',
    likes: 278,
    featuredColor: 'from-stone-900 to-stone-950',
    promptExample: 'Crea un app mobile di meditazione con saluto "Good Morning", card del corso da 7 sessioni e lettore sonoro minimal.',
    renderMockup: () => (
      <div className="w-full h-full bg-stone-900 flex items-center justify-center p-2">
        <div className="w-36 h-full max-h-48 rounded-xl bg-stone-950 border border-stone-800 p-2.5 flex flex-col justify-between text-stone-100 shadow-lg">
          <div className="flex items-center justify-between text-[8px] text-stone-400">
            <span>9:41</span>
            <div className="w-10 h-2 bg-stone-900 rounded-full mx-auto" />
            <span>100%</span>
          </div>
          <div className="my-auto py-1">
            <h5 className="text-[11px] font-semibold text-white">Good Morning</h5>
            <p className="text-[8px] text-stone-400 mt-0.5">Take a deep breath and start your day.</p>
            <div className="mt-2 bg-stone-900/80 p-2 rounded-lg border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-[7px] text-orange-400 uppercase font-semibold">Course</div>
                <div className="text-[8px] font-bold text-white">7 SESSIONS</div>
              </div>
              <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[9px]">
                <Play className="w-2.5 h-2.5 fill-orange-400" />
              </div>
            </div>
          </div>
          <div className="text-[7px] text-stone-500 text-center">Calm & Mindful · 12 min left</div>
        </div>
      </div>
    ),
  },
  {
    id: 'pelagia-ops',
    title: 'Pelagia Ops Radar',
    category: 'Advanced Apps',
    description: 'Centro di telemetria marina e sonar sottomarino per la mappatura batimetrica e monitoraggio acque profonde.',
    author: 'Luca B.',
    likes: 195,
    featuredColor: 'from-cyan-950 to-slate-950',
    promptExample: 'Interfaccia radar subacqueo con griglia sonar, coordinate geografiche, pressione e telemetria sommergibile.',
    renderMockup: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-3 flex flex-col justify-between text-cyan-200 select-none">
        <div className="flex items-center justify-between text-[8px] border-b border-cyan-800/40 pb-1 text-cyan-400 font-mono">
          <span>PELAGIA OPS // SCANNER</span>
          <span className="text-emerald-400">LIVE FEED</span>
        </div>
        <div className="my-auto flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-cyan-500/40 relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-cyan-500/20" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
            {/* Radar sweep line */}
            <div className="absolute top-0 right-1/2 w-px h-10 bg-gradient-to-b from-cyan-400 to-transparent origin-bottom rotate-45" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[7px] font-mono text-cyan-300/80 pt-1 border-t border-cyan-900/50">
          <div>DEPTH: 3,420m</div>
          <div>TEMP: 2.1°C</div>
          <div>STATUS: NOMINAL</div>
        </div>
      </div>
    ),
  },
  {
    id: 'spiderman',
    title: 'Spider-Man Fan Experience',
    category: 'Landing Pages',
    description: 'Esperienza web cinematografica interattiva con visualizzatore abiti, timeline multiverso e trailer.',
    author: 'Samuele D.',
    likes: 512,
    featuredColor: 'from-red-950 to-black',
    promptExample: 'Landing page cinematografica dark red per un film o serie Spider-Man con costumi interattivi e audio theme.',
    renderMockup: () => (
      <div className="w-full h-full bg-gradient-to-br from-red-950 via-neutral-950 to-black p-3 flex flex-col justify-between text-white select-none">
        <div className="flex items-center justify-between text-[9px] text-red-300">
          <span className="font-bold tracking-widest text-red-500">SPIDER-MAN</span>
          <span className="text-neutral-400 text-[8px]">MULTIVERSE ARCHIVE</span>
        </div>
        <div className="text-center my-auto">
          <div className="w-10 h-10 mx-auto rounded-full bg-red-600/30 border border-red-500/60 flex items-center justify-center mb-1">
            <span className="text-red-400 font-bold text-xs">🕷️</span>
          </div>
          <h4 className="text-xs font-black tracking-wider text-red-500">BE GREATER TOGETHER</h4>
          <p className="text-[8px] text-neutral-400 mt-0.5">Explore Peter & Miles suit variations in 4K.</p>
        </div>
        <div className="flex justify-between items-center text-[7px] text-neutral-500 border-t border-neutral-800 pt-1">
          <span>Marvel / Sony Interactive</span>
          <span className="text-red-400 font-medium">Watch Trailer →</span>
        </div>
      </div>
    ),
  },
  {
    id: 'memory-map',
    title: 'Memory Map',
    category: 'Personal Tools',
    description: 'Mappa interattiva per appuntare ricordi, foto ed emozioni sui luoghi visitati in tutto il mondo.',
    author: 'Chiara T.',
    likes: 310,
    featuredColor: 'from-amber-50 to-sky-50',
    promptExample: 'Mappa del mondo per diario di viaggio dove ogni città salvata ha una spilla emoji e una nota personale.',
    renderMockup: () => (
      <div className="w-full h-full bg-sky-100/60 p-3 flex flex-col justify-between text-slate-800 select-none relative overflow-hidden">
        <div className="flex items-center justify-between text-[9px] border-b border-sky-200 pb-1 z-10 bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded">
          <span className="font-bold text-sky-900">🗺️ Memory Map</span>
          <span className="text-sky-700 text-[8px]">14 Countries Visited</span>
        </div>
        {/* World map stylized outline representation */}
        <div className="my-auto relative h-20 w-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 flex items-center justify-around">
            <div className="w-16 h-12 bg-emerald-500 rounded-3xl transform -rotate-6" />
            <div className="w-20 h-14 bg-emerald-500 rounded-2xl transform rotate-3" />
            <div className="w-12 h-10 bg-emerald-500 rounded-2xl" />
          </div>
          {/* Pins */}
          <div className="relative z-10 flex gap-6 items-center">
            <span className="text-xs animate-bounce" title="Roma: Vacanza 2025">💛</span>
            <span className="text-xs" title="Tokyo: Ramen tour">🍣</span>
            <span className="text-xs" title="New York: Broadway">🗽</span>
            <span className="text-xs" title="Parigi: Tour Eiffel">✨</span>
          </div>
        </div>
        <div className="text-[7px] text-slate-600 bg-white/80 p-1 rounded border border-slate-200 z-10">
          Click on any city pin to read past journal reflections.
        </div>
      </div>
    ),
  },
];

const CATEGORIES: ShowcaseCategory[] = [
  'Tutti',
  'Landing Pages',
  'Advanced Apps',
  'Business Tools',
  'Personal Tools',
  'Mobile Apps',
];

interface ShowcaseSectionProps {
  onSelectProjectTemplate: (title: string, prompt: string) => void;
}

export default function ShowcaseSection({ onSelectProjectTemplate }: ShowcaseSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<ShowcaseCategory>('Tutti');
  const [activeItemModal, setActiveItemModal] = useState<ShowcaseItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Tutti') return SHOWCASE_ITEMS;
    return SHOWCASE_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <section className="mt-12 pt-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-1">
        <Bookmark className="w-5 h-5 text-slate-800 fill-slate-800" />
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Vetrina</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Esplora cosa sta costruendo la community con Emergent.
      </p>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-2 mb-8">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shadow-xs ${
                isActive
                  ? 'bg-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'Tutti' && <Layers className="w-3.5 h-3.5" />}
              {cat === 'Landing Pages' && <Layout className="w-3.5 h-3.5" />}
              {cat === 'Advanced Apps' && <Sparkles className="w-3.5 h-3.5" />}
              {cat === 'Business Tools' && <Briefcase className="w-3.5 h-3.5" />}
              {cat === 'Personal Tools' && <Sliders className="w-3.5 h-3.5" />}
              {cat === 'Mobile Apps' && <Smartphone className="w-3.5 h-3.5" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItemModal(item)}
            className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col"
          >
            {/* Visual Thumbnail Frame */}
            <div className="h-48 w-full bg-slate-950 relative overflow-hidden group-hover:brightness-95 transition-all">
              {item.renderMockup()}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                <span>Creato da {item.author}</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-100 text-rose-500" />
                  <span className="tabular-nums font-medium text-slate-700">{item.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal Preview */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeItemModal.title}</h3>
                <p className="text-xs text-slate-500">{activeItemModal.category} · di {activeItemModal.author}</p>
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="h-60 w-full bg-slate-950 overflow-hidden relative">
              {activeItemModal.renderMockup()}
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeItemModal.description}
              </p>

              {/* Prompt box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span>Prompt di generazione utilizzato:</span>
                  <button
                    onClick={() => handleCopyPrompt(activeItemModal.promptExample)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copia prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-800 font-mono bg-white p-2.5 rounded border border-slate-200/80">
                  {activeItemModal.promptExample}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setActiveItemModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Chiudi
                </button>
                <button
                  onClick={() => {
                    const prompt = activeItemModal.promptExample;
                    const title = activeItemModal.title;
                    setActiveItemModal(null);
                    onSelectProjectTemplate(title, prompt);
                  }}
                  className="px-4 py-2 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Usa questo modello</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
