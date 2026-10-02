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
        inlineLabel: 'Language:',
        current: 'Language: {language}',
        /** Shown, in the target language, under an option that has no equivalent page. */
        fallback: 'No English version of this page',
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
    /** `FootnoteMarker` and `FootnoteList` under tables and comparisons. */
    footnotes: {
        marker: 'Note',
        list: 'Notes',
        back: 'Back to where this note is cited',
    },
    dismiss: 'Dismiss',
    close: 'Close',
    cancel: 'Cancel',
    working: 'Working…',
};
