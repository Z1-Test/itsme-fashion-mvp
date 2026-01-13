---
feature_name: "Private Wishlist"
bounded_context: "cart"
parent_epic: "Shopping Experience"
status: "draft"
issue_url: "https://github.com/Z1-Test/itsme-fashion-mvp/issues/16"
issue_number: "16"
issue_id: "I_kwDOQ4xnqM7i9hN0"
flag_issue_number: "17"
flag_key: "feature_fe_16_fl_17_private_wishlist_enabled"
---

# Feature: Private Wishlist

> **Purpose:**
> Authenticated users can save products to a private wishlist stored in Firestore with user-only visibility.

---

## 1. Overview

Enables users to curate favorite products for future purchase consideration.

**What changes:** Users can save products without adding to cart, enabling long-term product tracking

---

## 2. User Problem

Users researching products have no way to save favorites for later, causing:
- Loss of interesting products between sessions
- Re-searching for previously viewed items
- Difficulty tracking products for future purchases

---

## 3. Goals

- Private product favoriting for authenticated users
- Quick add/remove from product detail and catalog pages
- Dedicated wishlist view page
- Foundation for future features (price alerts, restock notifications)

---

## 4. Non-Goals

- Wishlist sharing (strictly private)
- Wishlist-to-cart bulk transfer (add items individually)
- Wishlist prioritization/sorting (simple list)
- Public wishlists/gift registries (deferred)

---

## 5. Functional Scope

- **Add to Wishlist:** Heart icon on product cards and detail pages
- **Wishlist Storage:** Firestore `wishlists/{userId}` document with product ID array
- **Wishlist Page:** Grid view of wishlist products (similar to catalog)
- **Remove from Wishlist:** Click heart icon again to remove
- **Visual Indicator:** Filled heart icon when product is wishlisted

---

## 6. Dependencies

User Authentication (Feature 2), Product Detail Pages (Feature 5), Product Catalog Browsing (Feature 4)

**Assumptions:**
- Wishlist requires authentication (no anonymous wishlists)
- Wishlist contains product IDs only (product details fetched on view)
- If wishlisted product deleted from catalog, it's removed from wishlist automatically

---

## 7. Key Scenarios

**Scenario 1.1:** User clicks heart icon on product → product added to wishlist → heart icon fills

**Scenario 1.2:** User navigates to wishlist page → sees grid of wishlisted products

**Scenario 1.3:** User clicks filled heart icon → product removed from wishlist → confirmation shown

---

## 9. Implementation Tasks

```markdown
- [ ] T01 — Implement wishlist Firestore schema and security rules
- [ ] T02 — Implement add/remove wishlist actions from product cards
- [ ] T03 — Implement wishlist page with product grid
- [ ] T04 — Implement wishlist icon state management
- [ ] T05 — [Rollout] Feature flag gating
```

---

## 10. Acceptance Criteria

```markdown
- [ ] AC1 — Users can add products to wishlist
- [ ] AC2 — Wishlist persists across sessions
- [ ] AC3 — Wishlist page displays all wishlisted products
- [ ] AC4 — Remove from wishlist works correctly
```

---

## 11. Rollout & Risk

<!-- REMOTE_CONFIG_FLAG_START -->
| Context | Type | Namespace | Default (Dev) | Default (Stg) | Default (Prod) | Key |
|---------|------|-----------|---------------|---------------|----------------|-----|
| private_wishlist | BOOLEAN | client | true | false | false | `feature_fe_16_fl_17_private_wishlist_enabled` |
<!-- REMOTE_CONFIG_FLAG_END -->

---

## 12. History & Status

- **Status:** Draft
- **Related Epics:** Shopping Experience