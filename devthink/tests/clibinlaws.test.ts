/**
 * clibinlaws.test.ts — the ansi color law of the family clibin seats (the
 * PR13 regression battery of the 2.0.178 wave). The owner order: the cli
 * binary of every application carries the same windows 11 chat console
 * the web and desktop surfaces render — and the console only speaks the
 * family palette when every chrome token rides the complete ansi escape.
 * This battery pins the law in its true form: the ten sibling seats
 * always carried the complete escapes, and the sighting that read a bare
 * "\x1b" (an escape without its color instruction) was a display
 * artifact — the terminal renderer consumes the "\x1b[…m" notation as a
 * live color and hides it from the reader, the same artifact that once
 * painted a false `branches: ain]` over the workflows. The battery reads
 * the source text the way the compiler does, so the law stays provable
 * whatever the display eats.
 *
 * - the token law: every clibin seat declares its five chrome tokens
 *   (accent, focus, hover, ink, reset) as the complete escape forms —
 *   the accent the ansi 256 seat 117 (#a3d7e6, the family accent), the
 *   focus the seat 75 (#4cc2ff), the hover the seat 203 (rgb(232,17,35),
 *   the close red), the ink the dim escape and the reset the zero form —
 *   and a bare "\x1b" token (an escape without its instruction) never
 *   rides a seat;
 * - the eleven seat law: every application of the family — the ten
 *   siblings beside the os — carries the chat console seat in its cli
 *   entry (the renderchat walk with the titlebar, the top rule, the ❯
 *   prompt and the dispatch), so the unified chat interface answers on
 *   all eleven terminals (the 2.0.178 wave closed the os gap: the
 *   devthink entry was the one family binary without the console);
 * - the registry law: the os command registry lists the chat command on
 *   the terminal surface, so `devthink help` shows the console seat and
 *   the discovery surface never hides it;
 * - the dispatch law: the os cli entry routes the chat command to the
 *   renderchat walk, so `devthink chat` opens the console the same way
 *   the sibling binaries answer their own name.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** the repository root of the monorepo (the sibling apps live beside the os folder and the tests village sits two honest hops above them). */
const reporoot = join(import.meta.dirname, "..", "..");

/** the eleven applications of the family (the os beside the ten siblings). */
const FAMILYAPPS = [
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "devthink",
  "forge",
  "foundry",
  "getry",
  "saddle",
  "stealthhead",
  "vault",
] as const;

/** the chrome token rows the battery walks: the seat name, the complete escape the token must ride and the family law the color answers. */
const CHROMETOKENS = [
  { name: "accent", escape: "\\x1b[38;5;117m", law: "the family accent #a3d7e6 on ansi 117" },
  { name: "focus", escape: "\\x1b[38;5;75m", law: "the family focus #4cc2ff on ansi 75" },
  { name: "hover", escape: "\\x1b[38;5;203m", law: "the close red rgb(232,17,35) on ansi 203" },
  { name: "ink", escape: "\\x1b[2m", law: "the dim ink of the description rows" },
  { name: "reset", escape: "\\x1b[0m", law: "the reset token that closes every colored run" },
] as const;

/** the token spellings the seats carry (the plain family form and the chat-prefixed os and saddle form). */
const TOKENSPELLINGS = [
  { plain: "ACCENT", prefixed: "CHATACCENT" },
  { plain: "FOCUS", prefixed: "CHATFOCUS" },
  { plain: "HOVER", prefixed: "CHATHOVER" },
  { plain: "INK", prefixed: "CHATINK" },
  { plain: "RESET", prefixed: "CHATRESET" },
] as const;

/** reads one sibling cli entry — the walk skips honestly when a checkout carries no sibling tree (the container context law the sibling batteries share). */
function clisource(app: string): string | null {
  const file = join(reporoot, app, "cli.ts");
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

describe("the ansi color law of the family clibin seats", () => {
  for (const app of FAMILYAPPS) {
    it(`${app} rides the complete escape on every chrome token`, () => {
      const source = clisource(app);
      if (source === null) return; /* the container checkout law: a missing sibling tree skips, the monorepo walk answers */
      for (let index = 0; index < CHROMETOKENS.length; index += 1) {
        const token = CHROMETOKENS[index]!;
        const spelling = TOKENSPELLINGS[index]!;
        const plain = `const ${spelling.plain} = "${token.escape}" as const;`;
        const prefixed = `const ${spelling.prefixed} = "${token.escape}" as const;`;
        expect(
          source.includes(plain) || source.includes(prefixed),
          `${app} cli.ts must declare the ${token.name} token as the complete escape (${token.law}) — the bare escape byte alone never paints a color`,
        ).toBe(true);
        const bare = `= "\\x1b" as const;`;
        expect(
          source.includes(bare),
          `${app} cli.ts must never declare a chrome token as the bare escape byte (the healed defect: an escape without its instruction paints nothing and risks mangling the next glyph)`,
        ).toBe(false);
      }
    });
  }
});

describe("the eleven seat law of the unified chat interface", () => {
  for (const app of FAMILYAPPS) {
    it(`${app} carries the chat console seat in its cli entry`, () => {
      const source = clisource(app);
      if (source === null) return; /* the container checkout law */
      /* the family truth: the plain seats boot the console as their whole
       * main walk (the binary is the console), the multi-command seats
       * (saddle, getry, the os) expose a named renderchat walk their chat
       * command routes to — both spellings answer the same unified chat
       * interface, so the battery pins the chat look itself: the ❯ prompt
       * and the same-design line every seat prints. */
      expect(
        source.includes("❯"), `${app} cli.ts must carry the ❯ prompt of the chat console (PR13: interface unificada de chat para os onze aplicativos dentro do terminal)`,
      ).toBe(true);
      expect(
        source.includes("same design as web / desktop"),
        `${app} cli.ts must print the same-design line of the family chat console`,
      ).toBe(true);
    });
  }
});

describe("the os chat registry and dispatch laws", () => {
  it("the os command registry lists the chat command on the terminal surface", () => {
    const views = readFileSync(join(reporoot, "devthink", "views.ts"), "utf8");
    expect(views.includes('id: "chat"'), "the terminal surface of views.ts must list the chat command").toBe(true);
  });

  it("the os cli entry routes the chat command to the renderchat walk", () => {
    const cli = readFileSync(join(reporoot, "devthink", "cli.ts"), "utf8");
    expect(cli.includes('command === "chat"'), "the os cli dispatch must route the chat command").toBe(true);
    expect(cli.includes("await renderchat()"), "the chat dispatch must open the console walk").toBe(true);
  });
});
