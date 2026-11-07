import Badge from '@/components/ui/badge';
import { useI18n } from '@/i18n';
import { needsReleaseLabel, releaseLabel } from '@/lib/data/platforms';

interface ReleaseBadgeProps {
    since: string | null | undefined;
}

// Shown while the oldest Mac build still on offer (Homebrew's) lacks the feature; it goes away by itself when
// platforms.json `mac.floorVersion` catches up (architecture §1.8).
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
