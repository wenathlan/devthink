/** Style: DevThink OS label table — the read-only data layer of the os
 * shell and the app surfaces (everything the chat label table and the copy
 * store do not already own: the chat rides chatlabels.ts, the settings and
 * auth surfaces ride copy.ts). The owner doctrine: the interface never
 * hardcodes information in components; every label, placeholder, aria word,
 * toast, empty-state line, tooltip and tuning row of the os surfaces lives
 * here as a typed seed row, the components read through the typed
 * accessors, and the same rows answer the paired database endpoint when it
 * comes online (the offline seeds are the static build's answer, the
 * chatlabels precedent). Nothing is written to the visitor device. */

/* -------------------------------- strings ------------------------------- */

/** one interface string row: the id is the dot address the components
 * quote, the text is the exact copy the surface renders ({token} slots are
 * filled by the caller with .replace, the chatlabels grammar). */
export type OsStringRow = { id: string; text: string };

const seedOsStrings: OsStringRow[] = [
  /* ------------------------------ shell chrome ---------------------------- */
  { id: "shell.start.aria", text: "DevThink start menu" },
  { id: "shell.pins.aria", text: "Pinned apps" },
  { id: "shell.tray.paired", text: "paired" },
  { id: "shell.tray.localOnly", text: "local only" },
  { id: "shell.tray.quick.aria", text: "Quick settings" },
  { id: "shell.tray.calendar.aria", text: "Calendar" },
  { id: "shell.start.close.aria", text: "Close the start menu" },
  { id: "shell.start.dialog.aria", text: "Start menu" },
  { id: "shell.start.search.placeholder", text: "Search apps" },
  { id: "shell.start.search.aria", text: "Search apps" },
  { id: "shell.start.clear.aria", text: "Clear the search" },
  { id: "shell.start.label.pinned", text: "pinned" },
  { id: "shell.start.label.results", text: "results" },
  { id: "shell.start.label.recommended", text: "recommended" },
  { id: "shell.start.empty", text: "No app matches “{query}”." },
  { id: "shell.start.wordmark", text: "devthink" },
  { id: "shell.start.footer", text: "local OS" },
  { id: "shell.control.footer", text: "provider credentials stay in " },

  /* -------------------------------- alt tab ------------------------------- */
  { id: "alttab.dialog.aria", text: "Task switcher" },
  { id: "alttab.list.aria", text: "Open windows" },
  { id: "alttab.state.minimized", text: "minimized" },
  { id: "alttab.state.open", text: "open" },

  /* ------------------------------- jump menu ------------------------------ */
  { id: "jump.openWindow", text: "Open window" },
  { id: "jump.openApp", text: "Open {app}" },
  { id: "jump.openAppSite", text: "Open {app} site" },
  { id: "jump.unpin", text: "Unpin from taskbar" },
  { id: "jump.pin", text: "Pin to taskbar" },

  /* ------------------------------ tray flyouts ---------------------------- */
  { id: "tray.quick.heading", text: "quick settings" },
  { id: "tray.tile.wifi", text: "wifi" },
  { id: "tray.tile.bluetooth", text: "bluetooth" },
  { id: "tray.tile.data", text: "cellular data" },
  { id: "tray.tile.night", text: "night light" },
  { id: "tray.tile.theme", text: "theme" },
  { id: "tray.volume.aria", text: "Volume" },
  { id: "tray.brightness.aria", text: "Brightness" },
  { id: "tray.calendar.prev", text: "Previous month" },
  { id: "tray.calendar.next", text: "Next month" },

  /* ----------------------------- window chrome ---------------------------- */
  { id: "win.lockup", text: "DevThink" },
  { id: "win.caption.minimize", text: "Minimize" },
  { id: "win.caption.maximize", text: "Maximize" },
  { id: "win.caption.restore", text: "Restore" },
  { id: "win.caption.close", text: "Close window" },
  { id: "win.snap.left.aria", text: "Snap left" },
  { id: "win.snap.right.aria", text: "Snap right" },
  { id: "win.snap.layouts.aria", text: "Snap layouts" },
  { id: "win.zone.left", text: "snap left half" },
  { id: "win.zone.right", text: "snap right half" },
  { id: "win.zone.tl", text: "snap top left quarter" },
  { id: "win.zone.tr", text: "snap top right quarter" },
  { id: "win.zone.bl", text: "snap bottom left quarter" },
  { id: "win.zone.br", text: "snap bottom right quarter" },
  { id: "win.zone.free", text: "snap column zone" },
  { id: "win.layout.halves", text: "side by side" },
  { id: "win.layout.thirdsLeft", text: "three zones left, full right" },
  { id: "win.layout.thirdsRight", text: "full left, three zones right" },
  { id: "win.layout.quarters", text: "quarters" },
  { id: "win.layout.focusLeft", text: "two zones left, full right" },
  { id: "win.layout.focusRight", text: "full left, two zones right" },

  /* -------------------------------- desktop ------------------------------- */
  { id: "desktop.aria", text: "DevThink desktop" },
  { id: "desktop.logoTitle", text: "DevThink" },
  { id: "desktop.wordmark", text: "DevThink" },
  { id: "desktop.tagline", text: "local OS — chat first" },
  { id: "desktop.menu.label", text: "Desktop menu" },
  { id: "desktop.menu.view", text: "View" },
  { id: "desktop.menu.view.medium", text: "medium icons" },
  { id: "desktop.menu.view.large", text: "large icons" },
  { id: "desktop.menu.view.reset", text: "reset layout" },
  { id: "desktop.menu.sort", text: "Sort by" },
  { id: "desktop.menu.sort.name", text: "name" },
  { id: "desktop.menu.sort.kind", text: "kind" },
  { id: "desktop.menu.sort.original", text: "original spots" },
  { id: "desktop.menu.refresh", text: "Refresh" },
  { id: "desktop.menu.display", text: "Display settings" },
  { id: "desktop.menu.open", text: "Open" },
  { id: "desktop.menu.openWindow", text: "Open in new window" },

  /* ---------------------------- command palette --------------------------- */
  { id: "palette.dialog.aria", text: "Command palette" },
  { id: "palette.search.placeholder", text: "Search DevThink commands" },
  { id: "palette.search.aria", text: "Search DevThink commands" },
  { id: "palette.close.aria", text: "Close the command palette" },
  { id: "palette.group", text: "workspace commands" },
  { id: "palette.empty", text: "no command matches that search" },

  /* ------------------------------- boot face ------------------------------ */
  { id: "boot.hello", text: "hello" },
  { id: "boot.hint", text: "Press any key" },
  { id: "boot.welcome", text: "Welcome" },
  { id: "boot.avatarFallback", text: "D" },
  { id: "boot.name.placeholder", text: "Display name" },
  { id: "boot.name.aria", text: "Display name" },
  { id: "boot.signin", text: "Sign in" },
  { id: "boot.localIdentity", text: "Local identity" },

  /* ---------------------------- workspace toasts --------------------------- */
  { id: "panel.toast.paired", text: "Local DevThink workspace paired." },
  {
    id: "panel.toast.pairingHint",
    text: "Open a CLI invitation link or use manual setup to provide the local connection details.",
  },
  {
    id: "panel.toast.pairingFailed",
    text: "The local pairing could not be completed. Confirm the CLI gateway is running, the page origin is allowed, and the code has not expired.",
  },
  { id: "panel.toast.revoked", text: "Local browser pairing revoked." },
  { id: "panel.toast.pairFirstPrefs", text: "Pair the local CLI before saving shared workbench preferences." },
  { id: "panel.toast.prefRejected", text: "The local gateway could not save that preference." },
  { id: "panel.toast.pairFirstId", text: "Pair the local CLI before changing the shared public ID." },
  { id: "panel.toast.publicIdUpdated", text: "Shared public ID updated in the local DevThink identity." },
  {
    id: "panel.toast.publicIdInvalid",
    text: "Use 10-15 lowercase letters or numbers, starting with a letter.",
  },
  {
    id: "panel.toast.routeOpened",
    text: "Local route opened. Add a gateway URL to persist it through DevThink CLI.",
  },
  { id: "panel.toast.commandUnavailable", text: "Command is not available in this local workspace." },

  /* ----------------------------- file explorer ---------------------------- */
  { id: "explorer.tools.aria", text: "Explorer tools" },
  { id: "explorer.nav.back", text: "Back" },
  { id: "explorer.nav.forward", text: "Forward" },
  { id: "explorer.nav.up", text: "Up" },
  { id: "explorer.nav.refresh", text: "Refresh" },
  { id: "explorer.address.aria", text: "Address" },
  { id: "explorer.search.placeholder", text: "Search" },
  { id: "explorer.search.aria", text: "Search this folder" },
  { id: "explorer.commands.aria", text: "Explorer commands" },
  { id: "explorer.new", text: "New" },
  { id: "explorer.sort", text: "Sort" },
  { id: "explorer.sortBy", text: "Sort by {mode}" },
  { id: "explorer.view", text: "View" },
  { id: "explorer.viewAs", text: "View as {mode}" },
  { id: "explorer.disabled.clipboard", text: "The clipboard rides the database wave" },
  { id: "explorer.disabled.share", text: "Sharing rides the pairing wave" },
  { id: "explorer.disabled.recycle", text: "The recycle bin rides the database wave" },
  { id: "explorer.disabled.more", text: "More rides the database wave" },
  { id: "explorer.quickAccess", text: "Quick access" },
  { id: "explorer.thisPc", text: "This PC" },
  { id: "explorer.storagePlatforms", text: "Storage platforms" },
  { id: "explorer.platform.pair", text: "{name} — pair it in the settings drives panel" },
  { id: "explorer.folderView.aria", text: "Folder view" },
  { id: "explorer.foldersHeading", text: "Folders ({count})" },
  { id: "explorer.devicesHeading", text: "Devices and drives ({count})" },
  { id: "explorer.drive", text: "Drive" },
  { id: "explorer.localDisk", text: "Local disk" },
  { id: "explorer.localDiskMounted", text: "Local disk · mounted" },
  { id: "explorer.capacityAfterMount", text: "capacity answers after mount" },
  {
    id: "explorer.usage.aria",
    text: "Store usage — the one allocation every drive on this machine shares",
  },
  { id: "explorer.records.workspaces", text: "Workspaces" },
  { id: "explorer.records.workspaces.detail", text: "workspace records of this drive" },
  { id: "explorer.records.sessions", text: "Sessions" },
  { id: "explorer.records.sessions.detail", text: "session records of this drive" },
  { id: "explorer.records.messages", text: "Messages" },
  { id: "explorer.records.messages.detail", text: "message records of this drive" },
  { id: "explorer.records.preferences", text: "Preferences" },
  { id: "explorer.records.preferences.detail", text: "preference records of this drive" },
  { id: "explorer.records.mountHint", text: "mount the drive to read its records" },
  { id: "explorer.records.count", text: "{count} records" },
  { id: "explorer.items", text: "{count} items" },
  { id: "explorer.status.item", text: "item" },
  { id: "explorer.status.items", text: "items" },
  { id: "explorer.status.found", text: " found" },
  { id: "explorer.status.selected", text: " · 1 selected" },
  { id: "explorer.viewMode.aria", text: "View mode" },
  { id: "explorer.gridView.aria", text: "Grid view" },
  { id: "explorer.detailsView.aria", text: "Details view" },
  { id: "explorer.filtered", text: "· filtered" },
  { id: "explorer.empty", text: "This folder is empty." },
  { id: "explorer.toast.mountFailed", text: "The drive could not be mounted." },
  { id: "explorer.toast.newDrive", text: "New drive mounted: {label}. It starts empty." },
  { id: "explorer.toast.newDriveFailed", text: "The new drive could not be created on this machine." },
  /* the capacity bar sources: the paired lane answers the real usage and
     the plan quota, the offline surface answers the browser estimate —
     every bar labels its own source honestly */
  { id: "explorer.storage.lane", text: "Infrastructure storage" },
  { id: "explorer.storage.lane.line", text: "{used} used of {quota} plan quota" },
  { id: "explorer.storage.lane.objects", text: "{count} objects on the plan" },
  {
    id: "explorer.storage.lane.aria",
    text: "Infrastructure storage — the usage the server lane answers against the plan quota",
  },
  { id: "explorer.storage.browser", text: "Browser storage" },
  { id: "explorer.storage.browser.line", text: "{line} — this device's honest estimate" },
  {
    id: "explorer.storage.browser.aria",
    text: "Browser storage — the allocation this browser answers for the origin store",
  },
  /* the plan folders lane: the folders this account creates on the
     infrastructure storage — every write rides the real storage lane and
     every state answers its own line (offline, refused, empty) */
  { id: "explorer.newFolder", text: "New folder" },
  { id: "explorer.planHeading", text: "Plan folders ({count})" },
  { id: "explorer.planHeadingPending", text: "Plan folders" },
  { id: "explorer.planFolder.detail", text: "folder kept on the plan" },
  { id: "explorer.planForm.aria", text: "New folder form" },
  { id: "explorer.planName", text: "Folder name" },
  { id: "explorer.planNameHint", text: "Letters, numbers and hyphens only" },
  { id: "explorer.planCreate", text: "Create folder" },
  { id: "explorer.planCreating", text: "Creating folder" },
  { id: "explorer.planCancel", text: "Cancel" },
  { id: "explorer.planOffline", text: "The storage lane is offline" },
  { id: "explorer.planEmpty", text: "No folders yet" },
  { id: "explorer.planExists", text: "That folder name exists" },
  { id: "explorer.toast.folderCreated", text: "Folder created on the plan: {name}" },

  /* ------------------------------ gateway view ---------------------------- */
  { id: "gateway.eyebrow", text: "devthink gateway" },
  { id: "gateway.lede", text: "Every provider behind one local door" },
  { id: "gateway.footer", text: "Credentials stay with the CLI" },
  { id: "gateway.badge.paused", text: "paused" },
  { id: "gateway.badge.live", text: "live" },
  { id: "gateway.modelsLine", text: "{count} models · {meta} meta" },
  { id: "gateway.versionNotFound", text: "version not found" },
  {
    id: "gateway.versionNotFoundLede",
    text: "The requested version stays outside the shipped catalog; open the gateway overview for the configured versions.",
  },
  { id: "gateway.overview", text: "gateway overview" },
  { id: "gateway.modelsConfigured", text: "models {count} configured" },
  { id: "gateway.policyTitle", text: "policy auth, rotation and retry" },
  { id: "gateway.authLabel", text: "auth" },
  { id: "gateway.auth.required", text: " required" },
  { id: "gateway.auth.optional", text: " optional" },
  { id: "gateway.keyless", text: "keyless" },
  { id: "gateway.rotationLabel", text: "rotation" },
  { id: "gateway.fixed", text: "fixed" },
  { id: "gateway.rotationLine", text: "{models} models every {messages} message" },
  { id: "gateway.rotationLinePlural", text: "{models} models every {messages} messages" },
  { id: "gateway.defaultModel", text: "the default model answers every call" },
  { id: "gateway.retryLabel", text: "retry" },
  { id: "gateway.crossProvider", text: "cross-provider fallback" },
  { id: "gateway.maxRetries", text: "max {count}" },
  { id: "gateway.retryOn", text: "retry on {statuses}" },
  { id: "gateway.noStatusRetries", text: "no status retries" },
  { id: "gateway.metaLabel", text: "meta" },
  { id: "gateway.masked", text: "upstream models masked" },
  { id: "gateway.shown", text: "upstream models shown" },
  { id: "gateway.routesTitle", text: "routes 7 per version" },
  { id: "gateway.routePost", text: "post /api/{version}" },
  { id: "gateway.routeInfo", text: "get /api/{version}/{route} returns the version info descriptor." },
  { id: "gateway.versionMissing", text: "version {id} not found" },
  {
    id: "gateway.shippedCount",
    text: "The shipped catalog carries {count} versions; the requested id stays outside it.",
  },
  { id: "gateway.versionsTitle", text: "versions {count} configured" },
  { id: "gateway.thinkingTitle", text: "thinking levels the 2-calls pattern" },
  { id: "gateway.authTitle", text: "auth methods 12 supported" },
  { id: "gateway.usageTitle", text: "library usage" },
  { id: "gateway.structureTitle", text: "structure the library at root, the design in web" },
  {
    id: "gateway.explorerSummary",
    text: "the loaded definition — the compact summary of the shipped catalog",
  },
  { id: "gateway.openDetail", text: "open the {id} detail" },
  { id: "gateway.thinking.none", text: "no thinking" },
  { id: "gateway.thinking.minimal", text: "quick reasoning" },
  { id: "gateway.thinking.low", text: "light reasoning" },
  { id: "gateway.thinking.medium", text: "balanced" },
  { id: "gateway.thinking.high", text: "deep reasoning default" },
  { id: "gateway.thinking.xhigh", text: "extra deep" },
  { id: "gateway.thinking.max", text: "maximum" },

  /* -------------------------------- console ------------------------------- */
  { id: "console.nav.aria", text: "Console sections" },
  { id: "console.section.terminal", text: "Terminal" },
  { id: "console.section.boot", text: "Boot stages" },
  { id: "console.section.reference", text: "Command reference" },
  { id: "console.status.paired", text: "Gateway paired" },
  { id: "console.status.static", text: "Static catalog" },
  { id: "console.keys", text: "tab completes, arrows browse, enter runs" },
  { id: "console.boot.copy", text: "Banner, config and the engine arm stage by stage, the gateway, mcp and palette surfaces arm together, and ready closes the walk." },
  {
    id: "console.boot.graphLabel",
    text: "the boot stages of the cli riding the graph runner, one wave per stage",
  },
  { id: "terminal.title", text: "devthink terminal" },
  { id: "terminal.output.aria", text: "devthink console output" },
  {
    id: "terminal.input.aria",
    text: "terminal command input; arrow keys browse history, tab completes",
  },

  /* -------------------------------- history ------------------------------- */
  { id: "history.nav.aria", text: "History sections" },
  { id: "history.navrow", text: "Release ladder" },
  { id: "history.note.stamps", text: "Every release stamps a rung" },
  { id: "history.note.chain", text: "The full chain lives in the changelog" },
  { id: "history.ladder.title", text: "Release ladder" },
  { id: "history.ladder.milestones", text: "Milestones" },
  { id: "history.ladder.empty", text: "No rungs stamped yet" },
  { id: "history.ladder.loading", text: "Loading the ladder" },
  { id: "history.ladder.latest", text: "Latest" },
  { id: "history.facts.rungs", text: "Rungs stamped" },
  { id: "history.facts.chain", text: "Chain" },

  /* -------------------------------- projects ------------------------------ */
  { id: "projects.nav.aria", text: "Projects sections" },
  { id: "projects.navrow", text: "Workspaces" },
  {
    id: "projects.toast.unavailable",
    text: "Projects could not be read from the local gateway, showing browser-local workspaces",
  },
  { id: "projects.note.paired", text: "Paired gateway" },
  { id: "projects.note.local", text: "Browser-local store" },
  { id: "projects.note.ids", text: "Ids ride the cli and the browser urls" },
  { id: "projects.card.title", text: "Workspace ledger" },
  { id: "projects.refresh.aria", text: "Refresh workspaces" },
  { id: "projects.refresh", text: "Refresh" },
  { id: "projects.latest", text: "Latest" },
  { id: "projects.session", text: "with {count} session" },
  { id: "projects.empty", text: "No local project yet. Open a workspace from home or pair the cli." },
  { id: "projects.loading", text: "Loading the workspace ledger" },

  /* ------------------------------- providers ------------------------------ */
  { id: "providers.nav.aria", text: "Providers sections" },
  { id: "providers.navrow.index", text: "Providers" },
  { id: "providers.navrow.credentials", text: "Credentials" },
  { id: "providers.toast.loadFailed", text: "The paired gateway could not load providers." },
  { id: "providers.toast.activationRejected", text: "Provider activation was rejected by the local gateway." },
  { id: "providers.toast.enterCredential", text: "Enter a provider credential before saving it locally." },
  { id: "providers.toast.selected", text: "{id} is selected for this browser-local workspace." },
  { id: "providers.toast.activated", text: "{id} is now active in the local cli." },
  {
    id: "providers.confirm.store",
    text: "Store this {id} credential only in this browser? It will never be synced to the cli or a remote adapter.",
  },
  { id: "providers.toast.saved", text: "{id} credential saved only in this browser." },
  { id: "providers.toast.removed", text: "{id} browser-local credential removed." },
  { id: "providers.note.paired", text: "Paired gateway" },
  { id: "providers.note.local", text: "Browser-local selection" },
  { id: "providers.note.cliOnly", text: "Credentials remain cli-only" },
  { id: "providers.index.title", text: "Provider index" },
  { id: "providers.index.refresh.aria", text: "Refresh providers" },
  { id: "providers.index.refresh", text: "Refresh" },
  { id: "providers.row.configuredBy", text: ", configured by " },
  { id: "providers.row.active", text: "Active" },
  { id: "providers.row.use", text: "Use provider" },
  { id: "providers.row.activeAria", text: "{id} is the active provider" },
  { id: "providers.row.useAria", text: "Use {id} as the active provider" },
  { id: "providers.card.title", text: "Browser-local credential" },
  {
    id: "providers.card.copy",
    text: "This explicit opt-in stores a credential only in this browser. It is not displayed after saving, never goes to the cli gateway, and is excluded from every sync adapter.",
  },
  { id: "providers.card.provider", text: "Provider" },
  { id: "providers.card.credential", text: "Credential" },
  { id: "providers.card.placeholder", text: "paste only if this device is trusted" },
  { id: "providers.card.save", text: "Save to this browser" },
  { id: "providers.card.remove", text: "Remove local credential" },
  {
    id: "providers.card.flow",
    text: "For the recommended device flow, use devthink auth login <provider> --token <key>. A cli credential never enters this web page.",
  },
  { id: "providers.card.flow.pre", text: "For the recommended device flow, use " },
  { id: "providers.card.flow.code", text: "devthink auth login <provider> --token <key>" },
  { id: "providers.card.flow.post", text: ". A cli credential never enters this web page." },

  /* --------------------------------- usage -------------------------------- */
  { id: "usage.nav.aria", text: "Usage sections" },
  { id: "usage.navrow", text: "Ledger" },
  { id: "usage.toast.unavailable", text: "Usage unavailable from the gateway, showing browser counts" },
  { id: "usage.empty.title", text: "Ledger" },
  { id: "usage.empty.copy", text: "No usage yet. Open a workspace or pair the cli to fill the ledger." },
  { id: "usage.note.paired", text: "Paired gateway" },
  { id: "usage.note.local", text: "Browser cache" },
  { id: "usage.note.honest", text: "Durable counts, no billing claims" },
  { id: "usage.figlabel", text: "Messages on this device" },
  { id: "usage.measure.projects", text: "Projects" },
  { id: "usage.measure.sessions", text: "Sessions" },
  { id: "usage.measure.tabs", text: "Tabs" },

  /* ---------------------------------- docs -------------------------------- */
  { id: "docs.nav.aria", text: "Docs sections" },
  { id: "docs.section.quickstart", text: "Quickstart" },
  { id: "docs.section.boundary", text: "Boundary" },
  { id: "docs.section.http", text: "HTTP" },
  { id: "docs.section.modules", text: "Modules" },
  { id: "docs.quickstart.copy", text: "Install the CLI, init the workspace, open the help" },
  { id: "docs.quickstart.prefs", text: "Preferences ride " },
  { id: "docs.quickstart.credentials", text: ". Credentials ride " },
  { id: "docs.boundary.copy1", text: "Provider neutral CLI. Local sessions, streaming, plugins, loopback API." },
  { id: "docs.boundary.copy2", text: "User provided keys only. No cookie capture, no captcha bypass." },
  { id: "docs.http.copy", text: "The server binds the loopback. The port is drawn when none is set." },
  { id: "docs.codebar", text: "console" },
  { id: "docs.copy.aria", text: "Copy commands" },
  { id: "docs.copy.copied", text: "Copied" },
  { id: "docs.copy.copy", text: "Copy" },
  { id: "docs.modules.empty", text: "The catalog has not answered yet" },

  /* -------------------------------- notfound ------------------------------ */
  { id: "notfound.aria", text: "Page not found" },
  { id: "notfound.eyebrow", text: "devthink · 404" },
  {
    id: "notfound.line",
    text: "this address leads nowhere — nothing was lost; the workbench is one step away.",
  },
  { id: "notfound.back.aria", text: "Back home" },
  { id: "notfound.back", text: "back home" },

  /* ------------------------------- calculator ----------------------------- */
  { id: "calc.nav.aria", text: "Calculator modes" },
  { id: "calc.mode.standard", text: "Standard" },
  { id: "calc.error", text: "The expression could not be evaluated" },
  { id: "calc.history.aria", text: "History" },
  { id: "calc.history.title", text: "History" },
  { id: "calc.history.empty", text: "Nothing yet" },
  { id: "calc.key.digit", text: "digit {key}" },
  { id: "calc.key.backspace", text: "backspace" },
  { id: "calc.key.memoryClear", text: "memory clear" },
  { id: "calc.key.memoryRecall", text: "memory recall" },
  { id: "calc.key.memoryAdd", text: "memory add" },
  { id: "calc.key.memorySubtract", text: "memory subtract" },
  { id: "calc.key.equals", text: "equals" },

  /* --------------------------------- games -------------------------------- */
  { id: "games.nav.aria", text: "Runner filters" },
  { id: "games.filter.all", text: "All binaries" },
  { id: "games.filter.game", text: "Games" },
  { id: "games.filter.application", text: "Applications" },
  { id: "games.list.title", text: "Runner binaries" },
  { id: "games.list.empty", text: "No binaries in this filter" },
  { id: "games.list.loading", text: "Loading the catalog" },
  { id: "games.list.launch", text: "Launch" },
  { id: "games.list.launchAria", text: "Launch {title}" },
  { id: "games.boundary.title", text: "Runner boundary" },
  {
    id: "games.boundary.copy",
    text: "Launches queue over the gateway. Nothing installs on this machine.",
  },

  /* ------------------------------- the studios ---------------------------- */
  { id: "studios.loading", text: "Loading the catalog" },
  { id: "studios.engine", text: "Engine" },
  { id: "studios.enginePending", text: "The catalog has not answered the engine yet" },
  { id: "studios.engineLede", text: "Renders queue over the gateway to " },
  { id: "image.nav.aria", text: "Image studio sections" },
  { id: "image.navrow", text: "Stills" },
  { id: "image.stills.title", text: "Stills" },
  { id: "image.stills.empty", text: "No stills in the catalog" },
  { id: "image.stills.render", text: "Render" },
  { id: "image.stills.renderAria", text: "Render {title}" },
  { id: "image.stills.unknownSize", text: "Unknown size" },
  { id: "image.stills.mp", text: "{value} mp" },
  { id: "image.queueNote", text: "render requested from the image studio for {title}" },
  { id: "image.engineTail", text: ", the cadria engine." },
  { id: "audio.nav.aria", text: "Audio sections" },
  { id: "audio.navrow", text: "Tracks" },
  { id: "audio.tracks.title", text: "Tracks" },
  { id: "audio.tracks.empty", text: "No tracks in the catalog" },
  { id: "audio.tracks.queue", text: "Queue" },
  { id: "audio.tracks.queueAria", text: "Queue {title}" },
  { id: "audio.tracks.minutes", text: "{value} min" },
  { id: "audio.queueNote", text: "render requested from the music studio for {title}" },
  { id: "audio.engineTail", text: ", the debonair engine." },
  { id: "video.nav.aria", text: "Video sections" },
  { id: "video.navrow", text: "Assets" },
  { id: "video.assets.title", text: "Assets" },
  { id: "video.assets.empty", text: "No assets in the catalog" },
  { id: "video.assets.render", text: "Render" },
  { id: "video.assets.renderAria", text: "Render {title}" },
  { id: "video.queueNote", text: "render requested from the video studio for {title}" },
  { id: "video.stage.aria", text: "Video stage" },
  { id: "video.stage.title", text: "Stage" },
  { id: "video.stage.empty", text: "Open a video file to play it on the studio stage" },
  { id: "video.stage.hint", text: "The file stays on this device: nothing uploads, nothing persists" },
  { id: "video.open", text: "Open" },
  { id: "video.openAria", text: "Open a local video file" },
  { id: "video.playAria", text: "Play" },
  { id: "video.pauseAria", text: "Pause" },
  { id: "video.muteAria", text: "Mute" },
  { id: "video.unmuteAria", text: "Unmute" },
  { id: "video.scrubAria", text: "Playback position" },
  { id: "video.fullscreenAria", text: "Full screen" },
  { id: "video.windowedAria", text: "Exit full screen" },
  { id: "video.engineTail", text: ", the cadria engine." },

  /* ------------------------------- onboarding ----------------------------- */
  { id: "onboarding.aria", text: "devthink onboarding" },
  { id: "onboarding.brand", text: "devthink" },
  { id: "onboarding.caption", text: "onboarding" },
  { id: "onboarding.close.aria", text: "close onboarding" },
  { id: "onboarding.count", text: "step {index} of {total}" },
  { id: "onboarding.skip", text: "skip" },
  { id: "onboarding.back", text: "back" },
  { id: "onboarding.next", text: "next" },
  { id: "onboarding.enter", text: "enter devthink" },

  /* --------------------------------- explore ------------------------------ */
  { id: "explore.nav.constellation", text: "constellation" },
  { id: "explore.nav.family", text: "family" },
  { id: "explore.nav.sections", text: "sections" },
  { id: "explore.nav.modules", text: "modules" },
  { id: "explore.nav.builds", text: "builds" },
  { id: "explore.nav.aria", text: "Site navigation" },
  { id: "explore.eyebrow", text: "devthink · explore" },
  { id: "explore.enter", text: "enter devthink" },
  { id: "explore.hero.aria", text: "DevThink — the launcher of the os" },
  { id: "explore.hero.eyebrow", text: "devthink · explore — the launcher" },
  { id: "explore.hero.title", text: "every surface of the os, one command away" },
  {
    id: "explore.hero.sub",
    text: "the stage reads the whole registry: type, filter, open. the native surfaces and the nine family apps share one field.",
  },
  { id: "explore.waves.sections", text: "02 · the sections" },
  { id: "explore.waves.sectionsMeta", text: "recent · pinned · all apps" },
  { id: "explore.waves.modules", text: "03 · the modules" },
  { id: "explore.waves.modulesMeta", text: "the core catalog" },
  { id: "explore.waves.builds", text: "04 · the builds" },
  { id: "explore.waves.buildsMeta", text: "chromium · firefox · vs code · safari" },
  { id: "explore.waves.defaultCaption", text: "the stage" },
  { id: "explore.modules.cap", text: "the catalog strip" },
  { id: "explore.modules.title", text: "what the platform does" },
  {
    id: "explore.modules.sub",
    text: "the modules of the core catalog — the same rows the panel serves after you enter.",
  },
  { id: "explore.modules.empty", text: "the catalog has not answered yet." },
  { id: "explore.sections.recent.cap", text: "section 01 · recent" },
  { id: "explore.sections.recent.title", text: "recent from the studios" },
  {
    id: "explore.sections.recent.sub",
    text: "the family's own made assets — video, image, 3d and music, straight from the catalog.",
  },
  { id: "explore.sections.recent.empty", text: "the studios have not answered yet." },
  { id: "explore.sections.pinned.cap", text: "section 02 · pinned" },
  { id: "explore.sections.pinned.title", text: "pinned of the os" },
  {
    id: "explore.sections.pinned.sub",
    text: "the surfaces the os itself keeps one click away — the same rows the taskbar pins.",
  },
  { id: "explore.sections.all.cap", text: "section 03 · all apps" },
  { id: "explore.sections.all.title", text: "every app, one field away" },
  {
    id: "explore.sections.all.sub",
    text: "the full registry — native surfaces and family apps, in catalog order.",
  },
  { id: "explore.studio.video", text: "video · cadria" },
  { id: "explore.studio.image", text: "image · cadria" },
  { id: "explore.studio.music", text: "music · debonair" },
  { id: "explore.studio.model3d", text: "3d · cadria" },
  { id: "explore.studio.track", text: "music · katexis" },
  { id: "explore.launch.placeholder", text: "type to open — every surface answers" },
  { id: "explore.launch.search.aria", text: "Search every app of the os" },
  { id: "explore.launch.answer", text: "{count} answer" },
  { id: "explore.launch.answers", text: "{count} answers" },
  { id: "explore.launch.open", text: "open" },
  { id: "explore.launch.filters.aria", text: "Quick filters of the launcher" },
  { id: "explore.launch.scope.all", text: "everything" },
  { id: "explore.launch.scope.native", text: "native" },
  { id: "explore.launch.scope.family", text: "family" },
  { id: "explore.launch.scope.pinned", text: "pinned" },
  { id: "explore.launch.tally", text: "{native} native · {family} family · none of it invented" },
  { id: "explore.launch.waves.caption", text: "01 · the constellation" },
  { id: "explore.launch.waves.meta", text: "{native} native · {family} family" },
  { id: "explore.launch.native.cap", text: "devthink · native" },
  { id: "explore.launch.native.title", text: "the os, its own surfaces" },
  { id: "explore.launch.native.meta", text: "the full rail" },
  { id: "explore.launch.native.metaPartial", text: "{count} of {total} answer" },
  { id: "explore.launch.native.empty", text: "no native surface answers “{query}”." },
  {
    id: "explore.launch.native.resting",
    text: "the native rail rests — the family owns the stage.",
  },
  { id: "explore.launch.family.cap", text: "the family · nine" },
  { id: "explore.launch.family.title", text: "one signal color each" },
  { id: "explore.launch.family.meta", text: "each tile opens its own site" },
  { id: "explore.launch.family.empty", text: "no family app answers “{query}”." },
  {
    id: "explore.launch.family.resting",
    text: "the family grid rests — the native rail owns the stage.",
  },
  { id: "explore.download.cap", text: "the distribution rail" },
  { id: "explore.download.title", text: "take devthink with you" },
  {
    id: "explore.download.sub",
    text: "the same code serves the site, the binary and the extension — every channel ships from the immutable v{version} tag.",
  },
  { id: "explore.download.browse", text: "browse every release" },
  {
    id: "explore.download.provenance",
    text: "— the provenance set (the sbom, the attestations and the artifact manifest) rides beside the artifacts of each tag.",
  },
  { id: "explore.download.chromium", text: "chromium · brave · edge" },
  {
    id: "explore.download.chromium.note",
    text: "the chromium build of the extension. unzip it, open chrome://extensions, turn developer mode on and load the folder unpacked.",
  },
  { id: "explore.download.firefox", text: "firefox" },
  {
    id: "explore.download.firefox.note",
    text: "the firefox build, ready for your signing path — while unsigned, load it temporarily from about:debugging.",
  },
  { id: "explore.download.vscode", text: "vs code" },
  {
    id: "explore.download.vscode.note",
    text: "the workbench vsix — install it from the release through extensions: install from vsix.",
  },
  { id: "explore.download.every", text: "every channel" },
  {
    id: "explore.download.every.note",
    text: "the immutable tag also carries the safari wrapper, the native host template, the source snapshot, the sbom and the attestations.",
  },
  { id: "explore.window.title", text: "explore — devthink" },
  { id: "explore.window.minimize", text: "Minimize the landing" },
  { id: "explore.window.restore", text: "Restore the landing" },
  { id: "explore.window.maximize", text: "Maximize the landing" },
  { id: "explore.window.close", text: "Close and return to the intro" },
  { id: "explore.footer.wordmark", text: "DevThink" },
  { id: "explore.footer.nav.aria", text: "Institutional" },
  { id: "explore.footer.about", text: "about" },
  { id: "explore.footer.terms", text: "terms" },
  { id: "explore.footer.policy", text: "privacy" },
  {
    id: "explore.footer.note",
    text: "exploration is free and reads the public catalog · the local identity of the os is yours: no remote authentication, no telemetry",
  },

  /* ---------------------------------- about ------------------------------- */
  { id: "about.timeline.heading", text: "How the platform moved" },

  /* -------------------------------- guard wall ------------------------------ */
  { id: "guard.wall.aria", text: "Developer tools notice" },
  { id: "guard.wall.title", text: "Developer tools are open" },
  {
    id: "guard.wall.body",
    text: "This workspace pauses its surface while developer tools inspect it. Close the tools and reload the page to continue where you left off.",
  },
  {
    id: "guard.wall.note",
    text: "Nothing was closed and nothing was erased — the session stays intact and one strike report rides to the site api.",
  },
];

