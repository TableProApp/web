import type { LinuxSummary } from '@/components/download/types';
import Card from '@/components/ui/card';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import { connectWith, iosStatus, linuxStatus, shownPort, versionFloorText } from './format';
import type { DatabaseLabels, EngineDetail } from './types';

interface FactsCardProps {
    engine: EngineDetail;
    labels: DatabaseLabels;
    // Null while Linux is not released, which leaves its row out.
    linux: LinuxSummary | null;
    className?: string;
}

// "Enforced" only where the app refuses an older server, and "tested" only for the Linux app, whose CI runs each
// driver's suite against the releases engines.json lists. A term is a third of a narrow card, too narrow for
// "Abfragesprache", so terms hyphenate in the page's language.
export default function FactsCard({ engine, labels, linux, className }: FactsCardProps) {
    const { m, fmt } = useI18n();
    const facts = labels.facts;
    const onLinux = linuxStatus(engine);

    return (
        <Card title={facts.title} titleAs="h2" className={className}>
            <DescriptionList className="mt-1 [&_dt]:hyphens-auto">
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
                {linux !== null && (
                    <DescriptionItem term={joinList(linux.deviceNames, m.common.list)}>
                        {onLinux === 'tested' && engine.linux.tested.length > 0 ? fmt(labels.linux.versions, { versions: engine.linux.tested.join(', ') }) : labels.linux[onLinux]}
                    </DescriptionItem>
                )}
                <DescriptionItem term={facts.ios}>{labels.ios[iosStatus(engine)]}</DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
