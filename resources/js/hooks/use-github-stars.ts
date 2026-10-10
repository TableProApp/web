import { usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n';
import { compactCount } from '@/i18n/format';

export interface GitHubStars {
    count: string;
    label: string;
}

export function useGitHubStars(): GitHubStars | null {
    const { m, plural } = useI18n();
    const stars = usePage().props.github?.stars ?? null;

    if (stars === null) {
        return null;
    }

    const count = compactCount(stars);

    return { count, label: plural(m.nav.githubStars, stars, { count }) };
}
