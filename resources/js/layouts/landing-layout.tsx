import { ReactNode } from 'react';
import { Toaster } from 'sonner';

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
    children: ReactNode;
}

export default function LandingLayout({ header, children }: Props) {
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
            {header}
            {/*
              * The middle column is 80rem, matching `Container`'s own max-width,
              * not `--breakpoint-2xl` (96rem). At 96rem the container floated
              * free of its column above ~1616px and the gutters detached from
              * the content rails by up to 128px. The row-number gutter in
              * app.css positions against that agreement, so the two must stay
              * equal.
              */}
            <div
                className="grid min-h-dvh grid-cols-1 justify-center [--gutter-width:2.5rem] md:-mx-4 md:grid-cols-[var(--gutter-width)_minmax(0,80rem)_var(--gutter-width)] lg:mx-0"
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
                <main
                    id="main-content"
                    className={`relative col-start-1 row-start-1 md:col-start-2 ${header ? 'pt-16' : ''}`}
                >
                    {/* Container-width vertical border lines */}
                    <div className="pointer-events-none absolute inset-0 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
                        <div className="h-full border-x border-rule" />
                    </div>
                    {children}
                </main>

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
