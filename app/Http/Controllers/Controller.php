<?php

namespace App\Http\Controllers;

use App\Http\Middleware\CacheHtmlAtEdge;
use Illuminate\Http\Response;

abstract class Controller
{
    // Cached at the edge like its page, which the canonical names as the one to index.
    protected function markdownResponse(string $markdown, string $canonical): Response
    {
        return response($markdown, 200, [
            'Content-Type' => 'text/markdown; charset=utf-8',
            'Cache-Control' => CacheHtmlAtEdge::CACHE_CONTROL,
            'Link' => '<' . $canonical . '>; rel="canonical"',
        ]);
    }
}
