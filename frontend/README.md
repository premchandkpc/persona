# Persona Frontend — React Service

Generic, reusable React component library following modern React standards.

## Structure

```
src/
├── ui/                 # Presentational components (Box, Button, Card, Text, Heading)
├── layouts/            # Page layout components (Layout, Header, Footer)
├── services/           # Business logic (api, storage, formatter)
├── hooks/              # Custom React hooks (useLocalStorage, useFetch)
├── utils/              # Utility functions (classNames)
├── constants/          # Theme constants (colors, spacing, sizes)
├── examples/           # Usage examples (HomePage, ServicesExample)
└── index.js            # Barrel export
```

## Quick Start

```jsx
import { Layout, Header, Footer, Box, Card, Button, Heading, spacing } from './index.js';

export default function App() {
  return (
    <Layout
      header={<Header logo="🎯" title="My App" />}
      footer={<Footer copyright="© 2025" />}
    >
      <Box padding={spacing.xl}>
        <Card title="Welcome">
          <Heading level={1}>Hello World</Heading>
          <Button>Click me</Button>
        </Card>
      </Box>
    </Layout>
  );
}
```

## React Standards Applied

✓ Functional components (no classes)
✓ Props destructuring with defaults
✓ Spread operator for native attributes
✓ React hooks (useLocalStorage, useFetch)
✓ Stateless presentational components
✓ Composition over inheritance
✓ Semantic HTML
✓ Error handling & cleanup patterns
✓ CSS custom properties for theming

## Components

### UI Components
- **Box** — Flex/block container
- **Button** — Clickable button (primary, secondary, ghost)
- **Card** — Content container with header
- **Heading** — Semantic h1-h6
- **Text** — Sized text variants (xs-xl)

### Layout Components
- **Layout** — Full-page wrapper (header + sidebar + main + footer)
- **Header** — Top navigation with logo, nav, actions
- **Footer** — Bottom section with links and social

### Services (Stateless)
- **api** — HTTP client (get, post, put, delete)
- **storage** — localStorage wrapper
- **formatter** — Date, number, string formatting

### Hooks
- **useLocalStorage** — State synced to localStorage
- **useFetch** — Data fetching with loading/error states

### Utils
- **classNames** — CSS class joining utility

### Constants
- **colors**, **spacing**, **sizes**, **fontWeights**, **transitions**, **breakpoints**

## Examples

See `src/examples/` for working examples:
- **HomePage.jsx** — Full page example with all components
- **ServicesExample.jsx** — Services and hooks in action

## CSS Variables (Define in Global CSS)

```css
:root {
  --accent: #3b82f6;
  --bg: #ffffff;
  --bg-secondary: #f9fafb;
  --text: #1f2937;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --radius: 0.5rem;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --transition: 150ms ease-in-out;
}
```

## Documentation

- `QUICK_START.md` — 2-minute reference guide
- `REACT_SERVICE.md` — Complete documentation
- `src/` — Well-commented source code

## Setup

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
```

## Design Principles

- **Generic** — No hardcoded text, domain logic, or specifics
- **Loosely Coupled** — Components don't import each other
- **Stateless** — UI components accept props, services are pure functions
- **Extensible** — Override via props, compose components, wrap for domain-specific behavior
- **Accessible** — Semantic HTML, native elements, ARIA-ready

## Future

When needing domain-specific components:
1. Create wrappers around generic components
2. Keep generic components unchanged
3. Pass domain data via props
4. Add business logic in custom hooks
5. Use services for API/storage

Example: `<UserCard>` wraps `<Card>` for user domain.

## Testing

- Components — test with different props
- Services — test with different inputs
- Hooks — use React Testing Library
- Mock API calls
