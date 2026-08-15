import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { Link } from '@inertiajs/react';
import SectionLabel from '@/components/ui/section-label';
import { FullLine } from '@/components/ui/full-line';

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

                <div className="h-12 sm:h-16 lg:h-24" />

                <FullLine />
                <Container>
                    <Link
                        href="/blog"
                        className="block py-3 pl-4 font-mono text-xs font-semibold uppercase tracking-widest text-primary-strong transition-opacity hover:opacity-70"
                    >
                        ← Blog
                    </Link>
                </Container>

                <FullLine />
                <Container>
                    <h1 className="px-4 py-6 text-3xl font-bold text-pretty sm:text-4xl lg:py-8 lg:text-5xl">
                        {post.title}
                    </h1>
                </Container>

                <FullLine />
                <Container>
                    <div className="flex flex-wrap items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
                        <span>{post.author}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={post.date}>{post.dateFormatted}</time>
                        <span aria-hidden="true">·</span>
                        <span>{post.readingMinutes} min read</span>
                    </div>
                </Container>

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
                            <a
                                href="/download"
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                                Download for Mac
                            </a>
                        </div>
                    </div>
                </Container>
                <FullLine />

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
