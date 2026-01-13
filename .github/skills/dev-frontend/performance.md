# Performance & Lighthouse

## Core Web Vitals Targets

| Metric                          | Target  | Poor    |
| ------------------------------- | ------- | ------- |
| LCP (Largest Contentful Paint)  | ≤ 2.5s  | > 4.0s  |
| INP (Interaction to Next Paint) | ≤ 200ms | > 500ms |
| CLS (Cumulative Layout Shift)   | ≤ 0.1   | > 0.25  |

## Lighthouse Score Targets

| Category       | Minimum | Target |
| -------------- | ------- | ------ |
| Performance    | 90      | 95+    |
| Accessibility  | 95      | 100    |
| Best Practices | 95      | 100    |
| SEO            | 95      | 100    |

## Resource Budgets

| Resource            | Budget  |
| ------------------- | ------- |
| Total Page Size     | ≤ 2MB   |
| JavaScript          | ≤ 500KB |
| CSS                 | ≤ 150KB |
| Images (above fold) | ≤ 500KB |
| Fonts               | ≤ 100KB |

## JavaScript Optimization

```html
<!-- ✅ CORRECT: Script loading -->
<!-- Critical with defer -->
<script src="/js/app.js" defer></script>

<!-- Independent third-party async -->
<script src="https://analytics.example.com/script.js" async></script>

<!-- Lazy load on intersection -->
<script type="module">
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        import("./feature.js");
        observer.disconnect();
      }
    });
  });
  observer.observe(document.querySelector("#feature"));
</script>
```

## CSS Optimization

```html
<!-- ✅ CORRECT: Critical CSS inlined -->
<style>
  :root {
    --color-primary: #3b82f6;
  }
  body {
    font-family: system-ui;
    margin: 0;
  }
  .hero {
    min-height: 100vh;
  }
</style>

<!-- Non-critical CSS async -->
<link
  rel="preload"
  href="/css/styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="/css/styles.css" /></noscript>
```

## Image Optimization

```html
<!-- ✅ CORRECT: Responsive optimized images -->
<picture>
  <source
    type="image/avif"
    srcset="
      /images/hero-400.avif   400w,
      /images/hero-800.avif   800w,
      /images/hero-1200.avif 1200w
    "
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  <source
    type="image/webp"
    srcset="
      /images/hero-400.webp   400w,
      /images/hero-800.webp   800w,
      /images/hero-1200.webp 1200w
    "
    sizes="(max-width: 600px) 100vw, 50vw"
  />
  <img
    src="/images/hero-800.jpg"
    alt="Descriptive alt text"
    width="800"
    height="600"
    loading="eager"
    fetchpriority="high"
    decoding="async"
  />
</picture>

<!-- Below-fold images: lazy load -->
<img src="/image.jpg" loading="lazy" width="400" height="300" alt="..." />
```

## Font Optimization

```css
@font-face {
  font-family: "Inter var";
  src: url("/fonts/Inter.var.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0000-00FF;
}
```

## Web Vitals Monitoring

```typescript
import { onCLS, onINP, onLCP } from "web-vitals";

function sendToAnalytics(metric: { name: string; value: number }) {
  navigator.sendBeacon("/analytics", JSON.stringify(metric));
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
```

## Prohibited Patterns

| ❌ Forbidden                            | ✅ Required            |
| --------------------------------------- | ---------------------- |
| Scripts in `<head>` without defer/async | Use `defer` or `async` |
| Images without width/height             | Always set dimensions  |
| Single bundle > 200KB                   | Code split by route    |
| `@import` in CSS                        | Use `<link>`           |
| Third-party scripts sync                | Load async             |
