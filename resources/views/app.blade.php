<!DOCTYPE html>
{{--
    `lang` is the route group's locale, set by the `locale:{code}` middleware,
    or for an error page the locale of its path. The locale lives in the URL
    alone, so this is right on the first byte and never needs JavaScript.

    `has-banner` decides, before a single pixel is painted, whether the license
    banner is seen and how much room it takes above the header. It is set here
    rather than in React because `--banner-h` has to be settled by the time the
    first frame renders: resolving it in state would drop the header 40px on
    every load for every reader who had already closed the bar. It is set only
    on pages that show the banner (App\Support\Banner), and the script further
    down removes it again while this browser's dismissal lasts.

    No `overflow-x: hidden` on <html> or <body>: it masked horizontal-scroll
    regressions instead of preventing them. Anything wide scrolls inside its
    own region.
--}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"@if(\App\Support\Banner::shownOn(request())) class="has-banner"@endif>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    {{-- No robots tag here. SEOHead emits exactly one per page, from the
         registry, so a tag in the layout would give every page two. --}}

    {{-- Theme before anything paints: light unless the reader chose otherwise.
         Shared byte for byte with the account app, which reads the same
         `theme` key on this origin. --}}
    @include('partials.head-theme')

    {{-- An iPhone or iPad, by `classifyDevice` in resources/js/lib/device.ts
         (tests/js/device.test.ts runs this against it), before first paint:
         the App Store badge leads there, and nothing swaps under a finger. --}}
    <script>
        (function () {
            var ua = navigator.userAgent;
            if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
                document.documentElement.classList.add('ios');
            }
        })();
    </script>

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

    {{--
        The icons are small on purpose: every first visit downloads them. The
        tab icon and the manifest's are the 256px logo, about 13 KB as an
        8-bit palette PNG (it was 156 KB at 16 bits per channel). iOS asks for
        a 180px icon, and also probes `/apple-touch-icon.png` on its own.
    --}}
    <link rel="icon" type="image/png" sizes="256x256" href="/logo.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
    @if(\App\Support\Banner::shownOn(request()))
        {{--
            The banner dismissal, before first paint.

            The record is `{"version", "until"}` (resources/js/lib/banner.ts,
            `isBannerDismissed`, which this mirrors and tests/js/banner.test.ts
            runs against). It hides the bar until `until` for the version the
            reader closed, or for every version when it is "*": a reader who
            has a license, or just bought one. Bumping `banner.version` brings
            the bar back for a new message. Wrapped, because localStorage
            throws outright in a private window rather than returning null —
            and a banner is not worth a blank page.

            Emitted only where the banner is shown, so elsewhere there is no
            element, no class, no reserved height and no dead script.

            The license is for the Mac app, so on the iPhone and iPad page a
            reader on one of those devices gets no banner either.
        --}}
        <script>
            (function () {
                @if(\App\Support\Banner::hiddenOnIosDevices(request()))
                if (document.documentElement.classList.contains('ios')) {
                    document.documentElement.classList.remove('has-banner');
                }
                @endif
                try {
                    var record = JSON.parse(localStorage.getItem('tablepro:banner-dismissed') || 'null');
                    if (record && typeof record.until === 'number' && record.until > Date.now() && (record.version === '*' || record.version === @json((string) config('banner.version')))) {
                        document.documentElement.classList.remove('has-banner');
                    }
                } catch (e) {}
            })();
        </script>
    @endif
    {{--
        No third-party script is in this template. Crisp's chat loader is added
        by the page once it has loaded and the browser is idle
        (resources/js/lib/crisp.ts), so it never delays the first render. The
        Polar or Lemon Squeezy checkout SDK loads at checkout intent
        (resources/js/lib/checkout-sdk.ts), not on every page. Google's tag is
        added the same way as the chat, by the script below.
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

            Google's script (about 180 KB) is requested only after the load
            event, once the browser is idle, or two seconds after the load where
            there is no idle callback (Safari), as the chat loader is. Until it
            arrives, `gtag()` queues every call in `dataLayer`, the consent
            calls from `consent.ts` included, and the script replays the queue
            in order. A reader who leaves before then is not counted.
        --}}
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

            (function () {
                var src = @json('https://www.googletagmanager.com/gtag/js?id=' . config('analytics.google.measurement_id'), JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);

                function load() {
                    var script = document.createElement('script');
                    script.async = true;
                    script.src = src;
                    document.head.appendChild(script);
                }

                function whenIdle() {
                    if (typeof window.requestIdleCallback === 'function') {
                        window.requestIdleCallback(load, { timeout: 4000 });
                    } else {
                        setTimeout(load, 2000);
                    }
                }

                if (document.readyState === 'complete') {
                    whenIdle();
                } else {
                    window.addEventListener('load', whenIdle, { once: true });
                }
            })();
        </script>
    @endif
    {{--
        The page's own chunk is an entry here too, so its modulepreload and
        those of everything it imports go out with the document. Otherwise
        the browser learns of them only once app.tsx has run and asked
        Inertia for the page, a round trip later, and hydration waits for it.
        A component with no file (none today: SeoSmokeTest renders every page)
        is left to the runtime rather than failing the manifest lookup.

        The same goes for the page's UI catalog. English is inside app.tsx;
        every other language is a chunk of its own (resources/js/i18n/index.ts).
    --}}
    @php($pageEntry = 'resources/js/pages/' . ($page['component'] ?? '') . '.tsx')
    @php($catalogEntry = app()->getLocale() === \App\Support\Localization\Locales::default() ? '' : 'resources/js/i18n/messages/' . app()->getLocale() . '/index.ts')
    @viteReactRefresh
    @vite(array_values(array_filter(['resources/css/app.css', 'resources/js/app.tsx', is_file(base_path($pageEntry)) ? $pageEntry : null, is_file(base_path($catalogEntry)) ? $catalogEntry : null])))
</head>
<body class="bg-background text-foreground antialiased">
    @inertia
</body>
</html>
