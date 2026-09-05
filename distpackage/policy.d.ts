import type { featuredowngrade, gatewaykind, platformtarget, portableruleset, runtimeadapterdeclaration, actionkind, agentbudget, agentidentity, agentrecord, agentmessage, agentplan, agentscope, agentsession, allowlistentry, approvaltimeout, attachtarget, blackboardentry, callratelimit, captureexport, automationallowlistentry, budgetstate, checkpointrecord, classconsent, closedtabrecord, lockrecord, connectallowentry, consentwindow, costbudget, criticreview, deeplinkpattern, depthlimit, environmentkind, environmentrequirement, escalationrecord, handoffrecord, heartbeatrecord, incrsnapshotdelta, lazymoddescriptor, mergerule, modeloutput, nativecallclass, ocrregion, origincheckverdict, originprofile, perfrecord, phishverdict, plandraft, preconnecttarget, providerconfig, replanrecord, resourcelock, resultreport, revokerunevent, ratelimitbucket, rollbackitem, runrecord, runsettings, safetyverdict, samplingrequest, selcacheentry, sensitiveclass, sourcemapconsent, spamrule, steptemplate, streamparsechunk, tasklane, toolcallrecord, toolcatalog, tooldef, toolmock, toolnamespace, toolstep, tooldryrun, transformrule, dedupekey, extractpipeline, extractrow, provlogentry, watchdogconfig, workflowrecord, workflowstep, schemaerror, spawnrequest, taskqueue, cdpallowlist, chunkextractcursor, clientidentity, clientrecord, consoleconsentrecord, debuggergrant, editormodel, endpointconfig, formprofile, locationconsent, mcpserverconfig, navpause, navtrailentry, observationmode, policyevaluation, protocoleventsubscription, quarantineentry, rotationrule, localrule, scanverdict, syncsettings } from "./types.js";
/** Normalizes a user supplied HTTPS endpoint without preserving a provider lock-in. */
export declare function normalizeendpoint(value: string): endpointconfig;
/** Creates the exact optional host pattern requested from Chromium. */
export declare function hostpattern(origin: string): string;
/** True when the kind belongs to the session memory family of the 1.1.49 release. */
export declare function issessionkind(kind: actionkind): boolean;
/** True when the kind belongs to the workflow family of the 1.1.50 release. */
export declare function isworkflowkind(kind: actionkind): boolean;
/** True when the kind belongs to the trigger family of the 1.1.52 release: every trigger kind arms an automatic launcher and needs the explicit arm review. */
export declare function istriggeraction(kind: actionkind): boolean;
/** True when the action kind observes the page over a reviewed lifetime window. */
export declare function iswatchkind(kind: actionkind): boolean;
/** True when the kind belongs to the debugging family of console, error and task watching. */
export declare function isdebugkind(kind: actionkind): boolean;
/** True when the kind belongs to the devtools protocol family of attaches, raw commands, event watches, breakpoints, stepping, watch expressions and script overrides. */
export declare function iscdpkind(kind: actionkind): boolean;
/** True when the kind belongs to the profiling family of flow, heap, cpu, shift, trace and source map instruments. */
export declare function isprofilekind(kind: actionkind): boolean;
/** True when the kind belongs to the emulation family of device, network, location, agent and permission layers plus blackbox trace shaping. */
export declare function isemulationkind(kind: actionkind): boolean;
/** Grades the observation mode of a kind: passive capture, watched lifetimes or diffing passes. */
export declare function observationmodeof(kind: actionkind): observationmode;
/** Defines action risk from the fixed local allowlist. */
export declare function actionrisk(kind: actionkind): "read" | "interaction" | "sensitive";
/** True when the action kind accepts a css selector target or a reviewed targetref. */
export declare function needstarget(kind: actionkind): boolean;
/** Parses the reviewed JSON options of a step; malformed payloads are rejected early. */
export declare function parseoptions(step: toolstep): Record<string, unknown>;
/** Maps an action kind to the optional browser permission it requires, if any. */
export declare function requiredcapability(kind: actionkind): string | undefined;
/** True when the kind commands tabs or windows beyond the active tab and needs the optional tabs capability. */
export declare function istabscommandkind(kind: actionkind): boolean;
/** True when the kind mutates tab groups or layouts and therefore stays inside the active session. */
export declare function islayoutkind(kind: actionkind): boolean;
/** True when the kind belongs to the forms and data family. */
export declare function isformkind(kind: actionkind): boolean;
/** True when the kind belongs to the extraction, transform, export and provenance family. */
export declare function isdatasetkind(kind: actionkind): boolean;
/** True when the kind exports extracted data out of local memory to disk, the clipboard or a reviewed sheet endpoint. */
export declare function isexportkind(kind: actionkind): boolean;
/** True when the kind belongs to the files, clipboard and downloads family. */
export declare function isfileskind(kind: actionkind): boolean;
/** True when the kind belongs to the media capture family of viewport, full page, element, region and contact sheet shots. */
export declare function iscapturekind(kind: actionkind): boolean;
/** Requires the active tab grant of the live session before any capture kind runs: the session tab and origin must match and the origin grant must cover the active origin. */
export declare function capturegate(session: agentsession | undefined, tabid: number, origin: string, now: number): policyevaluation;
/** Validates one reviewed capture options payload: format inside the png, jpeg and webp set, quality bounded only by the format range, pixel ratio from one up with no code ceiling, and a known export target. */
export declare function validatecaptureoptions(value: unknown): policyevaluation;
/** Validates one reviewed region rectangle in css pixels; negative coordinates and non positive sizes are refused. */
export declare function validateregionrect(value: unknown): policyevaluation;
/** Validates one reviewed capture naming rule against the allowed segment set: run, step, sequence and kind flags only. */
export declare function validatecapturenaming(value: unknown): policyevaluation;
/** Routes the capture export target: memory stays local, clipboard needs the clipboardwrite grant and disk writes only run through the reviewed download flow. */
export declare function captureexportgranted(target: captureexport | undefined): policyevaluation;
/** Keeps the stitching scroll budget inside the reviewed wait window: the settle windows of every tile must fit the reviewed wait window with no code ceiling on either side. */
export declare function stitchbudgetallowed(tiles: number, settle: number, wait: number): policyevaluation;
/** Allows beforeafter state capture to wrap any existing action kind except the capture kinds themselves; pixel evidence around sensitive actions grades as reviewable evidence. */
export declare function beforeafterwrapallowed(kind: actionkind): boolean;
/** Exposes the capture retention window as a user configured choice; an absent value keeps every capture byte forever with no code ceiling. */
export declare function captureretentionwindow(settings: runsettings | undefined): number | undefined;
/** Refuses any export that would leave local memory while the session origin grants do not cover the active origin. */
export declare function exportgranted(session: agentsession | undefined, origin: string): policyevaluation;
/** Validates the reviewed fieldmatch grammar of one form field entry. */
export declare function validatefieldmatch(value: unknown): policyevaluation;
/** Validates a reviewed structured form record; password entries are refused because passwords need the explicit consentpassword consent. */
export declare function validateformrecord(value: unknown): policyevaluation;
/** Validates the reviewed valuegen grammar of a generatevalues step. */
export declare function validatevaluegen(value: unknown): policyevaluation;
/** Validates one reviewed transform rule: a supported expression, source columns and a target column. */
export declare function validatetransformrule(value: unknown): policyevaluation;
/** Validates a reviewed batch download specification: a non-empty HTTPS url list, an optional filename rule and an optional completion criterion. */
export declare function validatedownloadspec(value: unknown): policyevaluation;
/** Validates a reviewed mime interception filter: include and exclude patterns plus the deny default for unlisted mime types. */
export declare function validatemimefilter(value: unknown): policyevaluation;
/** Validates one reviewed cleanup rule: a positive age window with no code ceiling, an artifact kind and a keep policy. */
export declare function validatecleanuprule(value: unknown): policyevaluation;
/** Requires an approved consent prompt before any clipboard read; every read consumes its own prompt. */
export declare function clipboardconsentgranted(step: toolstep): policyevaluation;
/** Refuses to release any quarantined file before a clean scan verdict exists. */
export declare function quarantinereleasegranted(entry: quarantineentry): policyevaluation;
/** Refuses downloads and download interception that fall outside the session origin grants. */
export declare function downloadgranted(session: agentsession | undefined, url: string): policyevaluation;
/** Masks a clipboard payload for every log line; the full text never persists anywhere. */
export declare function maskclipboard(payload: string): string;
/** Requires an asksubmit review step before every form submission step. */
export declare function submitreviewgranted(steps: toolstep[], submitid: string): policyevaluation;
/** Requires a reviewed consent ref before any password field is filled. */
export declare function passwordconsentgranted(step: toolstep): policyevaluation;
/** Refuses generated values that look like real card numbers or personal identifiers; test prefixed card values stay allowed. */
export declare function generatedvalueallowed(value: string): policyevaluation;
/** Requires the origin grants of a saved profile to cover the origin before its values fill a page. */
export declare function profilegrantgranted(profile: formprofile, origin: string): policyevaluation;
/** Restricts group and layout mutations to the active session: they refuse without a live session. */
export declare function layoutmutationgranted(session: agentsession | undefined, now: number): policyevaluation;
/** Requires explicit review before closing a window that holds more than one task tab. */
export declare function windowclosegate(tasktabcount: number, reviewed: boolean): policyevaluation;
/** Reads the user configured concurrent task tab ceiling; an absent value never refuses a tab. */
export declare function tasktabceiling(settings: runsettings | undefined): number | undefined;
/** Parses the reviewed wait duration of a wait step with no upper bound. */
export declare function waitduration(step: toolstep): number;
/** Grades a resolution match count: zero is absent, one is resolved and more than one is refused as ambiguous. */
export declare function resolutionverdict(count: number): "absent" | "resolved" | "ambiguous";
/** Validates the reviewed targetref grammar of every resolution mode and rejects empty references. */
export declare function validatetargetref(reference: unknown): policyevaluation;
/** True when the session origin grants cover the given origin; a session without grants only allows its own origin. */
export declare function origingranted(session: agentsession | undefined, origin: string): boolean;
/** Decides whether an unreviewed origin may open: the session grants cover it or a safe checksafe verdict vouches for it. */
export declare function originverified(url: string, grants: string[], verdicts: safetyverdict[]): policyevaluation;
/** Refuses navigation that would move a granted task tab outside the session origin grants until the user consents. */
export declare function navigationgranted(session: agentsession | undefined, url: string): policyevaluation;
/** Validates the reviewed urlpattern grammar with its match mode plus query and fragment parts. */
export declare function validateurlpattern(value: unknown): policyevaluation;
/** Validates the reviewed tabquery grammar with url, title, id and pattern matchers; at least one matcher is required. */
export declare function validatetabquery(value: unknown): policyevaluation;
/** True when the kind belongs to the media capture family of pdf documents, recordings, images, canvases, streams, assets, lapses, conversions and thumbnails. */
export declare function ismediakind(kind: actionkind): boolean;
/** True when the kind belongs to the network observation family of fetching, parsing and typed calls. */
export declare function ishttpkind(kind: actionkind): boolean;
/** True when the kind belongs to the socket and stream family of channels, messages, subscriptions and poll loops. */
export declare function issocketkind(kind: actionkind): boolean;
/** True when the kind belongs to the request observation family of watches, headers, bodies and page api discovery. */
export declare function isnetwatchkind(kind: actionkind): boolean;
/** True when the kind belongs to the network control family of blocking, mocking, header rewriting, cookies, auth, api keys, proxy routing and uploads. */
export declare function iscontrolkind(kind: actionkind): boolean;
/** Resolves the reviewed risk of one step: capturebodies grades sensitive when the reviewed mime list carries private payload types and extractapi grades sensitive when the replay verb mutates, while every other kind keeps its risk table grade. */
export declare function resolvedrisk(step: toolstep): "read" | "interaction" | "sensitive";
/** Restricts every outbound channel to a granted origin: wss websocket and https event stream urls map onto their https origin, carry no embedded credentials and stay inside the session origin grants. */
export declare function socketgate(session: agentsession | undefined, url: string): policyevaluation;
/** Requires the user granted request watching before any watchrequests step runs; the observation derives from the page timing buffers and the grant adds no manifest permission. */
export declare function watchgate(session: agentsession | undefined, settings: runsettings | undefined, now: number): policyevaluation;
/** Requires the host grant for every observed origin before header reads, body captures and endpoint replays touch an exchange. */
export declare function observedorigingranted(session: agentsession | undefined, url: string): policyevaluation;
/** Restricts every outbound request to a granted origin: the url must be a reviewed HTTPS url inside the session origin grants. */
export declare function origincheck(session: agentsession | undefined, url: string): policyevaluation;
/** True when a header name carries credentials and therefore needs the explicit consent that names it. */
export declare function credentialheadername(name: string): boolean;
/** Requires a reviewed consent ref before any custom header leaves the extension; requests without custom headers need no prompt. */
export declare function fetchconsentrefgranted(step: toolstep): policyevaluation;
/** True when one stored fetch consent still covers the origin and every header name inside its expiry window. */
export declare function fetchconsentcovers(consent: {
    origin: string;
    headers: Array<{
        name: string;
    }>;
    approved?: boolean;
    expiresat: number;
}, origin: string, headernames: string[], now: number): boolean;
/** True when the reviewed call mutates: rest verbs beyond get, head and options or a graphql mutation; mutating calls grade sensitive. */
export declare function mutationcallof(step: toolstep): boolean;
/** Keeps the reviewed fetch waits inside the reviewed wait budget: the worst case of every timeout plus every backoff wait must fit; every bound itself stays a user choice with no code ceiling. */
export declare function fetchbudgetallowed(timeout: number | undefined, retries: number | undefined, backoff: number | undefined, wait: number | undefined): policyevaluation;
/** Resolves the outbound url of an http step at review time: the fetch request url of a fetchurl step and nothing for typed calls whose endpoints resolve at execution. */
export declare function outboundtarget(step: toolstep): string | undefined;
/** Validates one reviewed typed endpoint definition: name, method, HTTPS url template with variables, header allowlist with non-empty names and a payload schema with kinds, required flags and defaults. */
export declare function validateendpointrecord(value: unknown): policyevaluation;
/** True when the kind records user activity and needs the reviewed recording consent before it starts. */
export declare function isrecordingkind(kind: actionkind): boolean;
/** Requires the reviewed block rule of a live session before any blockrequest runs: the rule must carry the explicit reviewed flag and the session must stay active, unpaused and unexpired; every rule applies for the run only and reverts at run end. */
export declare function blockgate(session: agentsession | undefined, step: toolstep, now: number): policyevaluation;
/** Scopes every cookie kind to a granted domain of a live session: the domain must equal a granted origin host or sit beneath it, and every other domain is refused. */
export declare function cookiegate(session: agentsession | undefined, domain: string, now: number): policyevaluation;
/** Requires the explicit reviewed consent before routeproxy changes routing: a live session, a reviewed consent ref and a valid route with its bypass list; the route applies for the run only and restores the previous state at run end. */
export declare function proxygate(session: agentsession | undefined, step: toolstep, now: number): policyevaluation;
/** Requires the reviewed provider consent prompt ref before any authflow runs. */
export declare function authconsentgranted(step: toolstep): policyevaluation;
/** Requires the explicit consent prompt ref before saveapikey stores a key. */
export declare function apikeyconsentgranted(step: toolstep): policyevaluation;
/** Keeps the rate limit wait inside the reviewed wait budget as user configured behavior: the wait until the reset window passes must fit when a budget was reviewed; both bounds stay user choices with no code ceiling. */
export declare function ratelimitbudgetallowed(wait: number | undefined, budget: number | undefined): policyevaluation;
/** Requires the active tab grant of the live session for every debugging kind: the timeline gate scopes console, error and task capture to the run tab only and refuses every other tab. */
export declare function timelinegate(session: agentsession | undefined, tabid: number, origin: string, now: number): policyevaluation;
/** True when one approved console capture consent of that origin exists; console capture on a new origin prompts once and the approved decision persists. */
export declare function consoleconsentcovers(origin: string, consents: consoleconsentrecord[]): policyevaluation;
/** Requires the granted origin before stack frames are captured; stack capture outside the granted origin is refused. */
export declare function stackgate(session: agentsession | undefined, origin: string): policyevaluation;
/** Keeps the debug watch window inside the reviewed wait budget: the watch wait must fit the reviewed budget when one was reviewed; both bounds stay user choices with no code ceiling. */
export declare function debugwaitbudgetallowed(watchwindow: number | undefined, wait: number | undefined): policyevaluation;
/** Exposes the timeline retention window as a user configured choice; an absent value keeps every timeline entry forever while the level count summaries always survive. */
export declare function timelineretentionwindow(settings: runsettings | undefined): number | undefined;
/** Grades console diffing as read only comparison evidence: the diff compares two stored console outputs and touches no page or browser state. */
export declare function diffreviewgrade(): {
    risk: "read";
    mode: "diffing";
    evidence: "comparison";
};
/** Normalizes a reviewed spam rule: the pattern, the window size and the collapse threshold as user configured values. */
export declare function spamruleof(value: unknown): spamrule | undefined;
/** Normalizes a reviewed log rotation rule: the max entries per run and the overflow target store with no hardcoded entry ceiling. */
export declare function rotationruleof(value: unknown): rotationrule | undefined;
/** Requires the active run tab grant of the live session for every devtools protocol kind: the debug gate scopes attaches, commands, watches, breakpoints, steps and overrides to the run tab only and refuses every other tab. */
export declare function debuggate(session: agentsession | undefined, tabid: number, origin: string, now: number): policyevaluation;
/** True when one approved debugger consent of that origin covers every requested domain; the first attachcdp of a run needs the approved record and revocation removes the coverage. */
export declare function debuggerconsentcovers(origin: string, domains: string[], grants: debuggergrant[]): policyevaluation;
/** The profiling target gate of every 1.1.47 kind: the live session run tab and origin grants come first, every iframe, worker and service worker target stays inside the granted origins, and the reviewed debugger grant of the origin covers every profiling instrument because profiling is debugger grade instrumentation. */
export declare function targetgate(input: {
    session: agentsession | undefined;
    tabid: number;
    origin: string;
    targets: attachtarget[];
    grants: debuggergrant[] | undefined;
    now: number;
}): policyevaluation;
/** True when one approved source map capture consent of that origin covers the capture; revocation removes the coverage and the next capture needs a new reviewed prompt. */
export declare function sourcemapconsentcovers(origin: string, consents: sourcemapconsent[]): policyevaluation;
/** Exposes the user configured retention window for the heavy profile bytes; an absent window keeps every snapshot, sample and trace file. */
export declare function profileretentionwindow(settings: runsettings | undefined): number | undefined;
/** Exposes the user configured trace byte ceiling; an absent value never refuses a trace export because the cap stays a user choice only. */
export declare function traceceilingof(settings: runsettings | undefined): number | undefined;
/** Validates one breakpoint condition against the reviewed expression grammar: member chains, literals of number, string, boolean and null, comparison and logic operators, negation and parentheses; assignments, calls and statements are refused. */
export declare function validatebreakpointcondition(condition: string): policyevaluation;
/** Keeps the breakpoint count of one run inside the user configured ceiling: an absent ceiling never refuses a breakpoint because the cap stays a user choice only. */
export declare function breakpointbudgetallowed(active: number, ceiling: number | undefined): policyevaluation;
/** Exposes the pause capture retention window as a user configured choice; an absent value keeps every pause capture with its call frames. */
export declare function pauseretentionwindow(settings: runsettings | undefined): number | undefined;
/** Exposes the user configured breakpoint ceiling; an absent value never refuses a breakpoint because the cap stays a user choice only. */
export declare function breakpointceilingof(settings: runsettings | undefined): number | undefined;
/** Requires the review of every emulation layer before it applies: a live session on the run tab, an approved plan, the explicit reviewed flag on the layer options and the reviewed revert plan beside it. */
export declare function emugate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now: number;
}): policyevaluation;
/** Allows layer stacking only when the reviewed plan lists the steps: a second layer of one family needs at least two reviewed steps of that family in the same plan because the last applied layer wins conflicts. */
export declare function emulationstackallowed(plan: agentplan | undefined, kind: actionkind, active: number): policyevaluation;
/** True when one approved location consent of that origin covers the reviewed coordinates; the prompt shows the exact latitude and longitude before emulatelocate applies. */
export declare function locationconsentgate(origin: string, latitude: number, longitude: number, consents: locationconsent[]): policyevaluation;
/** Exposes the user configured retention window for reverted emulation layer states; an absent window keeps every prior state while the layer history always survives. */
export declare function emulationretentionwindow(settings: runsettings | undefined): number | undefined;
/** Validates one permission override name against the reviewed browser permission set. */
export declare function permissionnamevalid(name: string): policyevaluation;
/** Requires the explicit restore review flag and the reviewed restore plan before any session restore reopens a tab; the review lists every tab, form state and capture first. */
export declare function restorereviewgranted(step: toolstep): policyevaluation;
/** The session consent gate of every session memory step: a live session, an approved plan and the restore review of every restore; crash restore prompts stay inside the same consent model. */
export declare function sessionrestoregate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now: number;
}): policyevaluation;
/** Returns the origins a restore reopens outside the grants so the restore skips and reports them; captures and cookies restore only with their origin grants. */
export declare function restoreoriginsgranted(urls: string[], grants: string[]): {
    allowed: boolean;
    skippedorigins: string[];
};
/** Requires session names to stay unique inside the library so a filing never shadows another saved session. */
export declare function sessionnameunique(name: string, records: Array<{
    id: string;
    name: string;
}>, recordid?: string): policyevaluation;
/** Requires folder names to stay unique inside the folder tree so one folder never shadows another. */
export declare function sessionfolderunique(name: string, folders: Array<{
    name: string;
}>): policyevaluation;
/** Exposes the user configured retention window for saved session sections; an absent window keeps every section and no code ceiling applies. */
export declare function snapshotretentionwindow(settings: runsettings | undefined): number | undefined;
/** Rejects unbounded backtracking shapes of reviewed regex patterns: a quantified group whose body itself ends with an unbounded quantifier can explode on adversarial text, so the shape is refused while bounded repetitions stay user choices. The group scans run through plain index walks, because a regex over the pattern text would itself backtrack polynomially on adversarial shapes. */
export declare function validateregexrule(pattern: string): policyevaluation;
/** The workflow consent gate: a live session, an approved plan and the explicit run review of every real run; dry runs stay read only inside the same session and plan gates. */
export declare function workflowgate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now: number;
}): policyevaluation;
/** The trigger consent gate: a live session, an approved plan and the explicit arm review of every rule; automatic launchers never arm outside the consent gates. */
export declare function triggergate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now: number;
}): policyevaluation;
/** Returns the match origins of one reviewed trigger rule so callers can keep every rule inside the workflow grant list; triggers on origins outside the grants are refused. */
export declare function triggerorigins(step: toolstep): string[];
/** Returns the read only projection of one workflow step for dry runs: read class steps report their would be outcome while interaction and mutation steps carry no projection and the dry run refuses them; a control step projects only when every child step of its payload grades read. */
export declare function dryrunprojection(step: workflowstep): string | undefined;
/** Validates one reviewed permission state of an override. */
export declare function permissionstatevalid(state: string): policyevaluation;
/** Resolves the reviewed cdp allowlist of one plan: the enabled domains and method gates of its attachcdp step, the reviewable contract every later cdp kind of the plan must stay inside. */
export declare function planallowlist(steps: toolstep[]): cdpallowlist | undefined;
/** Resolves the reviewed outbound url of a network control step at review time: the form url of postform, the upload url of postfiles and the token url of authflow. */
export declare function controltarget(step: toolstep): string | undefined;
/** Resolves the reviewed channel url of a socket step at review time: the socket url of opensocket, the event stream url of subscribesse and the poll url of longpoll. */
export declare function sockettarget(step: toolstep): string | undefined;
/** Requires the active tab grant of the live session for every media kind: the session tab and origin must match and the origin grant must cover the active origin. */
export declare function mediagate(session: agentsession | undefined, tabid: number, origin: string, now: number): policyevaluation;
/** Requires an approved recording consent prompt before any recording of user activity starts; every start consumes its own prompt. */
export declare function recordingconsentgranted(step: toolstep): policyevaluation;
/** Exposes the recording duration window as a user configured choice in milliseconds; an absent window leaves the duration to the reviewed step options with no code ceiling. */
export declare function recordingwindow(settings: runsettings | undefined): number | undefined;
/** Keeps the reviewed lapse plan inside the reviewed wait budget: the whole lapse duration must fit the wait window with no code ceiling on either side. */
export declare function lapsebudgetallowed(interval: number, duration: number, wait: number | undefined): policyevaluation;
/** Validates a single proposal against the active tab origin and local policy. */
export declare function validatestep(step: toolstep, origin: string): policyevaluation;
/** Applies the consent gate immediately before an action reaches the page bridge; the 1.1.70 run lifecycle refuses steps of a queued, cancelled or rolledback run and requires a fresh heartbeat before sensitive steps. */
export declare function canexecute(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now?: number;
    verdicts?: safetyverdict[];
    settings?: runsettings;
    run?: runrecord;
    heartbeat?: heartbeatrecord;
}): policyevaluation;
/** Allows a non-mutating, temporary target preview during plan review. */
export declare function canpreview(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    step: toolstep;
    tabid: number;
    origin: string;
    now?: number;
}): policyevaluation;
/** Lists every reviewed action kind of the policy table so the step library of the editor browses the whole vocabulary. */
export declare function reviewedkinds(): string[];
/** Lists every read side action kind of the policy table so the observer scopes and the readonly fleets narrow to the read side vocabulary. */
export declare function readonlyactionkinds(): string[];
/** The editor save gate: the canvas model of a save needs a live session and an approved plan like every other reviewed artifact, its nodes must be steps or block invocations with unique ids, its edges must reference existing steps and run forward only so no cycle forms, and the composed record still passes the full workflow grammar through the composition the save triggers. */
export declare function editorsavegate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    model: editormodel;
    now: number;
}): policyevaluation;
/** Refuses to run a workflow whose review state stays pending: an imported workflow or a version rollback stays unreviewed until the user approves its expanded step list through the import or rollback review. */
export declare function runreviewgranted(record: workflowrecord): policyevaluation;
/** Validates one per site policy override so overrides only adjust reviewed knobs: the pattern must be an https origin or a `*` subdomain glob of one and every delta must name a reviewed knob with a positive user value and no code ceiling. */
export declare function validatesiteoverride(override: {
    pattern: string;
    deltas: Record<string, number>;
}): policyevaluation;
/** Validates the export contents of a workflow file so secrets never leave the browser: every step options object of the workflow and of every packed template is parsed and any field that names a secret, token, api key, password or authorization header refuses the export. */
export declare function exportcontentreview(file: {
    workflow: workflowrecord;
    templates: steptemplate[];
}): policyevaluation;
/** Validates one watchdog configuration: the stall threshold stays a positive user value with no code ceiling, the recovery action is one of retry, pause or cancel and the zombie window, when configured, stays positive with no ceiling. */
export declare function watchdogconfigvalid(config: watchdogconfig): policyevaluation;
/** Validates one mcp tool catalog against the action kind grammar: every tool name stays namespaced and unique, every wrapped kind belongs to the reviewed vocabulary, every namespace keeps its tools inside its domain kinds and every input schema carries typed properties with its required list. */
export declare function validatetoolcatalog(catalog: toolcatalog): policyevaluation;
/** Grades one tooldef with the risk class of its action kind and refuses a tool whose declared grade disagrees with the grammar. */
export declare function toolriskgrade(tool: tooldef): policyevaluation;
/** Requires consent metadata on every tool with side effects: read only tools stay free of the extra review while interaction and sensitive tools must declare their review requirement. */
export declare function toolconsentrequired(tool: tooldef): policyevaluation;
/** Grades one server bind configuration: the localhost bind stays the reviewed default while a bind outside localhost grades sensitive and needs the explicit remote review flag. */
export declare function serverbindgate(config: mcpserverconfig): policyevaluation;
/** Refuses one tool whose version stays below the negotiated compatibility floor so a client never receives a tool older than it can parse. */
export declare function toolversionfloor(tool: tooldef, floor: number): policyevaluation;
/** Requires the explicit user enablement before the mcp server ever starts; a disabled or unreviewed config never listens. */
export declare function serverenablementgate(config: mcpserverconfig): policyevaluation;
/** Validates the namespace membership of one tool: the name prefix must name the domain the tool lives in and the wrapped kind must belong to that domain so no tool drifts out of its namespace. */
export declare function toolnamespacegate(tool: tooldef): policyevaluation;
/** The mcp tool dispatch gate: the client must be paired, the session live, the plan approved and the origin inside the session grants; read only tools pass under the dryrun risk class without extra approval while every tool with side effects must name the approved plan step of its own kind it executes. The full canexecute gates re-run at execution time. */
export declare function tooldispatchgate(input: {
    client: clientrecord;
    tool: tooldef;
    session: agentsession | undefined;
    plan: agentplan | undefined;
    origin: string;
    stepid?: string;
    now: number;
}): policyevaluation;
/** Grades the consent metadata of every sensitive tool: the risk class must match the policy grading of the wrapped kind, the approval gate requirement must be explicit and the origin scope must stay the session grants. */
export declare function consentmetagrade(tool: tooldef): policyevaluation;
/** Validates one allowlist entry against the known client identities: the fingerprint must belong to a stored identity, the display name must be non empty and every granted namespace must be a reviewed namespace. */
export declare function allowlistentryvalid(entry: allowlistentry, identities: clientidentity[]): policyevaluation;
/** Validates one session token lifetime as a user configured value: an absent lifetime keeps the documented default while a configured window must stay positive with no code ceiling. */
export declare function tokenlifetimevalid(lifetime: number | undefined): policyevaluation;
/** Requires tls for any non localhost transport: a configured remote access policy or a bind outside localhost must carry the on or required tls mode before any remote traffic passes. */
export declare function remotetransporttls(config: mcpserverconfig): policyevaluation;
/** Refuses the pairing flow when no session is active: pairing codes issue only while the live browser session exists, so no remote client pairs against a closed surface. */
export declare function pairingreadinessgate(session: agentsession | undefined, now: number): policyevaluation;
/** Grades the remote transport enablement as a sensitive user choice: a configured remote access policy requires the explicit remote review and tls before the remote surface opens. */
export declare function remoteenablementgate(config: mcpserverconfig): policyevaluation;
/** Limits the token scopes to the namespaces the user granted: every scope must be a reviewed namespace the grant list carries, so a token never widens beyond the allowlist. */
export declare function tokenscopevalid(scopes: toolnamespace[], granted: toolnamespace[]): policyevaluation;
/** Validates one approval timeout as a user configured positive window with the documented refusal default; an absent timeout keeps the documented default. */
export declare function approvaltimeoutvalid(timeout: approvaltimeout | undefined): policyevaluation;
/** Grades the token revocation as an always available user action: no gate, review or state ever blocks the user from revoking a paired client. */
export declare function revocationgate(): policyevaluation;
/** Grades one client event subscription as read only when its filters exclude the mutation mirror: a subscription that listens to the callstarted kind must narrow itself with an origin or tool filter so it never streams the side effect calls of unreviewed origins. */
export declare function subscriptiongrade(subscription: protocoleventsubscription): policyevaluation;
/** Grades sampling callbacks as sensitive: the prompt leaves the browser, so page content rides a callback only behind the explicit user grant and the granted maximum tokens stay a positive user value. */
export declare function samplinggrade(input: {
    request: samplingrequest;
    pagegrant: boolean;
}): policyevaluation;
/** Validates one per client rate limit as a user configured value: the window and budget stay positive when set while an absent limit or budget documents the unbounded choice instead of a silent default. */
export declare function callratelimitvalid(limit: callratelimit | undefined): policyevaluation;
/** Requires one audit entry for every tool call without exception: every call record of the runtime must appear in the audit set so no call ever leaves the trail. */
export declare function callauditcomplete(input: {
    calls: toolcallrecord[];
    audit: toolcallrecord[];
}): policyevaluation;
/** Grades one batch call by its most sensitive member: a batch that carries a sensitive member takes the sensitive grade and runs only behind the approval gates while a read only batch stays read. */
export declare function batchgrade(input: {
    calls: Array<{
        risk: tooldef["risk"];
    }>;
    approved: boolean;
}): policyevaluation;
/** Keeps one tool dry run free of page mutations: a dry run record that claims execution or lists page mutations is refused because a dry run evaluates arguments and consent and never executes anything. */
export declare function dryrunpurity(dryrun: tooldryrun): policyevaluation;
/** Validates tool mock usage to test contexts only: a mock outside a test context is refused while a test context mock must name a tool and carry a canned result. */
export declare function mockusagevalid(mock: toolmock): policyevaluation;
/**
 * Mcp server mode gates of the 1.1.84 family.
 * Every serve side gate lives here: the serve enablement that keeps the mcp mode off until the user enables it with the shutdown drain window as a user choice, the read only degradation decision when no origin grant covers the session, the resource exposure that keeps the served resources behind the pairing approval, and the prompt exposure of the template library and the walkthroughs.
 * No port, window, ceiling or served uri is ever hardcoded: the gates validate user choices and refuse everything else.
 */
