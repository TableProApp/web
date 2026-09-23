import { usePage } from '@inertiajs/react';
import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import AppStoreBadge from '@/components/landing/app-store-badge';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import SectionShell, { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import FootNote from '@/components/ui/footnote';
import { ITEM_TITLE, cellBorders, GridCell, type ColumnMap } from '@/components/ui/grid-cell';
import ThemedImage from '@/components/ui/themed-image';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import { PROSE_LINK } from '@/components/ui/prose-link';
import { APP_STORE_URL, GITHUB_REPO_URL } from '@/data/links';
import { trackDownload } from '@/lib/analytics';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

const IOS_TITLE = 'TablePro for iPhone and iPad - Free Database Client';
const IOS_DESCRIPTION =
    'A native database client for iPhone and iPad. Browse tables, run queries and edit rows on MySQL, PostgreSQL, SQL Server, Oracle, Redis and more. Free on the App Store.';

/**
 * Engines the connection form on the phone actually offers, in the order the
 * picker lists them.
 *
 * Named, not counted. The site published "Seven engines on device" for six
 * weeks after it stopped being true: seven was the number of driver *classes*
 * compiled into the app, while the picker offered ten, because MariaDB, TiDB
 * and OceanBase all ride the MySQL driver. A list cannot drift the way a
 * numeral can, and `EngineCountTest` forbids writing a digit beside the word
 * "engines" in the files it scans for exactly this reason.
 */
const ENGINES = [
    'MySQL',
    'MariaDB',
    'TiDB',
    'OceanBase',
    'PostgreSQL',
    'SQLite',
    'DuckDB',
    'Redis',
    'SQL Server',
    'Oracle',
];

const CAPABILITY_COLS: ColumnMap = { base: 1, sm: 2, lg: 3 };

/**
 * Three captures from the bundled Chinook database, on an iPhone 16 Pro at 3x,
 * which is the 1206x2622 the rest of this site's iOS artwork already uses.
 *
 * Each is a real screen with real rows, driven through the app by the
 * `TableProMobileScreenshots` UI test in the app repository, so the light and
 * dark files in a pair are the same frame in two palettes rather than two
 * separate sessions. The pair that shipped before these disagreed on the
 * status-bar clock, which is the tell that they were shot by hand a minute
 * apart; the status bar is pinned to 09:41 here.
 *
 * The alt text describes what is actually on screen. The previous iOS
 * screenshot on this site was captioned "showing rows from a PostgreSQL table"
 * while showing a connection list.
 */
const IOS_SCREENS = [
    {
        src: 'table',
        alt: 'The Track table open on iPhone, showing TrackId, Name, AlbumId and MediaTypeId for the first rows of 3,503.',
        caption: 'Browse a table',
    },
    {
        src: 'row',
        alt: 'A single Chinook track open full screen on iPhone, one field per row, ready to edit.',
        caption: 'Open a row',
    },
    {
        src: 'structure',
        alt: 'The Track table structure on iPhone, listing each column with its type.',
        caption: 'Read the structure',
    },
];

/**
 * Six cells, each one thing the app does, in the order a reader meets them:
 * open something, read it, change it, ask it a question, keep it safe, keep it
 * in step with the Mac.
 */
const CAPABILITIES = [
    {
        title: 'Browse',
        body: 'Sort by any column, search every column but the binary ones, and stack filters with AND or OR. Fifty to five hundred rows a page. Tap a foreign key to preview the row it points at.',
    },
    {
        title: 'Edit',
        body: 'Open a row full screen, change values, set NULL, save. Insert and delete rows, truncate or drop a table.',
    },
    {
        title: 'Query',
        body: 'A SQL editor with syntax highlighting, and a Stop button while it runs. Every connection keeps its own history. Results copy out as JSON, CSV or SQL INSERT.',
    },
    {
        title: 'Safe Mode',
        body: 'Per connection, on the connection form under Organization: Off, Confirm Writes, or Read-Only. Read-Only refuses a write before it reaches the server.',
    },
    {
        title: 'Connect',
        body: 'SSH tunnels with a password or a private key, and host keys are checked. SSL with CA and client certificates. Passwords and keys live in the Keychain.',
    },
    {
        title: 'Lock',
        body: 'Face ID, Touch ID or Optic ID on open, with your passcode as the fallback it always falls back to.',
    },
];

/**
 * The limits, stated on the page rather than discovered after installing.
 *
 * Every release post on this site carries a "what it will not do" section and
 * this is the same discipline: the list below is what makes the list above
 * believable. It is also the honest answer to the question a Mac user actually
 * arrives with, which is not "what does it do" but "is this the whole app".
 */
const LIMITS = [
    'No AI chat and no MCP server. Those are the Mac app.',
    'No ER diagrams, no Compare & Sync, no Query Insights, no charts.',
    'No saved queries. History is per connection and stays on the device.',
    'No plugin registry. Every driver is compiled in, so there is nothing to install — and nothing to add either.',
    'SQLite and DuckDB open files on the device or in memory. There is no remote DuckDB here; that one is Mac-only.',
    'No jump hosts. A tunnel that needs one has to be opened on the Mac.',
];

function buildIosAppJsonLd(canonicalBaseUrl: string): object {
    const base = canonicalBaseUrl.replace(/\/$/, '');

    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        /*
         * A distinct @id from the homepage's `#app`. That node is the Mac app —
         * its downloadUrl is a DMG page and its softwareRequirements name
         * macOS. One node cannot stand for two applications that ship from two
         * projects on two release cadences, which is the same reason the
         * homepage stopped claiming `macOS 14+, iOS 18+` in one string.
         */
        '@id': `${base}/#ios-app`,
        name: 'TablePro for iPhone and iPad',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Database Client',
        operatingSystem: 'iOS 18.0, iPadOS 18.0',
        softwareRequirements: 'iOS 18.0 or later, iPadOS 18.0 or later',
        description: IOS_DESCRIPTION,
        url: `${base}/ios`,
        downloadUrl: APP_STORE_URL,
        installUrl: APP_STORE_URL,
        license: `${GITHUB_REPO_URL}/blob/main/LICENSE`,
        isAccessibleForFree: true,
        featureList: [
            'Ten database engines, every driver built in',
            'Browse, sort, filter and page through rows',
            'Full-screen row editing with NULL support',
            'SQL editor with syntax highlighting and query history',
            'Per-connection Safe Mode: off, confirm writes, or read-only',
            'SSH tunnels with host key checking',
            'SSL with CA and client certificates',
            'Face ID, Touch ID and Optic ID lock',
            'iCloud sync of connections, groups and tags',
            'Handoff with TablePro for Mac',
            'Quick Connect widget, Shortcuts and Siri actions',
            'Live Activity for a running query',
        ],
        publisher: { '@id': `${base}/#organization` },
        author: { '@id': `${base}/#organization` },
        /*
         * No aggregateRating. The listing has no ratings and no reviews, and
         * StaleClaimsTest bans the string on every page that emits one of these
         * nodes — which now includes this file.
         */
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            url: APP_STORE_URL,
            availability: 'https://schema.org/InStock',
        },
    };
}

