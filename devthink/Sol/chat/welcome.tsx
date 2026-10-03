/**
 * welcome.tsx — the empty state: a greeting in two voices (an attenuated
 * "Good day." over a strong Space Grotesk line with one amber word) and
 * three glass capability cards, the middle one raised per the one-raised
 * rule. Clicking a card sends its prompt and migrates the page from the
 * hero layout into the thread (the crossfade lives in chat.tsx).
 */
import { BrainCircuit, Braces, Telescope, type LucideIcon } from "lucide-react";

type Capability = {
  id: string;
  icon: LucideIcon;
  label: string;
  copy: string;
  prompt: string;
};

const CAPABILITIES: Capability[] = [
  {
    id: "engineering",
    icon: Braces,
    label: "01 · engineering",
    copy: "Trace a failure, review an approach or pressure-test an architecture until the weak joint shows.",
    prompt:
      "Pressure-test this architecture: a local gateway that normalizes OpenAI, Anthropic and Google APIs behind one endpoint. Where does it break first, and what would you harden?",
  },
  {
    id: "reasoning",
    icon: BrainCircuit,
    label: "02 · reasoning",
    copy: "Hand over a hard question and follow the internal cognition work it through, step by step.",
    prompt:
      "Reason step by step: should a provider-neutral workbench cache provider responses locally? Weigh latency, cost and staleness, then commit to a recommendation.",
  },
  {
    id: "decisions",
    icon: Telescope,
    label: "03 · decisions",
    copy: "Weigh trade-offs across real options and leave with a call, not a data dump.",
    prompt:
      "Compare self-hosting an inference gateway against calling provider APIs directly. Give me a decision with the three facts that drive it.",
  },
];

/** Welcome — the hero of the empty chat: greeting + capability cards. */
export function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="dtc-welcome">
      <h1 className="dtc-hero__greet">
        <span className="dtc-hero__soft">Good day.</span>
        <span className="dtc-hero__strong">
          Ask something worth <span className="dtc-hero__word">thinking</span> about.
        </span>
      </h1>
      <p className="dtc-hero__sub">sol · model devthink · local gateway · nothing leaves this device</p>

      <div className="dtc-cards">
        {CAPABILITIES.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <button
              key={cap.id}
              type="button"
              className={i === 1 ? "dtc-card dtc-card--raised" : "dtc-card"}
              onClick={() => onPick(cap.prompt)}
              aria-label={`Start with ${cap.label} — ${cap.copy}`}
            >
              <span className="dtc-card__ico" aria-hidden="true">
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <p className="dtc-card__txt">{cap.copy}</p>
              <span className="dtc-card__tag">{cap.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
