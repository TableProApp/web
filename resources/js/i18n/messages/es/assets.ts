import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "Espacio para captura de pantalla",
        "detail": "Espacio para recorte de detalle",
        "screenshot-phone": "Espacio para captura de iPhone",
        "screenshot-ipad": "Espacio para captura de iPad",
        "diagram": "Espacio para diagrama",
        "illustration": "Espacio para ilustración"
    },
    "accessibleName": "{type}: {description}"
} satisfies Messages['assets'];
