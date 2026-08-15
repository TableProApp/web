import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { getDatabaseBySlug } from '@/data/databases';
import SectionLabel from '@/components/ui/section-label';
import { FullLine } from '@/components/ui/full-line';

interface Props {
    slug: string;
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

function buildAppJsonLd(name: string, description: string, slug: string, stars?: number | null): object {
    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `TablePro - ${name} Client`,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS 14+',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description,
        url: `https://tablepro.app/${slug}`,
        downloadUrl: 'https://tablepro.app/download',
    };

    if (stars && stars > 0) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            ratingCount: stars,
            bestRating: '5',
            worstRating: '1',
        };
    }

    return data;
}

export default function DatabaseClient({ slug, downloadUrls, githubStars }: Props) {
    const db = getDatabaseBySlug(slug);

    if (!db) return null;

    const title = `${db.name} GUI Client for Mac - Free & Native | TablePro`;
    const jsonLd: object[] = [buildAppJsonLd(db.name, db.description, db.slug, githubStars)];

    if (db.faqs && db.faqs.length > 0) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: db.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
        });
    }

    if (db.howToSteps && db.howToSteps.length > 0) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `How to connect to ${db.name} with TablePro`,
            description: `Connect to a ${db.name} database from TablePro on macOS in four steps.`,
            totalTime: 'PT3M',
            tool: [{ '@type': 'HowToTool', name: 'TablePro' }],
            step: db.howToSteps.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                name: step.name,
                text: step.text,
            })),
        });
    }

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={title}
                description={db.description}
                canonical={`/${db.slug}`}
                ogImage={`/og/database/${db.slug}.png`}
                jsonLd={jsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: db.name, path: `/${db.slug}` },
                ]}
            />

                {/* Hero */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <div className="flex items-center gap-3 pl-4">
                        <img src={db.icon} alt={db.name} className="size-8" width={32} height={32} />
                        <SectionLabel>
                            {db.name} Client
                        </SectionLabel>
                    </div>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h1 className="pl-4 text-4xl font-bold text-pretty sm:text-5xl lg:text-6xl">
                        {db.tagline}
                    </h1>
                    <FullLine />
                </Container>

                <div className="h-2" />

                <Container>
                    <FullLine />
                    <p className="max-w-3xl pl-4 text-lg leading-relaxed text-muted-foreground">
                        {db.longDescription}
                    </p>
                    <FullLine />
                </Container>

                <div className="h-6" />

                <Container>
                    <FullLine />
                    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row">
                        <a
                            href="/download"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                            Download for Mac
                        </a>
                        <a
                            href={`https://docs.tablepro.app/databases/${db.docsPath}`}
                            className="inline-flex items-center gap-2 rounded-full border border-rule px-6 py-3 text-sm font-semibold text-foreground transition-colors"
                        >
                            Read the docs
                        </a>
                    </div>
                    <FullLine />
                </Container>

                {/* App Screenshot */}
                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <picture className="hidden dark:contents">
                        <source
                            type="image/webp"
                            srcSet="/images/app-dark-1280.webp 1280w, /images/app-dark-1920.webp 1920w, /images/app-dark.webp 3024w"
                        />
                        <img
                            src="/images/app-dark.png"
                            alt={`TablePro connected to a ${db.name} database showing the data grid and SQL editor`}
                            width={3024}
                            height={1720}
                            className="w-full rounded-xl border border-rule shadow-sm"
                        />
                    </picture>
                    <picture className="contents dark:hidden">
                        <source
                            type="image/webp"
                            srcSet="/images/app-light-1280.webp 1280w, /images/app-light-1920.webp 1920w, /images/app-light.webp 3024w"
                        />
                        <img
                            src="/images/app-light.png"
                            alt={`TablePro connected to a ${db.name} database showing the data grid and SQL editor`}
                            width={3024}
                            height={1720}
                            className="w-full rounded-xl border border-rule shadow-sm"
                        />
                    </picture>
                </Container>
                <FullLine />

                {/* Features */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Features
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Built for {db.name}.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {db.features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className={`border-rule p-6 sm:p-8 ${
                                    i % 2 === 0 ? 'sm:border-r' : ''
                                } ${i < db.features.length - 2 ? 'border-b' : i < db.features.length - 1 ? 'max-sm:border-b' : ''}`}
                            >
                                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </Container>
                <FullLine />

                {/* Data Grid Screenshot */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Data Grid
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Browse and edit data.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-2" />

                <Container>
                    <FullLine />
                    <p className="max-w-2xl pl-4 text-base text-muted-foreground">
                        Sort, filter, and edit {db.name} data in a spreadsheet-like grid. Click any cell to edit.
                        Insert and delete rows. Review changes before saving.
                    </p>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="p-4 sm:p-6">
                        <img
                            src="/images/features/data-grid-light.png"
                            alt={`TablePro data grid showing ${db.name} table rows with inline editing`}
                            className="w-full rounded-lg border border-rule shadow-sm dark:hidden"
                            loading="lazy"
                        />
                        <img
                            src="/images/features/data-grid-dark.png"
                            alt={`TablePro data grid showing ${db.name} table rows with inline editing`}
                            className="hidden w-full rounded-lg border border-rule shadow-sm dark:block"
                            loading="lazy"
                        />
                    </div>
                </Container>
                <FullLine />

                {/* SQL Editor Screenshot */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        SQL Editor
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Write queries faster.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-2" />

                <Container>
                    <FullLine />
                    <p className="max-w-2xl pl-4 text-base text-muted-foreground">
                        Tree-sitter syntax highlighting, schema-aware autocomplete, multi-tab, Vim mode, and full-text query history.
                        AI assistant can write, explain, or optimize your SQL.
                    </p>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="p-4 sm:p-6">
                        <img
                            src="/images/features/sql-editor-light.png"
                            alt={`TablePro SQL editor with ${db.name} query and autocomplete`}
                            className="w-full rounded-lg border border-rule shadow-sm dark:hidden"
                            loading="lazy"
                        />
                        <img
                            src="/images/features/sql-editor-dark.png"
                            alt={`TablePro SQL editor with ${db.name} query and autocomplete`}
                            className="hidden w-full rounded-lg border border-rule shadow-sm dark:block"
                            loading="lazy"
                        />
                    </div>
                </Container>
                <FullLine />

                {/* What You Can Do */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Capabilities
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        What you can do.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="p-6 sm:p-8">
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {db.capabilities.map((cap) => (
                                <li key={cap} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <svg className="mt-0.5 size-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>{cap}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
                <FullLine />

                {/* Connection Info */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Connect
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Get connected in seconds.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* Code snippet */}
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <div className="overflow-x-auto rounded-lg border border-rule-strong bg-gray-950/[2.5%] p-4 dark:bg-white/[2.5%]">
                                <code className="block whitespace-pre font-mono text-sm leading-relaxed text-foreground">
                                    {db.snippet}
                                </code>
                            </div>
                        </div>

                        {/* Connection details */}
                        <div className="p-6 sm:p-8">
                            <h3 className="text-base font-semibold text-foreground">Supported versions</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{db.supportedVersions}</p>

                            <h3 className="mt-6 text-base font-semibold text-foreground">Connection types</h3>
                            <ul className="mt-2 space-y-1">
                                {db.connectionTypes.map((type) => (
                                    <li key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="block size-1.5 rounded-full bg-primary" />
                                        {type}
                                    </li>
                                ))}
                            </ul>

                            {db.defaultPort && (
                                <>
                                    <h3 className="mt-6 text-base font-semibold text-foreground">Default port</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{db.defaultPort}</p>
                                </>
                            )}
                        </div>
                    </div>
                </Container>
                <FullLine />

                {/* How to connect */}
                {db.howToSteps && db.howToSteps.length > 0 && (
                    <>
                        <div className="h-12 sm:h-16 lg:h-24" />

                        <Container>
                            <FullLine />
                            <SectionLabel className="pl-4">
                                How to
                            </SectionLabel>
                            <FullLine />
                        </Container>

                        <div className="h-4" />

                        <Container>
                            <FullLine />
                            <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                                Connect to {db.name} in four steps.
                            </h2>
                            <FullLine />
                        </Container>

                        <div className="h-6 sm:h-8 lg:h-10" />

                        <FullLine />
                        <Container>
                            <ol className="divide-y divide-rule">
                                {db.howToSteps.map((step, idx) => (
                                    <li key={step.name} className="grid grid-cols-[auto_1fr] gap-6 p-6 sm:p-8">
                                        <div className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-semibold text-primary-strong">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{step.name}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </Container>
                        <FullLine />
                    </>
                )}

                {/* FAQ */}
                {db.faqs && db.faqs.length > 0 && (
                    <>
                        <div className="h-12 sm:h-16 lg:h-24" />

                        <Container>
                            <FullLine />
                            <SectionLabel className="pl-4">
                                FAQ
                            </SectionLabel>
                            <FullLine />
                        </Container>

                        <div className="h-4" />

                        <Container>
                            <FullLine />
                            <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                                Common {db.name} questions.
                            </h2>
                            <FullLine />
                        </Container>

                        <div className="h-6 sm:h-8 lg:h-10" />

                        <FullLine />
                        <Container>
                            <dl className="divide-y divide-rule">
                                {db.faqs.map((faq) => (
                                    <details key={faq.question} className="group p-6 sm:p-8">
                                        <summary className="flex cursor-pointer items-start justify-between gap-6 text-base font-semibold text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                                            <span>{faq.question}</span>
                                            <svg className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </summary>
                                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                                    </details>
                                ))}
                            </dl>
                        </Container>
                        <FullLine />
                    </>
                )}

                {/* CTA */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <div className="px-4 py-12 text-center sm:py-16">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Try TablePro for free.
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Free and open-source. macOS 14+. Apple Silicon and Intel.
                        </p>
                        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <a
                                href="/download"
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                Download for Mac
                            </a>
                            <a
                                href={`https://docs.tablepro.app/databases/${db.docsPath}`}
                                className="inline-flex items-center gap-2 rounded-full border border-rule px-6 py-3 text-sm font-semibold text-foreground transition-colors"
                            >
                                Setup guide
                            </a>
                        </div>
                    </div>
                    <FullLine />
                </Container>

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
