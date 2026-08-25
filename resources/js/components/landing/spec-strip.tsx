import { ReactNode } from 'react';
import Container from '@/components/ui/container';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { GITHUB_REPO_URL } from '@/data/links';

interface Props {
    latestRelease?: { version: string | null; publishedAt: string | null; countLast30Days: number | null } | null;
    /** DMG downloads, and how many releases that figure was counted over. */
    downloads?: { total: number | null; releases: number } | null;
}

interface Spec {
    label: string;
    value: string;
    sub?: ReactNode;
    /** Right-aligns and tabular-figures the value in the transposed layout. */
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
 * Six numbers under the screenshot, and nothing else.
 *
 * This was a full `SectionShell`: an eyebrow, an H2 reading "Written in Swift,
 * not in Electron. / Here is what that costs to run.", two mono caveat bands, a
 * third H3 and a three-cell behaviour grid — 219 rendered words and nine
 * hairlines wrapped around six figures that argue for themselves. A headline
 * that tells the reader what the table below is about is a headline the table
 * did not need.
 *
 * So it is headless now: a labelled region rather than a section with a
 * heading, sitting directly under the hero plate where a spec sheet belongs.
 * The three "what the numbers buy on day two" cells moved into the Workbench's
 * data-grid ledger, which is the feature they were actually describing, and the
 * two caveat bands became one footnote.
 *
 * The SQL `type` row went too. `int` / `bytes` / `interval` under each column
 * header was a nice joke about result sets, and it cost six lines of 11px mono
 * in the first screenful of the page.
 */
export default function SpecStrip({ latestRelease, downloads }: Props) {
    const specs: Spec[] = [
        { label: 'databases', value: '25', sub: '9 bundled, 16 on demand', numeric: true },
        { label: 'cold_start', value: 'Under 1s', sub: 'Cold, to first window', numeric: true },
        { label: 'idle_rss', value: '~80 MB', sub: 'One connection, open and idle', numeric: true },
        downloads?.total
            ? {
                label: 'downloads',
                value: downloads.total.toLocaleString('en-US'),
                sub: `Across ${downloads.releases} releases`,
                numeric: true,
            }
            : { label: 'download', value: '~20 MB', sub: 'Apple Silicon or Intel', numeric: true },
        {
            label: 'license',
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
            value: latestRelease?.version ? `v${latestRelease.version}` : 'Shipping',
            sub: [
                latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : 'Weekly releases',
                latestRelease?.countLast30Days ? `${latestRelease.countLast30Days} in 30 days` : null,
            ]
                .filter(Boolean)
                .join(' · '),
        },
    ];

    return (
        /*
         * `aria-label` rather than `aria-labelledby`: there is no heading to
         * point at, and a region with neither is not announced at all.
         */
        <section id="specs" aria-label="TablePro in numbers" className="scroll-mt-20">
            <div className="h-8 sm:h-10 lg:h-14" />
            <FullLine />
            <Container>
                <DataTable
                    className="table-fixed"
                    caption="TablePro in numbers: database count, cold start, idle memory, download size, license and latest release."
                >
                    {/* Wide: one row of six columns, read left to right. */}
                    <thead>
                        <tr>
                            {specs.map((spec) => (
                                <th
                                    key={spec.label}
                                    scope="col"
                                    className={`max-lg:hidden border-r ${TABLE_COLUMN_RULE} px-4 pt-6 pb-2 text-left align-bottom font-normal last:border-r-0 sm:px-6`}
                                >
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <tr className={`max-lg:hidden border-t ${TABLE_ROW_RULE}`}>
                            {specs.map((spec) => (
                                <td
                                    key={spec.label}
                                    className={`border-r ${TABLE_COLUMN_RULE} px-4 pt-5 pb-6 align-top last:border-r-0 sm:px-6 ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold sm:text-3xl">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-2 block text-xs text-muted-foreground">{spec.sub}</span>
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Narrow: the same six, transposed to label / value rows. */}
                        {specs.map((spec) => (
                            <tr key={spec.label} className="border-t border-rule lg:hidden">
                                <th scope="row" className="px-4 py-4 text-left align-top font-normal">
                                    <span className="block font-mono text-2xs tracking-widest text-muted-foreground uppercase">
                                        {spec.label}
                                    </span>
                                </th>
                                <td
                                    className={`px-4 py-4 text-right align-top ${
                                        spec.numeric ? 'tabular-nums slashed-zero' : ''
                                    }`}
                                >
                                    <span className="block text-2xl font-bold">{spec.value}</span>
                                    {spec.sub && (
                                        <span className="mt-1 block text-xs text-muted-foreground">{spec.sub}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Container>
            <FullLine />

            <FootNote>
                Measured on an M4 MacBook Pro, macOS 27: cold launch to first window, one PostgreSQL connection open.{' '}
                <a
                    href="https://trendshift.io/repositories/24114"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    #1 on GitHub Trending
                </a>{' '}
                on 23 March 2026.
            </FootNote>
        </section>
    );
}
