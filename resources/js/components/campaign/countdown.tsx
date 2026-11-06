import RollingText from '@/components/ui/rolling-text';
import { useCampaign } from '@/hooks/use-campaign';
import { useCountdown } from '@/hooks/use-countdown';
import { useI18n } from '@/i18n';
import { PRICING } from '@/lib/data/pricing';
import { cn } from '@/lib/utils';

interface CountdownProps {
    to: 'start' | 'end';
    // `inline`: one line of text, for the banner. `digits`: large rolling digits with their units, for the band and the sale's page.
    variant: 'inline' | 'digits';
    className?: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

// The server and the first render write the date instead of the digits, so the cached HTML, a reader without JavaScript
// and hydration all carry it. A screen reader hears that date once: the timer is named by it and the digits are hidden.
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
        <div role="timer" aria-label={written} className={cn('grid gap-2', className)}>
            <p aria-hidden="true" className="type-small text-muted-foreground">
                {left === null ? written : lead}
            </p>
            {left !== null && (
                <ol aria-hidden="true" className="flex gap-5 md:gap-6">
                    {cells.map(([value, unit]) => (
                        <li key={unit} className="grid justify-items-start gap-1.5">
                            <RollingText value={pad(value)} className="text-[2rem] leading-none font-semibold tracking-[-0.03em] md:text-[2.5rem]" />
                            <span className="type-caption text-muted-foreground">{unit}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
