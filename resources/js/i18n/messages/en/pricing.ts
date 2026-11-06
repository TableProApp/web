// No price, seat bound, day count or percentage is typed here: each comes through a {slot} from resources/data/pricing.json.
// Commerce rules (positioning §12): no "most popular", typed saving, "unlock", promise of future updates or other ways to pay.
export default {
    // How formatUsd() writes an amount; every locale is billed in US dollars.
    currency: {
        pattern: '${amount}',
        decimal: '.',
        group: ',',
    },
    cycles: {
        legend: 'Billing cycle',
        monthly: 'Monthly',
        yearly: 'Yearly',
        lifetime: 'One-time',
    },
    // {percent}: twelve monthly payments against one yearly payment, from pricing.json, rounded down.
    captions: {
        monthly: 'Renews every month until you cancel.',
        yearly: 'Renews every year until you cancel. {percent}% less than twelve monthly payments.',
        yearlyByTier: 'Renews every year until you cancel. Pro is {starterPercent}% less than twelve monthly payments, Team {teamPercent}% less.',
        lifetime: 'Paid once, no expiry date.',
    },
    tiers: {
        free: {
            name: 'Free',
            description: 'Core database tools, with no trial period.',
            activation: 'No sign-up to use the app.',
            includesTitle: 'Includes',
            includes: ['Every supported engine', 'SQL editor and data grid', 'AI assistant and MCP server', 'Safe Mode', 'iPhone and iPad app'],
        },
        starter: {
            name: 'Pro',
            description: 'The paid features, for one person.',
            activation: {
                one: 'One person, {count} computer, Mac or Linux.',
                other: 'One person, up to {count} computers, Mac or Linux.',
            },
            includesTitle: 'Everything in Free, plus',
            cta: 'Get Pro',
        },
        team: {
            name: 'Team',
            description: 'Pro for everyone, and shared connections.',
            activation: {
                one: 'One person per seat, on {count} computer, Mac or Linux.',
                other: 'One person per seat, on up to {count} computers, Mac or Linux.',
            },
            includesTitle: 'Everything in Pro, plus',
            cta: 'Get Team',
            subscriptionOnly: 'Team is sold monthly or yearly.',
        },
        enterprise: {
            name: 'Enterprise',
            description: 'Sign-in with your company accounts, enforced policies, an audit log, MDM, purchase orders.',
            cta: 'Contact us',
        },
    },
    units: {
        starter: {
            monthly: 'per month',
            yearly: 'per year',
            lifetime: 'paid once',
        },
        team: {
            monthly: 'per seat, per month',
            yearly: 'per seat, per month, billed yearly',
        },
    },
    seats: {
        label: 'Seats',
        // Fills controls.stepper.decrease and increase: "Decrease seats".
        noun: 'seats',
        // Until GET /v2/pricing names a maximum, and when Polar sets none.
        minimum: 'Minimum {min} seats.',
        bounds: 'Minimum {min} seats, maximum {max}.',
        // Replaces `bounds` after a typed count was out of range.
        clamped: {
            min: 'Changed to the minimum, {min} seats.',
            max: 'Changed to the maximum, {max} seats.',
        },
        total: {
            monthly: { one: '{count} seat: {total} per month', other: '{count} seats: {total} per month' },
            yearly: { one: '{count} seat: {total} per year', other: '{count} seats: {total} per year' },
        },
    },
    prioritySupport: {
        name: 'Priority support',
        detail: {
            one: 'Emails from Team customers are answered first, within one business day.',
            other: 'Emails from Team customers are answered first, within {count} business days.',
        },
    },
    // A link to the plan table, after a card's highlighted features.
    allFeatures: 'Every paid feature',
    refund: {
        one: 'Refunds within {count} day of a purchase or a renewal (<link>refund policy</link>).',
        other: 'Refunds within {count} days of a purchase or a renewal (<link>refund policy</link>).',
    },
    finePrint: 'Prices in US dollars; {merchant} adds sales tax or VAT at checkout.',
    comparePlans: 'Compare plans',
    section: {
        title: 'Pricing',
        lead: 'TablePro is open source and free to use. Paid plans add optional features to the Mac app.',
    },
    matrix: {
        caption: 'What each plan includes in the Mac app',
        feature: 'Feature',
        groups: {
            starter: 'In Pro and Team',
            team: 'In Team',
            all: 'In every plan',
        },
        macs: 'Computers',
        macsFree: 'No license',
        macsStarter: { one: '{count}, Mac or Linux', other: 'Up to {count}, Mac or Linux' },
        macsTeam: { one: '{count} per seat, Mac or Linux', other: 'Up to {count} per seat, Mac or Linux' },
        everythingElse: 'Everything else in the app',
        everythingElseDetail: 'Every supported engine, the SQL editor, the AI assistant, the MCP server and Safe Mode',
        iphoneNote: 'The iPhone and iPad app has no paid features. iCloud Sync is free there; to sync with a Mac, the Mac needs Pro or Team.',
    },
    // {country} is in parentheses so no language needs an article for it; listPrice names the struck price for a screen reader.
    regional: {
        note: 'Prices for your country ({country}): {percent}% off, applied at checkout.',
        listPrice: 'List price {price}',
    },
    discount: {
        summary: 'Have a discount code?',
        label: 'Discount code',
        apply: 'Apply code',
        checking: 'Checking the code…',
        percent: 'Code accepted: {amount}% off, applied at checkout.',
        fixed: 'Code accepted: {amount} off, applied at checkout.',
        accepted: 'Code accepted, applied at checkout.',
        invalid: 'This code is invalid or has expired.',
    },
    checkout: {
        failed: "Couldn't open checkout. Try again.",
        planUnavailable: "This plan isn't for sale right now. Choose another billing cycle, or try again later.",
        seats: 'Choose between {min} and {max} seats, then try again.',
        // A 422 on body.seats while no maximum is known.
        seatsFewer: 'Choose fewer seats, then try again.',
    },
    offers: {
        name: '{plan}, {cycle}',
        seat: 'seat',
    },
};
