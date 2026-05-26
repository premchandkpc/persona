/**
 * Button — Generic button component with variants
 * Presentational, stateless, accessible
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
