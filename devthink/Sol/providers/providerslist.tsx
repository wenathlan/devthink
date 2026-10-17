/**
 * providerslist.tsx — the provider index of the providers app: hairline
 * rows with the active provider leading, the activation action and the
 * state dot. Loose component of the providers page.
 */
import { ArrowSyncRegular, CheckmarkRegular } from "@fluentui/react-icons";

type Provider = { id: string; protocol: string; env: string };

export function ProvidersList({
  rows,
  active,
  paired,
  loading,
  onActivate,
  onRefresh,
}: {
  rows: readonly Provider[];
  active: string;
  paired: boolean;
  loading: boolean;
  onActivate: (provider: Provider) => void;
  onRefresh: () => void;
}) {
  return (
    <>
      <p className="dtw-note">
        <span>{paired ? "Paired gateway" : "Browser-local selection"}</span>
        <span>Credentials remain cli-only</span>
      </p>
      <section className="dtw-card">
        <h2 className="dtw-cardtitle">
          Provider index
          <span className="dtw-navrow__count">{rows.length}</span>
          <button
            type="button"
            className="dtw-action"
            onClick={onRefresh}
            disabled={!paired || loading}
            aria-label="Refresh providers"
          >
            <ArrowSyncRegular fontSize={13} aria-hidden="true" />
            Refresh
          </button>
        </h2>
        <ul className="dtw-providers__rows">
          {rows.map((provider) => {
            const isActive = active === provider.id;
            return (
              <li key={provider.id} className="dtw-providers__row" data-active={isActive ? "true" : undefined}>
                <span className="dtw-providers__dot" data-on={isActive ? "true" : "false"} aria-hidden="true" />
                <div className="dtw-providers__body">
                  <h3>{provider.id}</h3>
                  <p>
                    {provider.protocol}, configured by <code>{provider.env}</code>
                  </p>
                </div>
                <button
                  type="button"
                  className={isActive ? "dtw-action" : "dtw-action dtw-action--primary"}
                  onClick={() => onActivate(provider)}
                >
                  {isActive ? (
                    <>
                      <CheckmarkRegular fontSize={13} aria-hidden="true" />
                      Active
                    </>
                  ) : (
                    "Use provider"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
