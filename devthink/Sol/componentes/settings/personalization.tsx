/**
 * personalization.tsx — the Personalization page of the Windows 11
 * settings shell: the Background card (the wallpaper picker), the Colors
 * card (the light/dark mode and the accent row), the Navbar position card
 * (the queued taskbar feature), the Component options card (the alt-tab
 * entrance, the taskbar tooltips, the desktop rail and the interface
 * zoom) and the Language card. Every choice is real: each control
 * persists through the house channel (the personalstore localStorage
 * pattern or the preference machine) and repaints the os through the same
 * css variables the shell already reads. Loose component of the settings
 * page, riding the dtw kit.
 */
import { ColorRegular, ImageRegular, PersonRegular, WindowRegular } from "@fluentui/react-icons";
import { copy } from "../../../copy";
import { AccentRow } from "./accentrow";
import { BackgroundPicker } from "./backgroundpicker";
import { ComponentOptions } from "./componentoptions";
import { LanguageCard } from "./languagecard";
import { NavbarPositionControl } from "./navbarposition";
import { saveThemeMirror } from "./personalstore";
import type { PreferenceKey, SettingsSnapshot } from "./settingstypes";

type PersonalizationProps = {
  /** the preference machine rows the mode, the rail and the zoom ride */
  preferences: SettingsSnapshot["preferences"];
  /** saves one preference through the browser store + gateway machine */
  save: (key: PreferenceKey, value: string) => void;
};

/** the two ladder choices of the Colors card. */
const MODES: readonly ("dark" | "light")[] = ["light", "dark"];

/** Personalization — the personalization category body. */
export function Personalization({ preferences, save }: PersonalizationProps) {
  const mode = preferences.theme === "light" ? "light" : "dark";

  function chooseMode(next: "dark" | "light") {
    // the preference machine owns the truth (the panel and the gateway
    // read it); the mirror paints the ladder before it answers
    save("theme", next);
    saveThemeMirror(next);
  }

  return (
    <>
      <section className="dtw-card" aria-label={copy("settings.personal.background")}>
        <h2 className="dtw-cardtitle">
          <ImageRegular fontSize={15} aria-hidden="true" />
          {copy("settings.personal.background")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.personal.background.desc")}</p>
        <BackgroundPicker />
      </section>

      <section className="dtw-card" aria-label={copy("settings.personal.colors")}>
        <h2 className="dtw-cardtitle">
          <ColorRegular fontSize={15} aria-hidden="true" />
          {copy("settings.personal.colors")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.personal.colors.desc")}</p>
        <div className="dtw-settings__field">
          <span className="dtw-settings__fieldlabel">
            <strong>{copy("settings.personal.mode")}</strong>
          </span>
          <div className="dtw-settings__segmented" role="radiogroup" aria-label={copy("settings.personal.mode")}>
            {MODES.map((option) => {
              const selected = option === mode;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className="dtw-settings__segment"
                  data-selected={selected ? "true" : undefined}
                  onClick={() => chooseMode(option)}
                >
                  {copy(`settings.personal.mode.${option}`)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="dtw-settings__field">
          <span className="dtw-settings__fieldlabel">
            <strong>{copy("settings.personal.accent")}</strong>
          </span>
          <AccentRow />
        </div>
      </section>

      <section className="dtw-card" aria-label={copy("settings.personal.navbar")}>
        <h2 className="dtw-cardtitle">
          <WindowRegular fontSize={15} aria-hidden="true" />
          {copy("settings.personal.navbar")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.personal.navbar.desc")}</p>
        <div className="dtw-settings__field">
          <span className="dtw-settings__fieldlabel">
            <strong>{copy("settings.personal.navbar")}</strong>
          </span>
          <NavbarPositionControl />
        </div>
      </section>

      <section className="dtw-card" aria-label={copy("settings.personal.components")}>
        <h2 className="dtw-cardtitle">
          <PersonRegular fontSize={15} aria-hidden="true" />
          {copy("settings.personal.components")}
        </h2>
        <p className="dtw-settings__carddesc">{copy("settings.personal.components.desc")}</p>
        <ComponentOptions preferences={preferences} save={save} />
      </section>

      <LanguageCard />
    </>
  );
}
