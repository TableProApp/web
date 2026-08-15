import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The one class list for a link inside body copy. */
export const PROSE_LINK =
    'text-foreground underline underline-offset-4 transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-primary-strong';

interface ProseLinkProps {
    href: string;
    children: ReactNode;
    /** Set for anything leaving the site; adds the target and the rel it needs. */
    external?: boolean;
    className?: string;
}

/**
 * A link inside a paragraph.
 *
 * The same twenty-one links were written out by hand across nine pages in three
 * incompatible forms — one of them underlined but not coloured, another coloured
 * but not underlined — and none of them carried the motion tokens.
 *
 * `PROSE_LINK` is exported for the handful of places that need the classes on an
 * element this component cannot render, such as an anchor that also takes a ref.
 */
export default function ProseLink({ href, children, external, className }: ProseLinkProps) {
    return (
        <a
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cn(PROSE_LINK, className)}
        >
            {children}
        </a>
    );
}
