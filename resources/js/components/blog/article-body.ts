/**
 * Work on a post's server-rendered HTML before it is shown (architecture §1.9,
 * design-system §5.3.19).
 *
 * `BlogService::html()` renders the markdown through the shared
 * `MarkdownRenderer`, which leaves two things for the page:
 *
 * - `<asset-slot id="…"></asset-slot>` blocks where a figure goes. The page
 *   splits the HTML on them and renders `<AssetSlot>` between the chunks, so
 *   the placeholder and the supplied picture have one implementation.
 * - A `#` permalink after each h2 and h3, with an empty `aria-label`. The page
 *   fills it from the `a11y.permalink` catalog entry, so the words live in the
 *   catalogs like every other string.
 *
 * Pure string work with relative imports only, so `node --test` loads it
 * directly (tests/js/blog-article.test.ts), and the server and the browser
 * produce the same bytes.
 */

export type ArticlePart = { kind: 'html'; html: string } | { kind: 'asset'; id: string };

export interface ArticleHeading {
    id: string;
    text: string;
}

const ASSET_SLOT = /<asset-slot id="([a-z0-9][a-z0-9-]*)"><\/asset-slot>/g;

const PERMALINK = /(<a class="heading-permalink" href="#[^"]*" aria-label=")[^"]*(")/g;

const H2 = /<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;

const ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#039;': "'",
};

function escapeAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The HTML between the slots and the slots themselves, in document order.
 * Whitespace-only chunks are dropped, so two adjacent figures render as two
 * slots with nothing between them.
 */
export function splitArticle(html: string): ArticlePart[] {
    const parts: ArticlePart[] = [];
    let cursor = 0;

    for (const match of html.matchAll(ASSET_SLOT)) {
        const before = html.slice(cursor, match.index);

        if (before.trim() !== '') {
            parts.push({ kind: 'html', html: before });
        }

        parts.push({ kind: 'asset', id: match[1] });
        cursor = (match.index ?? 0) + match[0].length;
    }

    const rest = html.slice(cursor);

    if (rest.trim() !== '') {
        parts.push({ kind: 'html', html: rest });
    }

    return parts;
}

/** Gives every heading permalink its accessible name, "Link to this section". */
export function labelPermalinks(html: string, label: string): string {
    const escaped = escapeAttribute(label);

    return html.replace(PERMALINK, (_match, open: string, close: string) => `${open}${escaped}${close}`);
}

/**
 * The article's h2 sections, for its table of contents: each heading's id and
 * its text without markup.
 */
export function articleHeadings(html: string): ArticleHeading[] {
    return [...html.matchAll(H2)].map((match) => ({
        id: match[1],
        text: match[2]
            .replace(/<[^>]*>/g, '')
            .replace(/&(?:amp|lt|gt|quot|#0?39);/g, (entity) => ENTITIES[entity] ?? entity)
            .replace(/\s+/g, ' ')
            .trim(),
    }));
}
