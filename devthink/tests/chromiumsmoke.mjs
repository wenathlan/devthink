/** Loads the built extension in a temporary Chromium profile without user data or external page automation. */
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);
const packagejson = JSON.parse(await readFile("package.json", "utf8"));
const chromium = process.env.CHROME_BIN || "chromium";
const headlessarguments = process.env.CHROME_HEADLESS === "false" ? [] : ["--headless=new"];
const temporarydirectory = await mkdtemp(join(tmpdir(), "devthink-chromium-"));
const extensiondirectory = join(temporarydirectory, "extension");
const profiledirectory = join(temporarydirectory, "profile");
const zip = join(process.cwd(), "dist", `devthink${packagejson.version}.zip`);
let browser;
let launcherror = "";
let browserstderr = "";

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function readpopup(websocketurl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(websocketurl);
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error("Devthink popup DOM was not readable within five seconds."));
    }, 5000);
    socket.addEventListener("open", () =>
      socket.send(
        JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: { expression: "document.title + '\\n' + document.body.innerText", returnByValue: true },
        }),
      ),
    );
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);
      socket.close();
      const value = message.result?.result?.value;
      const problem =
        message.error?.message ||
        message.result?.exceptionDetails?.exception?.description ||
        message.result?.exceptionDetails?.text ||
        String(value);
      if (typeof value !== "string" || !value.includes("DEVTHINK") || !value.includes("Start active tab session"))
        reject(new Error(`Devthink popup DOM check failed: ${problem.slice(0, 300)}`));
      else resolve();
    });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("The local DevTools popup connection failed."));
    });
  });
}

