import { test } from 'node:test';
import assert from 'node:assert/strict';

import { emailFormOutcome } from '../../resources/js/hooks/email-form-response.ts';
import vi from '../../resources/js/i18n/messages/vi/forms.ts';

/*
 * Which message the newsletter form shows for each answer. Run with
 * `npm run test:js`.
 *
 * The page is Vietnamese here on purpose: the bug this guards against put
 * Laravel's English "Server Error" in front of Vietnamese readers.
 */

test('a server or framework failure shows the catalog, never the framework text', () => {
    const answers: [number, unknown][] = [
        [500, { message: 'Server Error' }],
        [502, {}],
        [503, { message: 'Service Unavailable' }],
        [419, { message: 'CSRF token mismatch.' }],
        [404, { message: 'Not Found' }],
        [405, { message: 'The POST method is not supported for route newsletter/subscribe.' }],
        [500, { type: 'error', message: 'Server Error' }],
    ];

    for (const [status, body] of answers) {
        assert.deepEqual(emailFormOutcome(status, body, vi), { kind: 'flash', flash: { type: 'error', message: vi.failed }, reset: false }, String(status));
    }
});

test("a 4xx in the platform's own {type, message} shape keeps its localized message", () => {
    assert.deepEqual(emailFormOutcome(409, { type: 'error', message: 'Địa chỉ này đã đăng ký.' }, vi), {
        kind: 'flash',
        flash: { type: 'error', message: 'Địa chỉ này đã đăng ký.' },
        reset: false,
    });
});

test('a 422 shows the field message the platform localized, else the catalog', () => {
    assert.deepEqual(emailFormOutcome(422, { errors: { email: ['Email không hợp lệ.'] } }, vi), { kind: 'field', error: 'Email không hợp lệ.' });
    assert.deepEqual(emailFormOutcome(422, { message: 'The given data was invalid.' }, vi), { kind: 'field', error: vi.invalidEmail });
});

test('a 429 always shows the catalog, because the throttle text stays English', () => {
    assert.deepEqual(emailFormOutcome(429, { message: 'Too Many Attempts.' }, vi), { kind: 'flash', flash: { type: 'error', message: vi.tooMany }, reset: false });
});

test('a success keeps the server answer, or falls back to the catalog, and clears the field', () => {
    assert.deepEqual(emailFormOutcome(200, { type: 'warning', message: 'Bạn đã đăng ký từ trước.' }, vi), {
        kind: 'flash',
        flash: { type: 'warning', message: 'Bạn đã đăng ký từ trước.' },
        reset: true,
    });
    assert.deepEqual(emailFormOutcome(200, null, vi), { kind: 'flash', flash: { type: 'success', message: vi.subscribed }, reset: true });
    assert.deepEqual(emailFormOutcome(201, { type: 'nonsense', message: '' }, vi), { kind: 'flash', flash: { type: 'success', message: vi.subscribed }, reset: true });
});
