import AssetSlot from '@/components/ui/asset-slot';
import ProseArticle from '@/components/ui/prose-article';
import { messagesFor, type Locale } from '@/i18n';
import { isAssetId } from '@/lib/data/assets';
import { cn } from '@/lib/utils';
import { labelPermalinks, splitArticle } from './article-body';

interface ArticleProps {
    /** The post's HTML from `BlogService::html()`. */
    html: string;
    /** The language the post is written in. */
    locale: Locale;
    className?: string;
}

/**
 * A post's body: prose, with each `<asset-slot>` block replaced by its
 * `AssetSlot`.
 *
 * Each run of prose between two figures is its own `ProseArticle`, and the
 * figures sit between them at the full 704px column, where a capture links
 * its widest file (`renderAssetSlot`). The wrapper is a plain block, so the
 * prose's own margins collapse against a figure's the way they would inside
 * one article. A slot id the manifest does not know renders nothing;
 * AssetManifestTest fails on it first.
 *
 * Permalinks are named in the post's own language, like the rest of it.
 */
export default function Article({ html, locale, className }: ArticleProps) {
    const parts = splitArticle(labelPermalinks(html, messagesFor(locale).a11y.permalink));

    return (
        <div lang={locale} className={cn('max-w-[44rem]', className)}>
            {parts.map((part, index) =>
                part.kind === 'html' ? (
                    <ProseArticle key={index} html={part.html} />
                ) : isAssetId(part.id) ? (
                    <AssetSlot key={index} id={part.id} className="my-8" />
                ) : null,
            )}
        </div>
    );
}
