/**
 * imageengine.tsx — the engine card of the image studio: the real matiz
 * engine row the catalog serves, with the honest empty state while the
 * catalog has not answered. Loose component of the image page.
 */
import {ImageRegular} from "@fluentui/react-icons";
import type { NativeApp } from "../../catalog";
import { osText } from "../../oslabels.ts";

export function ImageEngine({ app }: { app: NativeApp | undefined }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <ImageRegular fontSize={15} aria-hidden="true" />
        {osText("studios.engine")}
      </h2>
      {app ? (
        <p className="dtw-copy">
          {osText("studios.engineLede")}
          <code>{app.engine}</code>
          {osText("image.engineTail")}
        </p>
      ) : (
        <p className="dtw-copy">{osText("studios.enginePending")}</p>
      )}
    </section>
  );
}
