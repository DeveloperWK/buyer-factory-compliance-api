# Buyer Request Workflow + Audit Log API

### (Truth-at-Source Controls)

### Overview

This project implements a **minimal backend API** that demonstrates a buyer →  **factory request workflow** with:

- Strict role-based access control (RBAC)
- Factory-scoped data visibility
- Truth-at-source enforcement (ownership validated at DB level)
- Immutable audit logging for every critical action

The goal is to **show correct backend system design**, not UI.

## Features Implemented (AA)

- Mock authentication (Buyer / Factory)
- Buyer creates compliance requests
- Factory views only its own requests

Factory fulfills request items using evidence versions

- Evidence versioning
- Full audit log for all actions
- SQLite database with transactional integrity

## Tech Stack
- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Auth: Simple mock token (JWT-like)
- ORM: Raw SQL (intentional for truth-at-source clarity)

## Roles

|Role	| Capabilities |
| ------|--------------|
|Buyer |	Create requests, view own request status|
|Factory|	Create evidence, add versions, view own requests, fulfill items|


## Security Model (Important)

- Buyers cannot create evidence or fulfill requests
- Factories cannot see or fulfill requests of other factories
- Evidence ownership is enforced in SQL
- All writes happen inside transactions
- Every action generates an audit log entry

## Database Schema

SQLite file: **compliance.db**

Key tables:

- **users**
- **factories**
- **evidence**
- **evidence_versions**
- **requests**
- **request_items**
- **audit_logs**

Schema is initialized automatically on first run.

## Requirements

- Node.js v18+
- npm or pnpm

## Run Steps

1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd buyer-factory-compliance-api
```

2️⃣ Install dependencies
``` bash
npm install
```
3️⃣ TypeScript Build
``` bash
npm run build
```
 Start the server
``` bash
npm run dev
```

On first run:

- ``compliance.db`` will be created
- Database schema will be initialized automatically

Server runs at:
``` curl
http://localhost:5550/api/v1
```

## Authentication
### Login

``POST /auth/login``

**Buyer example**
```json
{
  "userId": "U1",
  "role": "buyer"
}
```


**Factory example**
```json
{
  "userId": "FUSER1",
  "role": "factory",
  "factoryId": "F001"
}
```

**Response:**

```json
{
  "token": "mock-token"
}
```

Use token in headers:

```Cookie: token=mock-token```

### API Endpoints
### Evidence (Factory only)
**Create evidence**

``POST /evidence``
```json
{
  "name": "Fire Safety Certificate",
  "docType": "Certificate",
  "expiry": "2026-01-01",
  "notes": "Initial upload"
}
```

**Add evidence version**

```POST /evidence/:evidenceId/versions```
```json
{
  "notes": "Updated document",
  "expiry": "2027-01-01"
}
```
### Requests
**Buyer creates request**

``POST /requests`` (Buyer only)
```json
{
  "factoryId": "F001",
  "title": "Q1 Compliance Evidence",
  "items": [
    { "docType": "Test Report" },
    { "docType": "Certificate" }
  ]
}
```
**Factory views requests**

``GET /factory/requests`` (Factory only)

Returns only requests for the logged-in factory.

**Factory fulfills request item**

``POST /requests/:requestId/items/:itemId/fulfill`` (Factory only)

{
  "evidenceId": "E1",
  "versionId": "V2"
}


- Ownership is validated in SQL
- Operation is atomic
- Audit log written in same transaction

## Audit
**View audit log**

``GET /audit``

Returns all audit entries with:

- timestamp
- actorUserId
- actorRole
- action
- objectType
- objectId
- metadata (JSON)

### Audit Log Actions

- **CREATE_REQUEST**
- **CREATE_EVIDENCE**
- **ADD_VERSION**
- **FULFILL_ITEM**

Every write action **must** produce an audit record.

## Curl Examples
**Login**
```curl
curl -X POST http://localhost:5550/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{"userId":"U1","role":"buyer"}'
```
**Create request**
```curl
curl -X POST http://localhost:5550/api/v1/requests \
-H "Cookie: token=" \
-H "Content-Type: application/json" \
-d '{
  "factoryId":"F001",
  "title":"Q1 Compliance Evidence",
  "items":[{"docType":"Test Report"},{"docType":"Certificate"}]
}'
```
**Factory View Requests**
``GET /factory/requests``
```curl
curl -X GET http://localhost:5550/api/v1/factory/requests \
-H "Cookie: token="
```
**Factory fulfill item**
```curl
curl -X POST http://localhost:5550/api/v1/requests/R1/items/I1/fulfill \
-H "Cookie: token=" \
-H "Content-Type: application/json" \
-d '{"evidenceId":"E1","versionId":"V2"}'
```
### Evidence (Factory Only)
**Create Evidence**
``POST /evidence``

```curl
curl -X POST http://localhost:5550/api/v1/evidence \
-H "Cookie: token=" \
-H "Content-Type: application/json" \
-d '{
  "name": "Fire Safety Certificate",
  "docType": "Certificate",
  "expiry": "2026-01-01",
  "notes": "Initial upload"
}'
```
**Add Evidence Version**

``POST /evidence/:evidenceId/versions``
```curl
curl -X POST http://localhost:5550/evidence/E1/versions \
-H "Cookie: token=" \
-H "Content-Type: application/json" \
-d '{
  "notes": "Updated version",
  "expiry": "2027-01-01"
}'
```
### Audit
**Get All Audit Logs**

``GET /audit``
```curl
curl -X GET http://localhost:5550/audit
```
### ✅ Access Rule (Document This)
> The audit endpoint is intentionally unrestricted in this exercise because no access rules were defined in the task description. In a production system, this would typically be restricted to admin or compliance roles.

### Design Notes (Truth-at-Source)

- Ownership is verified before any update
- No trust in client-supplied IDs
- SQL constraints + transactions prevent partial state
- Audit logs are written at the moment of truth

### Status

✅ AA Task: **Complete**

### Author

**MD. WASIFUL KABIR**  
Backend-Focused Full-Stack Developer