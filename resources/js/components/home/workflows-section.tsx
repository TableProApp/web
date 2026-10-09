import AssetSlot, { useShownSlot } from '@/components/ui/asset-slot';
import CellGrid from '@/components/ui/cell-grid';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n, type Messages } from '@/i18n';
import { joinList } from '@/i18n/format';
import { FACTS } from '@/lib/data/facts';
import { paidLines } from './availability';
import FeatureRow, { WINDOW_ROW_SIZES } from './feature-row';
import RichText from './rich-text';
import type { HomeContent, HomeEngine } from './types';

interface RowLink {
    href: string;
    label: keyof Messages['nav']['featureLinks'];
}

// A row links every feature page its text covers, by its name in the Features menu, so it never says "Learn more".
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
            lead={m.platforms.app.mac}
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
                            media={asset !== null ? <AssetSlot id={asset} sizes={config.layout === 'window' ? WINDOW_ROW_SIZES : undefined} /> : null}
                        >
                            <p className="type-body text-foreground">
                                <RichText text={row.body} values={values} />
                            </p>
                            {paidLines(row.id !== 'schema' ? [] : config.paid, m, content.paid).map((line) => (
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
