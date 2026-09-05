import { controlsummary } from "./workflow.js";
import type { classconsent, consentwindow, controlflowdecision, editormodel, environmentkind, environmentrequirement, manualrun, maskrule, offscreenregistryentry, originprofile, revokerunevent, runlogentry, runhistoryentry, siteoverride, steptemplate, timeoutabort, triggerfire, triggerule, variablescope, watchdogconfig, watchdogrecord, workflowprovenance, workflowrecord, workflowrun, workflowversion, versiondiff } from "./types.js";
import { protocolversion, type agentplan, type agentrecord, type aggregaterecord, type apimapentry, type auditexportrecord, type bannerreport, type budgetstate, type consensusrecord, type costentry, type depthlimit, type lessonrecord, type loadreport, type prefetchplan, type spawnrecord, type subagentspec, type tasklane, type allowlistentry, type approvalrequest, type authchallenge, type blockrule, type breakpointspec, type callrecord, type cdpcommand, type cdpeventrule, type cdpsession, type channelrecord, type clientidentity, type clickablemap, type consolediff, type cookieoperation, type cpuprofile, type dataset, type debuggergrant, type downloadrecord, type errorrecord, type errorreport, type eventsubscription, type exchangerecord, type extractsession, type flowmetric, type focusevent, type formreport, type growsample, type headerule, type heaprecord, type httpstreamconfig, type imagebatch, type jsonrpcframe, type keyholdstate, type longtaskentry, type mediarecord, type memoryitem, type memoryprovenance, type memorytrend, type mockspec, type mutationevent, type navstate, type netlogrecord, type observation, type pagesignals, type pausestate, type planproposal, type proposalrequest, type provenancerecord, type proxyroute, type quarantineentry, type ratelimitread, type rejectionrecord, type resolvedtarget, type rpcerror, type rpcerrorcode, type safetyverdict, type scriptoverride, type selectorcandidate, type sessiontoken, type shiftentry, type shotpair, type shotrecord, type snapshotdiff, type sourcemapconsent, type sourcemapref, type stepoutcome, type streamchannel, type tablayout, type tabreport, type timelineentry, type tlsconfig, type tokenrecord, type toolresult, type tracerecord, type trailentry, type transformrule, type typeaheadpick, type watchexpression, type wizardstate, type blackboxrule, type devicepreset, type networkpreset, type locationconsent, type locationpreset, type agentpreset, type emulationlayer, type emulationstate, type permissionoverriderecord, type sessionrecord, type sessionevent, type sessionfolder, type sessiondiff, type autointerval, type runtimelineevent, type urlvisit, type servereventtype } from "./types.js";
import type { agentevent, batchcall, batchoutcome, callcontext, callratelimit, cancelframe, criticreview, eventkind, handoffrecord, idempotencykey, idempotencyrecord, modeloutput, plandraft, progressnotice, promptdef, protocoleventsubscription, progressboard, reviewrequest, samplingrequest, streamchunk, structurederror, swarmstate, toolcallrecord, toolmock, tooldryrun } from "./types.js";
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
export declare function parseproposal(value: unknown, origin: string, grants?: string[], agents?: agentrecord[]): planproposal;
/** One workflow proposal envelope: the versioned workflow record with the expanded step list so review sees every step, and the control flow summaries of the control steps so review renders their paths, bounds, branches, join policies and retry and timeout policies. */
export interface workflowproposal {
    version: typeof protocolversion;
    workflow: workflowrecord;
    /** True when the caller proposes a dry run of the workflow free of side effects. */
    dryrun?: boolean;
    /** Control flow summaries of the control steps of the record so review renders the whole control grammar. */
    control?: Array<{
        stepid: string;
        summary: ReturnType<typeof controlsummary>;
    }>;
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
export declare function parseworkflowproposal(value: unknown, origin: string, grants?: string[], dryrun?: boolean): workflowproposal;
/** Builds the workflow outcome envelope of one run: the run id, workflow id, state and dry run flag beside the step outcome list with the control flow decisions of the control steps; a single step outcome travels through the same envelope for debugging callers. */
export declare function workflowoutcome(input: {
    run: workflowrun;
    entries: runlogentry[];
    stepid?: string;
}): {
    version: typeof protocolversion;
    runid: string;
    workflowid: string;
    state: string;
    dryrun?: boolean;
    steps: workflowstepoutcome[];
};
/** Shapes the only data that may be sent to a user-configured agent endpoint; the 1.1.70 family adds the live runstate and the offline queue depth so the agent context sees the run machine it replays into, the 1.1.71 family adds the isolated tab namespace id and the provenance of the observations so the endpoint sees the tab the run owns and where every observation came from, the 1.1.73 family adds the active priority lanes, the latest load reports per origin and the matching lessonshare records so the endpoint plans inside the lane order the user configured, feels the load of every origin and reads the lessons the fleet already learned, the 1.1.74 family adds the predicted next urls of the latest navintent pass so the endpoint plans against the pages the approved plan is about to need, the 1.1.76 family adds the correlations block of the run — the per run request map with its request ids, correlation ids and pair states — so the endpoint sees exactly which outbound requests the run already made, the 1.1.77 family adds the vision capability report of the run — the available vision kinds with the configured vision model — so the endpoint sees what the run can see, the 1.1.78 family adds the diff score of the last step so the endpoint plans against the latest visual regression signal the forensics measured, and the 1.1.79 family keeps the envelope telemetry free by construction — no telemetry key exists on this wire format at all, the session block rides with its jarid so the endpoint sees the cookie jar the run scopes to, and a payload that carries a localrule field refuses before the transport because a field marked local never leaves the device. */
export declare function requestbody(input: proposalrequest & {
    runstate?: string;
    queuedepth?: number;
    tabnamespace?: string;
    provenance?: memoryprovenance[];
    agent?: {
        agentid: string;
        name: string;
        role: string;
    };
    budget?: budgetstate;
    lanes?: tasklane[];
    load?: loadreport[];
    lessons?: lessonrecord[];
    predictedurls?: string[];
    correlations?: Array<{
        requestid: string;
        correlationid: string;
        method: string;
        url: string;
        paired: boolean;
        status?: number;
    }>;
    vision?: {
        kinds: string[];
        model?: string;
    };
    diffscore?: number;
}): string;
/** Wraps one fleet consensus record with its votes, tally and outcome in the versioned response envelope: every vote record travels with its dissenting reason so the reviewer reads who voted what. */
export declare function consensusreport(input: {
    record: consensusrecord;
}): {
    version: typeof protocolversion;
    proposal: string;
    votes: consensusrecord["votes"];
    tally: consensusrecord["tally"];
    quorum: number;
    outcome: string;
};
/** Parses one spawnsubagent request of the 1.1.73 family grammar `{ parentid, objective, role, narrowscope, depth }` against the fleet registry and the user configured depth limit: the parent must sit registered in the fleet, the objective stays the plain language task the parent hands over, an optional `narrowscope` of `origins` and `actionkinds` keeps only the parent grants it names, and the `depth` must sit at exactly the parent lineage depth plus one and never past the configured limit — a spawn whose depth exceeds the limit refuses at the protocol boundary before any registry write. */
export declare function parsespawnrequest(input: unknown, limit: depthlimit, agents: agentrecord[], spawns: spawnrecord[]): {
    spec: subagentspec;
    parent: agentrecord;
};
/** Wraps one spawnsubagent result in the versioned response envelope: the response carries the registered child beside its `parentid` and its `depth` so the caller reads exactly where the child sits in the lineage. */
export declare function spawnreply(input: {
    child: agentrecord;
    parentid: string;
    depth: number;
}): {
    version: typeof protocolversion;
    agentid: string;
    name: string;
    role: string;
    parentid: string;
    depth: number;
};
/** Wraps one merged aggregaterecord in the versioned response envelope: the report carries the per agent sections with their run provenance, the conflicts with their resolvers and the open state so the reviewer reads exactly which parallel outputs merged and which conflicts wait for the escalation. */
export declare function aggregationreport(input: {
    record: aggregaterecord;
}): {
    version: typeof protocolversion;
    subject: string;
    sections: aggregaterecord["cells"];
    conflicts: aggregaterecord["conflicts"];
    state: string;
};
/** Wraps the served lessonshare matches in the versioned response envelope: the lessonshare payload schema carries each `lessonrecord` with its `agentid`, its `finding`, its `origin` and its `reusecount` so the receiving agent reads what the fleet learned, where it learned it and how often the lesson served. */
export declare function lessonreport(input: {
    lessons: lessonrecord[];
}): {
    version: typeof protocolversion;
    lessons: Array<{
        id: string;
        agentid: string;
        finding: string;
        origin: string;
        reusecount: number;
        lastusedat?: number;
    }>;
};
/** Wraps the shared cost ledger in the versioned response envelope: every cost entry travels attributed to the `agentid` that requested it with its `units`, its `runid` and its plain language `description`, and the split report names each agent's own share beside the peers it shared its costs with. */
/** Wraps one redactionmask of the 1.1.77 family in the versioned audit payload: the capture it covered, the region count it masked and its plain language reason travel together so the audit trail records exactly what a shared capture hid while the image bytes and the region payloads never ride the envelope. */
export declare function redactionreport(input: {
    mask: {
        captureid: string;
        regions: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
        }>;
        reason: string;
        source: string;
        at: number;
    };
}): {
    version: typeof protocolversion;
    captureid: string;
    regions: number;
    reason: string;
    source: string;
    at: number;
};
/** Wraps one capturebundle of the 1.1.78 family in the versioned audit payload: the capture names, the timeline counts, the diff and thumbnail references and the provenance entry count travel together while the capture bytes never ride the envelope, and an export payload whose captures carry no provlog provenance entries refuses at this boundary because a bundle that cannot answer where its captures came from never leaves the device. */
export declare function capturebundlereport(input: {
    bundle: {
        runid: string;
        captures: string[];
        names: Array<{
            captureid: string;
            name: string;
        }>;
        consoleentries: number;
        netentries: number;
        diffs: string[];
        thumbnails: string[];
        lapses: string[];
        provenance: string[];
        masked: boolean;
        at: number;
    };
}): {
    version: typeof protocolversion;
    runid: string;
    captures: number;
    names: Array<{
        captureid: string;
        name: string;
    }>;
    consoleentries: number;
    netentries: number;
    diffs: number;
    thumbnails: number;
    lapses: number;
    provenance: number;
    masked: boolean;
    at: number;
};
/** Wraps one sync payload of the 1.1.79 family in the versioned envelope: the classes the user opted in, the format tag, the payload hash and the sync time travel together while the cipher text stays opaque and the passphrase never rides the envelope — a payload that reads plaintext or carries no format tag refuses at this boundary because plaintext never transports. */
export declare function syncpayloadreport(input: {
    classes: string[];
    payloadhash: string;
    formattag: string;
    encrypted: boolean;
    syncedat: number;
}): {
    version: typeof protocolversion;
    classes: string[];
    payloadhash: string;
    formattag: string;
    encrypted: true;
    syncedat: number;
};
/** Wraps one exportall bundle of the 1.1.79 family in the versioned envelope: the record ids of every stored family — runs, memory, captures and provenance — ride with the settings marker, the record count and the byte size, and the bundle streams through the download flow without a size cap because a bundle the user asked for streams whole. */
export declare function exportallreport(input: {
    bundle: {
        runs: string[];
        memory: string[];
        captures: string[];
        settings: boolean;
        provenance: string[];
        records: number;
        bytes: number;
        at: number;
    };
}): {
    version: typeof protocolversion;
    runs: number;
    memory: number;
    captures: number;
    settings: boolean;
    provenance: number;
    records: number;
    bytes: number;
    at: number;
};
/** Wraps one quarantine verdict of the 1.1.79 family in the versioned envelope: the path, the scan verdict, the lifecycle status and the release ref travel together while only a clean verdict ever releases — a held or flagged file never opens, and the entry carries its verdict for the audit trail. */
export declare function quarantineverdictreport(input: {
    entry: {
        id: string;
        path: string;
        reason: string;
        scan: string;
        status: string;
        release?: string;
        at: number;
        updatedat: number;
    };
}): {
    version: typeof protocolversion;
    id: string;
    path: string;
    reason: string;
    scan: string;
    status: string;
    released: boolean;
    at: number;
    updatedat: number;
};
/** Wraps one sync consent of the 1.1.79 family in the versioned audit payload: the data class and the consent stamp of every opted in class travel together so the audit trail answers exactly when the user enabled each class, because a synced class without its consent stamp answers no review. */
export declare function syncconsentreport(input: {
    consent: Array<{
        dataclass: string;
        at: number;
    }>;
}): {
    version: typeof protocolversion;
    consent: Array<{
        dataclass: string;
        at: number;
    }>;
    count: number;
};
/** Checks one outbound payload of the 1.1.79 family against the local rule fields: a payload that carries a field the user marked local refuses at this protocol boundary before any transport — the request body, the sync payload or the export — because a field marked local never leaves the device. */
export declare function outboundpayloadcheck(input: {
    payload: Record<string, unknown>;
    localfields: string[];
}): {
    ok: true;
    reason: string;
};
export declare function costledgerreport(input: {
    entries: costentry[];
    split: Array<{
        agentid: string;
        units: number;
        share: number;
        sharedwith?: string[];
    }>;
}): {
    version: typeof protocolversion;
    entries: costentry[];
    split: Array<{
        agentid: string;
        units: number;
        share: number;
        sharedwith?: string[];
    }>;
};
/** Wraps one navintent prediction pass in the versioned response envelope: the report carries the ranked predicted urls with their confidence between zero and one so the endpoint and the sidepanel read exactly which pages the approved plan is about to need; the predictions grade read only and issue no request of their own. */
export declare function predictionreport(input: {
    plan: prefetchplan;
}): {
    version: typeof protocolversion;
    predictedurls: prefetchplan["predictedurls"];
    createdat: number;
};
/** Wraps one executed step outcome in the versioned response envelope for callers, returning the execution environment beside the outcome, attaching the matched element summary, the capture block of capture steps, the media block of media steps, the transport block of outbound calls, the network block of observed exchanges and channels, the control block of applied traffic rules, the timeline block of debugging steps, the cdp block of devtools protocol steps, the profile block of profiling steps, the emulation block with the applied and reverted layer names and the session block with the record id and section counts of session memory steps; the 1.1.70 family carries the runid and the live runstate so a replay maps to its run and every caller sees the machine state, the 1.1.74 family carries the safety block with the checksafeurl verdict reasons and the ratelimitwait block with the domain and the milliseconds a delayed navigation waited so a rate limited step never drops silently, the 1.1.75 family carries the streamcursor block with the pipeline id, the row offset and the chunk index of the last written position, the dedupe report block with the removed and kept counts and the key columns, and the sampledpreview block that records the preview payload as read only, and the 1.1.76 family carries the correlation block with the request id, the correlation id and the paired response so every api result answers its request, the cachehit block with the cache key, the hit count and the served status so a served read names the entry it came from, and the 1.1.77 family carries the ocr block with the image id, the word, line and character counts of a recognition, the vision block with the image id, the description id, the labeled region count and the model that answered, and the grounding block with the description id and its ranked selectors with their scores so every grounded visual claim names the page element it answered, and the 1.1.78 family carries the beforeafter block with the pre and post capture ids of the step so every executed step names the states it wrapped, and the diff block with the baseline id, the capture id, the similarity score, the changed region count and the regression flag so a compared step names exactly what changed. */
export declare function outcomeresponse(input: {
    outcome: stepoutcome;
    plan: agentplan;
    resolvedtarget?: resolvedtarget;
    runid?: string;
    runstate?: string;
    capture?: {
        id: string;
        format: string;
        bytes: number;
    };
    media?: {
        id: string;
        kind: string;
        bytes: number;
    };
    transport?: {
        status: number;
        headers: string[];
        bytes: number;
        duration: number;
    };
    network?: {
        exchanges: number;
        channelstate: string;
        messages: number;
    };
    control?: {
        applied: number;
        blocked: number;
        mocked: number;
    };
    timeline?: {
        entries: number;
        levels: Record<string, number>;
        collapsed: number;
    };
    cdp?: {
        sessionid: string;
        state: string;
        commandids: string[];
    };
    profile?: {
        metrics: number;
        samples: number;
    };
    emulation?: {
        applied: string[];
        reverted: string[];
    };
    session?: {
        recordid: string;
        sections: number;
        matches?: number;
        restored?: number;
        skipped?: number;
        cursor?: number;
        bytes?: number;
    };
    workflow?: {
        runid: string;
        state: string;
        dryrun?: boolean;
        produced: string[];
        consumed: string[];
        timeout?: timeoutabort;
        retry?: {
            stepid: string;
            attempts: number;
            exhausted: boolean;
        };
    };
    trigger?: {
        ruleid: string;
        kind: string;
        enabled: boolean;
        nextfireat?: number;
    };
    tool?: {
        clientid: string;
        tool: string;
        origin: string;
        ok: boolean;
        code?: rpcerrorcode;
    };
    safety?: {
        url: string;
        safe: boolean;
        reasons: string[];
    };
    ratelimitwait?: {
        domain: string;
        waitedms: number;
    };
    streamcursor?: {
        pipelineid: string;
        offset: number;
        chunk: number;
        updatedat: number;
    };
    dedupe?: {
        removed: number;
        kept: number;
        keys: string[];
    };
    sampledpreview?: {
        rows: number;
        strategy: string;
        readonly: true;
    };
    correlation?: {
        requestid: string;
        correlationid: string;
        responseid?: string;
        status?: number;
        method: string;
        url: string;
    };
    cachehit?: {
        key: string;
        hits: number;
        status: number;
        url: string;
    };
    ocr?: {
        imageid: string;
        words: number;
        lines: number;
        characters: number;
    };
    vision?: {
        imageid: string;
        descriptionid: string;
        regions: number;
        model: string;
    };
    grounding?: {
        descriptionid: string;
        selectors: Array<{
            selector: string;
            score: number;
        }>;
    };
    beforeafter?: {
        stepid: string;
        preid?: string;
        postid?: string;
        stepkind: string;
    };
    diff?: {
        baselineid: string;
        captureid: string;
        score: number;
        regions: number;
        regression: boolean;
    };
}): string;
/** Wraps a clickable map payload with numbered entries in the versioned response envelope. */
export declare function mapresponse(input: {
    map: clickablemap;
    plan: agentplan;
}): string;
/** Reports the keys currently held on one tab for the live context envelope, refreshed per step. */
export declare function heldkeysreport(input: {
    tabid: number;
    holds: keyholdstate[];
}): {
    version: typeof protocolversion;
    tabid: number;
    heldkeys: keyholdstate[];
};
/** Wraps one observation capture with its a11y, reader, listpattern, tableshape and diff sections in the versioned response envelope. */
export declare function observationresponse(input: {
    observation: observation;
    plan: agentplan;
}): string;
/** Wraps mutation, focus and banner event records with their timestamps and target paths in the versioned response envelope. */
export declare function eventresponse(input: {
    events: Array<mutationevent | focusevent | bannerreport>;
    plan: agentplan;
}): string;
/** Wraps one snapshot diff with its added, removed and changed nodes and its two observation versions in the versioned response envelope. */
export declare function diffresponse(input: {
    diff: snapshotdiff;
    plan: agentplan;
}): string;
/** Reports the detected page language, template class, scroll lock and banner state in the live context envelope. */
export declare function signalsreport(input: {
    signals?: pagesignals;
}): {
    version: typeof protocolversion;
    language?: string;
    template?: string;
    scrolllocked?: boolean;
    banner?: string;
};
/** Wraps derived selector candidates with their stability scores in the versioned response envelope. */
export declare function selectorresponse(input: {
    candidates: selectorcandidate[];
    plan: agentplan;
}): string;
/** Wraps the live navigation state with its load phase, final url and redirect chain in the versioned response envelope. */
export declare function navstateresponse(input: {
    navstate: navstate;
    plan: agentplan;
}): string;
/** Carries the navigation trail of a session with its visited urls, titles and step refs in the session context envelope. */
export declare function trailreport(input: {
    sessionid?: string;
    trail: trailentry[];
}): {
    version: typeof protocolversion;
    sessionid?: string;
    trail: trailentry[];
};
/** Wraps url safety verdicts with their reasons in the versioned response envelope for external link review. */
export declare function safetyresponse(input: {
    verdicts: safetyverdict[];
    plan: agentplan;
}): string;
/** Wraps one tab report with its matched tabs, groups and badges in the versioned response envelope. */
export declare function tabreportresponse(input: {
    report: tabreport;
    plan: agentplan;
}): string;
/** Carries the saved tab layouts with their window bounds and group states in the session context envelope. */
export declare function layoutreport(input: {
    layouts: tablayout[];
}): {
    version: typeof protocolversion;
    layouts: tablayout[];
};
/** Wraps one form report with the detected fields, their kinds and the matched controls in the versioned response envelope. */
export declare function formreportresponse(input: {
    report: formreport;
    plan: agentplan;
}): string;
/** Wraps one collected error report with its field refs and messages in the versioned response envelope for correction loops. */
export declare function errorreportresponse(input: {
    report: errorreport;
    plan: agentplan;
}): string;
/** Carries the wizard states with their step history and the recorded typeahead picks in the session context envelope. */
export declare function wizardreport(input: {
    sessionid?: string;
    wizards: wizardstate[];
    picks: typeaheadpick[];
}): {
    version: typeof protocolversion;
    sessionid?: string;
    wizards: wizardstate[];
    picks: typeaheadpick[];
};
/** Wraps one dataset payload with its column specs and a sampled row list in the versioned response envelope. */
export declare function datasetresponse(input: {
    dataset: dataset;
    plan: agentplan;
    sample?: number;
}): string;
/** Carries the extraction progress with visited page counts, collected row counts and resume cursors in the session context envelope. */
export declare function extractionreport(input: {
    sessions: extractsession[];
}): {
    version: typeof protocolversion;
    sessions: extractsession[];
};
/** Reports the provenance records of every exported artifact with its source url, step ref, row range and checksum in the session context envelope. */
export declare function provenancereport(input: {
    records: provenancerecord[];
}): {
    version: typeof protocolversion;
    records: provenancerecord[];
};
/** Documents the reviewed transform rule grammar shared by transformvalues steps and the task rules store. */
export declare function transformgrammar(rules: transformrule[]): string;
/** Wraps the batch download queue with per file states, resolved paths and checksums in the versioned response envelope. */
export declare function downloadreport(input: {
    downloads: downloadrecord[];
    plan: agentplan;
}): string;
/** Carries the captured network log records with their step correlation through request ids in the session context envelope. */
export declare function netlogreport(input: {
    records: netlogrecord[];
}): {
    version: typeof protocolversion;
    records: netlogrecord[];
};
/** Carries the quarantine entries with their scan verdicts and release refs in the session context envelope. */
export declare function quarantinereport(input: {
    entries: quarantineentry[];
}): {
    version: typeof protocolversion;
    entries: quarantineentry[];
};
/** Carries every stored capture record with its metadata and the before and after shotpairs of the run in the session context envelope. */
export declare function capturereport(input: {
    records: shotrecord[];
    pairs: shotpair[];
}): {
    version: typeof protocolversion;
    records: shotrecord[];
    pairs: shotpair[];
};
/** Carries every stored media record of pdf documents, recordings, frames, canvases, stream probes and assets beside the observed image batches in the session context envelope. */
export declare function mediareport(input: {
    records: mediarecord[];
    images: imagebatch[];
}): {
    version: typeof protocolversion;
    records: mediarecord[];
    images: imagebatch[];
};
/** Carries every outbound call record of the run in the session context envelope with the response bodies held back; the metadata keeps method, origin, status class, retries and byte counts. */
export declare function callsreport(input: {
    calls: callrecord[];
}): {
    version: typeof protocolversion;
    calls: Array<Omit<callrecord, "body"> & {
        body?: undefined;
    }>;
};
/** Carries every observed exchange, channel, stream subscription and api map entry of the run in the session context envelope with correlation ids kept and captured body bytes held back. */
export declare function exchangesreport(input: {
    exchanges: exchangerecord[];
    channels: channelrecord[];
    subscriptions: eventsubscription[];
    apimap: apimapentry[];
}): {
    version: typeof protocolversion;
    exchanges: exchangerecord[];
    channels: channelrecord[];
    subscriptions: eventsubscription[];
    apimap: apimapentry[];
};
/** Carries every stored token record per provider in the session context envelope with scopes, origin scope and expiry windows; token values and their storage ids never appear because the material stays behind the storage seam. */
export declare function authreport(input: {
    tokens: tokenrecord[];
}): {
    version: typeof protocolversion;
    tokens: Array<Omit<tokenrecord, "accessstorageid" | "refreshstorageid"> & {
        accessstorageid?: undefined;
        refreshstorageid?: undefined;
    }>;
};
/** Carries the traffic control state of the run in the session context envelope: the active block, mock and rewrite rule sets with hit counts, the cookie operations with values redacted, the proxy route history with apply and revert times and the rate limit states with reset windows. */
export declare function controlreport(input: {
    blocks: blockrule[];
    mocks: mockspec[];
    rewrites: headerule[];
    cookies: cookieoperation[];
    proxies: proxyroute[];
    ratelimits: ratelimitread[];
}): {
    version: typeof protocolversion;
    blocks: blockrule[];
    mocks: Array<Omit<mockspec, "body"> & {
        body?: undefined;
    }>;
    rewrites: headerule[];
    cookies: cookieoperation[];
    proxies: proxyroute[];
    ratelimits: ratelimitread[];
};
/** Carries the run timeline in the session context envelope: every entry with its level, source, step id and message, the error and rejection records with their stack frames, the long task entries with attribution names and the entry counts per level. */
export declare function timelinereport(input: {
    entries: timelineentry[];
    errors: errorrecord[];
    rejections: rejectionrecord[];
    longtasks: longtaskentry[];
    levelcounts: Record<string, number>;
}): {
    version: typeof protocolversion;
    entries: timelineentry[];
    errors: errorrecord[];
    rejections: rejectionrecord[];
    longtasks: longtaskentry[];
    levelcounts: Record<string, number>;
};
/** Carries one console diff result in the session context envelope with every line classified as added, removed or repeated and the counts of each class. */
export declare function consolediffreport(input: {
    diff: consolediff;
}): {
    version: typeof protocolversion;
    diff: consolediff;
};
/** Carries the devtools protocol state of the run in the session context envelope: every session with its domains and durations, the command outcomes with durations and error classes, the event rules with match counts, the breakpoints with hit counts and conditions, the pause states with their call frames and dom snapshot ids, the watch expressions with their per pause values and the script overrides with review provenance while the fixture sources stay held back. */
export declare function cdpreport(input: {
    sessions: cdpsession[];
    commands: cdpcommand[];
    events: cdpeventrule[];
    breakpoints: breakpointspec[];
    pauses: pausestate[];
    watches: watchexpression[];
    overrides: scriptoverride[];
    grants: debuggergrant[];
}): {
    version: typeof protocolversion;
    sessions: cdpsession[];
    commands: cdpcommand[];
    events: cdpeventrule[];
    breakpoints: breakpointspec[];
    pauses: pausestate[];
    watches: watchexpression[];
    overrides: Array<Omit<scriptoverride, "source"> & {
        source?: undefined;
    }>;
    grants: Array<Omit<debuggergrant, "prompt"> & {
        prompt?: undefined;
    }>;
};
/** Carries the profiling state of the run in the session context envelope: every flow metric with its step span and duration, the heap records with byte and node counts, the growth samples with the computed trend of flagged steps, the cpu profiles with hot function lists, the layout shift entries with scores and impacted selectors, the trace records with their category lists, event counts and step annotations, and the source map references with their parsed state while the source map consent prompts stay held back. */
export declare function profilereport(input: {
    flows: flowmetric[];
    heaps: heaprecord[];
    samples: growsample[];
    trends: memorytrend[];
    profiles: cpuprofile[];
    shifts: shiftentry[];
    traces: tracerecord[];
    sourcemaps: sourcemapref[];
    consents: sourcemapconsent[];
}): {
    version: typeof protocolversion;
    flows: flowmetric[];
    heaps: heaprecord[];
    samples: growsample[];
    trends: memorytrend[];
    profiles: cpuprofile[];
    shifts: shiftentry[];
    traces: tracerecord[];
    sourcemaps: sourcemapref[];
    consents: Array<Omit<sourcemapconsent, "prompt"> & {
        prompt?: undefined;
    }>;
};
/** Builds the emulation report envelope of the run: the layer history with revert plans beside every layer, the user curated device, network, location and agent preset libraries, the blackbox rule sets per origin, the permission override history with restore states and the location consents with their coordinates shown while the prompt text stays out of the envelope. */
export declare function emulationreport(input: {
    state?: emulationstate;
    devices: devicepreset[];
    networks: networkpreset[];
    locations: locationpreset[];
    agents: agentpreset[];
    blackbox: Array<{
        origin: string;
        rules: blackboxrule[];
    }>;
    permissions: permissionoverriderecord[];
    consents: locationconsent[];
}): {
    version: typeof protocolversion;
    state?: emulationstate;
    layers: emulationlayer[];
    devices: devicepreset[];
    networks: networkpreset[];
    locations: locationpreset[];
    agents: agentpreset[];
    blackbox: Array<{
        origin: string;
        rules: blackboxrule[];
    }>;
    permissions: permissionoverriderecord[];
    consents: Array<Omit<locationconsent, "prompt"> & {
        prompt?: undefined;
    }>;
};
/** Builds the session memory report envelope of the run: every saved session record with its tabs, sections, folder and tags, the session event history with timestamps, the folder tree, the stored diff results and the reviewed auto snapshot interval; the crash marker of an interrupted run travels beside the records so the sessions view can offer the crash restore. */
export declare function sessionreport(input: {
    records: sessionrecord[];
    events: sessionevent[];
    folders: sessionfolder[];
    diffs: sessiondiff[];
    auto?: autointerval;
    crashed?: boolean;
}): {
    version: typeof protocolversion;
    records: sessionrecord[];
    events: sessionevent[];
    folders: sessionfolder[];
    diffs: sessiondiff[];
    auto?: autointerval;
    crashed?: boolean;
};
/** Builds the workflow report envelope of the run: the saved workflow records with their expanded step lists, the run states, the shareable step templates, the live runlog of the newest run, the variable values per scope, the provenance of expression results and regex captures and the control flow decisions of the newest run. */
export declare function workflowreport(input: {
    workflows: workflowrecord[];
    runs: workflowrun[];
    templates: steptemplate[];
    log?: runlogentry[];
    scopes?: variablescope[];
    provenance?: workflowprovenance[];
    control?: controlflowdecision[];
}): {
    version: typeof protocolversion;
    workflows: workflowrecord[];
    runs: workflowrun[];
    templates: steptemplate[];
    log: runlogentry[];
    scopes: variablescope[];
    provenance: workflowprovenance[];
    control: controlflowdecision[];
};
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
export declare function triggerlist(input: {
    rules: triggerule[];
    workflows: workflowrecord[];
    queue?: triggerfire[];
}): {
    version: typeof protocolversion;
    rules: triggerentry[];
    queued: number;
};
/** Builds the trigger fired notification envelope for listeners: the fire identity, the rule and workflow it launched, the cause, the triggering url and title and the payload carried into the run context; cooldown and dedupe suppressions never notify, they only count. */
export declare function triggerfired(input: {
    fire: triggerfire;
    workflowid: string;
    runid?: string;
}): {
    version: typeof protocolversion;
    triggerfired: {
        fireid: string;
        ruleid: string;
        workflowid: string;
        at: number;
        cause: string;
        url?: string;
        title?: string;
        runid?: string;
    };
};
/** Builds the manual run preview envelope: the manual run request with its step preview so a human always sees what a run will do before confirming it. */
export declare function manualrunpreview(input: {
    preview: manualrun;
    workflowname?: string;
}): {
    version: typeof protocolversion;
    manualrun: manualrun;
    workflowname?: string;
};
/** Builds one agent protocol toolcall frame: the json rpc request a paired client sends to invoke one namespaced tool behind the consent gates. */
export declare function toolcallframe(input: {
    id: number | string;
    name: string;
    params?: Record<string, unknown>;
}): jsonrpcframe;
/** Builds one agent protocol toolresult frame: the json rpc response that answers a tool call with the tool result or the rpc error, carrying the consent refusals with the consentrefused code. */
export declare function toolresultframe(input: {
    id: number | string | null;
    result?: toolresult;
    error?: rpcerror;
}): jsonrpcframe;
/** The file format version of an exported workflow file: a json or yaml document carrying the format marker, the export time, the composed workflow record with its version metadata, an optional change note and the packed step templates of a share bundle. Secrets never travel: the export content review refuses any step options or template payloads that name a secret, token, api key or password field before the file is written. */
export declare const workflowfileversion: 1;
/** Builds the editor state envelope for panel synchronization: the canvas model of the open workflow beside its version timeline, the stored diff results, the run history with the filter answers, the breakpoints, the per site overrides, the pending imports held for review and the watchdog status with its recent events. */
export declare function editorstate(input: {
    model?: editormodel;
    versions: workflowversion[];
    diffs?: versiondiff[];
    history: runhistoryentry[];
    breakpoints?: string[];
    overrides: siteoverride[];
    imports: Array<{
        id: string;
        workflowid: string;
        name: string;
        version: number;
        steps: number;
        risk: string;
        importedat: number;
        filename?: string;
    }>;
    backgroundruns?: Record<string, boolean>;
    watchdog: {
        config?: watchdogconfig;
        events: watchdogrecord[];
    };
}): {
    version: typeof protocolversion;
    editor: {
        versions: workflowversion[];
        diffs: versiondiff[];
        history: runhistoryentry[];
        breakpoints: string[];
        overrides: siteoverride[];
        imports: Array<{
            id: string;
            workflowid: string;
            name: string;
            version: number;
            steps: number;
            risk: string;
            importedat: number;
            filename?: string;
        }>;
        backgroundruns: Record<string, boolean>;
        watchdog: {
            config?: watchdogconfig;
            events: watchdogrecord[];
        };
    };
    model?: editormodel;
};
/** Parses one run history query envelope with its filters: the workflow id, the outcome, the time floor and the entry count the caller asks for, each optional and each a user choice with no code ceiling. */
export declare function runhistoryquery(value: unknown): {
    workflowid?: string;
    outcome?: string;
    since?: number;
    limit?: number;
};
/** Builds the run history report envelope: the filtered entries newest first with the applied filter echoed so the panel renders what it asked for. */
export declare function runhistoryreport(input: {
    entries: runhistoryentry[];
    query?: {
        workflowid?: string;
        outcome?: string;
        since?: number;
        limit?: number;
    };
}): {
    version: typeof protocolversion;
    entries: runhistoryentry[];
    query: {
        workflowid?: string;
        outcome?: string;
        since?: number;
        limit?: number;
    };
};
/** Builds the http stream transport report: the posted json rpc endpoint, the server sent event channel path, the heartbeat rhythm and the open and dead channel counts of the remote surface. */
export declare function httpstreamreport(input: {
    stream: httpstreamconfig;
    channels: streamchannel[];
    now: number;
}): {
    version: typeof protocolversion;
    endpoint: string;
    streampath: string;
    heartbeatms: number;
    idlewindowms: number;
    channelsopen: number;
    channelsdead: number;
};
/** Builds the pairing and auth handshake frames: the request frame carries the pairing code or the token answer while the response frame answers the verified exchange or the fixed refusal that leaks no pairing state. */
export declare function pairingframes(input: {
    id: number | string;
    challenge: authchallenge;
    answer?: string;
    outcome: "issued" | "verified" | "refused";
}): {
    request: jsonrpcframe;
    response: jsonrpcframe;
};
/** Builds the session token report: every stored token with its client, scopes, issue and expiry times and the remaining lifetime — never the raw token or its digest. */
export declare function tokenreport(tokens: sessiontoken[], now: number): {
    version: typeof protocolversion;
    tokens: Array<{
        id: string;
        clientid: string;
        scopes: string[];
        issuedat: number;
        expiresat: number;
        revokedat?: number;
        msremaining?: number;
    }>;
};
/** Builds the approval gate request and response frames: the request frame raises the gate with the redacted arguments while the response frame answers the decision or the expiry refusal. */
export declare function approvalframes(input: {
    id: number | string;
    request: approvalrequest;
    identity?: clientidentity;
}): {
    raise: jsonrpcframe;
    decision: jsonrpcframe;
};
/** Builds the tls report of the remote transport: the user configured mode, the certificate requirement and whether the peer was verified. */
export declare function tlsreport(tls: tlsconfig): {
    version: typeof protocolversion;
    mode: string;
    certificaterequired: boolean;
    verified: boolean;
};
/** Builds the allowlist report with the namespace scoping: every entry with its display name, granted namespaces, grant time and grant history count. */
export declare function allowlistreport(entries: allowlistentry[]): {
    version: typeof protocolversion;
    entries: Array<{
        fingerprint: string;
        displayname: string;
        namespaces: string[];
        grantedat: number;
        grants: number;
    }>;
};
/** Builds the heartbeat report of the stream channels: the last beat times, the open and dead counts and whether the client heartbeats stayed inside the idle window. */
export declare function heartbeatreport(input: {
    channels: streamchannel[];
    now: number;
    idlewindow?: number;
}): {
    version: typeof protocolversion;
    beats: number;
    open: number;
    dead: number;
};
/**
 * Agent protocol part three envelopes of the 1.1.56 family: the event subscription frames with their kinds and filters, the event notification frames, the page state delta reports of the resource watchers, the sampling callback frames with the exact prompt payload, the prompt tool report and its call frame, the stream chunk and progress notice frames, the cancellation frames with their partial results, the structured error report with its retry hints, the idempotent replay frame, the batch report with its per item outcomes, the rate limit usage report, the call log report, the in flight call report, the dry run report and the mock report.
 */
