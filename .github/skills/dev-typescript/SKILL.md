---
title: TypeScript skill for staystack-ts
description: TypeScript guidance aligned with staystack-ts functional, zero-dependency, Result-driven standards across all packages.
tags:
  - typescript
  - functional-programming
  - lint
  - security
  - scalability
name: typescript
---

# TypeScript Skill (staystack-ts)

## What is it?

This skill describes how to produce TypeScript that matches staystack-ts principles: pure functions, immutable data, zero runtime dependencies, ESM-only modules with explicit .js specifiers, and Result/Task-based error handling instead of exceptions.

## Why use it?

- Prevents architectural drift by centralizing rules and examples in this skill and its companion reference/examples files (`.claude/skills/typescript/*`).
- Keeps code lint-clean on first attempt by following the Linting section in this SKILL.
- Ensures portability across Node, browser, and edge by avoiding platform-specific APIs or providing fallbacks.
- Protects security boundaries by enforcing Parse-Don't-Validate, strict input narrowing, and constant-time handling of secrets.

## How to use it?

1. Complete the mandatory pre-code scratchpad to confirm functional, safety, performance, and platform checks.
2. Reuse primitives from staybase first; extract shared utilities instead of duplicating logic across packages.
3. Import order: builtins → external (dev-only) → internal @staytunedllp aliases → relative parents → relative siblings. Always include .js on relative imports.
4. Model all fallible work with Result or Task combinators; never throw or rely on try/catch.
5. Keep data immutable and iteration functional (map/filter/reduce/flatMap). Avoid loops, mutation, classes, this, and new.
6. Use explicit return types on every function and type-only imports via import type.
7. Validate with npm run lint, npm run build, and npm run format:check before sending changes.
8. For deeper details, see: [rules.md](./rules.md), [lint.md](./lint.md), [security.md](./security.md), [scalability.md](./scalability.md), [environment.md](./environment.md), [documentation.md](./documentation.md), [typedoc.md](./typedoc.md), [testing.md](./testing.md), plus checklists in [reference.md](./reference.md) and examples in [examples.md](./examples.md). Use the scaffold in [templates/module-template.txt](./templates/module-template.txt) when creating new modules.
9. Align patterns with the Linting section in this SKILL so code is generated lint-clean instead of fixed afterward.
10. Beyond ESLint - Correctness Issues

    ESLint cannot detect these; manual review required:
    - Silent error returns (returning 0/null instead of Result error)
    - Incomplete iteration (flatMap only yielding first element)
    - Recursive functions that should be iterative (trampoline.run)
    - Wrong API usage (getDay vs getUTCDay for GMT output)
    - Loose equality bugs (== instead of ===)
    - Missing validation completeness (month-day limits)
    - Type assertions hiding real issues (as any, as E)
    - Resource leaks on error paths (release not called)
    - Ignored cancellation signals (AbortSignal not checked)

## Core standards

### Functional purity and data

- Pure functions only; no side effects inside modules. If effects are required, surface them as Task-returning boundaries.
- No mutation: avoid push, sort, assignments, or Map/Set mutation. Prefer immutable copies and readonly types.
- No loops or conditional statements when an expression form is available; prefer composition and early returns.

### Error handling and control flow

- Never throw or use try/catch. Represent errors with Result or Task and pattern-match exhaustively.
- Return meaningful units instead of void; use Result.ok(undefined) or Task<void, E> when necessary.
- Avoid Promise.reject and floating promises; always await, return, or compose via Task.

### Types and imports

- No any, as casts, or non-null assertions. Narrow unknowns with type guards or decoders. Avoid enums; use discriminated unions or const objects.
- Use type aliases over interfaces unless extending third-party interfaces is required.
- ESM-only with explicit .js extensions on relative imports; maintain import ordering and blank line after imports.

### Time, platform, and performance

- Use UTC methods for GMT/UTC output. Provide fallbacks for Node-specific APIs (process, setImmediate).
- Avoid O(N²) patterns such as spreading accumulators in reduce or Object.entries().find lookups; prefer push-based accumulation then spread once.
- Avoid nested spreads inside loops; build once then freeze.

### Validation and security

- Parse-Don't-Validate at boundaries: convert unknown inputs to typed data with strict guards.
- No dynamic object access on untrusted keys; whitelist allowed properties or use Maps.
- Use crypto.timingSafeEqual for secret comparison; avoid eval, Function constructors, and non-literal fs paths.

### Environment-agnostic APIs

> [!IMPORTANT]
> **Never use `node:fs` or `node:fs/promises` directly.** Use the `FileSystemProvider` abstraction from `@staytunedllp/staybase`:

- File I/O must go through `fsProviders.providers.getProvider()` from `@staytunedllp/staybase`
- Configure the provider at app startup using `configureNodeFs()` or `configureBrowserFs()` from `@staytunedllp/stayadapter`
- For auto-detection, use `autoConfigureFs()` which detects the runtime and configures appropriately

```ts
// ❌ WRONG - Direct node:fs import (breaks in browser)
import * as fs from "node:fs/promises";
const content = await fs.readFile("./data.csv", "utf-8");

// ✅ CORRECT - Use provider abstraction (works everywhere)
import { configureNodeFs } from "@staytunedllp/stayadapter";
import { readCSV } from "@staytunedllp/staydata";

configureNodeFs(); // At app startup
const result = await readCSV("./data.csv")();
```

