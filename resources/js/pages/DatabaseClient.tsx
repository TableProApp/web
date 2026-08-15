import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { getDatabaseBySlug } from '@/data/databases';
import { PageHeader, SectionHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import Button from '@/components/ui/button';
import { AppleGlyph, CheckGlyph } from '@/components/ui/glyph';
import FaqList from '@/components/ui/faq-list';
import ThemedImage from '@/components/ui/themed-image';
import { ITEM_TITLE } from '@/components/ui/grid-cell';
import ClosingCta from '@/components/landing/closing-cta';

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
                <PageHeader
                    label={
                        <span className="flex items-center gap-3">
                            <img src={db.icon} alt={db.name} className="size-8" width={32} height={32} />
                            {db.name} Client
                        </span>
                    }
                    headline={db.tagline}
                    lede={db.longDescription}
                />

<div className="h-6" />

                <Container>
                    <FullLine />
                    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row">
                        <Button
                            href="/download"
                        >
                            <AppleGlyph />
                            Download for Mac
                        </Button>
                        <Button variant="secondary"
                            href={`https://docs.tablepro.app/databases/${db.docsPath}`}
                        >
                            Read the docs
                        </Button>
                    </div>
                    <FullLine />
                </Container>

                {/* App Screenshot */}
                <div className="h-6 sm:h-8 lg:h-10" />

                <FullLine />
                <Container>
                    <ThemedImage
                        light={{ src: '/images/app-light.png', webpSrcSet: '/images/app-light-1280.webp 1280w, /images/app-light-1920.webp 1920w, /images/app-light.webp 3024w' }}
                        dark={{ src: '/images/app-dark.png', webpSrcSet: '/images/app-dark-1280.webp 1280w, /images/app-dark-1920.webp 1920w, /images/app-dark.webp 3024w' }}
                        alt={`TablePro connected to a ${db.name} database showing the data grid and SQL editor`}
                        width={3024}
                        height={1720}
                        sizes="(min-width: 1024px) 1216px, 100vw"
                        className="app-plate w-full"
                    />
                </Container>
                <FullLine />

                {/* Features */}
                <SectionHeader
                    label="Features"
                    headline={<>Built for {db.name}.</>}
                />
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
                                <h3 className={ITEM_TITLE}>{feature.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </Container>
                <FullLine />

                {/* Data Grid Screenshot */}
                <SectionHeader
                    label="Data Grid"
                    headline="Browse and edit data."
                    lede={<>Sort, filter, and edit {db.name} data in a spreadsheet-like grid. Click any cell to edit. Insert and delete rows. Review changes before saving.</>}
                />
                <FullLine />
                <Container>
                    <div className="p-4 sm:p-6">
                        <ThemedImage
                            light={{ src: '/images/features/data-grid-light.png', webpSrcSet: '/images/features/data-grid-light-1216.webp 1216w, /images/features/data-grid-light-2432.webp 2432w' }}
                            dark={{ src: '/images/features/data-grid-dark.png', webpSrcSet: '/images/features/data-grid-dark-1216.webp 1216w, /images/features/data-grid-dark-2432.webp 2432w' }}
                            alt={`TablePro data grid showing ${db.name} table rows with inline editing`}
                            width={2432}
                            height={1385}
                            sizes="(min-width: 1024px) 1216px, 100vw"
                            className="app-plate w-full"
                        />
                    </div>
                </Container>
                <FullLine />

                {/* SQL Editor Screenshot */}
                <SectionHeader
                    label="SQL Editor"
                    headline="Write queries faster."
                    lede="Tree-sitter syntax highlighting, schema-aware autocomplete, multi-tab, Vim mode, and full-text query history. AI assistant can write, explain, or optimize your SQL."
                />
                <FullLine />
                <Container>
                    <div className="p-4 sm:p-6">
                        <ThemedImage
                            light={{ src: '/images/features/sql-editor-light.png', webpSrcSet: '/images/features/sql-editor-light-1216.webp 1216w, /images/features/sql-editor-light-2432.webp 2432w' }}
                            dark={{ src: '/images/features/sql-editor-dark.png', webpSrcSet: '/images/features/sql-editor-dark-1216.webp 1216w, /images/features/sql-editor-dark-2432.webp 2432w' }}
                            alt={`TablePro SQL editor with ${db.name} query and autocomplete`}
                            width={2432}
                            height={1385}
                            sizes="(min-width: 1024px) 1216px, 100vw"
                            className="app-plate w-full"
                        />
                    </div>
                </Container>
                <FullLine />

                {/* What You Can Do */}
                <SectionHeader
                    label="Capabilities"
                    headline="What you can do."
                />
                <FullLine />
                <Container>
                    <div className="p-6 sm:p-8">
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {db.capabilities.map((cap) => (
                                <li key={cap} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckGlyph />
                                    <span>{cap}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Container>
                <FullLine />

                {/* Connection Info */}
                <SectionHeader
                    label="Connect"
                    headline="Get connected in seconds."
                />
                <FullLine />
                <Container>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* Code snippet */}
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <div tabIndex={0} role="region" aria-label="Connection snippet" className="overflow-x-auto rounded-lg border border-rule-strong bg-surface-raised p-4">
                                <code className="block whitespace-pre font-mono text-sm text-foreground">
                                    {db.snippet}
                                </code>
                            </div>
                        </div>

                        {/* Connection details */}
                        <div className="p-6 sm:p-8">
                            <h3 className={ITEM_TITLE}>Supported versions</h3>
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
                        <SectionHeader
                            label="How to"
                            headline={<>Connect to {db.name} in four steps.</>}
                        />
                        <FullLine />
                        <Container>
                            <ol className="divide-y divide-rule">
                                {db.howToSteps.map((step, idx) => (
                                    <li key={step.name} className="grid grid-cols-[auto_1fr] gap-6 p-6 sm:p-8">
                                        <div className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-sm font-semibold text-primary-strong">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h3 className={ITEM_TITLE}>{step.name}</h3>
                                            <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
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
                        <SectionHeader
                            label="FAQ"
                            headline={<>Common {db.name} questions.</>}
                        />
                        <FullLine />
                        <Container>
                            <FaqList items={db.faqs} />
                        </Container>
                        <FullLine />
                    </>
                )}
                <ClosingCta>
                    <Button variant="secondary"
                                href={`https://docs.tablepro.app/databases/${db.docsPath}`}
                            >
                                Setup guide
                            </Button>
                </ClosingCta>
<div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
