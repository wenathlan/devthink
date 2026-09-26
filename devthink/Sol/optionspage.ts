export {};

/**
 * Optionspage runtime of the 1.1.64 family.
 * The optionspage gathers every setting into one page with sections: the onboarding replay, the commandpalette recent window and shortcut, the logstream live buffer bound, the taskinput history retention, the diffpreview offscreen offload ceiling and the session interface options of the 1.1.63 family, while the transparency, consent and security sections of the earlier releases import through the embedded transparencypage; every write takes effect without reloading the extension because the background reads its settings live on each decision. The 2.0.2 final polish adds the contrast preference of the rc.2 high contrast theme: the toggle persists through the surface layout seam and resolves the high contrast token set over the --theme-* custom properties the darklight family already writes.
 */

import { applycontrasttheme, contrasttokensof } from "../views.js";

const statusnode = document.querySelector<HTMLElement>("#status");
const onboardingroot = document.querySelector<HTMLElement>("#onboarding");
const paletterecentsinput = document.querySelector<HTMLInputElement>("#paletterecents");
const paletteshortcutinput = document.querySelector<HTMLInputElement>("#paletteshortcut");
const logstreambufferinput = document.querySelector<HTMLInputElement>("#logstreambuffer");
const taskinputretentioninput = document.querySelector<HTMLInputElement>("#taskinputretention");
const diffpreviewbytesinput = document.querySelector<HTMLInputElement>("#diffpreviewbytes");
const recallwindowinput = document.querySelector<HTMLInputElement>("#recallwindow");
const noteretentioninput = document.querySelector<HTMLInputElement>("#noteretention");
const summarywindowinput = document.querySelector<HTMLInputElement>("#summarywindow");

function status(message: string, error = false): void { if (statusnode) { statusnode.textContent = message; statusnode.dataset.state = error ? "error" : "ready"; } }
async function request(message: unknown): Promise<unknown> { const response = await chrome.runtime.sendMessage(message) as { ok: boolean; value?: unknown; error?: string }; if (!response.ok) throw new Error(response.error); return response.value; }

type surfacecontext = { sessionpreferences?: { recallwindow?: number; noteretention?: number; summarywindow?: number }; surfacepreferences?: { paletterecents?: number; paletteshortcut?: string; logstreambuffer?: number; taskinputretention?: number; diffpreviewbytes?: number }; perfpreferences?: { prewarmset?: string[]; lazybudget?: number; debouncewindows?: Partial<Record<"scroll" | "input" | "resize" | "mutation", number>>; snapshotcadence?: number; workerdepth?: number; perfretention?: number; virtlistrows?: number; capturepriority?: "speed" | "evidence"; batchwindow?: number; domainlimits?: Record<string, number>; politedelay?: number; politejitter?: number; pollgrowth?: number; stepbudget?: number; memorybudget?: number; budgetthresholds?: { warning?: number; critical?: number }; timeoutbound?: number; suspendwindow?: number; startuptarget?: number; selectorlatency?: number; slowmofactor?: number; runcachepin?: boolean; logpruneretention?: number; logsizewindow?: number; artifactcodec?: "deflate" | "store"; batteryfloor?: number; netbackoff?: Record<string, number>; readlanes?: number; cadencewidening?: number } };

/** Loads the stored surface options into the inputs; an absent value keeps the placeholder that names the documented default. */
async function load(): Promise<void> {
  try {
    const context = await request({ kind: "context" }) as surfacecontext;
    const preferences = context.surfacepreferences ?? {};
    const session = context.sessionpreferences ?? {};
    if (preferences.paletterecents !== undefined && paletterecentsinput) paletterecentsinput.value = String(preferences.paletterecents);
    if (preferences.paletteshortcut !== undefined && paletteshortcutinput) paletteshortcutinput.value = preferences.paletteshortcut;
    if (preferences.logstreambuffer !== undefined && logstreambufferinput) logstreambufferinput.value = String(preferences.logstreambuffer);
    if (preferences.taskinputretention !== undefined && taskinputretentioninput) taskinputretentioninput.value = String(preferences.taskinputretention);
    if (preferences.diffpreviewbytes !== undefined && diffpreviewbytesinput) diffpreviewbytesinput.value = String(preferences.diffpreviewbytes);
    if (session.recallwindow !== undefined && recallwindowinput) recallwindowinput.value = String(session.recallwindow);
    if (session.noteretention !== undefined && noteretentioninput) noteretentioninput.value = String(session.noteretention);
    if (session.summarywindow !== undefined && summarywindowinput) summarywindowinput.value = String(session.summarywindow);
    await loadperf();
    status("The surface options loaded; every write takes effect without reloading the extension.");
  } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
}

/** Writes the commandpalette options; the recent window and the shortcut stay user choices with no engine defaults forced. */
async function savepalette(): Promise<void> {
  const paletterecents = paletterecentsinput?.value.trim() ?? "";
  const paletteshortcut = paletteshortcutinput?.value.trim() ?? "";
  await request({ kind: "surface", settings: { ...(paletterecents !== "" ? { paletterecents: Number(paletterecents) } : {}), ...(paletteshortcut !== "" ? { paletteshortcut } : {}) } });
  status(`The palette options saved${paletterecents !== "" ? ` with the recent window of ${paletterecents}` : ""}${paletteshortcut !== "" ? ` and the shortcut ${paletteshortcut}` : ""}.`);
}

/** Writes the logstream live buffer bound; the full history stays in memory whatever the bound. */
async function savelogstream(): Promise<void> {
  const bound = logstreambufferinput?.value.trim() ?? "";
  await request({ kind: "surface", settings: { ...(bound !== "" ? { logstreambuffer: Number(bound) } : {}) } });
  status(bound === "" ? "No bound configured; the live window keeps every event." : `The logstream live buffer bound of ${bound} saved; the full history stays in memory.`);
}

/** Writes the taskinput history retention. */
async function savetaskinput(): Promise<void> {
  const retention = taskinputretentioninput?.value.trim() ?? "";
  await request({ kind: "surface", settings: { ...(retention !== "" ? { taskinputretention: Number(retention) } : {}) } });
  status(retention === "" ? "No retention configured; the taskinput history keeps every entry." : `The taskinput history retention of ${retention} milliseconds saved.`);
}

/** Writes the diffpreview offscreen offload byte ceiling. */
async function savediff(): Promise<void> {
  const bytes = diffpreviewbytesinput?.value.trim() ?? "";
  await request({ kind: "surface", settings: { ...(bytes !== "" ? { diffpreviewbytes: Number(bytes) } : {}) } });
  status(bytes === "" ? "No ceiling configured; every diff stays inline." : `The diffpreview offload ceiling of ${bytes} bytes saved.`);
}

/** Writes the session interface options of the 1.1.63 family through the sessions settings seam. */
async function savesession(): Promise<void> {
  const recallwindow = recallwindowinput?.value.trim() ?? "";
  const noteretention = noteretentioninput?.value.trim() ?? "";
  const summarywindow = summarywindowinput?.value.trim() ?? "";
  await request({ kind: "sessions", settings: { ...(recallwindow !== "" ? { recallwindow: Number(recallwindow) } : {}), ...(noteretention !== "" ? { noteretention: Number(noteretention) } : {}), ...(summarywindow !== "" ? { summarywindow: Number(summarywindow) } : {}) } });
  status("The session interface options saved; the recall window, the note retention and the summary window take effect at once.");
}

