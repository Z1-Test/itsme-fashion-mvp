---
title: TypeScript skill examples
description: Usage examples for staystack-ts TypeScript skill patterns: Result/Task handling, immutable updates, imports, and validation.
tags:
  - typescript
  - examples
  - result
  - immutability
---

# Examples

## 1. Result-based parsing

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

type ParseError = "not-a-number" | "negative" | "fractional";

export const parsePort = (value: unknown): Result<ParseError, number> =>
  typeof value !== "number"
    ? result.err("not-a-number")
    : value < 0
      ? result.err("negative")
      : Number.isInteger(value)
        ? result.ok(value)
        : result.err("fractional");
```

## 2. Immutable update without mutation

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

type User = {
  readonly id: string;
  readonly email: string;
  readonly tags: readonly string[];
};

type UpdateError = "missing";

export const addTag = (user: User, tag: string): Result<UpdateError, User> =>
  tag.length === 0
    ? result.err("missing")
    : result.ok({ ...user, tags: [...user.tags, tag] });
```

## 3. Import ordering and .js extensions

```ts
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Config } from "@staytunedllp/staybase/config";

import { parseConfig } from "../../config/parse.js";
import { schema } from "./schema.js";
```

## 4. Strict narrowing of unknown input

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

type Payload = { readonly kind: "ping" | "data"; readonly value?: number };

type DecodeError =
  | "not-object"
  | "missing-kind"
  | "invalid-kind"
  | "invalid-value";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const decodePayload = (value: unknown): Result<DecodeError, Payload> => {
  if (!isRecord(value)) {
    return result.err("not-object");
  }

  const kind = value.kind;
  if (kind !== "ping" && kind !== "data") {
    return result.err(kind === undefined ? "missing-kind" : "invalid-kind");
  }

  const rawValue = value.value;
  if (
    kind === "data" &&
    (typeof rawValue !== "number" || Number.isNaN(rawValue))
  ) {
    return result.err("invalid-value");
  }

  return result.ok(
    rawValue === undefined ? { kind } : { kind, value: rawValue },
  );
};
```

## 5. Task-style async boundary

```ts
import { result, type Result } from "@staytunedllp/staybase/core";
import type { Task } from "@staytunedllp/staybase/task";

type FetchError = "network" | "invalid-status";

export const fetchJson =
  (url: string): Task<FetchError, unknown> =>
  (signal) =>
    fetch(url, { signal })
      .then((response) =>
        response.ok
          ? response.json().then((json) => result.ok(json))
          : Promise.resolve(result.err("invalid-status")),
      )
      .catch(() => Promise.resolve(result.err("network")));
```

## 6. Handling promises explicitly (no floating promises)

```ts
import { result, type Result } from "@staytunedllp/staybase/core";
import type { Task } from "@staytunedllp/staybase/task";

type UpdateError = "network";