/** Builds the event subscription frames: the subscribe frame carries the event kinds with the origin and tool filters while the unsubscribe frame cancels the subscription by its id. */
export declare function subscriptionframes(input: {
    id: number | string;
    subscription: protocoleventsubscription;
}): {
    subscribe: jsonrpcframe;
    unsubscribe: jsonrpcframe;
};
/** Builds one event notification frame that pushes one protocol event to a subscriber: the subscription id, the event kind and the payload of the event. */
export declare function eventnotification(input: {
    subscriptionid: string;
    kind: eventkind;
    origin?: string;
    tool?: string;
    payload?: Record<string, unknown>;
    now: number;
}): jsonrpcframe;
/** Builds the page state delta report of one resource watcher: the watch id, the client, the watched resource, the changed keys against the baseline and the delivery time. */
export declare function resourcedeltareport(input: {
    watchid: string;
    clientid: string;
    resource: string;
    delta: Record<string, unknown>;
    now: number;
}): {
    version: typeof protocolversion;
    watchid: string;
    clientid: string;
    resource: string;
    delta: Record<string, unknown>;
    at: number;
};
/** Builds the sampling callback frames: the request frame carries the exact prompt payload with the granted page content and the system text while the answer frame carries the client completion or the refusal. */
export declare function samplingframes(input: {
    id: number | string;
    request: samplingrequest;
}): {
    request: jsonrpcframe;
    answer: jsonrpcframe;
};
/** Builds the prompt tool report: every prompt def with its name, description, declared arguments and template so a client discovers the prompts as callable tools. */
export declare function promptreport(input: {
    prompts: promptdef[];
}): {
    version: typeof protocolversion;
    prompts: Array<{
        name: string;
        description: string;
        arguments: promptdef["arguments"];
        template: string;
    }>;
};
/** Builds the prompt call frame: the prompt name with its arguments that renders the template and returns the arguments as one tool call. */
export declare function promptcallframe(input: {
    id: number | string;
    name: string;
    args: Record<string, unknown>;
}): jsonrpcframe;
/** Builds one stream chunk notification frame: the call id, the sequence number, the content slice and the done marker of the progressive result. */
export declare function streamchunkframe(chunk: streamchunk): jsonrpcframe;
/** Builds one progress notice notification frame: the call id, the percent, the message and the cancel hint of a long tool call. */
export declare function progressnoticeframe(notice: progressnotice): jsonrpcframe;
/** Builds the cancellation frames: the cancel request frame aborts the in flight call by its id while the cancelled response frame carries the preserved partial result. */
export declare function cancelframes(input: {
    id: number | string;
    frame: cancelframe;
    partial?: toolresult;
}): {
    cancel: jsonrpcframe;
    cancelled: jsonrpcframe;
};
/** Builds the structured error report of a refused or failed tool call: the code, the message, the retry hint and the retry after window beside the per client rate limit usage that produced it. */
export declare function structurederrorreport(input: {
    error: structurederror;
    usage?: {
        clientid: string;
        used: number;
        budget?: number;
    };
}): {
    version: typeof protocolversion;
    code: string;
    message: string;
    retryhint: string;
    retryafter?: number;
    usage?: {
        clientid: string;
        used: number;
        budget?: number;
    };
};
/** Builds the idempotent replay frame: the response frame answers a repeated idempotency key with the stored result and the marker that names the original call time. */
export declare function idempotencyreplayframe(input: {
    id: number | string;
    key: idempotencykey;
    result: toolresult;
    originalat: number;
}): jsonrpcframe;
/** Builds the batch call report: the ordered per item outcomes, the stop on error flag, the state and the member the batch stopped at. */
export declare function batchreport(input: {
    batch: batchcall;
}): {
    version: typeof protocolversion;
    batchid: string;
    clientid: string;
    state: string;
    stoponerror: boolean;
    done: number;
    total: number;
    outcomes: batchoutcome[];
};
/** Builds the rate limit usage report: every per client limit with its window, budget, used count and the reset time of the window. */
export declare function ratelimitreport(input: {
    limits: callratelimit[];
    now: number;
}): {
    version: typeof protocolversion;
    limits: Array<{
        clientid: string;
        windowms: number;
        budget?: number;
        used: number;
        unbounded: boolean;
        resetat: number;
    }>;
};
/** Builds the audited tool call log report: every call record with its caller, tool, outcome, idempotency key and markers under the requested filters. */
export declare function calllogreport(input: {
    calls: toolcallrecord[];
    filters?: {
        clientid?: string;
        tool?: string;
        ok?: boolean;
        since?: number;
        limit?: number;
    };
}): {
    version: typeof protocolversion;
    calls: toolcallrecord[];
    filters: {
        clientid?: string;
        tool?: string;
        ok?: boolean;
        since?: number;
        limit?: number;
    };
};
/** Builds the in flight call report: every open call context with its client, tool, start time, chunk count and the markers of the 1.1.56 family. */
export declare function inflightreport(input: {
    contexts: callcontext[];
    now: number;
}): {
    version: typeof protocolversion;
    inflight: Array<{
        callid: string;
        clientid: string;
        tool: string;
        startedat: number;
        msopen: number;
        chunks: number;
        dryrun?: boolean;
        batchid?: string;
        idempotencykey?: idempotencykey;
    }>;
};
/** Builds the dry run report: the findings, the argument validity, the consent evaluation and the executed and mutation markers that stay false and empty. */
export declare function dryrunreport(dryrun: tooldryrun): {
    version: typeof protocolversion;
    callid: string;
    tool: string;
    argsvalid: boolean;
    consentok: boolean;
    findings: string[];
    executed: boolean;
    mutations: string[];
};
/** Builds the tool mock report for client testing: every mock with its tool, canned result content, test context marker and creation time. */
export declare function mockreport(mocks: toolmock[]): {
    version: typeof protocolversion;
    mocks: Array<{
        tool: string;
        content: string;
        testcontext: boolean;
        createdat: number;
    }>;
};
/** Builds the idempotency record report with the replay semantics: every live record with its key, client, tool and expiry — never the stored result payload. */
export declare function idempotencyreport(records: idempotencyrecord[], now: number): {
    version: typeof protocolversion;
    records: Array<{
        key: idempotencykey;
        clientid: string;
        tool: string;
        createdat: number;
        expiresat: number;
        live: boolean;
    }>;
};
/**
 * Llm integration envelopes of the 1.1.57 family: the model proposal that carries a model drafted plan to the human review and the model outcome that reports the usage totals and the guard verdicts of the model calls a run made.
 * Both envelopes ride the protocol version like every other report so external reviewers read one grammar.
 */
