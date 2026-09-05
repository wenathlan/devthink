import type { a11ycapture, agentevent, agentidentity, agentmailbox, agentusage, aggregaterecord, arbitrationcase, blackboard, commandparse, costbudget, costentry, agentplan, agentsession, agentpreset, allowlistentry, apikeyentry, apicallrecord, apimapentry, artifactinventoryentry, artifactrecord, approvalexec, approvalrequest, auditevent, authhandshakeevent, authrecord, autosnapshotstate, bannerreport, beforeafterpair, blackboxrule, blockrule, bodyrecord, capturenamerule, bridgelaunch, breakpointspec, branchoutcome, batchcall, cacheentry, callcontext, callratelimit, callrecord, capabilityreport, capabilityset, captchahandoff, capturecounter, cdpcommand, cdpeventrule, cdpsession, channelrecord, clientidentity, clientrecord, clipboardconsentrecord, cleanuprule, cleanuprun, clipentry, clickablemap, closedtab, closedtabrecord, consolediff, consoleconsentrecord, consoletraceentry, controlflowdecision, cookieoperation, controltabstate, correlationcontext, cpuprofile, curatedlist, dataset, debuggergrant, derivedselector, detectionrecord, devicepreset, diagnosticreport, diffbaserecord, diffresult, dialogdecision, dialogpolicy, downloadrecord, depthlimit, deeplinkpattern, emulationlayer, emulationstate, endpointconfig, endpointrecord, errorrecord, errorreport, eventsubscription, exchangerecord, exportedartifact, extractbatch, extractpipeline, extractsession, dedupereport, streamfilerecord, transformrule, fetchconsent, flowmetric, focusevent, formprofile, framereference, growsample, groundingresult, ocrresult, redactionmask, screenshotpair, headerule, heaprecord, idempotencyrecord, imagebatch, interleaveevent, keyholdstate, killswitch, lessonrecord, levelsummary, loadreport, localmodelconfig, modeloutput, modelroute, plandraft, prompttemplate, providerconfig, reflectnote, replanrecord, locationconsent, locationpreset, loglevel, longtaskentry, mcpserverconfig, mcpserverstate, manualrun, mediarecord, memorytrend, messageenvelope, mockspec, mimefilter, mutationevent, navcontrol, navintentrecord, navpause, navqueues, navrecord, navtrailentry, netlogrecord, nettraceentry, networkpreset, observationrecord, pagesignals, pairingcode, pausestate, permissionoverriderecord, planprogress, prefetchplan, progressnotice, protocoleventsubscription, provenancerecord, provlogentry, proxyroute, quarantineentry, ratelimitdirective, ratelimitread, ratelimitstate, ratelimitwindow, readercapture, recenttab, recordingconsentrecord, recordingrecord, rejectionrecord, resolutionsummary, resourcewatch, retryoutcome, rotationtargetrecord, runsettings, safetyverdict, samplepolicy, samplingrequest, scanhookconfig, scriptoverride, sessiondiff, sessionevent, sessionfolder, sessionmatch, sessionrecord, sessionsnapshot, searchquery, sessiontoken, sheetendpoint, shiftentry, shotpair, shotrecord, snapshotdiff, sourcemapconsent, sourcemapref, sourcestamprecord, spawnrecord, stepoutcome, streamchannel, streamchunk, streamcursor, streamstate, submitticket, tabbadge, tabgrouprecord, tablayout, tabmeta, tabwatchevent, tasklane, taskqueue, taskrules, taskstate, templateprofile, thumbnailrecord, timelineentry, timelapseconfig, timelapseframe, tokenrecord, toolcallrecord, toolmock, tracerecord, usagerecord, trailentry, triggerfire, triggerule, typeaheadpick, visioncacheentry, visiondescription, waitprofilerecord, watchexpression, watchregistration, wizardstate, workflowprovenance, workflowrecord, workflowrun, runlogentry, steptemplate, variablescope, editorlayout, runhistoryentry, siteoverride, watchdogrecord, workflowimport, workflowversion, versiondiff, leaderworker, criticreview, verifiercheck, reviewrequest, reviewrecord, handoffrecord, resourcelock, conflictscan, resultreport, progressboard, escalationrecord, consensusround, consensusrecord, swarmaction, agentscope, swarmcost, plannerexecutor, environmentkind, offscreenregistryentry, runlock, runstaterecord, sandboxrender, workerevent, automationallowlistentry, classconsent, confirmgate, connectallowentry, consentwindow, deferredevent, gateresolution, immutablelogentry, maskrule, originprofile, permdiffrecord, phishverdict, ratelimitbucket, redactregion, revokerunevent, safedefaultapplication, secretvaultentry, storedrunlog, sitenote, scratchpadentry, runsummary, recallindexentry, recallquery, recallmatch, correctionentry, consentmemoryentry, historyindexentry, historysearchquery, historysearchhit, errorsurface, tabsessionref, onboardingstate, paletteuserecord, stepapproveresolution, surfacelayout, taskinputsubmission, logstreamfilter, siteprofile, shortcutbinding, recenttrayentry, notificationpayload, attentionentry, backgroundqueueentry, flowlibraryentry, libraryevent, outputcomparesession, syncbridgeconflict, syncbridgehook, lazyloadrecord, selcachestate, perfrecord, queuedepthsample, chunkextractcursor, incrsnapshotdelta, domainlane, runbudgetrecord, budgetalert, timeoutcancelevent, tabsuspendstate, runcacheentry, resumepoint, selectorstats, steptracespan, startupsample, slowmosession, sessionreusegrant, artifactcompressrecord, agentrecord, budgetstate, comparisonrecord, replayrecord, runrecord, checkpointrecord, heartbeatrecord, rollbackitem, queuedtask, urlvisit, runtimelineevent, lockrecord, tabstate, memoryitem, expiryrule, quotareport, auditexportrecord, memoryprovenance, cleanupschedule, cookiejarrecord, datainventory, exportallbundle, localrule, purgepolicy, syncsettings, syncrecord, telemetrypolicy, bridgesessionrecord, bridgepairingrecord, relaytokenrecord, bridgeeventrecord, bridgequeuerecord, bridgekillswitch, baseurlconfig, modelcacherecord, gatewaychatstate, clientbinding, nativehoststate, nativecallrecord, nativekillswitch, wsbridgesession, toolstep, selcacheentry, selcacheinvalidation } from "./types.js";
/** Provides a small storage seam that works in browser, tests and future adapters. */
export interface memoryadapter {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
}
/**
 * Local memory for sessions, plans, audit evidence and interaction state.
 * Correlated rules for every stored record live in this one seam; each accessor is a one line storage delegation so future backends replace the adapter only.
 */
