import { useCallback, useEffect, useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#databases', label: 'Databases' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/blog', label: 'Blog' },
    { href: 'https://docs.tablepro.app', label: 'Docs' },
];

export default function MobileNav({ isOpen, onClose }: Props) {
    const navRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (e.key !== 'Tab' || !navRef.current) return;

        const focusable = navRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.addEventListener('keydown', handleKeyDown);
            closeButtonRef.current?.focus();
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div ref={navRef} role="dialog" aria-modal="true" aria-label="Navigation menu" className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl md:hidden">
            <div className="flex h-16 shrink-0 items-center justify-between px-4">
                <a href="/" onClick={onClose} className="flex items-center gap-2.5">
                    <img src="/images/logo.png" alt="TablePro" className="size-7" width={28} height={28} />
                    <span className="text-lg font-semibold text-foreground">TablePro</span>
                </a>
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Close menu"
                >
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-5 pb-16">
                {navLinks.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary-strong"
                    >
                        {link.label}
                    </a>
                ))}

                <div className="my-1 h-px w-12 bg-foreground/10" />

                <a
                    href="/download"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    Download for Mac
                </a>
                <a
                    href="/#mobile"
                    onClick={onClose}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    Get for iPhone
                </a>
            </nav>
        </div>
    );
}
