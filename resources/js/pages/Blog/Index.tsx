import { usePage } from '@inertiajs/react';
import NewsletterSignup from '@/components/blog/newsletter-signup';
import PostList, { type PostSummary } from '@/components/blog/post-list';
import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL } from '@/components/site/site-links';
import Container from '@/components/ui/container';
import PageHeader from '@/components/ui/page-header';
import TextLink from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

/** `resources/data/content/{locale}/blog.json`, without the corrections the post pages read. */
interface BlogIndexContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: { title: string; lead: string };
}

interface Props {
    content: BlogIndexContent;
    /** Newest first. On `/vi/blog`, the English release posts, each marked as English. */
    posts: PostSummary[];
}

/**
 * `/blog` and `/vi/blog` (sitemap §A.5; design-system §8.9).
 *
 * One line on what the blog is, with the changelog linked; the posts, newest
 * first; and the release email signup. No filter and no per-post badge: every
 * retained post is a release post, so either would say nothing.
 *
 * `/vi/blog` has Vietnamese chrome and a Vietnamese lead that says the posts
 * are in English. Its rows keep their English titles and descriptions, marked
 * `lang="en"` and labelled "(tiếng Anh)", and link the English URLs. The page
 * is `noindex, follow` and has no hreflang pair: `content/vi/blog.json` sets
 * `seo.indexable` to false and the registry does the rest.
 */
export default function BlogIndex({ content, posts }: Props) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const inLanguage = LOCALES.supported[locale].hreflang;
    const changelogLang = locale === 'en' ? undefined : 'en';

    const jsonLd = graph([
        collectionPageNode(
            { baseUrl: canonicalBaseUrl, inLanguage },
            {
                url: absoluteUrl(canonicalBaseUrl, path('/blog')),
                name: content.seo.title,
                description: content.seo.description,
                items: posts.map((post) => ({ name: post.title, path: post.url })),
            },
        ),
    ]);

    // This page has its own newsletter card under the posts, so the footer leaves its copy out.
    return (
        <LandingLayout footerNewsletter={false}>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader
                title={content.header.title}
                lead={
                    <Trans
                        text={content.header.lead}
                        tags={{
                            changelog: (text) => (
                                <TextLink href={EXTERNAL.changelog} external hrefLang={changelogLang}>
                                    {text}
                                </TextLink>
                            ),
                        }}
                    />
                }
            />

            {/* The list opens on the page frame's join, which is its first rule (design-system §4.7). */}
            <div className="pb-8 md:pb-10 xl:pb-12">
                <Container className="@container">
                    {posts.length > 0 ? (
                        <PostList posts={posts} headingLevel="h2" className="border-t-0" />
                    ) : (
                        <p className="type-body pt-8 text-muted-foreground md:pt-10 xl:pt-12">{m.blog.index.empty}</p>
                    )}

                    <div className="max-w-[44rem]">
                        <NewsletterSignup className="mt-12" />
                    </div>
                </Container>
            </div>
        </LandingLayout>
    );
}
