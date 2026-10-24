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
 */
import { useCallback, useRef, useState } from "react";
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

/** the honest status line of the block, per lifecycle stage. */
function statusLine(status: PanelStatus): string {
  if (status === "working") return "decoding the image and triangulating the mesh…";
  if (status === "ready") return "mesh ready — the downloads carry the same triangulation.";
  return "pick an image; the mesh builds client-side — nothing leaves the page.";
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

  const run = useCallback((image: ImageInput, nextDepth: number, nextStep: number, nextBlur: number) => {
    try {
      const result = visualize(image, { depth: nextDepth, step: nextStep, blurRadius: nextBlur });
      resultRef.current = result;
      setStats(result.stats());
      setStatus("ready");
      setMessage(null);
    } catch (error) {
      resultRef.current = null;
      setStats(null);
      setStatus("error");
      setMessage(error instanceof VisualizeError ? error.message : "visualize failed — unexpected error");
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
        setStats(null);
        setStatus("error");
        setMessage("could not decode this image — try a png or jpg");
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

  const working = status === "working";

  return (
    <section className="panel-silk card-gap" aria-label="visualize: image to mesh" aria-busy={working ? "true" : undefined}>
      <p className="mono-label" style={{ margin: "0 0 8px" }}>
        visualize
      </p>
      <p className="p-sm" style={{ marginTop: 0 }}>
        image to 3d mesh, decoded and triangulated client-side — heightmap from luminance, step decimation and blur on
        the controls. downloads run through the root <code>visualize</code> library.
      </p>
      <div className="field">
        <label htmlFor="visualize-image">image</label>
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
          <label htmlFor="visualize-depth">depth</label>
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
          <label htmlFor="visualize-step">step</label>
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
          <label htmlFor="visualize-blur">blur</label>
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
          <span className="badge">{stats.vertices} vertices</span>{" "}
          <span className="badge">{stats.triangles} triangles</span>{" "}
          <span className="badge">
            {stats.columns}×{stats.rows} grid
          </span>
        </p>
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
          data-tip="wavefront obj — the triangulated mesh with vertex colors"
          onClick={onObj}
        >
          download .obj
        </button>
        <button
          type="button"
          className="silk-btn"
          disabled={status !== "ready"}
          data-tip="binary stl — the same mesh for the slicers"
          onClick={onStl}
        >
          download .stl
        </button>
      </div>
    </section>
  );
}
