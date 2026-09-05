import { defaultmaskshapes } from "./security.js";
import { actionrisk, environmentrequirements, iscdpkind, isemulationkind, isprofilekind, issessionkind, istriggeraction, isworkflowkind, outboundtarget, parseoptions, resolvedrisk, sockettarget, submitreviewgranted, triggerorigins, validatestep } from "./policy.js";
import { blockinvocationof, composeworkflow, validateworkflow, workflowblockof, workflowstepof } from "./workflow.js";
import { controlsummary } from "./workflow.js";
import { importsessionfile } from "./session.js";
import type { classconsent, consentwindow, controlflowdecision, editormodel, environmentkind, environmentrequirement, manualrun, maskrule, offscreenregistryentry, originprofile, revokerunevent, runlogentry, runhistoryentry, siteoverride, steptemplate, timeoutabort, triggerfire, triggerule, variablescope, watchdogconfig, watchdogrecord, workflowprovenance, workflowrecord, workflowrun, workflowversion, versiondiff } from "./types.js";
import { blockruleof, patternorigin, proxyrouteof } from "./net.js";
import { allowlistcovers, cdpallowlistof, cdpdomains, methoddomain, teardownplanof } from "./debug.js";
import { annotationof, attachtargetof, tracecategories } from "./debug.js";
import { loglevels } from "./run.js";
import { locationpresetof, permissiongrantof, revertplanof } from "./environments.js";
import { protocolversion, servercontractversion, type agentplan, type agentrecord, type agentrole, type aggregaterecord, type apimapentry, type attachtarget, type auditexportrecord, type bannerreport, type budgetstate, type consensusrecord, type costentry, type depthlimit, type lessonrecord, type loadreport, type prefetchplan, type spawnrecord, type subagentspec, type tasklane, type allowlistentry, type approvalrequest, type authchallenge, type blockrule, type breakpointspec, type callrecord, type cdpallowlist, type cdpcommand, type cdpeventrule, type cdpsession, type channelrecord, type clientidentity, type clickablemap, type consolediff, type cookieoperation, type cpuprofile, type dataset, type debuggergrant, type downloadrecord, type errorrecord, type errorreport, type eventsubscription, type exchangerecord, type extractsession, type flowmetric, type focusevent, type formreport, type growsample, type headerule, type heaprecord, type httpstreamconfig, type imagebatch, type jsonrpcframe, type keyholdstate, type longtaskentry, type mediarecord, type memoryitem, type memoryprovenance, type memorytrend, type mockspec, type mutationevent, type navstate, type netlogrecord, type observation, type pagesignals, type pausestate, type planproposal, type proposalrequest, type provenancerecord, type proxyroute, type quarantineentry, type ratelimitread, type rejectionrecord, type resolvedtarget, type rpcerror, type rpcerrorcode, type safetyverdict, type scriptoverride, type selectorcandidate, type sessiontoken, type shiftentry, type shotpair, type shotrecord, type snapshotdiff, type sourcemapconsent, type sourcemapref, type stepoutcome, type streamchannel, type tablayout, type tabreport, type timelineentry, type tlsconfig, type tokenrecord, type toolresult, type toolstep, type tracerecord, type trailentry, type transformrule, type typeaheadpick, type watchexpression, type wizardstate, type blackboxrule, type devicepreset, type networkpreset, type locationconsent, type locationpreset, type agentpreset, type presetlibrary, type emulationlayer, type emulationstate, type permissionoverriderecord, type sessionrecord, type sessionevent, type sessionfolder, type sessiondiff, type autointerval, type runtimelineevent, type urlvisit, type servereventtype } from "./types.js";
import { authrefusedmessage } from "./auth.js";
import { bridgepayload } from "./bridge.js";
import { defaultheartbeatms, defaultidlewindowms } from "./http.js";
import { redactparams } from "./gates.js";
import { rpcerrorof } from "./mcp.js";
import type { agentevent, batchcall, batchoutcome, callcontext, callratelimit, cancelframe, criticreview, eventkind, handoffrecord, idempotencykey, idempotencyrecord, modeloutput, plandraft, progressnotice, promptdef, protocoleventsubscription, progressboard, resourcewatch, reviewrequest, samplingrequest, streamchunk, structurederror, swarmstate, toolcallrecord, toolmock, tooldryrun } from "./types.js";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Protocol message must be an object.");
  return value as Record<string, unknown>;
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string.`);
  return value.trim();
}

/**
 * Reviewed options grammar shared by every step kind.
 *
 * A step may carry a JSON `options` object with the following reviewed fields:
 * - `targetref`: element addressing without a css selector, with `mode` one of `selector`, `text`, `aria`, `name`, `xpath`, `index` or `point`; the text mode carries `text`, the aria mode carries `role` plus `name`, the name mode carries `name`, the xpath mode carries `xpath`, the index mode carries a one based clickable map `index`, and the point mode carries viewport `x` and `y` coordinates.
 * - `pointpath`: pointer travel between two points, with `start` and `end` points, optional `waypoints` and a `duration` in milliseconds.
 * - `speedprofile`: pointer speed shape with `easing` (`linear` or `easeinout`), a `peak` velocity in pixels per second and a `jitter` window in milliseconds.
 * - `framepath`: ordered frame indexes routing a step inside same origin iframes.
 * - `shadow`: ordered host selectors addressing a target across open shadow roots.
 * - `retryrule`: retry bounds with `attempts`, a `settle` window in milliseconds and a movement `tolerance` in pixels; attempts carry no code ceiling.
 * - `dialogpolicy`: dialog answers with an `accept` flag and a reviewed prompt `answer` string.
 * - wrapper steps (`retryaction`, `enterframe`) reference an inner step by `stepid` or inline with `kind`, `target`, `value` and an `options` object.
 * - control kinds add reviewed `delay`, `values`, `results`, `timeout`, `holdid` and `modifiers` fields.
 * - watch kinds (`watchmutate`, `watchbanner`, `watchfocus`) carry a reviewed `lifetime` window in milliseconds, optional selector `scopes`, optional event kind filters `events` and an optional `poll` interval; the lifetime window carries no code ceiling.
 * - `waitquiet` carries a reviewed `quietrule` with a positive `idle` threshold in milliseconds, an optional `poll` interval and an optional `timeout`; every value carries no code ceiling.
 * - `diffsnapshots` carries exactly two reviewed observation `versions` to compare.
 * - navigation kinds carry the navigation parameter grammar: `navtarget` with a `url`, a `container` (`current`, `tab`, `window` or `private`), a `position` (`adjacent` or `end`) and a `private` flag; `waitprofile` with non-empty load `signals`, optional `idle` and `timeout` thresholds and per origin `overrides`; and `urlpattern` with a `mode` (`exact`, `prefix`, `host` or `pattern`), a `url`, optional `query` parameter expectations and an optional `fragment`.
 * - `waiturl` and `spawait` carry a reviewed `urlpattern`, `timeout` and `poll`; `spanav` carries an optional `routepattern`, `followlink` an optional `fragment` flag, `rewritequery` reviewed `set` and `remove` query edits, `navlist`/`prefetch`/`batchopen` reviewed `urls` lists, `preconnect` reviewed `origins`, `navrate` a reviewed `ratelimit` with `domain`, `window` and `ceiling` (never capped in code), and `deeplink` a reviewed `app` pattern with `params`.
 * - observation kinds attach structured evidence to step details: a11y trees, reader articles, list patterns, table shapes, pagination estimates, watch event records, quiet probe samples, snapshot diffs and derived selector candidates with stability scores.
 * - navigation steps attach structured evidence to step details: load phases and ready states, final urls after redirects, redirect chains with statuses and timing, http error, offline and certificate interstitial states, safety verdicts and navlist entry completions.
 * - the tabs and windows command family adds its parameter grammar: `tabquery` with url, title, id and pattern matchers (at least one matcher required, patterns use `*` and `**` wildcards); `group` with a `name`, a Chromium tab group `color`, member `tabids` and a `collapsed` flag; `layout` names for `savelayout` and `restorelayout`; reviewed `pinned`, `muted`, `index`, `windowid`, `direction`, `step`, `bounds`, `label`, `labels`, `taskrefs`, `provenance` and `run` fields; `tabcreate` gains reviewed `background` and `window` options and `windowcreate` gains reviewed `left`, `top`, `width`, `height` and `state` options; `closepattern` requires the explicit `reviewed` flag before any tab closes.
 * - tab command steps attach structured evidence to step details: tab reports with matched tabs carrying audio state and metadata, group registries, badge states, layout snapshots, clone warnings, discard candidates and watchtab event records.
 * - the forms and data family adds its parameter grammar: `formrecord` with an optional `form` selector and non-empty `entries` of `{ match, kind, value }` where `match` is a `fieldmatch` with `mode` one of `label`, `placeholder`, `arialabel` or `name`; `valuegen` with a field `kind`, an optional `locale` and an optional numeric `seed`; `fields` lists of label or placeholder value pairs for filllabel and fillplaceholder; a reviewed `name` plus `formrecord` for saveprofiles; a reviewed `consentref` for submitform and consentpassword; a reviewed `backoff` rule with `wait` and `factor` plus an optional `attempts` for retryform with no code ceiling; a reviewed `child` selector, `pick` entry, `pause` and `timeout` for chains, typeaheads and card typing; reviewed card `segments`; and a reviewed `source` for fillcode; password entries inside form records are refused because passwords need the explicit consentpassword consent.
 * - form steps attach structured evidence to step details: form reports with detected fields, kinds and matched controls, error reports with field refs and messages, wizard states with step history, typeahead picks, honeypot flags, login detections with session link markers and signup or checkout template detections.
 * - the forms and data part two family adds its parameter grammar: `scrapetable` and `paginateextract` carry an optional dataset `name`, an optional positive integer `rowlimit` (never capped in code), a reviewed `next` control selector, an optional positive integer `pages` count (never capped in code) and an optional `wait` row freshness window; the export kinds (`exportcsv`, `exportjson`, `exportexcel`, `copytable`, `streamdisk`, `pushsheets`) carry a reviewed `dataset` id, an optional artifact `name`, an optional single character csv `delimiter`, a reviewed positive integer streaming `chunk` size (never capped in code) and, for sheet pushes, a reviewed HTTPS `sheet` endpoint plus the explicit `reviewed` flag; `importcsv` carries reviewed `csv` text with an optional `name` and a `mapping` object of csv headers to target keys; `looprows` carries a reviewed `dataset` id, an optional row `variable` name and a wrapped inner step by `stepid` or inline; `transformvalues` carries reviewed `rules` of `{ expression, sources, target }` where the expression is `trim`, `upper`, `lower`, `number`, `prefix:x`, `suffix:x` or `replace:from=>to`; `deduperows` carries reviewed dedupe `keys`; `mergepages` carries a reviewed `datasets` id list; `stamplerows` carries a reviewed `dataset` id with an optional `url`; `previewgrid` carries a reviewed `dataset` id with an optional `sample` row count (never capped in code); `resumeextract` carries a reviewed `session` id; and `logprovenance` carries a reviewed `artifact` id or name.
 * - the data pipelines family of the 1.1.75 release adds its parameter grammar: every extract step (`scrapetable`, `paginateextract`, `resumeextract`, `transformvalues`, `deduperows`, `stamplerows`, `previewgrid`, `streamdisk` and `logprovenance`) may carry a reviewed `pipeline` reference naming the extractpipeline its rows flow through, the transform rules of the pipeline grammar pair their `field` with a reviewed `operation` of `trim`, `case`, `number` or `date` (an unknown operation refuses), the dedupe key carries its `columns` with their `normalization` of none, whitespace, case or whitespace and case, and the sample policy carries its `rows` count with its `strategy` of first, random or stratified — every count stays a user choice with no code ceiling.
 * - data steps attach structured evidence to step details: scraped grids with normalized column specs, span filled rows and nested child datasets, pagination page counts with remaining next controls, dataset previews with sampled rows, dedupe removed counts, transform error lists, stream chunk states and provenance records with checksums and row ranges.
 * - the files, clipboard and downloads family adds its parameter grammar: `batchdownload` carries a reviewed `downloadspec` with a non-empty `urls` list, an optional `filename` rule and an optional `complete` criterion (`size` or `checksum`) plus an optional positive integer `concurrent` window (never capped in code); `pausedownload`, `resumedownload`, `verifydownload`, `quarantinedownload` and `scanvirus` carry a reviewed download or quarantine reference with optional `checksum`, `bytes`, `scanner` and `reason` fields; `interceptmime` carries a reviewed `mimefilter` with non-empty `include` patterns, optional `exclude` patterns and the `deny` or `allow` default for unlisted mime types; `readclipboard` carries a reviewed `consentref` plus an optional `prompt`; `exportnetlog` carries an optional `stepid` filter; `namecaptures` carries a reviewed `task` with optional `steps` and `extension`; and `cleanupartifacts` carries reviewed `rules` of `{ age, kind, keep }` where the age window carries no code ceiling and the keep policy is `none`, `latest` or `all`.
 * - files steps attach structured evidence to step details: batch download reports with per file states, resolved paths and checksums, verification match results, netlog records correlated with steps through request ids, clipboard entries with payload hashes and origin provenance (the payload text never appears), quarantine entries with scan verdicts and release refs, capture names stamped from task, step and sequence parts, and cleanup run outcomes with removed and kept counts.
 * - the media capture family adds its parameter grammar: every capture kind (`shotview`, `shotfullpage`, `shotelement`, `shotregion`, `contactsheet`) carries a reviewed `capture` options object with `format` (`png`, `jpeg` or `webp`), `quality` between zero and one hundred, `pixelratio` from one up with no code ceiling, an `annotate` flag and an `exporttarget` of `memory`, `download` or `clipboard`; `shotfullpage` adds reviewed `settle`, `overlap` and `wait` windows that keep the stitching scroll budget inside the reviewed wait window; `shotelement` addresses its element through the step target; `shotregion` requires a reviewed `regionrect` of `x`, `y`, `width` and `height` in css pixels plus the explicit `reviewed` flag, with an optional scrollable `container` selector and `steps` count; `contactsheet` carries reviewed `elements` selectors with an optional `sheet` layout of `cellsize`, `columns` and `label` (`none`, `index`, `selector` or `both`); and a reviewed `naming` rule of `run`, `step`, `sequence` and `kind` segment flags extends the 1.1.39 capture naming rule with the capture kind segment.
 * - capture steps attach structured evidence to step details: shotrecords with record id, run, step, kind, format, geometry and byte size, the stitch tile count of full page captures, shotpair ids of before and after state captures with their action kind, target selector and dom snapshot id, and contact sheet cells with selector labels; the response envelope gains a capture block with the record id, format and byte size, and the capture report carries every stored record and pair.
 * - the media capture part two family adds its parameter grammar: `capturepdf` carries reviewed `pdf` options of `paperwidth` and `paperheight` inches (positive, never capped in code), `margins` of `top`, `right`, `bottom` and `left` inches (negative margins are refused), a positive `scale`, `landscape` and `paginate` flags, optional reviewed break point `selectors` and an `exporttarget` of memory or download; `recordscreen` and `captureaudio` carry reviewed `recording` options of `scope` (`tab` or `run`), positive `fps` and `bitrate` values with no code ceilings, an `audio` flag, a positive `duration` window and a reviewed `consentref` of an approved recording consent prompt; `captureframe` addresses a video element through the step target with an optional `timestamp` in seconds and a `poster` flag; `downloadimages` carries a reviewed `imagefilter` of `selector` scope, `minwidth` and `minheight` thresholds and a `formats` list plus an optional `naming` rule; `shotcanvas` addresses a canvas element through the step target with reviewed capture options; `probestream` carries an optional scope `selector`; `readmedia` and `readassets` carry no parameters; `timelapse` carries a reviewed `lapse` plan of positive `interval` and `duration` windows with a `format` and the lapse duration kept inside the reviewed `wait` budget; `convertimage` carries reviewed `capture` or `captures` ids plus a `convert` directive of `source`, `target` (png, jpeg or webp) and `quality`; and `makethumbs` carries the same capture ids plus a `thumb` directive of positive `size`, `fit` (cover or contain) and `suffix`.
 * - media steps attach structured evidence to step details: pdf records with page count, paper size, margins and byte size, recording records with ids, durations, frame counts and file refs, image batches with filter match counts and deduplicated url lists, frame records with source, timestamp and poster flag, canvas records with context kind, stream probe results with track details, asset lists and ordered lapse frame ids; the response envelope gains a media block with the record id, kind and byte size, and the media report carries every stored media record and image batch.
 * - the network observation family adds its parameter grammar: `fetchurl` carries a reviewed `fetch` request of `url`, `method` (a known HTTP verb), a custom header `allowlist` object whose names must be non-empty (empty header names are refused), an optional string `body` and a `mode` of `cors`, `no-cors` or `same-origin`, plus a reviewed `fetchoptions` object of `timeout`, `retries`, `backoff` and the redirect `follow` limit (every bound a user choice with no code ceiling) whose worst case must fit the reviewed `wait` budget, an optional `stream` window with its byte `budget` ceiling and a reviewed `consentref` required before any custom header leaves the extension; `parsejson` carries a reviewed stored `call` id and `fields` json path rules of `{ name, path, kind, default }` with dotted paths of non-empty segments; `parsehtml` carries the same `call` id and `queries` of `{ selector, attribute, multi }`; `callrest` carries a reviewed typed `endpoint` name, an optional `payload` object, an optional method `override` and a reviewed `success` status list; `callgraphql` carries the same `endpoint` name and a reviewed `graphql` request of `query` text, `operationkind` (`query` or `mutation`, unknown kinds are refused), optional `variables` and `operationname`; both typed calls accept reviewed `apikeys` references to stored key records.
 * - the network observation part two family adds its parameter grammar: `opensocket` carries a reviewed `socket` of `url` (wss for websockets, https for streams), optional `protocols`, an integer `reconnect` budget, a `backoff` base, a `backoffceiling` where exponential growth stops and an optional `lifetime` window (every bound a user choice with no code ceiling); `sendmessage` carries a reviewed `message` of the open `channel` id, an optional named `stream` and the reviewed `payload` string; `waitmessage` carries a reviewed `filter` of `stream`, a dotted json `path` and the `limit` match count plus the `wait` budget it stops on; `subscribesse` carries a reviewed `subscription` of the event stream `url`, an optional resume `lasteventid`, an optional `lifetime` and the required `cancel` cancellation path; `longpoll` carries a reviewed `poll` cursor of `url`, `cursorfield`, positive `interval`, the required `stop` condition of `{ field, equals }`, an optional `maxpolls` ceiling and the cursor `param` name, with the interval kept inside the reviewed `wait` budget; `watchrequests` carries an optional `watch` window and a user configured match `limit`; `readheaders` carries a reviewed `headers` filter whose `allow` allowlist and `redact` redaction list are both required non-empty before any header value is stored; `capturebodies` carries a reviewed `body` filter of `urlpattern`, `mimes` and the byte `ceiling`; `mapapi` carries an optional match `limit`; and `extractapi` carries a reviewed `replay` spec of the captured `endpoint`, the replay `verb`, parameter `overrides` and dotted extraction `paths`.
 * - network observation part two steps attach structured evidence to step details: the network block with the exchange count and channel state, matched message envelopes with their channel scoped sequence numbers and event counts of stream subscriptions, poll loop iterations with cursor values and stop reasons, observed exchanges with correlation ids, request lifecycle timings and error classes, redacted header views, captured body records with mime types and byte sizes inside the reviewed ceiling, ranked api map entries with frequency, json share and payload stability, and replayed endpoint fields mapped onto extraction paths; the response envelope gains a network block, and the exchanges report carries every exchange, channel, subscription and api map entry of the run.
 * - http steps attach structured evidence to step details: the transport block with status, response header names, byte size and duration, retry counts and stream byte counts, parsedfield values extracted by dotted paths with miss flags, html query results with attribute values, text and element counts, the endpoint name of rest and graphql results, structured json error bodies and every graphql error mapped beside the step that produced it; the response envelope gains a transport block, and the calls report carries every stored call record with the bodies held back.
 * - the network control family adds its parameter grammar: `blockrequest` carries a reviewed `block` rule of an https origin `urlpattern` (patterns without a named origin are refused), an optional `resourcetypes` list and the explicit `reviewed` flag behind the blockgate; `mockresponse` carries a reviewed `mock` fixture of the same origin `urlpattern`, an integer `status`, optional `headers` and either the full `body` reviewed through the explicit `reviewed` flag or a `bodyref` of a captured body of the 1.1.43 body store the fixture replays; `rewriteheaders` carries reviewed `rules` of `{ urlpattern, name, operation, value }` where every pattern names its origin explicitly and the operation is `set`, `append` or `remove`; `setcookies` carries reviewed `cookies` records of `{ name, domain, path, value, expiresat }` scoped to granted domains by the cookiegate; `readcookies` carries an optional `domain`; `clearcookies` carries a reviewed `domain` with an optional `names` list; `authflow` carries a reviewed `oauth` flow of `provider`, https `authorizeurl` and `tokenurl`, `scopes` and the granted `redirectorigin` plus the reviewed provider `consentref`; `saveapikey` carries a reviewed `key` entry of `name`, https origin `origins` scopes, the attaching `header` and the secret `value` behind the explicit `consentref`; `routeproxy` carries a reviewed `proxy` route of `scheme` (http, https, socks4 or socks5), `host`, `port` and the required non-empty `bypass` origin list behind the reviewed `consentref` of the proxygate; `postform` carries a reviewed `form` payload of the https `url` and its `fields`; and `postfiles` carries a reviewed `upload` payload of the https `url`, `fields` and `files` where every file carries the explicit `reviewed` flag before any multipart upload includes it.
 * - network control steps attach structured evidence to step details: the control block with the applied, blocked and mocked rule counts of the run, blocked counts per rule, applied header rewrite rules with their provenance, redacted cookie views without values, oauth flow state with provider and scopes while token values never appear, api key entries with last use timestamps and no key material, proxy route state with apply and revert times, rate limit waits with reset times, urlencoded form encodings and streamed multipart upload progress; the response envelope gains a control block, and the auth report carries token metadata per provider with scopes and expiry windows but no token values.
 * - the debugging family adds its parameter grammar: `watchconsole`, `watcherrors` and `watchtasks` carry a reviewed `watch` window object with a `window` in milliseconds kept inside the reviewed `wait` budget (both user choices with no code ceiling), a `level` floor from the reviewed level set (`error`, `warn`, `info`, `log`, `debug`, `trace`) and optional `sources` filters from the reviewed timeline source grammar (`console`, `error`, `rejection`, `resource`, `longtask`, `network`); `watchconsole` adds the required non-empty `redact` pattern list applied before any console text leaves the page bridge, a `depth` serialization bound, a `spam` rule of `pattern`, `windowsize` and `collapse` threshold and a `rotation` rule of `maxentries` with an `overflowtarget` store; `watchtasks` adds an optional `threshold` in milliseconds; the kinds stay read only behind the timelinegate that scopes capture to the run tab.
 * - debugging steps attach structured evidence to step details: the timeline block with the entry counts per level and the spam collapse count, console entries with their level, redacted text and argument kinds, error and rejection ids with stack frames, source urls and lines, resource failures with element context, long task entries with attribution names and the blocking duration per step window; the response envelope gains a timeline block, and the timeline report carries every entry, error record, rejection record and long task entry of the run while the console diff report carries the added, removed and repeated line classes of two compared runs.
 * - the debugging part two family adds its parameter grammar: `attachcdp` carries a reviewed non-empty `domains` list of the reviewed domain grammar (`Runtime`, `Log`, `Debugger`, `DOM`, `Network`, `Page`), the required `teardown` plan of `revertsteps` with the `resumepolicy` of resume, pause or ask (attaches without one are refused at validation and in the proposal parser) and an optional method `allowlist` of `Domain.method` gates inside the enabled domains; `detachcdp` carries no parameters and reverts every breakpoint and override before detaching; `cdpcmd` carries a reviewed `command` of the `Domain.method` form with optional `params` and a dotted `resultpath`, and its method domain must stay inside the enabled domain allowlist of the plan attach; `watchcdp` carries reviewed `events` rules of `domain`, `event` and optional payload `match` plus the required `watch` lifetime window kept inside the reviewed `wait` budget; `setbreakpoint` carries a reviewed `breakpoint` of https `url`, zero based `line`, optional `column` and a `condition` of the reviewed expression grammar (member chains, literals, comparison and logic operators, negation and parentheses only); `stepcode` carries the reviewed `mode` of stepover, stepinto, stepout or resume; `watchexpr` carries the reviewed `expression` text with its pause `scope` and the explicit `reviewed` flag before any evaluation; and `overridescript` carries a reviewed `override` of an https origin `urlpattern` with the full fixture `source` behind the explicit `reviewed` flag.
 * - debugging part two steps attach structured evidence to step details: the cdp block with the session state and command ids, pausestate summaries with their call frames and dom snapshot ids, event counts per domain of watchcdp results, breakpoint registrations with hit counts, watch expression values per pause and override applications with revert controls; the response envelope gains a cdp block, and the cdp report carries every session, command outcome, event rule, breakpoint, pause state, watch expression and override of the run with the override sources held back.
 * - the debugging part three family adds its parameter grammar: `measureflow` carries a reviewed `flow` spec of the `prefix` mark prefix, the `steps` step window and the `metrics` list of the reviewed metric set (`navigation`, `paint`, `lcp`, `fid`, `interaction`, `blocking`) plus the required `watch` window inside the reviewed `wait` budget; `heapshot` carries an optional reviewed `heap` object with the user chosen snapshot `interval` only; `trackmemory` carries a reviewed `growth` object with the reviewed `slope` in bytes per millisecond and the optional user chosen sampling `interval`; `profilecpu` carries a reviewed `profile` object with the profiled `duration` kept inside the reviewed `wait` budget; `watchshifts` carries the reviewed `watch` window of the user chosen observation length with an optional score `threshold`; `traceload` carries a reviewed `trace` object with a non-empty `categories` list of the reviewed category grammar (`navigation`, `scripting`, `rendering`, `painting`, `loading`, `network`), the reviewed trace `window` it stops at and the optional `exporttarget` of memory or download, and the user configured trace byte ceiling applies at export; `annotatetrace` carries the stored `trace` id with its `traceid` plus the required non-empty `annotations` list of `stepid`, `label` and optional `offset` so exported traces never lose their step ids; `replaytrace` carries the stored trace id of a recorded trace and renders the file offline; `capturesourcemaps` carries an optional `scripts` list of reviewed HTTPS urls and needs the per origin source map consent first; profiling kinds also accept `target` and `attachtargets` parameters of the reviewed attach target grammar with the `kind` of page, iframe, worker or serviceworker and the https `url`, and every non page target stays inside the granted origins.
 * - the emulation family adds its parameter grammar: `emulatedevice` carries a reviewed `device` preset of `name`, positive integer `width` and `height`, positive `pixelratio` and the `mobile` flag, an optional boolean `reload` flag so the page reloads only when the reviewed plan asks, the explicit `reviewed` flag behind the emulation gate and the required `revertplan` list beside every layer (steps without one are refused at validation and in the proposal parser); `emulatenetwork` carries a reviewed `network` preset of `name`, zero or positive `latency`, `download` and `upload` bounds and the `offline` flag with an optional offline `window` in milliseconds; `emulatelocate` carries a reviewed `location` preset of `name`, a `latitude` inside -90 and 90, a `longitude` inside -180 and 180 and a zero or positive `accuracy` radius behind the per origin location consent with the coordinates shown in the prompt (values out of range are refused in the proposal parser); `setuseragent` carries a reviewed `agent` preset of the `useragent` string of the reviewed grammar, the `platform` and the non-empty `brands` list applied together and scoped to the run tab only; `overridepermission` carries a reviewed `permission` grant of the reviewed browser permission set `name`, the `state` of granted, denied or prompt and the `runscope` flag while the prior state restores at run end (unknown permission names are refused in the proposal parser); `blackboxscripts` carries a reviewed non-empty `rules` list of `urlpatterns` where every pattern names its https origin explicitly with single star segments and double star subtrees plus the `tracescope` of profiles, traces or both, and blackboxing stays read only trace shaping.
 * - the session memory family adds its parameter grammar: `persiststate` writes the task state checkpoint of the run with an optional boolean `resume` flag; `capturesession` carries a reviewed `snapshot` plan of the `scope` of tab, run or all, the non-empty `sections` list of the reviewed toggle grammar (`tabs`, `scroll`, `forms`, `storage`, `cookies`), the `captures` link flag and the optional `auto` interval of a positive `period`, a positive `maxsnapshots` count and a zero or positive `expiry` window where every value stays a user choice with no code ceiling; `restoresession` carries the reviewed `sessionid` of the saved record, a reviewed `restore` plan of the `tabpolicy` of reopen or skip, the `formpolicy` of restore or skip and the `capturepolicy` of link or skip, the explicit `reviewed` flag of the restore review and the `origins` list of every origin the record reopens (a restore that reopens an origin outside the grants is refused in the proposal parser, and a restore without the reviewed flag or plan is refused at validation); `namedsessions` carries the reviewed `sessionid`, a unique non-empty `name`, an optional `folder` and an optional `tags` list; `diffsessions` carries the reviewed `left` and `right` ids of two saved sessions; `searchsessions` carries a reviewed `query` of the non-empty `terms` list, the `fields` subset of urls, titles, names and text and the optional `from` and `to` time window; `exportsessions` carries the explicit `reviewed` flag of the export review and an optional non-empty `ids` list of the saved records it packs; `importsessions` carries the explicit `reviewed` flag of the full record review and the reviewed `file` of the known format version with an intact checksum (import files of unknown format versions are refused in the proposal parser).
 * - session memory steps attach structured evidence to step details: the session block with the record id and the section counts of a capture, the restored and skipped tab counts of a restore, the match count of a search, the cursor of a persist checkpoint and the byte size of an export; snapshot and restore ids travel in the step result details, and the session report carries every saved record, session event, folder, stored diff and the auto snapshot interval of the run.
 * - debugging part three steps attach structured evidence to step details: the profile block with the flow metric count and the memory sample count, the flow durations per step, the heap and cpu profile record ids with their byte, node and sample counts, the layout shift entries with scores and impacted selectors, the trace record with its category list, event count and step annotations, and the source map references with their parsed state; the response envelope gains a profile block, and the profile report carries every flow metric, heap record, growth sample, growth trend, cpu profile, shift entry, trace record and source map reference of the run while the source map consent prompts stay held back.
 *
 * Workflow kinds add the reviewed grammar of the 1.1.50 family: `composeworkflow` carries the `workflow` payload with its `name`, positive integer `version`, granted HTTPS `origins`, the `steps` list of workflow steps (each with `id`, `kind`, `label` and optional `target`, `value`, `options`, output `bindings`, an inline `expression` and an inline `extract` regex rule) and the reusable `blocks` list (each with a unique lowercase `name`, `label` and child steps or further `{ block, label }` invocations); blocks expand before review so no step stays hidden and the derived `risk` grade marks workflows that write, submit or navigate as sensitive.
 * - `savetemplate` carries the `template` payload (a reviewed `name` plus a valid workflow step) shared across workflows.
 * - `runworkflow` carries the `workflowid` of a composed workflow, the explicit `reviewed: true` run review flag and the optional `variables` object of string, number or boolean seed values.
 * - `dryrun` carries the `workflowid` of a composed workflow and marks the whole run free of side effects.
 * - Control flow kinds of the 1.1.51 family carry their reviewed payloads in options: `condition` carries the boolean `expression` tested over the extracted values; `branch` carries the named `paths` with boolean `when` expressions over page state (the snapshot accessor exposes `pageurl`, `pagetitle` and `pageready` variables) and the mandatory `else` path so every branch terminates; `loop` carries the `list` variable with the `item` and `index` variables rebound per iteration, the optional positive `bound` (an absent bound keeps the documented default of one thousand iterations) and the body `steps`; `repeatuntil` carries the convergence `until` expression with its optional `bound` and body; `whileloop` carries the `while` condition, the mandatory positive `bound` and the body — a while loop without a safety bound is refused; `foreach` carries the non-empty `selector`, the `item` and `index` variables and the body; `parallel` carries the uniquely identified `branches` and the `join` policy whose `strategy` is first, last or fail and whose `onfail` is cancel or continue — the join merges conflicting variable writes with the last branch winning under the last strategy, the first branch winning under first and any conflict refusing under fail, cancelled siblings never contribute; `trycatch` carries the fragile body `steps`, the `catch` handler with its optional `rerun`, the optional `retry` policy of user configured `attempts` with no code ceiling, `backoff` of fixed or exponential shape with base and seeded jitter and the `retryable` error classes, and the optional `timeout` policy of positive `stepms` and `runms` budgets whose aborts carry the cancelled error class. Every child step of a control payload must itself be a reviewed action kind and composition grades the whole record by its worst child, so no control construct hides a step or bypasses review; the outcome envelope reports branch outcomes with their reason, loop counters, retry attempts with backoff durations, timeout aborts with the exceeded budget, join records with conflicts and parallel branch outcomes, and the response envelope reports timeout aborts and retry exhaustion distinctly.
 * - `delay` carries the `delay` payload with a zero or positive `base` in milliseconds and a zero or positive `jitter` window; no code ceiling applies.
 * - `waitelement` carries the `wait` payload with a non-empty `selector`, a zero or positive `timeout` and a zero or positive `poll` interval; no code ceiling applies.
 * - `compute` carries the `expression` payload with `left` and optional `right` operands (each a `{ ref }` variable reference or a literal), the `operator` of the reviewed set, the `result` variable name and the `resultkind`.
 * - `extractvars` carries the `rule` payload with its `pattern`, `flags` and named capture `groups` beside the reviewed `text`; regex patterns that nest unbounded quantifiers inside quantified groups are refused.
 * - Workflow step options may reference scope variables with `${name}` placeholders; the engine refuses references no scope defines.
 * - Trigger kinds add the reviewed trigger rule grammar of the 1.1.52 family: every trigger kind (`visitrule`, `urlrule`, `menurule`, `keyrule`, `buttonrule`, `cronrule`, `intervalrule`, `urllistrule`, `webhookrule`, `eventrule`) carries the `workflowid` of the composed workflow it launches, the explicit `reviewed: true` arm review flag, an optional non-empty `label`, an optional positive `cooldown` window in milliseconds with the documented default of the webhook and event families winning when none is configured, and the family `rule` payload: visit rules carry non-empty HTTPS `origins`, url rules carry an HTTPS glob `pattern` where `*` spans one path segment and `**` spans across segments, menu rules carry the context menu entry `title`, key rules carry the lowercase `command` name and optional suggested `key`, button rules carry no match fields, cron rules carry the five field `cron` expression with named weekdays and months and an optional resolvable `timezone`, interval rules carry the positive `period` in milliseconds and optional zero or positive `jitter`, url list rules carry the non-empty HTTPS `urls` list, webhook rules carry the `secret` of at least twenty four characters mixing letters and digits and the `schema` list of `{ name, kind, required }` payload fields, and event rules carry the `events` list of the observed event catalog (mutate, focus, banner, console, error, navigate); the proposal parser refuses rules without the arm review and rules whose match origins stay outside the grants.
 * - The agent protocol of the 1.1.54 family documents the mcp tool list and schema grammar: the catalog serves the `browser`, `workflow`, `memory` and `system` namespaces, every tool name carries its namespace prefix so colliding base names stay unambiguous, every tooldef appends its `version` for compatibility checks, every input schema maps the tool inputs to typed json schema properties with required markers and default values, read only tools take their reviewed `target`, `value` and `options` inputs while every tool with side effects takes only the `stepid` of the approved plan step whose reviewed payload it executes, tool descriptions state the consent class and side effects in plain language, and tools with side effects declare their `consentmeta` review requirement; the memory namespace serves its run accessor through the read kind `listruns` with the optional reviewed `state` filter of the listing grammar.
 * - The agent protocol frames messages in json rpc: a `jsonrpcframe` carries the `jsonrpc` tag with an `id`, `method` and `params` on requests and the same `id` with either a `result` or an `error` on responses; the wire supports newline delimited blocks and http post envelopes, the error codes are `parse`, `method`, `params`, `internal` and `consentrefused` with `consentrefused` reserved for consent gate refusals, the routing table maps `initialize`, `ping`, `tools/list`, `negotiate` and `tools/call` to their handlers, and capability negotiation exchanges the `protocolversion`, the `toolversion` compatibility floor, the tool count, the namespaces and the allowed `transports` of stdio and http.
 * - The fleet identity contract of the 1.1.72 family travels with every envelope: the proposal request carries the `agent` block of the requesting agent's `agentid`, `name` and `role` beside its `budget` state so the reviewer reads who asks and what it already spent, `parseproposal` attributes every step of the plan to its requesting agent and refuses proposals from agents missing from the fleet registry, the escalation message grammar carries `{ agentid, subject, context, stepid }` lifting one stalled agent decision to the user with the hold blocking the raising agent until the human answers, the reviewrequest message grammar carries `{ fromagentid, toagentid, subject, output }` moving one agent output to a peer of the shared origin for review with the `{ verdict, issues }` answer recorded beside the original output, and the consensus response carries the vote records of every agent with the tally, the quorum rule and the outcome while the dissenting reasons stay in the record.
 * - The scaled coordination contract of the 1.1.73 family documents the spawn and lane grammar: the `spawnsubagent` request carries `{ parentid, objective, role, narrowscope, depth }` where the parent must sit registered in the fleet, the `depth` must sit exactly one level under the parent lineage depth and never past the user configured depth limit — the boundary refuses the exceeding spawn before any registry write — and the spawn response carries the registered `agentid`, its `name`, its `role`, its `parentid` and its `depth`; the proposal requestbody now includes the active `lanes` of the user configured priority order and the latest `load` reports per origin beside the matching `lessons` of the lessonshare so the endpoint plans inside the lane order, feels the origin loads and reads what the fleet learned; the aggregation response carries the per agent `sections` with their run provenance, the `conflicts` with their resolvers and the open state; the lessonshare payload schema carries each lesson with its `agentid`, its `finding`, its `origin` and its `reusecount`; and the cost ledger report attributes every cost entry to the requesting `agentid` with its `units`, its `runid` and its plain language `description` while the split names each agent's own share beside the peers it shared its costs with.
 * - The navigation intelligence contract of the 1.1.74 family documents the navintent prediction schema, the deeplinkpattern grammar and the navigation safety blocks: the navintent prediction schema carries each predicted url with its `confidence` between zero and one ranked by step order and urlhistory frequency, the prediction report envelopes the ranked `predictedurls` under the version so the endpoint reads exactly which pages the approved plan is about to need while navintent and prefetchpage stay read only observations that issue no request of their own; the proposal requestbody now includes the `predictedurls` of the latest navintent pass so the endpoint plans against the predicted pages; `parseproposal` accepts an `intenthint` plain language label on every navigate step so the steps name the predicted navigation they belong to, and it rejects a `batchopen` proposal whose reviewed `urls` list carries an origin outside the grants because a batch never widens the grants; the deeplinkpattern grammar carries `{ app, origin, route, params }` where the `route` template substitutes its named `{name}` parameters from the reviewed step params and the pattern builds only into its granted `origin`; the step results carry the `safety` block with the url, the safe flag and the `reasons` of the checksafeurl verdict so the ui shows why a url opened or refused; and the response envelope carries the `ratelimitwait` block with the domain and the milliseconds a delayed navigation waited inside the sliding window so a rate limited step never drops silently.
 * - The data pipelines contract of the 1.1.75 family documents the extractpipeline schema, the transformrule grammar and the pipeline result blocks: the extractpipeline schema carries `{ id, runid, name, source, steps, transforms, sink, dedupe, sample, state, origin }` where the `source` stays the reviewed target the pipeline extracts from, the `steps` list the step ids that drive the extraction, the `transforms` hold the reviewed transform rules applied between extraction and export, the `sink` stays one of csv, json or excel and always flows through the reviewed export machinery, the optional `dedupe` key names its columns with their normalization, the optional `sample` policy names its row count with its strategy and the `origin` binds the pipeline to the site it extracts from; the transformrule grammar pairs a `field` with a reviewed `operation` of `trim`, `case`, `number` or `date` — trim folds the whitespace, case folds the letters, number strips the non numeric shapes and date normalizes to ISO 8601 — while an unknown operation refuses at the protocol boundary before any value reshapes; `parseproposal` accepts a `pipeline` reference in the options of the extract steps (scrapetable, paginateextract, resumeextract, transformvalues, deduperows, stamplerows, previewgrid, streamdisk and logprovenance) so a reviewed step names the extractpipeline its rows flow through, and it rejects a transform of an unknown operation because the pipeline never applies an unreviewed rule; the step results carry the `streamcursor` block with the pipeline id, the row offset and the chunk index of the last written position so an interrupted stream resumes exactly where it stopped; the response envelope carries the `dedupe` report block with the removed and kept counts and the key columns of a dedupe pass, and the `sampledpreview` block records the preview payload as read only — the row count with its strategy and its read only mark — so a sampled preview never grades as a write; the protocol version bumps to carry the pipeline contract.
 * - The web api transport contract of the 1.1.76 family documents the widened transport surface: the eventsubscription schema carries `{ id, runid, stepid, url, origin, state, lasteventid, events, names, cancel, lifetime }` where the `cancel` path stays required (`stop` with its value or `lifetime` with its window) so a subscription without a cancellation path refuses at the boundary before any channel opens, and the `lasteventid` persists so a reconnect resumes exactly where the stream stopped; the graphqlsubscription schema carries `{ query, variables, channel }` where the `query` stays the reviewed subscription operation, the `variables` ride the operation and the `channel` names the websocket channel the subscription rides; the longpollrequest grammar carries `{ url, timeout, cursor }` where the `timeout` bounds one request under the user configured backoff and the `cursor` resumes the loop from the stored value, with every bound a user choice with no code default; the multipartfield grammar carries `{ name, filename, contenttype }` building the part headers of one reviewed file of a multipart body while the payload's own `boundary` streams the parts without buffering the whole upload; the proposal requestbody now includes the `correlations` block of the run — the per run request map with its request ids, correlation ids and pair states — so the endpoint sees exactly which outbound requests the run already made; `parseproposal` accepts the transport options on the steps (the `pollrequest` of a longpoll step and the `graphql` subscription of a channel step) and still rejects a subscription without its cancellation path; the step results carry the `cachehit` block with the cache key, the hit count and the served status so a served read names the entry it came from, and the response envelope carries the `correlation` block with the request id, the correlation id and the paired response so every api result answers its request; the protocol version bumps to carry the transport contract.
 * - The vision and ocr contract of the 1.1.77 family documents the seeing surface: the ocrresult schema carries `{ id, runid, stepid, imageid, text, words, lines, paragraphs, at }` where every word of `words` carries its `text`, its `box` of the ocrregion grammar `{ x, y, width, height }` in css pixels and its `confidence` between zero and one, the `lines` hold the merged word boxes with the joined text, the covering box and the lowest word confidence, and the `paragraphs` hold the merged line texts — so a recognition answers word by word instead of one opaque blob; the visiondescription schema carries `{ id, runid, stepid, imageid, prompt, text, regions, at }` where the `prompt` stays the reviewed non-empty question the model answers and every region of `regions` carries its plain language `label` with its `box` on the image, so every visual claim traces back to pixels; `parseproposal` accepts the vision options on the extract and capture steps (the `vision` prompt block of a step that sends the capture to the configured vision model and the `ocrregion` of a regionocr reading) and rejects a vision prompt that is not a non-empty string because the model answers exactly what the review asked; the proposal requestbody now includes the `vision` capability report of the run — the available vision kinds with the configured model — so the endpoint sees what the run can see; the step results carry the `grounding` block with the description id and its ranked selectors with their scores so a grounded claim names the element it answered, the `ocr` block with the image id, the word, line and character counts, and the `vision` block with the image id, the description id and the labeled region count; the audit payload carries the redaction masks through the `redactionreport` envelope with the capture id, the masked region count and the plain language reason, so a masked share records exactly what it covered; the protocol version bumps to carry the vision contract.
 * - The capture forensics contract of the 1.1.78 family documents the evidence surface: the beforeafterpair schema carries `{ id, runid, stepid, precaptureid, postcaptureid, stepkind, beat, at }` where the `precaptureid` stays absent for a read only step because a page a read never changed needs no before state while both captures link to the `stepid` they wrap; the console trace entry schema carries `{ id, runid, stepid, level, text, source, sequence, reload, beat, at }` where the `sequence` climbs run wide so a page reload never resets the ordering, the `level` classifies errors, warnings and logs by the loglevel grammar and the `source` names the timelinesource the entry came from; the nettraceentry schema carries `{ id, runid, stepid, url, method, status, correlationid, paired, beat, at }` where the `correlationid` joins the request and its response through the correlateids map of the run and a request without its pair stays unjoined so the gap names itself; `parseproposal` accepts the capture options on the capture steps (the `naming` lowercase pattern of the capture filenames, the `pair` mode of `beforeafter`, `post` or `none` around the step, and the `diff` flag that runs the diffshot comparison after a sensitive step) and rejects a naming pattern that is not a non-empty lowercase string because a filename the review never saw names nothing honestly; the proposal requestbody now includes the `diffscore` of the last step so the endpoint plans against the latest visual regression signal; the step results carry the `beforeafter` block with the pre and post capture ids of the step and the `diff` block with the baseline id, the capture id, the similarity score, the changed region count and the regression flag; the audit payload carries the capture names through the capture bundle report, and an export payload without provlog provenance entries for every capture refuses at this boundary because a bundle that cannot answer where its captures came from never leaves the device; the protocol version bumps to carry the forensics contract.
 * - The data minimization contract of the 1.1.79 family documents the smallest footprint: the sync payload schema carries `{ version, classes, cipher, formattag, payloadhash, syncedat }` where the `classes` list exactly the data classes the user opted in per class, the `cipher` stays the encrypted envelope the encryptsync pass built from the user passphrase — a payload whose `encrypted` reads false or whose `formattag` sits empty refuses at this boundary because plaintext never transports — and the `payloadhash` names the cipher so the receiving side verifies what left the device; the exportall bundle schema carries `{ id, runs, memory, captures, settings, provenance, records, bytes, at }` where the `runs`, `memory`, `captures` and `provenance` lists name every stored record id the portable file carries, `settings` marks whether the user settings rode along, and the bundle streams through the download flow without a size cap because a bundle the user asked for streams whole; the quarantine verdict schema carries `{ id, path, reason, scan, status, release, at, updatedat }` where the `scan` rides the scanverdict grammar of the security family, the `status` reads held while the verdict waits, released once the verdict reads clean and deleted once it reads flagged, and only a clean verdict ever releases a file; the session records now carry the `jarid` of the cookie jar the run owns so every protocol frame names the jar its cookie state stays scoped to; the requestbody omits every telemetry field by construction — the envelope builds from the reviewed objective, session, observation and capability blocks only, and no telemetry key exists on the wire format at all — so the notelemetry posture holds at the schema level, not by omission at runtime; the audit payload carries the sync consent through the syncconsentreport envelope with the data class and its consent stamp, so every synced class answers when the user opted it in; and the protocol version bumps to carry the minimization contract.
 * - The servercontract of the 1.1.82 site integration family documents the site bridge wire: the serverenvelope schema carries `{ version, op, opid, sessionid, token, at, body }` where the `version` is the negotiated servercontract version of the handshake, the `op` is one of the four wire operations `sessioncreate`, `sessionjoin`, `eventpost` and `eventstream`, the `opid` is the stable operation id every reply quotes for correlation, the `sessionid` and `token` carry the frame authentication (the session token rides frames only and never appears in urls or logs) and the `body` carries the operation payload — an envelope that fails this schema rejects at the boundary with the field that named it; the event payloads carry the four event types `chat`, `planproposal`, `planreview` and `progress` where the chat payload carries the human typed task text, the plan proposal payload carries the plan title and the step digest with kinds, origins and sensitive flags, the plan review payload carries the returned decision of approved, changes or refused and the progress payload carries the step id and its status word; the heartbeat rides a progress event on the heartbeat stream so the four operations stay complete with no extra kind; the data minimization holds at the schema level through the bridgepayloadreport — a payload key of page content shape never crosses the bridge without the explicit page consent flag, so plan text and statuses stay the default wire payload; and the relay url stays entirely outside the wire format because the url is the user's setting, never a protocol constant.
 * - The stdio bridge relays frames between a local client process and the server through the native messaging host manifest: the bridge launches under the host name of the installed manifest, stamps the process id, relays inbound frames from the client wire and outbound frames back to it, and restarts a dead client process on demand while the http listener binds localhost by default with the bind address, port, transports, frame size and queue depth all user configured with no code ceiling.
 * - The provider gateway contract of the 1.1.83 family documents the model provider wire: the gatewaycallreport envelope carries `{ version, requestid, providerid, kind, model, tokens, cost, at }` where the `requestid` correlates every provider call with its audit entry and its usage record across the run, the `kind` names the adapter wire shape (the openai compatible chat completions shape, the anthropic messages shape, the gemini generate content shape or the local ollama runtime), the `tokens` block carries the prompt, completion and total counts and the `cost` answers the user configured price per million tokens; the gateway models never execute tools — a model answer only proposes plan steps the same human review approves before anything runs, the capabilityad advertisement declares the consent requirement of every tool and the plan review gate as a required capability, every key resolves through the vault seam at the last possible moment and never rides a payload, a log or an export, and no provider endpoint is contacted unless the user configured one — the base url of every remote provider stays a user value with no default while the ollamalocal adapter alone defaults to the localhost machine and never to a cloud url; the protocol version bumps to carry the gateway contract.
 * - The response envelope carries tool errors with the json rpc error codes: the `tool` block reports the calling client, the namespaced tool name, the origin, the outcome flag and the `code` of the refusal while tool payloads never ride the envelope.
 * Ambiguous text, aria or name resolutions are refused at execution time with the candidate list so the user can choose.
 */

/** Validates agent output before it becomes a locally reviewable plan. Plans may carry any number of steps. Fetch requests must target granted origins, channel urls must target granted origins with cancellation paths and bounded lifetimes, and header allowlists must carry non-empty names. */
export function parseproposal(value: unknown, origin: string, grants?: string[], agents?: agentrecord[]): planproposal {
  const root = record(value);
  if (root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const covered = grants !== undefined && grants.length > 0 ? grants : [origin];
  const agentid = typeof root.agentid === "string" && root.agentid.trim() !== "" ? root.agentid.trim() : undefined;
  if (agentid !== undefined && agents !== undefined && !agents.some(record => record.id === agentid)) throw new Error(`The proposal names the agent ${agentid} which the fleet registry does not carry; every proposal attributes to a registered agent.`);
  const planinput = record(root.plan);
  const stepsinput = planinput.steps;
  if (!Array.isArray(stepsinput) || stepsinput.length === 0) throw new Error("A plan needs at least one step.");
  const createdat = Date.now();
  const expiresat = typeof planinput.expiresat === "number" ? planinput.expiresat : createdat + 10 * 60 * 1000;
  if (expiresat <= createdat) throw new Error("Plan expiry must be in the future.");
  const planwindow = expiresat - createdat;
  const attachinput = stepsinput.map(input => record(input)).find(candidate => candidate.kind === "attachcdp");
  let planallowlist: cdpallowlist | undefined;
  if (attachinput !== undefined) {
    const attachoptions = (() => { try { return parseoptions({ id: "attach", kind: "attachcdp", summary: "attach", risk: "sensitive", ...(typeof attachinput.options === "string" ? { options: attachinput.options } : {}) }); } catch { return {}; } })();
    const domains = Array.isArray(attachoptions.domains) ? attachoptions.domains.filter((domain): domain is string => typeof domain === "string" && cdpdomains.includes(domain)) : [];
    const gated = cdpallowlistof(attachoptions.allowlist);
    planallowlist = domains.length > 0 ? { domains, ...(gated?.methods !== undefined ? { methods: gated.methods } : {}) } : undefined;
  }
  const steps: toolstep[] = stepsinput.map((input, index) => {
    const candidate = record(input);
    const kind = text(candidate.kind, `step ${index + 1} kind`) as toolstep["kind"];
    const step: toolstep = {
      id: typeof candidate.id === "string" ? candidate.id : crypto.randomUUID(),
      kind,
      summary: text(candidate.summary, `step ${index + 1} summary`),
      risk: resolvedrisk(stepof(kind, candidate, index)),
      ...(typeof candidate.idempotencykey === "string" ? { idempotencykey: candidate.idempotencykey } : {}),
      ...(typeof candidate.target === "string" ? { target: candidate.target } : {}),
      ...(typeof candidate.value === "string" ? { value: candidate.value } : {}),
      ...(typeof candidate.options === "string" ? { options: candidate.options } : {}),
      ...(typeof candidate.intenthint === "string" && candidate.intenthint.trim() !== "" ? { intenthint: candidate.intenthint.trim() } : {}),
    };
    if (step.kind === "scrapetable" || step.kind === "paginateextract" || step.kind === "resumeextract" || step.kind === "transformvalues" || step.kind === "deduperows" || step.kind === "stamplerows" || step.kind === "previewgrid" || step.kind === "streamdisk" || step.kind === "logprovenance") {
      let pipelineoptions: Record<string, unknown> = {};
      try { pipelineoptions = parseoptions(step); } catch { pipelineoptions = {}; }
      const pipelineref = pipelineoptions.pipeline;
      if (pipelineref !== undefined && (typeof pipelineref !== "string" || pipelineref.trim() === "")) throw new Error(`The ${step.kind} step names its pipeline reference as the non-empty id of the extractpipeline its rows flow through.`);
      const pipelinerules = Array.isArray(pipelineoptions.rules) ? pipelineoptions.rules : [];
      for (const rule of pipelinerules) {
        if (!rule || typeof rule !== "object" || Array.isArray(rule)) continue;
        const operation = (rule as Record<string, unknown>).operation;
        if (operation === undefined) continue;
        if (typeof operation !== "string" || !["trim", "case", "number", "date"].includes(operation)) throw new Error(`The ${step.kind} proposal carries the transform operation ${String(operation)} which the reviewed transform grammar does not carry; the pipeline refuses an unknown operation before any value reshapes.`);
      }
      const visionoption = pipelineoptions.vision;
      if (visionoption !== undefined) {
        if (!visionoption || typeof visionoption !== "object" || Array.isArray(visionoption)) throw new Error(`The ${step.kind} proposal carries its vision block as an object with the reviewed prompt; an opaque vision option refuses at the boundary.`);
        const visionprompt = (visionoption as Record<string, unknown>).prompt;
        if (typeof visionprompt !== "string" || visionprompt.trim() === "") throw new Error(`The ${step.kind} proposal carries a vision prompt that is not a non-empty string; the vision model answers exactly what the review asked.`);
        const visionregion = (visionoption as Record<string, unknown>).ocrregion;
        if (visionregion !== undefined && (!visionregion || typeof visionregion !== "object" || Array.isArray(visionregion))) throw new Error(`The ${step.kind} proposal carries its ocrregion as the { x, y, width, height } rectangle of the reviewed grammar; an opaque region refuses at the boundary.`);
      }
    }
    if (step.kind === "batchopen") {
      let batchoptions: Record<string, unknown> = {};
      try { batchoptions = parseoptions(step); } catch { batchoptions = {}; }
      const batchurls = Array.isArray(batchoptions.urls) ? batchoptions.urls.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
      const outsidegrant = batchurls.filter(url => {
        try { return !covered.some(pattern => new URL(url).origin === new URL(pattern).origin); } catch { return true; }
      });
      if (outsidegrant.length > 0) throw new Error(`The batchopen proposal carries ${outsidegrant.length} url${outsidegrant.length === 1 ? "" : "s"} outside the grants (${outsidegrant.slice(0, 3).join(", ")}); a batch never widens the origin grants.`);
    }
    if (step.kind === "shotview" || step.kind === "shotfullpage" || step.kind === "shotelement" || step.kind === "shotregion" || step.kind === "contactsheet" || step.kind === "captureframe" || step.kind === "shotcanvas") {
      let captureoptions: Record<string, unknown> = {};
      try { captureoptions = parseoptions(step); } catch { captureoptions = {}; }
      const captureblock = captureoptions.capture;
      if (captureblock !== undefined) {
        if (!captureblock || typeof captureblock !== "object" || Array.isArray(captureblock)) throw new Error(`The ${step.kind} proposal carries its capture block as an object with the reviewed naming pattern, pair mode and diff flag; an opaque capture option refuses at the boundary.`);
        const capturefields = captureblock as Record<string, unknown>;
        const naming = capturefields.naming;
        if (naming !== undefined && (typeof naming !== "string" || naming.trim() === "")) throw new Error(`The ${step.kind} proposal carries its capture naming pattern as a non-empty lowercase string with the {plan}, {step}, {timestamp} and {sequence} parts; a filename the review never saw names nothing honestly.`);
        const pairmode = capturefields.pair;
        if (pairmode !== undefined && pairmode !== "beforeafter" && pairmode !== "post" && pairmode !== "none") throw new Error(`The ${step.kind} proposal carries its capture pair mode as one of beforeafter, post or none; an unknown pair mode never wraps a step.`);
        const diff = capturefields.diff;
        if (diff !== undefined && typeof diff !== "boolean") throw new Error(`The ${step.kind} proposal carries its capture diff flag as a boolean; the diffshot comparison runs only when the review asked for it.`);
      }
    }
    if (step.kind === "blockrequest") {
      let blockoptions: Record<string, unknown> = {};
      try { blockoptions = parseoptions(step); } catch { blockoptions = {}; }
      const rule = blockruleof(blockoptions.block);
      if (rule && patternorigin(rule.urlpattern) === undefined) throw new Error("Block rules without a named origin pattern are refused.");
    }
    if (step.kind === "routeproxy") {
      let proxyoptions: Record<string, unknown> = {};
      try { proxyoptions = parseoptions(step); } catch { proxyoptions = {}; }
      const proxy = proxyoptions.proxy;
      const bypass = proxy && typeof proxy === "object" && !Array.isArray(proxy) ? (proxy as Record<string, unknown>).bypass : undefined;
      if (!Array.isArray(bypass) || bypass.length === 0) throw new Error("Proxy routes without a bypass list are refused.");
    }
    if (step.kind === "watchconsole" || step.kind === "watcherrors" || step.kind === "watchtasks") {
      let debugoptions: Record<string, unknown> = {};
      try { debugoptions = parseoptions(step); } catch { debugoptions = {}; }
      const granted = covered.some(pattern => {
        try { return new URL(origin).origin === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The ${step.kind} capture of ${origin} targets an origin outside the grants.`);
      if (debugoptions.level !== undefined && !loglevels.includes(debugoptions.level as never)) throw new Error(`The reviewed level floor must be one of ${loglevels.join(", ")}.`);
    }
    if (iscdpkind(step.kind)) {
      const granted = covered.some(pattern => {
        try { return new URL(origin).origin === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let cdpoptions: Record<string, unknown> = {};
      try { cdpoptions = parseoptions(step); } catch { cdpoptions = {}; }
      if (step.kind === "attachcdp") {
        if (teardownplanof(cdpoptions.teardown) === undefined) throw new Error("Attach steps without a reviewed teardown plan are refused.");
        const domains = Array.isArray(cdpoptions.domains) ? cdpoptions.domains.filter((domain): domain is string => typeof domain === "string" && cdpdomains.includes(domain)) : [];
        if (domains.length === 0) throw new Error("Attach steps need a non-empty enabled domain list of the reviewed domain grammar.");
        const gated = cdpallowlistof(cdpoptions.allowlist);
        if (cdpoptions.allowlist !== undefined && (!gated || !gated.domains.every(domain => domains.includes(domain)))) throw new Error("The reviewed method allowlist must stay inside the enabled domains of the attach.");
      }
      if (step.kind === "cdpcmd") {
        const command = cdpoptions.command && typeof cdpoptions.command === "object" && !Array.isArray(cdpoptions.command) ? cdpoptions.command as Record<string, unknown> : undefined;
        const method = typeof command?.method === "string" ? command.method : "";
        if (methoddomain(method) === undefined) throw new Error("Raw commands need a reviewed method of the Domain.method form.");
        if (planallowlist === undefined) throw new Error("Raw command steps need the attachcdp step of the same plan with its enabled domains first.");
        if (!allowlistcovers(planallowlist, method)) throw new Error(`The raw command ${method} stays outside the enabled domain allowlist of the plan attach.`);
      }
    }
    if (isprofilekind(step.kind)) {
      const granted = covered.some(pattern => {
        try { return new URL(origin).origin === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let profileoptions: Record<string, unknown> = {};
      try { profileoptions = parseoptions(step); } catch { profileoptions = {}; }
      const targets: attachtarget[] = [
        ...(attachtargetof(profileoptions.target) !== undefined ? [attachtargetof(profileoptions.target) as attachtarget] : []),
        ...(Array.isArray(profileoptions.attachtargets) ? profileoptions.attachtargets.flatMap(target => { const parsed = attachtargetof(target); return parsed !== undefined ? [parsed] : []; }) : []),
      ];
      for (const target of targets) {
        if (target.kind === "page") continue;
        const targetgranted = covered.some(pattern => {
          try { return new URL(target.url).origin === new URL(pattern).origin; } catch { return false; }
        });
        if (!targetgranted) throw new Error(`The ${target.kind} target ${target.url} of the ${step.kind} step stays outside the granted origins.`);
      }
      if (step.kind === "traceload") {
        const trace = profileoptions.trace && typeof profileoptions.trace === "object" && !Array.isArray(profileoptions.trace) ? profileoptions.trace as Record<string, unknown> : undefined;
        const categories = trace !== undefined && Array.isArray(trace.categories) ? trace.categories : [];
        if (categories.some((category): boolean => typeof category !== "string" || !tracecategories.includes(category))) throw new Error(`Trace categories outside the reviewed list are refused: ${tracecategories.join(", ")}.`);
      }
      if (step.kind === "capturesourcemaps") {
        for (const url of Array.isArray(profileoptions.scripts) ? profileoptions.scripts : []) {
          if (typeof url !== "string") continue;
          const scriptgranted = covered.some(pattern => {
            try { return new URL(url).origin === new URL(pattern).origin; } catch { return false; }
          });
          if (!scriptgranted) throw new Error(`The source map capture of ${url} targets an origin outside the grants.`);
        }
      }
      if (step.kind === "annotatetrace" && (!Array.isArray(profileoptions.annotations) || profileoptions.annotations.length === 0 || !profileoptions.annotations.every(annotation => annotationof(annotation) !== undefined))) throw new Error("Trace annotation steps without reviewed step annotations are refused.");
    }
    if (isemulationkind(step.kind)) {
      const granted = covered.some(pattern => {
        try { return new URL(origin).origin === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The ${step.kind} step of ${origin} targets an origin outside the grants.`);
      let emulationoptions: Record<string, unknown> = {};
      try { emulationoptions = parseoptions(step); } catch { emulationoptions = {}; }
      if (revertplanof(emulationoptions.revertplan) === undefined) throw new Error("Emulation steps without a reviewed revert plan are refused.");
      if (step.kind === "emulatelocate") {
        const preset = locationpresetof(emulationoptions.location);
        if (preset === undefined) throw new Error("Location emulation needs a reviewed preset with coordinates inside the latitude and longitude ranges.");
      }
      if (step.kind === "overridepermission" && permissiongrantof(emulationoptions.permission) === undefined) throw new Error("Permission overrides of unknown permission names are refused.");
    }
    if (issessionkind(step.kind)) {
      let sessionoptions: Record<string, unknown> = {};
      try { sessionoptions = parseoptions(step); } catch { sessionoptions = {}; }
      if (step.kind === "restoresession") {
        for (const url of Array.isArray(sessionoptions.origins) ? sessionoptions.origins : []) {
          if (typeof url !== "string" || !url) continue;
          const granted = covered.some(pattern => {
            try { return new URL(url).origin === new URL(pattern).origin; } catch { return false; }
          });
          if (!granted) throw new Error(`The session restore reopens ${url} outside the grants.`);
        }
      }
      if (step.kind === "importsessions" && importsessionfile(sessionoptions.file) === undefined) throw new Error("Session import files of unknown format versions are refused.");
    }
    if (isworkflowkind(step.kind)) {
      let workflowoptions: Record<string, unknown> = {};
      try { workflowoptions = parseoptions(step); } catch { workflowoptions = {}; }
      if (step.kind === "composeworkflow") {
        const payload = workflowoptions.workflow && typeof workflowoptions.workflow === "object" && !Array.isArray(workflowoptions.workflow) ? workflowoptions.workflow as Record<string, unknown> : undefined;
        const origins = payload && Array.isArray(payload.origins) ? payload.origins.filter((originvalue): originvalue is string => typeof originvalue === "string") : [];
        for (const workfloworigin of origins) {
          const granted = covered.some(pattern => {
            try { return new URL(workfloworigin).origin === new URL(pattern).origin; } catch { return false; }
          });
          if (!granted) throw new Error(`The workflow origin ${workfloworigin} stays outside the grants.`);
        }
      }
      if (step.kind === "runworkflow" && workflowoptions.reviewed !== true) throw new Error("Workflow runs without the explicit run review of the expanded step list are refused.");
    }
    if (istriggeraction(step.kind)) {
      let triggeroptions: Record<string, unknown> = {};
      try { triggeroptions = parseoptions(step); } catch { triggeroptions = {}; }
      if (triggeroptions.reviewed !== true) throw new Error("Trigger rules without the explicit arm review of their match fields and bound workflow are refused.");
      for (const ruleorigin of triggerorigins(step)) {
        const granted = covered.some(pattern => {
          try { return new URL(ruleorigin).origin === new URL(pattern).origin; } catch { return false; }
        });
        if (!granted) throw new Error(`The trigger on ${ruleorigin} stays outside the grants.`);
      }
    }
    const evaluation = validatestep(step, origin);
    if (!evaluation.allowed) throw new Error(evaluation.reason);
    const target = outboundtarget(step);
    if (target !== undefined) {
      const granted = covered.some(pattern => {
        try { return new URL(target).origin === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The fetch request to ${target} targets an origin outside the grants.`);
    }
    const channelurl = sockettarget(step);
    if (channelurl !== undefined) {
      const channeloriginvalue = channeloriginof(channelurl);
      const granted = covered.some(pattern => {
        try { return new URL(channelurl).origin === new URL(pattern).origin || channeloriginvalue === new URL(pattern).origin; } catch { return false; }
      });
      if (!granted) throw new Error(`The channel to ${channelurl} targets an origin outside the grants.`);
    }
    let lifetime: number | undefined;
    try {
      const options = parseoptions(step);
      for (const key of ["socket", "subscription"] as const) {
        const value = options[key];
        if (value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).lifetime === "number") lifetime = (value as Record<string, number>).lifetime;
      }
    } catch { lifetime = undefined; }
    if (lifetime !== undefined && lifetime > planwindow) throw new Error(`The channel lifetime of ${lifetime} milliseconds exceeds the reviewed plan window of ${planwindow} milliseconds.`);
    return step;
  });
  for (const step of steps) {
    if (step.kind !== "retryaction" && step.kind !== "enterframe" && step.kind !== "looprows") continue;
    const options = parseoptions(step);
    if (typeof options.stepid === "string" && !steps.some(candidate => candidate.id === options.stepid)) throw new Error("A retry, frame or loop wrapper references an unknown step id.");
  }
  for (const step of steps) {
    if (step.kind !== "submitform" && step.kind !== "retryform") continue;
    const review = submitreviewgranted(steps, step.id);
    if (!review.allowed) throw new Error(review.reason);
  }
  const plan: agentplan = {
    id: typeof planinput.id === "string" ? planinput.id : crypto.randomUUID(),
    objective: text(planinput.objective, "objective"),
    origin,
    steps: agentid !== undefined ? steps.map(step => ({ ...step, agentid })) : steps,
    createdat,
    expiresat,
    state: "pending",
  };
  const idempotencykeys = steps.map(step => step.idempotencykey).filter((key): key is string => key !== undefined);
  if (new Set(idempotencykeys).size !== idempotencykeys.length) throw new Error("Two steps of one plan collide on the same idempotencykey; the protocol refuses a plan whose replays could deduplicate the wrong step.");
  const resumedfrom = Array.isArray(root.resumedfrom) ? root.resumedfrom.filter((stepid): stepid is string => typeof stepid === "string" && stepid.trim() !== "") : undefined;
  if (resumedfrom !== undefined && resumedfrom.length > 0) {
    const known = new Set(steps.map(step => step.id));
    const unknown = resumedfrom.filter(stepid => !known.has(stepid));
    if (unknown.length > 0) throw new Error(`The resumedfrom marker names step ids the plan does not carry: ${unknown.join(", ")}.`);
    return { version: protocolversion, plan, resumedfrom, ...(agentid !== undefined ? { agentid } : {}) };
  }
  const lockid = typeof root.lockid === "string" && root.lockid.trim() !== "" ? root.lockid : undefined;
  if (lockid !== undefined) return { version: protocolversion, plan, lockid, ...(agentid !== undefined ? { agentid } : {}) };
  return { version: protocolversion, plan, ...(agentid !== undefined ? { agentid } : {}) };
}

/** One workflow proposal envelope: the versioned workflow record with the expanded step list so review sees every step, and the control flow summaries of the control steps so review renders their paths, bounds, branches, join policies and retry and timeout policies. */
export interface workflowproposal {
  version: typeof protocolversion;
  workflow: workflowrecord;
  /** True when the caller proposes a dry run of the workflow free of side effects. */
  dryrun?: boolean;
  /** Control flow summaries of the control steps of the record so review renders the whole control grammar. */
  control?: Array<{ stepid: string; summary: ReturnType<typeof controlsummary> }>;
}

/** One step outcome entry of a workflow outcome envelope: the step identity, its run state, duration, summary, block context, the bindings produced and consumed and the control flow decision of a control step. */
export interface workflowstepoutcome {
  stepid: string;
  label: string;
  state: runlogentry["state"];
  duration: number;
  summary: string;
  block?: string;
  produced?: string[];
  consumed?: string[];
  checkpoint?: boolean;
  /** Control flow decision of a control step: the branch outcome with its reason, the loop counters, the retry attempts, the timeout aborts, the join record and the parallel branch outcomes. */
  control?: controlflowdecision;
}

/** Parses one workflow proposal before it becomes a reviewable workflow record: the version must match, the payload must compose with the expanded block list so no step stays hidden, every step kind must be a reviewed action kind, every workflow origin must stay inside the grants and the review risk grade lands on the record. */
export function parseworkflowproposal(value: unknown, origin: string, grants?: string[], dryrun?: boolean): workflowproposal {
  const root = record(value);
  if (root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const covered = grants !== undefined && grants.length > 0 ? grants : [origin];
  const candidate = record(root.workflow);
  const name = text(candidate.name, "workflow name");
  const version = typeof candidate.version === "number" && Number.isInteger(candidate.version) && candidate.version >= 1 ? candidate.version : undefined;
  if (version === undefined) throw new Error("The workflow version must be a positive integer.");
  const origins = Array.isArray(candidate.origins) ? candidate.origins : [];
  if (origins.length === 0 || !origins.every((workfloworigin): workfloworigin is string => typeof workfloworigin === "string" && workfloworigin.startsWith("https://"))) throw new Error("The workflow needs at least one granted HTTPS origin.");
  for (const workfloworigin of origins) {
    const granted = covered.some(pattern => {
      try { return new URL(workfloworigin).origin === new URL(pattern).origin; } catch { return false; }
    });
    if (!granted) throw new Error(`The workflow origin ${workfloworigin} stays outside the grants.`);
  }
  const steps = Array.isArray(candidate.steps) ? candidate.steps : [];
  if (steps.length === 0) throw new Error("A workflow proposal needs at least one step or block invocation.");
  const blocks = Array.isArray(candidate.blocks) ? candidate.blocks.flatMap(block => workflowblockof(block) !== undefined ? [workflowblockof(block) as import("./types.js").workflowblock] : []) : [];
  if (Array.isArray(candidate.blocks) && blocks.length !== (candidate.blocks as unknown[]).length) throw new Error("The reviewed block list must carry unique lowercase names, labels and valid child steps.");
  const composed = composeworkflow({
    name,
    version,
    origins,
    steps: steps.map(entry => {
      const step = workflowstepof(entry);
      if (step) return step;
      const invocation = blockinvocationof(entry);
      if (invocation) return invocation;
      throw new Error("Every workflow entry must be a reviewed step or a block invocation.");
    }),
    blocks,
    now: Date.now(),
    kindallowed: kind => { try { actionrisk(kind as import("./types.js").actionkind); return true; } catch { return false; } },
    riskof: kind => actionrisk(kind as import("./types.js").actionkind),
  });
  const inputs = Array.isArray(candidate.inputs) ? candidate.inputs.flatMap(inputname => typeof inputname === "string" ? [inputname] : []) : undefined;
  const checked = validateworkflow(composed, { kindallowed: kind => { try { actionrisk(kind as import("./types.js").actionkind); return true; } catch { return false; } }, ...(inputs !== undefined ? { inputs } : {}) });
  if (!checked.allowed) throw new Error(checked.reason ?? "The workflow proposal failed its validation.");
  const control = composed.steps.flatMap(step => {
    const summary = controlsummary(step);
    return summary !== undefined ? [{ stepid: step.id, summary }] : [];
  });
  return { version: protocolversion, workflow: composed, ...(dryrun === true ? { dryrun: true } : {}), ...(control.length > 0 ? { control } : {}) };
}

/** Builds the workflow outcome envelope of one run: the run id, workflow id, state and dry run flag beside the step outcome list with the control flow decisions of the control steps; a single step outcome travels through the same envelope for debugging callers. */
export function workflowoutcome(input: { run: workflowrun; entries: runlogentry[]; stepid?: string }): { version: typeof protocolversion; runid: string; workflowid: string; state: string; dryrun?: boolean; steps: workflowstepoutcome[] } {
  const selected = input.stepid !== undefined ? input.entries.filter(entry => entry.stepid === input.stepid) : input.entries;
  const steps: workflowstepoutcome[] = selected.map(entry => ({ stepid: entry.stepid, label: entry.label, state: entry.state, duration: entry.duration, summary: entry.summary, ...(entry.block !== undefined ? { block: entry.block } : {}), ...(entry.produced !== undefined ? { produced: entry.produced } : {}), ...(entry.consumed !== undefined ? { consumed: entry.consumed } : {}), ...(entry.checkpoint === true ? { checkpoint: true } : {}), ...(entry.details !== undefined && entry.details.control !== undefined ? { control: entry.details.control as controlflowdecision } : {}) }));
  return { version: protocolversion, runid: input.run.id, workflowid: input.run.workflowid, state: input.run.state, ...(input.run.dryrun === true ? { dryrun: true } : {}), steps };
}

/** Builds one tool step from a raw candidate without its risk grade so resolvedrisk can read the reviewed options of conditional kinds. */
function stepof(kind: toolstep["kind"], candidate: Record<string, unknown>, index: number): toolstep {
  return { id: typeof candidate.id === "string" ? candidate.id : `candidate${index + 1}`, kind, summary: typeof candidate.summary === "string" ? candidate.summary : "", risk: "read", ...(typeof candidate.options === "string" ? { options: candidate.options } : {}) };
}

/** Resolves the https origin behind a channel url so grants cover wss websocket channels and https event streams alike. */
function channeloriginof(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol === "wss:" ? "https:" : parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

/** Shapes the only data that may be sent to a user-configured agent endpoint; the 1.1.70 family adds the live runstate and the offline queue depth so the agent context sees the run machine it replays into, the 1.1.71 family adds the isolated tab namespace id and the provenance of the observations so the endpoint sees the tab the run owns and where every observation came from, the 1.1.73 family adds the active priority lanes, the latest load reports per origin and the matching lessonshare records so the endpoint plans inside the lane order the user configured, feels the load of every origin and reads the lessons the fleet already learned, the 1.1.74 family adds the predicted next urls of the latest navintent pass so the endpoint plans against the pages the approved plan is about to need, the 1.1.76 family adds the correlations block of the run — the per run request map with its request ids, correlation ids and pair states — so the endpoint sees exactly which outbound requests the run already made, the 1.1.77 family adds the vision capability report of the run — the available vision kinds with the configured vision model — so the endpoint sees what the run can see, the 1.1.78 family adds the diff score of the last step so the endpoint plans against the latest visual regression signal the forensics measured, and the 1.1.79 family keeps the envelope telemetry free by construction — no telemetry key exists on this wire format at all, the session block rides with its jarid so the endpoint sees the cookie jar the run scopes to, and a payload that carries a localrule field refuses before the transport because a field marked local never leaves the device. */
export function requestbody(input: proposalrequest & { runstate?: string; queuedepth?: number; tabnamespace?: string; provenance?: memoryprovenance[]; agent?: { agentid: string; name: string; role: string }; budget?: budgetstate; lanes?: tasklane[]; load?: loadreport[]; lessons?: lessonrecord[]; predictedurls?: string[]; correlations?: Array<{ requestid: string; correlationid: string; method: string; url: string; paired: boolean; status?: number }>; vision?: { kinds: string[]; model?: string }; diffscore?: number }): string {
  const body: Record<string, unknown> = { version: protocolversion, objective: input.objective, session: input.session, observation: input.observation, capabilities: input.capabilities, ...(input.runstate !== undefined ? { runstate: input.runstate } : {}), ...(input.queuedepth !== undefined ? { queuedepth: input.queuedepth } : {}), ...(input.tabnamespace !== undefined ? { tabnamespace: input.tabnamespace } : {}), ...(input.provenance !== undefined ? { provenance: input.provenance } : {}), ...(input.agent !== undefined ? { agent: input.agent } : {}), ...(input.budget !== undefined ? { budget: input.budget } : {}), ...(input.lanes !== undefined ? { lanes: input.lanes } : {}), ...(input.load !== undefined ? { load: input.load } : {}), ...(input.lessons !== undefined ? { lessons: input.lessons } : {}), ...(input.predictedurls !== undefined ? { predictedurls: input.predictedurls } : {}), ...(input.correlations !== undefined ? { correlations: input.correlations } : {}), ...(input.vision !== undefined ? { vision: input.vision } : {}), ...(input.diffscore !== undefined ? { diffscore: input.diffscore } : {}) };
  return JSON.stringify(body);
}

/** Wraps one fleet consensus record with its votes, tally and outcome in the versioned response envelope: every vote record travels with its dissenting reason so the reviewer reads who voted what. */
export function consensusreport(input: { record: consensusrecord }): { version: typeof protocolversion; proposal: string; votes: consensusrecord["votes"]; tally: consensusrecord["tally"]; quorum: number; outcome: string } {
  return { version: protocolversion, proposal: input.record.proposal, votes: input.record.votes, tally: input.record.tally, quorum: input.record.quorum, outcome: input.record.outcome };
}

/** Parses one spawnsubagent request of the 1.1.73 family grammar `{ parentid, objective, role, narrowscope, depth }` against the fleet registry and the user configured depth limit: the parent must sit registered in the fleet, the objective stays the plain language task the parent hands over, an optional `narrowscope` of `origins` and `actionkinds` keeps only the parent grants it names, and the `depth` must sit at exactly the parent lineage depth plus one and never past the configured limit — a spawn whose depth exceeds the limit refuses at the protocol boundary before any registry write. */
export function parsespawnrequest(input: unknown, limit: depthlimit, agents: agentrecord[], spawns: spawnrecord[]): { spec: subagentspec; parent: agentrecord } {
  const root = input as { parentid?: string; objective?: string; role?: string; narrowscope?: { origins?: string[]; actionkinds?: string[] }; depth?: number };
  const parentid = root.parentid?.trim() ?? "";
  if (parentid === "") throw new Error("The spawn request names its parent agentid; every spawned child carries its lineage.");
  const parent = agents.find(record => record.id === parentid);
  if (!parent) throw new Error(`The spawn request names the parent ${parentid} which the fleet registry does not carry; the protocol boundary refuses unknown agents.`);
  const objective = root.objective?.trim() ?? "";
  if (objective === "") throw new Error("The spawn request needs its parent objective in plain language; the child works on what its parent handed over.");
  const depth = root.depth;
  if (depth === undefined || !Number.isInteger(depth) || depth <= 0) throw new Error("The spawn request carries its depth as a positive whole number of the lineage.");
  if (limit.maxdepth !== undefined && depth > limit.maxdepth) throw new Error(`The spawn request depth ${depth} exceeds the user configured depth limit ${limit.maxdepth}; the protocol boundary refuses the spawn before any registry write.`);
  const seen = new Set<string>([parentid]);
  let lineage = parentid;
  let parentdepth = 0;
  for (;;) {
    const spawn = spawns.find(entry => entry.childid === lineage);
    if (spawn === undefined) break;
    if (seen.has(spawn.parentid)) throw new Error(`The spawn lineage of the parent ${parentid} carries a cycle at ${spawn.parentid}; the protocol boundary refuses a looping lineage.`);
    seen.add(spawn.parentid);
    lineage = spawn.parentid;
    parentdepth += 1;
  }
  if (depth !== parentdepth + 1) throw new Error(`The spawn request depth ${depth} must sit exactly one level under the parent lineage depth ${parentdepth}.`);
  const spec: subagentspec = { parentid, objective, depth };
  if (root.role !== undefined && root.role.trim() !== "") spec.role = root.role.trim() as agentrole;
  if (root.narrowscope !== undefined) spec.narrowscope = root.narrowscope;
  return { spec, parent };
}

/** Wraps one spawnsubagent result in the versioned response envelope: the response carries the registered child beside its `parentid` and its `depth` so the caller reads exactly where the child sits in the lineage. */
export function spawnreply(input: { child: agentrecord; parentid: string; depth: number }): { version: typeof protocolversion; agentid: string; name: string; role: string; parentid: string; depth: number } {
  return { version: protocolversion, agentid: input.child.id, name: input.child.name, role: input.child.role, parentid: input.parentid, depth: input.depth };
}

/** Wraps one merged aggregaterecord in the versioned response envelope: the report carries the per agent sections with their run provenance, the conflicts with their resolvers and the open state so the reviewer reads exactly which parallel outputs merged and which conflicts wait for the escalation. */
export function aggregationreport(input: { record: aggregaterecord }): { version: typeof protocolversion; subject: string; sections: aggregaterecord["cells"]; conflicts: aggregaterecord["conflicts"]; state: string } {
  return { version: protocolversion, subject: input.record.subject, sections: input.record.cells, conflicts: input.record.conflicts, state: input.record.state };
}

/** Wraps the served lessonshare matches in the versioned response envelope: the lessonshare payload schema carries each `lessonrecord` with its `agentid`, its `finding`, its `origin` and its `reusecount` so the receiving agent reads what the fleet learned, where it learned it and how often the lesson served. */
export function lessonreport(input: { lessons: lessonrecord[] }): { version: typeof protocolversion; lessons: Array<{ id: string; agentid: string; finding: string; origin: string; reusecount: number; lastusedat?: number }> } {
  return { version: protocolversion, lessons: input.lessons.map(lesson => ({ id: lesson.id, agentid: lesson.agentid, finding: lesson.finding, origin: lesson.origin, reusecount: lesson.reusecount, ...(lesson.lastusedat !== undefined ? { lastusedat: lesson.lastusedat } : {}) })) };
}

/** Wraps the shared cost ledger in the versioned response envelope: every cost entry travels attributed to the `agentid` that requested it with its `units`, its `runid` and its plain language `description`, and the split report names each agent's own share beside the peers it shared its costs with. */
/** Wraps one redactionmask of the 1.1.77 family in the versioned audit payload: the capture it covered, the region count it masked and its plain language reason travel together so the audit trail records exactly what a shared capture hid while the image bytes and the region payloads never ride the envelope. */
export function redactionreport(input: { mask: { captureid: string; regions: Array<{ x: number; y: number; width: number; height: number }>; reason: string; source: string; at: number } }): { version: typeof protocolversion; captureid: string; regions: number; reason: string; source: string; at: number } {
  return { version: protocolversion, captureid: input.mask.captureid, regions: input.mask.regions.length, reason: input.mask.reason, source: input.mask.source, at: input.mask.at };
}

/** Wraps one capturebundle of the 1.1.78 family in the versioned audit payload: the capture names, the timeline counts, the diff and thumbnail references and the provenance entry count travel together while the capture bytes never ride the envelope, and an export payload whose captures carry no provlog provenance entries refuses at this boundary because a bundle that cannot answer where its captures came from never leaves the device. */
export function capturebundlereport(input: { bundle: { runid: string; captures: string[]; names: Array<{ captureid: string; name: string }>; consoleentries: number; netentries: number; diffs: string[]; thumbnails: string[]; lapses: string[]; provenance: string[]; masked: boolean; at: number } }): { version: typeof protocolversion; runid: string; captures: number; names: Array<{ captureid: string; name: string }>; consoleentries: number; netentries: number; diffs: number; thumbnails: number; lapses: number; provenance: number; masked: boolean; at: number } {
  const covered = new Set(input.bundle.provenance);
  if (input.bundle.captures.length > 0 && (input.bundle.provenance.length === 0 || covered.size === 0)) throw new Error(`The capture bundle of the run ${input.bundle.runid} carries ${input.bundle.captures.length} capture${input.bundle.captures.length === 1 ? "" : "s"} with no provlog provenance entries; an export payload without provenance never leaves the device.`);
  if (!input.bundle.masked) throw new Error(`The capture bundle of the run ${input.bundle.runid} assembles only after the redactshot masks ran over its captures; an unmasked capture never exports.`);
  return { version: protocolversion, runid: input.bundle.runid, captures: input.bundle.captures.length, names: input.bundle.names, consoleentries: input.bundle.consoleentries, netentries: input.bundle.netentries, diffs: input.bundle.diffs.length, thumbnails: input.bundle.thumbnails.length, lapses: input.bundle.lapses.length, provenance: input.bundle.provenance.length, masked: input.bundle.masked, at: input.bundle.at };
}

/** Wraps one sync payload of the 1.1.79 family in the versioned envelope: the classes the user opted in, the format tag, the payload hash and the sync time travel together while the cipher text stays opaque and the passphrase never rides the envelope — a payload that reads plaintext or carries no format tag refuses at this boundary because plaintext never transports. */
export function syncpayloadreport(input: { classes: string[]; payloadhash: string; formattag: string; encrypted: boolean; syncedat: number }): { version: typeof protocolversion; classes: string[]; payloadhash: string; formattag: string; encrypted: true; syncedat: number } {
  if (!input.encrypted) throw new Error("The sync payload ships plaintext; every payload encrypts with the user passphrase before the transport.");
  if (input.formattag.trim() === "") throw new Error("The sync payload carries no format version tag; an envelope that cannot name its format answers no decoder.");
  if (input.classes.length === 0) throw new Error("The sync payload names the data classes it carries; a payload without classes answers no consent.");
  return { version: protocolversion, classes: input.classes, payloadhash: input.payloadhash, formattag: input.formattag, encrypted: true, syncedat: input.syncedat };
}

/** Wraps one exportall bundle of the 1.1.79 family in the versioned envelope: the record ids of every stored family — runs, memory, captures and provenance — ride with the settings marker, the record count and the byte size, and the bundle streams through the download flow without a size cap because a bundle the user asked for streams whole. */
export function exportallreport(input: { bundle: { runs: string[]; memory: string[]; captures: string[]; settings: boolean; provenance: string[]; records: number; bytes: number; at: number } }): { version: typeof protocolversion; runs: number; memory: number; captures: number; settings: boolean; provenance: number; records: number; bytes: number; at: number } {
  return { version: protocolversion, runs: input.bundle.runs.length, memory: input.bundle.memory.length, captures: input.bundle.captures.length, settings: input.bundle.settings, provenance: input.bundle.provenance.length, records: input.bundle.records, bytes: input.bundle.bytes, at: input.bundle.at };
}

/** Wraps one quarantine verdict of the 1.1.79 family in the versioned envelope: the path, the scan verdict, the lifecycle status and the release ref travel together while only a clean verdict ever releases — a held or flagged file never opens, and the entry carries its verdict for the audit trail. */
export function quarantineverdictreport(input: { entry: { id: string; path: string; reason: string; scan: string; status: string; release?: string; at: number; updatedat: number } }): { version: typeof protocolversion; id: string; path: string; reason: string; scan: string; status: string; released: boolean; at: number; updatedat: number } {
  if (input.entry.status === "released" && input.entry.scan !== "clean") throw new Error("Only a clean scanner verdict releases a quarantined file; a held or flagged file never opens.");
  return { version: protocolversion, id: input.entry.id, path: input.entry.path, reason: input.entry.reason, scan: input.entry.scan, status: input.entry.status, released: input.entry.status === "released", at: input.entry.at, updatedat: input.entry.updatedat };
}

/** Wraps one sync consent of the 1.1.79 family in the versioned audit payload: the data class and the consent stamp of every opted in class travel together so the audit trail answers exactly when the user enabled each class, because a synced class without its consent stamp answers no review. */
export function syncconsentreport(input: { consent: Array<{ dataclass: string; at: number }> }): { version: typeof protocolversion; consent: Array<{ dataclass: string; at: number }>; count: number } {
  const seen = new Set<string>();
  for (const entry of input.consent) {
    const key = entry.dataclass.toLowerCase();
    if (key.trim() === "") throw new Error("The sync consent names its data class; an unnamed class answers no consent.");
    if (seen.has(key)) throw new Error(`The sync consent carries the data class ${entry.dataclass} twice; one class answers one consent stamp.`);
    seen.add(key);
  }
  return { version: protocolversion, consent: input.consent, count: input.consent.length };
}

/** Checks one outbound payload of the 1.1.79 family against the local rule fields: a payload that carries a field the user marked local refuses at this protocol boundary before any transport — the request body, the sync payload or the export — because a field marked local never leaves the device. */
export function outboundpayloadcheck(input: { payload: Record<string, unknown>; localfields: string[] }): { ok: true; reason: string } {
  const keys = Object.keys(input.payload).map(key => key.trim().toLowerCase());
  const carried = input.localfields.map(field => field.trim().toLowerCase()).filter(field => field !== "" && keys.includes(field));
  if (carried.length > 0) throw new Error(`The outbound payload carries the local rule field${carried.length === 1 ? "" : "s"} ${carried.join(", ")}; a field marked local never leaves the device.`);
  return { ok: true, reason: "The outbound payload carries no local rule field; every field marked local stayed on the device." };
}

export function costledgerreport(input: { entries: costentry[]; split: Array<{ agentid: string; units: number; share: number; sharedwith?: string[] }> }): { version: typeof protocolversion; entries: costentry[]; split: Array<{ agentid: string; units: number; share: number; sharedwith?: string[] }> } {
  return { version: protocolversion, entries: input.entries.map(entry => ({ agentid: entry.agentid, ...(entry.runid !== undefined ? { runid: entry.runid } : {}), units: entry.units, description: entry.description, at: entry.at })), split: input.split };
}

/** Wraps one navintent prediction pass in the versioned response envelope: the report carries the ranked predicted urls with their confidence between zero and one so the endpoint and the sidepanel read exactly which pages the approved plan is about to need; the predictions grade read only and issue no request of their own. */
export function predictionreport(input: { plan: prefetchplan }): { version: typeof protocolversion; predictedurls: prefetchplan["predictedurls"]; createdat: number } {
  return { version: protocolversion, predictedurls: input.plan.predictedurls, createdat: input.plan.createdat };
}

/** Wraps one executed step outcome in the versioned response envelope for callers, returning the execution environment beside the outcome, attaching the matched element summary, the capture block of capture steps, the media block of media steps, the transport block of outbound calls, the network block of observed exchanges and channels, the control block of applied traffic rules, the timeline block of debugging steps, the cdp block of devtools protocol steps, the profile block of profiling steps, the emulation block with the applied and reverted layer names and the session block with the record id and section counts of session memory steps; the 1.1.70 family carries the runid and the live runstate so a replay maps to its run and every caller sees the machine state, the 1.1.74 family carries the safety block with the checksafeurl verdict reasons and the ratelimitwait block with the domain and the milliseconds a delayed navigation waited so a rate limited step never drops silently, the 1.1.75 family carries the streamcursor block with the pipeline id, the row offset and the chunk index of the last written position, the dedupe report block with the removed and kept counts and the key columns, and the sampledpreview block that records the preview payload as read only, and the 1.1.76 family carries the correlation block with the request id, the correlation id and the paired response so every api result answers its request, the cachehit block with the cache key, the hit count and the served status so a served read names the entry it came from, and the 1.1.77 family carries the ocr block with the image id, the word, line and character counts of a recognition, the vision block with the image id, the description id, the labeled region count and the model that answered, and the grounding block with the description id and its ranked selectors with their scores so every grounded visual claim names the page element it answered, and the 1.1.78 family carries the beforeafter block with the pre and post capture ids of the step so every executed step names the states it wrapped, and the diff block with the baseline id, the capture id, the similarity score, the changed region count and the regression flag so a compared step names exactly what changed. */
export function outcomeresponse(input: { outcome: stepoutcome; plan: agentplan; resolvedtarget?: resolvedtarget; runid?: string; runstate?: string; capture?: { id: string; format: string; bytes: number }; media?: { id: string; kind: string; bytes: number }; transport?: { status: number; headers: string[]; bytes: number; duration: number }; network?: { exchanges: number; channelstate: string; messages: number }; control?: { applied: number; blocked: number; mocked: number }; timeline?: { entries: number; levels: Record<string, number>; collapsed: number }; cdp?: { sessionid: string; state: string; commandids: string[] }; profile?: { metrics: number; samples: number }; emulation?: { applied: string[]; reverted: string[] }; session?: { recordid: string; sections: number; matches?: number; restored?: number; skipped?: number; cursor?: number; bytes?: number }; workflow?: { runid: string; state: string; dryrun?: boolean; produced: string[]; consumed: string[]; timeout?: timeoutabort; retry?: { stepid: string; attempts: number; exhausted: boolean } }; trigger?: { ruleid: string; kind: string; enabled: boolean; nextfireat?: number }; tool?: { clientid: string; tool: string; origin: string; ok: boolean; code?: rpcerrorcode }; safety?: { url: string; safe: boolean; reasons: string[] }; ratelimitwait?: { domain: string; waitedms: number }; streamcursor?: { pipelineid: string; offset: number; chunk: number; updatedat: number }; dedupe?: { removed: number; kept: number; keys: string[] }; sampledpreview?: { rows: number; strategy: string; readonly: true }; correlation?: { requestid: string; correlationid: string; responseid?: string; status?: number; method: string; url: string }; cachehit?: { key: string; hits: number; status: number; url: string }; ocr?: { imageid: string; words: number; lines: number; characters: number }; vision?: { imageid: string; descriptionid: string; regions: number; model: string }; grounding?: { descriptionid: string; selectors: Array<{ selector: string; score: number }> }; beforeafter?: { stepid: string; preid?: string; postid?: string; stepkind: string }; diff?: { baselineid: string; captureid: string; score: number; regions: number; regression: boolean } }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, outcome: input.outcome, ...(input.runid !== undefined ? { runid: input.runid } : {}), ...(input.runstate !== undefined ? { runstate: input.runstate } : {}), ...(input.resolvedtarget ? { resolvedtarget: input.resolvedtarget } : {}), ...(input.capture ? { capture: input.capture } : {}), ...(input.media ? { media: input.media } : {}), ...(input.transport ? { transport: input.transport } : {}), ...(input.network ? { network: input.network } : {}), ...(input.control ? { control: input.control } : {}), ...(input.timeline ? { timeline: input.timeline } : {}), ...(input.cdp ? { cdp: input.cdp } : {}), ...(input.profile ? { profile: input.profile } : {}), ...(input.emulation ? { emulation: input.emulation } : {}), ...(input.session ? { session: input.session } : {}), ...(input.workflow ? { workflow: { runid: input.workflow.runid, state: input.workflow.state, ...(input.workflow.dryrun === true ? { dryrun: true } : {}), produced: input.workflow.produced, consumed: input.workflow.consumed, ...(input.workflow.timeout !== undefined ? { timeout: input.workflow.timeout } : {}), ...(input.workflow.retry !== undefined ? { retry: input.workflow.retry } : {}) } } : {}), ...(input.trigger ? { trigger: { ruleid: input.trigger.ruleid, kind: input.trigger.kind, enabled: input.trigger.enabled, ...(input.trigger.nextfireat !== undefined ? { nextfireat: input.trigger.nextfireat } : {}) } } : {}), ...(input.tool ? { tool: { clientid: input.tool.clientid, tool: input.tool.tool, origin: input.tool.origin, ok: input.tool.ok, ...(input.tool.code !== undefined ? { code: input.tool.code } : {}) } } : {}), ...(input.safety ? { safety: input.safety } : {}), ...(input.ratelimitwait ? { ratelimitwait: input.ratelimitwait } : {}), ...(input.streamcursor ? { streamcursor: input.streamcursor } : {}), ...(input.dedupe ? { dedupe: input.dedupe } : {}), ...(input.sampledpreview ? { sampledpreview: input.sampledpreview } : {}), ...(input.correlation ? { correlation: input.correlation } : {}), ...(input.cachehit ? { cachehit: input.cachehit } : {}), ...(input.ocr ? { ocr: input.ocr } : {}), ...(input.vision ? { vision: input.vision } : {}), ...(input.grounding ? { grounding: input.grounding } : {}), ...(input.beforeafter ? { beforeafter: input.beforeafter } : {}), ...(input.diff ? { diff: input.diff } : {}) });
}

/** Wraps a clickable map payload with numbered entries in the versioned response envelope. */
export function mapresponse(input: { map: clickablemap; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, map: input.map });
}

/** Reports the keys currently held on one tab for the live context envelope, refreshed per step. */
export function heldkeysreport(input: { tabid: number; holds: keyholdstate[] }): { version: typeof protocolversion; tabid: number; heldkeys: keyholdstate[] } {
  return { version: protocolversion, tabid: input.tabid, heldkeys: input.holds };
}

/** Wraps one observation capture with its a11y, reader, listpattern, tableshape and diff sections in the versioned response envelope. */
export function observationresponse(input: { observation: observation; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, observation: input.observation });
}

/** Wraps mutation, focus and banner event records with their timestamps and target paths in the versioned response envelope. */
export function eventresponse(input: { events: Array<mutationevent | focusevent | bannerreport>; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, events: input.events });
}

/** Wraps one snapshot diff with its added, removed and changed nodes and its two observation versions in the versioned response envelope. */
export function diffresponse(input: { diff: snapshotdiff; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, diff: input.diff });
}

