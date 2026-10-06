import { usePage } from '@inertiajs/react';
import Article from '@/components/blog/article';
import { articleHeadings } from '@/components/blog/article-body';
import PostList, { type PostSummary } from '@/components/blog/post-list';
import TableOfContents from '@/components/blog/table-of-contents';
import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL } from '@/components/site/site-links';
import { buttonClasses } from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
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
    /** The dated editor's correction, only where the post said something that was never true. */
    correction: Correction | null;
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
 * - a dated archive note, with links to Features and the changelog;
 * - an editor's correction, only where the post said something that was never
 *   true, dated and visible rather than edited in;
 * - each figure as a placeholder slot (`blog-{slug}-{n}`) until the owner
 *   supplies the image;
 * - a download line from today's `platforms.json`, so it never repeats an old
 *   requirement;
 * - related posts in the same language.
 *
 * A post with more than four sections gets a table of contents: a sticky
 * column at 1280px and wider, a disclosure above the article below that.
 */
export default function BlogPost({ post, correction, related }: Props) {
    const { canonicalBaseUrl, seo } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const inLanguage = LOCALES.supported[post.locale].hreflang;
    const brand = m.common.brand;
    /*
     * A title that already leads with the brand skips the site template, so it
     * takes the blog's own suffix instead: "TablePro for iPhone and iPad" is
     * also the /ios page's title, and two indexable pages must not share one.
     */
    const branded = post.title.startsWith(brand);
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

    const archive = post.release !== null ? m.blog.post.archive.named : m.blog.post.archive.unnamed;

    return (
        <LandingLayout>
            <SEOHead
                title={branded ? fmt(m.blog.post.brandedTitle, { title: post.title }) : post.title}
                titleTemplate={!branded}
                description={post.description}
                ogType="article"
                jsonLd={jsonLd}
            />

            <PageHeader
                variant="utility"
                breadcrumbs={crumbs}
                title={<span className="block max-w-[44rem]">{post.title}</span>}
                meta={<time dateTime={post.date}>{post.dateFormatted}</time>}
            />

            <div className="py-8 md:py-10 xl:py-12">
                <Container>
                    <div className="xl:grid xl:grid-cols-12 xl:gap-8">
                        <div className="max-w-[44rem] xl:col-span-8">
                            <div className="space-y-4">
                                <Callout>
                                    <p>
                                        <Trans
                                            text={archive}
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

                                {correction && (
                                    <Callout tone="warning" title={fmt(m.blog.post.correction, { date: correction.dateFormatted })}>
                                        <p>{correction.text}</p>
                                    </Callout>
                                )}

                                {toc && <TableOfContents headings={headings} label={m.blog.post.toc} variant="inline" className="xl:hidden" />}
                            </div>

                            <Article html={post.bodyHtml} locale={post.locale} className="mt-10" />

                            <div className="mt-12 flex flex-col items-start gap-4 border-t border-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
                                <p className="type-body text-foreground">
                                    {fmt(m.platforms.availability.summary, { deviceList: deviceList(m.common.list) })}
                                </p>
                                <LocaleLink
                                    href="/download"
                                    className={buttonClasses('secondary', 'md', 'shrink-0')}
                                    onClick={() => trackDownload('blog-post', 'mac')}
                                >
                                    {m.download.macCta}
                                </LocaleLink>
                            </div>

                            {related.length > 0 && (
                                <section aria-labelledby="related-posts" className="mt-16">
                                    <h2 id="related-posts" className="type-h2 text-foreground">
                                        {m.blog.post.related}
                                    </h2>
                                    {/* The post's last block: the page frame's join below closes the list (design-system §4.7). */}
                                    <PostList posts={related} headingLevel="h3" descriptions={false} className="mt-4 border-b-transparent" />
                                </section>
                            )}
                        </div>

                        {toc && (
                            <aside className="hidden xl:col-span-3 xl:col-start-10 xl:block">
                                <TableOfContents headings={headings} label={m.blog.post.toc} variant="sidebar" />
                            </aside>
                        )}
                    </div>
                </Container>
            </div>
        </LandingLayout>
    );
}
