import type { Messages } from '../../types.ts';

export default {
    "macCta": "Baixar para Mac",
    "release": {
        "dated": "Versão {version}, lançada em {date}",
        "undated": "Versão {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notas de versão (inglês)",
        "unavailable": "Detalhes do lançamento indisponíveis. O botão abre a última versão no GitHub."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "onAnotherDevice": "Para instalar o app para Mac, abra esta página no seu Mac.",
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
