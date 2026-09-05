/**
 * The workflow module of the 1.1.90 consolidation: every correlated variation of the workflow engine, its control constructs, its triggers and its editor interned in this one file, so the module family carries one surface without duplicate variations — the workflow and controlflow modules import each other today, and the merge resolves that circular import by making the engine base and its control constructs one module.
 * The correlation is the workflow family: workflow holds the engine base (the step, block and template normalizers, the composition that validates and freezes a step list, the block expansion that hides no step from review, the typed scope stack with shadowing, the variable bindings, the expression arithmetic with coercion refusals, the regex extraction, the seeded delay jitter, the run loop with per step checkpoints, the pause, resume and cancel transitions and the pure dry run); controlflow holds the control constructs the engine executes (the condition, branch, loop, repeatuntil, while, foreach, parallel and trycatch steps with their bounds, the retry policy with its backoff, the timeout aborts and the seeded control random); trigger holds the rule kinds that arm, schedule, match and fire the reviewed workflows (the cooldowns, the cron and calendar parts, the webhook verification and the manual run confirmation); and workfloweditor holds the editor surface (the palette and step library, the canvas layout with snap, reorder and group select, the undo and redo history, the minimap, the breakpoints, the version diff, the import and export in the reviewed file format and the site overrides).
 * No loop bound, retry policy, cooldown or cron field is ever hardcoded beyond the documented grammar: every bound stays the user's choice, and no workflow, trigger or editor path ever bypasses the human review.
 */

import type { actionrisk, blockinvocation, delaystep, expressiontype, nestedparam, regexrule, runlogentry, steptemplate, variablebinding, variablekind, variablescope, variablevalue, watchdogconfig, workflowblock, workflowrecord, workflowrun, workflowstep, stepoutcome, branchoutcome, branchpath, branchstep, conditionstep, controlflowdecision, errorhandler, foreachstep, joinrecord, loopcounter, loopstep, paralleloutcome, parallelstep, repeatuntilstep, retrypolicy, retryattempt, timeoutabort, trystep, whilestep, manualrun, rulestats, triggerfamily, triggerfire, triggerstate, triggerule, webhookfield, editoredge, editormodel, editornode, editorlayout, exportformat, minimapstate, palettecategory, palettenode, siteoverride, steplibraryentry, versiondiff, workflowfile } from "./types.js";


/**
 * Workflow engine for the 1.1.50 family.
 * Every correlated rule for the reviewed step composition lives in this file: the workflow kind list, the step, block and template normalizers, the composition that validates and freezes a step list, the block expansion that hides no step from review, the pre-run validation of kinds, scopes and bindings, the typed scope stack with shadowing, the variable bindings that link step outputs to names, the expression arithmetic with coercion refusals, the regex extraction with honest no match outcomes, the seeded delay jitter, the run loop with per step checkpoints, the single step execution, the pause, resume and cancel transitions and the pure dry run with read only projections.
 * The engine stays pure: every page, browser and storage effect flows through the injected executor so tests run on plain fixtures, and the risk grading flows through the injected risk callback so the policy table stays the single source of truth.
 */

/** The workflow kinds of the 1.1.50 family: composition, templates, runs, dry runs, jittered delays, element waits, expressions and variable extraction. */
export const workflowkinds: string[] = ["composeworkflow", "savetemplate", "runworkflow", "dryrun", "delay", "waitelement", "compute", "extractvars"];

/** The outcome the injected executor returns for one workflow step: control flow executors also return the merged scopes and the iteration runlog entries so the run loop adopts them. */
export type stepexecution = { ok: boolean; summary: string; details?: Record<string, unknown>; scopes?: variablescope[]; log?: runlogentry[] };

/** Normalizes one nested parameter of a block invocation: the variable name, the reviewed kind and the optional default value. */
function nestedparamof(value: unknown): nestedparam | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return undefined;
  if (!variablekinds.includes(candidate.kind as variablekind)) return undefined;
  if (candidate.default !== undefined && !["string", "number", "boolean"].includes(typeof candidate.default) && !Array.isArray(candidate.default)) return undefined;
  return { name: candidate.name, kind: candidate.kind as variablekind, ...(candidate.default !== undefined ? { default: candidate.default as string | number | boolean | string[] } : {}) };
}

/** Normalizes one workflow step: id, kind, label, the optional target, value and JSON options, the output bindings, the inline expression, the inline regex rule, the breakpoint marker and the nested block parameters. */
export function workflowstepof(value: unknown): workflowstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return undefined;
  if (typeof candidate.kind !== "string" || !/^[a-z]+$/.test(candidate.kind)) return undefined;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return undefined;
  if (candidate.target !== undefined && (typeof candidate.target !== "string" || !candidate.target)) return undefined;
  if (candidate.value !== undefined && typeof candidate.value !== "string") return undefined;
  if (candidate.options !== undefined && typeof candidate.options !== "string") return undefined;
  if (candidate.breakpoint !== undefined && typeof candidate.breakpoint !== "boolean") return undefined;
  const bindings = Array.isArray(candidate.bindings) ? candidate.bindings.flatMap(binding => bindingof(binding) !== undefined ? [bindingof(binding) as variablebinding] : []) : undefined;
  if (candidate.bindings !== undefined && bindings === undefined) return undefined;
  if (Array.isArray(candidate.bindings) && bindings !== undefined && bindings.length !== (candidate.bindings as unknown[]).length) return undefined;
  const expression = candidate.expression === undefined ? undefined : expressionof(candidate.expression);
  if (candidate.expression !== undefined && expression === undefined) return undefined;
  const extract = candidate.extract === undefined ? undefined : regexruleof(candidate.extract);
  if (candidate.extract !== undefined && extract === undefined) return undefined;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap(param => nestedparamof(param) !== undefined ? [nestedparamof(param) as nestedparam] : []) : undefined;
  if (candidate.params !== undefined && params === undefined) return undefined;
  if (Array.isArray(candidate.params) && params !== undefined && params.length !== (candidate.params as unknown[]).length) return undefined;
  return { id: candidate.id, kind: candidate.kind as workflowstep["kind"], label: candidate.label, ...(candidate.target !== undefined ? { target: candidate.target } : {}), ...(candidate.value !== undefined ? { value: candidate.value } : {}), ...(candidate.options !== undefined ? { options: candidate.options } : {}), ...(bindings !== undefined && bindings.length > 0 ? { bindings } : {}), ...(expression !== undefined ? { expression } : {}), ...(extract !== undefined ? { extract } : {}), ...(candidate.breakpoint === true ? { breakpoint: true } : {}), ...(params !== undefined && params.length > 0 ? { params } : {}) };
}

/** Normalizes one block invocation: the referenced block name and the human readable label. */
export function blockinvocationof(value: unknown): blockinvocation | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.block !== "string" || !candidate.block.trim()) return undefined;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return undefined;
  const params = Array.isArray(candidate.params) ? candidate.params.flatMap(param => nestedparamof(param) !== undefined ? [nestedparamof(param) as nestedparam] : []) : undefined;
  if (candidate.params !== undefined && params === undefined) return undefined;
  if (Array.isArray(candidate.params) && params !== undefined && params.length !== (candidate.params as unknown[]).length) return undefined;
  return { block: candidate.block, label: candidate.label, ...(params !== undefined && params.length > 0 ? { params } : {}) };
}

/** Normalizes one reusable workflow block: the unique name, the label and the child steps with nested block invocations. */
export function workflowblockof(value: unknown): workflowblock | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.name)) return undefined;
  if (typeof candidate.label !== "string" || !candidate.label.trim()) return undefined;
  if (!Array.isArray(candidate.steps)) return undefined;
  const steps: Array<workflowstep | blockinvocation> = [];
  for (const entry of candidate.steps) {
    const step = workflowstepof(entry);
    if (step) { steps.push(step); continue; }
    const invocation = blockinvocationof(entry);
    if (invocation) { steps.push(invocation); continue; }
    return undefined;
  }
  return { name: candidate.name, label: candidate.label, steps };
}

/** Normalizes one shareable step template: the id, the unique name, the origin, the step and the share time. */
export function steptemplateof(value: unknown): steptemplate | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return undefined;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return undefined;
  if (typeof candidate.origin !== "string" || !candidate.origin.trim()) return undefined;
  const step = workflowstepof(candidate.step);
  if (!step) return undefined;
  if (typeof candidate.sharedat !== "number" || !Number.isFinite(candidate.sharedat)) return undefined;
  return { id: candidate.id, name: candidate.name, origin: candidate.origin, step, sharedat: candidate.sharedat };
}

/** Normalizes one variable binding that links a step output path to a named variable of a typed kind. */
function bindingof(value: unknown): variablebinding | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.variable !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.variable)) return undefined;
  if (!variablekinds.includes(candidate.kind as variablekind)) return undefined;
  if (typeof candidate.stepid !== "string" || !candidate.stepid.trim()) return undefined;
  if (candidate.path !== undefined && (typeof candidate.path !== "string" || !candidate.path.trim())) return undefined;
  return { variable: candidate.variable, kind: candidate.kind as variablekind, stepid: candidate.stepid, ...(candidate.path !== undefined ? { path: candidate.path } : {}) };
}

/** The typed variable kinds of the scope grammar. */
const variablekinds: variablekind[] = ["string", "number", "boolean", "list", "element"];

/** The reviewed expression operators of the workflow grammar. */
export const expressionoperators: string[] = ["add", "subtract", "multiply", "divide", "modulo", "equal", "notequal", "less", "greater", "lessequal", "greaterequal", "and", "or", "not", "concat", "contains", "length"];

/** Normalizes one reviewed expression: the operands, the operator and the result variable with its result kind. */
export function expressionof(value: unknown): expressiontype | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const left = operandof(candidate.left);
  if (!left) return undefined;
  const right = candidate.right === undefined ? undefined : operandof(candidate.right);
  if (candidate.right !== undefined && right === undefined) return undefined;
  if (typeof candidate.operator !== "string" || !expressionoperators.includes(candidate.operator)) return undefined;
  if (typeof candidate.result !== "string" || !/^[a-z][a-z0-9]*$/.test(candidate.result)) return undefined;
  if (!variablekinds.includes(candidate.resultkind as variablekind)) return undefined;
  return { left, ...(right !== undefined ? { right } : {}), operator: candidate.operator as expressiontype["operator"], result: candidate.result, resultkind: candidate.resultkind as variablekind };
}

/** Normalizes one expression operand: a variable reference or a literal of a reviewed primitive kind. */
function operandof(value: unknown): { ref?: string; literal?: string | number | boolean } | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return { literal: value };
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.ref === "string" && /^[a-z][a-z0-9]*$/.test(candidate.ref)) return { ref: candidate.ref };
  if (typeof candidate.literal === "string" || typeof candidate.literal === "number" || typeof candidate.literal === "boolean") return { literal: candidate.literal };
  return undefined;
}

/** Normalizes one reviewed regex rule: the pattern, the flag set and the named capture group list. */
export function regexruleof(value: unknown): regexrule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return undefined;
  if (typeof candidate.flags !== "string" || !/^[dgimsuvy]*$/.test(candidate.flags)) return undefined;
  const groups = Array.isArray(candidate.groups) ? candidate.groups.flatMap(group => typeof group === "string" && /^[a-z][a-z0-9]*$/.test(group) ? [group] : []) : [];
  if (candidate.groups !== undefined && groups.length !== (candidate.groups as unknown[]).length) return undefined;
  return { pattern: candidate.pattern, flags: candidate.flags, groups };
}

/** Flattens nested blocks into one executable step list; every flattened step carries the innermost block name so runs highlight the active block, and the nested parameters of an invocation stamp onto the first step of its region so the run binds them into the block scope. Unknown or cyclic block references are refused. */
export function expandblocks(steps: Array<workflowstep | blockinvocation>, blocks: workflowblock[]): workflowstep[] {
  const byname = new Map(blocks.map(block => [block.name, block]));
  const expanded: workflowstep[] = [];
  const visit = (entries: Array<workflowstep | blockinvocation>, path: string[], inside: string | undefined, params?: nestedparam[]): void => {
    let stamped = params === undefined;
    for (const entry of entries) {
      if ("kind" in entry && "label" in entry && !("block" in entry)) {
        const marked = inside === undefined ? entry : { ...entry, block: inside };
        if (!stamped && params !== undefined) { expanded.push({ ...marked, params }); stamped = true; } else expanded.push(marked);
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
  visit(steps, [], undefined);
  if (expanded.length === 0) throw new Error("A workflow needs at least one executable step after block expansion.");
  return expanded;
}

/** Composes one workflow record: validates the name, version, origin grants, steps and blocks, expands every block so no step stays hidden, grades the review risk through the injected risk table and freezes the result. */
export function composeworkflow(input: { id?: string; name: string; version: number; origins: string[]; steps: Array<workflowstep | blockinvocation>; blocks?: workflowblock[]; now: number; kindallowed?: (kind: string) => boolean; riskof?: (kind: string) => actionrisk }): workflowrecord {
  if (typeof input.name !== "string" || !input.name.trim()) throw new Error("The workflow name must be a non-empty string.");
  if (typeof input.version !== "number" || !Number.isInteger(input.version) || input.version < 1) throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(input.origins) || input.origins.length === 0) throw new Error("A workflow needs at least one granted HTTPS origin.");
  const origins = input.origins.map(origin => {
    try { return new URL(origin).origin; } catch { throw new Error(`The workflow origin ${origin} is not a valid url.`); }
  });
  if (origins.some(origin => !origin.startsWith("https://"))) throw new Error("Workflow origins must use HTTPS.");
  const blocks = input.blocks ?? [];
  if (blocks.some((block, index) => blocks.findIndex(other => other.name === block.name) !== index)) throw new Error("Workflow block names must stay unique.");
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
      if (!steps.some(other => other.id === binding.stepid)) throw new Error(`The binding of ${binding.variable} references the unknown step ${binding.stepid}.`);
    }
  }
  const riskof = input.riskof ?? ((): actionrisk => "sensitive");
  const gradedkinds = steps.flatMap(step => [step.kind, ...controlsteps(step).map(child => child.kind)]);
  const risk: actionrisk = gradedkinds.some(kind => riskof(kind) === "sensitive") ? "sensitive" : gradedkinds.some(kind => riskof(kind) === "interaction") ? "interaction" : "read";
  const record: workflowrecord = { id: input.id ?? crypto.randomUUID(), name: input.name, version: input.version, origins: [...new Set(origins)], steps, blocks, risk, createdat: input.now };
  return deepfreeze(record);
}

/** Freezes a composed workflow record so later mutations of the shared object graph never rewrite a reviewed workflow. */
function deepfreeze(record: workflowrecord): workflowrecord {
  for (const step of record.steps) Object.freeze(step);
  for (const block of record.blocks) for (const entry of block.steps) if ("kind" in entry && "label" in entry && !("block" in entry)) Object.freeze(entry);
  Object.freeze(record.blocks);
  Object.freeze(record.steps);
  return Object.freeze(record);
}

