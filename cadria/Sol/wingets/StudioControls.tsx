/**
 * controls.tsx — the RIGHT pane of the generation studio, self contained on
 * the silk law (panel-silk surface, the neutral reseed action on silk-btn,
 * the accent generate on .btn): the style picker (the 15 imagestyles names +
 * tags, preselected by styleForDescriptor and overridable by hand), the
 * square canvas presets (1080/1440), the seed field with its deterministic
 * reseed button, and the generate control with its own aria-live progress
 * line. The button family answers its eight states through sol.css: rest,
 * hover, press, focus, disabled, loading (aria-busy), success and danger.
 */

import { ArrowShuffleRegular, WandRegular } from "@fluentui/react-icons";
import type { StyleSpec } from "../../imagestyles.ts";
import { styleFingerprint } from "../../imagestyles.ts";
import { label } from "../../labels.ts";

type ControlsPaneProps = {
  styles: readonly StyleSpec[];
  selected: StyleSpec | null;
  styleName: string;
  onStyle: (name: string) => void;
  size: number;
  onSize: (px: number) => void;
  seed: string;
  onSeed: (text: string) => void;
  onReseed: () => void;
  onGenerate: () => void;
  canGenerate: boolean;
  generating: boolean;
  status: string | null;
  error: string | null;
};

/** the square canvas presets — both rungs sit on the export png ladder. */
const SIZE_PRESETS: readonly number[] = [1080, 1440];

/** The controls pane: style, size, seed, generate. */
export function ControlsPane({
  styles,
  selected,
  styleName,
  onStyle,
  size,
  onSize,
  seed,
  onSeed,
  onReseed,
  onGenerate,
  canGenerate,
  generating,
  status,
  error,
}: ControlsPaneProps) {
  return (
    <aside aria-label={label("studio.controls.paneAria")} className="panel-silk" style={{ minWidth: 0 }}>
      <p className="mono-label" style={{ margin: "0 0 10px" }}>
        {label("studio.controls.head")}
      </p>

      <div className="field" style={{ marginBottom: 14 }}>
        <label htmlFor="studio-style">{label("studio.controls.style")}</label>
        <select id="studio-style" value={styleName} onChange={(event) => onStyle(event.currentTarget.value)}>
          {styles.map((style) => (
            <option key={style.name} value={style.name}>
              {style.name} · {style.tags.slice(0, 3).join(" · ")}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <div style={{ margin: "0 0 16px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "0.82rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
            {selected.mood}
          </p>
          <div className="row row--wrap" style={{ gap: 6 }}>
            {selected.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <p className="mono-label" style={{ margin: "8px 0 0" }}>
            {label("studio.controls.fingerprint")
              .replace("{value}", styleFingerprint(selected))
              .replace("{bias}", String(selected.compositionBias.symmetry))}
          </p>
        </div>
      )}

      <fieldset
        aria-label={label("studio.controls.canvasSize")}
        style={{ border: 0, margin: "0 0 14px", padding: 0, display: "flex", gap: 6 }}
      >
        {SIZE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="chip"
            aria-pressed={size === preset ? "true" : "false"}
            onClick={() => onSize(preset)}
            style={{
              minHeight: 44,
              padding: "0 14px",
              borderRadius: "var(--radius-md)",
              borderColor: size === preset ? "var(--accent)" : undefined,
              color: size === preset ? "var(--accent)" : undefined,
            }}
          >
            {preset}²
          </button>
        ))}
      </fieldset>

      <div className="field" style={{ marginBottom: 14 }}>
        <label htmlFor="studio-seed">{label("studio.controls.seed")}</label>
        <div className="row" style={{ gap: 8 }}>
          <input
            id="studio-seed"
            type="text"
            value={seed}
            spellCheck={false}
            onChange={(event) => onSeed(event.currentTarget.value)}
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
          />
          <button
            type="button"
            className="silk-btn"
            aria-label={label("studio.controls.reseedAria")}
            data-tip={label("studio.controls.reseedTip")}
            onClick={onReseed}
            style={{ flex: "none", padding: "0 12px" }}
          >
            <ArrowShuffleRegular fontSize={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="btn"
        disabled={!canGenerate || generating}
        aria-busy={generating ? "true" : undefined}
        onClick={onGenerate}
        style={{ width: "100%" }}
      >
        <WandRegular fontSize={15} aria-hidden="true" />
        {label("studio.controls.generate")}
      </button>

      <p role="status" aria-live="polite" style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "var(--ink-2)" }}>
        {status ?? (canGenerate ? label("studio.controls.ready") : label("studio.controls.armFirst"))}
      </p>
      {error && (
        <p
          role="alert"
          style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "var(--err, #ff8f9a)", lineHeight: 1.5 }}
        >
          {error}
        </p>
      )}
    </aside>
  );
}

export default ControlsPane;
