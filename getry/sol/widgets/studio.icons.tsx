import React from 'react';

// ============================================================================
// 1. LOGOTIPOS E SVGs PERSONALIZADOS À MÃO (DEVTHINK BRAND & MORPHING)
// ============================================================================

export const DEVTHINK_HEX_PATH =
  'm2373400 6435900 11700 21200c20300 36800 45800 63800 81400 86200l2430800 1531500c18700 11800 37700 17300 59800 17300l61800 100c22100 0 41100-5500 59900-17200l2381800-1492800c77300-48400 128400-114600 155700-201600l31100-98600-66100-46900-285500-210900-48700 48800v30800c0 142500-70500 269900-191300 345600L5206700 7608200c-134400 84300-299800 84100-434000-500L2933700 6449200c-119900-75600-190500-203400-190500-345100V3895900c0-142200 70100-269300 190400-345100l1839100-1158500c134100-84600 299700-84800 434000-600l1849100 1158900c120500 75600 191200 203300 191300 345600l200 1732900 26600 26600 355700 250200 26600-26600-9500-2200800c-200-41700-9500-77400-29700-113900l-11600-21000c-20400-36900-46100-64000-81700-86300L5078800 1925000c-18800-11700-37800-17200-60000-17200l-61600 100c-22100 0-41200 5500-59900 17300L2466500 3456700c-35600 22400-61100 49400-81400 86200l-11700 21200c-20300 36700-29600 72700-29600 114700v2642300c0 42000 9300 78000 29600 114800';

export const DEVTHINK_STAR_PATH =
  'm1390600 6943900 3889300-1650500c216400-91800 437600-80400 634200 32600l2695300 1550000-3224100-2475100c-179400-137700-259300-335200-263700-566300l-61500-3209400-498500 4166100c-27700 230800-166300 415800-370500 533800z';

export const DevThinkLogoMark: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10000000 10000000"
    className={`${className} select-none overflow-visible`}
    fillRule="evenodd"
    clipRule="evenodd"
    aria-hidden="true"
  >
    <path fill="currentColor" d={DEVTHINK_HEX_PATH} />
    <path fill="currentColor" d={DEVTHINK_STAR_PATH} />
  </svg>
);

const DEVTHINK_HEX_PATH_100 =
  'm23.73 64.36 0.12 0.21c0.2 0.37 0.46 0.64 0.81 0.86l24.31 15.31c0.19 0.12 0.38 0.17 0.6 0.17l0.62 0c0.22 0 0.41-0.06 0.6-0.17l23.82-14.93c0.77-0.48 1.28-1.15 1.56-2.02l0.31-0.99-0.66-0.47-2.85-2.11-0.49 0.49v0.31c0 1.43-0.7 2.7-1.91 3.46L52.07 76.08c-1.34 0.84-3 0.84-4.34-0.01L29.34 64.49c-1.2-0.76-1.91-2.03-1.91-3.45V38.96c0-1.42 0.7-2.69 1.9-3.45l18.39-11.59c1.34-0.85 3-0.85 4.34-0.01l18.49 11.59c1.21 0.76 1.91 2.03 1.91 3.46l0 17.33 0.27 0.27 3.56 2.5 0.27-0.27-0.1-22.01c0-0.42-0.1-0.77-0.3-1.14l-0.12-0.21c-0.2-0.37-0.46-0.64-0.82-0.86L50.79 19.25c-0.19-0.12-0.38-0.17-0.6-0.17l-0.62 0c-0.22 0-0.41 0.06-0.6 0.17L24.66 34.57c-0.36 0.22-0.61 0.49-0.81 0.86l-0.12 0.21c-0.2 0.37-0.3 0.73-0.3 1.15v26.42c0 0.42 0.09 0.78 0.3 1.15';

const DEVTHINK_STAR_PATH_100 =
  'm13.91 69.44 38.89-16.5c2.16-0.92 4.38-0.8 6.34 0.33l26.95 15.5-32.24-24.75c-1.79-1.38-2.59-3.35-2.64-5.66l-0.61-32.09-4.99 41.66c-0.28 2.31-1.66 4.16-3.71 5.34z';

export const DevThinkLogoOutline: React.FC<{ className?: string }> = ({
  className = 'w-52 h-52',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={`${className} select-none`}
    fill="none"
    aria-hidden="true"
  >
    <path
      d={DEVTHINK_HEX_PATH_100}
      stroke="currentColor"
      strokeWidth={0.55}
      strokeLinejoin="round"
    />
    <path
      d={DEVTHINK_STAR_PATH_100}
      stroke="currentColor"
      strokeWidth={0.55}
      strokeLinejoin="round"
    />
  </svg>
);

export const DevThinkWordmark: React.FC<{ className?: string }> = ({
  className = 'h-3.5 w-auto',
}) => (
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

export type IconProps = { className?: string; filled?: boolean };

// ============================================================================
// 2. ÍCONES SVG PERSONALIZADOS À MÃO (ESTILO FLUENT UI 24x24 — STROKE -> FILLED)
// ============================================================================

export const FluentHome: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M10.8 3.2a1.9 1.9 0 0 1 2.4 0l6.5 5.5a2 2 0 0 1 .7 1.52v8.53A1.75 1.75 0 0 1 18.65 20.5H14.5v-5.25a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v5.25H5.35A1.75 1.75 0 0 1 3.6 18.75v-8.53a2 2 0 0 1 .7-1.52l6.5-5.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M10.55 2.53a2.25 2.25 0 0 1 2.9 0l6.75 5.68c.5.43.8 1.06.8 1.72v9.32A1.75 1.75 0 0 1 19.25 21h-4.5a1.25 1.25 0 0 1-1.25-1.25v-5a1.5 1.5 0 0 0-3 0v5A1.25 1.25 0 0 1 9.25 21h-4.5A1.75 1.75 0 0 1 3 19.25V9.93c0-.66.3-1.3.8-1.72l6.75-5.68Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentChat: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 3.75a8.25 8.25 0 0 1 8.25 8.25c0 4.56-3.69 8.25-8.25 8.25-1.5 0-2.9-.4-4.12-1.1L4.2 20l.85-3.68A8.21 8.21 0 0 1 3.75 12c0-4.56 3.69-8.25 8.25-8.25Zm-3.25 7h6.5m-6.5 3h4.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M12 3a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9-1.6 0-3.11-.42-4.42-1.16l-3.68.92a.75.75 0 0 1-.91-.91l.92-3.68A8.96 8.96 0 0 1 3 12c0-4.97 4.03-9 9-9Zm-3.25 7.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const HomeChatMorphLogo: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <span
    className={`dt-morph-logo relative inline-flex items-center justify-center shrink-0 ${className}`}
    aria-hidden="true"
  >
    <FluentHome className="dt-morph-chat absolute inset-0 h-full w-full" />
    <FluentChat className="dt-morph-brand absolute inset-0 h-full w-full" />
  </span>
);

export const NewChatMorphLogo: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <span
    className={`dt-morph-logo relative inline-flex items-center justify-center shrink-0 ${className}`}
    aria-hidden="true"
  >
    <FluentChat className="dt-morph-chat absolute inset-0 h-full w-full" />
    <DevThinkLogoMark className="dt-morph-brand absolute inset-0 h-full w-full" />
  </span>
);

export const FluentLayers: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 3 3.5 7.25 12 11.5l8.5-4.25L12 3Zm-8.5 9L12 16.25 20.5 12M3.5 16.5 12 20.75l8.5-4.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M11.24 2.18a1.75 1.75 0 0 1 1.52 0l8.25 4a1 1 0 0 1 0 1.8l-8.25 4a1.75 1.75 0 0 1-1.52 0l-8.25-4a1 1 0 0 1 0-1.8l8.25-4ZM3.43 11.55a.75.75 0 0 1 1.02-.3l7.55 3.66 7.55-3.66a.75.75 0 1 1 .65 1.35l-7.87 3.82a.75.75 0 0 1-.66 0l-7.87-3.82a.75.75 0 0 1-.37-1.05Zm0 4.5a.75.75 0 0 1 1.02-.3L12 19.41l7.55-3.66a.75.75 0 1 1 .65 1.35l-7.87 3.82a.75.75 0 0 1-.66 0l-7.87-3.82a.75.75 0 0 1-.37-1.05Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentSparkle: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.75 14.3 8.1l5.35 2.3-5.35 2.3L12 18.05l-2.3-5.35-5.35-2.3 5.35-2.3L12 2.75Zm7.25 12.75.85 1.9 1.9.85-1.9.85-.85 1.9-.85-1.9-1.9-.85 1.9-.85.85-1.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M11.18 2.38a.9.9 0 0 1 1.64 0l2.14 4.86a2.25 2.25 0 0 0 1.18 1.18l4.86 2.14a.9.9 0 0 1 0 1.64l-4.86 2.14a2.25 2.25 0 0 0-1.18 1.18l-2.14 4.86a.9.9 0 0 1-1.64 0l-2.14-4.86a2.25 2.25 0 0 0-1.18-1.18L2.98 12.2a.9.9 0 0 1 0-1.64l4.86-2.14a2.25 2.25 0 0 0 1.18-1.18l2.16-4.86ZM19 15.5a.5.5 0 0 1 .9 0l.8 1.8 1.8.8a.5.5 0 0 1 0 .9l-1.8.8-.8 1.8a.5.5 0 0 1-.9 0l-.8-1.8-1.8-.8a.5.5 0 0 1 0-.9l1.8-.8.8-1.8Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentPlus: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 4a.75.75 0 0 1 .75.75v6.5h6.5a.75.75 0 0 1 0 1.5h-6.5v6.5a.75.75 0 0 1-1.5 0v-6.5h-6.5a.75.75 0 0 1 0-1.5h6.5v-6.5A.75.75 0 0 1 12 4Z" />
  </svg>
);

export const FluentCheck: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.78 5.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L9.75 14.94l8.97-8.97a.75.75 0 0 1 1.06 0Z" />
  </svg>
);

export const FluentArrowUp: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.22 10.78a.75.75 0 0 0 1.06 0l4.97-4.97V20a.75.75 0 0 0 1.5 0V5.81l4.97 4.97a.75.75 0 1 0 1.06-1.06l-6.25-6.25a.75.75 0 0 0-1.06 0l-6.25 6.25a.75.75 0 0 0 0 1.06Z" />
  </svg>
);

