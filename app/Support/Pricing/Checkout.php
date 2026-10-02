<?php

namespace App\Support\Pricing;

/**
 * How the plan cards hand a purchase to the platform app, as the `checkout`
 * page prop of every page that renders them: `/pricing` and the homepage's
 * `#pricing` section.
 *
 * The provider is one global setting, `PAYMENT_PROVIDER` (config/payment.php),
 * which must match the platform's own: the cards open the overlay of the
 * provider whose checkout URL `POST /checkout` returns. Language and region
 * play no part.
 *
 * Polar's checkout takes a discount code itself, so under Polar the site asks
 * for none. Lemon Squeezy's does not, so there the cards show the code field
 * and preview the code with `POST /discount/preview`.
 */
final class Checkout
{
    /**
     * The providers the platform can check out with.
     */
    public const PROVIDERS = ['polar', 'lemonsqueezy'];

    /**
     * The configured provider, or the configuration's default when the value
     * is not one the platform supports.
     */
    public function provider(): string
    {
        $provider = config('payment.provider');

        return is_string($provider) && in_array($provider, self::PROVIDERS, true) ? $provider : 'lemonsqueezy';
    }

    /**
     * @return array{provider: string, couponField: bool}
     */
    public function props(): array
    {
        $provider = $this->provider();

        return [
            'provider' => $provider,
            'couponField' => $provider !== 'polar',
        ];
    }
}
