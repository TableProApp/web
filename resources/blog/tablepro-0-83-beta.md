---
slug: tablepro-0-83-beta
title: "TablePro 0.83 Beta: Search Database and Generate Rows"
description: The 0.83 beta adds Search Database, Generate Rows and a tablepro query command for Terminal. Turn on Get beta updates to try it before 0.83.0.
date: 2026-10-23
release: "TablePro 0.83 beta"
author: TablePro Team
tags: [release, mcp, ssh, import]
ogPunchline: Find a value in every table, fill one with test rows, and run SQL from Terminal.
---

TablePro 0.83.0-beta.2 is out for testing. Only Macs with **Get beta updates** on are offered it, and the stable 0.83.0 comes after the betas.

Search Database finds a value in every table, Generate Rows fills a table with test data, and `tablepro query` runs SQL from Terminal. Grid saves refuse an `UPDATE` or `DELETE` without a `WHERE`, and SSH tunnels drop SHA-1 and other old algorithms.

<asset-slot id="blog-tablepro-0-83-beta-1"></asset-slot>

## Search Database

Choose **Database > Search Database…**, or right-click a database or schema in the sidebar, and type a value: an email address, an order number, a UUID. TablePro runs one `SELECT` per table and lists the tables that hold it, with the matching columns and a row count. Open one and it comes up in a new tab, filtered to those rows.

Text columns are always searched, and number, date and UUID columns when the value reads as one. Counting stops at 1,000 rows per table, and **Stop** keeps what was found so far.

## Generate Rows

Right-click a table and choose **Generate Rows…** to fill it with 1 to 1,000,000 made-up rows. Each column gets a generator from its type and name: example-domain addresses for an `email` column, an enum's own labels, an existing key for a foreign key. The preview shows the first 10 rows before anything runs.

<asset-slot id="blog-tablepro-0-83-beta-2"></asset-slot>

Keys and unique columns never repeat, and the same seed and settings give the same rows. **Generate** inserts in one transaction, so **Cancel** rolls the run back on any engine with transactions. Safe Mode treats it like any other write.

## Queries from Terminal

`tablepro query` runs one statement through the app and prints the rows as CSV, TSV, JSON, JSON Lines or a table:

```bash
tablepro query -c Staging --format csv "SELECT id, email FROM users LIMIT 5" > users.csv
```

It talks to the app's MCP server, so turn on **Enable MCP Server** in **Settings > MCP** first. The first run asks you to pair it, starting at **Read Only**. **Settings > General > Command Line** shows how to link `tablepro` into your `PATH`, and [the docs](https://docs.tablepro.app/integrations/terminal) cover the options and exit codes.

## Also in the beta

- **View > Compare Result With…** matches two query results row by row, on key columns or whole rows
- Import a CSV, JSON or XLSX file into an existing table as **Update**, **Insert or Update** or **Insert, Skip Existing**, or import a folder of files in one run
- **Pin Tab** keeps a tab open through **Close Other Tabs**, **Close All Tabs** and a relaunch
- **Freeze Up to This Column** in the grid's header menu keeps leading columns in view
- Edit the schema from the ER diagram, and export the diagram as SVG, PDF, Mermaid or Graphviz DOT
- Inline suggestions and Review, Explain, Optimize and Fix can run on Apple Intelligence, on macOS 26 and later
- Emacs key bindings, under **Settings > Editor > Key bindings**, which replaces the Vim mode switch
- Kerberos sign-in for PostgreSQL and MariaDB, and Presto connections through the Trino plugin

## Changes to check

**SSH tunnels no longer offer SHA-1 key exchange, `ssh-rsa` signatures, SHA-1 and MD5 MACs, or 3DES, Blowfish and RC4 ciphers.** A server that offers only those fails with an error naming them.

A grid save stops before it sends an `UPDATE` or `DELETE` with no `WHERE` clause. A delete's confirmation lists the rows that foreign keys delete, rewrite or protect in other tables.

## What it will not do

- `tablepro query` returns the whole result at once, up to the MCP row limit, and refuses `DROP` and `TRUNCATE`
- Search Database needs SQL, and skips Cassandra, ScyllaDB and DynamoDB
- The iOS app isn't in this beta, though the release notes list its changes

## Getting the beta

Select **Get beta updates** in **Settings > General**, then choose **TablePro > Check for Updates…**. The DMG and the full notes are on the [GitHub release](https://github.com/TableProApp/TablePro/releases/tag/v0.83.0-beta.2).

To go back, deselect **Get beta updates**. The beta stays until 0.83.0 replaces it, and [Beta updates](https://docs.tablepro.app/beta-updates) covers installing the stable release over it sooner. Report a problem in a [GitHub issue](https://github.com/TableProApp/TablePro/issues), with the version from **TablePro > About TablePro**.
