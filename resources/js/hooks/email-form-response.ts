// What the newsletter form shows for each answer of POST /v2/newsletter/subscriptions, which answers 202 whether or
// not the address was new, so it reveals nothing. No path aliases, so `node --test` loads it directly.
import { problemOf } from '../lib/problem.ts';

export interface FlashMessage {
    type: 'success' | 'error';
    message: string;
}

export interface EmailFormStrings {
    invalidEmail: string;
    tooMany: string;
    failed: string;
    subscribed: string;
    verification: string;
}

export type EmailFormOutcome =
    // A message about the field itself, shown under it.
    | { kind: 'field'; error: string }
    // A message about the request; `reset` clears the field after a success.
    | { kind: 'flash'; flash: FlashMessage; reset: boolean };

export function emailFormOutcome(status: number, data: unknown, strings: EmailFormStrings): EmailFormOutcome {
    if (status >= 200 && status < 300) {
        return { kind: 'flash', flash: { type: 'success', message: strings.subscribed }, reset: true };
    }

    if (status === 429) {
        return { kind: 'flash', flash: { type: 'error', message: strings.tooMany }, reset: false };
    }

    const problem = problemOf(data);

    if (status === 422 && problem.locations.includes('body.email')) {
        return { kind: 'field', error: strings.invalidEmail };
    }

    if (status === 422 && problem.locations.includes('body.turnstile_token')) {
        return { kind: 'flash', flash: { type: 'error', message: strings.verification }, reset: false };
    }

    return { kind: 'flash', flash: { type: 'error', message: strings.failed }, reset: false };
}

// GET /v2/newsletter/stats; null for anything but a positive whole count, which the forms then leave unsaid.
export function subscriberCount(data: unknown): number | null {
    const subscribers = typeof data === 'object' && data !== null ? (data as Record<string, unknown>).subscribers : null;

    return typeof subscribers === 'number' && Number.isInteger(subscribers) && subscribers > 0 ? subscribers : null;
}
