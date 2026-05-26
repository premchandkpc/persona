/**
 * Text — Generic text component with sizing variants
 * Presentational, stateless wrapper for semantic text
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
