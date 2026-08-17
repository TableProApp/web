import { Star } from 'lucide-react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import ThemedImage from '@/components/ui/themed-image';
import SectionLabel from '@/components/ui/section-label';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import { trackDownload } from '@/lib/analytics';

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
                    <Button href="/download" onClick={() => trackDownload('hero')}>
                        <AppleGlyph />
                        Download for Mac
                    </Button>
                    <Button variant="secondary"
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Star strokeWidth={1.75} aria-hidden="true" />
                        View source
                        {githubStars && githubStars > 0 ? (
                            <span>
                                {formatStarCount(githubStars)}
                            </span>
                        ) : null}
                    </Button>
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
                        className="app-plate w-full"
                    />
                </div>
            </Container>
            <FullLine />
        </section>
    );
}
