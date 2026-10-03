/** Design: the entry as a slide deck — four slides (identity, the platform,
 * the family apps, the door) under a floating pill navbar with the amber
 * "Enter the platform" action on the right. Navigation works by click, arrow
 * keys and horizontal mouse drag; the indicators are mono dashes, never
 * dots. No autoplay; slide content re-staggers on every change. */
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SolLogoMark } from "./logo";

/** Canonical ANSI mark transcribed from the DevThink terminal identity. */
const canonicalMark = `
                                                    +
                                                    +
                                                   -+
                                                   ++
                                                   ++
                                                  +++
                                                ++++ -
                                              +++++++++
                                          +-+++++++++++++--
                                        --++++++-++++++++++++
                                     +++++++-+   +++  +--++++++-
                                  -+++++++-+     +++     -+-+++++++
                               ++++++++++       -+++        --++++++++
                            ++++++++-+          ++++           --+++++++-
                         ++++++++++             ++++              --+++++++-
                      ---++++++-               -++++                 -++++++--+
                   ++++++++--                  +++++                    ++++++++--
                +--+++++--                     +++++                       +++++++---
              ++++++++-                        +++++                          +-+++++++
             -+++++--                         -++++-                            --++++++
             -+++++-                          +++++-                             +++++++
             -++++++                         -+++++-                             +++++++
             -++++++                         ++++++-                             +++++++
             -++++++                         +++++++-                            +++++++
             -++++++                         ++++++++-                           +++++++
             -++++++                        -++++++++++-+                        +++++++
             -++++++                        -+++++++++++++-                      +++++++
             -++++++                        -+++++++++++++++++                   +++++++
             -++++++                       -++++++++++++++++++++                 +++++++
             -++++++                       -++++++++++++++++++++++               +++++++
             -++++++                      -+++++++++++++++++++++++++-            +++++++
             -++++++                    +++++++++++++++++-+--++++++++--          +++++++
             -++++++                 +++++++++++++++           -+++++++++        +++++++
             -++++++              +++++++++++-++                  --++++++-+      +-++++
             -++++++           ++++++++++-+-                         +--++++--      --++
             -++++++       +--++++++++++                                ---++++-+     +-
             -++++++    ++-++++++++                                        ++++++++
             -++++++ -+++++-+--                                                +-++-+
             -+++++++++++++                                                      -++++++
             -++++++++                                                          +-+++-+++-
           -+++++++++++                                                       ++++++++- +---+
        --++-+  -++++++-++                                                 ---++++++++     +-++
     ++++          +-+++++++                                             -++++++-+             ++
  -++                 ++++++++--                                     ++++++++-+-                  +
                        +-++++++-+                                 --++++++++
                           ++-+++++++                           ++++++++-+
                              +-++++++++                     --++++++++
                                 ++++++++++               +--++++++-
                                    --+++++++-         ++++++++++
                                       -+++++++-++++--++++++++
                                          +-++++++++++++++-
                                             --++++++++-
                                                +-++-`;

const slides = [
  { id: "identity", label: "identity" },
  { id: "platform", label: "the platform" },
  { id: "family", label: "the family" },
  { id: "enter", label: "enter" },
] as const;

const familyApps = [
  ["console", "the canonical design of the CLI"],
  ["gateway", "the embedded local gateway console"],
  ["os", "the family operating surface"],
  ["projects", "local workspace records"],
  ["docs", "the documentation library"],
  ["explore", "the exploration gallery"],
] as const;

/** drag distance that turns a horizontal mouse gesture into a slide change */
const DRAG_THRESHOLD = 60;

type EntryScreenProps = {
  invitationDetected: boolean;
  paired: boolean;
  userId?: string | undefined;
  /** liberates the shell workspace */
  onEnter: () => void;
};

