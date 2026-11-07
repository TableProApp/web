<?php

use Illuminate\Support\Carbon;

use function Pest\Laravel\get;

function securityTxtFields(): array
{
    $response = get('/.well-known/security.txt')->assertOk();

    expect($response->headers->get('Content-Type'))->toStartWith('text/plain');

    $fields = [];

    // RFC 9116 allows a field more than once: Contact lists the channels in order of preference.
    foreach (explode("\n", trim((string) $response->getContent())) as $line) {
        [$name, $value] = explode(': ', $line, 2);
        $fields[$name][] = $value;
    }

    return $fields;
}

it('publishes the security address, then a private GitHub advisory, at the RFC 9116 address', function (): void {
    config(['app.web_domain' => 'tablepro.app']);

    $facts = json_decode(file_get_contents(resource_path('data/facts.json')), true);

    expect(securityTxtFields())->toMatchArray([
        'Contact' => ["mailto:{$facts['support']['securityEmail']}", "{$facts['links']['github']}/security/advisories/new"],
        'Canonical' => ['https://tablepro.app/.well-known/security.txt'],
        'Policy' => ['https://tablepro.app/security'],
    ]);
});

it('builds the canonical from the configured origin, never from the request host', function (): void {
    config(['app.web_domain' => 'tablepro.app']);

    $body = (string) get('http://evil.example/.well-known/security.txt')->assertOk()->getContent();

    expect($body)->toContain('Canonical: https://tablepro.app/.well-known/security.txt')->not->toContain('evil.example');
});

// When this fails, check the contact still reaches someone, then move SecurityTxtController::EXPIRES forward.
it('has not expired and expires within a year', function (): void {
    $expires = Carbon::parse(securityTxtFields()['Expires'][0]);

    expect($expires->isFuture())->toBeTrue()
        ->and($expires->isBefore(now()->addYear()))->toBeTrue();
});
