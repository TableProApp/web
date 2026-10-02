/**
 * resources/data/sponsors.json, typed: the sponsors verified as current on
 * `verifiedAt`, in display order.
 *
 * The homepage renders them third, each linked with `rel="sponsored noopener"`.
 * A sponsor stays listed only while its sponsorship is active; the file
 * records how that was checked.
 */
import data from '@data/sponsors.json';

export interface SponsorLogo {
    /** A file under public/, used in both themes unless `dark` is set. */
    light: string;
    dark: string | null;
    /** Intrinsic size, so the row does not reflow while the image loads. */
    width: number;
    height: number;
}

export interface Sponsor {
    id: string;
    name: string;
    githubLogin: string;
    url: string;
    logo: SponsorLogo;
}

export interface SponsorsData {
    verifiedAt: string;
    verification: { method: string; program: string };
    sponsors: Sponsor[];
}

/**
 * The single cast from the JSON import. `tests/Feature/Data/SponsorsDataTest.php`
 * validates the file.
 */
export const SPONSORS = data as SponsorsData;

/** The logo for the active theme; the light file serves both when there is no dark one. */
export function sponsorLogoSrc(sponsor: Sponsor, theme: 'light' | 'dark'): string {
    return theme === 'dark' && sponsor.logo.dark !== null ? sponsor.logo.dark : sponsor.logo.light;
}
