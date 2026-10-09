/**
 * The `errors` namespace: the branded 404, 410, 500 and 503 page.
 *
 * `languages` names each locale in this language, for "Read it in English";
 * the switcher uses each language's own name instead.
 */
export default {
    status: 'Error {status}',
    notFound: {
        title: 'Page not found',
        body: 'Check the address, or use one of the links below.',
    },
    gone: {
        title: 'This page was removed',
        body: 'It is no longer part of tablepro.app, and no other page replaces it.',
    },
    serverError: {
        title: 'Something went wrong',
        body: "It's on our side. Try again in a moment. If it keeps happening, email {email}.",
    },
    unavailable: {
        title: 'Down for maintenance',
        body: 'tablepro.app will be back shortly.',
    },
    translation: {
        title: 'This page is only available in {language}',
        body: 'It has not been translated yet.',
        link: 'Read it in {language}',
    },
    /** A `/vi/account…` or `/vi/checkout…` path: the account has no language prefix. */
    account: {
        body: 'Your account has one address in every language. Open it here in your selected language.',
        link: 'Open your account',
    },
    languages: {
        en: 'English',
        vi: 'Vietnamese',
        es: 'Spanish',
        de: 'German',
        fr: 'French',
        ja: 'Japanese',
        'pt-BR': 'Brazilian Portuguese',
        'zh-Hans': 'Simplified Chinese',
        ko: 'Korean',
        'zh-Hant': 'Traditional Chinese',
        it: 'Italian',
        id: 'Indonesian',
    },
    linksLabel: 'Pages to start from',
    links: {
        home: 'Home',
        features: 'Features',
        databases: 'Databases',
        download: 'Download',
        blog: 'Blog',
    },
};
