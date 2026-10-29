/**
 * videoplayer.tsx — the real playback face of the video studio: the stage
 * the person opens a local video file into, the honest transport of the
 * Windows 11 media grammar and the file open action beside it. The file
 * never uploads — the object URL lives for the stage lifetime only and the
 * revoke law keeps the device clean. Every string rides the label table
 * (oslabels.ts), every glyph rides the fluent set. Loose widget of the
 * video page.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FullScreenMaximizeRegular,
  FullScreenMinimizeRegular,
  OpenRegular,
  PauseRegular,
  PlayRegular,
  Speaker0Regular,
  Speaker2Regular,
} from "@fluentui/react-icons";
import { osText } from "../../oslabels.ts";

/** the time readout of the transport: mm:ss under an hour, h:mm:ss above */
function timecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const two = secs.toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${minutes.toString().padStart(2, "0")}:${two}` : `${minutes}:${two}`;
}

/** VideoPlayer — the stage and its transport. The anchor hands nothing:
 * the component owns the open action, the element and the honest empty
 * face (no file, no fake content — the empty state says what the stage
 * waits for). */
export function VideoPlayer() {
  const [source, setSource] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const inputref = useRef<HTMLInputElement>(null);
  const stageref = useRef<HTMLDivElement>(null);
  const videoref = useRef<HTMLVideoElement>(null);

  /** the object URL lifetime: one file at a time, revoked the moment
   * another opens or the stage unmounts (the device keeps nothing) */
  const opensource = useCallback((file: File) => {
    setSource((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setFilename(file.name);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  /** the fullscreen state follows the stage element the browser owns */
  useEffect(() => {
    const onchange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onchange);
    return () => document.removeEventListener("fullscreenchange", onchange);
  }, []);

  const toggleplay = useCallback(() => {
    const element = videoref.current;
    if (!element) return;
    if (element.paused) void element.play();
    else element.pause();
  }, []);

  const togglefullscreen = useCallback(() => {
    const stage = stageref.current;
    if (!stage) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.requestFullscreen().catch(() => undefined);
  }, []);

  const seek = useCallback((value: number) => {
    const element = videoref.current;
    if (!element || !Number.isFinite(value)) return;
    element.currentTime = value;
    setPosition(value);
  }, []);

  return (
    <section className="dtw-card dtw-videoplayer" aria-label={osText("video.stage.aria")}>
      <div className="dtw-videoplayer__head">
        <h2 className="dtw-cardtitle">{osText("video.stage.title")}</h2>
        <button
          type="button"
          className="dtw-action"
          onClick={() => inputref.current?.click()}
          aria-label={osText("video.openAria")}
        >
          <OpenRegular fontSize={12} aria-hidden="true" />
          <span>{osText("video.open")}</span>
        </button>
        <input
          ref={inputref}
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) opensource(file);
            event.target.value = "";
          }}
        />
      </div>
      <div
        ref={stageref}
        className="dtw-videostage"
        data-empty={source ? undefined : "true"}
      >
        {source ? (
          <>
            <video
              ref={videoref}
              src={source}
              className="dtw-videostage__element"
              playsInline
              muted={muted}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
              onDurationChange={(event) => setDuration(event.currentTarget.duration)}
              onEnded={() => setPlaying(false)}
            />
            <div className="dtw-videotransport">
              <button
                type="button"
                className="dtw-videotransport__key"
                onClick={toggleplay}
                aria-label={playing ? osText("video.pauseAria") : osText("video.playAria")}
              >
                {playing ? (
                  <PauseRegular fontSize={14} aria-hidden="true" />
                ) : (
                  <PlayRegular fontSize={14} aria-hidden="true" />
                )}
              </button>
              <span className="dtw-videotransport__time" aria-live="off">
                {timecode(position)}
              </span>
              <input
                type="range"
                className="dtw-videotransport__scrub"
                min={0}
                max={Math.max(duration, 0.1)}
                step={0.1}
                value={Math.min(position, duration || 0)}
                onChange={(event) => seek(Number(event.currentTarget.value))}
                aria-label={osText("video.scrubAria")}
              />
              <span className="dtw-videotransport__time" aria-live="off">
                {timecode(duration)}
              </span>
              <button
                type="button"
                className="dtw-videotransport__key"
                onClick={() => setMuted((current) => !current)}
                aria-label={muted ? osText("video.unmuteAria") : osText("video.muteAria")}
                aria-pressed={muted}
              >
                {muted ? (
                  <Speaker0Regular fontSize={14} aria-hidden="true" />
                ) : (
                  <Speaker2Regular fontSize={14} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="dtw-videotransport__key"
                onClick={togglefullscreen}
                aria-label={fullscreen ? osText("video.windowedAria") : osText("video.fullscreenAria")}
              >
                {fullscreen ? (
                  <FullScreenMinimizeRegular fontSize={14} aria-hidden="true" />
                ) : (
                  <FullScreenMaximizeRegular fontSize={14} aria-hidden="true" />
                )}
              </button>
            </div>
            {filename ? <p className="dtw-videostage__name">{filename}</p> : null}
          </>
        ) : (
          <div className="dtw-videostage__empty">
            <p className="dtw-videostage__line">{osText("video.stage.empty")}</p>
            <p className="dtw-videostage__hint">{osText("video.stage.hint")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
