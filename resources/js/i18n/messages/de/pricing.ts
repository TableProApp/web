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
        "yearlyByTier": "Verlängert sich jährlich, bis du kündigst. Pro ist {starterPercent} % günstiger als zwölf Monatszahlungen, Team {teamPercent} % günstiger.",
        "lifetime": "Einmalige Zahlung, ohne Ablaufdatum."
    },
    "tiers": {
        "free": {
            "name": "Kostenlos",
            "description": "Grundlegende Datenbankwerkzeuge ohne Testzeitraum.",
            "activation": "Die App lässt sich ohne Registrierung nutzen.",
            "includesTitle": "Enthält",
            "includes": [
                "Alle unterstützten Datenbanksysteme",
                "SQL-Editor und Datentabelle",
                "KI-Assistent und MCP-Server",
                "Safe Mode",
                "iPhone- und iPad-App"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Die Bezahlfunktionen, für eine Person.",
            "activation": {
                "one": "Eine Person, {count} Computer, Mac oder Linux.",
                "other": "Eine Person, bis zu {count} Computer, Mac oder Linux."
            },
            "includesTitle": "Alles aus Kostenlos, plus",
            "cta": "Pro kaufen"
        },
        "team": {
            "name": "Team",
            "description": "Pro für alle, dazu geteilte Verbindungen.",
            "activation": {
                "one": "Eine Person pro Arbeitsplatz, {count} Computer, Mac oder Linux.",
                "other": "Eine Person pro Arbeitsplatz, bis zu {count} Computer, Mac oder Linux."
            },
            "includesTitle": "Alles aus Pro, plus",
            "cta": "Team kaufen",
            "subscriptionOnly": "Team gibt es monatlich oder jährlich."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Anmeldung mit den Konten deines Unternehmens, verbindliche Richtlinien, ein Audit-Log, MDM, Bestellscheine.",
            "cta": "Kontakt aufnehmen"
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
            "yearly": "pro Arbeitsplatz und Monat, jährlich abgerechnet"
        }
    },
    "seats": {
        "label": "Arbeitsplätze",
        "noun": "Arbeitsplätze",
        "minimum": "Mindestens {min} Arbeitsplätze.",
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
        "one": "Erstattung innerhalb von {count} Tag nach einem Kauf oder einer Verlängerung (<link>Erstattungsrichtlinie</link>).",
        "other": "Erstattung innerhalb von {count} Tagen nach einem Kauf oder einer Verlängerung (<link>Erstattungsrichtlinie</link>)."
    },
    "finePrint": "Preise in US-Dollar; {merchant} berechnet die Umsatzsteuer beim Checkout.",
    "comparePlans": "Tarife vergleichen",
    "section": {
        "title": "Preise",
        "lead": "TablePro ist quelloffen und kostenlos nutzbar. Bezahlte Tarife ergänzen die Mac-App um optionale Funktionen."
    },
    "matrix": {
        "caption": "Was jeder Tarif in der Mac-App enthält",
        "feature": "Funktion",
        "groups": {
            "starter": "In Pro und Team",
            "team": "In Team",
            "all": "In jedem Tarif"
        },
        "macs": "Computer",
        "macsFree": "Keine Lizenz",
        "macsStarter": {
            "one": "{count}, Mac oder Linux",
            "other": "Bis zu {count}, Mac oder Linux"
        },
        "macsTeam": {
            "one": "{count} pro Arbeitsplatz, Mac oder Linux",
            "other": "Bis zu {count} pro Arbeitsplatz, Mac oder Linux"
        },
        "everythingElse": "Alles andere in der App",
        "everythingElseDetail": "Alle unterstützten Datenbanksysteme, SQL-Editor, KI-Assistent, MCP-Server und Safe Mode",
        "iphoneNote": "Die iPhone- und iPad-App hat keine Bezahlfunktionen. iCloud Sync ist dort kostenlos; für die Synchronisierung mit einem Mac benötigt der Mac Pro oder Team."
    },
    "regional": {
        "note": "Preise für dein Land ({country}): {percent} % Rabatt, wird beim Kauf abgezogen.",
        "listPrice": "Listenpreis {price}"
    },
    "discount": {
        "summary": "Hast du einen Rabattcode?",
        "label": "Rabattcode",
        "apply": "Code einlösen",
        "checking": "Code wird geprüft…",
        "percent": "Code akzeptiert: {amount} % Rabatt, wird beim Kauf abgezogen.",
        "fixed": "Code akzeptiert: {amount} Rabatt, wird beim Kauf abgezogen.",
        "accepted": "Code akzeptiert, wird beim Kauf abgezogen.",
        "invalid": "Dieser Code ist ungültig oder abgelaufen."
    },
    "checkout": {
        "failed": "Der Checkout konnte nicht geöffnet werden. Versuche es erneut.",
        "planUnavailable": "Dieser Tarif ist gerade nicht erhältlich. Wähle einen anderen Abrechnungszeitraum oder versuche es später erneut.",
        "seats": "Wähle zwischen {min} und {max} Arbeitsplätzen und versuche es erneut.",
        "seatsFewer": "Wähle weniger Arbeitsplätze und versuche es erneut."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "Arbeitsplatz"
    }
} satisfies Messages['pricing'];