/** Validates a composed workflow before any run: the expanded step list, every step kind against the injected allowlist, the bindings against earlier steps and every variable reference against the bindings, the inputs and the root scope. */
export function validateworkflow(record: workflowrecord, options?: { kindallowed?: (kind: string) => boolean; inputs?: string[] }): { allowed: boolean; reason?: string } {
  if (record.steps.length === 0) return { allowed: false, reason: "A workflow needs at least one reviewed step." };
  const defined = new Set(options?.inputs ?? []);
  const byid = new Map(record.steps.map((step, index) => [step.id, { step, index }]));
  for (let index = 0; index < record.steps.length; index += 1) {
    const step = record.steps[index] as workflowstep;
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

/** Opens one child scope for a block invocation; the parent chain stays intact so resolution walks outward. */
export function pushscope(scopes: variablescope[], name: string, parent?: string): variablescope[] {
  return [...scopes, { name, variables: [], ...(parent !== undefined ? { parent } : {}) }];
}

/** Closes the newest scope and keeps every parent scope intact. */
export function popscope(scopes: variablescope[]): variablescope[] {
  if (scopes.length === 0) return scopes;
  return scopes.slice(0, -1);
}

/** Resolves one variable from the nearest scope outward through the parent chain; shadowing follows the newest scope first. */
export function resolvevariable(scopes: variablescope[], name: string): variablevalue | undefined {
  for (let index = scopes.length - 1; index >= 0; index -= 1) {
    const scope = scopes[index] as variablescope;
    const found = scope.variables.find(variable => variable.name === name);
    if (found) return found;
    if (scope.parent === undefined) continue;
    const parentindex = scopes.findIndex(candidate => candidate.name === scope.parent);
    if (parentindex >= 0 && parentindex < index) {
      const inherited = resolvevariable([scopes[parentindex] as variablescope], name);
      if (inherited) return inherited;
    }
  }
  return undefined;
}

/** Writes one variable into the newest scope, replacing a same named value of that scope only. */
export function setvariable(scopes: variablescope[], name: string, kind: variablekind, value: string | number | boolean | string[], now: number): variablescope[] {
  if (scopes.length === 0) scopes = [{ name: "root", variables: [] }];
  const target = scopes[scopes.length - 1] as variablescope;
  const variables = [...target.variables.filter(variable => variable.name !== name), { name, kind, value, setat: now }];
  return [...scopes.slice(0, -1), { ...target, variables }];
}

/** Coerces one raw binding value into the reviewed variable kind; mismatched values are refused instead of silently rewritten. */
function coercevariable(value: unknown, kind: variablekind): string | number | boolean | string[] {
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
    if (Array.isArray(value)) return value.map(item => String(item));
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

/** Reads one dotted path out of a step outcome; an absent path returns the outcome summary. */
function outcomedetail(outcome: stepoutcome, path: string | undefined): unknown {
  if (!path) return outcome.summary;
  let current: unknown = outcome.details ?? {};
  for (const segment of path.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** Resolves every binding whose source step already produced an outcome into the newest scope; the engine runs this before each step so following steps read fresh values. */
export function bindvariables(scopes: variablescope[], bindings: variablebinding[], outputs: Record<string, stepoutcome>, now: number): { scopes: variablescope[]; produced: string[] } {
  let current = scopes;
  const produced: string[] = [];
  for (const binding of bindings) {
    const outcome = outputs[binding.stepid];
    if (!outcome) continue;
    const raw = outcomedetail(outcome, binding.path);
    if (raw === undefined) throw new Error(`The binding of ${binding.variable} found no value at ${binding.path ?? "the summary"} of step ${binding.stepid}.`);
    current = setvariable(current, binding.variable, binding.kind, coercevariable(raw, binding.kind), now);
    produced.push(binding.variable);
  }
  return { scopes: current, produced };
}

/** Resolves one expression operand: a variable reference resolved from the nearest scope outward or a literal; list values flow through so the list operators handle them while every other operator refuses them at coercion. */
function operandvalue(operand: { ref?: string; literal?: string | number | boolean }, scopes: variablescope[]): string | number | boolean | string[] {
  if (operand.ref !== undefined) {
    const resolved = resolvevariable(scopes, operand.ref);
    if (!resolved) throw new Error(`The expression references the undefined variable ${operand.ref}.`);
    return resolved.value;
  }
  if (operand.literal === undefined) throw new Error("The expression operand needs a variable reference or a literal.");
  return operand.literal;
}

/** Evaluates one reviewed expression between variables: arithmetic, comparison and logic operators with operand coercion and mismatched operator refusals, resolving references from the nearest scope outward; list operands join only the contains and length operators while every other operator refuses them at coercion. */
export function expressioneval(expression: expressiontype, scopes: variablescope[]): string | number | boolean {
  const left = operandvalue(expression.left, scopes);
  const right = expression.right === undefined ? undefined : operandvalue(expression.right, scopes);
  const operand = (value: string | number | boolean | string[] | undefined): string | number | boolean => {
    if (Array.isArray(value)) throw new Error("The expression operand is a list and needs the contains or length operator.");
    if (value === undefined) throw new Error("The expression operand is missing.");
    return value;
  };
  const numbervalue = (value: string | number | boolean | string[] | undefined): number => {
    const primitive = operand(value);
    if (typeof primitive === "number") return primitive;
    if (typeof primitive === "string" && primitive.trim() !== "") {
      const parsed = Number(primitive);
      if (Number.isFinite(parsed)) return parsed;
    }
    throw new Error("The arithmetic operand is not a number.");
  };
  const booleanvalue = (value: string | number | boolean | string[] | undefined): boolean => {
    const primitive = operand(value);
    if (typeof primitive === "boolean") return primitive;
    throw new Error("The logic operand is not a boolean.");
  };
  const stringvalue = (value: string | number | boolean | string[] | undefined): string => {
    const primitive = operand(value);
    if (typeof primitive === "string") return primitive;
    if (typeof primitive === "number" || typeof primitive === "boolean") return String(primitive);
    throw new Error("The text operand is not a string.");
  };
  switch (expression.operator) {
    case "add": return numbervalue(left) + numbervalue(right);
    case "subtract": return numbervalue(left) - numbervalue(right);
    case "multiply": return numbervalue(left) * numbervalue(right);
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
    case "equal": return left === right;
    case "notequal": return left !== right;
    case "less": return numbervalue(left) < numbervalue(right);
    case "greater": return numbervalue(left) > numbervalue(right);
    case "lessequal": return numbervalue(left) <= numbervalue(right);
    case "greaterequal": return numbervalue(left) >= numbervalue(right);
    case "and": return booleanvalue(left) && booleanvalue(right);
    case "or": return booleanvalue(left) || booleanvalue(right);
    case "not": return !booleanvalue(left);
    case "concat": return `${stringvalue(left)}${stringvalue(right)}`;
    case "contains": {
      if (Array.isArray(left)) return left.includes(stringvalue(right));
      return stringvalue(left).includes(stringvalue(right));
    }
    case "length": {
      if (Array.isArray(left)) return left.length;
      return stringvalue(left).length;
    }
    default: throw new Error("The reviewed expression operator is unknown.");
  }
}

/** Applies one reviewed regex rule to text and stores the named capture groups as string variables; the no match case is an honest outcome instead of a crash. */
export function regexextract(rule: regexrule, text: string, now: number): { matched: boolean; variables: variablevalue[] } {
  const pattern = new RegExp(rule.pattern, rule.flags);
  const match = pattern.exec(text);
  if (!match) return { matched: false, variables: [] };
  const variables: variablevalue[] = [];
  for (const group of rule.groups) {
    const value = match.groups?.[group];
    variables.push({ name: group, kind: "string", value: typeof value === "string" ? value : "", setat: now });
  }
  return { matched: true, variables };
}

/** Plans the element wait polling: how many probe passes fit inside the reviewed timeout window at the reviewed poll interval; a zero timeout or a zero poll interval runs a single immediate probe. */
export function waitelementplan(wait: { timeout: number; poll: number }): { probes: number; lastwait: number } {
  if (wait.timeout <= 0 || wait.poll <= 0) return { probes: 1, lastwait: 0 };
  const probes = Math.floor(wait.timeout / wait.poll) + 1;
  return { probes, lastwait: wait.timeout % wait.poll };
}

/** Samples one delay inside the reviewed jitter window from a seeded random source: the window spans base minus half the jitter to base plus half the jitter and never dips below zero. */
export function delayjitter(delay: delaystep, seed: number): number {
  if (delay.jitter <= 0) return Math.max(0, delay.base);
  const sample = seededrandom(seed);
  return Math.max(0, delay.base - delay.jitter / 2 + sample * delay.jitter);
}

/** Deterministic random source of the delay jitter so reviewed windows replay exactly during tests and audits; the seed passes an avalanche mix before the xorshift steps so nearby seeds spread across the whole window. */
export function seededrandom(seed: number): number {
  let state = seed >>> 0;
  state ^= state >>> 16;
  state = Math.imul(state, 0x85ebca6b);
  state ^= state >>> 13;
  state = Math.imul(state, 0xc2b2ae35);
  state ^= state >>> 16;
  state = (state >>> 0) || 1;
  state ^= state << 13; state >>>= 0;
  state ^= state >> 17;
  state ^= state << 5; state >>>= 0;
  return state / 0x100000000;
}

/** Builds one new workflow run: pending state, a zero step cursor and the optional dry run flag. */
export function newworkflowrun(input: { id?: string; workflowid: string; dryrun?: boolean; now: number }): workflowrun {
  return { id: input.id ?? crypto.randomUUID(), workflowid: input.workflowid, state: "pending", cursor: 0, startedat: input.now, ...(input.dryrun === true ? { dryrun: true } : {}) };
}

/** Pauses one running workflow run at its last checkpoint; the cursor keeps the completed steps so a resume continues exactly there. */
export function pauserun(run: workflowrun, now: number): workflowrun {
  if (run.state !== "running") throw new Error("Only a running workflow can pause.");
  return { ...run, state: "paused", pausedat: now };
}

/** Cancels one workflow run and records the reviewed reason; done and already cancelled runs stay untouched. */
export function cancelrun(run: workflowrun, reason: string, now: number): workflowrun {
  if (run.state === "done" || run.state === "cancelled") return run;
  return { ...run, state: "cancelled", cancelreason: reason, endedat: now };
}

/** Substitutes ${name} variable references of one step field from the scopes; undefined references are refused with the variable name. */
function interpolate(text: string, scopes: variablescope[]): { text: string; consumed: string[] } {
  const consumed: string[] = [];
  const resolved = text.replace(/\$\{([a-z][a-z0-9]*)\}/g, (_whole, name: string) => {
    const variable = resolvevariable(scopes, name);
    if (!variable) throw new Error(`The step references the undefined variable ${name}.`);
    consumed.push(name);
    return Array.isArray(variable.value) ? variable.value.join(",") : String(variable.value);
  });
  return { text: resolved, consumed };
}

/** Builds the runlog entry of one finished workflow step. */
function runlogof(step: workflowstep, state: runlogentry["state"], startedat: number, duration: number, summary: string, extra: { block?: string; consumed?: string[]; produced?: string[]; details?: Record<string, unknown>; checkpoint?: boolean }): runlogentry {
  return { stepid: step.id, label: step.label, state, startedat, duration, summary, ...(extra.block !== undefined ? { block: extra.block } : {}), ...(extra.consumed !== undefined && extra.consumed.length > 0 ? { consumed: extra.consumed } : {}), ...(extra.produced !== undefined && extra.produced.length > 0 ? { produced: extra.produced } : {}), ...(extra.checkpoint === true ? { checkpoint: true } : {}), ...(extra.details !== undefined ? { details: extra.details } : {}) };
}

/** Executes exactly one workflow step outside the run loop: resolves the bindings of earlier steps, evaluates the inline expression and regex rule, interpolates the variable references, dispatches through the injected executor and binds the outcome into the newest scope; a control flow executor returns the merged scopes and its iteration runlog so the step adopts them before its own entry. */
export async function runstep(input: { step: workflowstep; scopes: variablescope[]; outputs: Record<string, stepoutcome>; execute: (step: workflowstep, context: { scopes: variablescope[]; block?: string; outputs?: Record<string, stepoutcome> }) => Promise<stepexecution>; now: number; block?: string }): Promise<{ scopes: variablescope[]; log: runlogentry; childlog?: runlogentry[]; output: stepexecution }> {
  const startedat = input.now;
  let scopes = input.scopes;
  const consumed: string[] = [];
  if (input.step.bindings) {
    const bound = bindvariables(scopes, input.step.bindings.filter(binding => input.outputs[binding.stepid] !== undefined), input.outputs, input.now);
    scopes = bound.scopes;
  }
  let produced: string[] = [];
  try {
    if (input.step.expression) {
      const value = expressioneval(input.step.expression, scopes);
      scopes = setvariable(scopes, input.step.expression.result, input.step.expression.resultkind, coercevariable(value, input.step.expression.resultkind), input.now);
      produced = [...produced, input.step.expression.result];
    }
    let stepvalue = input.step.value;
    if (input.step.extract) {
      const text = stepvalue ?? "";
      const interpolated = interpolate(text, scopes);
      consumed.push(...interpolated.consumed);
      const extraction = regexextract(input.step.extract, interpolated.text, input.now);
      if (extraction.matched) {
        for (const variable of extraction.variables) scopes = setvariable(scopes, variable.name, "string", variable.value, input.now);
        produced = [...produced, ...extraction.variables.map(variable => variable.name)];
      }
      stepvalue = interpolated.text;
    }
    // Control flow steps skip interpolation: the control engine owns variable rebinding inside its payload (the item and index variables of every iteration), so it dispatches the reviewed payload unchanged and interpolates the child steps itself once the iteration scopes are bound.
    const controlled = iscontrolflowkind(input.step.kind);
    const target = !controlled && input.step.target !== undefined ? interpolate(input.step.target, scopes) : undefined;
    if (target) consumed.push(...target.consumed);
    const value = !controlled && stepvalue !== undefined ? interpolate(stepvalue, scopes) : undefined;
    if (value) consumed.push(...value.consumed);
    const options = !controlled && input.step.options !== undefined ? interpolate(input.step.options, scopes) : undefined;
    if (options) consumed.push(...options.consumed);
    const dispatchable: workflowstep = { ...input.step, ...(target !== undefined ? { target: target.text } : {}), ...(value !== undefined ? { value: value.text } : {}), ...(options !== undefined ? { options: options.text } : {}) };
    const output = await input.execute(dispatchable, { scopes, outputs: input.outputs, ...(input.block !== undefined ? { block: input.block } : {}) });
    if (output.scopes !== undefined) scopes = output.scopes;
    const childlog = output.log;
    if (input.step.bindings) {
      const bound = bindvariables(scopes, input.step.bindings, { ...input.outputs, [input.step.id]: { stepid: input.step.id, ok: output.ok, summary: output.summary, ...(output.details !== undefined ? { details: output.details } : {}), at: input.now } }, input.now);
      scopes = bound.scopes;
      produced = [...new Set([...produced, ...bound.produced])];
    }
    const duration = Date.now() - startedat;
    return { scopes, log: runlogof(input.step, output.ok ? "done" : "failed", startedat, duration, output.summary, { ...(input.block !== undefined ? { block: input.block } : {}), ...(consumed.length > 0 ? { consumed } : {}), ...(produced.length > 0 ? { produced } : {}), ...(output.details !== undefined ? { details: output.details } : {}), ...(output.ok ? { checkpoint: true } : {}) }), ...(childlog !== undefined ? { childlog } : {}), output };
  } catch (error) {
    const duration = Date.now() - startedat;
    const summary = error instanceof Error ? error.message : String(error);
    return { scopes, log: runlogof(input.step, "failed", startedat, duration, summary, { ...(input.block !== undefined ? { block: input.block } : {}), ...(consumed.length > 0 ? { consumed } : {}) }), output: { ok: false, summary } };
  }
}

/** Advances one workflow run one step at a time: gates the run behind the active session, the approved plan and the origin grants, opens a child scope per block region, checkpoints after every completed step and resumes a paused run from its last checkpoint. */
export async function runworkflow(input: { record: workflowrecord; run: workflowrun; scopes?: variablescope[]; log?: runlogentry[]; outputs?: Record<string, stepoutcome>; execute: (step: workflowstep, context: { scopes: variablescope[]; block?: string; outputs?: Record<string, stepoutcome> }) => Promise<stepexecution>; now: number; gates?: { sessionactive: boolean; planapproved: boolean; origingranted: (origin: string) => boolean }; oncheckpoint?: (state: { run: workflowrun; scopes: variablescope[]; log: runlogentry[] }) => Promise<void> | void }): Promise<{ run: workflowrun; scopes: variablescope[]; log: runlogentry[]; outputs: Record<string, stepoutcome> }> {
  if (input.gates && !input.gates.sessionactive) throw new Error("The workflow refuses to run outside an approved session.");
  if (input.gates && !input.gates.planapproved) throw new Error("The workflow refuses to run without the approved plan review.");
  if (input.gates) for (const origin of input.record.origins) {
    if (!input.gates.origingranted(origin)) throw new Error(`The workflow origin ${origin} falls outside the session grants.`);
  }
  if (input.run.state === "done" || input.run.state === "failed" || input.run.state === "cancelled") throw new Error(`The workflow run is already ${input.run.state}.`);
  const { pausedat, ...resumed } = input.run;
  void pausedat;
  let run: workflowrun = input.run.state === "paused" ? { ...resumed, state: "running" } : { ...input.run, state: "running" };
  let scopes = input.scopes ?? [{ name: "root", variables: [] }];
  const log = [...(input.log ?? [])];
  const outputs: Record<string, stepoutcome> = { ...(input.outputs ?? {}) };
  let activeblock: string | undefined;
  for (let index = run.cursor; index < input.record.steps.length; index += 1) {
    const step = input.record.steps[index] as workflowstep;
    if (step.block !== undefined && step.block !== activeblock) {
      scopes = pushscope(scopes, step.block, (scopes[scopes.length - 1] as variablescope).name);
      activeblock = step.block;
      // The nested parameters of the block invocation bind into the fresh child scope before its first step runs; a default of the wrong kind fails the run honestly with the parameter name.
      if (step.params) {
        try {
          for (const param of step.params) {
            if (param.default === undefined) continue;
            scopes = setvariable(scopes, param.name, param.kind, coercevariable(param.default, param.kind), input.now);
          }
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          return { run: { ...run, state: "failed", endedat: Date.now(), failreason: `The nested parameter of block ${step.block} failed: ${reason}` }, scopes, log, outputs };
        }
      }
    } else if (step.block === undefined && activeblock !== undefined) {
      while (scopes.length > 1) scopes = popscope(scopes);
      activeblock = undefined;
    }
    const executed = await runstep({ step, scopes, outputs, execute: input.execute, now: Date.now(), ...(step.block !== undefined ? { block: step.block } : {}) });
    scopes = executed.scopes;
    if (executed.childlog !== undefined) log.push(...executed.childlog);
    log.push(executed.log);
    outputs[step.id] = { stepid: step.id, ok: executed.output.ok, summary: executed.output.summary, ...(executed.output.details !== undefined ? { details: executed.output.details } : {}), at: Date.now() };
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

/** Evaluates every step of a workflow with no page mutation and no storage write: steps with a read only projection record their would be outcome and every other step is refused in the runlog. */
export function dryrunworkflow(input: { record: workflowrecord; run: workflowrun; scopes?: variablescope[]; log?: runlogentry[]; now: number; projection: (step: workflowstep) => string | undefined }): { run: workflowrun; scopes: variablescope[]; log: runlogentry[] } {
  const run: workflowrun = { ...input.run, state: "running", ...(input.run.dryrun === true ? { dryrun: true } : { dryrun: true }) };
  let scopes = input.scopes ?? [{ name: "root", variables: [] }];
  const log = [...(input.log ?? [])];
  for (let index = run.cursor; index < input.record.steps.length; index += 1) {
    const step = input.record.steps[index] as workflowstep;
    const summary = input.projection(step);
    const entry = summary === undefined
      ? runlogof(step, "refused", input.now, 0, `The ${step.kind} step has no read only projection and the dry run refuses it.`, { ...(step.block !== undefined ? { block: step.block } : {}) })
      : runlogof(step, "done", input.now, 0, summary, { ...(step.block !== undefined ? { block: step.block } : {}) });
    log.push(entry);
    scopes = setvariable(scopes, `${step.id}outcome`, "boolean", entry.state === "done", input.now);
  }
  return { run: { ...run, state: "done", cursor: input.record.steps.length, endedat: input.now }, scopes, log };
}

/** One watchdog verdict of a running workflow run: the verdict, the recovery action the configuration picks and the honest reason. */
export type watchdogverdict = { runid: string; verdict: "stalled" | "zombie" | "healthy"; action: "retry" | "pause" | "cancel" | "reap" | "none"; reason: string; lastcompletedat?: number };

/** Scans the running workflow runs for stalled steps and zombie runs: a run grades stalled when no step completed inside the configured threshold and it grades zombie when its executor is gone — a browser shutdown left it running — and the window elapsed; the recovery action stays the reviewed user configuration of retry, pause or cancel while a zombie always reaps. */
export function watchdogpass(input: { runs: workflowrun[]; lastcompletedat: Record<string, number>; liveexecutors: string[]; config: watchdogconfig; now: number }): watchdogverdict[] {
  const verdicts: watchdogverdict[] = [];
  for (const run of input.runs) {
    if (run.state !== "running") continue;
    const lastcompletedat = input.lastcompletedat[run.id] ?? run.startedat;
    const live = input.liveexecutors.includes(run.id);
    const silence = input.now - lastcompletedat;
    if (!live && input.config.zombiewindow !== undefined && silence >= input.config.zombiewindow) {
      verdicts.push({ runid: run.id, verdict: "zombie", action: "reap", reason: `The run ${run.id} lost its executor ${silence} ms ago and reaps as a zombie of a browser shutdown at its last checkpoint ${run.cursor}.`, ...(lastcompletedat !== run.startedat ? { lastcompletedat } : {}) });
      continue;
    }
    if (!live) continue;
    if (silence >= input.config.stallthreshold) {
      const action = input.config.action;
      verdicts.push({ runid: run.id, verdict: "stalled", action, reason: `The run ${run.id} completed no step for ${silence} ms past the reviewed threshold and the watchdog recovers it with ${action} at cursor ${run.cursor}.`, ...(lastcompletedat !== run.startedat ? { lastcompletedat } : {}) });
      continue;
    }
    verdicts.push({ runid: run.id, verdict: "healthy", action: "none", reason: `The run ${run.id} completed its last step ${silence} ms ago and stays healthy.`, ...(lastcompletedat !== run.startedat ? { lastcompletedat } : {}) });
  }
  return verdicts;
}


/* ── Merged from controlflow.ts ── */

/**
 * Control flow engine for the 1.1.51 workflow family.
 * Every correlated rule of the second workflow phase lives in this file: the control flow kind list, the condition, branch, loop, repeat until, while, foreach, parallel, join, try and retry payload normalizers, the condition evaluation over extracted values, the branch selection by page state, the loop runners that rebind the item and index per iteration inside the reviewed safety bounds, the parallel runner with isolated branch scopes and the join that merges branch outcomes under the reviewed strategy, the try runner with its catch handler and rerun option, the retry runner with fixed and exponential backoff shapes, the step and run timeout aborts with the cancelled error class, and the control summaries the review panel renders.
 * The engine stays pure: child steps dispatch through the injected executor seam, element resolution flows through the injected resolver and page state flows through the injected snapshot accessor, so tests run on plain fixtures and no control construct bypasses the consent gates.
 */

/** The control flow kinds of the 1.1.51 family: conditionals, branching, loops, parallel branches with joins and try catch with retries and timeouts. */
export const controlflowkinds: string[] = ["condition", "branch", "loop", "repeatuntil", "whileloop", "foreach", "parallel", "trycatch"];

/** The documented default safety bound of the loop family when the review configures none; it is a documented default, never a cap, and any user configured bound wins. */
export const defaultloopbound = 1000;

/** The executor seam of the control flow engine: the same seam the run loop uses, extended with the outputs of the earlier steps so child bindings resolve. */
export type controlexecute = (step: workflowstep, context: { scopes: variablescope[]; block?: string; outputs?: Record<string, stepoutcome> }) => Promise<stepexecution>;

/** True when the kind belongs to the control flow family of the 1.1.51 release. */
export function iscontrolflowkind(kind: string): boolean {
  return controlflowkinds.includes(kind);
}

/** The cancelled error class of timeout aborts: a step or a whole run cancelled because it exceeded its reviewed budget. */
export class cancellederror extends Error {
  constructor(message: string) {
    super(message);
    this.name = "cancellederror";
  }
}

/** Normalizes one lowercase control identifier of the grammar: path names, branch ids and variable names. */
function controlname(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-z][a-z0-9]*$/.test(value) ? value : undefined;
}

/** Normalizes one child step list of a control payload; an empty list is refused for bodies while the branch else path may skip explicitly. */
function controlstepslist(value: unknown): workflowstep[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const steps: workflowstep[] = [];
  for (const entry of value) {
    const parsed = workflowstepof(entry);
    if (!parsed) return undefined;
    steps.push(parsed);
  }
  return steps;
}

/** Normalizes one optional positive integer bound of the loop family. */
function controlbound(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

/** Normalizes one condition payload: the reviewed boolean expression tested over the extracted values. */
export function conditionof(value: unknown): conditionstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const expression = expressionof(candidate.expression);
  if (!expression) return undefined;
  if (expression.resultkind !== "boolean") return undefined;
  return { expression };
}

/** Normalizes one else path of a branch payload: the path name, no match condition and the child steps; an empty step list is the explicit skip. */
function elseof(value: unknown): branchpath | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const name = controlname(candidate.name);
  if (!name) return undefined;
  if (candidate.when !== undefined) return undefined;
  if (!Array.isArray(candidate.steps)) return undefined;
  const steps: workflowstep[] = [];
  for (const entry of candidate.steps) {
    const parsed = workflowstepof(entry);
    if (!parsed) return undefined;
    steps.push(parsed);
  }
  return { name, steps };
}

/** Normalizes one branch payload: the unique named paths with their boolean match expressions and the mandatory else path that terminates every branch. */
export function branchof(value: unknown): branchstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.paths) || candidate.paths.length === 0) return undefined;
  const paths: branchpath[] = [];
  for (const entry of candidate.paths) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return undefined;
    const path = entry as Record<string, unknown>;
    const name = controlname(path.name);
    if (!name) return undefined;
    const when = path.when === undefined ? undefined : expressionof(path.when);
    if (path.when !== undefined && when === undefined) return undefined;
    if (when !== undefined && when.resultkind !== "boolean") return undefined;
    const steps = controlstepslist(path.steps);
    if (!steps) return undefined;
    paths.push({ name, ...(when !== undefined ? { when } : {}), steps });
  }
  const names = paths.map(path => path.name);
  if (new Set(names).size !== names.length) return undefined;
  const elsepath = elseof(candidate.else);
  if (!elsepath) return undefined;
  if (names.includes(elsepath.name)) return undefined;
  return { paths, else: elsepath };
}

/** Normalizes one loop payload: the list variable, the item and index variables, the optional safety bound and the non-empty body. */
export function loopof(value: unknown): loopstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const list = controlname(candidate.list);
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!list || !item || !index) return undefined;
  if (item === list || index === list || item === index) return undefined;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== undefined && bound === undefined) return undefined;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return undefined;
  return { list, item, index, ...(bound !== undefined ? { bound } : {}), steps };
}

