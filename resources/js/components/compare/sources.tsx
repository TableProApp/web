import type { ComparisonSource } from '@/lib/data/comparisons';
import { cn } from '@/lib/utils';
import { dateLabel, sourceAnchor } from './model';
import type { DateLabels } from './types';

interface SourceMarkersProps {
    productId: string;
    /** Source ids, in citation order. */
    ids: readonly string[];
    /** Source id → its number in the page's source list. */
    numbers: ReadonlyMap<string, number>;
    /** Read before each number: "Source" / "Nguồn". */
    label: string;
    className?: string;
}

/**
 * Superscript links from a fact to the sources it rests on (design-system
 * §5.3.13), at 12px, the type floor (a bare `<sup>` drew them at 10.5px). The
 * number stays small; an `::after` box makes the target 24px tall and 25px
 * or wider, and the 14px between neighbours keeps two targets from
 * overlapping. A source cited by several cells is one list entry, so the markers
 * carry no id of their own: two cells citing the same page would otherwise
 * give the document two elements with one id.
 */
export function SourceMarkers({ productId, ids, numbers, label, className }: SourceMarkersProps) {
    const cited = ids.filter((id) => numbers.has(id));

    if (cited.length === 0) {
        return null;
    }

    return (
        <sup className={cn('ml-0.5 inline-flex gap-3.5 text-xs font-normal', className)}>
            {cited.map((id) => (
                <a
                    key={id}
                    href={`#${sourceAnchor(productId, id)}`}
                    className="relative rounded-[2px] px-0.5 text-accent-text tabular-nums underline-offset-2 after:absolute after:-inset-x-[7px] after:-inset-y-1 after:content-[''] hover:underline"
                >
                    <span className="sr-only">{label} </span>
                    {numbers.get(id)}
                </a>
            ))}
        </sup>
    );
}

interface SourceListProps {
    productId: string;
    sources: readonly ComparisonSource[];
    dates: DateLabels;
    /** "checked {date}" / "kiểm tra ngày {date}". */
    retrievedTemplate: (date: string) => string;
    /** Names the list for assistive technology. */
    label: string;
    /** The first number, when several products' sources share one list. */
    start?: number;
    className?: string;
}

/**
 * The numbered sources of one product: each page title links out, followed by
 * the date it was checked. Numbers follow the order of the product's data, so
 * a marker keeps its number however the page orders its facts.
 */
export function SourceList({ productId, sources, dates, retrievedTemplate, label, start = 1, className }: SourceListProps) {
    if (sources.length === 0) {
        return null;
    }

    return (
        <ol
            aria-label={label}
            start={start}
            className={cn('type-small list-decimal space-y-2 pl-6 text-muted-foreground marker:tabular-nums', className)}
        >
            {sources.map((source) => (
                <li key={source.id} id={sourceAnchor(productId, source.id)} className="scroll-mt-24 pl-1">
                    <a
                        href={source.url}
                        rel="noopener"
                        className="rounded-[2px] text-foreground underline decoration-muted-foreground decoration-1 underline-offset-3 transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text hover:decoration-accent-text"
                    >
                        {source.title}
                        <span aria-hidden="true">{'\u00a0↗'}</span>
                    </a>{' '}
                    <span className="tabular-nums">({retrievedTemplate(dateLabel(dates, source.retrievedAt))})</span>
                </li>
            ))}
        </ol>
    );
}
