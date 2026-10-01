// # panelsync — the local, closed-network automation the owner runs once per
// machine to register the control plane: the locked first user, the
// CODEOWNERS admins, and the authorized family hosts. Nothing here is
// hardcodable into the public repository: the panel password is answered
// interactively (or through the DEVTHINK_ADMIN_PASSWORD environment), the
// digest it produces goes into the workflow secrets, and the code alone
// reveals nothing an attacker can use.
import { randomBytes, scryptSync } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { allowSite, admins, syncCodeowners } from "./admins.js";

export type PanelSyncReport = { adminCount: number; hosts: string[]; digest: string };

/** The family hosts derive from the repository folders — never a hardcoded list. */
function familyHosts(repoRoot: string): string[] {
  return readdirSync(repoRoot)
    .filter((name) => statSync(join(repoRoot, name)).isDirectory())
    .filter((name) => !name.startsWith(".") && !["dist", "release", "node_modules", "tests", "docs"].includes(name))
    .map((name) => `${name}.devthink.pro`);
}

function passwordDigest(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

/** Registers the control plane and answers the scrypt digest the workflow secret receives. */
export function panelSync(repoRoot: string, password: string): PanelSyncReport | string {
  if (!password || password.length < 12) return "the panel password needs twelve characters or more";
  syncCodeowners(repoRoot);
  const hosts = familyHosts(repoRoot);
  for (const host of hosts) allowSite("panel.sync", host, password);
  return { adminCount: admins().length, hosts, digest: passwordDigest(password) };
}
