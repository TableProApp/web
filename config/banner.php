<?php

return [

    /*
    |--------------------------------------------------------------------------
    | The optional banner
    |--------------------------------------------------------------------------
    |
    | A standing line above the header, on every page, when it is switched on.
    | Off by default (sitemap §B.5): the site says what it needs to say in its
    | pages, and a banner is for something time-bound, such as a release.
    |
    | Config holds the switch, the link and the dismissal version, and nothing
    | else. The words live in the `banner` UI catalog, once per language
    | (resources/js/i18n/messages/{en,vi}/banner.ts), so the banner reads in
    | the page's language and its length limits are checked in both
    | (TopBannerTest).
    |
    | `BANNER_ENABLED=false` removes it from the DOM entirely: no hidden
    | element, no reserved height, no dismissal script.
    |
    */

    'enabled' => (bool) env('BANNER_ENABLED', false),

    /**
     * Where the banner's link goes: a root-relative English path, which the
     * page prefixes with its own locale (`/pricing` becomes `/vi/pricing` on a
     * Vietnamese page). Pricing or a release post, never a donation page.
     */
    'href' => env('BANNER_HREF', '/pricing'),

    /**
     * Bump to show the banner again to readers who dismissed an earlier one.
     *
     * Stored as `tablepro:banner-dismissed` in `localStorage` with this value.
     * There is no session on this domain and the server sets no cookie, so the
     * browser is the only place a dismissal can live. Change it whenever the
     * catalog wording changes: a reader who closed the old message has not
     * read the new one.
     */
    'version' => env('BANNER_VERSION', '2'),

];
