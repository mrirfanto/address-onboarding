# Implementation Plan — Global Address Onboarding System (MVP)

## 1) Objective

Deliver the MVP defined in `PRD.md`, implemented according to `TDD.md`, using `API_CONTRACT.md` as the source of truth for backend/frontend integration.

---

## Progress Snapshot

- Status: In progress
- Completed:
  - EPIC A / A1 Repository setup and standards
  - EPIC A / A2a Backend domain and API types
  - EPIC A / A2b Frontend API and UI types
  - EPIC B / B1 Express server bootstrap
  - EPIC B / B2 Countries endpoint
  - EPIC B / B3 Metadata endpoint
  - EPIC B / B4 Address create endpoint
  - EPIC B / B5 Address list endpoint
  - EPIC B / B6 Address delete endpoint
  - EPIC C / C1 Frontend app scaffold
  - EPIC C / C2 RTK Query API slices
  - EPIC C / C3 Country select + metadata loading flow
  - EPIC D / D1 Metadata-to-field renderer
- Notes:
  - Frontend and backend type definitions are intentionally separated (no shared type package).
  - Baseline validation passes: `lint`, `typecheck`, `test`.
  - Backend now has `/api` base routing, health endpoint, and consistent JSON 404/500 error handling.
  - Backend countries endpoint now returns contract-aligned options (`USA`, `AUS`, `IDN`) with stable ordering.
  - Backend metadata endpoint now returns country-specific field definitions for `USA`, `AUS`, and `IDN` with IDN semantics enforced.
  - Backend address create endpoint now validates by country metadata, generates normalized `display`, and persists addresses in-memory.
  - Backend address list endpoint now returns all saved addresses from in-memory store with stable insertion order.
  - Backend delete endpoint now supports immediate deletion by id with `204` on success and structured `404` on not found.
  - Frontend scaffold now includes Mantine + Redux provider wiring, RTK Query base API setup, and minimal onboarding shell sections.
  - Frontend API layer now includes typed RTK Query endpoints for countries, metadata, create/list addresses, and delete address.
  - Frontend now includes country selection and metadata loading flow with country-switch reset behavior and metadata preview.
  - Frontend dev server proxy now forwards `/api` requests to backend port `3001` for local integration.
  - Frontend now renders dynamic metadata-driven address fields (`text` and `select`) in stable order with disabled-by-default state.
- Next:
  - Start EPIC D / D2 Schema generation and RHF integration.

---

## 2) Delivery Sequence

1. Project setup and baseline standards
2. Backend API implementation (Express)
3. Frontend app scaffolding + RTK Query integration
4. Metadata-driven dynamic form implementation
5. Autocomplete (Google via backend proxy)
6. Save + retrieve addresses flow
7. UX polish (skeletons, inline errors, banner, submit feedback)
8. Minimal core tests
9. Final integration verification

---

## 3) Work Breakdown (Ticket-Ready)

## EPIC A — Foundation

### A1. Repository setup and standards

- Scope:
  - Configure lint/format/typecheck scripts.
  - Confirm TypeScript strict mode.
  - Define shared conventions from TDD.
- Depends on: none
- Acceptance criteria:
  - `lint`, `typecheck`, and test commands run successfully.
  - Folder structure follows feature-based pattern.

### A2a. Backend domain and API types

- Scope:
  - Add backend-owned types for country, metadata field, address payloads, and API errors.
  - Keep backend types internal to backend codebase.
- Depends on: A1
- Acceptance criteria:
  - Backend types cover all backend request/response payloads in `API_CONTRACT.md`.
  - No `any` used in backend API boundary types.

### A2b. Frontend API and UI types

- Scope:
  - Add frontend-owned types for country options, metadata fields, form values, saved address rows, and API error display state.
  - Keep frontend types internal to frontend codebase.
- Depends on: A1
- Acceptance criteria:
  - Frontend types cover all frontend API hooks and form/state models from `TDD.md`.
  - No `any` used in frontend API/UI boundary types.

---

## EPIC B — Backend (Express + TypeScript)

### B1. Express server bootstrap

