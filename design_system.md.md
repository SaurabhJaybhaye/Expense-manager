# Expense Manager — Design System & Engineering Guidelines

## 1. Aesthetic Direction (Gen Z Theme)
The user interface adopts a high-contrast, modern dark mode design language featuring vibrant neon accents, soft rounded UI components, clean card layouts, and strong visual hierarchy to optimize engagement and legibility.

---

## 2. CSS Architecture & CSS Variables

All color palettes, typography rules, and spatial variables are globally declared in `src/styles/theme.css`. Components MUST consume these CSS variables using `var(...)` instead of hardcoded hex values.

```css
/* src/styles/theme.css */
:root {
  /* Dark Mode Base Colors */
  --bg-primary: #0b0e14;
  --bg-secondary: #161b22;
  --bg-card: #1c2128;
  --border-color: #30363d;

  /* Gen Z Neon Accents */
  --accent-neon-green: #00ff87;
  --accent-electric-blue: #60a5fa;
  --accent-neon-purple: #a855f7;
  --accent-neon-pink: #ec4899;

  /* Typography */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* Status Colors */
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;

  /* Spacing & Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
}