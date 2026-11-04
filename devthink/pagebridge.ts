import type { observation, regionrect, resolvedtarget, toolstep } from "./types.js";
import { maskformstate, maskobservation, masktypedvalues } from "./security.js";
import { runpageaction, type stepresult } from "./page.js";
import { runpageread } from "./page.js";
import { runpagecontrol } from "./page.js";
import { runinteractstep } from "./page.js";
import { runpointerstep } from "./page.js";
import { runpagenav } from "./page.js";
import { harvestdialoglog, type observeddialog } from "./page.js";
import { builda11ytree, buildpagetree, buildreader, runpageobservation } from "./page.js";
import { collecttables, detectlistpatterns, collectsiblings, normalizetable, runpagedetection } from "./page.js";
import { runpagewatch } from "./page.js";
import { runcdpstep, rundebugwatch, flushconsole } from "./page.js";
import { runprofilestep } from "./page.js";
import { runemulationstep, revertemulationlayer } from "./page.js";
import { runpageform } from "./page.js";
import { runpagewizard } from "./page.js";
import { runpagedata } from "./page.js";
import { checksum } from "./data.js";
import { clean, elementlabel as label, elementselector as selector, resolvestep } from "./page.js";

/**
 * Page bridge for reviewed steps.
 * Correlated rules for the dispatch seam, semantic snapshots, target preview with resolution, dialog log reads and the original action set live in this file.
 */

function stepoptions(step: toolstep): Record<string, unknown> {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Routes one reviewed step to the execution environment the policy names: dom actions that need page events keep this pagecontext bridge because page events only fire in the live page, evaluate steps run inside the isolated world the background injects through the scripting api, parse heavy read kinds may offload into the offscreen worker pool behind the granted capability and a step carrying untrusted markup renders inside the sandboxframe — this bridge itself only ever executes the pagecontext steps. */
export function routesenvironment(step: toolstep): "pagecontext" | "elsewhere" {
  if (step.environment !== undefined && step.environment !== "pagecontext") return "elsewhere";
  if (step.kind === "evaluate") return "elsewhere";
  const options = stepoptions(step);
  if (typeof options.markup === "string" && options.markup.trim() !== "") return "elsewhere";
  return "pagecontext";
}

const previewid = "devthinktargetpreview";

function clearpreview(): void {
  document.getElementById(previewid)?.remove();
}

/** Shows an ephemeral outline only; it neither mutates page data nor dispatches page events. */
export function previewtarget(
  step: toolstep,
  expectedorigin: string,
): { ok: boolean; summary: string; resolvedtarget?: resolvedtarget; candidates?: string[] } {
  if (location.origin !== expectedorigin) return { ok: false, summary: "Page origin changed before preview." };
  clearpreview();
  const resolution = resolvestep(step, document);
  if (resolution.status === "ambiguous")
    return {
      ok: false,
      summary: `The reviewed ${resolution.mode} reference matched ${resolution.candidates.length} elements: ${resolution.candidates.join("; ")}.`,
      candidates: resolution.candidates,
    };
  if (resolution.status !== "resolved") return { ok: false, summary: "Reviewed target is no longer available." };
  const target = resolution.element;
  const rect = target.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return { ok: false, summary: "Reviewed target is not currently visible." };
  const overlay = document.createElement("div");
  overlay.id = previewid;
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    left: `${Math.max(0, rect.left - 3)}px`,
    top: `${Math.max(0, rect.top - 3)}px`,
    width: `${rect.width + 6}px`,
    height: `${rect.height + 6}px`,
    border: "3px solid #2f80ed",
    borderRadius: "6px",
    boxShadow: "0 0 0 3px rgba(47,128,237,.28)",
    pointerEvents: "none",
    zIndex: "2147483647",
    boxSizing: "border-box",
  });
  document.documentElement.append(overlay);
  window.setTimeout(clearpreview, 5000);
  return {
    ok: true,
    summary: `Previewing ${label(target) || target.tagName.toLowerCase()} for five seconds.`,
    resolvedtarget: resolution.target,
  };
}

/** Captures the complete semantic page context for a user-approved active tab, including the a11y, reader, listpattern and tableshape observation sections. */
export function capturesnapshot(): observation {
  const candidates = [
    ...document.querySelectorAll(
      "a[href], button, input, textarea, select, [role=button], [role=link], [role=combobox], [role=option], [role=checkbox], [role=radio], [role=switch], [role=tab], details, summary",
    ),
  ];
  const interactive = candidates
    .map((element) => ({
      selector: selector(element),
      role: element.getAttribute("role") || element.tagName.toLowerCase(),
      label: label(element),
    }))
    .filter((item) => item.label || item.role);
  const forms = [...document.querySelectorAll("input, textarea, select")].map((element) => ({
    label: label(element),
    type: element.getAttribute("type") || element.tagName.toLowerCase(),
    name: element.getAttribute("name") || "",
    ...(element instanceof HTMLSelectElement
      ? { options: [...element.options].map((option) => clean(option.textContent || option.value)) }
      : {}),
  }));
  const text = clean(document.body?.innerText || "");
  const tree = buildpagetree(document);
  const tables = collecttables(document).map((entry) => {
    const shape = normalizetable(entry.rows, entry.caption);
    return {
      selector: entry.selector,
      headers: shape.headers,
      columns: shape.columns,
      rows: shape.rows,
      caption: shape.caption,
    };
  });
  return {
    schemaversion: 3,
    url: location.href,
    title: clean(document.title),
    textpreview: text,
    textlength: document.body?.innerText.length ?? 0,
    forms,
    interactive,
    capturedat: Date.now(),
    mode: "passive",
    digest: pagedigest(),
    a11y: builda11ytree(tree),
    reader: buildreader(tree, clean(document.title)),
    listpattern: detectlistpatterns(collectsiblings(document)),
    tableshape: tables,
  };
}

