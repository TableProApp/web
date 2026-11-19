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
        // From a file of our own: Browsershot::html() refuses the file:// URLs of the CJK faces.
        $page = tempnam(sys_get_temp_dir(), 'og') . '.html';
        file_put_contents($page, $html);

        try {
            Browsershot::htmlFromFilePath($page)
                ->windowSize($width, $height)
                ->setScreenshotType('png')
                ->addChromiumArguments(['allow-file-access-from-files'])
                ->waitForFunction('document.body.dataset.fit !== undefined')
                ->timeout(120)
                ->save($outputPath);
        } catch (Throwable $exception) {
            throw new OgImageRenderException(
                "Failed to render OG image to {$outputPath}: {$exception->getMessage()}",
                previous: $exception,
            );
        } finally {
            @unlink($page);
            @unlink(substr($page, 0, -5));
        }
    }
}
