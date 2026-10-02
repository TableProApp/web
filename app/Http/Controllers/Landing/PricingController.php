<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Support\Content\ContentRepository;
use App\Support\Pricing\Checkout;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The pricing page, `/pricing` and `/vi/pricing` (sitemap §A.1, §E.5).
 *
 * `EnsurePageRenders` has already asked the registry, so this runs only in a
 * locale whose `content/{locale}/pricing.json` exists. Prices, seats and
 * timings are not props: the page reads them from resources/data/pricing.json,
 * the same file the homepage's `#pricing` section and the structured data read,
 * so the two cannot disagree. The props are the copy, the paid features' lines,
 * the checkout provider and the engine names the Mac app's description needs.
 */
class PricingController extends Controller
{
    public function __invoke(ContentRepository $content, Checkout $checkout): Response
    {
        $locale = App::getLocale();

        return Inertia::render('Pricing', [
            'content' => $content->page('pricing', $locale),
            'paidFeatures' => $content->page('paid-features', $locale),
            'checkout' => $checkout->props(),
            'featuredEngines' => $this->featuredEngines(),
        ]);
    }

    /**
     * The names of the featured, published engines in data order, for the
     * `{featuredEngines}` slot of the Mac app's structured-data description, as
     * `/download` reads them. Read here, so the page's bundle does not carry
     * all of `engines.json` for six names.
     *
     * @return list<string>
     */
    private function featuredEngines(): array
    {
        $path = resource_path('data/engines.json');
        $engines = File::isFile($path) ? json_decode((string) File::get($path), true) : null;
        $names = [];

        foreach (is_array($engines) ? $engines : [] as $engine) {
            if (is_array($engine) && ($engine['featured'] ?? false) === true && ($engine['state'] ?? null) === 'published' && is_string($engine['name'] ?? null)) {
                $names[] = $engine['name'];
            }
        }

        return $names;
    }
}
