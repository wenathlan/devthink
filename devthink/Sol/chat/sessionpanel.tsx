/**
 * sessionpanel.tsx — the right session panel (~320px), a floating acrylic
 * sheet (the start-menu recipe) that the caller mounts on open and unmounts
 * once the 200ms Windows slide-cum-fade exit settles: the active model, the
 * live turn count, the local persistence readout, the active tool flags,
 * the pinned-instructions seam, the saved-memories fact list, the
 * session-identity readout (the birth ids — space, sandbox, session),
 * the visitor-tags editor (the capped chip row) and the explicit
 * gateway opt-in block, quick links into the existing theme pages and the
 * per-session export key (the conversation as a .md download). The gateway
 * block is the opt-in contract of the chat (shared with the settings page
 * through os/gatewaybase.ts): the natural state is
 * disconnected, the endpoint is never inferred or pre-filled, registering
 * persists the preference and probes the endpoint for real, and
 * disconnecting confirms inline — no window.confirm. While mounted the
 * closed state is inert and visually hidden (data-open), so the exit
 * transition runs both ways.
 */

import {
  ArrowExportRegular as ExportIcon,
  DismissRegular as Dismiss,
  PanelRightContractRegular as PanelRightClose,
} from "@fluentui/react-icons";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { chatLimit, chatText } from "../../chatlabels.ts";
import { addTag, CHAT_TOOLS, type ChatSession, removeTag, type ToolId } from "../../chatstate.ts";
import { GATEWAY_REQUIRED_COPY, type GatewayRegistration, gatewayStatusLabel } from "../../gatewaybase.ts";
import { CHAT_NAV } from "./sidebar.tsx";

/** the inspector feature flags — one quiet gate per block that ships ahead
 * of its wiring. the memory fact list rides its flag so the surface can be
 * held back, or retired, in one flip without touching the render tree. */
const PANEL_FEATURES = {
  memory: true,
} as const;

/** exportFileName — the session title slugged to a quiet file name: the
 * non-alphanumerics collapse to dashes and an empty slug falls back to the
 * honest generic. */
function exportFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || chatText("panel.exportFallback")}.md`;
}

/** sessionMarkdown — the export body: the title as the one heading, every
 * turn as its own "## user" / "## assistant" section, nothing invented
 * between the lines. */
function sessionMarkdown(session: ChatSession): string {
  const lines: string[] = [`# ${session.title}`, ""];
  for (const turn of session.messages) {
    lines.push(`## ${turn.role}`, "", turn.content, "");
  }
  return lines.join("\n");
}

/**
 * SessionPanel — the inspector of the current conversation.
 *
 * @param open whether the panel is visible (drives the slide-cum-fade).
 * @param onClose collapses the panel.
 * @param model the gateway model id.
 * @param turnCount turns in the active conversation.
 * @param sessionCount conversations persisted on this device.
 * @param tools the tool flags currently on.
 * @param gateway the shared opt-in machine (base, status, register/disconnect).
 * @param session the active session record — powers the export key, the
 *   identity readout and the tags chips; absent keeps those rows out until
 *   the caller wires it.
 * @param memory the saved facts of the memory block; absent falls back to a
 *   local list seeded empty (the persistence seam is the caller's).
 * @param onMemoryChange fires with the next fact list on every delete key.
 * @param instructions the pinned project instructions; absent falls back to
 *   a local draft (the persistence seam is the caller's).
 * @param onInstructionsChange fires with the draft on every keystroke.
 * @param onTagsChange fires with the next tag list on every add or remove
 *   key; absent keeps the chips read-only (the seam is the caller's).
 */
