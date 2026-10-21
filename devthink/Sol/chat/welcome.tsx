/**
 * welcome.tsx — the empty state in the reference grammar (the zcode
 * draft): a quiet time-of-day greeting at the reading weight (never the
 * marketing display), the honest gateway sub line, and the suggestion
 * chips — a horizontal row of compact outline chips (icon + label, the
 * waterfall stagger), the zcode shape — replacing the card grid the old
 * surface carried. Clicking a chip sends its prompt and migrates the page
 * from the hero layout into the thread (the fade lives in chat.tsx).
 */
import {
  CodeRegular as Braces,
  LightbulbRegular as BrainCircuit,
  type FluentIcon as LucideIcon,
  MicroscopeRegular as Telescope,
} from "@fluentui/react-icons";
import { GATEWAY_MODEL } from "../../chatstate.ts";

/** the model line of the hero sub: the gateway meta-model name */
const GATEWAY_MODEL_LABEL = `sol ${GATEWAY_MODEL}`;

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

/** Welcome — the hero of the empty chat: the greeting, the honest sub,
 * the suggestion chip row. */
export function Welcome({ onPick, gatewayRegistered }: { onPick: (text: string) => void; gatewayRegistered: boolean }) {
  return (
    <div className="dtc-welcome">
      <h1 className="dtc-welcome__greet">{greeting()}</h1>
      <p className="dtc-welcome__sub">
        {GATEWAY_MODEL_LABEL} {gatewayRegistered ? "gateway on" : "gateway off"}
      </p>

      <div className="dtc-suggest">
        {SUGGESTIONS.map((s, index) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              className="dtc-suggest__chip"
              style={{ animationDelay: `${index * 65}ms` }}
              onClick={() => onPick(s.prompt)}
              aria-label={`Start with ${s.label}`}
            >
              <Icon fontSize={15} aria-hidden="true" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
