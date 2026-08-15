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
    <title>{{ $comparison['name'] }}</title>
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
                radial-gradient(circle at 12% 18%, rgba(255, 170, 70, 0.32) 0%, transparent 45%),
                radial-gradient(circle at 88% 82%, rgba(255, 110, 60, 0.18) 0%, transparent 50%),
                linear-gradient(135deg, #0b0b10 0%, #1a1014 100%);
        }
        .grid-bg {
            position: absolute;
            inset: -300px;
            background-image:
                linear-gradient(to right, rgba(255, 170, 70, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 170, 70, 0.08) 1px, transparent 1px);
            background-size: 96px 96px;
            transform: rotate(45deg);
            transform-origin: center;
            pointer-events: none;
            z-index: 0;
            -webkit-mask-image: radial-gradient(ellipse 1500px 1100px at 12% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.4) 85%, transparent 110%);
            mask-image: radial-gradient(ellipse 1500px 1100px at 12% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.4) 85%, transparent 110%);
        }
        .top, .versus, .footer {
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
            width: 56px;
            height: 56px;
            display: block;
        }
        .brand-text {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #f8f8f5;
        }
        .brand-text .accent {
            color: #ffaa46;
        }
        .domain {
            font-size: 20px;
            color: rgba(248, 248, 245, 0.55);
            font-weight: 500;
            letter-spacing: 0.05em;
        }
        .versus {
            display: flex;
            align-items: flex-start;
            gap: 56px;
            margin-top: 24px;
        }
        .side {
            display: flex;
            flex-direction: column;
            gap: 14px;
            flex: 1;
            min-width: 0;
        }
        .side-name {
            font-size: 88px;
            font-weight: 800;
            letter-spacing: -0.04em;
            line-height: 1;
            color: #f8f8f5;
        }
        .side-name.tablepro {
            color: #ffaa46;
        }
        .side-meta {
            font-family: 'SF Mono', Menlo, monospace;
            font-size: 22px;
            color: rgba(248, 248, 245, 0.6);
            line-height: 1.5;
        }
        .side-meta strong {
            color: #f8f8f5;
            font-weight: 600;
        }
        .vs {
            font-size: 80px;
            font-weight: 800;
            color: rgba(248, 248, 245, 0.18);
            letter-spacing: -0.04em;
            font-style: italic;
            margin-top: 6px;
        }
        .footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 48px;
        }
        .tagline {
            font-size: 32px;
            line-height: 1.25;
            font-weight: 600;
            color: rgba(248, 248, 245, 0.92);
            max-width: 820px;
            letter-spacing: -0.01em;
        }
        .meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            text-align: right;
            white-space: nowrap;
        }
        .meta-price {
            font-size: 56px;
            font-weight: 800;
            color: #ffaa46;
            letter-spacing: -0.03em;
            line-height: 1;
        }
        .meta-platform {
            font-size: 18px;
            color: rgba(248, 248, 245, 0.55);
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
        <div class="domain">tablepro.app</div>
    </div>

    <div class="versus">
        <div class="side">
            <span class="side-name tablepro">TablePro</span>
            <div class="side-meta">{!! $comparison['ogTableProMetaHtml'] ?? 'Free · Native · Open source' !!}</div>
        </div>
        <div class="vs">vs</div>
        <div class="side" style="text-align: right;">
            <span class="side-name">{{ $comparison['name'] }}</span>
            <div class="side-meta">{!! $comparison['ogCompetitorMetaHtml'] ?? '' !!}</div>
        </div>
    </div>

    <div class="footer">
        <p class="tagline">{{ $comparison['ogPunchline'] ?? $comparison['description'] }}</p>
        <div class="meta">
            <span class="meta-price">{{ $comparison['ogStatValue'] ?? '$0' }}</span>
            <span class="meta-platform">{{ $comparison['ogStatLabel'] ?? '' }}</span>
        </div>
    </div>
</body>
</html>
