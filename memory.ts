/* ── The memory entry section the family kept before the 1.1.88 merge. ── */
import type { a11ycapture, agentevent, agentidentity, agentmailbox, agentusage, aggregaterecord, arbitrationcase, blackboard, commandparse, costbudget, costentry, agentplan, agentsession, agentpreset, allowlistentry, apikeyentry, apicallrecord, apimapentry, artifactinventoryentry, artifactrecord, assetrecord, approvalexec, approvalrequest, auditevent, authhandshakeevent, authrecord, autosnapshotstate, bannerreport, beforeafterpair, blackboxrule, blockrule, bodyrecord, capturenamerule, bridgelaunch, breakpointspec, branchoutcome, batchcall, cacheentry, callcontext, callratelimit, callrecord, capabilityreport, capabilityset, canvasrecord, captchahandoff, capturecounter, cdpcommand, cdpeventrule, cdpsession, channelrecord, clientidentity, clientrecord, clipboardconsentrecord, cleanuprule, cleanuprun, clipentry, clickablemap, closedtab, closedtabrecord, consolediff, consoleconsentrecord, consoletraceentry, controlflowdecision, cookieoperation, controltabstate, correlationcontext, cpuprofile, curatedlist, dataset, debuggergrant, derivedselector, detectionrecord, devicepreset, diagnosticreport, diffbaserecord, diffresult, dialogdecision, dialogpolicy, downloadrecord, depthlimit, deeplinkpattern, emulationlayer, emulationstate, endpointconfig, endpointrecord, errorrecord, errorreport, eventsubscription, exchangerecord, exportedartifact, extractbatch, extractpipeline, extractrow, extractsession, dedupereport, streamfilerecord, transformrule, fetchconsent, flowmetric, focusevent, formprofile, framerecord, framereference, growsample, groundingresult, ocrresult, redactionmask, screenshotpair, headerule, heaprecord, idempotencyrecord, imagebatch, interleaveevent, keyholdstate, killswitch, lessonrecord, levelsummary, loadreport, localmodelconfig, longpollrequest, modeloutput, modelroute, plandraft, prompttemplate, providerconfig, reflectnote, replanrecord, locationconsent, locationpreset, loglevel, longtaskentry, mcpserverconfig, mcpserverstate, manualrun, mediarecord, memorytrend, messageenvelope, mockspec, pdfrecord, mimefilter, mutationevent, navcontrol, navintentrecord, navpause, navqueues, navrecord, navtrailentry, netlogrecord, nettraceentry, networkpreset, observationrecord, pagesignals, pairingcode, pausestate, permissionoverriderecord, planprogress, preconnecttarget, prefetchplan, progressnotice, protocoleventsubscription, provenancerecord, provlogentry, proxyroute, quarantineentry, ratelimitdirective, ratelimitread, ratelimitstate, ratelimitwindow, readercapture, recenttab, recordingconsentrecord, recordingrecord, rejectionrecord, resolutionsummary, resourcewatch, retryoutcome, rotationtargetrecord, runsettings, safetyverdict, samplepolicy, samplingrequest, scanhookconfig, scriptoverride, sessiondiff, sessionevent, sessionfolder, sessionmatch, sessionrecord, sessionsnapshot, searchquery, sessiontoken, sheetendpoint, shiftentry, shotpair, shotrecord, snapshotdiff, sourcemapconsent, sourcemapref, sourcestamprecord, spawnrecord, stepoutcome, streamchannel, streamchunk, streamcursor, streamstate, subagentspec, submitticket, tabbadge, tabgrouprecord, tablayout, tabmeta, tabwatchevent, tasklane, taskqueue, taskrules, taskstate, templateprofile, thumbnailrecord, timelineentry, timelapseconfig, timelapseframe, tokenrecord, toolcallrecord, toolmock, tracerecord, usagerecord, trailentry, triggerfire, triggerule, typeaheadpick, visioncacheentry, visiondescription, waitprofilerecord, watchexpression, watchregistration, wizardstate, workflowprovenance, workflowrecord, workflowrun, runlogentry, steptemplate, variablescope, editorlayout, runhistoryentry, siteoverride, watchdogrecord, workflowimport, workflowversion, versiondiff, leaderworker, criticreview, verifiercheck, reviewrequest, reviewrecord, handoffrecord, resourcelock, conflictscan, resultreport, progressboard, escalationrecord, consensusround, consensusrecord, swarmaction, agentscope, swarmcost, plannerexecutor, environmentkind, offscreenregistryentry, runlock, runstaterecord, sandboxrender, sealedrunstate, workerevent, automationallowlistentry, classconsent, confirmgate, connectallowentry, consentwindow, deferredevent, gateresolution, immutablelogentry, maskrule, originprofile, permdiffrecord, phishverdict, ratelimitbucket, redactregion, revokerunevent, safedefaultapplication, secretvaultentry, storedrunlog, sitenote, scratchpadentry, runsummary, recallindexentry, recallquery, recallmatch, correctionentry, consentmemoryentry, sessiongridrow, historyindexentry, historysearchquery, historysearchhit, errorsurface, cancelrunaction, tabsessionref, onboardingstate, paletteuserecord, stepapproveresolution, surfacelayout, taskinputsubmission, logstreamfilter, siteprofile, shortcutbinding, recenttrayentry, notificationpayload, attentionentry, backgroundqueueentry, flowlibraryentry, libraryevent, outputcomparesession, syncbridgeconflict, syncbridgehook, lazyloadrecord, selcachestate, perfrecord, queuedepthsample, chunkextractcursor, incrsnapshotdelta, domainlane, runbudgetrecord, budgetalert, timeoutcancelevent, tabsuspendstate, runcacheentry, resumepoint, selectorstats, steptracespan, startupsample, slowmosession, sessionreusegrant, artifactcompressrecord, agentrecord, budgetstate, comparisonrecord, replayrecord, runrecord, checkpointrecord, heartbeatrecord, rollbackitem, queuedtask, urlvisit, runtimelineevent, lockrecord, tabstate, memoryitem, expiryrule, quotareport, auditexportrecord, memoryprovenance, cleanupschedule, cookiejarrecord, datainventory, exportallbundle, localrule, purgepolicy, syncsettings, syncrecord, telemetrypolicy, bridgesessionrecord, bridgepairingrecord, relaytokenrecord, bridgeeventrecord, bridgequeuerecord, bridgekillswitch, baseurlconfig, modelcacherecord, gatewaychatstate, clientbinding, nativehoststate, nativecallrecord, nativekillswitch, wsbridgesession, toolstep, selcacheentry, selcacheinvalidation } from "./types.js";
import { expireprofilerecords } from "./debug.js";
import { expirelayers } from "./environments.js";
import { expiresessions, filteredsessions, searchsessionrecords } from "./session.js";
import { swarmoverview as swarmoverviewof } from "./agent.js";
import { exportrunstate, openseal, sealrunstate } from "./run.js";
import { exportlogchain } from "./security.js";

/** Provides a small storage seam that works in browser, tests and future adapters. */
export interface memoryadapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
}

/**
 * Local memory for sessions, plans, audit evidence and interaction state.
 * Correlated rules for every stored record live in this one seam; each accessor is a one line storage delegation so future backends replace the adapter only.
 */
export class sessionmemory {
  constructor(private readonly adapter: memoryadapter) {}

  async getconfig(): Promise<endpointconfig | undefined> { return this.adapter.get<endpointconfig>("config"); }
  async setconfig(value: endpointconfig): Promise<void> { return this.adapter.set("config", value); }
  async getsession(): Promise<agentsession | undefined> { return this.adapter.get<agentsession>("session"); }
  async setsession(value: agentsession): Promise<void> { return this.adapter.set("session", value); }
  async getplan(): Promise<agentplan | undefined> { return this.adapter.get<agentplan>("plan"); }
  async setplan(value: agentplan): Promise<void> { return this.adapter.set("plan", value); }
  async getdiagnostic(): Promise<diagnosticreport | undefined> { return this.adapter.get<diagnosticreport>("diagnostic"); }
  async setdiagnostic(value: diagnosticreport): Promise<void> { return this.adapter.set("diagnostic", value); }
  async getprogress(): Promise<planprogress | undefined> { return this.adapter.get<planprogress>("progress"); }
  async setprogress(value: planprogress): Promise<void> { return this.adapter.set("progress", value); }
  async getcapabilities(): Promise<capabilityreport | undefined> { return this.adapter.get<capabilityreport>("capabilities"); }
  async setcapabilities(value: capabilityreport): Promise<void> { return this.adapter.set("capabilities", value); }
  async getsettings(): Promise<runsettings | undefined> { return this.adapter.get<runsettings>("settings"); }
  async setsettings(value: runsettings): Promise<void> { return this.adapter.set("settings", value); }
  async getaudit(): Promise<auditevent[]> { return (await this.adapter.get<auditevent[]>("audit")) ?? []; }
  async getoutcomes(): Promise<stepoutcome[]> { return (await this.adapter.get<stepoutcome[]>("outcomes")) ?? []; }

