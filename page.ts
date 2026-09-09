/** The page module of the 1.1.88 consolidation: every correlated variation of the page logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from browsertabs.ts: the 1.1.88 consolidation interns the correlated browsertabs logic here, so no variation of the same file lives beside another. ── */
import type {
  capabilityreport,
  toolstep,
  keyholdstate,
  columnspec,
  datasetrow,
  sourceref,
  transformrule,
  consoleentry,
  errorrecord,
  loglevel,
  longtaskentry,
  rejectionrecord,
  timelineentry,
  timelinesource,
  bannerreport,
  listpattern,
  tableshape,
  dialogpolicy,
  fielderror,
  fieldkind,
  fieldmatch,
  formrecord,
  formentry,
  formreport,
  retryrule,
  navtarget,
  urlpattern,
  waitoverride,
  waitprofile,
  authrecord,
  curatedlink,
  redirectchain,
  redirecthop,
  ratelimit,
  ratelimitstate,
  safetyverdict,
  a11ynode,
  readerarticle,
  pointpath,
  speedprofile,
  clickablemap,
  mapentry,
  resolvedtarget,
  targetmode,
  diffentry,
  focusevent,
  jsonstate,
  mutationevent,
  mutationwatch,
  quietrule,
  selectorcandidate,
  wizardstate,
} from "./types.js";

/**
 * Browser-level command surface for reviewed steps.
 * Every correlated rule for tab, window, zoom, snapshot and download actions plus capability negotiation lives in this file.
 */

export type browserresult = { ok: boolean; summary: string; details?: Record<string, unknown> };

const browserkinds: ReadonlySet<string> = new Set([
  "tablist",
  "tabcreate",
  "tabactivate",
  "tabclose",
  "tabreload",
  "tabsnapshot",
  "windowlist",
  "windowcreate",
  "windowclose",
  "zoomset",
  "windowresize",
  "downloadfile",
]);

/** True when the kind executes against browser-level surfaces instead of the page. */
export function isbrowserkind(kind: string): boolean {
  return browserkinds.has(kind);
}

/** Builds the live capability report from the optional permissions the user granted. */
export async function readcapabilities(): Promise<capabilityreport> {
  const [tabs, downloads, clipboardread, clipboardwrite] = await Promise.all([
    chrome.permissions.contains({ permissions: ["tabs"] }),
    chrome.permissions.contains({ permissions: ["downloads"] }),
    chrome.permissions.contains({ permissions: ["clipboardRead"] }),
    chrome.permissions.contains({ permissions: ["clipboardWrite"] }),
  ]);
  return { tabs, downloads, clipboardread, clipboardwrite, reportedat: Date.now() };
}

function stepoptions(step: toolstep): Record<string, unknown> {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function tabid(step: toolstep): number {
  return Number.parseInt(step.value ?? "", 10);
}

/** Executes one reviewed browser-level action kind against the live browser. */
export async function runbrowseraction(step: toolstep, sessiontabid: number, windowid: number): Promise<browserresult> {
  const options = stepoptions(step);
  switch (step.kind) {
    case "tablist": {
      const tabs = await chrome.tabs.query({});
      return {
        ok: true,
        summary: `Listed ${tabs.length} open tab${tabs.length === 1 ? "" : "s"}.`,
        details: {
          tabs: tabs.map((tab) => ({
            id: tab.id ?? 0,
            index: tab.index,
            title: tab.title ?? "",
            url: tab.url ?? "",
            active: tab.active,
            pinned: tab.pinned,
            audible: tab.audible ?? false,
          })),
        },
      };
    }
    case "tabcreate": {
      const targetwindow =
        typeof options.window === "number" && Number.isFinite(options.window) ? options.window : undefined;
      const created = await chrome.tabs.create({
        url: step.value,
        active: options.active !== false && options.background !== true,
        pinned: options.pinned === true,
        ...(targetwindow !== undefined ? { windowId: targetwindow } : {}),
      });
      return {
        ok: true,
        summary: `Opened a new tab for ${step.value}${options.background === true ? " in the background without activating it" : ""}.`,
        details: {
          tabid: created?.id ?? 0,
          ...(targetwindow !== undefined ? { windowid: targetwindow } : {}),
          ...(options.background === true ? { background: true } : {}),
        },
      };
    }
    case "tabactivate": {
      await chrome.tabs.update(tabid(step), { active: true });
      return { ok: true, summary: `Activated tab ${tabid(step)}.` };
    }
    case "tabclose": {
      await chrome.tabs.remove(tabid(step));
      return { ok: true, summary: `Closed tab ${tabid(step)}.` };
    }
    case "tabreload": {
      await chrome.tabs.reload(tabid(step), { bypassCache: options.bypasscache === true });
      return { ok: true, summary: `Reloaded tab ${tabid(step)}.` };
    }
    case "tabsnapshot": {
      const shot = await chrome.tabs.captureVisibleTab(windowid, { format: "png" });
      return { ok: true, summary: "Captured the visible area of the active tab.", details: { shot } };
    }
    case "windowlist": {
      const windows = await chrome.windows.getAll();
      return {
        ok: true,
        summary: `Listed ${windows.length} open window${windows.length === 1 ? "" : "s"}.`,
        details: {
          windows: windows.map((item) => ({
            id: item.id ?? 0,
            type: item.type,
            state: item.state ?? "",
            focused: item.focused,
          })),
        },
      };
    }
    case "windowcreate": {
      const bounds = ["left", "top", "width", "height"].filter((field) => typeof options[field] === "number");
      const geometry = Object.fromEntries(bounds.map((field) => [field, options[field]])) as Record<string, number>;
      const state =
        typeof options.state === "string" && ["normal", "maximized", "minimized", "fullscreen"].includes(options.state)
          ? options.state
          : undefined;
      const created = await chrome.windows.create({
        url: step.value ?? "about:blank",
        ...(Object.keys(geometry).length > 0 ? geometry : {}),
        ...(state !== undefined ? { state: state as chrome.windows.WindowState } : {}),
      });
      return {
        ok: true,
        summary: `Opened a new window for ${step.value}.`,
        details: {
          windowid: created?.id ?? 0,
          ...(Object.keys(geometry).length > 0 ? { bounds: geometry } : {}),
          ...(state !== undefined ? { state } : {}),
        },
      };
    }
    case "windowclose": {
      await chrome.windows.remove(tabid(step));
      return { ok: true, summary: `Closed window ${tabid(step)}.` };
    }
    case "zoomset": {
      const zoom = Number(step.value);
      await chrome.tabs.setZoom(sessiontabid, zoom);
      return { ok: true, summary: `Set the tab zoom to ${zoom}.` };
    }
    case "windowresize": {
      await chrome.windows.update(tabid(step), { width: options.width as number, height: options.height as number });
      return { ok: true, summary: `Resized window ${tabid(step)}.` };
    }
    case "downloadfile": {
      const downloadid = await chrome.downloads.download({ url: step.value ?? "" });
      return { ok: true, summary: `Started the download of ${step.value}.`, details: { downloadid } };
    }
    default:
      return { ok: false, summary: "Unsupported browser action." };
  }
}

/* ── Merged from pageactions.ts: the 1.1.88 consolidation interns the correlated pageactions logic here, so no variation of the same file lives beside another. ── */
import { parseoptions, resolutionverdict } from "./policy.js";

/**
 * Mutating page interactions for reviewed steps.
 * Every correlated rule for pointer, key, drag, upload, form, attribute, storage and evaluation actions lives in this file.
 */

export type stepresult = { ok: boolean; summary: string; details?: Record<string, unknown> };

function events(target: Element): void {
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

function modifiers(options: Record<string, unknown>): string[] {
  return Array.isArray(options.modifiers)
    ? options.modifiers.filter((item): item is string => typeof item === "string")
    : [];
}

function keyevent(type: "keydown" | "keypress" | "keyup", key: string, mods: string[]): KeyboardEvent {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  return new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
    composed: true,
    ctrlKey: mods.includes("ctrl"),
    shiftKey: mods.includes("shift"),
    altKey: mods.includes("alt"),
    metaKey: mods.includes("meta"),
  });
}

function fieldlike(target: Element | null): HTMLInputElement | HTMLTextAreaElement | null {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
}

function stringify(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value)) ?? null;
  } catch {
    return String(value);
  }
}

/** Runs one mutating page action after the background policy gate and a fresh target check. */
export function runpageaction(step: toolstep, target: Element | null): stepresult | Promise<stepresult> {
  const options = (() => {
    try {
      return parseoptions(step);
    } catch {
      return {} as Record<string, unknown>;
    }
  })();
  switch (step.kind) {
    case "presskey": {
      const receiver =
        target instanceof HTMLElement
          ? target
          : document.activeElement instanceof HTMLElement
            ? document.activeElement
            : document.body;
      const key = step.value ?? "";
      const mods = modifiers(options);
      receiver.dispatchEvent(keyevent("keydown", key, mods));
      receiver.dispatchEvent(keyevent("keypress", key, mods));
      receiver.dispatchEvent(keyevent("keyup", key, mods));
      return { ok: true, summary: `Key ${key} delivered with ${mods.length} modifier${mods.length === 1 ? "" : "s"}.` };
    }
    case "clickdeep": {
      if (!(target instanceof HTMLElement)) return { ok: false, summary: "Action target is no longer available." };
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, composed: true }));
      target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, composed: true }));
      target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
      target.click();
      return { ok: true, summary: "Full pointer click sequence delivered." };
    }
    case "rightclick": {
      if (!(target instanceof HTMLElement)) return { ok: false, summary: "Action target is no longer available." };
      const init: MouseEventInit = { bubbles: true, cancelable: true, button: 2, buttons: 2 };
      target.dispatchEvent(new PointerEvent("pointerdown", { ...init, composed: true }));
      target.dispatchEvent(new MouseEvent("mousedown", init));
      target.dispatchEvent(new MouseEvent("contextmenu", init));
      return { ok: true, summary: "Context menu events delivered." };
    }
    case "doubleclick": {
      if (!(target instanceof HTMLElement)) return { ok: false, summary: "Action target is no longer available." };
      target.click();
      target.click();
      target.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2 }));
      return { ok: true, summary: "Double click sequence delivered." };
    }
    case "drag": {
      if (!(target instanceof HTMLElement)) return { ok: false, summary: "Drag source is no longer available." };
      const destination = document.querySelector(step.value ?? "");
      if (!destination) return { ok: false, summary: "Drag destination is no longer available." };
      const transfer = new DataTransfer();
      if (typeof options.data === "string") transfer.setData("text/plain", options.data);
      target.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      destination.dispatchEvent(
        new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }),
      );
      destination.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      destination.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      target.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      return { ok: true, summary: "Drag and drop sequence delivered." };
    }
    case "drop": {
      if (!(target instanceof HTMLElement)) return { ok: false, summary: "Drop zone is no longer available." };
      const transfer = new DataTransfer();
      transfer.setData("text/plain", step.value ?? "");
      target.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
      return { ok: true, summary: "Drop payload delivered." };
    }
    case "upload": {
      if (!(target instanceof HTMLInputElement) || target.type !== "file")
        return { ok: false, summary: "Target is not a file input." };
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([typeof options.content === "string" ? options.content : ""], step.value ?? "upload", {
          type: typeof options.type === "string" ? options.type : "text/plain",
        }),
      );
      target.files = transfer.files;
      events(target);
      return { ok: true, summary: `Uploaded ${step.value ?? "file"} into the reviewed input.` };
    }
    case "clear": {
      const field = fieldlike(target);
      if (!field) return { ok: false, summary: "Target cannot hold a value." };
      field.value = "";
      events(field);
      return { ok: true, summary: "Field cleared." };
    }
    case "check":
    case "uncheck":
    case "toggle": {
      if (!(target instanceof HTMLInputElement) || (target.type !== "checkbox" && target.type !== "radio"))
        return { ok: false, summary: "Target is not a checkbox or radio control." };
      if (step.kind === "uncheck" && target.type === "radio")
        return { ok: false, summary: "A radio control cannot be unchecked." };
      target.checked = step.kind === "toggle" ? !target.checked : step.kind === "check";
      events(target);
      return { ok: true, summary: `Control is now ${target.checked ? "checked" : "unchecked"}.` };
    }
    case "submit": {
      const form =
        target instanceof HTMLFormElement ? target : target instanceof HTMLElement ? target.closest("form") : null;
      if (!form) return { ok: false, summary: "No form owns the reviewed target." };
      try {
        form.requestSubmit(target instanceof HTMLFormElement ? undefined : (target as HTMLElement));
      } catch {
        form.submit();
      }
      return { ok: true, summary: "Form submission requested." };
    }
    case "setattribute": {
      if (!target) return { ok: false, summary: "Action target is no longer available." };
      const name = typeof options.name === "string" ? options.name : "";
      target.setAttribute(name, typeof options.value === "string" ? options.value : "");
      return { ok: true, summary: `Attribute ${name} set.` };
    }
    case "removeattribute": {
      if (!target) return { ok: false, summary: "Action target is no longer available." };
      const name = step.value ?? "";
      target.removeAttribute(name);
      return { ok: true, summary: `Attribute ${name} removed.` };
    }
    case "writestorage": {
      try {
        localStorage.setItem(
          typeof options.key === "string" ? options.key : "",
          typeof options.value === "string" ? options.value : "",
        );
        return { ok: true, summary: `Local storage entry ${String(options.key)} written.` };
      } catch (error) {
        return {
          ok: false,
          summary: `Local storage refused the write: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    case "evaluate": {
      try {
        let outcome: unknown;
        try {
          outcome = new Function(`"use strict"; return (${step.value ?? "undefined"});`)();
        } catch {
          outcome = new Function(`"use strict"; ${step.value ?? ""}`)();
        }
        return {
          ok: true,
          summary: `Reviewed expression returned ${outcome === undefined ? "no value" : "a value"}.`,
          details: { result: stringify(outcome) },
        };
      } catch (error) {
        return {
          ok: false,
          summary: `Reviewed expression failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    case "fullscreen": {
      const element = target instanceof HTMLElement ? target : document.documentElement;
      return document.fullscreenElement === element
        ? document.exitFullscreen().then(() => ({ ok: true, summary: "Fullscreen state cleared." }) as stepresult)
        : element
            .requestFullscreen()
            .then(() => ({ ok: true, summary: "Fullscreen state entered." }) as stepresult)
            .catch((error) => ({
              ok: false,
              summary: `Fullscreen was refused: ${error instanceof Error ? error.message : String(error)}`,
            }));
    }
    default:
      return { ok: false, summary: "Unsupported page action." };
  }
}

/* ── Merged from pagecontrols.ts: the 1.1.88 consolidation interns the correlated pagecontrols logic here, so no variation of the same file lives beside another. ── */

/**
 * Field and control interactions for reviewed steps.
 * Every correlated rule for timed typing, value setting, key holds, search submission, multi selects, radio choices, sliders, dates, colors, details sections and the hold registry lives in this file.
 */

/** Builds the per keystroke schedule of one reviewed typetime step. */
export function typetimeschedule(text: string, delay: number): Array<{ key: string; delay: number }> {
  return [...text].map((character, position) => ({ key: character, delay: position === 0 ? 0 : delay }));
}

/** Appends reviewed text to the current field value. */
export function appendvalue(current: string, addition: string): string {
  return current + addition;
}

/** Event order delivered after one reviewed value change. */
export function valueevents(): string[] {
  return ["input", "change"];
}

/** Splits reviewed multi select values into present and missing entries against the declared options. */
export function multichoices(
  values: string[],
  options: Array<{ value: string; label: string }>,
): { present: string[]; missing: string[] } {
  const present: string[] = [];
  const missing: string[] = [];
  for (const value of values) {
    const option = options.find((candidate) => candidate.value === value || candidate.label === value);
    if (option) present.push(option.value);
    else missing.push(value);
  }
  return { present, missing };
}

/** Picks the reviewed radio input by value or label from one radio group; the index of the match or minus one. */
export function radiochoice(inputs: Array<{ value: string; label: string }>, choice: string): number {
  return inputs.findIndex((candidate) => candidate.value === choice || candidate.label === choice);
}

/** Clamps one reviewed slider value to the declared range and step grid. */
export function slidervalue(requested: number, min: number, max: number, step: number): number {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  const clamped = Math.min(upper, Math.max(lower, requested));
  if (!Number.isFinite(step) || step <= 0) return clamped;
  return Math.round((clamped - lower) / step) * step + lower;
}

/** Validates and normalizes one reviewed yyyy-mm-dd date. */
export function datevalue(requested: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requested)) return null;
  const parts = requested.split("-").map((part) => Number.parseInt(part, 10));
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return requested;
}

/** Validates and normalizes one reviewed #rrggbb color. */
export function colorvalue(requested: string): string | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(requested)) return null;
  return requested.toLowerCase();
}

/** Decides whether one reviewed details section still needs opening. */
export function expandstate(open: boolean): { open: boolean; changed: boolean } {
  return open ? { open: true, changed: false } : { open: true, changed: true };
}

/** Records one held key under its hold id; a repeated active hold id is refused. */
export function presshold(holds: keyholdstate[], hold: keyholdstate): { holds: keyholdstate[]; ok: boolean } {
  if (holds.some((existing) => existing.holdid === hold.holdid && existing.releasedat === undefined))
    return { holds, ok: false };
  return { holds: [...holds, hold], ok: true };
}

/** Releases one held key by hold id, keeping the release timestamp. */
export function releasehold(
  holds: keyholdstate[],
  holdid: string,
  releasedat: number,
): { holds: keyholdstate[]; released?: keyholdstate } {
  let released: keyholdstate | undefined;
  const next = holds.map((hold) => {
    if (hold.holdid !== holdid || hold.releasedat !== undefined) return hold;
    released = { ...hold, releasedat };
    return released;
  });
  return { holds: next, ...(released ? { released } : {}) };
}

/** Returns the keys currently held, optionally filtered to one tab. */
export function heldkeys(holds: keyholdstate[], tabid?: number): keyholdstate[] {
  return holds.filter(
    (hold) =>
      hold.releasedat === undefined && (tabid === undefined || hold.tabid === undefined || hold.tabid === tabid),
  );
}

function eventscontrols(target: Element): void {
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

function modifierscontrols(options: Record<string, unknown>): string[] {
  return Array.isArray(options.modifiers)
    ? options.modifiers.filter((item): item is string => typeof item === "string")
    : [];
}

function keyeventcontrols(type: "keydown" | "keyup", key: string, mods: string[]): KeyboardEvent {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  return new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
    composed: true,
    ctrlKey: mods.includes("ctrl"),
    shiftKey: mods.includes("shift"),
    altKey: mods.includes("alt"),
    metaKey: mods.includes("meta"),
  });
}

function fieldlikecontrols(target: Element | null): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
    ? target
    : null;
}

function receiver(target: Element | null): HTMLElement {
  return target instanceof HTMLElement
    ? target
    : document.activeElement instanceof HTMLElement
      ? document.activeElement
      : document.body;
}