/** Normalizes one repeat until payload: the convergence expression, the optional safety bound and the non-empty body. */
export function repeatuntilof(value: unknown): repeatuntilstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const until = expressionof(candidate.until);
  if (!until || until.resultkind !== "boolean") return undefined;
  const bound = controlbound(candidate.bound);
  if (candidate.bound !== undefined && bound === undefined) return undefined;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return undefined;
  return { until, ...(bound !== undefined ? { bound } : {}), steps };
}

/** Normalizes one while payload: the loop condition, the mandatory safety bound and the non-empty body; a while loop without a bound is refused. */
export function whileof(value: unknown): whilestep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const condition = expressionof(candidate.while);
  if (!condition || condition.resultkind !== "boolean") return undefined;
  const bound = controlbound(candidate.bound);
  if (bound === undefined) return undefined;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return undefined;
  return { while: condition, bound, steps };
}

/** Normalizes one foreach payload: the non-empty selector, the item and index variables and the non-empty body. */
export function foreachof(value: unknown): foreachstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.selector !== "string" || !candidate.selector.trim()) return undefined;
  const item = controlname(candidate.item);
  const index = controlname(candidate.index);
  if (!item || !index || item === index) return undefined;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return undefined;
  return { selector: candidate.selector, item, index, steps };
}

/** Normalizes one parallel payload: the uniquely identified branches with non-empty bodies and the join policy. */
export function parallelof(value: unknown): parallelstep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.branches) || candidate.branches.length === 0) return undefined;
  const branches: parallelstep["branches"] = [];
  for (const entry of candidate.branches) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return undefined;
    const branch = entry as Record<string, unknown>;
    const id = controlname(branch.id);
    if (!id) return undefined;
    const steps = controlstepslist(branch.steps);
    if (!steps) return undefined;
    branches.push({ id, steps });
  }
  if (new Set(branches.map(branch => branch.id)).size !== branches.length) return undefined;
  const join = candidate.join && typeof candidate.join === "object" && !Array.isArray(candidate.join) ? candidate.join as Record<string, unknown> : undefined;
  if (!join) return undefined;
  if (join.strategy !== "first" && join.strategy !== "last" && join.strategy !== "fail") return undefined;
  if (join.onfail !== "cancel" && join.onfail !== "continue") return undefined;
  return { branches, join: { strategy: join.strategy, onfail: join.onfail } };
}

/** Normalizes one try payload: the fragile body, the error handler with its rerun option, the optional retry policy and the optional timeout policy. */
export function tryof(value: unknown): trystep | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const steps = controlstepslist(candidate.steps);
  if (!steps) return undefined;
  const catchcandidate = candidate.catch && typeof candidate.catch === "object" && !Array.isArray(candidate.catch) ? candidate.catch as Record<string, unknown> : undefined;
  if (!catchcandidate) return undefined;
  const catchsteps = controlstepslist(catchcandidate.steps);
  if (!catchsteps) return undefined;
  if (catchcandidate.rerun !== undefined && typeof catchcandidate.rerun !== "boolean") return undefined;
  const catchvalue: errorhandler = { steps: catchsteps, ...(catchcandidate.rerun === true ? { rerun: true } : {}) };
  let retry: trystep["retry"];
  if (candidate.retry !== undefined) {
    const retrycandidate = candidate.retry && typeof candidate.retry === "object" && !Array.isArray(candidate.retry) ? candidate.retry as Record<string, unknown> : undefined;
    if (!retrycandidate) return undefined;
    if (typeof retrycandidate.attempts !== "number" || !Number.isInteger(retrycandidate.attempts) || retrycandidate.attempts < 1) return undefined;
    const backoff = retrycandidate.backoff && typeof retrycandidate.backoff === "object" && !Array.isArray(retrycandidate.backoff) ? retrycandidate.backoff as Record<string, unknown> : undefined;
    if (!backoff) return undefined;
    if (backoff.shape !== "fixed" && backoff.shape !== "exponential") return undefined;
    if (typeof backoff.base !== "number" || !Number.isFinite(backoff.base) || backoff.base < 0) return undefined;
    if (typeof backoff.jitter !== "number" || !Number.isFinite(backoff.jitter) || backoff.jitter < 0) return undefined;
    if (!Array.isArray(retrycandidate.retryable) || !retrycandidate.retryable.every(entry => typeof entry === "string" && entry.trim())) return undefined;
    retry = { attempts: retrycandidate.attempts, backoff: { shape: backoff.shape, base: backoff.base, jitter: backoff.jitter }, retryable: retrycandidate.retryable as string[] };
  }
  let timeout: trystep["timeout"];
  if (candidate.timeout !== undefined) {
    const timeoutcandidate = candidate.timeout && typeof candidate.timeout === "object" && !Array.isArray(candidate.timeout) ? candidate.timeout as Record<string, unknown> : undefined;
    if (!timeoutcandidate) return undefined;
    const stepms = timeoutcandidate.stepms === undefined ? undefined : typeof timeoutcandidate.stepms === "number" && Number.isFinite(timeoutcandidate.stepms) && timeoutcandidate.stepms > 0 ? timeoutcandidate.stepms : undefined;
    const runms = timeoutcandidate.runms === undefined ? undefined : typeof timeoutcandidate.runms === "number" && Number.isFinite(timeoutcandidate.runms) && timeoutcandidate.runms > 0 ? timeoutcandidate.runms : undefined;
    if (stepms === undefined && runms === undefined) return undefined;
    if (timeoutcandidate.stepms !== undefined && stepms === undefined) return undefined;
    if (timeoutcandidate.runms !== undefined && runms === undefined) return undefined;
    timeout = { ...(stepms !== undefined ? { stepms } : {}), ...(runms !== undefined ? { runms } : {}) };
  }
  return { steps, catch: catchvalue, ...(retry !== undefined ? { retry } : {}), ...(timeout !== undefined ? { timeout } : {}) };
}

/** Parses the reviewed control payload of one step; malformed payloads are refused with the kind name. */
function controloptions(step: workflowstep): Record<string, unknown> {
  if (step.options === undefined) throw new Error(`The ${step.kind} step needs its reviewed control payload in options.`);
  let parsed: unknown;
  try { parsed = JSON.parse(step.options); } catch { throw new Error(`The ${step.kind} control payload must be a JSON object.`); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`The ${step.kind} control payload must be a JSON object.`);
  return parsed as Record<string, unknown>;
}

/** Validates the control payload of one composed step; throws with the kind specific rule when the payload is malformed so composition refuses it before any review. */
export function validatecontrolpayload(step: workflowstep): void {
  if (!iscontrolflowkind(step.kind)) return;
  const payload = controloptions(step);
  if (step.kind === "condition" && conditionof(payload.condition) === undefined) throw new Error("The condition step needs a reviewed boolean expression in its options.");
  if (step.kind === "branch" && branchof(payload.branch) === undefined) throw new Error("The branch step needs reviewed unique paths with boolean match expressions and an else path in its options.");
  if (step.kind === "loop" && loopof(payload.loop) === undefined) throw new Error("The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "repeatuntil" && repeatuntilof(payload.repeatuntil) === undefined) throw new Error("The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options.");
  if (step.kind === "whileloop" && whileof(payload.while) === undefined) throw new Error("The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options.");
  if (step.kind === "foreach" && foreachof(payload.foreach) === undefined) throw new Error("The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options.");
  if (step.kind === "parallel" && parallelof(payload.parallel) === undefined) throw new Error("The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options.");
  if (step.kind === "trycatch" && tryof(payload.try) === undefined) throw new Error("The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options.");
}

/** Returns every child step of one control payload recursively so composition grades the risk of the whole construct and review hides no step; malformed payloads yield no hidden steps because composition refuses them first. */
export function controlsteps(step: workflowstep): workflowstep[] {
  if (!iscontrolflowkind(step.kind)) return [];
  let payload: Record<string, unknown>;
  try { payload = controloptions(step); } catch { return []; }
  const children: workflowstep[] = [];
  const collect = (steps: workflowstep[]): void => {
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
  if (step.kind === "loop") { const loop = loopof(payload.loop); if (loop) collect(loop.steps); return children; }
  if (step.kind === "repeatuntil") { const repeat = repeatuntilof(payload.repeatuntil); if (repeat) collect(repeat.steps); return children; }
  if (step.kind === "whileloop") { const condition = whileof(payload.while); if (condition) collect(condition.steps); return children; }
  if (step.kind === "foreach") { const foreach = foreachof(payload.foreach); if (foreach) collect(foreach.steps); return children; }
  if (step.kind === "parallel") { const parallel = parallelof(payload.parallel); if (parallel) for (const branch of parallel.branches) collect(branch.steps); return children; }
  const fragile = tryof(payload.try);
  if (fragile) { collect(fragile.steps); collect(fragile.catch.steps); }
  return children;
}

/** Builds the review summary of one control step: the path names with the else path, the loop bounds and bodies, the parallel branches with the join policy and the try retry and timeout policies. */
export function controlsummary(step: workflowstep): { kind: string; paths?: string[]; elsepath?: string; list?: string; item?: string; index?: string; bound?: number; selector?: string; branches?: string[]; strategy?: string; onfail?: string; attempts?: number; backoff?: string; rerun?: boolean; stepms?: number; runms?: number; expression?: string } | undefined {
  if (!iscontrolflowkind(step.kind)) return undefined;
  let payload: Record<string, unknown>;
  try { payload = controloptions(step); } catch { return { kind: step.kind }; }
  if (step.kind === "condition") { const condition = conditionof(payload.condition); return { kind: step.kind, ...(condition ? { expression: `${condition.expression.operator} into ${condition.expression.result}` } : {}) }; }
  if (step.kind === "branch") { const branch = branchof(payload.branch); return { kind: step.kind, ...(branch ? { paths: branch.paths.map(path => path.name), elsepath: branch.else.name } : {}) }; }
  if (step.kind === "loop") { const loop = loopof(payload.loop); return { kind: step.kind, ...(loop ? { list: loop.list, item: loop.item, index: loop.index, ...(loop.bound !== undefined ? { bound: loop.bound } : { bound: defaultloopbound }) } : {}) }; }
  if (step.kind === "repeatuntil") { const repeat = repeatuntilof(payload.repeatuntil); return { kind: step.kind, ...(repeat ? { bound: repeat.bound ?? defaultloopbound } : {}) }; }
  if (step.kind === "whileloop") { const condition = whileof(payload.while); return { kind: step.kind, ...(condition ? { bound: condition.bound } : {}) }; }
  if (step.kind === "foreach") { const foreach = foreachof(payload.foreach); return { kind: step.kind, ...(foreach ? { selector: foreach.selector, item: foreach.item, index: foreach.index } : {}) }; }
  if (step.kind === "parallel") { const parallel = parallelof(payload.parallel); return { kind: step.kind, ...(parallel ? { branches: parallel.branches.map(branch => branch.id), strategy: parallel.join.strategy, onfail: parallel.join.onfail } : {}) }; }
  const fragile = tryof(payload.try);
  return { kind: step.kind, ...(fragile ? { ...(fragile.retry !== undefined ? { attempts: fragile.retry.attempts, backoff: `${fragile.retry.backoff.shape} base ${fragile.retry.backoff.base} jitter ${fragile.retry.backoff.jitter}` } : {}), ...(fragile.catch.rerun === true ? { rerun: true } : {}), ...(fragile.timeout?.stepms !== undefined ? { stepms: fragile.timeout.stepms } : {}), ...(fragile.timeout?.runms !== undefined ? { runms: fragile.timeout.runms } : {}) } : {}) };
}

/** Evaluates one condition payload over the extracted values of the scopes; the expression must resolve to a boolean and the step keeps no page side effect. */
export function evaluatecondition(condition: conditionstep, scopes: variablescope[]): boolean {
  const value = expressioneval(condition.expression, scopes);
  if (typeof value !== "boolean") throw new Error("The condition expression must resolve to a boolean.");
  return value;
}

/** Chooses one branch path by page state and extracted values: the first path whose condition holds wins, an unconditional path matches always and the else path terminates every branch when no condition holds. */
export function choosebranch(input: { stepid: string; branch: branchstep; scopes: variablescope[]; pagestate?: { url?: string; title?: string; ready?: boolean }; now: number }): { outcome: branchoutcome; steps: workflowstep[] } {
  let scopes = input.scopes;
  if (input.pagestate !== undefined) {
    const parent = scopes.length > 0 ? (scopes[scopes.length - 1] as variablescope).name : undefined;
    scopes = pushscope(scopes, `pagestate${input.stepid}`, parent);
    if (input.pagestate.url !== undefined) scopes = setvariable(scopes, "pageurl", "string", input.pagestate.url, input.now);
    if (input.pagestate.title !== undefined) scopes = setvariable(scopes, "pagetitle", "string", input.pagestate.title, input.now);
    if (input.pagestate.ready !== undefined) scopes = setvariable(scopes, "pageready", "boolean", input.pagestate.ready, input.now);
  }
  for (const path of input.branch.paths) {
    if (path.when === undefined) return { outcome: { stepid: input.stepid, path: path.name, reason: `The path ${path.name} matches unconditionally.`, at: input.now }, steps: path.steps };
    const value = expressioneval(path.when, scopes);
    if (typeof value !== "boolean") throw new Error(`The branch path ${path.name} needs a boolean expression.`);
    if (value) return { outcome: { stepid: input.stepid, path: path.name, reason: `The condition of the path ${path.name} holds.`, at: input.now }, steps: path.steps };
  }
  return { outcome: { stepid: input.stepid, path: input.branch.else.name, reason: "No path condition held and the else path ran.", at: input.now }, steps: input.branch.else.steps };
}

/** The result shape every control runner returns: the outcome flag, the merged scopes, the runlog entries, the summary and the control flow decision for the audit stores. */
interface controlresult { ok: boolean; scopes: variablescope[]; log: runlogentry[]; summary: string; decision?: controlflowdecision }

/** The context every control runner shares with the dispatcher: the optional iteration path carries the outer index trail of nested loops for the audit counters. */
interface controlcontextbase { step: workflowstep; scopes: variablescope[]; outputs: Record<string, stepoutcome>; execute: controlexecute; now: number; path?: string }

/** Runs the child steps of one control body sequentially through the step machinery: control children dispatch recursively and every child outcome lands in the runlog. */
async function runbody(input: controlcontextbase & { steps: workflowstep[] }): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[]; outputs: Record<string, stepoutcome>; failure?: stepexecution }> {
  let scopes = input.scopes;
  const outputs: Record<string, stepoutcome> = { ...input.outputs };
  const log: runlogentry[] = [];
  for (const child of input.steps) {
    if (iscontrolflowkind(child.kind)) {
      const result = await runcontrolstep({ step: child, scopes, outputs, execute: input.execute, now: input.now, ...(input.path !== undefined ? { path: `${input.path}.${child.id}` } : {}) });
      scopes = result.scopes;
      log.push(...result.log);
      outputs[child.id] = { stepid: child.id, ok: result.output.ok, summary: result.output.summary, ...(result.output.details !== undefined ? { details: result.output.details } : {}), at: input.now };
      if (!result.output.ok) return { ok: false, scopes, log, outputs, failure: result.output };
      continue;
    }
    const executed = await runstep({ step: child, scopes, outputs, execute: input.execute, now: input.now });
    scopes = executed.scopes;
    if (executed.childlog !== undefined) log.push(...executed.childlog);
    log.push(executed.log);
    outputs[child.id] = { stepid: child.id, ok: executed.output.ok, summary: executed.output.summary, ...(executed.output.details !== undefined ? { details: executed.output.details } : {}), at: input.now };
    if (!executed.output.ok) return { ok: false, scopes, log, outputs, failure: executed.output };
  }
  return { ok: true, scopes, log, outputs };
}

/** Deep copies one item value per iteration so no cross iteration mutation reaches the next iteration. */
function deepcopy(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(deepcopy);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, deepcopy(entry)]));
  return value;
}

/** Builds one iteration marker entry of a loop family runner so the runlog carries the iteration trail. */
function iterationentry(step: workflowstep, iteration: number, total: number, ok: boolean, now: number): runlogentry {
  return { stepid: step.id, label: `${step.label} iteration ${iteration + 1}`, state: ok ? "done" : "failed", startedat: now, duration: 0, summary: `Iteration ${iteration + 1} of ${total}.`, details: { iteration, total } };
}

/** Runs one loop over a data list variable: each iteration deep copies the item, rebinds the item and index variables, runs the body and records the loop counter with its iteration path for the audit stores. */
export async function runloop(input: controlcontextbase & { loop: loopstep }): Promise<controlresult> {
  const list = resolvevariable(input.scopes, input.loop.list);
  if (!list) throw new Error(`The loop references the undefined list variable ${input.loop.list}.`);
  if (list.kind !== "list") throw new Error(`The loop variable ${input.loop.list} is not a list.`);
  const items = list.value as string[];
  const bound = input.loop.bound ?? defaultloopbound;
  const loops: loopcounter[] = [];
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "loop", at: input.now, loops };
  if (items.length > bound) {
    return { ok: false, scopes: input.scopes, log: [], summary: `The loop list holds ${items.length} items and exceeds the reviewed safety bound of ${bound} iterations; nothing ran.`, decision };
  }
  let scopes = input.scopes;
  const log: runlogentry[] = [];
  for (let index = 0; index < items.length; index += 1) {
    scopes = setvariable(scopes, input.loop.item, "string", deepcopy(items[index]) as string, input.now);
    scopes = setvariable(scopes, input.loop.index, "number", index, input.now);
    const body = await runbody({ step: input.step, scopes, outputs: input.outputs, execute: input.execute, now: input.now, steps: input.loop.steps, path: `${input.path ?? input.step.id}[${index}]` });
    scopes = body.scopes;
    const ok = body.ok;
    loops.push({ stepid: input.step.id, path: `${input.path ?? input.step.id}[${index}]`, iteration: index, ok, at: input.now });
    log.push(...body.log, iterationentry(input.step, index, items.length, ok, input.now));
    if (!ok) return { ok: false, scopes, log, summary: `The loop failed at iteration ${index + 1} of ${items.length}: ${body.failure?.summary ?? "the body step failed."}`, decision };
  }
  return { ok: true, scopes, log, summary: `The loop ran ${items.length} iteration${items.length === 1 ? "" : "s"} over ${input.loop.list} inside the reviewed safety bound of ${bound}.`, decision };
}

