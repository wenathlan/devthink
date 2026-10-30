/**
 * pianoroll.tsx — the note editor of the studio (Sol layer): an accessible
 * grid of real buttons, one bar of the take at a time. The rows are the
 * roll's own law (the rack lanes for drums, the C2..C6 window for the tonal
 * roles), the columns are the 16 steps, and every click rides the
 * pianoroll engine — add, select, move, resize, transpose, velocity, erase —
 * so the desk never shows a note the schedule does not play. No canvas in
 * the editable grid (buttons carry the focus ring and the aria labels); the
 * engine owns the algebra, the component owns only the window and the hands.
 */

import { AddRegular, DeleteRegular, EraserRegular, PinRegular, SubtractRegular } from "@fluentui/react-icons";
import { type KeyboardEvent, useCallback, useMemo, useState } from "react";
import { type ArrangerRole, RACK_LANES, type TakePlan } from "../../arranger.ts";
import { label, labelfill } from "../../labels.ts";
import {
  addNote,
  type EditableNote,
  moveNote,
  PIANOROLL_CONSTANTS,
  quantizeNote,
  type RollWindow,
  removeNote,
  resizeNote,
  validateNotes,
} from "../../pianoroll.ts";
import type { TakeSchedule } from "../../takeevents.ts";

/** the detent ladder the velocity key cycles through (the rack's glyph law) */
const VELOCITY_LADDER: readonly number[] = Object.values(PIANOROLL_CONSTANTS.VELOCITY_STEPS);

/** the stable cell ids the grid keys on (the step number, written once — a
 * 16th of a bar is the cell's own identity, not a reordering list slot). */
const CELL_IDS: readonly string[] = Array.from(
  { length: PIANOROLL_CONSTANTS.STEPS_PER_BAR },
  (_, index) => `cell-${index}`,
);

type RollProps = {
  /** the plan the roll edits against (bars, grid, lanes). */
  plan: TakePlan;
  /** the schedule the roll opened on (the seeded or rebased one). */
  schedule: TakeSchedule;
  /** the roll's notes (the desk owns them — the edits hand back). */
  notes: readonly EditableNote[];
  /** the edit hand-off (a whole, validated note list). */
  onChange: (notes: readonly EditableNote[]) => void;
  /** the refusal line (the page renders it). */
  onNotice: (message: string) => void;
};

/**
 * PianoRoll — the bar-windowed note editor over the pianoroll engine.
 *
 * @param props the plan, the schedule, the notes and the edit hand-offs.
 * @returns the piano roll element.
 */
