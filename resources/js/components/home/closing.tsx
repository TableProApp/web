import { Star } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import { useGitHubStars } from '@/hooks/use-github-stars';
import { trackDownload } from '@/lib/analytics';
import { FACTS } from '@/lib/data/facts';
import { Band } from './index-bands';
import type { HomeContent } from './types';

const LINK = 'text-foreground underline decoration-rule-strong underline-offset-4 hover:decoration-foreground';

// The page's last word: what the code is under and who funds it, then the two ways in. It names the team, never a
// person or a city.
export default function Closing({ content, download }: { content: HomeContent['openSource']; download: string }) {
    const stars = useGitHubStars();

    return (
        <Band id="open-source" title={content.title} className="py-16 md:py-24 xl:py-28">
            <p className="max-w-[40rem] text-[1.75rem] leading-[1.25] font-[480] tracking-[-0.025em] text-balance text-foreground md:text-[2.25rem] xl:text-[2.5rem]">
                {content.statement}
            </p>
            <p className="mt-5 max-w-[36rem] text-[1.0625rem] leading-[1.5] tracking-[-0.012em] text-pretty text-muted-foreground">
                {content.funding}{' '}
                <LocaleLink href="/about" className={LINK}>
                    {content.about}
                </LocaleLink>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                <LocaleLink href="/download" onClick={() => trackDownload('home-footer-cta')} className={buttonClasses('primary', 'lg', 'min-w-36')}>
                    {download}
                </LocaleLink>
                <a href={FACTS.links.github} className={`inline-flex items-center gap-1.5 text-[0.9375rem] font-medium tracking-[-0.009em] ${LINK}`}>
                    {content.github}
                    {stars !== null && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground" aria-label={stars.label}>
                            <Star aria-hidden="true" className="size-3.5" />
                            <span aria-hidden="true">{stars.count}</span>
                        </span>
                    )}
                </a>
            </div>
        </Band>
    );
}
