<?php

return [
    /*
     * Which checkout provider the buy buttons hand off to. The page reads it
     * through App\Support\Pricing\Checkout (the `checkout` prop), and
     * resources/js/lib/checkout-sdk.ts loads that provider's script at checkout
     * intent from resources/data/pricing.json → checkoutSdk. No provider
     * credentials or product ids live in this repository; they are resolved
     * server-side when /checkout is called.
     */
    'provider' => env('PAYMENT_PROVIDER', 'lemonsqueezy'),
];
