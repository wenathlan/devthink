/**
 * providerslist.tsx — the provider index of the providers app: hairline
 * rows with the active provider leading, the activation action and the
 * state dot. Loose component of the providers page.
 */
import {ArrowSyncRegular, CheckmarkRegular} from "@fluentui/react-icons";
import { osText } from "../../../oslabels.ts";

type Provider = { id: string; protocol: string; env: string };

export function ProvidersList({
  rows,
  active,
  paired,
  loading,
  onActivate,
  onRefresh }: {
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
        <span>{paired ? osText("providers.note.paired") : osText("providers.note.local")}</span>
        <span>{osText("providers.note.cliOnly")}</span>
      </p>
      <section className="dtw-card">
        <h2 className="dtw-cardtitle">
          {osText("providers.index.title")}
          <span className="dtw-navrow__count">{rows.length}</span>
          <button
            type="button"
            className="dtw-action"
            onClick={onRefresh}
            disabled={!paired || loading}
            aria-label={osText("providers.index.refresh.aria")}
          >
            <ArrowSyncRegular fontSize={13} aria-hidden="true" />
            {osText("providers.index.refresh")}
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
                    {provider.protocol}
                    {osText("providers.row.configuredBy")}
                    <code>{provider.env}</code>
                  </p>
                </div>
                <button
                  type="button"
                  className={isActive ? "dtw-action" : "dtw-action dtw-action--primary"}
                  onClick={() => onActivate(provider)}
                  aria-label={
                    isActive
                      ? osText("providers.row.activeAria").replace("{id}", provider.id)
                      : osText("providers.row.useAria").replace("{id}", provider.id)
                  }
                >
                  {isActive ? (
                    <>
                      <CheckmarkRegular fontSize={13} aria-hidden="true" />
                      {osText("providers.row.active")}
                    </>
                  ) : (
                    osText("providers.row.use")
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
