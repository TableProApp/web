import { usePage } from '@inertiajs/react';
import CommandBlock from '@/components/download/command-block';
import type { SiteLinks } from '@/components/faq/content-links';
import SEOHead from '@/components/seo/seo-head';
import Badge from '@/components/ui/badge';
import LocaleLink from '@/components/ui/locale-link';
import PageHeader from '@/components/ui/page-header';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { LOCALES, Trans, useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { PUBLISHER } from '@/lib/data/facts';
import { distributionText, linuxPlatform, linuxRepositories } from '@/lib/data/platforms';
import { absoluteUrl, graph, organizationNode, webPageNode } from '@/lib/structured-data';
import LandingLayout from '@/layouts/landing-layout';

type LinuxContent = typeof import('@data/content/en/linux.json');

interface LinuxProps {
    content: LinuxContent;
    /** The engines the Linux app connects to, empty while it has nothing to install. */
    engines: { id: string; name: string; href: string | null }[];
    links: SiteLinks;
    organizationProfiles: string[];
}

export default function Linux({ content, engines, links, organizationProfiles }: LinuxProps) {
    const { canonicalBaseUrl } = usePage().props;
    const { locale, m, fmt, path } = useI18n();
    const linux = linuxPlatform();
    const repositories = linux !== null ? linuxRepositories(linux) : [];
    const releases = linux?.destinations.find((entry) => entry.kind === 'releases') ?? null;
    const context = { baseUrl: canonicalBaseUrl, inLanguage: LOCALES.supported[locale].hreflang };

    const jsonLd = graph([
        organizationNode(canonicalBaseUrl, { description: m.seo.product.short, sameAs: organizationProfiles, publisher: PUBLISHER }),
        webPageNode(context, {
            url: absoluteUrl(canonicalBaseUrl, path('/linux')),
            name: content.seo.title,
            description: content.seo.description,
        }),
    ]);

    return (
        <LandingLayout>
            <SEOHead title={content.seo.title} titleTemplate={false} description={content.seo.description} jsonLd={jsonLd} />

            <PageHeader title={content.hero.title} lead={content.hero.lead}>
                <div className="space-y-4">
                    {linux !== null && <Badge>{m.platforms.status.beta}</Badge>}
                </div>
            </PageHeader>

            {linux !== null && (
                <Section id="install" title={content.install.title} width="text">
                    <div className="space-y-8">
                        <p className="type-body text-foreground">
                            {fmt(content.install.lead, { architectures: joinList(linux.architectures, m.common.list) })}
                        </p>

                        {repositories.map((repository) => (
                            <div key={repository.kind}>
                                <h3 className="type-h3 text-foreground">{distributionText(repository, m.platforms, m.common.list)}</h3>
                                <div className="mt-3">
                                    <CommandBlock
                                        command={repository.beta}
                                        title={m.download.homebrew.terminal}
                                        label={fmt(content.install.label, { system: repository.system })}
                                    />
                                </div>
                            </div>
                        ))}

                        <div>
                            <h3 className="type-h3 text-foreground">{content.install.stable.title}</h3>
                            <p className="type-body mt-3 text-foreground">{content.install.stable.body}</p>
                            <div className="mt-3 space-y-3">
                                {repositories.map((repository) => (
                                    <CommandBlock
                                        key={repository.kind}
                                        command={repository.stable}
                                        title={repository.system}
                                        label={fmt(content.install.label, { system: repository.system })}
                                    />
                                ))}
                            </div>
                        </div>

                        {releases !== null && 'url' in releases && (
                            <div>
                                <h3 className="type-h3 text-foreground">{content.install.releases.title}</h3>
                                <p className="type-body mt-3 text-foreground">
                                    <Trans
                                        text={content.install.releases.body}
                                        tags={{
                                            releases: (text) => (
                                                <TextLink href={releases.url} kind="inline" external>
                                                    {text}
                                                </TextLink>
                                            ),
                                        }}
                                    />
                                </p>
                            </div>
                        )}

                        {links.docs !== null && (
                            <p>
                                <TextLink href={links.docs.replace(/\/+$/, '') + content.install.guide.path} kind="standalone" external hrefLang="en">
                                    {content.install.guide.label}
                                </TextLink>
                            </p>
                        )}

                    </div>
                </Section>
            )}

            {engines.length > 0 && (
                <Section id="databases" title={content.databases.title} lead={content.databases.lead}>
                    <ul className="grid max-w-[44rem] grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                        {engines.map((engine) => (
                            <li key={engine.id} className="type-body font-medium text-foreground">
                                {engine.href !== null ? (
                                    <LocaleLink href={engine.href} className={textLinkClasses('inline')}>
                                        {engine.name}
                                    </LocaleLink>
                                ) : (
                                    engine.name
                                )}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}
        </LandingLayout>
    );
}