/** Runs one repeat until block: the body reruns until the convergence expression holds, the safety bound refuses a block that never converges and every pass records its loop counter. */
export async function runrepeatuntil(input: controlcontextbase & { repeat: repeatuntilstep }): Promise<controlresult> {
  const bound = input.repeat.bound ?? defaultloopbound;
  let scopes = input.scopes;
  const log: runlogentry[] = [];
  const loops: loopcounter[] = [];
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "loop", at: input.now, loops };
  for (let iteration = 0; iteration < bound; iteration += 1) {
    const body = await runbody({ step: input.step, scopes, outputs: input.outputs, execute: input.execute, now: input.now, steps: input.repeat.steps, path: `${input.path ?? input.step.id}[${iteration}]` });
    scopes = body.scopes;
    log.push(...body.log);
    const converged = evaluatecondition({ expression: input.repeat.until }, scopes);
    loops.push({ stepid: input.step.id, path: `${input.path ?? input.step.id}[${iteration}]`, iteration, ok: body.ok, at: input.now });
    if (!body.ok) return { ok: false, scopes, log, summary: `The repeat until failed at iteration ${iteration + 1}: ${body.failure?.summary ?? "the body step failed."}`, decision };
    log.push(iterationentry(input.step, iteration, bound, true, input.now));
    if (converged) return { ok: true, scopes, log, summary: `The repeat until converged after ${iteration + 1} iteration${iteration === 0 ? "" : "s"} inside the reviewed safety bound of ${bound}.`, decision };
  }
  return { ok: false, scopes, log, summary: `The repeat until never converged within the reviewed safety bound of ${bound} iterations.`, decision };
}

/** Runs one while block: the condition gates every pass, the mandatory safety bound refuses an endless loop and the overflow is reported with the loop counters. */
export async function runwhile(input: controlcontextbase & { condition: whilestep }): Promise<controlresult> {
  let scopes = input.scopes;
  const log: runlogentry[] = [];
  const loops: loopcounter[] = [];
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "loop", at: input.now, loops };
  for (let iteration = 0; iteration < input.condition.bound; iteration += 1) {
    if (!evaluatecondition({ expression: input.condition.while }, scopes)) {
      return { ok: true, scopes, log, summary: `The while loop ended after ${iteration} iteration${iteration === 1 ? "" : "s"} because its condition stopped holding inside the reviewed safety bound of ${input.condition.bound}.`, decision };
    }
    const body = await runbody({ step: input.step, scopes, outputs: input.outputs, execute: input.execute, now: input.now, steps: input.condition.steps, path: `${input.path ?? input.step.id}[${iteration}]` });
    scopes = body.scopes;
    log.push(...body.log);
    loops.push({ stepid: input.step.id, path: `${input.path ?? input.step.id}[${iteration}]`, iteration, ok: body.ok, at: input.now });
    if (!body.ok) return { ok: false, scopes, log, summary: `The while loop failed at iteration ${iteration + 1}: ${body.failure?.summary ?? "the body step failed."}`, decision };
    log.push(iterationentry(input.step, iteration, input.condition.bound, true, input.now));
  }
  if (evaluatecondition({ expression: input.condition.while }, scopes)) {
    return { ok: false, scopes, log, summary: `The while loop hit its reviewed safety bound of ${input.condition.bound} iterations while its condition still held; the overflow is reported instead of looping forever.`, decision };
  }
  return { ok: true, scopes, log, summary: `The while loop ended after ${input.condition.bound} iteration${input.condition.bound === 1 ? "" : "s"} inside the reviewed safety bound.`, decision };
}

/** Runs one foreach block: the injected resolver turns the selector into element references, every reference binds as the element item with its index and the empty match is an honest zero iteration outcome. */
export async function runforeach(input: controlcontextbase & { foreach: foreachstep; resolveelements?: (selector: string) => Promise<string[]> }): Promise<controlresult> {
  if (!input.resolveelements) throw new Error("The foreach step needs the element resolver of the executor seam.");
  const elements = await input.resolveelements(input.foreach.selector);
  const loops: loopcounter[] = [];
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "loop", at: input.now, loops };
  if (elements.length === 0) return { ok: true, scopes: input.scopes, log: [], summary: `The selector ${input.foreach.selector} matched no element and the foreach ran zero iterations.`, decision };
  let scopes = input.scopes;
  const log: runlogentry[] = [];
  for (let index = 0; index < elements.length; index += 1) {
    scopes = setvariable(scopes, input.foreach.item, "element", deepcopy(elements[index]) as string, input.now);
    scopes = setvariable(scopes, input.foreach.index, "number", index, input.now);
    const body = await runbody({ step: input.step, scopes, outputs: input.outputs, execute: input.execute, now: input.now, steps: input.foreach.steps, path: `${input.path ?? input.step.id}[${index}]` });
    scopes = body.scopes;
    const ok = body.ok;
    loops.push({ stepid: input.step.id, path: `${input.path ?? input.step.id}[${index}]`, iteration: index, ok, at: input.now });
    log.push(...body.log, iterationentry(input.step, index, elements.length, ok, input.now));
    if (!ok) return { ok: false, scopes, log, summary: `The foreach failed at iteration ${index + 1} of ${elements.length}: ${body.failure?.summary ?? "the body step failed."}`, decision };
  }
  return { ok: true, scopes, log, summary: `The foreach ran ${elements.length} iteration${elements.length === 1 ? "" : "s"} over the elements of ${input.foreach.selector}.`, decision };
}

/** Merges the variable writes of the parallel branches under the reviewed join strategy: first or last wins by branch order and fail refuses any conflicting write; cancelled branches never contribute. */
export function joinbranches(input: { stepid: string; branches: Array<{ id: string; order: number; ok: boolean; cancelled: boolean; variables: variablevalue[] }>; strategy: "first" | "last" | "fail"; now: number }): { ok: boolean; conflicts: string[]; merged: variablevalue[]; record: joinrecord; summary: string } {
  const contributing = input.branches.filter(branch => !branch.cancelled);
  const byname = new Map<string, Array<{ order: number; value: variablevalue }>>();
  for (const branch of contributing) for (const variable of branch.variables) {
    const entries = byname.get(variable.name) ?? [];
    entries.push({ order: branch.order, value: variable });
    byname.set(variable.name, entries);
  }
  const conflicts = [...byname.entries()].filter(([, entries]) => entries.length > 1).map(([name]) => name);
  const record: joinrecord = { stepid: input.stepid, strategy: input.strategy, conflicts, merged: [], at: input.now };
  if (conflicts.length > 0 && input.strategy === "fail") {
    return { ok: false, conflicts, merged: [], record, summary: `The join refused the conflicting writes of ${conflicts.join(", ")} under the fail strategy.` };
  }
  const merged: variablevalue[] = [];
  for (const [name, entries] of byname) {
    void name;
    const winner = input.strategy === "first" ? entries.reduce((left, right) => left.order <= right.order ? left : right) : entries.reduce((left, right) => left.order >= right.order ? left : right);
    merged.push({ ...winner.value, setat: input.now });
  }
  record.merged = merged.map(variable => variable.name);
  return { ok: true, conflicts, merged, record, summary: `The join merged ${merged.length} variable${merged.length === 1 ? "" : "s"} under the ${input.strategy} strategy${conflicts.length > 0 ? ` with the conflicts ${conflicts.join(", ")} resolved by the strategy` : " with no conflict"}.` };
}

/** Runs one parallel block: every branch launches concurrently inside its own isolated scope, the join policy decides whether sibling branches cancel or continue on branch failure and the join merges the branch writes under the reviewed strategy. */
export async function runparallel(input: controlcontextbase & { parallel: parallelstep }): Promise<controlresult> {
  let finished = 0;
  let firstfailure = Number.POSITIVE_INFINITY;
  const log: runlogentry[] = [];
  const launches = input.parallel.branches.map((branch, order) => (async () => {
    const parent = input.scopes.length > 0 ? (input.scopes[input.scopes.length - 1] as variablescope).name : undefined;
    const isolated = pushscope(input.scopes, `branch${branch.id}`, parent);
    const body = await runbody({ step: input.step, scopes: isolated, outputs: input.outputs, execute: input.execute, now: input.now, steps: branch.steps });
    const finishedat = finished;
    finished += 1;
    if (!body.ok && finishedat < firstfailure) firstfailure = finishedat;
    const scope = body.scopes[body.scopes.length - 1] as variablescope;
    return { branch, order, finishedat, ok: body.ok, scopes: body.scopes, variables: scope.name === `branch${branch.id}` ? scope.variables : [], log: body.log, failure: body.failure };
  })());
  const settled = await Promise.all(launches);
  for (const entry of settled) log.push(...entry.log);
  const cancelmode = input.parallel.join.onfail === "cancel";
  const outcomes: paralleloutcome[] = settled.map(entry => ({ branchid: entry.branch.id, ok: entry.ok, summary: entry.ok ? `The branch ${entry.branch.id} completed.` : entry.failure?.summary ?? `The branch ${entry.branch.id} failed.`, ...(cancelmode && firstfailure !== Number.POSITIVE_INFINITY && entry.finishedat > firstfailure ? { cancelled: true } : {}) }));
  const join = joinbranches({ stepid: input.step.id, branches: settled.map((entry, order) => ({ id: entry.branch.id, order, ok: entry.ok, cancelled: outcomes[order]?.cancelled === true, variables: entry.variables })), strategy: input.parallel.join.strategy, now: input.now });
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "join", at: input.now, join: join.record, branches: outcomes };
  if (!join.ok) return { ok: false, scopes: input.scopes, log, summary: join.summary, decision };
  let scopes = input.scopes;
  for (const variable of join.merged) scopes = setvariable(scopes, variable.name, variable.kind, variable.value, input.now);
  const failedbranches = settled.filter((entry, order) => !entry.ok && outcomes[order]?.cancelled !== true).map(entry => entry.branch.id);
  if (cancelmode && failedbranches.length > 0) {
    return { ok: false, scopes, log, summary: `The parallel block failed on branch ${failedbranches.join(", ")} and the join policy cancelled the siblings still running; ${join.summary}`, decision };
  }
  return { ok: true, scopes, log, summary: `The parallel block ran ${input.parallel.branches.length} concurrent branch${input.parallel.branches.length === 1 ? "" : "es"}; ${join.summary}`, decision };
}

/** Returns the error class of one failed outcome: the reviewed errorclass detail when present and the honest stepfailed class otherwise. */
function errorclassof(output: { details?: Record<string, unknown> }): string {
  const errorclass = output.details?.errorclass;
  return typeof errorclass === "string" && errorclass.trim() ? errorclass : "stepfailed";
}

/** Computes one retry backoff delay under the reviewed shape: fixed keeps the base and exponential doubles it per failed attempt, and the seeded jitter window spans half the jitter around it. */
export function backoffdelay(policy: retrypolicy, attempt: number, seed: number): number {
  const base = policy.backoff.shape === "exponential" ? policy.backoff.base * 2 ** (attempt - 1) : policy.backoff.base;
  if (policy.backoff.jitter <= 0) return Math.max(0, base);
  return Math.max(0, base - policy.backoff.jitter / 2 + seededrandom(seed + attempt) * policy.backoff.jitter);
}

/** Waits the reviewed backoff delay between retry attempts. */
function waitsome(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, milliseconds)));
}

/** Retries one failed step under the reviewed retry policy: the attempts stay user configured with no code ceiling, the backoff shape is fixed or exponential with seeded jitter and only the reviewed error classes retry; the attempts and their backoff durations are recorded for the audit stores. */
export async function applyretry<T extends { ok: boolean }>(input: { stepid: string; policy: retrypolicy; run: () => Promise<T>; errorclass: (value: T) => string; now: number; seed?: number }): Promise<{ value: T; attempts: retryattempt[]; exhausted: boolean }> {
  const seed = input.seed ?? 0;
  let value = await input.run();
  const attempts: retryattempt[] = [];
  let attempt = 1;
  while (!value.ok && attempt < input.policy.attempts) {
    const errorclass = input.errorclass(value);
    if (!input.policy.retryable.includes(errorclass)) break;
    const delay = backoffdelay(input.policy, attempt, seed);
    attempts.push({ stepid: input.stepid, attempt: attempt + 1, delay, errorclass, at: input.now });
    if (delay > 0) await waitsome(delay);
    attempt += 1;
    value = await input.run();
  }
  return { value, attempts, exhausted: !value.ok && attempts.length > 0 && attempt >= input.policy.attempts };
}

/** Races one step against its reviewed millisecond budget: an exceeded budget cancels the wait through the executor seam and returns the cancelled outcome with the timeout error class and the exceeded budget. */
export async function applytimeout<T extends { ok: boolean }>(input: { stepid: string; budgetms: number; run: () => Promise<T> }): Promise<{ aborted: boolean; value?: T; output?: stepexecution; abort?: timeoutabort }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<"cancelled">(resolve => { timer = setTimeout(() => resolve("cancelled"), Math.max(0, input.budgetms)); });
  const raced = await Promise.race([input.run().then(value => ({ kind: "done" as const, value })), guard.then(marker => ({ kind: "cancelled" as const, marker }))]);
  if (timer !== undefined) clearTimeout(timer);
  if (raced.kind === "done") return { aborted: false, value: raced.value };
  return { aborted: true, output: { ok: false, summary: `The ${input.stepid} step exceeded its reviewed budget of ${input.budgetms} milliseconds and was cancelled.`, details: { errorclass: "timeout", budget: input.budgetms, cancelled: true } }, abort: { stepid: input.stepid, budget: input.budgetms, scope: "step", at: Date.now() } };
}

/** Races a whole run against its reviewed millisecond budget: an exceeded budget aborts the run with the cancelled error class carrying the exceeded budget. */
export async function applyruntimeout<T>(input: { budgetms: number; run: () => Promise<T> }): Promise<{ cancelled: true; error: cancellederror } | { cancelled: false; value: T }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<"cancelled">(resolve => { timer = setTimeout(() => resolve("cancelled"), Math.max(0, input.budgetms)); });
  const raced = await Promise.race([input.run().then(value => ({ kind: "done" as const, value })), guard.then(marker => ({ kind: "cancelled" as const, marker }))]);
  if (timer !== undefined) clearTimeout(timer);
  if (raced.kind === "done") return { cancelled: false, value: raced.value };
  return { cancelled: true, error: new cancellederror(`The run exceeded its reviewed budget of ${input.budgetms} milliseconds and was cancelled.`) };
}

/** Executes the error handler steps of a try block on failure; the handler steps run through the same step machinery and their outcome decides the handler result. */
export async function runcatch(input: { handler: errorhandler; scopes: variablescope[]; outputs: Record<string, stepoutcome>; execute: controlexecute; now: number }): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[] }> {
  const body = await runbody({ step: { id: "catch", kind: "trycatch", label: "catch handler" }, scopes: input.scopes, outputs: input.outputs, execute: input.execute, now: input.now, steps: input.handler.steps });
  return { ok: body.ok, scopes: body.scopes, log: body.log };
}

/** Runs one try block: the fragile body steps run under the reviewed retry policy and the per step timeout budgets, a failure runs the error handler and the rerun option executes the body once more after the handler. */
export async function runtry(input: controlcontextbase & { fragile: trystep }): Promise<controlresult> {
  const timeouts: timeoutabort[] = [];
  const retries: retryattempt[] = [];
  const runonce = async (child: workflowstep, scopes: variablescope[]): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[]; output: stepexecution }> => {
    if (iscontrolflowkind(child.kind)) {
      const result = await runcontrolstep({ step: child, scopes, outputs: input.outputs, execute: input.execute, now: input.now });
      return { ok: result.output.ok, scopes: result.scopes, log: result.log, output: result.output };
    }
    const executed = await runstep({ step: child, scopes, outputs: input.outputs, execute: input.execute, now: input.now });
    return { ok: executed.output.ok, scopes: executed.scopes, log: [...(executed.childlog ?? []), executed.log], output: executed.output };
  };
  const runchild = async (child: workflowstep, scopes: variablescope[]): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[]; output: stepexecution }> => {
    const attempt = async (): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[]; output: stepexecution }> => {
      if (input.fragile.retry === undefined) return await runonce(child, scopes);
      const retried = await applyretry({ stepid: child.id, policy: input.fragile.retry, run: () => runonce(child, scopes), errorclass: value => errorclassof(value.output), now: input.now, seed: seedof(child.id) });
      retries.push(...retried.attempts);
      return retried.value;
    };
    if (input.fragile.timeout?.stepms === undefined) return await attempt();
    const guarded = await applytimeout({ stepid: child.id, budgetms: input.fragile.timeout.stepms, run: attempt });
    if (!guarded.aborted) return guarded.value as { ok: boolean; scopes: variablescope[]; log: runlogentry[]; output: stepexecution };
    if (guarded.abort) timeouts.push(guarded.abort);
    return { ok: false, scopes, log: [], output: guarded.output as stepexecution };
  };
  const runbodyof = async (scopes: variablescope[]): Promise<{ ok: boolean; scopes: variablescope[]; log: runlogentry[]; failure?: stepexecution }> => {
    let current = scopes;
    const log: runlogentry[] = [];
    for (const child of input.fragile.steps) {
      const executed = await runchild(child, current);
      current = executed.scopes;
      log.push(...executed.log);
      if (!executed.ok) return { ok: false, scopes: current, log, failure: executed.output };
    }
    return { ok: true, scopes: current, log };
  };
  let body: { ok: boolean; scopes: variablescope[]; log: runlogentry[]; failure?: stepexecution };
  if (input.fragile.timeout?.runms !== undefined) {
    const guarded = await applytimeout({ stepid: input.step.id, budgetms: input.fragile.timeout.runms, run: () => runbodyof(input.scopes) });
    if (guarded.aborted) {
      if (guarded.abort) timeouts.push({ ...guarded.abort, scope: "run" });
      body = { ok: false, scopes: input.scopes, log: [], failure: guarded.output ?? { ok: false, summary: "The try block exceeded its reviewed run budget and was cancelled.", details: { errorclass: "timeout", cancelled: true } } };
    } else {
      body = guarded.value as { ok: boolean; scopes: variablescope[]; log: runlogentry[]; failure?: stepexecution };
    }
  } else {
    body = await runbodyof(input.scopes);
  }
  if (body.ok) {
    const summary = `The try block completed its ${input.fragile.steps.length} step${input.fragile.steps.length === 1 ? "" : "s"}${retries.length > 0 ? ` after ${retries.length} retry attempt${retries.length === 1 ? "" : "s"}` : ""}.`;
    if (retries.length === 0 && timeouts.length === 0) return { ok: true, scopes: body.scopes, log: body.log, summary };
    return { ok: true, scopes: body.scopes, log: body.log, summary, decision: { runid: "", stepid: input.step.id, kind: "retry", at: input.now, ...(retries.length > 0 ? { retries } : {}), ...(timeouts.length > 0 ? { timeouts } : {}) } };
  }
  const handler = await runcatch({ handler: input.fragile.catch, scopes: body.scopes, outputs: input.outputs, execute: input.execute, now: input.now });
  const errorclass = errorclassof(body.failure ?? { ok: false, summary: "" });
  const decision: controlflowdecision = { runid: "", stepid: input.step.id, kind: "catch", at: input.now, ...(retries.length > 0 ? { retries } : {}), ...(timeouts.length > 0 ? { timeouts } : {}), catch: { errorclass, message: body.failure?.summary ?? "The fragile body step failed.", rerun: input.fragile.catch.rerun === true } };
  if (!handler.ok) return { ok: false, scopes: handler.scopes, log: [...body.log, ...handler.log], summary: `The catch handler of the try block failed after the ${errorclass} failure.`, decision };
  if (input.fragile.catch.rerun === true) {
    const rerun = await runbodyof(handler.scopes);
    if (rerun.ok) return { ok: true, scopes: rerun.scopes, log: [...body.log, ...handler.log, ...rerun.log], summary: `The catch handler ran after the ${errorclass} failure and the rerun of the try body succeeded.`, decision };
    return { ok: false, scopes: rerun.scopes, log: [...body.log, ...handler.log, ...rerun.log], summary: `The catch handler ran and the rerun of the try body failed again with ${errorclassof(rerun.failure ?? { ok: false, summary: "" })}.`, decision };
  }
  return { ok: true, scopes: handler.scopes, log: [...body.log, ...handler.log], summary: `The catch handler ran ${input.fragile.catch.steps.length} step${input.fragile.catch.steps.length === 1 ? "" : "s"} after the ${errorclass} failure.`, decision };
}

