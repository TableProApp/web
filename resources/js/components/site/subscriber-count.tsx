import { useNewsletterStats } from '@/hooks/use-newsletter-stats';
import { useI18n } from '@/i18n';
import { formatNumber } from '@/i18n/format';
import { cn } from '@/lib/utils';

// The line keeps its height while the count is unknown, so its arrival moves nothing.
export default function SubscriberCount({ className }: { className?: string }) {
    const { m, plural } = useI18n();
    const count = useNewsletterStats();

    return (
        <p className={cn('type-caption min-h-[1.5em] text-muted-foreground tabular-nums', className)}>
            {count !== null && plural(m.footer.newsletter.subscribers, count, { count: formatNumber(count, m.pricing.currency) })}
        </p>
    );
}
