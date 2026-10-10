<?php

namespace App\Services\Legal;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentMissingException;
use App\Support\Content\MarkdownRenderer;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\File;
use InvalidArgumentException;
use RuntimeException;
use Spatie\YamlFrontMatter\YamlFrontMatter;

/**
 * The privacy policy, terms, refund policy and brand guidelines, read from
 * `resources/data/legal/{locale}/{document}.md`.
 *
 * Each file has front matter (`title`, `description`, `updatedAt`) and a
 * markdown body whose headings all carry an explicit id (`## Cookies
 * {#cookies}`), so a link to `/privacy#cookies` lands on the same section in
 * both languages.
 *
 * Facts enter the prose only through `{token}` slots filled from
 * `resources/data` (the refund window from `pricing.json`, the support
 * address, the licence URL and the publisher from `facts.json`, …), so a
 * number, address or name in a policy cannot drift from the data the rest of
 * the site states. A token with no value is an error, not a gap: the document
 * is not rendered half filled.
 *
 * `<cookie-settings></cookie-settings>` on a line of its own marks where the
 * privacy page puts its "Cookie settings" button, and `<brand-assets></brand-assets>`
 * where the brand guidelines put the logo files; the page splits the HTML on
 * it, as the blog does on `<asset-slot>`.
 */
class LegalDocuments
{
    /**
     * Route-independent document names.
     */
    public const DOCUMENTS = ['privacy', 'terms', 'refund-policy', 'brand'];

    // Published in English alone, as most open-source trademark policies are.
    public const ENGLISH_ONLY = ['brand'];

    /**
     * The marker the privacy page replaces with its consent control.
     */
    public const COOKIE_SETTINGS_MARKER = '<cookie-settings></cookie-settings>';

    public const BRAND_ASSETS_MARKER = '<brand-assets></brand-assets>';

    private const TOKEN = '/\{([a-zA-Z][a-zA-Z0-9]*)\}/';

    public function __construct(
        private readonly MarkdownRenderer $renderer,
        private readonly SiteFacts $facts,
        private readonly ?string $directory = null,
    ) {}

    public function path(string $document, string $locale): string
    {
        if (! in_array($document, self::DOCUMENTS, true) || preg_match('/^[a-z]{2}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2})?$/', $locale) !== 1) {
            throw new InvalidArgumentException("Unknown legal document [{$document}] or locale [{$locale}].");
        }

        return ($this->directory ?? resource_path('data/legal')) . '/' . $locale . '/' . $document . '.md';
    }

    public function has(string $document, string $locale): bool
    {
        return File::isFile($this->path($document, $locale));
    }

    /**
     * One document in one locale, rendered.
     *
     * @return array{title: string, description: string, updatedAt: string, updatedAtFormatted: string, html: string, toc: list<array{id: string, title: string}>}
     *
     * @throws ContentMissingException
     */
    public function render(string $document, string $locale, ?string $permalinkLabel = null): array
    {
        $path = $this->path($document, $locale);

        if (! File::isFile($path)) {
            throw new ContentMissingException("Legal document [{$document}] has no [{$locale}] version.");
        }

        $parsed = YamlFrontMatter::parse((string) File::get($path));
        $updatedAt = $this->date($parsed->matter('updatedAt'), $path);

        $html = $this->renderer->render($this->fill($parsed->body(), $path, $locale), $permalinkLabel);

        foreach ([self::COOKIE_SETTINGS_MARKER, self::BRAND_ASSETS_MARKER] as $marker) {
            $html = (string) preg_replace('#<p>\s*' . preg_quote($marker, '#') . '\s*</p>#', $marker, $html);
        }

        return [
            'title' => $this->fill((string) $parsed->matter('title'), $path, $locale),
            'description' => $this->fill((string) $parsed->matter('description'), $path, $locale),
            'updatedAt' => $updatedAt->toDateString(),
            'updatedAtFormatted' => $updatedAt->locale($locale)->isoFormat('LL'),
            'html' => $html,
            'toc' => $this->toc($html),
        ];
    }

    /**
     * The values a document's `{token}` slots take in a locale.
     *
     * @return array<string, string>
     */
    public function tokens(string $locale): array
    {
        $links = $this->facts->links();
        $commerce = $this->facts->commerce();
        $publisher = $this->facts->publisher($locale);

        $values = [
            'email' => $links['email'],
            'github' => $links['github'],
            'issues' => $links['issues'],
            'license' => $links['license'],
            'docs' => $links['docs'],
            'portal' => $links['portal'],
            'merchant' => $commerce['merchant'],
            'currency' => $commerce['currency'],
            'refundDays' => $commerce['refundDays'],
            'revalidateDays' => $commerce['revalidateDays'],
            'graceDays' => $commerce['graceDays'],
            'starterActivations' => $commerce['starterActivations'],
            'teamMinSeats' => $commerce['teamMinSeats'],
            'teamMaxSeats' => $commerce['teamMaxSeats'],
            'publisherName' => $publisher['name'] ?? null,
            'publisherCity' => $publisher['city'] ?? null,
            'publisherCountry' => $publisher['country'] ?? null,
        ];

        return array_map('strval', array_filter($values, static fn(mixed $value): bool => $value !== null));
    }

    /**
     * The `{token}` names a document uses in its title, description and body, sorted.
     *
     * @return list<string>
     */
    public function tokenNames(string $document, string $locale): array
    {
        $parsed = YamlFrontMatter::parse((string) File::get($this->path($document, $locale)));
        $text = $parsed->matter('title') . "\n" . $parsed->matter('description') . "\n" . $parsed->body();

        preg_match_all(self::TOKEN, $text, $matches);

        $names = array_values(array_unique($matches[1]));
        sort($names);

        return $names;
    }

    private function fill(string $body, string $path, string $locale): string
    {
        $values = $this->tokens($locale);

        return (string) preg_replace_callback(self::TOKEN, function (array $match) use ($values, $path): string {
            if (! array_key_exists($match[1], $values)) {
                throw new RuntimeException("{$path} uses {{$match[1]}}, which resources/data does not provide.");
            }

            return $values[$match[1]];
        }, $body);
    }

    /**
     * The document's sections, from its `h2` headings.
     *
     * @return list<array{id: string, title: string}>
     */
    private function toc(string $html): array
    {
        preg_match_all('#<h2 id="([^"]+)">(.*?)</h2>#s', $html, $matches, PREG_SET_ORDER);

        return array_map(static fn(array $match): array => [
            'id' => $match[1],
            'title' => trim(html_entity_decode(strip_tags($match[2]), ENT_QUOTES | ENT_HTML5)),
        ], $matches);
    }

    private function date(mixed $value, string $path): CarbonImmutable
    {
        if (is_int($value)) {
            return CarbonImmutable::createFromTimestampUTC($value)->startOfDay();
        }

        if (! is_string($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            throw new ContentMissingException("{$path} needs an updatedAt date in YYYY-MM-DD form.");
        }

        return CarbonImmutable::createFromFormat('Y-m-d', $value)->startOfDay();
    }
}
