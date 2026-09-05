/** The transparencypage of the 1.1.62 family: the declared options surface lists every active grant with its origin, scope and boundary beside a revoke action, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff of each installed update, the safedefaults applications and the secretvault labels; the options manage vault entries with add, label and delete only, the connectallow senders, the ratelimit buckets per origin, the phishguard threshold and the redactshot regions with their geometry, and no surface ever displays or exports a secret value. The 1.1.95 completion adds the permission rows with their consuming surfaces, the stored data kinds with their locations and their purge and export links, the audit trail integrity check result of the loghash chain and the transparency export — all rendered entirely offline with no external request. */

type transparencyview = {
  version: string;
  posture: string;
  grants: Array<{ origin: string; scope: string; boundary: string; grantedat: number }>;
  windows: Array<{ id: string; origin: string; state: string; boundary: string; startedat: number; expiresat: number }>;
  connectallow: Array<{ senderid: string; displayname: string; origin?: string; addedat: number }>;
  permdiffs: Array<{ fromversion: string; toversion: string; added: string[]; removed: string[]; computedat: number }>;
  safedefaults: Array<{ origin: string; firstseenat: number }>;
  vault: Array<{ vaultid: string; label: string; scope: string; provenance: string; createdat: number; lastusedat?: number }>;
};

type securityview = {
  vault?: Array<{ vaultid: string; label: string; scope: string; provenance: string; createdat: number; lastusedat?: number }>;
  connectallow?: Array<{ senderid: string; displayname: string; origin?: string; addedat: number }>;
  phishverdicts?: Array<{ origin: string; matchedorigin?: string; distance: number; threshold: number; blocked: boolean; reason: string; at: number }>;
  deferred?: Array<{ stepid: string; kind: string; origin: string; reason: string; resetsat: number; at: number }>;
  phishdistance?: number;
  redactregions?: Array<{ id: string; origin: string; template: string; x: number; y: number; width: number; height: number; reason: string; source: string; createdat: number }>;
  permissions?: Array<{ permission: string; state: string; surface: string; messages: number; kinds: number }>;
  chain?: Array<{ runid: string; valid: boolean; entries: number; brokenat?: number; reason: string; sealhash?: string; sealedat?: number }>;
};

type minimizationview = {
  inventory?: Array<{ key: string; dataclass: string; size: number; records: number }>;
  purge?: { scope: string[]; confirmation: string };
  bundles?: Array<{ id: string; records: number; bytes: number; at: number }>;
};

/** Sends one reviewed message to the background and returns its value. */
async function request<T>(message: Record<string, unknown>): Promise<T> {
  const answer = await chrome.runtime.sendMessage(message) as { ok: boolean; value?: T; error?: string };
  if (!answer.ok) throw new Error(answer.error ?? "The background request failed.");
  return answer.value as T;
}

function line(text: string): HTMLElement {
  const node = document.createElement("p");
  node.textContent = text;
  return node;
}

function button(label: string, action: () => Promise<void>): HTMLButtonElement {
  const node = document.createElement("button");
  node.type = "button";
  node.textContent = label;
  node.addEventListener("click", () => { void action().then(() => render()).catch(error => reportstatus(error instanceof Error ? error.message : String(error))); });
  return node;
}

function field(placeholder: string, kind: "text" | "number" = "text"): HTMLInputElement {
  const node = document.createElement("input");
  node.type = kind;
  node.placeholder = placeholder;
  node.style.marginRight = "0.4rem";
  return node;
}

function reportstatus(text: string): void {
  const node = document.querySelector<HTMLElement>("#status") ?? document.createElement("p");
  node.id = "status";
  node.textContent = text;
  if (!node.isConnected) document.querySelector("main")?.prepend(node);
}

