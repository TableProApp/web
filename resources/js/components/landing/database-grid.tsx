import { useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import gridData from '../../../data/database-grid.json';
import Container from '@/components/ui/container';
import FootNote from '@/components/ui/footnote';
import { FullLine } from '@/components/ui/full-line';
import DatabaseMark from '@/components/ui/database-mark';
import SectionShell from '@/components/ui/section-shell';
import { CELL_DENSITY, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import { GITHUB_REPO_URL } from '@/data/links';
import { BUNDLED_ENGINE_COUNT, ENGINE_COUNT, ON_DEMAND_ENGINE_COUNT } from '@/data/engines';

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
    `${GITHUB_REPO_URL}/issues/new?template=feature_request.yml&title=Database%20request%3A%20`;

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

const TILE_CLASS = `group flex flex-col items-center justify-center gap-3.5 text-center ${CELL_DENSITY.default}`;
/** Tiles are links, so the shared row-selection treatment applies on hover AND focus. */
const TILE_HOVER = 'transition-colors';

/**
 * A mark and a name. Nothing else.
 *
 * Each tile also carried the default port and a ● / ○ glyph for bundled versus
 * on-demand: four text runs times twenty six tiles, sixty two mono strings in
 * one grid, and the densest single block on the page. Neither fact chooses a
 * database for anyone — nobody picks a client because Redis is on 6379 — and
 * the bundled/on-demand split is a property of nine drivers rather than of
 * twenty six tiles, so the lede states it once and the grid is a wall of marks
 * again.
 *
 * `port` and `distribution` stay on the type and in the JSON. The grid filters
 * on `category`, and `DatabaseGridDataTest` reads the rest; stripping fields
 * from a dataset to match one view is how a dataset stops being reusable.
 */
function TileBody({ database }: { database: DatabaseTile }) {
    return (
        <>
            <DatabaseMark icon={database.icon} monogram={database.monogram} name={database.name} />
            <span className="text-sm leading-tight font-medium text-muted-foreground">{database.name}</span>
        </>
    );
}

export default function DatabaseGrid() {
    const [activeCategory, setActiveCategory] = useState('all');
    const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    /**
     * Every tile stays mounted so the server-rendered markup is the complete
     * list, but border rules are recomputed against the visible subset so the
     * grid closes correctly in every filter state.
     */
    const visible = useMemo(
        () => databases.filter((database) => activeCategory === 'all' || database.category === activeCategory),
        [activeCategory],
    );

    /**
     * Columns at each breakpoint, so up and down move a whole row rather than a
     * single tile. Read off `COLS` so the two can never disagree.
     */
    function columnsNow(): number {
        if (typeof window === 'undefined') {
            return COLS.lg ?? COLS.base;
        }

        const width = window.innerWidth;
        if (width >= 1024) return COLS.lg ?? COLS.base;
        if (width >= 768) return COLS.md ?? COLS.base;
        if (width >= 640) return COLS.sm ?? COLS.base;

        return COLS.base;
    }

    function handleGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        // `visible` tiles plus the "request a database" tile at the end.
        const last = visible.length;
        const columns = columnsNow();
        const current = tileRefs.current.findIndex((el) => el === document.activeElement);

        if (current === -1) {
            return;
        }

        const moves: Record<string, number> = {
            ArrowRight: 1,
            ArrowLeft: -1,
            ArrowDown: columns,
            ArrowUp: -columns,
        };

        let next: number | null = null;

        if (event.key in moves) {
            next = current + moves[event.key];
        } else if (event.key === 'Home') {
            next = 0;
        } else if (event.key === 'End') {
            next = last;
        }

        // Clamp rather than wrap: wrapping a two-dimensional grid on Left at the
        // start of a row lands you at the end of the previous one, which reads
        // as the focus jumping backwards for no reason.
        if (next === null) {
            return;
        }

        const clamped = Math.max(0, Math.min(last, next));

        if (clamped === current) {
            return;
        }

        event.preventDefault();
        tileRefs.current[clamped]?.focus();
    }

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
            tone="raised"
            id="databases"
            label="Databases"
            headline={`${ENGINE_COUNT} databases.`}
            headlineMuted="One native driver each. No JDBC."
            lede={`${BUNDLED_ENGINE_COUNT} drivers ship inside the app. The other ${ON_DEMAND_ENGINE_COUNT} download the first time you pick one, signature verified, with no restart.`}
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
                                    className={`relative shrink-0 px-4 py-4 text-left text-sm whitespace-nowrap transition-colors lg:whitespace-normal ${
                                        isActive
                                            ? 'font-semibold text-primary-strong'
                                            : 'font-medium text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {isActive && (
                                        <span
                                            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary lg:inset-y-0 lg:right-auto lg:left-0 lg:h-auto lg:w-0.5"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {/*
                                      * No per-category counts. They rendered
                                      * "All 26" one row under an H2 that says
                                      * 25, and that visible contradiction was
                                      * the only reason the FAQ carried an entry
                                      * explaining it. The reconciliation line
                                      * below the grid states it once, properly.
                                      */}
                                    {category.label}
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        {/*
                          * Arrow-key traversal across the tiles. Up and down move
                          * a whole row, Home and End jump to the ends.
                          *
                          * Purely additive: every tile stays in the tab order.
                          * The usual composite-widget pattern would take them all
                          * out and leave one, but that needs `role="grid"` with
                          * `row` and `gridcell` children for assistive tech to
                          * understand what happened — and this is one flat CSS
                          * grid whose borders are computed by index, so row
                          * wrappers would break the layout. Adding the roles
                          * without the structure would describe a widget that is
                          * not there. Arrows are a shortcut for people who can
                          * see where focus went; nobody loses anything.
                          */}
                        <div
                            onKeyDown={handleGridKeyDown}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                        >
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
                                        ref={(el) => { tileRefs.current[index] = el; }}
                                        href={database.href}
                                        data-row
                                        aria-label={`${database.name} client for Mac`}
                                        className={`${TILE_CLASS} ${TILE_HOVER} ${borders}`}
                                    >
                                        <TileBody database={database} />
                                    </a>
                                );
                            })}

                            <a
                                ref={(el) => { tileRefs.current[visible.length] = el; }}
                                href={REQUEST_DATABASE_HREF}
                                data-row
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${TILE_CLASS} ${TILE_HOVER} ${cellBorders(visible.length, COLS, itemCount)}`}
                            >
                                <span className="flex size-10 items-center justify-center">
                                    <Plus
                                        className="size-7 text-muted-foreground opacity-40 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                                        strokeWidth={1.5}
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="text-sm leading-tight font-medium text-muted-foreground">
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

                        {/* "Entries", not "databases": Cassandra and ScyllaDB are two of them sharing one driver. */}
                        <div className="sr-only" role="status" aria-live="polite">
                            Showing {visible.length} of {databases.length} entries.
                        </div>
                    </div>
                </div>
            </Container>
            <FullLine />

            {/*
              * One footnote where there were two bands and a two-row ledger.
              *
              * The ● / ○ legend went with the glyphs it explained; the lede now
              * carries the bundled/on-demand split in a sentence. The plugin ABI
              * row folded in here because it is a reassurance about the parts
              * list, not a second subject.
              */}
            <FootNote>
                Twenty six tiles, twenty five drivers: Cassandra and ScyllaDB share one. Underneath are libpq,
                libmariadb, hiredis, libmongoc, libcassandra, FreeTDS and OracleNIO, with Teradata and Trino speaking
                their wire protocols in pure Swift.
            </FootNote>
        </SectionShell>
    );
}
