# DESIGN.md  
BB — Mini Design Doc + Thin Slice + Change Request

---

## Part A — Mini Design Doc (1 Page)

### 1. Stack Choice

**Backend**
- **Node.js + Express**
  - Fast to build and easy to reason about
  - Explicit control over middleware and RBAC
  - Suitable for API-first systems

**Database**
- **SQLite (better-sqlite3)**
  - Simple, file-based DB
  - Supports transactions and constraints
  - Ideal for demonstrating truth-at-source logic

**Auth**
- Mock token / JWT-style auth
  - Keeps focus on authorization logic, not identity providers

**Storage**
- No file storage required for Phase A
  - Evidence is modeled as metadata + versions only

This stack prioritizes **clarity, correctness, and auditability** over infrastructure complexity.

---

### 2. Data Model (Entities & Relationships)

**User**
- id
- role (buyer | factory)
- factory_id (nullable)

**Factory**
- id

**Evidence**
- id
- factory_id
- name
- doc_type

**EvidenceVersion**
- id
- evidence_id
- version_number
- expiry
- notes

**Request**
- id
- buyer_id
- factory_id
- title
- status

**RequestItem**
- id
- request_id
- doc_type
- status
- fulfilled_evidence_version_id
- fulfilled_at

**AuditLog**
- timestamp
- actor_user_id
- actor_role
- action
- object_type
- object_id
- metadata (JSON)

**Relationships**
- Factory → Evidence → EvidenceVersions
- Buyer → Requests → RequestItems
- RequestItem → EvidenceVersion (on fulfill)
- All write actions → AuditLog

---

### 3. Selective Disclosure (Phase A)

In Phase A, disclosure rules are simple:

- Buyers **cannot access evidence directly**
- Buyers can only see:
  - request status
  - request items
  - whether an item is fulfilled
- Factories can only see:
  - their own evidence
  - their own requests

Evidence versions are only revealed through **explicit fulfillment**.

---

### 4. Export Pack Approach (Future / Async Idea)

Export packs are modeled as asynchronous jobs:

- `POST /packs` creates a pack (status: PENDING)
- A background worker prepares documents
- Status transitions: `PENDING → READY`
- `GET /packs/:id` returns a signed download URL

This avoids blocking API calls and scales well with large datasets.

(Not implemented in Phase A.)

---

### 5. Testing Plan (Minimum)

- Unit tests for:
  - Role-based access (buyer vs factory)
  - Ownership enforcement (factory scoping)
- Integration tests for:
  - Request creation
  - Fulfillment transaction
- Negative tests:
  - Buyer attempting to fulfill
  - Factory accessing other factory’s request

---

### 6. 8-Week Delivery Plan (4 Milestones)

**Weeks 1–2**
- Core data model
- Authentication and RBAC
- Audit logging

**Weeks 3–4**
- Request workflow
- Evidence versioning
- Ownership enforcement

**Weeks 5–6**
- Export packs (async jobs)
- Share links (expiry + revoke)

**Weeks 7–8**
- Hardening & performance
- Extended tests
- Documentation & security review

---

## Part B — Thin Slice Implementation  
**Request Workflow Slice (Best Option)**

For the thin slice, I implemented the **buyer → factory request workflow**, reusing the AA implementation.

**Flow:**
1. A buyer creates a request specifying a target factory and required document types.
2. The factory views only its own requests and fulfills each request item by attaching an evidence version.
3. The buyer can then check the request status and see which items are fulfilled or pending.

**Why this slice**
- Covers authentication, authorization, database access, business logic, and audit logging
- Demonstrates truth-at-source validation via SQL ownership checks
- Shows transactional integrity and role separation

This slice proves the core business workflow works end-to-end without UI.

---

## Part C — Change Request

### Change Requested
> “Buyer can only access evidence versions that were explicitly shared via fulfill or included in a pack.”

---

### What Changed

**Change implemented:**
- Buyers now only see evidence versions explicitly shared via request fulfillment.
- We read `fulfilled_evidence_version_id` JSON to get `evidenceId` and `versionId`.
- Any request item without a fulfilled evidence version is hidden from the buyer.

Future extension:
- Inclusion via packs would add another explicit sharing mechanism.

---

### Where Changed

- Buyer-facing read endpoints now query:
  - `request_items.fulfilled_evidence_version_id`
- Evidence tables are never queried directly for buyers
- Access logic is enforced at the query level, not the client

---

### Why This Works

- Prevents accidental over-disclosure
- Keeps evidence visibility explicit and auditable
- Aligns with compliance and least-privilege principles

---

## Top 3 Risks & Mitigation

### 1. Incorrect ownership enforcement
**Risk:** Factories accessing other factories’ data  
**Mitigation:** SQL-level factory_id checks + tests

---

### 2. Missing audit events
**Risk:** Compliance gaps  
**Mitigation:** Audit writes inside the same function as state changes

---

### 3. Scope creep
**Risk:** Overengineering Phase A  
**Mitigation:** Thin-slice approach + deferred features (packs, sharing)

---

## Status

- AA: ✅ Complete
- BB Part A: ✅ Complete
- BB Part B: ✅ Complete (request workflow slice)
- BB Part C: ✅ Complete (selective evidence access)

