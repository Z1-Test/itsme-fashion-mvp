# Progressive Web App (PWA)

> Uses `@staytunedllp/stayfront/pwa` primitives

## Service Worker Generation

```typescript
import { generateServiceWorker } from "@staytunedllp/stayfront/pwa";

const swCode = generateServiceWorker({
  version: "1.0.0",
  staticCache: ["/", "/app.js", "/styles.css"],
  schemaCache: {
    pattern: "/api/schemas/*",
    strategy: "stale-while-revalidate",
    maxAge: 24 * 60 * 60 * 1000,
  },
  routeCache: [
    { pattern: "/api/*", strategy: "network-first" },
    { pattern: "/images/*", strategy: "cache-first" },
  ],
  offlineFallback: "/offline.html",
  debug: false,
});

// Write to public/sw.js
```

## Service Worker Registration

```typescript
import { registerServiceWorker } from "@staytunedllp/stayfront/pwa";

await registerServiceWorker("/sw.js", {
  scope: "/",
  onUpdate: () => showUpdateNotification(),
  onSuccess: () => console.log("SW ready"),
});
```

## Cache Control

```typescript
import {
  postMessageToSw,
  checkForUpdates,
  clearSwCaches,
} from "@staytunedllp/stayfront/pwa";

// Check for updates
await checkForUpdates();

// Clear all caches
clearSwCaches();

// Send message to SW
postMessageToSw({ type: "SKIP_WAITING" });
postMessageToSw({ type: "CACHE_SCHEMA", url: "/schema.json", schema: {...} });
```

## Local Storage

```typescript
import { createLocalStore } from "@staytunedllp/stayfront/pwa";

const store = createLocalStore("my-app", "cache");

// Store data
await store.set("draft", { content: "..." });

// Retrieve data
const draft = await store.get("draft");

// Delete data
await store.delete("draft");
```

## Hydration

```typescript
import {
  hydrateElement,
  hydrateWhenReady,
  createHydrationRegistry,
} from "@staytunedllp/stayfront/pwa";

// Hydrate single element
await hydrateElement(document.querySelector("my-component"));

// Hydrate when DOM ready
await hydrateWhenReady();

// Custom hydration registry
const registry = createHydrationRegistry();
registry.register("my-component", MyComponent);
```

## Web App Manifest

```json
{
  "name": "Full Application Name",
  "short_name": "Short Name",
  "description": "Application description",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## HTML Meta Tags

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#3b82f6" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

## Caching Strategies

| Strategy                 | Use Case                                  |
| ------------------------ | ----------------------------------------- |
| `cache-first`            | Static assets (CSS, JS, images)           |
| `network-first`          | API responses, dynamic data               |
| `stale-while-revalidate` | SDUI schemas (best for freshness + speed) |
| `network-only`           | Real-time data, auth endpoints            |
| `cache-only`             | Fully offline-first content               |

## PWA Checklist

- [ ] Use `generateServiceWorker()` with version
- [ ] Register with `registerServiceWorker()` after load
- [ ] Configure SDUI schema caching with stale-while-revalidate
- [ ] Use `createLocalStore()` for offline data
- [ ] Implement update notification with `onUpdate` callback
- [ ] Include 192x192 and 512x512 maskable icons
