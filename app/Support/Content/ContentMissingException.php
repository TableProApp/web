<?php

namespace App\Support\Content;

use RuntimeException;

/**
 * A page asked for copy that does not exist in the requested locale.
 *
 * Not a 404. The registry decides which locales a page renders in before any
 * controller runs, so reaching this means a controller and the content tree
 * disagree, which is a bug to fix rather than a visitor to turn away.
 */
final class ContentMissingException extends RuntimeException
{
    public static function for(string $name, string $locale): self
    {
        return new self("No {$locale} content for [{$name}]. Expected resources/data/content/{$locale}/{$name}.json.");
    }
}
