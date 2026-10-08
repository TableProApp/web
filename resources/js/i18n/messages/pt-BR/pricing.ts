import type { Messages } from '../../types.ts';

export default {
    "currency": {
        "pattern": "US$ {amount}",
        "decimal": ",",
        "group": "."
    },
    "cycles": {
        "legend": "Ciclo de cobrança",
        "monthly": "Mensal",
        "yearly": "Anual",
        "lifetime": "Pagamento único"
    },
    "captions": {
        "monthly": "Renovação mensal até você cancelar.",
        "yearly": "Renovação anual até você cancelar. {percent}% menos que doze pagamentos mensais.",
        "yearlyByTier": "Renovação anual até você cancelar. Starter custa {starterPercent}% menos que doze pagamentos mensais; Team, {teamPercent}% menos.",
        "lifetime": "Pago uma vez, sem data de expiração."
    },
    "tiers": {
        "free": {
            "name": "Grátis",
            "description": "O app para Mac sem os recursos pagos e o app para iPhone e iPad.",
            "activation": "Não é preciso se cadastrar para usar o app.",
            "includesTitle": "Inclui",
            "includes": [
                "Conexões com qualquer mecanismo compatível",
                "O editor SQL e a grade de dados",
                "O assistente de IA e o servidor MCP",
                "Safe Mode",
                "O app para iPhone e iPad"
            ]
        },
        "starter": {
            "name": "Starter",
            "description": "Adiciona os recursos Starter ao app para Mac.",
            "activation": {
                "one": "Uma licença para {count} Mac.",
                "other": "Uma licença para até {count} Macs."
            },
            "includesTitle": "Tudo do plano Grátis, mais",
            "cta": "Comprar Starter"
        },
        "team": {
            "name": "Team",
            "description": "Além dos recursos Starter, adiciona conexões e consultas compartilhadas com sua equipe.",
            "activation": "Cada vaga corresponde a um Mac ativado.",
            "includesTitle": "Tudo do Starter, mais",
            "cta": "Comprar Team"
        }
    },
    "units": {
        "starter": {
            "monthly": "por mês",
            "yearly": "por ano",
            "lifetime": "pagamento único"
        },
        "team": {
            "monthly": "por vaga, por mês",
            "yearly": "por vaga, por ano",
            "lifetime": "por vaga, pagamento único"
        }
    },
    "seats": {
        "label": "Vagas",
        "noun": "vagas",
        "bounds": "Mínimo de {min} vagas, máximo de {max}.",
        "total": {
            "monthly": {
                "one": "{count} vaga: {total} por mês",
                "other": "{count} vagas: {total} por mês"
            },
            "yearly": {
                "one": "{count} vaga: {total} por ano",
                "other": "{count} vagas: {total} por ano"
            },
            "lifetime": {
                "one": "{count} vaga: {total}, pagamento único",
                "other": "{count} vagas: {total}, pagamento único"
            }
        }
    },
    "prioritySupport": {
        "name": "Suporte prioritário",
        "detail": {
            "one": "Emails de clientes Team são respondidos primeiro, em até um dia útil.",
            "other": "Emails de clientes Team são respondidos primeiro, em até {count} dias úteis."
        }
    },
    "allFeatures": "Todos os recursos pagos",
    "finePrint": "Preços em dólares americanos. {merchant} é o merchant of record: recebe o pagamento e calcula os tributos sobre vendas ou IVA no checkout.",
    "finePrintCurrency": "Preços em dólares americanos.",
    "comparePlans": "Comparar planos",
    "section": {
        "title": "Preços",
        "lead": "TablePro é de código aberto e gratuito para usar. Os planos pagos adicionam recursos opcionais ao app para Mac."
    },
    "matrix": {
        "caption": "O que cada plano inclui no app para Mac",
        "feature": "Recurso",
        "macs": "Macs",
        "macsFree": "Sem licença",
        "macsStarter": {
            "one": "{count}",
            "other": "Até {count}"
        },
        "macsTeam": "Um por vaga",
        "everythingElse": "Todo o restante do app",
        "everythingElseDetail": "Todos os mecanismos compatíveis, o editor SQL, o assistente de IA, o servidor MCP e o Safe Mode",
        "iphoneNote": "O app para iPhone e iPad não tem recursos pagos. O iCloud Sync é gratuito nesses dispositivos; para sincronizar com um Mac, ele precisa de Starter ou Team."
    },
    "discount": {
        "atCheckout": "Tem um código de desconto? Digite-o no checkout.",
        "summary": "Tem um código de desconto?",
        "label": "Código de desconto",
        "apply": "Aplicar código",
        "checking": "Verificando o código…",
        "percent": "Código aceito: {amount}% de desconto, aplicado no checkout.",
        "fixed": "Código aceito: {amount} de desconto, aplicado no checkout.",
        "invalid": "Esse código de desconto é inválido ou expirou."
    },
    "checkout": {
        "failed": "Não foi possível iniciar o checkout. Tente novamente."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "vaga"
    }
} satisfies Messages['pricing'];
