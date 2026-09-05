/**
 * cli — the scaffolding cli under real subprocess execution
 * every command runs as a child process exactly like a consumer types it:
 * init with piped answers, list show validate models keys export help
 */

import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, describe, expect, it } from "vitest";

const exec = promisify(execFile);

const tsxbin = join(import.meta.dirname, "..", "..", "node_modules", ".bin", "tsx");
const clits = join(import.meta.dirname, "..", "..", "gateway-cli.ts");

/** run the cli in a workdir with optional piped stdin */
async function runcli(
  workdir: string,
  args: string[],
  input = "",
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await exec(tsxbin, [clits, ...args], {
      cwd: workdir,
      env: { ...process.env, GATEWAY_DATABASE_URL: `file:${join(workdir, "cli.db")}` },
      maxBuffer: 10 * 1024 * 1024,
    });
    if (input) {
      // promisified execFile does not feed stdin — handled by the caller via runcliwithinput
    }
    return { stdout, stderr, code: 0 };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return { stdout: e.stdout ?? "", stderr: e.stderr ?? "", code: e.code ?? 1 };
  }
}

/** run the cli feeding piped stdin answers (the automation consumer flow) */
async function runcliwithinput(
  workdir: string,
  args: string[],
  input: string,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = execFile(tsxbin, [clits, ...args], {
      cwd: workdir,
      env: { ...process.env, GATEWAY_DATABASE_URL: `file:${join(workdir, "cli.db")}` },
      maxBuffer: 10 * 1024 * 1024,
    });
    child.stdin?.write(input);
    child.stdin?.end();
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? 0 }));
  });
}

// ---------------------------------------------------------------------------
// workspace — one temp dir hosts the whole consumer journey
// ---------------------------------------------------------------------------

const workdir = mkdtempSync(join(tmpdir(), "gateway-cli-"));