/** Reads and clears the dialog log the main world handler recorded on the shared document. */
export function readdialogs(): observeddialog[] {
  return harvestdialoglog(document);
}

/** Extracts full, read-only structured content for a reviewed extraction step. */
function extractcontent(targetselector: string | undefined, root: Document): stepresult {
  if (!targetselector) {
    const links = [...root.querySelectorAll("a[href]")].map((element) => {
      const href = element instanceof HTMLAnchorElement ? (element.getAttribute("href") ?? "") : "";
      return { text: element.textContent?.trim() ?? "", href };
    });
    return { ok: true, summary: `Extracted ${links.length} link entries.`, details: { links } };
  }
  const target = root.querySelector(targetselector);
  if (!target) return { ok: false, summary: "Extraction target is no longer available." };
  const text = target.textContent ?? "";
  return { ok: true, summary: `Extracted ${text.length} characters of content.`, details: { text } };
}

/** Scrolls one reviewed target into view without reading or changing other page state. */
function scrolltarget(target: HTMLElement): stepresult {
  target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  return { ok: true, summary: `Scrolled ${label(target) || target.tagName.toLowerCase()} into view.` };
}

/** Dispatches hover events on one reviewed target. */
function hovertarget(target: HTMLElement): stepresult {
  for (const type of ["pointerover", "mouseover", "pointerenter"] as const) {
    target.dispatchEvent(
      new PointerEvent(type, { bubbles: type !== "pointerenter", cancelable: true, composed: true }),
    );
  }
  target.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false, cancelable: true }));
  return { ok: true, summary: `Hover events delivered to ${label(target) || target.tagName.toLowerCase()}.` };
}

/** Selects one reviewed existing option; values outside the declared options are refused. */
function selectoption(target: HTMLElement, value: string): stepresult {
  if (!(target instanceof HTMLSelectElement)) return { ok: false, summary: "Target is not a select element." };
  const option = [...target.options].find(
    (candidate) => candidate.value === value || candidate.textContent?.trim() === value,
  );
  if (!option) return { ok: false, summary: "Reviewed option is not part of the select element." };
  target.value = option.value;
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
  return { ok: true, summary: `Selected ${clean(option.textContent || option.value)}.` };
}

const readkinds: ReadonlySet<string> = new Set([
  "readattribute",
  "readstyle",
  "readgeometry",
  "readvalue",
  "readtext",
  "readhtml",
  "countelements",
  "readtable",
  "readlinks",
  "readimages",
  "readmeta",
  "readforms",
  "readstorage",
  "waitfor",
  "waittext",
  "highlight",
  "mapclicks",
  "verifyvisible",
  "verifyenabled",
  "resolvexpath",
]);
const mutatingkinds: ReadonlySet<string> = new Set([
  "presskey",
  "clickdeep",
  "rightclick",
  "doubleclick",
  "drag",
  "drop",
  "upload",
  "clear",
  "check",
  "uncheck",
  "toggle",
  "submit",
  "setattribute",
  "removeattribute",
  "writestorage",
  "evaluate",
  "fullscreen",
]);
const controlkinds: ReadonlySet<string> = new Set([
  "typetime",
  "appendtext",
  "setvalue",
  "typeedit",
  "keyhold",
  "keyrelease",
  "submitsearch",
  "selectmulti",
  "chooseradio",
  "setslider",
  "setdate",
  "setcolor",
  "expanddetails",
]);
const interactkinds: ReadonlySet<string> = new Set([
  "clicktext",
  "clickaria",
  "clickname",
  "pierceshadow",
  "enterframe",
]);
const pointerkinds: ReadonlySet<string> = new Set(["movepointer", "clickpoint", "shiftclick"]);
const observationkinds: ReadonlySet<string> = new Set([
  "a11ytree",
  "readvisible",
  "readertree",
  "readoutline",
  "readselection",
  "readopengraph",
  "readlang",
  "detectlanguage",
  "listshadow",
  "listframes",
]);
const detectionkinds: ReadonlySet<string> = new Set([
  "detectlists",
  "detecttables",
  "detectinfinitescroll",
  "detectvirtual",
  "detectlazy",
  "detectsticky",
  "detectscrolllock",
  "countpages",
  "classifypage",
  "fingerprintsection",
  "readscrollpos",
]);
const watchstepkinds: ReadonlySet<string> = new Set([
  "watchmutate",
  "watchbanner",
  "watchfocus",
  "waitquiet",
  "readjson",
  "diffsnapshots",
  "deriveselector",
]);
const debugstepkinds: ReadonlySet<string> = new Set(["watchconsole", "watcherrors", "watchtasks"]);
const cdpstepkinds: ReadonlySet<string> = new Set([
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "watchcdp",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "overridescript",
]);
const profilestepkinds: ReadonlySet<string> = new Set([
  "measureflow",
  "heapshot",
  "trackmemory",
  "profilecpu",
  "watchshifts",
  "traceload",
  "capturesourcemaps",
]);
const emulationstepkinds: ReadonlySet<string> = new Set([
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "blackboxscripts",
]);
const navstepkinds: ReadonlySet<string> = new Set([
  "waitload",
  "waiturl",
  "followlink",
  "spanav",
  "spawait",
  "rewritequery",
  "setfragment",
  "stopnav",
  "prefetch",
  "preconnect",
  "printpdf",
]);
const formkinds: ReadonlySet<string> = new Set([
  "fillform",
  "filllabel",
  "fillplaceholder",
  "detectfields",
  "generatevalues",
  "readerrors",
  "skiphoneypot",
  "detectlogin",
  "detecttemplate",
  "handoffcaptcha",
  "asksubmit",
  "submitform",
  "consentpassword",
  "attachfile",
]);
const wizardkinds: ReadonlySet<string> = new Set([
  "runwizard",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "fillcard",
  "fillcode",
]);
const datastepkinds: ReadonlySet<string> = new Set(["scrapetable", "paginateextract"]);

