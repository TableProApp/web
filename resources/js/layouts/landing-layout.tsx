import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import SupportBanner from '@/components/landing/support-banner';

interface Props {
    /**
     * Rendered as a sibling of `<main>`, not inside it.
     *
     * A `<header>` nested in `<main>` produces no banner landmark, and the skip
     * link below lands immediately *before* the nav links it exists to skip.
     * Passing the site header through this slot is what makes both work.
     *
     * The 64px the fixed header occupies is added back as padding on `<main>`
     * rather than as a spacer element, so the gutter columns still run the full
     * height of the page and stay visible through the header's backdrop blur.
     */
    header?: ReactNode;
    /**
     * Rendered as a sibling of `<main>` in a second grid row, for the same
     * reason as `header`: a `<footer>` nested in `<main>` is not a contentinfo
     * landmark, so the explicit `role="contentinfo"` it carries was illegally
     * nested and announced as nothing.
     *
     * It takes its own row rather than sitting outside the grid so the gutter
     * columns, which are `row-span-full`, still run the whole height of the
     * page behind it.
     */
    footer?: ReactNode;
    children: ReactNode;
}

export default function LandingLayout({ header, footer, children }: Props) {
    return (
        <div className="overflow-x-hidden bg-background text-foreground antialiased">
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'font-sans',
                    style: {
                        background: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                        border: '1px solid var(--border)',
                    },
                    classNames: {
                        error: '[&>[data-icon]]:text-[var(--destructive)]',
                        success: '[&>[data-icon]]:text-[var(--primary)]',
                    },
                }}
            />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:inline-flex focus:min-h-[48px] focus:items-center focus:rounded-lg focus:bg-primary focus:px-4 focus:text-primary-foreground focus:shadow-lg">
                Skip to content
            </a>
            {/*
              * Above the header, and outside <main>, for the same reason the
              * header is: it is site chrome, not content. It renders on every
              * page because `HandleInertiaRequests::share()` supplies it, and
              * returns null when the config switches it off — so a disabled
              * banner leaves no element and `--banner-h` stays 0.
              */}
            <SupportBanner />
            {header}
            {/*
              * `grid-rows-[1fr_auto]` is load-bearing, not cosmetic. The gutters and
              * the container rails span the full height with `row-span-full`, which
              * compiles to `grid-row: 1 / -1` — and `-1` counts back from the last
              * line of the *explicit* grid. With only `grid-cols` declared, every
              * row was implicit, so `-1` resolved to line 1 and the span collapsed
              * to a single row: all four vertical lines stopped dead where <main>
              * ended and the footer stood beside nothing. Declaring the two rows
              * makes `-1` mean what it reads like. The `1fr` also pins the footer
              * to the bottom on short pages, which `min-h-dvh` alone did not.
              *
              * The middle column is 80rem, matching `Container`'s own max-width,
              * not `--breakpoint-2xl` (96rem). At 96rem the container floated
              * free of its column above ~1616px and the gutters detached from
              * the content rails by up to 128px. The row-number gutter in
              * app.css positions against that agreement, so the two must stay
              * equal.
              */}
            <div
                className="grid min-h-dvh grid-cols-1 grid-rows-[1fr_auto] justify-center [--gutter-width:2.5rem] md:-mx-4 md:grid-cols-[var(--gutter-width)_minmax(0,80rem)_var(--gutter-width)] lg:mx-0"
            >
                {/*
                  * Left gutter. The 45-degree hatch is gone: it was the page's
                  * most borrowed element, and this column now carries the rule
                  * ordinals instead, which is work rather than decoration.
                  */}
                <div
                    className="col-start-1 row-span-full row-start-1 hidden border-x border-rule md:block"
                    aria-hidden="true"
                />

                {/* Main content */}
                {/*
                  * tabIndex -1 so the skip link can actually move focus here.
                  * Without it the browser scrolls to the anchor but focus stays
                  * at the top of the document, so the next Tab lands right back
                  * in the nav the link exists to skip.
                  */}
                {/*
                  * The container-width vertical rails. A grid item spanning
                  * every row rather than an overlay inside <main>, so they
                  * carry on past the content and down the side of the footer.
                  */}
                <div
                    className="pointer-events-none z-10 col-start-1 row-span-full row-start-1 mx-auto w-full max-w-7xl px-4 sm:px-6 md:col-start-2 lg:px-8"
                    aria-hidden="true"
                >
                    <div className="h-full border-x border-rule" />
                </div>

                <main
                    id="main-content"
                    tabIndex={-1}
                    /*
                      * `4rem` is the header; `--banner-h` is 0 unless the
                      * banner is up. Both are cleared with padding rather than
                      * a spacer element so the gutter columns still run the
                      * full height of the page behind them.
                      */
                    className={`relative col-start-1 row-start-1 md:col-start-2 ${header ? 'pt-[calc(4rem+var(--banner-h))]' : 'pt-[var(--banner-h)]'}`}
                >
                    {children}
                </main>

                {footer && <div className="col-start-1 row-start-2 md:col-start-2">{footer}</div>}

                {/*
                  * Right gutter. `md:block`, matching the left one — it used to
                  * be `lg:block`, so the frame was visibly lopsided across the
                  * whole 768-1024px band.
                  */}
                <div
                    className="row-span-full row-start-1 hidden border-x border-rule md:col-start-3 md:block"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