export const FluentArrowDown: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.78 13.22a.75.75 0 0 0-1.06 0l-4.97 4.97V4a.75.75 0 0 0-1.5 0v14.19l-4.97-4.97a.75.75 0 1 0-1.06 1.06l6.25 6.25a.75.75 0 0 0 1.06 0l6.25-6.25a.75.75 0 0 0 0-1.06Z" />
  </svg>
);

export const FluentEdit: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.94 4.19a3.22 3.22 0 0 1 4.55 4.55l-9.2 9.2a3.25 3.25 0 0 1-1.39.81l-3.68 1.05a.75.75 0 0 1-.93-.93l1.05-3.68c.16-.53.44-1.01.81-1.39l9.79-9.61Zm3.49 1.06a1.72 1.72 0 0 0-2.43 0L5.98 14.27a1.75 1.75 0 0 0-.44.75l-.73 2.55 2.55-.73c.28-.08.54-.23.75-.44l9.32-9.32a1.72 1.72 0 0 0 0-2.43Z" />
  </svg>
);

export const FluentSearch: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M10 3a7 7 0 1 0 4.4 12.44l4.83 4.83a.75.75 0 1 0 1.06-1.06l-4.83-4.83A7 7 0 0 0 10 3Zm-5.5 7a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" />
  </svg>
);

export const FluentDismiss: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L12 10.94l6.72-6.72a.75.75 0 1 1 1.06 1.06L13.06 12l6.72 6.72a.75.75 0 1 1-1.06 1.06L12 13.06l-6.72 6.72a.75.75 0 0 1-1.06-1.06L10.94 12 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

export const FluentChevronDown: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.22 8.47a.75.75 0 0 1 1.06 0L12 15.19l6.72-6.72a.75.75 0 1 1 1.06 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L4.22 9.53a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

export const FluentChevronRight: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8.47 4.22a.75.75 0 0 1 1.06 0l7.25 7.25a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 1 1-1.06-1.06L15.19 12 8.47 5.28a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

export const FluentPanelLeftClose: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M6.25 4A3.25 3.25 0 0 0 3 7.25v9.5A3.25 3.25 0 0 0 6.25 20h11.5A3.25 3.25 0 0 0 21 16.75v-9.5A3.25 3.25 0 0 0 17.75 4H6.25ZM4.5 7.25c0-.97.78-1.75 1.75-1.75H9v13H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.5Zm6 11.25v-13h7.25c.97 0 1.75.78 1.75 1.75v9.5c0 .97-.78 1.75-1.75 1.75H10.5Zm5.53-9.22a.75.75 0 1 0-1.06-1.06l-2.75 2.75a.75.75 0 0 0 0 1.06l2.75 2.75a.75.75 0 1 0 1.06-1.06L13.81 11.5l2.22-2.22Z" />
  </svg>
);

export const FluentPanelLeftOpen: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M6.25 4A3.25 3.25 0 0 0 3 7.25v9.5A3.25 3.25 0 0 0 6.25 20h11.5A3.25 3.25 0 0 0 21 16.75v-9.5A3.25 3.25 0 0 0 17.75 4H6.25ZM4.5 7.25c0-.97.78-1.75 1.75-1.75H9v13H6.25a1.75 1.75 0 0 1-1.75-1.75v-9.5Zm6 11.25v-13h7.25c.97 0 1.75.78 1.75 1.75v9.5c0 .97-.78 1.75-1.75 1.75H10.5Zm2.47-9.22a.75.75 0 0 1 1.06-1.06l2.75 2.75a.75.75 0 0 1 0 1.06l-2.75 2.75a.75.75 0 1 1-1.06-1.06l2.22-2.22-2.22-2.22Z" />
  </svg>
);

export const FluentMenu: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" />
  </svg>
);

export const FluentDelete: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M4.75 6.75h14.5M9.25 6.75V5a1.5 1.5 0 0 1 1.5-1.5h2.5a1.5 1.5 0 0 1 1.5 1.5v1.75m-8 0 .8 11.2a2 2 0 0 0 2 1.85h5.9a2 2 0 0 0 2-1.85l.8-11.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M10 2.5a2 2 0 0 0-1.94 1.5H4.75a.75.75 0 0 0 0 1.5h.79l1.02 12.66A2.75 2.75 0 0 0 9.3 20.7h5.4a2.75 2.75 0 0 0 2.74-2.54L18.46 5.5h.79a.75.75 0 0 0 0-1.5h-3.31A2 2 0 0 0 14 2.5h-4ZM14.37 4h-4.74a.5.5 0 0 1 .37-.17h4a.5.5 0 0 1 .37.17ZM7.05 5.5h9.9l-.99 12.54a1.25 1.25 0 0 1-1.26 1.16H9.3a1.25 1.25 0 0 1-1.26-1.16L7.05 5.5Zm3.45 3a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Zm3 0a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentImageAdd: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 3A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21h12.5A2.75 2.75 0 0 0 21 18.25V5.75A2.75 2.75 0 0 0 18.25 3H5.75ZM4.5 5.75c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v9.34l-3.22-3.22a1.75 1.75 0 0 0-2.47 0l-1.92 1.92-3.22-3.22a1.75 1.75 0 0 0-2.47 0L4.5 13.09V5.75Zm0 9.46 2.76-2.76a.25.25 0 0 1 .35 0l5.9 5.9H5.75c-.69 0-1.25-.56-1.25-1.25v-1.89Zm10.72 3.14-2.27-2.27 1.92-1.92a.25.25 0 0 1 .35 0l4.28 4.28c-.07.61-.59 1.06-1.25 1.06h-3.03V18.35ZM16 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
  </svg>
);

export const FluentEye: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 5c4.73 0 8.58 3.26 9.65 7.64a.75.75 0 0 1-1.45.36C19.29 9.25 15.96 6.5 12 6.5S4.71 9.25 3.8 13a.75.75 0 0 1-1.45-.36C3.42 8.26 7.27 5 12 5Zm0 4a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

export const FluentTerminal: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M5.25 4.75h13.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H5.25a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2Zm2.5 4.5L10.5 12l-2.75 2.75M12.5 14.75h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M5.25 4A3.25 3.25 0 0 0 2 7.25v9.5A3.25 3.25 0 0 0 5.25 20h13.5A3.25 3.25 0 0 0 22 16.75v-9.5A3.25 3.25 0 0 0 18.75 4H5.25ZM3.5 7.25c0-.97.78-1.75 1.75-1.75h13.5c.97 0 1.75.78 1.75 1.75v9.5c0 .97-.78 1.75-1.75 1.75H5.25a1.75 1.75 0 0 1-1.75-1.75v-9.5Zm3.72 1.97a.75.75 0 1 0-1.06 1.06L8.44 12l-2.28 1.72a.75.75 0 1 0 1.06 1.06l2.82-2.18a.75.75 0 0 0 0-1.2L7.22 9.22Zm4.53 5.28a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentSliders: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8.5 5a2.5 2.5 0 0 1 2.45 2h9.3a.75.75 0 0 1 0 1.5h-9.3a2.5 2.5 0 0 1-4.9 0H3.75a.75.75 0 0 1 0-1.5h2.3A2.5 2.5 0 0 1 8.5 5Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm7 4a2.5 2.5 0 0 1 2.45 2h2.3a.75.75 0 0 1 0 1.5h-2.3a2.5 2.5 0 0 1-4.9 0H3.75a.75.75 0 0 1 0-1.5h9.3a2.5 2.5 0 0 1 2.45-2Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-6 4a2.5 2.5 0 0 1 2.45 2h8.3a.75.75 0 0 1 0 1.5h-8.3a2.5 2.5 0 0 1-4.9 0H3.75a.75.75 0 0 1 0-1.5h3.3a2.5 2.5 0 0 1 2.45-2Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  </svg>
);

export const FluentPulse: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.6 3.02a.75.75 0 0 1 .7.53l3.92 13.71 2.57-6.43a.75.75 0 0 1 .7-.48h3.76a.75.75 0 0 1 0 1.5h-3.25l-3.28 8.2a.75.75 0 0 1-1.42-.07L9.38 6.27 6.81 12.7a.75.75 0 0 1-.7.48H2.75a.75.75 0 0 1 0-1.5h2.85l3.28-8.2a.75.75 0 0 1 .72-.46Z" />
  </svg>
);

export const FluentArrowSync: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.25 12a7.75 7.75 0 0 1 13.66-5h-2.16a.75.75 0 0 0 0 1.5h3.85a.75.75 0 0 0 .75-.75V3.9a.75.75 0 0 0-1.5 0v1.96A9.25 9.25 0 0 0 2.75 12a.75.75 0 0 0 1.5 0Zm15.5 0a7.75 7.75 0 0 1-13.66 5h2.16a.75.75 0 0 0 0-1.5H4.4a.75.75 0 0 0-.75.75v3.85a.75.75 0 0 0 1.5 0v-1.96A9.25 9.25 0 0 0 21.25 12a.75.75 0 0 0-1.5 0Z" />
  </svg>
);

export const FluentSun: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 16.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5ZM12 2.75v2M12 19.25v2M4.75 4.75l1.4 1.4M17.85 17.85l1.4 1.4M2.75 12h2M19.25 12h2M4.75 19.25l1.4-1.4M17.85 6.15l1.4-1.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-4.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 16.5a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM3 12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 12Zm15 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 18 12ZM5.64 5.64a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06L5.64 6.7a.75.75 0 0 1 0-1.06Zm10.6 10.6a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Zm2.12-10.6a.75.75 0 0 1 0 1.06L17.3 7.76a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm-10.6 10.6a.75.75 0 0 1 0 1.06L6.7 18.36a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentMoon: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12.9 3.6a7.8 7.8 0 0 0 7.5 9.8 8.5 8.5 0 1 1-7.5-9.8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M10.27 3.1a.75.75 0 0 1 .56.92 7.5 7.5 0 0 0 9.15 9.15.75.75 0 0 1 .93.92A9.25 9.25 0 1 1 9.35 3.12a.75.75 0 0 1 .92-.02Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentCopy: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M8.5 4.75h8A1.75 1.75 0 0 1 18.25 6.5v9.75A1.75 1.75 0 0 1 16.5 18h-8a1.75 1.75 0 0 1-1.75-1.75V6.5A1.75 1.75 0 0 1 8.5 4.75ZM4.75 8.5v9A2.25 2.25 0 0 0 7 19.75h7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M8.75 3A2.75 2.75 0 0 0 6 5.75v9.5A2.75 2.75 0 0 0 8.75 18h6.5A2.75 2.75 0 0 0 18 15.25v-9.5A2.75 2.75 0 0 0 15.25 3h-6.5ZM7.5 5.75c0-.69.56-1.25 1.25-1.25h6.5c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-9.5ZM4.5 7.5a.75.75 0 0 0-1.5 0v8.75A4.75 4.75 0 0 0 7.75 21h6.75a.75.75 0 0 0 0-1.5H7.75a3.25 3.25 0 0 1-3.25-3.25V7.5Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentDownload: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 3a.75.75 0 0 1 .75.75v9.44l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06l2.72 2.72V3.75A.75.75 0 0 1 12 3Zm-7 13.75a.75.75 0 0 1 .75.75v.75c0 .69.56 1.25 1.25 1.25h10c.69 0 1.25-.56 1.25-1.25v-.75a.75.75 0 0 1 1.5 0v.75A2.75 2.75 0 0 1 17 21H7a2.75 2.75 0 0 1-2.75-2.75v-.75a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

