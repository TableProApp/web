<!DOCTYPE html>
{{--
    `lang` is the route group's locale, set by the `locale:{code}` middleware,
    or for an error page the locale of its path. The locale lives in the URL
    alone, so this is right on the first byte and never needs JavaScript.

    `has-banner` decides, before a single pixel is painted, whether the top
    banner is seen and how much room the header and <main> leave for it. It is
    set here rather than in React because `--banner-h` has to be settled by the
    time the first frame renders: resolving it in state would drop the header
    44px on every load for every reader who had already dismissed the bar. The
    script further down removes it again when this browser has dismissed the
    current banner version.

    No `overflow-x: hidden` on <html> or <body>: it masked horizontal-scroll
    regressions instead of preventing them. Anything wide scrolls inside its
    own region.
--}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"@if(config('banner.enabled')) class="has-banner"@endif>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {{-- No robots tag here. SEOHead emits exactly one per page, from the
         registry, so a tag in the layout would give every page two. --}}

    {{-- Theme before anything paints: light unless the reader chose otherwise.
         Shared byte for byte with the account app, which reads the same
         `theme` key on this origin. --}}
    @include('partials.head-theme')

    @php($lcpAsset = $page['props']['lcpAsset'] ?? null)
    @if (is_array($lcpAsset) && is_array($lcpAsset['light'] ?? null))
        {{--
            The page's largest image, preloaded for the theme the script above
            just resolved. Only a supplied asset marked `priority` in
            resources/data/assets.json reaches here (`AssetManifest::lcpDescriptor()`),
            as `{light: list<{srcset, sizes, type, media?}>, dark: list<…> | null}`:
            one preload per image the viewport can show, so a window with a
            phone crop preloads the window for 768px and up and the crop below
            it, each under its own `media`. A placeholder gets nothing, because
            it makes no image request at all.
        --}}
        <script>
            (function () {
                var asset = @json($lcpAsset);
                var list = document.documentElement.classList.contains('dark') && asset.dark ? asset.dark : asset.light;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    if (item.type) { link.type = item.type; }
                    if (item.media) { link.media = item.media; }
                    link.setAttribute('imagesrcset', item.srcset);
                    link.setAttribute('imagesizes', item.sizes);
                    link.setAttribute('fetchpriority', 'high');
                    document.head.appendChild(link);
                }
            })();
        </script>
    @endif

    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <link rel="manifest" href="/site.webmanifest" />

    {{--
        The faces come from resources/css/fonts.css, so the browser cannot
        discover them until the stylesheet has arrived. Inter latin carries
        every page's headline and body. Vietnamese pages also need the 15 KB
        `vietnamese` subset for their diacritics; fonts.css declares it after
        `latin-ext`, so those letters resolve to it and not to the 133 KB face.

        No mono preload: nothing above the fold is set in IBM Plex Mono.

        Paths come from the Vite manifest because the woff2 files are
        content-hashed at build time. Skipped while the dev server is hot,
        where there is no manifest to resolve against.
    --}}
    @if (! Vite::isRunningHot())
        @foreach (array_filter([
            'node_modules/@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2',
            app()->getLocale() === 'vi' ? 'node_modules/@fontsource-variable/inter/files/inter-vietnamese-opsz-normal.woff2' : null,
        ]) as $font)
            <link rel="preload" as="font" type="font/woff2" crossorigin href="{{ Vite::asset($font) }}" />
        @endforeach
    @endif

    @inertiaHead
    @if(config('banner.enabled'))
        {{--
            The banner dismissal, before first paint.

            Version-matched: a reader who closed the previous message has not
            read this one, so bumping `banner.version` brings the bar back
            without touching anyone's storage. Wrapped, because localStorage
            throws outright in a private window rather than returning null —
            and a banner is not worth a blank page.

            Emitted only when the banner is on, so a switched-off banner leaves
            no element, no class, no reserved height and no dead script.
        --}}
        <script>
            (function () {
                try {
                    if (localStorage.getItem('tablepro:banner-dismissed') === @json((string) config('banner.version'))) {
                        document.documentElement.classList.remove('has-banner');
                    }
                } catch (e) {}
            })();
        </script>
    @endif
    {{--
        No third-party script loads here unasked. Crisp loads only when a reader
        clicks a chat button (resources/js/lib/crisp.ts), so it sets nothing
        before that. The Polar or Lemon Squeezy checkout SDK loads at checkout
        intent (resources/js/lib/checkout-sdk.ts), not on every page.
    --}}
    @if(config('analytics.google.measurement_id'))
        {{--
            Google Analytics 4 in Consent Mode. The tag loads for everyone, but
            with analytics storage denied it sets no cookie and sends only a
            cookieless ping — until the reader allows it in the consent bar.

            The order is the contract: `consent default` must precede `config`,
            and the stored choice is applied in between, so a reader who allowed
            analytics on an earlier visit has their first page view counted with
            cookies rather than as a stranger. The storage key is shared with
            `resources/js/lib/consent.ts` and with the account portal, which
            lives on this same origin and so reads the same choice.
        --}}
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('analytics.google.measurement_id') }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
            });
            try {
                if (localStorage.getItem('tablepro:analytics-consent') === 'granted') {
                    gtag('consent', 'update', { analytics_storage: 'granted' });
                }
            } catch (e) {}
            gtag('js', new Date());
            gtag('config', @json(config('analytics.google.measurement_id')));
        </script>
    @endif
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-background text-foreground antialiased">
    @inertia
</body>
</html>
