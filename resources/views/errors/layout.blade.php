{{--
    The static error page, for when the branded Inertia `Error` page cannot be
    rendered: a failure inside that page itself, or the framework answering
    500 or 503 before the app is up. It loads nothing from the build, so it
    still works when `public/build` is missing or half written.

    Copy comes from lang/{locale}/errors.php. The locale is the one the error
    renderer set from the path, so `/vi/…` fails in Vietnamese.
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>{{ $title }} – TablePro</title>
    @include('partials.head-theme')
    <style>
        :root { --bg: #ffffff; --fg: #0a0a0a; --muted: #636363; --rule: #e1e1e1; --link: #9e5209; }
        .dark { --bg: #121212; --fg: #f5f5f5; --muted: #a4a4a4; --rule: #2e2e2e; --link: #fea668; }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
        :lang(vi) h1 { line-height: 1.3; }
        main { max-width: 36rem; margin: 0 auto; padding: 72px 16px; }
        img { display: block; width: 40px; height: 40px; margin-bottom: 32px; }
        .status { margin: 0 0 8px; font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
        h1 { margin: 0 0 16px; font-size: 30px; line-height: 1.15; font-weight: 600; letter-spacing: -0.022em; text-wrap: balance; }
        p { margin: 0 0 24px; }
        a { color: var(--link); text-underline-offset: 4px; }
        a:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
    </style>
</head>
<body>
    <main>
        <img src="/logo.png" alt="TablePro" width="40" height="40" />
        <p class="status">{{ $status }}</p>
        <h1>{{ $title }}</h1>
        <p>{{ $body }}</p>
        <p><a href="{{ \App\Support\Localization\LocalizedUrl::path('/', app()->getLocale()) }}">{{ __('errors.home') }}</a></p>
    </main>
</body>
</html>
