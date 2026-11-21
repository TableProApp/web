import { test } from 'node:test';
import assert from 'node:assert/strict';

import { REDUCED_MOTION, autoplayInView, type AutoplayEnvironment } from '../../resources/js/components/ui/asset-video.ts';

class FakeVideo extends EventTarget {
    paused = true;
    plays = 0;
    refuse = false;

    play(): Promise<void> {
        this.plays++;

        if (this.refuse) {
            return Promise.reject(new DOMException('Autoplay is blocked.', 'NotAllowedError'));
        }

        this.paused = false;
        this.dispatchEvent(new Event('play'));

        return Promise.resolve();
    }

    pause(): void {
        if (!this.paused) {
            this.paused = true;
            this.dispatchEvent(new Event('pause'));
        }
    }
}

function page(reduced = false) {
    const video = new FakeVideo();
    const motion = Object.assign(new EventTarget(), { matches: reduced });
    const queries: string[] = [];
    let report: IntersectionObserverCallback | null = null;
    let threshold: IntersectionObserverInit['threshold'];
    let disconnected = false;

    const env: AutoplayEnvironment = {
        matchMedia: (query) => {
            queries.push(query);

            return motion as unknown as MediaQueryList;
        },
        IntersectionObserver: class {
            constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
                report = callback;
                threshold = options?.threshold;
            }

            observe(): void {}

            disconnect(): void {
                disconnected = true;
            }
        },
    };

    const stop = autoplayInView(video as unknown as HTMLVideoElement, env);

    return {
        video,
        queries,
        threshold: () => threshold,
        disconnected: () => disconnected,
        stop,
        scroll: (ratio: number) => report?.([{ intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver),
        reduceMotion: (matches: boolean) => {
            motion.matches = matches;
            motion.dispatchEvent(new Event('change'));
        },
    };
}

test('plays while half the clip is on screen and pauses once it leaves', () => {
    const { video, queries, threshold, scroll } = page();

    assert.deepEqual(queries, [REDUCED_MOTION]);
    assert.equal(threshold(), 0.5);
    assert.equal(video.plays, 0, 'nothing plays before the observer reports');

    scroll(0.2);
    assert.equal(video.paused, true);

    scroll(0.6);
    assert.equal(video.paused, false);

    scroll(0);
    assert.equal(video.paused, true);

    scroll(1);
    assert.equal(video.paused, false);
    assert.equal(video.plays, 2);
});

test('never plays under reduced motion, and stops when the reader turns it on', () => {
    const reduced = page(true);

    reduced.scroll(1);
    assert.equal(reduced.video.plays, 0);

    reduced.reduceMotion(false);
    assert.equal(reduced.video.paused, false, 'motion allowed again plays the clip in view');

    reduced.reduceMotion(true);
    assert.equal(reduced.video.paused, true);

    reduced.scroll(0);
    reduced.scroll(1);
    assert.equal(reduced.video.paused, true);
});

test("a reader's pause holds while they scroll, until they press play", () => {
    const { video, scroll } = page();

    scroll(1);
    video.pause();
    scroll(0);
    scroll(1);
    assert.equal(video.paused, true);

    void video.play();
    scroll(0);
    assert.equal(video.paused, true, 'once played again, the clip pauses off screen as before');

    scroll(1);
    assert.equal(video.paused, false);
});

test('a refused play leaves the poster and the controls, and is tried again next time', async () => {
    const { video, scroll } = page();
    video.refuse = true;

    scroll(1);
    await Promise.resolve();
    assert.equal(video.paused, true);

    scroll(0);
    video.refuse = false;
    scroll(1);
    assert.equal(video.paused, false);
});

test('cleanup stops watching the clip and the motion setting', () => {
    const { video, stop, disconnected, reduceMotion, scroll } = page(true);

    scroll(1);
    stop();
    reduceMotion(false);

    assert.equal(disconnected(), true);
    assert.equal(video.plays, 0);
});
