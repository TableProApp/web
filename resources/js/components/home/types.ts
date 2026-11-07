/**
 * The props `App\Http\Controllers\HomeController` sends, and the type
 * of the page copy. The copy's shape is the English file's:
 * `TranslationsTest` holds every other locale to the same keys.
 */
export type HomeContent = typeof import('@data/content/en/home.json');

/** One published engine, as the databases section needs it. */
export interface HomeEngine {
    id: string;
    name: string;
    path: string;
    featured: boolean;
}

// A quote as App\Support\Content\Testimonials picks it for the page's locale.
export interface HomeTestimonial {
    id: string;
    featured: boolean;
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
    testimonials: HomeTestimonial[];
}