- Scope:
  - Initialize Express app with JSON middleware and base `/api` routing.
  - Add standard error handler.
- Depends on: A1
- Acceptance criteria:
  - Server starts and responds on health/basic endpoint.
  - Consistent JSON error shape is returned.

### B2. Countries endpoint

- Scope:
  - Implement `GET /api/countries`.
- Depends on: B1
- Acceptance criteria:
  - Returns `USA`, `AUS`, `IDN` in contract format.

### B3. Metadata endpoint

- Scope:
  - Implement `GET /api/metadata/:countryCode`.
  - Support `text` and `select` fields only.
  - Enforce PRD-specific IDN field semantics (`province` as `select`, `village` as optional).
  - Return 404 for unsupported country codes.
- Depends on: B1, A2a
- Acceptance criteria:
  - Response shape matches contract (including `title`, `description`, `prefix`, `suffix`, `rules`, `options`).
  - Field order values are stable and usable by frontend.

### B4. Address create endpoint

- Scope:
  - Implement `POST /api/addresses`.
  - Validate request against selected country metadata using Zod.
  - Generate normalized `display` string.
  - Persist in in-memory store.
- Depends on: B3, A2a
- Acceptance criteria:
  - Valid payload returns `201` with stored object.
  - Invalid payload returns `400` with `VALIDATION_ERROR` and `details`.

### B5. Address list endpoint

- Scope:
  - Implement `GET /api/addresses`.
- Depends on: B4
- Acceptance criteria:
  - Returns all saved addresses with normalized `display` and timestamps.

### B6. Address delete endpoint (MVP extension)

- Scope:
  - Implement `DELETE /api/addresses/:id`.
- Depends on: B5
- Acceptance criteria:
  - Existing address id returns `204`.
  - Unknown address id returns `404` with structured error payload.

---

## EPIC C — Frontend Core

### C1. Frontend app scaffold

- Scope:
  - Setup Mantine UI, Redux store, RTK Query base API.
  - Setup single-page app shell.
- Depends on: A1
- Acceptance criteria:
  - App compiles and renders with provider wiring complete.
  - `Mantine UI` base components are available for form, card, and feedback surfaces.

### C2. RTK Query API slices

- Scope:
  - Add endpoints for countries, metadata, create address, list addresses, and delete address.
  - Use native `fetchBaseQuery`.
- Depends on: C1, A2b
- Acceptance criteria:
  - All hooks are typed and aligned with contract.

### C3. Country select + metadata loading flow

- Scope:
  - Build country select control.
  - On country change: reset form state and request metadata.
- Depends on: C2
- Acceptance criteria:
  - Country switch clears form and loads relevant fields.

---

## EPIC D — Dynamic Form + Validation

### D1. Metadata-to-field renderer

- Scope:
  - Render fields dynamically from metadata sorted by `order`.
  - Support `text` and `select`.
  - Keep dynamic fields disabled by default.
- Depends on: C3
- Acceptance criteria:
  - No country-specific hardcoded field rendering logic.
  - Required indicators and descriptions shown correctly.

### D2. Schema generation and RHF integration

- Scope:
  - Generate Zod schema once per country change.
  - Wire RHF with blur-mode validation.
- Depends on: D1
- Acceptance criteria:
  - Required and postal rules are enforced.
  - Submit is blocked while validation errors exist.

---

## EPIC E — Autocomplete (Google via Backend Proxy)

### E1. Search endpoint integration + filtering

- Scope:
  - Integrate autocomplete against backend `/api/address-search`.
  - Build dedicated `Search Address` input UI.
  - Filter suggestions by selected country.
- Depends on: C3
- Acceptance criteria:
  - Suggestions shown only for active country.
  - `Search Address` input drives suggestion query state.

### E2. Prefill mapping

- Scope:
  - Fetch details from backend `/api/address-details` using selected `placeId`.
  - Map returned values to matching metadata keys.
  - Add visible `Manual Edit` button to enable manual field editing.
  - Leave unknown fields unchanged.
