---
title: Frontend skill for staystack-ts
description: Frontend development guidance for stayfront functional framework, stayintro design system, SDUI engine, Declarative Shadow DOM, signals reactivity, and token-based styling.
tags:
  - stayfront
  - stayintro
  - sdui
  - signals
  - dsd
  - css
  - html
  - accessibility
  - design-tokens
name: frontend
---

# Frontend Skill (staystack-ts)

## What is it?

This skill provides guidance for building frontend applications using the staystack-ts functional framework ecosystem:

- **stayfront**: Signals-based reactive framework with Declarative Shadow DOM (DSD)
- **stayintro**: Design system with tokens, primitives, and styled components
- **SDUI Engine**: Server-Driven UI rendering from JSON schemas

## Why use it?

- Ensures consistent functional patterns: pure functions, no classes, no `this`
- Enforces token-based styling (no hardcoded values)
- Maintains WCAG AA+ accessibility standards
- Keeps code aligned with stayfront/stayintro APIs
- Enables SSR with instant hydration via DSD

## How to use it?

1. Use `defineElement` to create custom elements with functional components
2. Use signals (`createSignal`, `createComputed`) for reactive state
3. Use stayintro tokens for all visual values (colors, spacing, typography)
4. Use SDUI engine (`createSchemaRenderer`) for dynamic UI from schemas
5. Validate with npm run lint, npm run build before committing

## Core Standards

### Functional Components

```typescript
import { html, defineElement, useState } from "@staytunedllp/stayfront";

const counter = defineElement({ tagName: "my-counter" }, () => {
  const [count, setCount] = useState(0);
  return html`
    <button onclick="${() => setCount((c) => c + 1)}">Count: ${count()}</button>
  `;
});

counter.register();
```

### Design System Integration

```typescript
import { createIntroRegistry } from "@staytunedllp/stayintro";
import { createSchemaRenderer } from "@staytunedllp/stayfront/sdui";

const registry = createIntroRegistry();
const renderer = createSchemaRenderer(registry);
```

### Token-Based Styling

```css
/* ✅ CORRECT: Use stayintro tokens */
.component {
  padding: var(--intro-spacing-4);
  color: var(--intro-color-gray-900);
  border-radius: var(--intro-radius-md);
}

/* ❌ INCORRECT: Hardcoded values */
.component {
  padding: 16px;
  color: #111827;
  border-radius: 6px;
}
```

## Key APIs

### stayfront

| API                              | Purpose                  |
| -------------------------------- | ------------------------ |
| `defineElement(opts, fn)`        | Create custom element    |
| `html`                           | Tagged template for HTML |
| `useState(initial)`              | State hook               |
| `useEffect(fn)`                  | Effect hook              |
| `createSignal(initial)`          | Create reactive signal   |
| `createRouter()`                 | URLPattern-based routing |
| `useRouter()`, `useParam()`      | Router hooks             |
| `createSchemaRenderer(registry)` | SDUI renderer            |

### stayfront/data

| API                           | Purpose                  |
| ----------------------------- | ------------------------ |
| `createDataClient(config)`    | Data fetching client     |
| `createMultiLayerCache(opts)` | Memory + IndexedDB cache |
| `useQuery(url)`               | Data fetching hook       |
| `useMutation(url)`            | Mutation hook            |

### stayfront/pwa

| API                                | Purpose             |
| ---------------------------------- | ------------------- |
| `generateServiceWorker(config)`    | Generate SW code    |
| `registerServiceWorker(url, opts)` | Register SW         |
| `createLocalStore(name, store)`    | IndexedDB storage   |
| `hydrateElement(el)`               | Hydrate DSD element |

### stayintro

| API                               | Purpose            |
| --------------------------------- | ------------------ |
| `createIntroRegistry(theme)`      | Styled SDUI blocks |
| `Box`, `Stack`, `Grid`            | Layout primitives  |
| `Button`, `Input`, `Card`         | UI components      |
| `createTheme(overrides)`          | Custom themes      |
| `colors`, `spacing`, `typography` | Design tokens      |

## Mandatory Requirements

- **No classes**: Use `defineElement` with pure functions
- **No direct DOM**: Use `html` template, never `innerHTML`
- **No hardcoded values**: Use `--intro-*` CSS variables
- **Accessibility**: ARIA labels, keyboard navigation, 4.5:1 contrast
- **Container queries**: Use `@container` not `@media` for components

## Supporting Docs

- [rules.md](./rules.md) - Core principles
- [stayfront.md](./stayfront.md) - Framework guide
- [stayintro.md](./stayintro.md) - Design system guide
- [css.md](./css.md) - CSS patterns
- [html.md](./html.md) - HTML & structured data
- [accessibility.md](./accessibility.md) - WCAG AA+ & ARIA
- [performance.md](./performance.md) - Lighthouse & Core Web Vitals
- [seo.md](./seo.md) - Advanced SEO & E-E-A-T
- [i18n.md](./i18n.md) - Internationalization & RTL
- [pwa.md](./pwa.md) - Progressive Web App
- [security.md](./security.md) - Security headers & CSP
- [examples.md](./examples.md) - Code examples
- [reference.md](./reference.md) - Quick reference checklist
