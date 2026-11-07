import type { Messages } from '../../types.ts';

export default {
    "macCta": "Baixar para Mac",
    "linuxCta": "Instalar no Linux",
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
    "panel": {
        "legend": "Plataforma",
        "beta": "Beta",
        "updates": {
            "mac": "Atualiza sozinho em segundo plano",
            "ios": "Atualiza pela App Store"
        }
    },
    "linux": {
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
    "otherPlatforms": {
        "question": "Existe uma versão para {platforms}?"
    }
} satisfies Messages['download'];
