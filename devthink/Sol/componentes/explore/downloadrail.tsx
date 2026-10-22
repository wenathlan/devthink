/**
 * downloadrail.tsx — the distribution rail of the explore landing: the
 * release channels of the devthink build (the chromium zip, the firefox
 * xpi, the vs code vsix and the immutable tag that carries every artifact
 * beside the checksums, the sbom and the attestations) pointing at the
 * reviewed GitHub releases of the family. The version rides the build:
 * vite bakes the root manifest version as the __dtversion__ global (one
 * product, one metadata — the rail never drifts from the shipped
 * envelope). Style: the trylle card grammar of the landing — rounded-2xl,
 * ring-1 hairline, the Linear shadow with its ring, the micro curve on
 * every quiet hover, the 2px accent focus underline. English text only —
 * the gtx translation runs at runtime.
 */
import {ArrowUpRightRegular as ArrowUpRight, CubeRegular as Boxes, type FluentIcon, GlobeRegular as Globe, PuzzlePieceRegular as Puzzle, WindowConsoleRegular as SquareTerminal } from "@fluentui/react-icons";
import { osText } from "../../../oslabels.ts";

/** the baked release version (vite define — see vite.config.ts) */
declare const __dtversion__: string;

/** the immutable release the built site ships from, and the releases home */
const RELEASETAG = `https://github.com/wenathlan/devthink/releases/tag/v${__dtversion__}`;
const RELEASES = "https://github.com/wenathlan/devthink/releases";

/** the Linear shadow with its hairline ring (the strip card recipe) */
const STRIP_SHADOW = "0 1px 2px rgb(0 0 0 / 26%), 0 3px 12px rgb(0 0 0 / 12%)";

type ChannelCard = {
  icon: FluentIcon;
  channel: string;
  asset: string;
  note: string;
};

/** the release channels of the immutable tag (the asset names are the ones
 * the reviewed release workflow assembles — docs/19.distribution.md) */
const CHANNELS: ReadonlyArray<ChannelCard> = [
  {
    icon: Puzzle,
    channel: osText("explore.download.chromium"),
    asset: `devthink${__dtversion__}.zip`,
    note: osText("explore.download.chromium.note") },
  {
    icon: Globe,
    channel: osText("explore.download.firefox"),
    asset: `devthink-firefox-${__dtversion__}.xpi`,
    note: osText("explore.download.firefox.note") },
  {
    icon: SquareTerminal,
    channel: osText("explore.download.vscode"),
    asset: `devthink-vscode-${__dtversion__}.vsix`,
    note: osText("explore.download.vscode.note") },
  {
    icon: Boxes,
    channel: osText("explore.download.every"),
    asset: "SHA256SUMS.txt",
    note: osText("explore.download.every.note") },
];

/** The distribution rail: the release channels as trylle cards over the
 * mica, every card walking to the immutable tag that carries its asset. */
export function DownloadRail() {
  return (
    <section className="scroll-mt-24 pb-14" id="builds" aria-labelledby="dt-sec-builds">
      <header className="mb-8 max-w-[56ch]">
        <p className="font-mono text-[10px] tracking-[.08em] text-ink-3">{osText("explore.download.cap")}</p>
        <h2 id="dt-sec-builds" className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          {osText("explore.download.title")}
        </h2>
        <p className="mt-2 text-sm leading-[1.55] text-ink-2">
          {osText("explore.download.sub").replace("{version}", __dtversion__)}
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {CHANNELS.map(({ icon: Icon, channel, asset, note }) => (
          <li key={channel}>
            <a
              href={RELEASETAG}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-2xl bg-s0 p-5 ring-1 ring-hairline-strong transition-[background-color,transform] duration-150 ease-micro hover:bg-s1 active:translate-y-px focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) motion-reduce:transition-none"
              style={{ boxShadow: STRIP_SHADOW }}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon fontSize={15} aria-hidden="true" />
                  {channel}
                </span>
                <ArrowUpRight
                  fontSize={14}
                  aria-hidden="true"
                  className="text-ink-3 transition-colors duration-150 ease-micro group-hover:text-ink motion-reduce:transition-none"
                />
              </span>
              <code className="mt-3 block font-mono text-[11px] text-(--color-win)">{asset}</code>
              <span className="mt-1.5 block text-xs leading-[1.55] text-ink-2">{note}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-ink-2">
        <a
          href={RELEASES}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink underline decoration-hairline-strong underline-offset-4 transition-colors duration-150 ease-micro hover:decoration-ink motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          {osText("explore.download.browse")}
        </a>{" "}
        {osText("explore.download.provenance")}
      </p>
    </section>
  );
}
