import { useState } from 'react';
import { Mail, ShieldCheck, Calendar, Sparkles, X, Check, Copy } from 'lucide-react';

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified?: boolean;
    createdAt?: string;
    activeSubscription?: {
      planId: string;
      billingPeriod: string;
      status: string;
      activatedAt?: string;
    } | null;
  } | null;
}

export default function UserProfileModal({ open, onClose, user }: UserProfileModalProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!open) return null;

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-scale-in">
        {/* Header with gradient strip */}
        <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">{user?.name || 'Utente Emergent'}</h3>
              <p className="text-white/80 text-xs mt-0.5">{user?.email || 'account@emergent.sh'}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-orange-600 shadow-xs">
                  {user?.activeSubscription?.planId === 'free-byok'
                    ? 'Piano Free BYOK'
                    : user?.activeSubscription?.planId
                      ? `Piano ${user.activeSubscription.planId.toUpperCase()}`
                      : 'Membro Standard'}
                </span>
                {user?.emailVerified && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/80 text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Email Verificata
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* User ID */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">ID Account Univoco</span>
              <span className="font-mono text-slate-800 font-medium">{user?.id || 'usr_guest_session'}</span>
            </div>
            <button
              onClick={handleCopyId}
              title="Copia ID"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Email Principale</span>
                <span className="font-semibold text-slate-800">{user?.email || 'Non specificata'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-slate-400 block text-[10px]">Stato Sottoscrizione</span>
                <span className="font-semibold text-slate-800">
                  {user?.activeSubscription?.status === 'active' ? 'Attivo & Operativo' : 'Nessun piano a pagamento'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">Data Registrazione</span>
                <span className="font-semibold text-slate-800">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('it-IT') : '28 Ottobre 2026'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 leading-relaxed text-center">
            Tutti i dati dell'account sono sincronizzati con il database sicuro del server.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
