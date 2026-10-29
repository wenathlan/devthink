/**
 * providerrow.tsx — the icon-only provider row of the sign-in face:
 * google and github over the oauthrow.ts contract (the bots are
 * ready on the owner accounts, the client ids ride the env, the single
 * callback page detects the origin by state), plus the cli pairing row
 * under the same icon grammar — the owner order: the brand marks ride
 * alone, the continue-with words never print on the face. The official
 * svg glyphs of each provider (the four color google g, the octocat mark)
 * and the console glyph of the cli draw inline at
 * 18px inside 44px square cells; the words survive as the accessible
 * names only (aria-label and title from the copy store, auth.oauth.*,
 * auth.cli.* — an icon without an accessible name is banned by the house
 * a11y law). Loose component of the auth page, riding the dt-oauthrow kit.
 */
import { WindowConsoleRegular } from "@fluentui/react-icons";
import type { OAuthProvider, ProviderRowView } from "../../account.ts";
import { copy } from "../../copy.ts";

/** the official four color google g mark of the sign in buttons. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.18l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9591v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9641 10.7104c-.1796-.54-.2824-1.1168-.2824-1.7104s.1027-1.1705.2824-1.7104V5.7579H.9591C.3489 6.9861 0 8.456 0 10c0 1.544.3489 3.0136.9591 4.2418l3.005-2.3314z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8955 11.426 0 9 0 5.4818 0 2.4382 2.0168.9591 5.0032l3.005 2.3318C4.6718 5.2057 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

/** the official github octocat mark (the octicon grammar, white on the
 * dark cell exactly the way the github button itself wears it). */
function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** the cli mark of the pairing row: the console glyph of the fluent set. */

const PROVIDER_MARKS: Readonly<Record<OAuthProvider, () => React.JSX.Element>> = Object.freeze({
  google: GoogleMark,
  github: GithubMark,
});

export interface ProviderRowProps {
  /** the honest readiness table of the row (providerRow() of oauthrow.ts). */
  row: ProviderRowView;
  /** the oauth round trip is starting: the row freezes while it lasts. */
  busy: boolean;
  /** the entry: a ready provider starts the round trip. Unconfigured
   * providers never reach here (the row renders them disabled). */
  onBegin: (provider: OAuthProvider) => void;
  /** the cli pairing entry: the simple button answers the invitation link
   * when one rides the url. */
  onPair: () => void;
}

/** ProviderRow — the icon-only provider row under the password well: the
 * provider buttons wearing the official brand marks alone in 44px
 * square cells, the cli pairing button under the same grammar. The
 * continue-with words never print — they ride the accessible names of the
 * buttons (an icon without a name is banned). Zero manual fields: the
 * pairing consumes the invitation link by itself. */
export function ProviderRow({ row, busy, onBegin, onPair }: ProviderRowProps) {
  return (
    <div className="dt-oauthrow" role="group" aria-label={copy("auth.oauth.row")}>
      <div className="dt-oauthrow__btns">
        {row.providers.map((entry) => {
          const Mark = PROVIDER_MARKS[entry.provider];
          return (
            <button
              key={entry.provider}
              type="button"
              className="dt-oauthrow__btn"
              disabled={!entry.ready || busy}
              aria-label={copy(`auth.oauth.${entry.provider}`)}
              title={copy(`auth.oauth.${entry.provider}`)}
              onClick={() => onBegin(entry.provider)}
            >
              <span className="dt-oauthrow__glyph" data-brand={entry.provider} aria-hidden="true">
                <Mark />
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="dt-oauthrow__btn"
          disabled={busy}
          aria-label={copy("auth.cli")}
          title={copy("auth.cli")}
          onClick={onPair}
        >
          <span className="dt-oauthrow__glyph" aria-hidden="true">
            <WindowConsoleRegular fontSize={17} />
          </span>
        </button>
      </div>
    </div>
  );
}
