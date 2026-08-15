import { cn } from '@/lib/utils';
import type { FaqItem } from '@/data/faqs';

function Column({ items, className }: { items: FaqItem[]; className?: string }) {
    return (
        <div className={className}>
            {items.map((faq, i) => (
                <div
                    key={faq.question}
                    className={cn('p-6 sm:p-8', i < items.length - 1 && 'border-b border-rule')}
                >
                    <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
            ))}
        </div>
    );
}

/**
 * Questions and answers, both visible.
 *
 * The site used to present these two ways: an open two-column grid on the
 * homepage and `/faq`, and a `<details>` accordion on the comparison and
 * database pages — byte-identical between those two, and invalid in both, since
 * a `<dl>` may contain only `<dt>`, `<dd>` and `<div>`.
 *
 * Open won. These pages carry three to eight questions, so there is nothing to
 * collapse for, and an answer behind a disclosure is an answer a search engine
 * ranks lower and a skimming reader never sees. The disclosure also gave the
 * only affordance on the page that changed shape on click without saying so.
 *
 * Two columns above md when there is enough to split; one below, and one always
 * when there are three or fewer.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
    const split = items.length > 3;
    const mid = Math.ceil(items.length / 2);

    if (!split) {
        return <Column items={items} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2">
            <Column items={items.slice(0, mid)} className="border-b border-rule md:border-r md:border-b-0" />
            <Column items={items.slice(mid)} />
        </div>
    );
}
