/**
 * theme.js — Design system constants
 * WHAT:  Named maps for colors, spacing, font sizes, font weights,
 *        transitions, and breakpoints.
 * HOW:   Each map is a plain JS object. Colors reference CSS custom
 *        properties (var(--accent)) for semantic values so they can
 *        be themed at the CSS layer, while status colors (success,
 *        warning, error, info) are hardcoded hex values.
 * WHY:   Centralizes design tokens. Components import spacing.md or
 *        colors.primary instead of hardcoding "1rem" or "#3b82f6",
 *        making systematic design changes a single edit. Consumers
 *        can also use these to compose inline styles (e.g. adding
 *        gap: spacing.lg to non-Box elements).
 */

export const colors = {
  // Semantic colors (use CSS variables)
  primary: "var(--accent)",
  secondary: "var(--text-secondary)",
  background: "var(--bg)",
  border: "var(--border)",

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",

  // Neutral
  white: "#ffffff",
  black: "#000000",
};

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
};

export const sizes = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
};

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const transitions = {
  fast: "150ms ease-in-out",
  base: "var(--transition)",
  slow: "300ms ease-in-out",
};

export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};
