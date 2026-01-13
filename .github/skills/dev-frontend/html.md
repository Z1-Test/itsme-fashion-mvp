# HTML & Accessibility

## Semantic Structure

```html
<header role="banner">
  <nav role="navigation" aria-label="Main">
    <ul>
      <li><a href="/" aria-current="page">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main role="main" id="main-content">
  <section aria-labelledby="section-title">
    <h1 id="section-title">Page Title</h1>
    <article>
      <h2>Article Title</h2>
      <p>Content...</p>
    </article>
  </section>

  <aside role="complementary" aria-labelledby="sidebar">
    <h2 id="sidebar">Related</h2>
  </aside>
</main>

<footer role="contentinfo">
  <p>&copy; 2024 Company</p>
</footer>
```

## ARIA Patterns

### Buttons

```html
<!-- Icon button -->
<button aria-label="Close dialog" type="button">
  <span aria-hidden="true">×</span>
</button>

<!-- Loading button -->
<button aria-busy="true" disabled>
  <span class="spinner"></span>
  Loading...
</button>
```

### Forms

```html
<div class="field">
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    aria-describedby="email-help email-error"
    aria-required="true"
    aria-invalid="false"
  />
  <div id="email-help">We'll never share your email.</div>
  <div id="email-error" role="alert" aria-live="polite"></div>
</div>
```

### Modal

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-desc">Are you sure?</p>
  <button autofocus>Confirm</button>
  <button aria-label="Close">Cancel</button>
</div>
```

## Keyboard Navigation

| Element  | Keys                      |
| -------- | ------------------------- |
| Button   | Enter, Space              |
| Link     | Enter                     |
| Menu     | Arrow keys, Enter, Escape |
| Modal    | Tab trap, Escape to close |
| Dropdown | Arrow keys, Enter, Escape |

## Focus Management

```typescript
// Focus first element on modal open
modalElement.querySelector("[autofocus]")?.focus();

// Return focus on close
previouslyFocusedElement?.focus();
```

## Skip Links

```html
<a href="#main-content" class="skip-link"> Skip to main content </a>
```

```css
.skip-link {
  position: absolute;
  top: -100vh;
}
.skip-link:focus {
  top: 0;
}
```

## Color Contrast

| Element            | Minimum Ratio |
| ------------------ | ------------- |
| Normal text        | 4.5:1         |
| Large text (18px+) | 3:1           |
| UI components      | 3:1           |

## SEO Meta Tags

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title | Site Name</title>
  <meta name="description" content="Page description under 160 chars" />
  <link rel="canonical" href="https://example.com/page" />

  <!-- Open Graph -->
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Description" />
  <meta property="og:image" content="https://example.com/image.jpg" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
</head>
```

## JSON-LD Structured Data

### WebApplication

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "App Name",
    "description": "Application description",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
</script>
```

### BreadcrumbList

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://example.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://example.com/products"
      }
    ]
  }
</script>
```

### Organization

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Company Name",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png",
    "sameAs": [
      "https://twitter.com/company",
      "https://linkedin.com/company/company"
    ]
  }
</script>
```

### Article

```html
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "datePublished": "2024-01-15",
    "dateModified": "2024-01-16",
    "image": "https://example.com/article-image.jpg"
  }
</script>
```