/** Deterministic seed of one step id so retry backoff windows replay exactly for audits. */
function seedof(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Executes exactly one control flow step: parses the reviewed payload, dispatches to the matching runner, returns the merged scopes, the iteration runlog and the outcome whose details carry the control flow decision for the audit stores. */
export async function runcontrolstep(input: controlcontextbase & { runid?: string; pagestate?: { url?: string; title?: string; ready?: boolean }; resolveelements?: (selector: string) => Promise<string[]> }): Promise<{ scopes: variablescope[]; log: runlogentry[]; output: stepexecution }> {
  const payload = controloptions(input.step);
  const base = { step: input.step, scopes: input.scopes, outputs: input.outputs, execute: input.execute, now: input.now, ...(input.path !== undefined ? { path: input.path } : {}) };
  let result: controlresult;
  switch (input.step.kind) {
    case "condition": {
      const condition = conditionof(payload.condition);
      if (!condition) throw new Error("The condition step needs a reviewed boolean expression in its options.");
      const value = evaluatecondition(condition, input.scopes);
      const scopes = setvariable(input.scopes, condition.expression.result, condition.expression.resultkind, value, input.now);
      const summary = `The condition ${condition.expression.result} ${value ? "holds" : "does not hold"} over the extracted values.`;
      return { scopes, log: [], output: { ok: true, summary, details: { condition: { result: condition.expression.result, value } } } };
    }
    case "branch": {
      const branch = branchof(payload.branch);
      if (!branch) throw new Error("The branch step needs reviewed unique paths with boolean match expressions and an else path in its options.");
      const chosen = choosebranch({ stepid: input.step.id, branch, scopes: input.scopes, ...(input.pagestate !== undefined ? { pagestate: input.pagestate } : {}), now: input.now });
      const body = await runbody({ ...base, steps: chosen.steps });
      result = body.ok
        ? { ok: true, scopes: body.scopes, log: body.log, summary: `The branch chose the path ${chosen.outcome.path}: ${chosen.outcome.reason}`, decision: { runid: input.runid ?? "", stepid: input.step.id, kind: "branch", at: input.now, branch: chosen.outcome } }
        : { ok: false, scopes: body.scopes, log: body.log, summary: `The branch chose the path ${chosen.outcome.path} and its body failed: ${body.failure?.summary ?? "the body step failed."}`, decision: { runid: input.runid ?? "", stepid: input.step.id, kind: "branch", at: input.now, branch: chosen.outcome } };
      break;
    }
    case "loop": {
      const loop = loopof(payload.loop);
      if (!loop) throw new Error("The loop step needs a reviewed list variable, distinct item and index variables, an optional positive safety bound and a non-empty body in its options.");
      result = await runloop({ ...base, loop });
      break;
    }
    case "repeatuntil": {
      const repeat = repeatuntilof(payload.repeatuntil);
      if (!repeat) throw new Error("The repeat until step needs a reviewed convergence expression, an optional positive safety bound and a non-empty body in its options.");
      result = await runrepeatuntil({ ...base, repeat });
      break;
    }
    case "whileloop": {
      const condition = whileof(payload.while);
      if (!condition) throw new Error("The while step needs a reviewed condition, a mandatory positive safety bound and a non-empty body in its options.");
      result = await runwhile({ ...base, condition });
      break;
    }
    case "foreach": {
      const foreach = foreachof(payload.foreach);
      if (!foreach) throw new Error("The foreach step needs a reviewed non-empty selector, distinct item and index variables and a non-empty body in its options.");
      result = await runforeach({ ...base, foreach, ...(input.resolveelements !== undefined ? { resolveelements: input.resolveelements } : {}) });
      break;
    }
    case "parallel": {
      const parallel = parallelof(payload.parallel);
      if (!parallel) throw new Error("The parallel step needs uniquely identified branches with bodies and a join policy of the first, last or fail strategy with cancel or continue on branch failure in its options.");
      result = await runparallel({ ...base, parallel });
      break;
    }
    case "trycatch": {
      const fragile = tryof(payload.try);
      if (!fragile) throw new Error("The try step needs a fragile body, a catch handler and optional retry and timeout policies in its options.");
      result = await runtry({ ...base, fragile });
      break;
    }
    default: throw new Error(`The ${input.step.kind} step is not a control flow kind.`);
  }
  if (result.decision !== undefined && input.runid !== undefined) result.decision.runid = input.runid;
  return { scopes: result.scopes, log: result.log, output: { ok: result.ok, summary: result.summary, ...(result.decision !== undefined ? { details: { control: result.decision } } : {}) } };
}

/** Wraps one executor seam so control flow kinds dispatch to the control engine while every other kind keeps its executor: the wrapper carries the isolated run id, the page state accessor and the element resolver of the background executors, and the control outcome returns the merged scopes with its iteration runlog so the run loop adopts them. */
export function controlexecutor(execute: controlexecute, extras: { runid?: string; pagestate?: { url?: string; title?: string; ready?: boolean }; resolveelements?: (selector: string) => Promise<string[]> } = {}): controlexecute {
  return async (step, context) => {
    if (!iscontrolflowkind(step.kind)) return execute(step, context);
    const result = await runcontrolstep({ step, scopes: context.scopes, outputs: context.outputs ?? {}, execute, now: Date.now(), ...(extras.runid !== undefined ? { runid: extras.runid } : {}), ...(extras.pagestate !== undefined ? { pagestate: extras.pagestate } : {}), ...(extras.resolveelements !== undefined ? { resolveelements: extras.resolveelements } : {}) });
    return { ...result.output, scopes: result.scopes, log: result.log };
  };
}


/* ── Merged from trigger.ts ── */

/**
 * Trigger and scheduling engine for the 1.1.52 family.
 * Every correlated rule of the trigger phase lives in this file: the trigger family and kind lists, the family payload normalizers, the five field cron parser with named weekdays and months and its timezone aware next fire computation, the interval scheduler that spreads repeated fires with the configured seeded jitter, the glob url matcher with ports, the visit origin matcher, the cooldown suppressor, the dedupe and queue discipline that keeps one pending fire per rule while a run is active, the url list planner that starts one run per url, the webhook verifier of the shared secret and payload schema, the observed event catalog matcher, the pause and resume suspension with the resume drain, the trigger evaluation that skips disabled, paused, unreviewed or cooled down rules, the manual run step preview with its confirmation outcome and the rule summaries the review panel renders.
 * The engine stays pure: the launch of a run flows through the injected launch seam so tests run on plain fixtures, and no trigger fires outside the consent gates — every rule is reviewed before it arms and every launch re-passes the session, plan and origin gates.
 */

/** The trigger kinds of the 1.1.52 family: one kind per trigger rule family, each arming its rule behind the explicit arm review. */
export const triggerkinds: string[] = ["visitrule", "urlrule", "menurule", "keyrule", "buttonrule", "cronrule", "intervalrule", "urllistrule", "webhookrule", "eventrule"];

/** The trigger rule families the engine matches, schedules and observes. */
export const triggerfamilies: triggerfamily[] = ["visit", "url", "menu", "key", "button", "cron", "interval", "urllist", "webhook", "event"];

/** The observed page event catalog event rules subscribe to: the mutation, focus, banner, console, error and navigation observations the extension already watches. */
export const triggereventcatalog: string[] = ["mutate", "focus", "banner", "console", "error", "navigate"];

/** The documented default cooldown window of the webhook and event families when the review configures none; it is a documented default, never a cap, and any user configured window wins. */
export const defaulttriggercooldown = 10_000;

/** True when the kind belongs to the trigger family of the 1.1.52 release. */
export function istriggerkind(kind: string): boolean {
  return triggerkinds.includes(kind);
}

/** Maps one trigger action kind to its rule family. */
export function triggerfamilyof(kind: string): triggerfamily | undefined {
  const index = triggerkinds.indexOf(kind);
  return index >= 0 ? triggerfamilies[index] : undefined;
}

/** Normalizes one trigger label: a non-empty human readable string. */
function triggerlabel(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Normalizes one positive number of milliseconds; zero is refused so a configured window always means a window. */
function positivewindow(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Normalizes one optional zero or positive jitter window. */
function jitterwindow(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Normalizes one HTTPS origin string; the origin form replaces whatever url shape the review typed. */
function httpsorigin(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return undefined;
    return parsed.origin;
  } catch { return undefined; }
}

/** Normalizes one webhook payload schema field: the name, the primitive kind and the required flag. */
function webhookfieldof(value: unknown): webhookfield | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !/^[a-z][a-z0-9]*$/i.test(candidate.name)) return undefined;
  if (candidate.kind !== "string" && candidate.kind !== "number" && candidate.kind !== "boolean") return undefined;
  if (candidate.required !== undefined && typeof candidate.required !== "boolean") return undefined;
  return { name: candidate.name, kind: candidate.kind, ...(candidate.required === true ? { required: true } : {}) };
}

/** Normalizes one family payload of a trigger rule and returns the family specific fields; the shared workflowid, cooldown and review flag stay with the caller. */
export function triggerpayloadof(family: triggerfamily, value: unknown): Partial<triggerule> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (family === "visit") {
    if (!Array.isArray(candidate.origins) || candidate.origins.length === 0) return undefined;
    const origins = candidate.origins.map(origin => httpsorigin(origin));
    if (origins.some(origin => origin === undefined)) return undefined;
    return { origins: [...new Set(origins as string[])] };
  }
  if (family === "url") {
    if (typeof candidate.pattern !== "string" || !candidate.pattern.trim()) return undefined;
    if (httpsorigin(candidate.pattern) === undefined) return undefined;
    return { pattern: candidate.pattern.trim() };
  }
  if (family === "menu") {
    const title = triggerlabel(candidate.title);
    if (!title) return undefined;
    return { title };
  }
  if (family === "key") {
    if (typeof candidate.command !== "string" || !/^[a-z][a-z0-9-]*$/.test(candidate.command)) return undefined;
    if (candidate.key !== undefined && (typeof candidate.key !== "string" || !candidate.key.trim())) return undefined;
    return { command: candidate.command, ...(candidate.key !== undefined ? { key: candidate.key } : {}) };
  }
  if (family === "button") return {};
  if (family === "cron") {
    if (typeof candidate.cron !== "string" || !candidate.cron.trim()) return undefined;
    if (cronparse(candidate.cron) === undefined) return undefined;
    if (candidate.timezone !== undefined && (typeof candidate.timezone !== "string" || !timezonevalid(candidate.timezone))) return undefined;
    return { cron: candidate.cron.trim(), ...(candidate.timezone !== undefined ? { timezone: candidate.timezone } : {}) };
  }
  if (family === "interval") {
    const period = positivewindow(candidate.period);
    if (period === undefined) return undefined;
    const jitter = jitterwindow(candidate.jitter);
    if (candidate.jitter !== undefined && jitter === undefined) return undefined;
    return { period, ...(jitter !== undefined ? { jitter } : {}) };
  }
  if (family === "urllist") {
    if (!Array.isArray(candidate.urls) || candidate.urls.length === 0) return undefined;
    const urls = candidate.urls.map(url => httpsorigin(url) === undefined ? undefined : url.trim());
    if (urls.some(url => url === undefined)) return undefined;
    return { urls: urls as string[] };
  }
  if (family === "webhook") {
    if (typeof candidate.secret !== "string" || !webhooksecretok(candidate.secret)) return undefined;
    if (!Array.isArray(candidate.schema) || candidate.schema.length === 0) return undefined;
    const schema = candidate.schema.map(field => webhookfieldof(field));
    if (schema.some(field => field === undefined)) return undefined;
    const names = (schema as webhookfield[]).map(field => field.name);
    if (new Set(names).size !== names.length) return undefined;
    return { secret: candidate.secret, schema: schema as webhookfield[] };
  }
  const events = candidate.events;
  if (!Array.isArray(events) || events.length === 0) return undefined;
  if (!events.every(name => typeof name === "string" && triggereventcatalog.includes(name))) return undefined;
  return { events: [...new Set(events as string[])] };
}

/** True when a webhook shared secret clears the documented entropy floor: at least twenty four characters mixing letters and digits; the floor is a floor, not a cap, and any longer secret wins. */
export function webhooksecretok(secret: string): boolean {
  if (secret.length < 24) return false;
  if (/^(.)\1+$/.test(secret)) return false;
  return /[a-z]/i.test(secret) && /\d/.test(secret);
}

/** True when the timezone name resolves through the runtime timezone database. */
export function timezonevalid(timezone: string): boolean {
  try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }); return true; } catch { return false; }
}

/** Builds one armed trigger rule from the reviewed arm payload: the family normalizer validates the match fields, the effective cooldown applies the documented default of the webhook and event families and the rule starts enabled with zeroed counters. */
export function armrule(input: { id?: string; family: triggerfamily; workflowid: string; label?: string; payload: unknown; cooldown?: number; now: number }): triggerule | undefined {
  if (typeof input.workflowid !== "string" || !input.workflowid.trim()) return undefined;
  const payload = triggerpayloadof(input.family, input.payload);
  if (!payload) return undefined;
  if (input.cooldown !== undefined && (typeof input.cooldown !== "number" || !Number.isFinite(input.cooldown) || input.cooldown <= 0)) return undefined;
  const cooldown = input.cooldown ?? (input.family === "webhook" || input.family === "event" ? defaulttriggercooldown : 0);
  const label = input.label ?? `The ${input.family} rule of ${input.workflowid}`;
  return { id: input.id ?? crypto.randomUUID(), kind: input.family, workflowid: input.workflowid, label, ...payload, cooldown, state: { enabled: true, cooldown }, stats: { fires: 0, launches: 0, suppressions: 0 }, createdat: input.now };
}

/** The shared state of one rule update so enable, disable, pause, resume and fire bookkeeping stay immutable. */
export function updaterule(rule: triggerule, patch: { state?: Partial<triggerstate>; stats?: Partial<rulestats> }): triggerule {
  return { ...rule, ...(patch.state !== undefined ? { state: { ...rule.state, ...patch.state } } : {}), ...(patch.stats !== undefined ? { stats: { ...rule.stats, ...patch.stats } } : {}) };
}

/** Matches one glob url pattern against one navigation url: the schemes and hostnames must agree, an explicit pattern port must match while an absent port matches any port, and the path plus query glob accepts `*` inside one segment and `**` across segments. */
export function matchurl(pattern: string, url: string): boolean {
  let parsedpattern: URL;
  let parsedurl: URL;
  try {
    parsedpattern = new URL(pattern);
    parsedurl = new URL(url);
  } catch { return false; }
  if (parsedpattern.protocol !== parsedurl.protocol) return false;
  if (parsedpattern.hostname !== parsedurl.hostname) return false;
  if (parsedpattern.port !== "" && parsedpattern.port !== parsedurl.port) return false;
  return globmatch(`${parsedpattern.pathname}${parsedpattern.search}`, `${parsedurl.pathname}${parsedurl.search}`);
}

/** Matches one glob text where `*` spans no slash and `**` spans anything. */
function globmatch(pattern: string, text: string): boolean {
  const escaped = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(["^", pattern.split("**").map(segment => segment.split("*").map(escaped).join("[^/]*")).join(".*"), "$"].join(""));
  return expression.test(text);
}

/** True when a navigation url lands on one of the reviewed origins of a visit rule. */
export function visitmatch(origins: string[], url: string): boolean {
  let origin = "";
  try { origin = new URL(url).origin; } catch { return false; }
  return origins.includes(origin);
}

/** The five field cron parser: minute, hour, day of month, month and day of week accept `*`, lists, ranges and steps, and named weekdays (sun to sat) and months (jan to dec); day of week accepts zero and seven as sunday. */
export function cronparse(expression: string): { minutes: number[]; hours: number[]; daysofmonth: number[]; months: number[]; daysofweek: number[] } | undefined {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return undefined;
  const minutes = cronfield(fields[0] ?? "", 0, 59);
  const hours = cronfield(fields[1] ?? "", 0, 23);
  const daysofmonth = cronfield(fields[2] ?? "", 1, 31);
  const months = cronfield(fields[3] ?? "", 1, 12, monthnames);
  const daysofweek = cronfield(fields[4] ?? "", 0, 7, weekdaynames, true);
  if (!minutes || !hours || !daysofmonth || !months || !daysofweek) return undefined;
  return { minutes, hours, daysofmonth, months, daysofweek: [...new Set(daysofweek.map(day => day % 7))].sort((left, right) => left - right) };
}

/** The named weekday map of the cron grammar. */
const weekdaynames: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/** The named month map of the cron grammar. */
const monthnames: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

/** Parses one cron field into its sorted value list; the star, single values, ranges, steps and comma lists are accepted and names map through their table. */
function cronfield(field: string, min: number, max: number, names?: Record<string, number>, sundayseven = false): number[] | undefined {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    if (!part) return undefined;
    const [range, stepstring] = part.split("/");
    const step = stepstring === undefined ? 1 : Number(stepstring);
    if (!Number.isInteger(step) || step < 1) return undefined;
    let low = min;
    let high = max;
    if (range !== undefined && range !== "*") {
      const bounds = range.split("-");
      if (bounds.length > 2) return undefined;
      const lowvalue = cronvalue(bounds[0] ?? "", min, max, names);
      if (lowvalue === undefined) return undefined;
      low = lowvalue;
      high = lowvalue;
      if (bounds.length === 2) {
        const highvalue = cronvalue(bounds[1] ?? "", min, max, names);
        if (highvalue === undefined || highvalue < lowvalue) return undefined;
        high = highvalue;
      }
    }
    for (let value = low; value <= high; value += step) values.add(value);
  }
  const list = [...values];
  if (list.some(value => value < min || value > max)) return undefined;
  if (sundayseven && values.has(7)) { values.delete(7); values.add(0); }
  return [...values].sort((left, right) => left - right);
}

/** Parses one cron value: a number inside the bounds or a name of the table. */
function cronvalue(value: string, min: number, max: number, names?: Record<string, number>): number | undefined {
  const candidate = names?.[value.toLowerCase()];
  if (candidate !== undefined) return candidate;
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  if (parsed < min || parsed > max) return undefined;
  return parsed;
}

/** The calendar parts one cron match reads: minute, hour, day of month, one based month and zero based weekday. */
interface calendarparts { minute: number; hour: number; day: number; month: number; weekday: number }

