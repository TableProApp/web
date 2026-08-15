import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
}

export default function RefundPolicy({ downloadUrls }: Props) {
    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} />} footer={<Footer />}>
            <SEOHead
                title="Refund Policy - TablePro"
                description="7-day money-back guarantee on all paid TablePro plans."
                canonical="/refund-policy"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Refund Policy', path: '/refund-policy' },
                ]}
            />
                <PageHeader
                    label="Legal"
                    headline="Refund Policy"
                    lede="Last updated: May 2026"
                />
<div className="h-6 sm:h-8 lg:h-10" />

                <Container width="md">
                    <FullLine />
                    <div className="space-y-4 p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
                        <p>
                            7-day money-back guarantee on all paid plans. The window starts on the date of purchase, or on the most recent renewal for yearly subscriptions.
                        </p>
                        <p>
                            To request a refund, email{' '}
                            <a href="mailto:hello@tablepro.app" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong">hello@tablepro.app</a>{' '}
                            with the email or License Key from your purchase. Eligible refunds are processed within 5 business days to the original payment method.
                        </p>
                        <p>
                            After a refund, the License Key is suspended and any active machines deactivate. The app reverts to the free tier. Your data on your Mac is not touched.
                        </p>
                        <p>
                            Please contact us before opening a chargeback. Disputes raised without contacting us first result in immediate suspension of the License Key.
                        </p>
                    </div>
                    <FullLine />
                </Container>

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
