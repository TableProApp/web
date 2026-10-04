import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import DatabaseMark from '@/components/ui/database-mark';
import DotList from '@/components/ui/dot-list';
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

/** The three short columns: shown from 1024px, folded into the engine cell below it. */
const WIDE_ONLY = 'hidden lg:table-cell';
/** Notes: its own column from 768px, folded into the engine cell below it. */
const MEDIUM_UP = 'hidden md:table-cell';

/**
 * One category's engines on `/databases` (design-system §8.3, `EngineTable`).
 *
 * Columns: the engine (its mark and name, linked to its page or its section
 * on a family page), the query language, where the driver comes from, the
 * iPhone and iPad status, and notes. A hub-only engine has no page, so its
 * row carries its own id (`#spanner`), its limits and its setup guide.
 *
 * Every category's table has the same fixed column widths (`table-fixed`, set
 * on the header row), so the columns line up from one category to the next
 * and a short value is never squeezed to one word per line beside a wide
 * Notes column. Priority columns below that (design-system §5.3.10): under
 * 1024px the query language, driver and iPhone status fold into the engine
 * cell as one caption line, and under 768px the notes fold in too, so a phone
 * reads one column with nothing cut off. A table is never turned into blocks,
 * which strips its roles in Safari.
 */
export default function EngineTable({ caption, engines, copy, table, labels, docsBase }: EngineTableProps) {
    const { locale, m, fmt } = useI18n();

    return (
        <DataTable caption={caption} className="table-fixed">
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, 'md:w-[38%] lg:w-[22%]')}>
                        {table.engine}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, 'lg:w-[13%]')}>
                        {table.queryLanguage}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, 'lg:w-[17%]')}>
                        {table.driver}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, 'lg:w-[14%]')}>
                        {table.ios}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, MEDIUM_UP)}>
                        {table.notes}
                    </th>
                </tr>
            </thead>
            <tbody>
                {engines.map((engine) => {
                    const docs = docsUrl(docsBase, engine.docsSlug);
                    const status = labels.ios[iosStatus(engine)];
                    const driver = labels.driver[engine.distribution];
                    const notes = (
                        <>
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
                        </>
                    );

                    return (
                        <tr key={engine.id} id={engine.page === 'hub' ? (engine.anchor ?? undefined) : undefined} className={cn(TABLE_ROW, 'scroll-mt-24')}>
                            <th scope="row" className={TABLE_ROW_HEADER}>
                                <div className="flex items-start gap-3">
                                    <DatabaseMark icon={engine.icon} monogram={engine.monogram} name={engine.name} className="-my-1 -ml-1" />
                                    <div className="min-w-0">
                                        {engine.page === 'hub' || engine.path === null ? (
                                            <span>{engine.name}</span>
                                        ) : (
                                            <LocaleLink href={engine.path} className={textLinkClasses('inline')}>
                                                {engine.name}
                                            </LocaleLink>
                                        )}
                                        {engine.release !== null && (
                                            <Badge variant="accent" className="ml-2 whitespace-nowrap">
                                                {fmt(labels.release, { version: engine.release })}
                                            </Badge>
                                        )}
                                        <div className="type-caption mt-1 font-normal text-muted-foreground lg:hidden">
                                            <DotList items={[engine.queryLanguage, driver, `${table.ios}: ${status}`]} />
                                        </div>
                                        <div className="mt-2 font-normal md:hidden">{notes}</div>
                                    </div>
                                </div>
                            </th>
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{engine.queryLanguage}</td>
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{driver}</td>
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{status}</td>
                            <td className={cn(TABLE_CELL, MEDIUM_UP)}>{notes}</td>
                        </tr>
                    );
                })}
            </tbody>
        </DataTable>
    );
}
