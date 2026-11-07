import { useEffect } from 'react';

// The homepage's sections below the first screen rise into place once as they scroll in (owner, 2026-11-07; the
// homepage's exception to design-system §7.1). A section already on screen is never hidden, nothing is hidden before
// this runs, so the server-rendered page and readers without JavaScript see everything, and reduced motion skips it.
export function useRevealOnScroll(selector: string): void {
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            return;
        }

        const below = [...document.querySelectorAll<HTMLElement>(selector)].filter((el) => el.getBoundingClientRect().top > window.innerHeight);
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-in');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: '0px 0px -12% 0px' },
        );

        for (const el of below) {
            el.classList.add('reveal-armed');
            observer.observe(el);
        }

        return () => {
            observer.disconnect();
            below.forEach((el) => el.classList.remove('reveal-armed', 'reveal-in'));
        };
    }, [selector]);
}
