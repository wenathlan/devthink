/**
 * routesdual.test.ts — the dual door law of the family routes (the PR10
 * contract, campaign wave 1-e). The owner order: the typed url owns the
 * fullscreen stage, the double click owns the system window, and both faces
 * stay one design — the same app document serves both doors. This battery
 * walks the whole routing table so no app of the eleven ever answers one
 * door without the other:
 *
 * - the routing table: every family deploy unit of window.ts (the ten
 *   slugs beside the os) answers a FamilyStage route in the theme router
 *   (the fullscreen stage the typed url owns), a registry binding of the
 *   external kind (the desktop icon whose double click opens the window),
 *   a power clip window row, a reviewed label row and a drawn icon asset;
 * - the typed url: familyurl resolves the subpath of every deploy unit
 *   under the pages base, the pages workflow builds every unit under its
 *   own subpath and the FamilyStage renders the app fixed to the viewport
 *   with no shell and no window;
 * - the window: the workspace opens the external target as the power clip
 *   window through toggleWindow — the panel never navigates away — and
 *   every registry row of the family resolves through that branch;
 * - the sync: both faces mount the same url (the FamilyFrame and the
 *   FamilyStage ask familyurl for the same document) and every sibling app
 *   carries the embedded contract in its own theme (the frame detection
 *   that renders the routed page bare inside the os window, the full
 *   surface at the typed url).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DESKTOP_APPS, FAMILY_APP_IDS, isFamilyApp } from "../appregistry.ts";
import { osAppLabels } from "../catalog.ts";
import { familyurl } from "../gateway.ts";
import { FAMILY_SLUGS, windowapp, windowcatalog } from "../window.ts";
import { APP_ICONS } from "../Sol/wingets/ShellAppicons.tsx";

const router = readFileSync(join(import.meta.dirname, "..", "Sol", "Sol.tsx"), "utf8");
const workspace = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "PanelWorkspace.tsx"), "utf8");
const familyframe = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "ShellFamilyframe.tsx"), "utf8");
const solcss = readFileSync(join(import.meta.dirname, "..", "Sol", "sol.css"), "utf8");
const viteconfig = readFileSync(join(import.meta.dirname, "..", "vite.config.ts"), "utf8");
/** the pages workflow of the monorepo checkout — null inside the standalone
 * container context (the container carries the application tree alone, never
 * the repository workflows folder), where the workflow contract check below
 * skips the same way the other checkout-only gates skip on absent files. */
const pagesworkflow = existsSync(join(import.meta.dirname, "..", "..", ".github", "workflows", "pages.yml"))
  ? readFileSync(join(import.meta.dirname, "..", "..", ".github", "workflows", "pages.yml"), "utf8")
  : null;

/** the repository root of the monorepo (the sibling apps live beside the
 * devthink folder and the tests village sits two honest hops above them,
 * inside the app folder) */
const reporoot = join(import.meta.dirname, "..", "..");

/** true when the sibling app trees live beside the os — false inside the
 * standalone container context (the container carries the application tree
 * alone, never the sibling folders), where the sibling contract checks
 * skip the same checkout-only way the pages workflow check skips. */
const siblingspresent = existsSync(join(reporoot, "argan"));

