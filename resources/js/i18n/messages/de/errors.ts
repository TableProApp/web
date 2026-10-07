import type { Messages } from '../../types.ts';

export default {
    "status": "Fehler {status}",
    "notFound": {
        "title": "Seite nicht gefunden",
        "body": "Die Adresse ist möglicherweise falsch geschrieben oder die Seite wurde verschoben. Diese Seiten bieten einen guten Ausgangspunkt."
    },
    "gone": {
        "title": "Diese Seite wurde entfernt",
        "body": "Sie gehört nicht mehr zu tablepro.app und wurde durch keine andere Seite ersetzt."
    },
    "serverError": {
        "title": "Etwas ist schiefgelaufen",
        "body": "Der Fehler liegt bei uns. Versuche es gleich erneut. Falls er weiterhin auftritt, schreibe an {email}."
    },
    "unavailable": {
        "title": "Wegen Wartung nicht verfügbar",
        "body": "tablepro.app ist in Kürze wieder erreichbar."
    },
    "translation": {
        "title": "Diese Seite ist nur auf {language} verfügbar",
        "body": "Sie wurde noch nicht übersetzt.",
        "link": "Auf {language} lesen"
    },
    "account": {
        "body": "Dein Konto hat in jeder Sprache dieselbe Adresse. Öffne es hier; es wird in der ausgewählten Sprache angezeigt.",
        "link": "Konto öffnen"
    },
    "languages": {
        "en": "Englisch",
        "vi": "Vietnamesisch",
        "es": "Spanisch",
        "de": "Deutsch",
        "fr": "Französisch",
        "ja": "Japanisch",
        "pt-BR": "Brasilianisches Portugiesisch",
        "zh-Hans": "Chinesisch (vereinfacht)",
        "ko": "Koreanisch",
        "zh-Hant": "Chinesisch (traditionell)",
        "it": "Italienisch",
        "id": "Indonesisch"
    },
    "linksLabel": "Seiten zum Einstieg",
    "links": {
        "home": "Startseite",
        "features": "Funktionen",
        "databases": "Datenbanken",
        "download": "Download",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
