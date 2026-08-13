<?php

return [
    /*
     * Which checkout provider the buy buttons hand off to. The provider's own
     * public embed script is loaded from this value in the root Blade view.
     * No provider credentials or product ids live in this repository; they are
     * resolved server-side when /checkout is called.
     */
    'provider' => env('PAYMENT_PROVIDER', 'lemonsqueezy'),
];