/** Derives the deterministic page digest of one page state from its url, title and text length; checkpoints compare their digest against it before a resume continues. */
export function digestof(input: { url: string; title: string; textlength: number }): string {
  return `page:${checksum(`${input.url}|${input.title}|${input.textlength}`)}`;
}

/** Reports the final url of the live page after its redirect chain so the urlhistory records the url the run landed on. */
export function pagefinalurl(): string {
  return location.href;
}

/** Reads the digest of the live page so a checkpoint revalidates the page it captured. */
export function pagedigest(): string {
  return digestof({
    url: location.href,
    title: clean(document.title),
    textlength: document.body?.innerText.length ?? 0,
  });
}

/** The idempotencykeys this page context already executed; a replay of the same key skips the duplicate. */
const executedstepkeys = new Set<string>();

/** Reads the idempotency verdict of one step: a key the page context already executed skips while an unknown or absent key runs. */
export function idempotencyverdict(
  step: toolstep,
  executedkeys: ReadonlySet<string>,
): { skip: boolean; summary: string } {
  if (step.idempotencykey === undefined || step.idempotencykey.trim() === "")
    return { skip: false, summary: "The step carries no idempotencykey; it runs exactly as reviewed." };
  if (executedkeys.has(step.idempotencykey))
    return {
      skip: true,
      summary: `The idempotencykey ${step.idempotencykey} already executed in this page context; the replay skips the duplicate so the side effect never repeats.`,
    };
  return {
    skip: false,
    summary: `The idempotencykey ${step.idempotencykey} is unknown to this page context; the step runs exactly once.`,
  };
}

/** Clears the executed idempotencykeys of the page context; a fresh run starts with an empty key set. */
export function resetidempotency(): void {
  executedstepkeys.clear();
}

/** Builds the checkpoint payload after one successfully executed sensitive step: the run, the step boundary, the completed steps and the digest of the page it captured. */
export function checkpointafterstep(input: {
  step: toolstep;
  runid: string;
  completed: string[];
}): { runid: string; stepid: string; completed: string[]; digest: string } | undefined {
  if (input.step.risk !== "sensitive") return undefined;
  return { runid: input.runid, stepid: input.step.id, completed: [...input.completed], digest: pagedigest() };
}

/** Performs one local action after the background policy gate and a fresh target resolution; the 1.1.70 family executes steps keyed by their idempotencykey so replays stay deduplicated. */
export async function performstep(
  step: toolstep,
  expectedorigin: string,
  rootdocument: Document = document,
): Promise<stepresult> {
  if (location.origin !== expectedorigin) return { ok: false, summary: "Page origin changed before action." };
  const idempotency = idempotencyverdict(step, executedstepkeys);
  if (idempotency.skip)
    return { ok: true, summary: idempotency.summary, details: { replay: true, idempotencykey: step.idempotencykey } };
  const output = await performstepinner(step, expectedorigin, rootdocument);
  if (output.ok && step.idempotencykey !== undefined && step.idempotencykey.trim() !== "")
    executedstepkeys.add(step.idempotencykey);
  return output;
}

