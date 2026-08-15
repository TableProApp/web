import { useEffect, useRef } from 'react';
import LandingLayout from '@/layouts/landing-layout';
import Header from '@/components/landing/header';
import Footer from '@/components/landing/footer';
import Container from '@/components/ui/container';
import SEOHead from '@/components/seo/seo-head';

interface Props {
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

function FullLine() {
    return <div className="h-px w-[200vw] -ml-[100vw] bg-gray-950/5 dark:bg-white/10" aria-hidden="true" />;
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
                primary.className = 'inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90';
                secondary.className = 'inline-flex items-center gap-2 rounded-full border border-gray-950/5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-gray-950/[2.5%] dark:border-white/10 dark:hover:bg-white/[2.5%]';
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
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
    );

    return (
        <LandingLayout header={<Header downloadUrls={downloadUrls} githubStars={githubStars} />}>
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

            <main>
                <div className="h-12 sm:h-16 lg:h-24" />

                {/* Label */}
                <Container>
                    <FullLine />
                    <p className="pl-4 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                        Download
                    </p>
                    <FullLine />
                </Container>

                {/* Spacer */}
                <div className="h-4" />

                {/* Headline */}
                <Container>
                    <FullLine />
                    <h1 className="pl-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Your download is starting...
                    </h1>
                    <FullLine />
                </Container>

                {/* Manual link */}
                <div className="h-2" />
                <Container>
                    <FullLine />
                    <p className="pl-4 text-base text-muted-foreground">
                        If your download doesn't start automatically,{' '}
                        <a ref={manualRef} href="https://github.com/TableProApp/TablePro/releases/latest" className="text-foreground underline underline-offset-4 transition-colors hover:text-primary">click here</a>.
                    </p>
                    <FullLine />
                </Container>

                {/* Spacer */}
                <div className="h-6" />

                {/* Architecture selector */}
                <Container>
                    <FullLine />
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row">
                        <a
                            ref={arm64Ref}
                            href="https://github.com/TableProApp/TablePro/releases/latest"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            {appleIcon}
                            Apple Silicon
                        </a>
                        <a
                            ref={x86Ref}
                            href="https://github.com/TableProApp/TablePro/releases/latest"
                            className="inline-flex items-center gap-2 rounded-full border border-gray-950/5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-gray-950/[2.5%] dark:border-white/10 dark:hover:bg-white/[2.5%]"
                        >
                            {appleIcon}
                            Intel
                        </a>
                    </div>
                    <FullLine />
                </Container>

                {/* System requirements */}
                <Container>
                    <FullLine />
                    <p className="px-4 py-2 text-xs text-muted-foreground/80">
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
                        <div className="border-b border-gray-950/5 p-6 dark:border-white/10 sm:border-b-0 sm:border-r sm:p-8">
                            <h2 className="text-lg font-semibold text-foreground">Installation</h2>
                            <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
                                    <span>Open the downloaded <code className="rounded bg-black/5 px-1.5 py-0.5 text-foreground dark:bg-white/10">.dmg</code> file</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
                                    <span>Drag <strong className="text-foreground">TablePro</strong> to your Applications folder</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
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
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
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
            </main>

            <Footer />
        </LandingLayout>
    );
}
