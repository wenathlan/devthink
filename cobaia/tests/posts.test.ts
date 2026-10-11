// # posts.test — the seed blog of the family site.
// Run: pnpm vitest run tests/posts.test.ts
// The suite watches the promise the blog page makes: the index is sorted
// newest first no matter the array order, the slugs are unique and url-safe,
// every seed post carries a real ~300 word body (the ad networks approve
// content, not containers) and the honest word counter agrees with itself.
import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import { POSTS, postindex, postwords } from "../posts.ts";

describe("the seed blog", () => {
  it("carries the three seed posts about the family", () => {
    assert.equal(POSTS.length, 3);
    assert.deepEqual(
      POSTS.map((post) => post.slug),
      ["ten-sites-one-engine", "one-css-one-tree", "no-backend-no-tracking"],
    );
  });

  it("indexes the posts newest first", () => {
    const index = postindex();
    assert.deepEqual(
      index.map((post) => post.slug),
      ["ten-sites-one-engine", "one-css-one-tree", "no-backend-no-tracking"],
    );
    for (let i = 1; i < index.length; i++) {
      assert.ok(index[i - 1].date >= index[i].date, "the index must be sorted by date, newest first");
    }
  });

  it("does not mutate the source order when indexing", () => {
    const before = POSTS.map((post) => post.slug).join(",");
    postindex();
    assert.equal(POSTS.map((post) => post.slug).join(","), before);
  });

  it("keeps the slugs unique and url-safe", () => {
    const slugs = POSTS.map((post) => post.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const slug of slugs) {
      assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("dates every post in iso form and before the wave", () => {
    for (const post of POSTS) {
      assert.match(post.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(post.date <= "2026-10-10", "a seed post cannot be dated in the future");
    }
  });

  it("writes a real ~300 word body for every post", () => {
    for (const post of POSTS) {
      const words = postwords(post);
      assert.ok(words >= 250, `${post.slug} carries ${words} words — the seed posts ship real content`);
      assert.ok(words <= 380, `${post.slug} carries ${words} words — the seed posts stay ~300`);
      assert.ok(post.excerpt.length > 40, `${post.slug} must carry a real excerpt`);
      assert.ok(post.body.length >= 3, `${post.slug} must carry more than two paragraphs`);
    }
  });

  it("counts words the honest way (split, no empties)", () => {
    const first = POSTS[0];
    expect(postwords(first)).toBe(first.body.join(" ").split(/\s+/).filter(Boolean).length);
  });
});
