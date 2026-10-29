/**
 * blog page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file.
 *
 * The update blog of the cobaia content site: the sorted index (the pure
 * posts module at the app root owns the posts and the ordering) and the full
 * bodies rendered below as real articles — the in-article surface of the
 * site. Every post title wears the trylle display type (the clamp, the
 * -0.02em track) so the articles open like the site hero does. The tree
 * rule keeps this one page (no post subfolders), so every post anchors in
 * place and the index links jump to the article.
 */
import type { CSSProperties } from "react";
import { postindex, postwords, type blogpost } from "../../posts";
import { labelfill, label } from "../../labels";
import { AdSlot } from "../wingets";

/** the meta line of one post: the date and the honest word count. */
function PostMeta({ post }: { post: blogpost }) {
  return (
    <p className="cb-postdate">
      {labelfill("blog.post.meta", {
        date: post.date,
        words: String(postwords(post)),
        tags: post.tags.join(" / "),
      })}
    </p>
  );
}

export function Blog() {
  const posts = postindex();
  return (
    <div className="cb-page">
      <section className="cb-hero" aria-label={label("blog.aria.hero")}>
        <p className="cb-eyebrow cb-in" style={{ "--cb-d": 0 } as CSSProperties}>
          {label("blog.eyebrow")}
        </p>
        <h1 className="cb-title cb-in" style={{ "--cb-d": 1 } as CSSProperties}>
          {label("blog.title")}
        </h1>
        <p className="cb-lede cb-in" style={{ "--cb-d": 2 } as CSSProperties}>
          {label("blog.lede")}
        </p>
      </section>

      <section className="cb-section" aria-label={label("blog.section.indexAria")}>
        <ul className="cb-postlist">
          {posts.map((post, index) => (
            <li key={post.slug} className="cb-postrow cb-in" style={{ "--cb-d": index + 1 } as CSSProperties}>
              <PostMeta post={post} />
              <a className="cb-postlink" href={`#${post.slug}`}>
                {post.title}
              </a>
              <p className="cb-postexcerpt">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cb-section" aria-label={label("blog.section.fullAria")}>
        {posts.map((post) => (
          <article key={post.slug} id={post.slug} className="cb-article" aria-label={post.title}>
            <h2 className="cb-posttitle">{post.title}</h2>
            <PostMeta post={post} />
            <div className="cb-articlebody">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      {/* the one reserved ad slot of the page, after the articles */}
      <AdSlot page="blog" />
    </div>
  );
}

export default Blog;
