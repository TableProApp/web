<?php

/*
|--------------------------------------------------------------------------
| Open Graph card labels
|--------------------------------------------------------------------------
|
| The few words the og:generate templates (resources/views/og) print around
| a page's own copy. The page's title and kicker come from its content file,
| a post's from its front matter.
|
| `family` is the kicker a page card falls back to when its content gives
| none, and the label on a blog card. `byline` is one template, so each
| language orders author and date its own way.
|
*/

return [
    'family' => [
        'blog' => 'Blog',
        'compare' => 'Comparison',
        'database' => 'Databases',
        'feature' => 'Features',
    ],

    'author' => 'TablePro',

    'byline' => ':author · :date',
];
