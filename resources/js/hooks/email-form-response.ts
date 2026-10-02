/**
 * What an anonymous email form shows for the platform's answer.
 *
 * Pure and free of React and path aliases, so `node --test` loads it directly
 * (tests/js/email-form-response.test.ts). `useEmailForm` does the fetch and
 * holds the result in state.
 *
 * The platform localizes only what its own form code writes: a 422's field
 * message (architecture §1.14) and the `{type, message}` body
 * `RespondsToPublicForm` returns. Everything else is framework text in
 * English: a 500 answers `{"message": "Server Error"}`, a 503 "Service
 * Unavailable", a 419 "CSRF token mismatch.", and the throttle's 429 is shared
 * with the license API. So:
 *
 * - 422: the server's field message, else the catalog's `invalidEmail`;
 * - 429: always the catalog's `tooMany`;
 * - any other failure: the server's message only when it is a 4xx other than
 *   419 that carries the platform's `{type, message}` shape, else the
 *   catalog's `failed`;
 * - success: the server's `{type, message}`, else the catalog's `subscribed`.
 */

export interface FlashMessage {
    type: 'success' | 'warning' | 'error';
    message: string;
}

/** The `forms` catalog keys this decision reads. */
export interface EmailFormStrings {
    invalidEmail: string;
    tooMany: string;
    failed: string;
    subscribed: string;
}

export type EmailFormOutcome =
    /** A message about the field itself, shown under it. */
    | { kind: 'field'; error: string }
    /** A message about the request; `reset` clears the field after a success. */
    | { kind: 'flash'; flash: FlashMessage; reset: boolean };

const FLASH_TYPES: readonly FlashMessage['type'][] = ['success', 'warning', 'error'];

function record(data: unknown): Record<string, unknown> {
    return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
}

function text(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function flashType(value: unknown): FlashMessage['type'] | null {
    return typeof value === 'string' && (FLASH_TYPES as readonly string[]).includes(value) ? (value as FlashMessage['type']) : null;
}

export function emailFormOutcome(status: number, data: unknown, strings: EmailFormStrings): EmailFormOutcome {
    const body = record(data);

    if (status === 422) {
        const errors = record(body.errors);
        const email = Array.isArray(errors.email) ? text(errors.email[0]) : null;

        return { kind: 'field', error: email ?? strings.invalidEmail };
    }

    if (status === 429) {
        return { kind: 'flash', flash: { type: 'error', message: strings.tooMany }, reset: false };
    }

    if (status < 200 || status >= 300) {
        const platformAnswer = status >= 400 && status < 500 && status !== 419 && flashType(body.type) !== null ? text(body.message) : null;

        return { kind: 'flash', flash: { type: 'error', message: platformAnswer ?? strings.failed }, reset: false };
    }

    return {
        kind: 'flash',
        flash: { type: flashType(body.type) ?? 'success', message: text(body.message) ?? strings.subscribed },
        reset: true,
    };
}
