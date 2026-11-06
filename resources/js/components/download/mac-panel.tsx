import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import Callout from '@/components/ui/callout';
import { CodeBlock, InlineCode } from '@/components/ui/code';
import Disclosure from '@/components/ui/disclosure';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { keepTogether } from '@/i18n/format';
import { trackDownload } from '@/lib/analytics';
import { architecturesText } from '@/lib/data/platforms';
import { megabytes, requirementLine } from './format';
import PanelFacts, { CENTRED_DISCLOSURE } from './panel-facts';
import type { DownloadContent, MacProp, ReleaseProp } from './types';

const UI_TAGS = { ui: (text: string) => <span className="font-medium">{text}</span> };

interface MacPanelProps {
    content: DownloadContent;
    release: ReleaseProp;
    mac: MacProp;
}

// The DMG link is in the server render with its real URL, and nothing claims a download started: the install hint
// appears only after the reader clicked, and offers the same file again in case nothing arrived.
export default function MacPanel({ content, release, mac }: MacPanelProps) {
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
        <div className="grid gap-10">
            <PanelFacts
                action={
                    <Button
                        href={asset.url}
                        size="lg"
                        icon={<Download aria-hidden="true" />}
                        onClick={() => {
                            trackDownload('download-page', 'mac');

                            if (available) {
                                setClicked(true);
                            }
                        }}
                    >
                        {m.download.macCta}
                    </Button>
                }
                lines={[
                    [version, asset.bytes !== null && <span className="tabular-nums">{fmt(m.download.file.size, { size: megabytes(asset.bytes, m.download.file.number) })}</span>],
                    [mac.requirements !== null && requirementLine(mac.requirements, m.platforms), architecturesText(m.platforms)],
                ]}
                updates={m.download.panel.updates.mac}
            >
                {clicked && asset.name !== null && (
                    <Callout role="status" title={m.download.afterClick.title} className="text-left">
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
                {!available && <Callout className="text-left">{m.download.release.unavailable}</Callout>}
            </PanelFacts>

            {(mac.homebrewCommand !== null || asset.sha256 !== null) && (
                <div className="grid gap-6">
                    {mac.homebrewCommand !== null && (
                        <div>
                            <h3 className="type-label text-center text-foreground">{content.mac.homebrew.title}</h3>
                            <CodeBlock className="mt-3" label={m.download.homebrew.label} code={mac.homebrewCommand} command copyLabels={m.controls.copy} />
                            {mac.homebrewTrails && (
                                <p className="type-caption mt-2 text-center text-muted-foreground">
                                    <Trans text={content.mac.homebrew.trails} tags={UI_TAGS} />
                                </p>
                            )}
                        </div>
                    )}

                    {asset.name !== null && asset.sha256 !== null && (
                        <Disclosure summary={m.download.checksum.summary} className={CENTRED_DISCLOSURE}>
                            <p>{content.mac.signing}</p>
                            <p className="mt-3">
                                <Trans text={m.download.checksum.body} tags={{ code: (text) => <InlineCode>{text}</InlineCode> }} />
                            </p>
                            <p className="mt-3 font-mono text-[0.75rem] [overflow-wrap:anywhere]">
                                <span className="block text-muted-foreground">{asset.name}</span>
                                <span className="block text-foreground">{asset.sha256}</span>
                            </p>
                        </Disclosure>
                    )}
                </div>
            )}
        </div>
    );
}
