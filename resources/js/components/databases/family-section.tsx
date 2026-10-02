import Badge from '@/components/ui/badge';
import TextLink from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import EngineSection from './engine-section';
import { docsUrl, engineValues, iosStatus, shownPort } from './format';
import LimitsList from './limits-list';
import type { DatabaseLabels, EngineCopy, EngineDetail, FamilySection as FamilySectionContent } from './types';

interface FamilySectionProps {
    section: FamilySectionContent;
    engine: EngineDetail;
    copy: EngineCopy | undefined;
    labels: DatabaseLabels;
    docsBase: string | null;
}

/**
 * A merged engine's section on its family page (sitemap §E.1 block 10), such
 * as MariaDB on `/mysql-client`. The anchor is the engine's `anchor` in
 * engines.json, which the 301 from the engine's old page lands on
 * (`/mariadb-client` → `/mysql-client#mariadb`), so it never comes from copy.
 *
 * Before the copy, a line of data: the default port, where the driver comes
 * from, the iPhone and iPad status and a version label when one applies.
 * After it, the engine's own limits and its setup guide.
 */
export default function FamilySection({ section, engine, copy, labels, docsBase }: FamilySectionProps) {
    const { locale, m, fmt } = useI18n();
    const docs = docsUrl(docsBase, engine.docsSlug);
    const facts = [
        shownPort(engine) !== null ? fmt(labels.family.port, { port: String(shownPort(engine)) }) : null,
        labels.driver[engine.distribution],
        `${labels.facts.ios}: ${labels.ios[iosStatus(engine)]}`,
        engine.versionFloor !== null
            ? `${labels.facts.minimumVersion}: ${fmt(engine.versionFloor.enforced ? labels.facts.enforced : labels.facts.documented, { version: engine.versionFloor.text })}`
            : null,
    ].filter((fact): fact is string => fact !== null);

    return (
        <EngineSection
            id={engine.anchor ?? engine.id}
            title={section.title}
            paragraphs={section.paragraphs}
            points={section.points}
            values={engineValues(engine, m.common.list)}
            before={
                <p className="type-small flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                    {facts.map((fact, index) => (
                        <span key={index} className="inline-flex items-center gap-3">
                            {index > 0 && <span aria-hidden="true">·</span>}
                            {fact}
                        </span>
                    ))}
                    {engine.release !== null && <Badge variant="accent">{fmt(labels.release, { version: engine.release })}</Badge>}
                </p>
            }
            after={
                <>
                    {engine.limits.length > 0 && (
                        <div className="pt-2">
                            <h3 className="type-h3 text-foreground">{fmt(labels.sections.limitsOf, { name: engine.name })}</h3>
                            <LimitsList engine={engine} copy={copy} number={labels.number} className="mt-3" />
                        </div>
                    )}
                    {docs !== null && (
                        <p>
                            <TextLink href={docs} kind="standalone" external hrefLang="en">
                                {fmt(labels.docs, { name: engine.name })}
                                {locale !== 'en' && ` ${m.common.englishOnly}`}
                            </TextLink>
                        </p>
                    )}
                </>
            }
        />
    );
}
