import { test } from 'node:test';
import assert from 'node:assert/strict';

import { keepTogether } from '../../resources/js/i18n/format.ts';

/*
 * Short fixed phrases wrap as one unit (design-system §3.3): a date left "2026"
 * alone on the next line at 375px, and a requirement split "Apple silicon or /
 * Intel".
 */
test('keepTogether joins every word of a short phrase with no-break spaces', () => {
    assert.equal(keepTogether('2 tháng 10 năm 2026'), '2 tháng 10 năm 2026');
    assert.equal(keepTogether('Apple silicon or Intel'), 'Apple silicon or Intel');
    assert.equal(keepTogether('October 2, 2026').includes(' '), false);
    assert.equal(keepTogether(''), '');
});
