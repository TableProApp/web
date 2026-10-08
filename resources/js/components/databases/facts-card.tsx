import Card from '@/components/ui/card';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { connectWith, iosStatus, shownPort, versionFloorText } from './format';
import type { DatabaseLabels, EngineDetail } from './types';

interface FactsCardProps {
    engine: EngineDetail;
    labels: DatabaseLabels;
    className?: string;
}

/**
 * The "At a glance" card beside an engine page's header (design-system §8.4).
 * Every row is data: the query language, where the driver comes from and what
 * shares it, how a connection reaches the engine, the default port, the
 * version floor, the embedded engine version and the iPhone and iPad status.
 * A row with nothing to say is left out.
 *
 * The version floor says "enforced" only where the app refuses an older
 * server; a floor that comes from the docs is the bare version, and "no
 * minimum" is shown only where the docs say so. The site never says "tested":
 * there is no test evidence for any engine version.
 */
export default function FactsCard({ engine, labels, className }: FactsCardProps) {
    const { m, fmt } = useI18n();
    const facts = labels.facts;

    return (
        <Card title={facts.title} titleAs="h2" className={className}>
            <DescriptionList className="mt-1">
                <DescriptionItem term={facts.queryLanguage}>{engine.queryLanguage}</DescriptionItem>
                <DescriptionItem term={facts.driver}>
                    {labels.driver[engine.distribution]}
                    {engine.sharedWith.length > 0 && (
                        <span className="block text-muted-foreground">
                            {fmt(facts.sharedWith, { engines: joinList(engine.sharedWith, m.common.list) })}
                        </span>
                    )}
                </DescriptionItem>
                <DescriptionItem term={facts.connect}>{connectWith(engine, labels.connect).join(', ')}</DescriptionItem>
                {shownPort(engine) !== null && (
                    <DescriptionItem term={facts.defaultPort}>
                        <span className="tabular-nums">{shownPort(engine)}</span>
                    </DescriptionItem>
                )}
                {engine.versionFloor !== null && (
                    <DescriptionItem term={facts.minimumVersion}>{versionFloorText(engine.versionFloor, facts)}</DescriptionItem>
                )}
                {engine.bundledVersion !== null && (
                    <DescriptionItem term={facts.embedded}>
                        {fmt(facts.embeddedValue, { name: engine.name, version: engine.bundledVersion })}
                    </DescriptionItem>
                )}
                <DescriptionItem term={facts.ios}>{labels.ios[iosStatus(engine)]}</DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
