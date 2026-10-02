import Section from '@/components/ui/section';
import TextLink from '@/components/ui/text-link';
import { FACTS } from '@/lib/data/facts';
import { SPONSORS, type Sponsor } from '@/lib/data/sponsors';
import type { HomeContent } from './types';

/**
 * Logos are drawn 28px tall (design-system §5.3.18 SponsorList); the width
 * follows the file's own ratio. The list wraps instead of using fixed columns,
 * and a wordmark wider than the column scales down (`max-w-full`,
 * `object-contain`) rather than running into its neighbour at 375px.
 */
const LOGO_HEIGHT = 28;

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
    const width = Math.round((LOGO_HEIGHT * sponsor.logo.width) / sponsor.logo.height);
    const image = (src: string, className: string) => (
        <img src={src} alt="" width={width} height={LOGO_HEIGHT} loading="lazy" decoding="async" className={className} />
    );

    /*
     * A sponsor's own dark logo when the data has one. Otherwise the regular
     * logo sits on a white tile in dark mode, as the database marks do: no
     * filter or inversion ever alters a trademark. The tile's padding is there
     * in light mode too, so switching theme moves nothing.
     */
    return (
        <span aria-hidden="true" className="inline-flex h-11 max-w-full items-center rounded-chip px-2 dark:bg-[#ffffff]">
            {sponsor.logo.dark !== null ? (
                <>
                    {image(sponsor.logo.light, 'block h-7 w-auto max-w-full object-contain dark:hidden')}
                    {image(sponsor.logo.dark, 'hidden h-7 w-auto max-w-full object-contain dark:block')}
                </>
            ) : (
                image(sponsor.logo.light, 'block h-7 w-auto max-w-full object-contain')
            )}
        </span>
    );
}

/**
 * Section 3, `#sponsors`. Third on the page by the owner's decision (spec §0),
 * and compact, so it interrupts the explanation as little as possible.
 *
 * Only the sponsors verified as current are listed (resources/data/sponsors.json
 * records when and how). Each link is `rel="sponsored noopener"` and named by
 * the sponsor's visible name under its logo.
 */
export default function SponsorsSection({ content }: { content: HomeContent['sponsors'] }) {
    return (
        <Section
            id="sponsors"
            title={content.title}
            titleStyle="h3"
            className="border-y border-rule py-12 md:py-12 xl:py-12"
            aside={
                <TextLink href={FACTS.links.sponsorsProgram} kind="standalone" external>
                    {content.link}
                </TextLink>
            }
        >
            <ul className="flex flex-wrap items-start gap-x-8 gap-y-6 sm:gap-x-12">
                {SPONSORS.sponsors.map((sponsor) => (
                    <li key={sponsor.id} className="max-w-full">
                        <a
                            href={sponsor.url}
                            rel="sponsored noopener"
                            className="group grid max-w-full justify-items-start gap-2 rounded-control"
                        >
                            <SponsorLogo sponsor={sponsor} />
                            <span className="type-small text-muted-foreground transition-colors duration-(--dur-tap) ease-(--ease-feedback) group-hover:text-foreground">
                                {sponsor.name}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
