---
title: TypeDoc standards (canonical)
description: Guidance for TypeDoc-friendly exported APIs in staystack-ts.
tags:
  - typescript
  - typedoc
  - documentation
---

Configuration and usage standards for TypeDoc, the API documentation generator for TypeScript projects in staystack-ts.

## Why Use This?

- Automatically generates comprehensive API documentation from TSDoc comments
- Maintains documentation in sync with code (single source of truth)
- Provides searchable, navigable API reference for developers
- Enables AI assistants to understand codebase structure
- Facilitates onboarding of new developers

## How to Use This?

### TypeDoc Configuration

Located at [docs/guides/typedoc.json](../../guides/typedoc.json):

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/packages/*/index.ts"],
  "out": "docs/guides/doc_build/api-reference",
  "plugin": ["typedoc-plugin-markdown"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "**/dist/**"],
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "readme": "none",
  "categorizeByGroup": true,
  "categoryOrder": ["Core", "Utilities", "Types", "*"],
  "sort": ["source-order"],
  "validation": {
    "notExported": true,
    "invalidLink": true,
    "notDocumented": true
  }
}
```

### Generating Documentation

```bash
# Generate API documentation
npm run docs:api

# Generate and watch for changes
npm run docs:api -- --watch

# Generate for specific package
npx typedoc --entryPoints src/packages/staybase/index.ts
```

### Entry Points

TypeDoc processes all package entry points:

```text
src/packages/
├── staybase/index.ts
├── staytest/index.ts
├── stayserver/index.ts
└── ...
```

Each `index.ts` re-exports public APIs:

```ts
/**
 * @module staybase
 * @description Core functional programming primitives
 */

export { Result, ok, err } from "./result.js";
export { Option, some, none } from "./option.js";
export { Task } from "./task.js";
```

### Organizing Documentation

Use JSDoc tags to organize generated docs:

````ts
/**
 * Creates a successful Result containing a value.
 *
 * @category Constructors
 * @param value - The success value
 * @returns A Result in the Ok state
 *
 * @example
 * ```ts
 * const result = ok(42);
 * console.log(result.unwrap()); // 42
 * ```
 */
export const ok = <T, E = never>(value: T): Result<T, E> => {
  // Implementation
};
````

Available categories:

- `@category Constructors` - Factory functions
- `@category Combinators` - Transform/combine values
- `@category Predicates` - Boolean checks
- `@category Utilities` - Helper functions
- `@category Types` - Type definitions

### Internal APIs

Mark internal APIs to exclude from public documentation:

```ts
/**
 * Internal helper for Result implementation.
 *
 * @internal
 */
export const _resultInternals = {
  // Internal implementation
};
```

### Cross-Linking

Link to related functions and types:

```ts
/**
 * Maps a function over a Result value.
 *
 * @see {@link flatMap} for nested Result handling
 * @see {@link Result} for the base type
 *
 * @param fn - Transform function
 * @returns New Result with transformed value
 */
export const map = <T, E, U>(
  fn: (value: T) => U,
): ((result: Result<T, E>) => Result<U, E>) => {
  // Implementation
};
```

### Deprecation Notices

Mark deprecated APIs with migration guidance:

````ts
/**
 * @deprecated Use {@link Result.tryCatch} instead. Will be removed in v2.0.0.
 *
 * @example Migration
 * ```ts
 * // Before
 * const result = safeOperation();
 *
 * // After
 * const result = Result.tryCatch(() => operation());
 * ```
 */
export const safeOperation = (): Result<Data, Error> => {
  // Implementation
};
````

### Custom Themes

Use plugins for enhanced output:

```bash
# Markdown output for documentation sites
npm install --save-dev typedoc-plugin-markdown

# Search plugin
npm install --save-dev typedoc-plugin-search
```

### Documentation Structure

Generated documentation structure:

```text
docs/guides/doc_build/api-reference/
├── index.md                    # Overview
├── modules/
│   ├── staybase.md            # Package documentation
│   ├── staytest.md
│   └── ...
└── classes/                   # If any (should be empty for FP)
```

### Validation Rules

TypeDoc validates documentation quality:

1. All exported APIs must have TSDoc comments
2. All parameters must be documented
3. Return types must be documented
4. Links must point to valid symbols

```bash
# Run validation
npm run docs:api -- --validation
```

### CI/CD Integration

Generate documentation in CI pipeline:

```yaml
# .github/workflows/docs.yml
- name: Generate API Docs
  run: npm run docs:api

- name: Check for changes
  run: git diff --exit-code docs/guides/doc_build/api-reference
```

## Security & Best Practices

- Never include credentials or secrets in code comments
- Review generated documentation before publishing
- Use `.gitignore` to exclude build artifacts if not versioned
- Sanitize user-provided content in examples

## Limitations & Trade-offs

- TypeDoc generation time increases linearly with codebase size
- Large documentation sites can be difficult to navigate
- Markdown output lacks some features of HTML output
- Requires disciplined TSDoc comment maintenance

## Scalability & Performance

- TypeDoc scales to monorepos with 100+ packages
- Incremental builds cache unchanged files
- Parallel processing reduces generation time
- Use `--entryPointStrategy packages` for multi-package repos

```json
{
  "entryPointStrategy": "packages",
  "entryPoints": ["src/packages"]
}
```

## Output Formats

TypeDoc supports multiple output formats:

- HTML (default) - Interactive, searchable website
- Markdown - For documentation sites (RSPress, Docusaurus)
- JSON - For custom processing or tooling

```bash
# HTML output
npm run docs:api -- --out docs/api-html

# Markdown output
npm run docs:api -- --plugin typedoc-plugin-markdown --out docs/api-md

# JSON output
npm run docs:api -- --json docs/api.json
```
