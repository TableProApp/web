import { useI18n } from '@/i18n';
import { ASSET_MANIFEST, type AssetId } from '@/lib/data/assets';
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
}

/**
 * Every editorial image on the site goes through this one component.
 *
 * While the manifest entry's `status` is `placeholder`, it renders a labelled,
 * correctly proportioned placeholder with the asset id and a short brief, and
 * requests nothing. When the owner supplies the files and flips `status` to
 * `supplied`, the same call renders `<picture>` with `srcset`, `sizes`,
 * dimensions, theme variants and the right loading priority. Nothing else on
 * the page changes, and the geometry is identical in both modes, so there is
 * no layout shift. See docs/visual-assets.md for the briefs.
 */
export default function AssetSlot({ id, sizes, className, caption = true }: AssetSlotProps) {
    const { locale, m } = useI18n();

    return renderAssetSlot(ASSET_MANIFEST, id, { locale, labels: m.assets, sizes, className, caption });
}
