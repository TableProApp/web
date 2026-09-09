---
slug: tablepro-0-70
title: "TablePro 0.70: Follow a Foreign Key Without Writing the Join"
description: The row inspector gets a JSON tab where a foreign key expands into the row it points at, five levels deep. Plus a real JavaScript shell for MongoDB, column reorder on six more engines, cross-connection database copy, and 31 fixes.
date: 2026-09-01
author: TablePro Team
tags: [release, json, mongodb, column-reorder, sqlite]
ogPunchline: Click a foreign key. Get the row. Five levels down.
---

TablePro 0.70 is out: 58 changes, 31 of them fixes.

Most of it lands in three places: reading a row, querying MongoDB, and moving columns around.

<figure>
  <img src="/images/blog/json-row-inspector-fk.png" alt="TablePro row inspector with the JSON tab selected, showing the selected order row rendered as formatted JSON with syntax colouring, its customer_id field expanded inline into the full customer row it references, and that row's country_id expanded one level further into a countries row, with a filter field above the tree" />
  <figcaption>A foreign key expands in place into the row it points at, and that row's keys expand too.</figcaption>
</figure>

## The row as JSON

The inspector gains a JSON tab. It shows the selected row as formatted JSON, and **Show Row as JSON** on a row's right-click menu opens it directly.

The part worth having is the foreign keys. Click one and TablePro fetches the row it references and expands it inline, so you read the order, its customer and that customer's country without leaving the grid or writing a join. It follows a chain five levels deep.

A row that references itself is ordinary schema design, so the chain is checked rather than trusted: `employee.manager_id → employee` would otherwise expand forever. TablePro stops on a repeat and says so on the node.

**Always Expand Foreign Keys** turns off the first click. It fetches one level, not five, because the setting exists to save a click and not to walk your schema on every selection change.

The filter field above the tree takes plain text, or a regular expression if you wrap it in slashes.

## A JavaScript shell for MongoDB

MongoDB queries in TablePro used to be parsed as a filter document. Now they run as JavaScript, with the `db` API you already use in mongosh: collections, cursors, `var`, functions, and `print`.

```js
var cutoff = new Date("2026-01-01");
db.orders.find({ created: { $gt: cutoff } }).sort({ total: -1 }).limit(20)
```

Each connection keeps its own runtime, so `cutoff` is still there in the next statement, exactly as it is in a shell. `use` switches the database the same way. Autocomplete offers the cursor methods after `find()` and `aggregate()`.

<figure>
  <img src="/images/blog/mongodb-javascript-shell.png" alt="TablePro query editor connected to MongoDB with a multi-statement JavaScript script, a var declaration on the first line and a db.orders.find chain with sort and limit below it, the autocomplete popup open after a find call listing cursor methods, and the resulting documents in the grid underneath" />
  <figcaption>Statements share a runtime, so a variable defined on one line is still defined on the next.</figcaption>
</figure>

Documents cross into the shell as JSON text rather than as rebuilt objects, because BSON field order decides how an embedded document compares and where `_id` sits, and a document rebuilt from a dictionary comes back reordered.

Two side effects of the change: a script is split into the top-level statements of a JavaScript program rather than at semicolons, so a semicolon inside a function body no longer cuts a query in half, and the editor's diagnostics report JavaScript syntax errors instead of complaining about method names it did not recognise.

## Column reorder

Drag a column in the structure editor to move it. What runs underneath depends on what the engine has.

MySQL, MariaDB and ClickHouse have `MODIFY COLUMN … FIRST | AFTER`, so the catalog is rewritten and no row is read or written. Oracle has no positional clause at all, but cycling a column invisible and back moves it to the end, and that composes into any order you want.

PostgreSQL, SQLite, libSQL, Turso and Cloudflare D1 have nothing positional. The order changes by recreating the table and copying the rows into it, so TablePro shows you the whole script and waits before running any of it.

<figure>
  <img src="/images/blog/column-reorder-rebuild-preview.png" alt="TablePro structure editor with a column being dragged into a new position, and a sheet in front of it listing the full table rebuild script for SQLite line by line, the CREATE TABLE with the new column order, the INSERT SELECT that copies the rows, the DROP and the RENAME, with Run and Cancel buttons" />
  <figcaption>Where the engine has no positional DDL, the rebuild is shown in full before anything runs.</figcaption>
</figure>

**Move Column Up** and **Move Column Down** are on the column's right-click menu for the same thing without the drag. On an engine that cannot reorder at all, the row number carries the reason instead of the menu going quiet.

## Copy a database to another connection

**Copy To…** and **Duplicate Database…** are in the Database menu and on the sidebar's right-click menu. Pick a target connection, database or schema and TablePro carries the structure, the data, or both.

The target does not have to be the same server, or the same engine's other instance. The picker it shares with Compare & Sync now has a search field, which matters once you have more connections than fit on screen.

## Also new

- TablePro recognises SQLite and DuckDB databases by their contents rather than their name, so a file called `data.bin` still opens.
- `.parquet` files are in Finder's Open With, read through DuckDB, and **File > Open File…** opens anything TablePro reads.
- A file that needs a driver you do not have prompts to install it before opening.
- The tab strip can wrap onto more rows instead of scrolling, in **Settings > General > Tabs**. Dragging a tab now autoscrolls, and **Move Tab to New Window** pulls one out.
- The connections strip leads with the connection name and puts the database or schema underneath.
- `Up` and `Down` while editing a cell move the editor to the same column of the row above or below.
- Korean, Turkish, Vietnamese and Chinese translations for 742 strings that had been shipping in English.

## What it will not do

The MongoDB shell cannot be interrupted mid-script. JavaScriptCore's execution time limit is private and absent from the SDK headers, so cancellation happens when a script next calls into the driver, which covers every script that touches the database. One that spins without touching it is abandoned after 120 seconds of silence rather than left able to block the next run.

Foreign key expansion needs a foreign key declared in the schema. A relationship you keep by convention is not one TablePro can follow.

A table rebuild is a rebuild. On PostgreSQL, SQLite, libSQL, Turso and Cloudflare D1, reordering columns copies every row of the table, and the script is shown rather than hidden because that is a cost you should agree to on a large table.

## Getting it

**TablePro > Check for Updates**, or [download it](/download).

If you use MongoDB, Oracle, MSSQL, LibSQL or Cloudflare D1, update those plugins too. The shell and the column reorder ship in the driver. Turso runs on the libSQL plugin, so that is the one to update for it.

The [full changelog](https://docs.tablepro.app/changelog) has all 58 entries.
