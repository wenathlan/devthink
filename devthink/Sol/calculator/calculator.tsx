/**
 * calculator page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it mounts
 * the page surface and stays the binding target of the window registry
 * (Sol/wingets/PanelWorkspace.tsx) and the route table (Sol/Sol.tsx). Only
 * the theme anchor and the window registry consume this file.
 *
 * The honest face law of the family: the calculator is not one of the
 * eleven officials, so the page answers the in-construction face — the
 * owner's word was literal (the internal apps that are not an official's
 * surface say they are in construction; a ready-made calculator library
 * lands the day the real app wakes, not now). Nothing is deleted by the
 * swap: the pure arithmetic core (calculator.ts at the app root), the
 * loose components (the display, the keypad, the history) and the
 * calculator copy rows stay in the tree exactly where they were — the
 * instrument returns mounted on them the day the library wave builds the
 * real app. The route and the window binding never move.
 */
import { ShellChrome } from "@/wingets/Shellchrome";
import { osAppLabels } from "../../catalog";
import { Constructionface } from "../wingets";

/** the window title rides the catalog label row, never a hardcoded literal
 * (the bare id keeps the heading honest if the row is missing). */
const CALCULATOR_LABEL = osAppLabels().calculator;

/** The calculator page: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route — both doors answer the one construction face. */
export default function Calculator({ embedded }: { embedded?: boolean }) {
  return (
    <main
      className="dtw-app dtw-calc"
      style={embedded ? { height: "100%", overflow: "auto" } : undefined}
    >
      {!embedded && <ShellChrome />}
      <div className="dtw-content">
        <h1 className="dtw-title">{CALCULATOR_LABEL?.name ?? "Calculator"}</h1>
        <Constructionface
          accent="#9aa7b4"
          title={CALCULATOR_LABEL?.name ?? "Calculator"}
        />
      </div>
    </main>
  );
}