function wait(delay: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

/** Focuses the reviewed target before typing; an explicit reviewed focus option forces or suppresses the focus. */
function focuswhenneeded(target: Element, options: Record<string, unknown>): void {
  if (!(target instanceof HTMLElement)) return;
  if (options.focus === false) return;
  if (options.focus === true || document.activeElement !== target) target.focus();
}

function pollfor(predicate: () => boolean, description: string, timeout: number): Promise<stepresult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = (): void => {
      if (predicate()) {
        resolve({ ok: true, summary: `${description} is now present on the page.` });
        return;
      }
      if (timeout > 0 && Date.now() - started >= timeout) {
        resolve({ ok: false, summary: `${description} did not appear within ${timeout} milliseconds.` });
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

/** Runs one reviewed control interaction after the background policy gate and a fresh target check; frame routed steps receive their frame document as the root. */
export function runpagecontrol(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  switch (step.kind) {
    case "typetime": {
      const field = fieldlikecontrols(target);
      if (!field) return { ok: false, summary: "Target cannot receive timed text." };
      const text = step.value ?? "";
      const delay = typeof options.delay === "number" && options.delay > 0 ? options.delay : 0;
      focuswhenneeded(field, options);
      const schedule = typetimeschedule(text, delay);
      return (async (): Promise<stepresult> => {
        for (const entry of schedule) {
          await wait(entry.delay);
          field.dispatchEvent(keyeventcontrols("keydown", entry.key, []));
          field.dispatchEvent(new KeyboardEvent("keypress", { key: entry.key, bubbles: true, cancelable: true }));
          field.value = `${field.value}${entry.key}`;
          field.dispatchEvent(new Event("input", { bubbles: true }));
        }
        field.dispatchEvent(new Event("change", { bubbles: true }));
        return {
          ok: true,
          summary: `Typed ${text.length} character${text.length === 1 ? "" : "s"} with a per keystroke delay of ${delay} milliseconds.`,
        };
      })();
    }
    case "appendtext": {
      const field = fieldlikecontrols(target);
      if (!field) return { ok: false, summary: "Target cannot hold a value." };
      focuswhenneeded(field, options);
      field.value = appendvalue(field.value, step.value ?? "");
      eventscontrols(field);
      return { ok: true, summary: "Reviewed text appended to the current field value." };
    }
    case "setvalue": {
      const field = fieldlikecontrols(target);
      if (!field) return { ok: false, summary: "Target cannot hold a value." };
      focuswhenneeded(field, options);
      field.value = step.value ?? "";
      eventscontrols(field);
      return {
        ok: true,
        summary: `Field value set through the dom property with ${valueevents().join(" and ")} eventscontrols.`,
      };
    }
    case "typeedit": {
      if (!(target instanceof HTMLElement) || !target.isContentEditable)
        return { ok: false, summary: "Target is not a content editable region." };
      focuswhenneeded(target, options);
      const text = step.value ?? "";
      return (async (): Promise<stepresult> => {
        for (const character of [...text]) {
          target.dispatchEvent(
            new InputEvent("beforeinput", {
              bubbles: true,
              cancelable: true,
              data: character,
              inputType: "insertText",
            }),
          );
          target.append(document.createTextNode(character));
          target.dispatchEvent(new InputEvent("input", { bubbles: true, data: character, inputType: "insertText" }));
        }
        return {
          ok: true,
          summary: `Typed ${text.length} character${text.length === 1 ? "" : "s"} into the content editable region.`,
        };
      })();
    }
    case "keyhold": {
      const key = step.value ?? "";
      const mods = modifierscontrols(options);
      receiver(target).dispatchEvent(keyeventcontrols("keydown", key, mods));
      const holdid = typeof options.holdid === "string" && options.holdid ? options.holdid : "";
      return {
        ok: true,
        summary: `Key ${key} pressed and held${holdid ? ` under hold id ${holdid}` : ""}.`,
        details: { ...(holdid ? { holdid } : {}), modifiers: mods },
      };
    }
    case "keyrelease": {
      const key = step.value ?? "";
      const mods = modifierscontrols(options);
      receiver(target).dispatchEvent(keyeventcontrols("keyup", key, mods));
      return { ok: true, summary: `Key ${key} released.`, details: { modifiers: mods } };
    }
    case "submitsearch": {
      const field = fieldlikecontrols(target);
      if (!field) return { ok: false, summary: "Target is not a search field." };
      const results = typeof options.results === "string" ? options.results : "";
      const timeout = typeof options.timeout === "number" ? options.timeout : 0;
      focuswhenneeded(field, options);
      field.dispatchEvent(keyeventcontrols("keydown", "Enter", []));
      field.dispatchEvent(new KeyboardEvent("keypress", { key: "Enter", bubbles: true, cancelable: true }));
      field.dispatchEvent(keyeventcontrols("keyup", "Enter", []));
      return pollfor(() => Boolean(document.querySelector(results)), `Results region ${results}`, timeout);
    }
    case "selectmulti": {
      if (!(target instanceof HTMLSelectElement) || !target.multiple)
        return { ok: false, summary: "Target is not a multi select control." };
      const choices = [...target.options].map((option) => ({
        value: option.value,
        label: clean(option.textContent || option.value),
      }));
      const requested = Array.isArray(options.values)
        ? options.values.filter((item): item is string => typeof item === "string")
        : [];
      const outcome = multichoices(requested, choices);
      if (outcome.missing.length > 0)
        return {
          ok: false,
          summary: `Reviewed option${outcome.missing.length === 1 ? "" : "s"} ${outcome.missing.join(", ")} ${outcome.missing.length === 1 ? "is" : "are"} not part of the select control.`,
        };
      for (const option of target.options) option.selected = outcome.present.includes(option.value);
      eventscontrols(target);
      return {
        ok: true,
        summary: `Selected ${outcome.present.length} reviewed option${outcome.present.length === 1 ? "" : "s"} in the multi select control.`,
        details: { selected: outcome.present },
      };
    }
    case "chooseradio": {
      const radios =
        target instanceof HTMLInputElement && target.type === "radio"
          ? [...root.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${CSS.escape(target.name)}"]`)]
          : target
            ? [...(target as ParentNode).querySelectorAll<HTMLInputElement>("input[type=radio]")]
            : [];
      if (radios.length === 0) return { ok: false, summary: "No radio group owns the reviewed target." };
      const inputs = radios.map((radio) => ({
        value: radio.value,
        label:
          radio.labels && radio.labels.length > 0
            ? clean(radio.labels[0]?.textContent || "") || radio.value
            : radio.value,
      }));
      const index = radiochoice(inputs, step.value ?? "");
      const chosen = radios[index];
      if (!chosen) return { ok: false, summary: "The reviewed radio option is not part of the group." };
      chosen.checked = true;
      eventscontrols(chosen);
      return { ok: true, summary: `Picked reviewed radio option ${step.value}.`, details: { value: chosen.value } };
    }
    case "setslider": {
      if (!(target instanceof HTMLInputElement) || target.type !== "range")
        return { ok: false, summary: "Target is not a range slider." };
      const requested = Number(step.value);
      if (!Number.isFinite(requested)) return { ok: false, summary: "The reviewed slider value is not a number." };
      focuswhenneeded(target, options);
      const value = slidervalue(requested, Number(target.min), Number(target.max), Number(target.step));
      target.value = String(value);
      eventscontrols(target);
      return { ok: true, summary: `Slider dragged to the reviewed value ${value}.`, details: { value } };
    }
    case "setdate": {
      if (!(target instanceof HTMLInputElement) || target.type !== "date")
        return { ok: false, summary: "Target is not a date input." };
      const value = datevalue(step.value ?? "");
      if (value === null) return { ok: false, summary: "The reviewed date is invalid." };
      focuswhenneeded(target, options);
      target.value = value;
      eventscontrols(target);
      return { ok: true, summary: `Date input set to ${value}.`, details: { value } };
    }
    case "setcolor": {
      if (!(target instanceof HTMLInputElement) || target.type !== "color")
        return { ok: false, summary: "Target is not a color input." };
      const value = colorvalue(step.value ?? "");
      if (value === null) return { ok: false, summary: "The reviewed color is invalid." };
      focuswhenneeded(target, options);
      target.value = value;
      eventscontrols(target);
      return { ok: true, summary: `Color input set to ${value}.`, details: { value } };
    }
    case "expanddetails": {
      const details = target instanceof HTMLElement ? target.closest("details") : null;
      if (!details) return { ok: false, summary: "Target is not inside a details section." };
      const outcome = expandstate(details.open);
      details.open = outcome.open;
      return {
        ok: true,
        summary: outcome.changed ? "Collapsed details section opened." : "Details section was already open.",
        details: { changed: outcome.changed },
      };
    }
    default:
      return { ok: false, summary: "Unsupported control action." };
  }
}

/* ── Merged from pagedata.ts: the 1.1.88 consolidation interns the correlated pagedata logic here, so no variation of the same file lives beside another. ── */

/**
 * Table and dataset logics for reviewed steps.
 * Every correlated rule for header normalization, span expansion, nested table walking, pagination following, row hashing, transform expressions, dataset merging, row sampling and csv, json and excel serialization lives in this file.
 */

/** One raw table cell with its text, header flag, span geometry and an optional nested table. */
export interface cellshape {
  text: string;
  header: boolean;
  rowspan: number;
  colspan: number;
  nested?: { selector: string; rows: rowshape[] };
}

/** One raw table row of span carrying cells. */
export interface rowshape {
  cells: cellshape[];
  header: boolean;
}

/** One nested child table linked to the body row it belongs to. */
export interface childtable {
  parentrow: number;
  selector: string;
  columns: columnspec[];
  rows: datasetrow[];
}

/** Result of the table reader: normalized column specs, keyed body rows and child datasets. */
export interface gridresult {
  columns: columnspec[];
  rows: datasetrow[];
  children: childtable[];
}

/** Trims, lowercases and slugifies one header cell into a stable column key. */
export function normalizeheader(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "column";
}

/** Builds one column spec from a header label with a unique stable key and the normalized name. */
export function columnspecof(label: string, used: Set<string> = new Set()): columnspec {
  const base = normalizeheader(label);
  let key = base;
  let suffix = 2;
  while (used.has(key)) {
    key = `${base}${suffix}`;
    suffix += 1;
  }
  used.add(key);
  return { key, label: label.trim(), kind: "text", normalized: label.trim().toLowerCase() };
}

/** Classifies a column as number only when every non-empty value parses as a number. */
export function classifycolumn(values: string[]): "text" | "number" {
  const present = values.filter((value) => value.trim().length > 0);
  if (present.length === 0) return "text";
  return present.every((value) => Number.isFinite(Number(value.replace(/,/g, ".")))) ? "number" : "text";
}

/** Expands rowspan and colspan cells into a filled rectangular grid of values. */
export function expandspans(rows: rowshape[]): string[][] {
  const filled: Array<Array<string | undefined>> = [];
  const pending = new Map<string, string>();
  for (let index = 0; index < rows.length; index += 1) {
    const row: Array<string | undefined> = filled[index] ?? (filled[index] = []);
    let column = 0;
    for (const cell of rows[index]!.cells) {
      while (row[column] !== undefined || pending.has(`${index},${column}`)) {
        if (row[column] === undefined) row[column] = pending.get(`${index},${column}`);
        column += 1;
      }
      row[column] = cell.text;
      for (let spanrow = 0; spanrow < Math.max(1, cell.rowspan); spanrow += 1) {
        for (let spancol = 0; spancol < Math.max(1, cell.colspan); spancol += 1) {
          if (spanrow === 0 && spancol === 0) continue;
          pending.set(`${index + spanrow},${column + spancol}`, cell.text);
        }
      }
      column += Math.max(1, cell.colspan);
    }
  }
  for (const [key, value] of pending) {
    const [rowpart, columnpart] = key.split(",");
    const rowindex = Number.parseInt(rowpart ?? "0", 10);
    const columnindex = Number.parseInt(columnpart ?? "0", 10);
    const target = filled[rowindex] ?? (filled[rowindex] = []);
    if (target[columnindex] === undefined) target[columnindex] = value;
  }
  const width = filled.reduce((largest, row) => Math.max(largest, row.length), 0);
  return filled.map((row) => Array.from({ length: width }, (_, column) => row[column] ?? ""));
}

/** Reads header and body rows into normalized column specs and keyed body rows, extracting nested tables into child datasets. */
export function readgrid(rows: rowshape[]): gridresult {
  const headerindex = rows.findIndex((row) => row.header || (row.cells[0]?.header ?? false));
  const useheader = headerindex !== -1 ? headerindex : 0;
  const hasheader = headerindex !== -1 || rows.length > 0;
  const grid = expandspans(rows);
  const headercells = hasheader ? (grid[useheader] ?? []) : [];
  const used = new Set<string>();
  const columns = Array.from({ length: headercells.length || (grid[0]?.length ?? 0) }, (_, index) =>
    columnspecof(headercells[index] ?? `column${index + 1}`, used),
  );
  const bodyrows = grid
    .filter((_, index) => (hasheader ? index !== useheader : true))
    .filter((line) => line.some((value) => value.trim().length > 0))
    .map((line) => {
      const row: datasetrow = {};
      columns.forEach((column, index) => {
        row[column.key] = line[index] ?? "";
      });
      return row;
    });
  for (const column of columns) column.kind = classifycolumn(bodyrows.map((row) => row[column.key] ?? ""));
  const children: childtable[] = [];
  rows.forEach((row, rowindex) => {
    if (hasheader && rowindex === useheader) return;
    const parentrow = hasheader && rowindex > useheader ? rowindex - 1 : rowindex;
    row.cells.forEach((cell) => {
      if (!cell.nested) return;
      const child = readgrid(cell.nested.rows);
      children.push({ parentrow, selector: cell.nested!.selector, columns: child.columns, rows: child.rows });
    });
  });
  return { columns, rows: bodyrows, children };
}

/** Resolves the next pagination control from numbered page entries: the entry after the current one or a next word control. */
export function nextcontrol(entries: Array<{ text: string; selector: string; current: boolean }>): string | undefined {
  const current = entries.findIndex((entry) => entry.current);
  if (current !== -1 && current + 1 < entries.length) return entries[current + 1]?.selector;
  const nextwords = ["next", "next page", ">", ">>", "›", "»", "próxima", "seguinte"];
  return entries.find((entry) => nextwords.includes(entry.text.trim().toLowerCase()))?.selector;
}

/** True when the current row set contains at least one row the previous set did not carry. */
export function rowsfresh(previous: datasetrow[], current: datasetrow[]): boolean {
  if (current.length === 0) return false;
  const known = new Set(previous.map((row) => JSON.stringify(row)));
  return current.some((row) => !known.has(JSON.stringify(row)));
}

/** Computes a stable row hash over the reviewed keys; an empty key list hashes every column. */
export function rowhash(row: datasetrow, keys: string[]): string {
  const source = (keys.length > 0 ? keys : Object.keys(row).sort()).map((key) => `${key}=${row[key] ?? ""}`).join("|");
  let hash = 5381;
  for (let index = 0; index < source.length; index += 1) hash = ((hash * 33) ^ source.charCodeAt(index)) >>> 0;
  return hash.toString(16);
}

/** Deduplicates rows by reviewed keys, keeping the first occurrence of every key set. */
export function dedupebykeys(rows: datasetrow[], keys: string[]): { kept: datasetrow[]; removed: number } {
  const seen = new Set<string>();
  const kept: datasetrow[] = [];
  for (const row of rows) {
    const hash = rowhash(row, keys);
    if (seen.has(hash)) continue;
    seen.add(hash);
    kept.push(row);
  }
  return { kept, removed: rows.length - kept.length };
}

/** Applies one reviewed transform expression to a value; unsupported expressions are refused. */
export function applyexpression(value: string, expression: string): string {
  const split = expression.indexOf(":");
  const op = split === -1 ? expression : expression.slice(0, split);
  const argument = split === -1 ? undefined : expression.slice(split + 1);
  if (op === "trim") return value.trim();
  if (op === "upper") return value.toUpperCase();
  if (op === "lower") return value.toLowerCase();
  if (op === "number") return value.replace(/[^\d.\-]/g, "");
  if (op === "prefix") return `${argument ?? ""}${value}`;
  if (op === "suffix") return `${value}${argument ?? ""}`;
  if (op === "replace") {
    const separator = argument?.indexOf("=>") ?? -1;
    if (separator === -1 || separator === 0)
      throw new Error(`The reviewed transform expression ${expression} needs the from=>to separator.`);
    const from = argument!.slice(0, separator);
    const to = argument!.slice(separator + 2);
    return value.split(from).join(to);
  }
  throw new Error(`The reviewed transform expression ${op} is not supported.`);
}

/** Applies reviewed transform rules to dataset rows, surfacing per rule errors and keeping the original values on failure. */
export function transformrows(rows: datasetrow[], rules: transformrule[]): { rows: datasetrow[]; errors: string[] } {
  const errors: string[] = [];
  const output = rows.map((row) => ({ ...row }));
  for (const rule of rules) {
    const updated: datasetrow[] = [];
    try {
      for (const row of output)
        updated.push({
          ...row,
          [rule.target]: applyexpression(rule.sources.map((source) => row[source] ?? "").join(" "), rule.expression),
        });
    } catch (error) {
      errors.push(`${rule.target}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    output.splice(0, output.length, ...updated);
  }
  return { rows: output, errors };
}

/** Merges datasets across pages: columns align by key with gaps filled empty and rows concatenate in page order. */
export function mergedatasets(datasets: Array<{ columns: columnspec[]; rows: datasetrow[] }>): {
  columns: columnspec[];
  rows: datasetrow[];
} {
  const columns: columnspec[] = [];
  const seen = new Set<string>();
  for (const dataset of datasets) {
    for (const column of dataset.columns) {
      if (seen.has(column.key)) continue;
      seen.add(column.key);
      columns.push(column);
    }
  }
  const rows = datasets.flatMap((dataset) =>
    dataset.rows.map((row) => {
      const merged: datasetrow = {};
      for (const column of columns) merged[column.key] = row[column.key] ?? "";
      return merged;
    }),
  );
  return { columns, rows };
}

/** Attaches the source url, timestamp and step ref to every row and returns the matching source refs. */
export function samplerows(
  rows: datasetrow[],
  url: string,
  stepid: string,
  at: number,
): { rows: datasetrow[]; sources: sourceref[] } {
  const stamped = rows.map((row) => ({ ...row, source: url, capturedat: String(at), step: stepid }));
  const sources = stamped.map((row, index) => ({ row: index, url, at, stepid }));
  return { rows: stamped, sources };
}

/** Escapes one csv field, wrapping values that carry the delimiter, quotes or line breaks. */
function csvfield(value: string, delimiter: string): string {
  return value.includes(delimiter) || value.includes('"') || value.includes("\n")
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

/** Serializes columns and rows into csv text. */
export function tocsv(columns: columnspec[], rows: datasetrow[], delimiter = ","): string {
  const lines = [columns.map((column) => csvfield(column.label || column.key, delimiter)).join(delimiter)];
  for (const row of rows)
    lines.push(columns.map((column) => csvfield(row[column.key] ?? "", delimiter)).join(delimiter));
  return lines.join("\n");
}

/** Parses csv text into headers and raw rows, honoring quoted fields and escaped quotes. */
export function parsecsv(text: string, delimiter = ","): { headers: string[]; rows: string[][] } {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!;
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else quoted = false;
      } else field += character;
      continue;
    }
    if (character === '"') {
      quoted = true;
      continue;
    }
    if (character === delimiter) {
      record.push(field);
      field = "";
      continue;
    }
    if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      record.push(field);
      field = "";
      if (record.some((value) => value.length > 0) || record.length > 1) records.push(record);
      record = [];
      continue;
    }
    field += character;
  }
  record.push(field);
  if (record.some((value) => value.length > 0) || record.length > 1) records.push(record);
  const [headers = [], ...rows] = records;
  return { headers, rows };
}

/** Maps parsed csv headers onto dataset column specs through a reviewed mapping of csv names to target keys. */
export function mapcolumns(headers: string[], mapping: Record<string, string> = {}): columnspec[] {
  const used = new Set<string>();
  return headers.map((header) => {
    const target = mapping[header] ?? mapping[normalizeheader(header)] ?? header;
    return columnspecof(target, used);
  });
}

/** Serializes columns and rows into a json dataset payload. */
export function tojson(columns: columnspec[], rows: datasetrow[]): string {
  return JSON.stringify({ columns, rows });
}

/** Escapes one xml text node. */
function xmltext(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Serializes columns and rows into an Excel SpreadsheetML 2003 workbook that Excel opens natively. */
export function toexcel(columns: columnspec[], rows: datasetrow[], name: string): string {
  const head = columns
    .map(
      (column) => `<Cell ss:StyleID="head"><Data ss:Type="String">${xmltext(column.label || column.key)}</Data></Cell>`,
    )
    .join("");
  const body = rows
    .map(
      (row) =>
        `<Row>${columns
          .map((column) => {
            const value = row[column.key] ?? "";
            const numeric = column.kind === "number" && value.trim() !== "" && Number.isFinite(Number(value));
            return numeric
              ? `<Cell><Data ss:Type="Number">${xmltext(value)}</Data></Cell>`
              : `<Cell><Data ss:Type="String">${xmltext(value)}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("");
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="head"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="${xmltext(name || "dataset").slice(0, 31)}"><Table><Row>${head}</Row>${body}</Table></Worksheet></Workbook>`;
}

/** Collects the raw span carrying row shapes of one html table, separating nested tables into cell refs. */
function collectrowshapes(table: HTMLTableElement): rowshape[] {
  return [...table.rows].map((row) => ({
    header: [...row.cells].every((cell) => cell.tagName === "TH") && row.cells.length > 0,
    cells: [...row.cells].map((cell) => {
      const nested = cell.querySelector("table");
      return {
        text: clean(nested ? `${nested.rows.length} rows` : (cell.textContent ?? "")),
        header: cell.tagName === "TH",
        rowspan: cell.rowSpan,
        colspan: cell.colSpan,
        ...(nested instanceof HTMLTableElement
          ? { nested: { selector: elementselector(nested), rows: collectrowshapes(nested) } }
          : {}),
      };
    }),
  }));
}

/** Reads the reviewed table element into a grid result. */
function readtable(target: Element | null, root: Document, fallbackselector: string | undefined): gridresult | null {
  const table =
    target instanceof HTMLTableElement
      ? target
      : fallbackselector
        ? root.querySelector<HTMLTableElement>(fallbackselector)
        : root.querySelector<HTMLTableElement>("table");
  if (!table) return null;
  return readgrid(collectrowshapes(table));
}

/** Reads the live pagination entries of a table container for the next control resolution. */
function paginationentries(
  root: Document,
  scope: string | undefined,
): Array<{ text: string; selector: string; current: boolean }> {
  const container = scope ? root.querySelector(scope) : root;
  if (!container) return [];
  return [...container.querySelectorAll("a[href], button")].map((element) => ({
    text: clean(element.textContent ?? ""),
    selector: elementselector(element),
    current:
      element.getAttribute("aria-current") === "page" ||
      element.classList.contains("active") ||
      element.classList.contains("current"),
  }));
}

/** Runs one reviewed data step on the page: table scraping into datasets and pagination following with fresh row waits. */
export async function runpagedata(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): Promise<stepresult> {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (step.kind === "scrapetable") {
    const grid = readtable(target, root, step.target);
    if (!grid) return { ok: false, summary: "The reviewed table selector matches no table element." };
    const rowlimit =
      typeof options.rowlimit === "number" && Number.isInteger(options.rowlimit) && options.rowlimit > 0
        ? options.rowlimit
        : grid.rows.length;
    const limited = grid.rows.slice(0, rowlimit);
    return {
      ok: true,
      summary: `Scraped ${limited.length} row${limited.length === 1 ? "" : "s"} into ${grid.columns.length} normalized column${grid.columns.length === 1 ? "" : "s"}${grid.children.length > 0 ? ` with ${grid.children.length} nested child table${grid.children.length === 1 ? "" : "s"}` : ""}.`,
      details: {
        grid: { columns: grid.columns, rows: limited, children: grid.children },
        rows: limited.length,
        columns: grid.columns.length,
      },
    };
  }
  if (step.kind === "paginateextract") {
    const nextselector = typeof options.next === "string" ? options.next : "";
    const pages =
      typeof options.pages === "number" && Number.isInteger(options.pages) && options.pages > 0 ? options.pages : 1;
    const wait =
      typeof options.wait === "number" && Number.isFinite(options.wait) && options.wait > 0 ? options.wait : 0;
    const cursor =
      typeof options.cursor === "number" && Number.isInteger(options.cursor) && options.cursor > 0 ? options.cursor : 0;
    const grids: gridresult[] = [];
    let previous: datasetrow[] = [];
    for (let page = 0; page < pages + cursor; page += 1) {
      if (page < cursor) {
        const control = root.querySelector<HTMLElement>(nextselector);
        if (!control) break;
        control.click();
        await new Promise((resolve) => window.setTimeout(resolve, 0));
        continue;
      }
      if (page > cursor) {
        const control = root.querySelector<HTMLElement>(nextselector);
        if (!control) break;
        control.click();
        const deadline = Date.now() + wait;
        let fresh = false;
        while (!fresh && Date.now() < deadline) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, Math.min(100, Math.max(16, deadline - Date.now()))),
          );
          const probe = readtable(target, root, step.target);
          fresh = probe !== null && rowsfresh(previous, probe.rows);
        }
      }
      const grid = readtable(target, root, step.target);
      if (!grid) return { ok: false, summary: "The reviewed table selector matches no table element." };
      grids.push(grid);
      previous = grid.rows;
    }
    const merged = mergedatasets(grids);
    const hasnext = Boolean(root.querySelector(nextselector));
    return {
      ok: grids.length > 0,
      summary:
        grids.length > 0
          ? `Followed ${grids.length} page${grids.length === 1 ? "" : "s"} of the reviewed table into ${merged.rows.length} row${merged.rows.length === 1 ? "" : "s"}${hasnext ? "; a next control remains" : ""}.`
          : "No page of the reviewed table was extracted.",
      details: {
        grid: { columns: merged.columns, rows: merged.rows, children: grids.flatMap((grid) => grid.children) },
        pages: grids.length,
        rows: merged.rows.length,
        next: hasnext,
        rowcursor: merged.rows.length,
      },
    };
  }
  return { ok: false, summary: "Unsupported data step." };
}

/** Exposes the pagination entries of the current document so plan review can suggest next controls. */
export function pagepagination(root: Document = document): Array<{ text: string; selector: string; current: boolean }> {
  return paginationentries(root, undefined);
}

/* ── Merged from pagedebug.ts: the 1.1.88 consolidation interns the correlated pagedebug logic here, so no variation of the same file lives beside another. ── */
import {
  consolecapture,
  errorcapture,
  levelrank,
  loglevels,
  longtaskcapture,
  rejectioncapture,
  serializearg,
  stackframes,
} from "./run.js";
import { breakpointinputof, stepmodeof, watchexpressionof, overrideinputof } from "./debug.js";
import {
  blackboxmatches,
  blackboxruleof,
  devicepresetof,
  familyofkind,
  locationpresetof,
  networkpresetof,
  agentpresetof,
  permissiongrantof,
} from "./environments.js";

/**
 * Page-side debugging capture for reviewed watch steps.
 * Correlated rules for the debug watch option parsing live here while the capture, spam, rotation and diff math lives in the root runtimeline module; console methods are hooked, error and rejection listeners installed and the longtask performance buffer observed for the reviewed window only, and every hook detaches cleanly when the window closes or the tab navigates.
 * Console, error and task watching derives from page-injected listeners through the scripting api, so no debugger permission exists anywhere in the manifest.
 */

/** The instrumented devtools harness key on the page global; the harness is the honest derivation of the devtools protocol because the debugger permission stays outside the manifest. */
const harnesskey = "__devthinkcdp";

/** One instrumented devtools harness of the page: the enabled domains, the registered breakpoints, the applied overrides, the observed event buffer and the pause state of the instrumented debugger. */
interface cdpharness {
  domains: string[];
  breakpoints: Array<{ id: string; url: string; line: number; column?: number; condition?: string; hits: number }>;
  overrides: Array<{ id: string; urlpattern: string; source: string }>;
  events: Array<{ domain: string; event: string; payload?: string; at: number }>;
  paused?: {
    reason: string;
    hitbreakpoint?: string;
    frames: Array<{ functionname?: string; url: string; line: number; column?: number }>;
    scope: Record<string, unknown>;
    cursor: number;
    lines: number;
  };
  hooks: Array<() => void>;
}

/** Reads the instrumented devtools harness of the page, if one is attached. */
function readharness(): cdpharness | undefined {
  return (globalThis as typeof globalThis & Record<string, unknown>)[harnesskey] as cdpharness | undefined;
}

/** The pending console buffer of the 1.1.78 forensic family: the console lines the hooked page console captured since the last step completion flush; the buffer lives in the page because the console only fires there, and the flush hands the lines to the background forensic timeline. */
const pendingconsole: Array<{ level: loglevel; text: string; at: number; reload?: number }> = [];

/** Queues one console line of the 1.1.78 forensic family for the next step completion flush; the line keeps its level, its masked text and its capture time. */
export function queueconsoleentry(entry: { level: loglevel; text: string; at: number; reload?: number }): void {
  pendingconsole.push(entry);
}

/** Flushes the pending console entries of the 1.1.78 forensic family on step completion: the buffered console lines return once and the buffer empties, so the background consoletimeline stamps their run wide sequence numbers in capture order across page reloads. */
export function flushconsole(): Array<{ level: string; text: string; source: string; at: number; reload?: number }> {
  const flushed = [...pendingconsole];
  pendingconsole.length = 0;
  return flushed.map((entry) => ({
    level: entry.level,
    text: entry.text,
    source: "console",
    at: entry.at,
    ...(entry.reload !== undefined ? { reload: entry.reload } : {}),
  }));
}

/** Writes or clears the instrumented devtools harness of the page. */
function writeharness(harness: cdpharness | undefined): void {
  if (harness === undefined) delete (globalThis as typeof globalThis & Record<string, unknown>)[harnesskey];
  else (globalThis as typeof globalThis & Record<string, unknown>)[harnesskey] = harness;
}

/** The instrumented devtools method surface: the domains the harness enables, runtime evaluation, dom snapshots and page navigation history; every other method of the raw protocol reports the honest uninstrumented error class. */
const instrumentedmethods: ReadonlySet<string> = new Set([
  "Runtime.evaluate",
  "Log.enable",
  "Debugger.enable",
  "DOM.enable",
  "Network.enable",
  "Page.enable",
  "DOM.getSnapshot",
  "Page.getNavigationHistory",
]);

/** Parsed cdp step options: the enabled domains, the teardown plan, the raw command, the event rules with the watch window, the breakpoint, the step mode, the watch expression and the script override. */
export interface cdpstepoptions {
  domains: string[];
  teardown?: { revertsteps: string[]; resumepolicy: string };
  command?: { method: string; params?: Record<string, unknown>; resultpath?: string };
  events?: Array<{ domain: string; event: string; match?: string }>;
  watchwindow: number;
  breakpoint?: { url: string; line: number; column?: number; condition?: string };
  mode?: string;
  expression?: { expression: string; scope: string };
  override?: { urlpattern: string; source: string };
}

/** Parses the reviewed cdp options of one devtools protocol step through the shared cdpbus normalizers. */
export function cdpstepoptions(step: toolstep): cdpstepoptions {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const teardown =
    options.teardown &&
    typeof options.teardown === "object" &&
    !Array.isArray(options.teardown) &&
    Array.isArray((options.teardown as Record<string, unknown>).revertsteps)
      ? {
          revertsteps: ((options.teardown as Record<string, unknown>).revertsteps as unknown[]).filter(
            (item): item is string => typeof item === "string",
          ),
          resumepolicy: String((options.teardown as Record<string, unknown>).resumepolicy ?? "ask"),
        }
      : undefined;
  const command =
    options.command && typeof options.command === "object" && !Array.isArray(options.command)
      ? (options.command as Record<string, unknown>)
      : undefined;
  const watch =
    options.watch && typeof options.watch === "object" && !Array.isArray(options.watch)
      ? (options.watch as Record<string, unknown>)
      : {};
  const breakpoint = breakpointinputof(options.breakpoint);
  const expression = watchexpressionof(options.expression);
  const override = overrideinputof(options.override);
  return {
    domains: Array.isArray(options.domains)
      ? options.domains.filter((domain): domain is string => typeof domain === "string")
      : [],
    ...(teardown !== undefined ? { teardown } : {}),
    ...(command !== undefined && typeof command.method === "string"
      ? {
          command: {
            method: command.method,
            ...(command.params && typeof command.params === "object" && !Array.isArray(command.params)
              ? { params: command.params as Record<string, unknown> }
              : {}),
            ...(typeof command.resultpath === "string" ? { resultpath: command.resultpath } : {}),
          },
        }
      : {}),
    events: Array.isArray(options.events)
      ? options.events.flatMap((rule) => {
          const parsed =
            rule && typeof rule === "object" && !Array.isArray(rule) ? (rule as Record<string, unknown>) : undefined;
          if (!parsed || typeof parsed.domain !== "string" || typeof parsed.event !== "string") return [];
          return [
            {
              domain: parsed.domain,
              event: parsed.event,
              ...(typeof parsed.match === "string" ? { match: parsed.match } : {}),
            },
          ];
        })
      : [],
    watchwindow:
      typeof watch.window === "number" && Number.isFinite(watch.window) && watch.window >= 0 ? watch.window : 0,
    ...(breakpoint !== undefined ? { breakpoint } : {}),
    ...(options.mode !== undefined && stepmodeof(options.mode) !== undefined ? { mode: options.mode as string } : {}),
    ...(expression !== undefined ? { expression } : {}),
    ...(override !== undefined ? { override } : {}),
  };
}

/** Captures the light dom state of the page at a pause: the url, title, node and form counts, derived through the page bridge snapshot seam because no debugger permission exists. */
function domstate(): { url: string; title: string; nodes: number; forms: number } {
  return {
    url: location.href,
    title: document.title,
    nodes: document.querySelectorAll("*").length,
    forms: document.forms.length,
  };
}

/** Runs one reviewed devtools protocol step inside the page through the instrumented harness: the harness attaches and detaches cleanly, raw commands of the instrumented surface run with duration and error class, domain events observe through the console and navigation hooks, breakpoints pause instrumented probes, stepping advances the pause, watch expressions evaluate in the pause scope and script overrides apply the reviewed fixture. */
export async function runcdpstep(step: toolstep): Promise<stepresult> {
  const options = cdpstepoptions(step);
  if (step.kind === "attachcdp") {
    const existing = readharness();
    if (existing) {
      for (const detach of existing.hooks) detach();
    }
    const harness: cdpharness = { domains: options.domains, breakpoints: [], overrides: [], events: [], hooks: [] };
    if (options.domains.includes("Log") || options.domains.includes("Runtime")) {
      for (const level of loglevels) {
        const original = console[level] as (...args: unknown[]) => void;
        const hooked = (...args: unknown[]): void => {
          try {
            original.apply(console, args);
          } catch {
            /* the page console may refuse the passthrough; capture still proceeds */
          }
          harness.events.push({
            domain: "Log",
            event: "entryAdded",
            payload: args.map((arg) => serializearg(arg, 2)).join(" "),
            at: Date.now(),
          });
        };
        (console as unknown as Record<string, unknown>)[level] = hooked;
        harness.hooks.push(() => {
          (console as unknown as Record<string, unknown>)[level] = original;
        });
      }
    }
    writeharness(harness);
    const iframes = [...document.querySelectorAll("iframe[src]")]
      .map((frame) => (frame as HTMLIFrameElement).src)
      .filter((src) => src.startsWith("https://"));
    const serviceworker =
      "serviceWorker" in navigator && navigator.serviceWorker.controller
        ? navigator.serviceWorker.controller.scriptURL
        : undefined;
    return {
      ok: true,
      summary: `Attached the instrumented devtools harness with the reviewed domains ${options.domains.join(", ")} enabled.`,
      details: {
        attached: true,
        domains: [...harness.domains],
        targets: { iframes, ...(serviceworker !== undefined ? { serviceworker } : {}) },
        derivation:
          "The chrome devtools protocol needs the debugger permission, which the manifest gate forbids; the session runs through the page-instrumented harness injected by the scripting api and the iframe and service worker targets derive from the page frame list and controller state.",
      },
    };
  }
  if (step.kind === "detachcdp") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    for (const detach of harness.hooks) detach();
    const reverted = { breakpoints: harness.breakpoints.length, overrides: harness.overrides.length };
    writeharness(undefined);
    return {
      ok: true,
      summary: `Detached the instrumented devtools harness cleanly after reverting ${reverted.breakpoints} breakpoint${reverted.breakpoints === 1 ? "" : "s"} and ${reverted.overrides} override${reverted.overrides === 1 ? "" : "s"}.`,
      details: { detached: true, ...reverted },
    };
  }
  if (step.kind === "cdpcmd") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    const method = options.command?.method ?? "";
    const params = options.command?.params ?? {};
    if (!instrumentedmethods.has(method))
      return {
        ok: false,
        summary: `The reviewed command ${method} reports the uninstrumented error class: the page harness implements ${[...instrumentedmethods].join(", ")} only.`,
        details: { method, errorclass: "uninstrumented" },
      };
    const started = Date.now();
    try {
      if (method === "Runtime.evaluate") {
        const expression = typeof params.expression === "string" ? params.expression : "";
        const probeurl = typeof params.url === "string" ? params.url : "inline";
        const scope =
          params.scope && typeof params.scope === "object" && !Array.isArray(params.scope)
            ? (params.scope as Record<string, unknown>)
            : {};
        const override = harness.overrides.find((spec) => overridematch(spec.urlpattern, probeurl));
        const source =
          override !== undefined && overridematch(override.urlpattern, probeurl) ? override.source : expression;
        const value = new Function(...Object.keys(scope), `"use strict"; return (${source});`)(...Object.values(scope));
        let tripped: cdpharness["paused"];
        for (const breakpoint of harness.breakpoints) {
          if (breakpoint.url !== probeurl) continue;
          const conditionok =
            breakpoint.condition === undefined
              ? true
              : Boolean(
                  new Function(...Object.keys(scope), `"use strict"; return (${breakpoint.condition});`)(
                    ...Object.values(scope),
                  ),
                );
          if (!conditionok) continue;
          breakpoint.hits += 1;
          tripped = {
            reason: "breakpoint",
            hitbreakpoint: breakpoint.id,
            frames: stackframes(new Error().stack ?? ""),
            scope,
            cursor: breakpoint.line,
            lines: Math.max(1, source.split("\n").length),
          };
          harness.paused = tripped;
          break;
        }
        const serialized = serializearg(value, 3);
        harness.events.push({
          domain: "Runtime",
          event: "executionContextDestroyed",
          payload: serialized.slice(0, 200),
          at: Date.now(),
        });
        return {
          ok: true,
          summary: `The reviewed command ${method} returned in ${Date.now() - started} milliseconds${tripped !== undefined ? " and paused the run on the reviewed breakpoint" : ""}.`,
          details: {
            method,
            duration: Date.now() - started,
            result: { value: serialized },
            ...(tripped !== undefined
              ? { paused: { reason: tripped.reason, hitbreakpoint: tripped.hitbreakpoint, frames: tripped.frames } }
              : {}),
          },
        };
      }
      if (method === "DOM.getSnapshot") {
        const state = domstate();
        return {
          ok: true,
          summary: `The reviewed command ${method} returned the dom snapshot of ${state.nodes} nodes in ${Date.now() - started} milliseconds.`,
          details: { method, duration: Date.now() - started, result: state },
        };
      }
      if (method === "Page.getNavigationHistory") {
        const state = domstate();
        return {
          ok: true,
          summary: `The reviewed command ${method} returned the page navigation history in ${Date.now() - started} milliseconds.`,
          details: { method, duration: Date.now() - started, result: { url: state.url, title: state.title } },
        };
      }
      return {
        ok: true,
        summary: `The reviewed command ${method} enabled its domain through the instrumented harness in ${Date.now() - started} milliseconds.`,
        details: { method, duration: Date.now() - started, result: {} },
      };
    } catch (error) {
      return {
        ok: false,
        summary: `The reviewed command ${method} failed with the evaluationerror class: ${error instanceof Error ? error.message : String(error)}.`,
        details: { method, duration: Date.now() - started, errorclass: "evaluationerror" },
      };
    }
  }
  if (step.kind === "watchcdp") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    const started = Date.now();
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (harness.domains.includes("Page") && navigation !== undefined && navigation.loadEventStart > 0)
      harness.events.push({ domain: "Page", event: "loadEventFired", payload: location.href, at: started });
    await waitdebug(options.watchwindow);
    const observed = harness.events.filter((event) => event.at >= started);
    return {
      ok: true,
      summary: `Observed ${observed.length} domain event${observed.length === 1 ? "" : "s"} for the reviewed window of ${options.watchwindow} milliseconds.`,
      details: {
        events: observed,
        watchwindow: options.watchwindow,
        derivation:
          "Domain events derive from the instrumented console hooks and the page performance navigation buffer because no debugger permission exists in the manifest.",
      },
    };
  }
  if (step.kind === "setbreakpoint") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    if (!options.breakpoint) return { ok: false, summary: "The breakpoint input is absent." };
    const id = `bp-${options.breakpoint.url}-${options.breakpoint.line}-${options.breakpoint.column ?? 0}`;
    const registered = { id, ...options.breakpoint, hits: 0 };
    harness.breakpoints.push(registered);
    return {
      ok: true,
      summary: `Registered the reviewed breakpoint at ${options.breakpoint.url}:${options.breakpoint.line}${options.breakpoint.condition !== undefined ? ` under the condition ${options.breakpoint.condition}` : ""}.`,
      details: { breakpoint: registered },
    };
  }
  if (step.kind === "stepcode") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    const mode = stepmodeof(options.mode);
    if (mode === undefined) return { ok: false, summary: "The step code mode is absent." };
    if (harness.paused === undefined)
      return {
        ok: false,
        summary: "No paused instrumented probe exists to step through; pause on a reviewed breakpoint first.",
      };
    if (mode === "resume" || mode === "stepout") {
      const reason = harness.paused.reason;
      const frames = harness.paused.frames;
      delete harness.paused;
      return {
        ok: true,
        summary: `The ${mode} mode ${mode === "resume" ? "resumed" : "stepped out of"} the paused probe after ${frames.length} call frame${frames.length === 1 ? "" : "s"}.`,
        details: { mode, paused: false, reason },
      };
    }
    harness.paused.cursor += 1;
    const state = domstate();
    return {
      ok: true,
      summary: `The ${mode} mode advanced to line ${harness.paused.cursor} of the paused probe and captured the pause state with ${harness.paused.frames.length} call frame${harness.paused.frames.length === 1 ? "" : "s"} and the dom state.`,
      details: {
        mode,
        paused: true,
        pausestate: {
          reason: harness.paused.reason,
          ...(harness.paused.hitbreakpoint !== undefined ? { hitbreakpoint: harness.paused.hitbreakpoint } : {}),
          frames: harness.paused.frames,
          cursor: harness.paused.cursor,
          dom: state,
        },
      },
    };
  }
  if (step.kind === "watchexpr") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    if (!options.expression) return { ok: false, summary: "The watch expression input is absent." };
    if (harness.paused === undefined)
      return {
        ok: false,
        summary:
          "No paused instrumented probe exists to evaluate the watch expression in; pause on a reviewed breakpoint first.",
      };
    try {
      const value = new Function(
        ...Object.keys(harness.paused.scope),
        `"use strict"; return (${options.expression.expression});`,
      )(...Object.values(harness.paused.scope));
      return {
        ok: true,
        summary: `Evaluated the reviewed watch expression at the pause in the ${options.expression.scope} scope.`,
        details: {
          expression: options.expression.expression,
          scope: options.expression.scope,
          value: serializearg(value, 3),
        },
      };
    } catch (error) {
      return {
        ok: false,
        summary: `The reviewed watch expression failed with the evaluationerror class: ${error instanceof Error ? error.message : String(error)}.`,
        details: { errorclass: "evaluationerror" },
      };
    }
  }
  if (step.kind === "overridescript") {
    const harness = readharness();
    if (!harness) return { ok: false, summary: "No instrumented devtools harness is attached to this page." };
    if (!options.override) return { ok: false, summary: "The script override input is absent." };
    const id = `ov-${options.override.urlpattern}`;
    harness.overrides = harness.overrides.filter((spec) => spec.id !== id);
    harness.overrides.push({ id, urlpattern: options.override.urlpattern, source: options.override.source });
    try {
      new Function(options.override.source)();
      return {
        ok: true,
        summary: `Applied the reviewed script fixture for ${options.override.urlpattern} on the current document and on later instrumented evaluations of the pattern.`,
        details: { override: { id, urlpattern: options.override.urlpattern, applied: true } },
      };
    } catch (error) {
      return {
        ok: false,
        summary: `The reviewed script fixture failed with the evaluationerror class: ${error instanceof Error ? error.message : String(error)}.`,
        details: { errorclass: "evaluationerror" },
      };
    }
  }
  return { ok: false, summary: "The devtools step is not part of the instrumented family." };
}

/** Matches one instrumented probe url against an override pattern with single star segments and double star subtrees. */
function overridematch(urlpattern: string, url: string): boolean {
  const patternmatch = /^(https:\/\/[^/]+|inline)(\/.*)?$/.exec(urlpattern);
  const urlmatch = /^(https:\/\/[^/]+|inline)(\/.*)?$/.exec(url);
  if (!patternmatch || !urlmatch) return false;
  if (patternmatch[1] !== urlmatch[1]) return false;
  const patternpath = (patternmatch[2] ?? "/").split("/").filter((segment) => segment.length > 0);
  const urlpath = (urlmatch[2] ?? "/").split("/").filter((segment) => segment.length > 0);
  const walk = (patternindex: number, urlindex: number): boolean => {
    if (patternindex >= patternpath.length) return urlindex >= urlpath.length;
    const segment = patternpath[patternindex];
    if (segment === "**")
      return walk(patternindex + 1, urlindex) || (urlindex < urlpath.length && walk(patternindex, urlindex + 1));
    if (urlindex >= urlpath.length) return false;
    if (segment !== "*" && segment !== urlpath[urlindex]) return false;
    return walk(patternindex + 1, urlindex + 1);
  };
  return walk(0, 0);
}

/** Parsed debug watch options: the window, level floor, serialization depth, redaction patterns, spam rule, rotation rule and long task threshold. */
export interface debugwatchoptions {
  window: number;
  level?: loglevel;
  depth: number;
  redact: string[];
  spam?: { pattern: string; windowsize: number; collapse: number };
  rotation?: { maxentries: number; overflowtarget: string };
  threshold: number;
}

/** Parses the reviewed debug watch options of one watch step; absent windows watch nothing and the depth bound defaults shallow. */
export function debugwatchoptions(step: toolstep): debugwatchoptions {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const watch =
    options.watch && typeof options.watch === "object" && !Array.isArray(options.watch)
      ? (options.watch as Record<string, unknown>)
      : {};
  const spam =
    options.spam && typeof options.spam === "object" && !Array.isArray(options.spam)
      ? (options.spam as Record<string, unknown>)
      : undefined;
  const rotation =
    options.rotation && typeof options.rotation === "object" && !Array.isArray(options.rotation)
      ? (options.rotation as Record<string, unknown>)
      : undefined;
  return {
    window: typeof watch.window === "number" && Number.isFinite(watch.window) && watch.window >= 0 ? watch.window : 0,
    ...(typeof options.level === "string" && (loglevels as string[]).includes(options.level)
      ? { level: options.level as loglevel }
      : {}),
    depth:
      typeof options.depth === "number" && Number.isInteger(options.depth) && options.depth >= 1 ? options.depth : 2,
    redact: Array.isArray(options.redact)
      ? options.redact.filter((pattern): pattern is string => typeof pattern === "string" && pattern.length > 0)
      : [],
    ...(spam &&
    typeof spam.pattern === "string" &&
    typeof spam.windowsize === "number" &&
    typeof spam.collapse === "number"
      ? { spam: { pattern: spam.pattern, windowsize: spam.windowsize, collapse: spam.collapse } }
      : {}),
    ...(rotation && typeof rotation.maxentries === "number" && typeof rotation.overflowtarget === "string"
      ? { rotation: { maxentries: rotation.maxentries, overflowtarget: rotation.overflowtarget } }
      : {}),
    threshold:
      typeof options.threshold === "number" && Number.isFinite(options.threshold) && options.threshold >= 0
        ? options.threshold
        : 0,
  };
}

function waitdebug(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, milliseconds)));
}

