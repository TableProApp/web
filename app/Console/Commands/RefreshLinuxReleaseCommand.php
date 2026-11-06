<?php

namespace App\Console\Commands;

use App\Services\Releases\LinuxReleaseService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('release:refresh-linux')]
#[Description('Fetch the current Linux release from GitHub for the download page')]
class RefreshLinuxReleaseCommand extends Command
{
    public function handle(LinuxReleaseService $releases): int
    {
        $release = $releases->refresh();

        if ($release !== null) {
            $this->info("Linux release {$release->version} ({$release->source}).");

            return self::SUCCESS;
        }

        if ($releases->failing()) {
            $this->warn('GitHub has no Linux release on this channel yet, or did not answer. Serving the last good copy, or platforms.json.');

            return self::FAILURE;
        }

        $this->line('Another refresh is running. Nothing to do.');

        return self::SUCCESS;
    }
}