export declare class sessionmemory {
    private readonly adapter;
    constructor(adapter: memoryadapter);
    getconfig(): Promise<endpointconfig | undefined>;
    setconfig(value: endpointconfig): Promise<void>;
    getsession(): Promise<agentsession | undefined>;
    setsession(value: agentsession): Promise<void>;
    getplan(): Promise<agentplan | undefined>;
    setplan(value: agentplan): Promise<void>;
    getdiagnostic(): Promise<diagnosticreport | undefined>;
    setdiagnostic(value: diagnosticreport): Promise<void>;
    getprogress(): Promise<planprogress | undefined>;
    setprogress(value: planprogress): Promise<void>;
    getcapabilities(): Promise<capabilityreport | undefined>;
    setcapabilities(value: capabilityreport): Promise<void>;
    getsettings(): Promise<runsettings | undefined>;
    setsettings(value: runsettings): Promise<void>;
    getaudit(): Promise<auditevent[]>;
    getoutcomes(): Promise<stepoutcome[]>;
    /** Records one audit event; retention is a user setting and an absent setting keeps every event. */
    addaudi(event: auditevent): Promise<void>;
    /** Records one step outcome; retention is a user setting and an absent setting keeps every outcome. */
    addoutcome(outcome: stepoutcome): Promise<void>;
    /** Stores one clickable map under its observation version so every captured map stays available. */
    setmap(map: clickablemap): Promise<void>;
    /** Returns one stored clickable map by its observation version. */
    getmap(version: number): Promise<clickablemap | undefined>;
    /** Advances and persists the observation version counter used to stamp clickable maps. */
    nextobservationversion(): Promise<number>;
    /** Returns the latest observation version used to stamp a clickable map. */
    getobservationversion(): Promise<number | undefined>;
    /** Returns the key hold registry, persisted so holds survive service worker restarts. */
    getholds(): Promise<keyholdstate[]>;
    /** Replaces the key hold registry after one press or release transition. */
    setholds(holds: keyholdstate[]): Promise<void>;
    /** Returns every dialog decision recorded for the audit trail. */
    getdialogs(): Promise<dialogdecision[]>;
    /** Records one dialog decision with the reviewed answer and the observed dialog text. */
    adddialog(decision: dialogdecision): Promise<void>;
    /** Returns every retry outcome recorded with attempts and movement deltas. */
    getretries(): Promise<retryoutcome[]>;
    /** Records one retry outcome with the attempts made and the movement delta observed. */
    addretry(outcome: retryoutcome): Promise<void>;
    /** Returns every resolution summary stored per target mode. */
    getresolutions(): Promise<resolutionsummary[]>;
    /** Records one resolution summary for later selector derivation. */
    addresolution(summary: resolutionsummary): Promise<void>;
    /** Returns the reviewed default dialog policy kept for the session auto handler. */
    getdialogpolicy(): Promise<dialogpolicy | undefined>;
    /** Stores the reviewed default dialog policy of the latest approved plan. */
    setdialogpolicy(policy: dialogpolicy): Promise<void>;
    /** Stores one observation capture under its version so every observation version stays available. */
    setobservation(record: observationrecord): Promise<void>;
    /** Returns one stored observation version. */
    getobservation(version: number): Promise<observationrecord | undefined>;
    /** Returns the observation retention window; an absent setting keeps every capture. */
    private observationretention;
    /** Stores one accessibility tree capture; retention is a user setting and an absent setting keeps every tree. */
    adda11ytree(capture: a11ycapture): Promise<void>;
    /** Returns every stored accessibility tree capture, newest first. */
    geta11ytrees(): Promise<a11ycapture[]>;
    /** Stores one reader article capture; retention is a user setting and an absent setting keeps every article. */
    addreaderarticle(capture: readercapture): Promise<void>;
    /** Returns every stored reader article capture, newest first. */
    getreaderarticles(): Promise<readercapture[]>;
    /** Records one dom mutation observed inside a reviewed watch. */
    addmutationevent(event: mutationevent): Promise<void>;
    /** Returns the mutation event stream of every reviewed watch. */
    getmutationevents(): Promise<mutationevent[]>;
    /** Records one focus change observed inside a reviewed watch. */
    addfocusevent(event: focusevent): Promise<void>;
    /** Returns the focus event stream of every reviewed watch. */
    getfocusevents(): Promise<focusevent[]>;
    /** Records one consent banner observed by a reviewed banner watch. */
    addbanner(event: bannerreport): Promise<void>;
    /** Returns every consent banner report observed so far. */
    getbanners(): Promise<bannerreport[]>;
    /** Records one snapshot diff between two observation versions. */
    adddiff(diff: snapshotdiff): Promise<void>;
    /** Returns every stored snapshot diff, newest first. */
    getdiffs(): Promise<snapshotdiff[]>;
    /** Records one derived selector with its stability score for reuse. */
    addselector(selector: derivedselector): Promise<void>;
    /** Returns every stored derived selector with its stability score, newest first. */
    getselectors(): Promise<derivedselector[]>;
    /** Records one detected template class or section fingerprint for its origin. */
    addtemplate(profile: templateprofile): Promise<void>;
    /** Returns every stored template class and section fingerprint, newest first. */
    gettemplates(): Promise<templateprofile[]>;
    /** Records one watch registration so it survives service worker restarts. */
    addwatch(watch: watchregistration): Promise<void>;
    /** Returns every watch registration, newest first, including closed windows. */
    getwatches(): Promise<watchregistration[]>;
    /** Closes one watch registration by watch id once its reviewed lifetime window ends. */
    closewatch(watchid: string, closedat: number): Promise<void>;
    /** Returns the live page signals of language, template, scroll lock and banner state. */
    getsignals(): Promise<pagesignals | undefined>;
    /** Replaces the live page signals after an observation step refreshes them. */
    setsignals(signals: pagesignals): Promise<void>;
    /** Appends one navigation trail entry of a session with its url, title, step ref and timestamp. */
    addtrailentry(sessionid: string, entry: trailentry): Promise<void>;
    /** Returns the navigation trail of a session, oldest first. */
    gettrail(sessionid: string): Promise<trailentry[]>;
    /** Stores one wait profile for an origin with user configured values, replacing the previous profile of that origin. */
    setwaitprofile(record: waitprofilerecord): Promise<void>;
    /** Returns every stored wait profile with its origin and user configured values, newest first. */
    getwaitprofiles(): Promise<waitprofilerecord[]>;
    /** Records one navigation step with its redirect chain and final url. */
    addnavrecord(record: navrecord): Promise<void>;
    /** Returns every stored navigation record with redirect chains and final urls, newest first. */
    getnavrecords(): Promise<navrecord[]>;
    /** Records one navigation intent detected from a plan for audit review. */
    addnavintent(record: navintentrecord): Promise<void>;
    /** Returns every stored navigation intent record, newest first. */
    getnavintents(): Promise<navintentrecord[]>;
    /** Replaces the rate limit window state of one domain. */
    setratestate(state: ratelimitstate): Promise<void>;
    /** Returns every rate limit window state per domain. */
    getratestates(): Promise<ratelimitstate[]>;
    /** Records one curated link list with its review state before batch opening. */
    addcurated(list: curatedlist): Promise<void>;
    /** Returns every stored curated link list, newest first. */
    getcurateds(): Promise<curatedlist[]>;
    /** Stores reviewed basic auth credentials for one origin, replacing the previous record of that origin. */
    setauth(record: authrecord): Promise<void>;
    /** Returns every stored reviewed basic auth record per origin. */
    getauths(): Promise<authrecord[]>;
    /** Records one task artifact routed into the artifact store. */
    addartifact(record: artifactrecord): Promise<void>;
    /** Returns every stored task artifact, newest first. */
    getartifacts(): Promise<artifactrecord[]>;
    /** Returns the navigation control state of paused navigation. */
    getnavcontrol(): Promise<navcontrol | undefined>;
    /** Replaces the navigation control state after a pause or resume transition. */
    setnavcontrol(control: navcontrol): Promise<void>;
    /** Records one url safety verdict produced by a checksafe verification. */
    addsafety(verdict: safetyverdict): Promise<void>;
    /** Returns every stored url safety verdict, newest first. */
    getsafeties(): Promise<safetyverdict[]>;
    /** Records one recently closed tab so a reopentab step can restore it. */
    addrecenttab(tab: recenttab): Promise<void>;
    /** Returns every recently closed tab, newest first. */
    getrecenttabs(): Promise<recenttab[]>;
    /** Returns the queued prefetch and batch open target counts shown in the popup badge. */
    getnavqueues(): Promise<navqueues | undefined>;
    /** Replaces the queued prefetch and batch open target counts. */
    setnavqueues(queues: navqueues): Promise<void>;
    /** Returns the last known navigation state of a tab, kept across service worker restarts. */
    getnavstate(tabid: number): Promise<navrecord | undefined>;
    /** Replaces the last known navigation state of a tab. */
    setnavstate(tabid: number, state: navrecord): Promise<void>;
    /** Stores one named tab layout with its window bounds and group states, replacing the previous layout of that name. */
    setlayout(layout: tablayout): Promise<void>;
    /** Returns one saved tab layout by name with its timestamp. */
    getlayout(name: string): Promise<tablayout | undefined>;
    /** Returns every saved tab layout with its window bounds and group states. */
    getlayouts(): Promise<tablayout[]>;
    /** Stores one tab group definition with its color choice and member tabs, replacing the previous definition of that name. */
    settabgroup(group: tabgrouprecord): Promise<void>;
    /** Returns every stored tab group definition with its color choice, newest first. */
    gettabgroups(): Promise<tabgrouprecord[]>;
    /** Records one tabmeta record with task provenance, replacing the previous metadata of that tab. */
    settabmeta(meta: tabmeta): Promise<void>;
    /** Returns every stored tabmeta record with task provenance. */
    gettabmetas(): Promise<tabmeta[]>;
    /** Records one session snapshot of tabs and windows for later restore. */
    addsnapshot(snapshot: sessionsnapshot): Promise<void>;
    /** Returns every stored session snapshot, newest first. */
    getsnapshots(): Promise<sessionsnapshot[]>;
    /** Records one closed tab in the history kept for restoretab and reopenrun. */
    addclosedtab(tab: closedtab): Promise<void>;
    /** Returns the closed tab history, newest first. */
    getclosedtabs(): Promise<closedtab[]>;
    /** Stores one badge state per task, replacing the previous badge of that task. */
    setbadge(badge: tabbadge): Promise<void>;
    /** Returns every stored badge state per task. */
    getbadges(): Promise<tabbadge[]>;
    /** Records one tab event observed inside a reviewed watchtab registration. */
    addtabwatchevent(event: tabwatchevent): Promise<void>;
    /** Returns the tab event stream of every reviewed watchtab registration, newest first. */
    gettabwatchevents(): Promise<tabwatchevent[]>;
    /** Returns the ids of the scratch windows opened for split work. */
    getscratchwindows(): Promise<number[]>;
    /** Replaces the scratch window id list after one scratch window opens or closes. */
    setscratchwindows(ids: number[]): Promise<void>;
    /** Returns the pinned control tab state with the live task feed. */
    getcontroltab(): Promise<controltabstate | undefined>;
    /** Replaces the pinned control tab state. */
    setcontroltab(state: controltabstate): Promise<void>;
    /** Stores one saved form profile under its reviewed name, replacing the previous profile of that name. */
    setprofile(profile: formprofile): Promise<void>;
    /** Returns one saved form profile by its reviewed name. */
    getprofile(name: string): Promise<formprofile | undefined>;
    /** Returns every saved form profile with its origin grants, newest first. */
    getprofiles(): Promise<formprofile[]>;
    /** Removes one saved form profile by its reviewed name. */
    removeprofile(name: string): Promise<void>;
    /** Records one wizard state with its step history. */
    addwizard(state: wizardstate): Promise<void>;
    /** Returns every stored wizard state with its step history, newest first. */
    getwizards(): Promise<wizardstate[]>;
    /** Stores one submission ticket with its values hash, replacing the previous ticket of that id. */
    setticket(ticket: submitticket): Promise<void>;
    /** Returns every stored submission ticket with its values hash, newest first. */
    gettickets(): Promise<submitticket[]>;
    /** Records one collected error report for correction loops. */
    adderrorreport(report: errorreport): Promise<void>;
    /** Returns every stored error report, newest first. */
    geterrorreports(): Promise<errorreport[]>;
    /** Records one typeahead pick observed when a reviewed suggestion entry was chosen. */
    addpick(pick: typeaheadpick): Promise<void>;
    /** Returns every recorded typeahead pick, newest first. */
    getpicks(): Promise<typeaheadpick[]>;
    /** Records one captcha handoff while the plan waits for the user. */
    addcaptcha(handoff: captchahandoff): Promise<void>;
    /** Returns every captcha handoff record with its resolution state, newest first. */
    getcaptchas(): Promise<captchahandoff[]>;
    /** Resolves one captcha handoff by id once the user finished it. */
    resolvecaptcha(id: string, resolvedat: number): Promise<void>;
    /** Records one login or template detection for its origin. */
    adddetection(record: detectionrecord): Promise<void>;
    /** Returns every stored login and template detection per origin, newest first. */
    getdetections(): Promise<detectionrecord[]>;
    /** Stores the reviewed one time code behind the consent gate of an active session. */
    setcodevalue(value: string): Promise<void>;
    /** Returns the reviewed one time code, if the user stored one behind the consent gate. */
    getcodevalue(): Promise<string | undefined>;
    /** Stores one dataset with its column specs and rows, replacing the previous record of that id. */
    setdataset(value: dataset): Promise<void>;
    /** Returns one stored dataset by its id with its column specs and row count. */
    getdataset(id: string): Promise<dataset | undefined>;
    /** Returns every stored dataset id, newest first. */
    getdatasets(): Promise<dataset[]>;
    /** Stores one imported csv dataset for fill loops beside the dataset store. */
    addimport(value: dataset): Promise<void>;
    /** Returns every imported csv dataset for fill loops, newest first. */
    getimports(): Promise<dataset[]>;
    /** Stores one extraction session with its cursor and page history, replacing the previous session of that id. */
    setextractsession(value: extractsession): Promise<void>;
    /** Returns every extraction session with its cursor and page history, newest first. */
    getextractsessions(): Promise<extractsession[]>;
    /** Records one provenance record of an exported artifact. */
    addprovenance(record: provenancerecord): Promise<void>;
    /** Returns every provenance record per exported artifact, newest first. */
    getprovenances(): Promise<provenancerecord[]>;
    /** Stores the transform rules and dedupe keys of one task, replacing the previous record of that task. */
    settaskrules(value: taskrules): Promise<void>;
    /** Returns the transform rules and dedupe keys per task, newest first. */
    gettaskrules(): Promise<taskrules[]>;
    /** Stores one stream chunk state for resume, replacing the previous state of that dataset. */
    setstream(state: streamstate): Promise<void>;
    /** Returns every stream chunk state persisted for resume, newest first. */
    getstreams(): Promise<streamstate[]>;
    /** Stores one reviewed sheet endpoint config behind its origin grant, replacing the previous config of that origin. */
    setsheetendpoint(config: sheetendpoint): Promise<void>;
    /** Returns every reviewed sheet endpoint config, newest first. */
    getsheetendpoints(): Promise<sheetendpoint[]>;
    /** Records one exported data artifact; artifact retention is a user setting and an absent setting keeps every artifact. */
    addexport(artifact: exportedartifact): Promise<void>;
    /** Returns every exported data artifact with its content and checksum, newest first. */
    getexports(): Promise<exportedartifact[]>;
    /** Removes one exported data artifact by id and reports whether it existed. */
    removeexport(id: string): Promise<boolean>;
    /** Removes one run store artifact by id and reports whether it existed. */
    removeartifact(id: string): Promise<boolean>;
    /** Stores one batch download file record with its state, path and checksum, replacing the previous record of that id. */
    setdownload(record: downloadrecord): Promise<void>;
    /** Returns every batch download file record with its state, path and checksum, newest first. */
    getdownloads(): Promise<downloadrecord[]>;
    /** Records one captured network log record; netlog retention is a user setting and an absent value keeps every record. */
    addnetlog(record: netlogrecord): Promise<void>;
    /** Returns the captured network log of the run with its step correlation, newest first. */
    getnetlog(): Promise<netlogrecord[]>;
    /** Stores one clipboard consent record with its prompt and origin, replacing the previous record of that id. */
    setclipconsent(record: clipboardconsentrecord): Promise<void>;
    /** Returns every clipboard consent record with its prompt and origin, newest first. */
    getclipconsents(): Promise<clipboardconsentrecord[]>;
    /** Records one clipboard entry hash with its origin provenance; the payload text itself never persists. */
    addclip(entry: clipentry): Promise<void>;
    /** Returns every clipboard entry hash with its kind and origin provenance, newest first. */
    getclips(): Promise<clipentry[]>;
    /** Stores one quarantine entry with its scan verdict, replacing the previous entry of that id. */
    setquarantine(entry: quarantineentry): Promise<void>;
    /** Returns every quarantine entry with its scan verdict and release ref, newest first. */
    getquarantines(): Promise<quarantineentry[]>;
    /** Stores the reviewed cleanup rule set of the run, replacing the previous set. */
    setcleanuprules(rules: cleanuprule[]): Promise<void>;
    /** Returns the reviewed cleanup rule set of the run. */
    getcleanuprules(): Promise<cleanuprule[]>;
    /** Records one cleanup run in the run history. */
    addcleanuprun(run: cleanuprun): Promise<void>;
    /** Returns every cleanup run history record with removed and kept counts, newest first. */
    getcleanupruns(): Promise<cleanuprun[]>;
    /** Stores the capture naming counters of one task, replacing the previous counters of that task. */
    setcapturecounter(counter: capturecounter): Promise<void>;
    /** Returns every stored capture naming counter per task, newest first. */
    getcapturecounters(): Promise<capturecounter[]>;
    /** Replaces the artifact inventory the cleanup sweeper plans against. */
    setinventory(entries: artifactinventoryentry[]): Promise<void>;
    /** Returns the artifact inventory with sizes and ages for the cleanup sweeper. */
    getinventory(): Promise<artifactinventoryentry[]>;
    /** Stores one user configured virus scanning hook, replacing the previous hook of that scanner name. */
    setscanhook(config: scanhookconfig): Promise<void>;
    /** Returns every configured virus scanning hook, newest first. */
    getscanhooks(): Promise<scanhookconfig[]>;
    /** Stores the armed mime interception filters of the run, newest first. */
    setmimefilters(filters: mimefilter[]): Promise<void>;
    /** Returns the armed mime interception filters of the run, newest first. */
    getmimefilters(): Promise<mimefilter[]>;
    /** Stores one capture record with its bytes and step linkage, replacing the previous record of that id; the user configured capture retention window expires the oldest bytes while the metadata always survives for the audit trail. */
    addcapture(record: shotrecord): Promise<void>;
    /** Returns every stored capture record with its metadata, newest first. */
    getcaptures(): Promise<shotrecord[]>;
    /** Returns one capture record with its bytes by its id. */
    getcapture(id: string): Promise<shotrecord | undefined>;
    /** Returns the capture records filtered by run, step and kind. */
    listcaptures(filter: {
        runid?: string;
        stepid?: string;
        kind?: string;
    }): Promise<shotrecord[]>;
    /** Records one before and after shotpair of the run with its action context. */
    addpair(pair: shotpair): Promise<void>;
    /** Returns the shotpairs of one run resolved through their before records, newest first; an absent run returns every pair. */
    getpairs(runid?: string): Promise<shotpair[]>;
    /** Stores one media record of the 1.1.41 family with its bytes and step linkage, replacing the previous record of that id; the user configured media retention window expires the oldest bytes while the metadata and the recording index always survive. */
    addmedia(record: mediarecord): Promise<void>;
    /** Returns every stored media record, newest first. */
    getmediarecords(): Promise<mediarecord[]>;
    /** Returns the media records filtered by run and kind; an absent filter returns every record. */
    listmedia(filter: {
        runid?: string;
        kind?: string;
    }): Promise<mediarecord[]>;
    /** Returns one media record by its id. */
    getmediarecord(id: string): Promise<mediarecord | undefined>;
    /** Returns one recording with its file reference and frame index by its id. */
    getrecording(id: string): Promise<recordingrecord | undefined>;
    /** Removes one media record by its id; the audit trail keeps its outcome evidence. */
    removemedia(id: string): Promise<void>;
    /** Stores one observed image batch of a downloadimages step, replacing the previous batch of that id. */
    addimagebatch(batch: imagebatch): Promise<void>;
    /** Returns every observed image batch with its filter match counts, newest first. */
    getimagebatches(): Promise<imagebatch[]>;
    /** Stores one recording consent decision of an origin, replacing the previous record of that id. */
    setrecordingconsent(record: recordingconsentrecord): Promise<void>;
    /** Returns every recording consent decision with its prompt and origin, newest first. */
    getrecordingconsents(): Promise<recordingconsentrecord[]>;
    /** Stores one outbound call record with its transport facts and body, replacing the previous record of that id; the user configured call retention window expires the oldest bodies while the metadata always survives. */
    addcall(record: callrecord): Promise<void>;
    /** Returns every stored outbound call record, newest first. */
    getcalls(): Promise<callrecord[]>;
    /** Returns one outbound call record with its body by its id. */
    getcall(id: string): Promise<callrecord | undefined>;
    /** Returns the outbound call records filtered by run and origin; an absent filter returns every call. */
    listcalls(filter: {
        runid?: string;
        origin?: string;
    }): Promise<callrecord[]>;
    /** Stores one typed endpoint definition version, appending to the version history of that endpoint name. */
    setendpoint(record: endpointrecord): Promise<void>;
    /** Returns the newest endpointrecord definition of one name with its payload schema and version. */
    getendpoint(name: string): Promise<endpointrecord | undefined>;
    /** Returns the newest definition of every typed endpoint name with its schema and version history. */
    getendpoints(): Promise<endpointrecord[]>;
    /** Stores one fetch consent decision per origin with its reviewed header names and values and its expiry window. */
    setfetchconsent(consent: fetchconsent): Promise<void>;
    /** Returns every fetch consent decision with its origin, header names and expiry window, newest first. */
    getfetchconsents(): Promise<fetchconsent[]>;
    /** Stores one api key entry with its origin scope and created time, replacing the previous entry of that name; the key material stays behind its storage id. */
    setapikey(entry: apikeyentry): Promise<void>;
    /** Returns every stored api key entry with its origin scope, header name, storage id and last use timestamp; key material never loads here. */
    getapikeys(): Promise<apikeyentry[]>;
    /** Stamps the last use timestamp of one stored api key entry without ever loading the key material. */
    touchapikey(name: string, at: number): Promise<void>;
    /** Removes one api key reference and its stored secret together. */
    removeapikey(name: string): Promise<void>;
    /** Stores one api key secret under its storage id; the value never appears in reports, outcomes or the audit trail. */
    setsecret(storageid: string, value: string): Promise<void>;
    /** Loads one api key secret under its storage id for the executor only. */
    getsecret(storageid: string): Promise<string | undefined>;
    /** Stores one channel record of a socket or event stream, replacing the previous record of that id. */
    addchannel(record: channelrecord): Promise<void>;
    /** Returns every stored channel record, newest first. */
    getchannels(): Promise<channelrecord[]>;
    /** Returns one channel record by its id. */
    getchannel(id: string): Promise<channelrecord | undefined>;
    /** Queues one message envelope of a channel stream, keeping the arrival order for the waitmessage matchers. */
    addmessage(envelope: messageenvelope): Promise<void>;
    /** Returns every queued message envelope, oldest first, optionally filtered by channel and stream. */
    getmessages(channelid?: string, stream?: string): Promise<messageenvelope[]>;
    /** Drops the matched message envelopes of one channel from the queue once a waitmessage step consumed them. */
    drainmessages(sequences: Array<{
        channelid: string;
        sequence: number;
    }>): Promise<void>;
    /** Stores one observed exchange record, replacing the previous record of that id. */
    addexchange(record: exchangerecord): Promise<void>;
    /** Returns every stored exchange record, newest first. */
    getexchanges(): Promise<exchangerecord[]>;
    /** Returns one exchange record by its id. */
    getexchange(id: string): Promise<exchangerecord | undefined>;
    /** Returns the exchange records filtered by run, origin and status; the status filter accepts one code or the failed class of every exchange with an error class. */
    listexchanges(filter: {
        runid?: string;
        origin?: string;
        status?: number | "failed";
    }): Promise<exchangerecord[]>;
    /** Stores one captured response body with its mime type and byte size; the user configured body retention window expires the oldest bodies while the exchange metadata always survives. */
    addbody(record: bodyrecord): Promise<void>;
    /** Returns every captured body record, newest first. */
    getbodies(): Promise<bodyrecord[]>;
    /** Returns one captured body record with its stored text by its reference. */
    getbody(ref: string): Promise<bodyrecord | undefined>;
    /** Stores the page api map of one origin, replacing the previous map of that origin. */
    setapimap(origin: string, entries: apimapentry[]): Promise<void>;
    /** Returns every stored page api map entry, newest first. */
    getapimap(): Promise<apimapentry[]>;
    /** Stores one event stream subscription record, replacing the previous record of that id. */
    setsubscription(record: eventsubscription): Promise<void>;
    /** Returns every stored event stream subscription, newest first. */
    getsubscriptions(): Promise<eventsubscription[]>;
    /** Stores one registered request block rule of a run, replacing the previous rule of that id; every rule reverts and stays auditable after the run ends. */
    addblockrule(rule: blockrule): Promise<void>;
    /** Returns every stored block rule, newest first. */
    getblockrules(): Promise<blockrule[]>;
    /** Stores one registered response mock fixture of a run, replacing the previous fixture of that id; the fixture body stays out of every audit trail. */
    addmockspec(spec: mockspec): Promise<void>;
    /** Returns every stored mock fixture, newest first. */
    getmockspecs(): Promise<mockspec[]>;
    /** Stores one registered header rewrite rule of a run, replacing the previous rule of that id; the provenance of every applied rule stays auditable. */
    addheaderule(rule: headerule): Promise<void>;
    /** Returns every stored header rewrite rule, newest first. */
    getheaderules(): Promise<headerule[]>;
    /** Stores one cookie operation of a run per domain with its timestamp; cookie values never enter the operation record. */
    addcookieop(operation: cookieoperation): Promise<void>;
    /** Returns every stored cookie operation, newest first, optionally filtered by domain. */
    getcookieops(domain?: string): Promise<cookieoperation[]>;
    /** Stores one token record of a provider with scopes, origin scope and expiry; the token values stay behind their storage ids. */
    addtoken(record: tokenrecord): Promise<void>;
    /** Returns every stored token record, newest first, optionally filtered by provider; token values never load here. */
    listtokens(provider?: string): Promise<tokenrecord[]>;
    /** Stores one applied proxy route of a run with its apply time, replacing the previous route of that id; the history keeps the revert times. */
    addproxyroute(route: proxyroute): Promise<void>;
    /** Returns every stored proxy route with apply and revert times, newest first. */
    getproxyroutes(): Promise<proxyroute[]>;
    /** Stores one parsed rate limit read per origin, replacing the previous read of that origin. */
    setratelimit(read: ratelimitread): Promise<void>;
    /** Returns every stored rate limit read whose reset window has not passed yet; expired states drop out at their reset windows. */
    getratelimits(now: number): Promise<ratelimitread[]>;
    /** Stores one run timeline entry; the user configured timeline retention window expires the oldest entries while their level counts survive in the per run level summaries. */
    addtimelineentry(entry: timelineentry): Promise<void>;
    /** Returns every stored run timeline entry, newest first. */
    gettimeline(): Promise<timelineentry[]>;
    /** Returns the run timeline entries filtered by run, level and step id. */
    listtimeline(filter: {
        runid?: string;
        level?: loglevel;
        stepid?: string;
    }): Promise<timelineentry[]>;
    /** Stores one captured javascript error record with its stack frames, source url and line. */
    adderrorrecord(record: errorrecord): Promise<void>;
    /** Returns every stored error record, newest first. */
    geterrorrecords(): Promise<errorrecord[]>;
    /** Stores one captured unhandled rejection record with its reason and stack frames. */
    addrejectionrecord(record: rejectionrecord): Promise<void>;
    /** Returns every stored rejection record, newest first. */
    getrejectionrecords(): Promise<rejectionrecord[]>;
    /** Stores one captured long task entry with its duration, start time and attribution names. */
    addlongtask(record: longtaskentry): Promise<void>;
    /** Returns every stored long task entry, newest first. */
    getlongtasks(): Promise<longtaskentry[]>;
    /** Stores one console diff result between two runs, replacing the previous one. */
    addconsolediff(diff: consolediff): Promise<void>;
    /** Returns the one stored console diff result. */
    getdiff(): Promise<consolediff | undefined>;
    /** Stores one log rotation target record with its overflow entry counts, replacing the previous record of that target and run. */
    addrotationtarget(record: rotationtargetrecord): Promise<void>;
    /** Returns every stored rotation target record with its overflow entry counts, newest first. */
    getrotationtargets(): Promise<rotationtargetrecord[]>;
    /** Stores one console capture consent decision per origin; the approved decision persists so console watching on that origin prompts once. */
    setconsoleconsent(consent: consoleconsentrecord): Promise<void>;
    /** Returns every console capture consent decision, newest first. */
    getconsoleconsents(): Promise<consoleconsentrecord[]>;
    /** Stores one devtools session record with its enabled domains and detach state, replacing the previous record of its id. */
    setcdpsession(session: cdpsession): Promise<void>;
    /** Returns every stored devtools session record, newest first. */
    getcdpsessions(): Promise<cdpsession[]>;
    /** Stores one raw command outcome with its duration and error class. */
    addcdpcommand(command: cdpcommand): Promise<void>;
    /** Returns every stored raw command outcome, newest first. */
    getcdpcommands(): Promise<cdpcommand[]>;
    /** Stores one domain event rule with its match filter, replacing the previous rule of its id. */
    setcdpeventrule(rule: cdpeventrule): Promise<void>;
    /** Returns every stored domain event rule, newest first. */
    getcdpeventrules(): Promise<cdpeventrule[]>;
    /** Stores one breakpoint record with its condition and hit counter, replacing the previous record of its id. */
    addbreakpoint(spec: breakpointspec): Promise<void>;
    /** Returns every stored breakpoint record, newest first. */
    getbreakpoints(): Promise<breakpointspec[]>;
    /** Stores one pause state capture; the user configured pause retention window expires the call frames and the dom snapshot reference of the oldest captures while the pause reason and hit breakpoint survive. */
    addpause(pause: pausestate): Promise<void>;
    /** Returns every stored pause state capture, newest first. */
    getpauses(): Promise<pausestate[]>;
    /** Returns the pause state captures of one run, newest first. */
    listpauses(runid: string): Promise<pausestate[]>;
    /** Stores one watch expression with its per pause values, replacing the previous expression of its id. */
    setwatchexpression(expression: watchexpression): Promise<void>;
    /** Returns every stored watch expression, newest first. */
    getwatchexpressions(): Promise<watchexpression[]>;
    /** Stores one script override with its review provenance, replacing the previous override of its id. */
    addscriptoverride(spec: scriptoverride): Promise<void>;
    /** Returns every stored script override, newest first. */
    getscriptoverrides(): Promise<scriptoverride[]>;
    /** Stores one debugger consent decision per origin with the consented domain list, replacing the previous decision of its id. */
    setdebuggergrant(grant: debuggergrant): Promise<void>;
    /** Returns every debugger consent decision, newest first. */
    getdebuggergrants(): Promise<debuggergrant[]>;
    /** Revokes every approved debugger consent of one origin: the revoke time stamps the records so the next attach needs a new reviewed prompt. */
    revokedebuggergrants(origin: string, at: number): Promise<number>;
    /** Merges expired entry counts into the per run level count summary that survives the retention window. */
    private mergelevelsummary;
    /** Returns every per run level count summary, newest first. */
    getlevelsummaries(): Promise<levelsummary[]>;
    /** Stores one measured flow metric of the run beside its step span; the flow series stays per run. */
    addflowmetric(metric: flowmetric): Promise<void>;
    /** Returns every stored flow metric, newest first. */
    getflowmetrics(): Promise<flowmetric[]>;
    /** Returns the flow metrics of one run, newest first. */
    listflowmetrics(runid: string): Promise<flowmetric[]>;
    /** Stores one heap snapshot record with its byte and node counts; the user configured profile retention window expires the heavy snapshot bytes while the counts survive. */
    setheaprecord(heap: heaprecord): Promise<void>;
    /** Returns every stored heap snapshot record, newest first. */
    getheaprecords(): Promise<heaprecord[]>;
    /** Stores one heap growth sample taken beside a step. */
    addgrowsample(sample: growsample): Promise<void>;
    /** Returns every stored heap growth sample, newest first. */
    getgrowsamples(): Promise<growsample[]>;
    /** Returns the heap growth samples of one run, newest first. */
    listgrowsamples(runid: string): Promise<growsample[]>;
    /** Stores one computed heap growth trend of a run with its slope and flagged steps, replacing the previous trend of the run. */
    settrend(trend: memorytrend): Promise<void>;
    /** Returns every stored heap growth trend, newest first. */
    gettrends(): Promise<memorytrend[]>;
    /** Stores one cpu profile record with its sample count and hot function list; the profile retention window expires the heavy sample payload while the counts and hot functions survive. */
    setcpuprofile(profile: cpuprofile): Promise<void>;
    /** Returns every stored cpu profile record, newest first. */
    getcpuprofiles(): Promise<cpuprofile[]>;
    /** Stores one layout shift entry with its score and impacted selectors. */
    addshiftentry(entry: shiftentry): Promise<void>;
    /** Returns every stored layout shift entry, newest first. */
    getshiftentries(): Promise<shiftentry[]>;
    /** Stores one trace record with its category list, byte size and step annotations; the profile retention window expires the heavy trace bytes while the metadata and annotations survive. */
    settracerecord(trace: tracerecord): Promise<void>;
    /** Returns every stored trace record, newest first. */
    gettracerecords(): Promise<tracerecord[]>;
    /** Returns the trace records filtered by run and applied categories. */
    listtraces(filter: {
        runid?: string;
        categories?: string[];
    }): Promise<tracerecord[]>;
    /** Stores the exported file content of one trace beside its record; the retention window drops the file bytes of expired traces while the record survives. */
    settracefile(traceid: string, content: string): Promise<void>;
    /** Returns the exported file content of one trace, or undefined when the retention window dropped the bytes. */
    gettracefile(traceid: string): Promise<string | undefined>;
    /** Stores one source map reference of a run with its script url, map url and parsed state. */
    setsourcemapref(ref: sourcemapref): Promise<void>;
    /** Returns every stored source map reference, newest first. */
    getsourcemaps(): Promise<sourcemapref[]>;
    /** Stores one source map capture consent decision per origin, replacing the previous decision of its id. */
    setsourcemapconsent(consent: sourcemapconsent): Promise<void>;
    /** Returns every source map capture consent decision, newest first. */
    getsourcemapconsents(): Promise<sourcemapconsent[]>;
    /** Revokes every approved source map consent of one origin so the next capture needs a new reviewed prompt. */
    revokesourcemapconsents(origin: string, at: number): Promise<number>;
    /** Stores the emulation state of one run keyed by its run id; the reverted layer prior states expire after the user configured retention window while the layer history always survives. */
    setemulationstate(state: emulationstate): Promise<void>;
    /** Returns the persisted emulation state of one run so the layers survive service worker restarts. */
    getemulationstate(runid: string): Promise<emulationstate | undefined>;
    /** Returns the active and past layers of one run, newest last in apply order; the listlayers accessor of the emulation memory. */
    listlayers(runid: string): Promise<emulationlayer[]>;
    /** Stores one user curated device preset by its name so the preset library stays user data instead of a hardcoded list. */
    setdevicepreset(preset: devicepreset): Promise<void>;
    /** Returns every user curated device preset. */
    getdevicepresets(): Promise<devicepreset[]>;
    /** Stores one user curated network preset by its name with editable values. */
    setnetworkpreset(preset: networkpreset): Promise<void>;
    /** Returns every user curated network preset. */
    getnetworkpresets(): Promise<networkpreset[]>;
    /** Stores one user curated location preset by its name. */
    setlocationpreset(preset: locationpreset): Promise<void>;
    /** Returns every user curated location preset. */
    getlocationpresets(): Promise<locationpreset[]>;
    /** Stores one user curated agent preset by its name. */
    setagentpreset(preset: agentpreset): Promise<void>;
    /** Returns every user curated agent preset. */
    getagentpresets(): Promise<agentpreset[]>;
    /** Replaces the blackbox rule set of one origin so third party script blackboxing stays scoped per origin. */
    setblackboxrules(origin: string, rules: blackboxrule[]): Promise<void>;
    /** Returns every stored blackbox rule set with its origin. */
    getblackboxrules(): Promise<Array<{
        origin: string;
        rules: blackboxrule[];
    }>>;
    /** Records one permission override of a run with its prior state captured for the exact restore. */
    addpermissionoverride(record: permissionoverriderecord): Promise<void>;
    /** Returns the permission override history with restore states, newest first. */
    getpermissionoverrides(): Promise<permissionoverriderecord[]>;
    /** Stores one location consent decision per origin, replacing the previous decision of its id. */
    setlocationconsent(consent: locationconsent): Promise<void>;
    /** Returns every location consent decision, newest first. */
    getlocationconsents(): Promise<locationconsent[]>;
    /** Returns the persisted task state checkpoint of one run so the run resumes after a service worker restart. */
    gettaskstate(runid: string): Promise<taskstate | undefined>;
    /** Persists one task state checkpoint per run with its corruption checksum. */
    settaskstate(state: taskstate): Promise<void>;
    /** Returns the session event history with timestamps, newest first. */
    getsessionevents(): Promise<sessionevent[]>;
    /** Records one session event of the run with its timestamp and detail. */
    addsessionevent(event: sessionevent): Promise<void>;
    /** Returns every saved session record with its sections, newest first. */
    getsessionrecords(): Promise<sessionrecord[]>;
    /** Adds one saved session record to the library. */
    addsessionrecord(record: sessionrecord): Promise<void>;
    /** Replaces one saved session record by its id after a filing or restore touches it. */
    updatesessionrecord(record: sessionrecord): Promise<void>;
    /** Lists saved sessions filtered by name substring, folder and time window; the filter stays a user choice with no result cap. */
    listsessions(filter: {
        name?: string;
        folder?: string;
        from?: number;
        to?: number;
    }): Promise<sessionrecord[]>;
    /** Returns one saved session with every section; an expired record carries its metadata only. */
    getsessionrecord(id: string): Promise<sessionrecord | undefined>;
    /** Runs the reviewed search query across every stored session and returns the matches with their session ids and time windows. */
    searchmemory(query: searchquery): Promise<sessionmatch[]>;
    /** Returns the folder tree of the session library. */
    getsessionfolders(): Promise<sessionfolder[]>;
    /** Replaces the folder tree after a reviewed filing adds or moves one folder. */
    setsessionfolders(folders: sessionfolder[]): Promise<void>;
    /** Returns every stored session diff result, newest first. */
    getsessiondiffs(): Promise<sessiondiff[]>;
    /** Stores one session diff result for later review. */
    addsessiondiff(diff: sessiondiff): Promise<void>;
    /** Returns the persisted auto snapshot state with the reviewed interval, the last snapshot time and the snapshot count. */
    getautosnapshot(): Promise<autosnapshotstate | undefined>;
    /** Stores the auto snapshot state of the reviewed interval. */
    setautosnapshot(state: autosnapshotstate): Promise<void>;
    /** Clears the auto snapshot interval so on demand captures stay the only source of records. */
    clearautosnapshot(): Promise<void>;
    /** Expires the heavy sections of saved sessions after the reviewed retention window while the record metadata survives. */
    applysessionexpiry(retention: number | undefined, now: number): Promise<sessionrecord[]>;
    /** Returns the crash marker of a run interrupted by a browser restart. */
    getcrashflag(): Promise<boolean>;
    /** Sets the crash marker so the sessions view offers the crash restore inside the consent model. */
    setcrashflag(value: boolean): Promise<void>;
    /** Stores one composed workflow record version with its timestamp; re-composing the same version replaces it while older versions survive for the audit trail. */
    addworkflowrecord(record: workflowrecord): Promise<void>;
    /** Returns every stored workflow record version, newest first. */
    getworkflowrecordversions(): Promise<workflowrecord[]>;
    /** Returns the latest stored version of one workflow record. */
    getworkflowrecord(id: string): Promise<workflowrecord | undefined>;
    /** Lists the saved workflow records, the latest version of each, newest first. */
    listworkflows(): Promise<workflowrecord[]>;
    /** Stores one workflow run with its state transition; a run replace keeps the full runlog of the same id. */
    setworkflowrun(run: workflowrun): Promise<void>;
    /** Returns every stored workflow run, newest first. */
    listworkflowruns(): Promise<workflowrun[]>;
    /** Returns one run with its full step outcome list so the panel shows the timeline after and during a run. */
    getrun(id: string): Promise<{
        run: workflowrun;
        log: runlogentry[];
    } | undefined>;
    /** Records one runlog entry of a run; the runlog retention window is a user setting and an absent window keeps every entry. */
    addrunlogentry(runid: string, entry: runlogentry): Promise<void>;
    /** Returns the runlog of one run, oldest first. */
    getrunlog(runid: string): Promise<runlogentry[]>;
    /** Stores the variable values per scope of one run for inspection after the run. */
    setrunscopes(runid: string, scopes: variablescope[]): Promise<void>;
    /** Returns the variable scopes of one run, oldest first. */
    getrunscopes(runid: string): Promise<variablescope[]>;
    /** Records one provenance entry of a run: an expression result or a regex capture with its name, value and time. */
    addworkflowprovenance(runid: string, entry: workflowprovenance): Promise<void>;
    /** Returns every provenance entry of one run, oldest first. */
    getworkflowprovenance(runid: string): Promise<workflowprovenance[]>;
    /** Stores one shareable step template under its unique name. */
    addsteptemplate(template: steptemplate): Promise<void>;
    /** Returns every stored step template, newest first. */
    getsteptemplates(): Promise<steptemplate[]>;
    /** Records one control flow decision of a run — a branch choice with its reason, the loop counters of an iteration trail, the retry attempts with their backoff durations, the timeout aborts with the exceeded budget, the join record with its strategy and conflicts or the catch handler execution — so the audit trail keeps every control flow turn. */
    addcontroldecision(runid: string, decision: controlflowdecision): Promise<void>;
    /** Returns every stored control flow decision of one run, oldest first. */
    listcontroldecisions(runid: string): Promise<controlflowdecision[]>;
    /** Returns the past branch decisions of one workflow across every stored run, oldest first, so review can compare branch paths over time. */
    getbranchhistory(workflowid: string): Promise<branchoutcome[]>;
    /** Stores one armed trigger rule with its workflow reference; re-arming the same id replaces the rule while the fire history survives. */
    addtriggerule(rule: triggerule): Promise<void>;
    /** Returns every armed trigger rule, newest first. */
    gettriggerules(): Promise<triggerule[]>;
    /** Returns one armed trigger rule by its id. */
    gettriggerule(id: string): Promise<triggerule | undefined>;
    /** Replaces one stored rule after an enable, disable, pause, resume, cooldown or fire bookkeeping change. */
    settriggerule(rule: triggerule): Promise<void>;
    /** Replaces every stored rule at once so the session pause and resume suspend and release the whole rule set atomically. */
    settriggerules(rules: triggerule[]): Promise<void>;
    /** Removes one armed rule when the user disarms it; the fire history survives for the audit trail. */
    removetriggerule(id: string): Promise<void>;
    /** Lists every armed rule joined with the name of its composed workflow so the trigger list shows what each rule launches. */
    listtriggers(): Promise<Array<{
        rule: triggerule;
        workflowname?: string;
    }>>;
    /** Records one trigger fire with the reviewed retention window; an absent window keeps every fire record while the rule counters always survive. */
    addtriggerfire(fire: triggerfire): Promise<void>;
    /** Returns every stored trigger fire record, newest first, optionally filtered to one rule. */
    listtriggerfires(ruleid?: string): Promise<triggerfire[]>;
    /** Stores the pending trigger queue: fires that arrived while the target run was busy or the session paused; the resume drains them through the same gates. */
    settriggerqueue(queue: triggerfire[]): Promise<void>;
    /** Returns the pending trigger queue, oldest first. */
    gettriggerqueue(): Promise<triggerfire[]>;
    /** Stores one verified webhook payload of a rule; the executor verifies the shared secret and the schema before anything persists. */
    addwebhookpayload(ruleid: string, payload: Record<string, unknown>, at: number): Promise<void>;
    /** Returns the stored webhook payloads of one rule, newest first; only secret verified deliveries ever reach this store. */
    listwebhookpayloads(ruleid: string): Promise<Array<{
        ruleid: string;
        payload: Record<string, unknown>;
        at: number;
    }>>;
    /** Stores one manual run preview with its step list so the panel renders it before confirmation. */
    addmanualrun(preview: manualrun): Promise<void>;
    /** Returns every stored manual run preview with its confirmation outcome, newest first. */
    listmanualruns(): Promise<manualrun[]>;
    /** Stores one workflow version record with its change note; saving the same version again replaces its note while older versions survive for the timeline. */
    addworkflowversion(version: workflowversion): Promise<void>;
    /** Returns every stored workflow version record, newest first, optionally filtered to one workflow. */
    listworkflowversions(workflowid?: string): Promise<workflowversion[]>;
    /** Stores one version diff result for the history view. */
    addversiondiff(diff: versiondiff): Promise<void>;
    /** Returns every stored version diff result, newest first, optionally filtered to one workflow. */
    listversiondiffs(workflowid?: string): Promise<versiondiff[]>;
    /** Records one run history entry — the outcome, duration and trigger cause of one execution — under the user configured retention window with no code ceiling. */
    addrunhistory(entry: runhistoryentry): Promise<void>;
    /** Returns the stored run history, newest first, filtered by workflow, outcome and time floor; the filters stay user choices. */
    gethistory(filter?: {
        workflowid?: string;
        outcome?: string;
        since?: number;
        limit?: number;
    }): Promise<runhistoryentry[]>;
    /** Stores the editor layout of one workflow so the canvas reopens exactly as left. */
    seteditorlayout(workflowid: string, layout: editorlayout): Promise<void>;
    /** Returns the stored editor layout of one workflow. */
    geteditorlayout(workflowid: string): Promise<editorlayout | undefined>;
    /** Stores the breakpoint step ids of one workflow. */
    setworkflowbreakpoints(workflowid: string, stepids: string[]): Promise<void>;
    /** Returns the stored breakpoint step ids of one workflow, oldest first. */
    getworkflowbreakpoints(workflowid: string): Promise<string[]>;
    /** Stores one per site policy override; re-adding the same id replaces its deltas. */
    addsiteoverride(override: siteoverride): Promise<void>;
    /** Returns every stored per site override, newest first, optionally filtered to one workflow. */
    listsiteoverrides(workflowid?: string): Promise<siteoverride[]>;
    /** Removes one per site override when the user deletes it. */
    removesiteoverride(id: string): Promise<void>;
    /** Stores one watchdog event with its recovery outcome; the event history keeps the audit trail of every scan. */
    addwatchdogevent(event: watchdogrecord): Promise<void>;
    /** Returns every stored watchdog event, newest first. */
    listwatchdogevents(): Promise<watchdogrecord[]>;
    /** Stores one pending workflow import held for review; approving it later stores the record as runnable. */
    addworkflowimport(entry: workflowimport): Promise<void>;
    /** Returns every pending workflow import, newest first. */
    listworkflowimports(): Promise<workflowimport[]>;
    /** Removes one pending import when the user approves or rejects it. */
    removeworkflowimport(id: string): Promise<void>;
    /** Stores the per workflow background run flags so a workflow keeps running with the panel closed. */
    setbackgroundruns(flags: Record<string, boolean>): Promise<void>;
    /** Returns the per workflow background run flags. */
    getbackgroundruns(): Promise<Record<string, boolean>>;
    /** Removes one stored workflow record version; a rejected import or rollback disappears from the library while every other version survives. */
    removeworkflowversion(id: string, version: number): Promise<void>;
    /** Returns every stored mcp client record, newest first. */
    getclients(): Promise<clientrecord[]>;
    /** Upserts one mcp client record by its id so one clientrecord stays per connected transport. */
    setclient(client: clientrecord): Promise<void>;
    /** Returns the connected client records — every client whose disconnect time is absent. */
    listclients(): Promise<clientrecord[]>;
    /** Stores the negotiated capability set of one client on its record. */
    setclientcapabilities(id: string, capabilities: capabilityset): Promise<void>;
    /** Drops every stored client record when the server stops. */
    clearclients(): Promise<void>;
    /** Records one stdio bridge launch event with its process id; a restart marker distinguishes the relaunch of a dead client process. */
    addbridgelaunch(launch: bridgelaunch): Promise<void>;
    /** Returns every stdio bridge launch event, newest first. */
    listbridgelaunches(): Promise<bridgelaunch[]>;
    /** Returns the user configured mcp server config; an absent record keeps the documented localhost default. */
    getmcpconfig(): Promise<mcpserverconfig | undefined>;
    /** Stores the user configured mcp server config: bind address, port, transports, frame size, queue depth and enablement all stay user choices. */
    setmcpconfig(config: mcpserverconfig): Promise<void>;
    /** Returns the persisted mcp server runtime state. */
    getmcpstate(): Promise<mcpserverstate | undefined>;
    /** Stores the mcp server runtime state with the stdio bridge status. */
    setmcpstate(state: mcpserverstate): Promise<void>;
    /** Records one mcp tool call — the client, the tool, the origin and the outcome without any payload — under the user configured call retention with no code ceiling. */
    addtoolcall(record: toolcallrecord): Promise<void>;
    /** Returns every stored mcp tool call record, newest first. */
    listtoolcalls(): Promise<toolcallrecord[]>;
    /** Returns every stored session token of paired remote clients; the records carry only their tokenhash form so raw tokens never persist. */
    getsessiontokens(): Promise<sessiontoken[]>;
    /** Replaces the stored session token set after one issue, revocation or expiry sweep. */
    setsessiontokens(tokens: sessiontoken[]): Promise<void>;
    /** Returns every stored pairing code with its single use state, newest first. */
    getpairingcodes(): Promise<pairingcode[]>;
    /** Records one issued pairing code for the one time client pairing. */
    addpairingcode(code: pairingcode): Promise<void>;
    /** Marks one pairing code used so it never pairs a second client; an unknown code stays untouched. */
    usepairingcode(code: string, now: number): Promise<void>;
    /** Returns every client allowlist entry with its grant history. */
    getallowlist(): Promise<allowlistentry[]>;
    /** Upserts one client allowlist entry by its fingerprint with the grant history riding the record. */
    setallowlistentry(entry: allowlistentry): Promise<void>;
    /** Removes one client allowlist entry so its fingerprint stops passing the allowlist check. */
    removeallowlistentry(fingerprint: string): Promise<void>;
    /** Returns every approval gate with its decision state — the pending and resolved gates of the approval view. */
    listapprovals(): Promise<approvalrequest[]>;
    /** Records one raised approval gate or its resolved state, keyed by the gate id. */
    setapproval(request: approvalrequest): Promise<void>;
    /** Records one approval execution — the decision, the actor, the time and the latency — beside its gate. */
    addapprovalexec(exec: approvalexec): Promise<void>;
    /** Returns every approval execution record, newest first. */
    listapprovalexecs(): Promise<approvalexec[]>;
    /** Records one auth handshake event with its issued, verified or refused outcome. */
    addauthhandshake(event: authhandshakeevent): Promise<void>;
    /** Returns every auth handshake event with its outcome, newest first. */
    listauthhandshakes(): Promise<authhandshakeevent[]>;
    /** Returns every stored client identity with its fingerprint for allowlist matching. */
    getclientidentities(): Promise<clientidentity[]>;
    /** Upserts one client identity by its fingerprint so the allowlist matches it. */
    setclientidentity(identity: clientidentity): Promise<void>;
    /** Returns every open and closed stream channel of the http stream transport. */
    getstreamchannels(): Promise<streamchannel[]>;
    /** Replaces the stored stream channel set after one open, heartbeat or close sweep. */
    setstreamchannels(channels: streamchannel[]): Promise<void>;
    /** Returns every client event subscription with its kinds and filters, newest first. */
    geteventsubscriptions(): Promise<protocoleventsubscription[]>;
    /** Replaces the stored event subscription set after one subscribe, unsubscribe or delivery sweep. */
    seteventsubscriptions(subscriptions: protocoleventsubscription[]): Promise<void>;
    /** Returns every page state resource watcher with its baseline, newest first. */
    getresourcewatches(): Promise<resourcewatch[]>;
    /** Replaces the stored resource watcher set after one watch, unwatch or delta push. */
    setresourcewatches(watches: resourcewatch[]): Promise<void>;
    /** Returns every sampling request with its provenance, newest first. */
    getsamplingrequests(): Promise<samplingrequest[]>;
    /** Replaces the stored sampling request set after one request or answer. */
    setsamplingrequests(requests: samplingrequest[]): Promise<void>;
    /** Returns every stored idempotency record for replay, newest first. */
    getidempotencyrecords(): Promise<idempotencyrecord[]>;
    /** Replaces the stored idempotency record set after one store or expiry sweep. */
    setidempotencyrecords(records: idempotencyrecord[]): Promise<void>;
    /** Returns every per client rate limit counter with its window and budget. */
    getcallratelimits(): Promise<callratelimit[]>;
    /** Replaces the stored per client rate limit set after one configuration or counted call. */
    setcallratelimits(limits: callratelimit[]): Promise<void>;
    /** Returns every stored batch call with its per item outcomes, newest first. */
    getbatchcalls(): Promise<batchcall[]>;
    /** Upserts one batch call by its id with the per item outcomes riding the record. */
    setbatchcall(batch: batchcall): Promise<void>;
    /** Returns every call context of the call runtime, newest first. */
    getcallcontexts(): Promise<callcontext[]>;
    /** Replaces the stored call context set after one begin, end or cancellation. */
    setcallcontexts(contexts: callcontext[]): Promise<void>;
    /** Returns every stored tool mock for client testing. */
    gettoolmocks(): Promise<toolmock[]>;
    /** Upserts one tool mock by its tool name or removes it when the canned result is absent. */
    settoolmock(mock: toolmock): Promise<void>;
    /** Removes one tool mock so its tool returns to the real gates. */
    removetoolmock(tool: string): Promise<void>;
    /** Stores one stream chunk of a progressive tool result under the recent chunk window of 25 records. */
    addstreamchunk(chunk: streamchunk): Promise<void>;
    /** Returns the recent stream chunks of progressive tool results, newest first. */
    getstreamchunks(): Promise<streamchunk[]>;
    /** Replaces the recent stream chunk window after one streaming sweep. */
    setstreamchunks(chunks: streamchunk[]): Promise<void>;
    /** Returns the audited tool call log under the requested filters: the client, the tool, the outcome, the time floor and the newest bound, all optional. */
    getcalllog(filters?: {
        clientid?: string;
        tool?: string;
        ok?: boolean;
        since?: number;
        limit?: number;
    }): Promise<toolcallrecord[]>;
    /** Stores one progress notice of a long tool call under the recent notice window of 25 records. */
    addprogressnotice(notice: progressnotice): Promise<void>;
    /** Returns the recent progress notices of long tool calls, newest first. */
    getprogressnotices(): Promise<progressnotice[]>;
    /** Returns the tool dry run toggle of the next call: true once the user armed the dry run in the panel. */
    getdryruntoggle(): Promise<boolean>;
    /** Arms or disarms the tool dry run of the next call. */
    setdryruntoggle(enabled: boolean): Promise<void>;
    /** Returns every client session binding of the 1.1.84 serve mode: one live binding per client so concurrent clients hold isolated extension sessions. */
    getclientbindings(): Promise<clientbinding[]>;
    /** Replaces the stored client binding set after one bind or release; the released records stay for the audit trail. */
    setclientbindings(bindings: clientbinding[]): Promise<void>;
    /** Upserts one client session binding of the 1.1.84 serve mode by its client id. */
    setclientbinding(binding: clientbinding): Promise<void>;
    /** Returns the shutdown drain window of the 1.1.84 serve mode in milliseconds; an absent window keeps the drain unbounded because the wait stays a user choice. */
    getdrainwindow(): Promise<number | undefined>;
    /** Stores the shutdown drain window of the 1.1.84 serve mode as the user configured value with no code ceiling. */
    setdrainwindow(window: number): Promise<void>;
    /** Returns every user configured provider config of the 1.1.57 llm integration; the api keys stay behind their storage id references, never inside these records. */
    getproviders(): Promise<providerconfig[]>;
    /** Replaces the stored provider config set after one save, test or removal. */
    setproviders(providers: providerconfig[]): Promise<void>;
    /** Returns the user configured local model endpoint of the browser reachable inference. */
    getlocalmodel(): Promise<localmodelconfig | undefined>;
    /** Stores the local model endpoint config after one save or health check. */
    setlocalmodel(config: localmodelconfig): Promise<void>;
    /** Returns every model route entry of the routing table, newest update first. */
    getmodelroutes(): Promise<modelroute[]>;
    /** Replaces the stored routing table after one route edit. */
    setmodelroutes(routes: modelroute[]): Promise<void>;
    /** Appends one revision entry to the model route revision history so every routing change stays queryable for audit. */
    addmodelrouterevision(route: modelroute): Promise<void>;
    /** Returns the model route revision history, newest first. */
    getmodelroutehistory(): Promise<modelroute[]>;
    /** Records one usage entry of a model call with its run and step ids; the newest call reads first and an absent retention keeps every record. */
    addusagerecord(record: usagerecord): Promise<void>;
    /** Returns every stored usage record of model calls, newest first. */
    getusagerecords(): Promise<usagerecord[]>;
    /** Returns the token and cost totals per period: the run, the step, the since floor and the until ceiling stay optional filters over the stored usage records. */
    getusage(filter?: {
        runid?: string;
        stepid?: string;
        since?: number;
        until?: number;
    }): Promise<{
        prompttokens: number;
        completiontokens: number;
        totaltokens: number;
        cost: number;
        calls: number;
    }>;
    /** Stores one model drafted plan for review and audit; newer drafts read first. */
    addplandraft(draft: plandraft): Promise<void>;
    /** Replaces the stored draft set after one review decision. */
    setplandrafts(drafts: plandraft[]): Promise<void>;
    /** Returns every stored model drafted plan, newest first. */
    getplandrafts(): Promise<plandraft[]>;
    /** Stores one replan record for the fresh review and the audit history; newer replans read first. */
    addreplan(replan: replanrecord): Promise<void>;
    /** Replaces the stored replan set after one fresh review decision. */
    setreplans(replans: replanrecord[]): Promise<void>;
    /** Returns every stored replan record, newest first. */
    getreplans(): Promise<replanrecord[]>;
    /** Stores one reflection note of an executed step under the recent note window of 100 records. */
    addreflectnote(note: reflectnote): Promise<void>;
    /** Returns the stored reflection notes, newest first. */
    getreflectnotes(): Promise<reflectnote[]>;
    /** Replaces the stored prompt template library after one save or removal; every version with its change notes stays stored. */
    setprompttemplates(templates: prompttemplate[]): Promise<void>;
    /** Returns the stored prompt template library with every version, newest first. */
    getprompttemplates(): Promise<prompttemplate[]>;
    /** Returns the stored cost budget of the runs; the run scoped budget wins over the shared one when both exist. */
    getcostbudget(runid?: string): Promise<costbudget | undefined>;
    /** Stores one cost budget; a run scoped budget replaces the earlier budget of its run while the shared budget replaces the shared one. */
    setcostbudget(budget: costbudget): Promise<void>;
    /** Returns the latest parsed natural language command with its intent badge payload. */
    getcommandparse(): Promise<commandparse | undefined>;
    /** Stores the latest parsed natural language command. */
    setcommandparse(parse: commandparse): Promise<void>;
    /** Returns the recent guard refusal notices of invalid or refused model output, newest first under a window of 50. */
    getguardnotices(): Promise<modeloutput[]>;
    /** Records one guard refusal notice for the panel; the verdict reason explains the parse failure and its retries. */
    addguardnotice(output: modeloutput): Promise<void>;
    /** Returns every user configured provider gateway of the 1.1.83 family: the base url, the path prefix, the enable toggle, the consent stamp and the key reference — the key material stays behind the vault seam, never inside these records. */
    getgatewayconfigs(): Promise<baseurlconfig[]>;
    /** Replaces the stored provider gateway configs after one save, consent or removal. */
    setgatewayconfigs(configs: baseurlconfig[]): Promise<void>;
    /** Returns the cached model lists of the provider gateways, one record per provider. */
    getgatewaymodelcaches(): Promise<modelcacherecord[]>;
    /** Replaces one provider model cache record, keeping every other provider record untouched. */
    setgatewaymodelcache(record: modelcacherecord): Promise<void>;
    /** Returns the stored gateway chat exchanges, newest first under a window of 20; the states carry tokens and errors only, never key material. */
    getgatewaychats(): Promise<gatewaychatstate[]>;
    /** Stores one gateway chat exchange, newest first under a window of 20; a stored requestid replaces its earlier state so the stream cursor polls one record. */
    addgatewaychat(state: gatewaychatstate): Promise<void>;
    /** Removes one gateway chat exchange by its request id; the cancel control drops the record the panel stops polling. */
    removegatewaychat(requestid: string): Promise<void>;
    /** Returns the user configured model cache refresh window in milliseconds; an absent window keeps every cache fresh forever because the window stays a user choice. */
    getgatewaycachewindow(): Promise<number | undefined>;
    /** Stores the user configured model cache refresh window in milliseconds. */
    setgatewaycachewindow(window: number): Promise<void>;
    /** Returns every agent identity of the 1.1.58 swarm with its tab, role, depth, budget and scope. */
    getagents(): Promise<agentidentity[]>;
    /** Replaces the stored agent identities after one register, assign, bind, spawn or lifecycle change. */
    setagents(agents: agentidentity[]): Promise<void>;
    /** Returns the shared task queue of the swarm with its lanes, priorities, items and claims. */
    gettaskqueue(): Promise<taskqueue | undefined>;
    /** Replaces the stored task queue after one enqueue, claim, steal, complete, cancel or requeue. */
    settaskqueue(queue: taskqueue): Promise<void>;
    /** Returns every agent mailbox; retention is a user setting and an absent setting keeps every message. */
    getmailboxes(): Promise<agentmailbox[]>;
    /** Replaces the stored mailboxes after one send or receive, applying the user configured mailbox retention over the stored inbox and outbox messages. */
    setmailboxes(mailboxes: agentmailbox[]): Promise<void>;
    /** Returns the blackboard shared memory of the swarm with its sections and entries. */
    getblackboard(): Promise<blackboard | undefined>;
    /** Replaces the stored blackboard after one post, retire or sweep. */
    setblackboard(board: blackboard): Promise<void>;
    /** Returns the killswitch state of the swarm. */
    getkillswitch(): Promise<killswitch | undefined>;
    /** Stores the killswitch state after one engage or disarm. */
    setkillswitch(state: killswitch): Promise<void>;
    /** Records one spawn of a sub agent with its depth for the audit history, newest first. */
    addspawnrecord(record: spawnrecord): Promise<void>;
    /** Returns the spawn and depth history of the swarm, newest first. */
    getspawnrecords(): Promise<spawnrecord[]>;
    /** Records one agent lifecycle event notification, newest first under a window of 200. */
    addagentevent(event: agentevent): Promise<void>;
    /** Returns the recorded agent lifecycle events, newest first. */
    getagentevents(): Promise<agentevent[]>;
    /** Replaces the stored per agent usage counters held against the agent budgets. */
    setagentusage(usage: agentusage[]): Promise<void>;
    /** Returns the stored per agent usage counters held against the agent budgets. */
    getagentusage(): Promise<agentusage[]>;
    /** Returns the swarm at a glance: the agents, the tasks by claim state and the message counters read from the stored swarm records. */
    swarmoverview(): Promise<{
        agents: number;
        active: number;
        paused: number;
        stopped: number;
        tasks: number;
        queued: number;
        claimed: number;
        done: number;
        cancelled: number;
        messages: number;
        unread: number;
    }>;
    /** Returns the leader worker topology of the 1.1.59 swarm with its leader, worker, critic and verifier lanes and its worker assignments. */
    gettopology(): Promise<leaderworker | undefined>;
    /** Replaces the stored leader worker topology after one election, assignment, collection or scaling change. */
    settopology(topology: leaderworker): Promise<void>;
    /** Returns the stored planner executor splits of the 1.1.59 swarm with their step reports. */
    getplannersplits(): Promise<plannerexecutor[]>;
    /** Replaces the stored planner executor splits after one split or one executor step report. */
    setplannersplits(splits: plannerexecutor[]): Promise<void>;
    /** Records one critic review of an agent output, newest first. */
    addcriticreview(review: criticreview): Promise<void>;
    /** Returns the recorded critic reviews, newest first. */
    getcriticreviews(): Promise<criticreview[]>;
    /** Records one verifier check of a result claim, newest first. */
    addverifiercheck(check: verifiercheck): Promise<void>;
    /** Returns the recorded verifier checks with their pass and fail outcomes, newest first. */
    getverifierchecks(): Promise<verifiercheck[]>;
    /** Replaces the stored review requests routed between agents after one request, ack, answer or timeout. */
    setreviewrequests(requests: reviewrequest[]): Promise<void>;
    /** Returns the stored review requests routed between agents. */
    getreviewrequests(): Promise<reviewrequest[]>;
    /** Records one tab handoff with its packaged task state and its resumed state. */
    addhandoff(record: handoffrecord): Promise<void>;
    /** Replaces one stored handoff record after its transfer or resume. */
    updatehandoff(record: handoffrecord): Promise<void>;
    /** Returns the handoff log of tab transfers between agents, newest first. */
    gethandoffs(): Promise<handoffrecord[]>;
    /** Replaces the stored resource locks after one acquire, release or expiry sweep. */
    setlocks(locks: resourcelock[]): Promise<void>;
    /** Returns the held resource locks with their holders and expiries. */
    getlocks(): Promise<resourcelock[]>;
    /** Records one conflict scan report of overlapping writes, newest first. */
    addconflictscan(scan: conflictscan): Promise<void>;
    /** Returns the recorded conflict scan reports, newest first. */
    getconflictscans(): Promise<conflictscan[]>;
    /** Stores the merged result report with its mergeentry provenance. */
    setreport(report: resultreport): Promise<void>;
    /** Returns the stored merged result report across agents. */
    getreport(): Promise<resultreport | undefined>;
    /** Records one progressboard snapshot under the user configured retention window; an absent window keeps every snapshot. */
    addboardsnapshot(board: progressboard): Promise<void>;
    /** Returns the stored progressboard snapshots, newest first. */
    getboardsnapshots(): Promise<progressboard[]>;
    /** Records one escalation lifted to the user, newest first. */
    addescalation(escalation: escalationrecord): Promise<void>;
    /** Replaces one stored escalation after its user decision. */
    updateescalation(escalation: escalationrecord): Promise<void>;
    /** Returns the escalations awaiting the user and the decided ones, newest first. */
    getescalations(): Promise<escalationrecord[]>;
    /** Records one consensus round or replaces the stored one after a vote. */
    setconsensusround(round: consensusround): Promise<void>;
    /** Returns the consensus rounds with their votes and quorum states, newest first. */
    getconsensusrounds(): Promise<consensusround[]>;
    /** Appends one action to the interleaved timeline of swarm actions, oldest first under a window of 500. */
    addswarmaction(action: swarmaction): Promise<void>;
    /** Returns the interleaved timeline of swarm actions with the optional agent and kind filters, oldest first. */
    getswarmtimeline(filters?: {
        agentid?: string;
        kind?: string;
        since?: number;
    }): Promise<swarmaction[]>;
    /** Stores one shared cost accounting snapshot of the swarm, newest first. */
    addswarmcost(cost: swarmcost): Promise<void>;
    /** Returns the stored shared cost accounting snapshots of the swarm, newest first. */
    getswarmcosts(): Promise<swarmcost[]>;
    /**
     * Execution environment persistence of the 1.1.60 family.
     * The run state store seals every persisted run state with its sha-256 integrity digest through the storage api (the browser offers no at-rest encryption for its storage areas, so the honest derivation is the integrity seal that makes tampering detectable before any recovery uses the record), scopes every run state per profile so parallel profiles never share it, expires stale run state past the user configured window while the keepalive summaries survive, tracks the storage quota usage of the run state and prunes the oldest finished run states under pressure.
     * The adapter seam keeps every accessor a one line storage delegation so a future worker state backend replaces the adapter only.
     */
    /** Returns the environment grant list of the active session; an absent list keeps the documented default posture. */
    getenvironmentgrants(): Promise<environmentkind[] | undefined>;
    /** Replaces the environment grant list of the active session so the environment grants join the origin grants in the session record. */
    setenvironmentgrants(grants: environmentkind[]): Promise<void>;
    /** Seals and stores the run state of one profile: the payload travels beside its sha-256 digest so a tampered record at rest stays detectable before any recovery uses it. */
    setrunstate(profileid: string, state: runstaterecord): Promise<void>;
    /** Opens the sealed run state of one profile; a missing or tampered seal returns undefined so the recovery never trusts a broken record. */
    getrunstate(profileid: string): Promise<runstaterecord | undefined>;
    /** Removes the run state of one profile from the store and the index: the per profile key takes an empty seal that never opens, so the quota pruning drops the pruned records whole. */
    removerunstate(profileid: string): Promise<void>;
    /** Lists the stored run state records of every profile, oldest update first. */
    listrunstates(): Promise<runstaterecord[]>;
    /** Expires the stale run states past the user configured window: the expired records reduce to their keepalive summaries while an absent window keeps every run state whole. */
    expirerunstates(window: number | undefined, now: number): Promise<runstaterecord[]>;
    /** Records one worker spawn or teardown event with its provenance beside the step outcomes. */
    addworkerevent(event: workerevent): Promise<void>;
    /** Returns the recorded worker spawn and teardown events, newest first. */
    getworkerevents(): Promise<workerevent[]>;
    /** Records one spawned offscreen document with its reasons and justification in the registry. */
    addoffscreenentry(entry: offscreenregistryentry): Promise<void>;
    /** Replaces one registry entry after its offscreen document closes. */
    updateoffscreenentry(entry: offscreenregistryentry): Promise<void>;
    /** Returns the offscreen document registry with the reasons and justification of every spawn. */
    getoffscreenentries(): Promise<offscreenregistryentry[]>;
    /** Records one sandbox render with its provenance, source origin and nonce. */
    addsandboxrender(render: sandboxrender): Promise<void>;
    /** Returns the recorded sandbox renders with their provenance, newest first. */
    getsandboxrenders(): Promise<sandboxrender[]>;
    /** Replaces the stored run locks after one acquisition, release or expiry sweep. */
    setrunlocks(locks: runlock[]): Promise<void>;
    /** Returns the held run locks with their sessions, runs and expiries. */
    getrunlocks(): Promise<runlock[]>;
    /** Tracks the storage quota usage of the run state: the last measured bytes stay beside the user configured ceiling so the pruning reads both. */
    trackrunstatequota(used: number): Promise<void>;
    /** Returns the last tracked storage quota usage of the run state with its ceiling when the user configured one. */
    getrunstatequota(): Promise<{
        used: number;
        ceiling?: number;
        trackedat: number;
    } | undefined>;
    /** Exports every stored run state as one single audit record through the runstate export envelope. */
    exportrunstates(): Promise<{
        runs: number;
        urls: number;
        environments: number;
        offloaded: number;
        beats: number;
        exportedat: number;
    }>;
    /**
     * Security part one persistence of the 1.1.61 family.
     * The trust boundary records live here: the per origin automation allowlist scoped per profile workspace with one exact origin per entry, the per site originprofiles with their kind grants and denials, the active consentwindows with their expiry timestamps that expire closed past their boundary, the mid run revokerun events with the halted step ids that stay visible for later consent prompts, the fresh class consents per origin, the mask rules for field shapes per origin, and the sealed immutable run logs with their final hash.
     * The run log store exposes no update or delete path: appends land whole, the seal closes a log with its final hash and the read path verifies the chain before returning a single entry so a broken link refuses the read.
     * The adapter seam keeps every accessor a one line storage delegation so a future append only backend replaces the adapter only; the current storage areas offer no append only hardware, so the honest derivation is the hash chain that makes any rewrite detectable at read time.
     */
    /** Replaces the per origin automation allowlist of the profile workspaces; every entry carries one exact origin with no wildcard expansion. */
    setautomationallowlist(entries: automationallowlistentry[]): Promise<void>;
    /** Returns the per origin automation allowlist entries, oldest grant first. */
    getautomationallowlist(): Promise<automationallowlistentry[]>;
    /** Adds one exact origin to the automation allowlist of a profile workspace; a duplicate origin keeps its first grant. */
    addallowlistorigin(entry: automationallowlistentry): Promise<void>;
    /** Removes one origin from the automation allowlist; the denydefault posture refuses the origin again after the removal. */
    removeallowlistorigin(origin: string, profileid: string): Promise<void>;
    /** Replaces the per site origin profiles with their kind grants and denials; one profile per origin. */
    setoriginprofiles(profiles: originprofile[]): Promise<void>;
    /** Returns the stored per site origin profiles, oldest update first. */
    getoriginprofiles(): Promise<originprofile[]>;
    /** Upserts one origin profile: a profile of the same origin replaces its grants and denials while a new origin joins the list. */
    saveoriginprofile(profile: originprofile): Promise<void>;
    /** Replaces the consent windows; active windows keep their expiry timestamps and closed windows stay for the audit trail. */
    setconsentwindows(windows: consentwindow[]): Promise<void>;
    /** Returns the stored consent windows, newest start first. */
    getconsentwindows(): Promise<consentwindow[]>;
    /** Expires every consent window past its duration boundary: the closed windows keep their records while their grants bind no step anymore. */
    expireconsentwindows(now: number): Promise<consentwindow[]>;
    /** Records one mid run revocation with its halted step ids; the history stays visible for later consent prompts. */
    addrevocation(event: revokerunevent): Promise<void>;
    /** Returns the recorded mid run revocations with their halted step ids, newest first. */
    getrevocations(): Promise<revokerunevent[]>;
    /** Replaces the fresh class consents per origin. */
    setclassconsents(consents: classconsent[]): Promise<void>;
    /** Returns the fresh class consents per origin, newest grant first. */
    getclassconsents(): Promise<classconsent[]>;
    /** Records one fresh class consent per origin; the prompt of one class never widens another class. */
    addclassconsent(consent: classconsent): Promise<void>;
    /** Replaces the mask rules for sensitive field shapes per origin. */
    setmaskrules(rules: maskrule[]): Promise<void>;
    /** Returns the stored mask rules for sensitive field shapes per origin, oldest rule first. */
    getmaskrules(): Promise<maskrule[]>;
    /** Adds one mask rule for field shapes, optionally scoped to one origin. */
    addmaskrule(rule: maskrule): Promise<void>;
    /** Removes one mask rule by its id. */
    removemaskrule(id: string): Promise<void>;
    /** Stores the whole run log of one run: the append lands in one storage transaction so the entries and their chain links persist together. */
    setimmutablelog(log: storedrunlog): Promise<void>;
    /** Returns the stored run log of one run; an absent log returns undefined. */
    getimmutablelog(runid: string): Promise<storedrunlog | undefined>;
    /** Lists the stored run logs, oldest update first, with the sealed logs carrying their final hash. */
    listimmutablelogs(): Promise<storedrunlog[]>;
    /** Stores the run log index entry of one run so the log listing reads every stored log. */
    trackimmutablelog(runid: string): Promise<void>;
    /** Exports the verified log chain of one run for the audit file: the read path verifies the whole hash chain first and a broken link refuses the export with no entries served. */
    exportverifiedrunlog(runid: string): Promise<{
        runid: string;
        entries: number;
        chainvalid: boolean;
        reason: string;
        sealhash?: string;
        sealedat?: number;
        log: immutablelogentry[];
    }>;
    /** Expires the sealed run logs past the user configured retention: the entries reduce to their chain summaries while the seal hash always survives. */
    expireimmutablelogs(retention: number | undefined, now: number): Promise<storedrunlog[]>;
    /**
     * Security part two persistence of the 1.1.62 family.
     * The protections for secrets, messages and money live here: the secretvault metadata with labels and scopes only and never values, scoped per profile workspace; the connectallow entries with their senders shipping empty by default; the ratelimit bucket state per origin and per session; the confirm gates with their resolution events and their human action provenance; the redactshot regions per origin and page template; the phishguard verdicts with their distance scores expiring past their freshness window; the permdiff records of each installed version; the safedefaults applications with their first seen origins; and the deferred command events waiting for their bucket reset.
     * The vault values never touch this seam: only metadata persists while the values stay behind the vault seam the background wires.
     */
    /** Replaces the secretvault metadata of the profile workspaces: labels, scopes, provenance and digests only, never values. */
    setsecretvault(entries: secretvaultentry[]): Promise<void>;
    /** Returns the stored secretvault metadata, oldest record first; the values live behind the vault seam and never persist. */
    getsecretvault(): Promise<secretvaultentry[]>;
    /** Adds one secretvault metadata record scoped to a profile workspace; a duplicate vault id keeps its first record. */
    addsecret(entry: secretvaultentry): Promise<void>;
    /** Removes one secretvault metadata record by its vault id; the background drops the value behind the seam in the same action. */
    removesecret(vaultid: string): Promise<void>;
    /** Stamps the last use of one secretvault record: the metadata notes when the vault last released its value while the value itself stays unrecorded. */
    stampsecretuse(vaultid: string, at: number): Promise<void>;
    /** Replaces the connectallow entries of external senders; the list ships empty by default with user managed entries only. */
    setconnectallow(entries: connectallowentry[]): Promise<void>;
    /** Returns the stored connectallow entries, oldest add first. */
    getconnectallow(): Promise<connectallowentry[]>;
    /** Adds one connectallow entry for an external sender; a duplicate sender id keeps its first entry. */
    addconnectallow(entry: connectallowentry): Promise<void>;
    /** Removes one connectallow entry by its sender id; the origincheck drops the sender again after the removal. */
    removeconnectallow(senderid: string): Promise<void>;
    /** Replaces the ratelimit bucket state per origin and per session: the user configured bounds and windows with their used counts. */
    setratelimitbuckets(buckets: ratelimitbucket[]): Promise<void>;
    /** Returns the stored ratelimit buckets per origin and per session. */
    getratelimitbuckets(): Promise<ratelimitbucket[]>;
    /** Upserts one ratelimit bucket: a bucket of the same origin and session replaces its state while a new pair joins the list. */
    saveratelimitbucket(bucket: ratelimitbucket): Promise<void>;
    /** Removes the ratelimit bucket of one origin and session; the origin runs without a bucket because the bounds stay user choices only. */
    removeratelimitbucket(origin: string, sessionid: string): Promise<void>;
    /** Replaces the confirm gates with their payloads and states; a resolved or refused gate stays terminal for the audit trail. */
    setgates(gates: confirmgate[]): Promise<void>;
    /** Returns the stored confirm gates, newest open first. */
    getgates(): Promise<confirmgate[]>;
    /** Upserts one confirm gate: a gate of the same step keeps its latest record because one gated step carries one live gate. */
    savegate(gate: confirmgate): Promise<void>;
    /** Records one gate resolution event with its human action provenance; the resolution history stays visible for the audit trail. */
    addgateresolution(resolution: gateresolution): Promise<void>;
    /** Returns the recorded gate resolution events with their human action provenance, newest first. */
    getgateresolutions(): Promise<gateresolution[]>;
    /** Replaces the redactshot regions per origin and page template. */
    setredactregions(regions: redactregion[]): Promise<void>;
    /** Returns the stored redactshot regions per origin and page template, oldest rule first. */
    getredactregions(): Promise<redactregion[]>;
    /** Adds one redactshot region, derived from a field shape or drawn by the user. */
    addredactregion(region: redactregion): Promise<void>;
    /** Removes one redactshot region by its id. */
    removeredactregion(id: string): Promise<void>;
    /** Records one phishguard verdict with its distance score; the records stay for the audit trail while the freshness window governs the live set. */
    addphishverdict(verdict: phishverdict): Promise<void>;
    /** Returns the stored phishguard verdicts with their distance scores, newest first. */
    getphishverdicts(): Promise<phishverdict[]>;
    /** Expires the phishguard verdicts past the user configured freshness window: the expired verdicts keep their records for the audit trail while the guard recomputes the next login step. */
    expirephishverdicts(freshness: number | undefined, now: number): Promise<phishverdict[]>;
    /** Records one permdiff between two installed permission versions; the record of each installed update stays for the audit trail. */
    addpermdiff(diff: permdiffrecord): Promise<void>;
    /** Returns the recorded permdiffs of each installed update, newest first. */
    getpermdiffs(): Promise<permdiffrecord[]>;
    /** Stores the last installed permission set the permdiff of the next update compares against. */
    setlastpermissions(permissions: string[], version: string): Promise<void>;
    /** Returns the last installed permission set with its version; an absent record returns undefined. */
    getlastpermissions(): Promise<{
        permissions: string[];
        version: string;
    } | undefined>;
    /** Records one safedefaults application with its first seen origin; the first visit of an unknown origin stays visible. */
    addsafedefaultapplication(application: safedefaultapplication): Promise<void>;
    /** Returns the recorded safedefaults applications with their first seen origins, oldest first. */
    getsafedefaultapplications(): Promise<safedefaultapplication[]>;
    /** Records one deferred command event with the reset time it waits for. */
    adddeferredevent(event: deferredevent): Promise<void>;
    /** Returns the recorded deferred command events, newest first. */
    getdeferredevents(): Promise<deferredevent[]>;
    /** Serves the transparency data of the transparencypage in one read: every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff records of each installed update, the safedefaults applications and the secretvault metadata with labels and scopes only. */
    gettransparencyview(): Promise<{
        allowlist: automationallowlistentry[];
        profiles: originprofile[];
        windows: consentwindow[];
        connectallow: connectallowentry[];
        permdiffs: permdiffrecord[];
        safedefaults: safedefaultapplication[];
        vault: secretvaultentry[];
        gates: confirmgate[];
        resolutions: gateresolution[];
        deferred: deferredevent[];
        phishverdicts: phishverdict[];
    }>;
    /**
     * Session interface persistence of the 1.1.63 family.
     * The five session stores live here, scoped per profile workspace: the sitenotes per origin with sensitive bodies sealed at rest, the append only scratchpad entries per task with their step provenance, the distilled runsummaries per run and origin, the correctionmemory entries per origin and kind captured from plan review, and the consentmemory entries per origin with every grant, denial, expiry and revocation carrying its boundary; beside them the semanticrecall index with fingerprint deduplication answers ranked queries inside the run scope, the incremental historysearch corpus indexes session metadata, notes and summaries as they are written, the errorsurface payloads of failed steps keep their retry hints with the policy verdict, the per tab session references isolate parallel tabs, and the export bundles notes, summaries and corrections as one audit bundle.
     * The recall seam stays documented: the local fingerprint index answers every query today while a future remote recall backend can take the same shapes behind the seam without touching the callers.
     */
    /** Replaces the stored site notes; a sensitive note carries its sealedbody only so the plain body never persists. */
    setsitenotes(notes: sitenote[]): Promise<void>;
    /** Returns the stored site notes, oldest update first. */
    getsitenotes(): Promise<sitenote[]>;
    /** Reads the site notes of one origin only; the read gate keeps the origin inside the session grants. */
    readsitenotes(origin: string): Promise<sitenote[]>;
    /** Writes one site note: a note of the same id keeps its latest edit while a new note joins the store. */
    writesitenote(note: sitenote): Promise<void>;
    /** Removes one site note by its id. */
    removesitenote(id: string): Promise<void>;
    /** Expires the site notes past the user configured window; an absent window keeps every note. */
    expiresitenotes(retention: number | undefined, now: number): Promise<sitenote[]>;
    /** Replaces the stored scratchpad entries per task. */
    setscratchpad(entries: scratchpadentry[]): Promise<void>;
    /** Returns every stored scratchpad entry, newest first. */
    getscratchpadall(): Promise<scratchpadentry[]>;
    /** Appends one scratchpad entry: the pad stays append only so no later write rewrites an earlier entry. */
    appendscratchentry(entry: scratchpadentry): Promise<void>;
    /** Reads the scratchpad of one task session, newest first; entries of another task never cross the boundary. */
    readscratchpad(taskid: string, sessionid: string): Promise<scratchpadentry[]>;
    /** Prunes the scratchpad entries past the user configured window; an absent window keeps every entry. */
    prunescratchentries(window: number | undefined, now: number): Promise<scratchpadentry[]>;
    /** Stores one distilled run summary of a completed run. */
    setrunsummary(summary: runsummary): Promise<void>;
    /** Returns the stored run summary of one run; an absent summary returns undefined. */
    getrunsummary(runid: string): Promise<runsummary | undefined>;
    /** Lists the stored run summaries, oldest distillation first, optionally filtered by origin. */
    listrunsummaries(origin?: string): Promise<runsummary[]>;
    /** Tracks one run in the run summary index so the listing reads every stored summary. */
    trackrunsummary(runid: string): Promise<void>;
    /** Expires the run summaries past the user configured window; an absent window keeps every summary. */
    expirerunsummaries(retention: number | undefined, now: number): Promise<runsummary[]>;
    /** Replaces the semantic recall index with its fingerprint deduplicated entries. */
    setrecallindex(index: recallindexentry[]): Promise<void>;
    /** Returns the stored semantic recall index entries, newest first. */
    getrecallindex(): Promise<recallindexentry[]>;
    /** Adds one recall index entry with fingerprint deduplication: a repeated extraction keeps its first entry. */
    addrecallentry(entry: recallindexentry): Promise<void>;
    /** Answers one semantic recall query across the extraction stores: the local index ranks by text similarity inside the run scope and returns the provenance of every match. */
    semanticrecall(query: recallquery, scope: {
        origins: string[];
    }, rank: (index: recallindexentry[], query: recallquery, scope: {
        origins: string[];
    }) => recallmatch[]): Promise<recallmatch[]>;
    /** Expires the recall index entries past the user configured window; the extraction records themselves stay for the audit trail. */
    expirerecallentries(window: number | undefined, now: number): Promise<recallindexentry[]>;
    /** Replaces the stored correction memory entries per origin and kind. */
    setcorrections(corrections: correctionentry[]): Promise<void>;
    /** Returns the stored correction memory entries, newest first, optionally filtered by origin and kind. */
    getcorrections(filter?: {
        origin?: string;
        kind?: string;
    }): Promise<correctionentry[]>;
    /** Records one correction memory entry captured from a plan review edit or rejection. */
    addcorrection(entry: correctionentry): Promise<void>;
    /** Expires the correction memory entries past the user configured window; an absent window keeps every correction. */
    expirecorrectionentries(window: number | undefined, now: number): Promise<correctionentry[]>;
    /** Replaces the stored consent memory entries per origin. */
    setconsentmemory(entries: consentmemoryentry[]): Promise<void>;
    /** Returns the stored consent memory entries, newest first, optionally filtered by origin. */
    getconsentmemory(origin?: string): Promise<consentmemoryentry[]>;
    /** Records one consent memory entry per origin: every grant, denial, expiry and revocation lands with its boundary and kinds. */
    addconsentmemoryentry(entry: consentmemoryentry): Promise<void>;
    /** Replaces the stored error surface payloads of failed steps. */
    seterrorsurfaces(surfaces: errorsurface[]): Promise<void>;
    /** Returns the stored error surface payloads, newest first, optionally filtered by step. */
    geterrorsurfaces(stepid?: string): Promise<errorsurface[]>;
    /** Records one error surface payload of a failed step with its retry hint and the policy verdict. */
    adderrorsurface(surface: errorsurface): Promise<void>;
    /** Replaces the incremental history search corpus of session metadata, notes and run summaries. */
    sethistoryindex(corpus: historyindexentry[]): Promise<void>;
    /** Returns the incremental history search corpus, newest entry first. */
    gethistoryindex(): Promise<historyindexentry[]>;
    /** Adds one corpus entry to the incremental history index on each store write. */
    addhistoryentry(entry: historyindexentry): Promise<void>;
    /** Answers one history search query against the incremental corpus with the matched terms highlighted. */
    historysearch(query: historysearchquery, search: (corpus: historyindexentry[], query: historysearchquery) => historysearchhit[]): Promise<historysearchhit[]>;
    /** Stores one per tab session reference so parallel tabs never collide inside the session stores. */
    settabsession(ref: tabsessionref): Promise<void>;
    /** Returns the per tab session reference of one tab; an absent reference returns undefined. */
    gettabsession(tabid: number): Promise<tabsessionref | undefined>;
    /** Lists every per tab session reference so the sessiongrid reads the per tab lock state of concurrent sessions. */
    listtabsessions(): Promise<tabsessionref[]>;
    /** Tracks one tab in the per tab session index so the listing reads every isolated reference. */
    tracktabsession(tabid: number): Promise<void>;
    /** Exports the site notes, the run summaries and the correction memory as one audit bundle: sensitive note bodies stay sealed in the export. */
    exportsessionbundle(exportedat: number): Promise<{
        kind: "sessionbundle";
        notes: sitenote[];
        summaries: runsummary[];
        corrections: correctionentry[];
        exportedat: number;
    }>;
    /**
     * Interface surface stores of the 1.1.64 family live here, scoped per profile workspace: the commandpalette usage counts the recent first ranking reads, the taskinput history of natural language goals, the onboarding completion state, the per surface layout preferences, the logstream filter preferences and the stepapprove resolution history per origin.
     */
    /** Returns every commandpalette usage record so the ranking lifts the recent commands first. */
    getpaletteusage(): Promise<paletteuserecord[]>;
    /** Replaces the commandpalette usage records after one use: the count grows and the last use time moves so the ranking reads both. */
    setpaletteusage(records: paletteuserecord[]): Promise<void>;
    /** Returns the stored taskinput history, newest first. */
    gettaskinputs(): Promise<taskinputsubmission[]>;
    /** Adds one taskinput submission to the per profile history; the retention window stays a user setting. */
    addtaskinput(entry: taskinputsubmission): Promise<void>;
    /** Returns the onboarding completion state; an absent state means the walkthrough never ran. */
    getonboardingstate(): Promise<onboardingstate | undefined>;
    /** Stores the onboarding completion state; a done walkthrough never runs again on its own. */
    setonboardingstate(state: onboardingstate): Promise<void>;
    /** Returns the version one sunset notice record of the negotiation banner; an absent record means no version one client declared below the supported floor this browser session. */
    getv1sunset(): Promise<v1sunsetstate | undefined>;
    /** Stores the version one sunset notice record; the dismissal resets it for the session while a later browser session marks it again on the next refusal. */
    setv1sunset(state: v1sunsetstate): Promise<void>;
    /** Returns the version one migration prompt record; an absent record means no affected updater met the one time prompt yet. */
    getmigrationprompt(): Promise<migrationpromptstate | undefined>;
    /** Stores the version one migration prompt record; the persistent migrationpromptdismissed flag keeps a dismissed prompt from ever appearing again. */
    setmigrationprompt(state: migrationpromptstate): Promise<void>;
    /** Returns the layout preferences of one surface; an absent preference set returns undefined. */
    getsurfacelayout(surface: surfacelayout["surface"]): Promise<surfacelayout | undefined>;
    /** Stores the layout preferences of one surface, scoped per profile workspace. */
    setsurfacelayout(layout: surfacelayout): Promise<void>;
    /** Returns the stored logstream filter preferences of the live view. */
    getlogstreamfilters(): Promise<logstreamfilter | undefined>;
    /** Stores the logstream filter preferences of the live view. */
    setlogstreamfilters(filter: logstreamfilter): Promise<void>;
    /** Returns every stored stepapprove resolution, newest first, with its human provenance. */
    getstepapproveresolutions(): Promise<stepapproveresolution[]>;
    /** Records one stepapprove resolution in the per origin history. */
    addstepapproveresolution(resolution: stepapproveresolution): Promise<void>;
    /**
     * Interface surface stores of the 1.1.65 family live here, scoped per profile workspace: the siteprofiles with the per site interface preferences, the shortcutkeys bindings and the theme preference per profile, the recenttray entries with their configurable depth and the notification consent and preference per profile.
     */
    /** Returns the siteprofile of one origin; an absent profile keeps the global interface preferences. */
    getsiteprofile(origin: string): Promise<siteprofile | undefined>;
    /** Stores the siteprofile of one origin with its theme, shortcutkeys and default view; the profile never adjusts a policy gate. */
    setsiteprofile(profile: siteprofile): Promise<void>;
    /** Returns every stored siteprofile keyed by origin. */
    listsiteprofiles(): Promise<siteprofile[]>;
    /** Stores every siteprofile keyed by origin so the list view reads them in one call. */
    setsiteprofiles(profiles: siteprofile[]): Promise<void>;
    /** Returns the stored shortcutkeys bindings of the profile; an absent set keeps the shipped editable defaults. */
    getshortcutbindings(): Promise<shortcutbinding[]>;
    /** Stores the shortcutkeys bindings the user edited in the optionspage. */
    setshortcutbindings(bindings: shortcutbinding[]): Promise<void>;
    /** Returns the stored darklight theme preference of the profile; an absent preference follows the os preference alone. */
    getthemepreference(): Promise<"dark" | "light" | "system" | undefined>;
    /** Stores the darklight theme preference of the profile with its manual override. */
    setthemepreference(preference: "dark" | "light" | "system"): Promise<void>;
    /** Returns the recenttray entries, newest first, with their resume and reopen offers. */
    getrecenttray(): Promise<recenttrayentry[]>;
    /** Adds one recenttray entry with the user configured depth; an absent depth keeps every run. */
    addrecenttrayentry(entry: recenttrayentry): Promise<void>;
    /** Returns the notification consent and preference of the profile; an absent record keeps the notifications content free and on. */
    getnotificationprefs(): Promise<{
        consent: boolean;
        enabled: boolean;
    } | undefined>;
    /** Stores the notification consent and preference of the profile; the content consent gates every page content bearing body. */
    setnotificationprefs(prefs: {
        consent: boolean;
        enabled: boolean;
    }): Promise<void>;
    /** Returns the notification payloads the surface history keeps for the user to open after a do not disturb quiet. */
    getnotificationhistory(): Promise<notificationpayload[]>;
    /** Records one notification payload in the history so its deep link stays reachable while the notifications permission stays outside the manifest. */
    addnotificationhistory(payload: notificationpayload): Promise<void>;
    /**
     * Ecosystem stores of the 1.1.66 family live here, scoped per profile workspace: the flowlibrary entries with their manifest digests and provenance, the library install and removal events, the syncbridge hooks with their conflict records, the attentionfeed entries with their configurable retention, the runreplay cursors per viewed run, the outputcompare sessions with their metric results and the background run queue state for restart recovery.
     * The flowlibrary store deduplicates entries by manifest digest, every entry carries its publisher provenance, and the manifest list exports for audit; the memory adapter seam stays the documented marketplace backend boundary because a future remote registry replaces the adapter only.
     */
    /** Returns every flowlibrary entry of the profile workspace, newest first. */
    getflowlibrary(): Promise<flowlibraryentry[]>;
    /** Replaces the flowlibrary entries of the profile workspace. */
    setflowlibrary(entries: flowlibraryentry[]): Promise<void>;
    /** Adds one flowlibrary entry deduplicated by manifest digest: an entry whose digest already exists replaces its predecessor while its provenance keeps both records. */
    addlibraryentry(entry: flowlibraryentry): Promise<flowlibraryentry[]>;
    /** Removes one flowlibrary entry by its id while the library events keep their record for the audit trail. */
    removelibraryentry(entryid: string): Promise<void>;
    /** Returns every library install, update and removal event, newest first. */
    getlibraryevents(): Promise<libraryevent[]>;
    /** Records one library lifecycle event beside the flowlibrary store. */
    addlibraryevent(event: libraryevent): Promise<void>;
    /** Exports the manifest list of the flowlibrary for audit: one row per entry with its digest, publisher, version, state and provenance and no step payload. */
    exportlibrarymanifests(): Promise<Array<{
        id: string;
        title: string;
        publisher: string;
        version: string;
        digest: string;
        state: string;
        provenance: string;
        addedat: number;
    }>>;
    /** Returns every syncbridge hook of the profile workspace; every hook keeps its explicit opt in with no default on. */
    getsyncbridgehooks(): Promise<syncbridgehook[]>;
    /** Replaces the syncbridge hooks of the profile workspace. */
    setsyncbridgehooks(hooks: syncbridgehook[]): Promise<void>;
    /** Returns every syncbridge conflict record, newest first, with both versions instead of a silent overwrite. */
    getsyncbridgeconflicts(): Promise<syncbridgeconflict[]>;
    /** Records one syncbridge conflict with both manifest versions. */
    addsyncbridgeconflict(conflict: syncbridgeconflict): Promise<void>;
    /** Resolves one syncbridge conflict by its id with the resolution the user picked; one conflict resolves exactly once. */
    resolvesyncbridgeconflict(id: string, resolution: "local" | "remote" | "merge", now: number): Promise<syncbridgeconflict[]>;
    /** Returns every attentionfeed entry, newest first, with its cause, refs and deep link. */
    getattentionentries(): Promise<attentionentry[]>;
    /** Records one attentionfeed entry deduplicated by its cause, run and gate refs while the retention window stays a user setting. */
    addattentionentry(entry: attentionentry): Promise<void>;
    /** Dismisses one attentionfeed entry by its id: the dismissal removes the feed row only while the waiting cause keeps its own resolution path. */
    dismissattentionentry(id: string): Promise<attentionentry[]>;
    /** Prunes the attentionfeed entries past their retention window; an absent window keeps every entry while the pruned ids return for the audit note. */
    pruneattentionentries(now: number): Promise<{
        kept: attentionentry[];
        pruned: string[];
    }>;
    /** Returns the runreplay cursors per viewed run so a reopened replay stands where the viewer left it. */
    getreplaycursors(): Promise<Record<string, {
        cursor: number;
        playing: boolean;
    }>>;
    /** Stores one runreplay cursor for its viewed run. */
    setreplaycursor(runid: string, cursor: {
        cursor: number;
        playing: boolean;
    }): Promise<void>;
    /** Returns every outputcompare session with its metric results, newest first. */
    getcomparesessions(): Promise<outputcomparesession[]>;
    /** Records one outputcompare session with the metric set it used. */
    addcomparesession(session: outputcomparesession): Promise<void>;
    /** Returns the background run queue state for restart recovery: every entry with its state and its keepalive hold. */
    getbackgroundqueue(): Promise<backgroundqueueentry[]>;
    /** Replaces the background run queue state after every transition so the restart recovery reads it in one call. */
    setbackgroundqueue(queue: backgroundqueueentry[]): Promise<void>;
    /** Returns the selcache state of one run: the generation, the cached entries and the invalidation trail the 1.1.68 family keeps per run. */
    getselcachestate(runid: string): Promise<selcachestate | undefined>;
    /** Stores the selcache state of one run; every mutation batch advances the generation while a navigation drops the cache wholesale. */
    setselcachestate(state: selcachestate): Promise<void>;
    /** Prunes the selcache entries of one run at run end; the invalidation trail stays for the audit while no entry outlives its run. */
    pruneselcache(runid: string): Promise<void>;
    /** Returns the incrsnapshot base refs per run the delta engine computes against. */
    getsnapshotbases(): Promise<Array<{
        id: string;
        runid: string;
        ref: string;
        at: number;
    }>>;
    /** Stores one incrsnapshot base ref record for its run so every later delta of the run references it. */
    addsnapshotbase(base: {
        id: string;
        runid: string;
        ref: string;
        at: number;
    }): Promise<void>;
    /** Prunes the incrsnapshot base refs of one run at run end; the deltas of the run end with it. */
    prunesnapshotbases(runid: string): Promise<void>;
    /** Stores one computed incrsnapshot delta of a run beside its base so the executor skips recomputation on an empty delta. */
    addsnapshotdelta(delta: incrsnapshotdelta): Promise<void>;
    /** Returns the stored incrsnapshot delta of one run and base ref, when the run computed one. */
    getsnapshotdelta(runid: string, baseref: string): Promise<incrsnapshotdelta | undefined>;
    /** Returns the chunkextract cursors per table so an interrupted big table extraction resumes from its cursor. */
    getchunkcursors(): Promise<Record<string, chunkextractcursor>>;
    /** Stores one chunkextract cursor for its table so the next window resumes where the last window stopped. */
    setchunkcursor(tableid: string, cursor: chunkextractcursor): Promise<void>;
    /** Clears one chunkextract cursor once its table completes; the merged windows stay in the datagrid. */
    clearchunkcursor(tableid: string): Promise<void>;
    /** Returns the perf records of the profile workspace, newest first, for the run footers and the perf summaries. */
    getperfrecords(): Promise<perfrecord[]>;
    /** Records one perf record per step for profiling; the records stay inside the user configured retention window with their provenance attached. */
    addperfrecord(record: perfrecord): Promise<void>;
    /** Prunes the perf records past the user configured retention window; an absent window keeps every record. */
    pruneperfrecords(retention: number | undefined, now: number): Promise<{
        kept: perfrecord[];
        pruned: number;
    }>;
    /** Returns the lazymods load telemetry records for startup analysis, newest first. */
    getlazyloadrecords(): Promise<lazyloadrecord[]>;
    /** Records one lazymods load telemetry record: which module loaded, why, and how long the resolution took. */
    addlazyloadrecord(record: lazyloadrecord): Promise<void>;
    /** Returns the recorded worker queue depth samples over time for tuning. */
    getqueuedepths(): Promise<queuedepthsample[]>;
    /** Records one worker queue depth sample: the pending parse tasks and the deferred tasks the backpressure held at one moment. */
    recordqueuedepth(sample: queuedepthsample): Promise<void>;
    /** Returns the virtlist height maps per surface so reopened surfaces reuse their measured row heights. */
    getheightmaps(): Promise<Array<{
        surface: string;
        heights: Record<string, number>;
        at: number;
    }>>;
    /** Stores one virtlist height map for its surface; the measured row heights stay for the next open of the surface. */
    setheightmap(record: {
        surface: string;
        heights: Record<string, number>;
        at: number;
    }): Promise<void>;
    /**
     * The perf metrics seam of the 1.1.68 family: today every perf record, queue depth sample and lazy load telemetry record stays inside the per profile workspace of the local adapter, and the seam keeps the record and bundle shapes stable so a reviewed remote metrics backend can take the exports later without touching the callers.
     * Exports the perf records of one run as a single audit bundle with its summary and its provenance attached.
     */
    exportperfbundle(runid: string): Promise<{
        runid: string;
        records: perfrecord[];
    }>;
    /** Returns the domain lanes of one batch run the 1.1.69 family schedules its concurrency slots through. */
    getdomainlanes(runid: string): Promise<domainlane[]>;
    /** Stores the domain lanes of one batch run; every lane runs at most its user chosen slots while its overflow queues. */
    setdomainlanes(runid: string, lanes: domainlane[]): Promise<void>;
    /** Returns the runbudget records of the profile workspace, newest first. */
    getrunbudgets(): Promise<runbudgetrecord[]>;
    /** Records one runbudget record of a run: the step usage against the user budget beside the memory pressure the worker telemetry reported. */
    addrunbudget(record: runbudgetrecord): Promise<void>;
    /** Returns the budgetalerts of the profile workspace, newest first, with their thresholds and severity levels. */
    getbudgetalerts(): Promise<budgetalert[]>;
    /** Records one budgetalert of a run; the critical alert pauses the run pending a user choice. */
    addbudgetalert(alert: budgetalert): Promise<void>;
    /** Returns the timeoutcancel events of the profile workspace, newest first, beside their immutable log entries. */
    gettimeoutevents(): Promise<timeoutcancelevent[]>;
    /** Records one timeoutcancel event: the aborted step, its user bound and its logged cancel entry beside the step outcome. */
    addtimeoutevent(event: timeoutcancelevent): Promise<void>;
    /** Returns the tabsuspend states per run so a restore brings the suspended tab back before the step that needs it. */
    getsuspendstates(): Promise<tabsuspendstate[]>;
    /** Stores one tabsuspend state of a run; the run state stays preserved across the suspend and restore. */
    setsuspendstate(state: tabsuspendstate): Promise<void>;
    /** Clears one tabsuspend state once its tab restored before the step that needed it. */
    clearsuspendstate(runid: string): Promise<void>;
    /** Returns the runcache entries of every run keyed by their resource digests. */
    getruncache(): Promise<runcacheentry[]>;
    /** Stores one runcache entry of a run keyed by its digest; a repeat fetch of the same run serves from the entry. */
    addruncacheentry(entry: runcacheentry): Promise<void>;
    /** Sweeps the runcache entries of one run at run end; the pinned entries of the user profile cache survive. */
    sweepruncache(runid: string, pin: boolean): Promise<{
        cleared: number;
    }>;
    /** Returns the efficientresume checkpoints of one run so a restart skips its completed steps. */
    getresumepoints(runid: string): Promise<resumepoint[]>;
    /** Stores one efficientresume checkpoint of a run at a step boundary with its cursor and page digest. */
    addresumepoint(point: resumepoint): Promise<void>;
    /** Clears the efficientresume checkpoints of one run at run end. */
    cleareresumepoints(runid: string): Promise<void>;
    /** Returns the selectorprofile stats of the profile workspace per selector. */
    getselectorprofiles(): Promise<selectorstats[]>;
    /** Stores one selectorprofile stat; the flagged selectors report above the user latency threshold and never refuse. */
    setselectorprofile(stats: selectorstats): Promise<void>;
    /** Returns the steptrace spans of one run for the timeline view and the trace file export. */
    getsteptrace(runid: string): Promise<steptracespan[]>;
    /** Stores one steptrace span of a run; the spans nest per step and per worker task through their parent refs. */
    addsteptracespan(span: steptracespan): Promise<void>;
    /** Clears the steptrace spans of one run; the exported trace files keep their events. */
    clearsteptrace(runid: string): Promise<void>;
    /** Returns the startupmeter samples of the profile workspace, newest first, for the cold start view. */
    getstartupsamples(): Promise<startupsample[]>;
    /** Records one startupmeter sample: the cold start duration from the startup event to ready with the lazymods budget it spent. */
    addstartupsample(sample: startupsample): Promise<void>;
    /** Returns the slowmo replay sessions of the profile workspace, newest first. */
    getslomosessions(): Promise<slowmosession[]>;
    /** Stores one slowmo replay session; the pauses link to their steptrace spans for inspection. */
    setslomosession(session: slowmosession): Promise<void>;
    /** Returns the sessionreuse grants of the profile workspace with their consent prompts. */
    getsessionreusegrants(): Promise<sessionreusegrant[]>;
    /** Stores one sessionreuse grant; the authenticated profile attaches to a run only through its per profile consent prompt. */
    addsessionreusegrant(grant: sessionreusegrant): Promise<void>;
    /** Returns the artifactcompress records of the profile workspace for the at rest codec view. */
    getartifactcompress(): Promise<artifactcompressrecord[]>;
    /** Stores one artifactcompress record: the codec of the stored artifact with its lazy read flag. */
    addartifactcompress(record: artifactcompressrecord): Promise<void>;
    /** Returns the run lifecycle record of one run id of the 1.1.70 resilience family. */
    getrunrecord(runid: string): Promise<runrecord | undefined>;
    /** Persists one run lifecycle record; the run state survives every service worker restart through the adapter. */
    setrunrecord(record: runrecord): Promise<void>;
    /** Returns every stored run record by recency, newest first. */
    listruns(): Promise<runrecord[]>;
    /** Returns the latest checkpoint of one run; a run without a checkpoint carries none. */
    getcheckpoint(runid: string): Promise<checkpointrecord | undefined>;
    /** Persists the latest checkpoint of one run; every newer checkpoint replaces the stored one. */
    setcheckpoint(record: checkpointrecord): Promise<void>;
    /** Returns the offlinequeue of approved plans waiting for connectivity; the queue survives every restart through the adapter. */
    getqueue(): Promise<queuedtask[]>;
    /** Persists the offlinequeue; the replay drains it in sequence order once connectivity returns. */
    setqueue(queue: queuedtask[]): Promise<void>;
    /** Returns the latest heartbeat record of one run. */
    getheartbeat(runid: string): Promise<heartbeatrecord | undefined>;
    /** Persists the latest heartbeat record of one run; every beat replaces the stored one. */
    setheartbeat(record: heartbeatrecord): Promise<void>;
    /** Records one rollback item of a failed or cancelled run; the compensating steps stay for the audit trail. */
    addrollback(item: rollbackitem): Promise<void>;
    /** Returns the rollback items of one run, newest first; a run without a rollback carries none. */
    listrollbacks(runid: string): Promise<rollbackitem[]>;
    /** Returns the user configured heartbeat staleness window; an absent window keeps the documented roadmap default because the window stays a user choice. */
    getheartbeatwindow(): Promise<number | undefined>;
    /** Persists the user configured heartbeat staleness window; the zombiecheck reads it with no code ceiling. */
    setheartbeatwindow(window: number): Promise<void>;
    /** Returns the user configured offline queue depth; an absent depth keeps the queue unbounded because the depth stays a user choice. */
    getqueuedepthsetting(): Promise<number | undefined>;
    /** Persists the user configured offline queue depth; the depth reports and never refuses a queued plan. */
    setqueuedepthsetting(depth: number): Promise<void>;
    /** Prunes the failed and reaped run records past the user configured retention window; every run of another state stays and an absent window keeps every failed run for the audit trail. */
    pruneruns(retention: number | undefined, now: number): Promise<{
        kept: runrecord[];
        pruned: string[];
    }>;
    /** Returns the idempotencykeys one run already executed so replays deduplicate on them. */
    getexecutedkeys(runid: string): Promise<string[]>;
    /** Records one executed idempotencykey of a run; a replay of the same key skips the duplicate. */
    addexecutedkey(runid: string, key: string): Promise<void>;
    /** Returns the urlhistory of one run: one urlvisit per completed navigation with consecutive duplicates folded, scoped per run and never merged across runs. */
    getvisits(runid: string): Promise<urlvisit[]>;
    /** Persists the urlhistory of one run; the visits survive every service worker restart through the adapter. */
    setvisits(runid: string, visits: urlvisit[]): Promise<void>;
    /** Returns the runtimeline stream of one run: the merged step results, audit events and url visits in their timestamp order. */
    getruntimeline(runid: string): Promise<runtimelineevent[]>;
    /** Persists the runtimeline stream of one run; the timeline view and the audit export read the same stream. */
    setruntimeline(runid: string, events: runtimelineevent[]): Promise<void>;
    /** Appends one runtimeline event to the stream of its run without reading the whole stream back. */
    appendtimelineevent(event: runtimelineevent): Promise<void>;
    /** Returns the sessionlock of one session; a session without a lock carries none. */
    getlock(sessionid: string): Promise<lockrecord | undefined>;
    /** Persists the sessionlock of one session; every newer lock replaces the stored one and the lock survives every restart. */
    setlock(lock: lockrecord): Promise<void>;
    /** Clears the sessionlock of one session on completion, failure or cancel; the next reviewed run may acquire it again. */
    clearlock(sessionid: string): Promise<void>;
    /** Returns every stored sessionlock; the startup pass reads them to expire the abandoned ones. */
    listlocks(): Promise<lockrecord[]>;
    /** Returns the isolated tabstate of one tabid; a tab without an isolated namespace carries none. */
    gettabstate(tabid: number): Promise<tabstate | undefined>;
    /** Stores the isolated tabstate of one tabid: the namespace, its copied config snapshot and the run it serves. */
    settabstate(state: tabstate): Promise<void>;
    /** Returns every stored memory item of the profile workspace wrapped with its provenance record. */
    getmemoryitems(): Promise<memoryitem[]>;
    /** Stores one memory item wrapped with its provenance; the stored value encrypts at rest when the item carries its encrypted flag while the derived key itself never persists. */
    setmemoryitem(item: memoryitem): Promise<void>;
    /** Removes one memory item from the store; the purge keeps its summary and its provenance for the audit trail. */
    removememoryitems(keys: string[]): Promise<void>;
    /** Returns the user configured expiryrules of the memory workspace; an absent list keeps every item unexpired. */
    getexpiry(): Promise<expiryrule[]>;
    /** Persists the user configured expiryrules; every lifetime stays the user's choice with no forced ceiling. */
    setexpiry(rules: expiryrule[]): Promise<void>;
    /** Returns the quotareport of the last quotawatch pass; a fresh workspace carries none. */
    getquotareport(): Promise<quotareport | undefined>;
    /** Persists the quotareport after each quotawatch pass; the cleanup candidates stay ranked for the next pass. */
    setquotareport(report: quotareport): Promise<void>;
    /** Returns the at rest encryption flag of the memory workspace; the derived key never persists beside it. */
    getencryptrest(): Promise<boolean>;
    /** Persists the at rest encryption flag of the memory workspace; the secret entry stays a consent prompt and the key stays in memory for the pass alone. */
    setencryptrest(enabled: boolean): Promise<void>;
    /** Records one purge summary of the expirememory pass; the summary and the provenance of every purged item stay for the audit trail. */
    addpurgesummary(summary: {
        key: string;
        summary: string;
        provenance: memoryprovenance;
        at: number;
    }): Promise<void>;
    /** Returns the purge summaries of the expirememory passes, newest first; the values left while their provenance stays. */
    listpurgesummaries(): Promise<Array<{
        key: string;
        summary: string;
        provenance: memoryprovenance;
        at: number;
    }>>;
    /** Returns the timestamp of the last expirememory pass; the interval pass reads it to decide whether the user interval passed. */
    getlastexpirepass(): Promise<number | undefined>;
    /** Persists the timestamp of one expirememory pass. */
    setlastexpirepass(at: number): Promise<void>;
    /** Returns one fleet agentrecord of the 1.1.72 family by its id; an unknown agent carries none. */
    getagent(agentid: string): Promise<agentrecord | undefined>;
    /** Persists one fleet agentrecord; every newer record replaces the stored one and the registry survives every restart. */
    setagent(record: agentrecord): Promise<void>;
    /** Returns the fleet registry with its names, roles, origins and control states; the sidepanel and the protocol boundary read the same list. */
    listagents(): Promise<agentrecord[]>;
    /** Returns the budgetstate of one agent; an agent without a granted budget carries none. */
    getbudget(agentid: string): Promise<budgetstate | undefined>;
    /** Returns the fleet scope of one agent; an agent without a configured scope stays unbounded inside the session grants. */
    getagentscope(agentid: string): Promise<agentscope | undefined>;
    /** Persists the fleet scope of one agent; the intersection result with the session grants stays beside the registry. */
    setagentscope(scope: agentscope): Promise<void>;
    /** Persists the budgetstate of one agent; every spend updates the stored state and every ceiling stays the user's choice. */
    setbudget(state: budgetstate): Promise<void>;
    /** Returns every stored fleet review record with the open ones first; the verdict controls read the same records. */
    getreviews(): Promise<reviewrecord[]>;
    /** Persists one fleet review record with the reviewer verdict recorded beside the original output. */
    setreview(record: reviewrecord): Promise<void>;
    /** Returns the runreplay captures of one agent, newest first; the audit view and the reconstruction read the same captures. */
    getreplays(agentid: string): Promise<replayrecord[]>;
    /** Persists one runreplay capture per agent under the user configured replayretention window; an absent window keeps every capture of every agent. */
    setreplay(record: replayrecord, retention?: number): Promise<void>;
    /** Returns every stored output comparison, newest first; the side by side view reads the same records. */
    getcomparison(): Promise<comparisonrecord[]>;
    /** Persists one output comparison record; the field by field alignment stays for the audit trail. */
    setcomparison(record: comparisonrecord): Promise<void>;
    /** Returns every stored consensus record with the open rounds first; the vote tally view reads the same records. */
    getvotes(): Promise<consensusrecord[]>;
    /** Persists one consensus record; the votes, the tally and the outcome stay for the audit trail with every dissenting vote. */
    setvote(record: consensusrecord): Promise<void>;
    /** Returns the timestamp of the last killswitch stop; the fleet view reads it to name when the user last halted everything. */
    getkillswitchat(): Promise<number | undefined>;
    /** Persists the timestamp of one killswitch stop; one audit event per stopped agent lands beside it. */
    setkillswitchat(at: number): Promise<void>;
    /** Returns the paused fleet agents by id; the executor skips only their queues while the peers keep running. */
    getpausedagents(): Promise<string[]>;
    /** Returns the spawn lineage of the 1.1.73 family: every fleet spawnrecord with its parent, child, depth and parent objective, newest first. */
    getspawn(): Promise<spawnrecord[]>;
    /** Persists one fleet spawnrecord of the lineage; every newer spawn replaces the stored one and the lineage survives every restart. */
    setspawn(record: spawnrecord): Promise<void>;
    /** Returns every stored fleet aggregaterecord with the open ones first; the merged reports read newest first after them. */
    getaggregate(): Promise<aggregaterecord[]>;
    /** Persists one fleet aggregaterecord under the user configured aggregateretention window; an absent window keeps every merged report for the audit trail. */
    setaggregate(record: aggregaterecord, retention?: number): Promise<void>;
    /** Returns the stored interleaved fleet timeline ordered by event time; the merged lanes read the same events. */
    getinterleaved(): Promise<interleaveevent[]>;
    /** Persists the interleaved fleet timeline under the user configured interleveretention window; an absent window keeps every interleaved event. */
    setinterleaved(events: interleaveevent[], retention?: number): Promise<void>;
    /** Returns every stored lesson of the lessonshare, the most reused first; the matching pass reads the same records. */
    getlessons(): Promise<lessonrecord[]>;
    /** Persists one lessonrecord of the lessonshare; the sanitized finding stays for every agent that serves it. */
    setlesson(lesson: lessonrecord): Promise<void>;
    /** Returns every stored arbitration case with the open and granted ones first; the verdict view reads the same cases. */
    getcases(): Promise<arbitrationcase[]>;
    /** Persists one arbitrationcase with its verdict; the release keeps the closed case for the audit trail. */
    setcase(record: arbitrationcase): Promise<void>;
    /** Returns the user configured priority lanes of the task queue; the drain order reads the same lanes. */
    getlanes(): Promise<tasklane[]>;
    /** Persists the priority lanes of the task queue; the lane order and the interactive protection stay the user's choice. */
    setlane(lanes: tasklane[]): Promise<void>;
    /** Returns the latest loadreport per origin; the scaleworkers pass reads the same samples. */
    getload(): Promise<loadreport[]>;
    /** Persists one loadreport sample per origin; every newer sample replaces the stored one of its origin. */
    setload(report: loadreport): Promise<void>;
    /** Returns the shared fleet cost ledger, newest first; the split pass reads the same entries. */
    getcosts(): Promise<costentry[]>;
    /** Persists one costentry of the shared ledger attributed to its agent; the accounting stays local and read only. */
    setcost(entry: costentry): Promise<void>;
    /** Returns the user configured depthlimit of the sub agent recursion; an absent limit stays unbounded because the ceiling stays the user's choice. */
    getdepthlimit(): Promise<depthlimit | undefined>;
    /** Persists the user configured depthlimit of the sub agent recursion; the spawn gates read it exactly. */
    setdepthlimit(limit: depthlimit): Promise<void>;
    /** Returns the stored closed tab records of the 1.1.74 family, newest first; the reopening path reads the same records after its grant recheck. */
    getclosedtabrecords(): Promise<closedtabrecord[]>;
    /** Persists one closedtabrecord of a closed tab under the user configured closedtabretention window in milliseconds; an absent window keeps every record while a reopened record keeps its stamp for the audit trail. */
    addclosedtabrecord(record: closedtabrecord, retention?: number): Promise<void>;
    /** Stamps one closedtabrecord as reopened so a reopened record never reopens twice while the retention window keeps it for the audit trail. */
    setclosedtabrecord(record: closedtabrecord): Promise<void>;
    /** Returns the navigation trail of one run: every navtrailentry the run captured in order; the audit and the on demand replay read the same entries. */
    getnavtrail(runid: string): Promise<navtrailentry[]>;
    /** Persists one navtrailentry of the run trail; an entry the trail already carries stays once so repeated restores never double it. */
    addnavtrailentry(runid: string, entry: navtrailentry): Promise<void>;
    /** Returns the live navigation rate windows per domain of the 1.1.74 family; the sliding windows survive restarts through the same records. */
    getnavratelimits(): Promise<ratelimitwindow[]>;
    /** Persists one navigation rate window per domain; every newer window replaces the stored one of its domain. */
    setnavratelimitwindow(window: ratelimitwindow): Promise<void>;
    /** Returns the stored deep link patterns of the 1.1.74 family; the deeplinkapp builder reads the same patterns beside its built in catalog. */
    getdeeplinks(): Promise<deeplinkpattern[]>;
    /** Persists one deeplinkpattern; a stored pattern of the same app and route gives way to the newer one. */
    setdeeplink(pattern: deeplinkpattern): Promise<void>;
    /** Returns the safety verdict history of the 1.1.74 family, newest first; the ui shows the same verdicts with their reasons before anything opens. */
    getsafety(): Promise<safetyverdict[]>;
    /** Persists one safetyverdict of the checksafeurl history; every refusal keeps its reasons for the audit trail. */
    setsafetyverdict(verdict: safetyverdict): Promise<void>;
    /** Returns the stored prefetchplan of the latest navintent pass; the predictions survive restarts so the warming resumes from the same set. */
    getprefetch(): Promise<prefetchplan | undefined>;
    /** Persists the prefetchplan of the latest navintent pass; a changed plan replaces the stored predictions because stale predictions never warm a page. */
    setprefetch(plan: prefetchplan): Promise<void>;
    /** Returns the navpause state with its pending url; the freeze and its queued navigation survive restarts through the same record. */
    getnavpause(): Promise<navpause | undefined>;
    /** Persists the navpause state with its pending url; the queued navigation waits for the answer of the consent prompt across restarts. */
    setnavpause(pause: navpause): Promise<void>;
    /** Returns the extractpipelines of the 1.1.75 family, newest first; a run id narrows the read to its own pipelines so the resume and the view read exactly their own extraction. */
    getpipeline(runid?: string): Promise<extractpipeline[]>;
    /** Persists one extractpipeline per run; every newer pipeline of the same id replaces the stored one so the pipeline state survives restarts. */
    setpipeline(pipeline: extractpipeline): Promise<void>;
    /** Returns the streamcursor of one pipeline; the checkpointed position survives restarts so the resume continues exactly where the stream stopped. */
    getcursor(pipelineid: string): Promise<streamcursor | undefined>;
    /** Persists the streamcursor of one pipeline after every chunk; the cursor checkpoints ride the same adapter so an interrupted stream never writes a row twice. */
    setcursor(cursor: streamcursor): Promise<void>;
    /** Returns the stored transformrule list of one run; the pipeline layer applies only the rules the run review approved. */
    gettransforms(runid: string): Promise<transformrule[]>;
    /** Persists the transformrule list of one run; every newer list replaces the stored one so the transforms stay the reviewed set. */
    settransforms(runid: string, rules: transformrule[]): Promise<void>;
    /** Returns the stored preview extractbatches of the 1.1.75 family, newest first; the grid preview reads the same batches without ever touching the stored extract. */
    getrows(): Promise<extractbatch[]>;
    /** Persists the latest preview extractbatch under the user configured previewretention window in milliseconds; an absent window keeps every batch for the audit trail. */
    setrows(batch: extractbatch, retention?: number): Promise<void>;
    /** Returns the provlog entries of one run in append order; the provenance queries read the same append only log. */
    getprovlog(runid: string): Promise<provlogentry[]>;
    /** Appends one provlogentry to the run log; the log stays append only — an entry whose id already sits in the log never rewrites — so the audit integrity holds across restarts. */
    addprovlogentry(runid: string, entry: provlogentry): Promise<void>;
    /** Returns the samplepolicy of one plan; the preview reads the row count and the strategy the user configured for exactly this plan. */
    getsamplepolicy(planid: string): Promise<samplepolicy | undefined>;
    /** Persists the samplepolicy of one plan; the row count stays a user choice with no code ceiling. */
    setsamplepolicy(planid: string, policy: samplepolicy): Promise<void>;
    /** Returns the stored dedupereports of the 1.1.75 family, newest first; a run id narrows the read to its own passes. */
    getdedupereports(runid?: string): Promise<dedupereport[]>;
    /** Persists one dedupereport with its dropped counts and dropped row keys; every pass keeps its report for the audit trail. */
    setdedupereport(report: dedupereport): Promise<void>;
    /** Returns the stream file metadata of the 1.1.75 family, newest first; the cleanup after a run reads exactly the disk sinks its pipelines streamed to. */
    getstreamfiles(runid?: string): Promise<streamfilerecord[]>;
    /** Persists one streamfilerecord for the cleanup after its run; the metadata carries the filename inside the runid namespace and never the row payloads. */
    addstreamfile(record: streamfilerecord): Promise<void>;
    /** Returns the sourcestamprecords of one run, newest first; the stamps sit beside their rows so every cell answers the page and step that captured it. */
    getsourcestamps(runid: string): Promise<sourcestamprecord[]>;
    /** Persists the sourcestamprecords of one run; a stamp never rewrites after stamping so the capture timestamps stay immutable. */
    setsourcestamps(runid: string, stamps: sourcestamprecord[]): Promise<void>;
    /** Returns one stored event subscription of the 1.1.76 family by its id; the record carries its lasteventid so a reconnect resumes exactly where the stream stopped. */
    getsubscription(id: string): Promise<eventsubscription | undefined>;
    /** Returns the per run cached responses of the 1.1.76 family, newest first; a run id narrows the read to its own namespace because every cache key embeds the run it serves. */
    getcache(runid?: string): Promise<cacheentry[]>;
    /** Persists one cached response of the 1.1.76 family under the user configured cacheretention window in entries; an absent window keeps every cacheentry of the run until the run ends. */
    setcacheentry(entry: cacheentry, retention?: number): Promise<void>;
    /** Runs the cache expiry cleanup pass of the 1.1.76 family: every entry whose expiry passed drops while its metadata stays with the caller for the audit trail; an absent pass keeps every unexpired entry. */
    expirycachepass(now: number): Promise<{
        kept: cacheentry[];
        expired: cacheentry[];
    }>;
    /** Returns the per run correlation map of the 1.1.76 family; the request map stays read only inside the run and exports to the audit trail as one map. */
    getcorrelation(runid: string): Promise<correlationcontext | undefined>;
    /** Persists the per run correlation map of the 1.1.76 family; every assigned request id and every joined response pair survive restarts through the same record. */
    setcorrelation(context: correlationcontext): Promise<void>;
    /** Returns the stored ratelimitdirective records of the 1.1.76 family per origin whose reset window has not passed; expired directives drop out at their reset windows, composed beside the ratelimitread family. */
    getratelimitdirectives(now: number): Promise<ratelimitdirective[]>;
    /** Persists one ratelimitdirective of the 1.1.76 family per origin and scope, replacing the previous directive of the same origin and scope. */
    setratelimitdirective(directive: ratelimitdirective): Promise<void>;
    /** Returns the observed page api calls of the 1.1.76 family, newest first; a run id narrows the read to its own observations while the records stay read only beside the discovered api map. */
    getapicalls(runid?: string): Promise<apicallrecord[]>;
    /** Records one observed page api call of the 1.1.76 family under the user configured apicallretention window in records; an absent window keeps every apicallrecord for the audit trail. */
    addapicall(record: apicallrecord, retention?: number): Promise<void>;
    /** Returns the user configured poll choices of the 1.1.76 family: the timeout of one long poll request and the backoff between its retries; an absent choice leaves the poll unbounded because the bounds carry no code default. */
    getpollchoices(): Promise<{
        timeout?: number;
        backoff?: number;
    }>;
    /** Persists the user configured poll choices of the 1.1.76 family; the timeout and the backoff stay exactly the user's values with no code default. */
    setpollchoices(choices: {
        timeout?: number;
        backoff?: number;
    }): Promise<void>;
    /** Returns the stored ocr results of the 1.1.77 family, newest first; a run id narrows the read to its own recognitions. */
    getocrs(runid?: string): Promise<ocrresult[]>;
    /** Records one ocr result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every ocrresult for the audit trail. */
    addocr(record: ocrresult, retention?: number): Promise<void>;
    /** Returns the stored vision descriptions of the 1.1.77 family, newest first; a run id narrows the read to its own model answers. */
    getvisions(runid?: string): Promise<visiondescription[]>;
    /** Records one vision description of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every visiondescription for the audit trail. */
    addvision(record: visiondescription, retention?: number): Promise<void>;
    /** Returns the stored redaction masks of the 1.1.77 family, newest first; a run id narrows the read to its own masks while the mask evidence always survives for the audit trail. */
    getmasks(runid?: string): Promise<redactionmask[]>;
    /** Records one redaction mask of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every redactionmask because the mask evidence answers the audit. */
    addmask(record: redactionmask, retention?: number): Promise<void>;
    /** Returns the stored screenshot pairs of the 1.1.77 family, newest first; the name composes with screenshotpair because the getpairs accessor of the 1.1.40 family already serves the beforeafter shotpair records — the same house rule of composed names on collision. */
    getscreenshotpairs(runid?: string): Promise<screenshotpair[]>;
    /** Records one screenshot pair of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every screenshotpair for the audit trail. */
    addscreenshotpair(record: screenshotpair, retention?: number): Promise<void>;
    /** Returns the stored grounding results of the 1.1.77 family, newest first; a run id narrows the read to its own groundings. */
    getgroundings(runid?: string): Promise<groundingresult[]>;
    /** Records one grounding result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every groundingresult for the audit trail. */
    addgrounding(record: groundingresult, retention?: number): Promise<void>;
    /** Returns the stored frame reads of the 1.1.77 family, newest first; every framereference names the video selector and the position the run read so a frame position never re-reads blindly. */
    getframereads(runid?: string): Promise<framereference[]>;
    /** Records one frame read of the 1.1.77 family under the user configured frameretention window in milliseconds; a repeated read of the same selector and position replaces its record while an absent window keeps every framereference for the audit trail. */
    addframeread(record: framereference, retention?: number): Promise<void>;
    /** Returns the persisted vision model configuration of the 1.1.77 family: the model name and the endpoint the user configured; an absent configuration keeps the model calls refused because no recognition ships inside the extension. */
    getvisionconfig(): Promise<{
        model?: string;
        endpoint?: string;
    }>;
    /** Persists the vision model configuration of the 1.1.77 family; the model and the endpoint stay exactly the user's values with no code default. */
    setvisionconfig(config: {
        model?: string;
        endpoint?: string;
    }): Promise<void>;
    /** Returns the stored visioncache entries of the 1.1.77 family keyed by their image hashes, newest first; a run id narrows the read to its own namespace. */
    getvisioncache(runid?: string): Promise<visioncacheentry[]>;
    /** Persists one visioncache entry of the 1.1.77 family by its image hash; a newer entry of the same hash replaces the older one so one image hash answers one recognition. */
    setvisioncacheentry(entry: visioncacheentry): Promise<void>;
    /** Runs the visioncache expiry pass of the 1.1.77 family: every entry older than the user configured visioncacheretention window in milliseconds drops while its metadata stays with the caller for the audit trail; an absent window keeps every entry. */
    expirevisioncachepass(now: number, retention?: number): Promise<{
        kept: visioncacheentry[];
        expired: visioncacheentry[];
    }>;
    /** Returns the vision call records of the 1.1.77 family, newest first; every call names whether it rode the configured model endpoint so the visioncost count answers the costshare ledger. */
    getvisioncalls(runid?: string): Promise<Array<{
        runid: string;
        kind: string;
        model: boolean;
        at: number;
    }>>;
    /** Records one vision call of the 1.1.77 family; the call log stays local and read only because the costshare ledger answers the user alone. */
    addvisioncall(record: {
        runid: string;
        kind: string;
        model: boolean;
        at: number;
    }): Promise<void>;
    /** Returns the stored beforeafter pairs of the 1.1.78 family, newest first; the name composes with beforeafter because the getpairs accessor of the 1.1.40 family already serves the shotpair records — the same house rule of composed names on collision. */
    getbeforeafters(runid?: string): Promise<beforeafterpair[]>;
    /** Records one beforeafter pair of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every pair for the audit trail. */
    addbeforeafter(record: beforeafterpair, retention?: number): Promise<void>;
    /** Replaces the stored beforeafter pairs after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
    setbeforeafters(records: beforeafterpair[]): Promise<void>;
    /** Returns the forensic console timeline of one run of the 1.1.78 family in capture order; the name composes with consoletimeline because the gettimeline accessor of the run timeline family and the consolediff of the console family already serve their own records. */
    getconsoletimeline(runid: string): Promise<consoletraceentry[]>;
    /** Records one console trace entry of the 1.1.78 family per run; the sequence numbers stamp in capture order so a page reload never resets the ordering while the retention answers the user choice alone. */
    addconsoleentry(runid: string, entry: consoletraceentry, retention?: number): Promise<void>;
    /** Returns the forensic net timeline of one run of the 1.1.78 family in capture order; the name composes with nettrace because the getnetlog accessor of the network family already serves the netlog records. */
    getnettraces(runid: string): Promise<nettraceentry[]>;
    /** Records one net trace entry of the 1.1.78 family per run; the correlation joining answers the correlateids map while the retention answers the user choice alone. */
    addnettrace(runid: string, entry: nettraceentry, retention?: number): Promise<void>;
    /** Returns the stored diff baselines of the 1.1.78 family, newest first; the name composes with diffbase because the getdiffs accessor of the snapshot family already serves the snapshotdiff records. */
    getdiffbases(runid?: string): Promise<diffbaserecord[]>;
    /** Persists one diff baseline of the 1.1.78 family; a new baseline of the same page state replaces the older one so one page state answers one frozen capture. */
    setdiffbase(record: diffbaserecord): Promise<void>;
    /** Returns the stored diff results of the 1.1.78 family, newest first; a run id narrows the read to its own comparisons. */
    getdiffresults(runid?: string): Promise<diffresult[]>;
    /** Records one diff result of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every diffresult for the audit trail. */
    adddiffresult(record: diffresult, retention?: number): Promise<void>;
    /** Replaces the stored diff results after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
    setdiffresults(records: diffresult[]): Promise<void>;
    /** Returns the stored thumbnails of the 1.1.78 family, newest first; every thumbnailrecord links back to its full capture through its captureid so the capture log shows the run at a glance. */
    getthumbs(runid?: string): Promise<thumbnailrecord[]>;
    /** Records one thumbnail of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every thumbnailrecord beside its full capture. */
    addthumb(record: thumbnailrecord, retention?: number): Promise<void>;
    /** Replaces the stored thumbnails after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
    setthumbs(records: thumbnailrecord[]): Promise<void>;
    /** Returns the timelapse frame references of one run of the 1.1.78 family in their ordered sequence; the assembled lapse replays the page change in capture order. */
    getlapse(runid: string): Promise<timelapseframe[]>;
    /** Appends one timelapse frame of the 1.1.78 family per run; the frame reference carries its ordered sequence number so a late stored frame lands in its place. */
    addlapseframe(runid: string, frame: timelapseframe): Promise<void>;
    /** Returns the timelapse configuration of one run of the 1.1.78 family; the interval and the duration stay the user choices the lapse runs on. */
    getlapseconfig(runid: string): Promise<timelapseconfig | undefined>;
    /** Persists the timelapse configuration of one run of the 1.1.78 family; the started lapse survives service worker restarts through the same record. */
    setlapseconfig(config: timelapseconfig): Promise<void>;
    /** Returns the user configured capture naming rule of the 1.1.78 family: the lowercase pattern with the parts it stamps; an absent rule keeps the capturename grammar of the files family. */
    getnames(): Promise<capturenamerule | undefined>;
    /** Persists the user configured capture naming rule of the 1.1.78 family; the pattern and its parts stay exactly the user's values with no code default. */
    setnamerule(rule: capturenamerule): Promise<void>;
    /** Returns the user configured forensic choices of the 1.1.78 family: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention; an absent choice never hides a code default. */
    getforensicchoices(): Promise<{
        diffthreshold?: number;
        timelapseinterval?: number;
        thumbnailedge?: number;
        forensicretention?: number;
    }>;
    /** Persists the user configured forensic choices of the 1.1.78 family through the runsettings; the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention stay exactly the user's values with no code default. */
    setforensicchoices(choices: {
        diffthreshold?: number;
        timelapseinterval?: number;
        thumbnailedge?: number;
        forensicretention?: number;
    }): Promise<void>;
    /** Lists every stored key of the 1.1.79 minimization family with its data class, its serialized size and its record count: the inventory reads the stored families the caller names so the purge and the exportall bundle scope exactly over what the device holds, while the artifact getinventory of the 1.1.68 family stays untouched for the cleanup sweeper. */
    getdatainventory(families: Array<{
        key: string;
        dataclass: string;
    }>): Promise<datainventory[]>;
    /** Stores the minimization policies of the 1.1.79 family — the purge policy with its scope and typed confirmation, the cleanup schedule with its artifact classes and timing, and the sync settings with the opted in classes and the cadence — exactly as the user configured them with no code default. */
    getminpolicies(): Promise<{
        purge?: purgepolicy;
        cleanup?: cleanupschedule;
        sync?: syncsettings;
    }>;
    /** Persists the minimization policies of the 1.1.79 family; every scope, timing, cadence and confirmation phrase stays the user's choice with no code default. */
    setminpolicies(policies: {
        purge?: purgepolicy;
        cleanup?: cleanupschedule;
        sync?: syncsettings;
    }): Promise<void>;
    /** Lists the sync records of the 1.1.79 family: one record per synced payload with its opted in classes, its payload hash, its format tag and its sync time — a plaintext sync never enters this list. */
    getsyncrecords(): Promise<syncrecord[]>;
    /** Stores one sync record of the 1.1.79 family; the newest pass answers first so the sync view names the latest transport. */
    addsyncrecord(record: syncrecord): Promise<void>;
    /** Lists the cookie jar records of the 1.1.79 family — one jar per task run with its scoped cookie entries, its seal state and its expiry window. */
    getjars(): Promise<cookiejarrecord[]>;
    /** Stores one cookie jar record of the 1.1.79 family; the jar keeps its run binding so one task run never shares its cookie state with another. */
    setjar(jar: cookiejarrecord): Promise<void>;
    /** Expires the sealed jars of the 1.1.79 family whose user configured expiry window passed: the cookie entries leave while the jar record stays for the audit trail, and an unexpired or expiry-less jar keeps everything because the expiry never defaults in code. */
    expirejarpass(now: number): Promise<{
        expired: number;
    }>;
    /** Lists the local rule records of the 1.1.79 family: the field lists per origin that must never leave the device. */
    getlocalrules(): Promise<localrule[]>;
    /** Stores one local rule record of the 1.1.79 family per origin; the localfirst pass and the localgate read exactly these fields. */
    setlocalrule(rule: localrule): Promise<void>;
    /** Reads the telemetry policy of the 1.1.79 family persisted fixed to off: the enabled literal stays false by construction and every counter keeps living inside the local memory. */
    gettelemetrypolicy(): Promise<telemetrypolicy>;
    /** Persists the telemetry policy of the 1.1.79 family; only the fixed off record ever stores because the type makes an on state unrepresentable. */
    settelemetrypolicy(policy: telemetrypolicy): Promise<void>;
    /** Lists the exportall bundles of the 1.1.79 family: one record per portable file the user asked for with its record counts and byte sizes. */
    getexportbundles(): Promise<exportallbundle[]>;
    /** Stores one exportall bundle of the 1.1.79 family; the bundle links to its download record so the audit trail answers which download carried which bundle. */
    addexportbundle(bundle: exportallbundle): Promise<void>;
    /** Links one exportall bundle of the 1.1.79 family to the download record that carried it, so the audit trail answers which download shipped which bundle. */
    setbundledownload(bundleid: string, downloadid: string): Promise<void>;
    /** Lists the download links of the exportall bundles of the 1.1.79 family by bundle id. */
    getbundledownloads(): Promise<Record<string, string>>;
    /** Flags artifacts of the 1.1.79 family for retention: the flagged ids never enter a cleanup pass because the user asked to keep them. */
    flagretainedartifacts(ids: string[]): Promise<void>;
    /** Lists the artifact ids the user flagged for retention of the 1.1.79 family; the cleanup pass keeps every one of them. */
    getretainedartifacts(): Promise<string[]>;
    /** Lists the storage keys the run families wrote, derived from the stored records: the run scoped keys of every known run, the session trail keys and the family keys the inventory scopes, because the adapter seam exposes no enumeration and the purge of a run trace names real keys only. */
    storedkeys(): Promise<string[]>;
    /** Purges the stored families of the 1.1.79 minimization family by storage key: the purgeonrequest pass resolved the scope and the typed confirmation before the caller lands here, every deleted key entered the audit trail through the caller, and the audit family never purges because the immutable hashes survive every pass. */
    purgekeys(keys: string[]): Promise<void>;
    /** Builds the auditexportrecord of the workspace on demand: the runs with their visits, the memory items with their provenance, the expiry rules, the timeline streams of every run and the locks bundle into one record. */
    getexport(now: number): Promise<auditexportrecord>;
    /**
     * The site bridge seam of the 1.1.82 family: the relay session records, the pairing records with their one time codes, the relay token records stored only as sha-256 hashes scoped to the relay origin, the bridge event log with its minimized payloads, the offline bridge queue with its operation id deduplication and the bridge kill switch stamp persist through the same local adapter; the socket itself lives in the background service worker while every record survives its restarts.
     * The seam documents a relay session backend — a reviewed relay store can take the session and token registry over later, holding the pairing state and the token hashes beside the idle expiry sweeps on its own reviewed infrastructure behind the same bridge consent gate and the same origin scoping — without touching the callers, without ever persisting a raw token and without ever bypassing the review.
     * The bridge records below never hold page content: the event payloads carry plan text and statuses only unless the explicit page consent flag is set.
     */
    /** Lists the relay session records of the 1.1.82 site bridge: one record per paired relay session with its two member room and idle window. */
    getbridgesessions(): Promise<bridgesessionrecord[]>;
    /** Stores the relay session records of the 1.1.82 site bridge in one pass so a restart never leaves a half written member room. */
    setbridgesessions(records: bridgesessionrecord[]): Promise<void>;
    /** Stores one relay session record of the 1.1.82 site bridge, replacing the record of the same session id. */
    addbridgesession(record: bridgesessionrecord): Promise<void>;
    /** Lists the bridge pairing records of the 1.1.82 site bridge: the one time codes minted inside the extension options bound to the relay origin. */
    getbridgepairings(): Promise<bridgepairingrecord[]>;
    /** Stores the bridge pairing records of the 1.1.82 site bridge in one pass. */
    setbridgepairings(records: bridgepairingrecord[]): Promise<void>;
    /** Stores one bridge pairing record of the 1.1.82 site bridge; a re-mint of the same origin replaces the earlier code. */
    addbridgepairing(record: bridgepairingrecord): Promise<void>;
    /** Lists the relay token records of the 1.1.82 site bridge: the sha-256 hashes scoped to the relay origin, never a raw token. */
    getbridgetokens(): Promise<relaytokenrecord[]>;
    /** Stores the relay token records of the 1.1.82 site bridge in one pass; the raw values stay out of the store by construction. */
    setbridgetokens(records: relaytokenrecord[]): Promise<void>;
    /** Lists the bridge event records of the 1.1.82 site bridge: the minimized chat, plan proposal, plan review and progress events with their operation ids. */
    getbridgeevents(): Promise<bridgeeventrecord[]>;
    /** Stores one bridge event record of the 1.1.82 site bridge at the head of the log; the payloads carry plan text and statuses only. */
    addbridgeevent(event: bridgeeventrecord): Promise<void>;
    /** Lists the offline bridge queue of the 1.1.82 site bridge: the buffered frames with their stable operation ids for the replay deduplication. */
    getbridgequeue(): Promise<bridgequeuerecord[]>;
    /** Stores the offline bridge queue of the 1.1.82 site bridge in one pass so the replay and the buffer never race. */
    setbridgequeue(records: bridgequeuerecord[]): Promise<void>;
    /** Reads the bridge kill switch stamp of the 1.1.82 site bridge; an absent stamp leaves the switch released. */
    getbridgeswitch(): Promise<bridgekillswitch | undefined>;
    /** Stores the bridge kill switch stamp of the 1.1.82 site bridge; one click disables the socket and the pairing instantly. */
    setbridgeswitch(stamp: bridgekillswitch): Promise<void>;
    /** Returns the install state of the 1.1.85 native host: the host name, the extension id, the installer and companion versions, the port state and the last errors; an absent record leaves the transport deny by default. */
    getnativestate(): Promise<nativehoststate | undefined>;
    /** Stores the install state of the 1.1.85 native host so the install state persists across service worker restarts; the record never carries key material or session tokens. */
    setnativestate(state: nativehoststate): Promise<void>;
    /** Lists the native call records of the 1.1.85 audit trail: one record per call with its correlation id, surface, call class and outcome, newest first. */
    getnativecalls(): Promise<nativecallrecord[]>;
    /** Replaces the stored native call set after one recorded call so the audit trail survives the service worker restarts. */
    setnativecalls(records: nativecallrecord[]): Promise<void>;
    /** Stores one native call record at the head of the audit trail; a repeated record id replaces the earlier entry and the record carries no payload bytes. */
    addnativecall(record: nativecallrecord): Promise<void>;
    /** Reads the kill switch stamp of the 1.1.85 native transport; an absent stamp leaves the switch released. */
    getnativeswitch(): Promise<nativekillswitch | undefined>;
    /** Stores the kill switch stamp of the 1.1.85 native transport; one press stops every native call instantly and no frame crosses until the release. */
    setnativeswitch(stamp: nativekillswitch): Promise<void>;
    /** Lists the wsbridge session records of the 1.1.85 native transport: the port, the token hash (never the raw token), the idle window and the connection counts. */
    getnativebridgesessions(): Promise<wsbridgesession[]>;
    /** Replaces the stored wsbridge session set after one bind, connection or expiry sweep; the raw tokens stay out of the store by construction. */
    setnativebridgesessions(sessions: wsbridgesession[]): Promise<void>;
}
/** Creates identifiers locally without a network dependency. */
export declare function randomid(): string;
/**
 * Memory care logic of the 1.1.71 state depth family.
 * Every stored memory item wraps its value with a provenance record and its expiry, expirememory evaluates the user configured expiryrules and purges the expired items with every purge recorded in the audit trail while the summaries survive, encryptrest derives its key from the user secret through the webcrypto api and encrypts the items at rest with a lazy migration of the items that predate encryption, quotawatch polls the storage estimate and ranks its cleanup candidates by age and expiry policy without ever touching the audit history without consent, and auditexport bundles the runs, the memory, the provenance and the expiry rules into one record that streams without a size cap.
 * No lifetime stays hardcoded: every expiryrule lifetime and every quota window stays the user's choice, and no purge, cleanup or export path ever bypasses the review.
 */
