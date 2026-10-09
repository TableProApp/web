/**
 * The props `App\Http\Controllers\HomeController` sends, and the type
 * of the page copy. The copy's shape is the English file's:
 * `ContentParityTest` holds every other locale to the same keys.
 */
import type { CheckoutProp } from '@/components/pricing/types';
import type { EngineCategory } from '@/lib/data/engines';

export type HomeContent = typeof import('@data/content/en/home.json');

/** One published engine, as the databases section needs it. */
export interface HomeEngine {
    id: string;
    name: string;
    /** The vendor mark under public/, or null for a monogram. */
    icon: string | null;
    monogram: string;
    /** Where the site describes it, locale-neutral: `/mysql-client`, `/mysql-client#mariadb`, `/databases#spanner`. */
    path: string;
    /** One of the engines the hero names, in data order. */
    featured: boolean;
    /** Users & Roles is documented and verified on it. */
    usersRoles: boolean;
}

// A /databases category that holds a published engine, under the hub's title.
export interface HomeCategory {
    id: EngineCategory;
    title: string;
}

export interface HomeIosEngines {
    /** Offered when adding a connection on iPhone or iPad, in the picker's order. */
    picker: string[];
    /** Opened there only when the connection arrives from a Mac. */
    syncedOnly: string[];
}

// A quote as App\Support\Content\Testimonials picks it for the page's locale.
export interface HomeTestimonial {
    id: string;
    name: string;
    handle: string | null;
    platform: string;
    url: string;
    avatar: string;
    lang: string;
    text: string;
    translation: string | null;
    translatedFrom: keyof HomeContent['testimonials']['translatedFrom'] | null;
}

export interface HomePageProps {
    content: HomeContent;
    engines: HomeEngine[];
    categories: HomeCategory[];
    iosEngines: HomeIosEngines;
    testimonials: HomeTestimonial[];
    /** How the plan cards hand a purchase to the platform. */
    checkout: CheckoutProp;
}
