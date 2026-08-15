import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { getComparisonBySlug } from '@/data/comparisons';
import SectionLabel from '@/components/ui/section-label';
import { FullLine } from '@/components/ui/full-line';
import Button from '@/components/ui/button';

interface Props {
    slug: string;
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

/**
 * These two glyphs are the entire content of the comparison column, so they
 * carry the meaning on their own and are held to the 3:1 floor for graphical
 * objects — plus a text alternative, because colour and shape alone say nothing
 * to a screen reader.
 *
 * `--primary` measured 2.50:1 on the tinted TablePro column, and the cross at
 * `muted-foreground/30` measured 1.51:1: both were effectively invisible to
 * anyone who needed them most.
 */
function Check() {
    return (
        <>
            <span className="sr-only">Included</span>
            <svg
                className="size-4 text-primary-strong"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </>
    );
}

function Cross() {
    return (
        <>
            <span className="sr-only">Not included</span>
            <svg
                className="size-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </>
    );
}

function CellValue({ value }: { value: string | boolean }) {
    if (typeof value === 'boolean') return value ? <Check /> : <Cross />;
    return <span className="text-sm text-muted-foreground">{value}</span>;
}

export default function Compare({ slug, downloadUrls, githubStars }: Props) {
    const comp = getComparisonBySlug(slug);

    if (!comp) return null;

    const title = `${comp.name} Alternative for Mac - Free & Native | TablePro`;
    const canonical = `/compare/${comp.slug}`;
    const ogImage = `/og/compare/${comp.slug}.png`;

    /**
     * No aggregateRating here. GitHub stars are not review ratings, and deriving
     * one from them publishes a rating nobody gave.
     */
    const softwareApplication: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'TablePro',
        operatingSystem: 'macOS',
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };

    const jsonLd: Array<Record<string, unknown>> = [
        softwareApplication,
        {
            '@context': 'https://schema.org',
            '@type': 'Review',
            itemReviewed: {
                '@type': 'SoftwareApplication',
                name: comp.name,
                operatingSystem: 'macOS',
                applicationCategory: 'DeveloperApplication',
            },
            author: { '@type': 'Organization', name: 'TablePro' },
            /**
             * No reviewRating. The verdict below is a real written assessment,
             * but the score that used to sit here was a hardcoded 4.5 applied
             * identically to all ten competitors, which is not an assessment.
             */
            reviewBody: comp.verdict,
        },
    ];

