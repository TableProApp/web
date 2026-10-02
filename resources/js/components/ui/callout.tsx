/* Shared with TableProApp/web and TableProApp/license at resources/js/components/ui/callout.tsx. Change both in the same release. See docs/shared-files.md. */
import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutTone = 'note' | 'success' | 'warning' | 'danger';

/**
 * A boxed note (design-system §5.3.13): `--surface` with a hairline, and a 3px
 * leading edge plus a 16px icon in the status colour. The text stays in the
 * text colour; the edge and the icon carry the tone, the words carry the
 * meaning.
 *
 * Uses: the Vietnamese legal prevailing-language notice, "English-only
 * article", limits on feature and database pages, the lagging Homebrew notice,
 * sign-in link errors and errors after an action.
 */
const TONES: Record<CalloutTone, { edge: string; icon: string; Icon: typeof Info }> = {
    note: { edge: 'border-l-rule-strong', icon: 'text-muted-foreground', Icon: Info },
    success: { edge: 'border-l-success', icon: 'text-success', Icon: CircleCheck },
    warning: { edge: 'border-l-warning', icon: 'text-warning', Icon: TriangleAlert },
    danger: { edge: 'border-l-danger', icon: 'text-danger', Icon: CircleAlert },
};

interface CalloutProps {
    tone?: CalloutTone;
    title?: ReactNode;
    /**
     * `alert` for an error that appears after the reader did something, so it
     * is announced. A callout that is part of the page is a `note`.
     */
    role?: 'note' | 'alert' | 'status';
    id?: string;
    className?: string;
    children?: ReactNode;
}

export default function Callout({ tone = 'note', title, role = 'note', id, className, children }: CalloutProps) {
    const { edge, icon, Icon } = TONES[tone];

    return (
        <div
            id={id}
            role={role}
            className={cn('flex gap-3 rounded-control border border-l-[3px] border-rule bg-surface p-4 text-foreground', edge, className)}
        >
            <Icon className={cn('mt-[0.2em] size-4 shrink-0', icon)} aria-hidden="true" />
            <div className="type-small min-w-0 space-y-1">
                {title && <p className="font-semibold">{title}</p>}
                {children}
            </div>
        </div>
    );
}
