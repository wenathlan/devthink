#!/usr/bin/env node
// dismissalerts.cjs — the six container findings of the scorecard pin check
// answer as a documented wont fix: npm offers no hash pinning for install
// commands, the containers pin the exact family pnpm rung (the strongest
// pin the npm command line carries) and the registry integrity answers the
// lockfile digest.
const token = process.env.GH_TOKEN || "";
const alerts = process.argv.slice(2).map(Number);
const reason = "won't fix";
const comment =
  "npm offers no hash pinning for install commands; the container pins the exact family pnpm rung 12.3.4, the strongest pin the npm command line carries, and the registry integrity answers the lockfile digest.";

(async () => {
  for (const number of alerts) {
    const res = await fetch(`https://api.github.com/repos/wenathlan/devthink/code-scanning/alerts/${number}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "dismissed", dismissed_reason: reason, dismissed_comment: comment }),
    });
    const body = await res.json().catch(() => ({}));
    console.log(number, res.status, body.state || body.message || "");
  }
})();
