import { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface Props {
    children: ReactNode;
}

export default function LandingLayout({ children }: Props) {
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
            <div
                className="grid min-h-dvh grid-cols-1 justify-center [--gutter-width:2.5rem] md:-mx-4 md:grid-cols-[var(--gutter-width)_minmax(0,var(--breakpoint-2xl))_var(--gutter-width)] lg:mx-0"
            >
                {/* Left gutter */}
                <div
                    className="col-start-1 row-span-full row-start-1 hidden border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-black)]/5 md:block dark:[--pattern-fg:var(--color-white)]/10"
                    aria-hidden="true"
                />

                {/* Main content */}
                <main id="main-content" className="relative col-start-1 row-start-1 md:col-start-2">
                    {/* Container-width vertical border lines */}
                    <div className="pointer-events-none absolute inset-0 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden="true">
                        <div className="h-full border-x border-gray-950/5 dark:border-white/10" />
                    </div>
                    {children}
                </main>

                {/* Right gutter */}
                <div
                    className="row-span-full row-start-1 hidden border-x border-x-(--pattern-fg) bg-[repeating-linear-gradient(315deg,var(--pattern-fg)_0,var(--pattern-fg)_1px,transparent_0,transparent_50%)] bg-[size:10px_10px] [--pattern-fg:var(--color-black)]/5 lg:col-start-3 lg:block dark:[--pattern-fg:var(--color-white)]/10"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
