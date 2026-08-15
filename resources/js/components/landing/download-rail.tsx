import Button from '@/components/ui/button';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { AppleGlyph } from '@/components/ui/glyph';


interface Props {
    /**
     * The one line of context this rail adds. Keep it to a consequence of the
     * section above it, not a restatement of the button.
     */
    note: string;
}

/**
 * A single ruled row carrying the download button.
 *
 * The page previously offered exactly two routes to /download in its body —
 * the hero and the final CTA — with roughly three thousand words between them,
 * while handing the reader twenty routes to a competitor comparison in the same
 * stretch. Conviction peaks right after the reader has seen the app work and
 * right after their safety question is answered, and at both moments there was
 * nothing to click.
 *
 * Deliberately not a section: no heading, no eyebrow, no id. It is a rule in
 * the existing rhythm, so it interrupts the argument as little as possible.
 */
export default function DownloadRail({ note }: Props) {
    return (
        <>
            <FullLine />
            <Container>
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xs text-muted-foreground">{note}</p>
                    <Button href="/download" size="sm" className="shrink-0">
                        <AppleGlyph />
                        Download for Mac
                    </Button>
                </div>
            </Container>
            <FullLine />
        </>
    );
}
