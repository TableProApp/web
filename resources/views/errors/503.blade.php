@include('errors.layout', [
    'status' => 503,
    'title' => __('errors.503.title'),
    'body' => __('errors.503.body'),
])
