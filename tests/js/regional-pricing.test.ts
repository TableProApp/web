import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';

import { discountedAmount, discountedCents, parseRegional, parseSeatMaximums, type ListCents } from '../../resources/js/lib/regional-pricing.ts';

// What the pricing cards show under a regional discount. The cases with a half-cent discount are the ones the
// rounding rule decides, rounded half up as Polar does: at 30% Team monthly by the seat ($1.25 → $0.87) and for five
// seats ($6.25 → $4.37), at 50% Starter monthly ($2.99 → $1.49) too. api.md gives the 30% case.

const pricing = JSON.parse(readFileSync(new URL('../../resources/data/pricing.json', import.meta.url), 'utf8')) as {
    tiers: Record<'starter' | 'team', { prices: Record<string, number>; seats?: Record<string, number> }>;
};

const list: ListCents = {
    starter: Object.fromEntries(Object.entries(pricing.tiers.starter.prices).map(([cycle, usd]) => [cycle, Math.round(usd * 100)])),
    team: Object.fromEntries(Object.entries(pricing.tiers.team.prices).map(([cycle, usd]) => [cycle, Math.round(usd * 100)])),
};

// GET /v2/pricing as tablepro-cloud answers it: its mock fixtures hold product.md's prices, the same as pricing.json.
// `max_seats` is 1 unless per_seat, and for a per-seat plan the top of Polar's seat tiers, or null without one.
function answer(percent: number, country = 'VN', teamMax: number | null = 200) {
    const plan = (name: 'starter' | 'team', cycle: string, amount: number) => ({
        plan: name,
        cycle,
        currency: 'USD',
        amount,
        per_seat: name === 'team',
        min_seats: name === 'team' ? 5 : 1,
        max_seats: name === 'team' ? teamMax : 1,
        features: [],
        discount_percent: percent,
        discounted_amount: discountedCents(amount, percent),
        discounted_total: discountedCents(amount * (name === 'team' ? 5 : 1), percent),
    });

    return {
        country,
        plans: [
            plan('starter', 'monthly', 299),
            plan('starter', 'yearly', 2400),
            plan('starter', 'lifetime', 5900),
            plan('team', 'monthly', 125),
            plan('team', 'yearly', 1000),
            plan('team', 'lifetime', 2500),
        ],
    };
}

test('pricing.json holds the prices and the seat minimum tablepro-cloud sells at, and no seat maximum', () => {
    assert.deepEqual(list, { starter: { monthly: 299, yearly: 2400, lifetime: 5900 }, team: { monthly: 125, yearly: 1000, lifetime: 2500 } });
    assert.deepEqual(pricing.tiers.team.seats, { min: answer(0).plans[3].min_seats });
});

test('the Team seat maximum is read per cycle from the answer, and only a whole number from the minimum up counts', () => {
    assert.deepEqual(parseSeatMaximums(answer(0), 'team', 5), { monthly: 200, yearly: 200, lifetime: 200 });
    assert.deepEqual(parseSeatMaximums(answer(30, 'VN', null), 'team', 5), {});

    const body = answer(0);
    body.plans[3].max_seats = 50;
    body.plans[4].max_seats = 4;
    (body.plans[5] as Record<string, unknown>).max_seats = 12.5;
    assert.deepEqual(parseSeatMaximums(body, 'team', 5), { monthly: 50 });

    // Starter's max_seats of 1 is not a seat field's limit.
    assert.deepEqual(parseSeatMaximums(answer(0), 'starter', 1), {});

    assert.deepEqual(parseSeatMaximums(null, 'team', 5), {});
    assert.deepEqual(parseSeatMaximums({ country: 'US' }, 'team', 5), {});
});

test('the answer is read strictly, so the cards never show a price checkout would not charge', () => {
    assert.deepEqual(parseRegional(answer(30), list), { country: 'VN', percent: 30 });
    assert.deepEqual(parseRegional(answer(50, 'IN'), list), { country: 'IN', percent: 50 });
    assert.deepEqual(parseRegional(answer(30, 'VN', null), list), { country: 'VN', percent: 30 });

    // No regional discount here: the list prices stand.
    assert.equal(parseRegional(answer(0), list), null);
    assert.equal(parseRegional(answer(0, 'XX'), list), null);
    assert.equal(parseRegional(answer(30, 'T1'), list), null);

    assert.equal(parseRegional({}, list), null);
    assert.equal(parseRegional(null, list), null);
    assert.equal(parseRegional(JSON.stringify(answer(30)), list), null);
    assert.equal(parseRegional({ ...answer(30), country: 'vn' }, list), null);

    const changed = (edit: (plans: ReturnType<typeof answer>['plans']) => void) => {
        const body = answer(30);

        edit(body.plans);

        return parseRegional(body, list);
    };

    // A price Polar charges that pricing.json does not state: the page cannot strike the right list price.
    assert.equal(changed((plans) => (plans[0].amount = 349)), null);
    // A plan not for sale, a second percentage, or a discounted price the cards would compute otherwise.
    assert.equal(changed((plans) => plans.splice(5, 1)), null);
    assert.equal(changed((plans) => (plans[3].discount_percent = 20)), null);
    assert.equal(changed((plans) => (plans[3].discounted_amount = 88)), null);
    assert.equal(changed((plans) => (plans[1].currency = 'EUR')), null);
    assert.equal(changed((plans) => (plans[2].discount_percent = 12.5)), null);
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
