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
import {
  CodeRegular as Braces,
  LightbulbRegular as BrainCircuit,
  type FluentIcon as LucideIcon,
  MicroscopeRegular as Telescope,
} from "@fluentui/react-icons";
import { GATEWAY_MODEL } from "../../chatstate.ts";

/** the model line of the hero sub: the gateway meta-model name */
const GATEWAY_MODEL_LABEL = `model ${GATEWAY_MODEL}`;

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
    label: "Engineering",
    copy: "Trace a failure until the weak joint shows",
    prompt: "pressure-test a provider-neutral gateway: where does the architecture break first, and what hardens it?",
  },
  {
    id: "reasoning",
    icon: BrainCircuit,
    label: "Reasoning",
    copy: "Follow the cognition step by step",
    prompt:
      "reason step by step: should a provider-neutral workbench cache provider responses locally? weigh latency, cost, staleness.",
  },
  {
    id: "decisions",
    icon: Telescope,
    label: "Decisions",
    copy: "Weigh the trade offs and decide",
    prompt:
      "self-hosting an inference gateway versus provider apis: commit to one call and name the three facts that drive it.",
  },
];

/** Welcome — the hero of the empty chat: greeting + the asymmetric capability trio. */
export function Welcome({ onPick, gatewayRegistered }: { onPick: (text: string) => void; gatewayRegistered: boolean }) {
  ensureWelcomeCss();
  return (
    <div className="dtc-welcome">
      <h1 className="dtc-hero__greet">
        <span className="dtc-hero__soft">Good day</span>
        <span className="dtc-hero__strong">
          Ask something worth <span className="dtc-hero__word">thinking</span> about
        </span>
      </h1>
      <p className="dtc-hero__sub">
        sol {GATEWAY_MODEL_LABEL} {gatewayRegistered ? "gateway on" : "gateway off"}
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
              aria-label={`Start with ${cap.label}`}
            >
              <span className="dtc-card__ico" aria-hidden="true">
                <Icon fontSize={lead ? 22 : 20} />
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