/** Loads the 1.1.68 performance options: the incrsnapshot cadence, the debouncedom windows per event kind, the worker queue depth, the lazymods prewarm set, the startup module budget, the perf retention, the virtlist row window and the capture priority, every one a user choice with no engine default. */
async function loadperf(): Promise<void> {
  const perf = ((await request({ kind: "context" }) as surfacecontext).perfpreferences) ?? {};
  if (perf.snapshotcadence !== undefined && document.querySelector<HTMLInputElement>("#snapshotcadence")) document.querySelector<HTMLInputElement>("#snapshotcadence")!.value = String(perf.snapshotcadence);
  if (perf.debouncewindows?.scroll !== undefined && document.querySelector<HTMLInputElement>("#debouncescroll")) document.querySelector<HTMLInputElement>("#debouncescroll")!.value = String(perf.debouncewindows.scroll);
  if (perf.debouncewindows?.input !== undefined && document.querySelector<HTMLInputElement>("#debounceinput")) document.querySelector<HTMLInputElement>("#debounceinput")!.value = String(perf.debouncewindows.input);
  if (perf.debouncewindows?.resize !== undefined && document.querySelector<HTMLInputElement>("#debouncerresize")) document.querySelector<HTMLInputElement>("#debouncerresize")!.value = String(perf.debouncewindows.resize);
  if (perf.debouncewindows?.mutation !== undefined && document.querySelector<HTMLInputElement>("#debouncemutation")) document.querySelector<HTMLInputElement>("#debouncemutation")!.value = String(perf.debouncewindows.mutation);
  if (perf.workerdepth !== undefined && document.querySelector<HTMLInputElement>("#workerdepth")) document.querySelector<HTMLInputElement>("#workerdepth")!.value = String(perf.workerdepth);
  if (perf.prewarmset !== undefined && document.querySelector<HTMLInputElement>("#prewarmset")) document.querySelector<HTMLInputElement>("#prewarmset")!.value = perf.prewarmset.join(",");
  if (perf.lazybudget !== undefined && document.querySelector<HTMLInputElement>("#lazybudget")) document.querySelector<HTMLInputElement>("#lazybudget")!.value = String(perf.lazybudget);
  if (perf.perfretention !== undefined && document.querySelector<HTMLInputElement>("#perfretention")) document.querySelector<HTMLInputElement>("#perfretention")!.value = String(perf.perfretention);
  if (perf.virtlistrows !== undefined && document.querySelector<HTMLInputElement>("#virtlistrows")) document.querySelector<HTMLInputElement>("#virtlistrows")!.value = String(perf.virtlistrows);
  if (perf.capturepriority !== undefined && document.querySelector<HTMLSelectElement>("#capturepriority")) document.querySelector<HTMLSelectElement>("#capturepriority")!.value = perf.capturepriority;
  const schedulefields: Array<[keyof typeof perf, string]> = [["batchwindow", "#batchwindow"], ["politedelay", "#politedelay"], ["politejitter", "#politejitter"], ["pollgrowth", "#pollgrowth"], ["stepbudget", "#stepbudget"], ["memorybudget", "#memorybudget"], ["timeoutbound", "#timeoutbound"], ["suspendwindow", "#suspendwindow"], ["startuptarget", "#startuptarget"], ["selectorlatency", "#selectorlatency"], ["slowmofactor", "#slowmofactor"], ["logpruneretention", "#logpruneretention"], ["logsizewindow", "#logsizewindow"], ["batteryfloor", "#batteryfloor"], ["readlanes", "#readlanes"], ["cadencewidening", "#cadencewidening"]];
  for (const [field, id] of schedulefields) {
    const value = perf[field];
    if (typeof value === "number" && document.querySelector<HTMLInputElement>(id)) document.querySelector<HTMLInputElement>(id)!.value = String(value);
  }
  if (perf.domainlimits !== undefined && document.querySelector<HTMLInputElement>("#domainlimits")) document.querySelector<HTMLInputElement>("#domainlimits")!.value = Object.entries(perf.domainlimits).map(([domain, slots]) => `${domain}=${slots}`).join(",");
  if (perf.budgetthresholds?.warning !== undefined && document.querySelector<HTMLInputElement>("#budgetwarning")) document.querySelector<HTMLInputElement>("#budgetwarning")!.value = String(perf.budgetthresholds.warning);
  if (perf.budgetthresholds?.critical !== undefined && document.querySelector<HTMLInputElement>("#budgetcritical")) document.querySelector<HTMLInputElement>("#budgetcritical")!.value = String(perf.budgetthresholds.critical);
  if (perf.artifactcodec !== undefined && document.querySelector<HTMLSelectElement>("#artifactcodec")) document.querySelector<HTMLSelectElement>("#artifactcodec")!.value = perf.artifactcodec;
  if (document.querySelector<HTMLInputElement>("#runcachepin")) document.querySelector<HTMLInputElement>("#runcachepin")!.checked = perf.runcachepin === true;
  await renderstartupbudget();
}

/** Renders the startup module budget view: the prewarmed modules, the lazy rest and the budget the user configured, reported without ever refusing a load. */
async function renderstartupbudget(): Promise<void> {
  const budgetnode = document.querySelector<HTMLElement>("#startupbudget");
  if (!budgetnode) return;
  try {
    const view = await request({ kind: "perf", lazy: { list: true } }) as { budget: { prewarmed: string[]; lazy: string[]; total: number; budget?: number; over: boolean }; cost: { startupmodules: number; lazy: number; note: string } };
    budgetnode.textContent = `Startup budget: ${view.budget.prewarmed.length} prewarmed module${view.budget.prewarmed.length === 1 ? "" : "s"} of ${view.budget.total}${view.budget.prewarmed.length > 0 ? ` (${view.budget.prewarmed.join(", ")})` : ""} · ${view.budget.lazy.length} lazy module${view.budget.lazy.length === 1 ? "" : "s"} out of the startup path${view.budget.budget !== undefined ? ` · user budget ${view.budget.budget}${view.budget.over ? " (over, reported never refused)" : ""}` : " · no budget set"} — ${view.cost.note}`;
  } catch { budgetnode.textContent = "The startup module budget loads with the lazy module catalog."; }
}

/** Saves the 1.1.68 performance options through the perf settings command; every window, depth, cadence and budget stays the user's choice. */
async function saveperf(): Promise<void> {
  const numberof = (id: string): number | undefined => { const raw = document.querySelector<HTMLInputElement>(id)?.value.trim() ?? ""; return raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };
  const windows: Record<string, number> = {};
  for (const [id, kind] of [["#debouncescroll", "scroll"], ["#debounceinput", "input"], ["#debouncerresize", "resize"], ["#debouncemutation", "mutation"]] as const) {
    const window = numberof(id);
    if (window !== undefined) windows[kind] = window;
  }
  const prewarmraw = document.querySelector<HTMLInputElement>("#prewarmset")?.value.trim() ?? "";
  const prewarmset = prewarmraw === "" ? undefined : prewarmraw.split(",").map(id => id.trim()).filter(id => id !== "");
  const priority = document.querySelector<HTMLSelectElement>("#capturepriority")?.value ?? "";
  await request({ kind: "perf", settings: { ...(windows !== undefined && Object.keys(windows).length > 0 ? { debouncewindows: windows } : {}), ...(prewarmset !== undefined ? { prewarmset } : {}), ...(numberof("#snapshotcadence") !== undefined ? { snapshotcadence: numberof("#snapshotcadence") } : {}), ...(numberof("#workerdepth") !== undefined ? { workerdepth: numberof("#workerdepth") } : {}), ...(numberof("#lazybudget") !== undefined ? { lazybudget: numberof("#lazybudget") } : {}), ...(numberof("#perfretention") !== undefined ? { perfretention: numberof("#perfretention") } : {}), ...(numberof("#virtlistrows") !== undefined ? { virtlistrows: numberof("#virtlistrows") } : {}), ...(priority === "speed" ? { capturepriority: "speed" } : {}) } });
  status("The performance options saved; the cadence, the windows, the depth, the prewarm set and the budget take effect at once.");
  await renderstartupbudget();
}

