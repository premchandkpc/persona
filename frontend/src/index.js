/**
 * index.js — Barrel export (public API surface)
 * WHAT:  Single entry point that re-exports every public module.
 * HOW:   Consumers import only from this file; tree-shaking drops unused
 *        exports at build time via Vite/Rollup.
 * WHY:   Decouples consumer code from internal file layout. Adding a new
 *        component only requires one new line here instead of updating
 *        every import site. Follows the "barrel file" pattern common in
 *        library-style React projects.
 */

// UI Components
export { default as Box } from "./ui/Box.jsx";
export { default as Button } from "./ui/Button.jsx";
export { default as Card } from "./ui/Card.jsx";
export { default as Heading } from "./ui/Heading.jsx";
export { default as Text } from "./ui/Text.jsx";

// Layout Components
export { default as Footer } from "./layouts/Footer.jsx";
export { default as Header } from "./layouts/Header.jsx";
export { default as Layout } from "./layouts/Layout.jsx";

// Services
export { api } from "./services/api.js";
export { storage } from "./services/storage.js";
export { formatter } from "./services/formatter.js";

// Hooks
export { useLocalStorage } from "./hooks/useLocalStorage.js";
export { useFetch } from "./hooks/useFetch.js";

// Utils
export { classNames, cx } from "./utils/classNames.js";

// Constants
export { colors, spacing, sizes, fontWeights, transitions, breakpoints } from "./constants/theme.js";

// Examples
export { default as HomePage } from "./examples/HomePage.jsx";
export { default as ServicesExample } from "./examples/ServicesExample.jsx";
