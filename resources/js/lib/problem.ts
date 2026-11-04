// tablepro-cloud answers errors as RFC 9457 problems: a stable `code`, and for `validation_failed` the fields in `errors[].location`.
// Their `title` and `detail` are English, so the pages show their own catalog's words instead.

export interface Problem {
    code: string | null;
    locations: string[];
}

export function problemOf(data: unknown): Problem {
    const body = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
    const errors = Array.isArray(body.errors) ? body.errors : [];

    return {
        code: typeof body.code === 'string' ? body.code : null,
        locations: errors.flatMap((error: unknown) => {
            const location = typeof error === 'object' && error !== null ? (error as Record<string, unknown>).location : null;

            return typeof location === 'string' ? [location] : [];
        }),
    };
}