/** Runs the reviewed dispatch of one step inside the page after the idempotency gate cleared it. */
async function performstepinner(step: toolstep, expectedorigin: string, rootdocument: Document): Promise<stepresult> {
  if (step.kind === "observe") return { ok: true, summary: "Observation completed." };
  if (step.kind === "wait") {
    const requested = step.value ? Number.parseInt(step.value, 10) : 250;
    const duration = Number.isFinite(requested) && requested > 0 ? requested : 0;
    return new Promise((resolve) =>
      window.setTimeout(
        () => resolve({ ok: true, summary: `Reviewed wait of ${duration} milliseconds completed.` }),
        duration,
      ),
    );
  }
  if (step.kind === "extract") return extractcontent(step.target, rootdocument);
  if (step.kind === "navigate") {
    if (!step.value || new URL(step.value).origin !== expectedorigin)
      return { ok: false, summary: "Navigation target is outside the approved origin." };
    location.assign(step.value);
    return { ok: true, summary: "Navigation request sent." };
  }
  if (step.kind === "reload") {
    location.reload();
    return { ok: true, summary: "Page reload requested." };
  }
  if (step.kind === "back") {
    history.back();
    return { ok: true, summary: "History back requested." };
  }
  if (step.kind === "forward") {
    history.forward();
    return { ok: true, summary: "History forward requested." };
  }
  if (navstepkinds.has(step.kind)) return await runpagenav(step, rootdocument);
  if (step.kind === "writeclipboard") {
    const text = step.value ?? "";
    await navigator.clipboard.writeText(text);
    return {
      ok: true,
      summary: `Wrote ${text.length} reviewed character${text.length === 1 ? "" : "s"} to the clipboard with payload hash ${checksum(text)}.`,
      details: { length: text.length, hash: checksum(text), destination: "clipboard" },
    };
  }
  if (step.kind === "scrollpage") {
    const options = stepoptions(step);
    window.scrollBy({
      left: typeof options.x === "number" ? options.x : 0,
      top: typeof options.y === "number" ? options.y : 600,
      behavior: "auto",
    });
    return { ok: true, summary: "Window scrolled by the reviewed amounts." };
  }
  if (step.kind === "scrollend") {
    window.scrollTo(0, document.documentElement.scrollHeight);
    return { ok: true, summary: "Window scrolled to the page end." };
  }
  if (step.kind === "scrolltop") {
    window.scrollTo(0, 0);
    return { ok: true, summary: "Window scrolled to the page top." };
  }
  const resolution = resolvestep(step, rootdocument);
  if (resolution.status === "ambiguous") {
    return {
      ok: false,
      summary: `The reviewed ${resolution.mode} reference matched ${resolution.candidates.length} elements: ${resolution.candidates.join("; ")}.`,
      details: { mode: resolution.mode, candidates: resolution.candidates },
    };
  }
  const element = resolution.status === "resolved" ? resolution.element : null;
  let result: stepresult | Promise<stepresult>;
  if (formkinds.has(step.kind)) result = runpageform(step, element, rootdocument);
  else if (wizardkinds.has(step.kind)) result = runpagewizard(step, element, rootdocument);
  else if (datastepkinds.has(step.kind)) result = runpagedata(step, element, rootdocument);
  else if (readkinds.has(step.kind)) result = runpageread(step, element, rootdocument);
  else if (controlkinds.has(step.kind)) result = runpagecontrol(step, element, rootdocument);
  else if (interactkinds.has(step.kind)) return await runinteractstep(step, expectedorigin, performstep);
  else if (pointerkinds.has(step.kind)) result = runpointerstep(step, resolution);
  else if (observationkinds.has(step.kind)) result = runpageobservation(step, element, rootdocument);
  else if (detectionkinds.has(step.kind)) result = runpagedetection(step, element, rootdocument);
  else if (watchstepkinds.has(step.kind)) result = runpagewatch(step, element, rootdocument);
  else if (debugstepkinds.has(step.kind)) return await rundebugwatch(step);
  else if (cdpstepkinds.has(step.kind)) return await runcdpstep(step);
  else if (profilestepkinds.has(step.kind)) return await runprofilestep(step);
  else if (emulationstepkinds.has(step.kind)) return await runemulationstep(step);
  else if (mutatingkinds.has(step.kind)) result = runpageaction(step, element);
  else {
    if (!element) return { ok: false, summary: "Action target is no longer available." };
    if (step.kind === "scrollby") {
      const options = stepoptions(step);
      element.scrollBy({
        left: typeof options.x === "number" ? options.x : 0,
        top: typeof options.y === "number" ? options.y : 600,
        behavior: "auto",
      });
      result = { ok: true, summary: "Container scrolled by the reviewed amounts." };
    } else if (step.kind === "focus") {
      element.focus();
      result = { ok: true, summary: "Target focused." };
    } else if (step.kind === "inspect")
      result = { ok: true, summary: `Target: ${label(element) || element.tagName.toLowerCase()}.` };
    else if (step.kind === "click") {
      element.click();
      result = { ok: true, summary: "Reviewed click completed." };
    } else if (step.kind === "scroll") result = scrolltarget(element);
    else if (step.kind === "hover") result = hovertarget(element);
    else if (step.kind === "select") result = selectoption(element, step.value ?? "");
    else if (step.kind === "type") {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement))
        return { ok: false, summary: "Target cannot receive text." };
      if (typeof step.value !== "string") return { ok: false, summary: "Approved text is absent." };
      element.focus();
      element.value = step.value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      result = { ok: true, summary: "Approved text entered." };
    } else return { ok: false, summary: "Unsupported action." };
  }
  const output = await result;
  if (resolution.status === "resolved") {
    return {
      ...output,
      details: { ...(output.details ?? {}), mode: resolution.target.mode, resolvedtarget: resolution.target },
    };
  }
  return output;
}

/** Measures the full scroll width and height before any stitching begins, beside the viewport geometry, the device pixel ratio and the current scroll position. */
export function measurepage(): {
  scrollwidth: number;
  scrollheight: number;
  viewportwidth: number;
  viewportheight: number;
  pixelratio: number;
  scrollx: number;
  scrolly: number;
} {
  const root = document.documentElement;
  return {
    scrollwidth: Math.max(root.scrollWidth, document.body?.scrollWidth ?? 0),
    scrollheight: Math.max(root.scrollHeight, document.body?.scrollHeight ?? 0),
    viewportwidth: window.innerWidth,
    viewportheight: window.innerHeight,
    pixelratio: window.devicePixelRatio || 1,
    scrollx: window.scrollX,
    scrolly: window.scrollY,
  };
}

