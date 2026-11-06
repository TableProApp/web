import { useState } from 'react';
import { cn } from '@/lib/utils';

function Glyph({ value }: { value: string }) {
    const [shown, setShown] = useState(value);
    const [previous, setPrevious] = useState<string | null>(null);

    if (value !== shown) {
        setPrevious(shown);
        setShown(value);
    }

    return (
        <span className="roll">
            {previous !== null && (
                <span key={`${previous}>${shown}`} className="roll-out">
                    {previous}
                </span>
            )}
            <span key={shown} className={previous === null ? undefined : 'roll-in'}>
                {shown}
            </span>
        </span>
    );
}

interface RollingTextProps {
    value: string;
    className?: string;
}

// Each character that changes rolls to its new value; the rest stay still. Hidden from screen readers: the caller
// states the value once in words, because the leaving characters are still in the DOM while they roll out.
export default function RollingText({ value, className }: RollingTextProps) {
    // Keyed from the end, so "$39" to "$4.99" keeps the last digits' slots and adds new ones on the left.
    const chars = value.split('');

    return (
        <span aria-hidden="true" className={cn('inline-flex whitespace-pre tabular-nums', className)}>
            {chars.map((char, index) => (
                <Glyph key={chars.length - index} value={char} />
            ))}
        </span>
    );
}