export const FluentStop: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2.5" />
  </svg>
);

export const FluentWarning: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0-8a.75.75 0 0 0-.75.75v5.5a.75.75 0 0 0 1.5 0v-5.5A.75.75 0 0 0 12 7Z" />
  </svg>
);

export const FluentKey: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M15 3a6 6 0 0 1 0 12 5.98 5.98 0 0 1-2.97-.79l-1.53 1.54v2.25a.75.75 0 0 1-.75.75H7.5V20a.75.75 0 0 1-.75.75H4a1 1 0 0 1-1-1v-2.8a1 1 0 0 1 .29-.7l6.24-6.25A6 6 0 0 1 15 3Zm1.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
  </svg>
);

export const FluentDimensions: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.75 4A1.75 1.75 0 0 0 3 5.75v12.5C3 19.22 3.78 20 4.75 20h14.5A1.75 1.75 0 0 0 21 18.25V5.75C21 4.78 20.22 4 19.25 4H4.75Zm.75 1.5h13a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25V5.75c0-.14.11-.25.25-.25Zm2.25 2.25a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V9.25h2.75a.75.75 0 0 0 0-1.5H7.75Zm8.5 8.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.5 0v2.75h-2.75a.75.75 0 0 0 0 1.5h3.5Z" />
  </svg>
);

export const FluentImage: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 3A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21h12.5A2.75 2.75 0 0 0 21 18.25V5.75A2.75 2.75 0 0 0 18.25 3H5.75ZM8.5 7.25a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Zm9.5 10.25H6l3.6-4.8a.75.75 0 0 1 1.16-.05l2.1 2.38 2.65-3.53a.75.75 0 0 1 1.2 0L18 17.5Z" />
  </svg>
);

export const FluentSend: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M3.75 4.25 20.25 12l-16.5 7.75 2.1-6.5L12.5 12l-6.65-1.25-2.1-6.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M3.11 3.05a1 1 0 0 1 1.08-.1l16.5 8.25a1 1 0 0 1 0 1.79l-16.5 8.25a1 1 0 0 1-1.4-1.15l1.92-6.84H12a.75.75 0 0 0 0-1.5H4.71L2.79 4.91a1 1 0 0 1 .32-1.86Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentCode: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M8.75 6.75 3.5 12l5.25 5.25m6.5-10.5L20.5 12l-5.25 5.25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M8.78 6.47a.75.75 0 0 1 0 1.06L4.31 12l4.47 4.47a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 0Zm6.44 0a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L19.69 12l-4.47-4.47a.75.75 0 0 1 0-1.06Zm-1.97-1.44a.75.75 0 0 1 .52.92l-3 11a.75.75 0 0 1-1.44-.4l3-11a.75.75 0 0 1 .92-.52Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentLightbulb: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a7 7 0 0 1 4.53 12.33c-.58.5-.97 1.15-1.11 1.9l-.08.52H8.66l-.08-.52a3.9 3.9 0 0 0-1.11-1.9A7 7 0 0 1 12 2Zm-3 16.25h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Zm1 2.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z" />
  </svg>
);

export const FluentArrowUpRight: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M8.5 5.75h9.75V15.5M18 6 5.75 18.25" />
  </svg>
);

export const FluentSettings: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-.9a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V20a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 5.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10a1.65 1.65 0 0 0 1-1.51V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10c.26.6.77 1.02 1.51 1H20a2 2 0 1 1 0 4h-.09c-.74.02-1.25.44-1.51 1Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M12.01 2.25c.73 0 1.38.48 1.58 1.18l.36 1.29c.52.14 1.01.35 1.47.61l1.16-.67a1.64 1.64 0 0 1 2.05.3l1.17 1.17c.54.54.66 1.37.3 2.05l-.67 1.16c.26.46.47.95.61 1.47l1.29.36c.7.2 1.18.85 1.18 1.58v1.66c0 .73-.48 1.38-1.18 1.58l-1.29.36a6.9 6.9 0 0 1-.61 1.47l.67 1.16c.36.68.24 1.51-.3 2.05l-1.17 1.17c-.54.54-1.37.66-2.05.3l-1.16-.67c-.46.26-.95.47-1.47.61l-.36 1.29a1.64 1.64 0 0 1-1.58 1.18h-1.66a1.64 1.64 0 0 1-1.58-1.18l-.36-1.29a6.9 6.9 0 0 1-1.47-.61l-1.16.67a1.64 1.64 0 0 1-2.05-.3L4.2 19.83a1.64 1.64 0 0 1-.3-2.05l.67-1.16a6.9 6.9 0 0 1-.61-1.47l-1.29-.36a1.64 1.64 0 0 1-1.18-1.58v-1.66c0-.73.48-1.38 1.18-1.58l1.29-.36c.14-.52.35-1.01.61-1.47l-.67-1.16a1.64 1.64 0 0 1 .3-2.05L5.37 4.96c.54-.54 1.37-.66 2.05-.3l1.16.67c.46-.26.95-.47 1.47-.61l.36-1.29a1.64 1.64 0 0 1 1.58-1.18h.02ZM12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentFloatDock: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 4A2.75 2.75 0 0 0 3 6.75v10.5A2.75 2.75 0 0 0 5.75 20h12.5A2.75 2.75 0 0 0 21 17.25V6.75A2.75 2.75 0 0 0 18.25 4H5.75ZM4.5 6.75c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H5.75c-.69 0-1.25-.56-1.25-1.25V6.75ZM6.75 7.5A1.25 1.25 0 0 0 5.5 8.75v6.5A1.25 1.25 0 0 0 6.75 16.5h3.5a1.25 1.25 0 0 0 1.25-1.25v-6.5A1.25 1.25 0 0 0 10.25 7.5h-3.5Z" />
  </svg>
);

export const FluentFloatPanel: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 4A2.75 2.75 0 0 0 3 6.75v10.5A2.75 2.75 0 0 0 5.75 20h12.5A2.75 2.75 0 0 0 21 17.25V6.75A2.75 2.75 0 0 0 18.25 4H5.75ZM4.5 6.75c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H5.75c-.69 0-1.25-.56-1.25-1.25V6.75Zm4.25.75A1.25 1.25 0 0 0 7.5 8.75v6.5A1.25 1.25 0 0 0 8.75 16.5h6.5a1.25 1.25 0 0 0 1.25-1.25v-6.5A1.25 1.25 0 0 0 15.25 7.5h-6.5Z" />
  </svg>
);

export const FluentPin: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.12 3.22a1.75 1.75 0 0 1 2.48 0l2.18 2.18a1.75 1.75 0 0 1 0 2.48l-3.64 3.64a4.25 4.25 0 0 1-.82 4.65l-.73.73a.75.75 0 0 1-1.06 0l-2.97-2.97-4.53 4.53a.75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06l4.53-4.53-2.97-2.97a.75.75 0 0 1 0-1.06l.73-.73a4.25 4.25 0 0 1 4.65-.82l3.64-3.64Zm1.42 1.06a.25.25 0 0 0-.36 0l-3.89 3.9a.75.75 0 0 1-.84.15 2.75 2.75 0 0 0-3.04.5l-.2.2 5.76 5.76.2-.2a2.75 2.75 0 0 0 .5-3.04.75.75 0 0 1 .15-.84l3.9-3.89a.25.25 0 0 0 0-.36l-2.18-2.18Z" />
  </svg>
);

export const FluentDocumentText: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M6.75 3A2.75 2.75 0 0 0 4 5.75v12.5A2.75 2.75 0 0 0 6.75 21h10.5A2.75 2.75 0 0 0 20 18.25V8.66c0-.46-.18-.9-.5-1.22l-3.94-3.94A1.75 1.75 0 0 0 14.34 3H6.75Zm0 1.5h6.75V8c0 .83.67 1.5 1.5 1.5h3.5v8.75c0 .69-.56 1.25-1.25 1.25H6.75c-.69 0-1.25-.56-1.25-1.25V5.75c0-.69.56-1.25 1.25-1.25Zm8.25.81L18.19 8.5H15a.5.5 0 0 1-.5-.5V5.31ZM8.75 11.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" />
  </svg>
);

export const FluentMaximize: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.75 4A.75.75 0 0 0 4 4.75v4.5a.75.75 0 0 0 1.5 0V6.56l4.22 4.22a.75.75 0 1 0 1.06-1.06L6.56 5.5h2.69a.75.75 0 0 0 0-1.5h-4.5Zm14.5 0h-4.5a.75.75 0 0 0 0 1.5h2.69l-4.22 4.22a.75.75 0 1 0 1.06 1.06l4.22-4.22v2.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75ZM5.5 17.44V14.75a.75.75 0 0 0-1.5 0v4.5c0 .41.34.75.75.75h4.5a.75.75 0 0 0 0-1.5H6.56l4.22-4.22a.75.75 0 1 0-1.06-1.06L5.5 17.44Zm13-2.69v2.69l-4.22-4.22a.75.75 0 1 0-1.06 1.06l4.22 4.22h-2.69a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0Z" />
  </svg>
);

export const FluentScrollText: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 4A2.75 2.75 0 0 0 3 6.75v10.5A2.75 2.75 0 0 0 5.75 20h12.5A2.75 2.75 0 0 0 21 17.25V6.75A2.75 2.75 0 0 0 18.25 4H5.75ZM4.5 6.75c0-.69.56-1.25 1.25-1.25h12.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H5.75c-.69 0-1.25-.56-1.25-1.25V6.75Zm7.5 2a.75.75 0 0 1 .75.75v4.44l1.47-1.47a.75.75 0 1 1 1.06 1.06l-2.75 2.75a.75.75 0 0 1-1.06 0l-2.75-2.75a.75.75 0 1 1 1.06-1.06l1.47 1.47V9.5a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

