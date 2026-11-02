import { useCampaign } from '@/hooks/use-campaign';
import { useCountdown } from '@/hooks/use-countdown';
import { useI18n } from '@/i18n';
import { PRICING } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

interface CountdownProps {
    /** Count to the sale's start (its page, before it) or its end. */
    to: 'start' | 'end';
    /** `inline`: one line of text, for the banner. `blocks`: days, hours, minutes and seconds in cells, for the band and the sale's page. */
    variant: 'inline' | 'blocks';
    className?: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * The time left until the sale starts or ends, ticking each second.
 *
 * The instant is the real one in pricing.json, the same for every reader, so
 * the count never resets and never runs past it. The server and the first
 * render write the date instead (`Until December 1, 8:00 AM UTC`), so the
 * cached HTML, a reader without JavaScript and hydration all carry it; the
 * digits replace it once the page is running.
 *
 * A screen reader hears the date, once: the element is a `timer`, which is
 * not announced as it changes, named by that sentence, and the ticking digits
 * are hidden from it. Nothing moves but the digits, which are tabular so the
 * line keeps its width; there is no animation to reduce.
 */
export default function Countdown({ to, variant, className }: CountdownProps) {
    const { m, fmt, plural } = useI18n();
    const { prop } = useCampaign();
    const campaign = PRICING.campaign;
    const left = useCountdown(campaign === null ? 0 : Date.parse(to === 'start' ? campaign.startsAt : campaign.endsAt));

    if (campaign === null || prop === null) {
        return null;
    }

    const copy = m.campaign.countdown;
    const written = to === 'start' ? fmt(copy.from, { date: prop.startsOn, time: prop.startsAtTime }) : fmt(copy.until, { date: prop.endsOn, time: prop.endsAtTime });
    const lead = to === 'start' ? copy.startsIn : copy.endsIn;

    if (variant === 'inline') {
        return (
            <span role="timer" aria-label={written} className={cn('tabular-nums', className)}>
                <span aria-hidden="true">
                    {left === null
                        ? written
                        : `${lead} ${left.days > 0 ? `${left.days} ${plural(copy.units.days, left.days)} ` : ''}${pad(left.hours)}:${pad(left.minutes)}:${pad(left.seconds)}`}
                </span>
            </span>
        );
    }

    const cells: [number, string][] =
        left === null
            ? []
            : [
                  [left.days, plural(copy.units.days, left.days)],
                  [left.hours, copy.units.hours],
                  [left.minutes, copy.units.minutes],
                  [left.seconds, copy.units.seconds],
              ];

    return (
        <div role="timer" aria-label={written} className={cn('grid gap-3', className)}>
            <p aria-hidden="true" className="text-muted-foreground type-small font-medium">
                {left === null ? written : lead}
            </p>
            {left !== null && (
                <ol aria-hidden="true" className="flex gap-2">
                    {cells.map(([value, unit]) => (
                        <li key={unit} className="border border-rule bg-surface grid min-w-[4.25rem] justify-items-center rounded-control px-2 py-2.5">
                            <span className="type-h2 leading-none tabular-nums">{pad(value)}</span>
                            <span className="text-muted-foreground type-caption mt-1.5">{unit}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
