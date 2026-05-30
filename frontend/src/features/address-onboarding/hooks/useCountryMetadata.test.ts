import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountryMetadata } from './useCountryMetadata';
import type { CountryCode, CountryMetadataResponse, CountryOption } from '@features/address-onboarding/types';

const useGetCountriesQueryMock = vi.fn();
const useGetMetadataQueryMock = vi.fn();

vi.mock('@shared/api/addressApi', () => ({
  useGetCountriesQuery: () => useGetCountriesQueryMock(),
  useGetMetadataQuery: (countryCode: CountryCode, options: { skip: boolean }) =>
    useGetMetadataQueryMock(countryCode, options),
}));

const countries: CountryOption[] = [{ code: 'USA', name: 'United States' }];
const metadata: CountryMetadataResponse = {
  countryCode: 'USA',
  fields: [
    {
      key: 'postalCode',
      title: 'Postal Code',
      description: null,
      type: 'text',
      required: true,
      order: 2,
      prefix: null,
      suffix: null,
      rules: { length: 5 },
    },
    {
      key: 'line1',
      title: 'Address Line 1',
      description: null,
      type: 'text',
      required: true,
      order: 1,
      prefix: null,
      suffix: null,
    },
  ],
};

describe('useCountryMetadata', () => {
  beforeEach(() => {
    useGetCountriesQueryMock.mockReset();
    useGetMetadataQueryMock.mockReset();

    useGetCountriesQueryMock.mockReturnValue({
      data: countries,
      isLoading: false,
      isError: false,
    });
    useGetMetadataQueryMock.mockImplementation((countryCode: CountryCode, options: { skip: boolean }) => {
      if (options.skip || countryCode !== 'USA') {
        return { data: undefined, isLoading: false, isError: false };
      }
      return { data: metadata, isLoading: false, isError: false };
    });
  });

  it('updates selected country and returns metadata fields sorted by order', () => {
    const { result } = renderHook(() => useCountryMetadata());

    expect(result.current.selectedCountry).toBeNull();
    expect(result.current.selectData).toEqual([{ value: 'USA', label: 'United States' }]);
    expect(result.current.sortedFields).toEqual([]);

    act(() => {
      result.current.onCountryChange('USA');
    });

    expect(result.current.selectedCountry).toBe('USA');
    expect(result.current.sortedFields.map((field) => field.key)).toEqual(['line1', 'postalCode']);
  });
});
