import comparisonsData from '../../data/comparisons.json';

export interface ComparisonRow {
    label: string;
    tablePro: string | boolean;
    competitor: string | boolean;
}

export interface BenchmarkSide {
    startup: string;
    memory: string;
    download: string;
}

export interface MigrationStep {
    title: string;
    description: string;
}

export interface ComparisonFaq {
    question: string;
    answer: string;
}

export interface ComparisonInfo {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    longDescription: string;
    rows: ComparisonRow[];
    prosTablePro: string[];
    prosCompetitor: string[];
    chooseTablePro: string;
    chooseCompetitor: string;
    verdict: string;
    keywords: string[];
    benchmarks?: { tablePro: BenchmarkSide; competitor: BenchmarkSide };
    migrationSteps?: MigrationStep[];
    faqs?: ComparisonFaq[];
    ogTableProMetaHtml?: string;
    ogCompetitorMetaHtml?: string;
    ogPunchline?: string;
    ogStatLabel?: string;
    ogStatValue?: string;
}

export const comparisons = comparisonsData as ComparisonInfo[];

export function getComparisonBySlug(slug: string): ComparisonInfo | undefined {
    return comparisons.find((c) => c.slug === slug);
}
