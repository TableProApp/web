<?php

/*
|--------------------------------------------------------------------------
| Static error pages
|--------------------------------------------------------------------------
|
| Copy for resources/views/errors/{500,503}.blade.php, the fallbacks shown
| when the branded Inertia error page cannot render. The Inertia page itself
| takes its copy from the `errors` UI catalog in resources/js/i18n.
|
*/

return [
    'home' => 'Go to the TablePro homepage',

    '500' => [
        'title' => 'Something went wrong',
        'body' => "It's on our side. Try again in a moment. If it keeps happening, email :email.",
    ],

    '503' => [
        'title' => 'Down for maintenance',
        'body' => 'tablepro.app will be back shortly.',
    ],
];
