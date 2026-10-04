/**
 * What the download page may infer about the reader's device, and what it may
 * not (architecture §1.13).
 *
 * The page never acts on any of this. Both Mac builds are server-rendered
 * links, and nothing starts a download on its own. The result only decides
 * emphasis: which build's button is primary, and whether the App Store card
 * comes first.
 *
 * - An iPhone or iPad is never a Mac. iPhone user agents contain "like Mac OS
 *   X", which is how the pre-rebuild page sent iPhones to the Apple silicon
 *   DMG. iPadOS Safari sends a desktop "Macintosh" user agent by default, so a
 *   "Macintosh" with more than one touch point is an iPad.
 * - Only Chromium's `architecture` client hint says which chip a Mac has.
 *   Safari and Firefox report "Intel Mac OS X" on every Mac, so without the
 *   hint the page never guesses, and offers "Which Mac do I have?" instead.
 *
 * Pure, with no imports, so `node --test` loads it directly
 * (tests/js/device.test.ts).
 */

export type DeviceKind = 'mac' | 'ios' | 'other';

export type MacArch = 'arm64' | 'x86_64';

/** The shape of Chromium's `navigator.userAgentData`, as far as this module uses it. */
export interface ArchitectureHintSource {
    getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }>;
}

export type ButtonVariant = 'primary' | 'secondary';

/**
 * `ios` for an iPhone, iPad or iPod (including iPadOS's desktop user agent),
 * `mac` for a Mac, `other` for anything else.
 */
export function classifyDevice(userAgent: string, maxTouchPoints: number): DeviceKind {
    if (/iPhone|iPad|iPod/.test(userAgent)) {
        return 'ios';
    }

    if (/Macintosh/.test(userAgent)) {
        return maxTouchPoints > 1 ? 'ios' : 'mac';
    }

    return 'other';
}

/** Chromium's `architecture` value as a build: `arm` → `arm64`, `x86` → `x86_64`, else nothing. */
export function archFromHint(architecture: string | null | undefined): MacArch | null {
    if (architecture === 'arm') {
        return 'arm64';
    }

    if (architecture === 'x86') {
        return 'x86_64';
    }

    return null;
}

/**
 * The Mac's architecture from Chromium's client hint, or null when the browser
 * has no hint (Safari, Firefox), refuses it, or reports something else.
 */
export async function archHint(source: ArchitectureHintSource | null | undefined): Promise<MacArch | null> {
    if (!source || typeof source.getHighEntropyValues !== 'function') {
        return null;
    }

    try {
        const hints = await source.getHighEntropyValues(['architecture']);

        return archFromHint(hints?.architecture);
    } catch {
        return null;
    }
}

/**
 * Which variant a Mac build's button takes.
 *
 * Primary only for the build a Mac's own hint names. With no hint, both stay
 * secondary, so neither looks like the answer: an Intel Mac in Safari is
 * exactly the reader the pre-rebuild page sent the wrong build. Both variants
 * have the same dimensions, so the change after hydration shifts nothing.
 */
export function buildVariant(build: MacArch, device: DeviceKind, hint: MacArch | null): ButtonVariant {
    return device === 'mac' && hint === build ? 'primary' : 'secondary';
}

/** The App Store card leads on an iPhone or iPad, and only there. */
export function appStoreFirst(device: DeviceKind): boolean {
    return device === 'ios';
}
