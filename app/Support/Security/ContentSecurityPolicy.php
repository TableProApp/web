<?php

namespace App\Support\Security;

use App\Support\TableProApi;
use Illuminate\Support\Facades\File;

/**
 * The Content-Security-Policy of an HTML response.
 *
 * Inline scripts are admitted by hash, taken from the response itself, so the
 * policy needs no nonce and the page stays cacheable at the edge. An Inertia
 * visit keeps the policy of the document the reader first loaded, so every
 * page carries the same sources, whether or not it uses them.
 *
 * Third-party lists follow each vendor's published policy. A script source
 * names one host, or one file, never a wildcard.
 */
final class ContentSecurityPolicy
{
    /**
     * Cloudflare Web Analytics, injected at the edge.
     */
    private const CLOUDFLARE = [
        'script-src' => ['https://static.cloudflareinsights.com'],
        'connect-src' => ['https://cloudflareinsights.com'],
    ];

    /**
     * Google Analytics without advertising features.
     */
    private const GOOGLE = [
        'script-src' => ['https://www.googletagmanager.com'],
        'img-src' => ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
        'connect-src' => ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
    ];

    private const CRISP = [
        'script-src' => ['https://client.crisp.chat'],
        'style-src' => ['https://*.crisp.chat'],
        'img-src' => ['https://*.crisp.chat'],
        'font-src' => ['https://*.crisp.chat'],
        'media-src' => ['https://*.crisp.chat'],
        'connect-src' => ['https://*.crisp.chat', 'wss://*.relay.crisp.chat', 'wss://*.relay.rescue.crisp.chat'],
        'frame-src' => ['https://*.crisp.chat', 'https://*.crisp.help'],
        'worker-src' => ['blob:'],
    ];

    private const TURNSTILE = [
        'script-src' => ['https://challenges.cloudflare.com'],
        'frame-src' => ['https://challenges.cloudflare.com'],
    ];

    // Polar's overlay frame. Its script source is the one file pricing.json pins, from checkoutScript().
    private const CHECKOUT = [
        'frame-src' => ['https://polar.sh', 'https://*.polar.sh'],
    ];

    public function for(string $html): string
    {
        $policy = [
            'default-src' => ["'self'"],
            'script-src' => ["'self'", ...$this->inlineScriptHashes($html)],
            'style-src' => ["'self'", "'unsafe-inline'"],
            'img-src' => ["'self'", 'data:'],
            'font-src' => ["'self'"],
            'media-src' => ["'self'"],
            'connect-src' => ["'self'"],
            'frame-src' => [],
            'worker-src' => ["'self'"],
            'object-src' => ["'none'"],
            'base-uri' => ["'self'"],
            'form-action' => ["'self'"],
            'frame-ancestors' => ["'none'"],
        ];

        $thirdParties = [
            self::CLOUDFLARE,
            config('analytics.google.measurement_id') ? self::GOOGLE : [],
            config('services.crisp.website_id') ? self::CRISP : [],
            TableProApi::turnstileSiteKey() !== null ? self::TURNSTILE : [],
            ['script-src' => array_filter([$this->checkoutScript()])],
            self::CHECKOUT,
            ['connect-src' => [TableProApi::origin()]],
        ];

        foreach ($thirdParties as $sources) {
            foreach ($sources as $directive => $list) {
                array_push($policy[$directive], ...$list);
            }
        }

        return implode('; ', array_map(
            static fn(string $directive, array $sources): string => $directive . ' ' . implode(' ', $sources),
            array_keys($policy),
            $policy,
        ));
    }

    /**
     * @return list<string>
     */
    private function inlineScriptHashes(string $html): array
    {
        $hashes = [];
        $offset = 0;

        // Scanned, not matched with one pattern: past pcre.backtrack_limit that returns nothing, and every inline script is refused.
        while (($open = stripos($html, '<script', $offset)) !== false) {
            $bodyAt = strpos($html, '>', $open);
            $close = $bodyAt === false ? false : stripos($html, '</script', $bodyAt);

            if ($close === false) {
                break;
            }

            $attributes = substr($html, $open + 7, $bodyAt - $open - 7);
            $offset = $close + 8;

            preg_match('#(?<![\w-])type\s*=\s*["\']?([^"\'\s>]*)#i', $attributes, $type);

            $external = preg_match('#(?<![\w-])src\s*=#i', $attributes) === 1;
            // JSON-LD and the Inertia page object are data, which the browser never runs.
            $data = ! in_array(strtolower($type[1] ?? ''), ['', 'module', 'text/javascript'], true);

            if (! $external && ! $data) {
                $hashes[] = "'sha256-" . base64_encode(hash('sha256', substr($html, $bodyAt + 1, $close - $bodyAt - 1), true)) . "'";
            }
        }

        return array_values(array_unique($hashes));
    }

    private function checkoutScript(): ?string
    {
        $pricing = json_decode((string) File::get(resource_path('data/pricing.json')), true);
        $url = $pricing['checkoutSdk'] ?? null;

        return is_string($url) && str_starts_with($url, 'https://') ? $url : null;
    }
}
