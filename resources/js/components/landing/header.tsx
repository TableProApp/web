import { useState, useEffect, useRef } from 'react';
import MobileNav from './mobile-nav';

interface Props {
    /**
     * Not read here, but every page still passes it and `LandingTest` asserts the
     * controller keeps sending it. Do not remove.
     */
    downloadUrls: { arm64: string; x86_64: string };
    githubStars?: number | null;
}

function formatStarCount(count: number): string {
    if (count >= 1000) {
        const rounded = Math.round(count / 100) / 10;
        return rounded % 1 === 0
            ? `${rounded}k`
            : `${rounded.toFixed(1)}k`;
    }
    return count.toString();
}

const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#databases', label: 'Databases' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: 'https://docs.tablepro.app', label: 'Docs', external: true },
];

export default function Header({ githubStars }: Props) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        if (!downloadOpen) return;
        const close = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                const scrollY = window.scrollY;
                setDownloadOpen(false);
                requestAnimationFrame(() => window.scrollTo(0, scrollY));
            }
        };
        const escape = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setDownloadOpen(false);
            triggerRef.current?.focus();
        };
        document.addEventListener('mousedown', close);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
    }, [downloadOpen]);

    function toggleDropdown() {
        const scrollY = window.scrollY;
        setDownloadOpen(prev => !prev);
        requestAnimationFrame(() => window.scrollTo(0, scrollY));
    }

    function closeDropdown() {
        setDownloadOpen(false);
    }

    /** Moves focus between the menu items, wrapping at both ends. */
    function focusItemAt(index: number) {
        const items = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
        if (items.length === 0) return;
        const target = ((index % items.length) + items.length) % items.length;
        items[target].focus();
    }

    function handleMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = itemRefs.current.filter((el): el is HTMLAnchorElement => el !== null);
        const current = items.findIndex((el) => el === document.activeElement);
        focusItemAt(current + (e.key === 'ArrowDown' ? 1 : -1));
    }

    function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        if (!downloadOpen) {
            toggleDropdown();
        }
        const index = e.key === 'ArrowDown' ? 0 : -1;
        requestAnimationFrame(() => focusItemAt(index));
    }

    return (
        <>
            <header className="fixed left-0 right-0 z-40 border-b border-gray-950/5 dark:border-white/10 bg-background/50 backdrop-blur-2xl" >
                <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2.5">
                        <img src="/images/logo.png" alt="TablePro" width={28} height={28} className="size-7" />
                        <span className="text-lg font-semibold text-foreground">TablePro</span>
                    </a>

                    {/* Right: nav + GitHub + download */}
                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ))}

                        <a
                            href="https://github.com/TableProApp/TablePro"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            {githubStars ? formatStarCount(githubStars) : 'GitHub'}
                        </a>

                        <div ref={dropdownRef} className="relative ml-2">
                            <button
                                ref={triggerRef}
                                type="button"
                                onClick={toggleDropdown}
                                onKeyDown={handleTriggerKeyDown}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                aria-expanded={downloadOpen}
                                aria-haspopup="menu"
                            >
                                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Download
                                <svg className={`size-3 transition-transform ${downloadOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            <div
                                role="menu"
                                aria-label="Download options"
                                onKeyDown={handleMenuKeyDown}
                                className={`absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-950/5 dark:border-white/10 bg-background shadow-xl transition-all ${downloadOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'}`}
                            >
                                <a
                                    ref={(el) => { itemRefs.current[0] = el; }}
                                    role="menuitem"
                                    href="/download"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-gray-950/[2.5%] dark:hover:bg-white/[2.5%]"
                                    onClick={() => {
                                        const scrollY = window.scrollY;
                                        setDownloadOpen(false);
                                        requestAnimationFrame(() => window.scrollTo(0, scrollY));
                                    }}
                                >
                                    <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <div>
                                        <div className="font-medium">Download for Mac</div>
                                        <div className="text-xs text-muted-foreground">macOS 14+</div>
                                    </div>
                                </a>
                                <div className="h-px bg-gray-950/5 dark:bg-white/10" />
                                <a
                                    ref={(el) => { itemRefs.current[1] = el; }}
                                    role="menuitem"
                                    href="/#mobile"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground transition-colors hover:bg-gray-950/[2.5%] dark:hover:bg-white/[2.5%]"
                                    onClick={closeDropdown}
                                >
                                    <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                    </svg>
                                    <div>
                                        <div className="font-medium">Get for iPhone</div>
                                        <div className="text-xs text-muted-foreground">iOS 18+ &middot; Free</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileNavOpen(true)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
                        aria-label="Open menu"
                    >
                        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </nav>
            </header>

            <div className="h-16" />

            <MobileNav
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />
        </>
    );
}
