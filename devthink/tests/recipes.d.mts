/** Type declarations of the example gallery gate for the vitest suite: the report shape the suite answers and the artifact records, so the recipes test imports the gate module with its types. */

/** One gallery check with its name, its outcome and its detail line, in the shape the sweep and poolaudit gates record theirs. */
export interface recipecheck {
  name: string;
  ok: boolean;
  detail: string;
}

/** One executed gallery entry with its metadata, its outcome and its measured duration, as the run report records it. */
export interface recipeentry {
  id: string;
  category: string;
  difficulty: string;
  fixture: string;
  origin: string;
  steps: number;
  kinds: string[];
  gates: number;
  consentclasses: string[];
  exportformat?: string;
  schedule?: string;
  topology?: string;
  expecteddurationms: number;
  capabilities: string[];
  outcome: string;
  durationms: number;
  detail: string;
}

/** The gallery run report the artifact records: the release, the mode, the gallery shape, the per check outcomes, the per entry records and the summary the gate exits on. */
export interface recipereport {
  release: string;
  mode: string;
  gallery: { version: string; entries: number; categories: Record<string, number>; fixtures: number };
  checks: recipecheck[];
  entries: recipeentry[];
  summary: { entries: number; passed: number; failed: number; checks: number; checksok: number; durationms: number };
}

/** Runs the full example gallery suite and answers the report the artifact records: the gallery shape, the per check outcomes, the per entry records with their outcomes and durations, and the summary the gate exits on. */
export declare function runrecipessuite(): Promise<recipereport>;

/** Compares one fresh gallery report against the previous release report and answers the drift lines that fail the diff: an entry added, removed, re-categorized, re-graded or drifted in its steps or kinds. */
export declare function gallerydriftof(previous: recipereport | null, current: recipereport): string[];