/** Reports the detected page language, template class, scroll lock and banner state in the live context envelope. */
export function signalsreport(input: { signals?: pagesignals }): { version: typeof protocolversion; language?: string; template?: string; scrolllocked?: boolean; banner?: string } {
  const signals = input.signals;
  return {
    version: protocolversion,
    ...(signals && signals.language !== undefined ? { language: signals.language } : {}),
    ...(signals && signals.template !== undefined ? { template: signals.template } : {}),
    ...(signals && signals.scrolllocked !== undefined ? { scrolllocked: signals.scrolllocked } : {}),
    ...(signals && signals.banner !== undefined ? { banner: signals.banner } : {}),
  };
}

/** Wraps derived selector candidates with their stability scores in the versioned response envelope. */
export function selectorresponse(input: { candidates: selectorcandidate[]; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, candidates: input.candidates });
}

/** Wraps the live navigation state with its load phase, final url and redirect chain in the versioned response envelope. */
export function navstateresponse(input: { navstate: navstate; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, navstate: input.navstate });
}

/** Carries the navigation trail of a session with its visited urls, titles and step refs in the session context envelope. */
export function trailreport(input: { sessionid?: string; trail: trailentry[] }): { version: typeof protocolversion; sessionid?: string; trail: trailentry[] } {
  return { version: protocolversion, ...(input.sessionid ? { sessionid: input.sessionid } : {}), trail: input.trail };
}

