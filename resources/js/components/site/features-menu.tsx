import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import LocaleLink from '@/components/ui/locale-link';
import { joinList } from '@/i18n/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { FEATURE_PAGES, PLATFORM_PAGES } from './site-links';

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
 * outside closes it.
 */
export default function FeaturesMenu({ current, path }: FeaturesMenuProps) {
    const { m } = useI18n();
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: PointerEvent): void => {
            if (root.current && !root.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const onKeyDown = (event: globalThis.KeyboardEvent): void => {
            if (event.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

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
        <div ref={root} className="relative flex h-16 items-center">
            <button
                ref={trigger}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                    'relative inline-flex h-16 cursor-pointer items-center gap-1 text-sm leading-[1.3] font-medium transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-foreground',
                    current
                        ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent-indicator forced-colors:after:bg-[Highlight]'
                        : 'text-muted-foreground',
                )}
            >
                {m.nav.features}
                <ChevronDown className={cn('size-4 shrink-0 transition-transform duration-(--dur-state)', open && 'rotate-180')} aria-hidden="true" />
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
