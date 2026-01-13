---
title: TypeScript security standards (canonical)
description: Security requirements and stop-the-line protocol for staystack-ts.
tags:
  - typescript
  - security
  - stop-the-line
  - validation
---

# What is it?

Security standards for TypeScript code in staystack-ts.

# Why use it?

- Prevents vulnerabilities (injection, data leaks, auth bypass).
- Makes security review predictable and mechanical.

# How to use it?

- Use this file during design and code review.
- When a security issue is found, apply the stop-the-line protocol.

## Stop the line protocol

Work stops immediately if you see:

- Hardcoded secrets.
- PII in logs.
- Injection vectors (SQL, command, path traversal, XSS).
- Weak transport/auth configuration (TLS disabled, permissive CORS in prod).

Response steps:

1. Stop merges/releases.
2. Document the issue (path, lines, impact).
3. Fix the root cause.
4. Review adjacent code.
5. Add a regression check or stronger rule of thumb to prevent recurrence.

## Secrets management

- Never commit secrets.
- Do not provide default values for secrets.
- Validate required config at startup.

Preferred pattern: parse env into a typed config using `Result`, then inject config instead of reading `process.env` throughout the code.

```ts
import { result } from "@staytunedllp/staybase/core";

export type EnvConfig = {
  readonly nodeEnv: "development" | "staging" | "production";
  readonly apiKey: string;
};

export const parseEnvConfig = (
  env: NodeJS.ProcessEnv,
): result.Result<string, EnvConfig> => {
  const nodeEnv = env.NODE_ENV;
  const apiKey = env.API_KEY;

  if (
    nodeEnv !== "development" &&
    nodeEnv !== "staging" &&
    nodeEnv !== "production"
  ) {
    return result.err("invalid-node-env");
  }

  if (typeof apiKey !== "string" || apiKey.length === 0) {
    return result.err("missing-api-key");
  }

  return result.ok({ nodeEnv, apiKey });
};
```

## Input validation

- Treat all external input as `unknown`.
- Parse once at boundaries (Parse, don’t validate).
- Pass typed domain values inward.

## Injection prevention

- SQL: parameterized queries only.
- Command execution: avoid shell execution; never concatenate user input.
- Filesystem: do not accept arbitrary paths; resolve against an allowed root.
- XSS: never insert user content into HTML without escaping.

## Logging

- Do not log PII or secrets.
- Prefer stable identifiers (userId) over email/phone.
- Sanitize errors before logging.

## Timing-safe comparisons

When comparing secrets, use a timing-safe function.

In Node:

```ts
import { timingSafeEqual } from "node:crypto";

export const timingSafeEqualString = (a: string, b: string): boolean => {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
};
```

## Checklist

- No hardcoded secrets.
- Boundary parsing for all external inputs.
- Parameterized SQL only.
- No PII in logs.
- Timing-safe secret comparison.
- No `eval` / dynamic code execution.
