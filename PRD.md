# PRD — Global Address Onboarding System

## Document Overview

### Product Name

Global Address Onboarding System

### Author

Muhammad Irfan

### Status

Implementation Scope — MVP

### Last Updated

May 2026

---

# 1. Background

AcmeCorp is expanding its onboarding platform to support customers from multiple countries.

Address collection is currently inconsistent across regions because each country has different address structures, formatting rules, and validation requirements.

The company requires a flexible address onboarding system that:

- Improves user experience through autocomplete
- Supports country-specific address structures
- Allows manual correction/editing
- Stores normalized address data
- Scales to support additional countries in the future

This project implements a production-inspired MVP version of the system.

---

# 2. Problem Statement

Current onboarding flows assume a single address structure.

This creates several issues:

- Poor user experience for international customers
- Incorrect validation behavior
- Hardcoded frontend forms
- Difficult scaling when adding new countries
- Inconsistent backend data shape

The system needs a scalable approach where address fields and validation rules are dynamically driven by country metadata rather than hardcoded UI logic.

---

# 3. Goals

## Primary Goals

### 3.1 Dynamic Country-Based Address Forms

The system must render different address forms depending on selected country.

---

### 3.2 Metadata-Driven Architecture

Address fields and validation rules should be configurable through centralized metadata definitions.

The frontend should avoid country-specific hardcoded rendering logic.

---

### 3.3 Address Autocomplete Support

Users should be able to quickly populate address information through autocomplete suggestions.

---

### 3.4 Manual Address Editing

Users must be able to manually review and edit address fields after autocomplete selection.

---

### 3.5 Persist Address Data

Captured addresses should be saved through backend APIs and retrievable for demonstration purposes.

---

# 4. Non-Goals

The following are intentionally excluded from MVP scope:

- Authentication / authorization
- Full production-grade international address normalization
- Full Google Places parsing coverage
- Multi-language localization
- Advanced accessibility compliance
- Production deployment infrastructure
- Comprehensive automated testing suite

---

# 5. User Experience Requirements

## 5.1 Country Selection

User can select a supported country before entering address information.

Changing country should:

- Reset incompatible form values
- Update visible fields
- Update validation behavior

Supported countries:

- United States (USA)
- Australia (AUS)
- Indonesia (IDN)

---

## 5.2 Address Autocomplete

User can search address using a dedicated `Search Address` input.

Requirements:

- Suggestions appear while typing
- Selecting a suggestion prefills address fields
- Search is filtered by currently selected country
- Dynamic fields stay disabled until user clicks `Manual Edit`
- User can continue editing manually afterward
- User can submit after selecting a valid suggestion without clicking `Manual Edit`

Implementation Notes:

- MVP implementation uses Google Places through backend proxy endpoints.
- Place ID is captured when suggestion is selected and may be stored with saved address.
- Some Google results can miss components (for example `postalCode`); users can complete required fields manually.

---

## 5.3 Manual Edit Mode

Users can switch into manual editing mode using a visible `Manual Edit` button near the autocomplete area.

Requirements:

- Dynamic form fields are disabled by default
- Clicking `Manual Edit` enables all dynamic fields for editing
- Dynamically render fields based on selected country
- Keep prefilled values so users can adjust them
- Support both required and optional fields

---

# 6. Country Address Requirements

## 6.1 United States (USA)

| Field          | Type     | Required       |
| -------------- | -------- | -------------- |
| Address Line 1 | Text     | Yes            |
| Address Line 2 | Text     | No             |
| City           | Text     | Yes            |
| State          | Dropdown | Yes            |
| ZIP Code       | Text     | Yes (5 digits) |

---

## 6.2 Australia (AUS)

| Field          | Type     | Required       |
| -------------- | -------- | -------------- |
| Address Line 1 | Text     | Yes            |
| Address Line 2 | Text     | No             |
| Suburb         | Text     | Yes            |
| State          | Dropdown | Yes            |
| Postcode       | Text     | Yes (4 digits) |

---

## 6.3 Indonesia (IDN)

| Field                | Type     | Required       |
| -------------------- | -------- | -------------- |
| Province             | Dropdown | Yes            |
| City / Regency       | Text     | Yes            |
| District / Kecamatan | Text     | Yes            |
| Village / Kelurahan  | Text     | No             |
| Postal Code          | Text     | Yes (5 digits) |
| Street Address       | Text     | Yes            |

