// entry component of the home page — the live boot readout of the staging vault.
// the copy rides the labels store (labels.ts).
import { label } from "../../labels";

export function Entry({ note }: { note?: string }) {
  return (
    <section className="entry view-enter" role="status">
      <span className="entry-state">
        <i aria-hidden="true" />
        {label("home.entry.state")}
      </span>
      <span>{label("home.entry.body")}</span>
      <span className="entry-pipe">{note?.trim() ? note : label("home.entry.fallback")}</span>
    </section>
  );
}
