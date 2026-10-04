import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureRowProps {
    /** The heading's id, so the row's link and image stay tied to it. */
    id: string;
    title: ReactNode;
    /** Two or three sentences, plus any paid-plan line and the link to the feature page. */
    children: ReactNode;
    /** The image slot. */
    media: ReactNode;
    /**
     * `window`: text at a readable width, then the 16:9 window full width below.
     * `detail`: text in columns 1-5 beside a 4:3 crop in columns 6-12 from 1024px.
     */
    layout: 'window' | 'detail';
    /** The heading level the outline needs: `h3` inside a section, `h2` when the row is the section. */
    headingLevel?: 'h2' | 'h3';
    className?: string;
}

/**
 * One workflow on the homepage (design-system §8.1 FeatureRow): a heading,
 * a few sentences, the paid-plan marker from data, a link named after its
 * feature page, and one image slot. Never a card grid.
 */
export default function FeatureRow({ id, title, children, media, layout, headingLevel = 'h3', className }: FeatureRowProps) {
    const Heading = headingLevel;
    const heading = (
        <Heading id={id} className={cn(headingLevel === 'h2' ? 'type-h2' : 'type-h3', 'text-balance text-foreground')}>
            {title}
        </Heading>
    );

    if (layout === 'detail') {
        return (
            <div className={cn('grid gap-8 lg:grid-cols-12 lg:items-center', className)}>
                <div className="lg:col-span-5">
                    {heading}
                    <div className="mt-3">{children}</div>
                </div>
                <div className="lg:col-span-7">{media}</div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="max-w-[40rem]">
                {heading}
                <div className="mt-3">{children}</div>
            </div>
            <div className="mt-8">{media}</div>
        </div>
    );
}
