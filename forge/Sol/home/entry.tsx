// entry component of the home page — the live boot readout of the staging runner.
export function Entry({ note }: { note?: string }) {
  return (
    <section className="entry view-enter" role="status">
      <span className="entry-state">
        <i aria-hidden="true" />
        staging
      </span>
      <span>runner surface staged — the application tree lands here</span>
      <span className="entry-pipe">{note?.trim() ? note : "forge · the devthink family"}</span>
    </section>
  );
}
