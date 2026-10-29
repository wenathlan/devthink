/**
 * backgroundpicker.tsx — the wallpaper picker of the Personalization page:
 * every wallpaper the desktop, the lock screen and the boot face can paint
 * (the WALLPAPERS table of personalstore.ts, the same --wall-fallback
 * channel the shell reads) offered as visual thumbnails with the name
 * under each. The choice persists through the house localStorage pattern
 * and paints immediately — the desktop and the lock screen honor it. Loose
 * component of the settings page, riding the dtw kit.
 */
import { CheckmarkRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { copy } from "../../copy";
import { WALLPAPERS, loadWallpaper, saveWallpaper, type WallpaperId } from "../../personalstore.ts";

/** BackgroundPicker — the thumbnail grid of the Background card. */
export function BackgroundPicker() {
  const [wallpaper, setWallpaper] = useState<WallpaperId>(() => loadWallpaper());

  function choose(id: WallpaperId) {
    setWallpaper(id);
    saveWallpaper(id);
  }

  return (
    <div className="dtw-settings__wallgrid" role="radiogroup" aria-label={copy("settings.personal.background")}>
      {WALLPAPERS.map((option) => {
        const selected = option.id === wallpaper;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className="dtw-settings__wall"
            data-selected={selected ? "true" : undefined}
            onClick={() => choose(option.id)}
          >
            <span className="dtw-settings__wallthumb" style={{ background: option.layers }} aria-hidden="true" />
            <span className="dtw-settings__wallname">{copy(`settings.wall.${option.id}`)}</span>
            {selected ? <CheckmarkRegular fontSize={13} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </div>
  );
}
