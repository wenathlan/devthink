// # copy — the copy store of the os (root layer): every user-visible
// string the components render rides the database — the copy tables the
// app's own sandbox supplies over /api/v1/copy (https, mime json) — and
// the component NEVER hardcodes text. The literals live HERE and ONLY
// here, as the build-time seed: the build hardcodes the seed into the
// bundle, the seed fills the db tables, the live rows answer the pages and
// the seed answers the offline static build (the memory-seed law — never
// browser storage). The typed accessor `copy(key)` reads the live rows
// when the platform answered and falls back to the seed when it did not,
// so the interface never shows a blank where a word belongs and the db
// stays the single living config of the copy.

import { ispublichttpsbase, onboardingapibase } from "./onboardingstate.ts";

/** One copy row as the db table holds it. */
export interface CopyRow {
  /** The stable key (the dotted path the components cite). */
  key: string;
  /** The text the row serves. */
  text: string;
}

/** The build-time seed: the one place literals live, the form the db
 * receives at build. Keys use the dotted page.section path. */
const SEED: Readonly<Record<string, string>> = Object.freeze({
  "plans.title": "Plans and payment",
  "plans.lede":
    "The platform is open and the engines carry no limits — the plan draws what the account reaches. The choice stamps the badge now; the payment gateway connects at the infrastructure wave.",
  "plans.current": "current plan",
  "plans.card.selected": "selected",
  "plans.card.select": "select",
  "plans.custom.legend": "define your own surface (mb)",
  "plans.custom.disk": "disk",
  "plans.custom.ram": "ram",
  "plans.badges.title": "The badges the identity wears",
  "plans.payment.title": "Payment",
  "plans.payment.lede":
    "The gateway connects at the infrastructure wave — the selection and the badge stamp now, the charge rides the processor when it lands.",
  "plans.payment.stamp": "stamp the",
  "plans.payment.stamping": "stamping",
  "plans.back": "back to the desktop",
  "plans.tier.free.line1": "the open platform, every app and engine included",
  "plans.tier.free.line2": "the base plan storage",
  "plans.tier.free.line3": "community sandboxes",
  "plans.tier.pro.line1": "the expanded plan for daily creators",
  "plans.tier.pro.line2": "broader storage and ram ceilings",
  "plans.tier.pro.line3": "priority sandbox lanes",
  "plans.tier.enterprise.line1": "defines own disk and ram in megabytes",
  "plans.tier.enterprise.line2": "the technology follows the definition",
  "plans.tier.enterprise.line3": "every capability badge unlocked",
  "plans.tier.free.headline": "free",
  "plans.tier.pro.headline": "pro",
  "plans.tier.enterprise.headline": "enterprise",
  "auth.oauth.row": "Sign-in providers",
  "auth.oauth.google": "Continue with Google",
  "auth.oauth.github": "Continue with GitHub",
  "auth.oauth.failed": "The sign-in round trip could not start on this machine.",
  "callback.title": "The sign-in callback",
  "callback.received": "devthink received the {provider} sign in",
  "callback.received.note": "Completing sign-in…",
  "callback.error": "The provider refused the sign in",
  "callback.error.note": "The provider answered with an error — sign-in did not complete.",
  "callback.unknown": "Unknown origin",
  "callback.unknown.note": "This sign-in did not start here — try again from the sign-in page.",
  "callback.back.auth": "back to the sign-in page",
  "callback.back.panel": "to the panel",
  "callback.signedin": "devthink signed you in",
  "callback.signedin.note": "You are signed in across all your devices.",
  "callback.exchange.refused": "The sign in was refused",
  "callback.exchange.refused.note": "The provider did not complete the sign-in — try again from the sign-in page.",
  "callback.exchange.offline": "The account service is offline",
  "callback.exchange.offline.note":
    "We could not reach the account service — sign-in did not complete. Try again when the service returns.",
  "auth.account.offline":
    "We could not reach the account service. You were signed in on this device only, and your session will sync when the service returns.",
  "auth.lock.hint": "Swipe up to unlock",
  "auth.lock.aria": "Unlock",
  "auth.brand.name": "DevThink",
  "auth.signin.aria": "Sign in to DevThink",
  "auth.signin.welcome": "Welcome back",
  "auth.signin.welcome.named": "Welcome, {name}",
  "auth.signin.create": "Create your account",
  "auth.signin.name": "Your display name",
  "auth.signin.password": "Password",
  "auth.signin.password.create": "Create a password",
  "auth.signin.password.confirm": "Confirm the password",
  "auth.signin.submit": "Sign in",
  "auth.signin.create.submit": "Create account and sign in",
  "auth.signin.reveal.show": "Show the password",
  "auth.signin.reveal.hide": "Hide the password",
  "auth.cli": "Continue with CLI",
  "auth.cli.paired": "DevThink is paired with your local CLI.",
  "auth.cli.rejected": "Pairing was rejected.",
  "auth.cli.hint":
    "Pairing rides the invitation link of the CLI: run the pairing command on your machine and open the link it prints.",
  "auth.signin.failure.choose": "Choose the display name of this account.",
  "auth.signin.failure.name": "The display name needs 3 or more letters, digits or dashes to hold the account.",
  "auth.signin.failure.password": "The password needs at least 4 characters.",
  "auth.signin.failure.confirm": "The passwords don't match. Try again.",
  "auth.signin.failure.taken": "The account owner is taken and that password does not match it.",
  "auth.signin.failure.saved": "The account could not be saved on this machine.",
  "auth.signin.failure.enter": "Enter the password of this account.",
  "auth.signin.failure.incorrect": "The password is incorrect. Try again.",
  "auth.signin.failure.incomplete": "The sign in could not be completed on this machine.",
  "auth.signin.failure.sync": "Complete the sync up: {missing} {verb} missing.",
  "panel.gate.label": "Checking the family session",
  "settings.search.placeholder": "Find a setting",
  "settings.nav.personalization": "Personalization",
  "settings.nav.accounts": "Accounts",
  "settings.nav.gateway": "Pairing",
  "settings.nav.drives": "Drives",
  "settings.nav.automation": "Automation & MCP",
  "settings.nav.about": "About",
  "settings.account.sub.local": "local browser",
  "settings.account.sub.paired": "paired CLI",
  "settings.personal.background": "Background",
  "settings.personal.background.desc": "The wallpaper the desktop and the lock screen paint.",
  "settings.wall.trident": "Trident dawn",
  "settings.wall.bloom": "Bloom",
  "settings.wall.meadow": "Meadow",
  "settings.wall.tide": "Tide",
  "settings.wall.dusk": "Dusk",
  "settings.wall.sand": "Linen",
  "settings.personal.colors": "Colors",
  "settings.personal.colors.desc": "The mode and the accent the shell wears.",
  "settings.personal.mode": "Mode",
  "settings.personal.mode.light": "Light",
  "settings.personal.mode.dark": "Dark",
  "settings.personal.accent": "Accent color",
  "settings.accent.blue": "Signal blue",
  "settings.accent.cyan": "Cyan",
  "settings.accent.teal": "Teal",
  "settings.accent.fern": "Fern",
  "settings.accent.moss": "Moss",
  "settings.accent.amber": "Amber",
  "settings.accent.rose": "Rosewood",
  "settings.accent.slate": "Slate",
  "settings.personal.navbar": "Navbar position",
  "settings.personal.navbar.desc": "Where the taskbar docks on the screen.",
  "settings.navbar.floating": "Floating",
  "settings.navbar.left": "Left edge",
  "settings.navbar.right": "Right edge",
  "settings.personal.navbarstyle": "Navbar style",
  "settings.personal.navbarstyle.desc": "The face the bar wears — the windows taskbar or the apple dock.",
  "settings.navbar.windows": "Windows taskbar",
  "settings.navbar.apple": "Apple dock",
  "settings.navbar.docklocked": "The apple dock rides the floating pad — the edge choices answer the windows taskbar.",
  "settings.personal.components": "Component options",
  "settings.personal.components.desc": "The shell behaviors this machine plays.",
  "settings.toggle.alttab": "Alt-tab entrance",
  "settings.toggle.alttab.desc": "The task switcher animates in when it opens.",
  "settings.toggle.tips": "Taskbar tooltips",
  "settings.toggle.tips.desc": "The app name surfaces above a taskbar icon.",
  "settings.toggle.devtoolswall": "Developer tools wall",
  "settings.toggle.devtoolswall.desc": "The os wall answers when developer tools open on this surface (on by default).",
  "settings.rail.title": "Desktop rail",
  "settings.rail.always": "Always",
  "settings.rail.auto": "Auto",
  "settings.rail.off": "Off",
  "settings.zoom.label": "Interface zoom",
  "settings.language.title": "Language",
  "settings.language.display": "Display language",
  "settings.accounts.identity": "Public identity",
  "settings.accounts.identity.id": "Public id",
  "settings.accounts.identity.save": "Save public id",
  "settings.accounts.access": "Browser access",
  "settings.accounts.access.desc": "Revoking removes the paired browser sessions of this machine.",
  "settings.accounts.access.revoke": "Revoke browser access",
  "settings.accounts.session": "Family session",
  "settings.accounts.session.desc":
    "One login covers the whole family deploy — the live server session of this browser.",
  "settings.accounts.session.owner": "Owner",
  "settings.accounts.session.since": "Signed in",
  "settings.accounts.session.expires": "Expires",
  "settings.accounts.session.revoke": "Sign out of the family",
  "settings.accounts.session.none": "No live family session — sign in on the auth page.",
  "settings.gateway.sync": "Sync state",
  "settings.gateway.sync.pairhint": "Pair with devthink pair create to sync the CLI.",
  "settings.gateway.boundary": "Credential boundary",
  "settings.gateway.boundary.desc": "Provider credentials stay with the cli, never in this browser.",
  "settings.about.database": "Local database",
  "settings.about.database.paired": "Gateway database",
  "settings.drives.local": "Local drives",
  "settings.drives.local.desc":
    "Every drive is one owner partition of this machine's store — mount a new partition or reopen one you made before.",
  "settings.drives.local.aria": "The drives of this machine",
  "settings.drives.pending": "reading the drives of this machine…",
  "settings.drives.mounted": "mounted",
  "settings.drives.unmounted": "unmounted",
  "settings.drives.created": "created {date}",
  "settings.drives.open": "Open",
  "settings.drives.open.aria": "Open the drive {label}",
  "settings.drives.meter.aria": "Store usage — the one allocation every drive shares",
  "settings.drives.capacity": "{usage} used of {quota}",
  "settings.drives.capacity.none": "the browser does not answer a quota on this machine",
  "settings.drives.records": "{workspaces} workspaces · {sessions} sessions · {messages} messages",
  "settings.drives.new": "New HD",
  "settings.drives.new.aria": "New drive name",
  "settings.drives.new.ph": "Name the new drive (HD 2)",
  "settings.drives.new.note":
    "A new HD is a new database partition: it starts empty and the previous drive stays on this machine. The meter reads the browser's allocation for the whole store.",
  "settings.drives.new.done": "New drive mounted: {label}. It starts empty.",
  "settings.drives.mount.fail": "The drive could not be mounted.",
  "settings.drives.new.fail": "The new drive could not be created on this machine.",
  "settings.drives.external": "External storage",
  "settings.drives.external.desc":
    "Nothing connects until you pair it — bringing your own storage is opt-in and no key leaves this panel.",
  "settings.drives.external.aria": "The external storage platforms",
  "settings.drives.status.off": "not connected",
  "settings.drives.connect": "Connect",
  "settings.drives.connect.aria": "Connect {name}",
  "settings.drives.remove": "Remove draft",
  "settings.drives.remove.aria": "Remove the {name} pairing draft",
  "settings.drives.pair": "Pair drive",
  "settings.drives.cancel": "Cancel",
  "settings.drives.pair.label": "Drive label",
  "settings.drives.pair.label.ph": "Name the drive ({name} — work)",
  "settings.drives.pair.endpoint": "Endpoint url",
  "settings.drives.pair.endpoint.ph.s3": "https://s3.example.com",
  "settings.drives.pair.endpoint.ph.host": "https://files.example.com",
  "settings.drives.pair.key": "Access key",
  "settings.drives.pair.key.ph": "access key or secret",
  "settings.drives.pair.note":
    "Pairing lands with the database wave — the draft stays on this panel and nothing is sent.",
  "settings.drives.platform.gdrive": "Google Drive",
  "settings.drives.platform.dropbox": "Dropbox",
  "settings.drives.platform.onedrive": "OneDrive",
  "settings.drives.platform.box": "Box",
  "settings.drives.platform.s3": "S3 compatible",
  "settings.drives.platform.host": "File host by url",
});

