import Badge from '@/components/ui/badge';
import type { Values } from '@/i18n';
import { interpolate } from '@/i18n/core';
import type { ComparisonProduct } from '@/lib/data/comparisons';
import { featureHref, PAID_FEATURES } from '@/lib/data/paid-features';
import { citedSources } from './model';
import RichText from './rich-text';
import { SourceMarkers } from './sources';
import type { CompareLabels, CompareList } from './types';

interface ItemListProps {
    list: CompareList;
    product: ComparisonProduct;
    values: Values;
    numbers: ReadonlyMap<string, number>;
    labels: CompareLabels;
}

/**
 * A list section's body: an optional paragraph, then one sentence per item.
 *
 * An item that names a paid feature shows that feature's plan as a badge, read
 * from `paid-features.json`, and its `<link>` goes to the feature's section
 * unless the item gives its own `href`. Cited facts get source markers.
 */
export default function ItemList({ list, product, values, numbers, labels }: ItemListProps) {
    return (
        <div className="space-y-4">
            {list.intro !== '' && (
                <p className="type-body text-foreground">
                    <RichText text={list.intro} values={values} />
                </p>
            )}
            <ul className="type-body list-disc space-y-3 pl-6 text-foreground marker:text-muted-foreground">
                {list.items.map((item, index) => {
                    const feature = item.feature !== null ? (PAID_FEATURES.find((entry) => entry.id === item.feature) ?? null) : null;
                    const href = item.href ?? (feature !== null ? featureHref(feature) : null);

                    return (
                        <li key={index} className="pl-1">
                            <RichText text={item.text} values={values} href={href} />
                            <SourceMarkers productId={product.id} ids={citedSources(product, item.cite)} numbers={numbers} label={labels.cell.source} />
                            {feature !== null && (
                                <Badge variant="accent" className="ml-2 align-[0.1em]">
                                    {interpolate(labels.tierBadge, { tier: labels.tiers[feature.tier] })}
                                </Badge>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
