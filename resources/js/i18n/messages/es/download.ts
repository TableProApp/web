import type { Messages } from '../../types.ts';

export default {
    "macCta": "Descargar para Mac",
    "builds": {
        "arm64": "Descargar para Apple silicon",
        "x86_64": "Descargar para Intel"
    },
    "release": {
        "dated": "Versión {version}, publicada el {date}",
        "undated": "Versión {version}",
        "badge": "v{version} · {date}",
        "badgeUndated": "v{version}",
        "notes": "Notas de versión (inglés)",
        "unavailable": "No se pudieron cargar los detalles de la versión actual. Ambos botones abren la última versión en GitHub, donde puedes elegir la imagen de disco para tu Mac."
    },
    "file": {
        "sized": "{name} · {size} MB",
        "unsized": "{name}",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "detected": "Tu navegador indica que tienes un Mac con {chip}.",
    "onAnotherDevice": "Para instalar la app para Mac, abre esta página en tu Mac.",
    "whichMac": {
        "summary": "¿Qué Mac tengo?",
        "body": "Abre el menú Apple y selecciona Acerca de este Mac. Un Mac con Apple silicon muestra una línea Chip, por ejemplo Apple M2. Un Mac Intel muestra una línea Procesador que menciona Intel."
    },
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
