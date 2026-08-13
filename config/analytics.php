<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Plausible Analytics
    |--------------------------------------------------------------------------
    |
    | Self-hosted Plausible. Set PLAUSIBLE_DOMAIN to the site identifier you
    | configured in your Plausible dashboard (typically the bare domain, e.g.
    | "tablepro.app"). Set PLAUSIBLE_SCRIPT_URL to the script endpoint of your
    | Plausible host (e.g. "https://plausible.tablepro.app/js/script.js").
    |
    | When PLAUSIBLE_DOMAIN is empty the script tag is not rendered, so dev
    | and staging environments stay clean by default.
    |
    */

    'plausible' => [
        'domain' => env('PLAUSIBLE_DOMAIN'),
        'script_url' => env('PLAUSIBLE_SCRIPT_URL', 'https://plausible.io/js/script.js'),
    ],
];
