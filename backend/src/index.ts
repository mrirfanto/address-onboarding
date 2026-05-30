import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { CountryCode, CountryMetadata } from './types/domain.js';

type ApiErrorResponse = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

type CountryOption = {
  code: CountryCode;
  name: string;
};

export const countries: CountryOption[] = [
  { code: 'USA', name: 'United States' },
  { code: 'AUS', name: 'Australia' },
  { code: 'IDN', name: 'Indonesia' },
];

export const metadataByCountry: Record<CountryCode, CountryMetadata> = {
  USA: {
    countryCode: 'USA',
    fields: [
      {
        key: 'line1',
        title: 'Address Line 1',
        description: 'Street and house/building number',
        type: 'text',
        required: true,
        order: 1,
        prefix: null,
        suffix: null,
      },
      {
        key: 'line2',
        title: 'Address Line 2',
        description: 'Apartment, suite, unit, building, floor',
        type: 'text',
        required: false,
        order: 2,
        prefix: null,
        suffix: null,
      },
      {
        key: 'city',
        title: 'City',
        description: 'City or locality',
        type: 'text',
        required: true,
        order: 3,
        prefix: null,
        suffix: null,
      },
      {
        key: 'state',
        title: 'State',
        description: 'State or territory',
        type: 'select',
        required: true,
        order: 4,
        prefix: null,
        suffix: null,
        options: [
          { label: 'California', value: 'CA' },
          { label: 'New York', value: 'NY' },
        ],
      },
      {
        key: 'postalCode',
        title: 'ZIP Code',
        description: '5-digit postal code',
        type: 'text',
        required: true,
        order: 5,
        prefix: null,
        suffix: null,
        rules: {
          length: 5,
        },
      },
    ],
  },
  AUS: {
    countryCode: 'AUS',
    fields: [
      {
        key: 'line1',
        title: 'Address Line 1',
        description: 'Street and house/building number',
        type: 'text',
        required: true,
        order: 1,
        prefix: null,
        suffix: null,
      },
      {
        key: 'line2',
        title: 'Address Line 2',
        description: 'Apartment, suite, unit, building, floor',
        type: 'text',
        required: false,
        order: 2,
        prefix: null,
        suffix: null,
      },
      {
        key: 'suburb',
        title: 'Suburb',
        description: 'Suburb or locality',
        type: 'text',
        required: true,
        order: 3,
        prefix: null,
        suffix: null,
      },
      {
        key: 'state',
        title: 'State',
        description: 'State or territory',
        type: 'select',
        required: true,
        order: 4,
        prefix: null,
        suffix: null,
        options: [
          { label: 'New South Wales', value: 'NSW' },
          { label: 'Victoria', value: 'VIC' },
          { label: 'Queensland', value: 'QLD' },
        ],
      },
      {
        key: 'postcode',
        title: 'Postcode',
        description: '4-digit postal code',
        type: 'text',
        required: true,
        order: 5,
        prefix: null,
        suffix: null,
        rules: {
          length: 4,
        },
      },
    ],
  },
  IDN: {
    countryCode: 'IDN',
    fields: [
      {
        key: 'province',
        title: 'Province',
        description: 'Province',
        type: 'select',
        required: true,
        order: 1,
        prefix: null,
        suffix: null,
        options: [
          { label: 'DKI Jakarta', value: 'DKI Jakarta' },
          { label: 'Jawa Barat', value: 'Jawa Barat' },
        ],
      },
      {
        key: 'city',
        title: 'City / Regency',
        description: 'City or regency',
        type: 'text',
        required: true,
        order: 2,
        prefix: null,
        suffix: null,
      },
      {
        key: 'district',
        title: 'District / Kecamatan',
        description: 'District or kecamatan',
        type: 'text',
        required: true,
        order: 3,
        prefix: null,
        suffix: null,
      },
      {
        key: 'village',
        title: 'Village / Kelurahan',
        description: 'Village or kelurahan',
        type: 'text',
        required: false,
        order: 4,
        prefix: null,
        suffix: null,
      },
      {
        key: 'postalCode',
        title: 'Postal Code',
        description: '5-digit postal code',
        type: 'text',
        required: true,
        order: 5,
        prefix: null,
        suffix: null,
        rules: {
          length: 5,
        },
      },
      {
        key: 'streetAddress',
        title: 'Street Address',
        description: 'Street address',
        type: 'text',
        required: true,
        order: 6,
        prefix: null,
        suffix: null,
      },
    ],
  },
};

export function createApp() {
  const app = express();
  const api = express.Router();

  app.use(cors());
  app.use(express.json());

  api.get('/health', healthHandler);
  api.get('/countries', countriesHandler);
  api.get('/metadata/:countryCode', metadataHandler);

  api.get('/__error', errorRouteHandler);

  api.use(notFoundHandler);

  app.use('/api', api);

  app.use(errorHandler);

  return app;
}

export function healthHandler(_req: Request, res: Response) {
  res.status(200).json({ status: 'ok' });
}

export function countriesHandler(_req: Request, res: Response) {
  res.status(200).json(countries);
}

export function metadataHandler(req: Request, res: Response) {
  const countryCodeParam = req.params.countryCode;
  const countryCode = Array.isArray(countryCodeParam) ? countryCodeParam[0] : countryCodeParam;

  if (!countryCode || !isCountryCode(countryCode)) {
    const payload: ApiErrorResponse = {
      code: 'NOT_FOUND',
      message: 'Route not found',
    };
    res.status(404).json(payload);
    return;
  }

  res.status(200).json(metadataByCountry[countryCode]);
}

export function errorRouteHandler() {
  throw new Error('forced test error');
}

function isCountryCode(value: string): value is CountryCode {
  return value === 'USA' || value === 'AUS' || value === 'IDN';
}

export function notFoundHandler(_req: Request, res: Response) {
  const payload: ApiErrorResponse = {
    code: 'NOT_FOUND',
    message: 'Route not found',
  };

  res.status(404).json(payload);
}

export function errorHandler(_err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const payload: ApiErrorResponse = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };

  res.status(500).json(payload);
}

export const app = createApp();

const port = 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}
