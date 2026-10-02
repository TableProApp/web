<?php

namespace App\Support\Content;

use League\CommonMark\Environment\Environment;
use League\CommonMark\Event\DocumentParsedEvent;
use League\CommonMark\Extension\Attributes\AttributesExtension;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\CommonMark\Node\Block\Heading;
use League\CommonMark\Extension\CommonMark\Node\Block\HtmlBlock;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\MarkdownConverter;
use League\CommonMark\Node\NodeIterator;
use League\CommonMark\Node\RawMarkupContainerInterface;
use League\CommonMark\Node\StringContainerHelper;
use League\CommonMark\Normalizer\SlugNormalizer;
use Phiki\Adapters\CommonMark\PhikiExtension;
use Phiki\Theme\Theme;

/**
 * Turns the site's markdown (blog posts, legal pages) into HTML.
 *
 * Extracted from `BlogService::renderMarkdown()`, with the same CommonMark,
 * GitHub-flavoured and Phiki setup, plus two things the localized site needs:
 *
 * - **Locale-stable heading ids.** The CommonMark Attributes extension lets a
 *   heading carry its own id, `## Cookies {#cookies}`, so `/privacy#cookies`
 *   and `/vi/privacy#cookies` resolve to the same section although the heading
 *   text differs. A heading without one gets a slug of its text, deduplicated
 *   against every id in the document. The caller may prefix those generated
 *   ids. Blog posts are rendered with `BLOG_ID_PREFIX`, so every `#content-…`
 *   fragment the old HeadingPermalink setup produced lands on the same heading.
 * - **`<asset-slot id="…"></asset-slot>` passes through untouched**, on a line of
 *   its own with blank lines around it. The page component splits the HTML on
 *   those blocks and renders an `AssetSlot` between the chunks, so the
 *   placeholder markup has one implementation, in React.
 *
 * Raw HTML is allowed because every markdown file is authored in this
 * repository. Attributes are limited to `id` and `class`.
 */
final class MarkdownRenderer
{
    /**
     * The prefix of every id the blog generated from heading text before this
     * renderer existed (`BlogService::renderMarkdown()` with CommonMark's
     * HeadingPermalink extension): `## Data we keep` was `#content-data-we-keep`.
     * Links to `/blog/{slug}#content-…` live outside this site, and a fragment
     * cannot be redirected, so the blog keeps the prefix.
     */
    public const BLOG_ID_PREFIX = 'content-';

    /**
     * @param  string|null  $permalinkLabel  accessible name of the `#` link placed after each h2 and h3; null for none
     * @param  string  $autoIdPrefix  prepended to ids generated from heading text; an explicit `{#id}` is used as written
     */
    public function render(string $markdown, ?string $permalinkLabel = null, string $autoIdPrefix = ''): string
    {
        $environment = new Environment([
            'html_input' => 'allow',
            'allow_unsafe_links' => false,
            'attributes' => [
                'allow' => ['id', 'class'],
            ],
        ]);

        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new AttributesExtension());
        $environment->addExtension(new PhikiExtension(theme: [
            'light' => Theme::GithubLightDefault,
            'dark' => Theme::GithubDarkDefault,
        ]));

        $environment->addEventListener(
            DocumentParsedEvent::class,
            fn(DocumentParsedEvent $event) => $this->identifyHeadings($event, $permalinkLabel, $autoIdPrefix),
            -100,
        );

        $html = (string) (new MarkdownConverter($environment))->convert($markdown);

        return $this->unwrapAssetSlots($html);
    }

    /**
     * Lifts asset-slot blocks out of the paragraph CommonMark puts them in.
     *
     * A custom element opened and closed on one line is inline HTML to
     * CommonMark, so it arrives wrapped in `<p>`. The page splits on the bare
     * element, and a `<figure>` inside a `<p>` is invalid markup anyway.
     */
    private function unwrapAssetSlots(string $html): string
    {
        return (string) preg_replace(
            '#<p>\s*(<asset-slot id="[a-z0-9-]+"></asset-slot>)\s*</p>#',
            '$1',
            $html,
        );
    }

    /**
     * Gives every heading an id, and optionally a permalink after h2 and h3.
     *
     * Runs after the Attributes extension (priority 0), so an explicit `{#id}`
     * is already on the node and wins. A generated id is the prefix plus the
     * slug, numbered `-1`, `-2` on a clash, as the old blog setup numbered
     * them. A heading with no letters or digits gets the bare prefix, which is
     * also what that setup gave it, or `section` when there is no prefix.
     */
    private function identifyHeadings(DocumentParsedEvent $event, ?string $permalinkLabel, string $autoIdPrefix): void
    {
        $headings = [];

        foreach ($event->getDocument()->iterator(NodeIterator::FLAG_BLOCKS_ONLY) as $node) {
            if ($node instanceof Heading) {
                $headings[] = $node;
            }
        }

        $used = [];

        foreach ($headings as $heading) {
            $explicit = $heading->data->get('attributes/id', null);

            if (is_string($explicit) && $explicit !== '') {
                $used[$explicit] = true;
            }
        }

        $normalizer = new SlugNormalizer();

        foreach ($headings as $heading) {
            $id = $heading->data->get('attributes/id', null);

            if (! is_string($id) || $id === '') {
                $text = StringContainerHelper::getChildText($heading, [RawMarkupContainerInterface::class]);
                $slug = $normalizer->normalize($text);
                $base = $slug === '' && $autoIdPrefix === '' ? 'section' : $autoIdPrefix . $slug;
                $id = $base;

                for ($n = 1; isset($used[$id]); $n++) {
                    $id = $base . '-' . $n;
                }

                $used[$id] = true;
                $heading->data->set('attributes/id', $id);
            }

            if ($permalinkLabel !== null && in_array($heading->getLevel(), [2, 3], true)) {
                $link = new HtmlBlock(HtmlBlock::TYPE_6_BLOCK_ELEMENT);
                $link->setLiteral(sprintf(
                    '<a class="heading-permalink" href="#%s" aria-label="%s">#</a>',
                    htmlspecialchars($id, ENT_QUOTES),
                    htmlspecialchars($permalinkLabel, ENT_QUOTES),
                ));

                $heading->insertAfter($link);
            }
        }
    }
}
