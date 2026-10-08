import CellGrid from '@/components/ui/cell-grid';
import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import type { Availability } from './availability';
import type { HomeCategory, HomeContent, HomeEngine, HomeIosEngines } from './types';

interface DatabasesSectionProps {
    content: HomeContent['databases'];
    engines: HomeEngine[];
    categories: HomeCategory[];
    iosEngines: HomeIosEngines;
    availability: Availability;
    macApp: string;
}

// A hyphenated compound ("key-value") stays on one line: at 390px the heading broke after the hyphen.
function unbroken(title: string) {
    return title.split(/(\p{L}+(?:-\p{L}+)+)/u).map((part, index) =>
        index % 2 === 1 ? (
            <span key={index} className="whitespace-nowrap">
                {part}
            </span>
        ) : (
            part
        ),
    );
}

/**
 * Section 2, `#databases`: "Does it work with the database I use?"
 * (sitemap §D; positioning §7 P1).
 *
 * The featured engines as a wall of cells, the number of published engines,
 * and the hub's categories as links into /databases, which owns the full
 * list. The count is the length of the data, never typed.
 */
export default function DatabasesSection({ content, engines, categories, iosEngines, availability, macApp }: DatabasesSectionProps) {
    const { m, fmt } = useI18n();
    const featured = engines.filter((engine) => engine.featured);

    return (
        <Section id="databases" title={unbroken(content.title)} lead={fmt(content.lead, { macApp })}>
            {featured.length > 0 && (
                <CellGrid as="ul" density="compact" className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {featured.map((engine) => (
                        <li key={engine.id} className="p-0">
                            <LocaleLink
                                href={engine.path}
                                className="flex h-full min-h-12 items-center gap-3 px-(--cell-bleed) py-(--cell-pad-y) text-base font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface hover:text-accent-text"
                            >
                                <DatabaseMark icon={engine.icon} monogram={engine.monogram} name={engine.name} />
                                <span className="min-w-0">{engine.name}</span>
                            </LocaleLink>
                        </li>
                    ))}
                </CellGrid>
            )}

            <p id="databases-count" className="type-body mt-8 max-w-[64ch] text-foreground">
                {fmt(content.count, { count: engines.length })}
            </p>
            <ul aria-labelledby="databases-count" className="type-small mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {categories.map((category) => (
                    <li key={category.id}>
                        <LocaleLink href={`/databases#${category.id}`} className={textLinkClasses('inline')}>
                            {category.title}
                        </LocaleLink>
                    </li>
                ))}
            </ul>

            {availability.iosDevices !== '' && iosEngines.picker.length > 0 && (
                <p className="type-body mt-6 max-w-[64ch] text-foreground">
                    {fmt(content.ios, { iosDevices: availability.iosDevices, iosEngines: joinList(iosEngines.picker, m.common.list) })}
                    {iosEngines.syncedOnly.length > 0 && (
                        <> {fmt(content.iosSynced, { syncedOnly: joinList(iosEngines.syncedOnly, m.common.list) })}</>
                    )}
                </p>
            )}

            <p className="mt-6">
                <LocaleLink href="/databases" className={textLinkClasses('standalone')}>
                    {content.link}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            </p>
        </Section>
    );
}