/** The live rows the platform answered (null until the first load). */
let live: Readonly<Record<string, string>> | null = null;

/**
 * Loads the live copy rows from the app database: GET /api/v1/copy over
 * the same validated base the onboarding and the plan ride. The failure
 * keeps the seed answering (the offline build law).
 */
export async function loadcopy(): Promise<void> {
  const base = onboardingapibase();
  if (!base || !ispublichttpsbase(base.toString())) return;
  try {
    const res = await fetch(new URL("/api/v1/copy", base).toString(), {
      credentials: "include",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return;
    const answer = (await res.json()) as { rows?: CopyRow[] };
    if (!Array.isArray(answer.rows)) return;
    const rows: Record<string, string> = {};
    for (const row of answer.rows) {
      if (row && typeof row.key === "string" && typeof row.text === "string") rows[row.key] = row.text;
    }
    live = rows;
  } catch {
    /* the platform is away: the seed keeps answering */
  }
}

/**
 * The typed accessor every component renders through: the live db row when
 * the platform answered, the build seed otherwise, the key itself when
 * neither holds it (the missing key is loud, never a blank).
 *
 * @param key the dotted copy key.
 * @returns the text the db (or the seed) serves.
 */
export function copy(key: string): string {
  return live?.[key] ?? SEED[key] ?? key;
}

/** The seed surface (the db fill and the tests read it; the components never). */
export function copyseed(): Readonly<Record<string, string>> {
  return SEED;
}
