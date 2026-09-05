/** One bun script that imports the library through the bun runtime: the same consent-first library loads with the node default adapters. */
import { bundlestamp, parseproposal } from "@wenathlan/extension";

const stamp = bundlestamp();
console.log(`devthink ${stamp.version} in ${stamp.mode} mode under bun ${Bun.version}`);
const proposal = parseproposal(JSON.stringify({ version: stamp.version, plan: { id: "plan1", state: "awaitingapproval", objective: "Read the release notes", steps: [{ id: "s1", kind: "observe", summary: "Observe the page." }] } }), "https://example.org");
console.log(`the plan parses with ${proposal.plan.steps.length} step${proposal.plan.steps.length === 1 ? "" : "s"} under the same review the extension runs`);
