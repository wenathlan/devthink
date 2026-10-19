/**
 * imageengine.tsx — the engine card of the image studio: the real matiz
 * engine row the catalog serves, with the honest empty state while the
 * catalog has not answered. Loose component of the image page.
 */
import {ImageRegular} from "@fluentui/react-icons";
import type { NativeApp } from "../../catalog";

export function ImageEngine({ app }: { app: NativeApp | undefined }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <ImageRegular fontSize={15} aria-hidden="true" />
        Engine
      </h2>
      {app ? (
        <p className="dtw-copy">
          Renders queue over the gateway to <code>{app.engine}</code>, the cadria engine.
        </p>
      ) : (
        <p className="dtw-copy">The catalog has not answered the engine yet</p>
      )}
    </section>
  );
}
