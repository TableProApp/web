import data from '@data/sponsors.json';

export type Placement = 'lead' | 'homepage' | 'name';

export interface SponsorLogo {
    // A file under public/, used in both themes unless `dark` is set.
    light: string;
    dark: string | null;
    width: number;
    height: number;
}

interface SponsorBase {
    id: string;
    name: string;
    githubLogin: string;
    url: string;
}

export type Sponsor = SponsorBase & ({ placement: 'name'; logo: null } | { placement: Exclude<Placement, 'name'>; logo: SponsorLogo });

export type LogoSponsor = Extract<Sponsor, { logo: SponsorLogo }>;

export interface SponsorTier {
    placement: Placement;
    monthly: number;
}

export interface SponsorsData {
    verifiedAt: string;
    verification: { method: string; program: string };
    homepageSlots: number;
    leadSlots: number;
    oneTime: { multiplier: number; months: number };
    tiers: SponsorTier[];
    sponsors: Sponsor[];
}

// tests/Feature/Data/SponsorsDataTest.php validates the file this casts.
export const SPONSORS = data as SponsorsData;
