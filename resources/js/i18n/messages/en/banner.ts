/**
 * The `banner` namespace: the license banner above the header.
 *
 * `config/banner.php` holds only the switch, the link and the dismissal
 * version; the words live here, in each language. The line is addressed to a
 * regular user and says what a license adds and what it pays for. It states a
 * fact and never pleads, and it never says the whole app is free.
 *
 * Length limits, held by TopBannerTest in every language, in display columns
 * (a CJK character is two): the band is one 40px line and nothing in it may
 * be truncated (design-system §3.3). From 1024px the line is `message` and
 * the `cta` link, together within 110, and `cta` within 20. Below 1024px
 * `short` asks the same question before the link, together within 34: 248px
 * on a 320px screen. `licensed` shows from 1280px, within 26.
 */
export default {
    label: 'Announcement',
    message: 'Use TablePro every day? A license adds the paid features and funds the next release.',
    short: 'Use TablePro daily?',
    cta: 'Get a license',
    licensed: 'Have a license? Hide this',
};
