/**
 * What the download page may infer about the reader's device (architecture
 * §1.13). The page never acts on it: the Mac DMG is a server-rendered link,
 * and nothing starts a download on its own. The result only decides whether
 * the App Store card comes first, and whether the Mac card says to open the
 * page on a Mac.
 *
 * An iPhone or iPad is never a Mac. iPhone user agents contain "like Mac OS
 * X", and iPadOS Safari sends a desktop "Macintosh" user agent by default, so
 * a "Macintosh" with more than one touch point is an iPad.
 *
 * Pure, with no imports, so `node --test` loads it directly
 * (tests/js/device.test.ts).
 */

export type DeviceKind = 'mac' | 'ios' | 'other';

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

/** The App Store card leads on an iPhone or iPad, and only there. */
export function appStoreFirst(device: DeviceKind): boolean {
    return device === 'ios';
}
