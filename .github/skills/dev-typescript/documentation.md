---
title: TSDoc Mastery Guide (Canonical)
description: 100% TSDoc leverage for elite API documentation in staystack-ts.
tags:
  - typescript
  - documentation
  - tsdoc
  - ai-consumable
---

# What is it?

Canonical documentation standards for leveraging **every TSDoc capability** to create world-class, AI-consumable API documentation for staystack-ts packages.

# Why use it?

- **100% TSDoc Coverage**: Use every available tag for maximum expressiveness
- **Human + AI Optimized**: Documentation structure that serves both developers and AI assistants
- **IDE Excellence**: Rich hover previews, IntelliSense, and go-to-definition
- **Auto-Generated Docs**: Clean API reference sites via API Extractor / TypeDoc
- **Algebraic Law Awareness**: Document functional programming invariants
- **Release Stage Clarity**: `@alpha`, `@beta`, `@public`, `@internal` lifecycle markers

---

# TSDoc Architecture

## Tag Kinds

TSDoc tags fall into three categories:

| Kind         | Syntax   | Placement                            | Examples                                     |
| ------------ | -------- | ------------------------------------ | -------------------------------------------- |
| **Block**    | `@tag`   | First on a line, followed by content | `@param`, `@returns`, `@example`, `@remarks` |
| **Modifier** | `@tag`   | End of comment, no content           | `@public`, `@internal`, `@alpha`, `@beta`    |
| **Inline**   | `{@tag}` | Within text content                  | `{@link Target}`, `{@inheritDoc Source}`     |

## Standardization Groups

| Group             | Support Level                              | Examples                                                |
| ----------------- | ------------------------------------------ | ------------------------------------------------------- |
| **Core**          | All tools MUST support                     | `@param`, `@returns`, `@remarks`, `@link`, `@typeParam` |
| **Extended**      | Tools SHOULD support                       | `@example`, `@see`, `@inheritDoc`, `@defaultValue`      |
| **Discretionary** | Consistent syntax, tool-specific semantics | `@alpha`, `@beta`, `@public`, `@internal`               |

---

# Complete Tag Reference

## Block Tags (Core)

### `@param <name> - <description>` — Document Parameters

```ts
/**
 * @param value - The success value to wrap (must satisfy type A)
 * @param options - Configuration with retry settings
 * @param options.maxRetries - Maximum retry attempts (default: 3)
 * @param options.delay - Delay between retries in ms
 */
```

**Rules:**

- Use hyphen `-` after parameter name
- Document constraints, valid ranges, and nullability
- For destructured objects, document nested properties with dot notation
- Match exact parameter names from the signature

### `@returns <description>` — Document Return Values

```ts
/**
 * @returns An `Ok` instance containing the mapped value
 * @returns `true` if the value is `Some`, narrowing the type
 * @returns A curried function accepting a `Result<E, A>`
 */
```

**Rules:**

- For type guards: describe boolean outcome AND type narrowing
- For curried functions: describe the returned function's behavior
- For `Result`/`Task`: describe both success AND failure cases
- Never just restate the type signature

### `@remarks` — Extended Explanation

```ts
/**
 * @remarks
 * This implements the Functor `map` operation for Result, satisfying:
 * - Identity: `map(id) ≡ id`
 * - Composition: `map(f) ∘ map(g) ≡ map(f ∘ g)`
 *
 * Performance: O(1) for both Ok and Err cases.
 */
```

**Use for:**

- Algebraic law documentation
- Performance characteristics
- Implementation notes
- Design rationale
- Usage gotchas

### `@typeParam <T> - <description>` — Document Generic Parameters

```ts
/**
 * @typeParam E - The error type (must extend `Error` for stack traces)
 * @typeParam A - The success value type
 * @typeParam B - The transformed value type after mapping
 */
```

**Rules:**

- Document constraints (`extends`, `keyof`)
- Explain variance (covariant, contravariant, invariant)
- Link to related types when useful

### `@deprecated` — Mark Obsolete APIs

```ts
/**
 * @deprecated Use {@link fromNullable} instead. Will be removed in v3.0.0.
 */
```

**Rules:**

- Always suggest replacement API with `{@link}`
- Include removal version
- Recursively applies to container members

### `@privateRemarks` — Internal Notes (Stripped from Output)

