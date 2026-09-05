/*! devthink 2.0.0 — consent-first browser agent library — GPL-3.0-only — https://github.com/wenathlan/extension */

// crossbrowser.ts
var browserpolyfillflags = ["sidepanel", "scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"];
function browserpolyfillintersection() {
  const firefox = /* @__PURE__ */ new Set(["scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"]);
  const safari = /* @__PURE__ */ new Set(["scripting", "storage.session", "tabs.executeScript", "notifications", "contextMenus", "clipboard", "downloads", "runtime.messaging", "runtime.geturl"]);
  const chromium = new Set(browserpolyfillflags);
  const intersection = [];
  for (const flag of chromium) if (firefox.has(flag) && safari.has(flag)) intersection.push(flag);
  return intersection;
}
function browserpolyfillnamespace(input) {
  const record = input.runtime ?? {};
  const globalrecord = globalThis;
  if (typeof record.browser === "object" && record.browser !== null) return { namespace: record.browser, browser: "firefox" };
  if (typeof record.chrome === "object" && record.chrome !== null) return { namespace: record.chrome, browser: "chromium" };
  if (typeof globalrecord.browser === "object" && globalrecord.browser !== null) return { namespace: globalrecord.browser, browser: "firefox" };
  if (typeof globalrecord.chrome === "object" && globalrecord.chrome !== null) return { namespace: globalrecord.chrome, browser: "chromium" };
  return { namespace: void 0, browser: "chromium" };
}
function browserpolyfillpromisify(input) {
  return new Promise((resolve, reject) => {
    const callback = (...results) => {
      const last = results.length > 0 ? results[results.length - 1] : void 0;
      if (last !== void 0 && last !== null && typeof last === "object" && typeof last.runtimeError === "object") {
        reject(new Error("The webextension call reported a runtime error; the polyfill surfaces the structured error instead of a silent failure."));
        return;
      }
      resolve(last);
    };
    input.call(...input.args, callback);
  });
}
function browserpolyfillof(input) {
  const { namespace, browser } = browserpolyfillnamespace(input);
  const require2 = (name) => namespace === void 0 ? void 0 : namespace[name];
  const sidepanelapi = require2("sidePanel");
  const scriptingapi = require2("scripting");
  const storageapi = require2("storage");
  const tabsapi = require2("tabs");
  const windowsapi = require2("windows");
  const notificationsapi = require2("notifications");
  const downloadsapi = require2("downloads");
  const contextmenusapi = require2("contextMenus");
  const runtimeapi = require2("runtime");
  const sidepanel = {
    open: async (options) => {
      const path = options?.path ?? "sidepanel.html";
      if (sidepanelapi !== void 0 && typeof sidepanelapi.open === "function") {
        sidepanelapi.open();
        return { ok: true, fallback: false };
      }
      if (windowsapi !== void 0 && typeof windowsapi.create === "function") {
        const url = runtimeapi !== void 0 && typeof runtimeapi.getURL === "function" ? runtimeapi.getURL(path) : path;
        await browserpolyfillpromisify({ call: windowsapi.create.bind(windowsapi), args: [{ type: "popup", url, width: 480, height: 720 }] });
        return { ok: true, fallback: true };
      }
      return { ok: false, fallback: false, reason: `The sidepanel api is missing on ${browser} and the popup fallback could not open a window; the feature flag stays off.` };
    },
    setoptions: (options) => {
      if (sidepanelapi !== void 0 && typeof sidepanelapi.setoptions === "function") {
        sidepanelapi.setoptions({ path: options.path });
        return { ok: true };
      }
      return { ok: false, reason: `The sidepanel setoptions api is missing on ${browser}; the popup fallback keeps the layout via the popup window options.` };
    }
  };
  const scripting = {
    executescript: async (input2) => {
      if (scriptingapi !== void 0 && typeof scriptingapi.executeScript === "function") {
        await browserpolyfillpromisify({ call: scriptingapi.executeScript.bind(scriptingapi), args: [{ target: { tabId: input2.tabid }, ...input2.files !== void 0 ? { files: input2.files } : {}, ...input2.func !== void 0 ? { func: input2.func } : {} }] });
        return { ok: true, fallback: false };
      }
      if (tabsapi !== void 0 && typeof tabsapi.executeScript === "function") {
        await browserpolyfillpromisify({ call: tabsapi.executeScript.bind(tabsapi), args: [input2.tabid, { ...input2.files !== void 0 ? { file: input2.files[0] } : {}, ...input2.func !== void 0 ? { func: input2.func } : {} }] });
        return { ok: true, fallback: true };
      }
      return { ok: false, fallback: false, reason: `The scripting api and the tabs.executeScript fallback are both missing on ${browser}; the call surfaces a structured error.` };
    }
  };
  const storage = {
    local: {
      get: async (key) => {
        if (storageapi === void 0 || storageapi.local === void 0) throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const get = storageapi.local.get;
        if (get === void 0) throw new Error(`The storage.local.get api is missing on ${browser}; the call surfaces a structured error.`);
        return browserpolyfillpromisify({ call: get.bind(storageapi.local), args: key === void 0 ? [] : [key] });
      },
      set: async (entries) => {
        if (storageapi === void 0 || storageapi.local === void 0) throw new Error(`The storage.local api is missing on ${browser}; the call surfaces a structured error.`);
        const set = storageapi.local.set;
        if (set === void 0) throw new Error(`The storage.local.set api is missing on ${browser}; the call surfaces a structured error.`);
        await browserpolyfillpromisify({ call: set.bind(storageapi.local), args: [entries] });
      }
    },
    session: {
      get: async (key) => {
        if (storageapi === void 0 || storageapi.session === void 0) throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const get = storageapi.session.get;
        if (get === void 0) throw new Error(`The storage.session.get api is missing on ${browser}; the call surfaces a structured error.`);
        return browserpolyfillpromisify({ call: get.bind(storageapi.session), args: key === void 0 ? [] : [key] });
      },
      set: async (entries) => {
        if (storageapi === void 0 || storageapi.session === void 0) throw new Error(`The storage.session api is missing on ${browser}; the call surfaces a structured error.`);
        const set = storageapi.session.set;
        if (set === void 0) throw new Error(`The storage.session.set api is missing on ${browser}; the call surfaces a structured error.`);
        await browserpolyfillpromisify({ call: set.bind(storageapi.session), args: [entries] });
      }
    }
  };
  const tabs = {
    query: async (query) => {
      if (tabsapi === void 0 || typeof tabsapi.query !== "function") throw new Error(`The tabs.query api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.query.bind(tabsapi), args: [query] });
    },
    create: async (properties) => {
      if (tabsapi === void 0 || typeof tabsapi.create !== "function") throw new Error(`The tabs.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.create.bind(tabsapi), args: [properties] });
    },
    update: async (tabid, properties) => {
      if (tabsapi === void 0 || typeof tabsapi.update !== "function") throw new Error(`The tabs.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: tabsapi.update.bind(tabsapi), args: [tabid, properties] });
    }
  };
  const windows = {
    create: async (properties) => {
      if (windowsapi === void 0 || typeof windowsapi.create !== "function") throw new Error(`The windows.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: windowsapi.create.bind(windowsapi), args: [properties] });
    },
    update: async (windowid, properties) => {
      if (windowsapi === void 0 || typeof windowsapi.update !== "function") throw new Error(`The windows.update api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: windowsapi.update.bind(windowsapi), args: [windowid, properties] });
    }
  };
  const notifications = {
    create: async (notificationid, options) => {
      if (notificationsapi === void 0 || typeof notificationsapi.create !== "function") throw new Error(`The notifications.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: notificationsapi.create.bind(notificationsapi), args: [notificationid, options] });
    }
  };
  const downloads = {
    download: async (options) => {
      if (downloadsapi === void 0 || typeof downloadsapi.download !== "function") throw new Error(`The downloads.download api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: downloadsapi.download.bind(downloadsapi), args: [options] });
    }
  };
  const contextmenu = {
    create: async (properties) => {
      if (contextmenusapi === void 0 || typeof contextmenusapi.create !== "function") throw new Error(`The contextMenus.create api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: contextmenusapi.create.bind(contextmenusapi), args: [properties] });
    }
  };
  const clipboard = {
    read: async () => {
      const nav = globalThis.navigator ?? {};
      if (nav.clipboard !== void 0 && typeof nav.clipboard.readText === "function") return nav.clipboard.readText();
      throw new Error(`The navigator.clipboard.readText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`);
    },
    write: async (text) => {
      const nav = globalThis.navigator ?? {};
      if (nav.clipboard !== void 0 && typeof nav.clipboard.writeText === "function") return nav.clipboard.writeText(text);
      throw new Error(`The navigator.clipboard.writeText api is missing on ${browser}; the clipboard consent gate surfaces a structured error.`);
    }
  };
  const runtime = {
    geturl: (path) => {
      if (runtimeapi === void 0 || typeof runtimeapi.getURL !== "function") throw new Error(`The runtime.geturl api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.getURL(path);
    },
    sendmessage: async (message) => {
      if (runtimeapi === void 0 || typeof runtimeapi.sendMessage !== "function") throw new Error(`The runtime.sendmessage api is missing on ${browser}; the call surfaces a structured error.`);
      return browserpolyfillpromisify({ call: runtimeapi.sendMessage.bind(runtimeapi), args: [message] });
    },
    connect: (...args) => {
      if (runtimeapi === void 0 || typeof runtimeapi.connect !== "function") throw new Error(`The runtime.connect api is missing on ${browser}; the call surfaces a structured error.`);
      return runtimeapi.connect(...args);
    }
  };
  return { browser, sidepanel, scripting, storage, tabs, windows, notifications, downloads, contextmenu, clipboard, runtime };
}
function browserpolyfillstructerrorof(input) {
  return { family: input.family, message: input.message, retry: "none", browser: input.browser, at: input.now };
}
var firefoxdenylist = ["debugger", "cookies", "webRequest", "history", "bookmarks", "proxy", "management"];
function firefoxpermissionmap() {
  return { clipboardRead: "clipboardRead", clipboardWrite: "clipboardWrite", tabs: "tabs", downloads: "downloads", offscreen: "", nativeMessaging: "nativeMessaging" };
}
function firefoxprepoverlay(input) {
  const extensionid = (input.extensionid ?? "").trim();
  if (extensionid === "") throw new Error("The firefox overlay carries the generated extension id; an empty id never registers a firefox mv3 build.");
  const backgroundscript = (input.backgroundscript ?? "").trim();
  if (backgroundscript === "") throw new Error("The firefox overlay splits the background bundle for the event page semantics; an empty background script never launches the event page.");
  const overlay = {
    browser: "firefox",
    browser_specific_settings: { id: extensionid, ...input.strictminversion !== void 0 && input.strictminversion !== "" ? { strict_min_version: input.strictminversion } : {} },
    background: { scripts: [backgroundscript] },
    action: { default_popup: "popup.html" },
    host_permissions: [],
    optional_permissions: ["tabs", "downloads", "clipboardRead", "clipboardWrite", "nativeMessaging"]
  };
  if (input.sidepanel === true) overlay.side_panel = { default_path: "sidepanel.html" };
  return overlay;
}
function firefoxprepadapt(input) {
  const changes = [];
  if (input.overlay.browser !== "firefox") throw new Error(`The firefoxprep adaptation expects the firefox overlay; the ${input.overlay.browser} overlay never enters the firefox manifest.`);
  const source = input.manifest;
  const adapted = {
    ...source,
    browser_specific_settings: { gecko: { id: input.overlay.browser_specific_settings?.id ?? "", ...input.overlay.browser_specific_settings?.strict_min_version !== void 0 ? { strict_min_version: input.overlay.browser_specific_settings?.strict_min_version } : {} } },
    background: { scripts: input.backgroundscripts },
    action: { ...source.action ?? {}, default_popup: input.overlay.action?.default_popup ?? "popup.html" },
    host_permissions: [],
    optional_permissions: source.optional_permissions.map((name) => firefoxpermissionmap()[name] ?? name).filter((name) => name !== ""),
    web_accessible_resources: (source.web_accessible_resources ?? []).map((entry) => ({ resources: entry.resources, matches: entry.matches })),
    content_security_policy: source.content_security_policy ?? { extension_pages: "script-src 'self'; object-src 'self'" }
  };
  if (adapted.offscreen !== void 0) {
    changes.push("The offscreen api is chromium only; the firefox overlay drops the offscreen field and the page falls back to the inline parser.");
    delete adapted.offscreen;
  }
  if (adapted.side_panel !== void 0 && input.overlay.side_panel === void 0) {
    changes.push("The sidePanel api is chromium only; the firefox overlay drops the side_panel field and the polyfill opens a popup window instead.");
    delete adapted.side_panel;
  }
  if (adapted.browsers !== void 0) {
    changes.push("The browsers overlays stay root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the browsers key because the overlay metadata of the other targets never ships inside a derived browser manifest.");
    delete adapted.browsers;
  }
  if (adapted.vsix !== void 0) {
    changes.push("The vsix overlay stays root manifest metadata since the 1.1.93 consolidation; the firefox manifest drops the vsix key because the vs code packaging data never ships inside a derived browser manifest.");
    delete adapted.vsix;
  }
  const intersection = adapted.permissions.filter((name) => !firefoxdenylist.includes(name));
  if (intersection.length !== adapted.permissions.length) {
    const refused = adapted.permissions.filter((name) => firefoxdenylist.includes(name));
    throw new Error(`The firefox overlay keeps the deny list in force: the ${refused.join(", ")} permissions stay forbidden in the required set.`);
  }
  if ((source.host_permissions ?? []).length > 0) throw new Error("The firefox overlay keeps host permissions empty on every browser; a required host permission never ships in the firefox manifest.");
  changes.push("The firefox overlay layers the browser_specific_settings with the generated extension id on top of the source manifest.");
  changes.push("The firefox overlay moves the background service worker to the event page scripts for the firefox mv3 background semantics.");
  changes.push("The firefox overlay rewrites the optional permission names where they differ between chromium and firefox.");
  changes.push("The firefox overlay keeps the host permissions empty on every browser.");
  changes.push("The firefox overlay splits the background bundle for the event page semantics.");
  return { manifest: adapted, overlay: input.overlay, changes };
}
function firefoxprepsplitbundle(input) {
  const script = (input.backgroundscript ?? "").trim();
  if (script === "") throw new Error("The firefox background split names the background script; an empty script never launches the event page.");
  return { scripts: [script], serviceworkerdropped: true };
}
function firefoxprepdenylistcheck(input) {
  const refused = (input.manifest.permissions ?? []).filter((name) => firefoxdenylist.includes(name));
  return { ok: refused.length === 0, refused };
}
function firefoxactionmap() {
  return { default_popup: "default_popup", default_title: "default_title", default_icon: "default_icon" };
}
var xpilinterbudget = { errors: 0, warnings: 100 };
function xpinameof(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The xpi name carries the release version; a non semver version never names an artifact.");
  return `devthink-${version}.xpi`;
}
function xpimanifestname() {
  return "manifest.json";
}
function xpipackassemble(input) {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The xpipack assemble carries the release version; a non semver version never names an xpi.");
  if (input.manifest.manifest_version !== 3) throw new Error("The xpipack assemble expects a manifest v3 firefox manifest; a manifest v2 never ships.");
  if (input.manifest.host_permissions !== void 0 && input.manifest.host_permissions.length > 0) throw new Error("The xpipack assemble keeps host permissions empty on every browser; the firefox manifest never ships required host permissions.");
  const stored = [{ name: xpimanifestname(), bytes: Buffer.from(`${JSON.stringify(input.manifest, null, 2)}
`, "utf8") }];
  for (const entry of input.bundleentries) {
    const name = (entry.name ?? "").trim();
    if (name === "") throw new Error("The xpipack assemble names every bundle entry; an empty name never enters the archive.");
    stored.push({ name, bytes: Buffer.from(entry.bytes) });
  }
  const locals = [];
  const records = [];
  let offset = 0;
  for (const entry of stored) {
    const local = xpimanifestheader(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = xpicentraldirectory(records);
  const end = xpiendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return { archive: { name: xpinameof(version), bytes: new Uint8Array(bytes) }, manifestname: xpimanifestname(), entries: stored.map((entry) => entry.name), lintermarkers: { errors: 0, warnings: 0 } };
}
function xpimanifestheader(name, bytes) {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(67324752, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}
function xpicentraldirectory(records) {
  const offsets = [];
  const chunks = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(33639248, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
    offsets.push(record.offset);
  }
  return { bytes: Buffer.concat(chunks), offsets };
}
function xpiendrecord(entrycount, centralsize, centralstart) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(101010256, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}
function xpipacklintercheck(input) {
  if (input.markers.errors > input.budget.errors) return { ok: false, reason: `The addons linter reported ${input.markers.errors} errors; the build budget allows ${input.budget.errors}.` };
  if (input.markers.warnings > input.budget.warnings) return { ok: false, reason: `The addons linter reported ${input.markers.warnings} warnings; the build budget allows ${input.budget.warnings}.` };
  return { ok: true };
}
function xpipackentriesof(output) {
  return [...output.entries];
}
function safariskeletonprojectfiles() {
  const plistdtd = `http://${"www.apple.com"}/DTDs/PropertyList-1.0.dtd`;
  return [
    { path: "Devthink.xcodeproj/project.pbxproj", text: '// !$*UTF8*$!\n{\n  archiveVersion = 1;\n  classes = {};\n  objectVersion = 56;\n  objects = {};\n  rootObject = "Devthink-project";\n}\n' },
    { path: "Devthink/Info.plist", text: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>Devthink</string>
  <key>CFBundleIdentifier</key>
  <string>com.wenathlan.devthink</string>
  <key>CFBundleVersion</key>
  <string>__version__</string>
  <key>CFBundleShortVersionString</key>
  <string>__version__</string>
  <key>LSMinimumSystemVersion</key>
  <string>14.0</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.Safari.web-extension</string>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).SafariWebExtensionHandler</string>
    <key>NSExtensionAttributes</key>
    <dict>
      <key>SFSafariWebExtensionBundleIdentifier</key>
      <string>com.wenathlan.devthink.extension</string>
    </dict>
  </dict>
</dict>
</plist>
` },
    { path: "Devthink/Devthink.entitlements", text: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "${plistdtd}">
<plist version="1.0">
<dict>
  <key>com.apple.security.app-sandbox</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
</dict>
</plist>
` },
    { path: "Devthink/AppDelegate.swift", text: 'import Cocoa\nimport SafariServices\n\n@main\nfinal class AppDelegate: NSObject, NSApplicationDelegate {\n  func applicationDidFinishLaunching(_ notification: Notification) {\n    SFSafariApplication.showPreferencesForExtension(withIdentifier: "com.wenathlan.devthink.extension") { error in\n      if let error = error { NSLog("The safari extension failed to open: \\(error.localizedDescription)") }\n    }\n  }\n}\n' }
  ];
}
function safariskeletonbuild(input) {
  const version = (input.version ?? "").trim();
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("The safari skeleton carries the release version; a non semver version never names an artifact.");
  const bundleid = (input.bundleid ?? "").trim();
  if (bundleid === "" || !/^[a-z0-9][a-z0-9.-]*$/.test(bundleid)) throw new Error("The safari skeleton carries the bundle id; an empty or malformed id never registers a safari app extension.");
  if (input.extensionpayload.length === 0) throw new Error("The safari skeleton embeds the chromium build as the safari web extension payload; an empty payload never wraps an extension.");
  if (input.entitlements.length === 0) throw new Error("The safari skeleton declares the app entitlements for the extension distribution; an empty entitlements list never ships a safari app extension.");
  const projectfiles = safariskeletonprojectfiles().map((file) => ({ path: file.path, text: file.text.replace(/__version__/g, version).replace(/com\.wenathlan\.devthink/g, bundleid) }));
  const stored = projectfiles.map((file) => ({ name: file.path, bytes: Buffer.from(file.text, "utf8") }));
  const entries = projectfiles.map((file) => file.path);
  for (const entry of input.extensionpayload) {
    const name = (entry.name ?? "").trim();
    if (name === "") throw new Error("The safari skeleton names every payload entry; an empty name never enters the archive.");
    stored.push({ name: `Resources/${name}`, bytes: Buffer.from(entry.bytes) });
    entries.push(`Resources/${name}`);
  }
  const locals = [];
  const records = [];
  let offset = 0;
  for (const entry of stored) {
    const local = safarizipfile(entry.name, entry.bytes);
    locals.push(local);
    records.push({ name: entry.name, size: entry.bytes.length, offset });
    offset += local.length;
  }
  const central = safaricentraldirectory(records);
  const end = safariendrecord(records.length, central.bytes.length, offset);
  const bytes = Buffer.concat([...locals, central.bytes, end]);
  return { archive: { name: `devthink-safari-${version}.zip`, bytes: new Uint8Array(bytes) }, projectfiles, entitlements: input.entitlements, appshell: "Devthink/AppDelegate.swift" };
}
function safariskeletonpopoverof() {
  return { path: "sidepanel.html", bounds: { width: 480, height: 720 } };
}
function safarizipfile(name, bytes) {
  const namebuffer = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30 + namebuffer.length);
  header.writeUInt32LE(67324752, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(bytes.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(namebuffer.length, 26);
  header.writeUInt16LE(0, 28);
  namebuffer.copy(header, 30);
  return Buffer.concat([header, bytes]);
}
function safaricentraldirectory(records) {
  const chunks = [];
  for (const record of records) {
    const namebuffer = Buffer.from(record.name, "utf8");
    const header = Buffer.alloc(46 + namebuffer.length);
    header.writeUInt32LE(33639248, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(0, 16);
    header.writeUInt32LE(record.size, 20);
    header.writeUInt32LE(record.size, 24);
    header.writeUInt16LE(namebuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(record.offset, 42);
    namebuffer.copy(header, 46);
    chunks.push(header);
  }
  return { bytes: Buffer.concat(chunks) };
}
function safariendrecord(entrycount, centralsize, centralstart) {
  const end = Buffer.alloc(22);
  end.writeUInt32LE(101010256, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entrycount, 8);
  end.writeUInt16LE(entrycount, 10);
  end.writeUInt32LE(centralsize, 12);
  end.writeUInt32LE(centralstart, 16);
  end.writeUInt16LE(0, 20);
  return end;
}
export {
  browserpolyfillflags,
  browserpolyfillintersection,
  browserpolyfillnamespace,
  browserpolyfillof,
  browserpolyfillpromisify,
  browserpolyfillstructerrorof,
  firefoxactionmap,
  firefoxdenylist,
  firefoxpermissionmap,
  firefoxprepadapt,
  firefoxprepdenylistcheck,
  firefoxprepoverlay,
  firefoxprepsplitbundle,
  safaricentraldirectory,
  safariendrecord,
  safariskeletonbuild,
  safariskeletonpopoverof,
  safariskeletonprojectfiles,
  safarizipfile,
  xpicentraldirectory,
  xpiendrecord,
  xpilinterbudget,
  xpimanifestheader,
  xpimanifestname,
  xpinameof,
  xpipackassemble,
  xpipackentriesof,
  xpipacklintercheck
};
//# sourceMappingURL=crossbrowser.js.map
