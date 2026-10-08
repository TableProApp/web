import type { Messages } from '../../types.ts';

export default {
    "types": {
        "screenshot": "Emplacement de capture d’écran",
        "detail": "Emplacement de détail recadré",
        "screenshot-phone": "Emplacement de capture d’écran iPhone",
        "screenshot-ipad": "Emplacement de capture d’écran iPad",
        "diagram": "Emplacement de diagramme",
        "illustration": "Emplacement d’illustration"
    },
    "accessibleName": "{type} : {description}"
} satisfies Messages['assets'];
