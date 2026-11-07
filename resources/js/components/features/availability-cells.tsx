import type { ReactNode } from 'react';
import Badge from '@/components/ui/badge';
import { Availability, type AvailabilityLabels } from '@/components/ui/glyph';
import { interpolate } from '@/i18n/core';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import RichText from './rich-text';
import type { AvailabilityRow, FeatureLabels } from './types';

// A cell either stands in its own column or is folded into the row header as a caption line on a phone, where a
// lone dash would mean nothing, so a folded cell says it in words.

export function macAvailability(row: AvailabilityRow, labels: FeatureLabels, folded: boolean): ReactNode {
    const paid = row.paid !== undefined ? PAID_FEATURES.find((feature) => feature.id === row.paid) : undefined;

    if (row.mac === 'no') {
        return folded ? labels.availability.notAvailable : <Availability included={false} labels={marks(labels, labels.availability.free)} />;
    }

    if (paid !== undefined) {
        return (
            <Badge variant="accent" className="whitespace-nowrap">
                {interpolate(labels.availability.plan, { tier: labels.tiers[paid.tier] })}
            </Badge>
        );
    }

    return labels.availability.free;
}

interface PlatformAvailabilityOptions {
    labels: FeatureLabels;
    values: Record<string, string>;
    folded: boolean;
    // What `yes` reads as: "Free" on a feature page, where the column is about cost, "Available" where it is about reach.
    yes: string;
    // Draws `yes` as a check instead of the word.
    check?: boolean;
}

export function platformAvailability(state: 'yes' | 'no' | 'partial', note: string | undefined, { labels, values, folded, yes, check = false }: PlatformAvailabilityOptions): ReactNode {
    if (state === 'partial') {
        return <RichText text={note ?? ''} values={values} />;
    }

    if (folded) {
        return state === 'yes' ? yes : labels.availability.notAvailable;
    }

    if (state === 'yes' && !check) {
        return yes;
    }

    return <Availability included={state === 'yes'} labels={marks(labels, yes)} />;
}

function marks(labels: FeatureLabels, included: string): AvailabilityLabels {
    return { included, notIncluded: labels.availability.notAvailable };
}