export function EntryScreen({ invitationDetected, paired, userId, onEnter }: EntryScreenProps) {
  const [slide, setSlide] = useState(0);
  const dragX = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    setSlide(Math.max(0, Math.min(slides.length - 1, next)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(slide + 1);
      if (event.key === "ArrowLeft") go(slide - 1);
      if (event.key === "Enter" && slide === slides.length - 1) onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onEnter, slide]);

  function onMouseDown(event: ReactMouseEvent) {
    dragX.current = event.clientX;
  }

  function onMouseUp(event: ReactMouseEvent) {
    if (dragX.current == null) return;
    const delta = event.clientX - dragX.current;
    dragX.current = null;
    if (delta <= -DRAG_THRESHOLD) go(slide + 1);
    if (delta >= DRAG_THRESHOLD) go(slide - 1);
  }

  return (
    <main
      className="entry-screen"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      aria-label="DevThink entry"
      aria-roledescription="carousel"
    >
      <div className="entry-screen__grain" aria-hidden="true" />

      <nav className="entry-navpill" aria-label="Entry navigation">
        <button type="button" className="entry-navpill__brand" onClick={() => go(0)} aria-label="Back to the first slide">
          <SolLogoMark size={20} />
          <strong>DEVTHINK</strong>
        </button>
        <div className="entry-navpill__links">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-current={index === slide ? "true" : undefined}
              onClick={() => go(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="entry-navpill__enter" onClick={onEnter}>
          Enter the platform
        </button>
      </nav>

      <div className="entry-stage">
        {slide === 0 && (
          <section className="entry-slide entry-slide--identity" key="identity" aria-label="DevThink identity">
            <div className="entry-ansi" aria-hidden="true">
              <pre>{canonicalMark}</pre>
            </div>
            <h1>DEVTHINK</h1>
            <p className="entry-slide__eyebrow">a local place to think through the work</p>
            <p className="entry-slide__state">
              {paired ? `paired as ${userId || "local user"}` : "pair the local CLI to sync this browser"}
              {invitationDetected ? " · one-time pairing invitation detected" : ""}
            </p>
          </section>
        )}

        {slide === 1 && (
          <section className="entry-slide" key="platform" aria-label="What DevThink is">
            <p className="entry-slide__eyebrow">01 · the platform</p>
            <h2>Your work lives in one local OS.</h2>
            <p className="entry-slide__copy">
              DevThink keeps sessions, tabs, categories and preferences in this browser and pairs them with the local
              CLI when the work needs a model. Provider credentials never enter the browser.
            </p>
            <ul className="entry-facts">
              <li>
                <strong>sessions</strong>
                <span>browser-local, URL-addressable</span>
              </li>
              <li>
                <strong>pairing</strong>
                <span>one shared identity with the CLI</span>
              </li>
              <li>
                <strong>gateway</strong>
                <span>you bring the URL and the keys</span>
              </li>
            </ul>
          </section>
        )}

        {slide === 2 && (
          <section className="entry-slide" key="family" aria-label="The family apps">
            <p className="entry-slide__eyebrow">02 · the family</p>
            <h2>One shell, every app of the family.</h2>
            <ul className="entry-family">
              {familyApps.map(([name, detail]) => (
                <li key={name}>
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {slide === 3 && (
          <section className="entry-slide entry-slide--enter" key="enter" aria-label="Open the platform">
            <p className="entry-slide__eyebrow">03 · the door</p>
            <h2>Open the workspace.</h2>
            <p className="entry-slide__copy">
              The desktop opens with the session window, the dock and the clean omnibox. Describe the next piece of
              work in the command rail below the canvas.
            </p>
            <button type="button" className="entry-slide__cta" onClick={onEnter}>
              <span>Enter the platform</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <p className="entry-slide__hint">⌘K commands · ctrl+shift+E replays this entry · ←/→ browse the slides</p>
          </section>
        )}
      </div>

      <div className="entry-controls">
        <button
          type="button"
          className="entry-controls__arrow"
          onClick={() => go(slide - 1)}
          disabled={slide === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="entry-ticks" role="tablist" aria-label="Slide indicators">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === slide}
              aria-label={`Slide ${index + 1}: ${item.label}`}
              className={index === slide ? "on" : ""}
              onClick={() => go(index)}
            >
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="entry-controls__arrow"
          onClick={() => go(slide + 1)}
          disabled={slide === slides.length - 1}
          aria-label="Next slide"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <footer className="entry-screen__foot">
        <span>provider credentials never enter the browser</span>
        <span>drag or use ←/→ · tab to navigate</span>
      </footer>
    </main>
  );
}
