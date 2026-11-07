// The derivations the database pages make from data, as pure functions. Relative imports only, so `node --test`
// loads it directly (tests/js/database-model.test.ts).
import { interpolate } from '../../i18n/core.ts';
import { joinList, type ListStyle } from '../../i18n/format.ts';
import type { EngineDetail, EngineSummary, PlatformSummary } from './types.ts';

export type IosStatus = 'picker' | 'synced' | 'none';

// Opens in the iPhone and iPad app's picker, opens only when a Mac syncs or exports the connection (Redshift), or
// does not open there.
export function iosStatus(engine: Pick<EngineSummary, 'ios'>): IosStatus {
    if (engine.ios.inPicker) {
        return 'picker';
    }

    return engine.ios.openable ? 'synced' : 'none';
}

// Device names for the search title: the Mac's, plus the iPhone and iPad app's when that app offers the engine.
export function deviceNamesFor(engine: Pick<EngineSummary, 'ios'>, platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null }): string[] {
    return [...(platforms.mac?.deviceNames ?? []), ...(iosStatus(engine) === 'picker' ? (platforms.ios?.deviceNames ?? []) : [])];
}

// The "Connect with" row: how a connection reaches the engine, from its capability flags.
export function connectWith(
    engine: Pick<EngineDetail, 'connectionMode' | 'capabilities'>,
    labels: { file: string; network: string; api: string; ssh: string; ssl: string; awsIam: string; cloudSqlProxy: string },
): string[] {
    const { ssh, ssl, awsSignIn, cloudSqlProxy } = engine.capabilities;

    return [labels[engine.connectionMode], ssh && labels.ssh, ssl && labels.ssl, awsSignIn && labels.awsIam, cloudSqlProxy && labels.cloudSqlProxy].filter(
        (item): item is string => typeof item === 'string',
    );
}

// An engine reached through a service's API has no port field, so a port in the data (Snowflake's 443) is the app's
// internal default, not something the reader sets.
export function shownPort(engine: Pick<EngineDetail, 'connectionMode' | 'defaultPort'>): number | null {
    return engine.connectionMode === 'api' ? null : engine.defaultPort;
}

// A floor with no version is the docs saying there is no minimum.
export function versionFloorText(floor: NonNullable<EngineDetail['versionFloor']>, labels: { enforced: string; noMinimum: string }): string {
    if (floor.text === null) {
        return labels.noMinimum;
    }

    return floor.enforced ? interpolate(labels.enforced, { version: floor.text }) : floor.text;
}

export type ResolvedHref = { kind: 'internal'; href: string } | { kind: 'fragment'; href: string } | { kind: 'docs'; href: string };

// `/path#id` stays on the site, `#id` is a same-page anchor, `docs:/path` goes to the English docs. Anything else is
// null, so a malformed value renders as plain text rather than a broken link.
export function resolveHref(value: string, docsBase: string | null): ResolvedHref | null {
    if (value.startsWith('docs:/')) {
        return docsBase === null ? null : { kind: 'docs', href: docsBase.replace(/\/+$/, '') + value.slice('docs:'.length) };
    }

    if (value.startsWith('#')) {
        return { kind: 'fragment', href: value };
    }

    if (value.startsWith('/') && !value.startsWith('//')) {
        return { kind: 'internal', href: value };
    }

    return null;
}

// `compare-sync` → `compareSyncTier`: the token a paid feature's plan name fills.
export function tierToken(featureId: string): string {
    return featureId.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase()) + 'Tier';
}

// The paid features a page's copy names through their plan token, in `order`.
export function namedPaidIds(strings: readonly string[], order: readonly string[]): string[] {
    const text = strings.join('\n');

    return order.filter((id) => text.includes(`{${tierToken(id)}}`));
}

// Every string of an engine page's copy that renders.
export function pageStrings(content: {
    bands: { text: string[]; notes?: string[] }[];
    family: { text: string[] }[];
    moveData: string[];
    iphone: string[];
    faq: { question: string; answer: string }[];
    otherTools: { text: string } | null;
}): string[] {
    return [
        ...content.bands.flatMap((band) => [...band.text, ...(band.notes ?? [])]),
        ...content.family.flatMap((member) => member.text),
        ...content.moveData,
        ...content.iphone,
        ...content.faq.flatMap((entry) => [entry.question, entry.answer]),
        ...(content.otherTools !== null ? [content.otherTools.text] : []),
    ];
}

// The `{token}` values an engine's copy can use; a family band gets its own engine's.
export function engineValues(engine: EngineDetail, list: ListStyle): Record<string, string> {
    return {
        name: engine.name,
        dumpTool: engine.capabilities.nativeDump ?? '',
        importFormats: joinList(engine.formats.import, list),
        exportFormats: joinList(engine.formats.export, list),
        engineVersion: engine.bundledVersion ?? '',
    };
}

export interface HubRow {
    engine: EngineSummary;
    // An old category id that lands on this row, now that its category shares a band.
    anchor: string | null;
}

// A band's rows in its categories' order, then data order. The first row of each category other than the band's own
// carries that category's id, so `/databases#wide-column` still lands on Cassandra.
export function groupRows(group: { id: string; categories: readonly string[] }, engines: readonly EngineSummary[]): HubRow[] {
    return group.categories.flatMap((category) =>
        engines
            .filter((engine) => engine.category === category)
            .map((engine, index) => ({ engine, anchor: index === 0 && category !== group.id ? category : null })),
    );
}