/** Wraps url safety verdicts with their reasons in the versioned response envelope for external link review. */
export function safetyresponse(input: { verdicts: safetyverdict[]; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, verdicts: input.verdicts });
}

/** Wraps one tab report with its matched tabs, groups and badges in the versioned response envelope. */
export function tabreportresponse(input: { report: tabreport; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}

/** Carries the saved tab layouts with their window bounds and group states in the session context envelope. */
export function layoutreport(input: { layouts: tablayout[] }): { version: typeof protocolversion; layouts: tablayout[] } {
  return { version: protocolversion, layouts: input.layouts };
}

/** Wraps one form report with the detected fields, their kinds and the matched controls in the versioned response envelope. */
export function formreportresponse(input: { report: formreport; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}

/** Wraps one collected error report with its field refs and messages in the versioned response envelope for correction loops. */
export function errorreportresponse(input: { report: errorreport; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, report: input.report });
}

/** Carries the wizard states with their step history and the recorded typeahead picks in the session context envelope. */
export function wizardreport(input: { sessionid?: string; wizards: wizardstate[]; picks: typeaheadpick[] }): { version: typeof protocolversion; sessionid?: string; wizards: wizardstate[]; picks: typeaheadpick[] } {
  return { version: protocolversion, ...(input.sessionid ? { sessionid: input.sessionid } : {}), wizards: input.wizards, picks: input.picks };
}

/** Wraps one dataset payload with its column specs and a sampled row list in the versioned response envelope. */
export function datasetresponse(input: { dataset: dataset; plan: agentplan; sample?: number }): string {
  const sample = Math.max(0, Math.floor(input.sample ?? 10));
  const payload = { ...input.dataset, rows: input.dataset.rows.slice(0, sample), totalrows: input.dataset.rows.length };
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, dataset: payload });
}

