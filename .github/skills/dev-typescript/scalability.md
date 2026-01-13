---
title: TypeScript scalability and performance standards (canonical)
description: Statelessness, observability, and performance guidance for staystack-ts.
tags:
  - typescript
  - scalability
  - performance
  - observability
---

# What is it?

Scalability and performance standards for staystack-ts.

# Why use it?

- Ensures code scales horizontally.
- Prevents predictable latency and memory regressions.

# How to use it?

- Apply these constraints during design.
- Use the checklist before merging performance-sensitive changes.

## Statelessness

- No global mutable state.
- No in-memory sessions.
- Caches must be bounded and have TTL when appropriate.

## Observability

- Structured logs (JSON) at boundaries.
- Per-request trace context.

## Concurrency

- Prefer parallel composition via `Task` helpers.
- Avoid sequential async chains when operations are independent.

Note: loop-free rules apply. If you need to integrate with streaming APIs, isolate any required iteration in a narrow boundary module.

## Databases

- Avoid N+1 queries.
- Use indexes.
- Batch reads where possible.

## Memory

- Avoid unbounded Maps/Sets.
- Prefer bounded caches.
- Monitor memory for long-running processes.

## Latency targets

- P50 < 100ms
- P95 < 500ms
- P99 < 1s

## Checklist

- Stateless handlers.
- No N+1 queries.
- Parallel where safe.
- Bounded caches.
- Stable object shapes in hot paths.
