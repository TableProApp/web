import { useEffect, useId, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { ChevronDown, X } from 'lucide-react';
import AppStoreBadge from '@/components/download/app-store-badge';
import { requirementLine } from '@/components/download/format';
import ThemeControl from '@/components/shared/theme-control';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import { joinList } from '@/i18n/format';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './language-switcher';
import { EXTERNAL, FEATURE_PAGES, PLATFORM_PAGES, accountHref, basePath, releasedPlatform, sectionOf } from './site-links';

/**
 * The current row: the text weight steps up and a 2px indicator bar sits in
 * the gutter beside it (the system highlight in forced colours), never colour
 * alone, as the desktop header's bottom bar does (design-system §5.2).
 */
const CURRENT_ROW =
    'relative font-semibold before:absolute before:inset-y-2.5 before:-left-3 before:w-0.5 before:rounded-full before:bg-accent-indicator forced-colors:before:bg-[Highlight]';

const mac = releasedPlatform('mac');
const ios = releasedPlatform('ios');

/** The App Store listing, when the iPhone and iPad app is released. */
const appStoreUrl = ios?.destinations.find((destination) => destination.kind === 'app-store')?.url ?? null;

interface MobileNavProps {
    id: string;
    open: boolean;
    onClose: () => void;
}

/**
 * The menu below 1024px (sitemap §B.2; design-system §5.3.17): a modal
 * `<dialog>` sheet over the whole viewport.
 *
 * `showModal()` traps focus and makes the page behind it inert; Escape and the
 * close button close it, and focus returns to the toggle that opened it.
 * Crossing to the desktop layout while it is open closes it too, so a rotated
 * tablet never keeps a scroll-locked page with no visible control.
 *
 * Order: Features (expanding in place to the same links as the desktop menu),
 * Databases, Pricing, the platform pages, Docs, Blog, FAQ, Account; then the
 * language links and the theme control; last, Download for Mac and the App
 * Store badge, each with the system it needs.
 */
export default function MobileNav({ id, open, onClose }: MobileNavProps) {
    const { locale, m, fmt } = useI18n();
    const { url } = usePage();
    const path = basePath(url);
    const section = sectionOf(url);
    const dialog = useRef<HTMLDialogElement>(null);
    const opener = useRef<HTMLElement | null>(null);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const featuresId = useId();

    useEffect(() => {
        const node = dialog.current;

        if (!node) {
            return;
        }

        if (open && !node.open) {
            opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            document.body.style.overflow = 'hidden';
            node.showModal();
        }

        if (!open && node.open) {
            node.close();
        }
    }, [open]);

    useEffect(() => {
        const node = dialog.current;

        if (!node) {
            return;
        }

        const restore = (): void => {
            document.body.style.overflow = '';
            opener.current?.focus();
            opener.current = null;
            setFeaturesOpen(false);
        };

        node.addEventListener('close', restore);

        return () => {
            node.removeEventListener('close', restore);
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const desktop = window.matchMedia('(min-width: 64rem)');
        const onChange = (event: MediaQueryListEvent): void => {
            if (event.matches) {
                onClose();
            }
        };

        if (desktop.matches) {
            onClose();
        }

        desktop.addEventListener('change', onChange);

        return () => desktop.removeEventListener('change', onChange);
    }, [open, onClose]);

    const row =
        'flex min-h-12 w-full items-center gap-2 rounded-control text-lg leading-[1.3] font-medium text-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text';
    const subRow = 'flex min-h-11 items-center rounded-control text-base leading-[1.3] text-foreground hover:text-accent-text';

    /** `aria-current`: `page` on the page itself, `true` on the row of the section it belongs to. */
    const currentOf = (href: string, inSection = false): 'page' | 'true' | undefined => (path === href ? 'page' : inSection ? 'true' : undefined);
    const inFeatures = path === '/features' || path.startsWith('/features/');
    const link = (href: string, inSection = false) => {
        const current = currentOf(href, inSection);

        return { 'aria-current': current, className: cn(row, current !== undefined && CURRENT_ROW) };
    };
    const subLink = (href: string) => {
        const current = currentOf(href);

        return { 'aria-current': current, className: cn(subRow, current !== undefined && CURRENT_ROW) };
    };

    return (
        <dialog
            ref={dialog}
            id={id}
            aria-label={m.nav.menu}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto border-0 bg-raised p-0 text-foreground backdrop:bg-transparent"
        >
            <div className="flex h-16 items-center justify-between border-b border-rule px-4 sm:px-6">
                <LocaleLink href="/" onClick={onClose} className="flex items-center gap-2 rounded-control">
                    <img src="/images/logo.png" alt="" width={28} height={28} className="size-7" />
                    <span className="text-lg leading-none font-semibold">{m.common.brand}</span>
                </LocaleLink>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={m.nav.closeMenu}
                    className="inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-foreground hover:bg-surface"
                >
                    <X className="size-5" aria-hidden="true" />
                </button>
            </div>

            <nav aria-label={m.nav.label} className="px-4 pt-4 pb-8 sm:px-6">
                <ul className="grid">
                    <li>
                        <button
                            type="button"
                            aria-expanded={featuresOpen}
                            aria-controls={featuresId}
                            onClick={() => setFeaturesOpen((value) => !value)}
                            aria-current={inFeatures ? 'true' : undefined}
                            className={cn(row, 'cursor-pointer justify-between', inFeatures && CURRENT_ROW)}
                        >
                            {m.nav.features}
                            <ChevronDown className={cn('size-5 shrink-0 text-muted-foreground transition-transform duration-(--dur-state)', featuresOpen && 'rotate-180')} aria-hidden="true" />
                        </button>
                        <ul id={featuresId} hidden={!featuresOpen} className="mb-2 grid border-l border-rule pl-4">
                            <li>
                                <LocaleLink href="/features" onClick={onClose} {...subLink('/features')}>
                                    {m.nav.featureLinks.all}
                                </LocaleLink>
                            </li>
                            {FEATURE_PAGES.map((page) => (
                                <li key={page.key}>
                                    <LocaleLink href={page.href} onClick={onClose} {...subLink(page.href)}>
                                        {m.nav.featureLinks[page.key]}
                                    </LocaleLink>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>
                        <LocaleLink href="/databases" onClick={onClose} {...link('/databases', section === 'databases')}>
                            {m.nav.databases}
                        </LocaleLink>
                    </li>
                    <li>
                        <LocaleLink href="/pricing" onClick={onClose} {...link('/pricing')}>
                            {m.nav.pricing}
                        </LocaleLink>
                    </li>
                    {PLATFORM_PAGES.map((page) => (
                        <li key={page.id}>
                            <LocaleLink href={page.href} onClick={onClose} {...link(page.href)}>
                                {joinList(page.deviceNames, m.common.shortList)}
                            </LocaleLink>
                        </li>
                    ))}
                    <li>
                        <a href={EXTERNAL.docs} hrefLang="en" aria-label={m.nav.docsLabel} className={row}>
                            {m.nav.docs}
                            <span aria-hidden="true">↗</span>
                        </a>
                    </li>
                    <li>
                        <LocaleLink href="/blog" onClick={onClose} {...link('/blog', section === 'blog')}>
                            {m.nav.blog}
                        </LocaleLink>
                    </li>
                    <li>
                        <LocaleLink href="/faq" onClick={onClose} {...link('/faq')}>
                            {m.nav.faq}
                        </LocaleLink>
                    </li>
                    <li>
                        <a href={accountHref(locale)} className={row}>
                            {m.nav.account}
                        </a>
                    </li>
                </ul>

                <div className="mt-8 grid gap-6 border-t border-rule pt-6">
                    <LanguageSwitcher variant="stack" />
                    <div className="grid gap-2">
                        <p className="type-small font-medium text-muted-foreground" aria-hidden="true">
                            {m.controls.theme.label}
                        </p>
                        <ThemeControl variant="segmented" labels={m.controls.theme} />
                    </div>
                </div>

                <div className="mt-8 grid gap-6 border-t border-rule pt-6">
                    <div className="grid gap-2">
                        <LocaleLink
                            href="/download"
                            onClick={() => {
                                trackDownload('mobile-nav', 'mac');
                                onClose();
                            }}
                            className={buttonClasses('primary', 'lg', 'w-full')}
                        >
                            {m.download.macCta}
                        </LocaleLink>
                        {mac && (
                            <p className="type-small text-muted-foreground">{fmt(m.platforms.requires, { requirement: requirementLine(mac.requirements, m.platforms) })}</p>
                        )}
                    </div>
                    {appStoreUrl && ios && (
                        <div className="grid justify-items-start gap-2">
                            <AppStoreBadge href={appStoreUrl} location="mobile-nav" />
                            <p className="type-small text-muted-foreground">{fmt(m.platforms.requires, { requirement: requirementLine(ios.requirements, m.platforms) })}</p>
                        </div>
                    )}
                </div>
            </nav>
        </dialog>
    );
}
