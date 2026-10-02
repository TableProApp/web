/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/container.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Three content widths (design-system §4.1):
 *
 * - `wide`, 1216px: the page grid, header, footer and hero. 1216 is the width
 *   the screenshot recipe captures a Mac window at, so a full-width window
 *   slot renders 1:1 at 2× with no resampling.
 * - `text`, 704px: articles, legal pages, FAQ and comparison prose, about 70
 *   characters of 16px Inter per line.
 * - `narrow`, 576px: sign-in and notice pages.
 *
 * `md` is the pre-rebuild name for the reading width, kept only so the old
 * pages build until they are replaced; it renders as `text`.
 */
export type ContainerWidth = 'wide' | 'text' | 'narrow' | 'md';

/**
 * `box-content`, so the maximum applies to the content and the gutters sit
 * outside it: 16px below 640, 24px to 1023, 32px from 1024. At 1280 and wider
 * the wide content is exactly 1216px.
 */
const WIDTHS: Record<ContainerWidth, string> = {
    wide: 'max-w-[76rem]',
    text: 'max-w-[44rem]',
    narrow: 'max-w-[36rem]',
    md: 'max-w-[44rem]',
};

interface ContainerProps {
    width?: ContainerWidth;
    as?: ElementType;
    id?: string;
    className?: string;
    children?: ReactNode;
}

export default function Container({ width = 'wide', as: Element = 'div', id, className, children }: ContainerProps) {
    return (
        <Element id={id} className={cn('mx-auto box-content px-4 sm:px-6 lg:px-8', WIDTHS[width], className)}>
            {children}
        </Element>
    );
}
