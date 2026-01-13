# Epic: Shopping Experience

**Status:** Draft  
**Bounded Context:** Cart

---

## Purpose

Allow users to curate and persist product selections across sessions, supporting both anonymous and authenticated shopping flows.

---

## Business Value

- Addresses KPI-001 (Cart conversion ≥30%)
- Addresses KPI-004 (Repeat purchase rate ≥20%)
- Reduces cart abandonment via persistence
- Incentivizes account creation through cross-device benefits
- Creates foundation for abandoned cart recovery

---

## Scope

### Included Features

9. **Anonymous Cart with Local Storage** (Feature 9)
   - Guest shopping cart
   - localStorage persistence (30 days)

10. **Authenticated Cart Persistence** (Feature 10)
    - Firestore-backed cart
    - Cross-device synchronization

11. **Private Wishlist** (Feature 11)
    - Product favoriting
    - Persistent wishlist storage

### Dependencies

- Epic 2: Product Discovery (Features 4-5 for add-to-cart actions)
- Epic 1: Foundation & Infrastructure (Feature 2 for authentication)

### Success Criteria

- [ ] Anonymous cart persists across browser sessions
- [ ] Authenticated cart syncs across devices
- [ ] Cart migration works seamlessly on login
- [ ] Wishlist functionality fully operational
- [ ] Cart conversion rate ≥30% (KPI-001)

---

## Risks & Mitigation

**Risk:** localStorage quota exceeded with large carts  
**Mitigation:** 50-item cart limit with warnings

**Risk:** Cart sync conflicts across devices  
**Mitigation:** Last-write-wins strategy; clear conflict resolution

---

## Timeline Estimate

**Duration:** 2-3 weeks  
**Parallel Work:** Features 9-10 share UI, different persistence strategies

---

## Related Epics

- Prerequisite for: Checkout & Fulfillment