    if (comp.faqs && comp.faqs.length > 0) {
        jsonLd.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: comp.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
        });
    }

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={title}
                description={comp.description}
                canonical={canonical}
                ogImage={ogImage}
                jsonLd={jsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Compare', path: '/compare' },
                    { name: comp.name, path: canonical },
                ]}
            />

                {/* Hero */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Compare
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h1 className="pl-4 text-4xl font-bold text-pretty sm:text-5xl lg:text-6xl">
                        {comp.tagline}
                    </h1>
                    <FullLine />
                </Container>

                <div className="h-2" />

                <Container>
                    <FullLine />
                    <p className="max-w-3xl pl-4 text-lg leading-relaxed text-muted-foreground">
                        {comp.longDescription}
                    </p>
                    <FullLine />
                </Container>

                {/* Comparison Table */}
                <div className="h-8 sm:h-12 lg:h-16" />

                <FullLine />
                <Container>
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="min-w-[400px]">
                            {/* Header */}
                            <div className="grid grid-cols-3">
                                <div className="border-rule p-4 sm:p-5">
                                    <span className="text-sm font-medium text-muted-foreground">Feature</span>
                                </div>
                                <div className="border-l border-rule bg-primary/5 p-4 text-center sm:p-5">
                                    <span className="text-sm font-bold text-primary-strong">TablePro</span>
                                </div>
                                <div className="border-l border-rule p-4 text-center sm:p-5">
                                    <span className="text-sm font-medium text-muted-foreground">{comp.name}</span>
                                </div>
                            </div>

                            {/* Rows */}
                            {comp.rows.map((row) => (
                                <div key={row.label} className="grid grid-cols-3 border-t border-rule">
                                    <div className="p-4 sm:p-5">
                                        <span className="text-sm font-medium text-foreground">{row.label}</span>
                                    </div>
                                    <div className="flex items-center justify-center border-l border-rule bg-primary/5 p-4 sm:p-5">
                                        <CellValue value={row.tablePro} />
                                    </div>
                                    <div className="flex items-center justify-center border-l border-rule p-4 sm:p-5">
                                        <CellValue value={row.competitor} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
                <FullLine />

                {/* Benchmarks */}
                {comp.benchmarks && (
                    <>
                        <div className="h-12 sm:h-16 lg:h-24" />

                        <Container>
                            <FullLine />
                            <SectionLabel className="pl-4">
                                Benchmarks
                            </SectionLabel>
                            <FullLine />
                        </Container>

                        <div className="h-4" />

                        <Container>
                            <FullLine />
                            <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                                The numbers.
                            </h2>
                            <FullLine />
                        </Container>

                        <div className="h-6 sm:h-8 lg:h-10" />

                        <FullLine />
                        <Container>
                            <div className="grid grid-cols-1 sm:grid-cols-3">
                                {(['startup', 'memory', 'download'] as const).map((metric) => {
                                    const labels: Record<typeof metric, string> = {
                                        startup: 'Cold start',
                                        memory: 'RAM idle',
                                        download: 'Download size',
                                    };
                                    return (
                                        <div key={metric} className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8 sm:last:border-r-0">
                                            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{labels[metric]}</p>
                                            <div className="mt-4 flex items-baseline gap-3">
                                                <span className="text-3xl font-bold text-primary-strong">{comp.benchmarks!.tablePro[metric]}</span>
                                                <span className="text-xs text-muted-foreground">TablePro</span>
                                            </div>
                                            <div className="mt-2 flex items-baseline gap-3">
                                                <span className="text-2xl font-semibold text-muted-foreground-subtle">{comp.benchmarks!.competitor[metric]}</span>
                                                <span className="text-xs text-muted-foreground">{comp.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Container>
                        <FullLine />
                    </>
                )}

                {/* Pros */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Summary
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Strengths of each.
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* TablePro pros */}
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <h3 className="text-base font-semibold text-primary-strong">TablePro</h3>
                            <ul className="mt-4 space-y-3">
                                {comp.prosTablePro.map((pro) => (
                                    <li key={pro} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Check />
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Competitor pros */}
                        <div className="p-6 sm:p-8">
                            <h3 className="text-base font-semibold text-foreground">{comp.name}</h3>
                            <ul className="mt-4 space-y-3">
                                {comp.prosCompetitor.map((pro) => (
                                    <li key={pro} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Check />
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
                <FullLine />

                {/* Migration guide */}
                {comp.migrationSteps && comp.migrationSteps.length > 0 && (
                    <>
                        <div className="h-12 sm:h-16 lg:h-24" />

                        <Container>
                            <FullLine />
                            <SectionLabel className="pl-4">
                                Migration
                            </SectionLabel>
                            <FullLine />
                        </Container>

                        <div className="h-4" />

                        <Container>
                            <FullLine />
                            <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                                Switch from {comp.name}.
                            </h2>
                            <FullLine />
                        </Container>

                        <div className="h-6 sm:h-8 lg:h-10" />

                        <FullLine />
                        <Container>
                            <ol className="divide-y divide-rule">
                                {comp.migrationSteps.map((step, idx) => (
                                    <li key={step.title} className="grid grid-cols-[auto_1fr] gap-6 p-6 sm:p-8">
                                        <div className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-semibold text-primary-strong">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </Container>
                        <FullLine />
                    </>
                )}

                {/* App Screenshot */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        TablePro
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        See it in action.
                    </h2>
                    <FullLine />
                </Container>

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
                            alt="TablePro interface showing the data grid and SQL editor"
                            width={3024}
                            height={1720}
                            className="app-plate w-full"
                            loading="lazy"
                        />
                    </picture>
                    <picture className="contents dark:hidden">
                        <source
                            type="image/webp"
                            srcSet="/images/app-light-1280.webp 1280w, /images/app-light-1920.webp 1920w, /images/app-light.webp 3024w"
                        />
                        <img
                            src="/images/app-light.png"
                            alt="TablePro interface showing the data grid and SQL editor"
                            width={3024}
                            height={1720}
                            className="app-plate w-full"
                            loading="lazy"
                        />
                    </picture>
                </Container>
                <FullLine />

                {/* Who Should Choose What */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Decision
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h2 className="pl-4 text-3xl font-bold sm:text-4xl">
                        Which one is right for you?
                    </h2>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <h3 className="text-base font-semibold text-primary-strong">Choose TablePro if...</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{comp.chooseTablePro}</p>
                        </div>
                        <div className="p-6 sm:p-8">
                            <h3 className="text-base font-semibold text-foreground">Choose {comp.name} if...</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{comp.chooseCompetitor}</p>
                        </div>
                    </div>
                </Container>
                <FullLine />

                {/* Verdict */}
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <SectionLabel className="pl-4">
                        Verdict
                    </SectionLabel>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <FullLine />
                <Container>
                    <div className="p-6 sm:p-8">
                        <p className="text-base leading-relaxed text-foreground">
                            {comp.verdict}
                        </p>
                    </div>
                </Container>
                <FullLine />

                {/* FAQ */}
                {comp.faqs && comp.faqs.length > 0 && (
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
                                Common questions.
                            </h2>
                            <FullLine />
                        </Container>

                        <div className="h-6 sm:h-8 lg:h-10" />

                        <FullLine />
                        <Container>
                            <dl className="divide-y divide-rule">
                                {comp.faqs.map((faq) => (
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
                            Free and open-source. No account required.
                        </p>
                        <div className="mt-6">
                            <Button
                                href="/download"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                Download for Mac
                            </Button>
                        </div>
                    </div>
                    <FullLine />
                </Container>

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