/** Reads the calendar parts of one timestamp in UTC or the reviewed timezone through the runtime timezone database. */
function calendarparts(at: number, timezone?: string): calendarparts {
  if (timezone === undefined) {
    const date = new Date(at);
    return { minute: date.getUTCMinutes(), hour: date.getUTCHours(), day: date.getUTCDate(), month: date.getUTCMonth() + 1, weekday: date.getUTCDay() };
  }
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hourCycle: "h23", minute: "numeric", hour: "numeric", day: "numeric", month: "short", weekday: "short" }).formatToParts(new Date(at));
  const pick = (type: string): string => parts.find(part => part.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(pick("weekday"));
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(pick("month")) + 1;
  return { minute: Number(pick("minute")), hour: Number(pick("hour")), day: Number(pick("day")), month, weekday };
}

/** True when the calendar parts satisfy the day of month, month and day of week fields with the classic cron semantics: when both day fields are restricted either one matches, otherwise the restricted one must match. */
function crondaymatch(schedule: { daysofmonth: number[]; months: number[]; daysofweek: number[] }, parts: calendarparts): boolean {
  if (!schedule.months.includes(parts.month)) return false;
  const domfull = schedule.daysofmonth.length === 31;
  const dowfull = schedule.daysofweek.length === 7;
  const dommatch = schedule.daysofmonth.includes(parts.day);
  const dowmatch = schedule.daysofweek.includes(parts.weekday);
  if (!domfull && !dowfull) return dommatch || dowmatch;
  if (!domfull) return dommatch;
  if (!dowfull) return dowmatch;
  return true;
}

/** Computes the next fire time of a five field cron expression strictly after the given time: minute boundaries in UTC or the reviewed timezone; a schedule that never fires inside the four year horizon returns undefined so the honest no fire outcome travels on. */
export function cronnext(expression: string, from: number, timezone?: string): number | undefined {
  const schedule = cronparse(expression);
  if (!schedule) return undefined;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  let candidate = Math.floor(from / minute) * minute + minute;
  const horizon = from + 4 * 366 * day;
  while (candidate <= horizon) {
    const parts = calendarparts(candidate, timezone);
    if (!crondaymatch(schedule, parts)) { candidate += day - parts.hour * hour - parts.minute * minute; continue; }
    if (!schedule.hours.includes(parts.hour)) {
      const later = schedule.hours.find(value => value > parts.hour);
      candidate += later === undefined ? day - parts.hour * hour - parts.minute * minute : (later - parts.hour) * hour - parts.minute * minute;
      continue;
    }
    if (!schedule.minutes.includes(parts.minute)) {
      const later = schedule.minutes.find(value => value > parts.minute);
      candidate += later === undefined ? (60 - parts.minute) * minute : (later - parts.minute) * minute;
      continue;
    }
    return candidate;
  }
  return undefined;
}

/** Computes the next fire time of a cron rule strictly after the given time. */
export function schedulecron(rule: { cron: string; timezone?: string }, from: number): number | undefined {
  return cronnext(rule.cron, from, rule.timezone);
}

/** Computes the next fire time of an interval rule: the reviewed period after the last fire (or the arm time of the first pass) spread with the seeded jitter window so repeated fires never bunch at the minimum. */
export function scheduleinterval(rule: { period: number; jitter?: number }, lastfire: number | undefined, armedat: number, seed: number): number {
  const base = (lastfire ?? armedat) + rule.period;
  const jitter = rule.jitter ?? 0;
  if (jitter <= 0) return base;
  return Math.max(0, Math.round(base - jitter / 2 + seededrandom(seed) * jitter));
}

/** Returns every scheduled rule whose next fire time has passed; the alarm wake and the opportunistic service worker wakes drain this list. */
export function listdue(rules: triggerule[], now: number): Array<{ rule: triggerule; overdueby: number }> {
  return rules.flatMap(rule => {
    if (rule.state.nextfireat === undefined || rule.state.nextfireat > now) return [];
    if (!rule.state.enabled || rule.state.pausedat !== undefined) return [];
    return [{ rule, overdueby: now - rule.state.nextfireat }];
  });
}

/** Applies the cooldown window of one rule: a fire inside the window after the last fire is suppressed with the remaining window, a fire at or after it passes. */
export function applycooldown(rule: triggerule, now: number): { suppressed: boolean; remaining: number } {
  const lastfireat = rule.state.lastfireat;
  if (lastfireat === undefined || rule.state.cooldown <= 0) return { suppressed: false, remaining: 0 };
  const remaining = lastfireat + rule.state.cooldown - now;
  return { suppressed: remaining > 0, remaining: Math.max(0, remaining) };
}

/** The outcome of one trigger evaluation: the launch plan when the rule fires or the honest suppression reason. */
export interface triggerdecision { fired: boolean; suppressed?: string; remaining?: number; fire?: triggerfire }

/** Evaluates one armed rule against one observation: disabled, paused and rules whose workflow lost its approved review never fire, a run of the same workflow already active dedupes, the cooldown window suppresses and every passing fire carries the triggering url, title and payload into the run context. */
export function evaluatetrigger(input: { rule: triggerule; now: number; cause: string; url?: string; title?: string; payload?: Record<string, unknown>; runactive: boolean; workflowreviewed: boolean }): triggerdecision {
  const rule = input.rule;
  if (!rule.state.enabled) return { fired: false, suppressed: "disabled" };
  if (rule.state.pausedat !== undefined) return { fired: false, suppressed: "paused" };
  if (!input.workflowreviewed) return { fired: false, suppressed: "unreviewed" };
  if (input.runactive) return { fired: false, suppressed: "dedupe" };
  const cooldown = applycooldown(rule, input.now);
  if (cooldown.suppressed) return { fired: false, suppressed: "cooldown", remaining: cooldown.remaining };
  const fire: triggerfire = { id: crypto.randomUUID(), ruleid: rule.id, at: input.now, cause: input.cause, ...(input.url !== undefined ? { url: input.url } : {}), ...(input.title !== undefined ? { title: input.title } : {}), ...(input.payload !== undefined ? { payload: input.payload } : {}) };
  return { fired: true, fire };
}

/** Queues one fire that arrived while the target run or tab was busy; the queue keeps one pending fire per rule so repeated observations dedupe instead of piling up. */
export function queuefire(queue: triggerfire[], fire: triggerfire): { queue: triggerfire[]; queued: boolean; deduped: boolean } {
  if (queue.some(pending => pending.ruleid === fire.ruleid)) return { queue, queued: false, deduped: true };
  return { queue: [...queue, fire], queued: true, deduped: false };
}

/** Drains the queued fires in arrival order through the injected launch seam; a launch that throws leaves the failed fire and the remaining queue intact so the next wake retries it. */
export async function drainqueue(queue: triggerfire[], launch: (fire: triggerfire) => Promise<void>): Promise<{ launched: number; remaining: triggerfire[] }> {
  let remaining = [...queue];
  let launched = 0;
  while (remaining.length > 0) {
    const fire = remaining[0] as triggerfire;
    try { await launch(fire); } catch { return { launched, remaining }; }
    remaining = remaining.slice(1);
    launched += 1;
  }
  return { launched, remaining };
}

/** Plans one run per url of a url list rule: every url becomes its own trigger fire carrying the url into the run context; nothing is capped in code. */
export function runurllist(rule: triggerule, now: number): triggerfire[] {
  const urls = rule.urls ?? [];
  return urls.map(url => ({ id: crypto.randomUUID(), ruleid: rule.id, at: now, cause: "urllist", url }));
}

/** Verifies one webhook delivery: the shared secret must equal the reviewed secret compared character by character without early exit and the payload must satisfy every required schema field of its reviewed kind; only verified payloads persist. */
export function verifywebhook(input: { rule: triggerule; secret: string; payload: unknown }): { verified: boolean; reason?: string } {
  if (typeof input.rule.secret !== "string" || !input.rule.secret) return { verified: false, reason: "The webhook rule carries no reviewed secret." };
  if (!secrectsmatch(input.secret, input.rule.secret)) return { verified: false, reason: "The webhook secret does not match the reviewed secret of the rule." };
  const payload = input.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { verified: false, reason: "The webhook payload must be a JSON object." };
  const candidate = payload as Record<string, unknown>;
  for (const field of input.rule.schema ?? []) {
    const value = candidate[field.name];
    if (value === undefined) {
      if (field.required === true) return { verified: false, reason: `The required webhook field ${field.name} is missing.` };
      continue;
    }
    if (typeof value !== field.kind) return { verified: false, reason: `The webhook field ${field.name} is not a ${field.kind}.` };
  }
  return { verified: true };
}

/** Compares two secrets character by character without early exit so the comparison time leaks no prefix. */
function secrectsmatch(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let same = true;
  for (let index = 0; index < left.length; index += 1) if (left.charCodeAt(index) !== right.charCodeAt(index)) same = false;
  return same;
}

/** True when one observed page event name matches an event rule subscription of the observed event catalog. */
export function eventrulematches(rule: triggerule, event: string): boolean {
  return (rule.events ?? []).includes(event);
}

/** Subscribes the armed event rules to one observed page event: returns every enabled, unpaused event rule whose subscription list names the event of the observed catalog, so the page observation seam (watched mutations, focus shifts, banners, console output, captured errors and navigations) can fire exactly those rules. */
export function observeevents(rules: triggerule[], event: string): triggerule[] {
  if (!triggereventcatalog.includes(event)) return [];
  return rules.filter(rule => rule.kind === "event" && rule.state.enabled && rule.state.pausedat === undefined && eventrulematches(rule, event));
}

/** Suspends every enabled rule by setting its pause marker so session pauses hold fires instead of losing them. */
export function pauseall(rules: triggerule[], now: number): triggerule[] {
  return rules.map(rule => rule.state.enabled && rule.state.pausedat === undefined ? updaterule(rule, { state: { pausedat: now } }) : rule);
}

/** Clears the pause marker of every rule so the resume drains the queued fires through the same gates. */
export function resumeall(rules: triggerule[]): triggerule[] {
  return rules.map(rule => {
    if (rule.state.pausedat === undefined) return rule;
    const state = { ...rule.state };
    delete state.pausedat;
    return { ...rule, state };
  });
}

/** Builds the manual run step preview of one composed workflow: every expanded step with its kind, label, block and control summary so a human always sees what a run will do before confirming it. */
export function manualpreview(record: workflowrecord, now: number): manualrun {
  return { id: crypto.randomUUID(), workflowid: record.id, preview: record.steps.map(step => ({ stepid: step.id, kind: step.kind, label: step.label, ...(step.block !== undefined ? { block: step.block } : {}), ...(controlsummary(step) !== undefined ? { control: controlsummary(step) as unknown as Record<string, unknown> } : {}) })), at: now };
}

/** Records the confirmation outcome of one manual run preview; an undecided preview keeps its confirmation open. */
export function confirmmanualrun(preview: manualrun, confirmed: boolean, now: number): manualrun {
  return { ...preview, confirmed, decidedat: now };
}

/** Builds the review summary of one armed rule for the trigger list: the family, the match fields, the workflow reference, the effective cooldown and the schedule. */
export function triggersummary(rule: triggerule): { kind: triggerfamily; workflowid: string; label: string; origins?: string[]; pattern?: string; title?: string; command?: string; key?: string; cron?: string; timezone?: string; period?: number; jitter?: number; urls?: string[]; events?: string[]; fields?: number; cooldown: number; enabled: boolean; nextfireat?: number } {
  return {
    kind: rule.kind,
    workflowid: rule.workflowid,
    label: rule.label,
    ...(rule.origins !== undefined ? { origins: rule.origins } : {}),
    ...(rule.pattern !== undefined ? { pattern: rule.pattern } : {}),
    ...(rule.title !== undefined ? { title: rule.title } : {}),
    ...(rule.command !== undefined ? { command: rule.command } : {}),
    ...(rule.key !== undefined ? { key: rule.key } : {}),
    ...(rule.cron !== undefined ? { cron: rule.cron, ...(rule.timezone !== undefined ? { timezone: rule.timezone } : {}) } : {}),
    ...(rule.period !== undefined ? { period: rule.period, ...(rule.jitter !== undefined ? { jitter: rule.jitter } : {}) } : {}),
    ...(rule.urls !== undefined ? { urls: rule.urls } : {}),
    ...(rule.events !== undefined ? { events: rule.events } : {}),
    ...(rule.schema !== undefined ? { fields: rule.schema.length } : {}),
    cooldown: rule.state.cooldown,
    enabled: rule.state.enabled,
    ...(rule.state.nextfireat !== undefined ? { nextfireat: rule.state.nextfireat } : {}),
  };
}

/** Returns every origin a rule touches so the arm review and the fire gates can check them against the workflow grants: visit origins, the url pattern origin, the url list origins and the webhook delivery origin stay inside the workflow grant list. */
export function ruleorigins(rule: triggerule): string[] {
  const origins = new Set<string>();
  for (const origin of rule.origins ?? []) origins.add(origin);
  if (rule.pattern !== undefined) { const origin = httpsorigin(rule.pattern); if (origin !== undefined) origins.add(origin); }
  for (const url of rule.urls ?? []) { const origin = httpsorigin(url); if (origin !== undefined) origins.add(origin); }
  return [...origins];
}

/** True when every origin a rule touches stays inside the granted origin list of its workflow. */
export function ruleoriginsgranted(rule: triggerule, workfloworigins: string[]): boolean {
  const granted = new Set(workfloworigins);
  return ruleorigins(rule).every(origin => granted.has(origin));
}


/* ── Merged from workfloweditor.ts ── */
import { workflowfileversion } from "./protocol.js";


/**
 * Workflow editor of the 1.1.53 family.
 * Every pure rule of the visual builder lives in this file: the canvas model with nodes, typed binding edges and layout state, the load and save round trips against the composed workflow grammar, the drag and drop snapping to block boundaries, the reorder persistence, the grouping of a selection into a new block, the template insertion with nested parameters, the mini map projection and viewport math, the zoom that keeps step labels readable, the step search, the breakpoint markers with the debug run segmentation, the version diffing, the json and yaml file format for import, export and template sharing, the per site override application and the undo and redo stacks.
 * The module stays pure: the sidepanel renders the model and the background validates saves through the same composeworkflow grammar every other path uses, so no editor artifact bypasses review.
 */

/** The five categories of the block palette: actions, control flow, waits, variables and triggers. */
export const palettecategories: palettecategory[] = ["actions", "controlflow", "waits", "variables", "triggers"];

/** The curated drop blocks of the palette: one descriptor per canonical block of every category. */
export const palettenodes: palettenode[] = [
  { kind: "click", label: "Click an element", category: "actions", description: "Clicks the reviewed selector target." },
  { kind: "type", label: "Type text", category: "actions", description: "Types the reviewed text into the target field." },
  { kind: "navigate", label: "Navigate", category: "actions", description: "Navigates the tab to the reviewed url." },
  { kind: "readtext", label: "Read text", category: "actions", description: "Reads the text of the target element." },
  { kind: "scrapetable", label: "Scrape a table", category: "actions", description: "Extracts the reviewed table into a dataset." },
  { kind: "fillform", label: "Fill a form", category: "actions", description: "Fills the reviewed form fields from a saved profile." },
  { kind: "querytabs", label: "Query tabs", category: "actions", description: "Lists the tabs matching the reviewed query." },
  { kind: "fetchurl", label: "Fetch a url", category: "actions", description: "Fetches the reviewed endpoint behind the call consent." },
  { kind: "condition", label: "Condition", category: "controlflow", description: "Evaluates one reviewed boolean expression with no page side effect." },
  { kind: "branch", label: "Branch", category: "controlflow", description: "Chooses one reviewed path by page state with a mandatory else path." },
  { kind: "loop", label: "Loop a list", category: "controlflow", description: "Iterates a list variable binding the item and index per pass." },
  { kind: "repeatuntil", label: "Repeat until", category: "controlflow", description: "Reruns the body until the convergence expression holds." },
  { kind: "whileloop", label: "While loop", category: "controlflow", description: "Loops while the condition holds inside the reviewed bound." },
  { kind: "foreach", label: "For each element", category: "controlflow", description: "Iterates the elements of the reviewed selector." },
  { kind: "parallel", label: "Parallel branches", category: "controlflow", description: "Runs branches concurrently and joins them under the reviewed strategy." },
  { kind: "trycatch", label: "Try catch", category: "controlflow", description: "Wraps fragile steps with a catch handler, retries and timeouts." },
  { kind: "delay", label: "Delay", category: "waits", description: "Sleeps the reviewed base inside the jitter window." },
  { kind: "waitelement", label: "Wait for element", category: "waits", description: "Polls the reviewed selector until appearance or timeout." },
  { kind: "wait", label: "Wait", category: "waits", description: "Waits the reviewed duration." },
  { kind: "waitfor", label: "Wait for target", category: "waits", description: "Waits until the reviewed target exists." },
  { kind: "waittext", label: "Wait for text", category: "waits", description: "Waits until the reviewed text appears." },
  { kind: "waitquiet", label: "Wait for quiet", category: "waits", description: "Waits until the page stops mutating." },
  { kind: "waitload", label: "Wait for load", category: "waits", description: "Waits until the navigation settles." },
  { kind: "compute", label: "Compute", category: "variables", description: "Evaluates one reviewed expression into the result variable." },
  { kind: "extractvars", label: "Extract variables", category: "variables", description: "Applies the reviewed regex and stores the named captures." },
  { kind: "savetemplate", label: "Save template", category: "variables", description: "Shares the reviewed step as a reusable template." },
  { kind: "visitrule", label: "Visit rule", category: "triggers", description: "Fires on navigations to the reviewed origins." },
  { kind: "urlrule", label: "Url rule", category: "triggers", description: "Fires when the url matches the reviewed glob pattern." },
  { kind: "cronrule", label: "Cron rule", category: "triggers", description: "Fires on the reviewed five field cron schedule." },
  { kind: "intervalrule", label: "Interval rule", category: "triggers", description: "Fires every reviewed period with the jitter spread." },
  { kind: "webhookrule", label: "Webhook rule", category: "triggers", description: "Fires on a secret verified webhook delivery." },
  { kind: "eventrule", label: "Event rule", category: "triggers", description: "Fires on the observed page events of the catalog." },
];

/** The reviewed option schemas the step library documents per kind; kinds without an entry document no reviewed options of their own. */
const optionschemas: Record<string, Array<{ name: string; kind: "string" | "number" | "boolean"; required?: boolean }>> = {
  delay: [{ name: "base", kind: "number", required: true }, { name: "jitter", kind: "number" }],
  waitelement: [{ name: "timeout", kind: "number" }, { name: "poll", kind: "number" }],
  compute: [{ name: "expression", kind: "string", required: true }],
  extractvars: [{ name: "rule", kind: "string", required: true }],
  composeworkflow: [{ name: "name", kind: "string", required: true }, { name: "version", kind: "number" }],
  runworkflow: [{ name: "workflowid", kind: "string", required: true }, { name: "reviewed", kind: "boolean", required: true }, { name: "variables", kind: "string" }, { name: "background", kind: "boolean" }],
  dryrun: [{ name: "workflowid", kind: "string", required: true }],
  loop: [{ name: "loop", kind: "string", required: true }],
  repeatuntil: [{ name: "repeatuntil", kind: "string", required: true }],
  whileloop: [{ name: "whileloop", kind: "string", required: true }],
  foreach: [{ name: "foreach", kind: "string", required: true }],
  parallel: [{ name: "parallel", kind: "string", required: true }],
  trycatch: [{ name: "trycatch", kind: "string", required: true }],
};

/** Classifies one action kind into its palette category: the ten trigger kinds, the eight control flow kinds, the wait family, the variable family and everything else an action. */
function stepcategory(kind: string): palettecategory {
  if (triggerkinds.includes(kind)) return "triggers";
  if (controlflowkinds.includes(kind)) return "controlflow";
  if (kind.startsWith("wait") || kind === "spawait" || kind === "delay") return "waits";
  if (kind === "compute" || kind === "extractvars" || kind === "savetemplate") return "variables";
  return "actions";
}

/** Builds the step library over every reviewed action kind the policy table knows, grouped by category with the documented option schema of the kinds that carry one. */
export function buildsteplibrary(kinds: string[]): steplibraryentry[] {
  return [...new Set(kinds)].sort().map(kind => ({ kind, category: stepcategory(kind), optionschema: optionschemas[kind] ?? [] }));
}

