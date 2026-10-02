<?php


use function Pest\Laravel\withoutVite;

beforeEach(function (): void {
    withoutVite();
});

function getOnWebDomainBlog(string $path)
{
    return test()->get('http://' . config('app.web_domain') . $path);
}

it('renders the blog index', function (): void {
    getOnWebDomainBlog('/blog')
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Index')
                ->has('posts'),
        );
});

it('lists all 14 seed posts on the index', function (): void {
    getOnWebDomainBlog('/blog')
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Index')
                ->has('posts', 14),
        );
});

dataset('blogSlugs', [
    'tablepro-0-77',
    'tablepro-0-76',
    'tablepro-for-iphone',
    'tablepro-0-74',
    'tablepro-0-73',
    'tablepro-0-72',
    'tablepro-0-70',
    'tablepro-0-69',
    'tablepro-0-68',
    'tablepro-0-67',
]);

/*
 * cloudflare-d1-mac, mcp-database-claude, mongodb-native-vs-compass and
 * open-source-db-clients-2026 are merged into other pages and answer 301
 * (sitemap §C.5, resources/data/redirects.json); Seo/RedirectsTest covers
 * them. Their files stay until the blog rewrite deletes them.
 */

it('renders the post page for slug [%s]', function (string $slug): void {
    getOnWebDomainBlog('/blog/' . $slug)
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Post')
                ->where('post.slug', $slug)
                ->has('post.title')
                ->has('post.bodyHtml')
                ->has('post.readingMinutes')
                ->has('post.wordCount')
                ->has('relatedPosts'),
        );
})->with('blogSlugs');

it('passes up to 3 related posts and excludes the current post', function (): void {
    getOnWebDomainBlog('/blog/tablepro-0-77')
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Post')
                ->has('relatedPosts', 3)
                ->where('relatedPosts.0.slug', fn(string $slug): bool => $slug !== 'tablepro-0-77'),
        );
});

it('returns 404 for an unknown blog slug', function (): void {
    getOnWebDomainBlog('/blog/unknown-post-slug')->assertNotFound();
});

it('rejects slugs with invalid characters', function (): void {
    getOnWebDomainBlog('/blog/Some.Invalid.Slug')->assertNotFound();
});