export type OsStringId = (typeof seedOsStrings)[number]["id"];

/** osText — the typed string accessor: the dot id quotes the row, the seed
 * answers today and the paired database answers tomorrow. An unknown id
 * renders the empty string (never a crash on the interface). */
export function osText(id: OsStringId): string {
  const row = seedOsStrings.find((entry) => entry.id === id);
  return row ? row.text : "";
}

/* ----------------------------- command palette --------------------------- */

/** one command row of the palette: the id the action dispatches, the label,
 * the detail and the shortcut badge the row renders. */
export type OsPaletteCommand = { id: string; title: string; detail: string; key: string };

const seedOsPaletteCommands: OsPaletteCommand[] = [
  { id: "new", title: "new session", detail: "Create a clean provider-scoped session", key: "⌘ N" },
  { id: "console", title: "open console", detail: "The canonical design of the devthink cli", key: "⌘ C" },
  { id: "gateway", title: "open gateway", detail: "The embedded gateway console of the catalog", key: "⌘ G" },
  { id: "os", title: "open os", detail: "The local os shell of the family", key: "⌘ O" },
  { id: "docs", title: "open docs", detail: "The documentation library of the family", key: "⌘ D" },
  { id: "explore", title: "open explore", detail: "The exploration gallery of the family", key: "⌘ X" },
  { id: "providers", title: "open providers", detail: "Inspect local provider and model choices", key: "⌘ P" },
  { id: "projects", title: "open projects", detail: "Inspect local workspace records", key: "⌘ J" },
  { id: "usage", title: "open usage", detail: "Review compact local usage records", key: "⌘ U" },
  { id: "routes", title: "inspect routes", detail: "Show gateway and stream health", key: "⌘ I" },
  { id: "history", title: "open history", detail: "Review open local session tabs", key: "⌘ H" },
  { id: "settings", title: "open settings", detail: "Pair or revoke a local browser connection", key: "⌘ ," },
];

