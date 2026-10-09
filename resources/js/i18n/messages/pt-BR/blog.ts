import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Nenhum artigo ainda.",
        "guides": "Guias",
        "releases": "Notas de versão"
    },
    "latest": "Último post de lançamento: <post>{title}</post>.",
    "post": {
        "archive": "Publicado em {date}. Este post descreve {release} no lançamento. Veja os <features>recursos atuais</features> e o <changelog>changelog</changelog> (inglês).",
        "correction": "Correção, {date}",
        "toc": "Nesta página",
        "pages": "Páginas relacionadas",
        "notes": {
            "title": "Notas de versão completas",
            "changelog": "{release} no histórico de alterações",
            "github": "{release} no GitHub"
        },
        "related": "Artigos relacionados"
    }
} satisfies Messages['blog'];