/** The serve decision of the mcp server mode: the server enablement gate of the protocol family plus the shutdown drain window validation — the window stays a positive user value in milliseconds with no code ceiling while an absent window keeps the drain unbounded. */
export declare function mcpmodegate(config: mcpserverconfig): policyevaluation;
/** Decides the read only degradation of the serve mode: the session origin must sit inside the origin grants before the serve exposes the tools with side effects, and a refusal means the serve degrades to the read only tools instead of exposing the gated catalog. */
export declare function degradationgate(input: {
    grants?: string[];
    origin?: string;
}): policyevaluation;
/** Grades the resource exposure of the serve mode: the client must stay paired and connected while the requested uri must name a served resource of the published catalog, so an unpaired client or an unknown uri never reads a resource. */
export declare function resourceexposuregate(input: {
    client: clientrecord;
    uri: string;
    served?: string[];
}): policyevaluation;
/** Grades the prompt exposure of the serve mode: the client must stay paired and connected before it lists or renders the walkthrough prompts and the user authored template library. */
export declare function promptexposuregate(client: clientrecord): policyevaluation;
/**
 * Llm integration gates of the 1.1.57 family.
 * Every model side gate lives here: the provider validation that keeps every endpoint, model and protocol shape a user configured value, the data egress grading of provider calls, the explicit consent requirement before page content leaves the browser, the local endpoint preference for sensitive extractions, the review requirement of model drafted plans, the fresh review requirement of replanned steps, the cost budget validation, the guard verdict gate that refuses invalid model output and the plan lint that checks model drafts against the action grammar before review.
 * No provider, endpoint, model, key or ceiling is ever hardcoded: the gates validate user choices and refuse everything else.
 */
