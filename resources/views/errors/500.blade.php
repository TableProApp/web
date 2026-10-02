@include('errors.layout', [
    'status' => 500,
    'title' => __('errors.500.title'),
    'body' => __('errors.500.body', ['email' => 'hello@tablepro.app']),
])
