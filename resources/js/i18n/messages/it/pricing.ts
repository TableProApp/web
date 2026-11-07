import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "{amount} USD",
        "decimal": ",",
        "group": "."
    },
    "cycles": {
        "legend": "Periodo di fatturazione",
        "monthly": "Mensile",
        "yearly": "Annuale",
        "lifetime": "Una tantum"
    },
    "captions": {
        "monthly": "Si rinnova ogni mese fino alla disdetta.",
        "yearly": "Si rinnova ogni anno fino alla disdetta. {percent}% in meno rispetto a dodici pagamenti mensili.",
        "yearlyByTier": "Si rinnova ogni anno fino alla disdetta. Pro costa il {starterPercent}% in meno rispetto a dodici pagamenti mensili, Team il {teamPercent}% in meno.",
        "lifetime": "Un solo pagamento, senza scadenza."
    },
    "tiers": {
        "free": {
            "name": "Gratuito",
            "description": "Strumenti database essenziali, senza periodo di prova.",
            "activation": "Non serve registrarsi per usare l’app.",
            "includesTitle": "Include",
            "includes": [
                "Ogni motore supportato",
                "Editor SQL e griglia dei dati",
                "Assistente IA e server MCP",
                "Safe Mode",
                "App per iPhone e iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Le funzionalità a pagamento, per una persona.",
            "activation": {
                "one": "Una persona, {count} computer, Mac o Linux.",
                "other": "Una persona, fino a {count} computer, Mac o Linux."
            },
            "includesTitle": "Tutto il piano Gratuito, più",
            "cta": "Acquista Pro"
        },
        "team": {
            "name": "Team",
            "description": "Pro per tutti, e connessioni condivise.",
            "activation": {
                "one": "Una persona per posto, {count} computer, Mac o Linux.",
                "other": "Una persona per posto, fino a {count} computer, Mac o Linux."
            },
            "includesTitle": "Tutto il piano Pro, più",
            "cta": "Acquista Team",
            "subscriptionOnly": "Team si vende con pagamento mensile o annuale."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Accesso con gli account aziendali, criteri imposti, un registro di audit, MDM, ordini di acquisto.",
            "cta": "Contattaci"
        }
    },
    "units": {
        "starter": {
            "monthly": "al mese",
            "yearly": "all’anno",
            "lifetime": "un solo pagamento"
        },
        "team": {
            "monthly": "per posto, al mese",
            "yearly": "per posto, al mese, fatturato annualmente"
        }
    },
    "seats": {
        "label": "Posti",
        "noun": "posti",
        "minimum": "Minimo {min} posti.",
        "bounds": "Minimo {min} posti, massimo {max}.",
        "clamped": {
            "min": "Modificato al minimo di {min} posti.",
            "max": "Modificato al massimo di {max} posti."
        },
        "total": {
            "monthly": {
                "one": "{count} posto: {total} al mese",
                "other": "{count} posti: {total} al mese"
            },
            "yearly": {
                "one": "{count} posto: {total} all’anno",
                "other": "{count} posti: {total} all’anno"
            }
        }
    },
    "prioritySupport": {
        "name": "Assistenza prioritaria",
        "detail": {
            "one": "Le email dei clienti Team ricevono risposta per prime, entro un giorno lavorativo.",
            "other": "Le email dei clienti Team ricevono risposta per prime, entro {count} giorni lavorativi."
        }
    },
    "allFeatures": "Tutte le funzionalità a pagamento",
    "refund": {
        "one": "Rimborsi entro {count} giorno da un acquisto o da un rinnovo (<link>politica di rimborso</link>).",
        "other": "Rimborsi entro {count} giorni da un acquisto o da un rinnovo (<link>politica di rimborso</link>)."
    },
    "finePrint": "Prezzi in dollari USA; {merchant} aggiunge imposte o IVA al checkout.",
    "comparePlans": "Confronta i piani",
    "section": {
        "title": "Prezzi",
        "lead": "TablePro è open source e si può usare gratuitamente. I piani a pagamento aggiungono funzionalità opzionali."
    },
    "matrix": {
        "caption": "Cosa include ogni piano",
        "feature": "Funzionalità",
        "groups": {
            "starter": "In Pro e Team",
            "team": "In Team",
            "all": "In ogni piano"
        },
        "macs": "Computer",
        "macsFree": "Nessuna licenza",
        "macsStarter": {
            "one": "{count}, Mac o Linux",
            "other": "Fino a {count}, Mac o Linux"
        },
        "macsTeam": {
            "one": "{count} per posto, Mac o Linux",
            "other": "Fino a {count} per posto, Mac o Linux"
        },
        "everythingElse": "Tutto il resto dell’app",
        "everythingElseDetail": "Ogni motore supportato, l’editor SQL, l’assistente IA, il server MCP e Safe Mode",
        "iphoneNote": "L’app per iPhone e iPad non ha funzionalità a pagamento. iCloud Sync è gratuito su questi dispositivi; per sincronizzare con un Mac, il Mac deve avere Pro o Team."
    },
    "regional": {
        "note": "Prezzi per il tuo paese ({country}): {percent}% di sconto, applicato al checkout.",
        "listPrice": "Prezzo di listino {price}"
    },
    "discount": {
        "summary": "Hai un codice sconto?",
        "label": "Codice sconto",
        "apply": "Applica codice",
        "checking": "Verifica del codice…",
        "percent": "Codice accettato: {amount}% di sconto, applicato al checkout.",
        "fixed": "Codice accettato: {amount} di sconto, applicato al checkout.",
        "accepted": "Codice accettato, applicato al checkout.",
        "invalid": "Questo codice non è valido o è scaduto."
    },
    "checkout": {
        "failed": "Impossibile aprire il checkout. Riprova.",
        "planUnavailable": "Questo piano al momento non è in vendita. Scegli un altro periodo di fatturazione o riprova più tardi.",
        "seats": "Scegli tra {min} e {max} posti, poi riprova.",
        "seatsFewer": "Scegli meno posti, poi riprova."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "posto"
    }
} satisfies Messages['pricing'];
