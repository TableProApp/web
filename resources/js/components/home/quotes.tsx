import { useId, useState } from 'react';
import Container from '@/components/ui/container';
import Disclosure from '@/components/ui/disclosure';
import { useI18n } from '@/i18n';
import type { HomeContent, HomeTestimonial } from './types';

// A blank line starts a paragraph; a single newline stays a line break.
function Paragraphs({ text }: { text: string }) {
    return text.split(/\n{2,}/).map((paragraph) => (
        <p key={paragraph} className="not-first:mt-2">
            {paragraph}
        </p>
    ));
}

function Quote({ quote, content }: { quote: HomeTestimonial; content: HomeContent['testimonials'] }) {
    const { fmt } = useI18n();
    const label = quote.translatedFrom !== null ? content.translatedFrom[quote.translatedFrom] : null;
    const translation = label !== null ? quote.translation : null;

    return (
        <figure className="flex flex-col">
            <blockquote
                lang={translation !== null ? undefined : quote.lang}
                className="testimonial-quote text-[1.0625rem] leading-[1.6] font-[450] tracking-[-0.012em] whitespace-pre-line text-foreground md:text-[1.125rem]"
            >
                <Paragraphs text={translation ?? quote.text} />
            </blockquote>
            {translation !== null && (
                <Disclosure summary={label} className="mt-3 [&>summary]:font-normal [&>summary]:text-muted-foreground">
                    <div lang={quote.lang} className="space-y-2 whitespace-pre-line text-muted-foreground">
                        <Paragraphs text={quote.text} />
                    </div>
                </Disclosure>
            )}
            <figcaption className="mt-6 flex items-center gap-3">
                <img
                    src={quote.avatar}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="size-9 shrink-0 rounded-full bg-surface object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/15"
                />
                <span className="min-w-0 text-sm leading-[1.35] tracking-[-0.006em]">
                    <span translate="no" className="block font-medium text-foreground">
                        {quote.name}
                    </span>
                    <a
                        href={quote.url}
                        aria-label={fmt(content.postOn, { name: quote.name, platform: quote.platform })}
                        className="text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground"
                    >
                        {quote.platform}
                        <span aria-hidden="true"> ↗</span>
                    </a>
                </span>
            </figcaption>
        </figure>
    );
}

function QuoteList({ quotes, content, id, hidden }: { quotes: HomeTestimonial[]; content: HomeContent['testimonials']; id?: string; hidden?: boolean }) {
    return (
        <ul id={id} hidden={hidden} className="grid gap-x-12 gap-y-12 md:grid-cols-3">
            {quotes.map((quote) => (
                <li key={quote.id} className="flex">
                    <Quote quote={quote} content={content} />
                </li>
            ))}
        </ul>
    );
}

// The three featured quotes, then the rest one click away. Every quote is in the server-rendered page.
export default function Quotes({ content, quotes }: { content: HomeContent['testimonials']; quotes: HomeTestimonial[] }) {
    const { plural } = useI18n();
    const more = useId();
    const [open, setOpen] = useState(false);
    const lead = quotes.filter((quote) => quote.featured);
    const rest = quotes.filter((quote) => !quote.featured);

    return (
        <section id="testimonials" aria-labelledby="testimonials-title" className="py-16 md:py-20 xl:py-24">
            <Container>
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-12">
                    <h2 id="testimonials-title" className="type-h2 text-foreground">
                        {content.title}
                    </h2>
                    <p className="text-sm tracking-[-0.006em] text-muted-foreground">{content.lead}</p>
                </div>

                <div className="mt-10 md:mt-12">
                    <QuoteList quotes={lead} content={content} />
                </div>

                {rest.length > 0 && (
                    <>
                        <div className={open ? 'mt-12 border-t border-rule pt-12' : undefined}>
                            <QuoteList quotes={rest} content={content} id={more} hidden={!open} />
                        </div>
                        <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={more}
                            onClick={() => setOpen((value) => !value)}
                            className="mt-10 cursor-pointer text-sm leading-[1.3] font-medium text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground"
                        >
                            {open ? content.fewer : plural(content.more, rest.length)}
                        </button>
                    </>
                )}
            </Container>
        </section>
    );
}
