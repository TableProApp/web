import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import { AlsoAnchors, PartDetails, PartText, PlanPills, type PartContext } from './feature-part';
import type { FeatureBand as Band } from './types';

const WINDOW_SIZES = '(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

// One main sub-feature on the Home index grid: its name in the left quarter, a few sentences beside it, the whole
// window below. A band the hero window already shows has no window of its own.
export default function FeatureBand({ band, context }: { band: Band; context: PartContext }) {
    const shown = useShownSlot();
    const asset = band.asset !== undefined ? shown(band.asset) : null;

    return (
        <section id={band.id} aria-labelledby={`${band.id}-title`} className="scroll-mt-16 py-12 md:py-16">
            <AlsoAnchors part={band} />
            <Container>
                <div className="grid gap-5 md:grid-cols-12 md:gap-x-8">
                    <div className="md:col-span-4 lg:col-span-3">
                        <h2 id={`${band.id}-title`} className="text-[1.5rem] leading-[1.15] font-[520] tracking-[-0.022em] text-balance text-foreground md:text-[1.75rem]">
                            {band.title}
                        </h2>
                        <PlanPills paid={band.paid} labels={context.labels} className="mt-3" />
                    </div>
                    <div className="max-w-[42rem] md:col-span-8 lg:col-span-9">
                        <PartText part={band} values={context.values} className="text-[1.0625rem] leading-[1.55] tracking-[-0.011em] text-pretty text-foreground" />
                        <PartDetails part={band} context={context} className="mt-6" />
                    </div>
                </div>
                {asset !== null && (
                    <div className="mt-8 md:mt-12">
                        <AssetSlot id={asset} sizes={WINDOW_SIZES} caption={false} />
                    </div>
                )}
            </Container>
        </section>
    );
}
