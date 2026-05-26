# Persona Frontend — React Component Library

Generic, reusable React component library with services, hooks, utilities, and layout primitives. Built with **React 18** + **Vite 4**.

---

## Quick Start

```bash
make install      # npm install
make dev          # npm run dev       → http://localhost:5173
make build        # npm run build     → dist/
make preview      # npm run preview
make clean        # rm -rf dist/ node_modules/
```

```jsx
import { Layout, Header, Footer, Box, Card, Button, Heading, spacing } from './src/index.js';

function App() {
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

---

## Architecture & Directory Structure

```
frontend/
├── index.html              # Vite entry HTML (mounts #root)
├── vite.config.js           # Vite config + @vitejs/plugin-react
├── Makefile                 # dev/build/preview/install/clean
├── package.json             # Dependencies & scripts
├── QUICK_START.md           # 2-minute prop reference
├── README.md                # ← you are here
│
└── src/
    ├── main.jsx             # React DOM bootstrap (entry point)
    ├── index.js             # Barrel export (public API surface)
    ├── styles.css           # CSS custom properties + global reset
    │
    ├── ui/                  # Presentational components
    │   ├── Box.jsx          #   Flex/block layout container
    │   ├── Button.jsx       #   Clickable button (3 variants, 3 sizes)
    │   ├── Card.jsx         #   Elevated container with title
    │   ├── Heading.jsx      #   Semantic h1-h6 with sizing
    │   └── Text.jsx         #   Sized text (xs-xl)
    │
    ├── layouts/             # Page structure components
    │   ├── Layout.jsx       #   Full-page shell (header + sidebar + main + footer)
    │   ├── Header.jsx       #   Top nav bar (logo, nav, actions, sticky)
    │   └── Footer.jsx       #   Bottom section (link columns, copyright, social)
    │
    ├── services/            # Stateless business logic
    │   ├── api.js           #   HTTP client (get/post/put/delete)
    │   ├── storage.js       #   localStorage wrapper (set/get/remove/clear)
    │   └── formatter.js     #   Date/number/currency/bytes/string formatting
    │
    ├── hooks/               # Custom React hooks
    │   ├── useFetch.js      #   Data fetching (loading/error/data state machine)
    │   └── useLocalStorage.js # State synced to localStorage
    │
    ├── utils/
    │   └── classNames.js    # Conditional CSS class joining
    │
    ├── constants/
    │   └── theme.js         # Design tokens (colors, spacing, sizes, etc.)
    │
    └── examples/            # Runnable reference pages
        ├── HomePage.jsx     #   Full page demo with all UI components
        └── ServicesExample.jsx # All services & hooks in action
```

---

## Flow Architecture

### 1. Build Flow (Vite)

```
index.html
  └── <script type="module" src="/src/main.jsx">
        │
        ├── main.jsx                 # ReactDOM.createRoot
        │   ├── HomePage.jsx         # Example page
        │   └── styles.css           # Global CSS variables
        │
        └── (tree-shaken via Rollup)
            ├── ui/                  # Box, Button, Card, Heading, Text
            ├── layouts/             # Layout, Header, Footer
            ├── services/            # api, storage, formatter
            ├── hooks/               # useFetch, useLocalStorage
            ├── utils/               # classNames
            └── constants/           # theme.js
```

**Dev:** `vite` — serves over HTTP with HMR (hot module replacement).  
**Build:** `vite build` — Rollup bundles into `dist/` with tree-shaking.  
**Preview:** `vite preview` — serves the production build locally.

---

### 2. Data Flow (Runtime)

```
User Action → Button.onClick
                ↓
          api.post('/endpoint', data)     ──→ fetch() → JSON response
          storage.set('key', value)        ──→ localStorage.setItem
          formatter.date(date, 'short')    ──→ toLocaleDateString
                ↓
          Component state update (setState / setValue)
                ↓
          React re-render → UI
```

**Unidirectional:** Data flows down via props, up via callbacks. No global state.

---

### 3. Component Composition Flow

```
Layout
├── Header
│   ├── logo (text/node)
│   ├── title (string)
│   ├── subtitle (string)
│   ├── nav (React node — links, menu)
│   └── actions (React node — buttons, search)
│
├── [aside] (optional sidebar, toggled by hasSidebar)
│
├── main
│   ├── Box (layout wrapper)
│   │   ├── Card (content container)
│   │   │   ├── Heading (h1-h6)
│   │   │   ├── Text (p/span)
│   │   │   └── Button (primary/secondary/ghost)
│   │   └── ...
│   └── ...
│
└── Footer
    ├── sections[{ title, links[{ label, href }] }]
    ├── copyright (string)
    └── social (React node)
