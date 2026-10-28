/**
 * StageStepper.tsx — the loose component that draws the studio stage bar:
 * one key per stage of stages.ts, in the owner's fixed order, with the
 * Windows indicator law on every key (::after — a 3px bar that opens 0 → 6px
 * on hover and fills 12px on the active stage on the windows accent). A key
 * press hands the stage id to the page, which scrolls its section into view;
 * the stepper owns no scrolling of its own.
 */

import { label } from "../../labels.ts";
import { STUDIO_STAGES, type StageId } from "../../stages.ts";

/** The props of the stage bar. */
type StageStepperProps = {
  /** The id of the stage the page currently shows. */
  active: StageId;
  /** The stage hand-off (the page scrolls and remembers). */
  onSelect: (id: StageId) => void;
};

/**
 * StageStepper — the stage bar of the studio content.
 *
 * @param props the active stage and the select hand-off.
 * @returns the stepper element.
 */
export function StageStepper({ active, onSelect }: StageStepperProps) {
  return (
    <nav className="stagebar reveal" aria-label={label("studio.stagebar.aria")}>
      {STUDIO_STAGES.map((stage) => (
        <button
          key={stage.id}
          type="button"
          className="stage-step"
          data-active={stage.id === active ? "true" : undefined}
          aria-current={stage.id === active ? "step" : undefined}
          title={stage.hint}
          onClick={() => onSelect(stage.id)}
        >
          {stage.label}
        </button>
      ))}
    </nav>
  );
}

export default StageStepper;
