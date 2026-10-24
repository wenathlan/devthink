/**
 * versions page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

import { WindowConsoleRegular } from "@fluentui/react-icons";
/**
 * Versions.tsx — the versions page of the getry Sol theme (campaign v3 ·
 * r3): the gateway registry as one operational split — the five replica
 * rows (version tag as the giant display column, provider tag chip, state
 * as a live-dot, the seven routes as chips) with the canonical parser
 * pattern as the rail, and the quick-start calls below. every row reads
 * gateway.ts; nothing is invented.
 */
import { useEffect, useState } from "react";
import { type GatewayVersion, listversions, liveversions, PARSERSTEPS, totalroutes } from "../../gateway";
import { label, labelfill } from "../../labels";
import { observeReveals } from "../../reveal";
import { toast } from "../toast/Toast.tsx";

/** the quick-start calls the gateway answers out of the box (the copy law). */
const QUICKSTART = label("versions.quickstart");

/**
 * renders one gateway row of the registry ledger.
 *
 * @param version the gateway version row.
 * @returns the row element.
 */
function Gaterow({ version }: { version: GatewayVersion }) {
  const paused = version.badge !== "live";
  return (
    <article className="gaterow reveal" data-paused={paused ? "true" : undefined}>
      <div className="gaterow__id">
        <h3 className="gaterow__v">{version.v}</h3>
        <span className="gaterow__state">
          <i className="r3-livedot" data-live={paused ? undefined : "true"} aria-hidden="true" />
          {version.badge}
        </span>
        <span className="r3-tag">{version.provider}</span>
      </div>
      <div className="gaterow__body">
        <p className="gaterow__provider">{version.provider}</p>
        <p className="gaterow__pattern">{version.pattern}</p>
        <p className="gaterow__models">{version.models}</p>
        <p className="gaterow__note">{version.note}</p>
      </div>
      <div className="gaterow__routes">
        <p className="gaterow__count">{labelfill("versions.row.routes", { count: String(version.routes.length) })}</p>
        <div className="gaterow__chips">
          {version.routes.map((route) => (
            <button
              key={route}
              type="button"
              className="routechip"
              onClick={() =>
                toast(
                  labelfill("versions.toast.route", { endpoint: `/${version.v}/${route}` }),
                  "info",
                )
              }
            >
              /{version.v}/{route}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * the versions page.
 *
 * @returns the versions element.
 */
export default function Versions() {
  const [versions] = useState<GatewayVersion[]>(() => listversions());

  useEffect(() => {
    observeReveals();
  }, []);

  return (
    <>
      <section className="pagehead halftone">
        <p className="eyebrow">{label("versions.eyebrow")}</p>
        <h1>{label("versions.title")}</h1>
        <p>{label("versions.lede")}</p>
      </section>

      <section className="section r3-ops" aria-label={label("versions.registry.aria")}>
        <div className="r3-split">
          <div className="gatelog r3-gatelog">
            {versions.map((version) => (
              <Gaterow key={version.v} version={version} />
            ))}
          </div>

          <aside className="r3-rail">
            <div className="railmeta reveal">
              <p className="railmeta__head">{label("versions.parser.head")}</p>
              <ol className="parserlist r3-parser">
                {PARSERSTEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="railmeta reveal">
              <p className="railmeta__head">{label("versions.glance.head")}</p>
              <div className="railmeta__row">
                <span>{label("versions.glance.replicas")}</span>
                <strong>{versions.length}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("versions.glance.live")}</span>
                <strong>{liveversions().length}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("versions.glance.routes")}</span>
                <strong>{totalroutes()}</strong>
              </div>
              <div className="railmeta__row">
                <span>{label("versions.glance.mask")}</span>
                <strong>devthink</strong>
              </div>
              <p className="railmeta__foot">{label("versions.glance.foot")}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" aria-label={label("versions.quickstart.aria")}>
        <div className="glass card reveal">
          <h2>
            <WindowConsoleRegular fontSize={18} /> {label("versions.quickstart.title")}
          </h2>
          <pre className="codeblock">{QUICKSTART}</pre>
        </div>
      </section>
    </>
  );
}
