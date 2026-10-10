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
        "yearlyByTier": "Si rinnova ogni anno fino alla disdetta. Starter costa il {starterPercent}% in meno rispetto a dodici pagamenti mensili, Team il {teamPercent}% in meno.",
        "lifetime": "Un solo pagamento, senza scadenza."
    },
    "tiers": {
        "free": {
            "name": "Gratuito",
            "description": "Strumenti database essenziali, senza periodo di prova.",
            "activation": "Non serve registrarsi per usare l’app.",
            "includesTitle": "Include",
            "includes": [
                "Connessioni a qualsiasi motore supportato",
                "L’editor SQL e la griglia dei dati",
                "L’assistente IA e il server MCP",
                "Safe Mode",
                "L’app per iPhone e iPad"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Aggiunge all’app per Mac funzionalità come {examples}.",
            "activation": {
                "one": "Una persona, {count} Mac.",
                "other": "Una persona, fino a {count} Mac."
            },
            "includesTitle": "Tutto il piano Gratuito, più",
            "cta": "Acquista Starter"
        },
        "team": {
            "name": "Team",
            "description": "Condividi connessioni e query salvate con il team.",
            "activation": "Un Mac attivato per posto.",
            "includesTitle": "Tutto il piano Starter, più",
            "cta": "Acquista Team"
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
            "yearly": "per posto, all’anno",
            "lifetime": "per posto, un solo pagamento"
        }
    },
    "seats": {
        "label": "Posti",
        "noun": "posti",
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
            },
            "lifetime": {
                "one": "{count} posto: {total}, un solo pagamento",
                "other": "{count} posti: {total}, un solo pagamento"
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
        "one": "Ogni piano a pagamento può essere rimborsato entro {count} giorno dall’acquisto, e ogni rinnovo mensile o annuale entro {count} giorno dal suo addebito. Consulta la <link>politica di rimborso</link>.",
        "other": "Ogni piano a pagamento può essere rimborsato entro {count} giorni dall’acquisto, e ogni rinnovo mensile o annuale entro {count} giorni dal suo addebito. Consulta la <link>politica di rimborso</link>."
    },
    "finePrint": "Prezzi in dollari USA. {merchant} gestisce il pagamento e calcola imposte o IVA al checkout come merchant of record.",
    "finePrintCurrency": "Prezzi in dollari statunitensi.",
    "comparePlans": "Confronta i piani",
    "section": {
        "title": "Prezzi",
        "lead": "TablePro è open source e si può usare gratuitamente. I piani a pagamento aggiungono funzionalità opzionali all’app per Mac."
    },
    "matrix": {
        "caption": "Cosa include ogni piano nell’app per Mac",
        "feature": "Funzionalità",
        "macs": "Mac",
        "macsFree": "Nessuna licenza",
        "macsStarter": {
            "one": "{count}",
            "other": "Fino a {count}"
        },
        "macsTeam": "Uno per posto",
        "everythingElse": "Tutto il resto dell’app",
        "everythingElseDetail": "Ogni motore supportato, l’editor SQL, l’assistente IA, il server MCP e Safe Mode",
        "iphoneNote": "L’app per iPhone e iPad non ha funzionalità a pagamento. iCloud Sync è gratuito su questi dispositivi; per sincronizzare con un Mac, il Mac deve avere Starter o Team."
    },
    "regional": {
        "note": "Prezzi per il tuo paese ({country}): {percent}% di sconto, applicato al checkout.",
        "listPrice": "Prezzo di listino {price}"
    },
    "discount": {
        "atCheckout": "Hai un codice sconto? Inseriscilo al checkout.",
        "summary": "Hai un codice sconto?",
        "label": "Codice sconto",
        "apply": "Applica codice",
        "checking": "Verifica del codice…",
        "percent": "Codice accettato: {amount}% di sconto, applicato al checkout.",
        "fixed": "Codice accettato: {amount} di sconto, applicato al checkout.",
        "invalid": "Questo codice non è valido o è scaduto."
    },
    "checkout": {
        "failed": "Impossibile aprire il checkout. Riprova."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "posto"
    }
} satisfies Messages['pricing'];
