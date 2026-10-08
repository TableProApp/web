import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Nenhum artigo ainda."
    },
    "latest": "Algumas versões também ganham um artigo no blog. O mais recente é <post>{title}</post>.",
    "post": {
        "archive": "Publicado em {date}, este artigo descreve {release} como era na época. Para saber o que TablePro faz hoje, veja os <features>recursos</features> e o <changelog>histórico de alterações</changelog>.",
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