/** Saves the 1.1.69 scheduling and budget options through the schedule settings command: the batch backpressure window, the domain limits, the politedelay windows, the adaptivepoll growth, the step and memory budgets with their alert thresholds, the timeout bound, the suspend window, the cold start target, the selector latency threshold, the slowmo default factor, the runcache pin, the logprune windows, the artifact codec, the battery floor, the read lane ceiling and the cadence widening factor, every one a user choice that optimizes and never caps. */
async function saveschedule(): Promise<void> {
  const numberof = (id: string): number | undefined => { const raw = document.querySelector<HTMLInputElement>(id)?.value.trim() ?? ""; return raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };
  const domainlimits: Record<string, number> = {};
  const domainraw = document.querySelector<HTMLInputElement>("#domainlimits")?.value.trim() ?? "";
  for (const entry of domainraw.split(",").map(part => part.trim()).filter(part => part !== "")) {
    const [domain, slots] = entry.split("=").map(part => part.trim());
    if (domain !== undefined && domain !== "" && slots !== undefined && Number.isFinite(Number(slots)) && Number(slots) > 0) domainlimits[domain] = Number(slots);
  }
  const warning = numberof("#budgetwarning");
  const critical = numberof("#budgetcritical");
  const codec = document.querySelector<HTMLSelectElement>("#artifactcodec")?.value ?? "";
  await request({ kind: "schedule", settings: { ...(numberof("#batchwindow") !== undefined ? { batchwindow: numberof("#batchwindow") } : {}), ...(Object.keys(domainlimits).length > 0 ? { domainlimits } : {}), ...(numberof("#politedelay") !== undefined ? { politedelay: numberof("#politedelay") } : {}), ...(numberof("#politejitter") !== undefined ? { politejitter: numberof("#politejitter") } : {}), ...(numberof("#pollgrowth") !== undefined ? { pollgrowth: numberof("#pollgrowth") } : {}), ...(numberof("#stepbudget") !== undefined ? { stepbudget: numberof("#stepbudget") } : {}), ...(numberof("#memorybudget") !== undefined ? { memorybudget: numberof("#memorybudget") } : {}), ...(warning !== undefined || critical !== undefined ? { budgetthresholds: { ...(warning !== undefined ? { warning } : {}), ...(critical !== undefined ? { critical } : {}) } } : {}), ...(numberof("#timeoutbound") !== undefined ? { timeoutbound: numberof("#timeoutbound") } : {}), ...(numberof("#suspendwindow") !== undefined ? { suspendwindow: numberof("#suspendwindow") } : {}), ...(numberof("#startuptarget") !== undefined ? { startuptarget: numberof("#startuptarget") } : {}), ...(numberof("#selectorlatency") !== undefined ? { selectorlatency: numberof("#selectorlatency") } : {}), ...(numberof("#slowmofactor") !== undefined ? { slowmofactor: numberof("#slowmofactor") } : {}), ...(document.querySelector<HTMLInputElement>("#runcachepin")?.checked === true ? { runcachepin: true } : { runcachepin: false }), ...(numberof("#logpruneretention") !== undefined ? { logpruneretention: numberof("#logpruneretention") } : {}), ...(numberof("#logsizewindow") !== undefined ? { logsizewindow: numberof("#logsizewindow") } : {}), ...(codec === "deflate" ? { artifactcodec: "deflate" } : { artifactcodec: "store" }), ...(numberof("#batteryfloor") !== undefined ? { batteryfloor: numberof("#batteryfloor") } : {}), ...(numberof("#readlanes") !== undefined ? { readlanes: numberof("#readlanes") } : {}), ...(numberof("#cadencewidening") !== undefined ? { cadencewidening: numberof("#cadencewidening") } : {}) } });
  status("The scheduling and budget options saved; the windows, the limits, the delays, the budgets and the slowmo default factor take effect at once and none ever caps the work.");
}

/** Renders the onboarding state and replays the walkthrough on demand. */
async function renderonboarding(): Promise<void> {
  if (!onboardingroot) return;
  try {
    const result = await request({ kind: "surface", onboarding: {} }) as { steps: Array<{ id: string; title: string; body: string; surface: string }>; state?: { stepscompleted: string[]; done: boolean } };
    onboardingroot.replaceChildren();
    const state = result.state;
    const line = document.createElement("p");
    line.textContent = state === undefined ? "The onboarding walkthrough never ran; it starts on the next popup open." : state.done ? `The walkthrough is done (${state.stepscompleted.length} steps); the replay restarts it on demand and writes no second consent event.` : `The walkthrough stands at ${state.stepscompleted.length} of ${result.steps.length} steps.`;
    onboardingroot.append(line);
    const list = document.createElement("ol");
    list.className = "audit";
    for (const step of result.steps) list.append(Object.assign(document.createElement("li"), { textContent: `${step.title} (${step.surface}): ${step.body}${state?.stepscompleted.includes(step.id) ? " — done" : ""}` }));
    onboardingroot.append(list);
  } catch (error) { onboardingroot.textContent = error instanceof Error ? error.message : String(error); }
}

