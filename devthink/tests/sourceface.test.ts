// # sourceface.test — the entry html guard (the devfold lesson): the
// workbench index.html rides the source face — the module entry points
// at App.tsx, never at a hashed bundle reference (a fresh checkout can
// never resolve the built form because the hashed artifacts stay
// gitignored, and the static workbench lane builds from source). the
// guard refuses the built form the same way the restore:entry seat of
// the family does, so no verification build ever commits the wrong
// face again. runnable with vitest: pnpm vitest run tests/sourceface.test.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("the workbench entry html rides the source face", () => {
  it("points the module entry at App.tsx, never at a hashed bundle", async () => {
    const html = await readFile(join(import.meta.dirname, "..", "index.html"), "utf8");
    const entry = /<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*>/.exec(html);
    expect(entry, "the module entry script exists").not.toBeNull();
    expect(entry![1], "the entry rides the App.tsx source face").toMatch(/App\.tsx$/);
    expect(html, "no hashed bundle reference rides the entry").not.toMatch(
      /(?:src|href)="\/index-[A-Za-z0-9_-]+\./,
    );
  });
});
