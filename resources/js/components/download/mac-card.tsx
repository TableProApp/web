import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Download } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { buildVariant, chipHelpOpen, type DeviceKind, type MacArch } from '@/lib/device';
import { cn } from '@/lib/utils';
import CommandBlock from './command-block';
import { megabytes, requirementLine } from './format';
import type { DownloadContent, LinksProp, MacProp, ReleaseAsset, ReleaseProp } from './types';

const BUILDS: readonly MacArch[] = ['arm64', 'x86_64'];

/** `<ui>…</ui>` in the copy marks an app label or menu path. */
export const UI_TAGS = { ui: (text: string) => <span className="font-medium">{text}</span> };

interface MacCardProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
    links: LinksProp;
    /** Null until mounted: the server renders the same markup for every device. */
    device: DeviceKind | null;
    /** Chromium's architecture hint, null when the browser gave none (Safari, Firefox), undefined until it has answered. */
    hint: MacArch | null | undefined;
    className?: string;
}

/**
 * The Mac card (`#mac`): the release badge, both builds, the help for choosing
 * one, and the other ways to install (design-system §5.3.18 `PlatformCard`,
 * §8.7). It is a cell of the download page's `CellGrid`, so it draws no box of
 * its own, and its inner rule runs from wall to wall (§4.7).
 *
 * Both DMG links are rendered on the server with their real URLs. The
 * browser's hint can only make one of them primary; with no hint both stay
 * equal and "Which Mac do I have?" opens. Nothing navigates on its own, and
 * nothing claims a download started:
 * the "Next, install it" panel appears only after the reader clicked a build,
 * and offers the same file again in case nothing arrived.
 */
