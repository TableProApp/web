<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Services\Blog\BlogService;
use App\Services\Blog\Post;
use App\Support\Content\ContentRepository;
use App\Support\Seo\BlogPosts;
use App\Support\Seo\PageRegistry;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * The blog: `/blog`, `/vi/blog` and `/blog/{slug}` (sitemap §A.5, §E.6).
 *
 * Every retained post is an English release announcement. `/vi/blog` lists
 * them under Vietnamese chrome, each marked as English and linked at its
 * English URL; it renders without being indexed, which `seo.indexable: false`
 * in `content/vi/blog.json` decides. `/vi/blog/{slug}` never wraps an English
 * body: `EnsurePageRenders` answers it with a 404 that links the English post
 * by its title (`MissingTranslationException::forEntry()`).
 *
 * Only posts the page registry renders are listed or offered as related, so a
 * merged post whose file came back would still never be linked while its URL
 * redirects.
 */
class BlogController extends Controller
{
    /** How many related posts a post page links. */
    private const RELATED = 3;

    /** The tag every release post carries, which says nothing about how two posts relate. */
    private const COMMON_TAG = 'release';

    public function __construct(
        private readonly BlogService $blog,
        private readonly PageRegistry $registry,
    ) {}

    public function index(ContentRepository $content): Response
    {
        $locale = App::getLocale();

        return Inertia::render('Blog/Index', [
            'content' => Arr::except($content->page('blog', $locale), ['corrections']),
            'posts' => array_map(
                static fn(Post $post): array => $post->summary($locale),
                $this->published($this->blog->listing($locale)),
            ),
        ]);
    }

    public function show(ContentRepository $content, string $slug): Response
    {
        $locale = App::getLocale();
        $post = $this->blog->find($slug, $locale);

        if ($post === null || ! $this->isPublished($post)) {
            abort(404);
        }

        $copy = $content->has('blog', $locale) ? $content->page('blog', $locale) : [];

        return Inertia::render('Blog/Post', [
            'post' => [
                ...$post->summary($locale),
                'release' => $post->release,
                'bodyHtml' => $this->blog->html($post),
            ],
            'correction' => $this->correction($copy, $post, $locale),
            'related' => array_map(
                static fn(Post $related): array => $related->summary($locale),
                $this->related($post),
            ),
        ]);
    }

    /**
     * The posts whose own URL is a page.
     *
     * @param  list<Post>  $posts
     * @return list<Post>
     */
    private function published(array $posts): array
    {
        return array_values(array_filter($posts, fn(Post $post): bool => $this->isPublished($post)));
    }

    private function isPublished(Post $post): bool
    {
        return $this->registry->find(BlogPosts::ROUTE, ['slug' => $post->slug])?->renders($post->locale) ?? false;
    }

    /**
     * Up to three other posts in the same language: those sharing the most
     * topics first, then those published closest in time, so a release post
     * links its neighbours rather than whatever happens to be newest.
     *
     * The ranking only chooses the three. They are shown newest first, like
     * every other dated list on the site: in ranking order the dates read
     * Sep 9, Sep 22, Sep 4, which looks like a sorting bug.
     *
     * @return list<Post>
     */
    private function related(Post $post): array
    {
        $topics = array_diff($post->tags, [self::COMMON_TAG]);
        $candidates = array_values(array_filter(
            $this->published($this->blog->all($post->locale)),
            static fn(Post $other): bool => $other->slug !== $post->slug,
        ));

        $rank = static fn(Post $other): array => [
            -count(array_intersect($topics, $other->tags)),
            abs($other->date->getTimestamp() - $post->date->getTimestamp()),
            -$other->date->getTimestamp(),
        ];

        usort($candidates, static fn(Post $a, Post $b): int => $rank($a) <=> $rank($b));

        $chosen = array_slice($candidates, 0, self::RELATED);

        usort($chosen, static fn(Post $a, Post $b): int => $b->date <=> $a->date);

        return $chosen;
    }

    /**
     * The dated editor's correction for a post, from `corrections.{slug}` in
     * the blog's content file, or null. A correction is added only where a
     * post said something that was never true (sitemap §E.6); the post itself
     * is never edited silently.
     *
     * @param  array<string, mixed>  $copy
     * @return array{date: string, dateFormatted: string, text: string}|null
     */
    private function correction(array $copy, Post $post, string $locale): ?array
    {
        $correction = $copy['corrections'][$post->slug] ?? null;

        if (! is_array($correction) || ! is_string($correction['date'] ?? null) || ! is_string($correction['text'] ?? null)) {
            return null;
        }

        try {
            $date = CarbonImmutable::createFromFormat('!Y-m-d', $correction['date']);
        } catch (Throwable) {
            return null;
        }

        if (! $date instanceof CarbonImmutable) {
            return null;
        }

        return [
            'date' => $date->toDateString(),
            'dateFormatted' => $date->locale($locale)->isoFormat('LL'),
            'text' => $correction['text'],
        ];
    }
}
