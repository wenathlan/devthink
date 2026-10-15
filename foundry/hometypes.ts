// hometypes.ts — the types of the home page (moved from Sol/home/types.ts:
// pure logic and contracts ride the app root; the page folder keeps only
// the anchor and its tsx components) — the note rides the live entry strip;
// optional because the theme anchor mounts the home anchor bare
export interface HomeProps {
  input?: string;
}
