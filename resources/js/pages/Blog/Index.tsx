import { usePage } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import NewsletterSignup from '@/components/blog/newsletter-signup';
import type { PostSummary } from '@/components/blog/post-list';
import { ClosingFrame } from '@/components/features/feature-closing';
import FeatureHero from '@/components/features/feature-hero';
import { AlsoAnchors } from '@/components/features/feature-part';
import SEOHead from '@/components/seo/seo-head';
import { EXTERNAL } from '@/components/site/site-links';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import { DEFAULT_LOCALE, LOCALES, useI18n } from '@/i18n';
import { absoluteUrl, collectionPageNode, graph } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import LandingLayout from '@/layouts/landing-layout';

type Kind = PostSummary['kind'];

/** `resources/data/content/{locale}/blog.json`, without the corrections the post pages read. */
interface BlogIndexContent {
    seo: { title: string; description: string; indexable?: boolean };
    og: { kicker: string; title: string };
    header: { title: string; lead: string; rss: string; changelog: string };
}

interface Props {
    content: BlogIndexContent;
    feed: { url: string; title: string };
    /** One page of the list, newest first. On `/vi/blog`, an English post is marked as English. */
    posts: PostSummary[];
    /** The kinds that have a post, in tab order. */
    kinds: Kind[];
    filter: { kind: Kind | null; page: number; pages: number };
}

const LINK =
    'inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.009em] text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

function listHref(kind: Kind | null, page = 1): string {
    const query = new URLSearchParams();

    if (kind !== null) {
        query.set('kind', kind);
    }

    if (page > 1) {
        query.set('page', String(page));
    }

    const search = query.toString();

    return search === '' ? '/blog' : `/blog?${search}`;
}

// One list, newest first, narrowed by text tabs and cut into pages of 20 on the server (owner, 2026-11-08).
export default function BlogIndex({ content, feed, posts, kinds, filter }: Props) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const index = m.blog.index;
    const changelogLang = locale === DEFAULT_LOCALE ? undefined : 'en';

    const jsonLd = graph([
        collectionPageNode(
            { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang },
            {
                url: absoluteUrl(canonicalBaseUrl, path('/blog')),
                name: content.seo.title,
                description: content.seo.description,
                items: posts.map((post) => ({ name: post.title, path: post.url })),
            },
        ),
    ]);

    const tabs: (Kind | null)[] = kinds.length > 1 ? [null, ...kinds] : [];

    // This page closes on its own newsletter band, so the footer leaves its copy out.
    return (
        <LandingLayout footerNewsletter={false}>
            <SEOHead title={content.seo.title} description={content.seo.description} jsonLd={jsonLd} />

            <FeatureHero
                title={content.header.title}
                lead={content.header.lead}
                actions={
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <a href={feed.url} type="application/atom+xml" className={LINK}>
                            {content.header.rss}
                            <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
                        </a>
                        <a href={EXTERNAL.changelog} hrefLang={changelogLang} className={LINK}>
                            {changelogLang === undefined ? content.header.changelog : `${content.header.changelog} ${m.common.englishOnly}`}
                            <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground" />
                        </a>
                    </div>
                }
            />

            <section id="posts" aria-label={content.header.title} className="pb-12 md:pb-16">
                <AlsoAnchors part={{ id: 'posts', also: ['news', 'guides', 'releases'] }} />
                <Container>
                    {tabs.length > 0 && (
                        <nav aria-label={index.tabs.label}>
                            <ul className="flex flex-wrap gap-x-7 gap-y-2">
                                {tabs.map((kind) => {
                                    const current = kind === filter.kind;

                                    return (
                                        <li key={kind ?? 'all'}>
                                            <LocaleLink
                                                href={listHref(kind)}
                                                preserveScroll
                                                aria-current={current ? 'page' : undefined}
                                                className={cn(
                                                    'inline-block border-b-2 pb-2 text-[0.9375rem] font-medium tracking-[-0.009em] transition-colors duration-(--dur-tap) ease-(--ease-feedback)',
                                                    current ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                {kind === null ? index.tabs.all : index.tabs[kind]}
                                            </LocaleLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    )}

                    {posts.length > 0 ? (
                        <ol className="mt-4 divide-y divide-rule border-t border-rule">
                            {posts.map((post) => {
                                const lang = post.locale !== locale ? post.locale : undefined;

                                return (
                                    <li key={`${post.locale}-${post.slug}`} className="grid gap-2 py-6 md:grid-cols-12 md:gap-x-8">
                                        <p className="text-sm leading-[1.5] text-muted-foreground tabular-nums md:col-span-4 md:pt-1 lg:col-span-3">
                                            <time dateTime={post.date}>{post.dateFormatted}</time>
                                            <span className="block">{index.kind[post.kind]}</span>
                                        </p>
                                        <div className="max-w-[42rem] min-w-0 md:col-span-8 lg:col-span-9">
                                            <h2 className="text-[1.25rem] leading-[1.3] font-[520] tracking-[-0.018em] text-balance text-foreground md:text-[1.375rem]">
                                                <LocaleLink
                                                    href={post.url}
                                                    locale={post.locale}
                                                    className="rounded-[2px] decoration-rule-strong underline-offset-4 hover:underline"
                                                >
                                                    {post.title}
                                                </LocaleLink>
                                                {lang === DEFAULT_LOCALE && (
                                                    <>
                                                        {/* A real space, so the heading reads "… (tiếng Anh)" to screen readers and copy. */}{' '}
                                                        <span className="ml-1 text-sm font-normal tracking-normal whitespace-nowrap text-muted-foreground">
                                                            {m.common.englishOnly}
                                                        </span>
                                                    </>
                                                )}
                                            </h2>
                                            <p lang={lang} className="mt-2 text-base leading-[1.55] text-pretty text-muted-foreground">
                                                {post.description}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="mt-6 text-base text-muted-foreground">{index.empty}</p>
                    )}

                    {filter.pages > 1 && (
                        <nav aria-label={index.pages.label} className="mt-8 grid grid-cols-3 items-center text-[0.9375rem]">
                            <span>
                                {filter.page > 1 && (
                                    <LocaleLink href={listHref(filter.kind, filter.page - 1)} rel="prev" className={LINK}>
                                        <span aria-hidden="true">←</span> {index.pages.newer}
                                    </LocaleLink>
                                )}
                            </span>
                            <span className="text-center text-muted-foreground tabular-nums">{fmt(index.pages.page, { page: filter.page, pages: filter.pages })}</span>
                            <span className="text-right">
                                {filter.page < filter.pages && (
                                    <LocaleLink href={listHref(filter.kind, filter.page + 1)} rel="next" className={LINK}>
                                        {index.pages.older} <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                )}
                            </span>
                        </nav>
                    )}
                </Container>
            </section>

            <ClosingFrame id="newsletter" title={m.footer.newsletter.title} sentence={m.footer.newsletter.body}>
                <NewsletterSignup bare />
            </ClosingFrame>
        </LandingLayout>
    );
}
