import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} o successivo",
        "unnamed": "{systems} {version} o successivo"
    },
    "requires": "Richiede {requirement}",
    "systemsJoiner": " e ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " o "
    },
    "app": {
        "mac": "app per Mac",
        "ios": "app per iPhone e iPad"
    },
    "availability": {
        "summary": "Disponibile per {deviceList}."
    },
    "free": "Gratuita, senza acquisti in-app",
    "status": {
        "released": "Disponibile",
        "prototype": "Solo un prototipo. Nulla da installare e nessuna data di rilascio.",
        "none": "Non disponibile e nessuna data di rilascio."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Aggiunta in TablePro {version} per Mac. Homebrew potrebbe ancora installare una versione precedente."
    }
} satisfies Messages['platforms'];
