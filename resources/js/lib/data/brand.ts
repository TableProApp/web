import data from '@data/brand.json';

export type BrandGround = 'light' | 'dark';

export interface BrandFile {
    src: string;
    width: number;
    height: number;
}

export interface BrandVariant {
    ground: BrandGround;
    preview: string;
    files: BrandFile[];
}

export interface BrandAsset {
    id: string;
    name: string;
    description: string;
    variants: BrandVariant[];
}

export interface BrandColor {
    id: string;
    name: string;
    hex: string;
}

export interface BrandData {
    labels: Record<BrandGround, string> & { colors: string };
    assets: BrandAsset[];
    colors: BrandColor[];
}

// The /brand page is English only, so its labels live here rather than in the locale catalogs. BrandDataTest validates the file.
export const BRAND = data as BrandData;
