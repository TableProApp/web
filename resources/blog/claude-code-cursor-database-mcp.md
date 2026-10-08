---
slug: claude-code-cursor-database-mcp
title: "How to let Claude Code or Cursor query your database through MCP"
seoTitle: "Let Claude Code or Cursor query your database"
description: Connect Claude Code or Cursor to TablePro's MCP server, choose what each connection lets an agent do, and see where Safe Mode stops its writes.
date: 2026-10-08
author: TablePro Team
ogPunchline: Read Only by default. Safe Mode decides the rest.
tags: [mcp, postgresql, mysql]
---

A coding agent writes better SQL when it can read the schema instead of guessing it from your models. The Model Context Protocol (MCP) is how Claude Code, Cursor and other clients call tools outside themselves. TablePro on the Mac includes an MCP server that hands an agent your saved connections without handing it the passwords.

## What the client needs {#client-config}

An MCP client starts a server process and talks to it over stdin and stdout. TablePro ships that process inside the app as `tablepro-mcp`. It starts TablePro if it is not running, finds the port and carries the token, so the client's config holds one path and nothing else.

Claude Code takes it from the command line:

```bash
claude mcp add tablepro -- /Applications/TablePro.app/Contents/MacOS/tablepro-mcp
claude mcp list
```

The `--` separates Claude Code's own flags from the command it runs.

Cursor reads `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` in one project:

```json
{
  "mcpServers": {
    "tablepro": {
      "command": "/Applications/TablePro.app/Contents/MacOS/tablepro-mcp"
    }
  }
}
```

Restart Cursor after editing the file. If TablePro is installed somewhere other than `/Applications`, use that path.

## Turn it on in TablePro {#turn-on}

1. Open **Settings > Integrations** and turn on **Enable MCP Server**. **Status** reads **Running on port 23508**, or the port it took instead when that one is busy.
2. Click **Connect a Client…** and pick **Claude Code** or **Cursor**. The sheet shows the steps and a snippet with the path of your own install. TablePro does not edit other apps' config files, so paste it yourself.
3. Ask the client to list TablePro's tools, or to call `list_connections`. The list includes `list_connections`, `list_tables`, `describe_table` and `execute_query`.

The first time a client reaches one of your connections, TablePro asks on your Mac. **Approval**, under **Connection Access** in the same pane, decides how often it asks after that: **Ask Once for Each Connection** (the default), **Ask Every Time** or **Never Ask**. The question is a dialog on your Mac, never a prompt inside the client, so the client cannot answer it for you.

## Decide what each connection allows {#external-clients}

Every saved connection has its own setting. Edit the connection, open the **Options** tab, and under **Access** set **External Clients**:

| Level | What a client can do |
|---|---|
| **Blocked** | Nothing. The connection is not even listed. |
| **Read Only** | Read the schema and run reads. Any write is refused before it reaches the database. This is the default. |
| **Read & Write** | Reads, and writes that pass Safe Mode. |

Leave production on **Read Only** or **Blocked**. Give **Read & Write** to a local or staging database where you want the agent to change data.

## What Safe Mode does to an agent's writes {#safe-mode}

A write from a client passes three checks, and the strictest one wins:

1. **External Clients** on the connection, as above.
2. **The token's scope.** The token `tablepro-mcp` carries is **Read & Write**.
3. **Safe Mode**, per statement, exactly as for a query you run yourself.

At each Safe Mode level, a write the first two checks allow does this:

| Level | An agent's write |
|---|---|
| **Silent** (the default) | Runs without asking. |
| **Alert** | Waits for you to confirm it in a dialog on your Mac that shows the whole statement. |
| **Safe Mode** | Waits for confirmation and Touch ID or your Mac password. |
| **Read-Only** | Is refused. |

**Alert (Full)** and **Safe Mode (Full)** also ask before reads. Set the level in the same **Access** section, or with the padlock in the toolbar while the connection is open.

So **Read & Write** on a **Silent** connection lets an agent run `INSERT`, `UPDATE` and `DELETE` with no prompt. If you want to see each write before it runs, raise that connection to **Alert**.

`DROP` and `TRUNCATE` are handled apart from all of this. `execute_query` refuses them. They run only through the `confirm_destructive_operation` tool, which needs a **Full Access** token and your approval every time. The token `tablepro-mcp` carries is not Full Access, so an agent connected that way cannot drop or truncate anything.

Some statements are refused whatever the settings: anything that reads or writes files on the server or runs server-side code, and more than one statement in a single call, except a SQL Server script.

For a narrower token than the one `tablepro-mcp` carries, such as **Read Only** limited to a few connections, generate one under **Settings > Integrations > Authentication** and connect the client over HTTP instead. The [MCP Clients](https://docs.tablepro.app/external-api/mcp-clients#http-transport) docs show that config.

## See what the agent did {#activity}

**View Activity…** in **Settings > Integrations** lists every tool call and query, with the connection and the outcome. Statements there are stored as a SHA-256 digest, not as text. Queries a client runs also appear in the query history of that connection, unless you turn off **Log MCP queries in history**.

## Where it stops {#limits}

- The server listens on `127.0.0.1` only. There is no remote mode; a client on another machine needs an SSH port forward you set up and own.
- It runs in the Mac app. The iPhone and iPad app has no MCP server.
- Clients see your saved connections, never their passwords, and cannot create or edit connections or change Safe Mode.
- A result stops at **Default row limit**, 500 rows unless you change it, and a client can ask for more only up to **Maximum row limit**, 10,000 by default. Both are in **Settings > Integrations**.

## If the client sees no tools {#troubleshooting}

- **TablePro is not running**: the bridge could not start the app or find the server, and gave up after 10 seconds. Open TablePro and check that **Status** says running.
- **This connection is read only for external clients**: the statement writes and **External Clients** is **Read Only**. Change it, or run the statement in TablePro yourself.
- **The connection is missing from `list_connections`**: it is **Blocked**, or its AI policy is set to **Never**.

The full tool list is in the [MCP Tools](https://docs.tablepro.app/external-api/mcp-tools) docs, and the settings pane in [MCP Server](https://docs.tablepro.app/features/mcp). On this site, see [the MCP server](/features/ai-mcp#mcp) and [Safe Mode](/features/data-editing#safe-mode). An agent can only work with a database TablePro can connect to: [connecting through an SSH tunnel](/blog/postgresql-ssh-tunnel-mac) and [connecting to a database in Docker](/blog/connect-postgresql-mysql-docker-mac) cover the usual two.
