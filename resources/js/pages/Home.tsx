import { usePage } from '@inertiajs/react';
import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import SpecStrip from '@/components/landing/spec-strip';
import DatabaseGrid from '@/components/landing/database-grid';
import Workbench from '@/components/landing/workbench';
import AgentsMcp from '@/components/landing/agents-mcp';
import Safety from '@/components/landing/safety';
import DownloadRail from '@/components/landing/download-rail';
import SwitchFrom from '@/components/landing/switch-from';
import CompareTable from '@/components/landing/compare-table';
import Pricing from '@/components/landing/pricing';
import FooterCTA from '@/components/landing/footer-cta';
import Footer from '@/components/landing/footer';
import SEOHead from '@/components/seo/seo-head';
import { buildOrganizationJsonLd } from '@/lib/structured-data';
import { STARTER_PRICE, TEAM_SEAT_PRICE } from '@/data/pricing';

interface LatestRelease {
    version: string | null;
    publishedAt: string | null;
    countLast30Days: number | null;
}

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
    latestRelease?: LatestRelease | null;
    paymentProvider: string;
    teamMinSeats: number;
}

/**
 * Keyword-first, like every other template on this site.
 *
 * The old title led with the brand and spent its tail on "for 25 Databases",
 * which nobody types, while omitting `free` and `open source` — the two
 * modifiers TablePro owns outright against TablePlus, DataGrip and Navicat.
 * `Compare.tsx` is already `${name} Alternative for Mac - Free & Native |
 * TablePro` and `DatabaseClient.tsx` is `${name} GUI Client for Mac - Free &
 * Native | TablePro`; the homepage was the only page doing it backwards.
 *
 * 52 characters, against a desktop cutoff around 580px.
 */
const HOME_TITLE = 'TablePro - Free, Open Source Database Client for Mac';

/**
 * 144 characters. The old one was 156 and truncated mid-word at "…Free and open
 * sour" on desktop; on mobile the whole snippet became five database names that
 * /mysql-client and its 25 siblings already own with their own descriptions.
 *
 * Sentence one is byte-identical to the hero's opening sentence, so the snippet
 * and the landing experience say the same thing — and it is the sentence an
 * answer engine lifts for "what is TablePro".
 */
const HOME_DESCRIPTION =
    'TablePro is a free, open source database client for macOS. 25 engines through native drivers, in a 20 MB Swift app that opens in under a second.';

const FEATURE_LIST = [
    '25 databases through native drivers',
    'SQL editor with tree-sitter highlighting and Vim mode',
    'Editable data grid with deferred commit',
    '13 AI providers, bring your own key',
    'Built-in MCP server with 16 tools',
    'Six-level Safe Mode with Touch ID',
    'Built-in SSH tunnels with jump hosts',
    'ER diagrams and EXPLAIN visualization',
    'Users and roles management',
    'iCloud Sync with an iPhone and iPad app',
];

