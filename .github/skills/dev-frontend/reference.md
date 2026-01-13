# Quick Reference

## Import Patterns

```typescript
// Core
import {
  html,
  defineElement,
  useState,
  useEffect,
  useComputed,
} from "@staytunedllp/stayfront";

// Signals
import {
  createSignal,
  createComputed,
  createEffect,
  batch,
} from "@staytunedllp/stayfront";

// Router
import {
  createRouter,
  initializeRouter,
  useRouter,
  useParam,
  usePrefetch,
} from "@staytunedllp/stayfront";

// Data
import {
  createDataClient,
  createMultiLayerCache,
  useQuery,
  useMutation,
} from "@staytunedllp/stayfront";

// SDUI
import {
  createSchemaRenderer,
  createRegistry,
} from "@staytunedllp/stayfront/sdui";

// PWA
import {
  generateServiceWorker,
  registerServiceWorker,
  createLocalStore,
} from "@staytunedllp/stayfront/pwa";

// Design System
import {
  createIntroRegistry,
  colors,
  spacing,
  Button,
  Card,
} from "@staytunedllp/stayintro";
```

## Pre-Development Checklist

- [ ] Component uses `defineElement()` (not class)
- [ ] All colors via `--intro-color-*` tokens
- [ ] All spacing via `--intro-spacing-*` tokens
- [ ] Accessibility requirements defined
- [ ] Responsive via container queries

## Code Review Checklist

### Structure

- [ ] Pure function, no `class` or `this`
- [ ] Uses `html` tagged template
- [ ] No direct DOM manipulation
- [ ] Signals for reactive state

### Styling

- [ ] All values from design tokens
- [ ] Container queries (not media queries)
- [ ] Theme support (light/dark)
- [ ] Reduced motion support

### Accessibility

- [ ] ARIA labels on interactive elements
- [ ] Focus management implemented
- [ ] Keyboard navigation works
- [ ] Color contrast ≥ 4.5:1

## Anti-Patterns

| ❌ Wrong                        | ✅ Correct                                     |
| ------------------------------- | ---------------------------------------------- |
| `class Foo extends HTMLElement` | `defineElement({ tagName: 'foo' }, () => ...)` |
| `el.innerHTML = '...'`          | `html\`...\``                                  |
| `padding: 16px`                 | `padding: var(--intro-spacing-4)`              |
| `color: #333`                   | `color: var(--intro-color-gray-700)`           |
| `@media (min-width: 768px)`     | `@container (min-width: 48rem)`                |

## Token Quick Reference

| Purpose        | Token                           |
| -------------- | ------------------------------- |
| Primary button | `--intro-color-primary-500`     |
| Text           | `--intro-color-gray-900`        |
| Background     | `--intro-color-gray-50`         |
| Border         | `--intro-color-gray-200`        |
| Small padding  | `--intro-spacing-2` (8px)       |
| Medium padding | `--intro-spacing-4` (16px)      |
| Large padding  | `--intro-spacing-6` (24px)      |
| Base font      | `--intro-font-size-base` (16px) |
| Small radius   | `--intro-radius-sm` (2px)       |
| Medium radius  | `--intro-radius-md` (6px)       |

## stayfront API Summary

| Category  | Key Functions                                                        |
| --------- | -------------------------------------------------------------------- |
| Component | `defineElement`, `html`, `dsd`                                       |
| State     | `useState`, `createSignal`, `batch`                                  |
| Derived   | `useComputed`, `createComputed`                                      |
| Effects   | `useEffect`, `createEffect`                                          |
| Router    | `createRouter`, `useRouter`, `useParam`                              |
| Data      | `createDataClient`, `useQuery`, `useMutation`                        |
| SDUI      | `createSchemaRenderer`, `createRegistry`                             |
| PWA       | `generateServiceWorker`, `registerServiceWorker`, `createLocalStore` |

## stayintro API Summary

| Category   | Key Exports                                  |
| ---------- | -------------------------------------------- |
| Tokens     | `colors`, `spacing`, `typography`, `shadows` |
| Theme      | `createTheme`, `defaultTheme`, `darkTheme`   |
| SDUI       | `createIntroRegistry`                        |
| Primitives | `Box`, `Stack`, `Grid`                       |
| Components | `Button`, `Input`, `Card`, `Text`, `Alert`   |
