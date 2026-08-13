import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import SectionShell from '@/components/ui/section-shell';
import { faqs as defaultFaqs, type FaqItem } from '@/data/faqs';

interface Props {
    /** Defaults to the full /faq set; the homepage passes its shorter list. */
    items?: FaqItem[];
    headline?: string;
    headlineMuted?: string;
}

function Column({ items, className }: { items: FaqItem[]; className?: string }) {
    return (
        <div className={className}>
            {items.map((faq, i) => (
                <div
                    key={faq.question}
                    className={`p-6 sm:p-8 ${i < items.length - 1 ? 'border-b border-gray-950/5 dark:border-white/10' : ''}`}
                >
                    <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </div>
            ))}
        </div>
    );
}

export default function FAQ({
    items = defaultFaqs,
    headline = 'Questions people actually ask.',
    headlineMuted = 'Short answers.',
}: Props) {
    const mid = Math.ceil(items.length / 2);

    return (
        <SectionShell id="faq" label="FAQ" headline={headline} headlineMuted={headlineMuted}>
            <FullLine />
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <Column
                        items={items.slice(0, mid)}
                        className="border-b border-gray-950/5 md:border-r md:border-b-0 dark:border-white/10"
                    />
                    <Column items={items.slice(mid)} />
                </div>
            </Container>
            <FullLine />
        </SectionShell>
    );
}
