import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import type { AddressRecord, CountryCode, CountryMetadata, MetadataField } from './types/domain.js';

type ApiErrorResponse = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

type CountryOption = {
  code: CountryCode;
  name: string;
};

type AddressCreatePayload = {
  countryCode: CountryCode;
  placeId?: string;
  values: Record<string, string>;
};

export const countries: CountryOption[] = [
  { code: 'USA', name: 'United States' },
  { code: 'AUS', name: 'Australia' },
  { code: 'IDN', name: 'Indonesia' },
];
export const savedAddresses: AddressRecord[] = [];
let addressSequence = 1;

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
  api.get('/addresses', listAddressesHandler);
  api.post('/addresses', createAddressHandler);
  api.delete('/addresses/:id', deleteAddressHandler);

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

export function createAddressHandler(req: Request, res: Response) {
  const validation = validateCreateAddressPayload(req.body);
  if (!validation.ok) {
    const payload: ApiErrorResponse = {
      code: 'VALIDATION_ERROR',
      message: 'Address payload is invalid',
      details: validation.details,
    };
    res.status(400).json(payload);
    return;
  }

  const data = validation.data;
  const countryName = countries.find((country) => country.code === data.countryCode)?.name ?? data.countryCode;
  const display = buildDisplay(data.countryCode, data.values, countryName);

  const row: AddressRecord = {
    id: `addr_${addressSequence}`,
    countryCode: data.countryCode,
    values: data.values,
    display,
    createdAt: new Date().toISOString(),
    ...(data.placeId ? { placeId: data.placeId } : {}),
  };

  addressSequence += 1;
  savedAddresses.push(row);

  res.status(201).json(row);
}

export function listAddressesHandler(_req: Request, res: Response) {
  res.status(200).json(savedAddresses);
}

export function deleteAddressHandler(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id) {
    res.status(404).json({
      code: 'ADDRESS_NOT_FOUND',
      message: "Address '' was not found",
    });
    return;
  }

  const index = savedAddresses.findIndex((row) => row.id === id);
  if (index < 0) {
    res.status(404).json({
      code: 'ADDRESS_NOT_FOUND',
      message: `Address '${id}' was not found`,
    });
    return;
  }

  savedAddresses.splice(index, 1);
  res.status(204).send();
}

export function errorRouteHandler() {
  throw new Error('forced test error');
}

function isCountryCode(value: string): value is CountryCode {
  return value === 'USA' || value === 'AUS' || value === 'IDN';
}

function validateCreateAddressPayload(payload: unknown):
  | { ok: true; data: AddressCreatePayload }
  | { ok: false; details: Array<{ field: string; message: string }> } {
  const parsed = z
    .object({
      countryCode: z.enum(['USA', 'AUS', 'IDN']),
      placeId: z.string().min(1).optional(),
      values: z.record(z.string(), z.string()),
    })
    .safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    };
  }

  const countryCode = parsed.data.countryCode;
  const metadata = metadataByCountry[countryCode];
  const normalizedValues = normalizeValues(parsed.data.values);
  const details: Array<{ field: string; message: string }> = [];

  for (const field of metadata.fields) {
    const value = normalizedValues[field.key] ?? '';

    if (field.required && value.length === 0) {
      details.push({ field: field.key, message: `${field.title} is required` });
      continue;
    }

    if (value.length === 0) {
      continue;
    }

    if (field.type === 'select' && field.options && !field.options.some((option) => option.value === value)) {
      details.push({ field: field.key, message: `${field.title} has an invalid option` });
      continue;
    }

    if (field.rules) {
      validateFieldRules(field, value, details);
    }
  }

  if (details.length > 0) {
    return { ok: false, details };
  }

  return {
    ok: true,
    data: {
      countryCode,
      placeId: parsed.data.placeId,
      values: normalizedValues,
    },
  };
}

function normalizeValues(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
}

function validateFieldRules(
  field: MetadataField,
  value: string,
  details: Array<{ field: string; message: string }>
) {
  const { rules } = field;
  if (!rules) return;

  if (rules.length !== undefined && value.length !== rules.length) {
    details.push({ field: field.key, message: `${field.title} must be exactly ${rules.length} characters` });
  }
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    details.push({ field: field.key, message: `${field.title} must be at least ${rules.minLength} characters` });
  }
  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    details.push({ field: field.key, message: `${field.title} must be at most ${rules.maxLength} characters` });
  }
  if (rules.pattern !== undefined) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      details.push({ field: field.key, message: `${field.title} format is invalid` });
    }
  }
}

function buildDisplay(countryCode: CountryCode, values: Record<string, string>, countryName: string) {
  if (countryCode === 'USA') {
    const statePostal = [values.state, values.postalCode].filter(Boolean).join(' ');
    return joinDisplayParts([values.line1, values.line2, values.city, statePostal, countryName]);
  }

  if (countryCode === 'AUS') {
    const statePostcode = [values.state, values.postcode].filter(Boolean).join(' ');
    return joinDisplayParts([values.line1, values.line2, values.suburb, statePostcode, countryName]);
  }

  if (countryCode === 'IDN') {
    const provincePostal = [values.province, values.postalCode].filter(Boolean).join(' ');
    return joinDisplayParts([
      values.streetAddress,
      values.village,
      values.district,
      values.city,
      provincePostal,
      countryName,
    ]);
  }

  return joinDisplayParts([countryName]);
}

function joinDisplayParts(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');
}

export function resetAddressStore() {
  savedAddresses.length = 0;
  addressSequence = 1;
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
