{{--
    The support address comes from resources/data/facts.json (`support.email`),
    the file the footer, the legal pages and the Inertia error page read. This
    page renders when the application itself failed, so it reads the file
    directly, guarded, and only falls back to the address if that read fails
    too.
--}}
@php($supportEmail = rescue(fn () => json_decode((string) file_get_contents(resource_path('data/facts.json')), true, 512, JSON_THROW_ON_ERROR)['support']['email'] ?? null, null, false) ?? 'hello@tablepro.app')
@include('errors.layout', [
    'status' => 500,
    'title' => __('errors.500.title'),
    'body' => __('errors.500.body', ['email' => $supportEmail]),
])
