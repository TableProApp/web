import type { ReactNode } from 'react';
import { BandFrame } from '@/components/features/feature-band';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import { entryAspect } from '@/lib/data/asset-model';
import { ASSET_MANIFEST, assetEntry, type AssetId } from '@/lib/data/assets';
import type { IosBandContent } from './types';

const PHONE_SIZES = '(min-width: 1024px) 300px, (min-width: 768px) 260px, 240px';

function upright(id: AssetId): boolean {
    const entry = assetEntry(id);
    const [width, height] = entryAspect(entry, ASSET_MANIFEST.kinds[entry.kind]).split(':').map(Number);

    return width < height;
}

// An iPhone stands in the right column beside the text; an iPad, or the sync diagram, runs the full width below it,
// like the Mac windows on feature pages. Whole screens, never cropped.
export default function IosBand({ band, children }: { band: IosBandContent; children: ReactNode }) {
    const shown = useShownSlot();
    const slot = shown(band.asset);

    if (slot !== null && upright(slot)) {
        return (
            <BandFrame
                id={band.id}
                also={band.also}
                title={band.title}
                beside={
                    <AssetSlot id={slot} sizes={PHONE_SIZES} caption={false} className="framed-device mx-auto w-full max-w-[240px] md:mx-0 md:max-w-[260px] lg:ml-auto lg:max-w-[300px]" />
                }
            >
                {children}
            </BandFrame>
        );
    }

    return (
        <BandFrame id={band.id} also={band.also} title={band.title} asset={band.asset} assetClassName={slot !== null && assetEntry(slot).kind === 'framed-device' ? 'framed-device' : undefined}>
            {children}
        </BandFrame>
    );
}
