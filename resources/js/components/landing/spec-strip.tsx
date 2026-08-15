import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';

interface Props {
    latestRelease?: { version: string | null; publishedAt: string | null; countLast30Days: number | null } | null;
}

const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

interface Spec {
    label: string;
    /** The SQL type the value would have. Carries the metric's unit for free. */
    type: string;
    value: string;
    sub?: ReactNode;
    /** Right-aligned, tabular. Set on anything that is a quantity. */
    numeric?: boolean;
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
 * The hero's claims, restated as a result set.
 *
 * This is a real `<table>` rather than six divs, and the change is not
 * cosmetic: a flat run of divs gives a screen reader no header association at
 * all, so the numbers arrived as an unlabelled stream. `th scope="col"` plus a
 * caption is strictly better, and it happens to be the most on-brand element
 * the page can carry — a database client's own result grid, with the column
 * types spelled out.
 *
 * Below `sm` the row transposes to label/value pairs rather than scrolling.
 * Adding a fifth unlabelled scroll container while the rest of this work is
 * busy labelling the two that exist would be a poor trade.
 */
export default function SpecStrip({ latestRelease }: Props) {
    const specs: Spec[] = [
        { label: 'databases', type: 'int', value: '25', sub: '9 bundled · 16 on demand', numeric: true },
        { label: 'cold_start', type: 'interval', value: 'Under 1s', sub: 'Nothing to bootstrap', numeric: true },
        { label: 'idle_rss', type: 'bytes', value: '~80 MB', sub: 'No JVM, no Chromium', numeric: true },
        { label: 'download', type: 'bytes', value: '~20 MB', sub: 'No runtime to install', numeric: true },
        {
            label: 'license',
            type: 'text',
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
            label: 'latest',
            type: 'version',
            value: latestRelease?.version ? `v${latestRelease.version}` : 'Shipping',
            sub: latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : 'Weekly releases',
        },
    ];

    return (
        <section aria-label="Key specifications" className="scroll-mt-20">
            <FullLine />
            <Container>
                <table className="w-full table-fixed border-collapse">
                    <caption className="sr-only">
                        TablePro in numbers: database count, cold start, idle memory, download size, licence and
                        latest release.
                    </caption>

                    {/*
                      * Column separators take the strong weight and the single
                      * row separator takes the hairline, because that is how a
                      * grid draws: columns are stable structure, rows are data.
                      */}
                    <thead>
                        <tr>
                            {specs.map((spec) => (
                                <th
                                    key={spec.label}
                                    scope="col"
                                    className="max-sm:hidden border-r border-rule-strong p-4 text-left align-bottom font-normal last:border-r-0 sm:p-6"
                                >
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                    <span className="mt-1 block font-mono text-2xs text-muted-foreground-subtle">
                                        {spec.type}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="max-sm:hidden border-t border-rule">
                            {specs.map((spec) => (
                                <td
                                    key={spec.label}
                                    className={`border-r border-rule-strong p-4 align-top last:border-r-0 sm:p-6 ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold sm:text-3xl">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-1 block font-mono text-2xs text-muted-foreground">
                                            {spec.sub}
                                        </span>
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Transposed below sm: one row per metric, header in the row. */}
                        {specs.map((spec) => (
                            <tr key={spec.label} className="border-t border-rule sm:hidden">
                                <th scope="row" className="p-4 text-left align-top font-normal">
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                    <span className="mt-1 block font-mono text-2xs text-muted-foreground-subtle">
                                        {spec.type}
                                    </span>
                                </th>
                                <td
                                    className={`p-4 text-right align-top ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-1 block font-mono text-2xs text-muted-foreground">
                                            {spec.sub}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