/** Returns the pixel ratio scaled rect of one target element with the viewport crossing flag for the tiled fallback. */
export function elementrect(selector: string): {
  ok: boolean;
  rect?: regionrect;
  pixelratio?: number;
  crossesviewport?: boolean;
  summary: string;
} {
  const target = document.querySelector(selector);
  if (!target) return { ok: false, summary: "The reviewed capture element is no longer available." };
  const bounds = target.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0)
    return { ok: false, summary: "The reviewed capture element is not currently visible." };
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const rect: regionrect = {
    x: Math.round(bounds.left + window.scrollX),
    y: Math.round(bounds.top + window.scrollY),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  };
  const viewrect: regionrect = { x: bounds.left, y: bounds.top, width: bounds.width, height: bounds.height };
  return {
    ok: true,
    rect,
    pixelratio: window.devicePixelRatio || 1,
    crossesviewport:
      viewrect.x < 0 ||
      viewrect.y < 0 ||
      viewrect.x + viewrect.width > viewport.width ||
      viewrect.y + viewrect.height > viewport.height,
    summary: `Measured the capture element at ${rect.width} by ${rect.height} css pixels.`,
  };
}

/** Resolves the unique element references of one selector for the foreach executor of the workflow control engine: every matched element reports its stable selector without mutating the page. */
export function queryelements(query: string): { ok: boolean; selectors: string[]; summary: string } {
  const matched = [...document.querySelectorAll(query)];
  if (matched.length === 0)
    return { ok: true, selectors: [], summary: `The reviewed selector ${query} matched no element.` };
  return {
    ok: true,
    selectors: matched.map((element) => selector(element)),
    summary: `Resolved ${matched.length} element reference${matched.length === 1 ? "" : "s"} of the reviewed selector ${query}.`,
  };
}

const scrollbarstyleid = "devthinkcapturehider";

/** Prepares the page for capture: hides the capture scrollbars through a scoped style rule and returns the original scroll position. */
export function preparecapture(): { scrollx: number; scrolly: number } {
  if (!document.getElementById(scrollbarstyleid)) {
    const style = document.createElement("style");
    style.id = scrollbarstyleid;
    style.setAttribute("aria-hidden", "true");
    style.textContent =
      "html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important}html{scrollbar-width:none!important}";
    document.documentElement.append(style);
  }
  return { scrollx: window.scrollX, scrolly: window.scrollY };
}

/** Scrolls the page to one reviewed tile offset and reports the settled position. */
export function scrollcapture(x: number, y: number): { x: number; y: number } {
  window.scrollTo(x, y);
  return { x: window.scrollX, y: window.scrollY };
}

/** Restores the original scroll position after the last tile and removes the capture scrollbar hider. */
export function restorecapture(state: { scrollx: number; scrolly: number }): void {
  document.getElementById(scrollbarstyleid)?.remove();
  window.scrollTo(state.scrollx, state.scrolly);
}

/** Scrolls one scrollable container to a reviewed step top and reports its geometry. */
export function scrollcontainercapture(
  selector: string,
  top: number,
): { ok: boolean; top?: number; height?: number; viewportheight?: number; summary: string } {
  const container = document.querySelector(selector);
  if (!container) return { ok: false, summary: "The reviewed scrollable container is no longer available." };
  if (!(container instanceof HTMLElement))
    return { ok: false, summary: "The reviewed scrollable container cannot scroll." };
  container.scrollTo({ top, behavior: "auto" });
  return {
    ok: true,
    top: container.scrollTop,
    height: container.scrollHeight,
    viewportheight: container.clientHeight,
    summary: `Scrolled the container to ${container.scrollTop} of ${container.scrollHeight} pixels.`,
  };
}

/** Waits the reviewed settle time between capture tiles. */
export function waitsettle(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, milliseconds)));
}

/** Collects the visible text of one pdf report segment: every block element whose bounds intersect the reviewed vertical range contributes its text, so paginated reports split at reviewed break points. */
export function pdfsegment(top: number, height: number): { ok: boolean; text: string; summary: string } {
  const blocks = [
    ...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,td,th,blockquote,pre,figcaption,section,article > div"),
  ];
  const lines: string[] = [];
  for (const block of blocks) {
    const bounds = block.getBoundingClientRect();
    const blocktop = bounds.top + window.scrollY;
    const blockbottom = blocktop + bounds.height;
    if (blockbottom <= top || blocktop >= top + height) continue;
    const text = clean(block.textContent ?? "");
    if (text) lines.push(text);
  }
  const text = lines.join("\n");
  return {
    ok: true,
    text,
    summary: `Collected ${text.length} characters of the report segment at ${Math.round(top)} to ${Math.round(top + height)} pixels.`,
  };
}

/** Resolves the scroll tops of the reviewed pdf break point selectors for paginated reports. */
export function pdfbreaks(selectors: string[]): Array<{ selector: string; top: number }> {
  const resolved: Array<{ selector: string; top: number }> = [];
  for (const selector of selectors) {
    const target = document.querySelector(selector);
    if (!target) continue;
    resolved.push({ selector, top: Math.round(target.getBoundingClientRect().top + window.scrollY) });
  }
  return resolved;
}

