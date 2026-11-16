/**
 * StudioBrand.tsx — the brand marks, the seamless saddle surfaces and the
 * fluent icon pairs of the devthink studio os surface (the interface 17
 * grammar), one aggregated file per the owner's correlatas law: everything
 * that draws the brand chrome of the studio lives here — the hexagonal
 * devthink mark, the full wordmark svg, the one-piece saddle tab that marries
 * an active tab to the stage below it, the four-edge omni saddle bridge of
 * the overlay sidebar, and the stroke→filled fluent icon pairs the nav and
 * the pickers trade on hover/active.
 *
 * the fluent glyphs ride the official @fluentui/react-icons package of the
 * house (the Regular stroke renders by default, the Filled variant swaps in
 * on the filled flag — the pair law of the package).
 */

import {
  AddRegular,
  AppsRegular,
  ArrowUpRightRegular,
  BotRegular,
  ChatRegular,
  CheckmarkRegular,
  CodeRegular,
  ChevronDownRegular,
  CopyRegular,
  CubeRegular,
  DatabaseRegular,
  DeleteRegular,
  DismissRegular,
  EyeRegular,
  FolderRegular,
  HomeRegular,
  ImageRegular,
  KeyRegular,
  ListRegular,
  PanelLeftRegular,
  PlugConnectedRegular,
  PulseRegular,
  SearchRegular,
  SendRegular,
  SettingsRegular,
  SparkleRegular,
  StopRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
  WindowConsoleRegular,
} from "@fluentui/react-icons";
import { useEffect, useRef, useState, type FC, type ReactNode } from "react";

/* ====================================================================== */
/* 1. the official devthink brand paths and marks                        */
/* ====================================================================== */

export const DEVTHINK_HEX_PATH =
  "m2373400 6435900 11700 21200c20300 36800 45800 63800 81400 86200l2430800 1531500c18700 11800 37700 17300 59800 17300l61800 100c22100 0 41100-5500 59900-17200l2381800-1492800c77300-48400 128400-114600 155700-201600l31100-98600-66100-46900-285500-210900-48700 48800v30800c0 142500-70500 269900-191300 345600L5206700 7608200c-134400 84300-299800 84100-434000-500L2933700 6449200c-119900-75600-190500-203400-190500-345100V3895900c0-142200 70100-269300 190400-345100l1839100-1158500c134100-84600 299700-84800 434000-600l1849100 1158900c120500 75600 191200 203300 191300 345600l200 1732900 26600 26600 355700 250200 26600-26600-9500-2200800c-200-41700-9500-77400-29700-113900l-11600-21000c-20400-36900-46100-64000-81700-86300L5078800 1925000c-18800-11700-37800-17200-60000-17200l-61600 100c-22100 0-41200 5500-59900 17300L2466500 3456700c-35600 22400-61100 49400-81400 86200l-11700 21200c-20300 36700-29600 72700-29600 114700v2642300c0 42000 9300 78000 29600 114800";

export const DEVTHINK_STAR_PATH =
  "m1390600 6943900 3889300-1650500c216400-91800 437600-80400 634200 32600l2695300 1550000-3224100-2475100c-179400-137700-259300-335200-263700-566300l-61500-3209400-498500 4166100c-27700 230800-166300 415800-370500 533800z";

/** the devthink hex + star logo mark (currentColor, scales with className). */
export const DevThinkLogoMark: FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="1250000 1050000 7550000 7300000"
    className={`${className} select-none overflow-visible`}
    fillRule="evenodd"
    clipRule="evenodd"
    aria-hidden="true"
  >
    <path fill="currentColor" d={DEVTHINK_HEX_PATH} />
    <path fill="currentColor" d={DEVTHINK_STAR_PATH} />
  </svg>
);