afterAll(() => {
  rmSync(workdir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// help and unknown commands
// ---------------------------------------------------------------------------

describe("cli help", () => {
  it("prints the usage banner with every command", async () => {
    const { stdout, code } = await runcli(workdir, ["help"]);
    expect(code).toBe(0);
    expect(stdout).toContain("@wenathlan/gateway");
    expect(stdout).toContain("Usage: gateway <command>");
    for (const cmd of [
      "init",
      "add",
      "list",
      "show",
      "validate",
      "keys",
      "models",
      "serve",
      "export",
    ]) {
      expect(stdout).toContain(cmd);
    }
  });

  it("bare invocation prints help", async () => {
    const { stdout, code } = await runcli(workdir, []);
    expect(code).toBe(0);
    expect(stdout).toContain("Usage: gateway <command>");
  });

  it("unknown commands fail with the usage", async () => {
    const { stdout, code } = await runcli(workdir, ["definitely-not-a-command"]);
    expect(code).toBe(1);
    expect(stdout).toContain("unknown command");
  });
});

// ---------------------------------------------------------------------------
// init — the piped automation consumer flow
// ---------------------------------------------------------------------------

describe("cli init", () => {
  it("scaffolds the full project from piped default answers", async () => {
    // 30 blank lines cover every question — each falls back to its default
    const { stdout, code } = await runcliwithinput(workdir, ["init"], "\n".repeat(30));
    expect(code).toBe(0);
    expect(stdout).toContain("init");
    expect(existsSync(join(workdir, "web", "config.mjs"))).toBe(true);
    expect(existsSync(join(workdir, "web", "schema.prisma"))).toBe(true);
    expect(existsSync(join(workdir, "prisma.config.ts"))).toBe(true);
    expect(existsSync(join(workdir, ".env.example"))).toBe(true);
    expect(stdout).toContain("web/config.mjs");
    expect(stdout).toContain("web/schema.prisma");
    expect(stdout).toContain("prisma.config.ts");
  });

  it("the scaffold is .mjs — loadable by plain node in a typeless package", () => {
    const cfg = readFileSync(join(workdir, "web", "config.mjs"), "utf8");
    expect(cfg).toContain("export const config");
  });

  it("the generated config carries the version and meta model", () => {
    const cfg = readFileSync(join(workdir, "web", "config.mjs"), "utf8");
    expect(cfg).toContain("v1");
    expect(cfg).toContain("devthink");
    expect(cfg).toContain("custom");
    expect(cfg).toContain("rotation");
    expect(cfg).toContain("bearer");
  });

  it("the generated schema defines the chat message and key models", () => {
    const schema = readFileSync(join(workdir, "web", "schema.prisma"), "utf8");
    expect(schema).toContain("model ChatMessage");
    expect(schema).toContain("model ApiKey");
    expect(schema).toContain("model NvidiaKey");
    expect(schema).toContain("datasource db");
  });

  it("the prisma config resolves the schema and datasource url", () => {
    const prismaconfig = readFileSync(join(workdir, "prisma.config.ts"), "utf8");
    expect(prismaconfig).toContain("schema.prisma");
    expect(prismaconfig).toContain("GATEWAY_DATABASE_URL");
  });

  it("the env example lists the derived env var", () => {
    const env = readFileSync(join(workdir, ".env.example"), "utf8");
    expect(env).toContain("CUSTOM_API_KEY=");
  });

  it("init refuses to overwrite without a yes answer", async () => {
    const before = readFileSync(join(workdir, "web", "config.mjs"), "utf8");
    const { stdout, code } = await runcliwithinput(workdir, ["init"], "n\n");
    expect(code).toBe(0);
    expect(stdout).toContain("keeping existing config");
    expect(readFileSync(join(workdir, "web", "config.mjs"), "utf8")).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// list show validate models — reading the scaffolded config
// ---------------------------------------------------------------------------

describe("cli list show validate models", () => {
  it("list shows the version summary", async () => {
    const { stdout, code } = await runcli(workdir, ["list"]);
    expect(code).toBe(0);
    expect(stdout).toContain("1 versions");
    expect(stdout).toContain("v1");
    expect(stdout).toContain("custom");
  });

  it("show prints one version detail", async () => {
    const { stdout, code } = await runcli(workdir, ["show", "v1"]);
    expect(code).toBe(0);
    expect(stdout).toContain("providername");
    expect(stdout).toContain("upstreams");
  });

  it("show of an unknown version fails", async () => {
    const { code } = await runcli(workdir, ["show", "nope"]);
    expect(code).toBe(1);
  });

  it("validate reports the scaffolded config valid", async () => {
    const { stdout, code } = await runcli(workdir, ["validate"]);
    expect(code).toBe(0);
    expect(stdout).toContain("config is valid");
  });

  it("models lists the catalog and rotation pool", async () => {
    const { stdout, code } = await runcli(workdir, ["models", "v1"]);
    expect(code).toBe(0);
    expect(stdout).toContain("models for v1");
    expect(stdout).toContain("default-model");
    expect(stdout).toContain("rotation pool");
  });
});

// ---------------------------------------------------------------------------
// keys — env instructions and the db seed script
// ---------------------------------------------------------------------------

describe("cli keys", () => {
  it("without a db model it documents the env var", async () => {
    const { stdout, code } = await runcli(workdir, ["keys", "v1"]);
    expect(code).toBe(0);
    expect(stdout).toContain("CUSTOM_API_KEY");
    expect(stdout).toContain("comma separated");
  });

  it("keys of an unknown version fails", async () => {
    const { code } = await runcli(workdir, ["keys", "nope"]);
    expect(code).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// export — the deployable scaffold
// ---------------------------------------------------------------------------

describe("cli export", () => {
  it("exports the config and schema for deploy", async () => {
    const { stdout, code } = await runcli(workdir, ["export", "--dir", "export"]);
    expect(code).toBe(0);
    expect(stdout).toContain("exported config.mjs");
    expect(stdout).toContain("exported schema.prisma");
    expect(existsSync(join(workdir, "export", "config.mjs"))).toBe(true);
    expect(existsSync(join(workdir, "export", "schema.prisma"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// db-backed keys — a second workspace with db key storage enabled
// ---------------------------------------------------------------------------

describe("cli init with db keys", () => {
  const dbworkdir = mkdtempSync(join(tmpdir(), "gateway-cli-db-"));

  it("scaffolds with database key storage and generates the seed script", async () => {
    const answers = [
      "1", // versions
      "", // id → v1
      "", // provider → custom
      "", // baseurl → default
      "", // auth → bearer
      "", // required → default true
      "", // envvar → CUSTOM_API_KEY
      "y", // store keys in database
      "apiKey", // db model
      "1", // one model
      "", // model id default
      "", // context
      "", // maxoutput
      "n", // no rotation (single model)
      "y", // retry
      "", // max retries
      "", // backoff base
      "", // backoff cap
      "n", // no shared context
      "", // meta id → devthink
      "", // gateway name
      "", // description
    ].join("\n");
    const { code } = await runcliwithinput(dbworkdir, ["init"], `${answers}\n`);
    expect(code).toBe(0);

    const { stdout, code: keyscode } = await runcliwithinput(
      dbworkdir,
      ["keys", "v1"],
      "2\nkey-aaaaaaaaaa\nkey-bbbbbbbbbb\n",
    );
    expect(keyscode).toBe(0);
    expect(stdout).toContain("register keys");
    const seed = join(dbworkdir, "tests", "seedkeys.mjs");
    expect(existsSync(seed)).toBe(true);
    const content = readFileSync(seed, "utf8");
    expect(content).toContain("key-aaaaaaaaaa");
    expect(content).toContain("key-bbbbbbbbbb");
    expect(content).toContain("apiKey");
    rmSync(dbworkdir, { recursive: true, force: true });
  });
});
