// # stages — the studio stage table of debonair (root layer): the six stages
// the studio page rides, in the owner's fixed order (prompt → lyrics → style
// → generate → takes → mix). The stepper on the studio page reads this table
// and every section of the page answers to one stage id, so the stage bar and
// the page can never drift apart. Pure data — zero rendering, zero audio.

/** The id of one studio stage (the section the stepper scrolls to). */
export type StageId = "prompt" | "lyrics" | "style" | "generate" | "takes" | "mix";

/** One entry of the stage bar: the id, the label the stepper draws and the
 * one-line hint the section head carries. */
export interface StudioStage {
  /** The stable id the section and the stepper share. */
  id: StageId;
  /** The stepper label (lowercase, the chrome voice). */
  label: string;
  /** The hint the stage section opens with. */
  hint: string;
}

/** The six stages of the studio, in the fixed owner order. */
export const STUDIO_STAGES: readonly StudioStage[] = [
  { id: "prompt", label: "prompt", hint: "The line the take answers to." },
  { id: "lyrics", label: "lyrics", hint: "The chord sheet the harmony engine wrote." },
  { id: "style", label: "style", hint: "The genre, the pattern and the loudness law." },
  { id: "generate", label: "generate", hint: "The rendered arrangement on the transport." },
  { id: "takes", label: "takes", hint: "Every take this session rendered." },
  { id: "mix", label: "mix", hint: "The desk: faders, mutes, solos, live meters." },
];

/**
 * Finds one stage of the table by id.
 *
 * @param id the stage id.
 * @returns the stage entry, or undefined when the id is unknown.
 */
export function findStage(id: string): StudioStage | undefined {
  return STUDIO_STAGES.find((stage) => stage.id === id);
}
