<?php

namespace App\Services\Releases;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;

/**
 * The Sparkle feed the installed Mac app updates from, at `updates.tablepro.app`.
 *
 * Read as the fallback when the GitHub releases API fails. It is a GitHub
 * Pages site, which is not subject to the API's unauthenticated limit of 60
 * calls an hour, and the app's release workflow writes an item only after the
 * release's assets are uploaded, so a version here always has its DMG.
 *
 * Stable and beta share the feed; a beta item carries `sparkle:channel`. The
 * current release is the item with no channel and the highest
 * `sparkle:version` (the build number), wherever it sits in the feed. The
 * enclosures are the update archives, never the DMG. Their names still tell
 * the release's shape: a build per architecture has an item per architecture
 * at the same build (`TablePro-0.88.0-arm64.tar.xz`, `-x86_64.tar.xz`), a
 * universal build one item (`TablePro-0.87.0.tar.xz`).
 */
class SparkleAppcast
{
    public const FEED_URL = 'https://updates.tablepro.app/appcast.xml';

    private const SPARKLE_NAMESPACE = 'http://www.andymatuschak.org/xml-namespaces/sparkle';

    private const TIMEOUT_SECONDS = 5;

    public function feedUrl(): string
    {
        return self::FEED_URL;
    }

    /**
     * The current stable item of the live feed, or null when it cannot be read.
     *
     * @return array{version: string, publishedAt: string|null, minimumSystemVersion: string|null, archives: list<string>}|null
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
     * The stable item with the highest build in a feed document, or null when
     * it holds none. `archives` are the enclosure file names of every stable
     * item at that build.
     *
     * @return array{version: string, publishedAt: string|null, minimumSystemVersion: string|null, archives: list<string>}|null
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

        if ($document === false || ! isset($document->channel->item)) {
            return null;
        }

        $latest = null;
        $latestBuild = -1;
        $archives = [];

        foreach ($document->channel->item as $item) {
            $sparkle = $item->children(self::SPARKLE_NAMESPACE);

            if (trim((string) $sparkle->channel) !== '') {
                continue;
            }

            $build = trim((string) $sparkle->version);
            $version = trim((string) $sparkle->shortVersionString);

            if ($version === '') {
                $version = trim((string) $item->title);
            }

            if (preg_match('/^\d+$/', $build) !== 1 || preg_match('/^\d+(\.\d+)*$/', $version) !== 1 || (int) $build < $latestBuild) {
                continue;
            }

            $archive = self::archive($item);

            if ((int) $build === $latestBuild) {
                if ($archive !== null && $latest !== null && $latest['version'] === $version) {
                    $archives[] = $archive;
                }

                continue;
            }

            $minimum = trim((string) $sparkle->minimumSystemVersion);
            $latestBuild = (int) $build;
            $archives = $archive !== null ? [$archive] : [];
            $latest = [
                'version' => $version,
                'publishedAt' => self::date(trim((string) $item->pubDate)),
                'minimumSystemVersion' => $minimum !== '' ? $minimum : null,
            ];
        }

        return $latest !== null ? [...$latest, 'archives' => $archives] : null;
    }

    private static function archive(SimpleXMLElement $item): ?string
    {
        $path = parse_url(trim((string) $item->enclosure['url']), PHP_URL_PATH);
        $name = is_string($path) ? rawurldecode(basename($path)) : '';

        return $name !== '' ? $name : null;
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