```ts
/**
 * @privateRemarks
 * TODO: Consider lazy evaluation for performance.
 * Implementation notes that shouldn't appear in public docs.
 */
```

---

## Block Tags (Extended)

### `@example [Title]` — Runnable Code Examples

````ts
/**
 * @example Basic usage
 * ```ts
 * import { result } from '@staytunedllp/staybase/core';
 *
 * const parsed = result.tryCatch(
 *   () => JSON.parse('{"a":1}'),
 *   (e) => `Parse error: ${e}`
 * );
 * // Ok({ a: 1 })
 * ```
 *
 * @example Error handling
 * ```ts
 * const failed = result.tryCatch(
 *   () => JSON.parse('invalid'),
 *   (e) => `Parse error: ${e.message}`
 * );
 * // Err("Parse error: Unexpected token 'i'")
 * ```
 */
````

**Rules:**

- Use descriptive titles after `@example`
- Show real staystack imports
- Include expected output in comments
- Cover success AND failure for fallible functions
- Multiple `@example` blocks for different scenarios

### `@see` — Cross-References

```ts
/**
 * @see {@link Result} for synchronous error handling
 * @see {@link flatMap} for monadic chaining
 * @see {@link https://gcanti.github.io/fp-ts/ | fp-ts documentation}
 */
```

**Rules:**

- Always use `{@link}` for hyperlinks
- Combine local and external references
- Each `@see` becomes a bullet in "See Also" section

### `@defaultValue` — Document Default Values

```ts
/**
 * Maximum number of retries before failing.
 * @defaultValue `3`
 */
readonly maxRetries?: number;

/**
 * @defaultValue
 * The default is `true` unless `silent` mode is enabled.
 */
readonly verbose?: boolean;
```

**Use for:** Interface/class properties with optional values

### `@throws` — Document Exceptions (AVOID in staystack)

> ⚠️ **staystack Convention**: Public APIs return `Result` or `Task` for failures. Do NOT use `@throws` for public APIs. Use only for `@internal` helpers that throw.

```ts
/**
 * @internal
 * @throws {RangeError} If index is out of bounds
 */
```

---

## Inline Tags

### `{@link Target | Display Text}` — Hyperlinks

```ts
/**
 * See {@link Result} for the base type.
 * Related: {@link Option.map | the Option map function}
 * External: {@link https://en.wikipedia.org/wiki/Monad | Monad on Wikipedia}
 */
```

**Declaration Reference Syntax:**

| Target          | Syntax                                |
| --------------- | ------------------------------------- |
| Same file       | `{@link FunctionName}`                |
| Same package    | `{@link module/path#Symbol}`          |
| Other package   | `{@link @scope/package#Symbol}`       |
| Class member    | `{@link ClassName.methodName}`        |
| Static member   | `{@link ClassName.(method:static)}`   |
| Instance member | `{@link ClassName.(method:instance)}` |
| Constructor     | `{@link (ClassName:constructor)}`     |
| URL             | `{@link https://example.com}`         |

### `{@inheritDoc Source}` — Inherit Documentation

```ts
/**
 * {@inheritDoc IMapper.map}
 */
export const map = ...

/**
 * {@inheritDoc @staytunedllp/staybase/core#Result.map}
 * @see {@link flatMap} for chaining
 */
```

**What gets copied:**

- Summary section
- `@remarks` block
- `@param` blocks
- `@typeParam` blocks
- `@returns` block

**NOT copied:** `@example`, `@defaultValue`, modifiers

---

## Modifier Tags

### Release Stage Tags

```ts
/** @public */ // Stable, follows semver
/** @beta */ // Experimental, may change
/** @alpha */ // Early development, breaking changes likely
/** @internal */ // Not for external use, may be trimmed

/**
 * Widget rendering engine.
 * @public
 */
export class Renderer {
  /**
   * Experimental layout algorithm.
   * @beta
   */
  experimentalLayout(): void;

  /**
   * Internal cache implementation.
   * @internal
   */
  _cache: Map<string, unknown>;
}
```

**Inheritance:** Members inherit parent's release stage unless overridden.

### `@packageDocumentation` — Package Entry Point

