// entry component of the home page — the live boot readout of the staging
// floor (the console sign-off strip of the herd landing).
export function Entry({ note }: { note?: string }) {
  return (
    <section className="entry view-enter" role="status">
      <span className="entry-state">
        <i aria-hidden="true" />
        staging
      </span>
      <span>the floor is staged — the herd shelf lists the clone formats</span>
      <span className="entry-pipe">{note?.trim() ? note : "foundry · the devthink family"}</span>
    </section>
  );
}
