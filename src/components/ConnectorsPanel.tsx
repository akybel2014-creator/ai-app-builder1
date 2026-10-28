import { useState } from 'react';
import {
  Plug,
  Check,
  Plus,
  X,
  CreditCard,
  Sparkles,
  HardDrive,
  KeyRound,
  MessageSquare,
} from 'lucide-react';
import type { ProjectConnector } from '@/types';
import {
  CONNECTOR_CATALOG,
  CONNECTOR_CATEGORY_LABELS,
  CONNECTOR_NOTES_MAX,
  type ConnectorCategory,
} from '@/lib/connectors';
import GeminiConnectorCard from '@/components/GeminiConnectorCard';

type Filter = 'all' | 'active' | ConnectorCategory;

const CATEGORY_ICONS: Record<ConnectorCategory, typeof Plug> = {
  payments: CreditCard,
  ai: Sparkles,
  storage: HardDrive,
  access: KeyRound,
  communications: MessageSquare,
};

interface ConnectorsPanelProps {
  connectors: ProjectConnector[];
  onChange: (next: ProjectConnector[]) => void;
}

export default function ConnectorsPanel({ connectors, onChange }: ConnectorsPanelProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const activeIds = new Set(connectors.map((c) => c.id));

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'Tutti', count: CONNECTOR_CATALOG.length },
    { id: 'active', label: 'Attivi', count: connectors.length },
    ...(Object.keys(CONNECTOR_CATEGORY_LABELS) as ConnectorCategory[]).map((cat) => ({
      id: cat as Filter,
      label: CONNECTOR_CATEGORY_LABELS[cat],
      count: CONNECTOR_CATALOG.filter((c) => c.category === cat).length,
    })),
  ];

  const visible = CONNECTOR_CATALOG.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'active') return activeIds.has(c.id);
    return c.category === filter;
  });

  const toggle = (id: string) => {
    if (activeIds.has(id)) {
      onChange(connectors.filter((c) => c.id !== id));
      setDrafts((d) => {
        const rest = { ...d };
        delete rest[id];
        return rest;
      });
    } else {
      onChange([...connectors, { id, notes: '' }]);
    }
  };

  const commitNotes = (id: string) => {
    const draft = drafts[id];
    if (draft === undefined) return;
    const current = connectors.find((c) => c.id === id);
    if (!current || current.notes === draft.trim()) return;
    onChange(connectors.map((c) => (c.id === id ? { ...c, notes: draft.trim() } : c)));
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plug className="w-5 h-5 text-accent-400" />
            Connettori
          </h2>
          <p className="text-sm text-surface-400 mt-1 leading-relaxed">
            Collega servizi popolari per dare alla tua app nuove funzionalità. I connettori attivi
            vengono passati all'IA alla prossima generazione: per ognuno puoi scrivere indicazioni
            su come usarlo. Premi «Genera» per applicarli.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5" role="tablist" aria-label="Filtra connettori">
          {filters.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.id
                  ? 'bg-accent-500/20 text-accent-300'
                  : 'bg-surface-800/40 text-surface-400 hover:text-surface-200'
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        {(filter === 'all' || filter === 'ai') && (
          <div className="mb-6">
            <GeminiConnectorCard />
          </div>
        )}

        {visible.length === 0 ? (
          <p className="text-sm text-surface-500 py-10 text-center">
            Nessun connettore attivo. Aggiungine uno dalla scheda «Tutti».
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visible.map((c) => {
              const active = activeIds.has(c.id);
              const Icon = CATEGORY_ICONS[c.category];
              const saved = connectors.find((x) => x.id === c.id)?.notes ?? '';
              return (
                <div
                  key={c.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-accent-500/40 bg-accent-500/5'
                      : 'border-surface-700/60 bg-surface-800/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                        <button
                          onClick={() => toggle(c.id)}
                          className={`group flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            active
                              ? 'bg-emerald-500/15 text-emerald-300 hover:bg-red-500/15 hover:text-red-300'
                              : 'bg-accent-500/20 text-accent-300 hover:bg-accent-500/30'
                          }`}
                          aria-label={active ? `Rimuovi ${c.name}` : `Aggiungi ${c.name}`}
                        >
                          {active ? (
                            <>
                              <Check className="w-3.5 h-3.5 group-hover:hidden" />
                              <X className="w-3.5 h-3.5 hidden group-hover:block" />
                              <span className="group-hover:hidden">Aggiunto</span>
                              <span className="hidden group-hover:inline">Rimuovi</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Aggiungi
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-surface-400 mt-1 leading-relaxed">{c.description}</p>
                      <p className="text-[11px] text-surface-600 mt-1.5">
                        {CONNECTOR_CATEGORY_LABELS[c.category]}
                      </p>
                    </div>
                  </div>

                  {active && (
                    <div className="mt-3">
                      <label
                        htmlFor={`connector-notes-${c.id}`}
                        className="block text-xs font-medium text-surface-300 mb-1"
                      >
                        Indicazioni per l'IA
                      </label>
                      <textarea
                        id={`connector-notes-${c.id}`}
                        rows={2}
                        maxLength={CONNECTOR_NOTES_MAX}
                        value={drafts[c.id] ?? saved}
                        onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                        onBlur={() => commitNotes(c.id)}
                        placeholder="es. usa questo servizio per il checkout e la registrazione"
                        className="w-full px-3 py-2 rounded-lg bg-surface-800/60 border border-surface-700/60 text-white text-xs placeholder:text-surface-600 focus:outline-none focus:border-accent-500/50 transition-colors resize-none scrollbar-thin"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
