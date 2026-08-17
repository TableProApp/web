export interface FaqItem {
    question: string;
    answer: string;
}

/**
 * The FAQ, in one place, served at /faq.
 *
 * The homepage used to render four of these in a section of its own and four
 * more inline, from a separate `home-faqs.ts` that this file spread into. Every
 * one of those eight was already answered in prose elsewhere on the homepage —
 * passwords by the Safe Mode credentials cell, the engine count by the database
 * grid's own reconciliation line, the release cadence by the live spec table,
 * Windows and Linux by the platform note — so the homepage was answering each
 * question twice and this page was answering it a third time.
 *
 * The homepage now states each of those facts once, where it arises, and links
 * here for the rest. Nothing was deleted: all fourteen questions live here, and
 * this file is the only FAQPage entity on the site.
 *
 * The first eight are ordered by how often they block a download.
 */
export const faqs: FaqItem[] = [
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
    {
        question: 'Where are my passwords stored?',
        answer: 'In the macOS Keychain. Connection details live in a plain JSON file with no secrets in it. A connection can also skip storage entirely and resolve its password at connect time from a file, an environment variable, a shell command, 1Password, HashiCorp Vault or AWS Secrets Manager.',
    },
    {
        question: 'Why do Cassandra and ScyllaDB appear separately when you say 25?',
        answer: 'The grid shows 26 tiles because Cassandra and ScyllaDB are two entries in the connection chooser. They share one driver, which is why the driver count is 25.',
    },
    {
        question: 'Is this abandoned like Sequel Pro?',
        answer: 'No. Development happens in the open on GitHub with a public changelog, a Discord, and roughly ten releases a month. The full release history is in the repository.',
    },
    {
        question: 'Windows or Linux?',
        answer: 'macOS 14 or later and iOS 18 or later today. A native Linux app is being built in Rust with GTK4, with PostgreSQL, MySQL, SQLite and SQL Server working already, but it is not ready for a beta and there is nothing to install yet. There is no Windows version.',
    },
    {
        question: 'Do I need to pay for the AI features?',
        answer: 'No, and there is no AI subscription to buy from us. You bring a provider. Thirteen are supported. Some take an API key, some sign in with an account you already have such as GitHub Copilot, ChatGPT or xAI, and three run entirely on your machine: Ollama, llama.cpp and MLX. Keys are stored in the Keychain.',
    },
    {
        question: 'Does it phone home?',
        answer: 'There is no account and no login. Anonymous usage data is a single toggle in Settings and contains no personal data and no queries. iCloud Sync is off by default, and syncing passwords is a separate opt in inside it. The source is public, so you can check.',
    },
    {
        question: 'How many Macs does one license cover?',
        answer: 'Starter activates two Macs. Team activates five as a minimum, then one per purchased seat. Activation is bound to a hashed hardware ID, the list shows every activated machine, and Deactivate frees the slot. Activations never sync, and a license restored from another Mac backup is cleared on launch.',
    },
    {
        question: 'Does it work offline?',
        answer: 'Yes. The signed license is verified offline on every launch. It re-checks with the server every seven days, and if the server is unreachable it keeps working for 30 days after the last successful check. Nothing in the app needs a network connection except reaching your databases.',
    },
    {
        question: 'What happens when my subscription ends?',
        answer: 'The app keeps working. iCloud Sync stops and the Starter and Team screens show an activation overlay again. Your local connections, queries, favorites and settings are untouched.',
    },
    {
        question: 'Is there an iPhone app?',
        answer: 'Yes, for iOS and iPadOS 18 or later. Seven engines on device, SSH tunnels, Face ID lock, Handoff with your Mac, and Shortcuts actions that insert rows without opening the app. It shares your iCloud connections, groups and tags. It is a companion to the Mac app, not a copy of it: no plugin registry, no AI chat, no MCP server and no ER diagrams.',
    },
];
