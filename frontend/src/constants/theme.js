/**
 * Theme Constants — Design system values
 * Colors, spacing, typography, transitions
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