/** Validates one provider config: the endpoint stays a user configured http or https url, the model list stays non-empty free text, the protocol shape stays one of the four wire shapes and the auth reference stays a storage id reference that never carries key material. */
export declare function providervalid(config: providerconfig): policyevaluation;
/** Grades one provider call as a data egress event for the audit trail: every remote completion leaves the browser with its prompt text, so the audit names the endpoint, the model and the token counts; a local endpoint grades as the local preference. */
export declare function provideregressgrade(input: {
    provider: providerconfig;
    local: boolean;
}): policyevaluation;
/** Requires explicit consent before any page content leaves the browser: page content inside a call the user has not granted refuses the call, while calls without page content pass untouched. */
export declare function egressconsentgate(input: {
    pagecontent?: string;
    granted: boolean;
}): policyevaluation;
/** Grades the local endpoint preference for sensitive extractions: a sensitive extraction prefers the local model endpoint, and the grade names the preference while a local endpoint satisfies it. */
export declare function localsensitivegrade(input: {
    sensitive: boolean;
    local: boolean;
}): policyevaluation;
/** Requires the plan review before any model drafted plan executes: only an approved draft may turn into a plan, and the plan itself still passes the same human plan review every local plan passes. */
export declare function plandraftreviewgate(draft: plandraft): policyevaluation;
/** Requires fresh review for replanned steps: a pending replan never executes and every revised tail step carries the fresh review marker, so the human review sees the changed tail before it runs. */
export declare function replanreviewgate(replan: replanrecord): policyevaluation;
/** Validates one cost budget: the token and currency ceilings stay positive user values with no code ceiling, the currency names the unit of the cost ceiling and a budget without any ceiling documents the unbounded choice instead of inventing one. */
export declare function costbudgetvalid(budget: costbudget): policyevaluation;
/** Refuses tool calls the guardrails marked invalid: only a valid guard verdict passes, an invalid or refused model output never executes. */
export declare function guardverdictgate(output: modeloutput): policyevaluation;
export declare function planlint(draft: plandraft, origin: string): string[];
/**
 * Multi agent part one gates of the 1.1.58 family.
 * Every swarm side gate lives here: the task queue validation of the user configured lanes, priorities and completion policy, the work stealing grade that permits stealing only inside one user approved swarm, the per agent budget validation of positive user ceilings, the per agent scope validation against the session grant list, the spawn grading with the risk class of the requested role, the killswitch gate that stays available with no configuration barrier, the egress grading of cross agent messages that carry page content and the blackboard consent grade that inherits the class of the source extraction.
 * No agent count, lane name, priority scale, depth ceiling or freshness window is ever hardcoded: the gates validate user choices and refuse everything else, and no swarm coordination ever bypasses the human review.
 */
/** Validates one task queue: the lanes stay non-empty unique user names, the priorities stay finite user values, the completion policy stays all or any, and every item waits in a configured lane under a configured priority when the user configured the scales. */
export declare function queuelanesvalid(queue: taskqueue): policyevaluation;
/** Grades one work stealing attempt: stealing is permitted only inside one user approved swarm, and a steal outside an approved swarm refuses because lane ownership only exists inside the reviewed swarm. */
export declare function workstealgrade(input: {
    swarmapproved: boolean;
    agentrole: string;
    lane: string;
    ownership?: Array<{
        lane: string;
        roles: string[];
    }>;
}): policyevaluation;
/** Validates one per agent budget: the token, cost and step ceilings stay positive user values with no code ceiling, the cost ceiling names its currency and a budget without any ceiling documents the unbounded choice instead of inventing one. */
export declare function agentbudgetvalid(budget: agentbudget): policyevaluation;
/** Validates one per agent scope against the session grant list: every granted origin must sit inside the session grants and every granted tool namespace must be one of the catalog namespaces, so no agent scope ever widens the session. */
export declare function agentscopevalid(input: {
    scope: agentscope;
    grants: string[];
}): policyevaluation;
/** Grades one spawn request with the risk class of the requested role: a planner or observer spawn grades read side while a worker or custom role spawn grades sensitive because it may execute reviewed steps, and the grade names the class the review sees. */
export declare function spawngrade(request: spawnrequest): policyevaluation;
/** Keeps the killswitch available with no configuration barrier while it stays user triggered only: the switch never needs a setting, an approval or a state to fire, no agent ever engages it, and it stays effective even while agents sit paused. */
export declare function killswitchgate(input?: {
    triggeredby?: "user" | "agent";
    pausedagents?: number;
}): policyevaluation;
/** Grades one cross agent message that carries page content as a data egress event: the delivery stays inside the swarm while the copied page content lands its egress class in the audit trail so the reviewer reads what moved between agents. */
export declare function messageegressgrade(input: {
    message: agentmessage;
    carriespagecontent: boolean;
}): policyevaluation;
/** Grades one blackboard entry by the consent class of its source extraction: the entry inherits the class exactly, a sensitive extraction stays sensitive on the board and every reader sees the class beside the value. */
export declare function blackboardconsentgrade(entry: blackboardentry): policyevaluation;
/**
 * Multi agent part two gates of the 1.1.59 family.
 * Every orchestration side gate lives here: the leader election validation of the user configured rule, the critic review grade that stays read only over agent outputs, the verifier method grade against the methods the user allows, the handoff grant gate that preserves the original session grants, the lock scope validation that keeps one lock inside one origin, the conflict resolution grade that marks overwriting rules sensitive, the escalation gate that keeps every lifted decision human, the consensus quorum validation of the user configured value, the worker scale bound validation with no engine cap and the merge egress grade of exported reports that include page content.
 * No quorum, worker bound, election rule or merge rule is ever hardcoded: the gates validate user choices and refuse everything else, and no coordination path bypasses the human review.
 */
/** Validates one leader election rule as the user configured it: first takes the first registration while named takes one agent id the user typed, and a named rule without its agent or an unknown rule kind refuses. */
export declare function leaderelectionvalid(input: {
    rule: {
        kind: string;
        agentid?: string;
    };
    agents: agentidentity[];
}): policyevaluation;
/** Grades one critic review as read only over agent outputs: the critic reads the output of the subject agent and returns its verdict, its issues and its required changes without ever acting on the page, and a review without its reviewer, subject or verdict refuses. */
export declare function criticreviewgrade(review: criticreview): policyevaluation;
/** Grades one verifier check by the methods the user allows: an empty allowed list keeps every method open as the documented user choice while a configured list restricts the verifier to the methods it names. */
export declare function verifiermethodgrade(input: {
    method: string;
    allowed: string[];
}): policyevaluation;
/** Requires one handoff to preserve the original session grants: the receiving agent scope stays inside the session grant list exactly like every agent scope, so a tab transfer never widens what the session granted. */
export declare function handoffgrantgate(input: {
    record: handoffrecord;
    toscope: agentscope | undefined;
    sessiongrants: string[];
}): policyevaluation;
/** Validates one lock scope so a lock never spans unrelated origins: the key composes of exactly one origin and one selector, both non-empty, and the kind stays exclusive or shared. */
export declare function lockscopevalid(lock: resourcelock): policyevaluation;
/** Grades one conflict resolution rule: the overwriting rules last and preferagent grade sensitive because one parallel value overwrites another inside the report, while first and fail grade read side. */
export declare function conflictresolutiongrade(rule: mergerule): policyevaluation;
/** Grades one escalation as always human decided: the open escalation waits for the user and only the user writes the decision; an escalation without its subject or full context refuses because the user decides on what the agent saw. */
export declare function escalationgate(escalation: escalationrecord): policyevaluation;
/** Validates one consensus quorum as a user configured value: the quorum stays a positive whole number and never exceeds the live voters the user counted, so no round carries an unreachable quorum. */
export declare function consensusquorumvalid(input: {
    quorum: number;
    voters: number;
}): policyevaluation;
/** Validates the worker scale bound as a user choice with no engine cap: an absent bound stays the documented unbounded choice while a configured bound stays a positive user value the scaling respects. */
export declare function workerscalevalid(bound: number | undefined): policyevaluation;
/** Grades one exported merged report that includes page content as a data egress event: the export carries the report with its sources into the audit trail so the reviewer reads what left the browser. */
export declare function mergeegressgrade(input: {
    report: resultreport;
    carriespagecontent: boolean;
}): policyevaluation;
/**
 * Execution environment gates of the 1.1.60 family.
 * Every environment side gate lives here: the environment field validation of every step kind (the evaluate kind runs inside the isolated world only while untrusted markup renders inside the sandboxframe only), the session environment grant gate that refuses a step whose environment sits outside the granted list, the offscreen capability gate that keeps the worker pool behind the optional offscreen grant, the keepalive gate that limits the keepalive port to sessions with an active reviewed plan, the worker pool size validation with no engine cap and the sandbox render origin gate that carries the user per origin toggle.
 * No environment posture, pool size, heartbeat interval or origin list is ever hardcoded: the gates validate user choices and refuse everything else, and no environment ever bypasses the human review.
 */
