import Badge from '@/components/ui/badge';
import DatabaseMark from '@/components/ui/database-mark';
import LocaleLink from '@/components/ui/locale-link';
import { DEFAULT_LOCALE, useI18n } from '@/i18n';
import type { IntegrationLabels, IntegrationSummary } from './types';

interface IntegrationListProps {
    integrations: IntegrationSummary[];
    labels: IntegrationLabels;
}

const NAME_LINK = 'rounded-[2px] transition-colors duration-(--dur-tap) ease-(--ease-feedback) hover:text-accent-text';

export default function IntegrationList({ integrations, labels }: IntegrationListProps) {
    const { locale, m, fmt } = useI18n();
    const english = locale !== DEFAULT_LOCALE;

    return (
        <ul data-rule-list className="frame-rows divide-y divide-rule border-y border-rule">
            {integrations.map((integration) => (
                <li key={integration.slug} className="flex items-start gap-4 py-5">
                    <DatabaseMark icon={integration.icon?.src} name={integration.name} size={40} className="-my-1" />
                    <div className="min-w-0 max-w-[44rem]">
                        <h2 className="type-h3 text-foreground">
                            {/* Detail pages are English only, so other languages link the English page. */}
                            <LocaleLink href={`/integrations/${integration.slug}`} locale={DEFAULT_LOCALE} className={NAME_LINK}>
                                {integration.name}
                            </LocaleLink>
                            {english && (
                                <>
                                    {' '}
                                    <span className="type-small ml-1 font-normal whitespace-nowrap text-muted-foreground">{m.common.englishOnly}</span>
                                </>
                            )}
                        </h2>
                        <p className="type-small mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                            <span>{fmt(labels.by, { publisher: integration.publisher })}</span>
                            <Badge variant={integration.tier === 'community' ? 'outline' : 'neutral'}>{labels.tiers[integration.tier]}</Badge>
                            {integration.closedSource && <Badge variant="outline">{labels.closedSource}</Badge>}
                        </p>
                        <p className="type-body mt-2 text-foreground">{integration.tagline}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
