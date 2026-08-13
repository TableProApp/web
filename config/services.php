<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | The marketing site talks to exactly one third party: the public GitHub
    | API, unauthenticated, for the star count and the release download links.
    | Every value below is public information with a working default, which is
    | why this app needs no credentials of any kind to run.
    |
    */

    'github' => [
        'repo' => env('GITHUB_REPO', 'TableProApp/TablePro'),
    ],

    'homebrew' => [
        'cask' => env('HOMEBREW_CASK', 'tablepro'),
    ],

    'crisp' => [
        'website_id' => env('CRISP_WEBSITE_ID'),
    ],

];
