import type { Messages } from '../../types.ts';

export default {
    "status": "Erro {status}",
    "notFound": {
        "title": "Página não encontrada",
        "body": "O endereço pode estar incorreto ou a página pode ter mudado. Estas páginas são um bom ponto de partida."
    },
    "gone": {
        "title": "Esta página foi removida",
        "body": "Ela não faz mais parte de tablepro.app e nenhuma outra página a substitui."
    },
    "serverError": {
        "title": "Algo deu errado",
        "body": "O problema está do nosso lado. Tente novamente em instantes. Se persistir, envie um email para {email}."
    },
    "unavailable": {
        "title": "Em manutenção",
        "body": "tablepro.app estará de volta em breve."
    },
    "translation": {
        "title": "Esta página está disponível apenas em {language}",
        "body": "Ela ainda não foi traduzida.",
        "link": "Ler em {language}"
    },
    "account": {
        "body": "Sua conta tem o mesmo endereço em todos os idiomas. Abra-a aqui no idioma selecionado.",
        "link": "Abrir sua conta"
    },
    "languages": {
        "en": "inglês",
        "vi": "vietnamita",
        "es": "espanhol",
        "de": "alemão",
        "fr": "francês",
        "ja": "japonês",
        "pt-BR": "português brasileiro",
        "zh-Hans": "chinês simplificado",
        "ko": "coreano",
        "zh-Hant": "chinês tradicional",
        "it": "italiano",
        "id": "indonésio"
    },
    "linksLabel": "Páginas para começar",
    "links": {
        "home": "Início",
        "features": "Recursos",
        "databases": "Bancos de dados",
        "download": "Baixar",
        "blog": "Blog"
    }
} satisfies Messages['errors'];
