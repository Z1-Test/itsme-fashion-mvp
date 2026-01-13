---
title: TypeScript environment and configuration standards (canonical)
description: Parse and validate configuration at startup; inject config, do not read process.env in business logic.
tags:
  - typescript
  - configuration
  - environment
  - validation
---

# What is it?

Standards for environment variables and configuration handling.

# Why use it?

- Fail fast with clear errors.
- Avoid runtime crashes from missing config.
- Keep business logic pure and testable.

# How to use it?

1. Parse `process.env` at the application boundary.
2. Convert to a typed config using `Result`.
3. Inject config into services.

## Rules

- Do not access `process.env` inside business logic.
- Do not default secrets.
- Validate everything at startup.

## Helper patterns

```ts
import { result } from "@staytunedllp/staybase/core";

export const parsePositiveInt = (
  name: string,
  value: string | undefined,
): result.Result<string, number> => {
  if (typeof value !== "string" || value.length === 0) {
    return result.err(`missing:${name}`);
  }

  const n = Number(value);

  return Number.isInteger(n) && n > 0
    ? result.ok(n)
    : result.err(`invalid:${name}`);
};
```

## Runtime-Agnostic APIs

> [!IMPORTANT]
> **Never use `node:fs` or `node:crypto` directly.** Use provider abstractions:

| API      | Provider                                           | Configuration                                                                 |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| File I/O | `fsProviders` from `@staytunedllp/staybase`        | `configureNodeFs()` / `configureBrowserFs()` from `@staytunedllp/stayadapter` |
| Crypto   | `security.providers` from `@staytunedllp/staybase` | `configureNodeCrypto()` from `@staytunedllp/stayadapter`                      |

This ensures all packages remain runtime-agnostic (Node, Browser, Edge).

## Checklist

- All env validated at startup.
- Config injected (curried dependencies).
- No secrets in git.
- Use `fsProviders` for file I/O, not `node:fs`.
- Use `security.providers` for crypto, not `node:crypto`.