/** Runs one reviewed debugging watch inside the page: console methods are hooked, error and rejection listeners installed and the longtask buffer observed for the reviewed window; every hook detaches cleanly at the end. */
export async function rundebugwatch(step: toolstep): Promise<stepresult> {
  const options = debugwatchoptions(step);
  if (options.window <= 0) return { ok: false, summary: "The reviewed debug watch window is absent." };
  const started = Date.now();
  const entries: Array<Omit<timelineentry, "id" | "runid">> = [];
  const consoleentries: consoleentry[] = [];
  const errors: Array<Omit<errorrecord, "id" | "runid">> = [];
  const rejections: Array<Omit<rejectionrecord, "id" | "runid">> = [];
  const resources: Array<{ message: string; element: string; sourceurl: string }> = [];
  const longtasks: Array<Omit<longtaskentry, "id" | "runid">> = [];
  const floor = options.level !== undefined ? levelrank(options.level) : undefined;
  const capture = (level: loglevel, source: timelinesource, message: string, at: number): void => {
    if (floor !== undefined && levelrank(level) > floor) return;
    entries.push({ stepid: step.id, time: at, level, source, message });
  };
  const hooks: Array<() => void> = [];
  if (step.kind === "watchconsole") {
    for (const level of loglevels) {
      const original = console[level] as (...args: unknown[]) => void;
      const hooked = (...args: unknown[]): void => {
        try {
          original.apply(console, args);
        } catch {
          /* the page console may refuse the passthrough; capture still proceeds */
        }
        const entry = consolecapture({ level, args, depth: options.depth, redact: options.redact });
        if (floor === undefined || levelrank(level) <= floor) consoleentries.push(entry);
        capture(level, "console", entry.text, Date.now());
        queueconsoleentry({ level, text: entry.text, at: Date.now() });
      };
      (console as unknown as Record<string, unknown>)[level] = hooked;
      hooks.push(() => {
        (console as unknown as Record<string, unknown>)[level] = original;
      });
    }
  }
  if (step.kind === "watcherrors") {
    const blackbox = activeblackboxpatterns();
    const hideframes = <T extends { frames: Array<{ url: string }> }>(record: T): T => ({
      ...record,
      frames: record.frames.filter((frame) => !blackbox.some((pattern) => blackboxmatches(pattern, frame.url))),
    });
    const onerror = (event: ErrorEvent): void => {
      const record = hideframes(
        errorcapture({
          message: event.message,
          sourceurl: event.filename,
          line: event.lineno,
          ...(event.error instanceof Error ? { stacktext: event.error.stack } : {}),
          redact: options.redact,
        }),
      );
      errors.push({ ...record, stepid: step.id, at: Date.now() });
      capture("error", "error", record.message, Date.now());
    };
    const onrejection = (event: PromiseRejectionEvent): void => {
      const reason =
        event.reason instanceof Error ? `${event.reason.name}: ${event.reason.message}` : String(event.reason);
      const record = hideframes(
        rejectioncapture({
          reason,
          ...(event.reason instanceof Error ? { stacktext: event.reason.stack } : {}),
          redact: options.redact,
        }),
      );
      rejections.push({ ...record, stepid: step.id, at: Date.now() });
      capture("error", "rejection", record.reason, Date.now());
    };
    const onresource = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.tagName.toLowerCase() + (target.id ? `#${target.id}` : "");
      const sourceurl =
        target instanceof HTMLImageElement || target instanceof HTMLScriptElement
          ? (target.src ?? "")
          : target instanceof HTMLLinkElement
            ? (target.href ?? "")
            : "";
      const message = `Failed to load ${element}${sourceurl ? ` from ${sourceurl}` : ""}.`;
      resources.push({ message, element, sourceurl });
      capture("error", "resource", message, Date.now());
    };
    window.addEventListener("error", onerror, true);
    window.addEventListener("unhandledrejection", onrejection, true);
    window.addEventListener("error", onresource, true);
    hooks.push(() => {
      window.removeEventListener("error", onerror, true);
      window.removeEventListener("unhandledrejection", onrejection, true);
      window.removeEventListener("error", onresource, true);
    });
  }
  if (step.kind === "watchtasks") {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const detail = entry as { duration: number; startTime: number; attribution?: Array<{ name?: string }> };
        const attributions = (detail.attribution ?? [])
          .map((container) => String(container.name ?? ""))
          .filter((name) => name.length > 0);
        longtasks.push({
          stepid: step.id,
          duration: Math.round(detail.duration),
          starttime: Math.round(detail.startTime),
          attributions,
          at: Date.now(),
        });
      }
    });
    observer.observe({ entryTypes: ["longtask"] });
    hooks.push(() => observer.disconnect());
  }
  await waitdebug(options.window);
  for (const detach of hooks) detach();
  if (step.kind === "watchtasks") {
    const filtered = longtaskcapture({ entries: longtasks, threshold: options.threshold });
    longtasks.length = 0;
    longtasks.push(...filtered.map((task) => ({ ...task, stepid: step.id, at: started })));
    for (const task of longtasks)
      capture(
        "info",
        "longtask",
        `Long task of ${task.duration} milliseconds blocked the main thread${task.attributions.length > 0 ? ` (${task.attributions.join(", ")})` : ""}.`,
        task.at,
      );
  }
  const summary =
    step.kind === "watchconsole"
      ? `Captured ${consoleentries.length} console call${consoleentries.length === 1 ? "" : "s"} at every level for the reviewed window of ${options.window} milliseconds.`
      : step.kind === "watcherrors"
        ? `Captured ${errors.length} error${errors.length === 1 ? "" : "s"}, ${rejections.length} rejection${rejections.length === 1 ? "" : "s"} and ${resources.length} resource failure${resources.length === 1 ? "" : "s"} for the reviewed window of ${options.window} milliseconds.`
        : `Captured ${longtasks.length} long task${longtasks.length === 1 ? "" : "s"} for the reviewed window of ${options.window} milliseconds.`;
  return {
    ok: true,
    summary,
    details: {
      entries,
      console: consoleentries,
      errors,
      rejections,
      resources,
      longtasks,
      watchwindow: options.window,
      depth: options.depth,
      derivation:
        "Console, error and task watching derives from page-injected listeners and the performance buffers through the scripting api; no debugger permission exists in the manifest.",
    },
  };
}

/* ── Merged from pagedetect.ts: the 1.1.88 consolidation interns the correlated pagedetect logic here, so no variation of the same file lives beside another. ── */

/**
 * Page shape detection for reviewed steps.
 * Every correlated rule for repeated list detection, table shape normalization, pagination estimates, infinite scroll ranges, virtualization, lazy images, sticky overlays, scroll locks, consent banner shapes, template classification, section fingerprints and scroll positions lives in this file.
 */

/** Serializable sibling sample of one container element used by the list detector. */
export interface siblingsample {
  container: string;
  children: Array<{ tag: string; classes: string; text: string; selector: string }>;
}

/** Finds repeated item lists with a shared item selector from sibling samples. */
export function detectlistpatterns(samples: siblingsample[]): listpattern[] {
  const patterns: listpattern[] = [];
  for (const sample of samples) {
    const groups = new Map<string, Array<{ tag: string; classes: string; text: string }>>();
    for (const child of sample.children) {
      const key = `${child.tag}|${child.classes}`;
      const group = groups.get(key) ?? [];
      group.push(child);
      groups.set(key, group);
    }
    for (const [key, group] of groups) {
      if (group.length < 2) continue;
      if (!group.some((item) => item.text)) continue;
      const [tag, classes] = key.split("|") as [string, string?];
      const classpart = (classes ?? "")
        .split(" ")
        .filter(Boolean)
        .map((name) => `.${name}`)
        .join("");
      patterns.push({
        container: sample.container,
        itemselector: `${tag}${classpart}`,
        repeat: group.length,
        samples: group.map((item) => item.text).filter(Boolean),
      });
    }
  }
  return patterns;
}

/** Normalizes one table row structure into header row, column specs and caption. */
export function normalizetable(
  rows: Array<{ cells: string[]; header: boolean }>,
  caption: string,
): { headers: string[]; columns: Array<{ label: string; cells: number }>; rows: number; caption: string } {
  const firstheader = rows.find((row) => row.header);
  const headers = firstheader?.cells ?? [];
  const body = firstheader ? rows.filter((row) => row !== firstheader) : rows;
  const width = rows.reduce((largest, row) => Math.max(largest, row.cells.length), 0);
  const columns: Array<{ label: string; cells: number }> = [];
  for (let index = 0; index < width; index += 1) {
    const label = headers[index] ?? `column ${index + 1}`;
    const cells = body.filter((row) => Boolean((row.cells[index] ?? "").trim())).length;
    columns.push({ label, cells });
  }
  return { headers, columns, rows: body.length, caption };
}

/** Counts pagination entries and estimates the total page count from the numbers they carry. */
export function paginationestimate(entries: Array<{ text: string; selector: string; current: boolean }>): {
  current: number;
  total: number;
  links: number;
  pages: number[];
} {
  const pages: number[] = [];
  let current = 0;
  for (const entry of entries) {
    const parsed = /^\d+$/.exec(entry.text.trim());
    if (parsed) {
      const page = Number.parseInt(parsed[0] as string, 10);
      pages.push(page);
      if (entry.current) current = page;
    }
  }
  const total = Math.max(0, ...pages, current);
  return { current, total, links: entries.length, pages };
}

/** Serializable scroll range input of one scrollable container. */
export interface scrollrangeshape {
  selector: string;
  scrollheight: number;
  clientheight: number;
  triggers: string[];
}

/** Flags infinite scroll containers from measured scroll ranges and their load more triggers. */
export function infinitescrollranges(
  ranges: scrollrangeshape[],
): Array<{ selector: string; scrollrange: number; triggers: string[] }> {
  return ranges
    .filter((range) => range.scrollheight > range.clientheight && range.triggers.length > 0)
    .map((range) => ({
      selector: range.selector,
      scrollrange: range.scrollheight - range.clientheight,
      triggers: range.triggers,
    }));
}

/** Detects virtualized lists whose uniform rendered rows do not fill the measured scroll range. */
export function virtualizedcontainers(
  containers: Array<{
    selector: string;
    scrollheight: number;
    rows: Array<{ selector: string; height: number; classes: string }>;
  }>,
): Array<{ selector: string; rendered: number; estimated: number }> {
  const results: Array<{ selector: string; rendered: number; estimated: number }> = [];
  for (const container of containers) {
    const first = container.rows[0];
    if (!first || container.rows.length < 2 || first.height <= 0) continue;
    if (!container.rows.every((row) => row.height === first.height)) continue;
    if (container.scrollheight <= container.rows.length * first.height) continue;
    results.push({
      selector: container.selector,
      rendered: container.rows.length,
      estimated: Math.floor(container.scrollheight / first.height),
    });
  }
  return results;
}

/** Serializable image shape used by the lazy detector. */
export interface imageshape {
  selector: string;
  src: string;
  datasrc: string;
  loading: string;
  width: number;
  height: number;
}

/** Detects lazy loaded images from loading attributes and deferred sources, and placeholder states from inline data or empty sources. */
export function lazysurvey(images: imageshape[]): {
  lazy: Array<{ selector: string; reason: string }>;
  placeholders: Array<{ selector: string; reason: string }>;
} {
  const lazy: Array<{ selector: string; reason: string }> = [];
  const placeholders: Array<{ selector: string; reason: string }> = [];
  for (const image of images) {
    if (image.loading === "lazy") lazy.push({ selector: image.selector, reason: "loading attribute" });
    else if (image.datasrc) lazy.push({ selector: image.selector, reason: "deferred source" });
    if (!image.src) placeholders.push({ selector: image.selector, reason: "empty source" });
    else if (image.src.startsWith("data:"))
      placeholders.push({ selector: image.selector, reason: "inline data placeholder" });
  }
  return { lazy, placeholders };
}

/** Detects sticky headers and overlays from fixed and sticky geometry measured against the viewport. */
export function overlaygeometry(
  elements: Array<{ selector: string; position: string; top: number; height: number; width: number }>,
  viewport: { width: number; height: number },
): Array<{ selector: string; position: string; coverage: number; hides: boolean }> {
  const area = viewport.width * viewport.height;
  return elements
    .filter(
      (element) =>
        (element.position === "sticky" || element.position === "fixed") && element.top <= 0 && element.height > 0,
    )
    .map((element) => {
      const coverage = area > 0 ? (element.height * element.width) / area : 0;
      return {
        selector: element.selector,
        position: element.position,
        coverage: Math.round(coverage * 1000) / 1000,
        hides: coverage >= overlaythreshold,
      };
    });
}

/** Detects scroll locks and modal states from body overflow, body position and modal presence signals. */
export function scrolllockstate(signals: {
  bodyoverflow: string;
  htmloverflow: string;
  bodyposition: string;
  modal: boolean;
  scrollable: boolean;
}): { locked: boolean; reasons: string[]; scrollable: boolean } {
  const reasons: string[] = [];
  if (signals.bodyoverflow.includes("hidden") || signals.htmloverflow.includes("hidden"))
    reasons.push("overflow hidden");
  if (signals.bodyposition === "fixed") reasons.push("fixed body");
  if (signals.modal) reasons.push("modal open");
  return { locked: reasons.length > 0, reasons, scrollable: signals.scrollable };
}

/** Serializable consent banner candidate collected by the banner watcher glue. */
export interface bannercandidate {
  selector: string;
  id: string;
  classes: string[];
  text: string;
  controls: string[];
}

/** Consent banner keywords the shape matcher recognizes across locales. */
export const consentkeywords = ["cookie", "consent", "gdpr", "lgpd", "privacy", "ccpa"];

/** Matches consent banner shapes against the known keyword vocabulary and reports their controls. */
export function bannermatches(candidates: bannercandidate[], at: number): bannerreport[] {
  const reports: bannerreport[] = [];
  for (const candidate of candidates) {
    const haystack = `${candidate.id} ${candidate.classes.join(" ")} ${candidate.text}`.toLowerCase();
    const keyword = consentkeywords.find((word) => haystack.includes(word));
    if (!keyword) continue;
    if (!candidate.text && candidate.controls.length === 0) continue;
    reports.push({
      kind: keyword,
      selector: candidate.selector,
      text: candidate.text.slice(0, 200),
      controls: candidate.controls,
      at,
    });
  }
  return reports;
}

/** Classifies the page template from its dominant structural signals. */
export function classifytemplate(signals: {
  paragraphs: number;
  headings: number;
  lists: number;
  tables: number;
  forms: number;
  inputs: number;
  password: boolean;
}): string {
  if (signals.password) return "login";
  if (signals.paragraphs >= 3) return "article";
  if (signals.tables > 0) return "table";
  if (signals.forms > 0 && signals.inputs > 0) return "form";
  if (signals.lists > 0) return "list";
  return "generic";
}

/** Computes a stable structural fingerprint of one page section from its tag, attributes, child count and text length. */
export function sectionfingerprint(section: {
  tag: string;
  attributes: Record<string, string>;
  children: number;
  textlength: number;
}): string {
  const canonical = [
    section.tag,
    String(section.children),
    String(section.textlength),
    ...Object.keys(section.attributes)
      .sort()
      .map((key) => `${key}=${section.attributes[key] ?? ""}`),
  ].join("|");
  let hash = 5381;
  for (let index = 0; index < canonical.length; index += 1)
    hash = ((hash << 5) + hash + canonical.charCodeAt(index)) >>> 0;
  return `fp${hash.toString(16)}`;
}

/** Normalizes the scroll position of the window and its scrollable containers with edge flags. */
export function scrollreport(
  window: { scrollx: number; scrolly: number; scrollheight: number; clientheight: number },
  containers: Array<{
    selector: string;
    scrolltop: number;
    scrollleft: number;
    scrollheight: number;
    clientheight: number;
  }>,
): {
  window: { x: number; y: number; attop: boolean; atbottom: boolean; height: number };
  containers: Array<{
    selector: string;
    scrolltop: number;
    scrollleft: number;
    scrollrange: number;
    atbottom: boolean;
  }>;
} {
  const range = Math.max(0, window.scrollheight - window.clientheight);
  return {
    window: {
      x: window.scrollx,
      y: window.scrolly,
      attop: window.scrolly <= 0,
      atbottom: window.scrolly >= range,
      height: window.scrollheight,
    },
    containers: containers.map((container) => {
      const containerrange = Math.max(0, container.scrollheight - container.clientheight);
      return {
        selector: container.selector,
        scrolltop: container.scrolltop,
        scrollleft: container.scrollleft,
        scrollrange: containerrange,
        atbottom: container.scrolltop >= containerrange,
      };
    }),
  };
}

const loadmorepattern = /(load more|show more|see more|ver mais|carregar mais|load older|afficher plus|mehr anzeigen)/i;
const paginationtext = /^(next|prev|previous|last|first|next page|previous page|»|«|›|‹|\d+)$/i;
/** Viewport coverage fraction at which a sticky or fixed overlay is reported as hiding content. */
const overlaythreshold = 0.25;

function signatureof(element: Element): string {
  return `${element.tagName.toLowerCase()}|${[...element.classList].sort().join(" ")}`;
}

/** Collects the sibling samples of one document for the list detector. */
export function collectsiblings(root: Document): siblingsample[] {
  const samples: siblingsample[] = [];
  for (const element of [...root.querySelectorAll("*")]) {
    const children = [...element.children];
    if (children.length < 2) continue;
    const counts = new Map<string, number>();
    for (const child of children) {
      const key = signatureof(child);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    if (![...counts.values()].some((count) => count >= 2)) continue;
    samples.push({
      container: elementselector(element),
      children: children.map((child) => ({
        tag: child.tagName.toLowerCase(),
        classes: [...child.classList].sort().join(" "),
        text: clean(child.textContent ?? ""),
        selector: elementselector(child),
      })),
    });
  }
  return samples;
}

/** Collects the data table structures of one document for the table shape normalizer. */
export function collecttables(
  root: Document,
): Array<{ selector: string; rows: Array<{ cells: string[]; header: boolean }>; caption: string }> {
  return [...root.querySelectorAll("table")].map((table) => ({
    selector: elementselector(table),
    rows: [...table.querySelectorAll("tr")].map((row) => ({
      cells: [...row.querySelectorAll("th, td")].map((cell) => clean(cell.textContent ?? "")),
      header: Boolean(row.querySelector("th")),
    })),
    caption: clean(table.querySelector("caption")?.textContent ?? ""),
  }));
}

function collectpagination(root: Document): Array<{ text: string; selector: string; current: boolean }> {
  const entries: Array<{ text: string; selector: string; current: boolean }> = [];
  for (const element of [...root.querySelectorAll("a[href], button, [role=button], [role=link], li, span")]) {
    const text = clean(element.textContent ?? "");
    if (!text || !paginationtext.test(text)) continue;
    if (!element.closest("nav, footer, [class*=pag i], [id*=pag i]")) continue;
    const current =
      element.getAttribute("aria-current") === "page" ||
      [...element.classList].some((name) => /current|active|selecionado/i.test(name));
    entries.push({ text, selector: elementselector(element), current });
  }
  return entries;
}

function collecttriggers(scope: ParentNode): string[] {
  const triggers: string[] = [];
  for (const element of [
    ...scope.querySelectorAll(
      "button, a[href], [role=button], [class*=loading i], [class*=sentinel i], [class*=spinner i]",
    ),
  ]) {
    const label = clean(element.getAttribute("aria-label") ?? element.textContent ?? "");
    if (loadmorepattern.test(label)) triggers.push(elementselector(element));
  }
  return triggers;
}

function collectscrollranges(root: Document): scrollrangeshape[] {
  const ranges: scrollrangeshape[] = [];
  const scrolling = root.scrollingElement ?? root.documentElement;
  const viewheight = root.defaultView?.innerHeight ?? 0;
  if (scrolling && scrolling.scrollHeight > viewheight)
    ranges.push({
      selector: "window",
      scrollheight: scrolling.scrollHeight,
      clientheight: viewheight,
      triggers: collecttriggers(root),
    });
  for (const element of [...root.querySelectorAll("*")]) {
    if (!(element instanceof HTMLElement)) continue;
    if (element.scrollHeight <= element.clientHeight) continue;
    ranges.push({
      selector: elementselector(element),
      scrollheight: element.scrollHeight,
      clientheight: element.clientHeight,
      triggers: collecttriggers(element),
    });
  }
  return ranges;
}

function collectvirtual(
  root: Document,
): Array<{
  selector: string;
  scrollheight: number;
  rows: Array<{ selector: string; height: number; classes: string }>;
}> {
  const containers: Array<{
    selector: string;
    scrollheight: number;
    rows: Array<{ selector: string; height: number; classes: string }>;
  }> = [];
  for (const element of [...root.querySelectorAll("*")]) {
    const children = [...element.children];
    const first = children[0];
    if (!first || children.length < 2) continue;
    if (!children.every((child) => signatureof(child) === signatureof(first))) continue;
    const heights = children.map((child) => child.getBoundingClientRect().height);
    if (!heights.every((height) => height > 0 && height === heights[0])) continue;
    containers.push({
      selector: elementselector(element),
      scrollheight: element.scrollHeight,
      rows: children.map((child) => ({
        selector: elementselector(child),
        height: child.getBoundingClientRect().height,
        classes: [...child.classList].join(" "),
      })),
    });
  }
  return containers;
}

function collectimages(root: Document): imageshape[] {
  return [...root.querySelectorAll("img")].map((image) => ({
    selector: elementselector(image),
    src: image.getAttribute("src") ?? "",
    datasrc: image.getAttribute("data-src") ?? image.getAttribute("data-original") ?? "",
    loading: image.getAttribute("loading") ?? "",
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
}

function collectoverlays(
  root: Document,
): Array<{ selector: string; position: string; top: number; height: number; width: number }> {
  const elements: Array<{ selector: string; position: string; top: number; height: number; width: number }> = [];
  for (const element of [...root.querySelectorAll("*")]) {
    if (!(element instanceof HTMLElement)) continue;
    const view = element.ownerDocument.defaultView;
    const position = view ? view.getComputedStyle(element).position : "";
    if (position !== "sticky" && position !== "fixed") continue;
    const rect = element.getBoundingClientRect();
    elements.push({
      selector: elementselector(element),
      position,
      top: rect.top,
      height: rect.height,
      width: rect.width,
    });
  }
  return elements;
}

function collectlocksignals(root: Document): {
  bodyoverflow: string;
  htmloverflow: string;
  bodyposition: string;
  modal: boolean;
  scrollable: boolean;
} {
  const view = root.defaultView;
  const bodystyle = root.body ? (view ? view.getComputedStyle(root.body) : undefined) : undefined;
  const htmlstyle = view ? view.getComputedStyle(root.documentElement) : undefined;
  return {
    bodyoverflow: bodystyle?.overflow ?? "",
    htmloverflow: htmlstyle?.overflow ?? "",
    bodyposition: bodystyle?.position ?? "",
    modal: Boolean(root.querySelector("dialog[open], [aria-modal=true]")),
    scrollable: root.documentElement.scrollHeight > root.documentElement.clientHeight,
  };
}

const bannerselector =
  '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="gdpr" i], [class*="gdpr" i], [id*="privacy" i], [class*="privacy" i], [id*="banner" i], [class*="banner" i], dialog, [role="dialog"], [aria-modal="true"]';

/** Collects the consent banner candidates of one document for the banner shape matcher. */
export function collectbannercandidates(root: Document): bannercandidate[] {
  const found = [...root.querySelectorAll(bannerselector)];
  return found
    .filter((element) => !found.some((other) => other !== element && other.contains(element)))
    .map((element) => ({
      selector: elementselector(element),
      id: element.id,
      classes: [...element.classList],
      text: clean(element.textContent ?? "").slice(0, 200),
      controls: [...element.querySelectorAll("button, a[href], [role=button]")]
        .map((control) => clean(control.getAttribute("aria-label") ?? control.textContent ?? ""))
        .filter(Boolean),
    }));
}

/** Runs one page shape detection after the background policy gate; frame routed steps receive their frame document as the root. */
export function runpagedetection(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  switch (step.kind) {
    case "detectlists": {
      const patterns = detectlistpatterns(collectsiblings(root));
      return {
        ok: true,
        summary: `Detected ${patterns.length} repeated list${patterns.length === 1 ? "" : "s"}.`,
        details: { lists: patterns },
      };
    }
    case "detecttables": {
      const tables: tableshape[] = collecttables(root).map((entry) => {
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
        ok: true,
        summary: `Detected ${tables.length} data table${tables.length === 1 ? "" : "s"}.`,
        details: { tables },
      };
    }
    case "countpages": {
      const estimate = paginationestimate(collectpagination(root));
      return {
        ok: true,
        summary: `Counted ${estimate.links} pagination entr${estimate.links === 1 ? "y" : "ies"} and estimated ${estimate.total} total page${estimate.total === 1 ? "" : "s"}.`,
        details: { current: estimate.current, total: estimate.total, links: estimate.links, pages: estimate.pages },
      };
    }
    case "detectinfinitescroll": {
      const containers = infinitescrollranges(collectscrollranges(root));
      return {
        ok: true,
        summary: `Detected ${containers.length} infinite scroll container${containers.length === 1 ? "" : "s"}.`,
        details: { containers },
      };
    }
    case "detectvirtual": {
      const containers = virtualizedcontainers(collectvirtual(root));
      return {
        ok: true,
        summary: `Detected ${containers.length} virtualized list${containers.length === 1 ? "" : "s"}.`,
        details: { containers },
      };
    }
    case "detectlazy": {
      const survey = lazysurvey(collectimages(root));
      return {
        ok: true,
        summary: `Detected ${survey.lazy.length} lazy image${survey.lazy.length === 1 ? "" : "s"} and ${survey.placeholders.length} placeholder${survey.placeholders.length === 1 ? "" : "s"}.`,
        details: { lazy: survey.lazy, placeholders: survey.placeholders },
      };
    }
    case "detectsticky": {
      const overlays = overlaygeometry(collectoverlays(root), {
        width: root.defaultView?.innerWidth ?? 0,
        height: root.defaultView?.innerHeight ?? 0,
      });
      return {
        ok: true,
        summary: `Detected ${overlays.length} sticky or fixed overlay${overlays.length === 1 ? "" : "s"}.`,
        details: { overlays },
      };
    }
    case "detectscrolllock": {
      const lock = scrolllockstate(collectlocksignals(root));
      return {
        ok: true,
        summary: lock.locked ? `Scroll is locked: ${lock.reasons.join(", ")}.` : "Scroll is not locked.",
        details: { locked: lock.locked, reasons: lock.reasons, scrollable: lock.scrollable },
      };
    }
    case "classifypage": {
      const signals = {
        paragraphs: root.querySelectorAll("p").length,
        headings: root.querySelectorAll("h1, h2, h3, h4, h5, h6").length,
        lists: root.querySelectorAll("ul, ol").length,
        tables: root.querySelectorAll("table").length,
        forms: root.querySelectorAll("form").length,
        inputs: root.querySelectorAll("input, textarea, select").length,
        password: Boolean(root.querySelector("input[type=password]")),
      };
      const template = classifytemplate(signals);
      const fingerprint = sectionfingerprint({
        tag: "body",
        attributes: {},
        children: root.body?.children.length ?? 0,
        textlength: (root.body?.innerText ?? "").length,
      });
      return { ok: true, summary: `Classified the page template as ${template}.`, details: { template, fingerprint } };
    }
    case "fingerprintsection": {
      if (!target) return { ok: false, summary: "Fingerprint target is no longer available." };
      const attributes: Record<string, string> = {};
      for (const attribute of [...target.attributes]) attributes[attribute.name] = attribute.value;
      const fingerprint = sectionfingerprint({
        tag: target.tagName.toLowerCase(),
        attributes,
        children: target.children.length,
        textlength: (target.textContent ?? "").length,
      });
      return {
        ok: true,
        summary: `Computed section fingerprint ${fingerprint}.`,
        details: { fingerprint, section: elementselector(target) },
      };
    }
    case "readscrollpos": {
      const report = scrollreport(
        {
          scrollx: root.defaultView?.scrollX ?? 0,
          scrolly: root.defaultView?.scrollY ?? 0,
          scrollheight: root.documentElement.scrollHeight,
          clientheight: root.defaultView?.innerHeight ?? 0,
        },
        [...root.querySelectorAll("*")]
          .filter((element) => element instanceof HTMLElement && element.scrollHeight > element.clientHeight)
          .map((element) => ({
            selector: elementselector(element),
            scrolltop: element.scrollTop,
            scrollleft: element.scrollLeft,
            scrollheight: element.scrollHeight,
            clientheight: element.clientHeight,
          })),
      );
      return {
        ok: true,
        summary: `Read the scroll position at ${Math.round(report.window.x)},${Math.round(report.window.y)} with ${report.containers.length} scrollable container${report.containers.length === 1 ? "" : "s"}.`,
        details: { scroll: report },
      };
    }
    default:
      return { ok: false, summary: "Unsupported page detection." };
  }
}

/* ── Merged from pagedialogs.ts: the 1.1.88 consolidation interns the correlated pagedialogs logic here, so no variation of the same file lives beside another. ── */

/**
 * Dialog policy logics for reviewed steps.
 * Every correlated rule for policy parsing, dialog answers, main world handler installation and observed dialog harvesting lives in this file.
 * The isolated world cannot override window.confirm, window.alert or window.prompt, so the background installs these wrappers through the scripting api in the main world.
 */

/** One dialog observed by the main world handler, recorded on the shared document. */
export interface observeddialog {
  dialog: string;
  text: string;
  result: string | boolean | null;
  at: number;
}

/** Parses the reviewed dialog policy from step options; prompts need a reviewed answer. */
export function parsedialogpolicy(step: toolstep): dialogpolicy | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    return null;
  }
  const accept = options.accept;
  const answer = options.answer;
  if (typeof accept !== "boolean" && typeof answer !== "string") return null;
  return { accept: accept === true, ...(typeof answer === "string" && answer.trim() ? { answer } : {}) };
}

/** Decides how the reviewed policy answers one dialog kind; a prompt without a reviewed answer is dismissed. */
export function dialoganswer(
  policy: dialogpolicy,
  dialog: "confirm" | "alert" | "prompt",
): { accept: boolean; answer?: string } {
  if (dialog === "prompt") {
    if (policy.answer === undefined || policy.answer === "") return { accept: false };
    return { accept: policy.accept !== false, ...(policy.answer !== undefined ? { answer: policy.answer } : {}) };
  }
  return { accept: policy.accept };
}

/** Reads and clears the dialog log the main world handler recorded on the shared document. */
export function harvestdialoglog(root: Document): observeddialog[] {
  const raw = root.documentElement.dataset.devthinkdialoglog;
  if (!raw) return [];
  delete root.documentElement.dataset.devthinkdialoglog;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is observeddialog =>
        Boolean(item) && typeof item === "object" && typeof (item as Record<string, unknown>).dialog === "string",
    );
  } catch {
    return [];
  }
}

/** Installs confirm, alert and prompt wrappers in the page main world answering per the reviewed policy; runs through chrome.scripting with world main. */
export function installdialoghandler(accept: boolean, answer: string, persistent: boolean): void {
  const world = globalThis as typeof globalThis & {
    devthinkoriginaldialogs?: {
      confirm: (text?: string) => boolean;
      alert: (text?: string) => void;
      prompt: (text?: string, defaultvalue?: string) => string | null;
    };
  };
  const originals = world.devthinkoriginaldialogs ?? {
    confirm: window.confirm.bind(window),
    alert: window.alert.bind(window),
    prompt: window.prompt.bind(window),
  };
  world.devthinkoriginaldialogs = originals;
  const decide = (dialog: string): { accept: boolean; answer: string | null } => {
    if (dialog === "prompt") return answer ? { accept: true, answer } : { accept: false, answer: null };
    return { accept, answer: null };
  };
  const record = (dialog: string, text: string, result: string | boolean | null): void => {
    try {
      const root = document.documentElement;
      const log = JSON.parse(root.dataset.devthinkdialoglog ?? "[]") as unknown[];
      log.push({ dialog, text, result, at: Date.now() });
      root.dataset.devthinkdialoglog = JSON.stringify(log);
    } catch {
      /* a locked down page refuses dataset writes; the handler still answers */
    }
  };
  window.confirm = (text?: string): boolean => {
    const decision = decide("confirm");
    record("confirm", text ?? "", decision.accept);
    if (!persistent) window.confirm = originals.confirm;
    return decision.accept;
  };
  window.alert = (text?: string): void => {
    record("alert", text ?? "", true);
    if (!persistent) window.alert = originals.alert;
  };
  window.prompt = (text?: string, defaultvalue?: string): string | null => {
    const decision = decide("prompt");
    const outcome = decision.accept ? (decision.answer ?? defaultvalue ?? "") : null;
    record("prompt", text ?? "", outcome);
    if (!persistent) window.prompt = originals.prompt;
    return outcome;
  };
}

/* ── Merged from pageemulate.ts: the 1.1.88 consolidation interns the correlated pageemulate logic here, so no variation of the same file lives beside another. ── */

/**
 * Page-side emulation for the reviewed 1.1.48 steps.
 * Correlated rules for the injected mask layer live in the root emulation module while this file applies and reverts the masks inside the page through the scripting api: the device layer overrides the pixel ratio and the mobile hint beside the viewport bounds the window update api carries, the network layer registers the reviewed latency, throughput and offline bounds for the transport the extension initiates, the location layer overrides navigator geolocation with the reviewed coordinates, the agent layer overrides the navigator user agent, platform and brand list together and scoped to the run tab only, the permission layer answers navigator permission queries with the reviewed state, and the blackbox layer registers the reviewed patterns so stack traces hide third party frames.
 * True device metric, network condition, geolocation and user agent override needs the debugger permission or platform permissions the manifest gate forbids, so every mask is a page-injected derivation recorded honestly on every layer; the browser headers and the true device state stay untouched.
 */

/** The shared registry key of the active page-side masks so reverts find the applied values after the apply. */
const registrykey = "devthinkemulation";

interface maskregistry {
  pixelratio?: number;
  geolocation?: Geolocation;
  useragent?: string;
  platform?: string;
  brands?: string[];
  permissions?: Permissions;
  blackbox?: string[];
}

function registry(): maskregistry {
  const holder = globalThis as typeof globalThis & { devthinkemulation?: maskregistry };
  if (holder.devthinkemulation === undefined) holder.devthinkemulation = {};
  return holder.devthinkemulation;
}

/** Captures the prior page state of one family so the revert restores the exact values. */
function priorsnapshot(family: string): Record<string, unknown> {
  if (family === "device")
    return {
      pixelratio: window.devicePixelRatio,
      viewportwidth: window.innerWidth,
      viewportheight: window.innerHeight,
    };
  if (family === "agent") return { useragent: navigator.userAgent, platform: navigator.platform };
  if (family === "permission")
    return {
      note: "the browser permission state stays untouched and the override restores by removing the page-side answer",
    };
  return { note: "the layer adds no prior page state to restore" };
}

/** Overrides the page pixel ratio and mobile hint; the viewport bounds apply through the window update api in the background because the page cannot resize itself. */
function applydevice(width: number, height: number, pixelratio: number, mobile: boolean): void {
  const state = registry();
  if (state.pixelratio === undefined) state.pixelratio = window.devicePixelRatio;
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => pixelratio });
  document.documentElement.dataset.devthinkMobile = mobile ? "true" : "false";
  document.documentElement.dataset.devthinkViewport = `${width}x${height}`;
}

/** Restores the prior pixel ratio and clears the mobile hint and viewport marker. */
function revertdevice(prior: Record<string, unknown> | undefined): void {
  const state = registry();
  const restored =
    typeof prior?.pixelratio === "number" ? prior.pixelratio : (state.pixelratio ?? window.devicePixelRatio);
  Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => restored });
  delete document.documentElement.dataset.devthinkMobile;
  delete document.documentElement.dataset.devthinkViewport;
  delete state.pixelratio;
}

/** Overrides navigator geolocation with the reviewed coordinates and accuracy; the true browser location stays untouched. */
function applylocation(latitude: number, longitude: number, accuracy: number): void {
  const state = registry();
  if (state.geolocation === undefined) state.geolocation = navigator.geolocation;
  const position = (): GeolocationPosition =>
    ({
      coords: {
        latitude,
        longitude,
        accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      } as GeolocationCoordinates,
      timestamp: Date.now(),
    }) as GeolocationPosition;
  const overridden: Geolocation = {
    getCurrentPosition: (success) => {
      success(position());
    },
    watchPosition: (success) => {
      success(position());
      return 0;
    },
    clearWatch: () => {
      /* the page-side watch holds no timer */
    },
  };
  Object.defineProperty(navigator, "geolocation", { configurable: true, get: () => overridden });
}

/** Restores the true navigator geolocation. */
function revertlocation(): void {
  const state = registry();
  if (state.geolocation !== undefined)
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      get: () => state.geolocation as Geolocation,
    });
  delete state.geolocation;
}

/** Overrides the navigator user agent, platform and brand list together so page checks read the reviewed agent of the run tab only. */
function applyagent(useragent: string, platform: string, brands: string[]): void {
  const state = registry();
  if (state.useragent === undefined) state.useragent = navigator.userAgent;
  if (state.platform === undefined) state.platform = navigator.platform;
  if (state.brands === undefined) state.brands = brands;
  Object.defineProperty(navigator, "userAgent", { configurable: true, get: () => useragent });
  Object.defineProperty(navigator, "platform", { configurable: true, get: () => platform });
  const branded = brands.map((brand, index) => ({ brand, version: `${index + 1}.0.0.0` }));
  const dataholder = navigator as Navigator & { userAgentData?: { brands: Array<{ brand: string; version: string }> } };
  if (dataholder.userAgentData !== undefined)
    Object.defineProperty(dataholder, "userAgentData", { configurable: true, get: () => ({ brands: branded }) });
}

