/** One minimal mcp client script that lists the devthink tools over stdio: run `node dist/fixtures/mcp-client.mjs` with the serve command of the extension cli in your path. */
import { spawn } from "node:child_process";

const child = spawn("node", ["dist/cli.js", "serve", "--stdio"], { stdio: ["pipe", "pipe", "inherit"] });
const send = (id, method, params) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
child.stdout.on("data", chunk => {
  for (const line of String(chunk).trim().split("\n")) {
    if (line === "") continue;
    const frame = JSON.parse(line);
    if (frame.id === 1) { console.log(`server: ${frame.result.serverInfo.name} ${frame.result.serverInfo.version}`); send(2, "tools/list", {}); }
    if (frame.id === 2) { console.log(`${frame.result.tools.length} tools:`); for (const tool of frame.result.tools) console.log(`  ${tool.name} (${tool.metadata?.riskclass ?? "read"})`); child.kill(); }
  }
});
send(1, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "example client", version: "1" } });
