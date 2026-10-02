/**
 * Post-processing for the server-rendered prose `<ProseArticle>` shows.
 *
 * The markdown renderer emits a bare `<table>`, and the layout deliberately
 * clips nothing (no `overflow-x: hidden` on the page), so a table wider than
 * a phone widened the whole page. Each table gets the same treatment as
 * `<DataTable>`: its own focusable scroll region, named so a screen reader
 * user knows what the stop is and a keyboard user can scroll it. The table
 * keeps its table display, because `display: block` strips its roles in
 * Safari.
 *
 * Pure string work with no imports, so `node --test` loads it directly
 * (tests/js/prose-html.test.ts) and server and browser render the same bytes.
 */

/** The wrapper's class; `.blog-article .prose-table` in app.css styles it. */
export const PROSE_TABLE_CLASS = 'prose-table';

const OPEN_TABLE = /<table(?:\s[^>]*)?>/gi;
const CLOSE_TABLE = /<\/table>/gi;

function escapeAttribute(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Wraps every `<table>…</table>` in `<div class="prose-table" role="region" tabindex="0" aria-label>`.
 *
 * Literal `<table>` text inside code is already escaped by the renderer
 * (`&lt;table&gt;`), so only real tables match. HTML that has already been
 * wrapped is returned unchanged.
 */
export function wrapProseTables(html: string, label: string): string {
    if (html.includes(`class="${PROSE_TABLE_CLASS}"`)) {
        return html;
    }

    const open = `<div class="${PROSE_TABLE_CLASS}" role="region" tabindex="0" aria-label="${escapeAttribute(label)}">`;

    return html.replace(OPEN_TABLE, (tag) => open + tag).replace(CLOSE_TABLE, '</table></div>');
}
