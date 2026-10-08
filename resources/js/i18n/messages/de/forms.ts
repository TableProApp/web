import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "E-Mail-Adresse",
        "placeholder": "du@example.com"
    },
    "subscribe": "Abonnieren",
    "invalidEmail": "Gib eine gültige E-Mail-Adresse ein.",
    "tooMany": "Zu viele Versuche. Warte eine Minute und versuche es erneut.",
    "failed": "Etwas ist schiefgelaufen. Versuche es erneut.",
    "network": "Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.",
    "subscribed": "Prüfe deinen Posteingang auf den Bestätigungslink."
} satisfies Messages['forms'];
