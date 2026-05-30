import { describe, expect, it } from 'vitest';
import type { AddressRecord, CountryCode, CountryMetadata } from './types/domain.js';

describe('epic-a types baseline', () => {
  it('accepts supported country code values', () => {
    const code: CountryCode = 'USA';
    expect(code).toBe('USA');
  });

  it('models metadata shape', () => {
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

  it('models saved address shape', () => {
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
