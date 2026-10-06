import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import LocaleLink from '@/components/ui/locale-link';
import { joinList } from '@/i18n/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { FEATURE_PAGES, NAV_LABEL, PLATFORM_PAGES } from './site-links';

/** How long a mouse rests on "Features" before the panel opens, so a pointer crossing the nav opens nothing. */
export const HOVER_OPEN_DELAY = 80;

/** How long the panel waits after the mouse leaves, so a slightly curved path down into it does not close it. */
export const HOVER_CLOSE_DELAY = 150;

interface FeaturesMenuProps {
    /** The page is in the Features section: the button carries the current-section mark. */
    current: boolean;
    /** The page's path without its locale prefix, to mark the current link. */
    path: string;
}

/**
 * "Features ▾" in the desktop header (sitemap §B.1; design-system §5.3.17).
 *
 * A disclosure, not an ARIA menu: a button with `aria-expanded` that shows a
 * panel of ordinary links (All features, the seven feature pages, and the
 * platform pages from data). Links keep their link semantics, Tab moves through
 * them, Escape closes the panel and puts focus back on the button, and a click
 * outside or focus moving outside closes it.
 *
 * Escape is handled on this menu's own root, not on the document: a
 * document-level handler also fired when the reader had tabbed on to another
 * header control and opened that, and took focus back here.
 *
 * With a mouse, resting on "Features" opens the panel and leaving the button
 * and the panel closes it, after short delays (`HOVER_OPEN_DELAY`,
 * `HOVER_CLOSE_DELAY`). Only a mouse: a touch or a pen sends pointer events
 * too, and opening on them would fight the tap that follows. A click on a
 * panel that hover opened keeps it open instead of closing it under the
 * pointer, and a panel opened by a click or the keyboard ignores the mouse
 * leaving; it closes the usual ways.
 */
export default function FeaturesMenu({ current, path }: FeaturesMenuProps) {
    const { m } = useI18n();
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    /** Whether the open panel came from hovering, which a click then pins open. */
    const openedByHover = useRef(false);
    const hoverTimer = useRef<number | undefined>(undefined);

    function clearHoverTimer(): void {
        window.clearTimeout(hoverTimer.current);
        hoverTimer.current = undefined;
    }

    useEffect(() => clearHoverTimer, []);

    function onPointerEnter(event: ReactPointerEvent<HTMLDivElement>): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        clearHoverTimer();

        if (open) {
            return;
        }

        hoverTimer.current = window.setTimeout(() => {
            openedByHover.current = true;
            setOpen(true);
        }, HOVER_OPEN_DELAY);
    }

    function onPointerLeave(event: ReactPointerEvent<HTMLDivElement>): void {
        if (event.pointerType !== 'mouse') {
            return;
        }

        clearHoverTimer();

        if (!open || !openedByHover.current) {
            return;
        }

        hoverTimer.current = window.setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
    }

    function onTriggerClick(): void {
        clearHoverTimer();

        if (open && openedByHover.current) {
            openedByHover.current = false;

            return;
        }

        openedByHover.current = false;
        setOpen((value) => !value);
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: PointerEvent): void => {
            if (root.current && !root.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);

        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
            trigger.current?.focus();
        }
    }

    /** Focus moving to something outside closes the panel; a blur to nothing is left to the pointer handler. */
    function onBlur(event: FocusEvent<HTMLDivElement>): void {
        const next = event.relatedTarget as Node | null;

        if (open && next !== null && root.current && !root.current.contains(next)) {
            setOpen(false);
        }
    }

    const links = [
        { key: 'all', href: '/features', label: m.nav.featureLinks.all },
        ...FEATURE_PAGES.map((page) => ({ key: page.key, href: page.href, label: m.nav.featureLinks[page.key] })),
    ];

    const linkClass = (href: string): string =>
        cn(
            'flex min-h-10 items-center rounded-control px-3 py-2 text-sm leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:bg-surface focus-visible:-outline-offset-2',
            href === path ? 'bg-accent-subtle text-foreground' : 'text-foreground',
        );

    return (
        <div
            ref={root}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            className="relative flex h-16 items-center"
        >
            <button
                ref={trigger}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={onTriggerClick}
                className={cn(
                    'group relative inline-flex h-16 cursor-pointer items-center text-sm leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground focus-visible:outline-none',
                    current
                        ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent-indicator forced-colors:after:bg-[Highlight]'
                        : 'text-muted-foreground',
                )}
            >
                <span className={NAV_LABEL}>
                    {m.nav.features}
                    <ChevronDown className={cn('size-4 shrink-0 transition-transform duration-(--dur-state)', open && 'rotate-180')} aria-hidden="true" />
                </span>
            </button>
            <div
                id={panelId}
                hidden={!open}
                className="absolute top-full left-0 z-50 w-max min-w-64 rounded-panel border border-rule bg-raised p-1 shadow-overlay"
            >
                <ul>
                    {links.map((link) => (
                        <li key={link.key}>
                            <LocaleLink
                                href={link.href}
                                aria-current={link.href === path ? 'page' : undefined}
                                onClick={() => setOpen(false)}
                                className={linkClass(link.href)}
                            >
                                {link.label}
                            </LocaleLink>
                        </li>
                    ))}
                </ul>
                {PLATFORM_PAGES.length > 0 && (
                    <ul className="mt-1 border-t border-rule pt-1">
                        {PLATFORM_PAGES.map((page) => (
                            <li key={page.id}>
                                <LocaleLink
                                    href={page.href}
                                    aria-current={page.href === path ? 'page' : undefined}
                                    onClick={() => setOpen(false)}
                                    className={linkClass(page.href)}
                                >
                                    {joinList(page.deviceNames, m.common.shortList)}
                                </LocaleLink>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