async function render(): Promise<void> {
  const report = await request<transparencyview>({ kind: "transparency" });
  const security = await request<securityview>({ kind: "security" });
  const minimization = await request<minimizationview>({ kind: "minimization", view: true });

  /* the 1.1.95 permission rows: every manifest permission with its state and the surface the capability manifest coverage names as its consumer */
  const permissionsroot = document.querySelector<HTMLElement>("#permissions");
  if (permissionsroot) {
    permissionsroot.replaceChildren();
    if ((security.permissions ?? []).length === 0) permissionsroot.append(line("No permission was declared; the manifest requests nothing."));
    for (const permission of security.permissions ?? []) permissionsroot.append(line(`${permission.permission} — ${permission.state} — consumed by the ${permission.surface} surface through ${permission.messages} message${permission.messages === 1 ? "" : "s"} and ${permission.kinds} action kind${permission.kinds === 1 ? "" : "s"}`));
    permissionsroot.append(document.createElement("hr"), button("Export transparency report", async () => {
      const answer = await request<{ maskedfields: string[]; redactedregions: number; reason: string }>({ kind: "transparency", export: { download: true } });
      reportstatus(`The transparency export left the device: ${answer.reason}`);
    }));
  }

  /* the 1.1.95 stored data kinds: every inventory entry with its storage location, a purge link per kind that asks for the typed confirmation phrase and the one archive export link */
  const datakindsroot = document.querySelector<HTMLElement>("#datakinds");
  if (datakindsroot) {
    datakindsroot.replaceChildren();
    if ((minimization.inventory ?? []).length === 0) datakindsroot.append(line("No stored data kind reports inventory; nothing left the device."));
    for (const kind of minimization.inventory ?? []) {
      const row = line(`${kind.dataclass} — ${kind.records} record${kind.records === 1 ? "" : "s"} of ${kind.size} bytes at the local storage key ${kind.key}`);
      const typed = field("type the purge confirmation");
      row.append(" ", button(`Purge ${kind.dataclass}`, async () => {
        await request({ kind: "minimization", purge: { scope: [kind.dataclass], typed: typed.value.trim() } }).catch(error => reportstatus(error instanceof Error ? error.message : String(error)));
        typed.value = "";
      }), " ", typed);
      datakindsroot.append(row);
    }
    datakindsroot.append(document.createElement("hr"), button("Export all stored data in one archive", async () => {
      await request({ kind: "minimization", exportall: { download: true } });
      reportstatus("The one archive export left the device with every stored record the inventory carried.");
    }));
  }

  /* the 1.1.95 audit trail integrity: the loghash chain verification result of every stored run log */
  const integrityroot = document.querySelector<HTMLElement>("#integrity");
  if (integrityroot) {
    integrityroot.replaceChildren();
    if ((security.chain ?? []).length === 0) integrityroot.append(line("No run log exists yet; the audit trail integrity check has nothing to verify."));
    for (const chain of security.chain ?? []) integrityroot.append(line(chain.valid ? `The run log ${chain.runid} verifies: ${chain.entries} chained entries${chain.sealhash !== undefined ? ` sealed at ${new Date(chain.sealedat ?? 0).toLocaleString()} with the seal hash ${chain.sealhash.slice(0, 16)}` : ""}.` : `The run log ${chain.runid} broke at entry ${chain.brokenat ?? 0}: ${chain.reason}`));
  }

  const grantsroot = document.querySelector<HTMLElement>("#grants");
  if (grantsroot) {
    grantsroot.replaceChildren();
    if (report.grants.length === 0) grantsroot.append(line("No active grant exists; the denydefault posture refuses every origin."));
    for (const grant of report.grants) {
      const row = line(`${grant.origin} — ${grant.scope} — boundary ${grant.boundary} — granted ${new Date(grant.grantedat).toLocaleString()}`);
      row.append(" ", button("Revoke allowlist grant", async () => { await request({ kind: "security", allowlist: { remove: { origin: grant.origin } } }); }));
      grantsroot.append(row);
    }
  }

  const windowsroot = document.querySelector<HTMLElement>("#windows");
  if (windowsroot) {
    windowsroot.replaceChildren();
    if (report.windows.length === 0) windowsroot.append(line("No consent window was ever granted."));
    for (const window of report.windows) windowsroot.append(line(`${window.origin} — ${window.state} — boundary ${window.boundary} — started ${new Date(window.startedat).toLocaleString()} — expiry ${new Date(window.expiresat).toLocaleString()}`));
  }

  const sendersroot = document.querySelector<HTMLElement>("#senders");
  if (sendersroot) {
    sendersroot.replaceChildren();
    if ((security.connectallow ?? []).length === 0) sendersroot.append(line("The connectallow list ships empty by default; every unknown sender drops without handler execution."));
    for (const entry of security.connectallow ?? []) {
      const row = line(`${entry.displayname} (${entry.senderid})${entry.origin !== undefined ? ` of ${entry.origin}` : ""} — allowed ${new Date(entry.addedat).toLocaleString()}`);
      row.append(" ", button("Remove sender", async () => { await request({ kind: "security", connectallow: { remove: { senderid: entry.senderid } } }); }));
      sendersroot.append(row);
    }
    const senderid = field("sender id");
    const displayname = field("display name");
    const origin = field("origin (optional)");
    sendersroot.append(document.createElement("hr"), senderid, displayname, origin, button("Allow external sender", async () => {
      await request({ kind: "security", connectallow: { add: { senderid: senderid.value.trim(), displayname: displayname.value.trim(), ...(origin.value.trim() !== "" ? { origin: origin.value.trim() } : {}) } } });
    }));
  }

  const permdiffsroot = document.querySelector<HTMLElement>("#permdiffs");
  if (permdiffsroot) {
    permdiffsroot.replaceChildren();
    if (report.permdiffs.length === 0) permdiffsroot.append(line("No installed update recorded a permdiff yet."));
    for (const diff of report.permdiffs) permdiffsroot.append(line(`${diff.fromversion} → ${diff.toversion} — added ${diff.added.length > 0 ? diff.added.join(", ") : "nothing"} — removed ${diff.removed.length > 0 ? diff.removed.join(", ") : "nothing"} — ${new Date(diff.computedat).toLocaleString()}`));
  }

  const safedefaultsroot = document.querySelector<HTMLElement>("#safedefaults");
  if (safedefaultsroot) {
    safedefaultsroot.replaceChildren();
    if (report.safedefaults.length === 0) safedefaultsroot.append(line("No unknown origin received the safedefaults profile yet."));
    for (const application of report.safedefaults) safedefaultsroot.append(line(`${application.origin} — first seen ${new Date(application.firstseenat).toLocaleString()} — reads only, every sensitive class denied`));
  }

  const vaultroot = document.querySelector<HTMLElement>("#vault");
  if (vaultroot) {
    vaultroot.replaceChildren();
    if (report.vault.length === 0) vaultroot.append(line("The secretvault holds no entry; values live behind the vault seam and never persist."));
    for (const entry of report.vault) {
      const row = line(`${entry.label} — ${entry.scope} — ${entry.provenance} — stored ${new Date(entry.createdat).toLocaleString()}${entry.lastusedat !== undefined ? ` — last used ${new Date(entry.lastusedat).toLocaleString()}` : ""} — the value never displays or exports`);
      row.append(" ", button("Delete", async () => { await request({ kind: "security", vault: { delete: { vaultid: entry.vaultid } } }); }));
      vaultroot.append(row);
    }
    const label = field("label");
    const scope = field("origin scope");
    const value = document.createElement("input");
    value.type = "password";
    value.placeholder = "value (stays behind the vault)";
    value.style.marginRight = "0.4rem";
    vaultroot.append(document.createElement("hr"), label, scope, value, button("Store secret", async () => {
      await request({ kind: "security", vault: { add: { label: label.value.trim(), scope: scope.value.trim(), value: value.value } } });
      value.value = "";
    }));
  }

  const ratelimitroot = document.querySelector<HTMLElement>("#ratelimit");
  if (ratelimitroot) {
    ratelimitroot.replaceChildren();
    if ((security.deferred ?? []).length > 0) for (const deferred of security.deferred ?? []) ratelimitroot.append(line(`Deferred: the ${deferred.kind} step ${deferred.stepid} on ${deferred.origin} waits for the bucket reset at ${new Date(deferred.resetsat).toLocaleTimeString()}.`));
    else ratelimitroot.append(line("No deferred command waits for a bucket reset."));
    const origin = field("origin");
    const limit = field("limit", "number");
    const window = field("window ms", "number");
    ratelimitroot.append(document.createElement("hr"), origin, limit, window, button("Configure bucket", async () => {
      await request({ kind: "security", ratelimit: { set: { origin: origin.value.trim(), limit: Number(limit.value.trim()), window: Number(window.value.trim()) } } });
    }), " ", button("Remove bucket", async () => { await request({ kind: "security", ratelimit: { remove: { origin: origin.value.trim() } } }); }));
  }

  const phishroot = document.querySelector<HTMLElement>("#phishguard");
  if (phishroot) {
    phishroot.replaceChildren();
    if ((security.phishverdicts ?? []).length === 0) phishroot.append(line("No phishguard verdict exists yet; a credential step on a new origin records the first one."));
    for (const verdict of security.phishverdicts ?? []) phishroot.append(line(`${verdict.origin}${verdict.matchedorigin !== undefined ? ` sits ${verdict.distance} from ${verdict.matchedorigin}` : ` sits ${verdict.distance} from the closest granted origin`} under the threshold ${verdict.threshold}${verdict.blocked ? " — blocked" : ""}.`));
    const threshold = field("distance threshold 0..1", "number");
    phishroot.append(document.createElement("hr"), threshold, button("Save threshold", async () => {
      await request({ kind: "security", settings: { phishdistance: Number(threshold.value.trim()) } });
    }));
  }

  const redactroot = document.querySelector<HTMLElement>("#redact");
  if (redactroot) {
    redactroot.replaceChildren();
    if ((security.redactregions ?? []).length === 0) redactroot.append(line("No redactshot region exists yet; draw one and the capture seam masks it across viewport, element and stitched captures."));
    for (const region of security.redactregions ?? []) {
      const row = line(`${region.origin}/${region.template} — ${region.x},${region.y} of ${region.width}x${region.height} — ${region.source} — ${region.reason}`);
      row.append(" ", button("Remove region", async () => { await request({ kind: "security", redact: { remove: { id: region.id } } }); }));
      redactroot.append(row);
    }
    redactroot.append(line("Draw one region with its origin, page template, geometry and reason; the capture seam masks the regions of that origin and template across viewport, element and stitched captures."));
    const origin = field("origin");
    const template = field("page template");
    const x = field("x", "number");
    const y = field("y", "number");
    const width = field("width", "number");
    const height = field("height", "number");
    const reason = field("reason");
    redactroot.append(origin, template, x, y, width, height, reason, button("Draw region", async () => {
      await request({ kind: "security", redact: { add: { origin: origin.value.trim(), template: template.value.trim(), x: Number(x.value.trim()), y: Number(y.value.trim()), width: Number(width.value.trim()), height: Number(height.value.trim()), reason: reason.value.trim() } } });
    }));
  }
}

