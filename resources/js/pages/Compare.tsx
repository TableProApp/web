import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { getComparisonBySlug } from '@/data/comparisons';
import { PageHeader, SectionHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import Button from '@/components/ui/button';
import { AppleGlyph, Availability, CheckGlyph } from '@/components/ui/glyph';
import FaqList from '@/components/ui/faq-list';
import ThemedImage from '@/components/ui/themed-image';
import DataTable, { TABLE_COLUMN_RULE, TABLE_ROW_RULE } from '@/components/ui/data-table';

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


function CellValue({ value }: { value: string | boolean }) {
    if (typeof value === 'boolean') return <Availability included={value} />;
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
                <PageHeader label="Compare" headline={comp.tagline} lede={comp.longDescription} />
{/* Comparison Table */}
                <div className="h-8 sm:h-12 lg:h-16" />

                <FullLine />
                <Container>
                    {/*
                      * Same shape as the plan comparison on the homepage: a real
                      * table, column separators at the column weight, and the
                      * scroll container reachable by keyboard. This was a grid of
                      * divs with no table semantics, drawing its columns at the
                      * row weight — in the one table where the columns carry the
                      * entire meaning.
                      */}
                    <div
                        className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
                        tabIndex={0}
                        role="region"
                        aria-label={`TablePro compared with ${comp.name}`}
                    >
                        <DataTable
                            className="min-w-[400px]"
                            caption={`Feature comparison between TablePro and ${comp.name}`}
                        >
                            <thead>
                                <tr>
                                    <th scope="col" className="p-4 text-left text-sm font-medium text-muted-foreground sm:p-5">
                                        Feature
                                    </th>
                                    <th scope="col" className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 p-4 text-center text-sm font-bold text-primary-strong sm:p-5`}>
                                        TablePro
                                    </th>
                                    <th scope="col" className={`border-l ${TABLE_COLUMN_RULE} p-4 text-center text-sm font-medium text-muted-foreground sm:p-5`}>
                                        {comp.name}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {comp.rows.map((row) => (
                                    <tr key={row.label} className={`border-t ${TABLE_ROW_RULE}`}>
                                        <th scope="row" className="p-4 text-left text-sm font-normal text-foreground sm:p-5">
                                            {row.label}
                                        </th>
                                        <td className={`border-l ${TABLE_COLUMN_RULE} bg-primary/5 p-4 text-center sm:p-5`}>
                                            <CellValue value={row.tablePro} />
                                        </td>
                                        <td className={`border-l ${TABLE_COLUMN_RULE} p-4 text-center sm:p-5`}>
                                            <CellValue value={row.competitor} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    </div>
                </Container>
                <FullLine />

                {/* Benchmarks */}
                {comp.benchmarks && (
                    <>
                        <SectionHeader
                            label="Benchmarks"
                            headline="The numbers."
                        />
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
                <SectionHeader
                    label="Summary"
                    headline="Strengths of each."
                />
                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* TablePro pros */}
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <h3 className="text-base font-semibold text-primary-strong">TablePro</h3>
                            <ul className="mt-4 space-y-3">
                                {comp.prosTablePro.map((pro) => (
                                    <li key={pro} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <CheckGlyph />
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
                                        <CheckGlyph />
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
                        <SectionHeader
                            label="Migration"
                            headline={<>Switch from {comp.name}.</>}
                        />
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
                <SectionHeader
                    label="TablePro"
                    headline="See it in action."
                />
                <FullLine />
                <Container>
                    <ThemedImage
                        light={{ src: '/images/app-light.png', webpSrcSet: '/images/app-light-1280.webp 1280w, /images/app-light-1920.webp 1920w, /images/app-light.webp 3024w' }}
                        dark={{ src: '/images/app-dark.png', webpSrcSet: '/images/app-dark-1280.webp 1280w, /images/app-dark-1920.webp 1920w, /images/app-dark.webp 3024w' }}
                        alt="TablePro interface showing the data grid and SQL editor"
                        width={3024}
                        height={1720}
                        sizes="(min-width: 1024px) 1216px, 100vw"
                        className="app-plate w-full"
                    />
                </Container>
                <FullLine />

                {/* Who Should Choose What */}
                <SectionHeader
                    label="Decision"
                    headline="Which one is right for you?"
                />
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
                <SectionHeader label="Verdict" headline="The short answer." />
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
                        <SectionHeader
                            label="FAQ"
                            headline="Common questions."
                        />
                        <FullLine />
                        <Container>
                            <FaqList items={comp.faqs} />
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
                                <AppleGlyph />
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
