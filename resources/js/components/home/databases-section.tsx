import Badge from '@/components/ui/badge';
import DatabaseMark from '@/components/ui/database-mark';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import type { EngineCategory } from '@/lib/data/engines';
import type { Availability } from './availability';
import type { HomeContent, HomeEngine, HomeIosEngines } from './types';

/**
 * The order the categories are listed in: the four the heading names first,
 * then the narrower ones, then the engines that open a file.
 */
const CATEGORY_ORDER: readonly EngineCategory[] = [
    'relational',
    'document',
    'key-value',
    'analytical',
    'wide-column',
    'search',
    'streaming',
    'coordination',
    'cloud',
    'files',
];

interface DatabasesSectionProps {
    content: HomeContent['databases'];
    engines: HomeEngine[];
    iosEngines: HomeIosEngines;
    availability: Availability;
    macApp: string;
}

/**
 * Section 2, `#databases`: "Does it work with the database I use?"
 * (sitemap §D; positioning §7 P1; design-system §5.3.18 EngineList).
 *
 * Names, never counts. The featured engines lead with their marks; then every
 * published engine, by category, links to where the site describes it (its own
 * page, a section of its family's page, or its row on /databases). The
 * engines the iPhone and iPad app connects to are named from platforms.json.
 * Every list here comes from engines.json through the controller.
 */
export default function DatabasesSection({ content, engines, iosEngines, availability, macApp }: DatabasesSectionProps) {
    const { m, fmt } = useI18n();
    const featured = engines.filter((engine) => engine.featured);

    const categories = CATEGORY_ORDER.map((category) => ({
        category,
        engines: engines.filter((engine) => engine.category === category),
    })).filter((group) => group.engines.length > 0);

    return (
        <Section id="databases" title={content.title} lead={fmt(content.lead, { macApp })}>
            {featured.length > 0 && (
                <ul className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
                    {featured.map((engine) => (
                        <li key={engine.id}>
                            <LocaleLink
                                href={engine.path}
                                className="flex min-h-12 items-center gap-3 rounded-control text-base font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text"
                            >
                                <DatabaseMark icon={engine.icon} monogram={engine.monogram} name={engine.name} />
                                <span className="min-w-0">{engine.name}</span>
                            </LocaleLink>
                        </li>
                    ))}
                </ul>
            )}

            <h3 className="type-h3 mt-10 text-foreground">{content.byType}</h3>
            <DescriptionList className="mt-4">
                {categories.map(({ category, engines: group }) => (
                    <DescriptionItem key={category} term={content.categories[category]}>
                        <ul className="flex flex-wrap gap-x-4 gap-y-1">
                            {group.map((engine) => (
                                <li key={engine.id} className="inline-flex items-center gap-1.5">
                                    <LocaleLink href={engine.path} className={textLinkClasses('inline')}>
                                        {engine.name}
                                    </LocaleLink>
                                    {engine.release !== null && (
                                        <Badge variant="neutral">
                                            <span aria-hidden="true">{fmt(m.platforms.release.badge, { version: engine.release })}</span>
                                            <span className="sr-only">{fmt(m.platforms.release.badgeLabel, { version: engine.release })}</span>
                                        </Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </DescriptionItem>
                ))}
            </DescriptionList>

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