/** Builds the model proposal envelope that carries one model drafted plan to the human review: the goal, the drafted steps with their fresh review markers, the open questions, the lint findings of the grammar check, the model provenance and the review state; nothing executes until the review approves. */
export declare function modelproposal(input: {
    draft: plandraft;
}): {
    version: typeof protocolversion;
    modelproposal: {
        draftid: string;
        goal: string;
        steps: Array<{
            id: string;
            kind: string;
            target?: string;
            value?: string;
            summary: string;
            freshreview?: boolean;
        }>;
        openquestions: string[];
        lintfindings: string[];
        providerid: string;
        model: string;
        state: string;
        createdat: number;
    };
};
/** Builds the model outcome envelope that reports one run of model calls: the usage totals with the token counts, the cost and the call count plus every guard verdict with its reason, so the reviewer reads what the models produced and what the guardrails refused. */
export declare function modeloutcome(input: {
    runid?: string;
    outputs: modeloutput[];
    totals: {
        prompttokens: number;
        completiontokens: number;
        totaltokens: number;
        cost: number;
        calls: number;
    };
}): {
    version: typeof protocolversion;
    modeloutcome: {
        runid?: string;
        usage: {
            prompttokens: number;
            completiontokens: number;
            totaltokens: number;
            cost: number;
            calls: number;
        };
        guards: Array<{
            verdict: string;
            reason?: string;
            attempts: number;
        }>;
    };
};
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
export declare function swarmstatereport(state: swarmstate): {
    version: typeof protocolversion;
    swarm: {
        agents: Array<{
            id: string;
            name: string;
            role: string;
            state: string;
            depth: number;
            tabid?: number;
            parentid?: string;
            heartbeatat?: number;
        }>;
        queue: {
            lanes: string[];
            priorities: number[];
            completionpolicy: string;
            items: Array<{
                id: string;
                lane: string;
                priority: number;
                payload: string;
                state: string;
                enqueuedat: number;
            }>;
            claims: Array<{
                agentid: string;
                taskid: string;
                claimedat: number;
                heartbeatat: number;
            }>;
        };
        mailboxes: Array<{
            agentid: string;
            unread: number;
            inbox: number;
            outbox: number;
        }>;
        killswitch: {
            engaged: boolean;
            engagedat?: number;
            reason?: string;
        };
    };
};
/** Builds one agent event notification frame that pushes a lifecycle change: the event kind, the agent and task it names and the summary in plain language; the frame rides the agents/notify method of the swarm grammar. */
export declare function agenteventframe(event: agentevent): jsonrpcframe;
/**
 * Multi agent part two envelopes of the 1.1.59 family: the boardstate snapshot that carries the progressboard lanes and milestones for dashboards, the handoff frame that pushes a tab handoff state and the review frame that pushes one review request with its optional critic verdict.
 *
 * The leader worker and handoff grammar a client reads: one `leaderworker` topology carries its `id`, the `leaderid`, the `workerids`, `criticids` and `verifierids` lanes, every `assignment` (a `workerid`, a `taskid`, a plain language `slice` and the `assignedat`) and the user configured `rule` (`first` takes the first registration, `named` takes the agent the user named); one `handoffrecord` carries its `id`, the `fromagentid`, the `toagentid`, the `tabid`, the packaged `taskstate` in plain language, the `state` (`prepared`, `transferred` or `resumed`) and the `transferredat` and `resumedat` times — the transfer moves the tab binding under the one agent per tab rule and the resume continues exactly from the packaged task state while the original session grants stay preserved.
 *
 * The locks, conflicts and merge grammar a client reads: one `resourcelock` carries its `key` (the one origin and the one selector joined by `|`, so a lock never spans unrelated origins), its `holder`, the `kind` (`exclusive` or `shared`), the `origin`, the `selector`, the `acquiredat` and the optional `expiresat` a sweep honours; one `conflictscan` carries the `writers` examined, the `overlaps` (every origin and selector with its writers), the deterministic `suggestedorder` and the `clean` marker; one `mergeentry` carries the `agentid`, the `taskid`, the `key`, the `value` and the optional `conflict` resolution note, and the `mergerule` stays `first`, `last`, `preferagent` or `fail` — the overwriting rules grade sensitive, every merged value keeps its provenance and an exported report that includes page content grades as a data egress event.
 */
