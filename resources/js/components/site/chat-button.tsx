import { useEffect, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n';
import { loadChatWhenIdle, openChat } from '@/lib/crisp';

/** Whether live chat is configured here, so a caller can leave out the item that would hold the button. */
export function useChatAvailable(): boolean {
    return Boolean(usePage().props.crispWebsiteId);
}

/**
 * Puts Crisp's launcher on the page once it has loaded and the browser is idle
 * (`lib/crisp.ts`). Called by the layout, so every page carries it. Does
 * nothing where no Crisp website ID is configured.
 */
export function useLiveChat(): void {
    const websiteId = usePage().props.crispWebsiteId;
    const { locale } = useI18n();

    useEffect(() => loadChatWhenIdle(websiteId, locale), [websiteId, locale]);
}

interface ChatButtonProps {
    className?: string;
    children: ReactNode;
}

/**
 * Opens live chat. The launcher is already on the page once it has loaded;
 * this opens the conversation, and loads Crisp first if a reader clicks before
 * the launcher has arrived. Renders nothing where no Crisp website ID is
 * configured, so a button never appears that cannot do what it says.
 */
export default function ChatButton({ className, children }: ChatButtonProps) {
    const websiteId = usePage().props.crispWebsiteId;
    const { locale } = useI18n();

    if (!websiteId) {
        return null;
    }

    return (
        <button type="button" onClick={() => openChat(websiteId, locale)} className={className}>
            {children}
        </button>
    );
}
