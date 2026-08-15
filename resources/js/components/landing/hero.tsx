import { Star } from 'lucide-react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import ThemedImage from '@/components/ui/themed-image';
import SectionLabel from '@/components/ui/section-label';

interface Props {
    githubStars?: number | null;
    latestRelease?: { version: string | null; publishedAt: string | null } | null;
}

const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

function formatStarCount(count: number): string {
    if (count < 1000) {
        return count.toString();
    }
    const rounded = Math.round(count / 100) / 10;

    return rounded % 1 === 0 ? `${rounded}k` : `${rounded.toFixed(1)}k`;
}

function formatReleaseDate(iso: string): string {
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed
        .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
        .toUpperCase();
}

function AppleGlyph() {
    return (
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

export default function Hero({ githubStars, latestRelease }: Props) {
    const eyebrow = [
        'TABLEPRO',
        latestRelease?.version ? `v${latestRelease.version}` : null,
        latestRelease?.publishedAt ? formatReleaseDate(latestRelease.publishedAt) : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <section id="top">
            <div className="h-12 sm:h-16 lg:h-24" />

            {/*
              * One rule per boundary, matching SectionShell. This block used to
              * emit ten FullLines separated by bare spacer divs, which drew a
              * doubled hairline at every join.
              */}
            <Container>
                <AccentLine />
                <SectionLabel className="px-4 py-3">{eyebrow}</SectionLabel>
                <FullLine />
                <h1 className="px-4 py-4 text-4xl font-bold text-pretty sm:py-5 sm:text-5xl lg:text-6xl">
                    Every database.
                    <br />
                    <span className="text-muted-foreground">One native Mac app.</span>
                </h1>
                <FullLine />
                <p className="max-w-2xl px-4 py-4 text-lg text-muted-foreground text-pretty sm:py-5">
                    MySQL, PostgreSQL, MongoDB, Redis, Snowflake and 20 more. Written in Swift with SwiftUI and
                    AppKit, so there is no Java runtime, no Chromium and no JavaScript engine to start first. Free and
                    open source under AGPLv3.
                </p>
                <FullLine />
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
                    <a
                        href="/download"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        <AppleGlyph />
                        Download for Mac
                    </a>
                    <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rule px-6 py-3 text-sm font-semibold text-foreground transition-colors"
                    >
                        <Star className="size-4" strokeWidth={1.75} aria-hidden="true" />
                        View source
                        {githubStars && githubStars > 0 ? (
                            <span className="font-mono text-xs text-muted-foreground">
                                {formatStarCount(githubStars)}
                            </span>
                        ) : null}
                    </a>
                    <a
                        href="#mobile"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Also on iPhone <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
                <FullLine />
                <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    Free and open source · AGPLv3 · macOS 14+ · Apple Silicon and Intel · No account
                </p>
                <FullLine />
            </Container>

            <div className="h-6 sm:h-8 lg:h-10" />

            <FullLine />
            <Container>
                <div className="pb-10 sm:pb-14 lg:pb-20">
                    <ThemedImage
                        light={{
                            src: '/images/app-light.png',
                            webpSrcSet:
                                '/images/app-light-1280.webp 1280w, /images/app-light-1920.webp 1920w, /images/app-light.webp 3024w',
                        }}
                        dark={{
                            src: '/images/app-dark.png',
                            webpSrcSet:
                                '/images/app-dark-1280.webp 1280w, /images/app-dark-1920.webp 1920w, /images/app-dark.webp 3024w',
                        }}
                        sizes="(max-width: 1280px) 1280px, (max-width: 1920px) 1920px, 3024px"
                        alt="TablePro on macOS: a SQL query and its result grid, with the connection sidebar on the left."
                        width={3024}
                        height={1720}
                        priority
                        className="w-full rounded-xl border border-rule shadow-sm"
                    />
                </div>
            </Container>
            <FullLine />
        </section>
    );
}