/** Builds the boardstate snapshot envelope for dashboards: every progressboard lane with its agent, name, role, state, lane of work, current task and milestones, so one report reads every agent at once. */
export declare function boardstatesnapshot(board: progressboard): {
    version: typeof protocolversion;
    board: {
        id: string;
        builtat: number;
        lanes: Array<{
            agentid: string;
            name: string;
            role: string;
            state: string;
            lane: string;
            currenttask?: string;
            milestones: Array<{
                label: string;
                done: boolean;
                at?: number;
            }>;
        }>;
    };
};
/** Builds one handoff frame that pushes a tab handoff state: the agents, the tab, the packaged task state, the handoff state and the transfer and resume times; the frame rides the agents/handoff method of the swarm grammar. */
export declare function handoffframe(record: handoffrecord): jsonrpcframe;
/** Builds one review frame that pushes a routed review request with its optional critic verdict: the requester, the reviewer, the subject, the request state and the verdict with its issues and required changes when the critic answered; the frame rides the agents/review method of the swarm grammar. */
export declare function reviewframe(input: {
    request: reviewrequest;
    review?: criticreview;
}): jsonrpcframe;
/**
 * Execution environment envelopes of the 1.1.60 family.
 * The environment grammar per kind: the evaluate kind runs inside the isolated world only, a step whose reviewed options carry untrusted markup renders inside the sandboxframe only, the parse heavy read kinds (html snapshots, network json payloads, table row reductions, accessibility tree shaping, complex selector evaluation and screenshot stitching) choose between the pagecontext and the offscreen worker pool, and every other kind keeps the pagecontext of the page bridge because page events only fire there.
 * Every environment executes only reviewed steps against granted origins: the session environment grant list narrows the steps of one session, the optional offscreen capability keeps the worker pool behind the user grant with an inline fallback, and the sandbox frame strips scripts and handlers before any render.
 */
