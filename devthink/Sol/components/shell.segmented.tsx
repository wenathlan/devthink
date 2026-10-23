/**
 * segmented.tsx — the segmented control of the family (the universal set):
 * the compact option row that answers the toggle choice in place, with the
 * pressed state holding the segment, the keyboard walking the options and
 * the disabled fading honestly. the labels ride the props, never a
 * hardcoded string.
 */

export type SegmentedOption = {
  /** the stable key of the option */
  key: string;
  /** the visible label of the option */
  label: string;
  /** the disabled verdict */
  disabled?: boolean;
};

export type SegmentedProps = {
  /** the options of the row */
  options: Array<SegmentedOption>;
  /** the selected key */
  value: string;
  /** the change verdict */
  onChange: (key: string) => void;
  /** the accessible verdict of the group */
  title?: string;
};

/**
 * The segmented control.
 *
 * @param props the options, the value, the change and the title.
 * @returns the segmented element.
 */
export function Segmented({ options, value, onChange, title }: SegmentedProps) {
  return (
    <div className="segmented" role="group" title={title}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className="segmented__option"
          aria-pressed={option.key === value}
          disabled={option.disabled}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default Segmented;
