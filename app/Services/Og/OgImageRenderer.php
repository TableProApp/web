<?php

namespace App\Services\Og;

interface OgImageRenderer
{
    public function render(string $html, string $outputPath, int $width = 1200, int $height = 630): void;
}