/** Documents the environment grammar of every reviewed action kind as one versioned envelope: one profile per kind with its allowed environments and its default beside the consent notes every environment carries. */
export declare function environmentgrammar(): {
    version: typeof protocolversion;
    kinds: environmentrequirement[];
    notes: string[];
};
/** Wraps the execution environment view in the versioned response envelope: the environment of every executed step, the worker turnaround of every offloaded step, the offscreen document registry, the worker pool count and the keepalive heartbeat trail. */
export declare function environmentreport(input: {
    environments: Record<string, environmentkind>;
    turnarounds?: Record<string, number>;
    offscreen?: offscreenregistryentry[];
    workers?: number;
    keepalive?: {
        runid: string;
        state: string;
        beats: number;
        lastbeatat: number;
        portopen: boolean;
    };
}): {
    version: typeof protocolversion;
    environments: Array<{
        stepid: string;
        environment: environmentkind;
    }>;
    turnarounds: Array<{
        stepid: string;
        milliseconds: number;
    }>;
    offscreen: offscreenregistryentry[];
    workers: number;
    keepalive?: {
        runid: string;
        state: string;
        beats: number;
        lastbeatat: number;
        portopen: boolean;
    };
};
/**
 * Security part one envelopes of the 1.1.61 family.
 * The consent model grammar per origin: the denydefault posture refuses every ungranted origin, the per origin automation allowlist binds each grant to one exact origin with no wildcard expansion while the active tab grant counts as exactly one explicit single origin grant, the per site originprofiles grant and deny single action kinds, the consentwindows bind every grant in time with a named boundary that never defaults to unlimited, the sensitive classes route payment, credential, delete and publish steps through one fresh consent prompt per class per origin, the revokerun halts the pending step and every queued step as a terminal session event, and the immutable run log chains every entry through its loghash while the completion seal closes the chain.
 */
