/**
 * kbd.tsx — the keycap of the family (the universal set): the bordered
 * chip that shows a keyboard key with the bottom edge doubled, so the
 * shortcut hints read as physical keys. the text rides the prop, never a
 * hardcoded string, and the size follows the font size of the context.
 */

export type KbdProps = {
  /** the key or the key sequence, one entry per key */
  keys: Array<string>;
  /** the accessible verdict of what the shortcut does */
  title?: string;
};

/**
 * The keycap.
 *
 * @param props the keys and the optional title.
 * @returns the keycap element.
 */
export function Kbd({ keys, title }: KbdProps) {
  return (
    <span className="kbd-row" title={title} style={{ display: "inline-flex", gap: 4 }}>
      {keys.map((key) => (
        <kbd key={key} className="kbd">
          {key}
        </kbd>
      ))}
    </span>
  );
}

export default Kbd;
