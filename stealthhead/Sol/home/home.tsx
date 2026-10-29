/**
 * home page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 * which now lives here as the page mount itself. Since the reform the mount
 * consults the entry gate (entrygate.tsx beside this anchor) before rendering
 * the landing: the first-run flow (intro, onboarding) decides, the landing
 * renders only behind a finished flow.
 */

import {
  ArrowRightRegular as ArrowRight,
  BoxMultipleRegular as Boxes,
  TargetRegular as Crosshair,
  PlugConnectedRegular as PlugZap,
  FlashRegular as Swords,
  TrophyRegular as Trophy,
  Speaker2Regular as Volume2,
} from "@fluentui/react-icons";
// Home.tsx — the LANDING (campaign v3 · r3-stealthhead): the cinematic stage of
// the FPS platform — ONE red rim light over the tactical dark, the drawn
// scope reticle sweeping ±2° as the hero object, the tactical-caps display
// headline and the machined CTA keys; below, the featured match as the ONE
// raised tile (rows served by the site DB), the four domains as hairline
// ledger rows and the footer meta-quad flush to the window floor. The scope
// owns the mark on the landing (the title-bar mark rests, data-landing).
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import { familyrow } from "../../family";
import { familyurl } from "../../familyurl";
import { type LabelKey, labelfill, label } from "../../labels";
import { currentround, listmatches, type MatchLobby, orderlobbies, roundcounts } from "../../match.ts";
import { progressof } from "../../matchrules.ts";
import { observeReveals } from "../../reveal";
import { BrandMark } from "../wingets";
import { toast } from "../toast/Toast.tsx";
import { EntryGate } from "../wingets";
import { Scope } from "../wingets";

/** the four game domains of the platform (navigation, not data) — the text
 * rides the label accessor, the href rides the route table. */
const domains: { href: string; labelKey: LabelKey; aboutKey: LabelKey; metaKey: LabelKey; icon: typeof Crosshair }[] = [
  {
    href: "/match",
    labelKey: "home.domain.match",
    aboutKey: "home.domain.matchAbout",
    metaKey: "home.domain.matchMeta",
    icon: Crosshair,
  },
  {
    href: "/ranking",
    labelKey: "home.domain.ranking",
    aboutKey: "home.domain.rankingAbout",
    metaKey: "home.domain.rankingMeta",
    icon: Trophy,
  },
  {
    href: "/weapons",
    labelKey: "home.domain.weapons",
    aboutKey: "home.domain.weaponsAbout",
    metaKey: "home.domain.weaponsMeta",
    icon: Swords,
  },
  {
    href: "/world",
    labelKey: "home.domain.world",
    aboutKey: "home.domain.worldAbout",
    metaKey: "home.domain.worldMeta",
    icon: Boxes,
  },
];

/**
 * the landing content of the home: the cinematic stage, the featured match
 * tile, the domain ledger and the footer meta-quad — rendered by the anchor
 * only behind a finished first-run flow.
 *
 * home — the in-construction pass: the game is in development, so the
 * cinematic landing of the old face (the scope stage, the featured board,
 * the domain ledger, the meta-quad) is retired and the route answers the
 * honest construction face behind the same entry gate. The first-run flow
 * (intro, onboarding) and the shell rail stay exactly as they were — the
 * root match logic the landing read keeps riding its own files, only this
 * page's face changed.
 */

import { label } from "../../labels";
import { Constructionface, EntryGate } from "../widgets";

/**
 * the home anchor: the entry gate decides first (intro unseen hands to
 * /intro, onboarding unseen hands to /onboarding, null renders while the
 * state resolves) and the construction face mounts only behind a finished
 * flow.
 *
 * @returns the gated construction face element.
 */
export default function Home() {
  return (
    <EntryGate>
      <Constructionface eyebrow={label("home.eyebrow")} />
    </EntryGate>
  );
}