/** The sensitive memory classes the encrypt gate refuses to write in plaintext: credentials, secrets, tokens and captured bodies always encrypt at rest when encryptrest stays enabled. */
export declare const sensitivememoryclasses: ReadonlySet<string>;
/** Builds one provenance record of a stored memory item: the origin it came from, the run and step that captured it and the capture time. */
export declare function provenanceof(input: {
    origin: string;
    runid: string;
    stepid: string;
    now: number;
}): memoryprovenance;
/** Wraps one stored value in a memoryitem record with its provenance and its class so the export and the expiry always find their origin. */
export declare function memoryitemof(input: {
    key: string;
    value: unknown;
    provenance: memoryprovenance;
    memoryclass?: string;
    expiresat?: number;
}): memoryitem;
/** Attaches a provenance record to a stored memory item; an item that already carries provenance keeps its own. */
export declare function attachprovenance(item: memoryitem, provenance: memoryprovenance): memoryitem;
/** Resolves the originating step summary of one memory item: the step its provenance names reports its reviewed summary while an unknown stepid reports that its step left the plan. */
export declare function stepsummaryfor(item: memoryitem, steps: toolstep[]): string;
/** Reads the matching expiryrule of one memory key: the first rule whose pattern matches the key names its lifetime while an unmatched key carries no rule and never expires on its own. */
export declare function matchingrule(rules: expiryrule[], key: string): expiryrule | undefined;
/** Reads the expiry timestamp of one memory item under the expiryrules: a rule lifetime adds to the capture time while an item that carries its own expiresat keeps it because its own boundary stays explicit. */
export declare function expiryof(item: memoryitem, rules: expiryrule[]): number | undefined;
/** Lists the memory items whose expiry passed under the expiryrules: every expired item names a purge candidate the expirygate holds behind its confirmation. */
export declare function expireditems(items: memoryitem[], rules: expiryrule[], now: number): memoryitem[];
/** One purge outcome of expirememory: the purged key, the retained summary for the audit trail and the provenance of the purged item. */
export interface purgeoutcome {
    key: string;
    summary: string;
    provenance: memoryprovenance;
    at: number;
}
/** Purges the expired memory items behind the confirmed choice: every purge keeps its summary and its provenance for the audit trail while the item value leaves; the audit events stay untouched unless the user opts in through the auditevents flag. */
export declare function purgeitems(input: {
    items: memoryitem[];
    rules: expiryrule[];
    confirmed: boolean;
    now: number;
}): {
    kept: memoryitem[];
    purged: purgeoutcome[];
};
/** Builds one quotareport of the storage estimate: the usage, the quota, the remaining bytes and the ranked cleanup candidates; every candidate carries its reclaimable bytes and its reason. */
export declare function quotareportof(input: {
    usage: number;
    quota: number;
    items: memoryitem[];
    rules: expiryrule[];
    now: number;
}): quotareport;
/** Ranks the cleanup candidates by age and expiry policy: the expired items lead by their expiry order, the oldest items follow by their capture age, and the audit history never enters the ranking. */
export declare function rankedcandidates(items: memoryitem[], rules: expiryrule[], now: number): Array<{
    key: string;
    bytes: number;
    reason: string;
}>;
/** Proposes one cleanup batch of the ranked candidates: the batch names every candidate it would purge and never touches the audit history without the explicit per batch consent. */
export declare function cleanupbatch(candidates: Array<{
    key: string;
    bytes: number;
    reason: string;
}>, batchsize: number | undefined): Array<{
    key: string;
    bytes: number;
    reason: string;
}>;
/** Reports the bytes one cleanup pass reclaimed: every purged item contributes its measured bytes while the audit history contributes none because it never entered the batch. */
export declare function bytesreclaimed(batch: Array<{
    key: string;
    bytes: number;
}>): number;
/** Builds one auditexportrecord on demand: the runs with their visits, the memory items with their provenance, the expiry rules and the timeline stream of every run bundle into one record for the audit export. */
export declare function auditexportof(input: {
    runs: runrecord[];
    items: memoryitem[];
    rules: expiryrule[];
    timeline: runtimelineevent[];
    locks: lockrecord[];
    now: number;
}): auditexportrecord;
/** Streams one auditexportrecord into sequential chunks without a size cap: every chunk carries its index and its done flag so an external consumer reads the whole record piece by piece. */
export declare function exportchunks(record: auditexportrecord, chunksize: number): Array<{
    index: number;
    payload: string;
    done: boolean;
}>;
/** Derives one AES-GCM key from the user secret through the webcrypto api: PBKDF2 stretches the secret over its salt and the derived key never persists because the adapter stores only the encryption flag. */
export declare function derivekey(secret: string, salt: string): Promise<CryptoKey>;
/** The encrypted envelope of one memory item: the cipher carries its iv beside its base64 payload so the read path decrypts without a stored key. */
export interface encryptedenvelope {
    iv: string;
    payload: string;
}
/** Encrypts one memory item value at rest: the AES-GCM cipher wraps the serialized value with a fresh iv while the provenance and the key stay outside the envelope. */
export declare function encryptvalue(key: CryptoKey, value: unknown): Promise<encryptedenvelope>;
/** Decrypts one encrypted envelope back to its value on read: the decryption alters nothing but the envelope itself because the audit trail never carries the value. */
export declare function decryptvalue(key: CryptoKey, envelope: encryptedenvelope): Promise<unknown>;
/** Migrates one memory item that predates encryption lazily on first access: the plaintext item encrypts in place while an already encrypted item returns unchanged and the provenance stays untouched. */
export declare function migrateitem(input: {
    item: memoryitem;
    key: CryptoKey;
    enabled: boolean;
}): Promise<memoryitem>;
/** Reads whether one memory item belongs to a sensitive class the encrypt gate refuses to write in plaintext when encryptrest stays enabled. */
export declare function issensitiveclass(memoryclass: string | undefined): boolean;
/** Verifies every memory item of an export carries its provenance: an item without provenance never exports because the audit trail could not name its origin. */
export declare function exportready(items: memoryitem[]): {
    ready: boolean;
    missing: string[];
};
/**
 * Selcache logic of the 1.1.68 family.
 * The selector resolver caches resolutions per generation: every dom mutation batch advances the generation, a navigation invalidates the cache wholesale, a matching mutation fingerprint invalidates the matching entries selectively, and a cached hit revalidates before the dispatch while a hit from a stale generation refuses with a retry hint.
 * The cache optimizes resolution only: it never changes what a selector resolves, and every refusal keeps the resolver its fresh query fallback.
 */
