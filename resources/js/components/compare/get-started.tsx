import { buttonClasses } from '@/components/ui/button';
import { AppleGlyph } from '@/components/ui/glyph';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import type { CompareLabels } from './types';

interface GetStartedProps {
    labels: CompareLabels;
    /** The `download_click` location: which page's closing band was used. */
    location: string;
    /** Off on the hub, which is where the link goes. */
    hubLink?: boolean;
}

export default function GetStarted({ labels, location, hubLink = true }: GetStartedProps) {
    const { m } = useI18n();

    return (
        <Section id="get-started" title={labels.sections.cta} width="text">
            <p className="type-body text-foreground">{labels.cta.body}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                <LocaleLink href="/download" onClick={() => trackDownload(location, 'mac')} className={buttonClasses('primary', 'md')}>
                    <AppleGlyph />
                    {m.download.macCta}
                </LocaleLink>
                <LocaleLink href="/pricing" className={textLinkClasses('standalone')}>
                    {labels.cta.pricing}
                    <span aria-hidden="true">→</span>
                </LocaleLink>
                {hubLink && (
                    <LocaleLink href="/compare" className={textLinkClasses('standalone')}>
                        {labels.cta.hub}
                        <span aria-hidden="true">→</span>
                    </LocaleLink>
                )}
            </div>
        </Section>
    );
}
