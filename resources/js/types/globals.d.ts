/**
 * Ambient declarations for APIs the DOM lib does not cover.
 */

/**
 * The SSR bundle runs under Node, where process.env is how the port is
 * configured. Declared minimally rather than pulling @types/node in, which
 * would offer Node globals to browser code that must never use them.
 */
declare const process: {
    env: Record<string, string | undefined>;
};
