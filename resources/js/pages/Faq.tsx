import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Faq from '@/components/landing/faq';
import Footer from '@/components/landing/footer';
import SEOHead from '@/components/seo/seo-head';
import { faqs } from '@/data/faqs';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

const FAQ_TITLE = 'FAQ - TablePro';
const FAQ_DESCRIPTION = 'Frequently asked questions about TablePro, the native database client for Mac and iPhone.';

const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
};

export default function FaqPage({ downloadUrls, githubStars }: Props) {
    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={FAQ_TITLE}
                description={FAQ_DESCRIPTION}
                canonical="/faq"
                jsonLd={faqJsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'FAQ', path: '/faq' },
                ]}
            />
            {/*
              * /faq rendered no h1 at all — SectionShell emits h2, so the page
              * started its heading tree at level 2. sr-only rather than visible
              * because the FAQ section already opens with its own headline, and
              * two stacked headlines saying the same thing is worse than none.
              */}
            <h1 className="sr-only">Frequently asked questions about TablePro</h1>
            <Faq />
        </LandingLayout>
    );
}
