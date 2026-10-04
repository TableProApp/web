import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { PROSE_TABLE_CLASS, wrapProseTables } from '../../resources/js/components/ui/prose-html.ts';

/*
 * Article prose never widens the page at 375px. Run with `npm run test:js`.
 *
 * The markdown renderer emits bare tables, and the layout clips nothing, so a
 * table with a long cell (the privacy policy's cookie table names
 * `tablepro:analytics-consent`) used to scroll the whole document.
 */

const table = '<table>\n<thead>\n<tr>\n<th>Key</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><code>tablepro:analytics-consent</code></td>\n</tr>\n</tbody>\n</table>';

test('puts every table in its own named, focusable scroll region', () => {
    const html = wrapProseTables(`<p>Before</p>\n${table}\n<p>Between</p>\n<table class="x">\n<tr><td>1</td></tr>\n</table>`, 'Table, scrolls sideways');
    const regions = html.match(/<div class="prose-table" role="region" tabindex="0" aria-label="Table, scrolls sideways"><table/g) ?? [];

    assert.equal(regions.length, 2);
    assert.equal((html.match(/<\/table><\/div>/g) ?? []).length, 2);
    assert.match(html, /aria-label="Table, scrolls sideways"><table class="x">/);
    assert.ok(html.startsWith('<p>Before</p>'));
});

test('leaves prose without a table, and table text inside code, alone', () => {
    const prose = '<p>Use <code>&lt;table&gt;</code> for data, not <code>&lt;tables&gt;</code>.</p><pre><code>&lt;/table&gt;</code></pre>';

    assert.equal(wrapProseTables(prose, 'x'), prose);
    assert.equal(wrapProseTables('<p><tablet>no</tablet></p>', 'x'), '<p><tablet>no</tablet></p>');
});

test('escapes the label and never wraps twice', () => {
    const once = wrapProseTables(table, 'Bảng "A" & <B>');

    assert.match(once, /aria-label="Bảng &quot;A&quot; &amp; &lt;B&gt;"/);
    assert.equal(wrapProseTables(once, 'Bảng "A" & <B>'), once);
});

test('styles the region to scroll and lets long inline code and links break', () => {
    const css = readFileSync(new URL('../../resources/css/app.css', import.meta.url), 'utf8');

    assert.match(css, new RegExp(`\\.blog-article \\.${PROSE_TABLE_CLASS} \\{\\s*overflow-x: auto;`));
    assert.match(css, /\.blog-article :is\(code, a\) \{\s*overflow-wrap: anywhere;/);
    assert.doesNotMatch(css, /\.blog-article table \{[^}]*display:\s*block/);
});
