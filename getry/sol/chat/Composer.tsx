/**
 * Composer.tsx — the message composer of the devthink chat (the sol folder
 * law: the screen folder carries its own components beside the anchor).
 * the auto-growing textarea (enter sends, shift+enter breaks the line),
 * the send key and the stop key that trades places while the stream runs,
 * and the microrow beneath: the model chip opening the model flyout (the
 * live catalog of the picked route — ids, window ceilings, the meta badge
 * of the mask row and the smart-pool badge of the rotation pool), the
 * thinking-level caixinha listing the seven rungs with their formatted
 * budgets, and the temperature display. the flyouts close on pick,
 * escape and outside press — the popover law without a dependency.
 */

import { CheckmarkRegular, ChevronDownRegular, SendRegular, StopRegular } from "@fluentui/react-icons";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { label, labelfill } from "../../labels";
import { formatbudget, listlevels } from "../../thinking";

/** one model row of the picker: the id, the window ceilings and the badges. */
export type ModelOption = {
  id: string;
  context?: number;
  output?: number;
  meta?: boolean;
  pool?: boolean;
};

/* ===== block: the flyout shell ===== */

/**
 * the flyout shell: the trigger the caller renders plus the popover that
 * opens beside it (up from the composer floor, down from the rail panes).
 * closes on pick (the close hand the rows call), on escape and on an
 * outside press.
 *
 * @param trigger the chip that opens the flyout.
 * @param children the flyout body as a render prop receiving the close hand.
 * @param up true when the popover opens upward.
 * @returns the flyout element.
 */
