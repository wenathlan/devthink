/**
 * settingsrow.tsx — the one mono label/value ledger row the settings cards
 * share (the kv line of the old deck, kept verbatim so the gateway,
 * account and about cards read the same grammar). Loose component of the
 * settings page, riding the dtw kit.
 */

/** one mono label/value line of the settings sections. */
export function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dtw-settings__kv">
      <span className="dtw-settings__kvkey">{label}</span>
      <span className="dtw-settings__kvvalue">{value}</span>
    </div>
  );
}
