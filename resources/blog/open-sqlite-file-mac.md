---
slug: open-sqlite-file-mac
title: "How to open and query a SQLite file on a Mac"
description: Open a .db or .sqlite file with the sqlite3 shell macOS already has, or in TablePro, and what to do when macOS or a lock keeps the file closed.
date: 2026-10-08
author: TablePro Team
ogPunchline: sqlite3 in Terminal, or drag the file onto TablePro.
tags: [sqlite, database-files, sql-editor]
---

A SQLite database is one file. There is no server to start and no user to log in as, so "connecting" means opening the file. macOS ships with a command-line shell that does it, and a GUI adds a table browser and an editor on top.

## Check that the file is SQLite {#check-the-file}

The extension proves nothing. `.db` is used by many formats, and plenty of SQLite files have no extension at all. Ask the file:

```bash
file ~/Downloads/app.db
```

A SQLite database starts with the bytes `SQLite format 3`, and `file` reports it as such.

If the folder also holds `app.db-wal` and `app.db-shm`, they belong to the database. Recent writes may still be in the `-wal` file, so copy or move all three together.

## Open it with sqlite3 {#sqlite3}

```bash
sqlite3 ~/Downloads/app.db
```

Inside the shell, dot commands inspect the file and anything else is SQL:

```text
.tables
.schema users
.headers on
.mode column
SELECT id, email FROM users LIMIT 10;
.quit
```

To look without any chance of writing, open it read-only: `sqlite3 -readonly ~/Downloads/app.db`.

Some databases worth knowing about on a Mac:

| Source | Path |
|---|---|
| Rails | `db/development.sqlite3` in the project |
| Django | `db.sqlite3` in the project |
| iOS Simulator | Under `~/Library/Developer/CoreSimulator/Devices/`, in the app's data container |
| Safari history | `~/Library/Safari/History.db` |
| Messages | `~/Library/Messages/chat.db` |

The last two sit in folders macOS protects. See [If it does not open](#troubleshooting).

## Open it in TablePro {#in-tablepro}

Any of these opens the file:

- Drag it onto a TablePro window or onto the Dock icon.
- Choose **File > Open File…** (`Cmd+O`) and pick it.
- In Finder, right-click it and choose **Open With > TablePro**. Files ending in `.db`, `.db3`, `.s3db`, `.sl3`, `.sqlite`, `.sqlite3` and `.sqlitedb` list TablePro there.

A database saved under another name opens too, by dragging it or through **Open File…**. TablePro reads the first bytes of the file to decide, the same way `file` does.

To keep the file in your connection list:

1. Click **New Connection…** on the welcome window, or press `Cmd+N`, and pick **SQLite**.
2. Click **Browse…** and choose the file. There is no host, port or password to fill in.
3. Click **Save & Connect**.

**New…** beside **Browse…** names a file that does not exist yet. It is created when you connect, which gives you an empty scratch database.

No file at hand? **Help > Open Sample Database** opens a bundled SQLite database to try things on.

TablePro uses its own bundled SQLite, so the library version that came with your macOS does not matter.

## Browse and query {#browse-and-query}

The sidebar lists the file's tables and views and leaves out the internal `sqlite_*` tables. Click a table to see its rows, and switch the view to **Structure** for its columns, indexes, foreign keys and DDL.

Press `Cmd+T` for a query tab and `Cmd+Enter` to run the statement the cursor is in:

```sql
SELECT name, sql FROM sqlite_master WHERE type = 'table';

PRAGMA table_info(users);

SELECT strftime('%Y-%m', created_at) AS month, count(*)
FROM users
GROUP BY month
ORDER BY month;
```

To query a second file next to the first, attach it:

```sql
ATTACH '/Users/me/Downloads/other.db' AS other;
SELECT * FROM other.orders LIMIT 10;
```

Edits in the grid are staged. Nothing is written until you save, and **Preview SQL** (`Cmd+Shift+P`) shows the statements first.

If another program changes the file, the table list reloads on its own. Rows already loaded in a tab stay as they were until you refresh that tab.

## A file on a server {#remote-file}

A SQLite file on a machine you reach over SSH opens without copying it by hand. In the connection form, open the **Network** tab and set **Connect via** to **Remote Database File**, then fill in the **Path** on the server and the SSH details. The **Open** menu has two choices:

- **On the Server** runs your statements on the server against the live file. The server needs `python3`.
- **As a Read-Only Copy** copies the file to your Mac and opens the copy read-only. The original is never written to.

## Where it stops {#limits}

- Encrypted database files do not open. Decrypt the file with the tool that encrypted it first.
- One connection is one file. An attached database can be queried as `alias.table`, but it does not appear in the sidebar.
- SQLite's `ALTER TABLE` can rename a table or a column and add or drop a column. Other structure changes, such as a new column type or a foreign key, are made by rebuilding the table. TablePro shows that script in full and runs it only when you confirm.
- A primary key cannot be added, removed or moved.
- A database built with an extension such as sqlite-vec or SpatiaLite cannot be read until that extension is added to the connection, under **Options**.

## If it does not open {#troubleshooting}

- **unable to open database file**: the path is wrong, or the folder is one the app may not read. Files under `~/Library`, such as the Safari and Messages databases, need Full Disk Access: turn it on for TablePro, or for Terminal if you use `sqlite3`, in **System Settings > Privacy & Security > Full Disk Access**, then relaunch the app.
- **database is locked**: another process holds a write lock. Quit the app that owns the file.
- **file is not a database**: the file is encrypted or is not SQLite. Run `file` on it again.

The docs cover extensions, remote files and every error message on the [SQLite page](https://docs.tablepro.app/databases/sqlite). On this site, the [SQLite client page](/sqlite-client) lists what TablePro does with a SQLite database, and [Files that are databases](/features/import-export#files) covers the other file types: DuckDB reads Parquet and CSV files as read-only views, and CSV, JSON and Excel files open in a window of their own.
