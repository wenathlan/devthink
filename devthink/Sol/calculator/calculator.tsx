/**
 * calculator page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the native calculator of the super
 * platform, the windows standard display and keypad with identity by
 * content. The arithmetic never lives here: the pure core rides
 * calculator.logic.ts at the app root, the display, keypad and history are
 * the loose components beside this anchor, and the keyboard answers the
 * same key actions the on-screen keys answer. */
import { Calculator as CalculatorGlyph } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyKey,
  evaluateExpression,
  formatCalculator,
  mapKeyboardKey,
  memoryAdd,
  memoryClear,
  memoryRecallExpression,
  memorySubtract,
  type CalculatorKeyAction,
} from "../../calculator.logic";
import { AutomationNote } from "@/shell/automation.note";
import { ControlShell } from "@/shell/ControlShell";
import { CalculatorDisplay } from "./calculator.display";
import { CalculatorHistory, type CalculatorHistoryRow } from "./calculator.history";
import { CalculatorKeypad, type CalculatorMemoryKey } from "./calculator.keypad";

/** how many answers the history keeps before the oldest one leaves. */
const HISTORY_LIMIT = 8;

export default function Calculator() {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<CalculatorHistoryRow[]>([]);
  const historyserial = useRef(0);

  /** Answers the expression once: the line rides the history, the display
   * shows the answer and an honest refusal shows the evaluator's reason. */
  const answerExpression = useCallback(() => {
    if (!expression) return;
    try {
      const value = evaluateExpression(expression);
      const text = formatCalculator(value);
      setAnswer(text);
      setError(null);
      historyserial.current += 1;
      const row: CalculatorHistoryRow = { id: `calc.history.${historyserial.current.toString(36)}`, line: `${expression} = ${text}` };
      setHistory((rows) => [row, ...rows].slice(0, HISTORY_LIMIT));
    } catch (cause) {
      setAnswer(null);
      setError(cause instanceof Error ? cause.message : "the expression could not be evaluated");
    }
  }, [expression]);

  /** Applies one key action: a key after an answer either rides the answer
   * into the next expression (an operator) or starts a fresh one, the way
   * the windows calculator hands one answer over to the next line. */
  const pressKey = useCallback(
    (action: CalculatorKeyAction) => {
      if (action.kind === "equals") {
        answerExpression();
        return;
      }
      if (answer) {
        setExpression(applyKey(action.kind === "operator" || action.kind === "percent" ? answer : "", action));
      } else {
        setExpression((current) => applyKey(current, action));
      }
      setAnswer(null);
      setError(null);
    },
    [answer, answerExpression],
  );

  /** Applies one memory key: the cell arithmetic stays in the pure core, the
   * display keeps its expression and the recall multiplies after a value. */
  const pressMemory = useCallback(
    (key: CalculatorMemoryKey) => {
      if (key === "mc") {
        setMemory(memoryClear());
        return;
      }
      if (key === "mr") {
        setExpression((current) => memoryRecallExpression(current, memory));
        setAnswer(null);
        setError(null);
        return;
      }
      try {
        const value = evaluateExpression(expression);
        setMemory((stored) => (key === "m+" ? memoryAdd(stored, value) : memorySubtract(stored, value)));
        setError(null);
      } catch {
        /* the display carries no evaluable expression: the cell keeps its value */
      }
    },
    [expression, memory],
  );

  /** The physical keyboard answers the same map the keypad answers: digits,
   * the four operators, groups, percent, Enter, Escape and Backspace. */
  useEffect(() => {
    function onkeydown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const action = mapKeyboardKey(event.key);
      if (!action) return;
      event.preventDefault();
      pressKey(action);
    }
    window.addEventListener("keydown", onkeydown);
    return () => window.removeEventListener("keydown", onkeydown);
  }, [pressKey]);

  return (
    <ControlShell
      eyebrow="super platform · the calculator"
      title="Calculator"
      summary="The native calculator on the windows standard: precedence, parentheses, the unary minus, the postfix percent and the memory cell, all evaluated by the pure core at the app root."
    >
      <section className="control-note" style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <CalculatorGlyph size={15} style={{ color: "var(--dt-orange)" }} />
          <h2 style={{ margin: 0, fontSize: 15, color: "var(--dt-text)" }}>the standard mode</h2>
        </div>
        <p style={{ margin: 0 }}>
          The keypad, the keyboard and the memory strip feed one expression the pure evaluator answers, so the page
          never carries arithmetic of its own.
        </p>
      </section>

      <div className="calculator-layout">
        <div className="calculator-panel">
          <CalculatorDisplay expression={expression} answer={answer} error={error} memory={memory} />
          <CalculatorKeypad onkey={pressKey} onmemory={pressMemory} />
        </div>
        <CalculatorHistory rows={history} />
      </div>

      <AutomationNote />
    </ControlShell>
  );
}
