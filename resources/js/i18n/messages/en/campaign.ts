/**
 * The `campaign` namespace: the dated sale in pricing.json's `campaign`,
 * where the site's chrome and the plan cards carry it while it is live: the
 * banner above the header, the band on the homepage and Pricing, the line on
 * the cards it applies to, the code and the countdown. The sale's own page
 * has its copy in `content/{locale}/black-friday.json`.
 *
 * The sale is real and dated, so these may say what it takes off, as a
 * percentage "off", and how long is left: positioning §9, "Dated sales".
 * Never "save N%", never a reason to hurry beyond the stated end, never the
 * regional discount. A subscription's discount covers its first charge only,
 * and every place that shows that price says so.
 *
 * `{percent}` is pricing.json's. Prices are slots filled with `formatUsd`.
 * Length limits, in display columns (a CJK character is two): from 1024px
 * `name`, `banner.message` and `banner.cta` together within 64, and below it
 * `banner.short` within 14, so each fits one 40px line beside its countdown.
 */
export default {
    name: 'Black Friday',
    banner: {
        label: 'Black Friday sale',
        message: '{percent}% off Pro, one-time and yearly.',
        short: '{percent}% off Pro',
        cta: 'See the deal',
        close: 'Close the Black Friday notice',
    },
    band: {
        title: '{percent}% off TablePro Pro',
        lead: 'Pro one-time is {lifetime} instead of {lifetimeList}, and Pro yearly is {yearly} instead of {yearlyList} for the first year.',
        cta: 'See the deal',
        onPricing: 'The Pro prices below include it.',
    },
    offer: {
        tag: 'Black Friday: {percent}% off',
        firstYear: 'For the first year, then {price} a year.',
        listPrice: 'List price {price}',
    },
    code: {
        label: 'Code',
        applied: 'Applied for you when you buy from this site.',
        copyLabel: 'the discount code',
    },
    countdown: {
        endsIn: 'Ends in',
        startsIn: 'Starts in',
        until: 'Until {date}, {time} UTC',
        from: 'From {date}, {time} UTC',
        units: {
            days: { one: 'day', other: 'days' },
            hours: 'hours',
            minutes: 'min',
            seconds: 'sec',
        },
    },
};
