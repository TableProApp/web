<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

/**
 * The pricing page, `/pricing` and `/vi/pricing`.
 *
 * Phase A stub. The page is new and has no content yet, so the registry knows
 * no locale for it and `EnsurePageRenders` answers 404 before this runs. The
 * pricing agent (W5) owns this controller from phase C. The homepage keeps
 * its `#pricing` section regardless, because shipped Mac builds open
 * `/?ref=…#pricing`.
 */
class PricingController extends Controller
{
    public function __invoke(): Response
    {
        abort(404);
    }
}