function buildAppJsonLd(
    canonicalBaseUrl: string,
    teamMinSeats: number,
    latestRelease?: LatestRelease | null,
    githubStars?: number | null,
): object {
    const base = canonicalBaseUrl.replace(/\/$/, '');

    const offer = (name: string, price: number, seatMin?: number) => ({
        '@type': 'Offer',
        name,
        price: String(price),
        priceCurrency: 'USD',
        url: `${base}/#pricing`,
        availability: 'https://schema.org/InStock',
        ...(seatMin
            ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: seatMin, unitText: 'seat' } }
            : {}),
    });

    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${base}/#app`,
        name: 'TablePro',
        alternateName: 'TablePro Database Client',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Database Client',
        /*
         * `macOS`, not `macOS 14+, iOS 18+`. One node cannot stand for two
         * applications, and this one's downloadUrl is a Mac-only page. The
         * floor moves to softwareRequirements, where it belongs.
         */
        operatingSystem: 'macOS',
        softwareRequirements: 'macOS 14.0 or later, Apple Silicon or Intel',
        description: HOME_DESCRIPTION,
        disambiguatingDescription:
            'TablePro is a native macOS GUI client for 25 database engines, written in Swift rather than Electron or Java, and released as open source under AGPLv3.',
        // Every URL from canonicalBaseUrl. Four of these used to hardcode the
        // production origin while `screenshot` did not, so one object carried
        // two origins on any non-production host.
        url: base,
        downloadUrl: `${base}/download`,
        installUrl: `${base}/download`,
        fileSize: '20 MB',
        license: 'https://github.com/TableProApp/TablePro/blob/main/LICENSE',
        isAccessibleForFree: true,
        screenshot: `${base}/images/app-light.png`,
        featureList: FEATURE_LIST,
        publisher: { '@id': `${base}/#organization` },
        author: { '@id': `${base}/#organization` },
        /*
         * Seven real price points, enumerated, instead of `offerCount: '4'`
         * against a highPrice with no indication that Team is priced per seat.
         */
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '0',
            highPrice: String(STARTER_PRICE.lifetime),
            offerCount: 7,
            url: `${base}/#pricing`,
            offers: [
                {
                    '@type': 'Offer',
                    name: 'Free',
                    price: '0',
                    priceCurrency: 'USD',
                    url: `${base}/download`,
                    availability: 'https://schema.org/InStock',
                },
                offer('Starter, monthly', STARTER_PRICE.monthly),
                offer('Starter, yearly', STARTER_PRICE.yearly),
                offer('Starter, lifetime', STARTER_PRICE.lifetime),
                offer('Team, per seat, monthly', TEAM_SEAT_PRICE.monthly, teamMinSeats),
                offer('Team, per seat, yearly', TEAM_SEAT_PRICE.yearly, teamMinSeats),
                offer('Team, per seat, lifetime', TEAM_SEAT_PRICE.lifetime, teamMinSeats),
            ],
        },
    };

    if (latestRelease?.version) {
        data.softwareVersion = latestRelease.version;
    }

    /*
     * `dateModified` only. `datePublished` was set to the *latest* release
     * date, so the markup asserted the app was first published last week — and
     * the claim moved forward again on every release.
     */
    if (latestRelease?.publishedAt) {
        data.dateModified = latestRelease.publishedAt;
        data.releaseNotes = 'https://docs.tablepro.app/changelog';
    }

    /*
     * The honest popularity signal. Not `aggregateRating`: a star is not a
     * review, and StaleClaimsTest forbids the string in this file for exactly
     * that reason. This says "N people starred this", which is true.
     */
    if (githubStars && githubStars > 0) {
        data.interactionStatistic = {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: githubStars,
        };
    }

    return data;
}

export default function Home({
    downloadUrls,
    githubStars,
    latestRelease,
    paymentProvider,
    teamMinSeats,
}: Props) {
    const { canonicalBaseUrl } = usePage<{ canonicalBaseUrl: string }>().props;

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={HOME_TITLE}
                description={HOME_DESCRIPTION}
                canonical="/"
                /*
                 * No FAQPage. Google retired the FAQ rich result on 7 May 2026,
                 * so the markup earns nothing in Search — and it published a
                 * second FAQPage entity on this domain, competing with /faq,
                 * which serves a strict superset of the same questions. /faq
                 * owns that entity uncontested now.
                 */
                jsonLd={[
                    buildAppJsonLd(canonicalBaseUrl, teamMinSeats, latestRelease, githubStars),
                    buildOrganizationJsonLd(canonicalBaseUrl),
                ]}
            />

            {/*
              * Nine headed sections and two headless rails, down from eighteen
              * blocks and fifteen H2s.
              *
              * The rule that produced this order came from the design system
              * rather than from a word budget: a section earns an H2 only if it
              * owns a data artifact — a table, a ledger, a grid or a screenshot.
              * Architecture, OpenSource and ObjectionRow owned none, and every
              * argument they made has a URL on this site that already ranks for
              * it. What they said that was load-bearing moved to the section
              * that proves it.
              */}
            <Hero githubStars={githubStars} latestRelease={latestRelease} />
            <SpecStrip latestRelease={latestRelease} />
            <DatabaseGrid />

            {/* Conviction peaks at the screenshots, so a download follows them. */}
            <Workbench />
            <DownloadRail
                location="workbench"
                note="Open a database and press ⌘⏎. macOS 14+, Apple Silicon and Intel."
            />

            {/*
              * "Moving costs you nothing", then the numbers that say why you
              * would. CompareTable replaces SwitchFrom's ten competitor chips at
              * the same scroll position with three linked columns, which is a
              * net reduction of seven exits at the highest-intent moment.
              */}
            <SwitchFrom />
            <CompareTable />

            {/*
              * Agents raises the most alarming claim on the page — "let Claude
              * query your database" — and Safety is its answer. Adjacency does
              * that work, and adjacency is free.
              */}
            <AgentsMcp />
            <Safety />
            <DownloadRail
                location="safety"
                note="Safe Mode is on before you connect anything. macOS 14+, Apple Silicon and Intel."
            />

            <Pricing paymentProvider={paymentProvider} teamMinSeats={teamMinSeats} />
            <FooterCTA />
        </LandingLayout>
    );
}
