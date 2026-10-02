<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;

/**
 * The Sparkle feed the installed Mac app updates from.
 *
 * Read as the fallback when the GitHub releases API fails. It is served from
 * `raw.githubusercontent.com`, which is not subject to the API's
 * unauthenticated limit of 60 calls an hour, and the release job writes it only
 * after the release's assets are uploaded (`build.yml:330-405`), so a version
 * here always has its DMGs.
 *
 * Only the top item is read. Items come in per-architecture pairs for the same
 * version, newest first; the feed carries the update zips, never the DMGs, so
 * the DMG names come from `platforms.json` rather than from the enclosure.
 */
class SparkleAppcast
{
    private const SPARKLE_NAMESPACE = 'http://www.andymatuschak.org/xml-namespaces/sparkle';

    private const TIMEOUT_SECONDS = 5;

    public function feedUrl(): string
    {
        return 'https://raw.githubusercontent.com/' . config('services.github.repo') . '/main/appcast.xml';
    }

    /**
     * The newest item of the live feed, or null when it cannot be read.
     *
     * @return array{version: string, publishedAt: string|null, minimumSystemVersion: string|null}|null
     */
    public function latest(): ?array
    {
        try {
            $response = Http::timeout(self::TIMEOUT_SECONDS)->accept('application/xml')->get($this->feedUrl());
        } catch (\Throwable) {
            return null;
        }

        if (! $response->ok()) {
            return null;
        }

        return self::parse($response->body());
    }

    /**
     * The top item of a feed document, or null when it holds no usable item.
     *
     * @return array{version: string, publishedAt: string|null, minimumSystemVersion: string|null}|null
     */
    public static function parse(string $xml): ?array
    {
        if (trim($xml) === '') {
            return null;
        }

        $previous = libxml_use_internal_errors(true);

        try {
            $document = simplexml_load_string($xml, SimpleXMLElement::class, LIBXML_NONET);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        if ($document === false || ! isset($document->channel->item[0])) {
            return null;
        }

        $item = $document->channel->item[0];
        $sparkle = $item->children(self::SPARKLE_NAMESPACE);

        $version = trim((string) $sparkle->shortVersionString);

        if ($version === '') {
            $version = trim((string) $item->title);
        }

        if (preg_match('/^\d+(\.\d+)*$/', $version) !== 1) {
            return null;
        }

        $minimum = trim((string) $sparkle->minimumSystemVersion);

        return [
            'version' => $version,
            'publishedAt' => self::date(trim((string) $item->pubDate)),
            'minimumSystemVersion' => $minimum !== '' ? $minimum : null,
        ];
    }

    /**
     * An RFC 2822 `pubDate` as a UTC `Y-m-d`, or null.
     */
    private static function date(string $pubDate): ?string
    {
        if ($pubDate === '') {
            return null;
        }

        try {
            return Carbon::parse($pubDate)->utc()->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
