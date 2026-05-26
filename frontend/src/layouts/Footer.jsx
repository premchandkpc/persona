/**
 * Footer — Page bottom section with link columns and copyright
 * WHAT:  Renders a <footer> with multi-column link sections, a copyright
 *        line, and a social links area.
 * HOW:   `sections` is an array of { title, links: [{ label, href }] }
 *        rendered as a CSS grid. Link hover swaps color via onMouseEnter/
 *        onMouseLeave inline handlers (no CSS file needed). The copyright
 *        and social areas sit in a flex row separated by a top border.
 *        marginTop:auto pushes the footer to the bottom when the page
 *        content is shorter than the viewport.
 * WHY:   Encapsulates the common footer layout pattern (link columns +
 *        legal + social) so pages avoid repeating the grid/border/link
 *        styling. Stateless — all content is data-driven via props.
 */
export default function Footer({
  sections,
  copyright,
  social,
  bg = "var(--bg-secondary)",
  border = "1px solid var(--border)",
  style = {},
  ...rest
}) {
  return (
    <footer
      style={{
        background: bg,
        borderTop: border,
        padding: "2rem 1.5rem",
        marginTop: "auto",
        ...style,
      }}
      {...rest}
    >
      {/* Footer Sections */}
      {sections && sections.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {section.title}
              </h4>
              {section.links && (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href || "#"}
                        style={{
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                          transition: "color var(--transition)",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.color = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.color = "var(--text-secondary)")
                        }
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {copyright && (
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            {copyright}
          </p>
        )}

        {social && (
          <div style={{ display: "flex", gap: "1rem" }}>
            {social}
          </div>
        )}
      </div>
    </footer>
  );
}
