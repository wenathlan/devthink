/**
 * saasrails.tsx — the studio rails and the footer of the SaaS face: the
 * asset wall the catalog serves (video, music and image rows from the
 * studio engines) and the track list of the daw. Every row rides the
 * catalog accessors the page hands down; the honest empty state answers
 * while the catalog has not replied. No image is ever fetched: the rails
 * draw the quiet frame glyph of the honest stand-in, never a fake render.
 * Loose components of the intro page — the anchor (intro.tsx) mounts the
 * page (saas.tsx) and the page composes these.
 */

import type { StudioAsset, StudioTrack } from "../../catalog";
import { SolLogoMark } from "../panel/logo.tsx";

/** the soft layers under the hairline ring of the trylle cards */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

/** the quiet frame glyph of a still or moving asset — the honest
 * stand-in the rails draw while no frame exists; never a fake render */
function FrameGlyph({ minutes }: { minutes?: string }) {
  return (
    <div
      className="flex h-28 w-full items-center justify-center rounded-xl bg-s1 ring-1 ring-hairline"
      aria-hidden="true"
    >
      <span className="font-mono text-[10px] tracking-[.14em] text-ink-3 uppercase">
        {minutes ?? "asset"}
      </span>
    </div>
  );
}

/** The studio rails: the assets of the family studios side by side with
 * the tracks of the daw — the catalog rows the studios serve after the
 * visitor enters. */
export function SaasRails({ assets, tracks }: { assets: StudioAsset[]; tracks: StudioTrack[] }) {
  return (
    <section className="scroll-mt-24 py-14" id="rails" aria-labelledby="dt-sec-rails">
      <header className="mb-8 max-w-[56ch]">
        <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">the studio rails</p>
        <h2 id="dt-sec-rails" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          what the studios serve
        </h2>
        <p className="mt-2 text-sm leading-[1.55] text-ink-2">
          the assets and the tracks below are the catalog rows the studio pages render inside the os.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* the asset wall: video, music and image rows */}
        <div>
          <p className="mb-4 font-mono text-[10px] tracking-[.08em] text-ink-3">assets</p>
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex w-[248px] flex-none snap-start flex-col gap-3 rounded-2xl bg-s0 p-4 ring-1 ring-hairline-strong"
                style={{ boxShadow: STRIP_SHADOW }}
              >
                <FrameGlyph minutes={asset.duration ?? asset.size} />
                <strong className="block font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                  {asset.title}
                </strong>
                <span className="font-mono text-[10px] tracking-[.08em] text-ink-3">
                  {asset.studio} · {asset.engine}
                </span>
              </li>
            ))}
            {assets.length === 0 && (
              <li className="py-6 font-mono text-xs text-ink-3">the catalog has not answered yet.</li>
            )}
          </ul>
        </div>

        {/* the track list: the daw rows with the engine of each take */}
        <div>
          <p className="mb-4 font-mono text-[10px] tracking-[.08em] text-ink-3">tracks</p>
          <ul className="flex flex-col gap-3">
            {tracks.map((track) => (
              <li
                key={track.id}
                className="flex items-baseline justify-between gap-4 rounded-2xl bg-s0 px-5 py-4 ring-1 ring-hairline-strong transition-colors duration-150 ease-micro hover:bg-s1 motion-reduce:transition-none"
                style={{ boxShadow: STRIP_SHADOW }}
              >
                <div className="min-w-0">
                  <strong className="block truncate font-display text-sm font-semibold tracking-[-0.01em] text-ink">
                    {track.title}
                  </strong>
                  <span className="mt-1 block text-xs leading-[1.55] text-ink-2">{track.blurb}</span>
                </div>
                <span
                  className="shrink-0 font-mono text-[10px] tracking-[.08em] text-ink-3"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {track.minutes} min · {track.engine}
                </span>
              </li>
            ))}
            {tracks.length === 0 && (
              <li className="py-6 font-mono text-xs text-ink-3">the catalog has not answered yet.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The footer of the SaaS face: the institutional links and the honest
 * note of the platform. The enter action closes the chain. */
export function SaasFooter({ onenter }: { onenter: () => void }) {
  return (
    <footer className="border-t border-hairline pt-10 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-medium text-ink" aria-hidden="true">
          <SolLogoMark size={18} accent />
          DevThink
        </span>
        <nav aria-label="Institutional" className="flex items-center gap-5 text-sm text-ink-2">
          <a
            href="/about"
            className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
          >
            about
          </a>
          <a
            href="/terms"
            className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
          >
            terms
          </a>
          <a
            href="/policy"
            className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
          >
            privacy
          </a>
          <button
            type="button"
            onClick={onenter}
            className="rounded-xs transition-colors duration-150 ease-micro hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
          >
            enter
          </button>
        </nav>
      </div>
      <small className="mt-6 block text-xs leading-[1.55] text-ink-3">
        the interface loads over https and never writes to your machine — no telemetry, no remote
        authentication on the landing, no captcha anywhere.
      </small>
    </footer>
  );
}