/** Validates the environment field of every step kind: the field stays one of the four environments, the evaluate kind names the isolated world only, a step carrying untrusted markup names the sandboxframe only, the parse heavy kinds choose between the live page and the offscreen worker pool and every other kind keeps the pagecontext of the page bridge. */
export declare function stepenvironmentvalid(step: toolstep): policyevaluation;
/** Requires the step environment to sit inside the session environment grant list: a configured list narrows every step of the session to its entries while an absent list keeps the documented default posture where the pagecontext and the isolated world stay open behind the same review. */
export declare function environmentgrantgate(step: toolstep, grants: environmentkind[] | undefined): policyevaluation;
/** Refuses offscreenworker steps when the optional offscreen capability grant stays absent: the worker pool only runs under the user granted offscreen permission, and a step without the grant falls back to inline parsing instead of refusing the reviewed work. */
export declare function offscreencapabilitygate(input: {
    environment: environmentkind;
    granted: boolean;
}): policyevaluation;
/** Limits the keepalive port to sessions with an active reviewed plan: a stopped or paused session holds no port, an expired session holds none, and a plan outside the approved state holds none because the keepalive signal rides a run the user already reviewed. */
export declare function keepalivegate(input: {
    session: agentsession | undefined;
    plan: agentplan | undefined;
    now: number;
}): policyevaluation;
/** Validates the keepalive heartbeat interval as a positive user value in milliseconds: the roadmap documents thirty seconds while the interval stays the user's choice with no engine default. */
export declare function keepaliveintervalvalid(interval: number): policyevaluation;
/** Validates the worker pool size as a user choice with no engine cap: an absent size lets the pool follow the pending parse queue alone while a configured size stays a positive whole number. */
export declare function workerpoolsizevalid(size: number | undefined): policyevaluation;
/** Grades one sandbox render by the origins the user allows: an absent list keeps every origin open as the documented user choice while a configured list restricts the untrusted markup renders to the origins it names. */
export declare function sandboxorigingate(input: {
    origin: string;
    allowed: string[];
}): policyevaluation;
/** Exposes the environment requirements of every reviewed action kind: one profile per kind with its allowed environments and its default, so the panel and the executor read the same table the policy validates against. */
export declare function environmentrequirements(): environmentrequirement[];
/**
 * Security part one gates of the 1.1.61 family.
 * Every trust boundary gate lives here: the automation allowlist gate that flips the posture to denydefault for every ungranted origin and binds each grant to one exact origin with no wildcard expansion while the active tab grant counts as exactly one explicit single origin grant, the origin profile gate that consults the per site profile before every sensitive kind and refuses the kinds its denials name, the consent window gate that scopes every window to one session and one origin, expires it at its duration boundary and suspends the run when the window expires mid step, the revocation gate that accepts mid run revocation as a terminal session event halting the pending step and every queued step, the sensitive class gate that routes payment, credential, delete and publish steps through one fresh consent prompt per class per origin, the consent duration validation that keeps every boundary a positive user value that never defaults to unlimited, and the log read gate that refuses reads of a hash chain with a broken link.
 * No duration, boundary, shape list or kind list is ever hardcoded: every window, profile, consent and mask shape stays the user's choice, and no security operation ever bypasses the human review.
 */
/** Checks one origin against the per origin automation allowlist under the denydefault posture: every ungranted origin stays refused before any step dispatches, the active tab origin counts as exactly one explicit single origin grant, and a wildcard entry refuses the whole check because no wildcard expansion exists. */
export declare function automationallowlistgate(input: {
    origin: string;
    allowlist: automationallowlistentry[];
    session: agentsession | undefined;
}): policyevaluation;
/** Consults the per site origin profile before one sensitive kind: an explicit denial refuses the kind on that origin, an explicit grant allows it while the fresh class consent gate still routes the sensitive classes through their prompt, and a non-sensitive kind needs no profile consult. */
export declare function originprofilegate(input: {
    profile: originprofile | undefined;
    kind: actionkind;
    sensitive: boolean;
}): policyevaluation;
/** Checks the consent window of one step before dispatch: the window scopes to exactly one session and one origin, a window past its duration boundary suspends the run mid step, and a sensitive step without an active window waits for its consent prompt. */
export declare function consentwindowgate(input: {
    window: consentwindow | undefined;
    sessionid: string;
    origin: string;
    sensitive: boolean;
    now: number;
}): policyevaluation;
/** Accepts the mid run revocation as a terminal session event: the pending step and every queued step halt without executing, the run aborts its plan, and no later step of the revoked run dispatches. */
export declare function revokerungate(input: {
    revocation: revokerunevent | undefined;
    sessionid: string;
    runid: string;
}): policyevaluation;
/** Routes one sensitive step through its fresh consent prompt: every sensitive class the classification names needs its own fresh consent per origin, an upload, download or evaluate grade sensitive by default rides its consent window prompt, and a non-sensitive step needs no fresh consent. */
export declare function sensitiveclassgate(input: {
    origin: string;
    classes: sensitiveclass[];
    bydefault: boolean;
    sensitive: boolean;
    consents: classconsent[];
    now: number;
}): policyevaluation;
/** Validates the consent window duration as a positive user value in milliseconds: every consent window names its boundary and no window ever defaults to unlimited. */
export declare function consentdurationvalid(duration: number): policyevaluation;
/** Refuses log reads of a chain with a broken link: the audit accessor verifies the whole hash chain before returning a single entry, and tamper evidence refuses the read instead of serving a forged record. */
export declare function logreadgate(input: {
    valid: boolean;
    brokenat?: number;
}): policyevaluation;
/** Grades one step through the whole sensitive pipeline: the classification names the classes and the default grade, the origin profile consults its per kind decisions, and the fresh class consent gate routes every named class through its own prompt per origin. */
export declare function sensitivepipelingate(input: {
    step: Pick<toolstep, "kind" | "value" | "options">;
    profile: originprofile | undefined;
    consents: classconsent[];
    origin: string;
    now: number;
}): policyevaluation;
/**
 * Security part two gates of the 1.1.62 family.
 * Every inbound and dispatch guard lives here: the schemastrict gate that validates every inbound command before dispatch and rejects unknown fields with the path and the expected shape, the origincheck and connectallow gates that guard every runtime message and port connection while dropping senders absent from the user managed list, the ratelimit gate that bounds automation commands per origin and per session by deferring past the bucket until the window resets, the confirmpay, confirmdelete and confirmcreds gates that route payment, destructive delete and credential use steps through one distinct human action each with no batch approval and no timeout, the phishguard gate that blocks login origins crossing the user lookalike threshold while naming the matched known origin, the safedefaults gate that profiles unknown origins as reads only, the vault secret gate that refuses secrets in step options, variables and plan texts, and the untrusted render gate that marks extracted markup untrusted and routes it through the sandboxframe.
 * No bound, window, threshold or sender list is ever hardcoded: every ratelimit bound, lookalike threshold and connectallow entry stays the user's choice, and no security operation ever bypasses the human review.
 */
/** Requires schemastrict validation of every inbound command before dispatch: every schema error names its path and its expected shape, and the refusal echoes no payload. */
export declare function schemaguardgate(input: {
    errors: schemaerror[];
}): policyevaluation;
/** Gates the protocol major negotiation of the 1.1.91 api freeze as the 2.0.0 sunset left it: a client that declares nothing or the frozen major two agrees, a client that declares major one refuses below the supported floor the sunset raised — the refusal names the supported range and the migrateplan command with the migration guide as the conversion path — and a major above two refuses until a future major bump. */
export declare function protocolnegotiationgate(input: {
    client?: string | number;
}): policyevaluation & {
    major?: number;
};
/** Gates unknown fields of an inbound message by the negotiated protocol major: the 2.0.0 sunset closed the version one tolerance the deprecation window carried, so the strict refusal answers every unknown field on every major the line accepts — the version one branch the negotiation can no longer reach records the closed window — and a frozen contract field joins only through a release bump. */
export declare function unknownfieldsgate(input: {
    unknown: string[];
    major: number;
}): policyevaluation;
/** Gates capability manifest drift between releases: an empty drift list passes while every drift entry the comparison names refuses, so a surface change without its manifest update never ships. */
export declare function capmanifestdriftgate(input: {
    drift: string[];
}): policyevaluation;
/** Requires the origincheck verdict on every runtime message before handling: a sender the verdict drops never reaches a handler. */
export declare function origincheckgate(input: {
    verdict: origincheckverdict;
}): policyevaluation;
/** Drops messages and port connections from senders absent from the connectallow list: the list ships empty by default and holds user managed entries only. */
export declare function connectallowgate(input: {
    senderid?: string;
    senderorigin?: string;
    extensionid: string;
    connectallow: connectallowentry[];
}): policyevaluation;
/** Validates the ratelimit bucket bounds as user choices: the limit and the window stay positive user values because no hidden ceiling exists. */
export declare function ratelimitboundsvalid(limit: number, window: number): policyevaluation;
/** Applies one ratelimit bucket to an automation command per origin and per session: a command inside its bound consumes a slot while a command past its bound defers until the window resets; an origin without a bucket keeps every command because the bounds stay user choices only. */
export declare function ratelimitgate(input: {
    bucket: ratelimitbucket | undefined;
    now: number;
}): policyevaluation;
/** Routes payment class steps through the confirmpay gate: a payment step without a gate opens one and pauses, an open gate keeps the pause, a resolved gate lets the step dispatch and a refused gate never dispatches it. */
export declare function confirmpaygate(input: {
    classes: sensitiveclass[];
    state: "none" | "open" | "resolved" | "refused";
}): policyevaluation;
/** Routes destructive delete steps through the confirmdelete gate: a delete step without a gate opens one and pauses, an open gate keeps the pause, a resolved gate lets the step dispatch and a refused gate never dispatches it. */
export declare function confirmdeletegate(input: {
    classes: sensitiveclass[];
    state: "none" | "open" | "resolved" | "refused";
}): policyevaluation;
/** Routes credential use steps through the confirmcreds gate: a credential step without a gate opens one and pauses with the credential label only, an open gate keeps the pause, a resolved gate lets the step read the vault at the last possible moment and a refused gate never dispatches it. */
export declare function confirmcredsgate(input: {
    classes: sensitiveclass[];
    state: "none" | "open" | "resolved" | "refused";
}): policyevaluation;
/** Requires a distinct human action for each gated step: one action resolves exactly one gate, so a batch resolution refuses in full. */
export declare function gatebatchgate(input: {
    gateids: string[];
}): policyevaluation;
/** Validates the phishguard lookalike threshold as a user choice between zero and one: the block line never defaults to an engine value. */
export declare function phishthresholdgate(threshold: number): policyevaluation;
/** Blocks the credential step when the phishguard verdict crosses the user threshold: the deny event names the matched known origin the login target resembles. */
export declare function phishguardgate(input: {
    verdict: phishverdict;
}): policyevaluation;
/** Applies safedefaults to an origin without an originprofile: the documented read kinds pass while every sensitive class denies until the user widens the profile in the originprofile editor. */
export declare function safedefaultsgate(input: {
    profile: originprofile | undefined;
    classes: sensitiveclass[];
    sensitive: boolean;
}): policyevaluation;
/** Refuses secrets in step options, variables and plan text: a plaintext value that digests to a vault record or a raw value behind a masked field shape never dispatches. */
export declare function vaultsecretgate(input: {
    leaks: string[];
    carries: boolean;
}): policyevaluation;
/** Marks extracted markup untrusted before any render: the render routes through the sandboxframe of the 1.1.60 family while an injection into the page context refuses. */
export declare function untrustedrendergate(input: {
    environment: "pagecontext" | "isolatedworld" | "offscreenworker" | "sandboxframe";
}): policyevaluation;
/**
 * Session interface gates of the 1.1.63 family.
 * Every interface gate lives here: the sitenotes read gate that limits note reads to the origins the session granted, the sitenotes write gate that keeps note writes behind one explicit consent, the scratchpad scope gate that binds every entry to its owning task session, the memory read scope gate that opens correctionmemory and consentmemory reads during planning and prompting alone, the semanticrecall scope gate that refuses recall queries across origins outside the run scope, the runsummary window validation that keeps the distillation length a user value with no fixed cap, the retention validations that keep every note, scratchpad, summary and correction window a positive user choice, the consentmemory advisory gate that keeps every record advisory with denials carrying the same weight as grants, the cancelrun gate that rolls the queued steps back only while the executed steps stay untouched in the sealed log, and the retry dispatch gate that lets a retry pass only through a new reviewed dispatch.
 * No window, retention, limit or rollback scope is ever hardcoded: every length and expiry stays the user's choice, and no interface surface ever bypasses the human review.
 */
/** Gates one sitenotes read against the granted origins: a note of an origin the session never granted refuses the read. */
export declare function sitenotesreadgate(input: {
    origin: string;
    grants: string[];
}): policyevaluation;
/** Gates one sitenotes write behind explicit consent: a note write without the reviewed consent of the user refuses. */
export declare function sitenoteswritegate(input: {
    consent: boolean;
    origin: string;
}): policyevaluation;
/** Gates one scratchpad access to its owning task session: an entry of another task or another session never reads or writes. */
export declare function scratchpadscopegate(input: {
    taskid: string;
    sessionid: string;
    entrytaskid: string;
    entrysessionid: string;
}): policyevaluation;
/** Gates correctionmemory and consentmemory reads to the planning and prompting phases: a read outside those phases refuses because the history serves the review alone. */
export declare function memoryreadscopegate(input: {
    phase: "planning" | "prompting" | "execution" | "idle";
}): policyevaluation;
/** Refuses semanticrecall queries across origins outside the run scope: the recall ranks only the origins the run scope names. */
export declare function semanticrecallscopegate(input: {
    origin: string | undefined;
    scope: string[];
}): policyevaluation;
/** Validates the runsummary window as a user value: the distillation length follows the user configured step window with no fixed cap while an absent window keeps every step. */
export declare function summarywindowvalid(window: number | undefined): policyevaluation;
/** Validates one retention window of the five session stores as a positive user value: no note, scratchpad, summary or correction ever expires at an engine boundary. */
export declare function sessionretentionvalid(window: number | undefined): policyevaluation;
/** Keeps the consentmemory advisory: no record auto grants, a denial carries the same weight as a grant, and every decision still needs its own prompt. */
export declare function consentmemoryadvisorygate(input: {
    auto: boolean;
    latest?: {
        decision: string;
        origin: string;
    };
}): policyevaluation;
/** Gates one cancelrun action: the rollback touches the queued steps only while the executed steps stay untouched in the sealed immutable log. */
export declare function cancelrungate(input: {
    queuedstepids: string[];
    executedstepids: string[];
    rollbackscope: "queued" | "none";
}): policyevaluation;
/** Gates one step retry through a new reviewed dispatch: an automatic retry without the review refuses while a reviewed retry rides the full consent gate chain. */
export declare function retrydispatchgate(input: {
    reviewed: boolean;
    stepid: string;
}): policyevaluation;
/**
 * Interface surface gates of the 1.1.64 family.
 * Every surface gate lives here: the palette action gate that keeps each commandpalette action behind its existing permission gate, the taskinput proposal gate that routes every submission through the same proposal flow as the api, the plan review gate that requires the plancard review before any execution, the stepapprove gate that binds each resolution to one step with one distinct human action and no batch approval, the diffpreview gate that limits generation to write class steps, the onboarding consent gate that lets a full completion write exactly one consent scoped event, the logstream buffer bound validation that keeps the live window a user value with no engine cap, and the logstream egress gate that lets an audit excerpt copy only a verified range.
 * No window, limit or batch scope is ever hardcoded: every bound stays the user's choice, and no interface surface ever bypasses the human review.
 */
