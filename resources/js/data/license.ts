/**
 * Every feature the app actually gates, in one place.
 *
 * The source of truth is `ProFeature.swift` in the app repository: nine cases,
 * seven of them `requiredTier == .starter` and two `.team`. This site used to
 * name four of them and said so out loud — "a license adds four things" — in
 * the pricing lede and again in the FAQ, while Compare & Sync, Query Insights,
 * Result Charts and Linked Folders were not mentioned anywhere on the domain.
 * Three of those four are the features a competitor charges most for.
 *
 * Adding a case to `ProFeature` means adding it here. `LicenseFeaturesTest`
 * fails when this list stops holding nine entries split seven/two, which is the
 * cheapest guard available from a repository that cannot read the Swift enum.
 */
export type PaidTier = 'starter' | 'team';

export interface PaidFeature {
    /** Matches `ProFeature.displayName` in the app, so the two cannot drift. */
    name: string;
    /**
     * One line, under fourteen words. This renders in a table cell beside three
     * availability columns; anything longer wraps to three lines on a phone and
     * turns a scannable matrix back into prose.
     */
    detail: string;
    tier: PaidTier;
}

/**
 * Ordered by how much a reader would pay for it, not by tier. Compare & Sync,
 * Query Insights and Result Charts lead because they are the three that are
 * product rather than plumbing — the rest are conveniences around connections.
 */
export const PAID_FEATURES: PaidFeature[] = [
    {
        name: 'Compare & Sync',
        detail: 'Diff two databases, structure or rows. Read the script before it runs.',
        tier: 'starter',
    },
    {
        name: 'Query Insights',
        detail: 'What you run most, what costs the most time, what got slower.',
        tier: 'starter',
    },
    {
        name: 'Result Charts',
        detail: 'Bar, line, area and scatter, drawn from the rows already loaded.',
        tier: 'starter',
    },
    {
        name: 'iCloud Sync',
        detail: 'Connections, saved queries, favorites and settings across your Macs.',
        tier: 'starter',
    },
    {
        name: 'Linked Folders',
        detail: 'A Git repo or a shared drive, read as connections that stay current.',
        tier: 'starter',
    },
    {
        name: 'Encrypted Export',
        detail: 'Credentials travel inside the export file, under AES-256-GCM.',
        tier: 'starter',
    },
    {
        name: 'Environment Variables',
        detail: 'Write $VAR in a connection field; it resolves at connect time.',
        tier: 'starter',
    },
    {
        name: 'Team Catalog',
        detail: 'Publish connections into the folder your team already shares.',
        tier: 'team',
    },
    {
        name: 'Team Library',
        detail: 'Connections and saved queries through your account, no folder needed.',
        tier: 'team',
    },
];
