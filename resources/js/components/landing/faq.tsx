import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import FaqList from '@/components/ui/faq-list';
import SectionShell from '@/components/ui/section-shell';
import { faqs as defaultFaqs, type FaqItem } from '@/data/faqs';

interface Props {
    /** Defaults to the full /faq set; the homepage passes its shorter list. */
    items?: FaqItem[];
    headline?: string;
    headlineMuted?: string;
}


export default function FAQ({
    items = defaultFaqs,
    headline = 'Questions people actually ask.',
    headlineMuted = 'Short answers.',
}: Props) {

    return (
        <SectionShell tier="reference"
            tone="raised" id="faq" label="FAQ" headline={headline} headlineMuted={headlineMuted}>
            <FullLine />
            <Container>
                <FaqList items={items} />
            </Container>
            <FullLine />
        </SectionShell>
    );
}