/** the command rows of the palette, catalog order. */
export function osPaletteCommands(): OsPaletteCommand[] {
  return seedOsPaletteCommands;
}

/* ------------------------------ tray calendar ---------------------------- */

/** the sunday-first weekday letters of the calendar flyout. */
export const seedOsCalendarWeekdays: string[] = ["S", "M", "T", "W", "T", "F", "S"];

/** the weekday letters in order. */
export function osCalendarWeekdays(): string[] {
  return seedOsCalendarWeekdays;
}

/* ------------------------------- providers ------------------------------- */

/** one provider registry row the providers surface renders (the ids mirror
 * the local provider registry; the protocol and env words are interface
 * copy, so the rows live here). */
export type OsProviderRow = { id: string; protocol: string; env: string };

const seedOsProviders: OsProviderRow[] = [
  "openai",
  "zai",
  "anthropic",
  "google",
  "qwen",
  "openrouter",
  "deepseek",
  "groq",
  "mistral",
  "xai",
  "ollama",
  "mimo",
].map((id) => ({ id, protocol: "configured locally", env: "CLI" }));

/** the provider rows, registry order. */
export function osProviders(): OsProviderRow[] {
  return seedOsProviders;
}

/* ------------------------------- onboarding ------------------------------ */

/** one frame of the onboarding tour: the eyebrow, the heading, the body and
 * the registry app id the art tile renders (null = the OS mark). */