/** Carries the extraction progress with visited page counts, collected row counts and resume cursors in the session context envelope. */
export function extractionreport(input: { sessions: extractsession[] }): { version: typeof protocolversion; sessions: extractsession[] } {
  return { version: protocolversion, sessions: input.sessions };
}

/** Reports the provenance records of every exported artifact with its source url, step ref, row range and checksum in the session context envelope. */
export function provenancereport(input: { records: provenancerecord[] }): { version: typeof protocolversion; records: provenancerecord[] } {
  return { version: protocolversion, records: input.records };
}

/** Documents the reviewed transform rule grammar shared by transformvalues steps and the task rules store. */
export function transformgrammar(rules: transformrule[]): string {
  return JSON.stringify({ rules: rules.map(rule => ({ expression: rule.expression, sources: rule.sources, target: rule.target })) });
}

/** Wraps the batch download queue with per file states, resolved paths and checksums in the versioned response envelope. */
export function downloadreport(input: { downloads: downloadrecord[]; plan: agentplan }): string {
  return JSON.stringify({ version: protocolversion, planid: input.plan.id, planstate: input.plan.state, downloads: input.downloads });
}

/** Carries the captured network log records with their step correlation through request ids in the session context envelope. */
export function netlogreport(input: { records: netlogrecord[] }): { version: typeof protocolversion; records: netlogrecord[] } {
  return { version: protocolversion, records: input.records };
}

