import { Fragment, type ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import FeatureHero from '@/components/features/feature-hero';
import Badge from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button';
import TextLink from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList, keepTogether } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import AppStoreBadge from './app-store-badge';
import { requirementLine } from './format';
import { distributionsText } from './linux-text';
import MacDownload from './mac-download';
import type { DeviceKey, DownloadContent, IosProp, LinuxProp, MacProp, ReleaseProp } from './types';

interface DownloadHeroProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
    linux: LinuxProp | null;
    ios: IosProp | null;
}

interface Variant {
    devices: DeviceKey[];
    node: ReactNode;
}

// Each variant names the machines it is for, and app.css shows the reader's before first paint. The space between them
// keeps the H1's words apart where no CSS applies.
function Variants({ variants, as: Tag = 'span' }: { variants: Variant[]; as?: 'span' | 'div' }) {
    return variants.map((variant, index) => (
        <Fragment key={variant.devices.join(' ')}>
            {index > 0 && ' '}
            <Tag data-device={variant.devices.join(' ')}>{variant.node}</Tag>
        </Fragment>
    ));
}

export function IosAction({ content, ios, store, location }: { content: DownloadContent; ios: IosProp; store: string; location: string }) {
    const { m, fmt } = useI18n();
    const requirement = requirementLine(ios.requirements, m.platforms);

    return (
        <div className="grid justify-items-start gap-3">
            <AppStoreBadge href={store} location={location} />
            <p className="type-small text-muted-foreground">{fmt(ios.free && !ios.inAppPurchases ? content.hero.free : content.hero.requires, { requirement })}</p>
        </div>
    );
}

// The release and the one action for the reader's machine: the DMG on a Mac, the Linux commands on Linux, the App Store
// on an iPhone or iPad. Any other machine gets the Mac's release and a sentence naming where TablePro runs, never a
// guessed download. The server renders every variant with the Mac's showing, and the head script's class picks before
// first paint, so nothing moves.
export default function DownloadHero({ content, release, mac, linux, ios }: DownloadHeroProps) {
    const { m, fmt } = useI18n();
    const store = ios !== null ? ios.appStoreUrl : null;
    const noApp: DeviceKey[] = ['other', ...(linux === null ? (['linux'] as const) : []), ...(store === null ? (['ios'] as const) : [])];

    const title = (version: string | null): string => (version !== null ? fmt(content.hero.title, { version }) : content.header.title);
    const released = (date: string | null, notes: string | null): ReactNode => (
        <>
            {date !== null && fmt(content.hero.released, { date: keepTogether(date) })}
            {date !== null && notes !== null && ' '}
            {notes !== null && (
                <TextLink href={notes} external hrefLang="en">
                    {m.download.release.notes}
                </TextLink>
            )}
        </>
    );

    const live = release.source !== 'unavailable';
    const releases: { devices: DeviceKey[]; title: ReactNode; lead: ReactNode }[] = [
        {
            devices: ['mac', ...noApp],
            title: title(live ? release.shortVersion : null),
            lead: live ? released(release.publishedAtFormatted, release.releaseUrl) : null,
        },
    ];

    if (linux !== null) {
        releases.push({
            devices: ['linux'],
            title: (
                <>
                    {title(linux.release?.shortVersion ?? null)}
                    {linux.channel === 'beta' && linux.release !== null && (
                        <>
                            {' '}
                            <Badge variant="outline" className="ml-1 align-middle">
                                {m.download.panel.beta}
                            </Badge>
                        </>
                    )}
                </>
            ),
            lead: linux.release !== null ? released(linux.release.publishedOn, linux.release.releaseUrl) : null,
        });
    }

    if (ios !== null && store !== null) {
        releases.push({ devices: ['ios'], title: title(ios.shortVersion), lead: released(ios.publishedAtFormatted, null) });
    }

    const names = [...mac.deviceNames, ...(linux?.deviceNames ?? []), ...(ios?.deviceNames ?? [])];
    const actions: Variant[] = [
        {
            devices: ['mac'],
            node: (
                <MacDownload
                    content={content}
                    release={release}
                    variant="primary"
                    location="download-page"
                    caption={
                        mac.requirements !== null
                            ? fmt(mac.universal ? content.hero.universal : content.hero.requires, { requirement: requirementLine(mac.requirements, m.platforms) })
                            : undefined
                    }
                />
            ),
        },
    ];

    if (linux !== null) {
        actions.push({
            devices: ['linux'],
            node: (
                <div className="grid justify-items-start gap-3">
                    <a href="#linux" onClick={() => trackDownload('download-page', 'linux')} className={buttonClasses('primary', 'lg')}>
                        <ArrowDown aria-hidden="true" />
                        {m.download.linuxCta}
                    </a>
                    <p className="type-small text-muted-foreground">{fmt(content.hero.linux, { distributions: distributionsText(linux, m.download) })}</p>
                </div>
            ),
        });
    }

    if (ios !== null && store !== null) {
        actions.push({ devices: ['ios'], node: <IosAction content={content} ios={ios} store={store} location="download-page" /> });
    }

    actions.push({
        devices: noApp,
        node: <p className="max-w-[34rem] text-[1.0625rem] leading-[1.5] tracking-[-0.011em] text-foreground">{fmt(content.hero.other, { platforms: joinList(names, m.common.list) })}</p>,
    });

    return (
        <FeatureHero
            eyebrow={
                <img
                    src="/images/brand/tablepro-icon-128.png"
                    srcSet="/images/brand/tablepro-icon-128.png 1x, /images/brand/tablepro-icon-256.png 2x"
                    alt=""
                    width={80}
                    height={80}
                    className="mb-6 size-16 md:mb-8 md:size-20"
                />
            }
            title={<Variants variants={releases.map((each) => ({ devices: each.devices, node: each.title }))} />}
            lead={<Variants variants={releases.map((each) => ({ devices: each.devices, node: each.lead }))} />}
            actions={<Variants variants={actions} as="div" />}
        />
    );
}