/** Documents the consent model grammar as one versioned envelope: the posture, the sensitive classes, the mask shape families and the consent notes every security surface carries. */
export declare function consentmodel(): {
    version: typeof protocolversion;
    posture: "denydefault";
    sensitiveclasses: string[];
    maskshapes: string[];
    notes: string[];
};
/** Wraps the security view in the versioned response envelope: the automation allowlist, the per origin profiles, the active consent windows with their remaining time, the fresh class consents, the revocation history, the mask rules and the per run chain verification with the seal hash. */
export declare function securityreport(input: {
    allowlist: Array<{
        origin: string;
        profileid: string;
        grantedat: number;
    }>;
    profiles: originprofile[];
    windows: consentwindow[];
    consents: classconsent[];
    revocations: revokerunevent[];
    maskrules: maskrule[];
    chain: Array<{
        runid: string;
        valid: boolean;
        entries: number;
        brokenat?: number;
        reason: string;
        sealhash?: string;
        sealedat?: number;
    }>;
}): {
    version: typeof protocolversion;
    posture: "denydefault";
    allowlist: Array<{
        origin: string;
        profileid: string;
        grantedat: number;
    }>;
    profiles: originprofile[];
    windows: consentwindow[];
    consents: classconsent[];
    revocations: revokerunevent[];
    maskrules: maskrule[];
    chain: Array<{
        runid: string;
        valid: boolean;
        entries: number;
        brokenat?: number;
        reason: string;
        sealhash?: string;
        sealedat?: number;
    }>;
};
/** Wraps one run log chain verification in the versioned response envelope: the chain validity, the entry count, the broken link when one exists, the seal hash at completion and the reason in plain language. */
export declare function logchainreport(input: {
    runid: string;
    valid: boolean;
    entries: number;
    brokenat?: number;
    reason: string;
    sealhash?: string;
    sealedat?: number;
}): {
    version: typeof protocolversion;
    runid: string;
    valid: boolean;
    entries: number;
    brokenat?: number;
    reason: string;
    sealhash?: string;
    sealedat?: number;
};
/**
 * Security part two envelopes of the 1.1.62 family.
 * The transparency grammar: the transparencypage reads every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff of each installed update and the revoke action every listed grant offers, in one versioned envelope served by a single memory read.
 */
/** Wraps the transparency view of the transparencypage in the versioned response envelope: the grant rows with their revoke actions, the whole consent window history, the connectallow senders, the permdiff records of each installed update, the safedefaults applications and the posture notice. */
export declare function transparencyreport(input: {
    grants: Array<{
        origin: string;
        scope: string;
        boundary: string;
        grantedat: number;
    }>;
    windows: Array<{
        id: string;
        origin: string;
        state: string;
        boundary: string;
        startedat: number;
        expiresat: number;
    }>;
    connectallow: Array<{
        senderid: string;
        displayname: string;
        origin?: string;
        addedat: number;
    }>;
    permdiffs: Array<{
        fromversion: string;
        toversion: string;
        added: string[];
        removed: string[];
        computedat: number;
    }>;
    safedefaults: Array<{
        origin: string;
        firstseenat: number;
    }>;
    vault: Array<{
        vaultid: string;
        label: string;
        scope: string;
        provenance: string;
        createdat: number;
        lastusedat?: number;
    }>;
}): {
    version: typeof protocolversion;
    posture: "denydefault";
    grants: Array<{
        origin: string;
        scope: string;
        boundary: string;
        grantedat: number;
    }>;
    windows: Array<{
        id: string;
        origin: string;
        state: string;
        boundary: string;
        startedat: number;
        expiresat: number;
    }>;
    connectallow: Array<{
        senderid: string;
        displayname: string;
        origin?: string;
        addedat: number;
    }>;
    permdiffs: Array<{
        fromversion: string;
        toversion: string;
        added: string[];
        removed: string[];
        computedat: number;
    }>;
    safedefaults: Array<{
        origin: string;
        firstseenat: number;
    }>;
    vault: Array<{
        vaultid: string;
        label: string;
        scope: string;
        provenance: string;
        createdat: number;
        lastusedat?: number;
    }>;
};
/**
 * Interface surface envelope of the 1.1.64 family.
 * The surface grammar: one versioned envelope carries the snapshot a surface renders — its ranked commandpalette matches, its stepstimeline nodes derived from progress with no new state, its live logstream events with their mask verdicts, its plancard groups with the sensitive classes expanded by default and its onboarding state — so every surface reads the same shaped answer from the single command bus.
 */
