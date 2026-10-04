import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

import { articleHeadings, labelPermalinks, splitArticle } from '../../resources/js/components/blog/article-body.ts';

/*
 * A post's server-rendered HTML, as the post page prepares it. Run with
 * `npm run test:js`.
 *
 * `BlogService::html()` leaves `<asset-slot>` blocks where figures go and a
 * `#` permalink with an empty `aria-label` after each h2 and h3. The page
 * splits on the slots and names the permalinks from the catalog, so these
 * have to hold for every post as written.
 */

const permalink = (id: string): string => `<a class="heading-permalink" href="#${id}" aria-label="">#</a>`;

test('splits prose and slots in document order, dropping empty chunks', () => {
    const html = [
        '<p>Intro.</p>',
        '<asset-slot id="blog-tablepro-0-77-1"></asset-slot>',
        '<h2 id="content-a">A</h2>',
        '<asset-slot id="blog-tablepro-0-77-2"></asset-slot>',
        '<asset-slot id="blog-tablepro-0-77-3"></asset-slot>',
        '',
    ].join('\n');

    assert.deepEqual(splitArticle(html), [
        { kind: 'html', html: '<p>Intro.</p>\n' },
        { kind: 'asset', id: 'blog-tablepro-0-77-1' },
        { kind: 'html', html: '\n<h2 id="content-a">A</h2>\n' },
        { kind: 'asset', id: 'blog-tablepro-0-77-2' },
        { kind: 'asset', id: 'blog-tablepro-0-77-3' },
    ]);
    assert.deepEqual(splitArticle('<p>No figures.</p>'), [{ kind: 'html', html: '<p>No figures.</p>' }]);
    assert.deepEqual(splitArticle(''), []);
});

test('leaves an escaped slot inside code alone', () => {
    const html = '<pre><code>&lt;asset-slot id="x"&gt;&lt;/asset-slot&gt;</code></pre>';

    assert.deepEqual(splitArticle(html), [{ kind: 'html', html }]);
});

test('names every heading permalink, escaping the label', () => {
    const html = `<h2 id="content-a">A</h2>\n${permalink('content-a')}\n<h3 id="content-b">B</h3>\n${permalink('content-b')}`;
    const labelled = labelPermalinks(html, 'Link to this section');

    assert.equal((labelled.match(/aria-label="Link to this section">#<\/a>/g) ?? []).length, 2);
    assert.match(labelPermalinks(html, 'Liên kết "tới" <mục>'), /aria-label="Liên kết &quot;tới&quot; &lt;mục&gt;"/);
    assert.equal(labelPermalinks(labelled, 'Link to this section'), labelled);
});

test('lists the h2 sections with their text, without markup or entities', () => {
    const html = [
        '<h2 id="content-sap-hana">SAP HANA</h2>',
        permalink('content-sap-hana'),
        '<h3 id="content-detail">Detail</h3>',
        '<h2 id="content-select--join">Run <code>SELECT</code> &amp; <code>JOIN</code></h2>',
    ].join('\n');

    assert.deepEqual(articleHeadings(html), [
        { id: 'content-sap-hana', text: 'SAP HANA' },
        { id: 'content-select--join', text: 'Run SELECT & JOIN' },
    ]);
});

test('every release post names only blog slots, numbered in figure order', () => {
    const directory = new URL('../../resources/blog/', import.meta.url);
    const posts = readdirSync(directory).filter((file) => file.endsWith('.md'));

    assert.ok(posts.length > 0);

    for (const file of posts) {
        const slug = file.replace(/\.md$/, '');
        const ids = [...readFileSync(new URL(file, directory), 'utf8').matchAll(/<asset-slot id="([^"]+)"><\/asset-slot>/g)].map((match) => match[1]);

        assert.deepEqual(
            ids,
            ids.map((_id, index) => `blog-${slug}-${index + 1}`),
            `${file} places its figures out of order or under another post's ids`,
        );
    }
});
