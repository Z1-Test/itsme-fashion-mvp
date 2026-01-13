# Code Examples

> Examples using `@staytunedllp/stayfront` and `@staytunedllp/stayintro`

## 1. Basic Counter Component

```typescript
import { html, defineElement, useState } from "@staytunedllp/stayfront";

const counter = defineElement({ tagName: "my-counter" }, () => {
  const [count, setCount] = useState(0);

  return html`
    <style>
      button {
        padding: var(--intro-spacing-2) var(--intro-spacing-4);
        background: var(--intro-color-primary-500);
        color: var(--intro-color-gray-0);
        border: none;
        border-radius: var(--intro-radius-md);
      }
    </style>
    <button type="button" onclick="${() => setCount((c) => c + 1)}">
      Count: ${count()}
    </button>
  `;
});

counter.register();
```

## 2. SDUI Page Rendering

```typescript
import {
  createSchemaRenderer,
  type PageSchema,
} from "@staytunedllp/stayfront/sdui";
import { createIntroRegistry } from "@staytunedllp/stayintro";

const registry = createIntroRegistry();
const renderer = createSchemaRenderer(registry);

const schema: PageSchema = {
  version: "1.0.0",
  root: {
    type: "ui.page",
    props: { title: "Welcome" },
    children: [
      {
        type: "ui.card",
        props: { title: "Hello {{user.name}}!", variant: "elevated" },
        children: [
          { type: "ui.text", props: { content: "Welcome to our app." } },
          {
            type: "ui.button",
            props: { label: "Get Started", variant: "primary" },
          },
        ],
      },
    ],
  },
};

const html = renderer.renderSchema(schema, { user: { name: "Alice" } });
```

## 3. Data Fetching with Cache

```typescript
import { html, defineElement } from "@staytunedllp/stayfront";
import {
  createDataClient,
  createMultiLayerCache,
  useQuery,
} from "@staytunedllp/stayfront";

const cache = createMultiLayerCache({ memory: true, indexedDb: true });
const client = createDataClient({ baseUrl: "/api", cache });

const userList = defineElement({ tagName: "user-list" }, () => {
  const { data, loading, error, refetch } = useQuery("/users");

  if (loading()) return html`<p aria-busy="true">Loading...</p>`;
  if (error()) {
    return html`
      <div role="alert">
        <p>Error: ${error().message}</p>
        <button onclick="${refetch}">Retry</button>
      </div>
    `;
  }

  return html`
    <ul role="list">
      ${data().map(
        (user: { id: string; name: string }) => html`<li>${user.name}</li>`,
      )}
    </ul>
  `;
});
```

## 4. Router with Navigation

```typescript
import {
  html,
  defineElement,
  createRouter,
  initializeRouter,
  useRouter,
  useParam,
} from "@staytunedllp/stayfront";

const router = createRouter();
router.add("/", () => html`<home-page></home-page>`);
router.add("/users/:id", () => html`<user-page></user-page>`);
router.add("/404", () => html`<not-found></not-found>`);

initializeRouter(router);

const userPage = defineElement({ tagName: "user-page" }, () => {
  const userId = useParam("id");
  const { navigate } = useRouter();

  return html`
    <h1>User ${userId()}</h1>
    <button onclick="${() => navigate("/")}">Back Home</button>
  `;
});
```

## 5. PWA with Service Worker

```typescript
import {
  generateServiceWorker,
  registerServiceWorker,
  createLocalStore,
} from "@staytunedllp/stayfront/pwa";

// Generate SW code
const swCode = generateServiceWorker({
  version: "1.0.0",
  staticCache: ["/", "/app.js", "/styles.css"],
  schemaCache: {
    pattern: "/api/schemas/*",
    strategy: "stale-while-revalidate",
  },
  offlineFallback: "/offline.html",
});

// Register SW
await registerServiceWorker("/sw.js", {
  onUpdate: () => showToast("Update available!"),
  onSuccess: () => console.log("Offline ready"),
});

// Local storage for drafts
const store = createLocalStore("my-app", "drafts");
await store.set("current", { content: "..." });
const draft = await store.get("current");
```

## 6. Form with Signals

```typescript
import {
  html,
  defineElement,
  useState,
  createComputed,
} from "@staytunedllp/stayfront";

const form = defineElement({ tagName: "contact-form" }, () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValid = createComputed(() => email().includes("@"));

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (isValid()) setSubmitted(true);
  };

  if (submitted()) return html`<p role="status">Thank you!</p>`;

  return html`
    <form onsubmit="${handleSubmit}" novalidate>
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        value="${email()}"
        oninput="${(e: InputEvent) =>
          setEmail((e.target as HTMLInputElement).value)}"
        aria-invalid="${!isValid()}"
        required
      />
      <button type="submit" ?disabled="${!isValid()}">Submit</button>
    </form>
  `;
});
```
