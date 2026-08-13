<?php

use App\Console\Commands\GenerateSitemapCommand;
use Illuminate\Support\Facades\Schedule;

/*
 * The sitemap is regenerated on the host because it carries a lastmod date.
 *
 * OG cards are deliberately NOT scheduled here: they are committed to
 * public/og, so a scheduled run would rewrite tracked files and leave the
 * deploy checkout dirty. They are regenerated in CI instead — see
 * .github/workflows/og.yml.
 */
Schedule::command(GenerateSitemapCommand::class)->daily();
