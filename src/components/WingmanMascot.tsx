import { useState } from 'react';
import { X, Sparkles, ChevronUp, Bot } from 'lucide-react';

interface WingmanMascotProps {
  variant?: 'business' | 'lifetime';
  onOpenAssistant?: () => void;
}

export default function WingmanMascot({ variant = 'business', onOpenAssistant }: WingmanMascotProps) {
  const [minimized, setMinimized] = useState(false);
  const [expandedDialog, setExpandedDialog] = useState(false);

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-full shadow-lg border border-slate-700 hover:scale-105 transition-all text-xs"
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Wingman</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-none">
      {/* Dialog Bubble when clicked */}
      {expandedDialog && (
        <div className="mb-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xl max-w-xs text-xs text-slate-800 animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wingman AI Assistant</span>
            </span>
            <button
              onClick={() => setExpandedDialog(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-600 leading-relaxed mb-3">
            Ciao! Posso aiutarti a generare nuove sezioni, collegare API o ottimizzare la tua landing page CasaLavoroPRO per massimizzare le conversioni.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setExpandedDialog(false);
                if (onOpenAssistant) onOpenAssistant();
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-1.5 rounded-lg text-center"
            >
              Parla con me
            </button>
          </div>
        </div>
      )}

      {/* Mascot Card container */}
      <div className="relative group flex items-end">
        {/* The Card being held */}
        <div
          onClick={() => setExpandedDialog(!expandedDialog)}
          className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 text-white rounded-xl p-3 shadow-2xl w-44 cursor-pointer hover:scale-102 transition-transform overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(true);
            }}
            title="Minimizza"
            className="absolute top-1.5 right-1.5 p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Card Content based on variant */}
          {variant === 'business' ? (
            <div className="space-y-1">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>AI Agent</span>
              </div>
              <h4 className="font-extrabold text-sm tracking-tight text-white">
                Wingman
              </h4>
              <p className="text-[10px] text-slate-300">for business</p>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                Offerta Pro
              </span>
              <h4 className="font-bold text-xs text-white">
                Lifetime access
              </h4>
              <p className="text-[10px] text-amber-200/90 font-medium">120k credits + Pro</p>
            </div>
          )}
        </div>

        {/* Mascot Robot Silhouette Representation */}
        <div className="w-12 h-14 -ml-3 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] pointer-events-none">
          <svg viewBox="0 0 60 70" className="w-full h-full">
            {/* Robot body & limbs */}
            <rect x="18" y="24" width="24" height="26" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
            {/* Visor face */}
            <rect x="22" y="28" width="16" height="10" rx="3" fill="#09090b" />
            <circle cx="26" cy="33" r="1.5" fill="#38bdf8" />
            <circle cx="34" cy="33" r="1.5" fill="#38bdf8" />
            {/* Arms holding the card */}
            <path d="M 18 36 L 6 28 L 8 24" fill="none" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
            <path d="M 42 36 L 52 30" fill="none" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
            {/* Antenna */}
            <line x1="30" y1="24" x2="30" y2="16" stroke="#52525b" strokeWidth="2" />
            <circle cx="30" cy="15" r="3" fill="#06b6d4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
