# Quick Start — Persona Frontend React Service

**Setup:**
```bash
make install     # or: npm install
make dev         # or: npm run dev     → http://localhost:5173
make build       # or: npm run build   → dist/
make preview     # or: npm run preview  → preview production build
make clean       # remove dist/ and node_modules/
```

**Import:**
```jsx
import { Box, Button, Card, Layout, Header, Footer, useLocalStorage, api, formatter, spacing, colors } from './index.js';
```

## UI Components

### Box — Layout container
```jsx
<Box direction="column" gap="1rem" padding="2rem" align="center">
  <Heading>Title</Heading>
</Box>
```
Props: `direction`, `gap`, `padding`, `margin`, `align`, `justify`, `width`, `height`, `bg`, `border`, `radius`, `style`, `...rest`

### Button — Clickable button
```jsx
<Button variant="primary" onClick={handleClick} disabled={false}>
  Click me
</Button>
```
Props: `variant` (primary/secondary/ghost), `size` (sm/md/lg), `fullWidth`, `disabled`, `onClick`, `type`, `style`, `...rest`

### Card — Container with title
```jsx
<Card title="Settings" subtitle="Configure" padding="1.5rem">
  <Button>Save</Button>
</Card>
```
Props: `title`, `subtitle`, `padding`, `bg`, `border`, `shadow`, `radius`, `style`, `...rest`

### Heading — Semantic h1-h6
```jsx
<Heading level={1} size="2rem" weight="700" color="var(--text)">
  Main Title
</Heading>
```
Props: `level` (1-6), `size`, `weight`, `color`, `align`, `style`, `...rest`

### Text — Sized text
```jsx
<Text size="lg" weight="600" color="red">
  Bold Large Text
</Text>
```
Props: `size` (xs/sm/md/lg/xl), `weight`, `color`, `align`, `transform`, `style`, `...rest`

## Layout Components

### Header — Top navigation
```jsx
<Header
  logo="🎯"
  title="My App"
  subtitle="Subtitle"
  nav={<a href="/">Home</a>}
  actions={<Button>Login</Button>}
  sticky={true}
/>
```
Props: `logo`, `title`, `subtitle`, `nav`, `actions`, `bg`, `border`, `sticky`, `style`, `...rest`

### Footer — Bottom section
```jsx
<Footer
  sections={[{ title: "Product", links: [{ label: "Features", href: "/" }] }]}
  copyright="© 2025"
  social={<a href="#">Twitter</a>}
/>
```
Props: `sections`, `copyright`, `social`, `bg`, `border`, `style`, `...rest`

### Layout — Full page
```jsx
<Layout
  header={<Header title="Home" />}
  footer={<Footer copyright="© 2025" />}
  hasSidebar={true}
  sidebar={<nav>Menu</nav>}
>
  <main>Content</main>
</Layout>
```
Props: `header`, `footer`, `sidebar`, `hasSidebar`, `sidebarWidth`, `style`, `...rest`

## Services (Stateless)

### API Service
```jsx
import { api } from './index.js';

const data = await api.get('/endpoint');
await api.post('/endpoint', { key: 'value' });
await api.put('/endpoint', { key: 'updated' });
await api.delete('/endpoint');
```

### Storage Service
```jsx
import { storage } from './index.js';

storage.set('theme', 'dark');
const theme = storage.get('theme', 'light');
storage.remove('theme');
storage.clear();
```

### Formatter Service
```jsx
import { formatter } from './index.js';

formatter.date(new Date(), 'short');    // "1/26/2025"
formatter.date(new Date(), 'long');     // "Monday, January 26, 2025"
formatter.number(1234.5, 2);            // "1234.57"
formatter.currency(100);                // "$100.00"
formatter.bytes(1024 * 1024);           // "1 MB"
formatter.truncate('long text', 10);    // "long text..."
formatter.capitalize('hello');          // "Hello"
formatter.slug('Hello World!');         // "hello-world"
formatter.kebab('helloWorld');          // "hello-world"
```

## Hooks

### useLocalStorage — Sync with localStorage
```jsx
import { useLocalStorage } from './index.js';

const [theme, setTheme] = useLocalStorage('theme', 'light');

<button onClick={() => setTheme('dark')}>Dark</button>
```

### useFetch — Fetch data
```jsx
import { useFetch } from './index.js';

const { data, loading, error } = useFetch('/api/users');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;
return <div>{JSON.stringify(data)}</div>;
```

## Constants

```jsx
import { colors, spacing, sizes, fontWeights, transitions, breakpoints } from './index.js';

// Colors
colors.primary;      // var(--accent)
colors.success;      // #10b981
colors.warning;      // #f59e0b
colors.error;        // #ef4444

// Spacing
spacing.xs;          // 0.25rem
spacing.md;          // 1rem
spacing.xl;          // 2rem
spacing['2xl'];      // 3rem

// Sizes (font)
sizes.sm;            // 0.875rem
sizes.md;            // 1rem
sizes.lg;            // 1.125rem

// Font Weights
fontWeights.light;   // 300
fontWeights.bold;    // 700

// Breakpoints
breakpoints.sm;      // 640px
breakpoints.md;      // 768px
breakpoints.lg;      // 1024px
```

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

### Grid of Cards
```jsx
<Box
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: spacing.lg,
  }}
>
  {items.map(item => (
    <Card key={item.id} title={item.title}>
      {item.description}
    </Card>
  ))}
</Box>
```

### Theme Toggle
```jsx
const [theme, setTheme] = useLocalStorage('theme', 'light');

<Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  Toggle
</Button>
```

### Form with Submission
```jsx
const [data, setData] = useState({ name: '', email: '' });

const handleSubmit = async () => {
  await api.post('/api/submit', data);
  setData({ name: '', email: '' });
};

<Box direction="column" gap={spacing.md}>
  <input onChange={(e) => setData({...data, name: e.target.value})} />
  <Button onClick={handleSubmit}>Submit</Button>
</Box>
```

## Tips

1. **Composition** — Wrap components to extend
2. **Style Overrides** — Use `style` prop
3. **CSS Variables** — Define in global CSS
4. **Props Spreading** — `...rest` for native attributes
5. **Testing** — Services are stateless, easy to test
6. **Performance** — No state in UI components, memoization-ready

## Need Help?

- Read `README.md` for full docs
- Check `src/examples/` for working code
- Modify example code and experiment
