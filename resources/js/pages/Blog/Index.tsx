import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { Link } from '@inertiajs/react';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';

interface PostSummary {
    slug: string;
    title: string;
    description: string;
    date: string;
    dateFormatted: string;
    tags: string[];
    readingMinutes: number;
    url: string;
}

interface Props {
    posts: PostSummary[];
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

const BLOG_TITLE = 'Blog - TablePro';
const BLOG_DESCRIPTION = 'Articles about database tools, SQL, and native macOS development from the TablePro team.';

function buildItemListJsonLd(posts: PostSummary[], baseUrl: string): object {
    const trimmedBase = baseUrl.replace(/\/$/, '');

    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${trimmedBase}${post.url}`,
            name: post.title,
        })),
    };
}

export default function BlogIndex({ posts, downloadUrls, githubStars }: Props) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tablepro.app';
    const itemListJsonLd = buildItemListJsonLd(posts, baseUrl);

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={BLOG_TITLE}
                description={BLOG_DESCRIPTION}
                canonical="/blog"
                jsonLd={itemListJsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Blog', path: '/blog' },
                ]}
            />
                <PageHeader label="Blog" headline="Database tools, SQL, and Mac." lede={BLOG_DESCRIPTION} />
<FullLine />
                <Container>
                    {posts.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <p className="text-base text-muted-foreground">No posts yet. Check back soon.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-rule">
                            {posts.map((post) => (
                                <li key={post.slug}>
                                    <Link
                                        href={post.url}
                                        className="group block p-6 transition-colors hover:bg-gray-950/[1.5%] sm:p-8 dark:hover:bg-white/[1.5%]"
                                    >
                                        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                            <time dateTime={post.date}>{post.dateFormatted}</time>
                                            <span aria-hidden="true">·</span>
                                            <span>{post.readingMinutes} min read</span>
                                        </div>
                                        <h2 className="mt-3 text-2xl font-bold text-foreground transition-colors group-hover:text-primary-strong sm:text-3xl">
                                            {post.title}
                                        </h2>
                                        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                                            {post.description}
                                        </p>
                                        {post.tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-rule-strong px-2.5 py-1 text-xs font-mono text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Container>
                <FullLine />

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
