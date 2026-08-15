import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { cellBorders, type ColumnMap } from '@/components/ui/grid-cell';
import { relocatedFaq } from '@/data/home-faqs';

const COLS: ColumnMap = { base: 1, md: 2 };

const QUESTIONS = [
    'Is it really free, or free for now?',
    'Can I use TablePro at work under AGPLv3?',
] as const;

/**
 * The two questions that stop a download, answered where they arise.
 *
 * Both used to sit in the FAQ at position fifteen, behind the entire spec
 * sheet — which is to say behind roughly three thousand words, past the point
 * where a reader holding either objection has already left. The AGPL one blocks
 * the highest-value visitor of all: the person evaluating a Team licence for a
 * company.
 *
 * Verbatim from `relocatedFaqs`, so there is one copy of each answer and /faq
 * still lists both.
 *
 * No heading and no eyebrow: this is a row in the hero's own rhythm, not a
 * section competing with it.
 */
export default function ObjectionRow() {
    return (
        <section aria-label="Common questions before downloading">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {QUESTIONS.map((question, i) => {
                        const faq = relocatedFaq(question);

                        return (
                            <div
                                key={question}
                                className={`p-6 sm:p-8 ${cellBorders(i, COLS, QUESTIONS.length)} border-rule`}
                            >
                                <h2 className="text-base font-semibold text-foreground">{faq.question}</h2>
                                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                        );
                    })}
                </div>
            </Container>
            <FullLine />
        </section>
    );
}
