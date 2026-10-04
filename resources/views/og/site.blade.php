{{--
    The generic brand card for a locale: the product's identity sentence,
    from `content/{locale}/home.json` → `og`. Written to /og.png (English) and
    /og/{locale}/default.png, and used by every page without a card of its own
    in any locale where the bespoke `og-site` card is not supplied (OgImages).

    Expects $locale, $fonts, $logo, $kicker (may be empty), $title, $titleSize
    and $address.
--}}
@extends('og.layout')

@section('body')
    @if ($kicker !== '')
        <p class="kicker">{{ $kicker }}</p>
    @endif
    <h1 class="title title-{{ $titleSize }}">{{ $title }}</h1>
@endsection

@section('footer')
    <span class="address">{{ $address }}</span>
@endsection
