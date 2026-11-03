/**
 * posts.ts — the typed accessor of the seed blog: the thin door the blog
 * page and the tests import, answering the posts of the content lane
 * (content.ts — the manifest; db.ts — the content_rows table; the platform
 * gateway — GET /api/v1/ui/content). The data never lives here anymore:
 * posts() answers the live rows the platform served, the manifest seed
 * otherwise (the uistore chain), the index sort and the honest word count
 * stay exactly where they rode, and the blog index (/blog) renders the
 * sorted index and the full bodies through this door — real, written
 * content about how the family is built, so the site is useful on its own
 * merits (the ad networks approve content, not containers). New posts
 * append to the manifest; the index sorts by date, so the manifest order
 * never matters.
 */

import { type blogpost, contenttable, seedPosts } from "./content.ts";

export type { blogpost };

/**
 * The typed accessor of the blog: the live db rows when the platform
 * answered, the manifest seed otherwise.
 *
 * @returns the posts of the blog.
 */
export function posts(): readonly blogpost[] {
  return contenttable("posts", seedPosts);
}

/**
 * Builds the blog index: the posts sorted by date, newest first. The ISO
 * date sort is lexicographic and stable, so the index order never depends
 * on the row order the store answers.
 *
 * @returns the posts of the blog, newest first.
 */
export function postindex(): readonly blogpost[] {
  return [...posts()].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
}

/**
 * Counts the words of one post's body — the honest length measure the tests
 * and the page footer can both read.
 *
 * @param post the post to measure.
 * @returns the total word count across the body paragraphs.
 */
export function postwords(post: blogpost): number {
  return post.body.join(" ").split(/\s+/).filter(Boolean).length;
}
