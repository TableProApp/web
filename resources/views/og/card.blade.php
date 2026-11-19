{{--
    Rails at x=48 and x=1151 and the join at y=534 are the site's page frame (design-system §4.7), in the dark tokens.
    The band under the join stays empty: X draws its overlay there.
    The script picks the largest title step that fits, then sets `data-fit` on body, which the renderer waits for.
--}}
<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        {!! $fonts !!}
        {!! $cjk !!}

        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            position: relative;
            width: 1200px;
            height: 630px;
            overflow: hidden;
            background: #121212;
            color: #f5f5f5;
            font-family: 'Inter Variable', 'Card CJK', 'Noto Sans CJK JP', 'Noto Sans CJK KR', 'Noto Sans CJK SC', 'Noto Sans CJK TC', system-ui, sans-serif;
            font-optical-sizing: auto;
            -webkit-font-smoothing: antialiased;
        }

        html:lang(ja) body { font-family: 'Inter Variable', 'Card CJK', 'Noto Sans CJK JP', 'Hiragino Kaku Gothic ProN', sans-serif; }
        html:lang(ko) body { font-family: 'Inter Variable', 'Card CJK', 'Noto Sans CJK KR', 'Apple SD Gothic Neo', sans-serif; }
        html:lang(zh-Hans) body { font-family: 'Inter Variable', 'Card CJK', 'Noto Sans CJK SC', 'PingFang SC', sans-serif; }
        html:lang(zh-Hant) body { font-family: 'Inter Variable', 'Card CJK', 'Noto Sans CJK TC', 'PingFang TC', sans-serif; }

        .rail { position: absolute; top: 0; width: 1px; height: 630px; background: #2e2e2e; }
        .join { position: absolute; left: 0; top: 534px; width: 1200px; height: 1px; background: #2e2e2e; }
        .mark { position: absolute; top: 529px; width: 11px; height: 11px; }
        .mark::before { content: ''; position: absolute; left: 5px; top: 0; width: 1px; height: 11px; background: #717171; }
        .mark::after { content: ''; position: absolute; left: 0; top: 5px; width: 11px; height: 1px; background: #717171; }

        .brand { position: absolute; left: 80px; top: 56px; height: 48px; display: flex; align-items: center; white-space: nowrap; }
        .brand img { display: block; width: 48px; height: 48px; }
        .brand .name { margin-left: 16px; font-size: 32px; font-weight: 600; line-height: 48px; letter-spacing: -0.02em; }
        .brand .divider { width: 1px; height: 28px; margin: 0 20px; background: #717171; }
        .brand .section { font-size: 32px; font-weight: 500; line-height: 48px; color: #a4a4a4; }

        .tile {
            position: absolute;
            left: 1024px;
            top: 56px;
            width: 96px;
            height: 96px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #2e2e2e;
            border-radius: 12px;
            background: #1e1e1e;
        }
        .tile.light { border-color: #f5f5f5; background: #f5f5f5; }
        .tile img { display: block; width: 56px; height: 56px; object-fit: contain; }

        .copy { position: absolute; left: 80px; right: 80px; bottom: 136px; }

        .title { font-weight: 600; text-wrap: balance; overflow-wrap: break-word; }
        .title.t1 { font-size: 112px; line-height: 1.04; letter-spacing: -0.03em; }
        .title.t2 { font-size: 88px; line-height: 1.08; letter-spacing: -0.025em; }
        .title.t3 { font-size: 72px; line-height: 1.1; letter-spacing: -0.022em; }
        .title.t4 { font-size: 60px; line-height: 1.12; letter-spacing: -0.022em; }
        .title.clamp { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; overflow-wrap: anywhere; }

        .sub {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            margin-top: 16px;
            font-size: 40px;
            font-weight: 500;
            line-height: 1.25;
            letter-spacing: -0.01em;
            color: #a4a4a4;
            text-wrap: balance;
        }

        /* Stacked diacritics need the taller line; the margin puts the last baseline back where the other languages have it. */
        :lang(vi) .title { line-height: 1.25 !important; }
        :lang(vi) .title:last-child { margin-bottom: -0.09em; }
        :lang(vi) .sub { line-height: 1.4; }

        :lang(ja) .title, :lang(ja) .sub { line-break: strict; }
        :lang(ko) .title, :lang(ko) .sub { word-break: keep-all; }
        :lang(zh-Hans) .title, :lang(zh-Hant) .title { line-break: strict; }
    </style>
</head>
<body>
    <div class="rail" style="left: 48px"></div>
    <div class="rail" style="left: 1151px"></div>
    <div class="join"></div>
    <div class="mark" style="left: 43px"></div>
    <div class="mark" style="left: 1146px"></div>

    <div class="brand">
        <img src="data:image/png;base64,{{ $logo }}" alt="">
        <span class="name">TablePro</span>
        @if ($section !== '')
            <span class="divider"></span>
            <span class="section">{{ $section }}</span>
        @endif
    </div>

    @if ($tile !== '')
        <div class="tile"><img src="{{ $tile }}" alt=""></div>
    @endif

    <main class="copy">
        <h1 class="title t1">{{ $title }}</h1>
        @if ($sub !== '')
            <p class="sub">{{ $sub }}</p>
        @endif
    </main>

    <script>
        (async () => {
            try {
                await document.fonts.ready;
                await Promise.all([...document.fonts].map((face) => face.load().catch(() => null)));

                const title = document.querySelector('.title');
                const copy = document.querySelector('.copy');
                const limits = { t1: 1, t2: 2, t3: 3, t4: 3 };
                let fit = 'clamped';

                for (const step of Object.keys(limits)) {
                    title.className = 'title ' + step;
                    const lines = Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight));
                    const wide = title.scrollWidth > title.clientWidth + 1;

                    if (lines <= limits[step] && !wide && copy.getBoundingClientRect().height <= 330) {
                        fit = 'ok';
                        break;
                    }
                }

                if (fit === 'clamped') {
                    title.classList.add('clamp');
                }

                // A logo sits on whichever tile it contrasts with more: yellow marks vanish on the light one, black marks on the dark one.
                const mark = document.querySelector('.tile img');

                if (mark) {
                    await mark.decode();
                    const canvas = document.createElement('canvas');
                    canvas.width = canvas.height = 64;
                    const context = canvas.getContext('2d');
                    context.drawImage(mark, 0, 0, 64, 64);
                    const pixels = context.getImageData(0, 0, 64, 64).data;
                    const linear = (value) => (value /= 255) <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
                    const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
                    let onDark = 0;
                    let onLight = 0;

                    for (let i = 0; i < pixels.length; i += 4) {
                        const weight = pixels[i + 3] / 255;
                        const luminance = 0.2126 * linear(pixels[i]) + 0.7152 * linear(pixels[i + 1]) + 0.0722 * linear(pixels[i + 2]);
                        onDark += weight * Math.log(contrast(luminance, 0.013));
                        onLight += weight * Math.log(contrast(luminance, 0.913));
                    }

                    if (onLight > onDark) {
                        mark.parentElement.classList.add('light');
                    }
                }

                document.body.dataset.fit = fit;
            } catch (error) {
                document.body.dataset.fit = 'error';
            }
        })();
    </script>
</body>
</html>
