<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Google Analytics 4
    |--------------------------------------------------------------------------
    |
    | Set GOOGLE_ANALYTICS_ID to the web stream's measurement ID (G-XXXXXXXXXX).
    | The account portal at /account is a separate application on the same
    | origin and carries its own copy of this setting; both must name the same
    | stream, or a reader who crosses from one to the other becomes two users.
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
