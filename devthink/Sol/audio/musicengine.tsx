/**
 * musicengine.tsx — the engine card of the audio app: the real katexis
 * engine row the catalog serves, with the honest empty state while the
 * catalog has not answered. Loose component of the audio page.
 */
import { MusicNote2Regular } from "@fluentui/react-icons";
import type { NativeApp } from "../../catalog";

export function MusicEngine({ app }: { app: NativeApp | undefined }) {
  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <MusicNote2Regular fontSize={15} aria-hidden="true" />
        Engine
      </h2>
      {app ? (
        <p className="dtw-copy">
          Renders queue over the gateway to <code>{app.engine}</code>, the debonair engine.
        </p>
      ) : (
        <p className="dtw-copy">The catalog has not answered the engine yet</p>
      )}
    </section>
  );
}