```

---

### 4. Service Flow

| Service  | File | Input | Output | Mechanism |
|----------|------|-------|--------|-----------|
| `api`    | `services/api.js` | url, data, options | Promise<JSON> | Wraps `fetch()` — serializes body, checks `response.ok`, parses JSON. Error throws with status text. |
| `storage` | `services/storage.js` | key, value | void / parsed value | Wraps `localStorage` — JSON.stringify on set, JSON.parse on get, try-catch on all ops. |
| `formatter` | `services/formatter.js` | date, number, string | formatted string | Pure functions using `Intl.NumberFormat`, `toLocaleDateString`, regex transforms. |

**All services are stateless** — no internal state, no side effects beyond their explicit purpose.

---

### 5. Hook Flow

#### `useFetch(url, options)`

```
Component renders
  ↓
useFetch("/api/users", { headers: {...} })
  ↓
useState({ data: null, loading: true, error: null })
  ↓
useEffect [url, JSON.stringify(options)]
  ├── isMounted = true
  ├── api.get(url, options)          ← async
  │   ├── success → setState({ data, loading: false, error: null })
  │   └── error   → setState({ data: null, loading: false, error })
  └── cleanup → isMounted = false    ← prevents setState after unmount
  ↓
returns { data, loading, error }
```

**Key detail:** `options` is serialized via `JSON.stringify` in the dependency array so new object references on every render do **not** trigger infinite re-fetches.

#### `useLocalStorage(key, defaultValue)`

```
Component renders
  ↓
useLocalStorage("theme", "light")
  ↓
useState(() => storage.get("theme", "light"))   ← lazy init from localStorage
  ↓
returns [value, setValue]
  ↓
User calls setValue("dark")
  ↓
React re-render
  ↓
useEffect → storage.set("theme", "dark")        ← persist to localStorage
```

---

### 6. File-by-File Reference

#### Entry Points

| File | Role | Exports |
|------|------|---------|
| `index.html` | HTML shell with `<div id="root">` | — |
| `src/main.jsx` | React DOM bootstrap | — (renders `<HomePage />`) |
| `src/index.js` | Barrel export | All public components, services, hooks, utils, constants |
| `src/styles.css` | Global CSS with `:root` design tokens | — (imported by main.jsx) |

#### UI Components (`src/ui/`)

| Component | Renders | Props | Key Behavior |
|-----------|---------|-------|-------------|
| `Box` | `<div>` (or custom `as`) | `direction`, `gap`, `padding`, `margin`, `align`, `justify`, `width`, `height`, `bg`, `border`, `radius`, `as` | Auto-switches `display:flex` when any layout prop is set |
| `Button` | `<button>` | `variant` (primary/secondary/ghost), `size` (sm/md/lg), `fullWidth`, `disabled`, `type`, `onClick` | Variant + size style maps merged in order; `cursor:not-allowed` when disabled |
| `Card` | `<div>` | `title`, `subtitle`, `padding`, `bg`, `border`, `shadow`, `radius` | Optional `<h3>` header; elevated with shadow + border |
| `Heading` | `<h1>`–`<h6>` | `level` (1-6), `size`, `weight`, `color`, `align` | Dynamic element via `h${level}`; `size` overrides level default |
| `Text` | `<span>` (or custom `as`) | `size` (xs/sm/md/lg/xl), `weight`, `color`, `align`, `transform`, `as` | Predefined fontSize + lineHeight per size key |

#### Layout Components (`src/layouts/`)

| Component | Renders | Props | Key Behavior |
|-----------|---------|-------|-------------|
| `Layout` | `<div>` (flex column) | `header`, `footer`, `sidebar`, `hasSidebar`, `sidebarWidth` | `min-height:100vh`; flex column with optional sidebar aside |
| `Header` | `<header>` | `logo`, `title`, `subtitle`, `nav`, `actions`, `sticky` | Flexbox space-between; `position:sticky` when `sticky=true` |
| `Footer` | `<footer>` | `sections[{title, links}]`, `copyright`, `social` | CSS grid for link columns; `margin-top:auto` pushes to bottom |

#### Services (`src/services/`)

| Service | Methods | Error Handling |
|---------|---------|---------------|
| `api` | `get(url, opts)`, `post(url, data, opts)`, `put(url, data, opts)`, `delete(url, opts)` | Throws on non-2xx; logs to console |
| `storage` | `set(key, val)`, `get(key, default)`, `remove(key)`, `clear()` | try-catch all ops; returns default on get failure |
| `formatter` | `date()`, `number()`, `currency()`, `bytes()`, `truncate()`, `capitalize()`, `kebab()`, `slug()` | Pure functions, no error paths |

#### Hooks (`src/hooks/`)

| Hook | Returns | Dependencies | Mechanism |
|------|---------|-------------|-----------|
| `useFetch(url, options)` | `{ data, loading, error }` | `[url, JSON.stringify(options)]` | useEffect + isMounted guard; calls `api.get()` |
| `useLocalStorage(key, default)` | `[value, setValue]` | `[value, key]` | useState lazy init from storage; useEffect writes back |

#### Utils & Constants

| File | Exports | Purpose |
|------|---------|---------|
| `utils/classNames.js` | `classNames(...args)`, `cx(...args)` | Filters falsy, flattens, joins with space |
| `constants/theme.js` | `colors`, `spacing`, `sizes`, `fontWeights`, `transitions`, `breakpoints` | Design system token maps |

---

## CSS Custom Properties

Defined in `src/styles.css` — all components consume these via `var(...)`.

| Token | Default | Purpose |
|-------|---------|---------|
| `--accent` | `#3b82f6` | Primary brand color (buttons, links) |
| `--bg` | `#ffffff` | Page background |
| `--bg-secondary` | `#f9fafb` | Card/header/footer background |
| `--text` | `#1f2937` | Body text color |
| `--text-secondary` | `#6b7280` | Muted text (subtitles, copyright) |
| `--border` | `#e5e7eb` | Border color |
| `--radius` | `0.5rem` | Border radius |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Card box-shadow |
| `--transition` | `150ms ease-in-out` | Default transition |

