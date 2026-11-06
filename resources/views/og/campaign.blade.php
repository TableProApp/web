{{--
    The dated sale's card: its black ground, the percentage off and the window,
    from the `og` block of content/{locale}/black-friday.json. The one card the
    accent may light, as the sale's band and page do (positioning §9).

    Expects $locale, $fonts, $logo, $title, $kicker, $headline, $headlineSize, $product, $window and $address.
--}}
@extends('og.layout')

@section('style')
    html, body {
        background: #080808;
        color: #f5f5f5;
    }

    body {
        background-image: radial-gradient(900px 480px at 100% 0%, rgba(246, 128, 1, 0.2), transparent 70%);
    }

    .sale {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .sale .kicker {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #f5f5f5;
    }

    .sale .kicker::before {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #f68001;
    }

    .headline {
        font-size: 188px;
        font-weight: 650;
        line-height: 0.95;
        letter-spacing: -0.045em;
        white-space: nowrap;
    }

    .headline-m { font-size: 150px; }
    .headline-s { font-size: 112px; }

    .product {
        font-size: 64px;
        font-weight: 600;
        line-height: 1.1;
        letter-spacing: -0.03em;
        color: #9a9a9a;
    }

    .footer {
        border-top-color: #2a2a2a;
        color: #9a9a9a;
    }
@endsection

@section('body')
    <div class="sale">
        @if ($kicker !== '')
            <p class="kicker">{{ $kicker }}</p>
        @endif
        <h1 class="headline headline-{{ $headlineSize }}">{{ $headline }}</h1>
        @if ($product !== '')
            <p class="product">{{ $product }}</p>
        @endif
    </div>
@endsection

@section('footer')
    <span>{{ $window }}</span>
    <span class="address">{{ $address }}</span>
@endsection