export function PianoRoll({ plan, schedule, notes, onChange, onNotice }: RollProps) {
  const [role, setRole] = useState<ArrangerRole>("drums");
  const [bar, setBar] = useState(0);
  const [erase, setErase] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const window: RollWindow = useMemo(() => ({ fromBar: bar, bars: 1 }), [bar]);
  /** the rows the role draws (drums ride the rack lanes, tonal the C2..C6 window). */
  const rows = useMemo(() => {
    if (role === "drums") return RACK_LANES.map((lane, index) => ({ label: lane, midi: index }));
    const out: { label: string; midi: number }[] = [];
    for (let midi = PIANOROLL_CONSTANTS.NOTE_MAX; midi >= PIANOROLL_CONSTANTS.NOTE_MIN; midi--) {
      out.push({ label: midiName(midi), midi });
    }
    return out;
  }, [role]);

  /** the bar's own notes for the current role (the grid reads them per cell). */
  const barNotes = useMemo(() => notes.filter((note) => note.role === role && note.bar === bar), [notes, role, bar]);
  const problems = useMemo(() => validateNotes(notes, plan), [notes, plan]);
  const selected = notes.find((note) => note.id === selectedId && note.role === role) ?? null;

  /** wraps one engine call: the refusal names itself, the desk never lies. */
  const apply = useCallback(
    (next: readonly EditableNote[], pickedId?: string): void => {
      onChange(next);
      if (pickedId !== undefined) setSelectedId(pickedId);
    },
    [onChange],
  );

  const onCellClick = useCallback(
    (midi: number, rowLabel: string, step: number): void => {
      const holder = barNotes.find(
        (note) =>
          note.step <= step &&
          step < note.step + note.steps &&
          (role === "drums" ? note.midi === midi : note.midi === midi),
      );
      if (holder) {
        if (erase && holder.step === step) {
          apply(removeNote(notes, holder.id));
          if (selectedId === holder.id) setSelectedId("");
          return;
        }
        setSelectedId(holder.id);
        return;
      }
      try {
        const next = addNote(
          notes,
          role === "drums"
            ? { role, lane: rowLabel, bar, step, velocity: PIANOROLL_CONSTANTS.VELOCITY_STEPS.hard }
            : { role, midi, bar, step, velocity: PIANOROLL_CONSTANTS.VELOCITY_STEPS.hard },
          window,
          plan,
        );
        const added = next.find(
          (note) => note.bar === bar && note.step === step && note.midi === midi && note.role === role,
        );
        apply(next, added?.id);
      } catch (error) {
        onNotice(error instanceof Error ? error.message : label("studio.roll.refusedNote"));
      }
    },
    [apply, bar, barNotes, erase, notes, onNotice, plan, role, selectedId, window],
  );

  /** transpose = remove + re-add at the new row (the engine keeps the algebra; the row is the id's own field). */
  const transpose = useCallback(
    (delta: number): void => {
      if (!selected) {
        onNotice(label("studio.roll.selectTranspose"));
        return;
      }
      const midi = selected.midi + delta;
      if (midi < PIANOROLL_CONSTANTS.NOTE_MIN || midi > PIANOROLL_CONSTANTS.NOTE_MAX) {
        onNotice(label("studio.roll.windowLeft"));
        return;
      }
      try {
        const rest = removeNote(notes, selected.id);
        const next = addNote(
          rest,
          role === "drums"
            ? {
                role,
                lane: RACK_LANES[midi],
                bar: selected.bar,
                step: selected.step,
                steps: selected.steps,
                velocity: selected.velocity,
              }
            : {
                role,
                midi,
                bar: selected.bar,
                step: selected.step,
                steps: selected.steps,
                velocity: selected.velocity,
              },
          window,
          plan,
        );
        const added = next.find(
          (note) =>
            note.bar === selected.bar && note.step === selected.step && note.midi === midi && note.role === role,
        );
        apply(next, added?.id);
      } catch (error) {
        onNotice(error instanceof Error ? error.message : label("studio.roll.refusedMove"));
      }
    },
    [apply, notes, onNotice, plan, role, selected, window],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (!selected) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        try {
          apply(moveNote(notes, selected.id, event.key === "ArrowLeft" ? -1 : 1, window, plan));
        } catch (error) {
          onNotice(error instanceof Error ? error.message : label("studio.roll.refusedMove"));
        }
      }
    },
    [apply, notes, onNotice, plan, selected, window],
  );

  const velocityCycle = useCallback((): void => {
    if (!selected) {
      onNotice(label("studio.roll.selectVelocity"));
      return;
    }
    const index = VELOCITY_LADDER.findIndex((value) => Math.abs(value - selected.velocity) < 1e-6);
    const velocity = VELOCITY_LADDER[(index + 1) % VELOCITY_LADDER.length] ?? PIANOROLL_CONSTANTS.VELOCITY_STEPS.hard;
    try {
      const rest = removeNote(notes, selected.id);
      const next = addNote(
        rest,
        role === "drums"
          ? { role, lane: selected.lane, bar: selected.bar, step: selected.step, steps: selected.steps, velocity }
          : { role, midi: selected.midi, bar: selected.bar, step: selected.step, steps: selected.steps, velocity },
        window,
        plan,
      );
      const added = next.find(
        (note) =>
          note.bar === selected.bar && note.step === selected.step && note.midi === selected.midi && note.role === role,
      );
      apply(next, added?.id);
    } catch (error) {
      onNotice(error instanceof Error ? error.message : label("studio.roll.refusedVelocity"));
    }
  }, [apply, notes, onNotice, plan, role, selected, window]);

  return (
    <section className="roll rack-panel" aria-label={label("studio.roll.aria")}>
      <header className="roll-head">
        <h2 className="rack-title">{label("studio.roll.title")}</h2>
        <span className="rack-meta">
          {labelfill("studio.roll.meta", { bar: String(bar + 1), bars: String(plan.bars) })}
        </span>
        <div className="roll-tabs" role="tablist" aria-label={label("studio.roll.tabsAria")}>
          {(["drums", "bass", "keys", "lead"] as ArrangerRole[]).map((entry) => (
            <button
              key={entry}
              type="button"
              role="tab"
              aria-selected={role === entry}
              className={`roll-tab${role === entry ? " is-on" : ""}`}
              onClick={() => {
                setRole(entry);
                setSelectedId("");
              }}
            >
              {entry}
            </button>
          ))}
        </div>
      </header>
      <div className="roll-nav">
        <button
          className="tkey"
          type="button"
          aria-label={label("studio.roll.prevBarAria")}
          onClick={() => setBar((current) => Math.max(0, current - 1))}
          disabled={bar === 0}
        >
          <SubtractRegular className="svg" fontSize={14} aria-hidden="true" />
          {label("studio.roll.barKey")}
        </button>
        <input
          className="input roll-bar"
          type="number"
          min={1}
          max={plan.bars}
          value={bar + 1}
          onChange={(event) => {
            const next = Number(event.currentTarget.value);
            if (Number.isFinite(next)) setBar(Math.min(plan.bars - 1, Math.max(0, next - 1)));
          }}
          aria-label={label("studio.roll.barAria")}
        />
        <button
          className="tkey"
          type="button"
          aria-label={label("studio.roll.nextBarAria")}
          onClick={() => setBar((current) => Math.min(plan.bars - 1, current + 1))}
          disabled={bar >= plan.bars - 1}
        >
          <AddRegular className="svg" fontSize={14} aria-hidden="true" />
          {label("studio.roll.barKey")}
        </button>
        <button
          className="tkey"
          type="button"
          aria-label={label("studio.roll.eraseAria")}
          aria-pressed={erase}
          onClick={() => setErase((current) => !current)}
        >
          <EraserRegular className="svg" fontSize={14} aria-hidden="true" />
          {label("studio.roll.erase")}
        </button>
        {selected ? (
          <span className="roll-pick">
            <code>{selected.id}</code>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.stepBackAria")}
              onClick={() => {
                try {
                  apply(moveNote(notes, selected.id, -1, window, plan));
                } catch (error) {
                  onNotice(error instanceof Error ? error.message : label("studio.roll.refusedMove"));
                }
              }}
            >
              <SubtractRegular className="svg" fontSize={12} aria-hidden="true" />
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.stepForwardAria")}
              onClick={() => {
                try {
                  apply(moveNote(notes, selected.id, 1, window, plan));
                } catch (error) {
                  onNotice(error instanceof Error ? error.message : label("studio.roll.refusedMove"));
                }
              }}
            >
              <AddRegular className="svg" fontSize={12} aria-hidden="true" />
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.rowUpAria")}
              onClick={() => transpose(1)}
            >
              <AddRegular className="svg" fontSize={12} aria-hidden="true" />
              {label("studio.roll.rowKey")}
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.rowDownAria")}
              onClick={() => transpose(-1)}
            >
              <SubtractRegular className="svg" fontSize={12} aria-hidden="true" />
              {label("studio.roll.rowKey")}
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.shortenAria")}
              onClick={() => {
                try {
                  apply(resizeNote(notes, selected.id, selected.steps - 1, window, plan));
                } catch (error) {
                  onNotice(error instanceof Error ? error.message : label("studio.roll.refusedLength"));
                }
              }}
            >
              <SubtractRegular className="svg" fontSize={12} aria-hidden="true" />
              {label("studio.roll.lenKey")}
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.lengthenAria")}
              onClick={() => {
                try {
                  apply(resizeNote(notes, selected.id, selected.steps + 1, window, plan));
                } catch (error) {
                  onNotice(error instanceof Error ? error.message : label("studio.roll.refusedLength"));
                }
              }}
            >
              <AddRegular className="svg" fontSize={12} aria-hidden="true" />
              {label("studio.roll.lenKey")}
            </button>
            <button className="tkey" type="button" aria-label={label("studio.roll.velAria")} onClick={velocityCycle}>
              {labelfill("studio.roll.velKey", { vel: String(Math.round(selected.velocity * 100)) })}
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.quantAria")}
              onClick={() => apply(quantizeNote(notes, selected.id, 1))}
            >
              <PinRegular className="svg" fontSize={12} aria-hidden="true" />
              {label("studio.roll.quantKey")}
            </button>
            <button
              className="tkey"
              type="button"
              aria-label={label("studio.roll.deleteAria")}
              onClick={() => {
                apply(removeNote(notes, selected.id));
                setSelectedId("");
              }}
            >
              <DeleteRegular className="svg" fontSize={12} aria-hidden="true" />
            </button>
          </span>
        ) : null}
      </div>
      <div className="roll-grid">
        {rows.map((row) => (
          <div key={row.label} className="roll-row">
            <span className="roll-key">{row.label}</span>
            <div className="roll-cells">
              {Array.from({ length: PIANOROLL_CONSTANTS.STEPS_PER_BAR }, (_, step) => {
                const start = barNotes.find((note) => note.midi === row.midi && note.step === step);
                const held =
                  !start &&
                  barNotes.some((note) => note.midi === row.midi && note.step < step && step < note.step + note.steps);
                return (
                  <button
                    key={CELL_IDS[step]}
                    type="button"
                    className="roll-cell"
                    onKeyDown={onKeyDown}
                    data-on={start ? "true" : undefined}
                    data-held={held ? "true" : undefined}
                    data-beat={step % 4 === 0 ? "true" : undefined}
                    data-current={start && start.id === selectedId ? "true" : undefined}
                    aria-label={
                      start
                        ? labelfill("studio.roll.cellNote", {
                            row: row.label,
                            step: String(step + 1),
                            vel: String(Math.round(start.velocity * 100)),
                            steps: String(start.steps),
                            s: start.steps === 1 ? "" : "s",
                          })
                        : labelfill("studio.roll.cellEmpty", { row: row.label, step: String(step + 1) })
                    }
                    aria-pressed={Boolean(start)}
                    onClick={() => onCellClick(row.midi, row.label, step)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <footer className="roll-foot">
        <span>
          {labelfill("studio.roll.foot", {
            count: String(barNotes.length),
            s: barNotes.length === 1 ? "" : "s",
            total: String(schedule.events.length),
            verdict:
              problems.length === 0
                ? label("studio.roll.footValid")
                : labelfill("studio.roll.footProblems", { count: String(problems.length) }),
          })}
        </span>
      </footer>
    </section>
  );
}

/** The midi name the tonal rows carry (the octave law of the roll window). */
function midiName(midi: number): string {
  const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

export default PianoRoll;
