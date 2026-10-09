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
 * calculator.ts at the app root, the display, keypad and history are
 * the loose components beside this anchor, and the keyboard answers the
 * same key actions the on-screen keys answer. */
import { Calculator as CalculatorGlyph, TerminalSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AutomationNote } from "@/shell/automationnote";
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
import { CalculatorDisplay } from "./calculatordisplay";
import { CalculatorHistory, type CalculatorHistoryRow } from "./calculatorhistory";
import { CalculatorKeypad, type CalculatorMemoryKey } from "./calculatorkeypad";

/** how many answers the history keeps before the oldest one leaves. */
const HISTORY_LIMIT = 8;

/** the .pagehead contract floor: the 10px mono tracked eyebrow, the 30px
 * display line and the 13px muted one-sentence lede — inline so the page top
 * stands before the wave-2 stylesheet lands on the shared classes */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 40px",
  display: "grid",
  alignContent: "start",
  gap: 32,
} as const;
const pageheadStyle = { display: "grid", gap: 12, padding: "32px 0 0" } as const;
const eyebrowStyle = {
  margin: 0,
  color: "var(--dt-muted)",
  font: "500 10px var(--dt-mono)",
  letterSpacing: ".22em",
  textTransform: "uppercase",
} as const;
const titleStyle = { margin: 0, fontSize: 30, lineHeight: 1.15, letterSpacing: "-.02em" } as const;
const ledeStyle = { margin: 0, maxWidth: 640, color: "var(--dt-muted)", fontSize: 13, lineHeight: 1.7 } as const;

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
      const row: CalculatorHistoryRow = {
        id: `calc.history.${historyserial.current.toString(36)}`,
        line: `${expression} = ${text}`,
      };
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
    <main className="control-page">
      <ShellChrome />
      <div className="page-container" style={containerStyle}>
        <header className="pagehead" style={pageheadStyle}>
          <p className="pagehead__eyebrow" style={eyebrowStyle}>
            devthink · calculator
          </p>
          <h1 className="pagehead__title" style={titleStyle}>
            Calculator
          </h1>
          <p className="pagehead__lede" style={ledeStyle}>
            The native calculator on the windows standard: precedence, parentheses, the unary minus, the postfix percent
            and the memory cell, evaluated by the pure core at the app root.
          </p>
        </header>

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
      </div>

      <footer className="control-page__footer">
        <TerminalSquare size={14} aria-hidden="true" />
        provider credentials stay in <code>~/.config/devthink/auth.json</code>
      </footer>
    </main>
  );
}
