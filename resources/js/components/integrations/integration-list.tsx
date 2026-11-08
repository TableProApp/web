import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import { DEFAULT_LOCALE, useI18n } from '@/i18n';
import type { IntegrationLabels, IntegrationSummary } from './types';

interface IntegrationListProps {
    integrations: IntegrationSummary[];
    labels: IntegrationLabels;
}

// Ruled rows: the app's mark, its name, one sentence, who makes it. The name's link covers the whole row.
export default function IntegrationList({ integrations, labels }: IntegrationListProps) {
    const { locale, m, fmt } = useI18n();
    const english = locale !== DEFAULT_LOCALE;

    return (
        <ul className="divide-y divide-rule border-t border-rule">
            {integrations.map((integration) => (
                <li key={integration.slug} className="group relative flex items-start gap-4 py-5">
                    <DatabaseMark icon={integration.icon?.src} name={integration.name} size={40} tile={false} className="mt-0.5" />
                    <div className="min-w-0">
                        <h3 className="text-[1.25rem] leading-[1.25] font-[520] tracking-[-0.018em] text-foreground">
                            {/* Detail pages are English only, so other languages link the English page. */}
                            <LocaleLink
                                href={`/integrations/${integration.slug}`}
                                locale={DEFAULT_LOCALE}
                                className="rounded-[2px] decoration-rule-strong underline-offset-4 after:absolute after:inset-0 group-hover:underline"
                            >
                                {integration.name}
                            </LocaleLink>
                            {english && <span className="ml-2 text-sm font-normal tracking-normal whitespace-nowrap text-muted-foreground">{m.common.englishOnly}</span>}
                        </h3>
                        <p className="mt-1.5 text-base leading-[1.55] text-pretty text-muted-foreground">{integration.tagline}</p>
                        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm leading-[1.4] text-muted-foreground">
                            <span>
                                {integration.tier === 'official'
                                    ? fmt(labels.by, { publisher: integration.publisher })
                                    : fmt(labels.byTier, { tier: labels.tiers[integration.tier], publisher: integration.publisher })}
                            </span>
                            {integration.closedSource && <span>{labels.closedSource}</span>}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
