import type { Messages } from '../../types.ts';

export default {
    "macCta": "Descargar para Mac",
    "release": {
        "dated": "Versión {version}, publicada el {date}",
        "undated": "Versión {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notas de versión (inglés)",
        "unavailable": "Los detalles de la versión no están disponibles. El botón abre la última versión en GitHub."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "onAnotherDevice": "Para instalar la app para Mac, abre esta página en tu Mac.",
    "checksum": {
        "summary": "Verifica tu descarga",
        "body": "Ejecuta <code>shasum -a 256</code> sobre el archivo en Terminal. El resultado debe coincidir con la suma SHA-256 de abajo."
    },
    "afterClick": {
        "title": "Ahora, instálalo",
        "body": "Abre {file} desde la carpeta Descargas y arrastra TablePro a Aplicaciones.",
        "retry": "Si la descarga no comenzó, <link>vuelve a descargar {file}</link>.",
        "steps": "Instalación y primer inicio"
    },
    "homebrew": {
        "label": "Comando de Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Descargar en el App Store"
    },
    "otherPlatforms": {
        "joiner": {
            "separator": ", ",
            "last": " o "
        }
    }
} satisfies Messages['download'];
