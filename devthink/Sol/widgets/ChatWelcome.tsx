/**
 * welcome.tsx — the empty state in the reference grammar (the zcode
 * draft): a quiet time-of-day greeting at the adaptive reading size (the
 * container-measured clamp the stylesheet owns, never the marketing
 * display), the honest gateway sub line, the suggestion chips — a
 * horizontal row of compact outline chips (icon + label, the 65ms
 * waterfall stagger and the hidden scrollbar overflow, both stylesheet
 * laws) — and the recents row resurfacing the latest conversations under
 * the chips when the caller carries them. Clicking a chip hands its
 * prompt to onPick (the caller owns the send-versus-prefill law) and the
 * migration from the hero layout into the thread lives in chat.tsx.
 *
 * the temporary pass (w4): the sub line goes variant-honest — when the
 * temporary prop rides along the sub answers the table's nothing-saves
 * promise (chatText("welcome.temporarySub")) in place of the gateway
 * meta-model line (the spec's honest sub line law for the session that
 * never persists) — and a quiet ghost chip after the suggestion row
 * starts the temporary session, rendered only when the caller passes
 * onTemporary (chatbody owns the mode machine, so an absent handler
 * leaves the hero as it was).
 *
 * the db-truth pass: every word the hero renders rides the chatlabels
 * table now — the greeting bands (chatGreetingForHour), the suggestion
 * rows (chatSuggestions), the sub lines (chatText) — while the icons
 * stay code keyed by the row id, because icons are code, not data.
 */
import {
  CodeRegular as Braces,
  LightbulbRegular as BrainCircuit,
  type FluentIcon as LucideIcon,
  MicroscopeRegular as Telescope,
} from "@fluentui/react-icons";
import { chatGreetingForHour, chatSuggestions, chatText } from "../../chatlabels.ts";
import { cx, GATEWAY_MODEL } from "../../chatstate.ts";
import { label } from "../../labels.ts";

type Suggestion = {
  id: string;
  label: string;
  prompt: string;
};

/** the icon registry of the suggestion chips — icons are code, not data
 * (the chatlabels law): the table carries the words through
 * chatSuggestions, the registry maps the fluent glyph by the row id,
 * Braces the quiet fallback of an unknown seed (never a crash on the
 * interface). */
const SUGGESTION_ICONS: Record<Suggestion["id"], LucideIcon> = {
  engineering: Braces,
  reasoning: BrainCircuit,
  decisions: Telescope,
};

/** the recent conversations row — the recents the orchestrator wires
 * later. absent prop renders nothing (the quiet-when-unknown law). */
export type RecentConversation = {
  id: string;
  title: string;
  /** the last-activity stamp — the quiet relative label of the row. */
  when: number;
};

/** relativeWhen — the compact relative label of a recents row: now,
 * minutes, hours, days, then the locale month and day (the house intl
 * law: default locale, never a hardcode). */
function relativeWhen(when: number, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - when) / 60_000));
  if (mins < 1) return label("chat.welcome.now");
  if (mins < 60) return label("chat.welcome.minutesAgo").replace("{n}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return label("chat.welcome.hoursAgo").replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  if (days < 7) return label("chat.welcome.daysAgo").replace("{n}", String(days));
  try {
    return new Date(when).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return new Date(when).toDateString();
  }
}

/** fullStamp — the honest absolute stamp for the title attribute (the
 * hover law: the full stamp on the title, the relative label on the row). */
function fullStamp(when: number): string {
  const d = new Date(when);
  try {
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d.toString();
  }
}

/** Welcome — the hero of the empty chat: the greeting, the honest sub
 * (the gateway line by default, the nothing-saves line when temporary),
 * the suggestion chip row, the temporary entry chip when the caller
 * arms it, the recents row when the data rides along. */
export function Welcome({
  onPick,
  gatewayRegistered,
  recent,
  onOpenRecent,
  temporary = false,
  onTemporary,
}: {
  onPick: (text: string) => void;
  gatewayRegistered: boolean;
  /** the recent conversations resurfaced under the chips — up to three
   * rows, nothing rendered when absent (the orchestrator wires the
   * sessions later). */
  recent?: RecentConversation[];
  /** opens a recents row — an absent prop renders the rows as quiet text. */
  onOpenRecent?: (id: string) => void;
  /** temporary mode — swaps the sub line to the honest nothing-saves
   * variant of the session that never persists. defaults false. */
  temporary?: boolean;
  /** starts a temporary chat — the ghost entry chip renders only when
   * the caller arms the handler (chatbody owns the mode machine). */
  onTemporary?: () => void;
}) {
  const recents = recent?.slice(0, 3) ?? [];
  const now = new Date();
  // the gateway meta-model line of the sub — the table template, the
  // hardcoded model name seated in it (chatText owns the words).
  const modelLine = chatText("welcome.modelLine").replace("{model}", GATEWAY_MODEL);
  return (
    <div className="dtc-welcome">
      {/* the greeting answers h2, not h1: the topbar already owns the one
       * h1 of the chat surface, so the hero joins the order under it (the
       * class carries the size — the level change is invisible). */}
      <h2 className="dtc-welcome__greet">{chatGreetingForHour(now.getHours())}</h2>
      <p className={cx("dtc-welcome__sub", temporary && "dtc-welcome__sub--temporary")}>
        {temporary
          ? chatText("welcome.temporarySub")
          : `${modelLine} ${gatewayRegistered ? label("chat.welcome.gatewayOn") : label("chat.welcome.gatewayOff")}`}
      </p>

      <div className="dtc-suggest" role="group" aria-label={label("chat.welcome.suggestedPrompts")}>
        {chatSuggestions().map((s) => {
          const Icon = SUGGESTION_ICONS[s.id] ?? Braces;
          return (
            <button
              key={s.id}
              type="button"
              className="dtc-suggest__chip"
              onClick={() => onPick(s.prompt)}
              aria-label={label("chat.welcome.startWith").replace("{prompt}", s.label)}
            >
              <Icon fontSize={15} aria-hidden="true" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* the temporary entry — the quiet ghost toggle after the row, a
       * rendered key only when the caller arms the handler. */}
      {onTemporary ? (
        <button
          type="button"
          className="dtc-welcome__ghost"
          onClick={onTemporary}
          title={label("chat.welcome.temporaryTitle")}
        >
          {label("chat.welcome.temporaryChip")}
        </button>
      ) : null}

      {recents.length > 0 ? (
        <div className="dtc-recents">
          <p className="dtc-recents__label">{label("chat.body.recentConversations")}</p>
          <ul className="dtc-recents__list">
            {recents.map((r) => (
              <li key={r.id}>
                {onOpenRecent ? (
                  <button
                    type="button"
                    className="dtc-recents__row"
                    onClick={() => onOpenRecent(r.id)}
                    title={fullStamp(r.when)}
                  >
                    <span className="dtc-recents__title">{r.title}</span>
                    <span className="dtc-recents__when">{relativeWhen(r.when)}</span>
                  </button>
                ) : (
                  <span className="dtc-recents__row" title={fullStamp(r.when)}>
                    <span className="dtc-recents__title">{r.title}</span>
                    <span className="dtc-recents__when">{relativeWhen(r.when)}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