/** The row height every canvas node occupies; the layout stacks steps top to bottom and block columns side by side. */
const noderowheight = 96;

/** The column width of one block container on the canvas. */
const blockcolumnwidth = 280;

/** The x origin of the main column of the canvas. */
const canvasoriginx = 40;

/** Strips the undo and redo stacks of one model so a snapshot never carries nested history. */
function snapshotof(model: editormodel): editormodel {
  const { undo, redo, dirty, ...rest } = model;
  void undo; void redo; void dirty;
  return { ...rest, dirty: true };
}

/** Pushes one edit onto the undo stack and clears the redo stack; every canvas edit routes through here. */
function withundo(model: editormodel, next: editormodel): editormodel {
  const undo = [...(model.undo ?? []), snapshotof(model)];
  const { redo, ...rest } = next;
  void redo;
  return { ...rest, dirty: true, undo };
}

/** Returns the id of one canvas node: the explicit node id, the step id or the invoked block name. */
function nodeidof(node: editornode): string {
  return node.id ?? (node.step !== undefined ? node.step.id : node.invocation !== undefined ? node.invocation.block : "");
}

/** Computes the layout width and height the nodes of one model occupy. */
function layoutsizeof(nodes: editornode[]): { width: number; height: number } {
  const width = Math.max(640, ...nodes.map(node => node.x + blockcolumnwidth)) + 40;
  const height = Math.max(480, ...nodes.map(node => node.y + noderowheight)) + 40;
  return { width, height };
}

/** Converts one composed workflow record into the canvas model: one node per top level step, one invocation node per contiguous block region of the expanded step list with a unique id even when one block is invoked many times, the bindings of every step lifted into typed edges and the layout stacked top to bottom with the block columns side by side. */
export function loadworkflow(record: workflowrecord, layout?: editorlayout): editormodel {
  const blocks = record.blocks.map(block => ({ ...block, steps: block.steps.map(entry => ({ ...entry })) }));
  const blockcolumn = (blockname: string): number => {
    const index = blocks.findIndex(block => block.name === blockname);
    return index < 0 ? canvasoriginx : canvasoriginx + (index + 1) * blockcolumnwidth;
  };
  const invocationcount = new Map<string, number>();
  const nodes: editornode[] = [];
  const edges: editoredge[] = [];
  let index = 0;
  while (index < record.steps.length) {
    const step = record.steps[index] as workflowstep;
    for (const binding of step.bindings ?? []) edges.push({ from: binding.stepid, to: step.id, variable: binding.variable, kind: binding.kind, ...(binding.path !== undefined ? { path: binding.path } : {}) });
    if (step.block === undefined) {
      const { bindings, block, params, ...rest } = step;
      void bindings; void block; void params;
      nodes.push({ step: { ...rest }, x: canvasoriginx, y: 60 + nodes.length * noderowheight });
      index += 1;
      continue;
    }
    const blockname = step.block;
    let end = index;
    while (end < record.steps.length && (record.steps[end] as workflowstep).block === blockname) end += 1;
    const region = record.steps.slice(index, end) as workflowstep[];
    const count = (invocationcount.get(blockname) ?? 0) + 1;
    invocationcount.set(blockname, count);
    const params = region.flatMap(entry => entry.params ?? []);
    nodes.push({ id: count === 1 ? blockname : `${blockname}${count}`, invocation: { block: blockname, label: blockname, ...(params.length > 0 ? { params: params.map(param => ({ ...param })) } : {}) }, x: blockcolumn(blockname), y: 60 + nodes.length * noderowheight });
    index = end;
  }
  const size = layouttypeof(nodes, layout);
  const model: editormodel = { workflowid: record.id, name: record.name, version: record.version, origins: [...record.origins], nodes, edges, blocks, layout: size, minimap: emptyminimap(), dirty: false };
  return { ...model, minimap: renderminimap(model).minimap };
}

/** Merges one explicit layout with the computed node bounds so a reopened canvas keeps its size while new nodes stay visible. */
function layouttypeof(nodes: editornode[], layout?: editorlayout): editorlayout {
  const size = layoutsizeof(nodes);
  if (!layout) return { width: size.width, height: size.height, viewportx: 0, viewporty: 0, zoom: 1 };
  return { width: Math.max(size.width, layout.width), height: Math.max(size.height, layout.height), viewportx: layout.viewportx, viewporty: layout.viewporty, zoom: layout.zoom };
}

/** Builds the empty mini map of a model before the first projection. */
function emptyminimap(): minimapstate {
  return { width: 160, height: 100, scale: 0, zoom: 1, viewport: { x: 0, y: 0, width: 0, height: 0 } };
}

/** Validates the canvas model and converts it back into one composed workflow record: every node is a step or a block invocation, every edge links the output of an earlier node into a later node so no cycle forms, block child bindings stay inside their block and the composed record passes the full workflow grammar. */
export function saveworkflow(model: editormodel, input: { now: number; kindallowed?: (kind: string) => boolean; riskof?: (kind: string) => actionrisk }): workflowrecord {
  if (typeof model.name !== "string" || !model.name.trim()) throw new Error("The workflow name must be a non-empty string.");
  if (typeof model.version !== "number" || !Number.isInteger(model.version) || model.version < 1) throw new Error("The workflow version must be a positive integer.");
  if (!Array.isArray(model.origins) || model.origins.length === 0) throw new Error("A workflow needs at least one granted HTTPS origin.");
  const ids = new Set<string>();
  for (const node of model.nodes) {
    if ((node.step === undefined) === (node.invocation === undefined)) throw new Error("Every canvas node must be exactly one workflow step or one block invocation.");
    const id = nodeidof(node);
    if (!id || ids.has(id)) throw new Error(`The canvas node id ${id || "(empty)"} must be unique.`);
    ids.add(id);
  }
  /** Walks the top level entries in execution order and maps every reachable step id onto its position so the edge check answers cycles. */
  const positionof = new Map<string, number>();
  let position = 0;
  for (const node of model.nodes) {
    if (node.step !== undefined) { positionof.set(node.step.id, position); position += 1; continue; }
    const block = model.blocks.find(entry => entry.name === node.invocation?.block);
    if (!block) throw new Error(`The block ${node.invocation?.block ?? ""} of the canvas has no definition.`);
    const walk = (entries: Array<workflowstep | blockinvocation>): void => {
      for (const entry of entries) {
        if ("kind" in entry && "label" in entry && !("block" in entry)) { positionof.set(entry.id, position); position += 1; continue; }
        const nested = model.blocks.find(candidate => candidate.name === (entry as blockinvocation).block);
        if (!nested) throw new Error(`The block ${(entry as blockinvocation).block} of the canvas has no definition.`);
        walk(nested.steps);
      }
    };
    walk(block.steps);
  }
  for (const edge of model.edges) {
    if (!positionof.has(edge.from)) throw new Error(`The edge of ${edge.variable} references the unknown source step ${edge.from}.`);
    if (!positionof.has(edge.to)) throw new Error(`The edge of ${edge.variable} references the unknown target step ${edge.to}.`);
    if ((positionof.get(edge.from) as number) >= (positionof.get(edge.to) as number)) throw new Error(`The edge of ${edge.variable} runs backwards from ${edge.from} into ${edge.to} and would form a cycle.`);
  }
  /** Collects the bindings one step id receives from the canvas edges. */
  const bindingsof = (stepid: string): variablebinding[] => model.edges.filter(edge => edge.to === stepid).map(edge => ({ variable: edge.variable, kind: edge.kind, stepid: edge.from, ...(edge.path !== undefined ? { path: edge.path } : {}) }));
  const entries: Array<workflowstep | blockinvocation> = [];
  const attached = new Map<string, workflowstep[]>();
  for (const node of model.nodes) {
    if (node.invocation !== undefined) { entries.push({ ...node.invocation }); continue; }
    const step = node.step as workflowstep;
    const bindings = bindingsof(step.id);
    const { block, params, ...rest } = { ...step, ...(bindings.length > 0 ? { bindings } : {}) };
    void params;
    const carried: workflowstep = rest;
    if (block !== undefined) {
      if (!model.blocks.some(candidate => candidate.name === block)) throw new Error(`The step ${step.id} attaches to the unknown block ${block}.`);
      const list = attached.get(block) ?? [];
      list.push(carried);
      attached.set(block, list);
      continue;
    }
    entries.push(carried);
  }
  const blocks = model.blocks.map(block => {
    const snapped = attached.get(block.name) ?? [];
    const snappedids = new Set(snapped.map(step => step.id));
    const carried: Array<workflowstep | blockinvocation> = [];
    for (const entry of block.steps) {
      if ("kind" in entry && "label" in entry && !("block" in entry) && snappedids.has((entry as workflowstep).id)) continue;
      carried.push(entry);
    }
    const steps: Array<workflowstep | blockinvocation> = [...carried, ...snapped];
    const withbindings: Array<workflowstep | blockinvocation> = [];
    for (const entry of steps) {
      if (!("kind" in entry && "label" in entry && !("block" in entry))) { withbindings.push(entry); continue; }
      const bindings = bindingsof((entry as workflowstep).id);
      const { block: inner, params, ...rest } = { ...(entry as workflowstep), ...(bindings.length > 0 ? { bindings } : {}) };
      void inner; void params;
      withbindings.push(rest as workflowstep);
    }
    return { ...block, steps: withbindings };
  });
  const composed = composeworkflow({ id: model.workflowid, name: model.name, version: model.version, origins: [...model.origins], steps: entries, blocks: blocks.map(block => ({ ...block })), now: input.now, ...(input.kindallowed !== undefined ? { kindallowed: input.kindallowed } : {}), ...(input.riskof !== undefined ? { riskof: input.riskof } : {}) });
  const checked = validateworkflow(composed, input.kindallowed !== undefined ? { kindallowed: input.kindallowed } : {});
  if (!checked.allowed) throw new Error(checked.reason ?? "The canvas model failed the workflow grammar.");
  return composed;
}

