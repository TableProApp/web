import type { CSSProperties } from 'react';
import type { LogoSponsor } from '@/lib/data/sponsors';
import { cn } from '@/lib/utils';

// Sized by area, so a long wordmark and a square mark carry the same weight.
const AREA = { lead: 9000, homepage: 4200 } as const;
const MAX_HEIGHT = { lead: 48, homepage: 34 } as const;

// `page`: /sponsors, where the logos are the content, draws them half as large again from 640px.
export type SponsorLinkSize = 'band' | 'page';

const SCALE: Record<SponsorLinkSize, number> = { band: 1, page: 1.5 };
const WORDMARK_TEXT: Record<SponsorLinkSize, string> = { band: 'text-[1.375rem]', page: 'text-[1.375rem] sm:text-[2rem]' };
const NAME_TEXT: Record<SponsorLinkSize, string> = { band: 'text-[0.9375rem]', page: 'text-[0.9375rem] sm:text-[1.0625rem]' };

const isMark = (sponsor: LogoSponsor): boolean => sponsor.logo.width / sponsor.logo.height < 1.6;

function dimensions(sponsor: LogoSponsor, scale: number): { width: number; height: number } {
    const kind = sponsor.placement === 'lead' ? 'lead' : 'homepage';
    const ratio = sponsor.logo.width / sponsor.logo.height;
    const height = Math.min(Math.sqrt(AREA[kind] / ratio), MAX_HEIGHT[kind]) * scale;

    return { width: Math.round(height * ratio), height: Math.round(height) };
}

// No filter or recolouring ever touches a trademark (design-system §5.3.18). A dark mode logo is the sponsor's own
// file; a mark without one keeps its colours, and a wordmark without one gives way to the sponsor's name in text.
function SponsorLogo({ sponsor, size }: { sponsor: LogoSponsor; size: SponsorLinkSize }) {
    const small = dimensions(sponsor, 1);
    const large = dimensions(sponsor, SCALE[size]);
    const { logo } = sponsor;
    const style = {
        '--logo-w': `${small.width}px`,
        '--logo-h': `${small.height}px`,
        '--logo-w-sm': `${large.width}px`,
        '--logo-h-sm': `${large.height}px`,
    } as CSSProperties;

    const image = (src: string, className: string) => (
        <img
            src={src}
            alt=""
            width={large.width}
            height={large.height}
            decoding="async"
            fetchPriority="low"
            style={style}
            className={cn('h-(--logo-h) w-(--logo-w) max-w-none sm:h-(--logo-h-sm) sm:w-(--logo-w-sm)', className)}
        />
    );

    if (logo.dark !== null) {
        return (
            <>
                {image(logo.light, 'block dark:hidden')}
                {image(logo.dark, 'hidden dark:block')}
            </>
        );
    }

    if (isMark(sponsor)) {
        return image(logo.light, 'block');
    }

    return (
        <>
            {image(logo.light, 'block dark:hidden')}
            <span aria-hidden="true" translate="no" className={cn('hidden leading-none font-semibold tracking-[-0.02em] text-foreground dark:inline', WORDMARK_TEXT[size])}>
                {sponsor.name}
            </span>
        </>
    );
}

// The sponsor's logo linking to its site, named beside a square mark and for screen readers only beside a wordmark.
export default function SponsorLink({ sponsor, size = 'band' }: { sponsor: LogoSponsor; size?: SponsorLinkSize }) {
    return (
        <a href={sponsor.url} rel="sponsored noopener" className="flex items-center gap-2.5 rounded-control">
            <SponsorLogo sponsor={sponsor} size={size} />
            <span translate="no" className={isMark(sponsor) ? cn('font-medium text-foreground', NAME_TEXT[size]) : 'sr-only'}>
                {sponsor.name}
            </span>
        </a>
    );
}