/** Opens the selcache state of one run at generation zero with no entry and no invalidation. */
export declare function openselcache(runid: string): selcachestate;
/** Caches one selector resolution under the current generation; a repeated selector overwrites its entry so the cache carries one resolution per selector. */
export declare function cacheselentry(cache: selcachestate, entry: {
    selector: string;
    resolution: string;
}): selcachestate;
/** Advances the selcache generation on one dom mutation batch: the entries of the old generation go stale so a later hit refuses until it revalidates. */
export declare function advanceselcachegeneration(cache: selcachestate, now: number): selcachestate;
/** Reads one cached resolution for a dispatch: a hit from the current generation revalidates before the dispatch while a hit from a stale generation refuses with its retry hint so the resolver falls back to a fresh query. */
export declare function selcachelookup(cache: selcachestate, selector: string): {
    hit: boolean;
    resolution?: string;
    stale: boolean;
    reason: string;
};
/** Invalidates the selcache wholesale on a navigation event: every entry drops because the document the entries resolved against is gone. */
export declare function invalidateselcacheonnavigation(cache: selcachestate, now: number): selcachestate;
/** Invalidates the selcache selectively on matching mutation fingerprints: only the entries whose selector the mutation fingerprints name drop while the rest of the cache stays. */
export declare function invalidateselcacheonmutations(cache: selcachestate, fingerprints: string[], now: number): selcachestate;
/** Revalidates one cached hit before the dispatch: the resolver confirms the cached resolution with one fresh query, and a diverging resolution overwrites the entry under the current generation. */
export declare function revalidateselentry(cache: selcachestate, input: {
    selector: string;
    freshresolution: string;
}): selcachestate;
/** Reads the cache hit statistics of one run the run footer shows: the hit count, the stale refusal count and the hit ratio of the current generation. */
export declare function selcachestats(cache: selcachestate, lookups: Array<{
    hit: boolean;
    stale: boolean;
}>): {
    hits: number;
    stale: number;
    total: number;
};
/** Reads every selcache entry of the current generation, for the audit trail of a run end prune. */
export declare function selcacheentries(cache: selcachestate): selcacheentry[];
/** Reads the invalidation trail of one selcache, for the transparency of the cache behavior. */
export declare function selcacheinvalidations(cache: selcachestate): selcacheinvalidation[];
/** Builds the errorsurface payload of one stale generation failure: the message names the generations that diverged and the retry hint routes through the revalidation query or a fresh selector resolution, never an automatic retry. */
export declare function stalegenerationfailure(input: {
    stepid: string;
    runid: string;
    selector: string;
    entrygeneration: number;
    currentgeneration: number;
    now: number;
}): {
    message: string;
    retry: {
        allowed: boolean;
        reason: string;
    };
    context: Record<string, string>;
};
/** One version one sunset notice record: the time the first below floor declaration arrived, the major the client declared and the client that declared it; a dismissed record carries its dismissal time and stays hidden for the rest of the browser session. */
export interface v1sunsetstate {
    at: number;
    /** The protocol major the refused client declared below the supported floor, so the banner names what the line refused. */
    declared: number;
    /** The mcp client that declared the below floor major, for the audit trail beside the refusal. */
    clientid: string;
    /** The time the popup dismissed the banner for this browser session; an absent time keeps the banner rendered. */
    dismissedat?: number;
}
/** One version one migration prompt record: the time the prompt fired, the 1.x release the update upgraded from, the migrateplan command the prompt surfaces and the persistent dismissal flag that keeps it from ever appearing again. */
export interface migrationpromptstate {
    promptedat: number;
    /** The 1.x release the installed update upgraded from, recorded so the prompt names the affected line. */
    previousversion: string;
    /** The migrateplan command line the prompt surfaces, recorded beside the notification payload the history keeps. */
    command: string;
    /** The persistent dismissal flag: once true the prompt never appears again on any later update. */
    migrationpromptdismissed?: boolean;
    /** The time the user dismissed the prompt; an absent time keeps the popup banner rendered. */
    dismissedat?: number;
}
/** The migrateplan command line the migration prompt surfaces for version one plans: the migration bridge converts a v1 plan source into the reviewed plan file grammar, so the prompt names the exact command the upgrader runs. */
export declare const migrationcommandtext = "devthink migrateplan <plan source> --format v1 --out <converted plan>";
/** Marks the version one sunset notice once per session: a record that already stands without a dismissal keeps its first refusal time while the session flag of the background route holds the once semantics, and a dismissed record re-marks only when a later browser session meets the next below floor declaration. */
export declare function markv1sunset(existing: v1sunsetstate | undefined, input: {
    declared: number;
    clientid: string;
    now: number;
}): v1sunsetstate;
/** Dismisses the version one sunset banner for the session: the record keeps its refusal evidence while the dismissal time hides the banner until a later browser session marks it again. */
export declare function dismissv1sunset(existing: v1sunsetstate | undefined, now: number): v1sunsetstate | undefined;
/** True while the version one sunset banner stays rendered: a marked record without a dismissal time shows, an absent or dismissed record hides. */
export declare function v1sunsetvisible(state: v1sunsetstate | undefined): boolean;
/** Decides the one time version one migration prompt of an installed update: a dismissed or already prompted record fires no second time, and only an update whose previous release — the onInstalled previousVersion the chrome runtime reports, with the stored lastpermissions marker answering when the runtime carries none — sits on the 1.x line counts as an affected upgrader; an update from a 2.x release or an unknowable previous version prompts nothing and writes no record, because the negotiation banner carries the notice for those users instead. */
export declare function migrationpromptof(existing: migrationpromptstate | undefined, input: {
    previous: string | undefined;
    now: number;
}): {
    prompt: boolean;
    state?: migrationpromptstate;
};
/** Dismisses the version one migration prompt permanently: the persistent migrationpromptdismissed flag keeps the prompt from ever appearing again on any later update. */
export declare function dismissmigrationprompt(existing: migrationpromptstate | undefined, now: number): migrationpromptstate | undefined;
/** True while the version one migration prompt banner stays rendered: a prompted record without the persistent dismissal flag shows, an absent or dismissed record hides. */
export declare function migrationpromptvisible(state: migrationpromptstate | undefined): boolean;
//# sourceMappingURL=memory.d.ts.map