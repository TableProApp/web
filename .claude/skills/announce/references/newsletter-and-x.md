# Newsletter and X posts

Both are short and both point at the post. Write them from the finished post, not from the changelog,
so the three cannot disagree.

## The newsletter

**150 to 250 words**, one phone screen. It says a version exists, names the headline items one line
each, and links the post.

```markdown
**Subject:** TablePro <version>: <two or three plain items>

**Preview text:** <what the subject did not say>

---

# TablePro <version>

<One sentence naming what the release is about, in different words from the subject.>

- **<Feature>**: <one line, what it does for you.>
- **<Feature>**: <one line.>
- **<Feature>**: <one line.>

<One line on the rest: the fix count, or the one breaking change.>

[Read the full post](<post url>)

Update from **TablePro > Check for Updates**, or [download it](https://tablepro.app/download).
```

- **The bullets are the whole body**: three to five, in the post's order. No headings, images or
  tables. A bullet that needs a second sentence belongs in the post.
- **Put these in the mail itself**, because the readers who do not click are the ones they hurt: a
  breaking change or removal, and a one-time reset or migration with what it does not affect.
- **Subject**: `TablePro <version>: ` plus two or three plain items, lowercase after the colon, comma
  separated, no adjectives. Gmail on iOS cuts near 40 characters, so the first item finishes inside
  that. Every item in the subject is a bullet.
- **Preview text**: 40 to 90 characters that add what the subject left out. Nothing load-bearing
  lives only here: Apple Intelligence can replace it with a generated summary.

### Newsletter voice

Each rule is a yes or no against the draft, and a no is a rewrite.

1. The opener names what the release is about in different words from the subject.
2. No first person: the subject of a sentence is the product, the feature, or "you".
3. Nothing tells the reader what is worth their time or how they will feel ("fixes you will
   notice").
4. No em dashes, semicolons, exclamation marks or emoji.
5. Figures instead of vague quantifiers: "more than 130 other fixes", not "many".
6. No prose sentence over 35 words. An enumeration after a colon may run longer.
7. Name the old behavior beside the new one where it fits in one line.
8. Second person, present tense, active voice. No "will now", no "has been improved".
9. Backticks on shortcuts, SQL keywords and literals (`Cmd+F`, `EXPLAIN ANALYZE`). Bold for menu
   paths and the first mention of a new proper noun, not for run-in headlines.
10. US spelling (color, behavior), as in the docs and the app.

## The X posts

A thread of **four to six posts** plus one standalone, one feature per post.

**Voice: an indie developer telling other developers what shipped.** Casual and plain, the way a dev
types on X: "you can now", "handy when", contractions, short lines. First person is fine here, and so
is a question opener or a little humor. Humble, not promotional: no PR or AI phrasing, no thread
hooks ("a thread", "here's why this matters"), no engagement bait, no "and much more", no hashtags
or emoji unless one really fits. Not every post has to read as an announcement.

- **Order by reach**: the features most users touch first (totals, tabs, import), niche ones (one
  engine's sign-in, a socket option) in the round-up.
- **280 characters at most** per post (a link counts 23), and one needing 279 is too dense.
- **No markdown**: X renders none of it.
- **Links only in the last post** and the standalone. An earlier link costs reach.
- **One image per post at most**, named in the post header, and only images that exist and are
  current.
- **The first post works alone**: the version and the biggest change in its first two lines.
- **The standalone post** is the version, three or four changes in plain nouns, then the link. It is
  the one that gets reposted, so it needs no context.

```markdown
## 1/5 (attach: <image file, or omit>)

TablePro 0.82 is out.

<The headline change, two sentences.>

## 5/5

Also in 0.82: <three or four items, comma separated>

Full post: <post url>
Download: https://tablepro.app/download

## Standalone

TablePro 0.82: <three or four changes>. <post url>
```

When the user hands over their own draft to polish, keep its meaning, fix the wording, and reply
with the final text only, ready to post.
