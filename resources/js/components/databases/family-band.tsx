import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import TextLink from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { FACTS } from '@/lib/data/facts';
import EngineBand from './engine-band';
import { engineValues, shownPort, versionFloorText } from './format';
import LimitsList from './limits-list';
import type { DatabaseLabels, EngineCopy, EngineDetail, FamilyBand as FamilyContent } from './types';

interface FamilyBandProps {
    content: FamilyContent;
    engine: EngineDetail;
    parent: EngineDetail;
    copy: EngineCopy | undefined;
    labels: DatabaseLabels;
}

// A merged engine on its family page, such as MariaDB on `/mysql-client`. The id is the engine's `anchor` in
// engines.json, which the 301 from its old page lands on, so it never comes from copy. Beside the copy, what differs
// from the parent, from data: the port, the version floor and the limits.
export default function FamilyBand({ content, engine, parent, copy, labels }: FamilyBandProps) {
    const { locale, m, fmt } = useI18n();
    const port = shownPort(engine);
    const ownDocs = engine.docsSlug !== null && engine.docsSlug !== parent.docsSlug;
    const hasLimits = engine.limits.some((limit) => typeof copy?.limits[limit.id] === 'string');

    return (
        <EngineBand
            id={engine.anchor ?? engine.id}
            title={content.title}
            marker={
                engine.release !== null && (
                    <Badge variant="accent" className="mt-3 whitespace-nowrap">
                        {fmt(labels.release, { version: engine.release })}
                    </Badge>
                )
            }
            text={content.text}
            values={engineValues(engine, m.common.list)}
        >
            {(port !== null || engine.versionFloor !== null || hasLimits) && (
                <Card className="mt-8">
                    <DescriptionList className="border-t-0 [&>div:last-child]:border-b-0 [&>div:first-child]:pt-0">
                        {port !== null && (
                            <DescriptionItem term={labels.facts.defaultPort}>
                                <span className="tabular-nums">{port}</span>
                            </DescriptionItem>
                        )}
                        {engine.versionFloor !== null && <DescriptionItem term={labels.facts.minimumVersion}>{versionFloorText(engine.versionFloor, labels.facts)}</DescriptionItem>}
                        {hasLimits && (
                            <DescriptionItem term={labels.limits}>
                                <LimitsList engine={engine} copy={copy} number={labels.number} />
                            </DescriptionItem>
                        )}
                    </DescriptionList>
                </Card>
            )}
            {ownDocs && (
                <p className="mt-6">
                    <TextLink href={`${FACTS.links.docs.replace(/\/+$/, '')}/databases/${engine.docsSlug}`} kind="standalone" external hrefLang="en">
                        {fmt(labels.docs, { name: engine.name })}
                        {locale !== 'en' && ` ${m.common.englishOnly}`}
                    </TextLink>
                </p>
            )}
        </EngineBand>
    );
}
