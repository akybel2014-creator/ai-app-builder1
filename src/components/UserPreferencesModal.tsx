import { useState } from 'react';
import { Settings2, Globe, Moon, Bell, Check, X } from 'lucide-react';

interface UserPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UserPreferencesModal({ open, onClose }: UserPreferencesModalProps) {
  const [locale, setLocale] = useState('it');
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">Preferenze Utente</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Lingua */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Lingua Interfaccia</span>
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="it">Italiano (Predefinita)</option>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Notifiche */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>Notifiche Distribuzione</span>
              </div>
              <p className="text-[11px] text-slate-500">Avvisa quando l'Agente completa una compilazione</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded cursor-pointer"
            />
          </div>

          {/* Suoni */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Moon className="w-3.5 h-3.5 text-slate-500" />
                <span>Feedback Sonoro</span>
              </div>
              <p className="text-[11px] text-slate-500">Riproduci suono al completamento modifiche</p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded cursor-pointer"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Preferenze salvate!</span>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Salva Preferenze
          </button>
        </div>
      </div>
    </div>
  );
}
