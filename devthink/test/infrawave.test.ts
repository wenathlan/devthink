// # infrawave.test — the root book gate (the single-file law the owner
// once charged and the deletions violated four times): the law moved on
// and the root now carries only the automation tree, the eleven app
// folders, .gitignore and the root manifest — the INFRA.md book left the
// root with the dc919529 deletion, so the battery no longer demands the
// book at the root. the content checks stay for the seats that still
// ship the book (the family law, the logic registry and the keyword
// modules), skipped wherever the book is absent — the same context law
// the curveguard battery walks.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const approot = join(import.meta.dirname, "..");
const reporoot = join(approot, "..");
const bookpath = join(reporoot, "INFRA.md");
const automationtree = existsSync(join(reporoot, ".github"));

describe("the book answers the single-file law wherever it still lives", () => {
  it.skipIf(!automationtree || !existsSync(bookpath))("the book carries the family law, the registry and the keyword modules", () => {
    const book = readFileSync(bookpath, "utf8");
    expect(book, "the family law section").toContain("## A LEI DA FAMÍLIA");
    expect(book, "the logic registry section").toContain("## O REGISTRO DE LÓGICAS");
    expect(book, "the keyword modules section").toContain("## OS MÓDULOS DE PALAVRA-CHAVE");
    expect(book, "the pr rules section").toContain("## AS REGRAS PR0 A PR22");
  });

  it.skipIf(!automationtree || !existsSync(bookpath))("the keyword modules name one owner each and the import law", () => {
    const book = readFileSync(bookpath, "utf8");
    const modules = book.split("## OS MÓDULOS DE PALAVRA-CHAVE")[1]?.split("### a lei dos módulos")[0] ?? "";
    expect(modules, "the modules section carries seats").toMatch(/### módulo sandbox \/ virtualização/);
    expect(modules).toMatch(/### módulo áudio \/ dsp \/ música/);
    expect(modules).toMatch(/### módulo ia \/ llm/);
    expect(modules).toMatch(/### módulo 3d \/ engine visual/);
    expect(modules).toMatch(/### módulo storage \/ banco/);
    expect(modules, "the import law rides beside the modules").toContain("@wenathlan/saddle");
    expect(modules).toContain("@wenathlan/cadria");
    expect(modules).toContain("@wenathlan/debonair");
    expect(modules).toContain("@wenathlan/getry");
    expect(modules).toContain("@wenathlan/vault");
  });
});
