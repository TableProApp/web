---
slug: connect-amazon-rds-mac
title: "How to connect to Amazon RDS for PostgreSQL or MySQL from a Mac"
seoTitle: "Connect to Amazon RDS PostgreSQL or MySQL on Mac"
description: Reach an RDS or Aurora endpoint directly or through a bastion, verify its TLS certificate, and sign in with AWS IAM instead of a stored password.
date: 2026-10-08
author: TablePro Team
ogPunchline: Endpoint, security group, certificate, then IAM instead of a password.
tags: [postgresql, mysql, aws-iam, ssh]
---

An RDS instance is an ordinary PostgreSQL or MySQL server behind an AWS hostname. Most failed connections are not about the client at all: the network does not let you in, or the login is set up for a different kind of authentication than the one you are using. This guide covers both sides.

## Find the endpoint {#endpoint}

In the RDS console, open **Databases**, pick the instance and read the endpoint and port under **Connectivity & security**. From the AWS CLI:

```bash
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,Endpoint.Address,Endpoint.Port]' \
  --output table
```

An Aurora cluster has a writer endpoint and a reader endpoint. Writes sent to the reader endpoint fail on the server, whatever client you use.

## Can your Mac reach it? {#network}

Two settings decide whether a connection from your Mac gets through:

- **Public access**: an instance that is not publicly accessible has no address outside its VPC. Reach it through a bastion host in the same VPC, or a VPN.
- **The security group**: it needs an inbound rule for the database port (5432 or 3306) from your address, or from the bastion's.

If either one is wrong, the connection times out rather than failing with a clear message.

## Verify the certificate {#tls}

RDS serves TLS. To check that you are talking to RDS and not something in between, download the RDS certificate bundle and point the client at it:

```bash
curl -O https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

psql "host=mydb.abc123.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=app sslmode=verify-full sslrootcert=global-bundle.pem"

mysql -h mydb.abc123.us-east-1.rds.amazonaws.com -P 3306 -u app -p \
  --ssl-mode=VERIFY_IDENTITY --ssl-ca=global-bundle.pem
```

## Connect in TablePro {#in-tablepro}

1. Click **New Connection…** on the welcome window, or press `Cmd+N`, and pick **PostgreSQL** or **MySQL**.
2. On **General**, set **Host** to the endpoint and **Port** to its port, then fill in **Username** and **Password**. PostgreSQL also needs **Database**; `postgres` exists on every RDS PostgreSQL instance.
3. Open the **Network** tab. New connections start at **SSL Mode: Preferred**. To verify the server, choose **Verify Identity** and, under **CA Certificate**, set **Certificate** to `global-bundle.pem`.
4. Click **Test Connection**, then **Save & Connect**.

### Through a bastion

On the **Network** tab, set **Connect via** to **SSH Tunnel** and fill in the bastion's **SSH Host**, **SSH User** and key. Leave **Host** on **General** as the RDS endpoint: the tunnel resolves it from the bastion, inside the VPC.

A tunnel has one cost. The driver then connects to `127.0.0.1`, which no certificate names, so **Verify CA** and **Verify Identity** drop to **Required (skip verify)** for that connection. The traffic is still encrypted to the database. [Connecting through an SSH tunnel](/blog/postgresql-ssh-tunnel-mac) covers keys, agents and jump hosts.

### Several instances at once

**File > Import > Import from AWS…** lists the RDS instances and Aurora clusters an AWS profile can see. Pick the profile, tick the regions to search and click **Continue**, then choose the rows to add. The profile needs `rds:DescribeDBInstances` and `rds:DescribeDBClusters`, which the `AmazonRDSReadOnlyAccess` policy includes. **Username** stays empty, because the database user is rarely the master user.

## Sign in with AWS IAM {#iam}

IAM database authentication replaces the stored password with a token signed by your AWS credentials. On the AWS side:

1. Turn on IAM database authentication on the instance or cluster.
2. Create the database user for it:

```sql
-- PostgreSQL
CREATE USER app_user;
GRANT rds_iam TO app_user;

-- MySQL
CREATE USER 'app_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```

3. Allow `rds-db:connect` on that user in an IAM policy for the role or user you sign in with.

From the command line, the token is the password, valid for 15 minutes:

```bash
export PGPASSWORD="$(aws rds generate-db-auth-token \
  --hostname mydb.abc123.us-east-1.rds.amazonaws.com --port 5432 \
  --region us-east-1 --username app_user)"
psql "host=mydb.abc123.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=app_user sslmode=verify-full sslrootcert=global-bundle.pem"
```

The `mysql` client also needs `--enable-cleartext-plugin` to send the token.

In TablePro, set **Authentication** on **General** to one of the AWS options. The **Password** field gives way to the AWS fields, and **Username** takes the database user.

| Option | Credentials come from |
|---|---|
| **AWS IAM (Profile)** | A profile in `~/.aws/config` and `~/.aws/credentials`, the files the AWS CLI reads. **Profile Name** lists them; blank means `default`. |
| **AWS IAM (SSO)** | A profile backed by IAM Identity Center, using the CLI's cached sign-in. |
| **AWS IAM (Access Key)** | An **Access Key ID** and **Secret Access Key** typed into the form, with an optional **Session Token**. |

**AWS Region** is read from a standard RDS hostname. Fill it in for a CNAME or a custom endpoint.

Each connect signs a fresh token, and automatic reconnects sign another, so there is nothing to paste or refresh. The token is never written to disk. IAM requires TLS, so an **SSL Mode** of **Disabled** or **Preferred** is raised for the connect.

A tunnel TablePro opens needs nothing more: the token is signed for the **Host** and **Port** in the form. If you run a port forward yourself and **Host** says `127.0.0.1`, put the real endpoint in **RDS Endpoint**, or the token is signed for the wrong host.

## Where it stops {#limits}

- A database user is either password-authenticated or IAM-authenticated. Connecting with a password as a user that has `rds_iam` fails, and so does IAM as a user that has only a password.
- Profiles that use `mfa_serial` or `web_identity_token_file` are not supported. Assume-role profiles, `credential_process` and IAM Identity Center are.
- Behind an SSH tunnel, the certificate is not checked, as described above.

## If it does not connect {#troubleshooting}

- **The connection times out**: the security group or public access setting is blocking you. Check the inbound rule and the address you connect from.
- **PAM authentication failed** on PostgreSQL, or **Access denied** on MySQL, with IAM: the token was signed for a different endpoint than the one RDS sees. Check **Host**, or **RDS Endpoint** when you forward the port yourself, including the port.
- **Could not determine an AWS region**: the hostname is not a standard RDS endpoint. Fill in **AWS Region**.
- **AWS SSO Sign-In Required**: the cached session expired. Accept the prompt, or run `aws sso login --profile <name>`.

Every IAM option and message is in the [AWS IAM Authentication](https://docs.tablepro.app/connections/aws-iam) docs, and the certificate modes are in [SSL/TLS](https://docs.tablepro.app/connections/ssl). On this site, see the [PostgreSQL](/postgresql-client) and [MySQL](/mysql-client) pages and [signing in with your cloud account](/features/connections#cloud-auth).
