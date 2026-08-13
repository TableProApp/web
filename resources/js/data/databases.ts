import databasesData from '../../data/databases.json';

export interface DatabaseFeature {
    title: string;
    description: string;
}

export interface DatabaseFaq {
    question: string;
    answer: string;
}

export interface DatabaseHowToStep {
    name: string;
    text: string;
}

export interface DatabaseInfo {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    longDescription: string;
    features: DatabaseFeature[];
    capabilities: string[];
    supportedVersions: string;
    connectionTypes: string[];
    snippet: string;
    snippetLanguage: string;
    defaultPort: number | null;
    icon: string;
    keywords: string[];
    docsPath: string;
    faqs?: DatabaseFaq[];
    howToSteps?: DatabaseHowToStep[];
}

export const databases = databasesData as DatabaseInfo[];

export function getDatabaseBySlug(slug: string): DatabaseInfo | undefined {
    return databases.find((db) => db.slug === slug);
}
