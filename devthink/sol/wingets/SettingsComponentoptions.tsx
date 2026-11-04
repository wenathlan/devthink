/**
 * componentoptions.tsx — the Component options card of the Personalization
 * page: the shell behaviors this machine plays. The alt-tab entrance
 * animation, the taskbar tooltips and the devtools wall are the three
 * personalstore toggles (the stylesheet flags data-alttab-motion and
 * data-taskbar-tips on the document root; the devtools wall rides the
 * suspend seam of devtoolsguard.ts, the single wall module); the desktop
 * rail mode and the interface zoom keep riding the preference machine the
 * workbench flags always rode. Every control is a 44px row with the switch
 * in the accent color. Loose component of the settings page, riding the
 * dtw kit.
 */
import { useState } from "react";
import { copy } from "../../copy";
import {
  loadAltTabMotion,
  loadDevtoolsWall,
  loadTaskbarTips,
  saveAltTabMotion,
  saveDevtoolsWall,
  saveTaskbarTips,
} from "../../personalstore.ts";
import type { PreferenceKey, SettingsSnapshot } from "./Settingstypes";

type ComponentOptionsProps = {
  /** the preference machine rows the rail mode and the zoom ride */
  preferences: SettingsSnapshot["preferences"];
  /** saves one preference through the browser store + gateway machine */
  save: (key: PreferenceKey, value: string) => void;
};

/** one switch row: the label, the description and the accent toggle. */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="dtw-settings__field">
      <span className="dtw-settings__fieldlabel">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <label className="dtw-settings__switchrow" data-checked={checked ? "true" : undefined}>
        <input
          type="checkbox"
          className="dtw-settings__switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={label}
        />
        <span className="dtw-settings__switchtrack" aria-hidden="true">
          <span className="dtw-settings__switchthumb" />
        </span>
      </label>
    </div>
  );
}

/** ComponentOptions — the behavior card of the Personalization page. */
export function ComponentOptions({ preferences, save }: ComponentOptionsProps) {
  const [altTab, setAltTab] = useState<boolean>(() => loadAltTabMotion());
  const [tips, setTips] = useState<boolean>(() => loadTaskbarTips());
  const [devtoolsWall, setDevtoolsWall] = useState<boolean>(() => loadDevtoolsWall());

  return (
    <>
      <ToggleRow
        label={copy("settings.toggle.alttab")}
        description={copy("settings.toggle.alttab.desc")}
        checked={altTab}
        onChange={(next) => {
          setAltTab(next);
          saveAltTabMotion(next);
        }}
      />
      <ToggleRow
        label={copy("settings.toggle.tips")}
        description={copy("settings.toggle.tips.desc")}
        checked={tips}
        onChange={(next) => {
          setTips(next);
          saveTaskbarTips(next);
        }}
      />
      <ToggleRow
        label={copy("settings.toggle.devtoolswall")}
        description={copy("settings.toggle.devtoolswall.desc")}
        checked={devtoolsWall}
        onChange={(next) => {
          setDevtoolsWall(next);
          saveDevtoolsWall(next);
        }}
      />
      <div className="dtw-settings__field">
        <span className="dtw-settings__fieldlabel">
          <strong>{copy("settings.rail.title")}</strong>
        </span>
        <select
          className="dtw-settings__select"
          value={preferences.railMode}
          onChange={(event) => save("railMode", event.target.value)}
          aria-label={copy("settings.rail.title")}
        >
          <option value="always">{copy("settings.rail.always")}</option>
          <option value="auto">{copy("settings.rail.auto")}</option>
          <option value="off">{copy("settings.rail.off")}</option>
        </select>
      </div>
      <label className="dtw-settings__field">
        <span className="dtw-settings__fieldlabel">
          <strong>{copy("settings.zoom.label")}</strong>
        </span>
        <span className="dtw-settings__rangezone">
          <input
            type="range"
            className="dtw-settings__range"
            min={80}
            max={150}
            step={10}
            value={Number(preferences.interfaceZoom) || 100}
            onChange={(event) => save("interfaceZoom", event.target.value)}
            aria-label={copy("settings.zoom.label")}
          />
          <output className="dtw-settings__rangevalue">{preferences.interfaceZoom}%</output>
        </span>
      </label>
    </>
  );
}
