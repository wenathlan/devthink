// runner — correlated logic of execution (the Saddle engine runs the binary and returns the result)
export const modes = ["full-virtual", "runner", "node-packages", "docker", "ghcr"] as const;

/** one runner mode of the saddle engine (the runtime target a run asks for). */
export type RunnerMode = (typeof modes)[number];
