import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const patterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /AIza[A-Za-z0-9_-]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{16,}/g,
  /gh[pousr]_[A-Za-z0-9_]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
];

function productFiles(root: string): string[] {
  const files: string[] = [];
  const visit = (path: string) => {
    if (!existsSync(path)) return;
    const stat = statSync(path);
    if (stat.isFile()) return files.push(path);
    for (const entry of readdirSync(path)) {
      if (entry === "node_modules" || entry === ".git" || entry === "docs" || entry === "dist" || entry === "release") continue;
      visit(join(path, entry));
    }
  };
  visit(join(root, "devthink.ts"));
  for (const name of ["config.ts", "providers.ts", "stream.ts", "session.ts", "memory.ts", "modes.ts", "plugin.ts", "server.ts", "ui.ts", "build.ts", "check-secrets.ts", "package.json", "tsconfig.json", "README.md", "CHANGELOG.md", "SECURITY.md"]) visit(join(root, name));
  visit(join(root, ".github"));
  visit(join(root, "tests"));
  return files.filter((path) => existsSync(path));
}

export function scanSecrets(root = process.cwd()): string[] {
  const findings: string[] = [];
  for (const file of productFiles(root)) {
    const text = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      if (pattern.test(text)) findings.push(`${file}: ${pattern}`);
      pattern.lastIndex = 0;
    }
  }
  return findings;
}

const directEntry = process.argv[1]?.endsWith("check-secrets.ts") || process.argv[1]?.endsWith("check-secrets");
const bunEntry = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (directEntry || bunEntry) {
  const findings = scanSecrets();
  if (findings.length) {
    console.error("Potential embedded credentials detected:");
    for (const finding of findings) console.error(finding);
    process.exitCode = 1;
  } else console.log("Secret scan passed.");
}
