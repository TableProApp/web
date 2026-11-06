import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { InlineCode } from '@/components/ui/code';
import Disclosure from '@/components/ui/disclosure';
import DotList from '@/components/ui/dot-list';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { keepTogether } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { architecturesText } from '@/lib/data/platforms';
import CommandBlock from './command-block';
import { megabytes, requirementLine } from './format';
import PlatformCard from './platform-card';
import type { DownloadContent, MacProp, ReleaseProp } from './types';

export const UI_TAGS = { ui: (text: string) => <span className="font-medium">{text}</span> };

interface MacCardProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
    marked: boolean;
    primary: boolean;
    className?: string;
}

// The DMG link is in the server render with its real URL, and nothing claims a download started: the install hint
// appears only after the reader clicked, and offers the same file again in case nothing arrived.
export default function MacCard({ content, release, mac, marked, primary, className }: MacCardProps) {
    const { m, fmt } = useI18n();
    const [clicked, setClicked] = useState(false);

    const available = release.source !== 'unavailable';
    const { asset } = release;
    const version =
        available && release.version !== null
            ? release.publishedAtFormatted !== null
                ? fmt(m.download.release.dated, { version: release.version, date: keepTogether(release.publishedAtFormatted) })
                : fmt(m.download.release.undated, { version: release.version })
            : null;

    return (
        <PlatformCard
            id="mac"
            name={mac.deviceNames[0] ?? 'Mac'}
            marked={marked}
            version={version}
            className={className}
            action={
                <Button
                    href={asset.url}
                    variant={primary ? 'primary' : 'secondary'}
                    size="lg"
                    icon={<Download aria-hidden="true" />}
                    onClick={() => {
                        trackDownload('download-page', 'mac');

                        if (available) {
                            setClicked(true);
                        }
                    }}
                >
                    {m.download.card.dmg}
                </Button>
            }
            details={
                <DotList
                    items={[
                        architecturesText(m.platforms),
                        asset.bytes !== null && <span className="tabular-nums">{fmt(m.download.file.size, { size: megabytes(asset.bytes, m.download.file.number) })}</span>,
                        mac.requirements !== null && requirementLine(mac.requirements, m.platforms),
                    ]}
                />
            }
            updates={m.download.card.updates.mac}
        >
            {clicked && asset.name !== null && (
                <Callout role="status" title={m.download.afterClick.title}>
                    <p>{fmt(m.download.afterClick.body, { file: asset.name })}</p>
                    <p>
                        <Trans
                            text={m.download.afterClick.retry}
                            values={{ file: asset.name }}
                            tags={{
                                link: (text) => (
                                    <a href={asset.url} onClick={() => trackDownload('download-retry', 'mac')} className={textLinkClasses('inline')}>
                                        {text}
                                    </a>
                                ),
                            }}
                        />
                    </p>
                </Callout>
            )}

            {!available && <Callout>{m.download.release.unavailable}</Callout>}

            <div className="grid gap-2">
                {asset.name !== null && asset.sha256 !== null && (
                    <Disclosure summary={m.download.checksum.summary}>
                        <p>
                            <Trans text={m.download.checksum.body} tags={{ code: (text) => <InlineCode>{text}</InlineCode> }} />
                        </p>
                        <p className="mt-3 font-mono text-[0.75rem] [overflow-wrap:anywhere]">
                            <span className="block text-muted-foreground">{asset.name}</span>
                            <span className="block text-foreground">{asset.sha256}</span>
                        </p>
                    </Disclosure>
                )}
                <p className="type-caption text-muted-foreground">{content.mac.signing}</p>
            </div>

            {mac.homebrewCommand !== null && (
                <div>
                    <h3 className="type-label text-foreground">{content.mac.homebrew.title}</h3>
                    <CommandBlock className="mt-3" lines={[mac.homebrewCommand]} title={m.download.homebrew.terminal} label={m.download.homebrew.label} />
                    {mac.homebrewTrails && (
                        <p className="type-caption mt-2 text-muted-foreground">
                            <Trans text={content.mac.homebrew.trails} tags={UI_TAGS} />
                        </p>
                    )}
                </div>
            )}
        </PlatformCard>
    );
}
