---
slug: connect-postgresql-mysql-docker-mac
title: "Connect to PostgreSQL or MySQL in Docker from your Mac"
seoTitle: "Connect to PostgreSQL or MySQL in Docker on a Mac"
description: Publish a Docker database port and connect from your Mac with psql, mysql or TablePro. Import connection settings from a Compose file.
date: 2026-10-08
author: TablePro
ogPunchline: Publish the port, connect to localhost, or read docker-compose.yml.
tags: [postgresql, mysql, project-folder]
---

Publish the container’s database port, then connect to `localhost` from your Mac. Use `psql`, `mysql` or TablePro; a Compose file can supply the connection settings.

## Publish the port {#publish-the-port}

```bash
docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:17
docker run --name mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8.4
```

`-p 5432:5432` maps port 5432 on your Mac to port 5432 in the container. The left number is the one you connect to. If a PostgreSQL from Homebrew already holds 5432, publish on another port, `-p 5433:5432`, and connect to 5433.

`-p 5432:5432` publishes on every network interface of your Mac. To keep the database off your local network, bind it to loopback: `-p 127.0.0.1:5432:5432`.

`docker ps` shows the mapping in its `PORTS` column, and `docker port pg` prints it for one container.

## Connect from the command line {#command-line}

```bash
psql "postgresql://postgres:secret@localhost:5432/postgres"
mysql -h 127.0.0.1 -P 3306 -u root -p
```

The official images create these accounts:

| Image | User | Password | Database |
|---|---|---|---|
| `postgres` | `postgres`, or `POSTGRES_USER` | `POSTGRES_PASSWORD` | Named after the user, or `POSTGRES_DB` |
| `mysql` | `root` | `MYSQL_ROOT_PASSWORD` | None, unless you set `MYSQL_DATABASE` |

Use `127.0.0.1` with the `mysql` client, not `localhost`. On a Mac it reads `localhost` as "use the Unix socket", and the container's socket is not on your Mac.

Without a client installed, run the one inside the container: `docker exec -it pg psql -U postgres`.

## Connect in TablePro {#in-tablepro}

1. Click **New Connection…** on the welcome window, or press `Cmd+N`, and pick **PostgreSQL** or **MySQL**.
2. On **General**, set **Host** to `localhost` and **Port** to the published port.
3. Fill in **Username** and **Password** from the table above. PostgreSQL also needs **Database**: `postgres` works on a fresh container. On MySQL you can leave **Database** empty and pick one later with `Cmd+K`.
4. Click **Test Connection**, then **Save & Connect**.

TablePro’s MySQL driver uses TCP, so `localhost` works here. MySQL 8’s `caching_sha2_password` needs no auth-plugin change. Enter `root` explicitly: an empty MySQL **Username** uses your macOS login name.

If you already have a connection string, skip the fields. Click **Import from URL…** at the bottom of the database type sheet, paste the URL, check the preview and click **Import**. The form opens filled in. A password with `@`, `#` or `%` in it needs percent-encoding first: `p@ss` becomes `p%40ss`.

## Import settings from a Compose file {#compose}

In a project, the same facts live in `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    ports:
      - "5432:5432"
```

The service name `db` resolves only inside the Compose network. From your Mac the address is still `localhost` and the published port.

To import the settings:

1. Choose **File > Import > Open Project Folder…** and pick the project folder.
2. The sheet lists one row per set of credentials it found, with the database type, host, port, user and database, and the file and key behind it. A Compose service appears with host `127.0.0.1` and its published port.
3. Select a row and click **Continue**. The connection form opens filled in. Nothing is saved and nothing connects until you click **Save**.

The scan reads `docker-compose.yml` and `compose.yaml`, and also `.env`, so a `${POSTGRES_PASSWORD}` in the Compose file is filled from the project's `.env`. Passwords are never displayed. A row says **Password found**, and the value goes to your Keychain when you save.

Two notes on a row tell you it may not connect:

- **No published port, may be unreachable**: the service has no `ports:` mapping.
- **Container service name, may be unreachable**: the host came from a `.env` value such as `DB_HOST=db`, which only resolves inside Docker. Change **Host** to `localhost` in the form.

## Limitations {#limits}

- One pass of **Open Project Folder…** imports one row. Run it again for the next service.
- Nothing is matched against the connections you already have, so importing the same row twice gives you two connections.
- Template files such as `.env.example` are skipped.
- TablePro does not start, stop or list containers. It connects to whatever is listening on the port.
- MySQL connections never use a Unix socket. Give the connection a host and a port.

## Troubleshooting {#troubleshooting}

- **Connection refused**: nothing is listening on that port. Check that the container is running and the port is published with `docker ps`.
- **Password authentication failed** on PostgreSQL, or **Access denied** on MySQL, with the password from your `docker run` line: `POSTGRES_PASSWORD` and `MYSQL_ROOT_PASSWORD` apply only when the data directory is first created. A container started on an existing volume keeps the password that volume was created with.
- **You connect, but to the wrong server**: another PostgreSQL or MySQL on your Mac holds the port. Publish the container on a different one.

See the [PostgreSQL](https://docs.tablepro.app/databases/postgresql) and [MySQL](https://docs.tablepro.app/databases/mysql) docs for connection fields. [Open Project Folder](https://docs.tablepro.app/features/project-folder-import) lists supported config files. The [PostgreSQL](/postgresql-client), [MySQL](/mysql-client) and [project import](/features/connections#project-folder) pages summarize TablePro’s features.

To load data next, see [CSV import](/blog/import-csv-postgresql-mysql).
