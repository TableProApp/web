#!/usr/bin/env python3
import argparse
import json
import re
import sys
from pathlib import Path

HARD = "hard"
SOFT = "soft"

WEB_ROOT = Path(__file__).resolve().parents[4]
ASSETS = WEB_ROOT / "resources" / "data" / "assets.json"
DEFAULT_DOCS = WEB_ROOT.parent / "tablepro-docs"

HYPE_PHRASES = [
    "you asked, we listened", "and much more", "worth your time", "you will notice",
    "excited", "thrilled", "introducing the",
]

VAGUE = [
    "many", "several", "a lot of", "significantly", "much faster", "greatly",
    "various", "numerous", "a number of",
]

BRITISH = re.compile(r"colour|behaviour|honour|recognis", re.I)
FIRST_PERSON = re.compile(
    r"(?<![\w'’])(?:(?i:we|us|our|ours|my|mine)|I|me)(?:['’](?i:m|ve|ll|d|re))?(?![\w'’])"
)
EMOJI_BASE = "[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF][\uFE0F\U0001F3FB-\U0001F3FF]?"
EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\U0001F1E6-\U0001F1FF\u2B00-\u2BFF]")
EMOJI_SEQUENCE = re.compile(f"[\U0001F1E6-\U0001F1FF]{{2}}|{EMOJI_BASE}(?:\u200D{EMOJI_BASE})*")
FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.S)
ASSET_SLOT = re.compile(r'<asset-slot id="([^"]*)"></asset-slot>')
URL = re.compile(r"https?://\S*[^\s.,;:!?'\")\]]")
DOCS_URL = re.compile(r"https://docs\.tablepro\.app/([A-Za-z0-9_./-]*)")
THREAD_HEADER = re.compile(r"^##\s+(\d+)/(\d+)\b")
MARKDOWN = re.compile(r"\*\*|`|\[[^\]]+\]\([^)]+\)")

BLOG_FIELDS = ["slug", "title", "description", "date", "release", "author", "tags", "ogPunchline"]

SUBJECT_COMFORTABLE = 48
SUBJECT_FIRST_ITEM = 41
PREVIEW_MIN, PREVIEW_MAX = 40, 95
MAX_SENTENCE_WORDS = 35
DESCRIPTION_MAX = 155
OG_PUNCHLINE_MAX = 90
SPREAD_FLOOR, SPREAD_TARGET = 2.0, 3.0
X_POST_MAX = 280
X_LINK_LENGTH = 23
X_LIGHT_RANGES = ((0x0000, 0x10FF), (0x2000, 0x200D), (0x2010, 0x201F), (0x2032, 0x2037))
PLACEHOLDER_SIZE = (1560, 960)


def strip_links(text):
    return URL.sub("", re.sub(r"\[([^\]]*)\]\([^)\s]*\)", r"\1", text))


def x_length(text):
    text = EMOJI_SEQUENCE.sub("xx", URL.sub("x" * X_LINK_LENGTH, text))
    return sum(1 if any(low <= ord(c) <= high for low, high in X_LIGHT_RANGES) else 2 for c in text)


def strip_code(text):
    text = re.sub(r"```.*?```", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)
    return re.sub(r"`[^`\n]*`", "``", text)


def strip_frontmatter(text):
    return FRONTMATTER.sub(lambda m: "\n" * m.group(0).count("\n"), text, count=1)


def lines_of(text):
    return text.split("\n")


def find_word(text, term):
    pattern = re.compile(r"(?<!\w)" + re.escape(term) + r"(?!\w)", re.I)
    return [i for i, line in enumerate(lines_of(text), 1) if pattern.search(line)]


def sentences(text):
    out = []
    for i, line in enumerate(lines_of(text), 1):
        stripped = line.strip()
        if not stripped or stripped.startswith(("#", ">", "|", "---", "<", "**Subject:", "**Preview")):
            continue
        collapsed = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", stripped)
        collapsed = re.sub(r"^[-*]\s+", "", collapsed)
        for sentence in re.split(r"(?<=[.!?])\s+", collapsed):
            if sentence.strip():
                out.append((i, sentence.strip()))
    return out


