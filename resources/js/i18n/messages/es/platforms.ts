import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} o posterior",
        "unnamed": "{systems} {version} o posterior"
    },
    "requires": "Requiere {requirement}",
    "systemsJoiner": " y ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " o "
    },
    "app": {
        "mac": "app para Mac",
        "ios": "app para iPhone y iPad"
    },
    "availability": {
        "summary": "Disponible para {deviceList}."
    },
    "free": "Gratis, sin compras dentro de la app",
    "status": {
        "released": "Disponible",
        "prototype": "Solo un prototipo. No hay nada que instalar ni fecha de lanzamiento.",
        "none": "No disponible, sin fecha de lanzamiento."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Añadido en TablePro {version} para Mac. Homebrew puede seguir instalando una versión anterior."
    }
} satisfies Messages['platforms'];
