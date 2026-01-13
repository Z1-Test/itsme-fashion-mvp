# Accessibility (WCAG AA+)

## Semantic HTML First

```html
<!-- ✅ CORRECT -->
<button type="button">Click me</button>
<a href="/page">Go to page</a>

<!-- ❌ WRONG -->
<div onclick="...">Click me</div>
<span onclick="...">Go to page</span>
```

## Keyboard Navigation

```css
/* Visible focus indicator */
:focus-visible {
  outline: 2px solid var(--intro-color-primary-500);
  outline-offset: 2px;
}

/* Mouse users only */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Link

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<main id="main-content" tabindex="-1">...</main>
```

## ARIA Patterns

### Icon Button

```html
<button aria-label="Close dialog" type="button">
  <svg aria-hidden="true">...</svg>
</button>
```

### Expandable

```html
<button aria-expanded="false" aria-controls="menu-content">Menu</button>
<ul id="menu-content" hidden>
  ...
</ul>
```

### Live Region

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content announced to screen readers -->
</div>
```

## Form Accessibility

```html
<div class="form-group">
  <label for="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-help email-error"
    aria-invalid="true"
    aria-required="true"
  />
  <div id="email-help">We'll never share your email.</div>
  <div id="email-error" role="alert">Please enter a valid email.</div>
</div>
```

## Color Contrast

| Element            | Minimum |
| ------------------ | ------- |
| Normal text        | 4.5:1   |
| Large text (18pt+) | 3:1     |
| UI components      | 3:1     |
| Focus indicator    | 3:1     |

## Images

```html
<!-- Informative -->
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2" />

<!-- Decorative -->
<img src="divider.svg" alt="" role="presentation" />
```

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Touch Targets

```css
button,
a,
input[type="checkbox"] + label {
  min-height: 44px;
  min-width: 44px;
}
```

## SPA Focus Management

```typescript
function onRouteChange(newRoute: { title: string }) {
  document.title = newRoute.title;

  // Announce to screen readers
  announcer.textContent = `Navigated to ${newRoute.title}`;

  // Focus main content
  const main = document.querySelector("main");
  main?.setAttribute("tabindex", "-1");
  main?.focus();
}
```

## Testing Matrix

| Platform | Screen Reader | Browser         |
| -------- | ------------- | --------------- |
| macOS    | VoiceOver     | Safari          |
| Windows  | NVDA          | Firefox, Chrome |
| iOS      | VoiceOver     | Safari          |
| Android  | TalkBack      | Chrome          |

## Accessibility Checklist

### Keyboard

- [ ] All functionality via keyboard
- [ ] No keyboard traps
- [ ] Focus visible at all times
- [ ] Skip link present

### Screen Reader

- [ ] Images have alt text
- [ ] Forms fully labeled
- [ ] Dynamic content announced
- [ ] Landmarks present

### Visual

- [ ] Text contrast ≥4.5:1
- [ ] No color-only information
- [ ] Reduced motion respected

### Testing

- [ ] Tested with VoiceOver/NVDA
- [ ] Tested keyboard-only
- [ ] axe-core passes
