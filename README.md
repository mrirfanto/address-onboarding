# Global Address Onboarding MVP

Frontend + backend application for country-based address onboarding with metadata-driven fields, autocomplete search, and saved-address management.

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or npm version bundled with your Node install)
- Google Cloud API key with Places API enabled (for live autocomplete/details)

## Environment Setup

1. Create backend env file:

```bash
cp backend/.env.example backend/.env
```

2. Set your Google Places key in `backend/.env`:

```bash
GOOGLE_PLACES_API_KEY=your_actual_api_key
```

The backend loads `.env` automatically at startup.

## Install Dependencies

From `submission/`:

```bash
npm install
```

## Run Locally

From `submission/`:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

Frontend `/api/*` requests are proxied to backend `http://localhost:3001`.

## Available Scripts

From `submission/`:

- `npm run dev` - run frontend and backend together
- `npm run build` - build frontend and backend
- `npm run test` - run frontend and backend tests
- `npm run lint` - run frontend and backend lint checks
- `npm run typecheck` - run frontend and backend type checks

## Quick API Smoke Checks

With backend running on port `3001`:

- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/countries`
- `GET http://localhost:3001/api/address-search?query=cupertino&countryCode=USA`
- `GET http://localhost:3001/api/address-details?placeId=<PLACE_ID>&countryCode=USA`

Notes:
- If `GOOGLE_PLACES_API_KEY` is missing or Google upstream is unavailable:
  - `/api/address-search` returns `200` with `{"suggestions":[]}`
  - `/api/address-details` returns `200` with `{"values":{}}`

## Testing and Quality Checks

From `submission/`:

```bash
npm run test
npm run typecheck
npm run lint
```

## MVP Notes

- Saved addresses are stored in-memory on backend runtime and reset when backend restarts.
- Address prefill depends on Google response completeness; users can complete missing fields manually.
