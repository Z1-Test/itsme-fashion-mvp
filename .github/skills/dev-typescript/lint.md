---
title: TypeScript linting standards (canonical)
description: How to fix ESLint violations in staystack-ts without disabling rules.
tags:
  - typescript
  - eslint
  - lint
  - functional-programming
  - security
---

# What is it?

Practical guidance for satisfying ESLint and TypeScript compiler rules in staystack-ts.

This file is for “I have an error, how do I fix it correctly?” scenarios.

# Why use it?

- Eliminates rule disabling and rework.
- Preserves the repo’s functional and security guarantees.

# How to use it?

1. Run lint.
2. Use the sections below to pick the compliant fix.
3. Only use inline disables when documented as an architectural false positive.

## Running checks

- `npm run lint`
- `npm run build`
- `npm run format:check`

## Non-negotiable policies

- Do not use `@ts-ignore` or `@ts-expect-error`.
- Do not weaken `eslint.config.ts`.
- Fix code instead of disabling rules.

## Import rules

- Use explicit `.js` extensions for relative imports.
- Group and order imports: builtins → external → internal (`@staytunedllp/*`) → parent → sibling.
- Prefer `import type` for types.
- Avoid circular dependencies; extract shared types to a lower-level module.

## Functional rules

- No classes, no `this`.
- No mutation. If you need to build a collection efficiently, prefer a helper in `@staytunedllp/staybase/core` rather than mutating in user code.
- No loops: use `map`/`filter`/`reduce` or package helpers.
- No throwing: return `Result` or `Task`.

## Promise and Task rules

- No floating promises: always `await`, `return`, or explicitly `void` at a boundary.
- Prefer `@staytunedllp/staybase/task` to model async failures.

## Type safety rules

- Replace `any` with `unknown` plus narrowing or with generics.
- Replace `as` assertions with type guards, decoders, or `satisfies`.
- Replace `!` assertions with explicit null checks or Result/Option conversions.

## Security rules

- Avoid dynamic property access with untrusted keys. Use whitelists.
- Avoid unsafe regex. Bound quantifiers.
- Avoid non-literal fs paths. Sanitize and resolve against an allowed root.
- Use timing-safe comparisons for secrets.

## Allowed rule disabling

Inline `eslint-disable-next-line` is allowed only for documented false positives with a TODO rationale.

```ts
// eslint-disable-next-line functional/no-try-statements -- TODO reason: converting sync exception to Result inside low-level primitive
```

If you need to disable a rule, prefer moving the code into a small primitive module where the rule exception is justified and contained.
