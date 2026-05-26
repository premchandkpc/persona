/**
 * Header — Top navigation bar with logo, nav, and actions
 * WHAT:  Renders a <header> with a logo+title area, center navigation,
 *        and right-aligned action buttons.
 * HOW:   Uses flexbox with space-between to position three sections:
 *        (1) logo + title + subtitle, (2) nav slot, (3) actions slot.
 *        When `sticky` is true, applies position:sticky; top:0; z-index:100
 *        so the header stays visible on scroll.
 * WHY:   Provides a drop-in header pattern so pages don't re-implement
 *        the same logo/title/nav layout. The nav and actions are render
 *        props (React nodes), letting callers inject any elements (links,
 *        buttons, search bars) without coupling to a specific navigation
 *        data structure.
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
