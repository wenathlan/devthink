/**
 * desktopprobe.cjs — manual visual probe (NOT a gate): screenshots the live
 * Sol shell entry chain (boot → identity → desktop) and the start menu, so
 * the orchestrator can inspect the deployed design without opening a
 * session of its own. Usage:
 *   node tests/scripts/desktopprobe.cjs https://wenathlan.github.io/devthink/devthink [outDir]
 */
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("C:/Users/nathalan/node_modules/playwright-core");

const APP_URL = process.argv[2] || "https://wenathlan.github.io/devthink/devthink";
const OUT_DIR = process.argv[3] || path.join(__dirname, "..", "artifacts", "desktop-probe");

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
    await page.goto(`${APP_URL.replace(/\/$/, "")}/`, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(1200);
    await shot("01-boot.png");
    // let the boot finish (or the identity lock to show)
    await page.waitForTimeout(2500);
    await shot("02-after-boot.png");

    // identity lock: try to continue as a local identity if the button exists
    const continueBtn = page.getByRole("button", { name: /continue|enter|open|start/i }).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click().catch(() => undefined);
      await page.waitForTimeout(1500);
    }
    await shot("03-entry.png");

    // desktop: open the start menu if the button exists
    const startBtn = page.getByRole("button", { name: /start/i }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click().catch(() => undefined);
      await page.waitForTimeout(900);
      await shot("04-start-menu.png");
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.waitForTimeout(400);
    }
    await shot("05-desktop.png");

    const title = await page.title();
    console.log(`probe ok: ${APP_URL} — title "${title}" — shots in ${OUT_DIR}`);
  } catch (err) {
    console.error("probe failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => undefined);
  }
})();
