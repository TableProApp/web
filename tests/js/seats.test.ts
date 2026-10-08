import { test } from 'node:test';
import assert from 'node:assert/strict';

import { typedSeats } from '../../resources/js/components/pricing/seats.ts';

/*
 * The Team seat field on the plan cards. Run with `npm run test:js`.
 */

test('a typed count inside the bounds is the seat count, bounds included', () => {
    assert.deepEqual(typedSeats('50', 5, 200), { seats: 50, bound: null });
    assert.deepEqual(typedSeats('5', 5, 200), { seats: 5, bound: null });
    assert.deepEqual(typedSeats('200', 5, 200), { seats: 200, bound: null });
});

test('a count outside the bounds is no seat count, and names the bound it is changed to', () => {
    assert.deepEqual(typedSeats('3', 5, 200), { seats: null, bound: 'min' });
    assert.deepEqual(typedSeats('999', 5, 200), { seats: null, bound: 'max' });
});

test('an empty field is neither', () => {
    assert.deepEqual(typedSeats('', 5, 200), { seats: null, bound: null });
});
