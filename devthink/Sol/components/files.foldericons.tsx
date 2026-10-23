/**
 * foldericons.tsx — the Windows 11 icon grammar of My Files: the shell
 * folder tiles and the drive tiles drawn as inline SVG in the exact Win11
 * explorer idiom — the manila folder with its folded tab drawn in two
 * planes (the darker back panel behind the lighter gradient front), every
 * category carrying its overlay glyph in the folder face (the monitor of
 * the desktop, the sheet of the documents, the arrow of the downloads,
 * the photo of the images, the note of the music, the cube of the 3D
 * objects, the filmstrip of the videos), and the drive tile with the dark
 * disk body, the pale face plate and the blue capacity bar riding under
 * it the way the reference shot carries its "nathalan (C:)" card.
 *
 * Everything is plain SVG with local gradients — no external asset ever
 * loads on this surface (the doctrine: no third-party icon font inside
 * the app bodies), every glyph is focusable="false" aria-hidden and the
 * tiles answer the same 48px box the explorer grid pins.
 */
import type { ShellFolderId } from "../../fileexplorer.ts";

/** the shared svg props of every drawn tile */
const TILE = {
  viewBox: "0 0 48 48",
  width: 48,
  height: 48,
  fill: "none",
  "aria-hidden": true,
  focusable: "false",
} as const;

/** the unique gradient ids per folder (the svg defs namespace: one
 * document can carry many tiles of the same folder) */
let mint = 0;

/** the manila folder of one shell folder: the Win11 two-plane folder with
 * the category glyph riding the front face. The folder geometry follows
 * the Windows reference — the back panel with its tab folded at the top
 * left, the front panel lighter and slightly larger, both in the warm
 * manila gradient family, the glyph in the deep ink of the design
 * language. */
