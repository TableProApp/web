---
slug: connect-amazon-rds-mac
title: "Connect to Amazon RDS for PostgreSQL or MySQL from a Mac"
seoTitle: "Connect to Amazon RDS PostgreSQL or MySQL on Mac"
description: Connect to RDS or Aurora from a Mac. Check network access, verify TLS certificates and configure AWS IAM authentication in the CLI or TablePro.
date: 2026-10-08
author: TablePro
ogPunchline: Endpoint, security group, certificate, then IAM instead of a password.
tags: [postgresql, mysql, aws-iam, ssh]
---

To connect to RDS or Aurora, you need the database endpoint, network access and a database login. Check those first, then configure TLS and optional IAM authentication in your client.

## Find the endpoint {#endpoint}

In the RDS console, open **Databases**, pick the instance and read the endpoint and port under **Connectivity & security**. From the AWS CLI:

```bash
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,Endpoint.Address,Endpoint.Port]' \
  --output table
```

An Aurora cluster has a writer endpoint and a reader endpoint. Writes sent to the reader endpoint fail on the server, whatever client you use.

## Check network access {#network}

Check public access and the security group:

- **Public access**: an instance that is not publicly accessible has no address outside its VPC. Reach it through a bastion host in the same VPC, or a VPN.
- **The security group**: it needs an inbound rule for the database port (5432 or 3306) from your address, or from the bastion's.

If either one is wrong, the connection times out rather than failing with a clear message.

## Verify the certificate {#tls}

Download the RDS certificate bundle and use it to verify the server:

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

Through a tunnel, the driver connects to `127.0.0.1`. **Verify CA** and **Verify Identity** become **Required (skip verify)**: traffic remains encrypted, but the server certificate is not checked. See [SSH tunnel setup](/blog/postgresql-ssh-tunnel-mac) for keys, agents and jump hosts.

### Import RDS instances

**File > Import > Import from AWS…** lists RDS instances and Aurora clusters visible to an AWS profile. Pick the profile, select regions and click **Continue**, then choose instances. The profile needs `rds:DescribeDBInstances` and `rds:DescribeDBClusters`, included in `AmazonRDSReadOnlyAccess`. **Username** stays empty; enter the database user you want to use.

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

Each connection and automatic reconnect signs a fresh token; it is never written to disk. IAM requires TLS, so TablePro raises **SSL Mode** when it is **Disabled** or **Preferred**.

A tunnel TablePro opens needs nothing more: the token is signed for the **Host** and **Port** in the form. If you run a port forward yourself and **Host** says `127.0.0.1`, put the real endpoint in **RDS Endpoint**, or the token is signed for the wrong host.

## Limitations {#limits}

- A database user is either password-authenticated or IAM-authenticated. Connecting with a password as a user that has `rds_iam` fails, and so does IAM as a user that has only a password.
- Profiles that use `mfa_serial` or `web_identity_token_file` are not supported. Assume-role profiles, `credential_process` and IAM Identity Center are.
- Behind an SSH tunnel, the certificate is not checked, as described above.

## Troubleshooting {#troubleshooting}

- **The connection times out**: the security group or public access setting is blocking you. Check the inbound rule and the address you connect from.
- **PAM authentication failed** on PostgreSQL, or **Access denied** on MySQL, with IAM: the token was signed for a different endpoint than the one RDS sees. Check **Host**, or **RDS Endpoint** when you forward the port yourself, including the port.
- **Could not determine an AWS region**: the hostname is not a standard RDS endpoint. Fill in **AWS Region**.
- **AWS SSO Sign-In Required**: the cached session expired. Accept the prompt, or run `aws sso login --profile <name>`.

See [AWS IAM Authentication](https://docs.tablepro.app/connections/aws-iam) and [SSL/TLS](https://docs.tablepro.app/connections/ssl) for all options and errors. Feature overviews: [PostgreSQL](/postgresql-client), [MySQL](/mysql-client) and [cloud sign-in](/features/connections#cloud-auth).
