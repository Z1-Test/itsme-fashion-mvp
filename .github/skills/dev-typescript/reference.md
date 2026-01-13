---
title: TypeScript skill reference
description: Supporting reference for the staystack-ts TypeScript skill covering imports, error handling, performance, security, and validation.
tags:
  - typescript
  - reference
  - lint
  - security
---

# What is it?

Concise reference for the staystack-ts TypeScript skill. Use alongside `SKILL.md` to recall canonical rules and examples (linting, security, scalability, environment, testing, documentation).

# Why use it?

- Keep lint- and build-clean code on first attempt.
- Prevent violations of zero-dependency, pure-functional architecture.
- Avoid security gaps at validation boundaries.

# How to use it?

- Apply these checklists before editing or reviewing code.
- Link back to this file from `SKILL.md` when you need deeper details.

## Import and module rules

- ESM-only; always include `.js` on relative imports.
- Order: builtins → external dev deps → internal `@staytunedllp/*` → relative parents → relative siblings.
- Keep a blank line after imports; no side-effect statements before imports.

## Error handling and control flow

- No `throw`, no `try/catch`, no `Promise.reject`.
- Model failures with `Result` or `Task`; match exhaustively.
- Return `result.ok(undefined)` or `Task<E, void>` instead of `void`.

## Immutability and iteration

- No mutation (`push`, `sort`, `assign`, `Map.set`, `delete`). Use structural copies and readonly types.
- No loops or imperative conditionals when an expression form exists; use `map`, `filter`, `reduce`, `flatMap`, `every`, `some`.
- Prefer small, composable functions and shared utilities in staybase to avoid duplication.

## Types and safety

- No `any`, `as` casts, or `!` assertions; narrow `unknown` with guards/decoders.
- Prefer `type` aliases; avoid `interface` except to extend third-party contracts.
- No enums; use discriminated unions or `const` objects with `as const` where needed.
- Explicit return types on all functions; use `import type` for types.

## Performance checklist

- Avoid O(N²) patterns: never spread accumulators (`[...acc, x]`) inside reduce; never `Object.entries().find` for lookups.
- Build arrays with push-based accumulation then spread once outside hot paths.
- Avoid nested spreads inside loops; construct once, then freeze.
- Use UTC methods for GMT/UTC output.

## Security and validation

- Parse-Don't-Validate: convert `unknown` to typed data with strict guards.
- No dynamic object access on untrusted keys; whitelist allowed keys or use Maps.
- Use `crypto.timingSafeEqual` for secrets; never use `eval` or `Function` constructors.
- Avoid non-literal fs paths; sanitize and resolve against allowed roots.

## Tooling and checks

- Run `npm run build`, `npm run lint`, and `npm run format:check` before submitting.
- Keep `sideEffects: false` in package.json and avoid adding runtime dependencies.
- When linting, fix code instead of disabling rules. Inline disables are allowed only with TODO rationale for documented false positives.

## Lint-first code generation patterns

- Imports: no default exports; use named exports, keep type imports separate, include `.js` on relatives, and order groups with a blank line after imports.
- No floating promises: return, await, or compose via Task. Fire-and-forget must be explicit with `void fn()` at boundaries only.
- No loops or mutation: prefer `map`/`reduce`/`flatMap`; when building arrays, accumulate via push then spread once outside hot paths to avoid O(N^2).
- No unsafe narrowing: validate `unknown` with type guards or decoders; avoid `as` and `!`.
- No dynamic property access: whitelist keys or use Maps to satisfy `security/detect-object-injection`.
- Timing-safe secrets: use `crypto.timingSafeEqual` when comparing secret material.
- Regex safety: avoid catastrophic patterns; bound quantifiers or use linear-time alternatives.
- Strict booleans: guard nullable or numeric values explicitly; do not rely on truthy checks.

## Rule → example index (comprehensive mapping)

### Formatting & Style

- **prettier/prettier** → All examples (implicit).

### Import Rules

