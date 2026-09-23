import ThemedImage from '@/components/ui/themed-image';
import { APP_STORE_URL } from '@/data/links';
import { trackDownload } from '@/lib/analytics';

/**
 * Apple's "Download on the App Store" badge, in the reader's OS theme.
 *
 * Copied into `public/images` rather than hotlinked, unlike `ProductHuntBadge`:
 * Product Hunt draws a live upvote count into its SVG, so a local copy freezes.
 * Apple's badge is static artwork, and Apple's guidelines ask that it be used as
 * supplied, so a pinned local file is the correct form here and the hotlink is
 * the exception.
 *
 * Both files are byte-for-byte what Apple's Marketing Tools serve, at their
 * native 119.66407 x 40. Do not run them through SVGO, reformat them, or change
 * the viewBox — the badge is trademarked artwork and the guidelines forbid
 * altering it.
 *
 * The `-light` / `-dark` suffixes follow this repository's convention, which
 * means "the variant shown while the OS is in that mode" — NOT the colour of the
 * artwork. Apple's BLACK badge is `app-store-light.svg`, because a black badge
 * is what goes on a light background. Anyone checking by grepping the fills
 * inside the two files will read it backwards.
 *
 * Rendered through `<img>`, never inlined as JSX. Twenty-four of the white
 * badge's twenty-five paths carry no `fill` of their own and rely on the SVG
 * default, so an ancestor `fill-current` would silently recolour Apple's mark;
 * and both files carry `id="livetype"`, so inlining the pair would duplicate a
 * DOM id on any page showing both.
 *
 * `h-10` is Apple's minimum rendered height of 40px. `w-auto` keeps the aspect
 * ratio coming from the file rather than from the two attributes, which are
 * rounded and exist only to reserve layout space.
 */
export default function AppStoreBadge({ location, className }: { location: string; className?: string }) {
    return (
        <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackDownload(location, 'ios')}
            className={`inline-block ${className ?? ''}`}
        >
            <ThemedImage
                light={{ src: '/images/app-store-light.svg' }}
                dark={{ src: '/images/app-store-dark.svg' }}
                alt="Download TablePro on the App Store"
                width={120}
                height={40}
                className="block h-10 w-auto"
            />
        </a>
    );
}
