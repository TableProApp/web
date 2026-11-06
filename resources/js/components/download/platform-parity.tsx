import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { macAvailability, platformAvailability } from '@/components/features/availability-cells';
import { factValues } from '@/components/features/model';
import RichText from '@/components/features/rich-text';
import type { AvailabilityRow } from '@/components/features/types';
import { FEATURE_PAGES } from '@/components/site/site-links';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { ParityProp } from './types';

export type ParityPlatform = 'mac' | 'ios' | 'linux';

interface PlatformParityProps {
    parity: ParityProp;
    columns: { key: ParityPlatform; name: string }[];
}

// Shown from 640px; on a phone each row's values fold into its header as caption lines.
const PLATFORM_COLUMN = 'hidden sm:table-cell';
// The platform names stay in view under the site header while the reader scrolls the rows.
const STICKY_HEAD = 'sm:sticky sm:top-16 sm:z-[2] bg-[color:var(--table-ground,var(--background))]';

function covered(row: AvailabilityRow, platform: ParityPlatform): boolean {
    if (platform === 'mac') {
        return row.mac !== 'no';
    }

    return row[platform] !== 'no';
}

// One table, so the head sticks over every group and the columns line up. A group's rows collapse behind its header
// row; the server renders the first group open and the rest closed, every row in the markup.
export default function PlatformParity({ parity, columns }: PlatformParityProps) {
    const { m, fmt } = useI18n();
    const strings = m.download.platforms;
    const { labels, groups } = parity;
    const values = factValues(parity.facts, labels.number, m.common.list);
    const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(groups.slice(0, 1).map((group) => group.slug)));

    const cell = (platform: ParityPlatform, row: AvailabilityRow, folded: boolean) => {
        if (platform === 'mac') {
            return macAvailability(row, labels, folded);
        }

        const options = { labels, values, folded, yes: strings.available, check: true };

        return platform === 'ios' ? platformAvailability(row.ios, row.iosNote, options) : platformAvailability(row.linux, row.linuxNote, options);
    };

    const toggle = (slug: string): void => {
        setOpen((current) => {
            const next = new Set(current);

            if (!next.delete(slug)) {
                next.add(slug);
            }

            return next;
        });
    };

    return (
        <DataTable wrapperClassName="frame-table overflow-visible" caption={strings.title} className="sm:table-fixed">
            <colgroup>
                <col />
                {columns.map((column) => (
                    <col key={column.key} className={columns.length > 2 ? 'sm:w-[20%] lg:w-[18%]' : 'sm:w-[26%] lg:w-[24%]'} />
                ))}
            </colgroup>
            <thead>
                <tr>
                    <th scope="col" className={cn(TABLE_HEAD_CELL, STICKY_HEAD, 'max-sm:sr-only')}>
                        {strings.capability}
                    </th>
                    {columns.map((column) => (
                        <th key={column.key} scope="col" className={cn(TABLE_HEAD_CELL, PLATFORM_COLUMN, STICKY_HEAD)}>
                            {column.name}
                        </th>
                    ))}
                </tr>
            </thead>
            {groups.map((group) => {
                const page = FEATURE_PAGES.find((each) => each.href === `/features/${group.slug}`);
                const name = page !== undefined ? m.nav.featureLinks[page.key] : group.slug;
                const expanded = open.has(group.slug);

                return (
                    <tbody key={group.slug}>
                        <tr className={TABLE_ROW}>
                            <th scope="rowgroup" colSpan={columns.length + 1} className="px-4 py-0 text-left font-normal">
                                <div className="relative flex items-center justify-between gap-x-6">
                                    <button
                                        type="button"
                                        aria-expanded={expanded}
                                        onClick={() => toggle(group.slug)}
                                        className="flex min-h-14 flex-1 cursor-pointer items-start gap-3 rounded-control py-3 text-left sm:items-center"
                                    >
                                        <ChevronRight aria-hidden="true" className={cn('mt-[0.2rem] size-4 shrink-0 text-muted-foreground sm:mt-0', expanded && 'rotate-90')} />
                                        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
                                            <span className="text-base leading-[1.4] font-semibold text-foreground max-sm:pr-28">{name}</span>
                                            <span className="type-small text-muted-foreground tabular-nums">
                                                <DotList
                                                    items={columns.map((column) =>
                                                        fmt(strings.covers, {
                                                            platform: column.name,
                                                            count: group.rows.filter((row) => covered(row, column.key)).length,
                                                            total: group.rows.length,
                                                        }),
                                                    )}
                                                />
                                            </span>
                                        </span>
                                    </button>
                                    {page !== undefined && (
                                        <LocaleLink
                                            href={page.href}
                                            aria-label={fmt(strings.pageLabel, { page: name })}
                                            className={textLinkClasses('standalone', 'type-small shrink-0 max-sm:absolute max-sm:top-3 max-sm:right-0')}
                                        >
                                            {strings.page}
                                            <span aria-hidden="true">→</span>
                                        </LocaleLink>
                                    )}
                                </div>
                            </th>
                        </tr>
                        {group.rows.map((row, index) => (
                            <tr key={index} hidden={!expanded} className={cn(TABLE_ROW, 'plan-row')}>
                                <th scope="row" className={TABLE_ROW_HEADER}>
                                    <span className="block sm:pl-7">
                                        <RichText text={row.label} values={values} />
                                        <span className="type-caption mt-1.5 grid gap-1 font-normal text-muted-foreground sm:hidden">
                                            {columns.map((column) => (
                                                <span key={column.key} className="block">
                                                    {column.name}: <span className="text-foreground">{cell(column.key, row, true)}</span>
                                                </span>
                                            ))}
                                        </span>
                                    </span>
                                </th>
                                {columns.map((column) => (
                                    <td key={column.key} className={cn(TABLE_CELL, PLATFORM_COLUMN)}>
                                        {cell(column.key, row, false)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                );
            })}
        </DataTable>
    );
}
