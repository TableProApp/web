import Badge from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { iosPlatform, macPlatform } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import EngineLists from './engine-lists';
import { FeatureLinkItem } from './feature-links';
import { partIds, wherePlatforms } from './model';
import RichText from './rich-text';
import type { Facts, FeatureLabels, FeaturePart } from './types';

export interface PartContext {
    labels: FeatureLabels;
    facts: Facts;
    values: Record<string, string>;
    // Linux's device names once it is released, from the server; null before.
    linux: string[] | null;
}

// The plan a paid part needs, as the plan's English name in every locale; no icon.
export function PlanPills({ paid = [], labels, className }: { paid?: string[]; labels: FeatureLabels; className?: string }) {
    const tiers = [...new Set(PAID_FEATURES.filter((feature) => paid.includes(feature.id)).map((feature) => feature.tier))];

    if (tiers.length === 0) {
        return null;
    }

    return (
        <span className={cn('inline-flex gap-1.5 align-middle', className)}>
            {tiers.map((tier) => (
                <Badge key={tier} variant="accent">
                    {labels.tiers[tier]}
                </Badge>
            ))}
        </span>
    );
}

// Old section and block ids that now land on this part.
export function AlsoAnchors({ part }: { part: Pick<FeaturePart, 'id' | 'also'> }) {
    return partIds(part)
        .slice(1)
        .map((id) => <span key={id} id={id} aria-hidden="true" className="block scroll-mt-24" />);
}

export function PartText({ part, values, className }: { part: FeaturePart; values: Record<string, string>; className?: string }) {
    return (
        <div className={cn('space-y-3', className)}>
            {part.text.map((paragraph, index) => (
                <p key={index}>
                    <RichText text={paragraph} values={values} />
                </p>
            ))}
        </div>
    );
}

// Where it runs, what differs, which engines, then the docs: quiet lines under the text.
export function PartDetails({ part, context, className }: { part: FeaturePart; context: PartContext; className?: string }) {
    const { m, fmt } = useI18n();
    const names = {
        mac: joinList(macPlatform().deviceNames, m.common.shortList),
        linux: joinList(context.linux ?? [], m.common.shortList),
        ios: joinList(iosPlatform().deviceNames, m.common.shortList),
    };
    const lines = [
        ...(part.where !== undefined
            ? [fmt(context.labels.where, { platforms: joinList(wherePlatforms(context.linux !== null ? part.where : { ...part.where, linux: 'no' }, names), m.common.list) })]
            : []),
        ...(part.notes ?? []),
    ];
    const links = [...(part.docs !== undefined ? [{ label: context.labels.docs, docs: part.docs }] : []), ...(part.links ?? [])];

    if (lines.length === 0 && (part.engines ?? []).length === 0 && links.length === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-4', className)}>
            {(lines.length > 0 || (part.engines ?? []).length > 0) && (
                <div className="space-y-1.5 text-[0.9375rem] leading-[1.5] text-muted-foreground">
                    {lines.length > 0 && (
                        <p>
                            {lines.map((line, index) => (
                                <span key={index}>
                                    {index > 0 && ' '}
                                    <RichText text={line} values={context.values} />
                                </span>
                            ))}
                        </p>
                    )}
                    <EngineLists lists={part.engines ?? []} facts={context.facts} />
                </div>
            )}
            {links.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {links.map((link) => (
                        <li key={`${link.href ?? link.docs ?? 'account'}-${link.label}`}>
                            <FeatureLinkItem link={link} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
