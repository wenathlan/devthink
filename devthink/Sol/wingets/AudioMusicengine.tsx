/**
 * musicengine.tsx — the studio queue card of the audio app: the render
 * status line of the studio queue, with the honest empty state while the
 * catalog has not answered. Loose component of the audio page.
 */
import {MusicNote2Regular} from "@fluentui/react-icons";
import type { NativeApp } from "../../catalog";
import { osText } from "../../oslabels.ts";

export function MusicEngine({ app }: { app: NativeApp | undefined }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <MusicNote2Regular fontSize={15} aria-hidden="true" />
        {osText("studios.engine")}
      </h2>
      {app ? (
        <p className="dtw-copy">{osText("audio.engineTail")}</p>
      ) : (
        <p className="dtw-copy">{osText("studios.enginePending")}</p>
      )}
    </section>
  );
}
