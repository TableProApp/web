import type { ReactNode } from 'react';
import SponsorLink from '@/components/sponsors/sponsor-link';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { useI18n } from '@/i18n';
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

// Engines as words, not marks, each linked to its page when it has one. Names never break.
export function EngineWords({ engines, children }: { engines: { id: string; name: string; href: string | null }[]; children?: ReactNode }) {
    return (
        <ul className="text-[1.75rem] leading-[1.25] font-[480] tracking-[-0.025em] text-balance md:text-[2.25rem] xl:text-[2.5rem]">
            {engines.map((engine) => (
                <li key={engine.id} className="mr-[0.55em] inline-block whitespace-nowrap">
                    {engine.href !== null ? (
                        <LocaleLink
                            href={engine.href}
                            className="text-foreground decoration-rule-strong decoration-2 underline-offset-[0.18em] transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:underline"
                        >
                            {engine.name}
                        </LocaleLink>
                    ) : (
                        <span className="text-foreground">{engine.name}</span>
                    )}
                </li>
            ))}
            {children}
        </ul>
    );
}

// The featured engines, and "and more" to the hub.
export function DatabaseBand({ content, engines }: { content: HomeContent['databases']; engines: HomeEngine[] }) {
    return (
        <Band id="databases" title={content.title}>
            <EngineWords engines={engines.filter((engine) => engine.featured).map((engine) => ({ id: engine.id, name: engine.name, href: engine.path }))}>
                {/* "And more" may break, since some languages say it in several words. */}
                <li className="inline">
                    <LocaleLink href="/databases" className="text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground">
                        {content.more}
                    </LocaleLink>
                </li>
            </EngineWords>
        </Band>
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
                        <SponsorLink sponsor={sponsor} />
                    </li>
                ))}
            </ul>
        </Band>
    );
}
