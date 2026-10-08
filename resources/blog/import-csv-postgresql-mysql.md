---
slug: import-csv-postgresql-mysql
title: "How to import a CSV file into PostgreSQL or MySQL"
description: Load a CSV into a table with psql's \copy or MySQL's LOAD DATA, or in TablePro with column mapping, a new table built from the file, and one transaction.
date: 2026-10-08
author: TablePro Team
ogPunchline: \copy, LOAD DATA, or an import with column mapping.
tags: [postgresql, mysql, import, data-files]
---

Both servers have a bulk loader built in, and both want two things settled first: a table whose columns match the file, and a file the server or the client is allowed to read. This guide gives the plain commands, then the same import in TablePro.

## PostgreSQL: \copy {#postgresql}

Create the table, then load the file from `psql`:

```sql
CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer text,
  total numeric(10, 2),
  ordered_at date
);
```

```text
\copy orders (id, customer, total, ordered_at) FROM 'orders.csv' WITH (FORMAT csv, HEADER true)
```

`\copy` is a `psql` command, not SQL. It reads the file on your Mac and streams it to the server, so it works against a remote or hosted database. The SQL statement `COPY orders FROM '/path/orders.csv'` reads a path on the database server instead, and needs superuser or the `pg_read_server_files` role.

Useful options in the `WITH` list: `DELIMITER ';'` for semicolon files, `NULL ''` to read empty fields as NULL, and `ENCODING 'LATIN1'` for a file that is not UTF-8.

## MySQL: LOAD DATA LOCAL INFILE {#mysql}

```sql
LOAD DATA LOCAL INFILE 'orders.csv'
INTO TABLE orders
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(id, customer, total, ordered_at);
```

`LOCAL` reads the file from your Mac. MySQL 8 turns it off on the server by default, so it needs `local_infile=ON` on the server and the client started with `mysql --local-infile=1`. Without `LOCAL`, the server reads its own disk and `secure_file_priv` limits where. A file saved on Windows ends its lines with `\r\n`; say so in `LINES TERMINATED BY`.

## In TablePro {#in-tablepro}

TablePro's import reads the file on your Mac and inserts the rows over the connection you already have, so neither `local_infile` nor a file on the server comes into it.

1. Open the connection.
2. Choose **File > Import > Import Data…** (`Cmd+Shift+I`) and pick the `.csv` or `.tsv` file. The extension picks the format. For a CSV saved as `.txt` or with no extension, use **File > Import > Import Data From** and name the format.
3. Check the parsing options. **Delimiter** and **Encoding** start on **Auto-detect**. **First row is a header** is on, and **Treat empty values as NULL** is on. **NULL text** adds one more value to read as NULL, such as `\N`.
4. Pick a **Destination**: **Existing table** and choose it under **Import into**, or **New table**.
5. Map the fields, then click **Import**.

Changing a parsing option reads the file again, and a field that is still there keeps the column it was mapped to.

### Map the fields {#mapping}

Every field in the file gets a row with a checkbox and a column menu. A field named like a column, ignoring case, starts mapped to it. The rest start on **Skip**. **Match Columns** fills them all at once:

- **Match by Name**: each field to the column of the same name.
- **Match by Position**: the first field to the first column, and so on.
- **Use Saved Mapping**: the mapping you used for this table last time.

TablePro saves every choice that differs from the name match, per table, when you click **Import**. The next file into that table starts from it, and the sheet says **Restored the mapping saved for** and the table name. Saved mappings stay on this Mac.

### Or create the table from the file {#new-table}

With **New table**, the name comes from the file name, lowercased, with spaces and punctuation turned into underscores. A name that is taken gets a numeric suffix, so a second `orders.csv` proposes `orders_2`. Under it, each column has a name, a type, a primary key flag, a nullable flag and a default, all editable before anything is created.

Types are inferred from every row in the file, not a sample. A column that holds numbers in every row but one is typed as text, which is usually the hint that one row is malformed.

### When a row fails {#errors}

| Option | Default |
|---|---|
| **On error**: **Stop and Rollback**, **Stop and Commit** or **Skip and Continue** | **Stop and Rollback** |
| **Wrap in transaction (BEGIN/COMMIT)** | On |
| **Delete existing rows before import** | Off |

With the defaults, one bad row stops the import and nothing stays in the table. **Delete existing rows before import** empties the table inside the same transaction, so a rollback brings the old rows back too. **Skip and Continue** runs without a transaction and logs each failure; **Save Report…** writes them to a CSV with the line, the statement and the database's error.

Quoted fields keep embedded commas and line breaks, and `""` inside quotes reads as one quote. A line the chosen encoding cannot read stops the import before any row is deleted or inserted, and the error names the line.

## Clean the file first {#clean-first}

If the file needs work, such as trimming whitespace, removing duplicate rows or splitting a column, open it first with **File > Open File…**. It opens in a window of its own, with a grid, filters and find and replace, without a database. When it looks right, choose **Edit > Data > Import into Table…** and pick the connection. The import sheet opens with the rows as they are in that window, unsaved edits included.

That is also the route for a compressed `.csv.gz`, which **Import Data…** does not read.

## Where it stops {#limits}

- An Excel `.xlsx` workbook imports its first worksheet only.
- On a connection at the **Read-Only** Safe Mode level, import is turned off. At the **Alert** and **Safe Mode** levels it asks before it writes.
- MySQL's `LOAD DATA LOCAL INFILE` typed into the editor is refused by TablePro's driver. Use **Import Data…** instead.
- Into an existing table, each field goes to a column the table already has, or is skipped.

## If it does not import {#troubleshooting}

- **Every value lands in one column**: the delimiter was guessed wrong. Set **Delimiter** by hand.
- **Accented or Japanese text arrives garbled**: the file is not in the encoding that was picked. Set **Encoding** to the one it was saved in, such as Windows-1252 or Shift JIS.
- **A date or number column rejects rows**: the database could not read the value as that type. Import into a text column, or into a new table, and convert with SQL afterwards.

All the options, including JSON and Excel imports, are in the [Import & Export](https://docs.tablepro.app/features/import-export) docs, and the window for cleaning files is in [Data Files](https://docs.tablepro.app/features/data-files). On this site, see [importing files into a table](/features/import-export#import) and the [PostgreSQL](/postgresql-client) and [MySQL](/mysql-client) pages.
