import { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Tag,
  Sparkles,
  CloudUpload,
  ChevronDown,
  Bell,
  RefreshCw,
  FileCode,
  Loader2,
  CheckCircle2,
  Activity,
  Globe,
  Plug,
  Key,
  CreditCard,
  Database,
  Layers,
} from 'lucide-react';
import AnalyticsView from '@/components/AnalyticsView';
import GeminiConnectorCard from '@/components/GeminiConnectorCard';

interface ProjectOverviewPanelProps {
  onRedeploy: () => void;
  onOpenFeedback: () => void;
  defaultSubTab?: 'panoramica' | 'analisi' | 'monitoraggio' | 'dominio' | 'connettori' | 'segreti' | 'pagamenti' | 'database' | 'risorse';
}

export default function ProjectOverviewPanel({
  onRedeploy,
  onOpenFeedback,
  defaultSubTab = 'analisi',
}: ProjectOverviewPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'panoramica' | 'analisi' | 'monitoraggio' | 'dominio' | 'connettori' | 'segreti' | 'pagamenti' | 'database' | 'risorse'>(defaultSubTab);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [healthStatus, setHealthStatus] = useState<string>('Controllo di Stato');
  const [healthCheckRunning, setHealthCheckRunning] = useState(false);
  const [healthCheckResult, setHealthCheckResult] = useState<{ score: number; checks: string[] } | null>(null);
  const [activeLogModal, setActiveLogModal] = useState<string | null>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://casalavoropro.com');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const runHealthCheck = () => {
    setHealthCheckRunning(true);
    setHealthCheckResult(null);
    setTimeout(() => {
      setHealthCheckRunning(false);
      setHealthCheckResult({
        score: 98,
        checks: [
          'Prestazioni server Edge: 28ms (Ottimale)',
          'Certificato SSL Let\'s Encrypt: Attivo & Valido',
          'Database Firebase & Auth: Operativi',
          'SEO Meta Tags & OpenGraph: Conformi',
        ],
      });
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-white text-slate-800 flex overflow-hidden">
      {/* Submenu Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-200/90 p-4 space-y-6 bg-slate-50/50 overflow-y-auto scrollbar-thin text-xs">
        {/* Main Section */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveSubTab('panoramica')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
              activeSubTab === 'panoramica'
                ? 'bg-slate-200/80 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>Panoramica</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analisi')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'analisi'
                ? 'bg-slate-200/80 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Analisi
          </button>

          <button
            onClick={() => setActiveSubTab('monitoraggio')}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
              activeSubTab === 'monitoraggio'
                ? 'bg-slate-200/80 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Monitoraggio
          </button>
        </div>

        {/* Configurazione */}
        <div>
          <div className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Configurazione
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSubTab('dominio')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'dominio' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dominio
            </button>
            <button
              onClick={() => setActiveSubTab('connettori')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'connettori' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Connettori
            </button>
            <button
              onClick={() => setActiveSubTab('segreti')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'segreti' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Segreti
            </button>
            <button
              onClick={() => setActiveSubTab('pagamenti')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'pagamenti' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pagamenti
            </button>
          </div>
        </div>

        {/* Configura */}
        <div>
          <div className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Configura
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveSubTab('database')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'database' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Database
            </button>
            <button
              onClick={() => setActiveSubTab('risorse')}
              className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'risorse' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Risorse
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-thin flex flex-col justify-between">
        {/* Render Analisi View matching screenshot */}
        {activeSubTab === 'analisi' && <AnalyticsView />}

        {/* Render Panoramica View */}
        {activeSubTab === 'panoramica' && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Panoramica</h2>
              <p className="text-xs text-slate-500 mt-1">
                Visualizza i dettagli chiave del tuo sito web pubblicato e come massimizzarne la crescita
              </p>
            </div>

            {/* 1. Status & Domain Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>home-pro-landing</span>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    <span className="font-semibold text-slate-700">225 / mese</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <a
                    href="https://casalavoropro.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                  >
                    <span>casalavoropro.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    title="Copia link"
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onRedeploy}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4 text-white" />
                <span>Ripubblica</span>
              </button>
            </div>

            {/* 2. Annual Discount Banner */}
            <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Tag className="w-4 h-4 text-sky-600" />
                <span>Ottieni 2 mesi gratis con un piano annuale</span>
              </div>
              <button
                onClick={() => alert('Passaggio al piano annuale con sconto del 16% attivato.')}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Passa all'annuale
              </button>
            </div>

            {/* 3. Health Check Section */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Esegui un controllo di salute</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lascia che un subagente specializzato esamini il tuo sito web pubblicato
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="Controllo di Stato">Controllo di Stato</option>
                  <option value="Controllo Prestazioni">Controllo Prestazioni</option>
                  <option value="Controllo Sicurezza SSL">Controllo Sicurezza SSL</option>
                  <option value="Controllo Database">Controllo Database</option>
                </select>

                <button
                  onClick={runHealthCheck}
                  disabled={healthCheckRunning}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200/80 transition-all cursor-pointer disabled:opacity-60"
                >
                  {healthCheckRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Scansione in corso...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Esegui</span>
                    </>
                  )}
                </button>
              </div>

              {/* Health check result */}
              {healthCheckResult && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Salute del sito: {healthCheckResult.score}/100 (Eccellente)</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 pl-6 list-disc">
                    {healthCheckResult.checks.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Published Versions List */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Versioni pubblicate</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Tutte le versioni pubblicate del tuo sito web</p>
                </div>

                {/* Attiva avvisi toggle */}
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    alertsEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{alertsEnabled ? 'Avvisi Attivi' : 'Attiva avvisi'}</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {/* Version 52 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>52ª pubblicazione</span>
                    </div>
                    <div className="text-slate-500 text-[11px] font-mono pl-4">
                      14 ore fa · <span className="text-slate-700">7ea9bd9</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLogModal('52ª pubblicazione')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-500" />
                    <span>Visualizza log</span>
                  </button>
                </div>

                {/* Version 51 */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>51ª pubblicazione</span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono pl-4">
                      3 giorni fa · <span className="text-slate-500">1707f37</span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Ripristino alla versione 51 avviato.')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ripristina</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other SubTabs */}
        {activeSubTab === 'monitoraggio' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monitoraggio & Uptime</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Activity className="w-4 h-4" />
                <span>Tutti i sistemi sono operativi al 100% (Uptime 99.98% negli ultimi 30 giorni)</span>
              </div>
              <p className="text-xs text-slate-500">
                Tempi di risposta medi server: 32ms. Nessuna anomalia riscontrata nei controlli Edge.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'dominio' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Configurazione Dominio</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900">casalavoropro.com</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Attivo & SSL</span>
                </div>
                <button onClick={() => alert('Record DNS sincronizzati.')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                  Verifica DNS
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'connettori' && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Connettori &amp; Integrazioni</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configura i servizi e i connettori IA per potenziare l'Agente e le capacità della tua applicazione.
              </p>
            </div>

            {/* Google Gemini Card */}
            <GeminiConnectorCard />

            {/* Other System Connectors */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Altri connettori disponibili</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'OpenAI / ChatGPT', category: 'IA', status: 'Disponibile' },
                  { name: 'Claude (Anthropic)', category: 'IA', status: 'Disponibile' },
                  { name: 'Stripe Payments', category: 'Pagamenti', status: 'Collegato' },
                  { name: 'Firebase Firestore', category: 'Database', status: 'Collegato' },
                  { name: 'Google Analytics', category: 'Analisi', status: 'Collegato' },
                  { name: 'Resend Email', category: 'Comunicazioni', status: 'Disponibile' },
                ].map((conn, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Plug className="w-4 h-4 text-slate-600" />
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">{conn.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{conn.category}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        conn.status === 'Collegato'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {conn.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'segreti' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Variabili d'Ambiente & Segreti</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Chiavi crittografate a livello server (AES-256)</span>
              </div>
              <p className="text-xs text-slate-500">OPENAI_API_KEY, STRIPE_SECRET_KEY, DATABASE_URL configurati in modo sicuro.</p>
            </div>
          </div>
        )}

        {activeSubTab === 'pagamenti' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pagamenti & Piani</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Piano Pro Mensile (225 / mese)</span>
                </span>
                <button onClick={() => alert('Apertura portale clienti Stripe')} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium">
                  Gestisci fatturazione
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'database' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Database & Tabelle</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Collezione: artisans (6 record verificati a Vicenza)</span>
              </div>
              <p className="text-slate-500">I dati sono sincronizzati e pronti per query in tempo reale.</p>
            </div>
          </div>
        )}

        {activeSubTab === 'risorse' && (
          <div className="space-y-4 max-w-3xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Risorse & Asset Statici</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Utilizzo spazio di archiviazione: 14.2 MB / 10 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '2%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Feedback Bar */}
        <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Hai qualche opinione sulla tua esperienza con Emergent? Ci farebbe piacere ascoltarla.</span>
          <button
            onClick={onOpenFeedback}
            className="font-bold text-slate-800 hover:text-black underline cursor-pointer"
          >
            Dacci il tuo feedback
          </button>
        </div>
      </main>

      {/* Log Modal */}
      {activeLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white font-sans font-bold">
              <span>Log Distribuzione: {activeLogModal}</span>
              <button onClick={() => setActiveLogModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="py-4 space-y-1.5 text-slate-400 text-[11px]">
              <div className="text-emerald-400">✓ Inizializzazione build pipeline... 120ms</div>
              <div className="text-emerald-400">✓ Bundling assets & CSS Tailwind completato</div>
              <div className="text-emerald-400">✓ Routing CasaLavoroPRO sincronizzato con Edge CDN</div>
              <div className="text-emerald-400">✓ Controllo di integrità e certificati SSL superato</div>
              <div className="text-blue-400 mt-2">→ URL pubblico attivo: https://casalavoropro.com</div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveLogModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-sans text-xs"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