/** collects every .tsx file under one folder tree (the sibling theme scan) */
function collectTsx(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) out.push(full);
    }
  };
  walk(root);
  return out;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the routing table (every app answers both doors)", () => {
  it("carries the ten family deploy units beside the os — the eleven of the catalog", () => {
    expect(FAMILY_SLUGS).toHaveLength(10);
    expect(FAMILY_SLUGS).toContain("cobaia");
    expect(new Set(FAMILY_SLUGS).size).toBe(FAMILY_SLUGS.length);
  });

  it("every family slug answers the fullscreen stage route in the theme router", () => {
    // door A inside the os: DevThink barra <app> renders the FamilyStage
    for (const slug of FAMILY_SLUGS) {
      expect(router, `/${slug} must mount the FamilyStage`).toContain(
        "<Route key={slug} path={`/${slug}`} component={() => <FamilyStage slug={slug} />} />",
      );
    }
  });

  it("every family slug answers a registry binding of the external kind (the desktop icon)", () => {
    // door B: the icon whose double click opens the power clip window
    for (const slug of FAMILY_SLUGS) {
      const app = DESKTOP_APPS.find((row) => row.id === slug);
      expect(app, `${slug} rides the desktop registry`).toBeTruthy();
      expect(app?.target).toEqual({ kind: "external", slug });
      expect(FAMILY_APP_IDS.has(slug), `${slug} carries the family identity`).toBe(true);
    }
  });

  it("every family slug answers the power clip window row (the frame body)", () => {
    for (const slug of FAMILY_SLUGS) {
      expect(windowcatalog()[slug], `${slug} opens as a window`).toEqual({ kind: "family", slug });
      expect(windowapp(slug)?.kind, `${slug} binds the family frame`).toBe("family");
    }
  });

  it("every family slug answers a reviewed label row and a drawn icon asset", () => {
    const labels = osAppLabels();
    for (const slug of FAMILY_SLUGS) {
      expect(labels[slug]?.name, `${slug} prints its reviewed name`).toBeTruthy();
      expect(APP_ICONS[slug], `${slug} resolves in the drawn set`).toBeTruthy();
    }
  });

  it("the registry family set and the window catalog agree — no half door", () => {
    const registryFamily = DESKTOP_APPS.filter(isFamilyApp).map((app) => app.id).sort();
    const windowFamily = [...FAMILY_SLUGS].sort();
    expect(registryFamily).toEqual(windowFamily);
  });

  it("the vite dev bridge serves every family slug the window catalog declares", (t) => {
    if (!siblingspresent) {
      t.skip("the sibling app trees live in the repository checkout, not the standalone container context");
      return;
    }
    // the dev server answers the same surface the pages workflow ships:
    // one site, every app under its own subpath
    for (const slug of FAMILY_SLUGS) {
      expect(viteconfig, `${slug} rides the family dev bridge`).toContain(`"${slug}",`);
      expect(existsSync(join(reporoot, slug)), `${slug} lives beside the os`).toBe(true);
    }
  });
});

describe("the typed url owns the fullscreen stage (door A)", () => {
  it("familyurl resolves the subpath of every deploy unit under the pages base", () => {
    vi.stubEnv("BASE_URL", "/devthink/");
    for (const slug of FAMILY_SLUGS) {
      expect(familyurl(slug), `${slug} answers its own subpath`).toBe(`/devthink/${slug}/`);
    }
  });

  it("familyurl answers the flat mount of the dev server and the domain roots", () => {
    vi.stubEnv("BASE_URL", "/");
    for (const slug of FAMILY_SLUGS) {
      expect(familyurl(slug)).toBe(`/${slug}/`);
    }
  });

  it("the pages workflow builds every deploy unit under its own subpath", (t) => {
    if (pagesworkflow === null) {
      t.skip("the pages workflow lives in the repository checkout, not the standalone container context");
      return;
    }
    for (const slug of FAMILY_SLUGS) {
      expect(pagesworkflow, `${slug} rides the pages matrix`).toContain(`{ app: ${slug},`);
    }
    expect(pagesworkflow).toContain("{ app: devthink,");
    expect(pagesworkflow).toContain('VITE_BASE_PATH="/${{ github.event.repository.name }}/${{ matrix.app }}/"');
  });

  it("the FamilyStage renders the app fixed to the viewport — no shell, no window", () => {
    expect(familyframe).toContain("export function FamilyStage({ slug }: { slug: string })");
    expect(familyframe).toContain('position: "fixed",');
    expect(familyframe).toContain("inset: 0,");
    expect(familyframe).toContain('width: "100%",');
    expect(familyframe).toContain('height: "100%",');
    // the stage never mounts the window chrome of the os
    expect(familyframe).not.toContain("WindowFrame");
  });
});

