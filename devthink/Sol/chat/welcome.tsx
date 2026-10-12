/**
 * welcome.tsx — the empty state: a greeting in two voices (an attenuated
 * "Good day." over a strong line with the amber word) and the capability
 * trio broken out of the uniform three-card row (the C1-04 anti-vibe-code
 * pass): one dominant lead cell spans the full width and reads horizontally
 * with a larger glyph, two compact support cells share the row below —
 * varied spans, one density shift, the same 60ms staggered entrance. The
 * sub line reads the gateway opt-in honestly: without a registration it
 * says so instead of implying a local gateway. Clicking a cell sends its
 * prompt and migrates the page from the hero layout into the thread (the
 * fade lives in chat.tsx).
 */
import { Braces, BrainCircuit, type LucideIcon, Telescope } from "lucide-react";

/** The welcome slice of the C1-04 pass: the spec grid breaks the uniform
 * card row — the lead cell spans both tracks and reads as one line, the
 * two support cells keep the compact vertical read. Layout only; the cell
 * skin (hairline, wash hover, press scale, stagger) stays in the theme
 * layer's .dtc-card rules. */
const WELCOME_CSS = `
.dtc-cards--spec { grid-template-columns: 1.35fr 1fr; }
.dtc-cards--spec .dtc-card--lead { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: 18px; padding: 20px; }
.dtc-cards--spec .dtc-card--lead .dtc-card__ico { width: 44px; height: 44px; }
.dtc-cards--spec .dtc-card--lead .dtc-card__txt { flex: 1; font-size: .88rem; }
@media (max-width: 760px) {
  .dtc-cards--spec { grid-template-columns: 1fr; }
  .dtc-cards--spec .dtc-card--lead { flex-direction: column; align-items: flex-start; }
}
`;

let welcomeCssReady = false;

/** Injects the welcome spec-grid stylesheet exactly once per document. */
function ensureWelcomeCss(): void {
  if (welcomeCssReady || typeof document === "undefined") return;
  welcomeCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-welcome", "");
  tag.textContent = WELCOME_CSS;
  document.head.appendChild(tag);
}

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

/** Welcome — the hero of the empty chat: greeting + the asymmetric capability trio. */
export function Welcome({ onPick, gatewayRegistered }: { onPick: (text: string) => void; gatewayRegistered: boolean }) {
  ensureWelcomeCss();
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

      <div className="dtc-cards dtc-cards--spec">
        {CAPABILITIES.map((cap, index) => {
          const Icon = cap.icon;
          const lead = index === 0;
          return (
            <button
              key={cap.id}
              type="button"
              className={lead ? "dtc-card dtc-card--lead" : "dtc-card"}
              onClick={() => onPick(cap.prompt)}
              aria-label={`Start with ${cap.label} — ${cap.copy}`}
            >
              <span className="dtc-card__ico" aria-hidden="true">
                <Icon size={lead ? 22 : 20} strokeWidth={1.7} />
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
