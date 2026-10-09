/**
 * calculator page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

/** Style: DevThink Terminal Atelier — the native calculator of the super
 * platform, staged as one instrument bench (campaign v3 · r2-a): ONE named
 * light (the bench lamp, a shader-fallback bloom over the instrument stage)
 * and the signal accent #ff5f00 at the 90/10 split. The calculator (display
 * + keypad) dominates the 1.6fr column as a machined instrument — big
 * tabular-nums display, inset-highlight keys with the .96 press — while the
 * history rides as a hairline ledger rail beside it (no card-in-card) under
 * the answers stat. The arithmetic never lives here: the pure core rides
 * calculator.ts at the app root, the display, keypad and history are the
 * loose components beside this anchor, and the keyboard answers the same
 * key actions the on-screen keys answer. */
import { TerminalSquare } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
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

/* --------------------------------------------------------------------------
 * the calculator page-app stylesheet — the r2-a instrument pass of this
 * folder: the machined bench. ONE light (the .r2a-calc bench lamp riding
 * the engine .shader-fallback), the 20px instrument frame over the 14px
 * display glass, the inset-highlight keys at the 120ms .96 press, signal
 * #ff5f00 reserved for the equals key, the memory strip and the focus
 * rings; the history closes as a hairline ledger. Scoped to the classes
 * only this page mounts; it lands once at import time. The engine and the
 * arithmetic are untouched.
 * ------------------------------------------------------------------------ */
const CALC_CSS = `
.halftone::after, .grain::before { pointer-events: none; }
.r2a-calc-light { background: radial-gradient(56% 50% at 20% 4%, color-mix(in srgb, var(--dtv3-signal) 15%, transparent) 0%, transparent 66%); }
.calculator-layout { grid-template-columns: minmax(0, 1.6fr) minmax(250px, 1fr); gap: clamp(28px, 4vw, 56px); align-items: start; }
@media (max-width: 760px) {
  .calculator-layout { grid-template-columns: 1fr; }
  .calculator-rail { padding-left: 0; padding-top: 22px; border-left: 0; border-top: 1px solid var(--dtv3-hairline); }
}
.calculator-panel { display: grid; gap: 14px; padding: clamp(16px, 2.4vw, 24px); background: rgb(255 255 255 / 3%); border: 1px solid var(--dtv3-hairline); border-radius: 20px; box-shadow: 0 24px 70px rgb(0 0 0 / 30%), inset 0 1px 0 rgb(255 255 255 / 6%); }
[data-theme="light"] .calculator-panel { background: rgb(255 255 255 / 62%); border-color: rgb(23 25 31 / 14%); box-shadow: 0 18px 44px rgb(23 25 31 / 10%), inset 0 1px 0 rgb(255 255 255 / 55%); }
.calculator-display { display: grid; gap: 6px; min-height: 132px; align-content: end; padding: 18px 20px 16px; background: rgb(0 0 0 / 32%); border: 1px solid var(--dtv3-hairline); border-radius: 14px; box-shadow: inset 0 2px 16px rgb(0 0 0 / 45%), inset 0 1px 0 rgb(255 255 255 / 4%); }
[data-theme="light"] .calculator-display { background: rgb(23 25 31 / 5%); border-color: rgb(23 25 31 / 14%); box-shadow: inset 0 2px 12px rgb(23 25 31 / 8%); }
.calculator-display__memory { top: 14px; left: 16px; color: var(--dtv3-sig); font: 600 10px var(--dt-mono); letter-spacing: .1em; }
.calculator-display__expression { min-height: 16px; color: var(--dtv3-ink-3); font: 500 12px/1.5 var(--dt-mono); }
.calculator-display__value { color: var(--dtv3-ink-1); font: 500 clamp(36px, 5vw, 54px)/1.04 var(--dt-mono); letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.calculator-display__error { color: #ff7d66; font: 500 11px/1.5 var(--dt-mono); }
.calculator-keys { gap: 8px; }
.calculator-key { min-height: 52px; color: var(--dtv3-ink-1); background: rgb(255 255 255 / 4.5%); border: 1px solid rgb(255 255 255 / 6%); border-radius: 10px; font: 500 16px var(--dt-mono); font-variant-numeric: tabular-nums; box-shadow: inset 0 1px 0 rgb(255 255 255 / 7%), inset 0 -2px 6px rgb(0 0 0 / 22%); transition: background 160ms var(--dtv3-ease), color 160ms var(--dtv3-ease), transform 120ms var(--dtv3-ease), box-shadow 160ms var(--dtv3-ease); }
[data-theme="light"] .calculator-key { background: rgb(255 255 255 / 70%); border-color: rgb(23 25 31 / 12%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%), 0 1px 3px rgb(23 25 31 / 8%); }
.calculator-key:hover { background: rgb(255 255 255 / 8%); }
[data-theme="light"] .calculator-key:hover { background: rgb(255 255 255 / 92%); }
.calculator-key:active { transform: scale(.96); box-shadow: inset 0 2px 10px rgb(0 0 0 / 35%); }
button.calculator-key:focus-visible { outline: 2px solid color-mix(in srgb, var(--dtv3-sig) 45%, transparent); outline-offset: 2px; }
.calculator-key--muted { color: var(--dtv3-ink-2); font-size: 14px; background: rgb(255 255 255 / 2.5%); }
[data-theme="light"] .calculator-key--muted { background: rgb(23 25 31 / 4%); }
.calculator-key--memory { min-height: 32px; color: var(--dtv3-ink-3); background: transparent; border-color: transparent; box-shadow: none; font-size: 10px; letter-spacing: .1em; }
[data-theme="light"] .calculator-key--memory { background: transparent; box-shadow: none; }
.calculator-key--memory:hover { color: var(--dtv3-ink-2); background: rgb(255 255 255 / 4%); }
[data-theme="light"] .calculator-key--memory:hover { background: rgb(23 25 31 / 5%); }
.calculator-key--equals { min-height: 52px; color: #1a120a; background: var(--dtv3-sig); border-color: rgb(255 255 255 / 14%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 28%), 0 8px 22px rgb(255 95 0 / 24%); font-weight: 600; }
[data-theme="light"] .calculator-key--equals { border-color: rgb(255 255 255 / 30%); box-shadow: inset 0 1px 0 rgb(255 255 255 / 40%), 0 8px 20px rgb(255 95 0 / 20%); }
.calculator-key--equals:hover { background: color-mix(in srgb, var(--dtv3-sig) 90%, white); }
.calculator-key--equals:active { box-shadow: inset 0 2px 10px rgb(0 0 0 / 28%); }
.calculator-rail { padding-left: clamp(20px, 2.6vw, 32px); border-left: 1px solid var(--dtv3-hairline); }
.calculator-rail .calculator-history { gap: 0; }
.calculator-rail .calculator-history li { padding: 11px 2px; background: transparent; border: 0; border-bottom: 1px solid var(--dtv3-hairline); border-radius: 0; color: var(--dtv3-ink-2); font: 500 12px/1.65 var(--dt-mono); font-variant-numeric: tabular-nums; transition: color 160ms var(--dtv3-ease), background 160ms var(--dtv3-ease); }
.calculator-rail .calculator-history li:hover { color: var(--dtv3-ink-1); background: rgb(255 255 255 / 3%); }
[data-theme="light"] .calculator-rail .calculator-history li:hover { background: rgb(23 25 31 / 3%); }
@media (prefers-reduced-motion: reduce) {
  .calculator-key { transition: none; }
}
[data-motion="reduced"] .calculator-key { transition: none; }
`;

