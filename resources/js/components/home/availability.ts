import { isReleased, PLATFORMS, type IosPlatform } from '@/lib/data/platforms';

// The iPhone and iPad app, when platforms.json lists it as released.
export function releasedIos(): IosPlatform | null {
    const ios = PLATFORMS.platforms.find((platform) => platform.id === 'ios');

    return ios !== undefined && isReleased(ios) ? (ios as IosPlatform) : null;
}
