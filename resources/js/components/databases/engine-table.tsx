import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { docsUrl, iosStatus } from './format';
import LimitsList from './limits-list';
import type { DatabaseLabels, EngineCopy, EngineSummary, HubContent } from './types';

interface EngineTableProps {
    caption: string;
    engines: EngineSummary[];
    copy: Record<string, EngineCopy>;
    table: HubContent['table'];
    labels: DatabaseLabels;
    docsBase: string | null;
}

/**
 * One category's engines on `/databases` (design-system §8.3, `EngineTable`).
 *
 * Columns: the engine (its mark and name, linked to its page or its section
 * on a family page), the query language, where the driver comes from, the
 * iPhone and iPad status, and notes. A hub-only engine has no page, so its
 * row carries its own id (`#spanner`), its limits and its setup guide.
 *
 * Below 768px the middle columns fold into the engine cell, because a table
 * is never turned into blocks (that strips its roles in Safari); the notes
 * column stays.
 */
export default function EngineTable({ caption, engines, copy, table, labels, docsBase }: EngineTableProps) {
    const { locale, m, fmt } = useI18n();

    return (
        <DataTable caption={caption} className="min-w-[20rem]">
            <thead>
                <tr>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {table.engine}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'hidden md:table-cell')}>
                        {table.queryLanguage}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'hidden md:table-cell')}>
                        {table.driver}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'hidden md:table-cell')}>
                        {table.ios}
                    </th>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {table.notes}
                    </th>
                </tr>
            </thead>
            <tbody>
                {engines.map((engine) => {
                    const docs = docsUrl(docsBase, engine.docsSlug);
                    const status = labels.ios[iosStatus(engine)];
                    const driver = labels.driver[engine.distribution];

                    return (
                        <tr key={engine.id} id={engine.page === 'hub' ? (engine.anchor ?? undefined) : undefined} className={cn(TABLE_ROW, 'scroll-mt-24')}>
                            <th scope="row" className={cn(TABLE_ROW_HEADER, 'min-w-[11rem]')}>
                                <span className="flex items-start gap-3">
                                    <DatabaseMark icon={engine.icon} monogram={engine.monogram} name={engine.name} />
                                    <span className="min-w-0">
                                        {engine.page === 'hub' ? (
                                            <span>{engine.name}</span>
                                        ) : (
                                            <LocaleLink href={engine.path} className={textLinkClasses('inline')}>
                                                {engine.name}
                                            </LocaleLink>
                                        )}
                                        {engine.release !== null && (
                                            <Badge variant="accent" className="ml-2">
                                                {fmt(labels.release, { version: engine.release })}
                                            </Badge>
                                        )}
                                        <span className="mt-1 block text-sm font-normal text-muted-foreground md:hidden">
                                            {[engine.queryLanguage, driver, `${table.ios}: ${status}`].join(' · ')}
                                        </span>
                                    </span>
                                </span>
                            </th>
                            <td className={cn(TABLE_CELL, 'hidden md:table-cell')}>{engine.queryLanguage}</td>
                            <td className={cn(TABLE_CELL, 'hidden md:table-cell')}>{driver}</td>
                            <td className={cn(TABLE_CELL, 'hidden md:table-cell')}>{status}</td>
                            <td className={cn(TABLE_CELL, 'min-w-[14rem]')}>
                                <p>{copy[engine.id]?.tagline}</p>
                                {engine.page === 'hub' && (
                                    <>
                                        <LimitsList engine={engine} copy={copy[engine.id]} number={labels.number} className="mt-2 text-sm" />
                                        {docs !== null && (
                                            <p className="mt-2">
                                                <TextLink href={docs} external hrefLang="en">
                                                    {fmt(labels.docs, { name: engine.name })}
                                                    {locale !== 'en' && ` ${m.common.englishOnly}`}
                                                </TextLink>
                                            </p>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </DataTable>
    );
}
