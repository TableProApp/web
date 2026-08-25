<!DOCTYPE html>
{{--
    `has-banner` decides, before a single pixel is painted, whether the top
    banner is seen and how much room the header and <main> leave for it. It is
    set here rather than in React because `--banner-h` has to be settled by the
    time the first frame renders: resolving it in state would drop the header
    44px on every load for every reader who had already dismissed the bar.

    The script below removes it again when this browser has dismissed the
    current banner version.
--}}
<html lang="en" class="overflow-x-hidden @if(config('banner.enabled')) has-banner @endif">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {{-- No robots tag here. SEOHead emits exactly one per page, so a tag in the
         layout meant every page shipped two directives — and on a `noindex`
         page they contradicted each other. --}}
    {{-- Matches --background in each theme, computed from the tokens: oklch(1 0 0)
         and oklch(0.145 0 0). It tints the browser's own chrome, so an accent
         colour here paints the address bar something that appears nowhere on
         the page. --}}
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <link rel="manifest" href="/site.webmanifest" />

    {{--
        Both faces reach the browser through `@import` inside app.css, so they
        cannot be discovered until that stylesheet has downloaded and parsed.
        These two are the ones used above the fold — Inter for the headline and
        body, IBM Plex Mono 600 for the section eyebrow — so preloading them
        removes a visible swap on first paint. The mono 400 face is deliberately
        left out: a third font preload competes with the hero image, which is
        the LCP element.

        Paths come from the Vite manifest because the woff2 files are
        content-hashed at build time. Skipped while the dev server is hot, where
        there is no manifest to resolve against.
    --}}
    @if (! Vite::isRunningHot())
        @foreach ([
            'node_modules/@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2',
            'node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2',
        ] as $font)
            <link rel="preload" as="font" type="font/woff2" crossorigin href="{{ Vite::asset($font) }}" />
        @endforeach
    @endif

    @inertiaHead
    <script>
        (function () {
            @if(config('banner.enabled'))
            /*
             * The banner dismissal, before first paint.
             *
             * Version-matched: a reader who closed the previous message has not
             * read this one, so bumping `banner.version` brings the bar back
             * without touching anyone's storage. Wrapped, because localStorage
             * throws outright in a private window rather than returning null —
             * and a banner is not worth a blank page.
             *
             * Emitted only when the banner is on, so a switched-off banner
             * leaves no element, no class, no reserved height and no dead
             * script — nothing for a reader to find in view-source and wonder
             * about.
             */
            try {
                if (localStorage.getItem('tablepro:banner-dismissed') === @json((string) config('banner.version'))) {
                    document.documentElement.classList.remove('has-banner');
                }
            } catch (e) {}
            @endif

            var theme = localStorage.getItem('theme');
            var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                document.documentElement.classList.add('dark');
            }
            var variant = isDark ? 'dark' : 'light';
            var link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.type = 'image/webp';
            link.href = '/images/app-' + variant + '-1920.webp';
            link.setAttribute('imagesrcset', '/images/app-' + variant + '-1280.webp 1280w, /images/app-' + variant + '-1920.webp 1920w, /images/app-' + variant + '.webp 3024w');
            link.setAttribute('imagesizes', '(max-width: 1280px) 1280px, (max-width: 1920px) 1920px, 3024px');
            document.head.appendChild(link);
        })();
    </script>
    @if(config('payment.provider') === 'polar')
        <script defer data-auto-init src="https://cdn.jsdelivr.net/npm/@polar-sh/checkout@0.2.0/dist/embed.global.js"></script>
    @else
        <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
    @endif
    @if(config('analytics.plausible.domain'))
        <script defer data-domain="{{ config('analytics.plausible.domain') }}" src="{{ config('analytics.plausible.script_url') }}"></script>
        <script>window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }</script>
    @endif
    @if(config('services.crisp.website_id'))
        <script type="text/javascript">window.$crisp=[];window.CRISP_WEBSITE_ID="{{ config('services.crisp.website_id') }}";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();</script>
    @endif
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="overflow-x-hidden bg-background text-foreground antialiased">
    @inertia
</body>
</html>
