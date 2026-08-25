import { Star } from 'lucide-react';
import Container from '@/components/ui/container';
import { AccentLine, FullLine } from '@/components/ui/full-line';
import ThemedImage from '@/components/ui/themed-image';
import SectionLabel from '@/components/ui/section-label';
import Button from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import { trackDownload } from '@/lib/analytics';
import { GITHUB_REPO_URL } from '@/data/links';

interface Props {
    githubStars?: number | null;
    latestRelease?: { version: string | null; publishedAt: string | null } | null;
}

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
            <div className="h-16 sm:h-24 lg:h-32" />

            {/*
              * One rule per boundary, matching SectionShell. This block used to
              * emit ten FullLines separated by bare spacer divs, which drew a
              * doubled hairline at every join.
              */}
            <Container>
                <AccentLine />
                <SectionLabel className="px-4 py-3">{eyebrow}</SectionLabel>
                <FullLine />
                {/*
                  * "client", not "app". It is the head noun of every query this
                  * page competes for — mac database client, database client for
                  * mac, open source database client mac — and it appeared
                  * nowhere in the H1, while every sub-page already leads with
                  * it: /mysql-client's H1 is "The MySQL GUI Client for Mac."
                  */}
                <h1 className="px-4 py-5 text-4xl font-bold text-pretty sm:py-7 sm:text-5xl lg:text-6xl">
                    Every database.
                    <br />
                    <span className="text-muted-foreground">One native Mac client.</span>
                </h1>
                <FullLine />
                {/*
                  * Three sentences became one.
                  *
                  * The first named five databases the grid below re-lists as 26
                  * links, and that /mysql-client and its 25 siblings own far
                  * better. The second was the no-runtime claim, which the spec
                  * table one screen down proves with numbers instead of
                  * asserting. The third was already printed verbatim in the
                  * fine print 32px below this paragraph.
                  *
                  * What replaces them: a sentence saying what TablePro *is*,
                  * which nothing on the page said in a liftable form, and the
                  * best sentence the page had — previously the third clause of
                  * a lede in section six, at roughly word 1,000. It is the only
                  * line that states a promise rather than a spec, and Safe
                  * Mode, the deferred-commit grid, the Apply gate and the MCP
                  * ladder are four implementations of it. Said here, the eight
                  * sections below read as evidence for a claim already made.
                  */}
                <p className="max-w-[58ch] px-4 py-5 text-lg text-muted-foreground text-pretty sm:py-6">
                    TablePro is a free, open source database client for macOS. 25 engines through native drivers, and
                    nothing runs against your database that you have not read first.
                </p>
                <FullLine />
                <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center">
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
                    {/*
                      * No third control. "Also on iPhone" was the lightest of
                      * three above-fold links and the most expensive: it jumped
                      * a first-time visitor past every screenshot, every price
                      * and every safety argument, into the one section that
                      * admits a paywall — and into a button that, until this
                      * week, did nothing when it arrived. Eleven of seventeen
                      * comparable dev-tool heroes ship exactly two controls.
                      * The iPhone app is in the header menu and in the closing
                      * call to action, which is where its working form lives.
                      */}
                </div>
                <FullLine />
                {/*
                  * "Free and open source" moved out: the sub now opens with it.
                  * AGPLv3 and the 20 MB went too — the spec table one screen
                  * down states both as values in a result set, which is where
                  * a number belongs, and this line was reading them out first.
                  */}
                <p className="px-4 py-4 text-sm text-muted-foreground">
                    macOS 14+ · Apple Silicon and Intel · No account
                </p>
                <FullLine />
            </Container>

            <div className="h-8 sm:h-10 lg:h-14" />

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
                        alt="TablePro on macOS: the orders table open in the data grid, sixty rows deep, with the connection sidebar on the left."
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
