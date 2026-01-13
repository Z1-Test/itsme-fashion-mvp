# Epic: User Account Management

**Status:** Draft  
**Bounded Context:** Identity

---

## Purpose

Enable users to manage their account data and preferences for improved checkout and personalization experiences.

---

## Business Value

- Reduces checkout friction via pre-filled addresses
- Improves data accuracy (users maintain own data)
- Reduces support burden (self-service updates)
- Foundation for future personalization features

---

## Scope

### Included Features

17. **User Profile Management** (Feature 17)
    - Profile view/edit
    - Default shipping address management

### Dependencies

- Epic 1: Foundation & Infrastructure (Feature 2 for authentication)

### Success Criteria

- [ ] Users can view and update profile data
- [ ] Default address pre-fills checkout form
- [ ] Profile updates persist to Firestore
- [ ] Validation prevents invalid data

---

## Risks & Mitigation

**Risk:** Users accidentally update critical data (email)  
**Mitigation:** Email read-only for MVP; separate verification flow post-MVP

---

## Timeline Estimate

**Duration:** 1 week  
**Can execute in parallel with other epics after Epic 1**

---

## Related Epics

- Can execute in parallel with Epic 2, 3, or 4
