/**
 * canvaspane.tsx — the canvas lane of the chat subapp (the w6 flagship):
 * the versioned text and code buffer beside the thread. The pane mirrors
 * the sandbox lane mount grammar verbatim — the caller mounts it hidden,
 * a rAF flips data-open so the Windows slide-cum-fade enter plays, the
 * exit stays mounted for the 200ms transition and a reopen reuses it,
 * and the narrow viewport or the embedded window swaps the conversation
 * body instead of docking a lane. The buffer never lives here: the chat
 * body owns the version record (the open flag, the versions, the
 * pointer — chatstate is out of bounds, so the record is body-local and
 * dies with the body mount, the session-record seam noted there). The
 * pane renders the pointed version either through the house markdown
 * renderer or as plain code, and the edit key swaps the read for a
 * textarea whose save (ctrl/cmd+s or the key itself) commits a new
 * version through onCommit — the model's ```canvas fences join the same
 * version stream on the body side. The dom event lane: this file owns
 * the contract (CANVAS_OPEN_EVENT, the detail type, the dispatch
 * helper) that turn.tsx or markdown.tsx may adopt in a later wave — the
 * listener lives in the body and is armed today. Every interactive
 * element follows the sandbox pane's closed-state grammar: aria-hidden
 * on the pane and tabIndex -1 while the exit plays.
 */

import {
  CheckmarkRegular as Checkmark,
  ChevronLeftRegular as ChevronLeft,
  ChevronRightRegular as ChevronRight,
  EditRegular as Edit,
  MarkdownRegular as MarkdownGlyph,
  PanelRightContractRegular as PanelRightClose,
} from "@fluentui/react-icons";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { chatText } from "../../chatlabels.ts";
import { Markdown } from "./ChatMarkdown.tsx";

/** CANVAS_OPEN_EVENT — the dom event lane of the openers: any floor
 * surface (a code block key of a turn, a later artifact chip) dispatches
 * this document-level custom event and the chat body answers by opening
 * the pane with the detail's buffer. The contract lives here so the
 * dispatchers of later waves import one seam. */
export const CANVAS_OPEN_EVENT = "dt-canvas-open";

/** CanvasOpenDetail — the honest payload of the open event: the buffer
 * content (required — a detail without it answers nothing on the
 * listener side), the optional fence language (a code language renders
 * the code view, the markdown family or empty renders markdown) and the
 * optional title. */
export type CanvasOpenDetail = {
  content: string;
  lang?: string;
  title?: string;
};

/** dispatchCanvasOpen — the one-line seam for the later waves: the code
 * block key of a turn (or any floor surface) calls this and the body's
 * listener opens the pane. Nothing fabricates — the detail is passed
 * through exactly as the caller built it. */
export function dispatchCanvasOpen(detail: CanvasOpenDetail): void {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new CustomEvent<CanvasOpenDetail>(CANVAS_OPEN_EVENT, { detail }));
}

/** CanvasVersion — one recorded buffer of the version stream: the
 * content and the commit stamp. */
export type CanvasVersion = { content: string; at: number };

/** CanvasDoc — the versioned buffer the chat body owns: the title, the
 * fence language ("" reads as text), the version record (append-only,
 * the newest version is the head) and the pointer the back and forward
 * keys move — the pane renders versions[pointer], never a merge. */
export type CanvasDoc = {
  title: string;
  lang: string;
  versions: CanvasVersion[];
  index: number;
};

/** the markdown family of fence labels: an empty label or the md/text
 * aliases default the body to the rendered markdown view, every other
 * language defaults to the plain code view — the toggle stays free
 * either way. */
const MD_LANG = /^(md|markdown|text|txt)?$/i;

/** defaultView — the honest first read of a buffer: markdown for the
 * prose family, plain code for everything else. */
function defaultView(lang: string): "md" | "code" {
  return MD_LANG.test(lang.trim()) ? "md" : "code";
}

/**
 * CanvasPane — the canvas lane of the chat body.
 *
 * @param open whether the pane is visible (drives the slide-cum-fade).
 * @param onClose collapses the pane (the caller unmounts after the exit
 * — the buffer survives in the body).
 * @param swap body-swap mode (the narrow viewport or the embedded
 * window): the pane fills the conversation stage instead of docking as
 * a lane.
 * @param doc the versioned buffer the body owns — the pane never
 * mutates it, it reports through the seams below.
 * @param onBrowse the version navigation seam: the back and forward
 * keys move the pointer (the body clamps, an out-of-range call answers
 * nothing).
 * @param onCommit the edit save seam: a changed buffer lands as the
 * newest version (the body caps the record and moves the pointer to
 * the head).
 */
