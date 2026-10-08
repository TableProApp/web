import type { PostSummary } from '@/components/blog/post-list';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { DEFAULT_LOCALE, Trans, useI18n } from '@/i18n';

interface LatestPostProps {
    post: PostSummary;
}

/**
 * One sentence that links the newest release post by its title, for a page
 * outside the blog. An English post on another language's page keeps its
 * language and is labelled, as on the blog index.
 */
export default function LatestPost({ post }: LatestPostProps) {
    const { locale, m } = useI18n();
    const english = post.locale !== locale && post.locale === DEFAULT_LOCALE;

    return (
        <Trans
            text={m.blog.latest}
            values={{ title: post.title }}
            tags={{
                post: (text) => (
                    <>
                        <LocaleLink href={post.url} locale={post.locale} className={textLinkClasses('inline')}>
                            {text}
                        </LocaleLink>
                        {english && ` ${m.common.englishOnly}`}
                    </>
                ),
            }}
        />
    );
}