/** Wraps one interface surface snapshot in the versioned response envelope: the ranked palette matches, the stepstimeline nodes, the bounded live logstream window with its chain verdict, the plancard groups and the onboarding state. */
export declare function surfacesnapshot(input: {
    surface: "popup" | "sidepanel" | "dashboardpage" | "optionspage" | "onboarding" | "omnibox" | "page";
    palette: Array<{
        entry: {
            id: string;
            label: string;
            keywords: string[];
            action: {
                command: string;
                surface: string;
                permission?: string;
                session?: boolean;
            };
        };
        score: number;
        reason: string;
    }>;
    timeline: Array<{
        stepid: string;
        kind: string;
        status: string;
        durationms?: number;
        environment?: string;
        active: boolean;
        anchor: string;
        resultsummary?: string;
    }>;
    logstream: {
        events: Array<{
            id: string;
            level: string;
            source: string;
            origin: string;
            summary: string;
            stepid?: string;
            masked: boolean;
            maskverdict: string;
            at: number;
        }>;
        chainvalid: boolean;
        reason: string;
    };
    plancards: Array<{
        risk: string;
        cards: Array<{
            stepid: string;
            kind: string;
            risk: string;
            environment: string;
            options: string;
            summary: string;
            corrections: Array<{
                id: string;
                source: string;
                reason: string;
            }>;
            editable: boolean;
        }>;
        expanded: boolean;
    }>;
    onboarding?: {
        stepscompleted: string[];
        done: boolean;
    };
}): {
    version: typeof protocolversion;
    surface: string;
    palette: Array<{
        entry: {
            id: string;
            label: string;
            keywords: string[];
            action: {
                command: string;
                surface: string;
                permission?: string;
                session?: boolean;
            };
        };
        score: number;
        reason: string;
    }>;
    timeline: Array<{
        stepid: string;
        kind: string;
        status: string;
        durationms?: number;
        environment?: string;
        active: boolean;
        anchor: string;
        resultsummary?: string;
    }>;
    logstream: {
        events: Array<{
            id: string;
            level: string;
            source: string;
            origin: string;
            summary: string;
            stepid?: string;
            masked: boolean;
            maskverdict: string;
            at: number;
        }>;
        chainvalid: boolean;
        reason: string;
    };
    plancards: Array<{
        risk: string;
        cards: Array<{
            stepid: string;
            kind: string;
            risk: string;
            environment: string;
            options: string;
            summary: string;
            corrections: Array<{
                id: string;
                source: string;
                reason: string;
            }>;
            editable: boolean;
        }>;
        expanded: boolean;
    }>;
    onboarding?: {
        stepscompleted: string[];
        done: boolean;
    };
};
/**
 * Interface surface envelope of the 1.1.65 family, part two.
 * The finishing surface grammar: one versioned envelope carries the second interface snapshot a surface renders — its datagrid view with the inferred columns, its exportmenu descriptors, its statusbadge state with the waiting gate count, its recenttray entries with the resume and reopen offers, its steteoast live stack with the full history count and its appearance resolution naming whether the os preference, the user override or the siteprofile decided — so every surface reads the same shaped answer from the single command bus.
 */
/** Wraps one finishing interface snapshot in the versioned response envelope: the datagrid view, the exportmenu descriptors, the statusbadge state, the recenttray entries, the steteoast stack and the resolved appearance tokens. */
export declare function interfaceviews(input: {
    datagrid?: {
        id: string;
        title: string;
        origin: string;
        runid: string;
        columns: Array<{
            field: string;
            label: string;
            type: string;
            inferred: boolean;
        }>;
        rows: Array<{
            index: number;
            values: Record<string, string>;
            selected?: boolean;
        }>;
        at: number;
    };
    exportmenu: Array<{
        format: string;
        scope: string;
        destination: string;
    }>;
    badge: {
        state: string;
        waitingcount: number;
        runid?: string;
    };
    recenttray: Array<{
        runid: string;
        origin: string;
        outcome: string;
        title: string;
        at: number;
        resumable: boolean;
        reopenable: boolean;
    }>;
    toasts: {
        live: Array<{
            id: string;
            stepid: string;
            kind: string;
            durationms: number;
            at: number;
        }>;
        total: number;
    };
    appearance: {
        mode: string;
        tokens: Record<string, string>;
        source: string;
    };
}): {
    version: typeof protocolversion;
    datagrid?: {
        id: string;
        title: string;
        origin: string;
        runid: string;
        columns: Array<{
            field: string;
            label: string;
            type: string;
            inferred: boolean;
        }>;
        rows: Array<{
            index: number;
            values: Record<string, string>;
            selected?: boolean;
        }>;
        at: number;
    };
    exportmenu: Array<{
        format: string;
        scope: string;
        destination: string;
    }>;
    badge: {
        state: string;
        waitingcount: number;
        runid?: string;
    };
    recenttray: Array<{
        runid: string;
        origin: string;
        outcome: string;
        title: string;
        at: number;
        resumable: boolean;
        reopenable: boolean;
    }>;
    toasts: {
        live: Array<{
            id: string;
            stepid: string;
            kind: string;
            durationms: number;
            at: number;
        }>;
        total: number;
    };
    appearance: {
        mode: string;
        tokens: Record<string, string>;
        source: string;
    };
};
/**
 * Ecosystem envelope of the 1.1.66 family.
 * The ecosystem grammar: one versioned envelope carries the ecosystem snapshot a surface renders — the flowlibrary browser rows with their publishers, versions and required grants, the installed library entries beside the native workflows, the syncbridge hooks with their opt in states and conflict records, the ranked attentionfeed entries with their deep links, the background run queue with its progress, the runreplay view with its cursor and the outputcompare view with its divergence highlights — so every surface reads the same shaped answer from the single command bus.
 */
