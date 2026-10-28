import { useState } from 'react';
import {
  Search,
  Menu,
  X,
  Star,
  MapPin,
  CheckCircle,
  Phone,
  Shield,
  Laptop,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface Artisan {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  verified: boolean;
  priceNote: string;
}

const SAMPLE_ARTISANS: Artisan[] = [
  {
    id: '1',
    name: 'IdroClima Berica S.r.l.',
    category: 'Idraulico',
    city: 'Vicenza Centro (VI)',
    rating: 4.9,
    reviewsCount: 84,
    phone: '+39 0444 829102',
    verified: true,
    priceNote: 'Sopralluogo gratuito in 24h',
  },
  {
    id: '2',
    name: 'ElettroVeneto Impianti',
    category: 'Elettricista',
    city: 'Vicenza Ovest & Thiene',
    rating: 4.8,
    reviewsCount: 62,
    phone: '+39 0444 712093',
    verified: true,
    priceNote: 'Certificazione conformità inclusa',
  },
  {
    id: '3',
    name: 'Color & Design F.lli Viero',
    category: 'Imbianchino',
    city: 'Montecchio Maggiore (VI)',
    rating: 4.9,
    reviewsCount: 110,
    phone: '+39 0444 654311',
    verified: true,
    priceNote: 'Tinteggiature ecologiche e rasature',
  },
  {
    id: '4',
    name: 'TermoClima Service',
    category: 'Climatizzazione',
    city: 'Vicenza Est',
    rating: 4.7,
    reviewsCount: 47,
    phone: '+39 0444 338812',
    verified: true,
    priceNote: 'Installatore autorizzato Daikin/Mitsubishi',
  },
  {
    id: '5',
    name: 'Officina Fabbro Sartori',
    category: 'Fabbro',
    city: 'Bassano del Grappa (VI)',
    rating: 5.0,
    reviewsCount: 39,
    phone: '+39 0424 554100',
    verified: true,
    priceNote: 'Pronto intervento serrature e ringhiere',
  },
  {
    id: '6',
    name: 'Edil Palladio Ristrutturazioni',
    category: 'Muratore',
    city: 'Schio & Valdagno',
    rating: 4.8,
    reviewsCount: 76,
    phone: '+39 0445 992100',
    verified: true,
    priceNote: 'Sgravi fiscali 50% gestiti internamente',
  },
];

export default function CasaLavoroPreview() {
  const [searchWhat, setSearchWhat] = useState('');
  const [searchWhere, setSearchWhere] = useState('Vicenza');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestSentArtisan, setRequestSentArtisan] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const categories = [
    'Idraulico',
    'Elettricista',
    'Imbianchino',
    'Climatizzazione',
    'Fabbro',
    'Muratore',
  ];

  const filteredArtisans = SAMPLE_ARTISANS.filter((a) => {
    const matchCategory = selectedCategory ? a.category === selectedCategory : true;
    const matchWhat = searchWhat
      ? a.category.toLowerCase().includes(searchWhat.toLowerCase()) ||
        a.name.toLowerCase().includes(searchWhat.toLowerCase())
      : true;
    const matchWhere = searchWhere
      ? a.city.toLowerCase().includes(searchWhere.toLowerCase())
      : true;
    return matchCategory && matchWhat && matchWhere;
  });

  const handleRequestQuote = (id: string) => {
    setRequestSentArtisan(id);
    setTimeout(() => {
      setRequestSentArtisan(null);
    }, 3000);
  };

  const handleTriggerRecovery = () => {
    setRecovering(true);
    setTimeout(() => {
      setRecovering(false);
    }, 2500);
  };

  return (
    <div className="relative w-full min-h-full bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-orange-500/30 overflow-y-auto">
      {/* 1. Orange Top Announcement Bar */}
      <div className="w-full bg-orange-600 px-4 py-2 text-center text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Iscrizione gratis per tutti · Aziende e privati, registratevi senza alcun costo.</span>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="underline font-bold hover:text-orange-100 ml-1 inline-flex items-center gap-0.5"
        >
          <span>Registrati gratis</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-950/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-md shadow-orange-600/30">
            {/* Orange Roof Icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 3.2L17.5 11H6.5L12 6.2zM7 18v-5h10v5H7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CasaLavoro<span className="text-orange-500 font-extrabold">PRO</span>
          </span>
        </div>

        {/* Desktop Nav / Mobile Hamburger */}
        <div className="hidden md:flex items-center gap-5 text-xs text-slate-300">
          <span className="hover:text-white cursor-pointer transition-colors">Come funziona</span>
          <span className="hover:text-white cursor-pointer transition-colors">Per i Professionisti</span>
          <span className="hover:text-white cursor-pointer transition-colors">Preventivi</span>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
          >
            Accedi
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-sm text-slate-200">
          <div className="py-1">Come funziona</div>
          <div className="py-1">Per i Professionisti</div>
          <div className="py-1">Preventivi</div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setShowRegisterModal(true);
            }}
            className="w-full mt-2 py-2 text-center rounded bg-orange-600 text-white font-bold"
          >
            Registrati o Accedi
          </button>
        </div>
      )}

      {/* 3. Hero Section */}
      <main className="px-6 py-10 max-w-4xl mx-auto w-full flex-1">
        {/* Kicker */}
        <div className="text-center md:text-left mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
            IL MARKETPLACE DEI LAVORI IN CASA
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white text-center md:text-left leading-tight">
          Trova l'artigiano giusto per <span className="text-orange-500">casa tua</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-sm md:text-base text-slate-300 text-center md:text-left max-w-2xl leading-relaxed">
          Aziende e artigiani verificati per ristrutturazioni, impianti, riparazioni e piccoli lavori di casa in tutta Italia. Cerca nella tua zona e richiedi un preventivo gratuito in pochi minuti.
        </p>

        {/* Search Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-white mb-1">Trova Professionista</h2>
          <p className="text-xs text-slate-400 mb-5">
            Cerca aziende e artigiani verificati nella tua zona e richiedi un preventivo gratuito.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Cosa cerchi</label>
              <input
                type="text"
                value={searchWhat}
                onChange={(e) => setSearchWhat(e.target.value)}
                placeholder="Es. Idraulico, Elettricista"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Dove</label>
              <input
                type="text"
                value={searchWhere}
                onChange={(e) => setSearchWhere(e.target.value)}
                placeholder="Es. Vicenza"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={() => {}}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Avvia Ricerca</span>
          </button>

          {/* Quick Categories */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Categorie popolari:</span>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isActive ? null : cat)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Search Results List */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>
              Trovati <strong className="text-white">{filteredArtisans.length}</strong> professionisti a {searchWhere || 'tutta Italia'}
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-orange-400 hover:underline"
              >
                Rimuovi filtro {selectedCategory}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredArtisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{artisan.name}</h3>
                    {artisan.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Verificato</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="text-orange-400 font-medium">{artisan.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {artisan.city}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <strong className="text-white">{artisan.rating}</strong> ({artisan.reviewsCount})
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>{artisan.priceNote}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${artisan.phone}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title={artisan.phone}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRequestQuote(artisan.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                      requestSentArtisan === artisan.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-500 text-white'
                    }`}
                  >
                    {requestSentArtisan === artisan.id ? 'Richiesta Inviata! ✓' : 'Preventivo Gratuito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. Bottom Static Preview Floating Bar */}
      <div className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Laptop className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Questa è un'anteprima statica, il tuo sito web si sta riprendendo e potrebbe richiedere 1-2 minuti
          </span>
        </div>
        <button
          onClick={handleTriggerRecovery}
          disabled={recovering}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all shrink-0 cursor-pointer disabled:opacity-60"
        >
          {recovering ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
              <span>Ripresa in corso...</span>
            </>
          ) : (
            <span>Ripresa in corso</span>
          )}
        </button>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">Registrati a CasaLavoroPRO</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Iscrizione 100% gratuita sia per privati in cerca di preventivi che per professionisti ed imprese locali.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome e Cognome o Ragione Sociale"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
              <input
                type="email"
                placeholder="Indirizzo Email"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
              />
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-full bg-orange-600 hover:bg-orange-500 py-2.5 rounded-lg text-xs font-bold text-white transition-colors"
              >
                Completa Iscrizione Gratuita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
