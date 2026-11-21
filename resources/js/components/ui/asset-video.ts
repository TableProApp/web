import { createElement, useEffect, useRef, type ReactElement } from 'react';
import type { VideoModel } from '../../lib/data/asset-model.ts';

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const SHOWN = 0.5;

export interface AutoplayEnvironment {
    matchMedia(query: string): Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>;
    IntersectionObserver: new (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => Pick<IntersectionObserver, 'observe' | 'disconnect'>;
}

// A reader's pause holds until they press play, wherever the clip scrolls.
export function autoplayInView(video: HTMLVideoElement, env: AutoplayEnvironment): () => void {
    const motion = env.matchMedia(REDUCED_MOTION);
    let visible = false;
    let held = false;
    let pausing = false;

    const pause = (): void => {
        pausing = true;
        video.pause();
    };

    const sync = (): void => {
        if (motion.matches || held) {
            return;
        }

        if (visible && video.paused) {
            video.play().catch(() => undefined);
        } else if (!visible && !video.paused) {
            pause();
        }
    };

    const onMotion = (): void => {
        if (motion.matches && !video.paused) {
            pause();
        }

        sync();
    };

    const onPause = (): void => {
        held = !pausing;
        pausing = false;
    };

    const onPlay = (): void => {
        held = false;
    };

    const observer = new env.IntersectionObserver(
        (entries) => {
            visible = (entries.at(-1)?.intersectionRatio ?? 0) >= SHOWN;
            sync();
        },
        { threshold: SHOWN },
    );

    observer.observe(video);
    motion.addEventListener('change', onMotion);
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);

    return () => {
        observer.disconnect();
        motion.removeEventListener('change', onMotion);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('play', onPlay);
    };
}

// Native controls in every mode: a looping clip needs a way to pause it (WCAG 2.2.2).
export function AssetVideo({ model, className }: { model: VideoModel; className: string }): ReactElement {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => (ref.current ? autoplayInView(ref.current, window) : undefined), []);

    return createElement(
        'video',
        {
            ref,
            className,
            poster: model.poster,
            width: model.width,
            height: model.height,
            style: { aspectRatio: model.aspect },
            'aria-label': model.label,
            muted: true,
            loop: true,
            playsInline: true,
            controls: true,
            preload: 'none',
        },
        ...model.sources.map((source) => createElement('source', { key: source.src, src: source.src, type: source.type })),
    );
}
