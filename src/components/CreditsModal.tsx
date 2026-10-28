import { useState } from 'react';
import { X, Sparkles, Check, CreditCard, ShieldCheck } from 'lucide-react';

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreditsModal({ open, onClose }: CreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'pro' | 'scale'>('pro');
  const [purchased, setPurchased] = useState(false);

  if (!open) return null;

  const handlePurchase = () => {
    setPurchased(true);
    setTimeout(() => {
      setPurchased(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 text-slate-800 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ricarica Crediti AI</h3>
              <p className="text-xs text-amber-800 font-semibold">Bonus anniversario attivo: +30% su tutti i pacchetti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Packages options */}
        <div className="space-y-3 my-5">
          {/* Starter */}
          <div
            onClick={() => setSelectedPackage('starter')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedPackage === 'starter'
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Pacchetto Starter</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                  +30% BONUS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">30.000 + 9.000 = <strong className="text-slate-800">39.000 crediti</strong></p>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-900">14€</div>
              <div className="text-[10px] text-slate-400">una tantum</div>
            </div>
          </div>

          {/* Pro (Recommended) */}
          <div
            onClick={() => setSelectedPackage('pro')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between relative ${
              selectedPackage === 'pro'
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <span className="absolute -top-2.5 right-4 bg-orange-600 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
              Più Popolare
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Pacchetto Pro Builder</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                  +30% BONUS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">100.000 + 30.000 = <strong className="text-slate-800">130.000 crediti</strong></p>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-900">29€</div>
              <div className="text-[10px] text-slate-400">una tantum</div>
            </div>
          </div>

          {/* Scale */}
          <div
            onClick={() => setSelectedPackage('scale')}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedPackage === 'scale'
                ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Pacchetto Enterprise / Agenzia</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                  +30% BONUS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">300.000 + 90.000 = <strong className="text-slate-800">390.000 crediti</strong></p>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-900">69€</div>
              <div className="text-[10px] text-slate-400">una tantum</div>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pagamento sicuro con Stripe</span>
          </span>
          <span>Nessun rinnovo automatico nascosto</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePurchase}
          disabled={purchased}
          className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {purchased ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Crediti accreditati con successo!</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Conferma e Ricarica con il 30% di bonus</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