describe("the double click owns the system window (door B — zero redirect)", () => {
  it("the workspace opens the external target as the power clip window", () => {
    expect(workspace).toContain('if (app.target.kind === "external") {');
    expect(workspace).toContain("toggleWindow(app.target.slug, app.name);");
    expect(workspace).toContain("return;");
  });

  it("the external branch never navigates the panel away", () => {
    // the charged defect PR #115 closed: the double click navigated to the
    // fullscreen stage and left the desktop behind — the branch must carry
    // no navigation call of any shape
    const start = workspace.indexOf('if (app.target.kind === "external") {');
    expect(start, "the external branch lives in the workspace").toBeGreaterThan(-1);
    const branch = workspace.slice(start, start + 500);
    expect(branch).not.toContain("onNavigate(");
    expect(branch).not.toContain("setLocation(");
    expect(branch).not.toContain("navigate(");
    expect(workspace).not.toContain("onNavigate(`/${app.target.slug}`)");
  });

  it("the family window body binds the power clip frame of the repository subpath", () => {
    expect(workspace).toContain('component: () => <FamilyFrame slug={slug} />,');
    expect(familyframe).toContain("export function FamilyFrame({ slug, title }: { slug: string; title?: string })");
  });

  it("every registry family app resolves through the window branch — the routing table walks clean", () => {
    for (const app of DESKTOP_APPS.filter(isFamilyApp)) {
      expect(app.target.kind).toBe("external");
      if (app.target.kind !== "external") continue;
      expect(windowapp(app.target.slug), `${app.id} opens the power clip window`).toBeDefined();
    }
  });
});

describe("the native anchors answer both doors with one design (the shared surface)", () => {
  /** the windowed anchor bodies and the page files that carry them — the
   * dual door walk of the native catalog: the typed url mounts the page
   * (door A), the double click mounts the same body inside the os window
   * (door B), and the two faces stay one design through the embedded
   * contract (the body answers the window it rides in, never the browser
   * viewport — the cut-window bug of PR12). The chat body IS the window
   * body and the page (the page mounts the same body unembedded beside
   * the shell). */
  const ANCHOR_PAGES: Record<string, string> = {
    files: "Sol/files/files.tsx",
    calculator: "Sol/calculator/calculator.tsx",
    docs: "Sol/docs/docs.tsx",
    image: "Sol/image/image.tsx",
    games: "Sol/games/games.tsx",
    console: "Sol/console/console.tsx",
    usage: "Sol/usage/usage.tsx",
    settings: "Sol/settings/settings.tsx",
    projects: "Sol/projects/projects.tsx",
    audio: "Sol/audio/audio.tsx",
    video: "Sol/video/video.tsx",
    providers: "Sol/providers/providers.tsx",
    gateway: "Sol/gateway/gateway.tsx",
  };
  const CHATPAGE = "Sol/chat/chat.tsx";

  it("every windowed anchor answers a page file with the embedded contract", () => {
    for (const [id, page] of Object.entries(ANCHOR_PAGES)) {
      const source = readFileSync(join(import.meta.dirname, "..", page), "utf8");
      expect(source.includes("embedded?: boolean"), `${page} carries the embedded prop`).toBe(true);
      if (id === "gateway") {
        // the gateway writes the same law in the ternary shape: the shell
        // rides the page branch only, the window body fills the frame and
        // the embedded height lives in the component stylesheet
        expect(source.includes("<ShellChrome />"), `${page} owns the shell on the page branch`).toBe(true);
        expect(source.includes("gv-embedded"), `${page} carries the embedded surface class`).toBe(true);
        expect(source.includes(".control-page.gv-embedded { min-height: 0; height: 100%;"), `${page} answers the window body height`).toBe(true);
        continue;
      }
      expect(source.includes("{!embedded && <ShellChrome />}"), `${page} retires the shell inside the window`).toBe(
        true,
      );
      expect(source.includes('height: "100%"'), `${page} answers the window body height`).toBe(true);
    }
    // the chat body carries the same contract (the window body and the
    // page body are one component, the embedded flag flips the surface)
    const chatbody = readFileSync(join(import.meta.dirname, "..", "Sol", "wingets", "ChatBody.tsx"), "utf8");
    expect(chatbody.includes("embedded?: boolean"), "the chat body carries the embedded prop").toBe(true);
    const chatpage = readFileSync(join(import.meta.dirname, "..", CHATPAGE), "utf8");
    expect(chatpage.includes("<ShellChrome />"), "the chat page owns the shell").toBe(true);
    expect(chatpage.includes("<ChatBody />"), "the chat page mounts the same body unembedded").toBe(true);
  });

  it("every windowed anchor answers the typed url route (door A — standalone fullscreen)", () => {
    for (const id of [...Object.keys(ANCHOR_PAGES), "chat"]) {
      expect(router, `/${id} mounts its page anchor at the address bar`).toContain(`path="/${id}"`);
    }
  });

  it("every windowed anchor binds the window body of the workspace (door B — zero redirect)", () => {
    const bindings: Record<string, string> = {
      chat: "chat: ChatBody,",
      files: "files: FilesAnchor,",
      calculator: "calculator: CalculatorAnchor,",
      docs: "docs: DocsAnchor,",
      image: "image: ImageAnchor,",
      games: "games: GamesAnchor,",
      console: "console: ConsoleAnchor,",
      usage: "usage: UsageAnchor,",
      settings: "settings: SettingsAnchor,",
      projects: "projects: ProjectsAnchor,",
      audio: "audio: AudioAnchor,",
      video: "video: VideoAnchor,",
      providers: "providers: ProvidersAnchor,",
      gateway: "gateway: GatewayView,",
    };
    for (const [id, binding] of Object.entries(bindings)) {
      expect(windowapp(id), `${id} opens as a window`).toEqual({ kind: "anchor" });
      expect(workspace, `${id} binds its anchor in the workspace map`).toContain(binding);
    }
  });

  it("the shared surface answers both doors — the window body is a size container the host registers", () => {
    // the container law the windowclip battery pins stays wired in the
    // workspace source: the host element rides the WindowBodySurface so
    // the embedded bodies measure the window they ride in
    expect(workspace).toContain("<WindowBodySurface.Provider value={hostRef}>");
    expect(solcss).toContain("container-type: inline-size;");
  });
});

