/**
 * onboarding.tsx — the first-run steps of the APPLICATION, made functional
 * by the design pass (task 2-b): three frames presented like a Windows 11
 * first-run window over the wallpaper — what the app IS (the honest role:
 * the AI gateway console of the family, not an operating system — with the
 * surface list read straight from the rail map), CONNECT THE GATEWAY (the
 * origin field with the local default suggestion, saved through the one
 * chatclient door setgatewayorigin, beside the live probe button drawing
 * the five replica lanes with their statuses) and PICK YOUR START (the
 * replica, the model and the thinking level, persisted to the browser as
 * getry.chat.prefs {version, modelId, thinkingLevel} — the chat reads the
 * trio and seeds every new conversation with it). The finish and the skip
 * both mark onboardingseen through the one accessor (onboardingstate.ts —
 * seen = may skip; the flow is never forced again) and the window takes
 * the visitor to the home at "/". Frames remount on step change so the
 * 250ms window entry plays each time; reduced motion rides the stylesheet
 * hard stop. No account, no provider key: the origin pin and the start
 * prefs ride the visitor browser alone.
 */

import {
  ArrowLeftRegular,
  ArrowRightRegular,
  ArrowSyncRegular,
  ChatEmptyRegular,
  CheckmarkRegular,
  HomeRegular,
  PlugConnectedRegular,
} from "@fluentui/react-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  type DiscoveryRoute,
  DISCOVERYVERSIONS,
  discovery,
  gatewayorigin,
  setgatewayorigin,
} from "../../chatclient";
import { gatewayViewConfig, smartpoolof } from "../../gateway";
import { label, labelfill } from "../../labels";
import { markOnboardingSeen } from "../../onboardingstate.ts";
import { DEFAULTTHINKINGLEVEL } from "../../thinking";
import { BrandMark, TabBridge } from "../../wingets";
import { ModelPicker, type ModelOption, ThinkingPicker } from "../chat/Composer.tsx";
import { START_APPS } from "../shell/Shell.tsx";

/** the honest statement of the first frame, riding the copy law (labels.ts). */
const WHAT_IT_IS = label("onboarding.what.body");

/** the suggested local origin of the connect frame (the dev default). */
const LOCALORIGIN = "http://localhost:3000";

/** the localStorage seat of the start prefs (the same key the chat reads). */
const PREFSKEY = "getry.chat.prefs";

/** the three frames of the first run, in order (the label keys of the copy law). */
const STEPS = [
  { id: "app", eyebrowNo: "01", label: label("onboarding.steps.app") },
  { id: "connect", eyebrowNo: "02", label: label("onboarding.steps.connect") },
  { id: "start", eyebrowNo: "03", label: label("onboarding.steps.start") },
] as const;

