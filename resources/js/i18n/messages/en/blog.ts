/**
 * The `blog` namespace: the template around the blog's posts (sitemap §A.5,
 * §E.6; design-system §8.9, §8.10). The index page's own copy (its lead, the
 * newsletter box, the dated corrections) is in
 * resources/data/content/{locale}/blog.json; the posts are markdown.
 *
 * - `post.archive` is the note above every post. Its `{date}` is the original
 *   publication date, formatted by the server, and `{release}` is what a
 *   release post announced ("TablePro 0.74"), from the post's front matter.
 *   `unnamed` is for a post that announced no release. The note dates the
 *   post instead of editing it: release posts keep their words and meaning.
 * - `post.correction` titles an editor's correction, added only where a post
 *   said something that was never true. `{date}` is the correction's date.
 * - The download line under a post is the availability layer's
 *   (`platforms.availability.summary`, `download.macCta`), never typed here.
 */
export default {
    index: {
        empty: 'No posts yet.',
    },
    post: {
        archive: {
            named: 'Published on {date}, this post describes {release} as it was then. For what TablePro does today, see <features>Features</features> and the <changelog>changelog</changelog>.',
            unnamed: 'Published on {date}, this post describes TablePro as it was then. For what TablePro does today, see <features>Features</features> and the <changelog>changelog</changelog>.',
        },
        /** The <title> of a post whose title already starts with the brand, so it never repeats another page's title. */
        brandedTitle: '{title} – TablePro Blog',
        correction: 'Correction, {date}',
        toc: 'On this page',
        related: 'Related posts',
    },
};
