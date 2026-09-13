const PRODUCT_HUNT_URL =
    'https://www.producthunt.com/products/tablepro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-tablepro-2';

const BADGE_IMAGE_URL = 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1248464';

/**
 * The Product Hunt launch badge, in the reader's OS theme.
 *
 * Hotlinked rather than copied into `public/images`, because Product Hunt draws
 * the upvote count into the SVG. The two copies already sitting there froze at
 * six votes and are referenced by nothing.
 *
 * Selected on `prefers-color-scheme` for the reason `ThemedImage` gives: the
 * browser fetches one variant instead of both.
 */
export default function ProductHuntBadge() {
    return (
        <a href={PRODUCT_HUNT_URL} target="_blank" rel="noopener noreferrer" className="inline-block shrink-0 self-start sm:self-auto">
            <picture>
                <source media="(prefers-color-scheme: dark)" srcSet={`${BADGE_IMAGE_URL}&theme=dark`} />
                <img
                    src={`${BADGE_IMAGE_URL}&theme=light`}
                    alt="TablePro on Product Hunt"
                    width={250}
                    height={54}
                    decoding="async"
                    className="block"
                />
            </picture>
        </a>
    );
}