/** Gates one commandpalette action behind its existing permission gate: a command that names an ungranted capability never lists, and a command that needs a session never lists without one. */
export declare function paletteactiongate(input: {
    action: {
        command: string;
        permission?: string;
        session?: boolean;
    };
    granted: string[];
    sessionactive: boolean;
}): policyevaluation;
/** Routes one taskinput submission through the same proposal flow as the api: an empty goal or origin refuses, and a direct execution bypass refuses because every goal becomes a reviewed plan first. */
export declare function taskinputproposalgate(input: {
    text: string;
    origin: string;
    direct: boolean;
}): policyevaluation;
/** Requires the plan review through plancards before any execution: an approved plan already passed the review while a pending plan without its plancard review refuses every execution. */
export declare function planreviewgate(input: {
    reviewed: boolean;
    state: "pending" | "approved";
}): policyevaluation;
/** Gates one stepapprove resolution: each action resolves exactly one step with one distinct human provenance and a batch resolution refuses in full. */
export declare function stepapprovegate(input: {
    stepids: string[];
    resolution: "approve" | "reject" | "edit";
    surface: "popup" | "sidepanel" | "dashboardpage" | "optionspage" | "onboarding" | "omnibox" | "page" | "background";
}): policyevaluation;
/** Limits diffpreview generation to write class steps: a read or interaction step changes no page state, so no before and after pair exists to compare. */
export declare function diffpreviewgate(input: {
    risk: "read" | "interaction" | "sensitive";
}): policyevaluation;
/** Gates the onboarding completion event: a full completion writes exactly one consent scoped event and a second consent event refuses. */
export declare function onboardingconsentgate(input: {
    consentevents: string[];
}): policyevaluation;
/** Validates the logstream live buffer bound as a user value: the live window follows the user configured bound with no engine cap while an absent bound keeps every event live. */
export declare function logbufferboundvalid(bound: number | undefined): policyevaluation;
/** Gates the logstream audit excerpt copy: only a verified range copies while an unverified chain refuses the egress in full. */
export declare function logstreamegressgate(input: {
    verified: boolean;
    entries: number;
}): policyevaluation;
/**
 * Interface surface gates of the 1.1.65 family, part two.
 * Every finishing gate lives here: the quickaction gate that keeps each context menu entry behind the origin allowlist of the clicked tab, the omniboxtask gate that routes every keyword goal through the same proposal and review flow as the api, the shortcutkey gate that binds each shortcut only to a commandpalette command with its gates intact, the notification content gate that requires consent before any notification shows page content, the pickeroverlay gate that limits every candidate read to the granted origin, the shotpanel gate that limits every capture view to captures of granted origins, the siteprofile gate that keeps per site interface preferences on https origins beside the originprofiles family, and the importexport gate that refuses secretvault values and unmasked logs in every bundle under any flag.
 * No depth, count or binding is ever hardcoded: every bound stays the user's choice, and no interface element ever bypasses the human review.
 */
/** Gates one quickaction behind the origin allowlist of the clicked tab: an ungranted origin never registers its context menu entries, and a session bound entry never registers without an active session. */
export declare function quickactiongate(input: {
    action: {
        command: string;
        origin: string;
        permission?: string;
        session?: boolean;
    };
    granted: string[];
    sessionactive: boolean;
    capabilities?: string[];
}): policyevaluation;
/** Routes one omniboxtask submission through the same proposal and review flow as the api: an empty keyword text or origin refuses, and a direct execution bypass refuses because every goal becomes a reviewed plan first. */
export declare function omniboxtaskgate(input: {
    text: string;
    origin: string;
    direct: boolean;
}): policyevaluation;
/** Binds one shortcutkey to a commandpalette command with its gates intact: a shortcut may only trigger a command the palette catalog knows, and the palette action gate must allow it for the current capability set and session state. */
export declare function shortcutkeygate(input: {
    command: string;
    palettecommands: string[];
    granted: string[];
    sessionactive: boolean;
    action?: {
        permission?: string;
        session?: boolean;
    };
}): policyevaluation;
/** Gates one notification body: a notification that carries page content shows only after the content consent while a content free body needs none. */
export declare function notificationcontentgate(input: {
    content: boolean;
    consent: boolean;
}): policyevaluation;
/** Gates one pickeroverlay read to the granted origin: a session may only list the element candidates of an origin the allowlist holds. */
export declare function pickeroverlaygate(input: {
    origin: string;
    granted: string[];
}): policyevaluation;
/** Gates one shotpanel view to captures of granted origins: a capture of an ungranted origin never opens in the panel. */
export declare function shotpanelgate(input: {
    captureorigin: string;
    granted: string[];
}): policyevaluation;
/** Gates one siteprofile origin: the per site interface preferences extend the originprofiles family, so the origin holds an https shape before any profile stores. */
export declare function siteprofilegate(input: {
    origin: string;
}): policyevaluation;
/** Refuses secretvault values and unmasked logs in every importexport bundle under any flag: a bundle that carries a secret or an unmasked log refuses in full. */
export declare function importexportgate(input: {
    containssecrets: boolean;
    unmaskedlogs: boolean;
}): policyevaluation;
/**
 * Ecosystem gates of the 1.1.66 family.
 * Every ecosystem operation lives behind the same review posture: the flowlibrary validates each manifest under schemastrict, keeps its kinds inside the installed capability set, surfaces its required grants as a diff before any import completes, quarantines unverified publishers and verifies present publisher signatures; the syncbridge hooks stay behind their explicit opt in with no default on and move manifests only; the runreplay walks sealed runs with verified chains only; the outputcompare joins runs that share a task input signature and never executes a step; and the background run queue runs reviewed workflows with the keepalive signal held.
 * Nothing is hardcoded: every registry endpoint stays the user's configured value, and no ecosystem operation ever bypasses the human review.
 */
/** Validates one imported flowlibrary manifest under schemastrict: the shape errors name their path and expected shape, and a manifest with any error refuses before anything else. */
export declare function librarymanifestgate(input: {
    errors: schemaerror[];
}): policyevaluation;
/** Refuses library entries whose kinds exceed the installed capability set: a manifest may only use action kinds the current capability report lists. */
export declare function librarycapabilitygate(input: {
    kinds: string[];
    capabilities: string[];
}): policyevaluation;
/** Refuses library entries that require grants the profile does not hold: the grant diff shows the added grants before any import completes. */
export declare function librarygrantgate(input: {
    requiredgrants: string[];
    heldgrants: string[];
}): policyevaluation;
/** Requires a fresh consent prompt for library entries marked sensitive: a sensitive manifest installs only after its fresh consent while a plain manifest needs none. */
export declare function librarysensitivegate(input: {
    sensitive: boolean;
    freshconsent: boolean;
}): policyevaluation;
/** Quarantines library entries from unverified publishers: an unsigned entry quarantines until the user verifies its publisher while a present signature must verify against the manifest digest. */
export declare function libraryquarantinegate(input: {
    verified: boolean;
    signaturepresent: boolean;
    signaturevalid: boolean;
}): policyevaluation;
/** Keeps every library import a proposal that still passes the plan review: no library entry ever executes directly and a direct execution path refuses in full. */
export declare function libraryimportgate(input: {
    proposal: boolean;
    planreviewed: boolean;
}): policyevaluation;
/** Gates syncbridge hooks behind an explicit opt in with no default on: a hook without its opt in never moves a manifest. */
export declare function syncbridgeoptingate(input: {
    optin: boolean;
}): policyevaluation;
/** Keeps the syncbridge on manifests only: a payload that carries a secretvault value or a log entry refuses in full under any flag. */
export declare function syncbridgescopegate(input: {
    carriessecrets: boolean;
    carrieslogs: boolean;
}): policyevaluation;
/** Gates runreplay to sealed runs with verified chains: an unsealed run or a broken chain never opens in the replay. */
export declare function runreplaygate(input: {
    sealed: boolean;
    chainvalid: boolean;
}): policyevaluation;
/** Gates outputcompare to runs that share a task input signature: two runs that started from different inputs compare nothing. */
export declare function outputcomparegate(input: {
    signaturea: string;
    signatureb: string;
}): policyevaluation;
/** Keeps outputcompare read only: the comparison joins stored outcomes only and a path that would execute a step refuses in full. */
export declare function outputcomparereadonlygate(input: {
    executessteps: boolean;
}): policyevaluation;
/** Gates the background run queue: a queued workflow needs its approved review and the running entry holds the keepalive signal for its whole duration. */
export declare function backgroundrungate(input: {
    reviewed: boolean;
    keepaliveheld: boolean;
}): policyevaluation;
/**
 * Ecosystem part two gates of the 1.1.67 family.
 * The ecosystem leaves the browser without leaving the review: the portable rule set compiles the policy families the cli and the extension share, planlint capability checking refuses a step whose kind exceeds what the target runtime can execute, a flowrun never starts without an origin grant file or an interactive prompt, exports verify the chain and refuse unmasked values, headless sessions keep every consent gate with denydefault refusing when no provider resolves them, telemetry stays off unless the host opts in, the platform matrix declares every runtime exactly once and the adapter mappings match their platform, and a missing capability downgrades its feature instead of failing the runtime.
 */
