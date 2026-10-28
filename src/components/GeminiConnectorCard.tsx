import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Unlink,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface GeminiConnectorCardProps {
  onStatusChange?: (connected: boolean) => void;
}

export default function GeminiConnectorCard({ onStatusChange }: GeminiConnectorCardProps) {
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini-3.8-flash');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch status on mount
  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/connectors/gemini/status');
      if (res.ok) {
        const data = await res.json();
        setConnected(Boolean(data.connected));
        if (data.model) setActiveModel(data.model);
        if (data.maskedKey) setMaskedKey(data.maskedKey);
        if (data.verifiedAt) setVerifiedAt(data.verifiedAt);
        if (onStatusChange) onStatusChange(Boolean(data.connected));
      }
    } catch {
      // ignore network errors on probe
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleVerify = async () => {
    setVerifying(true);
    setFeedback({ type: null, message: '' });

    try {
      const res = await fetch('/api/connectors/gemini/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputKey.trim() || undefined,
          model: activeModel,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.connected) {
        setConnected(true);
        if (data.maskedKey) setMaskedKey(data.maskedKey);
        if (data.verifiedAt) setVerifiedAt(data.verifiedAt);
        if (data.model) setActiveModel(data.model);
        setInputKey('');
        setFeedback({
          type: 'success',
          message: data.message || 'Connessione a Google Gemini verificata con successo! L\'Agente utilizzerà Gemini Flash.',
        });
        if (onStatusChange) onStatusChange(true);
      } else {
        setConnected(false);
        setFeedback({
          type: 'error',
          message: data.error || 'Verifica connessione non riuscita. Controlla la chiave API.',
        });
        if (onStatusChange) onStatusChange(false);
      }
    } catch {
      setConnected(false);
      setFeedback({
        type: 'error',
        message: 'Errore di rete durante la verifica della connessione al server.',
      });
      if (onStatusChange) onStatusChange(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Sei sicuro di voler scollegare Google Gemini? L\'Agente non potrà più applicare modifiche automatiche.')) {
      return;
    }

    setDisconnecting(true);
    setFeedback({ type: null, message: '' });

    try {
      const res = await fetch('/api/connectors/gemini/disconnect', { method: 'POST' });
      if (res.ok) {
        setConnected(false);
        setMaskedKey(null);
        setVerifiedAt(null);
        setFeedback({
          type: 'success',
          message: 'Google Gemini scollegato. Inserisci una nuova chiave API per riconnetterlo.',
        });
        if (onStatusChange) onStatusChange(false);
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Errore durante la disconnessione.',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs space-y-5 transition-all">
      {/* Top Header of Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Google Gemini</h3>
              {loading ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Verifica...
                </span>
              ) : connected ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Collegato
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Non collegato
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Modelli multimodali ad alta velocità per l'Agente sviluppatore di AI App Builder.
            </p>
          </div>
        </div>

        {/* Model Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Modello: <span className="text-blue-600 font-semibold">{activeModel}</span>
          </span>
          <button
            onClick={checkStatus}
            title="Aggiorna stato"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-4">
        {/* Status info */}
        {connected ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start justify-between gap-3 text-xs text-emerald-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Connessione attiva e verificata</span>
              </div>
              <p className="text-[11px] text-emerald-700 pl-6">
                Chiave salvata nel secret server-side: <span className="font-mono font-bold">{maskedKey || '••••••••'}</span>
                {verifiedAt && ` · Verificata il ${new Date(verifiedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 font-medium text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
              <span>Scollega</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Gemini non è ancora collegato</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                Inserisci la tua chiave API di Google Gemini per consentire all'Agente di applicare modifiche reali ai progetti. La connessione sarà effettiva solo dopo aver superato la verifica.
              </p>
            </div>
          </div>
        )}

        {/* Input Field Form */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>{connected ? 'Aggiorna Chiave API Gemini' : 'Chiave API Gemini'}</span>
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-normal"
            >
              <span>Ottieni una chiave su Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder={
                  connected
                    ? `Chiave attiva: ${maskedKey || 'AIza••••'} (lascia vuoto o inserisci nuova)`
                    : 'Incolla la tua chiave API Google (es. AIzaSy...)'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title={showKey ? 'Nascondi chiave' : 'Mostra chiave'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleVerify}
              disabled={verifying || (!inputKey.trim() && !connected)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifica in corso...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verifica connessione</span>
                </>
              )}
            </button>
          </div>

          {/* Security guarantee */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Sicurezza garantita: la chiave viene memorizzata esclusivamente nei segreti lato server. Non viene mai salvata nel browser, in localStorage o inviata ai log.
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.type && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-semibold">
                {feedback.type === 'success' ? 'Operazione completata' : 'Attenzione'}
              </span>
              <p className="leading-relaxed">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
