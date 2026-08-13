<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Services\Blog\BlogService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BlogController extends Controller
{
    public function __construct(
        private readonly BlogService $blog,
    ) {}

    public function index(): Response
    {
        $posts = array_map(
            static fn($post): array => [
                'slug' => $post->slug,
                'title' => $post->title,
                'description' => $post->description,
                'date' => $post->date->toIso8601String(),
                'dateFormatted' => $post->date->format('F j, Y'),
                'tags' => $post->tags,
                'readingMinutes' => $post->readingMinutes,
                'url' => $post->url(),
            ],
            $this->blog->all(),
        );

        return Inertia::render('Blog/Index', [
            'posts' => $posts,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = $this->blog->find($slug);

        if (! $post) {
            throw new NotFoundHttpException('Blog post not found.');
        }

        $related = array_values(array_filter(
            $this->blog->all(),
            static fn($p): bool => $p->slug !== $post->slug,
        ));

        $related = array_slice($related, 0, 3);

        $relatedPayload = array_map(
            static fn($p): array => [
                'slug' => $p->slug,
                'title' => $p->title,
                'description' => $p->description,
                'dateFormatted' => $p->date->format('F j, Y'),
                'readingMinutes' => $p->readingMinutes,
                'url' => $p->url(),
            ],
            $related,
        );

        return Inertia::render('Blog/Post', [
            'post' => $post->toArray(),
            'relatedPosts' => $relatedPayload,
        ]);
    }
}