export function CanvasPane({
  open,
  onClose,
  swap,
  doc,
  onBrowse,
  onCommit,
}: {
  open: boolean;
  onClose: () => void;
  swap?: boolean;
  doc: CanvasDoc;
  onBrowse: (index: number) => void;
  onCommit: (content: string) => void;
}) {
  const paneref = useRef<HTMLElement | null>(null);
  const arearef = useRef<HTMLTextAreaElement>(null);
  const bodyref = useRef<HTMLElement>(null);
  /* the view state is pane-local and never persisted: the markdown read
   * against the plain code read, defaulting by the buffer's language and
   * re-defaulting when the language changes (a new artifact, a new first
   * read — the visitor's toggle never fights a mid-buffer flip). */
  const [view, setView] = useState<"md" | "code">(() => defaultView(doc.lang));
  useEffect(() => {
    setView(defaultView(doc.lang));
  }, [doc.lang]);
  /* the edit lane: the draft mirrors the pointed version while the
   * textarea owns the body; the save commits through onCommit and the
   * escape discards — the edit's own micro-ladder, it cancels before
   * the body's escape chain closes the pane under it. */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const versions = doc.versions;
  const version = versions[doc.index] ?? versions[versions.length - 1];
  const content = version?.content ?? "";
  const total = versions.length;

  /** focusAfterEdit — the focus handoff when the edit lane falls: the
   * double frame rides past the re-render so the focus lands on the
   * reading surface, never dropped to the document body. */
  const focusAfterEdit = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => bodyref.current?.focus()));
  };

  /** the edit key: the pointed version seeds the draft, the textarea
   * takes the body and the focus follows on the next frame (the visitor
   * asked for the editor — the focus steal is the intent). */
  const startEdit = () => {
    setDraft(content);
    setEditing(true);
    window.requestAnimationFrame(() => arearef.current?.focus());
  };

  /** the save: a changed buffer commits through the body seam (a new
   * version lands at the head, the pointer moves to it), an unchanged
   * draft just leaves the edit — no identical version ever records. */
  const saveEdit = () => {
    if (draft !== content) onCommit(draft);
    setEditing(false);
    focusAfterEdit();
  };

  /** the discard: the escape of the edit lane. */
  const cancelEdit = () => {
    setEditing(false);
    focusAfterEdit();
  };

  /** the textarea keyboard: ctrl/cmd+s saves (both platforms, the
   * browser's save dialog never opens), the escape discards the draft
   * first — stopPropagation keeps the body's escape ladder out of the
   * edit, so the second escape is the one that closes the pane. */
  const onAreaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveEdit();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
    }
  };

  return (
    <aside
      ref={paneref}
      className="dtc-cv"
      data-open={open ? "true" : "false"}
      data-swap={swap ? "true" : "false"}
      // biome-ignore lint/a11y/noRedundantRoles: the explicit complementary role is the w6 pane contract — the landmark names itself even where the aside already implies it
      role="complementary"
      aria-label="canvas pane"
      aria-hidden={!open}
    >
      <div className="dtc-cv__head">
        <h2 className="dtc-cv__title" title={doc.title}>
          {doc.title}
        </h2>
        <p className="dtc-cv__count" role="status">
          {doc.index + 1} of {total}
        </p>
        <div className="dtc-cv__keys">
          <button
            type="button"
            className="dtc-code__key"
            onClick={() => onBrowse(doc.index - 1)}
            disabled={editing || doc.index === 0}
            aria-label="previous version"
            title="previous version"
            tabIndex={open ? 0 : -1}
          >
            <ChevronLeft fontSize={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dtc-code__key"
            onClick={() => onBrowse(doc.index + 1)}
            disabled={editing || doc.index >= total - 1}
            aria-label="next version"
            title="next version"
            tabIndex={open ? 0 : -1}
          >
            <ChevronRight fontSize={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dtc-code__key"
            onClick={() => setView((v) => (v === "md" ? "code" : "md"))}
            disabled={editing}
            aria-pressed={view === "md"}
            aria-label={view === "md" ? "show plain code" : "render as markdown"}
            title={view === "md" ? "show plain code" : "render as markdown"}
            tabIndex={open ? 0 : -1}
          >
            <MarkdownGlyph fontSize={13} aria-hidden="true" />
          </button>
          {editing ? (
            <button
              type="button"
              className="dtc-code__key dtc-cv__key--save"
              onClick={saveEdit}
              aria-label="save a new version"
              title="save a new version (ctrl+s)"
              tabIndex={open ? 0 : -1}
            >
              <Checkmark fontSize={13} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="dtc-code__key dtc-cv__key--edit"
              onClick={startEdit}
              aria-label="edit the buffer"
              title="edit the buffer"
              tabIndex={open ? 0 : -1}
            >
              <Edit fontSize={13} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="dtc-tb-btn"
            onClick={onClose}
            aria-label="Close canvas pane"
            title="Close pane"
            tabIndex={open ? 0 : -1}
          >
            <PanelRightClose fontSize={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="dtc-cv__body" ref={bodyref} aria-label="canvas buffer" tabIndex={open ? 0 : -1}>
        {editing ? (
          <textarea
            ref={arearef}
            className="dtc-cv__area"
            value={draft}
            spellCheck={false}
            aria-label="edit the canvas buffer"
            tabIndex={open ? 0 : -1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onAreaKeyDown}
          />
        ) : content.trim().length === 0 ? (
          <p className="dtc-cv__empty">{chatText("canvas.empty")}</p>
        ) : view === "md" ? (
          <div className="dtc-cv__md">
            <Markdown source={content} />
          </div>
        ) : (
          <pre className="dtc-cv__code">
            <code>{content}</code>
          </pre>
        )}
      </section>
    </aside>
  );
}
