import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import AssetSlot from '@/components/ui/asset-slot';
import { cn } from '@/lib/utils';

interface Device {
    id: string;
    slot: ReactNode;
    // Left and width in percent of the stage's width, top in percent of its height, phone first, then from 768px.
    place: string;
    depth: number;
    delay: number;
}

// Back to front, each standing on the stage's bottom edge at about its real size next to the others; on a phone the
// Linux laptop stands higher, behind. Windows takes its place between the Mac and Linux when it ships.
const DEVICES: Device[] = [
    {
        id: 'home-hero-linux',
        slot: <AssetSlot id="home-hero-linux" sizes="(min-width: 1280px) 520px, (min-width: 768px) 43vw, 64vw" caption={false} className="hero-device" />,
        place: 'left-[35.75%] top-0 w-[64.25%] md:left-[41.12%] md:w-[42.8%]',
        depth: 0.4,
        delay: 40,
    },
    {
        id: 'home-hero-mac',
        slot: <AssetSlot id="home-hero-mac" sizes="(min-width: 1280px) 640px, (min-width: 768px) 53vw, 70vw" caption={false} className="hero-device" />,
        place: 'left-0 top-[34.32%] w-[69.83%] md:top-[10.3%] md:w-[52.63%]',
        depth: 0.7,
        delay: 120,
    },
    {
        id: 'home-hero-ipad',
        slot: <AssetSlot id="home-hero-ipad" sizes="(min-width: 1280px) 306px, (min-width: 768px) 25vw, 35vw" caption={false} className="hero-device" />,
        place: 'left-[58.66%] top-[29.22%] w-[35.31%] md:left-[73.19%] md:top-[8.47%] md:w-[25.2%]',
        depth: 1.1,
        delay: 260,
    },
    {
        id: 'home-hero-iphone',
        slot: <AssetSlot id="home-hero-iphone" sizes="(min-width: 1280px) 101px, (min-width: 768px) 8.3vw, 12vw" caption={false} className="hero-device" />,
        place: 'left-[88.27%] top-[63.11%] w-[11.66%] md:left-[91.69%] md:top-[52.4%] md:w-[8.3%]',
        depth: 1.5,
        delay: 380,
    },
];

// Four real captures, each in its device's frame, on one baseline. They settle in once on load, and under a fine
// pointer they drift a few pixels apart as it moves; reduced motion stops both.
export default function HeroDevices({ className }: { className?: string }) {
    const stage = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = stage.current;

        if (el === null || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const layers = [...el.querySelectorAll<HTMLElement>('[data-depth]')];
        const move = (event: PointerEvent): void => {
            const box = el.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width - 0.5;
            const y = (event.clientY - box.top) / box.height - 0.5;

            for (const layer of layers) {
                const depth = Number(layer.dataset.depth);
                layer.style.transform = `translate3d(${(-x * 18 * depth).toFixed(1)}px, ${(-y * 12 * depth).toFixed(1)}px, 0)`;
            }
        };
        const leave = (): void => layers.forEach((layer) => (layer.style.transform = ''));

        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);

        return () => {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerleave', leave);
        };
    }, []);

    return (
        <div ref={stage} className={cn('relative aspect-[358/233.1] w-full md:aspect-[1216/437]', className)}>
            {DEVICES.map((device) => (
                <div
                    key={device.id}
                    data-depth={device.depth}
                    style={{ '--settle-delay': `${device.delay}ms` } as CSSProperties}
                    className={cn('absolute transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]', device.place)}
                >
                    {device.slot}
                </div>
            ))}
        </div>
    );
}
