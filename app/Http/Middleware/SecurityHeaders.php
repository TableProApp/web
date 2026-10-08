<?php

namespace App\Http\Middleware;

use App\Support\Security\ContentSecurityPolicy;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * First in the global stack, so it sees every response this app sends: pages,
 * the redirects and 410s of `CanonicalizeRequest`, and error pages.
 *
 * `Permissions-Policy` leaves out `camera`, `microphone` and `display-capture`,
 * which a chat call uses, and `payment` and `publickey-credentials-get`, which
 * the checkout overlay's frame is delegated.
 */
class SecurityHeaders
{
    public const HEADERS = [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'accelerometer=(), bluetooth=(), geolocation=(), gyroscope=(), hid=(), magnetometer=(), midi=(), serial=(), usb=()',
    ];

    public const STRICT_TRANSPORT_SECURITY = 'max-age=31536000; includeSubDomains';

    public function __construct(
        private readonly ContentSecurityPolicy $policy,
    ) {}

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->add(self::HEADERS);

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', self::STRICT_TRANSPORT_SECURITY);
        }

        if ($this->takesPolicy($response)) {
            $response->headers->set('Content-Security-Policy', $this->policy->for((string) $response->getContent()));
        }

        return $response;
    }

    private function takesPolicy(Response $response): bool
    {
        // A response not yet prepared has no type, and Symfony will give it this one.
        $type = strtolower((string) ($response->headers->get('Content-Type') ?? 'text/html'));

        if (! str_starts_with($type, 'text/html')) {
            return false;
        }

        // The dev server's address can be an IPv6 literal, which no source can name.
        if (Vite::isRunningHot()) {
            return false;
        }

        // Laravel's debug page evaluates strings as code.
        return ! ($response->isServerError() && config('app.debug'));
    }
}