```ts
/**
 * Functional error handling primitives for TypeScript.
 *
 * @remarks
 * This package provides Result, Option, and Task monads for
 * type-safe error handling without exceptions.
 *
 * @see {@link Result} for synchronous operations
 * @see {@link Task} for async operations
 *
 * @packageDocumentation
 */
```

**Place in:** Main entry index.ts file, as the FIRST doc comment.

### Other Modifiers

```ts
/** @readonly */ // Property cannot be assigned
/** @sealed */ // Class cannot be subclassed
/** @virtual */ // Method can be overridden
/** @override */ // Method overrides base class
```

---

# Coverage Requirements Matrix

## By Symbol Type

| Symbol               | Required                                       | Recommended                            |
| -------------------- | ---------------------------------------------- | -------------------------------------- |
| **Type Alias**       | Summary                                        | `@remarks`, `@see`, `@typeParam`       |
| **Interface**        | Summary, member docs                           | `@remarks`, `@typeParam`               |
| **Constant**         | Summary                                        | `@defaultValue` (if applicable)        |
| **Function**         | Summary, `@param`, `@returns`, `@example`      | `@remarks`, `@typeParam`, `@see`       |
| **Type Guard**       | Summary, `@param`, `@returns` (always boolean) | `@example`                             |
| **Curried Function** | Summary (outer), describe returned fn          | `@example` showing curried application |
| **Class**            | Summary, release stage                         | `@remarks`, `@typeParam`               |
| **Method**           | Summary, `@param`, `@returns`                  | `@example`                             |
| **Property**         | Summary                                        | `@defaultValue`, `@readonly`           |
| **Module Entry**     | `@module`, summary                             | `@since`, `@packageDocumentation`      |

---

# Templates by Symbol Type

## Pure Function

````ts
/**
 * Constructs an `Ok` value representing successful operation.
 *
 * @typeParam E - Error type (defaults to `never` for infallible ops)
 * @typeParam A - Success value type
 * @param value - The success value to wrap
 * @returns An `Ok` instance containing the value
 *
 * @remarks
 * This is the unit (return) operation for the Result monad.
 *
 * @example Creating a successful result
 * ```ts
 * import { result } from '@staytunedllp/staybase/core';
 *
 * const success = result.ok(42);
 * // Ok(42)
 *
 * result.isOk(success); // true
 * ```
 *
 * @see {@link err} for failure construction
 * @see {@link fromNullable} for nullable handling
 *
 * @public
 */
export const ok = <A, E = never>(value: A): Result<E, A> => ({
  _tag: "Ok",
  value,
});
````

## Curried Function

````ts
/**
 * Maps a function over the `Ok` value of a `Result`.
 * If the `Result` is `Err`, returns it unchanged.
 *
 * @typeParam A - Original success value type
 * @typeParam B - Transformed success value type
 * @param f - Transformation function to apply
 * @returns A function that takes a Result and returns a mapped Result
 *
 * @remarks
 * Implements the Functor `map` operation, satisfying:
 * - Identity: `map(id) ≡ id`
 * - Composition: `map(f ∘ g) ≡ map(f) ∘ map(g)`
 *
 * @example Transforming success values
 * ```ts
 * import { result } from '@staytunedllp/staybase/core';
 * import { pipe } from '@staytunedllp/staybase/core';
 *
 * const double = (n: number) => n * 2;
 *
 * pipe(
 *   result.ok(21),
 *   result.map(double)
 * ); // Ok(42)
 *
 * pipe(
 *   result.err("failed"),
 *   result.map(double)
 * ); // Err("failed")
 * ```
 *
 * @see {@link flatMap} for chaining Result-returning functions
 * @see {@link mapErr} for transforming error values
 *
 * @public
 */
export const map =
  <A, B>(f: (a: A) => B) =>
  <E>(ra: Result<E, A>): Result<E, B> =>
    isOk(ra) ? ok(f(ra.value)) : ra;
````

## Type Guard

````ts
/**
 * Type guard to check if a `Result` is successful (`Ok`).
 *
 * @typeParam E - Error type
 * @typeParam A - Success value type
 * @param result - The `Result` to check
 * @returns `true` if `Ok`, `false` if `Err`. Narrows the type accordingly.
 *
 * @example Type narrowing in conditionals
 * ```ts
 * import { result } from '@staytunedllp/staybase/core';
 *
 * const r: Result<string, number> = result.ok(42);
 *
 * if (result.isOk(r)) {
 *   // TypeScript knows: r is Ok<number>
 *   console.log(r.value); // 42
 * } else {
 *   // TypeScript knows: r is Err<string>
 *   console.log(r.error);
 * }
 * ```
 *
 * @see {@link isErr} for the inverse check
 *
 * @public
 */
