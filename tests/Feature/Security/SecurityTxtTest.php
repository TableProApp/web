<?php

use Illuminate\Support\Carbon;

/**
 * @return array<string, string>
 */
function securityTxtFields(): array
{
    $response = test()->get('/.well-known/security.txt')->assertOk();

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

    $facts = json_decode(file_get_contents(resource_path('data/facts.json')), true);

    expect(securityTxtFields())->toMatchArray([
        'Contact' => 'mailto:' . $facts['support']['email'],
        'Preferred-Languages' => 'en, vi',
        'Canonical' => 'https://tablepro.app/.well-known/security.txt',
        'Policy' => 'https://tablepro.app/security',
    ]);
});

it('builds the canonical from the configured origin, never from the request host', function (): void {
    config(['app.web_domain' => 'tablepro.app']);

    $body = (string) $this->get('http://evil.example/.well-known/security.txt')->assertOk()->getContent();

    expect($body)->toContain('Canonical: https://tablepro.app/.well-known/security.txt')->not->toContain('evil.example');
});

/*
 * Fails a month before the file goes stale. Check the contact still reaches
 * someone, then move SecurityTxtController::EXPIRES forward.
 */
it('expires more than 30 days from now and less than a year ahead', function (): void {
    $expires = Carbon::parse(securityTxtFields()['Expires']);

    expect($expires->isAfter(now()->addDays(30)))->toBeTrue('security.txt expires on ' . $expires->toDateString())
        ->and($expires->isBefore(now()->addYear()))->toBeTrue('Expires is a year or more ahead');
});
