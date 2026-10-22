/**
 * languagecard.tsx — the Language card of the Personalization page: the
 * GTX language ladder exactly as the old deck played it. The authored
 * surface is english and every other row rides the google gtx module
 * (translategtx.ts) with the reveal effect — the names stay native per the
 * windows grammar, so the picker itself rides the notranslate wall and
 * never becomes its own translation subject. The switch rides setlanguage:
 * the module persists, rewalks the body and arms the observer itself.
 * Loose component of the settings page, riding the dtw kit.
 */
import { LocalLanguageRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { copy } from "../../../copy";
import { currentlang } from "../../../translategtx.ts";
import { setlanguage } from "../../../translatedom.ts";

/** the GTX language ladder, native names per the windows grammar. */
const LANGUAGES: readonly { code: string; native: string }[] = [
  { code: "en", native: "English (United States)" },
  { code: "pt", native: "Português (Brasil)" },
  { code: "es", native: "Español (España)" },
  { code: "fr", native: "Français (France)" },
  { code: "de", native: "Deutsch (Deutschland)" },
  { code: "it", native: "Italiano (Italia)" },
  { code: "ja", native: "日本語 (日本)" },
  { code: "ko", native: "한국어 (대한민국)" },
  { code: "zh-CN", native: "中文 (简体，中国)" },
  { code: "ru", native: "Русский (Россия)" },
  { code: "ar", native: "العربية" },
  { code: "hi", native: "हिन्दी (भारत)" },
];

/** LanguageCard — the display language card. */
export function LanguageCard() {
  const [lang, setLang] = useState(() => currentlang());

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
            void setlanguage(next);
          }}
          aria-label={copy("settings.language.display")}
        >
          {LANGUAGES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.native}
            </option>
          ))}
        </select>
      </div>
      <div className="dtw-settings__kv">
        <span className="dtw-settings__kvkey">module</span>
        <span className="dtw-settings__kvvalue">google gtx — translategtx</span>
      </div>
      <div className="dtw-settings__kv">
        <span className="dtw-settings__kvkey">surface</span>
        <span className="dtw-settings__kvvalue">authored english, translated live</span>
      </div>
    </section>
  );
}
