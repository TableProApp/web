import { test } from 'node:test';
import assert from 'node:assert/strict';

import { discountedAmount, discountedCents, parseRegional, parseSeatMaximums, type ListCents } from '../../resources/js/lib/regional-pricing.ts';

// The list prices the cards strike through, in cents.
const list: ListCents = {
    starter: { monthly: 499, yearly: 3900, lifetime: 7900 },
    team: { monthly: 1200, yearly: 12000 },
};

type TeamMax = Record<'monthly' | 'yearly', number | null>;

// Polar sets a maximum only for a cycle whose seat tiers end; one cycle with a maximum covers the per-cycle read.
const YEARLY_TEAM_MAX: TeamMax = { monthly: null, yearly: 1000 };
const NO_TEAM_MAX: TeamMax = { monthly: null, yearly: null };

// GET /v2/pricing as tablepro-cloud answers it for these list prices: Pro in every cycle, Team from 2 seats.
// `max_seats` is 1 unless per_seat, and for a per-seat plan the top of Polar's seat tiers, or null without one.
function answer(percent: number, country = 'VN', teamMax: TeamMax = YEARLY_TEAM_MAX) {
    const plan = (name: 'starter' | 'team', cycle: 'monthly' | 'yearly' | 'lifetime', amount: number) => ({
        plan: name,
        cycle,
        currency: 'USD',
        amount,
        per_seat: name === 'team',
        min_seats: name === 'team' ? 2 : 1,
        max_seats: name === 'team' && cycle !== 'lifetime' ? teamMax[cycle] : 1,
        features: [],
        discount_percent: percent,
        discounted_amount: discountedCents(amount, percent),
        discounted_total: discountedCents(amount * (name === 'team' ? 2 : 1), percent),
    });

    return {
        country,
        plans: [
            plan('starter', 'monthly', list.starter.monthly),
            plan('starter', 'yearly', list.starter.yearly),
            plan('starter', 'lifetime', list.starter.lifetime),
            plan('team', 'monthly', list.team.monthly),
            plan('team', 'yearly', list.team.yearly),
        ],
    };
}

test('the Team seat maximum is read per cycle from the answer, and only a whole number from the minimum up counts', () => {
    assert.deepEqual(parseSeatMaximums(answer(0), 'team', 2), { yearly: 1000 });
    assert.deepEqual(parseSeatMaximums(answer(30, 'VN', NO_TEAM_MAX), 'team', 2), {});

    const body = answer(0);
    body.plans[3].max_seats = 50;
    body.plans[4].max_seats = 1;
    assert.deepEqual(parseSeatMaximums(body, 'team', 2), { monthly: 50 });
    (body.plans[4] as Record<string, unknown>).max_seats = 12.5;
    assert.deepEqual(parseSeatMaximums(body, 'team', 2), { monthly: 50 });

    // Pro's max_seats of 1 is not a seat field's limit.
    assert.deepEqual(parseSeatMaximums(answer(0), 'starter', 1), {});

    assert.deepEqual(parseSeatMaximums(null, 'team', 2), {});
    assert.deepEqual(parseSeatMaximums({ country: 'US' }, 'team', 2), {});
});

test('the answer is read strictly, so the cards never show a price checkout would not charge', () => {
    assert.deepEqual(parseRegional(answer(30), list), { country: 'VN', percent: 30 });
    assert.deepEqual(parseRegional(answer(50, 'IN'), list), { country: 'IN', percent: 50 });
    assert.deepEqual(parseRegional(answer(30, 'VN', NO_TEAM_MAX), list), { country: 'VN', percent: 30 });

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

    // A price Polar charges that the list does not state: the page cannot strike the right list price.
    assert.equal(changed((plans) => (plans[0].amount = 549)), null);
    // A plan not for sale, a second percentage, or a discounted price the cards would compute otherwise.
    assert.equal(changed((plans) => plans.splice(4, 1)), null);
    assert.equal(changed((plans) => (plans[3].discount_percent = 20)), null);
    assert.equal(changed((plans) => (plans[3].discounted_amount = 841)), null);
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
        [499, 30, 349],
        [499, 50, 249],
        [3900, 30, 2730],
        [7900, 30, 5530],
        [1200, 30, 840],
        [12000, 30, 8400],
    ];

    for (const [list, percent, charged] of cases) {
        assert.equal(discountedCents(list, percent), charged, `${list}¢ at ${percent}%`);
    }
});

test('a USD amount goes through cents, so floating point never shows', () => {
    assert.equal(discountedAmount(59, 50), 29.5);
    assert.equal(discountedAmount(4.99, 50), 2.49);
    assert.equal(discountedAmount(2.99, 50), 1.49);
    assert.equal(discountedAmount(1.25 * 7, 50), 4.37);
});
