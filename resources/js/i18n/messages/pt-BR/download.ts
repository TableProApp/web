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
        "notes": "Notas de versão",
        "unavailable": "Não foi possível carregar os detalhes da versão atual. Os dois botões abrem a versão mais recente no GitHub, onde você pode escolher a imagem de disco para seu Mac."
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
        "body": "Abra o menu Apple e escolha Sobre Este Mac. Um Mac com Apple silicon mostra a linha Chip, como Apple M2. Um Mac Intel mostra a linha Processador com o nome Intel."
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
