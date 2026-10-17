/**
 * calculator page anchor — layer 3 of the anchor architecture. The file
 * carrying the folder's own name is the path manager of the page: it imports
 * the loose components beside it, mounts the page and re-exports the public
 * component surface. Only the theme anchor (Sol/Sol.tsx) and the window
 * registry (Sol/windowregistry.tsx) consume this file.
 *
 * Calculator — the native calculator in the Windows 11 grammar: the mode
 * pane beside the instrument, the display over the keypad and the history
 * as a hairline card. The arithmetic never lives here: the pure core rides
 * calculator.ts at the app root, the display, keypad and history are the
 * loose components beside this anchor, and the keyboard answers the same
 * key actions the on-screen keys answer while the body holds focus.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ShellChrome } from "@/shell/ShellChrome";
import {
  applyKey,
  type CalculatorKeyAction,
  evaluateExpression,
  formatCalculator,
  mapKeyboardKey,
  memoryAdd,
  memoryClear,
  memoryRecallExpression,
  memorySubtract,
} from "../../calculator";
import { CalculatorDisplay } from "./calculatordisplay.tsx";
import { CalculatorHistory, type CalculatorHistoryRow } from "./calculatorhistory.tsx";
import { CalculatorKeypad, type CalculatorMemoryKey } from "./calculatorkeypad.tsx";

/** how many answers the history keeps before the oldest one leaves. */
const HISTORY_LIMIT = 8;

/** The calculator page: the Windows body when embedded (the desktop window
 * hosts it without the shell), the full surface with the taskbar on the
 * route. */
export default function Calculator({ embedded }: { embedded?: boolean }) {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<CalculatorHistoryRow[]>([]);
  const historyserial = useRef(0);
  const body = useRef<HTMLElement>(null);

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
      const row: CalculatorHistoryRow = {
        id: `calc.history.${historyserial.current.toString(36)}`,
        line: `${expression} = ${text}`,
      };
      setHistory((rows) => [row, ...rows].slice(0, HISTORY_LIMIT));
    } catch (cause) {
      setAnswer(null);
      setError(cause instanceof Error ? cause.message : "The expression could not be evaluated");
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

  /** The keyboard answers inside the body only: the listener rides the body
   * element, so the calculator never steals keys from another app window. */
  useEffect(() => {
    const host = body.current;
    if (!host) return;
    function onkeydown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const action = mapKeyboardKey(event.key);
      if (!action) return;
      event.preventDefault();
      pressKey(action);
    }
    host.addEventListener("keydown", onkeydown);
    return () => host.removeEventListener("keydown", onkeydown);
  }, [pressKey]);

  return (
    <main
      ref={body}
      className="dtw-app dtw-calc"
      tabIndex={-1}
      style={embedded ? { height: "100%", overflow: "auto" } : undefined}
    >
      {!embedded && <ShellChrome />}
      <div className="dtw-pane">
        <nav className="dtw-nav" aria-label="Calculator modes">
          <span className="dtw-navrow" data-active="true">
            Standard
          </span>
        </nav>
        <div className="dtw-content">
          <h1 className="dtw-title">Calculator</h1>
          <section className="dtw-card dtw-calc__instrument">
            <CalculatorDisplay expression={expression} answer={answer} error={error} memory={memory} />
            <CalculatorKeypad onkey={pressKey} onmemory={pressMemory} />
          </section>
          <CalculatorHistory rows={history} />
        </div>
      </div>
    </main>
  );
}
