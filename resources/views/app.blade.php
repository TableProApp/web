<!DOCTYPE html>
<html lang="en" class="overflow-x-hidden">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#FFAA46" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <link rel="manifest" href="/site.webmanifest" />
    @inertiaHead
    <script>
        (function () {
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
