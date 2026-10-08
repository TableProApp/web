import { usePage } from '@inertiajs/react';
import NewsletterSignup from '@/components/blog/newsletter-signup';
import PostList, { type PostSummary } from '@/components/blog/post-list';
import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL } from '@/components/site/site-links';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
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
    /** Newest first. On `/vi/blog`, the Vietnamese guides and the English release posts, each of those marked as English. */
    posts: PostSummary[];
}

/**
 * `/blog` and `/vi/blog` (sitemap §A.5; design-system §8.9).
 *
 * Two lists, each newest first: the guides, then the release posts under the
 * line on what they are, with the changelog linked, and the release email
 * signup. The guides list is left out while there are none.
 *
 * `/vi/blog` has Vietnamese chrome. An English post keeps its English title
 * and description, marked `lang="en"` and labelled "(tiếng Anh)", and links
 * its English URL. The page is `noindex, follow` and has no hreflang pair:
 * `content/vi/blog.json` sets `seo.indexable` to false and the registry does
 * the rest.
 */
export default function BlogIndex({ content, posts }: Props) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, path } = useI18n();
    const inLanguage = LOCALES.supported[locale].hreflang;
    const changelogLang = locale === 'en' ? undefined : 'en';
    const guides = posts.filter((post) => post.kind === 'guide');
    const releases = posts.filter((post) => post.kind === 'release');

    const jsonLd = graph([
        collectionPageNode(
            { baseUrl: canonicalBaseUrl, inLanguage },
            {
                url: absoluteUrl(canonicalBaseUrl, path('/blog')),
                name: content.seo.title,
                description: content.seo.description,
                items: [...guides, ...releases].map((post) => ({ name: post.title, path: post.url })),
            },
        ),
    ]);

    // This page has its own newsletter card under the posts, so the footer leaves its copy out.
    return (
        <LandingLayout footerNewsletter={false}>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader title={content.header.title} />

            {guides.length > 0 && (
                <Section id="guides" title={m.blog.index.guides}>
                    <PostList posts={guides} headingLevel="h3" />
                </Section>
            )}

            <Section
                id="releases"
                title={m.blog.index.releases}
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
            >
                {releases.length > 0 ? (
                    <PostList posts={releases} headingLevel="h3" />
                ) : (
                    posts.length === 0 && <p className="type-body text-muted-foreground">{m.blog.index.empty}</p>
                )}

                <div className="max-w-[44rem]">
                    <NewsletterSignup className="mt-12" />
                </div>
            </Section>
        </LandingLayout>
    );
}
