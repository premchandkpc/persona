/**
 * Box — Generic container component for spacing/layout
 * Presentational, stateless, zero-logic wrapper
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
