/**
 * welcome.tsx — the empty state: a greeting in two voices (an attenuated
 * "Good day." over a strong Space Grotesk line with the amber word) and
 * three flat win11 capability cells (8px corners, dark hairline, hover
 * wash + 2px lift, 60ms stagger — no raised card, no glass). The sub line
 * reads the gateway opt-in honestly: without a registration it says so
 * instead of implying a local gateway. Clicking a cell sends its prompt
 * and migrates the page from the hero layout into the thread (the fade
 * lives in chat.tsx).
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

/** Welcome — the hero of the empty chat: greeting + win11 capability cells. */
export function Welcome({ onPick, gatewayRegistered }: { onPick: (text: string) => void; gatewayRegistered: boolean }) {
  return (
    <div className="dtc-welcome">
      <h1 className="dtc-hero__greet">
        <span className="dtc-hero__soft">Good day.</span>
        <span className="dtc-hero__strong">
          Ask something worth <span className="dtc-hero__word">thinking</span> about.
        </span>
      </h1>
      <p className="dtc-hero__sub">
        sol · model devthink ·{" "}
        {gatewayRegistered ? "answers via your registered gateway" : "no gateway registered — register one to start"}
      </p>

      <div className="dtc-cards">
        {CAPABILITIES.map((cap) => {
          const Icon = cap.icon;
          return (
            <button
              key={cap.id}
              type="button"
              className="dtc-card"
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
