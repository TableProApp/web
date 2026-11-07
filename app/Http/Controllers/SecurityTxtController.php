<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Localization\Locales;
use App\Support\Localization\LocalizedUrl;
use Illuminate\Http\Response;

// `/.well-known/security.txt` (RFC 9116): the contacts in order of preference, then the policy on /security.
class SecurityTxtController extends Controller
{
    public const PATH = '/.well-known/security.txt';

    // Move it forward, less than a year ahead, after checking the contacts still reach someone.
    public const EXPIRES = '2027-10-01T00:00:00Z';

    public function __invoke(SiteFacts $facts): Response
    {
        $email = $facts->securityEmail();
        $github = $facts->links()['github'];

        abort_if($email === null, 404);

        $lines = [
            'Contact: mailto:' . $email,
            ...($github === null ? [] : ['Contact: ' . $github . '/security/advisories/new']),
            'Expires: ' . self::EXPIRES,
            'Preferred-Languages: en, vi',
            'Canonical: ' . LocalizedUrl::base() . self::PATH,
            'Policy: ' . LocalizedUrl::route('landing.security', [], Locales::default()),
        ];

        return response(implode("\n", $lines) . "\n", 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }
}
