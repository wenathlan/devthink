/**
 * labels.ts — the copy law of saddle: every interface string lives in the
 * label store, the widgets read through this typed accessor, and a
 * hardcoded string inside a widget is a defect. the manifest below is the
 * english source of truth extracted from the real strings of the Sol widgets
 * and the page anchors; the seed ingests it into the labels store (the site
 * db through db.ts on the server, the browser rows cache in the visitor
 * machine) and the seed never overwrites a translated row.
 *
 * the browser never imports db.ts (node:sqlite cannot ride the static
 * bundle): the type comes across erased, the browser seed mirrors the rows
 * into the local cache the way onboardingstate.ts mirrors the seen flags.
 */

import type { LabelRow } from './db.ts';

/** the label revision of the manifest: bump on every copy wave so the seed
 * refreshes the store rows of the changed strings. */
export const LABEL_REVISION = 2;

/** the english manifest: the page.widget.key path answers the surface text.
 * every entry is the verbatim string the widgets and page anchors rendered
 * before the copy wave — zero invented copy. */
export const labelmanifest = {
  // the console page anchor (the sandbox surface)
  'console.shell.section': '06 / 07',
  'console.shell.label': 'Console',
  'console.shell.title': 'The sandbox runs here.',
  'console.shell.intro':
    'Pick the virtual hardware, boot the microvm and type: the same engine dispatcher answers locally in the browser and through the self-hosted node api. No account needed to run it; sign in to keep sandboxes.',
  'console.eyebrow': 'LIVE SANDBOX / SPEC PANEL · TERMINAL · BUS EVENTS',
  'console.signin': 'sign in',
  'console.badge.api': 'api connected (v{version}, uptime {uptime}s)',
  'console.badge.local': 'engine: local (no api)',
  'console.specs.title': 'sandbox specs',
  'console.declared.head': 'declared on the landing: ',
  'console.declared.tail': ' — hardware identities stay caller choices below.',
  'console.declared.base': 'base {value}',
  'console.declared.guest': 'guest {value}',
  'console.declared.arch': 'arch {value}',
  'console.start': 'start sandbox',
  'console.startAria': 'start the virtual sandbox',
  'console.note': 'self-hosted node api · no serverless functions',
  'console.prompt': 'root@{host}:~#',
  'console.boot.line': 'saddle sandbox booting ({model}, {vcpus} vcpus, {ram} gb, {gpu})',
  'console.boot.ready': 'ok: sandbox running. type "help" for the command list.',
  'console.boot.failed': 'boot failed unexpectedly; check the console log',
  'console.boot.notrunning': 'the sandbox is not running',
  'console.boot.truncated': '... output truncated for display ({bytes} bytes total)',
  'console.snapshot.created': 'snapshot {id} created (memory + disk, precopy stage 1 of 1)',
  'console.stop.done': 'sandbox stopped; snapshot-less teardown complete.',
  'console.event.creating': '{model} x{vcpus} vcpus, {ram} gb ram, {gpu}',
  'console.event.created': 'api sandbox {id} state {state}',
  'console.event.createFailed': 'api unreachable; falling back to the local engine',
  'console.event.specsCommitted': 'sandbox {id} specs committed',
  'console.event.started': 'firecracker microvm 125 ms bring-up complete',
  'console.event.exec': '"{command}" exit {code} via {source}',
  'console.event.snapshot': '{id} for sandbox {sandbox}',
  'console.event.stopped': 'sandbox {id} torn down',
  'console.event.deleted': 'api sandbox {id} destroyed',
  'console.event.deleteFailed': 'api sandbox {id} unreachable',
  // the console terminal widget
  'console.terminal.title': 'root@saddle — virtual container',
  'console.terminal.outputAria': 'sandbox terminal output',
  'console.terminal.inputAria': 'terminal command input; arrow keys browse history',
  'console.terminal.state.halted': 'halted',
  'console.terminal.state.booting': 'booting',
  'console.terminal.state.running': 'running',
  'console.terminal.state.stopped': 'stopped',
  // the console events timeline widget
  'console.events.title': 'bus events',
  'console.events.aria': 'sandbox lifecycle event timeline',
  'console.events.empty': 'no events yet; start the sandbox.',
  // the console snapshot controls widget
  'console.snapshot': 'snapshot',
  'console.snapshotAria': 'create a snapshot of the running sandbox',
  'console.stop': 'stop',
  'console.stopAria': 'stop the running sandbox',
  // the console spec panel widget
  'console.spec.cpuLabel': 'cpu model',
  'console.spec.cpuAria': 'virtual cpu model',
  'console.spec.cpuOption': '{model} ({cores}c/{threads}t)',
  'console.spec.quotaLabel': 'workspace quota',
  'console.spec.quotaAria': 'persistent workspace quota',
  'console.spec.quotaOption': '{quota} MiB',
  'console.spec.cpuHint': '{arch} · {memory} · up to {max} gb · {watts} w',
  'console.spec.vcpusLabel': 'vcpus',
  'console.spec.vcpusAria': 'virtual cpu count',
  'console.spec.ramLabel': 'ram (gb)',
  'console.spec.ramAria': 'virtual memory in gigabytes, up to 18 tb',
  'console.spec.ramExactLabel': 'exact ram (gb)',
  'console.spec.ramExactAria': 'exact virtual memory in gigabytes',
  'console.spec.gpuLabel': 'gpu',
  'console.spec.gpuAria': 'virtual gpu model',
  'console.spec.gpuOption': '{name} ({memtype} {gb} gb)',
  'console.spec.gpuHint': '{arch} · {bandwidth} gb/s · mig {mig}',
  'console.spec.migSupported': 'supported',
  'console.spec.migEmulated': 'not supported (profile emulated)',
  'console.spec.migLabel': 'vram mig profile',
  'console.spec.migAria': 'gpu mig slicing profile',
  'console.spec.migOff': 'off (full device)',
  'console.spec.mig1g': '1g.24gb · 24 gb x 4',
  'console.spec.mig2g': '2g.48gb · 48 gb x 2',
  'console.spec.mig4g': '4g.96gb · 96 gb x 1',
  // the dashboard page anchor (the signal & ledger surface)
  'dashboard.brand': 'saddle',
  'dashboard.tagline': 'dashboard',
  'dashboard.nodeBadge': 'node: {label}',
  'dashboard.node.pending': '...',
  'dashboard.node.standalone': 'standalone (no api)',
  'dashboard.node.edge': 'static edge (no api)',
  'dashboard.userbadge.pending': '...',
  'dashboard.userbadge.local': '{name} (local)',
  'dashboard.userbadge.localAdmin': '{name} (admin, local)',
  'dashboard.userbadge.admin': '{name} (admin)',
  'dashboard.logout': 'logout',
  'dashboard.logoutAria': 'end the session and return to the sign in page',
  'dashboard.fatal.title': 'session required',
  'dashboard.fatal.apiUnreachable':
    'the api is unreachable; set the api target (?api=...) or try again later.',
  'dashboard.fatal.needsSession': 'this page needs a signed in session.',
  'dashboard.fatal.payload': 'the api answered but the account payload was not understood.',
  'dashboard.fatal.noLocalSession':
    'this static page has no signed-in browser session; sign in or create a local account first.',
  'dashboard.fatal.signin': 'sign in',
  'dashboard.fatal.backConsole': 'back to the sandbox',
  'dashboard.tabsAria': 'dashboard views',
  'dashboard.tab.user': 'user',
  'dashboard.tab.admin': 'admin',
  'dashboard.panel.sandboxes': 'my sandboxes',
  'dashboard.panel.account': 'my account',
  'dashboard.panel.events': 'bus events',
  'dashboard.footer.cookie': 'session cookie: saddlesession (httponly)',
  'dashboard.footer.storage': 'nothing sensitive in localstorage',
  'dashboard.footer.api': 'self-hosted node api · no serverless functions',
  // the dashboard account panel widget
  'dashboard.account.username': 'username',
  'dashboard.account.role': 'role',
  'dashboard.account.adminRole': 'admin (CODEOWNERS allowlist: {list})',
  'dashboard.account.mode': 'mode',
  'dashboard.account.modeLocal':
    'local browser account (static edge; pbkdf2 in localstorage, never synced; the built-in admin seed survives storage resets)',
  'dashboard.account.signedIn': 'signed in',
  'dashboard.account.expires': 'expires',
  'dashboard.account.created': 'created',
  'dashboard.account.lastLogin': 'last login',
  'dashboard.account.id': 'id',
  'dashboard.account.backup': 'backup accounts',
  'dashboard.account.restore': 'restore accounts',
  'dashboard.account.backupDone':
    'backup downloaded ({count} account(s)). keep the file safe; it restores every account after a full browser wipe.',
  'dashboard.account.backupEmpty': 'no accounts to back up yet.',
  'dashboard.account.backupFailed': 'the backup download failed.',
  'dashboard.account.restoreDone': '{count} account(s) restored from the backup.',
  'dashboard.account.restoreEmpty': 'no new accounts in that backup (already present or invalid).',
  'dashboard.account.importFailed': 'import failed.',
  // the dashboard admin panel widget
  'dashboard.admin.na': 'n/a',
  'dashboard.admin.localNodes': '1 (this browser)',
  'dashboard.admin.localSessions': 'local',
  'dashboard.admin.overview': 'overview',
  'dashboard.card.users': 'users',
  'dashboard.card.nodes': 'nodes',
  'dashboard.card.sandboxes': 'sandboxes',
  'dashboard.card.sessions': 'sessions',
  'dashboard.card.events': 'events',
  'dashboard.card.uptime': 'uptime',
  'dashboard.admin.refresh': 'refresh all',
  'dashboard.admin.refreshAria': 'reload every admin table',
  'dashboard.admin.nodes': 'mesh nodes',
  'dashboard.admin.users': 'users',
  'dashboard.admin.sandboxes': 'sandboxes (global)',
  'dashboard.admin.audit': 'audit log',
  // the dashboard audit log widget
  'dashboard.audit.unavailable': 'audit log unavailable (status {status}).',
  'dashboard.audit.unreachable': 'the audit endpoint is unreachable.',
  'dashboard.audit.localNote':
    'the audit trail lives on the main node api; the static edge keeps no audit records.',
  'dashboard.audit.tableAria': 'audit log table',
  'dashboard.audit.empty': 'no audit entries yet.',
  'dashboard.audit.colAction': 'action',
  'dashboard.audit.colUser': 'username',
  'dashboard.audit.colIp': 'ip',
  'dashboard.audit.colWhen': 'when',
  // the dashboard creation form widget
  'dashboard.create.formAria': 'create a new sandbox',
  'dashboard.create.cpuLabel': 'cpu model',
  'dashboard.create.cpuAria': 'virtual cpu model',
  'dashboard.create.vcpusLabel': 'vcpus',
  'dashboard.create.vcpusAria': 'virtual cpu count',
  'dashboard.create.ramLabel': 'ram (gb)',
  'dashboard.create.ramAria': 'virtual memory in gigabytes',
  'dashboard.create.gpuLabel': 'gpu',
  'dashboard.create.gpuAria': 'virtual gpu model',
  'dashboard.create.migLabel': 'mig profile',
  'dashboard.create.migAria': 'gpu mig slicing profile',
  'dashboard.create.failedStatus': 'creation failed with status {status}.',
  'dashboard.create.unreachable': 'the api is unreachable; the sandbox was not created.',
  'dashboard.create.submit': 'create sandbox',
  'dashboard.create.submitAria': 'create a new sandbox',
  'dashboard.create.refresh': 'refresh',
  'dashboard.create.refreshAria': 'reload the sandbox list',
  // the dashboard events timeline widget
  'dashboard.events.localNote':
    'bus events stream from the main node api; nothing to poll on the static edge.',
  'dashboard.events.aria': 'mesh bus event timeline',
  'dashboard.events.empty': 'waiting for events...',
  'dashboard.events.pollNote': 'polls /api/v1/events every 10 s while the tab is visible.',
  // the dashboard global sandboxes table widget
  'dashboard.global.unavailable': 'sandbox table unavailable (status {status}).',
  'dashboard.global.unreachable': 'the sandboxes endpoint is unreachable.',
  'dashboard.global.localNote':
    'the global sandbox table lives on the main node api; the local engine shelf stays in the user view.',
  'dashboard.global.tableAria': 'global sandboxes table',
  'dashboard.global.empty': 'no sandboxes on this node.',
  'dashboard.global.colId': 'id',
  'dashboard.global.colOwner': 'owner',
  'dashboard.global.colState': 'state',
  'dashboard.global.colSpec': 'spec',
  'dashboard.global.colCreated': 'created',
  'dashboard.global.colExpires': 'expires',
  // the dashboard mesh nodes table widget
  'dashboard.mesh.pollNote':
    'ping goes through /api/v1/mesh (hmac signed server side); this page never holds mesh keys.',
  'dashboard.mesh.tableAria': 'mesh nodes table',
  'dashboard.mesh.empty': 'no nodes registered yet.',
  'dashboard.mesh.nodeUnavailable': 'node table unavailable (status {status}).',
  'dashboard.mesh.nodesUnreachable': 'the nodes endpoint is unreachable.',
  'dashboard.mesh.colUrl': 'url',
  'dashboard.mesh.colRegion': 'region',
  'dashboard.mesh.colStatus': 'status',
  'dashboard.mesh.colHeartbeat': 'last heartbeat',
  'dashboard.mesh.colPing': 'ping',
  'dashboard.mesh.localNode': 'this browser',
  'dashboard.mesh.localRegion': 'static edge (github pages / vercel / netlify clone)',
  'dashboard.mesh.localStatus': 'local',
  'dashboard.mesh.na': 'n/a',
  'dashboard.mesh.ping': 'ping',
  'dashboard.mesh.pingAria': 'ping mesh node {url}',
  'dashboard.mesh.pinging': 'pinging...',
  'dashboard.mesh.pongMesh': 'pong {rtt} ms (mesh)',
  'dashboard.mesh.pongMeshPlain': 'pong (mesh)',
  'dashboard.mesh.pongProbe': 'pong ~{ms} ms (client probe)',
  'dashboard.mesh.unreachable': 'unreachable',
  'dashboard.mesh.nopong': '-',
  // the dashboard sandbox list widget
  'dashboard.list.title': 'the sandbox list',
  'dashboard.list.aria': 'my sandboxes',
  'dashboard.list.unreachable': 'the sandbox list is unreachable right now.',
  'dashboard.list.sessionExpired': 'the session expired; sign in again.',
  'dashboard.list.deleteFailed': 'delete failed with status {status}.',
  'dashboard.list.deleteUnreachable': 'the api is unreachable; the sandbox was not deleted.',
  'dashboard.list.stop': 'stop',
  'dashboard.list.stopAria': 'stop {id}',
  'dashboard.list.open': 'open',
  'dashboard.list.openAria': 'open sandbox {id} in the terminal',
  'dashboard.list.delete': 'delete',
  'dashboard.list.deleteAria': 'delete sandbox {id}',
  'dashboard.list.specVcpus': 'x{vcpus} vcpus',
  'dashboard.list.specRam': '{ram} gb',
  'dashboard.list.specMig': 'mig {mig}',
  'dashboard.list.metaCreated': 'created {date}',
  'dashboard.list.metaExpires': 'expires {date}',
  'dashboard.list.metaExecs': 'execs {count}',
  'dashboard.list.metaFiles': 'files {count}',
  'dashboard.list.emptyNotLive':
    'the sandbox list is not live on this node yet; creation still works.',
  'dashboard.list.empty': 'no sandboxes yet; create one above or boot the local engine from the ',
  'dashboard.list.consoleLink': 'console',
  'dashboard.list.emptyPeriod': '.',
  // the dashboard users table widget
  'dashboard.users.searchLabel': 'search by username',
  'dashboard.users.searchPlaceholder': 'filter...',
  'dashboard.users.searchAria': 'filter the users table by username',
  'dashboard.users.tableAria': 'users table',
  'dashboard.users.emptyLocal': 'no accounts registered in this browser.',
  'dashboard.users.empty': 'no users registered yet.',
  'dashboard.users.noMatch': 'no users match "{needle}".',
  'dashboard.users.colUsername': 'username',
  'dashboard.users.colRole': 'role',
  'dashboard.users.colLastLogin': 'last login',
  'dashboard.users.colCreated': 'created',
  'dashboard.users.localCell': 'browser-local',
  'dashboard.users.hashesNote':
    'password hashes and salts never leave the api; this table renders account fields only.',
  'dashboard.users.unavailable': 'user table unavailable (status {status}).',
  'dashboard.users.unreachable': 'the users endpoint is unreachable.',
  // the home runtime diagram widget (the metric strip carries no copy)
  'home.diagram.aria': 'Runtime chain diagram',
  'home.diagram.topline': 'THE CHAIN / FOUR STAGES',
  'home.diagram.chain': 'repo → runner → memory → surface',
  'home.diagram.repo': 'repo',
  'home.diagram.repoDetail': 'persistent state',
  'home.diagram.runner': 'CI runner',
  'home.diagram.runnerDetail': 'virtual processor',
  'home.diagram.memory': 'memory',
  'home.diagram.memoryDetail': 'storage bridge',
  'home.diagram.surface': 'Pages / CDN',
  'home.diagram.surfaceDetail': 'shared surface',
  'home.diagram.usageFlag': 'usage flag: ',
  'home.diagram.usageFlagValue': 'process',
  'home.diagram.latencyBudget': 'latency budget: ',
  'home.diagram.latencyBudgetValue': 'remote / explicit',
  // the login page anchor and form widget
  'login.brand': 'saddle',
  'login.tagline': 'sign in',
  'login.panel.title': 'account',
  'login.trust.eyebrow': 'the trust rail',
  'login.trust.aria': 'session facts',
  'login.trust.sessionLabel': 'session',
  'login.trust.sessionBody': 'the saddlesession cookie, httponly — nothing sensitive in localstorage.',
  'login.trust.transportLabel': 'transport',
  'login.trust.transportBody': 'the self-hosted node api · no serverless functions.',
  'login.trust.errorsLabel': 'errors',
  'login.trust.errorsBody': 'generic on purpose — no user enumeration, no cause leak.',
  'login.trust.fallbackLabel': 'fallback',
  'login.trust.fallbackBody': 'no api at this base: accounts stay browser-local on the static edge.',
  'login.footer.cookie': 'session cookie: saddlesession (httponly)',
  'login.footer.api': 'self-hosted node api · no serverless functions',
  'login.status.local': 'accounts: local browser (static edge, no api)',
  'login.error.bothFields': 'enter both the username and the password.',
  'login.error.invalid': 'invalid username or password.',
  'login.error.noAuth': 'auth is not available at this api target; set ?api=<main node url> and try again.',
  'login.error.unreachable': 'the api is unreachable; check the api target or try again later.',
  'login.field.username': 'username',
  'login.hint.username': 'username only; this project has no e-mail field.',
  'login.field.password': 'password',
  'login.submit': 'sign in',
  'login.submitPending': 'signing in...',
  'login.noAccount': 'no account? ',
  'login.link.create': 'create one',
  'login.link.backConsole': 'back to the sandbox',
  // the register page anchor and form widgets
  'register.brand': 'saddle',
  'register.tagline': 'create account',
  'register.panel.title': 'username + password only',
  'register.success.title': 'account created; opening your dashboard.',
  'register.success.continue': 'continue ',
  'register.success.dashboardLink': 'to the dashboard',
  'register.success.signinLink': 'sign in',
  'register.field.username': 'username',
  'register.hint.username': '3-32 chars, lowercase a-z 0-9 . - (auto-lowercased)',
  'register.field.password': 'password',
  'register.error.fixFields': 'fix the highlighted fields and try again.',
  'register.error.localFailed': 'local registration failed.',
  'register.error.noRegister':
    'registration is not available at this api target; set ?api=<main node url> and try again.',
  'register.error.generic': 'registration failed; try again.',
  'register.error.unreachable': 'the api is unreachable; check the api target or try again later.',
  'register.submit': 'create account',
  'register.submitPending': 'creating...',
  'register.trust.eyebrow': 'the trust rail',
  'register.trust.aria': 'live rules and policy facts',
  'register.trust.identityLabel': 'identity',
  'register.trust.identityBody': 'username + password only — no e-mail field by project policy.',
  'register.trust.hashingLabel': 'hashing',
  'register.trust.hashingBody': 'passwords hashed with scrypt server-side.',
  'register.trust.charsetLabel': 'charset',
  'register.trust.charsetBody': '3-32 chars, lowercase a-z 0-9 . - (auto-lowercased as you type).',
  'register.trust.sessionLabel': 'session',
  'register.trust.sessionBody': 'the saddlesession cookie, httponly, set by the backend on success.',
  'register.status.local': 'accounts: local browser (static edge, no api)',
  'register.already': 'already registered? ',
  'register.signinLink': 'sign in',
  'register.backConsole': 'back to the sandbox',
  'register.footer.policy': 'no e-mail field: project policy is username + password only',
  'register.footer.hashing': 'passwords hashed with scrypt server-side',
  // the register username rules widget
  'register.rules.length': '3 to 32 characters',
  'register.rules.charset': 'only a-z, 0-9, dot and dash',
  // the register password meter widget
  'register.meter.strength0': '-',
  'register.meter.strength1': 'weak',
  'register.meter.strength2': 'fair',
  'register.meter.strength3': 'good',
  'register.meter.strength4': 'strong',
  'register.meter.strengthLabel': 'strength: {name}',
  'register.meter.minHint': 'minimum 8 characters',
  'register.meter.ruleLength': 'at least 8 characters',
  'register.meter.ruleClasses': 'mix character classes (lower, upper, digit, symbol)',
  // the register password confirm widget
  'register.confirm.label': 'confirm password',
  'register.confirm.match': 'passwords match.',
  'register.confirm.mismatch': 'passwords do not match.',
  // the home page anchor (the landing)
  'home.hero.eyebrow': 'saddle · the instant sandbox of the family',
  'home.hero.titleLine1': 'Spin a',
  'home.hero.titleLine2': 'sandbox.',
  'home.hero.lede':
    'Declared, never assembled: one line names the base, the guest and the arch — the engine boots it and the result ships back as a package.',
  'home.hero.formAria': 'declare a sandbox and boot the console',
  'home.hero.declareLabel': 'declare',
  'home.hero.placeholder': 'spin a sandbox — try: omarchy · max · arm64',
  'home.hero.boot': 'boot ',
  'home.hero.chipsLegend': 'the declared vocabulary',
  'home.chips.base': 'base',
  'home.chips.guest': 'guest',
  'home.chips.arch': 'arch',
  'home.declared.line': 'declared: {parts} — the boot key hands it to the console',
  'home.declared.none': 'nothing declared yet — tap a chip or type the words',
  'home.declared.base': 'base {value}',
  'home.declared.guest': 'guest {value}',
  'home.declared.arch': 'arch {value}',
  'home.matrix.aria': 'the sandbox matrix',
  'home.matrix.title': 'the sandbox matrix',
  'home.matrix.subtitle': 'three bases · bootstrap limits',
  'home.matrix.colBase': 'base',
  'home.matrix.colGuests': 'guests',
  'home.matrix.colArch': 'arch',
  'home.matrix.colVgpu': 'vgpu',
  'home.matrix.colCeiling': 'ceiling',
  'home.matrix.guests': '{n} guests',
  'home.matrix.archValue': 'arm64 · amd64',
  'home.matrix.vgpuNone': 'none',
  'home.matrix.vgpuOne': '{n} slice',
  'home.matrix.vgpuMany': '{n} slices',
  'home.matrix.ceiling': '{vcpus} vcpu · {ram} gb ram · {disk} gb disk · {minutes} min',
  'home.matrix.note':
    'the documented development bootstrap limits — the table is configuration (SADDLE_SPEC_LIMITS), never a product rule. guests: {oses}.',
  'home.metric.bases.value': '03',
  'home.metric.bases.label': 'runtime bases',
  'home.metric.bases.detail': 'lite / balanced / max',
  'home.metric.storage.value': '70+',
  'home.metric.storage.label': 'storage backends',
  'home.metric.storage.detail': 'rclone-compatible',
  'home.metric.forms.label': 'package forms',
  'home.metric.forms.detail': 'runtime / full / published',
  'home.thesis.railLabel': 'the thesis',
  'home.thesis.eyebrow': 'core principle / 01',
  'home.thesis.title': 'The bytes are already there. ',
  'home.thesis.titleAccent': 'The flag is the machine.',
  'home.thesis.bodyLead':
    'RAM and disk are the same construct at the byte level. What changes is the usage flag: ',
  'home.thesis.keep': 'keep',
  'home.thesis.join': ' or ',
  'home.thesis.process': 'process',
  'home.thesis.bodyTail':
    '. Saddle makes that distinction explicit, then routes work to a runner that belongs to someone else.',
  'home.evidence.head': 'INODE / DENTRY / FILE_OPS',
  'home.evidence.index': '[01]',
  'home.evidence.storage': 'storage',
  'home.evidence.equals': '=',
  'home.evidence.memory': 'compute memory',
  'home.evidence.difference': 'difference',
  'home.evidence.usageFlag': 'usage flag',
  'home.chain.railLabel': 'the chain',
  'home.chain.eyebrow': 'REPO → RUNNER → SURFACE',
  'home.chain.title': 'A repo can behave like a CPU.',
  'home.chain.archLink': 'Open architecture ',
  'home.chain.fig': 'FIG. 02 / REMOTE RUNTIME MAP',
  'home.media.area': 'media area',
  'home.surfaces.railLabel': 'the surfaces',
  'home.surfaces.eyebrow': 'ONE ENGINE / MANY SHELLS',
  'home.surfaces.titleLine1': 'Use the same machine',
  'home.surfaces.titleLine2': 'where your work already lives.',
  'home.surfaces.available': 'available / {n}',
  'home.surface.browser.title': 'Agent Browser',
  'home.surface.browser.body': 'Capture and replay of human movement in reproducible sessions.',
  'home.surface.compute.title': 'Computational memory',
  'home.surface.compute.body':
    'Repos and buckets enter the process without pretending latency does not exist.',
  'home.surface.packages.title': 'Package surfaces',
  'home.surface.packages.body': 'The same machine can appear as a CLI, library, extension or app.',
  'home.steps.aria': 'the first three moves',
  'home.steps.declare.title': 'declare',
  'home.steps.declare.body':
    'Name the base, the guest and the arch — the chips are the declared vocabulary.',
  'home.steps.boot.title': 'boot',
  'home.steps.boot.body': 'The console boots the microvm: spec panel, terminal, bus events.',
  'home.steps.keep.title': 'keep',
  'home.steps.keep.body': 'Snapshot the machine, or keep it on the dashboard shelf.',
  'home.steps.link': 'open the {title} ',
  'home.quad.boot.title': 'boot',
  'home.quad.boot.body': 'the console: spec, terminal, bus events',
  'home.quad.operate.title': 'operate',
  'home.quad.operate.body': 'the dashboard: shelf, account, admin',
  'home.quad.chain.title': 'chain',
  'home.quad.chain.body': 'compute: the provider farm and the bridge',
  'home.quad.thesis.title': 'thesis',
  'home.quad.thesis.body': 'architecture: repo → runner → pages',
  'home.footer.copyright': '© 2026 Saddle / distributed by design',
  'home.footer.mono': 'storage == compute',
  // the not-found page anchor (the 404 empty state)
  'notfound.eyebrow': '404 · route not mapped',
  'notfound.title': 'This route never connected.',
  'notfound.body':
    'The static edge reached a path no saddle surface claims. The session stayed clean — head back to the home page or open the agent browser.',
  'notfound.backHome': 'Back home',
  'notfound.agentBrowser': 'Open the agent browser',
} as const;

