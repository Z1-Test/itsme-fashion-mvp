# Advanced SEO

## Technical SEO Foundation

### robots.txt

```txt
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /api/
Disallow: /private/

Allow: /css/
Allow: /js/
Allow: /images/

Sitemap: https://example.com/sitemap.xml
```

### XML Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://example.com/images/hero.jpg</image:loc>
      <image:title>Hero Image</image:title>
    </image:image>
  </url>
</urlset>
```

## URL Structure

| ❌ Forbidden                | ✅ Required                       |
| --------------------------- | --------------------------------- |
| `/page?id=123&cat=foo`      | `/products/category/product-name` |
| `/Products/Categories`      | All lowercase                     |
| Underscores: `product_name` | Hyphens: `product-name`           |
| 4+ subdirectory levels      | Max 3 levels deep                 |

## Core Web Vitals SEO

| Metric | Target  |
| ------ | ------- |
| LCP    | < 2.5s  |
| INP    | < 200ms |
| CLS    | < 0.1   |
| TTFB   | < 800ms |

### LCP Optimization

- Preload LCP image with `fetchpriority="high"`
- Inline critical CSS
- Use CDN for static assets

### CLS Optimization

- Set explicit width/height on images
- Reserve space for dynamic content
- Use `font-display: optional` or preload fonts

## Mobile-First Indexing

- **Same content**: Mobile has same content as desktop
- **Touch targets**: Minimum 48x48px
- **Legible text**: No horizontal scrolling
- **Viewport**: Properly configured

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

## E-E-A-T Signals

| Signal              | Implementation                     |
| ------------------- | ---------------------------------- |
| Author Info         | Clear attribution with credentials |
| About Page          | Comprehensive company info         |
| Contact Info        | Visible contact details            |
| Privacy Policy      | Accessible policy page             |
| External References | Cite authoritative sources         |
| Reviews             | Social proof where applicable      |

## Internal Linking

- **Hub pages**: Topic hub linking to related content
- **Contextual links**: In-content links to related pages
- **Anchor text**: Descriptive, keyword-rich
- **Link depth**: Important pages within 3 clicks from home

## Canonical URLs

```html
<link rel="canonical" href="https://example.com/page" />
```

## Hreflang for Multilingual

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/page" />
```
