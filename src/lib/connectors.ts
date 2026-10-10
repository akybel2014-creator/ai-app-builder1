export type ConnectorCategory = 'payments' | 'ai' | 'storage' | 'access' | 'communications';

export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
}

export const CONNECTOR_CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  payments: 'Pagamenti',
  ai: 'IA',
  storage: 'Archiviazione',
  access: 'Accesso',
  communications: 'Comunicazioni',
};

export const CONNECTOR_CATALOG: ConnectorDefinition[] = [
  { id: 'google-signin', name: 'Accesso con Google', description: 'Permetti agli utenti di accedere con il loro account Google.', category: 'access' },
  { id: 'email-password', name: 'Email e password', description: "Login con email e password, con un account amministratore integrato.", category: 'access' },
  { id: 'chatgpt', name: 'ChatGPT', description: "Aggiungi funzioni IA all'app usando i modelli di OpenAI.", category: 'ai' },
  { id: 'claude', name: 'Claude', description: "Aggiungi funzioni IA all'app usando i modelli di Anthropic.", category: 'ai' },
  { id: 'gemini', name: 'Gemini', description: "Aggiungi funzioni IA all'app usando i modelli di Google.", category: 'ai' },
  { id: 'perplexity', name: 'Perplexity', description: 'Cerca sul web e ottieni risposte con fonti citate.', category: 'ai' },
  { id: 'speech-to-text', name: 'Voce in testo', description: 'Trascrivi parlato e audio in testo.', category: 'ai' },
  { id: 'text-to-speech', name: 'Testo in voce', description: 'Trasforma il testo in voce naturale.', category: 'ai' },
  { id: 'elevenlabs', name: 'ElevenLabs', description: 'Leggi il testo ad alta voce con una voce clonata o trascrivi audio.', category: 'ai' },
  { id: 'image-generation', name: 'Generazione immagini', description: "Crea e modifica immagini all'interno dell'app.", category: 'ai' },
  { id: 'file-storage', name: 'File e media', description: "Carica immagini, video e file nell'app.", category: 'storage' },
  { id: 'stripe', name: 'Stripe', description: 'Accetta pagamenti con carta e altri metodi.', category: 'payments' },
  { id: 'paypal', name: 'PayPal', description: 'Accetta pagamenti con PayPal.', category: 'payments' },
  { id: 'razorpay', name: 'Razorpay', description: 'Accetta pagamenti UPI, carte e net-banking in India.', category: 'payments' },
  { id: 'paystack', name: 'Paystack', description: 'Accetta pagamenti dai clienti in Africa.', category: 'payments' },
  { id: 'resend', name: 'Resend', description: "Invia email dall'app.", category: 'communications' },
  { id: 'sendgrid', name: 'SendGrid', description: 'Invia email dal tuo account SendGrid.', category: 'communications' },
  { id: 'twilio', name: 'Twilio', description: 'Invia SMS e verifica i numeri di telefono.', category: 'communications' },
];

export const CONNECTOR_IDS = new Set(CONNECTOR_CATALOG.map((c) => c.id));
export const CONNECTOR_NOTES_MAX = 300;
export const CONNECTORS_MAX = 20;

export function getConnector(id: string): ConnectorDefinition | undefined {
  return CONNECTOR_CATALOG.find((c) => c.id === id);
}

/** Pulisce una lista di connettori arrivata dall'esterno (client, storage, server). */
export function sanitizeConnectors(input: unknown): Array<{ id: string; notes: string }> {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: Array<{ id: string; notes: string }> = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const id = (item as { id?: unknown }).id;
    if (typeof id !== 'string' || !CONNECTOR_IDS.has(id) || seen.has(id)) continue;
    const rawNotes = (item as { notes?: unknown }).notes;
    const notes = typeof rawNotes === 'string' ? rawNotes.trim().slice(0, CONNECTOR_NOTES_MAX) : '';
    seen.add(id);
    out.push({ id, notes });
    if (out.length >= CONNECTORS_MAX) break;
  }
  return out;
}
