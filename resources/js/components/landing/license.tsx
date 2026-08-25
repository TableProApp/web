import Container from '@/components/ui/container';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import { Availability } from '@/components/ui/glyph';
import { PAID_FEATURES } from '@/data/license';

/*
 * The plan matrix, headless, rendered inside `Pricing`.
 *
 * It shipped as a section of its own, directly above Pricing, with its own
 * eyebrow, H2 and lede — and the two sections answered one question in two
 * halves: what a license adds, then what it costs. That is 469 rendered words
 * and two full header stacks for a reader who is deciding a single thing.
 *
 * The pattern is `CompareTable` inside `SwitchFrom`: a headless artifact that
 * lends its `id` as an anchor. `#license` still resolves and still lands with
 * the prices on screen, which is the whole point of where it sits.
 */

interface Row {
    name: string;
    /** One line under the name. Under ten words; the cell is narrow. See `data/license.ts`. */
    detail?: string;
    free: boolean | string;
    starter: boolean | string;
    team: boolean | string;
}

function buildRows(teamMinSeats: number): Row[] {
    return [
        {
            name: 'The whole app',
            /*
             * This listed "25 databases, SQL editor, data grid, AI assistant, MCP
             * server, Safe Mode, SSH tunnels" — seven items that are seven
             * sections above it, each with its own screenshot or table.
             */
            detail: 'Every section above this one',
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

export default function LicenseTable({ teamMinSeats }: { teamMinSeats: number }) {
    const rows = buildRows(teamMinSeats);

    return (
        <>
            <Container>
                <h3 id="license" className="scroll-mt-20 px-4 py-5 text-lg font-semibold sm:py-6">
                    What a license adds.
                </h3>
            </Container>
            <FullLine />
            <Container>
                {/* Scrollable and focusable: four columns do not fit a phone. */}
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
                                            <span className="mt-1.5 block text-xs text-muted-foreground text-pretty">
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

            <FootNote>
                A license verifies offline on every launch. A 30-day grace period covers a server we cannot reach.
            </FootNote>
        </>
    );
}