/** Grabs one still frame of a video element at the reviewed timestamp: the video seeks, pauses and draws to a canvas that encodes as an image; cross origin videos without cors refuse the draw honestly. */
export async function videoframe(
  selector: string,
  timestamp: number | undefined,
  poster: boolean,
): Promise<{ ok: boolean; dataurl?: string; width?: number; height?: number; summary: string }> {
  const target = document.querySelector(selector);
  if (!(target instanceof HTMLVideoElement))
    return { ok: false, summary: "The reviewed frame source is not a video element." };
  target.pause();
  if (
    typeof timestamp === "number" &&
    Number.isFinite(timestamp) &&
    timestamp >= 0 &&
    timestamp <= (target.duration || 0)
  ) {
    await new Promise<void>((resolve) => {
      const done = (): void => resolve();
      target.addEventListener("seeked", done, { once: true });
      target.currentTime = timestamp;
      window.setTimeout(done, 1500);
    });
  }
  const width = target.videoWidth || target.clientWidth || 1;
  const height = target.videoHeight || target.clientHeight || 1;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, summary: "The frame grab could not create a canvas context." };
    context.drawImage(target, 0, 0, width, height);
    const dataurl = canvas.toDataURL("image/png");
    return {
      ok: dataurl.length > 100,
      dataurl,
      width,
      height,
      summary: `Grabbed the video frame at ${target.currentTime.toFixed(2)} seconds of ${width} by ${height} pixels${poster ? " as the poster frame" : ""}.`,
    };
  } catch {
    return {
      ok: false,
      summary: "The video frame draw was refused; cross origin videos need cors headers before frames can be read.",
    };
  }
}

/** Reads the playback state of one video element of the 1.1.77 family: the paused flag with the playback position and duration in milliseconds, so the frameocr pass refuses a playing video before any frame leaves the device; the read never pauses or seeks anything. */
export function videostate(selector: string): {
  ok: boolean;
  paused: boolean;
  positionms: number;
  durationms: number;
  summary: string;
} {
  const target = document.querySelector(selector);
  if (!(target instanceof HTMLVideoElement))
    return {
      ok: false,
      paused: false,
      positionms: 0,
      durationms: 0,
      summary: "The reviewed frame source is not a video element.",
    };
  return {
    ok: true,
    paused: target.paused,
    positionms: Math.round(target.currentTime * 1000),
    durationms: Number.isFinite(target.duration) ? Math.round(target.duration * 1000) : 0,
    summary: `The video ${selector} sits ${target.paused ? "paused" : "playing"} at ${(target.currentTime * 1000).toFixed(0)} milliseconds of ${(Number.isFinite(target.duration) ? target.duration * 1000 : 0).toFixed(0)} milliseconds.`,
  };
}

