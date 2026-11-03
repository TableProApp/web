import { useEffect, useState } from 'react';
import { remaining, type Remaining } from '@/lib/campaign';

/**
 * The time left until `targetMs`, ticking once a second, or null on the
 * server and on the first render, so the cached HTML and hydration carry the
 * written date instead (`Countdown`). Ticks are aligned to the wall clock's
 * seconds, so two countdowns on one page change together.
 */
export function useCountdown(targetMs: number): Remaining | null {
    const [left, setLeft] = useState<Remaining | null>(null);

    useEffect(() => {
        let timer = 0;

        const tick = (): void => {
            const now = Date.now();
            setLeft(remaining(targetMs, now));

            if (now < targetMs) {
                timer = window.setTimeout(tick, 1000 - (now % 1000));
            }
        };

        tick();

        return () => window.clearTimeout(timer);
    }, [targetMs]);

    return left;
}
