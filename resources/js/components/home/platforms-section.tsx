import AppStoreBadge from '@/components/download/app-store-badge';
import AssetSlot from '@/components/ui/asset-slot';
import { buttonClasses } from '@/components/ui/button';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { trackDownload } from '@/lib/analytics';
import { devicesOf, macPlatform } from '@/lib/data/platforms';
import { macArchitectureList, releasedIos, tierOf, type Availability } from './availability';
import type { HomeContent } from './types';

interface PlatformsSectionProps {
    content: HomeContent['platforms'];
    availability: Availability;
}

/**
 * Section 7, `#platforms` with the alias `#mobile`: "Is there a phone app, and
 * how does it relate to the Mac app?" (sitemap §D; positioning §7 P6). The
 * page's one surface band.
 *
 * One card per released platform, described positively and with no parity
 * claim: the iPhone and iPad app is a separate app with its own scope, which
 * /ios spells out. The card titles, devices and requirements are
 * platforms.json's, and the plan iCloud Sync needs on the Mac is
 * paid-features.json's.
 */
export default function PlatformsSection({ content, availability }: PlatformsSectionProps) {
    const { locale, m, fmt } = useI18n();
    const mac = macPlatform();
    const ios = releasedIos();
    const macDevices = devicesOf(mac, m.common.list);
    const iosDevices = ios !== null ? devicesOf(ios, m.common.list) : '';

    return (
        <Section
            id="platforms"
            tone="surface"
            title={
                <>
                    {/* `#mobile` predates this section; an empty anchor keeps old links landing here. */}
                    <span id="mobile" aria-hidden="true" />
                    {fmt(content.title, { deviceList: availability.deviceList })}
                </>
            }
        >
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <div className="rounded-panel border border-rule bg-raised p-5 sm:p-6">
                    <h3 className="type-h3 text-foreground">{fmt(content.cardTitle, { devices: macDevices })}</h3>
                    <p className="type-body mt-3 text-foreground">{fmt(content.mac, { architectures: macArchitectureList(m) })}</p>
                    <div className="mt-6 grid justify-items-start gap-2">
                        <LocaleLink
                            href="/download"
                            onClick={() => trackDownload('home-platforms', 'mac')}
                            className={buttonClasses('secondary', 'md')}
                        >
                            {m.download.macCta}
                        </LocaleLink>
                        <p className="type-small text-muted-foreground">{availability.macCaption}</p>
                    </div>
                </div>

                {ios !== null && (
                    <div className="rounded-panel border border-rule bg-raised p-5 sm:p-6">
                        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start lg:grid-cols-1">
                            <div className="min-w-0">
                                <h3 className="type-h3 text-foreground">{fmt(content.cardTitle, { devices: iosDevices })}</h3>
                                <p className="type-body mt-3 text-foreground">{fmt(content.ios, { devices: iosDevices })}</p>
                                {ios.price.amount === 0 && !ios.price.inAppPurchases && (
                                    <p className="type-small mt-3 text-muted-foreground">{m.platforms.free}</p>
                                )}
                                {availability.appStoreUrl !== null && (
                                    <div className="mt-6 grid justify-items-start gap-2">
                                        <AppStoreBadge
                                            href={availability.appStoreUrl}
                                            label={m.download.ios.badge}
                                            labelLang={locale === 'en' ? undefined : 'en'}
                                            location="home-platforms"
                                        />
                                        {availability.iosCaption !== null && (
                                            <p className="type-small text-muted-foreground">{availability.iosCaption}</p>
                                        )}
                                    </div>
                                )}
                                <p className="mt-6">
                                    <LocaleLink href={ios.page ?? '/ios'} className={textLinkClasses('standalone')}>
                                        {fmt(content.cardTitle, { devices: iosDevices })}
                                        <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                </p>
                            </div>
                            <AssetSlot id="ios-connection-list" />
                        </div>
                    </div>
                )}
            </div>

            {ios !== null && (
                <div className="mt-8 max-w-[44rem]">
                    <p className="type-body text-foreground">{fmt(content.sync, { tier: tierOf('icloud-sync', m) })}</p>
                    <p className="mt-4">
                        <LocaleLink href="/features/sync-and-teams" className={textLinkClasses('standalone')}>
                            {m.nav.featureLinks.syncTeams}
                            <span aria-hidden="true">→</span>
                        </LocaleLink>
                    </p>
                </div>
            )}
        </Section>
    );
}
