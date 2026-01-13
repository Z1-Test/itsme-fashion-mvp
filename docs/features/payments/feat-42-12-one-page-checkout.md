---
feature_name: "One-Page Checkout"
bounded_context: "payments"
parent_epic: "Checkout & Fulfillment"
status: "draft"
issue_url: "https://github.com/Z1-Test/itsme-fashion-mvp/issues/42"
issue_number: "42"
issue_id: "I_kwDOQ4xnqM7i9ido"
flag_issue_number: "43"
flag_key: "feature_fe_42_fl_43_one_page_checkout_enabled"
---

# Feature: One-Page Checkout

> **Purpose:**
> Streamlined checkout flow capturing shipping address (with basic validation) and payment method selection for cart contents.

---

## 1. Overview

Single-page checkout minimizes friction between cart and order completion by consolidating shipping and payment into one form.

**What changes:** Multi-step checkout replaced with streamlined single-page experience

---

## 2. User Problem

Complex checkout flows cause cart abandonment through:
- Excessive form fields across multiple pages
- Unclear progress indicators
- Lost form data between steps
- Friction from page navigation

Target: Checkout completion ≤3 minutes (KPI-002)

---

## 3. Goals

- Single-page form with shipping address and payment sections
- Form validation with clear error messages
- Order summary always visible
- Autofill support for returning users (saved default address)

---

## 4. Non-Goals

- Guest checkout (authentication required)
- Multiple shipping addresses (single address only)
- Shipping method selection (standard shipping only)
- Promo codes/discounts (deferred)

---

## 5. Functional Scope

- **Shipping Section:** Address fields (name, street, city, postal code, country - UK only)
- **Payment Section:** Payment method selection (cards only for simulation)
- **Order Summary:** Cart items, quantities, prices, total (GBP)
- **Form Validation:** Client-side validation before submission
- **Submit Button:** Triggers payment simulation (Feature 13)
- **Loading State:** Disable form during payment processing

---

## 6. Dependencies

Authenticated Cart (Feature 10), User Authentication (Feature 2), Design System MCP (Feature 1)

---

## 7. Key Scenarios

**Scenario 1.1:** User clicks "Checkout" from cart → form loads with saved address if available → fills/confirms shipping → selects payment → submits → payment processes (Feature 13)

**Scenario 1.2:** Validation error (missing postal code) → error highlights field → user corrects → submits successfully

**Scenario 1.3:** User abandons checkout → returns later → form data preserved in session

---

## 9. Implementation Tasks

```markdown
- [ ] T01 — Implement checkout page layout with shipping and payment sections
- [ ] T02 — Implement shipping address form with validation
- [ ] T03 — Implement payment method selection UI
- [ ] T04 — Implement order summary component
- [ ] T05 — [Rollout] Feature flag gating
```

---

## 10. Acceptance Criteria

```markdown
- [ ] AC1 — Checkout form renders with all required fields
- [ ] AC2 — Form validation prevents invalid submissions
- [ ] AC3 — Order summary displays correct totals
- [ ] AC4 — Form integrates with payment simulation
```

---

## 11. Rollout & Risk

<!-- REMOTE_CONFIG_FLAG_START -->
| Context | Type | Namespace | Default (Dev) | Default (Stg) | Default (Prod) | Key |
|---------|------|-----------|---------------|---------------|----------------|-----|
| one_page_checkout | BOOLEAN | client | true | false | false | `feature_fe_42_fl_43_one_page_checkout_enabled` |
<!-- REMOTE_CONFIG_FLAG_END -->

---

## 12. History & Status

- **Status:** Draft
- **Related Epics:** Checkout & Fulfillment