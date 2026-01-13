---
feature_name: "Payment Gateway Simulation"
bounded_context: "payments"
parent_epic: "Checkout & Fulfillment"
status: "draft"
---

# Feature: Payment Gateway Simulation

> **Purpose:**
> Internal payment processor simulating 6 failure modes plus success and pending states, enabling full checkout testing without external payment SDK.

---

## 1. Overview

Simulates realistic payment gateway behavior including common failure scenarios for comprehensive testing.

**What changes:** Checkout flow becomes functional end-to-end without external payment integration dependencies

---

## 2. User Problem

Developers cannot test full checkout flow without live payment gateway, causing:
- Incomplete feature testing
- Production surprises with payment errors
- Inability to validate error handling

---

## 3. Goals

- Simulate payment success, pending, and 6 failure modes
- Deterministic failure based on test card numbers or amount values
- Transaction logging for debugging
- Foundation for future Cashfree integration

---

## 4. Non-Goals

- Real payment processing (simulation only)
- PCI compliance (no real card data stored)
- Payment method tokenization (deferred to real integration)
- Refund simulation (orders are immutable)

---

## 5. Functional Scope

**Simulation Modes:**
1. **Success:** Amount < £100 → success
2. **Pending:** Amount = £100.00 exactly → pending state
3. **Insufficient Funds:** Amount > £1000 → failure
4. **Network Timeout:** Amount ends in .99 → timeout error
5. **Invalid Payment Method:** Test card number "4000000000000002" → invalid
6. **Fraud Detection:** Amount > £5000 → fraud flag
7. **Gateway Downtime:** Amount = £999.99 → gateway error
8. **Partial Authorization:** Amount = £250.00 → partial auth

**Transaction Record:**
- Firestore `payment_transactions` collection
- Fields: transactionId, userId, amount, status, timestamp, failureReason

---

## 6. Dependencies

One-Page Checkout (Feature 12)

---

## 7. Key Scenarios

**Scenario 1.1:** User submits payment for £50 → success → order created

**Scenario 1.2:** User submits payment for £2000 → insufficient funds error → user-friendly message → retry option

**Scenario 1.3:** User submits invalid card → validation error → clear instructions

---

## 9. Implementation Tasks

```markdown
- [ ] T01 — Implement payment simulation logic with failure mode detection
- [ ] T02 — Implement transaction logging to Firestore
- [ ] T03 — Implement payment response handling and error messaging
- [ ] T04 — Implement retry logic for failed payments
- [ ] T05 — [Rollout] Feature flag gating
```

---

## 10. Acceptance Criteria

```markdown
- [ ] AC1 — All 8 simulation modes work correctly
- [ ] AC2 — Transactions logged to Firestore
- [ ] AC3 — Error messages are user-friendly
- [ ] AC4 — Success triggers order creation (Feature 14)
```

---

## 11. Rollout & Risk

<!-- REMOTE_CONFIG_FLAG_START -->
| Context | Type | Namespace | Default (Dev) | Default (Stg) | Default (Prod) | Key |
|---------|------|-----------|---------------|---------------|----------------|-----|
| payment_simulation | BOOLEAN | server | true | true | false | _auto-generated_ |
<!-- REMOTE_CONFIG_FLAG_END -->

**CRITICAL:** Production deployment must replace simulation with real Cashfree integration

---

## 12. History & Status

- **Status:** Draft
- **Related Epics:** Checkout & Fulfillment
