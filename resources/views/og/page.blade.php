{{--
    The card of a feature, database or comparison page: the `og` block of its
    content file, `{kicker, title}`, in the card's locale. A page with no
    kicker of its own shows its family's label from lang/{locale}/og.php.

    Expects $locale, $fonts, $logo, $kicker, $title, $titleSize and $address.
--}}
@extends('og.layout')

@section('body')
    <p class="kicker">{{ $kicker }}</p>
    <h1 class="title title-{{ $titleSize }}">{{ $title }}</h1>
@endsection

@section('footer')
    <span class="address">{{ $address }}</span>
@endsection
