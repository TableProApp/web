<?php

namespace App\Support\Seo;

use RuntimeException;

/**
 * The site's font faces, inlined for the Open Graph card templates.
 *
 * Cards render through headless Chromium from a temporary file, which cannot
 * load fonts from disk (a `file://` page fetching a `file://` font is a
 * cross-origin request). Without embedded faces, a card made on the Linux CI
 * runner would fall back to whatever sans-serif the runner has, Vietnamese
 * diacritics included.
 *
 * So this reads the shared `resources/css/fonts.css`, the same hand-ordered
 * faces and unicode ranges the site loads, and replaces each `url(…)` with a
 * base64 data URI. The card and the page cannot drift apart, and nothing is
 * copied. The font files come from `node_modules`, so `npm ci` must have run.
 */
final class OgFonts
{
    public const CJK = ['ja', 'ko', 'zh-Hans', 'zh-Hant'];

    public function __construct(
        private readonly string $stylesheet,
        private readonly ?string $cjkDirectory = null,
    ) {}

    /**
     * The `Card CJK` faces of a locale, from the directory `scripts/assets/prepare_fonts.py` fills.
     * Empty without that directory: the card then uses the Noto Sans CJK the machine has.
     */
    public function cjk(string $locale): string
    {
        if ($this->cjkDirectory === null || ! in_array($locale, self::CJK, true)) {
            return '';
        }

        $faces = '';

        foreach ([500, 600] as $weight) {
            $path = rtrim($this->cjkDirectory, '/') . "/noto-{$locale}-{$weight}.otf";

            if (! is_file($path)) {
                throw new RuntimeException("{$path} is missing. Run `python3 scripts/assets/prepare_fonts.py {$this->cjkDirectory}`.");
            }

            // By path, not inlined: each face is 16 MB. The renderer lets a file:// page read file:// fonts.
            $faces .= "@font-face { font-family: 'Card CJK'; font-weight: {$weight}; src: url('file://{$path}') format('opentype'); }\n";
        }

        return $faces;
    }

    /**
     * The `@font-face` rules, with every font file inlined.
     *
     * @throws RuntimeException when the stylesheet or a font file is missing
     */
    public function css(): string
    {
        if (! is_file($this->stylesheet)) {
            throw new RuntimeException("{$this->stylesheet} is missing.");
        }

        $css = (string) preg_replace('#/\*.*?\*/#s', '', (string) file_get_contents($this->stylesheet));
        $directory = dirname($this->stylesheet);

        return trim((string) preg_replace_callback(
            '/url\(\s*(["\']?)([^"\')]+)\1\s*\)/',
            fn(array $match): string => $this->inline($directory, $match[2]),
            $css,
        ));
    }

    private function inline(string $directory, string $reference): string
    {
        if (str_starts_with($reference, 'data:')) {
            return 'url("' . $reference . '")';
        }

        $path = str_starts_with($reference, '/') ? $reference : $directory . '/' . $reference;

        if (! is_file($path)) {
            throw new RuntimeException("Font file {$reference} is missing. Run `npm ci`: the OG cards embed the site's fonts from node_modules.");
        }

        $mime = match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'woff2' => 'font/woff2',
            'woff' => 'font/woff',
            'ttf' => 'font/ttf',
            default => 'application/octet-stream',
        };

        return 'url("data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($path)) . '")';
    }
}
