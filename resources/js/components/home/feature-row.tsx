import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FeatureRowProps {
    id: string;
    title: ReactNode;
    children: ReactNode;
    // null when there is no image to show: the row is then one cell of text.
    media: ReactNode;
    // `window`: a 16:9 capture, under its text below 1280px and beside it from there.
    // `detail`: a 4:3 crop, beside its text from 1024px.
    layout: 'window' | 'detail';
    headingLevel?: 'h2' | 'h3';
}

// A window in eight of twelve columns is 790px wide, 0.65 of its capture. Seven columns is 0.56, under the 0.6 floor for a scaled capture.
export const WINDOW_ROW_SIZES = '(min-width: 1280px) 790px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

const HALF = 'xl:flex xl:flex-col xl:justify-center xl:px-(--cell-bleed) xl:py-(--cell-pad-y)';

export default function FeatureRow({ id, title, children, media, layout, headingLevel = 'h3' }: FeatureRowProps) {
    const Heading = headingLevel;
    const text = (
        <>
            <Heading id={id} className={cn(headingLevel === 'h2' ? 'type-h2' : 'type-h3', 'text-balance text-foreground')}>
                {title}
            </Heading>
            <div className="mt-3">{children}</div>
        </>
    );

    if (media === null) {
        return (
            <div className="lg:col-span-12">
                <div className="max-w-[40rem]">{text}</div>
            </div>
        );
    }

    if (layout === 'detail') {
        return (
            <>
                <div className="flex flex-col justify-center lg:col-span-5 xl:col-span-4">{text}</div>
                <div className="flex flex-col justify-center lg:col-span-7 xl:col-span-8">
                    {/* The crop keeps the width it was cut for. */}
                    <div className="xl:mx-auto xl:w-full xl:max-w-[696px]">{media}</div>
                </div>
            </>
        );
    }

    // One cell at every width, so the stacked row has no line between its text and its window.
    // From 1280px the cell lays both on the section grid's columns and draws the divider two cells would share.
    return (
        <div className="lg:col-span-12 xl:grid xl:grid-cols-12 xl:gap-px xl:p-0">
            <div className={cn('max-w-[40rem] xl:col-span-4 xl:max-w-none', HALF)}>{text}</div>
            <div className={cn('mt-8 xl:col-span-8 xl:mt-0 xl:shadow-[-1px_0_0_var(--rule)]', HALF)}>{media}</div>
        </div>
    );
}
