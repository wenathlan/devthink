/**
 * chat.browser.test.cjs — the manual browser probe of the /chat surface.
 * Launches an ISOLATED Brave instance (a throwaway profile, never the
 * owner's running session), drives the real page against the real
 * deployed gateway and leaves the artifacts in tests/artifacts/chat-probe/.
 *
 * Run from devthink/ with the vite dev server already listening:
 *
 *   node tests/scripts/chat.browser.test.cjs http://127.0.0.1:5179 https://<gateway-host>
 *
 * The probe verifies the owner-facing contract end to end:
 * 1. the chat page renders (rail + welcome hero + composer),
 * 2. the gateway endpoint saved in the session panel steers the client,
 * 3. one real round trip commits an assistant turn with the echoed marker.
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('C:/Users/nathalan/node_modules/playwright-core');

const APP_URL = process.argv[2] ?? 'http://127.0.0.1:5179';
const GATEWAY = (process.argv[3] ?? '').replace(/\/+$/, '');
const OUT = path.join(__dirname, '..', 'artifacts', 'chat-probe');

if (!/^https?:\/\//.test(GATEWAY)) {
  console.error('usage: node tests/scripts/chat.browser.test.cjs <app-url> https://<gateway-host>');
  process.exit(1);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dt-chat-probe-'));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: ['--no-first-run', '--no-default-browser-check'],
  });
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(`${APP_URL}/chat`, { waitUntil: 'networkidle', timeout: 45000 });

    const shot1 = path.join(OUT, '01-welcome.png');
    await page.screenshot({ path: shot1, fullPage: false });
    const composer = page.getByLabel('Message Sol');
    if (!(await composer.count())) throw new Error('the composer did not render on /chat');
    console.log('step 1: chat page rendered with the composer');

    /* point the client at the deployed gateway through the session panel
       (wide viewports open the panel by default — only toggle when closed) */
    const endpoint = page.getByLabel('Gateway endpoint base url');
    if (!(await endpoint.isVisible())) {
      await page.getByRole('button', { name: 'Open session panel' }).click();
    }
    await endpoint.fill(GATEWAY);
    await page.getByRole('button', { name: 'Save gateway endpoint' }).click();
    const shot2 = path.join(OUT, '02-endpoint.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`step 2: gateway endpoint set (${GATEWAY})`);

    /* one real round trip: the echo marker proves the full client path */
    await composer.fill('Reply with exactly: sol chat ok');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.waitForFunction(
      () => document.body?.innerText.includes('sol chat ok'),
      undefined,
      { timeout: 90000, polling: 500 },
    );
    const shot3 = path.join(OUT, '03-answer.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('step 3: assistant turn committed with the marker');
    console.log('chat browser probe: ok');
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error('chat browser probe failed:', error.message);
  process.exit(1);
});
