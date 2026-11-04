/**
 * avatar.tsx — the avatar of the family (the universal set): the round
 * identity chip that shows the image when the person carries one and the
 * initial letters when they do not, with the three sizes of the ladder.
 * the name rides the prop, never a hardcoded string.
 */

export type AvatarProps = {
  /** the display name the initials derive from */
  name: string;
  /** the image source when the person carries one */
  src?: string;
  /** the size of the ladder: sm, the default and lg */
  size?: "sm" | "default" | "lg";
  /** the accessible verdict of the identity */
  title?: string;
};

/**
 * The avatar.
 *
 * @param props the name, the optional image, the size and the title.
 * @returns the avatar element.
 */
export function Avatar({ name, src, size = "default", title }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="avatar" data-size={size} title={title ?? name}>
      {src ? <img src={src} alt="" /> : <span aria-hidden="true">{initials}</span>}
    </span>
  );
}

export default Avatar;
