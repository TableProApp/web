import Badge from '@/components/ui/badge';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import { cn } from '@/lib/utils';
import type { HubRow } from './format';

interface HubGroupProps {
    id: string;
    title: string;
    rows: HubRow[];
    taglines: Record<string, string>;
    release: string;
    first: boolean;
}

// One category as the FAQ lays out a topic: the name in the left cell, a ruled list of its engines in the right one,
// whose rules run from the cell wall to the rail. Each row is the engine's name, linked to where the site describes
// it (its setup guide for an engine with no page), its query language and its tagline; two lines on a phone.
export default function HubGroup({ id, title, rows, taglines, release, first }: HubGroupProps) {
    const { locale, m, fmt } = useI18n();

    return (
        <section id={id} aria-labelledby={`${id}-title`} data-reveal className={cn('scroll-mt-16', !first && 'mt-px')}>
            <CellGrid className="lg:grid-cols-12">
                <div className="lg:col-span-3">
                    <h2 id={`${id}-title`} className="text-[1.5rem] leading-[1.15] font-[520] tracking-[-0.022em] text-balance text-foreground md:text-[1.75rem] lg:sticky lg:top-24">
                        {title}
                    </h2>
                </div>
                <div className="py-0 md:py-0 xl:py-0 lg:col-span-9">
                    <ul className="cell-rows">
                        {rows.map(({ engine, anchor }) => {
                            const docs = engine.docsSlug !== null ? `${FACTS.links.docs.replace(/\/+$/, '')}/databases/${engine.docsSlug}` : null;

                            return (
                                <li key={engine.id} id={engine.page === 'hub' ? (engine.anchor ?? undefined) : undefined} className="scroll-mt-24 border-b border-rule py-4 last:border-b-0 md:py-5">
                                    {anchor !== null && <span id={anchor} aria-hidden="true" className="block scroll-mt-24" />}
                                    <div className="grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,14rem)_minmax(0,9rem)_minmax(0,1fr)]">
                                        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[1rem] leading-[1.4] font-medium text-foreground">
                                            {engine.page !== 'hub' && engine.path !== null ? (
                                                <LocaleLink href={engine.path} className={textLinkClasses('inline')}>
                                                    {engine.name}
                                                </LocaleLink>
                                            ) : docs !== null ? (
                                                <TextLink href={docs} external hrefLang="en">
                                                    {engine.name}
                                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                                </TextLink>
                                            ) : (
                                                engine.name
                                            )}
                                            <span className="text-[0.9375rem] font-normal text-muted-foreground xl:hidden">{engine.queryLanguage}</span>
                                            {engine.release !== null && (
                                                <Badge variant="accent" className="whitespace-nowrap">
                                                    {fmt(release, { version: engine.release })}
                                                </Badge>
                                            )}
                                        </p>
                                        <p className="hidden text-[0.9375rem] leading-[1.5] text-muted-foreground xl:block">{engine.queryLanguage}</p>
                                        <p className="text-[0.9375rem] leading-[1.5] text-pretty text-muted-foreground">{taglines[engine.id]}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </CellGrid>
        </section>
    );
}
