<?php

namespace App\Support\Content;

use App\Support\Assets\AssetManifest;
use App\Support\Localization\LocalizedUrl;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\CommonMark\Node\Block\FencedCode;
use League\CommonMark\Extension\CommonMark\Node\Block\IndentedCode;
use League\CommonMark\Node\NodeIterator;
use League\CommonMark\Parser\MarkdownParser;

// The markdown version of a page (llmstxt.org): the authored markdown without
// the syntax only this site's renderer understands.
final class MarkdownExport
{
    private const HEADING_ID = '/^( {0,3}#{1,6}\s.*?)\s*\{#[A-Za-z0-9_-]+\}\s*$/';

    private const ASSET_SLOT = '/^<asset-slot id="([a-z0-9-]+)"><\/asset-slot>$/';

    public function __construct(
        private readonly AssetManifest $assets,
    ) {}

    /**
     * @param  list<string>  $notes  markdown blocks the page shows between its title and its body
     */
    public function document(string $title, string $description, array $notes, string $body): string
    {
        $blocks = ['# ' . $title];

        if ($description !== '') {
            $blocks[] = '> ' . $description;
        }

        return implode("\n\n", [...$blocks, ...$notes, trim($body)]) . "\n";
    }

    // A titled note, as the page's Callout shows it.
    public function callout(string $title, string $text): string
    {
        return '> **' . $title . "**\n>\n> " . $text;
    }

    /**
     * @param  list<string>  $markers  lines the page replaces with a control, dropped here
     */
    public function body(string $markdown, string $locale, array $markers = []): string
    {
        $code = $this->codeLines($markdown);
        $lines = [];
        $dropped = false;

        foreach (explode("\n", $markdown) as $index => $line) {
            if (isset($code[$index + 1])) {
                $lines[] = $line;
                $dropped = false;

                continue;
            }

            $trimmed = trim($line);

            if (preg_match(self::ASSET_SLOT, $trimmed, $slot) === 1) {
                $line = $this->image($slot[1], $locale);
            } elseif (in_array($trimmed, $markers, true)) {
                $line = null;
            } else {
                $line = (string) preg_replace(self::HEADING_ID, '$1', $line);
            }

            if ($line === null) {
                $dropped = true;

                continue;
            }

            // A dropped line leaves its blank lines on both sides; keep one.
            if ($dropped && trim($line) === '' && $lines !== [] && trim(end($lines)) === '') {
                continue;
            }

            $lines[] = $line;
            $dropped = $dropped && trim($line) === '';
        }

        return implode("\n", $lines);
    }

    // What production renders for a slot: the supplied image as the page's
    // `<img>` loads it, or nothing for a placeholder.
    private function image(string $id, string $locale): ?string
    {
        $sources = $this->assets->has($id) ? $this->assets->themedSources($id, $locale) : null;

        if ($sources === null) {
            return null;
        }

        [$themed, $fileLocale] = $sources;
        $light = $themed['light'];
        $format = $light['formats'][array_key_last($light['formats'])];
        $width = $light['widths'] === [] ? null : max($light['widths']);
        $url = LocalizedUrl::base() . $this->assets->fileUrl($id, 'light', $fileLocale, $width, $format);

        $text = $this->assets->slotTextProjection($locale)[$id] ?? [];
        $alt = is_array($text['alt'] ?? null) ? (string) reset($text['alt']) : '';
        $caption = is_array($text['caption'] ?? null) ? (string) reset($text['caption']) : '';

        $image = '![' . str_replace(['[', ']'], ['\[', '\]'], $alt) . '](' . $url . ')';

        return $caption === '' ? $image : $image . "\n\n" . $caption;
    }

    /**
     * @return array<int, true>
     */
    private function codeLines(string $markdown): array
    {
        $environment = new Environment();
        $environment->addExtension(new CommonMarkCoreExtension());

        $lines = [];

        foreach ((new MarkdownParser($environment))->parse($markdown)->iterator(NodeIterator::FLAG_BLOCKS_ONLY) as $node) {
            if (! $node instanceof FencedCode && ! $node instanceof IndentedCode) {
                continue;
            }

            for ($line = (int) $node->getStartLine(); $line <= (int) $node->getEndLine(); $line++) {
                $lines[$line] = true;
            }
        }

        return $lines;
    }
}
