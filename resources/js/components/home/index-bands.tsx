import type { ReactNode } from 'react';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
import type { LogoSponsor } from '@/lib/data/sponsors';
import { SPONSORS } from '@/lib/data/sponsors';
import { onHomepage, openSlots } from '@/lib/sponsors';
import { cn } from '@/lib/utils';
import type { HomeContent, HomeEngine } from './types';

const LINK = 'text-sm leading-[1.3] font-medium text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// An index entry: a small label in the left quarter, the content in the rest. The databases, the sponsors and the
// closing open source band share it, so the page opens and ends on the same grid.
export function Band({ id, title, aside, children, className }: { id: string; title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className={cn('py-10 md:py-14', className)}>
            <Container>
                <div className="grid gap-6 md:grid-cols-12 md:gap-x-8">
                    <div className="flex items-baseline justify-between gap-6 md:col-span-3 md:flex-col md:justify-start md:gap-3">
                        <h2 id={`${id}-title`} className="text-sm leading-[1.3] font-medium tracking-[-0.006em] text-muted-foreground">
                            {title}
                        </h2>
                        {aside}
                    </div>
                    <div className="md:col-span-9">{children}</div>
                </div>
            </Container>
        </section>
    );
}

// The featured engines as words, not marks: each name links to its page, and "and more" to the hub.
export function DatabaseBand({ content, engines }: { content: HomeContent['databases']; engines: HomeEngine[] }) {
    return (
        <Band id="databases" title={content.title}>
            <ul className="text-[1.75rem] leading-[1.25] font-[480] tracking-[-0.025em] text-balance md:text-[2.25rem] xl:text-[2.5rem]">
                {engines
                    .filter((engine) => engine.featured)
                    .map((engine) => (
                        <li key={engine.id} className="mr-[0.55em] inline-block whitespace-nowrap">
                            <LocaleLink
                                href={engine.path}
                                className="text-foreground decoration-rule-strong decoration-2 underline-offset-[0.18em] transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:underline"
                            >
                                {engine.name}
                            </LocaleLink>
                        </li>
                    ))}
                {/* Engine names never break; "and more" may, since some languages say it in several words. */}
                <li className="inline">
                    <LocaleLink href="/databases" className="text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground">
                        {content.more}
                    </LocaleLink>
                </li>
            </ul>
        </Band>
    );
}

// Sized by area, so a long wordmark and a square mark carry the same weight.
const AREA = { lead: 9000, homepage: 4200 } as const;
const MAX_HEIGHT = { lead: 48, homepage: 34 } as const;

const isMark = (sponsor: LogoSponsor): boolean => sponsor.logo.width / sponsor.logo.height < 1.6;

function size(sponsor: LogoSponsor): { width: number; height: number } {
    const kind = sponsor.placement === 'lead' ? 'lead' : 'homepage';
    const ratio = sponsor.logo.width / sponsor.logo.height;
    const height = Math.min(Math.sqrt(AREA[kind] / ratio), MAX_HEIGHT[kind]);

    return { width: Math.round(height * ratio), height: Math.round(height) };
}

// No filter or recolouring ever touches a trademark (design-system §5.3.18). A dark mode logo is the sponsor's own
// file; a mark without one keeps its colours, and a wordmark without one gives way to the sponsor's name in text.
function SponsorLogo({ sponsor }: { sponsor: LogoSponsor }) {
    const { width, height } = size(sponsor);
    const { logo } = sponsor;
    const image = (src: string, className?: string) => (
        <img src={src} alt="" width={width} height={height} decoding="async" fetchPriority="low" style={{ width, height }} className={cn('max-w-none', className)} />
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
            <span aria-hidden="true" translate="no" className="hidden text-[1.375rem] leading-none font-semibold tracking-[-0.02em] text-foreground dark:inline">
                {sponsor.name}
            </span>
        </>
    );
}

export function SponsorBand({ content }: { content: HomeContent['sponsors'] }) {
    const { plural } = useI18n();
    const open = openSlots(SPONSORS);

    return (
        <Band
            id="sponsors"
            title={content.title}
            aside={
                <LocaleLink href="/sponsors" className="grid gap-1">
                    <span className={LINK}>{content.invite.title}</span>
                    {open > 0 && <span className="type-caption text-muted-foreground">{plural(content.invite.open, open, { total: SPONSORS.homepageSlots })}</span>}
                </LocaleLink>
            }
        >
            <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-10 md:min-h-12">
                {onHomepage(SPONSORS).map((sponsor) => (
                    <li key={sponsor.id}>
                        <a href={sponsor.url} rel="sponsored noopener" className="flex items-center gap-2.5 rounded-control">
                            <SponsorLogo sponsor={sponsor} />
                            <span translate="no" className={isMark(sponsor) ? 'text-[0.9375rem] font-medium text-foreground' : 'sr-only'}>
                                {sponsor.name}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </Band>
    );
}
