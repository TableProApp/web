/**
 * The `blog` namespace: the template around the blog's posts (sitemap §A.5,
 * §E.6; design-system §8.9, §8.10). The index page's lead and the dated
 * corrections are in resources/data/content/{locale}/blog.json; the posts are
 * markdown.
 *
 * - `latest` is the line on /download that links the newest release post.
 * - `post.archive` is the note above a release post once a newer release is
 *   out. `{date}` is the publication date, formatted by the server, and
 *   `{release}` is the post's front matter `release` ("TablePro 0.74").
 * - `post.correction` titles an editor's correction, added only where a post
 *   said something that was never true. `{date}` is the correction's date.
 * - `post.notes` links that release's changelog entry and GitHub release.
 * - The download line under a post is the availability layer's
 *   (`platforms.availability.summary`, `download.macCta`), never typed here.
 */
export default {
    index: {
        empty: 'No posts yet.',
        guides: 'Guides',
        releases: 'Release notes',
    },
    latest: 'Latest release post: <post>{title}</post>.',
    post: {
        archive: 'Published {date}. This post covers {release} at release. See current <features>features</features> and the <changelog>changelog</changelog>.',
        correction: 'Correction, {date}',
        toc: 'On this page',
        pages: 'Related pages',
        notes: {
            title: 'Full release notes',
            changelog: '{release} in the changelog',
            github: '{release} on GitHub',
        },
        related: 'Related posts',
    },
};
