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
            "description": "Ferramentas essenciais de banco de dados, sem período de teste.",
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
            "description": "Adiciona ao app para Mac recursos como {examples}.",
            "activation": {
                "one": "Uma pessoa, {count} Mac.",
                "other": "Uma pessoa, até {count} Macs."
            },
            "includesTitle": "Tudo do plano Grátis, mais",
            "cta": "Comprar Starter"
        },
        "team": {
            "name": "Team",
            "description": "Compartilhe conexões e consultas salvas com sua equipe.",
            "activation": "Um Mac ativado por vaga.",
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
        "clamped": {
            "min": "Alterado para o mínimo de {min} vagas.",
            "max": "Alterado para o máximo de {max} vagas."
        },
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
    "refund": {
        "one": "Todos os planos pagos podem ser reembolsados em até {count} dia após a compra, e cada renovação mensal ou anual em até {count} dia após a cobrança. Veja a <link>política de reembolso</link>.",
        "other": "Todos os planos pagos podem ser reembolsados em até {count} dias após a compra, e cada renovação mensal ou anual em até {count} dias após a cobrança. Veja a <link>política de reembolso</link>."
    },
    "finePrint": "Preços em dólares americanos. {merchant} processa pagamentos e calcula tributos sobre vendas ou IVA no checkout como merchant of record.",
    "finePrintCurrency": "Preços em dólares americanos.",
    "comparePlans": "Comparar planos",
    "section": {
        "title": "Preços",
        "lead": "TablePro é de código aberto e de uso gratuito. Os planos pagos adicionam recursos opcionais ao app para Mac."
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
        "iphoneNote": "O app para iPhone e iPad não tem recursos pagos. O iCloud Sync é gratuito nesses dispositivos; para sincronizar com um Mac, o Mac precisa de Starter ou Team."
    },
    "regional": {
        "note": "Preços para o seu país ({country}): {percent}% de desconto, aplicado no checkout.",
        "listPrice": "Preço de tabela {price}"
    },
    "discount": {
        "atCheckout": "Tem um código de desconto? Digite-o no checkout.",
        "summary": "Tem um código de desconto?",
        "label": "Código de desconto",
        "apply": "Aplicar código",
        "checking": "Verificando o código…",
        "percent": "Código aceito: {amount}% de desconto, aplicado no checkout.",
        "fixed": "Código aceito: {amount} de desconto, aplicado no checkout.",
        "invalid": "Este código é inválido ou expirou."
    },
    "checkout": {
        "failed": "Não foi possível abrir o checkout. Tente novamente."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "vaga"
    }
} satisfies Messages['pricing'];
