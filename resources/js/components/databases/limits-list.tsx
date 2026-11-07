import { useI18n } from '@/i18n';
import { formatNumber } from '@/i18n/format';
import { cn } from '@/lib/utils';
import type { DatabaseLabels, EngineCopy, EngineDetail } from './types';

interface LimitsListProps {
    engine: Pick<EngineDetail, 'limits'>;
    copy: EngineCopy | undefined;
    number: DatabaseLabels['number'];
    className?: string;
}

// One sentence per `limits[]` entry of engines.json, in data order, from `content/{locale}/engines.json`, with
// `{value}` filled from data. Nothing is softened, and a limit with no sentence is left out rather than shown as an id
// (EnginesDataTest fails on it first).
export default function LimitsList({ engine, copy, number, className }: LimitsListProps) {
    const { fmt } = useI18n();
    const items = engine.limits.filter((limit) => typeof copy?.limits[limit.id] === 'string');

    if (items.length === 0) {
        return null;
    }

    return (
        <ul className={cn('space-y-1.5', className)}>
            {items.map((limit) => (
                <li key={limit.id}>{fmt(copy?.limits[limit.id] ?? '', limit.value === null ? {} : { value: formatNumber(limit.value, number) })}</li>
            ))}
        </ul>
    );
}
