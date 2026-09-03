import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    ATTRIBUTION_TTL_DAYS,
    parseStored,
    readVisit,
    resolveAttribution,
    type Attribution,
    type Visit,
} from '../../resources/js/lib/attribution.ts';

/*
 * Behaviour tests for the acquisition source that rides along with
 * `POST /checkout`. Run with `npm run test:js`; the CI `frontend` job runs the
 * same command.
 *
 * These execute the module rather than reading it, because everything that can
 * go wrong here is a branch: which touch wins, when a record lapses, what
 * counts as attributable at all. A source-level assertion would confirm the
 * code exists and nothing about whether it credits the right thing.
 *
 * `node --test` with type stripping, so this file costs no dependency. Its
 * imports are `node:` built-ins that the app bundle never sees, which is also
 * why it sits here rather than under `resources/js` — tsconfig covers that
 * directory, and typechecking these would mean pulling in @types/node.
 */

const NOW = new Date('2026-09-03T12:00:00.000Z');

function visit(url: string, referrer = '', now: Date = NOW): Visit {
    return { url, referrer, now };
}

function daysBefore(date: Date, days: number): string {
    return new Date(date.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

test('maps every utm tag off the landing URL', () => {
    const found = readVisit(
        visit('https://tablepro.app/compare/tableplus?utm_source=hn&utm_medium=social&utm_campaign=launch&utm_term=sql+client&utm_content=comment'),
    );

    assert.deepEqual(found, {
        source: 'hn',
        medium: 'social',
        campaign: 'launch',
        term: 'sql client',
        content: 'comment',
        landing_page: '/compare/tableplus',
        first_seen_at: NOW.toISOString(),
    });
});

test('keeps the landing path without its query string', () => {
    const found = readVisit(visit('https://tablepro.app/mysql-client?utm_source=hn&discount=SUMMER'));

    assert.equal(found?.landing_page, '/mysql-client');
});

test('falls back to a bare ref, and lets utm_source outrank it', () => {
    assert.equal(readVisit(visit('https://tablepro.app/?ref=getapps.cafe'))?.source, 'getapps.cafe');
    assert.equal(readVisit(visit('https://tablepro.app/?ref=getapps.cafe&utm_source=newsletter'))?.source, 'newsletter');
});

test('ignores an empty tag rather than storing a blank source', () => {
    assert.equal(readVisit(visit('https://tablepro.app/?utm_source=')), null);
    assert.equal(readVisit(visit('https://tablepro.app/?utm_source=%20%20')), null);
});

/*
 * The case the whole first-touch design exists for. Recording a direct visit
 * would occupy the slot, and the campaign click that arrives tomorrow would
 * then be credited to nobody.
 */
test('treats a visit with no tag and no off-site referrer as unattributable', () => {
    assert.equal(readVisit(visit('https://tablepro.app/')), null);
    assert.equal(readVisit(visit('https://tablepro.app/blog/tablepro-0-69')), null);
});

test('does not count our own pages as a referrer', () => {
    assert.equal(readVisit(visit('https://tablepro.app/', 'https://tablepro.app/blog')), null);
});

test('records an off-site referrer on its own, with the query string dropped', () => {
    const found = readVisit(visit('https://tablepro.app/', 'https://www.google.com/search?q=mysql+client+mac'));

    assert.equal(found?.referrer, 'https://www.google.com/search');
    assert.equal(found?.source, undefined);
});

test('keeps the path of a referring page, but not a bare slash', () => {
    assert.equal(readVisit(visit('https://tablepro.app/', 'https://news.ycombinator.com/'))?.referrer, 'https://news.ycombinator.com');
    assert.equal(readVisit(visit('https://tablepro.app/', 'https://news.ycombinator.com/item?id=1'))?.referrer, 'https://news.ycombinator.com/item');
});

test('survives a malformed URL or referrer instead of throwing', () => {
    assert.equal(readVisit(visit('not-a-url')), null);
    assert.equal(readVisit(visit('https://tablepro.app/?utm_source=hn', 'not-a-url'))?.referrer, undefined);
});

test('clamps a tag to 128 characters and a URL to 256', () => {
    const found = readVisit(
        visit(`https://tablepro.app/${'p'.repeat(400)}?utm_campaign=${'c'.repeat(400)}`, `https://example.com/${'r'.repeat(400)}`),
    );

    assert.equal(found?.campaign?.length, 128);
    assert.equal(found?.landing_page.length, 256);
    assert.equal(found?.referrer?.length, 256);
});

test('keeps the first touch when a later visit arrives tagged', () => {
    const first: Attribution = {
        source: 'hn',
        landing_page: '/blog/tablepro-0-69',
        first_seen_at: daysBefore(NOW, 14),
    };

    const resolved = resolveAttribution(first, visit('https://tablepro.app/?utm_source=twitter'));

    assert.equal(resolved, first, 'a stored first touch is returned by reference, so the caller can skip the write');
});

test('keeps the first touch when the reader returns direct', () => {
    const first: Attribution = { source: 'hn', landing_page: '/', first_seen_at: daysBefore(NOW, 1) };

    assert.equal(resolveAttribution(first, visit('https://tablepro.app/')), first);
});

test('lets a lapsed first touch give way to the current visit', () => {
    const stale: Attribution = { source: 'hn', landing_page: '/', first_seen_at: daysBefore(NOW, ATTRIBUTION_TTL_DAYS + 1) };

    assert.equal(resolveAttribution(stale, visit('https://tablepro.app/?utm_source=twitter'))?.source, 'twitter');
});

test('holds a first touch right up to the edge of the window', () => {
    const edge: Attribution = { source: 'hn', landing_page: '/', first_seen_at: daysBefore(NOW, ATTRIBUTION_TTL_DAYS) };

    assert.equal(resolveAttribution(edge, visit('https://tablepro.app/?utm_source=twitter')), edge);
});

/* Null is the signal to clear storage, not to leave the stale record in place. */
test('reports nothing when a lapsed touch meets an unattributable visit', () => {
    const stale: Attribution = { source: 'hn', landing_page: '/', first_seen_at: daysBefore(NOW, 400) };

    assert.equal(resolveAttribution(stale, visit('https://tablepro.app/')), null);
});

test('discards a stored record with an unreadable timestamp', () => {
    const broken: Attribution = { source: 'hn', landing_page: '/', first_seen_at: 'yesterday' };

    assert.equal(resolveAttribution(broken, visit('https://tablepro.app/')), null);
});

test('rejects stored JSON that is not a usable record', () => {
    assert.equal(parseStored(null), null);
    assert.equal(parseStored('not json'), null);
    assert.equal(parseStored('"a string"'), null);
    assert.equal(parseStored('null'), null);
    assert.equal(parseStored('{"source":"hn"}'), null, 'landing_page and first_seen_at are required');
});

/*
 * localStorage belongs to the reader, and this record ends up in a request body
 * the backend forwards to a payment provider. Anything the reader adds to it
 * has to stop here.
 */
test('rebuilds only the known keys, at the known lengths', () => {
    const parsed = parseStored(
        JSON.stringify({
            source: 'hn',
            campaign: 'x'.repeat(400),
            landing_page: '/',
            first_seen_at: NOW.toISOString(),
            seats: '9999',
            discount_code: 'FREE',
            __proto__: { polluted: true },
        }),
    );

    assert.deepEqual(Object.keys(parsed ?? {}).sort(), ['campaign', 'first_seen_at', 'landing_page', 'source']);
    assert.equal(parsed?.campaign?.length, 128);
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test('round-trips a stored record unchanged', () => {
    const original = readVisit(visit('https://tablepro.app/faq?utm_source=hn&utm_medium=social', 'https://news.ycombinator.com/item'));

    assert.deepEqual(parseStored(JSON.stringify(original)), original);
});
