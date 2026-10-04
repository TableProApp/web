import { Fragment } from 'react';
import DescriptionList, { DescriptionItem } from '@/components/ui/description-list';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { ReleaseBadge } from './markers';
import { engineItems } from './model';
import type { EngineListRef, Facts } from './types';

interface EngineListsProps {
    lists: EngineListRef[];
    facts: Facts;
}

/**
 * Engine coverage computed from `engines.json` capabilities, never typed
 * (sitemap §E.4): one row per list, each engine linked to the page that
 * describes it, with its query language or dump tool when the list carries
 * one. A list that comes back empty is left out rather than shown blank.
 */
export default function EngineLists({ lists, facts }: EngineListsProps) {
    const { m } = useI18n();
    const rows = lists.map((list) => ({ ...list, items: engineItems(facts, list.list) })).filter((row) => row.items.length > 0);

    if (rows.length === 0) {
        return null;
    }

    return (
        <DescriptionList>
            {rows.map((row) => (
                <DescriptionItem key={row.list} term={row.label}>
                    {row.items.map((item, index) => (
                        <Fragment key={item.name}>
                            {index > 0 && m.common.list.separator}
                            {item.href !== null ? (
                                <LocaleLink href={item.href} className={textLinkClasses('inline')}>
                                    {item.name}
                                </LocaleLink>
                            ) : (
                                item.name
                            )}
                            {item.detail !== null && <span className="text-muted-foreground"> ({item.detail})</span>}
                            {item.since !== null && (
                                <>
                                    {' '}
                                    <ReleaseBadge since={item.since} />
                                </>
                            )}
                        </Fragment>
                    ))}
                </DescriptionItem>
            ))}
        </DescriptionList>
    );
}
