{{--
    The card of a blog post, from its front matter in the card's locale: the
    title, then `ogPunchline` (or the description when a post has none). The
    footer is the byline, author and date in one translated template with the
    date formatted for the locale, and the post's address.

    Expects $locale, $fonts, $logo, $kicker, $title, $titleSize, $lead (may be
    empty), $byline and $address.
--}}
@extends('og.layout')

@section('body')
    <p class="kicker">{{ $kicker }}</p>
    <h1 class="title title-{{ $titleSize }}">{{ $title }}</h1>
    @if ($lead !== '')
        <p class="lead">{{ $lead }}</p>
    @endif
@endsection

@section('footer')
    <span>{{ $byline }}</span>
    <span class="address">{{ $address }}</span>
@endsection
