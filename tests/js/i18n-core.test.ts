import { test } from 'node:test';
import assert from 'node:assert/strict';

import { interpolate, placeholders, plural, splitTags } from '../../resources/js/i18n/core.ts';
import { formatNumber, formatUsd, joinList } from '../../resources/js/i18n/format.ts';

/*
 * The string machinery behind useI18n(). Run with `npm run test:js`.
 *
 * Everything here renders on the server and again in the browser, so it has to
 * be deterministic: the same input must give the same bytes in both, or React
 * reports a hydration mismatch on every Vietnamese price.
 */

test('interpolate fills named slots and leaves unknown ones visible', () => {
    assert.equal(interpolate('Requires {system} {version} or later', { system: 'macOS', version: 13 }), 'Requires macOS 13 or later');
    assert.equal(interpolate('{a}{a}', { a: 'x' }), 'xx');
    assert.equal(interpolate('Hello {name}', {}), 'Hello {name}');
    assert.equal(interpolate('Dotted {mac.requirement}', { 'mac.requirement': 'macOS 13' }), 'Dotted macOS 13');
    assert.equal(interpolate('Braces { spaced } stay', { spaced: 'x' }), 'Braces { spaced } stay');
    assert.equal(interpolate('Zero {n}', { n: 0 }), 'Zero 0');
});

test('interpolate does not read inherited properties', () => {
    assert.equal(interpolate('{toString}', {}), '{toString}');
    assert.equal(interpolate('{constructor}', {}), '{constructor}');
});

test('placeholders lists each slot once, sorted', () => {
    assert.deepEqual(placeholders('{b} and {a} and {b}'), ['a', 'b']);
    assert.deepEqual(placeholders('no slots'), []);
});

test('plural follows each language: English has one and other, Vietnamese only other', () => {
    const en = { one: '{count} seat', other: '{count} seats' };

    assert.equal(plural(en, 1, 'en-US'), '1 seat');
    assert.equal(plural(en, 0, 'en-US'), '0 seats');
    assert.equal(plural(en, 5, 'en-US'), '5 seats');

    const vi = { other: '{count} seat' };

    assert.equal(plural(vi, 1, 'vi-VN'), '1 seat');
    assert.equal(plural(vi, 5, 'vi-VN'), '5 seat');
});

test('plural falls back to other and accepts extra values', () => {
    assert.equal(plural({ other: '{count} of {total}' }, 1, 'en-US', { total: 200 }), '1 of 200');
    assert.equal(plural({ one: 'one', other: '{count}' }, 1, 'en-US', { count: '1,000' }), 'one');
    assert.equal(plural({ other: '{count} rows' }, 1000, 'en-US', { count: '1,000' }), '1,000 rows');
});

test('splitTags keeps a translated sentence whole around its markup', () => {
    assert.deepEqual(splitTags('Read the <link>refund policy</link> first.'), [
        { type: 'text', text: 'Read the ' },
        { type: 'tag', name: 'link', text: 'refund policy' },
        { type: 'text', text: ' first.' },
    ]);

    assert.deepEqual(splitTags('<b>Đọc</b> <link>chính sách hoàn tiền</link>'), [
        { type: 'tag', name: 'b', text: 'Đọc' },
        { type: 'text', text: ' ' },
        { type: 'tag', name: 'link', text: 'chính sách hoàn tiền' },
    ]);
});

test('splitTags leaves unmatched or foreign markup as text', () => {
    assert.deepEqual(splitTags('No tags here'), [{ type: 'text', text: 'No tags here' }]);
    assert.deepEqual(splitTags('A <link>broken tag'), [{ type: 'text', text: 'A <link>broken tag' }]);
    assert.deepEqual(splitTags('x < y and y > z'), [{ type: 'text', text: 'x < y and y > z' }]);
    assert.deepEqual(splitTags('<a>one</b>'), [{ type: 'text', text: '<a>one</b>' }]);
});

const en = { pattern: '${amount}', decimal: '.', group: ',' };
const vi = { pattern: '{amount} US$', decimal: ',', group: '.' };

test('formatUsd writes the published prices without Intl', () => {
    assert.equal(formatUsd(2.99, en), '$2.99');
    assert.equal(formatUsd(24, en), '$24');
    assert.equal(formatUsd(1.25, en), '$1.25');
    assert.equal(formatUsd(1499, en), '$1,499');
    assert.equal(formatUsd(2.99, vi), '2,99 US$');
    assert.equal(formatUsd(59, vi), '59 US$');
    assert.equal(formatUsd(1999.5, vi), '1.999,50 US$');
});

test('formatNumber groups thousands and keeps the requested decimals', () => {
    assert.equal(formatNumber(10000, en), '10,000');
    assert.equal(formatNumber(500000, vi), '500.000');
    assert.equal(formatNumber(0.5, en, 2), '0.50');
    assert.equal(formatNumber(-1234, en), '−1,234');
});

test('joinList joins names with the language joiners and no serial comma', () => {
    const enList = { separator: ', ', last: ' and ' };
    const viList = { separator: ', ', last: ' và ' };

    assert.equal(joinList(['Mac', 'iPhone', 'iPad'], enList), 'Mac, iPhone and iPad');
    assert.equal(joinList(['Mac', 'iPhone', 'iPad'], viList), 'Mac, iPhone và iPad');
    assert.equal(joinList(['iPhone', 'iPad'], viList), 'iPhone và iPad');
    assert.equal(joinList(['Mac'], enList), 'Mac');
    assert.equal(joinList([], enList), '');
});
