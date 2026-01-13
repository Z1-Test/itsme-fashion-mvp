# Security Headers

## Required Headers

| Header                      | Value                                 | Purpose               |
| --------------------------- | ------------------------------------- | --------------------- |
| `Content-Security-Policy`   | See below                             | Prevent XSS           |
| `X-Content-Type-Options`    | `nosniff`                             | Prevent MIME sniffing |
| `X-Frame-Options`           | `DENY`                                | Prevent clickjacking  |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`     | Control referrer      |
| `Permissions-Policy`        | See below                             | Control features      |

## Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.example.com;
  style-src 'self' 'nonce-{RANDOM}';
  img-src 'self' https: data:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests
```

### CSP Prohibited

| ❌ Forbidden    | Reason              |
| --------------- | ------------------- |
| `unsafe-inline` | XSS vulnerability   |
| `unsafe-eval`   | Major security risk |
| `*` wildcards   | Allows any source   |

### CSP Directives

| Directive         | Purpose             |
| ----------------- | ------------------- |
| `default-src`     | Fallback for all    |
| `script-src`      | JavaScript sources  |
| `style-src`       | CSS sources         |
| `img-src`         | Image sources       |
| `connect-src`     | Fetch/XHR/WebSocket |
| `frame-ancestors` | Who can embed       |

## HSTS

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Permissions-Policy

```
Permissions-Policy:
  accelerometer=(),
  camera=(),
  geolocation=(),
  microphone=(),
  payment=(),
  interest-cohort=()
```

## Cookie Security

```
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Strict; Path=/
```

| Attribute         | Purpose       |
| ----------------- | ------------- |
| `Secure`          | HTTPS only    |
| `HttpOnly`        | No JS access  |
| `SameSite=Strict` | No cross-site |

## HTML with Nonce

```html
<script nonce="GENERATED_NONCE">
  // Critical inline script
</script>

<style nonce="GENERATED_NONCE">
  /* Critical CSS */
</style>
```

## Remove These Headers

| Header         | Risk              |
| -------------- | ----------------- |
| `Server`       | Reveals software  |
| `X-Powered-By` | Reveals framework |

## Security Checklist

- [ ] CSP defined (no unsafe-inline/eval)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] HSTS enabled
- [ ] Cookies have Secure, HttpOnly, SameSite
- [ ] No Server/X-Powered-By headers