document.querySelector<HTMLButtonElement>("#replayonboarding")?.addEventListener("click", () => { void (async () => { await request({ kind: "surface", onboarding: { replay: true } }); status("The onboarding walkthrough replays; it opens on the next popup open."); await renderonboarding(); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#palettesettings")?.addEventListener("click", () => { void savepalette().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#logstreamsettings")?.addEventListener("click", () => { void savelogstream().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#taskinputsettings")?.addEventListener("click", () => { void savetaskinput().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#diffsettings")?.addEventListener("click", () => { void savediff().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#sessionsettings")?.addEventListener("click", () => { void savesession().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

/** The optionspage sees settings changes through the single broadcast channel so two open pages never drift. */
const surfacechannel: BroadcastChannel | undefined = typeof BroadcastChannel === "function" ? new BroadcastChannel("devthinksurfaces") : undefined;
surfacechannel?.addEventListener("message", (event: MessageEvent) => { const frame = event.data as { channel?: string }; if (frame?.channel === "settings") { void load().catch(() => { /* a failing reload keeps the last loaded options */ }); } });

void load();
void renderonboarding();

/**
 * Interface finishing options of the 1.1.65 family: the darklight theme preference with its manual override, the interface language of the locale bundles, the recenttray depth, the step toast live count, the notification consent and preference, the user editable shortcutkeys, the importexport bundles with their dropimport zone and the featuretour replay with the guidedtip recall.
 */
const themepreferenceselect = document.querySelector<HTMLSelectElement>("#themepreference");
const contrastpreferenceselect = document.querySelector<HTMLSelectElement>("#contrastpreference");
const uilanguageselect = document.querySelector<HTMLSelectElement>("#uilanguage");
const recenttraydepthinput = document.querySelector<HTMLInputElement>("#recenttraydepth");
const toastlivecountinput = document.querySelector<HTMLInputElement>("#toastlivecount");
const notifyconsentinput = document.querySelector<HTMLInputElement>("#notifyconsent");
const notifyenabledinput = document.querySelector<HTMLInputElement>("#notifyenabled");
const shortcutlistnode = document.querySelector<HTMLElement>("#shortcutlist");
const shortcuteditinput = document.querySelector<HTMLInputElement>("#shortcutedit");
const bundlenode = document.querySelector<HTMLElement>("#bundlestatus");
const dropzonenode = document.querySelector<HTMLElement>("#dropzone");
const tourstopsnode = document.querySelector<HTMLElement>("#tourstops");

type finishingcontext = { surfacepreferences?: { recenttraydepth?: number; notifyconsent?: boolean; notifyenabled?: boolean; themepreference?: string; uilanguage?: string; toastlivecount?: number } };

/** The surfaces the contrast preference covers: the optionspage owns the toggle while the sidepanel and the dashboardpage render the themed panels, so the preference persists into every one of their layout preference records. */
const contrastsurfaces = ["optionspage", "sidepanel", "dashboardpage"] as const;

/** Reads the persisted contrast preference through the surface layout seam. */
async function contrastpreferenceof(): Promise<"default" | "high"> {
  try {
    const layout = await request({ kind: "surface", layout: { get: { surface: "optionspage" } } }) as { layout?: { preferences?: { contrastpreference?: string } } };
    return layout.layout?.preferences?.contrastpreference === "high" ? "high" : "default";
  } catch { return "default"; /* an unreadable preference keeps the default contrast */ }
}

/** Persists the contrast preference through the surface layout seam: the toggle writes the preference into the layout record of every themed surface, merging into the preferences each surface already stores. */
async function savecontrastpreference(contrast: "default" | "high"): Promise<void> {
  for (const surface of contrastsurfaces) {
    const layout = await request({ kind: "surface", layout: { get: { surface } } }) as { layout?: { preferences?: Record<string, string> } };
    const preferences = { ...(layout.layout?.preferences ?? {}), contrastpreference: contrast };
    await request({ kind: "surface", layout: { set: { surface, preferences } } });
  }
  status(contrast === "high" ? "The high contrast preference saved for every themed surface; each surface resolves the high contrast token set on its next open." : "The default contrast preference saved; every themed surface keeps its shipped tokens.");
}

/** Loads the finishing options beside the surface options. */
async function loadfinishing(): Promise<void> {
  try {
    const context = await request({ kind: "context" }) as finishingcontext;
    const preferences = context.surfacepreferences ?? {};
    if (preferences.themepreference !== undefined && themepreferenceselect) themepreferenceselect.value = preferences.themepreference;
    if (preferences.uilanguage !== undefined && uilanguageselect) uilanguageselect.value = preferences.uilanguage;
    if (preferences.recenttraydepth !== undefined && recenttraydepthinput) recenttraydepthinput.value = String(preferences.recenttraydepth);
    if (preferences.toastlivecount !== undefined && toastlivecountinput) toastlivecountinput.value = String(preferences.toastlivecount);
    if (notifyconsentinput) notifyconsentinput.checked = preferences.notifyconsent === true;
    if (notifyenabledinput) notifyenabledinput.checked = preferences.notifyenabled !== false;
    if (contrastpreferenceselect) contrastpreferenceselect.value = await contrastpreferenceof();
  } catch (error) { status(error instanceof Error ? error.message : String(error), true); }
}

/** Saves the finishing options: the theme preference, the contrast preference, the language, the tray depth, the toast live count and the notification consent and preference. */
async function savefinishing(): Promise<void> {
  const themepreference = themepreferenceselect?.value ?? "";
  const contrast = contrastpreferenceselect?.value === "high" ? "high" : "default";
  const uilanguage = uilanguageselect?.value ?? "";
  const recenttraydepth = recenttraydepthinput?.value.trim() ?? "";
  const toastlivecount = toastlivecountinput?.value.trim() ?? "";
  await request({ kind: "views", settings: { ...(themepreference !== "" ? { themepreference } : {}), ...(uilanguage !== "" ? { uilanguage } : {}), ...(recenttraydepth !== "" ? { recenttraydepth: Number(recenttraydepth) } : {}), ...(toastlivecount !== "" ? { toastlivecount: Number(toastlivecount) } : {}), notifyconsent: notifyconsentinput?.checked === true, notifyenabled: notifyenabledinput?.checked === true } });
  await savecontrastpreference(contrast);
  await applythemelive();
  status("The interface finishing options saved; the theme, the contrast, the language, the tray depth and the toast live count take effect at once.");
}

/** Resolves and applies the darklight tokens with their contrast variant on the live document so the theme covers the optionspage too: the contrast preference of the 2.0.2 final polish resolves the high contrast token set of the resolved mode and writes it through the same --theme-* custom properties while the body carries its data-contrast marker. */
async function applythemelive(): Promise<void> {
  try {
    const result = await request({ kind: "views", theme: { resolve: true, preference: themepreferenceselect?.value ?? "" } }) as { appearance: { mode: "dark" | "light"; tokens: Record<string, string>; source: string } };
    const contrast = contrastpreferenceselect?.value === "high" ? "high" : "default";
    const tokens = contrast === "high" ? contrasttokensof({ mode: result.appearance.mode, contrast }) : { mode: result.appearance.mode, tokens: result.appearance.tokens };
    applycontrasttheme(document.documentElement, document.body, tokens, contrast);
  } catch { /* a failing theme read keeps the shipped light theme */ }
}

/** Renders the user editable shortcutkeys bindings with their display text. */
async function rendershortcuts(): Promise<void> {
  if (!shortcutlistnode) return;
  try {
    const result = await request({ kind: "views", shortcut: { list: true } }) as { bindings?: Array<{ command: string; key: string; modifiers: string[]; display?: string }> };
    shortcutlistnode.replaceChildren();
    const list = document.createElement("ul");
    list.className = "audit";
    for (const binding of result.bindings ?? []) {
      const combination = [...binding.modifiers, binding.key].join("+");
      list.append(Object.assign(document.createElement("li"), { textContent: `${binding.command}: ${binding.display ?? combination}` }));
    }
    shortcutlistnode.append(list);
  } catch (error) { shortcutlistnode.textContent = error instanceof Error ? error.message : String(error); }
}

/** Saves one edited shortcut binding from its "command: combination" text. */
async function saveshortcut(): Promise<void> {
  const text = shortcuteditinput?.value.trim() ?? "";
  const split = text.split(":");
  const command = split[0]?.trim() ?? "";
  const combination = split.slice(1).join(":").trim();
  if (command === "" || combination === "") { status("The shortcut edit needs its command and its combination, such as pauserun: alt+q.", true); return; }
  await request({ kind: "views", shortcut: { edit: { command, text: combination } } });
  status(`The ${command} shortcut now binds ${combination}; the command keeps its palette gates.`);
  await rendershortcuts();
}

/** Renders the featuretour stops so the replay walkthrough reads its route first. */
async function rendertourstops(): Promise<void> {
  if (!tourstopsnode) return;
  try {
    const result = await request({ kind: "views", tour: { stops: true } }) as { stops?: Array<{ id: string; surface: string; title: string; body: string }> };
    tourstopsnode.replaceChildren();
    const list = document.createElement("ol");
    list.className = "audit";
    for (const stop of result.stops ?? []) list.append(Object.assign(document.createElement("li"), { textContent: `${stop.title} (${stop.surface}): ${stop.body}` }));
    tourstopsnode.append(list);
  } catch (error) { tourstopsnode.textContent = error instanceof Error ? error.message : String(error); }
}

/** Exports the settings bundle and renders its honest exclusion list. */
async function exportbundle(): Promise<void> {
  const result = await request({ kind: "views", importexport: { export: true } }) as { payload: { profile: string; exclusions: string[]; contents: { originprofiles: unknown[]; siteprofiles: unknown[]; notes: unknown[] } } };
  if (bundlenode) bundlenode.textContent = `The bundle of the profile ${result.payload.profile} carries ${result.payload.contents.siteprofiles.length} site profile${result.payload.contents.siteprofiles.length === 1 ? "" : "s"} and ${result.payload.contents.notes.length} note${result.payload.contents.notes.length === 1 ? "" : "s"}; ${result.payload.exclusions.join(" and ")} never enter any bundle.`;
  status("The settings bundle exported with its exclusion list.");
}

/** Validates one pasted bundle and applies its preferences when the validation passes. */
async function importbundle(): Promise<void> {
  const text = window.prompt("Paste the importexport bundle json") ?? "";
  if (text.trim() === "") return;
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const validation = await request({ kind: "views", importexport: { validate: parsed } }) as { ok: boolean; reason: string };
  if (!validation.ok) { status(validation.reason, true); return; }
  const applied = await request({ kind: "views", importexport: { apply: { preferences: (parsed as { contents?: { preferences?: Record<string, unknown> } }).contents?.preferences ?? {} } } }) as { applied: string[] };
  status(`The bundle applied ${applied.applied.length} preference key${applied.applied.length === 1 ? "" : "s"} after its validation passed.`);
  await loadfinishing();
}

/** Accepts the csv, json and workflow files the user drops on the dropimport zone. */
function wir(dropimportzone: HTMLElement): void {
  dropimportzone.addEventListener("dragover", event => { event.preventDefault(); });
  dropimportzone.addEventListener("drop", event => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file === undefined) return;
    void file.text().then(head => request({ kind: "views", dropimport: { file: { filename: file.name, bytes: file.size, head: head.slice(0, 2000) } } })).then(result => {
      const session = (result as { session: { filename: string; kind: string } }).session;
      status(`The dropimport detected the ${session.kind} kind of ${session.filename}; the import path takes the file from here.`);
    }).catch(error => status(error instanceof Error ? error.message : String(error), true));
  });
}
if (dropzonenode) wir(dropzonenode);

document.querySelector<HTMLButtonElement>("#finishingsettings")?.addEventListener("click", () => { void savefinishing().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#shortcutsettings")?.addEventListener("click", () => { void saveshortcut().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#exportbundle")?.addEventListener("click", () => { void exportbundle().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#importbundle")?.addEventListener("click", () => { void importbundle().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#replaytour")?.addEventListener("click", () => { void (async () => { await request({ kind: "views", tour: { replay: true } }); status("The featuretour replays with its datagrid, compareviewer and pickeroverlay stops."); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#recalltips")?.addEventListener("click", () => { void (async () => { await request({ kind: "views", tips: { recall: true } }); status("The guidedtips recalled; they show again during the picker sessions."); })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
themepreferenceselect?.addEventListener("change", () => { void applythemelive().catch(() => { /* a failing theme read keeps the shipped light theme */ }); });
contrastpreferenceselect?.addEventListener("change", () => { void (async () => { await savecontrastpreference(contrastpreferenceselect?.value === "high" ? "high" : "default"); await applythemelive(); })().catch(() => { /* a failing preference write keeps the shipped tokens */ }); });

void loadfinishing();
void applythemelive();
void rendershortcuts();
void rendertourstops();

/**
 * Syncbridge options of the 1.1.66 ecosystem family: the optionspage manages the manifest sync providers and their explicit opt in state and shows the conflict records with their resolve actions; no hook ever defaults on.
 */
const syncproviderlist = document.querySelector<HTMLElement>("#syncproviderlist");
const syncconflictsroot = document.querySelector<HTMLElement>("#syncconflicts");
const syncendpointinput = document.querySelector<HTMLInputElement>("#syncendpoint");
const syncproviderselect = document.querySelector<HTMLSelectElement>("#syncprovider");

/** Renders the syncbridge providers and hooks with their opt in states beside the open conflict records. */
async function rendersyncbridge(): Promise<void> {
  if (syncproviderlist) {
    try {
      const providers = await request({ kind: "ecosystem", sync: { providers: true } }) as { providers: Array<{ provider: string; label: string; note: string }> };
      const hooks = await request({ kind: "ecosystem", sync: { hooks: true } }) as { hooks: Array<{ id: string; provider: string; direction: string; optin: boolean; endpoint: string; state: string }> };
      syncproviderlist.replaceChildren();
      for (const provider of providers.providers) {
        const row = document.createElement("p");
        row.textContent = `${provider.label}: ${provider.note}`;
        syncproviderlist.append(row);
      }
      for (const hook of hooks.hooks) {
        const row = document.createElement("p");
        row.textContent = `${hook.provider} hook — ${hook.endpoint} — ${hook.direction} — ${hook.optin ? "opted in" : "opted out"} — ${hook.state}`;
        row.append(" ", (() => { const element = document.createElement("button"); element.type = "button"; element.className = "secondary"; element.textContent = hook.optin ? "Opt out" : "Opt in"; element.addEventListener("click", () => { void request({ kind: "ecosystem", sync: { hook: { optin: { hookid: hook.id, optin: !hook.optin } } } }).then(() => rendersyncbridge()).catch(error => status(error instanceof Error ? error.message : String(error), true)); }); return element; })());
        syncproviderlist.append(row);
      }
    } catch (error) { syncproviderlist.textContent = error instanceof Error ? error.message : String(error); }
  }
  if (syncconflictsroot) {
    try {
      const conflicts = await request({ kind: "ecosystem", sync: { conflicts: true } }) as { conflicts: Array<{ id: string; manifestid: string; local: { version: string }; remote: { version: string }; resolution?: string }> };
      syncconflictsroot.replaceChildren();
      if (conflicts.conflicts.length === 0) { syncconflictsroot.textContent = "No syncbridge conflict stands open; both versions surface here whenever digests differ."; return; }
      for (const conflict of conflicts.conflicts) {
        const row = document.createElement("p");
        row.textContent = `${conflict.manifestid}: local ${conflict.local.version} vs remote ${conflict.remote.version}${conflict.resolution !== undefined ? ` — resolved ${conflict.resolution}` : ""}`;
        if (conflict.resolution === undefined) for (const resolution of ["local", "remote", "merge"] as const) {
          const element = document.createElement("button");
          element.type = "button";
          element.className = "secondary";
          element.textContent = resolution;
          element.addEventListener("click", () => { void request({ kind: "ecosystem", sync: { resolve: { conflictid: conflict.id, resolution } } }).then(() => rendersyncbridge()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
          row.append(" ", element);
        }
        syncconflictsroot.append(row);
      }
    } catch (error) { syncconflictsroot.textContent = error instanceof Error ? error.message : String(error); }
  }
}

document.querySelector<HTMLButtonElement>("#synccreate")?.addEventListener("click", () => { void (async () => {
  const endpoint = syncendpointinput?.value.trim() ?? "";
  if (endpoint === "") throw new Error("The syncbridge hook needs its user configured endpoint; no provider address is ever hardcoded.");
  await request({ kind: "ecosystem", sync: { hook: { add: { provider: syncproviderselect?.value === "web" ? "web" : "file", direction: "both", endpoint } } } });
  if (syncendpointinput) syncendpointinput.value = "";
  status(`The syncbridge hook of ${endpoint} was added opted out; no hook ever defaults on.`);
  await rendersyncbridge();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

void rendersyncbridge();
/**
 * Model provider gateway options of the 1.1.83 family: the optionspage manages the baseurlconfig of every provider adapter (the base url the user typed, the optional path prefix of gateway deployments and the enable toggle that ships disabled), the consent stamp of the first remote call, the api key behind the vault seam with its explicit consent and one click revocation and the model choice of the discovered model list; no cloud default ever applies and the ollamalocal adapter alone carries the localhost default.
 */
const gatewayproviderlist = document.querySelector<HTMLElement>("#gatewayproviderlist");
const gatewaykindselect = document.querySelector<HTMLSelectElement>("#gatewaykind");
const gatewayidinput = document.querySelector<HTMLInputElement>("#gatewayid");
const gatewaybaseinput = document.querySelector<HTMLInputElement>("#gatewaybase");
const gatewayprefixinput = document.querySelector<HTMLInputElement>("#gatewayprefix");
const gatewaykeyinput = document.querySelector<HTMLInputElement>("#gatewaykey");

/** Renders the provider gateways with their base urls, enable toggles, consent stamps, key references and discovered model lists. */
async function rendergateways(): Promise<void> {
  if (!gatewayproviderlist) return;
  try {
    const view = await request({ kind: "gateway", view: true }) as { configs: Array<{ providerid: string; kind: string; baseurl: string; pathprefix?: string; enabled: boolean; consented?: boolean; keyref?: { name: string }; local: boolean; costpermilliontokens?: number }>; models: Array<{ providerid: string; models: Array<{ id: string; contextwindow?: number; modalities?: string[] }>; fetchedat: number }>; chat: { provider?: string; model?: string; source: string; reason?: string } };
    gatewayproviderlist.replaceChildren();
    if (view.configs.length === 0) { gatewayproviderlist.textContent = "No provider gateway configured yet; add one below — every provider starts disabled and no cloud default applies."; return; }
    for (const config of view.configs) {
      const row = document.createElement("p");
      const models = view.models.find(entry => entry.providerid === config.providerid);
      row.textContent = `${config.providerid} (${config.kind}) — ${config.baseurl}${config.pathprefix !== undefined ? ` under ${config.pathprefix}` : ""} — ${config.enabled ? "enabled" : "disabled"}${config.consented === true ? ", consented" : config.local ? ", local runtime" : ", consent pending"}${config.keyref !== undefined ? `, key ${config.keyref.name} in the vault` : ", no key"}${models !== undefined ? `, ${models.models.length} model${models.models.length === 1 ? "" : "s"} discovered` : ""}.`;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "secondary";
      toggle.textContent = config.enabled ? "Disable" : "Enable";
      toggle.addEventListener("click", () => { void request({ kind: "gateway", config: { providerid: config.providerid, kind: config.kind, baseurl: config.baseurl, ...(config.pathprefix !== undefined ? { pathprefix: config.pathprefix } : {}), enabled: !config.enabled } }).then(() => rendergateways()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
      row.append(" ", toggle);
      if (!config.local) {
        const consent = document.createElement("button");
        consent.type = "button";
        consent.className = "secondary";
        consent.textContent = config.consented === true ? "Withdraw consent" : "Consent to remote calls";
        consent.addEventListener("click", () => { void request({ kind: "gateway", consent: { providerid: config.providerid, grant: config.consented !== true } }).then(() => rendergateways()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
        row.append(" ", consent);
      }
      const refresh = document.createElement("button");
      refresh.type = "button";
      refresh.className = "secondary";
      refresh.textContent = "Refresh models";
      refresh.addEventListener("click", () => { void request({ kind: "gateway", models: { providerid: config.providerid, refresh: true } }).then(() => rendergateways()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
      row.append(" ", refresh);
      if (config.keyref !== undefined) {
        const revoke = document.createElement("button");
        revoke.type = "button";
        revoke.className = "secondary";
        revoke.textContent = "Revoke key";
        revoke.addEventListener("click", () => { void request({ kind: "gateway", key: { providerid: config.providerid, revoke: true } }).then(() => rendergateways()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
        row.append(" ", revoke);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => { void request({ kind: "gateway", config: { providerid: config.providerid, kind: config.kind, remove: true } }).then(() => rendergateways()).catch(error => status(error instanceof Error ? error.message : String(error), true)); });
      row.append(" ", remove);
      gatewayproviderlist.append(row);
    }
    const route = document.createElement("p");
    route.textContent = view.chat.provider !== undefined ? `The chat task kind routes to ${view.chat.provider}${view.chat.model !== undefined ? ` with ${view.chat.model}` : ""} (${view.chat.source}).` : `The chat task kind stays unrouted — ${view.chat.reason ?? "the user picks the pair from the models section of the sidepanel."}`;
    gatewayproviderlist.append(route);
  } catch (error) { gatewayproviderlist.textContent = error instanceof Error ? error.message : String(error); }
}

document.querySelector<HTMLButtonElement>("#gatewaycreate")?.addEventListener("click", () => { void (async () => {
  const providerid = gatewayidinput?.value.trim() ?? "";
  const kind = gatewaykindselect?.value ?? "openaicompat";
  const baseurl = gatewaybaseinput?.value.trim() ?? "";
  const pathprefix = gatewayprefixinput?.value.trim() ?? "";
  const keyvalue = gatewaykeyinput?.value ?? "";
  if (providerid === "") throw new Error("The provider gateway needs its provider id.");
  await request({ kind: "gateway", config: { providerid, kind, baseurl, ...(pathprefix !== "" ? { pathprefix } : {}), enabled: false } });
  if (keyvalue !== "") await request({ kind: "gateway", key: { providerid, value: keyvalue, consent: true } });
  if (gatewayidinput) gatewayidinput.value = "";
  if (gatewaybaseinput) gatewaybaseinput.value = "";
  if (gatewayprefixinput) gatewayprefixinput.value = "";
  if (gatewaykeyinput) gatewaykeyinput.value = "";
  status(`Added the ${kind} provider gateway ${providerid}; it starts disabled and the key ${keyvalue !== "" ? "stores behind the vault seam" : "stays unset"}.`);
  await rendergateways();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

void rendergateways();

document.querySelector<HTMLButtonElement>("#perfsettings")?.addEventListener("click", () => { void saveperf().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
document.querySelector<HTMLButtonElement>("#schedulesettings")?.addEventListener("click", () => { void saveschedule().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

/**
 * Site bridge options of the 1.1.82 family: the relay url stays the user's setting with no default (an empty value disables the bridge completely), the consent gate asks before the first socket connection, the page content consent flag stays off by default so plan text and statuses only cross, the idle window, the heartbeat interval, the rate cap and the pairing lifetime stay user choices, and the pairing panel shows the code with its expiry countdown while the revoke all and the kill switch close everything instantly.
 */
const bridgestatusline = document.querySelector<HTMLElement>("#bridgestatusline");

async function renderbridgeoptions(): Promise<void> {
  if (!bridgestatusline) return;
  try {
    const view = await request({ kind: "bridge", view: true }) as { status: { status: string; paired: boolean; queued: number }; pairing?: { code: string; countdown: { secondsleft: number; expired: boolean; label: string } }; tokens: { live: number }; queue: { depth: number }; killswitch: boolean; consent: boolean; settings: { serverurl?: string; bridgeidlewindow?: number; bridgeheartbeatinterval?: number; bridgeratelimit?: number; bridgeratewindow?: number; bridgepairinglifetime?: number; bridgepageconsent?: boolean } };
    const urlinput = document.querySelector<HTMLInputElement>("#serverurl");
    if (urlinput && document.activeElement !== urlinput) urlinput.value = view.settings.serverurl ?? "";
    const consentinput = document.querySelector<HTMLInputElement>("#bridgeconsent");
    if (consentinput) consentinput.checked = view.consent;
    const pageconsentinput = document.querySelector<HTMLInputElement>("#bridgepageconsent");
    if (pageconsentinput) pageconsentinput.checked = view.settings.bridgepageconsent === true;
    const numberof = (id: string, value: number | undefined): void => { const node = document.querySelector<HTMLInputElement>(id); if (node && document.activeElement !== node) node.value = value !== undefined ? String(value) : ""; };
    numberof("#bridgeidlewindow", view.settings.bridgeidlewindow);
    numberof("#bridgeheartbeatinterval", view.settings.bridgeheartbeatinterval);
    numberof("#bridgeratelimit", view.settings.bridgeratelimit);
    numberof("#bridgeratewindow", view.settings.bridgeratewindow);
    numberof("#bridgepairinglifetime", view.settings.bridgepairinglifetime);
    const killbutton = document.querySelector<HTMLButtonElement>("#bridgekill");
    if (killbutton) killbutton.textContent = view.killswitch ? "Release kill switch" : "Kill switch";
    bridgestatusline.textContent = `Bridge: ${view.status.status}${view.status.paired ? " and paired" : ""} · ${view.tokens.live} live token${view.tokens.live === 1 ? "" : "s"} · ${view.queue.depth} queued frame${view.queue.depth === 1 ? "" : "s"}${view.pairing !== undefined ? ` · pairing ${view.pairing.code} ${view.pairing.countdown.label}` : " · no pairing code minted"}.`;
  } catch (error) { bridgestatusline.textContent = error instanceof Error ? error.message : String(error); }
}

document.querySelector<HTMLButtonElement>("#bridgesettings")?.addEventListener("click", () => { void (async () => {
  const numberof = (id: string): number | undefined => { const raw = document.querySelector<HTMLInputElement>(id)?.value.trim() ?? ""; return raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };
  const url = document.querySelector<HTMLInputElement>("#serverurl")?.value.trim() ?? "";
  await request({ kind: "bridge", settings: { ...(url !== "" ? { serverurl: url } : { serverurl: "" }), ...(numberof("#bridgeidlewindow") !== undefined ? { bridgeidlewindow: numberof("#bridgeidlewindow") } : {}), ...(numberof("#bridgeheartbeatinterval") !== undefined ? { bridgeheartbeatinterval: numberof("#bridgeheartbeatinterval") } : {}), ...(numberof("#bridgeratelimit") !== undefined ? { bridgeratelimit: numberof("#bridgeratelimit") } : {}), ...(numberof("#bridgeratewindow") !== undefined ? { bridgeratewindow: numberof("#bridgeratewindow") } : {}), ...(numberof("#bridgepairinglifetime") !== undefined ? { bridgepairinglifetime: numberof("#bridgepairinglifetime") } : {}), ...(document.querySelector<HTMLInputElement>("#bridgepageconsent") !== undefined ? { bridgepageconsent: document.querySelector<HTMLInputElement>("#bridgepageconsent")?.checked === true } : {}) } });
  status("The site bridge options saved; the relay url stays your setting with no default and an empty value disables the bridge completely.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgeconsent")?.addEventListener("change", () => { void (async () => {
  const granted = document.querySelector<HTMLInputElement>("#bridgeconsent")?.checked === true;
  await request({ kind: "bridge", consent: granted ? { grant: true } : { revoke: true } });
  status(granted ? "The bridge consent is granted; the first socket connection may open." : "The bridge consent is revoked; the socket closed and no further connection opens.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgeconnect")?.addEventListener("click", () => { void (async () => {
  const granted = document.querySelector<HTMLInputElement>("#bridgeconsent")?.checked === true;
  if (granted) await request({ kind: "bridge", consent: { grant: true } }).catch(() => { /* an already granted consent records no second event */ });
  await request({ kind: "bridge", connect: true });
  status("The bridge socket connected behind the consent gate; the pairing code of the origin rides the session create frame.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgedisconnect")?.addEventListener("click", () => { void (async () => {
  await request({ kind: "bridge", disconnect: { reason: "The user closed the bridge socket from the options." } });
  status("The bridge socket closed; the offline queue buffers every further frame for the replay.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgepair")?.addEventListener("click", () => { void (async () => {
  const minted = await request({ kind: "bridge", pair: {} }) as { minted: { code: string; countdown: { label: string } } };
  status(`The pairing code ${minted.minted.code} was minted inside the extension options; ${minted.minted.countdown.label}`);
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgerevoke")?.addEventListener("click", () => { void (async () => {
  await request({ kind: "bridge", revoke: { all: true } });
  status("Every relay session revoked with one click; the socket closed instantly and no frame passes afterwards.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#bridgekill")?.addEventListener("click", () => { void (async () => {
  const view = await request({ kind: "bridge", view: true }) as { killswitch: boolean };
  await request({ kind: "bridge", killswitch: view.killswitch ? { release: true } : { engage: true } });
  status(view.killswitch ? "The bridge kill switch released; the connect opens the socket again behind the consent gate." : "The bridge kill switch engaged; the socket and the pairing disabled instantly.");
  await renderbridgeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

void renderbridgeoptions();

/**
 * Native host bridge options of the 1.1.85 family: the panel shows the install state and the versions the handshake reported, offers the install consent that explains the scope before any host registration (the manifest write itself runs through the reviewed cli installer because the extension never writes the profile), the per class and per surface consents, the attach and the detach of the native port, the diagnostics report, the kill switch and the escape hatch key that stops every native call in one press; the idle window, the heartbeat interval and the rate cap stay user choices with no default.
 */
const nativestatusline = document.querySelector<HTMLElement>("#nativestatusline");

async function rendernativeoptions(): Promise<void> {
  if (!nativestatusline) return;
  try {
    const view = await request({ kind: "native", view: true }) as { state: { installed: boolean; port: string; hostname?: string; companionversion?: string; companionprotocol?: string; installerversion?: string; wsbridgeport?: number }; diagnostics: { degraded: { degraded: boolean; reason: string } }; killswitch: boolean; installconsent: boolean; transportconsent: boolean; classconsents: string[]; surfaceconsents: string[]; calls: number; settings: { nativeidlewindow?: number; nativeheartbeatinterval?: number; nativecallratelimit?: number; nativecallratewindow?: number } };
    const checkboxof = (id: string, value: boolean): void => { const node = document.querySelector<HTMLInputElement>(id); if (node) node.checked = value; };
    checkboxof("#nativeinstallconsent", view.installconsent);
    checkboxof("#nativetransportconsent", view.transportconsent);
    checkboxof("#nativereadconsent", view.classconsents.includes("read"));
    checkboxof("#nativeinteractionconsent", view.classconsents.includes("interaction"));
    checkboxof("#nativesensitiveconsent", view.classconsents.includes("sensitive"));
    checkboxof("#nativeosdialogconsent", view.surfaceconsents.includes("osdialog"));
    checkboxof("#nativenotificationconsent", view.surfaceconsents.includes("notification"));
    const numberof = (id: string, value: number | undefined): void => { const node = document.querySelector<HTMLInputElement>(id); if (node && document.activeElement !== node) node.value = value !== undefined ? String(value) : ""; };
    numberof("#nativeidlewindow", view.settings.nativeidlewindow);
    numberof("#nativeheartbeatinterval", view.settings.nativeheartbeatinterval);
    numberof("#nativecallratelimit", view.settings.nativecallratelimit);
    numberof("#nativecallratewindow", view.settings.nativecallratewindow);
    const killbutton = document.querySelector<HTMLButtonElement>("#nativekill");
    if (killbutton) killbutton.textContent = view.killswitch ? "Release kill switch" : "Kill switch";
    nativestatusline.textContent = `Native bridge: ${view.state.installed ? `installed${view.state.hostname !== undefined ? ` as ${view.state.hostname}` : ""}` : "nothing installed"} · port ${view.state.port} · companion ${view.state.companionversion ?? "absent"} of protocol ${view.state.companionprotocol ?? "none"} · wsbridge port ${view.state.wsbridgeport ?? 0} · ${view.calls} recorded call${view.calls === 1 ? "" : "s"}${view.diagnostics.degraded ? ` · degraded: ${view.diagnostics.degraded.reason}` : ""}.`;
  } catch (error) { nativestatusline.textContent = error instanceof Error ? error.message : String(error); }
}

document.querySelector<HTMLButtonElement>("#nativesettings")?.addEventListener("click", () => { void (async () => {
  const numberof = (id: string): number | undefined => { const raw = document.querySelector<HTMLInputElement>(id)?.value.trim() ?? ""; return raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined; };
  await request({ kind: "native", settings: { ...(numberof("#nativeidlewindow") !== undefined ? { nativeidlewindow: numberof("#nativeidlewindow") } : {}), ...(numberof("#nativeheartbeatinterval") !== undefined ? { nativeheartbeatinterval: numberof("#nativeheartbeatinterval") } : {}), ...(numberof("#nativecallratelimit") !== undefined ? { nativecallratelimit: numberof("#nativecallratelimit") } : {}), ...(numberof("#nativecallratewindow") !== undefined ? { nativecallratewindow: numberof("#nativecallratewindow") } : {}) } });
  status("The native bridge options saved; the idle window, the heartbeat interval and the rate cap stay your choices with no default.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativeinstall")?.addEventListener("click", () => { void (async () => {
  const hostname = document.querySelector<HTMLInputElement>("#nativehostname")?.value.trim() ?? "";
  const profiledir = document.querySelector<HTMLInputElement>("#nativeprofiledir")?.value.trim() ?? "";
  await request({ kind: "native", installconsent: { grant: true, hostname, profiledir } });
  status(`The install consent for ${hostname} into ${profiledir} is recorded with the scope explained; run the reviewed installer (devthink native install) for the manifest write because the extension never writes your profile.`);
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativeuninstall")?.addEventListener("click", () => { void (async () => {
  await request({ kind: "native", installconsent: { revoke: true } });
  status("The install consent is revoked; the transport detached and the reviewed uninstaller (devthink native uninstall) removes the host manifest and its preferences.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

for (const [id, callclass] of [["#nativereadconsent", "read"], ["#nativeinteractionconsent", "interaction"], ["#nativesensitiveconsent", "sensitive"]] as Array<[string, "read" | "interaction" | "sensitive"]>) {
  document.querySelector<HTMLInputElement>(id)?.addEventListener("change", () => { void (async () => {
    const grant = document.querySelector<HTMLInputElement>(id)?.checked === true;
    await request({ kind: "native", classconsent: { callclass, grant } });
    status(grant ? `The ${callclass} call class is granted over the native transport; the gate asks per class.` : `The ${callclass} call class is revoked over the native transport.`);
    await rendernativeoptions();
  })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
}

for (const [id, surface] of [["#nativeosdialogconsent", "osdialog"], ["#nativenotificationconsent", "notification"]] as Array<[string, "osdialog" | "notification"]>) {
  document.querySelector<HTMLInputElement>(id)?.addEventListener("change", () => { void (async () => {
    const grant = document.querySelector<HTMLInputElement>(id)?.checked === true;
    await request({ kind: "native", surfaceconsent: { surface, grant } });
    status(grant ? `The ${surface} surface holds its own consent grant; a desktop surface never opens from a class grant alone.` : `The ${surface} surface consent is revoked.`);
    await rendernativeoptions();
  })().catch(error => status(error instanceof Error ? error.message : String(error), true)); });
}

document.querySelector<HTMLInputElement>("#nativetransportconsent")?.addEventListener("change", () => { void (async () => {
  const grant = document.querySelector<HTMLInputElement>("#nativetransportconsent")?.checked === true;
  await request({ kind: "native", transportconsent: grant ? { grant: true } : { revoke: true } });
  status(grant ? "The consent to the first native host attach is granted; the attach may open behind the remaining gates." : "The native transport consent is revoked; the port detached and the transport stays deny by default.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativeattach")?.addEventListener("click", () => { void (async () => {
  const hostname = document.querySelector<HTMLInputElement>("#nativehostname")?.value.trim() ?? "";
  await request({ kind: "native", attach: { ...(hostname !== "" ? { hostname } : {}) } });
  status("The native port attached behind the consent gates; the handshake frame rode the port and the diagnostics report the versions.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativedetach")?.addEventListener("click", () => { void (async () => {
  await request({ kind: "native", detach: { reason: "The user closed the native transport from the options." } });
  status("The native port detached; the install state persists and the next attach reuses it.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativediagnostics")?.addEventListener("click", () => { void (async () => {
  await request({ kind: "native", diagnostics: true });
  status("The native diagnostics ran: the port state, the versions and the last errors report in the status line above.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativekill")?.addEventListener("click", () => { void (async () => {
  const view = await request({ kind: "native", view: true }) as { killswitch: boolean };
  await request({ kind: "native", killswitch: view.killswitch ? { release: true } : { engage: true } });
  status(view.killswitch ? "The native transport kill switch released; the attach opens again behind the consent gates." : "The native transport kill switch engaged: the port detached and every native call stops instantly.");
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

document.querySelector<HTMLButtonElement>("#nativeescape")?.addEventListener("click", () => { void (async () => {
  const answer = await request({ kind: "native", escapehatch: { pressed: true } }) as { banner?: { title: string; explanation: string; halted: number } };
  status("The escape hatch key stopped every native call in one press; the transport detached until the user reattaches.");
  /* the 1.1.95 hardening: the escape hatch shows its visible confirmation banner, because a one press halt of every native call deserves a confirmation the user sees */
  const banner = document.querySelector<HTMLElement>("#nativebanner");
  if (banner) {
    banner.replaceChildren();
    if (answer.banner !== undefined) {
      const title = document.createElement("p");
      title.textContent = answer.banner.title;
      const explanation = document.createElement("p");
      explanation.textContent = answer.banner.explanation;
      banner.append(title, explanation);
      banner.hidden = false;
    } else banner.hidden = true;
  }
  await rendernativeoptions();
})().catch(error => status(error instanceof Error ? error.message : String(error), true)); });

void rendernativeoptions();

