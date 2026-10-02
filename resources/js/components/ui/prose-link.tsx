import { ReactNode } from 'react';
import { textLinkClasses } from '@/components/ui/text-link';

/**
 * Retiring. The pre-rebuild pages import `PROSE_LINK`; new code uses
 * `TextLink` or `textLinkClasses('inline')` from `./text-link`, which this now
 * delegates to, so the old pages already draw the new inline link. Delete this
 * file once nothing imports it.
 */
export const PROSE_LINK = textLinkClasses('inline');

interface ProseLinkProps {
    href: string;
    children: ReactNode;
    external?: boolean;
    className?: string;
}

/** Retiring: see `PROSE_LINK`. */
export default function ProseLink({ href, children, external, className }: ProseLinkProps) {
    return (
        <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={textLinkClasses('inline', className)}
        >
            {children}
        </a>
    );
}
