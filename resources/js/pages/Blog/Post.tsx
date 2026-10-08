import { usePage } from '@inertiajs/react';
import Article from '@/components/blog/article';
import { articleHeadings } from '@/components/blog/article-body';
import PostLinks, { type PageLink, type ReleaseNotes } from '@/components/blog/post-links';
import PostList, { type PostSummary } from '@/components/blog/post-list';
import TableOfContents from '@/components/blog/table-of-contents';
import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL } from '@/components/site/site-links';
import { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { deviceList } from '@/lib/data/platforms';
import {
    absoluteUrl,
    blogPostingNode,
    breadcrumbNode,
    graph,
    organizationNode,
    organizationProfiles,
} from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

interface PostProps extends PostSummary {
    /** What a release post announced ("TablePro 0.74"), or null. */
    release: string | null;
    /** The byline from the front matter, or null. */
    author: string | null;
    /** Replaces the title in `<title>` only: for a title over 60 characters, or one another page has. */
    seoTitle: string | null;
    /** From `BlogService::html()`: headings with ids, `<asset-slot>` blocks, unlabelled permalinks. */
    bodyHtml: string;
}

interface Correction {
    /** `YYYY-MM-DD`. */
    date: string;
    dateFormatted: string;
    text: string;
}

interface Props {
    post: PostProps;
    /** A newer release than the one the post announced is out. */
    archived: boolean;
    /** The dated editor's correction, only where the post said something that was never true. */
    correction: Correction | null;
    /** The feature and database pages that cover the post's tags today. */
    pages: PageLink[];
    /** The post's release in the docs changelog and on GitHub, where it has them. */
    notes: ReleaseNotes | null;
    /** Up to three other posts in the same language. */
    related: PostSummary[];
}

/** A table of contents appears only on a post with more sections than this (design-system §8.10). */
const TOC_MIN_SECTIONS = 4;

/**
 * `/blog/{slug}` (sitemap §A.5, §E.6; design-system §8.10).
 *
 * A release post is an archive: its words, figures and date stay as they were
 * published. The template around it adds what has changed since:
 *
 * - a dated archive note, with links to Features and the changelog, once a
 *   newer release is out. The post about the current release has none;
 * - an editor's correction, only where the post said something that was never
 *   true, dated and visible rather than edited in;
 * - each figure as a placeholder slot (`blog-{slug}-{n}`) until the owner
 *   supplies the image;
 * - the pages that cover its topics today, and its release in the changelog
 *   and on GitHub;
 * - a download line from today's `platforms.json`, so it never repeats an old
 *   requirement;
 * - related posts in the same language.
 *
 * A post with more than four sections gets a table of contents: a sticky
 * column at 1280px and wider, a disclosure above the article below that.
 */
export default function BlogPost({ post, archived, correction, pages, notes, related }: Props) {
    const { canonicalBaseUrl, seo } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const inLanguage = LOCALES.supported[post.locale].hreflang;
    const title = post.seoTitle ?? post.title;
    // A title that names the brand takes no "– TablePro" after it.
    const branded = title.includes(m.common.brand);
    const pageUrl = absoluteUrl(canonicalBaseUrl, post.url);
    const crumbs = [{ label: m.seo.breadcrumbs.blog, href: '/blog' }, { label: post.title }];
    const headings = articleHeadings(post.bodyHtml);
    const toc = headings.length > TOC_MIN_SECTIONS;
    const changelogLang = locale === 'en' ? undefined : 'en';

    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles(EXTERNAL) }),
        blogPostingNode(
            { baseUrl: canonicalBaseUrl, inLanguage },
            {
                url: pageUrl,
                headline: post.title,
                description: post.description,
                datePublished: post.date,
                image: seo.ogImage?.url ?? null,
            },
        ),
        breadcrumbNode({ baseUrl: canonicalBaseUrl, inLanguage }, pageUrl, [
            { name: m.seo.breadcrumbs.blog, path: path('/blog') },
            { name: post.title, path: post.url },
        ]),
    ]);

    const noted = archived || correction !== null;

    return (
        <LandingLayout>
            <SEOHead
                title={title}
                titleTemplate={!branded}
                description={post.description}
                ogType="article"
                jsonLd={jsonLd}
            />

            <PageHeader
                variant="utility"
                breadcrumbs={crumbs}
                title={<span className="block max-w-[44rem]">{post.title}</span>}
                meta={
                    <DotList
                        items={[
                            <time key="date" dateTime={post.date}>
                                {post.dateFormatted}
                            </time>,
                            post.author,
                        ]}
                    />
                }
            />

            <div className="py-8 md:py-10 xl:py-12">
                <Container>
                    <div className="xl:grid xl:grid-cols-12 xl:gap-8">
                        <div className="max-w-[44rem] xl:col-span-8">
                            <div className="space-y-4">
                                {archived && (
                                    <Callout>
                                        <p>
                                            <Trans
                                                text={m.blog.post.archive}
                                                values={{ date: post.dateFormatted, release: post.release ?? '' }}
                                                tags={{
                                                    features: (text) => (
                                                        <LocaleLink href="/features" className={textLinkClasses('inline')}>
                                                            {text}
                                                        </LocaleLink>
                                                    ),
                                                    changelog: (text) => (
                                                        <TextLink href={EXTERNAL.changelog} external hrefLang={changelogLang}>
                                                            {text}
                                                        </TextLink>
                                                    ),
                                                }}
                                            />
                                        </p>
                                    </Callout>
                                )}

                                {correction && (
                                    <Callout tone="warning" title={fmt(m.blog.post.correction, { date: correction.dateFormatted })}>
                                        <p>{correction.text}</p>
                                    </Callout>
                                )}

                                {toc && <TableOfContents headings={headings} label={m.blog.post.toc} variant="inline" className="xl:hidden" />}
                            </div>

                            {/* The inline table of contents is hidden from 1280px, so alone it leaves no gap there. */}
                            <Article html={post.bodyHtml} locale={post.locale} className={cn(noted ? 'mt-10' : toc && 'mt-10 xl:mt-0')} />
                        </div>

                        {toc && (
                            <aside className="hidden xl:col-span-3 xl:col-start-10 xl:block">
                                <TableOfContents headings={headings} label={m.blog.post.toc} variant="sidebar" />
                            </aside>
                        )}
                    </div>
                </Container>
            </div>

            <PostLinks release={post.release} pages={pages} notes={notes} />

            {/* The apps and the related posts are blocks of their own, so their rules are the page frame's joins (design-system §4.7). */}
            <div className="py-8 md:py-10 xl:py-12">
                <Container>
                    <div className="flex max-w-[44rem] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="type-body text-foreground">{fmt(m.platforms.availability.summary, { deviceList: deviceList(m.common.list) })}</p>
                        <LocaleLink href="/download" className={buttonClasses('secondary', 'md', 'shrink-0')} onClick={() => trackDownload('blog-post', 'mac')}>
                            {m.download.macCta}
                        </LocaleLink>
                    </div>
                </Container>
            </div>

            {related.length > 0 && (
                <Section id="related" title={m.blog.post.related}>
                    <PostList posts={related} headingLevel="h3" descriptions={false} />
                </Section>
            )}
        </LandingLayout>
    );
}
