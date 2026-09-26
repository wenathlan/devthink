/** Type declarations of the gateway fixture server helper for the vitest suite and the container smoke. */
export declare function startgatewayfixtureserver(): Promise<{ port: number; close: () => Promise<void> }>;