export type OsOnboardingStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  app: string | null;
};

const seedOsOnboardingSteps: OsOnboardingStep[] = [
  {
    id: "os",
    eyebrow: "the os",
    title: "One OS, many apps",
    body: "devthink is the family os — sibling apps open as windows inside it, pinned to the taskbar.",
    app: null,
  },
  {
    id: "explore",
    eyebrow: "explore",
    title: "Explore is the free floor",
    body: "the catalog at /explore — every family app answers without an account.",
    app: "explore",
  },
  {
    id: "auth",
    eyebrow: "auth, then panel",
    title: "Auth opens the panel",
    body: "one identity signs everything — /auth hands the session to /panel: chat, projects, studios.",
    app: "panel",
  },
  {
    id: "mcp",
    eyebrow: "mcp",
    title: "MCP is opt-in",
    body: "register an mcp endpoint only when you want one — nothing connects without its probe.",
    app: "settings",
  },
];

/** the onboarding tour frames, walk order. */
export function osOnboardingSteps(): OsOnboardingStep[] {
  return seedOsOnboardingSteps;
}

/* --------------------------------- gateway ------------------------------- */

/** the seven routes every gateway version generates (the engine contract —
 * one handler per route). */
export function osGatewayRoutes(): string[] {
  return ["chat/completions", "completions", "embeddings", "keys", "messages", "models", "responses"];
}

