<?php

namespace App\Support\Content;

use Illuminate\Support\Facades\File;

/**
 * @phpstan-type Quote array{id: string, name: string, handle: string|null, platform: string, url: string, date: string, lang: string, text: string, translations: array<string, string>}
 * @phpstan-type ShownQuote array{id: string, name: string, handle: string|null, platform: string, url: string, avatar: string, lang: string, text: string, translation: string|null, translatedFrom: string|null}
 */
final class Testimonials
{
    public const int SHOWN = 6;

    /**
     * @var list<Quote>|null
     */
    private ?array $quotes = null;

    /**
     * The quotes a page in this locale shows: those written in its language first, then the rest in data order.
     *
     * @return list<ShownQuote>
     */
    public function forLocale(string $locale): array
    {
        $quotes = $this->quotes();
        $own = array_filter($quotes, fn(array $quote): bool => self::sameLanguage($quote['lang'], $locale));
        $other = array_filter($quotes, fn(array $quote): bool => ! self::sameLanguage($quote['lang'], $locale));
        $shown = array_slice([...$own, ...$other], 0, self::SHOWN);

        return array_map(fn(array $quote): array => $this->present($quote, $locale), $shown);
    }

    // zh-Hant readers read a zh-Hans quote as written; the lang attribute picks the glyphs.
    public static function sameLanguage(string $quoteLang, string $locale): bool
    {
        return self::language($quoteLang) === self::language($locale);
    }

    private static function language(string $tag): string
    {
        return strtolower(explode('-', $tag)[0]);
    }

    /**
     * @param  Quote  $quote
     * @return ShownQuote
     */
    private function present(array $quote, string $locale): array
    {
        $translated = ! self::sameLanguage($quote['lang'], $locale);

        return [
            'id' => $quote['id'],
            'name' => $quote['name'],
            'handle' => $quote['handle'],
            'platform' => $quote['platform'],
            'url' => $quote['url'],
            'avatar' => "/images/testimonials/{$quote['id']}.webp",
            'lang' => $quote['lang'],
            'text' => $quote['text'],
            'translation' => $translated ? ($quote['translations'][$locale] ?? null) : null,
            'translatedFrom' => $translated ? self::language($quote['lang']) : null,
        ];
    }

    /**
     * @return list<Quote>
     */
    private function quotes(): array
    {
        if ($this->quotes === null) {
            /** @var array{quotes: list<Quote>} $data */
            $data = File::json(resource_path('data/testimonials.json'), JSON_THROW_ON_ERROR);
            $this->quotes = $data['quotes'];
        }

        return $this->quotes;
    }
}
