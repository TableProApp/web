<?php

namespace App\Console\Commands;

use App\Services\GitHub\StarCount;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('stars:refresh')]
#[Description('Fetch the repository star count from GitHub for the site header')]
class RefreshStarCountCommand extends Command
{
    public function handle(StarCount $stars): int
    {
        $count = $stars->refresh();

        if ($count === null) {
            $this->error('GitHub did not answer. Serving the last stored count.');

            return self::FAILURE;
        }

        $this->info("{$count} stars.");

        return self::SUCCESS;
    }
}
