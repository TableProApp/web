import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "{amount} US$",
        "decimal": ",",
        "group": "."
    },
    "cycles": {
        "legend": "Abrechnungszeitraum",
        "monthly": "Monatlich",
        "yearly": "Jährlich",
        "lifetime": "Einmalig"
    },
    "captions": {
        "monthly": "Verlängert sich monatlich, bis du kündigst.",
        "yearly": "Verlängert sich jährlich, bis du kündigst. {percent} % günstiger als zwölf Monatszahlungen.",
        "yearlyByTier": "Verlängert sich jährlich, bis du kündigst. Starter ist {starterPercent} % günstiger als zwölf Monatszahlungen, Team {teamPercent} % günstiger.",
        "lifetime": "Einmalige Zahlung, ohne Ablaufdatum."
    },
    "tiers": {
        "free": {
            "name": "Kostenlos",
            "description": "Grundlegende Datenbankwerkzeuge ohne Testzeitraum.",
            "activation": "Die App lässt sich ohne Registrierung nutzen.",
            "includesTitle": "Enthält",
            "includes": [
                "Verbindungen zu allen unterstützten Datenbanksystemen",
                "SQL-Editor und Datentabelle",
                "KI-Assistent und MCP-Server",
                "Safe Mode",
                "Die iPhone- und iPad-App"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Ergänzt die Mac-App um Funktionen wie {examples}.",
            "activation": {
                "one": "Eine Person, {count} Mac.",
                "other": "Eine Person, bis zu {count} Macs."
            },
            "includesTitle": "Alles aus Kostenlos, plus",
            "cta": "Starter kaufen"
        },
        "team": {
            "name": "Team",
            "description": "Teile Verbindungen und gespeicherte Abfragen mit deinem Team.",
            "activation": "Ein aktivierter Mac pro Arbeitsplatz.",
            "includesTitle": "Alles aus Starter, plus",
            "cta": "Team kaufen"
        }
    },
    "units": {
        "starter": {
            "monthly": "pro Monat",
            "yearly": "pro Jahr",
            "lifetime": "einmalige Zahlung"
        },
        "team": {
            "monthly": "pro Arbeitsplatz und Monat",
            "yearly": "pro Arbeitsplatz und Jahr",
            "lifetime": "pro Arbeitsplatz, einmalig"
        }
    },
    "seats": {
        "label": "Arbeitsplätze",
        "noun": "Arbeitsplätze",
        "bounds": "Mindestens {min} Arbeitsplätze, höchstens {max}.",
        "clamped": {
            "min": "Auf das Minimum von {min} Arbeitsplätzen geändert.",
            "max": "Auf das Maximum von {max} Arbeitsplätzen geändert."
        },
        "total": {
            "monthly": {
                "one": "{count} Arbeitsplatz: {total} pro Monat",
                "other": "{count} Arbeitsplätze: {total} pro Monat"
            },
            "yearly": {
                "one": "{count} Arbeitsplatz: {total} pro Jahr",
                "other": "{count} Arbeitsplätze: {total} pro Jahr"
            },
            "lifetime": {
                "one": "{count} Arbeitsplatz: {total}, einmalige Zahlung",
                "other": "{count} Arbeitsplätze: {total}, einmalige Zahlung"
            }
        }
    },
    "prioritySupport": {
        "name": "Bevorzugter Support",
        "detail": {
            "one": "E-Mails von Team-Kunden werden zuerst beantwortet, innerhalb eines Werktags.",
            "other": "E-Mails von Team-Kunden werden zuerst beantwortet, innerhalb von {count} Werktagen."
        }
    },
    "allFeatures": "Alle Bezahlfunktionen",
    "refund": {
        "one": "Jeder bezahlte Tarif kann innerhalb von {count} Tag nach dem Kauf erstattet werden, jede monatliche oder jährliche Verlängerung innerhalb von {count} Tag nach ihrer Abbuchung. Details in der <link>Erstattungsrichtlinie</link>.",
        "other": "Jeder bezahlte Tarif kann innerhalb von {count} Tagen nach dem Kauf erstattet werden, jede monatliche oder jährliche Verlängerung innerhalb von {count} Tagen nach ihrer Abbuchung. Details in der <link>Erstattungsrichtlinie</link>."
    },
    "finePrint": "Preise in US-Dollar. {merchant} wickelt als Merchant of Record die Zahlung ab und berechnet die Umsatzsteuer beim Checkout.",
    "finePrintCurrency": "Preise in US-Dollar.",
    "comparePlans": "Tarife vergleichen",
    "section": {
        "title": "Preise",
        "lead": "TablePro ist quelloffen und kostenlos nutzbar. Bezahlte Tarife ergänzen die Mac-App um optionale Funktionen."
    },
    "matrix": {
        "caption": "Was jeder Tarif in der Mac-App enthält",
        "feature": "Funktion",
        "macs": "Macs",
        "macsFree": "Keine Lizenz",
        "macsStarter": {
            "one": "{count}",
            "other": "Bis zu {count}"
        },
        "macsTeam": "Einer pro Arbeitsplatz",
        "everythingElse": "Alles andere in der App",
        "everythingElseDetail": "Alle unterstützten Datenbanksysteme, SQL-Editor, KI-Assistent, MCP-Server und Safe Mode",
        "iphoneNote": "Die iPhone- und iPad-App hat keine Bezahlfunktionen. iCloud Sync ist dort kostenlos; für die Synchronisierung mit einem Mac benötigt der Mac Starter oder Team."
    },
    "discount": {
        "atCheckout": "Hast du einen Rabattcode? Gib ihn beim Kauf ein.",
        "summary": "Hast du einen Rabattcode?",
        "label": "Rabattcode",
        "apply": "Code einlösen",
        "checking": "Code wird geprüft…",
        "percent": "Code akzeptiert: {amount} % Rabatt, wird beim Kauf abgezogen.",
        "fixed": "Code akzeptiert: {amount} Rabatt, wird beim Kauf abgezogen.",
        "invalid": "Dieser Code ist ungültig oder abgelaufen."
    },
    "checkout": {
        "failed": "Der Checkout konnte nicht geöffnet werden. Versuche es erneut."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "Arbeitsplatz"
    }
} satisfies Messages['pricing'];
