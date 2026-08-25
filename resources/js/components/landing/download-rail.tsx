import Button from '@/components/ui/button';
import Container from '@/components/ui/container';
import { FullLine } from '@/components/ui/full-line';
import { AppleGlyph } from '@/components/ui/glyph';
import { trackDownload } from '@/lib/analytics';

interface Props {
    /**
     * The one line of context this rail adds. Keep it to a consequence of the
     * section above it, not a restatement of the button.
     */
    note: string;
    /** Which rail this is, for the download event. Not rendered. */
    location: string;
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
 *
 * Full size rather than `sm`. At 75px this was the smallest control on a page
 * that gave a sponsor logo grid 707px, which is backwards for one of only two
 * mid-body conversion points.
 */
export default function DownloadRail({ note, location }: Props) {
    return (
        <>
            <Container>
                <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground text-pretty">{note}</p>
                    <Button href="/download" className="shrink-0" onClick={() => trackDownload(location)}>
                        <AppleGlyph />
                        Download for Mac
                    </Button>
                </div>
            </Container>
            <FullLine />
        </>
    );
}
