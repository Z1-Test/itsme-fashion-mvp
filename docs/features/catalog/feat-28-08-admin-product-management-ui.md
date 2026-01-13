---
feature_name: "Admin Product Management UI"
bounded_context: "catalog"
parent_epic: "Product Discovery"
status: "draft"
issue_url: "https://github.com/Z1-Test/itsme-fashion-mvp/issues/28"
issue_number: "28"
issue_id: "I_kwDOQ4xnqM7i9h02"
flag_issue_number: "29"
flag_key: "feature_fe_28_fl_29_admin_product_management_enabled"
---

# Feature: Admin Product Management UI

> **Purpose:**
> Authenticated admin interface for CRUD operations on product catalog (replaces manual CSV updates post-launch).

---

## 1. Overview

Web-based admin interface enables product managers to create, update, and manage catalog products without technical CSV editing.

**What changes:** Product catalog becomes dynamically manageable through UI instead of static CSV imports

---

## 2. User Problem

Product managers cannot update catalog without developer intervention (CSV editing + re-import), causing:
- Delays in product launches
- Dependency on technical resources for business operations
- Inability to quickly fix product errors

---

## 3. Goals

- Self-service product management for authorized users
- Real-time catalog updates without deployments
- Audit trail for product changes

---

## 4. Non-Goals

- Bulk import UI (CSV import script remains)
- Product analytics dashboard (deferred)
- Image upload (image URLs only)
- Role-based permissions granularity (single admin role only)

---

## 5. Functional Scope

- **Product List View:** Searchable table of all products
- **Create Product:** Form with all product fields (name, price, ingredients, ethical markers, shades)
- **Edit Product:** Inline editing of existing products
- **Delete Product:** Soft delete (mark inactive, not hard delete)
- **Stock Management:** Toggle in-stock/out-of-stock status
- **Admin Authentication:** Requires Firebase Auth with admin flag

---

## 6. Dependencies

User Authentication (Feature 2), Product Catalog Browsing (Feature 4)

**Assumptions:**
- Admin users identified by `isAdmin` boolean in Firestore user document
- Admin UI is separate route (/admin/products)
- Non-admin users cannot access admin routes

---

## 7. Key Scenarios

**Scenario 1.1:** Admin logs in → navigates to /admin/products → sees product list → clicks "Add Product" → fills form → submits → product appears in catalog immediately

**Scenario 1.2:** Admin edits product price → updates → change reflects in catalog within seconds

**Scenario 1.3:** Non-admin user attempts to access /admin → redirected to home with error message

---

## 9. Implementation Tasks

```markdown
- [ ] T01 — Implement admin authentication guard and route protection
- [ ] T02 — Implement product list view with search
- [ ] T03 — Implement create product form with validation
- [ ] T04 — Implement edit and delete functionality
- [ ] T05 — [Rollout] Feature flag gating
```

---

## 10. Acceptance Criteria

```markdown
- [ ] AC1 — Admin users can create products via UI
- [ ] AC2 — Product updates reflect in catalog immediately
- [ ] AC3 — Non-admin users cannot access admin routes
```

---

## 11. Rollout & Risk

<!-- REMOTE_CONFIG_FLAG_START -->
| Context | Type | Namespace | Default (Dev) | Default (Stg) | Default (Prod) | Key |
|---------|------|-----------|---------------|---------------|----------------|-----|
| admin_product_management | BOOLEAN | client | true | false | false | `feature_fe_28_fl_29_admin_product_management_enabled` |
<!-- REMOTE_CONFIG_FLAG_END -->

**Risk:** Unauthorized access to admin functions
**Mitigation:** Firebase Security Rules enforce admin-only writes; UI guards are defense-in-depth only

---

## 12. History & Status

- **Status:** Draft
- **Related Epics:** Product Discovery