// hometypes.ts — the types of the home page (moved from Sol/home/types.ts:
// pure logic and contracts ride the app root; the page folder keeps only
// the anchor and its tsx components)
export interface HomeProps {
  /** an optional note line handed to the boot readout (the entry strip) */
  input?: string;
}