const updateUser =
  (id: string, payload: unknown): Task<UpdateError, void> =>
  (signal) =>
    fetch(`/api/users/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    })
      .then((response) =>
        response.ok ? result.ok(undefined) : result.err("network"),
      )
      .catch(() => result.err("network"));

const save = async (): Promise<Result<UpdateError, void>> =>
  updateUser("123", { name: "Ada" })();
```

## 7. Push-based accumulation (avoid O(N^2) spreads)

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

const collectActiveIds = (
  items: ReadonlyArray<{ readonly id: string; readonly active: boolean }>,
): Result<never, readonly string[]> => {
  return result.ok(items.filter((item) => item.active).map((item) => item.id));
};
```

## 8. Timing-safe secret comparison

```ts
import { timingSafeEqual } from "node:crypto";

const safeCompare = (a: string, b: string): boolean => {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
};
```

## 9. Safe regex with bounded quantifiers

```ts
// Avoid catastrophic backtracking
const base64 = /^[A-Za-z0-9+/]*={0,2}$/;

const isBase64 = (value: unknown): boolean =>
  typeof value === "string" && base64.test(value);
```

## 10. Import order with .js extensions and blank line

```ts
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import type { Schema } from "@staytunedllp/staybase/schema";

import { parse } from "../../lib/parse.js";
import { schema } from "./schema.js";
```

## 11. Strict booleans and nullish handling

```ts
type Input = { readonly retries?: number | null };

const maxRetries = (input: Input): number => {
  const value = input.retries;
  return value !== null && value !== undefined && value > 0 ? value : 3;
};
```

## 12. Named exports only (no default export)

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

export const toResult = <E, A>(value: A, error: E): Result<E, A> =>
  value === undefined ? result.err(error) : result.ok(value);
```

## 13. Immutable, loop-free accumulation

```ts
type Item = { readonly id: string; readonly score: number };

const scores = (items: readonly Item[]): readonly number[] =>
  items.map((item) => item.score);
```

## 14. No throw/try: model failure with Result

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

type ParseError = "invalid-json";

export const parseJson = (input: string): Result<ParseError, unknown> =>
  result.tryCatch(
    () => JSON.parse(input),
    () => "invalid-json",
  );
```

## 15. Prefer const over let (no var)

```ts
// ❌ Bad: let when value never changes
let port = 3000;

// ✅ Good: const for immutable bindings
const port = 3000;

// ✅ OK: let when value must change (rare in FP)
let accumulator = 0;
accumulator = accumulator + 5;
```

## 16. No parameter reassignment

```ts
type User = { readonly name: string; readonly age: number };

// ❌ Bad: mutating parameter
const incrementAge = (user: User): User => {
  user.age = user.age + 1; // Error: immutable-data
  return user;
};

// ✅ Good: return new object
const incrementAge = (user: User): User => ({ ...user, age: user.age + 1 });
```

## 17. Strict equality (eqeqeq)

```ts
// ❌ Bad: loose equality
const isZero = (value: number): boolean => value == 0;

// ✅ Good: strict equality
const isZero = (value: number): boolean => value === 0;

// ✅ Exception: null coercion (allowed by config)
const hasValue = (value: string | null | undefined): boolean => value != null;
```

## 18. Curly braces for all control structures

```ts
// ❌ Bad: no braces (syntax error)
const greet = (name: string): string =>
  if (name) return `Hello ${name}`;

// ✅ Good: explicit braces
const greet = (name: string): string => {
  if (name.length > 0) {
    return `Hello ${name}`;
  } else {
    return "Hello";
  }
};

// ✅ Better: ternary expression
const greet = (name: string): string =>
  name.length > 0 ? `Hello ${name}` : "Hello";
```

## 19. Arrow functions over function expressions

```ts
// ❌ Bad: function expression
const items = [1, 2, 3].map(function (x) {
  return x * 2;
});

// ✅ Good: arrow function
const items = [1, 2, 3].map((x) => x * 2);
```

## 20. Object property shorthand

```ts
const name = "Alice";
const age = 30;

// ❌ Bad: redundant property names
const user = { name: name, age: age };

// ✅ Good: shorthand
const user = { name, age };
```

## 21. Eliminate unnecessary else (no-else-return)

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

// ❌ Bad: unnecessary else after return
const validateWithElse = (value: number): Result<string, number> => {
  if (value < 0) {
    return result.err("negative");
  } else {
    return result.ok(value);
  }
};

// ✅ Good: early return
const validateEarlyReturn = (value: number): Result<string, number> => {
  if (value < 0) {
    return result.err("negative");
  }
  return result.ok(value);
};

// ✅ Better: ternary
const validateTernary = (value: number): Result<string, number> =>
  value < 0 ? result.err("negative") : result.ok(value);
```

## 22. Logical assignment operators

```ts
type Config = { readonly port?: number; readonly host?: string };

const config: Config = { port: undefined, host: "" };

// ❌ Bad: verbose conditional assignment
let port = config.port;
if (port === undefined) {
  port = 3000;
}

// ✅ Good: nullish coalescing
const finalPort = config.port ?? 3000;

// ✅ Good: logical OR for falsy defaults
const finalHost = config.host || "localhost";
```

## 23. Type definitions: prefer type over interface

```ts
// ❌ Bad: interface
interface User {
  name: string;
  age: number;
}

// ✅ Good: type alias
type User = {
  readonly name: string;
  readonly age: number;
};
```

## 24. No variable shadowing

```ts
const userId = "123";

// ❌ Bad: shadowing outer variable
const getUser = (): string => {
  const userId = "456"; // Error: shadows outer userId
  return userId;
};

// ✅ Good: unique names
const getUserId = (): string => {
  const currentUserId = "456";
  return currentUserId;
};
```

## 25. Array type syntax

```ts
import type { Result } from "@staytunedllp/staybase/core";

// ❌ Bad: generic syntax for simple arrays
const ids: Array<string> = ["a", "b"];

// ✅ Good: array-simple syntax
const ids: string[] = ["a", "b"];

// ✅ OK: generic for complex types
const results: Array<Result<string, number>> = [];
```

## 26. Exhaustive switch statements

```ts
type Status = "pending" | "success" | "error";

const getMessage = (status: Status): string => {
  switch (status) {
    case "pending":
      return "Loading...";
    case "success":
      return "Done!";
    case "error":
      return "Failed";
    // TypeScript ensures exhaustiveness; omitting a case causes error
  }
};
```

## 27. Point-free (tacit) style where clear

```ts
const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];

// ❌ Verbose: explicit parameter
const names = users.map((user) => user.name);

// ✅ Point-free (when clear)
const getName = (user: { readonly name: string }): string => user.name;
const names = users.map(getName);
```

## 28. Conditional expressions over statements

```ts
import { result, type Result } from "@staytunedllp/staybase/core";

// ❌ Bad: if statement
const checkAgeWithStatements = (age: number): Result<string, number> => {
  if (age < 0) {
    return result.err("negative");
  }
  if (age > 120) {
    return result.err("too-old");
  }
  return result.ok(age);
};

// ✅ Good: ternary / early return expressions
const checkAgeExpression = (age: number): Result<string, number> =>
  age < 0
    ? result.err("negative")
    : age > 120
      ? result.err("too-old")
      : result.ok(age);
```
