/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// debug.ts
var cdpdomains = ["Runtime", "Log", "Debugger", "DOM", "Network", "Page"];
function methoddomain(method) {
  const match = /^([A-Z][A-Za-z]*)\.([a-zA-Z][A-Za-z0-9]*)$/.exec(method.trim());
  return match?.[1];
}
function cdpallowlistof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const domains = Array.isArray(entry.domains) ? entry.domains.filter((domain) => typeof domain === "string" && cdpdomains.includes(domain)) : [];
  if (domains.length === 0) return void 0;
  if (entry.methods === void 0) return { domains };
  const methods = Array.isArray(entry.methods) ? entry.methods.filter((method) => typeof method === "string" && methoddomain(method) !== void 0 && domains.includes(methoddomain(method))) : [];
  if (methods.length === 0) return void 0;
  return { domains, methods };
}
function allowlistcovers(allowlist, method) {
  const domain = methoddomain(method);
  if (domain === void 0) return false;
  if (!allowlist.domains.includes(domain)) return false;
  if (allowlist.methods !== void 0 && !allowlist.methods.includes(method)) return false;
  return true;
}
function cdpeventruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const domain = typeof entry.domain === "string" && cdpdomains.includes(entry.domain) ? entry.domain : void 0;
  const event = typeof entry.event === "string" && entry.event.trim() ? entry.event.trim() : void 0;
  if (domain === void 0 || event === void 0) return void 0;
  const match = typeof entry.match === "string" && entry.match.trim() ? entry.match.trim() : void 0;
  return { domain, event, ...match !== void 0 ? { match } : {} };
}
function breakpointinputof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : void 0;
  const line = typeof entry.line === "number" && Number.isInteger(entry.line) && entry.line >= 0 ? entry.line : void 0;
  if (url === void 0 || line === void 0) return void 0;
  const column = typeof entry.column === "number" && Number.isInteger(entry.column) && entry.column >= 0 ? entry.column : void 0;
  const condition = typeof entry.condition === "string" && entry.condition.trim() ? entry.condition.trim() : void 0;
  return { url, line, ...column !== void 0 ? { column } : {}, ...condition !== void 0 ? { condition } : {} };
}
function stepmodeof(value) {
  const modes = ["stepover", "stepinto", "stepout", "resume"];
  return typeof value === "string" && modes.includes(value) ? value : void 0;
}
function watchexpressionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const expression = typeof entry.expression === "string" && entry.expression.trim() ? entry.expression.trim() : void 0;
  if (expression === void 0) return void 0;
  const scope = typeof entry.scope === "string" && entry.scope.trim() ? entry.scope.trim() : "topframe";
  return { expression, scope };
}
function overrideinputof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const urlpattern = typeof entry.urlpattern === "string" && entry.urlpattern.trim() ? entry.urlpattern.trim() : void 0;
  const source = typeof entry.source === "string" ? entry.source : void 0;
  if (urlpattern === void 0 || source === void 0 || source.trim().length === 0) return void 0;
  return { urlpattern, source };
}
function teardownplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const revertsteps = Array.isArray(entry.revertsteps) ? entry.revertsteps.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  const policy = entry.resumepolicy;
  if (revertsteps.length === 0) return void 0;
  if (policy !== void 0 && policy !== "resume" && policy !== "pause" && policy !== "ask") return void 0;
  return { revertsteps, resumepolicy: policy ?? "ask" };
}
var flowmetricnames = ["navigation", "paint", "lcp", "fid", "interaction", "blocking"];
var tracecategories = ["navigation", "scripting", "rendering", "painting", "loading", "network"];
function attachtargetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const kinds = ["page", "iframe", "worker", "serviceworker"];
  const kind = typeof entry.kind === "string" && kinds.includes(entry.kind) ? entry.kind : void 0;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : void 0;
  if (kind === void 0 || url === void 0) return void 0;
  if (kind !== "page" && !/^https:\/\//.test(url)) return void 0;
  return { kind, url };
}
function flowspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const prefix = typeof entry.prefix === "string" && entry.prefix.trim() ? entry.prefix.trim() : void 0;
  const steps = Array.isArray(entry.steps) ? entry.steps.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  const metrics = Array.isArray(entry.metrics) ? entry.metrics.filter((metric) => typeof metric === "string" && flowmetricnames.includes(metric)) : [];
  if (prefix === void 0 || steps.length === 0 || metrics.length === 0) return void 0;
  return { prefix, steps, metrics };
}
function annotationof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const stepid = typeof entry.stepid === "string" && entry.stepid.trim() ? entry.stepid.trim() : void 0;
  const label = typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : void 0;
  if (stepid === void 0 || label === void 0) return void 0;
  const offset = typeof entry.offset === "number" && Number.isFinite(entry.offset) && entry.offset >= 0 ? entry.offset : 0;
  return { stepid, label, offset };
}

// environments.ts
var offloadfamilies = [
  { task: "htmlsnapshot", kinds: ["readhtml", "parsehtml", "readertree", "readoutline", "classifypage"] },
  { task: "jsonpayload", kinds: ["readjson", "parsejson"] },
  { task: "tablerows", kinds: ["readtable", "scrapetable", "detecttables", "deduperows", "transformvalues"] },
  { task: "a11ytree", kinds: ["a11ytree"] },
  { task: "complexselector", kinds: ["resolvexpath", "deriveselector", "detectvirtual"] },
  { task: "stitchshots", kinds: ["contactsheet", "timelapse", "makethumbs"] }
];
function offfamilyof(kind) {
  return offloadfamilies.find((family) => family.kinds.includes(kind))?.task;
}
function environmentsof(step) {
  if (markuprenderstep(step)) return ["sandboxframe"];
  if (step.kind === "evaluate") return ["isolatedworld"];
  if (offfamilyof(step.kind) !== void 0) return ["pagecontext", "offscreenworker"];
  return ["pagecontext"];
}
function defaultenvironment(step) {
  if (markuprenderstep(step)) return "sandboxframe";
  if (step.kind === "evaluate") return "isolatedworld";
  return "pagecontext";
}
function markuprenderstep(step) {
  if (!step.options) return false;
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed) && typeof parsed.markup === "string" && parsed.markup.trim() !== "");
  } catch {
    return false;
  }
}
function environmentrequirementsof(kinds) {
  return kinds.map((kind) => {
    const bare = { kind };
    const environments = environmentsof(bare);
    return { kind, environments, defaultenvironment: defaultenvironment(bare) };
  });
}
var browserpermissions = ["geolocation", "notifications", "camera", "microphone", "clipboard-read", "clipboard-write", "midi", "persistent-storage"];
var permissionstates = ["granted", "denied", "prompt"];
function devicepresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const width = typeof entry.width === "number" && Number.isInteger(entry.width) && entry.width > 0 ? entry.width : void 0;
  const height = typeof entry.height === "number" && Number.isInteger(entry.height) && entry.height > 0 ? entry.height : void 0;
  const pixelratio = typeof entry.pixelratio === "number" && Number.isFinite(entry.pixelratio) && entry.pixelratio > 0 ? entry.pixelratio : void 0;
  if (name === void 0 || width === void 0 || height === void 0 || pixelratio === void 0) return void 0;
  return { name, width, height, pixelratio, mobile: entry.mobile === true };
}
function networkpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const latency = typeof entry.latency === "number" && Number.isFinite(entry.latency) && entry.latency >= 0 ? entry.latency : void 0;
  const download = typeof entry.download === "number" && Number.isFinite(entry.download) && entry.download >= 0 ? entry.download : void 0;
  const upload = typeof entry.upload === "number" && Number.isFinite(entry.upload) && entry.upload >= 0 ? entry.upload : void 0;
  if (name === void 0 || latency === void 0 || download === void 0 || upload === void 0) return void 0;
  return { name, latency, download, upload, offline: entry.offline === true };
}
function locationpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const latitude = typeof entry.latitude === "number" && Number.isFinite(entry.latitude) ? entry.latitude : void 0;
  const longitude = typeof entry.longitude === "number" && Number.isFinite(entry.longitude) ? entry.longitude : void 0;
  const accuracy = typeof entry.accuracy === "number" && Number.isFinite(entry.accuracy) && entry.accuracy >= 0 ? entry.accuracy : void 0;
  if (name === void 0 || latitude === void 0 || longitude === void 0 || accuracy === void 0) return void 0;
  if (!locationrangevalid(latitude, longitude)) return void 0;
  return { name, latitude, longitude, accuracy };
}
function agentpresetof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0;
  const useragent = typeof entry.useragent === "string" ? entry.useragent : void 0;
  const platform = typeof entry.platform === "string" && entry.platform.trim() ? entry.platform.trim() : void 0;
  const brands = Array.isArray(entry.brands) ? entry.brands.filter((brand) => typeof brand === "string" && brand.trim().length > 0) : [];
  if (name === void 0 || useragent === void 0 || platform === void 0 || brands.length === 0) return void 0;
  if (!agentgrammarvalid(useragent)) return void 0;
  return { name, useragent, platform, brands: [...new Set(brands)] };
}
function permissiongrantof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const name = typeof entry.name === "string" && browserpermissions.includes(entry.name) ? entry.name : void 0;
  const state = typeof entry.state === "string" && permissionstates.includes(entry.state) ? entry.state : void 0;
  if (name === void 0 || state === void 0) return void 0;
  return { name, state, runscope: entry.runscope !== false };
}
function blackboxruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const urlpatterns = Array.isArray(entry.urlpatterns) ? entry.urlpatterns.filter((pattern) => typeof pattern === "string" && /^https:\/\//.test(pattern)) : [];
  const tracescope = entry.tracescope;
  if (urlpatterns.length === 0) return void 0;
  if (tracescope !== "profiles" && tracescope !== "traces" && tracescope !== "both") return void 0;
  return { urlpatterns: [...new Set(urlpatterns)], tracescope };
}
function revertplanof(value) {
  const steps = Array.isArray(value) ? value.filter((step) => typeof step === "string" && step.trim().length > 0) : [];
  return steps.length > 0 ? steps : void 0;
}
function locationrangevalid(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}
function agentgrammarvalid(useragent) {
  const text2 = useragent.trim();
  if (text2.length === 0 || text2.length > 512) return false;
  if (/[\r\n]/.test(text2)) return false;
  if (!/^[A-Za-z0-9][A-Za-z0-9._+\-()/:; ,]*$/.test(text2)) return false;
  return /\/\d/.test(text2) || /\d+\.\d+/.test(text2);
}
function permissiongrade(name) {
  return name === "geolocation" || name === "camera" || name === "microphone" || name === "notifications" ? "powerful" : "standard";
}

// session.ts
var sessionfileversion = 1;
var snapshotsections = ["tabs", "scroll", "forms", "storage", "cookies"];
var searchfields = ["urls", "titles", "names", "text"];
function checksumtext(payload) {
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
function sessiontabof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.url !== "string" || !candidate.url.trim()) return void 0;
  if (typeof candidate.title !== "string") return void 0;
  if (typeof candidate.index !== "number" || !Number.isInteger(candidate.index) || candidate.index < 0) return void 0;
  const scrollx = typeof candidate.scrollx === "number" && Number.isFinite(candidate.scrollx) ? candidate.scrollx : 0;
  const scrolly = typeof candidate.scrolly === "number" && Number.isFinite(candidate.scrolly) ? candidate.scrolly : 0;
  const forms = Array.isArray(candidate.forms) ? candidate.forms.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const form = entry;
    if (typeof form.selector !== "string" || !form.selector.trim()) return [];
    return [{ selector: form.selector, value: typeof form.value === "string" ? form.value : "" }];
  }) : [];
  return { url: candidate.url, title: candidate.title, index: candidate.index, scrollx, scrolly, forms };
}
function autointervalof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.period !== "number" || !Number.isFinite(candidate.period) || candidate.period <= 0) return void 0;
  if (typeof candidate.maxsnapshots !== "number" || !Number.isInteger(candidate.maxsnapshots) || candidate.maxsnapshots < 1) return void 0;
  if (typeof candidate.expiry !== "number" || !Number.isFinite(candidate.expiry) || candidate.expiry < 0) return void 0;
  return { period: candidate.period, maxsnapshots: candidate.maxsnapshots, expiry: candidate.expiry };
}
function snapshotplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.scope !== "tab" && candidate.scope !== "run" && candidate.scope !== "all") return void 0;
  const sections = Array.isArray(candidate.sections) ? candidate.sections.flatMap((section) => typeof section === "string" && snapshotsections.includes(section) ? [section] : []) : [];
  if (sections.length === 0) return void 0;
  if (typeof candidate.captures !== "boolean") return void 0;
  const auto = candidate.auto === void 0 ? void 0 : autointervalof(candidate.auto);
  if (candidate.auto !== void 0 && auto === void 0) return void 0;
  return { scope: candidate.scope, sections, captures: candidate.captures, ...auto !== void 0 ? { auto } : {} };
}
function restoreplanof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.tabpolicy !== "reopen" && candidate.tabpolicy !== "skip") return void 0;
  if (candidate.formpolicy !== "restore" && candidate.formpolicy !== "skip") return void 0;
  if (candidate.capturepolicy !== "link" && candidate.capturepolicy !== "skip") return void 0;
  return { tabpolicy: candidate.tabpolicy, formpolicy: candidate.formpolicy, capturepolicy: candidate.capturepolicy };
}
function searchqueryof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const terms = Array.isArray(candidate.terms) ? candidate.terms.flatMap((term) => typeof term === "string" && term.trim() ? [term.trim()] : []) : [];
  if (terms.length === 0) return void 0;
  const fields = Array.isArray(candidate.fields) ? candidate.fields.flatMap((field) => typeof field === "string" && searchfields.includes(field) ? [field] : []) : [...searchfields];
  if (fields.length === 0) return void 0;
  const from = typeof candidate.from === "number" && Number.isFinite(candidate.from) ? candidate.from : void 0;
  const to = typeof candidate.to === "number" && Number.isFinite(candidate.to) ? candidate.to : void 0;
  if (from !== void 0 && to !== void 0 && from > to) return void 0;
  return { terms, fields, ...from !== void 0 ? { from } : {}, ...to !== void 0 ? { to } : {} };
}
function importsessionfile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (candidate.formatversion !== sessionfileversion) return void 0;
  const records = Array.isArray(candidate.records) ? candidate.records.flatMap((record2) => sessionrecordvalid(record2) ? [record2] : []) : [];
  if (records.length === 0) return void 0;
  if (!Array.isArray(candidate.recordids) || candidate.recordids.length !== records.length || !candidate.recordids.every((id, index) => id === records[index]?.id)) return void 0;
  const bytesize = typeof candidate.bytesize === "number" && Number.isFinite(candidate.bytesize) ? candidate.bytesize : -1;
  if (bytesize < 0) return void 0;
  const checksum = typeof candidate.checksum === "string" ? candidate.checksum : "";
  if (checksum !== checksumtext(`${sessionfileversion}:${candidate.recordids.join(",")}:${bytesize}`)) return void 0;
  return { formatversion: sessionfileversion, records, recordids: candidate.recordids, bytesize, checksum, exportedat: typeof candidate.exportedat === "number" && Number.isFinite(candidate.exportedat) ? candidate.exportedat : 0 };
}
function sessionrecordvalid(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return false;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return false;
  if (typeof candidate.createdat !== "number" || !Number.isFinite(candidate.createdat)) return false;
  if (!Array.isArray(candidate.tabs) || !candidate.tabs.every((tab) => sessiontabof(tab) !== void 0)) return false;
  if (!Array.isArray(candidate.captures) || !candidate.captures.every((id) => typeof id === "string")) return false;
  if (!Array.isArray(candidate.tags) || !candidate.tags.every((tag) => typeof tag === "string")) return false;
  return true;
}

