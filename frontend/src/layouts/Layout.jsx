/**
 * Layout — Full-page shell with header, optional sidebar, main, footer
 * WHAT:  Renders a vertical flex container (min-height:100vh) with header
 *        at top, footer pinned to bottom, and a main content area that
 *        optionally includes a sidebar.
 * HOW:   The outer container uses flex-direction:column; the middle section
 *        is a flex row where sidebar (if enabled) sits left with a fixed
 *        width and main fills the rest (flex:1). marginTop:auto on Footer
 *        pushes it down when content is short.
 * WHY:   Eliminates repetitive 100vh/flex layout boilerplate. The sidebar
 *        toggle (hasSidebar) and width (sidebarWidth) are props, so the
 *        same Layout component works for dashboard (with sidebar) and
 *        landing-page (no sidebar) use cases.
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
