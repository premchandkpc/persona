/**
 * Heading — Semantic heading component with size variants (h1-h6)
 * Presentational, stateless, accessible
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