**To theme:** Override any `--*` variable in a parent scope. Dark mode example:
```css
[data-theme="dark"] {
  --bg: #1f2937;
  --bg-secondary: #374151;
  --text: #f9fafb;
  --text-secondary: #9ca3af;
  --border: #4b5563;
}
```

---

## React Standards Applied

- Functional components (no classes)
- Props destructuring with defaults
- Spread operator (`...rest`) for native HTML attributes
- Composition over inheritance (render props, children)
- Stateless presentational components (UI never holds state)
- Semantic HTML (`<header>`, `<footer>`, `<main>`, `<aside>`, `<nav>`)
- Cleanup patterns (`isMounted` flag, effect return cleanup)
- CSS custom properties for runtime theming

---

## Design Principles

1. **Generic** — No hardcoded text, domain logic, or app-specific data
2. **Loosely Coupled** — No component imports another component from the same layer
3. **Stateless** — UI components accept props; services are pure functions
4. **Extensible** — Override via `style` prop, compose via children, wrap for domain behavior
5. **Accessible** — Native HTML elements, semantic structure, ARIA-ready

---

## Testing

| Layer | Approach |
|-------|----------|
| UI components | Render with different prop combinations |
| Services | Pure function input/output tests |
| Hooks | React Testing Library (`renderHook`) |
| API calls | Mock `fetch()` or use MSW |

---

## Common Patterns

### Simple Page
```jsx
<Layout
  header={<Header logo="🎯" title="Home" />}
  footer={<Footer copyright="© 2025" />}
>
  <Box padding={spacing.xl}>
    <Card title="Welcome">
      <Button>Get Started</Button>
    </Card>
  </Box>
</Layout>
```

### Fetch + Display
```jsx
function UserList() {
  const { data, loading, error } = useFetch("/api/users");

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text color="red">{error.message}</Text>;

  return (
    <Box direction="column" gap={spacing.md}>
      {data.map(user => <Card key={user.id} title={user.name} />)}
    </Box>
  );
}
```

### Persisted Theme Toggle
```jsx
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </Button>
  );
}
```

---

## Files

| File | Lines | Role |
|------|-------|------|
| `index.html` | 13 | Vite HTML shell |
| `vite.config.js` | 6 | Vite + React plugin config |
| `Makefile` | 12 | Dev/build/preview/install/clean targets |
| `package.json` | 20 | Dependencies & scripts |
| `src/main.jsx` | 14 | React DOM bootstrap |
| `src/index.js` | 35 | Barrel export |
| `src/styles.css` | 38 | CSS custom properties + reset |
| `src/ui/Box.jsx` | 49 | Flex/block container |
| `src/ui/Button.jsx` | 66 | Button with variants |
| `src/ui/Card.jsx` | 52 | Elevated content container |
| `src/ui/Heading.jsx` | 44 | Semantic heading |
| `src/ui/Text.jsx` | 43 | Sized text |
| `src/layouts/Layout.jsx` | 67 | Page shell |
| `src/layouts/Header.jsx` | 87 | Navigation bar |
| `src/layouts/Footer.jsx` | 116 | Footer with link columns |
| `src/services/api.js` | 34 | HTTP client |
| `src/services/formatter.js` | 51 | Formatting utilities |
| `src/services/storage.js` | 40 | localStorage wrapper |
| `src/hooks/useFetch.js` | 41 | Data fetching hook |
| `src/hooks/useLocalStorage.js` | 20 | Persisted state hook |
| `src/utils/classNames.js` | 14 | Class joining utility |
| `src/constants/theme.js` | 62 | Design tokens |
| `src/examples/HomePage.jsx` | 213 | Full page demo |
| `src/examples/ServicesExample.jsx` | 258 | Services & hooks demo |
| `QUICK_START.md` | 249 | Prop reference |

**Total: ~1500 lines across 25 files.**
