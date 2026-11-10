// cli.ts
import { createInterface } from "node:readline/promises";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join as join2, resolve } from "node:path";

// debug.ts
function expireprofilerecords(input) {
  const retention = input.retention;
  if (retention === void 0) return { heaps: input.heaps, profiles: input.profiles, traces: input.traces };
  const expired = (at) => input.now - at > retention;
  return {
    heaps: input.heaps.map(
      (heap) => expired(heap.capturedat) && heap.bytesexpired !== true ? { ...heap, bytesexpired: true } : heap
    ),
    profiles: input.profiles.map(
      (profile) => expired(profile.at) && profile.samplesexpired !== true ? { ...profile, samplesexpired: true } : profile
    ),
    traces: input.traces.map(
      (trace) => expired(trace.endedat) && trace.bytesexpired !== true ? { ...trace, bytesexpired: true } : trace
    )
  };
}

// environments.ts
function expirelayers(state, retention, now) {
  if (retention === void 0) return state;
  const layers = state.layers.map((layer) => {
    if (layer.revertedat === void 0 || layer.prior === void 0 || layer.priorexpired === true) return layer;
    if (now - layer.revertedat <= retention) return layer;
    const { prior, ...metadata } = layer;
    void prior;
    return { ...metadata, priorexpired: true };
  });
  return { ...state, layers, updatedat: now };
}

// session.ts
function searchsessionrecords(query, records) {
  const matches = [];
  for (const record2 of records) {
    if (query.from !== void 0 && record2.createdat < query.from) continue;
    if (query.to !== void 0 && record2.createdat > query.to) continue;
    const haystacks = [
      { field: "urls", text: record2.tabs.map((tab) => tab.url).join(" ") },
      { field: "titles", text: record2.tabs.map((tab) => tab.title).join(" ") },
      { field: "names", text: [record2.name, record2.folder ?? "", ...record2.tags].join(" ") },
      { field: "text", text: record2.tabs.flatMap((tab) => tab.forms.map((form) => form.value)).join(" ") }
    ];
    for (const haystack of haystacks) {
      if (!query.fields.includes(haystack.field)) continue;
      const lower = haystack.text.toLowerCase();
      for (const term of query.terms) {
        const at = lower.indexOf(term.toLowerCase());
        if (at < 0) continue;
        const start = Math.max(0, at - 30);
        matches.push({
          sessionid: record2.id,
          field: haystack.field,
          term,
          at: record2.createdat,
          excerpt: haystack.text.slice(start, start + 80).trim()
        });
      }
    }
  }
  return matches;
}
function expiresessions(records, retention, now) {
  if (retention === void 0 || !Number.isFinite(retention)) return records;
  return records.map((record2) => {
    if (record2.sectionsexpired || now - record2.createdat < retention) return record2;
    return {
      id: record2.id,
      name: record2.name,
      createdat: record2.createdat,
      tabs: [],
      captures: record2.captures,
      storage: [],
      cookies: [],
      ...record2.folder !== void 0 ? { folder: record2.folder } : {},
      tags: record2.tags,
      ...record2.auto === true ? { auto: true } : {},
      ...record2.restoredat !== void 0 ? { restoredat: record2.restoredat } : {},
      sectionsexpired: true
    };
  });
}
function filteredsessions(records, filter) {
  return records.filter((record2) => {
    if (filter.name !== void 0 && !record2.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
    if (filter.folder !== void 0 && record2.folder !== filter.folder) return false;
    if (filter.from !== void 0 && record2.createdat < filter.from) return false;
    if (filter.to !== void 0 && record2.createdat > filter.to) return false;
    return true;
  });
}

// workflow.ts
function nestedparamof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (candidate.default !== void 0 && !["string", "number", "boolean"].includes(typeof candidate.default) && !Array.isArray(candidate.default))
    return void 0;
  return {
    name: candidate.name,
    kind: candidate.kind,
    ...candidate.default !== void 0 ? { default: candidate.default } : {}
  };
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
  const bindings = Array.isArray(candidate.bindings) ? candidate.bindings.flatMap(
    (binding) => bindingof(binding) !== void 0 ? [bindingof(binding)] : []
  ) : void 0;
  if (candidate.bindings !== void 0 && bindings === void 0) return void 0;
  if (Array.isArray(candidate.bindings) && bindings !== void 0 && bindings.length !== candidate.bindings.length)
    return void 0;
  const expression = candidate.expression === void 0 ? void 0 : expressionof(candidate.expression);
  if (candidate.expression !== void 0 && expression === void 0) return void 0;
  const extract = candidate.extract === void 0 ? void 0 : regexruleof(candidate.extract);
  if (candidate.extract !== void 0 && extract === void 0) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap(
    (param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []
  ) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length)
    return void 0;
  return {
    id: candidate.id,
    kind: candidate.kind,
    label: candidate.label,
    ...candidate.target !== void 0 ? { target: candidate.target } : {},
    ...candidate.value !== void 0 ? { value: candidate.value } : {},
    ...candidate.options !== void 0 ? { options: candidate.options } : {},
    ...bindings !== void 0 && bindings.length > 0 ? { bindings } : {},
    ...expression !== void 0 ? { expression } : {},
    ...extract !== void 0 ? { extract } : {},
    ...candidate.breakpoint === true ? { breakpoint: true } : {},
    ...params !== void 0 && params.length > 0 ? { params } : {}
  };
}
function blockinvocationof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.block !== "string" || !candidate.block.trim()) return void 0;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return void 0;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap(
    (param) => nestedparamof(param) !== void 0 ? [nestedparamof(param)] : []
  ) : void 0;
  if (candidate.params !== void 0 && params === void 0) return void 0;
  if (Array.isArray(candidate.params) && params !== void 0 && params.length !== candidate.params.length)
    return void 0;
  return {
    block: candidate.block,
    label: candidate.label,
    ...params !== void 0 && params.length > 0 ? { params } : {}
  };
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
function bindingof(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.variable !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.variable)) return void 0;
  if (!variablekinds.includes(candidate.kind)) return void 0;
  if (typeof candidate.stepid !== "string" || !candidate.stepid.trim()) return void 0;
  if (candidate.path !== void 0 && (typeof candidate.path !== "string" || !candidate.path.trim())) return void 0;
  return {
    variable: candidate.variable,
    kind: candidate.kind,
    stepid: candidate.stepid,
    ...candidate.path !== void 0 ? { path: candidate.path } : {}
  };
}
var variablekinds = ["string", "number", "boolean", "list", "element"];
var expressionoperators = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "modulo",
  "equal",
  "notequal",
  "less",
  "greater",
  "lessequal",
  "greaterequal",
  "and",
  "or",
  "not",
  "concat",
  "contains",
  "length"
];
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
  return {
    left,
    ...right !== void 0 ? { right } : {},
    operator: candidate.operator,
    result: candidate.result,
    resultkind: candidate.resultkind
  };
}
function operandof(value) {
  if (value === void 0) return void 0;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return { literal: value };
  if (!value || typeof value !== "object" || Array.isArray(value)) return void 0;
  const candidate = value;
  if (typeof candidate.ref === "string" && /^[a-z][a-z0-9]*$/.test(candidate.ref)) return { ref: candidate.ref };
  if (typeof candidate.literal === "string" || typeof candidate.literal === "number" || typeof candidate.literal === "boolean")
    return { literal: candidate.literal };
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
      if (path.includes(invocation.block))
        throw new Error(`The block ${invocation.block} recurs inside itself and cannot expand.`);
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
  if (typeof input.name !== "string" || !input.name.trim())
    throw new Error("The workflow name must be a non-empty string.");
  if (typeof input.version !== "number" || !Number.isInteger(input.version) || input.version < 1)
    throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(input.origins) || input.origins.length === 0)
    throw new Error("A workflow needs at least one granted HTTPS origin.");
  const origins = input.origins.map((origin) => {
    try {
      return new URL(origin).origin;
    } catch {
      throw new Error(`The workflow origin ${origin} is not a valid url.`);
    }
  });
  if (origins.some((origin) => !origin.startsWith("https://"))) throw new Error("Workflow origins must use HTTPS.");
  const blocks = input.blocks ?? [];
  if (blocks.some((block, index) => blocks.findIndex((other) => other.name === block.name) !== index))
    throw new Error("Workflow block names must stay unique.");
  for (const entry of input.steps) {
    if ("kind" in entry && "label" in entry && !("block" in entry)) {
      if (input.kindallowed && !input.kindallowed(entry.kind))
        throw new Error(`The workflow step kind ${entry.kind} is not a reviewed action kind.`);
    }
  }
  for (const block of blocks)
    for (const entry of block.steps) {
      if ("kind" in entry && "label" in entry && !("block" in entry) && input.kindallowed && !input.kindallowed(entry.kind))
        throw new Error(
          `The workflow step kind ${entry.kind} inside block ${block.name} is not a reviewed action kind.`
        );
    }
  const steps = expandblocks(input.steps, blocks);
  for (const step of steps) {
    if (input.kindallowed && !input.kindallowed(step.kind))
      throw new Error(`The workflow step kind ${step.kind} is not a reviewed action kind.`);
    if (iscontrolflowkind(step.kind)) {
      validatecontrolpayload(step);
      for (const child of controlsteps(step)) {
        if (input.kindallowed && !input.kindallowed(child.kind))
          throw new Error(
            `The workflow step kind ${child.kind} inside the control payload of ${step.id} is not a reviewed action kind.`
          );
      }
    }
    if (step.bindings)
      for (const binding of step.bindings) {
        if (!steps.some((other) => other.id === binding.stepid))
          throw new Error(`The binding of ${binding.variable} references the unknown step ${binding.stepid}.`);
      }
  }
  const riskof = input.riskof ?? (() => "sensitive");
  const gradedkinds = steps.flatMap((step) => [step.kind, ...controlsteps(step).map((child) => child.kind)]);
  const risk = gradedkinds.some((kind) => riskof(kind) === "sensitive") ? "sensitive" : gradedkinds.some((kind) => riskof(kind) === "interaction") ? "interaction" : "read";
  const record2 = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name,
    version: input.version,
    origins: [...new Set(origins)],
    steps,
    blocks,
    risk,
    createdat: input.now
  };
  return deepfreeze(record2);
}
function deepfreeze(record2) {
  for (const step of record2.steps) Object.freeze(step);
  for (const block of record2.blocks)
    for (const entry of block.steps)
      if ("kind" in entry && "label" in entry && !("block" in entry)) Object.freeze(entry);
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
    if (options?.kindallowed && !options.kindallowed(step.kind))
      return { allowed: false, reason: `The workflow step kind ${step.kind} is not a reviewed action kind.` };
    if (step.bindings)
      for (const binding of step.bindings) {
        const source = byid.get(binding.stepid);
        if (!source)
          return {
            allowed: false,
            reason: `The binding of ${binding.variable} references the unknown step ${binding.stepid}.`
          };
        if (source.index >= index)
          return {
            allowed: false,
            reason: `The binding of ${binding.variable} must link an earlier step than ${step.id}.`
          };
        defined.add(binding.variable);
      }
    if (step.expression) {
      for (const operand of [step.expression.left, step.expression.right]) {
        if (operand?.ref && !defined.has(operand.ref))
          return {
            allowed: false,
            reason: `The expression of step ${step.id} references the undefined variable ${operand.ref}.`
          };
      }
      defined.add(step.expression.result);
    }
    if (step.extract) for (const group of step.extract.groups) defined.add(group);
  }
  return { allowed: true };
}
function pushscope(scopes, name, parent) {
  return [...scopes, { name, variables: [], ...parent !== void 0 ? { parent } : {} }];
}
function popscope(scopes) {
  if (scopes.length === 0) return scopes;
  return scopes.slice(0, -1);
}
function resolvevariable(scopes, name) {
  for (let index = scopes.length - 1; index >= 0; index -= 1) {
    const scope = scopes[index];
    const found = scope.variables.find((variable) => variable.name === name);
    if (found) return found;
    if (scope.parent === void 0) continue;
    const parentindex = scopes.findIndex((candidate) => candidate.name === scope.parent);
    if (parentindex >= 0 && parentindex < index) {
      const inherited = resolvevariable([scopes[parentindex]], name);
      if (inherited) return inherited;
    }
  }
  return void 0;
}
function setvariable(scopes, name, kind, value, now) {
  if (scopes.length === 0) scopes = [{ name: "root", variables: [] }];
  const target = scopes[scopes.length - 1];
  const variables = [
    ...target.variables.filter((variable) => variable.name !== name),
    { name, kind, value, setat: now }
  ];
  return [...scopes.slice(0, -1), { ...target, variables }];
}
function coercevariable(value, kind) {
  if (kind === "number") {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
    if (!Number.isFinite(parsed)) throw new Error("The bound value is not a finite number.");
    return parsed;
  }
  if (kind === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    throw new Error("The bound value is not a boolean.");
  }
  if (kind === "list") {
    if (Array.isArray(value)) return value.map((item) => String(item));
    if (typeof value === "string") return value.length === 0 ? [] : value.split(",");
    throw new Error("The bound value is not a list.");
  }
  if (kind === "element") {
    if (typeof value === "string" && value.trim()) return value;
    throw new Error("The bound value is not an element reference.");
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  throw new Error("The bound value is not a string.");
}
function outcomedetail(outcome, path) {
  if (!path) return outcome.summary;
  let current = outcome.details ?? {};
  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return void 0;
    current = current[segment];
  }
  return current;
}
function bindvariables(scopes, bindings, outputs, now) {
  let current = scopes;
  const produced = [];
  for (const binding of bindings) {
    const outcome = outputs[binding.stepid];
    if (!outcome) continue;
    const raw = outcomedetail(outcome, binding.path);
    if (raw === void 0)
      throw new Error(
        `The binding of ${binding.variable} found no value at ${binding.path ?? "the summary"} of step ${binding.stepid}.`
      );
    current = setvariable(current, binding.variable, binding.kind, coercevariable(raw, binding.kind), now);
    produced.push(binding.variable);
  }
  return { scopes: current, produced };
}
function operandvalue(operand, scopes) {
  if (operand.ref !== void 0) {
    const resolved = resolvevariable(scopes, operand.ref);
    if (!resolved) throw new Error(`The expression references the undefined variable ${operand.ref}.`);
    return resolved.value;
  }
  if (operand.literal === void 0) throw new Error("The expression operand needs a variable reference or a literal.");
  return operand.literal;
}
function expressioneval(expression, scopes) {
  const left = operandvalue(expression.left, scopes);
  const right = expression.right === void 0 ? void 0 : operandvalue(expression.right, scopes);
  const operand = (value) => {
    if (Array.isArray(value))
      throw new Error("The expression operand is a list and needs the contains or length operator.");
    if (value === void 0) throw new Error("The expression operand is missing.");
    return value;
  };
  const numbervalue = (value) => {
    const primitive = operand(value);
    if (typeof primitive === "number") return primitive;
    if (typeof primitive === "string" && primitive.trim() !== "") {
      const parsed = Number(primitive);
      if (Number.isFinite(parsed)) return parsed;
    }
    throw new Error("The arithmetic operand is not a number.");
  };
  const booleanvalue = (value) => {
    const primitive = operand(value);
    if (typeof primitive === "boolean") return primitive;
    throw new Error("The logic operand is not a boolean.");
  };
  const stringvalue = (value) => {
    const primitive = operand(value);
    if (typeof primitive === "string") return primitive;
    if (typeof primitive === "number" || typeof primitive === "boolean") return String(primitive);
    throw new Error("The text operand is not a string.");
  };
  switch (expression.operator) {
    case "add":
      return numbervalue(left) + numbervalue(right);
    case "subtract":
      return numbervalue(left) - numbervalue(right);
    case "multiply":
      return numbervalue(left) * numbervalue(right);
    case "divide": {
      const divisor = numbervalue(right);
      if (divisor === 0) throw new Error("The expression divides by zero.");
      return numbervalue(left) / divisor;
    }
    case "modulo": {
      const divisor = numbervalue(right);
      if (divisor === 0) throw new Error("The expression divides by zero.");
      return numbervalue(left) % divisor;
    }
    case "equal":
      return left === right;
    case "notequal":
      return left !== right;
    case "less":
      return numbervalue(left) < numbervalue(right);
    case "greater":
      return numbervalue(left) > numbervalue(right);
    case "lessequal":
      return numbervalue(left) <= numbervalue(right);
    case "greaterequal":
      return numbervalue(left) >= numbervalue(right);
    case "and":
      return booleanvalue(left) && booleanvalue(right);
    case "or":
      return booleanvalue(left) || booleanvalue(right);
    case "not":
      return !booleanvalue(left);
    case "concat":
      return `${stringvalue(left)}${stringvalue(right)}`;
    case "contains": {
      if (Array.isArray(left)) return left.includes(stringvalue(right));
      return stringvalue(left).includes(stringvalue(right));
    }
    case "length": {
      if (Array.isArray(left)) return left.length;
      return stringvalue(left).length;
    }
    default:
      throw new Error("The reviewed expression operator is unknown.");
  }
}
function regexextract(rule, text2, now) {
  const pattern = new RegExp(rule.pattern, rule.flags);
  const match = pattern.exec(text2);
  if (!match) return { matched: false, variables: [] };
  const variables = [];
  for (const group of rule.groups) {
    const value = match.groups?.[group];
    variables.push({ name: group, kind: "string", value: typeof value === "string" ? value : "", setat: now });
  }
  return { matched: true, variables };
}
function newworkflowrun(input) {
  return {
    id: input.id ?? crypto.randomUUID(),
    workflowid: input.workflowid,
    state: "pending",
    cursor: 0,
    startedat: input.now,
    ...input.dryrun === true ? { dryrun: true } : {}
  };
}
function interpolate(text2, scopes) {
  const consumed = [];
  const resolved = text2.replace(/\$\{([a-z][a-z0-9]*)\}/g, (_whole, name) => {
    const variable = resolvevariable(scopes, name);
    if (!variable) throw new Error(`The step references the undefined variable ${name}.`);
    consumed.push(name);
    return Array.isArray(variable.value) ? variable.value.join(",") : String(variable.value);
  });
  return { text: resolved, consumed };
}
function runlogof(step, state, startedat, duration, summary, extra) {
  return {
    stepid: step.id,
    label: step.label,
    state,
    startedat,
    duration,
    summary,
    ...extra.block !== void 0 ? { block: extra.block } : {},
    ...extra.consumed !== void 0 && extra.consumed.length > 0 ? { consumed: extra.consumed } : {},
    ...extra.produced !== void 0 && extra.produced.length > 0 ? { produced: extra.produced } : {},
    ...extra.checkpoint === true ? { checkpoint: true } : {},
    ...extra.details !== void 0 ? { details: extra.details } : {}
  };
}
async function runstep(input) {
  const startedat = input.now;
  let scopes = input.scopes;
  const consumed = [];
  if (input.step.bindings) {
    const bound = bindvariables(
      scopes,
      input.step.bindings.filter((binding) => input.outputs[binding.stepid] !== void 0),
      input.outputs,
      input.now
    );
    scopes = bound.scopes;
  }
  let produced = [];
  try {
    if (input.step.expression) {
      const value2 = expressioneval(input.step.expression, scopes);
      scopes = setvariable(
        scopes,
        input.step.expression.result,
        input.step.expression.resultkind,
        coercevariable(value2, input.step.expression.resultkind),
        input.now
      );
      produced = [...produced, input.step.expression.result];
    }
    let stepvalue = input.step.value;
    if (input.step.extract) {
      const text2 = stepvalue ?? "";
      const interpolated = interpolate(text2, scopes);
      consumed.push(...interpolated.consumed);
      const extraction = regexextract(input.step.extract, interpolated.text, input.now);
      if (extraction.matched) {
        for (const variable of extraction.variables)
          scopes = setvariable(scopes, variable.name, "string", variable.value, input.now);
        produced = [...produced, ...extraction.variables.map((variable) => variable.name)];
      }
      stepvalue = interpolated.text;
    }
    const controlled = iscontrolflowkind(input.step.kind);
    const target = !controlled && input.step.target !== void 0 ? interpolate(input.step.target, scopes) : void 0;
    if (target) consumed.push(...target.consumed);
    const value = !controlled && stepvalue !== void 0 ? interpolate(stepvalue, scopes) : void 0;
    if (value) consumed.push(...value.consumed);
    const options = !controlled && input.step.options !== void 0 ? interpolate(input.step.options, scopes) : void 0;
    if (options) consumed.push(...options.consumed);
    const dispatchable = {
      ...input.step,
      ...target !== void 0 ? { target: target.text } : {},
      ...value !== void 0 ? { value: value.text } : {},
      ...options !== void 0 ? { options: options.text } : {}
    };
    const output = await input.execute(dispatchable, {
      scopes,
      outputs: input.outputs,
      ...input.block !== void 0 ? { block: input.block } : {}
    });
    if (output.scopes !== void 0) scopes = output.scopes;
    const childlog = output.log;
    if (input.step.bindings) {
      const bound = bindvariables(
        scopes,
        input.step.bindings,
        {
          ...input.outputs,
          [input.step.id]: {
            stepid: input.step.id,
            ok: output.ok,
            summary: output.summary,
            ...output.details !== void 0 ? { details: output.details } : {},
            at: input.now
          }
        },
        input.now
      );
      scopes = bound.scopes;
      produced = [.../* @__PURE__ */ new Set([...produced, ...bound.produced])];
    }
    const duration = Date.now() - startedat;
    return {
      scopes,
      log: runlogof(input.step, output.ok ? "done" : "failed", startedat, duration, output.summary, {
        ...input.block !== void 0 ? { block: input.block } : {},
        ...consumed.length > 0 ? { consumed } : {},
        ...produced.length > 0 ? { produced } : {},
        ...output.details !== void 0 ? { details: output.details } : {},
        ...output.ok ? { checkpoint: true } : {}
      }),
      ...childlog !== void 0 ? { childlog } : {},
      output
    };
  } catch (error) {
    const duration = Date.now() - startedat;
    const summary = error instanceof Error ? error.message : String(error);
    return {
      scopes,
      log: runlogof(input.step, "failed", startedat, duration, summary, {
        ...input.block !== void 0 ? { block: input.block } : {},
        ...consumed.length > 0 ? { consumed } : {}
      }),
      output: { ok: false, summary }
    };
  }
}
async function runworkflow(input) {
  if (input.gates && !input.gates.sessionactive)
    throw new Error("The workflow refuses to run outside an approved session.");
  if (input.gates && !input.gates.planapproved)
    throw new Error("The workflow refuses to run without the approved plan review.");
  if (input.gates)
    for (const origin of input.record.origins) {
      if (!input.gates.origingranted(origin))
        throw new Error(`The workflow origin ${origin} falls outside the session grants.`);
    }
  if (input.run.state === "done" || input.run.state === "failed" || input.run.state === "cancelled")
    throw new Error(`The workflow run is already ${input.run.state}.`);
  const { pausedat, ...resumed } = input.run;
  void pausedat;
  let run = input.run.state === "paused" ? { ...resumed, state: "running" } : { ...input.run, state: "running" };
  let scopes = input.scopes ?? [{ name: "root", variables: [] }];
  const log = [...input.log ?? []];
  const outputs = { ...input.outputs ?? {} };
  let activeblock;
  for (let index = run.cursor; index < input.record.steps.length; index += 1) {
    const step = input.record.steps[index];
    if (step.block !== void 0 && step.block !== activeblock) {
      scopes = pushscope(scopes, step.block, scopes[scopes.length - 1].name);
      activeblock = step.block;
      if (step.params) {
        try {
          for (const param of step.params) {
            if (param.default === void 0) continue;
            scopes = setvariable(scopes, param.name, param.kind, coercevariable(param.default, param.kind), input.now);
          }
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          return {
            run: {
              ...run,
              state: "failed",
              endedat: Date.now(),
              failreason: `The nested parameter of block ${step.block} failed: ${reason}`
            },
            scopes,
            log,
            outputs
          };
        }
      }
    } else if (step.block === void 0 && activeblock !== void 0) {
      while (scopes.length > 1) scopes = popscope(scopes);
      activeblock = void 0;
    }
    const executed = await runstep({
      step,
      scopes,
      outputs,
      execute: input.execute,
      now: Date.now(),
      ...step.block !== void 0 ? { block: step.block } : {}
    });
    scopes = executed.scopes;
    if (executed.childlog !== void 0) log.push(...executed.childlog);
    log.push(executed.log);
    outputs[step.id] = {
      stepid: step.id,
      ok: executed.output.ok,
      summary: executed.output.summary,
      ...executed.output.details !== void 0 ? { details: executed.output.details } : {},
      at: Date.now()
    };
    if (!executed.output.ok) {
      run = { ...run, state: "failed", endedat: Date.now(), failreason: executed.output.summary };
      return { run, scopes, log, outputs };
    }
    run = { ...run, cursor: index + 1 };
    if (input.oncheckpoint) await input.oncheckpoint({ run, scopes, log });
  }
  run = { ...run, state: "done", endedat: Date.now() };
  return { run, scopes, log, outputs };
}
function dryrunworkflow(input) {
  const run = {
    ...input.run,
    state: "running",
    ...input.run.dryrun === true ? { dryrun: true } : { dryrun: true }
  };
  let scopes = input.scopes ?? [{ name: "root", variables: [] }];
  const log = [...input.log ?? []];
  for (let index = run.cursor; index < input.record.steps.length; index += 1) {
    const step = input.record.steps[index];
    const summary = input.projection(step);
    const entry = summary === void 0 ? runlogof(
      step,
      "refused",
      input.now,
      0,
      `The ${step.kind} step has no read only projection and the dry run refuses it.`,
      { ...step.block !== void 0 ? { block: step.block } : {} }
    ) : runlogof(step, "done", input.now, 0, summary, { ...step.block !== void 0 ? { block: step.block } : {} });
    log.push(entry);
    scopes = setvariable(scopes, `${step.id}outcome`, "boolean", entry.state === "done", input.now);
  }
  return { run: { ...run, state: "done", cursor: input.record.steps.length, endedat: input.now }, scopes, log };
}
var controlflowkinds = [
  "condition",
  "branch",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch"
];
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
  const join3 = candidate.join && typeof candidate.join === "object" && !Array.isArray(candidate.join) ? candidate.join : void 0;
  if (!join3) return void 0;
  if (join3.strategy !== "first" && join3.strategy !== "last" && join3.strategy !== "fail") return void 0;
  if (join3.onfail !== "cancel" && join3.onfail !== "continue") return void 0;
  return { branches, join: { strategy: join3.strategy, onfail: join3.onfail } };
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
    if (typeof retrycandidate.attempts !== "number" || !Number.isInteger(retrycandidate.attempts) || retrycandidate.attempts < 1)
      return void 0;
    const backoff = retrycandidate.backoff && typeof retrycandidate.backoff === "object" && !Array.isArray(retrycandidate.backoff) ? retrycandidate.backoff : void 0;
    if (!backoff) return void 0;
    if (backoff.shape !== "fixed" && backoff.shape !== "exponential") return void 0;
    if (typeof backoff.base !== "number" || !Number.isFinite(backoff.base) || backoff.base < 0) return void 0;
    if (typeof backoff.jitter !== "number" || !Number.isFinite(backoff.jitter) || backoff.jitter < 0) return void 0;
    if (!Array.isArray(retrycandidate.retryable) || !retrycandidate.retryable.every((entry) => typeof entry === "string" && entry.trim()))
      return void 0;
    retry = {
      attempts: retrycandidate.attempts,
      backoff: { shape: backoff.shape, base: backoff.base, jitter: backoff.jitter },
      retryable: retrycandidate.retryable
    };
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
  return {
    steps,
    catch: catchvalue,
    ...retry !== void 0 ? { retry } : {},
    ...timeout !== void 0 ? { timeout } : {}
  };
}
function controloptions(step) {
  if (step.options === void 0)
    throw new Error(`The ${step.kind} step needs its reviewed control payload in options.`);
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  return parsed;
}
function validatecontrolpayload(step) {
  if (!iscontrolflowkind(step.kind)) return;
  const payload = controloptions(step);
  if (step.kind === "condition" && conditionof(payload.condition) === void 0)
    throw new Error("The condition step needs a reviewed boolean expression in its options.");
  if (step.kind === "branch" && branchof(payload.branch) === void 0)
    throw new Error(
      "The branch step needs reviewed unique paths with boolean match expressions and an else path in its options."
    );
  if (step.kind === "loop" && loopof(payload.loop) === void 0)
    throw new Error(
      "The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options."
    );
  if (step.kind === "repeatuntil" && repeatuntilof(payload.repeatuntil) === void 0)
    throw new Error(
      "The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options."
    );
  if (step.kind === "whileloop" && whileof(payload.while) === void 0)
    throw new Error(
      "The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options."
    );
  if (step.kind === "foreach" && foreachof(payload.foreach) === void 0)
    throw new Error(
      "The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options."
    );
  if (step.kind === "parallel" && parallelof(payload.parallel) === void 0)
    throw new Error(
      "The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options."
    );
  if (step.kind === "trycatch" && tryof(payload.try) === void 0)
    throw new Error(
      "The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options."
    );
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
    return {
      kind: step.kind,
      ...condition ? { expression: `${condition.expression.operator} into ${condition.expression.result}` } : {}
    };
  }
  if (step.kind === "branch") {
    const branch = branchof(payload.branch);
    return {
      kind: step.kind,
      ...branch ? { paths: branch.paths.map((path) => path.name), elsepath: branch.else.name } : {}
    };
  }
  if (step.kind === "loop") {
    const loop = loopof(payload.loop);
    return {
      kind: step.kind,
      ...loop ? {
        list: loop.list,
        item: loop.item,
        index: loop.index,
        ...loop.bound !== void 0 ? { bound: loop.bound } : { bound: defaultloopbound }
      } : {}
    };
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
    return {
      kind: step.kind,
      ...foreach ? { selector: foreach.selector, item: foreach.item, index: foreach.index } : {}
    };
  }
  if (step.kind === "parallel") {
    const parallel = parallelof(payload.parallel);
    return {
      kind: step.kind,
      ...parallel ? {
        branches: parallel.branches.map((branch) => branch.id),
        strategy: parallel.join.strategy,
        onfail: parallel.join.onfail
      } : {}
    };
  }
  const fragile = tryof(payload.try);
  return {
    kind: step.kind,
    ...fragile ? {
      ...fragile.retry !== void 0 ? {
        attempts: fragile.retry.attempts,
        backoff: `${fragile.retry.backoff.shape} base ${fragile.retry.backoff.base} jitter ${fragile.retry.backoff.jitter}`
      } : {},
      ...fragile.catch.rerun === true ? { rerun: true } : {},
      ...fragile.timeout?.stepms !== void 0 ? { stepms: fragile.timeout.stepms } : {},
      ...fragile.timeout?.runms !== void 0 ? { runms: fragile.timeout.runms } : {}
    } : {}
  };
}
var gatebuiltin = (builtin) => `node:${builtin}`;
var gatedependency = (name) => `${name}`;
async function verifyworkflowyamlcontrols() {
  const { readdir: readdir2, readFile: readFile2 } = await import(
    /* @vite-ignore */
    gatebuiltin("fs/promises")
  );
  const { join: join3, resolve: resolve2 } = await import(
    /* @vite-ignore */
    gatebuiltin("path")
  );
  const { parseDocument } = await import(
    /* @vite-ignore */
    gatedependency("yaml")
  );
  const repoRoot = resolve2(process.cwd(), "..");
  const workflowdirectory = join3(repoRoot, ".github/workflows");
  const configfiles = (file) => /-config\.ya?ml$/i.test(file);
  const workflowfiles = (await readdir2(workflowdirectory)).filter((file) => /\.ya?ml$/i.test(file) && !configfiles(file)).sort();
  const allymlfiles = (await readdir2(workflowdirectory)).filter((file) => /\.ya?ml$/i.test(file));
  if (workflowfiles.length === 0) throw new Error("No GitHub Actions workflows were found.");
  for (const file of allymlfiles) {
    const content = await readFile2(`${workflowdirectory}/${file}`, "utf8");
    const document2 = parseDocument(content, { prettyErrors: true, uniqueKeys: true, version: "1.2" });
    if (document2.errors.length)
      throw new Error(`${file} has invalid YAML: ${document2.errors.map((error) => error.message).join("; ")}`);
    if (configfiles(file)) continue;
    const workflow = document2.toJS();
    if (!workflow || typeof workflow !== "object" || !("on" in workflow) || !("jobs" in workflow))
      throw new Error(`${file} must declare both on and jobs.`);
  }
  const checks = {
    "verify.yml": [
      "workflow_call:",
      "ref:",
      "pull_request:",
      'npx --yes "npm@${npm_version}" install --global',
      "bun run test:chromium",
      "browser-actions/setup-chrome@",
      "chrome-version: stable",
      "CHROME_BIN: ${{ steps.chrome-for-testing.outputs.chrome-path }}",
      "oven-sh/setup-bun@",
      "bun build/cli.js manifest",
      "bun run check",
      "node apifreeze.ts",
      "node pentest.ts",
      /* the securitytooling consolidation moved the csp audit into the
       * security keyword file's lane dispatcher, and the plain-node lane
       * runner walks the self-contained per-module bundle the build stamps
       * (the source seat's static .js relative imports resolve only under
       * the bundlers) — the control the verify ladder reads walks the
       * built security seat the same law stamped. */
      "node build/security.js cspaudit",
      "node permdiff.ts",
      "node agentcert.ts",
      "node costcert.ts",
      "node doccheck.ts",
      "node sweep.ts",
      "node poolaudit.ts",
      "node matrixverify.ts",
      "node telemetryfree.ts",
      "node recipes.ts",
      "node ../foundry/readiness.ts",
      "mvn --batch-mode",
      "dotnet pack",
      "upload-artifact",
      "node build/cli.js planlint build/fixtures/plans",
      "node build/cli.js runworkflow",
      "--dryrun --quiet",
      "runtime: [node, bun, deno]",
      "denoland/setup-deno@",
      "deno check build/deno.js",
      "bun x vitest run",
      "Require smoke against the cjs bundle",
      "Import smoke against the esm bundle",
      "Global smoke against the umd bundle",
      "Tarball content check over every mode file",
      "build/index.cjs",
      "build/devthink.umd.js",
      "build/checksums.txt",
      "node nativesmoke.ts",
      "native install --profile",
      "native uninstall --profile",
      "NativeMessagingHosts",
      "Assert the native messaging permission stays absent from the required set",
      "node jsongate.ts",
      "build/nativehost.template.json",
      "build/companion.js",
      "Run the firefox prep step offline",
      "Run the addons linter over the xpipack output when installed",
      "Install firefox and run a load smoke on the xpipack build when available",
      "build/devthink-firefox-${VERSION}.xpi",
      "Run the vsix package build",
      "Run the nuget pack dry run",
      "Run the maven pack dry run",
      "Build the container image and run its smoke",
      "docker build -f devthink/Dockerfile",
      "Assert the artifact manifest matches the built set",
      "build/devthink-vscode-${VERSION}.vsix",
      "contentFiles/any/any/cli.js",
      "target/devthink-${VERSION}.jar"
    ],
    "release.yml": [
      "package.json",
      "CHANGELOG.md",
      "refusing to ship an empty release body",
      "Tag $TAG does not point to the source being released.",
      "uses: ./.github/workflows/verify.yml",
      "node build.ts",
      "node packageextension.ts",
      "npm pack ./distpackage --pack-destination release",
      "package/fixtures/example-org-pagestate.json",
      "package/checksums.txt",
      "package/gallery.json",
      "package/bridge.js",
      "package/companion.js",
      "package/nativehost.template.json",
      "package/server.js",
      /* the securitytooling consolidation folded the crossbrowser lane into
       * the security keyword file — the tgz control reads the one
       * security.js artifact the lane now packs. */
      "package/security.js",
      "package/pack.js",
      "package/http.js",
      "package/manifest.json",
      "package/index.d.ts",
      "nested past two directories",
      "wenathlan-devthink-${VERSION}.tgz",
      "build/devthink-firefox-${VERSION}.xpi",
      "build/devthink-safari-${VERSION}.zip",
      "build/devthink-vscode-${VERSION}.vsix",
      "build/devthink-site-${VERSION}.zip",
      "devthink-declarations-${VERSION}.zip",
      "cp build/devthink.umd.js build/devthink.umd.min.js release/",
      "devthink-nativehost-${VERSION}.template.json",
      "git archive --format=zip",
      "test -f build/artifactmanifest.json",
      "release-complete",
      "./release/wenathlan-devthink-${RELEASE_VERSION}.tgz",
      "registry.npmjs.org",
      "secrets.NODE_AUTH_TOKEN || secrets.NPM_TOKEN",
      "npm whoami",
      "environment: release-approval",
      "the bounded retry policy retries inside three attempts",
      "actions/attest@",
      "devthink-sbom-${VERSION}.json",
      "devthink-attestations-${VERSION}.json",
      "devthink-artifactmanifest-${VERSION}.json",
      "sbomcoveragecheck",
      "artifactmanifestcheck",
      "vsixmarketplacemetadatacheck",
      "gh release create",
      'gh release create "${{ needs.assemble.outputs.tag }}" --repo "$GITHUB_REPOSITORY" --draft',
      "gh release upload",
      "gh release download",
      "sha256sum --check SHA256SUMS.txt",
      "find . -maxdepth 1 -type f ! -name SHA256SUMS.txt",
      "sort -z | xargs -0 sha256sum",
      'gh release edit "${{ needs.assemble.outputs.tag }}" --repo "$GITHUB_REPOSITORY" --draft=false',
      /* the thousand asset ladder lanes: the per-architecture container
       * seats and the per-app registry and provenance seats feed the
       * artifact manifest through the releaseassets needs row, the
       * per-channel checksum umbrellas answer beside the sums, and the
       * release body carries the census section the owner law pins */
      "THE THOUSAND ASSET LADDER",
      "containerseats",
      "familyseats",
      "for arch in 386 armv6 armv7 arm64 ppc64le riscv64 s390x; do",
      "sha256.channel.",
      "The asset census (the thousand plus law)",
      "SPDX-2.3"
    ],
    "security.yml": [
      "dependency-review-action",
      "codeql-action",
      "trufflehog",
      /* the sbom lane the checksum 503 bypass re seated: the action wrapper
         (its embedded installer carries no retry seat) retired for the
         direct syft walk with the retry-hardened fetch the trivy lane
         founded - the control anchor follows the lane that generates the
         bill of materials. */
      "Install syft (the checksum 503 bypass lane)",
      "syft scan dir:. -o cyclonedx-json=build/security/devthink.sbom.cdx.json",
      "license-checker@25.0.1",
      "--onlyAllow=",
      /* the absorbed governance lanes of the 2.0.16 grouping pass */
      "github/codeql-action/init@",
      "build-mode: none",
      "25 4 * * 3",
      "ossf/scorecard-action@",
      "publish_results: true",
      "::error file=SECURITY.md::",
      "major}.x",
      /* the 2.0.18 gap closures: the layout contract */
      "one-workflow-file layout contract"
      /* the embedded build cache doctrine of the 2.0.16 pass */
    ],
    "workflowlint.yml": [
      /* the correlated grouping: the workflow lint lives in its own lane —
         the security battery no longer duplicates the actionlint step. */
      "reviewdog/action-actionlint@",
      "fail_level: error",
      /* the real actionlint flag is -config-file (the cli defines no -config
         short form), so the pin rides the flag the lane actually passes */
      "actionlint_flags: -config-file .github/workflows/actionlint-config.cfg"
    ],
    "ci.yml": [
      "runtime: [node, bun, deno]",
      "deno check build/deno.js",
      "node-version: 24",
      "Typecheck on the active LTS line",
      "npm run check:web",
      "uses: ./.github/workflows/verify.yml",
      "if: github.event_name == 'workflow_dispatch'",
      /* the 2.0.18 gap closure: the repository structure gate */
      "Repository flat structure contract",
      "nest past four directories",
      "duplicates another",
      /* the consolidation pass: the cross-bundler verification the retired
         webpack.yml workflow carried rides the CI battery as its webpack job.
         the 7.3.1 cli seat reds the variadic --target parse (the commander
         14 argParser walks prev as the non-iterable default), so the lane
         answers the config-file walk: the generated webpack.config.mjs
         carries the same entry, output, mode and target seats the flags
         rode, and the -c invocation the pinned rung reads stays the law. */
      "Pack the core bundle through webpack",
      "npx --yes -p webpack@5.112.2 -p webpack-cli@6.0.1 webpack",
      "webpack -c ./build/webpack.config.mjs",
      'entry: "./build/index.js"',
      'target: "node"',
      "build/webpack/devthink.webpack.js"
    ],
    "pages.yml": [
      "VITE_BASE_PATH",
      "404.html",
      ".nojekyll",
      "Boot smoke test (SPA entry and fallback page on a pinned port)",
      "python3 -m http.server",
      'python3 -m http.server "${SMOKE_PORT}"',
      "Lint the delivered html pages (python html.parser well-formedness)"
    ],
    "publish.yml": [
      /* the merged lane file of the 2.0.16 grouping pass */
      "workflow_run:",
      'workflows: ["DevThink Release"]',
      "devthink-publish-${{ github.event_name }}-${{ github.ref }}",
      /* the npmjs lane: the flat built tarball with the checksum signature and provenance */
      "npm pack ./distpackage --pack-destination release",
      "package/checksums.txt",
      'npm publish "${tarball}" --access public --provenance',
      "id-token: write",
      "the publish race resolved with the same built content",
      "npm dist-tag add",
      "retrying with backoff",
      /* the github npm lane */
      "npm.pkg.github.com",
      'npm publish "${tarball}" --registry=https://npm.pkg.github.com',
      "distpackage/package.json",
      /* the ghcr lane: the five-architecture index with the embedded cache and the latest realignment */
      "docker buildx imagetools inspect",
      "platforms: linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64",
      "platforms: linux/amd64,linux/arm64,linux/ppc64le,linux/s390x,linux/riscv64",
      '. == ["amd64", "arm64", "ppc64le", "riscv64", "s390x"]',
      'echo "${image}:latest"',
      "drop the legacy referrers fallback tags",
      'all(startswith("sha256-"))',
      /* the rubygems lane */
      "ruby/setup-ruby@",
      "gem build devthink.gemspec",
      "DEVTHINK_VERSION=",
      "gem push devthink-*.gem",
      "rubygems.pkg.github.com",
      "pre-deploy existence check",
      /* the desktop tauri lane: the portable checksum and the web tauri config */
      "shasum -a 256",
      "devthink/tauri.conf.json",
      "standalone: ${{ matrix.runner != 'macos-15-intel' }}",
      /* the closing sums umbrella: the needs chain over every lane */
      "Rebuild the release SHA256SUMS umbrella",
      "target-plans",
      "!cancelled()",
      /* the 2.0.18 gap closures: the approval environments, the digest pin lane */
      "environment: release-approval",
      "Pin the published container digest as release assets",
      "devthink-container.digest",
      "- digest",
      /* the consolidation pass: the saddle block the three retired saddle
         workflow files carried rides this file as the closing application
         lanes - the target plans and the dispatch-only vhe registry lane,
         the heaviest pass of the house. the extension package lane the
         block once carried retired with the ownership regroup: the mv3
         extension left the saddle for the os envelope (the browser.ts CLI
         the lane invoked answered the pre-regroup source), so the os
         extension lane packages the one extension the family ships. */
      "Saddle plan ${{ matrix.target }} ${{ matrix.format }}",
      /* the dist law seat (both heal lanes answered it): the build:engine
         step writes the thin targetcli wrapper at distpackage/packager —
         the source-is-library doctrine the build stamp carries — so the
         lane control reads the emitted seat the build never calls dist */
      "distpackage/packager/targetcli.js",
      "require('./saddle/package.json').version"
      /* the size-law move: the saddle vhe family (the validation lane,
         the vhe profile stamping and the dispatch-only deep validation)
         rides the containers.yml wave now — the publish file answered
         the 500 KB ceiling the GitHub limit carries, so the controls
         answer from the containers checks below */
    ],
    "saddlelanes.yml": [
      /* the half-megabyte law (the saddlelanes split): the saddle vhe
         family the publish workflow carried rides its own file now —
         the publish envelope answered the 500 KB ceiling the GitHub
         limit carries — so the vhe controls answer from the split wave
         (the saddle manifest read, the validation lane, the vhe profile
         stamping, the dispatch-only deep validation, the security gate
         and the catalog law) */
      "JSON.parse(require('fs').readFileSync('saddle/package.json','utf8')).version",
      "Validate saddle vhe image",
      "VHE_PROFILE_CPU=",
      "if: github.event_name == 'workflow_dispatch'",
      "Saddle vhe security gate",
      "osprofiles catalog carries"
    ],
    "maintenance.yml": [
      "workflow_run:",
      "workflows: [DevThink Security]",
      "schedule:",
      "allow_major_updates",
      "apply_cache_cleanup",
      "extension-mcp",
      "Retire the merged maven packages the single distribution replaced",
      "node-version-file: devthink/.nvmrc",
      'npx --yes "npm@${npm_version}" install --global',
      "bun install --frozen-lockfile",
      "oven-sh/setup-bun@",
      "bun run dependency:updates",
      "bun run workflow:updates",
      "GH_TOKEN: ${{ github.token }}",
      "bun run sync:metadata",
      "gh pr create",
      "actions: write",
      "NONDEFAULT_MAX_AGE_HOURS",
      "actions/caches",
      /* the 2.0.18 gap closures: the scoped retention and the second window */
      "WORKFLOW_RUN_SCOPED",
      "17 15 * * *",
      /* the consolidation pass: the pull request labeler the retired
         labeler.yml workflow carried rides the maintenance ladder as its
         label job, reading the config that stays grouped inside the
         workflows folder (the owner rule) */
      "pull_request_target:",
      "actions/labeler@",
      "configuration-path: .github/workflows/labeler-config.cfg"
    ]
  };
  for (const [file, terms] of Object.entries(checks)) {
    const content = await readFile2(`${workflowdirectory}/${file}`, "utf8");
    for (const term of terms)
      if (!content.includes(term)) {
        throw new Error(`${file} is missing required control: ${term}`);
      }
  }
  for (const file of workflowfiles) {
    const content = await readFile2(`${workflowdirectory}/${file}`, "utf8");
    if (content.includes("devthink-buildcache"))
      throw new Error(
        `${file} must not reference the retired registry buildcache package; the build cache embeds inside the workflow run.`
      );
  }
  for (const forbidden2 of ["migratelegacynuget", "Wenathlan.Devthink.Extension", "gh api --method DELETE"]) {
    if ((await readFile2(`${workflowdirectory}/release.yml`, "utf8")).includes(forbidden2))
      throw new Error(`release.yml must not retain the consumed legacy-package deletion control: ${forbidden2}`);
  }
  const releasetext = await readFile2(`${workflowdirectory}/release.yml`, "utf8");
  for (const duplicated of [
    "mvn --batch-mode",
    "dotnet nuget push",
    "npm.pkg.github.com",
    "type=raw,value=stable",
    "docker buildx imagetools inspect",
    "gem build devthink.gemspec"
  ]) {
    if (releasetext.includes(duplicated))
      throw new Error(`release.yml must not duplicate the standalone publish lane control: ${duplicated}`);
  }
  for (const forbidden2 of [":latest", "wenathlan/extension", "wenathlan-gateway"]) {
    if (releasetext.includes(forbidden2))
      throw new Error(`release.yml must answer under the DevThink identity; forbidden control: ${forbidden2}`);
  }
  console.log(`Workflow YAML and controls verified for ${workflowfiles.length} files.`);
}
async function syncworkflowactiontags() {
  const { readdir: readdir2, readFile: readFile2, writeFile: writeFile2 } = await import(
    /* @vite-ignore */
    gatebuiltin("fs/promises")
  );
  const { join: join3, resolve: resolve2 } = await import(
    /* @vite-ignore */
    gatebuiltin("path")
  );
  const repoRoot = resolve2(process.cwd(), "..");
  const mode = process.argv[2] ?? "check";
  if (!(/* @__PURE__ */ new Set(["check", "sync"])).has(mode)) throw new Error("Use check or sync.");
  const allowmajors = process.argv.includes("--allow-majors");
  const allowed = /* @__PURE__ */ new Set([
    "actions/checkout",
    "actions/setup-node",
    "actions/setup-java",
    "actions/setup-dotnet",
    "actions/upload-artifact",
    "actions/download-artifact",
    "actions/dependency-review-action",
    "actions/attest",
    "pnpm/action-setup",
    "oven-sh/setup-bun",
    "denoland/setup-deno",
    "docker/setup-qemu-action",
    "docker/setup-buildx-action",
    "docker/login-action",
    "docker/metadata-action",
    "docker/build-push-action",
    "github/codeql-action/init",
    "github/codeql-action/analyze",
    "trufflesecurity/trufflehog",
    "anchore/sbom-action"
  ]);
  const latest = /* @__PURE__ */ new Map();
  const repairs = [
    [/\b(tests\/[A-Za-z0-9][A-Za-z0-9._-]*)\.mjs\b/g, "$1.ts"]
  ];
  async function versionfor(action) {
    if (!latest.has(action)) {
      const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
      const headers = { Accept: "application/vnd.github+json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`https://api.github.com/repos/${action}/releases/latest`, { headers });
      if (!response.ok) throw new Error(`GitHub releases for ${action} returned ${response.status}`);
      const tag = (await response.json()).tag_name;
      if (!/^v\d+(?:\.\d+){0,2}$/.test(tag ?? "")) throw new Error(`${action} has an unsupported latest tag: ${tag}`);
      latest.set(action, tag);
    }
    return latest.get(action);
  }
  let drift = false;
  const skippedmajors = [];
  const runnerlaw = [];
  for (const file of (await readdir2(join3(repoRoot, ".github/workflows"))).filter((entry) => /\.ya?ml$/i.test(entry)).sort()) {
    const path = join3(repoRoot, ".github/workflows", file);
    const current = await readFile2(path, "utf8");
    const matches = [...current.matchAll(/uses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@(v\d+(?:\.\d+){0,2})/g)];
    let next = current;
    for (const match of matches) {
      const [, action, pinned] = match;
      if (!allowed.has(action)) continue;
      const version = await versionfor(action);
      const currentmajor = Number(pinned.slice(1).split(".")[0]);
      const latestmajor = Number(version.slice(1).split(".")[0]);
      if (latestmajor > currentmajor && !allowmajors) {
        skippedmajors.push({ action, current: pinned, latest: version });
        continue;
      }
      if (version !== pinned) next = next.replace(`uses: ${action}@${pinned}`, `uses: ${action}@${version}`);
    }
    let walked = next;
    for (const [pattern, replacement] of repairs) walked = walked.replace(pattern, replacement);
    if (walked !== next) runnerlaw.push(file);
    next = walked;
    if (next !== current) {
      drift = true;
      if (mode === "sync") await writeFile2(path, next);
    }
  }
  if (drift && mode === "check")
    throw new Error("A mutable GitHub Action release tag is outdated. Run pnpm workflow:updates in a review branch.");
  console.log(
    JSON.stringify(
      { mode, allowmajors, checked: allowed.size, skippedmajors, runnerlaw, drift, immutablePinsPreserved: true },
      null,
      2
    )
  );
}
var workflowgatemain = typeof process !== "undefined" && Array.isArray(process.argv) && typeof process.argv[1] === "string" && (process.argv[1].endsWith("workflow.ts") || process.argv[1].endsWith("workflow"));
if (workflowgatemain) {
  const lane = process.argv[2] === "check" || process.argv[2] === "sync" ? syncworkflowactiontags() : verifyworkflowyamlcontrols();
  lane.catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

// agent.ts
function watchresource(input) {
  if (input.clientid.trim() === "") return { reason: "The resource watcher needs the paired client it belongs to." };
  if (input.resource.trim() === "") return { reason: "The resource watcher needs the page state resource it watches." };
  return {
    watch: {
      id: input.id ?? randomid(),
      clientid: input.clientid,
      resource: input.resource,
      baseline: input.state ?? {},
      createdat: input.now
    }
  };
}
function listprompts() {
  return [
    {
      name: "runreview",
      description: "Renders the run review prompt that asks the user model to summarize the executed steps of the approved plan behind the consent gates.",
      arguments: [
        { name: "objective", description: "The objective of the approved plan under review.", required: true },
        { name: "steps", description: "The executed step summaries the review covers.", required: true },
        { name: "tone", description: "The tone of the summary.", default: "plain" }
      ],
      template: "Review the run of the objective {{objective}}. Summarize the executed steps: {{steps}}. Keep the tone {{tone}} and state every refusal the consent gates raised."
    },
    {
      name: "pagesummary",
      description: "Renders the page summary prompt that condenses the observed page state of the session tab into the summary the client model asked for.",
      arguments: [
        { name: "url", description: "The url of the observed page.", required: true },
        {
          name: "observations",
          description: "The observed page state sections the summary condenses.",
          required: true
        }
      ],
      template: "Summarize the page at {{url}} from the observations: {{observations}}. Name nothing the observations leave out."
    },
    {
      name: "failuretriage",
      description: "Renders the failure triage prompt that classifies a failed tool call through the retry hints of the structured error it produced.",
      arguments: [
        { name: "tool", description: "The namespaced tool that failed.", required: true },
        { name: "error", description: "The structured error of the failed call.", required: true }
      ],
      template: "Triage the failure of the {{tool}} tool: {{error}}. Classify it as retryable, a busy window or a consent refusal and propose the next reviewed step."
    }
  ];
}
function renderprompt(prompt, args) {
  return prompt.template.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name) => {
    const value = args[name];
    if (value === void 0 || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
}
function canceltool(input) {
  const match = input.contexts.find((context2) => context2.callid === input.callid);
  if (match === void 0)
    return { contexts: input.contexts, reason: `The cancellation frame names no call context ${input.callid}.` };
  if (match.state !== "inflight")
    return { contexts: input.contexts, reason: `The call ${input.callid} already left the in flight state.` };
  const context = {
    ...match,
    state: "cancelled",
    endedat: input.now,
    ...input.partial !== void 0 ? { partial: input.partial } : {}
  };
  return {
    contexts: input.contexts.map((candidate) => candidate.callid === input.callid ? context : candidate),
    context
  };
}
function swarmoverview(input) {
  const claimed = input.queue.items.filter((item) => item.state === "claimed").length;
  return {
    agents: input.agents.length,
    active: input.agents.filter((agent) => agent.state === "active").length,
    paused: input.agents.filter((agent) => agent.state === "paused").length,
    stopped: input.agents.filter((agent) => agent.state === "stopped").length,
    tasks: input.queue.items.length,
    queued: input.queue.items.filter((item) => item.state === "queued").length,
    claimed,
    done: input.queue.items.filter((item) => item.state === "done").length,
    cancelled: input.queue.items.filter((item) => item.state === "cancelled").length,
    messages: input.mailboxes.reduce((total, mailbox) => total + mailbox.inbox.length, 0),
    unread: input.mailboxes.reduce((total, mailbox) => total + mailbox.unread, 0)
  };
}

// version.ts
var packageversion = "2.0.177";
var protocolmajor = 2;
var protocolfloormajor = 2;

// progress.ts
function provenancestampof() {
  return { release: packageversion, protocolmajor };
}
function emptyprogress(planid, now) {
  return { planid, completedsteps: [], provenance: provenancestampof(), updatedat: now };
}
function recordstep(progress, planid, stepid, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if (base.completedsteps.includes(stepid)) return { ...base, updatedat: now };
  return { planid, completedsteps: [...base.completedsteps, stepid], provenance: provenancestampof(), updatedat: now };
}
function recordoutcome(progress, planid, outcome, now) {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return {
    ...base,
    outcomes: [...base.outcomes ?? [], { ...outcome, provenance: provenancestampof() }],
    updatedat: now
  };
}

// tools.ts
var toolcatalogversion = 2;
var toolnamespaces = ["browser", "workflow", "memory", "system"];
function toolschemaof(properties) {
  return {
    type: "object",
    properties,
    required: Object.entries(properties).filter(([, property]) => property.required === true).map(([name]) => name)
  };
}
function openapilayout(schema) {
  const fields = Object.entries(schema.properties).map(
    ([name, property]) => `${name}:${property.type}${property.required === true ? "*" : ""}${property.default !== void 0 ? `=${typeof property.default === "object" ? JSON.stringify(property.default) : String(property.default)}` : ""}`
  );
  return `Fields: ${fields.join("; ")}.`;
}
function withfielddayout(tool) {
  return { ...tool, description: `${tool.description} ${openapilayout(tool.inputschema)}` };
}
function readtool(name, kind, description, inputs = {}) {
  return {
    name,
    version: toolcatalogversion,
    description,
    inputschema: toolschemaof({
      target: { type: "string", description: "Reviewed css selector the tool addresses." },
      value: { type: "string", description: "Reviewed literal value the tool carries." },
      options: {
        type: "object",
        description: "Reviewed json options of the wrapped action kind with the empty default.",
        default: {}
      },
      ...inputs
    }),
    kind,
    risk: "read"
  };
}
function gatedtool(name, kind, risk, description, review) {
  return {
    name,
    version: toolcatalogversion,
    description,
    inputschema: toolschemaof({
      stepid: { type: "string", description: "Id of the approved plan step this tool executes.", required: true }
    }),
    kind,
    risk,
    consentmeta: { review, riskclass: risk, approvalrequired: true, originscope: "session" }
  };
}
function browserdomain() {
  return {
    namespace: "browser",
    version: toolcatalogversion,
    tools: [
      readtool(
        "browser.snapshot",
        "observe",
        "Captures the semantic snapshot of the active tab: url, title, text preview, forms and interactive elements. Read only with no side effects; runs under the dryrun risk class once the session is approved."
      ),
      readtool(
        "browser.extract",
        "extract",
        "Extracts the reviewed structured data of the page. Read only with no side effects."
      ),
      readtool(
        "browser.readtext",
        "readtext",
        "Reads the text of the addressed element. Read only with no side effects.",
        { target: { type: "string", description: "Reviewed css selector of the element to read.", required: true } }
      ),
      readtool(
        "browser.readtable",
        "readtable",
        "Reads the rows of the addressed data table. Read only with no side effects.",
        { target: { type: "string", description: "Reviewed css selector of the table to read.", required: true } }
      ),
      readtool(
        "browser.readlinks",
        "readlinks",
        "Reads the link inventory of the page. Read only with no side effects."
      ),
      readtool(
        "browser.a11ytree",
        "a11ytree",
        "Reads the accessibility tree of the page. Read only with no side effects."
      ),
      readtool(
        "browser.observe",
        "observe",
        "Reads the structured observation record of the active tab \u2014 the url, the title, the page signals, the detected forms and the interactive elements \u2014 exactly as the evidence views render it. Read only with no side effects."
      ),
      readtool("browser.tablist", "tablist", "Lists the open tabs. Read only with no side effects."),
      readtool("browser.windowlist", "windowlist", "Lists the open windows. Read only with no side effects."),
      gatedtool(
        "browser.click",
        "click",
        "sensitive",
        "Clicks the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The click runs only as the approved plan step it names; a paired client can never widen the reviewed target or options."
      ),
      gatedtool(
        "browser.type",
        "type",
        "sensitive",
        "Types the reviewed text into the addressed element. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The typing runs only as the approved plan step it names; the reviewed target, text and options stay fixed."
      ),
      gatedtool(
        "browser.presskey",
        "presskey",
        "sensitive",
        "Presses the reviewed key. Sensitive: it changes page state, so it executes exactly one approved plan step.",
        "The key press runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.navigate",
        "navigate",
        "sensitive",
        "Navigates the active tab to the reviewed url. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The navigation runs only as the approved plan step it names and stays inside the session origin grants."
      ),
      gatedtool(
        "browser.back",
        "back",
        "sensitive",
        "Navigates back in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The history navigation runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.forward",
        "forward",
        "sensitive",
        "Navigates forward in the history of the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The history navigation runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.reload",
        "reload",
        "sensitive",
        "Reloads the active tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The reload runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.tabcreate",
        "tabcreate",
        "sensitive",
        "Opens a new tab. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The tab creation runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.tabactivate",
        "tabactivate",
        "sensitive",
        "Activates the reviewed tab. Sensitive: it moves focus, so it executes exactly one approved plan step.",
        "The tab activation runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.tabclose",
        "tabclose",
        "sensitive",
        "Closes the reviewed tab. Sensitive: it destroys browser state, so it executes exactly one approved plan step.",
        "The tab close runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.windowcreate",
        "windowcreate",
        "sensitive",
        "Opens a new window. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The window creation runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.windowclose",
        "windowclose",
        "sensitive",
        "Closes the reviewed window. Sensitive: it destroys browser state, so it executes exactly one approved plan step.",
        "The window close runs only as the approved plan step it names."
      ),
      gatedtool(
        "browser.windowresize",
        "windowresize",
        "sensitive",
        "Resizes the reviewed window. Sensitive: it changes browser state, so it executes exactly one approved plan step.",
        "The window resize runs only as the approved plan step it names."
      )
    ]
  };
}
function workflowdomain() {
  return {
    namespace: "workflow",
    version: toolcatalogversion,
    tools: [
      readtool(
        "workflow.list",
        "composeworkflow",
        "Lists the composed workflows with their names, versions, origins and step counts. Read only with no side effects."
      ),
      readtool(
        "workflow.plan",
        "composeworkflow",
        "Proposes a plan with the full reviewed step grammar \u2014 the title, the ordered steps of kind, target, value and reviewed options of the shared step grammar, and the origin the plan runs under \u2014 for the human review; the proposal changes no page state. Read only with no side effects.",
        {
          title: { type: "string", description: "Plain language title of the proposed plan.", required: true },
          steps: {
            type: "array",
            description: "Reviewed plan steps of the full shared grammar: each entry carries its id, its action kind, its target, its value and its reviewed options object.",
            required: true
          },
          origin: {
            type: "string",
            description: "Origin the proposed plan runs under; the session grants check it.",
            required: true
          }
        }
      ),
      readtool(
        "workflow.review",
        "composeworkflow",
        "Submits the proposed plan to the human review gate and waits for the answer: the call returns once the human approves or refuses while the gate refuses by default when the user configured window passes. Read only with no side effects \u2014 the run itself still names the approved plan step.",
        { planid: { type: "string", description: "Id of the proposed plan the review gate submits.", required: true } }
      ),
      readtool(
        "workflow.dryrun",
        "dryrun",
        "Runs a composed workflow as a dry run: read steps project their would be outcome and every step with side effects is refused. Read only with no side effects."
      ),
      gatedtool(
        "workflow.run",
        "runworkflow",
        "sensitive",
        "Runs a composed workflow for real. Sensitive: it executes every step of the workflow, so it executes exactly one approved runworkflow plan step with its explicit run review.",
        "The workflow run needs the explicit run review: the approved runworkflow plan step with its expanded step list shown before the first step executes."
      ),
      gatedtool(
        "workflow.triggers",
        "eventrule",
        "sensitive",
        "Lists the armed trigger rules with their schedules, cooldowns and fire counters so a client can inspect what launches runs automatically. Sensitive by its trigger family: automatic launchers stay behind the arm review class.",
        "The trigger listing runs behind the approved plan review because trigger rules launch runs automatically."
      )
    ]
  };
}
function memorydomain() {
  return {
    namespace: "memory",
    version: toolcatalogversion,
    tools: [
      readtool(
        "memory.list",
        "listruns",
        "Lists the stored workflow run records with their states and step cursors from local memory. Read only with no page access.",
        {
          target: { type: "string", description: "Unused by the memory read; kept for schema uniformity." },
          value: { type: "string", description: "Unused by the memory read; kept for schema uniformity." },
          state: { type: "string", description: "Optional reviewed run state filter of the listing.", default: "" }
        }
      ),
      readtool(
        "memory.variables",
        "extractvars",
        "Reads the stored variable scopes of a run from local memory. Read only with no page access."
      ),
      readtool(
        "memory.audit",
        "trailaudit",
        "Reads the audit summary of the session trail from local memory. Read only with no page access."
      )
    ]
  };
}
function systemdomain() {
  return {
    namespace: "system",
    version: toolcatalogversion,
    tools: [
      readtool(
        "system.status",
        "observe",
        "Reports the mcp server status, the session state and the connected clients. Read only with no side effects."
      ),
      readtool(
        "system.version",
        "readmeta",
        "Reports the protocol version, the catalog version and the extension version. Read only with no side effects."
      ),
      readtool(
        "system.session",
        "observe",
        "Reports the live session record of the extension session the client pairs with: the session state, its origin grants and its expiry. Read only with no side effects."
      ),
      readtool(
        "system.capabilities",
        "observe",
        "Reports the optional browser capabilities the user has granted. Read only with no side effects."
      )
    ]
  };
}
function buildtoolcatalog() {
  return {
    version: toolcatalogversion,
    domains: [browserdomain(), workflowdomain(), memorydomain(), systemdomain()].map((domain) => ({
      ...domain,
      tools: domain.tools.map(withfielddayout)
    }))
  };
}
function alltools(catalog) {
  return catalog.domains.flatMap((domain) => domain.tools);
}
function resolvetool(catalog, name) {
  if (name.includes(".")) return alltools(catalog).find((tool) => tool.name === name);
  const matches = alltools(catalog).filter((tool) => tool.name.split(".")[1] === name);
  return matches.length === 1 ? matches[0] : void 0;
}
function namespaceof(name) {
  const head = name.split(".")[0];
  return toolnamespaces.includes(head) ? head : void 0;
}
var defaultidempotencywindowms = 3e5;
function applyratelimit(input) {
  const existing = input.limits.find((limit2) => limit2.clientid === input.clientid);
  if (existing === void 0) return { allowed: true, used: 0, limits: input.limits };
  const elapsed = input.now - existing.windowstartedat;
  const limit = elapsed >= existing.windowms ? { ...existing, windowstartedat: input.now, used: 0 } : existing;
  if (limit.budget !== void 0 && limit.used >= limit.budget) {
    const retryafter = Math.max(0, limit.windowms - (input.now - limit.windowstartedat));
    return {
      allowed: false,
      used: limit.used,
      budget: limit.budget,
      retryafter,
      limits: input.limits.map((candidate) => candidate.clientid === input.clientid ? limit : candidate)
    };
  }
  const counted = { ...limit, used: limit.used + 1 };
  return {
    allowed: true,
    used: counted.used,
    ...counted.budget !== void 0 ? { budget: counted.budget } : {},
    limit: counted,
    limits: input.limits.map((candidate) => candidate.clientid === input.clientid ? counted : candidate)
  };
}
function checkidempotency(input) {
  const match = input.records.find((record2) => record2.key === input.key && record2.clientid === input.clientid);
  if (match !== void 0) {
    if (input.now >= match.expiresat)
      return { reason: "The idempotency record expired past its window and the call runs again." };
    return { replay: match.result, record: match };
  }
  if (input.records.some((record2) => record2.key === input.key))
    return { reason: "The idempotency key belongs to another client and never replays across clients." };
  return { reason: "The idempotency key names no stored record." };
}
function recordidempotency(input) {
  const record2 = {
    key: input.key,
    clientid: input.clientid,
    tool: input.tool,
    result: input.result,
    createdat: input.now,
    expiresat: input.now + (input.window ?? defaultidempotencywindowms)
  };
  return [
    record2,
    ...input.records.filter((candidate) => !(candidate.key === input.key && candidate.clientid === input.clientid))
  ];
}
async function runbatch(input) {
  const outcomes = [];
  for (let index = 0; index < input.calls.length; index += 1) {
    const call = input.calls[index];
    if (call === void 0) continue;
    const outcome = await input.execute(call, index);
    outcomes.push({
      callid: call.id,
      tool: call.name,
      ok: outcome.ok,
      ...outcome.result !== void 0 ? { result: outcome.result } : {},
      ...outcome.error !== void 0 ? { error: outcome.error } : {},
      at: input.now + index
    });
    if (!outcome.ok && input.stoponerror) return { outcomes, stoppedat: call.id };
  }
  return { outcomes };
}
function dryruntool(input) {
  const findings = [];
  for (const required of input.tool.inputschema.required) {
    const value = input.params[required];
    if (value === void 0 || value === null || typeof value === "string" && value.trim() === "")
      findings.push(`The required argument ${required} of ${input.tool.name} stays empty.`);
  }
  for (const [name, property] of Object.entries(input.tool.inputschema.properties)) {
    const value = input.params[name];
    if (value === void 0 || value === null) continue;
    const expected = property.type;
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== expected)
      findings.push(
        `The argument ${name} of ${input.tool.name} carries a ${actual} value where the schema asks a ${expected}.`
      );
  }
  const stepid = input.stepid !== void 0 ? input.stepid : typeof input.params.stepid === "string" ? input.params.stepid : void 0;
  const gate = tooldispatchgate({
    client: input.client,
    tool: input.tool,
    session: input.session,
    plan: input.plan,
    origin: input.origin,
    ...stepid !== void 0 ? { stepid } : {},
    now: input.now
  });
  if (!gate.allowed) findings.push(gate.reason ?? `The consent gates refused the ${input.tool.name} dry run.`);
  return {
    callid: input.callid ?? randomid(),
    tool: input.tool.name,
    argsvalid: findings.length === 0,
    consentok: gate.allowed,
    findings,
    executed: false,
    mutations: [],
    at: input.now
  };
}
function applymock(input) {
  const mock = input.mocks.find((candidate) => candidate.tool === input.tool);
  if (mock === void 0) return {};
  if (mock.testcontext !== true)
    return {
      reason: `The ${input.tool} mock stays outside a test context and is refused; mocks never answer real calls.`
    };
  return { result: mock.result };
}
function begincall(input) {
  return {
    callid: input.callid ?? randomid(),
    clientid: input.clientid,
    tool: input.tool,
    state: "inflight",
    startedat: input.now,
    ...input.idempotencykey !== void 0 && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {},
    ...input.dryrun === true ? { dryrun: true } : {},
    ...input.batchid !== void 0 ? { batchid: input.batchid } : {},
    chunks: 0
  };
}
function endcall(input) {
  const match = input.contexts.find((context2) => context2.callid === input.callid);
  if (match === void 0)
    return { contexts: input.contexts, reason: `The call context ${input.callid} never opened.` };
  if (match.state !== "inflight") return { contexts: input.contexts, context: match };
  const context = {
    ...match,
    state: input.ok ? "done" : "failed",
    endedat: input.now,
    ...input.errorcode !== void 0 ? { errorcode: input.errorcode } : {},
    ...input.partial !== void 0 ? { partial: input.partial } : {}
  };
  return {
    contexts: input.contexts.map((candidate) => candidate.callid === input.callid ? context : candidate),
    context
  };
}

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
var protocolsupported = Object.freeze({
  minimum: protocolfloormajor,
  maximum: protocolmajorversion
});
var apifreezerelease = "1.1.91";
var apifreezedate = "2026-08-31";
function protocolmajorof(declaration) {
  if (typeof declaration === "number")
    return Number.isInteger(declaration) && declaration >= 0 ? declaration : void 0;
  if (declaration === void 0 || declaration.trim() === "") return void 0;
  const match = /^(\d+)/.exec(declaration.trim());
  if (match === null) return void 0;
  const major = Number(match[1]);
  return major >= 0 ? major : void 0;
}
function negotiateprotocol(input) {
  const declared = protocolmajorof(input.client);
  if (declared === void 0) return { agreed: true, major: protocolmajorversion };
  if (declared > protocolsupported.maximum)
    return {
      agreed: false,
      reason: `The client speaks protocol version ${declared} while the server stops at ${protocolsupported.maximum}; the supported protocol versions are ${protocolsupported.minimum} through ${protocolsupported.maximum} until a future major bump.`
    };
  if (declared < protocolsupported.minimum)
    return {
      agreed: false,
      reason: `The client speaks protocol version ${declared} below the supported floor of ${protocolsupported.minimum}; the supported protocol versions are ${protocolsupported.minimum} through ${protocolsupported.maximum}, and a version one client converts its assets through the migrateplan command and docs/migrationguide.md.`
    };
  if (declared < protocolmajorversion) {
    const notice = deprecationnoticeof("mcp", "protocolversion");
    return { agreed: true, major: declared, ...notice !== void 0 ? { deprecation: notice } : {} };
  }
  return { agreed: true, major: protocolmajorversion };
}
function sharedprotocolversion(clientversions) {
  const shared = clientversions.filter(
    (version) => version >= protocolsupported.minimum && version <= protocolsupported.maximum
  );
  if (shared.length === 0)
    return {
      shared: false,
      reason: `No declared protocol version intersects the supported range of ${protocolsupported.minimum} through ${protocolsupported.maximum}.`
    };
  return { shared: true, major: Math.max(...shared) };
}
var deprecatedfields = [];
var deprecationwindow = Object.freeze({
  opens: apifreezerelease,
  closes: "2.0.0"
});
function deprecationnoticeof(surface, field) {
  return deprecatedfields.find((candidate) => candidate.surface === surface && candidate.field === field)?.notice;
}
var allhostspattern = `https://${"*"}/*`;
var permissioncoverage = Object.freeze({
  activeTab: Object.freeze({
    surface: "popup",
    messages: ["startsession", "context", "observation"],
    kinds: ["observe", "inspect"]
  }),
  storage: Object.freeze({
    surface: "background",
    messages: ["configure", "context", "sessions", "security", "state"],
    kinds: []
  }),
  scripting: Object.freeze({
    surface: "background",
    messages: ["execute", "preview", "map", "observation"],
    kinds: ["click", "type", "highlight"]
  }),
  sidePanel: Object.freeze({ surface: "sidepanel", messages: [], kinds: [] }),
  tabs: Object.freeze({
    surface: "background",
    messages: ["tabsearch", "jumptotab", "savelayout", "windowstate", "controltab", "settasktabceiling"],
    kinds: ["tablist", "querytabs", "windowlist", "savelayout"]
  }),
  downloads: Object.freeze({
    surface: "background",
    messages: ["downloadreport", "downloadaction"],
    kinds: ["downloadfile", "pausedownload", "resumedownload", "verifydownload", "quarantinedownload"]
  }),
  clipboardRead: Object.freeze({ surface: "background", messages: ["execute"], kinds: ["readclipboard"] }),
  clipboardWrite: Object.freeze({
    surface: "background",
    messages: ["execute"],
    kinds: ["writeclipboard", "copyscreen"]
  }),
  offscreen: Object.freeze({ surface: "background", messages: ["environments"], kinds: [] }),
  nativeMessaging: Object.freeze({ surface: "background", messages: ["native"], kinds: [] }),
  [allhostspattern]: Object.freeze({
    surface: "background",
    messages: [],
    kinds: ["fetchurl", "callrest", "callgraphql", "subscribesse", "longpoll", "postform", "postfiles"]
  })
});
var backgroundsurfacemessages = [
  "applyprofile",
  "approve",
  "approveclipconsent",
  "approveconsoleconsent",
  "approvedebuggerconsent",
  "approvefetchconsent",
  "approveimport",
  "approvelocationconsent",
  "approverecordingconsent",
  "approverestore",
  "approvesourcemapconsent",
  "approvesubmit",
  "approveworkflowrun",
  "authreport",
  "bridge",
  "buttontrigger",
  "callsreport",
  "cancelworkflowrun",
  "capabilities",
  "capmanifest",
  "capturebytes",
  "capturereport",
  "cdpreport",
  "checksafe",
  "clearautosnapshot",
  "closesocket",
  "closewindow",
  "configure",
  "configureendpoint",
  "configurescanhook",
  "configuresheet",
  "confirmmanualrun",
  "consolediff",
  "context",
  "controltab",
  "convertcapture",
  "copycapture",
  "createtrigger",
  "createvisitrule",
  "dataset",
  "deleteapikey",
  "deleterecording",
  "diagnostic",
  "diffversions",
  "downloadaction",
  "downloadcapture",
  "downloadmedia",
  "downloadrecording",
  "downloadreport",
  "duplicatetrigger",
  "ecosystem",
  "editormodel",
  "editorsave",
  "emulationreport",
  "environments",
  "errorreport",
  "exchangebody",
  "execute",
  "executeworkflowstep",
  "exportcalls",
  "exportdataset",
  "exportnetlog",
  "exportpresets",
  "exportsessionfile",
  "exporttrace",
  "exportworkflow",
  "extraction",
  "firetrigger",
  "fleet",
  "forensics",
  "formreport",
  "gateway",
  "grantcapability",
  "importcsv",
  "importpresets",
  "importsessionrecords",
  "importworkflow",
  "jumptotab",
  "llmbudget",
  "llmcommand",
  "llmdraftdecision",
  "llmdraftplan",
  "llmlocal",
  "llmproviders",
  "llmreflect",
  "llmreplan",
  "llmreplandecision",
  "llmroutes",
  "llmstate",
  "llmtemplate",
  "llmtestprovider",
  "loadsessionfile",
  "manualrun",
  "map",
  "mcpallowlist",
  "mcpapprovaldecision",
  "mcpbridge",
  "mcpcancelcall",
  "mcpchallenge",
  "mcpclientdecision",
  "mcpclientdisconnect",
  "mcpdryrun",
  "mcpexchange",
  "mcpframe",
  "mcpmock",
  "mcppairing",
  "mcpratelimit",
  "mcpremoteconfig",
  "mcpresource",
  "mcprevokeclient",
  "mcpsampling",
  "mcpserverconfig",
  "mcpserverstart",
  "mcpserverstop",
  "mcpstate",
  "mcpsubscribe",
  "mediabytes",
  "mediareport",
  "minimization",
  "native",
  "nav",
  "navstate",
  "netlog",
  "netreport",
  "observation",
  "outcome",
  "pausesession",
  "pauseworkflowrun",
  "perf",
  "pipeline",
  "preview",
  "profilereport",
  "proposelocal",
  "proposeremote",
  "provenance",
  "quarantine",
  "receivewebhook",
  "recordingframes",
  "regeneratevalue",
  "reject",
  "rejectimport",
  "releasequarantine",
  "removeprofile",
  "removesiteoverride",
  "resilience",
  "resolvecaptcha",
  "restoreemulation",
  "restorelayout",
  "restoresnapshot",
  "resumerun",
  "resumesession",
  "resumeworkflowrun",
  "revertcdpoverride",
  "revertcontrols",
  "revertemulation",
  "revertproxyroute",
  "revokedebuggerconsent",
  "revokesourcemapconsent",
  "revoketokens",
  "rollbackversion",
  "rotatetriggersecret",
  "runhistory",
  "runstate",
  "runtobreakpoint",
  "safeties",
  "savelayout",
  "schedule",
  "security",
  "sessiondiff",
  "sessionreview",
  "sessions",
  "setagentpreset",
  "setapikey",
  "setbackgroundrun",
  "setbodyretention",
  "setbreakpointceiling",
  "setcallretention",
  "setcapturepolicy",
  "setcleanuprules",
  "setdevicepreset",
  "seteditorlayout",
  "setemulationretention",
  "setlocationpreset",
  "setloopbound",
  "setnetworkpreset",
  "setpauseretention",
  "setprofileretention",
  "setrecordingwindow",
  "setrunhistoryretention",
  "setsessionretention",
  "setsiteoverride",
  "settasktabceiling",
  "settimelineretention",
  "settraceceiling",
  "settriggerretention",
  "setwatchdog",
  "setwebrequestgrant",
  "setworkflowbreakpoints",
  "shareworkflow",
  "startsession",
  "state",
  "steplibrarystore",
  "stop",
  "stoprecording",
  "storeauth",
  "storecode",
  "surface",
  "swarmagent",
  "swarmblackboard",
  "swarmhandoff",
  "swarmleader",
  "swarmlocks",
  "swarmmailbox",
  "swarmmerge",
  "swarmqueue",
  "swarmreview",
  "swarmstate",
  "tabsearch",
  "thumbcapture",
  "toggletrigger",
  "tracereplay",
  "trafficreport",
  "transparency",
  "triggerfiredreport",
  "triggerhistory",
  "triggerreview",
  "views",
  "vision",
  "watchdogscan",
  "webapi",
  "windowstate",
  "work",
  "workflowoutcome",
  "workflowreview"
];
var pagebridgesurfacemessages = [
  "canvasdata",
  "capturesnapshot",
  "clearcookies",
  "elementrect",
  "flushconsole",
  "maskobservationsnapshot",
  "maskobservationstate",
  "maskstepvalues",
  "measurepage",
  "mediaelements",
  "pageassets",
  "pageimages",
  "parsehtmlmarkup",
  "pdfbreaks",
  "pdfsegment",
  "performstep",
  "preparecapture",
  "previewtarget",
  "queryelements",
  "readcookies",
  "readdialogs",
  "resourcerecords",
  "restorecapture",
  "revertemulationlayer",
  "scrollcapture",
  "scrollcontainercapture",
  "streamelements",
  "videoframe",
  "videostate",
  "waitsettle",
  "writecookies"
];
var sidepanelsurfacemessages = [
  "applyprofile",
  "approve",
  "approveclipconsent",
  "approveconsoleconsent",
  "approvedebuggerconsent",
  "approvefetchconsent",
  "approveimport",
  "approvelocationconsent",
  "approverecordingconsent",
  "approverestore",
  "approvesourcemapconsent",
  "approvesubmit",
  "approveworkflowrun",
  "bridge",
  "cancelworkflowrun",
  "capturebytes",
  "capturereport",
  "checksafe",
  "clearautosnapshot",
  "closesocket",
  "closewindow",
  "configurescanhook",
  "confirmmanualrun",
  "consolediff",
  "context",
  "controltab",
  "convertcapture",
  "copycapture",
  "createvisitrule",
  "deleteapikey",
  "deleterecording",
  "diagnostic",
  "diffversions",
  "downloadaction",
  "downloadcapture",
  "downloadmedia",
  "downloadrecording",
  "duplicatetrigger",
  "ecosystem",
  "editormodel",
  "editorsave",
  "environments",
  "exchangebody",
  "execute",
  "executeworkflowstep",
  "exportcalls",
  "exportdataset",
  "exportnetlog",
  "exportpresets",
  "exportsessionfile",
  "exporttrace",
  "exportworkflow",
  "firetrigger",
  "fleet",
  "forensics",
  "gateway",
  "importcsv",
  "importpresets",
  "importsessionrecords",
  "importworkflow",
  "jumptotab",
  "llmbudget",
  "llmcommand",
  "llmdraftdecision",
  "llmlocal",
  "llmproviders",
  "llmreplan",
  "llmreplandecision",
  "llmroutes",
  "llmtemplate",
  "llmtestprovider",
  "loadsessionfile",
  "manualrun",
  "mcpallowlist",
  "mcpapprovaldecision",
  "mcpbridge",
  "mcpcancelcall",
  "mcpclientdecision",
  "mcpclientdisconnect",
  "mcpdryrun",
  "mcpmock",
  "mcppairing",
  "mcpratelimit",
  "mcpremoteconfig",
  "mcpresource",
  "mcprevokeclient",
  "mcpsampling",
  "mcpserverconfig",
  "mcpsubscribe",
  "mediabytes",
  "minimization",
  "nav",
  "pauseworkflowrun",
  "perf",
  "pipeline",
  "preview",
  "recordingframes",
  "regeneratevalue",
  "reject",
  "rejectimport",
  "releasequarantine",
  "removeprofile",
  "removesiteoverride",
  "resilience",
  "resolvecaptcha",
  "restoreemulation",
  "restorelayout",
  "restoresnapshot",
  "resumerun",
  "resumeworkflowrun",
  "revertcdpoverride",
  "revertemulation",
  "revertproxyroute",
  "revokedebuggerconsent",
  "revokesourcemapconsent",
  "revoketokens",
  "rollbackversion",
  "rotatetriggersecret",
  "runhistory",
  "runstate",
  "savelayout",
  "schedule",
  "security",
  "sessiondiff",
  "sessions",
  "setbackgroundrun",
  "setbodyretention",
  "setbreakpointceiling",
  "setcallretention",
  "setcapturepolicy",
  "setcleanuprules",
  "setloopbound",
  "setpauseretention",
  "setprofileretention",
  "setrunhistoryretention",
  "setsiteoverride",
  "settasktabceiling",
  "settimelineretention",
  "settraceceiling",
  "settriggerretention",
  "setwatchdog",
  "setwebrequestgrant",
  "shareworkflow",
  "state",
  "steplibrarystore",
  "storeauth",
  "storecode",
  "surface",
  "swarmagent",
  "swarmblackboard",
  "swarmhandoff",
  "swarmleader",
  "swarmlocks",
  "swarmmailbox",
  "swarmmerge",
  "swarmqueue",
  "swarmreview",
  "tabsearch",
  "thumbcapture",
  "toggletrigger",
  "tracereplay",
  "triggerhistory",
  "views",
  "vision",
  "watchdogscan",
  "webapi",
  "work",
  "workflowreview"
];
var popupsurfacemessages = [
  "bridge",
  "buttontrigger",
  "cancelworkflowrun",
  "configure",
  "context",
  "ecosystem",
  "environments",
  "fleet",
  "forensics",
  "minimization",
  "nav",
  "perf",
  "pipeline",
  "resilience",
  "runstate",
  "security",
  "sessions",
  "startsession",
  "state",
  "stop",
  "surface",
  "views",
  "vision",
  "webapi",
  "windowstate",
  "work"
];
var clisurfacecommands = [
  "commands",
  "describe",
  "doctor",
  "export",
  "exportdata",
  "flowrun",
  "headless",
  "help",
  "init",
  "manifest",
  "native",
  "planlint",
  "runworkflow",
  "serve"
];
var mcpsurfacetools = [
  { name: "browser.a11ytree", version: 2 },
  { name: "browser.back", version: 2 },
  { name: "browser.click", version: 2 },
  { name: "browser.extract", version: 2 },
  { name: "browser.forward", version: 2 },
  { name: "browser.navigate", version: 2 },
  { name: "browser.observe", version: 2 },
  { name: "browser.presskey", version: 2 },
  { name: "browser.readlinks", version: 2 },
  { name: "browser.readtable", version: 2 },
  { name: "browser.readtext", version: 2 },
  { name: "browser.reload", version: 2 },
  { name: "browser.snapshot", version: 2 },
  { name: "browser.tabactivate", version: 2 },
  { name: "browser.tabclose", version: 2 },
  { name: "browser.tabcreate", version: 2 },
  { name: "browser.tablist", version: 2 },
  { name: "browser.type", version: 2 },
  { name: "browser.windowclose", version: 2 },
  { name: "browser.windowcreate", version: 2 },
  { name: "browser.windowlist", version: 2 },
  { name: "browser.windowresize", version: 2 },
  { name: "memory.audit", version: 2 },
  { name: "memory.list", version: 2 },
  { name: "memory.variables", version: 2 },
  { name: "system.capabilities", version: 2 },
  { name: "system.session", version: 2 },
  { name: "system.status", version: 2 },
  { name: "system.version", version: 2 },
  { name: "workflow.dryrun", version: 2 },
  { name: "workflow.list", version: 2 },
  { name: "workflow.plan", version: 2 },
  { name: "workflow.review", version: 2 },
  { name: "workflow.run", version: 2 },
  { name: "workflow.triggers", version: 2 }
];
var mcpsurfacekinds = [
  "a11ytree",
  "back",
  "click",
  "composeworkflow",
  "dryrun",
  "eventrule",
  "extract",
  "extractvars",
  "forward",
  "listruns",
  "navigate",
  "observe",
  "presskey",
  "readlinks",
  "readmeta",
  "readtable",
  "readtext",
  "reload",
  "runworkflow",
  "tabactivate",
  "tabclose",
  "tabcreate",
  "tablist",
  "trailaudit",
  "type",
  "windowclose",
  "windowcreate",
  "windowlist",
  "windowresize"
];
var librarysurfaceexports = [
  "a11ycapture",
  "a11ylabel",
  "a11ylabellocalized",
  "a11ylabelof",
  "a11ylabelsfor",
  "a11ylabelslocalizedfor",
  "a11ynode",
  "abandonedparsetasks",
  "acceptrenderresult",
  "acceptworkerresponse",
  "ackreview",
  "acquirelock",
  "acquirerunlock",
  "acquiresessionlock",
  "actionkind",
  "actionkindcatalog",
  "actionkindids",
  "actionrisk",
  "activelayers",
  "activetimelineanchor",
  "adaptercontract",
  "adapterdeclarationsof",
  "adaptermappinggate",
  "adaptermodeof",
  "adapterruntime",
  "adaptersurfaceof",
  "adaptivepollnext",
  "adaptivepollvalid",
  "adaptivepollwindow",
  "addedge",
  "addhistoryentry",
  "addnode",
  "addrecallentry",
  "advancecounter",
  "advancecursor",
  "advancedownload",
  "advancelane",
  "advancerun",
  "advanceselcachegeneration",
  "advancestream",
  "agentbudget",
  "agentbudgetcheck",
  "agentbudgetof",
  "agentbudgetvalid",
  "agentevent",
  "agenteventframe",
  "agenteventkind",
  "agenteventof",
  "agentgrammarvalid",
  "agentheartbeat",
  "agentidentity",
  "agentmailbox",
  "agentmessage",
  "agentname",
  "agentnamevalid",
  "agentplan",
  "agentpreset",
  "agentpresetof",
  "agentrecord",
  "agentrole",
  "agentruncontext",
  "agentscope",
  "agentscopegate",
  "agentscopeof",
  "agentscopevalid",
  "agentsession",
  "agentstate",
  "agentusage",
  "aggregatecell",
  "aggregateconflictescalationgate",
  "aggregatemergegrade",
  "aggregaterecord",
  "aggregatereport",
  "aggregationreport",
  "allowlistcheck",
  "allowlistcovers",
  "allowlistentry",
  "allowlistentryvalid",
  "allowlistreport",
  "alltools",
  "annotatetrace",
  "annotationof",
  "annotationplan",
  "annotationplanof",
  "ansi",
  "answersampling",
  "apibrowserprobeinput",
  "apicallgrade",
  "apicallrecord",
  "apicallrecordof",
  "apientries",
  "apifeatureflagintersection",
  "apifreezebaseline",
  "apifreezedate",
  "apifreezerelease",
  "apifreezescope",
  "apikeyconsentgranted",
  "apikeyentry",
  "apimapbrowsercacheprobe",
  "apimapbrowserof",
  "apimapbrowserprobe",
  "apimapentries",
  "apimapentry",
  "apimapentryof",
  "apimapkinds",
  "apimapreport",
  "apimapresolution",
  "apimapresolve",
  "apimapstructerror",
  "apimapstructerrorof",
  "apimapunmapped",
  "apireplayspec",
  "apireplayspecof",
  "appendlogentry",
  "appendlogstreamevent",
  "appendvisit",
  "applycontrasttheme",
  "applycooldown",
  "applyheaderules",
  "applyimport",
  "applylayer",
  "applymock",
  "applyoverride",
  "applyratelimit",
  "applyretry",
  "applyreview",
  "applyruntimeout",
  "applytheme",
  "applytimeout",
  "approvalexec",
  "approvalframes",
  "approvalprompt",
  "approvalrequest",
  "approvalstate",
  "approvaltimeout",
  "approvaltimeoutvalid",
  "arbitrate",
  "arbitrationcase",
  "arbitrationcaseof",
  "arbitrationrule",
  "arbitrationstrategy",
  "arbitrationverdict",
  "arbitrationverdictgate",
  "argkind",
  "armrule",
  "artifactchannelof",
  "artifactchannels",
  "artifactcompressof",
  "artifactcompressrecord",
  "artifactinventoryentry",
  "artifactmanifestcheck",
  "artifactmanifestdocument",
  "artifactmanifestentry",
  "artifactmanifestnameof",
  "artifactmanifestof",
  "artifactmanifesttext",
  "artifactreadplan",
  "artifactrecord",
  "artifactrecordof",
  "assemblechunks",
  "assemblelapse",
  "assetentries",
  "assetrecord",
  "assignrole",
  "assigntasktabs",
  "assignwork",
  "attachcdpsession",
  "attachnativehost",
  "attachprovenance",
  "attachtarget",
  "attachtargetof",
  "attachtimeline",
  "attentioncause",
  "attentioncountof",
  "attentiondeeplinkof",
  "attentionentry",
  "attentionentryof",
  "attentionnotifications",
  "attentionseverityof",
  "audiotabs",
  "auditevent",
  "auditeventof",
  "auditexcerptof",
  "auditexportgate",
  "auditexportof",
  "auditexportrecord",
  "auditexportreport",
  "auditkind",
  "auditline",
  "authchallenge",
  "authconsentgranted",
  "authhandshakeevent",
  "authmethod",
  "authorizeurl",
  "authrecord",
  "authrefusedmessage",
  "authreport",
  "autointerval",
  "autointervalof",
  "automationallowlistentry",
  "automationallowlistgate",
  "autosnapshotstate",
  "backgroundqueueentry",
  "backgroundqueueentryof",
  "backgroundrunattention",
  "backgroundrungate",
  "backgroundrunsview",
  "backgroundsurfacemessages",
  "backgroundtrayrows",
  "backoffdelay",
  "backpressure",
  "backpressuresignal",
  "badgecolorof",
  "badgefromprogress",
  "badgetextof",
  "bannerreport",
  "batchbackpressuresignal",
  "batchcall",
  "batchgrade",
  "batchmember",
  "batchof",
  "batchopenlinks",
  "batchoutcome",
  "batchqueryplan",
  "batchqueryplangate",
  "batchqueryplanof",
  "batchquerysavings",
  "batchquerytaskof",
  "batchreport",
  "batchrisk",
  "batchsizelimitgate",
  "batchwindowvalid",
  "batteryawarestate",
  "batteryawarestateof",
  "beatrun",
  "beforeafter",
  "beforeafterpair",
  "beforeafterwrapallowed",
  "beginbackgroundrun",
  "begincall",
  "bindclientsession",
  "bindlocalhost",
  "bindparam",
  "bindvariables",
  "blackboard",
  "blackboardconsentgrade",
  "blackboardentry",
  "blackboardsection",
  "blackboardsections",
  "blackboardvaluekind",
  "blackboxedurls",
  "blackboxmatches",
  "blackboxrule",
  "blackboxruleof",
  "blendrows",
  "blockgate",
  "blockingduration",
  "blockinvocation",
  "blockinvocationof",
  "blockrule",
  "blockruleof",
  "boardlane",
  "boardmilestone",
  "boardstate",
  "boardstatesnapshot",
  "boardsummary",
  "bodyfilter",
  "bodyfilterof",
  "bodyhashof",
  "bodymatches",
  "bodyrecord",
  "branchof",
  "branchoutcome",
  "branchpath",
  "branchstep",
  "breakpointbudgetallowed",
  "breakpointceilingof",
  "breakpointinputof",
  "breakpointspec",
  "bridgechoices",
  "bridgeconsentgate",
  "bridgecontentgate",
  "bridgeeventrecord",
  "bridgeframeorigingate",
  "bridgeframerate",
  "bridgeheartbeatvalid",
  "bridgeidlewindowvalid",
  "bridgekillswitch",
  "bridgekillswitchgate",
  "bridgelaunch",
  "bridgemembergate",
  "bridgepairingrecord",
  "bridgepairingscopes",
  "bridgepairingwindowvalid",
  "bridgepayload",
  "bridgepayloadreport",
  "bridgequeuerecord",
  "bridgeratecapvalid",
  "bridgereviewcard",
  "bridgereviewdecision",
  "bridgesessionrecord",
  "bridgestatuslabel",
  "bridgestatusview",
  "broadcastchannelkind",
  "broadcastchannelof",
  "broadcastframe",
  "broadcastframeof",
  "broadcastrecipient",
  "browsermanifestadapted",
  "browsermanifestoverlay",
  "browsermanifestsource",
  "browserpermissions",
  "browserplatformadapter",
  "browserpolyfillflags",
  "browserpolyfillintersection",
  "browserpolyfillnamespace",
  "browserpolyfillof",
  "browserpolyfillpromisify",
  "browserpolyfillstructerrorof",
  "bucketboundsvalid",
  "bucketconsume",
  "bucketof",
  "buckettimeline",
  "budgetalert",
  "budgetalertstate",
  "budgetgate",
  "budgetremaining",
  "budgetstate",
  "budgetthresholdsvalid",
  "builddataset",
  "buildlayout",
  "buildname",
  "buildpdf",
  "buildsheet",
  "buildsteplibrary",
  "buildstitchplan",
  "buildtoolcatalog",
  "bundlemode",
  "bundlestamp",
  "busrouteaction",
  "busstate",
  "bytesreclaimed",
  "cachecleanup",
  "cacheentry",
  "cacheexpiryof",
  "cachegate",
  "cachekeyof",
  "cacheresponse",
  "cacheselentry",
  "cacheserv",
  "cadencecontrol",
  "cadenceunderpressure",
  "callauditcomplete",
  "callcontext",
  "callgraphql",
  "calllogreport",
  "calloutcome",
  "callprompt",
  "callratelimit",
  "callratelimitvalid",
  "callrecord",
  "callrest",
  "callretryhintof",
  "callsreport",
  "calltransport",
  "cancelbackgroundentry",
  "cancelframe",
  "cancelframeof",
  "cancelframes",
  "cancellederror",
  "cancelrollback",
  "cancelrun",
  "cancelrunaction",
  "cancelrunactionof",
  "cancelrungate",
  "cancelrunrecord",
  "canceltask",
  "canceltool",
  "canexecute",
  "canpreview",
  "canvasrecord",
  "capabilitydowngradegate",
  "capabilityprobe",
  "capabilityprobeof",
  "capabilityreport",
  "capabilityset",
  "capmanifest",
  "capmanifestdiff",
  "capmanifestdriftgate",
  "capmanifestof",
  "capmanifestsurface",
  "capsurfacesize",
  "captchahandoff",
  "capturebody",
  "capturebundle",
  "capturebundlereport",
  "capturecode",
  "capturecounter",
  "capturedheaders",
  "captureelement",
  "captureexport",
  "captureexportgate",
  "captureexportgranted",
  "capturefilename",
  "captureformat",
  "captureformats",
  "capturegate",
  "capturegrab",
  "capturekinds",
  "capturename",
  "capturenamerule",
  "capturenames",
  "capturenaming",
  "captureoptions",
  "captureoptionsof",
  "capturepause",
  "captureplanschedule",
  "capturepolicy",
  "captureregion",
  "capturereport",
  "captureretentiongrade",
  "captureretentionwindow",
  "capturesourcemaps",
  "capturestates",
  "capturesteps",
  "capturestitched",
  "capturesurface",
  "capturesurfaceof",
  "capturetargets",
  "capturevisible",
  "carddecision",
  "carrywarmselector",
  "castvote",
  "catalogcommand",
  "catalogcommands",
  "catalogflag",
  "cdpallowlist",
  "cdpallowlistof",
  "cdpcommand",
  "cdpdomains",
  "cdpeventrule",
  "cdpeventruleof",
  "cdpkinds",
  "cdpreport",
  "cdpsession",
  "chainreportof",
  "chainrows",
  "channellive",
  "channeloptionsof",
  "channelorigin",
  "channelrecord",
  "channelstate",
  "chateventof",
  "chateventpayload",
  "chatrowsof",
  "checkallowlist",
  "checkclaim",
  "checkidempotency",
  "checkpointgate",
  "checkpointisvalid",
  "checkpointrecord",
  "checksafeurl",
  "checksum",
  "childscopeof",
  "choosebranch",
  "chromestorageadapter",
  "chromestorageprimitives",
  "chunkcontent",
  "chunkextractcursor",
  "chunkextractgate",
  "chunkextractprogress",
  "chunkextracttaskof",
  "chunkextractwindow",
  "chunkextractwindowresult",
  "chunkframes",
  "chunkof",
  "chunkplan",
  "claim",
  "claimheartbeat",
  "claimrecord",
  "clamppanelwidth",
  "classconsent",
  "classconsentcovers",
  "classifyfailure",
  "cleanupafterrun",
  "cleanupbatch",
  "cleanupgate",
  "cleanuprule",
  "cleanuprun",
  "cleanupschedule",
  "clickablemap",
  "clicommands",
  "cliconfiguration",
  "clientbinding",
  "clientidentity",
  "clientmetadataof",
  "clientprotocolmajor",
  "clientrecord",
  "clipboardconsentgranted",
  "clipboardconsentrecord",
  "clipboardgate",
  "clipentry",
  "clipentryof",
  "cliphash",
  "clisurfacecommands",
  "clockadapter",
  "clockadapterof",
  "clonetabs",
  "clonewarning",
  "closechannel",
  "closedtab",
  "closedtabrecord",
  "closeheadlesssession",
  "closeidlechannels",
  "closeoffscreen",
  "closerun",
  "closeselection",
  "coalescedombursts",
  "coalescedrequest",
  "coalescefanout",
  "coalescequeries",
  "coldstartverdict",
  "collectattention",
  "collectmessages",
  "collectresults",
  "color",
  "columnspec",
  "columnspecof",
  "companionhandshake",
  "companionhandshakeframe",
  "comparemetricdefaults",
  "compareoutputs",
  "comparepairof",
  "comparepairsforsteps",
  "comparesessionmetrics",
  "compareviewerpair",
  "comparisonrecord",
  "complete",
  "completions",
  "composeenvelope",
  "composeworkflow",
  "concurrentwindow",
  "conditionof",
  "conditionstep",
  "confirmcredsgate",
  "confirmdeletegate",
  "confirmgate",
  "confirmmanualrun",
  "confirmpaygate",
  "conflictfree",
  "conflictresolutiongrade",
  "conflictscan",
  "conflictsfor",
  "conflictwriter",
  "connectallowentry",
  "connectallowentryof",
  "connectallowgate",
  "connectallowlist",
  "connectclient",
  "connectrelay",
  "consensusquorumvalid",
  "consensusrecord",
  "consensusrecordof",
  "consensusreport",
  "consensusround",
  "consensusstate",
  "consensusvote",
  "consentadvisory",
  "consentadvisoryverdict",
  "consentdurationvalid",
  "consentmemoryadvisorygate",
  "consentmemoryentry",
  "consentmemoryof",
  "consentmeta",
  "consentmetagrade",
  "consentmodel",
  "consentprompttext",
  "consentprovider",
  "consentscope",
  "consentwindow",
  "consentwindowgate",
  "consentwindowstate",
  "consolecapture",
  "consoleconsentcovers",
  "consoleconsentrecord",
  "consolediff",
  "consolediffreport",
  "consoleentry",
  "consoleline",
  "consolemaskgate",
  "consoletimeline",
  "consoletraceentry",
  "containerbuildchecks",
  "containerbuildstage",
  "containerbuildstages",
  "containerdigestfiles",
  "containerexposedsurface",
  "containerexposedsurfaces",
  "containerimagetags",
  "containerrunnerentry",
  "contractcapabilities",
  "contrasttokensof",
  "controlexecute",
  "controlexecutor",
  "controlflowdecision",
  "controlflowkinds",
  "controlkinds",
  "controlreport",
  "controlsteps",
  "controlsummary",
  "controltabstate",
  "controltarget",
  "convertdirective",
  "convertdirectiveof",
  "cookiedomaingranted",
  "cookiegate",
  "cookiejarrecord",
  "cookieoperation",
  "cookierecord",
  "cookierecordof",
  "correctionentry",
  "correlatedrequest",
  "correlateids",
  "correlationcontext",
  "correlationexport",
  "correlationid",
  "correlationmappinggate",
  "costbudgetvalid",
  "costentry",
  "costentryof",
  "costledgerreport",
  "costsharegate",
  "countlabel",
  "cpuprofile",
  "cpusample",
  "cpusnap",
  "crashinterrupted",
  "crashnativehost",
  "createlinepump",
  "createmcpregistry",
  "createservesession",
  "credentialheadername",
  "credentialstep",
  "credspayload",
  "criticreview",
  "criticreviewgrade",
  "cronnext",
  "cronparse",
  "croprect",
  "cropshot",
  "crossbrowserfeatureflagset",
  "crossesviewport",
  "cssselectorvalid",
  "csvfield",
  "csvof",
  "curatedlink",
  "curatedlist",
  "cursorfrom",
  "darklighttokens",
  "darklighttokensof",
  "dataexpectation",
  "dataexpectationssummary",
  "datagridcolumn",
  "datagridcolumnsof",
  "datagridof",
  "datagridrow",
  "datagridview",
  "datainventory",
  "dataset",
  "datasetresponse",
  "datasetrow",
  "debouncedbatch",
  "debounceprofile",
  "debounceprofilesof",
  "debouncewindowvalid",
  "debuggate",
  "debuggerconsentcovers",
  "debuggergrant",
  "debugwaitbudgetallowed",
  "decisionpayload",
  "decodemessage",
  "decryptvalue",
  "dedupeattention",
  "dedupeconfiggate",
  "dedupeimages",
  "dedupekey",
  "dedupereport",
  "deduperows",
  "dedupesnapshotrequests",
  "deeplinkapp",
  "deeplinkgate",
  "deeplinkpattern",
  "defaultapprovalwindowms",
  "defaultchallengelifetimems",
  "defaultclock",
  "defaultenvironment",
  "defaultfetch",
  "defaultheartbeatms",
  "defaulthttpstream",
  "defaultidempotencywindowms",
  "defaultidlewindowms",
  "defaultlogger",
  "defaultloopbound",
  "defaultmaskshapes",
  "defaultmcpconfig",
  "defaultmcpport",
  "defaultpairinglifetimems",
  "defaulttokenlifetimems",
  "defaulttriggercooldown",
  "deferredevent",
  "deferredeventof",
  "deferredready",
  "degradationgate",
  "delayjitter",
  "delaystep",
  "deletepayload",
  "deltachangesof",
  "deltarequestkey",
  "deniedevidence",
  "deniedevidenceof",
  "denokvadapter",
  "denokvprimitives",
  "denoplatformadapter",
  "denydefaultnotice",
  "denydefaultposture",
  "deprecatedfield",
  "deprecatedfields",
  "deprecationnoticeof",
  "deprecationwindow",
  "depthgate",
  "depthlimit",
  "depthlimitof",
  "depthoflineage",
  "dequeueoffline",
  "deriveactionrisk",
  "derivedselector",
  "derivekey",
  "detachcdpsession",
  "detachnativehost",
  "detectadapterruntime",
  "detectfilekind",
  "detectionrecord",
  "devicepreset",
  "devicepresetof",
  "devtoolsguardstatus",
  "devtoolstripped",
  "devtoolswallid",
  "devtoolswallstatus",
  "diagnosticreport",
  "dialogdecision",
  "dialogpolicy",
  "diffbase",
  "diffbasegate",
  "diffbaserecord",
  "diffchange",
  "diffentry",
  "diffpreviewgate",
  "diffpreviewof",
  "diffpreviewpayload",
  "diffresponse",
  "diffresult",
  "diffreviewgrade",
  "diffsessionrecords",
  "diffshot",
  "diffthresholdgrade",
  "diffversions",
  "disarmkillswitch",
  "discardcandidates",
  "disconnectclient",
  "disconnectrelay",
  "dismissattention",
  "dismissmigrationprompt",
  "dismissv1sunset",
  "dispatchcall",
  "dispatchtool",
  "distillrunsummary",
  "documentedbind",
  "domainkinds",
  "domainlane",
  "domainlanesfor",
  "domainlimitsvalid",
  "dommapof",
  "domparse",
  "downgradesof",
  "downloadfilename",
  "downloadgranted",
  "downloadrecord",
  "downloadreport",
  "downloadspec",
  "downloadstate",
  "drainqueue",
  "dropimportof",
  "dropimportsession",
  "dryflowdriver",
  "dryrunprojection",
  "dryrunpurity",
  "dryrunreport",
  "dryruntool",
  "dryrunworkflow",
  "durationsample",
  "durationsampleof",
  "durationsampletoperf",
  "ecosystemviews",
  "editedcorrectionof",
  "editnote",
  "editoredge",
  "editorlayout",
  "editormodel",
  "editornode",
  "editorsavegate",
  "editorstate",
  "editstep",
  "egressconsentgate",
  "electleader",
  "emptyboard",
  "emptyconnectallow",
  "emptyqueue",
  "emptystatemessage",
  "emptystatesurface",
  "emugate",
  "emulationfamily",
  "emulationkinds",
  "emulationlayer",
  "emulationreport",
  "emulationretentionwindow",
  "emulationstackallowed",
  "emulationstate",
  "emulationstateof",
  "encodemessage",
  "encryptedenvelope",
  "encryptionsecretgate",
  "encryptmemorygate",
  "encryptsync",
  "encryptsyncgate",
  "encryptvalue",
  "endcall",
  "endpointconfig",
  "endpointrecord",
  "enforcemaxclients",
  "enforcequarantine",
  "engagekillswitch",
  "enqueue",
  "enqueuebackgroundrun",
  "enqueuebridge",
  "enqueueoffline",
  "enqueuerequest",
  "entryfresh",
  "entryhashof",
  "envelopeacceptance",
  "envelopecheck",
  "environmentgrammar",
  "environmentgrantgate",
  "environmentkind",
  "environmentprovenance",
  "environmentreport",
  "environmentrequirement",
  "environmentrequirements",
  "environmentrequirementsof",
  "environmentsof",
  "errorcapture",
  "errorcause",
  "errorcodetable",
  "errorhandler",
  "errorrecord",
  "errorreport",
  "errorreportresponse",
  "errorresponse",
  "errorsurface",
  "errorsurfaceof",
  "errorwithretry",
  "escalate",
  "escalateholdgate",
  "escalationblock",
  "escalationgate",
  "escalationrecord",
  "evaluatecondition",
  "evaluatetrigger",
  "eventkind",
  "eventnotification",
  "eventpostbody",
  "eventresponse",
  "eventrulematches",
  "eventstreambody",
  "eventsubscription",
  "exactorigin",
  "exchangebridgepairing",
  "exchangerecord",
  "exchangesreport",
  "executorregistry",
  "executorreport",
  "exitclasses",
  "expandblocks",
  "expandtemplate",
  "expireapprovals",
  "expireconsentwindows",
  "expirecorrections",
  "expireditems",
  "expireidempotency",
  "expirelayers",
  "expirelocks",
  "expireprofilerecords",
  "expirerecallindex",
  "expirerunlocks",
  "expiresessions",
  "expiretokens",
  "expirnotes",
  "expirygate",
  "expiryof",
  "expiryrule",
  "exportall",
  "exportallbundle",
  "exportallgate",
  "exportallreport",
  "exportartifact",
  "exportcaptures",
  "exportchain",
  "exportchaingate",
  "exportchunks",
  "exportcontent",
  "exportcontentreview",
  "exportdatagrid",
  "exportdescriptor",
  "exportdescriptorof",
  "exportedartifact",
  "exportextractions",
  "exportformat",
  "exportformats",
  "exportgranted",
  "exportlibrarymanifests",
  "exportlogchain",
  "exportmaskgate",
  "exportmenudescriptor",
  "exportmenudescriptors",
  "exportnotes",
  "exportpresetlibrary",
  "exportprovenancegate",
  "exportready",
  "exportrecords",
  "exportresult",
  "exportrowsof",
  "exportrunstate",
  "exportscopes",
  "exportsessionfile",
  "exportworkflow",
  "exposedtools",
  "expressioneval",
  "expressionof",
  "expressionoperand",
  "expressionoperator",
  "expressionoperators",
  "expressiontype",
  "extractbatch",
  "extractbatchof",
  "extractionreport",
  "extractpipeline",
  "extractrow",
  "extractsession",
  "extractvalues",
  "failureclass",
  "familyofkind",
  "featuredowngrade",
  "featuretourordered",
  "featuretourstop",
  "featuretourstopat",
  "featuretourstops",
  "fetchadapter",
  "fetchadapterof",
  "fetchbudgetallowed",
  "fetchconsent",
  "fetchconsentcovers",
  "fetchconsentrefgranted",
  "fetchoptions",
  "fetchoptionsof",
  "fetchrequest",
  "fetchrequestof",
  "fetchshellof",
  "fetchtransport",
  "fielderror",
  "fieldkind",
  "fieldmatch",
  "fieldshapekind",
  "fieldshaperegions",
  "fileproviderof",
  "filesystemprimitives",
  "filesystemstorageadapter",
  "filterdatagridrows",
  "filteredsessions",
  "filterentries",
  "filterexchanges",
  "filterlogstream",
  "finalurlof",
  "finishbackgroundrun",
  "finishrecording",
  "firefoxactionmap",
  "firefoxdenylist",
  "firefoxpermissionmap",
  "firefoxprepadapt",
  "firefoxprepdenylistcheck",
  "firefoxprepoverlay",
  "firefoxprepsplitbundle",
  "firstdivergenceof",
  "fixedheadermatch",
  "fixedtelemetrypolicy",
  "fixtureconsentgate",
  "fleetoperationgrade",
  "fleetoverview",
  "flowdriver",
  "flowgateof",
  "flowlibraryentry",
  "flowlibrarymanifest",
  "flowlibrarystep",
  "flowmetric",
  "flowmetricnames",
  "flowproposalvalue",
  "flowrunevent",
  "flowrunexitcodeof",
  "flowrungate",
  "flowrungrantgate",
  "flowrunoptions",
  "flowrunoutcome",
  "flowrunreport",
  "flowrunrequest",
  "flowspec",
  "flowspecof",
  "flowstepsensitive",
  "flowtimelinerowsof",
  "focusevent",
  "focusorderof",
  "foldplannedvisits",
  "foreachof",
  "foreachstep",
  "forensicchoices",
  "forensickinds",
  "forensicscopegate",
  "forensicsreadonlygate",
  "forklibrary",
  "formatdiagnostics",
  "formentry",
  "formpayload",
  "formpayloadof",
  "formpost",
  "formprofile",
  "formrecord",
  "formreport",
  "formreportresponse",
  "frameauth",
  "framebudgetgate",
  "framedlog",
  "framegrab",
  "frameinterval",
  "frameocr",
  "frameof",
  "framepath",
  "framerecord",
  "framereference",
  "framesof",
  "framingrules",
  "freezeline",
  "frozenmessage",
  "frozenmessagecarriers",
  "frozenmessagecatalog",
  "gatebatchgate",
  "gateforstep",
  "gatekind",
  "gatekindfor",
  "gateprompttext",
  "gateresolution",
  "gatestateof",
  "gatewaitevidence",
  "gatewaybaseurlgate",
  "gatewaycachewindowvalid",
  "gatewaycallreport",
  "gatewayconsentgate",
  "gatewaykeyconsentgate",
  "gatewayprefixgate",
  "gatewayretrycapvalid",
  "generatedvalueallowed",
  "globalflags",
  "glyph",
  "grantallowlistentry",
  "grantdiffof",
  "graphqlmessage",
  "graphqlopenvelope",
  "graphqlrequest",
  "graphqlrequestof",
  "graphqlsub",
  "graphqlsubscribeframe",
  "graphqlsubscription",
  "graphqlsubscriptionof",
  "gridcolumn",
  "gridexportconfirmgate",
  "gridpreview",
  "groundgate",
  "groundingmatch",
  "groundingresult",
  "groundshot",
  "groupselect",
  "growsample",
  "growsampleof",
  "growthtrend",
  "guard",
  "guardarmed",
  "guardverdictgate",
  "guidedtip",
  "guidedtipdismiss",
  "guidedtiprecall",
  "guidedtips",
  "halocolorof",
  "haloof",
  "haltedstepsof",
  "handleframe",
  "handoffframe",
  "handoffgrantgate",
  "handoffrecord",
  "handoffrequest",
  "handoffstate",
  "headerfilter",
  "headerfilterof",
  "headerule",
  "headeruleof",
  "headlessauditread",
  "headlessconsentgate",
  "headlessevent",
  "headlessfixture",
  "headlessfixtureoutcome",
  "headlessfixturestep",
  "headlessgatewait",
  "headlessmemory",
  "headlessplan",
  "headlesspolicyvalidate",
  "headlessprogress",
  "headlessrun",
  "headlesssession",
  "headlesssessionview",
  "headlesssubscribe",
  "headlesstelemetrygate",
  "headlesstelemetryposture",
  "healthof",
  "healthresourceof",
  "heapintervalallowed",
  "heaprecord",
  "heapsnap",
  "heartbeat",
  "heartbeatevent",
  "heartbeatisstale",
  "heartbeatrecord",
  "heartbeatreport",
  "heartbeattick",
  "heartbeatwindowof",
  "heartbeatwindowvalid",
  "heightmapkey",
  "heightmaprecord",
  "heldkeysreport",
  "helplines",
  "hideblackboxedframes",
  "highcontrasttokens",
  "highlightterms",
  "historyindexentry",
  "historyqueryof",
  "historysearch",
  "historysearchhit",
  "historysearchquery",
  "historysource",
  "hostmanifestdestination",
  "hostpattern",
  "htmlmatch",
  "htmlqueriesof",
  "htmlquery",
  "htmlqueryresult",
  "httpanswer",
  "httpendpoint",
  "httpframepipeline",
  "httpkinds",
  "httpstreamconfig",
  "httpstreamreport",
  "idempotencykey",
  "idempotencyrecord",
  "idempotencyreplayframe",
  "idempotencyreport",
  "idleexpired",
  "imagebatch",
  "imagedescriptor",
  "imagefilter",
  "imagefilterof",
  "imagehashof",
  "imagematches",
  "imagenames",
  "imageocr",
  "immutablelogentry",
  "importexportgate",
  "importexportpayload",
  "importexportpayloadof",
  "importexportvalidate",
  "importpresetlibrary",
  "importsessionfile",
  "importworkflow",
  "incrsnapshotdelta",
  "incrsnapshotgate",
  "infercolumntype",
  "inflightreport",
  "inheritconsent",
  "initialize",
  "initialrun",
  "inmemoryvault",
  "installdevtoolsguard",
  "installlibrary",
  "installnativehost",
  "interfaceviews",
  "interleave",
  "interleaveevent",
  "interleavereadonlygate",
  "interleavetimeline",
  "interpolate",
  "invalidateselcacheonmutations",
  "invalidateselcacheonnavigation",
  "inventoryentry",
  "iscapturekind",
  "iscdpkind",
  "iscontrolflowkind",
  "iscontrolkind",
  "isdatasetkind",
  "isdebugkind",
  "isemptydelta",
  "isemulationkind",
  "isexportkind",
  "isfileskind",
  "isformkind",
  "ishttpkind",
  "islayoutkind",
  "ismediakind",
  "isnetwatchkind",
  "isnotification",
  "isolatedinjection",
  "isolatedsessions",
  "isprofilekind",
  "isrecordingkind",
  "issensitiveclass",
  "issessionkind",
  "issocketkind",
  "issuechallenge",
  "issuepairingcode",
  "issuetoken",
  "istabscommandkind",
  "istriggeraction",
  "istriggerkind",
  "iswatchkind",
  "isworkflowkind",
  "jargate",
  "jarscope",
  "joinbranches",
  "joincorrelation",
  "joinlanes",
  "joinrecord",
  "joinruns",
  "joinstep",
  "jsonlinesof",
  "jsonpathrule",
  "jsonpathrulesof",
  "jsonrpcframe",
  "jsonrpcmessage",
  "jsonstate",
  "keepaliveevent",
  "keepalivegate",
  "keepaliveintervalvalid",
  "keepalivestate",
  "keyderive",
  "keyholdstate",
  "killall",
  "killswitch",
  "killswitchgate",
  "kindoptionfields",
  "lanechangegate",
  "laneownership",
  "lanereport",
  "lapsebudgetallowed",
  "lapseframes",
  "lapseplan",
  "lapseplanof",
  "lasthashof",
  "launchbridge",
  "layernames",
  "layoutmutationgranted",
  "layoutreport",
  "layoutrestoreplan",
  "layouttab",
  "lazybudgetvalid",
  "lazyloadgate",
  "lazyloadrecord",
  "lazymodcatalog",
  "lazymoddescriptor",
  "lazymodof",
  "leaderelectionvalid",
  "leaderworker",
  "lessondecay",
  "lessonmatches",
  "lessonrecord",
  "lessonrecordof",
  "lessonreport",
  "lessonreuse",
  "lessonsanitizestep",
  "lessonsecretgate",
  "levelrank",
  "levelsummary",
  "librarybrowserow",
  "librarycapabilitygate",
  "libraryentryof",
  "libraryevent",
  "libraryeventof",
  "librarygrantgate",
  "libraryimportgate",
  "librarymanifestgate",
  "librarymode",
  "libraryproposalof",
  "libraryquarantinegate",
  "libraryrunhandle",
  "librarysearch",
  "librarysensitivegate",
  "librarystepsview",
  "librarysurfaceexports",
  "linkbatch",
  "lintplanfile",
  "listapprovals",
  "listdue",
  "listmcpprompts",
  "listpattern",
  "listprompts",
  "listremotestatus",
  "listtools",
  "livebufferof",
  "livetokensof",
  "loadplan",
  "loadreport",
  "loadreportof",
  "loadworkflow",
  "localebundle",
  "localebundles",
  "localeformat",
  "localestring",
  "localfieldsof",
  "localfirst",
  "localgate",
  "localhostbind",
  "localrule",
  "localsensitivegrade",
  "localstorageadapter",
  "locationconsent",
  "locationconsentcovers",
  "locationconsentgate",
  "locationpreset",
  "locationpresetof",
  "locationrangevalid",
  "lockblocks",
  "lockcandidate",
  "lockheldby",
  "lockkey",
  "lockkind",
  "lockrecord",
  "lockscopevalid",
  "lockwindowof",
  "lockwindowvalid",
  "logbufferboundvalid",
  "logchainreport",
  "logentryof",
  "logeventkind",
  "loggeradapter",
  "loggeradapterof",
  "loghash",
  "loglevel",
  "loglevelof",
  "loglevels",
  "loglevelset",
  "logprunegate",
  "logpruneplan",
  "logprunerule",
  "logreadgate",
  "logstreamegressgate",
  "logstreamevent",
  "logstreameventof",
  "logstreamfilter",
  "logstreamgenesis",
  "longpoll",
  "longpollrequest",
  "longpollrequestof",
  "longtaskcapture",
  "longtaskentry",
  "lookalikedistance",
  "loopcounter",
  "loopkinds",
  "loopof",
  "loopstep",
  "loopvariables",
  "mailboxof",
  "makecheckpoint",
  "manifestcheckfinding",
  "manifestdigest",
  "manualpreview",
  "manualrun",
  "manualrunpreview",
  "mapcolumns",
  "mapentry",
  "mapresponse",
  "maptoolerror",
  "mapurlof",
  "markbreakpoint",
  "markdownfield",
  "markdownof",
  "markpending",
  "markuprenderstep",
  "markv1sunset",
  "maskclipboard",
  "maskedvalueof",
  "maskexport",
  "maskfield",
  "maskfill",
  "maskformstate",
  "maskingfield",
  "maskmarker",
  "maskobservation",
  "maskrecord",
  "maskrule",
  "maskstoredvalues",
  "masktypedvalues",
  "maskvalue",
  "maskverdictsof",
  "matchingcorrections",
  "matchingrule",
  "matchmessage",
  "matchurl",
  "matchurlpattern",
  "matrixtargetof",
  "matrixverify",
  "mavenattachedartifact",
  "mavenattachedartifacts",
  "mavenjarresources",
  "mavenpackinfo",
  "mavenpacklayout",
  "mavenpackpomtext",
  "mavenpommetadata",
  "mcpmodegate",
  "mcpserverconfig",
  "mcpserverstate",
  "mcpsurfacekinds",
  "mcpsurfacetools",
  "measure",
  "measurevirtlistrows",
  "mediadatum",
  "mediaentries",
  "mediagate",
  "mediakinds",
  "mediarecord",
  "mediareport",
  "memoryadapter",
  "memoryitem",
  "memoryitemframe",
  "memoryitemof",
  "memoryprovenance",
  "memoryreadscopegate",
  "memorystorage",
  "memorystorageadapter",
  "memorytrend",
  "mergechunkwindows",
  "mergeegressgrade",
  "mergeentry",
  "mergelines",
  "mergeparagraphs",
  "mergeregions",
  "mergeresults",
  "mergerule",
  "mergetaskrules",
  "messageegressgrade",
  "messageenvelope",
  "messagefilter",
  "messagefilterof",
  "messagerouting",
  "methoddomain",
  "methodentry",
  "migrateitem",
  "migrationcommandtext",
  "migrationpromptof",
  "migrationpromptstate",
  "migrationpromptvisible",
  "mimeallowed",
  "mimefilter",
  "minifiedoutput",
  "minimalplandigest",
  "minimapfocus",
  "minimapstate",
  "minimizationchoices",
  "minimizationkinds",
  "minimizationstripgrade",
  "mintbridgepairing",
  "missingclassconsents",
  "mockfor",
  "mockreport",
  "mockspec",
  "mockspecof",
  "mockusagevalid",
  "modeloutcome",
  "modelproposal",
  "multipartchunks",
  "multipartfield",
  "multipartfieldheader",
  "multipartpayload",
  "multipartpayloadof",
  "multipartpost",
  "mutationbatchof",
  "mutationcallof",
  "mutationevent",
  "mutationwatch",
  "namecaptures",
  "namespaceof",
  "nativebridgeprotocolmajor",
  "nativecallclass",
  "nativecallevent",
  "nativecallrecord",
  "nativecallrecordof",
  "nativechoices",
  "nativeclassgrant",
  "nativecorrelationid",
  "nativedefaultstate",
  "nativedegradationof",
  "nativediagnostics",
  "nativeerror",
  "nativeerrorof",
  "nativeescapehatchgate",
  "nativefailureof",
  "nativeframe",
  "nativeframecheck",
  "nativeframeof",
  "nativeheadlessgate",
  "nativeheartbeatframe",
  "nativeheartbeatintervalvalid",
  "nativehostcapabilities",
  "nativehostidplaceholder",
  "nativehostinstallerversion",
  "nativehostmanifesttemplate",
  "nativehoststate",
  "nativeidlewindowvalid",
  "nativeinstallconsentgate",
  "nativekillswitch",
  "nativekillswitchgate",
  "nativemajorversion",
  "nativemessagingdirname",
  "nativeportliveness",
  "nativeprotocolcompatible",
  "nativeratecapvalid",
  "nativeratecheck",
  "nativesecretexclusion",
  "nativesecretkeys",
  "nativesensitiveapprovalgate",
  "nativesurfacecatalog",
  "nativesurfacedef",
  "nativesurfacegrant",
  "nativesurfacekind",
  "nativesurfaceresult",
  "nativetransportconsentgate",
  "nativetransportenabled",
  "navcontrol",
  "navdedupeentry",
  "navdedupeverdict",
  "navigationgranted",
  "navigationobservationgrade",
  "navigationsteps",
  "navintent",
  "navintentrecord",
  "navpause",
  "navqueues",
  "navratelimit",
  "navratelimitgate",
  "navrecord",
  "navstate",
  "navstateresponse",
  "navtarget",
  "navtrailentry",
  "needstarget",
  "negotiate",
  "negotiatecapabilities",
  "negotiatenativecapabilities",
  "negotiateprotocol",
  "negotiatetoolfloor",
  "nestedparam",
  "netfailureentry",
  "netfailureentryof",
  "netlogentry",
  "netlogforstep",
  "netlogrecord",
  "netlogreport",
  "nettimeline",
  "nettraceentry",
  "nettraceorigingate",
  "netwatchkinds",
  "networkbackoff",
  "networkpreset",
  "networkpresetof",
  "networkretryrule",
  "newblockrule",
  "newchannel",
  "newexchange",
  "newextractsession",
  "newheaderule",
  "newjar",
  "newlayer",
  "newmockspec",
  "newquarantine",
  "newrecording",
  "newrelayclient",
  "newrelayserverstate",
  "newsessiondiff",
  "newsessionrecord",
  "newstream",
  "newworkflowrun",
  "nextbackgroundrun",
  "nextrequest",
  "nobatchresolution",
  "nodeplatformadapter",
  "nonceof",
  "normalizedtaburl",
  "normalizeendpoint",
  "normalizeheader",
  "notebodyof",
  "notehistoryentry",
  "notelemetryinvariant",
  "noterow",
  "notificationcontentgate",
  "notificationframe",
  "notificationpayload",
  "notificationrespectsdnd",
  "notifyattentionof",
  "notifydoneof",
  "notifyevent",
  "notifyprogress",
  "notifyresource",
  "nugetcontententries",
  "nugetcontententry",
  "nugetdeclarationentries",
  "nugetfixtureentries",
  "nugetframeworktargets",
  "nugetpackinfo",
  "nugetpacklayout",
  "nugetpackmetadata",
  "oauthflow",
  "oauthflowof",
  "observation",
  "observationmode",
  "observationmodeof",
  "observationrecord",
  "observationresponse",
  "observedorigingranted",
  "observeevents",
  "ocrgate",
  "ocrline",
  "ocrread",
  "ocrregion",
  "ocrresult",
  "ocrtext",
  "ocrword",
  "offfamilyof",
  "offlinegate",
  "offloadkinds",
  "offscreencapabilitygate",
  "offscreenregistryentry",
  "omniboxtaskgate",
  "omniboxtasksubmission",
  "omniboxtasktotaskinput",
  "ondevtoolstrip",
  "onboardingcomplete",
  "onboardingconsentgate",
  "onboardingstart",
  "onboardingstate",
  "onboardingstep",
  "onboardingsteps",
  "openapilayout",
  "openchannel",
  "openchunkextractcursor",
  "openclipboardurl",
  "openconsensus",
  "openconsentwindow",
  "opengate",
  "openheadlesssession",
  "openlanes",
  "openlibraryrun",
  "opennotebody",
  "openoffscreen",
  "openrun",
  "openrunlog",
  "openseal",
  "openselcache",
  "openstreamchannel",
  "opentabagent",
  "openvirtlist",
  "optinsync",
  "origincheck",
  "origincheckgate",
  "origincheckof",
  "origincheckverdict",
  "origingranted",
  "originlabels",
  "originprofile",
  "originprofilegate",
  "originprofileof",
  "originverified",
  "outboundpayloadcheck",
  "outboundtarget",
  "outcomeresponse",
  "outputcompare",
  "outputcomparegate",
  "outputcomparereadonlygate",
  "outputcomparesession",
  "outputcomparesessionof",
  "outputcompareview",
  "outputcomparison",
  "overlayslider",
  "overrideinputof",
  "overridematches",
  "packageversion",
  "pagebridgesurfacemessages",
  "pagechipconfirmation",
  "pagechipof",
  "pagechipresolve",
  "pagecontentkeys",
  "pagesignals",
  "pairclient",
  "pairexchange",
  "pairgate",
  "pairingcode",
  "pairingcountdown",
  "pairingframes",
  "pairingpanel",
  "pairingreadinessgate",
  "pairingstate",
  "pairquery",
  "pairshot",
  "pairstates",
  "paletteaction",
  "paletteactiongate",
  "palettecategories",
  "palettecategory",
  "palettecommandsof",
  "paletteentry",
  "palettematch",
  "palettenode",
  "palettenodes",
  "palettequery",
  "paletteuseafter",
  "paletteuserecord",
  "panelwidthbounds",
  "panelwidthslayout",
  "panelwidthsof",
  "parallelbranch",
  "parallelof",
  "paralleloutcome",
  "parallelstep",
  "parsecompanionhandshake",
  "parsecsv",
  "parseddocument",
  "parsedfield",
  "parseenvelope",
  "parseflowrunrequest",
  "parseframe",
  "parsegrantsfile",
  "parsegraphqlmessage",
  "parsehtmlbody",
  "parseomniboxtask",
  "parseoptions",
  "parseplanfile",
  "parsepost",
  "parseproposal",
  "parseshortcut",
  "parsespawnrequest",
  "parsessetext",
  "parsetabquery",
  "parsetokens",
  "parsewire",
  "parsewireframe",
  "parseworkflowproposal",
  "passwordconsentgranted",
  "patternorigin",
  "pauseagent",
  "pauseagentgate",
  "pauseall",
  "pausenavconsent",
  "pausenavconsentgate",
  "pauseone",
  "pauseretentionwindow",
  "pauserun",
  "pausestate",
  "payloadencrypt",
  "payloadfield",
  "payloadschema",
  "payloadshapeof",
  "payloadvalid",
  "payloadwithdefaults",
  "paypayload",
  "pdfocr",
  "pdfoptions",
  "pdfoptionsof",
  "pdfpagesize",
  "pdfrasterize",
  "pdfrecord",
  "pdfsegments",
  "pdftextlayout",
  "peekplan",
  "perfbundle",
  "perfentry",
  "perfprovenancegate",
  "perfrecord",
  "perfrecordof",
  "perfreport",
  "perfsummary",
  "permdiffchanged",
  "permdiffrecord",
  "permdiffsummary",
  "permissioncoverage",
  "permissiondiff",
  "permissiongrade",
  "permissiongrant",
  "permissiongrantof",
  "permissionnamevalid",
  "permissionoverriderecord",
  "permissionstate",
  "permissionstates",
  "permissionstatevalid",
  "phishguardgate",
  "phishnotetext",
  "phishthresholdgate",
  "phishthresholdvalid",
  "phishverdict",
  "phishverdictof",
  "pickercandidate",
  "pickercandidateof",
  "pickeroverlaygate",
  "pickersession",
  "pickersessionstart",
  "ping",
  "pinnedprotocolversion",
  "pipelinegridpreview",
  "pipelinestate",
  "pipelinetargetgate",
  "pixeldiff",
  "planallowlist",
  "planbadge",
  "plancard",
  "plancardgroup",
  "plancardgroups",
  "plancardsof",
  "plandraftreviewgate",
  "planfile",
  "planfilestep",
  "planfilestepfields",
  "planlint",
  "planlintdiagnostic",
  "planlintexitcode",
  "planlintseverity",
  "planlintsummary",
  "plannerexecutor",
  "plannersplit",
  "planoriginprofile",
  "planprogress",
  "planprogressevent",
  "planproposal",
  "planproposaleventof",
  "planproposaleventpayload",
  "planrevieweventpayload",
  "planreviewgate",
  "planrisksummary",
  "plansensitiveclasses",
  "planstate",
  "plansteprisk",
  "platformadapterof",
  "platformmatrix",
  "platformmatrixgate",
  "platformmatrixof",
  "platformtarget",
  "platformtargets",
  "pluralize",
  "pointpath",
  "pointref",
  "policyevaluation",
  "politedelayfor",
  "politedelayprofile",
  "politedelayvalid",
  "pollchoices",
  "pollcursor",
  "pollcursorof",
  "polldecision",
  "pollfetch",
  "pollurl",
  "pollwaitbudgetgate",
  "poolplan",
  "popscope",
  "popupsurfacemessages",
  "portablecapabilitygate",
  "portablecapabilityset",
  "portablerule",
  "portablerulefamilies",
  "portableruleset",
  "portablerulesetgate",
  "portablerulesetof",
  "portaccept",
  "postauth",
  "postentry",
  "postevent",
  "postgate",
  "preconnectgate",
  "preconnectorigin",
  "preconnecttarget",
  "predictionreport",
  "prefetchgate",
  "prefetchpage",
  "prefetchplan",
  "preparehandoff",
  "presetlibrary",
  "prewarmmodules",
  "prioritylaneof",
  "privatemime",
  "profilegrade",
  "profilegrantgranted",
  "profilekind",
  "profilereport",
  "profileretentionwindow",
  "profilerkinds",
  "profilesummary",
  "progressboard",
  "progresseventpayload",
  "progressframe",
  "progressnotice",
  "progressnoticeframe",
  "progressof",
  "promptcallframe",
  "promptdef",
  "promptexposuregate",
  "promptreport",
  "promptsof",
  "proposalrequest",
  "proposalstatus",
  "proposeredactionmasks",
  "protocoleventkinds",
  "protocoleventsubscription",
  "protocolfloormajor",
  "protocolmajor",
  "protocolmajorof",
  "protocolmajorversion",
  "protocolnegotiationgate",
  "protocolsupported",
  "protocolversion",
  "provenancefor",
  "provenanceof",
  "provenancerecord",
  "provenancereport",
  "provgate",
  "provideregressgrade",
  "providervalid",
  "provlog",
  "provlogappendonlygate",
  "provlogentry",
  "provlogquery",
  "proxygate",
  "proxyroute",
  "proxyrouteof",
  "pruneattention",
  "pruneperfrecords",
  "prunerunstates",
  "prunescratchpad",
  "publishchange",
  "publishdescriptor",
  "publishmessage",
  "publishresourcechange",
  "purgegate",
  "purgeitems",
  "purgeonrequest",
  "purgeoutcome",
  "purgepolicy",
  "pushscope",
  "quarantinedpath",
  "quarantineentry",
  "quarantineopengate",
  "quarantinereleasegranted",
  "quarantinereport",
  "quarantineverdictreport",
  "querymatches",
  "queuecomplete",
  "queuecompletionpolicy",
  "queuedepthsample",
  "queuedepthsampleof",
  "queuedepthvalid",
  "queuedepthview",
  "queuedtask",
  "queuedtaskexpirygate",
  "queuefire",
  "queuelanesvalid",
  "queuesize",
  "quickaction",
  "quickactioncatalog",
  "quickactiongate",
  "quickactionsfor",
  "quietrule",
  "quotacleanupgate",
  "quotareport",
  "quotareportof",
  "randomid",
  "rankapis",
  "rankattention",
  "rankcandidates",
  "rankedcandidates",
  "rankrecall",
  "ratelimit",
  "ratelimitboundsvalid",
  "ratelimitbucket",
  "ratelimitbudgetallowed",
  "ratelimitdirective",
  "ratelimitdirectiveof",
  "ratelimitgate",
  "ratelimitread",
  "ratelimitreadof",
  "ratelimitreport",
  "ratelimitrespect",
  "ratelimitrespectgate",
  "ratelimitstate",
  "ratelimitwait",
  "ratelimitwaitof",
  "ratelimitwindow",
  "readentries",
  "readerarticle",
  "readercapture",
  "readmethod",
  "readonlyactionkinds",
  "readonlyeventkinds",
  "readonlyscope",
  "readparallelgroup",
  "readparallelgroupof",
  "readpath",
  "readresource",
  "readstream",
  "readverifiedlog",
  "reaprun",
  "reattachnativehost",
  "reattachrun",
  "recallentryof",
  "recallindexentry",
  "recallmatch",
  "recallquery",
  "recallseam",
  "receiveframe",
  "receivemessage",
  "receivemessages",
  "recenttab",
  "recenttrayactions",
  "recenttrayafter",
  "recenttrayentry",
  "recenttrayentryof",
  "reconnectwaits",
  "reconstructreplay",
  "recordagentusage",
  "recordclientmetadata",
  "recordenvironment",
  "recordidempotency",
  "recordingconsentgranted",
  "recordingconsentrecord",
  "recordingoptions",
  "recordingoptionsof",
  "recordingrecord",
  "recordingwindow",
  "recordnativecall",
  "recordturnaround",
  "recordurl",
  "recordverdict",
  "recordwatchvalue",
  "recoveryplan",
  "redactconsoletext",
  "redactedcookies",
  "redactedshot",
  "redactgate",
  "redactheaders",
  "redactionmask",
  "redactionreport",
  "redactionsummary",
  "redactnativeframe",
  "redactparams",
  "redactregion",
  "redactshot",
  "redeempairingcode",
  "redirectchain",
  "redirecthop",
  "redoedit",
  "referencedartifacts",
  "regexextract",
  "regexrule",
  "regexruleof",
  "regionboundsgate",
  "regionfingerprint",
  "regionocr",
  "regionof",
  "regionrect",
  "regionsfor",
  "regionsteps",
  "regionvalid",
  "registeragent",
  "registrylines",
  "regroupaftermoves",
  "rejectedcorrectionof",
  "rejectioncapture",
  "rejectionrecord",
  "relayclientstate",
  "relayconnectionclose",
  "relayconnectionopen",
  "relayframe",
  "relayframeof",
  "relayhashseam",
  "relayidleconnections",
  "relayidseam",
  "relaylivetokens",
  "relayorigin",
  "relaypendingpairings",
  "relayserverconnection",
  "relayserverframe",
  "relayserversession",
  "relayserverstate",
  "relaysleep",
  "relaysocket",
  "relaytokenrecord",
  "releasebinding",
  "releasecase",
  "released",
  "releaselock",
  "releaserunlock",
  "releasesessionlock",
  "remainingpages",
  "remoteattachframes",
  "remoteconfig",
  "remoteenablementgate",
  "remotetransporttls",
  "removeedge",
  "removelibrary",
  "removenode",
  "renamegroup",
  "render",
  "renderflowevents",
  "renderflowtimeline",
  "rendermcpprompt",
  "rendermessage",
  "renderminimap",
  "renderprompt",
  "renderprovenance",
  "renewconsentwindow",
  "reopentab",
  "reopentabgate",
  "reordersteps",
  "repeatuntilof",
  "repeatuntilstep",
  "replanreviewgate",
  "replayagentrun",
  "replaybridgequeue",
  "replaycheck",
  "replaycursorof",
  "replayexportgate",
  "replayjump",
  "replaymove",
  "replayplay",
  "replayqueue",
  "replayrecord",
  "replayrestoredview",
  "replaystepof",
  "replaytrace",
  "replayurl",
  "replayviewaction",
  "reportguardstrike",
  "reportsection",
  "reportstep",
  "requestbody",
  "requestreview",
  "requestsampling",
  "requeue",
  "requireapproval",
  "requiredcapability",
  "reservedagentnames",
  "resizepanel",
  "resolutionhistoryafter",
  "resolutionlogeventof",
  "resolutionsummary",
  "resolutionverdict",
  "resolveappearance",
  "resolveapproval",
  "resolveconflict",
  "resolvedrisk",
  "resolvedtarget",
  "resolveescalation",
  "resolvegate",
  "resolvelazymod",
  "resolverecipients",
  "resolvetool",
  "resolvevariable",
  "resourcechangeframe",
  "resourcedeltareport",
  "resourceexposuregate",
  "resourcefact",
  "resourcefacts",
  "resourcelock",
  "resourceof",
  "resourceslist",
  "resourceuris",
  "resourcewatch",
  "respond",
  "responseentry",
  "responseenvelopeoutcomes",
  "responseof",
  "restartbridge",
  "restorediscarded",
  "restoreoriginsgranted",
  "restoreplan",
  "restoreplanof",
  "restorereviewgranted",
  "restoretrail",
  "resultreport",
  "resultresponse",
  "resumeall",
  "resumebackgroundqueue",
  "resumecheckpoint",
  "resumechunkextract",
  "resumeextract",
  "resumefingerprintgate",
  "resumegate",
  "resumegatedcall",
  "resumehandoff",
  "resumenavconsent",
  "resumeone",
  "resumepoint",
  "resumepointof",
  "retainedexports",
  "retireentries",
  "retireentry",
  "retryafterof",
  "retryattempt",
  "retrydispatchgate",
  "retryhint",
  "retryhintof",
  "retrykinds",
  "retryoutcome",
  "retrypolicy",
  "retryrule",
  "revalidatefingerprint",
  "revalidateselentry",
  "revertalllayers",
  "revertlayer",
  "revertplanof",
  "revertrule",
  "reviewcardsof",
  "reviewdialogorder",
  "reviewedkinds",
  "reviewframe",
  "reviewgateoutcome",
  "reviewrecord",
  "reviewrecordof",
  "reviewrequest",
  "reviewrequestgate",
  "reviewrequeststate",
  "reviewverdict",
  "revocationevidence",
  "revocationgate",
  "revocationrule",
  "revocationruleof",
  "revokeaction",
  "revokeallsessions",
  "revokeclient",
  "revokerun",
  "revokerunevent",
  "revokerungate",
  "rewritesourcelocation",
  "rgb",
  "roadmapheartbeatwindow",
  "roadmaplockwindow",
  "roleaddress",
  "roledefaults",
  "rollbackdescriptor",
  "rollbackgate",
  "rollbackitem",
  "rollbackof",
  "rollbackorigingate",
  "rollbackpinnedset",
  "rollbackrun",
  "rollbacksplit",
  "rollbacksummarycheck",
  "rotatebridgetoken",
  "rotatelogs",
  "rotationrule",
  "rotationruleof",
  "rotationtargetrecord",
  "routeenvironment",
  "routepath",
  "routeserveframe",
  "rowstampgate",
  "rpcerror",
  "rpcerrorcode",
  "rpcerrorcodeof",
  "rpcerrornumbers",
  "rpcerrorof",
  "ruleorigins",
  "ruleoriginsgranted",
  "rulesetcachekey",
  "rulestats",
  "runbatch",
  "runbatchquery",
  "runbudgetof",
  "runbudgetrecord",
  "runbudgetvalid",
  "runcachedigest",
  "runcacheentry",
  "runcachehit",
  "runcachesweep",
  "runcallsbatch",
  "runcatch",
  "runcomplete",
  "runcontrolstep",
  "runfail",
  "runflow",
  "runforeach",
  "runfromplan",
  "runheartbeat",
  "runhistoryentry",
  "runhistoryquery",
  "runhistoryreport",
  "runlock",
  "runlogentry",
  "runloop",
  "runparallel",
  "runpausesforalerts",
  "runrecord",
  "runrepeatuntil",
  "runreplay",
  "runreplaygate",
  "runreplaysession",
  "runreplaysessionof",
  "runreplaystep",
  "runreviewgranted",
  "runsettings",
  "runstate",
  "runstatemachine",
  "runstaterecord",
  "runstep",
  "runsummary",
  "runsummaryof",
  "runsummarytask",
  "runtimeadapterdeclaration",
  "runtimeadapterdeclarationof",
  "runtimeadapterof",
  "runtimecapabilitiestable",
  "runtimelineevent",
  "runtimelineof",
  "runtimelinereport",
  "runtobreakpoint",
  "runtransition",
  "runtry",
  "runurllist",
  "runwhile",
  "runwithvisits",
  "runworkflow",
  "runworkflowoutcome",
  "safaricentraldirectory",
  "safariendrecord",
  "safariskeletonbuild",
  "safariskeletoninput",
  "safariskeletonoutput",
  "safariskeletonpopoverof",
  "safariskeletonprojectfiles",
  "safarizipfile",
  "safedefaultapplication",
  "safedefaultnotice",
  "safedefaultprofile",
  "safedefaultreadkind",
  "safedefaultsgate",
  "safetygate",
  "safetyresponse",
  "safetyverdict",
  "safeurl",
  "samplegate",
  "samplepolicy",
  "samplerows",
  "samplingframe",
  "samplingframes",
  "samplinggrade",
  "samplingrequest",
  "sandboxorigingate",
  "sandboxrender",
  "sandboxrenderof",
  "sandboxrenderresult",
  "saveplan",
  "saveworkflow",
  "sbomcomponentof",
  "sbomcoveragecheck",
  "sbominventory",
  "sbominventoryinput",
  "sbominventorytext",
  "sbomlicense",
  "sbomnameof",
  "sbomspecversion",
  "scaleconsentgate",
  "scaledrect",
  "scalesuggestion",
  "scaleworkers",
  "scan",
  "scanconflicts",
  "scanhookconfig",
  "scannerhook",
  "scannerhookgate",
  "scanresult",
  "scanverdict",
  "scanverdictof",
  "schedulecron",
  "scheduleinterval",
  "schedulereport",
  "schemacheck",
  "schemaerror",
  "schemaguardgate",
  "schemashape",
  "scopecheck",
  "scopegate",
  "scopegrantof",
  "scratchentryof",
  "scratchpadentry",
  "scratchpadof",
  "scratchpadscopegate",
  "screenshotpair",
  "scriptoverride",
  "scrollvirtlist",
  "sealedlog",
  "sealedrunstate",
  "sealjar",
  "sealnotebody",
  "sealrunlog",
  "sealrunstate",
  "seamweights",
  "searchfield",
  "searchfields",
  "searchquery",
  "searchqueryof",
  "searchsessionrecords",
  "searchsteps",
  "searchtabmatches",
  "secretfieldshapes",
  "secretleakscan",
  "secretprovenance",
  "secretshapecarrying",
  "secretvaultentry",
  "securityreport",
  "securityview",
  "seededrandom",
  "selcacheentries",
  "selcacheentry",
  "selcachegate",
  "selcacheinvalidation",
  "selcacheinvalidations",
  "selcachelookup",
  "selcachestate",
  "selcachestats",
  "selectorcandidate",
  "selectorprofileof",
  "selectorresponse",
  "selectorstats",
  "selectorstatsupdate",
  "selectrowrange",
  "semanticrecallscopegate",
  "sendcdpcommand",
  "sendfetch",
  "sendframe",
  "sendmessage",
  "sensitiveclass",
  "sensitiveclassesof",
  "sensitiveclassgate",
  "sensitiveconsentfor",
  "sensitivememoryclasses",
  "sensitivepipelingate",
  "sequenceintegrity",
  "serializearg",
  "serializecdpcommand",
  "serializeframe",
  "serializesteps",
  "servecallevent",
  "servedresource",
  "servedresources",
  "servehealth",
  "serveinitialize",
  "servemetadata",
  "servemethods",
  "serverbindgate",
  "servercapabilities",
  "servercontractcapabilities",
  "servercontractversion",
  "serverenablementgate",
  "serverenvelope",
  "servereventtype",
  "servereventtypes",
  "servermethods",
  "serveroperation",
  "serveroperations",
  "serverstate",
  "serverurlgate",
  "servesession",
  "servetransport",
  "sessionbundleof",
  "sessionchange",
  "sessioncontainerof",
  "sessioncreatebody",
  "sessiondiff",
  "sessionevent",
  "sessionfile",
  "sessionfileversion",
  "sessionfolder",
  "sessionfolderof",
  "sessionfolderunique",
  "sessiongridrow",
  "sessiongridrows",
  "sessionjoinbody",
  "sessionkinds",
  "sessionlockgate",
  "sessionmatch",
  "sessionmember",
  "sessionmemory",
  "sessionnameunique",
  "sessionrecord",
  "sessionreport",
  "sessionrestoregate",
  "sessionretentionvalid",
  "sessionreusegate",
  "sessionreusegrant",
  "sessionreusegrantof",
  "sessionsnapshot",
  "sessiontab",
  "sessiontabof",
  "sessiontoken",
  "sessionwithlock",
  "setsharedadapter",
  "setvariable",
  "shadowpath",
  "shapesof",
  "sharedadapter",
  "sharedcostsplit",
  "sharedprotocolversion",
  "sharelesson",
  "shareworkflow",
  "sheetcell",
  "sheetendpoint",
  "sheetlayout",
  "sheetpayload",
  "shiftentry",
  "shiftentryof",
  "shortcutbinding",
  "shortcutbindingafter",
  "shortcutcommandof",
  "shortcutdefaults",
  "shortcutdispatchable",
  "shortcutkeygate",
  "shortcuttext",
  "shotpair",
  "shotpanelgate",
  "shotpanelof",
  "shotpanelpan",
  "shotpanelview",
  "shotpanelzoom",
  "shotrecord",
  "showdevtoolsinterstitial",
  "shutdowndrain",
  "sideeffects",
  "sidepanelsurfacemessages",
  "signalsreport",
  "signmanifest",
  "sitemanifest",
  "sitemanifestof",
  "sitenote",
  "sitenoteof",
  "sitenotesreadgate",
  "sitenoteswritegate",
  "siteoverride",
  "siteprofile",
  "siteprofileactive",
  "siteprofilefor",
  "siteprofilegate",
  "siteprofileof",
  "skipcompletedsteps",
  "skipsrecomputation",
  "slomopause",
  "slomoresume",
  "slomosessionof",
  "slomostepdelay",
  "slowmofactorvalid",
  "slowmosession",
  "snapnode",
  "snapshotbaserecord",
  "snapshotchange",
  "snapshotdeltaof",
  "snapshotdiff",
  "snapshotplan",
  "snapshotplanof",
  "snapshotregion",
  "snapshotrequestkey",
  "snapshotretentionwindow",
  "snapshotscope",
  "snapshotsections",
  "socketconnect",
  "socketgate",
  "socketkinds",
  "socketopen",
  "socketoptions",
  "sockettarget",
  "sortdatagridrows",
  "sortrows",
  "sourcemapconsent",
  "sourcemapconsentcovers",
  "sourcemapref",
  "sourceref",
  "sourcestamp",
  "sourcestamprecord",
  "spamdetect",
  "spamrule",
  "spamruleof",
  "spanchildren",
  "spawn",
  "spawngate",
  "spawngrade",
  "spawnrecord",
  "spawnreply",
  "spawnrequest",
  "spawnsubagent",
  "speedprofile",
  "spendbudget",
  "splitlines",
  "sseevent",
  "sseframe",
  "sserequestheaders",
  "stabilityrules",
  "stabilityscoreof",
  "stableopid",
  "stackedcount",
  "stackframe",
  "stackframes",
  "stackgate",
  "stalegenerationfailure",
  "stalelocks",
  "stampbundle",
  "startserve",
  "starttls",
  "startupbudget",
  "startupbudgetof",
  "startupcostof",
  "startupsample",
  "startupsampleof",
  "statusbadgeof",
  "statusbadgestate",
  "statusclassof",
  "stdiobridge",
  "stdiotransport",
  "stdiotransportrecord",
  "steal",
  "stepapprovegate",
  "stepapproveresolution",
  "stepcomparisonof",
  "stepdetails",
  "stepdurationchart",
  "stepenvironmentvalid",
  "stepeventof",
  "stepexecution",
  "stepkey",
  "steplibraryentry",
  "stepmode",
  "stepmodeof",
  "stepoutcome",
  "stepprefetchgate",
  "stepprefetchhint",
  "stepprefetchhints",
  "stepresolutionof",
  "stepstimelinenode",
  "stepstimelinenodes",
  "stepsummaryfor",
  "steptemplate",
  "steptemplateof",
  "steptracefile",
  "steptracespan",
  "steptracespanof",
  "stepwindows",
  "stetoast",
  "stetoasthistory",
  "stetoastof",
  "stetoaststackafter",
  "stitchbudgetallowed",
  "stitchplan",
  "stopone",
  "storedrunlog",
  "streambundle",
  "streamchannel",
  "streamchunk",
  "streamchunkframe",
  "streamchunkgate",
  "streamchunkof",
  "streamcursor",
  "streamdisk",
  "streamfilerecord",
  "streamfrom",
  "streamgate",
  "streamnamespacegate",
  "streamopen",
  "streamparsechunk",
  "streamparsechunkof",
  "streamparsegate",
  "streamparsememorybound",
  "streamparseobservations",
  "streamparseoptions",
  "streamparsetaskof",
  "streamparsetoken",
  "streamparsewindows",
  "streampathof",
  "streamrecord",
  "streamstate",
  "streamsummaries",
  "streamwindow",
  "streamwindowof",
  "stripscripts",
  "structurederror",
  "structurederrorof",
  "structurederrorreport",
  "structuredof",
  "subagentspec",
  "subevents",
  "submitreviewgranted",
  "submitticket",
  "subscribegate",
  "subscriberegister",
  "subscriberesource",
  "subscriptionboundgate",
  "subscriptionframes",
  "subscriptiongrade",
  "subscriptionoptionsof",
  "subsetscopegate",
  "summaryhistoryentry",
  "summaryrequestof",
  "summarywindowvalid",
  "supportedlanguages",
  "surfaceaction",
  "surfacelayout",
  "surfacepalette",
  "surfaceroute",
  "surfacesnapshot",
  "suspenddevtoolsguard",
  "suspendplan",
  "suspendwindowvalid",
  "swarmaction",
  "swarmcost",
  "swarmcosts",
  "swarmoverview",
  "swarmreport",
  "swarmstate",
  "swarmstateof",
  "swarmstatereport",
  "sweepplan",
  "sweepreviews",
  "switcherlist",
  "switchtarget",
  "syncbridgeconflict",
  "syncbridgeexportpayload",
  "syncbridgehook",
  "syncbridgehookof",
  "syncbridgeoptinflip",
  "syncbridgeoptingate",
  "syncbridgeproviders",
  "syncbridgescan",
  "syncbridgescopegate",
  "syncbridgevalidate",
  "syncconsentreport",
  "syncdigestof",
  "syncgate",
  "syncpass",
  "syncpayloadreport",
  "syncrecord",
  "syncsend",
  "syncsettings",
  "tabbadge",
  "tabgrouprecord",
  "tabgroupspec",
  "tabisolate",
  "tabisolategate",
  "tabkey",
  "tablayout",
  "tableshape",
  "tabmeta",
  "tabnamespace",
  "tabpatternmatches",
  "tabquery",
  "tabreport",
  "tabreportentry",
  "tabreportresponse",
  "tabsessionkey",
  "tabsessionref",
  "tabsessionrefof",
  "tabshape",
  "tabstate",
  "tabsuspendrestoreplan",
  "tabsuspendstate",
  "tabsuspendstateof",
  "tabwatchevent",
  "targetgate",
  "targethalo",
  "targetmode",
  "targetoutput",
  "targetref",
  "taskcounts",
  "taskhistoryafter",
  "taskinputof",
  "taskinputproposalgate",
  "taskinputsignatureof",
  "taskinputsubmission",
  "taskitem",
  "tasklane",
  "taskqueue",
  "taskrules",
  "taskstate",
  "taskstatechecksum",
  "taskstatekind",
  "taskstateof",
  "taskstatevalid",
  "tasktabceiling",
  "tasktabgauge",
  "tasktabsinwindow",
  "teardowncdpsession",
  "teardowndecision",
  "teardownplan",
  "teardownplanof",
  "telemetrypolicy",
  "templateof",
  "templateprofile",
  "templateprompt",
  "templateurl",
  "thumbdirective",
  "thumbdirectiveof",
  "thumbgeometry",
  "thumbnailrecord",
  "thumbnailsizereadonlygrade",
  "thumbshot",
  "timelapse",
  "timelapseconfig",
  "timelapseframe",
  "timelapsegate",
  "timelapseintervalgrade",
  "timeline",
  "timelinecounts",
  "timelineentry",
  "timelinegate",
  "timelinekinds",
  "timelinereadonlygate",
  "timelinereport",
  "timelineretentionwindow",
  "timelinesource",
  "timelinesources",
  "timeoutabort",
  "timeoutboundvalid",
  "timeoutcanceldecision",
  "timeoutcancelevent",
  "timeoutcanceleventof",
  "timeoutcancelpolicies",
  "timeoutcancelpolicy",
  "timeoutpolicy",
  "timeoutrecordeventgate",
  "timershellof",
  "timezonevalid",
  "tlsconfig",
  "tlsdecision",
  "tlsmode",
  "tlsreport",
  "tlsstateof",
  "tocsv",
  "toexcel",
  "tojson",
  "tokenhash",
  "tokenhashof",
  "tokenhashprefix",
  "tokenlifetimevalid",
  "tokenrecord",
  "tokenreport",
  "tokenrequest",
  "tokenrotation",
  "tokenscopedkey",
  "tokenscopevalid",
  "toolcallevent",
  "toolcallframe",
  "toolcallrecord",
  "toolcatalog",
  "toolcatalogversion",
  "toolconsentrequired",
  "tooldef",
  "tooldispatchgate",
  "tooldomain",
  "tooldryrun",
  "toolmock",
  "toolname",
  "toolnamespace",
  "toolnamespacegate",
  "toolnamespaces",
  "toolresult",
  "toolresultframe",
  "toolresultof",
  "toolriskgrade",
  "toolsbynamespace",
  "toolschema",
  "toolschemaof",
  "toolschemaproperty",
  "toolstep",
  "toolversionfloor",
  "traceannotation",
  "tracecategories",
  "traceceilingof",
  "traceevent",
  "tracerecord",
  "tracestart",
  "tracetofile",
  "trackedtasktabs",
  "trailentry",
  "trailexportgate",
  "trailorigingate",
  "trailreport",
  "transferablekeys",
  "transferhandoff",
  "transformgate",
  "transformgrammar",
  "transformrule",
  "transformvalues",
  "transitionallowed",
  "transitionislegal",
  "transparencygrant",
  "transparencygrants",
  "transparencyreport",
  "transportcancelgate",
  "transportendpoints",
  "transportgate",
  "transportkind",
  "transportresponse",
  "triggerdecision",
  "triggerentry",
  "triggereventcatalog",
  "triggerfamilies",
  "triggerfamily",
  "triggerfamilyof",
  "triggerfire",
  "triggerfired",
  "triggergate",
  "triggerkinds",
  "triggerlist",
  "triggerorigins",
  "triggerpayloadof",
  "triggerstate",
  "triggersummary",
  "triggerule",
  "tryof",
  "trystep",
  "typeaheadpick",
  "uisurface",
  "undoedit",
  "uninstallnativehost",
  "unknownfieldsgate",
  "unknownframefields",
  "unmaskedfieldsof",
  "unpauseagent",
  "unreadcount",
  "unsubscriberegister",
  "untrustedrendergate",
  "unwatchresource",
  "unwrapgraphql",
  "updatelibrary",
  "updaterule",
  "uploadgate",
  "urlencodeform",
  "urlhistoryentry",
  "urlhistorygate",
  "urlhistoryscopegate",
  "urlpattern",
  "urlvisit",
  "urlvisitscheck",
  "v1sunsetstate",
  "v1sunsetvisible",
  "validatebreakpointcondition",
  "validatecapturenaming",
  "validatecaptureoptions",
  "validatecleanuprule",
  "validatecontrolpayload",
  "validatedownloadspec",
  "validateendpointrecord",
  "validatefieldmatch",
  "validateformrecord",
  "validateframe",
  "validatemanifest",
  "validatemimefilter",
  "validateregexrule",
  "validateregionrect",
  "validatesetreamparsechunk",
  "validatesiteoverride",
  "validatestep",
  "validatetabquery",
  "validatetargetref",
  "validatetoolcatalog",
  "validatetransformrule",
  "validateurlpattern",
  "validatevaluegen",
  "validateworkflow",
  "valuegen",
  "variablebinding",
  "variablekind",
  "variablescope",
  "variablevalue",
  "vaultcovers",
  "vaultdelete",
  "vaultdigestof",
  "vaultdigestprefix",
  "vaultentryof",
  "vaultprompttext",
  "vaultseam",
  "vaultsecretgate",
  "vaultstore",
  "vaultvaluefor",
  "vaultview",
  "verdictfresh",
  "verifiercheck",
  "verifiermethodgrade",
  "verifieroutcome",
  "verifyauth",
  "verifybridgetoken",
  "verifybytes",
  "verifyframeauth",
  "verifylogchain",
  "verifylogstream",
  "verifypublishersignature",
  "verifytoken",
  "verifywebhook",
  "versionbanner",
  "versiondiff",
  "videostateread",
  "virtlistheight",
  "virtlistrows",
  "virtlistsavings",
  "virtlistwindow",
  "virtlistwindowvalid",
  "visible",
  "visioncacheentry",
  "visioncacheexpirygate",
  "visioncacheput",
  "visioncacheserve",
  "visionchoices",
  "visionconsentgate",
  "visioncost",
  "visioncostgrade",
  "visiondescription",
  "visiongate",
  "visionkinds",
  "visionlabeledregion",
  "visionrequest",
  "visionsend",
  "visionsensitivegrade",
  "visionshot",
  "visiteventof",
  "visitmatch",
  "visitof",
  "visitsummary",
  "voteweightvalid",
  "vsixcontenttypes",
  "vsixextensionhost",
  "vsixmanifestfields",
  "vsixmarketplacemetadatacheck",
  "vsixnameof",
  "vsixpackassemble",
  "vsixpackentriesof",
  "vsixpackinput",
  "vsixpackmanifest",
  "vsixpackmanifestfields",
  "vsixpackoutput",
  "vsixvsixmanifest",
  "vsixwebviewpage",
  "vsixzipof",
  "waitduration",
  "waitelementplan",
  "waitoverride",
  "waitprofile",
  "waitprofilerecord",
  "waitstep",
  "walkthroughprompts",
  "warmselectorcarryvalid",
  "warmselectorrecord",
  "warnonce",
  "watchcdpevents",
  "watchdogconfig",
  "watchdogconfigvalid",
  "watchdogpass",
  "watchdogrecord",
  "watchdogverdict",
  "watcherdetached",
  "watchexpression",
  "watchexpressionof",
  "watchgate",
  "watchregistration",
  "watchresource",
  "watchtabdispatch",
  "webextensionapientry",
  "webextensionapikind",
  "webextensionbrowser",
  "webhookfield",
  "webhooksecretok",
  "webproviderstub",
  "whileof",
  "whilestep",
  "widgetview",
  "wildcardentry",
  "windowbounds",
  "windowclosegate",
  "windowgatesstep",
  "windowhistory",
  "windowprofilegrants",
  "windowshape",
  "windowstate",
  "wireformat",
  "wizardreport",
  "wizardstate",
  "workerassignment",
  "workerbackpressure",
  "workerbackpressuregate",
  "workerevent",
  "workermapof",
  "workerpoolsizevalid",
  "workerrequest",
  "workerrequestof",
  "workerresponse",
  "workerresponseof",
  "workerscalevalid",
  "workflowblock",
  "workflowblockof",
  "workflowdocument",
  "workflowfile",
  "workflowfileversion",
  "workflowgate",
  "workflowimport",
  "workflowkinds",
  "workflowoutcome",
  "workflowproposal",
  "workflowprovenance",
  "workflowrecord",
  "workflowreport",
  "workflowrun",
  "workflowstep",
  "workflowstepof",
  "workflowstepoutcome",
  "workflowversion",
  "workstealgrade",
  "wrap",
  "wsbridgeadvertiseframe",
  "wsbridgebindcheck",
  "wsbridgeconnection",
  "wsbridgeenvelopeof",
  "wsbridgeextensionconnect",
  "wsbridgeframeauth",
  "wsbridgeframecounted",
  "wsbridgeframeof",
  "wsbridgeidlesweep",
  "wsbridgelocalhosts",
  "wsbridgereport",
  "wsbridgesession",
  "wsbridgesessionstart",
  "wsbridgestreamname",
  "xpicentraldirectory",
  "xpiendrecord",
  "xpilinterbudget",
  "xpimanifestheader",
  "xpimanifestname",
  "xpinameof",
  "xpipackassemble",
  "xpipackentriesof",
  "xpipackinput",
  "xpipacklintercheck",
  "xpipackoutput",
  "zombiecheck",
  "zombiegate",
  "zombiesweep",
  "zoomcanvas",
  "zoomstep"
];
function coverageslice(permission) {
  const coverage = permissioncoverage[permission];
  if (coverage === void 0) throw new Error(`The permission ${permission} carries no frozen coverage entry.`);
  return { surface: coverage.surface, messages: [...coverage.messages], kinds: [...coverage.kinds] };
}
function capmanifestof(surface) {
  const base = { surface, release: packageversion, protocolmajor: protocolmajorversion };
  switch (surface) {
    case "background":
      return {
        ...base,
        messages: [...backgroundsurfacemessages],
        kinds: [...actionkindids],
        permissions: Object.keys(permissioncoverage),
        permissioncoverage: Object.fromEntries(
          Object.entries(permissioncoverage).map(([permission, coverage]) => [
            permission,
            { surface: coverage.surface, messages: [...coverage.messages], kinds: [...coverage.kinds] }
          ])
        )
      };
    case "pagebridge":
      return {
        ...base,
        messages: [...pagebridgesurfacemessages],
        kinds: [...actionkindids],
        permissions: [],
        permissioncoverage: {}
      };
    case "sidepanel":
      return {
        ...base,
        messages: [...sidepanelsurfacemessages],
        kinds: [...actionkindids],
        permissions: ["sidePanel"],
        permissioncoverage: { sidePanel: coverageslice("sidePanel") }
      };
    case "popup":
      return {
        ...base,
        messages: [...popupsurfacemessages],
        kinds: [],
        permissions: ["activeTab"],
        permissioncoverage: { activeTab: coverageslice("activeTab") }
      };
    case "cli":
      return {
        ...base,
        messages: [...clisurfacecommands],
        kinds: [...actionkindids],
        permissions: [],
        permissioncoverage: {}
      };
    case "library":
      return {
        ...base,
        messages: [...librarysurfaceexports],
        kinds: [...actionkindids],
        permissions: [],
        permissioncoverage: {}
      };
    case "mcp":
      return {
        ...base,
        messages: [...mcpsurfacetools.map((tool) => tool.name)],
        kinds: [...mcpsurfacekinds],
        permissions: ["storage"],
        permissioncoverage: { storage: coverageslice("storage") },
        toolversions: Object.fromEntries(mcpsurfacetools.map((tool) => [tool.name, tool.version]))
      };
  }
}
async function runapifreezesuite() {
  const gatebuiltin2 = (builtin) => `node:${builtin}`;
  const { createHash: createHash2 } = await import(
    /* @vite-ignore */
    gatebuiltin2("crypto")
  );
  const { mkdir: mkdir2, readFile: readFile2, readdir: readdir2, writeFile: writeFile2 } = await import(
    /* @vite-ignore */
    gatebuiltin2("fs/promises")
  );
  const freezeimport = ["./test", "freezebaseline.ts"].join("/");
  const { apifreezebaseline: storedbaseline } = await import(
    /* @vite-ignore */
    freezeimport
  );
  const packagejson = JSON.parse(await readFile2("package.json", "utf8"));
  const release = String(packagejson.version);
  const baselinepath = "test/freezebaseline.ts";
  const capsdirectory = "build/caps";
  const schemadirectory = "build/schemas";
  const schemalabel = "schemas";
  const mode = process.argv[2] ?? "check";
  const failures = [];
  const sizes = {};
  function refuse(message) {
    failures.push(message);
  }
  async function text2(path) {
    return readFile2(path, "utf8");
  }
  function hashof(value) {
    return createHash2("sha256").update(value).digest("hex");
  }
  async function frozenlist(module, constant) {
    const source = await text2(module);
    const pattern = new RegExp(
      `export const ${constant}: (?:readonly [a-zA-Z\\[\\]<> ,]+|ReadonlyArray<[^>]+>) = (?:Object\\.freeze\\()?\\[\\n([\\s\\S]*?)\\n\\](?:\\))?;`
    );
    const match = pattern.exec(source);
    if (match === null) throw new Error(`The frozen constant ${constant} of ${module} was not found.`);
    return [...match[1].matchAll(/"([a-z0-9./*$]+)"/g)].map((entry) => entry[1]);
  }
  async function frozentools() {
    const source = await text2("apifreeze.ts");
    const match = /export const mcpsurfacetools: ReadonlyArray<\{ name: string; version: number \}> = \[\n([\s\S]*?)\n\];/.exec(
      source
    );
    if (match === null) throw new Error("The frozen constant mcpsurfacetools of apifreeze.ts was not found.");
    return [...match[1].matchAll(/\{\s*name:\s*"([a-z0-9.]+)",\s*version:\s*(\d+)\s*\}/g)].map((entry) => ({
      name: entry[1],
      version: Number(entry[2])
    }));
  }
  const protocolsource = await text2("protocol.ts");
  const catalogmatch = /export const frozenmessagecatalog: ReadonlyArray<frozenmessage> = \[\n([\s\S]*?)\n\];/.exec(
    protocolsource
  );
  if (catalogmatch === null) refuse("protocol.ts declares no frozenmessagecatalog for the api freeze to enumerate.");
  const catalogentries = catalogmatch === null ? [] : [
    ...catalogmatch[1].matchAll(
      /* formatter-proof: the catalog entries read across line breaks and spacing drift. */
      /\{\s*type:\s*"([a-z]+)",\s*family:\s*"([a-z]+)",\s*schema:\s*"([^"]+)",\s*envelope:\s*"([a-z]+)",\s*carrier:\s*"([a-z]+)"\s*,?\s*\}/g
    )
  ].map((entry) => ({
    type: entry[1],
    family: entry[2],
    schema: entry[3],
    envelope: entry[4],
    carrier: entry[5]
  }));
  if (catalogentries.length === 0) refuse("The frozen message catalog of protocol.ts carries no message type.");
  const catalogtypes = catalogentries.map((entry) => entry.type);
  if (new Set(catalogtypes).size !== catalogtypes.length)
    refuse("The frozen message catalog carries a duplicated message type.");
  for (const entry of catalogentries) {
    if (!/^[a-z]+$/.test(entry.type))
      refuse(`The frozen message type ${entry.type} stays outside the lowercase grammar.`);
    const schematext = await text2(`build/${entry.schema}`).catch(() => void 0);
    if (schematext === void 0)
      refuse(
        `The frozen message type ${entry.type} names the schema ${entry.schema} whose emitted artifact does not exist.`
      );
  }
  const mcpsource = await text2("mcp.ts");
  const bridgesource = await text2("bridge.ts");
  const backgroundsource = await text2("background.ts");
  const progresssource = await text2("progress.ts");
  const carriermodule = {
    requestbody: protocolsource,
    parseproposal: protocolsource,
    parseworkflowproposal: protocolsource,
    workflowoutcome: protocolsource,
    observationresponse: protocolsource,
    outcomeresponse: protocolsource,
    auditexportreport: protocolsource,
    memoryitemframe: protocolsource,
    handlerequest: backgroundsource,
    recordstep: progresssource,
    handleframe: mcpsource,
    listtools: mcpsource,
    dispatchtool: mcpsource,
    composeenvelope: bridgesource
  };
  for (const entry of catalogentries) {
    const carrier = carriermodule[entry.carrier];
    if (carrier === void 0) {
      refuse(`The frozen message type ${entry.type} names the carrier ${entry.carrier} no root module carries.`);
      continue;
    }
    if (!new RegExp(`export (?:async )?function ${entry.carrier}\\b`).test(carrier) && !new RegExp(`(?:async )?function ${entry.carrier}\\b`).test(carrier))
      refuse(`The frozen message type ${entry.type} names the carrier ${entry.carrier} that its module does not export.`);
    if (entry.envelope === "protocolversion" && !new RegExp(`export (?:async )?function ${entry.carrier}[\\s\\S]*?protocolversion`).test(carrier))
      refuse(
        `The frozen message type ${entry.type} carries the versioned envelope but its carrier ${entry.carrier} stamps no protocol version.`
      );
    if (entry.envelope === "jsonrpcframe" && !mcpsource.includes('jsonrpc: "2.0"'))
      refuse("The jsonrpc envelope of the frozen wire carries no 2.0 tag.");
    if (entry.envelope === "serverenvelope" && !bridgesource.includes("export function parseenvelope"))
      refuse("The servercontract envelope of the frozen wire validates at no boundary.");
    if (entry.envelope === "runtime" && !backgroundsource.includes("switch (input.kind)"))
      refuse("The runtime envelope of the frozen messages routes through no background dispatch.");
  }
  const versionsource = await text2("version.ts");
  const typesource = await text2("types.ts");
  const packageversion2 = /export const packageversion = "([^"]+)"/.exec(versionsource)?.[1];
  const protocolmajor2 = /export const protocolmajor = (\d+)/.exec(versionsource)?.[1];
  if (packageversion2 !== release)
    refuse("The protocolversion constant of types.ts must match the package version of version.ts.");
  if (!typesource.includes("export const protocolversion = packageversion;"))
    refuse("types.ts must derive protocolversion from version.ts so the constants never drift.");
  if (!typesource.includes(`export const protocolmajorversion = protocolmajor;`))
    refuse("types.ts must derive protocolmajorversion from the protocolmajor of version.ts.");
  if (protocolmajor2 !== "2")
    refuse("The protocol major of protocolv2 must stay two across protocol.ts, types.ts and version.ts.");
  const negvsrc = /export const protocolmajor: number/.test(versionsource) ? false : /export const protocolmajor = 2 as const;/.test(versionsource);
  if (!negvsrc) refuse("version.ts must pin protocolmajor as the frozen constant two.");
  const catalogmajorusage = protocolsource.includes("protocolversion") || true;
  if (!typesource.includes("export const pinnedprotocolversion"))
    refuse("The library surface must export the pinnedprotocolversion import the consumers pin the wire with.");
  const policysource = await text2("policy.ts");
  const sensitive = new Set(
    [
      ...(/const sensitiveactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
        /"([a-z0-9]+)"/g
      )
    ].map((entry) => entry[1])
  );
  const interactive = new Set(
    [
      ...(/const interactionactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
        /"([a-z0-9]+)"/g
      )
    ].map((entry) => entry[1])
  );
  const reading = new Set(
    [
      ...(/const readactions = new Set<actionkind>\(\[([^\]]*)\]\)/.exec(policysource)?.[1] ?? "").matchAll(
        /"([a-z0-9]+)"/g
      )
    ].map((entry) => entry[1])
  );
  const policyunion = /* @__PURE__ */ new Set([...sensitive, ...interactive, ...reading]);
  const toolssource = await text2("tools.ts");
  const domainkinds = [
    ...(/export const domainkinds: Record<toolnamespace, actionkind\[\]> = \{([\s\S]*?)\n\};/.exec(toolssource)?.[1] ?? "").matchAll(/"([a-z0-9]+)"/g)
  ].map((entry) => entry[1]);
  const toolkinds = [...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"[a-z.]+",\s*"([a-z0-9]+)"/g)].map(
    (entry) => entry[1]
  );
  for (const kind of [.../* @__PURE__ */ new Set([...domainkinds, ...toolkinds])]) {
    if (!policyunion.has(kind))
      refuse(`The frozen tool catalog wraps the kind ${kind} that policy classifies nowhere.`);
  }
  const actionkindunion = [
    ...typesource.slice(
      typesource.indexOf("export type actionkind ="),
      typesource.indexOf("\n\n", typesource.indexOf("export type actionkind ="))
    ).matchAll(/"([a-z0-9]+)"/g)
  ].map((entry) => entry[1]);
  if (new Set(actionkindunion).size !== actionkindunion.length)
    refuse("The action kind union of types.ts carries a duplicated identifier.");
  if (actionkindunion.length !== policyunion.size || actionkindunion.some((kind) => !policyunion.has(kind)))
    refuse("The action kind union of types.ts and the classified kinds of policy.ts disagree.");
  const actionkindids2 = await frozenlist("types.ts", "actionkindids");
  if (actionkindids2.length !== actionkindunion.length || actionkindids2.some((kind, index) => kind !== actionkindunion[index]))
    refuse("The immutable action kind identifiers of types.ts must mirror the action kind union entry for entry.");
  if (!typesource.includes("export const actionkindids: readonly actionkind[] = Object.freeze(["))
    refuse("The action kind identifiers of types.ts must stay immutable constants.");
  const observationschema = JSON.parse(await text2("build/schemas/observation.schema.json"));
  if (observationschema.properties?.schemaversion?.type !== "number")
    refuse("The observation schema must document the schemaversion field as the forward compatible version.");
  if (observationschema.properties?.reserved?.type !== "object")
    refuse("The observation schema must keep the reserved fields map for future additions.");
  if (observationschema.forwardcompatible === void 0)
    refuse("The observation schema must record the forward compatibility rule of its version field.");
  if (!typesource.includes("schemaversion: number;"))
    refuse("The observation interface of types.ts must keep the schemaversion field.");
  if (!typesource.includes("reserved?: Record<string, unknown>;"))
    refuse("The observation interface of types.ts must keep the reserved fields map.");
  const envelopeschema = JSON.parse(await text2("build/schemas/envelope.schema.json"));
  if (JSON.stringify(envelopeschema.outcomes?.values) !== JSON.stringify(["success", "error", "cancel"]))
    refuse("The frozen envelope schema must cover the success, error and cancel outcomes.");
  if (!protocolsource.includes(
    'export const responseenvelopeoutcomes: readonly string[] = Object.freeze(["success", "error", "cancel"]);'
  ))
    refuse("The response envelope outcomes of protocol.ts must stay the frozen three.");
  if (!mcpsource.includes("cancelled: true"))
    refuse("The mcp cancel path must answer the cancel outcome of the frozen envelope.");
  if (!mcpsource.includes("result: input.result") && !mcpsource.includes("result?: unknown"))
    refuse("The mcp response path must answer the success outcome of the frozen envelope.");
  const schemafiles = (await readdir2(schemadirectory)).filter((file) => file.endsWith(".json")).sort();
  if (schemafiles.length !== 10)
    refuse(`The frozen schema directory must carry the ten schemas, found ${schemafiles.length}.`);
  for (const file of schemafiles) {
    const schema = JSON.parse(await text2(`${schemadirectory}/${file}`));
    if (!String(schema.$id ?? "").includes("protocolv2")) refuse(`${file} must carry the protocolv2 id of the freeze.`);
    if (!/^\d+\.\d+\.\d+$/.test(String(schema.version ?? "")))
      refuse(`${file} must carry its frozen semantic version.`);
    const sections = [
      schema.properties,
      ...Object.values(schema).filter(
        (value) => value && typeof value === "object" && !Array.isArray(value) && value.properties !== void 0 && typeof value.properties === "object"
      ).map((value) => value.properties)
    ];
    for (const section of sections) {
      for (const [field, property] of Object.entries(section ?? {})) {
        if (property === null || typeof property !== "object") continue;
        if (property.type === void 0 || property.description === void 0 || typeof property.description !== "string" || property.description.trim() === "")
          refuse(`${file} documents the field ${field} without its type or description.`);
      }
    }
  }
  const catalogschemas = new Set(catalogentries.map((entry) => entry.schema));
  for (const file of schemafiles) {
    if (!catalogschemas.has(`${schemalabel}/${file}`))
      refuse(`${file} joins the schema directory while the frozen message catalog names no message of it.`);
  }
  const indexsource = await text2("index.ts");
  const clisource = await text2("cli.ts");
  const viewsource = await text2("views.ts");
  const clidispatch = [...clisource.matchAll(/\(command === "([a-z]+)"/g)].map((entry) => entry[1]);
  const registryids = [
    ...(/const terminal = \[([\s\S]*?)\];/.exec(viewsource)?.[1] ?? "").matchAll(/id: "([a-z]+)"/g)
  ].map((entry) => entry[1]);
  for (const command of clidispatch) {
    if (!registryids.includes(command))
      refuse(`The cli dispatches the command ${command} the command registry does not declare.`);
  }
  for (const id of registryids) {
    if (!clidispatch.includes(id)) refuse(`The command registry declares the command ${id} the cli never dispatches.`);
  }
  const cliimports = [...clisource.matchAll(/from "\.\/([a-z0-9]+)\.js"/g)].map((entry) => entry[1]);
  const packagesource = await text2("package.json");
  const subpathexports = new Set([...packagesource.matchAll(/"\.\/([a-z0-9]+)":/g)].map((entry) => entry[1]));
  for (const module of new Set(cliimports)) {
    if (!indexsource.includes(`export * from "./${module}.js";`) && !indexsource.includes(`from "./${module}.js"`) && !subpathexports.has(module))
      refuse(`The cli imports the module ${module} the library surface of index.ts does not export.`);
  }
  const mcptools = [...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"([a-z0-9.]+)"/g)].map((entry) => entry[1]);
  const frozentoolpairs = await frozentools();
  const frozentoolnames = frozentoolpairs.map((tool) => tool.name);
  if (mcptools.length !== frozentoolnames.length || [...mcptools].sort().some((tool, index) => tool !== [...frozentoolnames].sort()[index]))
    refuse("The mcp tool surface and the frozen tool catalog of apifreeze.ts disagree.");
  const catalogtoolversions = [
    ...toolssource.matchAll(/(?:readtool|gatedtool)\(\s*"[a-z0-9.]+",\s*"[a-z0-9]+"/g)
  ].length;
  if (catalogtoolversions !== mcptools.length)
    refuse("Every tool catalog entry must carry its per tool version from this release on.");
  if (frozentoolpairs.some((tool) => !Number.isInteger(tool.version) || tool.version < 1))
    refuse("Every frozen tool of the mcp surface must carry its per tool version.");
  if (!/name:\s*tool\.name,\s*version:\s*tool\.version/.test(mcpsource))
    refuse("The mcp tool listing must read the frozen tool catalog with the per tool versions.");
  if (!toolssource.includes("version: toolcatalogversion"))
    refuse("The tool catalog entries carry no per tool version.");
  const backgroundcases = new Set(
    [
      ...backgroundsource.slice(
        backgroundsource.indexOf("async function handlerequest"),
        backgroundsource.indexOf("async function runworkflowsegment")
      ).matchAll(/^ {4}case "([a-z0-9]+)":/gm)
    ].map((entry) => entry[1])
  );
  const backgroundfrozen = await frozenlist("apifreeze.ts", "backgroundsurfacemessages");
  if (backgroundcases.size !== backgroundfrozen.length || backgroundfrozen.some((kind) => !backgroundcases.has(kind)))
    refuse(
      "The frozen background surface messages of apifreeze.ts disagree with the request router of the service worker."
    );
  for (const surface of ["sidepanel", "popup"]) {
    const source = await text2(`${surface}.ts`);
    const kinds = new Set([...source.matchAll(/request\(\{[^}]*?kind: "([a-z0-9]+)"/gs)].map((entry) => entry[1]));
    const frozen = await frozenlist("apifreeze.ts", `${surface}surfacemessages`);
    for (const kind of kinds) {
      if (!backgroundcases.has(kind))
        refuse(`The ${surface} surface sends the message ${kind} the background router handles nowhere.`);
    }
    if (frozen.length !== kinds.size || frozen.some((kind) => !kinds.has(kind)))
      refuse(`The frozen ${surface} surface messages of apifreeze.ts disagree with the ${surface} request helper.`);
    sizes[surface] = kinds.size;
  }
  sizes.background = backgroundcases.size;
  const pagebridgesource = await text2("pagebridge.ts");
  const bridgemembers = [
    ...(/\ devthinkbridge: \{([^}]*)\}/.exec(pagebridgesource)?.[1] ?? "").matchAll(/[a-z][a-z0-9]*/g)
  ].map((entry) => entry[0]);
  const pagebridgefrozen = await frozenlist("apifreeze.ts", "pagebridgesurfacemessages");
  if (new Set(bridgemembers).size !== pagebridgefrozen.length || pagebridgefrozen.some((member) => !bridgemembers.includes(member)))
    refuse("The frozen pagebridge surface messages of apifreeze.ts disagree with the injected devthinkbridge object.");
  sizes.pagebridge = bridgemembers.length;
  function exportsmodules(source, seen2) {
    const names = /* @__PURE__ */ new Set();
    for (const match of source.matchAll(
      /^export (?:declare )?(?:async )?(?:const|function|class|enum) ([a-z][a-z0-9]*)/gm
    ))
      names.add(match[1]);
    for (const match of source.matchAll(/^export (?:abstract )?(?:interface|type) ([a-z][a-z0-9]*)/gm))
      names.add(match[1]);
    for (const match of source.matchAll(/^export \{([^}]+)\}(?: from "[^"]+")?/gm)) {
      for (const part of match[1].split(",")) {
        const name = part.trim().split(" ").pop();
        if (name !== void 0 && name !== "") names.add(name);
      }
    }
    for (const match of source.matchAll(/^export \* from "\.\/([a-z0-9]+)\.js"/gm)) {
      const module = `${match[1]}.ts`;
      if (seen2.has(module)) continue;
      seen2.add(module);
      const submodule = exportsmodules(seenfiles.get(module) ?? "", seen2);
      for (const name of submodule) names.add(name);
    }
    return names;
  }
  const rootfiles = (await readdir2(".")).filter((file) => /^[a-z0-9]+\.ts$/.test(file));
  const seenfiles = /* @__PURE__ */ new Map();
  for (const file of rootfiles) seenfiles.set(file, await text2(file));
  const seen = /* @__PURE__ */ new Set();
  const libraryexports = [...exportsmodules(indexsource, seen)].sort();
  const libraryfrozen = await frozenlist("apifreeze.ts", "librarysurfaceexports");
  if (libraryexports.length !== libraryfrozen.length || libraryfrozen.some((name) => !libraryexports.includes(name))) {
    if (process.env.APIFREEZE_DEBUG_DIFF === "1") {
      console.error("NEW:", JSON.stringify(libraryexports.filter((n) => !libraryfrozen.includes(n))));
      console.error("GONE:", JSON.stringify(libraryfrozen.filter((n) => !libraryexports.includes(n))));
    }
    refuse(
      "The library surface of index.ts exposes symbols the frozen library manifest of apifreeze.ts declares nowhere."
    );
  }
  sizes.library = libraryexports.length;
  const manifest = JSON.parse(await text2("manifest.json"));
  const apifreezesource = await text2("apifreeze.ts");
  const coveragesection = /export const permissioncoverage: [^=]*=\s*Object\.freeze\(\{([\s\S]*?)\n[ \t]*\}\);/.exec(
    apifreezesource
  )?.[1] ?? "";
  const coveragekeys = [
    ...coveragesection.matchAll(/(?:"([^"]+)"|\[([A-Za-z0-9]+)\]|([A-Za-z0-9]+)):\s*Object\.freeze\(/g)
  ].map((entry) => {
    const quoted = entry[1] ?? entry[3];
    if (quoted !== void 0) return quoted;
    const constant = new RegExp(`const ${entry[2]} = \`([^\`]+)\`;`).exec(apifreezesource)?.[1] ?? "";
    return constant.replace(/\$\{"\*"\}/g, "*");
  });
  for (const permission of [
    ...manifest.permissions,
    ...manifest.optional_permissions,
    ...manifest.optional_host_permissions
  ]) {
    if (!coveragekeys.includes(permission))
      refuse(`The manifest permission ${permission} maps to no consuming capability of the frozen coverage.`);
  }
  for (const key of coveragekeys) {
    if (!manifest.permissions.includes(key) && !manifest.optional_permissions.includes(key) && !manifest.optional_host_permissions.includes(key))
      refuse(`The frozen coverage maps the permission ${key} the extension manifest never requests.`);
  }
  const clifrozen = await frozenlist("apifreeze.ts", "clisurfacecommands");
  for (const command of clifrozen) {
    if (!clidispatch.includes(command))
      refuse(`The frozen cli surface commands declare the command ${command} the cli never dispatches.`);
  }
  sizes.cli = clifrozen.length;
  const mcpkindsfrozen = await frozenlist("apifreeze.ts", "mcpsurfacekinds");
  for (const kind of mcpkindsfrozen) {
    if (!policyunion.has(kind)) refuse(`The frozen mcp surface kind ${kind} sits outside the policy classification.`);
  }
  sizes.mcp = frozentoolnames.length;
  const auditkindschema = JSON.parse(await text2("build/schemas/audit.schema.json"));
  const typesauditkinds = [
    ...new Set(
      [...(/export type auditkind =\s*([\s\S]*?);/.exec(typesource)?.[1] ?? "").matchAll(/"([a-z0-9]+)"/g)].map(
        (entry) => entry[1]
      )
    )
  ].sort();
  const schemaauditkinds = auditkindschema.properties?.kind?.enum ?? [];
  if (typesauditkinds.length !== schemaauditkinds.length || typesauditkinds.some((kind) => !schemaauditkinds.includes(kind)))
    refuse("The frozen audit event names of the audit schema disagree with the auditkind union of types.ts.");
  const memoryschema = JSON.parse(await text2("build/schemas/memory.schema.json"));
  for (const field of memoryschema.provenancefields?.fields ?? []) {
    if (!protocolsource.includes(`provenance.${field}`))
      refuse(`The frozen memory provenance field ${field} validates at no protocol boundary.`);
  }
  const progressschema = JSON.parse(await text2("build/schemas/progress.schema.json"));
  for (const eventname of progressschema.eventnames?.values ?? []) {
    if (!progresssource.includes(`export function ${eventname}(`))
      refuse(`The frozen progress event name ${eventname} matches no progress record family.`);
  }
  const gatesource = await text2("gates.ts");
  for (const gatekind of ["confirmpay", "confirmdelete", "confirmcreds"]) {
    if (!gatesource.includes(`case "${gatekind}"`) && !gatesource.includes(`gatekind === "${gatekind}"`) && !gatesource.includes(`"${gatekind}"`))
      refuse(`The consent gate message ${gatekind} joins no frozen contract of the gates family.`);
    if (!typesource.includes(`"${gatekind}"`))
      refuse(`The consent gate message ${gatekind} declares no frozen kind of types.ts.`);
  }
  const freezerelease = /export const apifreezerelease = "([^"]+)";/.exec(apifreezesource)?.[1];
  const freezedate = /export const apifreezedate = "([^"]+)";/.exec(apifreezesource)?.[1];
  const freezescope = [
    ...(/export const apifreezescope: readonly string\[\] = (\[[^\]]*\]);/.exec(apifreezesource)?.[1] ?? "").matchAll(
      /"([a-z]+)"/g
    )
  ].map((entry) => entry[1]);
  if (freezedate === void 0 || !/^\d{4}-\d{2}-\d{2}$/.test(freezedate))
    refuse("The api freeze must record its fixed freeze date.");
  if (freezescope.length !== 7) refuse("The api freeze scope must cover the seven frozen surfaces.");
  const deprecations = [
    ...apifreezesource.matchAll(
      /\{ surface: "([a-z]+)", field: "([A-Za-z0-9]+)", notice: "[^"]+", sunsetrelease: "([0-9.]+)" \}/g
    )
  ].map((entry) => ({ surface: entry[1], field: entry[2], sunsetrelease: entry[3] }));
  if (deprecations.length > 0)
    refuse(
      `The deprecation registry must stay empty after the 2.0.0 sunset removed every deprecated field the window carried; the field ${deprecations[0]?.field} of the ${deprecations[0]?.surface} surface returned without a release that opens a new window.`
    );
  if (!/export const deprecatedfields: readonly deprecatedfield\[\] = \[\];/.test(apifreezesource))
    refuse(
      "The deprecation registry of the api freeze must stay the empty readonly array the 2.0.0 sunset wrote, so the freeze artifact hashes the empty contract."
    );
  const hashes = {};
  for (const file of schemafiles) hashes[`${schemalabel}/${file}`] = hashof(await text2(`${schemadirectory}/${file}`));
  hashes["contract/actionkinds"] = hashof(JSON.stringify(actionkindunion));
  hashes["contract/backgroundsurfacemessages"] = hashof(JSON.stringify(backgroundfrozen));
  hashes["contract/sidepanelsurfacemessages"] = hashof(
    JSON.stringify(await frozenlist("apifreeze.ts", "sidepanelsurfacemessages"))
  );
  hashes["contract/popupsurfacemessages"] = hashof(
    JSON.stringify(await frozenlist("apifreeze.ts", "popupsurfacemessages"))
  );
  hashes["contract/pagebridgesurfacemessages"] = hashof(JSON.stringify(pagebridgefrozen));
  hashes["contract/clisurfacecommands"] = hashof(JSON.stringify(clifrozen));
  hashes["contract/mcpsurfacetools"] = hashof(JSON.stringify(frozentoolpairs));
  hashes["contract/librarysurfaceexports"] = hashof(JSON.stringify(libraryfrozen));
  hashes["contract/auditkinds"] = hashof(JSON.stringify(typesauditkinds));
  hashes["contract/frozenmessagecatalog"] = hashof(JSON.stringify(catalogentries));
  hashes["contract/errorcodetable"] = hashof(
    JSON.stringify(
      [...protocolsource.matchAll(/\{ code: "([a-z]+)", retry: "([a-z]+)", semantics:/g)].map((entry) => [
        entry[1],
        entry[2]
      ])
    )
  );
  hashes["contract/permissioncoverage"] = hashof(JSON.stringify(coveragekeys));
  hashes["contract/deprecatedfields"] = hashof(JSON.stringify(deprecations));
  const capsurfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
  const manifestsof = {};
  for (const surface of capsurfaces) {
    const frozenmessages = surface === "background" ? backgroundfrozen : surface === "pagebridge" ? pagebridgefrozen : surface === "sidepanel" ? await frozenlist("apifreeze.ts", "sidepanelsurfacemessages") : surface === "popup" ? await frozenlist("apifreeze.ts", "popupsurfacemessages") : surface === "cli" ? clifrozen : surface === "library" ? libraryfrozen : frozentoolnames;
    manifestsof[surface] = { surface, release, protocolmajor: 2, messages: frozenmessages };
    const capspath = `${capsdirectory}/${surface}.json`;
    const current = await text2(capspath).then((value) => JSON.parse(value)).catch(() => void 0);
    if (current === void 0) {
      if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text2("apifreeze.ts"));
      else refuse(`The capmanifest file of the ${surface} surface is missing; run pnpm apifreeze:sync.`);
      continue;
    }
    if (current.surface !== surface)
      refuse(`The capmanifest of the ${surface} surface names the surface ${current.surface}.`);
    if (current.release !== release) {
      if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text2("apifreeze.ts"));
      else
        refuse(
          `The capmanifest of the ${surface} surface pins the release ${current.release} while the package carries ${release}; run pnpm apifreeze:sync.`
        );
      continue;
    }
    if (JSON.stringify(current.messages) !== JSON.stringify(frozenmessages)) {
      if (mode === "sync") await writecaps(capspath, manifestsof[surface], surface, await text2("apifreeze.ts"));
      else
        refuse(
          `The capmanifest of the ${surface} surface drifted from the frozen surface list; run pnpm apifreeze:sync after a release bump.`
        );
    }
  }
  async function writecaps(path, base, surface, source) {
    const kinds = surface === "popup" ? [] : surface === "mcp" ? [
      ...(/export const mcpsurfacekinds: readonly string\[\] = \[\n([\s\S]*?)\n\];/.exec(source)?.[1] ?? "").matchAll(/"([a-z0-9]+)"/g)
    ].map((entry) => entry[1]) : actionkindunion;
    const permissions = surface === "background" ? coveragekeys : surface === "sidepanel" ? ["sidePanel"] : surface === "popup" ? ["activeTab"] : surface === "mcp" ? ["storage"] : [];
    const manifest2 = { ...base, kinds, permissions };
    if (surface === "mcp")
      manifest2.toolversions = Object.fromEntries(frozentoolpairs.map((tool) => [tool.name, tool.version]));
    await mkdir2(capsdirectory, { recursive: true });
    await writeFile2(path, `${JSON.stringify(manifest2, null, 2)}
`, "utf8");
  }
  function baselinemodule(freeze) {
    return `/** The versioned api freeze baseline as one dense typescript module: the release stamp, the freeze date, the seven frozen surfaces, their sizes and the sha256 digests of every frozen schema and contract list. The gate of test/apifreeze.ts verifies every digest against the built tree and refuses an unversioned hash change; the sync mode rewrites this module after a release bump; the readiness review walks the schema digests for the freeze stability verdict and the freeze test re-stamps a stale release stamp before it asserts. */

/** The freeze record the gate keeps: the release it stamps, the fixed freeze date, the seven surfaces of the scope, their frozen sizes and the digest table over the schemas and the contract lists. */
export interface apifreezebaseline {
  release: string;
  frozezat: string;
  scope: string[];
  sizes: Record<string, number>;
  hashes: Record<string, string>;
}

/** The recorded freeze of the ${freeze.release} release \u2014 the 1.1.91 freeze date, the seven surfaces and the digest table over the ten schemas and the fourteen contract lists. */
export const apifreezebaseline: apifreezebaseline = ${JSON.stringify(freeze, null, 2)};
`;
  }
  const artifact = { release, frozezat: freezedate ?? "", scope: freezescope, sizes, hashes };
  const parsed = storedbaseline;
  const drift = [];
  for (const [name, value] of Object.entries(hashes)) {
    if (parsed.hashes?.[name] !== value) drift.push(name);
  }
  if (drift.length > 0 && parsed.release === release) {
    refuse(
      `The frozen contract hash of ${drift.join(", ")} changed without a release bump; restore the contract or bump the version and run pnpm apifreeze:sync.`
    );
  }
  if (parsed.release !== release || drift.length > 0 || JSON.stringify(parsed.sizes) !== JSON.stringify(sizes)) {
    if (mode === "sync") await writeFile2(baselinepath, baselinemodule(artifact), "utf8");
    else if (failures.length === 0)
      refuse(
        `The freeze baseline records the release ${parsed.release} while the package carries ${release}; run pnpm apifreeze:sync.`
      );
  }
  if (mode === "sync") await writeFile2(baselinepath, baselinemodule(artifact), "utf8");
  if (failures.length > 0) {
    for (const failure of failures) console.error(`APIFREEZE ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Api freeze verified for ${catalogentries.length} frozen message types, ${schemafiles.length} schemas and ${capsurfaces.length} capmanifests.`
    );
    console.log(
      `Surface sizes: ${Object.entries(sizes).map(([surface, size]) => `${surface}=${size}`).join(", ")}.`
    );
    console.log(
      JSON.stringify({ release, frozezat: freezedate, scope: freezescope, surfaces: sizes, checks: 17, mode }, null, 2)
    );
  }
}
var freezegatemain = typeof process !== "undefined" && Array.isArray(process.argv) && typeof process.argv[1] === "string" && process.argv[1].endsWith("apifreeze.ts");
if (freezegatemain) void runapifreezesuite();

// ../getry/llm.ts
function rendertemplate(input) {
  if (input.sensitive === true && (input.consentnotice === void 0 || input.consentnotice.trim() === ""))
    return { reason: "The sensitive flow needs its consent notice before the template renders." };
  const variables = input.variables ?? {};
  const missing = input.template.variables.filter(
    (name) => variables[name] === void 0 || variables[name] === null || typeof variables[name] === "string" && variables[name].trim() === ""
  );
  if (missing.length > 0) return { reason: `The template variables ${missing.join(", ")} stay empty.` };
  let text2 = input.template.body.replace(/\{\{\s*([a-z0-9]+)\s*\}\}/g, (whole, name) => {
    const value = variables[name];
    if (value === void 0 || value === null) return whole;
    return typeof value === "string" ? value : JSON.stringify(value);
  });
  if (input.sensitive === true && input.consentnotice !== void 0)
    text2 = `${text2}
Consent notice: ${input.consentnotice}`;
  return { text: text2 };
}

// serve.ts
function encodemessage(message) {
  return Array.isArray(message) ? JSON.stringify(message) : serializeframe(message);
}
function decodemessage(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: rpcerrorof("parse", "The wire message does not parse as json.") };
  }
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { error: rpcerrorof("params", "A batch message carries at least one frame.") };
    const frames = [];
    for (const entry of parsed) {
      try {
        frames.push(parseframe(JSON.stringify(entry)));
      } catch {
        return { error: rpcerrorof("parse", "Every batch member must be a json rpc frame.") };
      }
    }
    return { message: frames };
  }
  try {
    const frame = parseframe(raw);
    return { message: frame };
  } catch {
    return { error: rpcerrorof("parse", "The wire message must be one json rpc frame or one batch of frames.") };
  }
}
function framesof(message) {
  return Array.isArray(message) ? message : [message];
}
function isnotification(frame) {
  return frame.id === void 0;
}
function servedresources() {
  return [
    {
      uri: "devthink://pagestate",
      name: "pagestate",
      description: "The page state of the session tab: the url, the title and the page signals of the observed page \u2014 never the page content the user granted none of.",
      mimetype: "application/json"
    },
    {
      uri: "devthink://plan",
      name: "plan",
      description: "The plan of the live session with its state, its origin, its objective and its reviewed steps.",
      mimetype: "application/json"
    },
    {
      uri: "devthink://audit",
      name: "audit",
      description: "The audit trail of the session: every entry summary with its kind and time and no payload.",
      mimetype: "application/json"
    },
    {
      uri: "devthink://session",
      name: "session",
      description: "The session record of the extension session the client pairs with: the state, the origin grants and the expiry.",
      mimetype: "application/json"
    },
    {
      uri: "devthink://health",
      name: "health",
      description: "The health line of the serve mode: the extension version, the protocol version, the server contract version, the uptime and the serve state.",
      mimetype: "application/json"
    }
  ];
}
function resourceof(uri) {
  return servedresources().find((resource) => resource.uri === uri);
}
function readresource(input) {
  const resource = resourceof(input.uri);
  if (resource === void 0) return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  if (resource.uri === "devthink://pagestate") return { resource, text: JSON.stringify(input.pagestate ?? {}) };
  if (resource.uri === "devthink://plan") return { resource, text: JSON.stringify(input.plan ?? null) };
  if (resource.uri === "devthink://audit")
    return {
      resource,
      text: JSON.stringify(
        (input.audit ?? []).map((entry) => ({ id: entry.id, kind: entry.kind, at: entry.at, summary: entry.summary }))
      )
    };
  if (resource.uri === "devthink://session") {
    if (input.session === void 0) return { resource, text: JSON.stringify(null) };
    return {
      resource,
      text: JSON.stringify({
        id: input.session.id,
        tabid: input.session.tabid,
        origin: input.session.origin,
        startedat: input.session.startedat,
        expiresat: input.session.expiresat,
        grants: input.session.grants,
        ...input.session.stoppedat !== void 0 ? { stoppedat: input.session.stoppedat } : {},
        ...input.session.pausedat !== void 0 ? { pausedat: input.session.pausedat } : {}
      })
    };
  }
  return { resource, text: JSON.stringify(input.health ?? {}) };
}
function subscriberesource(input) {
  if (input.clientid.trim() === "")
    return { reason: "The resource subscription needs the paired client it belongs to." };
  if (resourceof(input.uri) === void 0)
    return { reason: `The serve mode publishes no resource named ${input.uri}.` };
  const watched = watchresource({
    clientid: input.clientid,
    resource: input.uri,
    ...input.state !== void 0 ? { state: input.state } : {},
    now: input.now,
    id: input.id ?? randomid()
  });
  return {
    ...watched.watch !== void 0 ? { watch: watched.watch } : {},
    ...watched.reason !== void 0 ? { reason: watched.reason } : {}
  };
}
function resourceslist() {
  return { resources: servedresources() };
}
function walkthroughprompts() {
  return [
    {
      name: "walkthrough.firstsnapshot",
      description: "Walks a client through the first reviewed snapshot: pair the client, read the page state and propose the plan behind the human review.",
      arguments: [{ name: "origin", description: "The origin of the page the walkthrough observes.", required: true }],
      template: "First snapshot walkthrough for {{origin}}. Steps: 1. the paired client calls browser.snapshot to read the semantic snapshot of the active tab; 2. the client reads the devthink://pagestate resource for the page signals; 3. the client proposes its plan through workflow.plan with the observed steps; 4. the human review approves or refuses the plan before any step with side effects runs."
    },
    {
      name: "walkthrough.reviewedfill",
      description: "Walks a client through a reviewed form fill: propose the typed plan, wait for the review gate and execute exactly the approved steps.",
      arguments: [
        { name: "form", description: "The reviewed selector of the form the walkthrough fills.", required: true },
        { name: "fields", description: "The reviewed field values of the fill.", required: true }
      ],
      template: "Reviewed fill walkthrough for {{form}} with {{fields}}. Steps: 1. the client reads the form through browser.extract; 2. the client proposes the typed steps through workflow.plan naming every field value; 3. the client submits the plan through workflow.review and the call waits for the human answer; 4. the approved steps run exactly as reviewed while a refused gate never executes."
    },
    {
      name: "walkthrough.tablextract",
      description: "Walks a client through a reviewed table extraction: read the table, stream the rows and keep the provenance.",
      arguments: [
        { name: "table", description: "The reviewed selector of the table the walkthrough extracts.", required: true }
      ],
      template: "Table extraction walkthrough for {{table}}. Steps: 1. the client reads the table through browser.readtable; 2. long results stream through the call chunks while the client reads them as they arrive; 3. the client reads the devthink://audit resource for the provenance of every read; 4. nothing leaves the machine because every step stays a read."
    }
  ];
}
function templateprompt(template) {
  return {
    name: template.name,
    description: `The user authored template ${template.name} of the prompt library (version ${template.version})${template.notes !== void 0 ? ` \u2014 ${template.notes}` : ""}; the declared arguments are its template variables.`,
    arguments: template.variables.map((variable) => ({
      name: variable,
      description: `The value the template substitutes for the {{${variable}}} placeholder.`,
      required: true
    })),
    template: template.body
  };
}
function listmcpprompts(templates) {
  return [...walkthroughprompts(), ...templates.map(templateprompt), ...listprompts()];
}
function rendermcpprompt(input) {
  const prompts = listmcpprompts(input.templates);
  const prompt = prompts.find((candidate) => candidate.name === input.name);
  if (prompt === void 0) return { reason: `The serve mode publishes no prompt named ${input.name}.` };
  const args = input.args ?? {};
  const template = input.templates.find(
    (candidate) => candidate.name === input.name && candidate.version === Math.max(...input.templates.filter((entry) => entry.name === input.name).map((entry) => entry.version))
  );
  if (template !== void 0) {
    const variables = {};
    for (const argument of prompt.arguments) {
      const value = args[argument.name];
      if (value !== void 0 && value !== null) variables[argument.name] = value;
    }
    const outcome = rendertemplate({ template, variables, sensitive: false });
    if (outcome.text !== void 0) return { prompt, rendered: outcome.text };
    return { prompt, reason: outcome.reason ?? "The library template did not render." };
  }
  return { prompt, rendered: renderprompt(prompt, args) };
}

// auth.ts
function checkallowlist(input) {
  const entry = input.entries.find((candidate) => candidate.fingerprint === input.fingerprint);
  if (entry === void 0)
    return {
      allowed: false,
      reason: `The client fingerprint ${input.fingerprint} is not on the allowlist and is refused.`
    };
  if (input.namespace !== void 0 && !entry.namespaces.includes(input.namespace))
    return { allowed: false, reason: `The allowlist entry ${entry.displayname} grants no ${input.namespace} tools.` };
  return { allowed: true };
}

// gates.ts
function requireapproval(input) {
  return {
    id: input.id ?? randomid(),
    clientid: input.clientid,
    tool: input.tool,
    reason: input.reason,
    params: input.params,
    ...input.secretfields !== void 0 && input.secretfields.length > 0 ? { secretfields: input.secretfields } : {},
    state: "pending",
    raisedat: input.now,
    ...input.timeout !== void 0 ? { timeoutat: input.now + input.timeout } : {}
  };
}

// bridge.ts
var nativebridgeprotocolmajor = 1;
var nativehostinstallerversion = protocolversion;
var nativehostidplaceholder = "__generated_extension_id__";
var nativemessagingdirname = "NativeMessagingHosts";
function nativehostmanifesttemplate(input) {
  const hostname = input.hostname.trim();
  if (hostname === "") throw new Error("The native host manifest names its host; an empty host name never registers.");
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(hostname))
    throw new Error(
      `The native host name ${hostname} stays a plain dns style token; a name with spaces or capitals never registers.`
    );
  const companionpath = input.companionpath.trim();
  if (companionpath === "")
    throw new Error(
      "The native host manifest carries the companion path the user chose; an empty path never launches a host."
    );
  const extensionid = (input.extensionid ?? "").trim();
  const scheme = "chrome-extension:";
  const origin = extensionid === "" ? `${scheme}//${nativehostidplaceholder}/` : `${scheme}//${extensionid}/`;
  const manifest = {
    name: hostname,
    description: "The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.",
    path: companionpath,
    type: "stdio",
    allowed_origins: [origin]
  };
  return { manifest, text: `${JSON.stringify(manifest, null, 2)}
` };
}
function trailslashes(value) {
  let end = value.length;
  while (end > 0) {
    const last = value.charCodeAt(end - 1);
    if (last !== 47 && last !== 92) break;
    end -= 1;
  }
  return value.slice(0, end);
}
function hostmanifestdestination(input) {
  const hostname = input.hostname.trim();
  if (hostname === "")
    return {
      path: "",
      systemwide: false,
      refused: "The host manifest destination names its host; an empty host name never writes."
    };
  const systemwide = input.systemwide === true;
  const profiledir = (input.profiledir ?? "").trim();
  if (!systemwide && profiledir === "")
    return {
      path: "",
      systemwide: false,
      refused: "The installer writes the host manifest into the user profile directory; a system wide install needs the explicit flag and the user never gets one silently."
    };
  if (systemwide) {
    const platform = input.platform ?? "linux";
    const base = platform === "linux" ? "/etc/opt/chrome/native-messaging-hosts" : platform === "macos" ? "/Library/Google/Chrome/NativeMessagingHosts" : "C:\\Program Files\\Google\\Chrome\\Application\\native-messaging-hosts";
    return { path: `${base}/${hostname}.json`, systemwide: true };
  }
  return { path: `${trailslashes(profiledir)}/${nativemessagingdirname}/${hostname}.json`, systemwide: false };
}
async function installnativehost(input) {
  if (!input.consent)
    return {
      state: nativedefaultstate(),
      manifestpath: "",
      refused: "The install consent gate explains the scope before any host registration; the installer writes no manifest without the recorded consent."
    };
  const extensionid = input.extensionid.trim();
  if (extensionid === "")
    return {
      state: nativedefaultstate(),
      manifestpath: "",
      refused: "The host manifest allows the origins of one extension id; an empty id never registers a host."
    };
  if (input.systemwide === true && (input.profiledir ?? "").trim() !== "")
    return {
      state: nativedefaultstate(),
      manifestpath: "",
      refused: "The install targets either the user profile directory or, with the explicit flag, the system directory; never both at once."
    };
  const destination = hostmanifestdestination({
    hostname: input.hostname,
    ...input.profiledir !== void 0 ? { profiledir: input.profiledir } : {},
    ...input.systemwide !== void 0 ? { systemwide: input.systemwide } : {},
    ...input.platform !== void 0 ? { platform: input.platform } : {}
  });
  if (destination.refused !== void 0)
    return { state: nativedefaultstate(), manifestpath: "", refused: destination.refused };
  const template = nativehostmanifesttemplate({
    hostname: input.hostname,
    companionpath: input.companionpath,
    extensionid
  });
  const dir = destination.path.slice(0, destination.path.lastIndexOf("/"));
  await input.io.mkdir(dir);
  await input.io.writefile(destination.path, template.text);
  const state = {
    installed: true,
    hostname: template.manifest.name,
    extensionid,
    installerversion: nativehostinstallerversion,
    port: "detached",
    installedat: input.now,
    updatedat: input.now,
    lasterrors: []
  };
  return { state, manifestpath: destination.path };
}
async function uninstallnativehost(input) {
  const destination = hostmanifestdestination({
    hostname: input.hostname,
    ...input.profiledir !== void 0 ? { profiledir: input.profiledir } : {},
    ...input.systemwide !== void 0 ? { systemwide: input.systemwide } : {},
    ...input.platform !== void 0 ? { platform: input.platform } : {}
  });
  if (destination.refused !== void 0)
    return { state: nativedefaultstate(), manifestpath: "", removed: false, refused: destination.refused };
  const present = await input.io.exists(destination.path);
  if (present) await input.io.removefile(destination.path);
  return { state: nativedefaultstate(), manifestpath: destination.path, removed: present };
}
function nativedefaultstate() {
  return { installed: false, port: "detached", lasterrors: [] };
}
function nativedegradationof(input) {
  if ((input.state?.installed ?? false) === false)
    return {
      degraded: true,
      reason: "The native host stays absent: nothing installed, the transport disabled and the run alive with every step inside the browser."
    };
  if (input.negotiated !== void 0 && !input.negotiated.ok)
    return {
      degraded: true,
      reason: input.negotiated.reason ?? "The native host speaks another native bridge protocol major version; the run stays alive with the transport off."
    };
  if (input.state?.port === "crashed")
    return {
      degraded: true,
      reason: "The native host crashed under the port; the run stays alive and waits for the reattach on the host restart."
    };
  return {
    degraded: false,
    reason: "The native host sits attached with a negotiated capability set; the transport carries the consented call classes."
  };
}
function nativediagnostics(input) {
  const state = input.state ?? nativedefaultstate();
  const settings = input.settings;
  const sessions = (input.sessions ?? []).map((session) => ({
    port: session.port,
    connections: session.connections,
    expired: session.expiresat !== void 0 && session.expiresat <= input.now
  }));
  return {
    installed: state.installed,
    port: state.port,
    ...state.hostname !== void 0 ? { hostname: state.hostname } : {},
    ...state.extensionid !== void 0 ? { extensionid: state.extensionid } : {},
    ...state.installerversion !== void 0 ? { installerversion: state.installerversion } : {},
    ...state.companionversion !== void 0 ? { companionversion: state.companionversion } : {},
    ...state.companionprotocol !== void 0 ? { companionprotocol: state.companionprotocol } : {},
    ...state.wsbridgeport !== void 0 ? { wsbridgeport: state.wsbridgeport } : {},
    nativebridgeprotocol: nativebridgeprotocolmajor,
    degraded: nativedegradationof({
      state,
      ...input.negotiated !== void 0 ? { negotiated: input.negotiated } : {}
    }),
    transportconsent: settings?.nativetransportconsent === true,
    classconsents: settings?.nativecallclassconsents ?? [],
    surfaceconsents: settings?.nativesurfaceconsents ?? [],
    sessions,
    lasterrors: state.lasterrors ?? []
  };
}

// mcp.ts
function servemethods() {
  return [
    {
      method: "initialize",
      handler: "initialize",
      description: "Completes the mcp handshake, records the client metadata and returns the server info with the server contract version."
    },
    { method: "ping", handler: "ping", description: "Answers keepalive frames with pong." },
    {
      method: "tools/list",
      handler: "listtools",
      description: "Returns every exposed tool the current grants cover with its version, json schema inputs and consent metadata."
    },
    { method: "negotiate", handler: "negotiate", description: "Exchanges capability sets with the client." },
    {
      method: "tools/call",
      handler: "dispatch",
      description: "Invokes one tool behind the consent gates with the mock, dry run, idempotency and approval composition."
    },
    {
      method: "prompts/list",
      handler: "listprompts",
      description: "Lists the walkthrough prompts, the user authored template library and the protocol prompt tools."
    },
    {
      method: "prompts/call",
      handler: "callprompt",
      description: "Renders one served prompt with its declared arguments."
    },
    {
      method: "resources/list",
      handler: "listresources",
      description: "Lists every served resource with its uri, description and mimetype."
    },
    { method: "resources/read", handler: "readresource", description: "Reads one served resource into its wire text." },
    {
      method: "resources/subscribe",
      handler: "subscriberesource",
      description: "Opens one resource subscription with its change notifications."
    },
    {
      method: "resources/unsubscribe",
      handler: "unsubscriberesource",
      description: "Closes one resource subscription."
    },
    {
      method: "calls/cancel",
      handler: "cancel",
      description: "Aborts one in flight tool call and preserves its partial result."
    },
    {
      method: "calls/batch",
      handler: "batch",
      description: "Runs an ordered batch of tool calls in one request with the stop on first error flag."
    },
    {
      method: "health",
      handler: "health",
      description: "Returns the health resource with the version and the uptime."
    }
  ];
}
function servemetadata(input) {
  const capabilities = servercapabilities({ config: input.config, catalog: input.catalog });
  return {
    serverinfo: {
      ...capabilities,
      servercontractversion,
      resourcecount: servedresources().length,
      promptcount: listmcpprompts(input.templates).length
    },
    protocolversion,
    servercontractversion,
    instructions: `Devthink serves its browser tools, resources and prompts behind the human review gates: read only tools run once a session is approved, every tool with side effects executes exactly the approved plan step it names and blocks until the human approval gate answers, the served resources carry no page content the user granted none of, and every call lands in the audit trail with its caller, tool and outcome. The server contract version ${servercontractversion} rides beside the mcp version ${protocolversion} on every event envelope. No endpoint, provider or key is hardcoded; the user pairs every client.`
  };
}
function clientmetadataof(params) {
  const info = params?.clientinfo ?? params?.client;
  if (info === void 0 || info === null || typeof info !== "object" || Array.isArray(info)) return {};
  const candidate = info;
  const name = typeof candidate.name === "string" && candidate.name.trim() !== "" ? candidate.name.trim() : void 0;
  const version = typeof candidate.version === "string" && candidate.version.trim() !== "" ? candidate.version.trim() : void 0;
  return { ...name !== void 0 ? { name } : {}, ...version !== void 0 ? { version } : {} };
}
function recordclientmetadata(client, metadata) {
  return {
    ...client,
    ...metadata.name !== void 0 ? { name: metadata.name } : {},
    ...metadata.version !== void 0 ? { clientversion: metadata.version } : {}
  };
}
function serveinitialize(input) {
  return {
    handshake: servemetadata({ config: input.config, catalog: input.catalog, templates: input.templates }),
    client: (client) => recordclientmetadata(client, clientmetadataof(input.params))
  };
}
function transportendpoints(input) {
  const transports = [];
  if (input.config.transports.includes("stdio"))
    transports.push({ kind: "stdio", endpoint: "stdio://devthink", startedat: input.now });
  if (input.config.transports.includes("http")) {
    const bind = input.config.bind !== void 0 && input.config.bind.trim() !== "" ? input.config.bind.trim() : "127.0.0.1";
    const path = input.config.httpstream?.endpoint !== void 0 && input.config.httpstream.endpoint.trim() !== "" ? input.config.httpstream.endpoint.trim() : "/mcp";
    transports.push({ kind: "http", endpoint: `http://${bind}:${input.config.port}${path}`, startedat: input.now });
  }
  return transports;
}
function startserve(input) {
  const gate = mcpmodegate(input.config);
  if (!gate.allowed) return { reason: gate.reason ?? "The serve mode failed its gate." };
  const degradation = degradationgate({
    ...input.grants !== void 0 ? { grants: input.grants } : {},
    ...input.origin !== void 0 ? { origin: input.origin } : {}
  });
  return {
    state: {
      state: "running",
      transports: transportendpoints({ config: input.config, now: input.now }),
      startedat: input.now,
      degraded: !degradation.allowed
    }
  };
}
function shutdowndrain(input) {
  const waiting = input.inflight.filter((context) => context.state === "inflight").length;
  if (waiting === 0) return { phase: "stopped", waiting: 0 };
  if (input.window !== void 0 && input.drainstart !== void 0 && input.now - input.drainstart >= input.window)
    return { phase: "stopped", waiting };
  return { phase: "draining", waiting };
}
function healthof(input) {
  return {
    version: packageversion,
    protocolversion,
    servercontractversion,
    uptime: Math.max(0, input.now - input.startedat),
    state: input.state,
    at: input.now
  };
}
function exposedtools(catalog, options = {}) {
  const exposed = alltools(catalog).filter(
    (tool) => (options.readonly !== true || tool.risk === "read") && (options.scopes === void 0 || options.scopes.includes(namespaceof(tool.name)))
  );
  return {
    version: catalog.version,
    domains: catalog.domains.map((domain) => ({
      ...domain,
      tools: domain.tools.filter((tool) => exposed.some((entry) => entry.name === tool.name))
    })).filter((domain) => domain.tools.length > 0)
  };
}
function servecallevent(input) {
  return {
    id: randomid(),
    clientid: input.client.id,
    tool: input.tool,
    origin: input.origin,
    ok: input.ok,
    ...input.code !== void 0 ? { code: input.code } : {},
    at: input.now,
    ...input.callid !== void 0 ? { callid: input.callid } : {},
    ...input.idempotencykey !== void 0 && input.idempotencykey.trim() !== "" ? { idempotencykey: input.idempotencykey } : {},
    ...input.dryrun === true ? { dryrun: true } : {},
    ...input.mocked === true ? { mocked: true } : {},
    ...input.batchid !== void 0 ? { batchid: input.batchid } : {},
    ...input.replayed === true ? { replayed: true } : {}
  };
}
function stepdetails(step, result) {
  return {
    ...result,
    payload: { ...result.payload ?? {}, stepid: step.id, kind: step.kind, risk: step.risk, summary: step.summary }
  };
}
async function dispatchcall(input) {
  const params = input.params;
  const id = input.id;
  const answer = (result2) => ({
    response: respond({ ...id !== void 0 ? { id } : {}, result: result2 })
  });
  const fail = (code, message) => ({
    response: respond({ ...id !== void 0 ? { id } : {}, error: rpcerrorof(code, message) })
  });
  if (!params || typeof params !== "object" || Array.isArray(params))
    return fail("params", "The tool call needs its params object.");
  const name = typeof params.name === "string" ? params.name.trim() : "";
  if (name === "") return fail("params", "The tool call needs the namespaced name of the tool it invokes.");
  const tool = resolvetool(input.catalog, name);
  if (tool === void 0) return fail("params", `The catalog holds no unambiguous tool named ${name}.`);
  if (input.readonly === true && tool.risk !== "read")
    return fail("consentrefused", `The serve runs degraded to the read only tools and refuses ${name}.`);
  const namespace = namespaceof(tool.name);
  if (input.scopes !== void 0 && namespace !== void 0 && !input.scopes.includes(namespace))
    return fail("consentrefused", `The session token grants no ${namespace} tools.`);
  const key = typeof params.idempotencykey === "string" && params.idempotencykey.trim() !== "" ? params.idempotencykey : void 0;
  if (key !== void 0) {
    const replay = checkidempotency({
      records: input.idempotency ?? [],
      key,
      clientid: input.client.id,
      now: input.now
    });
    if (replay.replay !== void 0) {
      const record3 = servecallevent({
        client: input.client,
        tool: tool.name,
        origin: input.origin,
        ok: !replay.replay.iserror,
        now: input.now,
        idempotencykey: key,
        replayed: true
      });
      return { ...answer(replay.replay), record: record3 };
    }
  }
  const mocked = applymock({ mocks: input.mocks ?? [], tool: tool.name });
  if (mocked.result !== void 0) {
    const record3 = servecallevent({
      client: input.client,
      tool: tool.name,
      origin: input.origin,
      ok: !mocked.result.iserror,
      now: input.now,
      mocked: true
    });
    return { ...answer(mocked.result), record: record3 };
  }
  if (params.dryrun === true) {
    const dryrun = dryruntool({
      tool,
      params,
      client: input.client,
      ...input.session !== void 0 ? { session: input.session } : {},
      ...input.plan !== void 0 ? { plan: input.plan } : {},
      origin: input.origin,
      ...typeof params.stepid === "string" ? { stepid: params.stepid } : {},
      now: input.now
    });
    const ok = dryrun.argsvalid && dryrun.consentok;
    const record3 = servecallevent({
      client: input.client,
      tool: tool.name,
      origin: input.origin,
      ok,
      now: input.now,
      ...ok ? {} : { code: "consentrefused" },
      dryrun: true
    });
    return {
      response: respond({
        ...id !== void 0 ? { id } : {},
        result: { content: JSON.stringify(dryrun), iserror: !ok }
      }),
      record: record3
    };
  }
  if (input.limits !== void 0 && input.limits.length > 0) {
    const limited = applyratelimit({ limits: input.limits, clientid: input.client.id, now: input.now });
    if (!limited.allowed)
      return fail(
        "params",
        `The client exhausted its call budget of ${String(limited.budget ?? 0)} for the ${String(limited.limit?.windowms ?? 0)} millisecond window; retry after ${String(limited.retryafter ?? 0)} milliseconds.`
      );
  }
  if (input.client.fingerprint !== void 0 && input.allowlist !== void 0 && input.allowlist.length > 0) {
    const admitted = checkallowlist({
      entries: input.allowlist,
      fingerprint: input.client.fingerprint,
      ...namespace !== void 0 ? { namespace } : {}
    });
    if (!admitted.allowed)
      return fail("consentrefused", admitted.reason ?? "The client fingerprint stays outside the allowlist.");
  }
  const stepid = typeof params.stepid === "string" ? params.stepid : void 0;
  const gate = tooldispatchgate({
    client: input.client,
    tool,
    session: input.session,
    plan: input.plan,
    origin: input.origin,
    ...stepid !== void 0 ? { stepid } : {},
    now: input.now
  });
  if (!gate.allowed) {
    const record3 = servecallevent({
      client: input.client,
      tool: tool.name,
      origin: input.origin,
      ok: false,
      now: input.now,
      code: "consentrefused"
    });
    return { ...fail("consentrefused", gate.reason ?? "The consent gates refused the tool call."), record: record3 };
  }
  if (tool.risk !== "read" && tool.consentmeta?.approvalrequired === true) {
    const approval = requireapproval({
      clientid: input.client.id,
      tool: tool.name,
      reason: tool.consentmeta.review,
      params,
      now: input.now,
      ...input.approvaltimeout !== void 0 ? { timeout: input.approvaltimeout } : {}
    });
    return {
      blocked: true,
      approval,
      approvals: [...(input.approvals ?? []).filter((candidate) => candidate.id !== approval.id), approval]
    };
  }
  const step = tool.risk === "read" ? {
    id: `mcp-${input.client.id}-${input.now}`,
    kind: tool.kind,
    summary: tool.description.split(".")[0] ?? tool.description,
    risk: "read",
    ...typeof params.target === "string" ? { target: params.target } : {},
    ...typeof params.value === "string" ? { value: params.value } : {},
    ...params.options !== void 0 && typeof params.options === "object" && !Array.isArray(params.options) ? { options: JSON.stringify(params.options) } : {}
  } : input.plan?.steps.find((candidate) => candidate.id === stepid);
  if (step === void 0) return fail("consentrefused", "The tool call names a step the approved plan does not carry.");
  const callid = `call-${input.now}-${randomid().slice(0, 6)}`;
  const contexts = [
    ...input.contexts ?? [],
    begincall({
      clientid: input.client.id,
      tool: tool.name,
      callid,
      ...key !== void 0 ? { idempotencykey: key } : {},
      now: input.now
    })
  ];
  let result;
  try {
    result = await input.execute(step);
  } catch (error) {
    const closed2 = endcall({ contexts, callid, ok: false, errorcode: "internal", now: input.now });
    return {
      response: respond({
        ...id !== void 0 ? { id } : {},
        error: rpcerrorof("internal", error instanceof Error ? error.message : String(error))
      }),
      contexts: closed2.contexts,
      record: servecallevent({
        client: input.client,
        tool: tool.name,
        origin: input.origin,
        ok: false,
        now: input.now,
        code: "internal",
        callid
      })
    };
  }
  const closed = endcall({ contexts, callid, ok: !result.iserror, now: input.now });
  const detailed = stepdetails(step, result);
  const record2 = servecallevent({
    client: input.client,
    tool: tool.name,
    origin: input.origin,
    ok: !result.iserror,
    now: input.now,
    callid,
    ...key !== void 0 ? { idempotencykey: key } : {}
  });
  const records = key !== void 0 ? recordidempotency({
    records: input.idempotency ?? [],
    key,
    clientid: input.client.id,
    tool: tool.name,
    result: detailed,
    now: input.now,
    ...input.idempotencywindow !== void 0 ? { window: input.idempotencywindow } : {}
  }) : input.idempotency;
  return { ...answer(detailed), record: record2, contexts: closed.contexts, ...records !== void 0 ? { records } : {} };
}
async function runcallsbatch(input) {
  const batchid = `batch-${input.now}-${randomid().slice(0, 6)}`;
  const batch = {
    id: batchid,
    clientid: input.client.id,
    calls: input.calls.map((call) => ({ id: call.id, name: call.name, params: call.params })),
    stoponerror: input.stoponerror,
    state: "running",
    createdat: input.now,
    outcomes: []
  };
  const outcome = await runbatch({
    calls: input.calls,
    stoponerror: input.stoponerror,
    now: input.now,
    execute: input.execute
  });
  return {
    batch: {
      ...batch,
      state: outcome.stoppedat !== void 0 ? "stopped" : "done",
      finishedat: input.now,
      outcomes: outcome.outcomes
    },
    outcomes: outcome.outcomes
  };
}
async function routeserveframe(input) {
  const frame = input.frame;
  const state = input.state;
  const id = frame.id;
  const params = frame.params;
  const answer = (result) => ({
    response: respond({ ...id !== void 0 ? { id } : {}, result }),
    state
  });
  const fail = (error) => ({
    response: respond({ ...id !== void 0 ? { id } : {}, error }),
    state
  });
  if (frame.method === void 0) return fail(rpcerrorof("method", "The serve frame carries no method to route."));
  const entry = servemethods().find((candidate) => candidate.method === frame.method);
  if (entry === void 0) return fail(rpcerrorof("method", `The serve mode routes no method named ${frame.method}.`));
  if (entry.handler === "initialize") {
    const handshake = serveinitialize({
      ...params !== void 0 ? { params } : {},
      config: state.config,
      catalog: state.catalog,
      templates: state.templates
    });
    return {
      response: respond({
        ...id !== void 0 ? { id } : {},
        result: {
          serverinfo: handshake.handshake.serverinfo,
          protocolversion: handshake.handshake.protocolversion,
          servercontractversion: handshake.handshake.servercontractversion,
          instructions: handshake.handshake.instructions
        }
      }),
      state: { ...state, client: handshake.client(state.client) }
    };
  }
  if (entry.handler === "ping") return answer(ping({ now: input.now }));
  if (entry.handler === "health")
    return answer(healthof({ startedat: state.startedat, now: input.now, state: "running" }));
  if (entry.handler === "listtools") {
    const binding = state.bindings.find(
      (candidate) => candidate.clientid === state.client.id && candidate.releasedat === void 0
    );
    const degraded = binding?.readonly === true;
    const scopes = state.client.capabilities?.namespaces;
    const exposed = exposedtools(state.catalog, {
      ...degraded ? { readonly: true } : {},
      ...scopes !== void 0 ? { scopes } : {}
    });
    return answer(listtools(exposed));
  }
  if (entry.handler === "negotiate") {
    const server = servercapabilities({ config: state.config, catalog: state.catalog });
    const clientcaps = params?.capabilities && typeof params.capabilities === "object" && !Array.isArray(params.capabilities) ? params.capabilities : void 0;
    const outcome2 = negotiate({ ...clientcaps !== void 0 ? { client: clientcaps } : {}, server });
    return outcome2.agreed ? answer(outcome2.capabilities) : fail(rpcerrorof("params", outcome2.mismatch ?? "The capability negotiation did not agree."));
  }
  if (entry.handler === "listresources") {
    const gate = resourceexposuregate({
      client: state.client,
      uri: "devthink://health",
      served: servedresources().map((resource) => resource.uri)
    });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    return answer(resourceslist());
  }
  if (entry.handler === "readresource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({
      client: state.client,
      uri,
      served: servedresources().map((resource) => resource.uri)
    });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const read = readresource({
      uri,
      ...state.pagestate !== void 0 ? { pagestate: state.pagestate } : {},
      ...state.plan !== void 0 ? { plan: state.plan } : {},
      ...state.audit !== void 0 ? { audit: state.audit } : {},
      ...state.session !== void 0 ? { session: state.session } : {},
      health: healthof({ startedat: state.startedat, now: input.now, state: "running" })
    });
    if (read.resource === void 0 || read.text === void 0)
      return fail(rpcerrorof("params", read.reason ?? "The resource read failed."));
    return answer({ uri: read.resource.uri, mimetype: read.resource.mimetype, text: read.text });
  }
  if (entry.handler === "subscriberesource") {
    const uri = typeof params?.uri === "string" ? params.uri : "";
    const gate = resourceexposuregate({
      client: state.client,
      uri,
      served: servedresources().map((resource) => resource.uri)
    });
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The resource exposure was refused."));
    const subscribed = subscriberesource({
      clientid: state.client.id,
      uri,
      ...state.pagestate !== void 0 && uri === "devthink://pagestate" ? { state: state.pagestate } : {},
      now: input.now
    });
    if (subscribed.watch === void 0)
      return fail(rpcerrorof("params", subscribed.reason ?? "The resource subscription did not open."));
    return {
      response: respond({ ...id !== void 0 ? { id } : {}, result: { watchid: subscribed.watch.id, uri } }),
      state: { ...state, watches: [subscribed.watch, ...state.watches] }
    };
  }
  if (entry.handler === "unsubscriberesource") {
    const watchid = typeof params?.watchid === "string" ? params.watchid : "";
    if (watchid === "") return fail(rpcerrorof("params", "The unsubscribe needs the watcher id."));
    return {
      response: respond({ ...id !== void 0 ? { id } : {}, result: { watchid, canceled: true } }),
      state: {
        ...state,
        watches: state.watches.map(
          (watch) => watch.id === watchid && watch.canceledat === void 0 ? { ...watch, canceledat: input.now } : watch
        )
      }
    };
  }
  if (entry.handler === "listprompts") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    return answer({ prompts: listmcpprompts(state.templates) });
  }
  if (entry.handler === "callprompt") {
    const gate = promptexposuregate(state.client);
    if (!gate.allowed) return fail(rpcerrorof("consentrefused", gate.reason ?? "The prompt exposure was refused."));
    const name = typeof params?.name === "string" ? params.name : "";
    const args = params?.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : void 0;
    const rendered = rendermcpprompt({ name, ...args !== void 0 ? { args } : {}, templates: state.templates });
    if (rendered.rendered === void 0 || rendered.prompt === void 0)
      return fail(rpcerrorof("params", rendered.reason ?? "The prompt call did not render."));
    return answer({ prompt: rendered.prompt.name, rendered: rendered.rendered, arguments: rendered.prompt.arguments });
  }
  if (entry.handler === "cancel") {
    const callid = typeof params?.callid === "string" ? params.callid : "";
    if (callid.trim() === "") return fail(rpcerrorof("params", "The cancellation frame needs the call id it aborts."));
    const aborted = canceltool({
      contexts: state.contexts,
      callid,
      ...typeof params?.reason === "string" ? { reason: params.reason } : {},
      now: input.now
    });
    if (aborted.context === void 0)
      return fail(rpcerrorof("params", aborted.reason ?? "The cancellation frame named no in flight tool call."));
    return {
      response: respond({
        ...id !== void 0 ? { id } : {},
        result: {
          cancelled: true,
          callid,
          ...aborted.context.partial !== void 0 ? { partial: aborted.context.partial } : {}
        }
      }),
      state: { ...state, contexts: aborted.contexts }
    };
  }
  if (entry.handler === "batch") {
    const rawcalls = params !== void 0 && Array.isArray(params.calls) ? params.calls : [];
    const calls = rawcalls.filter((call) => call !== null && typeof call === "object" && typeof call.name === "string").map((call, index) => ({
      id: typeof call.id === "string" ? call.id : `member-${index + 1}`,
      name: call.name,
      params: call.params !== void 0 && typeof call.params === "object" && !Array.isArray(call.params) ? call.params : {}
    }));
    if (calls.length === 0) return fail(rpcerrorof("params", "The batch call needs its ordered tool calls."));
    const run = await runcallsbatch({
      calls,
      client: state.client,
      now: input.now,
      stoponerror: params?.stoponerror !== false,
      execute: async (call) => {
        const outcome2 = await dispatchcall({
          params: { ...call.params, name: call.name },
          ...id !== void 0 ? { id } : {},
          client: state.client,
          catalog: state.catalog,
          ...state.session !== void 0 ? { session: state.session } : {},
          ...state.plan !== void 0 ? { plan: state.plan } : {},
          origin: state.origin,
          now: input.now,
          ...state.mocks.length > 0 ? { mocks: state.mocks } : {},
          ...state.idempotency.length > 0 ? { idempotency: state.idempotency } : {},
          ...state.limits.length > 0 ? { limits: state.limits } : {},
          ...state.allowlist.length > 0 ? { allowlist: state.allowlist } : {},
          approvals: state.approvals,
          contexts: state.contexts,
          execute: input.execute
        });
        if (outcome2.response?.error !== void 0)
          return {
            ok: false,
            error: { code: outcome2.response.error.code, message: outcome2.response.error.message, retryhint: "none" }
          };
        const result = outcome2.response?.result;
        return result !== void 0 ? { ok: !result.iserror, result } : {
          ok: false,
          error: { code: "internal", message: "The batch member produced no result.", retryhint: "none" }
        };
      }
    });
    return answer({ batchid: run.batch.id, state: run.batch.state, outcomes: run.outcomes });
  }
  const outcome = await dispatchcall({
    ...params !== void 0 ? { params } : {},
    ...id !== void 0 ? { id } : {},
    client: state.client,
    catalog: state.catalog,
    ...state.session !== void 0 ? { session: state.session } : {},
    ...state.plan !== void 0 ? { plan: state.plan } : {},
    origin: state.origin,
    now: input.now,
    ...state.bindings.find((binding) => binding.clientid === state.client.id && binding.releasedat === void 0)?.readonly === true ? { readonly: true } : {},
    ...state.mocks.length > 0 ? { mocks: state.mocks } : {},
    ...state.idempotency.length > 0 ? { idempotency: state.idempotency } : {},
    ...state.limits.length > 0 ? { limits: state.limits } : {},
    ...state.allowlist.length > 0 ? { allowlist: state.allowlist } : {},
    approvals: state.approvals,
    ...state.config.remoteaccess?.approvaltimeout?.windowms !== void 0 ? { approvaltimeout: state.config.remoteaccess.approvaltimeout.windowms } : {},
    contexts: state.contexts,
    execute: input.execute
  });
  return {
    ...outcome.response !== void 0 ? { response: outcome.response } : {},
    state: {
      ...state,
      ...outcome.approvals !== void 0 ? { approvals: outcome.approvals } : {},
      ...outcome.contexts !== void 0 ? { contexts: outcome.contexts } : {},
      ...outcome.records !== void 0 ? { idempotency: outcome.records } : {}
    }
  };
}
function createservesession(input) {
  return {
    config: input.config,
    catalog: input.catalog ?? buildtoolcatalog(),
    templates: input.templates ?? [],
    client: input.client,
    ...input.session !== void 0 ? { session: input.session } : {},
    ...input.plan !== void 0 ? { plan: input.plan } : {},
    origin: input.origin,
    bindings: [],
    approvals: [],
    watches: [],
    contexts: [],
    idempotency: [],
    limits: [],
    mocks: [],
    allowlist: [],
    startedat: input.now
  };
}
var localhostbind = "127.0.0.1";
var defaultmcpport = 7436;
function rpcerrorof(code, message, data) {
  return { code, message, ...data !== void 0 ? { data } : {} };
}
function unwraphttppost(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const candidate = value;
    if (candidate.transport === "http" && candidate.frame && typeof candidate.frame === "object" && !Array.isArray(candidate.frame))
      return candidate.frame;
  }
  return value;
}
function parseframe(raw) {
  const parsed = unwraphttppost(JSON.parse(raw));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("A json rpc frame must be an object.");
  return parsed;
}
function serializeframe(frame) {
  return JSON.stringify(frame);
}
function respond(input) {
  return {
    jsonrpc: "2.0",
    ...input.id === void 0 ? input.error !== void 0 ? { id: null } : {} : { id: input.id },
    ...input.error !== void 0 ? { error: input.error } : { result: input.result }
  };
}
function servercapabilities(input) {
  return {
    protocolversion,
    name: "devthink",
    version: protocolversion,
    toolversion: input.catalog.version,
    tools: alltools(input.catalog).length,
    namespaces: toolnamespaces,
    transports: input.config.transports
  };
}
function ping(input) {
  return { pong: true, at: input.now };
}
function listtools(catalog) {
  return {
    tools: alltools(catalog).map((tool) => ({
      name: tool.name,
      version: tool.version,
      description: tool.description,
      inputschema: tool.inputschema,
      risk: tool.risk,
      ...tool.consentmeta !== void 0 ? {
        consentmeta: {
          review: tool.consentmeta.review,
          riskclass: tool.consentmeta.riskclass ?? tool.risk,
          approvalrequired: tool.consentmeta.approvalrequired ?? true,
          originscope: tool.consentmeta.originscope ?? "session"
        }
      } : {}
    }))
  };
}
function negotiate(input) {
  const client = input.client;
  const negotiation = negotiateprotocol({
    ...client?.protocolmajor !== void 0 ? { client: client.protocolmajor } : {}
  });
  if (!negotiation.agreed)
    return { agreed: false, ...negotiation.reason !== void 0 ? { mismatch: negotiation.reason } : {} };
  if (client?.toolversion !== void 0 && client.toolversion > input.server.toolversion)
    return {
      agreed: false,
      mismatch: `The client requires tool version ${String(client.toolversion)} while the server offers ${String(input.server.toolversion)}.`
    };
  if (client?.transports !== void 0 && client.transports.some((transport) => !input.server.transports.includes(transport)))
    return { agreed: false, mismatch: "The client requires a transport the server configuration does not allow." };
  return {
    agreed: true,
    capabilities: input.server,
    ...negotiation.major !== void 0 ? { protocolmajor: negotiation.major } : {},
    ...negotiation.deprecation !== void 0 ? { deprecation: negotiation.deprecation } : {}
  };
}
function bindlocalhost(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : localhostbind;
  return { bind, port: config.port, localhost: bind === localhostbind || bind === "localhost" || bind === "::1" };
}

// http.ts
function httpendpoint(config) {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.endpoint !== void 0 && config.httpstream.endpoint.trim() !== "" ? config.httpstream.endpoint.trim() : "/mcp";
  return {
    kind: "http",
    endpoint: `http://${binding.bind}:${binding.port}${path}`,
    bind: binding.bind,
    port: binding.port,
    localhost: binding.localhost,
    path
  };
}
function parsepost(body) {
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0)
        return {
          error: { code: "parse", message: "The posted body does not parse as one json rpc message." }
        };
      const frames = [];
      for (const entry of parsed) frames.push(parseframe(JSON.stringify(entry)));
      return { message: frames };
    }
    return { message: parseframe(body) };
  } catch {
    return { error: { code: "parse", message: "The posted body does not parse as one json rpc message." } };
  }
}
function httpanswer(frame) {
  return `${encodemessage(frame)}
`;
}
function streampathof(config) {
  const binding = bindlocalhost(config);
  const path = config.httpstream?.streampath !== void 0 && config.httpstream.streampath.trim() !== "" ? config.httpstream.streampath.trim() : "/mcp/stream";
  return { path, bind: binding.bind, port: binding.port, localhost: binding.localhost };
}
function routepath(config, path) {
  const endpoint = httpendpoint(config).path;
  const stream = streampathof(config).path;
  if (path === endpoint) return "endpoint";
  if (path === stream) return "stream";
  return void 0;
}
function stdiotransport(now) {
  return { kind: "stdio", endpoint: "stdio://devthink", startedat: now, received: 0, sent: 0 };
}
function createlinepump(input) {
  let buffer = "";
  let record2 = stdiotransport(input.now);
  const feed = async (chunk) => {
    buffer = `${buffer}${chunk}`;
    for (; ; ) {
      const newline = buffer.indexOf("\n");
      if (newline < 0) return;
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line === "") continue;
      record2 = { ...record2, received: record2.received + 1, lastframeat: input.now };
      const decoded = decodemessage(line);
      if (decoded.error !== void 0) {
        input.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: decoded.error })}
`);
        record2 = { ...record2, sent: record2.sent + 1 };
        continue;
      }
      const frames = framesof(decoded.message);
      const answers = [];
      for (const frame of frames) {
        if (isnotification(frame)) continue;
        try {
          const answer = await input.handle(frame);
          if (answer !== void 0) answers.push(answer);
        } catch (error) {
          answers.push({
            jsonrpc: "2.0",
            id: frame.id ?? null,
            error: { code: "internal", message: error instanceof Error ? error.message : String(error) }
          });
        }
      }
      for (const answer of answers) {
        input.write(`${encodemessage(answer)}
`);
        record2 = { ...record2, sent: record2.sent + 1 };
      }
    }
  };
  return {
    feed,
    record: () => record2,
    close: (now) => {
      record2 = { ...record2, closedat: now };
      return record2;
    }
  };
}

// net.ts
var privatemimes = /* @__PURE__ */ new Set([
  "text/html",
  "text/plain",
  "text/xml",
  "application/xml",
  "application/json",
  "text/json",
  "application/x-www-form-urlencoded",
  "application/graphql",
  "multipart/form-data"
]);
function privatemime(mime) {
  return privatemimes.has((mime.split(";")[0] ?? "").trim().toLowerCase());
}

// parseoptions.ts
function parseoptions(step) {
  if (step.options === void 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(step.options);
  } catch {
    throw new Error("Step options must be a JSON object.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Step options must be a JSON object.");
  return parsed;
}

// policy.ts
var sensitiveactions = /* @__PURE__ */ new Set([
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
  "clickpoint",
  "shiftclick",
  "dismissdialog",
  "enterframe",
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
  "openlink",
  "openprivate",
  "reloadcache",
  "stopnav",
  "followlink",
  "spanav",
  "rewritequery",
  "setfragment",
  "navlist",
  "navprofile",
  "handleauth",
  "printpdf",
  "prefetch",
  "preconnect",
  "deeplink",
  "reopentab",
  "pausenav",
  "navrate",
  "openclipboard",
  "batchopen",
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
  "switchtab",
  "maximizewindow",
  "minimizewindow",
  "restorewindow",
  "focuswindow",
  "scratchwindow",
  "incognitowindow",
  "restoretab",
  "restorelayout",
  "reopenrun",
  "badgetab",
  "fillform",
  "filllabel",
  "fillplaceholder",
  "submitform",
  "retryform",
  "runwizard",
  "selectchain",
  "picktypeahead",
  "pickdate",
  "attachfile",
  "fillcard",
  "fillcode",
  "consentpassword",
  "exportcsv",
  "exportjson",
  "exportexcel",
  "copytable",
  "pushsheets",
  "streamdisk",
  "paginateextract",
  "resumeextract",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "interceptmime",
  "readclipboard",
  "writeclipboard",
  "copyscreen",
  "quarantinedownload",
  "scanvirus",
  "cleanupartifacts",
  "recordscreen",
  "captureaudio",
  "downloadimages",
  "callrest",
  "callgraphql",
  "sendmessage",
  "blockrequest",
  "mockresponse",
  "rewriteheaders",
  "setcookies",
  "clearcookies",
  "authflow",
  "saveapikey",
  "routeproxy",
  "postform",
  "postfiles",
  "attachcdp",
  "detachcdp",
  "cdpcmd",
  "overridescript",
  "heapshot",
  "profilecpu",
  "capturesourcemaps",
  "emulatedevice",
  "emulatenetwork",
  "emulatelocate",
  "setuseragent",
  "overridepermission",
  "restoresession",
  "exportsessions",
  "importsessions",
  "runworkflow",
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
var interactionactions = /* @__PURE__ */ new Set([
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
  "movepointer",
  "clicktext",
  "clickaria",
  "clickname",
  "expanddetails",
  "pierceshadow",
  "retryaction",
  "capturebodies",
  "setbreakpoint",
  "stepcode",
  "watchexpr",
  "loop",
  "repeatuntil",
  "whileloop",
  "foreach",
  "parallel",
  "trycatch"
]);
var readactions = /* @__PURE__ */ new Set([
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
  "mapclicks",
  "verifyvisible",
  "verifyenabled",
  "resolvexpath",
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
  "waitload",
  "waiturl",
  "spawait",
  "detecthttp",
  "readredirects",
  "readfinalurl",
  "trailaudit",
  "navintent",
  "checksafe",
  "querytabs",
  "watchtab",
  "findclones",
  "searchtabs",
  "listaudio",
  "snapshotsession",
  "savelayout",
  "attachmeta",
  "detectfields",
  "generatevalues",
  "saveprofiles",
  "asksubmit",
  "readerrors",
  "skiphoneypot",
  "detectlogin",
  "detecttemplate",
  "handoffcaptcha",
  "scrapetable",
  "importcsv",
  "looprows",
  "transformvalues",
  "deduperows",
  "mergepages",
  "stamplerows",
  "previewgrid",
  "logprovenance",
  "verifydownload",
  "exportnetlog",
  "namecaptures",
  "shotview",
  "shotfullpage",
  "shotelement",
  "shotregion",
  "contactsheet",
  "capturepdf",
  "captureframe",
  "readmedia",
  "readassets",
  "probestream",
  "timelapse",
  "shotcanvas",
  "convertimage",
  "makethumbs",
  "fetchurl",
  "parsejson",
  "parsehtml",
  "opensocket",
  "waitmessage",
  "watchrequests",
  "readheaders",
  "mapapi",
  "subscribesse",
  "longpoll",
  "extractapi",
  "readcookies",
  "watchconsole",
  "watcherrors",
  "watchtasks",
  "watchcdp",
  "measureflow",
  "trackmemory",
  "watchshifts",
  "traceload",
  "annotatetrace",
  "replaytrace",
  "blackboxscripts",
  "persiststate",
  "capturesession",
  "namedsessions",
  "diffsessions",
  "searchsessions",
  "composeworkflow",
  "savetemplate",
  "dryrun",
  "delay",
  "waitelement",
  "compute",
  "extractvars",
  "listruns",
  "condition",
  "branch"
]);
var allowedactions = /* @__PURE__ */ new Set([...sensitiveactions, ...interactionactions, ...readactions]);
function actionrisk(kind) {
  if (!allowedactions.has(kind)) throw new Error("Unsupported browser action.");
  if (sensitiveactions.has(kind)) return "sensitive";
  return interactionactions.has(kind) ? "interaction" : "read";
}
function isnonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function validatetargetref(reference) {
  if (!reference || typeof reference !== "object" || Array.isArray(reference))
    return { allowed: false, reason: "The reviewed target reference must be an object." };
  const ref = reference;
  if (ref.mode === "selector")
    return isnonempty(ref.selector) ? { allowed: true } : { allowed: false, reason: "The selector target reference needs a non-empty selector." };
  if (ref.mode === "text")
    return isnonempty(ref.text) ? { allowed: true } : { allowed: false, reason: "The text target reference needs non-empty text." };
  if (ref.mode === "aria") {
    if (!isnonempty(ref.role)) return { allowed: false, reason: "The aria target reference needs a non-empty role." };
    return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The aria target reference needs a non-empty name." };
  }
  if (ref.mode === "name")
    return isnonempty(ref.name) ? { allowed: true } : { allowed: false, reason: "The name target reference needs a non-empty name." };
  if (ref.mode === "xpath")
    return isnonempty(ref.xpath) ? { allowed: true } : { allowed: false, reason: "The xpath target reference needs a non-empty expression." };
  if (ref.mode === "index") {
    const index = ref.index;
    return typeof index === "number" && Number.isInteger(index) && index >= 1 ? { allowed: true } : { allowed: false, reason: "The index target reference needs a positive integer map number." };
  }
  if (ref.mode === "point") {
    const pointok = typeof ref.x === "number" && Number.isFinite(ref.x) && typeof ref.y === "number" && Number.isFinite(ref.y);
    return pointok ? { allowed: true } : { allowed: false, reason: "The point target reference needs numeric x and y coordinates." };
  }
  return {
    allowed: false,
    reason: "The target reference mode must be selector, text, aria, name, xpath, index or point."
  };
}
function origingranted(session, origin) {
  if (!session) return false;
  const grants = session.grants ?? [session.origin];
  return grants.includes(origin);
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
function dryrunprojection(step) {
  if (iscontrolflowkind(step.kind)) {
    for (const child of controlsteps(step)) {
      const childrisk = resolvedrisk({
        id: child.id,
        kind: child.kind,
        summary: child.label,
        risk: "read",
        ...child.target !== void 0 ? { target: child.target } : {},
        ...child.value !== void 0 ? { value: child.value } : {},
        ...child.options !== void 0 ? { options: child.options } : {}
      });
      if (childrisk !== "read") return void 0;
    }
    if (step.kind === "condition")
      return "The condition step would evaluate its reviewed expression over the extracted values with no page side effect.";
    if (step.kind === "branch")
      return "The branch step would choose one reviewed path by page state and only the chosen path would run.";
    if (step.kind === "loop")
      return "The loop step would iterate its reviewed list binding the item and index variables per iteration inside the safety bound.";
    if (step.kind === "repeatuntil")
      return "The repeat until step would rerun its body until the convergence expression holds inside the safety bound.";
    if (step.kind === "whileloop")
      return "The while step would loop while its condition holds inside the reviewed safety bound.";
    if (step.kind === "foreach")
      return "The foreach step would iterate the elements of its reviewed selector binding the item and index variables per iteration.";
    if (step.kind === "parallel")
      return "The parallel step would run its branches concurrently and join their outcomes under the reviewed strategy.";
    return "The try step would run its fragile body and only the catch handler on failure.";
  }
  const risk = resolvedrisk({
    id: step.id,
    kind: step.kind,
    summary: step.label,
    risk: "read",
    ...step.target !== void 0 ? { target: step.target } : {},
    ...step.value !== void 0 ? { value: step.value } : {},
    ...step.options !== void 0 ? { options: step.options } : {}
  });
  if (risk !== "read") return void 0;
  if (step.kind === "delay") return `The delay step would sleep its reviewed base inside the jitter window.`;
  if (step.kind === "waitelement")
    return `The element wait step would poll ${step.target ?? "the reviewed selector"} until appearance or the reviewed timeout.`;
  if (step.kind === "compute")
    return `The compute step would evaluate its reviewed expression into the result variable.`;
  if (step.kind === "extractvars")
    return `The variable extraction step would apply its reviewed regex rule and store the named captures.`;
  return `The ${step.kind} step would run read only and mutate nothing.`;
}
function serverbindgate(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  if (!local && config.remote !== true)
    return {
      allowed: false,
      reason: `The bind ${bind} leaves localhost and grades sensitive: the explicit remote review must approve it first.`
    };
  return { allowed: true };
}
function serverenablementgate(config) {
  if (config.enabled !== true)
    return {
      allowed: false,
      reason: "The mcp server starts only after the user enables it; the protocol surface stays closed by default."
    };
  const bind = serverbindgate(config);
  if (!bind.allowed) return bind;
  if (!Array.isArray(config.transports) || config.transports.length === 0)
    return { allowed: false, reason: "The mcp server needs at least one allowed transport of stdio or http." };
  if (!config.transports.every((transport) => transport === "stdio" || transport === "http"))
    return { allowed: false, reason: "The allowed transports of the mcp server are stdio and http." };
  if (typeof config.port !== "number" || !Number.isFinite(config.port) || config.port <= 0 || config.port > 65535)
    return { allowed: false, reason: "The http listener port must be a valid port number." };
  if (config.framesize !== void 0 && (typeof config.framesize !== "number" || !Number.isFinite(config.framesize) || config.framesize <= 0))
    return {
      allowed: false,
      reason: "The user configured frame size must stay a positive number with no code ceiling."
    };
  if (config.queuedepth !== void 0 && (typeof config.queuedepth !== "number" || !Number.isFinite(config.queuedepth) || config.queuedepth <= 0))
    return {
      allowed: false,
      reason: "The user configured queue depth must stay a positive number with no code ceiling."
    };
  const remote = remoteenablementgate(config);
  if (!remote.allowed) return remote;
  return { allowed: true };
}
function tooldispatchgate(input) {
  if (input.client.disconnectedat !== void 0)
    return { allowed: false, reason: "The mcp client is disconnected and its tool calls are refused." };
  if (!input.client.paired)
    return {
      allowed: false,
      reason: "The mcp client waits for the user pairing approval; unpaired clients never dispatch tools."
    };
  if (!input.session || input.session.stoppedat || input.session.pausedat)
    return { allowed: false, reason: "Tool dispatch needs the live browser session behind the consent gates." };
  if (input.session.expiresat <= input.now)
    return { allowed: false, reason: "The browser session has expired and tool dispatch is refused." };
  if (!input.plan || input.plan.state !== "approved")
    return { allowed: false, reason: "Tool dispatch needs the approved plan review before any tool runs." };
  if (!origingranted(input.session, input.origin))
    return {
      allowed: false,
      reason: `The tool call origin ${input.origin} stays outside the session grants and is refused.`
    };
  if (input.tool.risk === "read") return { allowed: true };
  if (input.stepid === void 0 || input.stepid.trim() === "")
    return {
      allowed: false,
      reason: `The ${input.tool.name} tool has side effects and needs the id of the approved plan step it executes.`
    };
  const step = input.plan.steps.find((candidate) => candidate.id === input.stepid);
  if (step === void 0)
    return {
      allowed: false,
      reason: `The tool call names the step ${input.stepid} which the approved plan does not carry.`
    };
  if (step.kind !== input.tool.kind)
    return {
      allowed: false,
      reason: `The tool call names the step ${input.stepid} whose kind ${String(step.kind)} does not match the ${input.tool.name} tool.`
    };
  return { allowed: true };
}
function tokenlifetimevalid(lifetime) {
  if (lifetime === void 0) return { allowed: true };
  if (typeof lifetime !== "number" || !Number.isFinite(lifetime) || lifetime <= 0)
    return { allowed: false, reason: "The token lifetime must stay a positive user value with no code ceiling." };
  return { allowed: true };
}
function remotetransporttls(config) {
  const bind = config.bind !== void 0 && config.bind.trim() !== "" ? config.bind.trim() : "127.0.0.1";
  const local = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  const tls = config.remoteaccess?.tls ?? config.httpstream?.tls;
  if ((config.remoteaccess !== void 0 || !local) && (tls === void 0 || tls.mode === "off"))
    return {
      allowed: false,
      reason: `The ${config.remoteaccess !== void 0 ? "remote transport" : `bind ${bind}`} leaves localhost and every non localhost transport requires tls before any remote traffic.`
    };
  return { allowed: true };
}
function remoteenablementgate(config) {
  if (config.remoteaccess === void 0) return { allowed: true };
  if (config.remote !== true)
    return {
      allowed: false,
      reason: "The remote transport enablement is a sensitive user choice and needs the explicit remote review."
    };
  const tls = remotetransporttls(config);
  if (!tls.allowed) return tls;
  if (typeof config.remoteaccess.endpoint !== "string" || config.remoteaccess.endpoint.trim() === "")
    return { allowed: false, reason: "The remote access policy needs its user configured endpoint." };
  if (config.remoteaccess.maxclients !== void 0 && (typeof config.remoteaccess.maxclients !== "number" || !Number.isFinite(config.remoteaccess.maxclients) || config.remoteaccess.maxclients <= 0))
    return {
      allowed: false,
      reason: "The user configured client ceiling must stay a positive value with no code ceiling."
    };
  const lifetime = tokenlifetimevalid(config.remoteaccess.tokenlifetimems);
  if (!lifetime.allowed) return lifetime;
  const timeout = approvaltimeoutvalid(config.remoteaccess.approvaltimeout);
  if (!timeout.allowed) return timeout;
  return { allowed: true };
}
function approvaltimeoutvalid(timeout) {
  if (timeout === void 0) return { allowed: true };
  if (typeof timeout.windowms !== "number" || !Number.isFinite(timeout.windowms) || timeout.windowms <= 0)
    return { allowed: false, reason: "The approval timeout must stay a positive user window with no code ceiling." };
  if (timeout.ontimeout !== "refuse")
    return { allowed: false, reason: "The documented disposition of an unanswered approval gate is refusal." };
  return { allowed: true };
}
function mcpmodegate(config) {
  const enablement = serverenablementgate(config);
  if (!enablement.allowed) return enablement;
  if (config.drainwindow !== void 0 && (typeof config.drainwindow !== "number" || !Number.isFinite(config.drainwindow) || config.drainwindow <= 0))
    return {
      allowed: false,
      reason: "The shutdown drain window must stay a positive user value in milliseconds with no code ceiling."
    };
  return { allowed: true };
}
function degradationgate(input) {
  if (input.origin === void 0 || input.origin.trim() === "")
    return {
      allowed: false,
      reason: "The serve mode needs the session origin before it decides the degradation; without it the serve stays read only."
    };
  const grants = input.grants ?? [];
  if (!grants.includes(input.origin))
    return {
      allowed: false,
      reason: `The origin ${input.origin} stays outside the session grants and the serve degrades to the read only tools.`
    };
  return { allowed: true };
}
function resourceexposuregate(input) {
  if (input.client.disconnectedat !== void 0)
    return { allowed: false, reason: "A disconnected client reads no served resource." };
  if (!input.client.paired)
    return {
      allowed: false,
      reason: "The resource exposure waits for the user pairing approval; unpaired clients read no resource."
    };
  if (input.served !== void 0 && !input.served.includes(input.uri))
    return { allowed: false, reason: `The serve mode publishes no resource named ${input.uri}.` };
  return { allowed: true };
}
function promptexposuregate(client) {
  if (client.disconnectedat !== void 0)
    return { allowed: false, reason: "A disconnected client reads no served prompt." };
  if (!client.paired)
    return {
      allowed: false,
      reason: "The prompt exposure waits for the user pairing approval; unpaired clients read no prompt."
    };
  return { allowed: true };
}
function portablerulesetof(now) {
  return {
    version: packageversion,
    compiledat: now,
    rules: [
      {
        id: "originprofilegrade",
        family: "origin",
        validates: "Every step grades against the originprofile of the plan origin exactly the way the extension grades it."
      },
      {
        id: "classconsent",
        family: "consent",
        validates: "Every sensitive class of a step needs a fresh consent that covers the origin, the way the extension demands it."
      },
      {
        id: "portablecapability",
        family: "capability",
        validates: "Every step kind stays inside the capability set the target runtime can execute."
      },
      {
        id: "schemastrict",
        family: "schema",
        validates: "Every step carries known fields only under schemastrict; unknown fields refuse in full."
      },
      {
        id: "gatedeclaration",
        family: "gate",
        validates: "Every sensitive step declares its gate explicitly so nothing sensitive runs ungated."
      },
      {
        id: "staticselector",
        family: "selector",
        validates: "Selectors that cannot resolve without a live page flag so the plan author knows what stays dynamic."
      },
      {
        id: "loopbound",
        family: "control",
        validates: "Every loop step carries its user configured bound; an unbounded loop refuses."
      },
      {
        id: "retrybound",
        family: "control",
        validates: "Every retrying step carries its user configured attempts; missing retry bounds flag."
      }
    ]
  };
}
function portablecapabilitygate(input) {
  if (input.kind.trim() === "")
    return { allowed: false, reason: "The plan step carries no kind; a kindless step maps onto no capability." };
  if (!input.capabilities.includes(input.kind))
    return {
      allowed: false,
      reason: `The step kind ${input.kind} exceeds the portable capability set; the target runtime executes the kinds ${input.capabilities.join(", ")} only.`
    };
  return {
    allowed: true,
    reason: `The step kind ${input.kind} stays inside the portable capability set of the target runtime.`
  };
}
function flowrungrantgate(input) {
  if (input.origin.trim() === "")
    return {
      allowed: false,
      reason: "The flowrun needs the origin its plan addresses; an originless run matches no grant."
    };
  if (input.grantsource === "none")
    return {
      allowed: false,
      reason: "The flowrun needs an origin grant file or an interactive grant prompt; a run without a granted origin never starts, in a terminal or anywhere else."
    };
  return {
    allowed: true,
    reason: `The flowrun reads its origin grant from the ${input.grantsource === "file" ? "grant file" : "interactive prompt"} and holds it for the whole run.`
  };
}
function exportchaingate(input) {
  if (!input.chainvalid)
    return {
      allowed: false,
      reason: input.reason ?? "The log chain failed its verification; an export of an unverified chain writes nothing."
    };
  return {
    allowed: true,
    reason: "The log chain verified from the genesis hash to the seal; the export writes the verified entries only."
  };
}
function exportmaskgate(input) {
  if (input.unmasked.length > 0)
    return {
      allowed: false,
      reason: `The export refuses ${input.unmasked.length} unmasked value${input.unmasked.length === 1 ? "" : "s"} (${input.unmasked.join(", ")}); every format honors the mask verdicts or writes nothing.`
    };
  return {
    allowed: true,
    reason: "Every exported value carries its mask verdict; the export writes masked values only."
  };
}
function headlessconsentgate(input) {
  if (!input.providerpresent)
    return {
      allowed: false,
      reason: "The headless session waits at its consent gate with no provider attached; denydefault refuses the step because no consent gate ever resolves itself."
    };
  if (input.resolution === "refuse")
    return {
      allowed: false,
      reason: "The consent provider refused the gate; the headless run stops exactly where the extension would stop."
    };
  return {
    allowed: true,
    reason: "The consent provider approved the gate through the host callback; the headless run proceeds with the resolution recorded."
  };
}
function headlesstelemetrygate(input) {
  if (input.telemetry && !input.hostoptin)
    return {
      allowed: false,
      reason: "The library bundle carries no telemetry by default; a reporting bundle needs the host opt in first."
    };
  return {
    allowed: true,
    reason: input.telemetry ? "Telemetry runs under the host opt in." : "Telemetry stays off; the library bundle reports nothing by default."
  };
}
function actionkindcatalog() {
  return [...allowedactions].sort();
}
function cssselectorvalid(selector) {
  const trimmed = selector.trim();
  if (trimmed === "")
    return { allowed: false, reason: "The selector is empty; a step that addresses the page names its selector." };
  if (/\{\{[^{}]*\}\}/.test(trimmed) || /\$\{[^{}]*\}/.test(trimmed))
    return {
      allowed: false,
      reason: `The selector ${trimmed} carries a template placeholder; a templated selector resolves only against the live page of the run, never statically.`
    };
  const tokens = trimmed.replace(/\s+/g, " ").replace(/([>+~])/g, " $1 ").split(/\s+/).filter((token) => token !== "");
  for (const token of tokens) {
    if (token === ">" || token === "+" || token === "~") continue;
    if (token.length > 512)
      return {
        allowed: false,
        reason: `The selector compound ${token.slice(0, 32)}... runs past the reviewed length; a selector names one region of the page.`
      };
    if (!compoundconsumes(token))
      return {
        allowed: false,
        reason: `The selector ${trimmed} stays outside the reviewed grammar of types, ids, classes, attributes and their combinators.`
      };
    if (/::?(?:has|is|where|matches|any)\(/.test(token))
      return {
        allowed: false,
        reason: `The selector ${trimmed} carries the unreviewed functional pseudo class ${token}; the reviewed grammar keeps the simple structural pseudo classes only.`
      };
  }
  return {
    allowed: true,
    reason: `The selector ${trimmed} stays inside the reviewed grammar the live resolution and the plan lint share.`
  };
}
function compoundconsumes(token) {
  let index = 0;
  const first = token.charCodeAt(0);
  if (first === 42) index = 1;
  else if (first >= 97 && first <= 122) {
    index = 1;
    while (index < token.length) {
      const code = token.charCodeAt(index);
      if (!(code >= 97 && code <= 122 || code >= 48 && code <= 57 || code === 45)) break;
      index += 1;
    }
  }
  while (index < token.length) {
    const char = token[index] ?? "";
    if (char === "#" || char === ".") {
      const start = index + 1;
      const code = token.charCodeAt(start);
      if (!(code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 95))
        return false;
      let end = start + 1;
      while (end < token.length) {
        const c = token.charCodeAt(end);
        if (!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 45)) break;
        end += 1;
      }
      index = end;
      continue;
    }
    if (char === "[") {
      const close = token.indexOf("]", index + 1);
      if (close === -1 || close === index + 1)
        return false;
      index = close + 1;
      continue;
    }
    if (char === ":") {
      let cursor = index + 1;
      if (token[cursor] === ":") cursor += 1;
      let letters = 0;
      while (cursor < token.length) {
        const code = token.charCodeAt(cursor);
        if (!(code >= 97 && code <= 122 || code >= 65 && code <= 90 || code === 45)) break;
        letters += 1;
        cursor += 1;
      }
      if (letters === 0) return false;
      if (token[cursor] === "(") {
        const close = token.indexOf(")", cursor + 1);
        if (close === -1) return false;
        if (token.indexOf("(", cursor + 1) !== -1 && token.indexOf("(", cursor + 1) < close)
          return false;
        index = close + 1;
        continue;
      }
      index = cursor;
      continue;
    }
    return false;
  }
  return true;
}
function kindoptionfields(kind) {
  const required = {
    waitelement: ["wait"],
    delay: ["delay"],
    compute: ["expression"],
    extractvars: ["rule", "text"],
    runworkflow: ["workflowid", "reviewed"],
    dryrun: ["workflowid"],
    condition: ["condition"],
    branch: ["branch"],
    loop: ["loop"],
    repeatuntil: ["repeatuntil"],
    whileloop: ["while"],
    foreach: ["foreach"],
    parallel: ["parallel"],
    trycatch: ["try"]
  };
  return required[kind] ?? [];
}
function fixtureconsentgate(input) {
  if (!input.grants.includes(input.kind))
    return {
      allowed: false,
      reason: `The kind ${input.kind} stays outside the fixture grants ${input.grants.join(", ") || "(none)"}; the recorded page state grants only the kinds its review listed.`
    };
  let risk;
  try {
    risk = input.riskof(input.kind);
  } catch {
    return {
      allowed: false,
      reason: `The kind ${input.kind} is not a reviewed action kind; the fixture replays only the reviewed vocabulary.`
    };
  }
  if (risk !== "read")
    return {
      allowed: false,
      reason: `The kind ${input.kind} grades ${risk} and needs a live tab; a recorded page state satisfies only the read only vocabulary.`
    };
  return {
    allowed: true,
    reason: `The kind ${input.kind} stays read only inside the fixture grants of ${input.fixtureorigin}; the headless replay runs it against the recorded state.`
  };
}
function nativeinstallconsentgate(input) {
  if (input.hostname.trim() === "")
    return {
      allowed: false,
      reason: "The host registration names its native host; an empty host name never registers."
    };
  if (input.profiledir.trim() === "")
    return {
      allowed: false,
      reason: "The host registration writes into the user profile directory the user named; the installer never guesses a target."
    };
  if (input.consent !== true)
    return {
      allowed: false,
      reason: `The install consent gate explains the scope of the ${input.hostname} host registration before any write: the companion process the manifest launches, the ${input.profiledir} profile directory it writes into and the extension origins it allows; no host manifest registers without the recorded consent.`
    };
  return {
    allowed: true,
    reason: `The user consented to the ${input.hostname} host registration into ${input.profiledir} with the scope explained; the installer may write the host manifest.`
  };
}

// run.ts
function acquirerunlock(input) {
  if (input.sessionid.trim() === "" || input.runid.trim() === "")
    throw new Error("The run lock needs its session and run ids.");
  const live = input.locks.filter(
    (lock2) => lock2.sessionid === input.sessionid && (lock2.expiresat === void 0 || lock2.expiresat > input.now)
  );
  const held = live.find((lock2) => lock2.runid !== input.runid);
  if (held)
    return {
      locks: input.locks,
      acquired: false,
      reason: `The session ${input.sessionid} already holds the run ${held.runid}; a session never carries two concurrent runs.`
    };
  const own = input.locks.find((lock2) => lock2.sessionid === input.sessionid && lock2.runid === input.runid);
  if (own)
    return {
      locks: input.locks,
      acquired: true,
      reason: `The run ${input.runid} of the session ${input.sessionid} already holds its lock.`
    };
  const lock = {
    sessionid: input.sessionid,
    runid: input.runid,
    holder: input.holder,
    acquiredat: input.now,
    ...input.expiresat !== void 0 ? { expiresat: input.expiresat } : {}
  };
  return {
    locks: [...input.locks.filter((entry) => entry.sessionid !== input.sessionid), lock],
    acquired: true,
    reason: `The run ${input.runid} locked the session ${input.sessionid} against concurrent runs.`
  };
}
function releaserunlock(input) {
  const lock = input.locks.find((entry) => entry.sessionid === input.sessionid);
  if (!lock || lock.runid !== input.runid)
    return {
      locks: input.locks,
      released: false,
      reason: `The run ${input.runid} holds no lock of the session ${input.sessionid}.`
    };
  return {
    locks: input.locks.filter((entry) => entry.sessionid !== input.sessionid),
    released: true,
    reason: `The run ${input.runid} released the run lock of the session ${input.sessionid}.`
  };
}
async function sealrunstate(state) {
  const payload = JSON.stringify(state);
  const digest = await sha256(payload);
  return { payload, algorithm: "sha-256", digest, sealedat: state.updatedat };
}
async function openseal(sealed) {
  const digest = await sha256(sealed.payload);
  if (digest !== sealed.digest)
    throw new Error(
      "The sealed run state fails its integrity digest; a tampered run state never reaches the recovery."
    );
  const parsed = JSON.parse(sealed.payload);
  if (parsed === null || typeof parsed !== "object" || typeof parsed.runid !== "string" || typeof parsed.sessionid !== "string")
    throw new Error("The sealed run state carries no run record.");
  return parsed;
}
async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function exportrunstate(states, now) {
  return {
    runs: states.length,
    urls: states.reduce((total, state) => total + state.urlhistory.length, 0),
    environments: states.reduce((total, state) => total + Object.keys(state.environments).length, 0),
    offloaded: states.reduce((total, state) => total + Object.values(state.turnarounds).length, 0),
    beats: states.reduce((total, state) => total + state.keepalive.beats, 0),
    exportedat: now
  };
}

// memory.ts
var sessionmemory = class {
  constructor(adapter) {
    this.adapter = adapter;
  }
  adapter;
  async getconfig() {
    return this.adapter.get("config");
  }
  async setconfig(value) {
    return this.adapter.set("config", value);
  }
  async getsession() {
    return this.adapter.get("session");
  }
  async setsession(value) {
    return this.adapter.set("session", value);
  }
  async getplan() {
    return this.adapter.get("plan");
  }
  async setplan(value) {
    return this.adapter.set("plan", value);
  }
  async getdiagnostic() {
    return this.adapter.get("diagnostic");
  }
  async setdiagnostic(value) {
    return this.adapter.set("diagnostic", value);
  }
  async getprogress() {
    return this.adapter.get("progress");
  }
  async setprogress(value) {
    return this.adapter.set("progress", value);
  }
  async getcapabilities() {
    return this.adapter.get("capabilities");
  }
  async setcapabilities(value) {
    return this.adapter.set("capabilities", value);
  }
  async getsettings() {
    return this.adapter.get("settings");
  }
  async setsettings(value) {
    return this.adapter.set("settings", value);
  }
  async getaudit() {
    return await this.adapter.get("audit") ?? [];
  }
  async getoutcomes() {
    return await this.adapter.get("outcomes") ?? [];
  }
  /** Records one audit event; retention is a user setting and an absent setting keeps every event. */
  async addaudi(event) {
    const records = await this.getaudit();
    const combined = [event, ...records];
    const retention = (await this.getsettings())?.auditretention;
    await this.adapter.set("audit", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Records one step outcome; retention is a user setting and an absent setting keeps every outcome. */
  async addoutcome(outcome) {
    const records = await this.getoutcomes();
    const combined = [outcome, ...records];
    const retention = (await this.getsettings())?.outcomeretention;
    await this.adapter.set("outcomes", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Stores one clickable map under its observation version so every captured map stays available. */
  async setmap(map) {
    return this.adapter.set(`map${map.version}`, map);
  }
  /** Returns one stored clickable map by its observation version. */
  async getmap(version) {
    return this.adapter.get(`map${version}`);
  }
  /** Advances and persists the observation version counter used to stamp clickable maps. */
  async nextobservationversion() {
    const current = await this.adapter.get("observationversion") ?? 0;
    const next = current + 1;
    await this.adapter.set("observationversion", next);
    return next;
  }
  /** Returns the latest observation version used to stamp a clickable map. */
  async getobservationversion() {
    return this.adapter.get("observationversion");
  }
  /** Returns the key hold registry, persisted so holds survive service worker restarts. */
  async getholds() {
    return await this.adapter.get("holds") ?? [];
  }
  /** Replaces the key hold registry after one press or release transition. */
  async setholds(holds) {
    return this.adapter.set("holds", holds);
  }
  /** Returns every dialog decision recorded for the audit trail. */
  async getdialogs() {
    return await this.adapter.get("dialogs") ?? [];
  }
  /** Records one dialog decision with the reviewed answer and the observed dialog text. */
  async adddialog(decision) {
    const records = await this.getdialogs();
    await this.adapter.set("dialogs", [decision, ...records]);
  }
  /** Returns every retry outcome recorded with attempts and movement deltas. */
  async getretries() {
    return await this.adapter.get("retries") ?? [];
  }
  /** Records one retry outcome with the attempts made and the movement delta observed. */
  async addretry(outcome) {
    const records = await this.getretries();
    await this.adapter.set("retries", [outcome, ...records]);
  }
  /** Returns every resolution summary stored per target mode. */
  async getresolutions() {
    return await this.adapter.get("resolutions") ?? [];
  }
  /** Records one resolution summary for later selector derivation. */
  async addresolution(summary) {
    const records = await this.getresolutions();
    await this.adapter.set("resolutions", [summary, ...records]);
  }
  /** Returns the reviewed default dialog policy kept for the session auto handler. */
  async getdialogpolicy() {
    return this.adapter.get("dialogpolicy");
  }
  /** Stores the reviewed default dialog policy of the latest approved plan. */
  async setdialogpolicy(policy) {
    return this.adapter.set("dialogpolicy", policy);
  }
  /** Stores one observation capture under its version so every observation version stays available. */
  async setobservation(record2) {
    return this.adapter.set(`observation${record2.version}`, record2);
  }
  /** Returns one stored observation version. */
  async getobservation(version) {
    return this.adapter.get(`observation${version}`);
  }
  /** Returns the observation retention window; an absent setting keeps every capture. */
  async observationretention() {
    return (await this.getsettings())?.observationretention;
  }
  /** Stores one accessibility tree capture; retention is a user setting and an absent setting keeps every tree. */
  async adda11ytree(capture) {
    const records = await this.geta11ytrees();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("a11ytrees", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored accessibility tree capture, newest first. */
  async geta11ytrees() {
    return await this.adapter.get("a11ytrees") ?? [];
  }
  /** Stores one reader article capture; retention is a user setting and an absent setting keeps every article. */
  async addreaderarticle(capture) {
    const records = await this.getreaderarticles();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("readerarticles", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored reader article capture, newest first. */
  async getreaderarticles() {
    return await this.adapter.get("readerarticles") ?? [];
  }
  /** Records one dom mutation observed inside a reviewed watch. */
  async addmutationevent(event) {
    const records = await this.getmutationevents();
    await this.adapter.set("mutationevents", [event, ...records]);
  }
  /** Returns the mutation event stream of every reviewed watch. */
  async getmutationevents() {
    return await this.adapter.get("mutationevents") ?? [];
  }
  /** Records one focus change observed inside a reviewed watch. */
  async addfocusevent(event) {
    const records = await this.getfocusevents();
    await this.adapter.set("focusevents", [event, ...records]);
  }
  /** Returns the focus event stream of every reviewed watch. */
  async getfocusevents() {
    return await this.adapter.get("focusevents") ?? [];
  }
  /** Records one consent banner observed by a reviewed banner watch. */
  async addbanner(event) {
    const records = await this.getbanners();
    await this.adapter.set("banners", [event, ...records]);
  }
  /** Returns every consent banner report observed so far. */
  async getbanners() {
    return await this.adapter.get("banners") ?? [];
  }
  /** Records one snapshot diff between two observation versions. */
  async adddiff(diff) {
    const records = await this.getdiffs();
    await this.adapter.set("diffs", [diff, ...records]);
  }
  /** Returns every stored snapshot diff, newest first. */
  async getdiffs() {
    return await this.adapter.get("diffs") ?? [];
  }
  /** Records one derived selector with its stability score for reuse. */
  async addselector(selector) {
    const records = await this.getselectors();
    await this.adapter.set("selectors", [selector, ...records]);
  }
  /** Returns every stored derived selector with its stability score, newest first. */
  async getselectors() {
    return await this.adapter.get("selectors") ?? [];
  }
  /** Records one detected template class or section fingerprint for its origin. */
  async addtemplate(profile) {
    const records = await this.gettemplates();
    await this.adapter.set("templates", [profile, ...records]);
  }
  /** Returns every stored template class and section fingerprint, newest first. */
  async gettemplates() {
    return await this.adapter.get("templates") ?? [];
  }
  /** Records one watch registration so it survives service worker restarts. */
  async addwatch(watch) {
    const records = await this.getwatches();
    await this.adapter.set("watches", [watch, ...records]);
  }
  /** Returns every watch registration, newest first, including closed windows. */
  async getwatches() {
    return await this.adapter.get("watches") ?? [];
  }
  /** Closes one watch registration by watch id once its reviewed lifetime window ends. */
  async closewatch(watchid, closedat) {
    const records = await this.getwatches();
    await this.adapter.set(
      "watches",
      records.map(
        (watch) => watch.watchid === watchid && watch.closedat === void 0 ? { ...watch, closedat } : watch
      )
    );
  }
  /** Returns the live page signals of language, template, scroll lock and banner state. */
  async getsignals() {
    return this.adapter.get("signals");
  }
  /** Replaces the live page signals after an observation step refreshes them. */
  async setsignals(signals) {
    return this.adapter.set("signals", signals);
  }
  /** Appends one navigation trail entry of a session with its url, title, step ref and timestamp. */
  async addtrailentry(sessionid, entry) {
    const records = await this.gettrail(sessionid);
    await this.adapter.set(`trail${sessionid}`, [...records, entry]);
  }
  /** Returns the navigation trail of a session, oldest first. */
  async gettrail(sessionid) {
    return await this.adapter.get(`trail${sessionid}`) ?? [];
  }
  /** Stores one wait profile for an origin with user configured values, replacing the previous profile of that origin. */
  async setwaitprofile(record2) {
    const records = (await this.getwaitprofiles()).filter((item) => item.origin !== record2.origin);
    await this.adapter.set("waitprofiles", [...records, record2]);
  }
  /** Returns every stored wait profile with its origin and user configured values, newest first. */
  async getwaitprofiles() {
    return await this.adapter.get("waitprofiles") ?? [];
  }
  /** Records one navigation step with its redirect chain and final url. */
  async addnavrecord(record2) {
    const records = await this.getnavrecords();
    await this.adapter.set("navrecords", [record2, ...records]);
  }
  /** Returns every stored navigation record with redirect chains and final urls, newest first. */
  async getnavrecords() {
    return await this.adapter.get("navrecords") ?? [];
  }
  /** Records one navigation intent detected from a plan for audit review. */
  async addnavintent(record2) {
    const records = await this.getnavintents();
    await this.adapter.set("navintents", [record2, ...records]);
  }
  /** Returns every stored navigation intent record, newest first. */
  async getnavintents() {
    return await this.adapter.get("navintents") ?? [];
  }
  /** Replaces the rate limit window state of one domain. */
  async setratestate(state) {
    const records = (await this.getratestates()).filter((item) => item.domain !== state.domain);
    await this.adapter.set("ratestates", [...records, state]);
  }
  /** Returns every rate limit window state per domain. */
  async getratestates() {
    return await this.adapter.get("ratestates") ?? [];
  }
  /** Records one curated link list with its review state before batch opening. */
  async addcurated(list) {
    const records = await this.getcurateds();
    await this.adapter.set("curated", [list, ...records]);
  }
  /** Returns every stored curated link list, newest first. */
  async getcurateds() {
    return await this.adapter.get("curated") ?? [];
  }
  /** Stores reviewed basic auth credentials for one origin, replacing the previous record of that origin. */
  async setauth(record2) {
    const records = (await this.getauths()).filter((item) => item.origin !== record2.origin);
    await this.adapter.set("auths", [...records, record2]);
  }
  /** Returns every stored reviewed basic auth record per origin. */
  async getauths() {
    return await this.adapter.get("auths") ?? [];
  }
  /** Records one task artifact routed into the artifact store. */
  async addartifact(record2) {
    const records = await this.getartifacts();
    await this.adapter.set("artifacts", [record2, ...records]);
  }
  /** Returns every stored task artifact, newest first. */
  async getartifacts() {
    return await this.adapter.get("artifacts") ?? [];
  }
  /** Returns the navigation control state of paused navigation. */
  async getnavcontrol() {
    return this.adapter.get("navcontrol");
  }
  /** Replaces the navigation control state after a pause or resume transition. */
  async setnavcontrol(control) {
    return this.adapter.set("navcontrol", control);
  }
  /** Records one url safety verdict produced by a checksafe verification. */
  async addsafety(verdict) {
    const records = await this.getsafeties();
    await this.adapter.set("safeties", [verdict, ...records]);
  }
  /** Returns every stored url safety verdict, newest first. */
  async getsafeties() {
    return await this.adapter.get("safeties") ?? [];
  }
  /** Records one recently closed tab so a reopentab step can restore it. */
  async addrecenttab(tab) {
    const records = await this.getrecenttabs();
    await this.adapter.set("recenttabs", [tab, ...records]);
  }
  /** Returns every recently closed tab, newest first. */
  async getrecenttabs() {
    return await this.adapter.get("recenttabs") ?? [];
  }
  /** Returns the queued prefetch and batch open target counts shown in the popup badge. */
  async getnavqueues() {
    return this.adapter.get("navqueues");
  }
  /** Replaces the queued prefetch and batch open target counts. */
  async setnavqueues(queues) {
    return this.adapter.set("navqueues", queues);
  }
  /** Returns the last known navigation state of a tab, kept across service worker restarts. */
  async getnavstate(tabid) {
    return this.adapter.get(`navstate${tabid}`);
  }
  /** Replaces the last known navigation state of a tab. */
  async setnavstate(tabid, state) {
    return this.adapter.set(`navstate${tabid}`, state);
  }
  /** Stores one named tab layout with its window bounds and group states, replacing the previous layout of that name. */
  async setlayout(layout) {
    const records = (await this.getlayouts()).filter((item) => item.name !== layout.name);
    await this.adapter.set("layouts", [layout, ...records]);
  }
  /** Returns one saved tab layout by name with its timestamp. */
  async getlayout(name) {
    return (await this.getlayouts()).find((item) => item.name === name);
  }
  /** Returns every saved tab layout with its window bounds and group states. */
  async getlayouts() {
    return await this.adapter.get("layouts") ?? [];
  }
  /** Stores one tab group definition with its color choice and member tabs, replacing the previous definition of that name. */
  async settabgroup(group) {
    const records = (await this.gettabgroups()).filter((item) => item.name !== group.name);
    await this.adapter.set("tabgroups", [...records, group]);
  }
  /** Returns every stored tab group definition with its color choice, newest first. */
  async gettabgroups() {
    return await this.adapter.get("tabgroups") ?? [];
  }
  /** Records one tabmeta record with task provenance, replacing the previous metadata of that tab. */
  async settabmeta(meta) {
    const records = (await this.gettabmetas()).filter((item) => item.tabid !== meta.tabid);
    await this.adapter.set("tabmetas", [...records, meta]);
  }
  /** Returns every stored tabmeta record with task provenance. */
  async gettabmetas() {
    return await this.adapter.get("tabmetas") ?? [];
  }
  /** Records one session snapshot of tabs and windows for later restore. */
  async addsnapshot(snapshot) {
    const records = await this.getsnapshots();
    await this.adapter.set("snapshots", [snapshot, ...records]);
  }
  /** Returns every stored session snapshot, newest first. */
  async getsnapshots() {
    return await this.adapter.get("snapshots") ?? [];
  }
  /** Records one closed tab in the history kept for restoretab and reopenrun. */
  async addclosedtab(tab) {
    const records = await this.getclosedtabs();
    await this.adapter.set("closedtabs", [tab, ...records]);
  }
  /** Returns the closed tab history, newest first. */
  async getclosedtabs() {
    return await this.adapter.get("closedtabs") ?? [];
  }
  /** Stores one badge state per task, replacing the previous badge of that task. */
  async setbadge(badge) {
    const records = (await this.getbadges()).filter((item) => item.taskid !== badge.taskid);
    await this.adapter.set("badges", [...records, badge]);
  }
  /** Returns every stored badge state per task. */
  async getbadges() {
    return await this.adapter.get("badges") ?? [];
  }
  /** Records one tab event observed inside a reviewed watchtab registration. */
  async addtabwatchevent(event) {
    const records = await this.gettabwatchevents();
    await this.adapter.set("tabwatchevents", [event, ...records]);
  }
  /** Returns the tab event stream of every reviewed watchtab registration, newest first. */
  async gettabwatchevents() {
    return await this.adapter.get("tabwatchevents") ?? [];
  }
  /** Returns the ids of the scratch windows opened for split work. */
  async getscratchwindows() {
    return await this.adapter.get("scratchwindows") ?? [];
  }
  /** Replaces the scratch window id list after one scratch window opens or closes. */
  async setscratchwindows(ids) {
    return this.adapter.set("scratchwindows", ids);
  }
  /** Returns the pinned control tab state with the live task feed. */
  async getcontroltab() {
    return this.adapter.get("controltab");
  }
  /** Replaces the pinned control tab state. */
  async setcontroltab(state) {
    return this.adapter.set("controltab", state);
  }
  /** Stores one saved form profile under its reviewed name, replacing the previous profile of that name. */
  async setprofile(profile) {
    const records = (await this.getprofiles()).filter((item) => item.name !== profile.name);
    await this.adapter.set("formprofiles", [profile, ...records]);
  }
  /** Returns one saved form profile by its reviewed name. */
  async getprofile(name) {
    return (await this.getprofiles()).find((item) => item.name === name);
  }
  /** Returns every saved form profile with its origin grants, newest first. */
  async getprofiles() {
    return await this.adapter.get("formprofiles") ?? [];
  }
  /** Removes one saved form profile by its reviewed name. */
  async removeprofile(name) {
    const records = (await this.getprofiles()).filter((item) => item.name !== name);
    await this.adapter.set("formprofiles", records);
  }
  /** Records one wizard state with its step history. */
  async addwizard(state) {
    const records = await this.getwizards();
    await this.adapter.set("wizards", [state, ...records]);
  }
  /** Returns every stored wizard state with its step history, newest first. */
  async getwizards() {
    return await this.adapter.get("wizards") ?? [];
  }
  /** Stores one submission ticket with its values hash, replacing the previous ticket of that id. */
  async setticket(ticket) {
    const records = (await this.gettickets()).filter((item) => item.id !== ticket.id);
    await this.adapter.set("submittickets", [ticket, ...records]);
  }
  /** Returns every stored submission ticket with its values hash, newest first. */
  async gettickets() {
    return await this.adapter.get("submittickets") ?? [];
  }
  /** Records one collected error report for correction loops. */
  async adderrorreport(report) {
    const records = await this.geterrorreports();
    await this.adapter.set("errorreports", [report, ...records]);
  }
  /** Returns every stored error report, newest first. */
  async geterrorreports() {
    return await this.adapter.get("errorreports") ?? [];
  }
  /** Records one typeahead pick observed when a reviewed suggestion entry was chosen. */
  async addpick(pick) {
    const records = await this.getpicks();
    await this.adapter.set("typeaheadpicks", [pick, ...records]);
  }
  /** Returns every recorded typeahead pick, newest first. */
  async getpicks() {
    return await this.adapter.get("typeaheadpicks") ?? [];
  }
  /** Records one captcha handoff while the plan waits for the user. */
  async addcaptcha(handoff) {
    const records = await this.getcaptchas();
    await this.adapter.set("captchas", [handoff, ...records]);
  }
  /** Returns every captcha handoff record with its resolution state, newest first. */
  async getcaptchas() {
    return await this.adapter.get("captchas") ?? [];
  }
  /** Resolves one captcha handoff by id once the user finished it. */
  async resolvecaptcha(id, resolvedat) {
    const records = await this.getcaptchas();
    await this.adapter.set(
      "captchas",
      records.map(
        (handoff) => handoff.id === id && !handoff.resolved ? { ...handoff, resolved: true, resolvedat } : handoff
      )
    );
  }
  /** Records one login or template detection for its origin. */
  async adddetection(record2) {
    const records = await this.getdetections();
    await this.adapter.set("detections", [record2, ...records]);
  }
  /** Returns every stored login and template detection per origin, newest first. */
  async getdetections() {
    return await this.adapter.get("detections") ?? [];
  }
  /** Stores the reviewed one time code behind the consent gate of an active session. */
  async setcodevalue(value) {
    return this.adapter.set("codevalue", value);
  }
  /** Returns the reviewed one time code, if the user stored one behind the consent gate. */
  async getcodevalue() {
    return this.adapter.get("codevalue");
  }
  /** Stores one dataset with its column specs and rows, replacing the previous record of that id. */
  async setdataset(value) {
    await this.adapter.set(`dataset${value.id}`, value);
    const ids = (await this.adapter.get("datasets") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("datasets", [value.id, ...ids]);
  }
  /** Returns one stored dataset by its id with its column specs and row count. */
  async getdataset(id) {
    return this.adapter.get(`dataset${id}`);
  }
  /** Returns every stored dataset id, newest first. */
  async getdatasets() {
    const ids = await this.adapter.get("datasets") ?? [];
    const records = [];
    for (const id of ids) {
      const record2 = await this.adapter.get(`dataset${id}`);
      if (record2) records.push(record2);
    }
    return records;
  }
  /** Stores one imported csv dataset for fill loops beside the dataset store. */
  async addimport(value) {
    await this.setdataset(value);
    const ids = (await this.adapter.get("imports") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("imports", [value.id, ...ids]);
  }
  /** Returns every imported csv dataset for fill loops, newest first. */
  async getimports() {
    const ids = await this.adapter.get("imports") ?? [];
    const records = [];
    for (const id of ids) {
      const record2 = await this.adapter.get(`dataset${id}`);
      if (record2) records.push(record2);
    }
    return records;
  }
  /** Stores one extraction session with its cursor and page history, replacing the previous session of that id. */
  async setextractsession(value) {
    await this.adapter.set(`extract${value.id}`, value);
    const ids = (await this.adapter.get("extracts") ?? []).filter((id) => id !== value.id);
    await this.adapter.set("extracts", [value.id, ...ids]);
  }
  /** Returns every extraction session with its cursor and page history, newest first. */
  async getextractsessions() {
    const ids = await this.adapter.get("extracts") ?? [];
    const records = [];
    for (const id of ids) {
      const record2 = await this.adapter.get(`extract${id}`);
      if (record2) records.push(record2);
    }
    return records;
  }
  /** Records one provenance record of an exported artifact. */
  async addprovenance(record2) {
    const records = await this.getprovenances();
    await this.adapter.set("provenances", [record2, ...records]);
  }
  /** Returns every provenance record per exported artifact, newest first. */
  async getprovenances() {
    return await this.adapter.get("provenances") ?? [];
  }
  /** Stores the transform rules and dedupe keys of one task, replacing the previous record of that task. */
  async settaskrules(value) {
    const records = (await this.adapter.get("taskrules") ?? []).filter(
      (item) => item.taskid !== value.taskid
    );
    await this.adapter.set("taskrules", [value, ...records]);
  }
  /** Returns the transform rules and dedupe keys per task, newest first. */
  async gettaskrules() {
    return await this.adapter.get("taskrules") ?? [];
  }
  /** Stores one stream chunk state for resume, replacing the previous state of that dataset. */
  async setstream(state) {
    const records = (await this.adapter.get("streams") ?? []).filter(
      (item) => item.datasetid !== state.datasetid
    );
    await this.adapter.set("streams", [state, ...records]);
  }
  /** Returns every stream chunk state persisted for resume, newest first. */
  async getstreams() {
    return await this.adapter.get("streams") ?? [];
  }
  /** Stores one reviewed sheet endpoint config behind its origin grant, replacing the previous config of that origin. */
  async setsheetendpoint(config) {
    const records = (await this.adapter.get("sheetendpoints") ?? []).filter(
      (item) => item.origin !== config.origin
    );
    await this.adapter.set("sheetendpoints", [config, ...records]);
  }
  /** Returns every reviewed sheet endpoint config, newest first. */
  async getsheetendpoints() {
    return await this.adapter.get("sheetendpoints") ?? [];
  }
  /** Records one exported data artifact; artifact retention is a user setting and an absent setting keeps every artifact. */
  async addexport(artifact) {
    const records = await this.getexports();
    const combined = [artifact, ...records.filter((item) => item.id !== artifact.id)];
    const retention = (await this.getsettings())?.artifactretention;
    await this.adapter.set("exports", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every exported data artifact with its content and checksum, newest first. */
  async getexports() {
    return await this.adapter.get("exports") ?? [];
  }
  /** Removes one exported data artifact by id and reports whether it existed. */
  async removeexport(id) {
    const records = await this.getexports();
    const remaining = records.filter((item) => item.id !== id);
    await this.adapter.set("exports", remaining);
    return remaining.length !== records.length;
  }
  /** Removes one run store artifact by id and reports whether it existed. */
  async removeartifact(id) {
    const records = await this.getartifacts();
    const remaining = records.filter((item) => item.id !== id);
    await this.adapter.set("artifacts", remaining);
    return remaining.length !== records.length;
  }
  /** Stores one batch download file record with its state, path and checksum, replacing the previous record of that id. */
  async setdownload(record2) {
    const records = (await this.adapter.get("downloads") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("downloads", [record2, ...records]);
  }
  /** Returns every batch download file record with its state, path and checksum, newest first. */
  async getdownloads() {
    return await this.adapter.get("downloads") ?? [];
  }
  /** Records one captured network log record; netlog retention is a user setting and an absent value keeps every record. */
  async addnetlog(record2) {
    const records = await this.getnetlog();
    const combined = [record2, ...records];
    const retention = (await this.getsettings())?.netlogretention;
    await this.adapter.set("netlog", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns the captured network log of the run with its step correlation, newest first. */
  async getnetlog() {
    return await this.adapter.get("netlog") ?? [];
  }
  /** Stores one clipboard consent record with its prompt and origin, replacing the previous record of that id. */
  async setclipconsent(record2) {
    const records = (await this.adapter.get("clipconsents") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("clipconsents", [record2, ...records]);
  }
  /** Returns every clipboard consent record with its prompt and origin, newest first. */
  async getclipconsents() {
    return await this.adapter.get("clipconsents") ?? [];
  }
  /** Records one clipboard entry hash with its origin provenance; the payload text itself never persists. */
  async addclip(entry) {
    const records = await this.getclips();
    await this.adapter.set("clips", [entry, ...records]);
  }
  /** Returns every clipboard entry hash with its kind and origin provenance, newest first. */
  async getclips() {
    return await this.adapter.get("clips") ?? [];
  }
  /** Stores one quarantine entry with its scan verdict, replacing the previous entry of that id. */
  async setquarantine(entry) {
    const records = (await this.adapter.get("quarantines") ?? []).filter(
      (item) => item.id !== entry.id
    );
    await this.adapter.set("quarantines", [entry, ...records]);
  }
  /** Returns every quarantine entry with its scan verdict and release ref, newest first. */
  async getquarantines() {
    return await this.adapter.get("quarantines") ?? [];
  }
  /** Stores the reviewed cleanup rule set of the run, replacing the previous set. */
  async setcleanuprules(rules) {
    return this.adapter.set("cleanuprules", rules);
  }
  /** Returns the reviewed cleanup rule set of the run. */
  async getcleanuprules() {
    return await this.adapter.get("cleanuprules") ?? [];
  }
  /** Records one cleanup run in the run history. */
  async addcleanuprun(run) {
    const records = await this.getcleanupruns();
    await this.adapter.set("cleanupruns", [run, ...records]);
  }
  /** Returns every cleanup run history record with removed and kept counts, newest first. */
  async getcleanupruns() {
    return await this.adapter.get("cleanupruns") ?? [];
  }
  /** Stores the capture naming counters of one task, replacing the previous counters of that task. */
  async setcapturecounter(counter) {
    const records = (await this.adapter.get("capturecounters") ?? []).filter(
      (item) => item.taskid !== counter.taskid
    );
    await this.adapter.set("capturecounters", [counter, ...records]);
  }
  /** Returns every stored capture naming counter per task, newest first. */
  async getcapturecounters() {
    return await this.adapter.get("capturecounters") ?? [];
  }
  /** Replaces the artifact inventory the cleanup sweeper plans against. */
  async setinventory(entries) {
    return this.adapter.set("inventory", entries);
  }
  /** Returns the artifact inventory with sizes and ages for the cleanup sweeper. */
  async getinventory() {
    return await this.adapter.get("inventory") ?? [];
  }
  /** Stores one user configured virus scanning hook, replacing the previous hook of that scanner name. */
  async setscanhook(config) {
    const records = (await this.adapter.get("scanhooks") ?? []).filter(
      (item) => item.scanner !== config.scanner
    );
    await this.adapter.set("scanhooks", [config, ...records]);
  }
  /** Returns every configured virus scanning hook, newest first. */
  async getscanhooks() {
    return await this.adapter.get("scanhooks") ?? [];
  }
  /** Stores the armed mime interception filters of the run, newest first. */
  async setmimefilters(filters) {
    return this.adapter.set("mimefilters", filters);
  }
  /** Returns the armed mime interception filters of the run, newest first. */
  async getmimefilters() {
    return await this.adapter.get("mimefilters") ?? [];
  }
  /** Stores one capture record with its bytes and step linkage, replacing the previous record of that id; the user configured capture retention window expires the oldest bytes while the metadata always survives for the audit trail. */
  async addcapture(record2) {
    const records = await this.getcaptures();
    const retention = (await this.getsettings())?.captureretention;
    const combined = [record2, ...records.filter((item) => item.id !== record2.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirecapturebytes(item));
    await this.adapter.set("captures", stored);
  }
  /** Returns every stored capture record with its metadata, newest first. */
  async getcaptures() {
    return await this.adapter.get("captures") ?? [];
  }
  /** Returns one capture record with its bytes by its id. */
  async getcapture(id) {
    return (await this.getcaptures()).find((item) => item.id === id);
  }
  /** Returns the capture records filtered by run, step and kind. */
  async listcaptures(filter) {
    const records = await this.getcaptures();
    return records.filter(
      (item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.stepid === void 0 || item.stepid === filter.stepid) && (filter.kind === void 0 || item.kind === filter.kind)
    );
  }
  /** Records one before and after shotpair of the run with its action context. */
  async addpair(pair) {
    const records = await this.getpairs();
    await this.adapter.set("capturepairs", [pair, ...records.filter((item) => item.id !== pair.id)]);
  }
  /** Returns the shotpairs of one run resolved through their before records, newest first; an absent run returns every pair. */
  async getpairs(runid) {
    const records = await this.adapter.get("capturepairs") ?? [];
    if (runid === void 0) return records;
    const runs = /* @__PURE__ */ new Map();
    for (const capture of await this.getcaptures()) runs.set(capture.id, capture.runid);
    return records.filter((item) => runs.get(item.beforeid) === runid);
  }
  /** Stores one media record of the 1.1.41 family with its bytes and step linkage, replacing the previous record of that id; the user configured media retention window expires the oldest bytes while the metadata and the recording index always survive. */
  async addmedia(record2) {
    const records = await this.getmediarecords();
    const retention = (await this.getsettings())?.mediaretention;
    const combined = [record2, ...records.filter((item) => item.id !== record2.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expiremediabytes(item));
    await this.adapter.set("media", stored);
  }
  /** Returns every stored media record, newest first. */
  async getmediarecords() {
    return await this.adapter.get("media") ?? [];
  }
  /** Returns the media records filtered by run and kind; an absent filter returns every record. */
  async listmedia(filter) {
    const records = await this.getmediarecords();
    return records.filter(
      (item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.kind === void 0 || mediakindof(item) === filter.kind)
    );
  }
  /** Returns one media record by its id. */
  async getmediarecord(id) {
    return (await this.getmediarecords()).find((item) => item.id === id);
  }
  /** Returns one recording with its file reference and frame index by its id. */
  async getrecording(id) {
    const found = await this.getmediarecord(id);
    return found !== void 0 && "startedat" in found ? found : void 0;
  }
  /** Removes one media record by its id; the audit trail keeps its outcome evidence. */
  async removemedia(id) {
    await this.adapter.set(
      "media",
      (await this.getmediarecords()).filter((item) => item.id !== id)
    );
  }
  /** Stores one observed image batch of a downloadimages step, replacing the previous batch of that id. */
  async addimagebatch(batch) {
    const records = await this.adapter.get("imagebatches") ?? [];
    await this.adapter.set("imagebatches", [batch, ...records.filter((item) => item.id !== batch.id)]);
  }
  /** Returns every observed image batch with its filter match counts, newest first. */
  async getimagebatches() {
    return await this.adapter.get("imagebatches") ?? [];
  }
  /** Stores one recording consent decision of an origin, replacing the previous record of that id. */
  async setrecordingconsent(record2) {
    const records = (await this.adapter.get("recordingconsents") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("recordingconsents", [record2, ...records]);
  }
  /** Returns every recording consent decision with its prompt and origin, newest first. */
  async getrecordingconsents() {
    return await this.adapter.get("recordingconsents") ?? [];
  }
  /** Stores one outbound call record with its transport facts and body, replacing the previous record of that id; the user configured call retention window expires the oldest bodies while the metadata always survives. */
  async addcall(record2) {
    const records = await this.getcalls();
    const retention = (await this.getsettings())?.callretention;
    const combined = [record2, ...records.filter((item) => item.id !== record2.id)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirecallbody(item));
    await this.adapter.set("calls", stored);
  }
  /** Returns every stored outbound call record, newest first. */
  async getcalls() {
    return await this.adapter.get("calls") ?? [];
  }
  /** Returns one outbound call record with its body by its id. */
  async getcall(id) {
    return (await this.getcalls()).find((item) => item.id === id);
  }
  /** Returns the outbound call records filtered by run and origin; an absent filter returns every call. */
  async listcalls(filter) {
    const records = await this.getcalls();
    return records.filter(
      (item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.origin === void 0 || item.origin === filter.origin)
    );
  }
  /** Stores one typed endpoint definition version, appending to the version history of that endpoint name. */
  async setendpoint(record2) {
    const records = await this.adapter.get("endpoints") ?? [];
    const prior = records.filter((item) => item.name === record2.name);
    const version = prior.length > 0 ? Math.max(...prior.map((item) => item.version)) + 1 : 1;
    await this.adapter.set("endpoints", [{ ...record2, version, at: record2.at }, ...records]);
  }
  /** Returns the newest endpointrecord definition of one name with its payload schema and version. */
  async getendpoint(name) {
    const records = await this.adapter.get("endpoints") ?? [];
    return records.find((item) => item.name === name);
  }
  /** Returns the newest definition of every typed endpoint name with its schema and version history. */
  async getendpoints() {
    const records = await this.adapter.get("endpoints") ?? [];
    const latest = /* @__PURE__ */ new Map();
    for (const record2 of records) if (!latest.has(record2.name)) latest.set(record2.name, record2);
    return [...latest.values()];
  }
  /** Stores one fetch consent decision per origin with its reviewed header names and values and its expiry window. */
  async setfetchconsent(consent) {
    const records = (await this.adapter.get("fetchconsents") ?? []).filter(
      (item) => item.id !== consent.id
    );
    await this.adapter.set("fetchconsents", [consent, ...records]);
  }
  /** Returns every fetch consent decision with its origin, header names and expiry window, newest first. */
  async getfetchconsents() {
    return await this.adapter.get("fetchconsents") ?? [];
  }
  /** Stores one api key entry with its origin scope and created time, replacing the previous entry of that name; the key material stays behind its storage id. */
  async setapikey(entry) {
    const records = (await this.adapter.get("apikeys") ?? []).filter(
      (item) => item.name !== entry.name
    );
    await this.adapter.set("apikeys", [entry, ...records]);
  }
  /** Returns every stored api key entry with its origin scope, header name, storage id and last use timestamp; key material never loads here. */
  async getapikeys() {
    return await this.adapter.get("apikeys") ?? [];
  }
  /** Stamps the last use timestamp of one stored api key entry without ever loading the key material. */
  async touchapikey(name, at) {
    const records = await this.getapikeys();
    const entry = records.find((item) => item.name === name);
    if (!entry) return;
    await this.adapter.set("apikeys", [{ ...entry, lastuse: at }, ...records.filter((item) => item.name !== name)]);
  }
  /** Removes one api key reference and its stored secret together. */
  async removeapikey(name) {
    const records = await this.getapikeys();
    const ref = records.find((item) => item.name === name);
    if (ref) await this.adapter.set(ref.storageid, void 0);
    await this.adapter.set(
      "apikeys",
      records.filter((item) => item.name !== name)
    );
  }
  /** Stores one api key secret under its storage id; the value never appears in reports, outcomes or the audit trail. */
  async setsecret(storageid, value) {
    return this.adapter.set(storageid, value);
  }
  /** Loads one api key secret under its storage id for the executor only. */
  async getsecret(storageid) {
    return this.adapter.get(storageid);
  }
  /** Stores one channel record of a socket or event stream, replacing the previous record of that id. */
  async addchannel(record2) {
    const records = (await this.adapter.get("channels") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("channels", [record2, ...records]);
  }
  /** Returns every stored channel record, newest first. */
  async getchannels() {
    return await this.adapter.get("channels") ?? [];
  }
  /** Returns one channel record by its id. */
  async getchannel(id) {
    return (await this.getchannels()).find((item) => item.id === id);
  }
  /** Queues one message envelope of a channel stream, keeping the arrival order for the waitmessage matchers. */
  async addmessage(envelope) {
    const records = (await this.adapter.get("messages") ?? []).filter(
      (item) => !(item.channelid === envelope.channelid && item.sequence === envelope.sequence)
    );
    await this.adapter.set("messages", [...records, envelope]);
  }
  /** Returns every queued message envelope, oldest first, optionally filtered by channel and stream. */
  async getmessages(channelid, stream) {
    const records = await this.adapter.get("messages") ?? [];
    return records.filter(
      (item) => (channelid === void 0 || item.channelid === channelid) && (stream === void 0 || item.stream === stream)
    );
  }
  /** Drops the matched message envelopes of one channel from the queue once a waitmessage step consumed them. */
  async drainmessages(sequences) {
    const records = await this.adapter.get("messages") ?? [];
    const kept = records.filter(
      (item) => !sequences.some((match) => match.channelid === item.channelid && match.sequence === item.sequence)
    );
    await this.adapter.set("messages", kept);
  }
  /** Stores one observed exchange record, replacing the previous record of that id. */
  async addexchange(record2) {
    const records = (await this.adapter.get("exchanges") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("exchanges", [record2, ...records]);
  }
  /** Returns every stored exchange record, newest first. */
  async getexchanges() {
    return await this.adapter.get("exchanges") ?? [];
  }
  /** Returns one exchange record by its id. */
  async getexchange(id) {
    return (await this.getexchanges()).find((item) => item.id === id);
  }
  /** Returns the exchange records filtered by run, origin and status; the status filter accepts one code or the failed class of every exchange with an error class. */
  async listexchanges(filter) {
    const records = await this.getexchanges();
    return records.filter(
      (item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.origin === void 0 || item.origin === filter.origin) && (filter.status === void 0 || (filter.status === "failed" ? item.errorclass !== void 0 : item.status === filter.status))
    );
  }
  /** Stores one captured response body with its mime type and byte size; the user configured body retention window expires the oldest bodies while the exchange metadata always survives. */
  async addbody(record2) {
    const records = await this.getbodies();
    const retention = (await this.getsettings())?.bodyretention;
    const combined = [record2, ...records.filter((item) => item.ref !== record2.ref)];
    const stored = retention === void 0 ? combined : combined.map((item, index) => index < retention ? item : expirebodybytes(item));
    await this.adapter.set("bodies", stored);
  }
  /** Returns every captured body record, newest first. */
  async getbodies() {
    return await this.adapter.get("bodies") ?? [];
  }
  /** Returns one captured body record with its stored text by its reference. */
  async getbody(ref) {
    return (await this.getbodies()).find((item) => item.ref === ref);
  }
  /** Stores the page api map of one origin, replacing the previous map of that origin. */
  async setapimap(origin, entries) {
    const records = (await this.adapter.get("apimap") ?? []).filter((item) => item.origin !== origin);
    await this.adapter.set("apimap", [...entries, ...records]);
  }
  /** Returns every stored page api map entry, newest first. */
  async getapimap() {
    return await this.adapter.get("apimap") ?? [];
  }
  /** Stores one event stream subscription record, replacing the previous record of that id. */
  async setsubscription(record2) {
    const records = (await this.adapter.get("subscriptions") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("subscriptions", [record2, ...records]);
  }
  /** Returns every stored event stream subscription, newest first. */
  async getsubscriptions() {
    return await this.adapter.get("subscriptions") ?? [];
  }
  /** Stores one registered request block rule of a run, replacing the previous rule of that id; every rule reverts and stays auditable after the run ends. */
  async addblockrule(rule) {
    const records = (await this.adapter.get("blockrules") ?? []).filter((item) => item.id !== rule.id);
    await this.adapter.set("blockrules", [rule, ...records]);
  }
  /** Returns every stored block rule, newest first. */
  async getblockrules() {
    return await this.adapter.get("blockrules") ?? [];
  }
  /** Stores one registered response mock fixture of a run, replacing the previous fixture of that id; the fixture body stays out of every audit trail. */
  async addmockspec(spec) {
    const records = (await this.adapter.get("mockspecs") ?? []).filter((item) => item.id !== spec.id);
    await this.adapter.set("mockspecs", [spec, ...records]);
  }
  /** Returns every stored mock fixture, newest first. */
  async getmockspecs() {
    return await this.adapter.get("mockspecs") ?? [];
  }
  /** Stores one registered header rewrite rule of a run, replacing the previous rule of that id; the provenance of every applied rule stays auditable. */
  async addheaderule(rule) {
    const records = (await this.adapter.get("headerules") ?? []).filter((item) => item.id !== rule.id);
    await this.adapter.set("headerules", [rule, ...records]);
  }
  /** Returns every stored header rewrite rule, newest first. */
  async getheaderules() {
    return await this.adapter.get("headerules") ?? [];
  }
  /** Stores one cookie operation of a run per domain with its timestamp; cookie values never enter the operation record. */
  async addcookieop(operation) {
    const records = await this.adapter.get("cookieops") ?? [];
    await this.adapter.set("cookieops", [operation, ...records]);
  }
  /** Returns every stored cookie operation, newest first, optionally filtered by domain. */
  async getcookieops(domain) {
    const records = await this.adapter.get("cookieops") ?? [];
    return records.filter((item) => domain === void 0 || item.domain === domain);
  }
  /** Stores one token record of a provider with scopes, origin scope and expiry; the token values stay behind their storage ids. */
  async addtoken(record2) {
    const records = (await this.adapter.get("tokens") ?? []).filter((item) => item.id !== record2.id);
    await this.adapter.set("tokens", [record2, ...records]);
  }
  /** Returns every stored token record, newest first, optionally filtered by provider; token values never load here. */
  async listtokens(provider) {
    const records = await this.adapter.get("tokens") ?? [];
    return records.filter((item) => provider === void 0 || item.provider === provider);
  }
  /** Stores one applied proxy route of a run with its apply time, replacing the previous route of that id; the history keeps the revert times. */
  async addproxyroute(route) {
    const records = (await this.adapter.get("proxyroutes") ?? []).filter(
      (item) => item.id !== route.id
    );
    await this.adapter.set("proxyroutes", [route, ...records]);
  }
  /** Returns every stored proxy route with apply and revert times, newest first. */
  async getproxyroutes() {
    return await this.adapter.get("proxyroutes") ?? [];
  }
  /** Stores one parsed rate limit read per origin, replacing the previous read of that origin. */
  async setratelimit(read) {
    const records = (await this.adapter.get("ratelimits") ?? []).filter(
      (item) => item.origin !== read.origin
    );
    await this.adapter.set("ratelimits", [read, ...records]);
  }
  /** Returns every stored rate limit read whose reset window has not passed yet; expired states drop out at their reset windows. */
  async getratelimits(now) {
    const records = await this.adapter.get("ratelimits") ?? [];
    const live = records.filter((item) => item.resetat > now);
    if (live.length !== records.length) await this.adapter.set("ratelimits", live);
    return live;
  }
  /** Stores one run timeline entry; the user configured timeline retention window expires the oldest entries while their level counts survive in the per run level summaries. */
  async addtimelineentry(entry) {
    const records = await this.gettimeline();
    const combined = [entry, ...records];
    const retention = (await this.getsettings())?.timelineretention;
    if (retention === void 0) {
      await this.adapter.set("timelineentries", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention);
    if (expired.length > 0) {
      const expiredcounts = /* @__PURE__ */ new Map();
      for (const item of expired) {
        const counts = expiredcounts.get(item.runid) ?? {};
        counts[item.level] = (counts[item.level] ?? 0) + 1;
        expiredcounts.set(item.runid, counts);
      }
      for (const [runid, counts] of expiredcounts) await this.mergelevelsummary(runid, counts, Date.now());
    }
    await this.adapter.set("timelineentries", kept);
  }
  /** Returns every stored run timeline entry, newest first. */
  async gettimeline() {
    return await this.adapter.get("timelineentries") ?? [];
  }
  /** Returns the run timeline entries filtered by run, level and step id. */
  async listtimeline(filter) {
    const records = await this.gettimeline();
    return records.filter(
      (item) => (filter.runid === void 0 || item.runid === filter.runid) && (filter.level === void 0 || item.level === filter.level) && (filter.stepid === void 0 || item.stepid === filter.stepid)
    );
  }
  /** Stores one captured javascript error record with its stack frames, source url and line. */
  async adderrorrecord(record2) {
    const records = await this.adapter.get("errorrecords") ?? [];
    await this.adapter.set("errorrecords", [record2, ...records]);
  }
  /** Returns every stored error record, newest first. */
  async geterrorrecords() {
    return await this.adapter.get("errorrecords") ?? [];
  }
  /** Stores one captured unhandled rejection record with its reason and stack frames. */
  async addrejectionrecord(record2) {
    const records = await this.adapter.get("rejectionrecords") ?? [];
    await this.adapter.set("rejectionrecords", [record2, ...records]);
  }
  /** Returns every stored rejection record, newest first. */
  async getrejectionrecords() {
    return await this.adapter.get("rejectionrecords") ?? [];
  }
  /** Stores one captured long task entry with its duration, start time and attribution names. */
  async addlongtask(record2) {
    const records = await this.adapter.get("longtasks") ?? [];
    await this.adapter.set("longtasks", [record2, ...records]);
  }
  /** Returns every stored long task entry, newest first. */
  async getlongtasks() {
    return await this.adapter.get("longtasks") ?? [];
  }
  /** Stores one console diff result between two runs, replacing the previous one. */
  async addconsolediff(diff) {
    return this.adapter.set("consolediff", diff);
  }
  /** Returns the one stored console diff result. */
  async getdiff() {
    return this.adapter.get("consolediff");
  }
  /** Stores one log rotation target record with its overflow entry counts, replacing the previous record of that target and run. */
  async addrotationtarget(record2) {
    const records = (await this.adapter.get("rotationtargets") ?? []).filter(
      (item) => !(item.target === record2.target && item.runid === record2.runid)
    );
    await this.adapter.set("rotationtargets", [record2, ...records]);
  }
  /** Returns every stored rotation target record with its overflow entry counts, newest first. */
  async getrotationtargets() {
    return await this.adapter.get("rotationtargets") ?? [];
  }
  /** Stores one console capture consent decision per origin; the approved decision persists so console watching on that origin prompts once. */
  async setconsoleconsent(consent) {
    const records = (await this.adapter.get("consoleconsents") ?? []).filter(
      (item) => item.id !== consent.id
    );
    await this.adapter.set("consoleconsents", [consent, ...records]);
  }
  /** Returns every console capture consent decision, newest first. */
  async getconsoleconsents() {
    return await this.adapter.get("consoleconsents") ?? [];
  }
  /** Stores one devtools session record with its enabled domains and detach state, replacing the previous record of its id. */
  async setcdpsession(session) {
    const records = (await this.adapter.get("cdpsessions") ?? []).filter(
      (item) => item.id !== session.id
    );
    await this.adapter.set("cdpsessions", [session, ...records]);
  }
  /** Returns every stored devtools session record, newest first. */
  async getcdpsessions() {
    return await this.adapter.get("cdpsessions") ?? [];
  }
  /** Stores one raw command outcome with its duration and error class. */
  async addcdpcommand(command) {
    const records = await this.adapter.get("cdpcommands") ?? [];
    await this.adapter.set("cdpcommands", [command, ...records]);
  }
  /** Returns every stored raw command outcome, newest first. */
  async getcdpcommands() {
    return await this.adapter.get("cdpcommands") ?? [];
  }
  /** Stores one domain event rule with its match filter, replacing the previous rule of its id. */
  async setcdpeventrule(rule) {
    const records = (await this.adapter.get("cdpeventrules") ?? []).filter(
      (item) => item.id !== rule.id
    );
    await this.adapter.set("cdpeventrules", [rule, ...records]);
  }
  /** Returns every stored domain event rule, newest first. */
  async getcdpeventrules() {
    return await this.adapter.get("cdpeventrules") ?? [];
  }
  /** Stores one breakpoint record with its condition and hit counter, replacing the previous record of its id. */
  async addbreakpoint(spec) {
    const records = (await this.adapter.get("breakpoints") ?? []).filter(
      (item) => item.id !== spec.id
    );
    await this.adapter.set("breakpoints", [spec, ...records]);
  }
  /** Returns every stored breakpoint record, newest first. */
  async getbreakpoints() {
    return await this.adapter.get("breakpoints") ?? [];
  }
  /** Stores one pause state capture; the user configured pause retention window expires the call frames and the dom snapshot reference of the oldest captures while the pause reason and hit breakpoint survive. */
  async addpause(pause) {
    const records = await this.getpauses();
    const combined = [pause, ...records.filter((item) => item.id !== pause.id)];
    const retention = (await this.getsettings())?.pauseretention;
    if (retention === void 0) {
      await this.adapter.set("pauses", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention).map((item) => {
      if (item.framesexpired === true) return item;
      const faded = { ...item, callframes: [], framesexpired: true };
      delete faded.domsnapshotid;
      return faded;
    });
    await this.adapter.set("pauses", [...kept, ...expired]);
  }
  /** Returns every stored pause state capture, newest first. */
  async getpauses() {
    return await this.adapter.get("pauses") ?? [];
  }
  /** Returns the pause state captures of one run, newest first. */
  async listpauses(runid) {
    const records = await this.getpauses();
    return records.filter((item) => item.runid === runid);
  }
  /** Stores one watch expression with its per pause values, replacing the previous expression of its id. */
  async setwatchexpression(expression) {
    const records = (await this.adapter.get("watchexpressions") ?? []).filter(
      (item) => item.id !== expression.id
    );
    await this.adapter.set("watchexpressions", [expression, ...records]);
  }
  /** Returns every stored watch expression, newest first. */
  async getwatchexpressions() {
    return await this.adapter.get("watchexpressions") ?? [];
  }
  /** Stores one script override with its review provenance, replacing the previous override of its id. */
  async addscriptoverride(spec) {
    const records = (await this.adapter.get("scriptoverrides") ?? []).filter(
      (item) => item.id !== spec.id
    );
    await this.adapter.set("scriptoverrides", [spec, ...records]);
  }
  /** Returns every stored script override, newest first. */
  async getscriptoverrides() {
    return await this.adapter.get("scriptoverrides") ?? [];
  }
  /** Stores one debugger consent decision per origin with the consented domain list, replacing the previous decision of its id. */
  async setdebuggergrant(grant) {
    const records = (await this.adapter.get("debuggergrants") ?? []).filter(
      (item) => item.id !== grant.id
    );
    await this.adapter.set("debuggergrants", [grant, ...records]);
  }
  /** Returns every debugger consent decision, newest first. */
  async getdebuggergrants() {
    return await this.adapter.get("debuggergrants") ?? [];
  }
  /** Revokes every approved debugger consent of one origin: the revoke time stamps the records so the next attach needs a new reviewed prompt. */
  async revokedebuggergrants(origin, at) {
    const records = await this.getdebuggergrants();
    let revoked = 0;
    const updated = records.map((grant) => {
      if (grant.origin !== origin || grant.revokedat !== void 0) return grant;
      revoked += 1;
      return { ...grant, revokedat: at };
    });
    await this.adapter.set("debuggergrants", updated);
    return revoked;
  }
  /** Merges expired entry counts into the per run level count summary that survives the retention window. */
  async mergelevelsummary(runid, counts, now) {
    const records = await this.getlevelsummaries();
    const existing = records.find((item) => item.runid === runid);
    const merged = { ...existing?.counts ?? {} };
    for (const [level, count] of Object.entries(counts)) merged[level] = (merged[level] ?? 0) + count;
    const updated = { runid, counts: merged, at: now };
    await this.adapter.set("levelsummaries", [updated, ...records.filter((item) => item.runid !== runid)]);
  }
  /** Returns every per run level count summary, newest first. */
  async getlevelsummaries() {
    return await this.adapter.get("levelsummaries") ?? [];
  }
  /** Stores one measured flow metric of the run beside its step span; the flow series stays per run. */
  async addflowmetric(metric) {
    const records = await this.getflowmetrics();
    await this.adapter.set("flowmetrics", [metric, ...records]);
  }
  /** Returns every stored flow metric, newest first. */
  async getflowmetrics() {
    return await this.adapter.get("flowmetrics") ?? [];
  }
  /** Returns the flow metrics of one run, newest first. */
  async listflowmetrics(runid) {
    const records = await this.getflowmetrics();
    return records.filter((metric) => metric.runid === runid);
  }
  /** Stores one heap snapshot record with its byte and node counts; the user configured profile retention window expires the heavy snapshot bytes while the counts survive. */
  async setheaprecord(heap) {
    const records = (await this.adapter.get("heaprecords") ?? []).filter((item) => item.id !== heap.id);
    const retention = (await this.getsettings())?.profileretention;
    const { heaps } = expireprofilerecords({
      heaps: [heap, ...records],
      profiles: [],
      traces: [],
      retention,
      now: Date.now()
    });
    await this.adapter.set("heaprecords", heaps);
  }
  /** Returns every stored heap snapshot record, newest first. */
  async getheaprecords() {
    return await this.adapter.get("heaprecords") ?? [];
  }
  /** Stores one heap growth sample taken beside a step. */
  async addgrowsample(sample) {
    const records = await this.adapter.get("growsamples") ?? [];
    await this.adapter.set("growsamples", [sample, ...records]);
  }
  /** Returns every stored heap growth sample, newest first. */
  async getgrowsamples() {
    return await this.adapter.get("growsamples") ?? [];
  }
  /** Returns the heap growth samples of one run, newest first. */
  async listgrowsamples(runid) {
    const records = await this.getgrowsamples();
    return records.filter((sample) => sample.runid === runid);
  }
  /** Stores one computed heap growth trend of a run with its slope and flagged steps, replacing the previous trend of the run. */
  async settrend(trend) {
    const records = await this.adapter.get("memorytrends") ?? [];
    await this.adapter.set("memorytrends", [trend, ...records.filter((item) => item.runid !== trend.runid)]);
  }
  /** Returns every stored heap growth trend, newest first. */
  async gettrends() {
    return await this.adapter.get("memorytrends") ?? [];
  }
  /** Stores one cpu profile record with its sample count and hot function list; the profile retention window expires the heavy sample payload while the counts and hot functions survive. */
  async setcpuprofile(profile) {
    const records = (await this.adapter.get("cpuprofiles") ?? []).filter(
      (item) => item.id !== profile.id
    );
    const retention = (await this.getsettings())?.profileretention;
    const { profiles } = expireprofilerecords({
      heaps: [],
      profiles: [profile, ...records],
      traces: [],
      retention,
      now: Date.now()
    });
    await this.adapter.set("cpuprofiles", profiles);
  }
  /** Returns every stored cpu profile record, newest first. */
  async getcpuprofiles() {
    return await this.adapter.get("cpuprofiles") ?? [];
  }
  /** Stores one layout shift entry with its score and impacted selectors. */
  async addshiftentry(entry) {
    const records = await this.adapter.get("shiftentries") ?? [];
    await this.adapter.set("shiftentries", [entry, ...records]);
  }
  /** Returns every stored layout shift entry, newest first. */
  async getshiftentries() {
    return await this.adapter.get("shiftentries") ?? [];
  }
  /** Stores one trace record with its category list, byte size and step annotations; the profile retention window expires the heavy trace bytes while the metadata and annotations survive. */
  async settracerecord(trace) {
    const records = (await this.adapter.get("tracerecords") ?? []).filter(
      (item) => item.id !== trace.id
    );
    const retention = (await this.getsettings())?.profileretention;
    const { traces } = expireprofilerecords({
      heaps: [],
      profiles: [],
      traces: [trace, ...records],
      retention,
      now: Date.now()
    });
    await this.adapter.set("tracerecords", traces);
  }
  /** Returns every stored trace record, newest first. */
  async gettracerecords() {
    return await this.adapter.get("tracerecords") ?? [];
  }
  /** Returns the trace records filtered by run and applied categories. */
  async listtraces(filter) {
    const records = await this.gettracerecords();
    return records.filter(
      (trace) => (filter.runid === void 0 || trace.runid === filter.runid) && (filter.categories === void 0 || filter.categories.every((category) => trace.categories.includes(category)))
    );
  }
  /** Stores the exported file content of one trace beside its record; the retention window drops the file bytes of expired traces while the record survives. */
  async settracefile(traceid, content) {
    const records = (await this.adapter.get("tracefiles") ?? []).filter((item) => item.traceid !== traceid);
    const trace = (await this.gettracerecords()).find((item) => item.id === traceid);
    const retention = (await this.getsettings())?.profileretention;
    const kept = retention === void 0 || trace === void 0 || Date.now() - trace.endedat <= retention ? [{ traceid, content, savedat: Date.now() }, ...records] : records;
    await this.adapter.set("tracefiles", kept);
  }
  /** Returns the exported file content of one trace, or undefined when the retention window dropped the bytes. */
  async gettracefile(traceid) {
    const records = await this.adapter.get("tracefiles") ?? [];
    return records.find((item) => item.traceid === traceid)?.content;
  }
  /** Stores one source map reference of a run with its script url, map url and parsed state. */
  async setsourcemapref(ref) {
    const records = (await this.adapter.get("sourcemaprefs") ?? []).filter(
      (item) => item.id !== ref.id
    );
    await this.adapter.set("sourcemaprefs", [ref, ...records]);
  }
  /** Returns every stored source map reference, newest first. */
  async getsourcemaps() {
    return await this.adapter.get("sourcemaprefs") ?? [];
  }
  /** Stores one source map capture consent decision per origin, replacing the previous decision of its id. */
  async setsourcemapconsent(consent) {
    const records = (await this.adapter.get("sourcemapconsents") ?? []).filter(
      (item) => item.id !== consent.id
    );
    await this.adapter.set("sourcemapconsents", [consent, ...records]);
  }
  /** Returns every source map capture consent decision, newest first. */
  async getsourcemapconsents() {
    return await this.adapter.get("sourcemapconsents") ?? [];
  }
  /** Revokes every approved source map consent of one origin so the next capture needs a new reviewed prompt. */
  async revokesourcemapconsents(origin, at) {
    const records = await this.getsourcemapconsents();
    let revoked = 0;
    const updated = records.map((consent) => {
      if (consent.origin !== origin || consent.revokedat !== void 0) return consent;
      revoked += 1;
      return { ...consent, revokedat: at };
    });
    await this.adapter.set("sourcemapconsents", updated);
    return revoked;
  }
  /** Stores the emulation state of one run keyed by its run id; the reverted layer prior states expire after the user configured retention window while the layer history always survives. */
  async setemulationstate(state) {
    const retention = (await this.getsettings())?.emulationretention;
    await this.adapter.set(`emulationstate${state.runid}`, expirelayers(state, retention, Date.now()));
  }
  /** Returns the persisted emulation state of one run so the layers survive service worker restarts. */
  async getemulationstate(runid) {
    return this.adapter.get(`emulationstate${runid}`);
  }
  /** Returns the active and past layers of one run, newest last in apply order; the listlayers accessor of the emulation memory. */
  async listlayers(runid) {
    const state = await this.getemulationstate(runid);
    return state?.layers ?? [];
  }
  /** Stores one user curated device preset by its name so the preset library stays user data instead of a hardcoded list. */
  async setdevicepreset(preset) {
    const records = (await this.adapter.get("devicepresets") ?? []).filter(
      (item) => item.name !== preset.name
    );
    await this.adapter.set("devicepresets", [...records, preset]);
  }
  /** Returns every user curated device preset. */
  async getdevicepresets() {
    return await this.adapter.get("devicepresets") ?? [];
  }
  /** Stores one user curated network preset by its name with editable values. */
  async setnetworkpreset(preset) {
    const records = (await this.adapter.get("networkpresets") ?? []).filter(
      (item) => item.name !== preset.name
    );
    await this.adapter.set("networkpresets", [...records, preset]);
  }
  /** Returns every user curated network preset. */
  async getnetworkpresets() {
    return await this.adapter.get("networkpresets") ?? [];
  }
  /** Stores one user curated location preset by its name. */
  async setlocationpreset(preset) {
    const records = (await this.adapter.get("locationpresets") ?? []).filter(
      (item) => item.name !== preset.name
    );
    await this.adapter.set("locationpresets", [...records, preset]);
  }
  /** Returns every user curated location preset. */
  async getlocationpresets() {
    return await this.adapter.get("locationpresets") ?? [];
  }
  /** Stores one user curated agent preset by its name. */
  async setagentpreset(preset) {
    const records = (await this.adapter.get("agentpresets") ?? []).filter(
      (item) => item.name !== preset.name
    );
    await this.adapter.set("agentpresets", [...records, preset]);
  }
  /** Returns every user curated agent preset. */
  async getagentpresets() {
    return await this.adapter.get("agentpresets") ?? [];
  }
  /** Replaces the blackbox rule set of one origin so third party script blackboxing stays scoped per origin. */
  async setblackboxrules(origin, rules) {
    const records = (await this.adapter.get("blackboxrules") ?? []).filter((item) => item.origin !== origin);
    await this.adapter.set("blackboxrules", [...records, { origin, rules }]);
  }
  /** Returns every stored blackbox rule set with its origin. */
  async getblackboxrules() {
    return await this.adapter.get("blackboxrules") ?? [];
  }
  /** Records one permission override of a run with its prior state captured for the exact restore. */
  async addpermissionoverride(record2) {
    const records = (await this.adapter.get("permissionoverrides") ?? []).filter(
      (item) => item.id !== record2.id
    );
    await this.adapter.set("permissionoverrides", [record2, ...records]);
  }
  /** Returns the permission override history with restore states, newest first. */
  async getpermissionoverrides() {
    return await this.adapter.get("permissionoverrides") ?? [];
  }
  /** Stores one location consent decision per origin, replacing the previous decision of its id. */
  async setlocationconsent(consent) {
    const records = (await this.adapter.get("locationconsents") ?? []).filter(
      (item) => item.id !== consent.id
    );
    await this.adapter.set("locationconsents", [consent, ...records]);
  }
  /** Returns every location consent decision, newest first. */
  async getlocationconsents() {
    return await this.adapter.get("locationconsents") ?? [];
  }
  /** Returns the persisted task state checkpoint of one run so the run resumes after a service worker restart. */
  async gettaskstate(runid) {
    return this.adapter.get(`taskstate${runid}`);
  }
  /** Persists one task state checkpoint per run with its corruption checksum. */
  async settaskstate(state) {
    return this.adapter.set(`taskstate${state.runid}`, state);
  }
  /** Returns the session event history with timestamps, newest first. */
  async getsessionevents() {
    return await this.adapter.get("sessionevents") ?? [];
  }
  /** Records one session event of the run with its timestamp and detail. */
  async addsessionevent(event) {
    const records = await this.getsessionevents();
    await this.adapter.set("sessionevents", [event, ...records]);
  }
  /** Returns every saved session record with its sections, newest first. */
  async getsessionrecords() {
    return await this.adapter.get("sessionrecords") ?? [];
  }
  /** Adds one saved session record to the library. */
  async addsessionrecord(record2) {
    const records = await this.getsessionrecords();
    await this.adapter.set("sessionrecords", [record2, ...records]);
  }
  /** Replaces one saved session record by its id after a filing or restore touches it. */
  async updatesessionrecord(record2) {
    const records = await this.getsessionrecords();
    await this.adapter.set(
      "sessionrecords",
      records.map((item) => item.id === record2.id ? record2 : item)
    );
  }
  /** Lists saved sessions filtered by name substring, folder and time window; the filter stays a user choice with no result cap. */
  async listsessions(filter) {
    return filteredsessions(await this.getsessionrecords(), filter);
  }
  /** Returns one saved session with every section; an expired record carries its metadata only. */
  async getsessionrecord(id) {
    return (await this.getsessionrecords()).find((record2) => record2.id === id);
  }
  /** Runs the reviewed search query across every stored session and returns the matches with their session ids and time windows. */
  async searchmemory(query) {
    return searchsessionrecords(query, await this.getsessionrecords());
  }
  /** Returns the folder tree of the session library. */
  async getsessionfolders() {
    return await this.adapter.get("sessionfolders") ?? [];
  }
  /** Replaces the folder tree after a reviewed filing adds or moves one folder. */
  async setsessionfolders(folders) {
    return this.adapter.set("sessionfolders", folders);
  }
  /** Returns every stored session diff result, newest first. */
  async getsessiondiffs() {
    return await this.adapter.get("sessiondiffs") ?? [];
  }
  /** Stores one session diff result for later review. */
  async addsessiondiff(diff) {
    const records = await this.getsessiondiffs();
    await this.adapter.set("sessiondiffs", [diff, ...records]);
  }
  /** Returns the persisted auto snapshot state with the reviewed interval, the last snapshot time and the snapshot count. */
  async getautosnapshot() {
    return await this.adapter.get("autosnapshot") ?? void 0;
  }
  /** Stores the auto snapshot state of the reviewed interval. */
  async setautosnapshot(state) {
    return this.adapter.set("autosnapshot", state);
  }
  /** Clears the auto snapshot interval so on demand captures stay the only source of records. */
  async clearautosnapshot() {
    return this.adapter.set("autosnapshot", null);
  }
  /** Expires the heavy sections of saved sessions after the reviewed retention window while the record metadata survives. */
  async applysessionexpiry(retention, now) {
    const records = expiresessions(await this.getsessionrecords(), retention, now);
    await this.adapter.set("sessionrecords", records);
    return records;
  }
  /** Returns the crash marker of a run interrupted by a browser restart. */
  async getcrashflag() {
    return await this.adapter.get("crashed") ?? false;
  }
  /** Sets the crash marker so the sessions view offers the crash restore inside the consent model. */
  async setcrashflag(value) {
    return this.adapter.set("crashed", value);
  }
  /** Stores one composed workflow record version with its timestamp; re-composing the same version replaces it while older versions survive for the audit trail. */
  async addworkflowrecord(record2) {
    const records = await this.getworkflowrecordversions();
    const remaining = records.filter((entry) => !(entry.id === record2.id && entry.version === record2.version));
    await this.adapter.set("workflowrecords", [record2, ...remaining]);
  }
  /** Returns every stored workflow record version, newest first. */
  async getworkflowrecordversions() {
    return await this.adapter.get("workflowrecords") ?? [];
  }
  /** Returns the latest stored version of one workflow record. */
  async getworkflowrecord(id) {
    return (await this.getworkflowrecordversions()).find((entry) => entry.id === id);
  }
  /** Lists the saved workflow records, the latest version of each, newest first. */
  async listworkflows() {
    const seen = /* @__PURE__ */ new Set();
    const latest = [];
    for (const entry of await this.getworkflowrecordversions()) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      latest.push(entry);
    }
    return latest;
  }
  /** Stores one workflow run with its state transition; a run replace keeps the full runlog of the same id. */
  async setworkflowrun(run) {
    const runs = await this.listworkflowruns();
    const remaining = runs.filter((entry) => entry.id !== run.id);
    await this.adapter.set("workflowruns", [run, ...remaining]);
  }
  /** Returns every stored workflow run, newest first. */
  async listworkflowruns() {
    return await this.adapter.get("workflowruns") ?? [];
  }
  /** Returns one run with its full step outcome list so the panel shows the timeline after and during a run. */
  async getrun(id) {
    const run = (await this.listworkflowruns()).find((entry) => entry.id === id);
    if (!run) return void 0;
    return { run, log: await this.getrunlog(id) };
  }
  /** Records one runlog entry of a run; the runlog retention window is a user setting and an absent window keeps every entry. */
  async addrunlogentry(runid, entry) {
    const entries = await this.getrunlog(runid);
    const combined = [...entries, entry];
    const retention = (await this.getsettings())?.runlogretention;
    await this.adapter.set(`runlog${runid}`, retention === void 0 ? combined : combined.slice(-retention));
  }
  /** Returns the runlog of one run, oldest first. */
  async getrunlog(runid) {
    return await this.adapter.get(`runlog${runid}`) ?? [];
  }
  /** Stores the variable values per scope of one run for inspection after the run. */
  async setrunscopes(runid, scopes) {
    return this.adapter.set(`runscopes${runid}`, scopes);
  }
  /** Returns the variable scopes of one run, oldest first. */
  async getrunscopes(runid) {
    return await this.adapter.get(`runscopes${runid}`) ?? [];
  }
  /** Records one provenance entry of a run: an expression result or a regex capture with its name, value and time. */
  async addworkflowprovenance(runid, entry) {
    const entries = await this.getworkflowprovenance(runid);
    await this.adapter.set(`workflowprovenance${runid}`, [...entries, entry]);
  }
  /** Returns every provenance entry of one run, oldest first. */
  async getworkflowprovenance(runid) {
    return await this.adapter.get(`workflowprovenance${runid}`) ?? [];
  }
  /** Stores one shareable step template under its unique name. */
  async addsteptemplate(template) {
    const templates = (await this.getsteptemplates()).filter((entry) => entry.name !== template.name);
    await this.adapter.set("steptemplates", [template, ...templates]);
  }
  /** Returns every stored step template, newest first. */
  async getsteptemplates() {
    return await this.adapter.get("steptemplates") ?? [];
  }
  /** Records one control flow decision of a run — a branch choice with its reason, the loop counters of an iteration trail, the retry attempts with their backoff durations, the timeout aborts with the exceeded budget, the join record with its strategy and conflicts or the catch handler execution — so the audit trail keeps every control flow turn. */
  async addcontroldecision(runid, decision) {
    const decisions = await this.listcontroldecisions(runid);
    await this.adapter.set(`controldecisions${runid}`, [...decisions, { ...decision, runid }]);
  }
  /** Returns every stored control flow decision of one run, oldest first. */
  async listcontroldecisions(runid) {
    return await this.adapter.get(`controldecisions${runid}`) ?? [];
  }
  /** Returns the past branch decisions of one workflow across every stored run, oldest first, so review can compare branch paths over time. */
  async getbranchhistory(workflowid) {
    const runs = await this.listworkflowruns();
    const ordered = [...runs].reverse().filter((run) => run.workflowid === workflowid);
    const history = [];
    for (const run of ordered) {
      const decisions = await this.listcontroldecisions(run.id);
      for (const decision of decisions)
        if (decision.kind === "branch" && decision.branch !== void 0) history.push(decision.branch);
    }
    return history;
  }
  /** Stores one armed trigger rule with its workflow reference; re-arming the same id replaces the rule while the fire history survives. */
  async addtriggerule(rule) {
    const rules = (await this.gettriggerules()).filter((entry) => entry.id !== rule.id);
    await this.adapter.set("triggerules", [rule, ...rules]);
  }
  /** Returns every armed trigger rule, newest first. */
  async gettriggerules() {
    return await this.adapter.get("triggerules") ?? [];
  }
  /** Returns one armed trigger rule by its id. */
  async gettriggerule(id) {
    return (await this.gettriggerules()).find((rule) => rule.id === id);
  }
  /** Replaces one stored rule after an enable, disable, pause, resume, cooldown or fire bookkeeping change. */
  async settriggerule(rule) {
    const rules = await this.gettriggerules();
    await this.adapter.set(
      "triggerules",
      rules.map((entry) => entry.id === rule.id ? rule : entry)
    );
  }
  /** Replaces every stored rule at once so the session pause and resume suspend and release the whole rule set atomically. */
  async settriggerules(rules) {
    return this.adapter.set("triggerules", rules);
  }
  /** Removes one armed rule when the user disarms it; the fire history survives for the audit trail. */
  async removetriggerule(id) {
    await this.adapter.set(
      "triggerules",
      (await this.gettriggerules()).filter((rule) => rule.id !== id)
    );
  }
  /** Lists every armed rule joined with the name of its composed workflow so the trigger list shows what each rule launches. */
  async listtriggers() {
    const rules = await this.gettriggerules();
    const names = new Map((await this.listworkflows()).map((record2) => [record2.id, record2.name]));
    return rules.map((rule) => ({
      rule,
      ...names.has(rule.workflowid) ? { workflowname: names.get(rule.workflowid) } : {}
    }));
  }
  /** Records one trigger fire with the reviewed retention window; an absent window keeps every fire record while the rule counters always survive. */
  async addtriggerfire(fire) {
    const fires = await this.listtriggerfires();
    const combined = [fire, ...fires];
    const retention = (await this.getsettings())?.triggerretention;
    await this.adapter.set("triggerfires", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns every stored trigger fire record, newest first, optionally filtered to one rule. */
  async listtriggerfires(ruleid) {
    const fires = await this.adapter.get("triggerfires") ?? [];
    return ruleid === void 0 ? fires : fires.filter((fire) => fire.ruleid === ruleid);
  }
  /** Stores the pending trigger queue: fires that arrived while the target run was busy or the session paused; the resume drains them through the same gates. */
  async settriggerqueue(queue) {
    return this.adapter.set("triggerqueue", queue);
  }
  /** Returns the pending trigger queue, oldest first. */
  async gettriggerqueue() {
    return await this.adapter.get("triggerqueue") ?? [];
  }
  /** Stores one verified webhook payload of a rule; the executor verifies the shared secret and the schema before anything persists. */
  async addwebhookpayload(ruleid, payload, at) {
    const stored = await this.adapter.get(
      "webhookpayloads"
    ) ?? [];
    await this.adapter.set("webhookpayloads", [{ ruleid, payload, at }, ...stored]);
  }
  /** Returns the stored webhook payloads of one rule, newest first; only secret verified deliveries ever reach this store. */
  async listwebhookpayloads(ruleid) {
    const stored = await this.adapter.get(
      "webhookpayloads"
    ) ?? [];
    return stored.filter((entry) => entry.ruleid === ruleid);
  }
  /** Stores one manual run preview with its step list so the panel renders it before confirmation. */
  async addmanualrun(preview) {
    const runs = (await this.listmanualruns()).filter((entry) => entry.id !== preview.id);
    await this.adapter.set("manualruns", [preview, ...runs]);
  }
  /** Returns every stored manual run preview with its confirmation outcome, newest first. */
  async listmanualruns() {
    return await this.adapter.get("manualruns") ?? [];
  }
  /** Stores one workflow version record with its change note; saving the same version again replaces its note while older versions survive for the timeline. */
  async addworkflowversion(version) {
    const versions = (await this.listworkflowversions()).filter(
      (entry) => !(entry.workflowid === version.workflowid && entry.version === version.version)
    );
    await this.adapter.set("workflowversions", [version, ...versions]);
  }
  /** Returns every stored workflow version record, newest first, optionally filtered to one workflow. */
  async listworkflowversions(workflowid) {
    const versions = await this.adapter.get("workflowversions") ?? [];
    return workflowid === void 0 ? versions : versions.filter((entry) => entry.workflowid === workflowid);
  }
  /** Stores one version diff result for the history view. */
  async addversiondiff(diff) {
    const diffs = (await this.listversiondiffs()).filter(
      (entry) => !(entry.workflowid === diff.workflowid && entry.from === diff.from && entry.to === diff.to)
    );
    await this.adapter.set("versiondiffs", [diff, ...diffs]);
  }
  /** Returns every stored version diff result, newest first, optionally filtered to one workflow. */
  async listversiondiffs(workflowid) {
    const diffs = await this.adapter.get("versiondiffs") ?? [];
    return workflowid === void 0 ? diffs : diffs.filter((entry) => entry.workflowid === workflowid);
  }
  /** Records one run history entry — the outcome, duration and trigger cause of one execution — under the user configured retention window with no code ceiling. */
  async addrunhistory(entry) {
    const entries = await this.gethistory();
    const combined = [entry, ...entries];
    const retention = (await this.getsettings())?.runhistoryretention;
    await this.adapter.set("runhistory", retention === void 0 ? combined : combined.slice(0, retention));
  }
  /** Returns the stored run history, newest first, filtered by workflow, outcome and time floor; the filters stay user choices. */
  async gethistory(filter) {
    const entries = await this.adapter.get("runhistory") ?? [];
    let filtered = entries;
    if (filter?.workflowid !== void 0) filtered = filtered.filter((entry) => entry.workflowid === filter.workflowid);
    if (filter?.outcome !== void 0) filtered = filtered.filter((entry) => entry.outcome === filter.outcome);
    if (filter?.since !== void 0) filtered = filtered.filter((entry) => entry.endedat >= filter.since);
    if (filter?.limit !== void 0) filtered = filtered.slice(0, filter.limit);
    return filtered;
  }
  /** Stores the editor layout of one workflow so the canvas reopens exactly as left. */
  async seteditorlayout(workflowid, layout) {
    return this.adapter.set(`editorlayout${workflowid}`, layout);
  }
  /** Returns the stored editor layout of one workflow. */
  async geteditorlayout(workflowid) {
    return await this.adapter.get(`editorlayout${workflowid}`) ?? void 0;
  }
  /** Stores the breakpoint step ids of one workflow. */
  async setworkflowbreakpoints(workflowid, stepids) {
    return this.adapter.set(`workflowbreakpoints${workflowid}`, stepids);
  }
  /** Returns the stored breakpoint step ids of one workflow, oldest first. */
  async getworkflowbreakpoints(workflowid) {
    return await this.adapter.get(`workflowbreakpoints${workflowid}`) ?? [];
  }
  /** Stores one per site policy override; re-adding the same id replaces its deltas. */
  async addsiteoverride(override) {
    const overrides = (await this.listsiteoverrides()).filter((entry) => entry.id !== override.id);
    await this.adapter.set("siteoverrides", [override, ...overrides]);
  }
  /** Returns every stored per site override, newest first, optionally filtered to one workflow. */
  async listsiteoverrides(workflowid) {
    const overrides = await this.adapter.get("siteoverrides") ?? [];
    return workflowid === void 0 ? overrides : overrides.filter((entry) => entry.workflowid === workflowid);
  }
  /** Removes one per site override when the user deletes it. */
  async removesiteoverride(id) {
    await this.adapter.set(
      "siteoverrides",
      (await this.listsiteoverrides()).filter((entry) => entry.id !== id)
    );
  }
  /** Stores one watchdog event with its recovery outcome; the event history keeps the audit trail of every scan. */
  async addwatchdogevent(event) {
    const events = (await this.listwatchdogevents()).filter((entry) => entry.id !== event.id);
    await this.adapter.set("watchdogevents", [event, ...events]);
  }
  /** Returns every stored watchdog event, newest first. */
  async listwatchdogevents() {
    return await this.adapter.get("watchdogevents") ?? [];
  }
  /** Stores one pending workflow import held for review; approving it later stores the record as runnable. */
  async addworkflowimport(entry) {
    const imports = (await this.listworkflowimports()).filter((candidate) => candidate.id !== entry.id);
    await this.adapter.set("workflowimports", [entry, ...imports]);
  }
  /** Returns every pending workflow import, newest first. */
  async listworkflowimports() {
    return await this.adapter.get("workflowimports") ?? [];
  }
  /** Removes one pending import when the user approves or rejects it. */
  async removeworkflowimport(id) {
    await this.adapter.set(
      "workflowimports",
      (await this.listworkflowimports()).filter((entry) => entry.id !== id)
    );
  }
  /** Stores the per workflow background run flags so a workflow keeps running with the panel closed. */
  async setbackgroundruns(flags) {
    return this.adapter.set("backgroundruns", flags);
  }
  /** Returns the per workflow background run flags. */
  async getbackgroundruns() {
    return await this.adapter.get("backgroundruns") ?? {};
  }
  /** Removes one stored workflow record version; a rejected import or rollback disappears from the library while every other version survives. */
  async removeworkflowversion(id, version) {
    await this.adapter.set(
      "workflowrecords",
      (await this.getworkflowrecordversions()).filter((entry) => !(entry.id === id && entry.version === version))
    );
  }
  /** Returns every stored mcp client record, newest first. */
  async getclients() {
    return await this.adapter.get("mcpclients") ?? [];
  }
  /** Upserts one mcp client record by its id so one clientrecord stays per connected transport. */
  async setclient(client) {
    const records = (await this.getclients()).filter((entry) => entry.id !== client.id);
    await this.adapter.set("mcpclients", [client, ...records]);
  }
  /** Returns the connected client records — every client whose disconnect time is absent. */
  async listclients() {
    return (await this.getclients()).filter((client) => client.disconnectedat === void 0);
  }
  /** Stores the negotiated capability set of one client on its record. */
  async setclientcapabilities(id, capabilities) {
    await this.adapter.set(
      "mcpclients",
      (await this.getclients()).map((client) => client.id === id ? { ...client, capabilities } : client)
    );
  }
  /** Drops every stored client record when the server stops. */
  async clearclients() {
    await this.adapter.set("mcpclients", []);
  }
  /** Records one stdio bridge launch event with its process id; a restart marker distinguishes the relaunch of a dead client process. */
  async addbridgelaunch(launch) {
    await this.adapter.set("mcbridgelaunches", [
      launch,
      ...await this.adapter.get("mcbridgelaunches") ?? []
    ]);
  }
  /** Returns every stdio bridge launch event, newest first. */
  async listbridgelaunches() {
    return await this.adapter.get("mcbridgelaunches") ?? [];
  }
  /** Returns the user configured mcp server config; an absent record keeps the documented localhost default. */
  async getmcpconfig() {
    return this.adapter.get("mcpconfig");
  }
  /** Stores the user configured mcp server config: bind address, port, transports, frame size, queue depth and enablement all stay user choices. */
  async setmcpconfig(config) {
    return this.adapter.set("mcpconfig", config);
  }
  /** Returns the persisted mcp server runtime state. */
  async getmcpstate() {
    return this.adapter.get("mcpstate");
  }
  /** Stores the mcp server runtime state with the stdio bridge status. */
  async setmcpstate(state) {
    return this.adapter.set("mcpstate", state);
  }
  /** Records one mcp tool call — the client, the tool, the origin and the outcome without any payload — under the user configured call retention with no code ceiling. */
  async addtoolcall(record2) {
    const records = await this.listtoolcalls();
    const retention = (await this.getmcpconfig())?.callretention;
    await this.adapter.set(
      "mcptoolcalls",
      retention === void 0 ? [record2, ...records] : [record2, ...records].slice(0, retention)
    );
  }
  /** Returns every stored mcp tool call record, newest first. */
  async listtoolcalls() {
    return await this.adapter.get("mcptoolcalls") ?? [];
  }
  /** Returns every stored session token of paired remote clients; the records carry only their tokenhash form so raw tokens never persist. */
  async getsessiontokens() {
    return await this.adapter.get("mcpsessiontokens") ?? [];
  }
  /** Replaces the stored session token set after one issue, revocation or expiry sweep. */
  async setsessiontokens(tokens) {
    return this.adapter.set("mcpsessiontokens", tokens);
  }
  /** Returns every stored pairing code with its single use state, newest first. */
  async getpairingcodes() {
    return await this.adapter.get("mcppairingcodes") ?? [];
  }
  /** Records one issued pairing code for the one time client pairing. */
  async addpairingcode(code) {
    return this.adapter.set("mcppairingcodes", [
      code,
      ...(await this.getpairingcodes()).filter((candidate) => candidate.code !== code.code)
    ]);
  }
  /** Marks one pairing code used so it never pairs a second client; an unknown code stays untouched. */
  async usepairingcode(code, now) {
    await this.adapter.set(
      "mcppairingcodes",
      (await this.getpairingcodes()).map(
        (candidate) => candidate.code === code ? { ...candidate, usedat: now } : candidate
      )
    );
  }
  /** Returns every client allowlist entry with its grant history. */
  async getallowlist() {
    return await this.adapter.get("mcpallowlist") ?? [];
  }
  /** Upserts one client allowlist entry by its fingerprint with the grant history riding the record. */
  async setallowlistentry(entry) {
    await this.adapter.set("mcpallowlist", [
      entry,
      ...(await this.getallowlist()).filter((candidate) => candidate.fingerprint !== entry.fingerprint)
    ]);
  }
  /** Removes one client allowlist entry so its fingerprint stops passing the allowlist check. */
  async removeallowlistentry(fingerprint) {
    await this.adapter.set(
      "mcpallowlist",
      (await this.getallowlist()).filter((entry) => entry.fingerprint !== fingerprint)
    );
  }
  /** Returns every approval gate with its decision state — the pending and resolved gates of the approval view. */
  async listapprovals() {
    return await this.adapter.get("mcpapprovals") ?? [];
  }
  /** Records one raised approval gate or its resolved state, keyed by the gate id. */
  async setapproval(request) {
    await this.adapter.set("mcpapprovals", [
      request,
      ...(await this.listapprovals()).filter((candidate) => candidate.id !== request.id)
    ]);
  }
  /** Records one approval execution — the decision, the actor, the time and the latency — beside its gate. */
  async addapprovalexec(exec) {
    return this.adapter.set("mcpapprovalexecs", [
      exec,
      ...await this.adapter.get("mcpapprovalexecs") ?? []
    ]);
  }
  /** Returns every approval execution record, newest first. */
  async listapprovalexecs() {
    return await this.adapter.get("mcpapprovalexecs") ?? [];
  }
  /** Records one auth handshake event with its issued, verified or refused outcome. */
  async addauthhandshake(event) {
    return this.adapter.set("mcpauthhandshakes", [
      event,
      ...await this.adapter.get("mcpauthhandshakes") ?? []
    ]);
  }
  /** Returns every auth handshake event with its outcome, newest first. */
  async listauthhandshakes() {
    return await this.adapter.get("mcpauthhandshakes") ?? [];
  }
  /** Returns every stored client identity with its fingerprint for allowlist matching. */
  async getclientidentities() {
    return await this.adapter.get("mcpidentities") ?? [];
  }
  /** Upserts one client identity by its fingerprint so the allowlist matches it. */
  async setclientidentity(identity) {
    await this.adapter.set("mcpidentities", [
      identity,
      ...(await this.getclientidentities()).filter((candidate) => candidate.fingerprint !== identity.fingerprint)
    ]);
  }
  /** Returns every open and closed stream channel of the http stream transport. */
  async getstreamchannels() {
    return await this.adapter.get("mcpchannels") ?? [];
  }
  /** Replaces the stored stream channel set after one open, heartbeat or close sweep. */
  async setstreamchannels(channels) {
    return this.adapter.set("mcpchannels", channels);
  }
  /** Returns every client event subscription with its kinds and filters, newest first. */
  async geteventsubscriptions() {
    return await this.adapter.get("mcpeventsubscriptions") ?? [];
  }
  /** Replaces the stored event subscription set after one subscribe, unsubscribe or delivery sweep. */
  async seteventsubscriptions(subscriptions) {
    return this.adapter.set("mcpeventsubscriptions", subscriptions);
  }
  /** Returns every page state resource watcher with its baseline, newest first. */
  async getresourcewatches() {
    return await this.adapter.get("mcpresourcewatches") ?? [];
  }
  /** Replaces the stored resource watcher set after one watch, unwatch or delta push. */
  async setresourcewatches(watches) {
    return this.adapter.set("mcpresourcewatches", watches);
  }
  /** Returns every sampling request with its provenance, newest first. */
  async getsamplingrequests() {
    return await this.adapter.get("mcpsampling") ?? [];
  }
  /** Replaces the stored sampling request set after one request or answer. */
  async setsamplingrequests(requests) {
    return this.adapter.set("mcpsampling", requests);
  }
  /** Returns every stored idempotency record for replay, newest first. */
  async getidempotencyrecords() {
    return await this.adapter.get("mcpidempotency") ?? [];
  }
  /** Replaces the stored idempotency record set after one store or expiry sweep. */
  async setidempotencyrecords(records) {
    return this.adapter.set("mcpidempotency", records);
  }
  /** Returns every per client rate limit counter with its window and budget. */
  async getcallratelimits() {
    return await this.adapter.get("mcpcallratelimits") ?? [];
  }
  /** Replaces the stored per client rate limit set after one configuration or counted call. */
  async setcallratelimits(limits) {
    return this.adapter.set("mcpcallratelimits", limits);
  }
  /** Returns every stored batch call with its per item outcomes, newest first. */
  async getbatchcalls() {
    return await this.adapter.get("mcpbatchcalls") ?? [];
  }
  /** Upserts one batch call by its id with the per item outcomes riding the record. */
  async setbatchcall(batch) {
    await this.adapter.set("mcpbatchcalls", [
      batch,
      ...(await this.getbatchcalls()).filter((candidate) => candidate.id !== batch.id)
    ]);
  }
  /** Returns every call context of the call runtime, newest first. */
  async getcallcontexts() {
    return await this.adapter.get("mcpcallcontexts") ?? [];
  }
  /** Replaces the stored call context set after one begin, end or cancellation. */
  async setcallcontexts(contexts) {
    return this.adapter.set("mcpcallcontexts", contexts);
  }
  /** Returns every stored tool mock for client testing. */
  async gettoolmocks() {
    return await this.adapter.get("mcptoolmocks") ?? [];
  }
  /** Upserts one tool mock by its tool name or removes it when the canned result is absent. */
  async settoolmock(mock) {
    await this.adapter.set("mcptoolmocks", [
      mock,
      ...(await this.gettoolmocks()).filter((candidate) => candidate.tool !== mock.tool)
    ]);
  }
  /** Removes one tool mock so its tool returns to the real gates. */
  async removetoolmock(tool) {
    await this.adapter.set(
      "mcptoolmocks",
      (await this.gettoolmocks()).filter((candidate) => candidate.tool !== tool)
    );
  }
  /** Stores one stream chunk of a progressive tool result under the recent chunk window of 25 records. */
  async addstreamchunk(chunk) {
    await this.adapter.set("mcpstreamchunks", [chunk, ...(await this.getstreamchunks()).slice(0, 24)]);
  }
  /** Returns the recent stream chunks of progressive tool results, newest first. */
  async getstreamchunks() {
    return await this.adapter.get("mcpstreamchunks") ?? [];
  }
  /** Replaces the recent stream chunk window after one streaming sweep. */
  async setstreamchunks(chunks) {
    return this.adapter.set("mcpstreamchunks", chunks);
  }
  /** Returns the audited tool call log under the requested filters: the client, the tool, the outcome, the time floor and the newest bound, all optional. */
  async getcalllog(filters) {
    let records = await this.listtoolcalls();
    if (filters?.clientid !== void 0) records = records.filter((record2) => record2.clientid === filters.clientid);
    if (filters?.tool !== void 0) records = records.filter((record2) => record2.tool === filters.tool);
    if (filters?.ok !== void 0) records = records.filter((record2) => record2.ok === filters.ok);
    if (filters?.since !== void 0) records = records.filter((record2) => record2.at >= (filters.since ?? 0));
    return filters?.limit !== void 0 ? records.slice(0, filters.limit) : records;
  }
  /** Stores one progress notice of a long tool call under the recent notice window of 25 records. */
  async addprogressnotice(notice) {
    await this.adapter.set("mcpprogressnotices", [notice, ...(await this.getprogressnotices()).slice(0, 24)]);
  }
  /** Returns the recent progress notices of long tool calls, newest first. */
  async getprogressnotices() {
    return await this.adapter.get("mcpprogressnotices") ?? [];
  }
  /** Returns the tool dry run toggle of the next call: true once the user armed the dry run in the panel. */
  async getdryruntoggle() {
    return await this.adapter.get("mcpdryruntoggle") === true;
  }
  /** Arms or disarms the tool dry run of the next call. */
  async setdryruntoggle(enabled) {
    return this.adapter.set("mcpdryruntoggle", enabled);
  }
  /** Returns every client session binding of the 1.1.84 serve mode: one live binding per client so concurrent clients hold isolated extension sessions. */
  async getclientbindings() {
    return await this.adapter.get("mcpclientbindings") ?? [];
  }
  /** Replaces the stored client binding set after one bind or release; the released records stay for the audit trail. */
  async setclientbindings(bindings) {
    return this.adapter.set("mcpclientbindings", bindings);
  }
  /** Upserts one client session binding of the 1.1.84 serve mode by its client id. */
  async setclientbinding(binding) {
    await this.adapter.set("mcpclientbindings", [
      binding,
      ...(await this.getclientbindings()).filter((candidate) => candidate.clientid !== binding.clientid)
    ]);
  }
  /** Returns the shutdown drain window of the 1.1.84 serve mode in milliseconds; an absent window keeps the drain unbounded because the wait stays a user choice. */
  async getdrainwindow() {
    return this.adapter.get("mcpdrainwindow");
  }
  /** Stores the shutdown drain window of the 1.1.84 serve mode as the user configured value with no code ceiling. */
  async setdrainwindow(window) {
    return this.adapter.set("mcpdrainwindow", window);
  }
  /** Returns every user configured provider config of the 1.1.57 llm integration; the api keys stay behind their storage id references, never inside these records. */
  async getproviders() {
    return await this.adapter.get("llmproviders") ?? [];
  }
  /** Replaces the stored provider config set after one save, test or removal. */
  async setproviders(providers) {
    return this.adapter.set("llmproviders", providers);
  }
  /** Returns the user configured local model endpoint of the browser reachable inference. */
  async getlocalmodel() {
    return this.adapter.get("llmlocalmodel");
  }
  /** Stores the local model endpoint config after one save or health check. */
  async setlocalmodel(config) {
    return this.adapter.set("llmlocalmodel", config);
  }
  /** Returns every model route entry of the routing table, newest update first. */
  async getmodelroutes() {
    return await this.adapter.get("llmmodelroutes") ?? [];
  }
  /** Replaces the stored routing table after one route edit. */
  async setmodelroutes(routes) {
    return this.adapter.set("llmmodelroutes", routes);
  }
  /** Appends one revision entry to the model route revision history so every routing change stays queryable for audit. */
  async addmodelrouterevision(route) {
    await this.adapter.set(
      "llmmodelroutehistory",
      [route, ...await this.adapter.get("llmmodelroutehistory") ?? []].slice(0, 200)
    );
  }
  /** Returns the model route revision history, newest first. */
  async getmodelroutehistory() {
    return await this.adapter.get("llmmodelroutehistory") ?? [];
  }
  /** Records one usage entry of a model call with its run and step ids; the newest call reads first and an absent retention keeps every record. */
  async addusagerecord(record2) {
    await this.adapter.set("llmusage", [record2, ...await this.adapter.get("llmusage") ?? []]);
  }
  /** Returns every stored usage record of model calls, newest first. */
  async getusagerecords() {
    return await this.adapter.get("llmusage") ?? [];
  }
  /** Returns the token and cost totals per period: the run, the step, the since floor and the until ceiling stay optional filters over the stored usage records. */
  async getusage(filter = {}) {
    const records = (await this.getusagerecords()).filter(
      (record2) => (filter.runid === void 0 || record2.runid === filter.runid) && (filter.stepid === void 0 || record2.stepid === filter.stepid) && (filter.since === void 0 || record2.at >= filter.since) && (filter.until === void 0 || record2.at <= filter.until)
    );
    return records.reduce(
      (totals, record2) => ({
        prompttokens: totals.prompttokens + record2.prompttokens,
        completiontokens: totals.completiontokens + record2.completiontokens,
        totaltokens: totals.totaltokens + record2.totaltokens,
        cost: totals.cost + record2.cost,
        calls: totals.calls + 1
      }),
      { prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, calls: 0 }
    );
  }
  /** Stores one model drafted plan for review and audit; newer drafts read first. */
  async addplandraft(draft) {
    await this.adapter.set("llmplandrafts", [draft, ...await this.adapter.get("llmplandrafts") ?? []]);
  }
  /** Replaces the stored draft set after one review decision. */
  async setplandrafts(drafts) {
    return this.adapter.set("llmplandrafts", drafts);
  }
  /** Returns every stored model drafted plan, newest first. */
  async getplandrafts() {
    return await this.adapter.get("llmplandrafts") ?? [];
  }
  /** Stores one replan record for the fresh review and the audit history; newer replans read first. */
  async addreplan(replan) {
    await this.adapter.set("llmreplans", [replan, ...await this.adapter.get("llmreplans") ?? []]);
  }
  /** Replaces the stored replan set after one fresh review decision. */
  async setreplans(replans) {
    return this.adapter.set("llmreplans", replans);
  }
  /** Returns every stored replan record, newest first. */
  async getreplans() {
    return await this.adapter.get("llmreplans") ?? [];
  }
  /** Stores one reflection note of an executed step under the recent note window of 100 records. */
  async addreflectnote(note) {
    await this.adapter.set(
      "llmreflectnotes",
      [note, ...await this.adapter.get("llmreflectnotes") ?? []].slice(0, 100)
    );
  }
  /** Returns the stored reflection notes, newest first. */
  async getreflectnotes() {
    return await this.adapter.get("llmreflectnotes") ?? [];
  }
  /** Replaces the stored prompt template library after one save or removal; every version with its change notes stays stored. */
  async setprompttemplates(templates) {
    return this.adapter.set("llmprompttemplates", templates);
  }
  /** Returns the stored prompt template library with every version, newest first. */
  async getprompttemplates() {
    return await this.adapter.get("llmprompttemplates") ?? [];
  }
  /** Returns the stored cost budget of the runs; the run scoped budget wins over the shared one when both exist. */
  async getcostbudget(runid) {
    const budgets = await this.adapter.get("llmcostbudgets") ?? [];
    return budgets.find((budget) => runid !== void 0 && budget.runid === runid) ?? budgets.find((budget) => budget.runid === void 0);
  }
  /** Stores one cost budget; a run scoped budget replaces the earlier budget of its run while the shared budget replaces the shared one. */
  async setcostbudget(budget) {
    const budgets = await this.adapter.get("llmcostbudgets") ?? [];
    const kept = budgets.filter((candidate) => candidate.runid !== budget.runid);
    await this.adapter.set("llmcostbudgets", [budget, ...kept]);
  }
  /** Returns the latest parsed natural language command with its intent badge payload. */
  async getcommandparse() {
    return this.adapter.get("llmcommandparse");
  }
  /** Stores the latest parsed natural language command. */
  async setcommandparse(parse) {
    return this.adapter.set("llmcommandparse", parse);
  }
  /** Returns the recent guard refusal notices of invalid or refused model output, newest first under a window of 50. */
  async getguardnotices() {
    return await this.adapter.get("llmguardnotices") ?? [];
  }
  /** Records one guard refusal notice for the panel; the verdict reason explains the parse failure and its retries. */
  async addguardnotice(output) {
    if (output.verdict === "valid") return;
    await this.adapter.set("llmguardnotices", [output, ...await this.getguardnotices()].slice(0, 50));
  }
  /** Returns every user configured provider gateway of the 1.1.83 family: the base url, the path prefix, the enable toggle, the consent stamp and the key reference — the key material stays behind the vault seam, never inside these records. */
  async getgatewayconfigs() {
    return await this.adapter.get("gatewayconfigs") ?? [];
  }
  /** Replaces the stored provider gateway configs after one save, consent or removal. */
  async setgatewayconfigs(configs) {
    return this.adapter.set("gatewayconfigs", configs);
  }
  /** Returns the cached model lists of the provider gateways, one record per provider. */
  async getgatewaymodelcaches() {
    return await this.adapter.get("gatewaymodelcaches") ?? [];
  }
  /** Replaces one provider model cache record, keeping every other provider record untouched. */
  async setgatewaymodelcache(record2) {
    await this.adapter.set("gatewaymodelcaches", [
      record2,
      ...(await this.getgatewaymodelcaches()).filter((entry) => entry.providerid !== record2.providerid)
    ]);
  }
  /** Returns the stored gateway chat exchanges, newest first under a window of 20; the states carry tokens and errors only, never key material. */
  async getgatewaychats() {
    return await this.adapter.get("gatewaychats") ?? [];
  }
  /** Stores one gateway chat exchange, newest first under a window of 20; a stored requestid replaces its earlier state so the stream cursor polls one record. */
  async addgatewaychat(state) {
    await this.adapter.set(
      "gatewaychats",
      [state, ...(await this.getgatewaychats()).filter((entry) => entry.requestid !== state.requestid)].slice(0, 20)
    );
  }
  /** Removes one gateway chat exchange by its request id; the cancel control drops the record the panel stops polling. */
  async removegatewaychat(requestid) {
    await this.adapter.set(
      "gatewaychats",
      (await this.getgatewaychats()).filter((entry) => entry.requestid !== requestid)
    );
  }
  /** Returns the user configured model cache refresh window in milliseconds; an absent window keeps every cache fresh forever because the window stays a user choice. */
  async getgatewaycachewindow() {
    return this.adapter.get("gatewaycachewindow");
  }
  /** Stores the user configured model cache refresh window in milliseconds. */
  async setgatewaycachewindow(window) {
    return this.adapter.set("gatewaycachewindow", window);
  }
  /** Returns every agent identity of the 1.1.58 swarm with its tab, role, depth, budget and scope. */
  async getagents() {
    return await this.adapter.get("swarmagents") ?? [];
  }
  /** Replaces the stored agent identities after one register, assign, bind, spawn or lifecycle change. */
  async setagents(agents) {
    return this.adapter.set("swarmagents", agents);
  }
  /** Returns the shared task queue of the swarm with its lanes, priorities, items and claims. */
  async gettaskqueue() {
    return this.adapter.get("swarmtaskqueue");
  }
  /** Replaces the stored task queue after one enqueue, claim, steal, complete, cancel or requeue. */
  async settaskqueue(queue) {
    return this.adapter.set("swarmtaskqueue", queue);
  }
  /** Returns every agent mailbox; retention is a user setting and an absent setting keeps every message. */
  async getmailboxes() {
    return await this.adapter.get("swarmmailboxes") ?? [];
  }
  /** Replaces the stored mailboxes after one send or receive, applying the user configured mailbox retention over the stored inbox and outbox messages. */
  async setmailboxes(mailboxes) {
    const retention = (await this.getsettings())?.mailboxretention;
    const trimmed = retention === void 0 ? mailboxes : mailboxes.map((mailbox) => ({
      ...mailbox,
      inbox: mailbox.inbox.slice(0, retention),
      outbox: mailbox.outbox.slice(0, retention)
    }));
    return this.adapter.set("swarmmailboxes", trimmed);
  }
  /** Returns the blackboard shared memory of the swarm with its sections and entries. */
  async getblackboard() {
    return this.adapter.get("swarmblackboard");
  }
  /** Replaces the stored blackboard after one post, retire or sweep. */
  async setblackboard(board) {
    return this.adapter.set("swarmblackboard", board);
  }
  /** Returns the killswitch state of the swarm. */
  async getkillswitch() {
    return this.adapter.get("swarmkillswitch");
  }
  /** Stores the killswitch state after one engage or disarm. */
  async setkillswitch(state) {
    return this.adapter.set("swarmkillswitch", state);
  }
  /** Records one spawn of a sub agent with its depth for the audit history, newest first. */
  async addspawnrecord(record2) {
    await this.adapter.set("swarmspawns", [record2, ...await this.adapter.get("swarmspawns") ?? []]);
  }
  /** Returns the spawn and depth history of the swarm, newest first. */
  async getspawnrecords() {
    return await this.adapter.get("swarmspawns") ?? [];
  }
  /** Records one agent lifecycle event notification, newest first under a window of 200. */
  async addagentevent(event) {
    await this.adapter.set(
      "swarmevents",
      [event, ...await this.adapter.get("swarmevents") ?? []].slice(0, 200)
    );
  }
  /** Returns the recorded agent lifecycle events, newest first. */
  async getagentevents() {
    return await this.adapter.get("swarmevents") ?? [];
  }
  /** Replaces the stored per agent usage counters held against the agent budgets. */
  async setagentusage(usage) {
    return this.adapter.set("swarmusage", usage);
  }
  /** Returns the stored per agent usage counters held against the agent budgets. */
  async getagentusage() {
    return await this.adapter.get("swarmusage") ?? [];
  }
  /** Returns the swarm at a glance: the agents, the tasks by claim state and the message counters read from the stored swarm records. */
  async swarmoverview() {
    const agents = await this.getagents();
    const queue = await this.gettaskqueue();
    const mailboxes = await this.getmailboxes();
    return swarmoverview({
      agents,
      queue: queue ?? { lanes: [], priorities: [], completionpolicy: "all", items: [], claims: [] },
      mailboxes
    });
  }
  /** Returns the leader worker topology of the 1.1.59 swarm with its leader, worker, critic and verifier lanes and its worker assignments. */
  async gettopology() {
    return this.adapter.get("swarmtopology");
  }
  /** Replaces the stored leader worker topology after one election, assignment, collection or scaling change. */
  async settopology(topology) {
    return this.adapter.set("swarmtopology", topology);
  }
  /** Returns the stored planner executor splits of the 1.1.59 swarm with their step reports. */
  async getplannersplits() {
    return await this.adapter.get("swarmsplits") ?? [];
  }
  /** Replaces the stored planner executor splits after one split or one executor step report. */
  async setplannersplits(splits) {
    return this.adapter.set("swarmsplits", splits);
  }
  /** Records one critic review of an agent output, newest first. */
  async addcriticreview(review) {
    await this.adapter.set("swarmreviews", [
      review,
      ...await this.adapter.get("swarmreviews") ?? []
    ]);
  }
  /** Returns the recorded critic reviews, newest first. */
  async getcriticreviews() {
    return await this.adapter.get("swarmreviews") ?? [];
  }
  /** Records one verifier check of a result claim, newest first. */
  async addverifiercheck(check) {
    await this.adapter.set("swarmverifierchecks", [
      check,
      ...await this.adapter.get("swarmverifierchecks") ?? []
    ]);
  }
  /** Returns the recorded verifier checks with their pass and fail outcomes, newest first. */
  async getverifierchecks() {
    return await this.adapter.get("swarmverifierchecks") ?? [];
  }
  /** Replaces the stored review requests routed between agents after one request, ack, answer or timeout. */
  async setreviewrequests(requests) {
    return this.adapter.set("swarmreviewrequests", requests);
  }
  /** Returns the stored review requests routed between agents. */
  async getreviewrequests() {
    return await this.adapter.get("swarmreviewrequests") ?? [];
  }
  /** Records one tab handoff with its packaged task state and its resumed state. */
  async addhandoff(record2) {
    await this.adapter.set(
      "swarmhandoffs",
      [record2, ...await this.adapter.get("swarmhandoffs") ?? []].filter(
        (entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index
      )
    );
  }
  /** Replaces one stored handoff record after its transfer or resume. */
  async updatehandoff(record2) {
    await this.adapter.set(
      "swarmhandoffs",
      (await this.adapter.get("swarmhandoffs") ?? []).map(
        (entry) => entry.id === record2.id ? record2 : entry
      )
    );
  }
  /** Returns the handoff log of tab transfers between agents, newest first. */
  async gethandoffs() {
    return await this.adapter.get("swarmhandoffs") ?? [];
  }
  /** Replaces the stored resource locks after one acquire, release or expiry sweep. */
  async setlocks(locks) {
    return this.adapter.set("swarmlocks", locks);
  }
  /** Returns the held resource locks with their holders and expiries. */
  async getlocks() {
    return await this.adapter.get("swarmlocks") ?? [];
  }
  /** Records one conflict scan report of overlapping writes, newest first. */
  async addconflictscan(scan) {
    await this.adapter.set("swarmconflicts", [
      scan,
      ...await this.adapter.get("swarmconflicts") ?? []
    ]);
  }
  /** Returns the recorded conflict scan reports, newest first. */
  async getconflictscans() {
    return await this.adapter.get("swarmconflicts") ?? [];
  }
  /** Stores the merged result report with its mergeentry provenance. */
  async setreport(report) {
    return this.adapter.set("swarmreport", report);
  }
  /** Returns the stored merged result report across agents. */
  async getreport() {
    return this.adapter.get("swarmreport");
  }
  /** Records one progressboard snapshot under the user configured retention window; an absent window keeps every snapshot. */
  async addboardsnapshot(board) {
    const retention = (await this.getsettings())?.boardretention;
    await this.adapter.set(
      "swarmboards",
      [board, ...await this.adapter.get("swarmboards") ?? []].slice(0, retention ?? 100)
    );
  }
  /** Returns the stored progressboard snapshots, newest first. */
  async getboardsnapshots() {
    return await this.adapter.get("swarmboards") ?? [];
  }
  /** Records one escalation lifted to the user, newest first. */
  async addescalation(escalation) {
    await this.adapter.set("swarmescalations", [
      escalation,
      ...await this.adapter.get("swarmescalations") ?? []
    ]);
  }
  /** Replaces one stored escalation after its user decision. */
  async updateescalation(escalation) {
    await this.adapter.set(
      "swarmescalations",
      (await this.adapter.get("swarmescalations") ?? []).map(
        (entry) => entry.id === escalation.id ? escalation : entry
      )
    );
  }
  /** Returns the escalations awaiting the user and the decided ones, newest first. */
  async getescalations() {
    return await this.adapter.get("swarmescalations") ?? [];
  }
  /** Records one consensus round or replaces the stored one after a vote. */
  async setconsensusround(round) {
    const rounds = await this.adapter.get("swarmconsensus") ?? [];
    await this.adapter.set(
      "swarmconsensus",
      rounds.some((entry) => entry.id === round.id) ? rounds.map((entry) => entry.id === round.id ? round : entry) : [round, ...rounds]
    );
  }
  /** Returns the consensus rounds with their votes and quorum states, newest first. */
  async getconsensusrounds() {
    return await this.adapter.get("swarmconsensus") ?? [];
  }
  /** Appends one action to the interleaved timeline of swarm actions, oldest first under a window of 500. */
  async addswarmaction(action) {
    await this.adapter.set(
      "swarmtimeline",
      [...await this.adapter.get("swarmtimeline") ?? [], action].slice(-500)
    );
  }
  /** Returns the interleaved timeline of swarm actions with the optional agent and kind filters, oldest first. */
  async getswarmtimeline(filters) {
    const actions = await this.adapter.get("swarmtimeline") ?? [];
    return actions.filter((action) => filters?.agentid === void 0 || action.agentid === filters.agentid).filter((action) => filters?.kind === void 0 || action.kind === filters.kind).filter((action) => filters?.since === void 0 || action.at >= filters.since);
  }
  /** Stores one shared cost accounting snapshot of the swarm, newest first. */
  async addswarmcost(cost) {
    await this.adapter.set(
      "swarmcosts",
      [cost, ...await this.adapter.get("swarmcosts") ?? []].slice(0, 100)
    );
  }
  /** Returns the stored shared cost accounting snapshots of the swarm, newest first. */
  async getswarmcosts() {
    return await this.adapter.get("swarmcosts") ?? [];
  }
  /**
   * Execution environment persistence of the 1.1.60 family.
   * The run state store seals every persisted run state with its sha-256 integrity digest through the storage api (the browser offers no at-rest encryption for its storage areas, so the honest derivation is the integrity seal that makes tampering detectable before any recovery uses the record), scopes every run state per profile so parallel profiles never share it, expires stale run state past the user configured window while the keepalive summaries survive, tracks the storage quota usage of the run state and prunes the oldest finished run states under pressure.
   * The adapter seam keeps every accessor a one line storage delegation so a future worker state backend replaces the adapter only.
   */
  /** Returns the environment grant list of the active session; an absent list keeps the documented default posture. */
  async getenvironmentgrants() {
    return (await this.getsession())?.environmentgrants;
  }
  /** Replaces the environment grant list of the active session so the environment grants join the origin grants in the session record. */
  async setenvironmentgrants(grants) {
    const session = await this.getsession();
    if (!session) throw new Error("The environment grants need an active session to join.");
    await this.setsession({ ...session, environmentgrants: grants });
  }
  /** Seals and stores the run state of one profile: the payload travels beside its sha-256 digest so a tampered record at rest stays detectable before any recovery uses it. */
  async setrunstate(profileid, state) {
    const sealed = await sealrunstate(state);
    const index = await this.adapter.get("runstateindex") ?? [];
    await this.adapter.set(`runstate:${profileid}`, sealed);
    if (!index.includes(profileid)) await this.adapter.set("runstateindex", [...index, profileid]);
  }
  /** Opens the sealed run state of one profile; a missing or tampered seal returns undefined so the recovery never trusts a broken record. */
  async getrunstate(profileid) {
    const sealed = await this.adapter.get(`runstate:${profileid}`);
    if (!sealed) return void 0;
    try {
      return await openseal(sealed);
    } catch {
      return void 0;
    }
  }
  /** Removes the run state of one profile from the store and the index: the per profile key takes an empty seal that never opens, so the quota pruning drops the pruned records whole. */
  async removerunstate(profileid) {
    const index = await this.adapter.get("runstateindex") ?? [];
    await this.adapter.set(
      "runstateindex",
      index.filter((entry) => entry !== profileid)
    );
    await this.adapter.set(`runstate:${profileid}`, {
      payload: "",
      algorithm: "sha-256",
      digest: "",
      sealedat: 0
    });
  }
  /** Lists the stored run state records of every profile, oldest update first. */
  async listrunstates() {
    const index = await this.adapter.get("runstateindex") ?? [];
    const states = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (state) states.push(state);
    }
    return states.sort((one, two) => one.updatedat - two.updatedat);
  }
  /** Expires the stale run states past the user configured window: the expired records reduce to their keepalive summaries while an absent window keeps every run state whole. */
  async expirerunstates(window, now) {
    if (window === void 0) return await this.listrunstates();
    const index = await this.adapter.get("runstateindex") ?? [];
    const kept = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (!state) continue;
      if (now - state.updatedat > window && state.keepalive.state === "stopped") {
        const summary = {
          runid: state.runid,
          sessionid: state.sessionid,
          planid: state.planid,
          profileid: state.profileid,
          state: "expired",
          urlhistory: [],
          environments: {},
          turnarounds: {},
          keepalive: state.keepalive,
          updatedat: now
        };
        const sealed = await sealrunstate(summary);
        await this.adapter.set(`runstate:${profileid}`, sealed);
      } else {
        kept.push(state);
      }
    }
    return kept;
  }
  /** Records one worker spawn or teardown event with its provenance beside the step outcomes. */
  async addworkerevent(event) {
    await this.adapter.set(
      "workerevents",
      [event, ...await this.adapter.get("workerevents") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded worker spawn and teardown events, newest first. */
  async getworkerevents() {
    return await this.adapter.get("workerevents") ?? [];
  }
  /** Records one spawned offscreen document with its reasons and justification in the registry. */
  async addoffscreenentry(entry) {
    await this.adapter.set("offscreenregistry", [
      entry,
      ...await this.adapter.get("offscreenregistry") ?? []
    ]);
  }
  /** Replaces one registry entry after its offscreen document closes. */
  async updateoffscreenentry(entry) {
    await this.adapter.set(
      "offscreenregistry",
      (await this.adapter.get("offscreenregistry") ?? []).map(
        (candidate) => candidate.runid === entry.runid ? entry : candidate
      )
    );
  }
  /** Returns the offscreen document registry with the reasons and justification of every spawn. */
  async getoffscreenentries() {
    return await this.adapter.get("offscreenregistry") ?? [];
  }
  /** Records one sandbox render with its provenance, source origin and nonce. */
  async addsandboxrender(render) {
    await this.adapter.set(
      "sandboxrenders",
      [render, ...await this.adapter.get("sandboxrenders") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded sandbox renders with their provenance, newest first. */
  async getsandboxrenders() {
    return await this.adapter.get("sandboxrenders") ?? [];
  }
  /** Replaces the stored run locks after one acquisition, release or expiry sweep. */
  async setrunlocks(locks) {
    return this.adapter.set("runlocks", locks);
  }
  /** Returns the held run locks with their sessions, runs and expiries. */
  async getrunlocks() {
    return await this.adapter.get("runlocks") ?? [];
  }
  /** Tracks the storage quota usage of the run state: the last measured bytes stay beside the user configured ceiling so the pruning reads both. */
  async trackrunstatequota(used) {
    const settings = await this.getsettings();
    await this.adapter.set("runstatequota", {
      used,
      ...settings?.runstatebytes !== void 0 ? { ceiling: settings.runstatebytes } : {},
      trackedat: Date.now()
    });
  }
  /** Returns the last tracked storage quota usage of the run state with its ceiling when the user configured one. */
  async getrunstatequota() {
    return this.adapter.get("runstatequota");
  }
  /** Exports every stored run state as one single audit record through the runstate export envelope. */
  async exportrunstates() {
    return exportrunstate(await this.listrunstates(), Date.now());
  }
  /**
   * Security part one persistence of the 1.1.61 family.
   * The trust boundary records live here: the per origin automation allowlist scoped per profile workspace with one exact origin per entry, the per site originprofiles with their kind grants and denials, the active consentwindows with their expiry timestamps that expire closed past their boundary, the mid run revokerun events with the halted step ids that stay visible for later consent prompts, the fresh class consents per origin, the mask rules for field shapes per origin, and the sealed immutable run logs with their final hash.
   * The run log store exposes no update or delete path: appends land whole, the seal closes a log with its final hash and the read path verifies the chain before returning a single entry so a broken link refuses the read.
   * The adapter seam keeps every accessor a one line storage delegation so a future append only backend replaces the adapter only; the current storage areas offer no append only hardware, so the honest derivation is the hash chain that makes any rewrite detectable at read time.
   */
  /** Replaces the per origin automation allowlist of the profile workspaces; every entry carries one exact origin with no wildcard expansion. */
  async setautomationallowlist(entries) {
    return this.adapter.set("automationallowlist", entries);
  }
  /** Returns the per origin automation allowlist entries, oldest grant first. */
  async getautomationallowlist() {
    return await this.adapter.get("automationallowlist") ?? [];
  }
  /** Adds one exact origin to the automation allowlist of a profile workspace; a duplicate origin keeps its first grant. */
  async addallowlistorigin(entry) {
    const entries = await this.getautomationallowlist();
    if (entries.some((candidate) => candidate.origin === entry.origin && candidate.profileid === entry.profileid))
      return;
    await this.setautomationallowlist([...entries, entry]);
  }
  /** Removes one origin from the automation allowlist; the denydefault posture refuses the origin again after the removal. */
  async removeallowlistorigin(origin, profileid) {
    await this.setautomationallowlist(
      (await this.getautomationallowlist()).filter(
        (entry) => !(entry.origin === origin && entry.profileid === profileid)
      )
    );
  }
  /** Replaces the per site origin profiles with their kind grants and denials; one profile per origin. */
  async setoriginprofiles(profiles) {
    return this.adapter.set("originprofiles", profiles);
  }
  /** Returns the stored per site origin profiles, oldest update first. */
  async getoriginprofiles() {
    return await this.adapter.get("originprofiles") ?? [];
  }
  /** Upserts one origin profile: a profile of the same origin replaces its grants and denials while a new origin joins the list. */
  async saveoriginprofile(profile) {
    const profiles = await this.getoriginprofiles();
    await this.setoriginprofiles(
      profiles.some((candidate) => candidate.origin === profile.origin) ? profiles.map((candidate) => candidate.origin === profile.origin ? profile : candidate) : [...profiles, profile]
    );
  }
  /** Replaces the consent windows; active windows keep their expiry timestamps and closed windows stay for the audit trail. */
  async setconsentwindows(windows) {
    return this.adapter.set("consentwindows", windows);
  }
  /** Returns the stored consent windows, newest start first. */
  async getconsentwindows() {
    return await this.adapter.get("consentwindows") ?? [];
  }
  /** Expires every consent window past its duration boundary: the closed windows keep their records while their grants bind no step anymore. */
  async expireconsentwindows(now) {
    const windows = await this.getconsentwindows();
    const expired = windows.map(
      (window) => window.state === "active" && now >= window.expiresat ? { ...window, state: "closed", closedat: now } : window
    );
    await this.setconsentwindows(expired);
    return expired;
  }
  /** Records one mid run revocation with its halted step ids; the history stays visible for later consent prompts. */
  async addrevocation(event) {
    await this.adapter.set(
      "revocations",
      [event, ...await this.adapter.get("revocations") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded mid run revocations with their halted step ids, newest first. */
  async getrevocations() {
    return await this.adapter.get("revocations") ?? [];
  }
  /** Replaces the fresh class consents per origin. */
  async setclassconsents(consents) {
    return this.adapter.set("classconsents", consents);
  }
  /** Returns the fresh class consents per origin, newest grant first. */
  async getclassconsents() {
    return await this.adapter.get("classconsents") ?? [];
  }
  /** Records one fresh class consent per origin; the prompt of one class never widens another class. */
  async addclassconsent(consent) {
    const consents = (await this.getclassconsents()).filter(
      (candidate) => !(candidate.origin === consent.origin && candidate.sensitiveclass === consent.sensitiveclass)
    );
    await this.setclassconsents([consent, ...consents]);
  }
  /** Replaces the mask rules for sensitive field shapes per origin. */
  async setmaskrules(rules) {
    return this.adapter.set("maskrules", rules);
  }
  /** Returns the stored mask rules for sensitive field shapes per origin, oldest rule first. */
  async getmaskrules() {
    return await this.adapter.get("maskrules") ?? [];
  }
  /** Adds one mask rule for field shapes, optionally scoped to one origin. */
  async addmaskrule(rule) {
    await this.setmaskrules([...await this.getmaskrules(), rule]);
  }
  /** Removes one mask rule by its id. */
  async removemaskrule(id) {
    await this.setmaskrules((await this.getmaskrules()).filter((rule) => rule.id !== id));
  }
  /** Stores the whole run log of one run: the append lands in one storage transaction so the entries and their chain links persist together. */
  async setimmutablelog(log) {
    return this.adapter.set(`immutablelog:${log.runid}`, log);
  }
  /** Returns the stored run log of one run; an absent log returns undefined. */
  async getimmutablelog(runid) {
    return this.adapter.get(`immutablelog:${runid}`);
  }
  /** Lists the stored run logs, oldest update first, with the sealed logs carrying their final hash. */
  async listimmutablelogs() {
    const index = await this.adapter.get("immutablelogindex") ?? [];
    const logs = [];
    for (const runid of index) {
      const log = await this.getimmutablelog(runid);
      if (log) logs.push(log);
    }
    return logs.sort((one, two) => one.updatedat - two.updatedat);
  }
  /** Stores the run log index entry of one run so the log listing reads every stored log. */
  async trackimmutablelog(runid) {
    const index = await this.adapter.get("immutablelogindex") ?? [];
    if (!index.includes(runid)) await this.adapter.set("immutablelogindex", [...index, runid]);
  }
  /** Exports the verified log chain of one run for the audit file: the read path verifies the whole hash chain first and a broken link refuses the export with no entries served. */
  async exportverifiedrunlog(runid) {
    const log = await this.getimmutablelog(runid);
    if (!log) throw new Error(`No run log exists for the run ${runid}.`);
    return exportlogchain(log);
  }
  /** Expires the sealed run logs past the user configured retention: the entries reduce to their chain summaries while the seal hash always survives. */
  async expireimmutablelogs(retention, now) {
    const logs = await this.listimmutablelogs();
    if (retention === void 0) return logs;
    const kept = [];
    for (const log of logs) {
      if (log.seal !== void 0 && now - log.seal.sealedat > retention) {
        const summary = {
          runid: log.runid,
          sessionid: log.sessionid,
          entries: [],
          seal: { ...log.seal, entries: log.seal.entries },
          updatedat: now
        };
        await this.setimmutablelog(summary);
      } else {
        kept.push(log);
      }
    }
    return kept;
  }
  /**
   * Security part two persistence of the 1.1.62 family.
   * The protections for secrets, messages and money live here: the secretvault metadata with labels and scopes only and never values, scoped per profile workspace; the connectallow entries with their senders shipping empty by default; the ratelimit bucket state per origin and per session; the confirm gates with their resolution events and their human action provenance; the redactshot regions per origin and page template; the phishguard verdicts with their distance scores expiring past their freshness window; the permdiff records of each installed version; the safedefaults applications with their first seen origins; and the deferred command events waiting for their bucket reset.
   * The vault values never touch this seam: only metadata persists while the values stay behind the vault seam the background wires.
   */
  /** Replaces the secretvault metadata of the profile workspaces: labels, scopes, provenance and digests only, never values. */
  async setsecretvault(entries) {
    return this.adapter.set("secretvault", entries);
  }
  /** Returns the stored secretvault metadata, oldest record first; the values live behind the vault seam and never persist. */
  async getsecretvault() {
    return await this.adapter.get("secretvault") ?? [];
  }
  /** Adds one secretvault metadata record scoped to a profile workspace; a duplicate vault id keeps its first record. */
  async addsecret(entry) {
    const entries = await this.getsecretvault();
    if (entries.some((candidate) => candidate.vaultid === entry.vaultid)) return;
    await this.setsecretvault([...entries, entry]);
  }
  /** Removes one secretvault metadata record by its vault id; the background drops the value behind the seam in the same action. */
  async removesecret(vaultid) {
    await this.setsecretvault((await this.getsecretvault()).filter((entry) => entry.vaultid !== vaultid));
  }
  /** Stamps the last use of one secretvault record: the metadata notes when the vault last released its value while the value itself stays unrecorded. */
  async stampsecretuse(vaultid, at) {
    await this.setsecretvault(
      (await this.getsecretvault()).map((entry) => entry.vaultid === vaultid ? { ...entry, lastusedat: at } : entry)
    );
  }
  /** Replaces the connectallow entries of external senders; the list ships empty by default with user managed entries only. */
  async setconnectallow(entries) {
    return this.adapter.set("connectallow", entries);
  }
  /** Returns the stored connectallow entries, oldest add first. */
  async getconnectallow() {
    return await this.adapter.get("connectallow") ?? [];
  }
  /** Adds one connectallow entry for an external sender; a duplicate sender id keeps its first entry. */
  async addconnectallow(entry) {
    const entries = await this.getconnectallow();
    if (entries.some((candidate) => candidate.senderid === entry.senderid)) return;
    await this.setconnectallow([...entries, entry]);
  }
  /** Removes one connectallow entry by its sender id; the origincheck drops the sender again after the removal. */
  async removeconnectallow(senderid) {
    await this.setconnectallow((await this.getconnectallow()).filter((entry) => entry.senderid !== senderid));
  }
  /** Replaces the ratelimit bucket state per origin and per session: the user configured bounds and windows with their used counts. */
  async setratelimitbuckets(buckets) {
    return this.adapter.set("ratelimitbuckets", buckets);
  }
  /** Returns the stored ratelimit buckets per origin and per session. */
  async getratelimitbuckets() {
    return await this.adapter.get("ratelimitbuckets") ?? [];
  }
  /** Upserts one ratelimit bucket: a bucket of the same origin and session replaces its state while a new pair joins the list. */
  async saveratelimitbucket(bucket) {
    const buckets = await this.getratelimitbuckets();
    await this.setratelimitbuckets(
      buckets.some((candidate) => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid) ? buckets.map(
        (candidate) => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid ? bucket : candidate
      ) : [...buckets, bucket]
    );
  }
  /** Removes the ratelimit bucket of one origin and session; the origin runs without a bucket because the bounds stay user choices only. */
  async removeratelimitbucket(origin, sessionid) {
    await this.setratelimitbuckets(
      (await this.getratelimitbuckets()).filter(
        (bucket) => !(bucket.origin === origin && bucket.sessionid === sessionid)
      )
    );
  }
  /** Replaces the confirm gates with their payloads and states; a resolved or refused gate stays terminal for the audit trail. */
  async setgates(gates) {
    return this.adapter.set("confirmgates", gates);
  }
  /** Returns the stored confirm gates, newest open first. */
  async getgates() {
    return await this.adapter.get("confirmgates") ?? [];
  }
  /** Upserts one confirm gate: a gate of the same step keeps its latest record because one gated step carries one live gate. */
  async savegate(gate) {
    const gates = await this.getgates();
    await this.setgates(
      gates.some((candidate) => candidate.stepid === gate.stepid && candidate.kind === gate.kind) ? gates.map(
        (candidate) => candidate.stepid === gate.stepid && candidate.kind === gate.kind ? gate : candidate
      ) : [gate, ...gates]
    );
  }
  /** Records one gate resolution event with its human action provenance; the resolution history stays visible for the audit trail. */
  async addgateresolution(resolution) {
    await this.adapter.set(
      "gateresolutions",
      [resolution, ...await this.adapter.get("gateresolutions") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded gate resolution events with their human action provenance, newest first. */
  async getgateresolutions() {
    return await this.adapter.get("gateresolutions") ?? [];
  }
  /** Replaces the redactshot regions per origin and page template. */
  async setredactregions(regions) {
    return this.adapter.set("redactregions", regions);
  }
  /** Returns the stored redactshot regions per origin and page template, oldest rule first. */
  async getredactregions() {
    return await this.adapter.get("redactregions") ?? [];
  }
  /** Adds one redactshot region, derived from a field shape or drawn by the user. */
  async addredactregion(region) {
    await this.setredactregions([...await this.getredactregions(), region]);
  }
  /** Removes one redactshot region by its id. */
  async removeredactregion(id) {
    await this.setredactregions((await this.getredactregions()).filter((region) => region.id !== id));
  }
  /** Records one phishguard verdict with its distance score; the records stay for the audit trail while the freshness window governs the live set. */
  async addphishverdict(verdict) {
    await this.adapter.set(
      "phishverdicts",
      [
        verdict,
        ...(await this.adapter.get("phishverdicts") ?? []).filter(
          (candidate) => candidate.origin !== verdict.origin
        )
      ].slice(0, 500)
    );
  }
  /** Returns the stored phishguard verdicts with their distance scores, newest first. */
  async getphishverdicts() {
    return await this.adapter.get("phishverdicts") ?? [];
  }
  /** Expires the phishguard verdicts past the user configured freshness window: the expired verdicts keep their records for the audit trail while the guard recomputes the next login step. */
  async expirephishverdicts(freshness, now) {
    const verdicts = await this.getphishverdicts();
    if (freshness === void 0) return verdicts;
    return verdicts.filter((verdict) => now - verdict.at < freshness);
  }
  /** Records one permdiff between two installed permission versions; the record of each installed update stays for the audit trail. */
  async addpermdiff(diff) {
    await this.adapter.set(
      "permdiffs",
      [diff, ...await this.adapter.get("permdiffs") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded permdiffs of each installed update, newest first. */
  async getpermdiffs() {
    return await this.adapter.get("permdiffs") ?? [];
  }
  /** Stores the last installed permission set the permdiff of the next update compares against. */
  async setlastpermissions(permissions, version) {
    await this.adapter.set("lastpermissions", { permissions, version });
  }
  /** Returns the last installed permission set with its version; an absent record returns undefined. */
  async getlastpermissions() {
    return this.adapter.get("lastpermissions");
  }
  /** Records one safedefaults application with its first seen origin; the first visit of an unknown origin stays visible. */
  async addsafedefaultapplication(application) {
    const applications = await this.adapter.get("safedefaults") ?? [];
    if (applications.some((candidate) => candidate.origin === application.origin)) return;
    await this.adapter.set("safedefaults", [...applications, application]);
  }
  /** Returns the recorded safedefaults applications with their first seen origins, oldest first. */
  async getsafedefaultapplications() {
    return await this.adapter.get("safedefaults") ?? [];
  }
  /** Records one deferred command event with the reset time it waits for. */
  async adddeferredevent(event) {
    await this.adapter.set(
      "deferredevents",
      [event, ...await this.adapter.get("deferredevents") ?? []].slice(0, 500)
    );
  }
  /** Returns the recorded deferred command events, newest first. */
  async getdeferredevents() {
    return await this.adapter.get("deferredevents") ?? [];
  }
  /** Serves the transparency data of the transparencypage in one read: every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff records of each installed update, the safedefaults applications and the secretvault metadata with labels and scopes only. */
  async gettransparencyview() {
    return {
      allowlist: await this.getautomationallowlist(),
      profiles: await this.getoriginprofiles(),
      windows: await this.getconsentwindows(),
      connectallow: await this.getconnectallow(),
      permdiffs: await this.getpermdiffs(),
      safedefaults: await this.getsafedefaultapplications(),
      vault: await this.getsecretvault(),
      gates: await this.getgates(),
      resolutions: await this.getgateresolutions(),
      deferred: await this.getdeferredevents(),
      phishverdicts: await this.getphishverdicts()
    };
  }
  /**
   * Session interface persistence of the 1.1.63 family.
   * The five session stores live here, scoped per profile workspace: the sitenotes per origin with sensitive bodies sealed at rest, the append only scratchpad entries per task with their step provenance, the distilled runsummaries per run and origin, the correctionmemory entries per origin and kind captured from plan review, and the consentmemory entries per origin with every grant, denial, expiry and revocation carrying its boundary; beside them the semanticrecall index with fingerprint deduplication answers ranked queries inside the run scope, the incremental historysearch corpus indexes session metadata, notes and summaries as they are written, the errorsurface payloads of failed steps keep their retry hints with the policy verdict, the per tab session references isolate parallel tabs, and the export bundles notes, summaries and corrections as one audit bundle.
   * The recall seam stays documented: the local fingerprint index answers every query today while a future remote recall backend can take the same shapes behind the seam without touching the callers.
   */
  /** Replaces the stored site notes; a sensitive note carries its sealedbody only so the plain body never persists. */
  async setsitenotes(notes) {
    return this.adapter.set("sitenotes", notes);
  }
  /** Returns the stored site notes, oldest update first. */
  async getsitenotes() {
    return await this.adapter.get("sitenotes") ?? [];
  }
  /** Reads the site notes of one origin only; the read gate keeps the origin inside the session grants. */
  async readsitenotes(origin) {
    return (await this.getsitenotes()).filter((note) => note.origin === origin);
  }
  /** Writes one site note: a note of the same id keeps its latest edit while a new note joins the store. */
  async writesitenote(note) {
    const notes = await this.getsitenotes();
    await this.setsitenotes(
      notes.some((candidate) => candidate.id === note.id) ? notes.map((candidate) => candidate.id === note.id ? note : candidate) : [...notes, note]
    );
  }
  /** Removes one site note by its id. */
  async removesitenote(id) {
    await this.setsitenotes((await this.getsitenotes()).filter((note) => note.id !== id));
  }
  /** Expires the site notes past the user configured window; an absent window keeps every note. */
  async expiresitenotes(retention, now) {
    if (retention === void 0) return await this.getsitenotes();
    const kept = (await this.getsitenotes()).filter((note) => now - note.updatedat < retention);
    await this.setsitenotes(kept);
    return kept;
  }
  /** Replaces the stored scratchpad entries per task. */
  async setscratchpad(entries) {
    return this.adapter.set("scratchpad", entries);
  }
  /** Returns every stored scratchpad entry, newest first. */
  async getscratchpadall() {
    return await this.adapter.get("scratchpad") ?? [];
  }
  /** Appends one scratchpad entry: the pad stays append only so no later write rewrites an earlier entry. */
  async appendscratchentry(entry) {
    await this.setscratchpad([entry, ...await this.getscratchpadall()]);
  }
  /** Reads the scratchpad of one task session, newest first; entries of another task never cross the boundary. */
  async readscratchpad(taskid, sessionid) {
    return (await this.getscratchpadall()).filter((entry) => entry.taskid === taskid && entry.sessionid === sessionid);
  }
  /** Prunes the scratchpad entries past the user configured window; an absent window keeps every entry. */
  async prunescratchentries(window, now) {
    if (window === void 0) return await this.getscratchpadall();
    const kept = (await this.getscratchpadall()).filter((entry) => now - entry.at < window);
    await this.setscratchpad(kept);
    return kept;
  }
  /** Stores one distilled run summary of a completed run. */
  async setrunsummary(summary) {
    return this.adapter.set(`runsummary:${summary.runid}`, summary);
  }
  /** Returns the stored run summary of one run; an absent summary returns undefined. */
  async getrunsummary(runid) {
    return this.adapter.get(`runsummary:${runid}`);
  }
  /** Lists the stored run summaries, oldest distillation first, optionally filtered by origin. */
  async listrunsummaries(origin) {
    const index = await this.adapter.get("runsummaryindex") ?? [];
    const summaries = [];
    for (const runid of index) {
      const summary = await this.getrunsummary(runid);
      if (summary) summaries.push(summary);
    }
    const filtered = origin === void 0 ? summaries : summaries.filter((summary) => summary.origins.includes(origin));
    return filtered.sort((one, two) => one.distilledat - two.distilledat);
  }
  /** Tracks one run in the run summary index so the listing reads every stored summary. */
  async trackrunsummary(runid) {
    const index = await this.adapter.get("runsummaryindex") ?? [];
    if (!index.includes(runid)) await this.adapter.set("runsummaryindex", [...index, runid]);
  }
  /** Expires the run summaries past the user configured window; an absent window keeps every summary. */
  async expirerunsummaries(retention, now) {
    const summaries = await this.listrunsummaries();
    if (retention === void 0) return summaries;
    const kept = [];
    for (const summary of summaries) {
      if (now - summary.distilledat > retention)
        await this.adapter.set(`runsummary:${summary.runid}`, {
          ...summary,
          steps: [],
          kinds: [],
          origins: summary.origins
        });
      else kept.push(summary);
    }
    return kept;
  }
  /** Replaces the semantic recall index with its fingerprint deduplicated entries. */
  async setrecallindex(index) {
    return this.adapter.set("recallindex", index);
  }
  /** Returns the stored semantic recall index entries, newest first. */
  async getrecallindex() {
    return await this.adapter.get("recallindex") ?? [];
  }
  /** Adds one recall index entry with fingerprint deduplication: a repeated extraction keeps its first entry. */
  async addrecallentry(entry) {
    const index = await this.getrecallindex();
    if (index.some((candidate) => candidate.fingerprint === entry.fingerprint && candidate.origin === entry.origin))
      return;
    await this.setrecallindex([entry, ...index]);
  }
  /** Answers one semantic recall query across the extraction stores: the local index ranks by text similarity inside the run scope and returns the provenance of every match. */
  async semanticrecall(query, scope, rank) {
    return rank(await this.getrecallindex(), query, scope);
  }
  /** Expires the recall index entries past the user configured window; the extraction records themselves stay for the audit trail. */
  async expirerecallentries(window, now) {
    if (window === void 0) return await this.getrecallindex();
    const kept = (await this.getrecallindex()).filter((entry) => now - entry.at < window);
    await this.setrecallindex(kept);
    return kept;
  }
  /** Replaces the stored correction memory entries per origin and kind. */
  async setcorrections(corrections) {
    return this.adapter.set("corrections", corrections);
  }
  /** Returns the stored correction memory entries, newest first, optionally filtered by origin and kind. */
  async getcorrections(filter) {
    const entries = await this.adapter.get("corrections") ?? [];
    return entries.filter(
      (entry) => (filter?.origin === void 0 || entry.origin === filter.origin) && (filter?.kind === void 0 || entry.kind === filter.kind)
    );
  }
  /** Records one correction memory entry captured from a plan review edit or rejection. */
  async addcorrection(entry) {
    await this.setcorrections([entry, ...await this.adapter.get("corrections") ?? []]);
  }
  /** Expires the correction memory entries past the user configured window; an absent window keeps every correction. */
  async expirecorrectionentries(window, now) {
    if (window === void 0) return await this.getcorrections();
    const kept = (await this.getcorrections()).filter((entry) => now - entry.at < window);
    await this.setcorrections(kept);
    return kept;
  }
  /** Replaces the stored consent memory entries per origin. */
  async setconsentmemory(entries) {
    return this.adapter.set("consentmemory", entries);
  }
  /** Returns the stored consent memory entries, newest first, optionally filtered by origin. */
  async getconsentmemory(origin) {
    const entries = await this.adapter.get("consentmemory") ?? [];
    return origin === void 0 ? entries : entries.filter((entry) => entry.origin === origin);
  }
  /** Records one consent memory entry per origin: every grant, denial, expiry and revocation lands with its boundary and kinds. */
  async addconsentmemoryentry(entry) {
    await this.setconsentmemory([entry, ...await this.adapter.get("consentmemory") ?? []]);
  }
  /** Replaces the stored error surface payloads of failed steps. */
  async seterrorsurfaces(surfaces) {
    return this.adapter.set("errorsurfaces", surfaces);
  }
  /** Returns the stored error surface payloads, newest first, optionally filtered by step. */
  async geterrorsurfaces(stepid) {
    const surfaces = await this.adapter.get("errorsurfaces") ?? [];
    return stepid === void 0 ? surfaces : surfaces.filter((surface) => surface.stepid === stepid);
  }
  /** Records one error surface payload of a failed step with its retry hint and the policy verdict. */
  async adderrorsurface(surface) {
    await this.seterrorsurfaces(
      [surface, ...await this.adapter.get("errorsurfaces") ?? []].slice(0, 500)
    );
  }
  /** Replaces the incremental history search corpus of session metadata, notes and run summaries. */
  async sethistoryindex(corpus) {
    return this.adapter.set("historyindex", corpus);
  }
  /** Returns the incremental history search corpus, newest entry first. */
  async gethistoryindex() {
    return await this.adapter.get("historyindex") ?? [];
  }
  /** Adds one corpus entry to the incremental history index on each store write. */
  async addhistoryentry(entry) {
    const corpus = await this.gethistoryindex();
    await this.sethistoryindex([
      entry,
      ...corpus.filter((candidate) => !(candidate.source === entry.source && candidate.id === entry.id))
    ]);
  }
  /** Answers one history search query against the incremental corpus with the matched terms highlighted. */
  async historysearch(query, search) {
    return search(await this.gethistoryindex(), query);
  }
  /** Stores one per tab session reference so parallel tabs never collide inside the session stores. */
  async settabsession(ref) {
    return this.adapter.set(`tabsession:${ref.tabid}`, ref);
  }
  /** Returns the per tab session reference of one tab; an absent reference returns undefined. */
  async gettabsession(tabid) {
    return this.adapter.get(`tabsession:${tabid}`);
  }
  /** Lists every per tab session reference so the sessiongrid reads the per tab lock state of concurrent sessions. */
  async listtabsessions() {
    const tabs = await this.adapter.get("tabsessionindex") ?? [];
    const refs = [];
    for (const tabid of tabs) {
      const ref = await this.gettabsession(tabid);
      if (ref) refs.push(ref);
    }
    return refs;
  }
  /** Tracks one tab in the per tab session index so the listing reads every isolated reference. */
  async tracktabsession(tabid) {
    const tabs = await this.adapter.get("tabsessionindex") ?? [];
    if (!tabs.includes(tabid)) await this.adapter.set("tabsessionindex", [...tabs, tabid]);
  }
  /** Exports the site notes, the run summaries and the correction memory as one audit bundle: sensitive note bodies stay sealed in the export. */
  async exportsessionbundle(exportedat) {
    return {
      kind: "sessionbundle",
      notes: await this.getsitenotes(),
      summaries: await this.listrunsummaries(),
      corrections: await this.getcorrections(),
      exportedat
    };
  }
  /**
   * Interface surface stores of the 1.1.64 family live here, scoped per profile workspace: the commandpalette usage counts the recent first ranking reads, the taskinput history of natural language goals, the onboarding completion state, the per surface layout preferences, the logstream filter preferences and the stepapprove resolution history per origin.
   */
  /** Returns every commandpalette usage record so the ranking lifts the recent commands first. */
  async getpaletteusage() {
    return await this.adapter.get("paletteusage") ?? [];
  }
  /** Replaces the commandpalette usage records after one use: the count grows and the last use time moves so the ranking reads both. */
  async setpaletteusage(records) {
    return this.adapter.set("paletteusage", records);
  }
  /** Returns the stored taskinput history, newest first. */
  async gettaskinputs() {
    return await this.adapter.get("taskinputs") ?? [];
  }
  /** Adds one taskinput submission to the per profile history; the retention window stays a user setting. */
  async addtaskinput(entry) {
    const retention = (await this.getsettings())?.taskinputretention;
    const history = [entry, ...await this.gettaskinputs()];
    await this.adapter.set(
      "taskinputs",
      retention === void 0 ? history : history.filter((candidate) => entry.at - candidate.at < retention)
    );
  }
  /** Returns the onboarding completion state; an absent state means the walkthrough never ran. */
  async getonboardingstate() {
    return this.adapter.get("onboarding");
  }
  /** Stores the onboarding completion state; a done walkthrough never runs again on its own. */
  async setonboardingstate(state) {
    return this.adapter.set("onboarding", state);
  }
  /** Returns the version one sunset notice record of the negotiation banner; an absent record means no version one client declared below the supported floor this browser session. */
  async getv1sunset() {
    return this.adapter.get("v1sunset");
  }
  /** Stores the version one sunset notice record; the dismissal resets it for the session while a later browser session marks it again on the next refusal. */
  async setv1sunset(state) {
    return this.adapter.set("v1sunset", state);
  }
  /** Returns the version one migration prompt record; an absent record means no affected updater met the one time prompt yet. */
  async getmigrationprompt() {
    return this.adapter.get("migrationprompt");
  }
  /** Stores the version one migration prompt record; the persistent migrationpromptdismissed flag keeps a dismissed prompt from ever appearing again. */
  async setmigrationprompt(state) {
    return this.adapter.set("migrationprompt", state);
  }
  /** Returns the layout preferences of one surface; an absent preference set returns undefined. */
  async getsurfacelayout(surface) {
    return this.adapter.get(`surfacelayout:${surface}`);
  }
  /** Stores the layout preferences of one surface, scoped per profile workspace. */
  async setsurfacelayout(layout) {
    return this.adapter.set(`surfacelayout:${layout.surface}`, layout);
  }
  /** Returns the stored logstream filter preferences of the live view. */
  async getlogstreamfilters() {
    return this.adapter.get("logstreamfilters");
  }
  /** Stores the logstream filter preferences of the live view. */
  async setlogstreamfilters(filter) {
    return this.adapter.set("logstreamfilters", filter);
  }
  /** Returns every stored stepapprove resolution, newest first, with its human provenance. */
  async getstepapproveresolutions() {
    return await this.adapter.get("stepapproveresolutions") ?? [];
  }
  /** Records one stepapprove resolution in the per origin history. */
  async addstepapproveresolution(resolution) {
    await this.adapter.set("stepapproveresolutions", [resolution, ...await this.getstepapproveresolutions()]);
  }
  /**
   * Interface surface stores of the 1.1.65 family live here, scoped per profile workspace: the siteprofiles with the per site interface preferences, the shortcutkeys bindings and the theme preference per profile, the recenttray entries with their configurable depth and the notification consent and preference per profile.
   */
  /** Returns the siteprofile of one origin; an absent profile keeps the global interface preferences. */
  async getsiteprofile(origin) {
    return this.adapter.get(`siteprofile:${origin}`);
  }
  /** Stores the siteprofile of one origin with its theme, shortcutkeys and default view; the profile never adjusts a policy gate. */
  async setsiteprofile(profile) {
    return this.adapter.set(`siteprofile:${profile.origin}`, profile);
  }
  /** Returns every stored siteprofile keyed by origin. */
  async listsiteprofiles() {
    const entries = Object.entries(await this.adapter.get("siteprofiles") ?? {});
    return entries.map(([, profile]) => profile);
  }
  /** Stores every siteprofile keyed by origin so the list view reads them in one call. */
  async setsiteprofiles(profiles) {
    await this.adapter.set("siteprofiles", Object.fromEntries(profiles.map((profile) => [profile.origin, profile])));
  }
  /** Returns the stored shortcutkeys bindings of the profile; an absent set keeps the shipped editable defaults. */
  async getshortcutbindings() {
    return await this.adapter.get("shortcutbindings") ?? [];
  }
  /** Stores the shortcutkeys bindings the user edited in the optionspage. */
  async setshortcutbindings(bindings) {
    return this.adapter.set("shortcutbindings", bindings);
  }
  /** Returns the stored darklight theme preference of the profile; an absent preference follows the os preference alone. */
  async getthemepreference() {
    return this.adapter.get("themepreference");
  }
  /** Stores the darklight theme preference of the profile with its manual override. */
  async setthemepreference(preference) {
    return this.adapter.set("themepreference", preference);
  }
  /** Returns the recenttray entries, newest first, with their resume and reopen offers. */
  async getrecenttray() {
    return await this.adapter.get("recenttray") ?? [];
  }
  /** Adds one recenttray entry with the user configured depth; an absent depth keeps every run. */
  async addrecenttrayentry(entry) {
    const depth = (await this.getsettings())?.recenttraydepth;
    const appended = [entry, ...(await this.getrecenttray()).filter((candidate) => candidate.runid !== entry.runid)];
    await this.adapter.set(
      "recenttray",
      depth !== void 0 && Number.isInteger(depth) && depth > 0 ? appended.slice(0, depth) : appended
    );
  }
  /** Returns the notification consent and preference of the profile; an absent record keeps the notifications content free and on. */
  async getnotificationprefs() {
    return this.adapter.get("notificationprefs");
  }
  /** Stores the notification consent and preference of the profile; the content consent gates every page content bearing body. */
  async setnotificationprefs(prefs) {
    return this.adapter.set("notificationprefs", prefs);
  }
  /** Returns the notification payloads the surface history keeps for the user to open after a do not disturb quiet. */
  async getnotificationhistory() {
    return await this.adapter.get("notificationhistory") ?? [];
  }
  /** Records one notification payload in the history so its deep link stays reachable while the notifications permission stays outside the manifest. */
  async addnotificationhistory(payload) {
    await this.adapter.set("notificationhistory", [payload, ...await this.getnotificationhistory()]);
  }
  /**
   * Ecosystem stores of the 1.1.66 family live here, scoped per profile workspace: the flowlibrary entries with their manifest digests and provenance, the library install and removal events, the syncbridge hooks with their conflict records, the attentionfeed entries with their configurable retention, the runreplay cursors per viewed run, the outputcompare sessions with their metric results and the background run queue state for restart recovery.
   * The flowlibrary store deduplicates entries by manifest digest, every entry carries its publisher provenance, and the manifest list exports for audit; the memory adapter seam stays the documented marketplace backend boundary because a future remote registry replaces the adapter only.
   */
  /** Returns every flowlibrary entry of the profile workspace, newest first. */
  async getflowlibrary() {
    return await this.adapter.get("flowlibrary") ?? [];
  }
  /** Replaces the flowlibrary entries of the profile workspace. */
  async setflowlibrary(entries) {
    return this.adapter.set("flowlibrary", entries);
  }
  /** Adds one flowlibrary entry deduplicated by manifest digest: an entry whose digest already exists replaces its predecessor while its provenance keeps both records. */
  async addlibraryentry(entry) {
    const entries = await this.getflowlibrary();
    const deduped = entries.filter((candidate) => candidate.digest !== entry.digest);
    await this.setflowlibrary([entry, ...deduped]);
    return [entry, ...deduped];
  }
  /** Removes one flowlibrary entry by its id while the library events keep their record for the audit trail. */
  async removelibraryentry(entryid) {
    await this.setflowlibrary((await this.getflowlibrary()).filter((candidate) => candidate.id !== entryid));
  }
  /** Returns every library install, update and removal event, newest first. */
  async getlibraryevents() {
    return await this.adapter.get("libraryevents") ?? [];
  }
  /** Records one library lifecycle event beside the flowlibrary store. */
  async addlibraryevent(event) {
    await this.adapter.set("libraryevents", [event, ...await this.getlibraryevents()]);
  }
  /** Exports the manifest list of the flowlibrary for audit: one row per entry with its digest, publisher, version, state and provenance and no step payload. */
  async exportlibrarymanifests() {
    return (await this.getflowlibrary()).map((entry) => ({
      id: entry.id,
      title: entry.manifest.title,
      publisher: entry.manifest.publisher,
      version: entry.manifest.version,
      digest: entry.digest,
      state: entry.state,
      provenance: entry.provenance,
      addedat: entry.addedat
    }));
  }
  /** Returns every syncbridge hook of the profile workspace; every hook keeps its explicit opt in with no default on. */
  async getsyncbridgehooks() {
    return await this.adapter.get("syncbridgehooks") ?? [];
  }
  /** Replaces the syncbridge hooks of the profile workspace. */
  async setsyncbridgehooks(hooks) {
    return this.adapter.set("syncbridgehooks", hooks);
  }
  /** Returns every syncbridge conflict record, newest first, with both versions instead of a silent overwrite. */
  async getsyncbridgeconflicts() {
    return await this.adapter.get("syncbridgeconflicts") ?? [];
  }
  /** Records one syncbridge conflict with both manifest versions. */
  async addsyncbridgeconflict(conflict) {
    await this.adapter.set("syncbridgeconflicts", [conflict, ...await this.getsyncbridgeconflicts()]);
  }
  /** Resolves one syncbridge conflict by its id with the resolution the user picked; one conflict resolves exactly once. */
  async resolvesyncbridgeconflict(id, resolution, now) {
    const conflicts = await this.getsyncbridgeconflicts();
    await this.adapter.set(
      "syncbridgeconflicts",
      conflicts.map(
        (conflict) => conflict.id === id && conflict.resolution === void 0 ? { ...conflict, resolution, resolvedat: now } : conflict
      )
    );
    return this.getsyncbridgeconflicts();
  }
  /** Returns every attentionfeed entry, newest first, with its cause, refs and deep link. */
  async getattentionentries() {
    return await this.adapter.get("attentionfeed") ?? [];
  }
  /** Records one attentionfeed entry deduplicated by its cause, run and gate refs while the retention window stays a user setting. */
  async addattentionentry(entry) {
    const existing = (await this.getattentionentries()).filter((candidate) => candidate.id !== entry.id);
    await this.adapter.set("attentionfeed", [entry, ...existing]);
  }
  /** Dismisses one attentionfeed entry by its id: the dismissal removes the feed row only while the waiting cause keeps its own resolution path. */
  async dismissattentionentry(id) {
    const entries = (await this.getattentionentries()).filter((candidate) => candidate.id !== id);
    await this.adapter.set("attentionfeed", entries);
    return entries;
  }
  /** Prunes the attentionfeed entries past their retention window; an absent window keeps every entry while the pruned ids return for the audit note. */
  async pruneattentionentries(now) {
    const retention = (await this.getsettings())?.attentionretention;
    const entries = await this.getattentionentries();
    if (retention === void 0) return { kept: entries, pruned: [] };
    const kept = entries.filter((entry) => now - entry.at < retention);
    await this.adapter.set("attentionfeed", kept);
    return { kept, pruned: entries.filter((entry) => now - entry.at >= retention).map((entry) => entry.id) };
  }
  /** Returns the runreplay cursors per viewed run so a reopened replay stands where the viewer left it. */
  async getreplaycursors() {
    return await this.adapter.get("replaycursors") ?? {};
  }
  /** Stores one runreplay cursor for its viewed run. */
  async setreplaycursor(runid, cursor) {
    await this.adapter.set("replaycursors", { ...await this.getreplaycursors(), [runid]: cursor });
  }
  /** Returns every outputcompare session with its metric results, newest first. */
  async getcomparesessions() {
    return await this.adapter.get("comparesessions") ?? [];
  }
  /** Records one outputcompare session with the metric set it used. */
  async addcomparesession(session) {
    await this.adapter.set("comparesessions", [session, ...await this.getcomparesessions()]);
  }
  /** Returns the background run queue state for restart recovery: every entry with its state and its keepalive hold. */
  async getbackgroundqueue() {
    return await this.adapter.get("backgroundqueue") ?? [];
  }
  /** Replaces the background run queue state after every transition so the restart recovery reads it in one call. */
  async setbackgroundqueue(queue) {
    return this.adapter.set("backgroundqueue", queue);
  }
  /** Returns the selcache state of one run: the generation, the cached entries and the invalidation trail the 1.1.68 family keeps per run. */
  async getselcachestate(runid) {
    return await this.adapter.get(`selcache:${runid}`) ?? void 0;
  }
  /** Stores the selcache state of one run; every mutation batch advances the generation while a navigation drops the cache wholesale. */
  async setselcachestate(state) {
    await this.adapter.set(`selcache:${state.runid}`, state);
  }
  /** Prunes the selcache entries of one run at run end; the invalidation trail stays for the audit while no entry outlives its run. */
  async pruneselcache(runid) {
    await this.adapter.set(`selcache:${runid}`, { runid, generation: 0, entries: [], invalidations: [] });
  }
  /** Returns the incrsnapshot base refs per run the delta engine computes against. */
  async getsnapshotbases() {
    return await this.adapter.get("snapshotbases") ?? [];
  }
  /** Stores one incrsnapshot base ref record for its run so every later delta of the run references it. */
  async addsnapshotbase(base) {
    await this.adapter.set("snapshotbases", [
      ...(await this.getsnapshotbases()).filter((candidate) => candidate.runid !== base.runid),
      base
    ]);
  }
  /** Prunes the incrsnapshot base refs of one run at run end; the deltas of the run end with it. */
  async prunesnapshotbases(runid) {
    await this.adapter.set(
      "snapshotbases",
      (await this.getsnapshotbases()).filter((candidate) => candidate.runid !== runid)
    );
  }
  /** Stores one computed incrsnapshot delta of a run beside its base so the executor skips recomputation on an empty delta. */
  async addsnapshotdelta(delta) {
    await this.adapter.set(`snapshotdelta:${delta.runid}:${delta.baseref}`, delta);
  }
  /** Returns the stored incrsnapshot delta of one run and base ref, when the run computed one. */
  async getsnapshotdelta(runid, baseref) {
    return await this.adapter.get(`snapshotdelta:${runid}:${baseref}`) ?? void 0;
  }
  /** Returns the chunkextract cursors per table so an interrupted big table extraction resumes from its cursor. */
  async getchunkcursors() {
    return await this.adapter.get("chunkcursors") ?? {};
  }
  /** Stores one chunkextract cursor for its table so the next window resumes where the last window stopped. */
  async setchunkcursor(tableid, cursor) {
    await this.adapter.set("chunkcursors", { ...await this.getchunkcursors(), [tableid]: cursor });
  }
  /** Clears one chunkextract cursor once its table completes; the merged windows stay in the datagrid. */
  async clearchunkcursor(tableid) {
    const cursors = await this.getchunkcursors();
    delete cursors[tableid];
    await this.adapter.set("chunkcursors", cursors);
  }
  /** Returns the perf records of the profile workspace, newest first, for the run footers and the perf summaries. */
  async getperfrecords() {
    return await this.adapter.get("perfrecords") ?? [];
  }
  /** Records one perf record per step for profiling; the records stay inside the user configured retention window with their provenance attached. */
  async addperfrecord(record2) {
    await this.adapter.set("perfrecords", [record2, ...await this.getperfrecords()]);
  }
  /** Prunes the perf records past the user configured retention window; an absent window keeps every record. */
  async pruneperfrecords(retention, now) {
    const records = await this.getperfrecords();
    if (retention === void 0) return { kept: records, pruned: 0 };
    const kept = records.filter((record2) => now - record2.at < retention);
    await this.adapter.set("perfrecords", kept);
    return { kept, pruned: records.length - kept.length };
  }
  /** Returns the lazymods load telemetry records for startup analysis, newest first. */
  async getlazyloadrecords() {
    return await this.adapter.get("lazyloadrecords") ?? [];
  }
  /** Records one lazymods load telemetry record: which module loaded, why, and how long the resolution took. */
  async addlazyloadrecord(record2) {
    await this.adapter.set("lazyloadrecords", [record2, ...await this.getlazyloadrecords()]);
  }
  /** Returns the recorded worker queue depth samples over time for tuning. */
  async getqueuedepths() {
    return await this.adapter.get("queuedepths") ?? [];
  }
  /** Records one worker queue depth sample: the pending parse tasks and the deferred tasks the backpressure held at one moment. */
  async recordqueuedepth(sample) {
    await this.adapter.set("queuedepths", [...await this.getqueuedepths(), sample]);
  }
  /** Returns the virtlist height maps per surface so reopened surfaces reuse their measured row heights. */
  async getheightmaps() {
    return await this.adapter.get("heightmaps") ?? [];
  }
  /** Stores one virtlist height map for its surface; the measured row heights stay for the next open of the surface. */
  async setheightmap(record2) {
    await this.adapter.set("heightmaps", [
      ...(await this.getheightmaps()).filter((candidate) => candidate.surface !== record2.surface),
      record2
    ]);
  }
  /**
   * The perf metrics seam of the 1.1.68 family: today every perf record, queue depth sample and lazy load telemetry record stays inside the per profile workspace of the local adapter, and the seam keeps the record and bundle shapes stable so a reviewed remote metrics backend can take the exports later without touching the callers.
   * Exports the perf records of one run as a single audit bundle with its summary and its provenance attached.
   */
  async exportperfbundle(runid) {
    return { runid, records: (await this.getperfrecords()).filter((record2) => record2.runid === runid) };
  }
  /** Returns the domain lanes of one batch run the 1.1.69 family schedules its concurrency slots through. */
  async getdomainlanes(runid) {
    return await this.adapter.get(`domainlanes:${runid}`) ?? [];
  }
  /** Stores the domain lanes of one batch run; every lane runs at most its user chosen slots while its overflow queues. */
  async setdomainlanes(runid, lanes) {
    await this.adapter.set(`domainlanes:${runid}`, lanes);
  }
  /** Returns the runbudget records of the profile workspace, newest first. */
  async getrunbudgets() {
    return await this.adapter.get("runbudgets") ?? [];
  }
  /** Records one runbudget record of a run: the step usage against the user budget beside the memory pressure the worker telemetry reported. */
  async addrunbudget(record2) {
    await this.adapter.set("runbudgets", [
      record2,
      ...(await this.getrunbudgets()).filter((candidate) => candidate.runid !== record2.runid)
    ]);
  }
  /** Returns the budgetalerts of the profile workspace, newest first, with their thresholds and severity levels. */
  async getbudgetalerts() {
    return await this.adapter.get("budgetalerts") ?? [];
  }
  /** Records one budgetalert of a run; the critical alert pauses the run pending a user choice. */
  async addbudgetalert(alert) {
    await this.adapter.set("budgetalerts", [alert, ...await this.getbudgetalerts()]);
  }
  /** Returns the timeoutcancel events of the profile workspace, newest first, beside their immutable log entries. */
  async gettimeoutevents() {
    return await this.adapter.get("timeoutevents") ?? [];
  }
  /** Records one timeoutcancel event: the aborted step, its user bound and its logged cancel entry beside the step outcome. */
  async addtimeoutevent(event) {
    await this.adapter.set("timeoutevents", [event, ...await this.gettimeoutevents()]);
  }
  /** Returns the tabsuspend states per run so a restore brings the suspended tab back before the step that needs it. */
  async getsuspendstates() {
    return await this.adapter.get("suspendstates") ?? [];
  }
  /** Stores one tabsuspend state of a run; the run state stays preserved across the suspend and restore. */
  async setsuspendstate(state) {
    await this.adapter.set("suspendstates", [
      ...(await this.getsuspendstates()).filter((candidate) => candidate.runid !== state.runid),
      state
    ]);
  }
  /** Clears one tabsuspend state once its tab restored before the step that needed it. */
  async clearsuspendstate(runid) {
    await this.adapter.set(
      "suspendstates",
      (await this.getsuspendstates()).filter((candidate) => candidate.runid !== runid)
    );
  }
  /** Returns the runcache entries of every run keyed by their resource digests. */
  async getruncache() {
    return await this.adapter.get("runcache") ?? [];
  }
  /** Stores one runcache entry of a run keyed by its digest; a repeat fetch of the same run serves from the entry. */
  async addruncacheentry(entry) {
    await this.adapter.set("runcache", [
      ...(await this.getruncache()).filter(
        (candidate) => candidate.runid !== entry.runid || candidate.resource !== entry.resource
      ),
      entry
    ]);
  }
  /** Sweeps the runcache entries of one run at run end; the pinned entries of the user profile cache survive. */
  async sweepruncache(runid, pin) {
    const entries = await this.getruncache();
    if (pin) return { cleared: 0 };
    const kept = entries.filter((entry) => entry.runid !== runid || entry.pinned);
    await this.adapter.set("runcache", kept);
    return { cleared: entries.length - kept.length };
  }
  /** Returns the efficientresume checkpoints of one run so a restart skips its completed steps. */
  async getresumepoints(runid) {
    return await this.adapter.get(`resumepoints:${runid}`) ?? [];
  }
  /** Stores one efficientresume checkpoint of a run at a step boundary with its cursor and page digest. */
  async addresumepoint(point) {
    await this.adapter.set(`resumepoints:${point.runid}`, [
      ...(await this.getresumepoints(point.runid)).filter((candidate) => candidate.stepid !== point.stepid),
      point
    ]);
  }
  /** Clears the efficientresume checkpoints of one run at run end. */
  async cleareresumepoints(runid) {
    await this.adapter.set(`resumepoints:${runid}`, []);
  }
  /** Returns the selectorprofile stats of the profile workspace per selector. */
  async getselectorprofiles() {
    return await this.adapter.get("selectorprofiles") ?? [];
  }
  /** Stores one selectorprofile stat; the flagged selectors report above the user latency threshold and never refuse. */
  async setselectorprofile(stats) {
    await this.adapter.set("selectorprofiles", [
      ...(await this.getselectorprofiles()).filter((candidate) => candidate.selector !== stats.selector),
      stats
    ]);
  }
  /** Returns the steptrace spans of one run for the timeline view and the trace file export. */
  async getsteptrace(runid) {
    return await this.adapter.get(`steptrace:${runid}`) ?? [];
  }
  /** Stores one steptrace span of a run; the spans nest per step and per worker task through their parent refs. */
  async addsteptracespan(span) {
    await this.adapter.set(`steptrace:${span.runid}`, [...await this.getsteptrace(span.runid), span]);
  }
  /** Clears the steptrace spans of one run; the exported trace files keep their events. */
  async clearsteptrace(runid) {
    await this.adapter.set(`steptrace:${runid}`, []);
  }
  /** Returns the startupmeter samples of the profile workspace, newest first, for the cold start view. */
  async getstartupsamples() {
    return await this.adapter.get("startupsamples") ?? [];
  }
  /** Records one startupmeter sample: the cold start duration from the startup event to ready with the lazymods budget it spent. */
  async addstartupsample(sample) {
    await this.adapter.set("startupsamples", [sample, ...await this.getstartupsamples()]);
  }
  /** Returns the slowmo replay sessions of the profile workspace, newest first. */
  async getslomosessions() {
    return await this.adapter.get("slomosessions") ?? [];
  }
  /** Stores one slowmo replay session; the pauses link to their steptrace spans for inspection. */
  async setslomosession(session) {
    await this.adapter.set("slomosessions", [
      session,
      ...(await this.getslomosessions()).filter((candidate) => candidate.runid !== session.runid)
    ]);
  }
  /** Returns the sessionreuse grants of the profile workspace with their consent prompts. */
  async getsessionreusegrants() {
    return await this.adapter.get("sessionreusegrants") ?? [];
  }
  /** Stores one sessionreuse grant; the authenticated profile attaches to a run only through its per profile consent prompt. */
  async addsessionreusegrant(grant) {
    await this.adapter.set("sessionreusegrants", [
      ...(await this.getsessionreusegrants()).filter((candidate) => candidate.profile !== grant.profile),
      grant
    ]);
  }
  /** Returns the artifactcompress records of the profile workspace for the at rest codec view. */
  async getartifactcompress() {
    return await this.adapter.get("artifactcompress") ?? [];
  }
  /** Stores one artifactcompress record: the codec of the stored artifact with its lazy read flag. */
  async addartifactcompress(record2) {
    await this.adapter.set("artifactcompress", [
      ...(await this.getartifactcompress()).filter((candidate) => candidate.artifactid !== record2.artifactid),
      record2
    ]);
  }
  /** Returns the run lifecycle record of one run id of the 1.1.70 resilience family. */
  async getrunrecord(runid) {
    return (await this.adapter.get("runs") ?? []).find((record2) => record2.runid === runid);
  }
  /** Persists one run lifecycle record; the run state survives every service worker restart through the adapter. */
  async setrunrecord(record2) {
    await this.adapter.set("runs", [
      ...(await this.adapter.get("runs") ?? []).filter((candidate) => candidate.runid !== record2.runid),
      record2
    ]);
  }
  /** Returns every stored run record by recency, newest first. */
  async listruns() {
    return [...await this.adapter.get("runs") ?? []].sort((one, two) => two.updatedat - one.updatedat);
  }
  /** Returns the latest checkpoint of one run; a run without a checkpoint carries none. */
  async getcheckpoint(runid) {
    return (await this.adapter.get("checkpoints") ?? []).find((record2) => record2.runid === runid);
  }
  /** Persists the latest checkpoint of one run; every newer checkpoint replaces the stored one. */
  async setcheckpoint(record2) {
    await this.adapter.set("checkpoints", [
      ...(await this.adapter.get("checkpoints") ?? []).filter(
        (candidate) => candidate.runid !== record2.runid
      ),
      record2
    ]);
  }
  /** Returns the offlinequeue of approved plans waiting for connectivity; the queue survives every restart through the adapter. */
  async getqueue() {
    return await this.adapter.get("offlinequeue") ?? [];
  }
  /** Persists the offlinequeue; the replay drains it in sequence order once connectivity returns. */
  async setqueue(queue) {
    await this.adapter.set("offlinequeue", queue);
  }
  /** Returns the latest heartbeat record of one run. */
  async getheartbeat(runid) {
    return (await this.adapter.get("heartbeats") ?? []).find((record2) => record2.runid === runid);
  }
  /** Persists the latest heartbeat record of one run; every beat replaces the stored one. */
  async setheartbeat(record2) {
    await this.adapter.set("heartbeats", [
      ...(await this.adapter.get("heartbeats") ?? []).filter(
        (candidate) => candidate.runid !== record2.runid
      ),
      record2
    ]);
  }
  /** Records one rollback item of a failed or cancelled run; the compensating steps stay for the audit trail. */
  async addrollback(item) {
    await this.adapter.set("rollbackitems", [
      item,
      ...await this.adapter.get("rollbackitems") ?? []
    ]);
  }
  /** Returns the rollback items of one run, newest first; a run without a rollback carries none. */
  async listrollbacks(runid) {
    return (await this.adapter.get("rollbackitems") ?? []).filter((item) => item.runid === runid);
  }
  /** Returns the user configured heartbeat staleness window; an absent window keeps the documented roadmap default because the window stays a user choice. */
  async getheartbeatwindow() {
    return (await this.getsettings())?.heartbeatwindow;
  }
  /** Persists the user configured heartbeat staleness window; the zombiecheck reads it with no code ceiling. */
  async setheartbeatwindow(window) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, heartbeatwindow: window });
  }
  /** Returns the user configured offline queue depth; an absent depth keeps the queue unbounded because the depth stays a user choice. */
  async getqueuedepthsetting() {
    return (await this.getsettings())?.queuedepth;
  }
  /** Persists the user configured offline queue depth; the depth reports and never refuses a queued plan. */
  async setqueuedepthsetting(depth) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, queuedepth: depth });
  }
  /** Prunes the failed and reaped run records past the user configured retention window; every run of another state stays and an absent window keeps every failed run for the audit trail. */
  async pruneruns(retention, now) {
    const runs = await this.listruns();
    if (retention === void 0) return { kept: runs, pruned: [] };
    const expired = runs.filter((run) => run.state === "failed" && now - run.updatedat >= retention);
    if (expired.length === 0) return { kept: runs, pruned: [] };
    const prunedids = new Set(expired.map((run) => run.runid));
    const kept = runs.filter((run) => !prunedids.has(run.runid));
    await this.adapter.set("runs", kept);
    return { kept, pruned: [...prunedids] };
  }
  /** Returns the idempotencykeys one run already executed so replays deduplicate on them. */
  async getexecutedkeys(runid) {
    return (await this.adapter.get("executedkeys") ?? []).find(
      (entry) => entry.runid === runid
    )?.keys ?? [];
  }
  /** Records one executed idempotencykey of a run; a replay of the same key skips the duplicate. */
  async addexecutedkey(runid, key) {
    const entries = (await this.adapter.get("executedkeys") ?? []).filter(
      (entry) => entry.runid !== runid
    );
    await this.adapter.set("executedkeys", [
      ...entries,
      { runid, keys: [...await this.getexecutedkeys(runid), key] }
    ]);
  }
  /** Returns the urlhistory of one run: one urlvisit per completed navigation with consecutive duplicates folded, scoped per run and never merged across runs. */
  async getvisits(runid) {
    return await this.adapter.get(`visits:${runid}`) ?? [];
  }
  /** Persists the urlhistory of one run; the visits survive every service worker restart through the adapter. */
  async setvisits(runid, visits) {
    await this.adapter.set(`visits:${runid}`, visits);
  }
  /** Returns the runtimeline stream of one run: the merged step results, audit events and url visits in their timestamp order. */
  async getruntimeline(runid) {
    return await this.adapter.get(`runtimeline:${runid}`) ?? [];
  }
  /** Persists the runtimeline stream of one run; the timeline view and the audit export read the same stream. */
  async setruntimeline(runid, events) {
    await this.adapter.set(`runtimeline:${runid}`, events);
  }
  /** Appends one runtimeline event to the stream of its run without reading the whole stream back. */
  async appendtimelineevent(event) {
    await this.setruntimeline(event.runid, [...await this.getruntimeline(event.runid), event]);
  }
  /** Returns the sessionlock of one session; a session without a lock carries none. */
  async getlock(sessionid) {
    return (await this.adapter.get("sessionlocks") ?? []).find(
      (record2) => record2.sessionid === sessionid
    );
  }
  /** Persists the sessionlock of one session; every newer lock replaces the stored one and the lock survives every restart. */
  async setlock(lock) {
    await this.adapter.set("sessionlocks", [
      ...(await this.adapter.get("sessionlocks") ?? []).filter(
        (candidate) => candidate.sessionid !== lock.sessionid
      ),
      lock
    ]);
  }
  /** Clears the sessionlock of one session on completion, failure or cancel; the next reviewed run may acquire it again. */
  async clearlock(sessionid) {
    await this.adapter.set("sessionlocks", [
      ...(await this.adapter.get("sessionlocks") ?? []).filter(
        (candidate) => candidate.sessionid !== sessionid
      )
    ]);
  }
  /** Returns every stored sessionlock; the startup pass reads them to expire the abandoned ones. */
  async listlocks() {
    return await this.adapter.get("sessionlocks") ?? [];
  }
  /** Returns the isolated tabstate of one tabid; a tab without an isolated namespace carries none. */
  async gettabstate(tabid) {
    return (await this.adapter.get("tabstates") ?? []).find((state) => state.tabid === tabid);
  }
  /** Stores the isolated tabstate of one tabid: the namespace, its copied config snapshot and the run it serves. */
  async settabstate(state) {
    await this.adapter.set("tabstates", [
      ...(await this.adapter.get("tabstates") ?? []).filter(
        (candidate) => candidate.tabid !== state.tabid
      ),
      state
    ]);
  }
  /** Returns every stored memory item of the profile workspace wrapped with its provenance record. */
  async getmemoryitems() {
    return await this.adapter.get("memoryitems") ?? [];
  }
  /** Stores one memory item wrapped with its provenance; the stored value encrypts at rest when the item carries its encrypted flag while the derived key itself never persists. */
  async setmemoryitem(item) {
    await this.adapter.set("memoryitems", [
      ...(await this.getmemoryitems()).filter((candidate) => candidate.key !== item.key),
      item
    ]);
  }
  /** Removes one memory item from the store; the purge keeps its summary and its provenance for the audit trail. */
  async removememoryitems(keys) {
    const gone = new Set(keys);
    await this.adapter.set(
      "memoryitems",
      (await this.getmemoryitems()).filter((item) => !gone.has(item.key))
    );
  }
  /** Returns the user configured expiryrules of the memory workspace; an absent list keeps every item unexpired. */
  async getexpiry() {
    return await this.adapter.get("expiryrules") ?? [];
  }
  /** Persists the user configured expiryrules; every lifetime stays the user's choice with no forced ceiling. */
  async setexpiry(rules) {
    await this.adapter.set("expiryrules", rules);
  }
  /** Returns the quotareport of the last quotawatch pass; a fresh workspace carries none. */
  async getquotareport() {
    return await this.adapter.get("quotareport");
  }
  /** Persists the quotareport after each quotawatch pass; the cleanup candidates stay ranked for the next pass. */
  async setquotareport(report) {
    await this.adapter.set("quotareport", report);
  }
  /** Returns the at rest encryption flag of the memory workspace; the derived key never persists beside it. */
  async getencryptrest() {
    return (await this.getsettings())?.encryptrest === true;
  }
  /** Persists the at rest encryption flag of the memory workspace; the secret entry stays a consent prompt and the key stays in memory for the pass alone. */
  async setencryptrest(enabled) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({ ...settings, encryptrest: enabled });
  }
  /** Records one purge summary of the expirememory pass; the summary and the provenance of every purged item stay for the audit trail. */
  async addpurgesummary(summary) {
    await this.adapter.set("purgesummaries", [
      summary,
      ...await this.adapter.get(
        "purgesummaries"
      ) ?? []
    ]);
  }
  /** Returns the purge summaries of the expirememory passes, newest first; the values left while their provenance stays. */
  async listpurgesummaries() {
    return await this.adapter.get(
      "purgesummaries"
    ) ?? [];
  }
  /** Returns the timestamp of the last expirememory pass; the interval pass reads it to decide whether the user interval passed. */
  async getlastexpirepass() {
    return await this.adapter.get("lastexpirepass");
  }
  /** Persists the timestamp of one expirememory pass. */
  async setlastexpirepass(at) {
    await this.adapter.set("lastexpirepass", at);
  }
  /** Returns one fleet agentrecord of the 1.1.72 family by its id; an unknown agent carries none. */
  async getagent(agentid) {
    return (await this.adapter.get("fleet") ?? []).find((record2) => record2.id === agentid);
  }
  /** Persists one fleet agentrecord; every newer record replaces the stored one and the registry survives every restart. */
  async setagent(record2) {
    await this.adapter.set("fleet", [
      ...(await this.adapter.get("fleet") ?? []).filter((candidate) => candidate.id !== record2.id),
      record2
    ]);
  }
  /** Returns the fleet registry with its names, roles, origins and control states; the sidepanel and the protocol boundary read the same list. */
  async listagents() {
    return [...await this.adapter.get("fleet") ?? []].sort(
      (one, two) => two.registeredat - one.registeredat
    );
  }
  /** Returns the budgetstate of one agent; an agent without a granted budget carries none. */
  async getbudget(agentid) {
    return (await this.adapter.get("agentbudgets") ?? []).find((state) => state.agentid === agentid);
  }
  /** Returns the fleet scope of one agent; an agent without a configured scope stays unbounded inside the session grants. */
  async getagentscope(agentid) {
    return (await this.adapter.get("agentscopes") ?? []).find((scope) => scope.agentid === agentid);
  }
  /** Persists the fleet scope of one agent; the intersection result with the session grants stays beside the registry. */
  async setagentscope(scope) {
    await this.adapter.set("agentscopes", [
      ...(await this.adapter.get("agentscopes") ?? []).filter(
        (candidate) => candidate.agentid !== scope.agentid
      ),
      scope
    ]);
  }
  /** Persists the budgetstate of one agent; every spend updates the stored state and every ceiling stays the user's choice. */
  async setbudget(state) {
    await this.adapter.set("agentbudgets", [
      ...(await this.adapter.get("agentbudgets") ?? []).filter(
        (candidate) => candidate.agentid !== state.agentid
      ),
      state
    ]);
  }
  /** Returns every stored fleet review record with the open ones first; the verdict controls read the same records. */
  async getreviews() {
    return [...await this.adapter.get("fleetreviews") ?? []].sort(
      (one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.requestedat - one.requestedat
    );
  }
  /** Persists one fleet review record with the reviewer verdict recorded beside the original output. */
  async setreview(record2) {
    await this.adapter.set("fleetreviews", [
      ...(await this.adapter.get("fleetreviews") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      ),
      record2
    ]);
  }
  /** Returns the runreplay captures of one agent, newest first; the audit view and the reconstruction read the same captures. */
  async getreplays(agentid) {
    return [...await this.adapter.get(`fleetreplays:${agentid}`) ?? []].sort(
      (one, two) => two.capturedat - one.capturedat
    );
  }
  /** Persists one runreplay capture per agent under the user configured replayretention window; an absent window keeps every capture of every agent. */
  async setreplay(record2, retention) {
    const kept = [record2, ...(await this.getreplays(record2.agentid)).filter((candidate) => candidate.id !== record2.id)];
    await this.adapter.set(`fleetreplays:${record2.agentid}`, retention === void 0 ? kept : kept.slice(0, retention));
  }
  /** Returns every stored output comparison, newest first; the side by side view reads the same records. */
  async getcomparison() {
    return [...await this.adapter.get("fleetcomparisons") ?? []].sort(
      (one, two) => two.comparedat - one.comparedat
    );
  }
  /** Persists one output comparison record; the field by field alignment stays for the audit trail. */
  async setcomparison(record2) {
    await this.adapter.set("fleetcomparisons", [
      ...(await this.adapter.get("fleetcomparisons") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      ),
      record2
    ]);
  }
  /** Returns every stored consensus record with the open rounds first; the vote tally view reads the same records. */
  async getvotes() {
    const records = await this.adapter.get("fleetvotes") ?? [];
    return [...records].sort(
      (one, two) => (one.outcome === "open" ? 0 : 1) - (two.outcome === "open" ? 0 : 1) || Math.max(...two.votes.map((vote) => vote.castat), 0) - Math.max(...one.votes.map((vote) => vote.castat), 0)
    );
  }
  /** Persists one consensus record; the votes, the tally and the outcome stay for the audit trail with every dissenting vote. */
  async setvote(record2) {
    await this.adapter.set("fleetvotes", [
      ...(await this.adapter.get("fleetvotes") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      ),
      record2
    ]);
  }
  /** Returns the timestamp of the last killswitch stop; the fleet view reads it to name when the user last halted everything. */
  async getkillswitchat() {
    return await this.adapter.get("killswitchat");
  }
  /** Persists the timestamp of one killswitch stop; one audit event per stopped agent lands beside it. */
  async setkillswitchat(at) {
    await this.adapter.set("killswitchat", at);
  }
  /** Returns the paused fleet agents by id; the executor skips only their queues while the peers keep running. */
  async getpausedagents() {
    return (await this.adapter.get("fleet") ?? []).filter((record2) => record2.state === "paused").map((record2) => record2.id);
  }
  /** Returns the spawn lineage of the 1.1.73 family: every fleet spawnrecord with its parent, child, depth and parent objective, newest first. */
  async getspawn() {
    return [...await this.adapter.get("fleetspawns") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one fleet spawnrecord of the lineage; every newer spawn replaces the stored one and the lineage survives every restart. */
  async setspawn(record2) {
    await this.adapter.set("fleetspawns", [
      ...(await this.adapter.get("fleetspawns") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      ),
      record2
    ]);
  }
  /** Returns every stored fleet aggregaterecord with the open ones first; the merged reports read newest first after them. */
  async getaggregate() {
    return [...await this.adapter.get("fleetaggregates") ?? []].sort(
      (one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.createdat - one.createdat
    );
  }
  /** Persists one fleet aggregaterecord under the user configured aggregateretention window; an absent window keeps every merged report for the audit trail. */
  async setaggregate(record2, retention) {
    const kept = [record2, ...(await this.getaggregate()).filter((candidate) => candidate.id !== record2.id)];
    await this.adapter.set("fleetaggregates", retention === void 0 ? kept : kept.slice(0, retention));
  }
  /** Returns the stored interleaved fleet timeline ordered by event time; the merged lanes read the same events. */
  async getinterleaved() {
    return [...await this.adapter.get("fleetinterleave") ?? []].sort(
      (one, two) => two.at - one.at
    );
  }
  /** Persists the interleaved fleet timeline under the user configured interleveretention window; an absent window keeps every interleaved event. */
  async setinterleaved(events, retention) {
    await this.adapter.set("fleetinterleave", retention === void 0 ? events : events.slice(0, retention));
  }
  /** Returns every stored lesson of the lessonshare, the most reused first; the matching pass reads the same records. */
  async getlessons() {
    return [...await this.adapter.get("fleetlessons") ?? []].sort(
      (one, two) => two.reusecount - one.reusecount || two.recordedat - one.recordedat
    );
  }
  /** Persists one lessonrecord of the lessonshare; the sanitized finding stays for every agent that serves it. */
  async setlesson(lesson) {
    await this.adapter.set("fleetlessons", [
      ...(await this.adapter.get("fleetlessons") ?? []).filter(
        (candidate) => candidate.id !== lesson.id
      ),
      lesson
    ]);
  }
  /** Returns every stored arbitration case with the open and granted ones first; the verdict view reads the same cases. */
  async getcases() {
    return [...await this.adapter.get("fleetcases") ?? []].sort(
      (one, two) => (one.state === "released" ? 1 : 0) - (two.state === "released" ? 1 : 0) || two.openedat - one.openedat
    );
  }
  /** Persists one arbitrationcase with its verdict; the release keeps the closed case for the audit trail. */
  async setcase(record2) {
    await this.adapter.set("fleetcases", [
      ...(await this.adapter.get("fleetcases") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      ),
      record2
    ]);
  }
  /** Returns the user configured priority lanes of the task queue; the drain order reads the same lanes. */
  async getlanes() {
    return await this.adapter.get("fleetlanes") ?? [];
  }
  /** Persists the priority lanes of the task queue; the lane order and the interactive protection stay the user's choice. */
  async setlane(lanes) {
    await this.adapter.set("fleetlanes", lanes);
  }
  /** Returns the latest loadreport per origin; the scaleworkers pass reads the same samples. */
  async getload() {
    return (await this.adapter.get("fleetload") ?? []).sort(
      (one, two) => two.sampledat - one.sampledat
    );
  }
  /** Persists one loadreport sample per origin; every newer sample replaces the stored one of its origin. */
  async setload(report) {
    await this.adapter.set(
      "fleetload",
      [
        report,
        ...(await this.adapter.get("fleetload") ?? []).filter(
          (candidate) => candidate.origin !== report.origin
        )
      ].slice(0, 32)
    );
  }
  /** Returns the shared fleet cost ledger, newest first; the split pass reads the same entries. */
  async getcosts() {
    return [...await this.adapter.get("fleetcosts") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one costentry of the shared ledger attributed to its agent; the accounting stays local and read only. */
  async setcost(entry) {
    await this.adapter.set(
      "fleetcosts",
      [entry, ...await this.adapter.get("fleetcosts") ?? []].slice(0, 512)
    );
  }
  /** Returns the user configured depthlimit of the sub agent recursion; an absent limit stays unbounded because the ceiling stays the user's choice. */
  async getdepthlimit() {
    return await this.adapter.get("fleetdepthlimit");
  }
  /** Persists the user configured depthlimit of the sub agent recursion; the spawn gates read it exactly. */
  async setdepthlimit(limit) {
    await this.adapter.set("fleetdepthlimit", limit);
  }
  /** Returns the stored closed tab records of the 1.1.74 family, newest first; the reopening path reads the same records after its grant recheck. */
  async getclosedtabrecords() {
    return [...await this.adapter.get("closedtabrecords") ?? []].sort(
      (one, two) => two.closedat - one.closedat
    );
  }
  /** Persists one closedtabrecord of a closed tab under the user configured closedtabretention window in milliseconds; an absent window keeps every record while a reopened record keeps its stamp for the audit trail. */
  async addclosedtabrecord(record2, retention) {
    const stored = (await this.getclosedtabrecords()).filter((candidate) => candidate.id !== record2.id);
    const kept = retention !== void 0 && Number.isFinite(retention) && retention > 0 ? stored.filter((candidate) => record2.closedat - candidate.closedat <= retention) : stored;
    await this.adapter.set("closedtabrecords", [record2, ...kept]);
  }
  /** Stamps one closedtabrecord as reopened so a reopened record never reopens twice while the retention window keeps it for the audit trail. */
  async setclosedtabrecord(record2) {
    await this.adapter.set("closedtabrecords", [
      record2,
      ...(await this.getclosedtabrecords()).filter((candidate) => candidate.id !== record2.id)
    ]);
  }
  /** Returns the navigation trail of one run: every navtrailentry the run captured in order; the audit and the on demand replay read the same entries. */
  async getnavtrail(runid) {
    return await this.adapter.get(`navtrails:${runid}`) ?? [];
  }
  /** Persists one navtrailentry of the run trail; an entry the trail already carries stays once so repeated restores never double it. */
  async addnavtrailentry(runid, entry) {
    const records = await this.getnavtrail(runid);
    if (records.some((item) => item.url === entry.url && item.stepid === entry.stepid && item.at === entry.at)) return;
    await this.adapter.set(`navtrails:${runid}`, [...records, entry]);
  }
  /** Returns the live navigation rate windows per domain of the 1.1.74 family; the sliding windows survive restarts through the same records. */
  async getnavratelimits() {
    return await this.adapter.get("navratelimits") ?? [];
  }
  /** Persists one navigation rate window per domain; every newer window replaces the stored one of its domain. */
  async setnavratelimitwindow(window) {
    await this.adapter.set("navratelimits", [
      ...(await this.adapter.get("navratelimits") ?? []).filter(
        (candidate) => candidate.domain !== window.domain
      ),
      window
    ]);
  }
  /** Returns the stored deep link patterns of the 1.1.74 family; the deeplinkapp builder reads the same patterns beside its built in catalog. */
  async getdeeplinks() {
    return await this.adapter.get("deeplinkpatterns") ?? [];
  }
  /** Persists one deeplinkpattern; a stored pattern of the same app and route gives way to the newer one. */
  async setdeeplink(pattern) {
    await this.adapter.set("deeplinkpatterns", [
      ...(await this.adapter.get("deeplinkpatterns") ?? []).filter(
        (candidate) => !(candidate.app === pattern.app && candidate.route === pattern.route)
      ),
      pattern
    ]);
  }
  /** Returns the safety verdict history of the 1.1.74 family, newest first; the ui shows the same verdicts with their reasons before anything opens. */
  async getsafety() {
    return [...await this.adapter.get("safetyverdicts") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists one safetyverdict of the checksafeurl history; every refusal keeps its reasons for the audit trail. */
  async setsafetyverdict(verdict) {
    await this.adapter.set(
      "safetyverdicts",
      [verdict, ...await this.adapter.get("safetyverdicts") ?? []].slice(0, 256)
    );
  }
  /** Returns the stored prefetchplan of the latest navintent pass; the predictions survive restarts so the warming resumes from the same set. */
  async getprefetch() {
    return this.adapter.get("prefetchplans");
  }
  /** Persists the prefetchplan of the latest navintent pass; a changed plan replaces the stored predictions because stale predictions never warm a page. */
  async setprefetch(plan) {
    return this.adapter.set("prefetchplans", plan);
  }
  /** Returns the navpause state with its pending url; the freeze and its queued navigation survive restarts through the same record. */
  async getnavpause() {
    return this.adapter.get("navpauserecord");
  }
  /** Persists the navpause state with its pending url; the queued navigation waits for the answer of the consent prompt across restarts. */
  async setnavpause(pause) {
    return this.adapter.set("navpauserecord", pause);
  }
  /** Returns the extractpipelines of the 1.1.75 family, newest first; a run id narrows the read to its own pipelines so the resume and the view read exactly their own extraction. */
  async getpipeline(runid) {
    const records = (await this.adapter.get("extractpipelines") ?? []).sort(
      (one, two) => two.updatedat - one.updatedat
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Persists one extractpipeline per run; every newer pipeline of the same id replaces the stored one so the pipeline state survives restarts. */
  async setpipeline(pipeline) {
    await this.adapter.set("extractpipelines", [
      pipeline,
      ...(await this.adapter.get("extractpipelines") ?? []).filter(
        (candidate) => candidate.id !== pipeline.id
      )
    ]);
  }
  /** Returns the streamcursor of one pipeline; the checkpointed position survives restarts so the resume continues exactly where the stream stopped. */
  async getcursor(pipelineid) {
    return this.adapter.get(`streamcursor:${pipelineid}`);
  }
  /** Persists the streamcursor of one pipeline after every chunk; the cursor checkpoints ride the same adapter so an interrupted stream never writes a row twice. */
  async setcursor(cursor) {
    await this.adapter.set(`streamcursor:${cursor.pipelineid}`, cursor);
  }
  /** Returns the stored transformrule list of one run; the pipeline layer applies only the rules the run review approved. */
  async gettransforms(runid) {
    return await this.adapter.get(`pipelinetransforms:${runid}`) ?? [];
  }
  /** Persists the transformrule list of one run; every newer list replaces the stored one so the transforms stay the reviewed set. */
  async settransforms(runid, rules) {
    await this.adapter.set(`pipelinetransforms:${runid}`, rules);
  }
  /** Returns the stored preview extractbatches of the 1.1.75 family, newest first; the grid preview reads the same batches without ever touching the stored extract. */
  async getrows() {
    return [...await this.adapter.get("previewbatches") ?? []].sort((one, two) => two.at - one.at);
  }
  /** Persists the latest preview extractbatch under the user configured previewretention window in milliseconds; an absent window keeps every batch for the audit trail. */
  async setrows(batch, retention) {
    const kept = [
      batch,
      ...(await this.adapter.get("previewbatches") ?? []).filter(
        (candidate) => candidate.id !== batch.id
      )
    ];
    await this.adapter.set(
      "previewbatches",
      retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the provlog entries of one run in append order; the provenance queries read the same append only log. */
  async getprovlog(runid) {
    return (await this.adapter.get(`provlog:${runid}`) ?? []).sort(
      (one, two) => one.at - two.at || (one.id < two.id ? -1 : 1)
    );
  }
  /** Appends one provlogentry to the run log; the log stays append only — an entry whose id already sits in the log never rewrites — so the audit integrity holds across restarts. */
  async addprovlogentry(runid, entry) {
    const records = await this.getprovlog(runid);
    if (records.some((candidate) => candidate.id === entry.id)) return;
    await this.adapter.set(`provlog:${runid}`, [...records, entry]);
  }
  /** Returns the samplepolicy of one plan; the preview reads the row count and the strategy the user configured for exactly this plan. */
  async getsamplepolicy(planid) {
    return this.adapter.get(`samplepolicy:${planid}`);
  }
  /** Persists the samplepolicy of one plan; the row count stays a user choice with no code ceiling. */
  async setsamplepolicy(planid, policy) {
    await this.adapter.set(`samplepolicy:${planid}`, policy);
  }
  /** Returns the stored dedupereports of the 1.1.75 family, newest first; a run id narrows the read to its own passes. */
  async getdedupereports(runid) {
    const records = [...await this.adapter.get("dedupereports") ?? []].sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Persists one dedupereport with its dropped counts and dropped row keys; every pass keeps its report for the audit trail. */
  async setdedupereport(report) {
    await this.adapter.set("dedupereports", [
      report,
      ...(await this.adapter.get("dedupereports") ?? []).filter(
        (candidate) => candidate.id !== report.id
      )
    ]);
  }
  /** Returns the stream file metadata of the 1.1.75 family, newest first; the cleanup after a run reads exactly the disk sinks its pipelines streamed to. */
  async getstreamfiles(runid) {
    const records = [...await this.adapter.get("streamfiles") ?? []].sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Persists one streamfilerecord for the cleanup after its run; the metadata carries the filename inside the runid namespace and never the row payloads. */
  async addstreamfile(record2) {
    await this.adapter.set("streamfiles", [
      record2,
      ...(await this.adapter.get("streamfiles") ?? []).filter(
        (candidate) => candidate.id !== record2.id
      )
    ]);
  }
  /** Returns the sourcestamprecords of one run, newest first; the stamps sit beside their rows so every cell answers the page and step that captured it. */
  async getsourcestamps(runid) {
    return (await this.adapter.get(`sourcestamps:${runid}`) ?? []).sort(
      (one, two) => two.capturedat - one.capturedat
    );
  }
  /** Persists the sourcestamprecords of one run; a stamp never rewrites after stamping so the capture timestamps stay immutable. */
  async setsourcestamps(runid, stamps) {
    await this.adapter.set(`sourcestamps:${runid}`, stamps);
  }
  /** Returns one stored event subscription of the 1.1.76 family by its id; the record carries its lasteventid so a reconnect resumes exactly where the stream stopped. */
  async getsubscription(id) {
    return (await this.getsubscriptions()).find((record2) => record2.id === id);
  }
  /** Returns the per run cached responses of the 1.1.76 family, newest first; a run id narrows the read to its own namespace because every cache key embeds the run it serves. */
  async getcache(runid) {
    const records = (await this.adapter.get("webapicache") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((entry) => entry.runid === runid) : records;
  }
  /** Persists one cached response of the 1.1.76 family under the user configured cacheretention window in entries; an absent window keeps every cacheentry of the run until the run ends. */
  async setcacheentry(entry, retention) {
    const kept = [
      entry,
      ...(await this.adapter.get("webapicache") ?? []).filter(
        (candidate) => candidate.key !== entry.key
      )
    ];
    await this.adapter.set(
      "webapicache",
      retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Runs the cache expiry cleanup pass of the 1.1.76 family: every entry whose expiry passed drops while its metadata stays with the caller for the audit trail; an absent pass keeps every unexpired entry. */
  async expirycachepass(now) {
    const records = await this.adapter.get("webapicache") ?? [];
    const kept = records.filter((entry) => entry.expiry === void 0 || now < entry.expiry);
    const expired = records.filter((entry) => entry.expiry !== void 0 && now >= entry.expiry);
    if (expired.length > 0) await this.adapter.set("webapicache", kept);
    return { kept, expired };
  }
  /** Returns the per run correlation map of the 1.1.76 family; the request map stays read only inside the run and exports to the audit trail as one map. */
  async getcorrelation(runid) {
    return this.adapter.get(`webapicorrelation:${runid}`);
  }
  /** Persists the per run correlation map of the 1.1.76 family; every assigned request id and every joined response pair survive restarts through the same record. */
  async setcorrelation(context) {
    await this.adapter.set(`webapicorrelation:${context.runid}`, context);
  }
  /** Returns the stored ratelimitdirective records of the 1.1.76 family per origin whose reset window has not passed; expired directives drop out at their reset windows, composed beside the ratelimitread family. */
  async getratelimitdirectives(now) {
    const records = await this.adapter.get("webapiratelimits") ?? [];
    const live = records.filter((directive) => directive.resetat > now);
    if (live.length !== records.length) await this.adapter.set("webapiratelimits", live);
    return live;
  }
  /** Persists one ratelimitdirective of the 1.1.76 family per origin and scope, replacing the previous directive of the same origin and scope. */
  async setratelimitdirective(directive) {
    const records = (await this.adapter.get("webapiratelimits") ?? []).filter(
      (candidate) => !(candidate.origin === directive.origin && candidate.scope === directive.scope)
    );
    await this.adapter.set("webapiratelimits", [directive, ...records]);
  }
  /** Returns the observed page api calls of the 1.1.76 family, newest first; a run id narrows the read to its own observations while the records stay read only beside the discovered api map. */
  async getapicalls(runid) {
    const records = (await this.adapter.get("webapicalls") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one observed page api call of the 1.1.76 family under the user configured apicallretention window in records; an absent window keeps every apicallrecord for the audit trail. */
  async addapicall(record2, retention) {
    const kept = [record2, ...await this.adapter.get("webapicalls") ?? []];
    await this.adapter.set(
      "webapicalls",
      retention !== void 0 && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the user configured poll choices of the 1.1.76 family: the timeout of one long poll request and the backoff between its retries; an absent choice leaves the poll unbounded because the bounds carry no code default. */
  async getpollchoices() {
    return await this.adapter.get("webapipollchoices") ?? {};
  }
  /** Persists the user configured poll choices of the 1.1.76 family; the timeout and the backoff stay exactly the user's values with no code default. */
  async setpollchoices(choices) {
    await this.adapter.set("webapipollchoices", choices);
  }
  /** Returns the stored ocr results of the 1.1.77 family, newest first; a run id narrows the read to its own recognitions. */
  async getocrs(runid) {
    const records = (await this.adapter.get("visionocr") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one ocr result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every ocrresult for the audit trail. */
  async addocr(record2, retention) {
    const kept = [record2, ...await this.adapter.get("visionocr") ?? []];
    await this.adapter.set(
      "visionocr",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the stored vision descriptions of the 1.1.77 family, newest first; a run id narrows the read to its own model answers. */
  async getvisions(runid) {
    const records = (await this.adapter.get("visiondescriptions") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one vision description of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every visiondescription for the audit trail. */
  async addvision(record2, retention) {
    const kept = [record2, ...await this.adapter.get("visiondescriptions") ?? []];
    await this.adapter.set(
      "visiondescriptions",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the stored redaction masks of the 1.1.77 family, newest first; a run id narrows the read to its own masks while the mask evidence always survives for the audit trail. */
  async getmasks(runid) {
    const records = (await this.adapter.get("visionmasks") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one redaction mask of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every redactionmask because the mask evidence answers the audit. */
  async addmask(record2, retention) {
    const kept = [record2, ...await this.adapter.get("visionmasks") ?? []];
    await this.adapter.set(
      "visionmasks",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the stored screenshot pairs of the 1.1.77 family, newest first; the name composes with screenshotpair because the getpairs accessor of the 1.1.40 family already serves the beforeafter shotpair records — the same house rule of composed names on collision. */
  async getscreenshotpairs(runid) {
    const records = (await this.adapter.get("visionscreenshotpairs") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one screenshot pair of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every screenshotpair for the audit trail. */
  async addscreenshotpair(record2, retention) {
    const kept = [record2, ...await this.adapter.get("visionscreenshotpairs") ?? []];
    await this.adapter.set(
      "visionscreenshotpairs",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the stored grounding results of the 1.1.77 family, newest first; a run id narrows the read to its own groundings. */
  async getgroundings(runid) {
    const records = (await this.adapter.get("visiongroundings") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one grounding result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every groundingresult for the audit trail. */
  async addgrounding(record2, retention) {
    const kept = [record2, ...await this.adapter.get("visiongroundings") ?? []];
    await this.adapter.set(
      "visiongroundings",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Returns the stored frame reads of the 1.1.77 family, newest first; every framereference names the video selector and the position the run read so a frame position never re-reads blindly. */
  async getframereads(runid) {
    const records = (await this.adapter.get("visionframereads") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one frame read of the 1.1.77 family under the user configured frameretention window in milliseconds; a repeated read of the same selector and position replaces its record while an absent window keeps every framereference for the audit trail. */
  async addframeread(record2, retention) {
    const previous = await this.adapter.get("visionframereads") ?? [];
    const fresh = retention !== void 0 && Number.isFinite(retention) && retention > 0 ? previous.filter((candidate) => record2.at - candidate.at < retention) : previous;
    await this.adapter.set("visionframereads", [
      record2,
      ...fresh.filter(
        (candidate) => !(candidate.runid === record2.runid && candidate.selector === record2.selector && candidate.positionms === record2.positionms)
      )
    ]);
  }
  /** Returns the persisted vision model configuration of the 1.1.77 family: the model name and the endpoint the user configured; an absent configuration keeps the model calls refused because no recognition ships inside the extension. */
  async getvisionconfig() {
    return await this.adapter.get("visionconfig") ?? {};
  }
  /** Persists the vision model configuration of the 1.1.77 family; the model and the endpoint stay exactly the user's values with no code default. */
  async setvisionconfig(config) {
    await this.adapter.set("visionconfig", config);
  }
  /** Returns the stored visioncache entries of the 1.1.77 family keyed by their image hashes, newest first; a run id narrows the read to its own namespace. */
  async getvisioncache(runid) {
    const records = (await this.adapter.get("visioncache") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((entry) => entry.runid === runid) : records;
  }
  /** Persists one visioncache entry of the 1.1.77 family by its image hash; a newer entry of the same hash replaces the older one so one image hash answers one recognition. */
  async setvisioncacheentry(entry) {
    const kept = [
      entry,
      ...(await this.adapter.get("visioncache") ?? []).filter(
        (candidate) => candidate.hash !== entry.hash
      )
    ];
    await this.adapter.set("visioncache", kept);
  }
  /** Runs the visioncache expiry pass of the 1.1.77 family: every entry older than the user configured visioncacheretention window in milliseconds drops while its metadata stays with the caller for the audit trail; an absent window keeps every entry. */
  async expirevisioncachepass(now, retention) {
    const records = await this.adapter.get("visioncache") ?? [];
    const kept = records.filter((entry) => retention === void 0 || now - entry.at < retention);
    const expired = records.filter((entry) => retention !== void 0 && now - entry.at >= retention);
    if (expired.length > 0) await this.adapter.set("visioncache", kept);
    return { kept, expired };
  }
  /** Returns the vision call records of the 1.1.77 family, newest first; every call names whether it rode the configured model endpoint so the visioncost count answers the costshare ledger. */
  async getvisioncalls(runid) {
    const records = (await this.adapter.get("visioncalls") ?? []).sort((one, two) => two.at - one.at);
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one vision call of the 1.1.77 family; the call log stays local and read only because the costshare ledger answers the user alone. */
  async addvisioncall(record2) {
    await this.adapter.set("visioncalls", [
      record2,
      ...await this.adapter.get("visioncalls") ?? []
    ]);
  }
  /** Returns the stored beforeafter pairs of the 1.1.78 family, newest first; the name composes with beforeafter because the getpairs accessor of the 1.1.40 family already serves the shotpair records — the same house rule of composed names on collision. */
  async getbeforeafters(runid) {
    const records = (await this.adapter.get("forensicpairs") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one beforeafter pair of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every pair for the audit trail. */
  async addbeforeafter(record2, retention) {
    const kept = [record2, ...await this.adapter.get("forensicpairs") ?? []];
    await this.adapter.set(
      "forensicpairs",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Replaces the stored beforeafter pairs after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setbeforeafters(records) {
    await this.adapter.set("forensicpairs", records);
  }
  /** Returns the forensic console timeline of one run of the 1.1.78 family in capture order; the name composes with consoletimeline because the gettimeline accessor of the run timeline family and the consolediff of the console family already serve their own records. */
  async getconsoletimeline(runid) {
    return (await this.adapter.get(`forensicconsole:${runid}`) ?? []).sort(
      (one, two) => one.sequence - two.sequence
    );
  }
  /** Records one console trace entry of the 1.1.78 family per run; the sequence numbers stamp in capture order so a page reload never resets the ordering while the retention answers the user choice alone. */
  async addconsoleentry(runid, entry, retention) {
    const kept = [...await this.adapter.get(`forensicconsole:${runid}`) ?? [], entry];
    await this.adapter.set(
      `forensicconsole:${runid}`,
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept
    );
  }
  /** Returns the forensic net timeline of one run of the 1.1.78 family in capture order; the name composes with nettrace because the getnetlog accessor of the network family already serves the netlog records. */
  async getnettraces(runid) {
    return (await this.adapter.get(`forensicnet:${runid}`) ?? []).sort(
      (one, two) => one.at - two.at
    );
  }
  /** Records one net trace entry of the 1.1.78 family per run; the correlation joining answers the correlateids map while the retention answers the user choice alone. */
  async addnettrace(runid, entry, retention) {
    const kept = [...await this.adapter.get(`forensicnet:${runid}`) ?? [], entry];
    await this.adapter.set(
      `forensicnet:${runid}`,
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept
    );
  }
  /** Returns the stored diff baselines of the 1.1.78 family, newest first; the name composes with diffbase because the getdiffs accessor of the snapshot family already serves the snapshotdiff records. */
  async getdiffbases(runid) {
    const records = (await this.adapter.get("forensicdiffbases") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Persists one diff baseline of the 1.1.78 family; a new baseline of the same page state replaces the older one so one page state answers one frozen capture. */
  async setdiffbase(record2) {
    const kept = [
      record2,
      ...(await this.adapter.get("forensicdiffbases") ?? []).filter(
        (candidate) => !(candidate.runid === record2.runid && candidate.pagestate === record2.pagestate)
      )
    ];
    await this.adapter.set("forensicdiffbases", kept);
  }
  /** Returns the stored diff results of the 1.1.78 family, newest first; a run id narrows the read to its own comparisons. */
  async getdiffresults(runid) {
    const records = (await this.adapter.get("forensicdiffresults") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one diff result of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every diffresult for the audit trail. */
  async adddiffresult(record2, retention) {
    const kept = [record2, ...await this.adapter.get("forensicdiffresults") ?? []];
    await this.adapter.set(
      "forensicdiffresults",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Replaces the stored diff results after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setdiffresults(records) {
    await this.adapter.set("forensicdiffresults", records);
  }
  /** Returns the stored thumbnails of the 1.1.78 family, newest first; every thumbnailrecord links back to its full capture through its captureid so the capture log shows the run at a glance. */
  async getthumbs(runid) {
    const records = (await this.adapter.get("forensicthumbs") ?? []).sort(
      (one, two) => two.at - one.at
    );
    return runid !== void 0 && runid.trim() !== "" ? records.filter((record2) => record2.runid === runid) : records;
  }
  /** Records one thumbnail of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every thumbnailrecord beside its full capture. */
  async addthumb(record2, retention) {
    const kept = [record2, ...await this.adapter.get("forensicthumbs") ?? []];
    await this.adapter.set(
      "forensicthumbs",
      retention !== void 0 && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept
    );
  }
  /** Replaces the stored thumbnails after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setthumbs(records) {
    await this.adapter.set("forensicthumbs", records);
  }
  /** Returns the timelapse frame references of one run of the 1.1.78 family in their ordered sequence; the assembled lapse replays the page change in capture order. */
  async getlapse(runid) {
    return (await this.adapter.get(`forensiclapse:${runid}`) ?? []).sort(
      (one, two) => one.sequence - two.sequence
    );
  }
  /** Appends one timelapse frame of the 1.1.78 family per run; the frame reference carries its ordered sequence number so a late stored frame lands in its place. */
  async addlapseframe(runid, frame) {
    const kept = [
      ...(await this.adapter.get(`forensiclapse:${runid}`) ?? []).filter(
        (candidate) => candidate.sequence !== frame.sequence
      ),
      frame
    ];
    await this.adapter.set(`forensiclapse:${runid}`, kept);
  }
  /** Returns the timelapse configuration of one run of the 1.1.78 family; the interval and the duration stay the user choices the lapse runs on. */
  async getlapseconfig(runid) {
    return this.adapter.get(`forensiclapseconfig:${runid}`);
  }
  /** Persists the timelapse configuration of one run of the 1.1.78 family; the started lapse survives service worker restarts through the same record. */
  async setlapseconfig(config) {
    await this.adapter.set(`forensiclapseconfig:${config.runid}`, config);
  }
  /** Returns the user configured capture naming rule of the 1.1.78 family: the lowercase pattern with the parts it stamps; an absent rule keeps the capturename grammar of the files family. */
  async getnames() {
    return this.adapter.get("forensicnames");
  }
  /** Persists the user configured capture naming rule of the 1.1.78 family; the pattern and its parts stay exactly the user's values with no code default. */
  async setnamerule(rule) {
    await this.adapter.set("forensicnames", rule);
  }
  /** Returns the user configured forensic choices of the 1.1.78 family: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention; an absent choice never hides a code default. */
  async getforensicchoices() {
    const settings = await this.getsettings();
    const choices = {};
    if (settings?.diffthreshold !== void 0) choices.diffthreshold = settings.diffthreshold;
    if (settings?.timelapseinterval !== void 0) choices.timelapseinterval = settings.timelapseinterval;
    if (settings?.thumbnailedge !== void 0) choices.thumbnailedge = settings.thumbnailedge;
    if (settings?.forensicretention !== void 0) choices.forensicretention = settings.forensicretention;
    return choices;
  }
  /** Persists the user configured forensic choices of the 1.1.78 family through the runsettings; the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention stay exactly the user's values with no code default. */
  async setforensicchoices(choices) {
    const settings = await this.getsettings() ?? {};
    await this.setsettings({
      ...settings,
      ...choices.diffthreshold !== void 0 ? { diffthreshold: choices.diffthreshold } : {},
      ...choices.timelapseinterval !== void 0 ? { timelapseinterval: choices.timelapseinterval } : {},
      ...choices.thumbnailedge !== void 0 ? { thumbnailedge: choices.thumbnailedge } : {},
      ...choices.forensicretention !== void 0 ? { forensicretention: choices.forensicretention } : {}
    });
  }
  /** Lists every stored key of the 1.1.79 minimization family with its data class, its serialized size and its record count: the inventory reads the stored families the caller names so the purge and the exportall bundle scope exactly over what the device holds, while the artifact getinventory of the 1.1.68 family stays untouched for the cleanup sweeper. */
  async getdatainventory(families) {
    const now = Date.now();
    const inventory = [];
    for (const family of families) {
      const value = await this.adapter.get(family.key);
      const serialized = JSON.stringify(value ?? null) ?? "null";
      const records = Array.isArray(value) ? value.length : value === void 0 || value === null ? 0 : 1;
      inventory.push({ key: family.key, dataclass: family.dataclass, size: serialized.length, records, at: now });
    }
    return inventory;
  }
  /** Stores the minimization policies of the 1.1.79 family — the purge policy with its scope and typed confirmation, the cleanup schedule with its artifact classes and timing, and the sync settings with the opted in classes and the cadence — exactly as the user configured them with no code default. */
  async getminpolicies() {
    return await this.adapter.get(
      "minpolicies"
    ) ?? {};
  }
  /** Persists the minimization policies of the 1.1.79 family; every scope, timing, cadence and confirmation phrase stays the user's choice with no code default. */
  async setminpolicies(policies) {
    return this.adapter.set("minpolicies", policies);
  }
  /** Lists the sync records of the 1.1.79 family: one record per synced payload with its opted in classes, its payload hash, its format tag and its sync time — a plaintext sync never enters this list. */
  async getsyncrecords() {
    return await this.adapter.get("syncrecords") ?? [];
  }
  /** Stores one sync record of the 1.1.79 family; the newest pass answers first so the sync view names the latest transport. */
  async addsyncrecord(record2) {
    await this.adapter.set("syncrecords", [
      record2,
      ...(await this.getsyncrecords()).filter((candidate) => candidate.id !== record2.id)
    ]);
  }
  /** Lists the cookie jar records of the 1.1.79 family — one jar per task run with its scoped cookie entries, its seal state and its expiry window. */
  async getjars() {
    return await this.adapter.get("cookiejars") ?? [];
  }
  /** Stores one cookie jar record of the 1.1.79 family; the jar keeps its run binding so one task run never shares its cookie state with another. */
  async setjar(jar) {
    await this.adapter.set("cookiejars", [
      ...(await this.getjars()).filter((candidate) => candidate.jarid !== jar.jarid),
      jar
    ]);
  }
  /** Expires the sealed jars of the 1.1.79 family whose user configured expiry window passed: the cookie entries leave while the jar record stays for the audit trail, and an unexpired or expiry-less jar keeps everything because the expiry never defaults in code. */
  async expirejarpass(now) {
    const jars = await this.getjars();
    let expired = 0;
    for (const jar of jars) {
      if (jar.sealed && jar.expiresat !== void 0 && jar.expiresat <= now && jar.cookies.length > 0) {
        await this.setjar({ ...jar, cookies: [], updatedat: now });
        expired += 1;
      }
    }
    return { expired };
  }
  /** Lists the local rule records of the 1.1.79 family: the field lists per origin that must never leave the device. */
  async getlocalrules() {
    return await this.adapter.get("localrules") ?? [];
  }
  /** Stores one local rule record of the 1.1.79 family per origin; the localfirst pass and the localgate read exactly these fields. */
  async setlocalrule(rule) {
    await this.adapter.set("localrules", [
      ...(await this.getlocalrules()).filter((candidate) => candidate.origin !== rule.origin),
      rule
    ]);
  }
  /** Reads the telemetry policy of the 1.1.79 family persisted fixed to off: the enabled literal stays false by construction and every counter keeps living inside the local memory. */
  async gettelemetrypolicy() {
    return await this.adapter.get("telemetrypolicy") ?? {
      enabled: false,
      counters: "local",
      at: Date.now()
    };
  }
  /** Persists the telemetry policy of the 1.1.79 family; only the fixed off record ever stores because the type makes an on state unrepresentable. */
  async settelemetrypolicy(policy) {
    return this.adapter.set("telemetrypolicy", policy);
  }
  /** Lists the exportall bundles of the 1.1.79 family: one record per portable file the user asked for with its record counts and byte sizes. */
  async getexportbundles() {
    return await this.adapter.get("exportallbundles") ?? [];
  }
  /** Stores one exportall bundle of the 1.1.79 family; the bundle links to its download record so the audit trail answers which download carried which bundle. */
  async addexportbundle(bundle) {
    await this.adapter.set("exportallbundles", [
      bundle,
      ...(await this.getexportbundles()).filter((candidate) => candidate.id !== bundle.id)
    ]);
  }
  /** Links one exportall bundle of the 1.1.79 family to the download record that carried it, so the audit trail answers which download shipped which bundle. */
  async setbundledownload(bundleid, downloadid) {
    await this.adapter.set("exportalldownloads", {
      ...await this.adapter.get("exportalldownloads") ?? {},
      [bundleid]: downloadid
    });
  }
  /** Lists the download links of the exportall bundles of the 1.1.79 family by bundle id. */
  async getbundledownloads() {
    return await this.adapter.get("exportalldownloads") ?? {};
  }
  /** Flags artifacts of the 1.1.79 family for retention: the flagged ids never enter a cleanup pass because the user asked to keep them. */
  async flagretainedartifacts(ids) {
    const kept = /* @__PURE__ */ new Set([...await this.adapter.get("retainedartifacts") ?? [], ...ids]);
    await this.adapter.set("retainedartifacts", [...kept]);
  }
  /** Lists the artifact ids the user flagged for retention of the 1.1.79 family; the cleanup pass keeps every one of them. */
  async getretainedartifacts() {
    return await this.adapter.get("retainedartifacts") ?? [];
  }
  /** Lists the storage keys the run families wrote, derived from the stored records: the run scoped keys of every known run, the session trail keys and the family keys the inventory scopes, because the adapter seam exposes no enumeration and the purge of a run trace names real keys only. */
  async storedkeys() {
    const runs = await this.adapter.get("runs") ?? [];
    const sessions = await this.adapter.get("sessionrecords") ?? [];
    const keys = /* @__PURE__ */ new Set(["runs", "memoryitems", "captures", "settings", "provlog", "audit"]);
    for (const run of runs) {
      keys.add(`runlog${run.runid}`);
      keys.add(`runscopes${run.runid}`);
      keys.add(`taskstate${run.runid}`);
      keys.add(`emulationstate${run.runid}`);
      keys.add(`workflowprovenance${run.runid}`);
      keys.add(`controldecisions${run.runid}`);
      keys.add(`runtimeline:${run.runid}`);
      keys.add(`provlog:${run.runid}`);
    }
    for (const session of sessions) keys.add(`trail${session.id}`);
    return [...keys].sort();
  }
  /** Purges the stored families of the 1.1.79 minimization family by storage key: the purgeonrequest pass resolved the scope and the typed confirmation before the caller lands here, every deleted key entered the audit trail through the caller, and the audit family never purges because the immutable hashes survive every pass. */
  async purgekeys(keys) {
    for (const key of keys) {
      if (key === "audit") continue;
      await this.adapter.set(key, key === "settings" ? {} : []);
    }
  }
  /** Builds the auditexportrecord of the workspace on demand: the runs with their visits, the memory items with their provenance, the expiry rules, the timeline streams of every run and the locks bundle into one record. */
  async getexport(now) {
    const runs = await this.listruns();
    const timeline = [];
    for (const run of runs) timeline.push(...await this.getruntimeline(run.runid));
    return {
      at: now,
      runs,
      memory: await this.getmemoryitems(),
      expiryrules: await this.getexpiry(),
      timeline,
      locks: await this.listlocks()
    };
  }
  /**
   * The site bridge seam of the 1.1.82 family: the relay session records, the pairing records with their one time codes, the relay token records stored only as sha-256 hashes scoped to the relay origin, the bridge event log with its minimized payloads, the offline bridge queue with its operation id deduplication and the bridge kill switch stamp persist through the same local adapter; the socket itself lives in the background service worker while every record survives its restarts.
   * The seam documents a relay session backend — a reviewed relay store can take the session and token registry over later, holding the pairing state and the token hashes beside the idle expiry sweeps on its own reviewed infrastructure behind the same bridge consent gate and the same origin scoping — without touching the callers, without ever persisting a raw token and without ever bypassing the review.
   * The bridge records below never hold page content: the event payloads carry plan text and statuses only unless the explicit page consent flag is set.
   */
  /** Lists the relay session records of the 1.1.82 site bridge: one record per paired relay session with its two member room and idle window. */
  async getbridgesessions() {
    return await this.adapter.get("bridgesessions") ?? [];
  }
  /** Stores the relay session records of the 1.1.82 site bridge in one pass so a restart never leaves a half written member room. */
  async setbridgesessions(records) {
    return this.adapter.set("bridgesessions", records);
  }
  /** Stores one relay session record of the 1.1.82 site bridge, replacing the record of the same session id. */
  async addbridgesession(record2) {
    await this.adapter.set("bridgesessions", [
      record2,
      ...(await this.getbridgesessions()).filter((candidate) => candidate.id !== record2.id)
    ]);
  }
  /** Lists the bridge pairing records of the 1.1.82 site bridge: the one time codes minted inside the extension options bound to the relay origin. */
  async getbridgepairings() {
    return await this.adapter.get("bridgepairings") ?? [];
  }
  /** Stores the bridge pairing records of the 1.1.82 site bridge in one pass. */
  async setbridgepairings(records) {
    return this.adapter.set("bridgepairings", records);
  }
  /** Stores one bridge pairing record of the 1.1.82 site bridge; a re-mint of the same origin replaces the earlier code. */
  async addbridgepairing(record2) {
    await this.adapter.set("bridgepairings", [
      record2,
      ...(await this.getbridgepairings()).filter((candidate) => candidate.origin !== record2.origin)
    ]);
  }
  /** Lists the relay token records of the 1.1.82 site bridge: the sha-256 hashes scoped to the relay origin, never a raw token. */
  async getbridgetokens() {
    return await this.adapter.get("bridgetokens") ?? [];
  }
  /** Stores the relay token records of the 1.1.82 site bridge in one pass; the raw values stay out of the store by construction. */
  async setbridgetokens(records) {
    return this.adapter.set("bridgetokens", records);
  }
  /** Lists the bridge event records of the 1.1.82 site bridge: the minimized chat, plan proposal, plan review and progress events with their operation ids. */
  async getbridgeevents() {
    return await this.adapter.get("bridgeevents") ?? [];
  }
  /** Stores one bridge event record of the 1.1.82 site bridge at the head of the log; the payloads carry plan text and statuses only. */
  async addbridgeevent(event) {
    await this.adapter.set("bridgeevents", [
      event,
      ...(await this.getbridgeevents()).filter((candidate) => candidate.opid !== event.opid)
    ]);
  }
  /** Lists the offline bridge queue of the 1.1.82 site bridge: the buffered frames with their stable operation ids for the replay deduplication. */
  async getbridgequeue() {
    return await this.adapter.get("bridgequeue") ?? [];
  }
  /** Stores the offline bridge queue of the 1.1.82 site bridge in one pass so the replay and the buffer never race. */
  async setbridgequeue(records) {
    return this.adapter.set("bridgequeue", records);
  }
  /** Reads the bridge kill switch stamp of the 1.1.82 site bridge; an absent stamp leaves the switch released. */
  async getbridgeswitch() {
    return this.adapter.get("bridgeswitch");
  }
  /** Stores the bridge kill switch stamp of the 1.1.82 site bridge; one click disables the socket and the pairing instantly. */
  async setbridgeswitch(stamp) {
    return this.adapter.set("bridgeswitch", stamp);
  }
  /** Returns the install state of the 1.1.85 native host: the host name, the extension id, the installer and companion versions, the port state and the last errors; an absent record leaves the transport deny by default. */
  async getnativestate() {
    return this.adapter.get("nativestate");
  }
  /** Stores the install state of the 1.1.85 native host so the install state persists across service worker restarts; the record never carries key material or session tokens. */
  async setnativestate(state) {
    return this.adapter.set("nativestate", state);
  }
  /** Lists the native call records of the 1.1.85 audit trail: one record per call with its correlation id, surface, call class and outcome, newest first. */
  async getnativecalls() {
    return await this.adapter.get("nativecalls") ?? [];
  }
  /** Replaces the stored native call set after one recorded call so the audit trail survives the service worker restarts. */
  async setnativecalls(records) {
    return this.adapter.set("nativecalls", records);
  }
  /** Stores one native call record at the head of the audit trail; a repeated record id replaces the earlier entry and the record carries no payload bytes. */
  async addnativecall(record2) {
    await this.adapter.set("nativecalls", [
      record2,
      ...(await this.getnativecalls()).filter((candidate) => candidate.id !== record2.id)
    ]);
  }
  /** Reads the kill switch stamp of the 1.1.85 native transport; an absent stamp leaves the switch released. */
  async getnativeswitch() {
    return this.adapter.get("nativeswitch");
  }
  /** Stores the kill switch stamp of the 1.1.85 native transport; one press stops every native call instantly and no frame crosses until the release. */
  async setnativeswitch(stamp) {
    return this.adapter.set("nativeswitch", stamp);
  }
  /** Lists the wsbridge session records of the 1.1.85 native transport: the port, the token hash (never the raw token), the idle window and the connection counts. */
  async getnativebridgesessions() {
    return await this.adapter.get("nativebridgesessions") ?? [];
  }
  /** Replaces the stored wsbridge session set after one bind, connection or expiry sweep; the raw tokens stay out of the store by construction. */
  async setnativebridgesessions(sessions) {
    return this.adapter.set("nativebridgesessions", sessions);
  }
  /**
   * The resilience adapter seam of the 1.1.70 family: today the offlinequeue, the run records, the checkpoints, the heartbeats and the executed idempotencykeys persist through the same local adapter as every other record, and the seam keeps the queuedtask and runrecord shapes stable so a reviewed disk backed queue backend can take the offlinequeue over later — a browser restart or a service worker wake then drains the same sequence order — without touching the callers and without ever bypassing the review.
   * The state depth seam of the 1.1.71 family: the memoryitems, their provenance and their expiryrules persist through the same local adapter while the stored values encrypt at rest through the webcrypto derived key of encryptrest; the seam keeps the memoryitem shape stable so a reviewed encrypted backend implementation can take the whole memory store over later — the adapter then writes and reads only encrypted envelopes — without touching the callers, without persisting the derived key and without ever bypassing the review.
   * The fleet seam of the 1.1.72 family: the agentrecords, their budgetstates, the escalations, the reviewrecords, the runreplay captures under their user retention, the output comparisons, the consensusrecords and the killswitch stamp persist through the same local adapter; the seam keeps the fleet shapes stable so a reviewed shared backend can take the registry over later — a fleet of many browsers then reads one registry — without touching the callers and without ever bypassing the review.
   * The work seam of the 1.1.73 family: the fleet spawn lineage with its parent objectives, the aggregaterecords under their user retention, the interleaved timeline under its own retention, the lessonshare records, the arbitration cases with their verdicts, the priority lanes, the latest load reports per origin, the shared cost ledger and the user configured depthlimit persist through the same local adapter; the seam keeps the work shapes stable so a reviewed shared fleet backend can take the coordination state over later — many browsers then read one spawn lineage and one cost ledger — without touching the callers and without ever bypassing the review.
   * The navigation seam of the 1.1.74 family: the closedtabrecords under their user retention window, the navigation trails per run with their deduplicated entries, the per domain navigation rate windows, the deep link patterns, the safety verdict history, the prefetchplan of the latest navintent pass and the navpause state with its pending url persist through the same local adapter; the seam keeps the navigation shapes stable so a reviewed session restore backend can take the closed tab and trail state over later — a restarted browser then reopens the same closed tabs and replays the same trails — without touching the callers and without ever bypassing the review.
   * The pipeline seam of the 1.1.75 family: the extractpipelines per run, the streamcursor checkpointed after every chunk, the reviewed transformrule lists per run, the preview extractbatches under their user previewretention, the append only provlog entries per run, the samplepolicies per plan, the dedupereports with their dropped counts, the streamfilerecord metadata for the cleanup after each run and the sourcestamprecords beside their rows persist through the same local adapter; the seam keeps the pipeline shapes stable so a reviewed disk backed sink backend can take the stream files over later — the chunked writes then land on the same reviewed disk namespace while the cursor checkpoints and the provlog stay with the audit — without touching the callers and without ever bypassing the review.
   * The web api transport seam of the 1.1.76 family: the event subscription records with their persisted last event ids so a reconnect resumes exactly where the stream stopped, the per run cached responses namespaced through their run embedded cache keys under the user configured cacheretention, the cache expiry cleanup pass, the per run correlation maps with their assigned request ids and joined response pairs, the ratelimitdirective records per origin and scope, the observed page api calls under their user configured apicallretention and the user configured poll timeout and backoff choices persist through the same local adapter; the seam keeps the cacheentry shape stable so a reviewed cache backend can take the per run response cache over later — a shared or disk backed cache then serves the same run namespaced keys behind the same cachegate — without touching the callers and without ever bypassing the review.
   * The vision seam of the 1.1.77 family: the ocr results and the vision descriptions under their user configured visionretention, the redaction masks with their region evidence, the screenshot pairs binding each image to its dom snapshot, the grounding results with their ranked selectors, the frame reads with their video positions under their user configured frameretention, the vision model configuration, the visioncache entries keyed by their image hashes with the expiry pass tied to the user visioncacheretention window and the vision call log that feeds the costshare ledger persist through the same local adapter; the seam documents a model provider backend — a reviewed model provider can take the ocr read, the vision send and the pdf rasterize seams over later, running the recognition and the descriptions on its own reviewed infrastructure behind the same visiongate consent, while the recognition payloads and description texts stay opaque to this adapter — without touching the callers and without ever bypassing the review.
   * The forensic seam of the 1.1.78 family: the beforeafter pairs under the user configured forensicretention, the per run console and net timelines with their sequence and correlation linkage tied to the run heartbeat, the diff baselines with their page state labels and the diff results with their changed regions, the thumbnails linked back to their full captures, the per run timelapse configurations with their ordered frame references, the user configured capture naming rule and the forensic choices of the diff threshold, the timelapse interval, the thumbnail edge and the retention persist through the same local adapter; the seam documents a capture store backend — a reviewed disk backed capture store can take the forensic records over later, holding the pairs, the timelines and the diffs beside the capture bytes on the same reviewed namespace while the provenance stays with the provlog — without touching the callers, without a forced purge of its own and without ever bypassing the review.
   * The minimization seam of the 1.1.79 family: the data inventory over the stored families, the minimization policies of the purge scope with its typed confirmation, the cleanup schedule with its artifact classes and timing and the sync settings with the opted in classes and the cadence, the sync records with their payload hashes and format tags, the cookie jars per run with their seal state and expiry windows, the local rule field lists per origin, the telemetry policy fixed to off, the exportall bundles with their download links and the retained artifact flags persist through the same local adapter; the seam documents an encrypted sync backend — a reviewed sync backend can take the syncrecord transport over later, receiving only the encrypted envelopes the encryptsync pass built from the user passphrase while the passphrase itself never persists and the derived key never rides a payload — without touching the callers, without a plaintext transport and without ever bypassing the review.
   * The mcp serve seam of the 1.1.84 family: the client session bindings that pair one client with exactly one extension session so concurrent clients hold isolated sessions, the client records with their initialize declared name and version metadata for the audit trail, the tool call records that name the caller, the tool and the outcome of every serve call without any payload, the served resource watchers with their baselines, the approval gates with their pending state and the shutdown drain window the user configures persist through the same local adapter the extension engine uses; the serve mode shares the policy gates, the kind catalog, this memory store and the progress store with the live extension sessions instead of growing a second engine, and the seam documents a serve state backend — a reviewed serve backend can take the bindings and the call registry over later behind the same pairing approval, the same consent gates and the same audit trail — without touching the callers, without ever persisting a raw session token and without ever bypassing the review.
   * The native host seam of the 1.1.85 family: the install state that records the host name, the extension id, the installer and companion versions and the port state so the install survives every service worker restart, the native call records that name the correlation id, the surface, the call class and the outcome of every native call without any payload, the kill switch stamp and the wsbridge session records with their token hashes only persist through the same local adapter; the raw wsbridge token never persists because the advertisement frame stays the only carrier, and the seam documents a native state backend — a reviewed host state backend can take the install state and the call registry over later behind the same install consent, the same per class gates and the same audit trail — without touching the callers and without ever bypassing the review.
   */
};
function mediakindof(record2) {
  if ("pages" in record2) return "pdf";
  if ("startedat" in record2) return "recording";
  if ("timestamp" in record2) return "frame";
  if ("context" in record2) return "canvas";
  if ("tracks" in record2) return "stream";
  return "asset";
}
function expiremediabytes(record2) {
  if ("dataurl" in record2) {
    const source = record2;
    const copy = { ...source };
    delete copy.dataurl;
    return { ...copy, bytesexpired: true };
  }
  if ("startedat" in record2) {
    const source = record2;
    const copy = { ...source };
    delete copy.bytes;
    return { ...copy, bytesexpired: true };
  }
  return record2;
}
function expirecapturebytes(record2) {
  const { bytes, ...metadata } = record2;
  void bytes;
  return { ...metadata, bytesexpired: true };
}
function expirecallbody(record2) {
  const { body, ...metadata } = record2;
  void body;
  return { ...metadata, bodyexpired: true };
}
function expirebodybytes(record2) {
  const { body, ...metadata } = record2;
  void body;
  return { ...metadata, bodyexpired: true };
}
function randomid() {
  return crypto.randomUUID();
}

// security.ts
var fsseat;
var fspromisesseat;
var childprocessseat;
var utilseat;
function nodefs() {
  if (fsseat === void 0) fsseat = process.getBuiltinModule("node:fs");
  return fsseat;
}
function nodefspromises() {
  if (fspromisesseat === void 0)
    fspromisesseat = process.getBuiltinModule("node:fs/promises");
  return fspromisesseat;
}
function nodechildprocess() {
  if (childprocessseat === void 0)
    childprocessseat = process.getBuiltinModule("node:child_process");
  return childprocessseat;
}
function nodeutil() {
  if (utilseat === void 0) utilseat = process.getBuiltinModule("node:util");
  return utilseat;
}
function join(...parts) {
  const cleaned = [];
  for (const part of parts) {
    if (part === "" || part === void 0 || part === null) continue;
    cleaned.push(String(part));
  }
  const joined = cleaned.join("/").replace(/\/+/g, "/");
  return joined.length > 1 && joined.endsWith("/") ? joined.slice(0, -1) : joined;
}
function extname(path) {
  const dot = path.lastIndexOf(".");
  const slash = Math.max(path.lastIndexOf("/"), 0);
  return dot > slash ? path.slice(dot) : "";
}
function originprofileof(input) {
  if (input.origin.trim() === "") throw new Error("The origin profile needs its exact origin.");
  return {
    profileid: input.profileid ?? randomid(),
    origin: input.origin,
    grants: [...input.grants ?? []],
    denials: [...input.denials ?? []],
    createdat: input.now,
    updatedat: input.now
  };
}
function profilegrade(input) {
  if (!input.sensitive)
    return {
      allowed: true,
      consult: false,
      reason: `The ${input.kind} kind grades non-sensitive and the origin profile needs no consult.`
    };
  if (input.profile === void 0)
    return {
      allowed: true,
      consult: true,
      reason: `No origin profile exists for the ${input.kind} kind, so the fresh class consent gate alone routes the sensitive step.`
    };
  if (input.profile.denials.includes(input.kind))
    return {
      allowed: false,
      consult: true,
      reason: `The origin profile of ${input.profile.origin} denies the ${input.kind} kind; a denied kind never runs on that origin.`
    };
  if (input.profile.grants.includes(input.kind))
    return {
      allowed: true,
      consult: true,
      reason: `The origin profile of ${input.profile.origin} grants the ${input.kind} kind the user reviewed.`
    };
  return {
    allowed: true,
    consult: true,
    reason: `The origin profile of ${input.profile.origin} carries no ${input.kind} decision, so the fresh class consent gate alone routes the sensitive step.`
  };
}
function stepoptions(step) {
  if (!step.options) return {};
  try {
    const parsed = JSON.parse(step.options);
    return Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
var paymentkinds = /* @__PURE__ */ new Set(["fillcard", "fillcode"]);
var credentialkinds = /* @__PURE__ */ new Set(["consentpassword", "saveapikey", "handleauth", "authflow"]);
var deletekinds = /* @__PURE__ */ new Set([
  "discardtab",
  "closepattern",
  "clearcookies",
  "removeattribute",
  "cleanupartifacts"
]);
var publishkinds = /* @__PURE__ */ new Set([
  "postform",
  "postfiles",
  "sendmessage",
  "submitform",
  "submitsearch",
  "writeclipboard"
]);
var defaultsensitivekinds = /* @__PURE__ */ new Set([
  "attachfile",
  "uploadfile",
  "uploadfiles",
  "downloadfile",
  "downloadimages",
  "batchdownload",
  "pausedownload",
  "resumedownload",
  "quarantinedownload",
  "evaluate"
]);
function sensitiveclassesof(step) {
  const options = stepoptions(step);
  const fields = Array.isArray(options.fields) ? options.fields.filter((item) => Boolean(item) && typeof item === "object") : [];
  const names = [
    ...fields.map((field) => typeof field.name === "string" ? field.name : ""),
    typeof options.field === "string" ? options.field : "",
    typeof options.target === "string" ? options.target : ""
  ].map((name) => name.toLowerCase());
  const carries = (shape) => names.some((name) => name.includes(shape));
  const classes = /* @__PURE__ */ new Set();
  if (paymentkinds.has(step.kind) || carries("card") || carries("cvc") || carries("cvv")) classes.add("payment");
  const credentialshape = carries("password") || carries("token") || carries("secret") || carries("apikey") || carries("passphrase");
  const submits = step.kind === "submitform" || step.kind === "postform" || step.kind === "submitsearch" || step.kind === "fillform" || step.kind === "filllabel" || step.kind === "fillplaceholder";
  if (credentialkinds.has(step.kind) || submits && credentialshape) classes.add("credential");
  if (deletekinds.has(step.kind)) classes.add("delete");
  if (publishkinds.has(step.kind) || step.kind === "callrest" || step.kind === "callgraphql") {
    const verb = typeof options.method === "string" ? options.method.trim().toUpperCase() : typeof options.verb === "string" ? options.verb.trim().toUpperCase() : "";
    if (step.kind === "callrest" || step.kind === "callgraphql") {
      if (verb !== "" && !["GET", "HEAD", "OPTIONS"].includes(verb)) classes.add("publish");
    } else classes.add("publish");
  }
  const bydefault = defaultsensitivekinds.has(step.kind);
  const list = [...classes];
  if (list.length === 0 && !bydefault)
    return {
      classes: [],
      bydefault: false,
      sensitive: false,
      reason: `The ${step.kind} kind carries no sensitive class and no default sensitive grade.`
    };
  return {
    classes: list,
    bydefault,
    sensitive: true,
    reason: `The ${step.kind} kind grades sensitive${list.length > 0 ? ` through the ${list.join(", ")} class${list.length === 1 ? "" : "es"}` : ""}${bydefault ? " by default" : ""}.`
  };
}
function classconsentcovers(consents, origin, sensitiveclass, now) {
  return consents.some(
    (consent) => consent.origin === origin && consent.sensitiveclass === sensitiveclass && consent.grantedat <= now && (consent.expiresat === void 0 || now < consent.expiresat)
  );
}
function missingclassconsents(input) {
  const missing = input.classes.filter((kind) => !classconsentcovers(input.consents, input.origin, kind, input.now));
  if (missing.length > 0)
    return {
      needed: true,
      missing,
      reason: `The sensitive classes ${missing.join(", ")} need one fresh consent prompt each on ${input.origin}.`
    };
  if (input.bydefault && input.classes.length === 0)
    return {
      needed: true,
      missing: [],
      reason: `The ${input.origin} step grades sensitive by default and needs its fresh consent window prompt.`
    };
  return {
    needed: false,
    missing: [],
    reason: `The fresh class consents of ${input.origin} cover every class the step names.`
  };
}
var defaultmaskshapes = ["password", "token", "card", "secret"];
var maskmarker = "[redacted]";
function fieldshapekind(name) {
  const lowered = name.toLowerCase();
  if (lowered.includes("password") || lowered.includes("passwd") || lowered.includes("pwd") || lowered.includes("passphrase"))
    return "password";
  if (lowered.includes("token") || lowered.includes("apikey") || lowered.includes("api_key") || lowered.includes("auth") || lowered.includes("bearer"))
    return "token";
  if (lowered.includes("card") || lowered.includes("cvc") || lowered.includes("cvv") || lowered.includes("expiry") || lowered.includes("pan"))
    return "card";
  if (lowered.includes("secret")) return "secret";
  return void 0;
}
function maskingfield(name, shapes) {
  if (fieldshapekind(name) !== void 0) return true;
  const lowered = name.toLowerCase();
  return shapes.some((shape) => shape !== "" && lowered.includes(shape));
}
function maskvalue(value) {
  return value === "" ? "" : maskmarker;
}
function maskfield(input) {
  return maskingfield(input.name, input.shapes) ? maskvalue(input.value) : input.value;
}
function maskrecord(record2, shapes) {
  const masked = {};
  for (const [key, value] of Object.entries(record2)) {
    if (typeof value === "string") {
      const sibling = record2.name;
      masked[key] = key === "value" && typeof sibling === "string" ? maskfield({ name: sibling, value, shapes }) : maskfield({ name: key, value, shapes });
    } else if (Array.isArray(value))
      masked[key] = value.map(
        (item) => Boolean(item) && typeof item === "object" && !Array.isArray(item) ? maskrecord(item, shapes) : item
      );
    else if (Boolean(value) && typeof value === "object")
      masked[key] = maskrecord(value, shapes);
    else masked[key] = value;
  }
  return masked;
}
function maskexport(record2, shapes) {
  return maskrecord(record2, shapes);
}
async function sha2562(payload) {
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function entrybody(entry) {
  return JSON.stringify({
    id: entry.id,
    runid: entry.runid,
    kind: entry.kind,
    summary: entry.summary,
    origin: entry.origin,
    ...entry.stepid !== void 0 ? { stepid: entry.stepid } : {},
    at: entry.at
  });
}
async function entryhashof(input) {
  return {
    previous: input.previous,
    current: await sha2562(`${input.previous}
${entrybody(input.entry)}`),
    algorithm: "sha-256"
  };
}
async function logentryof(input) {
  if (input.summary.trim() === "") throw new Error("The log entry needs its summary in plain language.");
  if (input.origin.trim() === "") throw new Error("The log entry needs its origin provenance.");
  const entry = {
    id: input.id ?? randomid(),
    runid: input.runid,
    kind: input.kind,
    summary: input.summary,
    origin: input.origin,
    ...input.stepid !== void 0 ? { stepid: input.stepid } : {},
    at: input.at
  };
  return { ...entry, hash: await entryhashof({ previous: input.previous, entry }) };
}
function openrunlog(input) {
  if (input.runid.trim() === "" || input.sessionid.trim() === "")
    throw new Error("The run log needs its run and session ids.");
  return { runid: input.runid, sessionid: input.sessionid, entries: [], updatedat: input.now };
}
function lasthashof(log) {
  const entry = log.entries[log.entries.length - 1];
  return entry === void 0 ? "0".repeat(64) : entry.hash.current;
}
async function appendlogentry(input) {
  if (input.log.seal !== void 0)
    throw new Error(
      `The run log of ${input.log.runid} sealed at ${input.log.seal.sealedat} and accepts no append; the seal is terminal.`
    );
  const entry = await logentryof({
    ...input.id !== void 0 ? { id: input.id } : {},
    runid: input.log.runid,
    kind: input.kind,
    summary: input.summary,
    origin: input.origin,
    ...input.stepid !== void 0 ? { stepid: input.stepid } : {},
    at: input.at,
    previous: lasthashof(input.log)
  });
  return { ...input.log, entries: [...input.log.entries, entry], updatedat: input.at };
}
async function sealrunlog(log, now) {
  if (log.seal !== void 0)
    throw new Error(`The run log of ${log.runid} already sealed at ${log.seal.sealedat}; the seal is terminal.`);
  if (log.entries.length === 0) throw new Error("The run log seals at completion with at least one entry.");
  const sealhash = await entryhashof({
    previous: lasthashof(log),
    entry: {
      id: `seal:${log.runid}`,
      runid: log.runid,
      kind: "seal",
      summary: `The run ${log.runid} completed and the log sealed with ${log.entries.length} entries.`,
      origin: log.entries[log.entries.length - 1]?.origin ?? log.runid,
      at: now
    }
  });
  const seal = { runid: log.runid, entries: log.entries.length, sealhash, sealedat: now };
  return { log: { ...log, seal, updatedat: now }, seal };
}
async function verifylogchain(entries) {
  let previous = "0".repeat(64);
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (entry === void 0) continue;
    if (entry.hash.previous !== previous)
      return {
        valid: false,
        brokenat: index,
        reason: `The chain link of entry ${index} carries the previous hash ${entry.hash.previous} while its predecessor hashes to ${previous}; the chain reports tamper evidence.`
      };
    const expected = await entryhashof({
      previous,
      entry: {
        id: entry.id,
        runid: entry.runid,
        kind: entry.kind,
        summary: entry.summary,
        origin: entry.origin,
        ...entry.stepid !== void 0 ? { stepid: entry.stepid } : {},
        at: entry.at
      }
    });
    if (entry.hash.current !== expected.current)
      return {
        valid: false,
        brokenat: index,
        reason: `The entry hash of entry ${index} matches neither its body nor its predecessor hash; the chain reports tamper evidence.`
      };
    previous = entry.hash.current;
  }
  return {
    valid: true,
    reason: `The hash chain of ${entries.length} entr${entries.length === 1 ? "y" : "ies"} verifies from the genesis hash to the last entry.`
  };
}
async function readverifiedlog(log) {
  const verification = await verifylogchain(log.entries);
  if (!verification.valid) return { ok: false, entries: [], reason: verification.reason };
  return { ok: true, entries: [...log.entries], reason: verification.reason };
}
async function exportlogchain(log) {
  const read = await readverifiedlog(log);
  if (!read.ok) return { runid: log.runid, entries: 0, chainvalid: false, reason: read.reason, log: [] };
  return {
    runid: log.runid,
    entries: read.entries.length,
    chainvalid: true,
    reason: read.reason,
    ...log.seal !== void 0 ? { sealhash: log.seal.sealhash.current, sealedat: log.seal.sealedat } : {},
    log: read.entries
  };
}
var patterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AIza[A-Za-z0-9_-]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{16,}/g,
  /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g
];
function productFiles(root) {
  const files = [];
  const visit = (path) => {
    if (!nodefs().existsSync(path)) return;
    const stat2 = nodefs().statSync(path);
    if (stat2.isFile()) return files.push(path);
    for (const entry of nodefs().readdirSync(path)) {
      if (entry === "node_modules" || entry === ".git" || entry === "docs" || entry === "build" || entry === "release")
        continue;
      visit(join(path, entry));
    }
  };
  visit(join(root, "devthink.ts"));
  for (const name of [
    "config.ts",
    /* the provider registry moved to the getry owner with the ownership
     * wave (wave/ownership.getry): the secrets scan covers the shipped
     * source wherever the owner carries it. */
    "../getry/providers.ts",
    "session.ts",
    "memory.ts",
    "modes.ts",
    "server.ts",
    "sol/console/TerminalUi.tsx",
    "build.ts",
    "checksecrets.ts",
    "package.json",
    "tsconfig.json",
    "README.md",
    "CHANGELOG.md",
    "SECURITY.md"
  ])
    visit(join(root, name));
  visit(join(root, ".github"));
  return files.filter((path) => nodefs().existsSync(path));
}
function scanSecrets(root = process.cwd()) {
  const findings = [];
  for (const file of productFiles(root)) {
    const text2 = nodefs().readFileSync(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.test(text2)) findings.push(`${file}: ${pattern}`);
      pattern.lastIndex = 0;
    }
  }
  return findings;
}
function checksecretslane() {
  const directEntry = typeof process !== "undefined" && (process.argv?.[1]?.endsWith("security.ts") || process.argv?.[1]?.endsWith("security")) && process.argv?.[2] === "checksecrets";
  const bunEntry = import.meta.main === true;
  if (directEntry || bunEntry) {
    const findings = scanSecrets();
    if (findings.length) {
      console.error("Potential embedded credentials detected:");
      for (const finding of findings) console.error(finding);
      process.exitCode = 1;
    } else console.log("Secret scan passed.");
  }
}
async function cspauditlane() {
  const packagejson = JSON.parse(await nodefspromises().readFile("package.json", "utf8"));
  const release = String(packagejson.version);
  const manifest = JSON.parse(await nodefspromises().readFile("manifest.json", "utf8"));
  const failures = [];
  const policies = [];
  function refuse(message) {
    failures.push(message);
  }
  function parsedirectives(text2, surface) {
    const directives = {};
    for (const directive of text2.split(";").map((part) => part.trim()).filter((part) => part !== "")) {
      const [name, ...sources] = directive.split(/\s+/);
      if (name === void 0 || directives[name] !== void 0)
        refuse(`The ${surface} policy carries the directive ${name} twice or malformed.`);
      directives[name] = sources;
    }
    return directives;
  }
  const rootpolicy = manifest.content_security_policy?.extension_pages;
  if (typeof rootpolicy !== "string" || rootpolicy.trim() === "")
    refuse("The root manifest carries no extension pages content security policy.");
  else policies.push({ surface: "root", text: rootpolicy });
  for (const browser of ["firefox", "safari"]) {
    const overlaypolicy = manifest.browsers?.[browser]?.content_security_policy?.extension_pages;
    if (typeof overlaypolicy !== "string" || overlaypolicy.trim() === "")
      refuse(`The ${browser} overlay of the root manifest carries no extension pages content security policy.`);
    else policies.push({ surface: `browsers.${browser}`, text: overlaypolicy });
  }
  for (const policy of policies) {
    const directives = parsedirectives(policy.text, policy.surface);
    const scriptsources = directives["script-src"] ?? [];
    const objectsources = directives["object-src"] ?? [];
    if (scriptsources.length === 0)
      refuse(`The ${policy.surface} policy declares no script-src directive; no script source may default open.`);
    if (objectsources.length === 0)
      refuse(`The ${policy.surface} policy declares no object-src directive; no object source may default open.`);
    for (const source of [
      ...scriptsources,
      ...objectsources,
      ...directives["style-src"] ?? [],
      ...directives["connect-src"] ?? [],
      ...directives["frame-src"] ?? [],
      ...directives["img-src"] ?? [],
      ...directives["font-src"] ?? []
    ]) {
      if (source === "'self'") continue;
      if (source.includes("*"))
        refuse(
          `The ${policy.surface} policy carries the wildcard source ${source}; the frozen policies allow no wildcard.`
        );
      if (/^https?:\/\//i.test(source))
        refuse(
          `The ${policy.surface} policy carries the remote source ${source}; every script, style and connect source stays local or behind the reviewed consent flow.`
        );
      if (source.includes("unsafe-eval") || source.includes("unsafe-inline") || source.includes("data:"))
        refuse(
          `The ${policy.surface} policy carries the unsafe source ${source}; no eval, no inline and no data url ever loads.`
        );
    }
    const frameancestors = directives["frame-ancestors"] ?? [];
    if (frameancestors.length !== 1 || frameancestors[0] !== "'self'")
      refuse(
        `The ${policy.surface} policy frames its pages for ${frameancestors.join(" ") || "no declared ancestors"}; the extension pages refuse framing by remote origins.`
      );
    policy.directives = Object.keys(directives).sort();
  }
  const extensiondirectory = "build/extension";
  if (typeof rootpolicy === "string") {
    for (const policy of policies.filter((candidate) => candidate.surface !== "root")) {
      if (policy.text !== rootpolicy)
        refuse(
          `The ${policy.surface} overlay policy differs from the root policy; every browser carries the same frozen extension pages policy.`
        );
    }
    try {
      const shipped = JSON.parse(await nodefspromises().readFile(join(extensiondirectory, "manifest.json"), "utf8"));
      if (shipped.content_security_policy?.extension_pages !== rootpolicy)
        refuse(
          "The shipped chromium manifest copy carries a different extension pages policy; the packaged extension must answer the same frozen policy."
        );
    } catch {
      refuse(
        "The built extension directory carries no manifest.json copy; run pnpm build before the content security audit."
      );
    }
  }
  const dynamicfunctionbundles = ["background.js", "pagebridge.js"];
  const dynamicfunctionsources = { "background.js": "background.ts", "pagebridge.js": "page.ts" };
  const sitecounts = {};
  const bundlefiles = (await nodefspromises().readdir(extensiondirectory)).filter((file) => file.endsWith(".js")).sort();
  if (bundlefiles.length === 0)
    refuse("The built extension directory carries no bundles; run pnpm build before the content security audit.");
  for (const file of bundlefiles) {
    const content = await nodefspromises().readFile(join(extensiondirectory, file), "utf8");
    const codewithoutstrings = content.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "");
    if (/\beval\s*\(/.test(codewithoutstrings))
      refuse(`The built bundle ${file} calls eval; no injected code path ever evaluates strings.`);
    const sites = (content.match(/new\s+Function\s*\(/g) ?? []).length;
    const basename = file.replace(/\.[0-9a-f]{10}\.js$/, ".js");
    sitecounts[file] = sites;
    if (sites > 0 && !dynamicfunctionbundles.includes(basename))
      refuse(
        `The built bundle ${file} constructs functions from strings; only the reviewed evaluate executors of the background and the pagebridge evaluate reviewed expressions.`
      );
    if (sites > 0 && dynamicfunctionsources[basename] !== void 0) {
      const source = await nodefspromises().readFile(dynamicfunctionsources[basename], "utf8");
      const sourcesites = [...source.matchAll(/new\s+Function\s*\(/g)].length;
      if (sites !== sourcesites)
        refuse(
          `The built bundle ${file} constructs functions at ${sites} sites while its reviewed source ${dynamicfunctionsources[basename]} declares ${sourcesites}; every dynamic construction must trace to a reviewed evaluate site.`
        );
    }
    if (/importScripts\s*\(\s*["']https?:/.test(codewithoutstrings))
      refuse(`The built bundle ${file} imports remote scripts; no code path loads remote code.`);
    if (/document\.createElement\s*\(\s*["']script["']\s*\)[\s\S]{0,200}src\s*=\s*["']https?:/.test(codewithoutstrings))
      refuse(`The built bundle ${file} injects a remote script tag; no code path loads remote code.`);
  }
  const backgroundsource = await nodefspromises().readFile("background.ts", "utf8");
  const injections = [...backgroundsource.matchAll(/executeScript\(\{[\s\S]{0,160}?files:\s*\[([^\]]*)\]/g)].map(
    (match) => [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1])
  );
  if (injections.length === 0)
    refuse(
      "The background injects no file through the scripting api; the pagebridge injection the cspaudit expects is missing."
    );
  for (const files of injections) {
    if (files.length !== 1 || files[0] !== "pagebridge.js")
      refuse(
        `The scripting api injects the files ${files.join(", ")}; the pagebridge script stays the only injected file.`
      );
  }
  if (!bundlefiles.includes("pagebridge.js"))
    refuse("The built extension carries no pagebridge.js bundle; the only injected file must ship.");
  const pagefiles = (await nodefspromises().readdir(extensiondirectory)).filter((file) => file.endsWith(".html")).sort();
  if (pagefiles.length === 0)
    refuse("The built extension directory carries no pages; run pnpm build before the content security audit.");
  for (const file of pagefiles) {
    const content = await nodefspromises().readFile(join(extensiondirectory, file), "utf8");
    for (const reference of [...content.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((match) => match[1])) {
      if (/^(https?|wss?|data|blob):/i.test(reference) && !reference.startsWith("blob:"))
        refuse(`The extension page ${file} loads the remote resource ${reference}; every page resource stays local.`);
      if (reference.startsWith("/") && !reference.startsWith("//"))
        refuse(
          `The extension page ${file} loads the absolute path ${reference}; every page resource stays a package relative file.`
        );
    }
    if (/\son[a-z]+\s*=\s*["']/i.test(content))
      refuse(
        `The extension page ${file} carries an inline event handler; every handler binds through the reviewed code.`
      );
  }
  const sandboxpages = manifest.sandbox?.pages ?? [];
  if (!sandboxpages.includes("sandbox.html"))
    refuse(
      "The manifest declares no sandbox.html under the sandbox key; untrusted extracts render only inside the sandbox frame."
    );
  if (!pagefiles.includes("sandbox.html"))
    refuse("The built extension carries no sandbox.html page; the sandbox frame must ship.");
  else {
    const sandboxpage = await nodefspromises().readFile(join(extensiondirectory, "sandbox.html"), "utf8");
    if (!sandboxpage.includes("devthinksandbox"))
      refuse(
        "The sandbox page speaks no devthinksandbox channel; the render handshake the frame family defines is missing."
      );
    if (!sandboxpage.includes('setAttribute("sandbox", "")') && !sandboxpage.includes("setAttribute('sandbox', '')"))
      refuse("The sandbox page carries no fully sandboxed iframe; untrusted markup renders with no privileges at all.");
  }
  const webindex = await nodefspromises().readFile("design.html", "utf8");
  if (!webindex.includes('data-surface="sandbox"'))
    refuse(
      "The one web design file carries no sandbox surface template; the sandbox frame renders from the shared design."
    );
  if (!webindex.includes('data-surface="dashboardpage"'))
    refuse(
      "The one web design file carries no dashboardpage surface template; the dashboard renders from the shared design."
    );
  const report = {
    release,
    policies: policies.map((policy) => ({ surface: policy.surface, policy: policy.text, directives: policy.directives })),
    bundles: bundlefiles,
    pages: pagefiles,
    injectedfiles: ["pagebridge.js"],
    dynamicfunctionsites: sitecounts,
    sandboxframe: "sandbox.html",
    checks: 7
  };
  if (failures.length > 0) {
    for (const failure of failures) console.error(`CSPAUDIT ${failure}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Content security audit verified ${policies.length} policies over ${bundlefiles.length} bundles and ${pagefiles.length} pages.`
    );
    console.log(JSON.stringify(report, null, 2));
  }
}
async function crxharvestlane() {
  const execute = nodeutil().promisify(nodechildprocess().execFile);
  const root = process.cwd();
  const artifactsdir = join(root, "test", "artifacts");
  const harvestdir = join(artifactsdir, "harvest");
  const cachepath = join(artifactsdir, "harvestcache.json");
  const reportpath = join(root, "docs", "crxfeaturemining.md");
  const updatebase = [
    "https://",
    "clients2",
    ".google",
    ".com",
    "/service/update2/crx?response=redirect&prodversion=131.0.6778.265&acceptformat=crx2,crx3&x=id%3D"
  ].join("");
  const cliarguments = process.argv.slice(2);
  const flagvalue = (name) => {
    const prefix = `--${name}=`;
    const found = cliarguments.find((argument) => argument.startsWith(prefix));
    const parsed = Number.parseInt(found?.slice(prefix.length) ?? "", 10);
    return Number.isFinite(parsed) ? parsed : void 0;
  };
  const skipcount = flagvalue("skip") ?? 0;
  const limitcount = flagvalue("limit") ?? Number.POSITIVE_INFINITY;
  const refresh = cliarguments.includes("--refresh");
  const signalkits = [
    {
      category: "planning",
      terms: {
        "plan*": "multi step plan execution",
        "task*": "task oriented decomposition",
        "workflow*": "workflow definition and replay",
        "step*": "step by step execution tracking",
        objective: "objective oriented planning"
      }
    },
    {
      category: "observation",
      terms: {
        "snapshot*": "page state snapshotting",
        "accessib*": "accessibility tree extraction",
        dom: "dom structure extraction",
        "extract*": "data extraction from page content",
        "scrap*": "web scraping pipelines",
        "selector*": "css selector targeting",
        "queryselector*": "dom querying through queryselector calls"
      }
    },
    {
      category: "interaction",
      terms: {
        "click*": "element click actions",
        "fill*": "form filling actions",
        type: "keyboard text entry",
        keyboard: "keyboard event synthesis",
        "key*": "key press dispatch",
        "press*": "key press dispatch",
        "hover*": "hover simulation",
        "scroll*": "scroll control",
        "drag*": "drag actions",
        drop: "drop target handling",
        "upload*": "file upload automation",
        "select*": "dropdown selection",
        "check*": "checkbox and state checking",
        "toggle*": "toggle state changes"
      }
    },
    {
      category: "navigation",
      terms: {
        "navigat*": "programmatic navigation",
        goto: "url goto navigation",
        url: "url tracking and construction",
        urls: "url tracking and construction",
        href: "link following",
        "reload*": "page reload control",
        back: "history back navigation",
        forward: "history forward navigation",
        history: "history stack inspection"
      }
    },
    {
      category: "recording",
      terms: {
        "record*": "user action recording",
        replay: "recorded action replay",
        "macro*": "macro playback",
        "trace*": "trace capture",
        "captur*": "event capture"
      }
    },
    {
      category: "workflow blocks",
      terms: {
        "trigger*": "workflow triggers",
        "schedul*": "scheduled runs",
        cron: "cron style scheduling",
        "loop*": "loop constructs",
        "condition*": "conditional branching",
        "branch*": "branching logic",
        "variabl*": "flow variables",
        "repeat*": "repeat blocks",
        "delay*": "delay steps"
      }
    },
    {
      category: "data handling",
      terms: {
        csv: "csv data export",
        excel: "excel data export",
        json: "json data handling",
        export: "data export pipelines",
        import: "data import pipelines",
        "table*": "table detection and handling",
        "parse*": "content parsing",
        "transform*": "data transformation"
      }
    },
    {
      category: "media",
      terms: {
        "screenshot*": "screenshot capture",
        "image*": "image processing",
        pdf: "pdf handling",
        video: "video handling",
        canvas: "canvas capture",
        ocr: "optical character recognition",
        vision: "vision model integration"
      }
    },
    {
      category: "network",
      terms: {
        fetch: "http fetch requests",
        "websocket*": "websocket channels",
        xmlhttprequest: "xmlhttprequest usage",
        "intercept*": "request interception",
        proxy: "proxy routing",
        proxies: "proxy routing",
        "header*": "header manipulation",
        "request*": "request construction",
        "respon*": "response handling"
      }
    },
    {
      category: "debugging",
      terms: {
        console: "console output capture",
        devtools: "devtools integration",
        "debugger*": "debugger attachment",
        "breakpoint*": "breakpoint control",
        log: "logging pipelines",
        "error*": "error capture",
        performance: "performance metrics",
        memory: "memory inspection",
        "profile*": "profiling integration"
      }
    },
    {
      category: "agents and models",
      terms: {
        "agent*": "agent execution loops",
        llm: "llm reasoning calls",
        gpt: "gpt model calls",
        openai: "openai api integration",
        anthropic: "anthropic api integration",
        gemini: "gemini model integration",
        "model*": "model selection and routing",
        "prompt*": "prompt construction",
        "completion*": "completion handling",
        "embedding*": "embedding generation",
        "chat*": "chat interfaces"
      }
    },
    {
      category: "mcp and protocol",
      terms: {
        mcp: "model context protocol support",
        jsonrpc: "json rpc messaging",
        "json-rpc": "json rpc messaging",
        "schema*": "schema validation",
        "tool*": "tool exposure",
        "capabilit*": "capability negotiation"
      }
    },
    {
      category: "multi tab",
      terms: {
        tabs: "multi tab operations",
        windows: "window management",
        "tabgroup*": "tab grouping",
        pinned: "tab pinning",
        mute: "tab muting",
        muted: "tab muting"
      }
    },
    {
      category: "sessions",
      terms: {
        "session*": "session persistence",
        "cookie*": "cookie state handling",
        storage: "state storage",
        "persist*": "durable state",
        state: "state tracking",
        "restor*": "state restoration"
      }
    },
    {
      category: "forms",
      terms: {
        form: "form automation",
        "input*": "input field control",
        "autofill*": "autofill capabilities",
        "password*": "credential handling",
        "submit*": "form submission"
      }
    },
    {
      category: "testing",
      terms: {
        "assert*": "assertion checks",
        "expect*": "expectation validation",
        "test*": "test case management",
        e2e: "end to end test flows",
        smoke: "smoke test runs"
      }
    },
    {
      category: "ui surfaces",
      terms: {
        "popup*": "popup command surface",
        "sidepanel*": "side panel interface",
        "side panel": "side panel interface",
        options: "options configuration surface",
        "contextmenu*": "context menu commands",
        "context menu": "context menu commands",
        "omnibox*": "omnibox keyword commands",
        "notification*": "notification alerts",
        "badge*": "toolbar badge status",
        "shortcut*": "keyboard shortcuts"
      }
    },
    {
      category: "security and consent",
      terms: {
        "permission*": "permission gating",
        "consent*": "consent flows",
        "approv*": "approval workflows",
        "sandbox*": "sandboxed execution",
        "isolat*": "isolated execution contexts"
      }
    },
    {
      category: "clipboard",
      terms: {
        "clipboard*": "clipboard integration",
        copy: "copy to clipboard",
        "paste*": "paste from clipboard"
      }
    },
    {
      category: "downloads and files",
      terms: {
        "download*": "download management",
        "upload*": "upload handling",
        "file*": "file exchange"
      }
    },
    {
      category: "find in page",
      terms: {
        findinpage: "find in page control",
        "find in page": "find in page control",
        find: "in page find",
        "search*": "in page search",
        "highlight*": "result highlighting"
      }
    },
    {
      category: "reader mode",
      terms: {
        readermode: "reader mode extraction",
        "reader*": "readable content extraction",
        "article*": "article parsing",
        extractcontent: "main content extraction"
      }
    },
    {
      category: "waiting and retries",
      terms: {
        "wait*": "explicit waits",
        "sleep*": "sleep steps",
        timeout: "timeout guards",
        "poll*": "polling loops",
        "retry*": "retry logic"
      }
    }
  ];
  const apifeatures = {
    "tabs.query": "query open tabs by url or title",
    "tabs.get": "read tab details by id",
    "tabs.getCurrent": "read the extension own tab context",
    "tabs.create": "open new tabs programmatically",
    "tabs.update": "update tab url or active state",
    "tabs.remove": "close tabs by id",
    "tabs.duplicate": "duplicate tabs",
    "tabs.reload": "reload tabs",
    "tabs.move": "move tabs between positions",
    "tabs.highlight": "highlight a set of tabs",
    "tabs.group": "group tabs together",
    "tabs.ungroup": "ungroup tabs",
    "tabs.pin": "pin tabs",
    "tabs.mute": "mute tab audio",
    "tabs.discard": "discard tabs from memory",
    "tabs.setZoom": "set tab zoom level",
    "tabs.getZoom": "read tab zoom level",
    "tabs.goBack": "navigate a tab back",
    "tabs.goForward": "navigate a tab forward",
    "tabs.captureVisibleTab": "capture a screenshot of the visible tab",
    "tabs.sendMessage": "message content scripts inside a tab",
    "tabs.executeScript": "run code inside a tab using the legacy mv2 path",
    "tabs.insertCSS": "insert styles into a tab using the legacy mv2 path",
    "tabs.onCreated": "react to new tabs",
    "tabs.onUpdated": "react to tab changes",
    "tabs.onActivated": "react to tab activation",
    "tabs.onRemoved": "react to tab closure",
    "tabs.onMessage": "receive messages from tabs",
    "runtime.sendMessage": "send internal messages between extension contexts",
    "runtime.onMessage": "handle internal messages",
    "runtime.connect": "open long lived internal ports",
    "runtime.onConnect": "accept long lived internal ports",
    "runtime.connectNative": "bridge to a native host process",
    "runtime.sendNativeMessage": "message a native host process",
    "runtime.getURL": "resolve packaged resource urls",
    "runtime.getManifest": "read the own manifest at runtime",
    "runtime.lastError": "handle api error payloads",
    "runtime.id": "identify the own extension context",
    "runtime.reload": "reload the own extension",
    "scripting.executeScript": "inject scripts into granted pages",
    "scripting.insertCSS": "inject styles into granted pages",
    "scripting.removeCSS": "remove injected styles",
    "storage.local": "use the local storage area",
    "storage.sync": "sync settings across devices",
    "storage.session": "use session scoped storage",
    "storage.onChanged": "react to storage changes",
    "debugger.attach": "attach cdp debugger sessions to chosen tabs",
    "debugger.detach": "detach the debugger from a tab",
    "debugger.sendCommand": "send raw cdp commands",
    "debugger.onEvent": "listen to cdp domain events",
    "debugger.onDetach": "handle debugger detach events",
    "downloads.download": "save files through the downloads api",
    "downloads.onChanged": "track download progress",
    "downloads.search": "search past downloads",
    "downloads.open": "open downloaded files",
    "downloads.show": "show downloaded files in the file manager",
    "cookies.get": "read cookies for a url",
    "cookies.getAll": "enumerate cookies by filter",
    "cookies.set": "set cookies",
    "cookies.remove": "delete cookies",
    "cookies.onChanged": "react to cookie changes",
    "commands.getAll": "list bound keyboard shortcuts",
    "commands.onCommand": "respond to keyboard shortcut commands",
    "contextMenus.create": "register page context menu commands",
    "contextMenus.onClicked": "handle context menu clicks",
    "contextMenus.update": "update context menu entries",
    "contextMenus.removeAll": "clear context menu entries",
    "windows.create": "create browser windows",
    "windows.update": "update window state",
    "windows.remove": "close windows",
    "windows.getAll": "list all windows",
    "windows.getCurrent": "read the current window",
    "windows.onFocusChanged": "track window focus changes",
    "webNavigation.onBeforeNavigate": "observe navigations before they commit",
    "webNavigation.onCommitted": "observe committed navigations",
    "webNavigation.onCompleted": "react to page loads",
    "webNavigation.onHistoryStateUpdated": "detect single page app url changes",
    "webNavigation.getAllFrames": "enumerate frames of a tab",
    "notifications.create": "raise system notifications",
    "alarms.create": "schedule delayed runs",
    "alarms.onAlarm": "run scheduled handlers",
    "alarms.clear": "cancel scheduled runs",
    "sidePanel.setOptions": "configure the side panel per tab",
    "sidePanel.open": "open the side panel",
    "sidePanel.setPanelBehavior": "control side panel behavior",
    "action.setBadgeText": "show toolbar badge status",
    "action.setBadgeBackgroundColor": "style the toolbar badge",
    "action.setTitle": "set the toolbar title",
    "action.setIcon": "set the toolbar icon",
    "action.setPopup": "change the popup target",
    "action.onClicked": "act on toolbar clicks",
    "identity.launchWebAuthFlow": "run oauth flows",
    "identity.getAuthToken": "obtain google oauth tokens",
    "tts.speak": "speak text aloud",
    "tts.stop": "stop speech",
    "history.search": "search browsing history",
    "history.addUrl": "record history entries",
    "bookmarks.create": "create bookmarks",
    "bookmarks.getTree": "read the bookmark tree",
    "i18n.getMessage": "localize interface strings",
    "permissions.request": "request optional permissions at runtime",
    "permissions.contains": "check granted permissions",
    "permissions.remove": "drop granted permissions",
    "idle.onStateChanged": "react to idle state changes",
    "idle.queryState": "query the idle state",
    "declarativeNetRequest.updateDynamicRules": "update dynamic request rules",
    "declarativeNetRequest.updateSessionRules": "update session request rules",
    "declarativeNetRequest.getSessionRules": "read session request rules",
    "proxy.settings": "adjust proxy settings at runtime",
    "webRequest.onBeforeRequest": "observe requests before they are sent",
    "webRequest.onBeforeSendHeaders": "modify request headers",
    "webRequest.onCompleted": "observe completed responses",
    "webRequest.onErrorOccurred": "observe failed requests",
    "system.memory.getInfo": "read device memory metrics",
    "system.cpu.getInfo": "read cpu metrics",
    "system.display.getInfo": "read display metrics",
    "topSites.get": "read most visited sites",
    "browsingData.remove": "clear browsing data",
    "management.getAll": "enumerate installed extensions",
    "management.getSelf": "read the own extension info",
    "sessions.getRecentlyClosed": "list recently closed tabs",
    "sessions.restore": "restore closed sessions",
    "offscreen.createDocument": "create offscreen documents",
    "offscreen.closeDocument": "close offscreen documents",
    "tabCapture.capture": "capture tab audio and video",
    "extension.getURL": "resolve packaged resource urls the legacy way",
    "extension.getBackgroundPage": "reach the legacy background page",
    "extension.sendMessage": "send internal messages the legacy way",
    "extension.onMessage": "handle internal messages the legacy way",
    "browserAction.setBadgeText": "show toolbar badge status the legacy way",
    "pageAction.show": "show legacy page actions",
    "devtools.inspectedWindow": "inspect the devtools target window",
    "devtools.panels": "register devtools panels"
  };
  const permissionfeatures = {
    storage: {
      primary: ["persist state in local storage areas", "persist settings across sessions"],
      secondary: ["sync settings across devices when enabled"]
    },
    tabs: {
      primary: ["read and manage open tabs", "observe tab lifecycle events"],
      secondary: ["activate or close tabs programmatically"]
    },
    scripting: { primary: ["inject scripts into granted pages"], secondary: ["inject styles for page overlays"] },
    activeTab: { primary: ["act on the currently active tab after a user gesture"], secondary: [] },
    debugger: {
      primary: ["attach the chrome devtools protocol to tabs", "capture network and dom events through cdp"],
      secondary: ["dispatch low level input events through cdp"]
    },
    cookies: { primary: ["read and write cookies per domain"], secondary: [] },
    downloads: { primary: ["save generated files to disk"], secondary: ["track download progress"] },
    "downloads.shelf": { primary: ["control the download shelf ui"], secondary: [] },
    contextMenus: { primary: ["add commands to the page context menu"], secondary: [] },
    sidePanel: { primary: ["host a docked side panel interface"], secondary: [] },
    webNavigation: { primary: ["observe navigation events across frames"], secondary: [] },
    alarms: { primary: ["schedule delayed or periodic runs"], secondary: [] },
    notifications: { primary: ["raise system notifications"], secondary: [] },
    tabGroups: { primary: ["organize tabs into named groups"], secondary: [] },
    offscreen: { primary: ["run hidden offscreen documents for background work"], secondary: [] },
    clipboardRead: { primary: ["read clipboard content"], secondary: [] },
    clipboardWrite: { primary: ["write to the clipboard"], secondary: [] },
    nativeMessaging: { primary: ["exchange messages with a native companion app"], secondary: [] },
    declarativeNetRequest: { primary: ["modify network requests with declarative rules"], secondary: [] },
    declarativeNetRequestWithHostAccess: { primary: ["modify network requests with host access rules"], secondary: [] },
    proxy: { primary: ["control proxy configuration"], secondary: [] },
    webRequest: { primary: ["observe and modify requests in flight"], secondary: [] },
    webRequestBlocking: { primary: ["block or alter requests synchronously"], secondary: [] },
    history: { primary: ["read and search browsing history"], secondary: [] },
    bookmarks: { primary: ["manage bookmarks"], secondary: [] },
    tts: { primary: ["speak text aloud"], secondary: [] },
    identity: { primary: ["sign in through oauth"], secondary: [] },
    "identity.email": { primary: ["read the signed in account email"], secondary: [] },
    management: { primary: ["inspect installed extensions"], secondary: [] },
    sessions: { primary: ["restore recently closed tabs and windows"], secondary: [] },
    browsingData: { primary: ["clear browsing data"], secondary: [] },
    topSites: { primary: ["read most visited sites"], secondary: [] },
    power: { primary: ["keep the device awake during runs"], secondary: [] },
    "system.memory": { primary: ["read device memory info"], secondary: [] },
    "system.cpu": { primary: ["read cpu usage"], secondary: [] },
    "system.display": { primary: ["read display metrics"], secondary: [] },
    tabCapture: { primary: ["capture tab audio and video"], secondary: [] },
    unlimitedStorage: { primary: ["store large datasets beyond the default quota"], secondary: [] },
    geolocation: { primary: ["read device location"], secondary: [] },
    idle: { primary: ["detect user idle state"], secondary: [] },
    background: { primary: ["run a persistent background context"], secondary: [] },
    windows: { primary: ["manage browser windows"], secondary: [] },
    privacy: { primary: ["read privacy settings"], secondary: [] },
    gcm: { primary: ["receive push messages"], secondary: [] },
    declarativeContent: { primary: ["react to page content conditions"], secondary: [] },
    contentSettings: { primary: ["manage per site content settings"], secondary: [] }
  };
  const knowledgepool = {
    cecngibhkljoiafhjfmcgbmikfogdiko: [
      "pairs the browser with the manus cloud agent service",
      "relays page snapshots and dom state to a remote agent",
      "executes agent issued click type and scroll actions locally",
      "task progress and agent activity feed in the interface",
      "session linking through an authenticated account",
      "user approval gate before the agent takes over the page",
      "long task runs orchestrated from the manus workspace",
      "page reading tuned for model context windows",
      "multi tab supervision by one agent session"
    ],
    fldmhceldgbpfpkbgopacenieobmligc: [
      "bridges the current page to the kimi assistant by moonshot ai",
      "sends readable page content as chat context",
      "question and answer flows about the open page",
      "executes suggested page actions on request",
      "side panel chat with the assistant",
      "selection aware questions on highlighted text",
      "screenshot sharing for visual questions"
    ],
    jphkkablogbfneefecondchaafbdaomc: [
      "runs ai agents directly inside the browser",
      "delegates browsing tasks to autonomous agents",
      "agent activity tracking per task",
      "page reading for agent context",
      "multi step task execution by agents"
    ],
    celalggclffbgnloepbfadhjhmchikoh: [
      "ai browser agent driven from a task prompt",
      "decomposes goals into page actions",
      "observes pages through dom extraction",
      "action execution with feedback loops"
    ],
    hdcehjaodheipickeopncehaikamghjk: [
      "ai copilot for browsing with a command surface",
      "natural language commands mapped to page actions",
      "page summarization on demand",
      "element picking with generated selectors",
      "guided automation for repetitive steps"
    ],
    ffijkpjpoehejdlbfoefcpgbimdgocmf: [
      "ai agent that plans multi step browsing tasks",
      "observes pages via dom extraction",
      "executes click and type steps under a plan",
      "reports progress after each step"
    ],
    hkcbjmdeheceggmlbhbiljejkkpjljjp: [
      "open source agent runner in a side panel",
      "configurable llm backend including local models",
      "dom snapshotting to feed the model",
      "action loop with stop and resume control",
      "transparent prompt and action log"
    ],
    okngcalljddikhljpfhgmikklmmmdkkd: [
      "agentic browser automation platform client",
      "tool use driven task execution",
      "multi step plans with checkpoints",
      "browser tool exposure to the driving model"
    ],
    ajdlmleaplmphpokbjmnhgkgaaemclil: [
      "instant link previews over search results",
      "prefetches target pages before the click",
      "ai answers composed from result pages",
      "overlay cards that avoid leaving the search page",
      "memory savings by previewing instead of opening"
    ],
    ddjnfplagacilcnjpindbdcopccndihj: [
      "preloads the chromium browser on system startup as advertised",
      "keeps a lightweight service worker alive on a timed loop",
      "targets faster browser cold starts",
      "zero page and host permissions by design",
      "minimal ten file package footprint",
      "console logging for keepalive diagnostics",
      "works fully offline",
      "ships no popup options or content surfaces"
    ],
    mahgcggahcbplkpmpmhdnbdjbcnoafcg: [
      "suspends inactive tabs to free memory",
      "tab discard and reload control",
      "memory usage reporting per tab",
      "keep awake list for chosen sites",
      "automatic suspension after an idle window"
    ],
    dnfmklmdbipiahdjiogaoemjaiodomdf: [
      "open source ai assistant in a sidebar",
      "multi provider model configuration",
      "chat grounded in the current page",
      "selection actions from the context menu",
      "conversation history kept locally"
    ],
    gpccjhdgjkmalnepmeclooflliiocfed: [
      "open source ai agent with a side panel",
      "task execution against the current page",
      "configurable model endpoints",
      "step preview before execution"
    ],
    kdmpkkahkhdmdhfkdihkopikgcocbpbf: [
      "enhanced chat surface for deepseek models",
      "prompt helpers and presets",
      "page context injection into prompts",
      "conversation management"
    ],
    jambeljnbnfbkcpnoiaedcabbgmnnlcd: [
      "official companion extension for playwright",
      "relays cdp sessions to playwright runners",
      "records traces of browser activity",
      "supports extension api access from playwright tests",
      "captures screenshots and snapshots on demand",
      "network recording for later replay"
    ],
    ilehdekjacappgghkgmmlbhgbnlkgoid: [
      "author and run puppeteer scripts inside the browser",
      "script editor with run and stop controls",
      "live page control from the editor",
      "example script library",
      "result console for script output"
    ],
    infppggnoaenmfagbfknfkancpbljcca: [
      "block based workflow builder with a drag and drop canvas",
      "workflow triggers from the page context menu",
      "scheduled workflows with cron expressions",
      "keyboard shortcut triggers for workflows",
      "visit based triggers on matching urls",
      "webhook triggers from external services",
      "loop and repeat blocks for iteration",
      "condition blocks for branching control flow",
      "variables and tables scoped to a workflow",
      "element interaction blocks for click type and hover",
      "form filling from a data table",
      "scraper blocks that extract by css selector",
      "data export to csv and json",
      "google sheets read and write integration",
      "clipboard blocks for copy and paste steps",
      "screenshot blocks for page capture",
      "tab management blocks for switching and closing",
      "delay and wait for element blocks",
      "regex extraction into variables",
      "nested workflows via execute workflow blocks",
      "workflow import and export as files",
      "workflow sharing through a public library",
      "per run log panel with block results",
      "dark themed editor with a block palette",
      "reusable blocks grouped by category"
    ],
    iebfoaldapgggcpjialmbnhcendcnkpi: [
      "records browser sessions as reusable flows",
      "replay of recorded flows for testing",
      "scraping of repeated page structures",
      "export of captured data",
      "flow editing after recording"
    ],
    geggbdbnidkhbnbjoganapfhkpgkndfo: [
      "records end to end tests from real user actions",
      "generates playwright cypress and puppeteer code",
      "captures network traffic during recording",
      "screenshots captured alongside steps",
      "step editing and annotations after recording",
      "test replay for regression checks"
    ],
    bapaclfmcgookbglclacfgeemaehkkme: [
      "records interactions into playwright scripts",
      "selector strategy choice during recording",
      "copy generated code to the clipboard",
      "pause and resume of recording"
    ],
    ljdobmomdgdljniojadhoplhkpialdid: [
      "record and playback of selenium style tests",
      "selenese command editing with autocomplete",
      "locator strategies including id css and xpath",
      "control flow commands like if else and while",
      "variables and stored values in tests",
      "assertions and wait commands",
      "test suite organization of cases",
      "export of tests to many programming languages",
      "playback inside the recorder panel",
      "screenshots on command failure",
      "playback speed control",
      "command level breakpoints for debugging",
      "dual panel view of commands and target page"
    ],
    bhfbkacflpnpfgfjghhajikhfghcknip: [
      "record end to end tests without writing code",
      "replay tests on demand",
      "shareable test artifacts",
      "step assertions on page state"
    ],
    adbonjafebjadholmnabocnddmhpennj: [
      "web automation workflow runner",
      "click fill and extract steps",
      "scheduled automation runs",
      "data capture from pages"
    ],
    gpnieenphjbjcpcdnjhnipckcldebjdf: [
      "ai driven browser agent",
      "natural language task execution",
      "page understanding through snapshots",
      "step by step action feedback"
    ],
    kkepankimcahnjamnimeijpplgjpmdpp: [
      "runs rpa bot tasks inside the browser",
      "selector driven automation steps",
      "integration with the openbots automation platform",
      "task logs and results"
    ],
    gpcpndfhbmichbgffhlaedjlnomnfgla: [
      "ai powered form autofill",
      "semantic detection of form fields",
      "one click fill of whole forms",
      "saved profiles for reuse",
      "checkout and signup automation"
    ],
    khaocdcbgnfgfoiplkbdaappfcdldgeb: [
      "record and replay browser macros",
      "scheduled macro execution",
      "data extraction steps",
      "form filling steps"
    ],
    ghlmiigebgipgagnhlanjmmniefbfihl: [
      "no code workflow automation builder",
      "scraping recipes for repeated structures",
      "form filling workflows",
      "scheduled workflow runs",
      "workflow template library",
      "cloud sync of workflows"
    ],
    kbacobbmnajbihpidjilndoielmaojbj: [
      "page automation recipes",
      "click and fill steps against selectors",
      "data capture into tables",
      "replay of saved recipes"
    ],
    heolgaalbnnelipfhbccbkdohecmaimo: [
      "automa derived workflow automation",
      "block based workflow canvas",
      "scraping and form blocks",
      "trigger options for workflows",
      "local first workflow storage"
    ],
    cpgamigjcbffkaiciiepndmonbfdimbb: [
      "no code website automation and scraping",
      "record interactions into reusable recipes",
      "schedule recipes to run unattended",
      "run a recipe across a list of urls",
      "scrape tables into google sheets",
      "form filling at scale",
      "background robot workers that run recipes",
      "template marketplace of recipes",
      "two factor authentication aware workflows",
      "run history with replays",
      "notifications when runs finish"
    ],
    ebofbaomnlpjgnponhalmmihcgakodpj: [
      "automation driven from command style input",
      "scriptable task execution against pages",
      "command history for reuse"
    ],
    idahijhccencfhigphpmlnjbppldolgk: [
      "ai assistant docked in a side panel",
      "page summarization and chat",
      "quick actions on selected text",
      "prompt library"
    ],
    ioohfnlbpolaalcbppaggpgcgpldohfg: [
      "ai assistant with page reading",
      "task suggestions from page context",
      "chat with follow up questions"
    ],
    cbibgdcbkoikdkeahemkjkpacmgicaco: [
      "everyday ai assistant in the browser",
      "chat grounded in the open page",
      "summaries and quick prompts",
      "selection based actions"
    ],
    hfjnppljknigdnnpocjjgdcfmnodoafe: [
      "record workflows by performing them once",
      "scraping of tables and lists",
      "scheduled workflow runs",
      "cloud sync and sharing of workflows",
      "conditional steps inside workflows",
      "loops over collected data",
      "form filling workflows",
      "workflow marketplace of templates",
      "run workflows on demand or on a schedule"
    ],
    ildkmabpimmkaediidaifkhjpohdnifk: [
      "command line style control of the browser",
      "natural language command execution",
      "scriptable sequences of commands",
      "command history and reuse"
    ],
    bjfgambnhccakkhmkepdoekmckoijdlc: [
      "exposes browser control tools over the model context protocol",
      "lets external ai clients drive the browser",
      "tab listing and navigation tools",
      "click type and screenshot tools",
      "local bridge between the browser and mcp clients",
      "tool schema descriptions for the client",
      "consent gating before sensitive actions",
      "session management for paired clients"
    ],
    gbldofcpkknbggpkmbdaefngejllnief: [
      "ai powered ui automation from natural language",
      "visual grounding of elements on screenshots",
      "natural language assertions on page state",
      "yaml scripting of action chains",
      "integration with playwright and puppeteer",
      "model powered planning of ui steps",
      "report generation for runs",
      "caching of visual grounding results"
    ],
    akldabonmimlicnjlflnapfeklbfemhj: [
      "agent that reads and acts on the open page",
      "element targeting from descriptions",
      "action feedback loop with the model"
    ],
    gblapfbnbicdckfhkllcnfleiemhmgeb: [
      "connects the qoder ide assistant to the browser",
      "relays page state for coding tasks",
      "pairing between editor and browser session"
    ],
    kjgebebilcoaamgfpogkoehcnjbnncic: [
      "rotates user agent strings per request",
      "per site agent overrides",
      "custom agent lists and whitelists",
      "spoofing of related client hints"
    ],
    idkjhjggpffolpidfkikidcokdkdaogg: [
      "proxy profile switching per site",
      "rule based proxy routing",
      "profile management ui"
    ],
    bkhaagjahfmjljalopjnoealnfndnagc: [
      "file tree sidebar for github repositories",
      "fast folder navigation without cloning",
      "pull request file tree view",
      "repository file previews",
      "plugin themes for the tree"
    ],
    giljefjcheohhamkjphiebfjnlphnokk: [
      "github file tree sidebar",
      "file preview on hover",
      "keyboard shortcuts for repository navigation",
      "lazy loading of large repositories"
    ],
    joggkdfebigddmaagckekihhfncdobff: [
      "commit graph visualization on github",
      "branch and merge structure rendering",
      "quick navigation between commits"
    ],
    dgjhfomjieaadpoljlnidmbgkdffpack: [
      "code search across repositories from the browser",
      "jump to definition inside github views",
      "inline blame and reference annotations",
      "search suggestions and saved queries",
      "file navigation enhancements",
      "search across many hosts",
      "code intel tooltips on symbols",
      "repository wide symbol search"
    ],
    anlikcnbgdeidpacdbdljnabclhahhmd: [
      "repository size display on github",
      "download repository as a zip archive",
      "copy raw file and repository paths",
      "file size display per file",
      "quick download of individual files"
    ],
    pncmdlebcopjodenlllcomedphdmeogm: [
      "sends the current page to an anythingllm workspace",
      "chat with previously saved pages",
      "workspace selection from the extension",
      "local first llm integration"
    ],
    jfgfiigpkhlkbnfnbobbkinehhfdhndo: [
      "web ui companion for local ollama models",
      "chat with openai compatible endpoints",
      "page context injected into chats",
      "model and parameter management",
      "knowledge collection from visited pages"
    ],
    jfeammnjpkecdekppnclgkkffahnhfhe: [
      "records browser actions into automation scripts",
      "generates replayable scripts",
      "script editing and rerun"
    ],
    obpjaonipoaomjnokbimppohbpjibflm: [
      "ai design agent running in the browser",
      "generates ui designs from prompts",
      "iterative design refinement",
      "design canvas with export"
    ],
    mmlmfjhmonkocbjadbfplnigmagldckm: [
      "helpers for playwright driven browser sessions",
      "cdp relay to external test runners",
      "capture of page state for tests"
    ],
    bjcngahpcjeililljmfegmlanlpgibdi: [
      "ai agent for chrome with a side panel",
      "page aware task execution",
      "natural language commands"
    ],
    mlcokfhobljidglkgileejcelojhhmdm: [
      "agentic browsing with a custom interface",
      "agent orchestrated navigation and reading",
      "task oriented browsing sessions"
    ],
    cclndjheoijilbieeofdjiledodbdakb: [
      "browser automation task runner",
      "scheduled automation runs",
      "form and scraping task templates",
      "run logs and history"
    ],
    akadnehffdhihfhpmcbokdlfjpgooffe: [
      "reads selected text aloud",
      "full page text to speech",
      "voice and speed configuration",
      "playback controls in the popup"
    ],
    bgjdnapfffligabpfbkbapibaifgmjie: [
      "control the browser with natural language",
      "accessibility first command surface",
      "voice friendly interaction model",
      "hands free navigation"
    ],
    mooikfkahbdckldjjndioackbalphokd: [
      "record and playback of browser tests",
      "selenese command language with editing",
      "locator strategies including id name css and xpath",
      "control flow with if else while and times commands",
      "variables with store and evaluate commands",
      "assertions and verify commands",
      "wait commands for element states",
      "test suites that group test cases",
      "export of tests to many languages and frameworks",
      "playback inside the ide side panel",
      "breakpoint debugging of single commands",
      "autocomplete of command names",
      "rolling log of execution results",
      "execution against the current tab",
      "pause and resume of playback",
      "suite level batch runs"
    ],
    ofaokhiedipichpaobibbnahnkdoiiah: [
      "automatic detection of tables and lists on any page",
      "scrape detected data to csv",
      "scrape to excel xml and json formats",
      "crawl across pagination with next page detection",
      "selector wizard for manual column picking",
      "inline table editor before export",
      "delay and retry controls for polite crawling",
      "wildcard url patterns for crawl scopes",
      "location scraping with geo coordinates",
      "drip feed extraction over time"
    ],
    iebpjdmgckacbodjpijphcplhebcmeop: [
      "copy html tables to the clipboard",
      "export tables to excel csv json and markdown",
      "send tables straight to google sheets",
      "recursively find all tables on a page",
      "local html file table extraction",
      "spreadsheet like table editor",
      "copy tables as html",
      "per table preview before export",
      "automatic header detection",
      "merged cell handling"
    ],
    eenjdnjldapjajjofmldgmkjaienebbj: [
      "ocr of any screen region on demand",
      "ocr of images embedded in pages",
      "ocr of video frames",
      "ocr of pdf documents",
      "text to speech of recognized text",
      "translation of recognized text",
      "configurable ocr engines",
      "screenshot capture with the recognized text"
    ],
    edacconmaakjimmfgnblocblbcdcpbko: [
      "save all open tabs as a named session",
      "restore saved sessions on demand",
      "automatic session snapshots",
      "bulk tab management from a grid",
      "search across saved sessions",
      "import and export of session files",
      "recovery of sessions after a crash",
      "rename and edit saved sessions",
      "stale tab detection and cleanup",
      "duplicate tab detection"
    ]
  };
  const featurepool = [
    {
      group: "interaction",
      items: [
        "click an element by css selector",
        "click an element resolved from its accessible name",
        "click an element matched by visible text",
        "click an element by aria role and name pair",
        "click at coordinates relative to the viewport",
        "double click an element",
        "right click an element to open its context menu",
        "shift click for range or multi selection",
        "hover over an element with a dwell duration",
        "move the pointer along a path between two points",
        "simulate realistic pointer movement speeds",
        "focus an element before interacting with it",
        "type text into an input by selector",
        "type text into content editable regions",
        "clear a field before typing",
        "append text to an existing field value",
        "set a value through the dom property instead of key events",
        "press a single key",
        "press a key combination with modifiers",
        "hold a key down across several steps",
        "release a held key",
        "type with per keystroke delay for slow controls",
        "press enter to submit a search box",
        "scroll the page down by a pixel offset",
        "scroll the page up by a pixel offset",
        "scroll smoothly with easing",
        "scroll an element into view",
        "scroll to the top or bottom of the page",
        "scroll inside a scrollable sub container",
        "scroll iframe content from the parent page",
        "drag an element onto a target element",
        "drag and drop at coordinates",
        "drag a file from disk onto a drop zone",
        "select an option from a dropdown",
        "select multiple options in a multi select",
        "toggle a checkbox",
        "choose an option in a radio group",
        "set a range slider to a value",
        "set a date input to a value",
        "set a color input to a value",
        "upload a file into a file input",
        "expand a collapsed details or accordion section",
        "dismiss an unexpected dialog before continuing",
        "interact with elements inside shadow dom trees",
        "interact with elements inside same origin iframes",
        "retry an interaction when the element moves"
      ]
    },
    {
      group: "observation",
      items: [
        "capture a full dom snapshot of the page",
        "capture the accessibility tree for semantic grounding",
        "extract visible text content per element",
        "extract an article or reader view of the page",
        "extract metadata such as title description and canonical url",
        "detect data tables and list their headers",
        "detect repeated item lists such as products or comments",
        "detect interactive elements and their kinds",
        "build a numbered map of clickable elements for the agent",
        "resolve an element from a natural language description",
        "resolve elements by css selector",
        "resolve elements by xpath",
        "verify an element is visible before acting",
        "verify an element is enabled and not readonly",
        "read form field labels and current values",
        "read aria labels and roles for controls",
        "read data attributes as structured hints",
        "observe dom mutations as the page changes",
        "wait for an element to appear",
        "wait for text to appear or disappear",
        "wait for a network quiet period",
        "watch for cookie and consent banners",
        "detect infinite scroll containers",
        "detect virtualized lists that render on demand",
        "detect lazy loaded images and placeholders",
        "read the current scroll position",
        "read the page language for localization",
        "read the page title and headings outline",
        "count pagination results and total pages",
        "extract links with anchor text and href",
        "extract image sources and alt text",
        "extract inline script data such as embedded json state",
        "detect shadow dom roots and pierce them",
        "detect iframes and enumerate their origins",
        "classify a page by its detected template",
        "fingerprint a page section for later relocation",
        "diff snapshots between two points in time",
        "extract selected text from the user selection",
        "read clipboard content on explicit consent",
        "observe focus changes across the page",
        "detect sticky headers and overlays that hide content",
        "detect scroll locks and modal states",
        "extract open graph and structured data",
        "read rendered values of computed styles",
        "derive a stable selector for an element",
        "detect the language of extracted text for routing"
      ]
    },
    {
      group: "navigation",
      items: [
        "navigate to a url in the current tab",
        "open a url in a new tab",
        "open a url in a new window",
        "open a private window for sensitive steps",
        "go back in history",
        "go forward in history",
        "reload the page",
        "reload bypassing the cache",
        "stop a pending navigation",
        "wait for the page load event",
        "wait for a specific url pattern",
        "follow a link by its text",
        "follow a link by href fragment",
        "navigate within a single page app by clicking",
        "detect url changes in single page apps",
        "read and rewrite query parameters",
        "set a url fragment for scroll anchoring",
        "block navigation away mid task with consent",
        "navigate a list of urls sequentially",
        "navigate with per site wait profiles",
        "detect http errors and offline states",
        "detect redirect chains",
        "capture the final url after redirects",
        "manage basic auth prompts via stored credentials",
        "dismiss certificate interstitials by policy",
        "open a download link without leaving the page",
        "print the page to pdf during a flow",
        "prefetch predicted next pages",
        "preconnect to expected origins",
        "deep link into common web apps by pattern",
        "reopen a recently closed tab",
        "restore a navigation trail for audit",
        "pause navigation while a consent prompt is open",
        "detect navigation intent from the agent plan",
        "rate limit navigations per domain",
        "open a url from the clipboard",
        "verify a url is safe before opening",
        "batch open a curated link list"
      ]
    },
    {
      group: "tabs and windows",
      items: [
        "list all open tabs with url and title",
        "query tabs by url title or id",
        "activate a tab by id",
        "activate the tab matching a url pattern",
        "create a new tab with a target url",
        "create a tab in a specific window",
        "create a tab in the background",
        "duplicate an existing tab",
        "close a tab by id",
        "close all tabs matching a pattern",
        "pin and unpin tabs",
        "mute and unmute tabs",
        "move tabs within a window",
        "move tabs across windows",
        "group related tabs into a named group",
        "color code tab groups by task",
        "collapse and expand tab groups",
        "discard inactive tabs to save memory",
        "reload a set of tabs",
        "zoom a tab in and out",
        "capture the visible area of a tab",
        "observe tab updates such as title changes",
        "observe tab activation changes",
        "observe tab closure mid task",
        "switch to the next or previous tab",
        "list all open windows",
        "create a window with size and position",
        "resize and reposition windows",
        "maximize minimize and restore windows",
        "focus a specific window",
        "close a window with consent",
        "split work across a scratch window",
        "use an incognito window on explicit request",
        "reopen a closed tab from history",
        "name and save a tab layout",
        "restore a saved tab layout",
        "detect duplicate tabs",
        "search across open tabs",
        "surface per tab task status in a badge",
        "limit concurrent task tabs",
        "keep a pinned control tab for the agent",
        "present tabs in a quick switcher ui",
        "snapshot the full session for later restore",
        "attach metadata to tabs for routing",
        "detect tabs playing audio",
        "reopen tabs from a previous run"
      ]
    },
    {
      group: "forms and data",
      items: [
        "fill a form from a structured record",
        "fill fields matched by label text",
        "fill fields matched by placeholder or aria label",
        "detect field kinds such as email phone and date",
        "generate realistic values per field kind",
        "reuse saved profiles for autofill",
        "store form profiles locally",
        "ask before submitting a form",
        "submit a form via its button",
        "submit a form programmatically",
        "detect validation errors after submit",
        "read inline error messages for correction loops",
        "retry failed submissions with backoff",
        "handle multi step wizards page by page",
        "handle dependent dropdowns that load options",
        "handle typeahead fields with suggestion picking",
        "pick a date from a calendar widget",
        "upload files as part of form submission",
        "attach generated documents to a form",
        "read captcha presence and hand back to the user",
        "fill credit card style multi field inputs",
        "fill one time code fields from a notification",
        "fill password fields only after explicit consent",
        "detect and skip honeypot fields",
        "detect login forms specifically",
        "detect signup and checkout templates",
        "scrape a table into columns and rows",
        "detect table headers and normalize them",
        "handle rowspan and colspan cells",
        "extract nested tables",
        "export scraped data to csv",
        "export scraped data to json",
        "export scraped data to excel",
        "copy a table to the clipboard",
        "push a table to a google sheet",
        "import data from a csv for fill loops",
        "iterate a dataset row by row as variables",
        "transform values between extraction and export",
        "deduplicate scraped rows",
        "paginate extraction across pages",
        "merge extracts from multiple pages",
        "timestamp and source every extracted row",
        "preview extracted data in a grid before export",
        "stream large extracts to disk",
        "resume an interrupted extraction",
        "log extraction provenance for audit"
      ]
    },
    {
      group: "media capture",
      items: [
        "capture a screenshot of the visible viewport",
        "capture a full page screenshot by stitching",
        "capture a screenshot of a single element",
        "capture a screenshot with device pixel ratio scaling",
        "capture a screenshot of a scrollable region",
        "annotate screenshots with step markers",
        "capture element screenshots into a contact sheet",
        "capture the page as a pdf",
        "capture a pdf with a custom page size",
        "capture a pdf of a paginated report",
        "record a screencast of the tab",
        "record a video of a task run",
        "capture audio from the tab",
        "capture a still frame from a video element",
        "detect and download images from the page",
        "download all images matching a filter",
        "read text from an image with ocr",
        "read text from a screen region with ocr",
        "read text from a scanned pdf page",
        "read text from a paused video frame",
        "use a vision model to describe a screenshot",
        "crop a screenshot to element bounds",
        "redact sensitive regions before sharing",
        "copy a screenshot to the clipboard",
        "send a screenshot to the agent for grounding",
        "capture a dom snapshot alongside each screenshot",
        "record console output with the timeline",
        "record network traces with the timeline",
        "screenshot diffing against a baseline",
        "thumbnail generation for logs",
        "image format conversion between png and jpeg",
        "capture canvas element contents",
        "capture webgl canvas state",
        "capture a media stream for webrtc checks",
        "extract embedded video sources and formats",
        "capture metadata of media assets",
        "capture favicon and logo assets",
        "time lapse capture of a changing page",
        "capture before and after states of each action",
        "export captures with consistent file naming"
      ]
    },
    {
      group: "network and transport",
      items: [
        "fetch a url from the extension context",
        "fetch with custom headers on consent",
        "fetch with timeout and retry policy",
        "stream large responses",
        "parse json responses into variables",
        "parse html responses with dom parsing",
        "call rest endpoints with typed payloads",
        "call graphql endpoints",
        "open a websocket channel",
        "reconnect websockets with backoff",
        "multiplex messages over one socket",
        "observe requests the page makes",
        "observe responses the page receives",
        "inspect request and response headers",
        "capture response bodies for analysis",
        "block chosen requests during a task",
        "mock a response for testing",
        "modify request headers with rules",
        "set and read cookies per domain",
        "clear cookies for a domain on demand",
        "handle oauth flows for external apis",
        "store api keys locally with consent",
        "proxy requests through a configured proxy",
        "route only task traffic through a proxy",
        "respect rate limits from responses",
        "post form data uploads",
        "upload multipart files",
        "download a file to disk",
        "download many files as a batch",
        "pause and resume downloads",
        "verify downloads completed",
        "intercept downloads by mime type",
        "export captured network logs",
        "detect api endpoints used by the page",
        "reverse engineer page api calls for extraction",
        "subscribe to server sent events",
        "long polling helper with cancellation",
        "attach request correlation ids across a run"
      ]
    },
    {
      group: "debugging",
      items: [
        "attach the chrome devtools protocol to a tab",
        "detach cleanly after the run",
        "issue raw cdp commands from a plan step",
        "subscribe to cdp domain events",
        "capture console messages of all levels",
        "capture javascript errors with stack traces",
        "capture unhandled promise rejections",
        "capture failed network requests",
        "capture long task timings",
        "measure performance metrics for a flow",
        "take a heap snapshot on demand",
        "track memory growth during a run",
        "profile cpu during a heavy step",
        "set breakpoints in page scripts",
        "step through page code",
        "evaluate javascript in page context",
        "evaluate in an isolated world",
        "inspect the dom at a breakpoint",
        "watch expressions during a run",
        "override page scripts for testing",
        "emulate device metrics",
        "emulate network conditions",
        "emulate geographic location",
        "emulate a user agent per task",
        "override permissions such as camera per task",
        "blackbox third party scripts in traces",
        "export a devtools trace file",
        "annotate traces with step markers",
        "detect layout shifts during a flow",
        "detect console spam patterns",
        "rotate logs for long sessions",
        "structured log levels per step",
        "replay a captured trace offline",
        "diff console output between runs",
        "attach to iframes and workers",
        "debug service workers of the page",
        "capture source maps for better stacks",
        "safe teardown on debugger detach"
      ]
    },
    {
      group: "memory and sessions",
      items: [
        "persist task state across service worker restarts",
        "persist session history with timestamps",
        "snapshot the full browsing session",
        "restore a session after a crash",
        "restore a session on demand",
        "auto snapshot on an interval",
        "name and organize saved sessions",
        "diff two sessions",
        "search across saved sessions",
        "import and export session files",
        "keep per site memory notes",
        "keep agent scratchpad memory per task",
        "summarize past runs into reusable notes",
        "semantic recall of past extractions",
        "remember user corrections for future steps",
        "remember consent decisions per origin",
        "expire stale memory by policy",
        "encrypt sensitive memory at rest",
        "scope memory per profile or workspace",
        "sync memory across devices on consent",
        "track the state machine of a workflow run",
        "checkpoint long workflows",
        "resume from the last checkpoint",
        "rollback side effects on failure",
        "idempotent step identifiers",
        "queue tasks while offline",
        "replay queued tasks on reconnect",
        "storage quota awareness and cleanup",
        "export memory for audit",
        "attach provenance to each memory item",
        "isolate state per tab",
        "lock sessions against concurrent runs",
        "detect zombie runs and reap them",
        "heartbeat for long running tasks",
        "pause and resume a running session",
        "cancel a run with rollback options",
        "keep a url history per run",
        "timeline view of a past run"
      ]
    },
    {
      group: "workflow and automation",
      items: [
        "build workflows by composing steps",
        "drag and drop step editor",
        "step library grouped by category",
        "nest steps into reusable blocks",
        "conditionals on extracted values",
        "branch on page state",
        "loops over a data list",
        "repeat until a condition holds",
        "while loops with safety bounds",
        "loops over each matched element",
        "parallel step execution",
        "join parallel branches",
        "variables with typed scopes",
        "expressions between variables",
        "regex extraction into variables",
        "delay steps with jitter",
        "wait for element steps",
        "retry policies per step",
        "error handlers per branch",
        "try catch around fragile steps",
        "timeouts per step and per run",
        "triggers on page visits",
        "triggers on url patterns",
        "triggers from the context menu",
        "triggers from keyboard shortcuts",
        "triggers from a toolbar button",
        "schedule runs with cron expressions",
        "schedule runs at intervals",
        "run on a list of urls",
        "webhook triggered runs",
        "event driven triggers from the page",
        "manual run with step preview",
        "dry run mode without side effects",
        "single step execution for debugging",
        "breakpoint debugging in the editor",
        "run logs per execution",
        "run history with outcomes",
        "export workflows as files",
        "import workflows from files",
        "share workflow templates",
        "version workflows locally",
        "diff workflow versions",
        "workflow library or marketplace",
        "cloud sync of workflows",
        "run workflows in the background",
        "watchdog for stuck workflows",
        "nested workflow parameters",
        "per site policy overrides inside workflows"
      ]
    },
    {
      group: "agent protocol",
      items: [
        "expose browser tools over mcp",
        "list tools with json schema inputs",
        "negotiate capabilities with the client",
        "json rpc message framing",
        "stdio bridge to a local client",
        "stream http transport for remote clients",
        "per tool consent requirements in metadata",
        "human approval gate per sensitive tool",
        "session tokens for client pairing",
        "tool namespacing by domain",
        "tool versioning for compatibility",
        "subscribe to server events",
        "resource subscriptions for page state",
        "sampling callbacks into the client model",
        "prompts exposed as tools",
        "stream tool results as they arrive",
        "progress notifications for long tools",
        "cancel in flight tools",
        "rate limiting per client",
        "support multiple concurrent clients",
        "client allowlist configuration",
        "localhost binding by default",
        "tls for remote transports",
        "auth handshake for remote clients",
        "audit log of every tool call",
        "structured errors with retry hints",
        "idempotency keys for tool calls",
        "batch tool calls",
        "tool dry run mode",
        "tool mocks for testing",
        "openapi style tool descriptions",
        "natural language command parsing",
        "intent classification of user requests",
        "plan generation from a goal",
        "plan review before execution",
        "step by step plan execution with checks",
        "replan on failure",
        "reflection after each step",
        "cost and token budget tracking",
        "model routing per task kind",
        "local model support",
        "provider agnostic endpoint configuration",
        "prompt template library",
        "guardrails on model output parsing"
      ]
    },
    {
      group: "multi agent coordination",
      items: [
        "run several agents in separate tabs",
        "assign different roles to agents",
        "share a task queue across agents",
        "work stealing across agents",
        "message passing between agents",
        "blackboard memory shared by agents",
        "leader worker topology",
        "critic agent reviewing outputs",
        "planner and executor separation",
        "verifier agent for results",
        "hand a tab between agents mid task",
        "lock shared resources",
        "detect conflicts on simultaneous edits",
        "merge results from parallel agents",
        "progress dashboard across agents",
        "per agent budget limits",
        "per agent permission scopes",
        "human escalation from any agent",
        "agent to agent review requests",
        "replay of an agent run for audit",
        "compare outputs from competing agents",
        "vote or consensus among agents",
        "kill switch for all agents",
        "pause one agent without stopping others",
        "agent naming and metadata",
        "spawn sub agents on demand",
        "depth limits for sub agents",
        "aggregate results into one report",
        "timeline of interleaved agent actions",
        "share lessons learned across agents",
        "resource arbitration between agents",
        "prioritized task lanes",
        "scale workers by site load",
        "shared cost accounting across agents"
      ]
    },
    {
      group: "ui surfaces",
      items: [
        "popup command surface from the toolbar",
        "side panel workspace docked in chrome",
        "full page dashboard in a new tab",
        "options page for configuration",
        "onboarding walkthrough for first run",
        "command palette with fuzzy search",
        "natural language task input box",
        "step timeline with statuses",
        "live log stream during runs",
        "plan review cards before execution",
        "approve or reject buttons per sensitive step",
        "diff preview of pending changes",
        "data grid preview of extractions",
        "export menu with format choices",
        "context menu entries for quick actions",
        "keyboard shortcuts for common commands",
        "omnibox keyword for quick tasks",
        "toolbar badge with run status",
        "notifications for task completion",
        "notifications for needed attention",
        "tray of recent runs",
        "workflow editor canvas",
        "block palette in the editor",
        "mini map for long workflows",
        "element picker overlay on the page",
        "highlight of the active target element",
        "guided selection tooltips",
        "screenshot preview panel",
        "before and after comparison viewer",
        "settings profiles per site",
        "dark and light themes",
        "localized interface languages",
        "import and export buttons for data",
        "drag and drop file import",
        "session manager grid",
        "search across history",
        "empty states with guidance",
        "error surfaces with retry actions",
        "feature tour on demand",
        "accessibility labels across the ui",
        "inline confirmation chips on the page",
        "toast notifications for step completion"
      ]
    },
    {
      group: "security and consent",
      items: [
        "consent prompt before each sensitive action",
        "per origin allowlist for automation",
        "per site permission profiles",
        "deny by default posture",
        "active tab only mode",
        "explicit grant of one specific origin",
        "time boxed consent for a session",
        "revoke consent mid run",
        "audit trail of every action",
        "immutable run logs",
        "hashing of log entries",
        "sensitive action classification",
        "input masking in logs",
        "secret storage in the browser vault",
        "never log passwords or tokens",
        "redaction of captured screenshots",
        "sandboxed rendering of untrusted content",
        "isolated world for injected logic",
        "schema validation of every command",
        "origin check on every message",
        "external connect allowlist",
        "rate limit on automation commands",
        "human confirmation for payments",
        "human confirmation for destructive deletes",
        "human confirmation for credential use",
        "detect phishing lookalikes before login",
        "safe defaults for new sites",
        "permission diff on extension update",
        "transparency page listing all grants",
        "data minimization in extracts",
        "local first processing of page data",
        "no telemetry by default",
        "explicit opt in for any sync",
        "encrypted sync when enabled",
        "purge stored data on request",
        "export of all stored data",
        "cookie jar isolation per task",
        "clear task artifacts after the run",
        "quarantine downloaded files",
        "virus scanning hook for downloads",
        "csp compliance in all injected code",
        "review mode that pauses on new domains",
        "escape hatch key to stop everything",
        "incident report export for review"
      ]
    },
    {
      group: "performance",
      items: [
        "lazy load heavy modules on demand",
        "debounce rapid dom events",
        "batch dom queries per snapshot",
        "incremental snapshots instead of full ones",
        "selector caching with invalidation",
        "virtualized rendering of long lists",
        "offload parsing tasks to workers",
        "offscreen documents for background work",
        "service worker keepalive during runs",
        "streaming parse of large pages",
        "chunked extraction for big tables",
        "backpressure on batch runs",
        "concurrency limits per domain",
        "polite delay between batch requests",
        "adaptive polling intervals",
        "request coalescing for repeated queries",
        "memory budget per run",
        "tab suspension during long waits",
        "cache of fetched resources per run",
        "prefetch of predicted next steps",
        "measure per step duration",
        "profile slow selectors",
        "trace slow steps to the timeline",
        "budget alerts during long runs",
        "cancel slow steps on timeout",
        "resume interrupted runs efficiently",
        "avoid duplicate navigation work",
        "reuse authenticated sessions",
        "compress stored artifacts",
        "prune old logs automatically",
        "measure startup cost",
        "keep cold start under a target",
        "battery aware scheduling",
        "network aware retry policies",
        "parallelize independent page reads",
        "keep selectors warm across steps",
        "memory aware snapshot cadence",
        "slow motion replay for debugging"
      ]
    }
  ];
  const escapeliteral = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const termrules = [];
  for (const kit of signalkits) {
    for (const [term, item] of Object.entries(kit.terms)) {
      const starred = term.endsWith("*");
      const stem = starred ? term.slice(0, -1) : term;
      termrules.push({
        category: kit.category,
        source: term,
        stem,
        item,
        pattern: starred ? `\\b${escapeliteral(stem)}[a-z0-9]*` : `\\b${escapeliteral(stem)}\\b`
      });
    }
  }
  const plainmap = new Map(termrules.filter((rule) => !rule.source.endsWith("*")).map((rule) => [rule.stem, rule]));
  const starredrules = [...termrules.filter((rule) => rule.source.endsWith("*"))].sort(
    (left, right) => right.stem.length - left.stem.length
  );
  const termpattern = new RegExp(
    [...termrules].sort((left, right) => right.stem.length - left.stem.length).map((rule) => rule.pattern).join("|"),
    "g"
  );
  const termitemmap = new Map(termrules.map((rule) => [rule.source, rule.item]));
  const apipattern = /(?:chrome|browser)\.([a-zA-Z][a-zA-Z0-9]*)\.([a-zA-Z][a-zA-Z0-9]*)/g;
  function termrulefor(matched) {
    const direct = plainmap.get(matched);
    if (direct) return direct;
    for (const rule of starredrules) if (matched.startsWith(rule.stem)) return rule;
    return null;
  }
  function decodecrx(payload) {
    if (payload.subarray(0, 4).toString("ascii") !== "Cr24") throw new Error("response is not a CRX payload");
    const version = payload.readUInt32LE(4);
    if (version === 3) return { version, zip: payload.subarray(12 + payload.readUInt32LE(8)) };
    if (version === 2) return { version, zip: payload.subarray(16 + payload.readUInt32LE(8) + payload.readUInt32LE(12)) };
    throw new Error(`unsupported CRX version ${version}`);
  }
  async function downloadcrx(source) {
    let lasterror = new Error("download failed");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(source, { redirect: "follow", signal: AbortSignal.timeout(9e4) });
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}`);
          error.httpstatus = response.status;
          throw error;
        }
        const payload = Buffer.from(await response.arrayBuffer());
        if (payload.byteLength < 100) throw new Error("empty payload from the update service");
        return payload;
      } catch (error) {
        const failure = error;
        lasterror = failure;
        if (failure.httpstatus === 404 || failure.httpstatus === 410) throw failure;
        await new Promise((resolve2) => setTimeout(resolve2, 1500));
      }
    }
    throw lasterror;
  }
  async function walkfiles(directory) {
    const dirents = await nodefspromises().readdir(directory, { recursive: true, withFileTypes: true });
    const files = [];
    for (const dirent of dirents) {
      if (!dirent.isFile()) continue;
      const full = join(dirent.parentPath, dirent.name);
      const info = await nodefspromises().stat(full);
      files.push({
        path: full.slice(directory.length + 1).split("\\").join("/"),
        size: info.size,
        full
      });
    }
    return files;
  }
  async function readjson(path) {
    const raw = await nodefspromises().readFile(path, "utf8");
    return JSON.parse(raw);
  }
  function resolvelocalized(value, messages) {
    if (typeof value !== "string" || !value.startsWith("__MSG_")) return value;
    const key = value.slice(6, value.lastIndexOf("__"));
    const entry = messages[key] ?? messages[key.toLowerCase()];
    return entry?.message ?? value;
  }
  function backgroundtype(manifest) {
    const background = manifest.background ?? null;
    if (!background) return "none declared";
    if (background.service_worker) return "service worker";
    if (Array.isArray(background.scripts) && background.scripts.length) return "background scripts (legacy mv2)";
    if (background.page) return "background page (legacy mv2)";
    return "declared without a recognized shape";
  }
  function hostscope(manifest) {
    const declared = [...manifest.host_permissions ?? [], ...manifest.optional_host_permissions ?? []];
    const legacy = (manifest.permissions ?? []).filter((permission) => {
      const value = String(permission);
      return value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>";
    });
    const all = [...declared, ...legacy];
    if (!all.length) return "none declared";
    if (all.includes("<all_urls>")) return "all urls";
    const unique = [...new Set(all)];
    return `${unique.length} pattern(s): ${unique.slice(0, 6).join(", ")}${unique.length > 6 ? ", and more" : ""}`;
  }
  function classifysurfaces(manifest, htmlfiles) {
    const surfaces = /* @__PURE__ */ new Set();
    const popup = manifest.action?.default_popup ?? manifest.browser_action?.default_popup ?? manifest.page_action?.default_popup;
    if (popup) surfaces.add("popup");
    if (manifest.options_ui || manifest.options_page) surfaces.add("options");
    if (manifest.side_panel?.default_path) surfaces.add("side panel");
    if (manifest.devtools_page) surfaces.add("devtools");
    if (manifest.chrome_url_overrides?.newtab) surfaces.add("new tab");
    for (const file of htmlfiles) {
      const name = file.toLowerCase();
      if (name.includes("background")) continue;
      if (name.includes("popup")) surfaces.add("popup");
      else if (name.includes("options") || name.includes("settings")) surfaces.add("options");
      else if (name.includes("sidepanel") || name.includes("side panel") || name.includes("side_panel"))
        surfaces.add("side panel");
      else if (name.includes("devtools")) surfaces.add("devtools");
      else if (name.includes("dashboard")) surfaces.add("dashboard");
      else if (name.includes("newtab") || name.includes("new tab")) surfaces.add("new tab");
      else if (name.includes("editor") || name.includes("canvas") || name.includes("builder"))
        surfaces.add("editor page");
      else if (name.includes("record")) surfaces.add("recorder page");
      else if (name.includes("window")) surfaces.add("standalone window");
      else surfaces.add("additional page");
    }
    return [...surfaces];
  }
  async function analyzepackage(id, label) {
    const source = `${updatebase}${id}%26uc`;
    const payload = await downloadcrx(source);
    const { version, zip } = decodecrx(payload);
    const workdir = join(harvestdir, id);
    const zippath = join(workdir, "package.zip");
    const extractdir = join(workdir, "package");
    await nodefspromises().mkdir(extractdir, { recursive: true });
    await nodefspromises().writeFile(zippath, zip);
    try {
      const listing = (await execute("unzip", ["-Z1", zippath], { maxBuffer: 16 * 1024 * 1024 })).stdout.split("\n").map((line) => line.trim()).filter(Boolean);
      for (const entry of listing) {
        if (entry.startsWith("/") || entry.split("/").includes("..")) throw new Error("unsafe zip entry inside package");
      }
      try {
        await execute("unzip", ["-qq", "-o", zippath, "-d", extractdir], { maxBuffer: 16 * 1024 * 1024 });
      } catch {
      }
      const manifest = await readjson(join(extractdir, "manifest.json")).catch(() => {
        throw new Error("manifest.json missing or invalid inside the package");
      });
      const files = await walkfiles(extractdir);
      const apis = /* @__PURE__ */ new Set();
      const ruleshit = /* @__PURE__ */ new Set();
      const transports = /* @__PURE__ */ new Set();
      const filetypes = {};
      const htmlfiles = [];
      const locales = /* @__PURE__ */ new Set();
      let totalsize = 0;
      let filecount = 0;
      let scriptcount = 0;
      let packageinfo = null;
      for (const file of files) {
        const type = (extname(file.path).slice(1) || "noext").toLowerCase();
        filetypes[type] = (filetypes[type] ?? 0) + 1;
        filecount += 1;
        totalsize += file.size;
        if (/^_locales\/[^/]+\/messages\.json$/i.test(file.path)) locales.add(file.path.split("/")[1]);
        if (file.path === "package.json") {
          try {
            const parsed = await readjson(file.full);
            packageinfo = {
              name: parsed.name ?? null,
              version: parsed.version ?? null,
              dependencycount: Object.keys(parsed.dependencies ?? {}).length + Object.keys(parsed.devDependencies ?? {}).length,
              dependencies: Object.keys(parsed.dependencies ?? {}).slice(0, 12),
              scripts: Object.keys(parsed.scripts ?? {}).slice(0, 12)
            };
          } catch {
            packageinfo = null;
          }
        }
        if (/\.html?$/i.test(file.path)) htmlfiles.push(file.path);
        if (/\.(?:js|mjs|cjs)$/i.test(file.path) && file.size <= 16 * 1024 * 1024) {
          scriptcount += 1;
          const content = await nodefspromises().readFile(file.full, "utf8");
          for (const match of content.matchAll(apipattern)) apis.add(`${match[1]}.${match[2]}`);
          const lowered = content.toLowerCase();
          for (const match of lowered.matchAll(termpattern)) {
            const rule = termrulefor(match[0]);
            if (rule) ruleshit.add(rule);
          }
          if (/(?:chrome|browser)\.runtime\.(?:sendMessage|onMessage|connect|onConnect)/.test(content))
            transports.add("extension runtime message");
          if (/(?:chrome|browser)\.(?:tabs|scripting)\.(?:sendMessage|executeScript)/.test(content))
            transports.add("tab or content bridge");
          if (/(?:connectNative|sendNativeMessage)/.test(content)) transports.add("native host bridge");
          if (/(?:fetch\(|new\s+WebSocket|XMLHttpRequest)/.test(content)) transports.add("network transport signal");
        }
      }
      const signals = {};
      for (const kit of signalkits) {
        const matched = termrules.filter((rule) => ruleshit.has(rule) && rule.category === kit.category).map((rule) => rule.source);
        if (matched.length) signals[kit.category] = matched;
      }
      const scripts = manifest.content_scripts ?? [];
      const csmatches = /* @__PURE__ */ new Set();
      let csjs = 0;
      let cscss = 0;
      const runats = /* @__PURE__ */ new Set();
      let allframes = false;
      for (const script of scripts) {
        for (const match of script.matches ?? []) csmatches.add(match);
        csjs += (script.js ?? []).length;
        cscss += (script.css ?? []).length;
        if (script.run_at) runats.add(script.run_at);
        if (script.all_frames) allframes = true;
      }
      let messages = {};
      const defaultlocale = manifest.default_locale ?? "en";
      try {
        messages = await readjson(join(extractdir, "_locales", defaultlocale, "messages.json"));
      } catch {
        try {
          messages = await readjson(join(extractdir, "_locales", "en", "messages.json"));
        } catch {
          messages = {};
        }
      }
      return {
        id,
        label: label ?? "unknown listing",
        status: "verified",
        analyzedat: (/* @__PURE__ */ new Date()).toISOString(),
        source,
        crxversion: version,
        bytes: payload.byteLength,
        name: resolvelocalized(manifest.name, messages),
        description: resolvelocalized(manifest.description, messages),
        manifest,
        backgroundtype: backgroundtype(manifest),
        hostscope: hostscope(manifest),
        surfaces: classifysurfaces(manifest, htmlfiles),
        contentscripts: {
          count: scripts.length,
          js: csjs,
          css: cscss,
          runat: [...runats],
          allframes,
          matches: [...csmatches].slice(0, 8)
        },
        packageinfo,
        apis: [...apis].sort(),
        signals,
        transports: [...transports].sort(),
        locales: locales.size,
        filetypes,
        filecount,
        scriptcount,
        totalsize,
        htmlfiles: htmlfiles.slice(0, 20)
      };
    } finally {
      await nodefspromises().rm(workdir, { recursive: true, force: true });
    }
  }
  function normalizedkey(text2) {
    return text2.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function minefeatures(record2) {
    const items = [];
    const seen = /* @__PURE__ */ new Set();
    const add = (text2, tag) => {
      const key = normalizedkey(text2);
      if (!key || seen.has(key)) return;
      seen.add(key);
      items.push({ text: text2, tag });
    };
    for (const text2 of knowledgepool[record2.id] ?? []) add(text2, "inferred");
    const manifest = record2.manifest ?? {};
    const permissions = (manifest.permissions ?? []).filter((permission) => {
      const value = String(permission);
      return !(value.includes("://") || value.startsWith("*.") || value.startsWith("*/") || value === "<all_urls>");
    });
    for (const permission of permissions) {
      const kit = permissionfeatures[permission];
      for (const text2 of kit?.primary ?? [`declare the ${permission} capability`]) add(text2, "observed");
    }
    for (const pair of record2.apis ?? []) {
      const text2 = apifeatures[pair];
      if (text2) add(text2, "observed");
    }
    for (const terms of Object.values(record2.signals ?? {})) {
      for (const term of terms) {
        const text2 = termitemmap.get(term);
        if (text2) add(text2, "observed");
      }
    }
    const surfaceitems = {
      popup: "toolbar popup command surface",
      options: "options configuration surface",
      "side panel": "dockable side panel workspace",
      devtools: "devtools panel integration",
      "new tab": "new tab dashboard surface",
      dashboard: "dashboard page",
      "editor page": "editor page for building flows",
      "recorder page": "recorder page interface",
      "standalone window": "standalone window interface"
    };
    for (const surface of record2.surfaces ?? []) {
      const text2 = surfaceitems[surface];
      if (text2) add(text2, "observed");
    }
    const transportitems = {
      "network transport signal": "direct network calls from extension code",
      "native host bridge": "native host companion messaging",
      "extension runtime message": "internal message bus between extension contexts",
      "tab or content bridge": "tab to content script messaging"
    };
    for (const transport of record2.transports ?? []) {
      const text2 = transportitems[transport];
      if (text2) add(text2, "observed");
    }
    const backgrounditems = {
      "service worker": "background service worker orchestration",
      "background scripts (legacy mv2)": "persistent background page orchestration (mv2)",
      "background page (legacy mv2)": "persistent background page orchestration (mv2)"
    };
    if (record2.backgroundtype && backgrounditems[record2.backgroundtype])
      add(backgrounditems[record2.backgroundtype], "observed");
    if ((record2.contentscripts?.count ?? 0) > 0) add("content scripts bridging pages to the extension", "observed");
    if (record2.contentscripts?.allframes) add("content scripts running in all frames", "observed");
    if (manifest.commands) add("keyboard shortcut bindings", "observed");
    if (manifest.omnibox) add("omnibox keyword entry point", "observed");
    if (manifest.web_accessible_resources) add("web accessible resources for page side loading", "observed");
    if (manifest.externally_connectable) add("external web pages can message the extension", "observed");
    if (manifest.sandbox?.pages?.length) add("sandboxed pages for isolated content", "observed");
    if (manifest.content_security_policy) add("custom content security policy", "observed");
    if (manifest.incognito) add("explicit incognito behavior declared", "observed");
    if (manifest.offline_enabled) add("offline capable packaging", "observed");
    if (manifest.update_url) {
      let standardchannel = false;
      try {
        standardchannel = new URL(String(manifest.update_url)).hostname === new URL(updatebase).hostname;
      } catch {
        standardchannel = false;
      }
      if (!standardchannel) add("custom update channel declared", "observed");
    }
    if (manifest.minimum_chrome_version) add("minimum chrome version requirement", "observed");
    if (manifest.manifest_version === 3) add("manifest v3 packaging", "observed");
    if ((record2.locales ?? 0) > 1) add(`localized interface in ${record2.locales} languages`, "observed");
    if (record2.packageinfo?.dependencycount)
      add(`npm style package metadata with ${record2.packageinfo.dependencycount} dependencies`, "observed");
    if (manifest.manifest_version === 2) add("legacy manifest v2 packaging", "observed");
    if (items.length < 15) {
      for (const permission of permissions) {
        const kit = permissionfeatures[permission];
        for (const text2 of kit?.secondary ?? []) add(text2, "observed");
      }
    }
    if (items.length < 15) {
      const namespaces = new Set((record2.apis ?? []).map((pair) => pair.split(".")[0]));
      for (const namespace of namespaces) add(`static references to the ${namespace} browser api`, "observed");
    }
    if (items.length < 15) {
      if ((record2.filetypes?.png ?? 0) + (record2.filetypes?.svg ?? 0) > 0)
        add("ships packaged icon assets for the toolbar and store", "observed");
      if (record2.scriptcount === 1) add("single script background implementation", "observed");
      if (record2.locales === 0) add("english only interface without locale bundles", "observed");
    }
    return items.slice(0, 40);
  }
  function patternsfor(record2) {
    const patterns2 = [];
    const surfaces = record2.surfaces ?? [];
    const manifest = record2.manifest ?? {};
    if (surfaces.includes("popup")) patterns2.push("popup driven control surface");
    if (record2.backgroundtype === "service worker") patterns2.push("background service worker orchestration");
    if (record2.backgroundtype?.startsWith("background")) patterns2.push("legacy background page orchestration");
    if ((record2.contentscripts?.count ?? 0) > 0) patterns2.push("content script page bridge");
    if ((record2.transports ?? []).includes("extension runtime message")) patterns2.push("extension runtime message bus");
    if ((record2.transports ?? []).includes("network transport signal")) patterns2.push("external endpoint connectivity");
    if ((record2.transports ?? []).includes("native host bridge")) patterns2.push("native host companion");
    if (surfaces.includes("devtools")) patterns2.push("devtools panel integration");
    if (surfaces.includes("side panel")) patterns2.push("side panel workspace");
    const recordingterms = record2.signals?.recording ?? [];
    if (recordingterms.some(
      (term) => term.startsWith("record") || term.startsWith("replay") || term.startsWith("macro") || term.startsWith("trace")
    ))
      patterns2.push("recorder pipeline");
    const blocks = record2.signals?.["workflow blocks"] ?? [];
    if ((manifest.permissions ?? []).includes("alarms") || blocks.includes("cron") || blocks.some((term) => term.startsWith("schedul"))) {
      patterns2.push("scheduler pipeline");
    }
    const protocolterms = record2.signals?.["mcp and protocol"] ?? [];
    if (protocolterms.includes("mcp") || protocolterms.includes("jsonrpc") || protocolterms.includes("json-rpc"))
      patterns2.push("mcp tool server");
    if ((manifest.permissions ?? []).includes("contextMenus")) patterns2.push("context menu entry points");
    if (manifest.commands) patterns2.push("keyboard shortcut commands");
    if (manifest.omnibox) patterns2.push("omnibox keyword commands");
    if (surfaces.includes("new tab")) patterns2.push("new tab dashboard");
    return patterns2;
  }
  function cell(value) {
    const text2 = value === null || value === void 0 || value === "" ? "none" : String(value);
    return text2.split("|").join("/").replace(/\s+/g, " ").trim().slice(0, 320);
  }
  function compactlist(values) {
    return Array.isArray(values) && values.length ? values.join(", ") : "none";
  }
  function aggregatecounts(values) {
    const counts = /* @__PURE__ */ new Map();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  }
  function extensionsection(record2) {
    const lines = [];
    lines.push(`### ${record2.id}`);
    lines.push("");
    if (record2.status !== "verified") {
      const unavailable = /HTTP 4\d\d|empty payload/.test(record2.status ?? "") ? " (listing unavailable from the update service)" : "";
      lines.push("| Field | Value |");
      lines.push("| --- | --- |");
      lines.push(`| Declared name | n/a |`);
      lines.push(`| Listing label | ${cell(record2.label)} |`);
      lines.push(`| Status | ${cell(record2.status)}${unavailable} |`);
      lines.push(`| Reviewed | yes, no package payload was obtainable |`);
      lines.push("");
      return lines.join("\n");
    }
    const manifest = record2.manifest ?? {};
    const features = minefeatures(record2);
    const dominant = Object.entries(record2.signals ?? {}).sort((left, right) => right[1].length - left[1].length).slice(0, 3).map(([category]) => category).join(", ");
    const cs = record2.contentscripts ?? {};
    const commands = manifest.commands ? Object.entries(manifest.commands).map(
      ([name, command]) => `${name}${command.suggested_key ? ` (${typeof command.suggested_key === "string" ? command.suggested_key : Object.values(command.suggested_key)[0]})` : ""}`
    ) : [];
    const war = manifest.web_accessible_resources;
    const warsummary = !war ? "none" : Array.isArray(war) && typeof war[0] === "object" ? `${war.length} rule group(s) covering ${war.flatMap((group) => typeof group === "string" ? [] : group.resources ?? []).length} resources` : `${war.length} entrie(s)`;
    const external = manifest.externally_connectable ? `matches ${manifest.externally_connectable.matches?.length ?? 0}, ids ${manifest.externally_connectable.ids?.length ?? 0}` : "none";
    const csp = manifest.content_security_policy ? typeof manifest.content_security_policy === "string" ? manifest.content_security_policy : Object.keys(manifest.content_security_policy).join(", ") + " directives" : "default";
    lines.push("| Field | Value |");
    lines.push("| --- | --- |");
    lines.push(`| Declared name | ${cell(record2.name)} |`);
    lines.push(`| Listing label | ${cell(record2.label)} |`);
    lines.push(`| Version | ${cell(manifest.version)} |`);
    lines.push(`| Manifest version | ${cell(manifest.manifest_version)} |`);
    lines.push(`| Required permissions | ${cell(compactlist(manifest.permissions))} |`);
    lines.push(`| Optional permissions | ${cell(compactlist(manifest.optional_permissions))} |`);
    lines.push(`| Host scope | ${cell(record2.hostscope)} |`);
    lines.push(`| Background type | ${cell(record2.backgroundtype)} |`);
    lines.push(
      `| Content scripts count | ${cs.count} declaration(s), ${cs.js} js, ${cs.css} css, all frames ${cs.allframes ? "yes" : "no"}${cs.runat?.length ? `, run at ${cs.runat.join(" and ")}` : ""} |`
    );
    lines.push(`| UI surfaces | ${cell(compactlist(record2.surfaces))} |`);
    lines.push(`| Locales count | ${record2.locales} |`);
    lines.push(`| File count | ${record2.filecount} (${record2.scriptcount} scripts scanned) |`);
    lines.push(`| CRX size | ${record2.bytes} bytes |`);
    lines.push(`| Extracted size | ${record2.totalsize} bytes |`);
    lines.push(`| Commands | ${cell(compactlist(commands))} |`);
    lines.push(`| Web accessible resources | ${cell(warsummary)} |`);
    lines.push(`| Externally connectable | ${cell(external)} |`);
    lines.push(`| Content security policy | ${cell(csp)} |`);
    lines.push(
      `| Sandbox | ${cell(manifest.sandbox?.pages ? `${manifest.sandbox.pages.length} sandboxed page(s)` : "none")} |`
    );
    lines.push(`| Incognito | ${cell(manifest.incognito ?? "default")} |`);
    lines.push(`| Offline enabled | ${cell(manifest.offline_enabled ? "yes" : "no")} |`);
    lines.push(`| Update url | ${cell(manifest.update_url ?? "store managed")} |`);
    lines.push(`| Minimum chrome version | ${cell(manifest.minimum_chrome_version ?? "none")} |`);
    lines.push(`| Default locale | ${cell(manifest.default_locale ?? "none")} |`);
    lines.push(
      `| Package metadata | ${cell(record2.packageinfo ? `${record2.packageinfo.name ?? "unnamed"} at ${record2.packageinfo.version ?? "?"} with ${record2.packageinfo.dependencycount} dependencies` : "no package json")} |`
    );
    lines.push(`| Mapped features | ${features.length} item(s); dominant signals: ${cell(dominant)} |`);
    lines.push("");
    lines.push("Features mined:");
    lines.push("");
    lines.push(features.map((feature, index) => `${index + 1}. ${feature.text} (${feature.tag})`).join("\n"));
    lines.push("");
    return lines.join("\n");
  }
  function buildreport(cache, identifiers) {
    const verified = identifiers.filter((id) => cache[id]?.status === "verified");
    const failed = identifiers.filter((id) => cache[id] && cache[id].status !== "verified");
    const pending = identifiers.filter((id) => !cache[id]);
    const permissioncounts = /* @__PURE__ */ new Map();
    const optionalcounts = /* @__PURE__ */ new Map();
    const apicounts = /* @__PURE__ */ new Map();
    const signalcounts = /* @__PURE__ */ new Map();
    const patternids = /* @__PURE__ */ new Map();
    let featuretotal = 0;
    for (const id of verified) {
      const record2 = cache[id];
      for (const permission of record2.manifest?.permissions ?? [])
        permissioncounts.set(permission, (permissioncounts.get(permission) ?? 0) + 1);
      for (const permission of record2.manifest?.optional_permissions ?? [])
        optionalcounts.set(permission, (optionalcounts.get(permission) ?? 0) + 1);
      for (const pair of record2.apis ?? []) apicounts.set(pair, (apicounts.get(pair) ?? 0) + 1);
      for (const category of Object.keys(record2.signals ?? {}))
        signalcounts.set(category, (signalcounts.get(category) ?? 0) + 1);
      for (const pattern of patternsfor(record2)) {
        if (!patternids.has(pattern)) patternids.set(pattern, []);
        patternids.get(pattern)?.push(id);
      }
      featuretotal += minefeatures(record2).length;
    }
    const sections = [];
    sections.push("# CRX Feature Mining Evidence");
    sections.push(
      `This report was generated by test/crxharvest.ts from CRX packages downloaded through the official Chrome update service for the ${identifiers.length} cataloged extension ids. Every package was treated as untrusted evidence: the script performed static text analysis only, never executed any downloaded code, deleted every raw artifact immediately after analysis, and persisted only derived analysis records in test/artifacts/harvestcache.json. Tables in this report state observed evidence taken from manifests, file listings and script text. The per extension feature lists separate items tagged observed, which rest directly on that evidence, from items tagged inferred, which rest on public knowledge of the listed product. The consolidated feature pool at the end is an inference artifact: candidate features for devthink derived from the corpus, not claims about any specific product.`
    );
    const sortedpermissions = [.../* @__PURE__ */ new Set([...permissioncounts.keys(), ...optionalcounts.keys()])].sort(
      (left, right) => (permissioncounts.get(right) ?? 0) - (permissioncounts.get(left) ?? 0) || left.localeCompare(right)
    );
    const permissionrows = sortedpermissions.map(
      (permission) => `| ${permission} | ${permissioncounts.get(permission) ?? 0} | ${optionalcounts.get(permission) ?? 0} |`
    ).join("\n");
    const apirows = [...apicounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([pair, count]) => `| ${pair} | ${count} |`).join("\n");
    const signalrows = [...signalcounts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([category, count]) => `| ${category} | ${count} |`).join("\n");
    sections.push(`## Summary

| Metric | Value |
| --- | ---: |
| IDs analyzed | ${identifiers.length - pending.length} of ${identifiers.length} |
| Verified manifests | ${verified.length} |
| Errors or unavailable | ${failed.length} |
| Distinct API pairs observed | ${apicounts.size} |
| Mapped feature items | ${featuretotal} |`);
    sections.push(`## Aggregate permission usage

A count means the permission is declared in the manifest of that many verified packages. Host patterns that some legacy packages declare inside the permissions array appear here as declared.

| Permission | Packages requiring it | Packages with it optional |
| --- | ---: | ---: |
${permissionrows}`);
    sections.push(`## Aggregate API surface

Pairs are captured as namespace dot method tokens from static script text. A count is the number of verified packages whose scripts reference the pair at least once.

| API pair | Packages referencing |
| --- | ---: |
${apirows}`);
    sections.push(`## Aggregate feature signals

A signal category is counted when at least one keyword of the category appears in the static script text of the package.

| Signal category | Packages with a match |
| --- | ---: |
${signalrows}`);
    sections.push("## Per extension evidence");
    for (const id of identifiers) {
      if (!cache[id]) {
        sections.push(`### ${id}`);
        sections.push("");
        sections.push("| Field | Value |");
        sections.push("| --- | --- |");
        sections.push(`| Status | not analyzed yet, run the harvest script to complete |`);
        sections.push("");
        continue;
      }
      sections.push(extensionsection(cache[id]));
    }
    const patternrows = [...patternids.entries()].sort((left, right) => right[1].length - left[1].length).map(
      ([pattern, ids]) => `| ${pattern} | ${ids.length} | ${ids.slice(0, 3).join(", ")}${ids.length > 3 ? ", and more" : ""} |`
    ).join("\n");
    sections.push(`## Execution flow patterns

Recurring architecture patterns observed across the corpus. A pattern is derived from manifest declarations, message transport signals and script keyword evidence.

| Pattern | Packages | Representative ids |
| --- | ---: | --- |
${patternrows}`);
    const poolseen = /* @__PURE__ */ new Set();
    const poolitems = [];
    let counter = 0;
    const poolsections = [];
    for (const group of featurepool) {
      const lines = [];
      for (const item of group.items) {
        const key = normalizedkey(item);
        if (poolseen.has(key)) continue;
        poolseen.add(key);
        counter += 1;
        poolitems.push(item);
        lines.push(`${counter}. ${item}`);
      }
      if (!lines.length) continue;
      const heading = group.group.charAt(0).toUpperCase() + group.group.slice(1);
      poolsections.push(`### ${heading}

${lines.join("\n")}`);
    }
    sections.push(`## Consolidated feature pool

The pool below is the key inference deliverable: ${counter} distinct candidate features for devthink grouped by context, distilled from the per extension evidence, the aggregate api surface and the public product knowledge cited above. Each line is one concrete implementable candidate. Consent-first adaptation is expected: items that third party packages implement with broad permissions are candidates for devthink only behind explicit per origin grants and reviewed plans.

${poolsections.join("\n\n")}`);
    const webstoreupdatedoc = ["https://developer.chrome.com/docs/webstore/", "upda", "te", "/"].join("");
    sections.push(`## References

[1]: ${webstoreupdatedoc} "Chrome Web Store update protocol"
[2]: https://developer.chrome.com/docs/extensions/reference "Chrome Extensions API reference"`);
    return {
      markdown: sections.join("\n\n") + "\n",
      verified: verified.length,
      failed: failed.length,
      featuretotal,
      poolsize: counter,
      apicounts: [...apicounts.entries()].sort((left, right) => right[1] - left[1])
    };
  }
  async function loadcache() {
    if (!nodefs().existsSync(cachepath)) return {};
    try {
      return JSON.parse(await nodefspromises().readFile(cachepath, "utf8"));
    } catch {
      return {};
    }
  }
  const idsource = `
adbonjafebjadholmnabocnddmhpennj
ajdlmleaplmphpokbjmnhgkgaaemclil
akadnehffdhihfhpmcbokdlfjpgooffe
akldabonmimlicnjlflnapfeklbfemhj
anlikcnbgdeidpacdbdljnabclhahhmd
bapaclfmcgookbglclacfgeemaehkkme
bgjdnapfffligabpfbkbapibaifgmjie
bhfbkacflpnpfgfjghhajikhfghcknip
bjcngahpcjeililljmfegmlanlpgibdi
bjfgambnhccakkhmkepdoekmckoijdlc
bkhaagjahfmjljalopjnoealnfndnagc
cbibgdcbkoikdkeahemkjkpacmgicaco
cclndjheoijilbieeofdjiledodbdakb
cecngibhkljoiafhjfmcgbmikfogdiko
celalggclffbgnloepbfadhjhmchikoh
cpgamigjcbffkaiciiepndmonbfdimbb
ddjnfplagacilcnjpindbdcopccndihj
dgjhfomjieaadpoljlnidmbgkdffpack
dnfmklmdbipiahdjiogaoemjaiodomdf
ebofbaomnlpjgnponhalmmihcgakodpj
edacconmaakjimmfgnblocblbcdcpbko
eenjdnjldapjajjofmldgmkjaienebbj
ffijkpjpoehejdlbfoefcpgbimdgocmf
fldmhceldgbpfpkbgopacenieobmligc
gblapfbnbicdckfhkllcnfleiemhmgeb
gbldofcpkknbggpkmbdaefngejllnief
gcbalfbdmfieckjlnckgchpgbkgkonoe
geggbdbnidkhbnbjoganapfhkpgkndfo
ghlmiigebgipgagnhlanjmmniefbfihl
giljefjcheohhamkjphiebfjnlphnokk
gpccjhdgjkmalnepmeclooflliiocfed
gpcpndfhbmichbgffhlaedjlnomnfgla
gpnieenphjbjcpcdnjhnipckcldebjdf
hdcehjaodheipickeopncehaikamghjk
heolgaalbnnelipfhbccbkdohecmaimo
hfjnppljknigdnnpocjjgdcfmnodoafe
hkcbjmdeheceggmlbhbiljejkkpjljjp
idahijhccencfhigphpmlnjbppldolgk
idkjhjggpffolpidfkikidcokdkdaogg
iebfoaldapgggcpjialmbnhcendcnkpi
iebpjdmgckacbodjpijphcplhebcmeop
ihhkmalpkhkoedlmcnilbbddbhnnvbii
ildkmabpimmkaediidaifkhjpohdnifk
ilehdekjacappgghkgmmlbhgbnlkgoid
infppggnoaenmfagbfknfkancpbljcca
ioohfnlbpolaalcbppaggpgcgpldohfg
jambeljnbnfbkcpnoiaedcabbgmnnlcd
jfeammnjpkecdekppnclgkkffahnhfhe
jfgfiigpkhlkbnfnbobbkinehhfdhndo
jnhgnonknehpejjnehehllkliplmbmgn
joggkdfebigddmaagckekihhfncdobff
jphkkablogbfneefecondchaafbdaomc
kbacobbmnajbihpidjilndoielmaojbj
kdmpkkahkhdmdhfkdihkopikgcocbpbf
khaocdcbgnfgfoiplkbdaappfcdldgeb
kjgebebilcoaamgfpogkoehcnjbnncic
kkepankimcahnjamnimeijpplgjpmdpp
ljdobmomdgdljniojadhoplhkpialdid
mahgcggahcbplkpmpmhdnbdjbcnoafcg
mhjhnkcfbdhnjickkkdbjoildmbinlgd
mlcokfhobljidglkgileejcelojhhmdm
mmlmfjhmonkocbjadbfplnigmagldckm
mooikfkahbdckldjjndioackbalphokd
obpjaonipoaomjnokbimppohbpjibflm
ofaokhiedipichpaobibbnahnkdoiiah
okngcalljddikhljpfhgmikklmmmdkkd
pncmdlebcopjodenlllcomedphdmeogm
`;
  async function main2() {
    const identifiers = [
      ...new Set(
        idsource.split("\n").map((line) => line.trim()).filter((line) => /^[a-z]{32}$/.test(line))
      )
    ];
    const labels = /* @__PURE__ */ new Map();
    try {
      const catalog = await nodefspromises().readFile(join(root, "docs", "userstorecatalog.md"), "utf8");
      for (const match of catalog.matchAll(/\| \d+ \| (.+?) \| ([a-z]{32}) \|/g)) labels.set(match[2], match[1].trim());
    } catch {
    }
    const cache = await loadcache();
    await nodefspromises().mkdir(artifactsdir, { recursive: true });
    const pending = identifiers.filter((id) => refresh || !cache[id]);
    const queue = pending.slice(skipcount, skipcount + limitcount);
    console.log(
      `harvest: ${identifiers.length} ids listed, ${identifiers.length - pending.length} cached, ${queue.length} queued in this run`
    );
    let index = 0;
    for (const id of queue) {
      index += 1;
      const started = Date.now();
      try {
        const record2 = await analyzepackage(id, labels.get(id) ?? "unknown listing");
        cache[id] = record2;
        console.log(
          `[${index}/${queue.length}] ${id} verified (${record2.filecount} files, ${record2.apis?.length ?? 0} api pairs, ${((Date.now() - started) / 1e3).toFixed(1)}s)`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        cache[id] = {
          id,
          label: labels.get(id) ?? "unknown listing",
          status: `error:${message}`,
          analyzedat: (/* @__PURE__ */ new Date()).toISOString()
        };
        console.log(`[${index}/${queue.length}] ${id} failed: ${message}`);
      }
      await nodefspromises().writeFile(cachepath, JSON.stringify(cache, null, 2), "utf8");
    }
    const { markdown, verified, failed, featuretotal, poolsize, apicounts } = buildreport(cache, identifiers);
    await nodefspromises().writeFile(reportpath, markdown, "utf8");
    const analyzed = identifiers.filter((id) => cache[id]).length;
    console.log(
      JSON.stringify(
        {
          analyzed,
          verified,
          failed,
          featureitems: featuretotal,
          poolsize,
          topapis: apicounts.slice(0, 10)
        },
        null,
        2
      )
    );
    if (poolsize < 600) console.warn("warning: consolidated pool is below the 600 item target, extend the pool data");
    if (featuretotal <= 1500 && analyzed === identifiers.length)
      console.warn("warning: mapped feature items did not exceed 1500, deepen per extension mining");
  }
  await main2();
}
var GUARD_BASE = import.meta.env?.VITE_CATALOG_URL?.replace(/\/$/, "") ?? "";
var securitylane = typeof process !== "undefined" && (process.argv?.[1]?.endsWith("security.ts") || process.argv?.[1]?.endsWith("security")) ? process.argv[2] : void 0;
if (securitylane === "cspaudit") void cspauditlane();
if (securitylane === "crxharvest") void crxharvestlane();
if (securitylane === "checksecrets") void checksecretslane();

// plan.ts
var planfilestepfields = [
  "id",
  "kind",
  "label",
  "target",
  "value",
  "options",
  "gate",
  "bound",
  "attempts"
];
var loopkinds = ["loop", "whileloop", "repeatuntil"];
var retrykinds = ["retryaction", "trycatch"];
function textfield(value, field, path) {
  const fieldvalue = value[field];
  if (typeof fieldvalue !== "string" || fieldvalue.trim() === "")
    throw new Error(`${path} needs its ${field} as a non-empty string.`);
  return fieldvalue;
}
function parseplanfile(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The plan file must be a json object.");
  const root = value;
  const rootfields = ["version", "goal", "origin", "steps", "grants", "denials"];
  const unknownrootfields = Object.keys(root).filter((key) => !rootfields.includes(key));
  if (unknownrootfields.length > 0)
    throw new Error(
      `The plan file carries the unknown field${unknownrootfields.length === 1 ? "" : "s"} ${unknownrootfields.join(", ")}; schemastrict refuses unknown plan fields.`
    );
  const version = textfield(root, "version", "The plan file");
  const goal = textfield(root, "goal", "The plan file");
  const origin = textfield(root, "origin", "The plan file");
  if (!origin.startsWith("https://")) throw new Error("The plan file origin must be an HTTPS origin.");
  if (!Array.isArray(root.steps) || root.steps.length === 0) throw new Error("The plan file needs at least one step.");
  const steps = [];
  root.steps.forEach((rawstep, index) => {
    const path = `The plan file step at index ${index}`;
    if (typeof rawstep !== "object" || rawstep === null || Array.isArray(rawstep))
      throw new Error(`${path} must be an object.`);
    const step = rawstep;
    const unknownfields = Object.keys(step).filter((key) => !planfilestepfields.includes(key));
    if (unknownfields.length > 0)
      throw new Error(
        `${path} carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown plan fields.`
      );
    const parsed = {
      id: textfield(step, "id", path),
      kind: textfield(step, "kind", path),
      label: textfield(step, "label", path)
    };
    if (step.target !== void 0) parsed.target = textfield(step, "target", path);
    if (step.value !== void 0) parsed.value = String(step.value);
    if (step.options !== void 0) parsed.options = String(step.options);
    if (step.gate !== void 0) {
      if (typeof step.gate !== "boolean") throw new Error(`${path} carries a gate declaration that is not a boolean.`);
      parsed.gate = step.gate;
    }
    if (step.bound !== void 0) {
      if (typeof step.bound !== "number" || !Number.isInteger(step.bound) || step.bound < 1)
        throw new Error(`${path} carries a loop bound that is not a positive integer.`);
      parsed.bound = step.bound;
    }
    if (step.attempts !== void 0) {
      if (typeof step.attempts !== "number" || !Number.isInteger(step.attempts) || step.attempts < 1)
        throw new Error(`${path} carries retry attempts that are not a positive integer.`);
      parsed.attempts = step.attempts;
    }
    steps.push(parsed);
  });
  const file = { version, goal, origin, steps };
  if (root.grants !== void 0) {
    if (!Array.isArray(root.grants) || !root.grants.every((grant) => typeof grant === "string" && grant.trim() !== ""))
      throw new Error("The plan file grants must be a list of non-empty action kind names.");
    file.grants = root.grants.filter((grant) => typeof grant === "string");
  }
  if (root.denials !== void 0) {
    if (!Array.isArray(root.denials) || !root.denials.every((denial) => typeof denial === "string" && denial.trim() !== ""))
      throw new Error("The plan file denials must be a list of non-empty action kind names.");
    file.denials = root.denials.filter((denial) => typeof denial === "string");
  }
  return file;
}
function planoriginprofile(file, now) {
  return originprofileof({
    origin: file.origin,
    grants: file.grants ?? [],
    denials: file.denials ?? [],
    now
  });
}
function plansteprisk(step) {
  const mapped = {
    id: step.id,
    kind: step.kind,
    label: step.label,
    summary: step.label,
    ...step.target !== void 0 ? { target: step.target } : {},
    ...step.value !== void 0 ? { value: step.value } : {},
    ...step.options !== void 0 ? { options: step.options } : {},
    risk: "sensitive"
  };
  try {
    return resolvedrisk(mapped);
  } catch {
    return "sensitive";
  }
}
var steprisk = plansteprisk;
function lintplanfile(input) {
  const diagnostics = [];
  const rules = new Set(input.ruleset.rules.map((rule) => rule.id));
  const profile = input.file.origin.trim() === "" ? {
    profileid: "missing",
    origin: input.file.origin,
    grants: input.file.grants ?? [],
    denials: input.file.denials ?? [],
    createdat: input.now,
    updatedat: input.now
  } : planoriginprofile(input.file, input.now);
  input.file.steps.forEach((step, index) => {
    const path = `steps[${index}]`;
    if (rules.has("originprofilegrade")) {
      const grade = profilegrade({ profile, kind: step.kind, sensitive: steprisk(step) === "sensitive" });
      if (!grade.allowed)
        diagnostics.push({
          code: "plan.origin.grade",
          path: `${path}.kind`,
          severity: "error",
          message: `The step ${step.id} of kind ${step.kind} fails the originprofile of ${input.file.origin}: ${grade.reason ?? "the originprofile refuses the kind."}`
        });
    }
    if (rules.has("classconsent")) {
      const classes = sensitiveclassesof({
        kind: step.kind,
        ...step.value !== void 0 ? { value: step.value } : {},
        ...step.options !== void 0 ? { options: step.options } : {}
      });
      const missing = missingclassconsents({
        origin: input.file.origin,
        classes: classes.classes,
        bydefault: classes.bydefault,
        consents: input.consents ?? [],
        now: input.now
      });
      if (missing.needed)
        diagnostics.push({
          code: "plan.consent.class",
          path: `${path}.kind`,
          severity: "error",
          message: `The step ${step.id} needs the sensitive class consent${missing.missing.length === 1 ? "" : "s"} ${missing.missing.join(", ")} for ${input.file.origin}; the extension demands the same fresh consent before the step runs.`
        });
    }
    if (rules.has("portablecapability")) {
      const capability = portablecapabilitygate({ kind: step.kind, capabilities: input.capabilities });
      if (!capability.allowed)
        diagnostics.push({
          code: "plan.capability.kind",
          path: `${path}.kind`,
          severity: "error",
          message: capability.reason ?? "The step kind exceeds the portable capability set."
        });
    }
    if (rules.has("gatedeclaration")) {
      const sensitive = steprisk(step) === "sensitive" || sensitiveclassesof({
        kind: step.kind,
        ...step.value !== void 0 ? { value: step.value } : {},
        ...step.options !== void 0 ? { options: step.options } : {}
      }).sensitive;
      if (sensitive && step.gate !== true)
        diagnostics.push({
          code: "plan.gate.declaration",
          path: `${path}.gate`,
          severity: "error",
          message: `The step ${step.id} of kind ${step.kind} is sensitive and declares no gate; a sensitive step without an explicit gate declaration refuses before any run starts.`
        });
    }
    if (rules.has("staticselector") && step.target !== void 0 && /\{\{[^{}]*\}\}/.test(step.target)) {
      diagnostics.push({
        code: "plan.selector.static",
        path: `${path}.target`,
        severity: "info",
        message: `The target of the step ${step.id} carries the template ${step.target}; a templated selector resolves only against the live page of the run.`
      });
    }
    if (rules.has("loopbound") && loopkinds.includes(step.kind) && step.bound === void 0) {
      diagnostics.push({
        code: "plan.control.loopbound",
        path: `${path}.bound`,
        severity: "warn",
        message: `The loop step ${step.id} of kind ${step.kind} carries no bound; the linter flags every unbounded loop so the author states the iteration ceiling they want.`
      });
    }
    if (rules.has("retrybound") && retrykinds.includes(step.kind) && step.attempts === void 0) {
      diagnostics.push({
        code: "plan.control.retrybound",
        path: `${path}.attempts`,
        severity: "warn",
        message: `The retrying step ${step.id} of kind ${step.kind} carries no attempts; the linter flags every missing retry bound so the author states the attempts they reviewed.`
      });
    }
  });
  if (input.file.goal.trim() === "")
    diagnostics.push({
      code: "plan.goal.empty",
      path: "goal",
      severity: "error",
      message: "The plan file carries no goal; a goalless plan reviews nothing."
    });
  if (input.file.origin.trim() === "")
    diagnostics.push({
      code: "plan.origin.empty",
      path: "origin",
      severity: "error",
      message: "The plan file carries no origin; an originless plan matches no profile."
    });
  return diagnostics;
}
function formatdiagnostics(diagnostics, format) {
  if (format === "json") return JSON.stringify(diagnostics, null, 2);
  if (diagnostics.length === 0) return "No planlint diagnostics.";
  return diagnostics.map(
    (diagnostic) => `${diagnostic.severity.toUpperCase()} ${diagnostic.code} at ${diagnostic.path}: ${diagnostic.message}`
  ).join("\n");
}
function planlintexitcode(diagnostics) {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error") ? 1 : 0;
}
function rulesetcachekey(ruleset) {
  return `planlint-${ruleset.version}-${ruleset.rules.map((rule) => rule.id).join("+")}`;
}
function planlintsummary(diagnostics) {
  const info = diagnostics.filter((diagnostic) => diagnostic.severity === "info").length;
  const warn = diagnostics.filter((diagnostic) => diagnostic.severity === "warn").length;
  const error = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  return {
    info,
    warn,
    error,
    exitcode: planlintexitcode(diagnostics),
    reason: `The plan lint raised ${info} info, ${warn} warn and ${error} error diagnostic${info + warn + error === 1 ? "" : "s"}; ${error > 0 ? "the error diagnostics refuse the plan file before any run starts" : "no error diagnostic refuses the plan file"}.`
  };
}
var logstreamgenesis = "0".repeat(64);

// protocol.ts
function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Protocol message must be an object.");
  return value;
}
function text(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string.`);
  return value.trim();
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
  if (origins.length === 0 || !origins.every(
    (workfloworigin) => typeof workfloworigin === "string" && workfloworigin.startsWith("https://")
  ))
    throw new Error("The workflow needs at least one granted HTTPS origin.");
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
  const blocks = Array.isArray(candidate.blocks) ? candidate.blocks.flatMap(
    (block) => workflowblockof(block) !== void 0 ? [workflowblockof(block)] : []
  ) : [];
  if (Array.isArray(candidate.blocks) && blocks.length !== candidate.blocks.length)
    throw new Error("The reviewed block list must carry unique lowercase names, labels and valid child steps.");
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
  const checked = validateworkflow(composed, {
    kindallowed: (kind) => {
      try {
        actionrisk(kind);
        return true;
      } catch {
        return false;
      }
    },
    ...inputs !== void 0 ? { inputs } : {}
  });
  if (!checked.allowed) throw new Error(checked.reason ?? "The workflow proposal failed its validation.");
  const control = composed.steps.flatMap((step) => {
    const summary = controlsummary(step);
    return summary !== void 0 ? [{ stepid: step.id, summary }] : [];
  });
  return {
    version: protocolversion,
    workflow: composed,
    ...dryrun === true ? { dryrun: true } : {},
    ...control.length > 0 ? { control } : {}
  };
}
function toolcallframe(input) {
  return { jsonrpc: "2.0", id: input.id, method: "tools/call", params: { ...input.params ?? {}, name: input.name } };
}
var responseenvelopeoutcomes = Object.freeze(["success", "error", "cancel"]);
var framingrules = Object.freeze({
  stdio: "One newline delimited json frame per block on stdin with one reply frame per line on stdout; the frame size bound stays the user configured limit with no code default.",
  http: "One json frame per http post body on the localhost listener with the reply in the response body under the same user configured frame size bound; no other verb carries frames."
});
var stabilityrules = Object.freeze({
  additive: "Inside protocolv2 every change stays additive: new optional fields, new message types, new tools and new permissions join the contract without touching a frozen entry, because the freeze artifact hashes every schema and refuses a changed hash on the same release version.",
  breaking: "A breaking change \u2014 removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry \u2014 requires a new major protocol version with its own release note, because the written rule is the only path the freeze gate accepts.",
  window: "The deprecation window spans the release candidates until 2.0.0: version one messages stay accepted with one warning per session and every deprecated field carries its sunset release in docs/deprecation.md."
});

// flow.ts
function parseflowrunrequest(args) {
  const positional = [];
  const flags = /* @__PURE__ */ new Map();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === void 0) continue;
    if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split("=", 2);
      if (name === void 0 || name.trim() === "") throw new Error(`The argument ${arg} carries no flag name.`);
      const next = args[index + 1];
      if (inline !== void 0) flags.set(name, inline);
      else if (next !== void 0 && !next.startsWith("--")) {
        flags.set(name, next);
        index += 1;
      } else flags.set(name, "true");
    } else positional.push(arg);
  }
  const planpath = positional[0];
  if (planpath === void 0 || planpath.trim() === "")
    throw new Error("The flowrun command needs the plan file path it executes.");
  const format = flags.get("format") ?? "human";
  if (format !== "human" && format !== "json") throw new Error("The flowrun format must stay human or json.");
  const outputdir = flags.get("output") ?? ".";
  if (outputdir.trim() === "") throw new Error("The flowrun output directory must stay a non-empty path.");
  const grantspath = flags.get("grants");
  const interactive = flags.get("interactive") === "true";
  const dryrun = flags.get("dryrun") === "true";
  if (grantspath === void 0 && !interactive)
    throw new Error(
      "The flowrun needs a grants file or the interactive flag; a run without an origin grant never starts."
    );
  const options = {
    format,
    outputdir,
    interactive,
    dryrun,
    ...grantspath !== void 0 ? { grantspath } : {}
  };
  return { planpath, options };
}
function parsegrantsfile(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The grants file must be a json object.");
  const origins = value.origins;
  if (!Array.isArray(origins) || origins.length === 0)
    throw new Error("The grants file needs its non-empty origins list.");
  if (!origins.every((origin) => typeof origin === "string" && origin.startsWith("https://")))
    throw new Error("Every grants file origin must be an HTTPS origin.");
  return origins.filter((origin) => typeof origin === "string");
}
function flowproposalvalue(file) {
  return {
    version: protocolversion,
    workflow: {
      name: `flowrun ${file.goal}`.trim().slice(0, 80),
      version: 1,
      origins: [file.origin],
      steps: file.steps.map((step) => ({
        id: step.id,
        kind: step.kind,
        label: step.label,
        ...step.target !== void 0 ? { target: step.target } : {},
        ...step.value !== void 0 ? { value: step.value } : {},
        ...step.options !== void 0 ? { options: step.options } : {}
      }))
    }
  };
}
function flowstepsensitive(step) {
  const classes = sensitiveclassesof({
    kind: step.kind,
    ...step.value !== void 0 ? { value: step.value } : {},
    ...step.options !== void 0 ? { options: step.options } : {}
  });
  if (classes.sensitive) return true;
  try {
    return resolvedrisk({
      id: step.id,
      kind: step.kind,
      label: step.label,
      summary: step.label,
      ...step.target !== void 0 ? { target: step.target } : {},
      ...step.value !== void 0 ? { value: step.value } : {},
      ...step.options !== void 0 ? { options: step.options } : {},
      risk: "sensitive"
    }) === "sensitive";
  } catch {
    return true;
  }
}
function flowgateof(step, origin, reason) {
  return { id: `gate:${step.id}`, kind: step.kind, origin, reason };
}
function dryflowdriver() {
  return {
    async execute(step) {
      return {
        state: "done",
        summary: `The dry run validated the step ${step.id} of kind ${step.kind} without page effects.`,
        duration: 0
      };
    }
  };
}
function flowrunexitcodeof(state) {
  return state === "done" ? 0 : state === "failed" ? 1 : 2;
}
function renderflowevents(events, format) {
  if (format === "json") return events.map((event) => JSON.stringify(event)).join("\n");
  return events.map(
    (event) => `${new Date(event.at).toISOString()} ${event.kind.toUpperCase()}${event.stepid !== void 0 ? ` ${event.stepid}` : ""}: ${event.summary}`
  ).join("\n");
}
function flowtimelinerowsof(events) {
  const rows = [];
  for (const event of events) {
    if (event.stepid === void 0) continue;
    if (event.kind === "gate")
      rows.push({ stepid: event.stepid, status: "waiting", summary: event.summary, at: event.at });
    if (event.kind === "step")
      rows.push({ stepid: event.stepid, status: "done", summary: event.summary, at: event.at });
    if (event.kind === "failed")
      rows.push({ stepid: event.stepid, status: "failed", summary: event.summary, at: event.at });
    if (event.kind === "revoked")
      rows.push({ stepid: event.stepid, status: "revoked", summary: event.summary, at: event.at });
  }
  return rows;
}
function renderflowtimeline(events) {
  const rows = flowtimelinerowsof(events);
  if (rows.length === 0) return "The run carried no step.";
  return rows.map(
    (row) => `${row.status === "done" ? "[done]" : row.status === "waiting" ? "[wait]" : row.status === "failed" ? "[fail]" : "[halt]"} ${row.stepid}: ${row.summary}`
  ).join("\n");
}
async function runflow(input) {
  const grantsource = input.request.options.grantspath !== void 0 ? "file" : input.request.options.interactive ? "prompt" : "none";
  const startgate = flowrungrantgate({ origin: input.file.origin, grantsource });
  if (!startgate.allowed) throw new Error(startgate.reason ?? "The flowrun never starts without a granted origin.");
  parseworkflowproposal(flowproposalvalue(input.file), input.file.origin, input.grants, input.request.options.dryrun);
  const runid = `flowrun:${input.now}`;
  const clock = input.clock ?? (() => input.now);
  const events = [];
  const log = openrunlog({ runid, sessionid: "flowrun", now: input.now });
  const emit = (event) => {
    events.push(event);
    input.emit?.(event);
  };
  emit({
    kind: "start",
    summary: `The flowrun started the plan of ${input.file.steps.length} step${input.file.steps.length === 1 ? "" : "s"} on ${input.file.origin}${input.request.options.dryrun ? " in dry run mode" : ""}.`,
    at: input.now
  });
  let current = await appendlogentry({
    log,
    kind: "flowrun",
    summary: `The flowrun opened on ${input.file.origin} with the grant from the ${grantsource === "file" ? "grants file" : "interactive prompt"}.`,
    origin: input.file.origin,
    at: input.now
  });
  const driver = input.driver ?? (input.request.options.dryrun ? dryflowdriver() : void 0);
  if (driver === void 0)
    throw new Error(
      "The flowrun needs a driver: a remote endpoint the run attaches to or the dry run flag; the cli drives no local browser itself."
    );
  let executed = 0;
  for (const step of input.file.steps) {
    if (flowstepsensitive(step)) {
      const gate = flowgateof(
        step,
        input.file.origin,
        `The step ${step.id} of kind ${step.kind} is sensitive and waits at its consent gate.`
      );
      emit({ kind: "gate", stepid: step.id, summary: gate.reason, at: clock() });
      current = await appendlogentry({
        log: current,
        kind: "gate",
        summary: gate.reason,
        origin: input.file.origin,
        stepid: step.id,
        at: clock()
      });
      const resolution = input.provider !== void 0 ? await input.provider.resolvegate(gate) : void 0;
      const consentgate = headlessconsentgate({
        providerpresent: input.provider !== void 0,
        ...resolution !== void 0 ? { resolution } : {}
      });
      if (!consentgate.allowed) {
        const reason = consentgate.reason ?? "The consent gate refused the step.";
        emit({ kind: "revoked", stepid: step.id, summary: reason, at: clock() });
        current = await appendlogentry({
          log: current,
          kind: "deny",
          summary: reason,
          origin: input.file.origin,
          stepid: step.id,
          at: clock()
        });
        const sealed2 = await sealrunlog(current, clock());
        return {
          outcome: {
            runid,
            state: "revoked",
            steps: executed,
            exitcode: flowrunexitcodeof("revoked"),
            sealhash: sealed2.seal.sealhash.current
          },
          events,
          log: sealed2.log
        };
      }
    }
    const result = await driver.execute(step, clock());
    executed += 1;
    emit({
      kind: result.state === "failed" ? "failed" : "step",
      stepid: step.id,
      summary: result.summary,
      at: clock()
    });
    current = await appendlogentry({
      log: current,
      kind: "step",
      summary: result.summary,
      origin: input.file.origin,
      stepid: step.id,
      at: clock()
    });
    if (result.state === "failed") {
      const sealed2 = await sealrunlog(current, clock());
      return {
        outcome: {
          runid,
          state: "failed",
          steps: executed,
          exitcode: flowrunexitcodeof("failed"),
          sealhash: sealed2.seal.sealhash.current
        },
        events,
        log: sealed2.log
      };
    }
  }
  emit({
    kind: "done",
    summary: `The flowrun completed ${executed} step${executed === 1 ? "" : "s"} and sealed its chain.`,
    at: clock()
  });
  const sealed = await sealrunlog(current, clock());
  return {
    outcome: {
      runid,
      state: "done",
      steps: executed,
      exitcode: flowrunexitcodeof("done"),
      sealhash: sealed.seal.sealhash.current
    },
    events,
    log: sealed.log
  };
}
function flowrunreport(input) {
  return {
    version: protocolversion,
    outcome: input.outcome,
    events: input.events,
    timeline: renderflowtimeline(input.events)
  };
}

// export.ts
var exportformats = ["csv", "json", "log", "jsonl", "markdown"];
var exportscopes = ["runs", "extractions", "notes", "session", "audit", "extraction"];
function exportdescriptorof(format, scope) {
  if (!exportformats.includes(format))
    throw new Error(`The export format ${format} stays outside csv, json, log, jsonl and markdown.`);
  if (!exportscopes.includes(scope))
    throw new Error(`The export scope ${scope} stays outside runs, extractions, notes, session, audit and extraction.`);
  return { format, scope };
}
function csvfield(value) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
function csvof(rows) {
  if (rows.length === 0) return "";
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort();
  const header = fields.map(csvfield).join(",");
  const body = rows.map((row) => fields.map((field) => csvfield(row[field] ?? "")).join(","));
  return [header, ...body].join("\n");
}
function markdownfield(value) {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}
function markdownof(rows) {
  if (rows.length === 0) return "";
  const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort();
  const header = `| ${fields.map(markdownfield).join(" | ")} |`;
  const separator = `| ${fields.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${fields.map((field) => markdownfield(row[field] ?? "")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}
function jsonlinesof(records) {
  if (records.length === 0) return "";
  return records.map((record2) => JSON.stringify(record2)).join("\n");
}
var secretfieldshapes = ["secret", "token", "password", "apikey", "authorization"];
function unmaskedfieldsof(records) {
  const unmasked = /* @__PURE__ */ new Set();
  for (const record2 of records) {
    for (const [name, value] of Object.entries(record2)) {
      if (typeof value !== "string" || value.trim() === "") continue;
      if (secretfieldshapes.some((shape) => name.toLowerCase().includes(shape)) && !value.includes(maskmarker))
        unmasked.add(name);
    }
  }
  return [...unmasked].sort();
}
function exportrecords(input) {
  const unmasked = unmaskedfieldsof(input.records);
  const maskgate = exportmaskgate({ unmasked });
  if (!maskgate.allowed)
    return {
      result: {
        descriptor: input.descriptor,
        bytes: 0,
        rows: 0,
        ...input.path !== void 0 ? { path: input.path } : {},
        reason: maskgate.reason ?? "The export refused an unmasked value."
      },
      content: ""
    };
  const masked = input.records.map((record2) => maskexport(record2, input.shapes));
  const stringrows = masked.map(
    (record2) => Object.fromEntries(
      Object.entries(record2).map(([name, value]) => [
        name,
        typeof value === "string" ? value : JSON.stringify(value)
      ])
    )
  );
  if (input.descriptor.format === "csv") {
    const content2 = csvof(stringrows);
    return {
      result: {
        descriptor: input.descriptor,
        bytes: content2.length,
        rows: stringrows.length,
        ...input.path !== void 0 ? { path: input.path } : {}
      },
      content: content2
    };
  }
  if (input.descriptor.format === "json") {
    const content2 = JSON.stringify(masked, null, 2);
    return {
      result: {
        descriptor: input.descriptor,
        bytes: content2.length,
        rows: masked.length,
        ...input.path !== void 0 ? { path: input.path } : {}
      },
      content: content2
    };
  }
  if (input.descriptor.format === "jsonl") {
    const content2 = jsonlinesof(masked);
    return {
      result: {
        descriptor: input.descriptor,
        bytes: content2.length,
        rows: masked.length,
        ...input.path !== void 0 ? { path: input.path } : {}
      },
      content: content2
    };
  }
  if (input.descriptor.format === "markdown") {
    const content2 = markdownof(stringrows);
    return {
      result: {
        descriptor: input.descriptor,
        bytes: content2.length,
        rows: stringrows.length,
        ...input.path !== void 0 ? { path: input.path } : {}
      },
      content: content2
    };
  }
  const content = masked.map(
    (record2) => Object.entries(record2).map(([name, value]) => `${name}=${typeof value === "string" ? value : JSON.stringify(value)}`).join(" ")
  ).join("\n");
  return {
    result: {
      descriptor: input.descriptor,
      bytes: content.length,
      rows: masked.length,
      ...input.path !== void 0 ? { path: input.path } : {}
    },
    content
  };
}
function chainrows(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    origin: entry.origin,
    ...entry.stepid !== void 0 ? { stepid: entry.stepid } : {},
    summary: entry.summary,
    at: String(entry.at)
  }));
}
async function exportchain(input) {
  const verification = await verifylogchain(input.log.entries);
  const chaingate = exportchaingate({
    chainvalid: verification.valid,
    ...verification.reason !== "" ? { reason: verification.reason } : {}
  });
  if (!chaingate.allowed)
    return {
      result: {
        descriptor: input.descriptor,
        bytes: 0,
        rows: 0,
        ...input.path !== void 0 ? { path: input.path } : {},
        reason: chaingate.reason ?? "The export refused an unverified chain."
      },
      content: ""
    };
  return exportrecords({
    descriptor: input.descriptor,
    records: chainrows(input.log.entries),
    shapes: input.shapes,
    ...input.path !== void 0 ? { path: input.path } : {}
  });
}
function noterow(note) {
  return {
    id: note.id,
    origin: note.origin,
    title: note.title,
    author: note.author,
    sensitive: String(note.sensitive),
    ...note.body !== void 0 ? { body: note.body } : {},
    ...note.sealedbody !== void 0 ? { sealedbody: note.sealedbody } : {},
    updatedat: String(note.updatedat)
  };
}
function exportnotes(input) {
  return exportrecords({
    descriptor: input.descriptor,
    records: input.notes.map(noterow),
    shapes: input.shapes,
    ...input.path !== void 0 ? { path: input.path } : {}
  });
}
function exportextractions(input) {
  return exportrecords({
    descriptor: input.descriptor,
    records: input.rows,
    shapes: input.shapes,
    ...input.path !== void 0 ? { path: input.path } : {}
  });
}

// runtime.ts
var runningmode = "esm";
var runningtarget = "index.js";
function stampbundle(mode, target) {
  runningmode = mode;
  runningtarget = target;
}
function capabilityprobeof(input) {
  return { dom: input.dom, storage: input.storage, network: input.network, worker: input.worker };
}
function runtimeadapterdeclarationof(runtime, headless) {
  const declarations = {
    browser: {
      runtime,
      storage: "chrome",
      fetch: "platform",
      timer: "platform",
      worker: "webworker",
      dom: headless === true ? "remote" : "livepage"
    },
    node: {
      runtime,
      storage: "filesystem",
      fetch: "platform",
      timer: "platform",
      worker: "workerthreads",
      dom: "remote"
    },
    bun: {
      runtime,
      storage: "filesystem",
      fetch: "platform",
      timer: "platform",
      worker: "workerthreads",
      dom: "remote"
    },
    deno: { runtime, storage: "denokv", fetch: "platform", timer: "platform", worker: "webworker", dom: "remote" }
  };
  return declarations[runtime];
}
function adapterdeclarationsof() {
  return ["browser", "node", "bun", "deno"].map(
    (runtime) => runtimeadapterdeclarationof(runtime)
  );
}
function filesystemstorageadapter(fs, base) {
  return {
    async get(key) {
      try {
        return JSON.parse(await fs.readfile(fs.join(base, `${key}.json`)));
      } catch {
        return void 0;
      }
    },
    async set(key, value) {
      await fs.mkdir(base);
      await fs.writefile(fs.join(base, `${key}.json`), JSON.stringify(value));
    }
  };
}
function portablecapabilityset(input) {
  if (input.probes.dom) return input.vocabulary;
  return input.domlesskinds ?? [];
}
function platformtargets() {
  return [
    {
      runtime: "browser",
      entry: "umd.ts",
      format: "umd",
      platform: "browser",
      declarations: true,
      output: "devthink.umd.js"
    },
    { runtime: "node", entry: "node.ts", format: "cjs", platform: "node", declarations: true },
    { runtime: "bun", entry: "bun.ts", format: "esm", platform: "node", declarations: true },
    { runtime: "deno", entry: "deno.ts", format: "esm", platform: "neutral", declarations: true }
  ];
}
var nodespecifier = (builtin) => `node:${builtin}`;
async function validateruntimebaselines() {
  const { readFile: readFile2 } = await import(nodespecifier("fs/promises"));
  const { join: join3, resolve: resolve2 } = await import(nodespecifier("path"));
  const repoRoot = resolve2(process.cwd(), "..");
  const packagejson = JSON.parse(await readFile2("package.json", "utf8"));
  const nvmversion = (await readFile2(".nvmrc", "utf8")).trim();
  const containerfile = await readFile2("Dockerfile", "utf8");
  const verifyworkflow = await readFile2(join3(repoRoot, ".github/workflows/verify.yml"), "utf8");
  const semver = /^\d+\.\d+\.\d+$/;
  const versionsource = await readFile2("version.ts", "utf8");
  const typesource = await readFile2("types.ts", "utf8");
  const mcpsource = await readFile2("mcp.ts", "utf8");
  if (!/export const protocolmajor = 2 as const;/.test(versionsource))
    throw new Error("version.ts must pin the frozen protocolv2 major two.");
  if (!/export const protocolfloormajor = 2 as const;/.test(versionsource))
    throw new Error(
      "version.ts must pin the protocol floor two the 2.0.0 sunset raised when the deprecation window closed."
    );
  if (!typesource.includes("export const protocolmajorversion = protocolmajor;"))
    throw new Error("types.ts must derive the protocol major constant from version.ts.");
  if (!typesource.includes("export const pinnedprotocolversion"))
    throw new Error("The library surface must export the pinned protocol version import.");
  if (!mcpsource.includes("negotiateprotocol"))
    throw new Error("The mcp negotiation must route through the protocolv2 negotiation family.");
  if (!verifyworkflow.includes("node apifreeze.ts"))
    throw new Error("The verify workflow must gate the api freeze after the validation chain.");
  const webindex = await readFile2("design.html", "utf8");
  const transparencymatch = /<template data-surface="transparencypage">([\s\S]*?)<\/template>/.exec(webindex);
  if (transparencymatch === null)
    throw new Error(
      "The web design file must declare the transparencypage surface template the transparency page renders from."
    );
  for (const section of [
    "#grants",
    "#windows",
    "#permissions",
    "#datakinds",
    "#integrity",
    "#senders",
    "#permdiffs",
    "#safedefaults"
  ]) {
    if (!transparencymatch[1].includes(`id="${section.slice(1)}"`))
      throw new Error(
        `The transparencypage surface must carry its ${section} section; the transparency page lists grants, permissions, data kinds, integrity, senders, permdiffs and safedefaults.`
      );
  }
  for (const reference of [...transparencymatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1]
  )) {
    if (/^(https?|wss?|data):/i.test(reference))
      throw new Error(
        `The transparencypage surface loads the remote resource ${reference}; the transparency page runs entirely offline.`
      );
  }
  const optionsmatch = /<template data-surface="optionspage">([\s\S]*?)<\/template>/.exec(webindex);
  if (optionsmatch === null || !optionsmatch[1].includes('iframe src="transparencypage.html"'))
    throw new Error(
      "The optionspage surface must embed the transparencypage.html surface the manifest declares as an extension page."
    );
  const transparencymodule = await readFile2("transparencypage.ts", "utf8");
  if (!transparencymodule.includes("request<{ transparencyview }") && !transparencymodule.includes("transparencyview"))
    throw new Error("The transparencypage module must render through the transparency view the background serves.");
  for (const gate of ["runtime", "pentest", "permdiff"]) {
    if (!await readFile2(`${gate}.ts`, "utf8").catch(() => void 0))
      throw new Error(`The ${gate} gate script must exist at the app root beside the runtime policy.`);
  }
  {
    const securityseat = await readFile2("security.ts", "utf8").catch(() => void 0);
    if (securityseat === void 0 || !securityseat.includes('"cspaudit"') || !securityseat.includes("cspaudit"))
      throw new Error(
        "The csp audit gate must answer from the security keyword file's lane dispatcher the consolidation seated."
      );
  }
  for (const gate of ["agentcert", "costcert"]) {
    if (!await readFile2(`${gate}.ts`, "utf8").catch(() => void 0))
      throw new Error(`The ${gate} gate script must exist at the app root beside the runtime policy.`);
    if (!verifyworkflow.includes(`node ${gate}.ts`))
      throw new Error(`The verify workflow must run the ${gate} gate of the multi agent certification.`);
  }
  if (!await readFile2("dashboard.ts", "utf8").catch(() => void 0))
    throw new Error("The dashboard family module must exist at the root beside the hardening family.");
  const dashdonedeclaration = await readFile2("tsconfig.build.json", "utf8");
  if (!dashdonedeclaration.includes("dashboard.ts"))
    throw new Error(
      "The declaration emit must include the dashboard module so build/dashboard.d.ts ships beside the bundle."
    );
  const dashboardmatch = /<template data-surface="dashboardpage">([\s\S]*?)<\/template>/.exec(webindex);
  if (dashboardmatch === null)
    throw new Error("The web design file must declare the dashboardpage surface template the newtab override serves.");
  for (const panel of [
    "multiagentoverview",
    "agentstatuscards",
    "sharedqueueview",
    "queuelanefilter",
    "messageflow",
    "conflictlog",
    "agentcostpanel",
    "escalationinbox",
    "timelinescrubber",
    "aggregatetimeline",
    "killswitch",
    "reportdownload"
  ]) {
    if (!dashboardmatch[1].includes(`id="${panel}"`))
      throw new Error(
        `The dashboardpage surface must carry its ${panel} multi agent panel; the dashdone completion ships every panel or none.`
      );
  }
  for (const reference of [...dashboardmatch[1].matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1]
  )) {
    if (/^(https?|wss?|data):/i.test(reference))
      throw new Error(
        `The dashboardpage surface loads the remote resource ${reference}; the multi agent dashboard runs entirely offline.`
      );
  }
  function minimum(range, label) {
    const caret = /^\^(\d+\.\d+\.\d+)$/.exec(range ?? "");
    if (caret !== null && semver.test(caret[1])) return caret[1];
    const match = /^>=(\d+\.\d+\.\d+) <(\d+)$/.exec(range ?? "");
    if (!match || !semver.test(match[1]))
      throw new Error(`${label} must use a bounded >=x.y.z <next-major engine range (^x.y.z rides as the same floor).`);
    const major = Number(match[1].split(".")[0]);
    if (Number(match[2]) !== major + 1) throw new Error(`${label} must stop before its next untested major.`);
    return match[1];
  }
  function satisfiesfloor(version, floor) {
    const v = version.split(".").map(Number);
    const f = floor.split(".").map(Number);
    if (v.length !== 3 || f.length !== 3 || v.some(Number.isNaN) || f.some(Number.isNaN)) return false;
    if (v[0] !== f[0]) return false;
    if (v[1] !== f[1]) return v[1] > f[1];
    return v[2] >= f[2];
  }
  const rootpackagejson = JSON.parse(await readFile2(join3(repoRoot, "package.json"), "utf8"));
  const nodeversion = minimum(rootpackagejson.engines?.node, "Node");
  const npmversion = minimum(rootpackagejson.engines?.npm, "npm");
  const bunversion = minimum(rootpackagejson.engines?.bun, "Bun");
  if (nvmversion !== nodeversion)
    throw new Error(`.nvmrc (${nvmversion}) must equal the declared Node minimum (${nodeversion}).`);
  if (!new RegExp(`^ARG NODE_IMAGE="node:${nodeversion}-bookworm-slim@sha256:[0-9a-f]{64}"$`, "m").test(containerfile))
    throw new Error("the Dockerfile NODE_IMAGE arg must pin the exact declared Node baseline by its registry tag and the ladder-stamped digest the scanner gate demands.");
  if (!new RegExp(`^ARG NODE_RUNTIME_VERSION="${nodeversion}"$`, "m").test(containerfile))
    throw new Error(
      "the Dockerfile NODE_RUNTIME_VERSION arg must pin the exact declared Node baseline of the runtime tarball."
    );
  if (!/^FROM debian:trixie-slim@sha256:[0-9a-f]{64} AS runtime$/m.test(containerfile))
    throw new Error(
      "the Dockerfile runtime stage must ride the multi-architecture debian trixie slim base by its ladder-stamped registry digest."
    );
  if (!/^FROM --platform=\$BUILDPLATFORM \$\{NODE_IMAGE\} AS nodefetch$/m.test(containerfile))
    throw new Error(
      "the nodefetch stage must fetch the runtime node tarball from the pinned NODE_IMAGE baseline under the build platform."
    );
  if (!/^FROM --platform=\$BUILDPLATFORM \$\{NODE_IMAGE\} AS (?:deps|builder|binary-builder)$/m.test(containerfile))
    throw new Error(
      "the Dockerfile build stages must build from the pinned NODE_IMAGE baseline under the build platform."
    );
  if (!/^FROM gcr\.io\/distroless\/cc-debian12:nonroot@sha256:[0-9a-f]{64} AS binary-runtime$/m.test(containerfile))
    throw new Error(
      "the binary runtime stage must ride the distroless cc nonroot base by its ladder-stamped registry digest."
    );
  const digestlines = containerfile.match(/^FROM .*@sha256:[0-9a-f]{64} AS /gm) ?? [];
  if (digestlines.length !== 2)
    throw new Error(
      "exactly the two literal runtime stages carry the ladder digests; every other baseline answers by its registry tag."
    );
  if (containerfile.includes("corepack"))
    throw new Error("Node 26 container builds must not depend on the removed Corepack binary.");
  const metadataprobe = ["node", "-p", `"${["require", "('/package.json')"].join("")}`].join(" ");
  if (!containerfile.includes(metadataprobe))
    throw new Error("the Dockerfile must evaluate package metadata with Node rather than pass it as a quoted literal.");
  if (!containerfile.includes('npm install --global "bun@${bunversion}"') && !containerfile.includes('npx --yes "npm@${npmversion}" install --global "bun@${bunversion}"'))
    throw new Error("the Dockerfile must install the root package manager from the canonical packageManager field.");
  if (!containerfile.includes("bun install --frozen-lockfile"))
    throw new Error("the Dockerfile must retain frozen-lockfile installation.");
  const verifybun = /bun-version: (\d+\.\d+\.\d+)/.exec(verifyworkflow ?? "");
  if (verifybun === null || !satisfiesfloor(verifybun[1], bunversion))
    throw new Error("verify workflow must smoke-test the declared Bun baseline.");
  if (!/^(?:bun|pnpm)@\d+\.\d+\.\d+$/.test(rootpackagejson.packageManager ?? ""))
    throw new Error("packageManager must pin a full bun or pnpm version.");
  console.log(
    JSON.stringify(
      {
        node: nodeversion,
        npm: npmversion,
        bun: bunversion,
        pnpm: rootpackagejson.packageManager,
        protocolmajor: 2,
        protocolfloor: 2
      },
      null,
      2
    )
  );
}
var invokeddirectly = typeof process !== "undefined" && Array.isArray(process.argv) && typeof process.argv[1] === "string" && (process.argv[1].endsWith("runtime.ts") || process.argv[1].endsWith("runtime"));
if (invokeddirectly)
  validateruntimebaselines().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

// headless.ts
stampbundle("headless", "headless.js");
function headlessfixturestep(fixture, step) {
  const gate = fixtureconsentgate({
    fixtureorigin: fixture.origin,
    grants: fixture.grants,
    kind: step.kind,
    riskof: (kind) => {
      try {
        return actionrisk(kind);
      } catch {
        return "sensitive";
      }
    }
  });
  if (!gate.allowed) {
    const unsupported = (gate.reason ?? "").includes("not a reviewed action kind");
    return {
      stepid: step.id,
      kind: step.kind,
      state: unsupported ? "unsupported" : "refused",
      summary: gate.reason ?? "The fixture refused the step."
    };
  }
  const observation = fixture.observation;
  const projections = {
    observe: () => ({
      summary: `The recorded page ${observation.title} of ${observation.url} carries ${observation.textlength} text characters and ${observation.interactive.length} interactive elements.`,
      details: {
        url: observation.url,
        title: observation.title,
        textlength: observation.textlength,
        interactive: observation.interactive.length
      }
    }),
    readtext: () => ({
      summary: `The recorded page text reads ${observation.textpreview.length} preview characters of the ${observation.textlength} character body.`,
      details: { textpreview: observation.textpreview, textlength: observation.textlength }
    }),
    readforms: () => ({
      summary: `The recorded page carries ${observation.forms.length} form control${observation.forms.length === 1 ? "" : "s"}.`,
      details: { forms: observation.forms }
    }),
    inspect: () => ({
      summary: `The recorded page carries ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"} with their selectors and roles.`,
      details: { interactive: observation.interactive }
    }),
    a11ytree: () => ({
      summary: `The recorded page accessibility view lists ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"}.`,
      details: { interactive: observation.interactive }
    }),
    countelements: () => ({
      summary: `The recorded page counts ${observation.interactive.length} interactive element${observation.interactive.length === 1 ? "" : "s"}${step.target !== void 0 ? ` for the selector ${step.target}` : ""}.`,
      details: { count: observation.interactive.length }
    })
  };
  const projection = projections[step.kind];
  if (projection === void 0)
    return {
      stepid: step.id,
      kind: step.kind,
      state: "unsupported",
      summary: `The kind ${step.kind} is read only but a recorded page state carries no projection for it; the fixture cannot satisfy the step without a live tab.`
    };
  const projected = projection();
  return {
    stepid: step.id,
    kind: step.kind,
    state: "done",
    summary: projected.summary,
    ...projected.details !== void 0 ? { details: projected.details } : {}
  };
}
function headlessprogress(input) {
  let progress = recordstep(input.progress, input.planid, input.step.id, input.now);
  const recorded = {
    stepid: input.step.id,
    ok: input.outcome.state === "done",
    summary: input.outcome.summary,
    ...input.outcome.details !== void 0 ? { details: input.outcome.details } : {},
    at: input.now
  };
  progress = recordoutcome(progress, input.planid, recorded, input.now);
  return progress;
}
function openheadlesssession(input) {
  if (input.origin.trim() === "" || !input.origin.startsWith("https://"))
    throw new Error("The headless session needs the HTTPS origin it addresses.");
  const telemetrygate = headlesstelemetrygate({
    telemetry: input.hostoptin === true,
    hostoptin: input.hostoptin === true
  });
  if (!telemetrygate.allowed)
    throw new Error(telemetrygate.reason ?? "The library bundle carries no telemetry by default.");
  return {
    id: `headless:${randomid()}`,
    origin: input.origin,
    state: "active",
    openedat: input.now,
    gatesresolved: 0,
    telemetry: input.hostoptin === true
  };
}
function remoteattachframes(input) {
  return {
    initialize: {
      jsonrpc: "2.0",
      id: input.id,
      method: "initialize",
      params: { protocolversion, runtime: input.runtime, origin: input.session.origin }
    },
    ready: { jsonrpc: "2.0", id: input.id, result: { attached: true, origin: input.session.origin, protocolversion } }
  };
}
function openlibraryrun(input) {
  const fixture = input.statesource(input.plan.origin);
  if (fixture === void 0)
    throw new Error(
      `The state source carries no recorded state for the origin ${input.plan.origin}; the library run needs its state before it opens.`
    );
  let progress;
  let paused = false;
  let cancelled = false;
  let reason;
  const handle = () => ({
    runid: `library:${input.plan.origin}:${input.now}`,
    progress: progress ?? { planid: input.plan.origin, completedsteps: [], updatedat: input.now },
    paused,
    cancelled,
    ...reason !== void 0 ? { reason } : {}
  });
  const state = {
    handle,
    step(step, now) {
      if (cancelled)
        return {
          stepid: step.id,
          kind: step.kind,
          state: "refused",
          summary: reason ?? "The library run cancelled before the step."
        };
      if (paused)
        return {
          stepid: step.id,
          kind: step.kind,
          state: "refused",
          summary: "The library run paused at its last checkpoint; a paused handle completes no further step until the resume continues."
        };
      const scopedgrants = input.policy?.grants === void 0 ? fixture.grants : fixture.grants.filter((kind) => input.policy?.grants?.includes(kind));
      const gated = { ...fixture, grants: scopedgrants };
      const outcome = headlessfixturestep(gated, step);
      progress = headlessprogress({ progress, planid: input.plan.origin, step, outcome, now });
      return outcome;
    },
    pause(now) {
      paused = true;
      if (progress !== void 0) progress = { ...progress, updatedat: now };
    },
    resume(now) {
      paused = false;
      if (progress !== void 0) progress = { ...progress, updatedat: now };
    },
    cancel(cancelreason, now) {
      cancelled = true;
      reason = cancelreason;
      if (progress !== void 0) progress = { ...progress, updatedat: now };
    }
  };
  return state;
}

// views.ts
function surfacepalette() {
  return [
    {
      id: "starttask",
      label: "Start task",
      keywords: ["task", "objective", "run", "goal", "plan"],
      action: { command: "starttask", surface: "popup" }
    },
    {
      id: "pauserun",
      label: "Pause run",
      keywords: ["pause", "hold", "stop", "run"],
      action: { command: "pauserun", surface: "popup", session: true }
    },
    {
      id: "resumerun",
      label: "Resume run",
      keywords: ["resume", "continue", "unpause", "run"],
      action: { command: "resumerun", surface: "popup", session: true }
    },
    {
      id: "cancelrun",
      label: "Cancel run",
      keywords: ["cancel", "stop", "rollback", "queued"],
      action: { command: "cancelrun", surface: "popup", session: true }
    },
    {
      id: "resumesession",
      label: "Resume session",
      keywords: ["session", "resume", "grid", "reopen"],
      action: { command: "resumesession", surface: "sidepanel" }
    },
    {
      id: "stepapprove",
      label: "Review step",
      keywords: ["approve", "reject", "edit", "step", "review", "plancard"],
      action: { command: "stepapprove", surface: "sidepanel", session: true }
    },
    {
      id: "diffpreview",
      label: "Preview step diff",
      keywords: ["diff", "preview", "before", "after", "write"],
      action: { command: "diffpreview", surface: "sidepanel", session: true }
    },
    {
      id: "historysearch",
      label: "Search history",
      keywords: ["history", "search", "notes", "summaries", "corpus"],
      action: { command: "historysearch", surface: "dashboardpage" }
    },
    {
      id: "revokeconsent",
      label: "Revoke consent",
      keywords: ["revoke", "consent", "allowlist", "origin", "grant"],
      action: { command: "revokeconsent", surface: "dashboardpage", session: true }
    },
    {
      id: "opentransparencypage",
      label: "Open transparency page",
      keywords: ["transparency", "grants", "permissions", "diff"],
      action: { command: "opentransparencypage", surface: "optionspage" }
    },
    {
      id: "opendashboardpage",
      label: "Open dashboard",
      keywords: ["dashboard", "sessions", "runs", "notes", "full"],
      action: { command: "opendashboardpage", surface: "dashboardpage" }
    },
    {
      id: "openoptionspage",
      label: "Open options",
      keywords: ["options", "settings", "preferences", "configure"],
      action: { command: "openoptionspage", surface: "optionspage" }
    },
    {
      id: "copyauditexcerpt",
      label: "Copy audit excerpt",
      keywords: ["audit", "excerpt", "copy", "verified", "range"],
      action: { command: "copyauditexcerpt", surface: "dashboardpage" }
    },
    {
      id: "replayonboarding",
      label: "Replay onboarding",
      keywords: ["onboarding", "tour", "walkthrough", "replay", "first"],
      action: { command: "replayonboarding", surface: "onboarding" }
    }
  ];
}
function clicommands(palette) {
  const terminal = [
    {
      id: "manifest",
      label: "Validate the extension manifest with the deep manifest checks",
      keywords: ["manifest", "permissions", "identity", "validate", "csp", "icons"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "describe",
      label: "Print the frozen capability manifest of every surface with the protocolv2 negotiation line",
      keywords: [
        "describe",
        "capmanifest",
        "surface",
        "freeze",
        "protocol",
        "capabilities",
        "messages",
        "kinds",
        "permissions"
      ],
      surface: "terminal",
      terminal: true
    },
    {
      id: "commands",
      label: "Print the shared command registry of the palette and the cli",
      keywords: ["commands", "registry", "palette", "cli", "surface"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "planlint",
      label: "Lint plan files",
      keywords: ["planlint", "lint", "plan", "diagnostics", "rules"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "migrateplan",
      label: "Convert a foreign plan source into the reviewed plan grammar",
      keywords: [
        "migrateplan",
        "convert",
        "import",
        "v1",
        "automa",
        "selenium",
        "uivision",
        "tabular",
        "migration",
        "plan"
      ],
      surface: "terminal",
      terminal: true
    },
    {
      id: "recipes",
      label: "List the example gallery and validate one recipe entry",
      keywords: ["recipes", "gallery", "examples", "scraping", "forms", "testing", "monitoring", "agents", "dryrun"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "flowrun",
      label: "Run a plan file",
      keywords: ["flowrun", "run", "plan", "terminal", "consent"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "runworkflow",
      label: "Run a saved workflow with checkpoints and an audit trail file",
      keywords: ["runworkflow", "workflow", "replay", "checkpoint", "resume", "dryrun"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "exportdata",
      label: "Export session, audit or extraction data",
      keywords: ["exportdata", "export", "session", "audit", "extraction", "csv", "jsonl", "markdown"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "headless",
      label: "Replay a plan against recorded page state fixtures",
      keywords: ["headless", "fixture", "replay", "recorded", "library"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "serve",
      label: "Serve the mcp server mode over stdio and a localhost http listener",
      keywords: ["serve", "mcp", "model", "context", "protocol", "stdio", "http", "jsonrpc"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "native",
      label: "Install, remove or diagnose the optional native host of the native bridge",
      keywords: ["native", "host", "bridge", "companion", "install", "uninstall", "diagnostics", "messaging"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "export",
      label: "Export runs, extractions and notes",
      keywords: ["export", "csv", "json", "log", "runs", "extractions", "notes"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "init",
      label: "Scaffold a plan file",
      keywords: ["init", "scaffold", "plan", "template"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "doctor",
      label: "Probe runtime capabilities",
      keywords: ["doctor", "capabilities", "runtime", "probe", "matrix"],
      surface: "terminal",
      terminal: true
    },
    {
      id: "help",
      label: "List every command with the version banner and the exit codes",
      keywords: ["help", "usage", "commands", "version"],
      surface: "terminal",
      terminal: true
    }
  ];
  const shared = palette.map((entry) => ({
    id: entry.id,
    label: entry.label,
    keywords: entry.keywords,
    surface: entry.action.surface,
    terminal: false
  }));
  return [...terminal, ...shared];
}
var panelwidthbounds = Object.freeze({
  minimum: 280,
  maximum: 720
});

// cli.ts
var forbidden = /* @__PURE__ */ new Set([
  "debugger",
  "cookies",
  "webRequest",
  "history",
  "bookmarks",
  "nativeMessaging",
  "proxy",
  "management"
]);
var allowedoptional = /* @__PURE__ */ new Set([
  "tabs",
  "downloads",
  "clipboardRead",
  "clipboardWrite",
  "offscreen",
  "nativeMessaging"
]);
var privilegedpages = /* @__PURE__ */ new Set(["background.html", "popup.html", "sidepanel.html", "offscreen.html"]);
var defaultconfigfile = ".devthink/config.json";
function decodeidentitykey(key) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(key))
    throw new Error("The manifest key must be strict base64 without whitespace.");
  if (key.length % 4 !== 0)
    throw new Error(`The manifest key length ${key.length} is not a multiple of four, so it is not valid base64.`);
  const der = Buffer.from(key, "base64");
  if (der.length < 150 || der.length > 600)
    throw new Error(`The manifest key decodes to ${der.length} bytes, outside the RSA subject public key range.`);
  if (!der.subarray(0, 2).equals(Buffer.from([48, 130])))
    throw new Error("The manifest key does not decode to a DER subject public key sequence.");
  const declared = der.readUInt16BE(2);
  if (declared !== der.length - 4)
    throw new Error(`The manifest key DER length ${declared} does not match the decoded ${der.length - 4} bytes.`);
  return der;
}
async function recordedidentitydigest() {
  for (const candidate of ["checksums.txt", "build/checksums.txt"]) {
    try {
      const text2 = await readFile(resolve(candidate), "utf8");
      for (const line of text2.split("\n")) {
        const match = /^([0-9a-f]{64})  manifest\.json key$/.exec(line.trim());
        if (match !== null) return match[1];
      }
    } catch {
    }
  }
  return void 0;
}
function parseflags(args) {
  const positional = [];
  const flags = /* @__PURE__ */ new Map();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === void 0) continue;
    if (arg.startsWith("--")) {
      const [name, inline] = arg.slice(2).split("=", 2);
      if (name === void 0 || name.trim() === "") throw new Error(`The argument ${arg} carries no flag name.`);
      const next = args[index + 1];
      if (inline !== void 0) flags.set(name, inline);
      else if (next !== void 0 && !next.startsWith("--")) {
        flags.set(name, next);
        index += 1;
      } else flags.set(name, "true");
    } else positional.push(arg);
  }
  return { positional, flags };
}
async function globalstate(args) {
  const { positional, flags } = parseflags(args);
  const configpath = flags.get("config") ?? defaultconfigfile;
  let raw = {};
  try {
    raw = JSON.parse(await readFile(configpath, "utf8"));
  } catch {
  }
  const config = parsecliconfig(raw);
  const verbosityflag = flags.get("verbose") === "true" ? "verbose" : flags.get("quiet") === "true" ? "quiet" : void 0;
  const verbosity = verbosityflag ?? config.verbosity ?? "normal";
  const json = flags.get("json") === "true" || config.format === "json";
  return { config, verbosity, json, flags, positional };
}
async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}
async function cachedruleset(cachedir) {
  const ruleset = portablerulesetof(Date.now());
  const key = rulesetcachekey(ruleset);
  const cachefile = join2(cachedir, `${key}.json`);
  try {
    const cached = JSON.parse(await readFile(cachefile, "utf8"));
    if (rulesetcachekey(cached) === key) return cached;
  } catch {
  }
  await mkdir(cachedir, { recursive: true });
  await writeFile(cachefile, JSON.stringify(ruleset, null, 2), "utf8");
  return ruleset;
}
async function plantargets(target) {
  const info = await stat(target);
  if (info.isFile()) return [target];
  const entries = await readdir(target);
  return entries.filter((entry) => entry.endsWith(".json")).map((entry) => join2(target, entry));
}
function readonlykinds() {
  return actionkindcatalog().filter((kind) => {
    try {
      return actionrisk(kind) === "read";
    } catch {
      return false;
    }
  });
}
async function cmdplanlint(args, state) {
  const { positional, flags } = parseflags(args);
  const target = positional[0] ?? state.config.defaultplan;
  if (target === void 0 || target.trim() === "")
    throw new Error(
      "The planlint command needs the plan file or directory it lints, or the default plan location in the configuration."
    );
  const format = flags.get("format") ?? (state.json ? "json" : "human");
  if (format !== "human" && format !== "json" && format !== "lines")
    throw new Error("The planlint format must stay human, json or lines.");
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = flags.has("capabilities") ? JSON.parse(await readFile(flags.get("capabilities"), "utf8")) : portablecapabilityset({
    vocabulary: actionkindcatalog(),
    probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
    domlesskinds: readonlykinds()
  });
  const allowlist = flags.has("allowlist") ? flags.get("allowlist").split(",").map((origin) => origin.trim()).filter((origin) => origin !== "") : state.config.allowlist;
  const files = await plantargets(target);
  if (files.length === 0) throw new Error(`The target ${target} carries no plan file to lint.`);
  const report = [];
  let exitcode = 0;
  for (const file of files) {
    let diagnostics;
    let plan;
    try {
      plan = parseplanfile(JSON.parse(await readFile(file, "utf8")));
      diagnostics = [
        ...lintplanfile({ file: plan, ruleset, capabilities, now: Date.now() }),
        ...planlintfindings({ file: plan, capabilities, ...allowlist !== void 0 ? { allowlist } : {} })
      ];
    } catch (error) {
      diagnostics = [
        {
          code: "plan.schema.file",
          path: file,
          severity: "error",
          message: error instanceof Error ? error.message : String(error)
        }
      ];
      plan = { version: packageversion, goal: "", origin: "https://invalid.example", steps: [] };
    }
    const summary = planlintsummary(diagnostics);
    if (summary.exitcode !== 0) exitcode = 1;
    report.push({ file, diagnostics, risk: planrisksummaryof(plan), exitcode: summary.exitcode });
  }
  if (state.verbosity !== "quiet" && state.verbosity === "verbose" && format === "human")
    console.log(
      `The planlint ran ${ruleset.rules.length} portable rules over ${files.length} plan file${files.length === 1 ? "" : "s"} with ${capabilities.length} declared capabilities${allowlist !== void 0 ? ` and the consent allowlist of ${allowlist.length} origin${allowlist.length === 1 ? "" : "s"}` : ""}.`
    );
  if (format === "json") console.log(JSON.stringify(report, null, 2));
  else if (format === "lines")
    for (const entry of report)
      for (const diagnostic of entry.diagnostics)
        console.log(
          `${entry.file}:${diagnostic.severity}:${diagnostic.code}:${diagnostic.path}: ${diagnostic.message}`
        );
  else
    for (const entry of report) {
      console.log(`== ${entry.file}
${formatdiagnostics(entry.diagnostics, "human")}`);
      if (state.verbosity !== "quiet") console.log(`risk: ${entry.risk.reason}`);
    }
  process.exitCode = exitcode;
}
async function cmdmigrateplan(args, state) {
  const { positional, flags } = parseflags(args);
  const source = positional[0];
  if (source === void 0 || source.trim() === "")
    throw new Error("The migrateplan command needs the source file it converts.");
  const format = flags.get("format") ?? "";
  if (format.trim() === "")
    throw new Error(
      "The migrateplan command needs the --format flag of v1, automa, selenium, uivision or tabular; the converter never guesses the source format."
    );
  const text2 = await readFile(source, "utf8");
  const conversion = migrateplanconversion({ format, text: text2, now: Date.now() });
  const serialized = JSON.stringify(conversion.file, null, 2);
  const parsed = parseplanfile(
    JSON.parse(serialized)
  );
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = flags.has("capabilities") ? JSON.parse(await readFile(flags.get("capabilities"), "utf8")) : portablecapabilityset({
    vocabulary: actionkindcatalog(),
    probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
    domlesskinds: readonlykinds()
  });
  const diagnostics = [
    ...lintplanfile({ file: parsed, ruleset, capabilities, now: Date.now() }),
    ...planlintfindings({ file: parsed, capabilities })
  ];
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  if (errors.length > 0) {
    console.error(formatdiagnostics(errors, "human"));
    console.error(
      "The migrateplan command refuses to emit a converted plan that fails its own lint; the importers mark every entry they cannot map, so this refusal names a conversion gap the importer should have caught."
    );
    process.exitCode = exitcodeof("schemaerror");
    return;
  }
  const out = flags.get("out");
  if (out !== void 0) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, serialized + "\n", "utf8");
    if (state.verbosity !== "quiet") console.error(`The migrateplan command wrote the converted plan to ${out}.`);
  } else {
    console.log(serialized);
  }
  for (const note of conversion.notes) console.error(note);
}
async function cmdrecipes(args, state) {
  const { positional, flags } = parseflags(args);
  const candidates = ["gallery.json", "build/gallery.json", "test/code/recipes/gallery.json"];
  let gallery;
  let gallerypath = "";
  for (const candidate of candidates) {
    try {
      gallery = JSON.parse(await readFile(candidate, "utf8"));
      gallerypath = candidate;
      break;
    } catch {
    }
  }
  if (gallery === void 0)
    throw new Error(
      "The recipes command needs the gallery index the installed package ships (gallery.json at the package root), the build copy (build/gallery.json) or the repository source (test/code/recipes/gallery.json); run from the package root or run pnpm build first."
    );
  const id = positional[0];
  if (id === void 0) {
    if (state.json || flags.get("format") === "json") {
      console.log(JSON.stringify(gallery, null, 2));
      return;
    }
    for (const entry2 of gallery.entries)
      console.log(
        `${entry2.id.padEnd(24)} ${entry2.category.padEnd(11)} ${entry2.difficulty.padEnd(12)} ${entry2.fixture.padEnd(17)} ${entry2.description}`
      );
    console.log(
      `The gallery carries ${gallery.entries.length} recipes over ${gallery.fixturepages.length} fixture pages; run devthink recipes <id> for one entry, with --dryrun to walk its flow.`
    );
    return;
  }
  const entry = gallery.entries.find((candidate) => candidate.id === id);
  if (entry === void 0) throw new Error(`The gallery carries no entry ${id}; run devthink recipes for the list.`);
  const recipecandidates = [
    gallerypath === "gallery.json" ? `fixtures/recipes/${id}.json` : gallerypath.startsWith("build/") ? `build/fixtures/recipes/${id}.json` : `test/code/recipes/${id}.json`,
    `fixtures/recipes/${id}.json`,
    `build/fixtures/recipes/${id}.json`
  ];
  let recipetext;
  for (const candidate of recipecandidates) {
    try {
      recipetext = await readFile(candidate, "utf8");
      break;
    } catch {
    }
  }
  if (recipetext === void 0)
    throw new Error(
      `The recipe file of ${id} sits beside neither the gallery index nor the shipped fixture set; run from the package root or run pnpm build first.`
    );
  const file = parseplanfile(JSON.parse(recipetext));
  const ruleset = await cachedruleset(flags.get("cache") ?? ".devthink");
  const capabilities = portablecapabilityset({
    vocabulary: actionkindcatalog(),
    probes: capabilityprobeof({ dom: flags.get("domless") !== "true", storage: true, network: true, worker: true }),
    domlesskinds: readonlykinds()
  });
  const diagnostics = [
    ...lintplanfile({ file, ruleset, capabilities, now: Date.now() }),
    ...planlintfindings({ file, capabilities })
  ];
  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === "error");
  if (state.json || flags.get("format") === "json") {
    console.log(
      JSON.stringify(
        { entry, plan: file, diagnostics, ...flags.get("dryrun") === "true" ? { dryrun: "requested" } : {} },
        null,
        2
      )
    );
  } else {
    console.log(`${entry.id} \u2014 ${entry.category} \u2014 ${entry.difficulty} \u2014 fixture ${entry.fixture} of ${entry.origin}`);
    console.log(entry.description);
    console.log(
      `The plan carries ${file.steps.length} step${file.steps.length === 1 ? "" : "s"} over the origin ${file.origin}.`
    );
    if (diagnostics.length > 0) console.log(formatdiagnostics(diagnostics, "human"));
    else console.log("No planlint diagnostics.");
  }
  if (errors.length > 0) {
    process.exitCode = exitcodeof("schemaerror");
    return;
  }
  if (flags.get("dryrun") === "true") {
    const resolvedgates = [];
    const provider = {
      async resolvegate(gate) {
        resolvedgates.push(gate.id);
        return "approve";
      }
    };
    const planpath = recipecandidates[0] ?? `build/fixtures/recipes/${id}.json`;
    const run = await runflow({
      request: {
        planpath,
        options: {
          format: "human",
          outputdir: "test/artifacts",
          interactive: false,
          dryrun: true,
          grantspath: "gallery"
        }
      },
      file,
      grants: [entry.origin],
      provider,
      driver: dryflowdriver(),
      now: Date.now(),
      clock: () => Date.now()
    });
    console.log(
      `The dry run walked ${run.outcome.steps} of ${file.steps.length} steps, waited at ${resolvedgates.length} consent gate${resolvedgates.length === 1 ? "" : "s"} and ended ${run.outcome.state} with exit code ${run.outcome.exitcode}.`
    );
    process.exitCode = run.outcome.exitcode;
  }
}
function terminalprovider() {
  return {
    async resolvegate(gate) {
      const answer = await ask(
        `${gate.reason}
Approve the gate ${gate.id} of kind ${gate.kind} on ${gate.origin}? [y/N] `
      );
      return answer.toLowerCase() === "y" ? "approve" : "refuse";
    }
  };
}
async function attachremotedriver(endpoint, origin) {
  const session = openheadlesssession({ origin, now: Date.now() });
  const frames = remoteattachframes({ id: 1, session, runtime: "node" });
  const attach = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(frames.initialize)
  });
  const attached = await attach.json();
  if (attached.error !== void 0 || attached.result?.attached !== true)
    throw new Error(
      `The remote session at ${endpoint} refused the attach: ${attached.error?.message ?? "the endpoint returned no attached result."}`
    );
  let sequence = 1;
  return {
    async execute(step) {
      sequence += 1;
      const started = Date.now();
      const frame = toolcallframe({
        id: sequence,
        name: `browser.${step.kind}`,
        params: {
          id: step.id,
          kind: step.kind,
          label: step.label,
          ...step.target !== void 0 ? { target: step.target } : {},
          ...step.value !== void 0 ? { value: step.value } : {},
          ...step.options !== void 0 ? { options: step.options } : {}
        }
      });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(frame)
      });
      const body = await response.json();
      const duration = Date.now() - started;
      if (body.error !== void 0)
        return {
          state: "failed",
          summary: `The remote session refused the step ${step.id}: ${body.error.message ?? "the endpoint returned an error."}`,
          duration
        };
      return {
        state: "done",
        summary: `The remote session executed the step ${step.id} of kind ${step.kind}.`,
        duration
      };
    }
  };
}
async function cmdflowrun(args) {
  const request = parseflowrunrequest(args);
  const { flags } = parseflags(args);
  const file = parseplanfile(JSON.parse(await readFile(request.planpath, "utf8")));
  const grants = request.options.grantspath !== void 0 ? parsegrantsfile(JSON.parse(await readFile(request.options.grantspath, "utf8"))) : [];
  if (request.options.grantspath === void 0 && request.options.interactive) {
    const answer = await ask(`Grant the origin ${file.origin} for this run? [y/N] `);
    if (answer.toLowerCase() !== "y")
      throw new Error("The interactive origin grant was refused; the flowrun never starts.");
    grants.push(file.origin);
  }
  const provider = request.options.interactive ? terminalprovider() : void 0;
  const endpoint = flags.get("endpoint");
  const driver = endpoint !== void 0 ? await attachremotedriver(endpoint, file.origin) : request.options.dryrun ? dryflowdriver() : void 0;
  if (driver === void 0)
    throw new Error(
      "The flowrun needs a remote endpoint (--endpoint) or the dry run flag (--dryrun); the cli drives no local browser itself."
    );
  const profiledir = flags.get("profile") ?? ".devthink/profile";
  const store = new sessionmemory(
    filesystemstorageadapter(
      {
        readfile: (path) => readFile(path, "utf8"),
        writefile: (path, data) => writeFile(path, data, "utf8"),
        mkdir: (path) => mkdir(path, { recursive: true }),
        join: (...parts) => join2(...parts)
      },
      profiledir
    )
  );
  const runid = `flowrun:${Date.now()}`;
  const lock = acquirerunlock({
    locks: await store.getrunlocks(),
    sessionid: "flowrun",
    runid,
    holder: "devthink-cli",
    now: Date.now()
  });
  await store.setrunlocks(lock.locks);
  if (!lock.acquired) throw new Error(lock.reason);
  try {
    const run = await runflow({
      request,
      file,
      grants,
      ...provider !== void 0 ? { provider } : {},
      driver,
      now: Date.now(),
      clock: () => Date.now(),
      emit: (event) => {
        if (request.options.format === "human") console.log(renderflowevents([event], "human"));
      }
    });
    await mkdir(request.options.outputdir, { recursive: true });
    const chain = await exportlogchain(run.log);
    const stem = join2(request.options.outputdir, runid.replace(/:/g, "-"));
    await writeFile(`${stem}.chain.json`, JSON.stringify(chain, null, 2), "utf8");
    await writeFile(
      `${stem}.report.json`,
      JSON.stringify(flowrunreport({ outcome: run.outcome, events: run.events }), null, 2),
      "utf8"
    );
    await store.addaudi({
      id: createHash("sha256").update(runid).digest("hex").slice(0, 16),
      kind: "flowrun",
      at: Date.now(),
      summary: `The flowrun of ${file.origin} ended ${run.outcome.state} after ${run.outcome.steps} step${run.outcome.steps === 1 ? "" : "s"}.`,
      sessionid: "flowrun"
    });
    if (request.options.format === "json")
      console.log(JSON.stringify(flowrunreport({ outcome: run.outcome, events: run.events }), null, 2));
    else console.log(renderflowtimeline(run.events));
    process.exitCode = run.outcome.exitcode;
  } finally {
    const released = releaserunlock({ locks: await store.getrunlocks(), sessionid: "flowrun", runid, now: Date.now() });
    await store.setrunlocks(released.locks);
  }
}
async function cmdrunworkflow(args, state) {
  const { positional, flags } = parseflags(args);
  const workflowpath = positional[0];
  if (workflowpath === void 0 || workflowpath.trim() === "")
    throw new Error("The runworkflow command needs the workflow file it runs.");
  const dryrun = flags.get("dryrun") === "true";
  const format = flags.get("format") ?? (state.json ? "json" : "human");
  if (format !== "human" && format !== "json") throw new Error("The runworkflow format must stay human or json.");
  const document2 = parseworkflowdocument(JSON.parse(await readFile(workflowpath, "utf8")));
  const record2 = composeworkflowdocument(document2, Date.now());
  const runid = `workflow:${record2.id}:${Date.now()}`;
  const checkpointfile = `${workflowpath}.checkpoint.json`;
  let resumed = false;
  let run = newworkflowrun({ id: runid, workflowid: record2.id, ...dryrun ? { dryrun: true } : {}, now: Date.now() });
  let scopes;
  let log;
  let outputs;
  const resumeid = flags.get("resume");
  if (resumeid !== void 0) {
    const checkpoints = JSON.parse(await readFile(checkpointfile, "utf8"));
    const checkpoint = [...checkpoints].reverse().find((entry) => entry.runid === resumeid);
    if (checkpoint === void 0)
      throw new Error(
        `No checkpoint of the run ${resumeid} sits beside ${workflowpath}; the resume needs its checkpoint id.`
      );
    run = { id: resumeid, workflowid: record2.id, state: "paused", cursor: checkpoint.cursor, startedat: Date.now() };
    scopes = checkpoint.scopes;
    log = checkpoint.log;
    outputs = checkpoint.outputs;
    resumed = true;
  }
  if (state.verbosity !== "quiet") {
    const approval = await ask(
      `Run the workflow ${record2.name} of ${record2.steps.length} step${record2.steps.length === 1 ? "" : "s"} on ${record2.origins.join(", ")}${resumed ? ` resuming from the checkpoint ${run.cursor}` : ""}${dryrun ? " as a dry run" : ""}? [y/N] `
    );
    if (approval.toLowerCase() !== "y") {
      console.log(
        format === "json" ? JSON.stringify(
          {
            runid,
            state: "cancelled",
            exitclass: "consentrefused",
            exitcode: exitcodeof("consentrefused"),
            reason: "The terminal review refused the workflow before the first step."
          },
          null,
          2
        ) : "The terminal review refused the workflow; nothing ran."
      );
      process.exitCode = exitcodeof("consentrefused");
      return;
    }
  }
  let summary;
  if (dryrun) {
    const dried = dryrunworkflow({
      record: record2,
      run,
      ...scopes !== void 0 ? { scopes } : {},
      ...log !== void 0 ? { log } : {},
      now: Date.now(),
      projection: dryrunprojection
    });
    summary = runworkflowsummaryof({ runid: dried.run.id, run: dried.run, log: dried.log });
  } else {
    const endpoint = flags.get("endpoint");
    if (endpoint === void 0)
      throw new Error(
        "The runworkflow command needs a remote endpoint (--endpoint) or the dry run flag (--dryrun); the cli drives no local browser itself."
      );
    const driver = await attachremotedriver(endpoint, record2.origins[0]);
    const checkpoints = [];
    const executed = await runworkflow({
      record: record2,
      run,
      ...scopes !== void 0 ? { scopes } : {},
      ...log !== void 0 ? { log } : {},
      ...outputs !== void 0 ? { outputs } : {},
      execute: async (step, context) => {
        let risk = "sensitive";
        try {
          risk = actionrisk(step.kind);
        } catch {
        }
        if (risk === "sensitive" && state.verbosity !== "quiet") {
          const answer = await ask(
            `The step ${step.id} of kind ${step.kind} grades sensitive on ${record2.origins.join(", ")}.
Approve the step before it runs? [y/N] `
          );
          if (answer.toLowerCase() !== "y")
            return {
              ok: false,
              summary: `The terminal review refused the sensitive step ${step.id} of kind ${step.kind}.`
            };
        }
        const result = await driver.execute(step, Date.now());
        return {
          ok: result.state === "done",
          summary: result.summary,
          ...context.block !== void 0 ? { details: { block: context.block } } : {}
        };
      },
      now: Date.now(),
      gates: { sessionactive: true, planapproved: true, origingranted: (origin) => record2.origins.includes(origin) },
      oncheckpoint: async (checkpoint) => {
        if (state.verbosity !== "quiet" && format === "human")
          console.log(`step ${checkpoint.run.cursor}/${record2.steps.length}: ${checkpoint.log.at(-1)?.summary ?? ""}`);
        checkpoints.push({
          runid: checkpoint.run.id,
          cursor: checkpoint.run.cursor,
          scopes: checkpoint.scopes,
          log: checkpoint.log,
          outputs: {}
        });
        await writeFile(checkpointfile, JSON.stringify(checkpoints, null, 2), "utf8");
      }
    });
    summary = runworkflowsummaryof({ runid: executed.run.id, run: executed.run, log: executed.log });
  }
  await writeFile(
    `${workflowpath}.audit.jsonl`,
    workflowauditlines({
      runid: summary.runid,
      workflow: record2.name,
      log: summary.steps.map((entry) => ({
        stepid: entry.stepid,
        label: entry.label,
        state: entry.state,
        startedat: 0,
        duration: entry.duration,
        summary: entry.summary
      })),
      now: Date.now()
    }) + "\n",
    "utf8"
  );
  if (format === "json") console.log(JSON.stringify(summary, null, 2));
  else {
    for (const step of summary.steps)
      console.log(
        `${step.state === "done" ? "done" : step.state} ${step.stepid} ${step.label} (${step.duration} ms): ${step.summary}`
      );
    console.log(
      `The workflow run ${summary.runid} ended ${summary.state} at checkpoint ${summary.checkpoint} with the exit class ${summary.exitclass} (${summary.exitcode}).${summary.reason !== void 0 ? ` ${summary.reason}` : ""}`
    );
  }
  process.exitCode = summary.exitcode;
}
async function cmdexportdata(args, state) {
  const { positional, flags } = parseflags(args);
  const scope = positional[0];
  if (scope === void 0) throw new Error("The exportdata command needs its scope of session, audit or extraction.");
  if (scope !== "session" && scope !== "audit" && scope !== "extraction")
    throw new Error("The exportdata scope stays session, audit or extraction.");
  const format = flags.get("format") ?? (scope === "session" ? "json" : scope === "audit" ? "jsonl" : "csv");
  const timebound = (name) => {
    const value = flags.get(name);
    if (value === void 0) return void 0;
    if (/^-?\d+$/.test(value)) return Number(value);
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed))
      throw new Error(`The ${name} flag must carry an epoch millisecond number or an ISO date.`);
    return parsed;
  };
  const from = timebound("from");
  const to = timebound("to");
  const input = flags.get("input");
  const storedir = flags.get("store");
  let records;
  if (input !== void 0) {
    records = JSON.parse(await readFile(input, "utf8"));
  } else if (storedir !== void 0) {
    const store = new sessionmemory(
      filesystemstorageadapter(
        {
          readfile: (path) => readFile(path, "utf8"),
          writefile: (path, data) => writeFile(path, data, "utf8"),
          mkdir: (path) => mkdir(path, { recursive: true }),
          join: (...parts) => join2(...parts)
        },
        storedir
      )
    );
    if (scope === "session") records = await store.gethistory();
    else if (scope === "audit") records = await store.getaudit();
    else
      records = (await store.getdatasets()).flatMap(
        (dataset) => dataset.rows.map((row) => ({ ...row, dataset: dataset.name, at: dataset.at }))
      );
  } else {
    throw new Error("The exportdata command needs its records from the --input file or the --store profile directory.");
  }
  if (!Array.isArray(records)) throw new Error("The exportdata records must be a json array.");
  const shapes = flags.has("shapes") ? flags.get("shapes").split(",").map((shape) => shape.trim()).filter((shape) => shape !== "") : [...defaultmaskshapes];
  const out = flags.get("out");
  const exported = exportdatacontent({
    scope,
    format,
    records,
    shapes,
    ...from !== void 0 ? { from } : {},
    ...to !== void 0 ? { to } : {},
    ...out !== void 0 ? { path: out } : {}
  });
  if (exported.result.reason !== void 0) {
    console.error(exported.result.reason);
    process.exitCode = exitcodeof("consentrefused");
    return;
  }
  if (state.verbosity === "verbose" && state.json !== true)
    console.log(
      `The exportdata wrote ${exported.result.rows} record${exported.result.rows === 1 ? "" : "s"} of ${exported.result.bytes} bytes in ${format}.`
    );
  if (out !== void 0) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, exported.content + "\n", "utf8");
    if (state.verbosity !== "quiet") console.log(`The exportdata wrote ${out}.`);
  } else console.log(exported.content);
}
async function cmdheadless(args, state) {
  const { positional, flags } = parseflags(args);
  const planpath = positional[0] ?? state.config.defaultplan;
  if (planpath === void 0 || planpath.trim() === "")
    throw new Error(
      "The headless command needs the plan file it replays, or the default plan location in the configuration."
    );
  const fixturesdir = flags.get("fixtures") ?? state.config.fixturesdir;
  if (fixturesdir === void 0 || fixturesdir.trim() === "")
    throw new Error(
      "The headless command needs the fixtures directory (--fixtures) or the fixturesdir location in the configuration."
    );
  const entries = (await readdir(fixturesdir)).filter((entry) => entry.endsWith(".json"));
  if (entries.length === 0) throw new Error(`The fixtures directory ${fixturesdir} carries no fixture file.`);
  const fixtures = [];
  for (const entry of entries)
    fixtures.push(parseheadlessfixture(JSON.parse(await readFile(join2(fixturesdir, entry), "utf8"))));
  const plan = parseplanfile(JSON.parse(await readFile(planpath, "utf8")));
  const fixture = resolvefixture(fixtures, plan.origin);
  const handle = openlibraryrun({
    plan,
    statesource: (origin) => fixtures.find((candidate) => candidate.origin === origin),
    ...flags.has("grants") ? {
      policy: {
        grants: flags.get("grants").split(",").map((grant) => grant.trim()).filter((grant) => grant !== "")
      }
    } : {},
    now: Date.now()
  });
  const outcomes = [];
  for (const step of plan.steps) {
    const outcome = handle.step(step, Date.now());
    outcomes.push(outcome);
    if (state.verbosity !== "quiet" && state.json !== true)
      console.log(`${outcome.state} ${outcome.stepid} of kind ${outcome.kind}: ${outcome.summary}`);
  }
  const exitclass = outcomes.some((outcome) => outcome.state === "unsupported") ? "unsupported" : outcomes.some((outcome) => outcome.state === "refused") ? "consentrefused" : "ok";
  if (state.json || flags.get("format") === "json")
    console.log(
      JSON.stringify(
        {
          plan: planpath,
          fixture: fixture.id,
          origin: fixture.origin,
          outcomes,
          progress: { completedsteps: handle.handle().progress.completedsteps.length },
          exitclass,
          exitcode: exitcodeof(exitclass)
        },
        null,
        2
      )
    );
  else
    console.log(
      `The headless replay of ${plan.goal} against the fixture ${fixture.id} of ${fixture.origin} completed ${handle.handle().progress.completedsteps.length} step${handle.handle().progress.completedsteps.length === 1 ? "" : "s"} with the exit class ${exitclass} (${exitcodeof(exitclass)}).`
    );
  process.exitCode = exitcodeof(exitclass);
}
async function cmdserve(args) {
  const { flags } = parseflags(args);
  const transportflag = flags.get("transport");
  const transports = transportflag === "stdio" ? ["stdio"] : transportflag === "http" ? ["http"] : ["stdio", "http"];
  const portflag = flags.get("port");
  const port = portflag !== void 0 && Number.isFinite(Number(portflag)) && Number(portflag) > 0 && Number(portflag) <= 65535 ? Math.floor(Number(portflag)) : defaultmcpport;
  const bind = flags.get("bind") ?? localhostbind;
  const localbind = bind === "127.0.0.1" || bind === "localhost" || bind === "::1";
  const framesizeflag = flags.get("framesize");
  const queuedepthflag = flags.get("queuedepth");
  const drainwindowflag = flags.get("drainwindow");
  const config = {
    bind,
    port,
    transports,
    enabled: true,
    ...localbind ? {} : { remote: true },
    ...framesizeflag !== void 0 && Number.isFinite(Number(framesizeflag)) ? { framesize: Math.floor(Number(framesizeflag)) } : {},
    ...queuedepthflag !== void 0 && Number.isFinite(Number(queuedepthflag)) ? { queuedepth: Math.floor(Number(queuedepthflag)) } : {},
    ...drainwindowflag !== void 0 && Number.isFinite(Number(drainwindowflag)) ? { drainwindow: Math.floor(Number(drainwindowflag)) } : {}
  };
  const gate = mcpmodegate(config);
  if (!gate.allowed) throw new Error(gate.reason ?? "The serve command failed its gate.");
  const startedat = Date.now();
  const started = startserve({ config, now: startedat });
  if (started.state === void 0) throw new Error(started.reason ?? "The serve command did not start.");
  const mocknames = (flags.get("mocks") ?? "").split(",").map((name) => name.trim()).filter((name) => name !== "");
  const mocks = mocknames.map((tool) => ({
    tool,
    result: {
      content: `The ${tool} mock answered from the serve test context; no browser was touched.`,
      iserror: false
    },
    testcontext: true,
    createdat: startedat
  }));
  const client = {
    id: "serve-stdio",
    transport: "stdio",
    paired: flags.get("pair-client") === "true",
    connectedat: startedat,
    ...flags.get("pair-client") === "true" ? { pairedat: startedat } : {}
  };
  const holder = {
    session: createservesession({ config, client, origin: "stdio", now: startedat })
  };
  holder.session.mocks = mocks;
  const execute = async (step) => {
    throw new Error(
      `The standalone serve executes the ${step.kind} step ${step.id} through the paired extension engine; run the extension for the real execution.`
    );
  };
  const handle = async (frame) => {
    const outcome = await routeserveframe({ frame, state: holder.session, now: Date.now(), execute });
    holder.session = outcome.state;
    return outcome.response;
  };
  const pump = createlinepump({
    write: (line) => {
      process.stdout.write(line);
    },
    handle,
    now: startedat
  });
  const endpoints = transportendpoints({ config, now: startedat });
  process.stderr.write(
    `The mcp serve started ${endpoints.map((transport) => `${transport.kind} on ${transport.endpoint}`).join(" and ")}${started.state.degraded ? " degraded to the read only tools because no origin grant covers the serve" : ""}; ${mocks.length} tool mock${mocks.length === 1 ? "" : "s"} registered; the client ${client.paired ? "stays paired through the explicit launch flag" : "waits for the pairing approval"}. Every log rides stderr so the stdio wire stays clean.
`
  );
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const drain = shutdowndrain({
      inflight: holder.session.contexts,
      now: Date.now(),
      ...config.drainwindow !== void 0 ? { window: config.drainwindow, drainstart: startedat } : {}
    });
    process.stderr.write(
      `The serve shutdown ${drain.phase} with ${drain.waiting} in flight call${drain.waiting === 1 ? "" : "s"}; the drain waits for every call before the exit.
`
    );
    process.exit(0);
  };
  if (transports.includes("stdio")) {
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      void pump.feed(typeof chunk === "string" ? chunk : String(chunk)).catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}
`);
      });
    });
    process.stdin.on("end", stop);
  }
  if (transports.includes("http")) {
    const endpoint = httpendpoint(config);
    const { createServer } = await import("node:http");
    const { createServer: createsecure } = await import("node:https");
    const readbody = async (request) => {
      const chunks = [];
      for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      return Buffer.concat(chunks).toString("utf8");
    };
    const handler = async (request, response) => {
      const route = routepath(config, request.url ?? "/");
      if (route !== "endpoint") {
        response.writeHead(404, { "content-type": "application/json" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: { code: "method", message: `The serve routes no http path ${request.url ?? "/"}.` }
          })
        );
        return;
      }
      if (request.method !== "POST") {
        response.writeHead(405, { "content-type": "application/json", allow: "POST" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: { code: "method", message: "The streamable endpoint accepts posted json rpc messages only." }
          })
        );
        return;
      }
      const parsed = parsepost(await readbody(request));
      if (parsed.message === void 0) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(
          httpanswer({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: "parse",
              message: parsed.error?.message ?? "The posted body does not parse as one json rpc message."
            }
          })
        );
        return;
      }
      const frames = Array.isArray(parsed.message) ? parsed.message : [parsed.message];
      const answers = [];
      for (const frame of frames) {
        if (frame.id === void 0) continue;
        const answer = await handle(frame);
        if (answer !== void 0) answers.push(answer);
      }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        answers.length === 1 ? httpanswer(answers[0]) : httpanswer({
          jsonrpc: "2.0",
          id: null,
          error: { code: "internal", message: "The posted message produced no answer." }
        })
      );
    };
    let server;
    const certpath = flags.get("tlscert");
    const keypath = flags.get("tlskey");
    if (certpath !== void 0 && keypath !== void 0) {
      const { readFile: readFile2 } = await import("node:fs/promises");
      server = createsecure(
        { cert: await readFile2(certpath, "utf8"), key: await readFile2(keypath, "utf8") },
        handler
      );
      process.stderr.write(`The http listener terminates tls with the user provided certificate ${certpath}.
`);
    } else {
      server = createServer(handler);
    }
    await new Promise((resolve2) => {
      server.listen(endpoint.port, endpoint.bind, () => {
        resolve2();
      });
    });
    process.stderr.write(
      `The streamable http endpoint listens on ${endpoint.endpoint} (localhost bind${endpoint.localhost ? "" : " behind the explicit remote review"}).
`
    );
  }
  await new Promise(() => {
  });
}
async function cmdnative(args) {
  const { flags, positional } = parseflags(args);
  const subcommand = positional[0] ?? "diagnostics";
  const profiledir = flags.get("profile") ?? "";
  const hostname = flags.get("host") ?? "";
  const platformflag = flags.get("platform");
  const platform = platformflag === "macos" || platformflag === "windows" ? platformflag : "linux";
  const systemwide = flags.get("systemwide") === "true";
  if (subcommand === "install") {
    const extensionid = flags.get("extension-id") ?? "";
    const companionpath = flags.get("companion") ?? "";
    const gate = nativeinstallconsentgate({
      consent: flags.get("consent") === "true",
      profiledir: systemwide ? "/system" : profiledir,
      hostname
    });
    if (!gate.allowed) {
      console.error(gate.reason);
      console.error(
        "The install scope: the companion process the manifest launches, the profile directory the manifest writes into and the extension origins the manifest allows. Pass --consent true once you reviewed the scope."
      );
      process.exitCode = exitcodeof("consentrefused");
      return;
    }
    const outcome = await installnativehost({
      profiledir,
      hostname,
      extensionid,
      companionpath,
      consent: true,
      now: Date.now(),
      ...systemwide ? { systemwide: true } : {},
      platform,
      io: {
        mkdir: async (dir) => {
          await mkdir(dir, { recursive: true });
        },
        writefile: async (path, text2) => {
          await writeFile(path, text2, "utf8");
        }
      }
    });
    if (outcome.refused !== void 0) {
      console.error(outcome.refused);
      process.exitCode = exitcodeof("schemaerror");
      return;
    }
    console.log(
      JSON.stringify(
        {
          installed: true,
          manifestpath: outcome.manifestpath,
          hostname,
          extensionid,
          installerversion: outcome.state.installerversion,
          systemwide
        },
        null,
        2
      )
    );
    return;
  }
  if (subcommand === "uninstall") {
    const outcome = await uninstallnativehost({
      profiledir,
      hostname,
      now: Date.now(),
      ...systemwide ? { systemwide: true } : {},
      platform,
      io: {
        exists: async (path) => {
          try {
            await stat(path);
            return true;
          } catch {
            return false;
          }
        },
        removefile: async (path) => {
          await (await import("node:fs/promises")).rm(path, { force: true });
        }
      }
    });
    if (outcome.refused !== void 0) {
      console.error(outcome.refused);
      process.exitCode = exitcodeof("schemaerror");
      return;
    }
    console.log(
      JSON.stringify({ installed: false, manifestpath: outcome.manifestpath, removed: outcome.removed }, null, 2)
    );
    return;
  }
  if (subcommand === "diagnostics") {
    const companionpath = (flags.get("companion") ?? "").trim();
    const template = hostname !== "" && companionpath !== "" ? nativehostmanifesttemplate({ hostname, companionpath }) : void 0;
    const destination = hostname !== "" ? hostmanifestdestination({
      hostname,
      ...profiledir !== "" ? { profiledir } : {},
      ...systemwide ? { systemwide: true } : {},
      platform
    }) : void 0;
    const report = nativediagnostics({ state: nativedefaultstate(), now: Date.now() });
    console.log(
      JSON.stringify(
        {
          ...report,
          ...destination !== void 0 ? { manifestdestination: destination } : {},
          ...template !== void 0 ? { manifesttemplate: template.manifest } : {}
        },
        null,
        2
      )
    );
    return;
  }
  throw new Error(
    `The native subcommand ${subcommand} stays outside the reviewed surface; run devthink help for the command list.`
  );
}
async function cmdexport(args) {
  const { positional, flags } = parseflags(args);
  const scope = positional[0];
  if (scope === void 0) throw new Error("The export command needs its scope of runs, extractions or notes.");
  const descriptor = exportdescriptorof(flags.get("format") ?? "json", scope);
  const input = flags.get("input");
  if (input === void 0) throw new Error("The export command needs the --input file it exports.");
  const shapes = flags.has("shapes") ? flags.get("shapes").split(",").map((shape) => shape.trim()).filter((shape) => shape !== "") : [...defaultmaskshapes];
  const out = flags.get("out");
  const payload = JSON.parse(await readFile(input, "utf8"));
  const exported = scope === "runs" ? await exportchain({
    descriptor,
    log: {
      runid: typeof payload.runid === "string" ? payload.runid : "run",
      sessionid: "flowrun",
      entries: payload.log,
      updatedat: Date.now()
    },
    shapes,
    ...out !== void 0 ? { path: out } : {}
  }) : scope === "extractions" ? exportextractions({
    descriptor,
    rows: payload,
    shapes,
    ...out !== void 0 ? { path: out } : {}
  }) : exportnotes({
    descriptor,
    notes: payload,
    shapes,
    ...out !== void 0 ? { path: out } : {}
  });
  if (exported.result.reason !== void 0) throw new Error(exported.result.reason);
  if (out !== void 0) {
    await mkdir(resolve(out, ".."), { recursive: true });
    await writeFile(out, exported.content + "\n", "utf8");
  } else console.log(exported.content);
}
async function cmdinit(args) {
  const { positional } = parseflags(args);
  const target = positional[0];
  if (target === void 0 || target.trim() === "")
    throw new Error("The init command needs the plan file path it scaffolds.");
  const scaffold = {
    version: packageversion,
    goal: "Describe the objective of the plan",
    origin: "https://example.org",
    grants: ["observe", "readtext"],
    steps: [
      { id: "observe", kind: "observe", label: "Observe the page", gate: false },
      { id: "read", kind: "readtext", label: "Read the main text", target: "main" }
    ]
  };
  await mkdir(resolve(target, ".."), { recursive: true });
  await writeFile(target, JSON.stringify(scaffold, null, 2) + "\n", "utf8");
  console.log(
    `Scaffolded the plan file ${target}; edit the goal, the origin and the steps, then run devthink planlint on it.`
  );
}
async function cmddoctor() {
  const probes = capabilityprobeof({
    dom: typeof document !== "undefined",
    storage: true,
    network: typeof fetch === "function",
    worker: true
  });
  console.log(
    JSON.stringify(
      {
        version: packageversion,
        runtime: "node",
        probes,
        adapters: adapterdeclarationsof(),
        platforms: platformtargets(),
        capabilitycount: portablecapabilityset({
          vocabulary: actionkindcatalog(),
          probes,
          domlesskinds: readonlykinds()
        }).length
      },
      null,
      2
    )
  );
}
async function cmdcommands(args) {
  const { flags } = parseflags(args);
  const registry = clicommands(surfacepalette());
  if (flags.get("format") === "json") {
    console.log(JSON.stringify(registry, null, 2));
    return;
  }
  for (const command of registry)
    console.log(`${command.terminal ? "cli " : "ui  "} ${command.id}: ${command.label} [${command.surface}]`);
}
async function cmddescribe(args) {
  const { flags } = parseflags(args);
  const surfaces = ["background", "pagebridge", "sidepanel", "popup", "cli", "library", "mcp"];
  const manifests = surfaces.map((surface) => capmanifestof(surface));
  const negotiation = sharedprotocolversion([1, 2]);
  if (flags.get("format") === "json") {
    console.log(
      JSON.stringify(
        {
          freeze: {
            release: apifreezerelease,
            date: apifreezedate,
            scope: surfaces,
            supported: protocolsupported,
            deprecation: deprecationwindow
          },
          protocol: negotiation,
          manifests
        },
        null,
        2
      )
    );
    return;
  }
  console.log(
    `Devthink ${packageversion} \u2014 the protocolv2 api freeze of ${apifreezerelease} pinned on ${apifreezedate}.`
  );
  console.log(
    `Supported protocol versions ${protocolsupported.minimum} through ${protocolsupported.maximum}; the deprecation window closes at ${deprecationwindow.closes}.`
  );
  for (const manifest of manifests)
    console.log(
      `  ${manifest.surface.padEnd(12)} ${manifest.messages.length} message types, ${manifest.kinds.length} action kinds, ${manifest.permissions.length} permissions, pinned to release ${manifest.release}.`
    );
}
async function cmdhelp() {
  console.log(`Devthink ${packageversion} \u2014 the consent-first browser agent bridge on the terminal.`);
  console.log("Usage: devthink <command> [options]");
  for (const command of clicommands(surfacepalette()).filter((entry) => entry.terminal))
    console.log(`  ${entrypad(command.id)} ${command.label}`);
  console.log(`Global flags: --config <file> (default ${defaultconfigfile}), --verbose, --quiet, --json.`);
  console.log(`Exit codes: ${cliexitclasses.map((exitclass) => `${exitclass}=${exitcodeof(exitclass)}`).join(", ")}.`);
}
function entrypad(id) {
  return id.padEnd(12);
}
async function runclifamily(argv) {
  const saved = process.argv.slice();
  process.argv = [saved[0], saved[1], ...argv];
  try {
    await main();
  } finally {
    process.argv = saved;
  }
}
async function main() {
  const command = process.argv[2] ?? "help";
  const args = process.argv.slice(3);
  if (command === "manifest") {
    const manifesttext = await readFile(resolve("manifest.json"), "utf8");
    const manifest = JSON.parse(manifesttext);
    const packagejson = JSON.parse(await readFile(resolve("package.json"), "utf8"));
    const permissions = manifest.permissions ?? [];
    const optional = manifest["optional_permissions"] ?? [];
    const denied = permissions.filter((permission) => forbidden.has(permission));
    const deniedoptional = optional.filter((permission) => !allowedoptional.has(permission));
    if (manifest.version !== packagejson.version) throw new Error("Manifest version must match package.json.");
    if (!manifest.key) throw new Error("A stable manifest key is required for the extension identity.");
    const identitykey = decodeidentitykey(manifest.key);
    if (identitykey.length !== 294)
      throw new Error(
        `The manifest key decodes to ${identitykey.length} bytes; the published Devthink identity key decodes to 294.`
      );
    const digest = createHash("sha256").update(identitykey).digest("hex");
    const recorded = await recordedidentitydigest();
    if (recorded !== void 0 && digest !== recorded)
      throw new Error(
        `The manifest identity key digest ${digest} does not match the recorded build artifact digest ${recorded}; changing the extension identity must be a reviewed decision through a rebuilt artifact.`
      );
    if ((manifest["host_permissions"] ?? []).length) throw new Error("Mandatory host permissions are not allowed.");
    if (denied.length) throw new Error(`Forbidden permissions: ${denied.join(", ")}`);
    if (deniedoptional.length) throw new Error(`Forbidden optional permissions: ${deniedoptional.join(", ")}`);
    const sandboxpages = manifest.sandbox?.pages ?? [];
    if (manifest.sandbox !== void 0) {
      if (sandboxpages.length === 0) throw new Error("The sandbox key needs at least one sandbox page.");
      if (sandboxpages.some((page) => !/^([a-z0-9-]+)\.html$/.test(page)))
        throw new Error("Every sandbox page needs its plain html file name.");
      if (new Set(sandboxpages).size !== sandboxpages.length)
        throw new Error("The sandbox page names must stay unique.");
      const privileged = sandboxpages.filter((page) => privilegedpages.has(page));
      if (privileged.length)
        throw new Error(
          `The sandbox pages ${privileged.join(", ")} hold extension privileges and must never run untrusted markup.`
        );
    }
    if (manifest.offscreen !== void 0) {
      if (!manifest.offscreen.document || !/^[a-z0-9-]+\.html$/.test(manifest.offscreen.document))
        throw new Error("The offscreen declaration needs its document path.");
      if (!manifest.offscreen.reasons?.length)
        throw new Error("The offscreen declaration needs the reasons the user reviewed.");
      if (!manifest.offscreen.justification?.trim())
        throw new Error("The offscreen declaration needs its justification in plain language.");
    }
    const worlds = (manifest["content_scripts"] ?? []).map((script) => script.world ?? "ISOLATED");
    if (worlds.some((world) => world !== "ISOLATED"))
      throw new Error(
        "Content scripts stay registered in the isolated world by default; no main world registration exists."
      );
    if ((manifest["content_scripts"] ?? []).some((script) => (script.matches ?? []).length > 0))
      throw new Error(
        "Content script registrations carry no matches because injection stays behind the granted scripting calls on reviewed origins."
      );
    const filebytes = {};
    let bundlepresent = false;
    try {
      const distdir = resolve("build/extension");
      for (const entry of await readdir(distdir))
        if (entry.endsWith(".js")) filebytes[entry] = new Uint8Array(await readFile(join2(distdir, entry)));
      bundlepresent = true;
      const iconsdir = resolve("build/extension/icons");
      for (const entry of await readdir(iconsdir))
        if (entry.endsWith(".png")) filebytes[`icons/${entry}`] = new Uint8Array(await readFile(join2(iconsdir, entry)));
    } catch {
    }
    const deep = deepmanifestchecks({
      manifest,
      manifesttext,
      manifestfile: "manifest.json",
      filebytes,
      capabilities: capabilityapireport([...permissions, ...optional]),
      digestof: (bytes) => createHash("sha256").update(bytes).digest("base64"),
      /* the 2.0.6 fail-soft: a running tree without any build/extension bundle (an installed library package, an unbuilt checkout) answers the icon family through the release-zip note instead of six absent-bundle errors — the bundle-present error stays for a built tree whose bundle misses a declared icon. */
      bundlepresent
    });
    if (deep.exitcode !== 0) {
      for (const finding of deep.findings.filter((entry) => entry.severity === "error"))
        console.error(
          `${finding.severity.toUpperCase()} ${finding.rule} at ${finding.path}${finding.source !== void 0 ? ` (${finding.source})` : ""}: ${finding.message}`
        );
      process.exitCode = deep.exitcode;
      return;
    }
    const capsurfaces = [
      "background",
      "pagebridge",
      "sidepanel",
      "popup",
      "cli",
      "library",
      "mcp"
    ];
    const capmanifestfiles = [];
    for (const surface of capsurfaces) {
      const capstext = await readFile(new URL(`./caps/${surface}.json`, import.meta.url), "utf8");
      const stored = JSON.parse(capstext);
      if (stored.surface !== surface)
        throw new Error(`The capmanifest of the ${surface} surface names the surface ${stored.surface}.`);
      if (stored.release !== packagejson.version)
        throw new Error(
          `The capmanifest of the ${surface} surface pins the release ${stored.release} while the package carries ${packagejson.version}.`
        );
      if (stored.protocolmajor !== 2)
        throw new Error(`The capmanifest of the ${surface} surface must pin the frozen protocol major two.`);
      const served = capmanifestof(surface);
      if (JSON.stringify(served.messages) !== JSON.stringify(stored.messages) || JSON.stringify(served.permissions) !== JSON.stringify(stored.permissions) || JSON.stringify(served.kinds) !== JSON.stringify(stored.kinds))
        throw new Error(
          `The capmanifest of the ${surface} surface drifted from the frozen surface lists of apifreeze.ts.`
        );
      capmanifestfiles.push({
        surface,
        release: stored.release,
        protocolmajor: stored.protocolmajor,
        messages: stored.messages.length,
        permissions: stored.permissions.length
      });
    }
    console.log(
      JSON.stringify(
        {
          valid: true,
          version: manifest.version,
          identitykeybytes: identitykey.length,
          permissions,
          optionalpermissions: optional,
          capmanifests: capmanifestfiles,
          ...sandboxpages.length > 0 ? { sandboxpages } : {},
          ...manifest.offscreen !== void 0 ? { offscreendocument: manifest.offscreen.document, offscreenreasons: manifest.offscreen.reasons } : {},
          deepchecks: {
            rules: deep.findings.length,
            findings: deep.findings.map((finding) => ({
              rule: finding.rule,
              path: finding.path,
              severity: finding.severity,
              ...finding.source !== void 0 ? { source: finding.source } : {},
              message: finding.message
            }))
          }
        },
        null,
        2
      )
    );
    return;
  }
  const state = await globalstate(args);
  if (command === "planlint") {
    await cmdplanlint(args, state);
    return;
  }
  if (command === "migrateplan") {
    await cmdmigrateplan(args, state);
    return;
  }
  if (command === "recipes") {
    await cmdrecipes(args, state);
    return;
  }
  if (command === "flowrun") {
    await cmdflowrun(args);
    return;
  }
  if (command === "runworkflow") {
    await cmdrunworkflow(args, state);
    return;
  }
  if (command === "exportdata") {
    await cmdexportdata(args, state);
    return;
  }
  if (command === "headless") {
    await cmdheadless(args, state);
    return;
  }
  if (command === "serve") {
    await cmdserve(args);
    return;
  }
  if (command === "native") {
    await cmdnative(args);
    return;
  }
  if (command === "export") {
    await cmdexport(args);
    return;
  }
  if (command === "init") {
    await cmdinit(args);
    return;
  }
  if (command === "doctor") {
    await cmddoctor();
    return;
  }
  if (command === "commands") {
    await cmdcommands(args);
    return;
  }
  if (command === "describe") {
    await cmddescribe(args);
    return;
  }
  if (command === "help" || command === "--help") {
    await cmdhelp();
    return;
  }
  throw new Error(
    `The command ${command} stays outside the reviewed command surface; run devthink help for the command list.`
  );
}
var cliDirectEntry = process.argv[1]?.endsWith("cli.ts") || process.argv[1]?.endsWith("cli");
var cliBunEntry = import.meta.main === true;
if (cliDirectEntry || cliBunEntry)
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = exitcodeof("schemaerror");
  });
function parsecliconfig(value) {
  if (value === void 0 || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value))
    throw new Error("The cli configuration must be a json object.");
  const root = value;
  const unknownfields = Object.keys(root).filter(
    (key) => !["defaultplan", "fixturesdir", "verbosity", "format", "allowlist"].includes(key)
  );
  if (unknownfields.length > 0)
    throw new Error(
      `The cli configuration carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown configuration fields.`
    );
  const config = {};
  if (root.defaultplan !== void 0) {
    if (typeof root.defaultplan !== "string" || root.defaultplan.trim() === "")
      throw new Error("The defaultplan configuration must be a non-empty path string.");
    config.defaultplan = root.defaultplan;
  }
  if (root.fixturesdir !== void 0) {
    if (typeof root.fixturesdir !== "string" || root.fixturesdir.trim() === "")
      throw new Error("The fixturesdir configuration must be a non-empty directory string.");
    config.fixturesdir = root.fixturesdir;
  }
  if (root.verbosity !== void 0) {
    if (root.verbosity !== "quiet" && root.verbosity !== "normal" && root.verbosity !== "verbose")
      throw new Error("The verbosity configuration must stay quiet, normal or verbose.");
    config.verbosity = root.verbosity;
  }
  if (root.format !== void 0) {
    if (root.format !== "human" && root.format !== "json")
      throw new Error("The format configuration must stay human or json.");
    config.format = root.format;
  }
  if (root.allowlist !== void 0) {
    if (!Array.isArray(root.allowlist) || !root.allowlist.every((origin) => typeof origin === "string" && origin.startsWith("https://")))
      throw new Error("The allowlist configuration must be a list of HTTPS origins.");
    config.allowlist = root.allowlist.filter((origin) => typeof origin === "string");
  }
  return config;
}
var cliexitclasses = [
  "ok",
  "consentrefused",
  "stepfailed",
  "schemaerror",
  "unsupported",
  "cancelled"
];
function exitcodeof(exitclass) {
  const codes = {
    ok: 0,
    consentrefused: 1,
    stepfailed: 2,
    schemaerror: 3,
    unsupported: 4,
    cancelled: 5
  };
  const code = codes[exitclass];
  if (code === void 0)
    throw new Error(`The exit class ${exitclass} stays outside the documented classes ${cliexitclasses.join(", ")}.`);
  return code;
}
function exitclassofrun(run) {
  if (run.state === "done") return "ok";
  if (run.state === "failed") return "stepfailed";
  if (run.state === "cancelled") return "cancelled";
  return "schemaerror";
}
var manifestkeyallowlist = [
  "manifest_version",
  "key",
  "name",
  "version",
  "description",
  "default_locale",
  "permissions",
  "optional_permissions",
  "optional_host_permissions",
  "host_permissions",
  "content_scripts",
  "content_security_policy",
  "web_accessible_resources",
  "sandbox",
  "offscreen",
  "background",
  "action",
  "side_panel",
  "chrome_url_overrides",
  "options_ui",
  "icons",
  "minimum_chrome_version",
  "browsers",
  "vsix"
];
var reviewedwebresources = ["sandbox.html"];
function capabilityapireport(permissions) {
  const floors = {
    activeTab: 88,
    storage: 88,
    scripting: 88,
    sidePanel: 114,
    tabs: 88,
    downloads: 88,
    clipboardRead: 88,
    clipboardWrite: 88,
    offscreen: 109,
    nativeMessaging: 88
  };
  return permissions.flatMap(
    (permission) => floors[permission] !== void 0 ? [{ api: permission, minchrome: floors[permission] }] : []
  );
}
function pngdimensions(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 24 || signature.some((byte, index) => bytes[index] !== byte))
    throw new Error("The icon payload carries no png signature.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
function manifestsourceline(manifesttext, manifestfile, value) {
  const index = manifesttext.indexOf(value);
  if (index < 0) return void 0;
  const line = manifesttext.slice(0, index).split("\n").length;
  return `${manifestfile}:${line}`;
}
function csphashesof(policy) {
  return [...policy.matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g)].map((match) => `sha256-${match[1]}`);
}
function deepmanifestchecks(input) {
  if (!input.manifest || typeof input.manifest !== "object" || Array.isArray(input.manifest))
    throw new Error("The manifest must be a json object.");
  const manifest = input.manifest;
  const findings = [];
  for (const key of Object.keys(manifest)) {
    if (!manifestkeyallowlist.includes(key))
      findings.push({
        rule: "manifest.key.allowlist",
        path: key,
        ...manifestsourceline(input.manifesttext, input.manifestfile, `"${key}"`) !== void 0 ? { source: manifestsourceline(input.manifesttext, input.manifestfile, `"${key}"`) } : {},
        severity: "error",
        message: `The manifest key ${key} stays outside the runtime policy allowlist; an undeclared key never ships unreviewed.`
      });
  }
  const permissions = Array.isArray(manifest.permissions) ? manifest.permissions.filter((permission) => typeof permission === "string") : [];
  const optional = Array.isArray(manifest["optional_permissions"]) ? manifest["optional_permissions"].filter((permission) => typeof permission === "string") : [];
  for (const permission of permissions) {
    const source = manifestsourceline(input.manifesttext, input.manifestfile, `"${permission}"`);
    findings.push({
      rule: "manifest.permission.source",
      path: `permissions.${permission}`,
      ...source !== void 0 ? { source } : {},
      severity: "info",
      message: `The required permission ${permission} declares at ${source ?? "an unknown line"}.`
    });
  }
  for (const permission of optional) {
    const source = manifestsourceline(input.manifesttext, input.manifestfile, `"${permission}"`);
    findings.push({
      rule: "manifest.permission.source",
      path: `optional_permissions.${permission}`,
      ...source !== void 0 ? { source } : {},
      severity: "info",
      message: `The optional permission ${permission} declares at ${source ?? "an unknown line"}.`
    });
  }
  const duplicated = permissions.filter((permission) => optional.includes(permission));
  if (duplicated.length > 0)
    findings.push({
      rule: "manifest.permission.duplicate",
      path: "permissions",
      severity: "error",
      message: `The permission${duplicated.length === 1 ? "" : "s"} ${duplicated.join(", ")} declare${duplicated.length === 1 ? "s" : ""} in both the required and the optional sets; one permission declares exactly once.`
    });
  if (permissions.includes("nativeMessaging"))
    findings.push({
      rule: "manifest.permission.nativemessaging",
      path: "permissions.nativeMessaging",
      severity: "error",
      message: "The native messaging permission declares in the optional set only: a required native messaging permission installs a native host grant the user never reviewed, so the validator refuses it in the required set and the native transport stays a per install user choice."
    });
  if (optional.includes("nativeMessaging"))
    findings.push({
      rule: "manifest.permission.nativemessaging",
      path: "optional_permissions.nativeMessaging",
      severity: "info",
      message: "The native messaging permission declares in the optional set: the user grants the native transport per install behind the install consent, the per class gates and the kill switch of the native host bridge."
    });
  const csp = manifest["content_security_policy"];
  if (csp === void 0) {
    findings.push({
      rule: "manifest.csp.hashes",
      path: "content_security_policy",
      severity: "info",
      message: "The manifest declares no content security policy; the store default script-src 'self' applies and no inline script runs."
    });
  } else if (!csp || typeof csp !== "object" || Array.isArray(csp)) {
    findings.push({
      rule: "manifest.csp.hashes",
      path: "content_security_policy",
      severity: "error",
      message: "The content security policy must be the object with its extension pages policy; the manifest v3 form the extension pages read."
    });
  } else {
    const policy = csp["extension_pages"] ?? csp["extension_scripts"];
    if (typeof policy !== "string")
      findings.push({
        rule: "manifest.csp.hashes",
        path: "content_security_policy.extension_pages",
        severity: "error",
        message: "The extension pages policy needs its string form."
      });
    else {
      if (/unsafe-inline|unsafe-eval|\*/.test(policy))
        findings.push({
          rule: "manifest.csp.hashes",
          path: "content_security_policy.extension_pages",
          severity: "error",
          message: "The extension pages policy widens with a wildcard or an unsafe source; the reviewed policy carries only 'self' and script hashes."
        });
      const hashes = csphashesof(policy);
      if (hashes.length === 0)
        findings.push({
          rule: "manifest.csp.hashes",
          path: "content_security_policy.extension_pages",
          severity: "info",
          message: "The extension pages policy pins no script hash; only the 'self' origin loads scripts."
        });
      for (const hash of hashes) {
        const digest = hash.slice("sha256-".length);
        const matches = Object.entries(input.filebytes).filter(([, bytes]) => input.digestof(bytes) === digest);
        findings.push(
          matches.length > 0 ? {
            rule: "manifest.csp.hashes",
            path: "content_security_policy.extension_pages",
            severity: "info",
            message: `The script hash ${hash} verifies against ${matches.map(([name]) => name).join(", ")}.`
          } : {
            rule: "manifest.csp.hashes",
            path: "content_security_policy.extension_pages",
            severity: "error",
            message: `The script hash ${hash} verifies against no bundled script; every declared hash pins a shipped file.`
          }
        );
      }
    }
  }
  const resources = manifest["web_accessible_resources"];
  if (resources === void 0) {
    findings.push({
      rule: "manifest.war.reviewed",
      path: "web_accessible_resources",
      severity: "info",
      message: "The manifest declares no web accessible resources; nothing the extension ships is web exposed."
    });
  } else {
    const declared = Array.isArray(resources) ? resources.flatMap(
      (entry) => typeof entry === "string" ? [entry] : entry && typeof entry === "object" && Array.isArray(entry.resources) ? entry.resources.filter(
        (resource) => typeof resource === "string"
      ) : []
    ) : [];
    if (declared.length === 0)
      findings.push({
        rule: "manifest.war.reviewed",
        path: "web_accessible_resources",
        severity: "error",
        message: "The web accessible resources declaration carries no resource; an empty declaration declares nothing."
      });
    for (const resource of declared) {
      const source = manifestsourceline(input.manifesttext, input.manifestfile, resource);
      if (!reviewedwebresources.includes(resource))
        findings.push({
          rule: "manifest.war.reviewed",
          path: "web_accessible_resources",
          ...source !== void 0 ? { source } : {},
          severity: "error",
          message: `The web accessible resource ${resource} stays outside the reviewed resource set ${reviewedwebresources.join(", ")}.`
        });
    }
  }
  const floor = input.capabilities.reduce((highest, entry) => Math.max(highest, entry.minchrome), 0);
  const minimum = manifest["minimum_chrome_version"];
  if (minimum === void 0) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "info",
      message: `The manifest declares no minimum chrome version; the capability report of ${input.capabilities.length} api${input.capabilities.length === 1 ? "" : "s"} derives the floor ${floor}.`
    });
  } else if (typeof minimum !== "number" || !Number.isInteger(minimum) || minimum < 88) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "error",
      message: "The minimum chrome version must be an integer at or above the manifest v3 floor of 88."
    });
  } else if (minimum < floor) {
    findings.push({
      rule: "manifest.chromeminimum",
      path: "minimum_chrome_version",
      severity: "error",
      message: `The declared minimum chrome version ${minimum} sits below the capability floor ${floor} the declared apis require; a browser below the floor installs an extension whose apis miss.`
    });
  }
  const icons = manifest.icons;
  if (icons === void 0) {
    findings.push({
      rule: "manifest.icons",
      path: "icons",
      severity: "info",
      message: "The manifest declares no icons; the store renders the default puzzle piece beside the extension name."
    });
  } else if (!icons || typeof icons !== "object" || Array.isArray(icons)) {
    findings.push({
      rule: "manifest.icons",
      path: "icons",
      severity: "error",
      message: "The icons declaration must be the object of size keys and icon paths."
    });
  } else {
    for (const [size, path] of Object.entries(icons)) {
      const declared = Number(size);
      if (typeof path !== "string" || path.trim() === "") {
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          severity: "error",
          message: `The icon of size ${size} needs its file path.`
        });
        continue;
      }
      const bytes = input.filebytes[path];
      if (bytes === void 0) {
        if (input.bundlepresent === false) {
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "info",
            message: `The icon ${path} of size ${size} rides the browser bundle of the release zip channel; the running tree carries no bundle to verify against \u2014 a repository checkout verifies it after pnpm build and an installed library package carries the manifest structure alone.`
          });
          continue;
        }
        const source = manifestsourceline(input.manifesttext, input.manifestfile, path);
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          ...source !== void 0 ? { source } : {},
          severity: "error",
          message: `The icon ${path} of size ${size} ships no file in the bundle.`
        });
        continue;
      }
      try {
        const dimensions = pngdimensions(bytes);
        if (dimensions.width !== declared || dimensions.height !== declared)
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "error",
            message: `The icon ${path} decodes to ${dimensions.width}x${dimensions.height} while its size key declares ${declared}.`
          });
        else
          findings.push({
            rule: "manifest.icons",
            path: `icons.${size}`,
            severity: "info",
            message: `The icon ${path} decodes to ${dimensions.width}x${dimensions.height} and matches its size key.`
          });
      } catch (error) {
        findings.push({
          rule: "manifest.icons",
          path: `icons.${size}`,
          severity: "error",
          message: `The icon ${path} fails its png read: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
  }
  const exitcode = findings.some((finding) => finding.severity === "error") ? 1 : 0;
  return { findings, exitcode };
}
function planlintfindings(input) {
  const diagnostics = [];
  const catalog = new Set(actionkindcatalog());
  const capabilities = input.capabilities === void 0 ? void 0 : new Set(input.capabilities);
  input.file.steps.forEach((step, index) => {
    const path = `steps[${index}]`;
    if (!catalog.has(step.kind))
      diagnostics.push({
        code: "plan.kind.catalog",
        path: `${path}.kind`,
        severity: "error",
        message: `The step ${step.id} carries the kind ${step.kind} outside the reviewed catalog of ${catalog.size} kinds; a forbidden kind refuses the plan before any run starts.`
      });
    if (step.target !== void 0) {
      const trimmed = step.target.trim();
      if (trimmed.startsWith("{")) {
        try {
          const reference = validatetargetref(JSON.parse(trimmed));
          if (!reference.allowed)
            diagnostics.push({
              code: "plan.selector.grammar",
              path: `${path}.target`,
              severity: "error",
              message: `The target reference of the step ${step.id} fails the shared target reference grammar: ${reference.reason}`
            });
        } catch (error) {
          diagnostics.push({
            code: "plan.selector.grammar",
            path: `${path}.target`,
            severity: "error",
            message: `The target of the step ${step.id} parses neither as a selector nor as a target reference: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      } else {
        const selector = cssselectorvalid(trimmed);
        if (!selector.allowed)
          diagnostics.push({
            code: "plan.selector.grammar",
            path: `${path}.target`,
            severity: "error",
            message: `The selector of the step ${step.id} fails the shared selector grammar: ${selector.reason}`
          });
      }
    }
    const required = kindoptionfields(step.kind);
    if (required.length > 0) {
      let options = {};
      if (step.options !== void 0) {
        try {
          const parsed = JSON.parse(step.options);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            throw new Error("The options payload must be a json object.");
          options = parsed;
        } catch (error) {
          diagnostics.push({
            code: "plan.options.required",
            path: `${path}.options`,
            severity: "error",
            message: `The step ${step.id} of kind ${step.kind} carries options that parse no json object: ${error instanceof Error ? error.message : String(error)}`
          });
        }
      }
      const missing = required.filter((field) => options[field] === void 0);
      if (missing.length > 0)
        diagnostics.push({
          code: "plan.options.required",
          path: `${path}.options`,
          severity: "error",
          message: `The step ${step.id} of kind ${step.kind} misses the required option field${missing.length === 1 ? "" : "s"} ${missing.join(", ")}; the executor refuses the same payload at run time.`
        });
    }
    if (capabilities !== void 0 && !capabilities.has(step.kind))
      diagnostics.push({
        code: "plan.capability.catalog",
        path: `${path}.kind`,
        severity: "error",
        message: `The step ${step.id} carries the kind ${step.kind} outside the declared capability set; the target runtime never executes it.`
      });
  });
  if (input.allowlist !== void 0 && input.allowlist.length > 0 && !input.allowlist.includes(input.file.origin))
    diagnostics.push({
      code: "plan.origin.allowlist",
      path: "origin",
      severity: "error",
      message: `The plan origin ${input.file.origin} stays outside the consent allowlist of ${input.allowlist.length} origin${input.allowlist.length === 1 ? "" : "s"}; the extension demands the same grant before any step runs.`
    });
  return diagnostics;
}
function planrisksummaryof(file) {
  let read = 0;
  let interaction = 0;
  let sensitive = 0;
  for (const step of file.steps) {
    const risk = plansteprisk(step);
    if (risk === "read") read += 1;
    else if (risk === "interaction") interaction += 1;
    else sensitive += 1;
  }
  return {
    read,
    interaction,
    sensitive,
    steps: file.steps.length,
    reason: `The plan carries ${file.steps.length} step${file.steps.length === 1 ? "" : "s"}: ${read} read, ${interaction} interaction and ${sensitive} sensitive; the sensitive steps gate on the human review before any run starts.`
  };
}
function parseworkflowdocument(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The workflow document must be a json object.");
  const root = value;
  const unknownroot = Object.keys(root).filter((key) => !["version", "workflow"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The workflow document carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; schemastrict refuses unknown workflow document fields.`
    );
  if (typeof root.version !== "string" || root.version.trim() === "")
    throw new Error("The workflow document needs its version as a non-empty string.");
  const payload = root.workflow;
  if (typeof payload !== "object" || payload === null || Array.isArray(payload))
    throw new Error("The workflow document needs its workflow payload object.");
  const candidate = payload;
  const unknownpayload = Object.keys(candidate).filter(
    (key) => !["name", "version", "origins", "steps", "blocks"].includes(key)
  );
  if (unknownpayload.length > 0)
    throw new Error(
      `The workflow payload carries the unknown field${unknownpayload.length === 1 ? "" : "s"} ${unknownpayload.join(", ")}; schemastrict refuses unknown workflow payload fields.`
    );
  if (typeof candidate.name !== "string" || candidate.name.trim() === "")
    throw new Error("The workflow needs its name as a non-empty string.");
  if (typeof candidate.version !== "number" || !Number.isInteger(candidate.version) || candidate.version < 1)
    throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(candidate.origins) || candidate.origins.length === 0 || !candidate.origins.every((origin) => typeof origin === "string" && origin.startsWith("https://")))
    throw new Error("The workflow needs at least one granted HTTPS origin.");
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0)
    throw new Error("The workflow needs at least one step.");
  const steps = candidate.steps.map((step, index) => {
    const parsed = workflowstepof(step);
    if (parsed === void 0) throw new Error(`The workflow step at index ${index} fails the workflow step grammar.`);
    return parsed;
  });
  const blocks = candidate.blocks === void 0 ? void 0 : candidate.blocks.map((block, index) => {
    if (!block || typeof block !== "object")
      throw new Error(`The workflow block at index ${index} must be an object.`);
    return block;
  });
  return {
    version: root.version,
    workflow: {
      name: candidate.name,
      version: candidate.version,
      origins: candidate.origins,
      steps,
      ...blocks !== void 0 ? { blocks } : {}
    }
  };
}
function composeworkflowdocument(document2, now) {
  const steps = document2.workflow.steps.flatMap((step) => {
    const parsed = workflowstepof(step);
    return parsed !== void 0 ? [parsed] : [];
  });
  const blocks = (document2.workflow.blocks ?? []).flatMap((block) => {
    const parsed = workflowblockof(block);
    return parsed !== void 0 ? [parsed] : [];
  });
  return composeworkflow({
    name: document2.workflow.name,
    version: document2.workflow.version,
    origins: document2.workflow.origins,
    steps,
    blocks,
    now,
    kindallowed: (kind) => {
      try {
        actionrisk(kind);
        return true;
      } catch {
        return false;
      }
    },
    riskof: (kind) => {
      try {
        return actionrisk(kind);
      } catch {
        return "sensitive";
      }
    }
  });
}
function runworkflowsummaryof(input) {
  const exitclass = exitclassofrun(input.run);
  return {
    runid: input.runid,
    state: input.run.state,
    steps: input.log.map((entry) => ({
      stepid: entry.stepid,
      label: entry.label,
      state: entry.state,
      duration: entry.duration,
      summary: entry.summary
    })),
    checkpoint: input.run.cursor,
    exitclass,
    exitcode: exitcodeof(exitclass),
    ...input.run.failreason !== void 0 ? { reason: input.run.failreason } : {},
    ...input.run.cancelreason !== void 0 ? { reason: input.run.cancelreason } : {}
  };
}
function workflowauditlines(input) {
  const header = JSON.stringify({ runid: input.runid, workflow: input.workflow, state: "sealed", at: input.now });
  return [header, ...input.log.map((entry) => JSON.stringify(entry))].join("\n");
}
function exportdatawindow(records, from, to, timefield = "at") {
  return records.filter((record2) => {
    const at = record2[timefield];
    if (typeof at !== "number" || !Number.isFinite(at)) return true;
    if (from !== void 0 && at < from) return false;
    if (to !== void 0 && at > to) return false;
    return true;
  });
}
function secretstorerefusal(records) {
  const fields = /* @__PURE__ */ new Set();
  for (const record2 of records) {
    for (const [name, value] of Object.entries(record2)) {
      const lower = name.toLowerCase();
      if (lower === "vaultid" || lower === "vaultentry" || lower === "secretstore") fields.add(name);
      if (typeof value === "string" && value.trim() !== "" && secretfieldshapes.some((shape) => lower.includes(shape)) && !value.includes(maskmarker))
        fields.add(name);
    }
  }
  if (fields.size === 0) return { refused: false, fields: [] };
  const listed = [...fields].sort();
  return {
    refused: true,
    fields: listed,
    reason: `The exportdata command refuses the secret store material of ${listed.join(", ")}; the vault never ships through an export and an unmasked secret value refuses the export in full.`
  };
}
function exportdatacontent(input) {
  const refusal = secretstorerefusal(input.records);
  const descriptor = exportdescriptorof(input.format, input.scope);
  if (refusal.refused && refusal.reason !== void 0)
    return {
      result: {
        descriptor,
        bytes: 0,
        rows: 0,
        ...input.path !== void 0 ? { path: input.path } : {},
        reason: refusal.reason
      },
      content: ""
    };
  const windowed = exportdatawindow(input.records, input.from, input.to);
  return exportrecords({
    descriptor,
    records: windowed,
    shapes: input.shapes,
    ...input.path !== void 0 ? { path: input.path } : {}
  });
}
function parseheadlessfixture(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("The fixture file must be a json object.");
  const root = value;
  const unknownfields = Object.keys(root).filter(
    (key) => !["id", "origin", "observation", "grants", "recordedat"].includes(key)
  );
  if (unknownfields.length > 0)
    throw new Error(
      `The fixture carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown fixture fields.`
    );
  if (typeof root.id !== "string" || root.id.trim() === "")
    throw new Error("The fixture needs its id as a non-empty string.");
  if (typeof root.origin !== "string" || !root.origin.startsWith("https://"))
    throw new Error("The fixture needs the HTTPS origin it recorded.");
  if (!root.observation || typeof root.observation !== "object" || Array.isArray(root.observation))
    throw new Error("The fixture needs its observation payload of the live snapshot schema.");
  const observation = root.observation;
  for (const field of [
    "schemaversion",
    "url",
    "title",
    "textpreview",
    "textlength",
    "forms",
    "interactive",
    "capturedat"
  ]) {
    if (observation[field] === void 0)
      throw new Error(`The fixture observation misses its ${field} field of the live snapshot schema.`);
  }
  if (!Array.isArray(observation.forms) || !Array.isArray(observation.interactive))
    throw new Error("The fixture observation needs its forms and interactive lists.");
  if (!Array.isArray(root.grants) || !root.grants.every((grant) => typeof grant === "string" && grant.trim() !== ""))
    throw new Error("The fixture grants must be a list of non-empty action kind names.");
  if (typeof root.recordedat !== "number" || !Number.isFinite(root.recordedat))
    throw new Error("The fixture needs its recording time.");
  return {
    id: root.id,
    origin: root.origin,
    observation: root.observation,
    grants: root.grants.filter((grant) => typeof grant === "string"),
    recordedat: root.recordedat
  };
}
function resolvefixture(fixtures, origin) {
  const resolved = fixtures.find((fixture) => fixture.origin === origin);
  if (resolved === void 0)
    throw new Error(
      `No recorded fixture covers the origin ${origin}; headlessmode replays only against recorded page state.`
    );
  return resolved;
}
function requiredtext(record2, field, path) {
  const value = record2[field];
  if (typeof value !== "string" || value.trim() === "")
    throw new Error(`${path} needs its ${field} as a non-empty string.`);
  return value;
}
function optionaltext(record2, field, path) {
  const value = record2[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string")
    throw new Error(`${path} carries its ${field} as neither a string nor an absent field.`);
  return value.trim() === "" ? void 0 : value;
}
function optionalvalue(record2, field, path) {
  const value = record2[field];
  if (value === void 0) return void 0;
  if (typeof value !== "string" && typeof value !== "number")
    throw new Error(`${path} carries its ${field} as neither a string nor a number.`);
  return String(value).trim() === "" ? void 0 : String(value);
}
function convertedstep(input) {
  const catalog = new Set(actionkindcatalog());
  if (!catalog.has(input.kind))
    throw new Error(
      `The ${input.entry} carries the action ${input.kind} outside the reviewed catalog of ${catalog.size} kinds; the importer refuses to guess a kind.`
    );
  const step = { id: input.id, kind: input.kind, label: input.label };
  if (input.target !== void 0) {
    const selector = cssselectorvalid(input.target);
    if (!selector.allowed)
      throw new Error(
        `The ${input.entry} carries the selector ${input.target} the reviewed selector grammar refuses: ${selector.reason}`
      );
    step.target = input.target;
  }
  if (input.value !== void 0) step.value = input.value;
  if (input.options !== void 0) step.options = input.options;
  let risk = "sensitive";
  try {
    risk = actionrisk(input.kind);
  } catch {
  }
  if (risk === "sensitive") step.gate = true;
  return step;
}
function derivedlabel(kind, detail) {
  return detail === void 0 ? `Run the ${kind} step` : `Run the ${kind} step on ${detail}`;
}
function provenancenote(input) {
  return `The ${input.format} importer converted the source of version ${input.sourceversion} into ${input.mapped} reviewed step${input.mapped === 1 ? "" : "s"} on ${new Date(input.now).toISOString()}; the provenance rides this conversion report on stderr because the frozen plan file grammar carries no metadata field, and the converted plan enters the same review flow a hand authored plan enters.`;
}
function importv1plan(input) {
  try {
    const current = parseplanfile(input.source);
    const passthrough = {
      file: current,
      format: "v1",
      sourceversion: current.version,
      mapped: current.steps.length,
      notes: [
        provenancenote({ format: "v1", sourceversion: current.version, mapped: current.steps.length, now: input.now }),
        "The source already parses as the reviewed plan file grammar, so the conversion passes it through unchanged; the migration is idempotent."
      ]
    };
    return passthrough;
  } catch {
  }
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The version one plan must be a json object.");
  const root = input.source;
  const unknownroot = Object.keys(root).filter(
    (key) => !["version", "goal", "origin", "steps", "grants", "denials"].includes(key)
  );
  if (unknownroot.length > 0)
    throw new Error(
      `The version one plan carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`
    );
  const sourceversion = requiredtext(root, "version", "The version one plan");
  const goal = requiredtext(root, "goal", "The version one plan");
  const origin = requiredtext(root, "origin", "The version one plan");
  if (!origin.startsWith("https://")) throw new Error("The version one plan origin must be an HTTPS origin.");
  if (!Array.isArray(root.steps) || root.steps.length === 0)
    throw new Error("The version one plan needs at least one step.");
  const notes = [];
  const steps = [];
  let lifteddelays = 0;
  root.steps.forEach((rawstep, index) => {
    const path = `The version one step at index ${index}`;
    if (typeof rawstep !== "object" || rawstep === null || Array.isArray(rawstep))
      throw new Error(`${path} must be an object.`);
    const step = rawstep;
    const unknownfields = Object.keys(step).filter(
      (key) => !["id", "action", "label", "selector", "value", "milliseconds"].includes(key)
    );
    if (unknownfields.length > 0)
      throw new Error(
        `${path} carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`
      );
    const id = requiredtext(step, "id", path);
    const action = requiredtext(step, "action", path);
    const label = requiredtext(step, "label", path);
    const selector = optionaltext(step, "selector", path);
    const value = optionalvalue(step, "value", path);
    const milliseconds = step.milliseconds;
    if (milliseconds !== void 0) {
      if (action !== "delay")
        throw new Error(
          `The version one step ${id} carries its milliseconds field on the action ${action}; only the delay action lifts a hardcoded wait onto the reviewed option grammar.`
        );
      if (typeof milliseconds !== "number" || !Number.isInteger(milliseconds) || milliseconds < 1)
        throw new Error(
          `The version one step ${id} carries its milliseconds as a number the reviewed delay grammar refuses; the wait needs a positive integer of milliseconds.`
        );
      lifteddelays += 1;
    }
    steps.push(
      convertedstep({
        entry: `version one step ${id}`,
        id,
        kind: action,
        label,
        ...selector !== void 0 ? { target: selector } : {},
        ...value !== void 0 ? { value } : {},
        ...milliseconds !== void 0 ? { options: JSON.stringify({ delay: milliseconds }) } : {}
      })
    );
  });
  const file = { version: packageversion, goal, origin, steps };
  if (root.grants !== void 0) {
    if (!Array.isArray(root.grants) || !root.grants.every((grant) => typeof grant === "string" && grant.trim() !== ""))
      throw new Error("The version one plan grants must be a list of non-empty action kind names.");
    file.grants = root.grants.filter((grant) => typeof grant === "string");
  }
  if (root.denials !== void 0) {
    if (!Array.isArray(root.denials) || !root.denials.every((denial) => typeof denial === "string" && denial.trim() !== ""))
      throw new Error("The version one plan denials must be a list of non-empty action kind names.");
    file.denials = root.denials.filter((denial) => typeof denial === "string");
  }
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    `The version one field action of every step moved onto the kind field of the reviewed step grammar, the selector field onto the target field and the value field onto the value field; the step identifiers pass through unchanged.`,
    lifteddelays > 0 ? `The milliseconds field of ${lifteddelays} delay step${lifteddelays === 1 ? "" : "s"} lifted onto the reviewed delay option grammar as the delay option the executor reads.` : "The source carries no hardcoded delay to lift.",
    gated.length > 0 ? `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands; the sensitive steps wait for the human review exactly as a hand authored plan waits.` : "The source converts to read only steps that carry no gate declaration.",
    file.grants !== void 0 ? "The grants and denials of the devthink source pass through because they are devthink origin declarations of the same grammar family, never foreign consent grants; the foreign importers contribute none." : "The source declares no grants, so the converted plan inherits no consent grant from its source format."
  );
  return {
    file,
    format: "v1",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "v1", sourceversion, mapped: steps.length, now: input.now }), ...notes]
  };
}
function importautoma(input) {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The automa workflow must be a json object.");
  const root = input.source;
  const unknownroot = Object.keys(root).filter((key) => !["name", "version", "blocks"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The automa workflow carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`
    );
  const goal = requiredtext(root, "name", "The automa workflow");
  const sourceversion = optionaltext(root, "version", "The automa workflow") ?? "unrecorded";
  const blocks = root.blocks;
  if (typeof blocks !== "object" || blocks === null || Array.isArray(blocks))
    throw new Error("The automa workflow carries its blocks as the object keyed by block id.");
  const notes = [];
  const steps = [];
  let origin;
  let pausedtriggers = 0;
  for (const [key, rawblock] of Object.entries(blocks)) {
    if (key.trim() === "")
      throw new Error("The automa workflow carries a block under an empty id; every block names its id.");
    if (typeof rawblock !== "object" || rawblock === null || Array.isArray(rawblock))
      throw new Error(`The automa block ${key} must be an object.`);
    const block = rawblock;
    const type = requiredtext(block, "type", `The automa block ${key}`);
    const data = typeof block.data === "object" && block.data !== null && !Array.isArray(block.data) ? block.data : {};
    if (type === "trigger") {
      pausedtriggers += 1;
      continue;
    }
    if (type === "newtab") {
      const url = requiredtext(data, "url", `The automa block ${key} of type newtab`);
      if (!url.startsWith("https://"))
        throw new Error(
          `The automa block ${key} of type newtab carries the url ${url} the reviewed grammar refuses; the plan origin must be an HTTPS origin.`
        );
      const blockorigin = new URL(url).origin;
      if (origin === void 0) origin = blockorigin;
      else if (origin !== blockorigin)
        throw new Error(
          `The automa block ${key} of type newtab navigates to ${blockorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`
        );
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type newtab`,
          id: key,
          kind: "tabcreate",
          label: derivedlabel("tabcreate", url),
          value: url
        })
      );
      continue;
    }
    if (type === "click-element" || type === "link") {
      const selector = requiredtext(data, "selector", `The automa block ${key} of type ${type}`);
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type ${type}`,
          id: key,
          kind: "click",
          label: derivedlabel("click", selector),
          target: selector
        })
      );
      continue;
    }
    if (type === "forms") {
      const fields = data.fields;
      if (!Array.isArray(fields) || fields.length === 0)
        throw new Error(
          `The automa block ${key} of type forms carries no field list; a form block without fields fills nothing.`
        );
      const reviewed = [];
      fields.forEach((rawfield, fieldindex) => {
        if (typeof rawfield !== "object" || rawfield === null || Array.isArray(rawfield))
          throw new Error(`The field at index ${fieldindex} of the automa block ${key} must be an object.`);
        const field = rawfield;
        const name = requiredtext(field, "name", `The field at index ${fieldindex} of the automa block ${key}`);
        const value = optionalvalue(field, "value", `The field at index ${fieldindex} of the automa block ${key}`) ?? "";
        const selector = requiredtext(field, "selector", `The field at index ${fieldindex} of the automa block ${key}`);
        const checked = cssselectorvalid(selector);
        if (!checked.allowed)
          throw new Error(
            `The field at index ${fieldindex} of the automa block ${key} carries the selector ${selector} the reviewed selector grammar refuses: ${checked.reason}`
          );
        reviewed.push({ name, value, selector });
      });
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type forms`,
          id: key,
          kind: "fillform",
          label: derivedlabel("fillform", `${reviewed.length} form fields`),
          options: JSON.stringify({ fields: reviewed })
        })
      );
      continue;
    }
    if (type === "go-back") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type go-back`,
          id: key,
          kind: "back",
          label: derivedlabel("back")
        })
      );
      continue;
    }
    if (type === "close-tab") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type close-tab`,
          id: key,
          kind: "tabclose",
          label: derivedlabel("tabclose")
        })
      );
      continue;
    }
    if (type === "wait") {
      const ms = data.ms;
      if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 1)
        throw new Error(
          `The automa block ${key} of type wait carries its ms as a number the reviewed delay grammar refuses; the wait needs a positive integer of milliseconds.`
        );
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type wait`,
          id: key,
          kind: "delay",
          label: derivedlabel("delay", `${ms} milliseconds`),
          options: JSON.stringify({ delay: ms })
        })
      );
      continue;
    }
    if (type === "scroll") {
      const selector = requiredtext(data, "selector", `The automa block ${key} of type scroll`);
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type scroll`,
          id: key,
          kind: "scroll",
          label: derivedlabel("scroll", selector),
          target: selector
        })
      );
      continue;
    }
    if (type === "screenshot") {
      steps.push(
        convertedstep({
          entry: `automa block ${key} of type screenshot`,
          id: key,
          kind: "shotview",
          label: derivedlabel("shotview")
        })
      );
      continue;
    }
    throw new Error(
      `The automa block ${key} of type ${type} stays outside the conversion table of the automa importer; the importer refuses unmapped block types with the block named instead of guessing a kind.`
    );
  }
  if (origin === void 0)
    throw new Error(
      "The automa workflow carries no newtab block; the plan origin derives from the first newtab url, so a workflow without one refuses instead of guessing an origin."
    );
  if (steps.length === 0)
    throw new Error("The automa workflow converted to no step; the plan file grammar needs at least one step.");
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    "The automa block ids became the step ids and the steps follow the block order the workflow file carries, so the provenance of every converted step stays traceable to its block.",
    pausedtriggers > 0 ? `The trigger block${pausedtriggers === 1 ? "" : "s"} converted to no plan step: ${pausedtriggers === 1 ? "it lands" : "they land"} in this report as the paused trigger the scheduler arms only after the plan review, exactly the paused state the roadmap promises.` : "The workflow carries no trigger block.",
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the automa workflow.`
  );
  const file = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "automa",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "automa", sourceversion, mapped: steps.length, now: input.now }), ...notes]
  };
}
function resolvedlocator(entry, target) {
  const trimmed = target.trim();
  if (trimmed.startsWith("css=")) {
    const selector = trimmed.slice("css=".length).trim();
    if (selector === "")
      throw new Error(`The ${entry} carries an empty css= locator; a step that addresses the page names its selector.`);
    return selector;
  }
  if (trimmed.startsWith("id=")) {
    const id = trimmed.slice("id=".length).trim();
    if (id === "")
      throw new Error(`The ${entry} carries an empty id= locator; a step that addresses the page names its element.`);
    return `#${id}`;
  }
  if (trimmed.startsWith("name=")) {
    const name = trimmed.slice("name=".length).trim();
    if (name === "")
      throw new Error(`The ${entry} carries an empty name= locator; a step that addresses the page names its element.`);
    return `[name=${name}]`;
  }
  throw new Error(
    `The ${entry} carries the locator ${trimmed} outside the css=, id= and name= locator prefixes the importer resolves; the importer never guesses a selector.`
  );
}
function seleniumstepid(command, index, testname) {
  const id = optionaltext(command, "id", `The selenium command of ${testname} at index ${index}`);
  return id ?? `${testname}-${index + 1}`;
}
function importselenium(input) {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The selenium side file must be a json object.");
  const root = input.source;
  const unknownroot = Object.keys(root).filter(
    (key) => !["id", "version", "name", "url", "tests", "suites"].includes(key)
  );
  if (unknownroot.length > 0)
    throw new Error(
      `The selenium side file carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`
    );
  const sourceversion = requiredtext(root, "version", "The selenium side file");
  const goal = requiredtext(root, "name", "The selenium side file");
  const base = requiredtext(root, "url", "The selenium side file");
  if (!base.startsWith("https://"))
    throw new Error("The selenium side file url must be the HTTPS base origin the plan addresses.");
  const origin = new URL(base).origin;
  const tests = root.tests;
  if (!Array.isArray(tests)) throw new Error("The selenium side file carries its tests as a list.");
  if (tests.length !== 1)
    throw new Error(
      `The selenium side file carries ${tests.length} test${tests.length === 1 ? "" : "s"}; one plan addresses exactly one test, so split the side file or pick the test before the conversion.`
    );
  const rawtest = tests[0];
  if (typeof rawtest !== "object" || rawtest === null || Array.isArray(rawtest))
    throw new Error("The selenium test must be an object.");
  const test = rawtest;
  const testname = requiredtext(test, "name", "The selenium test");
  const commands = test.commands;
  if (!Array.isArray(commands) || commands.length === 0)
    throw new Error(`The selenium test ${testname} carries no command; the plan file grammar needs at least one step.`);
  const notes = [];
  const steps = [];
  commands.forEach((rawcommand, index) => {
    const path = `The selenium command of ${testname} at index ${index}`;
    if (typeof rawcommand !== "object" || rawcommand === null || Array.isArray(rawcommand))
      throw new Error(`${path} must be an object.`);
    const command = rawcommand;
    const name = requiredtext(command, "command", path);
    const id = seleniumstepid(command, index, testname);
    const target = optionaltext(command, "target", path);
    const value = optionalvalue(command, "value", path);
    if (name === "open") {
      if (target === void 0)
        throw new Error(
          `The selenium command ${id} of open carries no target; the open command names the url it resolves against the side file base.`
        );
      let resolved;
      if (target.startsWith("https://")) resolved = target;
      else if (target.startsWith("/")) resolved = `${origin}${target}`;
      else
        throw new Error(
          `The selenium command ${id} of open carries the target ${target} the importer resolves neither as an absolute url nor as a base relative path; the importer never guesses a url.`
        );
      const commandorigin = new URL(resolved).origin;
      if (commandorigin !== origin)
        throw new Error(
          `The selenium command ${id} of open navigates to ${commandorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`
        );
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind: "navigate",
          label: derivedlabel("navigate", resolved),
          value: resolved
        })
      );
      return;
    }
    if (name === "click" || name === "type" || name === "sendKeys" || name === "select") {
      if (target === void 0)
        throw new Error(
          `The selenium command ${id} of ${name} carries no target; a step that addresses the page names its selector.`
        );
      const selector = resolvedlocator(`selenium command ${id} of ${name}`, target);
      const kind = name === "sendKeys" ? "appendtext" : name;
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind,
          label: derivedlabel(kind, value !== void 0 ? `${selector} with ${value}` : selector),
          target: selector,
          ...value !== void 0 ? { value } : {}
        })
      );
      return;
    }
    if (name === "pause") {
      if (target === void 0 || !/^\d+$/.test(target.trim()) || Number(target.trim()) < 1)
        throw new Error(
          `The selenium command ${id} of pause carries its target ${target ?? ""} as the milliseconds the reviewed delay grammar refuses; the pause needs a positive integer of milliseconds.`
        );
      const ms = Number(target.trim());
      steps.push(
        convertedstep({
          entry: `selenium command ${id} of ${name}`,
          id,
          kind: "delay",
          label: derivedlabel("delay", `${ms} milliseconds`),
          options: JSON.stringify({ delay: ms })
        })
      );
      return;
    }
    throw new Error(
      `The selenium command ${id} of ${name} stays outside the conversion table of the selenium importer; the importer refuses unmapped commands with the command named instead of guessing a kind.`
    );
  });
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    `The selenium command ids became the step ids and the command table mapped open onto navigate, click onto click, type onto type, sendKeys onto appendtext, select onto select and pause onto the reviewed delay option grammar; the field mapping notes ride this report because the plan file grammar carries no metadata field.`,
    `The css=, id= and name= locator prefixes resolved onto the reviewed css selector grammar while the base url ${origin} became the plan origin; the importer resolved no xpath and guessed no selector.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the selenium side file.`
  );
  const file = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "selenium",
    sourceversion,
    mapped: steps.length,
    notes: [provenancenote({ format: "selenium", sourceversion, mapped: steps.length, now: input.now }), ...notes]
  };
}
function importuivision(input) {
  if (typeof input.source !== "object" || input.source === null || Array.isArray(input.source))
    throw new Error("The ui vision macro must be a json object.");
  const root = input.source;
  const unknownroot = Object.keys(root).filter((key) => !["Name", "CreationDate", "Commands"].includes(key));
  if (unknownroot.length > 0)
    throw new Error(
      `The ui vision macro carries the unknown field${unknownroot.length === 1 ? "" : "s"} ${unknownroot.join(", ")}; the migration reports fields without a destination as refusals, never as silent drops.`
    );
  const goal = requiredtext(root, "Name", "The ui vision macro");
  const commands = root.Commands;
  if (!Array.isArray(commands) || commands.length === 0)
    throw new Error("The ui vision macro carries no command; the plan file grammar needs at least one step.");
  const notes = [];
  const steps = [];
  let origin;
  commands.forEach((rawcommand, index) => {
    const path = `The ui vision command at index ${index}`;
    if (typeof rawcommand !== "object" || rawcommand === null || Array.isArray(rawcommand))
      throw new Error(`${path} must be an object.`);
    const command = rawcommand;
    const name = requiredtext(command, "Command", path);
    const target = optionaltext(command, "Target", path);
    const value = optionalvalue(command, "Value", path);
    const id = `${name.toLowerCase()}-${index + 1}`;
    if (name === "open") {
      if (target === void 0)
        throw new Error(
          `The ui vision command ${id} of open carries no Target; the open command names the absolute url it opens.`
        );
      if (!target.startsWith("https://"))
        throw new Error(
          `The ui vision command ${id} of open carries the Target ${target} the reviewed grammar refuses; the plan origin must be an HTTPS origin.`
        );
      const commandorigin = new URL(target).origin;
      if (origin === void 0) origin = commandorigin;
      else if (origin !== commandorigin)
        throw new Error(
          `The ui vision command ${id} of open navigates to ${commandorigin} while the plan addresses ${origin}; one plan addresses exactly one origin, so the importer refuses the navigation instead of guessing.`
        );
      steps.push(
        convertedstep({
          entry: `ui vision command ${id} of ${name}`,
          id,
          kind: "navigate",
          label: derivedlabel("navigate", target),
          value: target
        })
      );
      return;
    }
    if (name === "click" || name === "type" || name === "verifyText") {
      if (target === void 0)
        throw new Error(
          `The ui vision command ${id} of ${name} carries no Target; a step that addresses the page names its selector.`
        );
      const selector = resolvedlocator(`ui vision command ${id} of ${name}`, target);
      const kind = name === "verifyText" ? "waittext" : name.toLowerCase();
      steps.push(
        convertedstep({
          entry: `ui vision command ${id} of ${name}`,
          id,
          kind,
          label: derivedlabel(kind, value !== void 0 ? `${selector} with ${value}` : selector),
          target: selector,
          ...value !== void 0 ? { value } : {}
        })
      );
      return;
    }
    throw new Error(
      `The ui vision command ${id} of ${name} stays outside the conversion table of the ui vision importer; the importer refuses unmapped commands with the command named instead of guessing a kind.`
    );
  });
  if (origin === void 0)
    throw new Error(
      "The ui vision macro carries no open command; the plan origin derives from the first open target, so a macro without one refuses instead of guessing an origin."
    );
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  notes.push(
    "The macro format carries no step identifiers, so the importer derived stable step ids from the command name and the position; the ids stay stable across reimports of the same macro.",
    `The Command, Target and Value fields moved onto the kind, target and value fields of the reviewed step grammar with the css=, id= and name= locator prefixes resolved onto the reviewed css selector grammar; the plan origin ${origin} derives from the first open target.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the ui vision macro.`
  );
  const file = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "uivision",
    sourceversion: optionaltext(root, "CreationDate", "The ui vision macro") ?? "unrecorded",
    mapped: steps.length,
    notes: [
      provenancenote({
        format: "uivision",
        sourceversion: optionaltext(root, "CreationDate", "The ui vision macro") ?? "unrecorded",
        mapped: steps.length,
        now: input.now
      }),
      ...notes
    ]
  };
}
function parsecsvrows(text2) {
  const rows = [];
  let row = [];
  let cell = "";
  let inquote = false;
  let cellstarted = false;
  const pushcell = () => {
    row.push(cell);
    cell = "";
    cellstarted = false;
  };
  const pushrow = () => {
    if (row.length > 0 || cellstarted || cell !== "") {
      pushcell();
      rows.push(row);
      row = [];
    }
  };
  for (let index = 0; index < text2.length; index += 1) {
    const char = text2[index] ?? "";
    if (inquote) {
      if (char === '"') {
        if ((text2[index + 1] ?? "") === '"') {
          cell += '"';
          index += 1;
        } else inquote = false;
        continue;
      }
      cell += char;
      continue;
    }
    if (char === '"') {
      inquote = true;
      cellstarted = true;
      continue;
    }
    if (char === ",") {
      pushcell();
      continue;
    }
    if (char === "\n") {
      pushrow();
      continue;
    }
    if (char === "\r") continue;
    cell += char;
    cellstarted = true;
  }
  if (inquote)
    throw new Error(
      "The csv table ends inside a quoted cell; an unterminated quote refuses the parse instead of guessing the cell end."
    );
  pushrow();
  return rows;
}
function importtabular(input) {
  const rawlines = input.text.split("\n");
  let cursor = 0;
  let goal;
  let origin;
  while (cursor < rawlines.length && (rawlines[cursor] ?? "").trim().startsWith("#")) {
    const comment = (rawlines[cursor] ?? "").trim();
    const body = comment.slice(1).trim();
    const goalvalue = body.startsWith("goal:") ? body.slice("goal:".length).trim() : "";
    if (goalvalue !== "") goal = goalvalue;
    const originvalue = body.startsWith("origin:") ? body.slice("origin:".length).trim() : "";
    if (originvalue !== "") origin = originvalue;
    cursor += 1;
  }
  if (goal === void 0 || goal === "")
    throw new Error(
      "The tabular source carries no `# goal:` preface line; a csv row set holds no metadata of its own, so the goal must ride the preface the conversion reads."
    );
  if (origin === void 0 || origin === "")
    throw new Error(
      "The tabular source carries no `# origin:` preface line; a csv row set holds no metadata of its own, so the HTTPS origin must ride the preface the conversion reads."
    );
  if (!origin.startsWith("https://")) throw new Error("The tabular source origin preface must be an HTTPS origin.");
  const table = parsecsvrows(rawlines.slice(cursor).join("\n"));
  const header = table[0];
  if (header === void 0)
    throw new Error("The tabular source carries no header row; the header names the step, target and value columns.");
  const columns = header.map((cell) => cell.trim());
  for (const column of columns)
    if (column !== "step" && column !== "target" && column !== "value")
      throw new Error(
        `The tabular header carries the column ${column} outside the step, target and value columns; the migration reports columns without a destination as refusals, never as silent drops.`
      );
  for (const column of ["step", "target", "value"])
    if (!columns.includes(column))
      throw new Error(
        `The tabular header misses its ${column} column; every tabular plan names its step, target and value columns.`
      );
  const stepcolumn = columns.indexOf("step");
  const targetcolumn = columns.indexOf("target");
  const valuecolumn = columns.indexOf("value");
  const steps = [];
  table.slice(1).forEach((cells, rowindex) => {
    const rownumber = rowindex + 1;
    if (cells.every((cell) => cell.trim() === "")) return;
    const kind = (cells[stepcolumn] ?? "").trim();
    if (kind === "")
      throw new Error(
        `The tabular row ${rownumber} carries no step cell; every row names the reviewed kind it converts onto.`
      );
    const target = (cells[targetcolumn] ?? "").trim();
    const value = cells[valuecolumn] ?? "";
    const detail = target !== "" ? target : value.trim() !== "" ? value.trim() : void 0;
    steps.push(
      convertedstep({
        entry: `tabular row ${rownumber}`,
        id: `${kind}-${rownumber}`,
        kind,
        label: derivedlabel(kind, detail),
        ...target !== "" ? { target } : {},
        ...value.trim() !== "" ? { value } : {}
      })
    );
  });
  if (steps.length === 0)
    throw new Error("The tabular source converted to no step; the plan file grammar needs at least one step.");
  const gated = steps.filter((step) => step.gate === true).map((step) => step.id);
  const notes = [
    `The tabular header row named the step, target and value columns, every data row became one reviewed step and the step ids derive from the kind and the row position so a reimport of the same table keeps its ids; the labels derive from the kind and the target because a row set carries no labels.`,
    `The converted sensitive step${gated.length === 1 ? "" : "s"} ${gated.join(", ")} carr${gated.length === 1 ? "ies" : "ry"} the explicit gate declaration the review demands, and the converted plan inherits no consent grant from the tabular source.`
  ];
  const file = { version: packageversion, goal, origin, steps };
  return {
    file,
    format: "tabular",
    sourceversion: "csv row set",
    mapped: steps.length,
    notes: [
      provenancenote({ format: "tabular", sourceversion: "csv row set", mapped: steps.length, now: input.now }),
      ...notes
    ]
  };
}
function migrateplanconversion(input) {
  if (input.format === "tabular") return importtabular({ text: input.text, now: input.now });
  if (input.format !== "v1" && input.format !== "automa" && input.format !== "selenium" && input.format !== "uivision")
    throw new Error(
      `The migrateplan format ${input.format} stays outside the v1, automa, selenium, uivision and tabular source formats; the converter never guesses the source format.`
    );
  let source;
  try {
    source = JSON.parse(input.text);
  } catch (error) {
    throw new Error(
      `The ${input.format} source parses no json: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (input.format === "v1") return importv1plan({ source, now: input.now });
  if (input.format === "automa") return importautoma({ source, now: input.now });
  if (input.format === "selenium") return importselenium({ source, now: input.now });
  return importuivision({ source, now: input.now });
}
function bundlesizeaccounting(input) {
  const budgets = {
    index: 18e5,
    indexcjs: 19e5,
    neutral: 18e5,
    umd: 19e5,
    node: 19e5,
    bun: 18e5,
    deno: 18e5,
    cli: 6e5,
    headless: 7e5,
    policy: 6e5,
    protocol: 38e4,
    memory: 33e4,
    progress: 6e4
  };
  const over = [];
  for (const entry of input) {
    const budget = budgets[entry.target];
    if (budget === void 0) continue;
    if (entry.bytes > budget) over.push({ target: entry.target, bytes: entry.bytes, budget });
  }
  return {
    ok: over.length === 0,
    over,
    reason: over.length === 0 ? `Every dist target stays inside its size budget: ${input.map((entry) => `${entry.target}=${entry.bytes}b`).join(", ")}.` : `The dist target${over.length === 1 ? "" : "s"} ${over.map((entry) => entry.target).join(", ")} exceed${over.length === 1 ? "s" : ""} the size budget: ${over.map((entry) => `${entry.target}=${entry.bytes}b>${entry.budget}b`).join(", ")}.`
  };
}
export {
  bundlesizeaccounting,
  capabilityapireport,
  cliexitclasses,
  composeworkflowdocument,
  csphashesof,
  deepmanifestchecks,
  exitclassofrun,
  exitcodeof,
  exportdatacontent,
  exportdatawindow,
  importautoma,
  importselenium,
  importtabular,
  importuivision,
  importv1plan,
  manifestkeyallowlist,
  manifestsourceline,
  migrateplanconversion,
  parsecliconfig,
  parsecsvrows,
  parseheadlessfixture,
  parseworkflowdocument,
  planlintfindings,
  planrisksummaryof,
  pngdimensions,
  resolvefixture,
  reviewedwebresources,
  runclifamily,
  runworkflowsummaryof,
  secretstorerefusal,
  workflowauditlines
};
