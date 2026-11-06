import type { Messages } from '../../types.ts';

export default {
    "macCta": "Baixar para Mac",
    "release": {
        "dated": "Versão {version}, lançada em {date}",
        "undated": "Versão {version}",
        "notes": "Notas de versão (inglês)",
        "unavailable": "Detalhes do lançamento indisponíveis. O botão abre a última versão no GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Verifique seu download",
        "body": "Execute <code>shasum -a 256</code> no arquivo pelo Terminal. O resultado deve ser igual à soma de verificação SHA-256 abaixo."
    },
    "afterClick": {
        "title": "Agora, instale o app",
        "body": "Abra {file} na pasta Downloads e arraste TablePro para Aplicativos.",
        "retry": "Se o download não começou, <link>baixe {file} novamente</link>."
    },
    "homebrew": {
        "label": "Comando do Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Baixar na App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " ou "
    },
    "card": {
        "yourSystem": "Seu sistema",
        "beta": "Beta",
        "dmg": "Baixar .dmg",
        "linux": "Instalar no Linux",
        "updates": {
            "mac": "Atualiza sozinho em segundo plano",
            "ios": "Atualiza pela App Store",
            "linux": "Atualiza pelo gerenciador de pacotes"
        }
    },
    "linux": {
        "title": "Instalar no Linux",
        "beta": "O app para Linux está em beta: ainda está no início e pode mudar entre versões, então <link>relate bugs no GitHub</link>.",
        "methods": "Instalar com",
        "floor": "{name} {version}+",
        "anyDistribution": "qualquer distribuição via Flatpak",
        "flatpak": "Flatpak",
        "files": "Arquivos",
        "commands": "Comandos para {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Qualquer distribuição com Flatpak · {architectures} · traz o próprio runtime do GNOME {version}",
        "update": "As atualizações chegam com <code>{command}</code>",
        "table": {
            "caption": "Pacotes do TablePro {version} para Linux",
            "package": "Pacote",
            "bundle": "Bundle Flatpak"
        },
        "checksums": "Somas de verificação de todos os arquivos: <link>{file}</link>",
        "release": "TablePro {version} para Linux no GitHub",
        "verify": {
            "summary": "Verifique um arquivo",
            "body": "Execute qualquer um dos comandos na pasta onde está o arquivo. O primeiro verifica a atestação de build do GitHub e precisa da GitHub CLI; o segundo confere o arquivo com {file}.",
            "label": "comandos de verificação"
        }
    },
    "platforms": {
        "title": "O que funciona em cada plataforma",
        "lead": "Cada capacidade das páginas de recursos, lado a lado.",
        "databases": {
            "one": "{count} banco de dados",
            "other": "{count} bancos de dados"
        },
        "capability": "Capacidade",
        "covers": "{platform} {count} de {total}",
        "available": "Disponível",
        "page": "Página de recursos",
        "pageLabel": "Página de recursos de {page}"
    },
    "updates": {
        "ios": "A App Store instala as atualizações, como faz com seus outros apps.",
        "linux": "Seu gerenciador de pacotes instala as atualizações junto com o resto do sistema. O app não as procura sozinho."
    },
    "faq": {
        "title": "Perguntas",
        "free": {
            "question": "O TablePro é gratuito no Linux?",
            "answer": "Sim, o uso é gratuito. Os planos pagos adicionam recursos ao app para Mac, e nenhum deles está no Linux ainda."
        },
        "license": {
            "question": "Minha licença funciona no Linux?",
            "answer": {
                "one": "Sim. Uma licença pode ser ativada em {count} computador, Mac ou Linux. Por enquanto, os recursos pagos dela estão no Mac.",
                "other": "Sim. Uma licença pode ser ativada em até {count} computadores, Mac ou Linux. Por enquanto, os recursos pagos dela estão no Mac."
            }
        },
        "other": {
            "question": "Existe uma versão para {platforms}?"
        },
        "verify": {
            "question": "Como verifico um download?",
            "mac": "No Mac, abra <ui>Verifique seu download</ui> abaixo do botão de download e compare a soma de verificação SHA-256.",
            "linux": "No Linux, abra <ui>Verifique um arquivo</ui> na aba Arquivos da seção Linux."
        }
    }
} satisfies Messages['download'];
