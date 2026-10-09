import Disclosure from '@/components/ui/disclosure';
import CellGrid from '@/components/ui/cell-grid';
import Section from '@/components/ui/section';
import { useI18n } from '@/i18n';
import type { HomeContent, HomeTestimonial } from './types';

interface TestimonialsSectionProps {
    content: HomeContent['testimonials'];
    quotes: HomeTestimonial[];
}

// A blank line starts a paragraph; a single newline stays a line break.
function Paragraphs({ text }: { text: string }) {
    return text.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

function Quote({ quote, content }: { quote: HomeTestimonial; content: HomeContent['testimonials'] }) {
    const { fmt } = useI18n();
    const label = quote.translatedFrom !== null ? content.translatedFrom[quote.translatedFrom] : null;
    const translation = label !== null ? quote.translation : null;

    return (
        <li className="flex flex-col">
            <blockquote
                lang={translation !== null ? undefined : quote.lang}
                className="testimonial-quote type-body space-y-2 font-medium whitespace-pre-line text-foreground"
            >
                <Paragraphs text={translation ?? quote.text} />
            </blockquote>
            {translation !== null && (
                <Disclosure
                    summary={label}
                    className="mt-3 [&>summary]:font-normal [&>summary]:text-muted-foreground"
                >
                    <div lang={quote.lang} className="space-y-2 whitespace-pre-line text-muted-foreground">
                        <Paragraphs text={quote.text} />
                    </div>
                </Disclosure>
            )}
            <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                <div className="type-small min-w-0">
                    <p translate="no" className="font-medium text-foreground">
                        {quote.name}
                    </p>
                    <p className="text-muted-foreground">
                        {quote.handle !== null && (
                            <>
                                <span translate="no">{quote.handle}</span>
                                <span aria-hidden="true"> · </span>
                            </>
                        )}
                        <a
                            href={quote.url}
                            aria-label={fmt(content.postOn, { name: quote.name, platform: quote.platform })}
                            className="rounded-[2px] transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text"
                        >
                            {quote.platform}
                            <span aria-hidden="true">{' ↗'}</span>
                        </a>
                    </p>
                </div>
                <img
                    src={quote.avatar}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="size-10 shrink-0 rounded-md bg-surface object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/15"
                />
            </div>
        </li>
    );
}

// The page's language first; a quote in another language shows its translation, with the original one click away.
export default function TestimonialsSection({ content, quotes }: TestimonialsSectionProps) {
    return (
        <Section id="testimonials" title={content.title} lead={content.lead} flush>
            <CellGrid as="ul" className="md:grid-cols-2 xl:grid-cols-3">
                {quotes.map((quote) => (
                    <Quote key={quote.id} quote={quote} content={content} />
                ))}
            </CellGrid>
        </Section>
    );
}
