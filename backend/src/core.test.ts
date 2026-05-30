import { beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import type { AddressRecord, CountryCode, CountryMetadata } from './types/domain.js';
import {
  addressDetailsHandler,
  addressSearchHandler,
  createAddressHandler,
  countries,
  countriesHandler,
  deleteAddressHandler,
  errorHandler,
  errorRouteHandler,
  healthHandler,
  listAddressesHandler,
  metadataByCountry,
  metadataHandler,
  notFoundHandler,
  resetAddressStore,
  savedAddresses,
} from './index.js';

describe('backend domain type contracts', () => {
  it('CountryCode type accepts only supported literals', () => {
    const code: CountryCode = 'USA';
    expect(code).toBe('USA');
  });

  it('CountryMetadata type models select field metadata', () => {
    const metadata: CountryMetadata = {
      countryCode: 'IDN',
      fields: [
        {
          key: 'province',
          title: 'Province',
          description: null,
          type: 'select',
          required: true,
          order: 1,
          prefix: null,
          suffix: null,
          options: [{ label: 'DKI Jakarta', value: 'DKI Jakarta' }],
        },
      ],
    };

    expect(metadata.fields[0]?.key).toBe('province');
  });

  it('AddressRecord type models persisted address row', () => {
    const row: AddressRecord = {
      id: 'addr_1',
      countryCode: 'AUS',
      values: { line1: '1 Collins St' },
      display: '1 Collins St, Australia',
      createdAt: new Date().toISOString(),
    };

    expect(row.countryCode).toBe('AUS');
  });
});

describe('API bootstrap handlers', () => {
  beforeEach(() => {
    resetAddressStore();
  });

  function createMockResponse() {
    const body: { value: unknown } = { value: null };
    const statusCode: { value: number | null } = { value: null };

    const response = {
      status: (code: number) => {
        statusCode.value = code;
        return response;
      },
      send: () => response,
      json: (payload: unknown) => {
        body.value = payload;
        return response;
      },
    };

    return {
      res: response as unknown as Response,
      statusCode,
      body,
    };
  }

  it('GET /api/health handler returns 200 with status payload', () => {
    const { res, statusCode, body } = createMockResponse();
    healthHandler({} as Request, res);

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual({ status: 'ok' });
  });

  it('GET /api/countries handler returns expected country options in stable order', () => {
    const { res, statusCode, body } = createMockResponse();
    countriesHandler({} as Request, res);

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual([
      { code: 'USA', name: 'United States' },
      { code: 'AUS', name: 'Australia' },
      { code: 'IDN', name: 'Indonesia' },
    ]);
  });

  it('countries constant exposes the same 3 supported countries', () => {
    expect(countries).toEqual([
      { code: 'USA', name: 'United States' },
      { code: 'AUS', name: 'Australia' },
      { code: 'IDN', name: 'Indonesia' },
    ]);
  });

  it('GET /api/metadata/:countryCode handler returns metadata for a supported country', () => {
    const { res, statusCode, body } = createMockResponse();
    metadataHandler({ params: { countryCode: 'USA' } } as unknown as Request, res);

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual(metadataByCountry.USA);
  });

  it('GET /api/metadata/:countryCode handler preserves IDN province and village semantics', () => {
    const { res, statusCode, body } = createMockResponse();
    metadataHandler({ params: { countryCode: 'IDN' } } as unknown as Request, res);

    expect(statusCode.value).toBe(200);

    const payload = body.value as CountryMetadata;
    const province = payload.fields.find((field) => field.key === 'province');
    const village = payload.fields.find((field) => field.key === 'village');

    expect(province?.type).toBe('select');
    expect((province?.options?.length ?? 0) > 0).toBe(true);
    expect(village?.required).toBe(false);
  });

  it('GET /api/metadata/:countryCode handler returns 404 for unsupported country', () => {
    const { res, statusCode, body } = createMockResponse();
    metadataHandler({ params: { countryCode: 'SGP' } } as unknown as Request, res);

    expect(statusCode.value).toBe(404);
    expect(body.value).toEqual({
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  it('GET /api/address-search returns country-filtered suggestions', () => {
    const { res, statusCode, body } = createMockResponse();
    addressSearchHandler(
      { query: { query: 'cupertino', countryCode: 'USA' } } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual({
      suggestions: [{ placeId: 'usa_2', label: '1 Apple Park Way, Cupertino, CA, USA' }],
    });
  });

  it('GET /api/address-search returns 400 for invalid search params', () => {
    const { res, statusCode, body } = createMockResponse();
    addressSearchHandler(
      { query: { query: '', countryCode: 'SGP' } } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Search query is invalid',
    });
  });

  it('GET /api/address-details returns mapped values for valid place id and country', () => {
    const { res, statusCode, body } = createMockResponse();
    addressDetailsHandler(
      { query: { placeId: 'usa_2', countryCode: 'USA' } } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual({
      values: {
        line1: '1 Apple Park Way',
        line2: '',
        city: 'Cupertino',
        state: 'CA',
        postalCode: '95014',
      },
    });
  });

  it('GET /api/address-details returns 400 for invalid params', () => {
    const { res, statusCode, body } = createMockResponse();
    addressDetailsHandler(
      { query: { placeId: '', countryCode: 'SGP' } } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Address details query is invalid',
    });
  });

  it('POST /api/addresses returns 201 with normalized values and display for valid payload', () => {
    const { res, statusCode, body } = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          placeId: 'place_usa_1',
          values: {
            line1: ' 123 Main St ',
            line2: ' ',
            city: ' San Francisco ',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(201);
    expect(body.value).toMatchObject({
      id: 'addr_1',
      countryCode: 'USA',
      placeId: 'place_usa_1',
      values: {
        line1: '123 Main St',
        line2: '',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
      },
      display: '123 Main St, San Francisco, CA 94105, United States',
    });
    expect(savedAddresses).toHaveLength(1);
  });

  it('POST /api/addresses returns 400 when a required field is missing', () => {
    const { res, statusCode, body } = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: '',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Address payload is invalid',
    });
  });

  it('POST /api/addresses returns 400 when postal code length is invalid', () => {
    const { res, statusCode, body } = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '9410',
          },
        },
      } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('POST /api/addresses returns 400 when select option is invalid', () => {
    const { res, statusCode, body } = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'TX',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('POST /api/addresses returns 400 when country is unsupported', () => {
    const { res, statusCode, body } = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'SGP',
          values: {
            line1: '123 Main St',
          },
        },
      } as unknown as Request,
      res
    );

    expect(statusCode.value).toBe(400);
    expect(body.value).toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('GET /api/addresses returns empty array when no addresses are saved', () => {
    const { res, statusCode, body } = createMockResponse();
    listAddressesHandler({} as Request, res);

    expect(statusCode.value).toBe(200);
    expect(body.value).toEqual([]);
  });

  it('GET /api/addresses returns saved rows after create', () => {
    const createResponse = createMockResponse();
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          placeId: 'place_usa_1',
          values: {
            line1: '123 Main St',
            line2: '',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      createResponse.res
    );

    const listResponse = createMockResponse();
    listAddressesHandler({} as Request, listResponse.res);

    expect(listResponse.statusCode.value).toBe(200);
    expect(listResponse.body.value).toHaveLength(1);
    expect(listResponse.body.value).toEqual([
      expect.objectContaining({
        id: 'addr_1',
        countryCode: 'USA',
        display: '123 Main St, San Francisco, CA 94105, United States',
      }),
    ]);
  });

  it('GET /api/addresses preserves insertion order', () => {
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );

    createAddressHandler(
      {
        body: {
          countryCode: 'AUS',
          values: {
            line1: '1 Collins St',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );

    const listResponse = createMockResponse();
    listAddressesHandler({} as Request, listResponse.res);

    expect(listResponse.statusCode.value).toBe(200);
    expect(listResponse.body.value).toEqual([
      expect.objectContaining({ id: 'addr_1', countryCode: 'USA' }),
      expect.objectContaining({ id: 'addr_2', countryCode: 'AUS' }),
    ]);
  });

  it('DELETE /api/addresses/:id removes existing address and returns 204', () => {
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );

    const { res, statusCode } = createMockResponse();
    deleteAddressHandler({ params: { id: 'addr_1' } } as unknown as Request, res);

    expect(statusCode.value).toBe(204);
    expect(savedAddresses).toHaveLength(0);
  });

  it('DELETE /api/addresses/:id returns 404 when id is unknown', () => {
    const { res, statusCode, body } = createMockResponse();
    deleteAddressHandler({ params: { id: 'addr_999' } } as unknown as Request, res);

    expect(statusCode.value).toBe(404);
    expect(body.value).toEqual({
      code: 'ADDRESS_NOT_FOUND',
      message: "Address 'addr_999' was not found",
    });
  });

  it('GET /api/addresses keeps remaining rows after deletion in stable order', () => {
    createAddressHandler(
      {
        body: {
          countryCode: 'USA',
          values: {
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94105',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );
    createAddressHandler(
      {
        body: {
          countryCode: 'AUS',
          values: {
            line1: '1 Collins St',
            suburb: 'Melbourne',
            state: 'VIC',
            postcode: '3000',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );
    createAddressHandler(
      {
        body: {
          countryCode: 'IDN',
          values: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Kebayoran Baru',
            village: 'Gandaria Utara',
            postalCode: '12140',
            streetAddress: 'Jl. KH. Ahmad Dahlan No. 10',
          },
        },
      } as unknown as Request,
      createMockResponse().res
    );

    deleteAddressHandler({ params: { id: 'addr_2' } } as unknown as Request, createMockResponse().res);

    const listResponse = createMockResponse();
    listAddressesHandler({} as Request, listResponse.res);

    expect(listResponse.statusCode.value).toBe(200);
    expect(listResponse.body.value).toEqual([
      expect.objectContaining({ id: 'addr_1', countryCode: 'USA' }),
      expect.objectContaining({ id: 'addr_3', countryCode: 'IDN' }),
    ]);
  });

  it('unknown /api route handler returns 404 NOT_FOUND payload', () => {
    const { res, statusCode, body } = createMockResponse();
    notFoundHandler({} as Request, res);

    expect(statusCode.value).toBe(404);
    expect(body.value).toEqual({
      code: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  it('forced error route handler throws for error-path coverage', () => {
    expect(() => errorRouteHandler()).toThrowError('forced test error');
  });

  it('global error handler returns 500 INTERNAL_SERVER_ERROR payload', () => {
    const { res, statusCode, body } = createMockResponse();
    errorHandler(new Error('x'), {} as Request, res, () => {});

    expect(statusCode.value).toBe(500);
    expect(body.value).toEqual({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    });
  });
});
