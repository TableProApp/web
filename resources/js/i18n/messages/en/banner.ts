/**
 * The `banner` namespace: the license banner above the header.
 *
 * `config/banner.php` holds only the switch and the link; the words live
 * here, in each language. The line is addressed to a regular user and says
 * what a license adds and what it pays for. It states a fact and never
 * pleads, and it never says the whole app is free. It cannot be closed, so
 * there is no "hide this" wording.
 *
 * Length limits, held by TopBannerTest in every language, in display columns
 * (a CJK character is two): the band is one 40px line and nothing in it may
 * be truncated (design-system §3.3). From 1024px the line is `message` and
 * the `cta` link, together within 110, and `cta` within 20. Below 1024px
 * `short` asks the same question before the link, together within 34: 248px
 * on a 320px screen.
 */
export default {
    label: 'Announcement',
    message: 'Paid plans add features and fund TablePro’s development.',
    short: 'Optional paid plans',
    cta: 'See plans',
};
