import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n, type Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { paidLines } from './availability';
import FeatureRow from './feature-row';
import RichText from './rich-text';
import type { HomeContent, HomeEngine } from './types';

interface RowLink {
    href: string;
    label: keyof Messages['nav']['featureLinks'];
}

/**
 * Where each workflow row leads, and the paid features it describes. A row
 * links every feature page its text covers, by the page's name in the
 * Features menu, so the row never says "Learn more". The paid feature ids are
 * paid-features.json's; their names and plans come from that file.
 */
const ROWS: Record<string, { links: readonly RowLink[]; paid: readonly string[]; layout: 'window' | 'detail' }> = {
    query: { links: [{ href: '/features/querying', label: 'querying' }], paid: ['query-insights', 'result-charts'], layout: 'window' },
    edit: {
        links: [
            { href: '/features/data-editing', label: 'dataEditing' },
            { href: '/features/schema#structure', label: 'schema' },
        ],
        paid: [],
        layout: 'window',
    },
    schema: { links: [{ href: '/features/schema', label: 'schema' }], paid: ['compare-sync'], layout: 'window' },
    files: { links: [{ href: '/features/import-export', label: 'importExport' }], paid: [], layout: 'window' },
    connect: { links: [{ href: '/features/connections', label: 'connections' }], paid: ['environment-variables'], layout: 'detail' },
};

interface WorkflowsSectionProps {
    content: HomeContent['workflows'];
    engines: HomeEngine[];
}

/**
 * Section 4, `#features`: "What do I do with it day to day?" (sitemap §D;
 * positioning §7 P2, P3, P5 and P1's connection sentences).
 *
 * Five rows, each a heading, two or three sentences, the paid features it
 * mentions with their plan, one image slot and a link to each feature page
 * it covers. The heading scopes the section to the Mac app. Engine, format
 * and tool names come from engines.json and facts.json, so no row types a
 * list the data already holds, and none types a count.
 *
 * The rows are cells of one grid that closes on the next join
 * (design-system §4.7).
 */
export default function WorkflowsSection({ content, engines }: WorkflowsSectionProps) {
    const { m } = useI18n();
    const shown = useShownSlot();

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

    return (
        <Section
            id="features"
            flush
            title={content.title}
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
                    const asset = shown(row.asset);

                    return (
                        <FeatureRow
                            key={row.id}
                            id={headingId}
                            title={row.title}
                            layout={config.layout}
                            media={asset !== null ? <AssetSlot id={asset} /> : null}
                        >
                            <p className="type-body text-foreground">
                                <RichText text={row.body} values={values} />
                            </p>
                            {paidLines(config.paid, m, content.paid).map((line) => (
                                <p key={line} className="type-small mt-3 text-muted-foreground">
                                    {line}
                                </p>
                            ))}
                            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                {config.links.map((link) => (
                                    <LocaleLink key={link.href} href={link.href} className={textLinkClasses('standalone')}>
                                        {m.nav.featureLinks[link.label]}
                                        <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                ))}
                            </p>
                        </FeatureRow>
                    );
                })}
            </CellGrid>
        </Section>
    );
}
