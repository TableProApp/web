import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The public-site privacy disclosure depends on these requests neither sending
// portal cookies nor retaining Set-Cookie responses. A move to same-origin or
// include must trigger an explicit privacy-policy review.
for (const file of [
    'hooks/use-email-form.ts',
    'components/pricing/use-checkout.ts',
    'components/pricing/discount-field.tsx',
]) {
    test(`${file} explicitly omits account credentials`, () => {
        const source = readFileSync(new URL(`../../resources/js/${file}`, import.meta.url), 'utf8');
        assert.match(source, /credentials:\s*['"]omit['"]/);
        assert.doesNotMatch(source, /credentials:\s*['"](?:include|same-origin)['"]/);
    });
}

test('the English policy distinguishes public requests from portal navigation', () => {
    const source = readFileSync(new URL('../../resources/data/legal/en/privacy.md', import.meta.url), 'utf8');
    assert.match(source, /neither send account-portal cookies nor accept cookies from the response/);
    assert.match(source, /Opening account-portal pages is separate/);
    assert.doesNotMatch(source, /and so does subscribing to the newsletter or starting a checkout/);
});
