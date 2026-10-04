/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/notice-page.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import Container from '@/components/ui/container';
import { cn } from '@/lib/utils';

export type NoticeTone = 'neutral' | 'success' | 'warning' | 'danger';

const TONES: Record<NoticeTone, { icon: string; Icon: typeof Info }> = {
    neutral: { icon: 'text-muted-foreground', Icon: Info },
    success: { icon: 'text-success', Icon: CircleCheck },
    warning: { icon: 'text-warning', Icon: TriangleAlert },
    danger: { icon: 'text-danger', Icon: CircleAlert },
};

interface NoticePageProps {
    /** A short status above the heading: an icon in the status colour and a muted word ("404", "Confirmed"). */
    status?: { tone: NoticeTone; label: ReactNode };
    title: ReactNode;
    /** One paragraph under the heading. */
    body?: ReactNode;
    /** A primary button and a standalone link, at most. */
    actions?: ReactNode;
    className?: string;
    /** Anything between the paragraph and the actions: a Card of steps, a form. */
    children?: ReactNode;
}

/**
 * The body of a page that says one thing: not found, removed, confirmed,
 * unsubscribed, thank you (design-system §5.3.20).
 *
 * The narrow column, left-aligned, with the page's normal top spacing. The
 * layout around it keeps its header and footer, so a reader who lands here
 * from a dead link still has the whole site in reach.
 */
export default function NoticePage({ status, title, body, actions, className, children }: NoticePageProps) {
    const tone = status ? TONES[status.tone] : null;

    return (
        <Container width="narrow" className={cn('pt-10 pb-16 md:pt-14 md:pb-20 xl:pt-18 xl:pb-24', className)}>
            {status && tone && (
                <p className="type-caption flex items-center gap-2 text-muted-foreground tabular-nums">
                    <tone.Icon className={cn('size-4 shrink-0', tone.icon)} aria-hidden="true" />
                    {status.label}
                </p>
            )}
            <h1 className={cn('type-h1 text-foreground', status && 'mt-2')}>{title}</h1>
            {body && <div className="type-body mt-4 text-foreground">{body}</div>}
            {children && <div className="mt-8">{children}</div>}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">{actions}</div>}
        </Container>
    );
}
