import type { Messages } from '../../types.ts';

export default {
    "macCta": "Télécharger pour Mac",
    "release": {
        "dated": "Version {version}, publiée le {date}",
        "undated": "Version {version}",
        "notes": "Notes de version (anglais)",
        "unavailable": "Les détails de version sont indisponibles. Le bouton ouvre la dernière version sur GitHub."
    },
    "file": {
        "size": "{size} Mo",
        "number": {
            "decimal": ",",
            "group": " "
        }
    },
    "checksum": {
        "summary": "Vérifier votre téléchargement",
        "body": "Exécutez <code>shasum -a 256</code> sur le fichier dans Terminal. Le résultat doit correspondre à la somme de contrôle SHA-256 ci-dessous."
    },
    "afterClick": {
        "title": "Installez ensuite l’application",
        "body": "Ouvrez {file} depuis votre dossier Téléchargements et faites glisser TablePro dans Applications.",
        "retry": "Si le téléchargement n’a pas commencé, <link>téléchargez à nouveau {file}</link>."
    },
    "homebrew": {
        "label": "Commande Homebrew",
        "terminal": "Terminal"
    },
    "ios": {
        "badge": "Télécharger dans l’App Store"
    },
    "orList": {
        "separator": ", ",
        "last": " ou "
    },
    "panel": {
        "legend": "Plateforme",
        "beta": "Bêta",
        "updates": {
            "mac": "Se met à jour en arrière-plan",
            "ios": "Se met à jour via l’App Store"
        }
    },
    "linux": {
        "beta": "L’app Linux est en bêta : elle est récente et peut changer d’une version à l’autre, alors <link>signalez les bugs sur GitHub</link>.",
        "methods": "Installer avec",
        "floor": "{name} {version}+",
        "anyDistribution": "toute distribution via Flatpak",
        "flatpak": "Flatpak",
        "files": "Fichiers",
        "commands": "Commandes pour {method}",
        "requirement": "{name} {versions} · {architectures}",
        "flatpakRequirement": "Toute distribution avec Flatpak · {architectures} · embarque son propre runtime GNOME {version}",
        "update": "Les mises à jour arrivent avec <code>{command}</code>",
        "table": {
            "caption": "Paquets de TablePro {version} pour Linux",
            "package": "Paquet",
            "bundle": "Bundle Flatpak"
        },
        "checksums": "Sommes de contrôle de tous les fichiers : <link>{file}</link>",
        "release": "TablePro {version} pour Linux sur GitHub",
        "verify": {
            "summary": "Vérifier un fichier",
            "body": "Exécutez l’une des deux commandes dans le dossier qui contient le fichier. La première vérifie l’attestation de build de GitHub et nécessite GitHub CLI ; la seconde compare le fichier à {file}.",
            "label": "commandes de vérification"
        }
    },
    "otherPlatforms": {
        "question": "Existe-t-il une version pour {platforms} ?"
    }
} satisfies Messages['download'];