/** Carries the quarantine entries with their scan verdicts and release refs in the session context envelope. */
export function quarantinereport(input: { entries: quarantineentry[] }): { version: typeof protocolversion; entries: quarantineentry[] } {
  return { version: protocolversion, entries: input.entries };
}

/** Carries every stored capture record with its metadata and the before and after shotpairs of the run in the session context envelope. */
export function capturereport(input: { records: shotrecord[]; pairs: shotpair[] }): { version: typeof protocolversion; records: shotrecord[]; pairs: shotpair[] } {
  return { version: protocolversion, records: input.records, pairs: input.pairs };
}

/** Carries every stored media record of pdf documents, recordings, frames, canvases, stream probes and assets beside the observed image batches in the session context envelope. */
export function mediareport(input: { records: mediarecord[]; images: imagebatch[] }): { version: typeof protocolversion; records: mediarecord[]; images: imagebatch[] } {
  return { version: protocolversion, records: input.records, images: input.images };
}

/** Carries every outbound call record of the run in the session context envelope with the response bodies held back; the metadata keeps method, origin, status class, retries and byte counts. */
export function callsreport(input: { calls: callrecord[] }): { version: typeof protocolversion; calls: Array<Omit<callrecord, "body"> & { body?: undefined }> } {
  const calls = input.calls.map(call => {
    const { body, ...metadata } = call;
    void body;
    return metadata;
  });
  return { version: protocolversion, calls };
}

/** Carries every observed exchange, channel, stream subscription and api map entry of the run in the session context envelope with correlation ids kept and captured body bytes held back. */
export function exchangesreport(input: { exchanges: exchangerecord[]; channels: channelrecord[]; subscriptions: eventsubscription[]; apimap: apimapentry[] }): { version: typeof protocolversion; exchanges: exchangerecord[]; channels: channelrecord[]; subscriptions: eventsubscription[]; apimap: apimapentry[] } {
  return { version: protocolversion, exchanges: input.exchanges, channels: input.channels, subscriptions: input.subscriptions, apimap: input.apimap };
}

/** Carries every stored token record per provider in the session context envelope with scopes, origin scope and expiry windows; token values and their storage ids never appear because the material stays behind the storage seam. */
export function authreport(input: { tokens: tokenrecord[] }): { version: typeof protocolversion; tokens: Array<Omit<tokenrecord, "accessstorageid" | "refreshstorageid"> & { accessstorageid?: undefined; refreshstorageid?: undefined }> } {
  const tokens = input.tokens.map(token => {
    const { accessstorageid, refreshstorageid, ...metadata } = token;
    void accessstorageid;
    void refreshstorageid;
    return metadata;
  });
  return { version: protocolversion, tokens };
}

/** Carries the traffic control state of the run in the session context envelope: the active block, mock and rewrite rule sets with hit counts, the cookie operations with values redacted, the proxy route history with apply and revert times and the rate limit states with reset windows. */
export function controlreport(input: { blocks: blockrule[]; mocks: mockspec[]; rewrites: headerule[]; cookies: cookieoperation[]; proxies: proxyroute[]; ratelimits: ratelimitread[] }): { version: typeof protocolversion; blocks: blockrule[]; mocks: Array<Omit<mockspec, "body"> & { body?: undefined }>; rewrites: headerule[]; cookies: cookieoperation[]; proxies: proxyroute[]; ratelimits: ratelimitread[] } {
  const mocks = input.mocks.map(spec => {
    const { body, ...metadata } = spec;
    void body;
    return metadata;
  });
  return { version: protocolversion, blocks: input.blocks, mocks, rewrites: input.rewrites, cookies: input.cookies, proxies: input.proxies, ratelimits: input.ratelimits };
}

/** Carries the run timeline in the session context envelope: every entry with its level, source, step id and message, the error and rejection records with their stack frames, the long task entries with attribution names and the entry counts per level. */
export function timelinereport(input: { entries: timelineentry[]; errors: errorrecord[]; rejections: rejectionrecord[]; longtasks: longtaskentry[]; levelcounts: Record<string, number> }): { version: typeof protocolversion; entries: timelineentry[]; errors: errorrecord[]; rejections: rejectionrecord[]; longtasks: longtaskentry[]; levelcounts: Record<string, number> } {
  return { version: protocolversion, entries: input.entries, errors: input.errors, rejections: input.rejections, longtasks: input.longtasks, levelcounts: input.levelcounts };
}

/** Carries one console diff result in the session context envelope with every line classified as added, removed or repeated and the counts of each class. */
export function consolediffreport(input: { diff: consolediff }): { version: typeof protocolversion; diff: consolediff } {
  return { version: protocolversion, diff: input.diff };
}