export default function MacCard({ content, release, mac, links, device, hint, className }: MacCardProps) {
    const { m, fmt } = useI18n();
    const [clicked, setClicked] = useState<MacArch | null>(null);
    const help = useRef<HTMLDetailsElement>(null);
    const openHelp = chipHelpOpen(device, hint);

    useEffect(() => {
        if (openHelp && help.current) {
            help.current.open = true;
        }
    }, [openHelp]);

    const available = release.source !== 'unavailable';
    const chosen = clicked !== null ? release.assets[clicked] : null;

    let badge: string | null = null;

    if (available && release.version !== null) {
        badge =
            release.publishedAtFormatted !== null
                ? fmt(m.download.release.badge, { version: release.version, date: release.publishedAtFormatted })
                : fmt(m.download.release.badgeUndated, { version: release.version });
    }

    /**
     * The file name in Plex Mono, as identifiers are (design-system §3.1), and
     * only the size in tabular figures: tabular figures in Inter spaced the
     * name's hyphens out ("TablePro - 0.77.0 - arm64.dmg").
     */
    function fileLabel(asset: ReleaseAsset): ReactNode {
        if (asset.name === null) {
            return null;
        }

        const template = asset.bytes !== null ? m.download.file.sized : m.download.file.unsized;

        return (
            <Trans
                text={template.replace('{name}', '<file>{name}</file>').replace('{size}', '<size>{size}</size>')}
                tags={{
                    file: (text) => <span className="font-mono text-[0.75rem] [overflow-wrap:anywhere]">{text}</span>,
                    size: (text) => <span className="tabular-nums">{text}</span>,
                }}
                values={{ name: asset.name, size: asset.bytes !== null ? megabytes(asset.bytes, m.download.file.number) : '' }}
            />
        );
    }

    let status = '';

    if (device === 'ios' || device === 'other') {
        status = m.download.onAnotherDevice;
    } else if (device === 'mac' && hint) {
        status = fmt(m.download.detected, { chip: m.platforms.architectures[hint] });
    }

    return (
        <section id="mac" aria-labelledby="mac-title" className={cn('scroll-mt-24', className)}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h2 id="mac-title" className="type-h3 text-foreground">
                    {mac.deviceNames[0] ?? 'Mac'}
                </h2>
                {badge !== null && <Badge>{badge}</Badge>}
            </div>
            {mac.requirements && (
                <p className="type-small mt-1 text-muted-foreground">
                    {fmt(m.platforms.requires, { requirement: requirementLine(mac.requirements, m.platforms) })}
                </p>
            )}

            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {BUILDS.map((build) => {
                    const asset = release.assets[build];
                    const file = fileLabel(asset);

                    return (
                        <li key={build}>
                            <Button
                                href={asset.url}
                                variant={buildVariant(build, device ?? 'other', hint ?? null)}
                                size="lg"
                                fullWidth
                                icon={<Download aria-hidden="true" />}
                                onClick={() => {
                                    trackDownload('download-page', 'mac');

                                    if (available) {
                                        setClicked(build);
                                    }
                                }}
                            >
                                {m.download.builds[build]}
                            </Button>
                            {file !== null && <p className="type-caption mt-2 text-muted-foreground">{file}</p>}
                        </li>
                    );
                })}
            </ul>

            {/*
              * Room reserved on the server, so the detected chip appears
              * without moving anything below it: two lines below 640px, where
              * either sentence wraps in a phone-width card, one above. Not a
              * live region: it changes on load, not in answer to anything the
              * reader did.
              */}
            <p className="type-small mt-4 min-h-[3.2em] text-foreground sm:min-h-[1.6em]">
                {status}
            </p>

            <details ref={help} className="group mt-1">
                <summary className="type-label inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-chip text-foreground [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-state) group-open:rotate-90"
                    />
                    {m.download.whichMac.summary}
                </summary>
                <p className="type-small mt-2 pl-6 text-foreground">{m.download.whichMac.body}</p>
            </details>

            {chosen !== null && chosen.name !== null && (
                <Callout role="status" title={m.download.afterClick.title} className="mt-6">
                    <p>{fmt(m.download.afterClick.body, { file: chosen.name })}</p>
                    <p>
                        <Trans
                            text={m.download.afterClick.retry}
                            values={{ file: chosen.name }}
                            tags={{
                                link: (text) => (
                                    <a href={chosen.url} onClick={() => trackDownload('download-retry', 'mac')} className={textLinkClasses('inline')}>
                                        {text}
                                    </a>
                                ),
                            }}
                        />
                    </p>
                    <p>
                        <a href="#install" className={textLinkClasses('standalone')}>
                            {m.download.afterClick.steps}
                            <span aria-hidden="true">↓</span>
                        </a>
                    </p>
                </Callout>
            )}

            {!available && <Callout className="mt-6">{m.download.release.unavailable}</Callout>}

            <div className="-mx-(--cell-bleed) mt-8 border-t border-rule px-(--cell-bleed) pt-6">
                <h3 className="type-h3 text-foreground">{content.mac.otherWays}</h3>

                {mac.homebrewCommand !== null && (
                    <div className="mt-4">
                        <h4 className="type-label text-foreground">{content.mac.homebrew.title}</h4>
                        <p className="type-small mt-1 text-foreground">{content.mac.homebrew.body}</p>
                        <div className="mt-3">
                            <CommandBlock command={mac.homebrewCommand} title={m.download.homebrew.terminal} label={m.download.homebrew.label} />
                        </div>
                        {mac.homebrewTrails ? (
                            <Callout tone="warning" className="mt-3">
                                <p>
                                    <Trans text={content.mac.homebrew.trails} tags={UI_TAGS} />
                                </p>
                            </Callout>
                        ) : (
                            <p className="type-small mt-3 text-muted-foreground">
                                <Trans text={content.mac.homebrew.trails} tags={UI_TAGS} />
                            </p>
                        )}
                    </div>
                )}

                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                    <li>
                        <TextLink href={release.releasesUrl} kind="standalone" external>
                            {content.mac.releases}
                        </TextLink>
                    </li>
                    {links.source !== null && (
                        <li>
                            <TextLink href={links.source} kind="standalone" external>
                                {content.mac.source}
                            </TextLink>
                        </li>
                    )}
                </ul>
            </div>
        </section>
    );
}
