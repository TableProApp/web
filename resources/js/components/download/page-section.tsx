import type { ReactNode } from 'react';

interface PageSectionProps {
    /** The section's id, which other pages link to (`/download#install`). Locale-neutral. */
    id: string;
    title: string;
    children: ReactNode;
}

/**
 * One prose section of the download page, at text width: an `<h2>` that
 * labels the region, then its body. No eyebrow, no rules (design-system §5.1
 * `Section`).
 */
export default function PageSection({ id, title, children }: PageSectionProps) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-rule pt-10 md:pt-12">
            <h2 id={`${id}-title`} className="type-h2 text-foreground">
                {title}
            </h2>
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    );
}