/** Reads the content of one canvas element: plain 2d canvases return their buffer directly and webgl canvases request the buffer through a preserved read; tainted canvases refuse honestly. */
export function canvasdata(selector: string): {
  ok: boolean;
  context: "2d" | "webgl";
  dataurl?: string;
  width?: number;
  height?: number;
  preserved?: boolean;
  summary: string;
} {
  const target = document.querySelector(selector);
  if (!(target instanceof HTMLCanvasElement))
    return { ok: false, context: "2d", summary: "The reviewed canvas element is no longer available." };
  const width = target.width || 1;
  const height = target.height || 1;
  const kind: "2d" | "webgl" = target.getContext("2d") ? "2d" : "webgl";
  try {
    let dataurl = "";
    let preserved = false;
    if (kind === "2d") {
      dataurl = target.toDataURL("image/png");
    } else {
      dataurl = target.toDataURL("image/png");
      if (dataurl.length <= 100) {
        const gl = (target.getContext("webgl") ??
          target.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        if (gl) {
          const pixels = new Uint8Array(width * height * 4);
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          if (context) {
            const image = context.createImageData(width, height);
            for (let row = 0; row < height; row += 1) {
              const source = (height - 1 - row) * width * 4;
              const destination = row * width * 4;
              image.data.set(pixels.subarray(source, source + width * 4), destination);
            }
            context.putImageData(image, 0, 0);
            dataurl = canvas.toDataURL("image/png");
            preserved = true;
          }
        }
      }
    }
    return {
      ok: dataurl.length > 100,
      context: kind,
      dataurl,
      width,
      height,
      preserved,
      summary: `Read the ${kind} canvas buffer of ${width} by ${height} pixels${kind === "webgl" ? (preserved ? " through a preserved readPixels pass" : " through the preserved drawing buffer") : ""}.`,
    };
  } catch {
    return {
      ok: false,
      context: kind,
      summary: "The canvas read was refused; tainted canvas content needs cross origin resources with cors headers.",
    };
  }
}

/** Probes the media streams of the page: every video and audio element with a srcObject reports its track kinds, labels, settings and live states; peer connection statistics stay outside the isolated world bridge. */
export function streamelements(selector?: string): Array<Record<string, unknown>> {
  const root = selector ? document.querySelector(selector) : document;
  if (!root) return [];
  const entries: Array<Record<string, unknown>> = [];
  for (const element of [...root.querySelectorAll("video, audio")]) {
    const media = element instanceof HTMLMediaElement ? element : null;
    if (!media) continue;
    const stream = media.srcObject;
    if (!(stream instanceof MediaStream)) continue;
    entries.push({
      kind: "webrtc",
      label: stream.id,
      live: stream.active,
      tracks: stream.getTracks().map((track) => ({
        kind: track.kind,
        label: track.label,
        state: track.readyState,
        ...(track.kind === "video"
          ? {
              width: track.getSettings().width,
              height: track.getSettings().height,
              framerate: track.getSettings().frameRate,
            }
          : {}),
      })),
    });
  }
  return entries;
}

/** Reads the embedded video and audio sources of the page with their formats, durations, dimensions, codecs and track lists. */
export function mediaelements(): Array<Record<string, unknown>> {
  const entries: Array<Record<string, unknown>> = [];
  for (const element of [...document.querySelectorAll("video, audio")]) {
    if (!(element instanceof HTMLMediaElement)) continue;
    const source = element.querySelector("source");
    const url = element.currentSrc || element.src || (source instanceof HTMLSourceElement ? source.src : "") || "";
    if (!url) continue;
    const type = (source instanceof HTMLSourceElement ? source.type : "") || "";
    const codecs = type.includes("codecs=")
      ? type.slice(type.indexOf("codecs=") + "codecs=".length).replace(/["']/g, "")
      : "";
    entries.push({
      url,
      mime: type.split(";")[0] || "",
      duration: Number.isFinite(element.duration) ? element.duration : 0,
      width: element instanceof HTMLVideoElement ? element.videoWidth : 0,
      height: element instanceof HTMLVideoElement ? element.videoHeight : 0,
      codecs,
      tracks: [...element.textTracks].map((track) => track.label || track.kind).filter(Boolean),
    });
  }
  return entries;
}

/** Collects the page assets: declared favicons and apple touch icons with their sizes, manifest declared icons and logo candidates from meta images and header imagery. */
export async function pageassets(): Promise<Array<Record<string, unknown>>> {
  const entries: Array<Record<string, unknown>> = [];
  for (const link of [...document.querySelectorAll("link[rel]")]) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase();
    const href = link.getAttribute("href");
    if (!href || !(rel.includes("icon") || rel.includes("apple-touch"))) continue;
    const resolved = new URL(href, location.href).toString();
    entries.push({ kind: "favicon", url: resolved, bytes: 0, sizes: link.getAttribute("sizes") ?? "any" });
  }
  const og = document.querySelector('meta[property="og:image"]');
  if (og instanceof HTMLMetaElement && og.content)
    entries.push({ kind: "logo", url: new URL(og.content, location.href).toString(), bytes: 0, sizes: "og" });
  for (const image of [...document.querySelectorAll("header img, nav img, img[alt*=logo i], img[src*=logo i]")]) {
    const url = image instanceof HTMLImageElement ? image.currentSrc || image.src : "";
    if (!url) continue;
    entries.push({
      kind: "logo",
      url: new URL(url, location.href).toString(),
      bytes: 0,
      sizes: image instanceof HTMLImageElement ? `${image.naturalWidth}x${image.naturalHeight}` : "",
    });
  }
  const manifestlink = document.querySelector('link[rel="manifest"]');
  if (manifestlink instanceof HTMLLinkElement && manifestlink.href) {
    try {
      const response = await fetch(manifestlink.href);
      const manifest = (await response.json()) as { icons?: Array<{ src?: string; sizes?: string }> };
      for (const icon of manifest.icons ?? []) {
        if (!icon.src) continue;
        entries.push({
          kind: "favicon",
          url: new URL(icon.src, location.href).toString(),
          bytes: 0,
          sizes: icon.sizes ?? "any",
        });
      }
    } catch {
      /* a refused manifest fetch leaves the declared icons unreported */
    }
  }
  return entries;
}

/** Detects every image of the page inside an optional selector scope: urls, alt text, natural dimensions, transfer sizes from the performance entries and mime types. */
export function pageimages(selector?: string): Array<Record<string, unknown>> {
  const root = selector ? document.querySelector(selector) : document;
  if (!root) return [];
  const transfers = new Map<string, number>();
  for (const entry of performance.getEntriesByType("resource")) {
    const resource = entry as PerformanceResourceTiming;
    if (resource.transferSize > 0) transfers.set(resource.name, resource.transferSize);
  }
  const images: Array<Record<string, unknown>> = [];
  for (const element of [...root.querySelectorAll("img")]) {
    if (!(element instanceof HTMLImageElement)) continue;
    const url = element.currentSrc || element.src;
    if (!url) continue;
    const resolved = new URL(url, location.href).toString();
    const type = element.getAttribute("type") ?? "";
    images.push({
      url: resolved,
      alt: element.alt ?? "",
      width: element.naturalWidth || element.width,
      height: element.naturalHeight || element.height,
      bytes: transfers.get(resolved) ?? 0,
      mime: type || (element.src.startsWith("data:") ? element.src.slice(5, element.src.indexOf(";")) : "image/*"),
    });
  }
  return images;
}
/** Parses fetched markup through the page domparser and runs the reviewed html queries: attribute values, text and element counts per query. */
export function parsehtmlmarkup(
  body: string,
  queries: Array<{ selector: string; attribute?: string; multi?: boolean }>,
): Array<{ selector: string; attribute?: string; multi: boolean; count: number; values: string[] }> {
  const parsed = new DOMParser().parseFromString(body, "text/html");
  return queries.map((query) => {
    const matches = [...parsed.querySelectorAll(query.selector)];
    const chosen = query.multi === true ? matches : matches.slice(0, 1);
    const values = chosen.map((element) =>
      query.attribute !== undefined ? (element.getAttribute(query.attribute) ?? "") : (element.textContent ?? ""),
    );
    return {
      selector: query.selector,
      ...(query.attribute !== undefined ? { attribute: query.attribute } : {}),
      multi: query.multi === true,
      count: matches.length,
      values,
    };
  });
}

/** Reads the request lifecycle facts the page timing buffers expose: every resource and navigation entry with its url, initiator, timing, transfer size, protocol and the response status a navigation entry reports; the buffers expose no header names, body bytes or subresource status codes. */
export function resourcerecords(): Array<Record<string, unknown>> {
  const entries = [...performance.getEntriesByType("resource"), ...performance.getEntriesByType("navigation")];
  return entries.map((entry) => {
    const resource = entry as PerformanceResourceTiming & { responseStatus?: number };
    return {
      name: resource.name,
      initiatorType: resource.initiatorType ?? "",
      entryType: resource.entryType,
      startTime: resource.startTime,
      duration: resource.duration,
      transferSize: resource.transferSize ?? 0,
      nextHopProtocol: resource.nextHopProtocol ?? "",
      ...(typeof resource.responseStatus === "number" ? { responseStatus: resource.responseStatus } : {}),
    };
  });
}

/** Writes reviewed cookies for the granted origin of the page through the page document cookie jar: every record writes its name, value and path with an optional expiry; the write happens on the page the user granted, never through a browser cookies permission. */
export function writecookies(records: Array<{ name: string; value: string; path: string; expiresat?: number }>): {
  written: number;
  summary: string;
} {
  let written = 0;
  for (const record of records) {
    const expiry = record.expiresat !== undefined ? `; expires=${new Date(record.expiresat).toUTCString()}` : "";
    document.cookie = `${record.name}=${record.value}; path=${record.path}${expiry}; samesite=lax`;
    written += 1;
  }
  return {
    written,
    summary: `Wrote ${written} reviewed cookie${written === 1 ? "" : "s"} through the page cookie jar of ${location.origin}.`,
  };
}

/** Reads the cookies of the granted origin through the page document cookie jar: document.cookie exposes the name and value pairs of the origin only, with no domain, path or expiry metadata. */
export function readcookies(): Array<{ name: string; value: string }> {
  return document.cookie
    .split(";")
    .map((pair) => pair.trim())
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const separator = pair.indexOf("=");
      return separator === -1
        ? { name: pair, value: "" }
        : { name: pair.slice(0, separator), value: pair.slice(separator + 1) };
    });
}

