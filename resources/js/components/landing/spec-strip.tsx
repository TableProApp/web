import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';

interface Props {
    latestRelease?: { version: string | null; publishedAt: string | null; countLast30Days: number | null } | null;
}

const COLS: ColumnMap = { base: 2, sm: 3, lg: 6 };
const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

interface Spec {
    label: string;
    value: string;
    sub?: React.ReactNode;
}

function formatReleaseDate(iso: string): string {
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

/**
 * The hero's claims, restated as checkable numbers. Reads as an extension of
 * the hero, so it carries no heading of its own.
 */
export default function SpecStrip({ latestRelease }: Props) {
    const specs: Spec[] = [
        { label: 'Databases', value: '25', sub: '9 bundled · 16 on demand' },
        { label: 'Cold start', value: 'Under 1s', sub: 'Nothing to bootstrap' },
        { label: 'Idle memory', value: '~80 MB', sub: 'No JVM, no Chromium' },
        { label: 'Download', value: '~20 MB', sub: 'No runtime to install' },
        {
            label: 'License',
            value: 'AGPLv3',
            sub: (
                <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Read the source &rarr;
                </a>
            ),
        },
        {
            label: 'Latest',
            value: latestRelease?.version ? `v${latestRelease.version}` : 'Shipping',
            sub: latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : 'Weekly releases',
        },
    ];

    return (
        <section aria-label="Key specifications" className="scroll-mt-20">
            <FullLine />
            <Container>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                    {specs.map((spec, i) => (
                        <div key={spec.label} className={`p-4 sm:p-6 ${cellBorders(i, COLS, specs.length)}`}>
                            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                                {spec.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                                {spec.value}
                            </p>
                            {spec.sub && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{spec.sub}</p>}
                        </div>
                    ))}
                </div>
            </Container>
            <FullLine />

            {latestRelease?.countLast30Days ? (
                <>
                    <Container>
                        <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {latestRelease.countLast30Days} releases in the last thirty days. Development happens in the
                            open on GitHub.
                        </p>
                    </Container>
                    <FullLine />
                </>
            ) : null}
        </section>
    );
}