export const FluentCanvasBg: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.75 4A2.75 2.75 0 0 0 2 6.75v10.5A2.75 2.75 0 0 0 4.75 20h14.5A2.75 2.75 0 0 0 22 17.25V6.75A2.75 2.75 0 0 0 19.25 4H4.75ZM3.5 6.75c0-.69.56-1.25 1.25-1.25h14.5c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V6.75Zm4 2.5a.75.75 0 0 0-.75.75v4a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75Zm4.5-1a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 1.5 0V9a.75.75 0 0 0-.75-.75Zm4.5 2a.75.75 0 0 0-.75.75v2a.75.75 0 0 0 1.5 0v-2a.75.75 0 0 0-.75-.75Z" />
  </svg>
);

export const FluentWand: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 3.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 .75-.75Zm5.3 2.2a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM20.75 10.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5H20a.75.75 0 0 1 .75.75Zm-12.5-5.05a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L8.25 6.51a.75.75 0 0 1 0-1.06Zm5.03 3.77a1.75 1.75 0 0 1 2.48 0l.77.77a1.75 1.75 0 0 1 0 2.48L7.28 21.72a1.75 1.75 0 0 1-2.48 0l-.77-.77a1.75 1.75 0 0 1 0-2.48l9.25-9.25Zm1.42 1.06a.25.25 0 0 0-.36 0l-2.09 2.09 1.13 1.13 2.09-2.09a.25.25 0 0 0 0-.36l-.77-.77Zm-3.15 3.15-6.46 6.46a.25.25 0 0 0 0 .36l.77.77a.25.25 0 0 0 .36 0l6.46-6.46-1.13-1.13Z" />
  </svg>
);

export const FluentFolder: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M3 6.75A2 2 0 0 1 5 4.75h3.4a2 2 0 0 1 1.54.72l1.2 1.43a1.5 1.5 0 0 0 1.15.55H19a2 2 0 0 1 2 2v8A2 2 0 0 1 19 19.45H5a2 2 0 0 1-2-2V6.75Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M4.75 4A2.75 2.75 0 0 0 2 6.75v10.5A2.75 2.75 0 0 0 4.75 20h14.5A2.75 2.75 0 0 0 22 17.25v-8A2.75 2.75 0 0 0 19.25 6.5h-6.86a1.25 1.25 0 0 1-.96-.45l-1.15-1.38A2.75 2.75 0 0 0 8.17 4H4.75Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentWorkspaceAdd: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Zm9.5 0A1.5 1.5 0 0 1 15 4h3.5A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5H15a1.5 1.5 0 0 1-1.5-1.5v-4ZM4 15a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 11 15v3.5A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5V15Zm13-1.25v6M14 16.75h6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M5.75 3A2.75 2.75 0 0 0 3 5.75v4.5A2.75 2.75 0 0 0 5.75 13h4.5A2.75 2.75 0 0 0 13 10.25v-4.5A2.75 2.75 0 0 0 10.25 3h-4.5Zm10 0A2.75 2.75 0 0 0 13 5.75v4.5A2.75 2.75 0 0 0 15.75 13h2.5A2.75 2.75 0 0 0 21 10.25v-4.5A2.75 2.75 0 0 0 18.25 3h-2.5ZM3 16.75A2.75 2.75 0 0 1 5.75 14h4.5A2.75 2.75 0 0 1 13 16.75v1.5A2.75 2.75 0 0 1 10.25 21h-4.5A2.75 2.75 0 0 1 3 18.25v-1.5Zm14.75-2.5a.75.75 0 0 1 .75.75v2h2a.75.75 0 0 1 0 1.5h-2v2a.75.75 0 0 1-1.5 0v-2h-2a.75.75 0 0 1 0-1.5h2v-2a.75.75 0 0 1 .75-.75Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentChecklist: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="m4 6.5 1.5 1.5L8 5.5m-4 7 1.5 1.5L8 12m-4 6.5 1.5 1.5L8 17.5M11 6.5h9M11 12.5h9M11 18.5h9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M7.53 4.47a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-1.25-1.25a.75.75 0 1 1 1.06-1.06l.72.72 1.97-1.97a.75.75 0 0 1 1.06 0ZM10.75 5.5a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5Zm-3.22 5.47a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-1.25-1.25a.75.75 0 1 1 1.06-1.06l.72.72 1.97-1.97a.75.75 0 0 1 1.06 0Zm3.22 1.03a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5Zm0 6a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5h-9.5ZM5 17.25a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentSidebarCollapse: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M5.5 4.75h13a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2Zm4 0v14.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M5.75 4A2.75 2.75 0 0 0 3 6.75v10.5A2.75 2.75 0 0 0 5.75 20h12.5A2.75 2.75 0 0 0 21 17.25V6.75A2.75 2.75 0 0 0 18.25 4H5.75ZM9.5 5.5h8.75c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H9.5v-13Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentFloatSidebar: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M5.5 4.25h13A2 2 0 0 1 20.5 6.25v11.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V6.25a2 2 0 0 1 2-2Zm1.25 2.5h2.5v10.5h-2.5V6.75Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M5.75 3A2.75 2.75 0 0 0 3 5.75v12.5A2.75 2.75 0 0 0 5.75 21h12.5A2.75 2.75 0 0 0 21 18.25V5.75A2.75 2.75 0 0 0 18.25 3H5.75Zm.5 3.25A1.25 1.25 0 0 1 7.5 5h2A1.25 1.25 0 0 1 10.75 6.25v11.5A1.25 1.25 0 0 1 9.5 19h-2a1.25 1.25 0 0 1-1.25-1.25V6.25Zm6.25-.75h5.75c.69 0 1.25.56 1.25 1.25v10.5c0 .69-.56 1.25-1.25 1.25H12.5V5.5Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentCube: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="m12 3 8 3.75v10.5L12 21l-8-3.75V6.75L12 3Zm0 7.5 8-3.75M12 10.5 4 6.75M12 10.5V21"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M11.26 2.15a1.75 1.75 0 0 1 1.48 0l7.25 3.38c.61.28 1.01.9 1.01 1.58v9.78c0 .68-.4 1.3-1.01 1.58l-7.25 3.38a1.75 1.75 0 0 1-1.48 0l-7.25-3.38A1.75 1.75 0 0 1 3 16.89V7.11c0-.68.4-1.3 1.01-1.58l7.25-3.38ZM12 3.69 5.36 6.78 12 9.88l6.64-3.1L12 3.69Zm-7.5 4.46v8.59l6.75 3.15v-8.6L4.5 8.15Zm8.25 11.74 6.75-3.15V8.15l-6.75 3.14v8.6Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentBot: React.FC<IconProps> = ({ className = 'w-4 h-4', filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.75v2.5M7.5 5.25h9A3.25 3.25 0 0 1 19.75 8.5v8A3.25 3.25 0 0 1 16.5 19.75h-9A3.25 3.25 0 0 1 4.25 16.5v-8A3.25 3.25 0 0 1 7.5 5.25Zm2 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM9.25 15.75h5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'hidden' : 'block group-hover:hidden'}
    />
    <path
      d="M12 2a1 1 0 0 1 1 1v1.5h3.25A3.75 3.75 0 0 1 20 8.25v8A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8A3.75 3.75 0 0 1 7.75 4.5H11V3a1 1 0 0 1 1-1ZM9.25 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 15.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z"
      fill="currentColor"
      className={filled ? 'block' : 'hidden group-hover:block'}
    />
  </svg>
);

export const FluentMic: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a3.75 3.75 0 0 0-3.75 3.75v5.5a3.75 3.75 0 0 0 7.5 0v-5.5A3.75 3.75 0 0 0 12 2Zm-2.25 3.75a2.25 2.25 0 1 1 4.5 0v5.5a2.25 2.25 0 1 1-4.5 0v-5.5ZM6.5 11.25a.75.75 0 0 0-1.5 0 7 7 0 0 0 6.25 6.96v2.29H8.75a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-2.5v-2.29A7 7 0 0 0 19 11.25a.75.75 0 0 0-1.5 0 5.5 5.5 0 1 1-11 0Z" />
  </svg>
);

export const FluentShield: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M11.67 2.13a.75.75 0 0 1 .66 0l7 3.32c.41.2.67.61.67 1.07v5.23c0 4.69-3.03 8.85-7.65 10.17a1.2 1.2 0 0 1-.7 0C7.03 20.6 4 16.44 4 11.75V6.52c0-.46.26-.87.67-1.07l7-3.32Zm.33 1.52-6.5 3.09v5.01c0 3.97 2.52 7.52 6.5 8.73 3.98-1.21 6.5-4.76 6.5-8.73V6.74L12 3.65ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 12 7.5Zm0 6.75a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
  </svg>
);

export const FluentChevronLeft: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M15.53 4.22a.75.75 0 0 1 0 1.06L8.81 12l6.72 6.72a.75.75 0 1 1-1.06 1.06l-7.25-7.25a.75.75 0 0 1 0-1.06l7.25-7.25a.75.75 0 0 1 1.06 0Z" />
  </svg>
);

export const FluentKeyboard: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.75 5A2.75 2.75 0 0 0 2 7.75v8.5A2.75 2.75 0 0 0 4.75 19h14.5A2.75 2.75 0 0 0 22 16.25v-8.5A2.75 2.75 0 0 0 19.25 5H4.75Zm-1.25 2.75c0-.69.56-1.25 1.25-1.25h14.5c.69 0 1.25.56 1.25 1.25v8.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-8.5ZM6 9.5a.75.75 0 1 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H6Zm4 0a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H10Zm4 0a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H14Zm3.25 0a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM8.75 13.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" />
  </svg>
);

export const FluentBrain: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.25 3A3.75 3.75 0 0 0 5.5 6.75c0 .31.04.62.11.91A3.25 3.25 0 0 0 4 10.5c0 .93.4 1.77 1.03 2.36A3.25 3.25 0 0 0 7.25 19h1a2.75 2.75 0 0 0 2.75-2.75V4.75A1.75 1.75 0 0 0 9.25 3Zm5.5 0A1.75 1.75 0 0 0 13 4.75v11.5A2.75 2.75 0 0 0 15.75 19h1a3.25 3.25 0 0 0 2.22-6.14A3.25 3.25 0 0 0 20 10.5c0-1.2-.65-2.25-1.61-2.84.07-.29.11-.6.11-.91A3.75 3.75 0 0 0 14.75 3Z" />
  </svg>
);

