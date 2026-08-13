/**
 * Ambient declarations for APIs the DOM lib does not cover.
 */

/**
 * User-Agent Client Hints. Chromium-only and still not in TypeScript's DOM lib,
 * so it is declared here rather than cast away at each call site. Optional
 * because Safari and Firefox do not implement it — the download page falls back
 * to the user-agent string when it is absent.
 *
 * @see https://wicg.github.io/ua-client-hints/
 */
interface NavigatorUAData {
    getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; platform?: string }>;
}

interface Navigator {
    userAgentData?: NavigatorUAData;
}

/**
 * The SSR bundle runs under Node, where process.env is how the port is
 * configured. Declared minimally rather than pulling @types/node in, which
 * would offer Node globals to browser code that must never use them.
 */
declare const process: {
    env: Record<string, string | undefined>;
};
