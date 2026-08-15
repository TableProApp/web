export interface FaqItem {
    question: string;
    answer: string;
}

import { homeFaqs, relocatedFaqs } from '@/data/home-faqs';

/**
 * The /faq page. The first eight items are everything the homepage asks — the
 * four in its FAQ section plus the four it now asks inline, where they arise —
 * and the rest add the depth that does not belong on the homepage at all.
 *
 * Relocating a question on the homepage must never remove it from here. This
 * page is the knowledge base; the homepage is objection handling.
 */
export const faqs: FaqItem[] = [
    ...homeFaqs,
    ...relocatedFaqs,
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