/** Clears the cookies of the granted origin through the page document cookie jar: every matched name is expired on the root path; an absent name list clears every cookie the origin jar exposes. */
export function clearcookies(names?: string[]): { cleared: number; summary: string } {
  const jar = readcookies();
  const targets = names !== undefined && names.length > 0 ? jar.filter((cookie) => names.includes(cookie.name)) : jar;
  for (const cookie of targets) document.cookie = `${cookie.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  return {
    cleared: targets.length,
    summary: `Cleared ${targets.length} cookie${targets.length === 1 ? "" : "s"} through the page cookie jar of ${location.origin}.`,
  };
}

/** Masks the typed values of one step before they reach the log writer: a step whose target or kind names a masked field shape keeps its shape while the typed value and the matching option values carry the redaction marker, so typed secrets never land in any record. */
export function maskstepvalues(step: toolstep, shapes: string[]): toolstep {
  const masked = masktypedvalues({ step, shapes });
  return {
    ...step,
    ...(masked.value !== undefined ? { value: masked.value } : {}),
    ...(masked.options !== undefined ? { options: masked.options } : {}),
  };
}

/** Masks the form state of one observation payload before logging: the observation schema keeps its field shapes while the values behind masked field shapes carry the redaction marker. */
export function maskobservationstate(
  fields: Array<{ name: string; value: string }>,
  shapes: string[],
): Array<{ name: string; value: string }> {
  return maskformstate(fields, shapes);
}

/** Masks one full observation payload before it reaches the log writer: the field shapes stay while the option lists of masked field names carry the redaction marker. */
export function maskobservationsnapshot(shot: observation, shapes: string[]): observation {
  return maskobservation(shot, shapes);
}

Object.assign(globalThis, {
  devthinkbridge: {
    maskstepvalues,
    maskobservationstate,
    maskobservationsnapshot,
    capturesnapshot,
    previewtarget,
    performstep,
    readdialogs,
    measurepage,
    elementrect,
    queryelements,
    preparecapture,
    scrollcapture,
    restorecapture,
    scrollcontainercapture,
    waitsettle,
    pdfsegment,
    pdfbreaks,
    videoframe,
    videostate,
    canvasdata,
    streamelements,
    mediaelements,
    pageassets,
    pageimages,
    parsehtmlmarkup,
    resourcerecords,
    writecookies,
    readcookies,
    clearcookies,
    revertemulationlayer,
    flushconsole,
  },
});
