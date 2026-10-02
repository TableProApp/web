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
        body: 'The address may be mistyped, or the page may have moved. One of these pages is a good place to start.',
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
    languages: {
        en: 'English',
        vi: 'Vietnamese',
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
