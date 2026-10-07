import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "Adresse e-mail",
        "placeholder": "you@example.com"
    },
    "subscribe": "S’abonner",
    "invalidEmail": "Saisissez une adresse e-mail valide.",
    "tooMany": "Trop de tentatives. Attendez une minute et réessayez.",
    "failed": "Une erreur s’est produite. Réessayez.",
    "network": "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
    "subscribed": "Consultez votre boîte de réception pour trouver le lien de confirmation."
} satisfies Messages['forms'];
