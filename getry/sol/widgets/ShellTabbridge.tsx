/**
 * Tabbridge.tsx — the saddle tab bridge winget of the design pass (task
 * 2-b): the file-explorer tab geometry of the owner's reference — a colored
 * strip with the curved tab hanging from it — worn at the section tops of
 * the platform pages. The SVG wings carry the exact reference paths (the
 * "M0 0 H76 V60 C36 60 40 0 0 0 Z" saddle mirrored on the right), and the
 * fill answers the ink pole of the face through the --tb-fill token the
 * stylesheet owns, so one component serves both faces (and a seat may pin
 * its own fill through the style prop).
 */
import type { ReactNode } from "react";

/** the props of the bridge: the seat label and an optional fluent icon. */
type TabbridgeProps = {
  /** the label riding the tab (the section title of the seat). */
  label: string;
  /** an icon riding the label (a fluent glyph of the calling page). */
  icon?: ReactNode;
  /** an explicit fill pin (defaults to the ink pole of the face). */
  fill?: string;
  /** an explicit tab ink pin (defaults to the canvas pole of the face). */
  ink?: string;
};

/**
 * The saddle tab bridge: the strip + the hanging tab, one section header.
 *
 * @param props the label, the icon and the optional fill/ink pins.
 * @returns the bridge element.
 */
export function TabBridge({ label, icon, fill, ink }: TabbridgeProps) {
  const pin: Record<string, string> = {};
  if (fill !== undefined) pin["--tb-fill"] = fill;
  if (ink !== undefined) pin["--tb-ink"] = ink;
  return (
    <div className="tabbridge" style={Object.keys(pin).length > 0 ? pin : undefined} aria-hidden="true">
      <span className="tabbridge__strip" />
      <div className="tabbridge__row">
        <svg className="tabbridge__wing" viewBox="0 0 76 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H76 V60 C36 60 40 0 0 0 Z" />
        </svg>
        <span className="tabbridge__tab">
          {icon}
          <span className="font-medium-tier">{label}</span>
        </span>
        <svg className="tabbridge__wing" viewBox="0 0 76 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M76 0 H0 V60 C40 60 36 0 76 0 Z" />
        </svg>
      </div>
    </div>
  );
}

export default TabBridge;
