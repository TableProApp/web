import Container from '@/components/ui/container';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import { FullLine } from '@/components/ui/full-line';
import { Availability } from '@/components/ui/glyph';
import SectionShell from '@/components/ui/section-shell';
import { PAID_FEATURES } from '@/data/license';

interface Row {
    name: string;
    /** Optional: the two terms rows carry their answer in the columns instead. */
    detail?: string;
    free: boolean | string;
    starter: boolean | string;
    team: boolean | string;
}

/**
 * The paid surface, as one artifact, one section before the prices.
 *
 * It replaces the six-row "Compare plans" table that used to close Pricing.
 * That table was the last thing on the section and named four paid features;
 * this one names all nine, arrives while the reader is still deciding rather
 * than after they have scrolled past the cards, and lets the pricing lede stop
 * enumerating features in prose — it was 59 words, the longest paragraph on the
 * page, and it was wrong about the count.
 *
 * A matrix rather than a grid of cards on purpose: the question a reader has
 * here is "what do I lose by not paying", and three columns of ticks answer it
 * without being read.
 */
function buildRows(teamMinSeats: number): Row[] {
    return [
        {
            name: 'The whole app',
            detail: '25 databases, SQL editor, data grid, AI assistant, MCP server, Safe Mode, SSH tunnels',
            free: true,
            starter: true,
            team: true,
        },
        ...PAID_FEATURES.map(
            (feature): Row => ({
                name: feature.name,
                detail: feature.detail,
                free: false,
                starter: feature.tier === 'starter',
                team: true,
            }),
        ),
        { name: 'Mac activations', free: 'No license needed', starter: '2 Macs', team: `${teamMinSeats} seats minimum` },
        { name: 'Priority support', free: false, starter: false, team: true },
    ];
}

const HEAD_CELL = 'p-4 text-center text-sm font-medium sm:p-5';
const VALUE_CELL = 'p-4 text-center sm:p-5';

function Cell({ value }: { value: boolean | string }) {
    if (typeof value === 'string') {
        return <span className="text-sm font-medium text-foreground">{value}</span>;
    }

    return (
        <span className="inline-flex justify-center">
            <Availability included={value} />
        </span>
    );
}

export default function License({ teamMinSeats }: { teamMinSeats: number }) {
    const rows = buildRows(teamMinSeats);

    return (
        <SectionShell
            id="license"
            label="License"
            headline={`${PAID_FEATURES.length} features need a license.`}
            headlineMuted="Everything else is free."
            lede="Free is not a trial and not a demo. It is the whole app, on every Mac you own, with nothing counting down."
        >
            <FullLine />
            <Container>
                {/*
                  * The scrolling-table pattern from safety.tsx and
                  * compare-table.tsx: focusable and labelled because it scrolls,
                  * with FullLine kept outside so its 200vw bleed cannot add
                  * scroll width in here.
                  */}
                <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="What each plan includes">
                    <DataTable
                        className="min-w-[40rem]"
                        caption="Every feature that needs a license, compared across Free, Starter and Team."
                    >
                        <thead>
                            <tr>
                                <th scope="col" className="p-4 text-left text-sm font-medium text-muted-foreground sm:p-5">
                                    Feature
                                </th>
                                <th
                                    scope="col"
                                    className={`border-l ${TABLE_COLUMN_RULE} ${HEAD_CELL} text-muted-foreground`}
                                >
                                    Free
                                </th>
                                <th
                                    scope="col"
                                    className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 ${HEAD_CELL} font-bold text-primary-strong`}
                                >
                                    Starter
                                </th>
                                <th
                                    scope="col"
                                    className={`border-l ${TABLE_COLUMN_RULE} ${HEAD_CELL} text-muted-foreground`}
                                >
                                    Team
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.name} className={`border-t ${TABLE_ROW_RULE}`}>
                                    <th scope="row" className="p-4 text-left align-top font-normal sm:p-5">
                                        <span className="block text-sm font-medium text-foreground">{row.name}</span>
                                        {row.detail && (
                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                {row.detail}
                                            </span>
                                        )}
                                    </th>
                                    <td className={`border-l ${TABLE_COLUMN_RULE} ${VALUE_CELL}`}>
                                        <Cell value={row.free} />
                                    </td>
                                    <td className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 ${VALUE_CELL}`}>
                                        <Cell value={row.starter} />
                                    </td>
                                    <td className={`border-l ${TABLE_COLUMN_RULE} ${VALUE_CELL}`}>
                                        <Cell value={row.team} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    A license verifies offline on every launch. A 30-day grace period covers a server we cannot reach.
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
