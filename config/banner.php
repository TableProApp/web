<?php

return [

    /*
    |--------------------------------------------------------------------------
    | The license banner
    |--------------------------------------------------------------------------
    |
    | A one-line band above the header that asks a regular user to buy a
    | license: it says what a license adds and what it pays for. On by default,
    | on every public page except Pricing, which is where it leads
    | (App\Support\Banner). It scrolls away with the page rather than sticking.
    |
    | Config holds the switch, the link and the dismissal version, and nothing
    | else. The words live in the `banner` UI catalog, once per language
    | (resources/js/i18n/messages/{locale}/banner.ts), so the banner reads in
    | the page's language and its length limits are checked in each
    | (TopBannerTest).
    |
    | It states a fact and never pleads: no "we need your help", no countdown,
    | no orange fill. A reader who closes it does not see it for 30 days, and a
    | reader who says they have a license, or buys one, not for a year
    | (resources/js/lib/banner.ts).
    |
    | `BANNER_ENABLED=false` removes it from the DOM entirely: no hidden
    | element, no reserved height, no dismissal script.
    |
    */

    'enabled' => (bool) env('BANNER_ENABLED', true),

    /**
     * Where the banner's link goes: a root-relative English path, which the
     * page prefixes with its own locale (`/pricing` becomes `/vi/pricing` on a
     * Vietnamese page). Pricing or a release post, never a donation page.
     */
    'href' => env('BANNER_HREF', '/pricing'),

    /**
     * Bump to show the banner again to readers who closed an earlier one.
     *
     * A closed banner is stored as `tablepro:banner-dismissed` in
     * `localStorage`: this version and the time it stays hidden until. There
     * is no session on this domain and the server sets no cookie, so the
     * browser is the only place a dismissal can live. Change it whenever the
     * catalog wording changes: a reader who closed the old message has not
     * read the new one. A license holder's year-long dismissal covers every
     * version.
     */
    'version' => env('BANNER_VERSION', '3'),

];
