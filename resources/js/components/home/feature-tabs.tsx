import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import AssetSlot from '@/components/ui/asset-slot';
import Container from '@/components/ui/container';
import LocaleLink from '@/components/ui/locale-link';
import SegmentedControl from '@/components/ui/segmented-control';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { classifyDevice } from '@/lib/device';
import { linuxPlatform, macPlatform } from '@/lib/data/platforms';
import { cn } from '@/lib/utils';
import type { HomeContent } from './types';

type Platform = 'mac' | 'linux';
type TabKey = keyof HomeContent['features']['items'];

interface Tab {
    key: TabKey;
    slug: string;
    captures: Record<Platform, ReactNode>;
    // Anchors of the sections this one replaced; a link to one opens its tab.
    anchors: string[];
}

const SIZES = '(min-width: 1280px) 1216px, (min-width: 1024px) calc(100vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)';

// One tab per feature page, in the Features menu's order.
const TABS: Tab[] = [
    { key: 'querying', slug: 'querying', captures: { mac: <AssetSlot id="mac-home-querying" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-querying" sizes={SIZES} caption={false} /> }, anchors: ['workflows'] },
    { key: 'dataEditing', slug: 'data-editing', captures: { mac: <AssetSlot id="mac-home-data-editing" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-data-editing" sizes={SIZES} caption={false} /> }, anchors: ['safety'] },
    { key: 'schema', slug: 'schema', captures: { mac: <AssetSlot id="mac-home-schema" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-schema" sizes={SIZES} caption={false} /> }, anchors: ['compare'] },
    { key: 'importExport', slug: 'import-export', captures: { mac: <AssetSlot id="mac-home-import-export" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-import-export" sizes={SIZES} caption={false} /> }, anchors: ['switch'] },
    { key: 'aiMcp', slug: 'ai-mcp', captures: { mac: <AssetSlot id="mac-home-ai-mcp" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-ai-mcp" sizes={SIZES} caption={false} /> }, anchors: ['ai', 'mcp'] },
    { key: 'connections', slug: 'connections', captures: { mac: <AssetSlot id="mac-home-connections" sizes={SIZES} caption={false} />, linux: <AssetSlot id="linux-home-connections" sizes={SIZES} caption={false} /> }, anchors: [] },
];

export default function FeatureTabs({ content }: { content: HomeContent['features'] }) {
    const { m, fmt } = useI18n();
    const base = useId();
    const [active, setActive] = useState(0);
    const [platform, setPlatform] = useState<Platform>('mac');
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    // A capture mounts the first time it is shown and stays, so switching back is a crossfade and the page never
    // fetches the captures nobody opens.
    const [seen, setSeen] = useState<Set<string>>(() => new Set([`${TABS[0].slug}-mac`]));

    // A Linux visitor sees Linux first. The section sits below the fold, so the swap after hydration is not seen.
    useLayoutEffect(() => {
        if (classifyDevice(navigator.userAgent, navigator.maxTouchPoints) === 'linux') {
            setPlatform('linux');
        }
    }, []);

    useEffect(() => {
        const open = (): void => {
            const hash = window.location.hash.slice(1);
            const index = TABS.findIndex((tab) => tab.anchors.includes(hash));

            if (index !== -1) {
                setActive(index);
            }
        };

        open();
        window.addEventListener('hashchange', open);

        return () => window.removeEventListener('hashchange', open);
    }, []);

    const onKey = (event: KeyboardEvent<HTMLDivElement>): void => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        const jump = { Home: 0, End: TABS.length - 1 }[event.key];

        if (step === undefined && jump === undefined) {
            return;
        }

        event.preventDefault();
        const next = jump ?? (active + (step ?? 0) + TABS.length) % TABS.length;
        setActive(next);
        tabs.current[next]?.focus();
    };

    const tab = TABS[active];
    const current = `${tab.slug}-${platform}`;

    useEffect(() => {
        setSeen((previous) => (previous.has(current) ? previous : new Set(previous).add(current)));
    }, [current]);
    const title = (key: TabKey): string => m.nav.featureLinks[key];

    return (
        <section id="features" aria-labelledby="features-title" className="scroll-mt-24 py-16 md:py-20 xl:py-24">
            {TABS.flatMap((item) => item.anchors).map((anchor) => (
                <span key={anchor} id={anchor} aria-hidden="true" />
            ))}
            <Container>
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <h2 id="features-title" className="type-h2 text-foreground">
                        {content.title}
                    </h2>
                    <SegmentedControl
                        legend={content.platform}
                        value={platform}
                        onChange={setPlatform}
                        options={[
                            { value: 'mac', label: macPlatform().deviceNames[0] },
                            { value: 'linux', label: linuxPlatform().deviceNames[0] },
                        ]}
                    />
                </div>

                <div
                    role="tablist"
                    aria-label={content.tabs}
                    onKeyDown={onKey}
                    className="-mx-4 mt-8 flex overflow-x-auto border-b border-rule px-4 [scrollbar-width:none] md:mx-0 md:px-0"
                >
                    {TABS.map((item, index) => (
                        <button
                            key={item.key}
                            ref={(el) => {
                                tabs.current[index] = el;
                            }}
                            id={`${base}-tab-${item.slug}`}
                            type="button"
                            role="tab"
                            aria-selected={index === active}
                            aria-controls={`${base}-panel`}
                            tabIndex={index === active ? 0 : -1}
                            onClick={() => setActive(index)}
                            className={cn(
                                '-mb-px shrink-0 cursor-pointer border-b-2 px-0 pt-1 pb-3 text-[0.9375rem] font-medium tracking-[-0.009em] whitespace-nowrap transition-colors duration-(--dur-tap) ease-(--ease-feedback) not-last:mr-8 md:flex-1 md:text-left',
                                index === active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {title(item.key)}
                        </button>
                    ))}
                </div>

                <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${tab.slug}`}>
                    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-12">
                        <p className="type-lead max-w-[40rem] text-foreground">{content.items[tab.key]}</p>
                        <LocaleLink
                            href={`/features/${tab.slug}`}
                            aria-label={fmt(content.more, { feature: title(tab.key) })}
                            className={textLinkClasses('standalone', 'shrink-0')}
                        >
                            {title(tab.key)}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </div>

                    <div className="mt-10 grid md:mt-12">
                        {TABS.flatMap((item, index) =>
                            (['mac', 'linux'] as const).map((key) => {
                                const shown = index === active && key === platform;

                                if (!shown && !seen.has(`${item.slug}-${key}`)) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={`${item.slug}-${key}`}
                                        aria-hidden={!shown}
                                        className={cn('[grid-area:1/1] transition-opacity duration-300 ease-out', shown ? 'opacity-100' : 'pointer-events-none opacity-0')}
                                    >
                                        {item.captures[key]}
                                    </div>
                                );
                            }),
                        )}
                    </div>
                </div>
            </Container>
        </section>
    );
}
