/**
 * languagecard.tsx — the Language card of the Personalization page: the
 * display preference of the machine, native names per the windows grammar.
 * The authored surface is english and the picker persists the choice on
 * the machine profile — zero external lanes, zero infra copy. The picker
 * itself rides the notranslate wall and never becomes its own subject.
 * Loose component of the settings page, riding the dtw kit.
 *
 * @db the language ladder seats in the platform.languages rows served via
 * devthink/catalog.ts (the paired database over the catalog seam; the
 * reviewed seedcatalog.ts seeds answer the static build) — no fixed data
 * in wingets.
 */
import { LocalLanguageRegular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { copy } from "../../copy";
import { languageLadder, type LanguageRow } from "../../catalog.ts";

/** the machine profile key the preference persists under.
 *
 * @vault the migration path — data lives in the Vault engine via the internal API (@wenathlan/vault); this localStorage seat is a session cache only, never the source of truth. */
const LANGPREF = "app-lang";

const readpref = (): string => {
  try {
    return localStorage.getItem(LANGPREF) ?? "en";
  } catch {
    return "en";
  }
};

const writepref = (lang: string): void => {
  try {
    localStorage.setItem(LANGPREF, lang);
  } catch {
    /* the choice stays session only */
  }
};

/** LanguageCard — the display language card. */
export function LanguageCard() {
  const [lang, setLang] = useState(() => readpref());
  const [ladder, setLadder] = useState<LanguageRow[]>([]);

  useEffect(() => {
    void languageLadder().then(setLadder);
  }, []);

  return (
    <section className="dtw-card notranslate" aria-label={copy("settings.language.title")}>
      <h2 className="dtw-cardtitle">
        <LocalLanguageRegular fontSize={15} aria-hidden="true" />
        {copy("settings.language.title")}
      </h2>
      <div className="dtw-settings__field">
        <span className="dtw-settings__fieldlabel">
          <strong>{copy("settings.language.display")}</strong>
        </span>
        <select
          className="dtw-select"
          value={lang}
          onChange={(event) => {
            const next = event.target.value;
            setLang(next);
            writepref(next);
          }}
          aria-label={copy("settings.language.display")}
        >
          {ladder.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.native}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
