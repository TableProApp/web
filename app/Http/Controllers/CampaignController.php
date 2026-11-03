<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Content\ContentRepository;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The dated sale's own page, `/black-friday` in every language: what the sale
 * takes off which plans, and when (pricing.json's `campaign`).
 *
 * One URL kept from year to year, so links to it and its place in search
 * outlast a single sale. Before the sale it says when it starts, during it the
 * two offers can be bought straight from the page, and after it the page says
 * it has ended and points to Pricing. The phase is the shared `campaign`
 * prop; prices and the code are pricing.json's, which the page imports.
 */
class CampaignController extends Controller
{
    public function __invoke(ContentRepository $content, SiteFacts $site): Response
    {
        $locale = App::getLocale();

        return Inertia::render('BlackFriday', [
            'content' => $content->page('black-friday', $locale),
            'paidFeatures' => $content->page('paid-features', $locale),
            'organizationProfiles' => $site->organizationProfiles(),
        ]);
    }
}
