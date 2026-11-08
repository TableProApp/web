import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/button';
import { textLinkClasses } from '@/components/ui/text-link';
import { Trans, useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import type { DownloadContent, ReleaseProp } from './types';

interface MacDownloadProps {
    content: DownloadContent;
    release: ReleaseProp;
    variant: 'primary' | 'secondary';
    location: string;
    caption?: ReactNode;
}

// The DMG link is in the server render with its real URL and nothing starts on its own. Once the reader clicked, the
// action makes way for the three install steps and the same file again; with no release data the link opens GitHub, so
// nothing claims a download started.
export default function MacDownload({ content, release, variant, location, caption }: MacDownloadProps) {
    const { m, fmt } = useI18n();
    const [started, setStarted] = useState(false);
    const status = useRef<HTMLDivElement>(null);
    const { asset } = release;
    const file = release.source !== 'unavailable' ? asset.name : null;

    useEffect(() => {
        if (started) {
            status.current?.focus();
        }
    }, [started]);

    if (started && file !== null) {
        return (
            <div ref={status} role="status" tabIndex={-1} className="download-started max-w-[34rem] outline-none">
                <p className="text-[1.0625rem] leading-[1.5] tracking-[-0.011em] text-foreground">
                    <span className="font-medium">{content.started.title}</span>{' '}
                    <Trans
                        text={content.started.retry}
                        tags={{
                            link: (text) => (
                                <a href={asset.url} onClick={() => trackDownload('download-retry', 'mac')} className={textLinkClasses('inline')}>
                                    {text}
                                </a>
                            ),
                        }}
                    />
                </p>
                <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[0.9375rem] leading-[1.5] text-muted-foreground marker:text-muted-foreground">
                    {content.started.steps.map((step) => (
                        <li key={step} className="pl-1">
                            {fmt(step, { file })}
                        </li>
                    ))}
                </ol>
            </div>
        );
    }

    return (
        <div className="grid justify-items-start gap-3">
            <Button
                href={asset.url}
                variant={variant}
                size="lg"
                icon={<Download aria-hidden="true" />}
                onClick={() => {
                    trackDownload(location, 'mac');
                    setStarted(true);
                }}
            >
                {m.download.macCta}
            </Button>
            {caption !== undefined && <p className="type-small text-muted-foreground">{caption}</p>}
        </div>
    );
}
