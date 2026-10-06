import AppStoreBadge from '@/components/download/app-store-badge';
import AssetSlot from '@/components/ui/asset-slot';
import { buttonClasses } from '@/components/ui/button';
import CellGrid from '@/components/ui/cell-grid';
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
    const { m, fmt } = useI18n();
    const mac = macPlatform();
    const ios = releasedIos();
    const macDevices = devicesOf(mac, m.common.list);
    const iosDevices = ios !== null ? devicesOf(ios, m.common.list) : '';

    return (
        <Section
            id="platforms"
            tone="surface"
            flush
            title={
                <>
                    {/* `#mobile` predates this section; an empty anchor keeps old links landing here. */}
                    <span id="mobile" aria-hidden="true" />
                    {fmt(content.title, { deviceList: availability.deviceList })}
                </>
            }
        >
            {/*
              * Two equal cells and the iPhone screenshot as a column of its own: the
              * screenshot beside both from 768px (stacked at 768, side by side from
              * 1024), with the iCloud Sync note under them. Inside the iPhone cell, the
              * 607px slot made it four times the Mac cell's height. Each cell's actions
              * sit at its foot, so the two line up. The cells close on the next join
              * (design-system §4.7).
              */}
            <CellGrid className="md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="flex flex-col md:col-start-1 md:row-start-1">
                    <h3 className="type-h3 text-foreground">{fmt(content.cardTitle, { devices: macDevices })}</h3>
                    <p className="type-body mt-3 text-foreground">{fmt(content.mac, { architectures: macArchitectureList(m) })}</p>
                    <div className="mt-auto grid justify-items-start gap-2 pt-6">
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
                    <div className="flex flex-col md:col-start-1 md:row-start-2 lg:col-start-2 lg:row-start-1">
                        <h3 className="type-h3 text-foreground">{fmt(content.cardTitle, { devices: iosDevices })}</h3>
                        <p className="type-body mt-3 text-foreground">{fmt(content.ios, { devices: iosDevices })}</p>
                        {ios.price.amount === 0 && !ios.price.inAppPurchases && <p className="type-small mt-3 text-muted-foreground">{m.platforms.free}</p>}
                        <div className="mt-auto grid justify-items-start gap-6 pt-6">
                            {availability.appStoreUrl !== null && (
                                <div className="grid justify-items-start gap-2">
                                    <AppStoreBadge href={availability.appStoreUrl} location="home-platforms" />
                                    {availability.iosCaption !== null && <p className="type-small text-muted-foreground">{availability.iosCaption}</p>}
                                </div>
                            )}
                            <p>
                                <LocaleLink href={ios.page ?? '/ios'} className={textLinkClasses('standalone')}>
                                    {fmt(content.cardTitle, { devices: iosDevices })}
                                    <span aria-hidden="true">→</span>
                                </LocaleLink>
                            </p>
                        </div>
                    </div>
                )}

                {ios !== null && (
                    <div className="flex justify-center md:col-start-2 md:row-span-3 md:row-start-1 lg:col-start-3 lg:row-span-2">
                        <AssetSlot id="ios-connection-list" />
                    </div>
                )}

                {ios !== null && (
                    <div className="md:col-start-1 md:row-start-3 lg:col-span-2 lg:row-start-2">
                        <p className="type-body max-w-[44rem] text-foreground">{fmt(content.sync, { tier: tierOf('icloud-sync', m) })}</p>
                        <p className="mt-4">
                            <LocaleLink href="/features/sync-and-teams" className={textLinkClasses('standalone')}>
                                {m.nav.featureLinks.syncTeams}
                                <span aria-hidden="true">→</span>
                            </LocaleLink>
                        </p>
                    </div>
                )}
            </CellGrid>
        </Section>
    );
}