def check_prose(clean, kind, add):
    for i, line in enumerate(lines_of(clean), 1):
        if kind != "x":
            for match in FIRST_PERSON.finditer(line):
                if match.group(0) == "US":
                    continue
                add(HARD, "first person", f'"{match.group(0)}", the subject is the product or "you"', i)
        if ";" in line and "&#" not in line:
            add(HARD if kind == "newsletter" else SOFT, "semicolon", "split the sentence", i)
        if re.search(r"!(?!\[)", line) and not line.lstrip().startswith("<!"):
            add(SOFT, "exclamation mark", "check this is not enthusiasm", i)
        for match in EMOJI.finditer(line):
            add(SOFT if kind == "x" else HARD, "emoji", f"{match.group(0)!r}", i)
        for match in BRITISH.finditer(line):
            add(HARD, "British spelling", f'"{match.group(0)}", the docs and the app use US spelling', i)
        if re.match(r"^It also\b", line.strip()):
            add(SOFT, "\"It also\" opener", "open with the real subject", i)
        if re.match(r"^\*\*[^*]{1,40}\.\*\*\s+\S", line.strip()):
            add(SOFT, "bold run-in headline", "bold is for menu paths and new proper nouns", i)

    for phrase in HYPE_PHRASES:
        for line in find_word(clean, phrase):
            add(HARD, "hype phrase", f'"{phrase}"', line)
    for word in VAGUE:
        for line in find_word(clean, word):
            add(SOFT, "vague quantifier", f'"{word}", write the figure', line)

    for i, sentence in sentences(clean):
        count = len(sentence.split())
        if count > MAX_SENTENCE_WORDS and ":" not in sentence:
            add(SOFT, "long sentence", f"{count} words, split it", i)


def check_envelope(text, add):
    subject = re.search(r"^\*\*Subject:\*\*\s*(.+)$", text, re.M)
    if subject:
        value = subject.group(1).strip()
        head = value.split(",")[0]
        if len(value) > SUBJECT_COMFORTABLE:
            add(SOFT, "subject length", f"{len(value)} chars, Apple Mail on iPhone shows about 48")
        if len(head) > SUBJECT_FIRST_ITEM:
            add(HARD, "subject first item", f"{len(head)} chars, Gmail on iOS cuts near 40")
        items = [p for p in value.split(":", 1)[-1].split(",") if p.strip()]
        if len(items) > 3:
            add(SOFT, "subject items", f"{len(items)} items, use two or three")
    else:
        add(SOFT, "subject", "no **Subject:** line found")

    preview = re.search(r"^\*\*Preview text:\*\*\s*(.+)$", text, re.M)
    if preview:
        length = len(preview.group(1).strip())
        if not PREVIEW_MIN <= length <= PREVIEW_MAX:
            add(SOFT, "preview length", f"{length} chars, aim for {PREVIEW_MIN} to {PREVIEW_MAX}")
    elif subject:
        add(SOFT, "preview text", "no **Preview text:** line found")


