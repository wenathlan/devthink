// entry component of the home page — the live boot readout of the staging vault.
export function Entry({ note }: { note?: string }) {
  return (
    <section className="entry view-enter" role="status">
      <span className="entry-state">
        <i aria-hidden="true" />
        staging
      </span>
      <span>storage staged — the application tree lands here</span>
      <span className="entry-pipe">{note && note.trim() ? note : "vault · the devthink family"}</span>
    </section>
  );
}