export const FluentModel: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2.9 19.6 7.3v9.4L12 21.1 4.4 16.7V7.3L12 2.9Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M12 12V20.8M12 12 19.4 7.6M12 12 4.6 7.6"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    <circle cx="12" cy="3.1" r="1.45" fill="currentColor" />
    <circle cx="19.5" cy="7.4" r="1.35" fill="currentColor" />
    <circle cx="4.5" cy="7.4" r="1.35" fill="currentColor" />
  </svg>
);

export const FluentChartBar: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.75 13A1.75 1.75 0 0 0 4 14.75v4.5C4 20.22 4.78 21 5.75 21h1.5A1.75 1.75 0 0 0 9 19.25v-4.5A1.75 1.75 0 0 0 7.25 13h-1.5Zm5.5-5A1.75 1.75 0 0 0 9.5 9.75v9.5c0 .97.78 1.75 1.75 1.75h1.5a1.75 1.75 0 0 0 1.75-1.75v-9.5A1.75 1.75 0 0 0 12.75 8h-1.5Zm5.5-5A1.75 1.75 0 0 0 15 4.75v14.5c0 .97.78 1.75 1.75 1.75h1.5A1.75 1.75 0 0 0 20 19.25V4.75A1.75 1.75 0 0 0 18.25 3h-1.5Z" />
  </svg>
);

export const FluentPerson: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 10.5c4.14 0 7.5 2.46 7.5 5.5 0 .83-.67 1.5-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5c0-3.04 3.36-5.5 7.5-5.5Z" />
  </svg>
);

export const FluentEraser: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M14.35 3.9a2.75 2.75 0 0 1 3.89 0l2.86 2.86a2.75 2.75 0 0 1 0 3.89l-7.85 7.85H20a.75.75 0 0 1 0 1.5H9.12a2.75 2.75 0 0 1-1.94-.8l-4.08-4.09a2.75 2.75 0 0 1 0-3.89l7.36-7.32 3.89-3.89Zm-1.06 3.18-5.22 5.22 4.95 4.95 5.22-5.22-4.95-4.95Zm-6.28 6.28-2.85 2.85a1.25 1.25 0 0 0 0 1.77l4.08 4.09c.24.23.55.36.88.36h2.06l1.77-1.77-5.94-5.94-.01-.01.01-.01Z" />
  </svg>
);

export const FluentReasoningSpectrum: React.FC<{
  level: string;
  className?: string;
}> = ({ level, className = 'w-4 h-4' }) => {
  const norm = level.toLowerCase();
  const intensity =
    norm === 'none'
      ? 0
      : norm === 'minimal'
        ? 1
        : norm === 'low'
          ? 2
          : norm === 'medium' || norm === 'default'
            ? 3
            : norm === 'high'
              ? 4
              : 5;

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Inner neural diamond core */}
      <path
        d="M12 7.2 14.9 12 12 16.8 9.1 12 12 7.2Z"
        fill="currentColor"
        style={{
          opacity: intensity === 0 ? 0.28 : 0.72 + intensity * 0.056,
          transformOrigin: '12px 12px',
          transform: `scale(${0.86 + intensity * 0.045})`,
          transition: 'opacity 0.25s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
      {/* Left orbital wave 1 */}
      <path
        d="M7.2 7.8A6.2 6.2 0 0 0 7.2 16.2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        style={{
          opacity: intensity >= 1 ? 0.85 : 0.16,
          transition: 'opacity 0.22s ease',
        }}
      />
      {/* Right orbital wave 1 */}
      <path
        d="M16.8 7.8A6.2 6.2 0 0 1 16.8 16.2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        style={{
          opacity: intensity >= 2 ? 0.85 : 0.16,
          transition: 'opacity 0.22s ease',
        }}
      />
      {/* Left outer resonance arc */}
      <path
        d="M4.4 5.2A9.8 9.8 0 0 0 4.4 18.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          opacity: intensity >= 3 ? 0.78 : 0.12,
          transition: 'opacity 0.26s ease',
        }}
      />
      {/* Right outer resonance arc */}
      <path
        d="M19.6 5.2A9.8 9.8 0 0 1 19.6 18.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{
          opacity: intensity >= 4 ? 0.78 : 0.12,
          transition: 'opacity 0.26s ease',
        }}
      />
      {/* Top & bottom apex sparks for maximum reasoning */}
      <path
        d="M12 2.4V4.5M12 19.5V21.6"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        style={{
          opacity: intensity >= 5 ? 0.95 : 0.12,
          transition: 'opacity 0.28s ease',
        }}
      />
    </svg>
  );
};

export const FluentReasoningStepGlyph: React.FC<{
  level: string;
  className?: string;
}> = ({ level, className = 'w-3.5 h-3.5' }) => {
  const norm = level.toLowerCase();
  if (norm === 'default') {
    return (
      <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
        <path
          d="M10 3.2 15.8 6.5v7L10 16.8 4.2 13.5v-7L10 3.2Z"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinejoin="round"
        />
        <path d="M10 7.2 12.2 10 10 12.8 7.8 10 10 7.2Z" fill="currentColor" />
      </svg>
    );
  }
  const bars =
    norm === 'none'
      ? 0
      : norm === 'minimal'
        ? 1
        : norm === 'low'
          ? 2
          : norm === 'medium'
            ? 3
            : norm === 'high'
              ? 4
              : 5;

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      {bars === 0 ? (
        <path
          d="M4.5 10h11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      ) : (
        <>
          <rect x="2.5" y="12.5" width="2" height="4" rx="1" opacity={bars >= 1 ? 1 : 0.2} />
          <rect x="5.8" y="10.2" width="2" height="6.3" rx="1" opacity={bars >= 2 ? 1 : 0.2} />
          <rect x="9.1" y="7.8" width="2" height="8.7" rx="1" opacity={bars >= 3 ? 1 : 0.2} />
          <rect x="12.4" y="5.4" width="2" height="11.1" rx="1" opacity={bars >= 4 ? 1 : 0.2} />
          <rect x="15.7" y="3.2" width="2" height="13.3" rx="1" opacity={bars >= 5 ? 1 : 0.2} />
        </>
      )}
    </svg>
  );
};

// ============================================================================
// 3. BIBLIOTECA FLUENT UI SYSTEM ICONS (650+ ÍCONES OFICIAIS @fluentui/react-icons)
// ============================================================================

