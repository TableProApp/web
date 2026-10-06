import AssetSlot from '@/components/ui/asset-slot';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n, type Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { isAssetId } from '@/lib/data/assets';
import { FACTS } from '@/lib/data/facts';
import { paidLines } from './availability';
import FeatureRow from './feature-row';
import RichText from './rich-text';
import type { HomeContent, HomeEngine } from './types';

/**
 * Where each workflow row leads, and the paid features it describes. The link
 * text is the feature page's name in the Features menu, so the row never says
 * "Learn more". The paid feature ids are paid-features.json's; their names and
 * plans come from that file.
 */
const ROWS: Record<string, { href: string; label: keyof Messages['nav']['featureLinks']; paid: readonly string[]; layout: 'window' | 'detail' }> = {
    query: { href: '/features/querying', label: 'querying', paid: ['query-insights', 'result-charts'], layout: 'window' },
    edit: { href: '/features/data-editing', label: 'dataEditing', paid: [], layout: 'window' },
    schema: { href: '/features/schema', label: 'schema', paid: ['compare-sync'], layout: 'window' },
    files: { href: '/features/import-export', label: 'importExport', paid: [], layout: 'window' },
    connect: { href: '/features/connections', label: 'connections', paid: ['environment-variables'], layout: 'detail' },
};

interface WorkflowsSectionProps {
    content: HomeContent['workflows'];
    engines: HomeEngine[];
    macApp: string;
    iosDevices: string;
}

/**
 * Section 4, `#features`: "What do I do with it day to day?" (sitemap §D;
 * positioning §7 P2, P3, P5 and P1's connection sentences).
 *
 * Five rows, each a heading, two or three sentences, the paid features it
 * mentions with their plan, one image slot and a link to its feature page.
 * Engine, format and tool names come from engines.json and facts.json, so no
 * row types a list the data already holds, and none types a count.
 *
 * The rows are cells of one grid that closes on the next join
 * (design-system §4.7).
 */
export default function WorkflowsSection({ content, engines, macApp, iosDevices }: WorkflowsSectionProps) {
    const { m, fmt } = useI18n();

    const values = {
        usersRolesEngines: joinList(
            engines.filter((engine) => engine.usersRoles).map((engine) => engine.name),
            m.common.list,
        ),
        importFormats: joinList(
            FACTS.dataImport.formats.map((format) => format.name),
            m.common.list,
        ),
        exportFormats: joinList(
            FACTS.export.formats.filter((format) => format.engines === null && format.via === null).map((format) => format.name),
            m.common.list,
        ),
        dumpTools: joinList(
            FACTS.backup.tools.filter((tool) => tool.external).map((tool) => tool.name),
            m.common.list,
        ),
    };

    const lead = iosDevices !== '' ? fmt(content.lead, { macApp, iosDevices }) : undefined;

    return (
        <Section
            id="features"
            flush
            title={content.title}
            lead={lead}
            aside={
                <LocaleLink href="/features" className={textLinkClasses('standalone')}>
                    {content.link}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
            }
        >
            <CellGrid className="lg:grid-cols-12">
                {content.rows.map((row) => {
                    const config = ROWS[row.id];

                    if (config === undefined) {
                        return null;
                    }

                    const headingId = `features-${row.id}`;

                    return (
                        <FeatureRow
                            key={row.id}
                            id={headingId}
                            title={row.title}
                            layout={config.layout}
                            media={isAssetId(row.asset) ? <AssetSlot id={row.asset} /> : null}
                        >
                            <p className="type-body text-foreground">
                                <RichText text={row.body} values={values} />
                            </p>
                            {paidLines(config.paid, m, content.paid).map((line) => (
                                <p key={line} className="type-small mt-3 text-muted-foreground">
                                    {line}
                                </p>
                            ))}
                            <p className="mt-4">
                                <LocaleLink href={config.href} className={textLinkClasses('standalone')}>
                                    {m.nav.featureLinks[config.label]}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        </FeatureRow>
                    );
                })}
            </CellGrid>
        </Section>
    );
}
