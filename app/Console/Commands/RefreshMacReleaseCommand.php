<?php

namespace App\Console\Commands;

use App\Services\Releases\MacReleaseService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Asks GitHub, then the Sparkle appcast, for the current Mac release, and
 * stores it for the download buttons.
 *
 * Scheduled every 15 minutes (routes/console.php), so no page request ever
 * waits on GitHub: `MacReleaseService::latest()` only reads what this stored.
 * It runs whatever the failure marker says, because the schedule is already
 * the rate limit: four calls an hour.
 *
 * Exits 1 when no source answered, so the scheduler's log shows an outage; the
 * site keeps serving the last good copy meanwhile.
 */
#[Signature('release:refresh')]
#[Description('Fetch the current Mac release from GitHub (or the appcast) for the download buttons')]
class RefreshMacReleaseCommand extends Command
{
    public function handle(MacReleaseService $releases): int
    {
        $release = $releases->refresh();

        if ($release !== null) {
            $this->info("Mac release {$release->version} ({$release->source}).");

            return self::SUCCESS;
        }

        if ($releases->failing()) {
            $this->error('Neither GitHub nor the appcast answered. Serving the last good copy.');

            return self::FAILURE;
        }

        $this->line('Another refresh is running. Nothing to do.');

        return self::SUCCESS;
    }
}