export const isOk = <E, A>(result: Result<E, A>): result is Ok<A> =>
  result._tag === "Ok";
````

## Type Alias

```ts
/**
 * Represents the success case of a `Result`.
 *
 * @typeParam A - The type of the success value
 *
 * @remarks
 * This is a tagged union discriminant. Use `_tag: "Ok"` for pattern matching.
 *
 * @see {@link Err} for the failure case
 * @see {@link Result} for the union type
 *
 * @public
 */
export type Ok<A> = {
  readonly _tag: "Ok";
  readonly value: A;
};
```

## Interface with Properties

````ts
/**
 * Configuration options for the rate limiter.
 *
 * @remarks
 * All rate limits use a sliding window algorithm.
 * Exceeding limits returns `Err("RateLimited")`.
 *
 * @example
 * ```ts
 * const config: RateLimiterOptions = {
 *   maxRequests: 100,
 *   windowMs: 60_000, // 1 minute
 * };
 * ```
 *
 * @see {@link createRateLimiter} for creating a limiter instance
 *
 * @public
 */
export interface RateLimiterOptions {
  /**
   * Maximum allowed requests per window.
   * @defaultValue `100`
   */
  readonly maxRequests: number;

  /**
   * Window duration in milliseconds.
   * @defaultValue `60000` (1 minute)
   */
  readonly windowMs: number;

  /**
   * Strategy when limit is exceeded.
   * @defaultValue `"reject"`
   */
  readonly strategy?: "reject" | "queue" | "throttle";
}
````

## Pattern Matching Function

````ts
/**
 * Pattern matches on a `Result`, executing the appropriate handler.
 *
 * @typeParam E - Error type
 * @typeParam A - Success type
 * @typeParam B - Return type of both handlers
 * @param matchers - Object with `onOk` and `onErr` handler functions
 * @returns A function that takes a Result and returns the handler's result
 *
 * @remarks
 * This provides exhaustive pattern matching, ensuring both cases are handled.
 * Prefer this over manual `if`/`else` for cleaner code.
 *
 * @example Safe unwrapping with handlers
 * ```ts
 * import { result } from '@staytunedllp/staybase/core';
 * import { pipe } from '@staytunedllp/staybase/core';
 *
 * const message = pipe(
 *   result.ok(42),
 *   result.match({
 *     onOk: (n) => `Success: ${n}`,
 *     onErr: (e) => `Error: ${e}`,
 *   })
 * );
 * // "Success: 42"
 * ```
 *
 * @see {@link fold} (alias)
 *
 * @public
 */
export const match =
  <E, A, B>(matchers: {
    readonly onOk: (a: A) => B;
    readonly onErr: (e: E) => B;
  }) =>
  (result: Result<E, A>): B =>
    isOk(result) ? matchers.onOk(result.value) : matchers.onErr(result.error);
````

## Module Header (Entry File)

````ts
/**
 * @module staybase/core/result
 *
 * Type-safe error handling without exceptions.
 *
 * @remarks
 * The Result monad represents computations that may fail, providing
 * compositional error handling with full type safety.
 *
 * Key operations:
 * - {@link ok} / {@link err} — Constructors
 * - {@link map} / {@link flatMap} — Transformations
 * - {@link match} — Pattern matching
 * - {@link tryCatch} — Exception boundary
 *
 * @example
 * ```ts
 * import { result, pipe } from '@staytunedllp/staybase/core';
 *
 * const parseAndDouble = pipe(
 *   result.tryCatch(() => JSON.parse(input), String),
 *   result.flatMap(validate),
 *   result.map((n) => n * 2)
 * );
 * ```
 *
 * @since 1.0.0
 *
 * @packageDocumentation
 */
````

---

# AI-Consumable Documentation Patterns

## Semantic Precision

