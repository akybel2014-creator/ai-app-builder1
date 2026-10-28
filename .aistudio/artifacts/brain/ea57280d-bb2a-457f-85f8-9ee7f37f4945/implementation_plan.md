# Emergent Studio - AI Web & App Builder Platform

Piattaforma avanzata per la creazione e distribuzione di applicazioni web tramite agenti AI, ispirata all'interfaccia di Emergent. L'esperienza combina un'estetica luminosa con sfondo cielo sfumato e accenti arancioni energici, un generatore a linguaggio naturale, una vetrina comunitaria (Showcase) ricca di progetti filtrabili, un footer corporativo navigabile, una modalità editor a doppio pannello con chat agente e l'anteprima interattiva dal vivo del marketplace CasaLavoroPRO, affiancata dalla dashboard di panoramica e configurazione del progetto.

## User Review & Critical Decisions

> [!IMPORTANT]
> Decisioni confermate nella Fase 1 e allineamento di progetto:
> - **Brand & Identità Visiva**: Stile luminoso e moderno ispirato a Emergent, con cielo azzurro e nuvole nella sezione superiore, campiture bianche e neutre pulite, e dettagli arancioni vivaci (`#FF6B00` / `#EA580C`) per call-to-action e accenti chiave.
> - **Esperienza Chat & Editor**: Split-screen interattivo con chat dell'agente AI a sinistra (stato distribuzione, bolle utente, pause agente, pulsanti `+`, `Maxx`, selettore modello, `Auto`, `</> Crea`, microfono e invio rapido) e pannello destro a doppia modalità: anteprima live interattiva di **CasaLavoroPRO** con barra di notifica arancione e ricerca artigiani funzionante, oppure vista **Panoramica** completa (dominio, health check, versioni pubblicate, connettori e impostazioni).
> - **Vetrina (Showcase) e Navigazione**: Vetrina completa con filtri per categoria (`Tutti`, `Landing Pages`, `Advanced Apps`, `Business Tools`, `Personal Tools`, `Mobile Apps`), schede progetto interattive con modali di anteprima dettagliata e footer con tutte le colonne (`Prodotto`, `Soluzioni`, `Risorse`, `Azienda`) con modali/pagine informative aperte al click.

---

## 1. Overview & Core Concept

- **Cosa fa**: Consente all'utente di descrivere qualsiasi idea web/mobile, avviare sessioni di generazione con agenti AI, visualizzare e testare anteprime statiche e interattive, esplorare la vetrina di app create dalla community e gestire domini, distribuzioni e crediti.
- **Target Persona**: Creator, sviluppatori freelance, product manager e imprenditori che necessitano di prototipare e rilasciare landing page, app avanzate e marketplace in tempi record tramite conversazione.
- **Valore Chiave**: Fedeltà visiva e interattiva al 100% rispetto ai mockup forniti: colori chiari, tocchi arancioni distintivi, mascotte Wingman fluttuante, pulsanti identici e anteprima live realistica con dati funzionali.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Homepage & Studio Hub**:
   - Barra superiore con pulsante `Creatore di app`, tab `Home`, tab del progetto attivo (`home-pro-landing`), badge crediti (`Crediti 30% in più`), consulente e profilo.
   - Sfondo cielo realistico con nuvole e sfumatura verso il bianco puro.
   - Selettore centrale del progetto (`Aky's Project ▾`) e titolo display: **"Cosa costruirai oggi?"**.
   - Tab di tipo applicazione: `App web`, `App mobile`, `Sito web`, `Video [NUOVO]`, `Brainstorm`.
   - Box di inserimento prompt con placeholder dinamico, controlli inferiori (`+`, `E-1 ▾`, pill `Maxx`, `</> Crea ▾`, icona microfono con animazione vocale, pulsante di invio).
   - Chip di avvio rapido: `Wingman Beta`, `Il Mio Alter Ego`, `Generatore di Conti`, `Parola del Giorno`.
   - Sezione progetti utente con filtri (`Tutti (2)`, `Applicazioni`, `Pubblicate`, `Video`) e scheda progetto `Home Pro Landing`.
   - Mascotte fluttuante **Wingman** in basso a sinistra con badge e messaggio richiudibile.
   - Icona chat circolare nera in basso a destra.

2. **Vetrina Community (Showcase)**:
   - Posizionata sotto la sezione hub, con icona segnalibro e descrizione: *"Esplora cosa sta costruendo la community con Emergent."*
   - Filtri a pulsante: `Tutti`, `Landing Pages`, `Advanced Apps`, `Business Tools`, `Personal Tools`, `Mobile Apps`.
   - Griglia di schede ad alta definizione (Auramax headphone website, Ops manager, Meditation app, Deep Sea Telemetry, Spiderman Experience, Memory Map) con tag di categoria non invadenti e possibilità di cliccare per testare l'anteprima.

