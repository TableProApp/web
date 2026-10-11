---
slug: tablepro-0-80
title: "TablePro 0.80: Cloud SQL IAM Sign-In and MySQL Sockets"
description: Google Cloud IAM sign-in for Cloud SQL without the Auth Proxy, MySQL and MariaDB over a Unix socket, a map for one geometry value, and selection totals.
date: 2026-10-11
release: "TablePro 0.80"
author: TablePro Team
tags: [release, connections, mysql, postgresql, spatial]
ogPunchline: Cloud SQL signs in with IAM. MySQL takes a socket. Geometry opens on a map.
---

TablePro 0.80 is out: 132 changes, 89 of them fixes.

The new work is IAM sign-in for Cloud SQL and MySQL and MariaDB over a Unix socket. A single geometry value opens on a map, the cells you select get totals, and connection files carry saved queries. The largest groups of fixes are in PostgreSQL databases with a long list of schemas, iCloud sync, SQL Server values, value filters and connection import.

## Cloud SQL without the proxy

When a Cloud SQL instance is already reachable, over its private IP or an authorized network, you can sign in as an IAM principal and skip the Cloud SQL Auth Proxy. On the **General** tab, set **Authentication** to one of two options. **Google Cloud IAM (Application Default)** uses the credentials from `gcloud auth application-default login`. **Google Cloud IAM (Service Account)** takes a key, as a file path or pasted JSON. Set **Host** to the instance IP and **Username** to the principal's database user, and the password field leaves the form.

The token TablePro signs in with allows a Cloud SQL sign-in and nothing else, and lasts one hour. It is replaced five minutes before it expires, for a reconnect and for the extra connection MySQL opens to stop a query as well. SSL/TLS is raised to **Required** if it was set lower.

This works for MySQL and PostgreSQL. The instance needs IAM database authentication turned on, and the principal needs the **Cloud SQL Instance User** role and a database user of its own.

Google Cloud IAM sign-in is the work of [@i87ce](https://github.com/i87ce).

## MySQL and MariaDB over a socket

A server on your Mac listens on a socket file as well as a port, and one started with `skip-networking` listens only there. Set **Connect Using** to **Socket** and enter the file's path: `/tmp/mysql.sock` for Homebrew and the MySQL installer, `/Applications/MAMP/tmp/mysql/mysql.sock` for MAMP. On a server you can already reach, `SELECT @@socket;` prints it.

The note under the field says when nothing is at the path. **Save** still works, so you can set a connection up before its server starts. URLs take the same path, as in `mysql://root@localhost/shop?socket=%2Ftmp%2Fmysql.sock`, and backup and restore go through the socket too.

## One geometry value on a map

Select a row with a spatial column, open the inspector, and the field draws that one value on a map: a marker for a point, the path of a line, a polygon with its holes. **Text**, the other segment, holds the stored value in its editor, whether that is WKT, GeoJSON or the hex of WKB bytes. Edit it there and **Map** draws the edited value before you save.

**Fit to Geometry** frames the value again, and **Open in Window** gives the map a window of its own. GeoJSON in a JSON column gets the same field.

## Totals for the selection

Select two or more cells and the status bar shows their **Sum**, **Average** and **Count**. Click it for **Minimum** and **Maximum**, each with a copy button. Integer and decimal columns are summed and text columns are not, so a ZIP code such as `00501` never joins a total. The arithmetic is exact: `0.1` added ten times is `1`. For a whole column, right-click its header and choose **Select Column**.

## Connection files carry saved queries

Exporting connections writes their saved queries too, with folders and keywords. **Include Saved Queries** is on by default, and **Also include global saved queries** adds the ones every connection shows. An import reviews the connections, then the queries, before anything is saved. **File > Import > Import from Other App…** brings saved queries across from TablePlus, Sequel Ace, DBeaver, DataGrip and Beekeeper Studio in the same review.

**A connection file written by 0.80 opens only in 0.80 or later.** An older TablePro says the file needs a newer version, and a Linked Folder on an older version skips it, Team Catalog files included. Update every Mac that reads a shared folder before you publish to it again.

## Also new

- **Custom icons** for connections and groups, picked from a searchable set of symbols on the connection form's **Appearance** tab. **Edit Group…** in the welcome window changes a group's name, icon, color and parent in one sheet
- **Move Tab to Connection…** (`Ctrl+Option+Cmd+C`) takes a query tab to another connection with its SQL, cursor and parameters. Nothing runs on arrival
- **View > Filter Schemas…** chooses the schemas listed in the sidebar, Open Quickly, export and the column type picker
- A **+** button at the foot of the sidebar for **New Table**, **New View**, **New Schema**, **New Database** and **New Folder**
- Table comments in **Create Table** and **Structure**. **Edit Comment…** reaches MySQL, MariaDB, ClickHouse, CockroachDB, Redshift, SQL Server, Oracle and DuckDB
- The JSON and PHP viewer trees select rows and text, open http, https and mailto values as links, and show a swatch beside hex, `rgb()` and `hsl()` colors
- **Settings > MCP** replaces **Settings > Integrations**, and **TablePro > MCP Activity…** replaces **Integrations…**

## Fixes worth knowing about

- Saving or importing connections while the connection library could not be read replaced every saved connection
- Closing the only tab of a connection first opened from a link or the query history deleted its saved tabs
- Picking a database in the query editor reran the statement at the caret, writes included, without asking
- PostgreSQL was slow to connect, browse, search, commit and switch schema on a database with a long list of schemas
- SQL Server showed empty strings and binaries as NULL, which reverted an edit on save in a table without a primary key
- Duplicating a connection set to **Blocked** for external access made the copy readable over MCP

## What it will not do

IAM sign-in without the proxy needs a route to the instance: it opens no tunnel of its own. It covers MySQL and PostgreSQL, not SQL Server. `GOOGLE_APPLICATION_CREDENTIALS` from your shell profile is not read, so choose **Service Account** and give the key's path.

A socket connection offers only **Direct** under **Network**, since a tunnel cannot reach a file on your Mac. macOS caps a socket path at 103 bytes.

The map places longitude and latitude. A projected SRID such as 27700 or 32633 draws nothing until the query runs it through `ST_Transform(geom, 4326)`, and a curve type is named, not drawn. Totals cover loaded rows only: on a paged table, a selected column sums the rows on screen, and the popover says so.

Saved queries do not reach the iPhone: an import there skips the ones in a file. The iPhone and iPad app on the App Store is 1.0, which does not show custom icons.

## Getting it

TablePro checks for updates on its own, or choose **TablePro > Check for Updates…**, or download it from [tablepro.app](https://tablepro.app).

Plugin ABI 37 adds to the API without breaking it, so installed plugins keep loading. Update the BigQuery, Cassandra, Dameng, DuckDB, SAP HANA, MSSQL, Oracle, Snowflake, Spanner, Teradata and Trino drivers from **Settings > Plugins** to pick up their fixes.
