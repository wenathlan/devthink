/** Test-only relay of the 1.1.82 site integration family: the declaration of the minimal frame-level websocket relay the bridge e2e tests bind to a localhost random port. */
export interface testrelayhandle {
  url: string;
  port: number;
  pairingcode: string;
  log: Array<Record<string, unknown>>;
  close(): Promise<void>;
  sessions(): Array<{ id: string; members: string[]; events: Array<Record<string, unknown>> }>;
}

/** Starts the test relay on a localhost random port with the pairing code the extension side registers, the optional idle window of the expiry sweep and the optional clock. */
export declare function starttestrelay(options?: { pairingcode?: string; idlewindow?: number; now?: () => number }): Promise<testrelayhandle>;
