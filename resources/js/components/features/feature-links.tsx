import { FACTS } from '@/lib/data/facts';
import LocaleLink from '@/components/ui/locale-link';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { docsHref } from './model';
import type { FeatureLink } from './types';

interface FeatureLinkItemProps {
    link: FeatureLink;
}

/**
 * One standalone link that names its destination (design-system §5.3.2):
 *
 * - `href`: a page on this site, kept in the reader's language;
 * - `docs`: a page on docs.tablepro.app, which is English only, so a
 *   Vietnamese page marks it "(tiếng Anh)" and `hreflang="en"`.
 */
export function FeatureLinkItem({ link }: FeatureLinkItemProps) {
    const { locale, m } = useI18n();

    if (link.docs !== undefined) {
        return (
            <TextLink href={docsHref(FACTS.links.docs, link.docs)} kind="standalone" external hrefLang="en">
                {locale === 'en' ? link.label : `${link.label} ${m.common.englishOnly}`}
            </TextLink>
        );
    }

    return (
        <LocaleLink href={link.href ?? '/'} className={textLinkClasses('standalone')}>
            {link.label}
            <span aria-hidden="true">→</span>
        </LocaleLink>
    );
}

interface FeatureLinkListProps {
    links: FeatureLink[];
    /** `row` wraps the links on one line; `column` stacks them. */
    direction?: 'row' | 'column';
    className?: string;
}

export default function FeatureLinkList({ links, direction = 'row', className }: FeatureLinkListProps) {
    if (links.length === 0) {
        return null;
    }

    return (
        <ul className={cn(direction === 'row' ? 'flex flex-wrap gap-x-6 gap-y-2' : 'space-y-3', className)}>
            {links.map((link) => (
                <li key={`${link.href ?? link.docs}-${link.label}`}>
                    <FeatureLinkItem link={link} />
                </li>
            ))}
        </ul>
    );
}
