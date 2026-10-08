<?php

namespace App\Http\Controllers;

use App\Services\Content\SiteFacts;
use App\Support\Localization\LocalizedUrl;
use Illuminate\Http\Response;

/**
 * `/.well-known/security.txt` (RFC 9116).
 */
class SecurityTxtController extends Controller
{
    /**
     * The date the contact below stops being vouched for. Move it forward,
     * less than a year ahead, after checking the address still reaches someone.
     */
    public const EXPIRES = '2027-10-01T00:00:00Z';

    public function __invoke(SiteFacts $facts): Response
    {
        $email = $facts->links()['email'];

        abort_if($email === null, 404);

        $lines = [
            'Contact: mailto:' . $email,
            'Expires: ' . self::EXPIRES,
            'Preferred-Languages: en, vi',
            'Canonical: ' . LocalizedUrl::base() . '/.well-known/security.txt',
        ];

        return response(implode("\n", $lines) . "\n", 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }
}