def unquote(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def load_assets():
    try:
        with open(ASSETS, encoding="utf-8") as handle:
            return json.load(handle).get("assets", {})
    except (OSError, ValueError):
        return None


def check_blog(text, draft_path, add):
    front = FRONTMATTER.match(text)
    if not front:
        add(HARD, "frontmatter", "no --- block at the top")
        return
    fields = dict(re.findall(r"^(\w+):\s*(.*)$", front.group(1), re.M))
    for name in BLOG_FIELDS:
        if not fields.get(name):
            add(HARD, "frontmatter", f"missing {name}")
    stem = Path(draft_path).stem
    if fields.get("slug") and fields["slug"] != stem:
        add(HARD, "frontmatter", f"slug {fields['slug']} does not match the filename {stem}")
    title = fields.get("title", "")
    if ":" in title and not title.startswith(('"', "'")):
        add(HARD, "frontmatter", "a title with a colon must be quoted")
    description = unquote(fields.get("description", ""))
    if len(description) > DESCRIPTION_MAX:
        add(HARD, "description", f"{len(description)} chars, SeoLengthsTest allows {DESCRIPTION_MAX}")
    punchline = unquote(fields.get("ogPunchline", ""))
    if len(punchline) > OG_PUNCHLINE_MAX:
        add(SOFT, "ogPunchline", f"{len(punchline)} chars, keep it under about {OG_PUNCHLINE_MAX}")

    check_slots(text, add)

    body = ASSET_SLOT.sub("", text[front.end():])
    sections = [len(s.split()) for s in re.split(r"\n## ", body)[1:]]
    if len(sections) >= 2 and min(sections) > 0:
        spread = max(sections) / min(sections)
        detail = f"{spread:.1f}x between sections of {min(sections)} and {max(sections)} words"
        if spread < SPREAD_FLOOR:
            add(HARD, "section spread", f"{detail}, every section weighs the same")
        elif spread < SPREAD_TARGET:
            add(SOFT, "section spread", f"{detail}, aim for {SPREAD_TARGET:.0f}x")


def check_slots(text, add):
    slots = [(i, slot) for i, line in enumerate(lines_of(text), 1) for slot in ASSET_SLOT.findall(line)]
    if not slots:
        add(HARD, "figures", "no <asset-slot>, a release post ships with its figures")
    for i, line in enumerate(lines_of(text), 1):
        if re.search(r"<figure\b|<img\b|!\[", line):
            add(HARD, "raw image", "a figure is an <asset-slot> with an entry in resources/data/assets.json", i)
    if not slots:
        return
    assets = load_assets()
    if assets is None:
        add(HARD, "asset slot", f"cannot read {ASSETS}")
        return
    for i, slot in slots:
        entry = assets.get(slot)
        if entry is None:
            add(HARD, "asset slot", f"{slot} has no entry in resources/data/assets.json", i)
        elif entry.get("status") != "supplied":
            add(HARD, "asset slot", f"{slot} is a placeholder, which renders nothing in production", i)


def check_x(text, add):
    posts = []
    for i, line in enumerate(lines_of(text), 1):
        if line.startswith("## "):
            posts.append((i, line, []))
        elif posts:
            posts[-1][2].append(line)
    if not posts:
        add(HARD, "posts", "no `## 1/5` headers, one per post")
        return
    for i, header, lines in posts:
        body = "\n".join(lines).strip()
        length = x_length(body)
        if length > X_POST_MAX:
            add(HARD, "post length", f"{length} chars, X allows {X_POST_MAX}", i)
        if MARKDOWN.search(body):
            add(HARD, "markdown", "X renders none of it", i)
        thread = THREAD_HEADER.match(header)
        if thread and int(thread.group(1)) < int(thread.group(2)) and URL.search(body):
            add(SOFT, "early link", "a link before the last post costs reach", i)


def check_docs(text, docs, add):
    links = [(i, m) for i, line in enumerate(lines_of(text), 1) for m in DOCS_URL.findall(line)]
    if not links:
        return
    if not docs.is_dir():
        add(SOFT, "docs links", f"{docs} not found, so no docs link was checked; pass --docs")
        return
    for i, path in links:
        path = path.rstrip("./")
        if path.startswith("images/"):
            image = docs / path
            if not image.is_file():
                add(HARD, "missing image", path, i)
            elif png_size(image) == PLACEHOLDER_SIZE:
                add(HARD, "placeholder image", f"{path} is a 1560x960 placeholder card", i)
        elif not any(p.is_file() for p in (docs / f"{path or 'index'}.mdx", docs / path / "index.mdx")):
            add(HARD, "missing docs page", path or "/", i)


def png_size(path):
    try:
        with open(path, "rb") as handle:
            header = handle.read(24)
    except OSError:
        return None
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return int.from_bytes(header[16:20], "big"), int.from_bytes(header[20:24], "big")


def main():
    parser = argparse.ArgumentParser(
        description="Mechanical checks for a release announcement draft: house style, budgets, "
        "figures and docs links. Banned words are ../TablePro/scripts/check-banned-words.sh; "
        "whether a sentence is true is references/fact-checks.md.",
    )
    parser.add_argument("draft")
    kind = parser.add_mutually_exclusive_group()
    kind.add_argument("--blog", action="store_true", help="a post in resources/blog/")
    kind.add_argument("--x", action="store_true", help="X posts, one `## n/m` header per post")
    parser.add_argument("--docs", type=Path, default=DEFAULT_DOCS, help="the docs checkout (default: %(default)s)")
    args = parser.parse_args()

    try:
        with open(args.draft, encoding="utf-8") as handle:
            text = handle.read()
    except OSError as error:
        print(f"lint-draft.py: {error}", file=sys.stderr)
        return 2

    findings = []

    def add(level, rule, detail, line=None):
        findings.append((level, rule, detail, line))

    kind = "blog" if args.blog else "x" if args.x else "newsletter"
    clean = strip_links(strip_code(strip_frontmatter(text)))
    check_prose(clean, kind, add)
    if kind == "blog":
        check_blog(text, args.draft, add)
    elif kind == "x":
        check_x(text, add)
    else:
        check_envelope(text, add)
    check_docs(text, args.docs, add)

    hard = [f for f in findings if f[0] == HARD]
    soft = [f for f in findings if f[0] == SOFT]
    words = len(ASSET_SLOT.sub("", clean).split())
    print(f"{args.draft}: {words} words, {len(hard)} to fix, {len(soft)} to look at\n")

    for label, group in (("Fix", hard), ("Look at", soft)):
        if not group:
            continue
        print(f"{label}:")
        for _, rule, detail, line in sorted(group, key=lambda f: (f[1], f[3] or 0)):
            where = f"line {line}" if line else "header"
            print(f"  {where:>10}  {rule}: {detail}")
        print()

    if not findings:
        print("Nothing mechanical to report. The factual pass is references/fact-checks.md.")
    return 1 if hard else 0


if __name__ == "__main__":
    sys.exit(main())
