{{--
    Colours here are literals because this template renders to a PNG through
    Chromium and never sees the stylesheet. They correspond to the dark theme's
    tokens: #0b0b10 to --background, #f8f8f5 to --foreground, #ffaa46 to
    --primary-strong (which computes to #ffa65e — the two are indistinguishable
    at 10.4:1 versus 10.2:1 on this ground, so the existing value stays rather
    than invalidating 36 committed PNGs).

    Changing any of them means re-running `php artisan og:generate`, which needs
    Chromium and writes into a tracked directory.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $blog['title'] }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
            width: 1200px;
            height: 630px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
            background: #0b0b10;
            color: #f8f8f5;
            overflow: hidden;
        }
        body {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 64px 72px;
            background-image:
                radial-gradient(circle at 12% 18%, rgba(255, 170, 70, 0.28) 0%, transparent 50%),
                radial-gradient(circle at 88% 86%, rgba(255, 110, 60, 0.16) 0%, transparent 55%),
                linear-gradient(135deg, #0b0b10 0%, #16121a 100%);
        }
        .grid-bg {
            position: absolute;
            inset: -300px;
            background-image:
                linear-gradient(to right, rgba(255, 170, 70, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 170, 70, 0.06) 1px, transparent 1px);
            background-size: 96px 96px;
            transform: rotate(45deg);
            transform-origin: center;
            pointer-events: none;
            z-index: 0;
            -webkit-mask-image: radial-gradient(ellipse 1400px 1000px at 12% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
            mask-image: radial-gradient(ellipse 1400px 1000px at 12% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
        }
        .top, .hero, .footer {
            position: relative;
            z-index: 1;
        }
        .top {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .brand {
            display: inline-flex;
            align-items: center;
            gap: 16px;
        }
        .brand img {
            width: 48px;
            height: 48px;
            display: block;
        }
        .brand-text {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #f8f8f5;
        }
        .label {
            font-family: 'SF Mono', Menlo, monospace;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #ffaa46;
        }
        .hero {
            display: flex;
            flex-direction: column;
            gap: 28px;
            margin-top: 16px;
        }
        .title {
            font-size: 76px;
            font-weight: 800;
            letter-spacing: -0.035em;
            line-height: 1.05;
            color: #f8f8f5;
            max-width: 1060px;
        }
        .punchline {
            font-size: 30px;
            line-height: 1.4;
            font-weight: 500;
            color: rgba(248, 248, 245, 0.74);
            max-width: 940px;
        }
        .footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 48px;
        }
        .meta {
            font-family: 'SF Mono', Menlo, monospace;
            font-size: 20px;
            color: rgba(248, 248, 245, 0.6);
            letter-spacing: 0.04em;
        }
        .meta strong {
            color: #ffaa46;
            font-weight: 600;
        }
        .domain {
            font-size: 20px;
            color: rgba(248, 248, 245, 0.55);
            font-weight: 500;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <div class="grid-bg"></div>
    <div class="top">
        <div class="brand">
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('logo.png'))) }}" alt="TablePro">
            <span class="brand-text">TablePro</span>
        </div>
        <span class="label">Blog</span>
    </div>

    <div class="hero">
        <h1 class="title">{{ $blog['title'] }}</h1>
        @if(!empty($blog['ogPunchline']))
            <p class="punchline">{{ $blog['ogPunchline'] }}</p>
        @elseif(!empty($blog['description']))
            <p class="punchline">{{ $blog['description'] }}</p>
        @endif
    </div>

    <div class="footer">
        <div class="meta"><strong>{{ $blog['author'] ?? 'TablePro Team' }}</strong> &middot; {{ $blog['dateFormatted'] ?? '' }}</div>
        <div class="domain">tablepro.app/blog</div>
    </div>
</body>
</html>
