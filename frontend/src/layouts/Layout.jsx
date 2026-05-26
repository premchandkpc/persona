/**
 * Layout — Main page layout wrapper with header, footer, sidebar
 * Presentational, stateless, flexible grid layout
 */
export default function Layout({
  header,
  footer,
  sidebar,
  children,
  hasSidebar = false,
  sidebarWidth = "250px",
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        ...style,
      }}
      {...rest}
    >
      {/* Header */}
      {header}

      {/* Main Content with Optional Sidebar */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        {hasSidebar && sidebar && (
          <aside
            style={{
              width: sidebarWidth,
              borderRight: "1px solid var(--border)",
              overflowY: "auto",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "var(--bg)",
          }}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer}
    </div>
  );
}
