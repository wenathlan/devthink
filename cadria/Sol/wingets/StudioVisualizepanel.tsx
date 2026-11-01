/**
 * visualizepanel.tsx — the studio "visualize" block: image in, 3d mesh out.
 * Self contained on the silk law (the panel-silk surface carries the block,
 * the neutral downloads ride silk-btn with the eight-state law, the number
 * fields ride the sol.css input states): a picked image decodes into pixels,
 * runs the root pipeline (cadria/visualize.ts) and offers .obj / .stl
 * downloads. The honest states answer the lifecycle: idle says the next
 * action, working rides aria-busy with the inputs stood down, ready shows
 * the real mesh stats, error offers the retry in place. The DOM work stays
 * here; the root library stays multi-mode (browser + node, no canvas).
 * The ready state also mounts the real 3d viewport (cadria/versawase3d.ts)
 * in the page canvas — drag to orbit, wheel or pinch to zoom, a png
 * screenshot of the same frame — rendering locally the way a daw touches
 * webaudio to play, and answering the typed refusal honestly when the
 * browser exposes no webgl context.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { label } from "../../labels.ts";
import { mountThreeScene, type Viewport } from "../../versawase3d.ts";
import {
  type ImageInput,
  VisualizeError,
  type VisualizeResult,
  type VisualizeStats,
  visualize,
} from "../../visualize.ts";

/** longest side allowed for the decoded working image (keeps mesh counts sane). */
const MAX_WORKING_SIDE = 512;

/** the panel lifecycle: idle → working → ready, with error beside any of them. */
type PanelStatus = "idle" | "working" | "ready" | "error";

/** the honest status line of the block, per lifecycle stage (the copy law). */
function statusLine(status: PanelStatus): string {
  if (status === "working") return label("studio.visualize.statusWorking");
  if (status === "ready") return label("studio.visualize.statusReady");
  return label("studio.visualize.statusIdle");
}

/** decodes a picked file to RGBA pixels, downscaled to the working side limit. */
async function decodeImage(file: File): Promise<ImageInput> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WORKING_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    throw new Error("canvas 2d context unavailable");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height);
  bitmap.close();
  return { width, height, data: pixels.data };
}

