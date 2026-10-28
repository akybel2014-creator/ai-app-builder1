import { useState } from 'react';
import { X, Heart } from 'lucide-react';

interface FooterModalContent {
  title: string;
  category: string;
  description: string;
  highlights: string[];
}

export default function EmergentFooter() {
  const [activeModal, setActiveModal] = useState<FooterModalContent | null>(null);

  const handleLinkClick = (title: string, category: string, description: string, highlights: string[]) => {
    setActiveModal({ title, category, description, highlights });
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto pt-16 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 pb-16 border-b border-slate-100">
          {/* Brand Column (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans lowercase">
                emergent
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Crea app pronte per la produzione attraverso conversazioni. Chatta con agenti AI che progettano, codificano e distribuiscono la tua applicazione dall'inizio alla fine.
            </p>
          </div>

          {/* Prodotto */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Prodotto
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Costruisci', desc: 'Studio visivo basato su agenti di programmazione avanzati.', points: ['Generazione full-stack', 'Deploy in 1 clic', 'Anteprima live'] },
                { name: 'Prezzi', desc: 'Piani trasparenti per singoli creator e team in rapida crescita.', points: ['Piano Gratuito iniziale', 'Pro a 29€/mese', 'Crediti flessibili'] },
                { name: 'Integrazioni', desc: 'Connetti Supabase, Firebase, Stripe, GitHub e centinaia di API.', points: ['Auth integrata', 'Database cloud', 'Webhooks'] },
                { name: 'Indirizzi IP', desc: 'Gestione e allocazione IP dedicati per ambienti di produzione.', points: ['IP statici', 'DDoS protection', 'Certificati SSL automatici'] },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.name, 'Prodotto', link.desc, link.points)}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Soluzioni */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Soluzioni
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Enterprise', desc: 'Sicurezza SOC2, SLA dedicati e ambienti cloud isolati per grandi organizzazioni.', points: ['SSO SAML', 'Audit log immutabili', 'Assistenza prioritaria 24/7'] },
                { name: 'Proprietari di PMI', desc: 'Lancia strumenti digitali e negozi senza dipendere da agenzie esterne.', points: ['Automazione contatti', 'Preventivatori su misura', 'Hosting incluso'] },
                { name: 'Agenzie IT', desc: 'Costruisci e consegna prototipi funzionali ai tuoi clienti in poche ore.', points: ['Multi-tenant workspace', 'Esportazione codice sorgente', 'White-labeling'] },
                { name: 'Product Manager', desc: 'Valida ipotesi di prodotto con veri utenti tramite mockup funzionanti.', points: ['Iterazione rapida', 'Test A/B', 'Condivisione istantanea'] },
                { name: 'Team Operativo', desc: 'Automatizza i flussi di lavoro interni con dashboard su misura.', points: ['Connessione fogli di calcolo', 'Notifiche Slack/Email', 'Gestione permessi'] },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.name, 'Soluzioni', link.desc, link.points)}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Risorse */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Risorse
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Documentazione', desc: 'Guide passo-passo, riferimenti API e architettura del sistema.', points: ['Quickstart guide', 'Configurazione SDK', 'Best practices di prompt engineering'] },
                { name: 'Tutorial', desc: 'Video e walkthrough dettagliati per creare qualsiasi tipologia di web app.', points: ['SaaS in 15 minuti', 'Marketplace con pagamenti', 'PWA offline'] },
                { name: 'Casi di Studio', desc: 'Come startup e aziende hanno scalato le proprie metriche con Emergent.', points: ['+300% velocità di rilascio', 'Costi di sviluppo ridotti del 70%'] },
                { name: 'Blog', desc: 'Ultime novità su agenti AI, modelli LLM e il futuro dello sviluppo software.', points: ['Release notes', 'Interviste ai fondatori', 'Approfondimenti tecnici'] },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.name, 'Risorse', link.desc, link.points)}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Azienda */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3 uppercase tracking-wider">
              Azienda
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Affiliati', desc: 'Guadagna il 30% di commissioni ricorrenti su ogni utente invitato.', points: ['Dashboard affiliato', 'Pagamenti mensili garantiti', 'Materiali marketing'] },
                { name: 'Carriere', desc: 'Stiamo assumendo ingegneri e ricercatori AI a tempo pieno e da remoto.', points: ['Posizioni aperte', 'Benefit e welfare', 'Cultura orientata all’impatto'] },
                { name: 'Informazioni aziendali', desc: 'Emergent Labs Inc. - Costruiamo la nuova frontiera della creatività software.', points: ['Fondata nel 2024', 'Sede a San Francisco & Milano', 'Investitori leader nel settore'] },
                { name: 'Termini di Servizio', desc: 'Regolamento per l’utilizzo della piattaforma, licenze e responsabilità.', points: ['Proprietà del codice creato all’utente', 'Uso consentito', 'Garanzie operative'] },
                { name: 'Informativa sulla Privacy', desc: 'Come trattiamo e proteggiamo i tuoi dati nel pieno rispetto del GDPR.', points: ['Crittografia a riposo e in transito', 'Nessun addestramento su dati privati', 'Diritto all’oblio'] },
                { name: 'Informativa sui Cookie', desc: 'Informazioni sui cookie tecnici necessari al corretto funzionamento della sessione.', points: ['Cookie tecnici essenziali', 'Preferenze personalizzate'] },
                { name: 'Accordo sul Trattamento dei Dati', desc: 'DPA standardizzato per la conformità aziendale e protezione transfrontaliera.', points: ['Clausole contrattuali standard UE', 'Ruolo di responsabile del trattamento'] },
                { name: 'Sub-responsabili del trattamento', desc: 'Elenco trasparente dei fornitori cloud infrastrutturali verificati.', points: ['Google Cloud Platform', 'AWS', 'Cloudflare'] },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.name, 'Azienda', link.desc, link.points)}
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>COPYRIGHT © EMERGENTLABS 2026</span>
          </div>

          <div className="flex items-center gap-1.5 text-center text-slate-600">
            <span>PROGETTATO E COSTRUITO DA LE PERSONE FANTASTICHE DI EMERGENT</span>
            <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => handleLinkClick('LinkedIn', 'Social', 'Seguici su LinkedIn per annunci e casi di successo.', ['Aggiornamenti settimanali', 'Opportunità lavorative'])}
              className="hover:text-slate-900 transition-colors"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
              </svg>
            </button>
            <button
              onClick={() => handleLinkClick('X (Twitter)', 'Social', 'Seguici su X per gli ultimi rilasci e dimostrazioni live.', ['Community attiva', 'Tips & tricks di programmazione'])}
              className="hover:text-slate-900 transition-colors"
              title="X"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              onClick={() => handleLinkClick('YouTube', 'Social', 'Guarda video tutorial completi e sessioni live di coding con AI.', ['Video lezioni', 'Webinar formativi'])}
              className="hover:text-slate-900 transition-colors"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </button>
            <button
              onClick={() => handleLinkClick('Instagram', 'Social', 'Dietro le quinte del nostro team e creazioni della community.', ['Storie di sviluppatori', 'Eventi e hackathon'])}
              className="hover:text-slate-900 transition-colors"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Informative Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                  {activeModal.category}
                </span>
                <h3 className="font-bold text-slate-900 text-lg">{activeModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {activeModal.description}
            </p>

            <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-700 block mb-2">Punti chiave:</span>
              <ul className="space-y-1.5">
                {activeModal.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
