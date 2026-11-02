/**
 * GENERATED FILE — the terminal face of Sol/wingets/ShellControlshell.tsx.
 * emitter: devthink/buildterminal.ts (the tsx→terminal conversion of wave
 * 2-c / PR11): the same design, the same tokens, the cell as the unit. The
 * prop slots the web widget answers survive verbatim (`string`, `string`, `string`, `string`, `string`) — the
 * interactivity contract rides the conversion. Regenerate with
 * `node buildterminal.ts` — never edit by hand.
 */
import { render, type IrNode, type RenderOptions } from "./runtimeterminal.ts";

const ir: IrNode = {
  "kind": "box",
  "direction": "column",
  "gap": 1,
  "children": [
    {
      "kind": "chrome"
    },
    {
      "kind": "box",
      "direction": "column",
      "gap": 1,
      "padX": 4,
      "padY": 2,
      "children": [
        {
          "kind": "box",
          "direction": "column",
          "gap": 1,
          "rule": true,
          "padY": 2,
          "children": [
            {
              "kind": "text",
              "slot": "eyebrow",
              "color": [
                255,
                255,
                255
              ],
              "bold": true,
              "scale": "micro"
            },
            {
              "kind": "text",
              "slot": "title",
              "color": [
                250,
                250,
                250
              ],
              "bold": true,
              "scale": "display"
            },
            {
              "kind": "text",
              "slot": "summary",
              "color": [
                195,
                195,
                195
              ],
              "scale": "body"
            },
            {
              "kind": "text",
              "slot": "actions",
              "when": "actions"
            }
          ]
        },
        {
          "kind": "box",
          "direction": "column",
          "gap": 1,
          "children": [
            {
              "kind": "children"
            }
          ]
        }
      ]
    }
  ]
};

export type ControlShellTerminalProps = Record<string, unknown>;

/** renders the Sol/wingets/ShellControlshell.tsx face into terminal rows (ANSI, headless) */
export function ControlShellTerminal(props: ControlShellTerminalProps = {}, options: RenderOptions = {}): string {
  return render(ir, props, options);
}