// workflow.ts
function nestedparamof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (candidate.default !== void 0 && !["string", "number", "boolean"].includes(typeof candidate.default) && !Array.isArray(candidate.default)) return void 0;
  return { name: candidate.name, kind: candidate.kind, ...candidate.default !== void 0 ? { default: candidate.default } : {} };
}
function workflowstepof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return void 0;
  if (typeof candidate.kind !== "string" || !/^[a-z]+$/.test(candidate.kind)) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  if (candidate.target !== void 0 && (typeof candidate.target !== "string" || !candidate.target)) return void 0;
  if (candidate.value !== void 0 && typeof candidate.value !== "string") return void 0;
  if (candidate.options !== void 0 && typeof candidate.options !== "string") return void 0;
  if (candidate.breakpoint !== void 0 && typeof candidate.breakpoint !== "boolean") return void 0;
  const bindings = Array.isArray(candidate.bindings) ? candidate.bindings.flatMap((binding) => bindingof(binding) !== void 0 ? [bindingof(binding)] : []) : void 0;
  if (candidate.bindings !== void 0 && bindings === void 0) return void 0;
  if (Array.isArray(candidate.bindings) && bindings !== void 0 && bindings.length !== candidate.bindings.length) return void 0;
  const expression = candidate.expression === void 0 ? void 0 : expressionof(candidate.expression);
  if (candidate.expression !== void 0 && expression === void 0) return void 0;
  const extract = candidate.extract === void 0 ? void 0 : regexruleof(candidate.extract);
  if (candidate.extract !== void 0 && extract === void 0) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap((param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length) return void 0;
  return { id: candidate.id, kind: candidate.kind, label: candidate.label, ...candidate.target !== void 0 ? { target: candidate.target } : {}, ...candidate.value !== void 0 ? { value: candidate.value } : {}, ...candidate.options !== void 0 ? { options: candidate.options } : {}, ...bindings !== void 0 && bindings.length > 0 ? { bindings } : {}, ...expression !== void 0 ? { expression } : {}, ...extract !== void 0 ? { extract } : {}, ...candidate.breakpoint === true ? { breakpoint: true } : {}, ...params !== void 0 && params.length > 0 ? { params } : {} };
}
function blockinvocationof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.block !== "string" || !candidate.block.trim()) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap((param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length) return void 0;
  return { block: candidate.block, label: candidate.label, ...params !== void 0 && params.length > 0 ? { params } : {} };
}
function workflowblockof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  if (!Array.isArray(candidate.steps)) return void 0;
  const steps = [];
  for (const entry of candidate.steps) {
    const step = workflowstepof(entry);
    if (step) {
      steps.push(step);
      continue;
    }
    const invocation = blockinvocationof(entry);
    if (invocation) {
      steps.push(invocation);
      continue;
    }
    return void 0;
  }
  return { name: candidate.name, label: candidate.label, steps };
}
function steptemplateof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return void 0;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return void 0;
  if (typeof candidate.origin !== "string" || !candidate.origin.trim()) return void 0;
  const step = workflowstepof(candidate.step);
  if (!step) return void 0;
  if (typeof candidate.sharedat !== "number" || !Number.isFinite(candidate.sharedat)) return void 0;
  return { id: candidate.id, name: candidate.name, origin: candidate.origin, step, sharedat: candidate.sharedat };
}
function bindingof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.variable !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.variable)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (typeof candidate.stepid !== "string" || !candidate.stepid.trim()) return void 0;
  if (candidate.path !== void 0 && (typeof candidate.path !== "string" || !candidate.path.trim())) return void 0;
  return { variable: candidate.variable, kind: candidate.kind, stepid: candidate.stepid, ...candidate.path !== void 0 ? { path: candidate.path } : {} };
}
var variablekinds = ["string", "number", "boolean", "list", "element"];
var expressionoperators = ["add", "subtract", "multiply", "divide", "modulo", "equal", "notequal", "less", "greater", "lessequal", "greaterequal", "and", "or", "not", "concat", "contains", "length"];
function expressionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const left = operandof(candidate.left);
  if (!left) return void 0;
  const right = candidate.right === void 0 ? void 0 : operandof(candidate.right);
  if (candidate.right !== void 0 && right === void 0) return void 0;
  if (typeof candidate.operator !== "string" || !expressionoperators.includes(candidate.operator)) return void 0;
  if (typeof candidate.result !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.result)) return void 0;
  if (!variablekinds.includes(candidate.resultkind)) return void 0;
  return { left, ...right !== void 0 ? { right } : {}, operator: candidate.operator, result: candidate.result, resultkind: candidate.resultkind };
}
function operandof(value) {
  if (value === void 0) return void 0;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return { literal: value };
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.ref === "string" && /^[a-z][a-z0-9]*$/.test(candidate.ref)) return { ref: candidate.ref };
  if (typeof candidate.literal === "string" || typeof candidate.literal === "number" || typeof candidate.literal === "boolean") return { literal: candidate.literal };
  return void 0;
}
function regexruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return void 0;
  if (typeof candidate.flags !== "string" || !/^[dgimsuvy]*$/.test(candidate.flags)) return void 0;
  const groups = Array.isArray(candidate.groups) ? candidate.groups.flatMap((group) => typeof group === "string" && /^[a-z][a-z0-9]*$/.test(group) ? [group] : []) : [];
  if (candidate.groups !== void 0 && groups.length !== candidate.groups.length) return void 0;
  return { pattern: candidate.pattern, flags: candidate.flags, groups };
}
function expandblocks(steps, blocks) {
  const byname = new Map(blocks.map((block) => [block.name, block]));
  const expanded = [];
  const visit = (entries, path, inside, params) => {
    let stamped = params === void 0;
    for (const entry of entries) {
      if ("kind" in entry && "label" in entry && !("block" in entry)) {
        const marked = inside === void 0 ? entry : { ...entry, block: inside };
        if (!stamped && params !== void 0) {
          expanded.push({ ...marked, params });
          stamped = true;
        } else expanded.push(marked);
        continue;
      }
      const invocation = blockinvocationof(entry);
      if (!invocation) throw new Error("The step list entry is neither a reviewed step nor a block invocation.");
      if (path.includes(invocation.block)) throw new Error(`The block ${invocation.block} recurs inside itself and cannot expand.`);
      const block = byname.get(invocation.block);
      if (!block) throw new Error(`The block ${invocation.block} is not defined in the workflow.`);
      visit(block.steps, [...path, invocation.block], invocation.block, invocation.params ?? params);
    }
  };
  visit(steps, [], void 0);
  if (expanded.length === 0) throw new Error("A workflow needs at least one executable step after block expansion.");
  return expanded;
}
function composeworkflow(input) {
  if (typeof input.name !== "string" || !input.name.trim()) throw new Error("The workflow name must be a non-empty string.");
  if (typeof input.version !== "number" || !Number.isInteger(input.version) || input.version < 1) throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(input.origins) || input.origins.length === 0) throw new Error("A workflow needs at least one granted HTTPS origin.");
  const origins = input.origins.map((origin) => {
    try {
      return new URL(origin).origin;
    } catch {
      throw new Error(`The workflow origin ${origin} is not a valid url.`);
    }
  });
  if (origins.some((origin) => !origin.startsWith("https://"))) throw new Error("Workflow origins must use HTTPS.");
  const blocks = input.blocks ?? [];
  if (blocks.some((block, index) => blocks.findIndex((other) => other.name === block.name) !== index)) throw new Error("Workflow block names must stay unique.");
  for (const entry of input.steps) {
    if ("kind" in entry && "label" in entry && !("block" in entry)) {
      if (input.kindallowed && !input.kindallowed(entry.kind)) throw new Error(`The workflow step kind ${entry.kind} is not a reviewed action kind.`);
    }
  }
  for (const block of blocks) for (const entry of block.steps) {
    if ("kind" in entry && "label" in entry && !("block" in entry) && input.kindallowed && !input.kindallowed(entry.kind)) throw new Error(`The workflow step kind ${entry.kind} inside block ${block.name} is not a reviewed action kind.`);
  }
  const steps = expandblocks(input.steps, blocks);
  for (const step of steps) {
    if (input.kindallowed && !input.kindallowed(step.kind)) throw new Error(`The workflow step kind ${step.kind} is not a reviewed action kind.`);
    if (iscontrolflowkind(step.kind)) {
      validatecontrolpayload(step);
      for (const child of controlsteps(step)) {
        if (input.kindallowed && !input.kindallowed(child.kind)) throw new Error(`The workflow step kind ${child.kind} inside the control payload of ${step.id} is not a reviewed action kind.`);
      }
    }
    if (step.bindings) for (const binding of step.bindings) {
      if (!steps.some((other) => other.id === binding.stepid)) throw new Error(`The binding of ${binding.variable} references the unknown step ${binding.stepid}.`);
    }
  }
  const riskof = input.riskof ?? (() => "sensitive");
  const gradedkinds = steps.flatMap((step) => [step.kind, ...controlsteps(step).map((child) => child.kind)]);
  const risk = gradedkinds.some((kind) => riskof(kind) === "sensitive") ? "sensitive" : gradedkinds.some((kind) => riskof(kind) === "interaction") ? "interaction" : "read";
  const record2 = { id: input.id ?? crypto.randomUUID(), name: input.name, version: input.version, origins: [...new Set(origins)], steps, blocks, risk, createdat: input.now };
  return deepfreeze(record2);
}
function deepfreeze(record2) {
  for (const step of record2.steps) Object.freeze(step);
  for (const block of record2.blocks) for (const entry of block.steps) if ("kind" in entry && "label" in entry && !("block" in entry)) Object.freeze(entry);
  Object.freeze(record2.blocks);
  Object.freeze(record2.steps);
  return Object.freeze(record2);
}
function validateworkflow(record2, options) {
  if (record2.steps.length === 0) return { allowed: false, reason: "A workflow needs at least one reviewed step." };
  const defined = new Set(options?.inputs ?? []);
  const byid = new Map(record2.steps.map((step, index) => [step.id, { step, index }]));
  for (let index = 0; index < record2.steps.length; index += 1) {
    const step = record2.steps[index];
    if (options?.kindallowed && !options.kindallowed(step.kind)) return { allowed: false, reason: `The workflow step kind ${step.kind} is not a reviewed action kind.` };
    if (step.bindings) for (const binding of step.bindings) {
      const source = byid.get(binding.stepid);
      if (!source) return { allowed: false, reason: `The binding of ${binding.variable} references the unknown step ${binding.stepid}.` };
      if (source.index >= index) return { allowed: false, reason: `The binding of ${binding.variable} must link an earlier step than ${step.id}.` };
      defined.add(binding.variable);
    }
    if (step.expression) {
      for (const operand of [step.expression.left, step.expression.right]) {
        if (operand?.ref && !defined.has(operand.ref)) return { allowed: false, reason: `The expression of step ${step.id} references the undefined variable ${operand.ref}.` };
      }
      defined.add(step.expression.result);
    }
    if (step.extract) for (const group of step.extract.groups) defined.add(group);
  }
  return { allowed: true };
}
var controlflowkinds = ["condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"];
var defaultloopbound = 1e3;
function iscontrolflowkind(kind) {
  return controlflowkinds.includes(kind);
}
function controlname(value) {
  return typeof value === "string" && /^[a-z][a-z0-9]*$/.test(value) ? value : void 0;
}
function controlstepslist(value) {
  if (!Array.isArray(value) || value.length === 0) return void 0;
  const steps = [];
  for (const entry of value) {
    const parsed = workflowstepof(entry);
    if (!parsed) return void 0;
    steps.push(parsed);
  }
  return steps;
}
function controlbound(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : void 0;
}
function conditionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const expression = expressionof(candidate.expression);
  if (!expression) return void 0;
  if (expression.resultkind !== "boolean") return void 0;
  return { expression };
}
function elseof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const name = controlname(candidate.name);
  if (!name) return void 0;
  if (candidate.when !== void 0) return void 0;
  if (!Array.isArray(candidate.steps)) return void 0;
  const steps = [];
  for (const entry of candidate.steps) {
    const parsed = workflowstepof(entry);
    if (!parsed) return void 0;
    steps.push(parsed);
  }
  return { name, steps };
}
function branchof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (!Array.isArray(candidate.paths) || candidate.paths.length === 0) return void 0;
  const paths = [];
  for (const entry of candidate.paths) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return void 0;
    const path = entry;
    const name = controlname(path.name);
    if (!name) return void 0;
    const when = path.when === void 0 ? void 0 : expressionof(path.when);
    if (path.when !== void 0 && when === void 0) return void 0;
    if (when !== void 0 && when.resultkind !== "boolean") return void 0;
    const steps = controlstepslist(path.steps);
    if (!steps) return void 0;
    paths.push({ name, ...when !== void 0 ? { when } : {}, steps });
  }
  const names = paths.map((path) => path.name);
  if (new Set(names).size !== names.length) return void 0;
  const elsepath = elseof(candidate.else);
  if (!elsepath) return void 0;
  if (names.includes(elsepath.name)) return void 0;
  return { paths, else: elsepath };
}
function loopof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const list = controlname(candidate.list);
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!list || !item || !index) return void 0;
  if (item === list || index === list || item === index) return void 0;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== void 0 && bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { list, item, index, ...bound !== void 0 ? { bound } : {}, steps };
}
function repeatuntilof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const until = expressionof(candidate.until);
  if (!until || until.resultkind !== "boolean") return void 0;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== void 0 && bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { until, ...bound !== void 0 ? { bound } : {}, steps };
}
function whileof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const condition = expressionof(candidate.while);
  if (!condition || condition.resultkind !== "boolean") return void 0;
  const bound = controlbound(candidate.bound);
  if (bound === void 0) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { while: condition, bound, steps };
}
function foreachof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.selector !== "string" || !candidate.selector.trim()) return void 0;
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!item || !index || item === index) return void 0;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  return { selector: candidate.selector, item, index, steps };
}
function parallelof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (!Array.isArray(candidate.branches) || candidate.branches.length === 0) return void 0;
  const branches = [];
  for (const entry of candidate.branches) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return void 0;
    const branch = entry;
    const id = controlname(branch.id);
    if (!id) return void 0;
    const steps = controlstepslist(branch.steps);
    if (!steps) return void 0;
    branches.push({ id, steps });
  }
  if (new Set(branches.map((branch) => branch.id)).size !== branches.length) return void 0;
  const join = candidate.join && typeof candidate.join === "object" && !Array.isArray(candidate.join) ? candidate.join : void 0;
  if (!join) return void 0;
  if (join.strategy !== "first" && join.strategy !== "last" && join.strategy !== "fail") return void 0;
  if (join.onfail !== "cancel" && join.onfail !== "continue") return void 0;
  return { branches, join: { strategy: join.strategy, onfail: join.onfail } };
}
function tryof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return void 0;
  const catchcandidate = candidate.catch && typeof candidate.catch === "object" && !Array.isArray(candidate.catch) ? candidate.catch : void 0;
  if (!catchcandidate) return void 0;
  const catchsteps = controlstepslist(catchcandidate.steps);
  if (!catchsteps) return void 0;
  if (catchcandidate.rerun !== void 0 && typeof catchcandidate.rerun !== "boolean") return void 0;
  const catchvalue = { steps: catchsteps, ...catchcandidate.rerun === true ? { rerun: true } : {} };
  let retry;
  if (candidate.retry !== void 0) {
    const retrycandidate = candidate.retry && typeof candidate.retry === "object" && !Array.isArray(candidate.retry) ? candidate.retry : void 0;
    if (!retrycandidate) return void 0;
    if (typeof retrycandidate.attempts !== "number" || !Number.isInteger(retrycandidate.attempts) || retrycandidate.attempts < 1) return void 0;
    const backoff = retrycandidate.backoff && typeof retrycandidate.backoff === "object" && !Array.isArray(retrycandidate.backoff) ? retrycandidate.backoff : void 0;
    if (!backoff) return void 0;
    if (backoff.shape !== "fixed" && backoff.shape !== "exponential") return void 0;
    if (typeof backoff.base !== "number" || !Number.isFinite(backoff.base) || backoff.base < 0) return void 0;
    if (typeof backoff.jitter !== "number" || !Number.isFinite(backoff.jitter) || backoff.jitter < 0) return void 0;
    if (!Array.isArray(retrycandidate.retryable) || !retrycandidate.retryable.every((entry) => typeof entry === "string" && entry.trim())) return void 0;
    retry = { attempts: retrycandidate.attempts, backoff: { shape: backoff.shape, base: backoff.base, jitter: backoff.jitter }, retryable: retrycandidate.retryable };
  }
  let timeout;
  if (candidate.timeout !== void 0) {
    const timeoutcandidate = candidate.timeout && typeof candidate.timeout === "object" && !Array.isArray(candidate.timeout) ? candidate.timeout : void 0;
    if (!timeoutcandidate) return void 0;
    const stepms = timeoutcandidate.stepms === void 0 ? void 0 : typeof timeoutcandidate.stepms === "number" && Number.isFinite(timeoutcandidate.stepms) && timeoutcandidate.stepms > 0 ? timeoutcandidate.stepms : void 0;
    const runms = timeoutcandidate.runms === void 0 ? void 0 : typeof timeoutcandidate.runms === "number" && Number.isFinite(timeoutcandidate.runms) && timeoutcandidate.runms > 0 ? timeoutcandidate.runms : void 0;
    if (stepms === void 0 && runms === void 0) return void 0;
    if (timeoutcandidate.stepms !== void 0 && stepms === void 0) return void 0;
    if (timeoutcandidate.runms !== void 0 && runms === void 0) return void 0;
    timeout = { ...stepms !== void 0 ? { stepms } : {}, ...runms !== void 0 ? { runms } : {} };
  }
  return { steps, catch: catchvalue, ...retry !== void 0 ? { retry } : {}, ...timeout !== void 0 ? { timeout } : {} };
}
function controloptions(step) {
  if (step.options === void 0) throw new Error(`The ${step.kind} step needs its reviewed control payload in options.`);
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  return parsed;
}
function validatecontrolpayload(step) {
  if (!iscontrolflowkind(step.kind)) return;
  const payload = controloptions(step);
  if (step.kind === "condition" && conditionof(payload.condition) === void 0) throw new Error("The condition step needs a reviewed boolean expression in its options.");
  if (step.kind === "branch" && branchof(payload.branch) === void 0) throw new Error("The branch step needs reviewed unique paths with boolean match expressions and an else path in its options.");
  if (step.kind === "loop" && loopof(payload.loop) === void 0) throw new Error("The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "repeatuntil" && repeatuntilof(payload.repeatuntil) === void 0) throw new Error("The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "whileloop" && whileof(payload.while) === void 0) throw new Error("The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options.");
  if (step.kind === "foreach" && foreachof(payload.foreach) === void 0) throw new Error("The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options.");
  if (step.kind === "parallel" && parallelof(payload.parallel) === void 0) throw new Error("The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options.");
  if (step.kind === "trycatch" && tryof(payload.try) === void 0) throw new Error("The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options.");
}
function controlsteps(step) {
  if (!iscontrolflowkind(step.kind)) return [];
  let payload;
  try {
    payload = controloptions(step);
  } catch {
    return [];
  }
  const children = [];
  const collect = (steps) => {
    for (const child of steps) {
      children.push(child);
      collect(controlsteps(child));
    }
  };
  if (step.kind === "condition") return children;
  if (step.kind === "branch") {
    const branch = branchof(payload.branch);
    if (!branch) return children;
    for (const path of branch.paths) collect(path.steps);
    collect(branch.else.steps);
    return children;
  }
  if (step.kind === "loop") {
    const loop = loopof(payload.loop);
    if (loop) collect(loop.steps);
    return children;
  }
  if (step.kind === "repeatuntil") {
    const repeat = repeatuntilof(payload.repeatuntil);
    if (repeat) collect(repeat.steps);
    return children;
  }
  if (step.kind === "whileloop") {
    const condition = whileof(payload.while);
    if (condition) collect(condition.steps);
    return children;
  }
  if (step.kind === "foreach") {
    const foreach = foreachof(payload.foreach);
    if (foreach) collect(foreach.steps);
    return children;
  }
  if (step.kind === "parallel") {
    const parallel = parallelof(payload.parallel);
    if (parallel) for (const branch of parallel.branches) collect(branch.steps);
    return children;
  }
  const fragile = tryof(payload.try);
  if (fragile) {
    collect(fragile.steps);
    collect(fragile.catch.steps);
  }
  return children;
}
function controlsummary(step) {
  if (!iscontrolflowkind(step.kind)) return void 0;
  let payload;
  try {
    payload = controloptions(step);
  } catch {
    return { kind: step.kind };
  }
  if (step.kind === "condition") {
    const condition = conditionof(payload.condition);
    return { kind: step.kind, ...condition ? { expression: `${condition.expression.operator} into ${condition.expression.result}` } : {} };
  }
  if (step.kind === "branch") {
    const branch = branchof(payload.branch);
    return { kind: step.kind, ...branch ? { paths: branch.paths.map((path) => path.name), elsepath: branch.else.name } : {} };
  }
  if (step.kind === "loop") {
    const loop = loopof(payload.loop);
    return { kind: step.kind, ...loop ? { list: loop.list, item: loop.item, index: loop.index, ...loop.bound !== void 0 ? { bound: loop.bound } : { bound: defaultloopbound } } : {} };
  }
  if (step.kind === "repeatuntil") {
    const repeat = repeatuntilof(payload.repeatuntil);
    return { kind: step.kind, ...repeat ? { bound: repeat.bound ?? defaultloopbound } : {} };
  }
  if (step.kind === "whileloop") {
    const condition = whileof(payload.while);
    return { kind: step.kind, ...condition ? { bound: condition.bound } : {} };
  }
  if (step.kind === "foreach") {
    const foreach = foreachof(payload.foreach);
    return { kind: step.kind, ...foreach ? { selector: foreach.selector, item: foreach.item, index: foreach.index } : {} };
  }
  if (step.kind === "parallel") {
    const parallel = parallelof(payload.parallel);
    return { kind: step.kind, ...parallel ? { branches: parallel.branches.map((branch) => branch.id), strategy: parallel.join.strategy, onfail: parallel.join.onfail } : {} };
  }
  const fragile = tryof(payload.try);
  return { kind: step.kind, ...fragile ? { ...fragile.retry !== void 0 ? { attempts: fragile.retry.attempts, backoff: `${fragile.retry.backoff.shape} base ${fragile.retry.backoff.base} jitter ${fragile.retry.backoff.jitter}` } : {}, ...fragile.catch.rerun === true ? { rerun: true } : {}, ...fragile.timeout?.stepms !== void 0 ? { stepms: fragile.timeout.stepms } : {}, ...fragile.timeout?.runms !== void 0 ? { runms: fragile.timeout.runms } : {} } : {} };
}
var triggerkinds = ["visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"];
var triggerfamilies = ["visit", "url", "menu", "key", "button", "cron", "interval", "urllist", "webhook", "event"];
var triggereventcatalog = ["mutate", "focus", "banner", "console", "error", "navigate"];
var defaulttriggercooldown = 1e4;
function triggerfamilyof(kind) {
  const index = triggerkinds.indexOf(kind);
  return index >= 0 ? triggerfamilies[index] : void 0;
}
function triggerlabel(value) {
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function positivewindow(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function jitterwindow(value) {
  if (value === void 0) return void 0;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function httpsorigin(value) {
  if (typeof value !== "string" || !value.trim()) return void 0;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return void 0;
    return parsed.origin;
  } catch {
    return void 0;
  }
}
function webhookfieldof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/i.test(candidate.name)) return void 0;
  if (candidate.kind !== "string" && candidate.kind !== "number" && candidate.kind !== "boolean") return void 0;
  if (candidate.required !== void 0 && typeof candidate.required !== "boolean") return void 0;
  return { name: candidate.name, kind: candidate.kind, ...candidate.required === true ? { required: true } : {} };
}
function triggerpayloadof(family, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (family === "visit") {
    if (!Array.isArray(candidate.origins) || candidate.origins.length === 0) return void 0;
    const origins = candidate.origins.map((origin) => httpsorigin(origin));
    if (origins.some((origin) => origin === void 0)) return void 0;
    return { origins: [...new Set(origins)] };
  }
  if (family === "url") {
    if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return void 0;
    if (httpsorigin(candidate.pattern) === void 0) return void 0;
    return { pattern: candidate.pattern.trim() };
  }
  if (family === "menu") {
    const title = triggerlabel(candidate.title);
    if (!title) return void 0;
    return { title };
  }
  if (family === "key") {
    if (typeof candidate.command !== "string" || !/^[a-z][a-z0-9-]*$/.test(candidate.command)) return void 0;
    if (candidate.key !== void 0 && (typeof candidate.key !== "string" || !candidate.key.trim())) return void 0;
    return { command: candidate.command, ...candidate.key !== void 0 ? { key: candidate.key } : {} };
  }
  if (family === "button") return {};
  if (family === "cron") {
    if (typeof candidate.cron !== "string" || !candidate.cron.trim()) return void 0;
    if (cronparse(candidate.cron) === void 0) return void 0;
    if (candidate.timezone !== void 0 && (typeof candidate.timezone !== "string" || !timezonevalid(candidate.timezone))) return void 0;
    return { cron: candidate.cron.trim(), ...candidate.timezone !== void 0 ? { timezone: candidate.timezone } : {} };
  }
  if (family === "interval") {
    const period = positivewindow(candidate.period);
    if (period === void 0) return void 0;
    const jitter = jitterwindow(candidate.jitter);
    if (candidate.jitter !== void 0 && jitter === void 0) return void 0;
    return { period, ...jitter !== void 0 ? { jitter } : {} };
  }
  if (family === "urllist") {
    if (!Array.isArray(candidate.urls) || candidate.urls.length === 0) return void 0;
    const urls = candidate.urls.map((url) => httpsorigin(url) === void 0 ? void 0 : url.trim());
    if (urls.some((url) => url === void 0)) return void 0;
    return { urls };
  }
  if (family === "webhook") {
    if (typeof candidate.secret !== "string" || !webhooksecretok(candidate.secret)) return void 0;
    if (!Array.isArray(candidate.schema) || candidate.schema.length === 0) return void 0;
    const schema = candidate.schema.map((field) => webhookfieldof(field));
    if (schema.some((field) => field === void 0)) return void 0;
    const names = schema.map((field) => field.name);
    if (new Set(names).size !== names.length) return void 0;
    return { secret: candidate.secret, schema };
  }
  const events = candidate.events;
  if (!Array.isArray(events) || events.length === 0) return void 0;
  if (!events.every((name) => typeof name === "string" && triggereventcatalog.includes(name))) return void 0;
  return { events: [...new Set(events)] };
}
function webhooksecretok(secret) {
  if (secret.length < 24) return false;
  if (/^(.)\1+$/.test(secret)) return false;
  return /[a-z]/i.test(secret) && /\d/.test(secret);
}
function timezonevalid(timezone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
function armrule(input) {
  if (typeof input.workflowid !== "string" || !input.workflowid.trim()) return void 0;
  const payload = triggerpayloadof(input.family, input.payload);
  if (!payload) return void 0;
  if (input.cooldown !== void 0 && (typeof input.cooldown !== "number" || !Number.isFinite(input.cooldown) || input.cooldown <= 0)) return void 0;
  const cooldown = input.cooldown ?? (input.family === "webhook" || input.family === "event" ? defaulttriggercooldown : 0);
  const label = input.label ?? `The ${input.family} rule of ${input.workflowid}`;
  return { id: input.id ?? crypto.randomUUID(), kind: input.family, workflowid: input.workflowid, label, ...payload, cooldown, state: { enabled: true, cooldown }, stats: { fires: 0, launches: 0, suppressions: 0 }, createdat: input.now };
}
function cronparse(expression) {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return void 0;
  const minutes = cronfield(fields[0] ?? "", 0, 59);
  const hours = cronfield(fields[1] ?? "", 0, 23);
  const daysofmonth = cronfield(fields[2] ?? "", 1, 31);
  const months = cronfield(fields[3] ?? "", 1, 12, monthnames);
  const daysofweek = cronfield(fields[4] ?? "", 0, 7, weekdaynames, true);
  if (!minutes || !hours || !daysofmonth || !months || !daysofweek) return void 0;
  return { minutes, hours, daysofmonth, months, daysofweek: [...new Set(daysofweek.map((day) => day % 7))].sort((left, right) => left - right) };
}
var weekdaynames = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
var monthnames = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function cronfield(field, min, max, names, sundayseven = false) {
  const values = /* @__PURE__ */ new Set();
  for (const part of field.split(",")) {
    if (!part) return void 0;
    const [range, stepstring] = part.split("/");
    const step = stepstring === void 0 ? 1 : Number(stepstring);
    if (!Number.isInteger(step) || step < 1) return void 0;
    let low = min;
    let high = max;
    if (range !== void 0 && range !== "*") {
      const bounds = range.split("-");
      if (bounds.length > 2) return void 0;
      const lowvalue = cronvalue(bounds[0] ?? "", min, max, names);
      if (lowvalue === void 0) return void 0;
      low = lowvalue;
      high = lowvalue;
      if (bounds.length === 2) {
        const highvalue = cronvalue(bounds[1] ?? "", min, max, names);
        if (highvalue === void 0 || highvalue < lowvalue) return void 0;
        high = highvalue;
      }
    }
    for (let value = low; value <= high; value += step) values.add(value);
  }
  const list = [...values];
  if (list.some((value) => value < min || value > max)) return void 0;
  if (sundayseven && values.has(7)) {
    values.delete(7);
    values.add(0);
  }
  return [...values].sort((left, right) => left - right);
}
function cronvalue(value, min, max, names) {
  const candidate = names?.[value.toLowerCase()];
  if (candidate !== void 0) return candidate;
  if (!/^\d+$/.test(value)) return void 0;
  const parsed = Number(value);
  if (parsed < min || parsed > max) return void 0;
  return parsed;
}

// version.ts
var packageversion = "2.0.0";
var protocolmajor = 2;
var protocolfloormajor = 2;

// types.ts
var protocolversion = packageversion;
var protocolmajorversion = protocolmajor;
var pinnedprotocolversion = Object.freeze({ protocolversion, protocolmajor: protocolmajorversion });
var actionkindids = Object.freeze([
  "observe",
  "inspect",
  "extract",
  "wait",
  "waitfor",
  "waittext",
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
  "highlight",
  "tablist",
  "windowlist",
  "tabsnapshot",
  "focus",
  "scroll",
  "hover",
  "clickdeep",
  "rightclick",
  "doubleclick",
  "scrollpage",
  "scrollby",
  "scrollend",
  "scrolltop",
  "fullscreen",
  "zoomset",
  "click",
  "type",
  "navigate",
  "select",
  "presskey",
  "drag",
  "drop",
  "upload",
  "clear",
  "check",
  "uncheck",
  "toggle",
  "submit",
  "reload",
  "back",
  "forward",
  "writestorage",
  "setattribute",
  "removeattribute",
  "evaluate",
  "tabcreate",
  "tabactivate",
  "tabclose",
  "tabreload",
  "windowcreate",
  "windowclose",
  "windowresize",
  "downloadfile",
  "movepointer",
  "clickpoint",
  "shiftclick",
  "clicktext",
  "clickaria",
  "clickname",
  "resolvexpath",
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
  "dismissdialog",
  "pierceshadow",
  "enterframe",
  "retryaction",
  "mapclicks",
  "verifyvisible",
  "verifyenabled",
  "a11ytree",
  "readvisible",
  "readertree",
  "detectlists",
  "detecttables",
  "readjson",
  "watchmutate",
  "waitquiet",
  "watchbanner",
  "detectinfinitescroll",
  "detectvirtual",
  "detectlazy",
  "readscrollpos",
  "readlang",
  "readoutline",
  "countpages",
  "listshadow",
  "listframes",
  "classifypage",
  "fingerprintsection",
  "diffsnapshots",
  "readselection",
  "watchfocus",
  "detectsticky",
  "detectscrolllock",
  "readopengraph",
  "detectlanguage",
  "deriveselector",
  "openlink",
  "openprivate",
  "reloadcache",
  "stopnav",
  "waitload",
  "waiturl",
  "followlink",
  "spanav",
  "spawait",
  "rewritequery",
  "setfragment",
  "navlist",
  "navprofile",
  "detecthttp",
  "readredirects",
  "readfinalurl",
  "handleauth",
  "printpdf",
  "prefetch",
  "preconnect",
  "deeplink",
  "reopentab",
  "trailaudit",
  "pausenav",
  "navintent",
  "navrate",
  "openclipboard",
  "checksafe",
  "batchopen",
  "querytabs",
  "duplicatetab",
  "closepattern",
  "pintab",
  "mutetab",
  "movetab",
  "movetabwindow",
  "grouptabs",
  "colorgroup",
  "collapsegroup",
  "discardtab",
  "reloadtabs",
  "zoomin",
  "zoomout",
  "watchtab",
  "switchtab",
  "maximizewindow",
  "minimizewindow",
  "restorewindow",
  "focuswindow",
  "scratchwindow",
  "incognitowindow",
  "restoretab",
  "savelayout",
  "restorelayout",
  "findclones",
  "searchtabs",
  "badgetab",
  "attachmeta",
  "listaudio",
  "reopenrun",
  "snapshotsession",
  "fillform",
  "filllabel",
  "fillplaceholder",
  "detectfields",
  "generatevalues",
  "saveprofiles",
  "asksubmit",
  "submitform",
  "readerrors",
  "retryform",
  "runwizard",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "handoffcaptcha",
  "fillcard",
  "fillcode",
  "consentpassword",
  "skiphoneypot",
  "detectlogin",
  "detecttemplate",
  "scrapetable",
  "exportcsv",
  "exportjson",
  "exportexcel",
  "copytable",
  "pushsheets",
  "importcsv",
  "looprows",
  "transformvalues",
  "deduperows",
  "paginateextract",
  "mergepages",
  "stamplerows",
  "previewgrid",
  "streamdisk",
  "resumeextract",
  "logprovenance",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "verifydownload",
  "interceptmime",
  "exportnetlog",
  "readclipboard",
  "writeclipboard",
  "copyscreen",
  "quarantinedownload",
  "scanvirus",
  "namecaptures",
  "cleanupartifacts",
  "shotview",
  "shotfullpage",
  "shotelement",
  "shotregion",
  "contactsheet",
  "capturepdf",
  "recordscreen",
  "captureaudio",
  "captureframe",
  "downloadimages",
  "shotcanvas",
  "probestream",
  "readmedia",
  "readassets",
  "timelapse",
  "convertimage",
  "makethumbs",
  "fetchurl",
  "parsejson",
  "parsehtml",
  "callrest",
  "callgraphql",
  "opensocket",
  "sendmessage",
  "waitmessage",
  "watchrequests",
  "readheaders",
  "capturebodies",
  "subscribesse",
  "longpoll",
  "mapapi",
  "extractapi",
  "blockrequest",
  "mockresponse",
  "rewriteheaders",
  "setcookies",
  "readcookies",
  "clearcookies",
  "authflow",
  "saveapikey",
  "routeproxy",
  "postform",
  "postfiles",
  "watchconsole",
  "watcherrors",
  "watchtasks",
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "watchcdp",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "overridescript",
  "measureflow",
  "heapshot",
  "trackmemory",
  "profilecpu",
  "watchshifts",
  "traceload",
  "annotatetrace",
  "replaytrace",
  "capturesourcemaps",
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "blackboxscripts",
  "persiststate",
  "capturesession",
  "restoresession",
  "namedsessions",
  "diffsessions",
  "searchsessions",
  "exportsessions",
  "importsessions",
  "composeworkflow",
  "savetemplate",
  "runworkflow",
  "dryrun",
  "delay",
  "waitelement",
  "compute",
  "extractvars",
  "listruns",
  "condition",
  "branch",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch",
  "visitrule",
  "urlrule",
  "menurule",
  "keyrule",
  "buttonrule",
  "cronrule",
  "intervalrule",
  "urllistrule",
  "webhookrule",
  "eventrule"
]);
var servercontractversion = 1;

// apifreeze.ts
var protocolsupported = Object.freeze({ minimum: protocolfloormajor, maximum: protocolmajorversion });
var apifreezerelease = "1.1.91";
var deprecationwindow = Object.freeze({ opens: apifreezerelease, closes: "2.0.0" });
var allhostspattern = `https://${"*"}/*`;
var permissioncoverage = Object.freeze({
  activeTab: Object.freeze({ surface: "popup", messages: ["startsession", "context", "observation"], kinds: ["observe", "inspect"] }),
  storage: Object.freeze({ surface: "background", messages: ["configure", "context", "sessions", "security", "state"], kinds: [] }),
  scripting: Object.freeze({ surface: "background", messages: ["execute", "preview", "map", "observation"], kinds: ["click", "type", "highlight"] }),
  sidePanel: Object.freeze({ surface: "sidepanel", messages: [], kinds: [] }),
  tabs: Object.freeze({ surface: "background", messages: ["tabsearch", "jumptotab", "savelayout", "windowstate", "controltab", "settasktabceiling"], kinds: ["tablist", "querytabs", "windowlist", "savelayout"] }),
  downloads: Object.freeze({ surface: "background", messages: ["downloadreport", "downloadaction"], kinds: ["downloadfile", "pausedownload", "resumedownload", "verifydownload", "quarantinedownload"] }),
  clipboardRead: Object.freeze({ surface: "background", messages: ["execute"], kinds: ["readclipboard"] }),
  clipboardWrite: Object.freeze({ surface: "background", messages: ["execute"], kinds: ["writeclipboard", "copyscreen"] }),
  offscreen: Object.freeze({ surface: "background", messages: ["environments"], kinds: [] }),
  nativeMessaging: Object.freeze({ surface: "background", messages: ["native"], kinds: [] }),
  [allhostspattern]: Object.freeze({ surface: "background", messages: [], kinds: ["fetchurl", "callrest", "callgraphql", "subscribesse", "longpoll", "postform", "postfiles"] })
});

// auth.ts
var authrefusedmessage = "The remote frame failed its authentication handshake.";
function oauthflowof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.provider !== "string" || !options.provider.trim()) return void 0;
  if (typeof options.authorizeurl !== "string" || !options.authorizeurl.trim()) return void 0;
  if (typeof options.tokenurl !== "string" || !options.tokenurl.trim()) return void 0;
  if (!Array.isArray(options.scopes) || options.scopes.length === 0 || !options.scopes.every((item) => typeof item === "string" && item.trim().length > 0)) return void 0;
  if (typeof options.redirectorigin !== "string" || !options.redirectorigin.trim()) return void 0;
  return { provider: options.provider.trim(), authorizeurl: options.authorizeurl.trim(), tokenurl: options.tokenurl.trim(), scopes: options.scopes.map((item) => item.trim()), redirectorigin: options.redirectorigin.trim() };
}
function formpayloadof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.url !== "string" || !options.url.trim()) return void 0;
  if (!Array.isArray(options.fields) || options.fields.length === 0) return void 0;
  const fields = [];
  for (const item of options.fields) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const field = item;
    if (typeof field.name !== "string" || !field.name.trim()) return void 0;
    if (typeof field.value !== "string") return void 0;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  return { url: options.url.trim(), fields, ...typeof options.encoding === "string" && options.encoding.trim() ? { encoding: options.encoding.trim() } : {} };
}
function multipartpayloadof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.url !== "string" || !options.url.trim()) return void 0;
  if (!Array.isArray(options.files) || options.files.length === 0) return void 0;
  const fields = [];
  for (const item of Array.isArray(options.fields) ? options.fields : []) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const field = item;
    if (typeof field.name !== "string" || !field.name.trim()) return void 0;
    if (typeof field.value !== "string") return void 0;
    fields.push({ name: field.name.trim(), value: field.value });
  }
  const files = [];
  for (const item of options.files) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return void 0;
    const file = item;
    if (typeof file.name !== "string" || !file.name.trim()) return void 0;
    if (typeof file.filename !== "string" || !file.filename.trim()) return void 0;
    if (typeof file.mime !== "string" || !file.mime.trim()) return void 0;
    if (typeof file.content !== "string") return void 0;
    if (file.reviewed !== true) return void 0;
    files.push({ name: file.name.trim(), filename: file.filename.trim(), mime: file.mime.trim(), content: file.content, reviewed: true });
  }
  const payload = { url: options.url.trim(), fields, files, ...typeof options.boundary === "string" && options.boundary.trim() ? { boundary: options.boundary.trim() } : {} };
  return payload;
}

// gates.ts
function redactparams(params, secretfields) {
  const redacted = {};
  for (const [name, value] of Object.entries(params)) redacted[name] = secretfields.includes(name) ? "[redacted]" : value;
  return redacted;
}

// bridge.ts
var pagecontentkeys = ["html", "content", "body", "textpreview", "preview", "dom", "markup", "screenshot", "pagetext", "outerhtml", "innertext"];
function bridgepayload(kind, payload, pageconsent) {
  if (kind === "chat") return { payload, held: [] };
  const held = [];
  const minimized = {};
  for (const [key, value] of Object.entries(payload)) {
    if (pagecontentkeys.includes(key) && pageconsent !== true) {
      held.push(key);
      continue;
    }
    minimized[key] = value;
  }
  return { payload: minimized, held };
}

// mcp.ts
function rpcerrorof(code, message, data) {
  return { code, message, ...data !== void 0 ? { data } : {} };
}

// http.ts
var defaultheartbeatms = 3e4;
var defaultidlewindowms = 9e4;

// net.ts
var privatemimes = /* @__PURE__ */ new Set(["text/html", "text/plain", "text/xml", "application/xml", "application/json", "text/json", "application/x-www-form-urlencoded", "application/graphql", "multipart/form-data"]);
function privatemime(mime) {
  return privatemimes.has((mime.split(";")[0] ?? "").trim().toLowerCase());
}
function apireplayspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.endpoint !== "string" || !entry.endpoint.trim()) return void 0;
  const spec = { endpoint: entry.endpoint.trim() };
  if (typeof entry.verb === "string" && entry.verb.trim()) spec.verb = entry.verb.trim().toUpperCase();
  if (entry.overrides !== void 0 && entry.overrides !== null && typeof entry.overrides === "object" && !Array.isArray(entry.overrides)) {
    const overrides = {};
    for (const [name, override] of Object.entries(entry.overrides)) {
      if (typeof override === "string") overrides[name] = override;
    }
    spec.overrides = overrides;
  }
  if (Array.isArray(entry.paths)) spec.paths = entry.paths.filter((path) => typeof path === "string" && path.trim().length > 0);
  return spec;
}
function channeloptionsof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const options = {};
  if (Array.isArray(entry.protocols)) options.protocols = entry.protocols.filter((item) => typeof item === "string" && item.trim().length > 0);
  if (typeof entry.reconnect === "number" && Number.isFinite(entry.reconnect)) options.reconnect = entry.reconnect;
  if (typeof entry.backoff === "number" && Number.isFinite(entry.backoff)) options.backoff = entry.backoff;
  if (typeof entry.backoffceiling === "number" && Number.isFinite(entry.backoffceiling)) options.backoffceiling = entry.backoffceiling;
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime)) options.lifetime = entry.lifetime;
  return { url: entry.url.trim(), options };
}
function subscriptionoptionsof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const cancel = entry.cancel;
  if (!cancel || typeof cancel !== "object" || Array.isArray(cancel)) return void 0;
  const cancelrecord = cancel;
  if (cancelrecord.kind !== "stop" && cancelrecord.kind !== "lifetime") return void 0;
  if (typeof cancelrecord.value !== "string" && typeof cancelrecord.value !== "number") return void 0;
  const result = { url: entry.url.trim(), cancel: { kind: cancelrecord.kind, value: cancelrecord.value } };
  if (typeof entry.lifetime === "number" && Number.isFinite(entry.lifetime) && entry.lifetime > 0) result.lifetime = entry.lifetime;
  if (typeof entry.lasteventid === "string" && entry.lasteventid.trim()) result.lasteventid = entry.lasteventid.trim();
  return result;
}
function pollcursorof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  if (typeof entry.cursorfield !== "string" || !entry.cursorfield.trim()) return void 0;
  if (typeof entry.interval !== "number" || !Number.isFinite(entry.interval) || entry.interval <= 0) return void 0;
  const stop = entry.stop;
  if (!stop || typeof stop !== "object" || Array.isArray(stop)) return void 0;
  const stoprecord = stop;
  if (typeof stoprecord.field !== "string" || !stoprecord.field.trim()) return void 0;
  if (typeof stoprecord.equals !== "string") return void 0;
  const cursor = { url: entry.url.trim(), cursorfield: entry.cursorfield.trim(), interval: entry.interval, stop: { field: stoprecord.field.trim(), equals: stoprecord.equals } };
  if (typeof entry.maxpolls === "number" && Number.isFinite(entry.maxpolls) && entry.maxpolls >= 1) cursor.maxpolls = Math.floor(entry.maxpolls);
  if (typeof entry.param === "string" && entry.param.trim()) cursor.param = entry.param.trim();
  return cursor;
}
function patternorigin(pattern) {
  const trimmed = pattern.trim();
  if (!trimmed.startsWith("https://")) return void 0;
  const rest = trimmed.slice("https://".length);
  const host = rest.split("/")[0] ?? "";
  if (!host.trim()) return void 0;
  return `https://${host.toLowerCase()}`;
}
function blockruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  const rule = { urlpattern: options.urlpattern.trim() };
  if (Array.isArray(options.resourcetypes)) {
    const types = options.resourcetypes.filter((item) => typeof item === "string" && item.trim().length > 0);
    if (types.length === 0) return void 0;
    rule.resourcetypes = types;
  }
  return rule;
}
function mockspecof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  if (typeof options.status !== "number" || !Number.isInteger(options.status) || options.status < 100 || options.status > 599) return void 0;
  const hasbody = typeof options.body === "string";
  const bodyref = typeof options.bodyref === "string" ? options.bodyref.trim() : "";
  if (!hasbody && bodyref === "") return void 0;
  const spec = { urlpattern: options.urlpattern.trim(), status: options.status };
  if (hasbody) spec.body = options.body;
  if (bodyref !== "") spec.bodyref = bodyref;
  if (options.headers && typeof options.headers === "object" && !Array.isArray(options.headers)) spec.headers = options.headers;
  if (options.reviewed === true) spec.reviewed = true;
  return spec;
}
function headeruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.urlpattern !== "string" || !options.urlpattern.trim()) return void 0;
  if (typeof options.name !== "string" || !options.name.trim()) return void 0;
  if (options.operation !== "set" && options.operation !== "append" && options.operation !== "remove") return void 0;
  if (options.operation === "remove" && options.value !== void 0) return void 0;
  if (options.operation !== "remove" && typeof options.value !== "string") return void 0;
  const rule = { urlpattern: options.urlpattern.trim(), name: options.name.trim(), operation: options.operation };
  if (options.operation !== "remove") rule.value = typeof options.value === "string" ? options.value : "";
  return rule;
}
function cookierecordof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (typeof options.name !== "string" || !options.name.trim()) return void 0;
  if (typeof options.domain !== "string" || !options.domain.trim()) return void 0;
  if (typeof options.path !== "string" || !options.path.trim()) return void 0;
  if (typeof options.value !== "string") return void 0;
  const record2 = { name: options.name.trim(), domain: options.domain.trim().toLowerCase(), path: options.path.trim(), value: options.value };
  if (typeof options.expiresat === "number" && Number.isFinite(options.expiresat)) record2.expiresat = options.expiresat;
  return record2;
}
function proxyrouteof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const options = value;
  if (options.scheme !== "http" && options.scheme !== "https" && options.scheme !== "socks4" && options.scheme !== "socks5") return void 0;
  if (typeof options.host !== "string" || !options.host.trim()) return void 0;
  if (typeof options.port !== "number" || !Number.isInteger(options.port) || options.port < 1 || options.port > 65535) return void 0;
  if (!Array.isArray(options.bypass) || options.bypass.length === 0 || !options.bypass.every((item) => typeof item === "string" && item.trim().length > 0)) return void 0;
  return { scheme: options.scheme, host: options.host.trim(), port: options.port, bypass: options.bypass.map((item) => item.trim()) };
}