```ts
/**
 * Flat-maps a function over the success channel of a Task.
 *
 * @remarks
 * This is the monadic `bind` (>>=) operation. Unlike `map`, the function
 * returns a new Task, which is then "flattened" into the result.
 *
 * Algebraic laws:
 * - Left identity: `flatMap(f)(of(a)) ≡ f(a)`
 * - Right identity: `flatMap(of)(m) ≡ m`
 * - Associativity: `flatMap(g)(flatMap(f)(m)) ≡ flatMap(x => flatMap(g)(f(x)))(m)`
 */
```

## Constraint Documentation

```ts
/**
 * @param input - The string to parse (must be valid JSON, max 1MB)
 * @param schema - Zod schema for validation (must have `.parse` method)
 * @typeParam T - Output type (constrained by schema inference)
 */
```

## Common Pattern References

```ts
/**
 * @remarks
 * **Pattern**: This follows the "Fail Fast" strategy—validation errors
 * short-circuit, returning the first failure.
 *
 * **Alternative**: Use {@link validateAll} for "Fail Slow" (accumulate errors).
 */
```

---

# Anti-Patterns to Avoid

## ❌ Don't Document Exceptions in Public APIs

```ts
// BAD - staystack uses Result, not exceptions
/**
 * @throws {TypeError} If input is invalid
 */

// GOOD - describe Result error case
/**
 * @returns `Err("InvalidInput")` if parsing fails
 */
```

## ❌ Don't Repeat Type Signatures

```ts
// BAD - just restating types
/**
 * @param value - value of type A
 * @returns Result<E, A>
 */

// GOOD - explain semantics
/**
 * @param value - The success value to wrap (must not be null)
 * @returns An Ok containing the value, ready for composition
 */
```

## ❌ Don't Use Vague Descriptions

```ts
// BAD - meaningless
/**
 * Processes the data.
 */

// GOOD - specific and actionable
/**
 * Validates user input against schema and transforms to UserProfile.
 */
```

## ❌ Don't Skip Examples for Non-Trivial Functions

````ts
// BAD - curried function without example
/**
 * Chains Result-returning operations.
 */

// GOOD - shows curried application
/**
 * @example
 * ```ts
 * const parseAndValidate = pipe(
 *   result.flatMap(parse),
 *   result.flatMap(validate)
 * );
 * ```
 */
````

## ❌ Don't Mix Release Stages Incorrectly

```ts
// BAD - @public API exposing @internal type
/**
 * @public
 */
export const process = (input: InternalType): Result => ...

// GOOD - consistent release stages
/**
 * @public
 */
export const process = (input: PublicInput): Result => ...
```

---

# Quality Checklist

## Before Commit

- [ ] Every exported symbol has a TSDoc comment
- [ ] All `@param` names match actual parameter names
- [ ] `@returns` describes semantics, not just types
- [ ] `@typeParam` documents all generic parameters
- [ ] `@example` blocks use real staystack imports
- [ ] Examples show expected output in comments
- [ ] Examples cover success AND failure for fallible ops
- [ ] Module entry files have `@module` + `@packageDocumentation`
- [ ] Release stage modifiers (`@public`, `@beta`, etc.) are consistent
- [ ] No `@throws` tags on public APIs
- [ ] Cross-references use `{@link}` correctly
- [ ] Algebraic laws documented in `@remarks` where applicable
- [ ] `@since` tags on new APIs

## AI-Readability Checks

- [ ] Summaries are actionable first sentences
- [ ] Semantic constraints are explicit (nullability, ranges)
- [ ] Related APIs are cross-linked
- [ ] Common usage patterns are in examples
- [ ] Error cases are fully documented

---

# Tooling Integration

## API Extractor

```jsonc
// api-extractor.json
{
  "docModel": {
    "enabled": true,
    "apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json",
  },
  "tsdocMetadata": {
    "enabled": true,
  },
}
```

## TSDoc Config

```json
// tsdoc.json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "extends": ["@microsoft/api-extractor/extends/tsdoc-base.json"],
  "tagDefinitions": [
    {
      "tagName": "@category",
      "syntaxKind": "block"
    }
  ]
}
```

## ESLint TSDoc Plugin

```jsonc
// .eslintrc.json
{
  "plugins": ["eslint-plugin-tsdoc"],
  "rules": {
    "tsdoc/syntax": "warn",
  },
}
```