/** Carries the devtools protocol state of the run in the session context envelope: every session with its domains and durations, the command outcomes with durations and error classes, the event rules with match counts, the breakpoints with hit counts and conditions, the pause states with their call frames and dom snapshot ids, the watch expressions with their per pause values and the script overrides with review provenance while the fixture sources stay held back. */
export function cdpreport(input: { sessions: cdpsession[]; commands: cdpcommand[]; events: cdpeventrule[]; breakpoints: breakpointspec[]; pauses: pausestate[]; watches: watchexpression[]; overrides: scriptoverride[]; grants: debuggergrant[] }): { version: typeof protocolversion; sessions: cdpsession[]; commands: cdpcommand[]; events: cdpeventrule[]; breakpoints: breakpointspec[]; pauses: pausestate[]; watches: watchexpression[]; overrides: Array<Omit<scriptoverride, "source"> & { source?: undefined }>; grants: Array<Omit<debuggergrant, "prompt"> & { prompt?: undefined }> } {
  const overrides = input.overrides.map(spec => {
    const { source, ...metadata } = spec;
    void source;
    return metadata;
  });
  const grants = input.grants.map(grant => {
    const { prompt, ...metadata } = grant;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, sessions: input.sessions, commands: input.commands, events: input.events, breakpoints: input.breakpoints, pauses: input.pauses, watches: input.watches, overrides, grants };
}

/** Carries the profiling state of the run in the session context envelope: every flow metric with its step span and duration, the heap records with byte and node counts, the growth samples with the computed trend of flagged steps, the cpu profiles with hot function lists, the layout shift entries with scores and impacted selectors, the trace records with their category lists, event counts and step annotations, and the source map references with their parsed state while the source map consent prompts stay held back. */
export function profilereport(input: { flows: flowmetric[]; heaps: heaprecord[]; samples: growsample[]; trends: memorytrend[]; profiles: cpuprofile[]; shifts: shiftentry[]; traces: tracerecord[]; sourcemaps: sourcemapref[]; consents: sourcemapconsent[] }): { version: typeof protocolversion; flows: flowmetric[]; heaps: heaprecord[]; samples: growsample[]; trends: memorytrend[]; profiles: cpuprofile[]; shifts: shiftentry[]; traces: tracerecord[]; sourcemaps: sourcemapref[]; consents: Array<Omit<sourcemapconsent, "prompt"> & { prompt?: undefined }> } {
  const consents = input.consents.map(consent => {
    const { prompt, ...metadata } = consent;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, flows: input.flows, heaps: input.heaps, samples: input.samples, trends: input.trends, profiles: input.profiles, shifts: input.shifts, traces: input.traces, sourcemaps: input.sourcemaps, consents };
}

/** Builds the emulation report envelope of the run: the layer history with revert plans beside every layer, the user curated device, network, location and agent preset libraries, the blackbox rule sets per origin, the permission override history with restore states and the location consents with their coordinates shown while the prompt text stays out of the envelope. */
export function emulationreport(input: { state?: emulationstate; devices: devicepreset[]; networks: networkpreset[]; locations: locationpreset[]; agents: agentpreset[]; blackbox: Array<{ origin: string; rules: blackboxrule[] }>; permissions: permissionoverriderecord[]; consents: locationconsent[] }): { version: typeof protocolversion; state?: emulationstate; layers: emulationlayer[]; devices: devicepreset[]; networks: networkpreset[]; locations: locationpreset[]; agents: agentpreset[]; blackbox: Array<{ origin: string; rules: blackboxrule[] }>; permissions: permissionoverriderecord[]; consents: Array<Omit<locationconsent, "prompt"> & { prompt?: undefined }> } {
  const consents = input.consents.map(consent => {
    const { prompt, ...metadata } = consent;
    void prompt;
    return metadata;
  });
  return { version: protocolversion, ...(input.state !== undefined ? { state: input.state } : {}), layers: input.state?.layers ?? [], devices: input.devices, networks: input.networks, locations: input.locations, agents: input.agents, blackbox: input.blackbox, permissions: input.permissions, consents };
}

/** Builds the session memory report envelope of the run: every saved session record with its tabs, sections, folder and tags, the session event history with timestamps, the folder tree, the stored diff results and the reviewed auto snapshot interval; the crash marker of an interrupted run travels beside the records so the sessions view can offer the crash restore. */
export function sessionreport(input: { records: sessionrecord[]; events: sessionevent[]; folders: sessionfolder[]; diffs: sessiondiff[]; auto?: autointerval; crashed?: boolean }): { version: typeof protocolversion; records: sessionrecord[]; events: sessionevent[]; folders: sessionfolder[]; diffs: sessiondiff[]; auto?: autointerval; crashed?: boolean } {
  return { version: protocolversion, records: input.records, events: input.events, folders: input.folders, diffs: input.diffs, ...(input.auto !== undefined ? { auto: input.auto } : {}), ...(input.crashed === true ? { crashed: true } : {}) };
}

/** Builds the workflow report envelope of the run: the saved workflow records with their expanded step lists, the run states, the shareable step templates, the live runlog of the newest run, the variable values per scope, the provenance of expression results and regex captures and the control flow decisions of the newest run. */
export function workflowreport(input: { workflows: workflowrecord[]; runs: workflowrun[]; templates: steptemplate[]; log?: runlogentry[]; scopes?: variablescope[]; provenance?: workflowprovenance[]; control?: controlflowdecision[] }): { version: typeof protocolversion; workflows: workflowrecord[]; runs: workflowrun[]; templates: steptemplate[]; log: runlogentry[]; scopes: variablescope[]; provenance: workflowprovenance[]; control: controlflowdecision[] } {
  return { version: protocolversion, workflows: input.workflows, runs: input.runs, templates: input.templates, log: input.log ?? [], scopes: input.scopes ?? [], provenance: input.provenance ?? [], control: input.control ?? [] };
}

/** One trigger list entry of the trigger report envelope: the rule identity, its family, the workflow name beside the id, the runtime state with the effective cooldown, the per rule counters, the next scheduled fire time and the review summary of the match fields. */
export interface triggerentry {
  id: string;
  kind: string;
  workflowid: string;
  workflowname?: string;
  label: string;
  enabled: boolean;
  paused?: boolean;
  cooldown: number;
  lastfireat?: number;
  nextfireat?: number;
  fires: number;
  launches: number;
  suppressions: number;
  summary: Record<string, unknown>;
}

/** Builds the trigger list envelope of the run: every armed rule with its workflow name, runtime state, counters and next scheduled fire time beside the queued fires waiting for a busy run or a paused session. */
export function triggerlist(input: { rules: triggerule[]; workflows: workflowrecord[]; queue?: triggerfire[] }): { version: typeof protocolversion; rules: triggerentry[]; queued: number } {
  const names = new Map(input.workflows.map(record => [record.id, record.name]));
  const rules = input.rules.map(rule => {
    const workflowname = names.get(rule.workflowid);
    return {
      id: rule.id,
      kind: rule.kind,
      workflowid: rule.workflowid,
      ...(workflowname !== undefined ? { workflowname } : {}),
      label: rule.label,
      enabled: rule.state.enabled,
      ...(rule.state.pausedat !== undefined ? { paused: true } : {}),
      cooldown: rule.state.cooldown,
      ...(rule.state.lastfireat !== undefined ? { lastfireat: rule.state.lastfireat } : {}),
      ...(rule.state.nextfireat !== undefined ? { nextfireat: rule.state.nextfireat } : {}),
      fires: rule.stats.fires,
      launches: rule.stats.launches,
      suppressions: rule.stats.suppressions,
      summary: triggersummaryof(rule),
    };
  });
  return { version: protocolversion, rules, queued: (input.queue ?? []).length };
}

/** Renders the review summary of one armed rule for the trigger list without importing the engine module so the envelope stays a pure projection. */
function triggersummaryof(rule: triggerule): Record<string, unknown> {
  const summary: Record<string, unknown> = { kind: rule.kind, workflowid: rule.workflowid };
  if (rule.origins !== undefined) summary.origins = rule.origins;
  if (rule.pattern !== undefined) summary.pattern = rule.pattern;
  if (rule.title !== undefined) summary.title = rule.title;
  if (rule.command !== undefined) summary.command = rule.command;
  if (rule.key !== undefined) summary.key = rule.key;
  if (rule.cron !== undefined) summary.cron = rule.cron;
  if (rule.timezone !== undefined) summary.timezone = rule.timezone;
  if (rule.period !== undefined) summary.period = rule.period;
  if (rule.jitter !== undefined) summary.jitter = rule.jitter;
  if (rule.urls !== undefined) summary.urls = rule.urls;
  if (rule.events !== undefined) summary.events = rule.events;
  if (rule.schema !== undefined) summary.fields = rule.schema.length;
  return summary;
}

/** Builds the trigger fired notification envelope for listeners: the fire identity, the rule and workflow it launched, the cause, the triggering url and title and the payload carried into the run context; cooldown and dedupe suppressions never notify, they only count. */
export function triggerfired(input: { fire: triggerfire; workflowid: string; runid?: string }): { version: typeof protocolversion; triggerfired: { fireid: string; ruleid: string; workflowid: string; at: number; cause: string; url?: string; title?: string; runid?: string } } {
  return { version: protocolversion, triggerfired: { fireid: input.fire.id, ruleid: input.fire.ruleid, workflowid: input.workflowid, at: input.fire.at, cause: input.fire.cause, ...(input.fire.url !== undefined ? { url: input.fire.url } : {}), ...(input.fire.title !== undefined ? { title: input.fire.title } : {}), ...(input.runid !== undefined ? { runid: input.runid } : {}) } };
}

/** Builds the manual run preview envelope: the manual run request with its step preview so a human always sees what a run will do before confirming it. */
export function manualrunpreview(input: { preview: manualrun; workflowname?: string }): { version: typeof protocolversion; manualrun: manualrun; workflowname?: string } {
  return { version: protocolversion, manualrun: input.preview, ...(input.workflowname !== undefined ? { workflowname: input.workflowname } : {}) };
}

/** Builds one agent protocol toolcall frame: the json rpc request a paired client sends to invoke one namespaced tool behind the consent gates. */
export function toolcallframe(input: { id: number | string; name: string; params?: Record<string, unknown> }): jsonrpcframe {
  return { jsonrpc: "2.0", id: input.id, method: "tools/call", params: { ...(input.params ?? {}), name: input.name } };
}

/** Builds one agent protocol toolresult frame: the json rpc response that answers a tool call with the tool result or the rpc error, carrying the consent refusals with the consentrefused code. */
export function toolresultframe(input: { id: number | string | null; result?: toolresult; error?: rpcerror }): jsonrpcframe {
  return { jsonrpc: "2.0", id: input.id, ...(input.error !== undefined ? { error: input.error } : { result: input.result }) };
}

/** The file format version of an exported workflow file: a json or yaml document carrying the format marker, the export time, the composed workflow record with its version metadata, an optional change note and the packed step templates of a share bundle. Secrets never travel: the export content review refuses any step options or template payloads that name a secret, token, api key or password field before the file is written. */
export const workflowfileversion = 1 as const;

/** Builds the editor state envelope for panel synchronization: the canvas model of the open workflow beside its version timeline, the stored diff results, the run history with the filter answers, the breakpoints, the per site overrides, the pending imports held for review and the watchdog status with its recent events. */
export function editorstate(input: { model?: editormodel; versions: workflowversion[]; diffs?: versiondiff[]; history: runhistoryentry[]; breakpoints?: string[]; overrides: siteoverride[]; imports: Array<{ id: string; workflowid: string; name: string; version: number; steps: number; risk: string; importedat: number; filename?: string }>; backgroundruns?: Record<string, boolean>; watchdog: { config?: watchdogconfig; events: watchdogrecord[] } }): { version: typeof protocolversion; editor: { versions: workflowversion[]; diffs: versiondiff[]; history: runhistoryentry[]; breakpoints: string[]; overrides: siteoverride[]; imports: Array<{ id: string; workflowid: string; name: string; version: number; steps: number; risk: string; importedat: number; filename?: string }>; backgroundruns: Record<string, boolean>; watchdog: { config?: watchdogconfig; events: watchdogrecord[] } }; model?: editormodel } {
  const editor = { versions: input.versions, diffs: input.diffs ?? [], history: input.history, breakpoints: input.breakpoints ?? [], overrides: input.overrides, imports: input.imports, backgroundruns: input.backgroundruns ?? {}, watchdog: { ...(input.watchdog.config !== undefined ? { config: input.watchdog.config } : {}), events: input.watchdog.events } };
  return { version: protocolversion, editor, ...(input.model !== undefined ? { model: input.model } : {}) };
}

/** Parses one run history query envelope with its filters: the workflow id, the outcome, the time floor and the entry count the caller asks for, each optional and each a user choice with no code ceiling. */
export function runhistoryquery(value: unknown): { workflowid?: string; outcome?: string; since?: number; limit?: number } {
  if (value === undefined || value === null) return {};
  const candidate = record(value);
  const query: { workflowid?: string; outcome?: string; since?: number; limit?: number } = {};
  if (candidate.workflowid !== undefined) {
    if (typeof candidate.workflowid !== "string" || !candidate.workflowid.trim()) throw new Error("The run history workflow filter must be a non-empty string.");
    query.workflowid = candidate.workflowid;
  }
  if (candidate.outcome !== undefined) {
    if (typeof candidate.outcome !== "string" || !candidate.outcome.trim()) throw new Error("The run history outcome filter must be a non-empty string.");
    query.outcome = candidate.outcome;
  }
  if (candidate.since !== undefined) {
    if (typeof candidate.since !== "number" || !Number.isFinite(candidate.since)) throw new Error("The run history time floor must be a finite timestamp.");
    query.since = candidate.since;
  }
  if (candidate.limit !== undefined) {
    if (typeof candidate.limit !== "number" || !Number.isInteger(candidate.limit) || candidate.limit < 1) throw new Error("The run history entry count must be a positive integer with no code ceiling.");
    query.limit = candidate.limit;
  }
  return query;
}

/** Builds the run history report envelope: the filtered entries newest first with the applied filter echoed so the panel renders what it asked for. */
export function runhistoryreport(input: { entries: runhistoryentry[]; query?: { workflowid?: string; outcome?: string; since?: number; limit?: number } }): { version: typeof protocolversion; entries: runhistoryentry[]; query: { workflowid?: string; outcome?: string; since?: number; limit?: number } } {
  return { version: protocolversion, entries: input.entries, query: input.query ?? {} };
}

/** Builds the http stream transport report: the posted json rpc endpoint, the server sent event channel path, the heartbeat rhythm and the open and dead channel counts of the remote surface. */
export function httpstreamreport(input: { stream: httpstreamconfig; channels: streamchannel[]; now: number }): { version: typeof protocolversion; endpoint: string; streampath: string; heartbeatms: number; idlewindowms: number; channelsopen: number; channelsdead: number } {
  const open = input.channels.filter(channel => channel.closedat === undefined && input.now - channel.lastbeatat < (input.stream.idlewindowms ?? defaultidlewindowms));
  return { version: protocolversion, endpoint: input.stream.endpoint, streampath: input.stream.streampath, heartbeatms: input.stream.heartbeatms ?? defaultheartbeatms, idlewindowms: input.stream.idlewindowms ?? defaultidlewindowms, channelsopen: open.length, channelsdead: input.channels.length - open.length };
}

/** Builds the pairing and auth handshake frames: the request frame carries the pairing code or the token answer while the response frame answers the verified exchange or the fixed refusal that leaks no pairing state. */
export function pairingframes(input: { id: number | string; challenge: authchallenge; answer?: string; outcome: "issued" | "verified" | "refused" }): { request: jsonrpcframe; response: jsonrpcframe } {
  const request = { jsonrpc: "2.0" as const, id: input.id, method: "pairing", params: { nonce: input.challenge.nonce, method: input.challenge.method, ...(input.answer !== undefined ? { answer: input.answer } : {}) } };
  const response = input.outcome === "verified"
    ? { jsonrpc: "2.0" as const, id: input.id, result: { paired: true, method: input.challenge.method } }
    : input.outcome === "issued"
      ? { jsonrpc: "2.0" as const, id: input.id, result: { challenge: input.challenge.nonce, method: input.challenge.method, expiresat: input.challenge.expiresat } }
      : { jsonrpc: "2.0" as const, id: input.id, error: rpcerrorof("consentrefused", authrefusedmessage) };
  return { request, response };
}

/** Builds the session token report: every stored token with its client, scopes, issue and expiry times and the remaining lifetime — never the raw token or its digest. */
export function tokenreport(tokens: sessiontoken[], now: number): { version: typeof protocolversion; tokens: Array<{ id: string; clientid: string; scopes: string[]; issuedat: number; expiresat: number; revokedat?: number; msremaining?: number }> } {
  return { version: protocolversion, tokens: tokens.map(token => ({ id: token.id, clientid: token.clientid, scopes: token.scopes, issuedat: token.issuedat, expiresat: token.expiresat, ...(token.revokedat !== undefined ? { revokedat: token.revokedat } : { msremaining: Math.max(0, token.expiresat - now) }) })) };
}

/** Builds the approval gate request and response frames: the request frame raises the gate with the redacted arguments while the response frame answers the decision or the expiry refusal. */
export function approvalframes(input: { id: number | string; request: approvalrequest; identity?: clientidentity }): { raise: jsonrpcframe; decision: jsonrpcframe } {
  const raise = { jsonrpc: "2.0" as const, id: input.id, method: "approval", params: { approvalid: input.request.id, clientid: input.request.clientid, tool: input.request.tool, reason: input.request.reason, arguments: JSON.stringify(redactparams(input.request.params, input.request.secretfields ?? [])), ...(input.request.timeoutat !== undefined ? { timeoutat: input.request.timeoutat } : {}) } };
  const decision = input.request.state === "pending"
    ? { jsonrpc: "2.0" as const, id: input.id, result: { approvalid: input.request.id, state: "pending" as const } }
    : input.request.state === "approved"
      ? { jsonrpc: "2.0" as const, id: input.id, result: { approvalid: input.request.id, state: "approved" as const, ...(input.identity !== undefined ? { client: input.identity.displayname } : {}) } }
      : { jsonrpc: "2.0" as const, id: input.id, error: rpcerrorof("consentrefused", input.request.state === "refused" ? `The approval gate for ${input.request.tool} was refused and the call never executes.` : `The approval gate for ${input.request.tool} expired and the call refuses by default.`) };
  return { raise, decision };
}

/** Builds the tls report of the remote transport: the user configured mode, the certificate requirement and whether the peer was verified. */
export function tlsreport(tls: tlsconfig): { version: typeof protocolversion; mode: string; certificaterequired: boolean; verified: boolean } {
  return { version: protocolversion, mode: tls.mode, certificaterequired: tls.mode === "required" || tls.certificatefingerprint !== undefined, verified: tls.verifiedat !== undefined };
}

/** Builds the allowlist report with the namespace scoping: every entry with its display name, granted namespaces, grant time and grant history count. */
export function allowlistreport(entries: allowlistentry[]): { version: typeof protocolversion; entries: Array<{ fingerprint: string; displayname: string; namespaces: string[]; grantedat: number; grants: number }> } {
  return { version: protocolversion, entries: entries.map(entry => ({ fingerprint: entry.fingerprint, displayname: entry.displayname, namespaces: entry.namespaces, grantedat: entry.grantedat, grants: entry.history.length })) };
}

/** Builds the heartbeat report of the stream channels: the last beat times, the open and dead counts and whether the client heartbeats stayed inside the idle window. */
export function heartbeatreport(input: { channels: streamchannel[]; now: number; idlewindow?: number }): { version: typeof protocolversion; beats: number; open: number; dead: number } {
  const open = input.channels.filter(channel => channel.closedat === undefined && input.now - channel.lastbeatat < (input.idlewindow ?? defaultidlewindowms));
  return { version: protocolversion, beats: input.channels.filter(channel => channel.lastbeatat > channel.openedat).length, open: open.length, dead: input.channels.length - open.length };
}

/**
 * Agent protocol part three envelopes of the 1.1.56 family: the event subscription frames with their kinds and filters, the event notification frames, the page state delta reports of the resource watchers, the sampling callback frames with the exact prompt payload, the prompt tool report and its call frame, the stream chunk and progress notice frames, the cancellation frames with their partial results, the structured error report with its retry hints, the idempotent replay frame, the batch report with its per item outcomes, the rate limit usage report, the call log report, the in flight call report, the dry run report and the mock report.
 */

/** Builds the event subscription frames: the subscribe frame carries the event kinds with the origin and tool filters while the unsubscribe frame cancels the subscription by its id. */
export function subscriptionframes(input: { id: number | string; subscription: protocoleventsubscription }): { subscribe: jsonrpcframe; unsubscribe: jsonrpcframe } {
  const subscribe = { jsonrpc: "2.0" as const, id: input.id, method: "events/subscribe", params: { subscriptionid: input.subscription.id, kinds: input.subscription.kinds, ...(input.subscription.origin !== undefined ? { origin: input.subscription.origin } : {}), ...(input.subscription.tool !== undefined ? { tool: input.subscription.tool } : {}) } };
  const unsubscribe = { jsonrpc: "2.0" as const, id: input.id, method: "events/unsubscribe", params: { subscriptionid: input.subscription.id } };
  return { subscribe, unsubscribe };
}

/** Builds one event notification frame that pushes one protocol event to a subscriber: the subscription id, the event kind and the payload of the event. */
export function eventnotification(input: { subscriptionid: string; kind: eventkind; origin?: string; tool?: string; payload?: Record<string, unknown>; now: number }): jsonrpcframe {
  return { jsonrpc: "2.0", method: "events/notify", params: { subscriptionid: input.subscriptionid, kind: input.kind, ...(input.origin !== undefined ? { origin: input.origin } : {}), ...(input.tool !== undefined ? { tool: input.tool } : {}), ...(input.payload !== undefined ? { payload: input.payload } : {}), at: input.now } };
}

/** Builds the page state delta report of one resource watcher: the watch id, the client, the watched resource, the changed keys against the baseline and the delivery time. */
export function resourcedeltareport(input: { watchid: string; clientid: string; resource: string; delta: Record<string, unknown>; now: number }): { version: typeof protocolversion; watchid: string; clientid: string; resource: string; delta: Record<string, unknown>; at: number } {
  return { version: protocolversion, watchid: input.watchid, clientid: input.clientid, resource: input.resource, delta: input.delta, at: input.now };
}

/** Builds the sampling callback frames: the request frame carries the exact prompt payload with the granted page content and the system text while the answer frame carries the client completion or the refusal. */
export function samplingframes(input: { id: number | string; request: samplingrequest }): { request: jsonrpcframe; answer: jsonrpcframe } {
  const request = { jsonrpc: "2.0" as const, id: input.id, method: "sampling/request", params: { samplingid: input.request.id, prompt: input.request.prompt, ...(input.request.system !== undefined ? { system: input.request.system } : {}), ...(input.request.pagecontent !== undefined ? { pagecontent: input.request.pagecontent } : {}), ...(input.request.maxtokens !== undefined ? { maxtokens: input.request.maxtokens } : {}) } };
  const answer = input.request.state === "answered"
    ? { jsonrpc: "2.0" as const, id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, answer: input.request.answer ?? "" } }
    : input.request.state === "refused"
      ? { jsonrpc: "2.0" as const, id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, refused: true } }
      : { jsonrpc: "2.0" as const, id: input.id, method: "sampling/answer", params: { samplingid: input.request.id, state: "pending" as const } };
  return { request, answer };
}

/** Builds the prompt tool report: every prompt def with its name, description, declared arguments and template so a client discovers the prompts as callable tools. */
export function promptreport(input: { prompts: promptdef[] }): { version: typeof protocolversion; prompts: Array<{ name: string; description: string; arguments: promptdef["arguments"]; template: string }> } {
  return { version: protocolversion, prompts: input.prompts.map(prompt => ({ name: prompt.name, description: prompt.description, arguments: prompt.arguments, template: prompt.template })) };
}

/** Builds the prompt call frame: the prompt name with its arguments that renders the template and returns the arguments as one tool call. */
export function promptcallframe(input: { id: number | string; name: string; args: Record<string, unknown> }): jsonrpcframe {
  return { jsonrpc: "2.0", id: input.id, method: "prompts/call", params: { name: input.name, arguments: input.args } };
}

/** Builds one stream chunk notification frame: the call id, the sequence number, the content slice and the done marker of the progressive result. */
export function streamchunkframe(chunk: streamchunk): jsonrpcframe {
  return { jsonrpc: "2.0", method: "calls/stream", params: { callid: chunk.callid, seq: chunk.seq, content: chunk.content, done: chunk.done, at: chunk.at } };
}

/** Builds one progress notice notification frame: the call id, the percent, the message and the cancel hint of a long tool call. */
export function progressnoticeframe(notice: progressnotice): jsonrpcframe {
  return { jsonrpc: "2.0", method: "calls/progress", params: { callid: notice.callid, ...(notice.percent !== undefined ? { percent: notice.percent } : {}), message: notice.message, cancellable: notice.cancellable, at: notice.at } };
}

/** Builds the cancellation frames: the cancel request frame aborts the in flight call by its id while the cancelled response frame carries the preserved partial result. */
export function cancelframes(input: { id: number | string; frame: cancelframe; partial?: toolresult }): { cancel: jsonrpcframe; cancelled: jsonrpcframe } {
  const cancel = { jsonrpc: "2.0" as const, id: input.id, method: "calls/cancel", params: { callid: input.frame.callid, ...(input.frame.reason !== undefined ? { reason: input.frame.reason } : {}) } };
  const cancelled = { jsonrpc: "2.0" as const, id: input.id, result: { cancelled: true as const, callid: input.frame.callid, ...(input.frame.reason !== undefined ? { reason: input.frame.reason } : {}), ...(input.partial !== undefined ? { partial: input.partial } : {}) } };
  return { cancel, cancelled };
}

/** Builds the structured error report of a refused or failed tool call: the code, the message, the retry hint and the retry after window beside the per client rate limit usage that produced it. */
export function structurederrorreport(input: { error: structurederror; usage?: { clientid: string; used: number; budget?: number } }): { version: typeof protocolversion; code: string; message: string; retryhint: string; retryafter?: number; usage?: { clientid: string; used: number; budget?: number } } {
  return { version: protocolversion, code: input.error.code, message: input.error.message, retryhint: input.error.retryhint, ...(input.error.retryafter !== undefined ? { retryafter: input.error.retryafter } : {}), ...(input.usage !== undefined ? { usage: input.usage } : {}) };
}

/** Builds the idempotent replay frame: the response frame answers a repeated idempotency key with the stored result and the marker that names the original call time. */
export function idempotencyreplayframe(input: { id: number | string; key: idempotencykey; result: toolresult; originalat: number }): jsonrpcframe {
  return { jsonrpc: "2.0", id: input.id, result: { replayed: true, idempotencykey: input.key, originalat: input.originalat, result: input.result } };
}

/** Builds the batch call report: the ordered per item outcomes, the stop on error flag, the state and the member the batch stopped at. */
export function batchreport(input: { batch: batchcall }): { version: typeof protocolversion; batchid: string; clientid: string; state: string; stoponerror: boolean; done: number; total: number; outcomes: batchoutcome[] } {
  return { version: protocolversion, batchid: input.batch.id, clientid: input.batch.clientid, state: input.batch.state, stoponerror: input.batch.stoponerror, done: input.batch.outcomes.length, total: input.batch.calls.length, outcomes: input.batch.outcomes };
}

/** Builds the rate limit usage report: every per client limit with its window, budget, used count and the reset time of the window. */
export function ratelimitreport(input: { limits: callratelimit[]; now: number }): { version: typeof protocolversion; limits: Array<{ clientid: string; windowms: number; budget?: number; used: number; unbounded: boolean; resetat: number }> } {
  return { version: protocolversion, limits: input.limits.map(limit => ({ clientid: limit.clientid, windowms: limit.windowms, ...(limit.budget !== undefined ? { budget: limit.budget } : {}), used: limit.used, unbounded: limit.budget === undefined, resetat: limit.windowstartedat + limit.windowms })) };
}

/** Builds the audited tool call log report: every call record with its caller, tool, outcome, idempotency key and markers under the requested filters. */
export function calllogreport(input: { calls: toolcallrecord[]; filters?: { clientid?: string; tool?: string; ok?: boolean; since?: number; limit?: number } }): { version: typeof protocolversion; calls: toolcallrecord[]; filters: { clientid?: string; tool?: string; ok?: boolean; since?: number; limit?: number } } {
  return { version: protocolversion, calls: input.calls, filters: input.filters ?? {} };
}

/** Builds the in flight call report: every open call context with its client, tool, start time, chunk count and the markers of the 1.1.56 family. */
export function inflightreport(input: { contexts: callcontext[]; now: number }): { version: typeof protocolversion; inflight: Array<{ callid: string; clientid: string; tool: string; startedat: number; msopen: number; chunks: number; dryrun?: boolean; batchid?: string; idempotencykey?: idempotencykey }> } {
  return { version: protocolversion, inflight: input.contexts.filter(context => context.state === "inflight").map(context => ({ callid: context.callid, clientid: context.clientid, tool: context.tool, startedat: context.startedat, msopen: input.now - context.startedat, chunks: context.chunks, ...(context.dryrun === true ? { dryrun: true } : {}), ...(context.batchid !== undefined ? { batchid: context.batchid } : {}), ...(context.idempotencykey !== undefined ? { idempotencykey: context.idempotencykey } : {}) })) };
}

/** Builds the dry run report: the findings, the argument validity, the consent evaluation and the executed and mutation markers that stay false and empty. */
export function dryrunreport(dryrun: tooldryrun): { version: typeof protocolversion; callid: string; tool: string; argsvalid: boolean; consentok: boolean; findings: string[]; executed: boolean; mutations: string[] } {
  return { version: protocolversion, callid: dryrun.callid, tool: dryrun.tool, argsvalid: dryrun.argsvalid, consentok: dryrun.consentok, findings: dryrun.findings, executed: dryrun.executed, mutations: dryrun.mutations };
}

/** Builds the tool mock report for client testing: every mock with its tool, canned result content, test context marker and creation time. */
export function mockreport(mocks: toolmock[]): { version: typeof protocolversion; mocks: Array<{ tool: string; content: string; testcontext: boolean; createdat: number }> } {
  return { version: protocolversion, mocks: mocks.map(mock => ({ tool: mock.tool, content: mock.result.content, testcontext: mock.testcontext, createdat: mock.createdat })) };
}

