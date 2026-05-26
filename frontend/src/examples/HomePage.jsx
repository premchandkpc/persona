/**
 * HomePage Example — Demonstrates how to use the React service
 * Shows: Layout, Header, Footer, cards, buttons, text components
 * Learning: Component composition, prop patterns, styling
 */
import {
  Layout,
  Header,
  Footer,
  Box,
  Card,
  Button,
  Heading,
  Text,
  spacing,
  colors,
} from "../index.js";

export default function HomePage() {
  // Example data
  const features = [
    {
      id: 1,
      title: "Generic Components",
      description: "Reusable, loosely-coupled UI components with sensible defaults.",
    },
    {
      id: 2,
      title: "Services & Hooks",
      description: "Business logic utilities and custom React hooks for common patterns.",
    },
    {
      id: 3,
      title: "React Standards",
      description: "Follows React best practices: functional components, prop patterns, hooks.",
    },
  ];

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Documentation", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
      ],
    },
  ];

  return (
    <Layout
      header={
        <Header
          logo="🎯"
          title="React Service"
          subtitle="Generic component library"
          nav={
            <Box gap={spacing.lg}>
              <a href="#" style={{ color: colors.primary, textDecoration: "none" }}>
                Components
              </a>
              <a href="#" style={{ color: colors.primary, textDecoration: "none" }}>
                Services
              </a>
              <a href="#" style={{ color: colors.primary, textDecoration: "none" }}>
                Docs
              </a>
            </Box>
          }
          actions={<Button variant="primary">Get Started</Button>}
          sticky={true}
        />
      }
      footer={
        <Footer
          sections={footerSections}
          copyright="© 2025 React Service. All rights reserved."
        />
      }
    >
      {/* Hero Section */}
      <Box
        direction="column"
        gap={spacing.lg}
        padding={spacing["2xl"]}
        align="center"
        justify="center"
        style={{ textAlign: "center", minHeight: "400px" }}
      >
        <Heading level={1}>Welcome to React Service</Heading>
        <Text size="lg" color={colors.secondary}>
          A complete, generic React component library following modern React standards.
          Designed for learning and rapid development.
        </Text>
        <Box gap={spacing.md}>
          <Button variant="primary" size="lg">
            Explore Components
          </Button>
          <Button variant="secondary" size="lg">
            View Documentation
          </Button>
        </Box>
      </Box>

      {/* Features Grid */}
      <Box
        direction="column"
        gap={spacing.xl}
        padding={spacing.xl}
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <Heading level={2}>Key Features</Heading>

        <Box
          gap={spacing.lg}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {features.map((feature) => (
            <Card
              key={feature.id}
              title={feature.title}
              padding={spacing.lg}
              style={{ cursor: "pointer", transition: "all var(--transition)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 25px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Text size="sm" color={colors.secondary} style={{ marginBottom: spacing.md }}>
                {feature.description}
              </Text>
              <Button variant="ghost" size="sm">
                Learn more →
              </Button>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Component Showcase Section */}
      <Box
        direction="column"
        gap={spacing.lg}
        padding={spacing.xl}
        bg={colors.background}
        style={{ maxWidth: "1200px", margin: "2rem auto", borderRadius: "var(--radius)" }}
      >
        <Heading level={2}>Component Showcase</Heading>

        <Box direction="column" gap={spacing.md}>
          <Heading level={4}>Buttons</Heading>
          <Box gap={spacing.md}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </Box>
        </Box>

        <Box direction="column" gap={spacing.md}>
          <Heading level={4}>Text Sizes</Heading>
          <Text size="xs">Extra Small Text</Text>
          <Text size="sm">Small Text</Text>
          <Text size="md">Medium Text (default)</Text>
          <Text size="lg">Large Text</Text>
          <Text size="xl">Extra Large Text</Text>
        </Box>

        <Box direction="column" gap={spacing.md}>
          <Heading level={4}>Headings</Heading>
          <Heading level={1}>Heading Level 1</Heading>
          <Heading level={2}>Heading Level 2</Heading>
          <Heading level={3}>Heading Level 3</Heading>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box
        direction="column"
        gap={spacing.lg}
        padding={spacing["2xl"]}
        align="center"
        justify="center"
        style={{ textAlign: "center", background: colors.primary + "10" }}
      >
        <Heading level={2}>Ready to get started?</Heading>
        <Text size="lg">
          Explore the full component library and learn React best practices.
        </Text>
        <Box gap={spacing.md}>
          <Button variant="primary">View All Components</Button>
          <Button variant="secondary">Read Documentation</Button>
        </Box>
      </Box>
    </Layout>
  );
}
