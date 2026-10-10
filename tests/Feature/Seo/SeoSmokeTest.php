<?php

it('answers 404 for a slug outside the route constraints', function (string $path): void {
    $this->get($path)->assertNotFound();
})->with([
    '/compare/unknown-tool',
    '/some-bogus-slug',
    '/features/not-a-feature',
    '/vi/compare/unknown-tool',
    '/blog/not-a-post',
]);