/** Restores the true navigator user agent, platform and brand list. */
function revertagent(prior: Record<string, unknown> | undefined): void {
  const state = registry();
  const useragent = typeof prior?.useragent === "string" ? prior.useragent : (state.useragent ?? navigator.userAgent);
  const platform = typeof prior?.platform === "string" ? prior.platform : (state.platform ?? navigator.platform);
  Object.defineProperty(navigator, "userAgent", { configurable: true, get: () => useragent });
  Object.defineProperty(navigator, "platform", { configurable: true, get: () => platform });
  delete state.useragent;
  delete state.platform;
  delete state.brands;
}

/** Answers navigator permission queries with the reviewed state while the browser permission itself stays untouched. */
function applypermission(name: string, state: string): void {
  const holder = navigator as Navigator & { devthinkpermission?: Record<string, string> };
  if (holder.devthinkpermission === undefined) holder.devthinkpermission = {};
  holder.devthinkpermission[name] = state;
  const state0 = registry();
  if (state0.permissions === undefined && navigator.permissions !== undefined)
    state0.permissions = navigator.permissions;
  if (navigator.permissions === undefined) return;
  const overridden: Permissions = {
    query: (description) =>
      new Promise((resolve) => {
        const applied = holder.devthinkpermission?.[description.name];
        resolve({
          state: (applied ?? "prompt") as PermissionState,
          name: description.name,
          onchange: null,
        } as PermissionStatus);
      }),
  };
  Object.defineProperty(navigator, "permissions", { configurable: true, get: () => overridden });
}

/** Removes the page-side permission answers so the browser permission state returns. */
function revertpermission(): void {
  const state = registry();
  if (state.permissions !== undefined)
    Object.defineProperty(navigator, "permissions", {
      configurable: true,
      get: () => state.permissions as Permissions,
    });
  delete state.permissions;
  delete (navigator as Navigator & { devthinkpermission?: Record<string, string> }).devthinkpermission;
}

/** Registers the blackbox patterns in the page registry so stack captures hide third party frames; the rules shape traces only and read no page state. */
function applyblackbox(patterns: string[]): void {
  registry().blackbox = patterns;
}

/** Returns the active blackbox patterns of the page registry for the stack capture filters. */
export function activeblackboxpatterns(): string[] {
  return registry().blackbox ?? [];
}

/** Runs one reviewed emulation step inside the page: the family of the kind decides the mask, the prior state is captured for the exact revert and the honest derivation note stays beside the result. */
export async function runemulationstep(step: toolstep): Promise<stepresult> {
  const options = (() => {
    try {
      return parseoptions(step);
    } catch {
      return {};
    }
  })();
  const family = familyofkind(step.kind);
  const derivation =
    "The mask is a page-injected override through the scripting api; the browser device metrics, network stack, true location, request headers and permission state stay untouched because no debugger or platform permission exists in the manifest.";
  if (step.kind === "emulatedevice") {
    const preset = devicepresetof(options.device);
    if (!preset) return { ok: false, summary: "The reviewed device preset is absent or malformed." };
    const prior = priorsnapshot("device");
    applydevice(preset.width, preset.height, preset.pixelratio, preset.mobile);
    return {
      ok: true,
      summary: `Applied the device preset ${preset.name} of ${preset.width} by ${preset.height} css pixels, pixel ratio ${preset.pixelratio} and the ${preset.mobile ? "mobile" : "desktop"} hint to the run tab.`,
      details: {
        prior,
        preset: {
          name: preset.name,
          width: preset.width,
          height: preset.height,
          pixelratio: preset.pixelratio,
          mobile: preset.mobile,
        },
        derivation,
      },
    };
  }
  if (step.kind === "emulatenetwork") {
    const preset = networkpresetof(options.network);
    if (!preset) return { ok: false, summary: "The reviewed network preset is absent or malformed." };
    const window0 = typeof options.window === "number" ? options.window : undefined;
    return {
      ok: true,
      summary: `Applied the network preset ${preset.name} with ${preset.latency} milliseconds latency, ${preset.download} and ${preset.upload} kilobit per second bounds${preset.offline ? ` and the offline flag${window0 !== undefined ? ` for the reviewed window of ${window0} milliseconds` : ""}` : ""}; the bounds shape the traffic the extension itself initiates.`,
      details: {
        preset: {
          name: preset.name,
          latency: preset.latency,
          download: preset.download,
          upload: preset.upload,
          offline: preset.offline,
        },
        ...(window0 !== undefined ? { window: window0 } : {}),
        derivation,
      },
    };
  }
  if (step.kind === "emulatelocate") {
    const preset = locationpresetof(options.location);
    if (!preset) return { ok: false, summary: "The reviewed location preset is absent or malformed." };
    applylocation(preset.latitude, preset.longitude, preset.accuracy);
    return {
      ok: true,
      summary: `Applied the location preset ${preset.name} of ${preset.latitude}, ${preset.longitude} with the ${preset.accuracy} meter accuracy radius to the run tab.`,
      details: {
        preset: {
          name: preset.name,
          latitude: preset.latitude,
          longitude: preset.longitude,
          accuracy: preset.accuracy,
        },
        derivation,
      },
    };
  }
  if (step.kind === "setuseragent") {
    const preset = agentpresetof(options.agent);
    if (!preset) return { ok: false, summary: "The reviewed agent preset is absent or malformed." };
    const prior = priorsnapshot("agent");
    applyagent(preset.useragent, preset.platform, preset.brands);
    return {
      ok: true,
      summary: `Applied the agent preset ${preset.name} with the reviewed user agent string, platform ${preset.platform} and ${preset.brands.length} brand${preset.brands.length === 1 ? "" : "s"} together, scoped to the run tab only.`,
      details: { prior, preset: { name: preset.name, platform: preset.platform, brands: preset.brands }, derivation },
    };
  }
  if (step.kind === "overridepermission") {
    const grant = permissiongrantof(options.permission);
    if (!grant) return { ok: false, summary: "The reviewed permission override is absent or malformed." };
    const prior = priorsnapshot("permission");
    applypermission(grant.name, grant.state);
    return {
      ok: true,
      summary: `Answered the ${grant.name} permission queries of the run tab with the reviewed ${grant.state} state${grant.runscope ? " for the run scope" : ""}; the browser permission itself stays untouched.`,
      details: { prior, permission: { name: grant.name, state: grant.state, runscope: grant.runscope }, derivation },
    };
  }
  if (step.kind === "blackboxscripts") {
    const rules = (Array.isArray(options.rules) ? options.rules : []).flatMap((rule) => {
      const parsed = blackboxruleof(rule);
      return parsed !== undefined ? [parsed] : [];
    });
    if (rules.length === 0) return { ok: false, summary: "The reviewed blackbox rule list is absent or malformed." };
    applyblackbox(rules.flatMap((rule) => rule.urlpatterns));
    return {
      ok: true,
      summary: `Marked ${rules.flatMap((rule) => rule.urlpatterns).length} third party url pattern${rules.flatMap((rule) => rule.urlpatterns).length === 1 ? "" : "s"} as blackboxed in the traces of the run; the rules read no page state.`,
      details: {
        rules,
        derivation:
          "Blackbox rules shape stack traces and profiles of the run only; they read no page state and touch no third party script.",
      },
    };
  }
  void family;
  return { ok: false, summary: "The emulation step is not part of the mask family." };
}

/** Reverts one emulation layer inside the page by restoring the captured prior state; the revert is idempotent for a context the navigation already destroyed. */
export function revertemulationlayer(
  family: string,
  prior: Record<string, unknown> | undefined,
): { ok: boolean; summary: string } {
  if (family === "device") {
    revertdevice(prior);
    return { ok: true, summary: "Restored the prior pixel ratio and cleared the device hint of the run tab." };
  }
  if (family === "location") {
    revertlocation();
    return { ok: true, summary: "Restored the true navigator geolocation of the run tab." };
  }
  if (family === "agent") {
    revertagent(prior);
    return { ok: true, summary: "Restored the true navigator user agent, platform and brand list of the run tab." };
  }
  if (family === "permission") {
    revertpermission();
    return { ok: true, summary: "Removed the page-side permission answers so the browser permission state returns." };
  }
  if (family === "blackbox") {
    delete registry().blackbox;
    return { ok: true, summary: "Removed the blackbox pattern registry of the run." };
  }
  return {
    ok: true,
    summary: "The network layer holds no page state to restore; the transport bounds ended with the run.",
  };
}

/* ── Merged from pageforms.ts: the 1.1.88 consolidation interns the correlated pageforms logic here, so no variation of the same file lives beside another. ── */

/**
 * Form field logics for reviewed steps.
 * Every correlated rule for field matching, field kind classification, seeded value generation, native value fills, honeypot detection, login and template detection, error association and form record parsing lives in this file.
 */

/** One serializable form field shape resolved against the page controls. */
export interface fieldshape {
  selector: string;
  tag: string;
  type: string;
  name: string;
  label: string;
  placeholder: string;
  arialabel: string;
  autocomplete: string;
  options?: string[];
}

/** One surveyed field shape carrying the visibility, geometry and timing evidence the honeypot detector reads. */
export interface fieldsurvey extends fieldshape {
  hidden: boolean;
  offscreen: boolean;
  createdat?: number;
}

/** One honeypot field flagged by hidden, offscreen or time trap evidence. */
export interface honeypotevidence {
  selector: string;
  reason: "hidden" | "offscreen" | "timetrap";
}

/** One surveyed field with the aria describedby ref and the sibling message texts the error reader associates. */
export interface errorcontext extends fieldshape {
  describedby?: string;
  siblings: string[];
}

/** Resolves controls by label, placeholder, aria label and name attributes; matches are case insensitive substrings. */
export function matchfield(fields: fieldshape[], match: fieldmatch): fieldshape[] {
  const key =
    match.mode === "label"
      ? "label"
      : match.mode === "placeholder"
        ? "placeholder"
        : match.mode === "arialabel"
          ? "arialabel"
          : "name";
  const needle = (match[key] ?? "").trim().toLowerCase();
  if (!needle) return [];
  return fields.filter((field) => {
    const primary = (field[key] as string).toLowerCase();
    const secondary =
      match.mode === "label" || match.mode === "name"
        ? field.name.toLowerCase()
        : match.mode === "placeholder"
          ? field.arialabel.toLowerCase()
          : field.placeholder.toLowerCase();
    return primary.includes(needle) || secondary.includes(needle);
  });
}

/** Infers the field kind of one control from its input type, autocomplete hint and label text. */
export function classifyfield(input: { type: string; autocomplete: string; label: string }): fieldkind {
  const type = input.type.toLowerCase();
  const autocomplete = input.autocomplete.toLowerCase();
  const label = input.label.toLowerCase();
  if (type === "password") return "password";
  if (
    autocomplete.startsWith("cc-") ||
    label.includes("card number") ||
    label.includes("credit card") ||
    label.includes("cardholder")
  )
    return "card";
  if (
    autocomplete.includes("one-time-code") ||
    autocomplete.includes("otp") ||
    label.includes("one time code") ||
    label.includes("verification code") ||
    label.includes("otp")
  )
    return "code";
  if (type === "email" || autocomplete.includes("email") || label.includes("email")) return "email";
  if (type === "tel" || autocomplete.includes("tel") || label.includes("phone") || label.includes("telephone"))
    return "phone";
  if (type === "date") return "date";
  if (type === "number") return "number";
  if (type === "checkbox") return "check";
  if (type === "radio") return "radio";
  if (type === "file") return "file";
  if (type === "select" || type === "select-one") return "select";
  return "text";
}

const firstnames: Record<string, string[]> = {
  en: ["alex", "jordan", "taylor", "morgan", "casey"],
  pt: ["ana", "bruno", "carla", "diego", "helena"],
};
const lastnames: Record<string, string[]> = {
  en: ["brooks", "carter", "diaz", "evans", "reyes"],
  pt: ["alves", "costa", "lima", "souza", "moraes"],
};

function localekey(locale: string): string {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("pt")) return "pt";
  return "en";
}

/** Generates one realistic value for a field kind, deterministically seeded and locale aware for names, emails and phones. */
export function generatevalue(kind: fieldkind, rule: { locale?: string; seed?: number }): string {
  const seed = typeof rule.seed === "number" && Number.isFinite(rule.seed) ? Math.abs(Math.floor(rule.seed)) : 1;
  const names = firstnames[localekey(rule.locale ?? "en")] ?? firstnames.en ?? ["alex"];
  const surnames = lastnames[localekey(rule.locale ?? "en")] ?? lastnames.en ?? ["brooks"];
  let state = seed * 1103515245 + 12345;
  const next = (): number => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const pick = <T>(items: T[]): T => items[Math.floor(next() * items.length) % items.length] ?? (items[0] as T);
  const digits = (count: number): string =>
    Array.from({ length: count }, () => String(Math.floor(next() * 10))).join("");
  const person = `${pick(names)} ${pick(surnames)}`;
  switch (kind) {
    case "email":
      return `${person.replace(" ", ".")}${digits(2)}@example.com`;
    case "phone":
      return localekey(rule.locale ?? "en") === "pt"
        ? `+55 (11) 9${digits(4)}-${digits(4)}`
        : `+1 (555) 010-${digits(4)}`;
    case "date":
      return `${2024 + Math.floor(next() * 2)}-${String(1 + Math.floor(next() * 12)).padStart(2, "0")}-${String(1 + Math.floor(next() * 28)).padStart(2, "0")}`;
    case "number":
      return String(Math.floor(next() * 1000));
    case "select":
      return `option ${1 + Math.floor(next() * 5)}`;
    case "check":
      return next() > 0.5 ? "true" : "false";
    case "radio":
      return `choice ${1 + Math.floor(next() * 4)}`;
    case "file":
      return `sample${digits(2)}.pdf`;
    case "password":
      return `pw-${digits(6)}-${pick(names)}`;
    case "card":
      return `4111 ${digits(4)} ${digits(4)} ${digits(4)}`;
    case "code":
      return digits(6);
    default:
      return person;
  }
}

/** Builds a deterministic values hash of the reviewed field values a submission ticket records. */
export function valueshash(values: Array<{ label: string; value: string }>): string {
  const source = values.map((entry) => `${entry.label}=${entry.value}`).join("|");
  let hash = 5381;
  for (let index = 0; index < source.length; index += 1) hash = ((hash * 33) ^ source.charCodeAt(index)) >>> 0;
  return hash.toString(16);
}

/** Parses the reviewed structured form record of a step; null when the step reviews none or the shape is invalid. */
export function parseformrecord(value: unknown): formrecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.entries)) return null;
  const entries: formentry[] = [];
  for (const item of record.entries) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const entry = item as Record<string, unknown>;
    const match = entry.match;
    if (!match || typeof match !== "object" || Array.isArray(match)) continue;
    const shapes = match as Record<string, unknown>;
    if (typeof shapes.mode !== "string") continue;
    const fieldmatch: fieldmatch = {
      mode: shapes.mode as fieldmatch["mode"],
      ...(typeof shapes.label === "string" ? { label: shapes.label } : {}),
      ...(typeof shapes.placeholder === "string" ? { placeholder: shapes.placeholder } : {}),
      ...(typeof shapes.arialabel === "string" ? { arialabel: shapes.arialabel } : {}),
      ...(typeof shapes.name === "string" ? { name: shapes.name } : {}),
    };
    if (typeof entry.kind !== "string" || typeof entry.value !== "string") continue;
    entries.push({ match: fieldmatch, kind: entry.kind as fieldkind, value: entry.value });
  }
  if (entries.length === 0) return null;
  return { ...(typeof record.form === "string" && record.form ? { form: record.form } : {}), entries };
}

/** Builds form record entries from reviewed label or placeholder value pairs. */
export function pairentries(
  pairs: Array<{ label?: string; placeholder?: string; value: string }>,
  mode: "label" | "placeholder",
): formrecord {
  return {
    entries: pairs.map((pair) => ({
      match: mode === "label" ? { mode, label: pair.label ?? "" } : { mode, placeholder: pair.placeholder ?? "" },
      kind: "text",
      value: pair.value,
    })),
  };
}

/** One fill operation outcome: the entry, the matched control, the honeypot skip flag or the refusal reason. */
export interface filloutcome {
  entry: formentry;
  matched?: fieldshape;
  skipped?: boolean;
  reason?: string;
}

/** Resolves every entry of a form record against the surveyed fields, skipping honeypots and refusing unmatched or ambiguous entries. */
export function filloperations(
  record: formrecord,
  fields: fieldshape[],
  skippedselectors: string[] = [],
): filloutcome[] {
  return record.entries.map((entry) => {
    const matches = matchfield(fields, entry.match);
    if (matches.length === 0) return { entry, reason: "unmatched" };
    if (matches.length > 1) return { entry, reason: "ambiguous" };
    const matched = matches[0] as fieldshape;
    if (skippedselectors.includes(matched.selector)) return { entry, matched, skipped: true };
    return { entry, matched };
  });
}

/** Masks one card segment so side panels can render card fills without exposing the full value. */
export function cardmask(value: string): string {
  const trimmed = value.trim();
  if (/^\d[\d\s-]{11,18}$/.test(trimmed)) {
    const compact = trimmed.replace(/[\s-]/g, "");
    const last = compact.slice(-4);
    return `${"•".repeat(Math.max(0, compact.length - 4))}${last}`;
  }
  return "•".repeat(trimmed.length);
}

/** Flags hidden, offscreen and time trap fields so fill steps skip them instead of tripping anti bot defenses. */
export function detecthoneypots(surveys: fieldsurvey[], loadedat: number): honeypotevidence[] {
  const traps: honeypotevidence[] = [];
  for (const field of surveys) {
    if (field.hidden) traps.push({ selector: field.selector, reason: "hidden" });
    else if (field.offscreen) traps.push({ selector: field.selector, reason: "offscreen" });
    else if (field.createdat !== undefined && loadedat > 0 && field.createdat > loadedat)
      traps.push({ selector: field.selector, reason: "timetrap" });
  }
  return traps;
}

/** Detects a login form: a password field plus an identifier field with session links nearby. */
export function detectlogin(fields: fieldshape[], links: string[]): { login: boolean; markers: string[] } {
  const markers: string[] = [];
  const password = fields.find((field) => classifyfield(field) === "password");
  if (password) markers.push("password field");
  const identifier = fields.find((field) => {
    const kind = classifyfield(field);
    return (
      kind === "email" || (kind === "text" && /user|login|account|identifier/i.test(`${field.name} ${field.label}`))
    );
  });
  if (identifier) markers.push("identifier field");
  const sessionlink = links.some((link) => /sign in|log in|log on|forgot|create account|sign up/i.test(link));
  if (sessionlink) markers.push("session link");
  return { login: Boolean(password && identifier && sessionlink), markers };
}

const signupmarkers = ["sign up", "create account", "register", "confirm password", "terms"];
const checkoutmarkers = ["checkout", "payment", "billing", "shipping", "card number", "place order", "cart"];

/** Detects signup and checkout templates by matching the field labels, autocompletes and page text against known markers. */
export function detecttemplate(
  fields: fieldshape[],
  text: string,
): { template: "signup" | "checkout" | "unknown"; markers: string[] } {
  const corpus = [
    text,
    ...fields.map(
      (field) => `${field.label} ${field.name} ${field.placeholder} ${field.arialabel} ${field.autocomplete}`,
    ),
  ]
    .join(" ")
    .toLowerCase();
  const signup = signupmarkers.filter((marker) => corpus.includes(marker));
  const checkout = checkoutmarkers.filter((marker) => corpus.includes(marker));
  if (signup.length >= 2 && signup.length >= checkout.length) return { template: "signup", markers: signup };
  if (checkout.length >= 2) return { template: "checkout", markers: checkout };
  return { template: "unknown", markers: [...signup, ...checkout] };
}

/** Associates validation messages with fields through aria describedby refs and the sibling text next to each field. */
export function associateerrors(
  contexts: errorcontext[],
  messages: Array<{ id?: string; text: string }>,
): fielderror[] {
  const errors: fielderror[] = [];
  for (const field of contexts) {
    const byref = field.describedby
      ? messages.find((message) => message.id === field.describedby && message.text.trim())
      : undefined;
    if (byref) {
      errors.push({ field: field.selector, message: byref.text.trim() });
      continue;
    }
    const sibling = field.siblings.map((text) => text.trim()).find((text) => text.length > 0);
    if (sibling) errors.push({ field: field.selector, message: sibling });
  }
  return errors;
}

/** Resolves one reviewed artifact name against the run store before a file input is filled. */
export function attachplan(
  name: string,
  artifacts: Array<{ id: string; name: string; kind: string }>,
): { artifact?: { id: string; name: string; kind: string }; reason?: string } {
  const artifact = artifacts.find((item) => item.name === name || item.id === name);
  if (!artifact) return { reason: "The reviewed artifact name is not part of the run store." };
  return { artifact };
}

/** Selectors the captcha detector probes; a hit hands control back to the user instead of forcing the page. */
export const captchamarkers = [
  'iframe[src*="recaptcha"]',
  'iframe[title*="recaptcha" i]',
  ".g-recaptcha",
  "[data-sitekey]",
  'iframe[title*="captcha" i]',
  ".h-captcha",
];

/** True when any captcha marker matched, so the plan pauses and hands control to the user. */
export function captchadetected(matched: string[]): boolean {
  return matched.length > 0;
}

function eventsforms(target: Element): void {
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.dispatchEvent(new Event("change", { bubbles: true }));
}

/** Fills one control through the native setter with input and change eventsforms; checks, radios and selects use their own grammar. */
export function fillcontrol(element: Element, entry: formentry): boolean {
  if (element instanceof HTMLInputElement && (entry.kind === "check" || element.type === "checkbox")) {
    element.checked = entry.value === "true" || entry.value === "on" || entry.value === "checked";
    eventsforms(element);
    return true;
  }
  if (element instanceof HTMLInputElement && (entry.kind === "radio" || element.type === "radio")) {
    element.checked = true;
    eventsforms(element);
    return true;
  }
  if (element instanceof HTMLSelectElement) {
    const option = [...element.options].find(
      (candidate) => candidate.value === entry.value || candidate.textContent?.trim() === entry.value,
    );
    if (!option) return false;
    element.value = option.value;
    eventsforms(element);
    return true;
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (element instanceof HTMLInputElement && element.type === "file") return false;
    element.focus();
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value")?.set;
    if (setter) setter.call(element, entry.value);
    else element.value = entry.value;
    eventsforms(element);
    return true;
  }
  return false;
}

function controlshape(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): fieldshape {
  return {
    selector: elementselector(element),
    tag: element.tagName.toLowerCase(),
    type: element instanceof HTMLSelectElement ? "select" : element.getAttribute("type") || "text",
    name: element.getAttribute("name") || "",
    label: elementlabel(element),
    placeholder: element.getAttribute("placeholder") || "",
    arialabel: element.getAttribute("aria-label") || "",
    autocomplete: element.getAttribute("autocomplete") || "",
    ...(element instanceof HTMLSelectElement ? { options: [...element.options].map((option) => option.value) } : {}),
  };
}

/** Collects the serializable field shapes of one form scope; absent scopes survey the whole document. */
function collectfields(
  root: Document,
  formscope?: string,
): Array<{ shape: fieldshape; element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }> {
  const scope = formscope ? root.querySelector(formscope) : root;
  if (!scope) return [];
  const controls = [
    ...scope.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"),
  ];
  return controls
    .filter((element) => element.type !== "hidden")
    .map((element) => ({ shape: controlshape(element), element }));
}

/** Surveys the visibility and geometry evidence the honeypot detector reads for one form scope. */
function surveyfields(
  root: Document,
  formscope?: string,
): Array<{ survey: fieldsurvey; element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }> {
  const viewport = { left: 0, top: 0, right: window.innerWidth || 0, bottom: window.innerHeight || 0 };
  return collectfields(root, formscope).map(({ shape, element }) => {
    const rect = element.getBoundingClientRect();
    const hidden =
      element.getAttribute("aria-hidden") === "true" ||
      (element.tabIndex < 0 && (element as HTMLElement).offsetParent === null) ||
      ((element as HTMLElement).offsetParent === null && rect.width === 0 && rect.height === 0);
    const offscreen =
      rect.width > 0 &&
      rect.height > 0 &&
      (rect.bottom < viewport.top ||
        rect.top > viewport.bottom ||
        rect.right < viewport.left ||
        rect.left > viewport.right);
    return { survey: { ...shape, hidden, offscreen }, element };
  });
}

/** Reads the error context of one form scope: describedby refs and the sibling texts after each field. */
function collecterrorcontext(
  root: Document,
  formscope?: string,
): Array<{ context: errorcontext; element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }> {
  return collectfields(root, formscope).map(({ shape, element }) => {
    const siblings: string[] = [];
    let neighbor = element.nextElementSibling;
    for (let index = 0; neighbor && index < 3; index += 1) {
      const text = clean(neighbor.textContent || "");
      if (text && text !== shape.label) siblings.push(text);
      neighbor = neighbor.nextElementSibling;
    }
    const describedby = element.getAttribute("aria-describedby");
    return { context: { ...shape, ...(describedby ? { describedby } : {}), siblings }, element };
  });
}

/** Runs one reviewed forms and data step inside the page: fills, surveys, detects and reads errors without leaving the form scope. */
export function runpageform(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const formscope = typeof options.form === "string" && options.form ? options.form : step.target;
  switch (step.kind) {
    case "fillform": {
      const record = parseformrecord(options.formrecord);
      if (!record) return { ok: false, summary: "A reviewed form record with entries is required in options." };
      const surveys = surveyfields(root, record.form);
      const honeypots = detecthoneypots(
        surveys.map((entry) => entry.survey),
        0,
      );
      const operations = filloperations(
        record,
        surveys.map((entry) => entry.survey),
        honeypots.map((trap) => trap.selector),
      );
      let filled = 0;
      const skipped: string[] = [];
      const failures: string[] = [];
      const values: Array<{ label: string; value: string }> = [];
      for (const operation of operations) {
        if (operation.skipped && operation.matched) {
          skipped.push(operation.matched.selector);
          continue;
        }
        if (!operation.matched) {
          failures.push(
            `${operation.reason}: ${operation.entry.match.label ?? operation.entry.match.name ?? operation.entry.match.placeholder ?? "field"}`,
          );
          continue;
        }
        const element = surveys.find((entry) => entry.survey.selector === operation.matched?.selector)?.element;
        if (!element || !fillcontrol(element, operation.entry)) {
          failures.push(`unfillable: ${operation.matched.selector}`);
          continue;
        }
        filled += 1;
        values.push({
          label: operation.matched.label || operation.matched.name,
          value: operation.entry.kind === "password" ? "" : operation.entry.value,
        });
      }
      const report: formreport = {
        form: record.form ?? "",
        fields: operations.map((operation) => ({
          selector: operation.matched?.selector ?? "",
          label: operation.matched?.label ?? operation.entry.match.label ?? "",
          kind: operation.entry.kind,
          matched: Boolean(operation.matched),
        })),
      };
      return {
        ok: failures.length === 0,
        summary:
          failures.length === 0
            ? `Filled ${filled} reviewed field${filled === 1 ? "" : "s"} from the structured record${skipped.length > 0 ? ` and skipped ${skipped.length} honeypot field${skipped.length === 1 ? "" : "s"}` : ""}.`
            : `Filled ${filled} of ${record.entries.length} reviewed fields; ${failures.length} refusals: ${failures.join("; ")}.`,
        details: { filled, skipped, failures, values, report },
      };
    }
    case "filllabel":
    case "fillplaceholder": {
      const mode = step.kind === "filllabel" ? "label" : "placeholder";
      const pairs = Array.isArray(options.fields)
        ? (options.fields as Array<Record<string, unknown>>).filter((item) => item && typeof item === "object")
        : [];
      const record = pairentries(
        pairs.map((pair) => ({
          label: typeof pair.label === "string" ? pair.label : "",
          placeholder: typeof pair.placeholder === "string" ? pair.placeholder : "",
          value: typeof pair.value === "string" ? pair.value : "",
        })),
        mode,
      );
      if (record.entries.length === 0)
        return { ok: false, summary: "A reviewed non-empty list of field pairs is required in options." };
      const surveys = surveyfields(root, formscope);
      const honeypots = detecthoneypots(
        surveys.map((entry) => entry.survey),
        0,
      );
      const operations = filloperations(
        record,
        surveys.map((entry) => entry.survey),
        honeypots.map((trap) => trap.selector),
      );
      let filled = 0;
      const failures: string[] = [];
      for (const operation of operations) {
        if (operation.skipped) continue;
        if (!operation.matched) {
          failures.push(
            `${operation.reason}: ${mode === "label" ? operation.entry.match.label : operation.entry.match.placeholder}`,
          );
          continue;
        }
        const element = surveys.find((entry) => entry.survey.selector === operation.matched?.selector)?.element;
        const refined: formentry = { ...operation.entry, kind: classifyfield(operation.matched) };
        if (!element || !fillcontrol(element, refined)) {
          failures.push(`unfillable: ${operation.matched.selector}`);
          continue;
        }
        filled += 1;
      }
      return {
        ok: failures.length === 0,
        summary:
          failures.length === 0
            ? `Filled ${filled} field${filled === 1 ? "" : "s"} matched by ${mode}.`
            : `Filled ${filled} of ${record.entries.length} fields matched by ${mode}; ${failures.join("; ")}.`,
        details: { filled, failures, mode },
      };
    }
    case "detectfields": {
      const collected = collectfields(root, formscope);
      const report: formreport = {
        form: formscope ?? "",
        fields: collected.map((entry) => ({
          selector: entry.shape.selector,
          label: entry.shape.label || entry.shape.name,
          kind: classifyfield(entry.shape),
          matched: Boolean(entry.shape.label || entry.shape.name),
        })),
      };
      return {
        ok: true,
        summary: `Detected ${collected.length} form field${collected.length === 1 ? "" : "s"} with their kinds.`,
        details: { report, count: collected.length },
      };
    }
    case "generatevalues": {
      const rule =
        options.valuegen && typeof options.valuegen === "object" && !Array.isArray(options.valuegen)
          ? (options.valuegen as Record<string, unknown>)
          : {};
      const locale = typeof rule.locale === "string" ? rule.locale : "en";
      const seed = typeof rule.seed === "number" && Number.isFinite(rule.seed) ? rule.seed : 1;
      const surveys = surveyfields(root, formscope);
      const honeypots = detecthoneypots(
        surveys.map((entry) => entry.survey),
        0,
      );
      const skippedselectors = new Set(honeypots.map((trap) => trap.selector));
      const candidates = surveys.filter((entry) => !skippedselectors.has(entry.survey.selector));
      const values = candidates.map((entry) => ({
        label: entry.survey.label || entry.survey.name || entry.survey.selector,
        kind: classifyfield(entry.survey),
        value: generatevalue(classifyfield(entry.survey), { locale, seed }),
      }));
      const single =
        values.length === 0 && typeof rule.kind === "string"
          ? [{ label: rule.kind, kind: rule.kind, value: generatevalue(rule.kind as fieldkind, { locale, seed }) }]
          : values;
      return {
        ok: true,
        summary: `Generated ${single.length} realistic value${single.length === 1 ? "" : "s"} for the detected field kinds.`,
        details: { values: single, locale, seed },
      };
    }
    case "readerrors": {
      const contexts = collecterrorcontext(root, formscope);
      const messages = [...root.querySelectorAll<HTMLElement>("[id]")]
        .map((element) => ({ id: element.id, text: clean(element.textContent || "") }))
        .filter((message) => message.text.length > 0);
      const errors = associateerrors(
        contexts.map((entry) => entry.context),
        messages,
      );
      return {
        ok: true,
        summary:
          errors.length === 0
            ? "No validation error was found next to the reviewed fields."
            : `Collected ${errors.length} inline validation message${errors.length === 1 ? "" : "s"}.`,
        details: { errors, form: formscope ?? "" },
      };
    }
    case "skiphoneypot": {
      const surveys = surveyfields(root, formscope);
      const traps = detecthoneypots(
        surveys.map((entry) => entry.survey),
        0,
      );
      return {
        ok: true,
        summary:
          traps.length === 0
            ? "No honeypot field was detected."
            : `Skipped ${traps.length} honeypot field${traps.length === 1 ? "" : "s"}: ${traps.map((trap) => `${trap.selector} (${trap.reason})`).join(", ")}.`,
        details: { skipped: traps },
      };
    }
    case "detectlogin": {
      const collected = collectfields(root, formscope);
      const links = [...(formscope ? root.querySelectorAll(formscope) : ([root] as unknown as Element[]))]
        .flatMap((scope) => [...scope.querySelectorAll("a[href], button")])
        .map((element) => clean(element.textContent || ""));
      const detection = detectlogin(
        collected.map((entry) => entry.shape),
        links,
      );
      return {
        ok: true,
        summary: detection.login
          ? `Login form detected with ${detection.markers.join(", ")}.`
          : "No login form was detected.",
        details: { login: detection.login, markers: detection.markers },
      };
    }
    case "detecttemplate": {
      const collected = collectfields(root, formscope);
      const text = clean(root.body?.innerText || "");
      const detection = detecttemplate(
        collected.map((entry) => entry.shape),
        text,
      );
      return {
        ok: true,
        summary:
          detection.template === "unknown"
            ? "No signup or checkout template was detected."
            : `${detection.template} template detected with markers ${detection.markers.join(", ")}.`,
        details: { template: detection.template, markers: detection.markers },
      };
    }
    case "handoffcaptcha": {
      const matched = captchamarkers.filter((marker) => root.querySelector(marker) !== null);
      return {
        ok: true,
        summary: captchadetected(matched)
          ? `Captcha presence detected (${matched.join(", ")}); control hands back to the user.`
          : "No captcha was detected.",
        details: { captcha: captchadetected(matched), markers: matched },
      };
    }
    case "asksubmit": {
      const collected = collectfields(root, step.value || undefined);
      const values = collected.map((entry) => ({
        label: entry.shape.label || entry.shape.name || entry.shape.selector,
        value:
          entry.element instanceof HTMLSelectElement ? entry.element.value : (entry.element as HTMLInputElement).value,
      }));
      return {
        ok: true,
        summary: `Read ${values.length} field value${values.length === 1 ? "" : "s"} for the submission review.`,
        details: { values },
      };
    }
    case "submitform": {
      const form =
        target instanceof HTMLFormElement ? target : target instanceof HTMLElement ? target.closest("form") : null;
      if (!form) return { ok: false, summary: "No owning form was found for the reviewed submission." };
      form.requestSubmit();
      return { ok: true, summary: "Form submitted programmatically through its owning form." };
    }
    case "consentpassword": {
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement))
        return { ok: false, summary: "The reviewed password target cannot receive text." };
      const entry: formentry = {
        match: { mode: "name", name: target.name || target.getAttribute("id") || "" },
        kind: "password",
        value: step.value ?? "",
      };
      if (!fillcontrol(target, entry))
        return { ok: false, summary: "The password field refused the native setter fill." };
      return {
        ok: true,
        summary: "Password field filled after the reviewed consent; the value never appears in the audit trail.",
      };
    }
    case "attachfile": {
      if (!(target instanceof HTMLInputElement) || target.type !== "file")
        return { ok: false, summary: "The reviewed target is not a file input." };
      const artifactname =
        typeof options.artifactname === "string" && options.artifactname ? options.artifactname : "artifact";
      try {
        const file = new File([new Blob(["devthink artifact"], { type: "application/octet-stream" })], artifactname);
        const transfer = new DataTransfer();
        transfer.items.add(file);
        target.files = transfer.files;
        eventsforms(target);
        return {
          ok: true,
          summary: `Artifact ${artifactname} attached to the reviewed file input.`,
          details: { artifact: options.artifact, artifactname },
        };
      } catch {
        return { ok: false, summary: "The reviewed file input refused the artifact attachment." };
      }
    }
    default:
      return { ok: false, summary: "Unsupported forms and data action." };
  }
}

