import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import DatabaseMark from '@/components/ui/database-mark';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { docsUrl, iosStatus, linuxStatus } from './format';
import LimitsList from './limits-list';
import type { DatabaseLabels, EngineCopy, EngineSummary, HubContent } from './types';

interface EngineTableProps {
    caption: string;
    engines: EngineSummary[];
    copy: Record<string, EngineCopy>;
    table: HubContent['table'];
    labels: DatabaseLabels;
    docsBase: string | null;
    // The Linux column's heading, or null while Linux is not released.
    linux: string | null;
}

/** The short columns: shown from 1024px, folded into the engine cell below it. */
const WIDE_ONLY = 'hidden lg:table-cell';
/** Notes: its own column from 768px, folded into the engine cell below it. */
const MEDIUM_UP = 'hidden md:table-cell';

// Every category's table has the same fixed widths, so the columns line up from one category to the next. Below
// 1024px the short columns fold into the engine cell as one caption line, and below 768px the notes fold in too.
const WIDTHS = {
    withoutLinux: { engine: 'md:w-[38%] lg:w-[22%]', queryLanguage: 'lg:w-[13%]', driver: 'lg:w-[17%]', ios: 'lg:w-[14%]', linux: '' },
    withLinux: { engine: 'md:w-[38%] lg:w-[20%]', queryLanguage: 'lg:w-[11%]', driver: 'lg:w-[17%]', ios: 'lg:w-[12%]', linux: 'lg:w-[10%]' },
};

export default function EngineTable({ caption, engines, copy, table, labels, docsBase, linux }: EngineTableProps) {
    const { locale, m, fmt } = useI18n();
    const widths = linux !== null ? WIDTHS.withLinux : WIDTHS.withoutLinux;

    return (
        <DataTable wrapperClassName="frame-table" caption={caption} className="table-fixed">
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, widths.engine)}>
                        {table.engine}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, widths.queryLanguage)}>
                        {table.queryLanguage}
                    </th>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, widths.driver)}>
                        {table.driver}
                    </th>
                    {linux !== null && (
                        <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, widths.linux)}>
                            {linux}
                        </th>
                    )}
                    <th scope="col" className={cn(TABLE_HEAD_CELL, WIDE_ONLY, widths.ios)}>
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
                    const onLinux = labels.linux[linuxStatus(engine)];
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
                                            <DotList items={[engine.queryLanguage, driver, linux !== null && `${linux}: ${onLinux}`, `${table.ios}: ${status}`]} />
                                        </div>
                                        <div className="mt-2 font-normal md:hidden">{notes}</div>
                                    </div>
                                </div>
                            </th>
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{engine.queryLanguage}</td>
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{driver}</td>
                            {linux !== null && <td className={cn(TABLE_CELL, WIDE_ONLY)}>{onLinux}</td>}
                            <td className={cn(TABLE_CELL, WIDE_ONLY)}>{status}</td>
                            <td className={cn(TABLE_CELL, MEDIUM_UP)}>{notes}</td>
                        </tr>
                    );
                })}
            </tbody>
        </DataTable>
    );
}
