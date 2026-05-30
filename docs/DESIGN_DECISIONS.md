# Design Decisions and Trade-offs (MVP)

## Purpose

This document briefly explains the key implementation decisions and trade-offs made for the Global Address Onboarding MVP.

## Key Design Decisions

1. Metadata-driven dynamic form rendering
   - Country-specific fields and validation are driven by backend metadata, not hardcoded frontend layouts.
   - This improves scalability: adding a new country mostly requires metadata changes, with minimal frontend rendering changes.

2. Backend proxy for Google Places
   - Autocomplete and place details are resolved through backend endpoints so the frontend does not call Google APIs directly.

3. Separate type ownership (frontend vs backend)
   - Frontend and backend each maintain their own API/UI/domain types to keep module boundaries clear.

4. In-memory address persistence for MVP
   - Saved addresses are stored in server memory to keep implementation simple and fast for the timeboxed scope.

5. Manual edit after autocomplete prefill
   - Users can select a suggestion for speed, then explicitly enable manual editing to adjust missing or inaccurate fields.

6. Feature-based frontend structure
   - Address onboarding code is grouped by feature and split into focused page/components/hooks for readability and maintainability.

7. Debounced search input
   - Address search uses debounce to reduce unnecessary API calls while preserving responsive typing behavior.

## Trade-offs

1. Flexibility vs metadata complexity
   - Metadata-driven rendering scales better across countries, but requires careful schema and mapping discipline.

2. Security/control vs backend integration overhead
   - Proxying Google through backend improves control over API key usage and response mapping, but adds server-side logic to maintain.

3. Clear boundaries vs duplicated type definitions
   - Separate type ownership avoids cross-layer coupling, but can introduce duplication if contracts evolve.

4. Delivery speed vs persistence durability
   - In-memory storage is fast to implement and easy to reason about, but data resets on backend restart.

5. User control vs extra interaction
   - Requiring manual-enable edit mode reduces accidental edits but adds one explicit step for users.

## Why This Fits the MVP

These decisions prioritize correctness of core flow, implementation clarity, and predictable behavior within a strict timebox.  
The trade-offs are intentional to keep the codebase easy to review, explain, and extend in follow-up iterations.
