---
slug: tablepro-0-67
title: "TablePro 0.67: Charts, Code Folding, and Statement-Level Runs"
description: Query results now draw as native charts. The SQL editor folds and runs one statement at a time. Cmd+F searches your results instead of toggling the filter panel. Plus Redis Cluster, nested MongoDB filters, and 144 fixes.
date: 2026-08-21
author: TablePro Team
tags: [release, sql-editor, charts, mongodb, redis, duckdb, mcp]
ogPunchline: Charts in the results pane. Folding in the editor. Cmd+F that actually searches.
---

TablePro 0.67 is out: 200 changes, 144 of them fixes.

Almost all of it lands in two places, the SQL editor and the results pane.

<figure>
  <img src="/images/blog/results-chart-mode.png" alt="TablePro results pane in Chart mode with the Bar type selected, X Axis set to Row Number and Y Axis to ArtistId, a hover tooltip reading Row Number 140 and ArtistId 99, and the status bar still showing 1-347 of 347 rows" />
  <figcaption>Chart mode sits beside Data, Structure and JSON.</figcaption>
</figure>

## Charts

Results draw as bar, line, area and scatter charts without leaving the tab. Pick a numeric Y column. X can be row numbers, another numeric column, a date, or a category, and a text, boolean, enum or set column splits the result into series.

Date columns plot on a real time axis. A three-month gap looks like three months.

Chart type and axes belong to the tab and follow the column names, so they survive a page turn, a sort and a re-run.

The ceiling is 2,000 points, 20 series, 50,000 rows inspected. Past any of them the chart draws what fits and says so: "Showing the first 2,000 points of 8,431 loaded rows."

Needs a license. Both tiers include it.

## The editor folds

<figure>
  <img src="/images/blog/sql-editor-code-folding.png" alt="TablePro SQL editor showing three folded regions, each collapsed to a chip naming its opening line and hidden line count, with a peek popover open over the folded CREATE TABLE and its full body syntax highlighted inside" />
  <figcaption>A folded region becomes a chip. Hover it to peek without expanding.</figcaption>
</figure>

Chevrons in the gutter collapse statements, table bodies, CTEs, subqueries, `BEGIN` blocks and block comments.

A folded region becomes a chip naming its opening line and how many lines it hides. Hover the chip and you get the whole block, syntax highlighted, without expanding it.

Folds survive closing and reopening a tab. Strings, comments and PostgreSQL dollar-quoted bodies are never read as structure, so a `(` inside a string doesn't open one.

`Cmd+Option+Left` toggles a fold, `Cmd+Option+Shift+Left` folds everything. It works in the DDL and trigger views, the SQL import preview, the AI review sheet and the JSON cell viewer too.

## Run one statement at a time

<figure>
  <img src="/images/blog/sql-editor-statement-run.png" alt="TablePro SQL editor gutter with a run control beside each statement and a faint band over the statement at the cursor" />
  <figcaption>Click any statement's run control, wherever the cursor happens to be.</figcaption>
</figure>

The statement under your cursor gets a faint background, so you can see what `Cmd+Enter` will send. Hover the gutter and a run button appears beside every statement.

`Ctrl+Cmd+Enter` runs the statement you're in and moves to the next. `Ctrl+Cmd+Left` and `Ctrl+Cmd+Right` step between them without running anything.

Results are named after the statement that produced them instead of "Result 1", and clicking a result jumps the cursor back to its statement.

`BEGIN ... END` bodies also run whole now. The editor used to split them at every semicolon inside, so Execute All sent a fragment and the database rejected it. Importing the same file always worked, which is why this took so long to pin down.

## Cmd+F searches your results

<figure>
  <img src="/images/blog/data-grid-find-bar.png" alt="TablePro data grid on the Customer table with the find bar open on the term rua, the counter reading 2 of 3, and the matching cell Rua da Assuncao 53 highlighted in the Address column" />
  <figcaption>Matching ignores case and accents, so rua finds Rua da Assunção.</figcaption>
</figure>

Type, and the matching cell is highlighted and scrolled to. Case and accent insensitive.

A grid is paginated at the database, so the counter says which it means:

| Counter | Means |
|---|---|
| `3 of 12` | Every row is loaded. This is the whole table |
| `3 of 12 on this page` | More rows exist that were never fetched |
| `Not on this page` | Nothing loaded matches, and more rows exist |

When the page comes up empty and rows remain, Search All Rows turns the term into a server-side filter.

One thing to know if you're upgrading: `Cmd+F` used to toggle the filter panel. The panel keeps `Cmd+Option+F`.

## MongoDB filters reach inside a document

Filter on `customer.country` or `items.sku`, picked from the paths found in the collection rather than typed from memory.

<figure>
  <img src="/images/blog/mongodb-nested-filter.png" alt="TablePro filter panel on a MongoDB collection with a nested field path selected from the column list" />
  <figcaption>Nested paths sit in the column list. A button beside it opens the full searchable set.</figcaption>
</figure>

A field inside an array gets a scope control.

<figure>
  <img src="/images/blog/mongodb-array-element-scope.png" alt="TablePro filter panel on a MongoDB orders collection with two rows, items.price greater than 500 and items.name equals Laptop, and the two matching orders listed in the grid below" />
  <figcaption>Two conditions on fields inside one array. The scope control decides whether a single item has to satisfy both.</figcaption>
</figure>

Any element lets each condition match a different entry. Same element makes them all match one. That is the difference between "an item over $500 and an item named Laptop" and "one item that is both", and it is the query people usually open an aggregation pipeline to write.

## Also new

- Closing a tab holding unsaved cell edits, staged structure changes or a modified `.sql` file asks first. Cell edits used to disappear with nothing to recover them, not even Reopen Closed Tab.
- Editing a cell in a result you clicked back to writes to that result's own table. It used to write to whichever statement finished last, silently.
- Redis Sentinel and Redis Cluster, as Connection Modes in the form. Cluster routes each command to the shard owning its key and follows MOVED and ASK redirects.
- DuckDB opens a Parquet, CSV, TSV, JSON or NDJSON file read-only, no `.duckdb` database required.
- MCP grew from 19 tools to 46, with prompt templates built from the live schema and completion that returns your real table names.
- A read-only MCP token can no longer run a `DO` block, `COPY`, `ATTACH` or `VACUUM INTO`. Anything unrecognised now counts as a write.

**Breaking:** MCP remote access is gone. The server binds to this Mac only. Its certificate named only localhost, so no other machine could ever have verified it.

## What's still missing

The find bar searches loaded rows, not the table. Search All Rows covers that, but only when you have no filters set, because it replaces them with your term.

Charts draw loaded rows too. Nothing aggregates behind them, so a chart over a 10 million row table is a chart over the page you loaded.

## Getting it

**TablePro > Check for Updates**, or [download it](/download).

On MongoDB, DuckDB, Oracle or Dameng, update those plugins as well. Registry plugins are notarized as of this release, which clears the Gatekeeper error that read like a database TablePro couldn't reach.

The [full changelog](https://docs.tablepro.app/changelog) has all 200 entries.
