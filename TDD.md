# TDD — Global Address Onboarding System (MVP)

## 1) Scope

This TDD is an implementation guide for MVP development, covering:

- Frontend implementation details
- Backend interaction contracts
- End-to-end behavior for dynamic country-based address onboarding

Out of scope: future enhancements beyond current PRD MVP.

---

## 2) Tech Stack

### Frontend

- React + TypeScript + Vite
- Mantine UI (component layer with built-in theming and accessibility)
- React Hook Form
- Zod
- Redux Toolkit + RTK Query (server state)
- Inline submit feedback message (success/error)

### Backend (selected for MVP)

- Runtime: Node.js
- Framework: Express
- Language: TypeScript
- Validation: Zod
- Storage: In-memory (MVP), structured to allow easy SQLite swap later
- API style: REST + JSON
- Responsibility:
  - Serve countries + metadata endpoints
  - Persist and return submitted addresses
  - Delete saved addresses by id
  - Provide normalized display string per saved address

---

## 3) MVP Functional Design

Single-page flow:

1. Load countries
2. User selects country
3. User types in `Search Address` input (Google suggestions via backend proxy, country-filtered)
4. User selects suggestion (prefill) or clicks `Manual Edit` button
5. Load metadata for selected country
6. Render dynamic form from metadata (disabled by default)
7. User clicks `Manual Edit` to enable field editing
8. User can continue manual input/edit
9. Validate on blur; block submission on errors
10. Save address
11. Show saved addresses as simple normalized rows

Country switch behavior:

- Hard reset all form values immediately
- No confirmation modal

---

## 4) API Contracts (Frontend Expectations)

## `GET /api/countries`

```json
[
  { "code": "USA", "name": "United States" },
  { "code": "AUS", "name": "Australia" },
  { "code": "IDN", "name": "Indonesia" }
]
```

## `GET /api/metadata/:countryCode`

```json
{
  "countryCode": "USA",
  "fields": [
    {
      "key": "line1",
      "title": "Address Line 1",
      "description": "Street and house/building number",
      "type": "text",
      "required": true,
      "order": 1,
      "prefix": null,
      "suffix": null
    },
    {
      "key": "state",
      "title": "State",
      "description": "State or territory",
      "type": "select",
      "required": true,
      "order": 4,
      "prefix": null,
      "suffix": null,
      "options": [
        { "label": "California", "value": "CA" },
        { "label": "New York", "value": "NY" }
      ]
    },
    {
      "key": "postalCode",
      "title": "ZIP Code",
      "description": "5-digit postal code",
      "type": "text",
      "required": true,
      "order": 5,
      "prefix": null,
      "suffix": null,
      "rules": { "length": 5 }
    }
  ]
}
```

Notes:

- Allowed field types for MVP: `text`, `select`
- Field order is fully driven by `order`
- Country selection is the top-level conditional driver
- Country-specific alignment with PRD:
  - `IDN.province` uses `select` with options
  - `IDN.village` is optional
- Suggested baseline field schema:
  - `key` (string, required)
  - `title` (string, required)
  - `description` (string | null)
  - `type` (`text` | `select`, required)
  - `required` (boolean, required)
  - `order` (number, required)
  - `prefix` (string | null)
  - `suffix` (string | null)
  - `rules` (object, optional; e.g. `length`, `pattern`, `minLength`, `maxLength`)
  - `options` (required for `select`, omitted for `text`)

## `POST /api/addresses`

Request:

```json
{
  "countryCode": "USA",
  "placeId": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
  "values": {
    "line1": "123 Main St",
    "line2": "",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105"
  }
}
```

Response:

```json
{
  "id": "addr_123",
  "countryCode": "USA",
  "placeId": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
  "values": {
    "line1": "123 Main St",
    "line2": "",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94105"
  },
  "display": "123 Main St, San Francisco, CA 94105, United States",
  "createdAt": "2026-05-29T10:00:00.000Z"
}
```

## `GET /api/address-search`

```json
{
  "suggestions": [
    {
      "placeId": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
      "label": "1600 Amphitheatre Pkwy, Mountain View, CA, USA"
    }
  ]
}
```

## `GET /api/address-details`

```json
{
  "values": {
    "line1": "1600 Amphitheatre Pkwy",
    "line2": "",
    "city": "Mountain View",
    "state": "CA",
    "postalCode": "94043"
  }
}
```

## `GET /api/addresses`

```json
[
  {
    "id": "addr_123",
    "countryCode": "USA",
    "placeId": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA",
    "values": {
      "line1": "123 Main St",
      "line2": "",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105"
    },
    "display": "123 Main St, San Francisco, CA 94105, United States",
    "createdAt": "2026-05-29T10:00:00.000Z"
  }
]
```

## `DELETE /api/addresses/:id`

Success response:

- Status `204 No Content`

Not found response:

```json
{
  "error": {
    "code": "ADDRESS_NOT_FOUND",
    "message": "Address 'addr_999' was not found"
  }
}
```

---

## 5) Frontend Architecture

Feature-based folder structure:

```txt
src/
  app/
    store.ts
    providers.tsx
    App.tsx
  shared/
    api/
      addressApi.ts
    components/
      TopHeader.tsx
  features/
    address-onboarding/
      page/
        AddressOnboardingPage.tsx
      components/
        AddressEntrySection.tsx
        AddressDetailsSection.tsx
        SavedAddressesSection.tsx
      hooks/
        useAddressOnboardingPage.ts
        useCountryMetadata.ts
        useAddressSearch.ts
        useAddressForm.ts
      lib/
        buildFieldSchema.ts
      types.ts
```

Naming conventions:

- Components: `PascalCase.tsx`
- Hooks/utilities: `camelCase.ts`
- Types/interfaces: `*.types.ts`
- RTK Query APIs: `*.api.ts`

Import conventions:

- Use scoped path aliases for cross-folder imports:
  - `@app/*`
  - `@features/*`
  - `@shared/*`
- Keep short relative imports only for same-folder local modules.

---

## 6) State & Data Flow

### Server state (RTK Query)

- Countries list
- Country metadata
- Saved addresses list
- Save address mutation
- Delete address mutation

### Client/UI state

- `useCountryMetadata`:
  - selected country
  - country list state
  - metadata state + sorted fields
- `useAddressSearch`:
  - search input
  - focus/blur/dropdown visibility
  - suggestion hover/active state
- `useAddressForm`:
  - RHF + generated Zod schema
  - manual edit mode
  - submit state + auto-dismiss success message
- `SavedAddressesSection` (component-colocated):
  - saved addresses query
  - delete mutation + row-level loading state
- `useAddressOnboardingPage`:
  - composes hook interactions for the page.

Form state remains managed by React Hook Form.

---

## 7) Dynamic Form + Validation Strategy

1. Fetch metadata after country selection.
2. Build Zod schema once per country change.
3. Initialize/reset form from metadata keys.
4. Render fields from sorted metadata (`order`).
5. Validate on blur via RHF resolver.
6. Block submit if any errors exist.

MVP validation rules:

- Required fields
- Postal code fixed length (per metadata rule)
- Basic common address text rules (trim, non-empty for required)

No over-engineered validation in MVP.

---

## 8) Autocomplete Strategy (MVP)

- Use backend proxy endpoints for Google Places search and details.
- UI includes a dedicated `Search Address` input.
- Autocomplete is filtered by selected country.
- On selection, fetch address details by `placeId` and map known values into matching form fields.
- Unknown fields remain unchanged.
- Dynamic fields remain disabled until manual mode is enabled.
- User can click `Manual Edit` button to enable/focus manual editing mode.
- User can continue manual edits after autofill.
- Save payload includes optional `placeId` when a suggestion is selected.
- Missing Google components are allowed and can be completed manually before submit.

---

## 9) UI/UX Behaviors

- Use `Mantine UI` as the default component foundation, styled via Mantine theme and component overrides
- Address section includes:
  - `Search Address` input
  - visible `Manual Edit` button
  - dynamic country-based fields (disabled until manual edit is enabled)
- Loading states use skeletons
- Errors:
  - Inline field errors
  - Global error banner for API-level failures
  - Inline submit message for success/failure
- Success submit message auto-dismisses after 2 seconds; error message remains visible
- Saved addresses shown as simple normalized text rows

---

## 10) Testing Strategy (Minimal but Required)

Tools: Vitest + React Testing Library

Mandatory positive-path tests before merge:

1. Country selection loads metadata and renders correct fields.
2. Autocomplete selection prefills mapped fields.
3. Manual edits after prefill are preserved.
4. Valid form submits successfully and calls save API.
5. Saved addresses list renders returned normalized rows.

Basic validation behavior should be covered at least for required and postal length rules.

---

## 11) Delivery Plan (Ticket Breakdown)

1. Project setup and app scaffolding
   - Mantine theme, store, RTK Query base API, shared types
2. Countries + metadata integration
   - APIs, selectors, country picker, metadata fetch lifecycle
3. Dynamic form renderer
   - Metadata-to-field UI + schema generation + blur validation
4. Autocomplete (Google via backend proxy)
   - Suggestion UI, backend search/details integration, mapping to fields
5. Save + list addresses
   - Submit flow, API mutation, normalized row rendering
6. Loading/error states polish
   - Skeletons, inline errors, global error banner
7. Tests (minimal core flows)
   - Positive journey tests + validation basics

---

## 12) Assumptions

- Backend endpoints exist per PRD and return agreed JSON structures.
- Metadata is backend-driven only (no local fallback).
- Browser target is latest Chrome.
- Single-page flow is sufficient for MVP.
- Backend loads `GOOGLE_PLACES_API_KEY` from `backend/.env`.