export {
  Add20Regular,
  Apps20Regular,
  ArrowDown20Regular,
  ArrowDownload20Regular,
  ArrowLeft20Regular,
  ArrowRight20Regular,
  ArrowSync20Regular,
  ArrowUp20Regular,
  ArrowUpRight20Regular,
  Attach20Regular,
  AutoFitHeight20Regular,
  AutoFitWidth20Regular,
  Autocorrect20Regular,
  Autopilot20Regular,
  AutopilotFace20Regular,
  Autosum20Regular,
  Backpack20Regular,
  BackpackAdd20Regular,
  Backspace20Regular,
  Book20Regular,
  Bookmark20Regular,
  Bot20Regular,
  BotAdd20Regular,
  BotSparkle20Regular,
  BowTie20Regular,
  BowlChopsticks20Regular,
  BowlSalad20Regular,
  BrainCircuit20Regular,
  BreakoutRoom20Regular,
  Broom20Regular,
  BubbleMultiple20Regular,
  Button20Regular,
  Calculator20Regular,
  CalculatorArrowClockwise20Regular,
  CalculatorMultiple20Regular,
  Calendar20Regular,
  Calendar3Day20Regular,
  CalendarAdd20Regular,
  CalendarAgenda20Regular,
  CalendarAgendaClock20Regular,
  CalendarArrowCounterclockwise20Regular,
  CalendarArrowDown20Regular,
  CalendarArrowRepeatAll20Regular,
  CalendarArrowRight20Regular,
  CalendarAssistant20Regular,
  CalendarCancel20Regular,
  CalendarChat20Regular,
  CalendarCheckmark20Regular,
  CalendarCheckmarkCenter20Regular,
  CalendarCheckmarkSparkle20Regular,
  CalendarClock20Regular,
  CalendarDataBar20Regular,
  CalendarDate20Regular,
  CalendarDay20Regular,
  CalendarEdit20Regular,
  CalendarEmpty20Regular,
  CalendarError20Regular,
  CalendarEye20Regular,
  CalendarInfo20Regular,
  CalendarLock20Regular,
  CalendarLtr20Regular,
  CalendarMail20Regular,
  CalendarMention20Regular,
  CalendarMonth20Regular,
  CalendarMultiple20Regular,
  CalendarNote20Regular,
  CalendarPattern20Regular,
  CalendarPerson20Regular,
  CalendarPhone20Regular,
  CalendarPlay20Regular,
  CalendarQuestionMark20Regular,
  CalendarRecord20Regular,
  CalendarReply20Regular,
  CalendarRtl20Regular,
  CalendarSearch20Regular,
  CalendarSettings20Regular,
  CalendarShield20Regular,
  CalendarSparkle20Regular,
  CalendarStar20Regular,
  CalendarSync20Regular,
  CalendarTemplate20Regular,
  CalendarToday20Regular,
  CalendarToolbox20Regular,
  CalendarVideo20Regular,
  CalendarWeekNumbers20Regular,
  CalendarWeekStart20Regular,
  CalendarWorkWeek20Regular,
  Call20Regular,
  CallAdd20Regular,
  CallCheckmark20Regular,
  CallChevronDown20Regular,
  CallConnecting20Regular,
  CallDismiss20Regular,
  CallEnd20Regular,
  CallExclamation20Regular,
  CallForward20Regular,
  CallInbound20Regular,
  CallMissed20Regular,
  CallOutbound20Regular,
  CallPark20Regular,
  CallPause20Regular,
  CallProhibited20Regular,
  CallRectangleLandscape20Regular,
  CallSquare20Regular,
  CallTransfer20Regular,
  CallWarning20Regular,
  CalligraphyPen20Regular,
  CalligraphyPenCheckmark20Regular,
  CalligraphyPenError20Regular,
  CalligraphyPenQuestionMark20Regular,
  Camera20Regular,
  CameraAdd20Regular,
  CameraArrowUp20Regular,
  CameraDome20Regular,
  CameraEdit20Regular,
  CameraOff20Regular,
  CameraSparkles20Regular,
  CameraSwitch20Regular,
  Cast20Regular,
  CastMultiple20Regular,
  Chat20Regular,
  ChatAdd20Regular,
  ChatSparkle20Regular,
  Checkmark20Regular,
  ChevronDown20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ChevronUp20Regular,
  Class20Regular,
  Classification20Regular,
  Clipboard20Regular,
  Clock20Regular,
  Cloud20Regular,
  Code20Regular,
  CodeBlock20Regular,
  CodeBlockEdit20Regular,
  CodeCircle20Regular,
  CodeOff20Regular,
  CodeText20Regular,
  CodeTextEdit20Regular,
  Collections20Regular,
  CollectionsAdd20Regular,
  CollectionsEmpty20Regular,
  Column20Regular,
  ColumnArrowRight20Regular,
  ColumnDoubleCompare20Regular,
  ColumnEdit20Regular,
  ColumnSingleCompare20Regular,
  ColumnTriple20Regular,
  ColumnTripleEdit20Regular,
  Comma20Regular,
  Comment20Regular,
  CommentAdd20Regular,
  CommentArrowLeft20Regular,
  CommentArrowRight20Regular,
  CommentBadge20Regular,
  CommentCheckmark20Regular,
  CommentDismiss20Regular,
  CommentEdit20Regular,
  CommentError20Regular,
  CommentLightning20Regular,
  CommentLink20Regular,
  CommentMention20Regular,
  CommentMultiple20Regular,
  CommentMultipleCheckmark20Regular,
  CommentMultipleLink20Regular,
  CommentMultipleMention20Regular,
  CommentNote20Regular,
  CommentOff20Regular,
  CommentQuote20Regular,
  CommentText20Regular,
  Communication20Regular,
  CommunicationPerson20Regular,
  CommunicationShield20Regular,
  CompassNorthwest20Regular,
  CompassTrueNorth20Regular,
  Compose20Regular,
  Cookies20Regular,
  Copy20Regular,
  Cube20Regular,
  Cut20Regular,
  DarkTheme20Regular,
  DataArea20Regular,
  DataBarHorizontal20Regular,
  DataBarVertical20Regular,
  DataBarVerticalAdd20Regular,
  DataBarVerticalArrowDown20Regular,
  DataBarVerticalAscending20Regular,
  DataBarVerticalEdit20Regular,
  DataBarVerticalStar20Regular,
  DataFunnel20Regular,
  DataHistogram20Regular,
  DataLine20Regular,
  DataPie20Regular,
  DataScatter20Regular,
  DataSunburst20Regular,
  DataTreemap20Regular,
  DataTrending20Regular,
  DataUsage20Regular,
  DataUsageCheckmark20Regular,
  DataUsageEdit20Regular,
  DataUsageSettings20Regular,
  DataUsageSparkle20Regular,
  DataUsageToolbox20Regular,
  DataWaterfall20Regular,
  DataWhisker20Regular,
  Database20Regular,
  DatabaseArrowDown20Regular,
  DatabaseArrowRight20Regular,
  DatabaseArrowUp20Regular,
  DatabaseCheckmark20Regular,
  DatabaseLightning20Regular,
  DatabaseLink20Regular,
  DatabaseMultiple20Regular,
  DatabasePerson20Regular,
  DatabasePlugConnected20Regular,
  DatabaseSearch20Regular,
  DatabaseSettings20Regular,
  DatabaseSwitch20Regular,
  DatabaseWarning20Regular,
  DatabaseWindow20Regular,
  Delete20Regular,
  DesignIdeas20Regular,
  Desk20Regular,
  DeskCheckmark20Regular,
  DeskMultiple20Regular,
  DeskMultipleCheckmark20Regular,
  DeskSparkle20Regular,
  Desktop20Regular,
  DesktopArrowDown20Regular,
  DesktopArrowDownOff20Regular,
  DesktopArrowRight20Regular,
  DesktopCheckmark20Regular,
  DesktopCursor20Regular,
  DesktopEdit20Regular,
  DesktopFlow20Regular,
  DesktopKeyboard20Regular,
  DesktopMac20Regular,
  DesktopOff20Regular,
  DesktopPulse20Regular,
  DesktopSignal20Regular,
  DesktopSpeaker20Regular,
  DesktopSpeakerOff20Regular,
  DesktopSync20Regular,
  DesktopTag20Regular,
  DesktopToolbox20Regular,
  DesktopTower20Regular,
  Dismiss20Regular,
  Dock20Regular,
  DockRow20Regular,
  Doctor20Regular,
  Document10020Regular,
  Document20Regular,
  DocumentAdd20Regular,
  DocumentArrowDown20Regular,
  DocumentArrowDownOff20Regular,
  DocumentArrowLeft20Regular,
  DocumentArrowRight20Regular,
  DocumentArrowUp20Regular,
  DocumentBorder20Regular,
  DocumentBorderPrint20Regular,
  DocumentBriefcase20Regular,
  DocumentBroken20Regular,
  DocumentBulletList20Regular,
  DocumentBulletListArrowLeft20Regular,
  DocumentBulletListClock20Regular,
  DocumentBulletListCube20Regular,
  DocumentBulletListMultiple20Regular,
  DocumentBulletListOff20Regular,
  DocumentCatchUp20Regular,
  DocumentCheckmark20Regular,
  DocumentChevronDouble20Regular,
  DocumentCopy20Regular,
  DocumentCss20Regular,
  DocumentCsv20Regular,
  DocumentCube20Regular,
  DocumentData20Regular,
  DocumentDataLink20Regular,
  DocumentDataLock20Regular,
  DocumentDatabase20Regular,
  DocumentDismiss20Regular,
  DocumentEdit20Regular,
  DocumentEndnote20Regular,
  DocumentError20Regular,
  DocumentExcel20Regular,
  DocumentFit20Regular,
  DocumentFlowchart20Regular,
  DocumentFolder20Regular,
  DocumentFooter20Regular,
  DocumentFooterDismiss20Regular,
  DocumentGlobe20Regular,
  DocumentHeader20Regular,
  DocumentHeaderArrowDown20Regular,
  DocumentHeaderDismiss20Regular,
  DocumentHeaderFooter20Regular,
  DocumentHeart20Regular,
  DocumentHeartPulse20Regular,
  DocumentImage20Regular,
  DocumentJava20Regular,
  DocumentJavascript20Regular,
  DocumentKey20Regular,
  DocumentLandscape20Regular,
  DocumentLandscapeData20Regular,
  DocumentLandscapeSplit20Regular,
  DocumentLandscapeSplitHint20Regular,
  DocumentLightning20Regular,
  DocumentLink20Regular,
  DocumentLock20Regular,
  DocumentMargins20Regular,
  DocumentMarkdown20Regular,
  DocumentMention20Regular,
  DocumentMultiple20Regular,
  DocumentMultiplePercent20Regular,
  DocumentMultipleProhibited20Regular,
  DocumentMultipleSync20Regular,
  DocumentOnePage20Regular,
  DocumentOnePageAdd20Regular,
  DocumentOnePageColumns20Regular,
  DocumentOnePageLink20Regular,
  DocumentOnePageMultiple20Regular,
  DocumentOnePageMultipleSparkle20Regular,
  DocumentOnePageSparkle20Regular,
  DocumentPageBottomCenter20Regular,
  DocumentPageBottomLeft20Regular,
  DocumentPageBottomRight20Regular,
  DocumentPageBreak20Regular,
  DocumentPageNumber20Regular,
  DocumentPageTopCenter20Regular,
  DocumentPageTopLeft20Regular,
  DocumentPageTopRight20Regular,
  DocumentPdf20Regular,
  DocumentPercent20Regular,
  DocumentPerson20Regular,
  DocumentPill20Regular,
  DocumentPowerpoint20Regular,
  DocumentPrint20Regular,
  DocumentProhibited20Regular,
  DocumentQuestionMark20Regular,
  DocumentQueue20Regular,
  DocumentQueueAdd20Regular,
  DocumentQueueMultiple20Regular,
  DocumentRibbon20Regular,
  DocumentSass20Regular,
  DocumentSave20Regular,
  DocumentSearch20Regular,
  DocumentSettings20Regular,
  DocumentSignature20Regular,
  DocumentSparkle20Regular,
  DocumentSplitHint20Regular,
  DocumentSplitHintOff20Regular,
  DocumentSquare20Regular,
  DocumentSync20Regular,
  DocumentTable20Regular,
  DocumentTableArrowRight20Regular,
  DocumentTableCheckmark20Regular,
  DocumentTableCube20Regular,
  DocumentTableSearch20Regular,
  DocumentTableTruck20Regular,
  DocumentTarget20Regular,
  DocumentText20Regular,
  DocumentTextClock20Regular,
  DocumentTextExtract20Regular,
  DocumentTextLink20Regular,
  DocumentTextToolbox20Regular,
  DocumentToolbox20Regular,
  DocumentWidth20Regular,
  DocumentWord20Regular,
  DocumentYml20Regular,
  DoubleSwipeDown20Regular,
  DoubleSwipeUp20Regular,
  DoubleTapSwipeDown20Regular,
  DoubleTapSwipeUp20Regular,
  Drop20Regular,
  Dust20Regular,
  Edit20Regular,
  Eraser20Regular,
  EraserMedium20Regular,
  EraserSegment20Regular,
  EraserSmall20Regular,
  EraserTool20Regular,
  ErrorCircle20Regular,
  Eye20Regular,
  EyeOff20Regular,
  FStop20Regular,
  FastAcceleration20Regular,
  FastForward20Regular,
  Fax20Regular,
  Filter20Regular,
  Flag20Regular,
  Flash20Regular,
  Folder20Regular,
  Fps120Regular,
  FullScreenMaximize20Regular,
  Gas20Regular,
  GasPropane20Regular,
  GasPump20Regular,
  Gavel20Regular,
  GavelProhibited20Regular,
  Globe20Regular,
  Grid20Regular,
  HapticStrong20Regular,
  HapticWeak20Regular,
  HdOff20Regular,
  Heart20Regular,
  Hexagon20Regular,
  HexagonSparkle20Regular,
  HexagonThree20Regular,
  History20Regular,
  Home20Regular,
  Hourglass20Regular,
  HourglassHalf20Regular,
  HourglassOneQuarter20Regular,
  HourglassThreeQuarter20Regular,
  Image20Regular,
  ImageAdd20Regular,
  ImageSparkle20Regular,
  Info20Regular,
  Insert20Regular,
  ItemCompare20Regular,
  Key20Regular,
  Laptop20Regular,
  LaptopBriefcase20Regular,
  LaptopCheckmark20Regular,
  LaptopDismiss20Regular,
  LaptopOff20Regular,
  LaptopPerson20Regular,
  LaptopSettings20Regular,
  LaptopShield20Regular,
  LaserTool20Regular,
  Lasso20Regular,
  Layer20Regular,
  Lightbulb20Regular,
  Link20Regular,
  List20Regular,
  LockClosed20Regular,
  Lottery20Regular,
  Luggage20Regular,
  Mail20Regular,
  MailAdd20Regular,
  MailAlert20Regular,
  MailAllRead20Regular,
  MailAllUnread20Regular,
  MailArrowClockwise20Regular,
  MailArrowDoubleBack20Regular,
  MailArrowDown20Regular,
  MailArrowForward20Regular,
  MailArrowUp20Regular,
  MailAttach20Regular,
  MailCheckmark20Regular,
  MailClock20Regular,
  MailCopy20Regular,
  MailDataBar20Regular,
  MailDismiss20Regular,
  MailEdit20Regular,
  MailError20Regular,
  MailFishHook20Regular,
  MailInbox20Regular,
  MailInboxAdd20Regular,
  MailInboxAll20Regular,
  MailInboxArrowDown20Regular,
  MailInboxArrowRight20Regular,
  MailInboxArrowUp20Regular,
  MailInboxCheckmark20Regular,
  MailInboxDismiss20Regular,
  MailInboxPerson20Regular,
  MailLink20Regular,
  MailList20Regular,
  MailMultiple20Regular,
  MailOff20Regular,
  MailOpenPerson20Regular,
  MailPause20Regular,
  MailProhibited20Regular,
  MailRead20Regular,
  MailReadBriefcase20Regular,
  MailReadMultiple20Regular,
  MailRewind20Regular,
  MailSettings20Regular,
  MailShield20Regular,
  MailTemplate20Regular,
  MailUnread20Regular,
  MailWarning20Regular,
  Mailbox20Regular,
  Map20Regular,
  MapDrive20Regular,
  MapPin20Regular,
  Maximize20Regular,
  Mic20Regular,
  MoreCircle20Regular,
  MoreHorizontal20Regular,
  MoreVertical20Regular,
  Navigation20Regular,
  NetworkCheck20Regular,
  Note20Regular,
  NoteAdd20Regular,
  NoteEdit20Regular,
  NotePin20Regular,
  Notebook20Regular,
  NotebookAdd20Regular,
  NotebookArrowCurveDown20Regular,
  NotebookError20Regular,
  NotebookEye20Regular,
  NotebookLightning20Regular,
  NotebookQuestionMark20Regular,
  NotebookSection20Regular,
  NotebookSectionArrowRight20Regular,
  NotebookSubsection20Regular,
  NotebookSync20Regular,
  Notepad20Regular,
  NotepadEdit20Regular,
  NotepadPerson20Regular,
  NotepadPersonOff20Regular,
  NotepadSparkle20Regular,
  Options20Regular,
  PaddingDown20Regular,
  PaddingLeft20Regular,
  PaddingRight20Regular,
  PaddingTop20Regular,
  PaintBrush20Regular,
  PanelLeft20Regular,
  PanelLeftContract20Regular,
  PanelLeftExpand20Regular,
  Pause20Regular,
  Person20Regular,
  Pill20Regular,
  Pin20Regular,
  Play20Regular,
  PlugConnected20Regular,
  Production20Regular,
  ProductionCheckmark20Regular,
  Prohibited20Regular,
  ProhibitedMultiple20Regular,
  ProhibitedNote20Regular,
  ProhibitedSmoking20Regular,
  ProjectionScreen20Regular,
  ProjectionScreenDismiss20Regular,
  ProjectionScreenText20Regular,
  ProjectionScreenTextSparkle20Regular,
  Prompt20Regular,
  ProtocolHandler20Regular,
  Pulse20Regular,
  QuestionCircle20Regular,
  RecordStop20Regular,
  Resize20Regular,
  Rhombus20Regular,
  Ribbon20Regular,
  RibbonAdd20Regular,
  RibbonOff20Regular,
  RibbonStar20Regular,
  Road20Regular,
  RoadCone20Regular,
  Rocket20Regular,
  Rss20Regular,
  Sanitize20Regular,
  Save20Regular,
  Scratchpad20Regular,
  ScreenCut20Regular,
  ScreenPerson20Regular,
  ScreenSearch20Regular,
  Screenshot20Regular,
  ScreenshotRecord20Regular,
  Script20Regular,
  Search20Regular,
  SearchInfo20Regular,
  SearchSettings20Regular,
  SearchShield20Regular,
  SearchSparkle20Regular,
  SearchSquare20Regular,
  SearchVisual20Regular,
  Seat20Regular,
  SeatAdd20Regular,
  SeatMultipleStadium20Regular,
  Send20Regular,
  Settings20Regular,
  SettingsChat20Regular,
  SettingsCogMultiple20Regular,
  SettingsSync20Regular,
  ShapeExclude20Regular,
  ShapeIntersect20Regular,
  ShapeOrganic20Regular,
  ShapeSubtract20Regular,
  ShapeUnion20Regular,
  Shapes20Regular,
  Share20Regular,
  ShareAndroid20Regular,
  ShareCloseTray20Regular,
  ShareIos20Regular,
  ShareMultiple20Regular,
  ShareScreenPerson20Regular,
  ShareScreenPersonOverlay20Regular,
  ShareScreenPersonOverlayInside20Regular,
  ShareScreenPersonP20Regular,
  ShareScreenStart20Regular,
  ShareScreenStop20Regular,
  Shield20Regular,
  ShoppingBag20Regular,
  ShoppingBagAdd20Regular,
  ShoppingBagArrowLeft20Regular,
  ShoppingBagCheckmark20Regular,
  ShoppingBagDismiss20Regular,
  ShoppingBagPause20Regular,
  ShoppingBagPercent20Regular,
  ShoppingBagPlay20Regular,
  ShoppingBagTag20Regular,
  Shortpick20Regular,
  Showerhead20Regular,
  SlashForward20Regular,
  Sleep20Regular,
  SlideAdd20Regular,
  SlideArrowForward20Regular,
  SlideArrowRight20Regular,
  SlideContent20Regular,
  SlideEraser20Regular,
  SlideGrid20Regular,
  SlideHide20Regular,
  SlideLayout20Regular,
  SlideLink20Regular,
  SlideMicrophone20Regular,
  SlideMultiple20Regular,
  SlideMultipleArrowRight20Regular,
  SlideMultipleSearch20Regular,
  SlidePlay20Regular,
  SlideRecord20Regular,
  SlideSearch20Regular,
  SlideSettings20Regular,
  SlideSize20Regular,
  SlideText20Regular,
  SlideTextCall20Regular,
  SlideTextCursor20Regular,
  SlideTextEdit20Regular,
  SlideTextMultiple20Regular,
  SlideTextPerson20Regular,
  SlideTextSparkle20Regular,
  SlideTextTitle20Regular,
  SlideTextTitleAdd20Regular,
  SlideTextTitleCheckmark20Regular,
  SlideTextTitleEdit20Regular,
  SlideTopicAdd20Regular,
  SlideTransition20Regular,
  Snooze20Regular,
  Sparkle20Regular,
  Speaker020Regular,
  Speaker120Regular,
  Speaker220Regular,
  SpeakerBluetooth20Regular,
  SpeakerBox20Regular,
  SpeakerBoxKeyboard20Regular,
  SpeakerEdit20Regular,
  SpeakerMute20Regular,
  SpeakerOff20Regular,
  SpeakerSettings20Regular,
  SpeakerUsb20Regular,
  SpinnerIos20Regular,
  Star20Regular,
  Stop20Regular,
  SurfaceEarbuds20Regular,
  SurfaceHub20Regular,
  SyncOff20Regular,
  System20Regular,
  Tab20Regular,
  TabAdd20Regular,
  TabArrowLeft20Regular,
  TabDesktop20Regular,
  TabDesktopArrowClockwise20Regular,
  TabDesktopArrowLeft20Regular,
  TabDesktopBottom20Regular,
  TabDesktopClock20Regular,
  TabDesktopCopy20Regular,
  TabDesktopImage20Regular,
  TabDesktopLink20Regular,
  TabDesktopMultiple20Regular,
  TabDesktopMultipleAdd20Regular,
  TabDesktopMultipleBottom20Regular,
  TabDesktopMultipleSparkle20Regular,
  TabDesktopNewPage20Regular,
  TabDesktopSearch20Regular,
  TabGroup20Regular,
  TabInPrivate20Regular,
  TabInprivateAccount20Regular,
  TabProhibited20Regular,
  TabShieldDismiss20Regular,
  Table20Regular,
  TableAdd20Regular,
  TableAltText20Regular,
  TableArrowRepeatAll20Regular,
  TableArrowUp20Regular,
  TableBottomRow20Regular,
  TableCalculator20Regular,
  TableCellAdd20Regular,
  TableCellCenter20Regular,
  TableCellCenterArrowRepeatAll20Regular,
  TableCellCenterEdit20Regular,
  TableCellCenterLink20Regular,
  TableCellCenterSearch20Regular,
  TableCellCross20Regular,
  TableCellCrossBrush20Regular,
  TableCellEdit20Regular,
  TableCellsMerge20Regular,
  TableCellsSplit20Regular,
  TableChecker20Regular,
  TableColumnTopBottom20Regular,
  TableColumnTopBottomArrowRepeatAll20Regular,
  TableColumnTopBottomEdit20Regular,
  TableColumnTopBottomLink20Regular,
  TableColumnTopBottomSearch20Regular,
  TableCopy20Regular,
  TableCursor20Regular,
  TableDeleteColumn20Regular,
  TableDeleteRow20Regular,
  TableDismiss20Regular,
  TableEdit20Regular,
  TableFreezeColumn20Regular,
  TableFreezeColumnAndRow20Regular,
  TableFreezeColumnAndRowDismiss20Regular,
  TableFreezeColumnDismiss20Regular,
  TableFreezeRow20Regular,
  TableFreezeRowDismiss20Regular,
  TableImage20Regular,
  TableInsertColumn20Regular,
  TableInsertRow20Regular,
  TableLightning20Regular,
  TableLink20Regular,
  TableLock20Regular,
  TableMoveAbove20Regular,
  TableMoveBelow20Regular,
  TableMoveLeft20Regular,
  TableMoveRight20Regular,
  TableMultiple20Regular,
  TableOffset20Regular,
  TableOffsetAdd20Regular,
  TableOffsetLessThanOrEqualTo20Regular,
  TableOffsetSettings20Regular,
  TablePicnic20Regular,
  TableResizeColumn20Regular,
  TableResizeRow20Regular,
  TableSearch20Regular,
  TableSelectRange20Regular,
  TableSettings20Regular,
  TableSimple20Regular,
  TableSimpleCheckmark20Regular,
  TableSimpleExclude20Regular,
  TableSimpleInclude20Regular,
  TableSimpleMultiple20Regular,
  TableSparkle20Regular,
  TableSplit20Regular,
  TableStackAbove20Regular,
  TableStackBelow20Regular,
  TableStackLeft20Regular,
  TableStackRight20Regular,
  TableSwitch20Regular,
  Tablet20Regular,
  TabletLaptop20Regular,
  TabletPhoneDesktop20Regular,
  TabletSpeaker20Regular,
  Tabs20Regular,
  Tag20Regular,
  TextBulletList20Regular,
  ThumbLike20Regular,
  Toolbox20Regular,
  Translate20Regular,
  Trophy20Regular,
  Umbrella20Regular,
  Video20Regular,
  Wand20Regular,
  Warning20Regular,
  Water20Regular,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
  WheelchairAccess20Regular,
  Window20Regular,
  WorkIq20Regular,
  Wrench20Regular,
} from '@fluentui/react-icons';
import type { CountryFlagCode } from '../../studio.gtx';

