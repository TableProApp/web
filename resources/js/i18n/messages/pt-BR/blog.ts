import type { Messages } from '../../types.ts';

export default {
    "index": {
        "empty": "Nenhum artigo ainda."
    },
    "post": {
        "archive": {
            "named": "Publicado em {date}, este artigo descreve {release} como era na época. Para saber o que TablePro faz hoje, veja os <features>recursos</features> e o <changelog>histórico de alterações</changelog> (inglês).",
            "unnamed": "Publicado em {date}, este artigo descreve TablePro como era na época. Para saber o que TablePro faz hoje, veja os <features>recursos</features> e o <changelog>histórico de alterações</changelog> (inglês)."
        },
        "brandedTitle": "{title} – Blog do TablePro",
        "correction": "Correção, {date}",
        "toc": "Nesta página",
        "related": "Artigos relacionados"
    }
} satisfies Messages['blog'];
