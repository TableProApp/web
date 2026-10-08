import { usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n';
import { slotSupplied } from '@/lib/data/asset-model';
import { assetManifest, isAssetId, type AssetId } from '@/lib/data/assets';
import { renderAssetSlot } from './asset-slot-view';

interface AssetSlotProps {
    /** An id from resources/data/assets.json. Content-driven ids go through `isAssetId()` first. */
    id: AssetId;
    /**
     * The slot's real rendered width, only when it sits in a narrower column
     * than its kind assumes (for example an iPad capture beside a phone). The
     * kind's value is the default. Slot widths, never bare breakpoints.
     */
    sizes?: string;
    className?: string;
    /** Show the manifest caption under a supplied image. Defaults to true; placeholders never show one. */
    caption?: boolean;
    /**
     * Load this placement eagerly with high fetch priority although the entry
     * is not the homepage hero: the first image under another page's header.
     * Pass the controller's `lcpAsset` for the same id, so the head preloads it.
     */
    priority?: boolean;
}

/**
 * Every editorial image on the site goes through this one component.
 *
 * While the manifest entry's `status` is `placeholder`, it renders a labelled,
 * correctly proportioned placeholder with the asset id and a short brief, and
 * requests nothing. In production it renders nothing at all (the shared
 * `assetPlaceholders` prop), and layout that makes room for a slot asks
 * `useShownSlot()` first. When the owner supplies the files and flips `status`
 * to `supplied`, the same call renders `<picture>` with `srcset`, `sizes`,
 * dimensions, theme variants and the right loading priority. The geometry is
 * identical in both modes. See docs/visual-assets.md for the briefs.
 */
export default function AssetSlot({ id, sizes, className, caption = true, priority }: AssetSlotProps) {
    const { locale, m } = useI18n();
    const { assetPlaceholders } = usePage().props;

    return renderAssetSlot(assetManifest(locale), id, { locale, labels: m.assets, sizes, className, caption, priority, placeholders: assetPlaceholders });
}

/** Narrows an id to a slot that renders on this page; null for an unknown id, or one with no image where placeholders are off. */
export function useShownSlot(): (id: unknown) => AssetId | null {
    const { locale } = useI18n();
    const { assetPlaceholders } = usePage().props;

    return (id) => (isAssetId(id) && (assetPlaceholders || slotSupplied(assetManifest(locale), id, locale)) ? id : null);
}