/** the full devthink wordmark svg (currentColor, scales with className). */
export const DevThinkWordmark: FC<{ className?: string }> = ({ className = "h-4 w-auto" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 23500000 6000000"
    className={`${className} select-none`}
    fillRule="evenodd"
    clipRule="evenodd"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M433700 1492500c-272800 0-417500 205400-417500 406900 0 178300 107500 325600 339000 364400 186000 30900 248100 89100 177800 224700l-153000 290700c-409300 779000-194300 1709100 872400 1713000 1261000 3800 1864600-511600 1864600-1507600 0-949500-351400-1492100-1248600-1492100zm1434700 2569500c-128200 286800-587100 360400-707000-38800L735500 2620300c-78500-263500 41400-438000 392800-499900l1033600-186100c314300-58100 587100 135700 421800 511600zm1981800-2563800v320100c0 169300-83900 267900-224800 267900h-156200c-138700 0-222700 100800-222700 270100v1285300c0 169300 84000 267900 222700 267900h156200c140900 0 224800 98600 224800 268000v322200h2204400v-590200H4072100c-140900 0-221900-98600-221900-267900v-347900h1896400v-590200H3850200v-347200c0-169300 81000-270100 221900-270100h1298600l683900-502200v-85800zm2333900 0 1259200 2798600s2200 0 2200 2100c75100 167200 172900 200800 312300 200800h432100l-265700-590200h323400c164300 0 281800-52100 348200-202900l997100-2208400h-654800l-929900 2063400c-107300 238600-132800 237200-192700 105000l-887600-1967600c-74400-167200-173000-200800-314600-200800zm3812000 0c-173700 0-273700 79300-273700 217900v370100h957700c173700 0 273700 81500 273700 220100v2193400h603000V2306300c0-138600 100600-220100 273600-220100h958500v-588000h-958500c-173000 0-273600 79300-273600 217900v370100h-329300c-173000 0-273700-79300-273700-217900v-370100zm2922300-300v1205400h378800c140900 0 222700 98700 224800 268000v322300h-381000c-138700 0-222600 98600-222600 267900v938200h347500c141100 0 256100-112600 256100-250800v-687400c0-169300 81100-267900 222000-267900h1685500v955300c0 138200 115100 250800 256200 250800h346800V1500100l-603000 459200v744000h-1685500c-140900 0-222000-97800-222000-267900v-629900z"
    />
    <path
      fill="currentColor"
      d="M19263800 1499700v2151900c0 211800-137400 381900-348600 381900-125000 0-252900-71500-321700-177900l-466800-699900-575200-13300 594800 1014400c156600 249000 453600 436700 743800 436700 588800 0 906900-439400 906900-1022600V1499700z"
    />
    <path
      fill="currentColor"
      d="M16894700 4498200h515800V2435100c0-204800 135200-364500 341100-364500 120900 0 234500 68000 304700 166300l2000 2800 452000 668800h590600l-609500-955600c-156500-245400-447000-416900-735700-416900-560300 0-861000 433400-861000 976100z"
    />
    <path
      fill="currentColor"
      d="M20489600 1506100c-227000 0-450600 128800-469100 488800l-87800 1981800c-11400 329700 137000 523000 423700 523000 282600 0 461600-163000 492500-352400 27200-181900-27900-307000-110500-420600l-516500-723800c-128200-181900 71000-333500 234900-155400l1123100 1235300c237800 261500 341400 416900 604100 416900 239000 0 458700-125100 498100-447200l118800-947300c26300-212200-127400-306900-262800-303200-123200 7600-232200 102300-171900 276700l159200 458500c38700 109900-69800 227300-186600 174300l-1402200-632800c-136900-60700-171100-147800-157300-231200 17000-113700 227400-136400 381900-166700l1239700-257700c360400-75800 524900-181900 565800-447200 33900-227300-135700-469800-358700-469800-246800 0-415500 98500-669500 284200l-1019800 750300c-195400 144000-332800 219700-440300 64400-58000-83400-1600-212200 102700-337300l61800-72000c251300-291800 252900-689600-153300-689600"
    />
    <path
      fill="currentColor"
      d="M20790500 5800600c819100 65500 1609700-280500 2232600-875100 149500-144800 292000-298900 426900-457900l-389400-414300c-609300 713200-1314700 1214200-2227400 1141200-1019900-81500-1926900-952200-2408700-1513400-263700-307100-208000-324200-77900-156400l-542000-173400c-37500-11900-1000 118300 83900 327200 506300 1245300 1734800 2028800 2902000 2122100m-4406100-4302600c-138600 0-222700 98600-222700 267900v2207100h378900c140900 0 224800-98600 224800-268000V1498000z"
    />
    <path
      fill="currentColor"
      d="M15685700 4499300h772300c116800 0 215600-73500 246800-183700l75600-266500h-1094700c-141100 0-256200-103300-256200 34800v164700c0 138100 115100 250700 256200 250700"
    />
  </svg>
);

/* ====================================================================== */
/* 2. the seamless one-piece saddle tab & the 4-edge omni bridge         */
/* ====================================================================== */

/**
 * ActiveSaddleTabSurface — the seamless one-piece svg path that marries an
 * active tab to the stage below it: left concave saddle foot → top-left
 * rounded corner → flat top → top-right rounded corner → right concave
 * saddle foot → 1.5px bottom overlap. one continuous path, zero seams,
 * zero negative filets — the width tracks its host through a ResizeObserver.
 */
export const ActiveSaddleTabSurface: FC<{ fillColor: string }> = ({ fillColor }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(160);

  useEffect(() => {
    const el = hostRef.current?.parentElement;
    if (!el) return;
    const update = () => {
      const w = Math.round(el.offsetWidth);
      if (w > 0) setWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const r = 10;
  const totalW = width + r * 2;
  const h = 34;
  const d = [
    `M 0 ${h}`,
    `C ${r * 0.5523} ${h}, ${r} ${h - r * 0.4477}, ${r} ${h - r}`,
    `L ${r} ${r}`,
    `C ${r} ${r * 0.4477}, ${r * 1.4477} 0, ${r * 2} 0`,
    `L ${width} 0`,
    `C ${width + r * 0.5523} 0, ${width + r} ${r * 0.4477}, ${width + r} ${r}`,
    `L ${width + r} ${h - r}`,
    `C ${width + r} ${h - r * 0.4477}, ${width + r * 1.4477} ${h}, ${totalW} ${h}`,
    `L ${totalW} ${h + 1.5}`,
    `L 0 ${h + 1.5}`,
    "Z",
  ].join(" ");

  return (
    <div ref={hostRef} aria-hidden="true" className="saddletab-surface">
      <svg
        width={totalW}
        height={h + 1.5}
        viewBox={`0 0 ${totalW} ${h + 1.5}`}
        fill="none"
        shapeRendering="geometricPrecision"
        className="saddletab-svg"
      >
        <path d={d} fill={fillColor} />
      </svg>
    </div>
  );
};

export type SaddleDockEdge = "left" | "right" | "top" | "bottom";

/**
 * OmniSaddleBridge — the four-edge adaptive saddle bridge of the overlay
 * sidebar: one unified svg path per edge (left curve facing right, right
 * curve facing left, top curve facing down, bottom floor curve facing up)
 * hosting the nav buttons of the docked rail.
 */
export const OmniSaddleBridge: FC<{
  edge: SaddleDockEdge;
  fillColor: string;
  children: ReactNode;
}> = ({ edge, fillColor, children }) => {
  const isHorizontal = edge === "top" || edge === "bottom";

  const renderUnifiedEdgeSvg = () => {
    if (edge === "left") {
      return (
        <svg viewBox="0 0 34 216" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="omnibridge-svg" aria-hidden="true">
          <path
            d="M 0 0 C 0 14, 14 20, 26 26 C 31 28.5, 34 33, 34 40 L 34 176 C 34 183, 31 187.5, 26 190 C 14 196, 0 202, 0 216 Z"
            fill={fillColor}
          />
        </svg>
      );
    }
    if (edge === "right") {
      return (
        <svg viewBox="0 0 34 216" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="omnibridge-svg" aria-hidden="true">
          <path
            d="M 34 0 C 34 14, 20 20, 8 26 C 3 28.5, 0 33, 0 40 L 0 176 C 0 183, 3 187.5, 8 190 C 20 196, 34 202, 34 216 Z"
            fill={fillColor}
          />
        </svg>
      );
    }
    if (edge === "top") {
      return (
        <svg viewBox="0 0 216 34" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="omnibridge-svg" aria-hidden="true">
          <path
            d="M 0 0 C 14 0, 20 14, 26 26 C 28.5 31, 33 34, 40 34 L 176 34 C 183 34, 187.5 31, 190 26 C 196 14, 202 0, 216 0 Z"
            fill={fillColor}
          />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 216 34" preserveAspectRatio="none" shapeRendering="geometricPrecision" className="omnibridge-svg" aria-hidden="true">
        <path
          d="M 0 34 C 14 34, 20 20, 26 8 C 28.5 3, 33 0, 40 0 L 176 0 C 183 0, 187.5 3, 190 8 C 196 20, 202 34, 216 34 Z"
          fill={fillColor}
        />
      </svg>
    );
  };

  return (
    <div className={isHorizontal ? "omnibridge omnibridge--horizontal" : "omnibridge omnibridge--vertical"}>
      {renderUnifiedEdgeSvg()}
      <div className="omnibridge__children">{children}</div>
    </div>
  );
};

/* ====================================================================== */
/* 3. the fluent glyph bundle (regular seats of the house set)            */
/* ====================================================================== */

/** the glyph seats the studio surfaces render — one honest table of the
 * regular fluent icons the family package already carries; the pair swap
 * law rides css where a filled variant joins the frame. */
export const StudioGlyphs = {
  sparkle: SparkleRegular,
  home: HomeRegular,
  layers: AppsRegular,
  chat: ChatRegular,
  check: CheckmarkRegular,
  pulse: PulseRegular,
  plus: AddRegular,
  arrowUpRight: ArrowUpRightRegular,
  send: SendRegular,
  folder: FolderRegular,
  panel: PanelLeftRegular,
  terminal: WindowConsoleRegular,
  checklist: ListRegular,
  settings: SettingsRegular,
  search: SearchRegular,
  close: DismissRegular,
  chevronDown: ChevronDownRegular,
  copy: CopyRegular,
  trash: DeleteRegular,
  stop: StopRegular,
  sun: WeatherSunnyRegular,
  moon: WeatherMoonRegular,
  cube: CubeRegular,
  bot: BotRegular,
  code: CodeRegular,
  gateway: PlugConnectedRegular,
  key: KeyRegular,
  data: DatabaseRegular,
  image: ImageRegular,
  eye: EyeRegular,
} as const;