/** triggers a client-side download of one exported mesh. */
function download(name: string, payload: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([payload], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** triggers a client-side download of one viewport screenshot (no url to revoke). */
function downloadDataUrl(name: string, dataUrl: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = name;
  anchor.click();
}

/** the visualize panel mounted on the studio page. */
export function VisualizePanel() {
  const [depth, setDepth] = useState(32);
  const [step, setStep] = useState(2);
  const [blurRadius, setBlurRadius] = useState(0);
  const [status, setStatus] = useState<PanelStatus>("idle");
  const [stats, setStats] = useState<VisualizeStats | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const imageRef = useRef<ImageInput | null>(null);
  const resultRef = useRef<VisualizeResult | null>(null);
  /** the latest successful pipeline result — the viewport remounts on it. */
  const [mesh, setMesh] = useState<VisualizeResult | null>(null);
  const [viewportReady, setViewportReady] = useState(false);
  const [viewportRefused, setViewportRefused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<Viewport | null>(null);

  const run = useCallback((image: ImageInput, nextDepth: number, nextStep: number, nextBlur: number) => {
    try {
      const result = visualize(image, { depth: nextDepth, step: nextStep, blurRadius: nextBlur });
      resultRef.current = result;
      setMesh(result);
      setStats(result.stats());
      setStatus("ready");
      setMessage(null);
    } catch (error) {
      resultRef.current = null;
      setMesh(null);
      setStats(null);
      setStatus("error");
      setMessage(error instanceof VisualizeError ? error.message : label("studio.visualize.failed"));
    }
  }, []);

  const onPick = useCallback(
    async (file: File) => {
      setStatus("working");
      setMessage(null);
      try {
        const image = await decodeImage(file);
        imageRef.current = image;
        run(image, depth, step, blurRadius);
      } catch {
        resultRef.current = null;
        setMesh(null);
        setStats(null);
        setStatus("error");
        setMessage(label("studio.visualize.decodeFailed"));
      }
    },
    [depth, step, blurRadius, run],
  );

  const onDepth = (value: number) => {
    setDepth(value);
    if (imageRef.current) run(imageRef.current, value, step, blurRadius);
  };

  const onStep = (value: number) => {
    setStep(value);
    if (imageRef.current) run(imageRef.current, depth, value, blurRadius);
  };

  const onBlur = (value: number) => {
    setBlurRadius(value);
    if (imageRef.current) run(imageRef.current, depth, step, value);
  };

  const onObj = () => {
    const result = resultRef.current;
    if (result) download("cadria-visualize.obj", result.toObj(), "model/obj");
  };

  const onStl = () => {
    const result = resultRef.current;
    if (result) download("cadria-visualize.stl", result.toStlBinary() as BlobPart, "model/stl");
  };

  // the 3d viewport mounts when a ready mesh exists and disposes cleanly on
  // every re-run (a new mesh) and on unmount. A canvas without a webgl
  // context answers the typed refusal — never a pretend render.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mesh) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mounted = mountThreeScene(
      canvas,
      { mesh: mesh.mesh, colors: mesh.colors, normals: mesh.normals },
      { reducedMotion: reduced },
    );
    if (!mounted.ok) {
      viewportRef.current = null;
      setViewportReady(false);
      setViewportRefused(true);
      return;
    }
    viewportRef.current = mounted.viewport;
    setViewportReady(true);
    setViewportRefused(false);
    return () => {
      mounted.viewport.dispose();
      viewportRef.current = null;
      setViewportReady(false);
    };
  }, [mesh]);

  const onReset = () => {
    viewportRef.current?.reset();
  };

  const onPng = () => {
    const viewport = viewportRef.current;
    if (viewport) downloadDataUrl("cadria-visualize.png", viewport.screenshot());
  };

  const working = status === "working";

  return (
    <section
      className="panel-silk card-gap"
      aria-label={label("studio.visualize.paneAria")}
      aria-busy={working ? "true" : undefined}
    >
      <p className="mono-label" style={{ margin: "0 0 8px" }}>
        {label("studio.visualize.head")}
      </p>
      <p className="p-sm" style={{ marginTop: 0 }}>
        {label("studio.visualize.lede")} <code>{label("studio.visualize.ledeCode")}</code>{" "}
        {label("studio.visualize.ledeTail")}
      </p>
      <div className="field">
        <label htmlFor="visualize-image">{label("studio.visualize.image")}</label>
        <input
          id="visualize-image"
          type="file"
          accept="image/*"
          disabled={working}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onPick(file);
          }}
        />
      </div>
      <div className="grid cols-3" style={{ marginTop: 14 }}>
        <div className="field">
          <label htmlFor="visualize-depth">{label("studio.visualize.depth")}</label>
          <input
            id="visualize-depth"
            type="number"
            min={0}
            max={200}
            value={depth}
            disabled={working}
            onChange={(event) => onDepth(Number(event.currentTarget.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="visualize-step">{label("studio.visualize.step")}</label>
          <input
            id="visualize-step"
            type="number"
            min={1}
            max={32}
            value={step}
            disabled={working}
            onChange={(event) => onStep(Number(event.currentTarget.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="visualize-blur">{label("studio.visualize.blur")}</label>
          <input
            id="visualize-blur"
            type="number"
            min={0}
            max={16}
            value={blurRadius}
            disabled={working}
            onChange={(event) => onBlur(Number(event.currentTarget.value))}
          />
        </div>
      </div>
      {stats && (
        <p className="p-sm" role="status" style={{ marginTop: 12 }}>
          <span className="badge">{label("studio.visualize.vertices").replace("{n}", String(stats.vertices))}</span>{" "}
          <span className="badge">{label("studio.visualize.triangles").replace("{n}", String(stats.triangles))}</span>{" "}
          <span className="badge">
            {label("studio.visualize.grid")
              .replace("{cols}", String(stats.columns))
              .replace("{rows}", String(stats.rows))}
          </span>
        </p>
      )}
      {status === "ready" && stats && (
        <div
          className="panel-silk"
          style={{ marginTop: 14, position: "relative", width: "100%", aspectRatio: "4 / 3", overflow: "hidden" }}
        >
          <p className="mono-label" style={{ position: "absolute", top: 10, left: 12, margin: 0, zIndex: 1 }}>
            {label("studio.visualize.view3d")}
          </p>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={label("studio.visualize.view3dAria")}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
          {viewportRefused && (
            <p
              className="p-sm"
              role="alert"
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                margin: 0,
                padding: 24,
                textAlign: "center",
                color: "var(--ink-2)",
              }}
            >
              {label("studio.visualize.view3dRefused")}
            </p>
          )}
        </div>
      )}
      <p role="status" aria-live="polite" style={{ margin: "12px 0 0", fontSize: "0.82rem", color: "var(--ink-2)" }}>
        {statusLine(status)}
      </p>
      {message && (
        <p className="p-sm" role="alert" style={{ marginTop: 8, color: "var(--sol-error)" }}>
          {message}
        </p>
      )}
      <div className="btn-row" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="silk-btn"
          disabled={status !== "ready"}
          data-tip={label("studio.visualize.objTip")}
          onClick={onObj}
        >
          {label("studio.visualize.obj")}
        </button>
        <button
          type="button"
          className="silk-btn"
          disabled={status !== "ready"}
          data-tip={label("studio.visualize.stlTip")}
          onClick={onStl}
        >
          {label("studio.visualize.stl")}
        </button>
        <button
          type="button"
          className="silk-btn"
          disabled={!viewportReady}
          data-tip={label("studio.visualize.resetTip")}
          onClick={onReset}
        >
          {label("studio.visualize.reset")}
        </button>
        <button
          type="button"
          className="silk-btn"
          disabled={!viewportReady}
          data-tip={label("studio.visualize.pngTip")}
          onClick={onPng}
        >
          {label("studio.visualize.png")}
        </button>
      </div>
    </section>
  );
}
