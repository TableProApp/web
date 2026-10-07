import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "Indirizzo email",
        "placeholder": "tu@example.com"
    },
    "subscribe": "Iscriviti",
    "invalidEmail": "Inserisci un indirizzo email valido.",
    "tooMany": "Troppi tentativi. Attendi un minuto e riprova.",
    "failed": "Qualcosa è andato storto. Riprova.",
    "network": "Impossibile raggiungere il server. Controlla la connessione e riprova.",
    "subscribed": "Controlla la posta in arrivo per il link di conferma."
} satisfies Messages['forms'];
