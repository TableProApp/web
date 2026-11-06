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
        "yearlyByTier": "Renovação anual até você cancelar. Pro custa {starterPercent}% menos que doze pagamentos mensais; Team, {teamPercent}% menos.",
        "lifetime": "Pago uma vez, sem data de expiração."
    },
    "tiers": {
        "free": {
            "name": "Grátis",
            "description": "Ferramentas essenciais de banco de dados, sem período de teste.",
            "activation": "Não é preciso se cadastrar para usar o app.",
            "includesTitle": "Inclui",
            "includes": [
                "Todos os mecanismos compatíveis",
                "Editor SQL e grade de dados",
                "Assistente de IA e servidor MCP",
                "Safe Mode",
                "App para iPhone e iPad"
            ]
        },
        "starter": {
            "name": "Pro",
            "description": "Os recursos pagos, para uma pessoa.",
            "activation": {
                "one": "Uma pessoa, {count} computador, Mac ou Linux.",
                "other": "Uma pessoa, até {count} computadores, Mac ou Linux."
            },
            "includesTitle": "Tudo do plano Grátis, mais",
            "cta": "Comprar Pro"
        },
        "team": {
            "name": "Team",
            "description": "Pro para todos, e conexões compartilhadas.",
            "activation": {
                "one": "Uma pessoa por vaga, {count} computador, Mac ou Linux.",
                "other": "Uma pessoa por vaga, em até {count} computadores, Mac ou Linux."
            },
            "includesTitle": "Tudo do Pro, mais",
            "cta": "Comprar Team",
            "subscriptionOnly": "O Team é vendido por mês ou por ano."
        },
        "enterprise": {
            "name": "Enterprise",
            "description": "Login com as contas da empresa, políticas obrigatórias, log de auditoria, MDM, pedidos de compra.",
            "cta": "Fale conosco"
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
            "yearly": "por vaga, por mês, cobrado anualmente"
        }
    },
    "seats": {
        "label": "Vagas",
        "noun": "vagas",
        "minimum": "Mínimo de {min} vagas.",
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
        "one": "Reembolso em até {count} dia após uma compra ou renovação (<link>política de reembolso</link>).",
        "other": "Reembolso em até {count} dias após uma compra ou renovação (<link>política de reembolso</link>)."
    },
    "finePrint": "Preços em dólares americanos; {merchant} adiciona tributos sobre vendas ou IVA no checkout.",
    "comparePlans": "Comparar planos",
    "section": {
        "title": "Preços",
        "lead": "TablePro é de código aberto e de uso gratuito. Os planos pagos adicionam recursos opcionais ao app para Mac."
    },
    "matrix": {
        "caption": "O que cada plano inclui no app para Mac",
        "feature": "Recurso",
        "groups": {
            "starter": "No Pro e no Team",
            "team": "No Team",
            "all": "Em todos os planos"
        },
        "macs": "Computadores",
        "macsFree": "Sem licença",
        "macsStarter": {
            "one": "{count}, Mac ou Linux",
            "other": "Até {count}, Mac ou Linux"
        },
        "macsTeam": {
            "one": "{count} por vaga, Mac ou Linux",
            "other": "Até {count} por vaga, Mac ou Linux"
        },
        "everythingElse": "Todo o restante do app",
        "everythingElseDetail": "Todos os mecanismos compatíveis, o editor SQL, o assistente de IA, o servidor MCP e o Safe Mode",
        "iphoneNote": "O app para iPhone e iPad não tem recursos pagos. O iCloud Sync é gratuito nesses dispositivos; para sincronizar com um Mac, o Mac precisa de Pro ou Team."
    },
    "regional": {
        "note": "Preços para o seu país ({country}): {percent}% de desconto, aplicado no checkout.",
        "listPrice": "Preço de tabela {price}"
    },
    "discount": {
        "summary": "Tem um código de desconto?",
        "label": "Código de desconto",
        "apply": "Aplicar código",
        "checking": "Verificando o código…",
        "percent": "Código aceito: {amount}% de desconto, aplicado no checkout.",
        "fixed": "Código aceito: {amount} de desconto, aplicado no checkout.",
        "accepted": "Código aceito, aplicado no checkout.",
        "invalid": "Este código é inválido ou expirou."
    },
    "checkout": {
        "failed": "Não foi possível abrir o checkout. Tente novamente.",
        "planUnavailable": "Este plano não está à venda no momento. Escolha outro ciclo de cobrança ou tente novamente mais tarde.",
        "seats": "Escolha entre {min} e {max} vagas e tente novamente.",
        "seatsFewer": "Escolha menos vagas e tente novamente."
    },
    "offers": {
        "name": "{plan}, {cycle}",
        "seat": "vaga"
    }
} satisfies Messages['pricing'];
