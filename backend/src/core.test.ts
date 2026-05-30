import { describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import type { AddressRecord, CountryCode, CountryMetadata } from './types/domain.js';
import { countries, countriesHandler, errorHandler, errorRouteHandler, healthHandler, notFoundHandler } from './index.js';

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
  function createMockResponse() {
    const body: { value: unknown } = { value: null };
    const statusCode: { value: number | null } = { value: null };

    const response = {
      status: (code: number) => {
        statusCode.value = code;
        return response;
      },
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