export const FluentBolt: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.66 2.15a.85.85 0 0 1 .48.99l-1.92 6.61h5.63a.9.9 0 0 1 .72 1.44l-8.1 10.6a.85.85 0 0 1-1.5-.69l1.53-6.6H5.95a.9.9 0 0 1-.73-1.43l7.36-10.58a.85.85 0 0 1 1.08-.34Z" />
  </svg>
);

export const FluentGlobe: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.86 6h-2.92a14.3 14.3 0 0 0-1.55-4.18A8.54 8.54 0 0 1 18.86 8Zm-6.86-4.46c.96 1.15 1.82 2.72 2.38 4.46H9.62c.56-1.74 1.42-3.31 2.38-4.46ZM9.61 3.82A14.3 14.3 0 0 0 8.06 8H5.14a8.54 8.54 0 0 1 4.47-4.18ZM4.26 9.5h3.38c-.16.8-.26 1.64-.26 2.5s.1 1.7.26 2.5H4.26a8.47 8.47 0 0 1 0-5Zm.88 6.5h2.92a14.3 14.3 0 0 0 1.55 4.18A8.54 8.54 0 0 1 5.14 16Zm6.86 4.46c-.96-1.15-1.82-2.72-2.38-4.46h4.76c-.56 1.74-1.42 3.31-2.38 4.46Zm2.7-5.96H9.3a12.7 12.7 0 0 1-.3-2.5c0-.88.11-1.72.3-2.5h5.4c.19.78.3 1.62.3 2.5 0 .88-.11 1.72-.3 2.5Zm-.31 5.68A14.3 14.3 0 0 0 15.94 16h2.92a8.54 8.54 0 0 1-4.47 4.18ZM19.74 14.5h-3.38c.16-.8.26-1.64.26-2.5s-.1-1.7-.26-2.5h3.38a8.47 8.47 0 0 1 0 5Z" />
  </svg>
);