- Depends on: E1, D1
- Acceptance criteria:
  - Known fields are prefilled correctly.
  - User can continue editing manually.
  - Fields are disabled before manual mode.
  - Manual Edit button is available and enables editing.

---

## EPIC F — Save & Display

### F1. Submit flow + notifications

- Scope:
  - Submit form to create endpoint.
  - Show inline success/failure submit feedback.
  - Auto-dismiss success message after a short delay.
  - Surface API failures in global error banner.
- Depends on: D2, C2
- Acceptance criteria:
  - Successful submit shows feedback and clears/keeps state per decided UX.
  - Failed submit shows actionable errors.

### F2. Saved addresses list

- Scope:
  - Fetch and render simple normalized rows from `GET /api/addresses`.
  - Support immediate delete action per saved address row.
- Depends on: C2, F1
- Acceptance criteria:
  - List shows backend-provided `display` values.
  - Delete action removes row after successful mutation.
  - Loading uses skeletons.

---

## EPIC G — Testing & Verification

### G1. Backend minimal tests

- Scope:
  - Test positive flows for countries, metadata, create address, list addresses.
- Depends on: B5
- Acceptance criteria:
  - Core endpoint happy paths pass.

### G2. Frontend minimal tests

- Scope:
  - Test mandatory positive journey flows from TDD:
    - country selection + metadata render
    - autocomplete prefill
    - manual edit after prefill
    - valid submit flow
    - saved rows rendering
- Depends on: F2
- Acceptance criteria:
  - Tests pass with Vitest + RTL.

### G3. End-to-end manual verification

- Scope:
  - Run app and backend together.
  - Validate UX states: skeletons, inline errors, banner, submit feedback.
- Depends on: G1, G2
- Acceptance criteria:
  - No blockers across full happy-path journey.

---

## 4) Dependency Map (High-Level)

- Foundation (A) -> Backend (B) + Frontend Core (C)
- C -> Dynamic Form (D) + Autocomplete (E)
- D + C -> Save & Display (F)
- B + F -> Testing (G)

---

## 5) Definition of Done (MVP)

MVP is done when:

- All API endpoints are implemented per documented contracts.
- Dynamic form and validation are metadata-driven.
- Country switching resets form state correctly.
- Autocomplete is integrated via backend Google proxy and country-filtered.
- `Search Address` input and Manual Edit button are implemented.
- Dynamic form fields are disabled by default and editable only after Manual Edit.
- Save and retrieve flows work end-to-end.
- Minimal required tests pass.
- Lint and typecheck pass.

---

## 6) Suggested Execution Rhythm

1. Build backend contracts first (`B1`-`B5`).
2. Wire frontend API + country/metadata flow (`C1`-`C3`).
3. Implement dynamic form and validation (`D1`-`D2`).
4. Add autocomplete, then submit/list (`E1`-`F2`).
5. Finish tests and verification (`G1`-`G3`).

---

## 7) MVP Scope Decisions and Constraints

- Include `DELETE /api/addresses/:id` and a row-level delete action in the saved addresses list.
- Allow duplicate address insertion in MVP (no uniqueness constraint required).
- Use inline submit feedback where success auto-dismisses after ~2 seconds and error remains visible.
- Keep top-fold layout behavior simple and predictable:
  - sticky top header
  - full-width divider
  - search-anchored suggestion dropdown
- Keep frontend structure feature-based for readability and maintainability:
  - single `address-onboarding` feature module
  - page-level composition with focused section components
  - hooks split by concern where needed
  - saved-address query/delete logic colocated with saved-address UI
- Use frontend path aliases for import clarity: `@app`, `@features`, `@shared`.
- Implement autocomplete through backend Google proxy endpoints:
  - `GET /api/address-search` returns suggestions (`placeId`, `label`)
  - `GET /api/address-details` returns mapped address values for prefill
  - country restrictions map as `USA -> us`, `AUS -> au`, `IDN -> id`
- Include optional `placeId` in create/list address contract when available from selected suggestion.
- Load `GOOGLE_PLACES_API_KEY` from `backend/.env` via backend dotenv initialization.
