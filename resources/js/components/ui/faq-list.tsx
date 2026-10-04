import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** One question and its answer. The answer is a string from content, or a node with links in it. */
export interface FaqListItem {
    question: string;
    answer: ReactNode;
    /** A stable, locale-neutral id for linking to one question (`/faq#lost-license-key`). */
    id?: string;
}

interface FaqListProps {
    items: FaqListItem[];
    /**
     * The questions' element. `h3` under a section's `h2` (the default); `h2`
     * on a page whose questions sit directly under its `h1`. The style is the
     * `h3` role either way: the outline decides the level, not the size.
     */
    headingLevel?: 'h2' | 'h3' | 'h4';
    className?: string;
}

/**
 * Questions and answers, every answer visible (design-system §5.3.7).
 *
 * One column at the reading width. Not an accordion: an answer behind a
 * disclosure is one that Ctrl+F cannot find, a search engine ranks lower and a
 * skimming reader never sees, and these lists are short enough not to need
 * collapsing.
 *
 * Each item is separated by a hairline with 24px of padding; the answer sits
 * 8px under its question, in the text colour, not muted, because it is what
 * the reader came for.
 */
export default function FaqList({ items, headingLevel = 'h3', className }: FaqListProps) {
    const Heading = headingLevel;

    return (
        <div className={cn('max-w-[44rem] border-t border-rule', className)}>
            {items.map((item) => (
                <div key={item.id ?? item.question} id={item.id} className="scroll-mt-24 border-b border-rule py-6">
                    <Heading className="type-h3 text-foreground">{item.question}</Heading>
                    <div className="type-body mt-2 space-y-4 text-foreground">{typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}</div>
                </div>
            ))}
        </div>
    );
}
