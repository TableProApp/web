// Positioning "Dated sales": say what it takes off as "% off" and how long is left. Never "save N%", never the regional discount.
// Display columns (CJK counts two): `name` + `banner.message` + `banner.cta` within 64 from 1024px; below it `name` + `banner.short` + `banner.cta` within 36, to fit 360px.
export default {
    name: 'Black Friday',
    banner: {
        label: 'Black Friday sale',
        message: '{percent}% off Pro, one-time and yearly.',
        short: '{percent}% off Pro',
        cta: 'See the deal',
        close: 'Close the Black Friday notice',
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
    // The sale's notice (CampaignNotice): a dialog from 640px, a card at the bottom below it. Plan names stay as on the sale's page.
    notice: {
        headline: '{percent}% off',
        product: 'TablePro Pro',
        window: 'Pro one-time and Pro yearly, until {endsOn}, {endsAtTime} UTC.',
        lifetime: 'Pro one-time',
        lifetimeDetail: 'Paid once. Every update and new Pro feature.',
        yearly: 'Pro yearly',
        buy: 'Buy Pro one-time for {price}',
        both: 'See both offers',
        later: 'Not now',
        footnote: 'Pro monthly and Team are not on sale. Regular prices since {listPriceSince}.',
        card: 'Black Friday: {percent}% off Pro',
        cardPrice: 'Pro one-time for {price}.',
    },
};
