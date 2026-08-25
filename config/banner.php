<?php

return [

    /*
    |--------------------------------------------------------------------------
    | The top banner
    |--------------------------------------------------------------------------
    |
    | A standing line above the header, on every page, saying what funds
    | TablePro and offering the license that does it.
    |
    | Config rather than markup, so switching it off is an env change and a
    | deploy of nothing. `BANNER_ENABLED=false` removes it from the DOM
    | entirely: no hidden element, no reserved height, no shifted header.
    |
    | It is deliberately hard to make this shout. There is no `variant`, no
    | `urgency`, no countdown and no dismiss-forever-unless setting. A standing
    | ask that raises its voice reads as a project in trouble, which costs more
    | from a Team buyer than it collects from everyone else — and the page it
    | sits above opens with "The app is free."
    |
    | `version` is what makes a dismissal expire. A reader who closed the banner
    | has closed *that* message; bumping the version brings the bar back for
    | everyone, because the new message is one they have not read. Bump it only
    | when the wording genuinely changes.
    |
    */

    'enabled' => (bool) env('BANNER_ENABLED', true),

    /**
     * Shown from the `sm` breakpoint up.
     *
     * A statement, not a plea. Anything of the shape "we need your help" is
     * forbidden by `FundingModelTest`, which scans the whole `<body>` — this
     * string included, and it is the reason that scan is not bounded by
     * `<main>` the way the rest of the file's assertions are.
     *
     * It must also say something the page does not already say. The first draft
     * read "funded by licenses rather than investors", which is the Pricing
     * ledger's sentence verbatim — so one clause rendered four times across the
     * homepage, /download and the FAQ, and two position assertions started
     * measuring the banner instead of the content they were written for.
     *
     * This says the part only a banner can: it is addressed to someone using
     * the free app, and it names what their money would protect rather than
     * what it would buy. The buying argument is one scroll down, in the section
     * built to make it.
     */
    'message' => env('BANNER_MESSAGE', 'The whole app is free. Licenses are what keep it that way.'),

    /** Below `sm` there is no room for the sentence above. */
    'message_short' => env('BANNER_MESSAGE_SHORT', 'Licenses keep TablePro free.'),

    'cta' => env('BANNER_CTA', 'Buy a license'),

    'href' => env('BANNER_HREF', '/#pricing'),

    /**
     * Bump to re-show the banner to readers who dismissed the previous message.
     *
     * Stored as `tablepro:banner-dismissed` in `localStorage` with this value.
     * There is no session and no cookie on this domain, so the browser is the
     * only place a dismissal can live.
     */
    'version' => env('BANNER_VERSION', '1'),

];
