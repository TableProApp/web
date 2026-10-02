import { cn } from '@/lib/utils';

/**
 * Retiring. A plain hairline across its container.
 *
 * This used to bleed 100vw past the container on both sides and carry a rule
 * ordinal, which only worked while `<html>`, `<body>` and the layout clipped
 * horizontal overflow. The rebuild removed that clipping, because it hid
 * horizontal-scroll regressions instead of preventing them, and retired the
 * ordinals with the ledger design (design-system §4.6). Left bleeding, every
 * pre-rebuild page would scroll sideways by a full viewport.
 *
 * New code draws no decorative rules; a section boundary is spacing, and a
 * table draws its own row separators. Delete this file once nothing imports
 * it.
 */
export function FullLine({ className }: { className?: string }) {
    return <div className={cn('h-px w-full bg-rule', className)} aria-hidden="true" />;
}

/** Retiring: the same hairline. The accent tick went with the eyebrows it marked. */
export function AccentLine() {
    return <div className="h-px w-full bg-rule" aria-hidden="true" />;
}

export default FullLine;
