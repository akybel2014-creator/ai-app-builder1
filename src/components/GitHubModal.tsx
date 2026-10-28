import { useState } from 'react';
import { X, Github, Check, GitBranch, RefreshCw, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

interface GitHubModalProps {
  open: boolean;
  onClose: () => void;
  currentRepo?: string;
  onConnectRepo: (repoName: string, branch: string) => void;
}

export default function GitHubModal({
  open,
  onClose,
  currentRepo = 'emergentlabs/casalavoro-pro',
  onConnectRepo,
}: GitHubModalProps) {
  const [repoName, setRepoName] = useState(currentRepo);
  const [branch, setBranch] = useState('main');
  const [autoCommit, setAutoCommit] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!open) return null;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      onConnectRepo(repoName, branch);
      setTimeout(() => {
        setSyncSuccess(false);
        onClose();
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-slate-800 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Collegamento a GitHub</h3>
              <p className="text-xs text-slate-500">Sincronizzazione codice sorgente e commit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 my-5 text-xs text-slate-600">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Repository GitHub (Organizzazione o Utente / Repo)
            </label>
            <div className="relative">
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="es. github-user/progetto-web"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="absolute right-3 top-2.5 text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ramo (Branch)</label>
              <div className="relative">
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-slate-400">
                  <GitBranch className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Visibilità</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400">
                <option value="private">Privato (Consigliato)</option>
                <option value="public">Pubblico</option>
              </select>
            </div>
          </div>

          {/* Auto commit toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Auto-commit su ogni modifica</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Crea un commit ogni volta che l'agente genera una nuova versione
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoCommit}
              onChange={(e) => setAutoCommit(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer accent-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticazione crittografata tramite GitHub OAuth app certificata</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annulla
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing || syncSuccess}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Connessione a GitHub in corso...</span>
              </>
            ) : syncSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Repository collegato!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Collega e Sincronizza</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
