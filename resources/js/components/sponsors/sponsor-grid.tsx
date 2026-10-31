import type { ReactNode } from 'react';
import CellGrid from '@/components/ui/cell-grid';
import type { LogoSponsor, SponsorLogo } from '@/lib/data/sponsors';
import { cn } from '@/lib/utils';

// tests/Feature/Data/SponsorsDataTest.php reads both heights to keep raster logos near the size they are drawn at.
const LOGO_HEIGHT = 28;
const LEAD_LOGO_HEIGHT = 44;

// Eager at low priority: a lazy logo that arrived late left its white dark-mode tile empty, which read as a broken image.
function Logo({ logo, lead }: { logo: SponsorLogo; lead: boolean }) {
    const height = lead ? LEAD_LOGO_HEIGHT : LOGO_HEIGHT;
    const width = Math.round((height * logo.width) / logo.height);
    const image = (src: string, className: string) => (
        <img
            src={src}
            alt=""
            width={width}
            height={height}
            decoding="async"
            fetchPriority="low"
            className={cn(lead ? 'h-11' : 'h-7', 'w-auto max-w-full object-contain', className)}
        />
    );

    // No filter ever alters a trademark: without its own dark file, a logo sits on a white tile, padded in both themes so nothing moves.
    return (
        <span aria-hidden="true" className={cn('inline-flex max-w-full items-center rounded-chip px-2', lead ? 'h-16' : 'h-11', logo.dark === null && 'dark:bg-[#ffffff]')}>
            {logo.dark !== null ? (
                <>
                    {image(logo.light, 'block dark:hidden')}
                    {image(logo.dark, 'hidden dark:block')}
                </>
            ) : (
                image(logo.light, 'block')
            )}
        </span>
    );
}

// Shared with the homepage's invite cell, so it lines up with the logos.
export const SPONSOR_CELL = 'min-w-0 max-w-full';
export const SPONSOR_LINK = 'group grid max-w-full justify-items-start gap-2 rounded-control';

// Two across on a phone, four from 768px. The lead spans two cells; trailing children (an invite) share the grid's lines.
export default function SponsorGrid({ sponsors, children }: { sponsors: LogoSponsor[]; children?: ReactNode }) {
    return (
        <CellGrid as="ul" density="compact" className="grid-cols-2 md:grid-cols-4">
            {sponsors.map((sponsor) => {
                const lead = sponsor.placement === 'lead';

                return (
                    <li key={sponsor.id} className={cn(SPONSOR_CELL, lead && 'col-span-2')}>
                        <a href={sponsor.url} rel="sponsored noopener" className={SPONSOR_LINK}>
                            <Logo logo={sponsor.logo} lead={lead} />
                            <span
                                translate="no"
                                className="type-small text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) group-hover:text-foreground"
                            >
                                {sponsor.name}
                            </span>
                        </a>
                    </li>
                );
            })}
            {children}
        </CellGrid>
    );
}
