<?php

use App\Console\Commands\GenerateSitemapCommand;
use App\Console\Commands\RefreshMacReleaseCommand;
use App\Console\Commands\RefreshStarCountCommand;
use Illuminate\Support\Facades\Schedule;

/*
 * The sitemap is regenerated on the host because it carries a lastmod date.
 *
 * The Mac release behind the download buttons and the star count in the
 * header are fetched here and nowhere else: a page only reads what the last
 * run stored, so no reader waits on GitHub (App\Services\Releases\MacReleaseService,
 * App\Services\GitHub\StarCount). That is five calls an hour against GitHub's
 * unauthenticated limit of 60, on a host shared with other sites.
 *
 * All three need the server's cron to run `php artisan schedule:run` every minute
 * (docs/deployment.md, "The scheduler").
 *
 * OG cards are deliberately NOT scheduled here: they are committed to
 * public/og, so a scheduled run would rewrite tracked files and leave the
 * deploy checkout dirty. They are regenerated in CI instead — see
 * .github/workflows/og.yml.
 */
Schedule::command(GenerateSitemapCommand::class)->daily();

Schedule::command(RefreshMacReleaseCommand::class)->everyFifteenMinutes();

Schedule::command(RefreshStarCountCommand::class)->hourly();