- **import/no-default-export** → [#12](examples.md#12-named-exports-only-no-default-export)
- **import/extensions** → [#3](examples.md#3-import-ordering-and-js-extensions), [#10](examples.md#10-import-order-with-js-extensions-and-blank-line)
- **import/order** → [#3](examples.md#3-import-ordering-and-js-extensions), [#10](examples.md#10-import-order-with-js-extensions-and-blank-line)
- **import/newline-after-import** → [#10](examples.md#10-import-order-with-js-extensions-and-blank-line)
- **import/first** → All examples (imports at top).
- **import/no-absolute-path** → All examples (use relative/package imports).
- **import/no-duplicates** → All examples (single import per module).
- **import/no-mutable-exports** → All examples (use `const` and readonly).
- **import/no-self-import** → Template guidance (avoid circular imports).
- **import/no-cycle** → Template guidance (use shared types module).
- **import/no-unused-modules** → All examples (remove unused exports).
- **import/consistent-type-specifier-style** → [#3](examples.md#3-import-ordering-and-js-extensions) (`import type` at top level).
- **import/no-deprecated, import/no-named-as-default, import/no-extraneous-dependencies** → Code review checks.

### Security Rules

- **security/detect-object-injection** → [#4](examples.md#4-strict-narrowing-of-unknown-input) (whitelist keys with type guards).
- **security/detect-eval-with-expression** → Never use `eval` (forbidden).
- **security/detect-possible-timing-attacks** → [#8](examples.md#8-timing-safe-secret-comparison)
- **security/detect-unsafe-regex** → [#9](examples.md#9-safe-regex-with-bounded-quantifiers)
- **security/detect-non-literal-fs-filename** → Sanitize paths (see security section).
- **security/detect-buffer-noassert, detect-no-csrf-before-method-override, detect-child-process, detect-disable-mustache-escape** → Security practices (apply during implementation).

### Functional Programming Rules

- **functional/no-classes** → All examples (no classes anywhere).
- **functional/no-this-expressions** → All examples (no `this`).
- **functional/no-let** → [#15](examples.md#15-prefer-const-over-let-no-var)
- **functional/immutable-data** → [#2](examples.md#2-immutable-update-without-mutation), [#16](examples.md#16-no-parameter-reassignment)
- **functional/prefer-readonly-type** → [#2](examples.md#2-immutable-update-without-mutation) + all type examples.
- **functional/prefer-immutable-types** → All examples (readonly arrays/objects).
- **functional/no-loop-statements** → [#7](examples.md#7-push-based-accumulation-avoid-on2-spreads), [#13](examples.md#13-immutable-loop-free-accumulation)
- **functional/no-throw-statements** → [#14](examples.md#14-no-throwtry-model-failure-with-result)
- **functional/no-try-statements** → [#14](examples.md#14-no-throwtry-model-failure-with-result)
- **functional/no-expression-statements** → All examples (return values or Result/Task).
- **functional/no-return-void** → [#5](examples.md#5-task-style-async-boundary), [#6](examples.md#6-handling-promises-explicitly-no-floating-promises)
- **functional/functional-parameters** → All examples (explicit parameters, no `arguments`).
- **functional/prefer-tacit** → [#27](examples.md#27-point-free-tacit-style-where-clear)
- **functional/no-conditional-statements** → [#28](examples.md#28-conditional-expressions-over-statements)
- **functional/no-promise-reject** → [#5](examples.md#5-task-style-async-boundary), [#6](examples.md#6-handling-promises-explicitly-no-floating-promises) (use Task/Result).

### Type Safety Rules

- **@typescript-eslint/no-explicit-any** → [#4](examples.md#4-strict-narrowing-of-unknown-input) (use `unknown` + guards).
- **@typescript-eslint/no-unsafe-return, no-unsafe-assignment, no-unsafe-argument, no-unsafe-member-access, no-unsafe-call, no-unsafe-function-type** → All examples (strict types, no `any` propagation).
- **@typescript-eslint/no-non-null-assertion** → [#4](examples.md#4-strict-narrowing-of-unknown-input) (use guards, not `!`).
- **@typescript-eslint/no-unnecessary-type-assertion** → All examples (no `as` casts).
- **@typescript-eslint/strict-boolean-expressions** → [#11](examples.md#11-strict-booleans-and-nullish-handling)
- **@typescript-eslint/no-base-to-string, no-redundant-type-constituents** → Type safety practices.
- **@typescript-eslint/only-throw-error** → [#14](examples.md#14-no-throwtry-model-failure-with-result) (use Result/Task).
- **@typescript-eslint/consistent-type-definitions** → [#23](examples.md#23-type-definitions-prefer-type-over-interface)
- **@typescript-eslint/no-shadow** → [#24](examples.md#24-no-variable-shadowing)
- **@typescript-eslint/no-use-before-define** → All examples (declare before use).
- **@typescript-eslint/consistent-generic-constructors** → Use constructor form for generics.
- **@typescript-eslint/consistent-indexed-object-style** → Use `Record<K, V>` syntax ([#4](examples.md#4-strict-narrowing-of-unknown-input) shows `Record<string, unknown>`).
- **@typescript-eslint/no-duplicate-enum-values** → [#1](examples.md#1-result-based-parsing) (use discriminated unions, not enums).
- **@typescript-eslint/no-import-type-side-effects** → [#3](examples.md#3-import-ordering-and-js-extensions), [#10](examples.md#10-import-order-with-js-extensions-and-blank-line) (separate type imports).

### Function & Promise Rules

- **@typescript-eslint/explicit-function-return-type** → All examples (annotate return types).
- **@typescript-eslint/explicit-module-boundary-types** → All examples (exported functions annotated).
- **@typescript-eslint/require-await** → [#5](examples.md#5-task-style-async-boundary), [#6](examples.md#6-handling-promises-explicitly-no-floating-promises) (use await or return promises).
- **@typescript-eslint/prefer-promise-reject-errors** → [#5](examples.md#5-task-style-async-boundary) (use Task/Result, not Promise.reject).
- **@typescript-eslint/no-floating-promises** → [#6](examples.md#6-handling-promises-explicitly-no-floating-promises)
- **@typescript-eslint/no-misused-promises** → [#5](examples.md#5-task-style-async-boundary) (proper promise handling).
- **@typescript-eslint/no-confusing-void-expression** → [#5](examples.md#5-task-style-async-boundary), [#6](examples.md#6-handling-promises-explicitly-no-floating-promises) (return Result/Task, not void expressions).

### Variable & Declaration Rules

- **@typescript-eslint/no-redeclare** → All examples (no duplicate declarations).
- **@typescript-eslint/ban-ts-comment** → All examples (no `@ts-ignore` or `@ts-nocheck`).
- **no-redeclare** → All examples (unique variable names).
- **no-var** → [#15](examples.md#15-prefer-const-over-let-no-var)
- **prefer-const** → [#15](examples.md#15-prefer-const-over-let-no-var)
- **no-param-reassign** → [#16](examples.md#16-no-parameter-reassignment)
- **no-console** → Avoid console in production code.
- **no-undef** → TypeScript catches undefined globals.

### Modern Syntax Preferences

- **@typescript-eslint/prefer-nullish-coalescing** → [#22](examples.md#22-logical-assignment-operators) (shows `??`).
- **@typescript-eslint/prefer-optional-chain** → Use `?.` for optional navigation (apply in new code).
- **@typescript-eslint/prefer-readonly** → All type examples (readonly properties).
- **@typescript-eslint/array-type** → [#25](examples.md#25-array-type-syntax) (shows `T[]` vs `Array<T>`).
- **prefer-template** → All string examples (use template literals).
- **prefer-arrow-callback** → [#19](examples.md#19-arrow-functions-over-function-expressions)
- **object-shorthand** → [#20](examples.md#20-object-property-shorthand)
- **logical-assignment-operators** → [#22](examples.md#22-logical-assignment-operators)
- **prefer-object-has-own** → Use `Object.hasOwn()` instead of `.hasOwnProperty.call()`.

### Type Import/Export

- **@typescript-eslint/consistent-type-imports** → [#3](examples.md#3-import-ordering-and-js-extensions), [#10](examples.md#10-import-order-with-js-extensions-and-blank-line) (shows `import type`).
- **@typescript-eslint/consistent-type-exports** → Export types with `export type`.

### Code Quality

- **@typescript-eslint/no-unnecessary-condition** → Remove always-true/false conditions.
- **@typescript-eslint/switch-exhaustiveness-check** → [#26](examples.md#26-exhaustive-switch-statements)
- **@typescript-eslint/no-unnecessary-type-parameters** → Remove unused generics.
- **@typescript-eslint/no-unnecessary-type-conversion** → Avoid redundant type conversions.
- **@typescript-eslint/no-unused-expressions** → All examples (expressions produce used values).
- **curly** → [#18](examples.md#18-curly-braces-for-all-control-structures)
- **eqeqeq** → [#17](examples.md#17-strict-equality-eqeqeq)
- **no-implicit-coercion** → Explicit type conversions (all examples).
- **no-useless-assignment** → Remove assignments with no effect.
- **no-else-return** → [#21](examples.md#21-eliminate-unnecessary-else-no-else-return)
- **no-lonely-if** → Combine with else-if when appropriate.

## Scalability and portability

- Provide fallbacks for Node-only APIs (`process`, `setImmediate`); assume browser/edge runtimes.
- Ensure async flows respect `AbortSignal` and clean up resources explicitly.

## Limitations and trade-offs

- Strict FP and safety rules increase upfront verbosity but reduce runtime defects.
- Zero runtime dependencies trade convenience for portability and predictability.
