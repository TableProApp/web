/**
 * The `forms` namespace: field chrome and the messages a form shows when the
 * server gives none of its own.
 *
 * tablepro-cloud's problems are English, so every answer shows one of these.
 * `verification` is for a Turnstile check that did not finish.
 */
export default {
    email: {
        label: 'Email address',
        placeholder: 'you@example.com',
    },
    subscribe: 'Subscribe',
    invalidEmail: 'Enter a valid email address.',
    tooMany: 'Too many attempts. Wait a minute and try again.',
    failed: 'Something went wrong. Try again.',
    network: "Couldn't reach the server. Check your connection and try again.",
    subscribed: 'Check your inbox for the confirmation link.',
    verification: "The spam check didn't finish. Reload the page and try again.",
};