3. **Footer Istituzionale Navigabile**:
   - Logo in grassetto `emergent` con claim di missione.
   - 4 colonne strutturate:
     - **Prodotto**: Costruisci, Prezzi, Integrazioni, Indirizzi IP.
     - **Soluzioni**: Enterprise, Proprietari di PMI, Agenzie IT, Product Manager, Team Operativo.
     - **Risorse**: Documentazione, Tutorial, Casi di Studio, Blog.
     - **Azienda**: Affiliati, Carriere, Informazioni aziendali, Termini di Servizio, Informativa sulla Privacy, Informativa sui Cookie, Accordo sul Trattamento dei Dati, Sub-responsabili del trattamento.
   - Copyright 2026, crediti dedicati ("PROGETTATO E COSTRUITO DA LE PERSONE FANTASTICHE DI EMERGENT 💙") e link social (LinkedIn, X, YouTube, Instagram).

4. **Split-Screen Editor (Chat + Anteprima Live / Panoramica)**:
   - **Pannello Sinistro (AI Agent)**:
     - Header con timestamp di distribuzione (`Distribuzione completa · Oct 25, 10:45 AM`).
     - Storico conversazione con messaggi inviati dall'utente (`Add the ChatGPT AI Models integration to my app.`).
     - Scheda stato agente: `Agent has been paused` con checkbox `[✓] pause` e opzione di copia/ripristino.
     - Banner promozionale giallo/arancione: `Bonus anniversario: 30% di crediti in più` con pulsante `Ricarica ora` e chiusura `×`.
     - Barra di digitazione "In attesa del tuo prossimo messaggio" con controlli: `+`, pill `Maxx`, slider impostazioni, menu a tendina `Auto`, `</> Crea`, icona microfono, invio freccia arancione/grigia. Possibilità di digitare nuovi messaggi e ricevere risposte simulate realistiche con aggiornamento dell'anteprima!
   - **Pannello Destro (Live Preview / Panoramica)**:
     - Toolbar superiore: switch `Anteprima` (icona occhio) / `Live` (icona broadcast), icona ingranaggio (apre la vista Panoramica), icona codice `</>`, pulsante nuova finestra, refresh, esporta/condividi, pulsante nero `Ripubblica` / deploy, chiudi.
     - **Modalità Anteprima**:
       - Banner arancione in evidenza: `Iscrizione gratis per tutti · Aziende e privati, registratevi senza alcun costo. Registrati gratis →`.
       - Applicazione **CasaLavoroPRO**:
         - Header con logo casa arancione, nome brand e menu.
         - Kicker in maiuscolo: `IL MARKETPLACE DEI LAVORI IN CASA`.
         - Hero: `Trova l'artigiano giusto per casa tua` (con "casa tua" in arancione caldo).
         - Box di ricerca funzionante: campi "Cosa cerchi" (Es. Idraulico, Elettricista) e "Dove" (Vicenza) con pulsante arancione "Avvia Ricerca".
         - Lista categorie rapide con contatori artigiani.
       - Barra fluttuante inferiore: *"Questa è un'anteprima statica, il tuo sito web si sta riprendendo e potrebbe richiedere 1-2 minuti"* con pulsante *"Ripresa in corso"*.
     - **Modalità Panoramica (Settings & Deployment)**:
       - Sottomenu laterale: Panoramica, Analisi, Monitoraggio, Configurazione (Dominio, Connettori, Segreti, Pagamenti), Configura (Database, Risorse).
       - Scheda di stato con punto verde `home-pro-landing`, costo `225 / mese`, link `casalavoropro.com ↗` con copia negli appunti.
       - Banner sconto: `Ottieni 2 mesi gratis con un piano annuale - Passa all'annuale`.
       - Box `Esegui un controllo di salute` con selettore `Controllo di Stato` e pulsante `Esegui`.
       - Storico `Versioni pubblicate`: versione 52ª (14 ore fa con log) e versione 51ª (3 giorni fa con ripristino).

---

## 3. Visual Identity & Color Tokens

- **Sfondo Canvas Primario**: Cielo sfumato luminoso (`from-sky-300 via-sky-100 to-white`) con nuvole delicate ed elementi neutri ultra-puliti (`#FFFFFF`, `#F8FAFC`).
- **Colore Accento (Brand)**: Arancione caldo energico (`#FF6B00` / `#EA580C` / Tailwind `orange-500` - `orange-600`), utilizzato per il testo focale di CasaLavoroPRO, pulsanti di ricerca, banner di offerta e indicatori di azione.
- **Colori Semantici & Superfici**:
  - Superfici scure d'accento: Nero intenso (`#0F172A` / `#18181B`) per i pulsanti `Ripubblica`, bottoni primari di filtro e chip scuri.
  - Verde smeraldo (`#16A34A`): indicatori di stato live / distribuzione completata.
  - Giallo/Ambra (`#FEF08A` / `#CA8A04`): pill `Crediti 30% in più` e banner anniversario.
