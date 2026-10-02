<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use Inertia\Response;

/**
 * The privacy policy, terms and refund policy, in each locale.
 *
 * Phase A stub: each action renders the pre-rebuild page through
 * `LandingController`, which `EnsurePageRenders` allows only in English. The
 * legal agent (W7f) owns this controller from phase C, when the pages move to
 * `resources/data/legal/{locale}/*.md`.
 */
class LegalController extends Controller
{
    public function privacy(LandingController $legacy): Response
    {
        return $legacy->privacy();
    }

    public function terms(LandingController $legacy): Response
    {
        return $legacy->terms();
    }

    public function refundPolicy(LandingController $legacy): Response
    {
        return $legacy->refundPolicy();
    }
}
