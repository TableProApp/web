import Card from '@/components/ui/card';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { connectWith, shownPort, versionFloorText } from './format';
import type { DatabaseLabels, EngineDetail } from './types';

// "Enforced" only where the app refuses an older server. A term is a third of a narrow card, too narrow for
// "Abfragesprache", so terms hyphenate in the page's language. No platform rows: a missing one reads as "not there".
export default function FactsCard({ engine, labels }: { engine: EngineDetail; labels: DatabaseLabels }) {
    const { m, fmt } = useI18n();
    const facts = labels.facts;
    const port = shownPort(engine);

    return (
        <Card title={facts.title} titleAs="h2">
            <DescriptionList className="mt-1 [&_dt]:hyphens-auto">
                <DescriptionItem term={facts.queryLanguage}>{engine.queryLanguage}</DescriptionItem>
                <DescriptionItem term={facts.driver}>
                    {labels.driver[engine.distribution]}
                    {engine.sharedWith.length > 0 && <span className="block text-muted-foreground">{fmt(facts.sharedWith, { engines: joinList(engine.sharedWith, m.common.list) })}</span>}
                </DescriptionItem>
                <DescriptionItem term={facts.connect}>{connectWith(engine, labels.connect).join(', ')}</DescriptionItem>
                {port !== null && (
                    <DescriptionItem term={facts.defaultPort}>
                        <span className="tabular-nums">{port}</span>
                    </DescriptionItem>
                )}
                {engine.versionFloor !== null && <DescriptionItem term={facts.minimumVersion}>{versionFloorText(engine.versionFloor, facts)}</DescriptionItem>}
                {engine.bundledVersion !== null && (
                    <DescriptionItem term={facts.embedded}>{fmt(facts.embeddedValue, { name: engine.name, version: engine.bundledVersion })}</DescriptionItem>
                )}
            </DescriptionList>
        </Card>
    );
}
