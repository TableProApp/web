import { Fragment } from 'react';
import LocaleLink from '@/components/ui/locale-link';
import { textLinkClasses } from '@/components/ui/text-link';
import { useI18n } from '@/i18n';
import { ReleaseBadge } from './markers';
import { engineItems } from './model';
import type { EngineListRef, Facts } from './types';

// Engine coverage computed from engines.json, never typed (sitemap §E.4): one quiet line per list, each engine linked
// to its page. The label carries its own colon, so French gets its no-break space. An empty list is left out.
export default function EngineLists({ lists, facts }: { lists: EngineListRef[]; facts: Facts }) {
    const { m } = useI18n();
    const rows = lists.map((list) => ({ ...list, items: engineItems(facts, list.list) })).filter((row) => row.items.length > 0);

    return rows.map((row) => (
        <p key={row.list}>
            <span className="text-foreground">{row.label}</span>{' '}
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
                    {item.detail !== null && ` (${item.detail})`}
                    {item.since !== null && (
                        <>
                            {' '}
                            <ReleaseBadge since={item.since} />
                        </>
                    )}
                </Fragment>
            ))}
        </p>
    ));
}
