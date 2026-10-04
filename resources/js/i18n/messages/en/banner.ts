/**
 * The `banner` namespace: the optional standing line above the header.
 *
 * `config/banner.php` holds only the switch, the link and the dismissal
 * version; the words live here, in each language. It is off by default. The
 * copy states a fact and links to it. It never pleads, and it never says the
 * whole app is free.
 *
 * Length limits, held by TopBannerTest in both languages: the band is one
 * 40px line and nothing in it may be truncated (design-system §3.3). From
 * 1024px the line is `message` and the `cta` link, together within 110
 * characters, and `cta` within 20; below 1024px the link alone reads `short`,
 * within 32.
 */
export default {
    label: 'Announcement',
    message: 'TablePro is free to use. Paid plans add optional features to the Mac app.',
    short: 'See what paid plans add',
    cta: 'See pricing',
};
