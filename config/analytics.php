<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Analytics 4
    |--------------------------------------------------------------------------
    |
    | Set GOOGLE_ANALYTICS_ID to the web stream's measurement ID (G-XXXXXXXXXX).
    |
    | The tag loads in Consent Mode with analytics storage denied, so no cookie
    | is set until the reader allows it — see "Analytics and consent" in
    | docs/architecture.md.
    |
    | When GOOGLE_ANALYTICS_ID is empty the tag is not rendered, so dev and
    | staging environments stay clean by default.
    |
    */

    'google' => [
        'measurement_id' => env('GOOGLE_ANALYTICS_ID'),
    ],
];
