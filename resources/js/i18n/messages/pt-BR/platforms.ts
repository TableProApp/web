import type { Messages } from '../../types.ts';

export default {
    "requirement": {
        "named": "{systems} {version} {releaseName} ou posterior",
        "unnamed": "{systems} {version} ou posterior"
    },
    "requires": "Requer {requirement}",
    "systemsJoiner": " e ",
    "architectures": {
        "arm64": "Apple silicon",
        "x86_64": "Intel",
        "joiner": " ou "
    },
    "app": {
        "mac": "app para Mac",
        "ios": "app para iPhone e iPad"
    },
    "availability": {
        "summary": "Disponível para {deviceList}."
    },
    "free": "Grátis, sem compras no app",
    "status": {
        "released": "Disponível",
        "prototype": "Apenas um protótipo. Nada para instalar, sem data de lançamento.",
        "none": "Indisponível, sem data de lançamento."
    },
    "names": {
        "linux": "Linux",
        "windows": "Windows"
    },
    "release": {
        "badge": "{version}",
        "badgeLabel": "Adicionado no TablePro {version} para Mac. O Homebrew ainda pode instalar uma versão anterior."
    }
} satisfies Messages['platforms'];