try {
  await execute(chromium, ["--version"]);
  await mkdir(extensiondirectory);
  await mkdir(profiledirectory);
  await execute("unzip", ["-q", zip, "-d", extensiondirectory]);
  const manifest = JSON.parse(await readFile(join(extensiondirectory, "manifest.json"), "utf8"));
  if (manifest.manifest_version !== 3 || manifest.background?.service_worker !== "background.js")
    throw new Error("The packaged extension does not declare the expected MV3 service worker.");
  await access(join(extensiondirectory, manifest.background.service_worker));
  const extensionid = createHash("sha256")
    .update(Buffer.from(manifest.key, "base64"))
    .digest("hex")
    .slice(0, 32)
    .replace(/[0-9a-f]/g, (character) => String.fromCharCode("a".charCodeAt(0) + Number.parseInt(character, 16)));
  const extensionpage = `chrome-extension://${extensionid}/popup.html`;
  browser = spawn(
    chromium,
    [
      ...headlessarguments,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-background-networking",
      "--no-first-run",
      "--enable-logging=stderr",
      `--user-data-dir=${profiledirectory}`,
      "--remote-debugging-address=127.0.0.1",
      "--remote-debugging-port=0",
      `--disable-extensions-except=${extensiondirectory}`,
      `--load-extension=${extensiondirectory}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  browser.on("error", (error) => {
    launcherror = error.message;
  });
  browser.stderr?.on("data", (chunk) => {
    browserstderr = `${browserstderr}${chunk}`.slice(-4000);
  });
  let port;
  let targetsummary = "none";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const portfile = await readFile(join(profiledirectory, "DevToolsActivePort"), "utf8");
      port = Number.parseInt(portfile.split("\n")[0] ?? "", 10);
      if (!Number.isInteger(port) || port < 1) throw new Error("Chromium did not provide a valid DevTools port.");
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        targetsummary = targets
          .map((target) => `${target?.type ?? "unknown"}:${target?.url ?? ""}`)
          .join(", ")
          .slice(-1000);
        break;
      }
    } catch {
      // Chromium is still starting; the bounded retry loop continues.
    }
    if (browser.exitCode !== null) break;
    await delay(500);
  }
  if (!port) throw new Error("The isolated Chromium profile did not expose a loopback DevTools port.");
  const openresponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(extensionpage)}`, {
    method: "PUT",
  });
  if (!openresponse.ok)
    throw new Error(`The isolated Chromium profile could not open Devthink's local popup: ${openresponse.status}.`);
  let popupchecked = false;
  let popuperror = "";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (response.ok) {
      const targets = await response.json();
      targetsummary = targets
        .map((target) => `${target?.type ?? "unknown"}:${target?.url ?? ""}`)
        .join(", ")
        .slice(-1000);
      const popup = targets.find((target) => target?.type === "page" && target.url === extensionpage);
      if (popup?.webSocketDebuggerUrl && !popupchecked) {
        try {
          await readpopup(popup.webSocketDebuggerUrl);
          const preferences = JSON.parse(await readFile(join(profiledirectory, "Default", "Preferences"), "utf8"));
          const registered = preferences.extensions?.settings?.[extensionid];
          if (registered?.path !== extensiondirectory)
            throw new Error("Devthink was not registered from the isolated unpacked directory.");
          popupchecked = true;
        } catch (error) {
          popuperror = error instanceof Error ? error.message : String(error);
        }
      }
      if (popupchecked) {
        // Network observation smoke: fetch the reviewed DevTools url of the isolated browser through the shipped http client and parse its json.
        const { sendfetch, readpath } = await import("../dist/index.js");
        const reviewedurl = `http://127.0.0.1:${port}/json/version`;
        const transport = async (url, init) => {
          const response = await fetch(url, init);
          const headers = {};
          response.headers.forEach((value, name) => {
            headers[name] = value;
          });
          return { status: response.status, headers, body: await response.text() };
        };
        const fetched = await sendfetch({ request: { url: reviewedurl }, transport });
        if (fetched.status !== 200) throw new Error(`The reviewed smoke fetch returned ${fetched.status}.`);
        const fields = readpath(JSON.parse(fetched.body), [{ name: "browser", path: "Browser", kind: "text" }]);
        if (fields[0]?.missing === true)
          throw new Error("The reviewed smoke fetch did not parse the json body into named fields.");
        // Debugging smoke: capture the console output and one error of a fixture page through the shipped run timeline module.
        const { consolecapture, errorcapture, stackframes } = await import("../dist/index.js");
        const consoleentry = consolecapture({
          level: "warn",
          args: ["fixture", "page", { state: "loaded" }],
          depth: 2,
          redact: [],
        });
        if (
          consoleentry.level !== "warn" ||
          consoleentry.text !== "fixture page {state: loaded}" ||
          consoleentry.argkinds.join(",") !== "string,string,object"
        )
          throw new Error("The fixture console capture did not serialize the arguments.");
        const fixtureerror = errorcapture({
          message: "fixture boom",
          sourceurl: "https://example.com/fixture.js",
          line: 12,
          stacktext: "Error: fixture boom\n    at run (https://example.com/fixture.js:12:9)",
          redact: [],
        });
        if (
          fixtureerror.frames.length !== 1 ||
          fixtureerror.frames[0]?.line !== 12 ||
          stackframes("no frames").length !== 0
        )
          throw new Error("The fixture error capture did not parse its stack frames.");
        // Profiling smoke: measure one flow from fixture performance entries and export one trace with a step annotation through the shipped profilers module.
        const { measure, tracestart, annotatetrace, tracetofile, replaytrace } = await import("../dist/index.js");
        const flowspec = { prefix: "smoke", steps: ["s1"], metrics: ["navigation", "blocking"] };
        const flowentries = [
          { name: "smoke:s1:start", type: "mark", start: 0, duration: 0 },
          { name: "smoke:s1:end", type: "mark", start: 120, duration: 0 },
          { name: "fixture", type: "navigation", start: 0, duration: 400 },
          { name: "longtask", type: "longtask", start: 10, duration: 100 },
        ];
        const metrics = measure({
          runid: "smoke",
          stepid: "m1",
          spec: flowspec,
          entries: flowentries,
          now: Date.now(),
        });
        const navigation = metrics.find((metric) => metric.name === "navigation");
        const blocking = metrics.find((metric) => metric.name === "blocking");
        if (navigation?.duration !== 400 || navigation.steps.join(",") !== "s1" || blocking?.duration !== 50)
          throw new Error("The fixture flow measurement did not sum the navigation and blocking durations.");
        const trace = tracestart({
          id: "smoke-trace",
          runid: "smoke",
          stepid: "m1",
          origin: "https://example.com",
          categories: ["scripting"],
          now: 1000,
        });
        const annotated = annotatetrace({
          trace,
          annotations: [{ stepid: "s1", label: "smoke step", offset: 0 }],
          timeline: [{ stepid: "s1", time: 1150 }],
          now: 2000,
        });
        const file = tracetofile(annotated, [{ name: "longtask", category: "scripting", offset: 150 }]);
        const replay = replaytrace(file.content);
        if (replay.events.length !== 1 || replay.events[0]?.stepid !== "s1" || replay.annotations[0]?.offset !== 150)
          throw new Error("The fixture trace export did not carry its step annotation into the offline replay.");
        // Emulation smoke: apply one reviewed device layer with its prior state captured and revert it through the shipped emulation module.
        const { emulationstateof, newlayer, applylayer, revertalllayers, layernames } = await import(
          "../dist/index.js"
        );
        const devicelayer = newlayer({
          id: "smoke-device",
          runid: "smoke",
          stepid: "e1",
          family: "device",
          name: "phone",
          originscope: "https://example.com",
          revertplan: ["restore the pixel ratio"],
          prior: { pixelratio: 2, viewportwidth: 1200, viewportheight: 800 },
          at: 1000,
        });
        let emustate = applylayer(
          emulationstateof({ runid: "smoke", tabid: 1, origin: "https://example.com", now: 1000 }),
          devicelayer,
          1100,
        );
        if (layernames(emustate).join(",") !== "phone")
          throw new Error("The fixture emulation apply did not stack the device layer.");
        const emurevert = revertalllayers(emustate, 1200);
        if (
          layernames(emurevert.state).length !== 0 ||
          emurevert.reverted[0]?.name !== "phone" ||
          emurevert.reverted[0]?.prior?.pixelratio !== 2
        )
          throw new Error("The fixture emulation revert did not restore the prior pixel ratio.");
        // Protocol negotiation smoke: exercise the protocolv2 negotiation, the versioned memory envelope and the served capability manifest through the shipped library bundle.
        const { capmanifestof, memoryitemframe, negotiateprotocol, sharedprotocolversion } = await import(
          "../dist/index.js"
        );
        const freshclient = negotiateprotocol({});
        const legacyclient = negotiateprotocol({ client: 1 });
        const futureclient = negotiateprotocol({ client: "3.0.0" });
        if (freshclient.agreed !== true || freshclient.major !== 2)
          throw new Error("The new client negotiation did not answer the frozen protocolv2 default of two.");
        if (legacyclient.agreed !== false || !String(legacyclient.reason).includes("migrateplan"))
          throw new Error(
            "The version one negotiation did not refuse below the 2.0.0 sunset floor with the migration path.",
          );
        if (
          futureclient.agreed !== false ||
          !String(futureclient.reason).includes("supported protocol versions are 2 through 2")
        )
          throw new Error("The future client negotiation did not refuse with the supported range.");
        const shared = sharedprotocolversion([1, 2]);
        if (shared.shared !== true || shared.major !== 2)
          throw new Error("The shared protocol negotiation did not answer the highest shared major.");
        const negotiatedframe = memoryitemframe({
          version: packagejson.version,
          key: "smoke",
          value: 1,
          provenance: { origin: "https://example.com", runid: "run-smoke", stepid: "s1", capturedat: 1 },
        });
        if (negotiatedframe.provenance.runid !== "run-smoke")
          throw new Error("The versioned memory envelope did not round trip through the shipped bundle.");
        const servedmanifest = capmanifestof("background");
        if (
          servedmanifest.protocolmajor !== 2 ||
          servedmanifest.release !== packagejson.version ||
          servedmanifest.messages.length < 100
        )
          throw new Error(
            "The served background capability manifest did not pin the release with the frozen protocol major.",
          );
        // Pentest smoke: the 1.1.95 security hardening release runs its whole automated checklist end to end inside the chromium smoke, so every consent, inbound, emergency, transport, secret, audit, sandbox, minimization, phishguard and human gate entry answers against the shipped bundles while the extension runs.
        const { runpentestchecklist } = await import("./pentest.mjs");
        const pentestreport = await runpentestchecklist();
        if (pentestreport.summary.total !== 21 || pentestreport.summary.failed > 0)
          throw new Error(
            `The pentest checklist answered ${pentestreport.summary.passed} of ${pentestreport.summary.total} entries inside the chromium smoke; a failed entry blocks the release.`,
          );
        // Coordination smoke: the 1.1.96 multi agent certification release executes one coordination scenario end to end inside the chromium smoke — the leader worker topology over five fake agents on the fake tabs of every browser kind elects, assigns, claims every task exactly once, closes the review and the verification and folds the aggregate report.
        const { runleaderworkertopologyscenario } = await import("./agentcert.mjs");
        const coordination = await runleaderworkertopologyscenario();
        if (
          coordination.agents !== 5 ||
          coordination.tasks !== 2 ||
          coordination.verdict !== "approve" ||
          coordination.verification !== "pass" ||
          coordination.complete !== true
        )
          throw new Error(
            `The leader worker topology scenario did not close its loop inside the chromium smoke: ${JSON.stringify(coordination)}.`,
          );
        console.log(
          JSON.stringify({
            valid: true,
            version: packagejson.version,
            browser: chromium,
            profile: "temporary",
            serviceworker: "declared-and-packaged",
            popup: "loaded",
            httpfetch: `fetched ${reviewedurl} and parsed ${fields.length} json field`,
            timeline: `captured one ${consoleentry.level} console entry and one error with ${fixtureerror.frames.length} stack frame of a fixture page`,
            profiling: `measured one flow of ${metrics.length} metrics and exported one trace of ${file.events} event with its step annotation replayed offline`,
            emulation: `applied the fixture device layer phone and reverted it with the prior pixel ratio ${emurevert.reverted[0]?.prior?.pixelratio} restored`,
            negotiation: `negotiated protocolv2 with a fresh client, a version one client refused below the 2.0.0 sunset floor and a refused future client beside the ${servedmanifest.messages.length} message background capmanifest pinned to ${servedmanifest.release}`,
            pentest: `executed all ${pentestreport.summary.total} checklist entries against the shipped bundles with ${pentestreport.summary.failed} failures`,
            coordination: `executed the leader worker topology scenario of ${coordination.agents} agents over ${coordination.tasks} tasks with the critic verdict ${coordination.verdict}, the verification ${coordination.verification} and the queue complete`,
          }),
        );
        process.exitCode = 0;
        break;
      }
    }
    if (browser.exitCode !== null) break;
    await delay(500);
  }
  if (process.exitCode !== 0) {
    const detail = [
      launcherror,
      browser.exitCode === null
        ? "browser did not register and load Devthink's local popup within 30 seconds"
        : `browser exited with code ${browser.exitCode}`,
      popuperror,
      `targets=${targetsummary}`,
      browserstderr.replace(/\s+/g, " ").trim(),
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(`The isolated Chromium profile did not load the packaged Devthink MV3 extension: ${detail}`);
  }
} finally {
  browser?.kill("SIGTERM");
  await delay(200);
  browser?.kill("SIGKILL");
  await rm(temporarydirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}