render().catch(error => reportstatus(error instanceof Error ? error.message : String(error)));

type sessionoptionsview = {
  recallwindow?: number;
  noteretention?: number;
  scratchpadretention?: number;
  summaryretention?: number;
  correctionretention?: number;
  summarywindow?: number;
  historyindex?: boolean;
  cancelrollback?: string;
};

/** Renders the session interface options of the 1.1.63 family: the semantic recall index window, the retention windows of the notes, the scratchpad, the summaries and the corrections, the runsummary length window, the historysearch index toggle and the cancelrun rollback preference — every value stays a user choice with no engine cap. */
function rendersessionoptions(view: sessionoptionsview): void {
  const root = document.querySelector<HTMLElement>("#sessionoptions");
  if (!root) return;
  root.replaceChildren();
  root.append(line(`Recall index window: ${view.recallwindow !== undefined ? `${view.recallwindow} milliseconds` : "the whole index stays live"}. Summary length window: ${view.summarywindow !== undefined ? `${view.summarywindow} steps` : "no cap"}. Historysearch index: ${view.historyindex !== false ? "on" : "off"}. Cancelrun rollback: ${view.cancelrollback === "none" ? "none" : "queued"}.`));
  const recallwindow = field("recall index window ms", "number");
  const noteretention = field("notes retention ms", "number");
  const scratchretention = field("scratchpad retention ms", "number");
  const summaryretention = field("summaries retention ms", "number");
  const correctionretention = field("corrections retention ms", "number");
  const summarywindow = field("summary window steps", "number");
  const historyindex = document.createElement("input");
  historyindex.type = "checkbox";
  historyindex.checked = view.historyindex !== false;
  const historylabel = document.createElement("label");
  historylabel.append(historyindex, " build the historysearch index");
  const cancelrollback = document.createElement("select");
  for (const option of ["queued", "none"]) {
    const entry = document.createElement("option");
    entry.value = option;
    entry.textContent = option;
    cancelrollback.append(entry);
  }
  cancelrollback.value = view.cancelrollback === "none" ? "none" : "queued";
  root.append(document.createElement("hr"), recallwindow, noteretention, scratchretention, summaryretention, correctionretention, summarywindow, historylabel, cancelrollback, button("Save session preferences", async () => {
    await request({ kind: "sessions", settings: {
      ...(recallwindow.value.trim() !== "" ? { recallwindow: Number(recallwindow.value.trim()) } : {}),
      ...(noteretention.value.trim() !== "" ? { noteretention: Number(noteretention.value.trim()) } : {}),
      ...(scratchretention.value.trim() !== "" ? { scratchpadretention: Number(scratchretention.value.trim()) } : {}),
      ...(summaryretention.value.trim() !== "" ? { summaryretention: Number(summaryretention.value.trim()) } : {}),
      ...(correctionretention.value.trim() !== "" ? { correctionretention: Number(correctionretention.value.trim()) } : {}),
      ...(summarywindow.value.trim() !== "" ? { summarywindow: Number(summarywindow.value.trim()) } : {}),
      historyindex: historyindex.checked,
      cancelrollback: cancelrollback.value,
    } });
  }));
}

/** Loads the session interface preferences through the context report and renders the options surface. */
async function rendersessionoptionsview(): Promise<void> {
  const context = await request<{ sessionview?: { historyindex: boolean; cancelrollback?: string }; sessionpreferences?: sessionoptionsview }>({ kind: "context" });
  rendersessionoptions({ ...(context.sessionpreferences ?? {}), ...(context.sessionview !== undefined ? { historyindex: context.sessionview.historyindex, ...(context.sessionview.cancelrollback !== undefined ? { cancelrollback: context.sessionview.cancelrollback } : {}) } : {}) });
}

void rendersessionoptionsview().catch(error => reportstatus(error instanceof Error ? error.message : String(error)));
