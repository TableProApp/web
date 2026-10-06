import LocaleLink from '@/components/ui/locale-link';
import { DEFAULT_LOCALE, useI18n, type Locale } from '@/i18n';
import { cn } from '@/lib/utils';

/** One post as a list shows it: `Post::summary()` on the server. */
export interface PostSummary {
    slug: string;
    /** The language the post is written in. */
    locale: Locale;
    title: string;
    description: string;
    /** `YYYY-MM-DD`, the original publication date. */
    date: string;
    /** The date in the page's language, formatted by the server. */
    dateFormatted: string;
    /** Root-relative, in the post's own language. */
    url: string;
}

interface PostListProps {
    posts: PostSummary[];
    /** The level of each title: `h2` on the index, `h3` under "Related posts". */
    headingLevel: 'h2' | 'h3';
    /** Show each post's description under its title. */
    descriptions?: boolean;
    className?: string;
}

const TITLE_LINK = 'rounded-[2px] transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text';

/**
 * Posts as rows: the date, the title as the link, and the description
 * (design-system §8.9). No thumbnails and no tags.
 *
 * A post in another language than the page, which today means an English
 * release post on `/vi/blog`, keeps its own language: its title and
 * description carry `lang`, `LocaleLink` sends it to its own URL with
 * `hreflang` (a full page load, because the language changes), and the
 * "(tiếng Anh)" label says so in the page's language. `data-rule-list` lets
 * the page frame drop the closing rule when the list ends a block, where the
 * frame's join closes it (design-system §4.7).
 */
export default function PostList({ posts, headingLevel, descriptions = true, className }: PostListProps) {
    const { locale, m } = useI18n();
    const Heading = headingLevel;

    return (
        <ol data-rule-list className={cn('divide-y divide-rule border-y border-rule', className)}>
            {posts.map((post) => {
                const lang = post.locale !== locale ? post.locale : undefined;

                return (
                    <li key={`${post.locale}-${post.slug}`} className="py-6">
                        <p className="type-caption text-muted-foreground">
                            <time dateTime={post.date}>{post.dateFormatted}</time>
                        </p>
                        <Heading className="type-h3 mt-1 text-foreground">
                            <LocaleLink href={post.url} locale={post.locale} className={TITLE_LINK}>
                                {post.title}
                            </LocaleLink>
                            {lang === DEFAULT_LOCALE && (
                                <>
                                    {/* A real space, so the heading's text reads "… Sidebar (tiếng Anh)" to screen readers and copy. */}{' '}
                                    <span className="type-small ml-1 font-normal whitespace-nowrap text-muted-foreground">
                                        {m.common.englishOnly}
                                    </span>
                                </>
                            )}
                        </Heading>
                        {descriptions && (
                            <p lang={lang} className="type-small mt-2 text-muted-foreground">
                                {post.description}
                            </p>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
