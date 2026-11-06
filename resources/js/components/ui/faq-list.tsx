import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqListItem {
    question: string;
    answer: ReactNode;
    id?: string;
}

interface FaqListProps {
    items: FaqListItem[];
    headingLevel?: 'h2' | 'h3' | 'h4';
    // Every answer shows by default (design-system §5.3.7). Collapsed only where a short list sits under a sales page.
    collapsible?: boolean;
    className?: string;
}

export default function FaqList({ items, headingLevel = 'h3', collapsible = false, className }: FaqListProps) {
    const Heading = headingLevel;
    const answer = (item: FaqListItem): ReactNode => (typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer);

    return (
        <div data-rule-list className={cn('border-t border-rule', className)}>
            {items.map((item) =>
                collapsible ? (
                    <details key={item.id ?? item.question} id={item.id} className="group scroll-mt-24 border-b border-rule">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                            <Heading className="text-base leading-[1.45] font-medium text-foreground md:text-[1.0625rem]">{item.question}</Heading>
                            <Plus
                                aria-hidden="true"
                                className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) ease-(--ease-feedback) group-open:rotate-45"
                            />
                        </summary>
                        <div className="type-body max-w-[64ch] space-y-3 pb-5 text-muted-foreground">{answer(item)}</div>
                    </details>
                ) : (
                    <div key={item.id ?? item.question} id={item.id} className="scroll-mt-24 border-b border-rule py-6">
                        <Heading className="type-h3 text-foreground">{item.question}</Heading>
                        <div className="type-body mt-2 space-y-4 text-foreground">{answer(item)}</div>
                    </div>
                ),
            )}
        </div>
    );
}
