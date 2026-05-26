/**
 * Button — Clickable button with visual variants
 * WHAT:  Renders a <button> with primary/secondary/ghost styles and
 *        sm/md/lg sizes. Supports disabled, fullWidth, onClick, type.
 * HOW:   Variants and sizes are defined as inline style maps merged in
 *        order: variant → size → overrides → style prop. Disabled state
 *        reduces opacity and switches cursor to not-allowed. The native
 *        <button> element ensures keyboard accessibility (Enter/Space).
 * WHY:   Encapsulates repetitive button styling (border-radius, transition,
 *        font-weight) so callers pass only semantic props (variant, size)
 *        rather than ad-hoc style objects. The `...rest` spread lets
 *        consumers pass aria-* or data-* attributes directly.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  type = "button",
  onClick,
  className,
  style = {},
  ...rest
}) {
  const variants = {
    primary: {
      bg: "var(--accent)",
      color: "#fff",
      border: "1px solid var(--accent)",
    },
    secondary: {
      bg: "var(--bg-secondary)",
      color: "var(--text)",
      border: "1px solid var(--border)",
    },
    ghost: {
      bg: "transparent",
      color: "var(--accent)",
      border: "1px solid var(--border)",
    },
  };

  const sizes = {
    sm: { padding: "0.4rem 0.8rem", fontSize: "0.875rem" },
    md: { padding: "0.6rem 1.2rem", fontSize: "1rem" },
    lg: { padding: "0.8rem 1.6rem", fontSize: "1.125rem" },
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? "100%" : "auto",
        borderRadius: "var(--radius)",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all var(--transition)",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
