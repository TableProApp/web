/**
 * The `forms` namespace: field chrome and the messages a form shows when the
 * server gives none of its own.
 *
 * `tooMany` is always used for a 429: the platform's own text for it is shared
 * with the license API and stays English.
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
};