/**
 * The iPhone and iPad app.
 *
 * Its own route rather than a cell in the homepage's closing call to action,
 * because it is the only iOS surface this domain owns and a reader searching
 * for "database client iphone" has nowhere else to land. The closing CTA keeps
 * the `#mobile` anchor and a badge; this page is where the detail lives.
 *
 * Every fact below was read out of the app repository rather than out of the
 * App Store listing, because the listing is marketing copy and the site's rule
 * is that a claim has a source. The three that most often get written wrong,
 * all by reusing a Mac sentence: Safe Mode has three levels here and six on the
 * Mac, export goes to the clipboard or the Share Sheet rather than to a file,
 * and there are no jump hosts.
 */
export default function Ios({ downloadUrls, githubStars }: Props) {
    const { canonicalBaseUrl } = usePage<{ canonicalBaseUrl: string }>().props;

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={IOS_TITLE}
                description={IOS_DESCRIPTION}
                canonical="/ios"
                jsonLd={[buildIosAppJsonLd(canonicalBaseUrl)]}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'iPhone and iPad', path: '/ios' },
                ]}
            />

            <PageHeader
                label="iPhone and iPad"
                headline="Your databases, on the phone."
                headlineMuted="Free on the App Store."
                lede="A native client for iPhone and iPad. It opens the same connections you use on the Mac, and it is a companion to that app rather than a copy of it."
            />

            <Container>
                <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center">
                    <AppStoreBadge location="ios-page-hero" />
                    <p className="text-sm text-muted-foreground">
                        iOS 18 and iPadOS 18 or later &middot; No in-app purchases
                    </p>
                </div>
                <FullLine />
            </Container>

            <SectionShell
                id="engines"
                label="Engines"
                headline="Ten to choose from on the phone."
                lede="Every driver is compiled into the app, so there is nothing to install and nothing to wait for the first time you pick one."
                tone="raised"
            >
                <FullLine />
                <Container>
                    {/*
                      * Two columns, then five. Both divide ten exactly, so the
                      * last row is always full and no filler cells are needed.
                      * A three-column step at `sm` leaves one item in a row of
                      * three, and `cellBorders` then draws that cell's right
                      * rule into empty space — the grid would need two hidden
                      * fillers to stay square, which is machinery for nothing.
                      */}
                    <ul className="grid grid-cols-2 lg:grid-cols-5">
                        {ENGINES.map((engine, index) => (
                            <li key={engine}>
                                <GridCell
                                    density="compact"
                                    className={cellBorders(index, { base: 2, lg: 5 }, ENGINES.length)}
                                >
                                    <span className="text-sm font-medium text-foreground">{engine}</span>
                                </GridCell>
                            </li>
                        ))}
                    </ul>
                </Container>
                <FullLine />
                <FootNote>
                    A Redshift connection made on a Mac opens here too once it syncs across, though it cannot be
                    created on the phone. Anything else from the Mac's longer list syncs down and appears in the
                    list, but will not open — the driver is not in this app.
                </FootNote>
            </SectionShell>

            <SectionShell
                id="what-it-does"
                label="What it does"
                headline="Read a table. Change a row. Run a query."
            >
                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {CAPABILITIES.map((capability, index) => (
                            <GridCell
                                key={capability.title}
                                density="default"
                                className={cellBorders(index, CAPABILITY_COLS, CAPABILITIES.length)}
                            >
                                <h3 className={ITEM_TITLE}>{capability.title}</h3>
                                <p className="mt-3 text-sm text-muted-foreground text-pretty">{capability.body}</p>
                            </GridCell>
                        ))}
                    </div>
                </Container>
                <FullLine />
            </SectionShell>

            <SectionShell
                id="screens"
                label="Screens"
                headline="The Chinook sample, on an iPhone."
                lede="Open it from the connection list in two taps and there is something to read before you have set up a server."
                tone="raised"
            >
                <FullLine />
                <Container>
                    {/*
                      * One column until `lg`, not until `sm`.
                      *
                      * Three columns inside a 640px container gives each phone
                      * roughly 170px of usable width against a `max-w-56` cap,
                      * so the captures shrink by about two fifths at exactly
                      * the width where a reader is most likely to be holding
                      * the device they are being sold. The column count and the
                      * `cellBorders` breakpoint map have to move together or
                      * the internal rules land at the wrong width.
                      */}
                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        {IOS_SCREENS.map((screen, index) => (
                            <GridCell
                                key={screen.src}
                                density="default"
                                className={cellBorders(index, { base: 1, lg: 3 }, IOS_SCREENS.length)}
                            >
                                <ThemedImage
                                    light={{ src: `/images/ios/${screen.src}-light.png` }}
                                    dark={{ src: `/images/ios/${screen.src}-dark.png` }}
                                    alt={screen.alt}
                                    width={1206}
                                    height={2622}
                                    className="mx-auto block w-full max-w-56 rounded-xl border border-rule"
                                />
                                <p className="mt-4 text-center text-sm text-muted-foreground">{screen.caption}</p>
                            </GridCell>
                        ))}
                    </div>
                </Container>
                <FullLine />
            </SectionShell>

            <SectionShell
                id="with-your-mac"
                label="With your Mac"
                headline="The same connections, in both places."
            >
                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                        <GridCell density="default" className={cellBorders(0, { base: 1, sm: 3 }, 3)}>
                            <h3 className={ITEM_TITLE}>iCloud sync</h3>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                Connections, groups and tags, in your own iCloud account. Off until you turn it on.
                                Passwords are a separate switch again, and travel through iCloud Keychain.
                            </p>
                        </GridCell>
                        <GridCell density="default" className={cellBorders(1, { base: 1, sm: 3 }, 3)}>
                            <h3 className={ITEM_TITLE}>Handoff</h3>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                Pick up an open connection, or the table you were reading, on whichever device you
                                reach for next.
                            </p>
                        </GridCell>
                        <GridCell density="default" className={cellBorders(2, { base: 1, sm: 3 }, 3)}>
                            <h3 className={ITEM_TITLE}>Shortcuts and widgets</h3>
                            <p className="mt-3 text-sm text-muted-foreground text-pretty">
                                A Quick Connect widget for the Home Screen. Shortcuts actions add a row without
                                opening the app — after Face ID, and still inside Safe Mode.
                            </p>
                        </GridCell>
                    </div>
                </Container>
                <FullLine />
                <FootNote>
                    Sync on the phone is a switch and nothing else. On the Mac, iCloud Sync is a Starter feature, so a
                    Mac without a license will not send its side. Importing a <span className="font-mono text-xs">.tablepro</span>{' '}
                    file through Files or AirDrop needs neither.
                </FootNote>
            </SectionShell>

            <SectionShell
                id="limits"
                label="Limits"
                headline="What it will not do."
                lede="It is a companion to the Mac app, and the list below is the part that makes the rest of this page worth believing."
                tier="reference"
                tone="raised"
            >
                <FullLine />
                <Container>
                    <ul>
                        {LIMITS.map((limit, index) => (
                            <li key={limit}>
                                <GridCell density="compact" className={cellBorders(index, { base: 1 }, LIMITS.length)}>
                                    <span className="text-sm text-muted-foreground text-pretty">{limit}</span>
                                </GridCell>
                            </li>
                        ))}
                    </ul>
                </Container>
                <FullLine />
            </SectionShell>

            <SectionShell
                id="privacy"
                label="Privacy"
                headline="Nothing reaches us unless you send it."
                tier="reference"
            >
                <FullLine />
                <Container>
                    <p className="max-w-[68ch] px-4 py-5 text-sm text-muted-foreground text-pretty sm:py-6">
                        Usage data is off until you turn it on, and it carries no hostnames, usernames, passwords,
                        queries or rows. The app makes no other call to us: there is no update check, no license
                        check and no plugin registry on this platform. Your database traffic goes to your database,
                        and iCloud sync goes to your iCloud.{' '}
                        <a href="/privacy" className={PROSE_LINK}>Read the privacy policy</a>.
                    </p>
                    <FullLine />
                </Container>
            </SectionShell>

            <SectionShell
                id="get-it"
                label="Get it"
                headline="Free, and there is no account."
                tone="raised"
            >
                <FullLine />
                <Container>
                    <div className="flex flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <AppStoreBadge location="ios-page-footer" />
                        <Button variant="secondary" href="/download" onClick={() => trackDownload('ios-page')}>
                            <AppleGlyph />
                            Download for Mac
                        </Button>
                    </div>
                    <FullLine />
                </Container>
                <FootNote>
                    Open source under AGPLv3, in the{' '}
                    <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className={PROSE_LINK}>
                        same repository
                    </a>{' '}
                    as the Mac app. The two version separately: this one is 1.0.
                </FootNote>
            </SectionShell>

            <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
