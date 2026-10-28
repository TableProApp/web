<?php

namespace App\Support;

final class TableProApi
{
    public const PRODUCTION_ORIGIN = 'https://api.tablepro.app';

    // A malformed value would break the CSP's connect-src, so it falls back to production.
    public static function origin(): string
    {
        $origin = config('services.tablepro_api.origin');

        if (! is_string($origin)) {
            return self::PRODUCTION_ORIGIN;
        }

        $origin = rtrim(trim($origin), '/');

        return preg_match('#^https?://[a-z0-9.-]+(:\d{1,5})?$#i', $origin) === 1 ? $origin : self::PRODUCTION_ORIGIN;
    }

    public static function turnstileSiteKey(): ?string
    {
        $key = config('services.turnstile.site_key');

        return is_string($key) && preg_match('/^[A-Za-z0-9_-]+$/', $key) === 1 ? $key : null;
    }
}
