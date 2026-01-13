# Frontend Core Rules

## Principles

### Functional First

- **MANDATORY**: Pure functions, no classes, no `this`
- **MANDATORY**: Immutable data, no mutation
- **PROHIBITED**: OOP patterns, inheritance hierarchies

### Signals Reactivity

- **MANDATORY**: Use `createSignal` for reactive state
- **MANDATORY**: Use `createComputed` for derived values
- **MANDATORY**: Use `createEffect` for side effects
- **PROHIBITED**: Manual DOM updates, direct state mutation

### Declarative Shadow DOM (DSD)

- **MANDATORY**: Use `html` tagged template for all rendering
- **MANDATORY**: Use `renderWithDsd` for SSR
- **PROHIBITED**: Direct `innerHTML` or DOM manipulation

### Design Tokens

- **MANDATORY**: All colors via `--intro-color-*`
- **MANDATORY**: All spacing via `--intro-spacing-*`
- **MANDATORY**: All typography via `--intro-font-*`
- **PROHIBITED**: Hardcoded px, hex, rgb values

### Accessibility

- **MANDATORY**: WCAG AA+ compliance
- **MANDATORY**: Keyboard navigation for all interactive elements
- **MANDATORY**: ARIA labels on icons and controls
- **MANDATORY**: 4.5:1 color contrast ratio

### Container Queries

- **MANDATORY**: Use `@container` for component responsiveness
- **PROHIBITED**: `@media` queries inside components
- **PATTERN**: Media queries only for global layout

## Anti-Patterns

```typescript
// ❌ WRONG: Class-based component
class MyComponent extends HTMLElement {
  /* ... */
}

// ✅ CORRECT: Functional component
const MyComponent = defineElement({ tagName: "my-component" }, () => {
  return html`<div>Content</div>`;
});
```

```typescript
// ❌ WRONG: Direct DOM manipulation
element.innerHTML = "<p>Text</p>";

// ✅ CORRECT: Template rendering
return html`<p>Text</p>`;
```

```css
/* ❌ WRONG: Hardcoded values */
.button {
  padding: 16px;
  color: #007bff;
}

/* ✅ CORRECT: Token-based */
.button {
  padding: var(--intro-spacing-4);
  color: var(--intro-color-primary-500);
}
```
