import { test } from 'node:test';
import assert from 'node:assert/strict';

import { articleHeadings, labelPermalinks, splitArticle } from '../../resources/js/components/blog/article-body.ts';

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