/** Builds the idempotency record report with the replay semantics: every live record with its key, client, tool and expiry — never the stored result payload. */
export function idempotencyreport(records: idempotencyrecord[], now: number): { version: typeof protocolversion; records: Array<{ key: idempotencykey; clientid: string; tool: string; createdat: number; expiresat: number; live: boolean }> } {
  return { version: protocolversion, records: records.map(record => ({ key: record.key, clientid: record.clientid, tool: record.tool, createdat: record.createdat, expiresat: record.expiresat, live: now < record.expiresat })) };
}

/**
 * Llm integration envelopes of the 1.1.57 family: the model proposal that carries a model drafted plan to the human review and the model outcome that reports the usage totals and the guard verdicts of the model calls a run made.
 * Both envelopes ride the protocol version like every other report so external reviewers read one grammar.
 */

/** Builds the model proposal envelope that carries one model drafted plan to the human review: the goal, the drafted steps with their fresh review markers, the open questions, the lint findings of the grammar check, the model provenance and the review state; nothing executes until the review approves. */
export function modelproposal(input: { draft: plandraft }): { version: typeof protocolversion; modelproposal: { draftid: string; goal: string; steps: Array<{ id: string; kind: string; target?: string; value?: string; summary: string; freshreview?: boolean }>; openquestions: string[]; lintfindings: string[]; providerid: string; model: string; state: string; createdat: number } } {
  return { version: protocolversion, modelproposal: { draftid: input.draft.id, goal: input.draft.goal, steps: input.draft.steps.map(step => ({ id: step.id, kind: step.kind, ...(step.target !== undefined ? { target: step.target } : {}), ...(step.value !== undefined ? { value: step.value } : {}), summary: step.summary, ...(step.freshreview === true ? { freshreview: true } : {}) })), openquestions: input.draft.openquestions, lintfindings: input.draft.lintfindings, providerid: input.draft.providerid, model: input.draft.model, state: input.draft.state, createdat: input.draft.createdat } };
}

/** Builds the model outcome envelope that reports one run of model calls: the usage totals with the token counts, the cost and the call count plus every guard verdict with its reason, so the reviewer reads what the models produced and what the guardrails refused. */
export function modeloutcome(input: { runid?: string; outputs: modeloutput[]; totals: { prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number } }): { version: typeof protocolversion; modeloutcome: { runid?: string; usage: { prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number }; guards: Array<{ verdict: string; reason?: string; attempts: number }> } } {
  return { version: protocolversion, modeloutcome: { ...(input.runid !== undefined && input.runid.trim() !== "" ? { runid: input.runid } : {}), usage: input.totals, guards: input.outputs.map(output => ({ verdict: output.verdict, ...(output.reason !== undefined ? { reason: output.reason } : {}), attempts: output.attempts })) } };
}

/**
 * Multi agent part one envelopes of the 1.1.58 family: the swarm state report that carries every agent, the shared task queue and every mailbox beside the killswitch state, and the agent event notification frames that push the lifecycle changes.
 *
 * The task queue grammar a client reads: one `taskqueue` object carries the user configured `lanes` (lane names), the `priorities` (the user configured priority scale), the `completionpolicy` (`all` or `any`), the `items` and the live `claims`; one task item carries its `id`, its `lane`, its `priority`, its `payload` in plain language, its `state` (`queued`, `claimed`, `done` or `cancelled`) and its `enqueuedat`; one claim carries the `agentid`, the `taskid`, the `claimedat` and the `heartbeatat` that keeps it alive — a claim whose heartbeat stays silent past the user configured window releases and its task requeues.
 *
 * The mailbox grammar a client reads: one `agentmessage` carries its `id`, the `senderid`, the `recipient` (an agent id for a direct message, a role name for a role addressed message or `*` for the broadcast), the `routing` (`direct`, `broadcast` or `role`), the `payload`, the `sentat` and the optional `readat` of the receive ack; one `agentmailbox` carries its `agentid`, the `inbox`, the `outbox` and the `unread` count.
 *
 * The blackboard grammar a client reads: one `blackboard` carries the `sections` in use (`goals`, `facts`, `findings`, `scratch`), every `entry` and the optional user configured `retirementwindow`; one entry carries its `id`, its `key`, its `valuekind` (`text` or `json`), its `value`, its `author` (an agent id or `user`), its `section`, the `consentclass` inherited from the source extraction (`read`, `interaction` or `sensitive`), the `postedat` and the optional `retiredat` — every agent of the swarm reads the same board and a retired entry stays stored for the audit trail while the live reads stop showing it.
 */

/** Builds the swarm state report: every agent with its id, name, role, tab, state, depth and heartbeat, the shared task queue with its lanes, priorities, policy, items and claims, every mailbox with its unread count and the killswitch state. */
export function swarmstatereport(state: swarmstate): { version: typeof protocolversion; swarm: { agents: Array<{ id: string; name: string; role: string; state: string; depth: number; tabid?: number; parentid?: string; heartbeatat?: number }>; queue: { lanes: string[]; priorities: number[]; completionpolicy: string; items: Array<{ id: string; lane: string; priority: number; payload: string; state: string; enqueuedat: number }>; claims: Array<{ agentid: string; taskid: string; claimedat: number; heartbeatat: number }> }; mailboxes: Array<{ agentid: string; unread: number; inbox: number; outbox: number }>; killswitch: { engaged: boolean; engagedat?: number; reason?: string } } } {
  return {
    version: protocolversion,
    swarm: {
      agents: state.agents.map(agent => ({ id: agent.id, name: agent.name, role: agent.role, state: agent.state, depth: agent.depth, ...(agent.tabid !== undefined ? { tabid: agent.tabid } : {}), ...(agent.parentid !== undefined ? { parentid: agent.parentid } : {}), ...(agent.heartbeatat !== undefined ? { heartbeatat: agent.heartbeatat } : {}) })),
      queue: { lanes: state.queue.lanes, priorities: state.queue.priorities, completionpolicy: state.queue.completionpolicy, items: state.queue.items.map(item => ({ id: item.id, lane: item.lane, priority: item.priority, payload: item.payload, state: item.state, enqueuedat: item.enqueuedat })), claims: state.queue.claims },
      mailboxes: state.mailboxes.map(mailbox => ({ agentid: mailbox.agentid, unread: mailbox.unread, inbox: mailbox.inbox.length, outbox: mailbox.outbox.length })),
      killswitch: { engaged: state.killswitch.engaged, ...(state.killswitch.engagedat !== undefined ? { engagedat: state.killswitch.engagedat } : {}), ...(state.killswitch.reason !== undefined ? { reason: state.killswitch.reason } : {}) }
    }
  };
}

/** Builds one agent event notification frame that pushes a lifecycle change: the event kind, the agent and task it names and the summary in plain language; the frame rides the agents/notify method of the swarm grammar. */
export function agenteventframe(event: agentevent): jsonrpcframe {
  return { jsonrpc: "2.0", method: "agents/notify", params: { eventid: event.id, kind: event.kind, ...(event.agentid !== undefined ? { agentid: event.agentid } : {}), ...(event.taskid !== undefined ? { taskid: event.taskid } : {}), summary: event.summary, at: event.at } };
}

/**
 * Multi agent part two envelopes of the 1.1.59 family: the boardstate snapshot that carries the progressboard lanes and milestones for dashboards, the handoff frame that pushes a tab handoff state and the review frame that pushes one review request with its optional critic verdict.
 *
 * The leader worker and handoff grammar a client reads: one `leaderworker` topology carries its `id`, the `leaderid`, the `workerids`, `criticids` and `verifierids` lanes, every `assignment` (a `workerid`, a `taskid`, a plain language `slice` and the `assignedat`) and the user configured `rule` (`first` takes the first registration, `named` takes the agent the user named); one `handoffrecord` carries its `id`, the `fromagentid`, the `toagentid`, the `tabid`, the packaged `taskstate` in plain language, the `state` (`prepared`, `transferred` or `resumed`) and the `transferredat` and `resumedat` times — the transfer moves the tab binding under the one agent per tab rule and the resume continues exactly from the packaged task state while the original session grants stay preserved.
 *
 * The locks, conflicts and merge grammar a client reads: one `resourcelock` carries its `key` (the one origin and the one selector joined by `|`, so a lock never spans unrelated origins), its `holder`, the `kind` (`exclusive` or `shared`), the `origin`, the `selector`, the `acquiredat` and the optional `expiresat` a sweep honours; one `conflictscan` carries the `writers` examined, the `overlaps` (every origin and selector with its writers), the deterministic `suggestedorder` and the `clean` marker; one `mergeentry` carries the `agentid`, the `taskid`, the `key`, the `value` and the optional `conflict` resolution note, and the `mergerule` stays `first`, `last`, `preferagent` or `fail` — the overwriting rules grade sensitive, every merged value keeps its provenance and an exported report that includes page content grades as a data egress event.
 */

/** Builds the boardstate snapshot envelope for dashboards: every progressboard lane with its agent, name, role, state, lane of work, current task and milestones, so one report reads every agent at once. */
export function boardstatesnapshot(board: progressboard): { version: typeof protocolversion; board: { id: string; builtat: number; lanes: Array<{ agentid: string; name: string; role: string; state: string; lane: string; currenttask?: string; milestones: Array<{ label: string; done: boolean; at?: number }> }> } } {
  return {
    version: protocolversion,
    board: {
      id: board.id,
      builtat: board.builtat,
      lanes: board.lanes.map(lane => ({ agentid: lane.agentid, name: lane.name, role: lane.role, state: lane.state, lane: lane.lane, ...(lane.currenttask !== undefined ? { currenttask: lane.currenttask } : {}), milestones: lane.milestones.map(milestone => ({ label: milestone.label, done: milestone.done, ...(milestone.at !== undefined ? { at: milestone.at } : {}) })) }))
    }
  };
}

/** Builds one handoff frame that pushes a tab handoff state: the agents, the tab, the packaged task state, the handoff state and the transfer and resume times; the frame rides the agents/handoff method of the swarm grammar. */
export function handoffframe(record: handoffrecord): jsonrpcframe {
  return {
    jsonrpc: "2.0",
    method: "agents/handoff",
    params: {
      id: record.id,
      from: record.fromagentid,
      to: record.toagentid,
      ...(record.tabid !== undefined ? { tabid: record.tabid } : {}),
      taskstate: record.taskstate,
      state: record.state,
      ...(record.transferredat !== undefined ? { transferredat: record.transferredat } : {}),
      ...(record.resumedat !== undefined ? { resumedat: record.resumedat } : {})
    }
  };
}

/** Builds one review frame that pushes a routed review request with its optional critic verdict: the requester, the reviewer, the subject, the request state and the verdict with its issues and required changes when the critic answered; the frame rides the agents/review method of the swarm grammar. */
export function reviewframe(input: { request: reviewrequest; review?: criticreview }): jsonrpcframe {
  return {
    jsonrpc: "2.0",
    method: "agents/review",
    params: {
      id: input.request.id,
      from: input.request.fromagentid,
      to: input.request.toagentid,
      subject: input.request.subject,
      state: input.request.state,
      ...(input.request.ackedat !== undefined ? { ackedat: input.request.ackedat } : {}),
      ...(input.request.answeredat !== undefined ? { answeredat: input.request.answeredat } : {}),
      ...(input.review !== undefined ? { verdict: input.review.verdict, issues: input.review.issues, requiredchanges: input.review.requiredchanges } : {})
    }
  };
}

/**
 * Execution environment envelopes of the 1.1.60 family.
 * The environment grammar per kind: the evaluate kind runs inside the isolated world only, a step whose reviewed options carry untrusted markup renders inside the sandboxframe only, the parse heavy read kinds (html snapshots, network json payloads, table row reductions, accessibility tree shaping, complex selector evaluation and screenshot stitching) choose between the pagecontext and the offscreen worker pool, and every other kind keeps the pagecontext of the page bridge because page events only fire there.
 * Every environment executes only reviewed steps against granted origins: the session environment grant list narrows the steps of one session, the optional offscreen capability keeps the worker pool behind the user grant with an inline fallback, and the sandbox frame strips scripts and handlers before any render.
 */

/** Documents the environment grammar of every reviewed action kind as one versioned envelope: one profile per kind with its allowed environments and its default beside the consent notes every environment carries. */
export function environmentgrammar(): { version: typeof protocolversion; kinds: environmentrequirement[]; notes: string[] } {
  return {
    version: protocolversion,
    kinds: environmentrequirements(),
    notes: [
      "The evaluate kind runs inside the isolated world only where page globals stay unreachable from step code.",
      "A step whose reviewed options carry untrusted markup renders inside the sandboxframe only, with scripts and event handlers stripped before the render.",
      "The parse heavy read kinds offload into the offscreen worker pool only under the user granted offscreen capability and the parse offload toggle, with an inline fallback inside the page.",
      "Every environment executes only reviewed steps against granted origins; the session environment grant list narrows the steps of one session and no environment ever bypasses the human review.",
    ],
  };
}

/** Wraps the execution environment view in the versioned response envelope: the environment of every executed step, the worker turnaround of every offloaded step, the offscreen document registry, the worker pool count and the keepalive heartbeat trail. */
export function environmentreport(input: { environments: Record<string, environmentkind>; turnarounds?: Record<string, number>; offscreen?: offscreenregistryentry[]; workers?: number; keepalive?: { runid: string; state: string; beats: number; lastbeatat: number; portopen: boolean } }): { version: typeof protocolversion; environments: Array<{ stepid: string; environment: environmentkind }>; turnarounds: Array<{ stepid: string; milliseconds: number }>; offscreen: offscreenregistryentry[]; workers: number; keepalive?: { runid: string; state: string; beats: number; lastbeatat: number; portopen: boolean } } {
  return {
    version: protocolversion,
    environments: Object.entries(input.environments).map(([stepid, environment]) => ({ stepid, environment })),
    turnarounds: Object.entries(input.turnarounds ?? {}).map(([stepid, milliseconds]) => ({ stepid, milliseconds })),
    offscreen: input.offscreen ?? [],
    workers: input.workers ?? 0,
    ...(input.keepalive !== undefined ? { keepalive: input.keepalive } : {}),
  };
}

/**
 * Security part one envelopes of the 1.1.61 family.
 * The consent model grammar per origin: the denydefault posture refuses every ungranted origin, the per origin automation allowlist binds each grant to one exact origin with no wildcard expansion while the active tab grant counts as exactly one explicit single origin grant, the per site originprofiles grant and deny single action kinds, the consentwindows bind every grant in time with a named boundary that never defaults to unlimited, the sensitive classes route payment, credential, delete and publish steps through one fresh consent prompt per class per origin, the revokerun halts the pending step and every queued step as a terminal session event, and the immutable run log chains every entry through its loghash while the completion seal closes the chain.
 */

/** Documents the consent model grammar as one versioned envelope: the posture, the sensitive classes, the mask shape families and the consent notes every security surface carries. */
export function consentmodel(): { version: typeof protocolversion; posture: "denydefault"; sensitiveclasses: string[]; maskshapes: string[]; notes: string[] } {
  return {
    version: protocolversion,
    posture: "denydefault",
    sensitiveclasses: ["payment", "credential", "delete", "publish"],
    maskshapes: [...defaultmaskshapes],
    notes: [
      "The denydefault posture refuses every origin the user never granted; the per origin automation allowlist holds one exact origin per entry with no wildcard expansion and the active tab grant counts as exactly one explicit single origin grant.",
      "The per site originprofiles grant and deny single action kinds; a denied kind never runs on that origin and a granted kind still routes its sensitive classes through the fresh consent prompts.",
      "Every consent window scopes to one session and one origin, binds the duration the user chose and names its boundary; no grant ever defaults to unlimited, and a window past its boundary suspends the run mid step until a new explicit prompt renews it.",
      "The revokerun is a terminal session event: the pending step and every queued step halt without executing and the immutable log records the user action.",
      "The immutable run log appends only: every entry chains through its loghash to the hash of its predecessor, the completion seal writes the final hash, and the read path verifies the whole chain before serving a single entry.",
      "maskinputs keeps typed values, form values and stored values out of every record behind the documented password, token, card and secret shapes the user extends; the observation schema keeps its field shapes while the values carry the redaction marker.",
    ],
  };
}

/** Wraps the security view in the versioned response envelope: the automation allowlist, the per origin profiles, the active consent windows with their remaining time, the fresh class consents, the revocation history, the mask rules and the per run chain verification with the seal hash. */
export function securityreport(input: { allowlist: Array<{ origin: string; profileid: string; grantedat: number }>; profiles: originprofile[]; windows: consentwindow[]; consents: classconsent[]; revocations: revokerunevent[]; maskrules: maskrule[]; chain: Array<{ runid: string; valid: boolean; entries: number; brokenat?: number; reason: string; sealhash?: string; sealedat?: number }> }): { version: typeof protocolversion; posture: "denydefault"; allowlist: Array<{ origin: string; profileid: string; grantedat: number }>; profiles: originprofile[]; windows: consentwindow[]; consents: classconsent[]; revocations: revokerunevent[]; maskrules: maskrule[]; chain: Array<{ runid: string; valid: boolean; entries: number; brokenat?: number; reason: string; sealhash?: string; sealedat?: number }> } {
  return { version: protocolversion, posture: "denydefault", allowlist: input.allowlist, profiles: input.profiles, windows: input.windows, consents: input.consents, revocations: input.revocations, maskrules: input.maskrules, chain: input.chain };
}

/** Wraps one run log chain verification in the versioned response envelope: the chain validity, the entry count, the broken link when one exists, the seal hash at completion and the reason in plain language. */
export function logchainreport(input: { runid: string; valid: boolean; entries: number; brokenat?: number; reason: string; sealhash?: string; sealedat?: number }): { version: typeof protocolversion; runid: string; valid: boolean; entries: number; brokenat?: number; reason: string; sealhash?: string; sealedat?: number } {
  return { version: protocolversion, runid: input.runid, valid: input.valid, entries: input.entries, ...(input.brokenat !== undefined ? { brokenat: input.brokenat } : {}), reason: input.reason, ...(input.sealhash !== undefined ? { sealhash: input.sealhash } : {}), ...(input.sealedat !== undefined ? { sealedat: input.sealedat } : {}) };
}

/**
 * Security part two envelopes of the 1.1.62 family.
 * The transparency grammar: the transparencypage reads every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff of each installed update and the revoke action every listed grant offers, in one versioned envelope served by a single memory read.
 */

/** Wraps the transparency view of the transparencypage in the versioned response envelope: the grant rows with their revoke actions, the whole consent window history, the connectallow senders, the permdiff records of each installed update, the safedefaults applications and the posture notice. */
export function transparencyreport(input: { grants: Array<{ origin: string; scope: string; boundary: string; grantedat: number }>; windows: Array<{ id: string; origin: string; state: string; boundary: string; startedat: number; expiresat: number }>; connectallow: Array<{ senderid: string; displayname: string; origin?: string; addedat: number }>; permdiffs: Array<{ fromversion: string; toversion: string; added: string[]; removed: string[]; computedat: number }>; safedefaults: Array<{ origin: string; firstseenat: number }>; vault: Array<{ vaultid: string; label: string; scope: string; provenance: string; createdat: number; lastusedat?: number }> }): { version: typeof protocolversion; posture: "denydefault"; grants: Array<{ origin: string; scope: string; boundary: string; grantedat: number }>; windows: Array<{ id: string; origin: string; state: string; boundary: string; startedat: number; expiresat: number }>; connectallow: Array<{ senderid: string; displayname: string; origin?: string; addedat: number }>; permdiffs: Array<{ fromversion: string; toversion: string; added: string[]; removed: string[]; computedat: number }>; safedefaults: Array<{ origin: string; firstseenat: number }>; vault: Array<{ vaultid: string; label: string; scope: string; provenance: string; createdat: number; lastusedat?: number }> } {
  return { version: protocolversion, posture: "denydefault", grants: input.grants, windows: input.windows, connectallow: input.connectallow, permdiffs: input.permdiffs, safedefaults: input.safedefaults, vault: input.vault };
}

/**
 * Interface surface envelope of the 1.1.64 family.
 * The surface grammar: one versioned envelope carries the snapshot a surface renders — its ranked commandpalette matches, its stepstimeline nodes derived from progress with no new state, its live logstream events with their mask verdicts, its plancard groups with the sensitive classes expanded by default and its onboarding state — so every surface reads the same shaped answer from the single command bus.
 */

/** Wraps one interface surface snapshot in the versioned response envelope: the ranked palette matches, the stepstimeline nodes, the bounded live logstream window with its chain verdict, the plancard groups and the onboarding state. */
export function surfacesnapshot(input: { surface: "popup" | "sidepanel" | "dashboardpage" | "optionspage" | "onboarding" | "omnibox" | "page"; palette: Array<{ entry: { id: string; label: string; keywords: string[]; action: { command: string; surface: string; permission?: string; session?: boolean } }; score: number; reason: string }>; timeline: Array<{ stepid: string; kind: string; status: string; durationms?: number; environment?: string; active: boolean; anchor: string; resultsummary?: string }>; logstream: { events: Array<{ id: string; level: string; source: string; origin: string; summary: string; stepid?: string; masked: boolean; maskverdict: string; at: number }>; chainvalid: boolean; reason: string }; plancards: Array<{ risk: string; cards: Array<{ stepid: string; kind: string; risk: string; environment: string; options: string; summary: string; corrections: Array<{ id: string; source: string; reason: string }>; editable: boolean }>; expanded: boolean }>; onboarding?: { stepscompleted: string[]; done: boolean } }): { version: typeof protocolversion; surface: string; palette: Array<{ entry: { id: string; label: string; keywords: string[]; action: { command: string; surface: string; permission?: string; session?: boolean } }; score: number; reason: string }>; timeline: Array<{ stepid: string; kind: string; status: string; durationms?: number; environment?: string; active: boolean; anchor: string; resultsummary?: string }>; logstream: { events: Array<{ id: string; level: string; source: string; origin: string; summary: string; stepid?: string; masked: boolean; maskverdict: string; at: number }>; chainvalid: boolean; reason: string }; plancards: Array<{ risk: string; cards: Array<{ stepid: string; kind: string; risk: string; environment: string; options: string; summary: string; corrections: Array<{ id: string; source: string; reason: string }>; editable: boolean }>; expanded: boolean }>; onboarding?: { stepscompleted: string[]; done: boolean } } {
  return { version: protocolversion, surface: input.surface, palette: input.palette, timeline: input.timeline, logstream: input.logstream, plancards: input.plancards, ...(input.onboarding !== undefined ? { onboarding: input.onboarding } : {}) };
}

/**
 * Interface surface envelope of the 1.1.65 family, part two.
 * The finishing surface grammar: one versioned envelope carries the second interface snapshot a surface renders — its datagrid view with the inferred columns, its exportmenu descriptors, its statusbadge state with the waiting gate count, its recenttray entries with the resume and reopen offers, its steteoast live stack with the full history count and its appearance resolution naming whether the os preference, the user override or the siteprofile decided — so every surface reads the same shaped answer from the single command bus.
 */

