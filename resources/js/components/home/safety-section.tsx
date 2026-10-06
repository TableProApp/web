import AssetSlot from '@/components/ui/asset-slot';
import CellGrid from '@/components/ui/cell-grid';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { devicesOf, macPlatform } from '@/lib/data/platforms';
import { paidLines, releasedIos } from './availability';
import type { HomeContent } from './types';

interface SafetySectionProps {
    content: HomeContent['safety'];
    /** The workflows' paid-plan sentence, "Requires a {tier} plan: {features}." */
    paidTemplate: string;
}

/**
 * Section 5, `#safety`: "Can I point it at production without fear?"
 * (sitemap §D; positioning §7 P4). A detail row: text in columns 1-5, the
 * Touch ID crop in columns 6-12, as two cells that close on the next join
 * (design-system §4.7).
 *
 * Stated with its limits: DROP, TRUNCATE and DELETE without WHERE ask at every
 * level, and other writes wait only at the stricter ones; Data Rewind is not a
 * backup. The level names on each platform come from facts.json, so the page
 * never counts them.
 */
export default function SafetySection({ content, paidTemplate }: SafetySectionProps) {
    const { m } = useI18n();
    const ios = releasedIos();

    return (
        <Section id="safety" title={content.title} flush>
            <CellGrid className="lg:grid-cols-12">
                <div className="flex flex-col justify-center lg:col-span-5">
                    {content.body.map((paragraph) => (
                        <p key={paragraph} className="type-body mt-3 text-foreground first:mt-0">
                            {paragraph}
                        </p>
                    ))}

                    <p className="type-small mt-6 font-medium text-foreground">
                        {content.levels}
                    </p>
                    <DescriptionList className="mt-2">
                        <DescriptionItem term={devicesOf(macPlatform(), m.common.shortList)}>
                            {joinList(
                                FACTS.safeMode.mac.levels.map((level) => level.name),
                                m.common.list,
                            )}
                        </DescriptionItem>
                        {ios !== null && (
                            <DescriptionItem term={devicesOf(ios, m.common.shortList)}>
                                {joinList(
                                    FACTS.safeMode.ios.levels.map((level) => level.name),
                                    m.common.list,
                                )}
                            </DescriptionItem>
                        )}
                    </DescriptionList>

                    {paidLines(['data-rewind'], m, paidTemplate).map((line) => (
                        <p key={line} className="type-small mt-4 text-muted-foreground">
                            {line}
                        </p>
                    ))}

                    <p className="mt-4">
                        <LocaleLink href="/features/data-editing#safe-mode" className={textLinkClasses('standalone')}>
                            {content.link}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </p>
                </div>
                <div className="flex flex-col justify-center lg:col-span-7">
                    <AssetSlot id="mac-safe-mode-touchid" />
                </div>
            </CellGrid>
        </Section>
    );
}
