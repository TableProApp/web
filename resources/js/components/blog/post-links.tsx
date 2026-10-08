import CellGrid from '@/components/ui/cell-grid';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';

export interface PageLink {
    label: string;
    /** Root-relative and unprefixed; `LocaleLink` adds the reader's locale. */
    href: string;
}

export interface ReleaseNotes {
    changelog: string | null;
    github: string;
}

interface PostLinksProps {
    /** What the post announced ("TablePro 0.77"), named in the notes links. */
    release: string | null;
    pages: PageLink[];
    notes: ReleaseNotes | null;
}

/**
 * Where a post leads: the feature and database pages that cover its topics
 * today, and its release in the changelog and on GitHub. Two cells, like the
 * documentation and related cells that close a feature page (design-system
 * §4.7), or one when a post has only one of the two.
 */
export default function PostLinks({ release, pages, notes }: PostLinksProps) {
    const { locale, m, fmt } = useI18n();
    const english = (label: string): string => (locale === 'en' ? label : `${label} ${m.common.englishOnly}`);
    const version = notes !== null && release !== null ? { release, ...notes } : null;

    if (pages.length === 0 && version === null) {
        return null;
    }

    return (
        <div>
            <Container>
                <CellGrid className={pages.length > 0 && version !== null ? 'md:grid-cols-2' : undefined}>
                    {pages.length > 0 && (
                        <section id="pages" aria-labelledby="pages-title">
                            <h2 id="pages-title" className="type-h3 text-foreground">
                                {m.blog.post.pages}
                            </h2>
                            <ul className="mt-4 space-y-3">
                                {pages.map((page) => (
                                    <li key={page.href}>
                                        <LocaleLink href={page.href} className={textLinkClasses('standalone')}>
                                            {page.label}
                                            <span aria-hidden="true">→</span>
                                        </LocaleLink>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {version !== null && (
                        <section id="notes" aria-labelledby="notes-title">
                            <h2 id="notes-title" className="type-h3 text-foreground">
                                {m.blog.post.notes.title}
                            </h2>
                            <ul className="mt-4 space-y-3">
                                {version.changelog !== null && (
                                    <li>
                                        <TextLink href={version.changelog} kind="standalone" external hrefLang="en">
                                            {english(fmt(m.blog.post.notes.changelog, { release: version.release }))}
                                        </TextLink>
                                    </li>
                                )}
                                <li>
                                    <TextLink href={version.github} kind="standalone" external hrefLang="en">
                                        {english(fmt(m.blog.post.notes.github, { release: version.release }))}
                                    </TextLink>
                                </li>
                            </ul>
                        </section>
                    )}
                </CellGrid>
            </Container>
        </div>
    );
}