export const CountryFlag: React.FC<{
  code: CountryFlagCode;
  className?: string;
}> = ({ code, className = 'w-7 h-5' }) => {
  const uid = React.useId().replace(/:/g, '');
  const clipId = `flag-clip-${code}-${uid}`;
  const sheenId = `flag-sheen-${code}-${uid}`;

  return (
    <svg
      viewBox="0 0 28 20"
      className={`${className} shrink-0 select-none overflow-hidden rounded-[4px]`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0.25" y="0.25" width="27.5" height="19.5" rx="3.75" />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.24" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.09" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {code === 'US' && (
          <>
            <rect width="28" height="20" fill="#F8FAFC" />
            {[0, 2, 4, 6, 8, 10, 12].map((i) => (
              <rect
                key={i}
                x="0"
                y={(i * 20) / 13}
                width="28"
                height={20 / 13 + 0.08}
                fill="#C82333"
              />
            ))}
            <rect width="12.6" height={(7 * 20) / 13} fill="#1E3A8A" />
            {[2.2, 4.6, 7.0, 9.4].map((cx) => (
              <g key={`r1-${cx}`} fill="#F8FAFC">
                <circle cx={cx} cy="2.3" r="0.58" />
                <circle cx={cx} cy="5.4" r="0.58" />
                <circle cx={cx} cy="8.5" r="0.58" />
              </g>
            ))}
            {[3.4, 5.8, 8.2, 10.6].map((cx) => (
              <g key={`r2-${cx}`} fill="#F8FAFC">
                <circle cx={cx} cy="3.85" r="0.55" />
                <circle cx={cx} cy="6.95" r="0.55" />
              </g>
            ))}
          </>
        )}

        {code === 'BR' && (
          <>
            <rect width="28" height="20" fill="#15803D" />
            <polygon points="14,2.6 24.4,10 14,17.4 3.6,10" fill="#FACC15" />
            <circle cx="14" cy="10" r="3.9" fill="#1D4ED8" />
            <path
              d="M10.4 9.55a5.6 5.6 0 0 1 7.2 1.25"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </>
        )}

        {code === 'ES' && (
          <>
            <rect width="28" height="20" fill="#F59E0B" />
            <rect width="28" height="5" y="0" fill="#C81E1E" />
            <rect width="28" height="5" y="15" fill="#C81E1E" />
            <rect x="6.5" y="7.2" width="3.8" height="5.4" rx="1.2" fill="#B91C1C" opacity="0.9" />
            <rect x="7.4" y="8.2" width="2" height="3.2" rx="0.6" fill="#FDE047" opacity="0.9" />
          </>
        )}

        {code === 'FR' && (
          <>
            <rect width="9.35" height="20" x="0" fill="#1D4ED8" />
            <rect width="9.35" height="20" x="9.33" fill="#F8FAFC" />
            <rect width="9.35" height="20" x="18.66" fill="#DC2626" />
          </>
        )}

        {code === 'DE' && (
          <>
            <rect width="28" height="6.7" y="0" fill="#18181B" />
            <rect width="28" height="6.7" y="6.66" fill="#DC2626" />
            <rect width="28" height="6.7" y="13.33" fill="#FACC15" />
          </>
        )}

        {code === 'JP' && (
          <>
            <rect width="28" height="20" fill="#FAFAFA" />
            <circle cx="14" cy="10" r="5" fill="#E11D48" />
          </>
        )}

        <rect width="28" height="20" fill={`url(#${sheenId})`} />
      </g>

      <rect
        x="0.35"
        y="0.35"
        width="27.3"
        height="19.3"
        rx="3.65"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="0.7"
      />
    </svg>
  );
};

// ============================================================================
// 4. ICON-ONLY SETTINGS CONTROLS (RAIL MODALITIES & 4-EDGE DOCK INDICATORS)
// ============================================================================

export const FluentRailFull: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55" />
    <rect x="3.25" y="4.25" width="4.25" height="15.5" rx="1.5" fill="currentColor" />
    <line x1="8.25" y1="4" x2="8.25" y2="20" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const FluentRailFullFloat: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.5" y="4.5" width="4.2" height="15" rx="1.8" fill="currentColor" />
    <rect x="8.8" y="4.5" width="12.7" height="15" rx="3.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const FluentRailSaddle: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3.5" width="18" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.55" />
    <path
      d="M3 7C5 7 6.5 8.5 6.5 10.2V13.8C6.5 15.5 5 17 3 17V7Z"
      fill="currentColor"
    />
  </svg>
);

export const FluentRailFloating: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="2.5" y="3.5" width="19" height="17" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" />
    <rect x="6.5" y="6.5" width="4.2" height="11" rx="2" fill="currentColor" />
  </svg>
);

export const FluentDockLeft: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
    <rect x="4.5" y="6.2" width="3" height="11.6" rx="1.5" fill="currentColor" />
  </svg>
);

export const FluentDockRight: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
    <rect x="16.5" y="6.2" width="3" height="11.6" rx="1.5" fill="currentColor" />
  </svg>
);

export const FluentDockTop: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
    <rect x="6.2" y="5.5" width="11.6" height="3" rx="1.5" fill="currentColor" />
  </svg>
);

export const FluentDockBottom: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
    <rect x="6.2" y="15.5" width="11.6" height="3" rx="1.5" fill="currentColor" />
  </svg>
);

export const FluentPanelWidth: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4.5 12h15M4.5 12l3-3M4.5 12l3 3M19.5 12l-3-3M19.5 12l-3 3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FluentBoxDocked: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
    <path d="M3.5 7C3.5 5.34 4.84 4 6.5 4H9.5V20H6.5C4.84 20 3.5 18.66 3.5 17V7Z" fill="currentColor" />
    <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const FluentBoxFloating: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="6" width="5.2" height="12.5" rx="2.2" fill="currentColor" />
    <rect x="11" y="4.5" width="9.5" height="15" rx="2.8" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.65" />
  </svg>
);

export const FluentFxPalette: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3l1.7 4.7L18.5 9.5l-4.8 1.8L12 16l-1.7-4.7L5.5 9.5l4.8-1.8L12 3Z"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"
      fill="currentColor"
    />
  </svg>
);

export const FluentFxGlow: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" fill="currentColor" />
    <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.45" />
    <path
      d="M12 2.4v2M12 19.6v2M2.4 12h2M19.6 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const FluentFxBlur: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3.2C9.2 7.2 6 10.6 6 14.3a6 6 0 1 0 12 0c0-3.7-3.2-7.1-6-11.1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="14" r="1.15" fill="currentColor" fillOpacity="0.85" />
    <circle cx="13.5" cy="12" r="1.05" fill="currentColor" fillOpacity="0.55" />
    <circle cx="13.6" cy="16.2" r="1.25" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

export const FluentFxTransparency: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="4" y="4" width="10.5" height="10.5" rx="2.8" fill="currentColor" fillOpacity="0.32" stroke="currentColor" strokeWidth="1.45" />
    <rect x="9.5" y="9.5" width="10.5" height="10.5" rx="2.8" stroke="currentColor" strokeWidth="1.45" />
  </svg>
);

