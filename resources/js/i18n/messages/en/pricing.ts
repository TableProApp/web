/**
 * The `pricing` namespace: the plan cards, the billing-cycle control, the plan
 * table and checkout, wherever they render (`/pricing` and the homepage's
 * `#pricing` section).
 *
 * No price, seat bound, day count or percentage is typed here. Each arrives
 * through a `{slot}` from resources/data/pricing.json, and amounts are written
 * by `formatUsd()` with `currency` below. The currency style changes how a
 * number is written, never what is billed: every locale pays in US dollars.
 *
 * Words the commerce rules keep out (positioning §12): no "most popular", no
 * typed saving, no "unlock", no promise of future updates for a one-time
 * purchase, nothing about regional prices or other ways to pay.
 */
export default {
    /** `formatUsd()` style: the amount after a dollar sign, a point before the cents, commas between thousands. */
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
    /**
     * The line under the cycle control. `{percent}` is computed from
     * pricing.json (twelve monthly payments against one yearly payment,
     * rounded down), never typed.
     */
    captions: {
        monthly: 'Renews every month until you cancel.',
        yearly: 'Renews every year until you cancel. {percent}% less than twelve monthly payments.',
        yearlyByTier: 'Renews every year until you cancel. Starter is {starterPercent}% less than twelve monthly payments, Team {teamPercent}% less.',
        lifetime: 'Paid once, no expiry date.',
    },
    tiers: {
        free: {
            name: 'Free',
            description: 'The Mac app without the paid features, and the iPhone and iPad app.',
            activation: 'No sign-up to use the app.',
            includesTitle: 'Includes',
            includes: [
                'Connections to any supported engine',
                'The SQL editor and the data grid',
                'The AI assistant and the MCP server',
                'Safe Mode',
                'The iPhone and iPad app',
            ],
        },
        starter: {
            name: 'Starter',
            description: 'Adds the Starter features to the Mac app.',
            activation: {
                one: 'One license for {count} Mac.',
                other: 'One license for up to {count} Macs.',
            },
            includesTitle: 'Everything in Free, plus',
            cta: 'Get Starter',
        },
        team: {
            name: 'Team',
            description: 'Adds connections and queries shared with your team, on top of Starter.',
            activation: 'Each seat is one activated Mac.',
            includesTitle: 'Everything in Starter, plus',
            cta: 'Get Team',
        },
    },
    /** The unit beside a price. */
    units: {
        starter: {
            monthly: 'per month',
            yearly: 'per year',
            lifetime: 'paid once',
        },
        team: {
            monthly: 'per seat, per month',
            yearly: 'per seat, per year',
            lifetime: 'per seat, paid once',
        },
    },
    seats: {
        /** The stepper's visible label and accessible name. */
        label: 'Seats',
        /** Fills `controls.stepper.decrease` / `increase`: "Decrease seats". */
        noun: 'seats',
        bounds: 'Minimum {min} seats, maximum {max}.',
        total: {
            monthly: { one: '{count} seat: {total} per month', other: '{count} seats: {total} per month' },
            yearly: { one: '{count} seat: {total} per year', other: '{count} seats: {total} per year' },
            lifetime: { one: '{count} seat: {total}, paid once', other: '{count} seats: {total}, paid once' },
        },
    },
    prioritySupport: {
        name: 'Priority support',
        detail: {
            one: 'Emails from Team customers are answered first, within one business day.',
            other: 'Emails from Team customers are answered first, within {count} business days.',
        },
    },
    /** A link to the plan table, after a card's highlighted features. */
    allFeatures: 'Every paid feature',
    /** The line under the cards. `{merchant}` is pricing.json's merchant of record. */
    finePrint: 'Prices in US dollars. {merchant} is the merchant of record: it takes the payment and calculates any sales tax or VAT at checkout.',
    /** The line under the cards when checkout is another provider's, so no merchant is named. */
    finePrintCurrency: 'Prices in US dollars.',
    comparePlans: 'Compare plans',
    /** The homepage section (`#pricing`). Its page may pass its own heading and lead instead. */
    section: {
        title: 'Pricing',
        lead: 'TablePro is open source and free to use. Paid plans add optional features to the Mac app.',
    },
    /** The plan table on /pricing. Its rows are the paid features from paid-features.json. */
    matrix: {
        caption: 'What each plan includes in the Mac app',
        feature: 'Feature',
        macs: 'Macs',
        macsFree: 'No license',
        macsStarter: { one: '{count}', other: 'Up to {count}' },
        macsTeam: 'One per seat',
        everythingElse: 'Everything else in the app',
        everythingElseDetail: 'Every supported engine, the SQL editor, the AI assistant, the MCP server and Safe Mode',
        iphoneNote: 'The iPhone and iPad app has no paid features. iCloud Sync is free there; to sync with a Mac, the Mac needs Starter or Team.',
    },
    discount: {
        /** Under Polar, whose checkout takes the code itself. */
        atCheckout: 'Have a discount code? Enter it at checkout.',
        summary: 'Have a discount code?',
        label: 'Discount code',
        apply: 'Apply code',
        checking: 'Checking the code…',
        percent: 'Code accepted: {amount}% off, applied at checkout.',
        fixed: 'Code accepted: {amount} off, applied at checkout.',
        invalid: 'That discount code is invalid or has expired.',
    },
    checkout: {
        failed: "Couldn't start checkout. Try again.",
    },
    /** Structured data: one offer per visible price. */
    offers: {
        name: '{plan}, {cycle}',
        seat: 'seat',
    },
};
