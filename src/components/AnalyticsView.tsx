import { useState } from 'react';
import { ChevronDown, Globe, TrendingDown, Monitor } from 'lucide-react';

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('Ultime 24 ore');
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  // Time slots matching screenshot: 14, 17, 20, 23, 2, 5, 8, 11
  const timeLabels = ['14', '17', '20', '23', '2', '5', '8', '11'];

  return (
    <div className="space-y-6 max-w-4xl w-full animate-fade-in pb-10">
      {/* 1. Header with Range Dropdown */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Visite sito web
        </h2>

        {/* Date Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRangeMenu(!showRangeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors shadow-2xs"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRangeMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 text-xs">
              {['Ultime 24 ore', 'Ultimi 7 giorni', 'Ultimi 30 giorni', 'Tutto il tempo'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range);
                    setShowRangeMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI Cards Strip */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* VISITATORI UNICI */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              VISITATORI UNICI
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">0</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-xs font-semibold">
                <TrendingDown className="w-3 h-3" />
                <span>-100%</span>
              </span>
            </div>
          </div>

          {/* VISUALIZZAZIONI DI PAGINA */}
          <div className="sm:pl-6 pt-4 sm:pt-0 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              VISUALIZZAZIONI DI PAGINA
            </span>
            <div className="pt-1">
              <span className="text-3xl font-bold text-slate-400">—</span>
            </div>
          </div>

          {/* DURATA VISITA */}
          <div className="sm:pl-6 pt-4 sm:pt-0 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DURATA VISITA
            </span>
            <div className="pt-1">
              <span className="text-3xl font-bold text-slate-400">—</span>
            </div>
          </div>
        </div>

        {/* 3. Main Chart */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          {/* Legend */}
          <div className="flex items-center justify-end gap-5 text-xs text-slate-500 mb-4 select-none">
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-slate-700 font-medium">questo periodo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-slate-300 rounded-full" />
              <span>periodo precedente</span>
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="relative w-full h-48 select-none">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2 w-full">
                <span className="w-5 text-right shrink-0">10</span>
                <div className="w-full border-b border-slate-100" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-5 text-right shrink-0">5</span>
                <div className="w-full border-b border-slate-100" />
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="w-5 text-right shrink-0">0</span>
                <div className="w-full border-b border-slate-200" />
              </div>
            </div>

            {/* SVG Lines */}
            <svg
              className="absolute inset-0 w-full h-full pl-7 pr-2 pb-5"
              viewBox="0 0 700 150"
              preserveAspectRatio="none"
            >
              {/* Previous period line (gray with subtle bumps around 8 and 11) */}
              <path
                d="M 0 145 L 450 145 Q 490 120 530 145 L 610 145 Q 640 125 670 145 L 700 145"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Current period line (vibrant blue, flat at 0 with tiny wave) */}
              <path
                d="M 0 145 L 700 145"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            {/* X-Axis Time Labels */}
            <div className="absolute bottom-0 left-7 right-2 flex justify-between text-[11px] text-slate-400 font-mono">
              {timeLabels.map((time, idx) => (
                <span key={idx}>{time}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. 2x2 Breakdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: PAGINE PRINCIPALI */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
            <span>PAGINE PRINCIPALI</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Per visualizzazioni di pagina</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Pagina principale</span>
                <span className="text-slate-600 tabular-nums">75%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: FONTI (TOP 3) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
            <span>FONTI (TOP 3)</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Per visitatori</span>
          </div>

          <div className="space-y-4">
            {/* emergent.sh */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>emergent.sh</span>
                </span>
                <span className="text-slate-600 tabular-nums">75%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>
            </div>

            {/* Direct */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Direct</span>
                </span>
                <span className="text-slate-600 tabular-nums">25%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: PAESI (TOP 5) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
            <span>PAESI (TOP 5)</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Per visitatori</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-slate-600">IT</span>
                  <span>Italia</span>
                </span>
                <span className="text-slate-600 tabular-nums">90%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: DISPOSITIVI */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
            <span>DISPOSITIVI</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">Per visitatori</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Desktop</span>
                </span>
                <span className="text-slate-600 tabular-nums">100%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
