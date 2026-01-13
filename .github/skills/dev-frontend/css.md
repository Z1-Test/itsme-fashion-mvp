# CSS Patterns

## Token-Based Styling

### Required Pattern

```css
/* ✅ CORRECT: All values from tokens */
.component {
  /* Colors */
  color: var(--intro-color-gray-900);
  background: var(--intro-color-gray-50);
  border-color: var(--intro-color-gray-200);

  /* Spacing */
  padding: var(--intro-spacing-4);
  margin: var(--intro-spacing-2);
  gap: var(--intro-spacing-3);

  /* Typography */
  font-family: var(--intro-font-sans);
  font-size: var(--intro-font-size-base);
  font-weight: var(--intro-font-weight-medium);

  /* Visual */
  border-radius: var(--intro-radius-md);
  box-shadow: var(--intro-shadow-md);

  /* Motion */
  transition: all var(--intro-duration-normal) ease;
}
```

## Container Queries

### Component Responsiveness

```css
.component {
  container-type: inline-size;
  container-name: component;
}

/* Base (mobile) */
.content {
  flex-direction: column;
}

/* Tablet: >= 600px */
@container component (min-width: 37.5rem) {
  .content {
    flex-direction: row;
  }
}

/* Desktop: >= 840px */
@container component (min-width: 52.5rem) {
  .content {
    gap: var(--intro-spacing-8);
  }
}
```

## Theme Support

```css
:host {
  color-scheme: light dark;
}

/* Light theme (default) */
:host {
  --bg: var(--intro-color-gray-0);
  --text: var(--intro-color-gray-900);
}

/* Dark theme */
:host([data-theme="dark"]) {
  --bg: var(--intro-color-gray-900);
  --text: var(--intro-color-gray-50);
}

/* System preference */
@media (prefers-color-scheme: dark) {
  :host(:not([data-theme])) {
    --bg: var(--intro-color-gray-900);
    --text: var(--intro-color-gray-50);
  }
}
```

## Accessibility

```css
/* Focus visible */
:focus-visible {
  outline: 2px solid var(--intro-color-primary-500);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  :host {
    border: 2px solid currentColor;
  }
}
```

## Prohibited Patterns

```css
/* ❌ PROHIBITED */

/* Hardcoded colors */
.bad {
  color: #333;
  background: rgb(255, 255, 255);
}

/* Hardcoded spacing */
.bad {
  padding: 16px;
  margin: 8px 12px;
}

/* Media queries in components */
@media (min-width: 768px) {
  .component {
  }
}

/* !important (except utilities) */
.bad {
  color: red !important;
}
```
