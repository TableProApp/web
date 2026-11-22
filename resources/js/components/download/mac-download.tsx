import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import SegmentedControl from '@/components/ui/segmented-control';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { hasBuildPerArchitecture, MAC_ARCHITECTURES, macAsset } from './mac-asset';
import type { DownloadContent, MacArchitecture, ReleaseAsset, ReleaseProp } from './types';

export interface ArchitectureChoice {
    architecture: MacArchitecture;
    onArchitectureChange: (architecture: MacArchitecture) => void;
}

interface MacDownloadProps extends ArchitectureChoice {
    content: DownloadContent;
    release: ReleaseProp;
    variant: 'primary' | 'secondary';
    location: string;
    caption?: ReactNode;
}

// The DMG link is in the server render with its real URL and nothing starts on its own. A release with a DMG per
// architecture asks for the reader's chip and never guesses it. Once the reader clicked, the action makes way for the
// three install steps and the same file again; with no release data the link opens GitHub, so nothing claims a download
// started.
export default function MacDownload({ content, release, variant, location, caption, architecture, onArchitectureChange }: MacDownloadProps) {
    const { m, fmt } = useI18n();
    // The file that was clicked, which a later choice in the page's other control must not change.
    const [started, setStarted] = useState<ReleaseAsset | null>(null);
    const status = useRef<HTMLDivElement>(null);
    const asset = macAsset(release.assets, architecture);

    useEffect(() => {
        if (started !== null) {
            status.current?.focus();
        }
    }, [started]);

    if (started !== null) {
        return (
            <div ref={status} role="status" tabIndex={-1} className="download-started max-w-[34rem] outline-none">
                <p className="text-[1.0625rem] leading-[1.5] tracking-[-0.011em] text-foreground">
                    <span className="font-medium">{content.started.title}</span>{' '}
                    <Trans
                        text={content.started.retry}
                        tags={{
                            link: (text) => (
                                <a href={started.url} onClick={() => trackDownload('download-retry', 'mac')} className={textLinkClasses('inline')}>
                                    {text}
                                </a>
                            ),
                        }}
                    />
                </p>
                <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[0.9375rem] leading-[1.5] text-muted-foreground marker:text-muted-foreground">
                    {content.started.steps.map((step) => (
                        <li key={step} className="pl-1">
                            {fmt(step, { file: started.name })}
                        </li>
                    ))}
                </ol>
            </div>
        );
    }

    return (
        <div className="grid justify-items-start gap-3">
            {hasBuildPerArchitecture(release.assets) && (
                <SegmentedControl<MacArchitecture>
                    legend={m.download.macCta}
                    size="lg"
                    value={architecture}
                    options={MAC_ARCHITECTURES.map((each) => ({ value: each, label: m.platforms.architectures[each] }))}
                    onChange={onArchitectureChange}
                    className="w-full max-w-xs"
                />
            )}
            <Button
                href={asset?.url ?? release.releaseUrl}
                variant={variant}
                size="lg"
                icon={<Download aria-hidden="true" />}
                onClick={() => {
                    trackDownload(location, 'mac');
                    setStarted(asset);
                }}
            >
                {m.download.macCta}
            </Button>
            {caption !== undefined && <p className="type-small text-muted-foreground">{caption}</p>}
        </div>
    );
}
