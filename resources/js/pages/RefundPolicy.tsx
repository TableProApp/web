import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
}

function FullLine() {
    return <div className="h-px w-[200vw] -ml-[100vw] bg-gray-950/5 dark:bg-white/10" aria-hidden="true" />;
}

export default function RefundPolicy({ downloadUrls }: Props) {
    return (
        <LandingLayout>
            <SEOHead
                title="Refund Policy - TablePro"
                description="7-day money-back guarantee on all paid TablePro plans."
                canonical="/refund-policy"
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Refund Policy', path: '/refund-policy' },
                ]}
            />

            <Header downloadUrls={downloadUrls} />

            <main>
                <div className="h-12 sm:h-16 lg:h-24" />

                <Container>
                    <FullLine />
                    <p className="pl-4 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                        Legal
                    </p>
                    <FullLine />
                </Container>

                <div className="h-4" />

                <Container>
                    <FullLine />
                    <h1 className="pl-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Refund Policy
                    </h1>
                    <FullLine />
                </Container>

                <div className="h-2" />
                <Container>
                    <FullLine />
                    <p className="pl-4 text-sm text-muted-foreground">
                        Last updated: May 2026
                    </p>
                    <FullLine />
                </Container>

                <div className="h-6 sm:h-8 lg:h-10" />

                <Container width="md">
                    <FullLine />
                    <div className="space-y-4 p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
                        <p>
                            7-day money-back guarantee on all paid plans. The window starts on the date of purchase, or on the most recent renewal for yearly subscriptions.
                        </p>
                        <p>
                            To request a refund, email{' '}
                            <a href="mailto:hello@tablepro.app" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary">hello@tablepro.app</a>{' '}
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
            </main>

            <Footer />
        </LandingLayout>
    );
}
