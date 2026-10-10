/**
 * The `controls` namespace: the language switcher, the theme control, copy
 * buttons, steppers, availability marks and the other shared controls.
 *
 * Shared components take these as props (the license app passes its own), so
 * a key here never reaches a shared file directly.
 */
export default {
    language: {
        label: 'Language',
        current: 'Language: {language}',
        /** Shown, in the target language, under an option that has no equivalent page. */
        fallback: 'No English version of this page',
        /** The same, when the option leads to the blog list instead: what is missing, then where it goes (sitemap §B.4). */
        fallbackPost: 'This post is not in English',
        fallbackBlog: 'See the blog list',
        /**
         * The bar that offers this page in the reader's language (LanguageBar),
         * written in that language and naming it, since the reader may not
         * read the page's: `action` is the link, `dismiss` the close button's
         * name. One line on a 320px screen (LanguageBarTest).
         */
        suggest: {
            label: 'Language suggestion',
            action: 'Read this page in English',
            dismiss: "Don't suggest English again",
        },
    },
    theme: {
        label: 'Theme',
        current: 'Theme: {choice}',
        light: 'Light',
        dark: 'Dark',
        system: 'System',
    },
    copy: {
        copy: 'Copy',
        copied: 'Copied',
        copyNamed: 'Copy {label}',
        failed: "Couldn't copy. Select the text and copy it.",
    },
    stepper: {
        decrease: 'Decrease {label}',
        increase: 'Increase {label}',
    },
    availability: {
        included: 'Included',
        notIncluded: 'Not included',
    },
    dismiss: 'Dismiss',
    close: 'Close',
};
