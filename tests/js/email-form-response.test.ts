import { test } from 'node:test';
import assert from 'node:assert/strict';

import { emailFormOutcome, subscriberCount } from '../../resources/js/hooks/email-form-response.ts';
import vi from '../../resources/js/i18n/messages/vi/forms.ts';

// Which message the newsletter form shows for each answer of POST /v2/newsletter/subscriptions. The page is
// Vietnamese on purpose: tablepro-cloud's problems are English and must never reach a Vietnamese reader.

const problem = (status: number, code: string, extra: Record<string, unknown> = {}) => ({
    type: `https://api.tablepro.app/problems/${code}`,
    title: 'Problem',
    status,
    code,
    detail: 'English text the reader never sees.',
    ...extra,
});

test('202 says to check the inbox and clears the field, whether or not the address was new', () => {
    assert.deepEqual(emailFormOutcome(202, {}, vi), { kind: 'flash', flash: { type: 'success', message: vi.subscribed }, reset: true });
    assert.deepEqual(emailFormOutcome(202, null, vi), { kind: 'flash', flash: { type: 'success', message: vi.subscribed }, reset: true });
});

test('validation_failed on the address is a message under the field', () => {
    const answer = problem(422, 'validation_failed', { errors: [{ location: 'body.email', message: 'expected string to be RFC 5322 email', value: 'x' }] });

    assert.deepEqual(emailFormOutcome(422, answer, vi), { kind: 'field', error: vi.invalidEmail });
});

test('a missing Turnstile token asks for a reload, any other 422 is a plain failure', () => {
    assert.deepEqual(emailFormOutcome(422, problem(422, 'validation_failed', { errors: [{ location: 'body.turnstile_token' }] }), vi), {
        kind: 'flash',
        flash: { type: 'error', message: vi.verification },
        reset: false,
    });
    assert.deepEqual(emailFormOutcome(422, problem(422, 'validation_failed', { errors: [{ location: 'body.locale' }] }), vi), {
        kind: 'flash',
        flash: { type: 'error', message: vi.failed },
        reset: false,
    });
});

test('rate_limited and every server failure show the catalog', () => {
    assert.deepEqual(emailFormOutcome(429, problem(429, 'rate_limited'), vi), { kind: 'flash', flash: { type: 'error', message: vi.tooMany }, reset: false });

    for (const [status, body] of [
        [500, problem(500, 'internal_error')],
        [502, {}],
        [503, { message: 'Service Unavailable' }],
        [404, problem(404, 'not_found')],
    ] as [number, unknown][]) {
        assert.deepEqual(emailFormOutcome(status, body, vi), { kind: 'flash', flash: { type: 'error', message: vi.failed }, reset: false }, String(status));
    }
});

test('the subscriber count is a positive whole number, or nothing', () => {
    assert.equal(subscriberCount({ subscribers: 743 }), 743);
    assert.equal(subscriberCount({ subscribers: 0 }), null);
    assert.equal(subscriberCount({ subscribers: '743' }), null);
    assert.equal(subscriberCount({ subscribers: 7.5 }), null);
    assert.equal(subscriberCount(problem(503, 'unavailable')), null);
    assert.equal(subscriberCount(null), null);
});
