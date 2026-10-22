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
    | Config holds the switch and the link, and nothing else. The words live in
    | the `banner` UI catalog, once per language
    | (resources/js/i18n/messages/{locale}/banner.ts), so the banner reads in
    | the page's language and its length limits are checked in each
    | (TopBannerTest).
    |
    | It states a fact and never pleads: no "we need your help", no countdown,
    | no orange fill, only a tint of the brand hue (app.css). It cannot be
    | closed: there is no close button, no stored record and no version, so
    | every reader sees it on every page it belongs on.
    |
    | `BANNER_ENABLED=false` removes it from the DOM entirely: no hidden
    | element, no reserved height.
    |
    */

    'enabled' => (bool) env('BANNER_ENABLED', true),

    /**
     * Where the banner's link goes: a root-relative English path, which the
     * page prefixes with its own locale (`/pricing` becomes `/vi/pricing` on a
     * Vietnamese page). Pricing or a release post, never a donation page.
     */
    'href' => env('BANNER_HREF', '/pricing'),

];
