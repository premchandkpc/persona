/**
 * Text — Sized text with weight, color, and alignment control
 * WHAT:  Renders a <span> (or custom element via `as` prop) with predefined
 *        font sizes (xs/sm/md/lg/xl), weight, color, textAlign, and textTransform.
 * HOW:   Sizes are defined as a style map (fontSize + lineHeight per key).
 *        The `as` prop allows rendering as <p>, <label>, <div>, etc. without
 *        changing the visual style.
 * WHY:   Keeps typography consistent across the app. Callers specify intent
 *        ("small label", "large body") rather than hardcoding pixel values,
 *        making global font-size adjustments a single change in this file.
 */
export default function Text({
  children,
  as = "span",
  size = "md",
  weight = "400",
  color = "var(--text)",
  align = "left",
  transform,
  style = {},
  className,
  ...rest
}) {
  const sizes = {
    xs: { fontSize: "0.75rem", lineHeight: "1rem" },
    sm: { fontSize: "0.875rem", lineHeight: "1.25rem" },
    md: { fontSize: "1rem", lineHeight: "1.5rem" },
    lg: { fontSize: "1.125rem", lineHeight: "1.75rem" },
    xl: { fontSize: "1.25rem", lineHeight: "1.75rem" },
  };

  const Element = as;

  return (
    <Element
      className={className}
      style={{
        ...sizes[size],
        fontWeight: weight,
        color,
        textAlign: align,
        textTransform: transform,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Element>
  );
}
