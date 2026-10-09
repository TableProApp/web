---
slug: import-csv-postgresql-mysql
title: "Import a CSV file into PostgreSQL or MySQL"
description: Load CSV data with PostgreSQL’s \copy, MySQL’s LOAD DATA or TablePro. Map columns, create a table from a file and choose how to handle errors.
date: 2026-10-08
author: TablePro
ogPunchline: \copy, LOAD DATA, or an import with column mapping.
tags: [postgresql, mysql, import, data-files]
---

Use PostgreSQL’s `\copy`, MySQL’s `LOAD DATA` or TablePro to import CSV rows. The command-line loaders need a matching table first; TablePro can also create one from the file.

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

## Import in TablePro {#in-tablepro}

TablePro reads the local file and inserts rows through your database connection. It needs neither `local_infile` nor a copy on the server.

1. Open the connection.
2. Choose **File > Import > Import Data…** (`Cmd+Shift+I`) and pick the `.csv` or `.tsv` file. The extension picks the format. For a CSV saved as `.txt` or with no extension, use **File > Import > Import Data From** and name the format.
3. Check the parsing options. **Delimiter** and **Encoding** start on **Auto-detect**. **First row is a header** is on, and **Treat empty values as NULL** is on. **NULL text** adds one more value to read as NULL, such as `\N`.
4. Pick a **Destination**: **Existing table** and choose it under **Import into**, or **New table**.
5. Map the fields, then click **Import**.

Changing a parsing option reads the file again, and a field that is still there keeps the column it was mapped to.

### Map the fields {#mapping}

Fields are matched to columns by name, ignoring case. Unmatched fields start on **Skip**. Use each field’s checkbox and column menu, or **Match Columns**:

- **Match by Name**: each field to the column of the same name.
- **Match by Position**: the first field to the first column, and so on.
- **Use Saved Mapping**: the mapping you used for this table last time.

Clicking **Import** saves custom mappings for that table on this Mac. The next import restores them and shows **Restored the mapping saved for** with the table name.

### Create a table from the file {#new-table}

**New table** uses the lowercase filename, replacing spaces and punctuation with underscores. Existing names get a suffix: a second `orders.csv` proposes `orders_2`. Edit each column’s name, type, primary key, nullable flag and default before creating the table.

Types are inferred from every row, not a sample. One non-numeric value can make an otherwise numeric column text; check the file if the inferred type looks wrong.

### Choose error handling {#errors}

| Option | Default |
|---|---|
| **On error**: **Stop and Rollback**, **Stop and Commit** or **Skip and Continue** | **Stop and Rollback** |
| **Wrap in transaction (BEGIN/COMMIT)** | On |
| **Delete existing rows before import** | Off |

With the defaults, one bad row stops the import and nothing stays in the table. **Delete existing rows before import** empties the table inside the same transaction, so a rollback brings the old rows back too. **Skip and Continue** runs without a transaction and logs each failure; **Save Report…** writes them to a CSV with the line, the statement and the database's error.

Quoted fields keep embedded commas and line breaks, and `""` inside quotes reads as one quote. A line the chosen encoding cannot read stops the import before any row is deleted or inserted, and the error names the line.

## Clean the file first {#clean-first}

To trim whitespace, remove duplicates or split a column, use **File > Open File…** first. The standalone window has a grid, filters and find and replace. Choose **Edit > Data > Import into Table…** and a connection to import those rows, including unsaved edits.

That is also the route for a compressed `.csv.gz`, which **Import Data…** does not read.

## Limitations {#limits}

- An Excel `.xlsx` workbook imports its first worksheet only.
- On a connection at the **Read-Only** Safe Mode level, import is turned off. At the **Alert** and **Safe Mode** levels it asks before it writes.
- MySQL's `LOAD DATA LOCAL INFILE` typed into the editor is refused by TablePro's driver. Use **Import Data…** instead.
- Into an existing table, each field goes to a column the table already has, or is skipped.

## Troubleshooting {#troubleshooting}

- **Every value lands in one column**: the delimiter was guessed wrong. Set **Delimiter** by hand.
- **Accented or Japanese text arrives garbled**: the file is not in the encoding that was picked. Set **Encoding** to the one it was saved in, such as Windows-1252 or Shift JIS.
- **A date or number column rejects rows**: the database could not read the value as that type. Import into a text column, or into a new table, and convert with SQL afterwards.

See [Import & Export](https://docs.tablepro.app/features/import-export) for JSON and Excel options, and [Data Files](https://docs.tablepro.app/features/data-files) for file editing. Feature overviews: [import](/features/import-export#import), [PostgreSQL](/postgresql-client) and [MySQL](/mysql-client).
