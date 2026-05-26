/**
 * Header — Top navigation/branding component
 * Presentational, stateless layout element
 */
export default function Header({
  logo,
  title,
  subtitle,
  nav,
  actions,
  bg = "var(--bg-secondary)",
  border = "1px solid var(--border)",
  sticky = false,
  style = {},
  ...rest
}) {
  return (
    <header
      style={{
        background: bg,
        borderBottom: border,
        padding: "1rem 1.5rem",
        position: sticky ? "sticky" : "relative",
        top: sticky ? 0 : "auto",
        zIndex: sticky ? 100 : "auto",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Logo/Title Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {logo && (
            <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
              {logo}
            </div>
          )}
          <div>
            {title && (
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                }}
              >
                {title}
              </h1>
            )}
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
        </div>

        {/* Navigation */}
        {nav && (
          <nav style={{ display: "flex", gap: "2rem" }}>
            {nav}
          </nav>
        )}

        {/* Actions */}
        {actions && (
          <div style={{ display: "flex", gap: "1rem", marginLeft: "auto" }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
