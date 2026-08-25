/**
 * Every external URL this site points at more than once, in one place.
 *
 * The repository URL was written out six times — `hero.tsx`, `spec-strip.tsx`,
 * `footer.tsx`, `structured-data.ts`, and twice more as a derived path, the
 * issue template in `database-grid.tsx` and the LICENSE link in `Home.tsx`'s
 * JSON-LD. The sponsors URL was written twice. Nothing held any of them
 * together, so a moved repository was a six-file change with no signal about
 * the last two — which is exactly how many a first pass over this missed, until
 * `FundingModelTest` scanned for them.
 *
 * The same discipline `data/pricing.ts` and `data/license.ts` already apply to
 * a price and a feature list: a fact that must agree with something outside
 * this repository exists once, and `FundingModelTest` fails when a second copy
 * appears.
 */

/** The app's source, AGPLv3. */
export const GITHUB_REPO_URL = 'https://github.com/TableProApp/TablePro';

/**
 * GitHub Sponsors, personal rather than organisational, because that is who
 * builds TablePro.
 *
 * Secondary to a license everywhere it appears. Buying one is worth more to the
 * project and more to the buyer, so sponsorship is never the primary action in
 * a place where both are offered.
 */
export const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/datlechin';
