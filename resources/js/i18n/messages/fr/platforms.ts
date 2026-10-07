import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} ou version ultérieure",
        "unnamed": "{systems} {version} ou version ultérieure"
    },
    "requires": "Nécessite {requirement}",
    "systemsJoiner": " et ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " ou "
    },
    "app": {
        "mac": "Application Mac",
        "ios": "Application iPhone et iPad"
    },
    "availability": {
        "summary": "Disponible pour {deviceList}."
    },
    "free": "Gratuit, sans achats intégrés",
    "status": {
        "released": "Disponible",
        "prototype": "Un prototype uniquement. Rien à installer, aucune date de sortie.",
        "none": "Non disponible, aucune date de sortie."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Ajouté dans TablePro {version} pour Mac. Homebrew peut encore installer une version antérieure."
    }
} satisfies Messages['platforms'];