/* ── Merged from pageinteract.ts: the 1.1.88 consolidation interns the correlated pageinteract logic here, so no variation of the same file lives beside another. ── */

/**
 * Resolution driven interactions for reviewed steps.
 * Every correlated rule for text, aria and name clicks, shadow piercing, frame routing, wrapper step extraction and the retry loop lives in this file.
 */

/** Reads the reviewed options of a step without throwing on malformed payloads. */
function optionsof(step: toolstep): Record<string, unknown> {
  try {
    return parseoptions(step);
  } catch {
    return {};
  }
}

/** Extracts the reviewed inner step of a retry or frame wrapper from its inline options. */
export function innerstep(step: toolstep): toolstep | null {
  const options = optionsof(step);
  const kind = options.kind;
  if (typeof kind !== "string" || !kind.trim()) return null;
  const inneroptions = options.options;
  return {
    id: `${step.id}inner`,
    kind: kind as toolstep["kind"],
    summary: step.summary,
    risk: step.risk,
    ...(typeof options.target === "string" ? { target: options.target } : {}),
    ...(typeof options.value === "string" ? { value: options.value } : {}),
    ...(inneroptions && typeof inneroptions === "object" && !Array.isArray(inneroptions)
      ? { options: JSON.stringify(inneroptions) }
      : {}),
  };
}

function pointdistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function settle(delay: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export interface retryoutcomeplan {
  ok: boolean;
  attempts: number;
  movement: number;
  summary: string;
}

/** Runs the reviewed retry loop: each failed attempt waits the settle window, revalidates the target geometry and reruns only when the element moved beyond the tolerance. */
export async function runretries(
  rule: retryrule,
  probe: () => Promise<{ x: number; y: number } | null>,
  execute: (attempt: number) => Promise<{ ok: boolean; summary: string }>,
): Promise<retryoutcomeplan> {
  const attempts = Math.max(1, Number.isFinite(rule.attempts) ? Math.floor(rule.attempts) : 1);
  const tolerance = typeof rule.tolerance === "number" && Number.isFinite(rule.tolerance) ? rule.tolerance : 0;
  const settles = typeof rule.settle === "number" && Number.isFinite(rule.settle) ? rule.settle : 0;
  let previous = await probe();
  let movement = 0;
  let made = 0;
  let last = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    made = attempt;
    const result = await execute(attempt);
    last = result.summary;
    if (result.ok)
      return {
        ok: true,
        attempts: made,
        movement,
        summary: `Retry interaction succeeded on attempt ${made} after ${movement.toFixed(1)} pixels of observed movement.`,
      };
    if (attempt >= attempts) break;
    if (settles > 0) await settle(settles);
    const current = await probe();
    if (!current) {
      previous = null;
      continue;
    }
    if (previous) {
      const delta = pointdistance(previous, current);
      movement = Math.max(movement, delta);
      if (delta <= tolerance)
        return {
          ok: false,
          attempts: made,
          movement,
          summary: `The target stayed within the reviewed tolerance of ${tolerance} pixels; retry stopped after attempt ${made}. ${last}`,
        };
    }
    previous = current;
  }
  return {
    ok: false,
    attempts: made,
    movement,
    summary: `Retry interaction failed after ${made} attempt${made === 1 ? "" : "s"} with ${movement.toFixed(1)} pixels of observed movement. ${last}`,
  };
}

/** Dispatches one reviewed click on a resolved element and reports the target mode used. */
function clickresolved(stepkind: string, resolution: ReturnType<typeof resolvestep>): stepresult {
  if (resolution.status === "ambiguous")
    return {
      ok: false,
      summary: `The reviewed ${resolution.mode} reference matched ${resolution.candidates.length} elements: ${resolution.candidates.join("; ")}.`,
      details: { mode: resolution.mode, candidates: resolution.candidates },
    };
  if (resolution.status !== "resolved") return { ok: false, summary: "The reviewed target is no longer available." };
  ensurevisible(resolution.element);
  dispatchclick(resolution.element);
  return {
    ok: true,
    summary: `Clicked ${resolution.target.label || resolution.target.tag} resolved by ${stepkind} ${resolution.target.mode} mode.`,
    details: { mode: resolution.target.mode, resolvedtarget: resolution.target },
  };
}

/** Runs one resolution driven interaction: text, aria and name clicks, shadow piercing and frame routing. */
export function runinteractstep(
  step: toolstep,
  expectedorigin: string,
  dispatch: (inner: toolstep, origin: string, root?: Document) => stepresult | Promise<stepresult>,
): stepresult | Promise<stepresult> {
  if (step.kind === "clicktext" || step.kind === "clickaria" || step.kind === "clickname") {
    return clickresolved(step.kind, resolvestep(step, document));
  }
  if (step.kind === "pierceshadow") {
    const options = optionsof(step);
    const shadow = Array.isArray(options.shadow)
      ? options.shadow.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
    const element = shadow.length > 0 ? queryshadowchain(document, shadow) : queryscoped(document, step.target ?? "");
    if (!(element instanceof HTMLElement))
      return { ok: false, summary: "The reviewed shadow target is not available." };
    ensurevisible(element);
    dispatchclick(element);
    const summary = targetsummary("selector", element);
    return {
      ok: true,
      summary: `Clicked ${summary.label || summary.tag} resolved through ${shadow.length > 0 ? "the reviewed shadow path" : "open shadow roots"}.`,
      details: { mode: "selector", resolvedtarget: summary },
    };
  }
  if (step.kind === "enterframe") {
    const options = optionsof(step);
    const path = Array.isArray(options.framepath)
      ? options.framepath.filter(
          (item): item is number => typeof item === "number" && Number.isInteger(item) && item >= 0,
        )
      : [];
    const walk = walkframepath(describeframes(document), path);
    if (!walk.ok) return { ok: false, summary: walk.reason };
    const framedocument = walk.document.live;
    if (!framedocument) return { ok: false, summary: "The reviewed frame document is not available." };
    const inner = innerstep(step);
    if (!inner) return { ok: false, summary: "The reviewed inner step is absent." };
    return dispatch(inner, expectedorigin, framedocument);
  }
  return { ok: false, summary: "Unsupported interaction action." };
}

/* ── Merged from pagenav.ts: the 1.1.88 consolidation interns the correlated pagenav logic here, so no variation of the same file lives beside another. ── */

/**
 * Page navigation logics for reviewed steps.
 * Every correlated rule for navigation targets, container resolution, waitnav profiles, url patterns, link following, spa routing, query rewriting, deep links and recent tabs lives in this file.
 */

/** One link shape matched by followlink and spanav, serializable for fixtures. */
export interface linkshape {
  text: string;
  href: string;
  selector: string;
}

/** One collected load signal sample with the signals that held true at its time. */
export interface signalsample {
  at: number;
  signals: string[];
}

/** Resolved container plan of one navigation target across tabs, windows and private profiles. */
export interface containerplan {
  kind: "current" | "tab" | "window" | "private";
  incognito: boolean;
  windowid?: number;
  position: "adjacent" | "end";
}

/** Reads the reviewed navtarget of a navigation step; null when the step reviews none. */
export function parsenavtarget(step: toolstep): navtarget | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const value = options.navtarget;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const target = value as Record<string, unknown>;
  if (typeof target.url !== "string" || !target.url) return null;
  const container =
    target.container === "current" || target.container === "window" || target.container === "private"
      ? target.container
      : "tab";
  return {
    url: target.url,
    container,
    ...(target.position === "end" ? { position: "end" } : { position: "adjacent" }),
    private: container === "private" || target.private === true,
  };
}

/** Resolves the container plan of one navigation target: the current task tab, a new tab, a new window or a private window profile separated from normal windows. */
export function resolvecontainer(
  target: navtarget,
  windows: Array<{ id: number; incognito: boolean; focused: boolean }>,
): containerplan {
  if (target.container === "current")
    return { kind: "current", incognito: false, position: target.position ?? "adjacent" };
  if (target.container === "private" || target.private)
    return { kind: "private", incognito: true, position: target.position ?? "adjacent" };
  if (target.container === "window") {
    const focused = windows.find((item) => item.focused);
    return {
      kind: "window",
      incognito: false,
      ...(focused ? { windowid: focused.id } : {}),
      position: target.position ?? "adjacent",
    };
  }
  const normal = windows.find((item) => !item.incognito && item.focused) ?? windows.find((item) => !item.incognito);
  return {
    kind: "tab",
    incognito: false,
    ...(normal ? { windowid: normal.id } : {}),
    position: target.position ?? "adjacent",
  };
}

/** Reads the reviewed waitprofile of a navprofile step; null when the step reviews none. */
export function parsewaitprofile(step: toolstep): waitprofile | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const value = options.waitprofile;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const profile = value as Record<string, unknown>;
  const signals = Array.isArray(profile.signals)
    ? profile.signals.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  if (signals.length === 0) return null;
  const overrides: waitoverride[] = [];
  if (Array.isArray(profile.overrides)) {
    for (const item of profile.overrides) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const override = item as Record<string, unknown>;
      if (typeof override.origin !== "string" || !override.origin) continue;
      const overridesignals = Array.isArray(override.signals)
        ? override.signals.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
        : undefined;
      overrides.push({
        origin: override.origin,
        ...(overridesignals && overridesignals.length > 0 ? { signals: overridesignals } : {}),
        ...(typeof override.idle === "number" && Number.isFinite(override.idle) && override.idle >= 0
          ? { idle: override.idle }
          : {}),
        ...(typeof override.timeout === "number" && Number.isFinite(override.timeout) && override.timeout >= 0
          ? { timeout: override.timeout }
          : {}),
      });
    }
  }
  return {
    signals,
    ...(typeof profile.idle === "number" && Number.isFinite(profile.idle) && profile.idle >= 0
      ? { idle: profile.idle }
      : {}),
    ...(typeof profile.timeout === "number" && Number.isFinite(profile.timeout) && profile.timeout >= 0
      ? { timeout: profile.timeout }
      : {}),
    ...(overrides.length > 0 ? { overrides } : {}),
  };
}

/** Resolves the effective signals and thresholds of one waitnav profile for an origin by folding the per origin overrides in. */
export function profilefororigin(
  profile: waitprofile,
  origin: string,
): { signals: string[]; idle: number; timeout: number } {
  let signals = [...profile.signals];
  let idle = profile.idle ?? 0;
  let timeout = profile.timeout ?? 0;
  for (const override of profile.overrides ?? []) {
    if (!override.origin || new URL(override.origin).origin !== origin) continue;
    if (override.signals && override.signals.length > 0) signals = [...override.signals];
    if (override.idle !== undefined) idle = override.idle;
    if (override.timeout !== undefined) timeout = override.timeout;
  }
  return { signals, idle, timeout };
}

/** Maps a document ready state onto the live navigation load phase. */
export function loadphase(readystate: string): "loading" | "interactive" | "complete" {
  if (readystate === "interactive") return "interactive";
  if (readystate === "complete") return "complete";
  return "loading";
}

/** Decides the waitnav outcome of a waitnav profile from collected load signal samples: every required signal must hold in the latest sample inside the timeout. */
export function evaluatesignals(
  required: string[],
  samples: signalsample[],
  timeout: number,
): { ok: boolean; satisfied: string[]; waited: number; samples: number } {
  const start = samples[0]?.at ?? 0;
  const last = samples[samples.length - 1];
  const waited = Math.max(0, (last?.at ?? 0) - start);
  const held = last?.signals ?? [];
  const satisfied = required.filter((signal) => held.includes(signal));
  if (required.length > 0 && satisfied.length === required.length)
    return { ok: true, satisfied, waited, samples: samples.length };
  if (timeout > 0 && waited >= timeout) return { ok: false, satisfied, waited, samples: samples.length };
  return { ok: false, satisfied, waited, samples: samples.length };
}

/** Reads the reviewed urlpattern of a waiturl, spanav or spawait step; null when the step reviews none. */
export function parseurlpattern(step: toolstep, key: string = "urlpattern"): urlpattern | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const value = options[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const pattern = value as Record<string, unknown>;
  if (typeof pattern.url !== "string" || !pattern.url) return null;
  const mode =
    pattern.mode === "exact" || pattern.mode === "host" || pattern.mode === "pattern" ? pattern.mode : "prefix";
  const query: Record<string, string> = {};
  if (pattern.query && typeof pattern.query === "object" && !Array.isArray(pattern.query)) {
    for (const [name, item] of Object.entries(pattern.query as Record<string, unknown>))
      if (typeof item === "string") query[name] = item;
  }
  return {
    mode,
    url: pattern.url,
    ...(Object.keys(query).length > 0 ? { query } : {}),
    ...(typeof pattern.fragment === "string" && pattern.fragment ? { fragment: pattern.fragment } : {}),
  };
}

/** Matches a wildcard path segment against one url path segment. */
function segmentmatches(pattern: string, actual: string): boolean {
  if (pattern === "*" || pattern === "**") return true;
  if (!pattern.includes("*")) return pattern === actual;
  const parts = pattern.split("*");
  let index = 0;
  for (let position = 0; position < parts.length; position += 1) {
    const part = parts[position] as string;
    if (part === "") continue;
    const found = actual.indexOf(part, index);
    if (found < 0) return false;
    if (position === 0 && found !== 0) return false;
    index = found + part.length;
  }
  const last = parts[parts.length - 1] as string;
  return last === "" || actual.endsWith(last);
}

/** Matches one url against a reviewed urlpattern by mode plus required query and fragment parts. */
export function urlmatches(url: string, pattern: urlpattern): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  let expected: URL;
  try {
    expected = new URL(pattern.url);
  } catch {
    return false;
  }
  if (pattern.mode === "exact" && parsed.toString() !== expected.toString()) return false;
  if (pattern.mode === "prefix" && !parsed.toString().startsWith(pattern.url)) return false;
  if (pattern.mode === "host" && parsed.origin !== expected.origin) return false;
  if (pattern.mode === "pattern") {
    if (parsed.origin !== expected.origin) return false;
    const expectedsegments = expected.pathname.split("/").filter((segment) => segment !== "");
    const actualsegments = parsed.pathname.split("/").filter((segment) => segment !== "");
    if (expectedsegments.includes("**")) {
      const cut = expectedsegments.indexOf("**");
      const head = expectedsegments.slice(0, cut);
      const tail = expectedsegments.slice(cut + 1);
      if (actualsegments.length < head.length + tail.length) return false;
      if (!head.every((segment, position) => segmentmatches(segment, actualsegments[position] ?? ""))) return false;
      if (
        !tail.every((segment, position) =>
          segmentmatches(segment, actualsegments[actualsegments.length - tail.length + position] ?? ""),
        )
      )
        return false;
    } else if (
      expectedsegments.length !== actualsegments.length ||
      !expectedsegments.every((segment, position) => segmentmatches(segment, actualsegments[position] ?? ""))
    )
      return false;
  }
  const values = parsed.searchParams;
  for (const [name, value] of Object.entries(pattern.query ?? {})) {
    if (!values.has(name)) return false;
    if (value !== "*" && values.get(name) !== value) return false;
  }
  if (pattern.fragment !== undefined && parsed.hash.slice(1) !== pattern.fragment) return false;
  return true;
}

/** Reads the current query parameters of a url. */
function readquery(url: string): Record<string, string> {
  const values: Record<string, string> = {};
  try {
    for (const [name, value] of new URL(url).searchParams.entries()) values[name] = value;
  } catch {
    /* an unparseable url has no readable parameters */
  }
  return values;
}

/** Result of one query rewrite with the parameters read, written and the new url. */
export interface queryrewriteoutcome {
  url: string;
  before: Record<string, string>;
  after: Record<string, string>;
  set: string[];
  removed: string[];
}

/** Rewrites the query parameters of one url: reviewed values are set, reviewed names removed and the rest preserved. */
export function rewritequeryurl(url: string, set: Record<string, string>, remove: string[]): queryrewriteoutcome {
  const parsed = new URL(url);
  const before = readquery(url);
  for (const name of remove) parsed.searchParams.delete(name);
  for (const [name, value] of Object.entries(set)) parsed.searchParams.set(name, value);
  parsed.hash = "";
  return {
    url: parsed.toString(),
    before,
    after: readquery(parsed.toString()),
    set: Object.keys(set),
    removed: [...remove],
  };
}

