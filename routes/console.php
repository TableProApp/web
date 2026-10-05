<?php

use App\Console\Commands\GenerateSitemapCommand;
use App\Console\Commands\RefreshMacReleaseCommand;
use Illuminate\Support\Facades\Schedule;

/*
 * The sitemap is regenerated on the host because it carries a lastmod date.
 *
 * The Mac release behind the download buttons is fetched here and nowhere
 * else on a schedule: a page only reads what the last run stored, so no reader
 * waits on GitHub (App\Services\Releases\MacReleaseService). Every 15 minutes
 * is four calls an hour against GitHub's unauthenticated limit of 60.
 *
 * Both need the server's cron to run `php artisan schedule:run` every minute
 * (docs/deployment.md, "The scheduler").
 *
 * OG cards are deliberately NOT scheduled here: they are committed to
 * public/og, so a scheduled run would rewrite tracked files and leave the
 * deploy checkout dirty. They are regenerated in CI instead — see
 * .github/workflows/og.yml.
 */
Schedule::command(GenerateSitemapCommand::class)->daily();

Schedule::command(RefreshMacReleaseCommand::class)->everyFifteenMinutes();
