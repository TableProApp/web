import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n';
import { openChat } from '@/lib/crisp';

/** Whether live chat is configured here, so a caller can leave out the item that would hold the button. */
export function useChatAvailable(): boolean {
    return Boolean(usePage().props.crispWebsiteId);
}

interface ChatButtonProps {
    className?: string;
    children: ReactNode;
}

/**
 * Opens live chat, loading Crisp on this click and not before.
 *
 * Crisp sets its cookies the moment its loader runs, so nothing from it is in
 * the page until a reader asks for a chat; the privacy policy says what it sets
 * then. Renders nothing where no Crisp website ID is configured, so a button
 * never appears that cannot do what it says.
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