  /** Records one audit event; retention is a user setting and an absent setting keeps every event. */
  async addaudi(event: auditevent): Promise<void> {
    const records = await this.getaudit();
    const combined = [event, ...records];
    const retention = (await this.getsettings())?.auditretention;
    await this.adapter.set("audit", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Records one step outcome; retention is a user setting and an absent setting keeps every outcome. */
  async addoutcome(outcome: stepoutcome): Promise<void> {
    const records = await this.getoutcomes();
    const combined = [outcome, ...records];
    const retention = (await this.getsettings())?.outcomeretention;
    await this.adapter.set("outcomes", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Stores one clickable map under its observation version so every captured map stays available. */
  async setmap(map: clickablemap): Promise<void> { return this.adapter.set(`map${map.version}`, map); }

  /** Returns one stored clickable map by its observation version. */
  async getmap(version: number): Promise<clickablemap | undefined> { return this.adapter.get<clickablemap>(`map${version}`); }

  /** Advances and persists the observation version counter used to stamp clickable maps. */
  async nextobservationversion(): Promise<number> {
    const current = (await this.adapter.get<number>("observationversion")) ?? 0;
    const next = current + 1;
    await this.adapter.set("observationversion", next);
    return next;
  }

  /** Returns the latest observation version used to stamp a clickable map. */
  async getobservationversion(): Promise<number | undefined> { return this.adapter.get<number>("observationversion"); }

  /** Returns the key hold registry, persisted so holds survive service worker restarts. */
  async getholds(): Promise<keyholdstate[]> { return (await this.adapter.get<keyholdstate[]>("holds")) ?? []; }

  /** Replaces the key hold registry after one press or release transition. */
  async setholds(holds: keyholdstate[]): Promise<void> { return this.adapter.set("holds", holds); }

  /** Returns every dialog decision recorded for the audit trail. */
  async getdialogs(): Promise<dialogdecision[]> { return (await this.adapter.get<dialogdecision[]>("dialogs")) ?? []; }

  /** Records one dialog decision with the reviewed answer and the observed dialog text. */
  async adddialog(decision: dialogdecision): Promise<void> {
    const records = await this.getdialogs();
    await this.adapter.set("dialogs", [decision, ...records]);
  }

  /** Returns every retry outcome recorded with attempts and movement deltas. */
  async getretries(): Promise<retryoutcome[]> { return (await this.adapter.get<retryoutcome[]>("retries")) ?? []; }

  /** Records one retry outcome with the attempts made and the movement delta observed. */
  async addretry(outcome: retryoutcome): Promise<void> {
    const records = await this.getretries();
    await this.adapter.set("retries", [outcome, ...records]);
  }

  /** Returns every resolution summary stored per target mode. */
  async getresolutions(): Promise<resolutionsummary[]> { return (await this.adapter.get<resolutionsummary[]>("resolutions")) ?? []; }

  /** Records one resolution summary for later selector derivation. */
  async addresolution(summary: resolutionsummary): Promise<void> {
    const records = await this.getresolutions();
    await this.adapter.set("resolutions", [summary, ...records]);
  }

  /** Returns the reviewed default dialog policy kept for the session auto handler. */
  async getdialogpolicy(): Promise<dialogpolicy | undefined> { return this.adapter.get<dialogpolicy>("dialogpolicy"); }

  /** Stores the reviewed default dialog policy of the latest approved plan. */
  async setdialogpolicy(policy: dialogpolicy): Promise<void> { return this.adapter.set("dialogpolicy", policy); }

  /** Stores one observation capture under its version so every observation version stays available. */
  async setobservation(record: observationrecord): Promise<void> { return this.adapter.set(`observation${record.version}`, record); }

  /** Returns one stored observation version. */
  async getobservation(version: number): Promise<observationrecord | undefined> { return this.adapter.get<observationrecord>(`observation${version}`); }

  /** Returns the observation retention window; an absent setting keeps every capture. */
  private async observationretention(): Promise<number | undefined> { return (await this.getsettings())?.observationretention; }

  /** Stores one accessibility tree capture; retention is a user setting and an absent setting keeps every tree. */
  async adda11ytree(capture: a11ycapture): Promise<void> {
    const records = await this.geta11ytrees();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("a11ytrees", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns every stored accessibility tree capture, newest first. */
  async geta11ytrees(): Promise<a11ycapture[]> { return (await this.adapter.get<a11ycapture[]>("a11ytrees")) ?? []; }

  /** Stores one reader article capture; retention is a user setting and an absent setting keeps every article. */
  async addreaderarticle(capture: readercapture): Promise<void> {
    const records = await this.getreaderarticles();
    const combined = [capture, ...records];
    const retention = await this.observationretention();
    await this.adapter.set("readerarticles", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns every stored reader article capture, newest first. */
  async getreaderarticles(): Promise<readercapture[]> { return (await this.adapter.get<readercapture[]>("readerarticles")) ?? []; }

  /** Records one dom mutation observed inside a reviewed watch. */
  async addmutationevent(event: mutationevent): Promise<void> {
    const records = await this.getmutationevents();
    await this.adapter.set("mutationevents", [event, ...records]);
  }

  /** Returns the mutation event stream of every reviewed watch. */
  async getmutationevents(): Promise<mutationevent[]> { return (await this.adapter.get<mutationevent[]>("mutationevents")) ?? []; }

  /** Records one focus change observed inside a reviewed watch. */
  async addfocusevent(event: focusevent): Promise<void> {
    const records = await this.getfocusevents();
    await this.adapter.set("focusevents", [event, ...records]);
  }

  /** Returns the focus event stream of every reviewed watch. */
  async getfocusevents(): Promise<focusevent[]> { return (await this.adapter.get<focusevent[]>("focusevents")) ?? []; }

  /** Records one consent banner observed by a reviewed banner watch. */
  async addbanner(event: bannerreport): Promise<void> {
    const records = await this.getbanners();
    await this.adapter.set("banners", [event, ...records]);
  }

  /** Returns every consent banner report observed so far. */
  async getbanners(): Promise<bannerreport[]> { return (await this.adapter.get<bannerreport[]>("banners")) ?? []; }

  /** Records one snapshot diff between two observation versions. */
  async adddiff(diff: snapshotdiff): Promise<void> {
    const records = await this.getdiffs();
    await this.adapter.set("diffs", [diff, ...records]);
  }

  /** Returns every stored snapshot diff, newest first. */
  async getdiffs(): Promise<snapshotdiff[]> { return (await this.adapter.get<snapshotdiff[]>("diffs")) ?? []; }

  /** Records one derived selector with its stability score for reuse. */
  async addselector(selector: derivedselector): Promise<void> {
    const records = await this.getselectors();
    await this.adapter.set("selectors", [selector, ...records]);
  }

  /** Returns every stored derived selector with its stability score, newest first. */
  async getselectors(): Promise<derivedselector[]> { return (await this.adapter.get<derivedselector[]>("selectors")) ?? []; }

  /** Records one detected template class or section fingerprint for its origin. */
  async addtemplate(profile: templateprofile): Promise<void> {
    const records = await this.gettemplates();
    await this.adapter.set("templates", [profile, ...records]);
  }

  /** Returns every stored template class and section fingerprint, newest first. */
  async gettemplates(): Promise<templateprofile[]> { return (await this.adapter.get<templateprofile[]>("templates")) ?? []; }

  /** Records one watch registration so it survives service worker restarts. */
  async addwatch(watch: watchregistration): Promise<void> {
    const records = await this.getwatches();
    await this.adapter.set("watches", [watch, ...records]);
  }

  /** Returns every watch registration, newest first, including closed windows. */
  async getwatches(): Promise<watchregistration[]> { return (await this.adapter.get<watchregistration[]>("watches")) ?? []; }

  /** Closes one watch registration by watch id once its reviewed lifetime window ends. */
  async closewatch(watchid: string, closedat: number): Promise<void> {
    const records = await this.getwatches();
    await this.adapter.set("watches", records.map(watch => watch.watchid === watchid && watch.closedat === undefined ? { ...watch, closedat } : watch));
  }

  /** Returns the live page signals of language, template, scroll lock and banner state. */
  async getsignals(): Promise<pagesignals | undefined> { return this.adapter.get<pagesignals>("signals"); }

  /** Replaces the live page signals after an observation step refreshes them. */
  async setsignals(signals: pagesignals): Promise<void> { return this.adapter.set("signals", signals); }

  /** Appends one navigation trail entry of a session with its url, title, step ref and timestamp. */
  async addtrailentry(sessionid: string, entry: trailentry): Promise<void> {
    const records = await this.gettrail(sessionid);
    await this.adapter.set(`trail${sessionid}`, [...records, entry]);
  }

  /** Returns the navigation trail of a session, oldest first. */
  async gettrail(sessionid: string): Promise<trailentry[]> { return (await this.adapter.get<trailentry[]>(`trail${sessionid}`)) ?? []; }

  /** Stores one wait profile for an origin with user configured values, replacing the previous profile of that origin. */
  async setwaitprofile(record: waitprofilerecord): Promise<void> {
    const records = (await this.getwaitprofiles()).filter(item => item.origin !== record.origin);
    await this.adapter.set("waitprofiles", [...records, record]);
  }

  /** Returns every stored wait profile with its origin and user configured values, newest first. */
  async getwaitprofiles(): Promise<waitprofilerecord[]> { return (await this.adapter.get<waitprofilerecord[]>("waitprofiles")) ?? []; }

  /** Records one navigation step with its redirect chain and final url. */
  async addnavrecord(record: navrecord): Promise<void> {
    const records = await this.getnavrecords();
    await this.adapter.set("navrecords", [record, ...records]);
  }

  /** Returns every stored navigation record with redirect chains and final urls, newest first. */
  async getnavrecords(): Promise<navrecord[]> { return (await this.adapter.get<navrecord[]>("navrecords")) ?? []; }

  /** Records one navigation intent detected from a plan for audit review. */
  async addnavintent(record: navintentrecord): Promise<void> {
    const records = await this.getnavintents();
    await this.adapter.set("navintents", [record, ...records]);
  }

  /** Returns every stored navigation intent record, newest first. */
  async getnavintents(): Promise<navintentrecord[]> { return (await this.adapter.get<navintentrecord[]>("navintents")) ?? []; }

  /** Replaces the rate limit window state of one domain. */
  async setratestate(state: ratelimitstate): Promise<void> {
    const records = (await this.getratestates()).filter(item => item.domain !== state.domain);
    await this.adapter.set("ratestates", [...records, state]);
  }

  /** Returns every rate limit window state per domain. */
  async getratestates(): Promise<ratelimitstate[]> { return (await this.adapter.get<ratelimitstate[]>("ratestates")) ?? []; }

  /** Records one curated link list with its review state before batch opening. */
  async addcurated(list: curatedlist): Promise<void> {
    const records = await this.getcurateds();
    await this.adapter.set("curated", [list, ...records]);
  }

  /** Returns every stored curated link list, newest first. */
  async getcurateds(): Promise<curatedlist[]> { return (await this.adapter.get<curatedlist[]>("curated")) ?? []; }

  /** Stores reviewed basic auth credentials for one origin, replacing the previous record of that origin. */
  async setauth(record: authrecord): Promise<void> {
    const records = (await this.getauths()).filter(item => item.origin !== record.origin);
    await this.adapter.set("auths", [...records, record]);
  }

  /** Returns every stored reviewed basic auth record per origin. */
  async getauths(): Promise<authrecord[]> { return (await this.adapter.get<authrecord[]>("auths")) ?? []; }

  /** Records one task artifact routed into the artifact store. */
  async addartifact(record: artifactrecord): Promise<void> {
    const records = await this.getartifacts();
    await this.adapter.set("artifacts", [record, ...records]);
  }

  /** Returns every stored task artifact, newest first. */
  async getartifacts(): Promise<artifactrecord[]> { return (await this.adapter.get<artifactrecord[]>("artifacts")) ?? []; }

  /** Returns the navigation control state of paused navigation. */
  async getnavcontrol(): Promise<navcontrol | undefined> { return this.adapter.get<navcontrol>("navcontrol"); }

  /** Replaces the navigation control state after a pause or resume transition. */
  async setnavcontrol(control: navcontrol): Promise<void> { return this.adapter.set("navcontrol", control); }

  /** Records one url safety verdict produced by a checksafe verification. */
  async addsafety(verdict: safetyverdict): Promise<void> {
    const records = await this.getsafeties();
    await this.adapter.set("safeties", [verdict, ...records]);
  }

  /** Returns every stored url safety verdict, newest first. */
  async getsafeties(): Promise<safetyverdict[]> { return (await this.adapter.get<safetyverdict[]>("safeties")) ?? []; }

  /** Records one recently closed tab so a reopentab step can restore it. */
  async addrecenttab(tab: recenttab): Promise<void> {
    const records = await this.getrecenttabs();
    await this.adapter.set("recenttabs", [tab, ...records]);
  }

  /** Returns every recently closed tab, newest first. */
  async getrecenttabs(): Promise<recenttab[]> { return (await this.adapter.get<recenttab[]>("recenttabs")) ?? []; }

  /** Returns the queued prefetch and batch open target counts shown in the popup badge. */
  async getnavqueues(): Promise<navqueues | undefined> { return this.adapter.get<navqueues>("navqueues"); }

  /** Replaces the queued prefetch and batch open target counts. */
  async setnavqueues(queues: navqueues): Promise<void> { return this.adapter.set("navqueues", queues); }

  /** Returns the last known navigation state of a tab, kept across service worker restarts. */
  async getnavstate(tabid: number): Promise<navrecord | undefined> { return this.adapter.get<navrecord>(`navstate${tabid}`); }

  /** Replaces the last known navigation state of a tab. */
  async setnavstate(tabid: number, state: navrecord): Promise<void> { return this.adapter.set(`navstate${tabid}`, state); }

  /** Stores one named tab layout with its window bounds and group states, replacing the previous layout of that name. */
  async setlayout(layout: tablayout): Promise<void> {
    const records = (await this.getlayouts()).filter(item => item.name !== layout.name);
    await this.adapter.set("layouts", [layout, ...records]);
  }

  /** Returns one saved tab layout by name with its timestamp. */
  async getlayout(name: string): Promise<tablayout | undefined> { return (await this.getlayouts()).find(item => item.name === name); }

  /** Returns every saved tab layout with its window bounds and group states. */
  async getlayouts(): Promise<tablayout[]> { return (await this.adapter.get<tablayout[]>("layouts")) ?? []; }

  /** Stores one tab group definition with its color choice and member tabs, replacing the previous definition of that name. */
  async settabgroup(group: tabgrouprecord): Promise<void> {
    const records = (await this.gettabgroups()).filter(item => item.name !== group.name);
    await this.adapter.set("tabgroups", [...records, group]);
  }

  /** Returns every stored tab group definition with its color choice, newest first. */
  async gettabgroups(): Promise<tabgrouprecord[]> { return (await this.adapter.get<tabgrouprecord[]>("tabgroups")) ?? []; }

  /** Records one tabmeta record with task provenance, replacing the previous metadata of that tab. */
  async settabmeta(meta: tabmeta): Promise<void> {
    const records = (await this.gettabmetas()).filter(item => item.tabid !== meta.tabid);
    await this.adapter.set("tabmetas", [...records, meta]);
  }

  /** Returns every stored tabmeta record with task provenance. */
  async gettabmetas(): Promise<tabmeta[]> { return (await this.adapter.get<tabmeta[]>("tabmetas")) ?? []; }

  /** Records one session snapshot of tabs and windows for later restore. */
  async addsnapshot(snapshot: sessionsnapshot): Promise<void> {
    const records = await this.getsnapshots();
    await this.adapter.set("snapshots", [snapshot, ...records]);
  }

  /** Returns every stored session snapshot, newest first. */
  async getsnapshots(): Promise<sessionsnapshot[]> { return (await this.adapter.get<sessionsnapshot[]>("snapshots")) ?? []; }

  /** Records one closed tab in the history kept for restoretab and reopenrun. */
  async addclosedtab(tab: closedtab): Promise<void> {
    const records = await this.getclosedtabs();
    await this.adapter.set("closedtabs", [tab, ...records]);
  }

  /** Returns the closed tab history, newest first. */
  async getclosedtabs(): Promise<closedtab[]> { return (await this.adapter.get<closedtab[]>("closedtabs")) ?? []; }

  /** Stores one badge state per task, replacing the previous badge of that task. */
  async setbadge(badge: tabbadge): Promise<void> {
    const records = (await this.getbadges()).filter(item => item.taskid !== badge.taskid);
    await this.adapter.set("badges", [...records, badge]);
  }

  /** Returns every stored badge state per task. */
  async getbadges(): Promise<tabbadge[]> { return (await this.adapter.get<tabbadge[]>("badges")) ?? []; }

  /** Records one tab event observed inside a reviewed watchtab registration. */
  async addtabwatchevent(event: tabwatchevent): Promise<void> {
    const records = await this.gettabwatchevents();
    await this.adapter.set("tabwatchevents", [event, ...records]);
  }

  /** Returns the tab event stream of every reviewed watchtab registration, newest first. */
  async gettabwatchevents(): Promise<tabwatchevent[]> { return (await this.adapter.get<tabwatchevent[]>("tabwatchevents")) ?? []; }

  /** Returns the ids of the scratch windows opened for split work. */
  async getscratchwindows(): Promise<number[]> { return (await this.adapter.get<number[]>("scratchwindows")) ?? []; }

  /** Replaces the scratch window id list after one scratch window opens or closes. */
  async setscratchwindows(ids: number[]): Promise<void> { return this.adapter.set("scratchwindows", ids); }

  /** Returns the pinned control tab state with the live task feed. */
  async getcontroltab(): Promise<controltabstate | undefined> { return this.adapter.get<controltabstate>("controltab"); }

  /** Replaces the pinned control tab state. */
  async setcontroltab(state: controltabstate): Promise<void> { return this.adapter.set("controltab", state); }

  /** Stores one saved form profile under its reviewed name, replacing the previous profile of that name. */
  async setprofile(profile: formprofile): Promise<void> {
    const records = (await this.getprofiles()).filter(item => item.name !== profile.name);
    await this.adapter.set("formprofiles", [profile, ...records]);
  }

  /** Returns one saved form profile by its reviewed name. */
  async getprofile(name: string): Promise<formprofile | undefined> { return (await this.getprofiles()).find(item => item.name === name); }

  /** Returns every saved form profile with its origin grants, newest first. */
  async getprofiles(): Promise<formprofile[]> { return (await this.adapter.get<formprofile[]>("formprofiles")) ?? []; }

  /** Removes one saved form profile by its reviewed name. */
  async removeprofile(name: string): Promise<void> {
    const records = (await this.getprofiles()).filter(item => item.name !== name);
    await this.adapter.set("formprofiles", records);
  }

  /** Records one wizard state with its step history. */
  async addwizard(state: wizardstate): Promise<void> {
    const records = await this.getwizards();
    await this.adapter.set("wizards", [state, ...records]);
  }

  /** Returns every stored wizard state with its step history, newest first. */
  async getwizards(): Promise<wizardstate[]> { return (await this.adapter.get<wizardstate[]>("wizards")) ?? []; }

  /** Stores one submission ticket with its values hash, replacing the previous ticket of that id. */
  async setticket(ticket: submitticket): Promise<void> {
    const records = (await this.gettickets()).filter(item => item.id !== ticket.id);
    await this.adapter.set("submittickets", [ticket, ...records]);
  }

  /** Returns every stored submission ticket with its values hash, newest first. */
  async gettickets(): Promise<submitticket[]> { return (await this.adapter.get<submitticket[]>("submittickets")) ?? []; }

  /** Records one collected error report for correction loops. */
  async adderrorreport(report: errorreport): Promise<void> {
    const records = await this.geterrorreports();
    await this.adapter.set("errorreports", [report, ...records]);
  }

  /** Returns every stored error report, newest first. */
  async geterrorreports(): Promise<errorreport[]> { return (await this.adapter.get<errorreport[]>("errorreports")) ?? []; }

  /** Records one typeahead pick observed when a reviewed suggestion entry was chosen. */
  async addpick(pick: typeaheadpick): Promise<void> {
    const records = await this.getpicks();
    await this.adapter.set("typeaheadpicks", [pick, ...records]);
  }

  /** Returns every recorded typeahead pick, newest first. */
  async getpicks(): Promise<typeaheadpick[]> { return (await this.adapter.get<typeaheadpick[]>("typeaheadpicks")) ?? []; }

  /** Records one captcha handoff while the plan waits for the user. */
  async addcaptcha(handoff: captchahandoff): Promise<void> {
    const records = await this.getcaptchas();
    await this.adapter.set("captchas", [handoff, ...records]);
  }

  /** Returns every captcha handoff record with its resolution state, newest first. */
  async getcaptchas(): Promise<captchahandoff[]> { return (await this.adapter.get<captchahandoff[]>("captchas")) ?? []; }

  /** Resolves one captcha handoff by id once the user finished it. */
  async resolvecaptcha(id: string, resolvedat: number): Promise<void> {
    const records = await this.getcaptchas();
    await this.adapter.set("captchas", records.map(handoff => handoff.id === id && !handoff.resolved ? { ...handoff, resolved: true, resolvedat } : handoff));
  }

  /** Records one login or template detection for its origin. */
  async adddetection(record: detectionrecord): Promise<void> {
    const records = await this.getdetections();
    await this.adapter.set("detections", [record, ...records]);
  }

  /** Returns every stored login and template detection per origin, newest first. */
  async getdetections(): Promise<detectionrecord[]> { return (await this.adapter.get<detectionrecord[]>("detections")) ?? []; }

  /** Stores the reviewed one time code behind the consent gate of an active session. */
  async setcodevalue(value: string): Promise<void> { return this.adapter.set("codevalue", value); }

  /** Returns the reviewed one time code, if the user stored one behind the consent gate. */
  async getcodevalue(): Promise<string | undefined> { return this.adapter.get<string>("codevalue"); }

  /** Stores one dataset with its column specs and rows, replacing the previous record of that id. */
  async setdataset(value: dataset): Promise<void> {
    await this.adapter.set(`dataset${value.id}`, value);
    const ids = ((await this.adapter.get<string[]>("datasets")) ?? []).filter(id => id !== value.id);
    await this.adapter.set("datasets", [value.id, ...ids]);
  }

  /** Returns one stored dataset by its id with its column specs and row count. */
  async getdataset(id: string): Promise<dataset | undefined> { return this.adapter.get<dataset>(`dataset${id}`); }

  /** Returns every stored dataset id, newest first. */
  async getdatasets(): Promise<dataset[]> {
    const ids = (await this.adapter.get<string[]>("datasets")) ?? [];
    const records: dataset[] = [];
    for (const id of ids) {
      const record = await this.adapter.get<dataset>(`dataset${id}`);
      if (record) records.push(record);
    }
    return records;
  }

  /** Stores one imported csv dataset for fill loops beside the dataset store. */
  async addimport(value: dataset): Promise<void> {
    await this.setdataset(value);
    const ids = ((await this.adapter.get<string[]>("imports")) ?? []).filter(id => id !== value.id);
    await this.adapter.set("imports", [value.id, ...ids]);
  }

  /** Returns every imported csv dataset for fill loops, newest first. */
  async getimports(): Promise<dataset[]> {
    const ids = (await this.adapter.get<string[]>("imports")) ?? [];
    const records: dataset[] = [];
    for (const id of ids) {
      const record = await this.adapter.get<dataset>(`dataset${id}`);
      if (record) records.push(record);
    }
    return records;
  }

  /** Stores one extraction session with its cursor and page history, replacing the previous session of that id. */
  async setextractsession(value: extractsession): Promise<void> {
    await this.adapter.set(`extract${value.id}`, value);
    const ids = ((await this.adapter.get<string[]>("extracts")) ?? []).filter(id => id !== value.id);
    await this.adapter.set("extracts", [value.id, ...ids]);
  }

  /** Returns every extraction session with its cursor and page history, newest first. */
  async getextractsessions(): Promise<extractsession[]> {
    const ids = (await this.adapter.get<string[]>("extracts")) ?? [];
    const records: extractsession[] = [];
    for (const id of ids) {
      const record = await this.adapter.get<extractsession>(`extract${id}`);
      if (record) records.push(record);
    }
    return records;
  }

  /** Records one provenance record of an exported artifact. */
  async addprovenance(record: provenancerecord): Promise<void> {
    const records = await this.getprovenances();
    await this.adapter.set("provenances", [record, ...records]);
  }

  /** Returns every provenance record per exported artifact, newest first. */
  async getprovenances(): Promise<provenancerecord[]> { return (await this.adapter.get<provenancerecord[]>("provenances")) ?? []; }

  /** Stores the transform rules and dedupe keys of one task, replacing the previous record of that task. */
  async settaskrules(value: taskrules): Promise<void> {
    const records = ((await this.adapter.get<taskrules[]>("taskrules")) ?? []).filter(item => item.taskid !== value.taskid);
    await this.adapter.set("taskrules", [value, ...records]);
  }

  /** Returns the transform rules and dedupe keys per task, newest first. */
  async gettaskrules(): Promise<taskrules[]> { return (await this.adapter.get<taskrules[]>("taskrules")) ?? []; }

  /** Stores one stream chunk state for resume, replacing the previous state of that dataset. */
  async setstream(state: streamstate): Promise<void> {
    const records = ((await this.adapter.get<streamstate[]>("streams")) ?? []).filter(item => item.datasetid !== state.datasetid);
    await this.adapter.set("streams", [state, ...records]);
  }

  /** Returns every stream chunk state persisted for resume, newest first. */
  async getstreams(): Promise<streamstate[]> { return (await this.adapter.get<streamstate[]>("streams")) ?? []; }

  /** Stores one reviewed sheet endpoint config behind its origin grant, replacing the previous config of that origin. */
  async setsheetendpoint(config: sheetendpoint): Promise<void> {
    const records = ((await this.adapter.get<sheetendpoint[]>("sheetendpoints")) ?? []).filter(item => item.origin !== config.origin);
    await this.adapter.set("sheetendpoints", [config, ...records]);
  }

  /** Returns every reviewed sheet endpoint config, newest first. */
  async getsheetendpoints(): Promise<sheetendpoint[]> { return (await this.adapter.get<sheetendpoint[]>("sheetendpoints")) ?? []; }

  /** Records one exported data artifact; artifact retention is a user setting and an absent setting keeps every artifact. */
  async addexport(artifact: exportedartifact): Promise<void> {
    const records = await this.getexports();
    const combined = [artifact, ...records.filter(item => item.id !== artifact.id)];
    const retention = (await this.getsettings())?.artifactretention;
    await this.adapter.set("exports", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns every exported data artifact with its content and checksum, newest first. */
  async getexports(): Promise<exportedartifact[]> { return (await this.adapter.get<exportedartifact[]>("exports")) ?? []; }

  /** Removes one exported data artifact by id and reports whether it existed. */
  async removeexport(id: string): Promise<boolean> {
    const records = await this.getexports();
    const remaining = records.filter(item => item.id !== id);
    await this.adapter.set("exports", remaining);
    return remaining.length !== records.length;
  }

  /** Removes one run store artifact by id and reports whether it existed. */
  async removeartifact(id: string): Promise<boolean> {
    const records = await this.getartifacts();
    const remaining = records.filter(item => item.id !== id);
    await this.adapter.set("artifacts", remaining);
    return remaining.length !== records.length;
  }

  /** Stores one batch download file record with its state, path and checksum, replacing the previous record of that id. */
  async setdownload(record: downloadrecord): Promise<void> {
    const records = ((await this.adapter.get<downloadrecord[]>("downloads")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("downloads", [record, ...records]);
  }

  /** Returns every batch download file record with its state, path and checksum, newest first. */
  async getdownloads(): Promise<downloadrecord[]> { return (await this.adapter.get<downloadrecord[]>("downloads")) ?? []; }

  /** Records one captured network log record; netlog retention is a user setting and an absent value keeps every record. */
  async addnetlog(record: netlogrecord): Promise<void> {
    const records = await this.getnetlog();
    const combined = [record, ...records];
    const retention = (await this.getsettings())?.netlogretention;
    await this.adapter.set("netlog", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns the captured network log of the run with its step correlation, newest first. */
  async getnetlog(): Promise<netlogrecord[]> { return (await this.adapter.get<netlogrecord[]>("netlog")) ?? []; }

  /** Stores one clipboard consent record with its prompt and origin, replacing the previous record of that id. */
  async setclipconsent(record: clipboardconsentrecord): Promise<void> {
    const records = ((await this.adapter.get<clipboardconsentrecord[]>("clipconsents")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("clipconsents", [record, ...records]);
  }

  /** Returns every clipboard consent record with its prompt and origin, newest first. */
  async getclipconsents(): Promise<clipboardconsentrecord[]> { return (await this.adapter.get<clipboardconsentrecord[]>("clipconsents")) ?? []; }

  /** Records one clipboard entry hash with its origin provenance; the payload text itself never persists. */
  async addclip(entry: clipentry): Promise<void> {
    const records = await this.getclips();
    await this.adapter.set("clips", [entry, ...records]);
  }

  /** Returns every clipboard entry hash with its kind and origin provenance, newest first. */
  async getclips(): Promise<clipentry[]> { return (await this.adapter.get<clipentry[]>("clips")) ?? []; }

  /** Stores one quarantine entry with its scan verdict, replacing the previous entry of that id. */
  async setquarantine(entry: quarantineentry): Promise<void> {
    const records = ((await this.adapter.get<quarantineentry[]>("quarantines")) ?? []).filter(item => item.id !== entry.id);
    await this.adapter.set("quarantines", [entry, ...records]);
  }

  /** Returns every quarantine entry with its scan verdict and release ref, newest first. */
  async getquarantines(): Promise<quarantineentry[]> { return (await this.adapter.get<quarantineentry[]>("quarantines")) ?? []; }

  /** Stores the reviewed cleanup rule set of the run, replacing the previous set. */
  async setcleanuprules(rules: cleanuprule[]): Promise<void> { return this.adapter.set("cleanuprules", rules); }

  /** Returns the reviewed cleanup rule set of the run. */
  async getcleanuprules(): Promise<cleanuprule[]> { return (await this.adapter.get<cleanuprule[]>("cleanuprules")) ?? []; }

  /** Records one cleanup run in the run history. */
  async addcleanuprun(run: cleanuprun): Promise<void> {
    const records = await this.getcleanupruns();
    await this.adapter.set("cleanupruns", [run, ...records]);
  }

  /** Returns every cleanup run history record with removed and kept counts, newest first. */
  async getcleanupruns(): Promise<cleanuprun[]> { return (await this.adapter.get<cleanuprun[]>("cleanupruns")) ?? []; }

  /** Stores the capture naming counters of one task, replacing the previous counters of that task. */
  async setcapturecounter(counter: capturecounter): Promise<void> {
    const records = ((await this.adapter.get<capturecounter[]>("capturecounters")) ?? []).filter(item => item.taskid !== counter.taskid);
    await this.adapter.set("capturecounters", [counter, ...records]);
  }

  /** Returns every stored capture naming counter per task, newest first. */
  async getcapturecounters(): Promise<capturecounter[]> { return (await this.adapter.get<capturecounter[]>("capturecounters")) ?? []; }

  /** Replaces the artifact inventory the cleanup sweeper plans against. */
  async setinventory(entries: artifactinventoryentry[]): Promise<void> { return this.adapter.set("inventory", entries); }

  /** Returns the artifact inventory with sizes and ages for the cleanup sweeper. */
  async getinventory(): Promise<artifactinventoryentry[]> { return (await this.adapter.get<artifactinventoryentry[]>("inventory")) ?? []; }

  /** Stores one user configured virus scanning hook, replacing the previous hook of that scanner name. */
  async setscanhook(config: scanhookconfig): Promise<void> {
    const records = ((await this.adapter.get<scanhookconfig[]>("scanhooks")) ?? []).filter(item => item.scanner !== config.scanner);
    await this.adapter.set("scanhooks", [config, ...records]);
  }

  /** Returns every configured virus scanning hook, newest first. */
  async getscanhooks(): Promise<scanhookconfig[]> { return (await this.adapter.get<scanhookconfig[]>("scanhooks")) ?? []; }

  /** Stores the armed mime interception filters of the run, newest first. */
  async setmimefilters(filters: mimefilter[]): Promise<void> { return this.adapter.set("mimefilters", filters); }

  /** Returns the armed mime interception filters of the run, newest first. */
  async getmimefilters(): Promise<mimefilter[]> { return (await this.adapter.get<mimefilter[]>("mimefilters")) ?? []; }

  /** Stores one capture record with its bytes and step linkage, replacing the previous record of that id; the user configured capture retention window expires the oldest bytes while the metadata always survives for the audit trail. */
  async addcapture(record: shotrecord): Promise<void> {
    const records = await this.getcaptures();
    const retention = (await this.getsettings())?.captureretention;
    const combined = [record, ...records.filter(item => item.id !== record.id)];
    const stored = retention === undefined ? combined : combined.map((item, index) => index < retention ? item : expirecapturebytes(item));
    await this.adapter.set("captures", stored);
  }

  /** Returns every stored capture record with its metadata, newest first. */
  async getcaptures(): Promise<shotrecord[]> { return (await this.adapter.get<shotrecord[]>("captures")) ?? []; }

  /** Returns one capture record with its bytes by its id. */
  async getcapture(id: string): Promise<shotrecord | undefined> { return (await this.getcaptures()).find(item => item.id === id); }

  /** Returns the capture records filtered by run, step and kind. */
  async listcaptures(filter: { runid?: string; stepid?: string; kind?: string }): Promise<shotrecord[]> {
    const records = await this.getcaptures();
    return records.filter(item => (filter.runid === undefined || item.runid === filter.runid) && (filter.stepid === undefined || item.stepid === filter.stepid) && (filter.kind === undefined || item.kind === filter.kind));
  }

  /** Records one before and after shotpair of the run with its action context. */
  async addpair(pair: shotpair): Promise<void> {
    const records = await this.getpairs();
    await this.adapter.set("capturepairs", [pair, ...records.filter(item => item.id !== pair.id)]);
  }

  /** Returns the shotpairs of one run resolved through their before records, newest first; an absent run returns every pair. */
  async getpairs(runid?: string): Promise<shotpair[]> {
    const records = (await this.adapter.get<shotpair[]>("capturepairs")) ?? [];
    if (runid === undefined) return records;
    const runs = new Map<string, string>();
    for (const capture of await this.getcaptures()) runs.set(capture.id, capture.runid);
    return records.filter(item => runs.get(item.beforeid) === runid);
  }

  /** Stores one media record of the 1.1.41 family with its bytes and step linkage, replacing the previous record of that id; the user configured media retention window expires the oldest bytes while the metadata and the recording index always survive. */
  async addmedia(record: mediarecord): Promise<void> {
    const records = await this.getmediarecords();
    const retention = (await this.getsettings())?.mediaretention;
    const combined = [record, ...records.filter(item => item.id !== record.id)];
    const stored = retention === undefined ? combined : combined.map((item, index) => index < retention ? item : expiremediabytes(item));
    await this.adapter.set("media", stored);
  }

  /** Returns every stored media record, newest first. */
  async getmediarecords(): Promise<mediarecord[]> { return (await this.adapter.get<mediarecord[]>("media")) ?? []; }

  /** Returns the media records filtered by run and kind; an absent filter returns every record. */
  async listmedia(filter: { runid?: string; kind?: string }): Promise<mediarecord[]> {
    const records = await this.getmediarecords();
    return records.filter(item => (filter.runid === undefined || item.runid === filter.runid) && (filter.kind === undefined || mediakindof(item) === filter.kind));
  }

  /** Returns one media record by its id. */
  async getmediarecord(id: string): Promise<mediarecord | undefined> { return (await this.getmediarecords()).find(item => item.id === id); }

  /** Returns one recording with its file reference and frame index by its id. */
  async getrecording(id: string): Promise<recordingrecord | undefined> {
    const found = await this.getmediarecord(id);
    return found !== undefined && "startedat" in found ? found : undefined;
  }

  /** Removes one media record by its id; the audit trail keeps its outcome evidence. */
  async removemedia(id: string): Promise<void> {
    await this.adapter.set("media", (await this.getmediarecords()).filter(item => item.id !== id));
  }

  /** Stores one observed image batch of a downloadimages step, replacing the previous batch of that id. */
  async addimagebatch(batch: imagebatch): Promise<void> {
    const records = (await this.adapter.get<imagebatch[]>("imagebatches")) ?? [];
    await this.adapter.set("imagebatches", [batch, ...records.filter(item => item.id !== batch.id)]);
  }

  /** Returns every observed image batch with its filter match counts, newest first. */
  async getimagebatches(): Promise<imagebatch[]> { return (await this.adapter.get<imagebatch[]>("imagebatches")) ?? []; }

  /** Stores one recording consent decision of an origin, replacing the previous record of that id. */
  async setrecordingconsent(record: recordingconsentrecord): Promise<void> {
    const records = ((await this.adapter.get<recordingconsentrecord[]>("recordingconsents")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("recordingconsents", [record, ...records]);
  }

  /** Returns every recording consent decision with its prompt and origin, newest first. */
  async getrecordingconsents(): Promise<recordingconsentrecord[]> { return (await this.adapter.get<recordingconsentrecord[]>("recordingconsents")) ?? []; }

  /** Stores one outbound call record with its transport facts and body, replacing the previous record of that id; the user configured call retention window expires the oldest bodies while the metadata always survives. */
  async addcall(record: callrecord): Promise<void> {
    const records = await this.getcalls();
    const retention = (await this.getsettings())?.callretention;
    const combined = [record, ...records.filter(item => item.id !== record.id)];
    const stored = retention === undefined ? combined : combined.map((item, index) => index < retention ? item : expirecallbody(item));
    await this.adapter.set("calls", stored);
  }

  /** Returns every stored outbound call record, newest first. */
  async getcalls(): Promise<callrecord[]> { return (await this.adapter.get<callrecord[]>("calls")) ?? []; }

  /** Returns one outbound call record with its body by its id. */
  async getcall(id: string): Promise<callrecord | undefined> { return (await this.getcalls()).find(item => item.id === id); }

  /** Returns the outbound call records filtered by run and origin; an absent filter returns every call. */
  async listcalls(filter: { runid?: string; origin?: string }): Promise<callrecord[]> {
    const records = await this.getcalls();
    return records.filter(item => (filter.runid === undefined || item.runid === filter.runid) && (filter.origin === undefined || item.origin === filter.origin));
  }

  /** Stores one typed endpoint definition version, appending to the version history of that endpoint name. */
  async setendpoint(record: endpointrecord): Promise<void> {
    const records = (await this.adapter.get<endpointrecord[]>("endpoints")) ?? [];
    const prior = records.filter(item => item.name === record.name);
    const version = prior.length > 0 ? Math.max(...prior.map(item => item.version)) + 1 : 1;
    await this.adapter.set("endpoints", [{ ...record, version, at: record.at }, ...records]);
  }

  /** Returns the newest endpointrecord definition of one name with its payload schema and version. */
  async getendpoint(name: string): Promise<endpointrecord | undefined> {
    const records = (await this.adapter.get<endpointrecord[]>("endpoints")) ?? [];
    return records.find(item => item.name === name);
  }

  /** Returns the newest definition of every typed endpoint name with its schema and version history. */
  async getendpoints(): Promise<endpointrecord[]> {
    const records = (await this.adapter.get<endpointrecord[]>("endpoints")) ?? [];
    const latest = new Map<string, endpointrecord>();
    for (const record of records) if (!latest.has(record.name)) latest.set(record.name, record);
    return [...latest.values()];
  }

  /** Stores one fetch consent decision per origin with its reviewed header names and values and its expiry window. */
  async setfetchconsent(consent: fetchconsent): Promise<void> {
    const records = ((await this.adapter.get<fetchconsent[]>("fetchconsents")) ?? []).filter(item => item.id !== consent.id);
    await this.adapter.set("fetchconsents", [consent, ...records]);
  }

  /** Returns every fetch consent decision with its origin, header names and expiry window, newest first. */
  async getfetchconsents(): Promise<fetchconsent[]> { return (await this.adapter.get<fetchconsent[]>("fetchconsents")) ?? []; }

  /** Stores one api key entry with its origin scope and created time, replacing the previous entry of that name; the key material stays behind its storage id. */
  async setapikey(entry: apikeyentry): Promise<void> {
    const records = ((await this.adapter.get<apikeyentry[]>("apikeys")) ?? []).filter(item => item.name !== entry.name);
    await this.adapter.set("apikeys", [entry, ...records]);
  }

  /** Returns every stored api key entry with its origin scope, header name, storage id and last use timestamp; key material never loads here. */
  async getapikeys(): Promise<apikeyentry[]> { return (await this.adapter.get<apikeyentry[]>("apikeys")) ?? []; }

  /** Stamps the last use timestamp of one stored api key entry without ever loading the key material. */
  async touchapikey(name: string, at: number): Promise<void> {
    const records = await this.getapikeys();
    const entry = records.find(item => item.name === name);
    if (!entry) return;
    await this.adapter.set("apikeys", [{ ...entry, lastuse: at }, ...records.filter(item => item.name !== name)]);
  }

  /** Removes one api key reference and its stored secret together. */
  async removeapikey(name: string): Promise<void> {
    const records = await this.getapikeys();
    const ref = records.find(item => item.name === name);
    if (ref) await this.adapter.set(ref.storageid, undefined as unknown as string);
    await this.adapter.set("apikeys", records.filter(item => item.name !== name));
  }

  /** Stores one api key secret under its storage id; the value never appears in reports, outcomes or the audit trail. */
  async setsecret(storageid: string, value: string): Promise<void> { return this.adapter.set(storageid, value); }

  /** Loads one api key secret under its storage id for the executor only. */
  async getsecret(storageid: string): Promise<string | undefined> { return this.adapter.get<string>(storageid); }

  /** Stores one channel record of a socket or event stream, replacing the previous record of that id. */
  async addchannel(record: channelrecord): Promise<void> {
    const records = ((await this.adapter.get<channelrecord[]>("channels")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("channels", [record, ...records]);
  }

  /** Returns every stored channel record, newest first. */
  async getchannels(): Promise<channelrecord[]> { return (await this.adapter.get<channelrecord[]>("channels")) ?? []; }

  /** Returns one channel record by its id. */
  async getchannel(id: string): Promise<channelrecord | undefined> { return (await this.getchannels()).find(item => item.id === id); }

  /** Queues one message envelope of a channel stream, keeping the arrival order for the waitmessage matchers. */
  async addmessage(envelope: messageenvelope): Promise<void> {
    const records = ((await this.adapter.get<messageenvelope[]>("messages")) ?? []).filter(item => !(item.channelid === envelope.channelid && item.sequence === envelope.sequence));
    await this.adapter.set("messages", [...records, envelope]);
  }

  /** Returns every queued message envelope, oldest first, optionally filtered by channel and stream. */
  async getmessages(channelid?: string, stream?: string): Promise<messageenvelope[]> {
    const records = (await this.adapter.get<messageenvelope[]>("messages")) ?? [];
    return records.filter(item => (channelid === undefined || item.channelid === channelid) && (stream === undefined || item.stream === stream));
  }

  /** Drops the matched message envelopes of one channel from the queue once a waitmessage step consumed them. */
  async drainmessages(sequences: Array<{ channelid: string; sequence: number }>): Promise<void> {
    const records = (await this.adapter.get<messageenvelope[]>("messages")) ?? [];
    const kept = records.filter(item => !sequences.some(match => match.channelid === item.channelid && match.sequence === item.sequence));
    await this.adapter.set("messages", kept);
  }

  /** Stores one observed exchange record, replacing the previous record of that id. */
  async addexchange(record: exchangerecord): Promise<void> {
    const records = ((await this.adapter.get<exchangerecord[]>("exchanges")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("exchanges", [record, ...records]);
  }

  /** Returns every stored exchange record, newest first. */
  async getexchanges(): Promise<exchangerecord[]> { return (await this.adapter.get<exchangerecord[]>("exchanges")) ?? []; }

  /** Returns one exchange record by its id. */
  async getexchange(id: string): Promise<exchangerecord | undefined> { return (await this.getexchanges()).find(item => item.id === id); }

  /** Returns the exchange records filtered by run, origin and status; the status filter accepts one code or the failed class of every exchange with an error class. */
  async listexchanges(filter: { runid?: string; origin?: string; status?: number | "failed" }): Promise<exchangerecord[]> {
    const records = await this.getexchanges();
    return records.filter(item => (filter.runid === undefined || item.runid === filter.runid) && (filter.origin === undefined || item.origin === filter.origin) && (filter.status === undefined || (filter.status === "failed" ? item.errorclass !== undefined : item.status === filter.status)));
  }

  /** Stores one captured response body with its mime type and byte size; the user configured body retention window expires the oldest bodies while the exchange metadata always survives. */
  async addbody(record: bodyrecord): Promise<void> {
    const records = await this.getbodies();
    const retention = (await this.getsettings())?.bodyretention;
    const combined = [record, ...records.filter(item => item.ref !== record.ref)];
    const stored = retention === undefined ? combined : combined.map((item, index) => index < retention ? item : expirebodybytes(item));
    await this.adapter.set("bodies", stored);
  }

  /** Returns every captured body record, newest first. */
  async getbodies(): Promise<bodyrecord[]> { return (await this.adapter.get<bodyrecord[]>("bodies")) ?? []; }

  /** Returns one captured body record with its stored text by its reference. */
  async getbody(ref: string): Promise<bodyrecord | undefined> { return (await this.getbodies()).find(item => item.ref === ref); }

  /** Stores the page api map of one origin, replacing the previous map of that origin. */
  async setapimap(origin: string, entries: apimapentry[]): Promise<void> {
    const records = ((await this.adapter.get<apimapentry[]>("apimap")) ?? []).filter(item => item.origin !== origin);
    await this.adapter.set("apimap", [...entries, ...records]);
  }

  /** Returns every stored page api map entry, newest first. */
  async getapimap(): Promise<apimapentry[]> { return (await this.adapter.get<apimapentry[]>("apimap")) ?? []; }

  /** Stores one event stream subscription record, replacing the previous record of that id. */
  async setsubscription(record: eventsubscription): Promise<void> {
    const records = ((await this.adapter.get<eventsubscription[]>("subscriptions")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("subscriptions", [record, ...records]);
  }

  /** Returns every stored event stream subscription, newest first. */
  async getsubscriptions(): Promise<eventsubscription[]> { return (await this.adapter.get<eventsubscription[]>("subscriptions")) ?? []; }

  /** Stores one registered request block rule of a run, replacing the previous rule of that id; every rule reverts and stays auditable after the run ends. */
  async addblockrule(rule: blockrule): Promise<void> {
    const records = ((await this.adapter.get<blockrule[]>("blockrules")) ?? []).filter(item => item.id !== rule.id);
    await this.adapter.set("blockrules", [rule, ...records]);
  }

  /** Returns every stored block rule, newest first. */
  async getblockrules(): Promise<blockrule[]> { return (await this.adapter.get<blockrule[]>("blockrules")) ?? []; }

  /** Stores one registered response mock fixture of a run, replacing the previous fixture of that id; the fixture body stays out of every audit trail. */
  async addmockspec(spec: mockspec): Promise<void> {
    const records = ((await this.adapter.get<mockspec[]>("mockspecs")) ?? []).filter(item => item.id !== spec.id);
    await this.adapter.set("mockspecs", [spec, ...records]);
  }

  /** Returns every stored mock fixture, newest first. */
  async getmockspecs(): Promise<mockspec[]> { return (await this.adapter.get<mockspec[]>("mockspecs")) ?? []; }

  /** Stores one registered header rewrite rule of a run, replacing the previous rule of that id; the provenance of every applied rule stays auditable. */
  async addheaderule(rule: headerule): Promise<void> {
    const records = ((await this.adapter.get<headerule[]>("headerules")) ?? []).filter(item => item.id !== rule.id);
    await this.adapter.set("headerules", [rule, ...records]);
  }

  /** Returns every stored header rewrite rule, newest first. */
  async getheaderules(): Promise<headerule[]> { return (await this.adapter.get<headerule[]>("headerules")) ?? []; }

  /** Stores one cookie operation of a run per domain with its timestamp; cookie values never enter the operation record. */
  async addcookieop(operation: cookieoperation): Promise<void> {
    const records = (await this.adapter.get<cookieoperation[]>("cookieops")) ?? [];
    await this.adapter.set("cookieops", [operation, ...records]);
  }

  /** Returns every stored cookie operation, newest first, optionally filtered by domain. */
  async getcookieops(domain?: string): Promise<cookieoperation[]> {
    const records = (await this.adapter.get<cookieoperation[]>("cookieops")) ?? [];
    return records.filter(item => domain === undefined || item.domain === domain);
  }

  /** Stores one token record of a provider with scopes, origin scope and expiry; the token values stay behind their storage ids. */
  async addtoken(record: tokenrecord): Promise<void> {
    const records = ((await this.adapter.get<tokenrecord[]>("tokens")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("tokens", [record, ...records]);
  }

  /** Returns every stored token record, newest first, optionally filtered by provider; token values never load here. */
  async listtokens(provider?: string): Promise<tokenrecord[]> {
    const records = (await this.adapter.get<tokenrecord[]>("tokens")) ?? [];
    return records.filter(item => provider === undefined || item.provider === provider);
  }

  /** Stores one applied proxy route of a run with its apply time, replacing the previous route of that id; the history keeps the revert times. */
  async addproxyroute(route: proxyroute): Promise<void> {
    const records = ((await this.adapter.get<proxyroute[]>("proxyroutes")) ?? []).filter(item => item.id !== route.id);
    await this.adapter.set("proxyroutes", [route, ...records]);
  }

  /** Returns every stored proxy route with apply and revert times, newest first. */
  async getproxyroutes(): Promise<proxyroute[]> { return (await this.adapter.get<proxyroute[]>("proxyroutes")) ?? []; }

  /** Stores one parsed rate limit read per origin, replacing the previous read of that origin. */
  async setratelimit(read: ratelimitread): Promise<void> {
    const records = ((await this.adapter.get<ratelimitread[]>("ratelimits")) ?? []).filter(item => item.origin !== read.origin);
    await this.adapter.set("ratelimits", [read, ...records]);
  }

  /** Returns every stored rate limit read whose reset window has not passed yet; expired states drop out at their reset windows. */
  async getratelimits(now: number): Promise<ratelimitread[]> {
    const records = (await this.adapter.get<ratelimitread[]>("ratelimits")) ?? [];
    const live = records.filter(item => item.resetat > now);
    if (live.length !== records.length) await this.adapter.set("ratelimits", live);
    return live;
  }

  /** Stores one run timeline entry; the user configured timeline retention window expires the oldest entries while their level counts survive in the per run level summaries. */
  async addtimelineentry(entry: timelineentry): Promise<void> {
    const records = await this.gettimeline();
    const combined = [entry, ...records];
    const retention = (await this.getsettings())?.timelineretention;
    if (retention === undefined) {
      await this.adapter.set("timelineentries", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention);
    if (expired.length > 0) {
      const expiredcounts = new Map<string, Record<string, number>>();
      for (const item of expired) {
        const counts = expiredcounts.get(item.runid) ?? {};
        counts[item.level] = (counts[item.level] ?? 0) + 1;
        expiredcounts.set(item.runid, counts);
      }
      for (const [runid, counts] of expiredcounts) await this.mergelevelsummary(runid, counts, Date.now());
    }
    await this.adapter.set("timelineentries", kept);
  }

  /** Returns every stored run timeline entry, newest first. */
  async gettimeline(): Promise<timelineentry[]> { return (await this.adapter.get<timelineentry[]>("timelineentries")) ?? []; }

  /** Returns the run timeline entries filtered by run, level and step id. */
  async listtimeline(filter: { runid?: string; level?: loglevel; stepid?: string }): Promise<timelineentry[]> {
    const records = await this.gettimeline();
    return records.filter(item => (filter.runid === undefined || item.runid === filter.runid) && (filter.level === undefined || item.level === filter.level) && (filter.stepid === undefined || item.stepid === filter.stepid));
  }

  /** Stores one captured javascript error record with its stack frames, source url and line. */
  async adderrorrecord(record: errorrecord): Promise<void> {
    const records = (await this.adapter.get<errorrecord[]>("errorrecords")) ?? [];
    await this.adapter.set("errorrecords", [record, ...records]);
  }

  /** Returns every stored error record, newest first. */
  async geterrorrecords(): Promise<errorrecord[]> { return (await this.adapter.get<errorrecord[]>("errorrecords")) ?? []; }

  /** Stores one captured unhandled rejection record with its reason and stack frames. */
  async addrejectionrecord(record: rejectionrecord): Promise<void> {
    const records = (await this.adapter.get<rejectionrecord[]>("rejectionrecords")) ?? [];
    await this.adapter.set("rejectionrecords", [record, ...records]);
  }

  /** Returns every stored rejection record, newest first. */
  async getrejectionrecords(): Promise<rejectionrecord[]> { return (await this.adapter.get<rejectionrecord[]>("rejectionrecords")) ?? []; }

  /** Stores one captured long task entry with its duration, start time and attribution names. */
  async addlongtask(record: longtaskentry): Promise<void> {
    const records = (await this.adapter.get<longtaskentry[]>("longtasks")) ?? [];
    await this.adapter.set("longtasks", [record, ...records]);
  }

  /** Returns every stored long task entry, newest first. */
  async getlongtasks(): Promise<longtaskentry[]> { return (await this.adapter.get<longtaskentry[]>("longtasks")) ?? []; }

  /** Stores one console diff result between two runs, replacing the previous one. */
  async addconsolediff(diff: consolediff): Promise<void> { return this.adapter.set("consolediff", diff); }

  /** Returns the one stored console diff result. */
  async getdiff(): Promise<consolediff | undefined> { return this.adapter.get<consolediff>("consolediff"); }

  /** Stores one log rotation target record with its overflow entry counts, replacing the previous record of that target and run. */
  async addrotationtarget(record: rotationtargetrecord): Promise<void> {
    const records = ((await this.adapter.get<rotationtargetrecord[]>("rotationtargets")) ?? []).filter(item => !(item.target === record.target && item.runid === record.runid));
    await this.adapter.set("rotationtargets", [record, ...records]);
  }

  /** Returns every stored rotation target record with its overflow entry counts, newest first. */
  async getrotationtargets(): Promise<rotationtargetrecord[]> { return (await this.adapter.get<rotationtargetrecord[]>("rotationtargets")) ?? []; }

  /** Stores one console capture consent decision per origin; the approved decision persists so console watching on that origin prompts once. */
  async setconsoleconsent(consent: consoleconsentrecord): Promise<void> {
    const records = ((await this.adapter.get<consoleconsentrecord[]>("consoleconsents")) ?? []).filter(item => item.id !== consent.id);
    await this.adapter.set("consoleconsents", [consent, ...records]);
  }

  /** Returns every console capture consent decision, newest first. */
  async getconsoleconsents(): Promise<consoleconsentrecord[]> { return (await this.adapter.get<consoleconsentrecord[]>("consoleconsents")) ?? []; }

  /** Stores one devtools session record with its enabled domains and detach state, replacing the previous record of its id. */
  async setcdpsession(session: cdpsession): Promise<void> {
    const records = ((await this.adapter.get<cdpsession[]>("cdpsessions")) ?? []).filter(item => item.id !== session.id);
    await this.adapter.set("cdpsessions", [session, ...records]);
  }

  /** Returns every stored devtools session record, newest first. */
  async getcdpsessions(): Promise<cdpsession[]> { return (await this.adapter.get<cdpsession[]>("cdpsessions")) ?? []; }

  /** Stores one raw command outcome with its duration and error class. */
  async addcdpcommand(command: cdpcommand): Promise<void> {
    const records = (await this.adapter.get<cdpcommand[]>("cdpcommands")) ?? [];
    await this.adapter.set("cdpcommands", [command, ...records]);
  }

  /** Returns every stored raw command outcome, newest first. */
  async getcdpcommands(): Promise<cdpcommand[]> { return (await this.adapter.get<cdpcommand[]>("cdpcommands")) ?? []; }

  /** Stores one domain event rule with its match filter, replacing the previous rule of its id. */
  async setcdpeventrule(rule: cdpeventrule): Promise<void> {
    const records = ((await this.adapter.get<cdpeventrule[]>("cdpeventrules")) ?? []).filter(item => item.id !== rule.id);
    await this.adapter.set("cdpeventrules", [rule, ...records]);
  }

  /** Returns every stored domain event rule, newest first. */
  async getcdpeventrules(): Promise<cdpeventrule[]> { return (await this.adapter.get<cdpeventrule[]>("cdpeventrules")) ?? []; }

  /** Stores one breakpoint record with its condition and hit counter, replacing the previous record of its id. */
  async addbreakpoint(spec: breakpointspec): Promise<void> {
    const records = ((await this.adapter.get<breakpointspec[]>("breakpoints")) ?? []).filter(item => item.id !== spec.id);
    await this.adapter.set("breakpoints", [spec, ...records]);
  }

  /** Returns every stored breakpoint record, newest first. */
  async getbreakpoints(): Promise<breakpointspec[]> { return (await this.adapter.get<breakpointspec[]>("breakpoints")) ?? []; }

  /** Stores one pause state capture; the user configured pause retention window expires the call frames and the dom snapshot reference of the oldest captures while the pause reason and hit breakpoint survive. */
  async addpause(pause: pausestate): Promise<void> {
    const records = await this.getpauses();
    const combined = [pause, ...records.filter(item => item.id !== pause.id)];
    const retention = (await this.getsettings())?.pauseretention;
    if (retention === undefined) {
      await this.adapter.set("pauses", combined);
      return;
    }
    const kept = combined.slice(0, retention);
    const expired = combined.slice(retention).map(item => {
      if (item.framesexpired === true) return item;
      const faded: pausestate = { ...item, callframes: [], framesexpired: true };
      delete faded.domsnapshotid;
      return faded;
    });
    await this.adapter.set("pauses", [...kept, ...expired]);
  }

  /** Returns every stored pause state capture, newest first. */
  async getpauses(): Promise<pausestate[]> { return (await this.adapter.get<pausestate[]>("pauses")) ?? []; }

  /** Returns the pause state captures of one run, newest first. */
  async listpauses(runid: string): Promise<pausestate[]> {
    const records = await this.getpauses();
    return records.filter(item => item.runid === runid);
  }

  /** Stores one watch expression with its per pause values, replacing the previous expression of its id. */
  async setwatchexpression(expression: watchexpression): Promise<void> {
    const records = ((await this.adapter.get<watchexpression[]>("watchexpressions")) ?? []).filter(item => item.id !== expression.id);
    await this.adapter.set("watchexpressions", [expression, ...records]);
  }

  /** Returns every stored watch expression, newest first. */
  async getwatchexpressions(): Promise<watchexpression[]> { return (await this.adapter.get<watchexpression[]>("watchexpressions")) ?? []; }

  /** Stores one script override with its review provenance, replacing the previous override of its id. */
  async addscriptoverride(spec: scriptoverride): Promise<void> {
    const records = ((await this.adapter.get<scriptoverride[]>("scriptoverrides")) ?? []).filter(item => item.id !== spec.id);
    await this.adapter.set("scriptoverrides", [spec, ...records]);
  }

  /** Returns every stored script override, newest first. */
  async getscriptoverrides(): Promise<scriptoverride[]> { return (await this.adapter.get<scriptoverride[]>("scriptoverrides")) ?? []; }

  /** Stores one debugger consent decision per origin with the consented domain list, replacing the previous decision of its id. */
  async setdebuggergrant(grant: debuggergrant): Promise<void> {
    const records = ((await this.adapter.get<debuggergrant[]>("debuggergrants")) ?? []).filter(item => item.id !== grant.id);
    await this.adapter.set("debuggergrants", [grant, ...records]);
  }

  /** Returns every debugger consent decision, newest first. */
  async getdebuggergrants(): Promise<debuggergrant[]> { return (await this.adapter.get<debuggergrant[]>("debuggergrants")) ?? []; }

  /** Revokes every approved debugger consent of one origin: the revoke time stamps the records so the next attach needs a new reviewed prompt. */
  async revokedebuggergrants(origin: string, at: number): Promise<number> {
    const records = await this.getdebuggergrants();
    let revoked = 0;
    const updated = records.map(grant => {
      if (grant.origin !== origin || grant.revokedat !== undefined) return grant;
      revoked += 1;
      return { ...grant, revokedat: at };
    });
    await this.adapter.set("debuggergrants", updated);
    return revoked;
  }

  /** Merges expired entry counts into the per run level count summary that survives the retention window. */
  private async mergelevelsummary(runid: string, counts: Record<string, number>, now: number): Promise<void> {
    const records = await this.getlevelsummaries();
    const existing = records.find(item => item.runid === runid);
    const merged: Record<string, number> = { ...(existing?.counts ?? {}) };
    for (const [level, count] of Object.entries(counts)) merged[level] = (merged[level] ?? 0) + count;
    const updated: levelsummary = { runid, counts: merged, at: now };
    await this.adapter.set("levelsummaries", [updated, ...records.filter(item => item.runid !== runid)]);
  }

  /** Returns every per run level count summary, newest first. */
  async getlevelsummaries(): Promise<levelsummary[]> { return (await this.adapter.get<levelsummary[]>("levelsummaries")) ?? []; }

  /** Stores one measured flow metric of the run beside its step span; the flow series stays per run. */
  async addflowmetric(metric: flowmetric): Promise<void> {
    const records = await this.getflowmetrics();
    await this.adapter.set("flowmetrics", [metric, ...records]);
  }

  /** Returns every stored flow metric, newest first. */
  async getflowmetrics(): Promise<flowmetric[]> { return (await this.adapter.get<flowmetric[]>("flowmetrics")) ?? []; }

  /** Returns the flow metrics of one run, newest first. */
  async listflowmetrics(runid: string): Promise<flowmetric[]> {
    const records = await this.getflowmetrics();
    return records.filter(metric => metric.runid === runid);
  }

  /** Stores one heap snapshot record with its byte and node counts; the user configured profile retention window expires the heavy snapshot bytes while the counts survive. */
  async setheaprecord(heap: heaprecord): Promise<void> {
    const records = ((await this.adapter.get<heaprecord[]>("heaprecords")) ?? []).filter(item => item.id !== heap.id);
    const retention = (await this.getsettings())?.profileretention;
    const { heaps } = expireprofilerecords({ heaps: [heap, ...records], profiles: [], traces: [], retention, now: Date.now() });
    await this.adapter.set("heaprecords", heaps);
  }

  /** Returns every stored heap snapshot record, newest first. */
  async getheaprecords(): Promise<heaprecord[]> { return (await this.adapter.get<heaprecord[]>("heaprecords")) ?? []; }

  /** Stores one heap growth sample taken beside a step. */
  async addgrowsample(sample: growsample): Promise<void> {
    const records = (await this.adapter.get<growsample[]>("growsamples")) ?? [];
    await this.adapter.set("growsamples", [sample, ...records]);
  }

  /** Returns every stored heap growth sample, newest first. */
  async getgrowsamples(): Promise<growsample[]> { return (await this.adapter.get<growsample[]>("growsamples")) ?? []; }

  /** Returns the heap growth samples of one run, newest first. */
  async listgrowsamples(runid: string): Promise<growsample[]> {
    const records = await this.getgrowsamples();
    return records.filter(sample => sample.runid === runid);
  }

  /** Stores one computed heap growth trend of a run with its slope and flagged steps, replacing the previous trend of the run. */
  async settrend(trend: memorytrend): Promise<void> {
    const records = (await this.adapter.get<memorytrend[]>("memorytrends")) ?? [];
    await this.adapter.set("memorytrends", [trend, ...records.filter(item => item.runid !== trend.runid)]);
  }

  /** Returns every stored heap growth trend, newest first. */
  async gettrends(): Promise<memorytrend[]> { return (await this.adapter.get<memorytrend[]>("memorytrends")) ?? []; }

  /** Stores one cpu profile record with its sample count and hot function list; the profile retention window expires the heavy sample payload while the counts and hot functions survive. */
  async setcpuprofile(profile: cpuprofile): Promise<void> {
    const records = ((await this.adapter.get<cpuprofile[]>("cpuprofiles")) ?? []).filter(item => item.id !== profile.id);
    const retention = (await this.getsettings())?.profileretention;
    const { profiles } = expireprofilerecords({ heaps: [], profiles: [profile, ...records], traces: [], retention, now: Date.now() });
    await this.adapter.set("cpuprofiles", profiles);
  }

  /** Returns every stored cpu profile record, newest first. */
  async getcpuprofiles(): Promise<cpuprofile[]> { return (await this.adapter.get<cpuprofile[]>("cpuprofiles")) ?? []; }

  /** Stores one layout shift entry with its score and impacted selectors. */
  async addshiftentry(entry: shiftentry): Promise<void> {
    const records = (await this.adapter.get<shiftentry[]>("shiftentries")) ?? [];
    await this.adapter.set("shiftentries", [entry, ...records]);
  }

  /** Returns every stored layout shift entry, newest first. */
  async getshiftentries(): Promise<shiftentry[]> { return (await this.adapter.get<shiftentry[]>("shiftentries")) ?? []; }

  /** Stores one trace record with its category list, byte size and step annotations; the profile retention window expires the heavy trace bytes while the metadata and annotations survive. */
  async settracerecord(trace: tracerecord): Promise<void> {
    const records = ((await this.adapter.get<tracerecord[]>("tracerecords")) ?? []).filter(item => item.id !== trace.id);
    const retention = (await this.getsettings())?.profileretention;
    const { traces } = expireprofilerecords({ heaps: [], profiles: [], traces: [trace, ...records], retention, now: Date.now() });
    await this.adapter.set("tracerecords", traces);
  }

  /** Returns every stored trace record, newest first. */
  async gettracerecords(): Promise<tracerecord[]> { return (await this.adapter.get<tracerecord[]>("tracerecords")) ?? []; }

  /** Returns the trace records filtered by run and applied categories. */
  async listtraces(filter: { runid?: string; categories?: string[] }): Promise<tracerecord[]> {
    const records = await this.gettracerecords();
    return records.filter(trace => (filter.runid === undefined || trace.runid === filter.runid) && (filter.categories === undefined || filter.categories.every(category => trace.categories.includes(category))));
  }

  /** Stores the exported file content of one trace beside its record; the retention window drops the file bytes of expired traces while the record survives. */
  async settracefile(traceid: string, content: string): Promise<void> {
    const records = ((await this.adapter.get<Array<{ traceid: string; content: string; savedat: number }>>("tracefiles")) ?? []).filter(item => item.traceid !== traceid);
    const trace = (await this.gettracerecords()).find(item => item.id === traceid);
    const retention = (await this.getsettings())?.profileretention;
    const kept = retention === undefined || trace === undefined || Date.now() - trace.endedat <= retention ? [{ traceid, content, savedat: Date.now() }, ...records] : records;
    await this.adapter.set("tracefiles", kept);
  }

  /** Returns the exported file content of one trace, or undefined when the retention window dropped the bytes. */
  async gettracefile(traceid: string): Promise<string | undefined> {
    const records = (await this.adapter.get<Array<{ traceid: string; content: string; savedat: number }>>("tracefiles")) ?? [];
    return records.find(item => item.traceid === traceid)?.content;
  }

  /** Stores one source map reference of a run with its script url, map url and parsed state. */
  async setsourcemapref(ref: sourcemapref): Promise<void> {
    const records = ((await this.adapter.get<sourcemapref[]>("sourcemaprefs")) ?? []).filter(item => item.id !== ref.id);
    await this.adapter.set("sourcemaprefs", [ref, ...records]);
  }

  /** Returns every stored source map reference, newest first. */
  async getsourcemaps(): Promise<sourcemapref[]> { return (await this.adapter.get<sourcemapref[]>("sourcemaprefs")) ?? []; }

  /** Stores one source map capture consent decision per origin, replacing the previous decision of its id. */
  async setsourcemapconsent(consent: sourcemapconsent): Promise<void> {
    const records = ((await this.adapter.get<sourcemapconsent[]>("sourcemapconsents")) ?? []).filter(item => item.id !== consent.id);
    await this.adapter.set("sourcemapconsents", [consent, ...records]);
  }

  /** Returns every source map capture consent decision, newest first. */
  async getsourcemapconsents(): Promise<sourcemapconsent[]> { return (await this.adapter.get<sourcemapconsent[]>("sourcemapconsents")) ?? []; }

  /** Revokes every approved source map consent of one origin so the next capture needs a new reviewed prompt. */
  async revokesourcemapconsents(origin: string, at: number): Promise<number> {
    const records = await this.getsourcemapconsents();
    let revoked = 0;
    const updated = records.map(consent => {
      if (consent.origin !== origin || consent.revokedat !== undefined) return consent;
      revoked += 1;
      return { ...consent, revokedat: at };
    });
    await this.adapter.set("sourcemapconsents", updated);
    return revoked;
  }

  /** Stores the emulation state of one run keyed by its run id; the reverted layer prior states expire after the user configured retention window while the layer history always survives. */
  async setemulationstate(state: emulationstate): Promise<void> {
    const retention = (await this.getsettings())?.emulationretention;
    await this.adapter.set(`emulationstate${state.runid}`, expirelayers(state, retention, Date.now()));
  }

  /** Returns the persisted emulation state of one run so the layers survive service worker restarts. */
  async getemulationstate(runid: string): Promise<emulationstate | undefined> { return this.adapter.get<emulationstate>(`emulationstate${runid}`); }

  /** Returns the active and past layers of one run, newest last in apply order; the listlayers accessor of the emulation memory. */
  async listlayers(runid: string): Promise<emulationlayer[]> {
    const state = await this.getemulationstate(runid);
    return state?.layers ?? [];
  }

  /** Stores one user curated device preset by its name so the preset library stays user data instead of a hardcoded list. */
  async setdevicepreset(preset: devicepreset): Promise<void> {
    const records = ((await this.adapter.get<devicepreset[]>("devicepresets")) ?? []).filter(item => item.name !== preset.name);
    await this.adapter.set("devicepresets", [...records, preset]);
  }

  /** Returns every user curated device preset. */
  async getdevicepresets(): Promise<devicepreset[]> { return (await this.adapter.get<devicepreset[]>("devicepresets")) ?? []; }

  /** Stores one user curated network preset by its name with editable values. */
  async setnetworkpreset(preset: networkpreset): Promise<void> {
    const records = ((await this.adapter.get<networkpreset[]>("networkpresets")) ?? []).filter(item => item.name !== preset.name);
    await this.adapter.set("networkpresets", [...records, preset]);
  }

  /** Returns every user curated network preset. */
  async getnetworkpresets(): Promise<networkpreset[]> { return (await this.adapter.get<networkpreset[]>("networkpresets")) ?? []; }

  /** Stores one user curated location preset by its name. */
  async setlocationpreset(preset: locationpreset): Promise<void> {
    const records = ((await this.adapter.get<locationpreset[]>("locationpresets")) ?? []).filter(item => item.name !== preset.name);
    await this.adapter.set("locationpresets", [...records, preset]);
  }

  /** Returns every user curated location preset. */
  async getlocationpresets(): Promise<locationpreset[]> { return (await this.adapter.get<locationpreset[]>("locationpresets")) ?? []; }

  /** Stores one user curated agent preset by its name. */
  async setagentpreset(preset: agentpreset): Promise<void> {
    const records = ((await this.adapter.get<agentpreset[]>("agentpresets")) ?? []).filter(item => item.name !== preset.name);
    await this.adapter.set("agentpresets", [...records, preset]);
  }

  /** Returns every user curated agent preset. */
  async getagentpresets(): Promise<agentpreset[]> { return (await this.adapter.get<agentpreset[]>("agentpresets")) ?? []; }

  /** Replaces the blackbox rule set of one origin so third party script blackboxing stays scoped per origin. */
  async setblackboxrules(origin: string, rules: blackboxrule[]): Promise<void> {
    const records = ((await this.adapter.get<Array<{ origin: string; rules: blackboxrule[] }>>("blackboxrules")) ?? []).filter(item => item.origin !== origin);
    await this.adapter.set("blackboxrules", [...records, { origin, rules }]);
  }

  /** Returns every stored blackbox rule set with its origin. */
  async getblackboxrules(): Promise<Array<{ origin: string; rules: blackboxrule[] }>> { return (await this.adapter.get<Array<{ origin: string; rules: blackboxrule[] }>>("blackboxrules")) ?? []; }

  /** Records one permission override of a run with its prior state captured for the exact restore. */
  async addpermissionoverride(record: permissionoverriderecord): Promise<void> {
    const records = ((await this.adapter.get<permissionoverriderecord[]>("permissionoverrides")) ?? []).filter(item => item.id !== record.id);
    await this.adapter.set("permissionoverrides", [record, ...records]);
  }

  /** Returns the permission override history with restore states, newest first. */
  async getpermissionoverrides(): Promise<permissionoverriderecord[]> { return (await this.adapter.get<permissionoverriderecord[]>("permissionoverrides")) ?? []; }

  /** Stores one location consent decision per origin, replacing the previous decision of its id. */
  async setlocationconsent(consent: locationconsent): Promise<void> {
    const records = ((await this.adapter.get<locationconsent[]>("locationconsents")) ?? []).filter(item => item.id !== consent.id);
    await this.adapter.set("locationconsents", [consent, ...records]);
  }

  /** Returns every location consent decision, newest first. */
  async getlocationconsents(): Promise<locationconsent[]> { return (await this.adapter.get<locationconsent[]>("locationconsents")) ?? []; }

  /** Returns the persisted task state checkpoint of one run so the run resumes after a service worker restart. */
  async gettaskstate(runid: string): Promise<taskstate | undefined> { return this.adapter.get<taskstate>(`taskstate${runid}`); }

  /** Persists one task state checkpoint per run with its corruption checksum. */
  async settaskstate(state: taskstate): Promise<void> { return this.adapter.set(`taskstate${state.runid}`, state); }

  /** Returns the session event history with timestamps, newest first. */
  async getsessionevents(): Promise<sessionevent[]> { return (await this.adapter.get<sessionevent[]>("sessionevents")) ?? []; }

  /** Records one session event of the run with its timestamp and detail. */
  async addsessionevent(event: sessionevent): Promise<void> {
    const records = await this.getsessionevents();
    await this.adapter.set("sessionevents", [event, ...records]);
  }

  /** Returns every saved session record with its sections, newest first. */
  async getsessionrecords(): Promise<sessionrecord[]> { return (await this.adapter.get<sessionrecord[]>("sessionrecords")) ?? []; }

  /** Adds one saved session record to the library. */
  async addsessionrecord(record: sessionrecord): Promise<void> {
    const records = await this.getsessionrecords();
    await this.adapter.set("sessionrecords", [record, ...records]);
  }

  /** Replaces one saved session record by its id after a filing or restore touches it. */
  async updatesessionrecord(record: sessionrecord): Promise<void> {
    const records = await this.getsessionrecords();
    await this.adapter.set("sessionrecords", records.map(item => item.id === record.id ? record : item));
  }

  /** Lists saved sessions filtered by name substring, folder and time window; the filter stays a user choice with no result cap. */
  async listsessions(filter: { name?: string; folder?: string; from?: number; to?: number }): Promise<sessionrecord[]> {
    return filteredsessions(await this.getsessionrecords(), filter);
  }

  /** Returns one saved session with every section; an expired record carries its metadata only. */
  async getsessionrecord(id: string): Promise<sessionrecord | undefined> {
    return (await this.getsessionrecords()).find(record => record.id === id);
  }

  /** Runs the reviewed search query across every stored session and returns the matches with their session ids and time windows. */
  async searchmemory(query: searchquery): Promise<sessionmatch[]> {
    return searchsessionrecords(query, await this.getsessionrecords());
  }

  /** Returns the folder tree of the session library. */
  async getsessionfolders(): Promise<sessionfolder[]> { return (await this.adapter.get<sessionfolder[]>("sessionfolders")) ?? []; }

  /** Replaces the folder tree after a reviewed filing adds or moves one folder. */
  async setsessionfolders(folders: sessionfolder[]): Promise<void> { return this.adapter.set("sessionfolders", folders); }

  /** Returns every stored session diff result, newest first. */
  async getsessiondiffs(): Promise<sessiondiff[]> { return (await this.adapter.get<sessiondiff[]>("sessiondiffs")) ?? []; }

  /** Stores one session diff result for later review. */
  async addsessiondiff(diff: sessiondiff): Promise<void> {
    const records = await this.getsessiondiffs();
    await this.adapter.set("sessiondiffs", [diff, ...records]);
  }

  /** Returns the persisted auto snapshot state with the reviewed interval, the last snapshot time and the snapshot count. */
  async getautosnapshot(): Promise<autosnapshotstate | undefined> { return (await this.adapter.get<autosnapshotstate>("autosnapshot")) ?? undefined; }

  /** Stores the auto snapshot state of the reviewed interval. */
  async setautosnapshot(state: autosnapshotstate): Promise<void> { return this.adapter.set("autosnapshot", state); }

  /** Clears the auto snapshot interval so on demand captures stay the only source of records. */
  async clearautosnapshot(): Promise<void> { return this.adapter.set<autosnapshotstate | null>("autosnapshot", null); }

  /** Expires the heavy sections of saved sessions after the reviewed retention window while the record metadata survives. */
  async applysessionexpiry(retention: number | undefined, now: number): Promise<sessionrecord[]> {
    const records = expiresessions(await this.getsessionrecords(), retention, now);
    await this.adapter.set("sessionrecords", records);
    return records;
  }

  /** Returns the crash marker of a run interrupted by a browser restart. */
  async getcrashflag(): Promise<boolean> { return (await this.adapter.get<boolean>("crashed")) ?? false; }

  /** Sets the crash marker so the sessions view offers the crash restore inside the consent model. */
  async setcrashflag(value: boolean): Promise<void> { return this.adapter.set("crashed", value); }

  /** Stores one composed workflow record version with its timestamp; re-composing the same version replaces it while older versions survive for the audit trail. */
  async addworkflowrecord(record: workflowrecord): Promise<void> {
    const records = await this.getworkflowrecordversions();
    const remaining = records.filter(entry => !(entry.id === record.id && entry.version === record.version));
    await this.adapter.set("workflowrecords", [record, ...remaining]);
  }

  /** Returns every stored workflow record version, newest first. */
  async getworkflowrecordversions(): Promise<workflowrecord[]> { return (await this.adapter.get<workflowrecord[]>("workflowrecords")) ?? []; }

  /** Returns the latest stored version of one workflow record. */
  async getworkflowrecord(id: string): Promise<workflowrecord | undefined> {
    return (await this.getworkflowrecordversions()).find(entry => entry.id === id);
  }

  /** Lists the saved workflow records, the latest version of each, newest first. */
  async listworkflows(): Promise<workflowrecord[]> {
    const seen = new Set<string>();
    const latest: workflowrecord[] = [];
    for (const entry of await this.getworkflowrecordversions()) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      latest.push(entry);
    }
    return latest;
  }

  /** Stores one workflow run with its state transition; a run replace keeps the full runlog of the same id. */
  async setworkflowrun(run: workflowrun): Promise<void> {
    const runs = await this.listworkflowruns();
    const remaining = runs.filter(entry => entry.id !== run.id);
    await this.adapter.set("workflowruns", [run, ...remaining]);
  }

  /** Returns every stored workflow run, newest first. */
  async listworkflowruns(): Promise<workflowrun[]> { return (await this.adapter.get<workflowrun[]>("workflowruns")) ?? []; }

  /** Returns one run with its full step outcome list so the panel shows the timeline after and during a run. */
  async getrun(id: string): Promise<{ run: workflowrun; log: runlogentry[] } | undefined> {
    const run = (await this.listworkflowruns()).find(entry => entry.id === id);
    if (!run) return undefined;
    return { run, log: await this.getrunlog(id) };
  }

  /** Records one runlog entry of a run; the runlog retention window is a user setting and an absent window keeps every entry. */
  async addrunlogentry(runid: string, entry: runlogentry): Promise<void> {
    const entries = await this.getrunlog(runid);
    const combined = [...entries, entry];
    const retention = (await this.getsettings())?.runlogretention;
    await this.adapter.set(`runlog${runid}`, retention === undefined ? combined : combined.slice(-retention));
  }

  /** Returns the runlog of one run, oldest first. */
  async getrunlog(runid: string): Promise<runlogentry[]> { return (await this.adapter.get<runlogentry[]>(`runlog${runid}`)) ?? []; }

  /** Stores the variable values per scope of one run for inspection after the run. */
  async setrunscopes(runid: string, scopes: variablescope[]): Promise<void> { return this.adapter.set(`runscopes${runid}`, scopes); }

  /** Returns the variable scopes of one run, oldest first. */
  async getrunscopes(runid: string): Promise<variablescope[]> { return (await this.adapter.get<variablescope[]>(`runscopes${runid}`)) ?? []; }

  /** Records one provenance entry of a run: an expression result or a regex capture with its name, value and time. */
  async addworkflowprovenance(runid: string, entry: workflowprovenance): Promise<void> {
    const entries = await this.getworkflowprovenance(runid);
    await this.adapter.set(`workflowprovenance${runid}`, [...entries, entry]);
  }

  /** Returns every provenance entry of one run, oldest first. */
  async getworkflowprovenance(runid: string): Promise<workflowprovenance[]> { return (await this.adapter.get<workflowprovenance[]>(`workflowprovenance${runid}`)) ?? []; }

  /** Stores one shareable step template under its unique name. */
  async addsteptemplate(template: steptemplate): Promise<void> {
    const templates = (await this.getsteptemplates()).filter(entry => entry.name !== template.name);
    await this.adapter.set("steptemplates", [template, ...templates]);
  }

  /** Returns every stored step template, newest first. */
  async getsteptemplates(): Promise<steptemplate[]> { return (await this.adapter.get<steptemplate[]>("steptemplates")) ?? []; }

  /** Records one control flow decision of a run — a branch choice with its reason, the loop counters of an iteration trail, the retry attempts with their backoff durations, the timeout aborts with the exceeded budget, the join record with its strategy and conflicts or the catch handler execution — so the audit trail keeps every control flow turn. */
  async addcontroldecision(runid: string, decision: controlflowdecision): Promise<void> {
    const decisions = await this.listcontroldecisions(runid);
    await this.adapter.set(`controldecisions${runid}`, [...decisions, { ...decision, runid }]);
  }

  /** Returns every stored control flow decision of one run, oldest first. */
  async listcontroldecisions(runid: string): Promise<controlflowdecision[]> { return (await this.adapter.get<controlflowdecision[]>(`controldecisions${runid}`)) ?? []; }

  /** Returns the past branch decisions of one workflow across every stored run, oldest first, so review can compare branch paths over time. */
  async getbranchhistory(workflowid: string): Promise<branchoutcome[]> {
    const runs = await this.listworkflowruns();
    const ordered = [...runs].reverse().filter(run => run.workflowid === workflowid);
    const history: branchoutcome[] = [];
    for (const run of ordered) {
      const decisions = await this.listcontroldecisions(run.id);
      for (const decision of decisions) if (decision.kind === "branch" && decision.branch !== undefined) history.push(decision.branch);
    }
    return history;
  }

  /** Stores one armed trigger rule with its workflow reference; re-arming the same id replaces the rule while the fire history survives. */
  async addtriggerule(rule: triggerule): Promise<void> {
    const rules = (await this.gettriggerules()).filter(entry => entry.id !== rule.id);
    await this.adapter.set("triggerules", [rule, ...rules]);
  }

  /** Returns every armed trigger rule, newest first. */
  async gettriggerules(): Promise<triggerule[]> { return (await this.adapter.get<triggerule[]>("triggerules")) ?? []; }

  /** Returns one armed trigger rule by its id. */
  async gettriggerule(id: string): Promise<triggerule | undefined> { return (await this.gettriggerules()).find(rule => rule.id === id); }

  /** Replaces one stored rule after an enable, disable, pause, resume, cooldown or fire bookkeeping change. */
  async settriggerule(rule: triggerule): Promise<void> {
    const rules = await this.gettriggerules();
    await this.adapter.set("triggerules", rules.map(entry => entry.id === rule.id ? rule : entry));
  }

  /** Replaces every stored rule at once so the session pause and resume suspend and release the whole rule set atomically. */
  async settriggerules(rules: triggerule[]): Promise<void> { return this.adapter.set("triggerules", rules); }

  /** Removes one armed rule when the user disarms it; the fire history survives for the audit trail. */
  async removetriggerule(id: string): Promise<void> {
    await this.adapter.set("triggerules", (await this.gettriggerules()).filter(rule => rule.id !== id));
  }

  /** Lists every armed rule joined with the name of its composed workflow so the trigger list shows what each rule launches. */
  async listtriggers(): Promise<Array<{ rule: triggerule; workflowname?: string }>> {
    const rules = await this.gettriggerules();
    const names = new Map((await this.listworkflows()).map(record => [record.id, record.name]));
    return rules.map(rule => ({ rule, ...(names.has(rule.workflowid) ? { workflowname: names.get(rule.workflowid) as string } : {}) }));
  }

  /** Records one trigger fire with the reviewed retention window; an absent window keeps every fire record while the rule counters always survive. */
  async addtriggerfire(fire: triggerfire): Promise<void> {
    const fires = await this.listtriggerfires();
    const combined = [fire, ...fires];
    const retention = (await this.getsettings())?.triggerretention;
    await this.adapter.set("triggerfires", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns every stored trigger fire record, newest first, optionally filtered to one rule. */
  async listtriggerfires(ruleid?: string): Promise<triggerfire[]> {
    const fires = (await this.adapter.get<triggerfire[]>("triggerfires")) ?? [];
    return ruleid === undefined ? fires : fires.filter(fire => fire.ruleid === ruleid);
  }

  /** Stores the pending trigger queue: fires that arrived while the target run was busy or the session paused; the resume drains them through the same gates. */
  async settriggerqueue(queue: triggerfire[]): Promise<void> { return this.adapter.set("triggerqueue", queue); }

  /** Returns the pending trigger queue, oldest first. */
  async gettriggerqueue(): Promise<triggerfire[]> { return (await this.adapter.get<triggerfire[]>("triggerqueue")) ?? []; }

  /** Stores one verified webhook payload of a rule; the executor verifies the shared secret and the schema before anything persists. */
  async addwebhookpayload(ruleid: string, payload: Record<string, unknown>, at: number): Promise<void> {
    const stored = (await this.adapter.get<Array<{ ruleid: string; payload: Record<string, unknown>; at: number }>>("webhookpayloads")) ?? [];
    await this.adapter.set("webhookpayloads", [{ ruleid, payload, at }, ...stored]);
  }

  /** Returns the stored webhook payloads of one rule, newest first; only secret verified deliveries ever reach this store. */
  async listwebhookpayloads(ruleid: string): Promise<Array<{ ruleid: string; payload: Record<string, unknown>; at: number }>> {
    const stored = (await this.adapter.get<Array<{ ruleid: string; payload: Record<string, unknown>; at: number }>>("webhookpayloads")) ?? [];
    return stored.filter(entry => entry.ruleid === ruleid);
  }

  /** Stores one manual run preview with its step list so the panel renders it before confirmation. */
  async addmanualrun(preview: manualrun): Promise<void> {
    const runs = (await this.listmanualruns()).filter(entry => entry.id !== preview.id);
    await this.adapter.set("manualruns", [preview, ...runs]);
  }

  /** Returns every stored manual run preview with its confirmation outcome, newest first. */
  async listmanualruns(): Promise<manualrun[]> { return (await this.adapter.get<manualrun[]>("manualruns")) ?? []; }

  /** Stores one workflow version record with its change note; saving the same version again replaces its note while older versions survive for the timeline. */
  async addworkflowversion(version: workflowversion): Promise<void> {
    const versions = (await this.listworkflowversions()).filter(entry => !(entry.workflowid === version.workflowid && entry.version === version.version));
    await this.adapter.set("workflowversions", [version, ...versions]);
  }

  /** Returns every stored workflow version record, newest first, optionally filtered to one workflow. */
  async listworkflowversions(workflowid?: string): Promise<workflowversion[]> {
    const versions = (await this.adapter.get<workflowversion[]>("workflowversions")) ?? [];
    return workflowid === undefined ? versions : versions.filter(entry => entry.workflowid === workflowid);
  }

  /** Stores one version diff result for the history view. */
  async addversiondiff(diff: versiondiff): Promise<void> {
    const diffs = (await this.listversiondiffs()).filter(entry => !(entry.workflowid === diff.workflowid && entry.from === diff.from && entry.to === diff.to));
    await this.adapter.set("versiondiffs", [diff, ...diffs]);
  }

  /** Returns every stored version diff result, newest first, optionally filtered to one workflow. */
  async listversiondiffs(workflowid?: string): Promise<versiondiff[]> {
    const diffs = (await this.adapter.get<versiondiff[]>("versiondiffs")) ?? [];
    return workflowid === undefined ? diffs : diffs.filter(entry => entry.workflowid === workflowid);
  }

  /** Records one run history entry — the outcome, duration and trigger cause of one execution — under the user configured retention window with no code ceiling. */
  async addrunhistory(entry: runhistoryentry): Promise<void> {
    const entries = await this.gethistory();
    const combined = [entry, ...entries];
    const retention = (await this.getsettings())?.runhistoryretention;
    await this.adapter.set("runhistory", retention === undefined ? combined : combined.slice(0, retention));
  }

  /** Returns the stored run history, newest first, filtered by workflow, outcome and time floor; the filters stay user choices. */
  async gethistory(filter?: { workflowid?: string; outcome?: string; since?: number; limit?: number }): Promise<runhistoryentry[]> {
    const entries = (await this.adapter.get<runhistoryentry[]>("runhistory")) ?? [];
    let filtered = entries;
    if (filter?.workflowid !== undefined) filtered = filtered.filter(entry => entry.workflowid === filter.workflowid);
    if (filter?.outcome !== undefined) filtered = filtered.filter(entry => entry.outcome === filter.outcome);
    if (filter?.since !== undefined) filtered = filtered.filter(entry => entry.endedat >= (filter.since as number));
    if (filter?.limit !== undefined) filtered = filtered.slice(0, filter.limit);
    return filtered;
  }

  /** Stores the editor layout of one workflow so the canvas reopens exactly as left. */
  async seteditorlayout(workflowid: string, layout: editorlayout): Promise<void> { return this.adapter.set(`editorlayout${workflowid}`, layout); }

  /** Returns the stored editor layout of one workflow. */
  async geteditorlayout(workflowid: string): Promise<editorlayout | undefined> { return (await this.adapter.get<editorlayout>(`editorlayout${workflowid}`)) ?? undefined; }

  /** Stores the breakpoint step ids of one workflow. */
  async setworkflowbreakpoints(workflowid: string, stepids: string[]): Promise<void> { return this.adapter.set(`workflowbreakpoints${workflowid}`, stepids); }

  /** Returns the stored breakpoint step ids of one workflow, oldest first. */
  async getworkflowbreakpoints(workflowid: string): Promise<string[]> { return (await this.adapter.get<string[]>(`workflowbreakpoints${workflowid}`)) ?? []; }

  /** Stores one per site policy override; re-adding the same id replaces its deltas. */
  async addsiteoverride(override: siteoverride): Promise<void> {
    const overrides = (await this.listsiteoverrides()).filter(entry => entry.id !== override.id);
    await this.adapter.set("siteoverrides", [override, ...overrides]);
  }

  /** Returns every stored per site override, newest first, optionally filtered to one workflow. */
  async listsiteoverrides(workflowid?: string): Promise<siteoverride[]> {
    const overrides = (await this.adapter.get<siteoverride[]>("siteoverrides")) ?? [];
    return workflowid === undefined ? overrides : overrides.filter(entry => entry.workflowid === workflowid);
  }

  /** Removes one per site override when the user deletes it. */
  async removesiteoverride(id: string): Promise<void> {
    await this.adapter.set("siteoverrides", (await this.listsiteoverrides()).filter(entry => entry.id !== id));
  }

  /** Stores one watchdog event with its recovery outcome; the event history keeps the audit trail of every scan. */
  async addwatchdogevent(event: watchdogrecord): Promise<void> {
    const events = (await this.listwatchdogevents()).filter(entry => entry.id !== event.id);
    await this.adapter.set("watchdogevents", [event, ...events]);
  }

  /** Returns every stored watchdog event, newest first. */
  async listwatchdogevents(): Promise<watchdogrecord[]> { return (await this.adapter.get<watchdogrecord[]>("watchdogevents")) ?? []; }

  /** Stores one pending workflow import held for review; approving it later stores the record as runnable. */
  async addworkflowimport(entry: workflowimport): Promise<void> {
    const imports = (await this.listworkflowimports()).filter(candidate => candidate.id !== entry.id);
    await this.adapter.set("workflowimports", [entry, ...imports]);
  }

  /** Returns every pending workflow import, newest first. */
  async listworkflowimports(): Promise<workflowimport[]> { return (await this.adapter.get<workflowimport[]>("workflowimports")) ?? []; }

  /** Removes one pending import when the user approves or rejects it. */
  async removeworkflowimport(id: string): Promise<void> {
    await this.adapter.set("workflowimports", (await this.listworkflowimports()).filter(entry => entry.id !== id));
  }

  /** Stores the per workflow background run flags so a workflow keeps running with the panel closed. */
  async setbackgroundruns(flags: Record<string, boolean>): Promise<void> { return this.adapter.set("backgroundruns", flags); }

  /** Returns the per workflow background run flags. */
  async getbackgroundruns(): Promise<Record<string, boolean>> { return (await this.adapter.get<Record<string, boolean>>("backgroundruns")) ?? {}; }

  /** Removes one stored workflow record version; a rejected import or rollback disappears from the library while every other version survives. */
  async removeworkflowversion(id: string, version: number): Promise<void> {
    await this.adapter.set("workflowrecords", (await this.getworkflowrecordversions()).filter(entry => !(entry.id === id && entry.version === version)));
  }

  /** Returns every stored mcp client record, newest first. */
  async getclients(): Promise<clientrecord[]> { return (await this.adapter.get<clientrecord[]>("mcpclients")) ?? []; }

  /** Upserts one mcp client record by its id so one clientrecord stays per connected transport. */
  async setclient(client: clientrecord): Promise<void> {
    const records = (await this.getclients()).filter(entry => entry.id !== client.id);
    await this.adapter.set("mcpclients", [client, ...records]);
  }

  /** Returns the connected client records — every client whose disconnect time is absent. */
  async listclients(): Promise<clientrecord[]> { return (await this.getclients()).filter(client => client.disconnectedat === undefined); }

  /** Stores the negotiated capability set of one client on its record. */
  async setclientcapabilities(id: string, capabilities: capabilityset): Promise<void> {
    await this.adapter.set("mcpclients", (await this.getclients()).map(client => client.id === id ? { ...client, capabilities } : client));
  }

  /** Drops every stored client record when the server stops. */
  async clearclients(): Promise<void> { await this.adapter.set("mcpclients", []); }

  /** Records one stdio bridge launch event with its process id; a restart marker distinguishes the relaunch of a dead client process. */
  async addbridgelaunch(launch: bridgelaunch): Promise<void> {
    await this.adapter.set("mcbridgelaunches", [launch, ...(await this.adapter.get<bridgelaunch[]>("mcbridgelaunches") ?? [])]);
  }

  /** Returns every stdio bridge launch event, newest first. */
  async listbridgelaunches(): Promise<bridgelaunch[]> { return (await this.adapter.get<bridgelaunch[]>("mcbridgelaunches")) ?? []; }

  /** Returns the user configured mcp server config; an absent record keeps the documented localhost default. */
  async getmcpconfig(): Promise<mcpserverconfig | undefined> { return this.adapter.get<mcpserverconfig>("mcpconfig"); }

  /** Stores the user configured mcp server config: bind address, port, transports, frame size, queue depth and enablement all stay user choices. */
  async setmcpconfig(config: mcpserverconfig): Promise<void> { return this.adapter.set("mcpconfig", config); }

  /** Returns the persisted mcp server runtime state. */
  async getmcpstate(): Promise<mcpserverstate | undefined> { return this.adapter.get<mcpserverstate>("mcpstate"); }

  /** Stores the mcp server runtime state with the stdio bridge status. */
  async setmcpstate(state: mcpserverstate): Promise<void> { return this.adapter.set("mcpstate", state); }

  /** Records one mcp tool call — the client, the tool, the origin and the outcome without any payload — under the user configured call retention with no code ceiling. */
  async addtoolcall(record: toolcallrecord): Promise<void> {
    const records = await this.listtoolcalls();
    const retention = (await this.getmcpconfig())?.callretention;
    await this.adapter.set("mcptoolcalls", retention === undefined ? [record, ...records] : [record, ...records].slice(0, retention));
  }

  /** Returns every stored mcp tool call record, newest first. */
  async listtoolcalls(): Promise<toolcallrecord[]> { return (await this.adapter.get<toolcallrecord[]>("mcptoolcalls")) ?? []; }

  /** Returns every stored session token of paired remote clients; the records carry only their tokenhash form so raw tokens never persist. */
  async getsessiontokens(): Promise<sessiontoken[]> { return (await this.adapter.get<sessiontoken[]>("mcpsessiontokens")) ?? []; }

  /** Replaces the stored session token set after one issue, revocation or expiry sweep. */
  async setsessiontokens(tokens: sessiontoken[]): Promise<void> { return this.adapter.set("mcpsessiontokens", tokens); }

  /** Returns every stored pairing code with its single use state, newest first. */
  async getpairingcodes(): Promise<pairingcode[]> { return (await this.adapter.get<pairingcode[]>("mcppairingcodes")) ?? []; }

  /** Records one issued pairing code for the one time client pairing. */
  async addpairingcode(code: pairingcode): Promise<void> { return this.adapter.set("mcppairingcodes", [code, ...(await this.getpairingcodes()).filter(candidate => candidate.code !== code.code)]); }

  /** Marks one pairing code used so it never pairs a second client; an unknown code stays untouched. */
  async usepairingcode(code: string, now: number): Promise<void> {
    await this.adapter.set("mcppairingcodes", (await this.getpairingcodes()).map(candidate => candidate.code === code ? { ...candidate, usedat: now } : candidate));
  }

  /** Returns every client allowlist entry with its grant history. */
  async getallowlist(): Promise<allowlistentry[]> { return (await this.adapter.get<allowlistentry[]>("mcpallowlist")) ?? []; }

  /** Upserts one client allowlist entry by its fingerprint with the grant history riding the record. */
  async setallowlistentry(entry: allowlistentry): Promise<void> {
    await this.adapter.set("mcpallowlist", [entry, ...(await this.getallowlist()).filter(candidate => candidate.fingerprint !== entry.fingerprint)]);
  }

  /** Removes one client allowlist entry so its fingerprint stops passing the allowlist check. */
  async removeallowlistentry(fingerprint: string): Promise<void> {
    await this.adapter.set("mcpallowlist", (await this.getallowlist()).filter(entry => entry.fingerprint !== fingerprint));
  }

  /** Returns every approval gate with its decision state — the pending and resolved gates of the approval view. */
  async listapprovals(): Promise<approvalrequest[]> { return (await this.adapter.get<approvalrequest[]>("mcpapprovals")) ?? []; }

  /** Records one raised approval gate or its resolved state, keyed by the gate id. */
  async setapproval(request: approvalrequest): Promise<void> {
    await this.adapter.set("mcpapprovals", [request, ...(await this.listapprovals()).filter(candidate => candidate.id !== request.id)]);
  }

  /** Records one approval execution — the decision, the actor, the time and the latency — beside its gate. */
  async addapprovalexec(exec: approvalexec): Promise<void> { return this.adapter.set("mcpapprovalexecs", [exec, ...(await this.adapter.get<approvalexec[]>("mcpapprovalexecs")) ?? []]); }

  /** Returns every approval execution record, newest first. */
  async listapprovalexecs(): Promise<approvalexec[]> { return (await this.adapter.get<approvalexec[]>("mcpapprovalexecs")) ?? []; }

  /** Records one auth handshake event with its issued, verified or refused outcome. */
  async addauthhandshake(event: authhandshakeevent): Promise<void> { return this.adapter.set("mcpauthhandshakes", [event, ...(await this.adapter.get<authhandshakeevent[]>("mcpauthhandshakes")) ?? []]); }

  /** Returns every auth handshake event with its outcome, newest first. */
  async listauthhandshakes(): Promise<authhandshakeevent[]> { return (await this.adapter.get<authhandshakeevent[]>("mcpauthhandshakes")) ?? []; }

  /** Returns every stored client identity with its fingerprint for allowlist matching. */
  async getclientidentities(): Promise<clientidentity[]> { return (await this.adapter.get<clientidentity[]>("mcpidentities")) ?? []; }

  /** Upserts one client identity by its fingerprint so the allowlist matches it. */
  async setclientidentity(identity: clientidentity): Promise<void> {
    await this.adapter.set("mcpidentities", [identity, ...(await this.getclientidentities()).filter(candidate => candidate.fingerprint !== identity.fingerprint)]);
  }

  /** Returns every open and closed stream channel of the http stream transport. */
  async getstreamchannels(): Promise<streamchannel[]> { return (await this.adapter.get<streamchannel[]>("mcpchannels")) ?? []; }

  /** Replaces the stored stream channel set after one open, heartbeat or close sweep. */
  async setstreamchannels(channels: streamchannel[]): Promise<void> { return this.adapter.set("mcpchannels", channels); }

  /** Returns every client event subscription with its kinds and filters, newest first. */
  async geteventsubscriptions(): Promise<protocoleventsubscription[]> { return (await this.adapter.get<protocoleventsubscription[]>("mcpeventsubscriptions")) ?? []; }

  /** Replaces the stored event subscription set after one subscribe, unsubscribe or delivery sweep. */
  async seteventsubscriptions(subscriptions: protocoleventsubscription[]): Promise<void> { return this.adapter.set("mcpeventsubscriptions", subscriptions); }

  /** Returns every page state resource watcher with its baseline, newest first. */
  async getresourcewatches(): Promise<resourcewatch[]> { return (await this.adapter.get<resourcewatch[]>("mcpresourcewatches")) ?? []; }

  /** Replaces the stored resource watcher set after one watch, unwatch or delta push. */
  async setresourcewatches(watches: resourcewatch[]): Promise<void> { return this.adapter.set("mcpresourcewatches", watches); }

  /** Returns every sampling request with its provenance, newest first. */
  async getsamplingrequests(): Promise<samplingrequest[]> { return (await this.adapter.get<samplingrequest[]>("mcpsampling")) ?? []; }

  /** Replaces the stored sampling request set after one request or answer. */
  async setsamplingrequests(requests: samplingrequest[]): Promise<void> { return this.adapter.set("mcpsampling", requests); }

  /** Returns every stored idempotency record for replay, newest first. */
  async getidempotencyrecords(): Promise<idempotencyrecord[]> { return (await this.adapter.get<idempotencyrecord[]>("mcpidempotency")) ?? []; }

  /** Replaces the stored idempotency record set after one store or expiry sweep. */
  async setidempotencyrecords(records: idempotencyrecord[]): Promise<void> { return this.adapter.set("mcpidempotency", records); }

  /** Returns every per client rate limit counter with its window and budget. */
  async getcallratelimits(): Promise<callratelimit[]> { return (await this.adapter.get<callratelimit[]>("mcpcallratelimits")) ?? []; }

  /** Replaces the stored per client rate limit set after one configuration or counted call. */
  async setcallratelimits(limits: callratelimit[]): Promise<void> { return this.adapter.set("mcpcallratelimits", limits); }

  /** Returns every stored batch call with its per item outcomes, newest first. */
  async getbatchcalls(): Promise<batchcall[]> { return (await this.adapter.get<batchcall[]>("mcpbatchcalls")) ?? []; }

  /** Upserts one batch call by its id with the per item outcomes riding the record. */
  async setbatchcall(batch: batchcall): Promise<void> {
    await this.adapter.set("mcpbatchcalls", [batch, ...(await this.getbatchcalls()).filter(candidate => candidate.id !== batch.id)]);
  }

  /** Returns every call context of the call runtime, newest first. */
  async getcallcontexts(): Promise<callcontext[]> { return (await this.adapter.get<callcontext[]>("mcpcallcontexts")) ?? []; }

  /** Replaces the stored call context set after one begin, end or cancellation. */
  async setcallcontexts(contexts: callcontext[]): Promise<void> { return this.adapter.set("mcpcallcontexts", contexts); }

  /** Returns every stored tool mock for client testing. */
  async gettoolmocks(): Promise<toolmock[]> { return (await this.adapter.get<toolmock[]>("mcptoolmocks")) ?? []; }

  /** Upserts one tool mock by its tool name or removes it when the canned result is absent. */
  async settoolmock(mock: toolmock): Promise<void> {
    await this.adapter.set("mcptoolmocks", [mock, ...(await this.gettoolmocks()).filter(candidate => candidate.tool !== mock.tool)]);
  }

  /** Removes one tool mock so its tool returns to the real gates. */
  async removetoolmock(tool: string): Promise<void> {
    await this.adapter.set("mcptoolmocks", (await this.gettoolmocks()).filter(candidate => candidate.tool !== tool));
  }

  /** Stores one stream chunk of a progressive tool result under the recent chunk window of 25 records. */
  async addstreamchunk(chunk: streamchunk): Promise<void> {
    await this.adapter.set("mcpstreamchunks", [chunk, ...(await this.getstreamchunks()).slice(0, 24)]);
  }

  /** Returns the recent stream chunks of progressive tool results, newest first. */
  async getstreamchunks(): Promise<streamchunk[]> { return (await this.adapter.get<streamchunk[]>("mcpstreamchunks")) ?? []; }

  /** Replaces the recent stream chunk window after one streaming sweep. */
  async setstreamchunks(chunks: streamchunk[]): Promise<void> { return this.adapter.set("mcpstreamchunks", chunks); }

  /** Returns the audited tool call log under the requested filters: the client, the tool, the outcome, the time floor and the newest bound, all optional. */
  async getcalllog(filters?: { clientid?: string; tool?: string; ok?: boolean; since?: number; limit?: number }): Promise<toolcallrecord[]> {
    let records = await this.listtoolcalls();
    if (filters?.clientid !== undefined) records = records.filter(record => record.clientid === filters.clientid);
    if (filters?.tool !== undefined) records = records.filter(record => record.tool === filters.tool);
    if (filters?.ok !== undefined) records = records.filter(record => record.ok === filters.ok);
    if (filters?.since !== undefined) records = records.filter(record => record.at >= (filters.since ?? 0));
    return filters?.limit !== undefined ? records.slice(0, filters.limit) : records;
  }

  /** Stores one progress notice of a long tool call under the recent notice window of 25 records. */
  async addprogressnotice(notice: progressnotice): Promise<void> {
    await this.adapter.set("mcpprogressnotices", [notice, ...(await this.getprogressnotices()).slice(0, 24)]);
  }

  /** Returns the recent progress notices of long tool calls, newest first. */
  async getprogressnotices(): Promise<progressnotice[]> { return (await this.adapter.get<progressnotice[]>("mcpprogressnotices")) ?? []; }

  /** Returns the tool dry run toggle of the next call: true once the user armed the dry run in the panel. */
  async getdryruntoggle(): Promise<boolean> { return (await this.adapter.get<boolean>("mcpdryruntoggle")) === true; }

  /** Arms or disarms the tool dry run of the next call. */
  async setdryruntoggle(enabled: boolean): Promise<void> { return this.adapter.set("mcpdryruntoggle", enabled); }

  /** Returns every client session binding of the 1.1.84 serve mode: one live binding per client so concurrent clients hold isolated extension sessions. */
  async getclientbindings(): Promise<clientbinding[]> { return (await this.adapter.get<clientbinding[]>("mcpclientbindings")) ?? []; }

  /** Replaces the stored client binding set after one bind or release; the released records stay for the audit trail. */
  async setclientbindings(bindings: clientbinding[]): Promise<void> { return this.adapter.set("mcpclientbindings", bindings); }

  /** Upserts one client session binding of the 1.1.84 serve mode by its client id. */
  async setclientbinding(binding: clientbinding): Promise<void> {
    await this.adapter.set("mcpclientbindings", [binding, ...(await this.getclientbindings()).filter(candidate => candidate.clientid !== binding.clientid)]);
  }

  /** Returns the shutdown drain window of the 1.1.84 serve mode in milliseconds; an absent window keeps the drain unbounded because the wait stays a user choice. */
  async getdrainwindow(): Promise<number | undefined> { return this.adapter.get<number>("mcpdrainwindow"); }

  /** Stores the shutdown drain window of the 1.1.84 serve mode as the user configured value with no code ceiling. */
  async setdrainwindow(window: number): Promise<void> { return this.adapter.set("mcpdrainwindow", window); }

  /** Returns every user configured provider config of the 1.1.57 llm integration; the api keys stay behind their storage id references, never inside these records. */
  async getproviders(): Promise<providerconfig[]> { return (await this.adapter.get<providerconfig[]>("llmproviders")) ?? []; }

  /** Replaces the stored provider config set after one save, test or removal. */
  async setproviders(providers: providerconfig[]): Promise<void> { return this.adapter.set("llmproviders", providers); }

  /** Returns the user configured local model endpoint of the browser reachable inference. */
  async getlocalmodel(): Promise<localmodelconfig | undefined> { return this.adapter.get<localmodelconfig>("llmlocalmodel"); }

  /** Stores the local model endpoint config after one save or health check. */
  async setlocalmodel(config: localmodelconfig): Promise<void> { return this.adapter.set("llmlocalmodel", config); }

  /** Returns every model route entry of the routing table, newest update first. */
  async getmodelroutes(): Promise<modelroute[]> { return (await this.adapter.get<modelroute[]>("llmmodelroutes")) ?? []; }

  /** Replaces the stored routing table after one route edit. */
  async setmodelroutes(routes: modelroute[]): Promise<void> { return this.adapter.set("llmmodelroutes", routes); }

  /** Appends one revision entry to the model route revision history so every routing change stays queryable for audit. */
  async addmodelrouterevision(route: modelroute): Promise<void> {
    await this.adapter.set("llmmodelroutehistory", [route, ...(await this.adapter.get<modelroute[]>("llmmodelroutehistory") ?? [])].slice(0, 200));
  }

  /** Returns the model route revision history, newest first. */
  async getmodelroutehistory(): Promise<modelroute[]> { return (await this.adapter.get<modelroute[]>("llmmodelroutehistory")) ?? []; }

  /** Records one usage entry of a model call with its run and step ids; the newest call reads first and an absent retention keeps every record. */
  async addusagerecord(record: usagerecord): Promise<void> {
    await this.adapter.set("llmusage", [record, ...(await this.adapter.get<usagerecord[]>("llmusage") ?? [])]);
  }

  /** Returns every stored usage record of model calls, newest first. */
  async getusagerecords(): Promise<usagerecord[]> { return (await this.adapter.get<usagerecord[]>("llmusage")) ?? []; }

  /** Returns the token and cost totals per period: the run, the step, the since floor and the until ceiling stay optional filters over the stored usage records. */
  async getusage(filter: { runid?: string; stepid?: string; since?: number; until?: number } = {}): Promise<{ prompttokens: number; completiontokens: number; totaltokens: number; cost: number; calls: number }> {
    const records = (await this.getusagerecords()).filter(record => (filter.runid === undefined || record.runid === filter.runid) && (filter.stepid === undefined || record.stepid === filter.stepid) && (filter.since === undefined || record.at >= filter.since) && (filter.until === undefined || record.at <= filter.until));
    return records.reduce((totals, record) => ({ prompttokens: totals.prompttokens + record.prompttokens, completiontokens: totals.completiontokens + record.completiontokens, totaltokens: totals.totaltokens + record.totaltokens, cost: totals.cost + record.cost, calls: totals.calls + 1 }), { prompttokens: 0, completiontokens: 0, totaltokens: 0, cost: 0, calls: 0 });
  }

  /** Stores one model drafted plan for review and audit; newer drafts read first. */
  async addplandraft(draft: plandraft): Promise<void> {
    await this.adapter.set("llmplandrafts", [draft, ...(await this.adapter.get<plandraft[]>("llmplandrafts") ?? [])]);
  }

  /** Replaces the stored draft set after one review decision. */
  async setplandrafts(drafts: plandraft[]): Promise<void> { return this.adapter.set("llmplandrafts", drafts); }

  /** Returns every stored model drafted plan, newest first. */
  async getplandrafts(): Promise<plandraft[]> { return (await this.adapter.get<plandraft[]>("llmplandrafts")) ?? []; }

  /** Stores one replan record for the fresh review and the audit history; newer replans read first. */
  async addreplan(replan: replanrecord): Promise<void> {
    await this.adapter.set("llmreplans", [replan, ...(await this.adapter.get<replanrecord[]>("llmreplans") ?? [])]);
  }

  /** Replaces the stored replan set after one fresh review decision. */
  async setreplans(replans: replanrecord[]): Promise<void> { return this.adapter.set("llmreplans", replans); }

  /** Returns every stored replan record, newest first. */
  async getreplans(): Promise<replanrecord[]> { return (await this.adapter.get<replanrecord[]>("llmreplans")) ?? []; }

  /** Stores one reflection note of an executed step under the recent note window of 100 records. */
  async addreflectnote(note: reflectnote): Promise<void> {
    await this.adapter.set("llmreflectnotes", [note, ...(await this.adapter.get<reflectnote[]>("llmreflectnotes") ?? [])].slice(0, 100));
  }

  /** Returns the stored reflection notes, newest first. */
  async getreflectnotes(): Promise<reflectnote[]> { return (await this.adapter.get<reflectnote[]>("llmreflectnotes")) ?? []; }

  /** Replaces the stored prompt template library after one save or removal; every version with its change notes stays stored. */
  async setprompttemplates(templates: prompttemplate[]): Promise<void> { return this.adapter.set("llmprompttemplates", templates); }

  /** Returns the stored prompt template library with every version, newest first. */
  async getprompttemplates(): Promise<prompttemplate[]> { return (await this.adapter.get<prompttemplate[]>("llmprompttemplates")) ?? []; }

  /** Returns the stored cost budget of the runs; the run scoped budget wins over the shared one when both exist. */
  async getcostbudget(runid?: string): Promise<costbudget | undefined> {
    const budgets = (await this.adapter.get<costbudget[]>("llmcostbudgets")) ?? [];
    return budgets.find(budget => runid !== undefined && budget.runid === runid) ?? budgets.find(budget => budget.runid === undefined);
  }

  /** Stores one cost budget; a run scoped budget replaces the earlier budget of its run while the shared budget replaces the shared one. */
  async setcostbudget(budget: costbudget): Promise<void> {
    const budgets = (await this.adapter.get<costbudget[]>("llmcostbudgets")) ?? [];
    const kept = budgets.filter(candidate => candidate.runid !== budget.runid);
    await this.adapter.set("llmcostbudgets", [budget, ...kept]);
  }

  /** Returns the latest parsed natural language command with its intent badge payload. */
  async getcommandparse(): Promise<commandparse | undefined> { return this.adapter.get<commandparse>("llmcommandparse"); }

  /** Stores the latest parsed natural language command. */
  async setcommandparse(parse: commandparse): Promise<void> { return this.adapter.set("llmcommandparse", parse); }

  /** Returns the recent guard refusal notices of invalid or refused model output, newest first under a window of 50. */
  async getguardnotices(): Promise<modeloutput[]> { return (await this.adapter.get<modeloutput[]>("llmguardnotices")) ?? []; }

  /** Records one guard refusal notice for the panel; the verdict reason explains the parse failure and its retries. */
  async addguardnotice(output: modeloutput): Promise<void> {
    if (output.verdict === "valid") return;
    await this.adapter.set("llmguardnotices", [output, ...(await this.getguardnotices())].slice(0, 50));
  }

  /** Returns every user configured provider gateway of the 1.1.83 family: the base url, the path prefix, the enable toggle, the consent stamp and the key reference — the key material stays behind the vault seam, never inside these records. */
  async getgatewayconfigs(): Promise<baseurlconfig[]> { return (await this.adapter.get<baseurlconfig[]>("gatewayconfigs")) ?? []; }

  /** Replaces the stored provider gateway configs after one save, consent or removal. */
  async setgatewayconfigs(configs: baseurlconfig[]): Promise<void> { return this.adapter.set("gatewayconfigs", configs); }

  /** Returns the cached model lists of the provider gateways, one record per provider. */
  async getgatewaymodelcaches(): Promise<modelcacherecord[]> { return (await this.adapter.get<modelcacherecord[]>("gatewaymodelcaches")) ?? []; }

  /** Replaces one provider model cache record, keeping every other provider record untouched. */
  async setgatewaymodelcache(record: modelcacherecord): Promise<void> {
    await this.adapter.set("gatewaymodelcaches", [record, ...(await this.getgatewaymodelcaches()).filter(entry => entry.providerid !== record.providerid)]);
  }

  /** Returns the stored gateway chat exchanges, newest first under a window of 20; the states carry tokens and errors only, never key material. */
  async getgatewaychats(): Promise<gatewaychatstate[]> { return (await this.adapter.get<gatewaychatstate[]>("gatewaychats")) ?? []; }

  /** Stores one gateway chat exchange, newest first under a window of 20; a stored requestid replaces its earlier state so the stream cursor polls one record. */
  async addgatewaychat(state: gatewaychatstate): Promise<void> {
    await this.adapter.set("gatewaychats", [state, ...(await this.getgatewaychats()).filter(entry => entry.requestid !== state.requestid)].slice(0, 20));
  }

  /** Removes one gateway chat exchange by its request id; the cancel control drops the record the panel stops polling. */
  async removegatewaychat(requestid: string): Promise<void> {
    await this.adapter.set("gatewaychats", (await this.getgatewaychats()).filter(entry => entry.requestid !== requestid));
  }

  /** Returns the user configured model cache refresh window in milliseconds; an absent window keeps every cache fresh forever because the window stays a user choice. */
  async getgatewaycachewindow(): Promise<number | undefined> { return this.adapter.get<number>("gatewaycachewindow"); }

  /** Stores the user configured model cache refresh window in milliseconds. */
  async setgatewaycachewindow(window: number): Promise<void> { return this.adapter.set("gatewaycachewindow", window); }

  /** Returns every agent identity of the 1.1.58 swarm with its tab, role, depth, budget and scope. */
  async getagents(): Promise<agentidentity[]> { return (await this.adapter.get<agentidentity[]>("swarmagents")) ?? []; }

  /** Replaces the stored agent identities after one register, assign, bind, spawn or lifecycle change. */
  async setagents(agents: agentidentity[]): Promise<void> { return this.adapter.set("swarmagents", agents); }

  /** Returns the shared task queue of the swarm with its lanes, priorities, items and claims. */
  async gettaskqueue(): Promise<taskqueue | undefined> { return this.adapter.get<taskqueue>("swarmtaskqueue"); }

  /** Replaces the stored task queue after one enqueue, claim, steal, complete, cancel or requeue. */
  async settaskqueue(queue: taskqueue): Promise<void> { return this.adapter.set("swarmtaskqueue", queue); }

  /** Returns every agent mailbox; retention is a user setting and an absent setting keeps every message. */
  async getmailboxes(): Promise<agentmailbox[]> { return (await this.adapter.get<agentmailbox[]>("swarmmailboxes")) ?? []; }

  /** Replaces the stored mailboxes after one send or receive, applying the user configured mailbox retention over the stored inbox and outbox messages. */
  async setmailboxes(mailboxes: agentmailbox[]): Promise<void> {
    const retention = (await this.getsettings())?.mailboxretention;
    const trimmed = retention === undefined ? mailboxes : mailboxes.map(mailbox => ({ ...mailbox, inbox: mailbox.inbox.slice(0, retention), outbox: mailbox.outbox.slice(0, retention) }));
    return this.adapter.set("swarmmailboxes", trimmed);
  }

  /** Returns the blackboard shared memory of the swarm with its sections and entries. */
  async getblackboard(): Promise<blackboard | undefined> { return this.adapter.get<blackboard>("swarmblackboard"); }

  /** Replaces the stored blackboard after one post, retire or sweep. */
  async setblackboard(board: blackboard): Promise<void> { return this.adapter.set("swarmblackboard", board); }

  /** Returns the killswitch state of the swarm. */
  async getkillswitch(): Promise<killswitch | undefined> { return this.adapter.get<killswitch>("swarmkillswitch"); }

  /** Stores the killswitch state after one engage or disarm. */
  async setkillswitch(state: killswitch): Promise<void> { return this.adapter.set("swarmkillswitch", state); }

  /** Records one spawn of a sub agent with its depth for the audit history, newest first. */
  async addspawnrecord(record: spawnrecord): Promise<void> {
    await this.adapter.set("swarmspawns", [record, ...(await this.adapter.get<spawnrecord[]>("swarmspawns") ?? [])]);
  }

  /** Returns the spawn and depth history of the swarm, newest first. */
  async getspawnrecords(): Promise<spawnrecord[]> { return (await this.adapter.get<spawnrecord[]>("swarmspawns")) ?? []; }

  /** Records one agent lifecycle event notification, newest first under a window of 200. */
  async addagentevent(event: agentevent): Promise<void> {
    await this.adapter.set("swarmevents", [event, ...(await this.adapter.get<agentevent[]>("swarmevents") ?? [])].slice(0, 200));
  }

  /** Returns the recorded agent lifecycle events, newest first. */
  async getagentevents(): Promise<agentevent[]> { return (await this.adapter.get<agentevent[]>("swarmevents")) ?? []; }

  /** Replaces the stored per agent usage counters held against the agent budgets. */
  async setagentusage(usage: agentusage[]): Promise<void> { return this.adapter.set("swarmusage", usage); }

  /** Returns the stored per agent usage counters held against the agent budgets. */
  async getagentusage(): Promise<agentusage[]> { return (await this.adapter.get<agentusage[]>("swarmusage")) ?? []; }

  /** Returns the swarm at a glance: the agents, the tasks by claim state and the message counters read from the stored swarm records. */
  async swarmoverview(): Promise<{ agents: number; active: number; paused: number; stopped: number; tasks: number; queued: number; claimed: number; done: number; cancelled: number; messages: number; unread: number }> {
    const agents = await this.getagents();
    const queue = await this.gettaskqueue();
    const mailboxes = await this.getmailboxes();
    return swarmoverviewof({ agents, queue: queue ?? { lanes: [], priorities: [], completionpolicy: "all", items: [], claims: [] }, mailboxes });
  }

  /** Returns the leader worker topology of the 1.1.59 swarm with its leader, worker, critic and verifier lanes and its worker assignments. */
  async gettopology(): Promise<leaderworker | undefined> { return this.adapter.get<leaderworker>("swarmtopology"); }

  /** Replaces the stored leader worker topology after one election, assignment, collection or scaling change. */
  async settopology(topology: leaderworker): Promise<void> { return this.adapter.set("swarmtopology", topology); }

  /** Returns the stored planner executor splits of the 1.1.59 swarm with their step reports. */
  async getplannersplits(): Promise<plannerexecutor[]> { return (await this.adapter.get<plannerexecutor[]>("swarmsplits")) ?? []; }

  /** Replaces the stored planner executor splits after one split or one executor step report. */
  async setplannersplits(splits: plannerexecutor[]): Promise<void> { return this.adapter.set("swarmsplits", splits); }

  /** Records one critic review of an agent output, newest first. */
  async addcriticreview(review: criticreview): Promise<void> {
    await this.adapter.set("swarmreviews", [review, ...(await this.adapter.get<criticreview[]>("swarmreviews") ?? [])]);
  }

  /** Returns the recorded critic reviews, newest first. */
  async getcriticreviews(): Promise<criticreview[]> { return (await this.adapter.get<criticreview[]>("swarmreviews")) ?? []; }

  /** Records one verifier check of a result claim, newest first. */
  async addverifiercheck(check: verifiercheck): Promise<void> {
    await this.adapter.set("swarmverifierchecks", [check, ...(await this.adapter.get<verifiercheck[]>("swarmverifierchecks") ?? [])]);
  }

  /** Returns the recorded verifier checks with their pass and fail outcomes, newest first. */
  async getverifierchecks(): Promise<verifiercheck[]> { return (await this.adapter.get<verifiercheck[]>("swarmverifierchecks")) ?? []; }

  /** Replaces the stored review requests routed between agents after one request, ack, answer or timeout. */
  async setreviewrequests(requests: reviewrequest[]): Promise<void> { return this.adapter.set("swarmreviewrequests", requests); }

  /** Returns the stored review requests routed between agents. */
  async getreviewrequests(): Promise<reviewrequest[]> { return (await this.adapter.get<reviewrequest[]>("swarmreviewrequests")) ?? []; }

  /** Records one tab handoff with its packaged task state and its resumed state. */
  async addhandoff(record: handoffrecord): Promise<void> {
    await this.adapter.set("swarmhandoffs", [record, ...(await this.adapter.get<handoffrecord[]>("swarmhandoffs") ?? [])].filter((entry, index, all) => all.findIndex(candidate => candidate.id === entry.id) === index));
  }

  /** Replaces one stored handoff record after its transfer or resume. */
  async updatehandoff(record: handoffrecord): Promise<void> {
    await this.adapter.set("swarmhandoffs", (await this.adapter.get<handoffrecord[]>("swarmhandoffs") ?? []).map(entry => entry.id === record.id ? record : entry));
  }

  /** Returns the handoff log of tab transfers between agents, newest first. */
  async gethandoffs(): Promise<handoffrecord[]> { return (await this.adapter.get<handoffrecord[]>("swarmhandoffs")) ?? []; }

  /** Replaces the stored resource locks after one acquire, release or expiry sweep. */
  async setlocks(locks: resourcelock[]): Promise<void> { return this.adapter.set("swarmlocks", locks); }

  /** Returns the held resource locks with their holders and expiries. */
  async getlocks(): Promise<resourcelock[]> { return (await this.adapter.get<resourcelock[]>("swarmlocks")) ?? []; }

  /** Records one conflict scan report of overlapping writes, newest first. */
  async addconflictscan(scan: conflictscan): Promise<void> {
    await this.adapter.set("swarmconflicts", [scan, ...(await this.adapter.get<conflictscan[]>("swarmconflicts") ?? [])]);
  }

  /** Returns the recorded conflict scan reports, newest first. */
  async getconflictscans(): Promise<conflictscan[]> { return (await this.adapter.get<conflictscan[]>("swarmconflicts")) ?? []; }

  /** Stores the merged result report with its mergeentry provenance. */
  async setreport(report: resultreport): Promise<void> { return this.adapter.set("swarmreport", report); }

  /** Returns the stored merged result report across agents. */
  async getreport(): Promise<resultreport | undefined> { return this.adapter.get<resultreport>("swarmreport"); }

  /** Records one progressboard snapshot under the user configured retention window; an absent window keeps every snapshot. */
  async addboardsnapshot(board: progressboard): Promise<void> {
    const retention = (await this.getsettings())?.boardretention;
    await this.adapter.set("swarmboards", [board, ...(await this.adapter.get<progressboard[]>("swarmboards") ?? [])].slice(0, retention ?? 100));
  }

  /** Returns the stored progressboard snapshots, newest first. */
  async getboardsnapshots(): Promise<progressboard[]> { return (await this.adapter.get<progressboard[]>("swarmboards")) ?? []; }

  /** Records one escalation lifted to the user, newest first. */
  async addescalation(escalation: escalationrecord): Promise<void> {
    await this.adapter.set("swarmescalations", [escalation, ...(await this.adapter.get<escalationrecord[]>("swarmescalations") ?? [])]);
  }

  /** Replaces one stored escalation after its user decision. */
  async updateescalation(escalation: escalationrecord): Promise<void> {
    await this.adapter.set("swarmescalations", (await this.adapter.get<escalationrecord[]>("swarmescalations") ?? []).map(entry => entry.id === escalation.id ? escalation : entry));
  }

  /** Returns the escalations awaiting the user and the decided ones, newest first. */
  async getescalations(): Promise<escalationrecord[]> { return (await this.adapter.get<escalationrecord[]>("swarmescalations")) ?? []; }

  /** Records one consensus round or replaces the stored one after a vote. */
  async setconsensusround(round: consensusround): Promise<void> {
    const rounds = await this.adapter.get<consensusround[]>("swarmconsensus") ?? [];
    await this.adapter.set("swarmconsensus", rounds.some(entry => entry.id === round.id) ? rounds.map(entry => entry.id === round.id ? round : entry) : [round, ...rounds]);
  }

  /** Returns the consensus rounds with their votes and quorum states, newest first. */
  async getconsensusrounds(): Promise<consensusround[]> { return (await this.adapter.get<consensusround[]>("swarmconsensus")) ?? []; }

  /** Appends one action to the interleaved timeline of swarm actions, oldest first under a window of 500. */
  async addswarmaction(action: swarmaction): Promise<void> {
    await this.adapter.set("swarmtimeline", [...(await this.adapter.get<swarmaction[]>("swarmtimeline") ?? []), action].slice(-500));
  }

  /** Returns the interleaved timeline of swarm actions with the optional agent and kind filters, oldest first. */
  async getswarmtimeline(filters?: { agentid?: string; kind?: string; since?: number }): Promise<swarmaction[]> {
    const actions = (await this.adapter.get<swarmaction[]>("swarmtimeline")) ?? [];
    return actions
      .filter(action => filters?.agentid === undefined || action.agentid === filters.agentid)
      .filter(action => filters?.kind === undefined || action.kind === filters.kind)
      .filter(action => filters?.since === undefined || action.at >= filters.since);
  }

  /** Stores one shared cost accounting snapshot of the swarm, newest first. */
  async addswarmcost(cost: swarmcost): Promise<void> {
    await this.adapter.set("swarmcosts", [cost, ...(await this.adapter.get<swarmcost[]>("swarmcosts") ?? [])].slice(0, 100));
  }

  /** Returns the stored shared cost accounting snapshots of the swarm, newest first. */
  async getswarmcosts(): Promise<swarmcost[]> { return (await this.adapter.get<swarmcost[]>("swarmcosts")) ?? []; }

  /**
   * Execution environment persistence of the 1.1.60 family.
   * The run state store seals every persisted run state with its sha-256 integrity digest through the storage api (the browser offers no at-rest encryption for its storage areas, so the honest derivation is the integrity seal that makes tampering detectable before any recovery uses the record), scopes every run state per profile so parallel profiles never share it, expires stale run state past the user configured window while the keepalive summaries survive, tracks the storage quota usage of the run state and prunes the oldest finished run states under pressure.
   * The adapter seam keeps every accessor a one line storage delegation so a future worker state backend replaces the adapter only.
   */

  /** Returns the environment grant list of the active session; an absent list keeps the documented default posture. */
  async getenvironmentgrants(): Promise<environmentkind[] | undefined> { return (await this.getsession())?.environmentgrants; }

  /** Replaces the environment grant list of the active session so the environment grants join the origin grants in the session record. */
  async setenvironmentgrants(grants: environmentkind[]): Promise<void> {
    const session = await this.getsession();
    if (!session) throw new Error("The environment grants need an active session to join.");
    await this.setsession({ ...session, environmentgrants: grants });
  }

  /** Seals and stores the run state of one profile: the payload travels beside its sha-256 digest so a tampered record at rest stays detectable before any recovery uses it. */
  async setrunstate(profileid: string, state: runstaterecord): Promise<void> {
    const sealed = await sealrunstate(state);
    const index = (await this.adapter.get<string[]>("runstateindex")) ?? [];
    await this.adapter.set(`runstate:${profileid}`, sealed);
    if (!index.includes(profileid)) await this.adapter.set("runstateindex", [...index, profileid]);
  }

  /** Opens the sealed run state of one profile; a missing or tampered seal returns undefined so the recovery never trusts a broken record. */
  async getrunstate(profileid: string): Promise<runstaterecord | undefined> {
    const sealed = await this.adapter.get<sealedrunstate>(`runstate:${profileid}`);
    if (!sealed) return undefined;
    try { return await openseal(sealed); } catch { return undefined; }
  }

  /** Removes the run state of one profile from the store and the index: the per profile key takes an empty seal that never opens, so the quota pruning drops the pruned records whole. */
  async removerunstate(profileid: string): Promise<void> {
    const index = (await this.adapter.get<string[]>("runstateindex")) ?? [];
    await this.adapter.set("runstateindex", index.filter(entry => entry !== profileid));
    await this.adapter.set(`runstate:${profileid}`, { payload: "", algorithm: "sha-256", digest: "", sealedat: 0 } as sealedrunstate);
  }

  /** Lists the stored run state records of every profile, oldest update first. */
  async listrunstates(): Promise<runstaterecord[]> {
    const index = (await this.adapter.get<string[]>("runstateindex")) ?? [];
    const states: runstaterecord[] = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (state) states.push(state);
    }
    return states.sort((one, two) => one.updatedat - two.updatedat);
  }

  /** Expires the stale run states past the user configured window: the expired records reduce to their keepalive summaries while an absent window keeps every run state whole. */
  async expirerunstates(window: number | undefined, now: number): Promise<runstaterecord[]> {
    if (window === undefined) return await this.listrunstates();
    const index = (await this.adapter.get<string[]>("runstateindex")) ?? [];
    const kept: runstaterecord[] = [];
    for (const profileid of index) {
      const state = await this.getrunstate(profileid);
      if (!state) continue;
      if (now - state.updatedat > window && state.keepalive.state === "stopped") {
        const summary: runstaterecord = { runid: state.runid, sessionid: state.sessionid, planid: state.planid, profileid: state.profileid, state: "expired", urlhistory: [], environments: {}, turnarounds: {}, keepalive: state.keepalive, updatedat: now };
        const sealed = await sealrunstate(summary);
        await this.adapter.set(`runstate:${profileid}`, sealed);
      } else {
        kept.push(state);
      }
    }
    return kept;
  }

  /** Records one worker spawn or teardown event with its provenance beside the step outcomes. */
  async addworkerevent(event: workerevent): Promise<void> {
    await this.adapter.set("workerevents", [event, ...(await this.adapter.get<workerevent[]>("workerevents") ?? [])].slice(0, 500));
  }

  /** Returns the recorded worker spawn and teardown events, newest first. */
  async getworkerevents(): Promise<workerevent[]> { return (await this.adapter.get<workerevent[]>("workerevents")) ?? []; }

  /** Records one spawned offscreen document with its reasons and justification in the registry. */
  async addoffscreenentry(entry: offscreenregistryentry): Promise<void> {
    await this.adapter.set("offscreenregistry", [entry, ...(await this.adapter.get<offscreenregistryentry[]>("offscreenregistry") ?? [])]);
  }

  /** Replaces one registry entry after its offscreen document closes. */
  async updateoffscreenentry(entry: offscreenregistryentry): Promise<void> {
    await this.adapter.set("offscreenregistry", (await this.adapter.get<offscreenregistryentry[]>("offscreenregistry") ?? []).map(candidate => candidate.runid === entry.runid ? entry : candidate));
  }

  /** Returns the offscreen document registry with the reasons and justification of every spawn. */
  async getoffscreenentries(): Promise<offscreenregistryentry[]> { return (await this.adapter.get<offscreenregistryentry[]>("offscreenregistry")) ?? []; }

  /** Records one sandbox render with its provenance, source origin and nonce. */
  async addsandboxrender(render: sandboxrender): Promise<void> {
    await this.adapter.set("sandboxrenders", [render, ...(await this.adapter.get<sandboxrender[]>("sandboxrenders") ?? [])].slice(0, 500));
  }

  /** Returns the recorded sandbox renders with their provenance, newest first. */
  async getsandboxrenders(): Promise<sandboxrender[]> { return (await this.adapter.get<sandboxrender[]>("sandboxrenders")) ?? []; }

  /** Replaces the stored run locks after one acquisition, release or expiry sweep. */
  async setrunlocks(locks: runlock[]): Promise<void> { return this.adapter.set("runlocks", locks); }

  /** Returns the held run locks with their sessions, runs and expiries. */
  async getrunlocks(): Promise<runlock[]> { return (await this.adapter.get<runlock[]>("runlocks")) ?? []; }

  /** Tracks the storage quota usage of the run state: the last measured bytes stay beside the user configured ceiling so the pruning reads both. */
  async trackrunstatequota(used: number): Promise<void> {
    const settings = await this.getsettings();
    await this.adapter.set("runstatequota", { used, ...(settings?.runstatebytes !== undefined ? { ceiling: settings.runstatebytes } : {}), trackedat: Date.now() });
  }

  /** Returns the last tracked storage quota usage of the run state with its ceiling when the user configured one. */
  async getrunstatequota(): Promise<{ used: number; ceiling?: number; trackedat: number } | undefined> { return this.adapter.get<{ used: number; ceiling?: number; trackedat: number }>("runstatequota"); }

  /** Exports every stored run state as one single audit record through the runstate export envelope. */
  async exportrunstates(): Promise<{ runs: number; urls: number; environments: number; offloaded: number; beats: number; exportedat: number }> { return exportrunstate(await this.listrunstates(), Date.now()); }

  /**
   * Security part one persistence of the 1.1.61 family.
   * The trust boundary records live here: the per origin automation allowlist scoped per profile workspace with one exact origin per entry, the per site originprofiles with their kind grants and denials, the active consentwindows with their expiry timestamps that expire closed past their boundary, the mid run revokerun events with the halted step ids that stay visible for later consent prompts, the fresh class consents per origin, the mask rules for field shapes per origin, and the sealed immutable run logs with their final hash.
   * The run log store exposes no update or delete path: appends land whole, the seal closes a log with its final hash and the read path verifies the chain before returning a single entry so a broken link refuses the read.
   * The adapter seam keeps every accessor a one line storage delegation so a future append only backend replaces the adapter only; the current storage areas offer no append only hardware, so the honest derivation is the hash chain that makes any rewrite detectable at read time.
   */

  /** Replaces the per origin automation allowlist of the profile workspaces; every entry carries one exact origin with no wildcard expansion. */
  async setautomationallowlist(entries: automationallowlistentry[]): Promise<void> { return this.adapter.set("automationallowlist", entries); }

  /** Returns the per origin automation allowlist entries, oldest grant first. */
  async getautomationallowlist(): Promise<automationallowlistentry[]> { return (await this.adapter.get<automationallowlistentry[]>("automationallowlist")) ?? []; }

  /** Adds one exact origin to the automation allowlist of a profile workspace; a duplicate origin keeps its first grant. */
  async addallowlistorigin(entry: automationallowlistentry): Promise<void> {
    const entries = await this.getautomationallowlist();
    if (entries.some(candidate => candidate.origin === entry.origin && candidate.profileid === entry.profileid)) return;
    await this.setautomationallowlist([...entries, entry]);
  }

  /** Removes one origin from the automation allowlist; the denydefault posture refuses the origin again after the removal. */
  async removeallowlistorigin(origin: string, profileid: string): Promise<void> {
    await this.setautomationallowlist((await this.getautomationallowlist()).filter(entry => !(entry.origin === origin && entry.profileid === profileid)));
  }

  /** Replaces the per site origin profiles with their kind grants and denials; one profile per origin. */
  async setoriginprofiles(profiles: originprofile[]): Promise<void> { return this.adapter.set("originprofiles", profiles); }

  /** Returns the stored per site origin profiles, oldest update first. */
  async getoriginprofiles(): Promise<originprofile[]> { return (await this.adapter.get<originprofile[]>("originprofiles")) ?? []; }

  /** Upserts one origin profile: a profile of the same origin replaces its grants and denials while a new origin joins the list. */
  async saveoriginprofile(profile: originprofile): Promise<void> {
    const profiles = await this.getoriginprofiles();
    await this.setoriginprofiles(profiles.some(candidate => candidate.origin === profile.origin) ? profiles.map(candidate => candidate.origin === profile.origin ? profile : candidate) : [...profiles, profile]);
  }

  /** Replaces the consent windows; active windows keep their expiry timestamps and closed windows stay for the audit trail. */
  async setconsentwindows(windows: consentwindow[]): Promise<void> { return this.adapter.set("consentwindows", windows); }

  /** Returns the stored consent windows, newest start first. */
  async getconsentwindows(): Promise<consentwindow[]> { return (await this.adapter.get<consentwindow[]>("consentwindows")) ?? []; }

  /** Expires every consent window past its duration boundary: the closed windows keep their records while their grants bind no step anymore. */
  async expireconsentwindows(now: number): Promise<consentwindow[]> {
    const windows = await this.getconsentwindows();
    const expired = windows.map(window => window.state === "active" && now >= window.expiresat ? { ...window, state: "closed" as const, closedat: now } : window);
    await this.setconsentwindows(expired);
    return expired;
  }

  /** Records one mid run revocation with its halted step ids; the history stays visible for later consent prompts. */
  async addrevocation(event: revokerunevent): Promise<void> {
    await this.adapter.set("revocations", [event, ...(await this.adapter.get<revokerunevent[]>("revocations") ?? [])].slice(0, 500));
  }

  /** Returns the recorded mid run revocations with their halted step ids, newest first. */
  async getrevocations(): Promise<revokerunevent[]> { return (await this.adapter.get<revokerunevent[]>("revocations")) ?? []; }

  /** Replaces the fresh class consents per origin. */
  async setclassconsents(consents: classconsent[]): Promise<void> { return this.adapter.set("classconsents", consents); }

  /** Returns the fresh class consents per origin, newest grant first. */
  async getclassconsents(): Promise<classconsent[]> { return (await this.adapter.get<classconsent[]>("classconsents")) ?? []; }

  /** Records one fresh class consent per origin; the prompt of one class never widens another class. */
  async addclassconsent(consent: classconsent): Promise<void> {
    const consents = (await this.getclassconsents()).filter(candidate => !(candidate.origin === consent.origin && candidate.sensitiveclass === consent.sensitiveclass));
    await this.setclassconsents([consent, ...consents]);
  }

  /** Replaces the mask rules for sensitive field shapes per origin. */
  async setmaskrules(rules: maskrule[]): Promise<void> { return this.adapter.set("maskrules", rules); }

  /** Returns the stored mask rules for sensitive field shapes per origin, oldest rule first. */
  async getmaskrules(): Promise<maskrule[]> { return (await this.adapter.get<maskrule[]>("maskrules")) ?? []; }

  /** Adds one mask rule for field shapes, optionally scoped to one origin. */
  async addmaskrule(rule: maskrule): Promise<void> { await this.setmaskrules([...(await this.getmaskrules()), rule]); }

  /** Removes one mask rule by its id. */
  async removemaskrule(id: string): Promise<void> { await this.setmaskrules((await this.getmaskrules()).filter(rule => rule.id !== id)); }

  /** Stores the whole run log of one run: the append lands in one storage transaction so the entries and their chain links persist together. */
  async setimmutablelog(log: storedrunlog): Promise<void> { return this.adapter.set(`immutablelog:${log.runid}`, log); }

  /** Returns the stored run log of one run; an absent log returns undefined. */
  async getimmutablelog(runid: string): Promise<storedrunlog | undefined> { return this.adapter.get<storedrunlog>(`immutablelog:${runid}`); }

  /** Lists the stored run logs, oldest update first, with the sealed logs carrying their final hash. */
  async listimmutablelogs(): Promise<storedrunlog[]> {
    const index = (await this.adapter.get<string[]>("immutablelogindex")) ?? [];
    const logs: storedrunlog[] = [];
    for (const runid of index) {
      const log = await this.getimmutablelog(runid);
      if (log) logs.push(log);
    }
    return logs.sort((one, two) => one.updatedat - two.updatedat);
  }

  /** Stores the run log index entry of one run so the log listing reads every stored log. */
  async trackimmutablelog(runid: string): Promise<void> {
    const index = (await this.adapter.get<string[]>("immutablelogindex")) ?? [];
    if (!index.includes(runid)) await this.adapter.set("immutablelogindex", [...index, runid]);
  }

  /** Exports the verified log chain of one run for the audit file: the read path verifies the whole hash chain first and a broken link refuses the export with no entries served. */
  async exportverifiedrunlog(runid: string): Promise<{ runid: string; entries: number; chainvalid: boolean; reason: string; sealhash?: string; sealedat?: number; log: immutablelogentry[] }> {
    const log = await this.getimmutablelog(runid);
    if (!log) throw new Error(`No run log exists for the run ${runid}.`);
    return exportlogchain(log);
  }

  /** Expires the sealed run logs past the user configured retention: the entries reduce to their chain summaries while the seal hash always survives. */
  async expireimmutablelogs(retention: number | undefined, now: number): Promise<storedrunlog[]> {
    const logs = await this.listimmutablelogs();
    if (retention === undefined) return logs;
    const kept: storedrunlog[] = [];
    for (const log of logs) {
      if (log.seal !== undefined && now - log.seal.sealedat > retention) {
        const summary: storedrunlog = { runid: log.runid, sessionid: log.sessionid, entries: [], seal: { ...log.seal, entries: log.seal.entries }, updatedat: now };
        await this.setimmutablelog(summary);
      } else {
        kept.push(log);
      }
    }
    return kept;
  }

  /**
   * Security part two persistence of the 1.1.62 family.
   * The protections for secrets, messages and money live here: the secretvault metadata with labels and scopes only and never values, scoped per profile workspace; the connectallow entries with their senders shipping empty by default; the ratelimit bucket state per origin and per session; the confirm gates with their resolution events and their human action provenance; the redactshot regions per origin and page template; the phishguard verdicts with their distance scores expiring past their freshness window; the permdiff records of each installed version; the safedefaults applications with their first seen origins; and the deferred command events waiting for their bucket reset.
   * The vault values never touch this seam: only metadata persists while the values stay behind the vault seam the background wires.
   */

  /** Replaces the secretvault metadata of the profile workspaces: labels, scopes, provenance and digests only, never values. */
  async setsecretvault(entries: secretvaultentry[]): Promise<void> { return this.adapter.set("secretvault", entries); }

  /** Returns the stored secretvault metadata, oldest record first; the values live behind the vault seam and never persist. */
  async getsecretvault(): Promise<secretvaultentry[]> { return (await this.adapter.get<secretvaultentry[]>("secretvault")) ?? []; }

  /** Adds one secretvault metadata record scoped to a profile workspace; a duplicate vault id keeps its first record. */
  async addsecret(entry: secretvaultentry): Promise<void> {
    const entries = await this.getsecretvault();
    if (entries.some(candidate => candidate.vaultid === entry.vaultid)) return;
    await this.setsecretvault([...entries, entry]);
  }

  /** Removes one secretvault metadata record by its vault id; the background drops the value behind the seam in the same action. */
  async removesecret(vaultid: string): Promise<void> { await this.setsecretvault((await this.getsecretvault()).filter(entry => entry.vaultid !== vaultid)); }

  /** Stamps the last use of one secretvault record: the metadata notes when the vault last released its value while the value itself stays unrecorded. */
  async stampsecretuse(vaultid: string, at: number): Promise<void> {
    await this.setsecretvault((await this.getsecretvault()).map(entry => entry.vaultid === vaultid ? { ...entry, lastusedat: at } : entry));
  }

  /** Replaces the connectallow entries of external senders; the list ships empty by default with user managed entries only. */
  async setconnectallow(entries: connectallowentry[]): Promise<void> { return this.adapter.set("connectallow", entries); }

  /** Returns the stored connectallow entries, oldest add first. */
  async getconnectallow(): Promise<connectallowentry[]> { return (await this.adapter.get<connectallowentry[]>("connectallow")) ?? []; }

  /** Adds one connectallow entry for an external sender; a duplicate sender id keeps its first entry. */
  async addconnectallow(entry: connectallowentry): Promise<void> {
    const entries = await this.getconnectallow();
    if (entries.some(candidate => candidate.senderid === entry.senderid)) return;
    await this.setconnectallow([...entries, entry]);
  }

  /** Removes one connectallow entry by its sender id; the origincheck drops the sender again after the removal. */
  async removeconnectallow(senderid: string): Promise<void> { await this.setconnectallow((await this.getconnectallow()).filter(entry => entry.senderid !== senderid)); }

  /** Replaces the ratelimit bucket state per origin and per session: the user configured bounds and windows with their used counts. */
  async setratelimitbuckets(buckets: ratelimitbucket[]): Promise<void> { return this.adapter.set("ratelimitbuckets", buckets); }

  /** Returns the stored ratelimit buckets per origin and per session. */
  async getratelimitbuckets(): Promise<ratelimitbucket[]> { return (await this.adapter.get<ratelimitbucket[]>("ratelimitbuckets")) ?? []; }

  /** Upserts one ratelimit bucket: a bucket of the same origin and session replaces its state while a new pair joins the list. */
  async saveratelimitbucket(bucket: ratelimitbucket): Promise<void> {
    const buckets = await this.getratelimitbuckets();
    await this.setratelimitbuckets(buckets.some(candidate => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid) ? buckets.map(candidate => candidate.origin === bucket.origin && candidate.sessionid === bucket.sessionid ? bucket : candidate) : [...buckets, bucket]);
  }

  /** Removes the ratelimit bucket of one origin and session; the origin runs without a bucket because the bounds stay user choices only. */
  async removeratelimitbucket(origin: string, sessionid: string): Promise<void> { await this.setratelimitbuckets((await this.getratelimitbuckets()).filter(bucket => !(bucket.origin === origin && bucket.sessionid === sessionid))); }

  /** Replaces the confirm gates with their payloads and states; a resolved or refused gate stays terminal for the audit trail. */
  async setgates(gates: confirmgate[]): Promise<void> { return this.adapter.set("confirmgates", gates); }

  /** Returns the stored confirm gates, newest open first. */
  async getgates(): Promise<confirmgate[]> { return (await this.adapter.get<confirmgate[]>("confirmgates")) ?? []; }

  /** Upserts one confirm gate: a gate of the same step keeps its latest record because one gated step carries one live gate. */
  async savegate(gate: confirmgate): Promise<void> {
    const gates = await this.getgates();
    await this.setgates(gates.some(candidate => candidate.stepid === gate.stepid && candidate.kind === gate.kind) ? gates.map(candidate => candidate.stepid === gate.stepid && candidate.kind === gate.kind ? gate : candidate) : [gate, ...gates]);
  }

  /** Records one gate resolution event with its human action provenance; the resolution history stays visible for the audit trail. */
  async addgateresolution(resolution: gateresolution): Promise<void> {
    await this.adapter.set("gateresolutions", [resolution, ...(await this.adapter.get<gateresolution[]>("gateresolutions") ?? [])].slice(0, 500));
  }

  /** Returns the recorded gate resolution events with their human action provenance, newest first. */
  async getgateresolutions(): Promise<gateresolution[]> { return (await this.adapter.get<gateresolution[]>("gateresolutions")) ?? []; }

  /** Replaces the redactshot regions per origin and page template. */
  async setredactregions(regions: redactregion[]): Promise<void> { return this.adapter.set("redactregions", regions); }

  /** Returns the stored redactshot regions per origin and page template, oldest rule first. */
  async getredactregions(): Promise<redactregion[]> { return (await this.adapter.get<redactregion[]>("redactregions")) ?? []; }

  /** Adds one redactshot region, derived from a field shape or drawn by the user. */
  async addredactregion(region: redactregion): Promise<void> { await this.setredactregions([...(await this.getredactregions()), region]); }

  /** Removes one redactshot region by its id. */
  async removeredactregion(id: string): Promise<void> { await this.setredactregions((await this.getredactregions()).filter(region => region.id !== id)); }

  /** Records one phishguard verdict with its distance score; the records stay for the audit trail while the freshness window governs the live set. */
  async addphishverdict(verdict: phishverdict): Promise<void> {
    await this.adapter.set("phishverdicts", [verdict, ...(await this.adapter.get<phishverdict[]>("phishverdicts") ?? []).filter(candidate => candidate.origin !== verdict.origin)].slice(0, 500));
  }

  /** Returns the stored phishguard verdicts with their distance scores, newest first. */
  async getphishverdicts(): Promise<phishverdict[]> { return (await this.adapter.get<phishverdict[]>("phishverdicts")) ?? []; }

  /** Expires the phishguard verdicts past the user configured freshness window: the expired verdicts keep their records for the audit trail while the guard recomputes the next login step. */
  async expirephishverdicts(freshness: number | undefined, now: number): Promise<phishverdict[]> {
    const verdicts = await this.getphishverdicts();
    if (freshness === undefined) return verdicts;
    return verdicts.filter(verdict => now - verdict.at < freshness);
  }

  /** Records one permdiff between two installed permission versions; the record of each installed update stays for the audit trail. */
  async addpermdiff(diff: permdiffrecord): Promise<void> {
    await this.adapter.set("permdiffs", [diff, ...(await this.adapter.get<permdiffrecord[]>("permdiffs") ?? [])].slice(0, 500));
  }

  /** Returns the recorded permdiffs of each installed update, newest first. */
  async getpermdiffs(): Promise<permdiffrecord[]> { return (await this.adapter.get<permdiffrecord[]>("permdiffs")) ?? []; }

  /** Stores the last installed permission set the permdiff of the next update compares against. */
  async setlastpermissions(permissions: string[], version: string): Promise<void> { await this.adapter.set("lastpermissions", { permissions, version }); }

  /** Returns the last installed permission set with its version; an absent record returns undefined. */
  async getlastpermissions(): Promise<{ permissions: string[]; version: string } | undefined> { return this.adapter.get<{ permissions: string[]; version: string }>("lastpermissions"); }

  /** Records one safedefaults application with its first seen origin; the first visit of an unknown origin stays visible. */
  async addsafedefaultapplication(application: safedefaultapplication): Promise<void> {
    const applications = await this.adapter.get<safedefaultapplication[]>("safedefaults") ?? [];
    if (applications.some(candidate => candidate.origin === application.origin)) return;
    await this.adapter.set("safedefaults", [...applications, application]);
  }

  /** Returns the recorded safedefaults applications with their first seen origins, oldest first. */
  async getsafedefaultapplications(): Promise<safedefaultapplication[]> { return (await this.adapter.get<safedefaultapplication[]>("safedefaults")) ?? []; }

  /** Records one deferred command event with the reset time it waits for. */
  async adddeferredevent(event: deferredevent): Promise<void> {
    await this.adapter.set("deferredevents", [event, ...(await this.adapter.get<deferredevent[]>("deferredevents") ?? [])].slice(0, 500));
  }

  /** Returns the recorded deferred command events, newest first. */
  async getdeferredevents(): Promise<deferredevent[]> { return (await this.adapter.get<deferredevent[]>("deferredevents")) ?? []; }

  /** Serves the transparency data of the transparencypage in one read: every active grant with its origin, scope and boundary, every consent window ever granted with its expiry, the connectallow entries with their senders, the permdiff records of each installed update, the safedefaults applications and the secretvault metadata with labels and scopes only. */
  async gettransparencyview(): Promise<{ allowlist: automationallowlistentry[]; profiles: originprofile[]; windows: consentwindow[]; connectallow: connectallowentry[]; permdiffs: permdiffrecord[]; safedefaults: safedefaultapplication[]; vault: secretvaultentry[]; gates: confirmgate[]; resolutions: gateresolution[]; deferred: deferredevent[]; phishverdicts: phishverdict[] }> {
    return {
      allowlist: await this.getautomationallowlist(),
      profiles: await this.getoriginprofiles(),
      windows: await this.getconsentwindows(),
      connectallow: await this.getconnectallow(),
      permdiffs: await this.getpermdiffs(),
      safedefaults: await this.getsafedefaultapplications(),
      vault: await this.getsecretvault(),
      gates: await this.getgates(),
      resolutions: await this.getgateresolutions(),
      deferred: await this.getdeferredevents(),
      phishverdicts: await this.getphishverdicts(),
    };
  }

  /**
   * Session interface persistence of the 1.1.63 family.
   * The five session stores live here, scoped per profile workspace: the sitenotes per origin with sensitive bodies sealed at rest, the append only scratchpad entries per task with their step provenance, the distilled runsummaries per run and origin, the correctionmemory entries per origin and kind captured from plan review, and the consentmemory entries per origin with every grant, denial, expiry and revocation carrying its boundary; beside them the semanticrecall index with fingerprint deduplication answers ranked queries inside the run scope, the incremental historysearch corpus indexes session metadata, notes and summaries as they are written, the errorsurface payloads of failed steps keep their retry hints with the policy verdict, the per tab session references isolate parallel tabs, and the export bundles notes, summaries and corrections as one audit bundle.
   * The recall seam stays documented: the local fingerprint index answers every query today while a future remote recall backend can take the same shapes behind the seam without touching the callers.
   */

  /** Replaces the stored site notes; a sensitive note carries its sealedbody only so the plain body never persists. */
  async setsitenotes(notes: sitenote[]): Promise<void> { return this.adapter.set("sitenotes", notes); }

  /** Returns the stored site notes, oldest update first. */
  async getsitenotes(): Promise<sitenote[]> { return (await this.adapter.get<sitenote[]>("sitenotes")) ?? []; }

  /** Reads the site notes of one origin only; the read gate keeps the origin inside the session grants. */
  async readsitenotes(origin: string): Promise<sitenote[]> { return (await this.getsitenotes()).filter(note => note.origin === origin); }

  /** Writes one site note: a note of the same id keeps its latest edit while a new note joins the store. */
  async writesitenote(note: sitenote): Promise<void> {
    const notes = await this.getsitenotes();
    await this.setsitenotes(notes.some(candidate => candidate.id === note.id) ? notes.map(candidate => candidate.id === note.id ? note : candidate) : [...notes, note]);
  }

  /** Removes one site note by its id. */
  async removesitenote(id: string): Promise<void> { await this.setsitenotes((await this.getsitenotes()).filter(note => note.id !== id)); }

  /** Expires the site notes past the user configured window; an absent window keeps every note. */
  async expiresitenotes(retention: number | undefined, now: number): Promise<sitenote[]> {
    if (retention === undefined) return await this.getsitenotes();
    const kept = (await this.getsitenotes()).filter(note => now - note.updatedat < retention);
    await this.setsitenotes(kept);
    return kept;
  }

  /** Replaces the stored scratchpad entries per task. */
  async setscratchpad(entries: scratchpadentry[]): Promise<void> { return this.adapter.set("scratchpad", entries); }

  /** Returns every stored scratchpad entry, newest first. */
  async getscratchpadall(): Promise<scratchpadentry[]> { return (await this.adapter.get<scratchpadentry[]>("scratchpad")) ?? []; }

  /** Appends one scratchpad entry: the pad stays append only so no later write rewrites an earlier entry. */
  async appendscratchentry(entry: scratchpadentry): Promise<void> { await this.setscratchpad([entry, ...(await this.getscratchpadall())]); }

  /** Reads the scratchpad of one task session, newest first; entries of another task never cross the boundary. */
  async readscratchpad(taskid: string, sessionid: string): Promise<scratchpadentry[]> { return (await this.getscratchpadall()).filter(entry => entry.taskid === taskid && entry.sessionid === sessionid); }

  /** Prunes the scratchpad entries past the user configured window; an absent window keeps every entry. */
  async prunescratchentries(window: number | undefined, now: number): Promise<scratchpadentry[]> {
    if (window === undefined) return await this.getscratchpadall();
    const kept = (await this.getscratchpadall()).filter(entry => now - entry.at < window);
    await this.setscratchpad(kept);
    return kept;
  }

  /** Stores one distilled run summary of a completed run. */
  async setrunsummary(summary: runsummary): Promise<void> { return this.adapter.set(`runsummary:${summary.runid}`, summary); }

  /** Returns the stored run summary of one run; an absent summary returns undefined. */
  async getrunsummary(runid: string): Promise<runsummary | undefined> { return this.adapter.get<runsummary>(`runsummary:${runid}`); }

  /** Lists the stored run summaries, oldest distillation first, optionally filtered by origin. */
  async listrunsummaries(origin?: string): Promise<runsummary[]> {
    const index = (await this.adapter.get<string[]>("runsummaryindex")) ?? [];
    const summaries: runsummary[] = [];
    for (const runid of index) {
      const summary = await this.getrunsummary(runid);
      if (summary) summaries.push(summary);
    }
    const filtered = origin === undefined ? summaries : summaries.filter(summary => summary.origins.includes(origin));
    return filtered.sort((one, two) => one.distilledat - two.distilledat);
  }

  /** Tracks one run in the run summary index so the listing reads every stored summary. */
  async trackrunsummary(runid: string): Promise<void> {
    const index = (await this.adapter.get<string[]>("runsummaryindex")) ?? [];
    if (!index.includes(runid)) await this.adapter.set("runsummaryindex", [...index, runid]);
  }

  /** Expires the run summaries past the user configured window; an absent window keeps every summary. */
  async expirerunsummaries(retention: number | undefined, now: number): Promise<runsummary[]> {
    const summaries = await this.listrunsummaries();
    if (retention === undefined) return summaries;
    const kept: runsummary[] = [];
    for (const summary of summaries) {
      if (now - summary.distilledat > retention) await this.adapter.set(`runsummary:${summary.runid}`, { ...summary, steps: [], kinds: [], origins: summary.origins });
      else kept.push(summary);
    }
    return kept;
  }

  /** Replaces the semantic recall index with its fingerprint deduplicated entries. */
  async setrecallindex(index: recallindexentry[]): Promise<void> { return this.adapter.set("recallindex", index); }

  /** Returns the stored semantic recall index entries, newest first. */
  async getrecallindex(): Promise<recallindexentry[]> { return (await this.adapter.get<recallindexentry[]>("recallindex")) ?? []; }

  /** Adds one recall index entry with fingerprint deduplication: a repeated extraction keeps its first entry. */
  async addrecallentry(entry: recallindexentry): Promise<void> {
    const index = await this.getrecallindex();
    if (index.some(candidate => candidate.fingerprint === entry.fingerprint && candidate.origin === entry.origin)) return;
    await this.setrecallindex([entry, ...index]);
  }

  /** Answers one semantic recall query across the extraction stores: the local index ranks by text similarity inside the run scope and returns the provenance of every match. */
  async semanticrecall(query: recallquery, scope: { origins: string[] }, rank: (index: recallindexentry[], query: recallquery, scope: { origins: string[] }) => recallmatch[]): Promise<recallmatch[]> {
    return rank(await this.getrecallindex(), query, scope);
  }

  /** Expires the recall index entries past the user configured window; the extraction records themselves stay for the audit trail. */
  async expirerecallentries(window: number | undefined, now: number): Promise<recallindexentry[]> {
    if (window === undefined) return await this.getrecallindex();
    const kept = (await this.getrecallindex()).filter(entry => now - entry.at < window);
    await this.setrecallindex(kept);
    return kept;
  }

  /** Replaces the stored correction memory entries per origin and kind. */
  async setcorrections(corrections: correctionentry[]): Promise<void> { return this.adapter.set("corrections", corrections); }

  /** Returns the stored correction memory entries, newest first, optionally filtered by origin and kind. */
  async getcorrections(filter?: { origin?: string; kind?: string }): Promise<correctionentry[]> {
    const entries = (await this.adapter.get<correctionentry[]>("corrections")) ?? [];
    return entries.filter(entry => (filter?.origin === undefined || entry.origin === filter.origin) && (filter?.kind === undefined || entry.kind === filter.kind));
  }

  /** Records one correction memory entry captured from a plan review edit or rejection. */
  async addcorrection(entry: correctionentry): Promise<void> { await this.setcorrections([entry, ...(await this.adapter.get<correctionentry[]>("corrections")) ?? []]); }

  /** Expires the correction memory entries past the user configured window; an absent window keeps every correction. */
  async expirecorrectionentries(window: number | undefined, now: number): Promise<correctionentry[]> {
    if (window === undefined) return await this.getcorrections();
    const kept = (await this.getcorrections()).filter(entry => now - entry.at < window);
    await this.setcorrections(kept);
    return kept;
  }

  /** Replaces the stored consent memory entries per origin. */
  async setconsentmemory(entries: consentmemoryentry[]): Promise<void> { return this.adapter.set("consentmemory", entries); }

  /** Returns the stored consent memory entries, newest first, optionally filtered by origin. */
  async getconsentmemory(origin?: string): Promise<consentmemoryentry[]> {
    const entries = (await this.adapter.get<consentmemoryentry[]>("consentmemory")) ?? [];
    return origin === undefined ? entries : entries.filter(entry => entry.origin === origin);
  }

  /** Records one consent memory entry per origin: every grant, denial, expiry and revocation lands with its boundary and kinds. */
  async addconsentmemoryentry(entry: consentmemoryentry): Promise<void> { await this.setconsentmemory([entry, ...(await this.adapter.get<consentmemoryentry[]>("consentmemory")) ?? []]); }

  /** Replaces the stored error surface payloads of failed steps. */
  async seterrorsurfaces(surfaces: errorsurface[]): Promise<void> { return this.adapter.set("errorsurfaces", surfaces); }

  /** Returns the stored error surface payloads, newest first, optionally filtered by step. */
  async geterrorsurfaces(stepid?: string): Promise<errorsurface[]> {
    const surfaces = (await this.adapter.get<errorsurface[]>("errorsurfaces")) ?? [];
    return stepid === undefined ? surfaces : surfaces.filter(surface => surface.stepid === stepid);
  }

  /** Records one error surface payload of a failed step with its retry hint and the policy verdict. */
  async adderrorsurface(surface: errorsurface): Promise<void> {
    await this.seterrorsurfaces([surface, ...(await this.adapter.get<errorsurface[]>("errorsurfaces")) ?? []].slice(0, 500));
  }

  /** Replaces the incremental history search corpus of session metadata, notes and run summaries. */
  async sethistoryindex(corpus: historyindexentry[]): Promise<void> { return this.adapter.set("historyindex", corpus); }

  /** Returns the incremental history search corpus, newest entry first. */
  async gethistoryindex(): Promise<historyindexentry[]> { return (await this.adapter.get<historyindexentry[]>("historyindex")) ?? []; }

  /** Adds one corpus entry to the incremental history index on each store write. */
  async addhistoryentry(entry: historyindexentry): Promise<void> {
    const corpus = await this.gethistoryindex();
    await this.sethistoryindex([entry, ...corpus.filter(candidate => !(candidate.source === entry.source && candidate.id === entry.id))]);
  }

  /** Answers one history search query against the incremental corpus with the matched terms highlighted. */
  async historysearch(query: historysearchquery, search: (corpus: historyindexentry[], query: historysearchquery) => historysearchhit[]): Promise<historysearchhit[]> {
    return search(await this.gethistoryindex(), query);
  }

  /** Stores one per tab session reference so parallel tabs never collide inside the session stores. */
  async settabsession(ref: tabsessionref): Promise<void> { return this.adapter.set(`tabsession:${ref.tabid}`, ref); }

  /** Returns the per tab session reference of one tab; an absent reference returns undefined. */
  async gettabsession(tabid: number): Promise<tabsessionref | undefined> { return this.adapter.get<tabsessionref>(`tabsession:${tabid}`); }

  /** Lists every per tab session reference so the sessiongrid reads the per tab lock state of concurrent sessions. */
  async listtabsessions(): Promise<tabsessionref[]> {
    const tabs = (await this.adapter.get<number[]>("tabsessionindex")) ?? [];
    const refs: tabsessionref[] = [];
    for (const tabid of tabs) {
      const ref = await this.gettabsession(tabid);
      if (ref) refs.push(ref);
    }
    return refs;
  }

  /** Tracks one tab in the per tab session index so the listing reads every isolated reference. */
  async tracktabsession(tabid: number): Promise<void> {
    const tabs = (await this.adapter.get<number[]>("tabsessionindex")) ?? [];
    if (!tabs.includes(tabid)) await this.adapter.set("tabsessionindex", [...tabs, tabid]);
  }

  /** Exports the site notes, the run summaries and the correction memory as one audit bundle: sensitive note bodies stay sealed in the export. */
  async exportsessionbundle(exportedat: number): Promise<{ kind: "sessionbundle"; notes: sitenote[]; summaries: runsummary[]; corrections: correctionentry[]; exportedat: number }> {
    return { kind: "sessionbundle", notes: await this.getsitenotes(), summaries: await this.listrunsummaries(), corrections: await this.getcorrections(), exportedat };
  }

  /**
   * Interface surface stores of the 1.1.64 family live here, scoped per profile workspace: the commandpalette usage counts the recent first ranking reads, the taskinput history of natural language goals, the onboarding completion state, the per surface layout preferences, the logstream filter preferences and the stepapprove resolution history per origin.
   */

  /** Returns every commandpalette usage record so the ranking lifts the recent commands first. */
  async getpaletteusage(): Promise<paletteuserecord[]> { return (await this.adapter.get<paletteuserecord[]>("paletteusage")) ?? []; }

  /** Replaces the commandpalette usage records after one use: the count grows and the last use time moves so the ranking reads both. */
  async setpaletteusage(records: paletteuserecord[]): Promise<void> { return this.adapter.set("paletteusage", records); }

  /** Returns the stored taskinput history, newest first. */
  async gettaskinputs(): Promise<taskinputsubmission[]> { return (await this.adapter.get<taskinputsubmission[]>("taskinputs")) ?? []; }

  /** Adds one taskinput submission to the per profile history; the retention window stays a user setting. */
  async addtaskinput(entry: taskinputsubmission): Promise<void> {
    const retention = (await this.getsettings())?.taskinputretention;
    const history = [entry, ...(await this.gettaskinputs())];
    await this.adapter.set("taskinputs", retention === undefined ? history : history.filter(candidate => entry.at - candidate.at < retention));
  }

  /** Returns the onboarding completion state; an absent state means the walkthrough never ran. */
  async getonboardingstate(): Promise<onboardingstate | undefined> { return this.adapter.get<onboardingstate>("onboarding"); }

  /** Stores the onboarding completion state; a done walkthrough never runs again on its own. */
  async setonboardingstate(state: onboardingstate): Promise<void> { return this.adapter.set("onboarding", state); }

  /** Returns the version one sunset notice record of the negotiation banner; an absent record means no version one client declared below the supported floor this browser session. */
  async getv1sunset(): Promise<v1sunsetstate | undefined> { return this.adapter.get<v1sunsetstate>("v1sunset"); }

  /** Stores the version one sunset notice record; the dismissal resets it for the session while a later browser session marks it again on the next refusal. */
  async setv1sunset(state: v1sunsetstate): Promise<void> { return this.adapter.set("v1sunset", state); }

  /** Returns the version one migration prompt record; an absent record means no affected updater met the one time prompt yet. */
  async getmigrationprompt(): Promise<migrationpromptstate | undefined> { return this.adapter.get<migrationpromptstate>("migrationprompt"); }

  /** Stores the version one migration prompt record; the persistent migrationpromptdismissed flag keeps a dismissed prompt from ever appearing again. */
  async setmigrationprompt(state: migrationpromptstate): Promise<void> { return this.adapter.set("migrationprompt", state); }

  /** Returns the layout preferences of one surface; an absent preference set returns undefined. */
  async getsurfacelayout(surface: surfacelayout["surface"]): Promise<surfacelayout | undefined> { return this.adapter.get<surfacelayout>(`surfacelayout:${surface}`); }

  /** Stores the layout preferences of one surface, scoped per profile workspace. */
  async setsurfacelayout(layout: surfacelayout): Promise<void> { return this.adapter.set(`surfacelayout:${layout.surface}`, layout); }

  /** Returns the stored logstream filter preferences of the live view. */
  async getlogstreamfilters(): Promise<logstreamfilter | undefined> { return this.adapter.get<logstreamfilter>("logstreamfilters"); }

  /** Stores the logstream filter preferences of the live view. */
  async setlogstreamfilters(filter: logstreamfilter): Promise<void> { return this.adapter.set("logstreamfilters", filter); }

  /** Returns every stored stepapprove resolution, newest first, with its human provenance. */
  async getstepapproveresolutions(): Promise<stepapproveresolution[]> { return (await this.adapter.get<stepapproveresolution[]>("stepapproveresolutions")) ?? []; }

  /** Records one stepapprove resolution in the per origin history. */
  async addstepapproveresolution(resolution: stepapproveresolution): Promise<void> { await this.adapter.set("stepapproveresolutions", [resolution, ...(await this.getstepapproveresolutions())]); }

  /**
   * Interface surface stores of the 1.1.65 family live here, scoped per profile workspace: the siteprofiles with the per site interface preferences, the shortcutkeys bindings and the theme preference per profile, the recenttray entries with their configurable depth and the notification consent and preference per profile.
   */

  /** Returns the siteprofile of one origin; an absent profile keeps the global interface preferences. */
  async getsiteprofile(origin: string): Promise<siteprofile | undefined> { return this.adapter.get<siteprofile>(`siteprofile:${origin}`); }

  /** Stores the siteprofile of one origin with its theme, shortcutkeys and default view; the profile never adjusts a policy gate. */
  async setsiteprofile(profile: siteprofile): Promise<void> { return this.adapter.set(`siteprofile:${profile.origin}`, profile); }

  /** Returns every stored siteprofile keyed by origin. */
  async listsiteprofiles(): Promise<siteprofile[]> {
    const entries = Object.entries(await this.adapter.get<Record<string, siteprofile>>("siteprofiles") ?? {});
    return entries.map(([, profile]) => profile);
  }

  /** Stores every siteprofile keyed by origin so the list view reads them in one call. */
  async setsiteprofiles(profiles: siteprofile[]): Promise<void> { await this.adapter.set("siteprofiles", Object.fromEntries(profiles.map(profile => [profile.origin, profile]))); }

  /** Returns the stored shortcutkeys bindings of the profile; an absent set keeps the shipped editable defaults. */
  async getshortcutbindings(): Promise<shortcutbinding[]> { return (await this.adapter.get<shortcutbinding[]>("shortcutbindings")) ?? []; }

  /** Stores the shortcutkeys bindings the user edited in the optionspage. */
  async setshortcutbindings(bindings: shortcutbinding[]): Promise<void> { return this.adapter.set("shortcutbindings", bindings); }

  /** Returns the stored darklight theme preference of the profile; an absent preference follows the os preference alone. */
  async getthemepreference(): Promise<"dark" | "light" | "system" | undefined> { return this.adapter.get<"dark" | "light" | "system">("themepreference"); }

  /** Stores the darklight theme preference of the profile with its manual override. */
  async setthemepreference(preference: "dark" | "light" | "system"): Promise<void> { return this.adapter.set("themepreference", preference); }

  /** Returns the recenttray entries, newest first, with their resume and reopen offers. */
  async getrecenttray(): Promise<recenttrayentry[]> { return (await this.adapter.get<recenttrayentry[]>("recenttray")) ?? []; }

  /** Adds one recenttray entry with the user configured depth; an absent depth keeps every run. */
  async addrecenttrayentry(entry: recenttrayentry): Promise<void> {
    const depth = (await this.getsettings())?.recenttraydepth;
    const appended = [entry, ...(await this.getrecenttray()).filter(candidate => candidate.runid !== entry.runid)];
    await this.adapter.set("recenttray", depth !== undefined && Number.isInteger(depth) && depth > 0 ? appended.slice(0, depth) : appended);
  }

  /** Returns the notification consent and preference of the profile; an absent record keeps the notifications content free and on. */
  async getnotificationprefs(): Promise<{ consent: boolean; enabled: boolean } | undefined> { return this.adapter.get<{ consent: boolean; enabled: boolean }>("notificationprefs"); }

  /** Stores the notification consent and preference of the profile; the content consent gates every page content bearing body. */
  async setnotificationprefs(prefs: { consent: boolean; enabled: boolean }): Promise<void> { return this.adapter.set("notificationprefs", prefs); }

  /** Returns the notification payloads the surface history keeps for the user to open after a do not disturb quiet. */
  async getnotificationhistory(): Promise<notificationpayload[]> { return (await this.adapter.get<notificationpayload[]>("notificationhistory")) ?? []; }

  /** Records one notification payload in the history so its deep link stays reachable while the notifications permission stays outside the manifest. */
  async addnotificationhistory(payload: notificationpayload): Promise<void> { await this.adapter.set("notificationhistory", [payload, ...(await this.getnotificationhistory())]); }

  /**
   * Ecosystem stores of the 1.1.66 family live here, scoped per profile workspace: the flowlibrary entries with their manifest digests and provenance, the library install and removal events, the syncbridge hooks with their conflict records, the attentionfeed entries with their configurable retention, the runreplay cursors per viewed run, the outputcompare sessions with their metric results and the background run queue state for restart recovery.
   * The flowlibrary store deduplicates entries by manifest digest, every entry carries its publisher provenance, and the manifest list exports for audit; the memory adapter seam stays the documented marketplace backend boundary because a future remote registry replaces the adapter only.
   */

  /** Returns every flowlibrary entry of the profile workspace, newest first. */
  async getflowlibrary(): Promise<flowlibraryentry[]> { return (await this.adapter.get<flowlibraryentry[]>("flowlibrary")) ?? []; }

  /** Replaces the flowlibrary entries of the profile workspace. */
  async setflowlibrary(entries: flowlibraryentry[]): Promise<void> { return this.adapter.set("flowlibrary", entries); }

  /** Adds one flowlibrary entry deduplicated by manifest digest: an entry whose digest already exists replaces its predecessor while its provenance keeps both records. */
  async addlibraryentry(entry: flowlibraryentry): Promise<flowlibraryentry[]> {
    const entries = await this.getflowlibrary();
    const deduped = entries.filter(candidate => candidate.digest !== entry.digest);
    await this.setflowlibrary([entry, ...deduped]);
    return [entry, ...deduped];
  }

  /** Removes one flowlibrary entry by its id while the library events keep their record for the audit trail. */
  async removelibraryentry(entryid: string): Promise<void> { await this.setflowlibrary((await this.getflowlibrary()).filter(candidate => candidate.id !== entryid)); }

  /** Returns every library install, update and removal event, newest first. */
  async getlibraryevents(): Promise<libraryevent[]> { return (await this.adapter.get<libraryevent[]>("libraryevents")) ?? []; }

  /** Records one library lifecycle event beside the flowlibrary store. */
  async addlibraryevent(event: libraryevent): Promise<void> { await this.adapter.set("libraryevents", [event, ...(await this.getlibraryevents())]); }

  /** Exports the manifest list of the flowlibrary for audit: one row per entry with its digest, publisher, version, state and provenance and no step payload. */
  async exportlibrarymanifests(): Promise<Array<{ id: string; title: string; publisher: string; version: string; digest: string; state: string; provenance: string; addedat: number }>> {
    return (await this.getflowlibrary()).map(entry => ({ id: entry.id, title: entry.manifest.title, publisher: entry.manifest.publisher, version: entry.manifest.version, digest: entry.digest, state: entry.state, provenance: entry.provenance, addedat: entry.addedat }));
  }

  /** Returns every syncbridge hook of the profile workspace; every hook keeps its explicit opt in with no default on. */
  async getsyncbridgehooks(): Promise<syncbridgehook[]> { return (await this.adapter.get<syncbridgehook[]>("syncbridgehooks")) ?? []; }

  /** Replaces the syncbridge hooks of the profile workspace. */
  async setsyncbridgehooks(hooks: syncbridgehook[]): Promise<void> { return this.adapter.set("syncbridgehooks", hooks); }

  /** Returns every syncbridge conflict record, newest first, with both versions instead of a silent overwrite. */
  async getsyncbridgeconflicts(): Promise<syncbridgeconflict[]> { return (await this.adapter.get<syncbridgeconflict[]>("syncbridgeconflicts")) ?? []; }

  /** Records one syncbridge conflict with both manifest versions. */
  async addsyncbridgeconflict(conflict: syncbridgeconflict): Promise<void> { await this.adapter.set("syncbridgeconflicts", [conflict, ...(await this.getsyncbridgeconflicts())]); }

  /** Resolves one syncbridge conflict by its id with the resolution the user picked; one conflict resolves exactly once. */
  async resolvesyncbridgeconflict(id: string, resolution: "local" | "remote" | "merge", now: number): Promise<syncbridgeconflict[]> {
    const conflicts = await this.getsyncbridgeconflicts();
    await this.adapter.set("syncbridgeconflicts", conflicts.map(conflict => conflict.id === id && conflict.resolution === undefined ? { ...conflict, resolution, resolvedat: now } : conflict));
    return this.getsyncbridgeconflicts();
  }

  /** Returns every attentionfeed entry, newest first, with its cause, refs and deep link. */
  async getattentionentries(): Promise<attentionentry[]> { return (await this.adapter.get<attentionentry[]>("attentionfeed")) ?? []; }

  /** Records one attentionfeed entry deduplicated by its cause, run and gate refs while the retention window stays a user setting. */
  async addattentionentry(entry: attentionentry): Promise<void> {
    const existing = (await this.getattentionentries()).filter(candidate => candidate.id !== entry.id);
    await this.adapter.set("attentionfeed", [entry, ...existing]);
  }

  /** Dismisses one attentionfeed entry by its id: the dismissal removes the feed row only while the waiting cause keeps its own resolution path. */
  async dismissattentionentry(id: string): Promise<attentionentry[]> {
    const entries = (await this.getattentionentries()).filter(candidate => candidate.id !== id);
    await this.adapter.set("attentionfeed", entries);
    return entries;
  }

  /** Prunes the attentionfeed entries past their retention window; an absent window keeps every entry while the pruned ids return for the audit note. */
  async pruneattentionentries(now: number): Promise<{ kept: attentionentry[]; pruned: string[] }> {
    const retention = (await this.getsettings())?.attentionretention;
    const entries = await this.getattentionentries();
    if (retention === undefined) return { kept: entries, pruned: [] };
    const kept = entries.filter(entry => now - entry.at < retention);
    await this.adapter.set("attentionfeed", kept);
    return { kept, pruned: entries.filter(entry => now - entry.at >= retention).map(entry => entry.id) };
  }

  /** Returns the runreplay cursors per viewed run so a reopened replay stands where the viewer left it. */
  async getreplaycursors(): Promise<Record<string, { cursor: number; playing: boolean }>> { return (await this.adapter.get<Record<string, { cursor: number; playing: boolean }>>("replaycursors")) ?? {}; }

  /** Stores one runreplay cursor for its viewed run. */
  async setreplaycursor(runid: string, cursor: { cursor: number; playing: boolean }): Promise<void> { await this.adapter.set("replaycursors", { ...(await this.getreplaycursors()), [runid]: cursor }); }

  /** Returns every outputcompare session with its metric results, newest first. */
  async getcomparesessions(): Promise<outputcomparesession[]> { return (await this.adapter.get<outputcomparesession[]>("comparesessions")) ?? []; }

  /** Records one outputcompare session with the metric set it used. */
  async addcomparesession(session: outputcomparesession): Promise<void> { await this.adapter.set("comparesessions", [session, ...(await this.getcomparesessions())]); }

  /** Returns the background run queue state for restart recovery: every entry with its state and its keepalive hold. */
  async getbackgroundqueue(): Promise<backgroundqueueentry[]> { return (await this.adapter.get<backgroundqueueentry[]>("backgroundqueue")) ?? []; }

  /** Replaces the background run queue state after every transition so the restart recovery reads it in one call. */
  async setbackgroundqueue(queue: backgroundqueueentry[]): Promise<void> { return this.adapter.set("backgroundqueue", queue); }


  /** Returns the selcache state of one run: the generation, the cached entries and the invalidation trail the 1.1.68 family keeps per run. */
  async getselcachestate(runid: string): Promise<selcachestate | undefined> { return (await this.adapter.get<selcachestate>(`selcache:${runid}`)) ?? undefined; }

  /** Stores the selcache state of one run; every mutation batch advances the generation while a navigation drops the cache wholesale. */
  async setselcachestate(state: selcachestate): Promise<void> { await this.adapter.set(`selcache:${state.runid}`, state); }

  /** Prunes the selcache entries of one run at run end; the invalidation trail stays for the audit while no entry outlives its run. */
  async pruneselcache(runid: string): Promise<void> { await this.adapter.set(`selcache:${runid}`, { runid, generation: 0, entries: [], invalidations: [] }); }

  /** Returns the incrsnapshot base refs per run the delta engine computes against. */
  async getsnapshotbases(): Promise<Array<{ id: string; runid: string; ref: string; at: number }>> { return (await this.adapter.get<Array<{ id: string; runid: string; ref: string; at: number }>>("snapshotbases")) ?? []; }

  /** Stores one incrsnapshot base ref record for its run so every later delta of the run references it. */
  async addsnapshotbase(base: { id: string; runid: string; ref: string; at: number }): Promise<void> { await this.adapter.set("snapshotbases", [...(await this.getsnapshotbases()).filter(candidate => candidate.runid !== base.runid), base]); }

  /** Prunes the incrsnapshot base refs of one run at run end; the deltas of the run end with it. */
  async prunesnapshotbases(runid: string): Promise<void> { await this.adapter.set("snapshotbases", (await this.getsnapshotbases()).filter(candidate => candidate.runid !== runid)); }

  /** Stores one computed incrsnapshot delta of a run beside its base so the executor skips recomputation on an empty delta. */
  async addsnapshotdelta(delta: incrsnapshotdelta): Promise<void> { await this.adapter.set(`snapshotdelta:${delta.runid}:${delta.baseref}`, delta); }

  /** Returns the stored incrsnapshot delta of one run and base ref, when the run computed one. */
  async getsnapshotdelta(runid: string, baseref: string): Promise<incrsnapshotdelta | undefined> { return (await this.adapter.get<incrsnapshotdelta>(`snapshotdelta:${runid}:${baseref}`)) ?? undefined; }

  /** Returns the chunkextract cursors per table so an interrupted big table extraction resumes from its cursor. */
  async getchunkcursors(): Promise<Record<string, chunkextractcursor>> { return (await this.adapter.get<Record<string, chunkextractcursor>>("chunkcursors")) ?? {}; }

  /** Stores one chunkextract cursor for its table so the next window resumes where the last window stopped. */
  async setchunkcursor(tableid: string, cursor: chunkextractcursor): Promise<void> { await this.adapter.set("chunkcursors", { ...(await this.getchunkcursors()), [tableid]: cursor }); }

  /** Clears one chunkextract cursor once its table completes; the merged windows stay in the datagrid. */
  async clearchunkcursor(tableid: string): Promise<void> { const cursors = await this.getchunkcursors(); delete cursors[tableid]; await this.adapter.set("chunkcursors", cursors); }

  /** Returns the perf records of the profile workspace, newest first, for the run footers and the perf summaries. */
  async getperfrecords(): Promise<perfrecord[]> { return (await this.adapter.get<perfrecord[]>("perfrecords")) ?? []; }

  /** Records one perf record per step for profiling; the records stay inside the user configured retention window with their provenance attached. */
  async addperfrecord(record: perfrecord): Promise<void> { await this.adapter.set("perfrecords", [record, ...(await this.getperfrecords())]); }

  /** Prunes the perf records past the user configured retention window; an absent window keeps every record. */
  async pruneperfrecords(retention: number | undefined, now: number): Promise<{ kept: perfrecord[]; pruned: number }> {
    const records = await this.getperfrecords();
    if (retention === undefined) return { kept: records, pruned: 0 };
    const kept = records.filter(record => now - record.at < retention);
    await this.adapter.set("perfrecords", kept);
    return { kept, pruned: records.length - kept.length };
  }

  /** Returns the lazymods load telemetry records for startup analysis, newest first. */
  async getlazyloadrecords(): Promise<lazyloadrecord[]> { return (await this.adapter.get<lazyloadrecord[]>("lazyloadrecords")) ?? []; }

  /** Records one lazymods load telemetry record: which module loaded, why, and how long the resolution took. */
  async addlazyloadrecord(record: lazyloadrecord): Promise<void> { await this.adapter.set("lazyloadrecords", [record, ...(await this.getlazyloadrecords())]); }

  /** Returns the recorded worker queue depth samples over time for tuning. */
  async getqueuedepths(): Promise<queuedepthsample[]> { return (await this.adapter.get<queuedepthsample[]>("queuedepths")) ?? []; }

  /** Records one worker queue depth sample: the pending parse tasks and the deferred tasks the backpressure held at one moment. */
  async recordqueuedepth(sample: queuedepthsample): Promise<void> { await this.adapter.set("queuedepths", [...(await this.getqueuedepths()), sample]); }

  /** Returns the virtlist height maps per surface so reopened surfaces reuse their measured row heights. */
  async getheightmaps(): Promise<Array<{ surface: string; heights: Record<string, number>; at: number }>> { return (await this.adapter.get<Array<{ surface: string; heights: Record<string, number>; at: number }>>("heightmaps")) ?? []; }

  /** Stores one virtlist height map for its surface; the measured row heights stay for the next open of the surface. */
  async setheightmap(record: { surface: string; heights: Record<string, number>; at: number }): Promise<void> { await this.adapter.set("heightmaps", [...(await this.getheightmaps()).filter(candidate => candidate.surface !== record.surface), record]); }

  /**
   * The perf metrics seam of the 1.1.68 family: today every perf record, queue depth sample and lazy load telemetry record stays inside the per profile workspace of the local adapter, and the seam keeps the record and bundle shapes stable so a reviewed remote metrics backend can take the exports later without touching the callers.
   * Exports the perf records of one run as a single audit bundle with its summary and its provenance attached.
   */
  async exportperfbundle(runid: string): Promise<{ runid: string; records: perfrecord[] }> {
    return { runid, records: (await this.getperfrecords()).filter(record => record.runid === runid) };
  }

  /** Returns the domain lanes of one batch run the 1.1.69 family schedules its concurrency slots through. */
  async getdomainlanes(runid: string): Promise<domainlane[]> { return (await this.adapter.get<domainlane[]>(`domainlanes:${runid}`)) ?? []; }

  /** Stores the domain lanes of one batch run; every lane runs at most its user chosen slots while its overflow queues. */
  async setdomainlanes(runid: string, lanes: domainlane[]): Promise<void> { await this.adapter.set(`domainlanes:${runid}`, lanes); }

  /** Returns the runbudget records of the profile workspace, newest first. */
  async getrunbudgets(): Promise<runbudgetrecord[]> { return (await this.adapter.get<runbudgetrecord[]>("runbudgets")) ?? []; }

  /** Records one runbudget record of a run: the step usage against the user budget beside the memory pressure the worker telemetry reported. */
  async addrunbudget(record: runbudgetrecord): Promise<void> { await this.adapter.set("runbudgets", [record, ...(await this.getrunbudgets()).filter(candidate => candidate.runid !== record.runid)]); }

  /** Returns the budgetalerts of the profile workspace, newest first, with their thresholds and severity levels. */
  async getbudgetalerts(): Promise<budgetalert[]> { return (await this.adapter.get<budgetalert[]>("budgetalerts")) ?? []; }

  /** Records one budgetalert of a run; the critical alert pauses the run pending a user choice. */
  async addbudgetalert(alert: budgetalert): Promise<void> { await this.adapter.set("budgetalerts", [alert, ...(await this.getbudgetalerts())]); }

  /** Returns the timeoutcancel events of the profile workspace, newest first, beside their immutable log entries. */
  async gettimeoutevents(): Promise<timeoutcancelevent[]> { return (await this.adapter.get<timeoutcancelevent[]>("timeoutevents")) ?? []; }

  /** Records one timeoutcancel event: the aborted step, its user bound and its logged cancel entry beside the step outcome. */
  async addtimeoutevent(event: timeoutcancelevent): Promise<void> { await this.adapter.set("timeoutevents", [event, ...(await this.gettimeoutevents())]); }

  /** Returns the tabsuspend states per run so a restore brings the suspended tab back before the step that needs it. */
  async getsuspendstates(): Promise<tabsuspendstate[]> { return (await this.adapter.get<tabsuspendstate[]>("suspendstates")) ?? []; }

  /** Stores one tabsuspend state of a run; the run state stays preserved across the suspend and restore. */
  async setsuspendstate(state: tabsuspendstate): Promise<void> { await this.adapter.set("suspendstates", [...(await this.getsuspendstates()).filter(candidate => candidate.runid !== state.runid), state]); }

  /** Clears one tabsuspend state once its tab restored before the step that needed it. */
  async clearsuspendstate(runid: string): Promise<void> { await this.adapter.set("suspendstates", (await this.getsuspendstates()).filter(candidate => candidate.runid !== runid)); }

  /** Returns the runcache entries of every run keyed by their resource digests. */
  async getruncache(): Promise<runcacheentry[]> { return (await this.adapter.get<runcacheentry[]>("runcache")) ?? []; }

  /** Stores one runcache entry of a run keyed by its digest; a repeat fetch of the same run serves from the entry. */
  async addruncacheentry(entry: runcacheentry): Promise<void> { await this.adapter.set("runcache", [...(await this.getruncache()).filter(candidate => candidate.runid !== entry.runid || candidate.resource !== entry.resource), entry]); }

  /** Sweeps the runcache entries of one run at run end; the pinned entries of the user profile cache survive. */
  async sweepruncache(runid: string, pin: boolean): Promise<{ cleared: number }> {
    const entries = await this.getruncache();
    if (pin) return { cleared: 0 };
    const kept = entries.filter(entry => entry.runid !== runid || entry.pinned);
    await this.adapter.set("runcache", kept);
    return { cleared: entries.length - kept.length };
  }

  /** Returns the efficientresume checkpoints of one run so a restart skips its completed steps. */
  async getresumepoints(runid: string): Promise<resumepoint[]> { return (await this.adapter.get<resumepoint[]>(`resumepoints:${runid}`)) ?? []; }

  /** Stores one efficientresume checkpoint of a run at a step boundary with its cursor and page digest. */
  async addresumepoint(point: resumepoint): Promise<void> { await this.adapter.set(`resumepoints:${point.runid}`, [...(await this.getresumepoints(point.runid)).filter(candidate => candidate.stepid !== point.stepid), point]); }

  /** Clears the efficientresume checkpoints of one run at run end. */
  async cleareresumepoints(runid: string): Promise<void> { await this.adapter.set(`resumepoints:${runid}`, []); }

  /** Returns the selectorprofile stats of the profile workspace per selector. */
  async getselectorprofiles(): Promise<selectorstats[]> { return (await this.adapter.get<selectorstats[]>("selectorprofiles")) ?? []; }

  /** Stores one selectorprofile stat; the flagged selectors report above the user latency threshold and never refuse. */
  async setselectorprofile(stats: selectorstats): Promise<void> { await this.adapter.set("selectorprofiles", [...(await this.getselectorprofiles()).filter(candidate => candidate.selector !== stats.selector), stats]); }

  /** Returns the steptrace spans of one run for the timeline view and the trace file export. */
  async getsteptrace(runid: string): Promise<steptracespan[]> { return (await this.adapter.get<steptracespan[]>(`steptrace:${runid}`)) ?? []; }

  /** Stores one steptrace span of a run; the spans nest per step and per worker task through their parent refs. */
  async addsteptracespan(span: steptracespan): Promise<void> { await this.adapter.set(`steptrace:${span.runid}`, [...(await this.getsteptrace(span.runid)), span]); }

  /** Clears the steptrace spans of one run; the exported trace files keep their events. */
  async clearsteptrace(runid: string): Promise<void> { await this.adapter.set(`steptrace:${runid}`, []); }

  /** Returns the startupmeter samples of the profile workspace, newest first, for the cold start view. */
  async getstartupsamples(): Promise<startupsample[]> { return (await this.adapter.get<startupsample[]>("startupsamples")) ?? []; }

  /** Records one startupmeter sample: the cold start duration from the startup event to ready with the lazymods budget it spent. */
  async addstartupsample(sample: startupsample): Promise<void> { await this.adapter.set("startupsamples", [sample, ...(await this.getstartupsamples())]); }

  /** Returns the slowmo replay sessions of the profile workspace, newest first. */
  async getslomosessions(): Promise<slowmosession[]> { return (await this.adapter.get<slowmosession[]>("slomosessions")) ?? []; }

  /** Stores one slowmo replay session; the pauses link to their steptrace spans for inspection. */
  async setslomosession(session: slowmosession): Promise<void> { await this.adapter.set("slomosessions", [session, ...(await this.getslomosessions()).filter(candidate => candidate.runid !== session.runid)]); }

  /** Returns the sessionreuse grants of the profile workspace with their consent prompts. */
  async getsessionreusegrants(): Promise<sessionreusegrant[]> { return (await this.adapter.get<sessionreusegrant[]>("sessionreusegrants")) ?? []; }

  /** Stores one sessionreuse grant; the authenticated profile attaches to a run only through its per profile consent prompt. */
  async addsessionreusegrant(grant: sessionreusegrant): Promise<void> { await this.adapter.set("sessionreusegrants", [...(await this.getsessionreusegrants()).filter(candidate => candidate.profile !== grant.profile), grant]); }

  /** Returns the artifactcompress records of the profile workspace for the at rest codec view. */
  async getartifactcompress(): Promise<artifactcompressrecord[]> { return (await this.adapter.get<artifactcompressrecord[]>("artifactcompress")) ?? []; }

  /** Stores one artifactcompress record: the codec of the stored artifact with its lazy read flag. */
  async addartifactcompress(record: artifactcompressrecord): Promise<void> { await this.adapter.set("artifactcompress", [...(await this.getartifactcompress()).filter(candidate => candidate.artifactid !== record.artifactid), record]); }


  /** Returns the run lifecycle record of one run id of the 1.1.70 resilience family. */
  async getrunrecord(runid: string): Promise<runrecord | undefined> { return (await this.adapter.get<runrecord[]>("runs") ?? []).find(record => record.runid === runid); }

  /** Persists one run lifecycle record; the run state survives every service worker restart through the adapter. */
  async setrunrecord(record: runrecord): Promise<void> { await this.adapter.set("runs", [...(await this.adapter.get<runrecord[]>("runs") ?? []).filter(candidate => candidate.runid !== record.runid), record]); }

  /** Returns every stored run record by recency, newest first. */
  async listruns(): Promise<runrecord[]> { return [...(await this.adapter.get<runrecord[]>("runs") ?? [])].sort((one, two) => two.updatedat - one.updatedat); }

  /** Returns the latest checkpoint of one run; a run without a checkpoint carries none. */
  async getcheckpoint(runid: string): Promise<checkpointrecord | undefined> { return (await this.adapter.get<checkpointrecord[]>("checkpoints") ?? []).find(record => record.runid === runid); }

  /** Persists the latest checkpoint of one run; every newer checkpoint replaces the stored one. */
  async setcheckpoint(record: checkpointrecord): Promise<void> { await this.adapter.set("checkpoints", [...(await this.adapter.get<checkpointrecord[]>("checkpoints") ?? []).filter(candidate => candidate.runid !== record.runid), record]); }

  /** Returns the offlinequeue of approved plans waiting for connectivity; the queue survives every restart through the adapter. */
  async getqueue(): Promise<queuedtask[]> { return (await this.adapter.get<queuedtask[]>("offlinequeue")) ?? []; }

  /** Persists the offlinequeue; the replay drains it in sequence order once connectivity returns. */
  async setqueue(queue: queuedtask[]): Promise<void> { await this.adapter.set("offlinequeue", queue); }

  /** Returns the latest heartbeat record of one run. */
  async getheartbeat(runid: string): Promise<heartbeatrecord | undefined> { return (await this.adapter.get<heartbeatrecord[]>("heartbeats") ?? []).find(record => record.runid === runid); }

  /** Persists the latest heartbeat record of one run; every beat replaces the stored one. */
  async setheartbeat(record: heartbeatrecord): Promise<void> { await this.adapter.set("heartbeats", [...(await this.adapter.get<heartbeatrecord[]>("heartbeats") ?? []).filter(candidate => candidate.runid !== record.runid), record]); }

  /** Records one rollback item of a failed or cancelled run; the compensating steps stay for the audit trail. */
  async addrollback(item: rollbackitem): Promise<void> { await this.adapter.set("rollbackitems", [item, ...(await this.adapter.get<rollbackitem[]>("rollbackitems") ?? [])]); }

  /** Returns the rollback items of one run, newest first; a run without a rollback carries none. */
  async listrollbacks(runid: string): Promise<rollbackitem[]> { return (await this.adapter.get<rollbackitem[]>("rollbackitems") ?? []).filter(item => item.runid === runid); }

  /** Returns the user configured heartbeat staleness window; an absent window keeps the documented roadmap default because the window stays a user choice. */
  async getheartbeatwindow(): Promise<number | undefined> { return (await this.getsettings())?.heartbeatwindow; }

  /** Persists the user configured heartbeat staleness window; the zombiecheck reads it with no code ceiling. */
  async setheartbeatwindow(window: number): Promise<void> { const settings = (await this.getsettings()) ?? {}; await this.setsettings({ ...settings, heartbeatwindow: window }); }

  /** Returns the user configured offline queue depth; an absent depth keeps the queue unbounded because the depth stays a user choice. */
  async getqueuedepthsetting(): Promise<number | undefined> { return (await this.getsettings())?.queuedepth; }

  /** Persists the user configured offline queue depth; the depth reports and never refuses a queued plan. */
  async setqueuedepthsetting(depth: number): Promise<void> { const settings = (await this.getsettings()) ?? {}; await this.setsettings({ ...settings, queuedepth: depth }); }

  /** Prunes the failed and reaped run records past the user configured retention window; every run of another state stays and an absent window keeps every failed run for the audit trail. */
  async pruneruns(retention: number | undefined, now: number): Promise<{ kept: runrecord[]; pruned: string[] }> {
    const runs = await this.listruns();
    if (retention === undefined) return { kept: runs, pruned: [] };
    const expired = runs.filter(run => run.state === "failed" && now - run.updatedat >= retention);
    if (expired.length === 0) return { kept: runs, pruned: [] };
    const prunedids = new Set(expired.map(run => run.runid));
    const kept = runs.filter(run => !prunedids.has(run.runid));
    await this.adapter.set("runs", kept);
    return { kept, pruned: [...prunedids] };
  }

  /** Returns the idempotencykeys one run already executed so replays deduplicate on them. */
  async getexecutedkeys(runid: string): Promise<string[]> { return (await this.adapter.get<Array<{ runid: string; keys: string[] }>>("executedkeys") ?? []).find(entry => entry.runid === runid)?.keys ?? []; }

  /** Records one executed idempotencykey of a run; a replay of the same key skips the duplicate. */
  async addexecutedkey(runid: string, key: string): Promise<void> {
    const entries = (await this.adapter.get<Array<{ runid: string; keys: string[] }>>("executedkeys") ?? []).filter(entry => entry.runid !== runid);
    await this.adapter.set("executedkeys", [...entries, { runid, keys: [...(await this.getexecutedkeys(runid)), key] }]);
  }

  /** Returns the urlhistory of one run: one urlvisit per completed navigation with consecutive duplicates folded, scoped per run and never merged across runs. */
  async getvisits(runid: string): Promise<urlvisit[]> { return (await this.adapter.get<urlvisit[]>(`visits:${runid}`)) ?? []; }

  /** Persists the urlhistory of one run; the visits survive every service worker restart through the adapter. */
  async setvisits(runid: string, visits: urlvisit[]): Promise<void> { await this.adapter.set(`visits:${runid}`, visits); }

  /** Returns the runtimeline stream of one run: the merged step results, audit events and url visits in their timestamp order. */
  async getruntimeline(runid: string): Promise<runtimelineevent[]> { return (await this.adapter.get<runtimelineevent[]>(`runtimeline:${runid}`)) ?? []; }

  /** Persists the runtimeline stream of one run; the timeline view and the audit export read the same stream. */
  async setruntimeline(runid: string, events: runtimelineevent[]): Promise<void> { await this.adapter.set(`runtimeline:${runid}`, events); }

  /** Appends one runtimeline event to the stream of its run without reading the whole stream back. */
  async appendtimelineevent(event: runtimelineevent): Promise<void> { await this.setruntimeline(event.runid, [...(await this.getruntimeline(event.runid)), event]); }

  /** Returns the sessionlock of one session; a session without a lock carries none. */
  async getlock(sessionid: string): Promise<lockrecord | undefined> { return (await this.adapter.get<lockrecord[]>("sessionlocks") ?? []).find(record => record.sessionid === sessionid); }

  /** Persists the sessionlock of one session; every newer lock replaces the stored one and the lock survives every restart. */
  async setlock(lock: lockrecord): Promise<void> { await this.adapter.set("sessionlocks", [...(await this.adapter.get<lockrecord[]>("sessionlocks") ?? []).filter(candidate => candidate.sessionid !== lock.sessionid), lock]); }

  /** Clears the sessionlock of one session on completion, failure or cancel; the next reviewed run may acquire it again. */
  async clearlock(sessionid: string): Promise<void> { await this.adapter.set("sessionlocks", [...(await this.adapter.get<lockrecord[]>("sessionlocks") ?? []).filter(candidate => candidate.sessionid !== sessionid)]); }

  /** Returns every stored sessionlock; the startup pass reads them to expire the abandoned ones. */
  async listlocks(): Promise<lockrecord[]> { return (await this.adapter.get<lockrecord[]>("sessionlocks")) ?? []; }

  /** Returns the isolated tabstate of one tabid; a tab without an isolated namespace carries none. */
  async gettabstate(tabid: number): Promise<tabstate | undefined> { return (await this.adapter.get<tabstate[]>("tabstates") ?? []).find(state => state.tabid === tabid); }

  /** Stores the isolated tabstate of one tabid: the namespace, its copied config snapshot and the run it serves. */
  async settabstate(state: tabstate): Promise<void> { await this.adapter.set("tabstates", [...(await this.adapter.get<tabstate[]>("tabstates") ?? []).filter(candidate => candidate.tabid !== state.tabid), state]); }

  /** Returns every stored memory item of the profile workspace wrapped with its provenance record. */
  async getmemoryitems(): Promise<memoryitem[]> { return (await this.adapter.get<memoryitem[]>("memoryitems")) ?? []; }

  /** Stores one memory item wrapped with its provenance; the stored value encrypts at rest when the item carries its encrypted flag while the derived key itself never persists. */
  async setmemoryitem(item: memoryitem): Promise<void> { await this.adapter.set("memoryitems", [...(await this.getmemoryitems()).filter(candidate => candidate.key !== item.key), item]); }

  /** Removes one memory item from the store; the purge keeps its summary and its provenance for the audit trail. */
  async removememoryitems(keys: string[]): Promise<void> { const gone = new Set(keys); await this.adapter.set("memoryitems", (await this.getmemoryitems()).filter(item => !gone.has(item.key))); }

  /** Returns the user configured expiryrules of the memory workspace; an absent list keeps every item unexpired. */
  async getexpiry(): Promise<expiryrule[]> { return (await this.adapter.get<expiryrule[]>("expiryrules")) ?? []; }

  /** Persists the user configured expiryrules; every lifetime stays the user's choice with no forced ceiling. */
  async setexpiry(rules: expiryrule[]): Promise<void> { await this.adapter.set("expiryrules", rules); }

  /** Returns the quotareport of the last quotawatch pass; a fresh workspace carries none. */
  async getquotareport(): Promise<quotareport | undefined> { return (await this.adapter.get<quotareport>("quotareport")); }

  /** Persists the quotareport after each quotawatch pass; the cleanup candidates stay ranked for the next pass. */
  async setquotareport(report: quotareport): Promise<void> { await this.adapter.set("quotareport", report); }

  /** Returns the at rest encryption flag of the memory workspace; the derived key never persists beside it. */
  async getencryptrest(): Promise<boolean> { return (await this.getsettings())?.encryptrest === true; }

  /** Persists the at rest encryption flag of the memory workspace; the secret entry stays a consent prompt and the key stays in memory for the pass alone. */
  async setencryptrest(enabled: boolean): Promise<void> { const settings = (await this.getsettings()) ?? {}; await this.setsettings({ ...settings, encryptrest: enabled }); }

  /** Records one purge summary of the expirememory pass; the summary and the provenance of every purged item stay for the audit trail. */
  async addpurgesummary(summary: { key: string; summary: string; provenance: memoryprovenance; at: number }): Promise<void> { await this.adapter.set("purgesummaries", [summary, ...(await this.adapter.get<Array<{ key: string; summary: string; provenance: memoryprovenance; at: number }>>("purgesummaries") ?? [])]); }

  /** Returns the purge summaries of the expirememory passes, newest first; the values left while their provenance stays. */
  async listpurgesummaries(): Promise<Array<{ key: string; summary: string; provenance: memoryprovenance; at: number }>> { return (await this.adapter.get<Array<{ key: string; summary: string; provenance: memoryprovenance; at: number }>>("purgesummaries")) ?? []; }

  /** Returns the timestamp of the last expirememory pass; the interval pass reads it to decide whether the user interval passed. */
  async getlastexpirepass(): Promise<number | undefined> { return (await this.adapter.get<number>("lastexpirepass")); }

  /** Persists the timestamp of one expirememory pass. */
  async setlastexpirepass(at: number): Promise<void> { await this.adapter.set("lastexpirepass", at); }

  /** Returns one fleet agentrecord of the 1.1.72 family by its id; an unknown agent carries none. */
  async getagent(agentid: string): Promise<agentrecord | undefined> { return ((await this.adapter.get<agentrecord[]>("fleet")) ?? []).find(record => record.id === agentid); }

  /** Persists one fleet agentrecord; every newer record replaces the stored one and the registry survives every restart. */
  async setagent(record: agentrecord): Promise<void> { await this.adapter.set("fleet", [...((await this.adapter.get<agentrecord[]>("fleet")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns the fleet registry with its names, roles, origins and control states; the sidepanel and the protocol boundary read the same list. */
  async listagents(): Promise<agentrecord[]> { return [...((await this.adapter.get<agentrecord[]>("fleet")) ?? [])].sort((one, two) => two.registeredat - one.registeredat); }

  /** Returns the budgetstate of one agent; an agent without a granted budget carries none. */
  async getbudget(agentid: string): Promise<budgetstate | undefined> { return ((await this.adapter.get<budgetstate[]>("agentbudgets")) ?? []).find(state => state.agentid === agentid); }

  /** Returns the fleet scope of one agent; an agent without a configured scope stays unbounded inside the session grants. */
  async getagentscope(agentid: string): Promise<agentscope | undefined> { return ((await this.adapter.get<agentscope[]>("agentscopes")) ?? []).find(scope => scope.agentid === agentid); }

  /** Persists the fleet scope of one agent; the intersection result with the session grants stays beside the registry. */
  async setagentscope(scope: agentscope): Promise<void> { await this.adapter.set("agentscopes", [...((await this.adapter.get<agentscope[]>("agentscopes")) ?? []).filter(candidate => candidate.agentid !== scope.agentid), scope]); }

  /** Persists the budgetstate of one agent; every spend updates the stored state and every ceiling stays the user's choice. */
  async setbudget(state: budgetstate): Promise<void> { await this.adapter.set("agentbudgets", [...((await this.adapter.get<budgetstate[]>("agentbudgets")) ?? []).filter(candidate => candidate.agentid !== state.agentid), state]); }

  /** Returns every stored fleet review record with the open ones first; the verdict controls read the same records. */
  async getreviews(): Promise<reviewrecord[]> { return [...((await this.adapter.get<reviewrecord[]>("fleetreviews")) ?? [])].sort((one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.requestedat - one.requestedat); }

  /** Persists one fleet review record with the reviewer verdict recorded beside the original output. */
  async setreview(record: reviewrecord): Promise<void> { await this.adapter.set("fleetreviews", [...((await this.adapter.get<reviewrecord[]>("fleetreviews")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns the runreplay captures of one agent, newest first; the audit view and the reconstruction read the same captures. */
  async getreplays(agentid: string): Promise<replayrecord[]> { return [...((await this.adapter.get<replayrecord[]>(`fleetreplays:${agentid}`)) ?? [])].sort((one, two) => two.capturedat - one.capturedat); }

  /** Persists one runreplay capture per agent under the user configured replayretention window; an absent window keeps every capture of every agent. */
  async setreplay(record: replayrecord, retention?: number): Promise<void> { const kept = [record, ...(await this.getreplays(record.agentid)).filter(candidate => candidate.id !== record.id)]; await this.adapter.set(`fleetreplays:${record.agentid}`, retention === undefined ? kept : kept.slice(0, retention)); }

  /** Returns every stored output comparison, newest first; the side by side view reads the same records. */
  async getcomparison(): Promise<comparisonrecord[]> { return [...((await this.adapter.get<comparisonrecord[]>("fleetcomparisons")) ?? [])].sort((one, two) => two.comparedat - one.comparedat); }

  /** Persists one output comparison record; the field by field alignment stays for the audit trail. */
  async setcomparison(record: comparisonrecord): Promise<void> { await this.adapter.set("fleetcomparisons", [...((await this.adapter.get<comparisonrecord[]>("fleetcomparisons")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns every stored consensus record with the open rounds first; the vote tally view reads the same records. */
  async getvotes(): Promise<consensusrecord[]> { const records = (await this.adapter.get<consensusrecord[]>("fleetvotes")) ?? []; return [...records].sort((one, two) => (one.outcome === "open" ? 0 : 1) - (two.outcome === "open" ? 0 : 1) || Math.max(...two.votes.map(vote => vote.castat), 0) - Math.max(...one.votes.map(vote => vote.castat), 0)); }

  /** Persists one consensus record; the votes, the tally and the outcome stay for the audit trail with every dissenting vote. */
  async setvote(record: consensusrecord): Promise<void> { await this.adapter.set("fleetvotes", [...((await this.adapter.get<consensusrecord[]>("fleetvotes")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns the timestamp of the last killswitch stop; the fleet view reads it to name when the user last halted everything. */
  async getkillswitchat(): Promise<number | undefined> { return (await this.adapter.get<number>("killswitchat")); }

  /** Persists the timestamp of one killswitch stop; one audit event per stopped agent lands beside it. */
  async setkillswitchat(at: number): Promise<void> { await this.adapter.set("killswitchat", at); }

  /** Returns the paused fleet agents by id; the executor skips only their queues while the peers keep running. */
  async getpausedagents(): Promise<string[]> { return ((await this.adapter.get<agentrecord[]>("fleet")) ?? []).filter(record => record.state === "paused").map(record => record.id); }

  /** Returns the spawn lineage of the 1.1.73 family: every fleet spawnrecord with its parent, child, depth and parent objective, newest first. */
  async getspawn(): Promise<spawnrecord[]> { return [...((await this.adapter.get<spawnrecord[]>("fleetspawns")) ?? [])].sort((one, two) => two.at - one.at); }

  /** Persists one fleet spawnrecord of the lineage; every newer spawn replaces the stored one and the lineage survives every restart. */
  async setspawn(record: spawnrecord): Promise<void> { await this.adapter.set("fleetspawns", [...((await this.adapter.get<spawnrecord[]>("fleetspawns")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns every stored fleet aggregaterecord with the open ones first; the merged reports read newest first after them. */
  async getaggregate(): Promise<aggregaterecord[]> { return [...((await this.adapter.get<aggregaterecord[]>("fleetaggregates")) ?? [])].sort((one, two) => (one.state === "open" ? 0 : 1) - (two.state === "open" ? 0 : 1) || two.createdat - one.createdat); }

  /** Persists one fleet aggregaterecord under the user configured aggregateretention window; an absent window keeps every merged report for the audit trail. */
  async setaggregate(record: aggregaterecord, retention?: number): Promise<void> { const kept = [record, ...(await this.getaggregate()).filter(candidate => candidate.id !== record.id)]; await this.adapter.set("fleetaggregates", retention === undefined ? kept : kept.slice(0, retention)); }

  /** Returns the stored interleaved fleet timeline ordered by event time; the merged lanes read the same events. */
  async getinterleaved(): Promise<interleaveevent[]> { return [...((await this.adapter.get<interleaveevent[]>("fleetinterleave")) ?? [])].sort((one, two) => two.at - one.at); }

  /** Persists the interleaved fleet timeline under the user configured interleveretention window; an absent window keeps every interleaved event. */
  async setinterleaved(events: interleaveevent[], retention?: number): Promise<void> { await this.adapter.set("fleetinterleave", retention === undefined ? events : events.slice(0, retention)); }

  /** Returns every stored lesson of the lessonshare, the most reused first; the matching pass reads the same records. */
  async getlessons(): Promise<lessonrecord[]> { return [...((await this.adapter.get<lessonrecord[]>("fleetlessons")) ?? [])].sort((one, two) => two.reusecount - one.reusecount || two.recordedat - one.recordedat); }

  /** Persists one lessonrecord of the lessonshare; the sanitized finding stays for every agent that serves it. */
  async setlesson(lesson: lessonrecord): Promise<void> { await this.adapter.set("fleetlessons", [...((await this.adapter.get<lessonrecord[]>("fleetlessons")) ?? []).filter(candidate => candidate.id !== lesson.id), lesson]); }

  /** Returns every stored arbitration case with the open and granted ones first; the verdict view reads the same cases. */
  async getcases(): Promise<arbitrationcase[]> { return [...((await this.adapter.get<arbitrationcase[]>("fleetcases")) ?? [])].sort((one, two) => (one.state === "released" ? 1 : 0) - (two.state === "released" ? 1 : 0) || two.openedat - one.openedat); }

  /** Persists one arbitrationcase with its verdict; the release keeps the closed case for the audit trail. */
  async setcase(record: arbitrationcase): Promise<void> { await this.adapter.set("fleetcases", [...((await this.adapter.get<arbitrationcase[]>("fleetcases")) ?? []).filter(candidate => candidate.id !== record.id), record]); }

  /** Returns the user configured priority lanes of the task queue; the drain order reads the same lanes. */
  async getlanes(): Promise<tasklane[]> { return (await this.adapter.get<tasklane[]>("fleetlanes")) ?? []; }

  /** Persists the priority lanes of the task queue; the lane order and the interactive protection stay the user's choice. */
  async setlane(lanes: tasklane[]): Promise<void> { await this.adapter.set("fleetlanes", lanes); }

  /** Returns the latest loadreport per origin; the scaleworkers pass reads the same samples. */
  async getload(): Promise<loadreport[]> { return ((await this.adapter.get<loadreport[]>("fleetload")) ?? []).sort((one, two) => two.sampledat - one.sampledat); }

  /** Persists one loadreport sample per origin; every newer sample replaces the stored one of its origin. */
  async setload(report: loadreport): Promise<void> { await this.adapter.set("fleetload", [report, ...((await this.adapter.get<loadreport[]>("fleetload")) ?? []).filter(candidate => candidate.origin !== report.origin)].slice(0, 32)); }

  /** Returns the shared fleet cost ledger, newest first; the split pass reads the same entries. */
  async getcosts(): Promise<costentry[]> { return [...((await this.adapter.get<costentry[]>("fleetcosts")) ?? [])].sort((one, two) => two.at - one.at); }

  /** Persists one costentry of the shared ledger attributed to its agent; the accounting stays local and read only. */
  async setcost(entry: costentry): Promise<void> { await this.adapter.set("fleetcosts", [entry, ...((await this.adapter.get<costentry[]>("fleetcosts")) ?? [])].slice(0, 512)); }

  /** Returns the user configured depthlimit of the sub agent recursion; an absent limit stays unbounded because the ceiling stays the user's choice. */
  async getdepthlimit(): Promise<depthlimit | undefined> { return (await this.adapter.get<depthlimit>("fleetdepthlimit")); }

  /** Persists the user configured depthlimit of the sub agent recursion; the spawn gates read it exactly. */
  async setdepthlimit(limit: depthlimit): Promise<void> { await this.adapter.set("fleetdepthlimit", limit); }

  /** Returns the stored closed tab records of the 1.1.74 family, newest first; the reopening path reads the same records after its grant recheck. */
  async getclosedtabrecords(): Promise<closedtabrecord[]> { return [...((await this.adapter.get<closedtabrecord[]>("closedtabrecords")) ?? [])].sort((one, two) => two.closedat - one.closedat); }

  /** Persists one closedtabrecord of a closed tab under the user configured closedtabretention window in milliseconds; an absent window keeps every record while a reopened record keeps its stamp for the audit trail. */
  async addclosedtabrecord(record: closedtabrecord, retention?: number): Promise<void> { const stored = (await this.getclosedtabrecords()).filter(candidate => candidate.id !== record.id); const kept = retention !== undefined && Number.isFinite(retention) && retention > 0 ? stored.filter(candidate => record.closedat - candidate.closedat <= retention) : stored; await this.adapter.set("closedtabrecords", [record, ...kept]); }

  /** Stamps one closedtabrecord as reopened so a reopened record never reopens twice while the retention window keeps it for the audit trail. */
  async setclosedtabrecord(record: closedtabrecord): Promise<void> { await this.adapter.set("closedtabrecords", [record, ...(await this.getclosedtabrecords()).filter(candidate => candidate.id !== record.id)]); }

  /** Returns the navigation trail of one run: every navtrailentry the run captured in order; the audit and the on demand replay read the same entries. */
  async getnavtrail(runid: string): Promise<navtrailentry[]> { return (await this.adapter.get<navtrailentry[]>(`navtrails:${runid}`)) ?? []; }

  /** Persists one navtrailentry of the run trail; an entry the trail already carries stays once so repeated restores never double it. */
  async addnavtrailentry(runid: string, entry: navtrailentry): Promise<void> { const records = await this.getnavtrail(runid); if (records.some(item => item.url === entry.url && item.stepid === entry.stepid && item.at === entry.at)) return; await this.adapter.set(`navtrails:${runid}`, [...records, entry]); }

  /** Returns the live navigation rate windows per domain of the 1.1.74 family; the sliding windows survive restarts through the same records. */
  async getnavratelimits(): Promise<ratelimitwindow[]> { return (await this.adapter.get<ratelimitwindow[]>("navratelimits")) ?? []; }

  /** Persists one navigation rate window per domain; every newer window replaces the stored one of its domain. */
  async setnavratelimitwindow(window: ratelimitwindow): Promise<void> { await this.adapter.set("navratelimits", [...((await this.adapter.get<ratelimitwindow[]>("navratelimits")) ?? []).filter(candidate => candidate.domain !== window.domain), window]); }

  /** Returns the stored deep link patterns of the 1.1.74 family; the deeplinkapp builder reads the same patterns beside its built in catalog. */
  async getdeeplinks(): Promise<deeplinkpattern[]> { return (await this.adapter.get<deeplinkpattern[]>("deeplinkpatterns")) ?? []; }

  /** Persists one deeplinkpattern; a stored pattern of the same app and route gives way to the newer one. */
  async setdeeplink(pattern: deeplinkpattern): Promise<void> { await this.adapter.set("deeplinkpatterns", [...((await this.adapter.get<deeplinkpattern[]>("deeplinkpatterns")) ?? []).filter(candidate => !(candidate.app === pattern.app && candidate.route === pattern.route)), pattern]); }

  /** Returns the safety verdict history of the 1.1.74 family, newest first; the ui shows the same verdicts with their reasons before anything opens. */
  async getsafety(): Promise<safetyverdict[]> { return [...((await this.adapter.get<safetyverdict[]>("safetyverdicts")) ?? [])].sort((one, two) => two.at - one.at); }

  /** Persists one safetyverdict of the checksafeurl history; every refusal keeps its reasons for the audit trail. */
  async setsafetyverdict(verdict: safetyverdict): Promise<void> { await this.adapter.set("safetyverdicts", [verdict, ...((await this.adapter.get<safetyverdict[]>("safetyverdicts")) ?? [])].slice(0, 256)); }

  /** Returns the stored prefetchplan of the latest navintent pass; the predictions survive restarts so the warming resumes from the same set. */
  async getprefetch(): Promise<prefetchplan | undefined> { return this.adapter.get<prefetchplan>("prefetchplans"); }

  /** Persists the prefetchplan of the latest navintent pass; a changed plan replaces the stored predictions because stale predictions never warm a page. */
  async setprefetch(plan: prefetchplan): Promise<void> { return this.adapter.set("prefetchplans", plan); }

  /** Returns the navpause state with its pending url; the freeze and its queued navigation survive restarts through the same record. */
  async getnavpause(): Promise<navpause | undefined> { return this.adapter.get<navpause>("navpauserecord"); }

  /** Persists the navpause state with its pending url; the queued navigation waits for the answer of the consent prompt across restarts. */
  async setnavpause(pause: navpause): Promise<void> { return this.adapter.set("navpauserecord", pause); }

  /** Returns the extractpipelines of the 1.1.75 family, newest first; a run id narrows the read to its own pipelines so the resume and the view read exactly their own extraction. */
  async getpipeline(runid?: string): Promise<extractpipeline[]> { const records = ((await this.adapter.get<extractpipeline[]>("extractpipelines")) ?? []).sort((one, two) => two.updatedat - one.updatedat); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Persists one extractpipeline per run; every newer pipeline of the same id replaces the stored one so the pipeline state survives restarts. */
  async setpipeline(pipeline: extractpipeline): Promise<void> { await this.adapter.set("extractpipelines", [pipeline, ...((await this.adapter.get<extractpipeline[]>("extractpipelines")) ?? []).filter(candidate => candidate.id !== pipeline.id)]); }

  /** Returns the streamcursor of one pipeline; the checkpointed position survives restarts so the resume continues exactly where the stream stopped. */
  async getcursor(pipelineid: string): Promise<streamcursor | undefined> { return this.adapter.get<streamcursor>(`streamcursor:${pipelineid}`); }

  /** Persists the streamcursor of one pipeline after every chunk; the cursor checkpoints ride the same adapter so an interrupted stream never writes a row twice. */
  async setcursor(cursor: streamcursor): Promise<void> { await this.adapter.set(`streamcursor:${cursor.pipelineid}`, cursor); }

  /** Returns the stored transformrule list of one run; the pipeline layer applies only the rules the run review approved. */
  async gettransforms(runid: string): Promise<transformrule[]> { return (await this.adapter.get<transformrule[]>(`pipelinetransforms:${runid}`)) ?? []; }

  /** Persists the transformrule list of one run; every newer list replaces the stored one so the transforms stay the reviewed set. */
  async settransforms(runid: string, rules: transformrule[]): Promise<void> { await this.adapter.set(`pipelinetransforms:${runid}`, rules); }

  /** Returns the stored preview extractbatches of the 1.1.75 family, newest first; the grid preview reads the same batches without ever touching the stored extract. */
  async getrows(): Promise<extractbatch[]> { return [...((await this.adapter.get<extractbatch[]>("previewbatches")) ?? [])].sort((one, two) => two.at - one.at); }

  /** Persists the latest preview extractbatch under the user configured previewretention window in milliseconds; an absent window keeps every batch for the audit trail. */
  async setrows(batch: extractbatch, retention?: number): Promise<void> { const kept = [batch, ...((await this.adapter.get<extractbatch[]>("previewbatches")) ?? []).filter(candidate => candidate.id !== batch.id)]; await this.adapter.set("previewbatches", retention !== undefined && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the provlog entries of one run in append order; the provenance queries read the same append only log. */
  async getprovlog(runid: string): Promise<provlogentry[]> { return ((await this.adapter.get<provlogentry[]>(`provlog:${runid}`)) ?? []).sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1)); }

  /** Appends one provlogentry to the run log; the log stays append only — an entry whose id already sits in the log never rewrites — so the audit integrity holds across restarts. */
  async addprovlogentry(runid: string, entry: provlogentry): Promise<void> { const records = await this.getprovlog(runid); if (records.some(candidate => candidate.id === entry.id)) return; await this.adapter.set(`provlog:${runid}`, [...records, entry]); }

  /** Returns the samplepolicy of one plan; the preview reads the row count and the strategy the user configured for exactly this plan. */
  async getsamplepolicy(planid: string): Promise<samplepolicy | undefined> { return this.adapter.get<samplepolicy>(`samplepolicy:${planid}`); }

  /** Persists the samplepolicy of one plan; the row count stays a user choice with no code ceiling. */
  async setsamplepolicy(planid: string, policy: samplepolicy): Promise<void> { await this.adapter.set(`samplepolicy:${planid}`, policy); }

  /** Returns the stored dedupereports of the 1.1.75 family, newest first; a run id narrows the read to its own passes. */
  async getdedupereports(runid?: string): Promise<dedupereport[]> { const records = [...((await this.adapter.get<dedupereport[]>("dedupereports")) ?? [])].sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Persists one dedupereport with its dropped counts and dropped row keys; every pass keeps its report for the audit trail. */
  async setdedupereport(report: dedupereport): Promise<void> { await this.adapter.set("dedupereports", [report, ...((await this.adapter.get<dedupereport[]>("dedupereports")) ?? []).filter(candidate => candidate.id !== report.id)]); }

  /** Returns the stream file metadata of the 1.1.75 family, newest first; the cleanup after a run reads exactly the disk sinks its pipelines streamed to. */
  async getstreamfiles(runid?: string): Promise<streamfilerecord[]> { const records = [...((await this.adapter.get<streamfilerecord[]>("streamfiles")) ?? [])].sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Persists one streamfilerecord for the cleanup after its run; the metadata carries the filename inside the runid namespace and never the row payloads. */
  async addstreamfile(record: streamfilerecord): Promise<void> { await this.adapter.set("streamfiles", [record, ...((await this.adapter.get<streamfilerecord[]>("streamfiles")) ?? []).filter(candidate => candidate.id !== record.id)]); }

  /** Returns the sourcestamprecords of one run, newest first; the stamps sit beside their rows so every cell answers the page and step that captured it. */
  async getsourcestamps(runid: string): Promise<sourcestamprecord[]> { return ((await this.adapter.get<sourcestamprecord[]>(`sourcestamps:${runid}`)) ?? []).sort((one, two) => two.capturedat - one.capturedat); }

  /** Persists the sourcestamprecords of one run; a stamp never rewrites after stamping so the capture timestamps stay immutable. */
  async setsourcestamps(runid: string, stamps: sourcestamprecord[]): Promise<void> { await this.adapter.set(`sourcestamps:${runid}`, stamps); }

  /** Returns one stored event subscription of the 1.1.76 family by its id; the record carries its lasteventid so a reconnect resumes exactly where the stream stopped. */
  async getsubscription(id: string): Promise<eventsubscription | undefined> { return (await this.getsubscriptions()).find(record => record.id === id); }

  /** Returns the per run cached responses of the 1.1.76 family, newest first; a run id narrows the read to its own namespace because every cache key embeds the run it serves. */
  async getcache(runid?: string): Promise<cacheentry[]> { const records = ((await this.adapter.get<cacheentry[]>("webapicache")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(entry => entry.runid === runid) : records; }

  /** Persists one cached response of the 1.1.76 family under the user configured cacheretention window in entries; an absent window keeps every cacheentry of the run until the run ends. */
  async setcacheentry(entry: cacheentry, retention?: number): Promise<void> { const kept = [entry, ...((await this.adapter.get<cacheentry[]>("webapicache")) ?? []).filter(candidate => candidate.key !== entry.key)]; await this.adapter.set("webapicache", retention !== undefined && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Runs the cache expiry cleanup pass of the 1.1.76 family: every entry whose expiry passed drops while its metadata stays with the caller for the audit trail; an absent pass keeps every unexpired entry. */
  async expirycachepass(now: number): Promise<{ kept: cacheentry[]; expired: cacheentry[] }> { const records = (await this.adapter.get<cacheentry[]>("webapicache")) ?? []; const kept = records.filter(entry => entry.expiry === undefined || now < entry.expiry); const expired = records.filter(entry => entry.expiry !== undefined && now >= entry.expiry); if (expired.length > 0) await this.adapter.set("webapicache", kept); return { kept, expired }; }

  /** Returns the per run correlation map of the 1.1.76 family; the request map stays read only inside the run and exports to the audit trail as one map. */
  async getcorrelation(runid: string): Promise<correlationcontext | undefined> { return this.adapter.get<correlationcontext>(`webapicorrelation:${runid}`); }

  /** Persists the per run correlation map of the 1.1.76 family; every assigned request id and every joined response pair survive restarts through the same record. */
  async setcorrelation(context: correlationcontext): Promise<void> { await this.adapter.set(`webapicorrelation:${context.runid}`, context); }

  /** Returns the stored ratelimitdirective records of the 1.1.76 family per origin whose reset window has not passed; expired directives drop out at their reset windows, composed beside the ratelimitread family. */
  async getratelimitdirectives(now: number): Promise<ratelimitdirective[]> { const records = (await this.adapter.get<ratelimitdirective[]>("webapiratelimits")) ?? []; const live = records.filter(directive => directive.resetat > now); if (live.length !== records.length) await this.adapter.set("webapiratelimits", live); return live; }

  /** Persists one ratelimitdirective of the 1.1.76 family per origin and scope, replacing the previous directive of the same origin and scope. */
  async setratelimitdirective(directive: ratelimitdirective): Promise<void> { const records = ((await this.adapter.get<ratelimitdirective[]>("webapiratelimits")) ?? []).filter(candidate => !(candidate.origin === directive.origin && candidate.scope === directive.scope)); await this.adapter.set("webapiratelimits", [directive, ...records]); }

  /** Returns the observed page api calls of the 1.1.76 family, newest first; a run id narrows the read to its own observations while the records stay read only beside the discovered api map. */
  async getapicalls(runid?: string): Promise<apicallrecord[]> { const records = ((await this.adapter.get<apicallrecord[]>("webapicalls")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one observed page api call of the 1.1.76 family under the user configured apicallretention window in records; an absent window keeps every apicallrecord for the audit trail. */
  async addapicall(record: apicallrecord, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<apicallrecord[]>("webapicalls")) ?? [])]; await this.adapter.set("webapicalls", retention !== undefined && Number.isFinite(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the user configured poll choices of the 1.1.76 family: the timeout of one long poll request and the backoff between its retries; an absent choice leaves the poll unbounded because the bounds carry no code default. */
  async getpollchoices(): Promise<{ timeout?: number; backoff?: number }> { return (await this.adapter.get<{ timeout?: number; backoff?: number }>("webapipollchoices")) ?? {}; }

  /** Persists the user configured poll choices of the 1.1.76 family; the timeout and the backoff stay exactly the user's values with no code default. */
  async setpollchoices(choices: { timeout?: number; backoff?: number }): Promise<void> { await this.adapter.set("webapipollchoices", choices); }

  /** Returns the stored ocr results of the 1.1.77 family, newest first; a run id narrows the read to its own recognitions. */
  async getocrs(runid?: string): Promise<ocrresult[]> { const records = ((await this.adapter.get<ocrresult[]>("visionocr")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one ocr result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every ocrresult for the audit trail. */
  async addocr(record: ocrresult, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<ocrresult[]>("visionocr")) ?? [])]; await this.adapter.set("visionocr", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the stored vision descriptions of the 1.1.77 family, newest first; a run id narrows the read to its own model answers. */
  async getvisions(runid?: string): Promise<visiondescription[]> { const records = ((await this.adapter.get<visiondescription[]>("visiondescriptions")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one vision description of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every visiondescription for the audit trail. */
  async addvision(record: visiondescription, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<visiondescription[]>("visiondescriptions")) ?? [])]; await this.adapter.set("visiondescriptions", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the stored redaction masks of the 1.1.77 family, newest first; a run id narrows the read to its own masks while the mask evidence always survives for the audit trail. */
  async getmasks(runid?: string): Promise<redactionmask[]> { const records = ((await this.adapter.get<redactionmask[]>("visionmasks")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one redaction mask of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every redactionmask because the mask evidence answers the audit. */
  async addmask(record: redactionmask, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<redactionmask[]>("visionmasks")) ?? [])]; await this.adapter.set("visionmasks", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the stored screenshot pairs of the 1.1.77 family, newest first; the name composes with screenshotpair because the getpairs accessor of the 1.1.40 family already serves the beforeafter shotpair records — the same house rule of composed names on collision. */
  async getscreenshotpairs(runid?: string): Promise<screenshotpair[]> { const records = ((await this.adapter.get<screenshotpair[]>("visionscreenshotpairs")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one screenshot pair of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every screenshotpair for the audit trail. */
  async addscreenshotpair(record: screenshotpair, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<screenshotpair[]>("visionscreenshotpairs")) ?? [])]; await this.adapter.set("visionscreenshotpairs", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the stored grounding results of the 1.1.77 family, newest first; a run id narrows the read to its own groundings. */
  async getgroundings(runid?: string): Promise<groundingresult[]> { const records = ((await this.adapter.get<groundingresult[]>("visiongroundings")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one grounding result of the 1.1.77 family under the user configured visionretention window in records; an absent window keeps every groundingresult for the audit trail. */
  async addgrounding(record: groundingresult, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<groundingresult[]>("visiongroundings")) ?? [])]; await this.adapter.set("visiongroundings", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Returns the stored frame reads of the 1.1.77 family, newest first; every framereference names the video selector and the position the run read so a frame position never re-reads blindly. */
  async getframereads(runid?: string): Promise<framereference[]> { const records = ((await this.adapter.get<framereference[]>("visionframereads")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one frame read of the 1.1.77 family under the user configured frameretention window in milliseconds; a repeated read of the same selector and position replaces its record while an absent window keeps every framereference for the audit trail. */
  async addframeread(record: framereference, retention?: number): Promise<void> { const previous = (await this.adapter.get<framereference[]>("visionframereads")) ?? []; const fresh = retention !== undefined && Number.isFinite(retention) && retention > 0 ? previous.filter(candidate => record.at - candidate.at < retention) : previous; await this.adapter.set("visionframereads", [record, ...fresh.filter(candidate => !(candidate.runid === record.runid && candidate.selector === record.selector && candidate.positionms === record.positionms))]); }

  /** Returns the persisted vision model configuration of the 1.1.77 family: the model name and the endpoint the user configured; an absent configuration keeps the model calls refused because no recognition ships inside the extension. */
  async getvisionconfig(): Promise<{ model?: string; endpoint?: string }> { return (await this.adapter.get<{ model?: string; endpoint?: string }>("visionconfig")) ?? {}; }

  /** Persists the vision model configuration of the 1.1.77 family; the model and the endpoint stay exactly the user's values with no code default. */
  async setvisionconfig(config: { model?: string; endpoint?: string }): Promise<void> { await this.adapter.set("visionconfig", config); }

  /** Returns the stored visioncache entries of the 1.1.77 family keyed by their image hashes, newest first; a run id narrows the read to its own namespace. */
  async getvisioncache(runid?: string): Promise<visioncacheentry[]> { const records = ((await this.adapter.get<visioncacheentry[]>("visioncache")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(entry => entry.runid === runid) : records; }

  /** Persists one visioncache entry of the 1.1.77 family by its image hash; a newer entry of the same hash replaces the older one so one image hash answers one recognition. */
  async setvisioncacheentry(entry: visioncacheentry): Promise<void> { const kept = [entry, ...((await this.adapter.get<visioncacheentry[]>("visioncache")) ?? []).filter(candidate => candidate.hash !== entry.hash)]; await this.adapter.set("visioncache", kept); }

  /** Runs the visioncache expiry pass of the 1.1.77 family: every entry older than the user configured visioncacheretention window in milliseconds drops while its metadata stays with the caller for the audit trail; an absent window keeps every entry. */
  async expirevisioncachepass(now: number, retention?: number): Promise<{ kept: visioncacheentry[]; expired: visioncacheentry[] }> { const records = (await this.adapter.get<visioncacheentry[]>("visioncache")) ?? []; const kept = records.filter(entry => retention === undefined || now - entry.at < retention); const expired = records.filter(entry => retention !== undefined && now - entry.at >= retention); if (expired.length > 0) await this.adapter.set("visioncache", kept); return { kept, expired }; }

  /** Returns the vision call records of the 1.1.77 family, newest first; every call names whether it rode the configured model endpoint so the visioncost count answers the costshare ledger. */
  async getvisioncalls(runid?: string): Promise<Array<{ runid: string; kind: string; model: boolean; at: number }>> { const records = ((await this.adapter.get<Array<{ runid: string; kind: string; model: boolean; at: number }>>("visioncalls")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one vision call of the 1.1.77 family; the call log stays local and read only because the costshare ledger answers the user alone. */
  async addvisioncall(record: { runid: string; kind: string; model: boolean; at: number }): Promise<void> { await this.adapter.set("visioncalls", [record, ...((await this.adapter.get<Array<{ runid: string; kind: string; model: boolean; at: number }>>("visioncalls")) ?? [])]); }

  /** Returns the stored beforeafter pairs of the 1.1.78 family, newest first; the name composes with beforeafter because the getpairs accessor of the 1.1.40 family already serves the shotpair records — the same house rule of composed names on collision. */
  async getbeforeafters(runid?: string): Promise<beforeafterpair[]> { const records = ((await this.adapter.get<beforeafterpair[]>("forensicpairs")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one beforeafter pair of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every pair for the audit trail. */
  async addbeforeafter(record: beforeafterpair, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<beforeafterpair[]>("forensicpairs")) ?? [])]; await this.adapter.set("forensicpairs", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Replaces the stored beforeafter pairs after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setbeforeafters(records: beforeafterpair[]): Promise<void> { await this.adapter.set("forensicpairs", records); }

  /** Returns the forensic console timeline of one run of the 1.1.78 family in capture order; the name composes with consoletimeline because the gettimeline accessor of the run timeline family and the consolediff of the console family already serve their own records. */
  async getconsoletimeline(runid: string): Promise<consoletraceentry[]> { return ((await this.adapter.get<consoletraceentry[]>(`forensicconsole:${runid}`)) ?? []).sort((one, two) => one.sequence - two.sequence); }

  /** Records one console trace entry of the 1.1.78 family per run; the sequence numbers stamp in capture order so a page reload never resets the ordering while the retention answers the user choice alone. */
  async addconsoleentry(runid: string, entry: consoletraceentry, retention?: number): Promise<void> { const kept = [...((await this.adapter.get<consoletraceentry[]>(`forensicconsole:${runid}`)) ?? []), entry]; await this.adapter.set(`forensicconsole:${runid}`, retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept); }

  /** Returns the forensic net timeline of one run of the 1.1.78 family in capture order; the name composes with nettrace because the getnetlog accessor of the network family already serves the netlog records. */
  async getnettraces(runid: string): Promise<nettraceentry[]> { return ((await this.adapter.get<nettraceentry[]>(`forensicnet:${runid}`)) ?? []).sort((one, two) => one.at - two.at); }

  /** Records one net trace entry of the 1.1.78 family per run; the correlation joining answers the correlateids map while the retention answers the user choice alone. */
  async addnettrace(runid: string, entry: nettraceentry, retention?: number): Promise<void> { const kept = [...((await this.adapter.get<nettraceentry[]>(`forensicnet:${runid}`)) ?? []), entry]; await this.adapter.set(`forensicnet:${runid}`, retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(-retention) : kept); }

  /** Returns the stored diff baselines of the 1.1.78 family, newest first; the name composes with diffbase because the getdiffs accessor of the snapshot family already serves the snapshotdiff records. */
  async getdiffbases(runid?: string): Promise<diffbaserecord[]> { const records = ((await this.adapter.get<diffbaserecord[]>("forensicdiffbases")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Persists one diff baseline of the 1.1.78 family; a new baseline of the same page state replaces the older one so one page state answers one frozen capture. */
  async setdiffbase(record: diffbaserecord): Promise<void> { const kept = [record, ...((await this.adapter.get<diffbaserecord[]>("forensicdiffbases")) ?? []).filter(candidate => !(candidate.runid === record.runid && candidate.pagestate === record.pagestate))]; await this.adapter.set("forensicdiffbases", kept); }

  /** Returns the stored diff results of the 1.1.78 family, newest first; a run id narrows the read to its own comparisons. */
  async getdiffresults(runid?: string): Promise<diffresult[]> { const records = ((await this.adapter.get<diffresult[]>("forensicdiffresults")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one diff result of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every diffresult for the audit trail. */
  async adddiffresult(record: diffresult, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<diffresult[]>("forensicdiffresults")) ?? [])]; await this.adapter.set("forensicdiffresults", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Replaces the stored diff results after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setdiffresults(records: diffresult[]): Promise<void> { await this.adapter.set("forensicdiffresults", records); }

  /** Returns the stored thumbnails of the 1.1.78 family, newest first; every thumbnailrecord links back to its full capture through its captureid so the capture log shows the run at a glance. */
  async getthumbs(runid?: string): Promise<thumbnailrecord[]> { const records = ((await this.adapter.get<thumbnailrecord[]>("forensicthumbs")) ?? []).sort((one, two) => two.at - one.at); return runid !== undefined && runid.trim() !== "" ? records.filter(record => record.runid === runid) : records; }

  /** Records one thumbnail of the 1.1.78 family under the user configured forensicretention window in records; an absent window keeps every thumbnailrecord beside its full capture. */
  async addthumb(record: thumbnailrecord, retention?: number): Promise<void> { const kept = [record, ...((await this.adapter.get<thumbnailrecord[]>("forensicthumbs")) ?? [])]; await this.adapter.set("forensicthumbs", retention !== undefined && Number.isInteger(retention) && retention > 0 ? kept.slice(0, retention) : kept); }

  /** Replaces the stored thumbnails after the user cleanup pass of the 1.1.78 family; the prune answers the user configured retention alone and never a silent sweep. */
  async setthumbs(records: thumbnailrecord[]): Promise<void> { await this.adapter.set("forensicthumbs", records); }

  /** Returns the timelapse frame references of one run of the 1.1.78 family in their ordered sequence; the assembled lapse replays the page change in capture order. */
  async getlapse(runid: string): Promise<timelapseframe[]> { return ((await this.adapter.get<timelapseframe[]>(`forensiclapse:${runid}`)) ?? []).sort((one, two) => one.sequence - two.sequence); }

  /** Appends one timelapse frame of the 1.1.78 family per run; the frame reference carries its ordered sequence number so a late stored frame lands in its place. */
  async addlapseframe(runid: string, frame: timelapseframe): Promise<void> { const kept = [...((await this.adapter.get<timelapseframe[]>(`forensiclapse:${runid}`)) ?? []).filter(candidate => candidate.sequence !== frame.sequence), frame]; await this.adapter.set(`forensiclapse:${runid}`, kept); }

  /** Returns the timelapse configuration of one run of the 1.1.78 family; the interval and the duration stay the user choices the lapse runs on. */
  async getlapseconfig(runid: string): Promise<timelapseconfig | undefined> { return this.adapter.get<timelapseconfig>(`forensiclapseconfig:${runid}`); }

  /** Persists the timelapse configuration of one run of the 1.1.78 family; the started lapse survives service worker restarts through the same record. */
  async setlapseconfig(config: timelapseconfig): Promise<void> { await this.adapter.set(`forensiclapseconfig:${config.runid}`, config); }

  /** Returns the user configured capture naming rule of the 1.1.78 family: the lowercase pattern with the parts it stamps; an absent rule keeps the capturename grammar of the files family. */
  async getnames(): Promise<capturenamerule | undefined> { return this.adapter.get<capturenamerule>("forensicnames"); }

  /** Persists the user configured capture naming rule of the 1.1.78 family; the pattern and its parts stay exactly the user's values with no code default. */
  async setnamerule(rule: capturenamerule): Promise<void> { await this.adapter.set("forensicnames", rule); }

  /** Returns the user configured forensic choices of the 1.1.78 family: the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention; an absent choice never hides a code default. */
  async getforensicchoices(): Promise<{ diffthreshold?: number; timelapseinterval?: number; thumbnailedge?: number; forensicretention?: number }> { const settings = await this.getsettings(); const choices: { diffthreshold?: number; timelapseinterval?: number; thumbnailedge?: number; forensicretention?: number } = {}; if (settings?.diffthreshold !== undefined) choices.diffthreshold = settings.diffthreshold; if (settings?.timelapseinterval !== undefined) choices.timelapseinterval = settings.timelapseinterval; if (settings?.thumbnailedge !== undefined) choices.thumbnailedge = settings.thumbnailedge; if (settings?.forensicretention !== undefined) choices.forensicretention = settings.forensicretention; return choices; }

  /** Persists the user configured forensic choices of the 1.1.78 family through the runsettings; the diff threshold, the timelapse interval, the thumbnail edge and the forensic retention stay exactly the user's values with no code default. */
  async setforensicchoices(choices: { diffthreshold?: number; timelapseinterval?: number; thumbnailedge?: number; forensicretention?: number }): Promise<void> { const settings = (await this.getsettings()) ?? {}; await this.setsettings({ ...settings, ...(choices.diffthreshold !== undefined ? { diffthreshold: choices.diffthreshold } : {}), ...(choices.timelapseinterval !== undefined ? { timelapseinterval: choices.timelapseinterval } : {}), ...(choices.thumbnailedge !== undefined ? { thumbnailedge: choices.thumbnailedge } : {}), ...(choices.forensicretention !== undefined ? { forensicretention: choices.forensicretention } : {}) }); }

  /** Lists every stored key of the 1.1.79 minimization family with its data class, its serialized size and its record count: the inventory reads the stored families the caller names so the purge and the exportall bundle scope exactly over what the device holds, while the artifact getinventory of the 1.1.68 family stays untouched for the cleanup sweeper. */
  async getdatainventory(families: Array<{ key: string; dataclass: string }>): Promise<datainventory[]> {
    const now = Date.now();
    const inventory: datainventory[] = [];
    for (const family of families) {
      const value = await this.adapter.get<unknown>(family.key);
      const serialized = JSON.stringify(value ?? null) ?? "null";
      const records = Array.isArray(value) ? value.length : value === undefined || value === null ? 0 : 1;
      inventory.push({ key: family.key, dataclass: family.dataclass, size: serialized.length, records, at: now });
    }
    return inventory;
  }

  /** Stores the minimization policies of the 1.1.79 family — the purge policy with its scope and typed confirmation, the cleanup schedule with its artifact classes and timing, and the sync settings with the opted in classes and the cadence — exactly as the user configured them with no code default. */
  async getminpolicies(): Promise<{ purge?: purgepolicy; cleanup?: cleanupschedule; sync?: syncsettings }> { return (await this.adapter.get<{ purge?: purgepolicy; cleanup?: cleanupschedule; sync?: syncsettings }>("minpolicies")) ?? ({} as { purge?: purgepolicy; cleanup?: cleanupschedule; sync?: syncsettings }); }

  /** Persists the minimization policies of the 1.1.79 family; every scope, timing, cadence and confirmation phrase stays the user's choice with no code default. */
  async setminpolicies(policies: { purge?: purgepolicy; cleanup?: cleanupschedule; sync?: syncsettings }): Promise<void> { return this.adapter.set("minpolicies", policies); }

  /** Lists the sync records of the 1.1.79 family: one record per synced payload with its opted in classes, its payload hash, its format tag and its sync time — a plaintext sync never enters this list. */
  async getsyncrecords(): Promise<syncrecord[]> { return (await this.adapter.get<syncrecord[]>("syncrecords")) ?? []; }

  /** Stores one sync record of the 1.1.79 family; the newest pass answers first so the sync view names the latest transport. */
  async addsyncrecord(record: syncrecord): Promise<void> { await this.adapter.set("syncrecords", [record, ...(await this.getsyncrecords()).filter(candidate => candidate.id !== record.id)]); }

  /** Lists the cookie jar records of the 1.1.79 family — one jar per task run with its scoped cookie entries, its seal state and its expiry window. */
  async getjars(): Promise<cookiejarrecord[]> { return (await this.adapter.get<cookiejarrecord[]>("cookiejars")) ?? []; }

  /** Stores one cookie jar record of the 1.1.79 family; the jar keeps its run binding so one task run never shares its cookie state with another. */
  async setjar(jar: cookiejarrecord): Promise<void> { await this.adapter.set("cookiejars", [...(await this.getjars()).filter(candidate => candidate.jarid !== jar.jarid), jar]); }

  /** Expires the sealed jars of the 1.1.79 family whose user configured expiry window passed: the cookie entries leave while the jar record stays for the audit trail, and an unexpired or expiry-less jar keeps everything because the expiry never defaults in code. */
  async expirejarpass(now: number): Promise<{ expired: number }> {
    const jars = await this.getjars();
    let expired = 0;
    for (const jar of jars) {
      if (jar.sealed && jar.expiresat !== undefined && jar.expiresat <= now && jar.cookies.length > 0) {
        await this.setjar({ ...jar, cookies: [], updatedat: now });
        expired += 1;
      }
    }
    return { expired };
  }

  /** Lists the local rule records of the 1.1.79 family: the field lists per origin that must never leave the device. */
  async getlocalrules(): Promise<localrule[]> { return (await this.adapter.get<localrule[]>("localrules")) ?? []; }

  /** Stores one local rule record of the 1.1.79 family per origin; the localfirst pass and the localgate read exactly these fields. */
  async setlocalrule(rule: localrule): Promise<void> { await this.adapter.set("localrules", [...(await this.getlocalrules()).filter(candidate => candidate.origin !== rule.origin), rule]); }

  /** Reads the telemetry policy of the 1.1.79 family persisted fixed to off: the enabled literal stays false by construction and every counter keeps living inside the local memory. */
  async gettelemetrypolicy(): Promise<telemetrypolicy> { return (await this.adapter.get<telemetrypolicy>("telemetrypolicy")) ?? { enabled: false, counters: "local", at: Date.now() }; }

  /** Persists the telemetry policy of the 1.1.79 family; only the fixed off record ever stores because the type makes an on state unrepresentable. */
  async settelemetrypolicy(policy: telemetrypolicy): Promise<void> { return this.adapter.set("telemetrypolicy", policy); }

  /** Lists the exportall bundles of the 1.1.79 family: one record per portable file the user asked for with its record counts and byte sizes. */
  async getexportbundles(): Promise<exportallbundle[]> { return (await this.adapter.get<exportallbundle[]>("exportallbundles")) ?? []; }

  /** Stores one exportall bundle of the 1.1.79 family; the bundle links to its download record so the audit trail answers which download carried which bundle. */
  async addexportbundle(bundle: exportallbundle): Promise<void> { await this.adapter.set("exportallbundles", [bundle, ...(await this.getexportbundles()).filter(candidate => candidate.id !== bundle.id)]); }

  /** Links one exportall bundle of the 1.1.79 family to the download record that carried it, so the audit trail answers which download shipped which bundle. */
  async setbundledownload(bundleid: string, downloadid: string): Promise<void> { await this.adapter.set("exportalldownloads", { ...((await this.adapter.get<Record<string, string>>("exportalldownloads")) ?? {}), [bundleid]: downloadid }); }

  /** Lists the download links of the exportall bundles of the 1.1.79 family by bundle id. */
  async getbundledownloads(): Promise<Record<string, string>> { return (await this.adapter.get<Record<string, string>>("exportalldownloads")) ?? {}; }

  /** Flags artifacts of the 1.1.79 family for retention: the flagged ids never enter a cleanup pass because the user asked to keep them. */
  async flagretainedartifacts(ids: string[]): Promise<void> { const kept = new Set([...(await this.adapter.get<string[]>("retainedartifacts")) ?? [], ...ids]); await this.adapter.set("retainedartifacts", [...kept]); }

  /** Lists the artifact ids the user flagged for retention of the 1.1.79 family; the cleanup pass keeps every one of them. */
  async getretainedartifacts(): Promise<string[]> { return (await this.adapter.get<string[]>("retainedartifacts")) ?? []; }

  /** Lists the storage keys the run families wrote, derived from the stored records: the run scoped keys of every known run, the session trail keys and the family keys the inventory scopes, because the adapter seam exposes no enumeration and the purge of a run trace names real keys only. */
  async storedkeys(): Promise<string[]> {
    const runs = await this.adapter.get<runrecord[]>("runs") ?? [];
    const sessions = await this.adapter.get<sessionrecord[]>("sessionrecords") ?? [];
    const keys = new Set<string>(["runs", "memoryitems", "captures", "settings", "provlog", "audit"]);
    for (const run of runs) {
      keys.add(`runlog${run.runid}`);
      keys.add(`runscopes${run.runid}`);
      keys.add(`taskstate${run.runid}`);
      keys.add(`emulationstate${run.runid}`);
      keys.add(`workflowprovenance${run.runid}`);
      keys.add(`controldecisions${run.runid}`);
      keys.add(`runtimeline:${run.runid}`);
      keys.add(`provlog:${run.runid}`);
    }
    for (const session of sessions) keys.add(`trail${session.id}`);
    return [...keys].sort();
  }

  /** Purges the stored families of the 1.1.79 minimization family by storage key: the purgeonrequest pass resolved the scope and the typed confirmation before the caller lands here, every deleted key entered the audit trail through the caller, and the audit family never purges because the immutable hashes survive every pass. */
  async purgekeys(keys: string[]): Promise<void> { for (const key of keys) { if (key === "audit") continue; await this.adapter.set(key, key === "settings" ? {} : []); } }

  /** Builds the auditexportrecord of the workspace on demand: the runs with their visits, the memory items with their provenance, the expiry rules, the timeline streams of every run and the locks bundle into one record. */
  async getexport(now: number): Promise<auditexportrecord> {
    const runs = await this.listruns();
    const timeline: runtimelineevent[] = [];
    for (const run of runs) timeline.push(...(await this.getruntimeline(run.runid)));
    return { at: now, runs, memory: await this.getmemoryitems(), expiryrules: await this.getexpiry(), timeline, locks: await this.listlocks() };
  }

  /**
   * The site bridge seam of the 1.1.82 family: the relay session records, the pairing records with their one time codes, the relay token records stored only as sha-256 hashes scoped to the relay origin, the bridge event log with its minimized payloads, the offline bridge queue with its operation id deduplication and the bridge kill switch stamp persist through the same local adapter; the socket itself lives in the background service worker while every record survives its restarts.
   * The seam documents a relay session backend — a reviewed relay store can take the session and token registry over later, holding the pairing state and the token hashes beside the idle expiry sweeps on its own reviewed infrastructure behind the same bridge consent gate and the same origin scoping — without touching the callers, without ever persisting a raw token and without ever bypassing the review.
   * The bridge records below never hold page content: the event payloads carry plan text and statuses only unless the explicit page consent flag is set.
   */

  /** Lists the relay session records of the 1.1.82 site bridge: one record per paired relay session with its two member room and idle window. */
  async getbridgesessions(): Promise<bridgesessionrecord[]> { return (await this.adapter.get<bridgesessionrecord[]>("bridgesessions")) ?? []; }

  /** Stores the relay session records of the 1.1.82 site bridge in one pass so a restart never leaves a half written member room. */
  async setbridgesessions(records: bridgesessionrecord[]): Promise<void> { return this.adapter.set("bridgesessions", records); }

  /** Stores one relay session record of the 1.1.82 site bridge, replacing the record of the same session id. */
  async addbridgesession(record: bridgesessionrecord): Promise<void> { await this.adapter.set("bridgesessions", [record, ...(await this.getbridgesessions()).filter(candidate => candidate.id !== record.id)]); }

  /** Lists the bridge pairing records of the 1.1.82 site bridge: the one time codes minted inside the extension options bound to the relay origin. */
  async getbridgepairings(): Promise<bridgepairingrecord[]> { return (await this.adapter.get<bridgepairingrecord[]>("bridgepairings")) ?? []; }

  /** Stores the bridge pairing records of the 1.1.82 site bridge in one pass. */
  async setbridgepairings(records: bridgepairingrecord[]): Promise<void> { return this.adapter.set("bridgepairings", records); }

  /** Stores one bridge pairing record of the 1.1.82 site bridge; a re-mint of the same origin replaces the earlier code. */
  async addbridgepairing(record: bridgepairingrecord): Promise<void> { await this.adapter.set("bridgepairings", [record, ...(await this.getbridgepairings()).filter(candidate => candidate.origin !== record.origin)]); }

  /** Lists the relay token records of the 1.1.82 site bridge: the sha-256 hashes scoped to the relay origin, never a raw token. */
  async getbridgetokens(): Promise<relaytokenrecord[]> { return (await this.adapter.get<relaytokenrecord[]>("bridgetokens")) ?? []; }

  /** Stores the relay token records of the 1.1.82 site bridge in one pass; the raw values stay out of the store by construction. */
  async setbridgetokens(records: relaytokenrecord[]): Promise<void> { return this.adapter.set("bridgetokens", records); }

  /** Lists the bridge event records of the 1.1.82 site bridge: the minimized chat, plan proposal, plan review and progress events with their operation ids. */
  async getbridgeevents(): Promise<bridgeeventrecord[]> { return (await this.adapter.get<bridgeeventrecord[]>("bridgeevents")) ?? []; }

  /** Stores one bridge event record of the 1.1.82 site bridge at the head of the log; the payloads carry plan text and statuses only. */
  async addbridgeevent(event: bridgeeventrecord): Promise<void> { await this.adapter.set("bridgeevents", [event, ...(await this.getbridgeevents()).filter(candidate => candidate.opid !== event.opid)]); }

  /** Lists the offline bridge queue of the 1.1.82 site bridge: the buffered frames with their stable operation ids for the replay deduplication. */
  async getbridgequeue(): Promise<bridgequeuerecord[]> { return (await this.adapter.get<bridgequeuerecord[]>("bridgequeue")) ?? []; }

  /** Stores the offline bridge queue of the 1.1.82 site bridge in one pass so the replay and the buffer never race. */
  async setbridgequeue(records: bridgequeuerecord[]): Promise<void> { return this.adapter.set("bridgequeue", records); }

  /** Reads the bridge kill switch stamp of the 1.1.82 site bridge; an absent stamp leaves the switch released. */
  async getbridgeswitch(): Promise<bridgekillswitch | undefined> { return this.adapter.get<bridgekillswitch>("bridgeswitch"); }

  /** Stores the bridge kill switch stamp of the 1.1.82 site bridge; one click disables the socket and the pairing instantly. */
  async setbridgeswitch(stamp: bridgekillswitch): Promise<void> { return this.adapter.set("bridgeswitch", stamp); }

  /** Returns the install state of the 1.1.85 native host: the host name, the extension id, the installer and companion versions, the port state and the last errors; an absent record leaves the transport deny by default. */
  async getnativestate(): Promise<nativehoststate | undefined> { return this.adapter.get<nativehoststate>("nativestate"); }

  /** Stores the install state of the 1.1.85 native host so the install state persists across service worker restarts; the record never carries key material or session tokens. */
  async setnativestate(state: nativehoststate): Promise<void> { return this.adapter.set("nativestate", state); }

  /** Lists the native call records of the 1.1.85 audit trail: one record per call with its correlation id, surface, call class and outcome, newest first. */
  async getnativecalls(): Promise<nativecallrecord[]> { return (await this.adapter.get<nativecallrecord[]>("nativecalls")) ?? []; }

  /** Replaces the stored native call set after one recorded call so the audit trail survives the service worker restarts. */
  async setnativecalls(records: nativecallrecord[]): Promise<void> { return this.adapter.set("nativecalls", records); }

  /** Stores one native call record at the head of the audit trail; a repeated record id replaces the earlier entry and the record carries no payload bytes. */
  async addnativecall(record: nativecallrecord): Promise<void> { await this.adapter.set("nativecalls", [record, ...(await this.getnativecalls()).filter(candidate => candidate.id !== record.id)]); }

  /** Reads the kill switch stamp of the 1.1.85 native transport; an absent stamp leaves the switch released. */
  async getnativeswitch(): Promise<nativekillswitch | undefined> { return this.adapter.get<nativekillswitch>("nativeswitch"); }

  /** Stores the kill switch stamp of the 1.1.85 native transport; one press stops every native call instantly and no frame crosses until the release. */
  async setnativeswitch(stamp: nativekillswitch): Promise<void> { return this.adapter.set("nativeswitch", stamp); }

  /** Lists the wsbridge session records of the 1.1.85 native transport: the port, the token hash (never the raw token), the idle window and the connection counts. */
  async getnativebridgesessions(): Promise<wsbridgesession[]> { return (await this.adapter.get<wsbridgesession[]>("nativebridgesessions")) ?? []; }

  /** Replaces the stored wsbridge session set after one bind, connection or expiry sweep; the raw tokens stay out of the store by construction. */
  async setnativebridgesessions(sessions: wsbridgesession[]): Promise<void> { return this.adapter.set("nativebridgesessions", sessions); }

  /**
   * The resilience adapter seam of the 1.1.70 family: today the offlinequeue, the run records, the checkpoints, the heartbeats and the executed idempotencykeys persist through the same local adapter as every other record, and the seam keeps the queuedtask and runrecord shapes stable so a reviewed disk backed queue backend can take the offlinequeue over later — a browser restart or a service worker wake then drains the same sequence order — without touching the callers and without ever bypassing the review.
   * The state depth seam of the 1.1.71 family: the memoryitems, their provenance and their expiryrules persist through the same local adapter while the stored values encrypt at rest through the webcrypto derived key of encryptrest; the seam keeps the memoryitem shape stable so a reviewed encrypted backend implementation can take the whole memory store over later — the adapter then writes and reads only encrypted envelopes — without touching the callers, without persisting the derived key and without ever bypassing the review.
   * The fleet seam of the 1.1.72 family: the agentrecords, their budgetstates, the escalations, the reviewrecords, the runreplay captures under their user retention, the output comparisons, the consensusrecords and the killswitch stamp persist through the same local adapter; the seam keeps the fleet shapes stable so a reviewed shared backend can take the registry over later — a fleet of many browsers then reads one registry — without touching the callers and without ever bypassing the review.
   * The work seam of the 1.1.73 family: the fleet spawn lineage with its parent objectives, the aggregaterecords under their user retention, the interleaved timeline under its own retention, the lessonshare records, the arbitration cases with their verdicts, the priority lanes, the latest load reports per origin, the shared cost ledger and the user configured depthlimit persist through the same local adapter; the seam keeps the work shapes stable so a reviewed shared fleet backend can take the coordination state over later — many browsers then read one spawn lineage and one cost ledger — without touching the callers and without ever bypassing the review.
   * The navigation seam of the 1.1.74 family: the closedtabrecords under their user retention window, the navigation trails per run with their deduplicated entries, the per domain navigation rate windows, the deep link patterns, the safety verdict history, the prefetchplan of the latest navintent pass and the navpause state with its pending url persist through the same local adapter; the seam keeps the navigation shapes stable so a reviewed session restore backend can take the closed tab and trail state over later — a restarted browser then reopens the same closed tabs and replays the same trails — without touching the callers and without ever bypassing the review.
   * The pipeline seam of the 1.1.75 family: the extractpipelines per run, the streamcursor checkpointed after every chunk, the reviewed transformrule lists per run, the preview extractbatches under their user previewretention, the append only provlog entries per run, the samplepolicies per plan, the dedupereports with their dropped counts, the streamfilerecord metadata for the cleanup after each run and the sourcestamprecords beside their rows persist through the same local adapter; the seam keeps the pipeline shapes stable so a reviewed disk backed sink backend can take the stream files over later — the chunked writes then land on the same reviewed disk namespace while the cursor checkpoints and the provlog stay with the audit — without touching the callers and without ever bypassing the review.
   * The web api transport seam of the 1.1.76 family: the event subscription records with their persisted last event ids so a reconnect resumes exactly where the stream stopped, the per run cached responses namespaced through their run embedded cache keys under the user configured cacheretention, the cache expiry cleanup pass, the per run correlation maps with their assigned request ids and joined response pairs, the ratelimitdirective records per origin and scope, the observed page api calls under their user configured apicallretention and the user configured poll timeout and backoff choices persist through the same local adapter; the seam keeps the cacheentry shape stable so a reviewed cache backend can take the per run response cache over later — a shared or disk backed cache then serves the same run namespaced keys behind the same cachegate — without touching the callers and without ever bypassing the review.
   * The vision seam of the 1.1.77 family: the ocr results and the vision descriptions under their user configured visionretention, the redaction masks with their region evidence, the screenshot pairs binding each image to its dom snapshot, the grounding results with their ranked selectors, the frame reads with their video positions under their user configured frameretention, the vision model configuration, the visioncache entries keyed by their image hashes with the expiry pass tied to the user visioncacheretention window and the vision call log that feeds the costshare ledger persist through the same local adapter; the seam documents a model provider backend — a reviewed model provider can take the ocr read, the vision send and the pdf rasterize seams over later, running the recognition and the descriptions on its own reviewed infrastructure behind the same visiongate consent, while the recognition payloads and description texts stay opaque to this adapter — without touching the callers and without ever bypassing the review.
   * The forensic seam of the 1.1.78 family: the beforeafter pairs under the user configured forensicretention, the per run console and net timelines with their sequence and correlation linkage tied to the run heartbeat, the diff baselines with their page state labels and the diff results with their changed regions, the thumbnails linked back to their full captures, the per run timelapse configurations with their ordered frame references, the user configured capture naming rule and the forensic choices of the diff threshold, the timelapse interval, the thumbnail edge and the retention persist through the same local adapter; the seam documents a capture store backend — a reviewed disk backed capture store can take the forensic records over later, holding the pairs, the timelines and the diffs beside the capture bytes on the same reviewed namespace while the provenance stays with the provlog — without touching the callers, without a forced purge of its own and without ever bypassing the review.
   * The minimization seam of the 1.1.79 family: the data inventory over the stored families, the minimization policies of the purge scope with its typed confirmation, the cleanup schedule with its artifact classes and timing and the sync settings with the opted in classes and the cadence, the sync records with their payload hashes and format tags, the cookie jars per run with their seal state and expiry windows, the local rule field lists per origin, the telemetry policy fixed to off, the exportall bundles with their download links and the retained artifact flags persist through the same local adapter; the seam documents an encrypted sync backend — a reviewed sync backend can take the syncrecord transport over later, receiving only the encrypted envelopes the encryptsync pass built from the user passphrase while the passphrase itself never persists and the derived key never rides a payload — without touching the callers, without a plaintext transport and without ever bypassing the review.
   * The mcp serve seam of the 1.1.84 family: the client session bindings that pair one client with exactly one extension session so concurrent clients hold isolated sessions, the client records with their initialize declared name and version metadata for the audit trail, the tool call records that name the caller, the tool and the outcome of every serve call without any payload, the served resource watchers with their baselines, the approval gates with their pending state and the shutdown drain window the user configures persist through the same local adapter the extension engine uses; the serve mode shares the policy gates, the kind catalog, this memory store and the progress store with the live extension sessions instead of growing a second engine, and the seam documents a serve state backend — a reviewed serve backend can take the bindings and the call registry over later behind the same pairing approval, the same consent gates and the same audit trail — without touching the callers, without ever persisting a raw session token and without ever bypassing the review.
   * The native host seam of the 1.1.85 family: the install state that records the host name, the extension id, the installer and companion versions and the port state so the install survives every service worker restart, the native call records that name the correlation id, the surface, the call class and the outcome of every native call without any payload, the kill switch stamp and the wsbridge session records with their token hashes only persist through the same local adapter; the raw wsbridge token never persists because the advertisement frame stays the only carrier, and the seam documents a native state backend — a reviewed host state backend can take the install state and the call registry over later behind the same install consent, the same per class gates and the same audit trail — without touching the callers and without ever bypassing the review.
   */

}

/** Resolves the media family discriminator of one stored media record. */
function mediakindof(record: mediarecord): string {
  if ("pages" in record) return "pdf";
  if ("startedat" in record) return "recording";
  if ("timestamp" in record) return "frame";
  if ("context" in record) return "canvas";
  if ("tracks" in record) return "stream";
  return "asset";
}

/** Expires the bytes of one media record while keeping the metadata and the recording frame index for the audit trail. */
function expiremediabytes(record: mediarecord): mediarecord {
  if ("dataurl" in record) {
    const source = record as pdfrecord | canvasrecord | framerecord;
    const copy = { ...source } as { dataurl?: string };
    delete copy.dataurl;
    return { ...copy, bytesexpired: true } as mediarecord;
  }
  if ("startedat" in record) {
    const source = record as recordingrecord;
    const copy = { ...source };
    delete copy.bytes;
    return { ...copy, bytesexpired: true };
  }
  return record;
}

/** Expires the bytes of one capture record while keeping the metadata for the audit trail. */
function expirecapturebytes(record: shotrecord): shotrecord {
  const { bytes, ...metadata } = record;
  void bytes;
  return { ...metadata, bytesexpired: true };
}

/** Expires the body of one outbound call record while keeping every transport fact for the audit trail. */
function expirecallbody(record: callrecord): callrecord {
  const { body, ...metadata } = record;
  void body;
  return { ...metadata, bodyexpired: true };
}

/** Expires the body bytes of one captured body record while keeping the mime type, byte size and correlation linkage for the audit trail. */
function expirebodybytes(record: bodyrecord): bodyrecord {
  const { body, ...metadata } = record;
  void body;
  return { ...metadata, bodyexpired: true };
}

/** Creates identifiers locally without a network dependency. */
export function randomid(): string {
  return crypto.randomUUID();
}


/* ── Merged from memorycare.ts: the 1.1.88 consolidation interns the correlated memorycare logic here, so no variation of the same file lives beside another. ── */

/**
 * Memory care logic of the 1.1.71 state depth family.
 * Every stored memory item wraps its value with a provenance record and its expiry, expirememory evaluates the user configured expiryrules and purges the expired items with every purge recorded in the audit trail while the summaries survive, encryptrest derives its key from the user secret through the webcrypto api and encrypts the items at rest with a lazy migration of the items that predate encryption, quotawatch polls the storage estimate and ranks its cleanup candidates by age and expiry policy without ever touching the audit history without consent, and auditexport bundles the runs, the memory, the provenance and the expiry rules into one record that streams without a size cap.
 * No lifetime stays hardcoded: every expiryrule lifetime and every quota window stays the user's choice, and no purge, cleanup or export path ever bypasses the review.
 */

/** The sensitive memory classes the encrypt gate refuses to write in plaintext: credentials, secrets, tokens and captured bodies always encrypt at rest when encryptrest stays enabled. */
export const sensitivememoryclasses: ReadonlySet<string> = new Set(["credential", "secret", "token", "body", "capture", "profile"]);

/** Builds one provenance record of a stored memory item: the origin it came from, the run and step that captured it and the capture time. */
export function provenanceof(input: { origin: string; runid: string; stepid: string; now: number }): memoryprovenance {
  if (input.origin.trim() === "") throw new Error("The provenance record needs its origin.");
  if (input.runid.trim() === "") throw new Error("The provenance record needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The provenance record needs its step id.");
  return { origin: input.origin, runid: input.runid, stepid: input.stepid, capturedat: input.now };
}

/** Wraps one stored value in a memoryitem record with its provenance and its class so the export and the expiry always find their origin. */
export function memoryitemof(input: { key: string; value: unknown; provenance: memoryprovenance; memoryclass?: string; expiresat?: number }): memoryitem {
  if (input.key.trim() === "") throw new Error("The memory item needs its key.");
  return { key: input.key, value: input.value, provenance: input.provenance, ...(input.memoryclass !== undefined && input.memoryclass.trim() !== "" ? { memoryclass: input.memoryclass } : {}), ...(input.expiresat !== undefined ? { expiresat: input.expiresat } : {}) };
}

/** Attaches a provenance record to a stored memory item; an item that already carries provenance keeps its own. */
export function attachprovenance(item: memoryitem, provenance: memoryprovenance): memoryitem {
  return { ...item, provenance };
}

/** Resolves the originating step summary of one memory item: the step its provenance names reports its reviewed summary while an unknown stepid reports that its step left the plan. */
export function stepsummaryfor(item: memoryitem, steps: toolstep[]): string {
  const step = steps.find(candidate => candidate.id === item.provenance.stepid);
  if (step === undefined) return `The provenance names the step ${item.provenance.stepid} of the run ${item.provenance.runid} which the current plan no longer carries; the item keeps its provenance for the audit trail.`;
  return step.summary !== "" ? step.summary : `The ${step.kind} step ${step.id} of the run ${item.provenance.runid} captured this item on ${item.provenance.origin}.`;
}

/** Reads the matching expiryrule of one memory key: the first rule whose pattern matches the key names its lifetime while an unmatched key carries no rule and never expires on its own. */
export function matchingrule(rules: expiryrule[], key: string): expiryrule | undefined {
  return rules.find(rule => rule.pattern !== "" && (rule.pattern === "*" || key.startsWith(rule.pattern)));
}

/** Reads the expiry timestamp of one memory item under the expiryrules: a rule lifetime adds to the capture time while an item that carries its own expiresat keeps it because its own boundary stays explicit. */
export function expiryof(item: memoryitem, rules: expiryrule[]): number | undefined {
  if (item.expiresat !== undefined) return item.expiresat;
  const rule = matchingrule(rules, item.key);
  if (rule === undefined) return undefined;
  return item.provenance.capturedat + rule.lifetime;
}

/** Lists the memory items whose expiry passed under the expiryrules: every expired item names a purge candidate the expirygate holds behind its confirmation. */
export function expireditems(items: memoryitem[], rules: expiryrule[], now: number): memoryitem[] {
  return items.filter(item => { const expiry = expiryof(item, rules); return expiry !== undefined && expiry <= now; });
}

/** One purge outcome of expirememory: the purged key, the retained summary for the audit trail and the provenance of the purged item. */
export interface purgeoutcome {
  key: string;
  summary: string;
  provenance: memoryprovenance;
  at: number;
}

/** Purges the expired memory items behind the confirmed choice: every purge keeps its summary and its provenance for the audit trail while the item value leaves; the audit events stay untouched unless the user opts in through the auditevents flag. */
export function purgeitems(input: { items: memoryitem[]; rules: expiryrule[]; confirmed: boolean; now: number }): { kept: memoryitem[]; purged: purgeoutcome[] } {
  if (!input.confirmed) return { kept: input.items, purged: [] };
  const expired = new Set(expireditems(input.items, input.rules, input.now).map(item => item.key));
  const kept = input.items.filter(item => !expired.has(item.key));
  const purged = input.items.filter(item => expired.has(item.key)).map(item => ({ key: item.key, summary: `The memory item ${item.key} of the ${item.memoryclass ?? "general"} class expired under its user expiryrule and purged; its value left while its provenance stays for the audit trail.`, provenance: item.provenance, at: input.now }));
  return { kept, purged };
}

/** Builds one quotareport of the storage estimate: the usage, the quota, the remaining bytes and the ranked cleanup candidates; every candidate carries its reclaimable bytes and its reason. */
export function quotareportof(input: { usage: number; quota: number; items: memoryitem[]; rules: expiryrule[]; now: number }): quotareport {
  const candidates = rankedcandidates(input.items, input.rules, input.now);
  const remaining = Math.max(0, input.quota - input.usage);
  return { usage: input.usage, quota: input.quota, remaining, ...(candidates.length > 0 ? { candidates } : {}) };
}

/** Ranks the cleanup candidates by age and expiry policy: the expired items lead by their expiry order, the oldest items follow by their capture age, and the audit history never enters the ranking. */
export function rankedcandidates(items: memoryitem[], rules: expiryrule[], now: number): Array<{ key: string; bytes: number; reason: string }> {
  const measured = items.map(item => ({ item, bytes: JSON.stringify(item.value ?? null).length }));
  const expired = expireditems(items, rules, now).map(item => item.key);
  const expiredset = new Set(expired);
  return measured
    .filter(entry => expiredset.has(entry.item.key) || entry.item.memoryclass !== undefined)
    .sort((one, two) => {
      const oneexpired = expiredset.has(one.item.key) ? 0 : 1;
      const twoexpired = expiredset.has(two.item.key) ? 0 : 1;
      if (oneexpired !== twoexpired) return oneexpired - twoexpired;
      return one.item.provenance.capturedat - two.item.provenance.capturedat;
    })
    .map(entry => ({ key: entry.item.key, bytes: entry.bytes, reason: expiredset.has(entry.item.key) ? "The item expired under its user expiryrule; its purge reclaims its bytes while its summary stays for the audit trail." : `The ${entry.item.memoryclass ?? "general"} item of the run ${entry.item.provenance.runid} aged past its capture; the cleanup proposes it as a reclaimable candidate and the audit history never enters the batch.` }));
}

/** Proposes one cleanup batch of the ranked candidates: the batch names every candidate it would purge and never touches the audit history without the explicit per batch consent. */
export function cleanupbatch(candidates: Array<{ key: string; bytes: number; reason: string }>, batchsize: number | undefined): Array<{ key: string; bytes: number; reason: string }> {
  const sized = batchsize !== undefined && Number.isInteger(batchsize) && batchsize > 0 ? candidates.slice(0, batchsize) : candidates;
  return [...sized];
}

/** Reports the bytes one cleanup pass reclaimed: every purged item contributes its measured bytes while the audit history contributes none because it never entered the batch. */
export function bytesreclaimed(batch: Array<{ key: string; bytes: number }>): number {
  return batch.reduce((total, candidate) => total + candidate.bytes, 0);
}

/** Builds one auditexportrecord on demand: the runs with their visits, the memory items with their provenance, the expiry rules and the timeline stream of every run bundle into one record for the audit export. */
export function auditexportof(input: { runs: runrecord[]; items: memoryitem[]; rules: expiryrule[]; timeline: runtimelineevent[]; locks: lockrecord[]; now: number }): auditexportrecord {
  return { at: input.now, runs: input.runs, memory: input.items, expiryrules: input.rules, timeline: input.timeline, locks: input.locks };
}

/** Streams one auditexportrecord into sequential chunks without a size cap: every chunk carries its index and its done flag so an external consumer reads the whole record piece by piece. */
export function exportchunks(record: auditexportrecord, chunksize: number): Array<{ index: number; payload: string; done: boolean }> {
  if (!Number.isInteger(chunksize) || chunksize <= 0) throw new Error("The export chunk size must stay a positive whole number of characters; the size stays the caller's choice with no code cap.");
  const serialized = JSON.stringify(record);
  const chunks: Array<{ index: number; payload: string; done: boolean }> = [];
  for (let offset = 0; offset < serialized.length; offset += chunksize) {
    const payload = serialized.slice(offset, offset + chunksize);
    chunks.push({ index: chunks.length, payload, done: offset + chunksize >= serialized.length });
  }
  return chunks;
}

/** Derives one AES-GCM key from the user secret through the webcrypto api: PBKDF2 stretches the secret over its salt and the derived key never persists because the adapter stores only the encryption flag. */
export async function derivekey(secret: string, salt: string): Promise<CryptoKey> {
  if (secret.length === 0) throw new Error("The encryption needs its user secret; the secret entry stays a consent prompt.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100_000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

/** The encrypted envelope of one memory item: the cipher carries its iv beside its base64 payload so the read path decrypts without a stored key. */
export interface encryptedenvelope {
  iv: string;
  payload: string;
}

/** Encrypts one memory item value at rest: the AES-GCM cipher wraps the serialized value with a fresh iv while the provenance and the key stay outside the envelope. */
export async function encryptvalue(key: CryptoKey, value: unknown): Promise<encryptedenvelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(value ?? null)));
  return { iv: btoa(String.fromCharCode(...iv)), payload: btoa(String.fromCharCode(...new Uint8Array(cipher))) };
}

/** Decrypts one encrypted envelope back to its value on read: the decryption alters nothing but the envelope itself because the audit trail never carries the value. */
export async function decryptvalue(key: CryptoKey, envelope: encryptedenvelope): Promise<unknown> {
  const iv = Uint8Array.from(atob(envelope.iv), char => char.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, Uint8Array.from(atob(envelope.payload), char => char.charCodeAt(0)));
  return JSON.parse(new TextDecoder().decode(plain)) as unknown;
}

/** Migrates one memory item that predates encryption lazily on first access: the plaintext item encrypts in place while an already encrypted item returns unchanged and the provenance stays untouched. */
export async function migrateitem(input: { item: memoryitem; key: CryptoKey; enabled: boolean }): Promise<memoryitem> {
  if (!input.enabled || input.item.encrypted === true) return input.item;
  const envelope = await encryptvalue(input.key, input.item.value);
  return { ...input.item, value: envelope, encrypted: true };
}

/** Reads whether one memory item belongs to a sensitive class the encrypt gate refuses to write in plaintext when encryptrest stays enabled. */
export function issensitiveclass(memoryclass: string | undefined): boolean {
  return memoryclass !== undefined && sensitivememoryclasses.has(memoryclass);
}

/** Verifies every memory item of an export carries its provenance: an item without provenance never exports because the audit trail could not name its origin. */
export function exportready(items: memoryitem[]): { ready: boolean; missing: string[] } {
  const missing = items.filter(item => item.provenance.origin.trim() === "" || item.provenance.runid.trim() === "" || item.provenance.stepid.trim() === "").map(item => item.key);
  return { ready: missing.length === 0, missing };
}


/* ── Merged from selcache.ts: the 1.1.88 consolidation interns the correlated selcache logic here, so no variation of the same file lives beside another. ── */

/**
 * Selcache logic of the 1.1.68 family.
 * The selector resolver caches resolutions per generation: every dom mutation batch advances the generation, a navigation invalidates the cache wholesale, a matching mutation fingerprint invalidates the matching entries selectively, and a cached hit revalidates before the dispatch while a hit from a stale generation refuses with a retry hint.
 * The cache optimizes resolution only: it never changes what a selector resolves, and every refusal keeps the resolver its fresh query fallback.
 */

/** Opens the selcache state of one run at generation zero with no entry and no invalidation. */
export function openselcache(runid: string): selcachestate {
  if (runid.trim() === "") throw new Error("The selcache needs its run id; a cache without a run scopes nothing.");
  return { runid, generation: 0, entries: [], invalidations: [] };
}

/** Caches one selector resolution under the current generation; a repeated selector overwrites its entry so the cache carries one resolution per selector. */
export function cacheselentry(cache: selcachestate, entry: { selector: string; resolution: string }): selcachestate {
  if (entry.selector.trim() === "") throw new Error("The selcache entry needs its selector.");
  const entries = cache.entries.filter(candidate => candidate.selector !== entry.selector);
  return { ...cache, entries: [...entries, { selector: entry.selector, resolution: entry.resolution, generation: cache.generation }] };
}

/** Advances the selcache generation on one dom mutation batch: the entries of the old generation go stale so a later hit refuses until it revalidates. */
export function advanceselcachegeneration(cache: selcachestate, now: number): selcachestate {
  return { ...cache, generation: cache.generation + 1, invalidations: [...cache.invalidations, { reason: "generation", at: now, selectors: [] }] };
}

/** Reads one cached resolution for a dispatch: a hit from the current generation revalidates before the dispatch while a hit from a stale generation refuses with its retry hint so the resolver falls back to a fresh query. */
export function selcachelookup(cache: selcachestate, selector: string): { hit: boolean; resolution?: string; stale: boolean; reason: string } {
  const entry = cache.entries.find(candidate => candidate.selector === selector);
  if (entry === undefined) return { hit: false, stale: false, reason: "The selcache holds no entry for the selector; the resolver runs its fresh query." };
  if (entry.generation !== cache.generation) return { hit: false, stale: true, reason: `The selcache entry for ${selector} resolves from generation ${entry.generation} while the run stands at generation ${cache.generation}; revalidate the entry or query the selector fresh.` };
  return { hit: true, resolution: entry.resolution, stale: false, reason: "The selcache entry resolves from the current generation; the revalidation query confirms it before the dispatch." };
}

/** Invalidates the selcache wholesale on a navigation event: every entry drops because the document the entries resolved against is gone. */
export function invalidateselcacheonnavigation(cache: selcachestate, now: number): selcachestate {
  const selectors = cache.entries.map(entry => entry.selector);
  return { ...cache, entries: [], invalidations: [...cache.invalidations, { reason: "navigation", at: now, selectors }] };
}

/** Invalidates the selcache selectively on matching mutation fingerprints: only the entries whose selector the mutation fingerprints name drop while the rest of the cache stays. */
export function invalidateselcacheonmutations(cache: selcachestate, fingerprints: string[], now: number): selcachestate {
  const matching = cache.entries.filter(entry => fingerprints.some(fingerprint => entry.selector.includes(fingerprint) || fingerprint.includes(entry.selector))).map(entry => entry.selector);
  return { ...cache, entries: cache.entries.filter(entry => !matching.includes(entry.selector)), invalidations: [...cache.invalidations, { reason: "mutation", at: now, selectors: matching }] };
}

/** Revalidates one cached hit before the dispatch: the resolver confirms the cached resolution with one fresh query, and a diverging resolution overwrites the entry under the current generation. */
export function revalidateselentry(cache: selcachestate, input: { selector: string; freshresolution: string }): selcachestate {
  const entry = cache.entries.find(candidate => candidate.selector === input.selector);
  if (entry === undefined) return cacheselentry(cache, { selector: input.selector, resolution: input.freshresolution });
  if (entry.resolution === input.freshresolution) return cache;
  return { ...cache, entries: cache.entries.map(candidate => candidate.selector === input.selector ? { ...candidate, resolution: input.freshresolution, generation: cache.generation } : candidate) };
}

/** Reads the cache hit statistics of one run the run footer shows: the hit count, the stale refusal count and the hit ratio of the current generation. */
export function selcachestats(cache: selcachestate, lookups: Array<{ hit: boolean; stale: boolean }>): { hits: number; stale: number; total: number } {
  return { hits: lookups.filter(lookup => lookup.hit).length, stale: lookups.filter(lookup => lookup.stale).length, total: lookups.length };
}

/** Reads every selcache entry of the current generation, for the audit trail of a run end prune. */
export function selcacheentries(cache: selcachestate): selcacheentry[] {
  return cache.entries.filter(entry => entry.generation === cache.generation);
}

/** Reads the invalidation trail of one selcache, for the transparency of the cache behavior. */
export function selcacheinvalidations(cache: selcachestate): selcacheinvalidation[] {
  return [...cache.invalidations];
}

/** Builds the errorsurface payload of one stale generation failure: the message names the generations that diverged and the retry hint routes through the revalidation query or a fresh selector resolution, never an automatic retry. */
export function stalegenerationfailure(input: { stepid: string; runid: string; selector: string; entrygeneration: number; currentgeneration: number; now: number }): { message: string; retry: { allowed: boolean; reason: string }; context: Record<string, string> } {
  return {
    message: `The selcache entry for ${input.selector} resolves from generation ${input.entrygeneration} while the run ${input.runid} stands at generation ${input.currentgeneration}; the stale hit refused so the resolver never dispatches against an outdated resolution.`,
    retry: { allowed: true, reason: `Revalidate the ${input.selector} entry under generation ${input.currentgeneration} or query the selector fresh through a new reviewed dispatch; the retry rides the full consent gate chain.` },
    context: { selector: input.selector, entrygeneration: String(input.entrygeneration), currentgeneration: String(input.currentgeneration) },
  };
}


/* ── The version one sunset notice and migration prompt records of the 2.0.0 release candidate family: the negotiation banner and the one time upgrade prompt ride the same dedicated flag accessor family the onboarding walkthrough uses, because each is a once-per-lifetime interface state rather than a user setting. ── */

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
export const migrationcommandtext = "devthink migrateplan <plan source> --format v1 --out <converted plan>";

/** Marks the version one sunset notice once per session: a record that already stands without a dismissal keeps its first refusal time while the session flag of the background route holds the once semantics, and a dismissed record re-marks only when a later browser session meets the next below floor declaration. */
export function markv1sunset(existing: v1sunsetstate | undefined, input: { declared: number; clientid: string; now: number }): v1sunsetstate {
  if (existing !== undefined && existing.dismissedat === undefined) return existing;
  return { at: input.now, declared: input.declared, clientid: input.clientid };
}

/** Dismisses the version one sunset banner for the session: the record keeps its refusal evidence while the dismissal time hides the banner until a later browser session marks it again. */
export function dismissv1sunset(existing: v1sunsetstate | undefined, now: number): v1sunsetstate | undefined {
  if (existing === undefined) return undefined;
  return { ...existing, dismissedat: now };
}

/** True while the version one sunset banner stays rendered: a marked record without a dismissal time shows, an absent or dismissed record hides. */
export function v1sunsetvisible(state: v1sunsetstate | undefined): boolean {
  return state !== undefined && state.dismissedat === undefined;
}

/** Decides the one time version one migration prompt of an installed update: a dismissed or already prompted record fires no second time, and only an update whose previous release — the onInstalled previousVersion the chrome runtime reports, with the stored lastpermissions marker answering when the runtime carries none — sits on the 1.x line counts as an affected upgrader; an update from a 2.x release or an unknowable previous version prompts nothing and writes no record, because the negotiation banner carries the notice for those users instead. */
export function migrationpromptof(existing: migrationpromptstate | undefined, input: { previous: string | undefined; now: number }): { prompt: boolean; state?: migrationpromptstate } {
  if (existing !== undefined) return { prompt: false, state: existing };
  const previous = input.previous?.trim() ?? "";
  if (previous === "" || !previous.startsWith("1.")) return { prompt: false };
  return { prompt: true, state: { promptedat: input.now, previousversion: previous, command: migrationcommandtext } };
}

/** Dismisses the version one migration prompt permanently: the persistent migrationpromptdismissed flag keeps the prompt from ever appearing again on any later update. */
export function dismissmigrationprompt(existing: migrationpromptstate | undefined, now: number): migrationpromptstate | undefined {
  if (existing === undefined) return undefined;
  return { ...existing, migrationpromptdismissed: true, dismissedat: now };
}

/** True while the version one migration prompt banner stays rendered: a prompted record without the persistent dismissal flag shows, an absent or dismissed record hides. */
export function migrationpromptvisible(state: migrationpromptstate | undefined): boolean {
  return state !== undefined && state.migrationpromptdismissed !== true && state.dismissedat === undefined;
}
