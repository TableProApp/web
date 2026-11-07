import type { Messages } from '../../types.ts';

export default {
    "macCta": "Descargar para Mac",
    "linuxCta": "Instalar en Linux",
    "release": {
        "dated": "Versión {version}, publicada el {date}",
        "undated": "Versión {version}",
        "notes": "Notas de versión (inglés)",
        "unavailable": "Los detalles de la versión no están disponibles. El botón abre la última versión en GitHub."
    },
    "file": {
        "size": "{size} MB",
        "number": {
            "decimal": ",",
            "group": "."
        }
    },
    "checksum": {
        "summary": "Verifica tu descarga",
        "body": "Ejecuta <code>shasum -a 256</code> sobre el archivo en Terminal. El resultado debe coincidir con la suma SHA-256 de abajo."
    },
    "afterClick": {
        "title": "Ahora, instálalo",
        "body": "Abre {file} desde la carpeta Descargas y arrastra TablePro a Aplicaciones.",
        "retry": "Si la descarga no comenzó, <link>vuelve a descargar {file}</link>."
    },
    "homebrew": {
        "label": "Comando de Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Descargar en el App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " o "
    },
    "panel": {
        "legend": "Plataforma",
        "beta": "Beta",
        "updates": {
            "mac": "Se actualiza en segundo plano",
            "ios": "Se actualiza desde el App Store"
        }
    },
    "linux": {
        "beta": "La app para Linux está en beta: está en una fase temprana y puede cambiar de una versión a otra, así que <link>informa de los errores en GitHub</link>.",
        "methods": "Instalar con",
        "floor": "{name} {version}+",
        "anyDistribution": "cualquier distribución con Flatpak",
        "flatpak": "Flatpak",
        "files": "Archivos",
        "commands": "Comandos para {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Cualquier distribución con Flatpak · {architectures} · incluye su propio runtime de GNOME {version}",
        "update": "Las actualizaciones llegan con <code>{command}</code>",
        "table": {
            "caption": "Paquetes de TablePro {version} para Linux",
            "package": "Paquete",
            "bundle": "Bundle de Flatpak"
        },
        "checksums": "Sumas de verificación de todos los archivos: <link>{file}</link>",
        "release": "TablePro {version} para Linux en GitHub",
        "verify": {
            "summary": "Verifica un archivo",
            "body": "Ejecuta cualquiera de los dos comandos en la carpeta que contiene el archivo. El primero comprueba la atestación de compilación de GitHub y requiere GitHub CLI; el segundo comprueba el archivo con {file}.",
            "label": "comandos de verificación"
        }
    },
    "otherPlatforms": {
        "question": "¿Hay una versión para {platforms}?"
    }
} satisfies Messages['download'];
