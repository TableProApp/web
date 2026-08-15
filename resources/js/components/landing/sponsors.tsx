import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import SectionShell from '@/components/ui/section-shell';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';

const COLS: ColumnMap = { base: 2, lg: 4 };

const nimbusSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="248" viewBox="0 0 512 248" fill="none">
<path d="M230.91 153.2L199.06 105.13V153.2H190.9V94.23H201.8L231.25 139.48V94.23H239.4V153.2H230.91Z" fill="currentColor"/>
<path d="M259.02 92.4C262.18 92.4 264.67 94.9 264.67 98.06C264.67 101.14 262.18 103.63 259.02 103.63C255.94 103.63 253.45 101.13 253.45 98.06C253.45 94.9 255.94 92.4 259.02 92.4ZM255.2 113.2H262.93V153.21H255.2V113.2Z" fill="currentColor"/>
<path d="M277.9 153.2V113.2H285.39V118.52C287.88 114.11 292.87 112.03 297.53 112.03C302.52 112.03 307.35 114.44 309.51 119.6C312.67 113.86 317.83 112.03 322.9 112.03C329.89 112.03 336.71 116.77 336.71 127.25V153.2H328.97V128.08C328.97 122.84 326.39 118.93 320.49 118.93C315 118.93 311.26 123.25 311.26 128.99V153.19H303.44V128.07C303.44 122.91 300.94 118.92 294.96 118.92C289.39 118.92 285.64 123.08 285.64 129.07V153.19H277.9V153.2Z" fill="currentColor"/>
<path d="M350.84 153.2V92.98H358.57V118.85C360.48 115.27 365.14 112.03 371.79 112.03C383.93 112.03 390.17 121.35 390.17 132.99C390.17 144.89 383.43 154.28 371.54 154.28C365.64 154.28 361.06 151.7 358.57 147.38V153.2H350.84ZM370.39 118.94C363.49 118.94 358.5 124.34 358.5 132.99C358.5 141.64 363.49 147.3 370.39 147.3C377.54 147.3 382.2 141.64 382.2 132.99C382.2 124.34 377.62 118.94 370.39 118.94Z" fill="currentColor"/>
<path d="M415.96 154.45C406.64 154.45 400.99 147.46 400.99 138.4V113.2H408.81V137.23C408.81 142.72 411.31 147.55 417.88 147.55C424.2 147.55 427.36 143.39 427.36 137.32V113.2H435.18V145.8C435.18 148.96 435.43 151.79 435.6 153.2H428.11C427.94 152.29 427.78 150.04 427.78 148.38C425.61 152.54 420.62 154.45 415.96 154.45Z" fill="currentColor"/>
<path d="M453.47 140.31C453.97 144.47 457.13 147.8 462.78 147.8C467.19 147.8 469.6 145.3 469.6 142.48C469.6 139.98 467.77 138.07 464.44 137.32L457.62 135.82C451.38 134.49 447.64 130.25 447.64 124.59C447.64 117.77 454.05 111.95 461.86 111.95C472.84 111.95 476.25 119.1 477.08 122.68L470.18 125.26C469.85 123.18 468.18 118.61 461.86 118.61C457.87 118.61 455.21 121.19 455.21 123.93C455.21 126.34 456.71 128.09 459.79 128.76L466.28 130.17C473.52 131.75 477.34 136.16 477.34 142.07C477.34 147.73 472.6 154.46 462.7 154.46C451.72 154.46 447.06 147.39 446.4 142.81L453.47 140.31Z" fill="currentColor"/>
<path d="M135.71 101.06H90.93V107.46H135.71V101.06Z" fill="currentColor"/>
<path d="M81.33 94.6699C81.33 87.5999 87.06 81.8799 94.12 81.8799C101.19 81.8799 106.91 87.6099 106.91 94.6699H113.31C113.31 87.7999 109.69 81.7799 104.25 78.3899C105.77 73.0299 110.65 69.0699 116.5 69.0699C123.57 69.0699 129.3 74.7999 129.3 81.8699V85.0699H135.69C140.99 85.0699 145.29 89.3699 145.29 94.6699H151.69C151.69 85.8399 144.53 78.6799 135.69 78.6799C135.59 78.6799 135.51 78.6999 135.41 78.7099C133.89 69.6199 126.02 62.6899 116.5 62.6899C107.98 62.6899 100.76 68.2499 98.25 75.9499C96.92 75.6599 95.53 75.4899 94.11 75.4899C83.51 75.4899 74.92 84.0799 74.92 94.6799H81.33V94.6699Z" fill="currentColor"/>
<path d="M113.32 136.25V107.46H110.12L87.73 155.44H113.32V184.23H116.52L138.92 136.25H113.32ZM97.77 149.05L106.92 129.45V142.66H128.87L119.72 162.26V149.05H97.77Z" fill="currentColor"/>
<path d="M55.74 203.43H170.9V43.4299H55.74V203.43ZM62.13 49.8299H164.5V197.03H62.13V49.8299Z" fill="currentColor"/>
</svg>`;

interface Sponsor {
    name: string;
    url: string;
    /**
     * One line saying what this company does.
     *
     * A wall of unfamiliar marks reads as weaker credibility than showing none,
     * because the reader cannot tell a sponsor from a customer from a logo
     * someone licensed. A sentence turns paid placement into something the
     * reader gets value from, which is the Neovim pattern.
     *
     * Optional on purpose: a sponsor without a description still renders its
     * mark, so adding copy later is a data edit and never a code change.
     */
    description?: string;
    logo?: string;
    /** Intrinsic pixel size of the mark, so the row does not reflow while it loads. */
    width: number;
    height: number;
    svgContent?: string;
}

const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/datlechin';

const sponsors: Sponsor[] = [
    {
        name: 'getapps.cafe',
        url: 'https://getapps.cafe/?ref=SJO7-TgA',
        logo: '/images/sponsors/getapps-cafe.png',
        width: 600,
        height: 140,
    },
    {
        name: 'CodeRabbit',
        url: 'https://coderabbit.link/tablepro',
        logo: '/images/sponsors/coderabbit.svg',
        width: 2152,
        height: 313,
    },
    {
        name: 'SimpleLocalize',
        url: 'https://simplelocalize.io?ref=tablepro',
        logo: '/images/sponsors/simplelocalize.svg',
        width: 540,
        height: 101,
    },
    {
        name: 'Nimbus',
        url: 'https://getnimbus.io?ref=tablepro',
        svgContent: nimbusSvg,
        width: 512,
        height: 248,
    },
    {
        name: 'Visnalize',
        url: 'https://visnalize.com?ref=tablepro',
        logo: '/images/sponsors/visnalize.svg',
        width: 526,
        height: 602,
    },
    {
        name: 'Dwarves Foundation',
        url: 'https://dwarves.foundation?ref=tablepro',
        logo: '/images/sponsors/dwarves-foundation.png',
        width: 460,
        height: 460,
    },
    {
        name: 'Unikorn',
        url: 'https://unikorn.vn?ref=tablepro',
        logo: '/images/sponsors/unikorn.svg',
        width: 1024,
        height: 825,
    },
    {
        name: 'Xermius',
        url: 'https://xermius.com?ref=tablepro',
        logo: '/images/sponsors/xermius.webp',
        width: 200,
        height: 200,
    },
];

const TOTAL_SLOTS = 8;
const emptySlots = Math.max(TOTAL_SLOTS - sponsors.length, 0);

const MARK_CLASS = 'h-8 w-auto max-w-full sm:h-10 lg:h-12';

function SponsorMark({ sponsor }: { sponsor: Sponsor }) {
    if (sponsor.svgContent) {
        return (
            <span
                role="img"
                aria-label={sponsor.name}
                className={`${MARK_CLASS} block opacity-80 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0 [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full`}
                dangerouslySetInnerHTML={{ __html: sponsor.svgContent }}
            />
        );
    }

    return (
        <img
            src={sponsor.logo}
            alt={sponsor.name}
            width={sponsor.width}
            height={sponsor.height}
            loading="lazy"
            decoding="async"
            className={`${MARK_CLASS} object-contain opacity-70 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0 group-hover:dark:grayscale dark:invert`}
        />
    );
}

const CELL_CLASS =
    'group flex flex-col items-center justify-center gap-3 p-6 text-center transition-colors sm:p-8 lg:p-10';

/**
 * Sponsors get their own section high on the page, not a footnote near the
 * bottom. Visible credit is the product being sold here, so the placement is
 * the point. The heading states plainly that these are sponsors funding the
 * work, which is what stops a logo row from reading as a customer list.
 */
export default function Sponsors() {
    const cells = [
        ...sponsors.map((sponsor) => ({ kind: 'sponsor' as const, sponsor })),
        ...Array.from({ length: emptySlots }, (_, i) => ({ kind: 'empty' as const, key: `empty-${i}` })),
    ];

    return (
        <SectionShell
            id="sponsors"
            label="Sponsors"
            headline="Paid for by these companies."
            headlineMuted="That is why the app is free."
            lede="TablePro takes no funding and sells no data. Sponsorships and licenses cover the whole cost of building it, so every database, the AI assistant and the MCP server can stay free for everyone."
        >
            <FullLine />
            <Container>
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {cells.map((cell, i) => {
                        const borders = cellBorders(i, COLS, cells.length);

                        if (cell.kind === 'empty') {
                            return (
                                <a
                                    key={cell.key}
                                    href={GITHUB_SPONSORS_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Become a sponsor"
                                    className={`${CELL_CLASS} ${borders}`}
                                >
                                    <span className="flex size-10 items-center justify-center rounded-xl border border-dashed border-rule-strong text-muted-foreground transition-colors group-hover:border-gray-950/20 dark:group-hover:border-white/20">
                                        <svg
                                            className="size-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            aria-hidden="true"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </span>
                                </a>
                            );
                        }

                        return (
                            <a
                                key={cell.sponsor.name}
                                href={cell.sponsor.url}
                                target="_blank"
                                rel="noopener sponsored"
                                className={`${CELL_CLASS} ${borders}`}
                            >
                                <SponsorMark sponsor={cell.sponsor} />
                                {cell.sponsor.description && (
                                    <span className="text-xs leading-relaxed text-muted-foreground">
                                        {cell.sponsor.description}
                                    </span>
                                )}
                            </a>
                        );
                    })}
                </div>
            </Container>
            <FullLine />

            <Container>
                <p className="px-4 py-4 text-sm text-muted-foreground">
                    Sponsoring puts your logo here, near the top of the page, and in the project README.{' '}
                    <a
                        href={GITHUB_SPONSORS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong"
                    >
                        Become a sponsor
                    </a>
                </p>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