export function SessionPanel({
  open,
  onClose,
  model,
  turnCount,
  sessionCount,
  tools,
  gateway,
  session,
  memory,
  onMemoryChange,
  instructions,
  onInstructionsChange,
  onTagsChange,
}: {
  open: boolean;
  onClose: () => void;
  model: string;
  turnCount: number;
  sessionCount: number;
  tools: ToolId[];
  gateway: GatewayRegistration;
  session?: ChatSession | null;
  memory?: string[];
  onMemoryChange?: (facts: string[]) => void;
  instructions?: string;
  onInstructionsChange?: (value: string) => void;
  onTagsChange?: (tags: string[]) => void;
}) {
  const toolLabel =
    tools.length > 0
      ? CHAT_TOOLS.filter((t) => tools.includes(t.id))
          .map((t) => t.label)
          .join(", ")
      : "none";
  const testing = gateway.status === "connecting";
  /* local draft so the field only commits validated values on submit; it
   * starts empty — the endpoint is never pre-filled by default */
  const [endpointDraft, setEndpointDraft] = useState(gateway.base);
  useEffect(() => {
    setEndpointDraft(gateway.base);
  }, [gateway.base]);
  const [confirmArmed, setConfirmArmed] = useState(false);

  /* the pinned-instructions seam: the endpoint-draft grammar — the prop
   * seeds the local draft, every keystroke updates it and reaches the
   * caller through the optional callback, so the panel is lightly
   * editable before the persistence lands. */
  const [instructionDraft, setInstructionDraft] = useState(instructions ?? "");
  useEffect(() => {
    setInstructionDraft(instructions ?? "");
  }, [instructions]);
  const editInstructions = (value: string) => {
    setInstructionDraft(value);
    onInstructionsChange?.(value);
  };

  /* the visitor-tags lane: the chips ride the session record itself — no
   * local echo to keep — and the input carries the only local draft; every
   * commit runs through the pure addTag law (trim, lowercase, the table's
   * cap) before it reaches the caller, and the remove key through
   * removeTag, so the panel never widens the law on its own. */
  const [tagDraft, setTagDraft] = useState("");
  const sessionTags = session?.tags ?? [];
  const tagsCap = chatLimit("tagsCap");
  const submitTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !onTagsChange) return;
    const next = addTag(session, tagDraft);
    setTagDraft("");
    if (next !== session) onTagsChange(next.tags ?? []);
  };
  const dropTag = (tag: string) => {
    if (!session || !onTagsChange) return;
    onTagsChange(removeTag(session, tag).tags ?? []);
  };

  /* the saved-memories lane: the facts arrive as an optional prop and fall
   * back to a local list seeded empty — the delete keys drive both lanes,
   * the honest state never claims a save that did not happen. */
  const [memoryDraft, setMemoryDraft] = useState<string[]>(() => memory ?? []);
  /* the guard keeps an absent prop inert: the fallback lane only re-seeds
   * when the caller actually hands facts over, and it keeps the last seeded
   * list if the prop retreats to undefined. */
  useEffect(() => {
    if (memory !== undefined) setMemoryDraft(memory);
  }, [memory]);
  const forgetFact = (index: number) => {
    const next = memoryDraft.filter((_, i) => i !== index);
    setMemoryDraft(next);
    onMemoryChange?.(next);
  };

  /* the export key: the conversation folded to markdown and handed to the
   * browser's own download lane — a blob url minted, clicked and revoked in
   * the same breath; no service, no clipboard detour. */
  const downloadSession = () => {
    if (!session || session.messages.length === 0) return;
    const blob = new Blob([sessionMarkdown(session)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFileName(session.title);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const submitRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (testing) return;
    void gateway.register(endpointDraft);
  };

  return (
    <aside className="dtc-session" data-open={open ? "true" : "false"} aria-hidden={!open} aria-label="Session panel">
      <div className="dtc-session__head">
        <h2>Session</h2>
        <button
          type="button"
          className="dtc-tb-btn"
          onClick={onClose}
          aria-label="Close session panel"
          title="Close panel"
          tabIndex={open ? 0 : -1}
        >
          <PanelRightClose fontSize={18} aria-hidden="true" />
        </button>
      </div>

      <section className="dtc-session__sec">
        <p className="dtc-session__label">Context</p>
        <div className="dtc-modelcard">
          <strong>{model}</strong>
          <small>{gateway.base ? "gateway on" : "gateway off"}</small>
        </div>
        <dl className="dtc-readouts">
          <div className="dtc-readout">
            <dt>Turns</dt>
            <dd>{turnCount}</dd>
          </div>
          <div className="dtc-readout">
            <dt>Conversations</dt>
            <dd>{sessionCount}</dd>
          </div>
          <div className="dtc-readout">
            <dt>Persistence</dt>
            <dd>local</dd>
          </div>
          <div className="dtc-readout">
            <dt>Tools</dt>
            <dd>{toolLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="dtc-session__sec" aria-label="Session identity">
        <p className="dtc-session__label">Identity</p>
        {session?.birth ? (
          <dl className="dtc-ident">
            <dt className="dtc-ident__key">space</dt>
            <dd className="dtc-ident__val" title={session.birth.spaceId}>
              {session.birth.spaceId}
            </dd>
            <dt className="dtc-ident__key">sandbox</dt>
            <dd className="dtc-ident__val" title={session.birth.sandboxId}>
              {session.birth.sandboxId}
            </dd>
            <dt className="dtc-ident__key">session</dt>
            <dd className="dtc-ident__val" title={session.birth.sessionId}>
              {session.birth.sessionId}
            </dd>
          </dl>
        ) : (
          <p className="dtc-gw__hint">ids mint at the first message</p>
        )}
      </section>

      <section className="dtc-session__sec" aria-label="Project instructions">
        <p className="dtc-session__label">Project</p>
        <textarea
          className="dtc-project__input"
          value={instructionDraft}
          onChange={(event) => editInstructions(event.target.value)}
          placeholder={chatText("panel.instructionsPlaceholder")}
          aria-label="Pinned instructions"
          rows={3}
          tabIndex={open ? 0 : -1}
        />
        <p className="dtc-gw__hint">
          {onInstructionsChange ? chatText("panel.instructionsSaved") : chatText("panel.instructionsDraft")}
        </p>
      </section>

      {PANEL_FEATURES.memory ? (
        <section className="dtc-session__sec" aria-label="Saved memory">
          <p className="dtc-session__label">Memory</p>
          {memoryDraft.length > 0 ? (
            <ul className="dtc-memory__list">
              {memoryDraft.map((fact, index) => (
                <li key={`${index}-${fact}`} className="dtc-memory__fact">
                  <span className="dtc-memory__text">{fact}</span>
                  <button
                    type="button"
                    className="dtc-memory__del"
                    onClick={() => forgetFact(index)}
                    aria-label={`Delete fact: ${fact}`}
                    title="Delete this fact"
                    tabIndex={open ? 0 : -1}
                  >
                    <Dismiss fontSize={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dtc-memory__empty">{chatText("panel.memoryEmpty")}</p>
          )}
        </section>
      ) : null}

      {session ? (
        <section className="dtc-session__sec" aria-label="Session tags">
          <p className="dtc-session__label">Tags</p>
          {onTagsChange ? (
            <form className="dtc-tags" onSubmit={submitTag}>
              {sessionTags.map((tag) => (
                <span key={tag} className="dtc-tag">
                  {tag}
                  <button
                    type="button"
                    className="dtc-tag__del"
                    onClick={() => dropTag(tag)}
                    aria-label="Remove tag"
                    title="Remove this tag"
                    tabIndex={open ? 0 : -1}
                  >
                    <Dismiss fontSize={13} aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input
                className="dtc-tags__input"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                placeholder="add a tag"
                aria-label="Add a tag"
                spellCheck={false}
                autoComplete="off"
                tabIndex={open ? 0 : -1}
              />
            </form>
          ) : (
            <div className="dtc-tags">
              {sessionTags.map((tag) => (
                <span key={tag} className="dtc-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {onTagsChange ? (
            sessionTags.length >= tagsCap ? (
              <p className="dtc-gw__hint">{tagsCap} tags is the cap</p>
            ) : null
          ) : (
            <p className="dtc-gw__hint">editing lands with the panel seam</p>
          )}
        </section>
      ) : null}

      <section className="dtc-session__sec dtc-gw" aria-label="Gateway registration">
        <p className="dtc-session__label">Gateway</p>
        <p className="dtc-gw__pill" data-state={gateway.status} role="status">
          {gatewayStatusLabel(gateway.status)}
        </p>

        {gateway.base ? <p className="dtc-gw__endpoint">{gateway.base}</p> : null}

        {gateway.status === "disconnected" || testing ? (
          <>
            {gateway.status === "disconnected" ? <p className="dtc-gw__hint">{GATEWAY_REQUIRED_COPY}</p> : null}
            <form className="dtc-gw__form" onSubmit={submitRegister}>
              <input
                type="url"
                className="dtc-gw__input"
                value={endpointDraft}
                onChange={(event) => {
                  setEndpointDraft(event.target.value);
                  if (gateway.formError) gateway.clearFormError();
                }}
                placeholder="https://gateway.example.com"
                aria-label="Gateway endpoint base url"
                spellCheck={false}
                autoComplete="off"
                disabled={testing}
                tabIndex={open ? 0 : -1}
              />
              <button
                type="submit"
                className="dtc-gw__btn"
                disabled={testing || !endpointDraft.trim()}
                tabIndex={open ? 0 : -1}
              >
                {testing ? (
                  <>
                    <i className="dtc-gw__spinner" aria-hidden="true" />
                    Testing
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>
            {gateway.formError ? (
              <p className="dtc-gw__formerror" role="alert">
                {gateway.formError}
              </p>
            ) : null}
            {testing ? <p className="dtc-gw__hint">{chatText("panel.probing")}</p> : null}
          </>
        ) : null}

        {gateway.status === "error" ? (
          <p className="dtc-gw__error" role="alert">
            {gateway.probeError ?? chatText("panel.gatewayError")}
          </p>
        ) : null}

        {(gateway.status === "connected" || gateway.status === "error") && confirmArmed ? (
          <fieldset className="dtc-gw__confirm" aria-label="Confirm disconnect">
            <p>Disconnect the gateway</p>
            <div className="dtc-gw__actions">
              <button
                type="button"
                className="dtc-gw__btn dtc-gw__btn--danger"
                onClick={() => {
                  setConfirmArmed(false);
                  void gateway.disconnect();
                }}
                tabIndex={open ? 0 : -1}
              >
                Disconnect
              </button>
              <button
                type="button"
                className="dtc-gw__btn"
                onClick={() => setConfirmArmed(false)}
                tabIndex={open ? 0 : -1}
              >
                Keep
              </button>
            </div>
          </fieldset>
        ) : null}

        {gateway.status === "connected" && !confirmArmed ? (
          <div className="dtc-gw__actions">
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => setConfirmArmed(true)}
              tabIndex={open ? 0 : -1}
            >
              Disconnect
            </button>
          </div>
        ) : null}

        {gateway.status === "error" && !confirmArmed ? (
          <div className="dtc-gw__actions">
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => void gateway.retryProbe()}
              tabIndex={open ? 0 : -1}
            >
              Test
            </button>
            <button
              type="button"
              className="dtc-gw__btn"
              onClick={() => setConfirmArmed(true)}
              tabIndex={open ? 0 : -1}
            >
              Disconnect
            </button>
          </div>
        ) : null}
      </section>

      <section className="dtc-session__sec">
        <p className="dtc-session__label">Quick links</p>
        <nav className="dtc-session__links" aria-label="Theme pages">
          {CHAT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="dtc-session__link" tabIndex={open ? 0 : -1}>
                <Icon fontSize={15} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {session ? (
          <button
            type="button"
            className="dtc-session__export"
            onClick={downloadSession}
            disabled={session.messages.length === 0}
            aria-label="Export conversation as markdown"
            title={session.messages.length === 0 ? "nothing to export yet" : "Download this conversation as markdown"}
            tabIndex={open ? 0 : -1}
          >
            <ExportIcon fontSize={15} aria-hidden="true" />
            <span>Export .md</span>
          </button>
        ) : null}
      </section>

      <p className="dtc-session__foot">History stays in this browser</p>
    </aside>
  );
}