/**
 * The onboarding page: a three-step first-run window — the app, the
 * gateway connection and the start pick — handing the surface to the home.
 *
 * @returns the onboarding element.
 */
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  // the connect frame: the origin field (the stored pin, the local default
  // as the suggestion), the live probe and the drawn route statuses
  const [originField, setOriginField] = useState(() => {
    const pinned = gatewayorigin();
    return pinned !== "" ? pinned : LOCALORIGIN;
  });
  const [routes, setRoutes] = useState<DiscoveryRoute[] | null>(null);
  const [probing, setProbing] = useState(false);

  // the start frame: the replica, the model and the rung riding the prefs
  const [version, setVersion] = useState("v1");
  const [modelId, setModelId] = useState("devthink");
  const [thinkingLevel, setThinkingLevel] = useState(DEFAULTTHINKINGLEVEL);
  const [saved, setSaved] = useState(false);

  /** the live probe of the five replica lanes (the chatclient door) — the
   * field the visitor sees is the truth the probe asks: the typed origin
   * pins before the discovery rides it, so a fresh field never probes the
   * stale stored pin. */
  const probe = useCallback(async () => {
    setProbing(true);
    try {
      const candidate = originField.trim();
      if (candidate && candidate !== gatewayorigin()) setgatewayorigin(candidate);
      setRoutes(await discovery(candidate || gatewayorigin()));
    } finally {
      setProbing(false);
    }
  }, [originField]);

  // entering the connect frame draws the lanes at once (the probe button
  // re-asks); a skipped probe never blocks the flow — the seed answers
  useEffect(() => {
    if (step === 1 && routes === null) void probe();
  }, [probe, routes, step]);

  /** commits the origin field — the chatclient door validates and pins it. */
  function commitorigin() {
    const accepted = setgatewayorigin(originField);
    setOriginField(accepted !== "" ? accepted : originField);
    void probe();
  }

  /** writes the start prefs to the browser (getry.chat.prefs) — the trio the
   * chat seeds every new conversation with; best effort, never a break. */
  function persistprefs() {
    try {
      window.localStorage.setItem(PREFSKEY, JSON.stringify({ version, modelId, thinkingLevel }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    } catch {
      /* the storage lane is best effort — the picks still ride this session */
    }
  }

  /** the model catalog of the picked replica: the live discovery when the
   * probe answered, the gateway registry seed otherwise (never a second
   * catalog — the same lane the chat reads). */
  const modeloptions = useMemo<ModelOption[]>(() => {
    const discovered = routes?.find((route) => route.version === version && route.status === "live");
    const pool = new Set(discovered?.meta?.rotationPool ?? smartpoolof(gatewayViewConfig, version));
    if (discovered && discovered.models.length > 0) {
      return discovered.models.map((row) => ({
        id: row.id,
        context: row.context,
        output: row.output,
        meta: row.id === "devthink",
        pool: pool.has(row.id),
      }));
    }
    const config = gatewayViewConfig.versions[version];
    if (!config) return [];
    return config.models.map((model) => ({
      id: model.id,
      context: model.context,
      output: model.maxoutput,
      meta: model.id === config.metamodel?.id,
      pool: pool.has(model.id),
    }));
  }, [routes, version]);

  /** the status one replica chip answers (the probed route, live default). */
  function routestatus(lane: string): "live" | "paused" | "error" {
    const probed = routes?.find((route) => route.version === lane);
    if (probed) return probed.status;
    return gatewayViewConfig.versions[lane]?.paused === true ? "paused" : "live";
  }

  /** picks the replica — a model the lane never serves resets to the mask. */
  function pickversion(lane: string) {
    if (routestatus(lane) === "paused") return;
    setVersion(lane);
    const config = gatewayViewConfig.versions[lane];
    const serves = (id: string): boolean => {
      const discovered = routes?.find((route) => route.version === lane && route.status === "live");
      if (discovered && discovered.models.length > 0) return discovered.models.some((row) => row.id === id);
      return config?.models.some((model) => model.id === id) === true;
    };
    if (!serves(modelId)) setModelId("devthink");
  }

  /** the hand-over: the start prefs persist, the onboarding counts as seen
   * (finish and skip alike — seen = may skip; never forced again) and the
   * window opens on the home. */
  const enterHome = useCallback(() => {
    try {
      window.localStorage.setItem(PREFSKEY, JSON.stringify({ version, modelId, thinkingLevel }));
    } catch {
      /* the storage lane is best effort — the flow never breaks on it */
    }
    markOnboardingSeen();
    navigate("/");
  }, [modelId, navigate, thinkingLevel, version]);

  /** the route chips of the connect frame: the drawn statuses of the probe. */
  const routechips = DISCOVERYVERSIONS.map((lane) => {
    const status = routestatus(lane);
    const probed = routes?.find((route) => route.version === lane);
    const tip =
      status === "paused"
        ? label("chat.route.paused")
        : status === "error"
          ? label("chat.route.error")
          : labelfill("chat.route.latency", { ms: String(probed?.latencyMs ?? 0) });
    return (
      <span key={lane} className="r3-chip" data-tip={tip}>
        <i className="chatdot" data-status={status} aria-hidden="true" />/{lane}
      </span>
    );
  });
  const livecount = routes?.filter((route) => route.status === "live").length ?? 0;

  return (
    <div className="winonboard">
      <section className="winonboard__card" aria-label={label("onboarding.aria")}>
        <header className="winonboard__head">
          <BrandMark size={18} />
          <span className="winonboard__title">{label("onboarding.title")}</span>
          <button type="button" className="winonboard__skip" onClick={enterHome}>
            {label("onboarding.skip")}
          </button>
        </header>

        <div className="winonboard__body">
          {step === 0 && (
            <article className="winonboard__step" key="what">
              <TabBridge
                label={STEPS[0].label}
                icon={<HomeRegular fontSize={13} />}
                fill="#0067c0"
                ink="#FFFFFF"
              />
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[0].eyebrowNo, step: STEPS[0].label })}
              </p>
              <h2 className="winonboard__lead font-bold-tier">{label("onboarding.what.title")}</h2>
              <p className="winonboard__lede font-thin-tier">{WHAT_IT_IS}</p>
              <ul className="winonboard__facts">
                {START_APPS.map((app) => {
                  const Icon = app.icon ?? HomeRegular;
                  return (
                    <li key={app.href} className="winonboard__fact">
                      <Icon fontSize={16} aria-hidden="true" />
                      <span>
                        <strong>{app.label}</strong> — {app.detail}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </article>
          )}
          {step === 1 && (
            <article className="winonboard__step" key="connect">
              <TabBridge
                label={STEPS[1].label}
                icon={<PlugConnectedRegular fontSize={13} />}
                fill="#0067c0"
                ink="#FFFFFF"
              />
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[1].eyebrowNo, step: STEPS[1].label })}
              </p>
              <h2 className="winonboard__lead font-bold-tier">{label("onboarding.connect.title")}</h2>
              <p className="winonboard__lede font-thin-tier">{label("onboarding.connect.body")}</p>
              <div className="winonboard__fieldrow">
                <input
                  className="chat__origin"
                  type="url"
                  spellCheck={false}
                  autoComplete="off"
                  value={originField}
                  placeholder={label("chat.origin.hint")}
                  aria-label={label("chat.origin.aria")}
                  onChange={(event) => setOriginField(event.target.value)}
                  onBlur={commitorigin}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitorigin();
                    }
                  }}
                />
                <button type="button" className="btn secondary small" onClick={() => void probe()} disabled={probing}>
                  <ArrowSyncRegular fontSize={13} aria-hidden="true" />
                  {probing ? label("onboarding.connect.probing") : label("onboarding.connect.probe")}
                </button>
              </div>
              <button type="button" className="r3-chip" onClick={() => setOriginField(LOCALORIGIN)}>
                {label("onboarding.connect.suggest")} · {LOCALORIGIN}
              </button>
              <div className="winonboard__routes">{routechips}</div>
              <p className="railmeta__foot">
                {routes === null
                  ? label("onboarding.connect.unprobed")
                  : labelfill("onboarding.connect.probed", {
                      live: String(livecount),
                      count: String(DISCOVERYVERSIONS.length),
                    })}
              </p>
            </article>
          )}
          {step === 2 && (
            <article className="winonboard__step" key="start">
              <TabBridge
                label={STEPS[2].label}
                icon={<ChatEmptyRegular fontSize={13} />}
                fill="#0067c0"
                ink="#FFFFFF"
              />
              <p className="winonboard__eyebrow">
                {labelfill("onboarding.step.eyebrow", { no: STEPS[2].eyebrowNo, step: STEPS[2].label })}
              </p>
              <h2 className="winonboard__lead font-bold-tier">{label("onboarding.start.title")}</h2>
              <p className="winonboard__lede font-thin-tier">{label("onboarding.start.body")}</p>
              <p className="railmeta__head">{label("onboarding.start.version")}</p>
              <div className="winonboard__routes">
                {DISCOVERYVERSIONS.map((lane) => (
                  <button
                    key={lane}
                    type="button"
                    className="r3-chip"
                    aria-pressed={version === lane ? "true" : "false"}
                    aria-disabled={routestatus(lane) === "paused" ? "true" : undefined}
                    data-tip={routestatus(lane) === "paused" ? label("chat.route.paused") : undefined}
                    onClick={() => pickversion(lane)}
                  >
                    <i className="chatdot" data-status={routestatus(lane)} aria-hidden="true" />/{lane}
                  </button>
                ))}
              </div>
              <div className="winonboard__pickerrow">
                <ModelPicker options={modeloptions} modelId={modelId} onPick={setModelId} up />
                <ThinkingPicker level={thinkingLevel} onPick={setThinkingLevel} />
              </div>
              <div className="winonboard__saverow">
                <button type="button" className="btn secondary small" onClick={persistprefs}>
                  <CheckmarkRegular fontSize={13} aria-hidden="true" />
                  {label("onboarding.start.version")} · {version} · {modelId} · {thinkingLevel}
                </button>
                {saved ? (
                  <p className="winonboard__saved">
                    <CheckmarkRegular fontSize={12} aria-hidden="true" />
                    {label("onboarding.start.saved")}
                  </p>
                ) : null}
              </div>
            </article>
          )}
        </div>

        <footer className="winonboard__foot">
          <div className="winonboard__ladder" aria-hidden="true">
            {STEPS.map((frame, index) => (
              <span key={frame.id} className="winonboard__segrun" data-active={index === step ? "true" : undefined} />
            ))}
          </div>
          <div className="winonboard__actions">
            {step > 0 && (
              <button type="button" className="winonboard__act" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeftRegular fontSize={14} aria-hidden="true" />
                {label("onboarding.back")}
              </button>
            )}
            {last ? (
              <button type="button" className="winonboard__act winonboard__act--primary" onClick={enterHome}>
                {label("onboarding.enterCta")}
                <ArrowRightRegular fontSize={14} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="winonboard__act winonboard__act--primary"
                onClick={() => {
                  if (step === 1) commitorigin();
                  setStep((value) => value + 1);
                }}
              >
                {label("onboarding.continue")}
                <ArrowRightRegular fontSize={14} aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
