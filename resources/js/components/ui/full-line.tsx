import { cn } from '@/lib/utils';

/**
 * A hairline rule that bleeds past the container on both sides.
 *
 * Relies on `overflow-x: hidden` being set on <html>, <body>, and the layout
 * root. Do not remove those without revisiting this.
 *
 * `relative` is load-bearing, not decoration: the `rule-numbered` class below
 * positions its ordinal against this element. Without it the nearest positioned
 * ancestor is `<main>`, and every ordinal on the page stacks in its top-left
 * corner.
 */
export function FullLine({ className }: { className?: string }) {
    return (
        <div
            className={cn('rule-numbered relative -ml-[100vw] h-px w-[200vw] bg-rule', className)}
            aria-hidden="true"
        />
    );
}

/**
 * A FullLine carrying a short accent segment, used once per section on the
 * label rule so the eyebrow reads as a tick on a ruler.
 *
 * Numbered like any other rule. It draws a visually identical hairline, so
 * skipping it made the ordinal the position of *some* rules rather than of
 * the rule — the first one in every section was silently missing.
 *
 * The segment starts at `100vw + 1rem`, not `100vw`: the rule bleeds from the
 * container's content edge, but every section label is indented by `pl-4`, so
 * anchoring to the content edge left the tick 16px adrift of the text it marks.
 */
export function AccentLine() {
    return (
        <div className="rule-numbered relative -ml-[100vw] h-px w-[200vw] bg-rule" aria-hidden="true">
            <div className="absolute h-px w-8 bg-primary" style={{ left: 'calc(100vw + 1rem)' }} />
        </div>
    );
}

export default FullLine;
