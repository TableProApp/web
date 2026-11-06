// What the download page may infer about the reader's device (architecture §1.13). It never acts on it: every download
// is a server-rendered link and nothing starts on its own. The result only decides which card is marked and leads.
// Pure, with no imports, so `node --test` loads it directly (tests/js/device.test.ts).

export type DeviceKind = 'mac' | 'ios' | 'linux' | 'other';

export function classifyDevice(userAgent: string, maxTouchPoints: number): DeviceKind {
    if (/iPhone|iPad|iPod/.test(userAgent)) {
        return 'ios';
    }

    // iPadOS Safari sends a desktop "Macintosh" user agent; a touch screen gives it away.
    if (/Macintosh/.test(userAgent)) {
        return maxTouchPoints > 1 ? 'ios' : 'mac';
    }

    // Android and ChromeOS also say Linux or X11, and neither runs the desktop packages.
    if (/Android|CrOS/.test(userAgent)) {
        return 'other';
    }

    return /Linux|X11/.test(userAgent) ? 'linux' : 'other';
}

export function appStoreFirst(device: DeviceKind): boolean {
    return device === 'ios';
}
