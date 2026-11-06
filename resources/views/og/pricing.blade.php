{{--
    The /pricing card: its `og` copy, then the three plans with their yearly
    price, in the page's language and price pattern.

    Expects $locale, $fonts, $logo, $kicker, $title, $free, $freePrice, $pro, $proPrice, $team, $teamPrice and $address.
--}}
@extends('og.layout')

@section('style')
    .plans {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 12px;
        border-top: 1px solid #e1e1e1;
    }

    .plan {
        padding: 20px 24px 0 0;
    }

    .plan + .plan {
        padding-left: 24px;
        border-left: 1px solid #e1e1e1;
    }

    .plan-name {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.01em;
    }

    .plan-price {
        margin-top: 4px;
        font-size: 24px;
        line-height: 1.35;
        color: #636363;
    }

    .plan-lead .plan-name::before {
        content: "";
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-right: 10px;
        border-radius: 50%;
        background: #f68001;
        vertical-align: 0.15em;
    }
@endsection

@section('body')
    @if ($kicker !== '')
        <p class="kicker">{{ $kicker }}</p>
    @endif
    <h1 class="title title-m">{{ $title }}</h1>
    <div class="plans">
        <div class="plan">
            <p class="plan-name">{{ $free }}</p>
            <p class="plan-price">{{ $freePrice }}</p>
        </div>
        <div class="plan plan-lead">
            <p class="plan-name">{{ $pro }}</p>
            <p class="plan-price">{{ $proPrice }}</p>
        </div>
        <div class="plan">
            <p class="plan-name">{{ $team }}</p>
            <p class="plan-price">{{ $teamPrice }}</p>
        </div>
    </div>
@endsection

@section('footer')
    <span class="address">{{ $address }}</span>
@endsection
