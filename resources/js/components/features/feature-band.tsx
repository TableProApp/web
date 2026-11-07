import type { ReactNode } from 'react';
import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { AlsoAnchors, PartDetails, PartText, PlanPills, type PartContext } from './feature-part';
import type { FeatureBand as Band } from './types';

const WINDOW_SIZES = '(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

interface BandFrameProps {
    id: string;
    // Ids of old sections that now land on this band.
    also?: string[];
    title: ReactNode;
    // Under the title: a plan pill, a release badge.
    marker?: ReactNode;
    asset?: string;
    assetClassName?: string;
    // A right column beside the text from 1024px, under it below: an /ios band's iPhone.
    beside?: ReactNode;
    // Under the text, as wide as the three quarters it sits in: a /security table.
    after?: ReactNode;
    children: ReactNode;
}

// The Home index grid that feature and database pages share: the name in the left quarter, the text beside it, the
// whole window below.
export function BandFrame({ id, also, title, marker, asset, assetClassName, beside, after, children }: BandFrameProps) {
    const shown = useShownSlot();
    const slot = asset !== undefined ? shown(asset) : null;

    return (
        <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 py-12 md:py-16">
            <AlsoAnchors part={{ id, also }} />
            <Container>
                <div className="grid gap-5 md:grid-cols-12 md:gap-x-8">
                    <div className="md:col-span-4 lg:col-span-3">
                        <h2 id={`${id}-title`} className="text-[1.5rem] leading-[1.15] font-[520] tracking-[-0.022em] text-balance text-foreground md:text-[1.75rem]">
                            {title}
                        </h2>
                        {marker}
                    </div>
                    <div className={cn('max-w-[42rem] md:col-span-8', beside === undefined ? 'lg:col-span-9' : 'lg:col-span-5')}>{children}</div>
                    {beside !== undefined && <div className="mt-5 md:col-span-8 md:col-start-5 lg:col-span-4 lg:col-start-auto lg:mt-0">{beside}</div>}
                    {after !== undefined && <div className="mt-3 min-w-0 md:col-span-8 md:col-start-5 lg:col-span-9 lg:col-start-4">{after}</div>}
                </div>
                {slot !== null && (
                    <div className="mt-8 md:mt-12">
                        <AssetSlot id={slot} sizes={WINDOW_SIZES} caption={false} className={assetClassName} />
                    </div>
                )}
            </Container>
        </section>
    );
}

// A band the hero window already shows has no window of its own.
export default function FeatureBand({ band, context }: { band: Band; context: PartContext }) {
    return (
        <BandFrame id={band.id} also={band.also} title={band.title} marker={<PlanPills paid={band.paid} labels={context.labels} className="mt-3" />} asset={band.asset}>
            <PartText part={band} values={context.values} className="text-[1.0625rem] leading-[1.55] tracking-[-0.011em] text-pretty text-foreground" />
            <PartDetails part={band} context={context} className="mt-6" />
        </BandFrame>
    );
}
