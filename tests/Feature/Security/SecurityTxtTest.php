<?php

use Illuminate\Support\Carbon;

use function Pest\Laravel\get;

function securityTxtFields(): array
{
    $response = get('/.well-known/security.txt')->assertOk();

    expect($response->headers->get('Content-Type'))->toStartWith('text/plain');

    $fields = [];

    foreach (explode("\n", trim((string) $response->getContent())) as $line) {
        [$name, $value] = explode(': ', $line, 2);
        $fields[$name] = $value;
    }

    return $fields;
}

it('publishes a security contact at the RFC 9116 address', function (): void {
    config(['app.web_domain' => 'tablepro.app']);

    $email = json_decode(file_get_contents(resource_path('data/facts.json')), true)['support']['email'];

    expect(securityTxtFields())->toMatchArray([
        'Contact' => "mailto:{$email}",
        'Canonical' => 'https://tablepro.app/.well-known/security.txt',
        'Policy' => 'https://tablepro.app/security',
    ]);
});

it('builds the canonical from the configured origin, never from the request host', function (): void {
    config(['app.web_domain' => 'tablepro.app']);

    $body = (string) get('http://evil.example/.well-known/security.txt')->assertOk()->getContent();

    expect($body)->toContain('Canonical: https://tablepro.app/.well-known/security.txt')->not->toContain('evil.example');
});

// When this fails, check the contact still reaches someone, then move SecurityTxtController::EXPIRES forward.
it('has not expired and expires within a year', function (): void {
    $expires = Carbon::parse(securityTxtFields()['Expires']);

    expect($expires->isFuture())->toBeTrue()
        ->and($expires->isBefore(now()->addYear()))->toBeTrue();
});
