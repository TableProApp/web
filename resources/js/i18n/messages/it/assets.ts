import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "Segnaposto per schermata",
        "detail": "Segnaposto per dettaglio ritagliato",
        "screenshot-phone": "Segnaposto per schermata iPhone",
        "screenshot-ipad": "Segnaposto per schermata iPad",
        "diagram": "Segnaposto per diagramma",
        "illustration": "Segnaposto per illustrazione"
    },
    "accessibleName": "{type}: {description}"
} satisfies Messages['assets'];