/** Attaches one step to a block boundary: the dragged position snaps onto the reviewed grid and the nearest block column attaches the step into that block while the main column detaches it. */
export function snapnode(model: editormodel, nodeid: string, x: number, y: number, grid = 20): editormodel {
  if (!Number.isFinite(grid) || grid <= 0) throw new Error("The snap grid must be a positive number.");
  const index = model.nodes.findIndex(node => nodeidof(node) === nodeid);
  if (index < 0) throw new Error(`No canvas node matches ${nodeid}.`);
  const node = model.nodes[index] as editornode;
  if (node.step === undefined) throw new Error("A block invocation node attaches through its own definition, not through snapping.");
  const snappedx = Math.round(x / grid) * grid;
  const snappedy = Math.round(y / grid) * grid;
  let attached: string | undefined;
  for (const [blockindex, block] of model.blocks.entries()) {
    const columnx = canvasoriginx + (blockindex + 1) * blockcolumnwidth;
    if (Math.abs(snappedx - columnx) <= blockcolumnwidth / 2) attached = block.name;
  }
  const { block: priorblock, ...rest } = node.step;
  void priorblock;
  const step: workflowstep = { ...rest, ...(attached !== undefined ? { block: attached } : {}) };
  const nodes = model.nodes.map((candidate, position) => position === index ? { step, x: snappedx, y: snappedy } : candidate);
  const size = layouttypeof(nodes, model.layout);
  const next: editormodel = { ...model, nodes, layout: size };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Persists one drag and drop ordering: the node moves to the reviewed index of the top level list while the edges stay attached to their step ids. */
export function reordersteps(model: editormodel, nodeid: string, index: number): editormodel {
  const current = model.nodes.findIndex(node => nodeidof(node) === nodeid);
  if (current < 0) throw new Error(`No canvas node matches ${nodeid}.`);
  if (!Number.isInteger(index) || index < 0 || index > model.nodes.length - 1) throw new Error("The reorder index must address an existing position of the canvas list.");
  const nodes = [...model.nodes];
  const [moved] = nodes.splice(current, 1);
  if (!moved) throw new Error("The reordered canvas node vanished.");
  nodes.splice(index, 0, moved);
  const next: editormodel = { ...model, nodes };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Moves many selected steps into a new block: the definition collects the selected steps in their current order and one invocation node replaces the first selected position. */
export function groupselect(model: editormodel, nodeids: string[], blockname: string): editormodel {
  if (!/^[a-z][a-z0-9]*$/.test(blockname)) throw new Error("The block name must be a unique lowercase word.");
  if (model.blocks.some(block => block.name === blockname)) throw new Error(`The block name ${blockname} already exists on the canvas.`);
  const selected = nodeids.map(id => {
    const node = model.nodes.find(candidate => nodeidof(candidate) === id);
    if (!node || node.step === undefined) throw new Error(`The grouping selection must address step nodes; ${id} is not one.`);
    return node;
  });
  if (selected.length === 0) throw new Error("The grouping selection needs at least one step node.");
  const steps = selected.map(node => node.step as workflowstep);
  const blocks = [...model.blocks, { name: blockname, label: blockname, steps: steps.map(step => ({ ...step })) }];
  const firstindex = model.nodes.findIndex(node => nodeidof(node) === nodeids[0] as string);
  const invocationnode: editornode = { id: blockname, invocation: { block: blockname, label: blockname }, x: (selected[0] as editornode).x, y: (selected[0] as editornode).y };
  const nodes: editornode[] = [];
  model.nodes.forEach((node, index) => {
    if (nodeids.includes(nodeidof(node))) {
      if (index === firstindex) nodes.push(invocationnode);
      return;
    }
    nodes.push(node);
  });
  const next: editormodel = { ...model, nodes, blocks };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Inserts one shared step template with its nested parameters: the template step becomes a canvas node at the reviewed index and the parameters ride with the step into its block scope. */
export function expandtemplate(model: editormodel, template: steptemplate, params: nestedparam[] = [], index?: number): editormodel {
  const parsed = steptemplateof(template);
  if (!parsed) throw new Error("The template does not carry one reviewed workflow step.");
  const checkedparams = params.flatMap(param => nestedparamof(param) !== undefined ? [nestedparamof(param) as nestedparam] : []);
  if (checkedparams.length !== params.length) throw new Error("The template expansion carries one malformed nested parameter; every parameter stays a reviewed lowercase word with its variable kind.");
  let id = parsed.step.id;
  let suffix = 2;
  const taken = new Set(model.nodes.map(node => nodeidof(node)));
  while (taken.has(id)) { id = `${parsed.step.id}${suffix}`; suffix += 1; }
  const step: workflowstep = { ...parsed.step, id, ...(checkedparams.length > 0 ? { params: checkedparams.map(param => ({ ...param })) } : {}) };
  const position = index !== undefined && Number.isInteger(index) && index >= 0 && index <= model.nodes.length ? index : model.nodes.length;
  const nodes = [...model.nodes.slice(0, position), { step, x: canvasoriginx, y: 60 + position * noderowheight }, ...model.nodes.slice(position)];
  const next: editormodel = { ...model, nodes };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Inserts one new step node onto the canvas at the reviewed index: the palette and the step library drop their kinds through here so every insertion rides the undo stack. */
export function addnode(model: editormodel, step: workflowstep, index?: number): editormodel {
  const normalized = workflowstepof(step);
  if (!normalized) throw new Error("The canvas insertion needs one reviewed workflow step.");
  let id = normalized.id;
  let suffix = 2;
  const taken = new Set(model.nodes.map(node => nodeidof(node)));
  while (taken.has(id)) { id = `${normalized.id}${suffix}`; suffix += 1; }
  const position = index !== undefined && Number.isInteger(index) && index >= 0 && index <= model.nodes.length ? index : model.nodes.length;
  const nodes = [...model.nodes.slice(0, position), { step: { ...normalized, id }, x: canvasoriginx, y: 60 + position * noderowheight }, ...model.nodes.slice(position)];
  const next: editormodel = { ...model, nodes };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Replaces the payload of one step node of the canvas: the step inspector edits its target, value, options, expression and extract fields through here so every edit rides the undo stack. */
export function editstep(model: editormodel, step: workflowstep): editormodel {
  const normalized = workflowstepof(step);
  if (!normalized) throw new Error("The step inspector edit needs one reviewed workflow step.");
  const index = model.nodes.findIndex(node => node.step?.id === normalized.id);
  if (index < 0) throw new Error(`No canvas step matches ${normalized.id}.`);
  const node = model.nodes[index] as editornode;
  const nodes = model.nodes.map((candidate, position) => position === index ? { step: { ...normalized, ...(node.step?.block !== undefined ? { block: node.step.block } : {}), ...(node.step?.breakpoint === true ? { breakpoint: true } : {}) }, x: node.x, y: node.y } : candidate);
  const next: editormodel = { ...model, nodes };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Projects the full canvas into the mini map: the projection scale fits every node into the mini size and the viewport rectangle follows the layout viewport and zoom. */
export function renderminimap(model: editormodel, width = 160, height = 100): { minimap: minimapstate; nodes: Array<{ id: string; x: number; y: number }> } {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) throw new Error("The mini map size must be positive.");
  const canvaswidth = Math.max(1, model.layout.width);
  const canvasheight = Math.max(1, model.layout.height);
  const scale = Math.min(width / canvaswidth, height / canvasheight);
  const zoom = model.layout.zoom > 0 ? model.layout.zoom : 1;
  const visiblewidth = canvaswidth / zoom;
  const visibleheight = canvasheight / zoom;
  const viewport = {
    x: Math.max(0, Math.min(model.layout.viewportx, canvaswidth)) * scale,
    y: Math.max(0, Math.min(model.layout.viewporty, canvasheight)) * scale,
    width: visiblewidth * scale,
    height: visibleheight * scale,
  };
  const nodes = model.nodes.map(node => ({ id: nodeidof(node), x: node.x * scale, y: node.y * scale }));
  return { minimap: { width, height, scale, zoom, viewport }, nodes };
}

/** Jumps the canvas to a clicked mini map region: the click converts back into canvas coordinates and the viewport centers on it inside the canvas bounds. */
export function minimapfocus(model: editormodel, x: number, y: number, width = 160, height = 100): editormodel {
  const projection = renderminimap(model, width, height);
  if (projection.minimap.scale <= 0) return model;
  const canvasx = x / projection.minimap.scale;
  const canvasy = y / projection.minimap.scale;
  const zoom = model.layout.zoom > 0 ? model.layout.zoom : 1;
  const visiblewidth = model.layout.width / zoom;
  const visibleheight = model.layout.height / zoom;
  const viewportx = Math.max(0, Math.min(canvasx - visiblewidth / 2, Math.max(0, model.layout.width - visiblewidth)));
  const viewporty = Math.max(0, Math.min(canvasy - visibleheight / 2, Math.max(0, model.layout.height - visibleheight)));
  const next: editormodel = { ...model, layout: { ...model.layout, viewportx, viewporty } };
  return { ...next, minimap: renderminimap(next).minimap };
}

/** Sets the canvas zoom to any positive user value with no ceiling while the step labels compensate so they stay readable at every zoom level: the returned label scale grows the labels relative to the canvas once the zoom shrinks below the readable floor. */
export function zoomcanvas(model: editormodel, zoom: number): { model: editormodel; labelscale: number } {
  if (!Number.isFinite(zoom) || zoom <= 0) throw new Error("The canvas zoom must be a positive number with no code ceiling.");
  const next: editormodel = { ...model, layout: { ...model.layout, zoom } };
  const labelscale = zoom < 1 ? 1 / zoom : 1;
  return { model: { ...next, minimap: renderminimap(next).minimap }, labelscale };
}

/** Finds steps by label, kind or variable name: the search answers the matching nodes with the reasons they matched, case insensitive. */
export function searchsteps(model: editormodel, query: string): Array<{ id: string; label: string; kind: string; matched: string[] }> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const results: Array<{ id: string; label: string; kind: string; matched: string[] }> = [];
  for (const node of model.nodes) {
    if (node.step === undefined) continue;
    const matched: string[] = [];
    if (node.step.label.toLowerCase().includes(needle)) matched.push("label");
    if (node.step.kind.toLowerCase().includes(needle)) matched.push("kind");
    const variables = [
      ...model.edges.filter(edge => edge.to === node.step?.id || edge.from === node.step?.id).map(edge => edge.variable),
      ...(node.step.expression !== undefined ? [node.step.expression.result] : []),
      ...(node.step.extract !== undefined ? node.step.extract.groups : []),
    ];
    if (variables.some(name => name.toLowerCase().includes(needle))) matched.push("variable");
    if (matched.length > 0) results.push({ id: node.step.id, label: node.step.label, kind: node.step.kind, matched });
  }
  return results;
}

/** Toggles the breakpoint marker of one step for editor debugging; a debug run pauses right before a marked step, and the marker rides the steps inside block definitions too. */
export function markbreakpoint(model: editormodel, stepid: string): editormodel {
  const toggle = (step: workflowstep): workflowstep => {
    const { breakpoint, ...rest } = step;
    void breakpoint;
    return breakpoint === true ? rest : { ...rest, breakpoint: true };
  };
  const index = model.nodes.findIndex(node => node.step?.id === stepid);
  if (index >= 0) {
    const node = model.nodes[index] as editornode;
    const step = node.step as workflowstep;
    const nodes = model.nodes.map((candidate, position) => position === index ? { step: toggle(step), x: candidate.x, y: candidate.y } : candidate);
    const next: editormodel = { ...model, nodes };
    return withundo(model, { ...next, minimap: renderminimap(next).minimap });
  }
  const blocks = model.blocks.map(block => {
    const stepindex = block.steps.findIndex(entry => "kind" in entry && "label" in entry && !("block" in entry) && (entry as workflowstep).id === stepid);
    if (stepindex < 0) return block;
    const steps = block.steps.map((entry, position) => position === stepindex ? toggle(entry as workflowstep) : entry);
    return { ...block, steps };
  });
  if (blocks.every((block, position) => block === model.blocks[position])) throw new Error(`No canvas step matches ${stepid}.`);
  const next: editormodel = { ...model, blocks };
  return withundo(model, next);
}

/** Plans one debug run segment: the run executes the steps from the cursor up to the step before the next breakpoint, pauses at the breakpoint step id and reports the steps remaining after it; a run without breakpoints runs to the end. */
export function runtobreakpoint(input: { record: workflowrecord; cursor?: number; breakpoints: string[] }): { until: number; pausat: string | undefined; remaining: number } {
  const cursor = input.cursor !== undefined && Number.isInteger(input.cursor) && input.cursor >= 0 ? input.cursor : 0;
  const marked = new Set(input.breakpoints);
  for (let index = cursor; index < input.record.steps.length; index += 1) {
    const step = input.record.steps[index] as workflowstep;
    if (step.breakpoint === true || marked.has(step.id)) {
      return { until: index, pausat: step.id, remaining: input.record.steps.length - index };
    }
  }
  return { until: input.record.steps.length, pausat: undefined, remaining: 0 };
}

/** Compares two workflow versions: the steps the newer version added, removed and changed with the field names that changed. */
export function diffversions(from: workflowrecord, to: workflowrecord, now: number): versiondiff {
  const fromsteps = new Map(from.steps.map(step => [step.id, step]));
  const tosteps = new Map(to.steps.map(step => [step.id, step]));
  const added: versiondiff["added"] = [];
  const removed: versiondiff["removed"] = [];
  const changed: versiondiff["changed"] = [];
  for (const step of to.steps) {
    const prior = fromsteps.get(step.id);
    if (!prior) { added.push({ stepid: step.id, kind: step.kind, label: step.label }); continue; }
    const changes: string[] = [];
    if (prior.label !== step.label) changes.push("label");
    if (prior.kind !== step.kind) changes.push("kind");
    if (prior.target !== step.target) changes.push("target");
    if (prior.value !== step.value) changes.push("value");
    if (prior.options !== step.options) changes.push("options");
    if (JSON.stringify(prior.expression) !== JSON.stringify(step.expression)) changes.push("expression");
    if (JSON.stringify(prior.extract) !== JSON.stringify(step.extract)) changes.push("extract");
    if (JSON.stringify(prior.bindings) !== JSON.stringify(step.bindings)) changes.push("bindings");
    if (changes.length > 0) changed.push({ stepid: step.id, kind: step.kind, label: step.label, changes });
  }
  for (const step of from.steps) {
    if (!tosteps.has(step.id)) removed.push({ stepid: step.id, kind: step.kind, label: step.label });
  }
  return { workflowid: to.id, from: from.version, to: to.version, added, removed, changed, at: now };
}

/** Serializes one workflow record with its version metadata into a workflow file of the reviewed json or yaml format. */
export function exportworkflow(record: workflowrecord, format: exportformat, note?: string, now?: number): { format: exportformat; contents: string; file: workflowfile } {
  const file: workflowfile = { format: workflowfileversion, exportedat: now ?? Date.now(), workflow: record, ...(note !== undefined && note.trim() !== "" ? { note } : {}), templates: [] };
  return { format, contents: serializefile(file, format), file };
}

/** Packs one workflow with its shared step templates into a single shareable file so a whole library travels together. */
export function shareworkflow(record: workflowrecord, templates: steptemplate[], format: exportformat, note?: string, now?: number): { format: exportformat; contents: string; file: workflowfile } {
  const file: workflowfile = { format: workflowfileversion, exportedat: now ?? Date.now(), workflow: record, ...(note !== undefined && note.trim() !== "" ? { note } : {}), templates: templates.map(template => ({ ...template })) };
  return { format, contents: serializefile(file, format), file };
}

/** Validates and loads one workflow file: the format version must match, the workflow must compose through the full grammar and every packed template must normalize; the loaded record grades unreviewed until the user approves it. */
export function importworkflow(input: { contents: string; format?: exportformat; now?: number; kindallowed?: (kind: string) => boolean; riskof?: (kind: string) => actionrisk }): { record: workflowrecord; templates: steptemplate[]; file: workflowfile } {
  const format = input.format ?? (input.contents.trimStart().startsWith("{") ? "json" : "yaml");
  const parsed = parsefile(input.contents, format);
  if (parsed.format !== workflowfileversion) throw new Error(`The workflow file format ${String(parsed.format)} is not the reviewed format ${workflowfileversion}.`);
  const candidate = parsed.workflow;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) throw new Error("The workflow file carries no workflow record.");
  const fields = candidate as unknown as Record<string, unknown>;
  const stepsvalue = fields.steps;
  if (!Array.isArray(stepsvalue) || stepsvalue.length === 0) throw new Error("An imported workflow needs at least one step.");
  const steps: Array<workflowstep | blockinvocation> = [];
  for (const entry of stepsvalue) {
    const step = workflowstepof(entry);
    if (step) { steps.push(step); continue; }
    throw new Error("Every imported workflow entry must be a reviewed step.");
  }
  const composed = composeworkflow({
    id: typeof fields.id === "string" && fields.id.trim() !== "" ? fields.id : crypto.randomUUID(),
    name: typeof fields.name === "string" ? fields.name : "",
    version: typeof fields.version === "number" ? fields.version : 1,
    origins: Array.isArray(fields.origins) ? fields.origins.filter((origin): origin is string => typeof origin === "string") : [],
    steps,
    now: input.now ?? Date.now(),
    ...(input.kindallowed !== undefined ? { kindallowed: input.kindallowed } : {}),
    ...(input.riskof !== undefined ? { riskof: input.riskof } : {}),
  });
  const templatesvalue = parsed.templates;
  if (templatesvalue !== undefined && !Array.isArray(templatesvalue)) throw new Error("The packed templates of the workflow file must be a list.");
  const templates: steptemplate[] = [];
  for (const entry of templatesvalue ?? []) {
    const template = steptemplateof(entry);
    if (!template) throw new Error("A packed template of the workflow file does not carry one reviewed step.");
    templates.push(template);
  }
  const record: workflowrecord = { ...composed, reviewstate: "pending" };
  return { record, templates, file: { ...parsed, workflow: record } };
}

/** Wires one nested parameter into a block invocation of the canvas: the parameter replaces a same named one and the default binds into the block scope once the run opens it. */
export function bindparam(model: editormodel, blockname: string, param: nestedparam): editormodel {
  if (!/^[a-z][a-z0-9]*$/.test(param.name)) throw new Error("The nested parameter name must be a lowercase word.");
  const index = model.nodes.findIndex(node => node.invocation?.block === blockname);
  if (index < 0) throw new Error(`No block invocation of ${blockname} sits on the canvas.`);
  const node = model.nodes[index] as editornode;
  const invocation = node.invocation as blockinvocation;
  const params = [...(invocation.params ?? []).filter(existing => existing.name !== param.name), { ...param }];
  const nodes = model.nodes.map((candidate, position) => position === index ? { invocation: { ...invocation, params }, x: candidate.x, y: candidate.y } : candidate);
  const next: editormodel = { ...model, nodes };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Answers whether one origin matches a reviewed override pattern: an exact origin or a `*` subdomain glob of an https origin. The glob walks through plain string comparisons, because a pattern assembled into a regex could rebuild metacharacters the review never saw; the star matches exactly one host label, so `https://*.example.com` matches `https://sub.example.com` and never `https://example.com` or `https://a.b.example.com`. */
function originmatches(pattern: string, origin: string): boolean {
  if (pattern === origin) return true;
  const scheme = "https://";
  const starprefix = scheme + "*."; /* the reviewed glob shape: a star over exactly one host label */
  if (!pattern.startsWith(starprefix)) return false;
  if (!origin.startsWith(scheme)) return false;
  const suffix = pattern.slice(scheme.length + 1); /* the `.example.com` tail after the star label */
  const host = origin.slice(scheme.length);
  if (host.length <= suffix.length || !host.endsWith(suffix)) return false;
  const label = host.slice(0, host.length - suffix.length);
  return label.length > 0 && !label.includes(".");
}

/** Applies one per site policy override to a workflow: the deltas adjust only the reviewed knobs — loop bounds, step and run timeouts, element wait timeouts and delay bases — of the steps whose workflow origins match the override pattern. */
export function applyoverride(record: workflowrecord, override: siteoverride): workflowrecord {
  const matching = record.origins.filter(origin => originmatches(override.pattern, origin));
  if (matching.length === 0) throw new Error(`The override pattern ${override.pattern} matches none of the workflow origins ${record.origins.join(", ")}.`);
  const knobs = new Set(["loopbound", "stepms", "runms", "waitms", "delaybase"]);
  for (const knob of Object.keys(override.deltas)) {
    if (!knobs.has(knob)) throw new Error(`The override knob ${knob} is not one of the reviewed knobs: ${[...knobs].join(", ")}.`);
    if (typeof override.deltas[knob] !== "number" || !Number.isFinite(override.deltas[knob]) || override.deltas[knob] as number <= 0) throw new Error(`The override delta of ${knob} must be a positive number with no code ceiling.`);
  }
  const apply = (step: workflowstep): workflowstep => {
    if (Object.keys(override.deltas).length === 0) return step;
    let payload: Record<string, unknown> = {};
    try { payload = step.options !== undefined ? JSON.parse(step.options) as Record<string, unknown> : {}; } catch { payload = {}; }
    const bodyof = (key: string): Record<string, unknown> => payload[key] !== undefined && typeof payload[key] === "object" && !Array.isArray(payload[key]) ? payload[key] as Record<string, unknown> : {};
    if (override.deltas.loopbound !== undefined && ["loop", "repeatuntil", "whileloop"].includes(step.kind)) {
      const body = bodyof(step.kind);
      body.bound = override.deltas.loopbound;
      payload[step.kind] = body;
    }
    if ((override.deltas.stepms !== undefined || override.deltas.runms !== undefined) && step.kind === "trycatch") {
      const body = bodyof("trycatch");
      const timeout = body.timeout !== undefined && typeof body.timeout === "object" && !Array.isArray(body.timeout) ? body.timeout as Record<string, unknown> : {};
      if (override.deltas.stepms !== undefined) timeout.stepms = override.deltas.stepms;
      if (override.deltas.runms !== undefined) timeout.runms = override.deltas.runms;
      body.timeout = timeout;
      payload.trycatch = body;
    }
    if (override.deltas.waitms !== undefined && step.kind === "waitelement") {
      payload.timeout = override.deltas.waitms;
    }
    if (override.deltas.delaybase !== undefined && step.kind === "delay") {
      payload.base = override.deltas.delaybase;
    }
    const changed = Object.keys(payload).length > 0;
    return changed ? { ...step, options: JSON.stringify(payload) } : step;
  };
  return { ...record, steps: record.steps.map(apply) };
}

/** Wires one typed binding edge from the output socket of an earlier step into the input socket of a later step; a backwards edge refuses so no cycle forms. */
export function addedge(model: editormodel, edge: editoredge): editormodel {
  const from = model.nodes.findIndex(node => nodeidof(node) === edge.from);
  const to = model.nodes.findIndex(node => nodeidof(node) === edge.to);
  if (from < 0) throw new Error(`The canvas edge references the unknown source step ${edge.from}.`);
  if (to < 0) throw new Error(`The canvas edge references the unknown target step ${edge.to}.`);
  if (from >= to) throw new Error(`The canvas edge of ${edge.variable} would run backwards from ${edge.from} into ${edge.to} and form a cycle.`);
  if (!/^[a-z][a-z0-9]*$/.test(edge.variable)) throw new Error("The bound variable name must be a lowercase word.");
  const edges = [...model.edges.filter(candidate => !(candidate.from === edge.from && candidate.to === edge.to && candidate.variable === edge.variable)), { ...edge, ...(edge.path !== undefined ? { path: edge.path } : {}) }];
  const next: editormodel = { ...model, edges };
  return withundo(model, next);
}

/** Removes one typed binding edge of the canvas by its source, target and variable. */
export function removeedge(model: editormodel, from: string, to: string, variable: string): editormodel {
  const edges = model.edges.filter(candidate => !(candidate.from === from && candidate.to === to && candidate.variable === variable));
  if (edges.length === model.edges.length) throw new Error(`No canvas edge of ${variable} links ${from} into ${to}.`);
  const next: editormodel = { ...model, edges };
  return withundo(model, next);
}

/** Removes one canvas node with every edge attached to it; the undo stack keeps the removal reversible. */
export function removenode(model: editormodel, nodeid: string): editormodel {
  const index = model.nodes.findIndex(node => nodeidof(node) === nodeid);
  if (index < 0) throw new Error(`No canvas node matches ${nodeid}.`);
  const nodes = model.nodes.filter((_, position) => position !== index);
  const edges = model.edges.filter(edge => edge.from !== nodeid && edge.to !== nodeid);
  const next: editormodel = { ...model, nodes, edges };
  return withundo(model, { ...next, minimap: renderminimap(next).minimap });
}

/** Steps one canvas edit back: the last undo snapshot becomes the current model and the edited model waits on the redo stack. */
export function undoedit(model: editormodel): editormodel {
  const undo = model.undo ?? [];
  if (undo.length === 0) return model;
  const previous = undo[undo.length - 1] as editormodel;
  const current = snapshotof(model);
  return { ...previous, undo: undo.slice(0, -1), redo: [...(model.redo ?? []), current] };
}

/** Steps one canvas edit forward again after an undo: the newest redo snapshot returns as the current model. */
export function redoedit(model: editormodel): editormodel {
  const redo = model.redo ?? [];
  if (redo.length === 0) return model;
  const next = redo[redo.length - 1] as editormodel;
  const current = snapshotof(model);
  return { ...next, redo: redo.slice(0, -1), undo: [...(model.undo ?? []), current] };
}

/** Serializes one workflow file into the reviewed json or yaml format; the yaml writer emits the documented subset of quoted scalars, mappings and block sequences the reader parses back. */
function serializefile(file: workflowfile, format: exportformat): string {
  if (format === "json") return JSON.stringify(file, null, 2);
  return yamlvalue(file, 0).join("\n") + "\n";
}

/** Parses one workflow file from json or the documented yaml subset; every structural violation refuses the import. */
function parsefile(contents: string, format: exportformat): workflowfile {
  if (format === "json") {
    const parsed: unknown = JSON.parse(contents);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The workflow file is not a json object.");
    return parsed as workflowfile;
  }
  const lines = contents.split(/\r?\n/).map(line => line.replace(/\t/g, "  ")).filter(line => line.trim() !== "" && !line.trim().startsWith("#"));
  if (lines.length === 0) throw new Error("The yaml workflow file is empty.");
  const { value, next } = yamlblock(lines, 0, indentof(lines[0] as string));
  if (next < lines.length) throw new Error("The yaml workflow file carries content outside the documented subset.");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("The yaml workflow file is not a mapping.");
  return value as workflowfile;
}

/** Measures the leading spaces of one line. */
function indentof(line: string): number {
  const match = /^ */.exec(line);
  return match ? match[0].length : 0;
}

/** Renders one scalar of the yaml subset: strings quote with json escaping so no scalar ever confuses the reader. */
function yamlscalar(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(String(value));
}

/** Renders any value of a workflow file into yaml lines of the documented subset. */
function yamlvalue(value: unknown, indent: number): string[] {
  const pad = " ".repeat(indent);
  if (value === null || value === undefined || typeof value !== "object") return [`${pad}${yamlscalar(value)}`];
  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    const lines: string[] = [];
    for (const item of value) {
      if (item !== null && typeof item === "object") {
        lines.push(`${pad}-`);
        lines.push(...yamlvalue(item, indent + 2));
      } else {
        lines.push(`${pad}- ${yamlscalar(item)}`);
      }
    }
    return lines;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return [`${pad}{}`];
  const lines: string[] = [];
  for (const [key, entry] of entries) {
    if (entry !== null && typeof entry === "object") {
      if (Array.isArray(entry) && entry.length === 0) { lines.push(`${pad}${key}: []`); continue; }
      if (!Array.isArray(entry) && Object.keys(entry as Record<string, unknown>).length === 0) { lines.push(`${pad}${key}: {}`); continue; }
      lines.push(`${pad}${key}:`);
      lines.push(...yamlvalue(entry, indent + 2));
    } else {
      lines.push(`${pad}${key}: ${yamlscalar(entry)}`);
    }
  }
  return lines;
}

/** Parses one yaml block of the documented subset into its value starting at the reviewed line index and indentation. */
function yamlblock(lines: string[], start: number, indent: number): { value: unknown; next: number } {
  const first = lines[start] as string;
  if (/^\s*-\s/.test(first) || /^\s*-$/.test(first)) {
    const items: unknown[] = [];
    let index = start;
    while (index < lines.length) {
      const line = lines[index] as string;
      if (indentof(line) !== indent || !/^\s*-\s?/.test(line)) break;
      const rest = line.slice(indent + 1).trim();
      if (rest !== "") {
        items.push(yamlscalarvalue(rest));
        index += 1;
        continue;
      }
      const nested = yamlblock(lines, index + 1, indent + 2);
      items.push(nested.value);
      index = nested.next;
    }
    return { value: items, next: index };
  }
  const mapping: Record<string, unknown> = {};
  let index = start;
  while (index < lines.length) {
    const line = lines[index] as string;
    if (indentof(line) !== indent) break;
    const match = /^([A-Za-z][A-Za-z0-9]*):(?:\s(.*))?$/.exec(line.slice(indent));
    if (!match) break;
    const key = match[1] as string;
    const rest = match[2];
    if (rest !== undefined && rest !== "") {
      if (rest === "[]" ) { mapping[key] = []; index += 1; continue; }
      if (rest === "{}") { mapping[key] = {}; index += 1; continue; }
      mapping[key] = yamlscalarvalue(rest);
      index += 1;
      continue;
    }
    const nested = yamlblock(lines, index + 1, indent + 2);
    mapping[key] = nested.value;
    index = nested.next;
  }
  if (index === start) throw new Error("The yaml workflow file left the documented subset.");
  return { value: mapping, next: index };
}

/** Parses one quoted, numeric, boolean or null scalar of the yaml subset. */
function yamlscalarvalue(text: string): unknown {
  if (text.startsWith("\"")) {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "string" ? parsed : text;
  }
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
  return text;
}
