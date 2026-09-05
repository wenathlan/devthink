/** The type declarations of the readiness gate so the test surface imports the mjs suite with its contract. */
export declare function runreadinesssuite(): Promise<{
  release: string;
  mode: string;
  generatedat: number;
  verdicts: Array<{ gate: string; ok: boolean; evidence: string }>;
  summary: { gates: number; ok: number; blocked: number; durationms: number };
  godecision: "go" | "no-go";
}>;
