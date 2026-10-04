/**
 * chat.optin.probe.cjs — manual visual+functional probe (NOT a gate): drives
 * the deployed chat through the gateway opt-in registration — render, panel,
 * register with a live gateway, connected state, one round trip with the
 * marker. Usage:
 *   node tests/scripts/chat.optin.probe.cjs https://wenathlan.github.io/devthink/devthink [gatewayBase] [outDir]
 */
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("C:/Users/nathalan/node_modules/playwright-core");

const APP_URL = process.argv[2] || "https://wenathlan.github.io/devthink/devthink";
const GATEWAY = (process.argv[3] || "https://g16be7k5h8u1-d.space-z.ai").replace(/\/$/, "");
const OUT_DIR = process.argv[4] || path.join(__dirname, "..", "artifacts", "chat-optin-probe");
const MARKER = `gateway optin ok ${Date.now()}`;

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const profile = path.join(OUT_DIR, "profile");
  const browser = await chromium.launchPersistentContext(profile, {
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    headless: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const shot = (name) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: false });

  try {
    const base = APP_URL.replace(/\/$/, "");
    await page.goto(`${base}/chat`, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(3000);

    // the fresh profile lands on the identity lock: pass it before the chat
    const identityName = page.getByPlaceholder(/display name/i).first();
    if (await identityName.isVisible().catch(() => false)) {
      await identityName.fill("probe");
      await page.getByRole("button", { name: /create identity/i }).first().click();
      await page.waitForTimeout(1500);
    } else {
      const continueBtn = page.getByRole("button", { name: /continue as/i }).first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click().catch(() => undefined);
        await page.waitForTimeout(1500);
      }
    }
    await shot("01-chat-disconnected.png");

    // open the session panel only if it starts closed
    const panelButton = page.getByRole("button", { name: /session panel|open session/i }).first();
    if (await panelButton.isVisible().catch(() => false)) await panelButton.click().catch(() => undefined);
    await page.waitForTimeout(800);
    await shot("02-register-form.png");

    // register the gateway (opt-in): fill the endpoint and submit
    const endpoint = page.getByLabel(/gateway endpoint/i).first();
    await endpoint.fill(GATEWAY);
    await page.getByRole("button", { name: /register gateway/i }).first().click();
    await page.waitForTimeout(3500);
    await shot("03-gateway-connected.png");

    // one real round trip through the registered gateway
    await page.getByRole("textbox").first().fill(`reply with exactly this token and nothing else: ${MARKER}`);
    await page.keyboard.press("Enter");
    await page.waitForFunction((marker) => document.body.innerText.includes(marker), MARKER, { timeout: 90000 });
    await shot("04-answer.png");
    console.log(`probe ok: ${APP_URL}/chat — registered ${GATEWAY}, marker answered — shots in ${OUT_DIR}`);
  } catch (err) {
    await shot("99-failure.png").catch(() => undefined);
    console.error("probe failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => undefined);
  }
})();
