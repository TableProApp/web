import { useI18n } from '@/i18n';
import { formatNumber } from '@/i18n/format';
import { cn } from '@/lib/utils';
import type { DatabaseLabels, EngineCopy, EngineSummary } from './types';

interface LimitsListProps {
    engine: Pick<EngineSummary, 'limits'>;
    copy: EngineCopy | undefined;
    number: DatabaseLabels['number'];
    className?: string;
}

/**
 * An engine's limits (sitemap §E.1 block 9): one item per `limits[]` entry in
 * engines.json, in data order, each with its sentence from
 * `content/{locale}/engines.json`. A number in the sentence arrives as
 * `{value}` from data. Nothing is softened or summarised, and a limit whose
 * sentence is missing is left out rather than shown as an id (the data test
 * fails on it first).
 */
export default function LimitsList({ engine, copy, number, className }: LimitsListProps) {
    const { fmt } = useI18n();
    const items = engine.limits.filter((limit) => typeof copy?.limits[limit.id] === 'string');

    if (items.length === 0) {
        return null;
    }

    return (
        <ul className={cn('type-body list-disc space-y-2 pl-6 text-foreground marker:text-muted-foreground', className)}>
            {items.map((limit) => (
                <li key={limit.id} className="pl-1">
                    {fmt(copy?.limits[limit.id] ?? '', limit.value === null ? {} : { value: formatNumber(limit.value, number) })}
                </li>
            ))}
        </ul>
    );
}
