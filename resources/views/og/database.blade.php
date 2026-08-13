<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $database['name'] }} Client</title>
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
                radial-gradient(circle at 88% 18%, rgba(255, 170, 70, 0.32) 0%, transparent 50%),
                radial-gradient(circle at 12% 86%, rgba(255, 110, 60, 0.18) 0%, transparent 55%),
                linear-gradient(135deg, #0b0b10 0%, #16121a 100%);
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
            -webkit-mask-image: radial-gradient(ellipse 1400px 1000px at 88% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.4) 85%, transparent 110%);
            mask-image: radial-gradient(ellipse 1400px 1000px at 88% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.4) 85%, transparent 110%);
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
        .hero {
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-top: 24px;
        }
        .title {
            font-size: 116px;
            font-weight: 800;
            letter-spacing: -0.045em;
            line-height: 1;
            color: #f8f8f5;
        }
        .title .accent {
            color: #ffaa46;
        }
        .subtitle {
            font-size: 32px;
            line-height: 1.3;
            font-weight: 500;
            color: rgba(248, 248, 245, 0.78);
            max-width: 920px;
        }
        .footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 48px;
        }
        .versions {
            font-family: 'SF Mono', Menlo, monospace;
            font-size: 22px;
            color: rgba(248, 248, 245, 0.6);
            line-height: 1.5;
            max-width: 760px;
        }
        .versions strong {
            color: #ffaa46;
            font-weight: 600;
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

    <div class="hero">
        <h1 class="title">{{ $database['name'] }} <span class="accent">Client</span></h1>
        <p class="subtitle">{{ $database['ogPunchline'] ?? $database['tagline'] }}</p>
    </div>

    <div class="footer">
        <div class="versions">{!! $database['ogVersionsHtml'] ?? '' !!}</div>
        <div class="meta">
            <span class="meta-price">{{ $database['ogStatValue'] ?? 'Free' }}</span>
            <span class="meta-platform">{{ $database['ogStatLabel'] ?? '' }}</span>
        </div>
    </div>
</body>
</html>
