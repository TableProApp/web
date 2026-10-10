import { test } from 'node:test';
import assert from 'node:assert/strict';

import { discountedAmount, discountedCents, parseRegional } from '../../resources/js/lib/regional-pricing.ts';

/*
 * What the pricing cards show under the platform's regional discount. Run
 * with `npm run test:js`.
 *
 * The cases with a half-cent discount are the ones a rounding rule decides,
 * rounded half up. At the 30% the platform applies today they are Team
 * monthly, by the seat ($1.25 → $0.87) and for five seats ($6.25 → $4.37);
 * at 50%, Starter monthly ($2.99 → $1.49) too. When a checkout observed at
 * the provider disagrees, change `discountedCents` and these together.
 */

test('the platform\'s answer is read strictly', () => {
    assert.deepEqual(parseRegional({ country: 'VN', percent: 50 }), { country: 'VN', percent: 50 });
    assert.equal(parseRegional({}), null);
    assert.equal(parseRegional(null), null);
    assert.equal(parseRegional('{"country":"VN","percent":50}'), null);
    assert.equal(parseRegional({ country: 'vn', percent: 50 }), null);
    assert.equal(parseRegional({ country: 'VN', percent: '50' }), null);
    assert.equal(parseRegional({ country: 'VN', percent: 0 }), null);
    assert.equal(parseRegional({ country: 'VN', percent: 100 }), null);
    assert.equal(parseRegional({ country: 'VN', percent: 12.5 }), null);
});

test('the discount is rounded to the cent, a half cent up, then taken off', () => {
    const cases: [number, number, number][] = [
        [5900, 50, 2950],
        [2400, 50, 1200],
        [1000, 50, 500],
        [2500, 50, 1250],
        [1000, 30, 700],
        [299, 30, 209],
        [125, 30, 87],
        [625, 30, 437],
        [2400, 30, 1680],
        [5900, 30, 4130],
        [299, 50, 149],
        [125, 50, 62],
        [625, 50, 312],
        [875, 50, 437],
        [299, 15, 254],
    ];

    for (const [list, percent, charged] of cases) {
        assert.equal(discountedCents(list, percent), charged, `${list}¢ at ${percent}%`);
    }
});

test('a USD amount goes through cents, so floating point never shows', () => {
    assert.equal(discountedAmount(59, 50), 29.5);
    assert.equal(discountedAmount(2.99, 50), 1.49);
    assert.equal(discountedAmount(1.25 * 7, 50), 4.37);
});
