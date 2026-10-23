/**
 * accentrow.tsx — the accent color row of the Colors card: the eight calm
 * windows tones of the personalstore table as round swatches, the selected
 * one wearing the ring. The choice persists through the house localStorage
 * pattern and lands on the --personal-accent token every windows accent
 * variable of the shell reads — switches, pills, focus rings and the
 * taskbar indicators repaint with it. Loose component of the settings
 * page, riding the dtw kit.
 */
import { useState } from "react";
import { copy } from "../../copy";
import { ACCENTS, loadAccent, saveAccent, type AccentId } from "./settings.personalstore";

/** AccentRow — the swatch row of the Colors card. */
export function AccentRow() {
  const [accent, setAccent] = useState<AccentId | null>(() => loadAccent());

  function choose(id: AccentId) {
    setAccent(id);
    saveAccent(id);
  }

  return (
    <div className="dtw-settings__accents" role="radiogroup" aria-label={copy("settings.personal.accent")}>
      {ACCENTS.map((option) => {
        const selected = option.id === accent;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className="dtw-settings__accentdot"
            data-selected={selected ? "true" : undefined}
            style={{ background: option.hex }}
            title={copy(`settings.accent.${option.id}`)}
            aria-label={copy(`settings.accent.${option.id}`)}
            onClick={() => choose(option.id)}
          />
        );
      })}
    </div>
  );
}