/** The policy families the portable rule set carries: the families a plan file lints against with no live browser attached. */
export declare const portablerulefamilies: readonly string[];
/** Compiles the portable rule set the extension and the cli share: one entry per lint rule with the family it belongs to and what it validates, versioned with the package so a cached set never drifts across releases. */
export declare function portablerulesetof(now: number): portableruleset;
/** Gates the compiled portable rule set: the version matches the package, the rule ids stay unique and non-empty and every portable family carries its rule, so a cached set never drifts. */
export declare function portablerulesetgate(ruleset: portableruleset): policyevaluation;
/** Gates one plan step against the portable capability set: a kind the target runtime cannot execute refuses before any run starts. */
export declare function portablecapabilitygate(input: {
    kind: string;
    capabilities: string[];
}): policyevaluation;
/** Gates a flowrun start: the run needs an origin grant file or an interactive grant prompt, and a run without either never starts. */
export declare function flowrungrantgate(input: {
    origin: string;
    grantsource: "file" | "prompt" | "none";
}): policyevaluation;
/** Gates every exporttools run on the chain: an export writes only a verified chain, so a broken chain refuses before any byte leaves the store. */
export declare function exportchaingate(input: {
    chainvalid: boolean;
    reason?: string;
}): policyevaluation;
/** Gates every exporttools payload on masking: an unmasked log value refuses the export in full under any format. */
export declare function exportmaskgate(input: {
    unmasked: string[];
}): policyevaluation;
/** Gates the headless consent path: a consent gate without a provider resolution refuses under denydefault, and a provider refusal refuses the step, so headless sessions keep every gate the extension keeps. */
export declare function headlessconsentgate(input: {
    providerpresent: boolean;
    resolution?: "approve" | "refuse";
}): policyevaluation;
/** Gates the telemetry marker of every library bundle: telemetry stays off unless the host opts in, so a bundle that reports by default refuses. */
export declare function headlesstelemetrygate(input: {
    telemetry: boolean;
    hostoptin: boolean;
}): policyevaluation;
/** Gates the platform matrix: every runtime of the browser, node, bun and deno declares exactly one target with its entry, format and platform, so one matrix run verifies them all. */
export declare function platformmatrixgate(targets: platformtarget[]): policyevaluation;
/** Gates the adapter mapping of one runtime: the storage, worker and dom mappings must match their platform target, so a node shell never claims chrome storage and a deno shell never claims the filesystem. */
export declare function adaptermappinggate(input: {
    adapter: runtimeadapterdeclaration;
    headless?: boolean;
}): policyevaluation;
/** Gates the capability downgrade path: a missing capability downgrades its feature and never fails the runtime, so a downgrade list with a failing feature refuses. */
export declare function capabilitydowngradegate(input: {
    downgraded: featuredowngrade[];
    failed: string[];
}): policyevaluation;
/** Reads the reviewed action vocabulary as one sorted list: the portable capability set of every runtime derives from this one contract, so the cli and the extension share the same capability list with no drift. */
export declare function actionkindcatalog(): string[];
/** Gates one lazy module load on its declared capabilities: lazy loading stays transparent to capability checks because the lazy path runs exactly the capability check the eager path runs, so a module whose declared capability stays ungranted never loads. */
export declare function lazyloadgate(input: {
    module: lazymoddescriptor;
    granted: string[];
}): policyevaluation;
/** Validates one debouncedom window as a user choice only: a present window must stay a positive number of milliseconds while an absent window passes every event through, and no engine default ever caps a storm. */
export declare function debouncewindowvalid(input: {
    kind: string;
    window?: number;
}): policyevaluation;
/** Validates one batchquery plan: the plan folds repeated selectors into one pass, so a plan that carries a duplicate selector or claims no single pass refuses. */
export declare function batchqueryplangate(plan: {
    selectors: string[];
    folded: number;
    onepass: boolean;
}): policyevaluation;
/** Gates one incrsnapshot delta on its base: the base snapshot ref must come from the same run the delta serves, so a delta from another run or against no base at all refuses. */
export declare function incrsnapshotgate(input: {
    delta: incrsnapshotdelta;
    runid: string;
    baseexists: boolean;
}): policyevaluation;
/** Gates one selcache hit on its generation: a hit from the current generation revalidates before the dispatch while a hit from a stale generation refuses so the resolver queries the selector fresh. */
export declare function selcachegate(entry: selcacheentry, generation: number): policyevaluation;
/** Gates one streamparse chunk through the same schemastrict validation the one pass parser runs: a chunk outside the accepted shape refuses the whole stream before any observation yields. */
export declare function streamparsegate(input: {
    chunk: streamparsechunk;
    expectedindex: number;
}): policyevaluation;
/** Gates one chunkextract resume on its table fingerprint: the cursor must carry the fingerprint of the table it resumes or the resume refuses so no window ever mixes two table states. */
export declare function chunkextractgate(input: {
    cursor: chunkextractcursor;
    tableid: string;
    fingerprint: string;
}): policyevaluation;
/** Gates the worker queue backpressure on the user configured depth: parse tasks past the depth defer and never refuse, and an absent depth keeps the queue unbounded because the depth stays a user choice. */
export declare function workerbackpressuregate(input: {
    depth?: number;
    pending: number;
}): policyevaluation;
/** Validates one virtlist row window as a user choice only: a present window stays a positive row count while an absent window renders every row, and no engine default ever caps a list. */
export declare function virtlistwindowvalid(input: {
    surface: string;
    rows?: number;
}): policyevaluation;
/** Gates one perf record on its provenance: every perf record attaches its provenance of origin, environment and worker task, so a record without its run and step refs refuses. */
export declare function perfprovenancegate(record: perfrecord): policyevaluation;
/** Validates one startup module budget as a user choice only: a present budget stays a positive module count the startup view reports against, and the budget never refuses a load. */
export declare function lazybudgetvalid(input: {
    budget?: number;
    prewarmed: number;
}): policyevaluation;
/** Validates one batch backpressure window as a user choice only: a present window stays a positive step count that pauses enqueueing while an absent window never pauses, and no engine default ever caps the queue. */
export declare function batchwindowvalid(input: {
    window?: number;
}): policyevaluation;
/** Validates one per domain concurrency limit as a user choice only: a present slot count stays a positive number while an absent entry keeps the domain unbounded, and no engine default ever caps a domain. */
export declare function domainlimitsvalid(input: {
    domain: string;
    slots?: number;
}): policyevaluation;
/** Validates one politedelay profile as a user choice only: the base delay and the jitter stay non negative while the floor never exceeds a base the user never set, and no engine default ever spaces a request. */
export declare function politedelayvalid(input: {
    domain: string;
    base?: number;
    floor?: number;
    jitter?: number;
}): policyevaluation;
/** Validates one adaptivepoll window as a user choice only: the floor stays under the ceiling while the growth factor stays above one, and an absent window keeps the interval fixed. */
export declare function adaptivepollvalid(input: {
    window?: {
        floor: number;
        ceiling: number;
        growth: number;
    };
}): policyevaluation;
/** Validates one runbudget as a user choice only: a present step budget or memory ratio stays positive while an absent budget keeps the tracker informational, and no budget ever refuses a step. */
export declare function runbudgetvalid(input: {
    stepbudget?: number;
    memorybudget?: number;
}): policyevaluation;
/** Validates one budgetalert threshold pair as a user choice only: both ratios stay between zero and one with the warning at or under the critical level. */
export declare function budgetthresholdsvalid(input: {
    thresholds?: {
        warning?: number;
        critical?: number;
    };
}): policyevaluation;
/** Validates one timeout bound as a user choice only: a present bound stays a positive millisecond count while an absent bound never aborts a step, and the abort always records its cancel event in the immutable log. */
export declare function timeoutboundvalid(input: {
    bound?: number;
}): policyevaluation;
/** Gates one timeoutcancel on its immutable log entry: the abort of a step must record its cancel event beside the step outcome, so an abort without its logged event refuses. */
export declare function timeoutrecordeventgate(input: {
    event: {
        logged: boolean;
        stepid: string;
    };
}): policyevaluation;
/** Validates one tab suspend window as a user choice only: a present window stays a positive millisecond count that suspends idle tabs during longer waits while an absent window never suspends a tab. */
export declare function suspendwindowvalid(input: {
    window?: number;
}): policyevaluation;
/** Gates one sessionreuse grant behind its explicit per profile consent prompt: a grant without a consent prompt or a prompt that never consented refuses, so no authenticated profile ever attaches silently. */
export declare function sessionreusegate(input: {
    grant: {
        profile: string;
        promptid: string;
        consentedat: number;
        runid?: string;
    };
}): policyevaluation;
/** Gates one efficientresume on its page fingerprint: the resume revalidates the fingerprint before it continues, so a digest mismatch refuses and the run never continues against a different page. */
export declare function resumefingerprintgate(input: {
    checkpoint: {
        stepid: string;
        digest: string;
    };
    fingerprint: string;
}): policyevaluation;
/** Gates one logprune plan on the chain verifiability: the prune removes whole sealed runs only, so a plan that prunes an unsealed run refuses while the chain verification summaries always survive. */
export declare function logprunegate(input: {
    plan: {
        prune: string[];
        refused: string[];
    };
    sealed: Array<{
        runid: string;
        sealed: boolean;
    }>;
}): policyevaluation;
/** Gates one stepprefetch hint on the reviewed plan structure: the warming warms only the pages and selectors the reviewed plan names, so a hint outside the plan refuses and the prefetch never reaches an unreviewed page. */
export declare function stepprefetchgate(input: {
    hint: {
        page?: string;
        selectors: string[];
    };
    plannedpages: string[];
    plannedselectors: string[];
}): policyevaluation;
/** Validates one slowmo factor as a user choice only: the factor stays positive so the replay slows or speeds through it while an absent factor keeps the recorded speed. */
export declare function slowmofactorvalid(input: {
    factor?: number;
}): policyevaluation;
/** Allows a replayed step only when its idempotencykey is unknown: a step the run already executed under the same key never replays twice. */
export declare function replaycheck(input: {
    key: string;
    executedkeys: string[];
}): policyevaluation;
/** Allows a resume only when the checkpoint digest matches the live page: a checkpoint against a changed page never resumes. */
export declare function checkpointgate(input: {
    checkpoint: checkpointrecord;
    runid: string;
    digest: string;
}): policyevaluation;
/** Requires an explicit user choice before compensating steps run: a rollback never executes on its own after a failed or cancelled run. */
export declare function rollbackgate(input: {
    choice: "rollback" | "none";
    failed?: boolean;
}): policyevaluation;
/** Blocks new runs while the zombiecheck reports an unresolved reap: the user resolves the reaped run before a fresh run starts. */
export declare function zombiegate(input: {
    zombies: string[];
}): policyevaluation;
/** Validates that rollback compensations stay within the approved origin: a compensating step never reaches an origin the plan never named. */
export declare function rollbackorigingate(input: {
    items: rollbackitem[];
    origin: string;
}): policyevaluation;
/** Validates the heartbeat staleness window as a user setting without a fixed ceiling: the window stays a positive user value in milliseconds. */
export declare function heartbeatwindowvalid(input: {
    window?: number;
}): policyevaluation;
/** Queues an approved plan instead of executing when the endpoint is unreachable: the offline path keeps the plan waiting and never drops it. */
export declare function offlinegate(input: {
    reachable: boolean;
}): {
    action: "queue" | "execute";
    reason: string;
};
/** Expires queued tasks whose plan window passes while offline: an expired plan never replays, its run fails and the audit trail keeps the expiry. */
export declare function queuedtaskexpirygate(input: {
    task: {
        planid: string;
        expiresat: number;
    };
    now: number;
}): policyevaluation;
/** Validates the offline queue depth as a user choice without a hard cap: the depth reports against the user value and never refuses a queued plan. */
export declare function queuedepthvalid(input: {
    depth?: number;
}): policyevaluation;
/** Blocks one run while another run holds the sessionlock: the gate names the holder in its reason so the blocked run and its user see exactly who runs. */
export declare function sessionlockgate(input: {
    lock: lockrecord | undefined;
    runid: string;
    now: number;
}): policyevaluation;
/** Refuses steps whose tabid differs from the isolated tab namespace of the run: the tabisolate namespaces never share state across tabs. */
export declare function tabisolategate(input: {
    namespace: string;
    tabid: number;
    runid?: string;
}): policyevaluation;
/** Confines one urlhistory capture to the approved origin of the run: a visit outside the origin the session granted never enters the urlhistory. */
export declare function urlhistorygate(input: {
    visit: {
        url: string;
        runid: string;
    };
    origin: string;
    grants?: string[];
}): policyevaluation;
/** Marks the runtimeline rendering as a read only operation: the timeline view reads the merged stream and never executes, mutates or writes anything. */
export declare function timelinereadonlygate(input: {
    operation: string;
}): policyevaluation;
/** Requires an explicit confirmation before the expirememory pass purges memory items: the purge never runs on its own. */
export declare function expirygate(input: {
    confirmed: boolean;
    count: number;
}): policyevaluation;
/** Refuses plaintext writes of sensitive memory classes when encryptrest stays enabled: credentials, secrets, tokens, captured bodies, captures and profiles always encrypt at rest. */
export declare function encryptmemorygate(input: {
    memoryclass?: string;
    enabled: boolean;
    encrypted: boolean;
}): policyevaluation;
/** Requires an explicit per batch approval before one quotawatch cleanup batch runs: the cleanup never touches the audit history without consent. */
export declare function quotacleanupgate(input: {
    approved: boolean;
    batch: Array<{
        key: string;
    }>;
    touchesaudit: boolean;
}): policyevaluation;
/** Requires an explicit user action before the auditexport runs: the export bundles runs, memory, provenance and expiry rules and never streams on its own. */
export declare function auditexportgate(input: {
    useraction: boolean;
}): policyevaluation;
/** Validates the sessionlock expiry window as a user setting without a fixed ceiling: the window stays a positive user value in milliseconds. */
export declare function lockwindowvalid(input: {
    window?: number;
}): policyevaluation;
/** Treats the encryption secret entry as a consent prompt: the secret never persists, the entry asks the user every time and the derived key stays in memory for the pass alone. */
export declare function encryptionsecretgate(input: {
    secret: string;
    consented: boolean;
}): policyevaluation;
/** Keeps the urlhistory scoped per run: the histories of two runs never merge and a visit of another run never enters the urlhistory of the run being read. */
export declare function urlhistoryscopegate(input: {
    visits: Array<{
        runid: string;
    }>;
    runid: string;
}): policyevaluation;
/** Requires provenance on every memory item before the auditexport runs: an item without provenance never exports because the audit trail could not name its origin. */
export declare function exportprovenancegate(input: {
    items: Array<{
        key: string;
        provenance: {
            origin: string;
            runid: string;
            stepid: string;
        };
    }>;
}): policyevaluation;
/** Gates one step against the scope of its requesting agent: the action kind and the origin must sit inside the agent scope, an absent scope stays unbounded inside the session grants, and a read only scope refuses every mutating kind. */
export declare function agentscopegate(input: {
    scope: agentscope | undefined;
    kind: string;
    origin?: string;
    risk?: string;
}): policyevaluation;
/** Gates one step against the budget state of its requesting agent: a spend past a user configured ceiling refuses the execution, an absent ceiling never refuses and every ceiling stays the user's choice with no hardcoded cap. */
export declare function budgetgate(input: {
    state: budgetstate | undefined;
    steps?: number;
    tokens?: number;
    durationms?: number;
}): policyevaluation;
/** Holds every escalation until the human answers: an agent with an open escalation runs no step, and the hold lifts only with the decision the user wrote. */
export declare function escalateholdgate(input: {
    escalations: escalationrecord[];
    agentid: string;
}): policyevaluation;
/** Gates one review request between two agents: both agents must share the origin grant, so a review never moves an output across an origin boundary the grants never joined. */
export declare function reviewrequestgate(input: {
    from: agentrecord;
    to: agentrecord;
}): policyevaluation;
/** Gates one fleet pause: the pause holds only the named agent while every peer stays runnable, so a single pause never halts the fleet. */
export declare function pauseagentgate(input: {
    records: agentrecord[];
    agentid: string;
}): policyevaluation;
/** Validates one fleet name against the lowercase identifier rule: letters and digits starting with a letter, unique beside the registered records and clear of the reserved identities. */
export declare function agentnamevalid(input: {
    name: string;
    records?: agentrecord[];
}): policyevaluation;
/** Grades one fleet operation read only: outputcompare and consensusvote join runreplay, reviewrequest and escalate as the read side operations that never touch the page. */
export declare function fleetoperationgrade(operation: string): policyevaluation;
/** Binds every runreplay export to the audit consent boundary: a replay carries the audit trail of a run, so the export leaves only behind the explicit user consent. */
export declare function replayexportgate(input: {
    consent: boolean;
    agentid: string;
}): policyevaluation;
/** Validates the vote weight of one consensus record: one vote per agent, so a duplicate voter refuses and every agentrecord counts exactly once. */
export declare function voteweightvalid(input: {
    votes: Array<{
        agentid: string;
    }>;
}): policyevaluation;
/** Requires the parent scope to cover the origin of the child objective before any spawn: the parent origins empty stay unbounded inside the session grants while a configured parent scope must name the objective origin, so the child never works past what its parent covers. */
export declare function spawngate(input: {
    parentscope: agentscope | undefined;
    objectiveorigin: string;
    parentstate?: string;
}): policyevaluation;
/** Refuses spawns beyond the user configured depth limit: the lineage depth passes the configured ceiling only through the user raising it, and an absent ceiling stays unbounded because the recursion bound stays the user's choice with no hardcoded number. */
export declare function depthgate(input: {
    depth: number;
    limit: depthlimit;
}): policyevaluation;
/** Marks the aggregatereport as a read only merge operation: the aggregation reads the parallel agent outputs, keeps their sections and provenance and never rewrites an original output, so the merge grades read only beside the fleet operations. */
export declare function aggregatemergegrade(operation: string): policyevaluation;
/** Sends the unresolved aggregation conflicts to escalation: a conflict the policy order left unresolved never silently drops, the merge stays open and the escalation lifts the conflict to the user who decides. */
export declare function aggregateconflictescalationgate(input: {
    unresolved: string[];
}): policyevaluation;
/** Keeps every arbitration verdict inside the sessionlock and the origin grants: the holder of a verdict never bypasses the lock another run holds and never reaches an origin outside its grants, so the grant of a case stays a queue position and never a permission. */
export declare function arbitrationverdictgate(input: {
    holderagentid: string;
    origin: string;
    sessionlockholder?: string;
    origingrants?: string[];
}): policyevaluation;
/** Requires the user confirmation for a priority lane change of sensitive steps: the lanes reorder freely for the ordinary steps while a lane change that moves a sensitive step needs the explicit confirmation because the interactive lane holds it. */
export declare function lanechangegate(input: {
    lane: tasklane;
    sensitive: boolean;
    confirmed: boolean;
}): policyevaluation;
/** Keeps every scaleworkers suggestion behind the user consent: a low load or a throttling origin suggests its spawn or pause and never acts alone, so the fleet size changes only through the user action. */
export declare function scaleconsentgate(input: {
    userconsented: boolean;
    origin: string;
}): policyevaluation;
/** Refuses the lessons that carry secrets or credentials: a finding that names a token, a password, a key or a bearer credential never enters the shared lesson store because the lessons spread across every agent of the fleet. */
export declare function lessonsecretgate(input: {
    text: string;
}): policyevaluation;
/** Sanitizes the lesson text before storage: the secret shaped assignments mask to their label while the plain language finding stays readable for every agent that serves it. */
export declare function lessonsanitizestep(text: string): string;
/** Keeps the costshare accounting local and read only: the ledger reads the units every agent spent and splits the shared costs among their causers, and no operation writes to the page or reaches a network through the ledger. */
export declare function costsharegate(operation: string): policyevaluation;
/** Validates the subagent scope as a subset of its parent: every child origin and action kind must sit inside the parent scope, and a child that reaches past its parent refuses loudly instead of silently widening. */
export declare function subsetscopegate(input: {
    child: agentscope;
    parent: agentscope;
}): policyevaluation;
/** Keeps the interleaved timeline views read only for the audit: the merged view orders the actions of every agent and never feeds back into a queue, a step or a verdict. */
export declare function interleavereadonlygate(operation: string): policyevaluation;
/** Restricts the prefetch warming to the granted origins: a predicted url whose origin sits outside the session grants never warms, because a speculative dns resolution of an ungranted origin would observe a site the user never consented to. */
export declare function prefetchgate(input: {
    urls: string[];
    grants: string[];
}): policyevaluation;
/** Marks the preconnect sockets read only and revocable: a revoked target opens no further connection, a target outside the host grants of the session never opens, and every open socket warms the transport only because a preconnect never carries a request of its own. */
export declare function preconnectgate(input: {
    targets: preconnecttarget[];
    grants?: string[];
}): policyevaluation;
/** Requires the target origin grant before one deep link builds: the deeplinkpattern names the origin its route builds into, and a pattern whose origin sits outside the session grants builds nothing because the reviewed parameters never widen the grants. */
export declare function deeplinkgate(input: {
    pattern: deeplinkpattern;
    grants: string[];
}): policyevaluation;
/** Rechecks the consent of one restored tab: a closedtabrecord whose origin lost its grant never reopens, because the closing of a tab never carries the consent of its origin forward and the reopening rechecks exactly what the session still grants. */
export declare function reopentabgate(input: {
    record: closedtabrecord;
    grants: string[];
}): policyevaluation;
/** Blocks every navigation kind while a consent prompt is open: the freeze holds the navigation kinds of the family — openlink, openprivate, followlink, spanav, navlist, openclipboard, batchopen, prefetch, preconnect, deeplink and reopentab — and every other kind passes because the pause holds the pages, not the audit. */
export declare function pausenavconsentgate(input: {
    pause?: navpause;
    kind: string;
}): policyevaluation;
/** Delays a step that hits a full navigation rate window: the gate refuses the immediate run, names the milliseconds the sliding window needs before the oldest hit ages out, and the step never drops silently because the wait rides in the response envelope and the retry follows it. */
export declare function navratelimitgate(input: {
    allowed: boolean;
    waitms: number;
    domain: string;
}): policyevaluation;
/** Requires a user gesture and an origin grant before one clipboard url opens: the clipboard text of the explicit user action parses into one url, the origin of that url sits inside the session grants, and a clipboard read without the gesture or the grant opens nothing. */
export declare function clipboardgate(input: {
    usergesture: boolean;
    url: string;
    grants: string[];
}): policyevaluation;
/** Refuses the urls that fail checksafeurl: a verdict that carries any reason — a weak scheme, embedded credentials, a private or raw host, a punycode label or a host that imitates a granted origin — blocks the url before anything opens, and the reasons ride to the ui so the user reads exactly why. */
export declare function safetygate(input: {
    verdict: safetyverdict;
}): policyevaluation;
/** Bounds the batch size by the user choice only: a batch that passes the user configured ceiling refuses until the user raises the ceiling or trims the batch, and an absent ceiling never refuses a link because the bound carries no code default. */
export declare function batchsizelimitgate(input: {
    size: number;
    limit?: number;
}): policyevaluation;
/** Marks navintent and prefetchpage as read only observations: the prediction reads the approved plan and the urlhistory, the warming computes the speculative dns set, and neither operation issues a request, mutates a page or bypasses the review — every other operation fails the grade. */
export declare function navigationobservationgrade(operation: string): policyevaluation;
/** Keeps the restoretrail exports inside the audit consent boundary: a navigation trail carries the url path of a whole run, so the export leaves only behind the explicit user consent the audit boundary demands. */
export declare function trailexportgate(input: {
    consent: boolean;
    runid: string;
}): policyevaluation;
/** Verifies the navtrail entries stay within the session origins: a trail entry whose url sits outside the origins the session granted refuses loudly because a trail that leaves the grants would record a path the user never consented to. */
export declare function trailorigingate(input: {
    entries: navtrailentry[];
    origins: string[];
}): policyevaluation;
/** Allows the disk writes of one pipeline only through the reviewed download flow: a streamdisk pass that would write outside the reviewed sink — a bare filesystem path, an unreviewed endpoint or an export without its descriptor — refuses loudly, because the pipeline layer moves bytes through the same reviewed export machinery every other export flows through and never opens a side channel. */
export declare function streamgate(input: {
    revieweddownload: boolean;
    sink: string;
}): policyevaluation;
/** Restricts the transforms of one pipeline to its reviewed rule list: a rule whose field and operation sit outside the rules the plan review approved refuses before any value reshapes, and the reviewed list itself stays the plan's because the pipeline never widens what the review read. */
export declare function transformgate(input: {
    rule: transformrule;
    reviewed: transformrule[];
}): policyevaluation;
/** Keeps the dedupe configuration a per pipeline user choice: a dedupe pass without its configured key refuses because an implicit key would silently drop rows the user never chose to compare, and the columns with their normalization stay exactly the pipeline's own configuration. */
export declare function dedupeconfiggate(input: {
    key?: dedupekey;
    pipelineid: string;
}): policyevaluation;
/** Marks the sampling pass as a read only preview: samplerows projects a subset of the stored extract, never mutates the extract it read, and never grades as a write — every other operation fails the grade so a sampling pass can never smuggle a mutation. */
export declare function samplegate(operation: string): policyevaluation;
/** Requires the provenance on every exported row: an exported row without its provlog provenance refuses the export in full, because an extract that leaves without its provenance would answer neither where it came from nor which operations reshaped it. */
export declare function provgate(input: {
    rows: extractrow[];
    entries: provlogentry[];
}): policyevaluation;
/** Allows the resume of one pipeline only for the same plan and the same origin: a resume of another plan would continue work the approval never covered and a resume of another origin would extract a site the session never granted, so both refuse loudly before any row skips. */
export declare function resumegate(input: {
    pipeline: extractpipeline;
    planid?: string;
    origin: string;
}): policyevaluation;
/** Refuses the pipelines that extract fields outside their reviewed target: a pipeline whose rows carry a column the reviewed source never named reads past the review, so the field refuses before the value ever persists. */
export declare function pipelinetargetgate(input: {
    fields: string[];
    target: string[];
    pipelineid: string;
}): policyevaluation;
/** Requires the user confirmation before a grid preview exports: the preview stays a read only projection until the user confirms its export, because a preview that ships on its own would export a subset the user only meant to inspect. */
export declare function gridexportconfirmgate(input: {
    confirmed: boolean;
    rows: number;
}): policyevaluation;
/** Bounds the stream chunk size by the user choice only: a chunk that passes the user configured ceiling refuses until the user raises it or trims the chunk, and an absent ceiling never refuses a chunk because the bound carries no code default. */
export declare function streamchunkgate(input: {
    chunk: number;
    limit?: number;
}): policyevaluation;
/** Marks the provlog append only for the audit integrity: a write that would rewrite or remove an entry the log already carries refuses loudly, because a provenance log that rewrites answers nothing. */
export declare function provlogappendonlygate(input: {
    entries: provlogentry[];
    entryid: string;
}): policyevaluation;
/** Keeps the row timestamps immutable after stamping: a restamp whose capturedat differs from the stamp the row already carries refuses loudly, because a provenance timestamp that moves answers the wrong question. */
export declare function rowstampgate(input: {
    stored: Array<{
        key: string;
        capturedat: number;
    }>;
    row: {
        key: string;
        capturedat: number;
    };
}): policyevaluation;
/** Binds the streamdisk files to the runid namespace: a stream file whose name leaves the namespace of its run refuses, because a stream that writes outside its run namespace could collide with the files of another run and answer the wrong provenance. */
export declare function streamnamespacegate(input: {
    filename: string;
    runid: string;
}): policyevaluation;
/** Restricts every api transport call of the 1.1.76 family to the granted origins: a call whose url leaves the session origin grants never leaves the extension, because the widened transport surface moves the same reviewed bytes the fetch family moves and never widens what the review granted. */
export declare function transportgate(input: {
    url: string;
    grants: string[];
}): policyevaluation;
/** Requires the channel origin grant before one subscription of the 1.1.76 family opens: the event stream and the graphql channel of a subscription ride an origin the session granted, and a channel outside the grants opens nothing. */
export declare function subscribegate(input: {
    url: string;
    grants: string[];
}): policyevaluation;
/** Marks formpost and multipartpost of the 1.1.76 family as sensitive steps: every post mutates a remote state through the reviewed payload, so the review grades the posts sensitive while the subscription, poll and observation transports stay read only. */
export declare function postgate(kind: string): policyevaluation;
/** Requires the explicit file review before one multipart upload of the 1.1.76 family: every file of the payload carries its reviewed flag, and an upload with an unreviewed file refuses before any byte encodes. */
export declare function uploadgate(input: {
    files: Array<{
        reviewed?: boolean;
    }>;
    count: number;
}): policyevaluation;
/** Refuses caching the responses that carry credentials of the 1.1.76 family: a response with an authorization, a cookie or an api key fact never enters the per run cache, because a cached credential answer would serve again without the consent the credential carries. */
export declare function cachegate(input: {
    credentials: boolean;
    url: string;
}): policyevaluation;
/** Applies the rate limit respect of the 1.1.76 family before a transport call: the directive delay holds the call until the reset window of its origin passes, the wait records itself in the audit trail through the caller, and the gate never drops a call silently — a wait past the reviewed budget refuses loudly instead. */
export declare function ratelimitrespectgate(input: {
    waitms: number;
    origin: string;
    budget?: number;
}): policyevaluation;
/** Keeps the correlation mapping of the 1.1.76 family read only inside the run: the request map assigns, joins and exports through the audit trail and never feeds back into a step, a queue or a verdict. */
export declare function correlationmappinggate(operation: string): policyevaluation;
/** Exposes the poll timeout and backoff of the 1.1.76 family as the user choices of the settings: both values resolve exactly as configured and an absent value leaves the poll unbounded because the bounds carry no code default. */
export declare function pollchoices(settings: runsettings | undefined): {
    timeout?: number;
    backoff?: number;
};
/** Bounds the open subscriptions of one run by the user choice only: a subscription count past the user configured ceiling refuses until the user raises the ceiling or closes a channel, and an absent ceiling never refuses because the bound carries no code default. */
export declare function subscriptionboundgate(input: {
    count: number;
    limit?: number;
}): policyevaluation;
/** Marks the observed page api calls of the 1.1.76 family read only: the observation records the endpoints the page called and never replays, refetches or mutates one of them. */
export declare function apicallgrade(operation: string): policyevaluation;
/** Requires the cancellation support of the 1.1.76 family before any transport opens: a subscription without its cancellation path, a poll loop without its stop condition or a channel without its close path refuses before the first byte moves, because a transport that cannot close never opens. */
export declare function transportcancelgate(input: {
    kind: string;
    hascancel: boolean;
}): policyevaluation;
/** Keeps the long poll waits of the 1.1.76 family inside the reviewed wait budget: the poll interval with its timeout retries must fit the reviewed wait window, with no code ceiling on either side. */
export declare function pollwaitbudgetgate(input: {
    interval: number;
    timeout?: number;
    wait?: number;
}): policyevaluation;
/** Requires the user consent for the configured vision model endpoint of the 1.1.77 family: the model and the endpoint stay user configured values, the endpoint origin must parse and sit inside the session grants before any frame leaves the device, and an unconfigured model or endpoint refuses loudly because no recognition ships inside the extension. */
export declare function visiongate(input: {
    endpoint: string;
    model: string;
    granted: string[];
}): policyevaluation;
/** Marks the ocr passes of the 1.1.77 family read only: imageocr, regionocr, pdfocr and frameocr read pixels and never write the page, so the recognition grades beside the read only observations while the visionshot description rides its own consent gate. */
export declare function ocrgate(kind: string): policyevaluation;
/** Refuses the external share of an unredacted screenshot of the 1.1.77 family: a capture that leaves the device — the clipboard, a download or an export — carries its reviewed redactionmask first, because a share that promises nothing masks nothing and leaks what the surface saw. */
export declare function redactgate(input: {
    redacted: boolean;
    destination: string;
}): policyevaluation;
/** Marks the grounding pass of the 1.1.77 family as a read only observation: groundshot maps description labels to page selectors and never clicks, writes or scrolls anything, so the grounding answers the review instead of acting on the page. */
export declare function groundgate(operation: string): policyevaluation;
/** Keeps the dom snapshots of the 1.1.77 family pairs inside the session boundary: a screenshotpair binds the image and the dom snapshot of the same run, and a snapshot of another run never pairs because two runs never share a dom snapshot. */
export declare function pairgate(input: {
    snapshot: {
        runid: string;
    };
    runid: string;
}): policyevaluation;
/** Exposes the vision model and endpoint of the 1.1.77 family as the user choices of the settings: both values resolve exactly as configured and an absent value leaves the model calls refused because no recognition ships inside the extension with a code default. */
export declare function visionchoices(settings: runsettings | undefined): {
    model?: string;
    endpoint?: string;
};
/** Keeps the vision cost reporting of the 1.1.77 family local through the costshare ledger: the visioncost count reads the calls of the run and never ships a metric anywhere, because the cost ledger answers the user alone. */
export declare function visioncostgrade(operation: string): policyevaluation;
/** Requires the explicit user consent before frames of the 1.1.77 family leave the device: a video frame or a screenshot that travels to the vision model endpoint needs the consent recorded, because a frame the user never approved leaving never leaves. */
export declare function visionconsentgate(input: {
    frames: boolean;
    consented: boolean;
}): policyevaluation;
/** Marks the visionshot payloads of the 1.1.77 family as sensitive in the audit trail: the image and the description text of a model call stay out of the audit summaries, because a sensitive payload records its provenance and its shape, never its content. */
export declare function visionsensitivegrade(operation: string): policyevaluation;
/** Validates one ocr region of the 1.1.77 family against the viewport bounds: the geometry stays finite and positive, and a region drawn past the viewport edges names the clamped part it reads while a region fully outside refuses loudly instead of reading wrong pixels. */
export declare function regionboundsgate(input: {
    region: ocrregion;
    viewport: {
        width: number;
        height: number;
    };
}): policyevaluation;
/** Keeps the frameocr waits of the 1.1.77 family inside the reviewed wait budget: the video seek and pause wait must fit the user configured visionwaitbudget window, with no code ceiling on either side because an absent budget never refuses. */
export declare function framebudgetgate(input: {
    waitms: number;
    budget?: number;
}): policyevaluation;
/** Ties the visioncache expiry of the 1.1.77 family to the user retention choice: an entry older than the user configured visioncacheretention window expires at the cleanup pass while an absent window keeps every entry forever, because the expiry bound carries no code default. */
export declare function visioncacheexpirygate(input: {
    entryat: number;
    now: number;
    retention?: number;
}): policyevaluation;
/** Keeps the forensic capture of the 1.1.78 family inside the reviewed plan scope: a beforeafter pair, a diff baseline or a lapse frame names the run of its plan, because forensic evidence of another run never answers this plan's review. */
export declare function forensicscopegate(input: {
    record: {
        runid: string;
    };
    runid: string;
}): policyevaluation;
/** Marks the forensic observation passes of the 1.1.78 family read only: beforeafter, consoletimeline and nettimeline record what the page and the run already showed — the pairs grab pixels, the console timeline reads the consented console capture and the net timeline reads the correlation map — and none of them writes the page or issues a request of its own. */
export declare function forensicsreadonlygate(operation: string): policyevaluation;
/** Requires the user confirmation before a diff baseline of the 1.1.78 family changes: a baseline the review never confirmed flags no regression honestly, because the compared page state must answer the baseline the user froze. */
export declare function diffbasegate(input: {
    confirmed: boolean;
    pagestate: string;
}): policyevaluation;
/** Requires the explicit user start before a timelapse of the 1.1.78 family runs: a lapse captures the page on its interval, so a capture cadence the user never started never starts. */
export declare function timelapsegate(input: {
    userstarted: boolean;
    interval?: number;
}): policyevaluation;
/** Requires the explicit user action before a capture bundle of the 1.1.78 family exports, with the redactshot masks applied and the provlog provenance of every capture aboard: an export nobody asked for, an unmasked capture or a capture without provenance never leaves the device. */
export declare function captureexportgate(input: {
    useraction: boolean;
    redacted: boolean;
    provenance: boolean;
    captures: number;
}): policyevaluation;
/** Excludes the page secrets from the console capture of the 1.1.78 family: the console text the forensic timeline stores runs through the masking rules first, because a console line that carries a secret shaped value leaks it into the evidence. */
export declare function consolemaskgate(input: {
    masked: boolean;
}): policyevaluation;
/** Keeps the net timeline of the 1.1.78 family inside the origin grants of the session: a traced url of an origin the review never granted never enters the forensic net timeline. */
export declare function nettraceorigingate(input: {
    url: string;
    granted: string[];
}): policyevaluation;
/** Keeps the capture retention of the 1.1.78 family a user choice without a forced purge: an absent forensicretention window keeps every pair, timeline entry, diff, thumbnail and lapse frame for the audit trail, and a configured window expires the records only through the user cleanup pass — never through a silent sweep of its own. */
export declare function captureretentiongrade(input: {
    retention?: number;
    pruned: number;
}): policyevaluation;
/** Keeps the thumbnail edge of the 1.1.78 family a user setting: the thumbshot sizing reads the user configured edge and an absent edge keeps every thumbnail at its capture size, because the bound never defaults in code. */
export declare function thumbnailsizereadonlygrade(input: {
    edge?: number;
}): policyevaluation;
/** Keeps the diff threshold of the 1.1.78 family a user setting: the regression flag answers the user configured similarity threshold and an absent threshold never flags, because the bound never defaults in code. */
export declare function diffthresholdgrade(input: {
    threshold?: number;
}): policyevaluation;
/** Keeps the timelapse interval of the 1.1.78 family a user setting without a hard floor: the lapse reads the user configured interval, an absent interval leaves every capture to the explicit user start, and no code floor ever invents a cadence the review never chose. */
export declare function timelapseintervalgrade(input: {
    interval?: number;
}): policyevaluation;
/** Exposes the forensic choices of the 1.1.78 family as the user settings they are: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention resolve exactly as configured while an absent value never hides a code default. */
export declare function forensicchoices(settings: runsettings | undefined): {
    diffthreshold?: number;
    timelapseinterval?: number;
    thumbnailedge?: number;
    forensicretention?: number;
};
/** Refuses any outbound payload of the 1.1.79 family that carries a local rule field: a field the user marked local never leaves the device for any transport — the request body, the sync payload or the export — because the local first rule blocks the field at every boundary. */
export declare function localgate(input: {
    payload: Record<string, unknown>;
    rules: localrule[];
}): policyevaluation;
/** Requires the opt in flag before any sync transport of the 1.1.79 family fires: the data class the payload carries must sit among the enabled classes of the user's sync settings, because a sync nobody turned on never transports. */
export declare function syncgate(input: {
    settings?: syncsettings;
    dataclass: string;
}): policyevaluation;
/** Refuses plaintext sync payloads of the 1.1.79 family: every payload the transport carries encrypts first and stamps its format tag, because a sync that ships readable bytes ships what the user meant to keep private. */
export declare function encryptsyncgate(input: {
    encrypted: boolean;
    formattag?: string;
}): policyevaluation;
/** Requires the typed confirmation before the full purge scope of the 1.1.79 family runs: the exact phrase the user configured answers the request, because a purge nobody typed out never deletes a stored key. */
export declare function purgegate(input: {
    scope: string[];
    confirmation: string;
    typed: string;
}): policyevaluation;
/** Marks the exportall bundle of the 1.1.79 family an explicit user action: a bundle nobody asked for never assembles, because every stored record leaving the device answers a request the review saw. */
export declare function exportallgate(input: {
    useraction: boolean;
    records: number;
}): policyevaluation;
/** Binds every cookie access of the 1.1.79 family to the run jar: the session names the jar the run owns, a sealed jar refuses every write because a completed run never changes its cookie state, and a session without a jar stays outside the cookie isolation. */
export declare function jargate(input: {
    jarid?: string;
    jar?: {
        jarid: string;
        runid: string;
        sealed: boolean;
    };
    runid: string;
    operation: "read" | "write";
}): policyevaluation;
/** Never deletes the audit history of the 1.1.79 family without the user consent: the immutable log hashes survive every cleanup and purge pass, and a pass that would touch the audit trail refuses here. */
export declare function cleanupgate(input: {
    touchesaudit: boolean;
    consent: boolean;
}): policyevaluation;
/** Blocks opening a quarantined file of the 1.1.79 family until the scanner verdict arrives: only a clean verdict releases, a flagged verdict deletes, and a pending or error verdict holds the file in the sandbox folder. */
export declare function quarantineopengate(input: {
    verdict: scanverdict;
}): policyevaluation;
/** Keeps the scanner hooks of the 1.1.79 family on user configured endpoints: a verdict only records through a hook the user configured and granted, because a scanner endpoint the review never saw never receives a file path. */
export declare function scannerhookgate(input: {
    hook?: {
        scanner: string;
        endpoint: string;
        origin: string;
    };
    granted: boolean;
}): policyevaluation;
/** Holds the notelemetry invariant of the 1.1.79 family: the outbound usage call count reads zero in every context, because every counter keeps living inside the local memory and the worker issues no telemetry request at all. */
export declare function notelemetryinvariant(input: {
    outboundcalls: number;
}): policyevaluation;
/** Strips the extract fields of the 1.1.79 family to the reviewed set: every field the extraction carries answers a field the plan review listed, and the localfirst pass removed the rest before anything leaves the page boundary. */
export declare function minimizationstripgrade(input: {
    fields: string[];
    reviewed: string[];
}): policyevaluation;
/** Exposes the minimization choices of the 1.1.79 family as the user settings they are: the sync cadence, the cleanup delay and the jar expiry resolve exactly as configured while an absent value never hides a code default. */
export declare function minimizationchoices(settings: runsettings | undefined): {
    synccadence?: number;
    cleanupdelay?: number;
    jarexpiry?: number;
};
/** Validates one css selector against the reviewed selector grammar the extension and planlint share: the type, id, class, attribute and pseudo class compounds join through the descendant, child, adjacent and sibling combinators while empty selectors, template placeholders, the unreviewed functional pseudo classes and overlong compounds refuse. */
export declare function cssselectorvalid(selector: string): policyevaluation;
/** Reads the option fields a kind strictly requires, from the same reviewed grammar the executor validates: the lint reports a step whose options payload misses them before any run starts, and the executor refuses the same step at run time. */
export declare function kindoptionfields(kind: string): string[];
/** Gates one headless fixture step of the 1.1.80 family: the kind needs its fixture scoped grant, the origin needs the fixture origin and the risk needs the read only vocabulary a recorded page state satisfies, so the consent gates hold against fixtures exactly as they hold against a live tab. */
export declare function fixtureconsentgate(input: {
    fixtureorigin: string;
    grants: string[];
    kind: string;
    riskof: (kind: string) => "read" | "interaction" | "sensitive";
}): policyevaluation;
/** Gates the relay server url of the 1.1.82 site integration family: an empty url stays allowed because it disables the bridge completely, a wss url of any host the user chose stays allowed without vendor assumptions, a plain ws url stays allowed only on the localhost hosts of local bridge testing, and every other scheme, a missing host or a broken port shape refuses before the url saves. */
export declare function serverurlgate(url: string): policyevaluation;
/** Gates the first socket connection of the site bridge: the bridge stays disabled until the user grants the bridge consent, because the first connection to the user configured relay is a consent boundary no code path crosses silently. */
export declare function bridgeconsentgate(input: {
    consent?: boolean;
    connected: boolean;
}): policyevaluation;
/** Gates the member shape of one relay session: exactly one extension side and one site side hold a session, so a second member of either role never joins and the relay session stays a two member room. */
export declare function bridgemembergate(input: {
    extension: number;
    site: number;
}): policyevaluation;
/** Gates the payload minimization of one bridge frame: a page content key never crosses the bridge without the explicit consent flag, so plan text and statuses stay the default payload and the gate names every held key. */
export declare function bridgecontentgate(input: {
    payload: Record<string, unknown>;
    pageconsent?: boolean;
}): policyevaluation;
/** Gates the bridge pairing code lifetime as a user choice: the window stays a positive number of milliseconds because no code default hides inside the gate. */
export declare function bridgepairingwindowvalid(lifetime: number): policyevaluation;
/** Gates the bridge idle window as a user choice: the window stays a positive number of milliseconds because an absent window never expires a session and no code ceiling hides inside the gate. */
export declare function bridgeidlewindowvalid(window: number): policyevaluation;
/** Gates the bridge heartbeat interval as a user choice: the interval stays a positive number of milliseconds because an absent interval sends no heartbeat frames. */
export declare function bridgeheartbeatvalid(interval: number): policyevaluation;
/** Gates the bridge rate cap as a user choice: the cap and the window stay positive values because an absent cap keeps the bridge unbounded as the documented user choice with no code ceiling. */
export declare function bridgeratecapvalid(limit: number, window: number): policyevaluation;
/** Gates every bridge operation against the kill switch: an engaged switch disables the socket and the pairing instantly, so no connect, no pairing mint and no frame passes while the switch stays engaged. */
export declare function bridgekillswitchgate(input: {
    engaged: boolean;
    operation: string;
}): policyevaluation;
/** Gates the origin of one incoming bridge frame: the frame session must match the session the origin paired with and the sender must hold the pairing, so a frame of another origin or an unpaired sender never reaches the extension. */
export declare function bridgeframeorigingate(input: {
    framesession?: string;
    framesender?: string;
    sessionid: string;
    origin: string;
    paired: boolean;
}): policyevaluation;
/** Reads the site bridge choices of one settings record: the relay url, the consent flags, the idle window, the heartbeat interval, the rate cap and its window, and the pairing lifetime — every bound the user set with no code default beside it. */
export declare function bridgechoices(settings: runsettings | undefined): {
    serverurl?: string;
    bridgeconsent?: boolean;
    bridgepageconsent?: boolean;
    bridgeidlewindow?: number;
    bridgeheartbeatinterval?: number;
    bridgeratelimit?: number;
    bridgeratewindow?: number;
    bridgepairinglifetime?: number;
};
/**
 * The provider gateway gates of the 1.1.83 family.
 * Every gateway bound stays a user choice: the base url of a remote provider never carries a default value, the ollamalocal adapter alone defaults to the localhost machine and refuses every cloud address, the per provider enable toggle ships disabled, the consent stamp gates the first remote call, the key store demands its explicit consent before any key material enters the vault seam and the retry cap of the guardrails validates as a finite non negative count.
 */
