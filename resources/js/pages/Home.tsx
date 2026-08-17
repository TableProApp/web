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

const HOME_TITLE = 'TablePro - Native macOS Database Client for 25 Databases';
const HOME_DESCRIPTION =
    'A native macOS database client for MySQL, PostgreSQL, MongoDB, Redis, Snowflake and 20 more. Built in Swift, no Electron. Free and open source under AGPLv3.';

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

function buildAppJsonLd(canonicalBaseUrl: string, latestRelease?: LatestRelease | null): object {
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'TablePro',
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Database Client',
        operatingSystem: 'macOS 14+, iOS 18+',
        description: HOME_DESCRIPTION,
        url: 'https://tablepro.app',
        downloadUrl: 'https://tablepro.app/download',
        license: 'https://github.com/TableProApp/TablePro/blob/main/LICENSE',
        screenshot: `${canonicalBaseUrl}/images/app-light.png`,
        featureList: FEATURE_LIST,
        offers: {
            '@type': 'AggregateOffer',
            lowPrice: '0',
            highPrice: '59',
            priceCurrency: 'USD',
            offerCount: '4',
        },
    };

    if (latestRelease?.version) {
        data.softwareVersion = latestRelease.version;
    }

    if (latestRelease?.publishedAt) {
        data.datePublished = latestRelease.publishedAt;
        data.dateModified = latestRelease.publishedAt;
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
                    buildAppJsonLd(canonicalBaseUrl, latestRelease),
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
