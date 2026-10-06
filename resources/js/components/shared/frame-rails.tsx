/* Shared with TableProApp/web and TableProApp/license at resources/js/components/shared/frame-rails.tsx. Change both in the same release. See docs/shared-files.md. */
/**
 * The page frame's two rails: 1px `--rule` verticals on the wide Container's
 * outer edge, from 1280px (design-system §4.7).
 *
 * Rendered twice, by the same component: once over the whole page from the
 * layout root, and once inside the site header, because the header is an
 * opaque sticky layer above the page and has to draw its own stretch of the
 * frame. Both resolve to the same columns, since both are the 80rem box that
 * `Container` (76rem plus two 2rem gutters) fills at 1280 and wider; at 1440
 * that is x = 80 and x = 1359.
 *
 * Below 1280 there are no rails, only the horizontal joins (frame.css). Each rail
 * is its own 1px element rather than the border of a page-sized box, so a
 * browser that promotes it to a layer promotes a sliver, not the whole page.
 * Decoration only: hidden from assistive technology, from forced colours and
 * from print, and it never takes a pointer.
 */
export default function FrameRails() {
    return (
        <div aria-hidden="true" data-frame-rails className="pointer-events-none absolute inset-0 hidden xl:block print:hidden forced-colors:hidden">
            <div className="relative mx-auto h-full max-w-[80rem]">
                <div className="absolute inset-y-0 left-0 z-30 w-px bg-rule" />
                <div className="absolute inset-y-0 right-0 z-30 w-px bg-rule" />
            </div>
        </div>
    );
}
