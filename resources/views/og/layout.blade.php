{{--
    The frame every Open Graph card shares, rendered to a 1200 × 630 PNG by
    `php artisan og:generate`: the logo and wordmark at the top, the page's
    own words in the middle, its address at the bottom.

    Colours are literals because the card renders through Chromium and never
    sees the stylesheet. They are the light theme's tokens (design-system
    §2.2): #ffffff --background, #0a0a0a --foreground, #636363
    --muted-foreground, #e1e1e1 --rule. The logo carries the only orange; the
    accent never colours headings, rules or grounds. No screenshot and no app
    chrome appear on a card.

    `$fonts` is the site's own fonts.css with every face inlined (OgFonts), so
    a card made on the Linux CI runner has the same Inter glyphs as one made
    on a Mac, Vietnamese included. Headings take line-height 1.3 under
    :lang(vi), for stacked diacritics (design-system §3.3). Nothing is
    uppercase or letter-spaced, and every field is escaped.

    Children fill `body` and `footer`, and pass `$title` for the document title.
--}}
<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        {!! $fonts !!}

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            width: 1200px;
            height: 630px;
            overflow: hidden;
            background: #ffffff;
            color: #0a0a0a;
            font-family: 'Inter Variable', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK SC', 'Noto Sans CJK TC', system-ui, sans-serif;
            font-optical-sizing: auto;
            -webkit-font-smoothing: antialiased;
        }

        body {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 72px 80px 60px;
        }

        .brand { display: flex; align-items: center; gap: 16px; }
        .brand img { display: block; width: 56px; height: 56px; }
        .brand span { font-size: 30px; font-weight: 600; letter-spacing: -0.02em; }

        .copy { display: flex; flex-direction: column; gap: 20px; max-width: 1040px; }

        .kicker {
            font-size: 28px;
            font-weight: 500;
            line-height: 1.3;
            letter-spacing: -0.01em;
            color: #636363;
        }

        .title {
            font-weight: 600;
            line-height: 1.12;
            letter-spacing: -0.022em;
            text-wrap: balance;
        }

        .title-l { font-size: 68px; }
        .title-m { font-size: 58px; }
        .title-s { font-size: 48px; }

        .lead {
            font-size: 30px;
            line-height: 1.4;
            letter-spacing: -0.012em;
            color: #636363;
            text-wrap: pretty;
        }

        :lang(vi) .title { line-height: 1.3; }
        :lang(vi) .kicker, :lang(vi) .lead { line-height: 1.5; }

        .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 32px;
            padding-top: 28px;
            border-top: 1px solid #e1e1e1;
            font-size: 24px;
            line-height: 1.4;
            color: #636363;
        }

        .address {
            font-family: 'IBM Plex Mono', ui-monospace, monospace;
            font-size: 22px;
            letter-spacing: 0;
        }
        html:lang(ja) body { font-family: "Inter Variable", "Noto Sans CJK JP", "Hiragino Kaku Gothic ProN", sans-serif; }
        html:lang(ko) body { font-family: "Inter Variable", "Noto Sans CJK KR", "Apple SD Gothic Neo", sans-serif; }
        html:lang(zh-Hans) body { font-family: "Inter Variable", "Noto Sans CJK SC", "PingFang SC", sans-serif; }
        html:lang(zh-Hant) body { font-family: "Inter Variable", "Noto Sans CJK TC", "PingFang TC", sans-serif; }
    </style>
</head>
<body>
    <div class="brand">
        <img src="data:image/png;base64,{{ $logo }}" alt="">
        <span>TablePro</span>
    </div>

    <main class="copy">
        @yield('body')
    </main>

    <footer class="footer">
        @yield('footer')
    </footer>
</body>
</html>
