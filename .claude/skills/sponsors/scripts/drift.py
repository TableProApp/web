#!/usr/bin/env python3
# Compares GitHub Sponsors with resources/data/sponsors.json and prints what differs.
# Read-only: it runs queries through `gh`, which holds the credentials, and writes nothing.
import argparse
import json
import subprocess
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

WEB_ROOT = Path(__file__).resolve().parents[4]
DATA = WEB_ROOT / "resources" / "data" / "sponsors.json"
FACTS = WEB_ROOT / "resources" / "data" / "facts.json"

# Sponsorships started or last changed before the current tiers went live keep the placement they had.
TIERS_SINCE = date(2026, 10, 29)
STALE_DAYS = 30
EXPIRY_WARNING_DAYS = 30

SPONSORSHIPS = """
query($login: String!, $endCursor: String) {
  %s(login: $login) {
    sponsorshipsAsMaintainer(first: 100, after: $endCursor, activeOnly: false, includePrivate: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        isActive isOneTimePayment privacyLevel createdAt tierSelectedAt
        tier { monthlyPriceInDollars isOneTime isCustomAmount }
        sponsorEntity { __typename ... on User { login name } ... on Organization { login name } }
      }
    }
  }
}
"""

TIERS = """
query($login: String!) {
  user(login: $login) {
    sponsorsListing { tiers(first: 50) { nodes { monthlyPriceInDollars isOneTime isCustomAmount } } }
  }
}
"""


def gh(query, **variables):
    args = ["gh", "api", "graphql", "-f", "query=" + query]
    for key, value in variables.items():
        if value is not None:
            args += ["-F", f"{key}={value}"]
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit("gh api graphql failed. If it names a missing scope, run `gh auth refresh -h github.com -s read:user`.\n" + result.stderr.strip())
    return json.loads(result.stdout)["data"]


def sponsorships(kind, login):
    nodes, cursor = [], None
    while True:
        page = gh(SPONSORSHIPS % kind, login=login, endCursor=cursor)[kind]["sponsorshipsAsMaintainer"]
        nodes += page["nodes"]
        if not page["pageInfo"]["hasNextPage"]:
            return nodes
        cursor = page["pageInfo"]["endCursor"]


def day(stamp):
    return datetime.fromisoformat(stamp.replace("Z", "+00:00")).date()


def rank(placement, data):
    order = [tier["placement"] for tier in data["tiers"]]
    return -1 if placement is None else order.index(placement)


def earned(amount, one_time, data):
    multiplier = data["oneTime"]["multiplier"] if one_time else 1
    placement = None
    for tier in data["tiers"]:
        if amount >= tier["monthly"] * multiplier:
            placement = tier["placement"]
    return placement


def price_label(amount, one_time):
    return f"${amount}" + (" one time" if one_time else " a month")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--today", type=date.fromisoformat, default=date.today())
    args = parser.parse_args()
    today = args.today

    data = json.loads(DATA.read_text())
    facts = json.loads(FACTS.read_text())
    program = facts["links"]["sponsorsProgram"]
    maintainer = program.rstrip("/").rsplit("/", 1)[-1]
    months = data["oneTime"]["months"]

    nodes = sponsorships("user", maintainer) + sponsorships("organization", "TableProApp")
    listed = {sponsor["githubLogin"].lower(): sponsor for sponsor in data["sponsors"]}

    drift = 0

    def report(code, text, counts=True):
        nonlocal drift
        drift += counts
        print(f"{code:<10} {text}")

    current, private = {}, 0
    for node in nodes:
        entity = node["sponsorEntity"]
        if entity is None or node["tier"] is None:
            continue
        started = day(node["createdAt"])
        changed = day(node["tierSelectedAt"] or node["createdAt"])
        one_time = node["isOneTimePayment"]
        ends = started + timedelta(days=round(months * 365 / 12)) if one_time else None
        live = (ends is not None and ends > today) if one_time else node["isActive"]
        if not live:
            continue
        if node["privacyLevel"] != "PUBLIC":
            private += 1
            if entity["login"].lower() in listed:
                report("PRIVATE", f"{entity['login']} sponsors privately but is listed: remove it")
            continue
        sponsor = {
            "login": entity["login"],
            "name": entity.get("name") or entity["login"],
            "kind": entity["__typename"],
            "amount": node["tier"]["monthlyPriceInDollars"],
            "oneTime": one_time,
            "ends": ends,
            "legacy": changed < TIERS_SINCE,
            "placement": earned(node["tier"]["monthlyPriceInDollars"], one_time, data),
        }
        # One login can hold a monthly and a one-time sponsorship at once: the better placement counts.
        known = current.get(entity["login"].lower())
        if known is None or rank(sponsor["placement"], data) > rank(known["placement"], data):
            current[entity["login"].lower()] = sponsor

    for login, sponsor in sorted(current.items()):
        price = price_label(sponsor["amount"], sponsor["oneTime"])
        entry = listed.get(login)
        if entry is None:
            if sponsor["placement"] is not None:
                report("MISSING", f"{sponsor['login']} ({sponsor['name']}, {sponsor['kind']}, {price}) earns placement '{sponsor['placement']}'")
            continue
        if sponsor["placement"] != entry["placement"]:
            earns = sponsor["placement"] or "no placement"
            if sponsor["legacy"]:
                report("LEGACY", f"{sponsor['login']} ({price}) keeps '{entry['placement']}' from before {TIERS_SINCE}", counts=False)
            else:
                report("PLACEMENT", f"{sponsor['login']} ({price}) is listed as '{entry['placement']}' but earns {earns}")
        if sponsor["ends"] is not None and (sponsor["ends"] - today).days <= EXPIRY_WARNING_DAYS:
            report("EXPIRES", f"{sponsor['login']}'s one-time placement ends on {sponsor['ends']}", counts=False)

    for login, entry in sorted(listed.items()):
        if login not in current:
            report("GONE", f"{entry['githubLogin']} ({entry['name']}) has no current public sponsorship: remove it and its logo")

    tiers = gh(TIERS, login=maintainer)["user"]["sponsorsListing"]["tiers"]["nodes"]
    published = {(tier["monthlyPriceInDollars"], tier["isOneTime"]) for tier in tiers if not tier["isCustomAmount"]}
    wanted = {(tier["monthly"], False) for tier in data["tiers"]}
    wanted |= {(tier["monthly"] * data["oneTime"]["multiplier"], True) for tier in data["tiers"]}
    for amount, one_time in sorted(wanted - published):
        report("TIERS", f"{price_label(amount, one_time)} is in sponsors.json but not published on GitHub")
    for amount, one_time in sorted(published - wanted):
        report("TIERS", f"{price_label(amount, one_time)} is published on GitHub but not in sponsors.json")

    on_homepage = sum(entry["placement"] in ("lead", "homepage") for entry in data["sponsors"])
    age = (today - date.fromisoformat(data["verifiedAt"])).days
    if age > STALE_DAYS:
        report("STALE", f"verifiedAt is {age} days old")

    print(f"\n{len(current)} current public sponsors, {private} private (never listed), "
          f"{max(0, data['homepageSlots'] - on_homepage)} of {data['homepageSlots']} homepage places open.")
    print("No drift." if drift == 0 else f"{drift} to fix.")
    return 1 if drift else 0


if __name__ == "__main__":
    sys.exit(main())