let calcCssReady = false;

/** Injects the calculator stylesheet exactly once per document, at import
 * time, so the first paint of the bench already stands on the polish. */
function ensureCalcCss(): void {
  if (calcCssReady || typeof document === "undefined") return;
  calcCssReady = true;
  const tag = document.createElement("style");
  tag.setAttribute("data-dt-calc-pass", "");
  tag.textContent = CALC_CSS;
  document.head.appendChild(tag);
}
ensureCalcCss();

/** how many answers the history keeps before the oldest one leaves. */
const HISTORY_LIMIT = 8;

/** the entrance stagger of the page: one orchestrated rise through the
 * engine .enter kit, the delay reading the --i custom prop (70ms steps). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

const DISPLAY = "var(--font-display, var(--dt-sans))";

/** the .pagehead contract floor: the mono eyebrow, the Bricolage display
 * line (2–4 words) and the one-phrase lede — inline so the page top stands
 * before the shared r2-a grammar lands on the classes */
const containerStyle = {
  width: "100%",
  maxWidth: 1180,
  marginInline: "auto",
  padding: "24px clamp(24px, 4vw, 32px) 96px",
  display: "grid",
  alignContent: "start",
  gap: 40,
} as const;
const pageheadStyle = { display: "grid", gap: 14, padding: "56px 0 0" } as const;
const titleStyle = {
  margin: 0,
  font: `700 clamp(34px, 4.6vw, 60px)/1.04 ${DISPLAY}`,
  letterSpacing: "-.03em",
} as const;
const ledeStyle = { margin: 0, maxWidth: "52ch", color: "var(--dt-muted)", fontSize: 14, lineHeight: 1.75 } as const;
/** the mode note as plain editorial copy: a hairline kicker, no box */
const briefStyle = { display: "grid", gap: 10 } as const;
const briefBodyStyle = {
  margin: 0,
  maxWidth: "68ch",
  fontSize: 14,
  lineHeight: 1.8,
  color: "var(--dt-muted)",
} as const;

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
      <div className="page-container grain" style={containerStyle}>
        <header className="pagehead enter" style={{ ...pageheadStyle, ...step(0) }}>
          <p className="pagehead__eyebrow r2a-eyebrow">devthink · calculator</p>
          <h1 className="pagehead__title r2a-display" style={titleStyle}>
            the instrument bench
          </h1>
          <p className="pagehead__lede r2a-lede" style={ledeStyle}>
            Precedence, parentheses, the unary minus and the memory cell — answered by the pure core at the app root.
          </p>
        </header>

        <section className="calculator-brief enter" style={{ ...briefStyle, ...step(1) }}>
          <p className="r2a-kicker">
            01 · standard mode
            <b>keyboard shares the keypad</b>
          </p>
          <p style={briefBodyStyle}>
            The keypad, the keyboard and the memory strip feed one expression the pure evaluator answers, so the page
            never carries arithmetic of its own.
          </p>
        </section>

        <div className="calculator-layout shader-stage enter" style={step(2)}>
          {/* the ONE named light of the page: the bench lamp, breathing once
              per cycle; the grain veil keeps the film over the instrument */}
          <div className="shader-fallback r2a-calc-light breathe" aria-hidden="true" />
          <div className="grain-overlay" aria-hidden="true" />
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
