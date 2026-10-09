/**
 * The derivations the database pages make from data, kept free of React so
 * they read as rules: which devices an engine opens on, what "Connect with"
 * lists, where a link points, and which `{token}` values the copy can use.
 */
import { interpolate } from '@/i18n/core';
import { joinList, type ListStyle } from '@/i18n/format';
import type { DatabaseLabels, EngineDetail, EngineSummary, PlatformSummary } from './types';

export type IosStatus = 'picker' | 'synced' | 'none';

/**
 * Opens on iPhone and iPad (in the app's picker), opens only when a Mac
 * syncs or exports the connection (Redshift), or does not open there.
 */
export function iosStatus(engine: Pick<EngineSummary, 'ios'>): IosStatus {
    if (engine.ios.inPicker) {
        return 'picker';
    }

    return engine.ios.openable ? 'synced' : 'none';
}

/**
 * Device names for availability and search titles (and translated H1s): the Mac's, plus the iPhone and
 * iPad app's when that app offers the engine. An engine iOS opens only from a
 * synced connection is not one you can use there from scratch, so its page
 * names the Mac alone (sitemap §A.3: "Amazon Redshift client for Mac").
 */
export function deviceNamesFor(
    engine: Pick<EngineSummary, 'ios'>,
    platforms: { mac: PlatformSummary | null; ios: PlatformSummary | null },
): string[] {
    return [...(platforms.mac?.deviceNames ?? []), ...(iosStatus(engine) === 'picker' ? (platforms.ios?.deviceNames ?? []) : [])];
}

/** The "Connect with" row: how a connection reaches the engine, from its capability flags. */
export function connectWith(engine: Pick<EngineDetail, 'connectionMode' | 'capabilities'>, labels: DatabaseLabels['connect']): string[] {
    const items = [labels[engine.connectionMode]];

    if (engine.capabilities.ssh) {
        items.push(labels.ssh);
    }

    if (engine.capabilities.ssl) {
        items.push(labels.ssl);
    }

    /* Every AWS IAM sign-in counts here, not only RDS IAM: MongoDB, Redis (ElastiCache) and Cassandra (Keyspaces) sign in with AWS too. */
    if (engine.capabilities.awsSignIn) {
        items.push(labels.awsIam);
    }

    if (engine.capabilities.cloudSqlProxy) {
        items.push(labels.cloudSqlProxy);
    }

    return items;
}

/**
 * The port the facts show, or null. An engine reached through a service's API
 * has no port field in the connection form, so a port in the data (Snowflake's
 * 443) is the app's internal default, not something the reader sets.
 */
export function shownPort(engine: Pick<EngineDetail, 'connectionMode' | 'defaultPort'>): number | null {
    return engine.connectionMode === 'api' ? null : engine.defaultPort;
}

// A floor with no version is the docs saying there is no minimum.
export function versionFloorText(floor: NonNullable<EngineDetail['versionFloor']>, labels: Pick<DatabaseLabels['facts'], 'enforced' | 'noMinimum'>): string {
    if (floor.text === null) {
        return labels.noMinimum;
    }

    return floor.enforced ? interpolate(labels.enforced, { version: floor.text }) : floor.text;
}

export type ResolvedHref =
    | { kind: 'internal'; href: string }
    | { kind: 'fragment'; href: string }
    | { kind: 'docs'; href: string };

/**
 * A content link value: `/path#id` stays on the site (and is localized),
 * `#id` is a same-page anchor, and `docs:/path` goes to the English docs.
 * Returns null for a docs path when the docs URL is unknown, or for anything
 * else, so a malformed value renders as plain text rather than a broken link.
 */
export function resolveHref(value: string, docsBase: string | null): ResolvedHref | null {
    if (value.startsWith('docs:/')) {
        return docsBase === null ? null : { kind: 'docs', href: docsBase + value.slice('docs:'.length) };
    }

    if (value.startsWith('#')) {
        return { kind: 'fragment', href: value };
    }

    if (value.startsWith('/') && !value.startsWith('//')) {
        return { kind: 'internal', href: value };
    }

    return null;
}

/** The engine's page on docs.tablepro.app, or null. */
export function docsUrl(docsBase: string | null, docsSlug: string | null): string | null {
    return docsBase === null || docsSlug === null ? null : `${docsBase}/databases/${docsSlug}`;
}

/** `compare-sync` → `compareSyncTier`: the token a paid feature's plan name fills. */
export function tierToken(featureId: string): string {
    return featureId.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase()) + 'Tier';
}


/**
 * The `{token}` values an engine's copy can use, from data: its name, its
 * backup tool, the file formats it imports and exports, and the engine
 * library the driver embeds. A family section gets its own engine's values.
 */
export function engineValues(engine: EngineDetail, list: ListStyle): Record<string, string> {
    return {
        name: engine.name,
        dumpTool: engine.capabilities.nativeDump ?? '',
        importFormats: joinList(engine.formats.import, list),
        exportFormats: joinList(engine.formats.export, list),
        engineVersion: engine.bundledVersion ?? '',
    };
}