/** Applies one reviewed fragment to a url, keeping every other part untouched. */
export function fragmenturl(url: string, fragment: string): string {
  const parsed = new URL(url);
  parsed.hash = fragment.replace(/^#/, "");
  return parsed.toString();
}

/** Matches links by their visible text, case insensitively, refusing ambiguity through multiple matches. */
export function matchlinktext(links: linkshape[], text: string): linkshape[] {
  const wanted = text.trim().toLowerCase();
  return links.filter((link) => link.text.trim().toLowerCase() === wanted);
}

/** Matches links by their href fragment when the reviewed option asks for fragment resolution. */
export function matchlinkfragment(links: linkshape[], fragment: string): linkshape[] {
  const wanted = fragment.trim().replace(/^#/, "");
  return links.filter((link) => {
    try {
      return new URL(link.href, "https://example.invalid").hash.replace(/^#/, "") === wanted;
    } catch {
      return false;
    }
  });
}

/** Builds a deep link into a common web app from a reviewed app pattern and its string params; unknown apps are refused. */
export function deeplinkurl(app: string, params: Record<string, string>): string | null {
  const value = (name: string): string | undefined => {
    const item = params[name];
    return typeof item === "string" && item.trim() ? item.trim() : undefined;
  };
  switch (app.trim().toLowerCase()) {
    case "github": {
      const owner = value("owner");
      const repo = value("repo");
      if (!owner || !repo) return null;
      const path = value("path");
      return `https://github.com/${owner}/${repo}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;
    }
    case "youtube": {
      const id = value("id");
      if (id) return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
      const search = value("search");
      if (search) return `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
      return null;
    }
    case "maps": {
      const query = value("query");
      if (!query) return null;
      return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }
    case "wikipedia": {
      const title = value("title");
      if (!title) return null;
      const language = value("language") ?? "en";
      return `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;
    }
    case "amazon": {
      const search = value("search");
      if (!search) return null;
      return `https://www.amazon.com/s?k=${encodeURIComponent(search)}`;
    }
    case "x": {
      const user = value("user");
      if (!user) return null;
      return `https://x.com/${user.replace(/^@/, "")}`;
    }
    default:
      return null;
  }
}

/** True when the current url of a single page app changed without a reload, keeping the origin. */
export function spauroutechanged(previousurl: string, currenturl: string): boolean {
  if (previousurl === currenturl) return false;
  try {
    return new URL(previousurl).origin === new URL(currenturl).origin;
  } catch {
    return false;
  }
}

/** Picks the most recently closed tab whose url is no longer open; null when every recent tab is already restored. */
export function pickrecenttab(
  recenttabs: Array<{ url: string; tabid: number; closedat: number }>,
  openurls: string[],
): { url: string; tabid: number; closedat: number } | null {
  return recenttabs.find((tab) => !openurls.includes(tab.url)) ?? null;
}

function waitnav(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function stepoptionsnav(step: toolstep): Record<string, unknown> {
  try {
    return parseoptions(step);
  } catch {
    return {};
  }
}

function collectlinks(root: Document): linkshape[] {
  return [...root.querySelectorAll("a[href]")].map((element) => ({
    text: element.textContent?.trim() ?? "",
    href: element instanceof HTMLAnchorElement ? element.href : (element.getAttribute("href") ?? ""),
    selector: element.getAttribute("href") ?? "",
  }));
}

/** Resolves the reviewed link of a followlink or spanav step by visible text or href fragment, refusing links outside the allowed origins. */
function resolvelink(
  step: toolstep,
  root: Document,
): { ok: true; element: HTMLAnchorElement } | { ok: false; summary: string } {
  const options = stepoptionsnav(step);
  const allowedorigins = Array.isArray(options.allowedorigins)
    ? options.allowedorigins.filter((item): item is string => typeof item === "string")
    : [];
  const links = collectlinks(root);
  const matches =
    options.fragment === true ? matchlinkfragment(links, step.value ?? "") : matchlinktext(links, step.value ?? "");
  if (matches.length === 0)
    return { ok: false, summary: `No link matches the reviewed reference "${step.value ?? ""}".` };
  if (matches.length > 1)
    return { ok: false, summary: `The reviewed link reference matched ${matches.length} links; review a unique one.` };
  const element = [...root.querySelectorAll("a[href]")].find(
    (candidate) =>
      (candidate instanceof HTMLAnchorElement ? candidate.href : (candidate.getAttribute("href") ?? "")) ===
      matches[0]?.href,
  );
  if (!(element instanceof HTMLAnchorElement))
    return { ok: false, summary: "The reviewed link is no longer available." };
  if (allowedorigins.length > 0) {
    let origin = "";
    try {
      origin = new URL(element.href).origin;
    } catch {
      origin = "";
    }
    if (!allowedorigins.includes(origin))
      return { ok: false, summary: `The reviewed link leaves the session origin grants for ${origin}.` };
  }
  return { ok: true, element };
}

/** Waits for the page load event and reports the ready state and load phase. */
async function runwaitload(step: toolstep): Promise<stepresult> {
  const options = stepoptionsnav(step);
  const timeout =
    typeof options.timeout === "number" && Number.isFinite(options.timeout) && options.timeout > 0
      ? options.timeout
      : 0;
  const started = Date.now();
  for (;;) {
    const phase = loadphase(document.readyState);
    if (phase === "complete")
      return {
        ok: true,
        summary: `The page load event fired and the document is complete after ${Date.now() - started} milliseconds.`,
        details: { phase, readystate: document.readyState, waited: Date.now() - started },
      };
    if (timeout > 0 && Date.now() - started >= timeout)
      return {
        ok: false,
        summary: `The page did not reach the complete load phase within the reviewed timeout of ${timeout} milliseconds.`,
        details: { phase, readystate: document.readyState, waited: Date.now() - started },
      };
    await waitnav(50);
  }
}

/** Waits until the current url matches the reviewed urlpattern. */
async function runwaiturl(step: toolstep): Promise<stepresult> {
  const options = stepoptionsnav(step);
  const pattern = parseurlpattern(step);
  if (!pattern) return { ok: false, summary: "A reviewed urlpattern is required." };
  const timeout =
    typeof options.timeout === "number" && Number.isFinite(options.timeout) && options.timeout > 0
      ? options.timeout
      : 0;
  const poll =
    typeof options.poll === "number" && Number.isFinite(options.poll) && options.poll > 0 ? options.poll : 100;
  const started = Date.now();
  for (;;) {
    if (urlmatches(location.href, pattern))
      return {
        ok: true,
        summary: `The url matched the reviewed ${pattern.mode} pattern after ${Date.now() - started} milliseconds.`,
        details: { url: location.href, finalurl: location.href, mode: pattern.mode, waited: Date.now() - started },
      };
    if (timeout > 0 && Date.now() - started >= timeout)
      return {
        ok: false,
        summary: `The url did not match the reviewed ${pattern.mode} pattern within the reviewed timeout of ${timeout} milliseconds.`,
        details: { url: location.href, mode: pattern.mode, waited: Date.now() - started },
      };
    await waitnav(poll);
  }
}

/** Follows one reviewed link, reporting the href travelled to. */
async function runfollowlink(step: toolstep, root: Document): Promise<stepresult> {
  const resolution = resolvelink(step, root);
  if (!resolution.ok) return { ok: false, summary: resolution.summary };
  const href = resolution.element.href;
  resolution.element.click();
  return { ok: true, summary: `Followed the reviewed link to ${href}.`, details: { href } };
}

/** Navigates a single page app by clicking the reviewed control and waiting for the route change without a reload. */
async function runspanav(step: toolstep, root: Document): Promise<stepresult> {
  const options = stepoptionsnav(step);
  const resolution = resolvelink(step, root);
  if (!resolution.ok) return { ok: false, summary: resolution.summary };
  const timeout =
    typeof options.timeout === "number" && Number.isFinite(options.timeout) && options.timeout > 0
      ? options.timeout
      : 0;
  const pattern = parseurlpattern(step, "routepattern");
  const before = location.href;
  resolution.element.click();
  const started = Date.now();
  for (;;) {
    const changed = spauroutechanged(before, location.href);
    const matched = pattern ? urlmatches(location.href, pattern) : changed;
    if (matched)
      return {
        ok: true,
        summary: `The single page app route changed to ${location.href} without a reload.`,
        details: { from: before, to: location.href, waited: Date.now() - started },
      };
    if (timeout > 0 && Date.now() - started >= timeout)
      return {
        ok: false,
        summary: `The single page app route did not change within the reviewed timeout of ${timeout} milliseconds.`,
        details: { from: before, to: location.href, waited: Date.now() - started },
      };
    await waitnav(50);
  }
}

/** Waits for a url change inside a single page app without a reload, through popstate, hashchange and history polling. */
async function runspawait(step: toolstep): Promise<stepresult> {
  const options = stepoptionsnav(step);
  const timeout =
    typeof options.timeout === "number" && Number.isFinite(options.timeout) && options.timeout > 0
      ? options.timeout
      : 0;
  const poll =
    typeof options.poll === "number" && Number.isFinite(options.poll) && options.poll > 0 ? options.poll : 100;
  const pattern = parseurlpattern(step);
  const before = location.href;
  const started = Date.now();
  let detected = false;
  const onroute = (): void => {
    if (spauroutechanged(before, location.href)) detected = true;
  };
  window.addEventListener("popstate", onroute);
  window.addEventListener("hashchange", onroute);
  try {
    for (;;) {
      if (pattern ? urlmatches(location.href, pattern) : detected || spauroutechanged(before, location.href)) {
        return {
          ok: true,
          summary: `The single page app url changed to ${location.href} without a reload.`,
          details: { from: before, to: location.href, waited: Date.now() - started },
        };
      }
      if (timeout > 0 && Date.now() - started >= timeout)
        return {
          ok: false,
          summary: `The single page app url did not change within the reviewed timeout of ${timeout} milliseconds.`,
          details: { from: before, to: location.href, waited: Date.now() - started },
        };
      await waitnav(poll);
    }
  } finally {
    window.removeEventListener("popstate", onroute);
    window.removeEventListener("hashchange", onroute);
  }
}

/** Reads and rewrites the query parameters of the current url with pushstate, reporting the parameters read and the new url. */
function runrewritequery(step: toolstep): stepresult {
  const options = stepoptionsnav(step);
  const set: Record<string, string> = {};
  if (options.set && typeof options.set === "object" && !Array.isArray(options.set)) {
    for (const [name, value] of Object.entries(options.set as Record<string, unknown>))
      if (typeof value === "string") set[name] = value;
  }
  const remove = Array.isArray(options.remove)
    ? options.remove.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const outcome = rewritequeryurl(location.href, set, remove);
  history.pushState(history.state, document.title, outcome.url);
  return {
    ok: true,
    summary: `Rewrote ${outcome.set.length + outcome.removed.length} query parameter${outcome.set.length + outcome.removed.length === 1 ? "" : "s"}; the url is now ${outcome.url}.`,
    details: {
      url: outcome.url,
      before: outcome.before,
      after: outcome.after,
      set: outcome.set,
      removed: outcome.removed,
    },
  };
}

/** Sets the reviewed url fragment and scrolls to its anchor with smooth behavior. */
async function runsetfragment(step: toolstep): Promise<stepresult> {
  const fragment = (step.value ?? "").replace(/^#/, "");
  if (!fragment) return { ok: false, summary: "A reviewed fragment is required." };
  const url = fragmenturl(location.href, fragment);
  history.pushState(history.state, document.title, url);
  const anchor = document.getElementById(fragment);
  anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
  return {
    ok: true,
    summary: `Set the url fragment to ${fragment} and scrolled to its anchor.`,
    details: { url, fragment, anchored: Boolean(anchor) },
  };
}

/** Stops a pending navigation by halting the document load. */
function runstopnav(): stepresult {
  window.stop();
  return { ok: true, summary: "Stopped the pending navigation of the page." };
}

/** Prefetches the reviewed urls by injecting prefetch hints into the document head. */
function runprefetch(step: toolstep): stepresult {
  const options = stepoptionsnav(step);
  const urls = Array.isArray(options.urls)
    ? options.urls.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  if (urls.length === 0) return { ok: false, summary: "A reviewed list of prefetch urls is required." };
  for (const url of urls) {
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.href = url;
    document.head.append(hint);
  }
  return {
    ok: true,
    summary: `Queued ${urls.length} prefetch hint${urls.length === 1 ? "" : "s"}.`,
    details: { urls },
  };
}

/** Preconnects to the reviewed origins by injecting preconnect hints into the document head. */
function runpreconnect(step: toolstep): stepresult {
  const options = stepoptionsnav(step);
  const origins = Array.isArray(options.origins)
    ? options.origins.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  if (origins.length === 0) return { ok: false, summary: "A reviewed list of preconnect origins is required." };
  for (const origin of origins) {
    const hint = document.createElement("link");
    hint.rel = "preconnect";
    hint.href = origin;
    document.head.append(hint);
  }
  return {
    ok: true,
    summary: `Opened ${origins.length} preconnect hint${origins.length === 1 ? "" : "s"}.`,
    details: { origins },
  };
}

/** Prints the page through the browser print pipeline; the artifact routing happens in the background. */
function runprintpdf(): stepresult {
  window.print();
  return { ok: true, summary: "Sent the page to the browser print pipeline." };
}

/** Runs one reviewed page navigation kind inside the page world. */
export function runpagenav(step: toolstep, root: Document = document): stepresult | Promise<stepresult> {
  switch (step.kind) {
    case "waitload":
      return runwaitload(step);
    case "waiturl":
      return runwaiturl(step);
    case "followlink":
      return runfollowlink(step, root);
    case "spanav":
      return runspanav(step, root);
    case "spawait":
      return runspawait(step);
    case "rewritequery":
      return runrewritequery(step);
    case "setfragment":
      return runsetfragment(step);
    case "stopnav":
      return runstopnav();
    case "prefetch":
      return runprefetch(step);
    case "preconnect":
      return runpreconnect(step);
    case "printpdf":
      return runprintpdf();
    default:
      return { ok: false, summary: "Unsupported navigation action." };
  }
}

/* ── Merged from pagenet.ts: the 1.1.88 consolidation interns the correlated pagenet logic here, so no variation of the same file lives beside another. ── */

/**
 * Navigation network state logics for reviewed steps.
 * Every correlated rule for redirect chain assembly, http error and interstitial classification, per domain rate limit windows, url safety verdicts, curated batch lists, prefetch verification, preconnect origins and basic auth credential gating lives in this file.
 */

/** One navigation watch event as observed from browser navigation listeners, serializable for fixtures. */
export interface navwatchevent {
  event: "beforenavigate" | "committed" | "completed" | "error" | "urlchange";
  url: string;
  timestamp: number;
  status?: number;
  redirect?: boolean;
  error?: string;
}

/** Assembles one redirect chain from navigation watch events: successive url changes become hops with statuses and timing, and the chain closes on completion or error. */
export function buildredirectchain(events: navwatchevent[]): redirectchain {
  const hops: redirecthop[] = [];
  let startedat = 0;
  let endedat = 0;
  let open = false;
  for (const event of events) {
    if (event.event === "beforenavigate") {
      hops.length = 0;
      startedat = event.timestamp;
      endedat = event.timestamp;
      open = true;
      hops.push({ url: event.url, status: event.status ?? 0, at: event.timestamp });
      continue;
    }
    if (!open) continue;
    endedat = event.timestamp;
    if (
      event.event === "urlchange" ||
      event.redirect ||
      (event.event === "committed" && hops[hops.length - 1]?.url !== event.url)
    ) {
      if (hops[hops.length - 1]?.url === event.url && typeof event.status === "number")
        hops[hops.length - 1] = { url: event.url, status: event.status, at: event.timestamp };
      else hops.push({ url: event.url, status: event.status ?? 0, at: event.timestamp });
      continue;
    }
    if (event.event === "committed" && typeof event.status === "number" && hops[hops.length - 1]) {
      hops[hops.length - 1] = { url: event.url, status: event.status, at: event.timestamp };
      continue;
    }
    if (event.event === "completed" || event.event === "error") {
      if (event.event === "completed" && hops[hops.length - 1] && hops[hops.length - 1]?.url !== event.url)
        hops.push({ url: event.url, status: event.status ?? 200, at: event.timestamp });
      if (event.event === "completed" && typeof event.status === "number" && hops[hops.length - 1])
        hops[hops.length - 1] = { url: event.url, status: event.status, at: event.timestamp };
      open = false;
    }
  }
  return { hops, startedat, endedat: endedat || startedat };
}

/** Returns the final url of a redirect chain: the url of its last hop. */
export function finalurl(chain: redirectchain): string {
  return chain.hops[chain.hops.length - 1]?.url ?? "";
}

/** Counts the redirect hops of a chain, ignoring the first and the final urls when no intermediary hop exists. */
export function redirectcount(chain: redirectchain): number {
  return Math.max(0, chain.hops.length - 1);
}

/** Classifies a navigation url change: a full load, a spa route change without reload, a reload or no change. */
export function classifynavchange(
  previousurl: string,
  currenturl: string,
  status: string | undefined,
): "load" | "route" | "reload" | "none" {
  if (previousurl === currenturl) return status === "loading" ? "reload" : "none";
  try {
    if (new URL(previousurl).origin !== new URL(currenturl).origin) return "load";
  } catch {
    return "load";
  }
  return status === "loading" ? "load" : "route";
}

/** One classified http state of a navigation: http error, offline and certificate interstitial flags with reasons. */
export interface httpstate {
  httperror: boolean;
  offline: boolean;
  certificate: boolean;
  reasons: string[];
}

/** Detects the http error, offline and certificate interstitial states from the offline flag, error strings and observed statuses. */
export function detecthttpstate(input: { offline: boolean; errors?: string[]; statuses?: number[] }): httpstate {
  const reasons: string[] = [];
  let httperror = false;
  let certificate = false;
  const errors = input.errors ?? [];
  const statuses = input.statuses ?? [];
  for (const error of errors) {
    if (/CERT|SSL|TLS|privacy bad|your connection is not private/i.test(error)) {
      certificate = true;
      httperror = true;
      reasons.push(`certificate interstitial: ${error}`);
      continue;
    }
    if (
      /ERR_NAME_NOT_RESOLVED|ERR_CONNECTION|ERR_TIMED_OUT|ERR_INTERNET_DISCONNECTED|ERR_ADDRESS_UNREACHABLE|ERR_NETWORK/i.test(
        error,
      )
    ) {
      httperror = true;
      reasons.push(`network error: ${error}`);
      continue;
    }
    httperror = true;
    reasons.push(`navigation error: ${error}`);
  }
  for (const status of statuses) {
    if (status >= 400 && status < 600) {
      httperror = true;
      reasons.push(`http status ${status}`);
    }
  }
  if (input.offline) reasons.push("browser reports offline");
  return { httperror, offline: input.offline, certificate, reasons };
}

/** Applies the certificate interstitial policy: interstitials are reported for review, never bypassed. */
export function interstitialpolicy(state: httpstate): { interstitial: boolean; bypass: boolean; guidance: string } {
  if (state.certificate)
    return {
      interstitial: true,
      bypass: false,
      guidance: "A certificate interstitial was detected; Devthink reports it for review and never bypasses it.",
    };
  if (state.httperror)
    return {
      interstitial: true,
      bypass: false,
      guidance: "An http error state was detected and is reported for review.",
    };
  return { interstitial: false, bypass: false, guidance: "No interstitial was detected." };
}

/** Reads the reviewed ratelimit of a navrate step; null when the step reviews none. */
export function parseratelimit(step: toolstep): ratelimit | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const value = options.ratelimit;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const limit = value as Record<string, unknown>;
  const window =
    typeof limit.window === "number" && Number.isFinite(limit.window) && limit.window > 0 ? limit.window : 0;
  const ceiling =
    typeof limit.ceiling === "number" && Number.isInteger(limit.ceiling) && limit.ceiling >= 1 ? limit.ceiling : 0;
  if (window <= 0 || ceiling < 1) return null;
  const domain = typeof limit.domain === "string" && limit.domain.trim() ? limit.domain.trim() : "";
  return { domain, window, ceiling };
}

/** Reads the domain of a url for rate limit accounting. */
export function domainof(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/** Returns the live rate limit window state of one domain, opening a fresh window when the reviewed window has elapsed. */
export function ratewindow(state: ratelimitstate | undefined, limit: ratelimit, now: number): ratelimitstate {
  if (
    state &&
    state.domain === limit.domain &&
    state.limit.window === limit.window &&
    state.limit.ceiling === limit.ceiling &&
    now < state.openedat + limit.window
  )
    return state;
  return { domain: limit.domain, limit, openedat: now, count: 0 };
}

/** Decides whether one more navigation fits inside the reviewed per domain rate limit window. */
export function rateallows(
  state: ratelimitstate,
  now: number,
): { allowed: boolean; remaining: number; retryafter: number } {
  const elapsed = now - state.openedat;
  const remaining = Math.max(0, state.limit.ceiling - state.count);
  const retryafter = Math.max(0, state.limit.window - elapsed);
  return { allowed: remaining > 0, remaining, retryafter };
}

/** Records one navigation hit inside the live rate limit window of a domain. */
export function recordratehit(state: ratelimitstate, now: number): ratelimitstate {
  return { ...state, count: state.count + 1, ...(state.count + 1 === 1 ? { openedat: now } : {}) };
}

/** Verifies one url for safety: HTTPS only, no embedded credentials and no private network or raw ip targets. */
export function checksafe(url: string): safetyverdict {
  const reasons: string[] = [];
  let safe = true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { url, safe: false, reasons: ["the url does not parse"], at: 0 };
  }
  if (parsed.protocol !== "https:") {
    safe = false;
    reasons.push("the url must use HTTPS");
  }
  if (parsed.username || parsed.password) {
    safe = false;
    reasons.push("the url carries embedded credentials");
  }
  const host = parsed.hostname.toLowerCase();
  const privatelist = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"];
  if (
    privatelist.includes(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    safe = false;
    reasons.push(`the host ${host} is a private network target`);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^\[?[0-9a-f:]+\]?$/i.test(host)) {
    safe = false;
    reasons.push(`the host ${host} is a raw address without a domain`);
  }
  return { url, safe, reasons, at: 0 };
}

/** Builds the curated link list of a batchopen step from per url safety verdicts. */
export function curatelinks(urls: string[], verifier: (url: string) => safetyverdict): curatedlink[] {
  return urls.map((url) => {
    const verdict = verifier(url);
    return { url, verdict: verdict.safe ? "safe" : "unsafe", reasons: verdict.reasons };
  });
}

/** Splits a curated link list into the urls batch opening may open and the unsafe ones it refuses. */
export function batchopenset(links: curatedlink[]): {
  open: string[];
  refused: Array<{ url: string; reasons: string[] }>;
} {
  const open: string[] = [];
  const refused: Array<{ url: string; reasons: string[] }> = [];
  for (const link of links) {
    if (link.verdict === "safe") open.push(link.url);
    else refused.push({ url: link.url, reasons: link.reasons });
  }
  return { open, refused };
}

/** Verifies prefetch candidates against the session grants: only granted urls may be prefetched. */
export function prefetchcandidates(urls: string[], grants: string[]): { allowed: string[]; refused: string[] } {
  const allowed: string[] = [];
  const refused: string[] = [];
  for (const url of urls) {
    let origin = "";
    try {
      origin = new URL(url).origin;
    } catch {
      refused.push(url);
      continue;
    }
    if (grants.includes(origin)) allowed.push(url);
    else refused.push(url);
  }
  return { allowed, refused };
}

/** Deduplicates the preconnect origins of one preconnect step. */
export function preconnectorigins(origins: string[]): string[] {
  return [...new Set(origins.map((origin) => origin.trim()).filter(Boolean))];
}

/** Finds the reviewed basic auth credentials of one origin; the auth flow refuses to run without them. */
export function authfor(auths: authrecord[], url: string): authrecord | undefined {
  let origin = "";
  try {
    origin = new URL(url).origin;
  } catch {
    return undefined;
  }
  return auths.find((record) => record.origin === origin);
}

/* ── Merged from pageobserve.ts: the 1.1.88 consolidation interns the correlated pageobserve logic here, so no variation of the same file lives beside another. ── */

/**
 * Semantic page observation for reviewed steps.
 * Every correlated rule for the shadow and frame piercing walker, the accessibility tree, visible text, the reader heuristic, the heading outline, the selection read, open graph extraction, language detection and the shadow and frame inventories lives in this file.
 */

/** Serializable page node used by the observation engine; the live glue attaches the element. */
export interface pagenode {
  tag: string;
  selector: string;
  id: string;
  classes: string[];
  role: string;
  name: string;
  text: string;
  value: string;
  states: string[];
  hidden: boolean;
  children: pagenode[];
  element?: Element;
}

/** Deepest same origin frame nesting the walker pierces; deeper frames stay opaque so recursive self embedding cannot loop. */
const maxframedepth = 4;

function elementstates(element: Element): string[] {
  const states: string[] = [];
  if (element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") states.push("disabled");
  if (
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio") &&
    element.checked
  )
    states.push("checked");
  const expanded = element.getAttribute("aria-expanded");
  if (expanded !== null) states.push(`expanded ${expanded}`);
  if (element.getAttribute("aria-selected") === "true") states.push("selected");
  if (element.hasAttribute("required") || element.getAttribute("aria-required") === "true") states.push("required");
  if (element.hasAttribute("readonly") || element.getAttribute("aria-readonly") === "true") states.push("readonly");
  if (element.getAttribute("aria-hidden") === "true") states.push("hidden");
  return states;
}

function elementvalue(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  )
    return element.value;
  return "";
}

function elementhidden(element: Element): boolean {
  if (element instanceof HTMLInputElement && element.type === "hidden") return true;
  if (element.hasAttribute("hidden") || element.getAttribute("aria-hidden") === "true") return true;
  try {
    const style = element.ownerDocument?.defaultView?.getComputedStyle(element);
    if (style && (style.display === "none" || style.visibility === "hidden")) return true;
  } catch {
    /* detached documents refuse computed styles; the node stays visible */
  }
  return false;
}

function framenode(frame: HTMLIFrameElement, depth: number): pagenode {
  let content: Document | null = null;
  try {
    content = frame.contentDocument;
  } catch {
    content = null;
  }
  let sameorigin = false;
  try {
    sameorigin = content !== null && frame.contentWindow?.location.origin === location.origin;
  } catch {
    sameorigin = false;
  }
  const node = wrap(frame, depth);
  if (sameorigin && content && depth < maxframedepth) node.children.push(...wrapchildren(content, depth + 1));
  return node;
}

function wrap(element: Element, depth: number): pagenode {
  const shadow = element.shadowRoot;
  const node: pagenode = {
    tag: element.tagName.toLowerCase(),
    selector: elementselector(element),
    id: element.id,
    classes: [...element.classList],
    role: element.getAttribute("role")?.toLowerCase() || implicitrole(element),
    name: elementlabel(element),
    text: owntext(element),
    value: elementvalue(element),
    states: elementstates(element),
    hidden: elementhidden(element),
    children: [],
    element,
  };
  if (shadow) node.children.push(...wrapchildren(shadow, depth));
  if (element instanceof HTMLIFrameElement) return framenode(element, depth);
  node.children.push(...wrapchildren(element, depth));
  return node;
}

function wrapchildren(scope: ParentNode, depth: number): pagenode[] {
  return [...scope.querySelectorAll(":scope > *")].map((child) => wrap(child, depth));
}

/** Builds the serializable page node tree, piercing open shadow roots and same origin iframes. */
export function buildpagetree(scope: ParentNode): pagenode {
  const root: pagenode = {
    tag: "#document",
    selector: "",
    id: "",
    classes: [],
    role: "document",
    name: "",
    text: "",
    value: "",
    states: [],
    hidden: false,
    children: [],
  };
  if (scope instanceof Document) {
    root.children = scope.documentElement ? [wrap(scope.documentElement, 0)] : [];
  } else {
    root.children = [...wrapchildren(scope, 0)];
  }
  return root;
}

function countnodes(node: a11ynode): number {
  return 1 + node.children.reduce((total, child) => total + countnodes(child), 0);
}

/** Converts one page node tree into the accessibility tree with roles, names, states and child refs; hidden subtrees stay excluded. */
export function builda11ytree(node: pagenode): a11ynode {
  const children = node.children.filter((child) => !child.hidden).map(builda11ytree);
  return {
    role: node.role || "generic",
    name: node.name,
    states: node.states,
    ...(node.value ? { value: node.value } : {}),
    childcount: children.length,
    children,
  };
}

/** Returns the rendered text of each visible element; hidden nodes and their subtrees stay excluded. */
export function visibleentries(node: pagenode): Array<{ selector: string; text: string }> {
  if (node.hidden) return [];
  const entries: Array<{ selector: string; text: string }> = node.text
    ? [{ selector: node.selector || node.tag, text: node.text }]
    : [];
  for (const child of node.children) entries.push(...visibleentries(child));
  return entries;
}

/** Joins the rendered text of every visible node into one stream. */
export function visibletext(node: pagenode): string {
  return visibleentries(node)
    .map((entry) => entry.text)
    .join(" ");
}

function nodetextlength(node: pagenode): number {
  return node.text.length + node.children.reduce((total, child) => total + nodetextlength(child), 0);
}

function nodelinktext(node: pagenode): number {
  const own = node.tag === "a" ? node.text.length : 0;
  return own + node.children.reduce((total, child) => total + nodelinktext(child), 0);
}

function wordsin(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function findbyline(node: pagenode): string {
  const markers = ["byline", "author"];
  const direct =
    node.classes.some((item) => markers.some((marker) => item.toLowerCase().includes(marker))) ||
    markers.some((marker) => node.id.toLowerCase().includes(marker));
  if (direct && node.text) return node.text;
  for (const child of node.children) {
    const found = findbyline(child);
    if (found) return found;
  }
  return "";
}

function findheading(node: pagenode, tags: string[]): string {
  if (tags.includes(node.tag) && node.text) return node.text;
  for (const child of node.children) {
    const found = findheading(child, tags);
    if (found) return found;
  }
  return "";
}

/** Scores page nodes by text density and splits the densest article region into reader blocks, separating them from page chrome. */
export function buildreader(root: pagenode, title: string): readerarticle {
  let best: pagenode | undefined;
  let bestscore = 0;
  const walk = (node: pagenode): void => {
    if (node.tag !== "#document") {
      const length = nodetextlength(node);
      const links = nodelinktext(node);
      const score = length * (1 - (length > 0 ? links / length : 0));
      if (score > bestscore) {
        bestscore = score;
        best = node;
      }
    }
    for (const child of node.children) walk(child);
  };
  walk(root);
  const article = best ?? root;
  const blocks = article.children
    .filter((child) => !child.hidden && child.text)
    .map((child) => ({ kind: child.tag, text: child.text, words: wordsin(child.text) }));
  const ownblock = article.text ? [{ kind: article.tag, text: article.text, words: wordsin(article.text) }] : [];
  const allblocks = [...ownblock, ...blocks];
  return {
    title: findheading(article, ["h1"]) || findheading(root, ["h1"]) || title,
    byline: findbyline(article) || findbyline(root),
    blocks: allblocks,
    words: allblocks.reduce((total, block) => total + block.words, 0),
    characters: allblocks.reduce((total, block) => total + block.text.length, 0),
  };
}

/** Returns the title and headings outline of the page. */
export function pageoutline(
  root: pagenode,
  title: string,
): { title: string; headings: Array<{ level: number; text: string }> } {
  const headings: Array<{ level: number; text: string }> = [];
  const walk = (node: pagenode): void => {
    const level = /^h([1-6])$/.exec(node.tag);
    if (level && node.text) headings.push({ level: Number.parseInt(level[1] as string, 10), text: node.text });
    for (const child of node.children) walk(child);
  };
  walk(root);
  return { title: findheading(root, ["h1"]) || title, headings };
}

/** Reads the text of the current user selection through the document selection api. */
export function captureselection(root: { getSelection?: () => { toString(): string } | null }): {
  text: string;
  length: number;
} {
  const selection = root.getSelection?.() ?? null;
  const text = selection ? clean(selection.toString()) : "";
  return { text, length: text.length };
}

/** Extracts open graph meta properties and structured data payloads; malformed structured payloads are refused and counted. */
export function opengraphfields(
  meta: Array<{ property: string; name: string; content: string }>,
  jsonld: string[],
): { graph: Record<string, string>; structured: unknown[]; refused: number } {
  const graph: Record<string, string> = {};
  for (const entry of meta) {
    if (entry.property.startsWith("og:") && entry.content) graph[entry.property] = entry.content;
  }
  const structured: unknown[] = [];
  let refused = 0;
  for (const raw of jsonld) {
    try {
      structured.push(JSON.parse(raw));
    } catch {
      refused += 1;
    }
  }
  return { graph, structured, refused };
}

const stopwords: Record<string, string[]> = {
  en: ["the", "is", "at", "which", "on", "and", "of", "to", "in", "that", "it", "with"],
  pt: ["de", "que", "não", "uma", "para", "com", "por", "mais", "como", "página", "este", "você"],
  es: ["que", "el", "las", "los", "por", "una", "para", "con", "como", "página", "más", "este"],
  fr: ["le", "les", "des", "que", "pour", "dans", "est", "sur", "avec", "page", "plus", "cette"],
  de: ["der", "die", "und", "das", "ist", "von", "mit", "für", "auf", "den", "nicht", "seite"],
  it: ["che", "il", "la", "per", "una", "del", "sono", "non", "con", "pagina", "più", "questo"],
  nl: ["het", "een", "en", "van", "is", "dat", "op", "te", "voor", "met", "niet", "pagina"],
};

/** Detects the language of extracted text from stopword frequency; an undetermined text returns an empty code. */
export function detecttextlanguage(text: string): string {
  const words = text
    .toLowerCase()
    .split(/[^a-zà-ÿ]+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  let best = "";
  let bestscore = 0;
  for (const [language, dictionary] of Object.entries(stopwords)) {
    const score = words.filter((word) => dictionary.includes(word)).length;
    if (score > bestscore) {
      bestscore = score;
      best = language;
    }
  }
  return best;
}

/** Tags extracted text with its detected language code, routing it to the matching language stream. */
export function taglanguage(text: string): { text: string; language: string } {
  return { text, language: detecttextlanguage(text) };
}

/** Resolves the page language from the document lang attribute, the content language meta and the content signals, in that order. */
export function documentlanguage(signals: { lang: string; meta: string; text: string }): {
  language: string;
  source: string;
} {
  if (signals.lang.trim()) return { language: signals.lang.trim(), source: "document" };
  if (signals.meta.trim()) return { language: signals.meta.trim(), source: "meta" };
  return { language: detecttextlanguage(signals.text), source: "content" };
}

/** Lists the host paths of every open shadow root nested inside one scope tree. */
export function shadowpaths(scope: scopetree<candidatefields>): string[] {
  const paths: string[] = [];
  const walk = (tree: scopetree<candidatefields>, prefix: string): void => {
    for (const shadow of tree.shadows) {
      if (!shadow.host) continue;
      const path = prefix ? `${prefix} > ${shadow.host.selector}` : shadow.host.selector;
      paths.push(path);
      walk(shadow, path);
    }
  };
  walk(scope, "");
  return paths;
}

/** Enumerates the iframes of one document with their origins and sizes; cross origin frames report no origin. */
export function framelist(
  root: Document,
): Array<{ index: number; origin: string; sameorigin: boolean; width: number; height: number }> {
  return [...root.querySelectorAll("iframe")].map((frame, index) => {
    let origin = "";
    try {
      origin = frame.contentWindow?.location.origin ?? "";
    } catch {
      origin = "";
    }
    const rect = frame.getBoundingClientRect();
    return {
      index,
      origin,
      sameorigin: origin !== "" && origin === location.origin,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
}

function stepoptionsobserve(step: toolstep): Record<string, unknown> {
  try {
    return parseoptions(step);
  } catch {
    return {} as Record<string, unknown>;
  }
}

/** Runs one passive page observation after the background policy gate; frame routed steps receive their frame document as the root. */
export function runpageobservation(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  switch (step.kind) {
    case "a11ytree": {
      const tree = builda11ytree(buildpagetree(root));
      const count = countnodes(tree);
      return {
        ok: true,
        summary: `Captured the accessibility tree with ${count} node${count === 1 ? "" : "s"}.`,
        details: { tree, nodecount: count },
      };
    }
    case "readvisible": {
      const scope: ParentNode = target ?? root;
      const tree = buildpagetree(scope);
      const entries = visibleentries(tree);
      return {
        ok: true,
        summary: `Read the rendered text of ${entries.length} visible element${entries.length === 1 ? "" : "s"}.`,
        details: { entries, text: visibletext(tree) },
      };
    }
    case "readertree": {
      const article = buildreader(buildpagetree(root), root.title);
      return {
        ok: true,
        summary: `Extracted the reader view with ${article.blocks.length} block${article.blocks.length === 1 ? "" : "s"} and ${article.words} words.`,
        details: { article },
      };
    }
    case "readoutline": {
      const outline = pageoutline(buildpagetree(root), root.title);
      return {
        ok: true,
        summary: `Read the outline with ${outline.headings.length} heading${outline.headings.length === 1 ? "" : "s"}.`,
        details: { title: outline.title, headings: outline.headings },
      };
    }
    case "readselection": {
      const selection = captureselection(root);
      return {
        ok: true,
        summary: selection.text
          ? `Read ${selection.length} characters of the current selection.`
          : "No text is currently selected.",
        details: { text: selection.text, length: selection.length },
      };
    }
    case "readopengraph": {
      const meta = [...root.querySelectorAll("meta")].map((element) => ({
        property: element.getAttribute("property") ?? "",
        name: element.getAttribute("name") ?? "",
        content: element.getAttribute("content") ?? "",
      }));
      const jsonld = [...root.querySelectorAll('script[type="application/ld+json"]')].map(
        (element) => element.textContent ?? "",
      );
      const fields = opengraphfields(meta, jsonld);
      return {
        ok: true,
        summary: `Read ${Object.keys(fields.graph).length} open graph entr${Object.keys(fields.graph).length === 1 ? "y" : "ies"} and ${fields.structured.length} structured payload${fields.structured.length === 1 ? "" : "s"}${fields.refused > 0 ? `; ${fields.refused} malformed payload${fields.refused === 1 ? " was" : "s were"} refused` : ""}.`,
        details: { graph: fields.graph, structured: fields.structured, refused: fields.refused },
      };
    }
    case "readlang": {
      const metatag = root.querySelector('meta[http-equiv="content-language"]')?.getAttribute("content") ?? "";
      const outcome = documentlanguage({
        lang: root.documentElement?.getAttribute("lang") ?? "",
        meta: metatag,
        text: root.body?.innerText ?? "",
      });
      return {
        ok: true,
        summary: `Detected page language ${outcome.language || "unknown"} from the ${outcome.source} signal.`,
        details: { language: outcome.language, source: outcome.source },
      };
    }
    case "detectlanguage": {
      const options = stepoptionsobserve(step);
      const text =
        typeof options.text === "string" && options.text
          ? options.text
          : (target?.textContent ?? root.body?.innerText ?? "");
      const routed = taglanguage(clean(text));
      return {
        ok: routed.language !== "",
        summary: routed.language
          ? `Detected language ${routed.language} for the extracted text.`
          : "The extracted text language is undetermined.",
        details: { language: routed.language, routed },
      };
    }
    case "listshadow": {
      const paths = shadowpaths(describescopes(root));
      return {
        ok: true,
        summary: `Listed ${paths.length} open shadow root${paths.length === 1 ? "" : "s"}.`,
        details: { shadows: paths },
      };
    }
    case "listframes": {
      const frames = framelist(root);
      return {
        ok: true,
        summary: `Listed ${frames.length} iframe${frames.length === 1 ? "" : "s"}.`,
        details: { frames },
      };
    }
    default:
      return { ok: false, summary: "Unsupported page observation." };
  }
}

/* ── Merged from pagepointer.ts: the 1.1.88 consolidation interns the correlated pagepointer logic here, so no variation of the same file lives beside another. ── */

/**
 * Pointer path and coordinate click logics for reviewed steps.
 * Every correlated rule for waypoint interpolation, easing, jitter, hop settling, pointer sequences and coordinate clicks lives in this file.
 */

/** One interpolated pointer position with the settlepointer delay before it is dispatched. */
export interface pointerhop {
  x: number;
  y: number;
  delay: number;
}

/** One planned pointer or mouse event of a coordinate click sequence. */
export interface plannedevent {
  type: string;
  eventkind: "pointer" | "mouse";
  x: number;
  y: number;
  shift: boolean;
}

const basecadence = 16;

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function ease(easing: "linear" | "easeinout", progress: number): number {
  if (easing === "easeinout") return progress * progress * (3 - 2 * progress);
  return progress;
}

function ispointref(value: unknown): value is { x: number; y: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.x === "number" && Number.isFinite(point.x) && typeof point.y === "number" && Number.isFinite(point.y)
  );
}

/** Interpolates one reviewed pointer path into settlepointer-delimited hops, honoring the reviewed easing, peak velocity and jitter window. */
export function pathhops(
  path: pointpath,
  profile: speedprofile | undefined,
  random: () => number = Math.random,
  cadence: number = basecadence,
): pointerhop[] {
  const easing = profile?.easing === "easeinout" ? "easeinout" : "linear";
  const peak = typeof profile?.peak === "number" && profile.peak > 0 ? profile.peak : undefined;
  const jitter = typeof profile?.jitter === "number" && profile.jitter > 0 ? profile.jitter : 0;
  const points: Array<{ x: number; y: number }> = [path.start, ...(path.waypoints ?? []), path.end];
  const lengths: number[] = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const length = distance(points[index - 1] as { x: number; y: number }, points[index] as { x: number; y: number });
    lengths.push(length);
    total += length;
  }
  const reviewedduration =
    typeof path.duration === "number" && Number.isFinite(path.duration) && path.duration > 0
      ? path.duration
      : undefined;
  const duration = reviewedduration ?? (peak !== undefined && total > 0 ? (total / peak) * 1000 : 300);
  const hops: pointerhop[] = [];
  let previous = points[0] as { x: number; y: number };
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1] as { x: number; y: number };
    const to = points[index] as { x: number; y: number };
    const length = lengths[index - 1] ?? 0;
    if (total <= 0 || length <= 0) {
      hops.push({ x: to.x, y: to.y, delay: 0 });
      previous = to;
      continue;
    }
    const segmentduration = (duration * length) / total;
    const count = Math.max(1, Math.ceil(segmentduration / Math.max(1, cadence)));
    for (let hop = 1; hop <= count; hop += 1) {
      const progress = hop / count;
      const eased = ease(easing, progress);
      const position = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
      const step = distance(previous, position);
      const base = segmentduration / count;
      const capped = peak !== undefined ? Math.max(base, (step / peak) * 1000) : base;
      hops.push({ x: position.x, y: position.y, delay: Math.max(0, capped + (jitter > 0 ? random() * jitter : 0)) });
      previous = position;
    }
  }
  return hops;
}

/** Builds the pointer event sequence around a reviewed path: pointerover, one pointermove per hop, then pointerout. */
export function pointersequence(hopcount: number): string[] {
  return ["pointerover", ...Array.from({ length: Math.max(0, hopcount) }, () => "pointermove"), "pointerout"];
}

/** Builds the full pointer click sequence for reviewed coordinates and modifiers. */
export function clickplan(x: number, y: number, modifiers: string[]): plannedevent[] {
  const shift = modifiers.includes("shift");
  const pointer = (type: string): plannedevent => ({ type, eventkind: "pointer", x, y, shift });
  const mouse = (type: string): plannedevent => ({ type, eventkind: "mouse", x, y, shift });
  return [
    pointer("pointerover"),
    pointer("pointermove"),
    pointer("pointerdown"),
    mouse("mousedown"),
    pointer("pointerup"),
    mouse("mouseup"),
    mouse("click"),
  ];
}

/** Dispatches one planned event on an element with the reviewed coordinates and modifier flags. */
function dispatchplanned(element: Element, event: plannedevent): void {
  const init: MouseEventInit & PointerEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: event.x,
    clientY: event.y,
    shiftKey: event.shift,
  };
  if (event.eventkind === "pointer") element.dispatchEvent(new PointerEvent(event.type, init));
  else element.dispatchEvent(new MouseEvent(event.type, init));
}

/** Dispatches the full pointer click sequence on one element with the reviewed modifiers. */
export function dispatchclick(element: HTMLElement, modifiers: string[] = []): void {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  for (const event of clickplan(x, y, modifiers)) dispatchplanned(element, event);
}

/** Scrolls one target into view before any pointer interaction. */
export function ensurevisible(element: HTMLElement): void {
  try {
    element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  } catch {
    /* scroll containers may refuse; the interaction still proceeds */
  }
}

function settlepointer(delay: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

/** Dispatches a pointermove event at one viewport position on the element under the pointer. */
function dispatchmove(x: number, y: number): void {
  const element = document.elementFromPoint(x, y);
  const receiver = element ?? document.documentElement;
  receiver.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y }),
  );
}

/** Travels one reviewed pointpath with dispatched pointermove events, settling each hop before the next one. */
async function travel(path: pointpath, profile: speedprofile | undefined): Promise<stepresult> {
  const hops = pathhops(path, profile);
  const startelement = document.elementFromPoint(path.start.x, path.start.y) ?? document.documentElement;
  startelement.dispatchEvent(
    new PointerEvent("pointerover", {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: path.start.x,
      clientY: path.start.y,
    }),
  );
  for (const hop of hops) {
    await settlepointer(hop.delay);
    dispatchmove(hop.x, hop.y);
  }
  const endelement = document.elementFromPoint(path.end.x, path.end.y) ?? document.documentElement;
  endelement.dispatchEvent(
    new PointerEvent("pointerout", {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: path.end.x,
      clientY: path.end.y,
    }),
  );
  return {
    ok: true,
    summary: `Pointer traveled ${hops.length} hop${hops.length === 1 ? "" : "s"} to the reviewed end point.`,
  };
}

/** Runs one reviewed pointer step: movepointer paths, clickpoint coordinate clicks and shiftclick modified clicks. */
export function runpointerstep(step: toolstep, resolution: stepresolution): stepresult | Promise<stepresult> {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  if (step.kind === "movepointer") {
    const path = options.pointpath as Record<string, unknown> | undefined;
    if (!path || !ispointref(path.start) || !ispointref(path.end))
      return { ok: false, summary: "The reviewed pointer path is absent." };
    const waypoints =
      Array.isArray(path.waypoints) && path.waypoints.every((item) => ispointref(item))
        ? (path.waypoints as pointpath["waypoints"])
        : undefined;
    const fullpath: pointpath = {
      start: path.start,
      end: path.end,
      ...(waypoints ? { waypoints } : {}),
      ...(typeof path.duration === "number" && Number.isFinite(path.duration) ? { duration: path.duration } : {}),
    };
    return travel(fullpath, options.speedprofile as speedprofile | undefined);
  }
  if (step.kind === "clickpoint") {
    const reference = options.targetref as Record<string, unknown> | undefined;
    const x = Number(reference?.x);
    const y = Number(reference?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y))
      return { ok: false, summary: "The reviewed click coordinates are absent." };
    const element = document.elementFromPoint(x, y);
    if (!(element instanceof HTMLElement))
      return { ok: false, summary: "No element is rendered at the reviewed coordinates." };
    ensurevisible(element);
    for (const event of clickplan(x, y, [])) dispatchplanned(element, event);
    return { ok: true, summary: `Clicked the element at the reviewed coordinates ${x},${y}.` };
  }
  if (step.kind === "shiftclick") {
    if (resolution.status === "ambiguous")
      return {
        ok: false,
        summary: `The reviewed reference matched ${resolution.candidates.length} elements; choose one candidate.`,
        details: { mode: resolution.mode, candidates: resolution.candidates },
      };
    if (resolution.status !== "resolved") return { ok: false, summary: "Action target is no longer available." };
    ensurevisible(resolution.element);
    dispatchclick(resolution.element, ["shift"]);
    return {
      ok: true,
      summary: `Shift click delivered to ${resolution.target.label || resolution.target.tag}.`,
      details: { mode: resolution.target.mode, resolvedtarget: resolution.target },
    };
  }
  return { ok: false, summary: "Unsupported pointer action." };
}

/* ── Merged from pageprofile.ts: the 1.1.88 consolidation interns the correlated pageprofile logic here, so no variation of the same file lives beside another. ── */

/**
 * Page-side profiling capture for the reviewed 1.1.47 steps.
 * Correlated rules for the profiling option parsing live here while the flow, heap, cpu, shift, trace and source map math lives in the root profilers module: performance marks carry the step windows of the flow spec, the paint, navigation, longtask, layout shift and event buffers are observed for the reviewed window only, heap samples derive from the page performance memory buffer and the dom node count, and source map declarations are read from the loaded same origin scripts.
 * Every measurement derives from the performance timeline buffers and the injected instrumentation probes through the scripting api, so no debugger permission exists anywhere in the manifest.
 */

/** Parses the reviewed profiling options of one profiling step; absent windows watch nothing and the depth of capture stays the reviewed window only. */
export function profilestepoptions(step: toolstep): {
  flow?: { prefix: string; steps: string[]; metrics: string[] };
  watchwindow: number;
  heapinterval: number;
  growth?: { slope: number; interval: number };
  duration: number;
  threshold: number;
  categories: string[];
  exporttarget?: string;
  traceid?: string;
  scripts: string[];
} {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const watch =
    options.watch && typeof options.watch === "object" && !Array.isArray(options.watch)
      ? (options.watch as Record<string, unknown>)
      : {};
  const flow =
    options.flow && typeof options.flow === "object" && !Array.isArray(options.flow)
      ? (options.flow as Record<string, unknown>)
      : undefined;
  const heap =
    options.heap && typeof options.heap === "object" && !Array.isArray(options.heap)
      ? (options.heap as Record<string, unknown>)
      : {};
  const growth =
    options.growth && typeof options.growth === "object" && !Array.isArray(options.growth)
      ? (options.growth as Record<string, unknown>)
      : undefined;
  const profile =
    options.profile && typeof options.profile === "object" && !Array.isArray(options.profile)
      ? (options.profile as Record<string, unknown>)
      : {};
  const trace =
    options.trace && typeof options.trace === "object" && !Array.isArray(options.trace)
      ? (options.trace as Record<string, unknown>)
      : {};
  return {
    ...(flow !== undefined &&
    typeof flow.prefix === "string" &&
    Array.isArray(flow.steps) &&
    Array.isArray(flow.metrics)
      ? {
          flow: {
            prefix: flow.prefix,
            steps: flow.steps.filter((item): item is string => typeof item === "string"),
            metrics: flow.metrics.filter((item): item is string => typeof item === "string"),
          },
        }
      : {}),
    watchwindow:
      typeof watch.window === "number" && Number.isFinite(watch.window) && watch.window >= 0 ? watch.window : 0,
    heapinterval:
      typeof heap.interval === "number" && Number.isFinite(heap.interval) && heap.interval >= 0 ? heap.interval : 0,
    ...(growth !== undefined && typeof growth.slope === "number"
      ? {
          growth: {
            slope: growth.slope,
            interval:
              typeof growth.interval === "number" && Number.isFinite(growth.interval) && growth.interval >= 0
                ? growth.interval
                : 0,
          },
        }
      : {}),
    duration:
      typeof profile.duration === "number" && Number.isFinite(profile.duration) && profile.duration >= 0
        ? profile.duration
        : 0,
    threshold:
      typeof options.threshold === "number" && Number.isFinite(options.threshold) && options.threshold >= 0
        ? options.threshold
        : 0,
    categories: Array.isArray(trace.categories)
      ? trace.categories.filter((category): category is string => typeof category === "string")
      : [],
    ...(typeof trace.exporttarget === "string" ? { exporttarget: trace.exporttarget } : {}),
    ...(typeof trace.traceid === "string" ? { traceid: trace.traceid } : {}),
    scripts: Array.isArray(options.scripts)
      ? options.scripts.filter((url): url is string => typeof url === "string")
      : [],
  };
}

/** Resolves the reviewed trace category of one performance entry: navigation entries stay navigation, marks, measures, long tasks and event timing stay scripting, paint and layout shifts stay painting, resources stay loading while fetch and xmlhttprequest initiators stay network. */
function categoryof(entry: PerformanceEntry, initiator?: string): string {
  if (entry.entryType === "navigation") return "navigation";
  if (
    entry.entryType === "paint" ||
    entry.entryType === "largest-contentful-paint" ||
    entry.entryType === "layout-shift"
  )
    return "painting";
  if (entry.entryType === "resource")
    return initiator === "fetch" || initiator === "xmlhttprequest" ? "network" : "loading";
  return "scripting";
}

/** Collects the performance buffer entries of the reviewed types for the observed window as plain rows; the buffered observer covers the paint, navigation, longtask, layout shift, event and first input entries the getEntriesByType buffer misses. */
async function collectentries(
  watchwindow: number,
  types: string[],
): Promise<Array<{ name: string; type: string; start: number; duration: number; initiator?: string }>> {
  const rows: Array<{ name: string; type: string; start: number; duration: number; initiator?: string }> = [];
  for (const type of ["navigation", "paint", "mark", "measure", "resource", "longtask"]) {
    for (const entry of performance.getEntriesByType(type)) {
      rows.push({
        name: entry.name,
        type: entry.entryType,
        start: entry.startTime,
        duration: entry.duration,
        ...(type === "resource" ? { initiator: (entry as PerformanceResourceTiming).initiatorType } : {}),
      });
    }
  }
  if (types.length > 0) {
    await new Promise<void>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          rows.push({ name: entry.name, type: entry.entryType, start: entry.startTime, duration: entry.duration });
      });
      observer.observe({ entryTypes: types, buffered: true } as PerformanceObserverInit);
      window.setTimeout(
        () => {
          observer.disconnect();
          resolve();
        },
        Math.max(0, watchwindow),
      );
    });
  } else {
    await new Promise((resolve) => window.setTimeout(resolve, Math.max(0, watchwindow)));
  }
  return rows;
}