describe("the sync (both faces stay one design)", () => {
  it("the window and the stage mount the same app document", () => {
    // the one url law: the FamilyFrame and the FamilyStage both ask
    // familyurl for the slug — the same build serves the window and the
    // typed url, so the design can never drift between the faces. the
    // window face appends the opt-in clip flag on the same document (the
    // in-window compact the siblings may adopt — never a second design)
    expect(familyframe).toContain("src={familyurl(slug)}");
    expect(familyframe).toContain("src={`${familyurl(slug)}?clip=1`}");
  });

  it("the power clip carries the opt-in clip flag — the stage never does", () => {
    // the PR12 law: same design, the space clamps — the ?clip=1 param is
    // the only signal the in-window document gets; a sibling that reads
    // it may compact its chrome to the window band, one that does not
    // keeps answering exactly as before, and the fullscreen stage (the
    // typed url) never carries it
    const windowStart = familyframe.indexOf("export function FamilyFrame");
    const stageStart = familyframe.indexOf("export function FamilyStage");
    expect(windowStart, "the FamilyFrame lives in the familyframe source").toBeGreaterThan(-1);
    expect(stageStart, "the FamilyStage lives in the familyframe source").toBeGreaterThan(windowStart);
    expect(familyframe.slice(windowStart, stageStart)).toContain("?clip=1");
    expect(familyframe.slice(stageStart)).not.toContain("clip=1");
  });

  it("every sibling app carries the embedded contract in its own theme", (t) => {
    if (!siblingspresent) {
      t.skip("the sibling app trees live in the repository checkout, not the standalone container context");
      return;
    }
    // the frame detection: inside the os power clip the app rides the host
    // window chrome (the routed page renders bare); at the typed url the
    // app owns the whole viewport with its own voice
    for (const slug of FAMILY_SLUGS) {
      const solroot = join(reporoot, slug, "Sol");
      expect(existsSync(solroot), `${slug} carries the Sol theme`).toBe(true);
      const files = collectTsx(solroot);
      expect(files.length, `${slug} theme carries tsx sources`).toBeGreaterThan(0);
      const framed = files.some((file) => readFileSync(file, "utf8").includes("window.self !== window.top"));
      expect(framed, `${slug} answers the embedded contract of the power clip`).toBe(true);
    }
  });

  it("the standalone apps boot with the zoom zero viewport every index declares", (t) => {
    if (!siblingspresent) {
      t.skip("the sibling app trees live in the repository checkout, not the standalone container context");
      return;
    }
    // the PR18 law from the index: the viewport meta pins the zoom at the
    // 100 percent baseline on every app of the family
    for (const app of ["devthink", ...FAMILY_SLUGS]) {
      const index = readFileSync(join(reporoot, app, "index.html"), "utf8");
      expect(index, `${app} pins the zoom zero viewport`).toContain("minimum-scale=1.0, maximum-scale=1.0");
      expect(index).toContain("user-scalable=no");
    }
  });
});
