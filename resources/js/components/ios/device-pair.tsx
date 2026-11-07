import type { CSSProperties } from 'react';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';

const IPHONE_SIZES = '(min-width: 1280px) 237px, (min-width: 768px) 19.5vw, 240px';

// The iPad and the iPhone front-on in Apple's frames, at their real relative size (the iPhone is 0.2576 of the
// landscape iPad's width) on one baseline with a gap, so neither hides the other. A phone shows the iPhone alone. Each
// settles in once on load, like Home's devices; reduced motion stops it.
export default function DevicePair({ ipadSizes }: { ipadSizes: string }) {
    const shown = useShownSlot();

    return (
        <div className="flex items-end justify-center gap-[5%]">
            {shown('ios-hero-ipad') !== null && (
                <div style={{ '--settle-delay': '80ms' } as CSSProperties} className="hidden w-[75.54%] md:block">
                    {/* Lazy, so a phone, which hides it, never fetches it; `lcpAsset` preloads it from 768px. */}
                    <AssetSlot id="ios-hero-ipad" sizes={ipadSizes} caption={false} className="hero-device" />
                </div>
            )}
            {shown('ios-hero-iphone') !== null && (
                <div style={{ '--settle-delay': '240ms' } as CSSProperties} className="w-full max-w-[240px] md:w-[19.46%] md:max-w-none">
                    <AssetSlot id="ios-hero-iphone" sizes={IPHONE_SIZES} caption={false} priority className="hero-device" />
                </div>
            )}
        </div>
    );
}