/** Reads the page heap sample: the used and limit bytes of the performance memory buffer with the dom node count, the honest derivation because no heap profiler exists without the debugger permission. */
function heapsample(): { usedbytes: number; limitbytes: number; nodecount: number } {
  const memory = (
    performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
    }
  ).memory;
  return {
    usedbytes: memory?.usedJSHeapSize ?? 0,
    limitbytes: memory?.jsHeapSizeLimit ?? memory?.totalJSHeapSize ?? 0,
    nodecount: document.querySelectorAll("*").length,
  };
}

function waitprofile(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, milliseconds)));
}

/** Runs one reviewed profiling step inside the page: the flow spec marks the start and end of every step in the window while the performance buffers feed the metric math of the root profilers module, the heap snapshot reads the memory buffer and the node count, the cpu window observes the long task and event timing samples, the layout shift watch scores the shifts of the window with their impacted selectors, the trace record categorizes the observed entries of the reviewed categories, and the source map capture reads the sourceMappingURL declarations of the loaded same origin scripts. */
export async function runprofilestep(step: toolstep): Promise<stepresult> {
  const options = profilestepoptions(step);
  if (step.kind === "measureflow") {
    if (!options.flow || options.watchwindow <= 0)
      return { ok: false, summary: "The reviewed flow spec with its watch window is absent." };
    const started = performance.now();
    for (const stepid of options.flow.steps) performance.mark(`${options.flow.prefix}:${stepid}:start`);
    const entries = await collectentries(options.watchwindow, [
      "largest-contentful-paint",
      "first-input",
      "event",
      "longtask",
    ]);
    for (const stepid of options.flow.steps) performance.mark(`${options.flow.prefix}:${stepid}:end`);
    for (const stepid of options.flow.steps)
      performance.measure(
        `${options.flow.prefix}:${stepid}`,
        `${options.flow.prefix}:${stepid}:start`,
        `${options.flow.prefix}:${stepid}:end`,
      );
    return {
      ok: true,
      summary: `Marked the start and end of ${options.flow.steps.length} step${options.flow.steps.length === 1 ? "" : "s"} of the flow ${options.flow.prefix} and collected ${entries.length} performance entr${entries.length === 1 ? "y" : "ies"} for the reviewed window of ${options.watchwindow} milliseconds.`,
      details: {
        entries,
        watchwindow: options.watchwindow,
        started,
        derivation:
          "Flow measurement derives from the performance timeline buffers and the injected marks through the scripting api; no debugger permission exists in the manifest.",
      },
    };
  }
  if (step.kind === "heapshot") {
    const sample = heapsample();
    return {
      ok: true,
      summary: `Captured the on demand heap sample of ${sample.usedbytes} used bytes against the ${sample.limitbytes} byte limit with ${sample.nodecount} dom node${sample.nodecount === 1 ? "" : "s"}.`,
      details: {
        ...sample,
        derivation:
          "Heap bytes derive from the page performance memory buffer and the node count from the dom because no heap profiler exists without the debugger permission.",
      },
    };
  }
  if (step.kind === "trackmemory") {
    if (!options.growth) return { ok: false, summary: "The reviewed growth slope is absent." };
    const sample = heapsample();
    return {
      ok: true,
      summary: `Took the heap sample of ${sample.usedbytes} used bytes beside the step for the growth tracking of slope ${options.growth.slope} bytes per millisecond.`,
      details: {
        ...sample,
        slope: options.growth.slope,
        interval: options.growth.interval,
        derivation: "Growth samples derive from the page performance memory buffer beside every step of the run.",
      },
    };
  }
  if (step.kind === "profilecpu") {
    if (options.duration <= 0) return { ok: false, summary: "The reviewed cpu profile duration is absent." };
    const started = performance.now();
    const entries = await collectentries(options.duration, ["longtask", "event", "first-input"]);
    const samples = entries
      .filter((entry) => entry.type === "longtask" || entry.type === "event" || entry.type === "first-input")
      .map((entry) => ({ name: entry.name || entry.type, time: entry.duration }));
    return {
      ok: true,
      summary: `Profiled the cpu window of ${options.duration} milliseconds with ${samples.length} sample${samples.length === 1 ? "" : "s"} from the long task and event timing buffers.`,
      details: {
        samples,
        duration: options.duration,
        started,
        derivation:
          "Cpu samples derive from the long task attribution and event timing buffers because no sampling profiler exists without the debugger permission.",
      },
    };
  }
  if (step.kind === "watchshifts") {
    if (options.watchwindow <= 0) return { ok: false, summary: "The reviewed layout shift window is absent." };
    const shifts: Array<{ score: number; starttime: number; selectors: string[] }> = [];
    await new Promise<void>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value?: number; sources?: Array<{ node?: Node }> };
          const selectors = (shift.sources ?? []).flatMap((source) =>
            source.node instanceof Element
              ? [source.node.tagName.toLowerCase() + (source.node.id ? `#${source.node.id}` : "")]
              : [],
          );
          const score = typeof shift.value === "number" ? shift.value : 0;
          if (options.threshold > 0 && score < options.threshold) continue;
          shifts.push({ score, starttime: shift.startTime, selectors });
        }
      });
      observer.observe({ entryTypes: ["layout-shift"], buffered: true } as PerformanceObserverInit);
      window.setTimeout(() => {
        observer.disconnect();
        resolve();
      }, options.watchwindow);
    });
    return {
      ok: true,
      summary: `Watched ${shifts.length} layout shift${shifts.length === 1 ? "" : "s"} for the reviewed window of ${options.watchwindow} milliseconds${options.threshold > 0 ? ` with the score threshold ${options.threshold}` : ""}.`,
      details: {
        shifts,
        watchwindow: options.watchwindow,
        derivation:
          "Layout shifts derive from the performance layout-shift buffer with the impacted element selectors of the shift sources.",
      },
    };
  }
  if (step.kind === "traceload") {
    if (options.categories.length === 0 || options.watchwindow <= 0)
      return { ok: false, summary: "The reviewed trace categories or window are absent." };
    const started = performance.now();
    const entries = await collectentries(options.watchwindow, [
      "largest-contentful-paint",
      "first-input",
      "event",
      "longtask",
      "layout-shift",
    ]);
    const events = entries
      .filter((entry) =>
        options.categories.includes(
          categoryof(
            {
              name: entry.name,
              entryType: entry.type,
              startTime: entry.start,
              duration: entry.duration,
            } as PerformanceEntry,
            entry.initiator,
          ),
        ),
      )
      .map((entry) => ({
        name: entry.name,
        category: categoryof(
          {
            name: entry.name,
            entryType: entry.type,
            startTime: entry.start,
            duration: entry.duration,
          } as PerformanceEntry,
          entry.initiator,
        ),
        offset: Math.round(entry.start - started),
      }));
    return {
      ok: true,
      summary: `Recorded ${events.length} trace event${events.length === 1 ? "" : "s"} of the reviewed categories ${options.categories.join(", ")} for the window of ${options.watchwindow} milliseconds and derived the exportable trace file.`,
      details: {
        events,
        categories: options.categories,
        watchwindow: options.watchwindow,
        started,
        ...(options.exporttarget !== undefined ? { exporttarget: options.exporttarget } : {}),
        derivation:
          "The trace file derives from the performance timeline entries of the reviewed categories; it is not the devtools binary trace format because no debugger permission exists in the manifest.",
      },
    };
  }
  if (step.kind === "capturesourcemaps") {
    const scripts: Array<{ url: string; mapurl?: string }> = [];
    for (const element of document.querySelectorAll("script[src]")) {
      const src = (element as HTMLScriptElement).src;
      if (!src.startsWith(location.origin)) continue;
      if (options.scripts.length > 0 && !options.scripts.includes(src)) continue;
      let mapurl: string | undefined;
      try {
        const response = await fetch(src, { credentials: "same-origin" });
        const source = await response.text();
        const match = /[#@]\s*sourceMappingURL=(\S+)/.exec(source);
        if (match !== null && match[1] !== undefined) mapurl = new URL(match[1], src).toString();
      } catch {
        /* a script the page refuses to re-fetch stays without a captured map; the capture continues */
      }
      scripts.push({ url: src, ...(mapurl !== undefined ? { mapurl } : {}) });
    }
    const withmaps = scripts.filter((script) => script.mapurl !== undefined);
    return {
      ok: true,
      summary: `Read the sourceMappingURL declarations of ${scripts.length} same origin script${scripts.length === 1 ? "" : "s"} of ${location.origin} and found ${withmaps.length} map declaration${withmaps.length === 1 ? "" : "s"}; the script sources stay in the page bridge and only the map urls leave it.`,
      details: {
        scripts,
        origin: location.origin,
        derivation:
          "Source map declarations are read by re-fetching the loaded same origin scripts of the page; cross origin scripts stay outside the capture and no map content enters the page bridge.",
      },
    };
  }
  return { ok: false, summary: "The profiling step is not part of the instrumented family." };
}

/* ── Merged from pagereads.ts: the 1.1.88 consolidation interns the correlated pagereads logic here, so no variation of the same file lives beside another. ── */

/**
 * Read-only page observation for reviewed steps.
 * Every correlated rule for attribute, style, geometry, value, content, table, link, image, meta, form, storage reads, bounded-free waits, clickable maps and verify reads lives in this file.
 */

const highlightid = "devthinkactionhighlight";

function clearhighlight(): void {
  document.getElementById(highlightid)?.remove();
}

/** Outlines one reviewed target without dispatching page events. */
function highlighttarget(target: Element): stepresult {
  clearhighlight();
  const rect = target.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.id = highlightid;
  overlay.setAttribute("aria-hidden", "true");
  Object.assign(overlay.style, {
    position: "fixed",
    left: `${Math.max(0, rect.left - 3)}px`,
    top: `${Math.max(0, rect.top - 3)}px`,
    width: `${rect.width + 6}px`,
    height: `${rect.height + 6}px`,
    border: "3px solid #2f9e44",
    borderRadius: "6px",
    pointerEvents: "none",
    zIndex: "2147483647",
    boxSizing: "border-box",
  });
  document.documentElement.append(overlay);
  window.setTimeout(clearhighlight, 5000);
  return { ok: true, summary: "Target outlined for five seconds." };
}

function poll(root: Document, predicate: () => boolean, description: string, timeout: number): Promise<stepresult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = (): void => {
      if (predicate()) {
        resolve({ ok: true, summary: `${description} is now present on the page.` });
        return;
      }
      if (timeout > 0 && Date.now() - started >= timeout) {
        resolve({ ok: false, summary: `${description} did not appear within ${timeout} milliseconds.` });
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

function formstate(root: Document): Array<Record<string, unknown>> {
  return [...root.querySelectorAll("input, textarea, select")].map((element) => ({
    type: element.getAttribute("type") ?? element.tagName.toLowerCase(),
    name: element.getAttribute("name") ?? "",
    value:
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
        ? element.value
        : "",
    ...(element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")
      ? { checked: element.checked }
      : {}),
  }));
}

/** Runs one read-only page observation after the background policy gate. */
export function runpageread(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  const options = (() => {
    try {
      return parseoptions(step);
    } catch {
      return {} as Record<string, unknown>;
    }
  })();
  switch (step.kind) {
    case "highlight": {
      if (!target) return { ok: false, summary: "Highlight target is no longer available." };
      return highlighttarget(target);
    }
    case "readattribute": {
      if (!target) return { ok: false, summary: "Read target is no longer available." };
      const value = target.getAttribute(step.value ?? "");
      return value === null
        ? { ok: false, summary: `Attribute ${step.value} is absent.` }
        : { ok: true, summary: `Attribute ${step.value} read.`, details: { value } };
    }
    case "readstyle": {
      if (!target) return { ok: false, summary: "Read target is no longer available." };
      const computed = getComputedStyle(target);
      const styles: Record<string, string> = {};
      for (let index = 0; index < computed.length; index += 1) {
        const property = computed.item(index);
        styles[property] = computed.getPropertyValue(property);
      }
      return { ok: true, summary: `Read ${computed.length} computed style properties.`, details: { styles } };
    }
    case "readgeometry": {
      if (!target) return { ok: false, summary: "Read target is no longer available." };
      const rect = target.getBoundingClientRect();
      const geometry = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      };
      return { ok: true, summary: "Target geometry read.", details: { geometry } };
    }
    case "readvalue": {
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        )
      )
        return { ok: false, summary: "Target does not hold a form value." };
      return { ok: true, summary: "Form value read.", details: { value: target.value } };
    }
    case "readtext": {
      if (!target) return { ok: false, summary: "Read target is no longer available." };
      const text = target.textContent ?? "";
      return { ok: true, summary: `Read ${text.length} characters of text.`, details: { text } };
    }
    case "readhtml": {
      if (!target) return { ok: false, summary: "Read target is no longer available." };
      return { ok: true, summary: "Target markup read.", details: { html: target.outerHTML } };
    }
    case "countelements": {
      const count = root.querySelectorAll(step.target ?? "").length;
      return { ok: true, summary: `Selector matches ${count} element${count === 1 ? "" : "s"}.`, details: { count } };
    }
    case "readtable": {
      if (!(target instanceof HTMLTableElement)) return { ok: false, summary: "Read target is not a table element." };
      const rows = [...target.querySelectorAll("tr")].map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) => cell.textContent?.trim() ?? ""),
      );
      const headers = rows[0] ?? [];
      const body = rows.slice(1);
      return {
        ok: true,
        summary: `Read table with ${headers.length} column${headers.length === 1 ? "" : "s"} and ${body.length} row${body.length === 1 ? "" : "s"}.`,
        details: { headers, rows: body },
      };
    }
    case "readlinks": {
      const links = [...root.querySelectorAll("a[href]")].map((element) => ({
        text: element.textContent?.trim() ?? "",
        href: element.getAttribute("href") ?? "",
      }));
      return { ok: true, summary: `Read ${links.length} link${links.length === 1 ? "" : "s"}.`, details: { links } };
    }
    case "readimages": {
      const images = [...root.querySelectorAll("img")].map((element) => ({
        src: element.getAttribute("src") ?? "",
        alt: element.getAttribute("alt") ?? "",
      }));
      return {
        ok: true,
        summary: `Read ${images.length} image${images.length === 1 ? "" : "s"}.`,
        details: { images },
      };
    }
    case "readmeta": {
      const meta = [...root.querySelectorAll("meta")].map((element) => ({
        name: element.getAttribute("name") ?? "",
        property: element.getAttribute("property") ?? "",
        content: element.getAttribute("content") ?? "",
      }));
      return {
        ok: true,
        summary: `Read ${meta.length} meta entr${meta.length === 1 ? "y" : "ies"}.`,
        details: { meta },
      };
    }
    case "readforms": {
      const forms = formstate(root);
      return {
        ok: true,
        summary: `Read ${forms.length} form control${forms.length === 1 ? "" : "s"}.`,
        details: { forms },
      };
    }
    case "readstorage": {
      try {
        if (step.value) {
          const value = localStorage.getItem(step.value);
          return { ok: true, summary: `Read local storage entry ${step.value}.`, details: { value } };
        }
        const entries: Record<string, string | null> = {};
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (key !== null) entries[key] = localStorage.getItem(key);
        }
        return {
          ok: true,
          summary: `Read ${Object.keys(entries).length} local storage entr${Object.keys(entries).length === 1 ? "y" : "ies"}.`,
          details: { entries },
        };
      } catch (error) {
        return {
          ok: false,
          summary: `Local storage refused the read: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    case "waitfor": {
      const selector = step.target ?? "";
      const timeout = typeof options.timeout === "number" ? options.timeout : 0;
      return poll(root, () => Boolean(root.querySelector(selector)), `Selector ${selector}`, timeout);
    }
    case "waittext": {
      const text = step.value ?? "";
      const timeout = typeof options.timeout === "number" ? options.timeout : 0;
      return poll(root, () => (root.body?.innerText ?? "").includes(text), `Text ${text}`, timeout);
    }
    case "mapclicks": {
      const candidates = collectclickable(root);
      const map = buildclickablemap(candidates, 0, 0);
      return {
        ok: true,
        summary: `Mapped ${map.entries.length} clickable element${map.entries.length === 1 ? "" : "s"}.`,
        details: { entries: map.entries },
      };
    }
    case "verifyvisible": {
      if (!target) return { ok: false, summary: "Verify target is no longer available." };
      const rect = target.getBoundingClientRect();
      const rendered = rect.width > 0 && rect.height > 0;
      return {
        ok: rendered,
        summary: rendered
          ? `Target is rendered at ${Math.round(rect.x)},${Math.round(rect.y)} with size ${Math.round(rect.width)}x${Math.round(rect.height)}.`
          : "Target is not rendered.",
        details: { visible: rendered, geometry: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } },
      };
    }
    case "verifyenabled": {
      if (!target) return { ok: false, summary: "Verify target is no longer available." };
      const control = target as HTMLInputElement;
      const disabled = control.disabled === true || target.hasAttribute("disabled");
      const readonly = control.readOnly === true || target.hasAttribute("readonly");
      const enabled = !disabled && !readonly;
      return {
        ok: enabled,
        summary: enabled ? "Target is enabled and writable." : disabled ? "Target is disabled." : "Target is readonly.",
        details: { enabled, disabled, readonly },
      };
    }
    case "resolvexpath": {
      const reference = options.targetref as Record<string, unknown> | undefined;
      const expression = typeof reference?.xpath === "string" ? reference.xpath : "";
      if (!expression) return { ok: false, summary: "The reviewed xpath expression is absent." };
      let matches: ReturnType<typeof evaluatexpath> = [];
      try {
        matches = evaluatexpath(buildxtree(root), expression);
      } catch (error) {
        return {
          ok: false,
          summary: `The reviewed xpath expression failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
      const summaries = matches.map((node) => ({
        tag: node.tag,
        ...(node.element ? { selector: elementselector(node.element), label: elementlabel(node.element) } : {}),
      }));
      return {
        ok: matches.length > 0,
        summary:
          matches.length > 0
            ? `Resolved ${matches.length} element${matches.length === 1 ? "" : "s"} for the reviewed xpath.`
            : "The reviewed xpath matched no elements.",
        details: { mode: "xpath", matches: summaries },
      };
    }
    default:
      return { ok: false, summary: "Unsupported page read." };
  }
}

/* ── Merged from pageresolve.ts: the 1.1.88 consolidation interns the correlated pageresolve logic here, so no variation of the same file lives beside another. ── */

/**
 * Target resolution engine for reviewed steps.
 * Every correlated rule for element summaries, targetref modes, ambiguity reports, shadow piercing, frame walking and the numbered clickable map lives in this file.
 */

/** Descriptive fields shared by every resolution candidate; the live dom glue attaches the element. */
export interface candidatefields {
  tag: string;
  id: string;
  role: string;
  name: string;
  label: string;
  text: string;
  selector: string;
}

/** One live dom candidate: descriptive fields plus the element itself. */
export interface livecandidate extends candidatefields {
  element: Element;
}

/** Serializable description of one document with nested frames; the glue attaches the live document. */
export interface framedescription {
  frames: frameentry[];
  live?: Document;
}

/** One nested frame: same origin frames expose their document, cross origin frames do not. */
export interface frameentry {
  sameorigin: boolean;
  document?: framedescription;
}

/** Serializable scope tree: one scope's candidates plus the open shadow scopes nested inside it. */
export interface scopetree<T extends candidatefields = livecandidate> {
  host?: T;
  candidates: T[];
  shadows: scopetree<T>[];
}

export function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cssescape(value: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

/** Computes the accessible style label of an element from aria hints, linked labels, title and content. */
export function elementlabel(element: Element): string {
  const aria = element.getAttribute("aria-label");
  let linked = "";
  const labelledby = element.getAttribute("aria-labelledby");
  if (labelledby) {
    try {
      const owner = element.ownerDocument?.getElementById(labelledby);
      if (owner) linked = owner.textContent ?? "";
    } catch {
      /* detached documents refuse lookups; the label falls back */
    }
  }
  let forlabel = "";
  if (element.id) {
    try {
      const label = element.ownerDocument?.querySelector(`label[for="${cssescape(element.id)}"]`);
      if (label instanceof HTMLElement) forlabel = label.textContent ?? "";
    } catch {
      /* the document may be detached; the label falls back */
    }
  }
  return clean(aria || linked || forlabel || element.getAttribute("title") || element.textContent || "");
}

/** Computes the implicit aria role of common elements when no explicit role attribute exists. */
export function implicitrole(element: Element): string {
  const tag = element.tagName.toLowerCase();
  if (tag === "button") return "button";
  if (tag === "a" && element.getAttribute("href")) return "link";
  if (tag === "select") return "combobox";
  if (tag === "textarea") return "textbox";
  if (tag === "details") return "group";
  if (tag === "input") {
    const type = element.getAttribute("type") ?? "text";
    if (type === "checkbox") return "checkbox";
    if (type === "radio") return "radio";
    if (type === "button" || type === "submit" || type === "reset") return "button";
    if (type === "range") return "slider";
    return "textbox";
  }
  return "";
}

/** Builds the css selector that re-finds one element inside its document. */
export function elementselector(element: Element): string {
  if (element.id) return `#${cssescape(element.id)}`;
  const role = element.getAttribute("role");
  const name = element.getAttribute("name");
  if (role && name) return `[role="${cssescape(role)}"][name="${cssescape(name)}"]`;
  if (name) return `${element.tagName.toLowerCase()}[name="${cssescape(name)}"]`;
  const tag = element.tagName.toLowerCase();
  const parent = element.parentElement;
  if (!parent) return tag;
  const peers = [...parent.children].filter((node) => node.tagName === element.tagName);
  return `${tag}:nth-of-type(${peers.indexOf(element) + 1})`;
}

/** Own text of an element: only its direct text nodes, so parents do not shadow their children. */
export function owntext(element: Element): string {
  let combined = "";
  for (const node of element.childNodes) if (node.nodeType === Node.TEXT_NODE) combined += node.textContent ?? "";
  return clean(combined);
}

/** Summarizes one live element into the candidate shape used by every resolution mode. */
export function summarize(element: Element): livecandidate {
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id,
    role: element.getAttribute("role")?.toLowerCase() || implicitrole(element),
    name: element.getAttribute("name") ?? "",
    label: elementlabel(element),
    text: owntext(element),
    selector: elementselector(element),
    element,
  };
}

const clickableselector =
  "a[href], button, input, textarea, select, summary, [role=button], [role=link], [role=combobox], [role=option], [role=checkbox], [role=radio], [role=switch], [role=tab]";

/** Collects every clickable candidate in document order. */
export function collectclickable(root: ParentNode): livecandidate[] {
  return [...root.querySelectorAll(clickableselector)].map(summarize);
}

/** Collects every element as a resolution candidate in document order. */
export function collectcandidates(root: ParentNode): livecandidate[] {
  return [...root.querySelectorAll("*")].map(summarize);
}

/** Matches candidates whose visible own text or label equals or contains the reviewed text. */
export function matchtext<T extends candidatefields>(candidates: T[], text: string): T[] {
  const wanted = clean(text).toLowerCase();
  if (!wanted) return [];
  const exact = candidates.filter(
    (candidate) => candidate.text.toLowerCase() === wanted || candidate.label.toLowerCase() === wanted,
  );
  if (exact.length > 0) return exact;
  return candidates.filter(
    (candidate) => candidate.text.toLowerCase().includes(wanted) || candidate.label.toLowerCase().includes(wanted),
  );
}

/** Matches candidates by the aria role and accessible name pair. */
export function matcharia<T extends candidatefields>(candidates: T[], role: string, name: string): T[] {
  const wantedrole = clean(role).toLowerCase();
  const wantedname = clean(name).toLowerCase();
  if (!wantedrole || !wantedname) return [];
  return candidates.filter(
    (candidate) =>
      candidate.role.toLowerCase() === wantedrole &&
      (candidate.label.toLowerCase() === wantedname || candidate.name.toLowerCase() === wantedname),
  );
}

/** Matches candidates by accessible name, preferring clickable elements when several share one name. */
export function matchname<T extends candidatefields>(
  candidates: T[],
  name: string,
  clickable?: (candidate: T) => boolean,
): T[] {
  const wanted = clean(name).toLowerCase();
  if (!wanted) return [];
  const matches = candidates.filter(
    (candidate) => candidate.label.toLowerCase() === wanted || candidate.name.toLowerCase() === wanted,
  );
  if (matches.length > 1 && clickable) {
    const interactive = matches.filter(clickable);
    if (interactive.length === 1) return interactive;
  }
  return matches;
}

/** Matches one clickable map number; map numbers are one based and stable inside one observation version. */
export function matchindex<T extends candidatefields>(candidates: T[], index: number): T[] {
  if (!Number.isInteger(index) || index < 1) return [];
  const entry = candidates[index - 1];
  return entry ? [entry] : [];
}

/** Builds the numbered clickable map from clickable candidates in document order. */
export function buildclickablemap<T extends candidatefields>(
  candidates: T[],
  version: number,
  builtat = 0,
): clickablemap {
  const entries: mapentry[] = candidates.map((candidate, position) => ({
    number: position + 1,
    selector: candidate.selector,
    role: candidate.role || candidate.tag,
    label: candidate.label,
    mode: "selector" as const,
  }));
  return { version, entries, builtat };
}

/** Describes the nested frame structure of one live document; cross origin frames stay opaque. */
export function describeframes(root: Document): framedescription {
  const frames = [...root.querySelectorAll("iframe")].map((frame) => {
    let content: Document | null = null;
    try {
      content = frame.contentDocument;
    } catch {
      content = null;
    }
    let sameorigin = false;
    try {
      sameorigin = content !== null && frame.contentWindow?.location.origin === location.origin;
    } catch {
      sameorigin = false;
    }
    return sameorigin && content ? { sameorigin: true, document: describeframes(content) } : { sameorigin: false };
  });
  return { frames, live: root };
}

/** Walks a reviewed frame path through same origin frames and refuses cross origin or absent hops. */
export function walkframepath(
  root: framedescription,
  path: number[],
): { ok: true; document: framedescription } | { ok: false; reason: string } {
  let current = root;
  for (const index of path) {
    if (!Number.isInteger(index) || index < 0)
      return { ok: false, reason: "The reviewed frame path contains an invalid frame index." };
    const entry = current.frames[index];
    if (!entry) return { ok: false, reason: `Frame ${index} of the reviewed frame path is absent.` };
    if (!entry.sameorigin || !entry.document)
      return { ok: false, reason: `Frame ${index} of the reviewed frame path is cross origin and was refused.` };
    current = entry.document;
  }
  return { ok: true, document: current };
}

/** Describes one document or shadow root scope with every nested open shadow scope. */
export function describescopes(root: ParentNode): scopetree {
  const elements = [...root.querySelectorAll("*")];
  const shadows: scopetree[] = [];
  for (const element of elements) {
    const shadow = element.shadowRoot;
    if (shadow) {
      const nested = describescopes(shadow);
      nested.host = summarize(element);
      shadows.push(nested);
    }
  }
  return { candidates: elements.map(summarize), shadows };
}

/** Searches one scope tree depth first for candidates matching the predicate, piercing open shadow scopes recursively. */
export function piercescopes<T extends candidatefields>(scope: scopetree<T>, match: (candidate: T) => boolean): T[] {
  const found: T[] = [];
  for (const candidate of scope.candidates) if (match(candidate)) found.push(candidate);
  for (const shadow of scope.shadows) found.push(...piercescopes(shadow, match));
  return found;
}

/** Resolves a reviewed selector chain through open shadow roots: each selector resolves inside the previous scope. */
export function queryshadowchain(root: ParentNode, selectors: string[]): Element | null {
  let scope: ParentNode = root;
  for (let position = 0; position < selectors.length; position += 1) {
    const found = scope.querySelector(selectors[position] as string);
    if (!found) return null;
    if (position === selectors.length - 1) return found;
    const shadow = found.shadowRoot;
    if (!shadow) return null;
    scope = shadow;
  }
  return null;
}

/** Finds the first element matching a selector in the scope or any nested open shadow root. */
export function queryscoped(root: ParentNode, selector: string): Element | null {
  const direct = root.querySelector(selector);
  if (direct) return direct;
  for (const element of [...root.querySelectorAll("*")]) {
    const shadow = element.shadowRoot;
    if (shadow) {
      const found = queryscoped(shadow, selector);
      if (found) return found;
    }
  }
  return null;
}

function parseoptionssafe(step: toolstep): Record<string, unknown> {
  try {
    return parseoptions(step);
  } catch {
    return {};
  }
}

/** Builds the matched element summary attached to step results for review. */
export function targetsummary(mode: targetmode, element: HTMLElement): resolvedtarget {
  const rect = element.getBoundingClientRect();
  return {
    mode,
    selector: elementselector(element),
    tag: element.tagName.toLowerCase(),
    label: elementlabel(element),
    geometry: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
  };
}

export type stepresolution =
  | { status: "none" }
  | { status: "resolved"; element: HTMLElement; target: resolvedtarget }
  | { status: "ambiguous"; mode: targetmode; candidates: string[] }
  | { status: "absent"; mode?: targetmode };

function singleresolution(mode: targetmode, matches: livecandidate[]): stepresolution {
  const verdict = resolutionverdict(matches.length);
  if (verdict === "resolved") {
    const winner = matches[0];
    if (winner && winner.element instanceof HTMLElement)
      return { status: "resolved", element: winner.element, target: targetsummary(mode, winner.element) };
    return { status: "absent", mode };
  }
  if (verdict === "ambiguous")
    return {
      status: "ambiguous",
      mode,
      candidates: matches.slice(0, 8).map((candidate) => candidate.label || candidate.selector),
    };
  return { status: "absent", mode };
}

