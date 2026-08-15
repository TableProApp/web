import { useEffect, useRef } from 'react';
import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';
import { PageHeader } from '@/components/ui/section-shell';
import { FullLine } from '@/components/ui/full-line';
import Button, { buttonClasses } from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import { PROSE_LINK } from '@/components/ui/prose-link';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

const DOWNLOAD_TITLE = 'Download for Mac - TablePro';
const DOWNLOAD_DESCRIPTION = 'Download TablePro for macOS. Native client for every database. Apple Silicon and Intel.';

const downloadJsonLd: object[] = [
    {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'TablePro',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS 14+',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: DOWNLOAD_DESCRIPTION,
        url: 'https://tablepro.app/download',
        downloadUrl: 'https://tablepro.app/download',
    },
    {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to install TablePro on macOS',
        description: 'Install TablePro on macOS in three steps.',
        totalTime: 'PT2M',
        tool: [{ '@type': 'HowToTool', name: 'TablePro DMG' }],
        step: [
            {
                '@type': 'HowToStep',
                position: 1,
                name: 'Open the DMG',
                text: 'Double-click the downloaded .dmg file to mount the disk image.',
            },
            {
                '@type': 'HowToStep',
                position: 2,
                name: 'Drag to Applications',
                text: 'Drag the TablePro icon to your Applications folder.',
            },
            {
                '@type': 'HowToStep',
                position: 3,
                name: 'Launch TablePro',
                text: 'Open TablePro from Applications and connect to your first database.',
            },
        ],
    },
];

export default function Download({ downloadUrls, githubStars }: Props) {
    const arm64Ref = useRef<HTMLAnchorElement>(null);
    const x86Ref = useRef<HTMLAnchorElement>(null);
    const manualRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        if (downloadUrls.arm64 && arm64Ref.current) arm64Ref.current.href = downloadUrls.arm64;
        if (downloadUrls.x86_64 && x86Ref.current) x86Ref.current.href = downloadUrls.x86_64;

        const ua = navigator.userAgent;
        const isMac = ua.includes('Macintosh') || ua.includes('Mac OS');
        if (!isMac) return;

        function startDownload(arch: string) {
            const url = (downloadUrls as Record<string, string>)[arch];
            if (!url) return;
            if (manualRef.current) manualRef.current.href = url;

            const primary = arch === 'arm64' ? arm64Ref.current : x86Ref.current;
            const secondary = arch === 'arm64' ? x86Ref.current : arm64Ref.current;
            if (primary && secondary) {
                primary.className = buttonClasses('primary');
                secondary.className = buttonClasses('secondary');
            }

            setTimeout(() => {
                window.location.href = url;
            }, 1000);
        }

        if (navigator.userAgentData) {
            navigator.userAgentData
                .getHighEntropyValues(['architecture'])
                .then((hints) => {
                    startDownload(hints.architecture === 'x86' ? 'x86_64' : 'arm64');
                });
        } else {
            startDownload('arm64');
        }
    }, [downloadUrls]);

    const appleIcon = (
        <AppleGlyph className="size-5" />
    );

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />} footer={<Footer />}>
            <SEOHead
                title={DOWNLOAD_TITLE}
                description={DOWNLOAD_DESCRIPTION}
                canonical="/download"
                jsonLd={downloadJsonLd}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'Download', path: '/download' },
                ]}
            />
                <PageHeader
                    label="Download"
                    headline="Your download is starting..."
                    lede={
                        <>
                            If your download doesn't start automatically,{' '}
                        <a ref={manualRef} href="https://github.com/TableProApp/TablePro/releases/latest" className={PROSE_LINK}>click here</a>.
                        </>
                    }
                />
{/* Spacer */}
                <div className="h-6" />

                {/* Architecture selector */}
                <Container>
                    <FullLine />
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row">
                        <Button
                            ref={arm64Ref}
                            href="https://github.com/TableProApp/TablePro/releases/latest"
                        >
                            {appleIcon}
                            Apple Silicon
                        </Button>
                        <Button variant="secondary"
                            ref={x86Ref}
                            href="https://github.com/TableProApp/TablePro/releases/latest"
                        >
                            {appleIcon}
                            Intel
                        </Button>
                    </div>
                    <FullLine />
                </Container>

                {/* System requirements */}
                <Container>
                    <FullLine />
                    <p className="px-4 py-2 text-xs text-muted-foreground-subtle">
                        Requires macOS 14 Sonoma or later
                    </p>
                    <FullLine />
                </Container>

                {/* Spacer */}
                <div className="h-6 sm:h-8 lg:h-10" />

                {/* Installation steps */}
                <FullLine />
                <Container width="md">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {/* Installation */}
                        <div className="border-b border-rule p-6 sm:border-b-0 sm:border-r sm:p-8">
                            <h2 className="text-lg font-semibold text-foreground">Installation</h2>
                            <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-strong">1</span>
                                    <span>Open the downloaded <code className="rounded-key bg-muted px-1.5 py-0.5 text-xs text-foreground">.dmg</code> file</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-strong">2</span>
                                    <span>Drag <strong className="text-foreground">TablePro</strong> to your Applications folder</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary-strong">3</span>
                                    <span>Launch TablePro and connect to your database</span>
                                </li>
                            </ol>
                        </div>

                        {/* Older versions */}
                        <div className="p-6 sm:p-8">
                            <h2 className="text-lg font-semibold text-foreground">Older versions</h2>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                Need a previous release? All versions are available on GitHub.
                            </p>
                            <a
                                href="https://github.com/TableProApp/TablePro/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary-strong"
                            >
                                View all releases
                                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 17l9.2-9.2M17 17V7.8M7 7.8h9.2" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </Container>
                <FullLine />

                <div className="h-12 sm:h-16 lg:h-24" />
        </LandingLayout>
    );
}
