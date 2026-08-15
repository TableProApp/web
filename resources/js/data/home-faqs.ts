import type { FaqItem } from '@/data/faqs';

/**
 * The homepage FAQ is objection handling, not a knowledge base. The longer set
 * lives in `faqs.ts` and is served at /faq.
 *
 * Four questions, not eight. The four in `relocatedFaqs` below are still asked
 * on the homepage — they are just asked where they arise instead of in a block
 * at position fifteen, which is past the point the reader with that objection
 * has already left.
 */
export const homeFaqs: FaqItem[] = [
    {
        question: 'Where are my passwords stored?',
        answer: 'In the macOS Keychain. Connection details live in a plain JSON file with no secrets in it. A connection can also skip storage entirely and resolve its password at connect time from a file, an environment variable, a shell command, 1Password, HashiCorp Vault or AWS Secrets Manager.',
    },
    {
        question: 'Why do Cassandra and ScyllaDB appear separately when you say 25?',
        answer: 'The grid shows 26 tiles because Cassandra and ScyllaDB are two entries in the connection chooser. They share one driver, and so do libSQL and Turso, which is why the driver count is 25.',
    },
    {
        question: 'Is this abandoned like Sequel Pro?',
        answer: 'No. Development happens in the open on GitHub with a public changelog, a Discord, and roughly ten releases a month. The full release history is in the repository.',
    },
    {
        question: 'Windows or Linux?',
        answer: 'macOS 14 or later and iOS 18 or later today. A native Linux app is being built in Rust with GTK4, with PostgreSQL, MySQL, SQLite and SQL Server working already, but it is not ready for a beta and there is nothing to install yet. There is no Windows version.',
    },
];

/**
 * Rendered inline on the homepage rather than in the FAQ section, and still
 * listed in full on /faq.
 *
 * - The free/AGPL pair is the strip directly under the hero. Both are hard
 *   blockers, and the AGPL one blocks the highest-value visitor of all: the
 *   person who would buy a Team licence.
 * - The AI question is answered inside the Agents section, which is the section
 *   that raises the fear in the first place.
 * - Connection import is answered by the whole SwitchFrom section, which now
 *   sits at position seven rather than eleven.
 */
export const relocatedFaqs: FaqItem[] = [
    {
        question: 'Is it really free, or free for now?',
        answer: 'Free, permanently. TablePro is AGPLv3 and the whole app works without a license, with no trial countdown and no per-Mac limit. All 25 databases, the SQL editor, the data grid, the AI assistant, the MCP server, Safe Mode with Touch ID, SSH tunnels, ER diagrams and XLSX export cost nothing. A license adds four things: iCloud Sync, a second Mac activation, encrypted connection export, and environment variables in connection fields. Team adds a shared catalog and a shared query library.',
    },
    {
        question: 'Can I use TablePro at work under AGPLv3?',
        answer: 'Yes. AGPL obligations attach to distributing a modified version of the software, not to using it. There is no company-size or revenue restriction. If you use it at work, buying a license is how the next release gets built.',
    },
    {
        question: 'Can the AI drop a table on production?',
        answer: 'Not without you clicking. Chat has three modes with real tool gates, and fresh installs start in Ask, which is read only. Write tools ask for approval per call. Destructive operations always need a per-call confirmation plus typing the phrase "I understand this is irreversible", and can never be pre-approved. A connection set to Read-Only Safe Mode denies writes regardless of the mode.',
    },
    {
        question: 'Can I move my connections from another client?',
        answer: 'Yes. TablePro imports from TablePlus, Sequel Ace, DBeaver, DataGrip, Beekeeper Studio and Navicat, including passwords, SSH tunnels and SSL settings. The source app does not need to be running, and groups and folders carry over.',
    },
];

/** Lookup by question, for the components that render one of these inline. */
export function relocatedFaq(question: string): FaqItem {
    const found = relocatedFaqs.find((faq) => faq.question === question);

    if (!found) {
        throw new Error(`Unknown relocated FAQ: ${question}`);
    }

    return found;
}
