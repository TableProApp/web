/* Shared with TableProApp/web and TableProApp/license at resources/js/components/shared/footer-bar.tsx. Change both in the same release. See docs/shared-files.md. */
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronUp, Globe } from 'lucide-react';
import ThemeControl, { type ThemeControlLabels } from '@/components/shared/theme-control';
import { LAUNCHER_REACH } from '@/lib/crisp';
import { cn } from '@/lib/utils';

/** The class of one choice inside a FooterMenu, so both apps draw the same rows. */
export const FOOTER_MENU_ITEM =
    'flex min-h-10 w-full cursor-pointer items-start gap-3 rounded-control px-3 py-2 text-left text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface focus-visible:-outline-offset-2 disabled:cursor-default aria-[current=true]:bg-accent-subtle pointer-coarse:min-h-11';

interface FooterMenuProps {
    /** The trigger's name, with the current choice in it: "Language: English". */
    label: string;
    /** The current choice, shown on the trigger in its own language. */
    current: { name: string; lang: string };
    /** The choices: links, or a form of submit buttons. */
    children: ReactNode;
}

/**
 * A menu that opens upward from the bottom of the page, built on `<details>`
 * so it opens and its choices work before hydration or without JavaScript.
 * Once hydrated it also closes on Escape (returning focus to the trigger), on
 * a press or focus outside it, and moves between choices with the arrow keys.
 * Safari does not focus a `<summary>` on a click, so opening moves focus to
 * the trigger; without that its keys would go to the page.
 */
export function FooterMenu({ label, current, children }: FooterMenuProps) {
    const root = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const details = root.current;

        if (!details) {
            return;
        }

        const onPointerDown = (event: PointerEvent): void => {
            if (details.open && !details.contains(event.target as Node)) {
                details.open = false;
            }
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    function choices(): HTMLElement[] {
        return [...(root.current?.querySelectorAll<HTMLElement>('[data-menu-panel] :is(a[href], button:not(:disabled))') ?? [])];
    }

    function onKeyDown(event: KeyboardEvent<HTMLDetailsElement>): void {
        const details = root.current;

        if (!details?.open) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            details.open = false;
            details.querySelector('summary')?.focus();

            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
            return;
        }

        const items = choices();
        const index = items.indexOf(document.activeElement as HTMLElement);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = index === -1 ? (step === 1 ? 0 : items.length - 1) : (index + step + items.length) % items.length;

        event.preventDefault();
        items[next]?.focus();
    }

    return (
        <details
            ref={root}
            onToggle={(event) => {
                const details = event.currentTarget;

                if (details.open && !details.contains(document.activeElement)) {
                    details.querySelector('summary')?.focus({ preventScroll: true });
                }
            }}
            onKeyDown={onKeyDown}
            onBlur={(event) => {
                const next = event.relatedTarget as Node | null;

                if (next !== null && root.current && !root.current.contains(next)) {
                    root.current.open = false;
                }
            }}
            className="group relative"
        >
            <summary
                aria-label={label}
                className="flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-control px-2 text-sm leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) select-none hover:bg-surface-strong active:bg-surface-strong sm:min-h-9 pointer-coarse:min-h-11 [&::-webkit-details-marker]:hidden"
            >
                <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span lang={current.lang}>{current.name}</span>
                <ChevronUp
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) group-open:rotate-180"
                    aria-hidden="true"
                />
            </summary>
            <div
                data-menu-panel
                className="absolute bottom-full left-0 z-50 mb-2 max-h-[min(32rem,70dvh)] w-max max-w-72 min-w-48 overflow-y-auto overscroll-contain rounded-panel border border-rule bg-raised p-1 shadow-overlay sm:right-0 sm:left-auto"
            >
                {children}
            </div>
        </details>
    );
}

interface FooterBarProps {
    /** "© 2026 TablePro. Source code under the AGPLv3.", in the page's language. */
    copyright: string;
    /** The app's language control, a FooterMenu. */
    language?: ReactNode;
    themeLabels: ThemeControlLabels;
    /** Live chat is configured, so its launcher floats over the bottom-right corner of the page. */
    chat?: boolean;
    className?: string;
}

/**
 * The last row of every page in both apps (design-system §5.3.17): the mark
 * and the copyright on the left, the language menu and the theme on the
 * right. Its rule runs rail to rail, so above a cell grid it lands on the
 * grid's last line and draws it once.
 *
 * With `chat`, the controls stop short of the chat launcher: they keep
 * `LAUNCHER_REACH` clear of the screen's right edge, which costs nothing once
 * the page's own margin is that wide (from about 1416px).
 */
export default function FooterBar({ copyright, language, themeLabels, chat = false, className }: FooterBarProps) {
    return (
        <div
            className={cn(
                '-mx-(--cell-bleed) flex flex-col gap-3 border-t border-rule px-(--cell-bleed) py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8',
                className,
            )}
        >
            <p className="type-small flex items-start gap-3 text-muted-foreground">
                <img src="/images/logo.png" alt="" width={20} height={20} className="mt-px size-5 shrink-0" />
                {/* The year is read at render, and the server's clock and the reader's can disagree around New Year. */}
                <span suppressHydrationWarning>{copyright}</span>
            </p>
            <div
                className="flex shrink-0 flex-wrap items-center justify-between gap-2 sm:justify-end"
                style={chat ? { paddingRight: `max(0px, calc(${LAUNCHER_REACH}px - max(var(--cell-bleed), (100vw - 76rem) / 2)))` } : undefined}
            >
                {language}
                <ThemeControl variant="icons" labels={themeLabels} />
            </div>
        </div>
    );
}
