/**
 * GENERATED FILE — the terminal face of Sol/wingets/ShellChip.tsx.
 * emitter: devthink/build.terminal.ts (the tsx→terminal conversion of wave
 * 2-c / PR11): the same design, the same tokens, the cell as the unit. The
 * prop slots the web widget answers survive verbatim (`string`, `string`) — the
 * interactivity contract rides the conversion. Regenerate with
 * `node build.terminal.ts` — never edit by hand.
 */
import { render, type IrNode, type RenderOptions } from "./runtime.ts";

const ir: IrNode = {
  "kind": "box",
  "direction": "row",
  "gap": 1,
  "deco": "paren",
  "children": [
    {
      "kind": "text",
      "slot": "children",
      "toneSlot": "tone"
    },
    {
      "kind": "text",
      "text": "×",
      "when": "onRemove"
    }
  ]
};

export type ChipTerminalProps = Record<string, unknown>;

/** renders the Sol/wingets/ShellChip.tsx face into terminal rows (ANSI, headless) */
export function ChipTerminal(props: ChipTerminalProps = {}, options: RenderOptions = {}): string {
  return render(ir, props, options);
}