/** Validates one provider base url before it saves: the scheme stays http or https, the host stays present, the path shape carries no query, no fragment and no parent traversal, a remote provider speaks https unless it serves a local machine address and the ollamalocal adapter accepts local machine addresses only — never a cloud url. */
export declare function gatewaybaseurlgate(input: {
    kind: gatewaykind;
    baseurl: string;
}): policyevaluation;
/** Validates one path prefix of a gateway deployment: the prefix stays a plain namespace path without query, fragment or relative segments, and an empty prefix stays valid because deployments without a namespace carry none. */
export declare function gatewayprefixgate(prefix: string): policyevaluation;
/** Gates the first remote call of one provider: a remote provider needs its enable toggle on and its consent stamp before any call leaves, while the local ollamalocal runtime needs its enable toggle on and never asks the remote consent because its calls never leave the machine. */
export declare function gatewayconsentgate(input: {
    config: {
        kind: gatewaykind;
        baseurl: string;
        enabled: boolean;
        consented?: boolean;
    };
    local?: boolean;
}): policyevaluation;
/** Gates the storage of one provider api key behind the vault seam: the key material enters the vault only under the explicit consent of the user, because a stored key is a standing credential the review must have seen. */
export declare function gatewaykeyconsentgate(input: {
    consent: boolean;
    providerid: string;
}): policyevaluation;
/** Validates the configured retry cap of the gateway guardrails: the cap stays a finite non negative count when the user sets one, because a negative or fractional retry count grades nothing. */
export declare function gatewayretrycapvalid(retries: number | undefined): policyevaluation;
/** Validates the model cache refresh window: the window stays a finite positive millisecond count when the user sets one, because a non positive window refreshes on every read and grades nothing. */
export declare function gatewaycachewindowvalid(window: number | undefined): policyevaluation;
/**
 * The native transport gates of the 1.1.85 native host bridge family.
 * Every native bound stays a user choice and the posture stays deny by default: the install consent gate explains the scope before any host registration, the transport consent gate asks per call class so a read grant never widens into an interaction or a sensitive surface, the sensitive native calls route through the human approval gate, the kill switch and the escape hatch stop every native call in one press, the headless mode keeps the transport disabled unless the user configured a host, and the idle window, the heartbeat interval and the rate cap with its window validate as finite positive user values because a native transport bound never hides a code default.
 */
