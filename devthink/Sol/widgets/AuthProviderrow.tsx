/**
 * providerrow.tsx — the continue-with-devthink row of the sign-in face:
 * google, github and gitlab over the oauthrow.ts contract (the bots are
 * ready on the owner accounts, the client ids ride the env, the single
 * callback page detects the origin by state). Fluent carries no brand
 * glyphs, so the letter mark is the honest code mark of each provider;
 * the row words ride the copy store (auth.oauth.*). Loose component of
 * the auth page, riding the dt-oauthrow kit over the dtw-login fills.
 */
import { copy } from "../../copy.ts";
import type { OAuthProvider, ProviderRowView } from "../../oauthrow.ts";

/** The letter marks the provider buttons wear — fluent carries no brand
 * glyphs, so the letter mark is the honest code mark of each provider. */
const PROVIDER_GLYPHS: Readonly<Record<OAuthProvider, string>> = Object.freeze({
  google: "G",
  github: "GH",
  gitlab: "GL",
});

export interface ProviderRowProps {
  /** the honest readiness table of the row (providerRow() of oauthrow.ts). */
  row: ProviderRowView;
  /** the oauth round trip is starting: the row freezes while it lasts. */
  busy: boolean;
  /** the entry: a ready provider starts the round trip. Unconfigured
   * providers never reach here (the row renders them disabled with the
   * honest note). */
  onBegin: (provider: OAuthProvider) => void;
}

/** ProviderRow — the continue-with-devthink row under the password well,
 * the Windows sign-in options family in the devthink dialect. */
export function ProviderRow({ row, busy, onBegin }: ProviderRowProps) {
  return (
    <div className="dt-oauthrow" role="group" aria-label={copy("auth.oauth.headline")}>
      <p className="dt-oauthrow__headline">{copy("auth.oauth.headline")}</p>
      <div className="dt-oauthrow__btns">
        {row.providers.map((entry) => (
          <button
            key={entry.provider}
            type="button"
            className="dtw-login__create dt-oauthrow__btn"
            disabled={!entry.ready || busy}
            title={entry.ready ? undefined : copy("auth.oauth.unconfigured")}
            onClick={() => onBegin(entry.provider)}
          >
            <span className="dt-oauthrow__glyph" aria-hidden="true">
              {PROVIDER_GLYPHS[entry.provider]}
            </span>
            <span className="dt-oauthrow__label">{copy(`auth.oauth.${entry.provider}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