/** Wraps one finishing interface snapshot in the versioned response envelope: the datagrid view, the exportmenu descriptors, the statusbadge state, the recenttray entries, the steteoast stack and the resolved appearance tokens. */
export function interfaceviews(input: { datagrid?: { id: string; title: string; origin: string; runid: string; columns: Array<{ field: string; label: string; type: string; inferred: boolean }>; rows: Array<{ index: number; values: Record<string, string>; selected?: boolean }>; at: number }; exportmenu: Array<{ format: string; scope: string; destination: string }>; badge: { state: string; waitingcount: number; runid?: string }; recenttray: Array<{ runid: string; origin: string; outcome: string; title: string; at: number; resumable: boolean; reopenable: boolean }>; toasts: { live: Array<{ id: string; stepid: string; kind: string; durationms: number; at: number }>; total: number }; appearance: { mode: string; tokens: Record<string, string>; source: string } }): { version: typeof protocolversion; datagrid?: { id: string; title: string; origin: string; runid: string; columns: Array<{ field: string; label: string; type: string; inferred: boolean }>; rows: Array<{ index: number; values: Record<string, string>; selected?: boolean }>; at: number }; exportmenu: Array<{ format: string; scope: string; destination: string }>; badge: { state: string; waitingcount: number; runid?: string }; recenttray: Array<{ runid: string; origin: string; outcome: string; title: string; at: number; resumable: boolean; reopenable: boolean }>; toasts: { live: Array<{ id: string; stepid: string; kind: string; durationms: number; at: number }>; total: number }; appearance: { mode: string; tokens: Record<string, string>; source: string } } {
  return { version: protocolversion, ...(input.datagrid !== undefined ? { datagrid: input.datagrid } : {}), exportmenu: input.exportmenu, badge: input.badge, recenttray: input.recenttray, toasts: input.toasts, appearance: input.appearance };
}

/**
 * Ecosystem envelope of the 1.1.66 family.
 * The ecosystem grammar: one versioned envelope carries the ecosystem snapshot a surface renders — the flowlibrary browser rows with their publishers, versions and required grants, the installed library entries beside the native workflows, the syncbridge hooks with their opt in states and conflict records, the ranked attentionfeed entries with their deep links, the background run queue with its progress, the runreplay view with its cursor and the outputcompare view with its divergence highlights — so every surface reads the same shaped answer from the single command bus.
 */

/** Wraps one ecosystem snapshot in the versioned response envelope: the library browser rows, the installed entries, the syncbridge hooks and conflicts, the ranked attention entries, the background runs, the replay view and the comparison view. */
export function ecosystemviews(input: { library: Array<{ id: string; title: string; publisher: string; version: string; grants: string[]; sensitive: boolean; state: string; registry?: string }>; installed: Array<{ id: string; title: string; version: string; forkable: boolean }>; syncbridge: { hooks: Array<{ id: string; provider: string; direction: string; optin: boolean; endpoint: string; state: string }>; conflicts: Array<{ id: string; manifestid: string; localversion: string; remoteversion: string; resolution?: string }> }; attention: Array<{ id: string; cause: string; severity: string; runid: string; summary: string; deeplink: string; at: number }>; backgroundruns: Array<{ id: string; workflowid: string; state: string; keepaliveheld: boolean; progress: string }>; replay?: { runid: string; cursor: number; playing: boolean; steps: Array<{ stepid: string; index: number; summary: string; agreement?: string }>; restored: { stepid: string; summary: string; observationversion?: number; captureid?: string } }; compare?: { runids: [string, string]; metrics: string[]; firstdivergence?: number; steps: Array<{ stepid: string; agreement: string; summarya: string; summaryb: string; durationdelta: number; highlighted: boolean }> } }): { version: typeof protocolversion; library: Array<{ id: string; title: string; publisher: string; version: string; grants: string[]; sensitive: boolean; state: string; registry?: string }>; installed: Array<{ id: string; title: string; version: string; forkable: boolean }>; syncbridge: { hooks: Array<{ id: string; provider: string; direction: string; optin: boolean; endpoint: string; state: string }>; conflicts: Array<{ id: string; manifestid: string; localversion: string; remoteversion: string; resolution?: string }> }; attention: Array<{ id: string; cause: string; severity: string; runid: string; summary: string; deeplink: string; at: number }>; backgroundruns: Array<{ id: string; workflowid: string; state: string; keepaliveheld: boolean; progress: string }>; replay?: { runid: string; cursor: number; playing: boolean; steps: Array<{ stepid: string; index: number; summary: string; agreement?: string }>; restored: { stepid: string; summary: string; observationversion?: number; captureid?: string } }; compare?: { runids: [string, string]; metrics: string[]; firstdivergence?: number; steps: Array<{ stepid: string; agreement: string; summarya: string; summaryb: string; durationdelta: number; highlighted: boolean }> } } {
  return { version: protocolversion, library: input.library, installed: input.installed, syncbridge: input.syncbridge, attention: input.attention, backgroundruns: input.backgroundruns, ...(input.replay !== undefined ? { replay: input.replay } : {}), ...(input.compare !== undefined ? { compare: input.compare } : {}) };
}

/** Builds the perf report envelope of the 1.1.68 performance family: the perf summary of one recent run beside its step duration chart, the selcache generation, the worker queue depth and the chunk cursor progress, all in one envelope the dashboardpage and the sidepanel read. */
export function perfreport(input: { runid: string; summary: { steps: number; duration: number; average: number; queries: number; cachehits: number; hitratio: number; deltashare: number }; chart: Array<{ stepid: string; duration: number; delta: boolean }>; selcache: { generation: number; entries: number }; queue: { depth: number; deferred: number; peak: number }; chunk?: { tableid: string; extracted: number; total: number; complete: boolean } }): { version: typeof protocolversion; runid: string; summary: { steps: number; duration: number; average: number; queries: number; cachehits: number; hitratio: number; deltashare: number }; chart: Array<{ stepid: string; duration: number; delta: boolean }>; selcache: { generation: number; entries: number }; queue: { depth: number; deferred: number; peak: number }; chunk?: { tableid: string; extracted: number; total: number; complete: boolean } } {
  if (input.runid.trim() === "") throw new Error("The perf report needs its run id.");
  return { version: protocolversion, runid: input.runid, summary: input.summary, chart: [...input.chart], selcache: input.selcache, queue: input.queue, ...(input.chunk !== undefined ? { chunk: input.chunk } : {}) };
}

/** Builds the schedule report envelope of the 1.1.69 performance part two family: the batch backpressure signal, the domain lanes with their concurrency slots, the budgetalerts with their thresholds, the timeoutcancel events with their retry hints, the cold start sample and the selectorprofile latencies, all in one envelope the sidepanel, the dashboardpage and the popup read. */
export function schedulereport(input: { backpressure: { runid: string; enqueued: number; completed: number; behind: number; paused: boolean; window?: number }; lanes: Array<{ domain: string; slots: number; running: number; queued: number }>; alerts: Array<{ runid: string; level: string; kind: string; ratio: number; paused: boolean }>; timeouts: Array<{ stepid: string; bound: number; elapsed: number; logged: boolean }>; startup?: { duration: number; spent: number; target?: number }; selectors?: Array<{ selector: string; average: number; count: number; failures: number; flagged: boolean }> }): { version: typeof protocolversion; backpressure: { runid: string; enqueued: number; completed: number; behind: number; paused: boolean; window?: number }; lanes: Array<{ domain: string; slots: number; running: number; queued: number }>; alerts: Array<{ runid: string; level: string; kind: string; ratio: number; paused: boolean }>; timeouts: Array<{ stepid: string; bound: number; elapsed: number; logged: boolean }>; startup?: { duration: number; spent: number; target?: number }; selectors?: Array<{ selector: string; average: number; count: number; failures: number; flagged: boolean }> } {
  if (input.backpressure.runid.trim() === "") throw new Error("The schedule report needs its run id.");
  return { version: protocolversion, backpressure: input.backpressure, lanes: input.lanes.map(lane => ({ ...lane })), alerts: input.alerts.map(alert => ({ ...alert })), timeouts: input.timeouts.map(timeout => ({ ...timeout })), ...(input.startup !== undefined ? { startup: input.startup } : {}), ...(input.selectors !== undefined ? { selectors: input.selectors.map(stats => ({ ...stats })) } : {}) };
}

/**
 * The queue and replay message grammar of the 1.1.70 resilience family: a plan proposal may carry the `resumedfrom` marker naming the checkpointed step ids of the run it resumes, every step may carry its `idempotencykey` derived from the plan and step identity, two steps of one plan never collide on the same key, the request body carries the live `runstate` and the `queuedepth` of the offlinequeue beside the observation so the agent context sees the run machine it replays into, and every response envelope carries the `runid` and the `runstate` so a replay maps to its run.
 * The offlinequeue itself lives behind the memory adapter: an approved plan enqueues with a monotonic sequence, the replay drains the tasks in sequence order once connectivity returns, and a task whose plan window passed offline expires and fails instead of replaying.
 */

/** Validates that one rollback step summary stays human readable: a compensation the user cannot read never runs, whatever its machine payload says. */
export function rollbacksummarycheck(summary: string): { ok: boolean; reason: string } {
  if (summary.trim() === "") return { ok: false, reason: "The rollback step summary is empty; a compensation the user cannot read never runs." };
  if (summary !== summary.trim()) return { ok: false, reason: "The rollback step summary carries untrimmed padding; a compensation the user cannot read never runs." };
  if (/[\u0000-\u001f\u007f]/.test(summary)) return { ok: false, reason: "The rollback step summary carries control characters; a compensation the user cannot read never runs." };
  return { ok: true, reason: "The rollback step summary stays plain human readable language." };
}


/**
 * The state depth message grammar of the 1.1.71 family: a plan proposal may carry its `lockid` so a replay preserves the sessionlock of the run it belongs to, the request body carries the isolated `tabnamespace` id and the `provenance` of the observations so the endpoint sees the tab the run owns and where every observation came from, a memory payload must carry its full provenance fields (origin, runid, stepid, capturedat) before the protocol accepts it, and every urlvisit validates against the session origin before it enters the urlhistory.
 * The audit export grammar: one auditexportrecord bundles `runs` with their urlhistory, `memory` items with their provenance, `expiryrules`, the `timeline` stream and the `locks`; the auditexportreport envelope wraps the record with the protocol version and streams without a size cap while the export itself waits behind the explicit user action.
 */

/** Builds one runtimeline report envelope for external consumers: the versioned event stream of one run with its phase buckets so a consumer renders the same timeline the sidepanel renders; the timeline event schema carries `at`, `runid`, `source` of step, audit or visit, `summary`, the optional `stepid` and the optional audit `kind`. */
export function runtimelinereport(input: { runid: string; events: runtimelineevent[]; buckets: Array<{ phase: string; events: runtimelineevent[] }> }): { version: typeof protocolversion; runid: string; events: runtimelineevent[]; buckets: Array<{ phase: string; count: number }> } {
  return { version: protocolversion, runid: input.runid, events: input.events, buckets: input.buckets.map(bucket => ({ phase: bucket.phase, count: bucket.events.length })) };
}

/** Parses one memory item payload before it stores: the key, the value, the provenance fields of origin, runid, stepid and capturedat are all required because the protocol rejects memory payloads that lack provenance fields, and the memoryclass, expiresat and encrypted flag stay optional. The 1.1.91 api freeze adds the versioned envelope check: a payload that carries the version field must carry the frozen protocol version — an absent version stays the version one tolerance of the deprecation window. */
export function memoryitemframe(value: unknown): memoryitem {
  const root = record(value);
  if (root.version !== undefined && root.version !== protocolversion) throw new Error("Unsupported protocol version.");
  const key = text(root.key, "memory item key");
  const provenance = record(root.provenance);
  const origin = text(provenance.origin, "memory item provenance origin");
  const runid = text(provenance.runid, "memory item provenance runid");
  const stepid = text(provenance.stepid, "memory item provenance stepid");
  if (typeof provenance.capturedat !== "number" || !Number.isFinite(provenance.capturedat)) throw new Error("The memory item provenance needs its capturedat timestamp; a payload without provenance never stores.");
  return {
    key,
    value: root.value,
    provenance: { origin, runid, stepid, capturedat: provenance.capturedat },
    ...(typeof root.memoryclass === "string" && root.memoryclass.trim() !== "" ? { memoryclass: root.memoryclass } : {}),
    ...(typeof root.expiresat === "number" && Number.isFinite(root.expiresat) ? { expiresat: root.expiresat } : {}),
    ...(root.encrypted === true ? { encrypted: true } : {}),
  };
}

/** Wraps one auditexportrecord in the versioned response envelope for the audit export flow; the record grammar carries the runs, the memory items, the expiry rules, the timeline stream and the locks of the workspace. */
export function auditexportreport(input: { record: auditexportrecord }): { version: typeof protocolversion; record: auditexportrecord } {
  return { version: protocolversion, record: input.record };
}

/** Validates one urlvisit record against the session origin and its grants: a visit outside the covered origins never enters the urlhistory because the urlhistory confines every visit to the approved origin of its run. */
export function urlvisitscheck(input: { visits: urlvisit[]; origin: string; grants?: string[] }): { ok: boolean; refused: string[] } {
  const covered = new Set([input.origin, ...(input.grants ?? [])]);
  const refused = input.visits.filter(visit => {
    try { return !covered.has(new URL(visit.url).origin); } catch { return true; }
  }).map(visit => visit.url);
  return { ok: refused.length === 0, refused };
}

/** Validates one bridge payload at the wire boundary of the 1.1.82 site integration family: the payload minimizes through the servercontract data minimization — plan text and statuses cross while a page content key never crosses without the explicit page consent flag — and a payload that fails the minimization refuses at this boundary with every held key named, so the wire never carries page content by default. */
export function bridgepayloadreport(input: { kind: servereventtype; payload: Record<string, unknown>; pageconsent?: boolean }): { version: number; kind: servereventtype; payload: Record<string, unknown>; held: string[] } {
  const minimized = bridgepayload(input.kind, input.payload, input.pageconsent);
  if (minimized.held.length > 0) throw new Error(`The bridge payload holds the page content key${minimized.held.length === 1 ? "" : "s"} ${minimized.held.join(", ")}; page content never crosses the bridge without the explicit consent flag.`);
  return { version: servercontractversion, kind: input.kind, payload: minimized.payload, held: [] };
}

/** Builds the gateway call report envelope of the 1.1.83 family: the request id that correlates the provider call with its audit entry and its usage record across the run, the provider and adapter kind that answered, the model, the token counts, the recorded cost and the time — the envelope carries provenance only, never key material, because the audit trail of a provider call records what left the machine and what it cost, not the credential that opened the door. */
export function gatewaycallreport(input: { requestid: string; providerid: string; kind: string; model: string; tokens: { prompttokens: number; completiontokens: number; totaltokens: number }; cost: number; at: number }): { version: typeof protocolversion; requestid: string; providerid: string; kind: string; model: string; tokens: { prompttokens: number; completiontokens: number; totaltokens: number }; cost: number; at: number } {
  if (input.requestid.trim() === "") throw new Error("The gateway call report needs its request id; every provider call correlates through it.");
  if (input.providerid.trim() === "") throw new Error("The gateway call report needs its provider id.");
  if (input.model.trim() === "") throw new Error("The gateway call report needs its model name.");
  return { version: protocolversion, requestid: input.requestid, providerid: input.providerid, kind: input.kind, model: input.model, tokens: input.tokens, cost: input.cost, at: input.at };
}


/* ── The protocolv2 frozen contract of the 1.1.91 api freeze. ── */

/**
 * The frozen message catalog, the error code table, the framing rules and the stability rules of the 1.1.91 api freeze.
 * The freeze pins the external contracts before the release candidates: every message type the protocol declares travels in one enumerable catalog entry with its schema file, its message family, its envelope class and its carrier — the builder or validator that stamps or checks the versioned envelope — while the response envelope carries the stable error code table with the retry semantics of every code, the stdio and http framing rules join the written contract, and the stability rules promise additive changes only inside protocolv2 with breaking changes demanding a new major by written rule.
 * The deprecation policy of the window lives in the apifreeze family: version one messages stay accepted with one warning per session until 2.0.0, and the sunset list renders in docs/deprecation.md.
 */

/** One frozen message type of the protocolv2 contract: the type name, its message family, the schema file that freezes its shape, the envelope class it travels in and the carrier function that builds or validates it. */
export interface frozenmessage {
  type: string;
  family: string;
  schema: string;
  envelope: "protocolversion" | "jsonrpcframe" | "serverenvelope" | "runtime";
  carrier: string;
}

/** The frozen message catalog of the api freeze: every message type the protocol declares with its schema link and its envelope carrier, so the freeze gate enumerates the contract, verifies every carrier stamps or checks the versioned envelope and hashes every schema the catalog names — an entry joins or leaves the catalog only through a release bump. */
export const frozenmessagecatalog: ReadonlyArray<frozenmessage> = [
  { type: "proposalrequest", family: "proposal", schema: "schemas/proposal.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "proposalresponse", family: "proposal", schema: "schemas/proposal.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "plan", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "planstep", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseproposal" },
  { type: "workflowproposal", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "parseworkflowproposal" },
  { type: "workflowoutcome", family: "plan", schema: "schemas/plan.schema.json", envelope: "protocolversion", carrier: "workflowoutcome" },
  { type: "sessionstart", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionpause", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionresume", family: "session", schema: "schemas/session.schema.json", envelope: "runtime", carrier: "handlerequest" },
  { type: "sessionrecord", family: "session", schema: "schemas/session.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "observation", family: "observation", schema: "schemas/observation.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "observationresponse", family: "observation", schema: "schemas/observation.schema.json", envelope: "protocolversion", carrier: "observationresponse" },
  { type: "responseenvelope", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "protocolversion", carrier: "outcomeresponse" },
  { type: "jsonrpcresponse", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "jsonrpcframe", carrier: "handleframe" },
  { type: "serverenvelope", family: "envelope", schema: "schemas/envelope.schema.json", envelope: "serverenvelope", carrier: "composeenvelope" },
  { type: "capabilityreport", family: "capability", schema: "schemas/capability.schema.json", envelope: "protocolversion", carrier: "requestbody" },
  { type: "auditevent", family: "audit", schema: "schemas/audit.schema.json", envelope: "protocolversion", carrier: "auditexportreport" },
  { type: "auditexport", family: "audit", schema: "schemas/audit.schema.json", envelope: "protocolversion", carrier: "auditexportreport" },
  { type: "memoryitem", family: "memory", schema: "schemas/memory.schema.json", envelope: "protocolversion", carrier: "memoryitemframe" },
  { type: "planprogress", family: "progress", schema: "schemas/progress.schema.json", envelope: "runtime", carrier: "recordstep" },
  { type: "stepoutcome", family: "progress", schema: "schemas/progress.schema.json", envelope: "protocolversion", carrier: "outcomeresponse" },
  { type: "tooldef", family: "tool", schema: "schemas/tool.schema.json", envelope: "jsonrpcframe", carrier: "listtools" },
  { type: "toolcall", family: "tool", schema: "schemas/tool.schema.json", envelope: "jsonrpcframe", carrier: "dispatchtool" },
];

/** The frozen response envelope outcomes: success, error and cancel — every reply the protocol writes answers in exactly one of the three outcome classes, so the envelope check covers the full reply grammar. */
export const responseenvelopeoutcomes: readonly string[] = Object.freeze(["success", "error", "cancel"]);

/** The stable error code table of the response envelope: every json rpc error code of the frozen wire with its retry semantics in plain language, so a client reads from the table alone whether a failure answers a permanent refusal, an immediate retry after fixing the request or a retry behind the reviewed backoff — the codes stay the frozen five with consentrefused reserved for the consent gate refusals. */
export const errorcodetable: ReadonlyArray<{ code: rpcerrorcode; retry: "never" | "immediate" | "afterbackoff"; semantics: string }> = [
  { code: "parse", retry: "never", semantics: "The wire frame does not parse as json; the same bytes never parse on a retry, so the client fixes its framing before the next frame." },
  { code: "method", retry: "never", semantics: "The server routes no method of the name the frame carries; the method table is frozen, so an unknown method stays unknown until a release bump adds it." },
  { code: "params", retry: "immediate", semantics: "The frame parses but its params fail the frozen schema or the negotiation range; the client may retry immediately once its params carry the reviewed fields." },
  { code: "internal", retry: "afterbackoff", semantics: "The handler failed inside the server; the client retries behind the reviewed backoff of its own configuration because the failure names no request defect." },
  { code: "consentrefused", retry: "never", semantics: "The consent gates refused the call; no retry passes without a new human decision, because the refusal records exactly the gate that held it." },
];

/** The stdio and http framing rules of the frozen contract: the stdio transport carries one newline delimited json frame per block with the frame size bound the user configures, and the http transport carries one json frame per post body on the localhost listener under the same bound — the framing rules join the written contract so a client implements the wire from the document alone. */
export const framingrules: Readonly<{ stdio: string; http: string }> = Object.freeze({
  stdio: "One newline delimited json frame per block on stdin with one reply frame per line on stdout; the frame size bound stays the user configured limit with no code default.",
  http: "One json frame per http post body on the localhost listener with the reply in the response body under the same user configured frame size bound; no other verb carries frames.",
});

/** The stability rules of protocolv2: inside the frozen major every change stays additive — new optional fields, new message types, new tools and new permissions — while a breaking change demands a new major protocol version by written rule, and the deprecation window that spans the release candidates until 2.0.0 carries every removal notice. */
export const stabilityrules: Readonly<{ additive: string; breaking: string; window: string }> = Object.freeze({
  additive: "Inside protocolv2 every change stays additive: new optional fields, new message types, new tools and new permissions join the contract without touching a frozen entry, because the freeze artifact hashes every schema and refuses a changed hash on the same release version.",
  breaking: "A breaking change — removing a field, narrowing a type, refusing a message the contract accepted or renaming a frozen entry — requires a new major protocol version with its own release note, because the written rule is the only path the freeze gate accepts.",
  window: "The deprecation window spans the release candidates until 2.0.0: version one messages stay accepted with one warning per session and every deprecated field carries its sunset release in docs/deprecation.md.",
});

/** Maps one frozen message catalog entry to the root modules that carry its envelope: the carrier function must exist as an exported function of one of the named modules, so the freeze gate and the protocol tests verify every catalog entry lands on a real carrier — an entry whose carrier maps to no module refuses the check. */
export function frozenmessagecarriers(entry: frozenmessage): readonly string[] {
  const carriermodules: Readonly<Record<string, readonly string[]>> = Object.freeze({
    requestbody: ["protocol.ts"], parseproposal: ["protocol.ts"], parseworkflowproposal: ["protocol.ts"], workflowoutcome: ["protocol.ts"],
    observationresponse: ["protocol.ts"], outcomeresponse: ["protocol.ts"], auditexportreport: ["protocol.ts"], memoryitemframe: ["protocol.ts"],
    handlerequest: ["background.ts"], recordstep: ["progress.ts"],
    handleframe: ["mcp.ts"], listtools: ["mcp.ts"], dispatchtool: ["mcp.ts"],
    composeenvelope: ["bridge.ts"],
  });
  return carriermodules[entry.carrier] ?? [];
}
