/**
 * Box — Generic container for layout and spacing
 * WHAT:  Renders a flex or block container with configurable direction,
 *        alignment, gap, padding, margin, width, height, background, border.
 * HOW:   Switches between display:flex (when any layout prop is set) and
 *        display:block (bare wrapper). Accepts `as` prop to render a
 *        different HTML element (nav, section, article, etc.).
 * WHY:   Avoids repetitive wrapper divs + inline style duplication. Acts
 *        as the single layout primitive that all other components compose
 *        on top of.
 */
export default function Box({
  children,
  as = "div",
  padding = "0",
  margin = "0",
  gap = "0",
  direction = "row",
  align = "stretch",
  justify = "flex-start",
  width = "auto",
  height = "auto",
  bg,
  border,
  radius,
  className,
  style = {},
  ...rest
}) {
  const Element = as;
  const isFlexible = direction || align || justify || gap;

  return (
    <Element
      className={className}
      style={{
        display: isFlexible ? "flex" : "block",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap,
        padding,
        margin,
        width,
        height,
        background: bg,
        border,
        borderRadius: radius || "var(--radius)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Element>
  );
}