/** Resolves one reviewed targetref mode against the live dom in a single pass. */
function resolvetargetref(reference: Record<string, unknown>, root: Document): stepresolution {
  const mode = reference.mode;
  if (mode === "selector") {
    const selector = typeof reference.selector === "string" ? reference.selector : "";
    const element = selector ? root.querySelector(selector) : null;
    return element instanceof HTMLElement
      ? { status: "resolved", element, target: targetsummary("selector", element) }
      : { status: "absent", mode: "selector" };
  }
  if (mode === "point") {
    const x = Number(reference.x);
    const y = Number(reference.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return { status: "absent", mode: "point" };
    const element = root.elementFromPoint(x, y);
    return element instanceof HTMLElement
      ? { status: "resolved", element, target: targetsummary("point", element) }
      : { status: "absent", mode: "point" };
  }
  if (mode === "xpath") {
    const expression = typeof reference.xpath === "string" ? reference.xpath : "";
    if (!expression) return { status: "absent", mode: "xpath" };
    const matches = evaluatexpath(buildxtree(root), expression);
    const first = matches[0];
    return first?.element instanceof HTMLElement
      ? { status: "resolved", element: first.element, target: targetsummary("xpath", first.element) }
      : { status: "absent", mode: "xpath" };
  }
  if (mode === "index") {
    const matches = matchindex(collectclickable(root), Number(reference.index));
    return singleresolution("index", matches);
  }
  const candidates = collectcandidates(root);
  if (mode === "text")
    return singleresolution("text", matchtext(candidates, typeof reference.text === "string" ? reference.text : ""));
  if (mode === "aria")
    return singleresolution(
      "aria",
      matcharia(
        candidates,
        typeof reference.role === "string" ? reference.role : "",
        typeof reference.name === "string" ? reference.name : "",
      ),
    );
  if (mode === "name")
    return singleresolution("name", matchname(candidates, typeof reference.name === "string" ? reference.name : ""));
  return { status: "absent" };
}

/** Resolves the reviewed target of a step: the options targetref when present, otherwise the css target. */
export function resolvestep(step: toolstep, root: Document): stepresolution {
  const reference = parseoptionssafe(step).targetref;
  if (reference && typeof reference === "object" && !Array.isArray(reference))
    return resolvetargetref(reference as Record<string, unknown>, root);
  if (!step.target?.trim()) return { status: "none" };
  const element = root.querySelector(step.target);
  if (element instanceof HTMLElement)
    return { status: "resolved", element, target: targetsummary("selector", element) };
  return { status: "absent", mode: "selector" };
}

/* ── Merged from pagesession.ts: the 1.1.88 consolidation interns the correlated pagesession logic here, so no variation of the same file lives beside another. ── */
/**
 * Page seam of the 1.1.49 session memory family: per tab scroll position, form state, local storage and cookie name capture plus the scroll and form restore.
 * Every function stays self contained so the scripting api can serialize it into any granted tab; password fields never join a capture and cookie values never leave the page.
 */

/** Captures the reviewed sections of one tab: the scroll position, the form state of non password fields, the local storage pairs and the cookie names. */
export function capturepagestate(sections: string[]): {
  scrollx: number;
  scrolly: number;
  forms: Array<{ selector: string; value: string }>;
  storagekeys: string[];
  storagevalues: string[];
  cookienames: string[];
} {
  const wants = (section: string): boolean => sections.includes(section);
  const forms: Array<{ selector: string; value: string }> = [];
  if (wants("forms")) {
    const elements = Array.from(document.querySelectorAll("input, textarea, select")) as Array<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >;
    elements.forEach((element, index) => {
      if (element.type === "password") return;
      const selector = element.id
        ? `#${element.id}`
        : element.name
          ? `[name="${element.name}"]`
          : `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      forms.push({ selector, value: element.value });
    });
  }
  const storagekeys: string[] = [];
  const storagevalues: string[] = [];
  if (wants("storage")) {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key === null) continue;
      storagekeys.push(key);
      storagevalues.push(localStorage.getItem(key) ?? "");
    }
  }
  const cookienames = wants("cookies")
    ? document.cookie
        .split(";")
        .map((part) => part.split("=")[0]?.trim() ?? "")
        .filter((name) => name.length > 0)
    : [];
  return { scrollx: window.scrollX, scrolly: window.scrollY, forms, storagekeys, storagevalues, cookienames };
}

/** Restores the scroll position and the form state of one reopened tab; the restore only touches the captured selectors of the saved record. */
export function restorepagestate(state: {
  scrollx: number;
  scrolly: number;
  forms: Array<{ selector: string; value: string }>;
}): { restored: number; summary: string } {
  window.scrollTo(state.scrollx, state.scrolly);
  let restored = 0;
  for (const form of Array.isArray(state.forms) ? state.forms : []) {
    const element = document.querySelector(form.selector);
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      element.value = form.value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      restored += 1;
    }
  }
  return {
    restored,
    summary: `Restored the scroll position and ${restored} form field${restored === 1 ? "" : "s"} of the reopened tab.`,
  };
}

/* ── Merged from pagewatch.ts: the 1.1.88 consolidation interns the correlated pagewatch logic here, so no variation of the same file lives beside another. ── */

/**
 * Watched page observation for reviewed steps.
 * Every correlated rule for watch option parsing, mutation batching, focus tracking, the network quiet probe, the snapshot diff engine, the json state scanner and the selector scorer lives in this file.
 */

/** Internal sampling cadence used when a watch step reviews no poll interval. */
const defaultpoll = 250;

/** Parsed watch options of one watch step: the mutationwatch fields plus the poll interval. */
export type watchoptions = mutationwatch & { watchid: string; poll: number };

/** Parses the reviewed watch options of one watch step into its mutationwatch shape with a poll interval. */
export function parsewatchoptions(step: toolstep, fallbackid: string): watchoptions {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const scopes = Array.isArray(options.scopes)
    ? options.scopes.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : undefined;
  const events = Array.isArray(options.events)
    ? options.events.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : undefined;
  const lifetime =
    typeof options.lifetime === "number" && Number.isFinite(options.lifetime) && options.lifetime > 0
      ? options.lifetime
      : 0;
  return {
    watchid: typeof options.watchid === "string" && options.watchid.trim() ? options.watchid : fallbackid,
    ...(scopes ? { scopes } : {}),
    ...(events ? { events } : {}),
    lifetime,
    poll:
      typeof options.poll === "number" && Number.isFinite(options.poll) && options.poll >= 0
        ? options.poll
        : defaultpoll,
  };
}

/** Batches mutation records so records arriving inside one throttle window flush to the bridge together. */
export function batchmutations(records: mutationevent[], windowms: number): mutationevent[][] {
  const batches: mutationevent[][] = [];
  let current: mutationevent[] = [];
  let opened = -1;
  for (const record of records) {
    if (current.length === 0 || (windowms > 0 && record.at - opened >= windowms)) {
      if (current.length > 0) batches.push(current);
      current = [record];
      opened = record.at;
    } else current.push(record);
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

/** Measures how long the network has stayed quiet from the resource timing entries completed so far. */
export function quietfor(entries: Array<{ responseend: number }>, now: number): number {
  let last = 0;
  for (const entry of entries) if (entry.responseend > last) last = entry.responseend;
  return Math.max(0, now - last);
}

/** Decides the network quiet outcome from collected probe samples against the reviewed idle threshold and timeout. */
export function quietresolution(
  samples: Array<{ at: number; quietfor: number }>,
  idle: number,
  timeout: number,
): { ok: boolean; quietfor: number; waited: number; samples: number } {
  const start = samples[0]?.at ?? 0;
  const last = samples[samples.length - 1];
  const waited = Math.max(0, (last?.at ?? 0) - start);
  const reached = samples.find((sample) => sample.quietfor >= idle);
  if (reached) return { ok: true, quietfor: reached.quietfor, waited: reached.at - start, samples: samples.length };
  return { ok: false, quietfor: last?.quietfor ?? 0, waited, samples: samples.length };
}

/** Serializable node summary the diff engine compares between observation versions. */
export interface nodesummary {
  selector: string;
  tag: string;
  text: string;
  attributes: Record<string, string>;
}

/** Hashes one node summary into a stable digest used by the diff engine. */
export function nodehash(summary: nodesummary): string {
  const canonical = [
    summary.tag,
    summary.text,
    ...Object.keys(summary.attributes)
      .sort()
      .map((key) => `${key}=${summary.attributes[key] ?? ""}`),
  ].join("|");
  let hash = 5381;
  for (let index = 0; index < canonical.length; index += 1)
    hash = ((hash << 5) + hash + canonical.charCodeAt(index)) >>> 0;
  return hash.toString(16);
}

/** Diffs two node summary sets into added, removed and changed entries by hashing node summaries. */
export function diffsummaries(
  base: nodesummary[],
  target: nodesummary[],
): { added: diffentry[]; removed: diffentry[]; changed: diffentry[] } {
  const basemap = new Map(base.map((node) => [node.selector, node]));
  const targetmap = new Map(target.map((node) => [node.selector, node]));
  const added: diffentry[] = [];
  const removed: diffentry[] = [];
  const changed: diffentry[] = [];
  for (const [selector, node] of targetmap) {
    const previous = basemap.get(selector);
    if (!previous) {
      added.push({ kind: "added", selector, summary: node.text || node.tag });
      continue;
    }
    if (nodehash(previous) !== nodehash(node))
      changed.push({
        kind: "changed",
        selector,
        summary: `${previous.text || previous.tag} became ${node.text || node.tag}`,
      });
  }
  for (const [selector, node] of basemap) {
    if (!targetmap.has(selector)) removed.push({ kind: "removed", selector, summary: node.text || node.tag });
  }
  return { added, removed, changed };
}

/** Scans inline script payloads for embedded json state; malformed payloads are refused and counted. */
export function scanjson(scripts: Array<{ src: string; type: string; id: string; content: string }>): {
  states: jsonstate[];
  refused: number;
} {
  const states: jsonstate[] = [];
  let refused = 0;
  for (const script of scripts) {
    if (script.src) continue;
    const content = script.content.trim();
    if (!(script.type.includes("json") || content.startsWith("{") || content.startsWith("["))) continue;
    try {
      states.push({ scripturl: script.src, rootpath: script.id, payload: JSON.parse(content) });
    } catch {
      refused += 1;
    }
  }
  return { states, refused };
}

/** Ranks selector candidates of one element shape by stability: id, attribute, text and structural strategies. */
export function rankselectors(shape: {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  text: string;
  index: number;
  siblings: number;
}): selectorcandidate[] {
  const candidates: selectorcandidate[] = [];
  if (shape.id) candidates.push({ selector: `#${shape.id}`, strategy: "id", score: 100 });
  for (const [name, value] of Object.entries(shape.attributes)) {
    if (!value) continue;
    if (name === "name" || name.startsWith("data-") || name.startsWith("aria-"))
      candidates.push({ selector: `${shape.tag}[${name}="${value}"]`, strategy: "attribute", score: 80 });
  }
  if (shape.text) candidates.push({ selector: shape.text, strategy: "text", score: 60 });
  if (shape.index > 0)
    candidates.push({ selector: `${shape.tag}:nth-of-type(${shape.index})`, strategy: "structural", score: 40 });
  return candidates.sort((left, right) => right.score - left.score);
}

function waitwatch(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function quietruleof(step: toolstep): quietrule {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const rule = options.quietrule;
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { idle: 0 };
  const quiet = rule as Record<string, unknown>;
  return {
    idle: typeof quiet.idle === "number" && Number.isFinite(quiet.idle) && quiet.idle > 0 ? quiet.idle : 0,
    ...(typeof quiet.poll === "number" && Number.isFinite(quiet.poll) && quiet.poll >= 0 ? { poll: quiet.poll } : {}),
    ...(typeof quiet.timeout === "number" && Number.isFinite(quiet.timeout) && quiet.timeout >= 0
      ? { timeout: quiet.timeout }
      : {}),
  };
}

/** Observes dom mutations inside the reviewed selector scopes for the reviewed lifetime, batching records through the throttle window. */
async function watchmutations(step: toolstep, root: Document): Promise<stepresult> {
  const options = parsewatchoptions(step, step.id);
  if (options.lifetime <= 0) return { ok: false, summary: "The reviewed mutation watch lifetime is absent." };
  const roots: ParentNode[] = options.scopes
    ? options.scopes.flatMap((selector) => [...root.querySelectorAll(selector)])
    : [root];
  if (roots.length === 0) return { ok: false, summary: "The reviewed watch scopes match no elements." };
  const allowed = options.events;
  const collected: mutationevent[] = [];
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (allowed && !allowed.includes(record.type)) continue;
      const target = record.target instanceof Element ? record.target : null;
      collected.push({
        watchid: options.watchid,
        event: record.type,
        targetpath: target ? elementselector(target) : "#text",
        at: Date.now(),
      });
    }
  });
  for (const scope of roots)
    observer.observe(scope, { childList: true, attributes: true, characterData: true, subtree: true });
  await waitwatch(options.lifetime);
  observer.disconnect();
  const batches = batchmutations(collected, options.poll);
  return {
    ok: true,
    summary: `Watched ${collected.length} mutation${collected.length === 1 ? "" : "s"} in ${batches.length} batch${batches.length === 1 ? "" : "es"} for the reviewed lifetime of ${options.lifetime} milliseconds.`,
    details: {
      events: collected,
      batches: batches.length,
      watchid: options.watchid,
      lifetime: options.lifetime,
      scopes: options.scopes ?? [],
    },
  };
}

/** Records focus and blur events with element paths for the reviewed lifetime. */
async function watchfocus(step: toolstep, root: Document): Promise<stepresult> {
  const options = parsewatchoptions(step, step.id);
  if (options.lifetime <= 0) return { ok: false, summary: "The reviewed focus watch lifetime is absent." };
  const collected: focusevent[] = [];
  const record =
    (kind: "focus" | "blur") =>
    (event: Event): void => {
      const target = event.target instanceof Element ? event.target : null;
      collected.push({
        watchid: options.watchid,
        kind,
        targetpath: target ? elementselector(target) : "#document",
        at: Date.now(),
      });
    };
  const onfocus = record("focus");
  const onblur = record("blur");
  root.addEventListener("focusin", onfocus, true);
  root.addEventListener("focusout", onblur, true);
  await waitwatch(options.lifetime);
  root.removeEventListener("focusin", onfocus, true);
  root.removeEventListener("focusout", onblur, true);
  return {
    ok: true,
    summary: `Watched ${collected.length} focus change${collected.length === 1 ? "" : "s"} for the reviewed lifetime of ${options.lifetime} milliseconds.`,
    details: { events: collected, watchid: options.watchid, lifetime: options.lifetime },
  };
}

/** Watches for cookie and consent banners for the reviewed lifetime and reports their controls. */
async function watchbanners(step: toolstep, root: Document): Promise<stepresult> {
  const options = parsewatchoptions(step, step.id);
  if (options.lifetime <= 0) return { ok: false, summary: "The reviewed banner watch lifetime is absent." };
  const started = Date.now();
  const seen = new Map<string, bannerreport>();
  while (Date.now() - started < options.lifetime) {
    const at = Date.now();
    for (const report of bannermatches(collectbannercandidates(root), at)) {
      if (!seen.has(report.selector)) seen.set(report.selector, report);
    }
    await waitwatch(options.poll);
  }
  const reports = [...seen.values()];
  return {
    ok: true,
    summary: `Watched for consent banners for the reviewed lifetime of ${options.lifetime} milliseconds and observed ${reports.length} banner${reports.length === 1 ? "" : "s"}.`,
    details: { banners: reports, watchid: options.watchid, lifetime: options.lifetime },
  };
}

/** Waits until the network stays quiet for the reviewed idle threshold, sampling in flight requests through the performance timeline. */
async function waitquiet(step: toolstep): Promise<stepresult> {
  const rule = quietruleof(step);
  if (rule.idle <= 0) return { ok: false, summary: "The reviewed quiet idle threshold is absent." };
  const poll = rule.poll ?? 100;
  const timeout = rule.timeout ?? 0;
  const started = performance.now();
  const samples: Array<{ at: number; quietfor: number }> = [];
  for (;;) {
    const now = performance.now();
    const entries = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).map((entry) => ({
      responseend: entry.responseEnd,
    }));
    samples.push({ at: now - started, quietfor: quietfor(entries, now) });
    const latest = samples[samples.length - 1];
    if (latest && latest.quietfor >= rule.idle) break;
    if (timeout > 0 && now - started >= timeout) break;
    await waitwatch(poll);
  }
  const outcome = quietresolution(samples, rule.idle, timeout);
  return {
    ok: outcome.ok,
    summary: outcome.ok
      ? `The network stayed quiet for ${Math.round(outcome.quietfor)} milliseconds, meeting the reviewed idle threshold of ${rule.idle} milliseconds.`
      : `The network did not stay quiet for ${rule.idle} milliseconds${timeout > 0 ? ` within the reviewed timeout of ${timeout} milliseconds` : ""}.`,
    details: { samples, idle: rule.idle, timeout, waited: Math.round(outcome.waited) },
  };
}

function scriptsurfaces(
  target: Element | null,
  root: Document,
): Array<{ src: string; type: string; id: string; content: string }> {
  const elements = target ? [target] : [...root.querySelectorAll("script")];
  return elements.map((element) => ({
    src: element.getAttribute("src") ?? "",
    type: element.getAttribute("type") ?? "",
    id: element.id,
    content: element.textContent ?? "",
  }));
}

/** Extracts embedded json state from inline scripts and refuses malformed payloads. */
function readjson(step: toolstep, target: Element | null, root: Document): stepresult {
  const outcome = scanjson(scriptsurfaces(target, root));
  if (target && outcome.states.length === 0 && outcome.refused > 0)
    return { ok: false, summary: "The reviewed json payload is malformed and was refused." };
  return {
    ok: true,
    summary: `Extracted ${outcome.states.length} embedded json state${outcome.states.length === 1 ? "" : "s"}${outcome.refused > 0 ? ` and refused ${outcome.refused} malformed payload${outcome.refused === 1 ? "" : "s"}` : ""}.`,
    details: { states: outcome.states, refused: outcome.refused },
  };
}

function tonodesummaries(value: unknown): nodesummary[] | null {
  if (!Array.isArray(value)) return null;
  const summaries: nodesummary[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.selector !== "string") continue;
    const attributes: Record<string, string> = {};
    if (candidate.attributes && typeof candidate.attributes === "object" && !Array.isArray(candidate.attributes)) {
      for (const [key, item] of Object.entries(candidate.attributes as Record<string, unknown>))
        if (typeof item === "string") attributes[key] = item;
    }
    summaries.push({
      selector: candidate.selector,
      tag: typeof candidate.tag === "string" ? candidate.tag : "",
      text: typeof candidate.text === "string" ? candidate.text : "",
      attributes,
    });
  }
  return summaries;
}

/** Diffs the two reviewed observation versions injected by the background into added, removed and changed nodes. */
function diffsnapshots(step: toolstep): stepresult {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const base = tonodesummaries(options.base);
  const target = tonodesummaries(options.target);
  if (!base || !target)
    return { ok: false, summary: "Two stored observation versions must be reviewed before diffing." };
  const versions =
    Array.isArray(options.versions) && options.versions.length === 2 ? (options.versions as number[]) : [0, 0];
  const diff = diffsummaries(base, target);
  return {
    ok: true,
    summary: `Diffed observation versions ${versions[0] ?? 0} and ${versions[1] ?? 0}: ${diff.added.length} added, ${diff.removed.length} removed and ${diff.changed.length} changed node${diff.added.length + diff.removed.length + diff.changed.length === 1 ? "" : "s"}.`,
    details: { versions, added: diff.added, removed: diff.removed, changed: diff.changed },
  };
}

/** Derives ranked selector candidates for one reviewed element. */
function deriveselector(target: Element | null): stepresult {
  if (!(target instanceof Element)) return { ok: false, summary: "Derivation target is no longer available." };
  const attributes: Record<string, string> = {};
  for (const attribute of [...target.attributes]) attributes[attribute.name] = attribute.value;
  const parent = target.parentElement;
  const siblings = parent ? [...parent.children].filter((node) => node.tagName === target.tagName) : [target];
  const candidates = rankselectors({
    id: target.id,
    tag: target.tagName.toLowerCase(),
    attributes,
    text: clean(target.textContent ?? "").slice(0, 80),
    index: siblings.indexOf(target) + 1,
    siblings: siblings.length,
  });
  const best = candidates[0];
  return {
    ok: candidates.length > 0,
    summary: best
      ? `Derived ${candidates.length} selector candidate${candidates.length === 1 ? "" : "s"}; the most stable is ${best.selector} through the ${best.strategy} strategy with stability ${best.score}.`
      : "No selector candidate could be derived.",
    details: { candidates },
  };
}

/** Runs one watched observation after the background policy gate; the reviewed lifetime window bounds every watch. */
export function runpagewatch(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  switch (step.kind) {
    case "watchmutate":
      return watchmutations(step, root);
    case "watchfocus":
      return watchfocus(step, root);
    case "watchbanner":
      return watchbanners(step, root);
    case "waitquiet":
      return waitquiet(step);
    case "readjson":
      return readjson(step, target, root);
    case "diffsnapshots":
      return diffsnapshots(step);
    case "deriveselector":
      return deriveselector(target);
    default:
      return { ok: false, summary: "Unsupported watched observation." };
  }
}

/* ── Merged from pagewizards.ts: the 1.1.88 consolidation interns the correlated pagewizards logic here, so no variation of the same file lives beside another. ── */

/**
 * Wizard, dependent control and payment field logics for reviewed steps.
 * Every correlated rule for wizard tracking, dependent option waits, typeahead picks, calendar navigation, card segment typing, one time code sources and submission retry backoff lives in this file.
 */

/** Advances one wizard step, recording the completion signal of the executed step and the new step index. */
export function wizardadvance(state: wizardstate, completed: boolean, at: number): wizardstate {
  const flags = [...state.completed];
  while (flags.length < state.index + 1) flags.push(false);
  flags[state.index] = completed;
  return { ...state, index: Math.min(state.index + 1, state.steps), completed: flags, at };
}

/** True when the dependent child options finished loading after a parent selection changed their count. */
export function dependentloaded(previouscount: number, currentcount: number): boolean {
  return currentcount !== previouscount;
}

/** Picks the reviewed suggestion entry from a typeahead list, case insensitive; undefined when the entry is absent. */
export function typeaheadpick(suggestions: string[], pick: string): string | undefined {
  const needle = pick.trim().toLowerCase();
  return suggestions.find((suggestion) => suggestion.trim().toLowerCase() === needle);
}

/** Parses one reviewed yyyy-mm-dd date into its year, month and day parts; null when the form is invalid. */
export function parsedateparts(value: string): { year: number; month: number; day: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parts = value.split("-").map((part) => Number.parseInt(part, 10));
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 0;
  const day = parts[2] ?? 0;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/** Plans the calendar navigation to the reviewed date: the month delta and the day cell to click. */
export function calendarplan(
  view: { year: number; month: number },
  date: { year: number; month: number; day: number },
): { months: number; day: number } {
  return { months: (date.year - view.year) * 12 + (date.month - view.month), day: date.day };
}

/** Splits one card number into its typed groups so the filler pauses between groups. */
export function cardgroups(number: string): string[] {
  const groups = number
    .replace(/[-\s]+/g, " ")
    .trim()
    .split(" ");
  return groups.filter((group) => group.length > 0);
}

/** True when the reviewed one time code source is ready to deliver the code before typing. */
export function codeready(source: string, value: string | undefined): boolean {
  if (source === "reviewed") return typeof value === "string" && value.trim().length > 0;
  return false;
}

/** One reviewed retry backoff rule with an attempt count, a waitwizards window and a growth factor, all user configured. */
export interface backoffrule {
  attempts: number;
  wait: number;
  factor: number;
}

/** Parses the reviewed backoff rule of a retryform step; null when the step reviews none. */
export function parsebackoff(step: toolstep): backoffrule | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const backoff = options.backoff;
  if (!backoff || typeof backoff !== "object" || Array.isArray(backoff)) return null;
  const rule = backoff as Record<string, unknown>;
  const wait = rule.wait;
  const factor = rule.factor;
  if (typeof wait !== "number" || !Number.isFinite(wait) || wait <= 0) return null;
  if (typeof factor !== "number" || !Number.isFinite(factor) || factor < 1) return null;
  const attempts =
    typeof options.attempts === "number" && Number.isInteger(options.attempts) && options.attempts >= 1
      ? options.attempts
      : 2;
  return { attempts, wait, factor };
}

/** Computes the reviewed backoff windows between submission retries; no code ceiling applies. */
export function backoffwaits(attempts: number, wait: number, factor: number): number[] {
  const windows: number[] = [];
  let current = wait;
  for (let index = 1; index < attempts; index += 1) {
    windows.push(current);
    current *= factor;
  }
  return windows;
}

function waitwizards(delay: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

function pollforwizards(predicate: () => boolean, description: string, timeout: number): Promise<stepresult> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = (): void => {
      if (predicate()) {
        resolve({ ok: true, summary: `${description} is now present on the page.` });
        return;
      }
      if (timeout > 0 && Date.now() - started >= timeout) {
        resolve({ ok: false, summary: `${description} did not appear within ${timeout} milliseconds.` });
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

/** Runs one reviewed wizard or payment field step inside the page, from multi step wizards to card segments and one time codes. */
export function runpagewizard(
  step: toolstep,
  target: Element | null,
  root: Document = document,
): stepresult | Promise<stepresult> {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  switch (step.kind) {
    case "runwizard": {
      const scope = target instanceof HTMLElement ? target : (root.body ?? root.documentElement);
      const steps =
        typeof options.steps === "number" && Number.isInteger(options.steps) && options.steps > 0 ? options.steps : 1;
      const state: wizardstate = { index: 0, steps, completed: [], at: Date.now() };
      const next = scope.querySelector<HTMLElement>("button[type=submit], button[name=next], [data-next]");
      if (!next)
        return {
          ok: false,
          summary: "No next step control was found inside the wizard scope.",
          details: { wizard: state },
        };
      next.click();
      const advanced = wizardadvance(state, true, Date.now());
      return {
        ok: advanced.index >= steps,
        summary: `Wizard advanced to step ${advanced.index + 1} of ${steps}${advanced.index >= steps ? " and completed" : ""}.`,
        details: { wizard: advanced },
      };
    }
    case "selectchain": {
      if (!(target instanceof HTMLSelectElement))
        return { ok: false, summary: "The reviewed parent target is not a select element." };
      const childselector = typeof options.child === "string" ? options.child : "";
      const child = root.querySelector<HTMLSelectElement>(childselector);
      if (!child) return { ok: false, summary: "The reviewed dependent child control was not found." };
      const previouscount = child.options.length;
      const option = [...target.options].find(
        (candidate) => candidate.value === step.value || candidate.textContent?.trim() === step.value,
      );
      if (!option) return { ok: false, summary: "The reviewed parent option is not part of the select element." };
      target.value = option.value;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      const waitwindow = typeof options.wait === "number" && options.wait > 0 ? options.wait : 0;
      return pollforwizards(
        () => dependentloaded(previouscount, child.options.length),
        "Dependent options of the child control",
        waitwindow,
      );
    }
    case "picktypeahead": {
      const field = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
      if (!field) return { ok: false, summary: "The reviewed typeahead target cannot receive text." };
      const pick = typeof options.pick === "string" ? options.pick : "";
      const timeout = typeof options.timeout === "number" && options.timeout > 0 ? options.timeout : 0;
      field.focus();
      field.value = step.value ?? "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
      const list = root.querySelector<HTMLElement>("[role=listbox], .suggestions, ul.autocomplete, [data-typeahead]");
      const suggestions = list
        ? [...list.querySelectorAll<HTMLElement>("[role=option], li, .suggestion")].map((entry) =>
            clean(entry.textContent || ""),
          )
        : [];
      const chosen = typeaheadpick(suggestions, pick);
      if (chosen === undefined)
        return {
          ok: false,
          summary: `The reviewed suggestion "${pick}" is not part of the typeahead list.`,
          details: { suggestions },
        };
      const entry = [...(list?.querySelectorAll<HTMLElement>("[role=option], li, .suggestion") ?? [])].find(
        (item) =>
          clean(item.textContent || "")
            .trim()
            .toLowerCase() === chosen.trim().toLowerCase(),
      );
      entry?.click();
      field.dispatchEvent(new Event("change", { bubbles: true }));
      return {
        ok: Boolean(entry),
        summary: `Picked the reviewed typeahead entry "${chosen}".`,
        details: { pick: chosen, query: step.value ?? "" },
      };
    }
    case "pickdate": {
      const calendar = target instanceof HTMLElement ? target : (root.body ?? root.documentElement);
      const date = parsedateparts(step.value ?? "");
      if (!date) return { ok: false, summary: "The reviewed date must use the yyyy-mm-dd form." };
      const header = clean(
        calendar.querySelector<HTMLElement>("[data-calendar-title], .calendar-title, header")?.textContent || "",
      );
      const match = /(\d{4})/.exec(header);
      const monthnames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const viewyear = match ? Number.parseInt(match[1] ?? "0", 10) : new Date().getFullYear();
      const viewmonth =
        monthnames.findIndex((name) => header.toLowerCase().includes(name)) >= 0
          ? monthnames.findIndex((name) => header.toLowerCase().includes(name))
          : new Date().getMonth() + 1;
      const plan = calendarplan({ year: viewyear, month: viewmonth }, date);
      const forward = plan.months >= 0;
      for (let index = 0; index < Math.abs(plan.months); index += 1) {
        calendar
          .querySelector<HTMLElement>(
            forward
              ? "[data-next-month], .next-month, [aria-label=next]"
              : "[data-prev-month], .prev-month, [aria-label=previous]",
          )
          ?.click();
      }
      const day = [...calendar.querySelectorAll<HTMLElement>("[role=gridcell], [data-day], td")].find(
        (cell) => Number.parseInt(clean(cell.textContent || ""), 10) === plan.day,
      );
      if (!day)
        return { ok: false, summary: `The reviewed day cell ${plan.day} was not found in the calendar widget.` };
      day.click();
      return {
        ok: true,
        summary: `Picked ${step.value} from the calendar widget after ${Math.abs(plan.months)} month navigation${Math.abs(plan.months) === 1 ? "" : "s"}.`,
        details: { months: plan.months, day: plan.day },
      };
    }
    case "fillcard": {
      const segments = Array.isArray(options.segments)
        ? (options.segments as Array<Record<string, unknown>>).filter((item) => item && typeof item === "object")
        : [];
      if (segments.length === 0)
        return { ok: false, summary: "A reviewed non-empty list of card segments is required in options." };
      const pause = typeof options.pause === "number" && options.pause > 0 ? options.pause : 0;
      const filled: Array<{ label: string; masked: string }> = [];
      const failures: string[] = [];
      const fillsegment = async (segment: Record<string, unknown>): Promise<void> => {
        const match = segment.match as Record<string, unknown> | undefined;
        const value = typeof segment.value === "string" ? segment.value : "";
        if (!match || typeof match !== "object") {
          failures.push("segment without a reviewed match");
          return;
        }
        const scope = root.body ?? root.documentElement;
        const candidates = [...scope.querySelectorAll<HTMLInputElement>("input, select")];
        const key =
          match.mode === "label"
            ? "label"
            : match.mode === "placeholder"
              ? "placeholder"
              : match.mode === "arialabel"
                ? "arialabel"
                : "name";
        const needle = String(match[key] ?? "").toLowerCase();
        const element = candidates.find(
          (input) =>
            (key === "label"
              ? input.name.toLowerCase() || input.getAttribute("aria-label")?.toLowerCase() || ""
              : (input.getAttribute(key) ?? input.name).toLowerCase()
            ).includes(needle) || (input.getAttribute("aria-label") ?? "").toLowerCase().includes(needle),
        );
        if (!element) {
          failures.push(`unmatched: ${needle}`);
          return;
        }
        element.focus();
        for (const group of cardgroups(value)) {
          element.value = group;
          element.dispatchEvent(new Event("input", { bubbles: true }));
          if (pause > 0) await waitwizards(pause);
        }
        element.dispatchEvent(new Event("change", { bubbles: true }));
        filled.push({ label: String(match[key] ?? ""), masked: cardmask(value) });
      };
      return (async (): Promise<stepresult> => {
        for (const segment of segments) await fillsegment(segment);
        return {
          ok: failures.length === 0,
          summary:
            failures.length === 0
              ? `Filled ${filled.length} card segment${filled.length === 1 ? "" : "s"} with pauses between card number groups.`
              : `Filled ${filled.length} of ${segments.length} card segments; ${failures.join("; ")}.`,
          details: { segments: filled, failures, pause },
        };
      })();
    }
    case "fillcode": {
      const field = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
      if (!field) return { ok: false, summary: "The reviewed one time code target cannot receive text." };
      const source = typeof options.source === "string" ? options.source : "";
      const timeout = typeof options.timeout === "number" && options.timeout > 0 ? options.timeout : 0;
      const code = step.value ?? "";
      return pollforwizards(() => codeready(source, code), "The reviewed one time code source", timeout).then(
        (result) => {
          if (!codeready(source, code))
            return { ok: false, summary: `The reviewed code source ${source} is not ready to deliver the code yet.` };
          field.focus();
          field.value = code;
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
          return { ok: true, summary: `One time code typed from the reviewed source ${source}.`, details: { source } };
        },
      );
    }
    default:
      return { ok: false, summary: "Unsupported wizard action." };
  }
}

/* ── Merged from pagexpath.ts: the 1.1.88 consolidation interns the correlated pagexpath logic here, so no variation of the same file lives beside another. ── */
/**
 * Xpath resolution subset for reviewed steps.
 * Every correlated rule for expression parsing, node trees and evaluation of the supported xpath grammar lives in this file.
 * The engine supports absolute and descendant steps, tag or wildcard names, attribute predicates, text predicates and positional predicates.
 */

/** Serializable dom node used by the xpath engine; the live glue attaches the element. */
export interface xnode {
  tag: string;
  attributes: Record<string, string>;
  text: string;
  children: xnode[];
  element?: Element;
}

type xpathpredicate =
  | { kind: "attr"; name: string; value?: string; contains?: boolean }
  | { kind: "text"; value: string; contains?: boolean }
  | { kind: "position"; index: number };

interface xpathstep {
  descendant: boolean;
  tag: string;
  predicates: xpathpredicate[];
}

function owntextxpath(element: Element): string {
  let combined = "";
  for (const node of element.childNodes) if (node.nodeType === Node.TEXT_NODE) combined += node.textContent ?? "";
  return combined.replace(/\s+/g, " ").trim();
}

function attributesof(element: Element): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const attribute of [...element.attributes]) attributes[attribute.name] = attribute.value;
  return attributes;
}

function wrapxpath(element: Element): xnode {
  return {
    tag: element.tagName.toLowerCase(),
    attributes: attributesof(element),
    text: owntextxpath(element),
    children: [...element.children].map(wrapxpath),
    element,
  };
}

/** Builds the serializable node tree of one live document for the xpath engine. */
export function buildxtree(root: Document): xnode {
  return {
    tag: "#document",
    attributes: {},
    text: "",
    children: root.documentElement ? [wrapxpath(root.documentElement)] : [],
  };
}

/** Parses one predicate body into the supported predicate shapes. */
function parsepredicate(raw: string): xpathpredicate | null {
  const body = raw.trim();
  let match = /^@([\w-]+)$/.exec(body);
  if (match) return { kind: "attr", name: match[1] as string };
  match = /^@([\w-]+)\s*=\s*['"]([^'"]*)['"]$/.exec(body);
  if (match) return { kind: "attr", name: match[1] as string, value: match[2] as string };
  match = /^contains\(\s*@([\w-]+)\s*,\s*['"]([^'"]*)['"]\s*\)$/.exec(body);
  if (match) return { kind: "attr", name: match[1] as string, value: match[2] as string, contains: true };
  match = /^text\(\)\s*=\s*['"]([^'"]*)['"]$/.exec(body);
  if (match) return { kind: "text", value: match[1] as string };
  match = /^contains\(\s*text\(\)\s*,\s*['"]([^'"]*)['"]\s*\)$/.exec(body);
  if (match) return { kind: "text", value: match[1] as string, contains: true };
  match = /^(\d+)$/.exec(body);
  if (match) return { kind: "position", index: Number.parseInt(match[1] as string, 10) };
  return null;
}

/** Parses the reviewed xpath expression into evaluation steps; unsupported syntax is refused. */
export function parsexpath(expression: string): xpathstep[] {
  const trimmed = expression.trim();
  if (!trimmed.startsWith("/")) throw new Error("The reviewed xpath expression must start with a slash.");
  const steps: xpathstep[] = [];
  let index = 0;
  while (index < trimmed.length) {
    if (trimmed[index] !== "/") throw new Error("The reviewed xpath expression contains an unsupported segment.");
    let slashes = 0;
    while (index < trimmed.length && trimmed[index] === "/") {
      slashes += 1;
      index += 1;
    }
    const start = index;
    let quote = "";
    while (index < trimmed.length) {
      const character = trimmed[index];
      if (quote) {
        if (character === quote) quote = "";
      } else if (character === "'" || character === '"') quote = character;
      else if (character === "/") break;
      index += 1;
    }
    const body = trimmed.slice(start, index);
    if (!body) throw new Error("The reviewed xpath expression contains an empty step.");
    const parsed = /^(\*|[a-zA-Z][\w-]*)((?:\[[^\]]*\])*)$/.exec(body);
    if (!parsed) throw new Error(`The reviewed xpath step ${body} is not supported.`);
    const predicates: xpathpredicate[] = [];
    const pattern = /\[([^\]]*)\]/g;
    let predicate: RegExpExecArray | null;
    while ((predicate = pattern.exec(parsed[2] ?? "")) !== null) {
      const parsedpredicate = parsepredicate(predicate[1] as string);
      if (!parsedpredicate) throw new Error(`The reviewed xpath predicate [${predicate[1]}] is not supported.`);
      predicates.push(parsedpredicate);
    }
    steps.push({ descendant: slashes > 1, tag: (parsed[1] as string).toLowerCase(), predicates });
  }
  return steps;
}

function descendants(node: xnode, includeself: boolean): xnode[] {
  const result: xnode[] = includeself ? [node] : [];
  for (const child of node.children) {
    result.push(child);
    result.push(...descendants(child, false));
  }
  return result;
}

function applypredicates(nodes: xnode[], predicates: xpathpredicate[]): xnode[] {
  let result = nodes;
  for (const predicate of predicates) {
    if (predicate.kind === "position") {
      const entry = result[predicate.index - 1];
      result = entry ? [entry] : [];
      continue;
    }
    result = result.filter((node) => {
      if (predicate.kind === "attr") {
        const value = node.attributes[predicate.name];
        if (value === undefined) return false;
        if (predicate.value === undefined) return true;
        return predicate.contains ? value.includes(predicate.value) : value === predicate.value;
      }
      return predicate.contains ? node.text.includes(predicate.value) : node.text === predicate.value;
    });
  }
  return result;
}

/** Evaluates the supported xpath subset against a serializable node tree and returns every matched node in document order. */
export function evaluatexpath(root: xnode, expression: string): xnode[] {
  const steps = parsexpath(expression);
  let current: xnode[] = [root];
  let first = true;
  for (const step of steps) {
    let matched: xnode[] = [];
    for (const node of current) {
      const pool = step.descendant ? descendants(node, first) : node.children;
      matched = matched.concat(pool.filter((candidate) => candidate.tag === step.tag || step.tag === "*"));
    }
    current = applypredicates(matched, step.predicates);
    first = false;
  }
  return current;
}