- Similarly, use `security.providers` for crypto operations instead of direct `node:crypto` imports
- This ensures all staystack-ts packages remain runtime-agnostic (Node, Browser, Edge)

## Quick reference example

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

type PortError = "not-a-number" | "negative" | "fractional";

export const parsePort = (value: unknown): Result<PortError, number> =>
  typeof value !== "number"
    ? result.err("not-a-number")
    : value < 0
      ? result.err("negative")
      : Number.isInteger(value)
        ? result.ok(value)
        : result.err("fractional");
```

### URL validation using tryCatch

Use `tryCatch` instead of raw try-catch for standards-compliant URL validation:

```ts
import { result } from "@staytunedllp/staybase/core";

const { tryCatch, isOk } = result;

// ❌ WRONG - Raw try-catch (requires eslint-disable)
const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// ✅ CORRECT - Use tryCatch primitive
const isValidUrl = (value: string): boolean =>
  isOk(
    tryCatch(
      () => new URL(value),
      () => null,
    ),
  );
```

### Mutable accumulators for performance

When accumulating data in loops/reduce, **avoid O(n²) spread patterns**. Use mutable internal structures that are returned as readonly:

```ts
// ❌ WRONG - O(n²) spread on each iteration
const { errors, config } = keys.reduce(
  (acc, key) => ({
    errors: [...acc.errors, newError], // O(n) copy each time
    config: { ...acc.config, [key]: value }, // O(n) copy each time
  }),
  { errors: [], config: {} },
);

// ✅ CORRECT - O(n) mutable accumulation
// eslint-disable-next-line functional/prefer-readonly-type -- Mutable for performance
const errors: ParseError[] = [];
const config: Record<string, unknown> = {};

keys.forEach((key) => {
  if (isErr(result)) {
    // eslint-disable-next-line functional/immutable-data -- O(1) push vs O(n) spread
    errors.push(result.error);
  } else {
    // eslint-disable-next-line functional/immutable-data -- O(1) assignment vs O(n) spread
    config[key] = result.value;
  }
});

// Return as readonly
return errors.length > 0
  ? err({ _tag: "ConfigLoadError", errors })
  : ok(config as T);
```

**When to use mutable accumulators:**

- Loops processing >10 items
- Hot paths where performance matters
- Building arrays/objects from iterations

> [!IMPORTANT]
> **Bank-Grade Safety:** Mutable accumulators are safe for production when **encapsulated within function scope**. The mutation never escapes—the result is returned as readonly. O(n²) immutable spreads create latency spikes and GC pressure under load, making them a **performance risk** in high-throughput systems (payments, trading).

**Requirements for safe mutable accumulation:**

1. **Scope-local only** - Create mutable structure inside the function, never accept it as parameter
2. **Return as readonly** - Callers cannot mutate the result
3. **Document with eslint-disable** - Creates audit trail of intentional, reviewed decisions

```ts
// ✅ BANK-GRADE: Mutation encapsulated, returned as readonly
const processItems = (items: readonly Item[]): readonly Result[] => {
  const results: Result[] = []; // Private to this function
  items.forEach((item) => results.push(process(item)));
  return results; // Escapes as readonly - no external mutation possible
};

// ❌ NOT BANK-GRADE: Shared mutable state
let globalResults: Result[] = []; // Dangerous - mutation escapes
```

### forEach vs map for iteration

| Method    | Purpose      | Return      | Use For                                 |
| --------- | ------------ | ----------- | --------------------------------------- |
| `forEach` | Side effects | `undefined` | Mutable accumulation (push, assignment) |
| `map`     | Transform    | New array   | Creating new array (immutable pattern)  |

```ts
// ✅ forEach - Correct for mutable side effects
items.forEach((item) => {
  errors.push(item); // No return value needed
});

// ❌ map - Wrong for side effects (creates unused array)
items.map((item) => {
  errors.push(item); // Anti-pattern: side effect in map
  return undefined; // Wasted array of undefined values
});
```

**Summary:** `forEach` for mutations, `map` for transformations.

## Scalability and performance

- Favor small, composable functions and shared primitives in staybase to avoid duplication across packages.
- Keep data structures immutable and push-based accumulation when building arrays, then spread once outside hot paths.
- Ensure async workflows respect AbortSignal and clean up resources via explicit release helpers.

## Security and best practices

- Guard every boundary input, distinguish null and undefined explicitly, and avoid implicit boolean coercion.
- Keep secrets out of source; use configuration placeholders and never commit credentials.
- Ensure imports are from allowed workspaces only; avoid adding runtime dependencies and maintain sideEffects: false in package.json files.

## Limitations and trade-offs

- Strict FP and safety rules may increase upfront verbosity but prevent runtime defects and circular dependencies.
- Result/Task patterns require callers to handle errors explicitly; this is intentional to avoid hidden exceptions.
- Zero runtime dependencies means some conveniences must be implemented in-house or via shared primitives, trading time for predictability and portability.

---

## Supporting docs

These are the canonical, progressively-disclosed references for TypeScript work in this repo:

- [rules.md](./rules.md)
- [lint.md](./lint.md)
- [security.md](./security.md)
- [scalability.md](./scalability.md)
- [environment.md](./environment.md)
- [documentation.md](./documentation.md)
- [typedoc.md](./typedoc.md)
- [testing.md](./testing.md)
- [reference.md](./reference.md)
- [examples.md](./examples.md)

Historical per-file originals remain under `archive/` for archaeology only; avoid linking to them from new docs.

```

```
