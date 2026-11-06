import type { Messages } from '../../types.ts';

export default {
    "macCta": "Descargar para Mac",
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
    "card": {
        "yourSystem": "Tu sistema",
        "beta": "Beta",
        "dmg": "Descargar .dmg",
        "linux": "Instalar en Linux",
        "updates": {
            "mac": "Se actualiza en segundo plano",
            "ios": "Se actualiza desde el App Store",
            "linux": "Se actualiza con tu gestor de paquetes"
        }
    },
    "linux": {
        "title": "Instalar en Linux",
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
    "platforms": {
        "title": "Qué funciona en cada plataforma",
        "lead": "Todas las capacidades de las páginas de funciones, lado a lado.",
        "databases": {
            "one": "{count} base de datos",
            "other": "{count} bases de datos"
        },
        "capability": "Capacidad",
        "covers": "{platform} {count} de {total}",
        "available": "Disponible",
        "page": "Página de funciones",
        "pageLabel": "Página de funciones de {page}"
    },
    "updates": {
        "ios": "El App Store instala las actualizaciones, como con tus otras apps.",
        "linux": "Tu gestor de paquetes instala las actualizaciones junto con el resto del sistema. La app no las busca por sí misma."
    },
    "faq": {
        "title": "Preguntas",
        "free": {
            "question": "¿TablePro es gratis en Linux?",
            "answer": "Sí, su uso es gratuito. Los planes de pago añaden funciones a la app para Mac, y ninguna está todavía en Linux."
        },
        "license": {
            "question": "¿Mi licencia funciona en Linux?",
            "answer": {
                "one": "Sí. Una licencia se activa en {count} ordenador, Mac o Linux. Por ahora, sus funciones de pago están en el Mac.",
                "other": "Sí. Una licencia se activa en hasta {count} ordenadores, Mac o Linux. Por ahora, sus funciones de pago están en el Mac."
            }
        },
        "other": {
            "question": "¿Hay una versión para {platforms}?"
        },
        "verify": {
            "question": "¿Cómo verifico una descarga?",
            "mac": "En un Mac, abre <ui>Verifica tu descarga</ui> bajo el botón de descarga y compara la suma SHA-256.",
            "linux": "En Linux, abre <ui>Verifica un archivo</ui> en la pestaña Archivos de la sección de Linux."
        }
    }
} satisfies Messages['download'];