// gateway.ts
function longpollrequestof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.url !== "string" || !entry.url.trim()) return void 0;
  const request = { url: entry.url.trim() };
  if (typeof entry.timeout === "number" && Number.isFinite(entry.timeout) && entry.timeout > 0) request.timeout = entry.timeout;
  if (typeof entry.cursor === "string" && entry.cursor.trim()) request.cursor = entry.cursor.trim();
  return request;
}
function graphqlsubscriptionof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  if (typeof entry.query !== "string" || !entry.query.trim()) return void 0;
  if (typeof entry.channel !== "string" || !entry.channel.trim()) return void 0;
  const variables = {};
  if (entry.variables !== void 0) {
    if (!entry.variables || typeof entry.variables !== "object" || Array.isArray(entry.variables)) return void 0;
    for (const [name, item] of Object.entries(entry.variables)) {
      if (typeof item !== "string") return void 0;
      variables[name] = item;
    }
  }
  return { query: entry.query.trim(), ...Object.keys(variables).length > 0 ? { variables } : {}, channel: entry.channel.trim() };
}

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set(["click", "type", "navigate", "select", "presskey", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "reload", "back", "forward", "writestorage", "setattribute", "removeattribute", "evaluate", "tabcreate", "tabactivate", "tabclose", "tabreload", "windowcreate", "windowclose", "windowresize", "downloadfile", "clickpoint", "shiftclick", "dismissdialog", "enterframe", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "openlink", "openprivate", "reloadcache", "stopnav", "followlink", "spanav", "rewritequery", "setfragment", "navlist", "navprofile", "handleauth", "printpdf", "prefetch", "preconnect", "deeplink", "reopentab", "pausenav", "navrate", "openclipboard", "batchopen", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "restorelayout", "reopenrun", "badgetab", "fillform", "filllabel", "fillplaceholder", "submitform", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcard", "fillcode", "consentpassword", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "streamdisk", "paginateextract", "resumeextract", "batchdownload", "pausedownload", "resumedownload", "interceptmime", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "cleanupartifacts", "recordscreen", "captureaudio", "downloadimages", "callrest", "callgraphql", "sendmessage", "blockrequest", "mockresponse", "rewriteheaders", "setcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles", "attachcdp", "detachcdp", "cdpcmd", "overridescript", "heapshot", "profilecpu", "capturesourcemaps", "emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "restoresession", "exportsessions", "importsessions", "runworkflow", "visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var interactionactions = /* @__PURE__ */ new Set(["focus", "scroll", "hover", "clickdeep", "rightclick", "doubleclick", "scrollpage", "scrollby", "scrollend", "scrolltop", "fullscreen", "zoomset", "movepointer", "clicktext", "clickaria", "clickname", "expanddetails", "pierceshadow", "retryaction", "capturebodies", "setbreakpoint", "stepcode", "watchexpr", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var readactions = /* @__PURE__ */ new Set(["observe", "inspect", "extract", "wait", "waitfor", "waittext", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "readlinks", "readimages", "readmeta", "readforms", "readstorage", "highlight", "tablist", "windowlist", "tabsnapshot", "mapclicks", "verifyvisible", "verifyenabled", "resolvexpath", "a11ytree", "readvisible", "readertree", "detectlists", "detecttables", "readjson", "watchmutate", "waitquiet", "watchbanner", "detectinfinitescroll", "detectvirtual", "detectlazy", "readscrollpos", "readlang", "readoutline", "countpages", "listshadow", "listframes", "classifypage", "fingerprintsection", "diffsnapshots", "readselection", "watchfocus", "detectsticky", "detectscrolllock", "readopengraph", "detectlanguage", "deriveselector", "waitload", "waiturl", "spawait", "detecthttp", "readredirects", "readfinalurl", "trailaudit", "navintent", "checksafe", "querytabs", "watchtab", "findclones", "searchtabs", "listaudio", "snapshotsession", "savelayout", "attachmeta", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "readerrors", "skiphoneypot", "detectlogin", "detecttemplate", "handoffcaptcha", "scrapetable", "importcsv", "looprows", "transformvalues", "deduperows", "mergepages", "stamplerows", "previewgrid", "logprovenance", "verifydownload", "exportnetlog", "namecaptures", "shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet", "capturepdf", "captureframe", "readmedia", "readassets", "probestream", "timelapse", "shotcanvas", "convertimage", "makethumbs", "fetchurl", "parsejson", "parsehtml", "opensocket", "waitmessage", "watchrequests", "readheaders", "mapapi", "subscribesse", "longpoll", "extractapi", "readcookies", "watchconsole", "watcherrors", "watchtasks", "watchcdp", "measureflow", "trackmemory", "watchshifts", "traceload", "annotatetrace", "replaytrace", "blackboxscripts", "persiststate", "capturesession", "namedsessions", "diffsessions", "searchsessions", "composeworkflow", "savetemplate", "dryrun", "delay", "waitelement", "compute", "extractvars", "listruns", "condition", "branch"]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);
var watchactions = /* @__PURE__ */ new Set(["watchmutate", "watchbanner", "watchfocus", "watchtab"]);
var targetactions = /* @__PURE__ */ new Set(["inspect", "focus", "click", "type", "scroll", "select", "hover", "clickdeep", "rightclick", "doubleclick", "drag", "drop", "upload", "clear", "check", "uncheck", "toggle", "submit", "readattribute", "readstyle", "readgeometry", "readvalue", "readtext", "readhtml", "countelements", "readtable", "highlight", "setattribute", "removeattribute", "waitfor", "shiftclick", "typetime", "appendtext", "setvalue", "typeedit", "submitsearch", "selectmulti", "chooseradio", "setslider", "setdate", "setcolor", "expanddetails", "verifyvisible", "verifyenabled", "pierceshadow", "deriveselector", "fingerprintsection", "submitform", "retryform", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcode", "consentpassword", "scrapetable", "paginateextract", "shotelement", "captureframe", "shotcanvas"]);
var valueactions = /* @__PURE__ */ new Set(["presskey", "drag", "drop", "upload", "readattribute", "removeattribute", "waittext", "evaluate", "zoomset", "tabactivate", "tabclose", "tabreload", "windowclose", "windowresize", "tabcreate", "windowcreate", "downloadfile", "typetime", "appendtext", "setvalue", "typeedit", "keyhold", "keyrelease", "chooseradio", "setslider", "setdate", "setcolor", "followlink", "setfragment", "handleauth", "navintent", "openclipboard", "checksafe", "reopentab", "spanav", "duplicatetab", "pintab", "mutetab", "movetab", "movetabwindow", "searchtabs", "badgetab", "attachmeta", "focuswindow", "maximizewindow", "minimizewindow", "restorewindow", "incognitowindow", "asksubmit", "selectchain", "picktypeahead", "pickdate", "attachfile", "fillcode", "consentpassword", "pausedownload", "resumedownload", "verifydownload", "writeclipboard", "quarantinedownload", "scanvirus"]);
var tabscommandactions = /* @__PURE__ */ new Set(["querytabs", "duplicatetab", "closepattern", "pintab", "mutetab", "movetab", "movetabwindow", "grouptabs", "colorgroup", "collapsegroup", "discardtab", "reloadtabs", "zoomin", "zoomout", "watchtab", "switchtab", "maximizewindow", "minimizewindow", "restorewindow", "focuswindow", "scratchwindow", "incognitowindow", "restoretab", "savelayout", "restorelayout", "findclones", "searchtabs", "badgetab", "attachmeta", "listaudio", "reopenrun", "snapshotsession"]);
var formactions = /* @__PURE__ */ new Set(["fillform", "filllabel", "fillplaceholder", "detectfields", "generatevalues", "saveprofiles", "asksubmit", "submitform", "readerrors", "retryform", "runwizard", "selectchain", "picktypeahead", "pickdate", "attachfile", "handoffcaptcha", "fillcard", "fillcode", "consentpassword", "skiphoneypot", "detectlogin", "detecttemplate"]);
var datasetactions = /* @__PURE__ */ new Set(["scrapetable", "exportcsv", "exportjson", "exportexcel", "copytable", "pushsheets", "importcsv", "looprows", "transformvalues", "deduperows", "paginateextract", "mergepages", "stamplerows", "previewgrid", "streamdisk", "resumeextract", "logprovenance"]);
var filesactions = /* @__PURE__ */ new Set(["batchdownload", "pausedownload", "resumedownload", "verifydownload", "interceptmime", "exportnetlog", "readclipboard", "writeclipboard", "copyscreen", "quarantinedownload", "scanvirus", "namecaptures", "cleanupartifacts"]);
var captureactions = /* @__PURE__ */ new Set(["shotview", "shotfullpage", "shotelement", "shotregion", "contactsheet"]);
var mediaactions = /* @__PURE__ */ new Set(["capturepdf", "recordscreen", "captureaudio", "captureframe", "downloadimages", "shotcanvas", "probestream", "readmedia", "readassets", "timelapse", "convertimage", "makethumbs"]);
var httpactions = /* @__PURE__ */ new Set(["fetchurl", "parsejson", "parsehtml", "callrest", "callgraphql"]);
var socketactions = /* @__PURE__ */ new Set(["opensocket", "sendmessage", "waitmessage", "subscribesse", "longpoll"]);
var netwatchactions = /* @__PURE__ */ new Set(["watchrequests", "readheaders", "capturebodies", "mapapi", "extractapi"]);
var controlactions = /* @__PURE__ */ new Set(["blockrequest", "mockresponse", "rewriteheaders", "setcookies", "readcookies", "clearcookies", "authflow", "saveapikey", "routeproxy", "postform", "postfiles"]);
var debugactions = /* @__PURE__ */ new Set(["watchconsole", "watcherrors", "watchtasks"]);
var cdpactions = /* @__PURE__ */ new Set(["attachcdp", "detachcdp", "cdpcmd", "watchcdp", "setbreakpoint", "stepcode", "watchexpr", "overridescript"]);
var profileractions = /* @__PURE__ */ new Set(["measureflow", "heapshot", "trackmemory", "profilecpu", "watchshifts", "traceload", "annotatetrace", "replaytrace", "capturesourcemaps"]);
var emulationactions = /* @__PURE__ */ new Set(["emulatedevice", "emulatenetwork", "emulatelocate", "setuseragent", "overridepermission", "blackboxscripts"]);
var sessionactions = /* @__PURE__ */ new Set(["persiststate", "capturesession", "restoresession", "namedsessions", "diffsessions", "searchsessions", "exportsessions", "importsessions"]);
var workflowactions = /* @__PURE__ */ new Set(["composeworkflow", "savetemplate", "runworkflow", "dryrun", "delay", "waitelement", "compute", "extractvars", "condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"]);
var triggeractions = /* @__PURE__ */ new Set(["visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"]);
var credentialheaders = /* @__PURE__ */ new Set(["authorization", "proxy-authorization", "cookie", "cookie2", "set-cookie", "api-key", "x-api-key", "x-auth-token", "x-session-token", "proxy-authorization"]);
var fieldkinds = ["text", "email", "phone", "date", "number", "select", "check", "radio", "file", "password", "card", "code"];
var groupcolors = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
function issessionkind(kind) {
  return sessionactions.has(kind);
}
function isworkflowkind(kind) {
  return workflowactions.has(kind);
}
function istriggeraction(kind) {
  return triggeractions.has(kind);
}
function isdebugkind(kind) {
  return debugactions.has(kind);
}
function iscdpkind(kind) {
  return cdpactions.has(kind);
}
function isprofilekind(kind) {
  return profileractions.has(kind);
}
function isemulationkind(kind) {
  return emulationactions.has(kind);
}
function actionrisk(kind) {
  if (!allowedactions.has(kind)) throw new Error("Unsupported browser action.");
  if (sensitiveactions.has(kind)) return "sensitive";
  return interactionactions.has(kind) ? "interaction" : "read";
}
function parseoptions(step) {
  if (step.options === void 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error("Step options must be a JSON object.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Step options must be a JSON object.");
  return parsed;
}
function istabscommandkind(kind) {
  return tabscommandactions.has(kind);
}
function isformkind(kind) {
  return formactions.has(kind);
}
function isdatasetkind(kind) {
  return datasetactions.has(kind);
}
function isfileskind(kind) {
  return filesactions.has(kind);
}
function iscapturekind(kind) {
  return captureactions.has(kind);
}
function validatecaptureoptions(value) {
  if (value === void 0) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "The reviewed capture options must be an object in options.capture." };
  const options = value;
  if (options.format !== void 0 && options.format !== "png" && options.format !== "jpeg" && options.format !== "webp") return { allowed: false, reason: "The reviewed capture format must be png, jpeg or webp." };
  if (options.quality !== void 0 && (typeof options.quality !== "number" || !Number.isFinite(options.quality) || options.quality < 0 || options.quality > 100)) return { allowed: false, reason: "The reviewed capture quality must stay between zero and one hundred; any value in that range is the user choice with no code cap." };
  if (options.pixelratio !== void 0 && (typeof options.pixelratio !== "number" || !Number.isFinite(options.pixelratio) || options.pixelratio < 1)) return { allowed: false, reason: "The reviewed pixel ratio starts at one and climbs to any user configured ceiling with no code ceiling." };
  if (options.annotate !== void 0 && typeof options.annotate !== "boolean") return { allowed: false, reason: "The reviewed capture annotation flag must be a boolean." };
  if (options.exporttarget !== void 0 && options.exporttarget !== "memory" && options.exporttarget !== "download" && options.exporttarget !== "clipboard") return { allowed: false, reason: "The reviewed capture export target must be memory, download or clipboard." };
  return { allowed: true };
}
function validateregionrect(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed regionrect with x, y, width and height in css pixels is required in options." };
  const rect = value;
  for (const field of ["x", "y", "width", "height"]) {
    if (typeof rect[field] !== "number" || !Number.isFinite(rect[field])) return { allowed: false, reason: `The reviewed regionrect needs a numeric ${field} in css pixels.` };
  }
  if (rect.x < 0 || rect.y < 0) return { allowed: false, reason: "The reviewed regionrect refuses negative coordinates." };
  if (rect.width <= 0 || rect.height <= 0) return { allowed: false, reason: "The reviewed regionrect needs positive width and height values." };
  return { allowed: true };
}
function validatecapturenaming(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed capturenaming rule with run, step, sequence and kind flags is required." };
  const rule = value;
  const segments = ["run", "step", "sequence", "kind"];
  for (const key of Object.keys(rule)) {
    if (!segments.includes(key)) return { allowed: false, reason: `The reviewed capturenaming rule refuses the unknown ${key} segment; only run, step, sequence and kind participate.` };
  }
  for (const segment of segments) {
    if (rule[segment] !== void 0 && typeof rule[segment] !== "boolean") return { allowed: false, reason: `The reviewed capturenaming ${segment} flag must be a boolean.` };
  }
  if (!segments.some((segment) => rule[segment] === true)) return { allowed: false, reason: "The reviewed capturenaming rule needs at least one enabled segment of run, step, sequence and kind." };
  return { allowed: true };
}
function validatecapturegrammar(step, options) {
  const kind = step.kind;
  const optioncheck = validatecaptureoptions(options.capture);
  if (!optioncheck.allowed) return optioncheck;
  if (options.settle !== void 0 && (typeof options.settle !== "number" || !Number.isFinite(options.settle) || options.settle < 0)) return { allowed: false, reason: "The reviewed capture settle window must be zero or a positive number of milliseconds." };
  if (options.overlap !== void 0 && (typeof options.overlap !== "number" || !Number.isInteger(options.overlap) || options.overlap < 0)) return { allowed: false, reason: "The reviewed stitch overlap must be zero or a positive number of rows." };
  if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed capture wait window must be zero or a positive number of milliseconds." };
  if (options.naming !== void 0) {
    const namingcheck = validatecapturenaming(options.naming);
    if (!namingcheck.allowed) return namingcheck;
  }
  if (kind === "shotregion") {
    const rectcheck = validateregionrect(options.regionrect);
    if (!rectcheck.allowed) return rectcheck;
    if (options.reviewed !== true) return { allowed: false, reason: "Every reviewed regionrect needs the explicit reviewed flag before shotregion runs." };
    if (options.container !== void 0 && !isnonempty(options.container)) return { allowed: false, reason: "The reviewed scrollable container selector must be a non-empty string." };
    if (options.steps !== void 0 && (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)) return { allowed: false, reason: "The reviewed container scroll steps must be a positive integer with no code ceiling." };
  }
  if (kind === "contactsheet") {
    const elements = options.elements;
    if (!Array.isArray(elements) || elements.length === 0 || !elements.every((item) => isnonempty(item))) return { allowed: false, reason: "A reviewed non-empty list of element selectors is required in options for the contact sheet; the cell count stays the user choice." };
    const layout = options.sheet;
    if (layout !== void 0) {
      if (!layout || typeof layout !== "object" || Array.isArray(layout)) return { allowed: false, reason: "The reviewed sheetlayout must be an object with cellsize, columns and label." };
      const sheet = layout;
      if (typeof sheet.cellsize !== "number" || !Number.isFinite(sheet.cellsize) || sheet.cellsize <= 0) return { allowed: false, reason: "The reviewed contact sheet cell size must be a positive number of pixels." };
      if (typeof sheet.columns !== "number" || !Number.isInteger(sheet.columns) || sheet.columns < 1) return { allowed: false, reason: "The reviewed contact sheet column count must be a positive integer with no code ceiling." };
      if (sheet.label !== void 0 && sheet.label !== "none" && sheet.label !== "index" && sheet.label !== "selector" && sheet.label !== "both") return { allowed: false, reason: "The reviewed contact sheet label style must be none, index, selector or both." };
    }
  }
  return { allowed: true };
}
function validatefieldmatch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed field match is required in options." };
  const match = value;
  if (match.mode !== "label" && match.mode !== "placeholder" && match.mode !== "arialabel" && match.mode !== "name") return { allowed: false, reason: "The reviewed field match mode must be label, placeholder, arialabel or name." };
  const key = match.mode === "label" ? "label" : match.mode === "placeholder" ? "placeholder" : match.mode === "arialabel" ? "arialabel" : "name";
  if (!isnonempty(match[key])) return { allowed: false, reason: `The reviewed ${match.mode} field match needs a non-empty ${key}.` };
  return { allowed: true };
}
function validateformrecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed form record with entries is required in options." };
  const record2 = value;
  if (record2.form !== void 0 && !isnonempty(record2.form)) return { allowed: false, reason: "The reviewed form record form selector must be a non-empty string." };
  if (!Array.isArray(record2.entries) || record2.entries.length === 0) return { allowed: false, reason: "The reviewed form record needs a non-empty list of entries." };
  for (const item of record2.entries) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed form record entry must be an object." };
    const entry = item;
    const matchcheck = validatefieldmatch(entry.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof entry.kind !== "string" || !fieldkinds.includes(entry.kind)) return { allowed: false, reason: "Every reviewed form record entry needs a known field kind." };
    if (typeof entry.value !== "string") return { allowed: false, reason: "Every reviewed form record entry needs a string value." };
    if (entry.kind === "password") return { allowed: false, reason: "Password entries are refused inside form records; use consentpassword with a reviewed consent ref." };
  }
  return { allowed: true };
}
function validatevaluegen(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed valuegen rule with a field kind is required in options." };
  const rule = value;
  if (typeof rule.kind !== "string" || !fieldkinds.includes(rule.kind)) return { allowed: false, reason: "The reviewed valuegen kind must be a known field kind." };
  if (rule.locale !== void 0 && !isnonempty(rule.locale)) return { allowed: false, reason: "The reviewed valuegen locale must be a non-empty string." };
  if (rule.seed !== void 0 && (typeof rule.seed !== "number" || !Number.isFinite(rule.seed))) return { allowed: false, reason: "The reviewed valuegen seed must be a finite number." };
  return { allowed: true };
}
function validatefieldpairs(options, mode) {
  const pairs = options.fields;
  if (!Array.isArray(pairs) || pairs.length === 0) return { allowed: false, reason: "A reviewed non-empty list of field pairs is required in options." };
  for (const item of pairs) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed field pair must be an object." };
    const pair = item;
    if (!isnonempty(pair[mode])) return { allowed: false, reason: `Every reviewed field pair needs a non-empty ${mode}.` };
    if (typeof pair.value !== "string" || !pair.value.trim()) return { allowed: false, reason: "Every reviewed field pair needs a non-empty value." };
  }
  return { allowed: true };
}
function validatecardsegments(value) {
  if (!Array.isArray(value) || value.length === 0) return { allowed: false, reason: "A reviewed non-empty list of card segments is required in options." };
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every reviewed card segment must be an object." };
    const segment = item;
    const matchcheck = validatefieldmatch(segment.match);
    if (!matchcheck.allowed) return matchcheck;
    if (typeof segment.value !== "string" || !segment.value.trim()) return { allowed: false, reason: "Every reviewed card segment needs a non-empty value." };
  }
  return { allowed: true };
}
function validateformgrammar(step, options) {
  const kind = step.kind;
  if (kind === "fillform" || kind === "saveprofiles" && options.formrecord !== void 0) {
    const recordcheck = validateformrecord(options.formrecord);
    if (!recordcheck.allowed) return recordcheck;
  }
  if (kind === "filllabel" || kind === "fillplaceholder") {
    const paircheck = validatefieldpairs(options, kind === "filllabel" ? "label" : "placeholder");
    if (!paircheck.allowed) return paircheck;
  }
  if (kind === "generatevalues" && options.valuegen !== void 0) {
    const rulecheck = validatevaluegen(options.valuegen);
    if (!rulecheck.allowed) return rulecheck;
  }
  if (kind === "saveprofiles" && !isnonempty(options.name)) return { allowed: false, reason: "A reviewed profile name is required in options." };
  if (kind === "submitform" && !isnonempty(options.consentref)) return { allowed: false, reason: "A reviewed consent ref of an approved asksubmit ticket is required in options." };
  if (kind === "retryform") {
    const backoff = options.backoff;
    if (!backoff || typeof backoff !== "object" || Array.isArray(backoff)) return { allowed: false, reason: "A reviewed backoff rule with wait and factor is required in options." };
    const rule = backoff;
    if (typeof rule.wait !== "number" || !Number.isFinite(rule.wait) || rule.wait <= 0) return { allowed: false, reason: "The reviewed retry backoff wait must be a positive number of milliseconds with no code ceiling." };
    if (typeof rule.factor !== "number" || !Number.isFinite(rule.factor) || rule.factor < 1) return { allowed: false, reason: "The reviewed retry backoff factor must be one or greater with no code ceiling." };
    if (options.attempts !== void 0 && (typeof options.attempts !== "number" || !Number.isInteger(options.attempts) || options.attempts < 1)) return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
  }
  if (kind === "runwizard" && options.steps !== void 0 && (typeof options.steps !== "number" || !Number.isInteger(options.steps) || options.steps < 1)) return { allowed: false, reason: "The reviewed wizard step count must be a positive integer with no code ceiling." };
  if (kind === "selectchain") {
    if (!isnonempty(options.child)) return { allowed: false, reason: "A reviewed child selector of the dependent control is required in options." };
    if (!nonnegativeoption(options, "wait")) return { allowed: false, reason: "The reviewed dependent wait must be zero or a positive number of milliseconds." };
  }
  if (kind === "picktypeahead") {
    if (!isnonempty(options.pick)) return { allowed: false, reason: "A reviewed suggestion entry to pick is required in options." };
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The reviewed typeahead timeout must be zero or a positive number of milliseconds." };
  }
  if (kind === "pickdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (kind === "fillcard") {
    const segmentcheck = validatecardsegments(options.segments);
    if (!segmentcheck.allowed) return segmentcheck;
    if (!nonnegativeoption(options, "pause")) return { allowed: false, reason: "The reviewed card typing pause must be zero or a positive number of milliseconds." };
  }
  if (kind === "fillcode" && !isnonempty(options.source)) return { allowed: false, reason: "A reviewed one time code source is required in options." };
  if (kind === "consentpassword" && !isnonempty(options.consentref)) return { allowed: false, reason: "A reviewed consent ref is required in options before any password is filled." };
  return { allowed: true };
}
function validatetransformrule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed transform rule with an expression, sources and a target is required in options." };
  const rule = value;
  const expression = rule.expression;
  if (typeof expression !== "string" || !/^(trim|upper|lower|number|prefix|suffix|replace)(?::.+)?$/.test(expression)) return { allowed: false, reason: "The reviewed transform expression must be trim, upper, lower, number, prefix, suffix or replace with an optional argument." };
  if (expression.startsWith("replace") && !expression.slice("replace".length).includes("=>")) return { allowed: false, reason: "The reviewed replace expression needs the from=>to separator." };
  if (expression.startsWith("replace") && expression.slice("replace:".length).split("=>")[0] === "") return { allowed: false, reason: "The reviewed replace expression needs a non-empty from part." };
  if (!Array.isArray(rule.sources) || rule.sources.length === 0 || !rule.sources.every((source) => isnonempty(source))) return { allowed: false, reason: "Every reviewed transform rule needs a non-empty list of source columns." };
  if (!isnonempty(rule.target)) return { allowed: false, reason: "Every reviewed transform rule needs a non-empty target column." };
  return { allowed: true };
}
function validatedatasetids(options, key) {
  const ids = options[key];
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => isnonempty(id))) return { allowed: false, reason: `A reviewed non-empty list of dataset ids is required in options as ${key}.` };
  return { allowed: true };
}
function validatedatagrammar(step, options, origin) {
  const kind = step.kind;
  if (kind === "scrapetable") {
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (options.rowlimit !== void 0 && (typeof options.rowlimit !== "number" || !Number.isInteger(options.rowlimit) || options.rowlimit < 1)) return { allowed: false, reason: "The reviewed row limit must be a positive integer with no code ceiling." };
  }
  if (kind === "paginateextract") {
    if (!isnonempty(options.next)) return { allowed: false, reason: "A reviewed next control selector is required in options." };
    if (options.pages !== void 0 && (typeof options.pages !== "number" || !Number.isInteger(options.pages) || options.pages < 1)) return { allowed: false, reason: "The reviewed page count must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(options, "wait")) return { allowed: false, reason: "The reviewed row freshness wait must be zero or a positive number of milliseconds." };
  }
  if (kind === "exportcsv" || kind === "exportjson" || kind === "exportexcel" || kind === "copytable" || kind === "streamdisk") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  }
  if (kind === "exportcsv" && options.delimiter !== void 0 && (typeof options.delimiter !== "string" || options.delimiter.length !== 1)) return { allowed: false, reason: "The reviewed csv delimiter must be a single character." };
  if (kind === "streamdisk" && (typeof options.chunk !== "number" || !Number.isInteger(options.chunk) || options.chunk < 1)) return { allowed: false, reason: "The reviewed streaming chunk size must be a positive integer with no code ceiling." };
  if (kind === "pushsheets") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (!isnonempty(options.sheet)) return { allowed: false, reason: "A reviewed sheet endpoint url is required in options." };
    if (!ishttpsurl(options.sheet)) return { allowed: false, reason: "The reviewed sheet endpoint url must use HTTPS." };
    if (options.reviewed !== true) return { allowed: false, reason: "The sheet push needs the explicit reviewed flag before any data leaves local memory." };
  }
  if (kind === "importcsv") {
    if (typeof options.csv !== "string" || !options.csv.trim()) return { allowed: false, reason: "Reviewed csv content is required in options." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed dataset name must be a non-empty string." };
    if (options.mapping !== void 0) {
      const mapping = options.mapping;
      if (!mapping || typeof mapping !== "object" || Array.isArray(mapping) || !Object.values(mapping).every((item) => typeof item === "string")) return { allowed: false, reason: "The reviewed csv column mapping must be an object of string values." };
    }
  }
  if (kind === "looprows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.variable !== void 0 && !isnonempty(options.variable)) return { allowed: false, reason: "The reviewed row variable name must be a non-empty string." };
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
  }
  if (kind === "transformvalues") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "A reviewed non-empty list of transform rules is required in options." };
    for (const item of rules) {
      const rulecheck = validatetransformrule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  if (kind === "deduperows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    const keys = options.keys;
    if (!Array.isArray(keys) || keys.length === 0 || !keys.every((key) => isnonempty(key))) return { allowed: false, reason: "A reviewed non-empty list of dedupe column keys is required in options." };
  }
  if (kind === "mergepages") {
    const listcheck = validatedatasetids(options, "datasets");
    if (!listcheck.allowed) return listcheck;
  }
  if (kind === "stamplerows") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.url !== void 0 && !ishttpsurl(options.url)) return { allowed: false, reason: "The reviewed source url must use HTTPS." };
  }
  if (kind === "previewgrid") {
    if (!isnonempty(options.dataset)) return { allowed: false, reason: "A reviewed dataset id is required in options." };
    if (options.sample !== void 0 && (typeof options.sample !== "number" || !Number.isInteger(options.sample) || options.sample < 1)) return { allowed: false, reason: "The reviewed sample row count must be a positive integer with no code ceiling." };
  }
  if (kind === "resumeextract" && !isnonempty(options.session)) return { allowed: false, reason: "A reviewed extract session id is required in options." };
  if (kind === "logprovenance" && !isnonempty(options.artifact)) return { allowed: false, reason: "A reviewed artifact id or name is required in options." };
  return { allowed: true };
}
function validatedownloadspec(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed downloadspec with a url list is required in options." };
  const spec = value;
  if (!Array.isArray(spec.urls) || spec.urls.length === 0 || !spec.urls.every((url) => ishttpsurl(url))) return { allowed: false, reason: "The reviewed downloadspec needs a non-empty list of HTTPS urls." };
  if (spec.filename !== void 0 && !isnonempty(spec.filename)) return { allowed: false, reason: "The reviewed downloadspec filename rule must be a non-empty string." };
  if (spec.complete !== void 0 && spec.complete !== "size" && spec.complete !== "checksum") return { allowed: false, reason: "The reviewed downloadspec completion criterion must be size or checksum." };
  return { allowed: true };
}
function validatemimefilter(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed mimefilter with include and exclude patterns is required in options." };
  const filter = value;
  if (!Array.isArray(filter.include) || filter.include.length === 0 || !filter.include.every((pattern) => isnonempty(pattern))) return { allowed: false, reason: "The reviewed mimefilter needs a non-empty list of include patterns." };
  if (filter.exclude !== void 0 && (!Array.isArray(filter.exclude) || !filter.exclude.every((pattern) => isnonempty(pattern)))) return { allowed: false, reason: "The reviewed mimefilter exclude patterns must be a list of non-empty strings." };
  if (filter.default !== "deny" && filter.default !== "allow") return { allowed: false, reason: "The reviewed mimefilter needs the deny or allow default for unlisted mime types." };
  return { allowed: true };
}
function validatecleanuprule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed cleanuprule with an age, a kind and a keep policy is required." };
  const rule = value;
  if (typeof rule.age !== "number" || !Number.isFinite(rule.age) || rule.age <= 0) return { allowed: false, reason: "The reviewed cleanup age window must be a positive number of milliseconds with no code ceiling." };
  if (!isnonempty(rule.kind)) return { allowed: false, reason: "The reviewed cleanup rule needs a non-empty artifact kind, or any to match every kind." };
  if (rule.keep !== "none" && rule.keep !== "latest" && rule.keep !== "all") return { allowed: false, reason: "The reviewed cleanup keep policy must be none, latest or all." };
  return { allowed: true };
}
function validatefilesgrammar(step, options) {
  const kind = step.kind;
  if (kind === "batchdownload") {
    const speccheck = validatedownloadspec(options.downloadspec);
    if (!speccheck.allowed) return speccheck;
    if (options.concurrent !== void 0 && (typeof options.concurrent !== "number" || !Number.isInteger(options.concurrent) || options.concurrent < 1)) return { allowed: false, reason: "The reviewed concurrent download window must be a positive integer with no code ceiling." };
  }
  if (kind === "pausedownload" || kind === "resumedownload" || kind === "verifydownload" || kind === "quarantinedownload" || kind === "scanvirus") {
    if (!isnonempty(step.value)) return { allowed: false, reason: "A reviewed download or quarantine reference is required." };
    if (kind === "verifydownload") {
      if (options.checksum !== void 0 && !isnonempty(options.checksum)) return { allowed: false, reason: "The reviewed expected checksum must be a non-empty string." };
      if (options.bytes !== void 0 && (typeof options.bytes !== "number" || !Number.isFinite(options.bytes) || options.bytes < 0)) return { allowed: false, reason: "The reviewed expected size must be zero or a positive number of bytes." };
    }
    if (kind === "scanvirus" && options.scanner !== void 0 && !isnonempty(options.scanner)) return { allowed: false, reason: "The reviewed scanner name must be a non-empty string." };
    if (kind === "quarantinedownload" && options.reason !== void 0 && !isnonempty(options.reason)) return { allowed: false, reason: "The reviewed quarantine reason must be a non-empty string." };
  }
  if (kind === "interceptmime") {
    const filtercheck = validatemimefilter(options.mimefilter);
    if (!filtercheck.allowed) return filtercheck;
  }
  if (kind === "readclipboard") {
    if (!isnonempty(options.consentref)) return { allowed: false, reason: "A clipboard read requires a reviewed consent ref of an approved consent prompt in options." };
    if (options.prompt !== void 0 && !isnonempty(options.prompt)) return { allowed: false, reason: "The reviewed clipboard consent prompt must be a non-empty string." };
  }
  if (kind === "exportnetlog" && options.stepid !== void 0 && !isnonempty(options.stepid)) return { allowed: false, reason: "The reviewed netlog step filter must be a non-empty step id." };
  if (kind === "namecaptures") {
    if (!isnonempty(options.task)) return { allowed: false, reason: "A reviewed task id is required in options for capture naming." };
    if (options.steps !== void 0 && (!Array.isArray(options.steps) || options.steps.length === 0 || !options.steps.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed capture steps must be a non-empty list of step ids when present." };
    if (options.extension !== void 0 && !isnonempty(options.extension)) return { allowed: false, reason: "The reviewed capture extension must be a non-empty string." };
  }
  if (kind === "cleanupartifacts" && options.rules !== void 0) {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "The reviewed cleanup rules must be a non-empty list when present." };
    for (const item of rules) {
      const rulecheck = validatecleanuprule(item);
      if (!rulecheck.allowed) return rulecheck;
    }
  }
  return { allowed: true };
}
function submitreviewgranted(steps, submitid) {
  const position = steps.findIndex((candidate) => candidate.id === submitid);
  const asked = steps.some((candidate, index) => candidate.kind === "asksubmit" && (position === -1 || index < position));
  return asked ? { allowed: true } : { allowed: false, reason: "Form submission requires an asksubmit review step before it." };
}
function waitduration(step) {
  const requested = step.value ? Number.parseInt(step.value, 10) : 250;
  if (!Number.isFinite(requested) || requested < 0) throw new Error("Wait duration must be zero or a positive number of milliseconds.");
  return requested;
}
function isnumericid(value) {
  return typeof value === "string" && /^\d+$/.test(value);
}
function numericoption(options, key) {
  return options[key] === void 0 || typeof options[key] === "number" && Number.isFinite(options[key]);
}
function nonnegativeoption(options, key) {
  return numericoption(options, key) && !(typeof options[key] === "number" && options[key] < 0);
}
function isnonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function ispoint(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const point = value;
  return typeof point.x === "number" && Number.isFinite(point.x) && typeof point.y === "number" && Number.isFinite(point.y);
}
function validatetargetref(reference) {
  if (!reference || typeof reference !== "object" || Array.isArray(reference)) return { allowed: false, reason: "The reviewed target reference must be an object." };
  const ref = reference;
  if (ref.mode === "selector") return isnonempty(ref.selector) ? { allowed: true } : { allowed: false, reason: "The selector target reference needs a non-empty selector." };
  if (ref.mode === "text") return isnonempty(ref.text) ? { allowed: true } : { allowed: false, reason: "The text target reference needs non-empty text." };
  if (ref.mode === "aria") {
    if (!isnonempty(ref.role)) return { allowed: false, reason: "The aria target reference needs a non-empty role." };
    return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The aria target reference needs a non-empty name." };
  }
  if (ref.mode === "name") return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The name target reference needs a non-empty name." };
  if (ref.mode === "xpath") return isnonempty(ref.xpath) ? { allowed: true } : { allowed: false, reason: "The xpath target reference needs a non-empty expression." };
  if (ref.mode === "index") {
    const index = ref.index;
    return typeof index === "number" && Number.isInteger(index) && index >= 1 ? { allowed: true } : { allowed: false, reason: "The index target reference needs a positive integer map number." };
  }
  if (ref.mode === "point") {
    const pointok = typeof ref.x === "number" && Number.isFinite(ref.x) && typeof ref.y === "number" && Number.isFinite(ref.y);
    return pointok ? { allowed: true } : { allowed: false, reason: "The point target reference needs numeric x and y coordinates." };
  }
  return { allowed: false, reason: "The target reference mode must be selector, text, aria, name, xpath, index or point." };
}
function validateinnerstep(options, origin) {
  const stepid = options.stepid;
  const kind = options.kind;
  if (isnonempty(stepid)) {
    if (kind !== void 0) return { allowed: false, reason: "The reviewed wrapper must reference a step id or an inline step, not both." };
    return { allowed: true };
  }
  if (typeof kind !== "string" || !kind.trim()) return { allowed: false, reason: "A reviewed step id or inline step kind is required in options." };
  if (kind === "retryaction" || kind === "enterframe" || kind === "looprows") return { allowed: false, reason: "The reviewed inner step cannot be another wrapper kind." };
  if (!allowedactions.has(kind)) return { allowed: false, reason: "The reviewed inner step kind is unsupported." };
  const inneroptions = options.options;
  if (inneroptions !== void 0 && (!inneroptions || typeof inneroptions !== "object" || Array.isArray(inneroptions))) return { allowed: false, reason: "The reviewed inner step options must be an object." };
  const inner = {
    id: "inner",
    kind,
    summary: "Reviewed inner step.",
    risk: actionrisk(kind),
    ...isnonempty(options.target) ? { target: options.target } : {},
    ...isnonempty(options.value) ? { value: options.value } : {},
    ...inneroptions !== void 0 ? { options: JSON.stringify(inneroptions) } : {}
  };
  return validatestep(inner, origin);
}
function ishttpsurl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
function validatenavtarget(value, kind) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed navtarget with a url is required in options." };
  const target = value;
  if (!ishttpsurl(target.url)) return { allowed: false, reason: "The reviewed navtarget url must use HTTPS." };
  const container = target.container ?? "tab";
  if (container !== "current" && container !== "tab" && container !== "window" && container !== "private") return { allowed: false, reason: "The reviewed navtarget container must be current, tab, window or private." };
  if (target.position !== void 0 && target.position !== "adjacent" && target.position !== "end") return { allowed: false, reason: "The reviewed navtarget position must be adjacent or end." };
  if (kind === "openprivate" && container !== "private") return { allowed: false, reason: "The openprivate step requires the private container." };
  if (kind === "openlink" && container === "private") return { allowed: false, reason: "The openlink step cannot open the private container; use openprivate." };
  return { allowed: true };
}
function validatewaitprofile(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed waitprofile with load signals is required in options." };
  const profile = value;
  if (!Array.isArray(profile.signals) || profile.signals.length === 0 || !profile.signals.every((signal) => isnonempty(signal))) return { allowed: false, reason: "The reviewed waitprofile needs a non-empty list of load signals." };
  if (!nonnegativeoption(profile, "idle")) return { allowed: false, reason: "The reviewed waitprofile idle threshold must be zero or a positive number of milliseconds." };
  if (!nonnegativeoption(profile, "timeout")) return { allowed: false, reason: "The reviewed waitprofile timeout must be zero or a positive number of milliseconds." };
  if (profile.overrides !== void 0) {
    if (!Array.isArray(profile.overrides) || profile.overrides.length === 0) return { allowed: false, reason: "The reviewed waitprofile overrides must be a non-empty list when present." };
    for (const entry of profile.overrides) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return { allowed: false, reason: "Every reviewed waitprofile override must be an object with an origin." };
      const override = entry;
      if (!ishttpsurl(override.origin)) return { allowed: false, reason: "Every reviewed waitprofile override origin must use HTTPS." };
      if (override.signals !== void 0 && (!Array.isArray(override.signals) || !override.signals.every((signal) => isnonempty(signal)))) return { allowed: false, reason: "The reviewed waitprofile override signals must be a list of non-empty strings." };
      if (!nonnegativeoption(override, "idle") || !nonnegativeoption(override, "timeout")) return { allowed: false, reason: "The reviewed waitprofile override thresholds must be zero or positive numbers." };
    }
  }
  return { allowed: true };
}
function validateurlpattern(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed urlpattern is required in options." };
  const pattern = value;
  if (pattern.mode !== "exact" && pattern.mode !== "prefix" && pattern.mode !== "host" && pattern.mode !== "pattern") return { allowed: false, reason: "The reviewed urlpattern mode must be exact, prefix, host or pattern." };
  if (!ishttpsurl(pattern.url)) return { allowed: false, reason: "The reviewed urlpattern url must use HTTPS." };
  if (pattern.query !== void 0) {
    if (!pattern.query || typeof pattern.query !== "object" || Array.isArray(pattern.query)) return { allowed: false, reason: "The reviewed urlpattern query part must be an object of parameter names and values." };
    for (const item of Object.values(pattern.query)) if (typeof item !== "string") return { allowed: false, reason: "The reviewed urlpattern query values must be strings." };
  }
  if (pattern.fragment !== void 0 && !isnonempty(pattern.fragment)) return { allowed: false, reason: "The reviewed urlpattern fragment must be a non-empty string." };
  return { allowed: true };
}
function validateurllist(options, key) {
  const urls = options[key];
  if (!Array.isArray(urls) || urls.length === 0 || !urls.every((url) => ishttpsurl(url))) return { allowed: false, reason: `A reviewed non-empty list of HTTPS urls is required in options as ${key}.` };
  return { allowed: true };
}
function validateratelimit(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed ratelimit with a window and a ceiling is required in options." };
  const limit = value;
  if (limit.domain !== void 0 && !isnonempty(limit.domain)) return { allowed: false, reason: "The reviewed ratelimit domain must be a non-empty string." };
  if (typeof limit.window !== "number" || !Number.isFinite(limit.window) || limit.window <= 0) return { allowed: false, reason: "The reviewed ratelimit window must be a positive number of milliseconds with no code ceiling." };
  if (typeof limit.ceiling !== "number" || !Number.isInteger(limit.ceiling) || limit.ceiling < 1) return { allowed: false, reason: "The reviewed ratelimit ceiling must be a positive integer with no code ceiling." };
  return { allowed: true };
}
function validatetabquery(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "A reviewed tabquery with at least one matcher is required in options." };
  const query = value;
  const hasmatcher = query.url !== void 0 || query.title !== void 0 || query.id !== void 0 || query.pattern !== void 0;
  if (!hasmatcher) return { allowed: false, reason: "The reviewed tabquery needs a url, title, id or pattern matcher." };
  if (query.url !== void 0 && !isnonempty(query.url)) return { allowed: false, reason: "The reviewed tabquery url matcher must be a non-empty string." };
  if (query.title !== void 0 && !isnonempty(query.title)) return { allowed: false, reason: "The reviewed tabquery title matcher must be a non-empty string." };
  if (query.pattern !== void 0 && !isnonempty(query.pattern)) return { allowed: false, reason: "The reviewed tabquery pattern matcher must be a non-empty string." };
  if (query.id !== void 0 && (typeof query.id !== "number" || !Number.isInteger(query.id) || query.id < 0)) return { allowed: false, reason: "The reviewed tabquery id matcher must be a non-negative integer tab id." };
  return { allowed: true };
}
function validategroupcolor(value) {
  return typeof value === "string" && groupcolors.includes(value);
}
function validateidlist(options, key) {
  const ids = options[key];
  return Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "number" && Number.isInteger(id) && id >= 0);
}
function validatetabsgrammar(step, options) {
  const kind = step.kind;
  if (kind === "querytabs" || kind === "closepattern") {
    const querycheck = validatetabquery(options.tabquery);
    if (!querycheck.allowed) return querycheck;
    if (kind === "closepattern" && options.reviewed !== true) return { allowed: false, reason: "The close pattern needs the explicit reviewed flag before any tab closes." };
  }
  if (kind === "duplicatetab" || kind === "pintab" || kind === "mutetab" || kind === "movetab" || kind === "movetabwindow" || kind === "badgetab" || kind === "attachmeta") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser tab id is required." };
  }
  if (kind === "focuswindow" || kind === "maximizewindow" || kind === "minimizewindow" || kind === "restorewindow") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser window id is required." };
  }
  if (kind === "pintab" && typeof options.pinned !== "boolean") return { allowed: false, reason: "A reviewed pinned flag is required in options." };
  if (kind === "mutetab" && typeof options.muted !== "boolean") return { allowed: false, reason: "A reviewed muted flag is required in options." };
  if (kind === "movetab") {
    if (typeof options.index !== "number" || !Number.isInteger(options.index) || options.index < 0) return { allowed: false, reason: "A reviewed non-negative target index is required in options." };
  }
  if (kind === "movetabwindow") {
    if (typeof options.windowid !== "number" || !Number.isInteger(options.windowid) || options.windowid < 0) return { allowed: false, reason: "A reviewed target window id is required in options." };
  }
  if (kind === "grouptabs") {
    const group = options.group;
    if (!group || typeof group !== "object" || Array.isArray(group)) return { allowed: false, reason: "A reviewed group with a name is required in options." };
    const spec = group;
    if (!isnonempty(spec.name)) return { allowed: false, reason: "The reviewed group needs a non-empty name." };
    if (!validategroupcolor(spec.color)) return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
    if (!validateidlist(spec, "tabids")) return { allowed: false, reason: "The reviewed group needs a non-empty list of member tab ids." };
  }
  if (kind === "colorgroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (!validategroupcolor(options.color)) return { allowed: false, reason: "The reviewed group color must be a Chromium tab group color." };
  }
  if (kind === "collapsegroup") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed group name is required in options." };
    if (typeof options.collapsed !== "boolean") return { allowed: false, reason: "A reviewed collapsed flag is required in options." };
  }
  if (kind === "discardtab" || kind === "reloadtabs") {
    if (!isnumericid(step.value) && !validateidlist(options, "tabs")) return { allowed: false, reason: "A numeric tab id or a reviewed list of tab ids is required." };
  }
  if (kind === "zoomin" || kind === "zoomout") {
    if (options.step !== void 0 && (typeof options.step !== "number" || !Number.isFinite(options.step) || options.step <= 0)) return { allowed: false, reason: "The reviewed zoom step must be a positive number with no code ceiling." };
    if (step.value !== void 0 && step.value !== "" && !isnumericid(step.value)) return { allowed: false, reason: "The reviewed zoom target must be a numeric tab id." };
  }
  if (kind === "switchtab") {
    if (options.direction !== "next" && options.direction !== "previous") return { allowed: false, reason: "A reviewed switch direction of next or previous is required in options." };
  }
  if (kind === "restorewindow") {
    const bounds = options.bounds;
    if (bounds !== void 0) {
      if (!bounds || typeof bounds !== "object" || Array.isArray(bounds)) return { allowed: false, reason: "The reviewed window bounds must be an object." };
      const shape = bounds;
      for (const field of ["left", "top", "width", "height"]) {
        if (typeof shape[field] !== "number" || !Number.isFinite(shape[field])) return { allowed: false, reason: "The reviewed window bounds need numeric left, top, width and height." };
      }
    }
  }
  if (kind === "scratchwindow") {
    if (step.value !== void 0 && step.value !== "" && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed scratch window url must use HTTPS." };
  }
  if (kind === "incognitowindow" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS url is required to open an incognito window." };
  if (kind === "restoretab" && step.value !== void 0 && step.value !== "" && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed restore url must use HTTPS." };
  if (kind === "savelayout" || kind === "restorelayout") {
    if (!isnonempty(options.name)) return { allowed: false, reason: "A reviewed layout name is required in options." };
  }
  if (kind === "badgetab") {
    if (!isnonempty(options.label)) return { allowed: false, reason: "A reviewed badge label is required in options." };
    if (options.taskid !== void 0 && !isnonempty(options.taskid)) return { allowed: false, reason: "The reviewed badge task id must be a non-empty string." };
  }
  if (kind === "attachmeta") {
    const labels = options.labels;
    const taskrefs = options.taskrefs;
    const haslabels = Array.isArray(labels) && labels.length > 0 && labels.every((label) => isnonempty(label));
    const hastaskrefs = Array.isArray(taskrefs) && taskrefs.length > 0 && taskrefs.every((ref) => isnonempty(ref));
    if (!haslabels && !hastaskrefs) return { allowed: false, reason: "Reviewed labels or task refs are required in options to attach metadata." };
    if (options.provenance !== void 0 && !isnonempty(options.provenance)) return { allowed: false, reason: "The reviewed provenance must be a non-empty string." };
  }
  if (kind === "reopenrun" && !isnonempty(options.run)) return { allowed: false, reason: "A reviewed run id is required in options to reopen its tabs." };
  return { allowed: true };
}
function ismediakind(kind) {
  return mediaactions.has(kind);
}
function ishttpkind(kind) {
  return httpactions.has(kind);
}
function issocketkind(kind) {
  return socketactions.has(kind);
}
function isnetwatchkind(kind) {
  return netwatchactions.has(kind);
}
function iscontrolkind(kind) {
  return controlactions.has(kind);
}
function resolvedrisk(step) {
  if (step.kind === "capturebodies") {
    let options = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const body = options.body;
    const mimes = body && typeof body === "object" && !Array.isArray(body) ? body.mimes : void 0;
    if (Array.isArray(mimes) && mimes.some((mime) => typeof mime === "string" && privatemime(mime))) return "sensitive";
    return "interaction";
  }
  if (step.kind === "extractapi") {
    let options = {};
    try {
      options = parseoptions(step);
    } catch {
      options = {};
    }
    const replay = options.replay;
    const verb = replay && typeof replay === "object" && !Array.isArray(replay) ? replay.verb : void 0;
    if (typeof verb === "string" && !["GET", "HEAD", "OPTIONS"].includes(verb.trim().toUpperCase())) return "sensitive";
    return "read";
  }
  return actionrisk(step.kind);
}
function credentialheadername(name) {
  return credentialheaders.has(name.trim().toLowerCase());
}
function fetchconsentrefgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  const headers = request && typeof request === "object" && !Array.isArray(request) ? request.headers : void 0;
  const names = headers && typeof headers === "object" && !Array.isArray(headers) ? Object.keys(headers) : [];
  if (names.length === 0) return { allowed: true };
  const empty = names.some((name) => !name.trim());
  if (empty) return { allowed: false, reason: "Header allowlists with empty names are refused." };
  const credential = names.find((name) => credentialheadername(name));
  if (credential !== void 0 && !isnonempty(options.consentref)) return { allowed: false, reason: `The credential bearing header ${credential} needs the explicit reviewed consent that names it before it is sent.` };
  if (!isnonempty(options.consentref)) return { allowed: false, reason: `The ${names.length} reviewed custom header${names.length === 1 ? "" : "s"} need a reviewed consent ref in options before any send.` };
  return { allowed: true };
}
function fetchbudgetallowed(timeout, retries, backoff, wait) {
  for (const [label, value] of [["timeout", timeout], ["retries", retries], ["backoff", backoff]]) {
    if (value !== void 0 && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) return { allowed: false, reason: `The reviewed fetch ${label} must be zero or a positive number with no code ceiling.` };
  }
  if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed fetch wait budget must be zero or a positive number of milliseconds." };
  if (wait === void 0 || timeout === void 0) return { allowed: true };
  const attempts = Math.max(1, Math.floor(retries ?? 0) + 1);
  const waits = (backoff ?? 0) * (attempts * (attempts - 1)) / 2;
  const worstcase = timeout * attempts + waits;
  if (worstcase > wait) return { allowed: false, reason: `The fetch worst case of ${worstcase} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or fewer retries.` };
  return { allowed: true };
}
function outboundtarget(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const request = options.fetch;
  if (request && typeof request === "object" && !Array.isArray(request)) {
    const url = request.url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }
  return void 0;
}
function validpath(path) {
  return path.split(".").every((segment) => /^[A-Za-z0-9_-]+$/.test(segment));
}
function validatehttpgrammar(step, options) {
  const kind = step.kind;
  if (kind === "fetchurl") {
    const request = options.fetch;
    if (!request || typeof request !== "object" || Array.isArray(request)) return { allowed: false, reason: "A reviewed fetch request with a url is required in options.fetch." };
    const fetchrequest = request;
    if (typeof fetchrequest.url !== "string" || !fetchrequest.url.trim()) return { allowed: false, reason: "The reviewed fetch request needs a non-empty url." };
    if (fetchrequest.method !== void 0 && (typeof fetchrequest.method !== "string" || !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(fetchrequest.method.trim().toUpperCase()))) return { allowed: false, reason: "The reviewed fetch method must be a known HTTP verb." };
    if (fetchrequest.headers !== void 0) {
      if (!fetchrequest.headers || typeof fetchrequest.headers !== "object" || Array.isArray(fetchrequest.headers)) return { allowed: false, reason: "The reviewed header allowlist must be an object of custom headers." };
      for (const name of Object.keys(fetchrequest.headers)) {
        if (!name.trim()) return { allowed: false, reason: "Header allowlists with empty names are refused." };
        if (typeof fetchrequest.headers[name] !== "string") return { allowed: false, reason: `The reviewed header ${name} needs a string value.` };
      }
    }
    if (fetchrequest.body !== void 0 && typeof fetchrequest.body !== "string") return { allowed: false, reason: "The reviewed fetch body must be a string." };
    if (fetchrequest.mode !== void 0 && fetchrequest.mode !== "cors" && fetchrequest.mode !== "no-cors" && fetchrequest.mode !== "same-origin") return { allowed: false, reason: "The reviewed fetch mode must be cors, no-cors or same-origin." };
    const consentgate = fetchconsentrefgranted(step);
    if (!consentgate.allowed) return consentgate;
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(fetchpolicy.timeout, fetchpolicy.retries, fetchpolicy.backoff, fetchnumeric(options, "wait"));
    if (!budget.allowed) return budget;
    if (options.stream !== void 0) {
      if (!options.stream || typeof options.stream !== "object" || Array.isArray(options.stream)) return { allowed: false, reason: "The reviewed stream window must be an object with an optional byte budget." };
      const streambudget = options.stream.budget;
      if (streambudget !== void 0 && (typeof streambudget !== "number" || !Number.isFinite(streambudget) || streambudget < 0)) return { allowed: false, reason: "The reviewed stream byte budget must be zero or a positive number of bytes with no code ceiling." };
    }
  }
  if (kind === "parsejson") {
    if (!isnonempty(options.call)) return { allowed: false, reason: "A reviewed stored call id is required in options.call before the body parses." };
    const fields = options.fields;
    if (!Array.isArray(fields) || fields.length === 0) return { allowed: false, reason: "A reviewed non-empty list of json path rules is required in options.fields." };
    for (const item of fields) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every json path rule must be an object." };
      const rule = item;
      if (!isnonempty(rule.name)) return { allowed: false, reason: "Every json path rule needs a non-empty field name." };
      if (typeof rule.path !== "string" || !rule.path.trim() || !validpath(rule.path.trim())) return { allowed: false, reason: `The json path of ${rule.name} must be a dotted path of non-empty segments.` };
      if (rule.kind !== void 0 && rule.kind !== "text" && rule.kind !== "number" && rule.kind !== "boolean" && rule.kind !== "json") return { allowed: false, reason: `The json path kind of ${rule.name} must be text, number, boolean or json.` };
    }
  }
  if (kind === "parsehtml") {
    if (!isnonempty(options.call)) return { allowed: false, reason: "A reviewed stored call id is required in options.call before the markup parses." };
    const queries = options.queries;
    if (!Array.isArray(queries) || queries.length === 0) return { allowed: false, reason: "A reviewed non-empty list of html queries is required in options.queries." };
    for (const item of queries) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return { allowed: false, reason: "Every html query must be an object." };
      const query = item;
      if (!isnonempty(query.selector)) return { allowed: false, reason: "Every html query needs a selector from the reviewed selector grammar." };
      if (query.attribute !== void 0 && !isnonempty(query.attribute)) return { allowed: false, reason: "The reviewed html query attribute must be a non-empty attribute name." };
      if (query.multi !== void 0 && typeof query.multi !== "boolean") return { allowed: false, reason: "The reviewed html query multi flag must be a boolean." };
    }
  }
  if (kind === "callrest" || kind === "callgraphql") {
    if (!isnonempty(options.endpoint)) return { allowed: false, reason: "A reviewed typed endpoint name is required in options.endpoint." };
    if (kind === "callrest") {
      if (options.payload !== void 0 && (!options.payload || typeof options.payload !== "object" || Array.isArray(options.payload))) return { allowed: false, reason: "The reviewed rest payload must be an object of reviewed values." };
      if (options.method !== void 0 && (typeof options.method !== "string" || !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(options.method.trim().toUpperCase()))) return { allowed: false, reason: "The reviewed endpoint method override must be a known HTTP verb." };
      if (options.success !== void 0 && (!Array.isArray(options.success) || !options.success.every((code) => typeof code === "number" && Number.isInteger(code)))) return { allowed: false, reason: "The reviewed success status list must be a list of integer status codes." };
    }
    if (kind === "callgraphql") {
      const request = options.graphql;
      if (!request || typeof request !== "object" || Array.isArray(request)) return { allowed: false, reason: "A reviewed graphql request with an operation is required in options.graphql." };
      const graphql = request;
      if (typeof graphql.query !== "string" || !graphql.query.trim()) return { allowed: false, reason: "The reviewed graphql operation text must be a non-empty string." };
      if (graphql.operationkind !== "query" && graphql.operationkind !== "mutation") return { allowed: false, reason: "The reviewed graphql operation kind must be query or mutation; unknown operation kinds are refused." };
      if (graphql.variables !== void 0 && (!graphql.variables || typeof graphql.variables !== "object" || Array.isArray(graphql.variables))) return { allowed: false, reason: "The reviewed graphql variables must be an object of reviewed values." };
      if (graphql.operationname !== void 0 && !isnonempty(graphql.operationname)) return { allowed: false, reason: "The reviewed graphql operation name must be a non-empty string." };
    }
    if (options.apikeys !== void 0 && (!Array.isArray(options.apikeys) || !options.apikeys.every((name) => isnonempty(name)))) return { allowed: false, reason: "The reviewed api key reference list must be a list of non-empty stored names." };
    const policycheck = validatefetchoptions(options.fetchoptions);
    if (!policycheck.allowed) return policycheck;
    const fetchpolicy = fetchoptionsvalues(options.fetchoptions);
    const budget = fetchbudgetallowed(fetchpolicy.timeout, fetchpolicy.retries, fetchpolicy.backoff, fetchnumeric(options, "wait"));
    if (!budget.allowed) return budget;
  }
  return { allowed: true };
}
function validatefetchoptions(value) {
  if (value === void 0) return { allowed: true };
  if (!value || typeof value !== "object" || Array.isArray(value)) return { allowed: false, reason: "The reviewed fetch options must be an object with timeout, retries, backoff and follow." };
  const options = value;
  for (const key of ["timeout", "backoff"]) {
    if (options[key] !== void 0 && (typeof options[key] !== "number" || !Number.isFinite(options[key]) || options[key] < 0)) return { allowed: false, reason: `The reviewed fetch ${key} must be zero or a positive number with no code ceiling.` };
  }
  for (const key of ["retries", "follow"]) {
    if (options[key] !== void 0 && (typeof options[key] !== "number" || !Number.isInteger(options[key]) || options[key] < 0)) return { allowed: false, reason: `The reviewed fetch ${key} must be zero or a positive integer with no code ceiling.` };
  }
  return { allowed: true };
}
function fetchoptionsvalues(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const options = value;
  return { timeout: fetchnumeric(options, "timeout"), retries: fetchnumeric(options, "retries"), backoff: fetchnumeric(options, "backoff") };
}
function fetchnumeric(options, key) {
  const value = options[key];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function validatesocketgrammar(step, options) {
  const kind = step.kind;
  if (kind === "opensocket") {
    const channel = channeloptionsof(options.socket);
    if (!channel) return { allowed: false, reason: "A reviewed socket with a url is required in options.socket." };
    if (channel.options.reconnect !== void 0 && !Number.isInteger(channel.options.reconnect)) return { allowed: false, reason: "The reviewed socket reconnect budget must be an integer attempt count with no code ceiling." };
    for (const label of ["backoff", "backoffceiling"]) {
      const value = channel.options[label];
      if (value !== void 0 && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) return { allowed: false, reason: `The reviewed socket ${label} must be zero or a positive number of milliseconds with no code ceiling.` };
    }
    if (channel.options.lifetime !== void 0 && (typeof channel.options.lifetime !== "number" || !Number.isFinite(channel.options.lifetime) || channel.options.lifetime <= 0)) return { allowed: false, reason: "The reviewed socket lifetime window must be a positive number of milliseconds." };
    if (options.graphql !== void 0) {
      const subscription = graphqlsubscriptionof(options.graphql);
      if (!subscription) return { allowed: false, reason: "A reviewed graphql subscription with a query and its websocket channel is required in options.graphql." };
      if (!isnonempty(subscription.channel)) return { allowed: false, reason: "The graphql subscription names its websocket channel in options.graphql.channel; a subscription without its channel rides nothing." };
    }
  }
  if (kind === "sendmessage") {
    const message = options.message;
    if (!message || typeof message !== "object" || Array.isArray(message)) return { allowed: false, reason: "A reviewed message with a channel, stream and payload is required in options.message." };
    const envelope = message;
    if (!isnonempty(envelope.channel)) return { allowed: false, reason: "The reviewed message needs the open channel id in options.message.channel." };
    if (envelope.stream !== void 0 && !isnonempty(envelope.stream)) return { allowed: false, reason: "The reviewed message stream name must be a non-empty string." };
    if (typeof envelope.payload !== "string") return { allowed: false, reason: "The reviewed message payload must be a string." };
  }
  if (kind === "waitmessage") {
    if (options.filter !== void 0) {
      const filter = options.filter;
      if (!filter || typeof filter !== "object" || Array.isArray(filter)) return { allowed: false, reason: "The reviewed message filter must be an object of stream, path and limit." };
      const reviewed = filter;
      if (reviewed.stream !== void 0 && !isnonempty(reviewed.stream)) return { allowed: false, reason: "The reviewed message filter stream name must be a non-empty string." };
      if (reviewed.path !== void 0 && (typeof reviewed.path !== "string" || !validpath(reviewed.path.trim()))) return { allowed: false, reason: "The reviewed message filter path must be a dotted path of non-empty segments." };
      if (reviewed.limit !== void 0 && (typeof reviewed.limit !== "number" || !Number.isInteger(reviewed.limit) || reviewed.limit < 1)) return { allowed: false, reason: "The reviewed message match limit must be a positive integer with no code ceiling." };
    }
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed message wait budget must be zero or a positive number of milliseconds." };
  }
  if (kind === "subscribesse") {
    const subscription = subscriptionoptionsof(options.subscription);
    if (!subscription) return { allowed: false, reason: "A reviewed subscription with an event stream url and a cancellation path is required in options.subscription." };
    const rawlifetime = options.subscription && typeof options.subscription === "object" && !Array.isArray(options.subscription) ? options.subscription.lifetime : void 0;
    if (rawlifetime !== void 0 && (typeof rawlifetime !== "number" || !Number.isFinite(rawlifetime) || rawlifetime <= 0)) return { allowed: false, reason: "The reviewed subscription lifetime window must be a positive number of milliseconds." };
  }
  if (kind === "longpoll") {
    const cursor = pollcursorof(options.poll);
    if (!cursor) return { allowed: false, reason: "A reviewed poll cursor with a url, cursor field, interval and stop condition is required in options.poll." };
    const wait = options.wait;
    if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed long poll wait budget must be zero or a positive number of milliseconds." };
    if (wait !== void 0 && cursor.interval > wait) return { allowed: false, reason: `The long poll interval of ${cursor.interval} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter interval.` };
    if (options.pollrequest !== void 0) {
      const request = longpollrequestof(options.pollrequest);
      if (!request) return { allowed: false, reason: "A reviewed poll request with a url is required in options.pollrequest; the timeout and the resume cursor stay optional user choices." };
      if (request.timeout !== void 0 && (typeof request.timeout !== "number" || !Number.isFinite(request.timeout) || request.timeout <= 0)) return { allowed: false, reason: "The reviewed poll request timeout must be a positive number of milliseconds with no code default." };
    }
  }
  return { allowed: true };
}
function validatenetwatchgrammar(step, options) {
  const kind = step.kind;
  if (kind === "watchrequests") {
    if (options.watch !== void 0) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed watch window must be an object." };
      const reviewed = watch;
      if (reviewed.window !== void 0 && (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0)) return { allowed: false, reason: "The reviewed watch window must be zero or a positive number of milliseconds." };
    }
    if (options.limit !== void 0 && (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)) return { allowed: false, reason: "The reviewed watch match limit must be a positive integer with no code ceiling." };
  }
  if (kind === "readheaders") {
    const headers = options.headers;
    if (!headers || typeof headers !== "object" || Array.isArray(headers)) return { allowed: false, reason: "A reviewed header filter with a name allowlist and a redaction list is required in options.headers." };
    const reviewed = headers;
    if (!Array.isArray(reviewed.allow) || reviewed.allow.length === 0 || !reviewed.allow.every((name) => isnonempty(name))) return { allowed: false, reason: "The reviewed header allowlist must be a non-empty list of header names." };
    if (!Array.isArray(reviewed.redact) || reviewed.redact.length === 0 || !reviewed.redact.every((name) => isnonempty(name))) return { allowed: false, reason: "Header capture requires a reviewed redaction list before any header value is stored." };
  }
  if (kind === "capturebodies") {
    const body = options.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return { allowed: false, reason: "A reviewed body filter with a url pattern, mime list and byte ceiling is required in options.body." };
    const reviewed = body;
    if (reviewed.urlpattern !== void 0 && !isnonempty(reviewed.urlpattern)) return { allowed: false, reason: "The reviewed body url pattern must be a non-empty string." };
    if (reviewed.mimes !== void 0 && (!Array.isArray(reviewed.mimes) || reviewed.mimes.length === 0 || !reviewed.mimes.every((mime) => isnonempty(mime)))) return { allowed: false, reason: "The reviewed body mime list must be a non-empty list of mime types." };
    if (reviewed.ceiling !== void 0 && (typeof reviewed.ceiling !== "number" || !Number.isFinite(reviewed.ceiling) || reviewed.ceiling < 0)) return { allowed: false, reason: "The reviewed body byte ceiling must be zero or a positive number of bytes with no code ceiling." };
  }
  if (kind === "mapapi") {
    if (options.limit !== void 0 && (typeof options.limit !== "number" || !Number.isInteger(options.limit) || options.limit < 1)) return { allowed: false, reason: "The reviewed mapapi match limit must be a positive integer with no code ceiling." };
  }
  if (kind === "extractapi") {
    const replay = apireplayspecof(options.replay);
    if (!replay) return { allowed: false, reason: "A reviewed replay spec with an endpoint is required in options.replay." };
    if (!ishttpsurl(replay.endpoint)) return { allowed: false, reason: "The reviewed replay endpoint must be an HTTPS url." };
    if (replay.verb !== void 0 && !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(replay.verb)) return { allowed: false, reason: "The reviewed replay verb must be a known HTTP verb." };
    for (const path of replay.paths ?? []) {
      if (!validpath(path.trim())) return { allowed: false, reason: `The reviewed replay extraction path ${path} must be a dotted path of non-empty segments.` };
    }
  }
  return { allowed: true };
}
function validatecontrolgrammar(step, options) {
  const kind = step.kind;
  if (kind === "blockrequest") {
    const rule = blockruleof(options.block);
    if (!rule) return { allowed: false, reason: "A reviewed block rule with a url pattern is required in options.block." };
    if (patternorigin(rule.urlpattern) === void 0) return { allowed: false, reason: "Block rules need an https origin pattern; patterns without a named origin are refused." };
    if (options.block.reviewed !== true) return { allowed: false, reason: "The block rule carries the explicit reviewed flag before any request is blocked." };
  }
  if (kind === "mockresponse") {
    const spec = mockspecof(options.mock);
    if (!spec) return { allowed: false, reason: "A reviewed mock fixture with a url pattern, status and its reviewed body or a captured body ref is required in options.mock." };
    if (patternorigin(spec.urlpattern) === void 0) return { allowed: false, reason: "Mock fixtures need an https origin pattern; patterns without a named origin are refused." };
    if (spec.reviewed !== true) return { allowed: false, reason: "Every mock fixture is reviewed with its full body or the referenced captured body through the explicit reviewed flag before it serves." };
  }
  if (kind === "rewriteheaders") {
    const rules = options.rules;
    if (!Array.isArray(rules) || rules.length === 0) return { allowed: false, reason: "A reviewed non-empty list of header rewrite rules is required in options.rules." };
    for (const item of rules) {
      const rule = headeruleof(item);
      if (!rule) return { allowed: false, reason: "Every header rewrite rule needs a url pattern, header name, a set, append or remove operation and its value." };
      if (patternorigin(rule.urlpattern) === void 0) return { allowed: false, reason: "Header rewrite rules must name their origin pattern explicitly; patterns without a named origin are refused." };
    }
  }
  if (kind === "setcookies") {
    const cookies = options.cookies;
    if (!Array.isArray(cookies) || cookies.length === 0) return { allowed: false, reason: "A reviewed non-empty list of cookie records is required in options.cookies." };
    for (const item of cookies) {
      if (!cookierecordof(item)) return { allowed: false, reason: "Every cookie record needs a name, domain, path and reviewed string value with an optional expiry." };
    }
  }
  if (kind === "readcookies" && options.domain !== void 0 && !isnonempty(options.domain)) return { allowed: false, reason: "The reviewed cookie read domain must be a non-empty host." };
  if (kind === "clearcookies") {
    if (!isnonempty(options.domain)) return { allowed: false, reason: "A reviewed cookie domain is required before cookies are cleared." };
    if (options.names !== void 0 && (!Array.isArray(options.names) || options.names.length === 0 || !options.names.every((name) => isnonempty(name)))) return { allowed: false, reason: "The reviewed cookie clear list must be a non-empty list of cookie names when present." };
  }
  if (kind === "authflow") {
    const flow = oauthflowof(options.oauth);
    if (!flow) return { allowed: false, reason: "A reviewed oauth flow with provider, authorize url, token url, scopes and redirect origin is required in options.oauth." };
    if (!ishttpsurl(flow.authorizeurl) || !ishttpsurl(flow.tokenurl)) return { allowed: false, reason: "The oauth authorize and token urls must use HTTPS." };
    if (!ishttpsurl(flow.redirectorigin) && !/^https:\/\/[^/]+\/?$/.test(flow.redirectorigin)) return { allowed: false, reason: "The oauth redirect origin must be an HTTPS origin inside the grants." };
    const consent = authconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "saveapikey") {
    const key = options.key;
    if (!key || typeof key !== "object" || Array.isArray(key)) return { allowed: false, reason: "A reviewed api key entry with name, origin scopes and header is required in options.key." };
    const entry = key;
    if (!isnonempty(entry.name)) return { allowed: false, reason: "The api key entry needs a reviewed non-empty name." };
    if (!Array.isArray(entry.origins) || entry.origins.length === 0 || !entry.origins.every((item) => ishttpsurl(item))) return { allowed: false, reason: "The api key needs a reviewed non-empty list of HTTPS origin scopes." };
    if (!isnonempty(entry.header)) return { allowed: false, reason: "The api key entry needs a reviewed non-empty header name." };
    if (typeof entry.value !== "string" || !entry.value) return { allowed: false, reason: "The api key needs its secret value in the reviewed options; it never enters the audit trail." };
    const consent = apikeyconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "routeproxy") {
    if (!proxyrouteof(options.proxy)) return { allowed: false, reason: "A reviewed proxy route with scheme, host, port and a non-empty bypass list is required in options.proxy." };
    if (!isnonempty(options.consentref)) return { allowed: false, reason: "Proxy routing needs the explicit reviewed consent ref before any route applies." };
  }
  if (kind === "postform") {
    const form = formpayloadof(options.form);
    if (!form) return { allowed: false, reason: "A reviewed form payload with a url and a non-empty field list is required in options.form." };
    if (!ishttpsurl(form.url)) return { allowed: false, reason: "The form submission target must use HTTPS." };
    const encoding = options.form && typeof options.form === "object" && !Array.isArray(options.form) ? options.form.encoding : void 0;
    if (encoding !== void 0 && !isnonempty(encoding)) return { allowed: false, reason: "The reviewed form payload encoding must be a non-empty name such as urlencoded." };
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds." };
  }
  if (kind === "postfiles") {
    const upload = multipartpayloadof(options.upload);
    if (!upload) return { allowed: false, reason: "A reviewed multipart upload with a url and reviewed files is required in options.upload; every file carries the explicit reviewed flag." };
    if (!ishttpsurl(upload.url)) return { allowed: false, reason: "The multipart upload target must use HTTPS." };
    if (options.wait !== void 0 && (typeof options.wait !== "number" || !Number.isFinite(options.wait) || options.wait < 0)) return { allowed: false, reason: "The reviewed rate limit wait budget must be zero or a positive number of milliseconds." };
  }
  return { allowed: true };
}
function authconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "An oauth flow requires the reviewed provider consent prompt ref in options before it starts." };
  return { allowed: true };
}
function apikeyconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "Storing an api key requires the explicit reviewed consent prompt ref in options before anything is stored." };
  return { allowed: true };
}
function debugwaitbudgetallowed(watchwindow, wait) {
  if (watchwindow !== void 0 && (typeof watchwindow !== "number" || !Number.isFinite(watchwindow) || watchwindow < 0)) return { allowed: false, reason: "The debug watch window must be zero or a positive number of milliseconds." };
  if (wait !== void 0 && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return { allowed: false, reason: "The reviewed debug wait budget must be zero or a positive number of milliseconds." };
  if (watchwindow !== void 0 && wait !== void 0 && watchwindow > wait) return { allowed: false, reason: `The debug watch window of ${watchwindow} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter window.` };
  return { allowed: true };
}
function validatetimelinegrammar(step, options) {
  const kind = step.kind;
  let watchwindow;
  if (options.watch !== void 0) {
    const watch = options.watch;
    if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed debug watch window must be an object." };
    const reviewed = watch;
    if (reviewed.window !== void 0) {
      if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0) return { allowed: false, reason: "The reviewed debug watch window must be zero or a positive number of milliseconds." };
      watchwindow = reviewed.window;
    }
  }
  const budgetcheck2 = debugwaitbudgetallowed(watchwindow, typeof options.wait === "number" ? options.wait : void 0);
  if (!budgetcheck2.allowed) return budgetcheck2;
  if (options.level !== void 0 && !loglevels.includes(options.level)) return { allowed: false, reason: `The reviewed level floor must be one of ${loglevels.join(", ")}.` };
  if (options.sources !== void 0) {
    if (!Array.isArray(options.sources) || options.sources.length === 0 || !options.sources.every((source) => timelinesources.includes(source))) return { allowed: false, reason: `The reviewed source filters must be a non-empty list of the reviewed timeline sources: ${timelinesources.join(", ")}.` };
  }
  if (kind === "watchconsole") {
    if (options.redact === void 0 || !Array.isArray(options.redact) || options.redact.length === 0 || !options.redact.every((pattern) => isnonempty(pattern))) return { allowed: false, reason: "Console capture requires a reviewed non-empty redaction pattern list before any console text is captured." };
    if (options.depth !== void 0 && (typeof options.depth !== "number" || !Number.isInteger(options.depth) || options.depth < 1)) return { allowed: false, reason: "The reviewed serialization depth bound must be a positive integer with no code ceiling." };
    if (options.spam !== void 0) {
      const rule = spamruleof(options.spam);
      if (!rule) return { allowed: false, reason: "The reviewed spam rule needs a pattern, a window size and a collapse threshold." };
      if (rule.collapse < 1) return { allowed: false, reason: "The reviewed spam collapse threshold must be a positive integer of user configured value with no code ceiling." };
    }
    if (options.rotation !== void 0) {
      const rule = rotationruleof(options.rotation);
      if (!rule) return { allowed: false, reason: "The reviewed rotation rule needs a max entry count and an overflow target." };
    }
  }
  if (kind === "watchtasks") {
    if (options.threshold !== void 0 && (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)) return { allowed: false, reason: "The reviewed long task threshold must be zero or a positive number of milliseconds with no code ceiling." };
  }
  return { allowed: true };
}
function spamruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const pattern = typeof entry.pattern === "string" ? entry.pattern : "";
  const windowsize = typeof entry.windowsize === "number" && Number.isFinite(entry.windowsize) && entry.windowsize >= 0 ? entry.windowsize : void 0;
  const collapse = typeof entry.collapse === "number" && Number.isInteger(entry.collapse) ? entry.collapse : void 0;
  if (windowsize === void 0 || collapse === void 0) return void 0;
  return { pattern, windowsize, collapse };
}
function rotationruleof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const entry = value;
  const maxentries = typeof entry.maxentries === "number" && Number.isInteger(entry.maxentries) && entry.maxentries >= 1 ? entry.maxentries : void 0;
  const overflowtarget = typeof entry.overflowtarget === "string" && entry.overflowtarget.trim() ? entry.overflowtarget.trim() : void 0;
  if (maxentries === void 0 || overflowtarget === void 0) return void 0;
  return { maxentries, overflowtarget };
}
function validatebreakpointcondition(condition) {
  const expression = condition.trim();
  if (expression.length === 0) return { allowed: false, reason: "The breakpoint condition must not be empty." };
  if (/(?<![=!<>])=(?!=)/.test(expression)) return { allowed: false, reason: "Breakpoint conditions refuse assignment because the reviewed grammar is comparison only." };
  if (conditioncallshape(expression)) return { allowed: false, reason: "Breakpoint conditions refuse calls because the reviewed grammar is comparison only." };
  const literal = /^(?:-?\d+(?:\.\d+)?|true|false|null)$/;
  const scan = conditiontokens(expression);
  if (!scan.complete || scan.tokens.join("") !== expression.replace(/\s+/g, "")) return { allowed: false, reason: "The breakpoint condition must use the reviewed expression grammar of member chains, literals, comparisons, logic operators, negation and parentheses." };
  const identifierlike = /^(?:true|false|null)$/;
  for (const token of scan.tokens) {
    if (token.startsWith('"') || token.startsWith("'")) continue;
    if (literal.test(token) || identifierlike.test(token)) continue;
    if (["===", "!==", "==", "!=", ">=", "<=", "&&", "||", "!", ".", "(", ")", "<", ">", "+", "-", "*", "/", "%"].includes(token)) continue;
    if (/^[A-Za-z_$][\w$]*$/.test(token)) continue;
    return { allowed: false, reason: `The token ${token} of the breakpoint condition stays outside the reviewed expression grammar.` };
  }
  return { allowed: true };
}
function conditioncallshape(expression) {
  let paren = expression.indexOf("(");
  while (paren !== -1) {
    let end = paren - 1;
    while (end >= 0) {
      const char = expression[end] ?? "";
      if (char !== " " && char !== "	" && char !== "\n" && char !== "\r") break;
      end -= 1;
    }
    let start = end;
    while (start >= 0) {
      const code = expression.charCodeAt(start);
      const part = code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 95 || code === 36;
      if (!part) break;
      start -= 1;
    }
    const chunk = expression.slice(start + 1, end + 1);
    if (chunk.length > 0 && /[A-Za-z_$]/.test(chunk)) return true;
    paren = expression.indexOf("(", paren + 1);
  }
  return false;
}
function conditiontokens(expression) {
  const tokens = [];
  let index = 0;
  while (index < expression.length) {
    const char = expression[index] ?? "";
    if (char === " " || char === "	" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    const code = char.charCodeAt(0);
    const identifierstart = code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 95 || code === 36;
    if (identifierstart) {
      let end = index + 1;
      while (end < expression.length) {
        const c = expression.charCodeAt(end);
        const part = c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 36;
        if (!part) break;
        end += 1;
      }
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    const digitafter = index + 1 < expression.length ? expression.charCodeAt(index + 1) : 0;
    const numberstart = code >= 48 && code <= 57 || char === "-" && digitafter >= 48 && digitafter <= 57;
    if (numberstart) {
      let end = index + (char === "-" ? 1 : 0);
      while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57) end += 1;
      const fractiondot = expression[end] === "." && end + 1 < expression.length && expression.charCodeAt(end + 1) >= 48 && expression.charCodeAt(end + 1) <= 57;
      if (fractiondot) {
        end += 2;
        while (end < expression.length && expression.charCodeAt(end) >= 48 && expression.charCodeAt(end) <= 57) end += 1;
      }
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    if (char === '"' || char === "'") {
      let end = index + 1;
      let closed = false;
      while (end < expression.length) {
        const inner = expression[end] ?? "";
        if (inner === "\\") {
          end += 2;
          continue;
        }
        if (inner === char) {
          closed = true;
          end += 1;
          break;
        }
        end += 1;
      }
      if (!closed) return { tokens, complete: false };
      tokens.push(expression.slice(index, end));
      index = end;
      continue;
    }
    const three = expression.slice(index, index + 3);
    if (three === "===" || three === "!==") {
      tokens.push(three);
      index += 3;
      continue;
    }
    const two = expression.slice(index, index + 2);
    if (two === "==" || two === "!=" || two === ">=" || two === "<=" || two === "&&" || two === "||") {
      tokens.push(two);
      index += 2;
      continue;
    }
    if ("!.<>()+-*/%".includes(char)) {
      tokens.push(char);
      index += 1;
      continue;
    }
    return { tokens, complete: false };
  }
  return { tokens, complete: true };
}
function validateemulationgrammar(step, options) {
  const kind = step.kind;
  if (revertplanof(options.revertplan) === void 0) return { allowed: false, reason: `Every ${kind} layer needs a reviewed revert plan before any mask applies.` };
  if (kind === "emulatedevice") {
    const preset = devicepresetof(options.device);
    if (!preset) return { allowed: false, reason: "The device layer needs a reviewed preset with a name, positive integer width and height and a positive pixel ratio." };
    if (options.reload !== void 0 && typeof options.reload !== "boolean") return { allowed: false, reason: "The reviewed reload flag must be a boolean; the page reloads only when the reviewed plan asks." };
    return { allowed: true };
  }
  if (kind === "emulatenetwork") {
    const preset = networkpresetof(options.network);
    if (!preset) return { allowed: false, reason: "The network layer needs a reviewed preset with a name and zero or positive latency, download and upload bounds." };
    if (options.window !== void 0 && (typeof options.window !== "number" || !Number.isFinite(options.window) || options.window < 0)) return { allowed: false, reason: "The reviewed offline window must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "emulatelocate") {
    const preset = locationpresetof(options.location);
    if (!preset) return { allowed: false, reason: "The location layer needs a reviewed preset with a name, a latitude inside -90 and 90, a longitude inside -180 and 180 and a zero or positive accuracy radius." };
    if (!locationrangevalid(preset.latitude, preset.longitude)) return { allowed: false, reason: "The reviewed latitude must stay inside -90 and 90 degrees and the longitude inside -180 and 180 degrees." };
    return { allowed: true };
  }
  if (kind === "setuseragent") {
    const preset = agentpresetof(options.agent);
    if (!preset) return { allowed: false, reason: "The agent layer needs a reviewed preset with a user agent string of the reviewed grammar, a platform and a non-empty brand list." };
    if (!agentgrammarvalid(preset.useragent)) return { allowed: false, reason: "The reviewed user agent string must use the reviewed grammar of tokens, separators and version marks without line breaks." };
    return { allowed: true };
  }
  if (kind === "overridepermission") {
    const grant = permissiongrantof(options.permission);
    if (!grant) return { allowed: false, reason: `The permission override needs a reviewed name of the browser permission set (${browserpermissions.join(", ")}) and a state of ${permissionstates.join(", ")}.` };
    void permissiongrade(grant.name);
    return { allowed: true };
  }
  if (kind === "blackboxscripts") {
    const rules = Array.isArray(options.rules) ? options.rules.flatMap((rule) => {
      const parsed = blackboxruleof(rule);
      return parsed !== void 0 ? [parsed] : [];
    }) : [];
    if (rules.length === 0) return { allowed: false, reason: "The blackbox layer needs a reviewed non-empty rule list where every pattern names its origin explicitly and carries a trace scope." };
    return { allowed: true };
  }
  return { allowed: true };
}
function validatesessiongrammar(step, options) {
  const kind = step.kind;
  if (kind === "persiststate") {
    if (options.resume !== void 0 && typeof options.resume !== "boolean") return { allowed: false, reason: "The reviewed resume flag must be a boolean." };
    return { allowed: true };
  }
  if (kind === "capturesession") {
    const plan = snapshotplanof(options.snapshot);
    if (!plan) return { allowed: false, reason: "The session capture needs a reviewed snapshot plan with its scope, a non-empty section list of the reviewed grammar (tabs, scroll, forms, storage, cookies) and the capture link flag." };
    if (plan.auto !== void 0) {
      const interval = autointervalof(options.snapshot.auto);
      if (interval === void 0) return { allowed: false, reason: "The reviewed auto snapshot interval needs a positive period, a positive maximum snapshot count and a zero or positive expiry window with no code ceiling." };
    }
    return { allowed: true };
  }
  if (kind === "restoresession") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim()) return { allowed: false, reason: "The session restore needs the reviewed session id of the saved record." };
    if (restoreplanof(options.restore) === void 0) return { allowed: false, reason: "The session restore needs a reviewed restore plan with its tab, form and capture policies." };
    if (options.reviewed !== true) return { allowed: false, reason: "Every session restore needs the explicit restore review with its tabs, form state and captures listed before it reopens anything." };
    return { allowed: true };
  }
  if (kind === "namedsessions") {
    if (typeof options.sessionid !== "string" || !options.sessionid.trim()) return { allowed: false, reason: "The session filing needs the reviewed session id of the saved record." };
    if (typeof options.name !== "string" || !options.name.trim()) return { allowed: false, reason: "The session filing needs a reviewed non-empty session name." };
    if (options.folder !== void 0 && (typeof options.folder !== "string" || !options.folder.trim())) return { allowed: false, reason: "The reviewed folder name must be a non-empty string." };
    if (options.tags !== void 0 && (!Array.isArray(options.tags) || !options.tags.every((tag) => typeof tag === "string" && tag.trim()))) return { allowed: false, reason: "The reviewed tag list must be a list of non-empty strings." };
    return { allowed: true };
  }
  if (kind === "diffsessions") {
    if (typeof options.left !== "string" || !options.left.trim() || typeof options.right !== "string" || !options.right.trim()) return { allowed: false, reason: "The session diff needs the reviewed ids of both saved sessions." };
    return { allowed: true };
  }
  if (kind === "searchsessions") {
    if (searchqueryof(options.query) === void 0) return { allowed: false, reason: "The session search needs a reviewed query with a non-empty term list, fields of the reviewed grammar (urls, titles, names, text) and an optional time window." };
    return { allowed: true };
  }
  if (kind === "exportsessions") {
    if (options.reviewed !== true) return { allowed: false, reason: "Session exports need the explicit export review before any session file leaves the device." };
    if (options.ids !== void 0 && (!Array.isArray(options.ids) || options.ids.length === 0 || !options.ids.every((id) => typeof id === "string" && id.trim()))) return { allowed: false, reason: "The reviewed export id list must be a non-empty list of saved session ids." };
    return { allowed: true };
  }
  if (kind === "importsessions") {
    if (options.reviewed !== true) return { allowed: false, reason: "Session imports need the explicit full record review before any record joins the library." };
    if (importsessionfile(options.file) === void 0) return { allowed: false, reason: "The session import needs a reviewed file of the known format version with an intact checksum." };
    return { allowed: true };
  }
  return { allowed: true };
}
function validateworkflowgrammar(step, options) {
  const kind = step.kind;
  if (kind === "composeworkflow") {
    const payload = options.workflow;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { allowed: false, reason: "The workflow composition needs the reviewed workflow payload with its name, version, origins, steps and blocks." };
    const candidate = payload;
    if (typeof candidate.name !== "string" || !candidate.name.trim()) return { allowed: false, reason: "The workflow composition needs a reviewed non-empty name." };
    if (typeof candidate.version !== "number" || !Number.isInteger(candidate.version) || candidate.version < 1) return { allowed: false, reason: "The workflow version must be a positive integer." };
    if (!Array.isArray(candidate.origins) || candidate.origins.length === 0 || !candidate.origins.every((origin) => typeof origin === "string" && origin.startsWith("https://"))) return { allowed: false, reason: "The workflow needs at least one granted HTTPS origin so every step stays inside the grants." };
    if (!Array.isArray(candidate.steps) || candidate.steps.length === 0 || !candidate.steps.every((entry) => workflowstepof(entry) !== void 0 || entry && typeof entry === "object" && typeof entry.block === "string")) return { allowed: false, reason: "The workflow needs a non-empty reviewed step list of the workflow step grammar or block invocations." };
    const blocks = Array.isArray(candidate.blocks) ? candidate.blocks.flatMap((block) => {
      const parsed = workflowblockof(block);
      return parsed !== void 0 ? [parsed] : [];
    }) : [];
    if (Array.isArray(candidate.blocks) && blocks.length !== candidate.blocks.length) return { allowed: false, reason: "The reviewed block list must carry unique lowercase names, labels and valid child steps." };
    try {
      const record2 = composeworkflow({ name: candidate.name, version: candidate.version, origins: candidate.origins, steps: candidate.steps.map((entry) => "block" in entry ? { block: entry.block, label: typeof entry.label === "string" ? entry.label : entry.block } : workflowstepof(entry)), blocks, now: 0, kindallowed: (candidatekind) => {
        try {
          actionrisk(candidatekind);
          return true;
        } catch {
          return false;
        }
      }, riskof: (candidatekind) => actionrisk(candidatekind) });
      const inputs = Array.isArray(candidate.inputs) ? candidate.inputs.flatMap((name) => typeof name === "string" ? [name] : []) : void 0;
      const checked = validateworkflow(record2, { kindallowed: (workflowkind) => {
        try {
          actionrisk(workflowkind);
          return true;
        } catch {
          return false;
        }
      }, ...inputs !== void 0 ? { inputs } : {} });
      if (!checked.allowed) return checked;
    } catch (error) {
      return { allowed: false, reason: error instanceof Error ? error.message : "The workflow payload failed its composition validation." };
    }
    return { allowed: true };
  }
  if (kind === "savetemplate") {
    const payload = options.template && typeof options.template === "object" && !Array.isArray(options.template) ? options.template : {};
    const template = steptemplateof({ id: "templatereview", origin: "https://example.com", sharedat: 0, ...payload });
    if (!template) return { allowed: false, reason: "The step template needs a reviewed name and a valid workflow step it shares across workflows." };
    return { allowed: true };
  }
  if (kind === "runworkflow") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "The workflow run needs the reviewed id of the composed workflow." };
    if (options.reviewed !== true) return { allowed: false, reason: "Every real workflow run needs the explicit run review with its expanded step list shown before the first step executes." };
    if (options.variables !== void 0 && (!options.variables || typeof options.variables !== "object" || Array.isArray(options.variables) || !Object.values(options.variables).every((value) => typeof value === "string" || typeof value === "number" || typeof value === "boolean"))) return { allowed: false, reason: "The reviewed run variables must be an object of string, number or boolean values." };
    return { allowed: true };
  }
  if (kind === "dryrun") {
    if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "The dry run needs the reviewed id of the composed workflow." };
    return { allowed: true };
  }
  if (kind === "delay") {
    const delay = options.delay;
    if (!delay || typeof delay !== "object" || Array.isArray(delay)) return { allowed: false, reason: "The delay needs a reviewed base and jitter window in options." };
    const reviewed = delay;
    if (typeof reviewed.base !== "number" || !Number.isFinite(reviewed.base) || reviewed.base < 0) return { allowed: false, reason: "The reviewed delay base must be zero or a positive number of milliseconds." };
    if (typeof reviewed.jitter !== "number" || !Number.isFinite(reviewed.jitter) || reviewed.jitter < 0) return { allowed: false, reason: "The reviewed delay jitter window must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "waitelement") {
    const wait = options.wait;
    if (!wait || typeof wait !== "object" || Array.isArray(wait)) return { allowed: false, reason: "The element wait needs a reviewed selector, timeout and poll interval in options." };
    const reviewed = wait;
    if (typeof reviewed.selector !== "string" || !reviewed.selector.trim()) return { allowed: false, reason: "The element wait needs a reviewed non-empty selector." };
    if (typeof reviewed.timeout !== "number" || !Number.isFinite(reviewed.timeout) || reviewed.timeout < 0) return { allowed: false, reason: "The reviewed element wait timeout must be zero or a positive number of milliseconds with no code ceiling." };
    if (typeof reviewed.poll !== "number" || !Number.isFinite(reviewed.poll) || reviewed.poll < 0) return { allowed: false, reason: "The reviewed element wait poll interval must be zero or a positive number of milliseconds with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "compute") {
    const expression = expressionof(options.expression);
    if (!expression) return { allowed: false, reason: `The expression step needs a reviewed expression with operands, an operator of the reviewed set (${expressionoperators.join(", ")}) and a result variable of a reviewed kind.` };
    const operatorcheck = validatexpressionoperators(expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "extractvars") {
    const rule = regexruleof(options.rule);
    if (!rule) return { allowed: false, reason: "The variable extraction needs a reviewed regex rule with its pattern, flags and named capture groups." };
    const shapecheck = validateregexrule(rule.pattern);
    if (!shapecheck.allowed) return shapecheck;
    if (typeof options.text !== "string") return { allowed: false, reason: "The variable extraction needs the reviewed text the regex rule applies to." };
    return { allowed: true };
  }
  if (kind === "condition") {
    const condition = conditionof(options.condition);
    if (!condition) return { allowed: false, reason: "The condition step needs a reviewed boolean expression in its options." };
    const operatorcheck = validatexpressionoperators(condition.expression);
    if (!operatorcheck.allowed) return operatorcheck;
    return { allowed: true };
  }
  if (kind === "branch") {
    const branch = branchof(options.branch);
    if (!branch) return { allowed: false, reason: "The branch step needs reviewed unique paths with boolean match expressions and an else path in its options so every branch terminates." };
    for (const path of [...branch.paths, branch.else]) {
      if (path.when === void 0) continue;
      const operatorcheck = validatexpressionoperators(path.when);
      if (!operatorcheck.allowed) return operatorcheck;
    }
    return controlchildkinds(step);
  }
  if (kind === "loop") {
    const loop = loopof(options.loop);
    if (!loop) return { allowed: false, reason: "The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options; an absent bound keeps the documented default." };
    return controlchildkinds(step);
  }
  if (kind === "repeatuntil") {
    const repeat = repeatuntilof(options.repeatuntil);
    if (!repeat) return { allowed: false, reason: "The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options." };
    const operatorcheck = validatexpressionoperators(repeat.until);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "whileloop") {
    const condition = whileof(options.while);
    if (!condition) return { allowed: false, reason: "The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options; a while loop without a safety bound is refused." };
    const operatorcheck = validatexpressionoperators(condition.while);
    if (!operatorcheck.allowed) return operatorcheck;
    return controlchildkinds(step);
  }
  if (kind === "foreach") {
    const foreach = foreachof(options.foreach);
    if (!foreach) return { allowed: false, reason: "The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options." };
    return controlchildkinds(step);
  }
  if (kind === "parallel") {
    const parallel = parallelof(options.parallel);
    if (!parallel) return { allowed: false, reason: "The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options." };
    return controlchildkinds(step);
  }
  if (kind === "trycatch") {
    const fragile = tryof(options.try);
    if (!fragile) return { allowed: false, reason: "The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options: attempts stay user configured with no code ceiling, backoff is fixed or exponential and budgets are positive." };
    return controlchildkinds(step);
  }
  return { allowed: true };
}
function controlchildkinds(step) {
  const children = controlsteps({ id: step.id, kind: step.kind, label: step.summary, ...step.options !== void 0 ? { options: step.options } : {} });
  for (const child of children) {
    try {
      actionrisk(child.kind);
    } catch {
      return { allowed: false, reason: `The ${child.kind} step inside the control payload of the ${step.kind} step is not a reviewed action kind.` };
    }
  }
  return { allowed: true };
}
function validateregexrule(pattern) {
  try {
    new RegExp(pattern);
  } catch {
    return { allowed: false, reason: "The reviewed regex pattern does not compile." };
  }
  if (nestedquantifiershape(pattern) || /\(\)[+*{]/.test(pattern)) return { allowed: false, reason: "The reviewed regex pattern nests an unbounded quantifier inside a quantified group and is refused because adversarial text could explode the backtracking." };
  if (/\{\d+,\}/.test(pattern) && unboundedgrouprepeat(pattern)) return { allowed: false, reason: "The reviewed regex pattern repeats an unbounded group and is refused because adversarial text could explode the backtracking." };
  return { allowed: true };
}
function nestedquantifiershape(pattern) {
  let open = pattern.indexOf("(");
  while (open !== -1) {
    const close = pattern.indexOf(")", open);
    if (close === -1) return false;
    const after = pattern[close + 1] ?? "";
    if (after === "+" || after === "*" || after === "{") {
      let backslashes = 0;
      let position = close - 2;
      while (position > open && pattern[position] === "\\") {
        backslashes += 1;
        position -= 1;
      }
      const last = pattern[close - 1] ?? "";
      if (backslashes % 2 === 0 && (last === "+" || last === "*" || last === "}")) return true;
    }
    open = pattern.indexOf("(", open + 1);
  }
  return false;
}
function unboundedgrouprepeat(pattern) {
  let open = pattern.indexOf("(");
  while (open !== -1) {
    const close = pattern.indexOf(")", open);
    if (close === -1) return false;
    const after = pattern[close + 1] ?? "";
    if ((after === "+" || after === "*" || after === "{") && /\{\d+,\}/.test(pattern.slice(open + 1, close))) return true;
    open = pattern.indexOf("(", open + 1);
  }
  return false;
}
function validatexpressionoperators(expression) {
  const numeric = /* @__PURE__ */ new Set(["add", "subtract", "multiply", "divide", "modulo"]);
  const logic = /* @__PURE__ */ new Set(["and", "or", "not"]);
  const comparison = /* @__PURE__ */ new Set(["less", "greater", "lessequal", "greaterequal"]);
  const text2 = /* @__PURE__ */ new Set(["concat", "contains"]);
  const operator = expression.operator;
  if (numeric.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === void 0) continue;
      if (operand.literal !== void 0 && typeof operand.literal === "boolean") return { allowed: false, reason: `The ${operator} operator needs numeric operands; boolean literals are refused.` };
    }
    if (expression.resultkind !== "number" && expression.resultkind !== "string") return { allowed: false, reason: `The ${operator} operator needs a number result kind.` };
  }
  if (logic.has(operator)) {
    for (const operand of [expression.left, expression.right]) {
      if (operand === void 0) continue;
      if (operand.literal !== void 0 && typeof operand.literal !== "boolean") return { allowed: false, reason: `The ${operator} operator needs boolean operands; non boolean literals are refused.` };
    }
    if (expression.resultkind !== "boolean") return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
    if (operator === "not" && expression.right !== void 0) return { allowed: false, reason: "The not operator takes one operand only." };
  }
  if (comparison.has(operator) && expression.resultkind !== "boolean") return { allowed: false, reason: `The ${operator} operator needs a boolean result kind.` };
  if (text2.has(operator) && expression.resultkind !== "boolean" && expression.resultkind !== "string") return { allowed: false, reason: `The ${operator} operator needs a string or boolean result kind.` };
  if (operator === "contains" && expression.resultkind !== "boolean") return { allowed: false, reason: "The contains operator needs a boolean result kind." };
  if (operator === "length") {
    if (expression.right !== void 0) return { allowed: false, reason: "The length operator takes one operand only." };
    if (expression.resultkind !== "number") return { allowed: false, reason: "The length operator needs a number result kind." };
  }
  if ((operator === "equal" || operator === "notequal") && !(/* @__PURE__ */ new Set(["boolean", "string", "number"])).has(expression.resultkind)) return { allowed: false, reason: "The equality operator needs a primitive result kind." };
  return { allowed: true };
}
function validatetriggergrammar(step, options) {
  const family = triggerfamilyof(step.kind);
  if (family === void 0) return { allowed: false, reason: "The trigger step is not a reviewed trigger kind." };
  if (typeof options.workflowid !== "string" || !options.workflowid.trim()) return { allowed: false, reason: "Every trigger rule needs the reviewed id of the composed workflow it launches." };
  if (options.reviewed !== true) return { allowed: false, reason: "Every trigger rule needs the explicit arm review with its match fields and bound workflow shown before it arms." };
  if (options.label !== void 0 && (typeof options.label !== "string" || !options.label.trim())) return { allowed: false, reason: "The reviewed trigger label must be a non-empty string." };
  if (options.cooldown !== void 0 && (typeof options.cooldown !== "number" || !Number.isFinite(options.cooldown) || options.cooldown <= 0)) return { allowed: false, reason: "The reviewed cooldown window must be a positive number of milliseconds with no code ceiling; the webhook and event families keep the documented default when the review configures none." };
  const payload = options.rule;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { allowed: false, reason: `The ${step.kind} step needs its reviewed rule payload in options.` };
  if (triggerpayloadof(family, payload) === void 0) {
    if (family === "visit") return { allowed: false, reason: "The visit rule needs a non-empty reviewed list of HTTPS origins it fires on." };
    if (family === "url") return { allowed: false, reason: "The url rule needs a reviewed HTTPS glob url pattern; `*` spans one path segment and `**` spans across segments." };
    if (family === "menu") return { allowed: false, reason: "The menu rule needs a reviewed non-empty context menu entry title." };
    if (family === "key") return { allowed: false, reason: "The keyboard shortcut rule needs a reviewed lowercase command name and an optional suggested key binding." };
    if (family === "cron") return { allowed: false, reason: "The cron rule needs a reviewed five field cron expression of minutes, hours, days, months and weekdays with named weekdays and months and an optional resolvable timezone; unparseable schedules are refused." };
    if (family === "interval") return { allowed: false, reason: "The interval rule needs a reviewed positive period in milliseconds with an optional zero or positive jitter window." };
    if (family === "urllist") return { allowed: false, reason: "The url list rule needs a reviewed non-empty list of HTTPS urls its workflow runs across." };
    if (family === "webhook") return { allowed: false, reason: `The webhook rule needs a reviewed shared secret of at least twenty four characters mixing letters and digits and a non-empty payload schema of named string, number or boolean fields.` };
    if (family === "event") return { allowed: false, reason: `The page event rule needs a reviewed non-empty list of event names of the observed event catalog: ${triggereventcatalog.join(", ")}.` };
    return { allowed: false, reason: "The trigger rule payload does not follow its family grammar." };
  }
  if (family === "cron") {
    const candidate = payload;
    if (typeof candidate.cron === "string" && cronparse(candidate.cron) === void 0) return { allowed: false, reason: "The cron expression does not parse as a five field schedule and is refused." };
  }
  if (family === "webhook") {
    const candidate = payload;
    if (typeof candidate.secret === "string" && !webhooksecretok(candidate.secret)) return { allowed: false, reason: "The webhook shared secret must hold at least twenty four characters mixing letters and digits; the entropy floor is a floor, never a cap." };
  }
  const armed = armrule({ family, workflowid: options.workflowid, ...typeof options.label === "string" && options.label.trim() ? { label: options.label } : {}, payload, ...typeof options.cooldown === "number" ? { cooldown: options.cooldown } : {}, now: 0 });
  if (armed === void 0) return { allowed: false, reason: "The trigger rule payload does not arm as a reviewed rule." };
  return { allowed: true };
}
function triggerorigins(step) {
  let triggeroptions = {};
  try {
    triggeroptions = parseoptions(step);
  } catch {
    return [];
  }
  const family = triggerfamilyof(step.kind);
  if (family === void 0) return [];
  const armed = armrule({ family, workflowid: typeof triggeroptions.workflowid === "string" ? triggeroptions.workflowid : "", payload: triggeroptions.rule, ...typeof triggeroptions.cooldown === "number" ? { cooldown: triggeroptions.cooldown } : {}, now: 0 });
  if (armed === void 0) return [];
  const origins = [];
  for (const origin of armed.origins ?? []) origins.push(origin);
  if (armed.pattern !== void 0) {
    try {
      origins.push(new URL(armed.pattern).origin);
    } catch {
    }
  }
  for (const url of armed.urls ?? []) {
    try {
      origins.push(new URL(url).origin);
    } catch {
    }
  }
  return [...new Set(origins)];
}
function validatecdpgrammar(step, options) {
  const kind = step.kind;
  if (kind === "attachcdp") {
    if (!Array.isArray(options.domains) || options.domains.length === 0 || !options.domains.every((domain) => typeof domain === "string" && cdpdomains.includes(domain))) return { allowed: false, reason: `The attach needs a non-empty enabled domain list of the reviewed domain grammar: ${cdpdomains.join(", ")}.` };
    if (teardownplanof(options.teardown) === void 0) return { allowed: false, reason: "Every attach needs a reviewed teardown plan with its revert steps and resume policy before approval." };
    if (options.allowlist !== void 0) {
      const allowlist = cdpallowlistof(options.allowlist);
      if (!allowlist || !allowlist.domains.every((domain) => options.domains.includes(domain))) return { allowed: false, reason: "The reviewed method allowlist must stay inside the enabled domains of the attach." };
    }
    const budgetcheck2 = debugwaitbudgetallowed(typeof options.wait === "number" ? options.wait : void 0, void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "detachcdp") return { allowed: true };
  if (kind === "cdpcmd") {
    const command = options.command && typeof options.command === "object" && !Array.isArray(options.command) ? options.command : void 0;
    if (!command || typeof command.method !== "string" || methoddomain(command.method) === void 0) return { allowed: false, reason: "The raw command needs a reviewed method of the Domain.method form." };
    if (command.params !== void 0 && (typeof command.params !== "object" || Array.isArray(command.params))) return { allowed: false, reason: "The raw command params must be a JSON object." };
    if (command.resultpath !== void 0 && typeof command.resultpath !== "string") return { allowed: false, reason: "The reviewed result path must be a dotted path string." };
    return { allowed: true };
  }
  if (kind === "watchcdp") {
    if (!Array.isArray(options.events) || options.events.length === 0 || !options.events.every((rule) => cdpeventruleof(rule) !== void 0)) return { allowed: false, reason: "The event watch needs a non-empty reviewed list of domain event rules of the reviewed domain grammar." };
    let watchwindow;
    if (options.watch !== void 0) {
      const watch = options.watch;
      if (!watch || typeof watch !== "object" || Array.isArray(watch)) return { allowed: false, reason: "The reviewed event watch window must be an object." };
      const reviewed = watch;
      if (reviewed.window !== void 0) {
        if (typeof reviewed.window !== "number" || !Number.isFinite(reviewed.window) || reviewed.window < 0) return { allowed: false, reason: "The reviewed event watch window must be zero or a positive number of milliseconds." };
        watchwindow = reviewed.window;
      }
    }
    if (watchwindow === void 0) return { allowed: false, reason: "The event watch needs a reviewed lifetime window before any domain event is observed." };
    const budgetcheck2 = debugwaitbudgetallowed(watchwindow, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "setbreakpoint") {
    const breakpoint = breakpointinputof(options.breakpoint);
    if (!breakpoint) return { allowed: false, reason: "The breakpoint needs a reviewed script url and a zero based line." };
    if (!ishttpsurl(breakpoint.url)) return { allowed: false, reason: "The breakpoint script url must be a reviewed HTTPS url." };
    if (breakpoint.condition !== void 0) {
      const conditioncheck = validatebreakpointcondition(breakpoint.condition);
      if (!conditioncheck.allowed) return conditioncheck;
    }
    return { allowed: true };
  }
  if (kind === "stepcode") {
    if (stepmodeof(options.mode) === void 0) return { allowed: false, reason: "The step code mode must be one of stepover, stepinto, stepout or resume." };
    return { allowed: true };
  }
  if (kind === "watchexpr") {
    if (watchexpressionof(options.expression) === void 0) return { allowed: false, reason: "The watch expression needs the reviewed expression text." };
    if (options.reviewed !== true) return { allowed: false, reason: "Watch expressions must be reviewed before evaluation; set the explicit reviewed flag on the step." };
    return { allowed: true };
  }
  if (kind === "overridescript") {
    const override = overrideinputof(options.override);
    if (!override) return { allowed: false, reason: "The script override needs a reviewed url pattern and its full fixture source." };
    if (patternorigin(override.urlpattern) === void 0) return { allowed: false, reason: "Script overrides without a named https origin pattern are refused." };
    if (options.reviewed !== true) return { allowed: false, reason: "The full fixture source must be reviewed before the script override runs; set the explicit reviewed flag on the step." };
    return { allowed: true };
  }
  return { allowed: true };
}
function validateprofilegrammar(step, options) {
  const kind = step.kind;
  if (kind === "measureflow") {
    if (flowspecof(options.flow) === void 0) return { allowed: false, reason: `The flow measurement needs a reviewed flow spec with its mark prefix, step window and metric list of the reviewed metric set: navigation, paint, lcp, fid, interaction, blocking.` };
    const watch = options.watch && typeof options.watch === "object" && !Array.isArray(options.watch) ? options.watch : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0) return { allowed: false, reason: "The flow measurement needs a reviewed watch window of zero or more milliseconds." };
    const budgetcheck2 = debugwaitbudgetallowed(watch.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "heapshot") {
    const heap = options.heap && typeof options.heap === "object" && !Array.isArray(options.heap) ? options.heap : {};
    if (heap.interval !== void 0 && (typeof heap.interval !== "number" || !Number.isFinite(heap.interval) || heap.interval < 0)) return { allowed: false, reason: "The reviewed heap snapshot interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "trackmemory") {
    const growth = options.growth && typeof options.growth === "object" && !Array.isArray(options.growth) ? options.growth : void 0;
    if (!growth || typeof growth.slope !== "number" || !Number.isFinite(growth.slope) || growth.slope < 0) return { allowed: false, reason: "Memory growth tracking needs the reviewed slope in bytes per millisecond before any sample is flagged." };
    if (growth.interval !== void 0 && (typeof growth.interval !== "number" || !Number.isFinite(growth.interval) || growth.interval < 0)) return { allowed: false, reason: "The reviewed sampling interval must be zero or a positive number of milliseconds and stays a user choice with no code ceiling." };
    return { allowed: true };
  }
  if (kind === "profilecpu") {
    const profile = options.profile && typeof options.profile === "object" && !Array.isArray(options.profile) ? options.profile : void 0;
    if (!profile || typeof profile.duration !== "number" || !Number.isFinite(profile.duration) || profile.duration < 0) return { allowed: false, reason: "The cpu profile needs a reviewed duration of zero or more milliseconds." };
    const budgetcheck2 = debugwaitbudgetallowed(profile.duration, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "watchshifts") {
    const watch = options.watch && typeof options.watch === "object" && !Array.isArray(options.watch) ? options.watch : {};
    if (typeof watch.window !== "number" || !Number.isFinite(watch.window) || watch.window < 0) return { allowed: false, reason: "The layout shift watch needs a reviewed observation window of zero or more milliseconds; the window stays a user choice with no code ceiling." };
    if (options.threshold !== void 0 && (typeof options.threshold !== "number" || !Number.isFinite(options.threshold) || options.threshold < 0)) return { allowed: false, reason: "The reviewed shift score threshold must be zero or a positive number." };
    const budgetcheck2 = debugwaitbudgetallowed(watch.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "traceload") {
    const trace = options.trace && typeof options.trace === "object" && !Array.isArray(options.trace) ? options.trace : void 0;
    if (!trace || !Array.isArray(trace.categories) || trace.categories.length === 0 || !trace.categories.every((category) => typeof category === "string" && tracecategories.includes(category))) return { allowed: false, reason: `The trace record needs a non-empty reviewed category list of the reviewed category grammar: ${tracecategories.join(", ")}.` };
    if (typeof trace.window !== "number" || !Number.isFinite(trace.window) || trace.window < 0) return { allowed: false, reason: "The trace record needs a reviewed window of zero or more milliseconds and stops at the reviewed window end." };
    if (trace.exporttarget !== void 0 && trace.exporttarget !== "memory" && trace.exporttarget !== "download") return { allowed: false, reason: "The trace export target must be memory or download." };
    const budgetcheck2 = debugwaitbudgetallowed(trace.window, typeof options.wait === "number" ? options.wait : void 0);
    if (!budgetcheck2.allowed) return budgetcheck2;
    return { allowed: true };
  }
  if (kind === "annotatetrace" || kind === "replaytrace") {
    const trace = options.trace && typeof options.trace === "object" && !Array.isArray(options.trace) ? options.trace : void 0;
    if (!trace || typeof trace.traceid !== "string" || !trace.traceid.trim()) return { allowed: false, reason: `The ${kind === "annotatetrace" ? "trace annotation" : "trace replay"} needs the stored trace id of a recorded trace.` };
    if (kind === "replaytrace") return { allowed: true };
    if (!Array.isArray(options.annotations) || options.annotations.length === 0 || !options.annotations.every((annotation) => annotationof(annotation) !== void 0)) return { allowed: false, reason: "Exported traces carry their step annotations: every annotation needs a step id, a label and an optional offset from the trace start." };
    return { allowed: true };
  }
  if (kind === "capturesourcemaps") {
    if (options.scripts !== void 0) {
      if (!Array.isArray(options.scripts) || options.scripts.length === 0 || !options.scripts.every((url) => typeof url === "string" && ishttpsurl(url))) return { allowed: false, reason: "The source map capture scripts must be a non-empty list of reviewed HTTPS urls." };
    }
    return { allowed: true };
  }
  return { allowed: true };
}
function sockettarget(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  for (const key of ["socket", "subscription", "poll"]) {
    const value = options[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const url = value.url;
      if (typeof url === "string" && url.trim()) return url.trim();
    }
  }
  return void 0;
}
function recordingconsentgranted(step) {
  let options = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const consentref = options.consentref;
  if (typeof consentref !== "string" || !consentref.trim()) return { allowed: false, reason: "A recording of user activity requires a reviewed consent ref in options before it starts." };
  return { allowed: true };
}
function lapsebudgetallowed(interval, duration, wait) {
  if (!(interval > 0)) return { allowed: false, reason: "The reviewed lapse interval must be a positive number of milliseconds." };
  if (!(duration > 0)) return { allowed: false, reason: "The reviewed lapse duration must be a positive number of milliseconds." };
  if (wait !== void 0 && !(wait >= 0)) return { allowed: false, reason: "The reviewed wait budget must be zero or a positive number of milliseconds." };
  if (wait !== void 0 && duration > wait) return { allowed: false, reason: `The lapse duration of ${duration} milliseconds exceeds the reviewed wait budget of ${wait} milliseconds; review a wider budget or a shorter duration.` };
  return { allowed: true };
}
function validatemediagrammar(step, options) {
  const kind = step.kind;
  if (kind === "capturepdf") {
    const pdf = options.pdf;
    if (pdf !== void 0) {
      if (!pdf || typeof pdf !== "object" || Array.isArray(pdf)) return { allowed: false, reason: "The reviewed pdf options must be an object in options.pdf." };
      const pdfoptions = pdf;
      if (pdfoptions.paperwidth !== void 0 && (typeof pdfoptions.paperwidth !== "number" || !Number.isFinite(pdfoptions.paperwidth) || pdfoptions.paperwidth <= 0)) return { allowed: false, reason: "The reviewed pdf paper width must be a positive number of inches with no code cap." };
      if (pdfoptions.paperheight !== void 0 && (typeof pdfoptions.paperheight !== "number" || !Number.isFinite(pdfoptions.paperheight) || pdfoptions.paperheight <= 0)) return { allowed: false, reason: "The reviewed pdf paper height must be a positive number of inches with no code cap." };
      if (pdfoptions.margins !== void 0) {
        const margins = pdfoptions.margins;
        if (!margins || typeof margins !== "object" || Array.isArray(margins)) return { allowed: false, reason: "The reviewed pdf margins must be an object with top, right, bottom and left inches." };
        for (const side of ["top", "right", "bottom", "left"]) {
          const value = margins[side];
          if (value === void 0) continue;
          if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return { allowed: false, reason: `The reviewed pdf ${side} margin must be zero or a positive number of inches; negative margins are refused.` };
        }
      }
      if (pdfoptions.scale !== void 0 && (typeof pdfoptions.scale !== "number" || !Number.isFinite(pdfoptions.scale) || pdfoptions.scale <= 0)) return { allowed: false, reason: "The reviewed pdf scale must be a positive number with no code cap." };
      if (pdfoptions.landscape !== void 0 && typeof pdfoptions.landscape !== "boolean") return { allowed: false, reason: "The reviewed pdf landscape flag must be a boolean." };
      if (pdfoptions.paginate !== void 0 && typeof pdfoptions.paginate !== "boolean") return { allowed: false, reason: "The reviewed pdf paginate flag must be a boolean." };
    }
    if (options.breakpoints !== void 0 && (!Array.isArray(options.breakpoints) || options.breakpoints.length === 0 || !options.breakpoints.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed pdf break points must be a non-empty list of selectors when present." };
    if (options.exporttarget !== void 0 && options.exporttarget !== "memory" && options.exporttarget !== "download") return { allowed: false, reason: "The reviewed pdf export target must be memory or download; pdf documents do not route to the clipboard." };
    if (options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed pdf artifact name must be a non-empty string." };
  }
  if (kind === "recordscreen" || kind === "captureaudio") {
    const recording = options.recording;
    if (recording !== void 0) {
      if (!recording || typeof recording !== "object" || Array.isArray(recording)) return { allowed: false, reason: "The reviewed recording options must be an object in options.recording." };
      const recordoptions = recording;
      if (recordoptions.scope !== void 0 && recordoptions.scope !== "tab" && recordoptions.scope !== "run") return { allowed: false, reason: "The reviewed recording scope must be tab or run." };
      if (recordoptions.fps !== void 0 && (typeof recordoptions.fps !== "number" || !Number.isFinite(recordoptions.fps) || recordoptions.fps <= 0)) return { allowed: false, reason: "The reviewed recording fps must be a positive number with no code ceiling." };
      if (recordoptions.bitrate !== void 0 && (typeof recordoptions.bitrate !== "number" || !Number.isFinite(recordoptions.bitrate) || recordoptions.bitrate <= 0)) return { allowed: false, reason: "The reviewed recording bitrate must be a positive number with no code ceiling." };
      if (recordoptions.audio !== void 0 && typeof recordoptions.audio !== "boolean") return { allowed: false, reason: "The reviewed recording audio flag must be a boolean." };
    }
    if (options.duration !== void 0 && (typeof options.duration !== "number" || !Number.isFinite(options.duration) || options.duration <= 0)) return { allowed: false, reason: "The reviewed recording duration must be a positive number of milliseconds with no code ceiling." };
    const consent = recordingconsentgranted(step);
    if (!consent.allowed) return consent;
  }
  if (kind === "captureframe") {
    if (options.timestamp !== void 0 && (typeof options.timestamp !== "number" || !Number.isFinite(options.timestamp) || options.timestamp < 0)) return { allowed: false, reason: "The reviewed frame timestamp must be zero or a positive number of seconds." };
    if (options.poster !== void 0 && typeof options.poster !== "boolean") return { allowed: false, reason: "The reviewed poster flag must be a boolean." };
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "downloadimages") {
    const filter = options.imagefilter;
    if (!filter || typeof filter !== "object" || Array.isArray(filter)) return { allowed: false, reason: "A reviewed imagefilter is required in options before any image downloads." };
    const imagefilter = filter;
    if (imagefilter.selector !== void 0 && !isnonempty(imagefilter.selector)) return { allowed: false, reason: "The reviewed imagefilter selector must be a non-empty selector from the reviewed selector grammar." };
    if (imagefilter.minwidth !== void 0 && (typeof imagefilter.minwidth !== "number" || !Number.isFinite(imagefilter.minwidth) || imagefilter.minwidth < 0)) return { allowed: false, reason: "The reviewed imagefilter minimum width must be zero or a positive number of pixels." };
    if (imagefilter.minheight !== void 0 && (typeof imagefilter.minheight !== "number" || !Number.isFinite(imagefilter.minheight) || imagefilter.minheight < 0)) return { allowed: false, reason: "The reviewed imagefilter minimum height must be zero or a positive number of pixels." };
    if (imagefilter.formats !== void 0 && (!Array.isArray(imagefilter.formats) || imagefilter.formats.length === 0 || !imagefilter.formats.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed imagefilter format list must be a non-empty list of mime or extension patterns when present." };
    if (options.naming !== void 0) {
      const namingcheck = validatecapturenaming(options.naming);
      if (!namingcheck.allowed) return namingcheck;
    }
  }
  if (kind === "shotcanvas") {
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "probestream" && options.selector !== void 0 && !isnonempty(options.selector)) return { allowed: false, reason: "The reviewed stream probe scope selector must be a non-empty string." };
  if (kind === "timelapse") {
    const lapse = options.lapse;
    if (!lapse || typeof lapse !== "object" || Array.isArray(lapse)) return { allowed: false, reason: "A reviewed lapse plan with interval, duration and format is required in options." };
    const plan = lapse;
    if (typeof plan.interval !== "number" || !Number.isFinite(plan.interval) || plan.interval <= 0) return { allowed: false, reason: "The reviewed lapse interval must be a positive number of milliseconds with no code ceiling." };
    if (typeof plan.duration !== "number" || !Number.isFinite(plan.duration) || plan.duration <= 0) return { allowed: false, reason: "The reviewed lapse duration must be a positive number of milliseconds with no code ceiling." };
    if (plan.format !== void 0 && plan.format !== "png" && plan.format !== "jpeg" && plan.format !== "webp") return { allowed: false, reason: "The reviewed lapse format must be png, jpeg or webp." };
    const budget = lapsebudgetallowed(plan.interval, plan.duration, typeof options.wait === "number" ? options.wait : void 0);
    if (!budget.allowed) return budget;
    const capturecheck = validatecaptureoptions(options.capture);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (kind === "convertimage" || kind === "makethumbs") {
    const single = options.capture;
    const list = options.captures;
    const hasone = isnonempty(single);
    const haslist = Array.isArray(list) && list.length > 0 && list.every((item) => isnonempty(item));
    if (!hasone && !haslist) return { allowed: false, reason: "A reviewed capture id or a reviewed non-empty capture id list is required in options." };
    if (hasone && haslist) return { allowed: false, reason: "The reviewed step needs one capture id or a capture id list, not both." };
  }
  if (kind === "convertimage") {
    const convert = options.convert;
    if (!convert || typeof convert !== "object" || Array.isArray(convert)) return { allowed: false, reason: "A reviewed convert directive with a target format is required in options." };
    const directive = convert;
    if (directive.target !== "png" && directive.target !== "jpeg" && directive.target !== "webp") return { allowed: false, reason: "The reviewed conversion target must be png, jpeg or webp." };
    if (directive.source !== void 0 && directive.source !== "png" && directive.source !== "jpeg" && directive.source !== "webp") return { allowed: false, reason: "The reviewed conversion source must be png, jpeg or webp." };
    if (directive.quality !== void 0 && (typeof directive.quality !== "number" || !Number.isFinite(directive.quality) || directive.quality < 0 || directive.quality > 100)) return { allowed: false, reason: "The reviewed conversion quality must stay between zero and one hundred with no code cap inside that range." };
  }
  if (kind === "makethumbs") {
    const thumb = options.thumb;
    if (!thumb || typeof thumb !== "object" || Array.isArray(thumb)) return { allowed: false, reason: "A reviewed thumb directive with size, fit and suffix is required in options." };
    const directive = thumb;
    if (typeof directive.size !== "number" || !Number.isFinite(directive.size) || directive.size <= 0) return { allowed: false, reason: "The reviewed thumbnail size must be a positive number of pixels with no fixed set." };
    if (directive.fit !== "cover" && directive.fit !== "contain") return { allowed: false, reason: "The reviewed thumbnail fit must be cover or contain." };
    if (!isnonempty(directive.suffix)) return { allowed: false, reason: "The reviewed thumbnail naming suffix must be a non-empty string." };
  }
  return { allowed: true };
}
function validatestep(step, origin) {
  if (!allowedactions.has(step.kind)) return { allowed: false, reason: "Unsupported action kind." };
  if (!step.summary.trim()) return { allowed: false, reason: "A human-readable action summary is required." };
  let options;
  try {
    options = parseoptions(step);
  } catch {
    return { allowed: false, reason: "Step options must be a JSON object." };
  }
  const hastargetref = options.targetref !== void 0;
  if (targetactions.has(step.kind) && !step.target?.trim() && !hastargetref) return { allowed: false, reason: "A page target is required." };
  if (valueactions.has(step.kind) && !step.value?.trim()) return { allowed: false, reason: "A reviewed value is required." };
  if (step.kind === "select" && !step.value?.trim()) return { allowed: false, reason: "A reviewed option value is required." };
  if (step.kind === "navigate" && !step.value) return { allowed: false, reason: "A navigation URL is required." };
  if (hastargetref) {
    const reference = validatetargetref(options.targetref);
    if (!reference.allowed) return reference;
  }
  if (step.kind === "wait") {
    try {
      waitduration(step);
    } catch {
      return { allowed: false, reason: "Wait duration must be zero or a positive number of milliseconds." };
    }
  }
  if (step.kind === "navigate") {
    try {
      if (new URL(step.value ?? "").origin !== origin) return { allowed: false, reason: "Navigation must remain within the approved origin." };
    } catch {
      return { allowed: false, reason: "Navigation URL is invalid." };
    }
  }
  if (step.kind === "tabcreate" || step.kind === "windowcreate" || step.kind === "downloadfile") {
    try {
      const url = new URL(step.value ?? "");
      if (url.protocol !== "https:") return { allowed: false, reason: "The reviewed URL must use HTTPS." };
    } catch {
      return { allowed: false, reason: "The reviewed URL is invalid." };
    }
  }
  if (step.kind === "tabactivate" || step.kind === "tabclose" || step.kind === "tabreload" || step.kind === "windowclose" || step.kind === "windowresize") {
    if (!isnumericid(step.value)) return { allowed: false, reason: "A numeric browser id is required." };
  }
  if (step.kind === "zoomset") {
    const zoom = Number(step.value);
    if (!Number.isFinite(zoom) || zoom <= 0) return { allowed: false, reason: "The reviewed zoom must be a positive number." };
  }
  if (step.kind === "setattribute" || step.kind === "writestorage") {
    const keyname = step.kind === "setattribute" ? "name" : "key";
    if (typeof options[keyname] !== "string" || !options[keyname].trim()) return { allowed: false, reason: `A reviewed ${keyname} is required in options.` };
    if (typeof options.value !== "string") return { allowed: false, reason: "A reviewed value is required in options." };
  }
  if (step.kind === "windowresize") {
    if (typeof options.width !== "number" || typeof options.height !== "number" || !Number.isFinite(options.width) || !Number.isFinite(options.height)) return { allowed: false, reason: "Reviewed width and height numbers are required in options." };
  }
  if ((step.kind === "scrollpage" || step.kind === "scrollby") && (!numericoption(options, "x") || !numericoption(options, "y"))) return { allowed: false, reason: "Scroll amounts must be numbers in options." };
  if (step.kind === "waitfor" && options.timeout !== void 0 && (typeof options.timeout !== "number" || options.timeout < 0)) return { allowed: false, reason: "The waitfor timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "movepointer") {
    const path = options.pointpath;
    if (!path || typeof path !== "object" || Array.isArray(path)) return { allowed: false, reason: "A reviewed pointpath with start and end points is required in options." };
    const points = path;
    if (!ispoint(points.start) || !ispoint(points.end)) return { allowed: false, reason: "The reviewed pointpath needs numeric start and end points." };
    if (points.waypoints !== void 0 && (!Array.isArray(points.waypoints) || !points.waypoints.every((waypoint) => ispoint(waypoint)))) return { allowed: false, reason: "The reviewed pointpath waypoints must be numeric points." };
    if (!nonnegativeoption(points, "duration")) return { allowed: false, reason: "The reviewed pointpath duration must be zero or a positive number of milliseconds." };
    const speed = options.speedprofile;
    if (speed !== void 0) {
      if (!speed || typeof speed !== "object" || Array.isArray(speed)) return { allowed: false, reason: "The reviewed speed profile must be an object." };
      const profile = speed;
      if (profile.easing !== void 0 && profile.easing !== "linear" && profile.easing !== "easeinout") return { allowed: false, reason: "The reviewed easing must be linear or easeinout." };
      if (!nonnegativeoption(profile, "peak")) return { allowed: false, reason: "The reviewed peak velocity must be zero or a positive number." };
      if (!nonnegativeoption(profile, "jitter")) return { allowed: false, reason: "The reviewed jitter window must be zero or a positive number of milliseconds." };
    }
  }
  if (step.kind === "clickpoint" && (!hastargetref || options.targetref.mode !== "point")) return { allowed: false, reason: "A reviewed point target reference is required in options." };
  if (step.kind === "clicktext" && (!hastargetref || options.targetref.mode !== "text")) return { allowed: false, reason: "A reviewed text target reference is required in options." };
  if (step.kind === "clickaria" && (!hastargetref || options.targetref.mode !== "aria")) return { allowed: false, reason: "A reviewed aria target reference is required in options." };
  if (step.kind === "clickname" && (!hastargetref || options.targetref.mode !== "name")) return { allowed: false, reason: "A reviewed name target reference is required in options." };
  if (step.kind === "resolvexpath" && (!hastargetref || options.targetref.mode !== "xpath")) return { allowed: false, reason: "A reviewed xpath target reference is required in options." };
  if (step.kind === "typetime" && options.delay !== void 0 && (typeof options.delay !== "number" || !Number.isFinite(options.delay) || options.delay < 0)) return { allowed: false, reason: "The reviewed per keystroke delay must be zero or a positive number of milliseconds." };
  if (step.kind === "submitsearch") {
    if (!isnonempty(options.results)) return { allowed: false, reason: "A reviewed results region selector is required in options." };
    if (options.timeout !== void 0 && (typeof options.timeout !== "number" || !Number.isFinite(options.timeout) || options.timeout < 0)) return { allowed: false, reason: "The submitsearch timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "selectmulti") {
    const values = options.values;
    if (!Array.isArray(values) || values.length === 0 || !values.every((value) => isnonempty(value))) return { allowed: false, reason: "A reviewed list of option values is required in options." };
  }
  if (step.kind === "setslider") {
    const slider = Number(step.value);
    if (!Number.isFinite(slider)) return { allowed: false, reason: "The reviewed slider value must be a number." };
  }
  if (step.kind === "setdate" && !/^\d{4}-\d{2}-\d{2}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed date must use the yyyy-mm-dd form." };
  if (step.kind === "setcolor" && !/^#[0-9a-fA-F]{6}$/.test(step.value ?? "")) return { allowed: false, reason: "The reviewed color must use the #rrggbb form." };
  if (step.kind === "keyhold" && options.holdid !== void 0 && !isnonempty(options.holdid)) return { allowed: false, reason: "The reviewed hold id must be a non-empty string." };
  if (step.kind === "dismissdialog") {
    const accept = options.accept;
    const answer = options.answer;
    if (accept === void 0 && !isnonempty(answer)) return { allowed: false, reason: "A reviewed accept flag or prompt answer is required in options." };
    if (accept !== void 0 && typeof accept !== "boolean") return { allowed: false, reason: "The reviewed dialog accept flag must be a boolean." };
    if (answer !== void 0 && !isnonempty(answer)) return { allowed: false, reason: "The reviewed prompt answer must be a non-empty string." };
  }
  if (step.kind === "pierceshadow" && options.shadow !== void 0) {
    if (!Array.isArray(options.shadow) || !options.shadow.every((item) => isnonempty(item))) return { allowed: false, reason: "The reviewed shadow path must be a list of non-empty selectors." };
  }
  if (step.kind === "enterframe") {
    const path = options.framepath;
    if (!Array.isArray(path) || path.length === 0 || !path.every((item) => typeof item === "number" && Number.isInteger(item) && item >= 0)) return { allowed: false, reason: "A reviewed frame path of frame indexes is required in options." };
    return validateinnerstep(options, origin);
  }
  if (step.kind === "retryaction") {
    const inner = validateinnerstep(options, origin);
    if (!inner.allowed) return inner;
    const rule = options.retryrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { allowed: false, reason: "A reviewed retry rule with attempts is required in options." };
    const retry = rule;
    if (typeof retry.attempts !== "number" || !Number.isInteger(retry.attempts) || retry.attempts < 1) return { allowed: false, reason: "The reviewed retry attempts must be a positive integer with no code ceiling." };
    if (!nonnegativeoption(retry, "settle")) return { allowed: false, reason: "The reviewed retry settle window must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(retry, "tolerance")) return { allowed: false, reason: "The reviewed retry movement tolerance must be zero or a positive number of pixels." };
  }
  if (watchactions.has(step.kind)) {
    if (typeof options.lifetime !== "number" || !Number.isFinite(options.lifetime) || options.lifetime <= 0) return { allowed: false, reason: "A reviewed watch lifetime window in milliseconds is required in options." };
    if (options.scopes !== void 0 && (!Array.isArray(options.scopes) || !options.scopes.every((scope) => isnonempty(scope)))) return { allowed: false, reason: "The reviewed watch scopes must be a list of non-empty selectors." };
    if (options.events !== void 0 && (!Array.isArray(options.events) || !options.events.every((event) => isnonempty(event)))) return { allowed: false, reason: "The reviewed watch event kinds must be a list of non-empty strings." };
    if (!nonnegativeoption(options, "poll")) return { allowed: false, reason: "The reviewed watch poll interval must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "waitquiet") {
    const rule = options.quietrule;
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { allowed: false, reason: "A reviewed quietrule with an idle threshold is required in options." };
    const quiet = rule;
    if (typeof quiet.idle !== "number" || !Number.isFinite(quiet.idle) || quiet.idle <= 0) return { allowed: false, reason: "The reviewed quiet idle threshold must be a positive number of milliseconds with no code ceiling." };
    if (!nonnegativeoption(quiet, "poll")) return { allowed: false, reason: "The reviewed quiet poll interval must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(quiet, "timeout")) return { allowed: false, reason: "The reviewed quiet timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "diffsnapshots") {
    const versions = options.versions;
    if (!Array.isArray(versions) || versions.length !== 2 || !versions.every((version) => typeof version === "number" && Number.isInteger(version) && version >= 1)) return { allowed: false, reason: "Two reviewed observation version numbers are required in options." };
  }
  if (step.kind === "openlink" || step.kind === "openprivate" || step.kind === "deeplink") {
    const targetcheck = validatenavtarget(options.navtarget, step.kind);
    if (!targetcheck.allowed) return targetcheck;
    if (step.kind === "deeplink") {
      const app = options.app;
      if (!isnonempty(app)) return { allowed: false, reason: "A reviewed deep link app pattern is required in options." };
      const params = options.params;
      if (params !== void 0 && (!params || typeof params !== "object" || Array.isArray(params) || !Object.values(params).every((item) => typeof item === "string"))) return { allowed: false, reason: "The reviewed deep link params must be an object of string values." };
    }
  }
  if (step.kind === "waitload" && !nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The waitload timeout must be zero or a positive number of milliseconds." };
  if (step.kind === "waiturl" || step.kind === "spawait") {
    if (step.kind === "waiturl") {
      const patterncheck = validateurlpattern(options.urlpattern);
      if (!patterncheck.allowed) return patterncheck;
    }
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The wait timeout must be zero or a positive number of milliseconds." };
    if (!nonnegativeoption(options, "poll")) return { allowed: false, reason: "The wait poll interval must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "followlink") {
    if (options.fragment !== void 0 && typeof options.fragment !== "boolean") return { allowed: false, reason: "The reviewed followlink fragment flag must be a boolean." };
  }
  if (step.kind === "spanav") {
    if (options.routepattern !== void 0) {
      const routecheck = validateurlpattern(options.routepattern);
      if (!routecheck.allowed) return routecheck;
    }
    if (!nonnegativeoption(options, "timeout")) return { allowed: false, reason: "The spanav route timeout must be zero or a positive number of milliseconds." };
  }
  if (step.kind === "rewritequery") {
    const set = options.set;
    const remove = options.remove;
    if (set === void 0 && remove === void 0) return { allowed: false, reason: "Reviewed query parameters to set or remove are required in options." };
    if (set !== void 0 && (!set || typeof set !== "object" || Array.isArray(set) || !Object.values(set).every((item) => typeof item === "string"))) return { allowed: false, reason: "The reviewed query parameters to set must be an object of string values." };
    if (remove !== void 0 && (!Array.isArray(remove) || !remove.every((item) => isnonempty(item)))) return { allowed: false, reason: "The reviewed query parameters to remove must be a list of non-empty names." };
  }
  if (step.kind === "navlist") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "navprofile") {
    const profilecheck = validatewaitprofile(options.waitprofile);
    if (!profilecheck.allowed) return profilecheck;
  }
  if (step.kind === "handleauth" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS origin or url is required as the auth target." };
  if (step.kind === "printpdf" && options.name !== void 0 && !isnonempty(options.name)) return { allowed: false, reason: "The reviewed artifact name must be a non-empty string." };
  if (step.kind === "prefetch") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (step.kind === "preconnect") {
    const origins = options.origins;
    if (!Array.isArray(origins) || origins.length === 0 || !origins.every((originurl) => ishttpsurl(originurl))) return { allowed: false, reason: "A reviewed non-empty list of HTTPS origins is required in options." };
  }
  if (step.kind === "reopentab" && step.value !== void 0 && !ishttpsurl(step.value)) return { allowed: false, reason: "The reviewed reopen url must use HTTPS." };
  if (step.kind === "navrate") {
    const limitcheck = validateratelimit(options.ratelimit);
    if (!limitcheck.allowed) return limitcheck;
  }
  if (step.kind === "checksafe" && !ishttpsurl(step.value)) return { allowed: false, reason: "A reviewed HTTPS url is required for the safety check." };
  if (step.kind === "batchopen") {
    const listcheck = validateurllist(options, "urls");
    if (!listcheck.allowed) return listcheck;
  }
  if (istabscommandkind(step.kind)) {
    const tabscheck = validatetabsgrammar(step, options);
    if (!tabscheck.allowed) return tabscheck;
  }
  if (isformkind(step.kind)) {
    const formcheck = validateformgrammar(step, options);
    if (!formcheck.allowed) return formcheck;
  }
  if (isdatasetkind(step.kind)) {
    const datacheck = validatedatagrammar(step, options, origin);
    if (!datacheck.allowed) return datacheck;
  }
  if (isfileskind(step.kind)) {
    const filescheck = validatefilesgrammar(step, options);
    if (!filescheck.allowed) return filescheck;
  }
  if (iscapturekind(step.kind)) {
    const capturecheck = validatecapturegrammar(step, options);
    if (!capturecheck.allowed) return capturecheck;
  }
  if (ismediakind(step.kind)) {
    const mediacheck = validatemediagrammar(step, options);
    if (!mediacheck.allowed) return mediacheck;
  }
  if (ishttpkind(step.kind)) {
    const httpcheck = validatehttpgrammar(step, options);
    if (!httpcheck.allowed) return httpcheck;
  }
  if (issocketkind(step.kind)) {
    const socketcheck = validatesocketgrammar(step, options);
    if (!socketcheck.allowed) return socketcheck;
  }
  if (isnetwatchkind(step.kind)) {
    const netwatchcheck = validatenetwatchgrammar(step, options);
    if (!netwatchcheck.allowed) return netwatchcheck;
  }
  if (iscontrolkind(step.kind)) {
    const controlcheck = validatecontrolgrammar(step, options);
    if (!controlcheck.allowed) return controlcheck;
  }
  if (isdebugkind(step.kind)) {
    const timelinecheck = validatetimelinegrammar(step, options);
    if (!timelinecheck.allowed) return timelinecheck;
  }
  if (iscdpkind(step.kind)) {
    const cdpcheck = validatecdpgrammar(step, options);
    if (!cdpcheck.allowed) return cdpcheck;
  }
  if (isprofilekind(step.kind)) {
    const profilecheck = validateprofilegrammar(step, options);
    if (!profilecheck.allowed) return profilecheck;
  }
  if (isemulationkind(step.kind)) {
    const emulationcheck = validateemulationgrammar(step, options);
    if (!emulationcheck.allowed) return emulationcheck;
  }
  if (issessionkind(step.kind)) {
    const sessioncheck = validatesessiongrammar(step, options);
    if (!sessioncheck.allowed) return sessioncheck;
  }
  if (isworkflowkind(step.kind)) {
    const workflowcheck = validateworkflowgrammar(step, options);
    if (!workflowcheck.allowed) return workflowcheck;
  }
  if (istriggeraction(step.kind)) {
    const triggercheck = validatetriggergrammar(step, options);
    if (!triggercheck.allowed) return triggercheck;
  }
  if (step.kind === "tabcreate") {
    if (options.background !== void 0 && typeof options.background !== "boolean") return { allowed: false, reason: "The reviewed background flag must be a boolean." };
    if (options.window !== void 0 && (typeof options.window !== "number" || !Number.isInteger(options.window) || options.window < 0)) return { allowed: false, reason: "The reviewed target window id must be a non-negative integer." };
  }
  if (step.kind === "windowcreate") {
    for (const field of ["left", "top", "width", "height"]) {
      if (options[field] !== void 0 && (typeof options[field] !== "number" || !Number.isFinite(options[field]))) return { allowed: false, reason: `The reviewed window ${field} must be a number.` };
    }
    if (options.state !== void 0 && !["normal", "maximized", "minimized", "fullscreen"].includes(options.state)) return { allowed: false, reason: "The reviewed window state must be normal, maximized, minimized or fullscreen." };
  }
  return { allowed: true };
}
function environmentrequirements() {
  return environmentrequirementsof([...allowedactions]);
}

// run.ts
var loglevels = ["error", "warn", "info", "log", "debug", "trace"];
var timelinesources = ["console", "error", "rejection", "resource", "longtask", "network", "cdp"];

// security.ts
var defaultmaskshapes = ["password", "token", "card", "secret"];

// protocol.ts
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Protocol message must be an object.");
  return value;
}
function text(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string.`);
  return value.trim();
}
function parseproposal(value, origin, grants, agents) {
  const root = record(value);
  if (root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const covered = grants !== void 0 && grants.length > 0 ? grants : [origin];
  const agentid = typeof root.agentid === "string" && root.agentid.trim() !== "" ? root.agentid.trim() : void 0;
  if (agentid !== void 0 && agents !== void 0 && !agents.some((record2) => record2.id === agentid)) throw new Error(`The proposal names the agent ${agentid} which the fleet registry does not carry; every proposal attributes to a registered agent.`);
  const planinput = record(root.plan);
  const stepsinput = planinput.steps;
  if (!Array.isArray(stepsinput) || stepsinput.length === 0) throw new Error("A plan needs at least one step.");
  const createdat = Date.now();
  const expiresat = typeof planinput.expiresat === "number" ? planinput.expiresat : createdat + 10 * 60 * 1e3;
  if (expiresat <= createdat) throw new Error("Plan expiry must be in the future.");
  const planwindow = expiresat - createdat;
  const attachinput = stepsinput.map((input) => record(input)).find((candidate) => candidate.kind === "attachcdp");
  let planallowlist;
  if (attachinput !== void 0) {
    const attachoptions = (() => {
      try {
        return parseoptions({ id: "attach", kind: "attachcdp", summary: "attach", risk: "sensitive", ...typeof attachinput.options === "string" ? { options: attachinput.options } : {} });
      } catch {
        return {};
      }
    })();
    const domains = Array.isArray(attachoptions.domains) ? attachoptions.domains.filter((domain) => typeof domain === "string" && cdpdomains.includes(domain)) : [];
    const gated = cdpallowlistof(attachoptions.allowlist);
    planallowlist = domains.length > 0 ? { domains, ...gated?.methods !== void 0 ? { methods: gated.methods } : {} } : void 0;
  }
  const steps = stepsinput.map((input, index) => {
    const candidate = record(input);
    const kind = text(candidate.kind, `step ${index + 1} kind`);
    const step = {
      id: typeof candidate.id === "string" ? candidate.id : crypto.randomUUID(),
      kind,
      summary: text(candidate.summary, `step ${index + 1} summary`),
      risk: resolvedrisk(stepof(kind, candidate, index)),
      ...typeof candidate.idempotencykey === "string" ? { idempotencykey: candidate.idempotencykey } : {},
      ...typeof candidate.target === "string" ? { target: candidate.target } : {},
      ...typeof candidate.value === "string" ? { value: candidate.value } : {},
      ...typeof candidate.options === "string" ? { options: candidate.options } : {},
      ...typeof candidate.intenthint === "string" && candidate.intenthint.trim() !== "" ? { intenthint: candidate.intenthint.trim() } : {}
    };
    if (step.kind === "scrapetable" || step.kind === "paginateextract" || step.kind === "resumeextract" || step.kind === "transformvalues" || step.kind === "deduperows" || step.kind === "stamplerows" || step.kind === "previewgrid" || step.kind === "streamdisk" || step.kind === "logprovenance") {
      let pipelineoptions = {};
      try {
        pipelineoptions = parseoptions(step);
      } catch {
        pipelineoptions = {};
      }
      const pipelineref = pipelineoptions.pipeline;
      if (pipelineref !== void 0 && (typeof pipelineref !== "string" || pipelineref.trim() === "")) throw new Error(`The ${step.kind} step names its pipeline reference as the non-empty id of the extractpipeline its rows flow through.`);
      const pipelinerules = Array.isArray(pipelineoptions.rules) ? pipelineoptions.rules : [];
      for (const rule of pipelinerules) {
        if (!rule || typeof rule !== "object" || Array.isArray(rule)) continue;
        const operation = rule.operation;
        if (operation === void 0) continue;
        if (typeof operation !== "string" || !["trim", "case", "number", "date"].includes(operation)) throw new Error(`The ${step.kind} proposal carries the transform operation ${String(operation)} which the reviewed transform grammar does not carry; the pipeline refuses an unknown operation before any value reshapes.`);
      }
      const visionoption = pipelineoptions.vision;
      if (visionoption !== void 0) {
        if (!visionoption || typeof visionoption !== "object" || Array.isArray(visionoption)) throw new Error(`The ${step.kind} proposal carries its vision block as an object with the reviewed prompt; an opaque vision option refuses at the boundary.`);
        const visionprompt = visionoption.prompt;
        if (typeof visionprompt !== "string" || visionprompt.trim() === "") throw new Error(`The ${step.kind} proposal carries a vision prompt that is not a non-empty string; the vision model answers exactly what the review asked.`);
        const visionregion = visionoption.ocrregion;
        if (visionregion !== void 0 && (!visionregion || typeof visionregion !== "object" || Array.isArray(visionregion))) throw new Error(`The ${step.kind} proposal carries its ocrregion as the { x, y, width, height } rectangle of the reviewed grammar; an opaque region refuses at the boundary.`);
      }
    }
    if (step.kind === "batchopen") {
      let batchoptions = {};
      try {
        batchoptions = parseoptions(step);
      } catch {
        batchoptions = {};
      }
      const batchurls = Array.isArray(batchoptions.urls) ? batchoptions.urls.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
      const outsidegrant = batchurls.filter((url) => {
        try {
          return !covered.some((pattern) => new URL(url).origin === new URL(pattern).origin);
        } catch {
          return true;
        }
      });
      if (outsidegrant.length > 0) throw new Error(`The batchopen proposal carries ${outsidegrant.length} url${outsidegrant.length === 1 ? "" : "s"} outside the grants (${outsidegrant.slice(0, 3).join(", ")}); a batch never widens the origin grants.`);
    }
    if (step.kind === "shotview" || step.kind === "shotfullpage" || step.kind === "shotelement" || step.kind === "shotregion" || step.kind === "contactsheet" || step.kind === "captureframe" || step.kind === "shotcanvas") {
      let captureoptions = {};
      try {
        captureoptions = parseoptions(step);
      } catch {
        captureoptions = {};
      }
      const captureblock = captureoptions.capture;
      if (captureblock !== void 0) {
        if (!captureblock || typeof captureblock !== "object" || Array.isArray(captureblock)) throw new Error(`The ${step.kind} proposal carries its capture block as an object with the reviewed naming pattern, pair mode and diff flag; an opaque capture option refuses at the boundary.`);
        const capturefields = captureblock;
        const naming = capturefields.naming;
        if (naming !== void 0 && (typeof naming !== "string" || naming.trim() === "")) throw new Error(`The ${step.kind} proposal carries its capture naming pattern as a non-empty lowercase string with the {plan}, {step}, {timestamp} and {sequence} parts; a filename the review never saw names nothing honestly.`);
        const pairmode = capturefields.pair;
        if (pairmode !== void 0 && pairmode !== "beforeafter" && pairmode !== "post" && pairmode !== "none") throw new Error(`The ${step.kind} proposal carries its capture pair mode as one of beforeafter, post or none; an unknown pair mode never wraps a step.`);
        const diff = capturefields.diff;
        if (diff !== void 0 && typeof diff !== "boolean") throw new Error(`The ${step.kind} proposal carries its capture diff flag as a boolean; the diffshot comparison runs only when the review asked for it.`);
      }
    }
    if (step.kind === "blockrequest") {
      let blockoptions = {};
      try {
        blockoptions = parseoptions(step);
      } catch {
        blockoptions = {};
      }
      const rule = blockruleof(blockoptions.block);
      if (rule && patternorigin(rule.urlpattern) === void 0) throw new Error("Block rules without a named origin pattern are refused.");
    }
    if (step.kind === "routeproxy") {
      let proxyoptions = {};
      try {
        proxyoptions = parseoptions(step);
      } catch {
        proxyoptions = {};
      }
      const proxy = proxyoptions.proxy;
      const bypass = proxy && typeof proxy === "object" && !Array.isArray(proxy) ? proxy.bypass : void 0;
      if (!Array.isArray(bypass) || bypass.length === 0) throw new Error("Proxy routes without a bypass list are refused.");
    }
    if (step.kind === "watchconsole" || step.kind === "watcherrors" || step.kind === "watchtasks") {
      let debugoptions = {};
      try {
        debugoptions = parseoptions(step);
      } catch {
        debugoptions = {};
      }
      const granted = covered.some((pattern) => {
        try {
          return new URL(origin).origin === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The ${step.kind} capture of ${origin} targets an origin outside the grants.`);
      if (debugoptions.level !== void 0 && !loglevels.includes(debugoptions.level)) throw new Error(`The reviewed level floor must be one of ${loglevels.join(", ")}.`);
    }
    if (iscdpkind(step.kind)) {
      const granted = covered.some((pattern) => {
        try {
          return new URL(origin).origin === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let cdpoptions = {};
      try {
        cdpoptions = parseoptions(step);
      } catch {
        cdpoptions = {};
      }
      if (step.kind === "attachcdp") {
        if (teardownplanof(cdpoptions.teardown) === void 0) throw new Error("Attach steps without a reviewed teardown plan are refused.");
        const domains = Array.isArray(cdpoptions.domains) ? cdpoptions.domains.filter((domain) => typeof domain === "string" && cdpdomains.includes(domain)) : [];
        if (domains.length === 0) throw new Error("Attach steps need a non-empty enabled domain list of the reviewed domain grammar.");
        const gated = cdpallowlistof(cdpoptions.allowlist);
        if (cdpoptions.allowlist !== void 0 && (!gated || !gated.domains.every((domain) => domains.includes(domain)))) throw new Error("The reviewed method allowlist must stay inside the enabled domains of the attach.");
      }
      if (step.kind === "cdpcmd") {
        const command = cdpoptions.command && typeof cdpoptions.command === "object" && !Array.isArray(cdpoptions.command) ? cdpoptions.command : void 0;
        const method = typeof command?.method === "string" ? command.method : "";
        if (methoddomain(method) === void 0) throw new Error("Raw commands need a reviewed method of the Domain.method form.");
        if (planallowlist === void 0) throw new Error("Raw command steps need the attachcdp step of the same plan with its enabled domains first.");
        if (!allowlistcovers(planallowlist, method)) throw new Error(`The raw command ${method} stays outside the enabled domain allowlist of the plan attach.`);
      }
    }
    if (isprofilekind(step.kind)) {
      const granted = covered.some((pattern) => {
        try {
          return new URL(origin).origin === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let profileoptions = {};
      try {
        profileoptions = parseoptions(step);
      } catch {
        profileoptions = {};
      }
      const targets = [
        ...attachtargetof(profileoptions.target) !== void 0 ? [attachtargetof(profileoptions.target)] : [],
        ...Array.isArray(profileoptions.attachtargets) ? profileoptions.attachtargets.flatMap((target2) => {
          const parsed = attachtargetof(target2);
          return parsed !== void 0 ? [parsed] : [];
        }) : []
      ];
      for (const target2 of targets) {
        if (target2.kind === "page") continue;
        const targetgranted = covered.some((pattern) => {
          try {
            return new URL(target2.url).origin === new URL(pattern).origin;
          } catch {
            return false;
          }
        });
        if (!targetgranted) throw new Error(`The ${target2.kind} target ${target2.url} of the ${step.kind} step stays outside the granted origins.`);
      }
      if (step.kind === "traceload") {
        const trace = profileoptions.trace && typeof profileoptions.trace === "object" && !Array.isArray(profileoptions.trace) ? profileoptions.trace : void 0;
        const categories = trace !== void 0 && Array.isArray(trace.categories) ? trace.categories : [];
        if (categories.some((category) => typeof category !== "string" || !tracecategories.includes(category))) throw new Error(`Trace categories outside the reviewed list are refused: ${tracecategories.join(", ")}.`);
      }
      if (step.kind === "capturesourcemaps") {
        for (const url of Array.isArray(profileoptions.scripts) ? profileoptions.scripts : []) {
          if (typeof url !== "string") continue;
          const scriptgranted = covered.some((pattern) => {
            try {
              return new URL(url).origin === new URL(pattern).origin;
            } catch {
              return false;
            }
          });
          if (!scriptgranted) throw new Error(`The source map capture of ${url} targets an origin outside the grants.`);
        }
      }
      if (step.kind === "annotatetrace" && (!Array.isArray(profileoptions.annotations) || profileoptions.annotations.length === 0 || !profileoptions.annotations.every((annotation) => annotationof(annotation) !== void 0))) throw new Error("Trace annotation steps without reviewed step annotations are refused.");
    }
    if (isemulationkind(step.kind)) {
      const granted = covered.some((pattern) => {
        try {
          return new URL(origin).origin === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let emulationoptions = {};
      try {
        emulationoptions = parseoptions(step);
      } catch {
        emulationoptions = {};
      }
      if (revertplanof(emulationoptions.revertplan) === void 0) throw new Error("Emulation steps without a reviewed revert plan are refused.");
      if (step.kind === "emulatelocate") {
        const preset = locationpresetof(emulationoptions.location);
        if (preset === void 0) throw new Error("Location emulation needs a reviewed preset with coordinates inside the latitude and longitude ranges.");
      }
      if (step.kind === "overridepermission" && permissiongrantof(emulationoptions.permission) === void 0) throw new Error("Permission overrides of unknown permission names are refused.");
    }
    if (issessionkind(step.kind)) {
      let sessionoptions = {};
      try {
        sessionoptions = parseoptions(step);
      } catch {
        sessionoptions = {};
      }
      if (step.kind === "restoresession") {
        for (const url of Array.isArray(sessionoptions.origins) ? sessionoptions.origins : []) {
          if (typeof url !== "string" || !url) continue;
          const granted = covered.some((pattern) => {
            try {
              return new URL(url).origin === new URL(pattern).origin;
            } catch {
              return false;
            }
          });
          if (!granted) throw new Error(`The session restore reopens ${url} outside the grants.`);
        }
      }
      if (step.kind === "importsessions" && importsessionfile(sessionoptions.file) === void 0) throw new Error("Session import files of unknown format versions are refused.");
    }
    if (isworkflowkind(step.kind)) {
      let workflowoptions = {};
      try {
        workflowoptions = parseoptions(step);
      } catch {
        workflowoptions = {};
      }
      if (step.kind === "composeworkflow") {
        const payload = workflowoptions.workflow && typeof workflowoptions.workflow === "object" && !Array.isArray(workflowoptions.workflow) ? workflowoptions.workflow : void 0;
        const origins = payload && Array.isArray(payload.origins) ? payload.origins.filter((originvalue) => typeof originvalue === "string") : [];
        for (const workfloworigin of origins) {
          const granted = covered.some((pattern) => {
            try {
              return new URL(workfloworigin).origin === new URL(pattern).origin;
            } catch {
              return false;
            }
          });
          if (!granted) throw new Error(`The workflow origin ${workfloworigin} stays outside the grants.`);
        }
      }
      if (step.kind === "runworkflow" && workflowoptions.reviewed !== true) throw new Error("Workflow runs without the explicit run review of the expanded step list are refused.");
    }
    if (istriggeraction(step.kind)) {
      let triggeroptions = {};
      try {
        triggeroptions = parseoptions(step);
      } catch {
        triggeroptions = {};
      }
      if (triggeroptions.reviewed !== true) throw new Error("Trigger rules without the explicit arm review of their match fields and bound workflow are refused.");
      for (const ruleorigin of triggerorigins(step)) {
        const granted = covered.some((pattern) => {
          try {
            return new URL(ruleorigin).origin === new URL(pattern).origin;
          } catch {
            return false;
          }
        });
        if (!granted) throw new Error(`The trigger on ${ruleorigin} stays outside the grants.`);
      }
    }
    const evaluation = validatestep(step, origin);
    if (!evaluation.allowed) throw new Error(evaluation.reason);
    const target = outboundtarget(step);
    if (target !== void 0) {
      const granted = covered.some((pattern) => {
        try {
          return new URL(target).origin === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The fetch request to ${target} targets an origin outside the grants.`);
    }
    const channelurl = sockettarget(step);
    if (channelurl !== void 0) {
      const channeloriginvalue = channeloriginof(channelurl);
      const granted = covered.some((pattern) => {
        try {
          return new URL(channelurl).origin === new URL(pattern).origin || channeloriginvalue === new URL(pattern).origin;
        } catch {
          return false;
        }
      });
      if (!granted) throw new Error(`The channel to ${channelurl} targets an origin outside the grants.`);
    }
    let lifetime;
    try {
      const options = parseoptions(step);
      for (const key of ["socket", "subscription"]) {
        const value2 = options[key];
        if (value2 && typeof value2 === "object" && !Array.isArray(value2) && typeof value2.lifetime === "number") lifetime = value2.lifetime;
      }
    } catch {
      lifetime = void 0;
    }
    if (lifetime !== void 0 && lifetime > planwindow) throw new Error(`The channel lifetime of ${lifetime} milliseconds exceeds the reviewed plan window of ${planwindow} milliseconds.`);
    return step;
  });
  for (const step of steps) {
    if (step.kind !== "retryaction" && step.kind !== "enterframe" && step.kind !== "looprows") continue;
    const options = parseoptions(step);
    if (typeof options.stepid === "string" && !steps.some((candidate) => candidate.id === options.stepid)) throw new Error("A retry, frame or loop wrapper references an unknown step id.");
  }
  for (const step of steps) {
    if (step.kind !== "submitform" && step.kind !== "retryform") continue;
    const review = submitreviewgranted(steps, step.id);
    if (!review.allowed) throw new Error(review.reason);
  }
  const plan = {
    id: typeof planinput.id === "string" ? planinput.id : crypto.randomUUID(),
    objective: text(planinput.objective, "objective"),
    origin,
    steps: agentid !== void 0 ? steps.map((step) => ({ ...step, agentid })) : steps,
    createdat,
    expiresat,
    state: "pending"
  };
  const idempotencykeys = steps.map((step) => step.idempotencykey).filter((key) => key !== void 0);
  if (new Set(idempotencykeys).size !== idempotencykeys.length) throw new Error("Two steps of one plan collide on the same idempotencykey; the protocol refuses a plan whose replays could deduplicate the wrong step.");
  const resumedfrom = Array.isArray(root.resumedfrom) ? root.resumedfrom.filter((stepid) => typeof stepid === "string" && stepid.trim() !== "") : void 0;
  if (resumedfrom !== void 0 && resumedfrom.length > 0) {
    const known = new Set(steps.map((step) => step.id));
    const unknown = resumedfrom.filter((stepid) => !known.has(stepid));
    if (unknown.length > 0) throw new Error(`The resumedfrom marker names step ids the plan does not carry: ${unknown.join(", ")}.`);
    return { version: protocolversion, plan, resumedfrom, ...agentid !== void 0 ? { agentid } : {} };
  }
  const lockid = typeof root.lockid === "string" && root.lockid.trim() !== "" ? root.lockid : void 0;
  if (lockid !== void 0) return { version: protocolversion, plan, lockid, ...agentid !== void 0 ? { agentid } : {} };
  return { version: protocolversion, plan, ...agentid !== void 0 ? { agentid } : {} };
}
function parseworkflowproposal(value, origin, grants, dryrun) {
  const root = record(value);
  if (root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const covered = grants !== void 0 && grants.length > 0 ? grants : [origin];
  const candidate = record(root.workflow);
  const name = text(candidate.name, "workflow name");
  const version = typeof candidate.version === "number" && Number.isInteger(candidate.version) && candidate.version >= 1 ? candidate.version : void 0;
  if (version === void 0) throw new Error("The workflow version must be a positive integer.");
  const origins = Array.isArray(candidate.origins) ? candidate.origins : [];
  if (origins.length === 0 || !origins.every((workfloworigin) => typeof workfloworigin === "string" && workfloworigin.startsWith("https://"))) throw new Error("The workflow needs at least one granted HTTPS origin.");
  for (const workfloworigin of origins) {
    const granted = covered.some((pattern) => {
      try {
        return new URL(workfloworigin).origin === new URL(pattern).origin;
      } catch {
        return false;
      }
    });
    if (!granted) throw new Error(`The workflow origin ${workfloworigin} stays outside the grants.`);
  }
  const steps = Array.isArray(candidate.steps) ? candidate.steps : [];
  if (steps.length === 0) throw new Error("A workflow proposal needs at least one step or block invocation.");
  const blocks = Array.isArray(candidate.blocks) ? candidate.blocks.flatMap((block) => workflowblockof(block) !== void 0 ? [workflowblockof(block)] : []) : [];
  if (Array.isArray(candidate.blocks) && blocks.length !== candidate.blocks.length) throw new Error("The reviewed block list must carry unique lowercase names, labels and valid child steps.");
  const composed = composeworkflow({
    name,
    version,
    origins,
    steps: steps.map((entry) => {
      const step = workflowstepof(entry);
      if (step) return step;
      const invocation = blockinvocationof(entry);
      if (invocation) return invocation;
      throw new Error("Every workflow entry must be a reviewed step or a block invocation.");
    }),
    blocks,
    now: Date.now(),
    kindallowed: (kind) => {
      try {
        actionrisk(kind);
        return true;
      } catch {
        return false;
      }
    },
    riskof: (kind) => actionrisk(kind)
  });
  const inputs = Array.isArray(candidate.inputs) ? candidate.inputs.flatMap((inputname) => typeof inputname === "string" ? [inputname] : []) : void 0;
  const checked = validateworkflow(composed, { kindallowed: (kind) => {
    try {
      actionrisk(kind);
      return true;
    } catch {
      return false;
    }
  }, ...inputs !== void 0 ? { inputs } : {} });
  if (!checked.allowed) throw new Error(checked.reason ?? "The workflow proposal failed its validation.");
  const control = composed.steps.flatMap((step) => {
    const summary = controlsummary(step);
    return summary !== void 0 ? [{ stepid: step.id, summary }] : [];
  });
  return { version: protocolversion, workflow: composed, ...dryrun === true ? { dryrun: true } : {}, ...control.length > 0 ? { control } : {} };
}
function workflowoutcome(input) {
  const selected = input.stepid !== void 0 ? input.entries.filter((entry) => entry.stepid === input.stepid) : input.entries;
  const steps = selected.map((entry) => ({ stepid: entry.stepid, label: entry.label, state: entry.state, duration: entry.duration, summary: entry.summary, ...entry.block !== void 0 ? { block: entry.block } : {}, ...entry.produced !== void 0 ? { produced: entry.produced } : {}, ...entry.consumed !== void 0 ? { consumed: entry.consumed } : {}, ...entry.checkpoint === true ? { checkpoint: true } : {}, ...entry.details !== void 0 && entry.details.control !== void 0 ? { control: entry.details.control } : {} }));
  return { version: protocolversion, runid: input.run.id, workflowid: input.run.workflowid, state: input.run.state, ...input.run.dryrun === true ? { dryrun: true } : {}, steps };
}
function stepof(kind, candidate, index) {
  return { id: typeof candidate.id === "string" ? candidate.id : `candidate${index + 1}`, kind, summary: typeof candidate.summary === "string" ? candidate.summary : "", risk: "read", ...typeof candidate.options === "string" ? { options: candidate.options } : {} };
}
function channeloriginof(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol === "wss:" ? "https:" : parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}
function requestbody(input) {
  const body = { version: protocolversion, objective: input.objective, session: input.session, observation: input.observation, capabilities: input.capabilities, ...input.runstate !== void 0 ? { runstate: input.runstate } : {}, ...input.queuedepth !== void 0 ? { queuedepth: input.queuedepth } : {}, ...input.tabnamespace !== void 0 ? { tabnamespace: input.tabnamespace } : {}, ...input.provenance !== void 0 ? { provenance: input.provenance } : {}, ...input.agent !== void 0 ? { agent: input.agent } : {}, ...input.budget !== void 0 ? { budget: input.budget } : {}, ...input.lanes !== void 0 ? { lanes: input.lanes } : {}, ...input.load !== void 0 ? { load: input.load } : {}, ...input.lessons !== void 0 ? { lessons: input.lessons } : {}, ...input.predictedurls !== void 0 ? { predictedurls: input.predictedurls } : {}, ...input.correlations !== void 0 ? { correlations: input.correlations } : {}, ...input.vision !== void 0 ? { vision: input.vision } : {}, ...input.diffscore !== void 0 ? { diffscore: input.diffscore } : {} };
  return JSON.stringify(body);
}
function consensusreport(input) {
  return { version: protocolversion, proposal: input.record.proposal, votes: input.record.votes, tally: input.record.tally, quorum: input.record.quorum, outcome: input.record.outcome };
}
function parsespawnrequest(input, limit, agents, spawns) {
  const root = input;
  const parentid = root.parentid?.trim() ?? "";
  if (parentid === "") throw new Error("The spawn request names its parent agentid; every spawned child carries its lineage.");
  const parent = agents.find((record2) => record2.id === parentid);
  if (!parent) throw new Error(`The spawn request names the parent ${parentid} which the fleet registry does not carry; the protocol boundary refuses unknown agents.`);
  const objective = root.objective?.trim() ?? "";
  if (objective === "") throw new Error("The spawn request needs its parent objective in plain language; the child works on what its parent handed over.");
  const depth = root.depth;
  if (depth === void 0 || !Number.isInteger(depth) || depth <= 0) throw new Error("The spawn request carries its depth as a positive whole number of the lineage.");
  if (limit.maxdepth !== void 0 && depth > limit.maxdepth) throw new Error(`The spawn request depth ${depth} exceeds the user configured depth limit ${limit.maxdepth}; the protocol boundary refuses the spawn before any registry write.`);
  const seen = /* @__PURE__ */ new Set([parentid]);
  let lineage = parentid;
  let parentdepth = 0;
  for (; ; ) {
    const spawn = spawns.find((entry) => entry.childid === lineage);
    if (spawn === void 0) break;
    if (seen.has(spawn.parentid)) throw new Error(`The spawn lineage of the parent ${parentid} carries a cycle at ${spawn.parentid}; the protocol boundary refuses a looping lineage.`);
    seen.add(spawn.parentid);
    lineage = spawn.parentid;
    parentdepth += 1;
  }
  if (depth !== parentdepth + 1) throw new Error(`The spawn request depth ${depth} must sit exactly one level under the parent lineage depth ${parentdepth}.`);
  const spec = { parentid, objective, depth };
  if (root.role !== void 0 && root.role.trim() !== "") spec.role = root.role.trim();
  if (root.narrowscope !== void 0) spec.narrowscope = root.narrowscope;
  return { spec, parent };
}
function spawnreply(input) {
  return { version: protocolversion, agentid: input.child.id, name: input.child.name, role: input.child.role, parentid: input.parentid, depth: input.depth };
}
function aggregationreport(input) {
  return { version: protocolversion, subject: input.record.subject, sections: input.record.cells, conflicts: input.record.conflicts, state: input.record.state };
}
function lessonreport(input) {
  return { version: protocolversion, lessons: input.lessons.map((lesson) => ({ id: lesson.id, agentid: lesson.agentid, finding: lesson.finding, origin: lesson.origin, reusecount: lesson.reusecount, ...lesson.lastusedat !== void 0 ? { lastusedat: lesson.lastusedat } : {} })) };
}
function redactionreport(input) {
  return { version: protocolversion, captureid: input.mask.captureid, regions: input.mask.regions.length, reason: input.mask.reason, source: input.mask.source, at: input.mask.at };
}
function capturebundlereport(input) {
  const covered = new Set(input.bundle.provenance);
  if (input.bundle.captures.length > 0 && (input.bundle.provenance.length === 0 || covered.size === 0)) throw new Error(`The capture bundle of the run ${input.bundle.runid} carries ${input.bundle.captures.length} capture${input.bundle.captures.length === 1 ? "" : "s"} with no provlog provenance entries; an export payload without provenance never leaves the device.`);
  if (!input.bundle.masked) throw new Error(`The capture bundle of the run ${input.bundle.runid} assembles only after the redactshot masks ran over its captures; an unmasked capture never exports.`);
  return { version: protocolversion, runid: input.bundle.runid, captures: input.bundle.captures.length, names: input.bundle.names, consoleentries: input.bundle.consoleentries, netentries: input.bundle.netentries, diffs: input.bundle.diffs.length, thumbnails: input.bundle.thumbnails.length, lapses: input.bundle.lapses.length, provenance: input.bundle.provenance.length, masked: input.bundle.masked, at: input.bundle.at };
}
function syncpayloadreport(input) {
  if (!input.encrypted) throw new Error("The sync payload ships plaintext; every payload encrypts with the user passphrase before the transport.");
  if (input.formattag.trim() === "") throw new Error("The sync payload carries no format version tag; an envelope that cannot name its format answers no decoder.");
  if (input.classes.length === 0) throw new Error("The sync payload names the data classes it carries; a payload without classes answers no consent.");
  return { version: protocolversion, classes: input.classes, payloadhash: input.payloadhash, formattag: input.formattag, encrypted: true, syncedat: input.syncedat };
}
function exportallreport(input) {
  return { version: protocolversion, runs: input.bundle.runs.length, memory: input.bundle.memory.length, captures: input.bundle.captures.length, settings: input.bundle.settings, provenance: input.bundle.provenance.length, records: input.bundle.records, bytes: input.bundle.bytes, at: input.bundle.at };
}
function quarantineverdictreport(input) {
  if (input.entry.status === "released" && input.entry.scan !== "clean") throw new Error("Only a clean scanner verdict releases a quarantined file; a held or flagged file never opens.");
  return { version: protocolversion, id: input.entry.id, path: input.entry.path, reason: input.entry.reason, scan: input.entry.scan, status: input.entry.status, released: input.entry.status === "released", at: input.entry.at, updatedat: input.entry.updatedat };
}
function syncconsentreport(input) {
  const seen = /* @__PURE__ */ new Set();
  for (const entry of input.consent) {
    const key = entry.dataclass.toLowerCase();
    if (key.trim() === "") throw new Error("The sync consent names its data class; an unnamed class answers no consent.");
    if (seen.has(key)) throw new Error(`The sync consent carries the data class ${entry.dataclass} twice; one class answers one consent stamp.`);
    seen.add(key);
  }
  return { version: protocolversion, consent: input.consent, count: input.consent.length };
}
function outboundpayloadcheck(input) {
  const keys = Object.keys(input.payload).map((key) => key.trim().toLowerCase());
  const carried = input.localfields.map((field) => field.trim().toLowerCase()).filter((field) => field !== "" && keys.includes(field));
  if (carried.length > 0) throw new Error(`The outbound payload carries the local rule field${carried.length === 1 ? "" : "s"} ${carried.join(", ")}; a field marked local never leaves the device.`);
  return { ok: true, reason: "The outbound payload carries no local rule field; every field marked local stayed on the device." };
}
function costledgerreport(input) {
  return { version: protocolversion, entries: input.entries.map((entry) => ({ agentid: entry.agentid, ...entry.runid !== void 0 ? { runid: entry.runid } : {}, units: entry.units, description: entry.description, at: entry.at })), split: input.split };
}
function predictionreport(input) {
  return { version: protocolversion, predictedurls: input.plan.predictedurls, createdat: input.plan.createdat };
}
function outcomeresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, outcome: input.outcome, ...input.runid !== void 0 ? { runid: input.runid } : {}, ...input.runstate !== void 0 ? { runstate: input.runstate } : {}, ...input.resolvedtarget ? { resolvedtarget: input.resolvedtarget } : {}, ...input.capture ? { capture: input.capture } : {}, ...input.media ? { media: input.media } : {}, ...input.transport ? { transport: input.transport } : {}, ...input.network ? { network: input.network } : {}, ...input.control ? { control: input.control } : {}, ...input.timeline ? { timeline: input.timeline } : {}, ...input.cdp ? { cdp: input.cdp } : {}, ...input.profile ? { profile: input.profile } : {}, ...input.emulation ? { emulation: input.emulation } : {}, ...input.session ? { session: input.session } : {}, ...input.workflow ? { workflow: { runid: input.workflow.runid, state: input.workflow.state, ...input.workflow.dryrun === true ? { dryrun: true } : {}, produced: input.workflow.produced, consumed: input.workflow.consumed, ...input.workflow.timeout !== void 0 ? { timeout: input.workflow.timeout } : {}, ...input.workflow.retry !== void 0 ? { retry: input.workflow.retry } : {} } } : {}, ...input.trigger ? { trigger: { ruleid: input.trigger.ruleid, kind: input.trigger.kind, enabled: input.trigger.enabled, ...input.trigger.nextfireat !== void 0 ? { nextfireat: input.trigger.nextfireat } : {} } } : {}, ...input.tool ? { tool: { clientid: input.tool.clientid, tool: input.tool.tool, origin: input.tool.origin, ok: input.tool.ok, ...input.tool.code !== void 0 ? { code: input.tool.code } : {} } } : {}, ...input.safety ? { safety: input.safety } : {}, ...input.ratelimitwait ? { ratelimitwait: input.ratelimitwait } : {}, ...input.streamcursor ? { streamcursor: input.streamcursor } : {}, ...input.dedupe ? { dedupe: input.dedupe } : {}, ...input.sampledpreview ? { sampledpreview: input.sampledpreview } : {}, ...input.correlation ? { correlation: input.correlation } : {}, ...input.cachehit ? { cachehit: input.cachehit } : {}, ...input.ocr ? { ocr: input.ocr } : {}, ...input.vision ? { vision: input.vision } : {}, ...input.grounding ? { grounding: input.grounding } : {}, ...input.beforeafter ? { beforeafter: input.beforeafter } : {}, ...input.diff ? { diff: input.diff } : {} });
}
function mapresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, map: input.map });
}
function heldkeysreport(input) {
  return { version: protocolversion, tabid: input.tabid, heldkeys: input.holds };
}
function observationresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, observation: input.observation });
}
function eventresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, events: input.events });
}
function diffresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, diff: input.diff });
}
function signalsreport(input) {
  const signals = input.signals;
  return {
    version: protocolversion,
    ...signals && signals.language !== void 0 ? { language: signals.language } : {},
    ...signals && signals.template !== void 0 ? { template: signals.template } : {},
    ...signals && signals.scrolllocked !== void 0 ? { scrolllocked: signals.scrolllocked } : {},
    ...signals && signals.banner !== void 0 ? { banner: signals.banner } : {}
  };
}
function selectorresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, candidates: input.candidates });
}
function navstateresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, navstate: input.navstate });
}
function trailreport(input) {
  return { version: protocolversion, ...input.sessionid ? { sessionid: input.sessionid } : {}, trail: input.trail };
}
function safetyresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, verdicts: input.verdicts });
}
function tabreportresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}
function layoutreport(input) {
  return { version: protocolversion, layouts: input.layouts };
}
function formreportresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}
function errorreportresponse(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}
function wizardreport(input) {
  return { version: protocolversion, ...input.sessionid ? { sessionid: input.sessionid } : {}, wizards: input.wizards, picks: input.picks };
}
function datasetresponse(input) {
  const sample = Math.max(0, Math.floor(input.sample ?? 10));
  const payload = { ...input.dataset, rows: input.dataset.rows.slice(0, sample), totalrows: input.dataset.rows.length };
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, dataset: payload });
}
function extractionreport(input) {
  return { version: protocolversion, sessions: input.sessions };
}
function provenancereport(input) {
  return { version: protocolversion, records: input.records };
}
function transformgrammar(rules) {
  return JSON.stringify({ rules: rules.map((rule) => ({ expression: rule.expression, sources: rule.sources, target: rule.target })) });
}
function downloadreport(input) {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, downloads: input.downloads });
}
function netlogreport(input) {
  return { version: protocolversion, records: input.records };
}
function quarantinereport(input) {
  return { version: protocolversion, entries: input.entries };
}
function capturereport(input) {
  return { version: protocolversion, records: input.records, pairs: input.pairs };
}
function mediareport(input) {
  return { version: protocolversion, records: input.records, images: input.images };
}
function callsreport(input) {
  const calls = input.calls.map((call) => {
    const { body, ...metadata } = call;
    void body;
    return metadata;
  });
  return { version: protocolversion, calls };
}
function exchangesreport(input) {
  return { version: protocolversion, exchanges: input.exchanges, channels: input.channels, subscriptions: input.subscriptions, apimap: input.apimap };
}
function authreport(input) {
  const tokens = input.tokens.map((token) => {
    const { accessstorageid, refreshstorageid, ...metadata } = token;
    void accessstorageid;
    void refreshstorageid;
    return metadata;
  });
  return { version: protocolversion, tokens };
}
function controlreport(input) {
  const mocks = input.mocks.map((spec) => {
    const { body, ...metadata } = spec;
    void body;
    return metadata;
  });
  return { version: protocolversion, blocks: input.blocks, mocks, rewrites: input.rewrites, cookies: input.cookies, proxies: input.proxies, ratelimits: input.ratelimits };
}
function timelinereport(input) {
  return { version: protocolversion, entries: input.entries, errors: input.errors, rejections: input.rejections, longtasks: input.longtasks, levelcounts: input.levelcounts };
}
function consolediffreport(input) {
  return { version: protocolversion, diff: input.diff };
}
function cdpreport(input) {
  const overrides = input.overrides.map((spec) => {
    const { source, ...metadata } = spec;
    void source;
    return metadata;
  });
  const grants = input.grants.map((grant) => {
    const { prompt, ...metadata } = grant;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, sessions: input.sessions, commands: input.commands, events: input.events, breakpoints: input.breakpoints, pauses: input.pauses, watches: input.watches, overrides, grants };
}
function profilereport(input) {
  const consents = input.consents.map((consent) => {
    const { prompt, ...metadata } = consent;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, flows: input.flows, heaps: input.heaps, samples: input.samples, trends: input.trends, profiles: input.profiles, shifts: input.shifts, traces: input.traces, sourcemaps: input.sourcemaps, consents };
}
function emulationreport(input) {
  const consents = input.consents.map((consent) => {
    const { prompt, ...metadata } = consent;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, ...input.state !== void 0 ? { state: input.state } : {}, layers: input.state?.layers ?? [], devices: input.devices, networks: input.networks, locations: input.locations, agents: input.agents, blackbox: input.blackbox, permissions: input.permissions, consents };
}
function sessionreport(input) {
  return { version: protocolversion, records: input.records, events: input.events, folders: input.folders, diffs: input.diffs, ...input.auto !== void 0 ? { auto: input.auto } : {}, ...input.crashed === true ? { crashed: true } : {} };
}
function workflowreport(input) {
  return { version: protocolversion, workflows: input.workflows, runs: input.runs, templates: input.templates, log: input.log ?? [], scopes: input.scopes ?? [], provenance: input.provenance ?? [], control: input.control ?? [] };
}
function triggerlist(input) {
  const names = new Map(input.workflows.map((record2) => [record2.id, record2.name]));
  const rules = input.rules.map((rule) => {
    const workflowname = names.get(rule.workflowid);
    return {
      id: rule.id,
      kind: rule.kind,
      workflowid: rule.workflowid,
      ...workflowname !== void 0 ? { workflowname } : {},
      label: rule.label,
      enabled: rule.state.enabled,
      ...rule.state.pausedat !== void 0 ? { paused: true } : {},
      cooldown: rule.state.cooldown,
      ...rule.state.lastfireat !== void 0 ? { lastfireat: rule.state.lastfireat } : {},
      ...rule.state.nextfireat !== void 0 ? { nextfireat: rule.state.nextfireat } : {},
      fires: rule.stats.fires,
      launches: rule.stats.launches,
      suppressions: rule.stats.suppressions,
      summary: triggersummaryof(rule)
    };
  });
  return { version: protocolversion, rules, queued: (input.queue ?? []).length };
}
function triggersummaryof(rule) {
  const summary = { kind: rule.kind, workflowid: rule.workflowid };
  if (rule.origins !== void 0) summary.origins = rule.origins;
  if (rule.pattern !== void 0) summary.pattern = rule.pattern;
  if (rule.title !== void 0) summary.title = rule.title;
  if (rule.command !== void 0) summary.command = rule.command;
  if (rule.key !== void 0) summary.key = rule.key;
  if (rule.cron !== void 0) summary.cron = rule.cron;
  if (rule.timezone !== void 0) summary.timezone = rule.timezone;
  if (rule.period !== void 0) summary.period = rule.period;
  if (rule.jitter !== void 0) summary.jitter = rule.jitter;
  if (rule.urls !== void 0) summary.urls = rule.urls;
  if (rule.events !== void 0) summary.events = rule.events;
  if (rule.schema !== void 0) summary.fields = rule.schema.length;
  return summary;
}
function triggerfired(input) {
  return { version: protocolversion, triggerfired: { fireid: input.fire.id, ruleid: input.fire.ruleid, workflowid: input.workflowid, at: input.fire.at, cause: input.fire.cause, ...input.fire.url !== void 0 ? { url: input.fire.url } : {}, ...input.fire.title !== void 0 ? { title: input.fire.title } : {}, ...input.runid !== void 0 ? { runid: input.runid } : {} } };
}
function manualrunpreview(input) {
  return { version: protocolversion, manualrun: input.preview, ...input.workflowname !== void 0 ? { workflowname: input.workflowname } : {} };
}
function toolcallframe(input) {
  return { jsonrpc: "2.0", id: input.id, method: "tools/call", params: { ...input.params ?? {}, name: input.name } };
}
function toolresultframe(input) {
  return { jsonrpc: "2.0", id: input.id, ...input.error !== void 0 ? { error: input.error } : { result: input.result } };
}
var workflowfileversion = 1;
function editorstate(input) {
  const editor = { versions: input.versions, diffs: input.diffs ?? [], history: input.history, breakpoints: input.breakpoints ?? [], overrides: input.overrides, imports: input.imports, backgroundruns: input.backgroundruns ?? {}, watchdog: { ...input.watchdog.config !== void 0 ? { config: input.watchdog.config } : {}, events: input.watchdog.events } };
  return { version: protocolversion, editor, ...input.model !== void 0 ? { model: input.model } : {} };
}
function runhistoryquery(value) {
  if (value === void 0 || value === null) return {};
  const candidate = record(value);
  const query = {};
  if (candidate.workflowid !== void 0) {
    if (typeof candidate.workflowid !== "string" || !candidate.workflowid.trim()) throw new Error("The run history workflow filter must be a non-empty string.");
    query.workflowid = candidate.workflowid;
  }
  if (candidate.outcome !== void 0) {
    if (typeof candidate.outcome !== "string" || !candidate.outcome.trim()) throw new Error("The run history outcome filter must be a non-empty string.");
    query.outcome = candidate.outcome;
  }
  if (candidate.since !== void 0) {
    if (typeof candidate.since !== "number" || !Number.isFinite(candidate.since)) throw new Error("The run history time floor must be a finite timestamp.");
    query.since = candidate.since;
  }
  if (candidate.limit !== void 0) {
    if (typeof candidate.limit !== "number" || !Number.isInteger(candidate.limit) || candidate.limit < 1) throw new Error("The run history entry count must be a positive integer with no code ceiling.");
    query.limit = candidate.limit;
  }
  return query;
}
function runhistoryreport(input) {
  return { version: protocolversion, entries: input.entries, query: input.query ?? {} };
}
function httpstreamreport(input) {
  const open = input.channels.filter((channel) => channel.closedat === void 0 && input.now - channel.lastbeatat < (input.stream.idlewindowms ?? defaultidlewindowms));
  return { version: protocolversion, endpoint: input.stream.endpoint, streampath: input.stream.streampath, heartbeatms: input.stream.heartbeatms ?? defaultheartbeatms, idlewindowms: input.stream.idlewindowms ?? defaultidlewindowms, channelsopen: open.length, channelsdead: input.channels.length - open.length };
}
function pairingframes(input) {
  const request = { jsonrpc: "2.0", id: input.id, method: "pairing", params: { nonce: input.challenge.nonce, method: input.challenge.method, ...input.answer !== void 0 ? { answer: input.answer } : {} } };
  const response = input.outcome === "verified" ? { jsonrpc: "2.0", id: input.id, result: { paired: true, method: input.challenge.method } } : input.outcome === "issued" ? { jsonrpc: "2.0", id: input.id, result: { challenge: input.challenge.nonce, method: input.challenge.method, expiresat: input.challenge.expiresat } } : { jsonrpc: "2.0", id: input.id, error: rpcerrorof("consentrefused", authrefusedmessage) };
  return { request, response };
}
function tokenreport(tokens, now) {
  return { version: protocolversion, tokens: tokens.map((token) => ({ id: token.id, clientid: token.clientid, scopes: token.scopes, issuedat: token.issuedat, expiresat: token.expiresat, ...token.revokedat !== void 0 ? { revokedat: token.revokedat } : { msremaining: Math.max(0, token.expiresat - now) } })) };
}
function approvalframes(input) {
  const raise = { jsonrpc: "2.0", id: input.id, method: "approval", params: { approvalid: input.request.id, clientid: input.request.clientid, tool: input.request.tool, reason: input.request.reason, arguments: JSON.stringify(redactparams(input.request.params, input.request.secretfields ?? [])), ...input.request.timeoutat !== void 0 ? { timeoutat: input.request.timeoutat } : {} } };
  const decision = input.request.state === "pending" ? { jsonrpc: "2.0", id: input.id, result: { approvalid: input.request.id, state: "pending" } } : input.request.state === "approved" ? { jsonrpc: "2.0", id: input.id, result: { approvalid: input.request.id, state: "approved", ...input.identity !== void 0 ? { client: input.identity.displayname } : {} } } : { jsonrpc: "2.0", id: input.id, error: rpcerrorof("consentrefused", input.request.state === "refused" ? `The approval gate for ${input.request.tool} was refused and the call never executes.` : `The approval gate for ${input.request.tool} expired and the call refuses by default.`) };
  return { raise, decision };
}
function tlsreport(tls) {
  return { version: protocolversion, mode: tls.mode, certificaterequired: tls.mode === "required" || tls.certificatefingerprint !== void 0, verified: tls.verifiedat !== void 0 };
}
function allowlistreport(entries) {
  return { version: protocolversion, entries: entries.map((entry) => ({ fingerprint: entry.fingerprint, displayname: entry.displayname, namespaces: entry.namespaces, grantedat: entry.grantedat, grants: entry.history.length })) };
}
function heartbeatreport(input) {
  const open = input.channels.filter((channel) => channel.closedat === void 0 && input.now - channel.lastbeatat < (input.idlewindow ?? defaultidlewindowms));
  return { version: protocolversion, beats: input.channels.filter((channel) => channel.lastbeatat > channel.openedat).length, open: open.length, dead: input.channels.length - open.length };
}
function subscriptionframes(input) {
  const subscribe = { jsonrpc: "2.0", id: input.id, method: "events/subscribe", params: { subscriptionid: input.subscription.id, kinds: input.subscription.kinds, ...input.subscription.origin !== void 0 ? { origin: input.subscription.origin } : {}, ...input.subscription.tool !== void 0 ? { tool: input.subscription.tool } : {} } };
  const unsubscribe = { jsonrpc: "2.0", id: input.id, method: "events/unsubscribe", params: { subscriptionid: input.subscription.id } };
  return { subscribe, unsubscribe };
}
function eventnotification(input) {
  return { jsonrpc: "2.0", method: "events/notify", params: { subscriptionid: input.subscriptionid, kind: input.kind, ...input.origin !== void 0 ? { origin: input.origin } : {}, ...input.tool !== void 0 ? { tool: input.tool } : {}, ...input.payload !== void 0 ? { payload: input.payload } : {}, at: input.now } };
}
function resourcedeltareport(input) {
  return { version: protocolversion, watchid: input.watchid, clientid: input.clientid, resource: input.resource, delta: input.delta, at: input.now };
}
function samplingframes(input) {
  const request = { jsonrpc: "2.0", id: input.id, method: "sampling/request", params: { samplingid: input.request.id, prompt: input.request.prompt, ...input.request.system !== void 0 ? { system: input.request.system } : {}, ...input.request.pagecontent !== void 0 ? { pagecontent: input.request.pagecontent } : {}, ...input.request.maxtokens !== void 0 ? { maxtokens: input.request.maxtokens } : {} } };
  const answer = input.request.state === "answered" ? { jsonrpc: "2.0", id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, answer: input.request.answer ?? "" } } : input.request.state === "refused" ? { jsonrpc: "2.0", id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, refused: true } } : { jsonrpc: "2.0", id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, state: "pending" } };
  return { request, answer };
}
function promptreport(input) {
  return { version: protocolversion, prompts: input.prompts.map((prompt) => ({ name: prompt.name, description: prompt.description, arguments: prompt.arguments, template: prompt.template })) };
}
function promptcallframe(input) {
  return { jsonrpc: "2.0", id: input.id, method: "prompts/call", params: { name: input.name, arguments: input.args } };
}
function streamchunkframe(chunk) {
  return { jsonrpc: "2.0", method: "calls/stream", params: { callid: chunk.callid, seq: chunk.seq, content: chunk.content, done: chunk.done, at: chunk.at } };
}
function progressnoticeframe(notice) {
  return { jsonrpc: "2.0", method: "calls/progress", params: { callid: notice.callid, ...notice.percent !== void 0 ? { percent: notice.percent } : {}, message: notice.message, cancellable: notice.cancellable, at: notice.at } };
}
function cancelframes(input) {
  const cancel = { jsonrpc: "2.0", id: input.id, method: "calls/cancel", params: { callid: input.frame.callid, ...input.frame.reason !== void 0 ? { reason: input.frame.reason } : {} } };
  const cancelled = { jsonrpc: "2.0", id: input.id, result: { cancelled: true, callid: input.frame.callid, ...input.frame.reason !== void 0 ? { reason: input.frame.reason } : {}, ...input.partial !== void 0 ? { partial: input.partial } : {} } };
  return { cancel, cancelled };
}
function structurederrorreport(input) {
  return { version: protocolversion, code: input.error.code, message: input.error.message, retryhint: input.error.retryhint, ...input.error.retryafter !== void 0 ? { retryafter: input.error.retryafter } : {}, ...input.usage !== void 0 ? { usage: input.usage } : {} };
}
function idempotencyreplayframe(input) {
  return { jsonrpc: "2.0", id: input.id, result: { replayed: true, idempotencykey: input.key, originalat: input.originalat, result: input.result } };
}
function batchreport(input) {
  return { version: protocolversion, batchid: input.batch.id, clientid: input.batch.clientid, state: input.batch.state, stoponerror: input.batch.stoponerror, done: input.batch.outcomes.length, total: input.batch.calls.length, outcomes: input.batch.outcomes };
}
function ratelimitreport(input) {
  return { version: protocolversion, limits: input.limits.map((limit) => ({ clientid: limit.clientid, windowms: limit.windowms, ...limit.budget !== void 0 ? { budget: limit.budget } : {}, used: limit.used, unbounded: limit.budget === void 0, resetat: limit.windowstartedat + limit.windowms })) };
}
function calllogreport(input) {
  return { version: protocolversion, calls: input.calls, filters: input.filters ?? {} };
}
function inflightreport(input) {
  return { version: protocolversion, inflight: input.contexts.filter((context) => context.state === "inflight").map((context) => ({ callid: context.callid, clientid: context.clientid, tool: context.tool, startedat: context.startedat, msopen: input.now - context.startedat, chunks: context.chunks, ...context.dryrun === true ? { dryrun: true } : {}, ...context.batchid !== void 0 ? { batchid: context.batchid } : {}, ...context.idempotencykey !== void 0 ? { idempotencykey: context.idempotencykey } : {} })) };
}
function dryrunreport(dryrun) {
  return { version: protocolversion, callid: dryrun.callid, tool: dryrun.tool, argsvalid: dryrun.argsvalid, consentok: dryrun.consentok, findings: dryrun.findings, executed: dryrun.executed, mutations: dryrun.mutations };
}
function mockreport(mocks) {
  return { version: protocolversion, mocks: mocks.map((mock) => ({ tool: mock.tool, content: mock.result.content, testcontext: mock.testcontext, createdat: mock.createdat })) };
}
function idempotencyreport(records, now) {
  return { version: protocolversion, records: records.map((record2) => ({ key: record2.key, clientid: record2.clientid, tool: record2.tool, createdat: record2.createdat, expiresat: record2.expiresat, live: now < record2.expiresat })) };
}
function modelproposal(input) {
  return { version: protocolversion, modelproposal: { draftid: input.draft.id, goal: input.draft.goal, steps: input.draft.steps.map((step) => ({ id: step.id, kind: step.kind, ...step.target !== void 0 ? { target: step.target } : {}, ...step.value !== void 0 ? { value: step.value } : {}, summary: step.summary, ...step.freshreview === true ? { freshreview: true } : {} })), openquestions: input.draft.openquestions, lintfindings: input.draft.lintfindings, providerid: input.draft.providerid, model: input.draft.model, state: input.draft.state, createdat: input.draft.createdat } };
}
function modeloutcome(input) {
  return { version: protocolversion, modeloutcome: { ...input.runid !== void 0 && input.runid.trim() !== "" ? { runid: input.runid } : {}, usage: input.totals, guards: input.outputs.map((output) => ({ verdict: output.verdict, ...output.reason !== void 0 ? { reason: output.reason } : {}, attempts: output.attempts })) } };
}
function swarmstatereport(state) {
  return {
    version: protocolversion,
    swarm: {
      agents: state.agents.map((agent) => ({ id: agent.id, name: agent.name, role: agent.role, state: agent.state, depth: agent.depth, ...agent.tabid !== void 0 ? { tabid: agent.tabid } : {}, ...agent.parentid !== void 0 ? { parentid: agent.parentid } : {}, ...agent.heartbeatat !== void 0 ? { heartbeatat: agent.heartbeatat } : {} })),
      queue: { lanes: state.queue.lanes, priorities: state.queue.priorities, completionpolicy: state.queue.completionpolicy, items: state.queue.items.map((item) => ({ id: item.id, lane: item.lane, priority: item.priority, payload: item.payload, state: item.state, enqueuedat: item.enqueuedat })), claims: state.queue.claims },
      mailboxes: state.mailboxes.map((mailbox) => ({ agentid: mailbox.agentid, unread: mailbox.unread, inbox: mailbox.inbox.length, outbox: mailbox.outbox.length })),
      killswitch: { engaged: state.killswitch.engaged, ...state.killswitch.engagedat !== void 0 ? { engagedat: state.killswitch.engagedat } : {}, ...state.killswitch.reason !== void 0 ? { reason: state.killswitch.reason } : {} }
    }
  };
}
function agenteventframe(event) {
  return { jsonrpc: "2.0", method: "agents/notify", params: { eventid: event.id, kind: event.kind, ...event.agentid !== void 0 ? { agentid: event.agentid } : {}, ...event.taskid !== void 0 ? { taskid: event.taskid } : {}, summary: event.summary, at: event.at } };
}
function boardstatesnapshot(board) {
  return {
    version: protocolversion,
    board: {
      id: board.id,
      builtat: board.builtat,
      lanes: board.lanes.map((lane) => ({ agentid: lane.agentid, name: lane.name, role: lane.role, state: lane.state, lane: lane.lane, ...lane.currenttask !== void 0 ? { currenttask: lane.currenttask } : {}, milestones: lane.milestones.map((milestone) => ({ label: milestone.label, done: milestone.done, ...milestone.at !== void 0 ? { at: milestone.at } : {} })) }))
    }
  };
}
function handoffframe(record2) {
  return {
    jsonrpc: "2.0",
    method: "agents/handoff",
    params: {
      id: record2.id,
      from: record2.fromagentid,
      to: record2.toagentid,
      ...record2.tabid !== void 0 ? { tabid: record2.tabid } : {},
      taskstate: record2.taskstate,
      state: record2.state,
      ...record2.transferredat !== void 0 ? { transferredat: record2.transferredat } : {},
      ...record2.resumedat !== void 0 ? { resumedat: record2.resumedat } : {}
    }
  };
}
function reviewframe(input) {
  return {
    jsonrpc: "2.0",
    method: "agents/review",
    params: {
      id: input.request.id,
      from: input.request.fromagentid,
      to: input.request.toagentid,
      subject: input.request.subject,
      state: input.request.state,
      ...input.request.ackedat !== void 0 ? { ackedat: input.request.ackedat } : {},
      ...input.request.answeredat !== void 0 ? { answeredat: input.request.answeredat } : {},
      ...input.review !== void 0 ? { verdict: input.review.verdict, issues: input.review.issues, requiredchanges: input.review.requiredchanges } : {}
    }
  };
}
function environmentgrammar() {
  return {
    version: protocolversion,
    kinds: environmentrequirements(),
    notes: [
      "The evaluate kind runs inside the isolated world only where page globals stay unreachable from step code.",
      "A step whose reviewed options carry untrusted markup renders inside the sandboxframe only, with scripts and event handlers stripped before the render.",
      "The parse heavy read kinds offload into the offscreen worker pool only under the user granted offscreen capability and the parse offload toggle, with an inline fallback inside the page.",
      "Every environment executes only reviewed steps against granted origins; the session environment grant list narrows the steps of one session and no environment ever bypasses the human review."
    ]
  };
}
function environmentreport(input) {
  return {
    version: protocolversion,
    environments: Object.entries(input.environments).map(([stepid, environment]) => ({ stepid, environment })),
    turnarounds: Object.entries(input.turnarounds ?? {}).map(([stepid, milliseconds]) => ({ stepid, milliseconds })),
    offscreen: input.offscreen ?? [],
    workers: input.workers ?? 0,
    ...input.keepalive !== void 0 ? { keepalive: input.keepalive } : {}
  };
}
function consentmodel() {
  return {
    version: protocolversion,
    posture: "denydefault",
    sensitiveclasses: ["payment", "credential", "delete", "publish"],
    maskshapes: [...defaultmaskshapes],
    notes: [
      "The denydefault posture refuses every origin the user never granted; the per origin automation allowlist holds one exact origin per entry with no wildcard expansion and the active tab grant counts as exactly one explicit single origin grant.",
      "The per site originprofiles grant and deny single action kinds; a denied kind never runs on that origin and a granted kind still routes its sensitive classes through the fresh consent prompts.",
      "Every consent window scopes to one session and one origin, binds the duration the user chose and names its boundary; no grant ever defaults to unlimited, and a window past its boundary suspends the run mid step until a new explicit prompt renews it.",
      "The revokerun is a terminal session event: the pending step and every queued step halt without executing and the immutable log records the user action.",
      "The immutable run log appends only: every entry chains through its loghash to the hash of its predecessor, the completion seal writes the final hash, and the read path verifies the whole chain before serving a single entry.",
      "maskinputs keeps typed values, form values and stored values out of every record behind the documented password, token, card and secret shapes the user extends; the observation schema keeps its field shapes while the values carry the redaction marker."
    ]
  };
}
function securityreport(input) {
  return { version: protocolversion, posture: "denydefault", allowlist: input.allowlist, profiles: input.profiles, windows: input.windows, consents: input.consents, revocations: input.revocations, maskrules: input.maskrules, chain: input.chain };
}
function logchainreport(input) {
  return { version: protocolversion, runid: input.runid, valid: input.valid, entries: input.entries, ...input.brokenat !== void 0 ? { brokenat: input.brokenat } : {}, reason: input.reason, ...input.sealhash !== void 0 ? { sealhash: input.sealhash } : {}, ...input.sealedat !== void 0 ? { sealedat: input.sealedat } : {} };
}
function transparencyreport(input) {
  return { version: protocolversion, posture: "denydefault", grants: input.grants, windows: input.windows, connectallow: input.connectallow, permdiffs: input.permdiffs, safedefaults: input.safedefaults, vault: input.vault };
}
function surfacesnapshot(input) {
  return { version: protocolversion, surface: input.surface, palette: input.palette, timeline: input.timeline, logstream: input.logstream, plancards: input.plancards, ...input.onboarding !== void 0 ? { onboarding: input.onboarding } : {} };
}
function interfaceviews(input) {
  return { version: protocolversion, ...input.datagrid !== void 0 ? { datagrid: input.datagrid } : {}, exportmenu: input.exportmenu, badge: input.badge, recenttray: input.recenttray, toasts: input.toasts, appearance: input.appearance };
}
function ecosystemviews(input) {
  return { version: protocolversion, library: input.library, installed: input.installed, syncbridge: input.syncbridge, attention: input.attention, backgroundruns: input.backgroundruns, ...input.replay !== void 0 ? { replay: input.replay } : {}, ...input.compare !== void 0 ? { compare: input.compare } : {} };
}
function perfreport(input) {
  if (input.runid.trim() === "") throw new Error("The perf report needs its run id.");
  return { version: protocolversion, runid: input.runid, summary: input.summary, chart: [...input.chart], selcache: input.selcache, queue: input.queue, ...input.chunk !== void 0 ? { chunk: input.chunk } : {} };
}
function schedulereport(input) {
  if (input.backpressure.runid.trim() === "") throw new Error("The schedule report needs its run id.");
  return { version: protocolversion, backpressure: input.backpressure, lanes: input.lanes.map((lane) => ({ ...lane })), alerts: input.alerts.map((alert) => ({ ...alert })), timeouts: input.timeouts.map((timeout) => ({ ...timeout })), ...input.startup !== void 0 ? { startup: input.startup } : {}, ...input.selectors !== void 0 ? { selectors: input.selectors.map((stats) => ({ ...stats })) } : {} };
}
function rollbacksummarycheck(summary) {
  if (summary.trim() === "") return { ok: false, reason: "The rollback step summary is empty; a compensation the user cannot read never runs." };
  if (summary !== summary.trim()) return { ok: false, reason: "The rollback step summary carries untrimmed padding; a compensation the user cannot read never runs." };
  if (/[\u0000-\u001f\u007f]/.test(summary)) return { ok: false, reason: "The rollback step summary carries control characters; a compensation the user cannot read never runs." };
  return { ok: true, reason: "The rollback step summary stays plain human readable language." };
}
function runtimelinereport(input) {
  return { version: protocolversion, runid: input.runid, events: input.events, buckets: input.buckets.map((bucket) => ({ phase: bucket.phase, count: bucket.events.length })) };
}
function memoryitemframe(value) {
  const root = record(value);
  if (root.version !== void 0 && root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const key = text(root.key, "memory item key");
  const provenance = record(root.provenance);
  const origin = text(provenance.origin, "memory item provenance origin");
  const runid = text(provenance.runid, "memory item provenance runid");
  const stepid = text(provenance.stepid, "memory item provenance stepid");
  if (typeof provenance.capturedat !== "number" || !Number.isFinite(provenance.capturedat)) throw new Error("The memory item provenance needs its capturedat timestamp; a payload without provenance never stores.");
  return {
    key,
    value: root.value,
    provenance: { origin, runid, stepid, capturedat: provenance.capturedat },
    ...typeof root.memoryclass === "string" && root.memoryclass.trim() !== "" ? { memoryclass: root.memoryclass } : {},
    ...typeof root.expiresat === "number" && Number.isFinite(root.expiresat) ? { expiresat: root.expiresat } : {},
    ...root.encrypted === true ? { encrypted: true } : {}
  };
}
function auditexportreport(input) {
  return { version: protocolversion, record: input.record };
}
function urlvisitscheck(input) {
  const covered = /* @__PURE__ */ new Set([input.origin, ...input.grants ?? []]);
  const refused = input.visits.filter((visit) => {
    try {
      return !covered.has(new URL(visit.url).origin);
    } catch {
      return true;
    }
  }).map((visit) => visit.url);
  return { ok: refused.length === 0, refused };
}
function bridgepayloadreport(input) {
  const minimized = bridgepayload(input.kind, input.payload, input.pageconsent);
  if (minimized.held.length > 0) throw new Error(`The bridge payload holds the page content key${minimized.held.length === 1 ? "" : "s"} ${minimized.held.join(", ")}; page content never crosses the bridge without the explicit consent flag.`);
  return { version: servercontractversion, kind: input.kind, payload: minimized.payload, held: [] };
}
function gatewaycallreport(input) {
  if (input.requestid.trim() === "") throw new Error("The gateway call report needs its request id; every provider call correlates through it.");
  if (input.providerid.trim() === "") throw new Error("The gateway call report needs its provider id.");
  if (input.model.trim() === "") throw new Error("The gateway call report needs its model name.");
  return { version: protocolversion, requestid: input.requestid, providerid: input.providerid, kind: input.kind, model: input.model, tokens: input.tokens, cost: input.cost, at: input.at };
}
var frozenmessagecatalog = [
  { type: "proposalrequest", family: "proposal", schema: "schemas/proposal.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "proposalresponse", family: "proposal", schema: "schemas/proposal.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "plan", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "planstep", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "workflowproposal", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseworkflowproposal" },
  { type: "workflowoutcome", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "workflowoutcome" },
  { type: "sessionstart", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionpause", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionresume", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionrecord", family: "session", schema: "schemas/session.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "observation", family: "observation", schema: "schemas/observation.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "observationresponse", family: "observation", schema: "schemas/observation.schema.json", envelope: "protocolversion", carrier: "observationresponse" },
  { type: "responseenvelope", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "protocolversion", carrier: "outcomeresponse" },
  { type: "jsonrpcresponse", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "jsonrpcframe", carrier: "handleframe" },
  { type: "serverenvelope", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "serverenvelope", carrier: "composeenvelope" },
  { type: "capabilityreport", family: "capability", schema: "schemas/capability.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "auditevent", family: "audit", schema: "schemas/audit.schema.json", envelope: "protocolversion", carrier: "auditexportreport" },
  { type: "auditexport", family: "audit", schema: "schemas/audit.schema.json", envelope: "protocolversion", carrier: "auditexportreport" },
  { type: "memoryitem", family: "memory", schema: "schemas/memory.schema.json", envelope: "protocolversion", carrier: "memoryitemframe" },
  { type: "planprogress", family: "progress", schema: "schemas/progress.schema.json", envelope: "runtime", carrier: "recordstep" },
  { type: "stepoutcome", family: "progress", schema: "schemas/progress.schema.json", envelope: "protocolversion", carrier: "outcomeresponse" },
  { type: "tooldef", family: "tool", schema: "schemas/tool.schema.json", envelope: "jsonrpcframe", carrier: "listtools" },
  { type: "toolcall", family: "tool", schema: "schemas/tool.schema.json", envelope: "jsonrpcframe", carrier: "dispatchtool" }
];
var responseenvelopeoutcomes = Object.freeze(["success", "error", "cancel"]);
var errorcodetable = [
  { code: "parse", retry: "never", semantics: "The wire frame does not parse as json; the same bytes never parse on a retry, so the client fixes its framing before the next frame." },
  { code: "method", retry: "never", semantics: "The server routes no method of the name the frame carries; the method table is frozen, so an unknown method stays unknown until a release bump adds it." },
  { code: "params", retry: "immediate", semantics: "The frame parses but its params fail the frozen schema or the negotiation range; the client may retry immediately once its params carry the reviewed fields." },
  { code: "internal", retry: "afterbackoff", semantics: "The handler failed inside the server; the client retries behind the reviewed backoff of its own configuration because the failure names no request defect." },
  { code: "consentrefused", retry: "never", semantics: "The consent gates refused the call; no retry passes without a new human decision, because the refusal records exactly the gate that held it." }
];
var framingrules = Object.freeze({
  stdio: "One newline delimited json frame per block on stdin with one reply frame per line on stdout; the frame size bound stays the user configured limit with no code default.",
  http: "One json frame per http post body on the localhost listener with the reply in the response body under the same user configured frame size bound; no other verb carries frames."
});
var stabilityrules = Object.freeze({
  additive: "Inside protocolv2 every change stays additive: new optional fields, new message types, new tools and new permissions join the contract without touching a frozen entry, because the freeze artifact hashes every schema and refuses a changed hash on the same release version.",
  breaking: "A breaking change \u2014 removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry \u2014 requires a new major protocol version with its own release note, because the written rule is the only path the freeze gate accepts.",
  window: "The deprecation window spans the release candidates until 2.0.0: version one messages stay accepted with one warning per session and every deprecated field carries its sunset release in docs/deprecation.md."
});
function frozenmessagecarriers(entry) {
  const carriermodules = Object.freeze({
    requestbody: ["protocol.ts"],
    parseproposal: ["protocol.ts"],
    parseworkflowproposal: ["protocol.ts"],
    workflowoutcome: ["protocol.ts"],
    observationresponse: ["protocol.ts"],
    outcomeresponse: ["protocol.ts"],
    auditexportreport: ["protocol.ts"],
    memoryitemframe: ["protocol.ts"],
    handlerequest: ["background.ts"],
    recordstep: ["progress.ts"],
    handleframe: ["mcp.ts"],
    listtools: ["mcp.ts"],
    dispatchtool: ["mcp.ts"],
    composeenvelope: ["bridge.ts"]
  });
  return carriermodules[entry.carrier] ?? [];
}
export {
  agenteventframe,
  aggregationreport,
  allowlistreport,
  approvalframes,
  auditexportreport,
  authreport,
  batchreport,
  boardstatesnapshot,
  bridgepayloadreport,
  calllogreport,
  callsreport,
  cancelframes,
  capturebundlereport,
  capturereport,
  cdpreport,
  consensusreport,
  consentmodel,
  consolediffreport,
  controlreport,
  costledgerreport,
  datasetresponse,
  diffresponse,
  downloadreport,
  dryrunreport,
  ecosystemviews,
  editorstate,
  emulationreport,
  environmentgrammar,
  environmentreport,
  errorcodetable,
  errorreportresponse,
  eventnotification,
  eventresponse,
  exchangesreport,
  exportallreport,
  extractionreport,
  formreportresponse,
  framingrules,
  frozenmessagecarriers,
  frozenmessagecatalog,
  gatewaycallreport,
  handoffframe,
  heartbeatreport,
  heldkeysreport,
  httpstreamreport,
  idempotencyreplayframe,
  idempotencyreport,
  inflightreport,
  interfaceviews,
  layoutreport,
  lessonreport,
  logchainreport,
  manualrunpreview,
  mapresponse,
  mediareport,
  memoryitemframe,
  mockreport,
  modeloutcome,
  modelproposal,
  navstateresponse,
  netlogreport,
  observationresponse,
  outboundpayloadcheck,
  outcomeresponse,
  pairingframes,
  parseproposal,
  parsespawnrequest,
  parseworkflowproposal,
  perfreport,
  predictionreport,
  profilereport,
  progressnoticeframe,
  promptcallframe,
  promptreport,
  provenancereport,
  quarantinereport,
  quarantineverdictreport,
  ratelimitreport,
  redactionreport,
  requestbody,
  resourcedeltareport,
  responseenvelopeoutcomes,
  reviewframe,
  rollbacksummarycheck,
  runhistoryquery,
  runhistoryreport,
  runtimelinereport,
  safetyresponse,
  samplingframes,
  schedulereport,
  securityreport,
  selectorresponse,
  sessionreport,
  signalsreport,
  spawnreply,
  stabilityrules,
  streamchunkframe,
  structurederrorreport,
  subscriptionframes,
  surfacesnapshot,
  swarmstatereport,
  syncconsentreport,
  syncpayloadreport,
  tabreportresponse,
  timelinereport,
  tlsreport,
  tokenreport,
  toolcallframe,
  toolresultframe,
  trailreport,
  transformgrammar,
  transparencyreport,
  triggerfired,
  triggerlist,
  urlvisitscheck,
  wizardreport,
  workflowfileversion,
  workflowoutcome,
  workflowreport
};
//# sourceMappingURL=protocol.js.map
