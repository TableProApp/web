import { wrapProseTables } from '@/components/ui/prose-html';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

interface ProseArticleProps {
    /** Server-rendered HTML from the shared markdown renderer (blog posts, legal pages). */
    html: string;
    /** The article's language when it differs from the page's: `en` for an English post on a Vietnamese page. */
    lang?: string;
    className?: string;
}

/**
 * Long-form prose (design-system §5.3.19): blog posts and legal pages.
 *
 * The typography lives in app.css under `.blog-article`, because the markup
 * comes from the markdown renderer and carries no classes of its own: body in
 * the text colour at 16/1.6, headings in the `h2` and `h3` roles with the
 * per-language line heights, underlined links, code on `--raised` with the
 * Phiki colours, and heading permalinks kept out of the heading's accessible
 * name. The reading column is the `text` container's 704px.
 *
 * Nothing in the prose can widen the page at 375px: each table scrolls inside
 * its own focusable region (`wrapProseTables`), and long inline code and URLs
 * break where they must (app.css).
 *
 * Only ever given HTML the server rendered from repository markdown, never
 * anything a visitor typed.
 */
export default function ProseArticle({ html, lang, className }: ProseArticleProps) {
    const { m } = useI18n();

    return (
        <div
            lang={lang}
            className={cn('blog-article max-w-[44rem]', className)}
            dangerouslySetInnerHTML={{ __html: wrapProseTables(html, m.a11y.scrollTable) }}
        />
    );
}