export function ShellFolderIcon({ folder }: { folder: ShellFolderId }) {
  const uid = `dtf-${folder}-${(mint += 1)}`;
  return (
    <svg {...TILE} aria-hidden="true" className="dtfx-tile">
      <defs>
        <linearGradient id={`${uid}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8b13a" />
          <stop offset="1" stopColor="#d19a2c" />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd977" />
          <stop offset=".55" stopColor="#ffce55" />
          <stop offset="1" stopColor="#f7bd38" />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".12" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-face`}>
          <path d="M6 19.5 Q6 16.5 9 16.5 H19.5 L23 20.5 H39 Q42 20.5 42 23.5 V38 Q42 41 39 41 H9 Q6 41 6 38 Z" />
        </clipPath>
      </defs>

      {/* the back panel: the darker manila with the folder tab */}
      <path
        d="M6 14.5 Q6 11.5 9 11.5 H18.5 L22.5 15.5 H39 Q42 15.5 42 18.5 V20 Q40.5 18 38 18 H22.8 L19 14.2 Q17.8 13 16.2 13 H9 Q6.8 13 6.6 15 Z"
        fill={`url(#${uid}-back)`}
      />
      {/* the front panel: the warm gradient face the glyph rides on */}
      <path
        d="M6 19.5 Q6 16.5 9 16.5 H19.5 L23 20.5 H39 Q42 20.5 42 23.5 V38 Q42 41 39 41 H9 Q6 41 6 38 Z"
        fill={`url(#${uid}-front)`}
      />
      <path
        d="M6 19.5 Q6 16.5 9 16.5 H19.5 L23 20.5 H39 Q42 20.5 42 23.5 V38 Q42 41 39 41 H9 Q6 41 6 38 Z"
        fill={`url(#${uid}-gloss)`}
      />
      {/* the soft edge the Win11 folder carries under its face */}
      <path
        d="M6 19.5 Q6 16.5 9 16.5 H19.5 L23 20.5 H39 Q42 20.5 42 23.5 V38 Q42 41 39 41 H9 Q6 41 6 38 Z"
        fill="none"
        stroke="#b8811f"
        strokeOpacity=".5"
        strokeWidth=".8"
      />

      {/* the category glyph riding the face, drawn in the deep ink */}
      <g clipPath={`url(#${uid}-face)`}>
        <g
          fill="none"
          stroke="#7a5312"
          strokeOpacity=".85"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {folder === "desktop" ? (
            <>
              {/* the monitor of the desktop folder */}
              <rect x="15" y="26" width="18" height="10.5" rx="1.8" fill="#7a5312" fillOpacity=".16" />
              <path d="M21 39.5 H27 M24 36.5 V39.5" />
            </>
          ) : folder === "documents" ? (
            <>
              {/* the sheet of the documents folder: two leaves with fold lines */}
              <rect x="17" y="24.5" width="8.5" height="12.5" rx="1.2" fill="#7a5312" fillOpacity=".16" />
              <path d="M20.5 28 H22 M20.5 30.5 H22 M20.5 33 H22" strokeWidth="1.2" />
              <rect x="23.5" y="26.5" width="8.5" height="12.5" rx="1.2" fill="#7a5312" fillOpacity=".16" />
              <path d="M26.5 30 H29 M26.5 32.5 H29 M26.5 35 H29" strokeWidth="1.2" />
            </>
          ) : folder === "downloads" ? (
            <>
              {/* the down arrow of the downloads folder riding its tray */}
              <path d="M24 25.5 V34.5 M20.5 31.5 L24 35 L27.5 31.5" />
              <path d="M17 38 H31" strokeWidth="2" />
            </>
          ) : folder === "images" ? (
            <>
              {/* the photo of the images folder: the frame with mountain and sun */}
              <rect x="15" y="25" width="18" height="12" rx="1.8" fill="#7a5312" fillOpacity=".16" />
              <circle cx="20.5" cy="29.5" r="1.6" />
              <path d="M17 34.5 L21.5 30.5 L24.5 33.5 L27.5 30.5 L31 34.5" />
            </>
          ) : folder === "music" ? (
            <>
              {/* the note of the music folder */}
              <path d="M22 34.5 V26.5 L29.5 25 V33" />
              <ellipse cx="20" cy="34.8" rx="2.2" ry="1.7" fill="#7a5312" fillOpacity=".16" />
              <ellipse cx="27.5" cy="33.3" rx="2.2" ry="1.7" fill="#7a5312" fillOpacity=".16" />
            </>
          ) : folder === "objects3d" ? (
            <>
              {/* the cube of the 3D objects folder */}
              <path d="M24 24.5 L31.5 28.5 V36.5 L24 40.5 L16.5 36.5 V28.5 Z" fill="#7a5312" fillOpacity=".16" />
              <path d="M24 24.5 L31.5 28.5 M24 24.5 L16.5 28.5 M24 32.5 V40.5 M24 32.5 L31.5 28.5 M24 32.5 L16.5 28.5" />
            </>
          ) : (
            <>
              {/* the filmstrip of the videos folder */}
              <rect x="15" y="26" width="18" height="11" rx="1.8" fill="#7a5312" fillOpacity=".16" />
              <path d="M18.5 26 V37 M29.5 26 V37" strokeWidth="1.2" />
              <path d="M15 29.5 H18.5 M15 33.5 H18.5 M29.5 29.5 H33 M29.5 33.5 H33" strokeWidth="1.2" />
              <path d="M21.5 31.5 H26.5 M21.5 29 H23.5 M26.5 34 H24.5" strokeWidth="1.1" />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}

/** the drive tile of the "Devices and drives" wall: the Win11 disk icon —
 * the dark rounded body with the pale face plate, the activity light and
 * the blue capacity bar riding under the body the way the reference drive
 * card answers "nathalan (C:)". The share arrives as the caller argument
 * (the real usage the storage manager answered). */
export function DriveIcon({ share, mounted }: { share: number; mounted?: boolean }) {
  const uid = `dtd-drive-${(mint += 1)}`;
  const clamped = Math.min(100, Math.max(0, share));
  return (
    <svg {...TILE} aria-hidden="true" className="dtfx-tile">
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e9aa8" />
          <stop offset=".5" stopColor="#6f7a88" />
          <stop offset="1" stopColor="#59626e" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dfe6ef" />
          <stop offset="1" stopColor="#b9c2ce" />
        </linearGradient>
        <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3aa0f5" />
          <stop offset="1" stopColor="#2f8fe0" />
        </linearGradient>
      </defs>

      {/* the disk body: the rounded slab with the face plate */}
      <rect x="8" y="12" width="32" height="17" rx="3.2" fill={`url(#${uid}-body)`} />
      <rect x="11" y="15" width="26" height="9" rx="1.8" fill={`url(#${uid}-face)`} opacity=".9" />
      {/* the face lines: the quiet rails of the plate */}
      <path d="M14 19.5 H34 M14 22 H28" stroke="#59626e" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
      {/* the activity light: lit while mounted, quiet otherwise */}
      <circle cx={35.5} cy={25.2} r="1.4" fill={mounted ? "#3aa0f5" : "#8e9aa8"} opacity={mounted ? 1 : 0.7} />
      {mounted ? <circle cx={35.5} cy={25.2} r="2.4" fill="#3aa0f5" opacity=".28" /> : null}

      {/* the capacity bar riding under the body (the Windows blue fill of
          the real share — the bar the reference card carries) */}
      <rect x="8" y="33.5" width="32" height="4.5" rx="2.25" fill="#c9d2dd" opacity=".9" />
      <rect
        x="8"
        y="33.5"
        width={Math.max(4.5, (clamped / 100) * 32)}
        height="4.5"
        rx="2.25"
        fill={`url(#${uid}-bar)`}
      />
    </svg>
  );
}

/** the platform mark of the external rail: the quiet monochrome stroke
 * glyph of one storage platform (the same marks the settings drives panel
 * carries — one grammar family across the two surfaces) */
export function PlatformMark({ id }: { id: "gdrive" | "dropbox" | "onedrive" | "box" | "s3" | "host" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="dtfx-mark"
    >
      {id === "gdrive" ? (
        <>
          <path d="M12 3.6 3 19.4h18Z" />
          <path d="M7.1 12.3h9.8M7.1 12.3 12 19.4M16.9 12.3 12 19.4" />
        </>
      ) : id === "dropbox" ? (
        <>
          <path d="M12 3.7 20.3 12 12 20.3 3.7 12Z" />
          <path d="M3.7 12h16.6" />
        </>
      ) : id === "onedrive" ? (
        <>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
        </>
      ) : id === "box" ? (
        <>
          <path d="M12 2.9 20 7.4v9.2L12 21.1 4 16.6V7.4Z" />
          <path d="M4 7.4 12 11.9 20 7.4M12 11.9v9.2" />
        </>
      ) : id === "s3" ? (
        <>
          <ellipse cx="12" cy="6" rx="6.6" ry="2.5" />
          <path d="M5.4 6v11.4c0 1.4 3 2.5 6.6 2.5s6.6-1.1 6.6-2.5V6" />
        </>
      ) : (
        <>
          <rect x="3.9" y="4.2" width="16.2" height="6.6" rx="1.5" />
          <rect x="3.9" y="13.2" width="16.2" height="6.6" rx="1.5" />
          <path d="M6.8 7.5h3.2M6.8 16.5h3.2" />
        </>
      )}
    </svg>
  );
}

/** the "This PC" tile of the sidebar rail header and the empty home: the
 * quiet monitor glyph of the machine */
export function ThisPcMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="dtfx-mark"
    >
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M9.5 20h5M12 16.5V20" />
    </svg>
  );
}
