import type { Messages } from '../../types.ts';

export default {
    "email": {
        "label": "Dirección de correo",
        "placeholder": "tu@example.com"
    },
    "subscribe": "Suscribirse",
    "invalidEmail": "Introduce una dirección de correo válida.",
    "tooMany": "Demasiados intentos. Espera un minuto y vuelve a intentarlo.",
    "failed": "Algo ha fallado. Vuelve a intentarlo.",
    "network": "No se pudo conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.",
    "subscribed": "Busca el enlace de confirmación en tu bandeja de entrada."
} satisfies Messages['forms'];
