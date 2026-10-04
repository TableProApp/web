/**
 * The `common` namespace: words and patterns many components share.
 *
 * `list` and `shortList` are the separators for joining names during SSR
 * (`joinList()` in ../../format.ts): "Mac, iPhone and iPad" with no serial
 * comma, and "iPhone & iPad" for short labels. Never `Intl.ListFormat` on the
 * server, whose ICU data can differ from the browser's.
 */
export default {
    brand: 'TablePro',
    home: 'Home',
    englishOnly: '(English)',
    list: {
        separator: ', ',
        last: ' and ',
    },
    shortList: {
        separator: ', ',
        last: ' & ',
    },
};
