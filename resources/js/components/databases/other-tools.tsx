import DotList from '@/components/ui/dot-list';
import LocaleLink from '@/components/ui/locale-link';
import Section from '@/components/ui/section';
import TextLink, { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { joinList } from '@/i18n/format';
import RichText from './rich-text';
import type { CitedTool, DatabaseLabels, OtherToolsContent } from './types';

interface OtherToolsProps {
    content: OtherToolsContent;
    tools: CitedTool[];
    comparisons: { path: string; title: string }[];
    labels: DatabaseLabels;
}

type PlatformName = keyof DatabaseLabels['platformNames'];

/**
 * "Other tools" (sitemap §E.1 block 11): one fair paragraph per tool a reader
 * of this engine's page might also consider.
 *
 * The paragraph is copy; every fact around it is data from comparisons.json:
 * the version and its date (or that the tool is discontinued), the licence,
 * whether it is free, its platforms and its sources, with the date the facts
 * were checked. A tool with a comparison page links to it. The text of a
 * cited-only tool's comparison notes comes from the page's `notes`.
 */
export default function OtherTools({ content, tools, comparisons, labels }: OtherToolsProps) {
    const { m, fmt } = useI18n();
    const strings = labels.otherTools;
    const byId = new Map(tools.map((tool) => [tool.id, tool]));
    const checked = tools.map((tool) => tool.checked).find((date): date is string => date !== null) ?? null;

    return (
        <Section id="other-tools" title={strings.title}>
            <div className="max-w-[44rem] space-y-8">
                {content.items.map((item) => {
                    const tool = byId.get(item.product);

                    if (tool === undefined) {
                        return null;
                    }

                    const platforms = tool.platforms
                        .filter((id): id is PlatformName => Object.hasOwn(labels.platformNames, id))
                        .map((id) => labels.platformNames[id]);
                    const facts = [
                        tool.state === 'discontinued' || tool.version === null || tool.released === null
                            ? null
                            : fmt(strings.released, { version: tool.version, date: tool.released }),
                        tool.free ? strings.free : null,
                        // A named licence that is not open source (SSPL) still publishes the code.
                        tool.licence.name !== null
                            ? fmt(tool.licence.openSource ? strings.openSource : strings.sourceAvailable, { licence: tool.licence.name })
                            : tool.licence.openSource
                              ? null
                              : strings.closedSource,
                        platforms.length > 0 ? fmt(strings.platforms, { platforms: joinList(platforms, m.common.list) }) : null,
                    ].filter((fact): fact is string => fact !== null);

                    return (
                        <div key={tool.id} id={item.anchor} className="scroll-mt-24 space-y-2">
                            <h3 className="type-h3 text-foreground">{tool.name}</h3>
                            {facts.length > 0 && (
                                <p className="type-small text-muted-foreground">
                                    <DotList items={facts} />
                                </p>
                            )}
                            <p className="type-body text-foreground">
                                {tool.state === 'discontinued' && tool.version !== null && tool.released !== null && (
                                    <>{fmt(strings.discontinued, { name: tool.name, version: tool.version, date: tool.released })} </>
                                )}
                                <RichText text={item.text} />
                                {(item.notes ?? [])
                                    .filter((id) => typeof content.notes[id] === 'string')
                                    .map((id) => (
                                        <span key={id}>
                                            {' '}
                                            <RichText text={content.notes[id]} />
                                        </span>
                                    ))}
                            </p>
                            {tool.comparePath !== null && (
                                <p>
                                    <LocaleLink href={tool.comparePath} className={textLinkClasses('standalone')}>
                                        {tool.compareTitle ?? fmt(strings.compare, { name: tool.name })}
                                        <span aria-hidden="true">→</span>
                                    </LocaleLink>
                                </p>
                            )}
                            {tool.sources.length > 0 && (
                                <p className="type-small text-muted-foreground">
                                    {strings.sources}:{' '}
                                    {tool.sources.map((source, index) => (
                                        <span key={source.url}>
                                            {index > 0 && ', '}
                                            <TextLink href={source.url} external>
                                                {source.title}
                                            </TextLink>
                                        </span>
                                    ))}
                                </p>
                            )}
                        </div>
                    );
                })}
                {comparisons.length > 0 && (
                    <div id="more-comparisons" className="space-y-2">
                        <h3 className="type-h3 text-foreground">{strings.more}</h3>
                        <ul className="type-body flex flex-wrap gap-x-6 gap-y-2">
                            {comparisons.map((comparison) => (
                                <li key={comparison.path}>
                                    <LocaleLink href={comparison.path} className={textLinkClasses('inline')}>
                                        {comparison.title}
                                    </LocaleLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {checked !== null && <p className="type-small text-muted-foreground">{fmt(strings.checked, { date: checked })}</p>}
            </div>
        </Section>
    );
}