function Flyout({
  trigger,
  children,
  up = false,
  ariaLabel,
}: {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  up?: boolean;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // the outside press and the escape key close the flyout
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent): void => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="chatflyout" ref={rootRef} data-open={open ? "true" : undefined}>
      <button type="button" className="chatflyout__trigger" aria-haspopup="true" aria-expanded={open ? "true" : "false"} aria-label={ariaLabel} onClick={() => setOpen((current) => !current)}>
        {trigger}
      </button>
      {open ? (
        <div className="chatflyout__pane" data-up={up ? "true" : undefined} role="menu">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

/* ===== block: the model picker ===== */

/**
 * the model picker flyout: one row per model of the picked route — the id,
 * the context/output ceilings, the meta badge of the devthink mask row and
 * the smart-pool badge of the rotation pool. picking a row hands the id up.
 *
 * @param options the catalog rows of the active route.
 * @param modelId the model the conversation rides now.
 * @param onPick the pick action.
 * @param up true when the popover opens upward (the composer seat).
 * @returns the picker element.
 */
export function ModelPicker({
  options,
  modelId,
  onPick,
  up = false,
}: {
  options: ModelOption[];
  modelId: string;
  onPick: (id: string) => void;
  up?: boolean;
}) {
  return (
    <Flyout
      up={up}
      ariaLabel={label("chat.composer.model")}
      trigger={
        <>
          <span className="chatflyout__label mono">{modelId}</span>
          <ChevronDownRegular fontSize={11} aria-hidden="true" />
        </>
      }
    >
      {(close) =>
        options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="chatflyout__row"
            role="menuitem"
            data-active={option.id === modelId ? "true" : undefined}
            onClick={() => {
              onPick(option.id);
              close();
            }}
          >
            <span className="chatflyout__rowid mono">{option.id}</span>
            <span className="chatflyout__rowbadges">
              {option.meta ? <span className="badge">{label("chat.model.meta")}</span> : null}
              {option.pool ? <span className="badge info">{label("chat.model.pool")}</span> : null}
            </span>
            <span className="chatflyout__rowmeta mono">
              {option.context !== undefined ? labelfill("chat.model.context", { tokens: formattokens(option.context) }) : null}
              {option.output !== undefined ? labelfill("chat.model.output", { tokens: formattokens(option.output) }) : null}
            </span>
            {option.id === modelId ? (
              <CheckmarkRegular fontSize={13} aria-hidden="true" className="chatflyout__rowcheck" />
            ) : null}
          </button>
        ))
      }
    </Flyout>
  );
}

/* ===== block: the thinking-level caixinha ===== */

/**
 * the thinking-level caixinha: the flyout listing the live ladder (the
 * seven rungs of thinking.ts) with the formatted budgets — `high (68,000)`
 * — persisted per conversation by the caller.
 *
 * @param level the level the conversation rides now.
 * @param onPick the pick action.
 * @returns the caixinha element.
 */
export function ThinkingPicker({ level, onPick }: { level: string; onPick: (level: string) => void }) {
  return (
    <Flyout
      up
      ariaLabel={label("chat.composer.thinkingAria")}
      trigger={
        <>
          <span className="chatflyout__label mono">
            {label("chat.composer.thinking")}: {level}
          </span>
          <ChevronDownRegular fontSize={11} aria-hidden="true" />
        </>
      }
    >
      {(close) =>
        listlevels().map((rung) => (
          <button
            key={rung.level}
            type="button"
            className="chatflyout__row"
            role="menuitem"
            data-active={rung.level === level ? "true" : undefined}
            onClick={() => {
              onPick(rung.level);
              close();
            }}
          >
            <span className="chatflyout__rowid">
              {labelfill("chat.composer.thinkingChoice", {
                level: rung.level,
                budget: formatbudget(rung.budget),
              })}
            </span>
            <span className="chatflyout__rowmeta">{rung.desc}</span>
            {rung.level === level ? (
              <CheckmarkRegular fontSize={13} aria-hidden="true" className="chatflyout__rowcheck" />
            ) : null}
          </button>
        ))
      }
    </Flyout>
  );
}

/** formats one token count the compact way (~68k, ~1.2m) — the approximate symbol rides every count, because the context windows and output ceilings are quotas the meters estimate, never exact budgets (the wave/getry-jury tilde law). */
function formattokens(count: number): string {
  if (count < 1000) return `~${count}`;
  if (count < 1_000_000) return `~${(count / 1000).toFixed(count < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `~${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

/* ===== block: the composer ===== */

/**
 * the composer: the auto-growing textarea, the send/stop key pair and the
 * microrow (model chip, thinking caixinha, temperature display).
 *
 * @param streaming true while an answer streams — the stop key replaces send.
 * @param modelOptions the catalog rows of the active route.
 * @param modelId the model the conversation rides now.
 * @param onPickModel the model pick action.
 * @param thinkingLevel the thinking level of the conversation.
 * @param onPickThinking the level pick action.
 * @param temperature the temperature of the conversation.
 * @param onSend the send action.
 * @param onStop the stop action.
 * @returns the composer element.
 */
export function Composer({
  streaming,
  modelOptions,
  modelId,
  onPickModel,
  thinkingLevel,
  onPickThinking,
  temperature,
  onSend,
  onStop,
}: {
  streaming: boolean;
  modelOptions: ModelOption[];
  modelId: string;
  onPickModel: (id: string) => void;
  thinkingLevel: string;
  onPickThinking: (level: string) => void;
  temperature: number;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [draft, setDraft] = useState("");
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  // the auto-grow: the area measures itself on every draft change, capped
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${Math.min(area.scrollHeight, 200)}px`;
  }, [draft]);

  /** sends the non-empty draft. */
  function send() {
    const text = draft.trim();
    if (text === "" || streaming) return;
    setDraft("");
    onSend(text);
  }

  return (
    <div className="chatcomposer" aria-label={label("chat.composer.aria")}>
      <div className="chatcomposer__row">
        <textarea
          ref={areaRef}
          className="chatcomposer__area"
          rows={1}
          value={draft}
          placeholder={label("chat.composer.placeholder")}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        {streaming ? (
          <button type="button" className="icon-frame-3d chatcomposer__key" onClick={onStop} aria-label={label("chat.composer.stop")}>
            <StopRegular fontSize={14} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="btn-tactile-3d chatcomposer__key"
            onClick={send}
            disabled={draft.trim() === ""}
            aria-label={label("chat.composer.send")}
          >
            <SendRegular fontSize={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="chatcomposer__micro">
        <ModelPicker options={modelOptions} modelId={modelId} onPick={onPickModel} up />
        <ThinkingPicker level={thinkingLevel} onPick={onPickThinking} />
        <span className="chatcomposer__temp mono">{labelfill("chat.composer.temp", { value: temperature.toFixed(1) })}</span>
      </div>
    </div>
  );
}

export default Composer;
