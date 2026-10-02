import Badge from '@/components/ui/badge';
import DataTable, { TABLE_CELL, TABLE_HEAD_CELL, TABLE_ROW, TABLE_ROW_HEADER } from '@/components/ui/data-table';
import { Availability } from '@/components/ui/glyph';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { iosPlatform, macPlatform } from '@/lib/data/platforms';
import RichText from './rich-text';
import type { AvailabilityRow, FeatureLabels } from './types';

interface AvailabilityTableProps {
    rows: AvailabilityRow[];
    labels: FeatureLabels;
    values: Record<string, string>;
}

/**
 * "Where it works" (sitemap §E.4 block 4): one row per capability on the
 * page, with its plan on the Mac and what exists of it on iPhone and iPad.
 *
 * The plan comes from `paid-features.json` by id, so a row never retypes a
 * tier; anything not listed there is free. The iPhone and iPad app has no
 * plans at all, so its column says what exists, not what it costs. Device
 * names come from `platforms.json`.
 */
export default function AvailabilityTable({ rows, labels, values }: AvailabilityTableProps) {
    const { fmt, m } = useI18n();
    const marks = { included: labels.availability.free, notIncluded: labels.availability.notAvailable };
    const mac = joinList(macPlatform().deviceNames, m.common.list);
    const ios = joinList(iosPlatform().deviceNames, m.common.list);

    return (
        <DataTable caption={labels.availability.caption} className="min-w-[36rem]">
            <thead>
                <tr>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {labels.availability.capability}
                    </th>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {mac}
                    </th>
                    <th scope="col" className={TABLE_HEAD_CELL}>
                        {ios}
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => {
                    const paid = row.paid !== undefined ? PAID_FEATURES.find((feature) => feature.id === row.paid) : undefined;

                    return (
                        <tr key={row.label} className={TABLE_ROW}>
                            <th scope="row" className={TABLE_ROW_HEADER}>
                                <RichText text={row.label} values={values} />
                            </th>
                            <td className={TABLE_CELL}>
                                {row.mac === 'no' ? (
                                    <Availability included={false} labels={marks} />
                                ) : paid !== undefined ? (
                                    <Badge variant="accent">{fmt(labels.availability.plan, { tier: labels.tiers[paid.tier] })}</Badge>
                                ) : (
                                    labels.availability.free
                                )}
                            </td>
                            <td className={TABLE_CELL}>
                                {row.ios === 'yes' && labels.availability.free}
                                {row.ios === 'no' && <Availability included={false} labels={marks} />}
                                {row.ios === 'partial' && <RichText text={row.iosNote ?? ''} values={values} />}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </DataTable>
    );
}
