---
title: TypeScript coding rules (canonical)
description: Canonical coding standards and patterns for TypeScript in staystack-ts (FP-first, zero runtime deps, Result/Task).
tags:
  - typescript
  - functional-programming
  - coding-standards
  - staybase
---

# What is it?

Coding rules and reusable patterns for writing TypeScript in staystack-ts.

This file focuses on the shape of good code (module structure, FP rules, type safety, and common architectural patterns). For ESLint rule-by-rule fix guidance, see `lint.md`.

# Why use it?

- Keeps the codebase consistent across packages.
- Avoids lint churn by generating code that matches the rules up front.
- Makes runtime behavior predictable by avoiding hidden exceptions, mutation, and side effects.

# How to use it?

- Use this file when creating new modules or reviewing a PR for design-level issues.
- Use `lint.md` when you already have a lint error and want a fast, compliant fix.
- Use `examples.md` for copy-paste patterns.

## Module system and package configuration

### ESM only

- Packages must be ESM-only (`"type": "module"`).
- Relative imports must include `.js` extensions in TypeScript source.
- Prefer named exports; avoid default exports.

### Tree-shaking

- Every package must keep `"sideEffects": false`.
- No module-level work on import.

### Node.js version

- Minimum supported Node.js version is the repo `engines.node` value.
- As of this repository state, it is `>=24.11.1`.

### Exports

- Prefer explicit `exports` maps that include both `types` and `import`.
- Use subpath exports for internal modules (example: `@staytunedllp/staybase/core`).

## Paradigm rules

### Pure functions

- Write pure functions by default.
- If you need effects (I/O, time, randomness), push them to the boundary and represent them as `Task` where appropriate.

### No classes

- Do not use classes, `this`, `new`, decorators, or inheritance.
- Use functions + plain data + modules.

### No mutation

- Do not mutate arrays/objects/Maps/Sets.
- Avoid `push`, `sort`, assignment to fields, and mutating `Map.set`.
- If performance requires internal mutation, hide it inside a small helper that still presents a pure API.

### No loops

- Avoid `for`, `while`, and `for..of` in shared library code.
- Prefer combinators (`map`, `filter`, `reduce`) or `staybase/core` helpers.

### No exceptions

- Do not throw from business logic.
- Model failures explicitly using `Result<E, A>` or `Task<E, A>`.

Notes:

- Some primitives inside `@staytunedllp/staybase` may wrap exception-throwing APIs (example: JSON.parse) and convert them to `Result` using small internal try/catch blocks. That is allowed inside these primitives and should not leak exceptions to callers.

## Types and safety

- All functions must have explicit return types.
- Avoid `any`, type assertions (`as`), and non-null assertions (`!`).
- Prefer `type` over `interface` unless extending a third-party contract.
- Avoid enums; prefer discriminated unions or `as const` objects.
- Prefer `import type` for type-only imports.

## Standard module layout

Every file should follow this shape:

```ts
/**
 * @module packageName/moduleName
 * @description Short description
 */

import type { SomeType } from "./types.js";

import { result } from "@staytunedllp/staybase/core";

export type MyType = {
  readonly value: string;
};

export const myFn = (input: unknown): result.Result<string, MyType> => {
  // ...
  return result.err("not-implemented");
};
```

## Architectural patterns

### Parse, don’t validate

Convert `unknown` to a domain type once, at the boundary.

```ts
import { result, brand } from "@staytunedllp/staybase/core";

export type Email = brand.Brand<string, "Email">;

export const parseEmail = (
  input: unknown,
): result.Result<"invalid-email", Email> =>
  typeof input !== "string"
    ? result.err("invalid-email")
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
      ? result.ok(brand.brand<string, "Email">(input))
      : result.err("invalid-email");
```

### Dependency injection via currying

Inject dependencies as arguments, not globals.

```ts
import type { Task } from "@staytunedllp/staybase/task";

export type Logger = { readonly info: (msg: string) => void };
export type Db = {
  readonly getUser: (id: string) => Task<"db", { readonly id: string }>;
};

export const getUserWithLogging =
  (logger: Logger) =>
  (db: Db) =>
  (id: string): Task<"db", { readonly id: string }> =>
  (signal) =>
    db
      .getUser(id)(signal)
      .then((r) => {
        if (r._tag === "Ok") {
          logger.info(`fetched-user:${r.value.id}`);
        }
        return r;
      });
```

### Discriminated unions for state

Prefer explicit states over boolean flags.

```ts
export type RequestState<A, E> =
  | { readonly _tag: "Idle" }
  | { readonly _tag: "Loading" }
  | { readonly _tag: "Success"; readonly value: A }
  | { readonly _tag: "Error"; readonly error: E };
```

## Performance guidance

- Avoid accidental $O(n^2)$ patterns: do not spread accumulators inside `reduce`.
- Prefer primitives in `@staytunedllp/staybase/core` for arrays/records/maps.
- Keep object shapes stable (monomorphic objects) for hot paths.

If you need a stack-safe recursion pattern, prefer `@staytunedllp/staybase/core/trampoline`.
