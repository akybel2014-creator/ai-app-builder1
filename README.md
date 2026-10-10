# AI App Builder

App in cui descrivi un sito o un'app a parole, la modifichi con istruzioni e colleghi servizi tramite i Connettori.

## Avvio in locale
```
npm install
npm run dev
```
Apri http://localhost:3000. In sviluppo il login `/admin` accetta "admin" se `ADMIN_PASSWORD` è vuota.

## Produzione
```
npm ci --include=dev
npm run build
ADMIN_PASSWORD='password-lunga' npm run start
```

Variabili d'ambiente (vedi `.env.example`): `PORT`, `APP_URL`, `ADMIN_PASSWORD`.
In produzione `ADMIN_PASSWORD` è obbligatoria: senza, l'accesso admin resta chiuso.

## Hosting
Serve un hosting che esegua Node (Render, Railway, Fly.io). Vercel/Netlify non vanno bene.
- Build: `npm ci --include=dev && npm run build` (servono anche le dipendenze di sviluppo: Vite e tsx)
- Start: `npm run start`

Utenti e progetti sono salvati in file nella cartella `.data/`: su hosting con disco non persistente si perdono a ogni deploy.