/** Gates the host registration of the native transport: the install consent explains the scope of the host manifest — the companion process the manifest launches, the profile directory it writes into and the extension origins it allows — and the installer writes no manifest before the recorded consent exists. */
export declare function nativeinstallconsentgate(input: {
    consent?: boolean;
    profiledir: string;
    hostname: string;
}): policyevaluation;
/** Gates one native call per class: the transport consent opens the bridge, the call class asks on its own so read, interaction and sensitive stay separate grants, and an uninstalled host never attaches regardless of the consents. */
export declare function nativetransportconsentgate(input: {
    consent?: boolean;
    installed: boolean;
    callclass: nativecallclass;
    classconsents?: nativecallclass[];
    killswitch?: boolean;
}): policyevaluation;
/** Gates one sensitive native call through the human approval: a sensitive class native call never runs on the class grant alone, because a desktop surface that addresses the user waits for the human approval the review panel records. */
export declare function nativesensitiveapprovalgate(input: {
    callclass: nativecallclass;
    approval?: boolean;
}): policyevaluation;
/** Gates the native transport kill switch: one press engages the switch and every native call stops instantly — the port detaches, the wsbridge session closes and no frame crosses until the user releases the switch. */
export declare function nativekillswitchgate(input: {
    engaged: boolean;
    operation: string;
}): policyevaluation;
/** Gates the escape hatch of the native transport: one key press stops every in flight native call at once, because a one press halt of the whole native surface is a human action the review never replaces. */
export declare function nativeescapehatchgate(input: {
    pressed: boolean;
    inflight: number;
}): policyevaluation;
/** Gates the native transport inside headless mode: the headless run keeps the transport disabled unless the user configured a host, because a headless run never attaches a desktop host the user did not name. */
export declare function nativeheadlessgate(input: {
    headless: boolean;
    hostconfigured: boolean;
}): policyevaluation;
/** Validates the native transport idle window: the window stays a finite positive millisecond count when the user sets one, because a non positive window expires every session at once and grades nothing. */
export declare function nativeidlewindowvalid(window: number | undefined): policyevaluation;
/** Validates the native heartbeat interval: the interval stays a finite positive millisecond count when the user sets one, because a non positive interval detects a live host as dead. */
export declare function nativeheartbeatintervalvalid(interval: number | undefined): policyevaluation;
/** Validates the native transport rate cap: the cap stays a finite positive count when the user sets one, because a non positive cap refuses every call and grades nothing. */
export declare function nativeratecapvalid(cap: number | undefined): policyevaluation;
//# sourceMappingURL=policy.d.ts.map