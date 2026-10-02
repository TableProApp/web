import Badge from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { PAID_FEATURES } from '@/lib/data/paid-features';
import { needsReleaseLabel, releaseLabel } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import type { FeatureLabels } from './types';

interface ReleaseBadgeProps {
    since: string | null | undefined;
}

/**
 * "0.77" next to something the oldest Mac build still on offer (Homebrew's)
 * does not have. It disappears by itself when `platforms.json` →
 * `mac.floorVersion` catches up (architecture §1.8).
 */
export function ReleaseBadge({ since }: ReleaseBadgeProps) {
    const { m, fmt } = useI18n();

    if (since === null || since === undefined || !needsReleaseLabel(since)) {
        return null;
    }

    const version = releaseLabel(since);

    return (
        <Badge variant="outline">
            <span aria-hidden="true">{fmt(m.platforms.release.badge, { version })}</span>
            <span className="sr-only">{fmt(m.platforms.release.badgeLabel, { version })}</span>
        </Badge>
    );
}

interface MarkersProps {
    /** `paid-features.json` ids, each shown with its plan. */
    paid?: string[];
    since?: string | null;
    labels: FeatureLabels;
    className?: string;
}

/**
 * The tier and release markers of a section or block (sitemap §E.4): every
 * paid feature names its plan where it is described, from data, and the copy
 * never retypes it.
 */
export default function Markers({ paid = [], since, labels, className }: MarkersProps) {
    const { fmt } = useI18n();
    const features = paid.flatMap((id) => PAID_FEATURES.filter((feature) => feature.id === id));
    const showRelease = since !== null && since !== undefined && needsReleaseLabel(since);

    if (features.length === 0 && !showRelease) {
        return null;
    }

    return (
        <p className={cn('flex flex-wrap items-center gap-2', className)}>
            {features.map((feature) => (
                <Badge key={feature.id} variant="accent">
                    {fmt(labels.paidBadge, { name: feature.name, tier: labels.tiers[feature.tier] })}
                </Badge>
            ))}
            <ReleaseBadge since={since} />
        </p>
    );
}
