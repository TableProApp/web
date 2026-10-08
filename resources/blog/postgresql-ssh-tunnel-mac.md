---
slug: postgresql-ssh-tunnel-mac
title: "How to connect to PostgreSQL through an SSH tunnel on a Mac"
seoTitle: "Connect to PostgreSQL over an SSH tunnel on a Mac"
description: The ssh -L command for a PostgreSQL server behind a bastion, then the same tunnel in TablePro with a password, a key, an agent or jump hosts.
date: 2026-10-08
author: TablePro Team
ogPunchline: ssh -L first, then the same tunnel in the connection form.
tags: [postgresql, ssh]
---

A PostgreSQL server in a private network has no port you can reach from your Mac. You get to it by logging in to a machine that can see it and forwarding a port through that login. This guide starts with the plain `ssh` command, then sets up the same tunnel in TablePro's connection form.

## The plain ssh command {#ssh-command}

```bash
ssh -N -L 5433:localhost:5432 deploy@bastion.example.com
```

- `-L 5433:localhost:5432` listens on port 5433 on your Mac and forwards it to `localhost:5432` as the SSH server sees it.
- `-N` opens no shell. The command stays in the foreground until you press `Ctrl+C`.

The middle part of `-L` is resolved on the SSH server, not on your Mac. If PostgreSQL runs on the SSH server itself, it is `localhost`. If it runs elsewhere in the private network, use the name the SSH server knows it by, such as `db.internal:5432`.

While the tunnel is up, connect to its local end:

```bash
psql "postgresql://app@localhost:5433/appdb"
```

Two common variations:

```bash
# a specific private key
ssh -N -i ~/.ssh/id_ed25519 -L 5433:localhost:5432 deploy@bastion.example.com

# through a jump host first
ssh -N -J ops@jump.example.com -L 5433:db.internal:5432 deploy@bastion.example.com
```

With the key loaded in an agent (`ssh-add ~/.ssh/id_ed25519`), `-i` is not needed. The server has to allow forwarding: `AllowTcpForwarding yes` in `sshd_config`.

The tunnel is a separate process. Close that terminal and every client connected through it drops.

## The same tunnel in TablePro {#in-tablepro}

TablePro opens the tunnel when the connection opens and closes it with the connection, so there is no terminal to keep around.

1. Click **New Connection…** on the welcome window, or press `Cmd+N`, and pick **PostgreSQL**.
2. On **General**, describe the database as the SSH server sees it: **Host** (`localhost` when PostgreSQL runs on the SSH server), **Port**, **Database**, **Username** and **Password**. PostgreSQL does not connect without a database name.
3. Open the **Network** tab and set **Connect via** to **SSH Tunnel**.
4. Fill in **SSH Host**, **SSH Port** (22 by default) and **SSH User**.
5. Under **Authentication**, pick a **Method**. The next section lists them.
6. Click **Test Connection**. The first time TablePro sees a server, an **Unknown SSH Host** alert shows the key type and its SHA-256 fingerprint and waits for **Trust**.
7. Click **Save & Connect**.

If `~/.ssh/config` has host entries, a **Config Host** picker appears above the host field. Pick an alias and `HostName`, `User`, `Port`, `IdentityFile`, `IdentityAgent` and `ProxyJump` are read from the file at connect time. Anything you type into the form overrides the file.

To use one bastion for several connections, click **Save Current as Profile…** and choose that profile in the **Profile** picker of the others.

## Password, key or agent {#authentication}

| Method | What you fill in |
|---|---|
| **Password** | The SSH password. |
| **Private Key** | **Key File**, and **Passphrase** for an encrypted key. With **Key File** empty, TablePro looks in `~/.ssh/config` and the default key locations. |
| **SSH Agent** | **Agent Socket**: **SSH_AUTH_SOCK** for the agent macOS runs, **1Password** for its socket, or **Custom Path** for another agent. **Identity File** takes a `.pub` file and offers that key first. |
| **Keyboard Interactive** | The password, sent through SSH's challenge-response. For servers that reject plain password auth. |
| **None** | Nothing. For a server that authenticates the connection itself, such as a Tailscale SSH host. |

With **SSH Agent**, signing stays in the agent and TablePro never reads the private key.

One detail trips people up. An app started from Finder gets `SSH_AUTH_SOCK` from launchd, which means the agent macOS runs, whatever your shell profile exports. If your keys live in 1Password or Secretive, choose **1Password** or **Custom Path** instead.

If the server asks for a verification code, the **Two-Factor Authentication** section covers it. **Prompt at Connect** asks you each time. **Auto Generate** computes the code from the TOTP secret you enter.

## Jump hosts {#jump-hosts}

For a database behind more than one bastion, expand **Jump Hosts** and click **Add Jump Host** once per hop, in the order the connection passes through them. Each hop takes a **Host**, a **Port**, a **Username** and an **Auth** method, which is **Private Key** or **SSH Agent**. A hop cannot sign in with a password. Every hop's host key is checked the same way as the SSH server's.

Leave the list empty and, if the SSH host matches a `~/.ssh/config` entry that has `ProxyJump`, TablePro follows that line instead.

## A server that only listens on a unix socket {#unix-socket}

Some PostgreSQL servers accept `local` connections only and open no TCP port. `ssh` can forward to the socket file:

```bash
ssh -N -L 5433:/var/run/postgresql/.s.PGSQL.5432 deploy@bastion.example.com
```

In TablePro, put that path in **Socket Path** under **Forward To** on the **Network** tab. Point at the socket file, not the directory. **Host** and **Port** are then unused. A socket cannot negotiate TLS, so TablePro turns it off for that connection, and the SSH tunnel encrypts the whole path.

## Where it stops {#limits}

- Certificate checks do not survive a tunnel. The driver connects to `127.0.0.1`, so **Verify CA** and **Verify Identity** drop to **Required (skip verify)** for a tunneled connection. TLS still runs all the way to the database.
- The local end of the tunnel listens on a port between 60000 and 65000. If the macOS firewall asks about it, allow it.
- A keep-alive goes out every 30 seconds. When the tunnel drops, TablePro rebuilds it, ten attempts at most. A query that was running when it dropped is not replayed.
- Jump hosts work in the Mac app only. The iPhone and iPad app does not open a connection that has them.
- **SSH Tunnel** is not offered for file databases such as SQLite and DuckDB.

## If it does not connect {#troubleshooting}

- **"The SSH server could not reach …"**: SSH worked and the forward did not. Check **Host** on **General**. A database bound to `127.0.0.1`, which is the PostgreSQL default, needs **Host** set to `localhost`.
- **The tunnel connects and the database refuses the login**: the SSH credentials and the database credentials are separate. Check that one set did not end up in the other's fields.
- **SSH itself fails**: run `ssh -v deploy@bastion.example.com` in Terminal with the same host, user and key. If that fails too, the problem is on the server.

The docs list every SSH error message with its cause in [SSH Tunneling](https://docs.tablepro.app/connections/ssh-tunneling). What TablePro does once you are connected is on the [PostgreSQL page](/postgresql-client), and the other ways to reach a private database, such as a SOCKS proxy or a `kubectl port-forward` command, are under [Connections](/features/connections#network).
