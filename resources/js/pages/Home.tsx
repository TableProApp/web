import { usePage } from '@inertiajs/react';
import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import SpecStrip from '@/components/landing/spec-strip';
import Sponsors from '@/components/landing/sponsors';
import DatabaseGrid from '@/components/landing/database-grid';
import Workbench from '@/components/landing/workbench';
import Architecture from '@/components/landing/architecture';
import AgentsMcp from '@/components/landing/agents-mcp';
import Mobile from '@/components/landing/mobile';
import ObjectionRow from '@/components/landing/objection-row';
import Safety from '@/components/landing/safety';
import DepthGrid from '@/components/landing/depth-grid';
import DownloadRail from '@/components/landing/download-rail';
import SwitchFrom from '@/components/landing/switch-from';
import OpenSource from '@/components/landing/open-source';
import Pricing from '@/components/landing/pricing';
import FAQ from '@/components/landing/faq';
import FooterCTA from '@/components/landing/footer-cta';
import Footer from '@/components/landing/footer';
import SEOHead from '@/components/seo/seo-head';
import { buildOrganizationJsonLd } from '@/lib/structured-data';
import { homeFaqs } from '@/data/home-faqs';

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

function buildFaqJsonLd(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: homeFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
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
                jsonLd={[
                    buildAppJsonLd(canonicalBaseUrl, latestRelease),
                    buildOrganizationJsonLd(canonicalBaseUrl),
                    buildFaqJsonLd(),
                ]}
            />

            <Hero githubStars={githubStars} latestRelease={latestRelease} />
            <SpecStrip latestRelease={latestRelease} />
            {/* Sponsors sit high on purpose: the visible credit is what attracts the next one. */}
            <Sponsors />

            {/*
              * The two questions that stop a download, answered while the
              * reader is still deciding whether to keep scrolling rather than
              * at position fifteen.
              */}
            <ObjectionRow />

            <DatabaseGrid />

            {/*
              * "Here is what it does", then "and moving costs you nothing".
              * SwitchFrom used to sit at position eleven, after roughly 1,800
              * words, so the one argument aimed squarely at a TablePlus or
              * DBeaver user read as a footnote.
              */}
            <Workbench />
            <SwitchFrom />
            <DownloadRail
                location="switch"
                note="Your existing connections import on first launch. macOS 14+, Apple Silicon and Intel."
            />

            <Architecture />

            {/*
              * Agents raises the most alarming claim on the page — "let Claude
              * query your database" — and Safety is its answer. They used to be
              * separated by 274 words about iCloud sync, which left the anxiety
              * sitting unresolved through an unrelated section.
              */}
            <AgentsMcp />
            <Safety />
            <DownloadRail
                location="safety"
                note="Safe Mode is on before you connect anything. macOS 14+, Apple Silicon and Intel."
            />

            <DepthGrid />
            <OpenSource latestRelease={latestRelease} />
            <Pricing paymentProvider={paymentProvider} teamMinSeats={teamMinSeats} />

            {/*
              * Mobile lands after Pricing rather than at the midpoint. It admits
              * a paywall, opens an email gate and disclaims a platform that does
              * not exist yet — three deceleration moments, none of which advance
              * a Mac download. After the prices, "requires a licence" is on
              * message instead of a surprise.
              */}
            <Mobile />
            <FAQ items={homeFaqs} />

            <FooterCTA />
        </LandingLayout>
    );
}