/** Wraps one ecosystem snapshot in the versioned response envelope: the library browser rows, the installed entries, the syncbridge hooks and conflicts, the ranked attention entries, the background runs, the replay view and the comparison view. */
export declare function ecosystemviews(input: {
    library: Array<{
        id: string;
        title: string;
        publisher: string;
        version: string;
        grants: string[];
        sensitive: boolean;
        state: string;
        registry?: string;
    }>;
    installed: Array<{
        id: string;
        title: string;
        version: string;
        forkable: boolean;
    }>;
    syncbridge: {
        hooks: Array<{
            id: string;
            provider: string;
            direction: string;
            optin: boolean;
            endpoint: string;
            state: string;
        }>;
        conflicts: Array<{
            id: string;
            manifestid: string;
            localversion: string;
            remoteversion: string;
            resolution?: string;
        }>;
    };
    attention: Array<{
        id: string;
        cause: string;
        severity: string;
        runid: string;
        summary: string;
        deeplink: string;
        at: number;
    }>;
    backgroundruns: Array<{
        id: string;
        workflowid: string;
        state: string;
        keepaliveheld: boolean;
        progress: string;
    }>;
    replay?: {
        runid: string;
        cursor: number;
        playing: boolean;
        steps: Array<{
            stepid: string;
            index: number;
            summary: string;
            agreement?: string;
        }>;
        restored: {
            stepid: string;
            summary: string;
            observationversion?: number;
            captureid?: string;
        };
    };
    compare?: {
        runids: [string, string];
        metrics: string[];
        firstdivergence?: number;
        steps: Array<{
            stepid: string;
            agreement: string;
            summarya: string;
            summaryb: string;
            durationdelta: number;
            highlighted: boolean;
        }>;
    };
}): {
    version: typeof protocolversion;
    library: Array<{
        id: string;
        title: string;
        publisher: string;
        version: string;
        grants: string[];
        sensitive: boolean;
        state: string;
        registry?: string;
    }>;
    installed: Array<{
        id: string;
        title: string;
        version: string;
        forkable: boolean;
    }>;
    syncbridge: {
        hooks: Array<{
            id: string;
            provider: string;
            direction: string;
            optin: boolean;
            endpoint: string;
            state: string;
        }>;
        conflicts: Array<{
            id: string;
            manifestid: string;
            localversion: string;
            remoteversion: string;
            resolution?: string;
        }>;
    };
    attention: Array<{
        id: string;
        cause: string;
        severity: string;
        runid: string;
        summary: string;
        deeplink: string;
        at: number;
    }>;
    backgroundruns: Array<{
        id: string;
        workflowid: string;
        state: string;
        keepaliveheld: boolean;
        progress: string;
    }>;
    replay?: {
        runid: string;
        cursor: number;
        playing: boolean;
        steps: Array<{
            stepid: string;
            index: number;
            summary: string;
            agreement?: string;
        }>;
        restored: {
            stepid: string;
            summary: string;
            observationversion?: number;
            captureid?: string;
        };
    };
    compare?: {
        runids: [string, string];
        metrics: string[];
        firstdivergence?: number;
        steps: Array<{
            stepid: string;
            agreement: string;
            summarya: string;
            summaryb: string;
            durationdelta: number;
            highlighted: boolean;
        }>;
    };
};
/** Builds the perf report envelope of the 1.1.68 performance family: the perf summary of one recent run beside its step duration chart, the selcache generation, the worker queue depth and the chunk cursor progress, all in one envelope the dashboardpage and the sidepanel read. */
export declare function perfreport(input: {
    runid: string;
    summary: {
        steps: number;
        duration: number;
        average: number;
        queries: number;
        cachehits: number;
        hitratio: number;
        deltashare: number;
    };
    chart: Array<{
        stepid: string;
        duration: number;
        delta: boolean;
    }>;
    selcache: {
        generation: number;
        entries: number;
    };
    queue: {
        depth: number;
        deferred: number;
        peak: number;
    };
    chunk?: {
        tableid: string;
        extracted: number;
        total: number;
        complete: boolean;
    };
}): {
    version: typeof protocolversion;
    runid: string;
    summary: {
        steps: number;
        duration: number;
        average: number;
        queries: number;
        cachehits: number;
        hitratio: number;
        deltashare: number;
    };
    chart: Array<{
        stepid: string;
        duration: number;
        delta: boolean;
    }>;
    selcache: {
        generation: number;
        entries: number;
    };
    queue: {
        depth: number;
        deferred: number;
        peak: number;
    };
    chunk?: {
        tableid: string;
        extracted: number;
        total: number;
        complete: boolean;
    };
};
/** Builds the schedule report envelope of the 1.1.69 performance part two family: the batch backpressure signal, the domain lanes with their concurrency slots, the budgetalerts with their thresholds, the timeoutcancel events with their retry hints, the cold start sample and the selectorprofile latencies, all in one envelope the sidepanel, the dashboardpage and the popup read. */
export declare function schedulereport(input: {
    backpressure: {
        runid: string;
        enqueued: number;
        completed: number;
        behind: number;
        paused: boolean;
        window?: number;
    };
    lanes: Array<{
        domain: string;
        slots: number;
        running: number;
        queued: number;
    }>;
    alerts: Array<{
        runid: string;
        level: string;
        kind: string;
        ratio: number;
        paused: boolean;
    }>;
    timeouts: Array<{
        stepid: string;
        bound: number;
        elapsed: number;
        logged: boolean;
    }>;
    startup?: {
        duration: number;
        spent: number;
        target?: number;
    };
    selectors?: Array<{
        selector: string;
        average: number;
        count: number;
        failures: number;
        flagged: boolean;
    }>;
}): {
    version: typeof protocolversion;
    backpressure: {
        runid: string;
        enqueued: number;
        completed: number;
        behind: number;
        paused: boolean;
        window?: number;
    };
    lanes: Array<{
        domain: string;
        slots: number;
        running: number;
        queued: number;
    }>;
    alerts: Array<{
        runid: string;
        level: string;
        kind: string;
        ratio: number;
        paused: boolean;
    }>;
    timeouts: Array<{
        stepid: string;
        bound: number;
        elapsed: number;
        logged: boolean;
    }>;
    startup?: {
        duration: number;
        spent: number;
        target?: number;
    };
    selectors?: Array<{
        selector: string;
        average: number;
        count: number;
        failures: number;
        flagged: boolean;
    }>;
};
/**
 * The queue and replay message grammar of the 1.1.70 resilience family: a plan proposal may carry the `resumedfrom` marker naming the checkpointed step ids of the run it resumes, every step may carry its `idempotencykey` derived from the plan and step identity, two steps of one plan never collide on the same key, the request body carries the live `runstate` and the `queuedepth` of the offlinequeue beside the observation so the agent context sees the run machine it replays into, and every response envelope carries the `runid` and the `runstate` so a replay maps to its run.
 * The offlinequeue itself lives behind the memory adapter: an approved plan enqueues with a monotonic sequence, the replay drains the tasks in sequence order once connectivity returns, and a task whose plan window passed offline expires and fails instead of replaying.
 */
/** Validates that one rollback step summary stays human readable: a compensation the user cannot read never runs, whatever its machine payload says. */
export declare function rollbacksummarycheck(summary: string): {
    ok: boolean;
    reason: string;
};
/**
 * The state depth message grammar of the 1.1.71 family: a plan proposal may carry its `lockid` so a replay preserves the sessionlock of the run it belongs to, the request body carries the isolated `tabnamespace` id and the `provenance` of the observations so the endpoint sees the tab the run owns and where every observation came from, a memory payload must carry its full provenance fields (origin, runid, stepid, capturedat) before the protocol accepts it, and every urlvisit validates against the session origin before it enters the urlhistory.
 * The audit export grammar: one auditexportrecord bundles `runs` with their urlhistory, `memory` items with their provenance, `expiryrules`, the `timeline` stream and the `locks`; the auditexportreport envelope wraps the record with the protocol version and streams without a size cap while the export itself waits behind the explicit user action.
 */
/** Builds one runtimeline report envelope for external consumers: the versioned event stream of one run with its phase buckets so a consumer renders the same timeline the sidepanel renders; the timeline event schema carries `at`, `runid`, `source` of step, audit or visit, `summary`, the optional `stepid` and the optional audit `kind`. */
export declare function runtimelinereport(input: {
    runid: string;
    events: runtimelineevent[];
    buckets: Array<{
        phase: string;
        events: runtimelineevent[];
    }>;
}): {
    version: typeof protocolversion;
    runid: string;
    events: runtimelineevent[];
    buckets: Array<{
        phase: string;
        count: number;
    }>;
};
/** Parses one memory item payload before it stores: the key, the value, the provenance fields of origin, runid, stepid and capturedat are all required because the protocol rejects memory payloads that lack provenance fields, and the memoryclass, expiresat and encrypted flag stay optional. The 1.1.91 api freeze adds the versioned envelope check: a payload that carries the version field must carry the frozen protocol version — an absent version stays the version one tolerance of the deprecation window. */
export declare function memoryitemframe(value: unknown): memoryitem;
/** Wraps one auditexportrecord in the versioned response envelope for the audit export flow; the record grammar carries the runs, the memory items, the expiry rules, the timeline stream and the locks of the workspace. */
export declare function auditexportreport(input: {
    record: auditexportrecord;
}): {
    version: typeof protocolversion;
    record: auditexportrecord;
};
/** Validates one urlvisit record against the session origin and its grants: a visit outside the covered origins never enters the urlhistory because the urlhistory confines every visit to the approved origin of its run. */
export declare function urlvisitscheck(input: {
    visits: urlvisit[];
    origin: string;
    grants?: string[];
}): {
    ok: boolean;
    refused: string[];
};
/** Validates one bridge payload at the wire boundary of the 1.1.82 site integration family: the payload minimizes through the servercontract data minimization — plan text and statuses cross while a page content key never crosses without the explicit page consent flag — and a payload that fails the minimization refuses at this boundary with every held key named, so the wire never carries page content by default. */
export declare function bridgepayloadreport(input: {
    kind: servereventtype;
    payload: Record<string, unknown>;
    pageconsent?: boolean;
}): {
    version: number;
    kind: servereventtype;
    payload: Record<string, unknown>;
    held: string[];
};
/** Builds the gateway call report envelope of the 1.1.83 family: the request id that correlates the provider call with its audit entry and its usage record across the run, the provider and adapter kind that answered, the model, the token counts, the recorded cost and the time — the envelope carries provenance only, never key material, because the audit trail of a provider call records what left the machine and what it cost, not the credential that opened the door. */
export declare function gatewaycallreport(input: {
    requestid: string;
    providerid: string;
    kind: string;
    model: string;
    tokens: {
        prompttokens: number;
        completiontokens: number;
        totaltokens: number;
    };
    cost: number;
    at: number;
}): {
    version: typeof protocolversion;
    requestid: string;
    providerid: string;
    kind: string;
    model: string;
    tokens: {
        prompttokens: number;
        completiontokens: number;
        totaltokens: number;
    };
    cost: number;
    at: number;
};
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
export declare const frozenmessagecatalog: ReadonlyArray<frozenmessage>;
/** The frozen response envelope outcomes: success, error and cancel — every reply the protocol writes answers in exactly one of the three outcome classes, so the envelope check covers the full reply grammar. */
export declare const responseenvelopeoutcomes: readonly string[];
/** The stable error code table of the response envelope: every json rpc error code of the frozen wire with its retry semantics in plain language, so a client reads from the table alone whether a failure answers a permanent refusal, an immediate retry after fixing the request or a retry behind the reviewed backoff — the codes stay the frozen five with consentrefused reserved for the consent gate refusals. */
export declare const errorcodetable: ReadonlyArray<{
    code: rpcerrorcode;
    retry: "never" | "immediate" | "afterbackoff";
    semantics: string;
}>;
/** The stdio and http framing rules of the frozen contract: the stdio transport carries one newline delimited json frame per block with the frame size bound the user configures, and the http transport carries one json frame per post body on the localhost listener under the same bound — the framing rules join the written contract so a client implements the wire from the document alone. */
export declare const framingrules: Readonly<{
    stdio: string;
    http: string;
}>;
/** The stability rules of protocolv2: inside the frozen major every change stays additive — new optional fields, new message types, new tools and new permissions — while a breaking change demands a new major protocol version by written rule, and the deprecation window that spans the release candidates until 2.0.0 carries every removal notice. */
export declare const stabilityrules: Readonly<{
    additive: string;
    breaking: string;
    window: string;
}>;
/** Maps one frozen message catalog entry to the root modules that carry its envelope: the carrier function must exist as an exported function of one of the named modules, so the freeze gate and the protocol tests verify every catalog entry lands on a real carrier — an entry whose carrier maps to no module refuses the check. */
export declare function frozenmessagecarriers(entry: frozenmessage): readonly string[];
//# sourceMappingURL=protocol.d.ts.map