export type LabelKey = keyof typeof labelmanifest & string;

/** the translation overrides the runtime loads from the store at boot: the
 * key answers the translated text when the person changed the language. */
const overrides = new Map<string, string>();

/** the browser cache of the labels table: the rows mirror the site db (the
 * db is the source of truth; the cache carries the translated rows offline —
 * the onboardingstate.ts precedent for the visitor machine). */
const CACHE_KEY = 'saddle.labels.rows';

function readcache(): LabelRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? (parsed.filter((row): row is LabelRow => !!row && typeof row === 'object') as LabelRow[])
      : [];
  } catch {
    return [];
  }
}

function writecache(rows: readonly LabelRow[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    // the cache is best effort: the manifest always answers
  }
}

/** the typed accessor of the copy: the only door a widget uses. */
export function label(key: LabelKey): string {
  return overrides.get(key) ?? labelmanifest[key];
}

/** the placeholder door: fills the {token} slots of one format key with the
 * runtime values (the store keeps the sentence, the widget passes the data). */
export function labelfill(key: LabelKey, values: Record<string, string>): string {
  return label(key).replace(/\{(\w+)\}/g, (match, token: string) => values[token] ?? match);
}

/** the seed ingests the manifest into the labels store, idempotent, and the
 * translated rows stay protected from the overwrite. in the browser the rows
 * ride the local cache of the site db; on the server db.ts seeds the same
 * manifest into the labels table through seedlabelrows. */
export async function seedlabels(): Promise<{ seeded: number; protected: number }> {
  const stored = readcache();
  const rows = new Map<string, LabelRow>(stored.map((row) => [row.id, row]));
  let seeded = 0;
  let saved = 0;
  for (const [id, text] of Object.entries(labelmanifest)) {
    const row = rows.get(id);
    overrides.set(id, row && row.translated ? row.text : text);
    if (!row || (!row.translated && row.text !== text)) {
      rows.set(id, {
        id,
        text,
        revision: LABEL_REVISION,
        updatedAt: new Date().toISOString(),
        ...(row?.translated ? { translated: true } : {}),
      });
      seeded += 1;
    }
    saved += 1;
  }
  writecache([...rows.values()]);
  return { seeded, protected: saved - seeded };
}
