export type SeatBound = 'min' | 'max';

export interface TypedSeats {
    seats: number | null;
    bound: SeatBound | null;
}

// `seats` is set only for a count in range; `bound` names the limit an out-of-range count is changed to. A null max is no limit.
export function typedSeats(raw: string, min: number, max: number | null): TypedSeats {
    const typed = Number.parseInt(raw, 10);

    if (Number.isNaN(typed)) {
        return { seats: null, bound: null };
    }

    if (typed < min) {
        return { seats: null, bound: 'min' };
    }

    if (max !== null && typed > max) {
        return { seats: null, bound: 'max' };
    }

    return { seats: typed, bound: null };
}
