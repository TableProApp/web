import type { Messages } from '../../types.ts';

export default {
    "status": "Errore {status}",
    "notFound": {
        "title": "Pagina non trovata",
        "body": "L’indirizzo potrebbe essere errato o la pagina potrebbe essere stata spostata. Queste pagine sono un buon punto di partenza."
    },
    "gone": {
        "title": "Questa pagina è stata rimossa",
        "body": "Non fa più parte di tablepro.app e nessun’altra pagina la sostituisce."
    },
    "serverError": {
        "title": "Qualcosa è andato storto",
        "body": "Il problema è dalla nostra parte. Riprova tra poco. Se continua, scrivi a {email}."
    },
    "unavailable": {
        "title": "Manutenzione in corso",
        "body": "tablepro.app tornerà disponibile a breve."
    },
    "translation": {
        "title": "Questa pagina è disponibile solo in {language}",
        "body": "Non è stata ancora tradotta.",
        "link": "Leggi in {language}"
    },
    "account": {
        "body": "Il tuo account ha lo stesso indirizzo in tutte le lingue. Aprilo qui nella lingua selezionata.",
        "link": "Apri il tuo account"
    },
    "languages": {
        "en": "inglese",
        "vi": "vietnamita",
        "es": "spagnolo",
        "de": "tedesco",
        "fr": "francese",
        "ja": "giapponese",
        "pt-BR": "portoghese brasiliano",
        "zh-Hans": "cinese semplificato",
        "ko": "coreano",
        "zh-Hant": "cinese tradizionale",
        "it": "italiano",
        "id": "indonesiano"
    },
    "linksLabel": "Pagine da cui iniziare",
    "links": {
        "home": "Home",
        "features": "Funzionalità",
        "databases": "Database",
        "download": "Scarica",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
