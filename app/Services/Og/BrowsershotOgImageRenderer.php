<?php

namespace App\Services\Og;

use Spatie\Browsershot\Browsershot;
use Throwable;

class BrowsershotOgImageRenderer implements OgImageRenderer
{
    /**
     * @throws OgImageRenderException
     */
    public function render(string $html, string $outputPath, int $width = 1200, int $height = 630): void
    {
        try {
            Browsershot::html($html)
                ->windowSize($width, $height)
                ->setScreenshotType('png')
                ->timeout(120)
                ->save($outputPath);
        } catch (Throwable $exception) {
            throw new OgImageRenderException(
                "Failed to render OG image to {$outputPath}: {$exception->getMessage()}",
                previous: $exception,
            );
        }
    }
}
