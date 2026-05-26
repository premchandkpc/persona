/**
 * Heading — Semantic heading (h1-h6) with predefined sizing
 * WHAT:  Renders the correct HTML heading element (h1-h6) based on the
 *        `level` prop, with size, weight, color, and alignment control.
 * HOW:   Uses a lookup table (levelSizes) mapping heading level to
 *        fontSize+lineHeight. The `size` prop overrides the level default
 *        when provided. Renders via dynamic element `Element = h${level}`
 *        to preserve semantic hierarchy.
 * WHY:   Ensures proper document outline / accessibility while giving
 *        designers visual control. A level-2 heading can visually appear
 *        smaller than a level-3 via explicit `size` overrides without
 *        breaking screen reader semantics.
 */
export default function Heading({
  children,
  level = 1,
  size,
  weight = "700",
  color = "var(--text)",
  align = "left",
  style = {},
  className,
  ...rest
}) {
  const levelSizes = {
    1: { fontSize: "2rem", lineHeight: "2.5rem" },
    2: { fontSize: "1.875rem", lineHeight: "2.25rem" },
    3: { fontSize: "1.5rem", lineHeight: "2rem" },
    4: { fontSize: "1.25rem", lineHeight: "1.75rem" },
    5: { fontSize: "1.125rem", lineHeight: "1.75rem" },
    6: { fontSize: "1rem", lineHeight: "1.5rem" },
  };

  const Element = `h${level}`;
  const computedSize = size || levelSizes[level];

  return (
    <Element
      className={className}
      style={{
        ...computedSize,
        fontWeight: weight,
        color,
        textAlign: align,
        margin: "0.5rem 0",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Element>
  );
}
