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
 * temporary prop rides along the sub answers "temporary chat: nothing
 * saves on this device" in place of the gateway meta-model line (the
 * spec's honest sub line law for the session that never persists) — and
 * a quiet ghost chip after the suggestion row starts the temporary
 * session, rendered only when the caller passes onTemporary (chatbody
 * owns the mode machine, so an absent handler leaves the hero as it
 * was).
 */
import {
  CodeRegular as Braces,
  LightbulbRegular as BrainCircuit,
  type FluentIcon as LucideIcon,
  MicroscopeRegular as Telescope,
} from "@fluentui/react-icons";
import { cx, GATEWAY_MODEL } from "../../chatstate.ts";

/** the model line of the hero sub: the gateway meta-model name */
const GATEWAY_MODEL_LABEL = `sol ${GATEWAY_MODEL}`;

/** the honest sub line of the temporary session: the nothing-saves
 * promise, lowercase mono voice of the default sub (the spec's
 * temporary chat law — the memory off, the device untouched). */
const TEMPORARY_SUB = "temporary chat: nothing saves on this device";

/** greeting — the time-of-day voice of the reference hero (the zcode
 * boundaries): morning until noon, afternoon until six, evening until
 * eleven, night after — honest against the visitor's clock. */
function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 23) return "Good evening";
  return "Working late";
}

type Suggestion = {
  id: string;
  icon: LucideIcon;
  label: string;
  prompt: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: "engineering",
    icon: Braces,
    label: "Trace a failure",
    prompt: "pressure-test a provider-neutral gateway: where does the architecture break first, and what hardens it?",
  },
  {
    id: "reasoning",
    icon: BrainCircuit,
    label: "Reason step by step",
    prompt:
      "reason step by step: should a provider-neutral workbench cache provider responses locally? weigh latency, cost, staleness.",
  },
  {
    id: "decisions",
    icon: Telescope,
    label: "Weigh the trade offs",
    prompt:
      "self-hosting an inference gateway versus provider apis: commit to one call and name the three facts that drive it.",
  },
];

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
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
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
  return (
    <div className="dtc-welcome">
      <h1 className="dtc-welcome__greet">{greeting()}</h1>
      <p className={cx("dtc-welcome__sub", temporary && "dtc-welcome__sub--temporary")}>
        {temporary ? TEMPORARY_SUB : `${GATEWAY_MODEL_LABEL} ${gatewayRegistered ? "gateway on" : "gateway off"}`}
      </p>

      <div className="dtc-suggest" role="group" aria-label="suggested prompts">
        {SUGGESTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              className="dtc-suggest__chip"
              onClick={() => onPick(s.prompt)}
              aria-label={`Start with ${s.label}`}
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
        <button type="button" className="dtc-welcome__ghost" onClick={onTemporary} title="nothing saves on this device">
          start a temporary chat
        </button>
      ) : null}

      {recents.length > 0 ? (
        <div className="dtc-recents">
          <p className="dtc-recents__label">Recent conversations</p>
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
