import type { Messages } from '../../types.ts';

export default {
    "macCta": "Baixar para Mac",
    "builds": {
        "arm64": "Baixar para Apple silicon",
        "x86_64": "Baixar para Intel"
    },
    "release": {
        "dated": "Versão {version}, lançada em {date}",
        "undated": "Versão {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notas de versão (inglês)",
        "unavailable": "Detalhes do lançamento indisponíveis. Os dois botões abrem a última versão no GitHub; escolha a versão lá."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "detected": "Seu navegador informa que seu Mac usa {chip}.",
    "onAnotherDevice": "Para instalar o app para Mac, abra esta página no seu Mac.",
    "whichMac": {
        "summary": "Qual é o meu Mac?",
        "body": "Escolha Sobre Este Mac no menu Apple. A linha Chip indica Apple silicon; a linha Processador com Intel indica Intel."
    },
    "checksum": {
        "summary": "Verifique seu download",
        "body": "Execute <code>shasum -a 256</code> no arquivo pelo Terminal. O resultado deve ser igual à soma de verificação SHA-256 abaixo."
    },
    "afterClick": {
        "title": "Agora, instale o app",
        "body": "Abra {file} na pasta Downloads e arraste TablePro para Aplicativos.",
        "retry": "Se o download não começou, <link>baixe {file} novamente</link>.",
        "steps": "Instalação e primeiro uso"
    },
    "homebrew": {
        "label": "Comando do Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Baixar na App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " ou "
        }
    }
} satisfies Messages['download'];
