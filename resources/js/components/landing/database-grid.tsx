import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import gridData from '../../../data/database-grid.json';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import DatabaseMark from '@/components/ui/database-mark';
import SectionShell from '@/components/ui/section-shell';
import { CELL_DENSITY, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';

interface DatabaseTile {
    name: string;
    icon: string;
    monogram: string;
    port: string;
    distribution: 'builtin' | 'plugin';
    driverGroup: string;
    category: string;
    href: string | null;
}

const databases = gridData as DatabaseTile[];

const REQUEST_DATABASE_HREF =
    'https://github.com/TableProApp/TablePro/issues/new?template=feature_request.yml&title=Database%20request%3A%20';

const COLS: ColumnMap = { base: 2, sm: 3, md: 4, lg: 5 };

/** Order matters: this is the rail's reading order. */
const CATEGORIES: { id: string; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'relational', label: 'Relational' },
    { id: 'document-kv', label: 'Document and key-value' },
    { id: 'file-embedded', label: 'File and embedded' },
    { id: 'cloud-api', label: 'Cloud and API' },
    { id: 'analytics', label: 'Analytics' },
];

const FILLER_HIDDEN = ['max-sm:hidden', 'sm:max-md:hidden', 'md:max-lg:hidden', 'lg:hidden'] as const;

function fillersFor(cols: number, count: number): number {
    return (cols - (count % cols)) % cols;
}

/** Hide a filler at each breakpoint where the row is already square without it. */
function fillerVisibility(index: number, count: number): string {
    const perBreakpoint = [
        { hidden: FILLER_HIDDEN[0], needed: fillersFor(COLS.base, count) },
        { hidden: FILLER_HIDDEN[1], needed: fillersFor(COLS.sm ?? COLS.base, count) },
        { hidden: FILLER_HIDDEN[2], needed: fillersFor(COLS.md ?? COLS.base, count) },
        { hidden: FILLER_HIDDEN[3], needed: fillersFor(COLS.lg ?? COLS.base, count) },
    ];

    return perBreakpoint
        .filter(({ needed }) => index >= needed)
        .map(({ hidden }) => hidden)
        .join(' ');
}

const TILE_CLASS = `group flex flex-col items-center gap-3 text-center ${CELL_DENSITY.compact}`;
/** Tiles are links, so the shared row-selection treatment applies on hover AND focus. */
const TILE_HOVER = 'transition-colors';

function TileBody({ database }: { database: DatabaseTile }) {
    return (
        <>
            <DatabaseMark icon={database.icon} monogram={database.monogram} name={database.name} />
            <span className="text-xs leading-tight font-medium text-muted-foreground">{database.name}</span>
            <span className="font-mono text-2xs text-muted-foreground">{database.port}</span>
            <span
                className="font-mono text-2xs text-muted-foreground"
                title={database.distribution === 'builtin' ? 'Bundled with the app' : 'Downloads on demand'}
            >
                {database.distribution === 'builtin' ? '●' : '○'}
            </span>
        </>
    );
}

export default function DatabaseGrid() {
    const [activeCategory, setActiveCategory] = useState('all');

    const counts = useMemo(() => {
        const tally: Record<string, number> = { all: databases.length };
        for (const database of databases) {
            tally[database.category] = (tally[database.category] ?? 0) + 1;
        }

        return tally;
    }, []);

    /**
     * Every tile stays mounted so the server-rendered markup is the complete
     * list, but border rules are recomputed against the visible subset so the
     * grid closes correctly in every filter state.
     */
    const visible = useMemo(
        () => databases.filter((database) => activeCategory === 'all' || database.category === activeCategory),
        [activeCategory],
    );

    const visibleIndex = useMemo(() => {
        const map = new Map<string, number>();
        visible.forEach((database, i) => map.set(database.name, i));

        return map;
    }, [visible]);

    // The request tile always trails the list, so it counts toward the layout.
    const itemCount = visible.length + 1;
    const fillerCount = Math.max(
        fillersFor(COLS.base, itemCount),
        fillersFor(COLS.sm ?? COLS.base, itemCount),
        fillersFor(COLS.md ?? COLS.base, itemCount),
        fillersFor(COLS.lg ?? COLS.base, itemCount),
    );

    return (
        <SectionShell
            id="databases"
            label="Databases"
            headline="25 databases."
            headlineMuted="One native driver each. No JDBC."
            lede="Nine drivers ship inside the app. The other sixteen download the moment you pick one, with no restart, and every download is checksum and code-signature verified before it loads."
        >
            <FullLine />
            <Container>
                <div className="lg:grid lg:grid-cols-[11rem_1fr]">
                    {/* Category rail: a scrolling chip row below lg, a vertical list at lg. */}
                    <div
                        role="group"
                        aria-label="Filter databases by category"
                        className="flex gap-0 overflow-x-auto border-b border-rule lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {CATEGORIES.map((category) => {
                            const isActive = activeCategory === category.id;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`relative shrink-0 px-4 py-3 text-left font-mono text-2xs tracking-widest whitespace-nowrap uppercase transition-colors lg:whitespace-normal ${
                                        isActive
                                            ? 'font-semibold text-primary-strong'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isActive && (
                                        <span
                                            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary lg:inset-y-0 lg:right-auto lg:left-0 lg:h-auto lg:w-0.5"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {category.label}{' '}
                                    <span className="tabular-nums text-muted-foreground-subtle">{counts[category.id] ?? 0}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {databases.map((database) => {
                                const index = visibleIndex.get(database.name);

                                if (index === undefined) {
                                    return <div key={database.name} className="hidden" aria-hidden="true" />;
                                }

                                const borders = cellBorders(index, COLS, itemCount);

                                if (!database.href) {
                                    return (
                                        <div key={database.name} className={`${TILE_CLASS} ${borders}`}>
                                            <TileBody database={database} />
                                        </div>
                                    );
                                }

                                return (
                                    <a
                                        key={database.name}
                                        href={database.href}
                                        data-row
                                        className={`${TILE_CLASS} ${TILE_HOVER} ${borders}`}
                                    >
                                        <TileBody database={database} />
                                    </a>
                                );
                            })}

                            <a
                                href={REQUEST_DATABASE_HREF}
                                data-row
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${TILE_CLASS} ${TILE_HOVER} ${cellBorders(visible.length, COLS, itemCount)}`}
                            >
                                <span className="flex size-10 items-center justify-center">
                                    <Plus
                                        className="size-7 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100"
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="text-xs leading-tight font-medium text-muted-foreground">
                                    Request a database
                                </span>
                            </a>

                            {Array.from({ length: fillerCount }, (_, j) => (
                                <GridCell
                                    key={`filler-${j}`}
                                    variant="stripe"
                                    className={`${cellBorders(itemCount + j, COLS, itemCount)} ${fillerVisibility(j, itemCount)}`}
                                />
                            ))}
                        </div>

                        <div className="sr-only" role="status" aria-live="polite">
                            Showing {visible.length} of {databases.length} databases.
                        </div>
                    </div>
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    ● bundled &nbsp; ○ downloads on demand
                </p>
                <FullLine />
                <p className="px-4 py-3 text-sm text-muted-foreground">
                    Twenty six tiles, twenty five drivers. Cassandra and ScyllaDB share one driver, and so do libSQL and
                    Turso.
                </p>
                <FullLine />
                <p className="px-4 py-3 text-sm text-muted-foreground">
                    Drivers are .tableplugin bundles built against TableProPluginKit. The registry manifest is public at
                    github.com/TableProApp/plugins, every download must match a SHA-256 checksum, and the bundle's code
                    signature must match TablePro's signing team before it loads.
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
