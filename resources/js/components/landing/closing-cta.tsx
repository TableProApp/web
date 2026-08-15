import { ReactNode } from 'react';
import Button from '@/components/ui/button';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { AppleGlyph } from '@/components/ui/glyph';

interface ClosingCtaProps {
    /**
     * Anything to place beside the download button — a secondary link, a second
     * platform. Given one, the row goes horizontal from sm.
     */
    children?: ReactNode;
}

/**
 * The block that closes a comparison or database page.
 *
 * It existed twice, differing only in one sentence and in whether its button
 * row could hold a second control — so the two pages disagreed on the OS
 * requirement line, which is the sentence a reader actually checks before
 * downloading. It says the same thing on both now, and it says the thing every
 * credible Mac app puts under its download button: the OS floor and the
 * architectures.
 */
export default function ClosingCta({ children }: ClosingCtaProps) {
    return (
        <>
            <div className="h-12 sm:h-16 lg:h-24" />

            <Container>
                <FullLine />
                <div className="px-4 py-12 text-center sm:py-16">
                    <h2 className="text-3xl font-bold sm:text-4xl">Try TablePro for free.</h2>
                    <p className="mt-3 text-muted-foreground">
                        Free and open source. macOS 14+, Apple Silicon and Intel. No account.
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Button href="/download">
                            <AppleGlyph />
                            Download for Mac
                        </Button>
                        {children}
                    </div>
                </div>
                <FullLine />
            </Container>
        </>
    );
}