---

# 7. Functional Requirements

## 7.1 Dynamic Form Rendering

Frontend forms must be generated dynamically from metadata configuration.

The implementation should avoid approaches such as:

```tsx
if (country === "USA") {
  ...
}
```

Preferred architecture:

```tsx
fields.map((field) => ...)
```

Benefits:

- Easier maintenance
- Better scalability
- Reduced duplication
- Simpler future country expansion

---

## 7.2 Validation

Validation rules should be configurable per country.

Required validation behaviors:

- Required fields
- Postal code length validation
- Dropdown selection validation

Preferred implementation:

- React Hook Form
- Zod schema generation from metadata

---

## 7.3 Save Address

Users can save completed addresses.

Requirements:

- Submit address payload to backend API
- Display success/error feedback
- Persist data locally for MVP usage
- Success feedback auto-dismisses after a short delay; error feedback remains until user action

---

## 7.4 Retrieve Saved Addresses

Users can view previously saved addresses.

Requirements:

- Fetch saved addresses from backend API
- Display in readable list or table format

---

## 7.5 Delete Saved Addresses (MVP Extension)

Users can delete previously saved addresses.

Requirements:

- Delete individual address entries from the saved list
- Keep deletion simple and immediate (no confirmation modal)
- Reflect deletion immediately in saved addresses list

---

# 8. Backend Requirements

## 8.1 API Endpoints

### GET /api/countries

Returns supported countries.

---

### GET /api/metadata/:countryCode

Returns country-specific field metadata.

Purpose:

- Support metadata-driven frontend rendering
- Enable future server-driven form systems

---

### POST /api/addresses

Stores address submission.

---

### GET /api/addresses

Returns saved addresses.

---

### DELETE /api/addresses/:id

Deletes a saved address by id.

---

# 9. Data Model

## Address Entity

```txt
Address
---------
id
countryCode
line1
line2
city
state
province
district
village
postalCode
createdAt
```

Implementation may use:

- SQLite
- In-memory storage
- Lightweight persistence layer

---

# 10. Frontend Architecture

## Preferred Stack

| Area            | Technology         |
| --------------- | ------------------ |
| Frontend        | React + TypeScript |
| Build Tool      | Vite               |
| Styling         | Mantine Theme + component styles |
| UI Components   | Mantine UI (React components + theming system) |
| Form Management | React Hook Form    |
| Validation      | Zod                |
| API Layer       | Native Fetch (via RTK Query) |
| Backend         | Express            |
| Database        | SQLite / In-memory |

---

# 11. Technical Design Decisions

## 11.1 Metadata-Driven Form System

Country configurations should act as the source of truth for:

- Field rendering
- Validation rules
- Labels
- Required status
- Input types

This allows frontend behavior to remain generic and scalable.

---

## 11.2 Shared Dynamic Renderer

A shared form renderer component should generate fields dynamically.

Benefits:

- Lower maintenance cost
- Reduced branching logic
- Better extensibility

---

## 11.3 Backend Metadata Endpoint

The backend exposes metadata endpoints even though frontend configs may already exist locally.

Reasoning:

- Demonstrates scalable API-first thinking
- Enables future server-driven forms
- Reduces frontend/backend coupling in larger systems

---

## 11.4 Frontend Maintainability Decisions

To keep implementation readable and maintainable, the frontend uses:

- Single feature module for this MVP domain: `address-onboarding`
- Page + section-component composition (clear UI boundaries)
- Focused hooks by concern (country/metadata, search, form)
- Shared primitives under `shared` when reused
- Scoped import aliases (`@app`, `@features`, `@shared`) to avoid deep relative paths

These decisions are implementation-structure improvements only and do not change product behavior.

---

# 12. UI Requirements

## Layout

The page should contain:

1. Country select
2. `Search Address` input
3. Manual edit toggle/button
4. Dynamic address form
5. Save button
6. Saved addresses section

---

## Design Principles

- Clean and readable UI
- Responsive layout
- Minimal cognitive load
- Clear validation feedback

This project prioritizes clarity and maintainability over visual complexity.
Use `Mantine UI` components as the default UI foundation, customized via Mantine theme tokens and component styles where needed.

---
