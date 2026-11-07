import type { ReactNode } from 'react';
import { BandFrame } from '@/components/features/feature-band';
import type { Values } from '@/i18n';
import RichText from './rich-text';

export const BAND_TEXT = 'space-y-3 text-[1.0625rem] leading-[1.55] tracking-[-0.011em] text-pretty text-foreground';

export const BAND_NOTES = 'space-y-1.5 text-[0.9375rem] leading-[1.5] text-muted-foreground';

interface EngineBandProps {
    id: string;
    also?: string[];
    title: ReactNode;
    marker?: ReactNode;
    text: string[];
    notes?: string[];
    // `{token}` values for this band only: a family member's own.
    values?: Values;
    children?: ReactNode;
}

// A feature band without a window: one engine page shows one window, in its hero.
export default function EngineBand({ id, also, title, marker, text, notes = [], values, children }: EngineBandProps) {
    return (
        <BandFrame id={id} also={also} title={title} marker={marker}>
            <div className={BAND_TEXT}>
                {text.map((paragraph, index) => (
                    <p key={index}>
                        <RichText text={paragraph} values={values} />
                    </p>
                ))}
            </div>
            {notes.length > 0 && (
                <div className={`mt-5 ${BAND_NOTES}`}>
                    {notes.map((note, index) => (
                        <p key={index}>
                            <RichText text={note} values={values} />
                        </p>
                    ))}
                </div>
            )}
            {children}
        </BandFrame>
    );
}
