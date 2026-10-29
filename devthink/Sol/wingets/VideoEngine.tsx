/**
 * engine.tsx — the studio queue card of the video app: the render status
 * line of the studio queue, with the honest empty state while the catalog
 * has not answered. Loose component of the video page.
 */
import {MoviesAndTvRegular} from "@fluentui/react-icons";
import type { NativeApp } from "../../catalog";
import { osText } from "../../oslabels.ts";

export function VideoEngine({ app }: { app: NativeApp | undefined }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <MoviesAndTvRegular fontSize={15} aria-hidden="true" />
        {osText("studios.engine")}
      </h2>
      {app ? (
        <p className="dtw-copy">{osText("video.engineTail")}</p>
      ) : (
        <p className="dtw-copy">{osText("studios.enginePending")}</p>
      )}
    </section>
  );
}
