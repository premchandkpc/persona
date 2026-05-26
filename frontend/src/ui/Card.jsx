/**
 * Card — Elevated content container with optional header
 * WHAT:  Renders a bordered, shadowed box with an optional title/subtitle
 *        header and arbitrary children.
 * HOW:   When `title` is provided, renders an <h3> heading with a subtitle
 *        <p> above the children. Accepts `bg`, `border`, `shadow`, `radius`
 *        to customize appearance. All remaining props spread to the root <div>.
 * WHY:   Provides a consistent "card" visual pattern (used for feature cards,
 *        settings panels, data displays) without duplicating the border+shadow+
 *        padding boilerplate. The optional header distinguishes cards from
 *        plain Box containers.
 */
export default function Card({
  children,
  title,
  subtitle,
  padding = "1.5rem",
  bg = "var(--bg-secondary)",
  border = "1px solid var(--border)",
  shadow = "var(--shadow)",
  radius = "var(--radius)",
  style = {},
  className,
  ...rest
}) {
  return (
    <div
      className={className}
      style={{
        background: bg,
        border,
        borderRadius: radius,
        boxShadow: shadow,
        padding,
        ...style,
      }}
      {...rest}
    >
      {title && (
        <div style={{ marginBottom: "0.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
