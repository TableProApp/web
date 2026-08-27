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

it('lists all 7 seed posts on the index', function (): void {
    getOnWebDomainBlog('/blog')
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Index')
                ->has('posts', 7),
        );
});

dataset('blogSlugs', [
    'tablepro-0-69',
    'tablepro-0-68',
    'tablepro-0-67',
    'cloudflare-d1-mac',
    'mcp-database-claude',
    'mongodb-native-vs-compass',
    'open-source-db-clients-2026',
]);

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
    getOnWebDomainBlog('/blog/cloudflare-d1-mac')
        ->assertOk()
        ->assertInertia(
            fn($page) => $page->component('Blog/Post')
                ->has('relatedPosts', 3)
                ->where('relatedPosts.0.slug', fn(string $slug): bool => $slug !== 'cloudflare-d1-mac'),
        );
});

it('returns 404 for an unknown blog slug', function (): void {
    getOnWebDomainBlog('/blog/unknown-post-slug')->assertNotFound();
});

it('rejects slugs with invalid characters', function (): void {
    getOnWebDomainBlog('/blog/Some.Invalid.Slug')->assertNotFound();
});
