/**
 * GENERATED FILE — the terminal face of Sol/wingets/ShellKbd.tsx.
 * emitter: devthink/buildterminal.ts (the tsx→terminal conversion of wave
 * 2-c / PR11): the same design, the same tokens, the cell as the unit. The
 * prop slots the web widget answers survive verbatim (`string`, `string`) — the
 * interactivity contract rides the conversion. Regenerate with
 * `node buildterminal.ts` — never edit by hand.
 */
import { render, type IrNode, type RenderOptions } from "./runtimeterminal.ts";

const ir: IrNode = {
  "kind": "box",
  "direction": "row",
  "gap": 1,
  "children": [
    {
      "kind": "map",
      "slot": "keys",
      "item": "key",
      "gap": 1,
      "child": {
        "kind": "text",
        "item": "key",
        "deco": "bracket"
      }
    }
  ]
};

export type KbdTerminalProps = Record<string, unknown>;

/** renders the Sol/wingets/ShellKbd.tsx face into terminal rows (ANSI, headless) */
export function KbdTerminal(props: KbdTerminalProps = {}, options: RenderOptions = {}): string {
  return render(ir, props, options);
}