/** one auth method family of the gateway (the examples name the providers
 * the method covers). */
export type OsGatewayAuthMethod = { method: string; examples: string };

const seedOsGatewayAuthMethods: OsGatewayAuthMethod[] = [
  { method: "bearer", examples: "openai nvidia groq mistral deepseek kimi openrouter" },
  { method: "apikeyheader", examples: "anthropic x-api-key gemini x-goog-api-key azure api-key" },
  { method: "queryparam", examples: "legacy google key api_key params" },
  { method: "basic", examples: "generic rest base64 user pass" },
  { method: "oauth2clientcredentials", examples: "ibm watsonx azure entra auth0" },
  { method: "jwtsign", examples: "zhipu bigmodel hs256 keyid secret" },
  { method: "sigv4", examples: "aws bedrock aws4-hmac-sha256" },
  { method: "anonymous", examples: "opencode zen kilo ollama keyless" },
];

/** the auth method families of the gateway, catalog order. */
export function osGatewayAuthMethods(): OsGatewayAuthMethod[] {
  return seedOsGatewayAuthMethods;
}

/** the display copy of one thinking level of the gateway view (an unknown
 * level answers the empty string, the honest fallback of the ledger). */
export function osGatewayThinking(level: string): string {
  const row = seedOsStrings.find((entry) => entry.id === `gateway.thinking.${level}`);
  return row ? row.text : "";
}

