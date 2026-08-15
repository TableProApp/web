import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { Link } from '@inertiajs/react';
import SectionLabel from '@/components/ui/section-label';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';

interface PostFull {
    slug: string;
    title: string;
    description: string;
    date: string;
    dateFormatted: string;
    author: string;
    tags: string[];
    bodyHtml: string;
    readingMinutes: number;
    wordCount: number;
    url: string;
    ogImage: string;
    ogPunchline: string | null;
}

interface RelatedPost {
    slug: string;
    title: string;
    description: string;
    dateFormatted: string;
    readingMinutes: number;
    url: string;
}

interface Props {
    post: PostFull;
    relatedPosts: RelatedPost[];
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

function buildArticleJsonLd(post: PostFull, baseUrl: string): object {
    const trimmedBase = baseUrl.replace(/\/$/, '');

    const data: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        wordCount: post.wordCount,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'TablePro',
            logo: {
                '@type': 'ImageObject',
                url: `${trimmedBase}/logo.png`,
            },
        },
        image: `${trimmedBase}${post.ogImage}`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${trimmedBase}${post.url}`,
        },
    };

    if (post.tags.length > 0) {
        data.keywords = post.tags.join(', ');
        data.articleSection = post.tags[0];
    }

    return data;
}

export default function BlogPost({ post, relatedPosts, downloadUrls, githubStars }: Props) {
    const canonical = post.url;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tablepro.app';
    const articleJsonLd = buildArticleJsonLd(post, baseUrl);

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={`${post.title} - TablePro`}
                description={post.description}
                canonical={canonical}
                ogImage={post.ogImage}
                ogType="article"
                jsonLd={articleJsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Blog', path: '/blog' },
                    { name: post.title, path: post.url },
                ]}
            />
                <PageHeader
                    label="← Blog"
                    labelHref="/blog"
                    headline={post.title}
                    lede={
                        <span className="flex flex-wrap items-center gap-3">
                            <span>{post.author}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.date}>{post.dateFormatted}</time>
                        <span aria-hidden="true">·</span>
                        <span>{post.readingMinutes} min read</span>
                        </span>
                    }
                />
{post.tags.length > 0 && (
                    <>
                        <FullLine />
                        <Container>
                            <div className="flex flex-wrap gap-2 px-4 py-3">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-rule-strong px-2.5 py-1 text-xs font-mono text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Container>
                    </>
                )}

                <FullLine />
                <Container>
                    <article
                        className="blog-article max-w-3xl p-6 sm:p-8"
                        dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
                    />
                </Container>

                {relatedPosts.length > 0 && (
                    <>
                        <FullLine />
                        <Container>
                            <SectionLabel className="px-4 py-3">
                                Related
                            </SectionLabel>
                        </Container>

                        <FullLine />
                        <Container>
                            <ul className="divide-y divide-rule">
                                {relatedPosts.map((rp) => (
                                    <li key={rp.slug}>
                                        <Link
                                            href={rp.url}
                                            className="group block p-6 transition-colors hover:bg-gray-950/[1.5%] sm:p-8 dark:hover:bg-white/[1.5%]"
                                        >
                                            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                                <span>{rp.dateFormatted}</span>
                                                <span aria-hidden="true">·</span>
                                                <span>{rp.readingMinutes} min read</span>
                                            </div>
                                            <h3 className="mt-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary-strong sm:text-2xl">
                                                {rp.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {rp.description}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Container>
                    </>
                )}

                <FullLine />
                <Container>
                    <div className="px-4 py-12 text-center sm:py-16">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Try TablePro for free.
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Free, open source. macOS 14+. Apple Silicon and Intel.
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
                </Container>
                <FullLine />

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
