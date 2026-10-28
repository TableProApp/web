<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | The server talks to one third party: the public GitHub API,
    | unauthenticated, for the star count and the release download links. The
    | pricing and newsletter forms call tablepro-cloud's public API from the
    | browser, without credentials. Every value below is public information,
    | which is why this app needs no credentials of any kind to run.
    |
    */

    'github' => [
        'repo' => env('GITHUB_REPO', 'TableProApp/TablePro'),
    ],

    'homebrew' => [
        'cask' => env('HOMEBREW_CASK', 'tablepro'),
    ],

    'tablepro_api' => [
        'origin' => env('TABLEPRO_API_ORIGIN', 'https://api.tablepro.app'),
    ],

    'crisp' => [
        'website_id' => env('CRISP_WEBSITE_ID'),
    ],

];