- **Tipografia**:
  - Display e brand: *Plus Jakarta Sans* / font di sistema neo-grottesco moderno, con pesi 600-700.
  - Numeri e metadati: *Tabular figures* (`tabular-nums`) per versioni, crediti e metriche.

---

## 4. Key Product Decisions & Trade-Offs

- **Switch Fluido tra Home Studio ed Editor**:
  - L'utente può navigare istantaneamente cliccando su `home-pro-landing` o su una scheda della vetrina per entrare nell'Editor split-screen, oppure cliccare su `Home` per tornare all'hub principale con cielo e vetrina.
- **Anteprima Live Reale e Interattiva**:
  - Invece di una semplice immagine statica o iframe bloccato, l'anteprima di CasaLavoroPRO è un componente React vivo e testabile all'interno della cornice anteprima, con filtri di ricerca operativi, categorie selezionabili e toggle responsive.
- **Pannello Panoramica Completo**:
  - Cliccando sull'ingranaggio o sulla voce "Panoramica" nel pannello destro, la vista si commuta senza interruzioni nella dashboard operativa dettagliata del progetto (come mostrato nello screenshot 5).

---

## 5. Technical Architecture & Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TOP NAVIGATION BAR                              │
│ [Creatore di app] [💬]  [Home] [🟢 home-pro-landing ×] [+]   [Crediti] [Consulente] [👤] │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────────────┐
│     STUDIO HUB VIEW (HOME)    │     │       EDITOR VIEW (SPLIT SCREEN)      │
├───────────────────────────────┤     ├───────────────────┬───────────────────┤
│ • Sky Hero Banner             │     │ AI AGENT CHAT     │ RIGHT PANE        │
│ • "Aky's Project" Selector    │     │ • Status: Oct 25  │ • Top Toolbar     │
│ • "Cosa costruirai oggi?"     │     │ • User Bubbles    │   (Anteprima,Live,│
│ • Category Tabs & Prompt Box  │     │ • Agent Paused    │    Gear, Code,    │
│ • Quick Pills (Wingman, etc.) │     │ • Bonus 30% card  │    Ripubblica)    │
│ • Progetti Recenti Filter/List│     │ • Bottom Inputs:  │ • Sub-Views:      │
│ • VETRINA (SHOWCASE)          │     │   (+, Maxx, Auto, │   a) CasaLavoroPRO│
│   (Tutti, Landing, Apps, ...) │     │    Crea, Mic, ⬆)  │      Live Preview │
│ • FOOTER (4 Colonne + Info)   │     │                   │   b) Panoramica / │
│ • Floating Wingman Mascot     │     │                   │      Impostazioni │
└───────────────────────────────┘     └───────────────────┴───────────────────┘
```

### Component Breakdown
- `App.tsx`: Gestione dello stato di navigazione tra Studio Hub (Home), Editor Split Screen e modali.
- `StudioHubView.tsx`: Schermata principale con cielo nuvoloso, input prompt a pillole, lista progetti, vetrina con schede di community e footer a 4 colonne.
- `ShowcaseSection.tsx`: Componente Vetrina dedicato con filtri di categoria e modale di anteprima per le app della community.
- `EditorSplitView.tsx`: Visualizzazione a due colonne con chat AI a sinistra e anteprima o panoramica a destra.
- `CasaLavoroPreview.tsx`: Replica fedele e funzionante dell'app CasaLavoroPRO con banner arancione, hero e ricerca artigiani.
- `ProjectOverviewPanel.tsx`: Pannello Panoramica con stato dominio, health check, log e versioni pubblicate.
- `WingmanMascot.tsx`: Widget fluttuante della mascotte Wingman con messaggi contestuali e supporto alla minimizzazione.

---

## 6. Verification & Quality Plan

1. **Fedeltà Grafica**: Confronto visivo con tutti e 5 gli screenshot (cielo, colori chiari, arancione d'accento, icone, pulsanti, testi e proporzioni).
2. **Nessun Clic a Vuoto**: Ogni pulsante (tab, filtri, invio messaggi, cambio vista, anteprima, ricarica crediti, switch panoramica) possiede un handler attivo con riscontro visivo immediato.
3. **Compilazione & Tipizzazione**: Verifica finale tramite `compile_applet` e `lint_applet`.
