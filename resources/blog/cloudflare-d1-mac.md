---
slug: cloudflare-d1-mac
title: A Native Cloudflare D1 Client for Mac
description: Browse and query D1 databases from a real desktop app. No wrangler, no terminal, no web console.
date: 2026-05-15
author: TablePro Team
tags: [cloudflare-d1, sqlite, edge]
ogPunchline: D1 without wrangler. Real GUI on the Mac.
---

Cloudflare D1 launched in 2022 and went GA in 2024. It is SQLite at the edge: every database lives in a Worker, replicates across the globe, and exposes a small REST API. The official tooling is `wrangler`, the Cloudflare dashboard, and the API. There is no first-party desktop GUI.

If you only manage one or two D1 databases, that's fine. Once you have a dozen, jumping between `wrangler d1 execute`, the dashboard, and the API gets old fast. This post walks through what we built and why a native Mac client makes D1 work feel less like an experiment.

## What D1 actually exposes

D1's REST API surface is small. You get four useful endpoints:

- `POST /accounts/:id/d1/database` — create a database
- `GET /accounts/:id/d1/database/:name` — get database details
- `POST /accounts/:id/d1/database/:name/query` — run SQL
- `POST /accounts/:id/d1/database/:name/raw` — run SQL with raw row format

Authentication is a Cloudflare API token with the `D1:Edit` permission. That is the entire surface a desktop client needs.

## What's missing in `wrangler`

Wrangler is great for CI and one-off commands. It is bad as a daily driver:

- Every query is a fresh process start. Spin-up time dominates short queries.
- Output is text. You cannot sort, filter, or scroll a million rows.
- Editing a row means hand-writing UPDATE statements and counting backticks.
- Multi-database work means a `wrangler.toml` per project or a stack of CLI args.
- There is no schema browser. You either remember your tables or `PRAGMA table_info` them one at a time.

The Cloudflare dashboard fixes some of these but adds latency. Every query is a round trip to the dashboard's UI before it hits D1.

## What a native client adds

TablePro talks to D1 directly through the REST API. The token sits in the macOS Keychain. The Mac app keeps a long-lived HTTP connection per account, so queries return in 80–150 ms once the database is warm.

A few things that matter day to day:

- **One sidebar, every database.** The first call after auth lists every D1 database in your account. No project-scoped config.
- **A real grid.** Million-row results stream into the data grid. Sort, filter, edit cells, copy as CSV.
- **Capacity is visible.** Every query returns `rows_read`, `rows_written`, and `duration_ms`. You see expensive scans before they hit production.
- **Sessions for read consistency.** D1 supports session tokens for read-after-write across multiple statements. The client uses them automatically when you run a multi-statement script.
- **Schema browser.** Tables, indexes, triggers, all there. Click a column to see its type and constraints without a `PRAGMA` round trip.

## The bits that surprised us

D1 is SQLite, but it is not full SQLite. A few things will trip you up if you write SQL in a regular SQLite client and paste it into D1:

- `ATTACH DATABASE` is rejected. Each D1 database is a unit; you cannot cross-reference others in a single query.
- Some pragmas are stubbed. `PRAGMA foreign_keys = ON` is silently a no-op (foreign keys are always enforced in D1).
- Recursive CTEs work but are capped at 100 ms of compute. Large recursive queries get killed.
- `BEGIN` / `COMMIT` are not supported as standalone statements. Use the API's transaction batching or accept implicit single-statement transactions.

The client highlights these as warnings in the editor before you run the query. You still hit them sometimes. Knowing in advance helps.

## Sessions: the underrated feature

D1's session API is the one feature that makes multi-statement workflows safe. Without it:

```sql
INSERT INTO orders (...) VALUES (...);
SELECT id FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1;
```

The two queries can hit different replicas. The SELECT may return stale data and miss the row you just inserted. With a session token (`d1-session: <token>`), both statements route to the same replica and read-your-writes works.

The client opens a session per query tab automatically. Cross-tab queries do not share a session, which mirrors how D1 expects you to scope work.

## When D1 is not the right call

Two warnings before you migrate everything:

1. **Heavy writes.** D1 is good at edge reads. Heavy concurrent writes (>1000 inserts/sec from many regions) will hit limits. Postgres remains a better default for write-heavy workloads.
2. **Long-running queries.** D1 has a hard timeout on the order of seconds. Analytical workloads belong in BigQuery, ClickHouse, or DuckDB. Use D1 for transactional work.

For everything else (per-tenant data, configuration, blog content, session storage, edge metadata), D1 is the lightest thing you can run that gives you SQLite at the edge.

## Connecting in TablePro

Three steps:

1. Generate a Cloudflare API token at `dash.cloudflare.com/profile/api-tokens` with the `D1:Edit` permission.
2. Open TablePro, click **New Connection**, pick **Cloudflare D1**.
3. Paste your Account ID and the token. Click **Connect**.

Every D1 database in the account shows in the sidebar. Cmd+K switches between them. No config file.

If you already use TablePro, the D1 plugin is in the registry: **Settings → Plugins → Cloudflare D1**.