/** the library usage block the gateway view renders beside the catalog. */
export const seedOsGatewayUsage = [
  "# scaffold a new gateway",
  "npx @wenathlan/devthink gateway init",
  "",
  "# add a version with any baseurl any models any auth",
  "npx @wenathlan/devthink gateway add v6",
  "",
  "# register keys for rotation",
  "npx @wenathlan/devthink gateway keys v6",
  "",
  "# start the server",
  "npx @wenathlan/devthink gateway serve --port 3001",
  "",
  "# or embed the library",
  'import { createversion, loadconfig } from "@wenathlan/devthink"',
  "const def = await loadconfig()",
  "const handlers = createversion(def.versions.v1)",
  "const response = await handlers.handlechatcompletions(request)",
].join("\n");

/** the library usage block of the gateway view. */
export function osGatewayUsageBlock(): string {
  return seedOsGatewayUsage;
}

/** the merged repository structure the gateway view documents. */
export const seedOsGatewayStructure = `devthink/
  gateway-index.ts          # the library barrel — the ./gateway-lib surface
  engine.ts                 # universal engine — routes, rotation, retry, fallback
  gateway-http.ts           # the http transport — hono server + sse pipeline
  gateway-cli.ts            # the scaffolding cli (init add keys serve export)
  gateway-configloader.ts   # config validation + the standard Sol/config.* probe
  gateway-auth.ts           # the 12 auth methods + key resolution
  database.ts               # prisma + libsql client
  types.ts                  # the public types of every family (gateway section)
  gatewayviewconfig.ts      # the shipped v1–v5 definitions (data only)
  gatewayviewdefinition.ts  # the view-side structural contract
  Sol/                      # the design room of the whole project
    App.tsx                 # the workbench entry — one router, one mount
    gatewayview/            # this console — the embedded gateway face
      gatewayview.tsx       # this page (self-contained, no main.tsx)
    schema.prisma           # the database schema
    prisma/                 # the local sqlite home — Sol/prisma/devthink.db
    console/                # the cli design page
    capacitor.config.ts     # the android wrapper — same interface
    vercel.json netlify.toml # platform manifests — deploy from here
  prisma.config.ts          # prisma 7 config (datasource url, client output)
  Dockerfile                # the one container file
  .github/workflows/        # ci release publish npm maven nuget ghcr security maintenance
  tests/                    # vitest tests flat *.test.ts
  package.json              # @wenathlan/devthink public`;

/** the repository structure block of the gateway view. */
export function osGatewayStructureBlock(): string {
  return seedOsGatewayStructure;
}

/* ---------------------------------- docs --------------------------------- */

/** the quickstart command lines of the docs card. */
export function osDocsQuickstartCommands(): string[] {
  return ["npm install --global @wenathlan/devthink", "devthink init", "devthink --help"];
}

/** the loopback endpoints the docs http card lists. */
export function osDocsEndpoints(): string[] {
  return ["GET /health", "GET /models", "POST /chat"];
}
